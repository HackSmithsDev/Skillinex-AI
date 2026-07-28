from enum import Enum
from typing import List
from pydantic import BaseModel, Field

class PistonLanguageEnum(str, Enum):
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    CPP = "cpp"
    KOTLIN = "kotlin"
    JAVA = "java"
    GO = "go"
    CSHARP = "csharp"
    PHP = "php"
    SWIFT = "swift"
    POSTGRES = "postgres"
    SQLITE3 = "sqlite3"
    C = "c"

class ExtractedLanguageResponse(BaseModel):
    piston_lang: PistonLanguageEnum

class BatchLanguageResponse(BaseModel):
    """Schema for batch AI language extraction."""
    results: List[PistonLanguageEnum] = Field(..., description="Ordered list of mapped runtime keys.")