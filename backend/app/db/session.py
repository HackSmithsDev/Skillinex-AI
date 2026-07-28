from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator
from app.core.config import settings

# 1. Create the Async Engine
# settings.ASYNC_DATABASE_URL should use 'postgresql+asyncpg://'
engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    echo=False,  # Set to True if you want to see raw SQL in the terminal
    future=True
)

# 2. Session factory for creating local sessions
AsyncSessionLocal = sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# 3. FastAPI Dependency
# Inject this into routes: db: AsyncSession = Depends(get_db)
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()