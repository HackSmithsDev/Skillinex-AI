from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[2]
UPLOADS_DIR = BACKEND_DIR / "uploads"
PROFILE_PICS_DIR = UPLOADS_DIR / "profile_pics"
ROADMAPS_DIR = UPLOADS_DIR / "roadmaps"
