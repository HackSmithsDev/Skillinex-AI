import os
import json
from uuid import uuid4

CACHE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../../data/roadmaps"))
os.makedirs(CACHE_DIR, exist_ok=True)

def cache_generated_roadmap(data: dict, course_id: str) -> str:
    """Writes the raw dict to a local JSON file to guarantee structural persistence."""
    filename = f"course_{course_id}_{uuid4().hex[:6]}.json"
    filepath = os.path.join(CACHE_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    return filepath