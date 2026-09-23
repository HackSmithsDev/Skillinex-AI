from google import genai
from pydantic import BaseModel
from app.core.config import settings
from app.integrations.shared import BatchLanguageResponse, normalize_language_context

class GeminiService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY) if settings.GEMINI_API_KEY else None
        self.model_name = settings.GEMINI_MODEL

    def _ensure_client(self):
        if self.client is None:
            raise RuntimeError("GEMINI_API_KEY is not configured. Add your key to the backend .env file.")
        return self.client

    async def get_structured_response(self, prompt: str, response_model: type[BaseModel]):
        client = self._ensure_client()
        try:
            response = await client.aio.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_schema": response_model,
                },
            )
            if not response or not getattr(response, "text", None):
                return None
            return response_model.model_validate_json(response.text)
        except Exception as e:
            print(f"🛑 Gemini validation failed for {response_model.__name__}: {e}")
            return None

    async def get_chat_response(self, messages: list):
        client = self._ensure_client()
        contents = [
            {"role": "user" if msg["role"] == "user" else "model", "parts": [{"text": msg["content"]}]}
            for msg in messages
        ]
        response = await client.aio.models.generate_content(
            model=self.model_name,
            contents=contents,
        )
        return getattr(response, "text", "") or ""

    async def extract_batch_languages(self, items: list) -> list:
        if not items:
            return []
        if not settings.GEMINI_API_KEY:
            return [normalize_language_context(item) for item in items]

        prompt = f"Map these items to Piston runtime keys: {items}. Return list in same order."
        try:
            result = await self.get_structured_response(prompt, BatchLanguageResponse)
        except Exception:
            result = None
        if result and result.results and len(result.results) == len(items):
            return [lang.value for lang in result.results]
        return [normalize_language_context(item) for item in items]

    async def extract_piston_language(self, raw_context: str | None) -> str:
        if not raw_context:
            return "python"

        fallback = normalize_language_context(raw_context)
        if not settings.GEMINI_API_KEY:
            return fallback

        try:
            result = await self.get_structured_response(
                f"Given this course/topic: '{raw_context}'. Return only one Piston runtime key from the allowed set: python, javascript, java, cpp, csharp, go, kotlin, php, swift, sql.",
                BatchLanguageResponse,
            )
            if result and result.results:
                return result.results[0].value
        except Exception:
            pass

        return fallback

gemini_client = GeminiService()