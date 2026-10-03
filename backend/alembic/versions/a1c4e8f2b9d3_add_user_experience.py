"""Add user experience column

Revision ID: a1c4e8f2b9d3
Revises: 697356f94dff
Create Date: 2026-10-03 16:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'a1c4e8f2b9d3'
down_revision: Union[str, Sequence[str], None] = '697356f94dff'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('experience', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'experience')
