"""
Super AI RU — Billing API.

GET /v1/billing/usage — статистика потребления
"""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.models.billing import UsageLog
from app.models.user import User

router = APIRouter(prefix="/v1/billing", tags=["billing"])


@router.get(
    "/usage",
    summary="Статистика потребления",
    description="Получить статистику использования LLM токенов.",
)
async def get_usage(
    start: date | None = Query(None, description="Начальная дата (YYYY-MM-DD)"),
    end: date | None = Query(None, description="Конечная дата (YYYY-MM-DD)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Получить агрегированную статистику потребления токенов.

    По умолчанию — за последние 7 дней.
    """
    now = datetime.now(timezone.utc)

    if end is None:
        end_date = now.date()
    else:
        end_date = end

    if start is None:
        start_date = end_date - timedelta(days=7)
    else:
        start_date = start

    query = select(
        UsageLog.model,
        func.sum(UsageLog.tokens_in).label("total_tokens_in"),
        func.sum(UsageLog.tokens_out).label("total_tokens_out"),
        func.count(UsageLog.id).label("request_count"),
        func.avg(UsageLog.latency_ms).label("avg_latency_ms"),
        func.sum(UsageLog.cost).label("total_cost"),
    ).where(
        UsageLog.user_id == current_user.id,
        UsageLog.event_time >= start_date,
        UsageLog.event_time <= end_date + timedelta(days=1),
    ).group_by(UsageLog.model)

    result = await db.execute(query)
    rows = result.all()

    usage_by_model = [
        {
            "model": row.model,
            "tokens_in": int(row.total_tokens_in or 0),
            "tokens_out": int(row.total_tokens_out or 0),
            "requests": int(row.request_count or 0),
            "avg_latency_ms": round(float(row.avg_latency_ms or 0), 2),
            "cost": round(float(row.total_cost or 0), 6),
        }
        for row in rows
    ]

    total_cost = sum(item["cost"] for item in usage_by_model)

    return {
        "start": start_date.isoformat(),
        "end": end_date.isoformat(),
        "total_cost": round(total_cost, 6),
        "usage": usage_by_model,
    }