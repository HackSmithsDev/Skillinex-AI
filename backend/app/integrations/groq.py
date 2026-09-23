from groq import AsyncGroq
from pydantic import BaseModel
from app.core.config import settings

class GroqService:
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None
        self.model = settings.GROQ_MODEL

    def _ensure_client(self):
        if self.client is None:
            raise RuntimeError("GROQ_API_KEY is not configured. Add your key to the backend .env file.")
        return self.client

    async def get_chat_response(self, messages: list):
        client = self._ensure_client()
        completion = await client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )
        content = completion.choices[0].message.content
        return content or ""

    async def get_structured_response(self, prompt: str, response_model: type[BaseModel]):
        client = self._ensure_client()
        refined_prompt = f"{prompt}\n\nReturn the output in strictly valid JSON format."
        completion = await client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": f"You are a technical educator. You must output JSON that follows this schema: {response_model.model_json_schema()}",
                },
                {"role": "user", "content": refined_prompt},
            ],
            temperature=0.2,
            response_format={"type": "json_object"},
        )
        raw_content = completion.choices[0].message.content
        if not raw_content:
            raise ValueError(f"Groq returned empty content for {response_model.__name__}.")
        try:
            return response_model.model_validate_json(raw_content)
        except Exception as exc:
            raise ValueError(f"Groq returned invalid JSON for {response_model.__name__}: {exc}") from exc

groq_client = GroqService()