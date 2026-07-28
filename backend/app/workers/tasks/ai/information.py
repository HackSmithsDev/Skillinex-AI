import asyncio
from app.workers.celery_app import celery_app
from app.integrations.gemini import gemini_client
from pydantic import BaseModel, Field

class DeepDiveSchema(BaseModel):
    analogy: str = Field(description="A simple real-world analogy")
    technical_depth: str = Field(description="A 300-word deep dive into the underlying mechanics")
    key_takeaways: list[str] = Field(min_length=3)

@celery_app.task(name="generate_deep_dive")
def generate_deep_dive(topic: str, context: str):
    """
    Triggered when a user asks for more info on a specific lecture topic.
    Uses Gemini 1.5 Flash for high-quality, structured academic content.
    """
    loop = asyncio.get_event_loop()
    
    prompt = (
        f"Provide a deep dive into '{topic}' within the context of {context}. "
        "Explain it like I'm a first-year Engineering student but keep the rigor high."
    )
    
    # We use Gemini for the 'Heavy Lifting' of content generation
    content = loop.run_until_complete(
        gemini_client.get_structured_response(prompt, DeepDiveSchema)
    )
    
    return {"topic": topic, "data": content}