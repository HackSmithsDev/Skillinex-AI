import asyncio
import os
import sys
from logging.config import fileConfig
from pathlib import Path

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine

from alembic import context

# ----------------------------------------------------------------------
# 1. Add project root to sys.path so app imports work
# ----------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# ----------------------------------------------------------------------
# 2. Config & Logging
# ----------------------------------------------------------------------
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ----------------------------------------------------------------------
# 3. Dynamic Database URL & Metadata Setup
# ----------------------------------------------------------------------
# Reuse the app's own Settings so this reads .env / Neon-vs-local URLs the
# same way the running app does — os.getenv() alone never loaded .env here,
# so migrations were silently running against the hardcoded local fallback.
from app.core.config import settings  # noqa: E402

config.set_main_option("sqlalchemy.url", settings.ASYNC_DATABASE_URL)

# TODO: Update this import path to point to your Base/models
# Example: from app.db.base import Base
# Make sure all model classes (User, etc.) are imported so metadata registers them.
from app.db.base import Base  # noqa: E402

target_metadata = Base.metadata

# ----------------------------------------------------------------------
# 4. Migration Runners
# ----------------------------------------------------------------------
def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations in 'online' mode with an async engine."""
    connect_args = {}
    if settings.DATABASE_REQUIRES_SSL:
        connect_args["ssl"] = "require"
    if settings.DATABASE_IS_POOLED:
        connect_args["statement_cache_size"] = 0

    connectable = create_async_engine(
        settings.ASYNC_DATABASE_URL,
        poolclass=pool.NullPool,
        connect_args=connect_args,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()