import json
from google import genai
from pydantic import BaseModel
from app.core.config import settings
from app.integrations.shared import BatchLanguageResponse, PistonLanguageEnum

class GeminiService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = "gemini-2.0-flash"

    async def get_structured_response(self, prompt: str, response_model: type[BaseModel]):
        try:
            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config={
                    'response_mime_type': 'application/json',
                    'response_schema': response_model, 
                }
            )
            return response_model.model_validate_json(response.text)
        except Exception as e:
            print(f"🛑 Gemini validation failed for {response_model.__name__}: {e}")
            return None

    async def get_chat_response(self, messages: list):
        contents = [{"role": "user" if msg["role"] == "user" else "model", "parts": [{"text": msg["content"]}]} for msg in messages]
        response = await self.client.aio.models.generate_content(
            model=self.model_name,
            contents=contents
        )
        return response.text

    async def extract_batch_languages(self, items: list) -> list:
        if not items: return []
        prompt = f"Map these items to Piston runtime keys: {items}. Return list in same order."
        result = await self.get_structured_response(prompt, BatchLanguageResponse)
        return [lang.value for lang in result.results] if result else [PistonLanguageEnum.PYTHON.value] * len(items)

gemini_client = GeminiService()