import os
import json
import uuid
import random
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from anyio.to_thread import run_sync

from app.core import security
from app.db.session import get_db
from app.db.models import User, Course
from app.utils.redis import set_otp, get_otp, delete_otp
from app.integrations.groq import groq_client
from app.schemas.user import InterestSuggestRequest, InterestSuggestionList, LoginRequest, UserOut, Token, PasswordResetRequest, PasswordResetConfirm
from app.workers.tasks.roadmap import generate_full_curriculum
from app.workers.tasks.email import (
    send_welcome_email, 
    send_otp_email, 
    send_login_alert, 
    send_reset_success_email
)

router = APIRouter()

# Isolate path calculations cleanly to resolve your project root data shared volume directories
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(CURRENT_DIR))))
UPLOAD_DIR = os.path.join(PROJECT_ROOT, "data", "profile_pics")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}


# --- 1. PRE-SIGNUP INTEGRITY VERIFICATION ---
@router.get("/check-email", response_model=dict)
async def check_email(email: str, db: AsyncSession = Depends(get_db)):
    """
    Check if an email is already registered.
    Used for pre-signup validation before completing authentication steps.
    """
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    if user:
        return {
            "exists": True, 
            "message": "Neural link already exists. Please login."
        }
    
    return {
        "exists": False, 
        "message": "Email available."
    }


# --- 1b. AI INTEREST SUGGESTIONS (unauthenticated, used in signup step 3) ---
FALLBACK_INTERESTS = [
    {"name": n, "level": "Beginner", "reason": ""}
    for n in ["Python", "JavaScript", "React", "Data Science", "AI/ML", "UI/UX", "FastAPI", "Django"]
]


@router.post("/suggest-interests", response_model=InterestSuggestionList)
async def suggest_interests(data: InterestSuggestRequest):
    """Suggests learning interests (with a starting level) from the user's background.
    Falls back to a static list if the AI provider is unavailable."""
    prompt = (
        "You are a career-aware learning advisor. Based on the user's background below, suggest 8 "
        "specific technology or skill topics they should learn, each with a starting level "
        "(exactly one of Beginner, Intermediate, Pro) matching their experience, and a reason under 20 words.\n"
        'Respond as JSON: {"interests":[{"name":"","level":"","reason":""}]}\n\n'
        f"Age: {data.age or 'unknown'}\nBackground: {data.experience.strip()}"
    )
    try:
        result = await groq_client.get_structured_response(prompt, InterestSuggestionList)
        items = [i for i in result.interests if i.level in {"Beginner", "Intermediate", "Pro"}][:10]
        if items:
            return InterestSuggestionList(interests=items)
    except Exception:
        pass
    return InterestSuggestionList(interests=FALLBACK_INTERESTS)


