"""
Super AI RU — Initial migration.

Создание всех таблиц на основе моделей SQLAlchemy.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

import sqlalchemy as sa
from alembic import op

# revision identifiers
revision: str = "001_initial"
down_revision: str | None = None
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    """
    Создать все таблицы:
    - users
    - organizations
    - organization_members
    - projects
    - conversations
    - messages
    - documents
    - agent_definitions
    - api_keys
    - usage_logs
    - invoices
    """

    # ─── users ─────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.UUID(as_uuid=False), primary_key=True, default=uuid.uuid4),
        sa.Column("email", sa.String(320), unique=True, nullable=False, index=True),
        sa.Column("password_hash", sa.String(256), nullable=False),
        sa.Column("full_name", sa.String(256), nullable=True),
        sa.Column(
            "role",
            sa.String(32),
            nullable=False,
            server_default="developer",
        ),
        sa.Column("metadata", sa.JSON(), nullable=True, server_default=sa.text("'{}'::jsonb")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # ─── organizations ──────────────────────────────────────────────────────
    op.create_table(
        "organizations",
        sa.Column("id", sa.UUID(as_uuid=False), primary_key=True, default=uuid.uuid4),
        sa.Column("name", sa.String(256), nullable=False),
        sa.Column("slug", sa.String(128), unique=True, nullable=False, index=True),
        sa.Column(
            "owner_id",
            sa.UUID(as_uuid=False),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "tier",
            sa.String(32),
            nullable=False,
            server_default="free",
        ),
        sa.Column("settings", sa.JSON(), nullable=True, server_default=sa.text("'{}'::jsonb")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # ─── organization_members ───────────────────────────────────────────────
    op.create_table(
        "organization_members",
        sa.Column("id", sa.UUID(as_uuid=False), primary_key=True, default=uuid.uuid4),
        sa.Column(
            "org_id",
            sa.UUID(as_uuid=False),
            sa.ForeignKey("organizations.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.UUID(as_uuid=False),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "role",
            sa.String(32),
            nullable=False,
            server_default="member",
        ),
        sa.Column(
            "joined_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # ─── projects ───────────────────────────────────────────────────────────
    op.create_table(
        "projects",
        sa.Column("id", sa.UUID(as_uuid=False), primary_key=True, default=uuid.uuid4),
        sa.Column(
            "org_id",
            sa.UUID(as_uuid=False),
            sa.ForeignKey("organizations.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(256), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("config", sa.JSON(), nullable=True, server_default=sa.text("'{}'::jsonb")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # ─── conversations ──────────────────────────────────────────────────────
    op.create_table(
        "conversations",
        sa.Column("id", sa.UUID(as_uuid=False), primary_key=True, default=uuid.uuid4),
        sa.Column(
            "user_id",
            sa.UUID(as_uuid=False),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "project_id",
            sa.UUID(as_uuid=False),
            sa.ForeignKey("projects.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("title", sa.String(512), nullable=True),
        sa.Column("model", sa.String(128), nullable=True),
        sa.Column("metadata", sa.JSON(), nullable=True, server_default=sa.text("'{}'::jsonb")),
        sa.Column("message_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # ─── messages ───────────────────────────────────────────────────────────
    op.create_table(
        "messages",
        sa.Column("id", sa.UUID(as_uuid=False), primary_key=True, default=uuid.uuid4),
        sa.Column(
            "conversation_id",
            sa.UUID(as_uuid=False),
            sa.ForeignKey("conversations.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("role", sa.String(32), nullable=False),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column("tool_calls", sa.JSON(), nullable=True),
        sa.Column("artifacts", sa.JSON(), nullable=True),
        sa.Column("tokens_in", sa.Integer(), nullable=True),
        sa.Column("tokens_out", sa.Integer(), nullable=True),
        sa.Column("latency_ms", sa.Float(), nullable=True),
        sa.Column(
            "parent_message_id",
            sa.UUID(as_uuid=False),
            sa.ForeignKey("messages.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # ─── documents ──────────────────────────────────────────────────────────
    op.create_table(
        "documents",
        sa.Column("id", sa.UUID(as_uuid=False), primary_key=True, default=uuid.uuid4),
        sa.Column(
            "project_id",
            sa.UUID(as_uuid=False),
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("filename", sa.String(512), nullable=False),
        sa.Column("s3_key", sa.String(1024), nullable=True),
        sa.Column("content_type", sa.String(256), nullable=True),
        sa.Column("size_bytes", sa.BigInteger(), nullable=True),
        sa.Column("chunk_count", sa.Integer(), nullable=True),
        sa.Column(
            "status",
            sa.String(32),
            nullable=False,
            server_default="processing",
        ),
        sa.Column(
            "uploaded_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # ─── agent_definitions ──────────────────────────────────────────────────
    op.create_table(
        "agent_definitions",
        sa.Column("id", sa.UUID(as_uuid=False), primary_key=True, default=uuid.uuid4),
        sa.Column(
            "project_id",
            sa.UUID(as_uuid=False),
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("name", sa.String(256), nullable=False),
        sa.Column("system_prompt", sa.Text(), nullable=True),
        sa.Column("tools", sa.JSON(), nullable=True, server_default=sa.text("'[]'::jsonb")),
        sa.Column("config", sa.JSON(), nullable=True, server_default=sa.text("'{}'::jsonb")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # ─── api_keys ───────────────────────────────────────────────────────────
    op.create_table(
        "api_keys",
        sa.Column("id", sa.UUID(as_uuid=False), primary_key=True, default=uuid.uuid4),
        sa.Column(
            "user_id",
            sa.UUID(as_uuid=False),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "org_id",
            sa.UUID(as_uuid=False),
            sa.ForeignKey("organizations.id", ondelete="CASCADE"),
            nullable=True,
        ),
        sa.Column("name", sa.String(256), nullable=False),
        sa.Column("key_hash", sa.String(256), nullable=False),
        sa.Column("prefix", sa.String(16), nullable=True),
        sa.Column("permissions", sa.JSON(), nullable=True, server_default=sa.text("'{}'::jsonb")),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # ─── usage_logs ─────────────────────────────────────────────────────────
    op.create_table(
        "usage_logs",
        sa.Column("id", sa.UUID(as_uuid=False), primary_key=True, default=uuid.uuid4),
        sa.Column(
            "user_id",
            sa.UUID(as_uuid=False),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "org_id",
            sa.UUID(as_uuid=False),
            sa.ForeignKey("organizations.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("model", sa.String(128), nullable=False),
        sa.Column("provider", sa.String(64), nullable=True),
        sa.Column("tokens_in", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("tokens_out", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("latency_ms", sa.Float(), nullable=True),
        sa.Column("cost", sa.Float(), nullable=True),
        sa.Column(
            "status",
            sa.String(32),
            nullable=False,
            server_default="success",
        ),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column(
            "event_time",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
            index=True,
        ),
    )

    # ─── invoices ───────────────────────────────────────────────────────────
    op.create_table(
        "invoices",
        sa.Column("id", sa.UUID(as_uuid=False), primary_key=True, default=uuid.uuid4),
        sa.Column(
            "org_id",
            sa.UUID(as_uuid=False),
            sa.ForeignKey("organizations.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("currency", sa.String(8), nullable=False, server_default="RUB"),
        sa.Column(
            "status",
            sa.String(32),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("external_payment_id", sa.String(256), nullable=True),
        sa.Column("payment_url", sa.String(1024), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
    )

    # ─── Индексы ───────────────────────────────────────────────────────────
    op.create_index("ix_conversations_user_updated", "conversations", ["user_id", "updated_at"])
    op.create_index("ix_messages_conversation_created", "messages", ["conversation_id", "created_at"])
    op.create_index("ix_documents_project_status", "documents", ["project_id", "status"])
    op.create_index("ix_usage_logs_event_user", "usage_logs", ["event_time", "user_id"])


def downgrade() -> None:
    """Удалить все таблицы."""
    op.drop_table("invoices")
    op.drop_table("usage_logs")
    op.drop_table("api_keys")
    op.drop_table("agent_definitions")
    op.drop_table("documents")
    op.drop_table("messages")
    op.drop_table("conversations")
    op.drop_table("projects")
    op.drop_table("organization_members")
    op.drop_table("organizations")
    op.drop_table("users")