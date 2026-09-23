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

COURSE_COMPILER_OPTIONS = [
    {"id": "python", "label": "Python 3", "course": "Python / Data Science / AI"},
    {"id": "javascript", "label": "JavaScript / Node.js", "course": "Frontend / Web / Full Stack"},
    {"id": "java", "label": "Java", "course": "Backend / DSA / Enterprise"},
    {"id": "cpp", "label": "C++", "course": "Competitive Programming / Systems"},
    {"id": "csharp", "label": "C#", "course": ".NET / Unity / Backend"},
    {"id": "go", "label": "Go", "course": "Cloud / APIs / DevOps"},
    {"id": "kotlin", "label": "Kotlin", "course": "Android / JVM"},
    {"id": "php", "label": "PHP", "course": "Legacy Web / Backend"},
    {"id": "swift", "label": "Swift", "course": "iOS / Apple"},
    {"id": "sql", "label": "SQL", "course": "Databases"},
]

LANGUAGE_KEYWORDS = {
    "python": ["python", "py", "data science", "ai", "ml", "machine learning", "automation", "backend"],
    "javascript": ["javascript", "node", "web", "frontend", "react", "full stack", "ui"],
    "java": ["java", "spring", "backend", "enterprise", "oop"],
    "cpp": ["cpp", "c++", "competitive programming", "system", "dsa", "algorithm"],
    "csharp": ["c#", ".net", "dotnet", "unity"],
    "go": ["go", "golang", "cloud", "microservice", "api"],
    "kotlin": ["kotlin", "android", "jvm"],
    "php": ["php", "laravel", "web backend"],
    "swift": ["swift", "ios", "apple"],
    "sql": ["sql", "database", "postgres", "mysql"],
}


def normalize_language_context(raw_context: str | None) -> str:
    """Resolve a course or topic to the best runtime language for code execution."""
    if not raw_context:
        return "python"

    context = raw_context.lower()
    for lang, keywords in LANGUAGE_KEYWORDS.items():
        if any(keyword in context for keyword in keywords):
            return lang
    return "python"


# Wandbox compiler identifiers (public API, no auth required) used by the practice lab.
WANDBOX_COMPILERS = {
    "python": "cpython-3.12.7",
    "javascript": "nodejs-20.17.0",
    "java": "openjdk-jdk-21+35",
    "cpp": "gcc-13.2.0",
    "c": "gcc-13.2.0",
    "csharp": "dotnetcore-8.0.402",
    "go": "go-1.23.2",
    "kotlin": "openjdk-jdk-21+35",  # Wandbox has no Kotlin runtime; falls back to JVM
    "php": "php-8.3.12",
    "swift": "swift-6.0.1",
}


class ExtractedLanguageResponse(BaseModel):
    piston_lang: PistonLanguageEnum

class BatchLanguageResponse(BaseModel):
    """Schema for batch AI language extraction."""
    results: List[PistonLanguageEnum] = Field(..., description="Ordered list of mapped runtime keys.")