# --- 2. MULTIPART ONBOARDING SIGNUP LAYER ---
@router.post("/signup", response_model=UserOut)
async def signup(
    full_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    age: int = Form(...),
    gender: str = Form(...),
    bio: str = Form(""),
    experience: str = Form(""),
    tech_stack: str = Form("{}"),  # Deserialized from stringified JSON block sent via client state
    file: UploadFile = File(None), # Optional user avatar image payload attachment
    db: AsyncSession = Depends(get_db)
):
    """
    Register a brand new user profile matrix using multipart form parameters.
    Processes account details, deserializes the tech stack graph, handles initial
    avatar file uploads to root-level disk streams, and queues roadmap generations.
    """
    # 1. Identity Uniqueness Verification Check
    result = await db.execute(select(User).where(User.email == email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Neural link already exists.")

    # 2. Manual Password Integrity Assertion Block
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    # 3. Parse and extract stringified JSON data parameters cleanly
    try:
        parsed_tech_stack = json.loads(tech_stack)
    except Exception:
        parsed_tech_stack = {}

    # 4. Process Multi-Part Avatar File Upload Streams if Present
    photo_url_path = None
    if file:
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="UNSUPPORTED_FORMAT: Only JPG, JPEG, and PNG extensions are allowed."
            )
        
        # Ensure targeted shared volume folders exist
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Generate pristine tracking IDs to decouple assets from system directory namespace conflicts
        generated_uuid = uuid.uuid4().hex
        unique_filename = f"signup_{generated_uuid}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        try:
            contents = await file.read()
            def write_file():
                with open(file_path, "wb") as buffer:
                    buffer.write(contents)
            await run_sync(write_file)
            
            # Map structural routing references using your application's static mount rules
            photo_url_path = f"/uploads/profile_pics/{unique_filename}"
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="DISK_WRITE_IO_FAULT: Onboarding multipart stream write failure."
            )

    # 5. Create the user
    new_user = User(
        email=email,
        full_name=full_name,
        hashed_password=security.get_password_hash(password),
        bio=bio,
        photo_url=photo_url_path,
        age=age,
        gender=gender,
        experience=experience.strip() or None,
        tech_stack=parsed_tech_stack,
        xp_points=100,
        enrolled_courses=[]
    )
    db.add(new_user)
    await db.flush()

    # 6. AI-suggested courses: one roadmap per chosen interest (max 3)
    level_map = {"Beginner": "Beginner", "Intermediate": "Intermediate", "Pro": "Advanced"}
    interests = [(str(k).strip(), v) for k, v in parsed_tech_stack.items() if str(k).strip()][:3]
    if not interests:
        interests = [("Full Stack Development", "Beginner")]

    new_courses = []
    for topic, lvl in interests:
        level = level_map.get(lvl, "Beginner")
        target_title = f"Mastering {topic} [{level}]"
        course_query = await db.execute(
            select(Course)
            .where(Course.title == target_title)
            .options(selectinload(Course.enrolled_users))
        )
        course = course_query.scalars().first()
        if course:
            course.enrolled_users.append(new_user)
        else:
            course = Course(
                title=target_title,
                description=f"A personalized {level} roadmap for {topic}.",
                category=topic,
                difficulty=level,
                enrolled_users=[new_user]
            )
            db.add(course)
            await db.flush()
            new_courses.append((course.id, topic, level))

    await db.commit()
    await db.refresh(new_user)

    for course_id, topic, level in new_courses:
        try:
            generate_full_curriculum.delay(course_id=course_id, topic=topic, difficulty=level)
        except Exception:
            pass

    # Broadcast welcome transaction events 
    send_welcome_email.delay(new_user.email, new_user.full_name)
    
    return new_user


# --- 3. SECURE AUTHENTICATION LOGIN ACCESS ---
@router.post("/token", response_model=Token)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate user credentials, trigger alert tasks, 
    and output secure access signature keys.
    """
    # 1. Look up user by email context
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalars().first()
    
    # 2. Verify identity existence and hashed password matrix
    if not user or not security.verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Incorrect email or password"
        )
    
    # 3. Trigger Background Login Alert via Celery worker pools
    send_login_alert.delay(user.email, user.full_name)
    
    # 4. Generate and return asymmetric JWT signing block
    return {
        "access_token": security.create_access_token(user.id),
        "token_type": "bearer"
    }


# --- 4. CREDENTIAL FORGOT PASSWORD INITIATION ---
@router.post("/forgot-password")
async def forgot_password(data: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    """
    Generate unique verification OTP blocks, cache inside transient Redis state layers,
    and deploy outbound dispatch worker notification transmissions.
    """
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalars().first()
    
    if not user:
        # Prevent user enumeration security vectors
        return {"msg": "If the email is registered, a code has been sent."}
    
    otp_code = f"{random.randint(100000, 999999)}"
    
    # --- REDIS MEMORY PERSISTENCE STRATEGY ---
    await set_otp(user.email, otp_code) 
    
    # Background Email Task Execution
    send_otp_email.delay(user.email, user.full_name, otp_code)
    
    return {"msg": "Password reset code sent to email"}


# --- 5. PASSWORD ENTROPY RESET MATRIX CONFIRMATION ---
@router.post("/reset-password")
async def reset_password(data: PasswordResetConfirm, db: AsyncSession = Depends(get_db)):
    """
    Verify temporal cache tokens from Redis layers, safely alter target structural 
    password cryptography string blocks, and execute key purge sweeps.
    """
    # 1. Check Redis cache layers for the corresponding tracking value
    cached_otp = await get_otp(data.email)
    
    if not cached_otp or cached_otp != data.code:
        raise HTTPException(status_code=400, detail="Invalid or expired reset code")
    
    # 2. Extract specific model context rows
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 3. Commit fresh password hash structures & clean up Redis memory segments
    user.hashed_password = security.get_password_hash(data.new_password)
    await db.commit()
    await delete_otp(data.email)
    
    # Broadcast signature lifecycle event confirmation
    send_reset_success_email.delay(user.email, user.full_name)
    
    return {"msg": "Password updated successfully"}