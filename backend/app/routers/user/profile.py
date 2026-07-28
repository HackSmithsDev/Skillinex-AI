import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from anyio.to_thread import run_sync

from app.db.session import get_db
from app.db.models.user import User
from app.core.security import get_current_user, get_password_hash, verify_password
from app.schemas.user import UserOut, UserUpdate, PasswordChange, AccountDeleteRequest
from app.workers.tasks.email import send_reset_success_email, send_delete_account_email

router = APIRouter()

# ⚡ RESOLVE PATH TO ROOT-LEVEL data/profile_pics 
# backend/app/routers/user/profile.py -> app/routers/user/ -> app/routers/ -> app/ -> backend/ -> project_root/data/profile_pics
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(CURRENT_DIR))))
UPLOAD_DIR = os.path.join(PROJECT_ROOT, "data", "profile_pics")

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

@router.get("/me", response_model=UserOut)
async def get_profile_data(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=UserOut)
async def update_profile(
    user_in: UserUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update profile using the validated UserUpdate schema.
    Handles nested tech_stack updates for Skillinex interests.
    """
    update_data = user_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "tech_stack":
            current_stack = current_user.tech_stack or {}
            current_stack.update(value)
            setattr(current_user, field, current_stack)
        else:
            setattr(current_user, field, value)
    
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user

# 🆕 --- PROFILE AVATAR MULTIPART STREAM PIPELINE ---
@router.post("/upload-avatar", response_model=UserOut)
async def upload_avatar(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Validates, streams, and saves the initial profile picture to the root data folder.
    """
    # 1. Secure and isolate file signatures
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="UNSUPPORTED_FORMAT: Only JPG, JPEG, and PNG structures are allowed."
        )

    # 2. Build local directories dynamically safely
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # 3. Prevent structural path collisions with randomized UUID wrappers
    unique_filename = f"{current_user.id}_{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        # Stream file payload into memory cache
        contents = await file.read()
        
        # Write contents to local storage array safely inside a thread worker pool
        def write_file():
            with open(file_path, "wb") as buffer:
                buffer.write(contents)
                
        await run_sync(write_file)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="DISK_WRITE_IO_FAULT: Multipart stream conversion error."
        )

    # 4. Commit relative network path references to state engine model layers
    # Your static mount inside app/__init__.py translates "/uploads" into the "data/" root directory.
    current_user.photo_url = f"/uploads/profile_pics/{unique_filename}"
    
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user

# --- 3. CHANGE PASSWORD (AUTHENTICATED) ---
@router.post("/change-password")
async def change_password(
    data: PasswordChange,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Allows user to change password by providing the old one first."""
    if not verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    current_user.hashed_password = get_password_hash(data.new_password)
    db.add(current_user)
    await db.commit()

    send_reset_success_email.delay(current_user.email, current_user.full_name)
    
    return {"msg": "Password updated successfully"}

# --- 4. LOGOUT (CLIENT-SIDE) ---
@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """
    In JWT, logout is mostly handled by the frontend (deleting the token).
    However, you can implement a 'Token Blacklist' in Redis here for extra security.
    """
    return {"msg": "Successfully logged out"}

# --- 5. DELETE ACCOUNT ---
@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    data: AccountDeleteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Permanently deletes the user and triggers a goodbye email."""
    if not verify_password(data.password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Password verification failed")
    
    email = current_user.email
    name = current_user.full_name

    await db.delete(current_user)
    await db.commit()

    send_delete_account_email.delay(email, name)
    
    return None