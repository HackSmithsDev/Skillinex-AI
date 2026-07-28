import json
import os
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.db.session import get_db
from app.core.security import get_current_user
from app.db.models import User, TestResult

router = APIRouter()

# Load badge definitions from assets
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BADGE_PATH = os.path.join(BASE_DIR, "assets", "badges.json")

def load_badge_definitions() -> Dict[str, Any]:
    with open(BADGE_PATH, "r") as f:
        return json.load(f)

@router.get("/")
async def get_my_achievements(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Syncs user stats with the badges.json registry and calculates progress matrix.
    """
    # 1. Gather User Stats from Postgres
    skill_query = await db.execute(
        select(
            TestResult.node_name,
            func.max(TestResult.score).label("max_score"),
            func.count(TestResult.id).label("attempts")
        )
        .where(TestResult.user_id == current_user.id)
        .group_by(TestResult.node_name)
    )
    skills_raw = skill_query.all()
    
    total_tests = sum(s.attempts for s in skills_raw)
    unique_nodes_count = len(skills_raw)
    
    # 2. Format Skills for the UI Matrix
    skills_matrix = [
        {
            "name": s.node_name,
            "level": int(s.max_score / 10),
            "xp": s.max_score,
            "attempts": s.attempts
        } for s in skills_raw
    ]

    # 3. Process Badges via JSON Registry
    badge_registry = load_badge_definitions()
    processed_badges = []

    for category in badge_registry.get("categories", []):
        for b in category.get("badges", []):
            req = b["requirement"]
            req_type = req["type"]
            req_val = req["value"]
            
            earned = False

            # Logic Mapper for JSON requirement types
            if req_type == "total_xp":
                earned = (current_user.xp_points or 0) >= req_val
            elif req_type == "test_count":
                earned = total_tests >= req_val
            elif req_type == "unique_nodes":
                earned = unique_nodes_count >= req_val
            elif req_type == "high_score":
                # Find if any node matching the target has reached the value
                target_node = req.get("target")
                match = next((s for s in skills_raw if s.node_name == target_node), None)
                earned = match.max_score >= req_val if match else False
            elif req_type == "streak":
                # Placeholder logic: Streaks will eventually need a dedicated table
                earned = False 

            processed_badges.append({
                "slug": b["slug"],
                "title": b["title"],
                "desc": b["desc"],
                "icon": b["icon"],
                "category": category["label"],
                "earned": earned
            })

    # 4. Determine Dynamic Rank
    # We can keep this in Python for easy tweaking
    rank = "Novice Developer"
    xp = current_user.xp_points or 0
    if xp > 10000: rank = "Grandmaster Architect"
    elif xp > 5000: rank = "Senior Specialist"
    elif xp > 2000: rank = "Active Researcher"
    elif xp > 500: rank = "Technician"

    return {
        "total_xp": xp,
        "rank": rank,
        "skills": skills_matrix,
        "badges": processed_badges,
        "streak": "7_DAYS", # Static fallback for now
        "system_status": "Operational"
    }