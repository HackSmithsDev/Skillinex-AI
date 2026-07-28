import json
from groq import AsyncGroq
from pydantic import BaseModel
from app.core.config import settings
from app.integrations.shared import BatchLanguageResponse, PistonLanguageEnum

class GroqService:
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = "llama-3.3-70b-versatile"

    async def get_chat_response(self, messages: list):
        completion = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.7,
            max_tokens=1024
        )
        return completion.choices[0].message.content

    async def get_structured_response(self, prompt: str, response_model: type[BaseModel]):
        refined_prompt = f"{prompt}\n\nReturn the output in strictly valid JSON format."
        completion = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system", 
                    "content": f"You are a technical educator. You must output JSON that follows this schema: {response_model.model_json_schema()}"
                },
                {"role": "user", "content": refined_prompt}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        return response_model.model_validate_json(completion.choices[0].message.content)

    async def extract_batch_languages(self, items: list) -> list:
        if not items: return []
        prompt = f"Map these items to Piston runtime keys: {items}. Return list in same order."
        result = await self.get_structured_response(prompt, BatchLanguageResponse)
        return [lang.value for lang in result.results] if result else [PistonLanguageEnum.PYTHON.value] * len(items)

groq_client = GroqService()