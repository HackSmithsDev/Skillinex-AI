import json
from uuid import uuid4

from app.core.storage import ROADMAPS_DIR

def cache_generated_roadmap(data: dict, course_id: str) -> str:
    """Writes the raw dict to a local JSON file to guarantee structural persistence."""
    filename = f"course_{course_id}_{uuid4().hex[:6]}.json"
    ROADMAPS_DIR.mkdir(parents=True, exist_ok=True)
    filepath = ROADMAPS_DIR / filename
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    return str(filepath)