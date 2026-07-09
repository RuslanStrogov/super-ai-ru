"""
Super AI RU — Agents API.

CRUD /agents + POST /agents/{id}/run
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.models.agent import AgentDefinition
from app.models.user import User
from app.schemas.agent import AgentCreate, AgentOut, AgentRunRequest, AgentRunResponse, AgentUpdate

router = APIRouter(prefix="/v1/agents", tags=["agents"])


@router.post(
    "",
    response_model=AgentOut,
    summary="Создать агента",
    description="Создать новое определение AI-агента.",
    status_code=201,
)
async def create_agent(
    body: AgentCreate,
    project_id: str = Query(..., description="ID проекта"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AgentOut:
    """Создать определение агента."""
    agent = AgentDefinition(
        project_id=project_id,
        name=body.name,
        system_prompt=body.system_prompt,
        tools=body.tools,
        config=body.config,
    )
    db.add(agent)
    await db.flush()
    await db.refresh(agent)
    return AgentOut.model_validate(agent)


@router.get(
    "",
    response_model=list[AgentOut],
    summary="Список агентов",
    description="Получить список агентов проекта.",
)
async def list_agents(
    project_id: str = Query(..., description="ID проекта"),
    is_active: bool | None = Query(None, description="Фильтр по активности"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[AgentOut]:
    """Получить список агентов в проекте."""
    query = select(AgentDefinition).where(AgentDefinition.project_id == project_id)
    if is_active is not None:
        query = query.where(AgentDefinition.is_active == is_active)
    query = query.order_by(AgentDefinition.created_at.desc())

    result = await db.execute(query)
    agents = result.scalars().all()
    return [AgentOut.model_validate(a) for a in agents]


@router.get(
    "/{agent_id}",
    response_model=AgentOut,
    summary="Получить агента",
    description="Получить определение агента по ID.",
)
async def get_agent(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AgentOut:
    """Получить агента по ID."""
    result = await db.execute(
        select(AgentDefinition).where(AgentDefinition.id == agent_id)
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Агент не найден")
    return AgentOut.model_validate(agent)


@router.patch(
    "/{agent_id}",
    response_model=AgentOut,
    summary="Обновить агента",
    description="Обновить определение агента.",
)
async def update_agent(
    agent_id: str,
    body: AgentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AgentOut:
    """Обновить агента."""
    result = await db.execute(
        select(AgentDefinition).where(AgentDefinition.id == agent_id)
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Агент не найден")

    update_data = body.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(agent, field, value)

    await db.flush()
    await db.refresh(agent)
    return AgentOut.model_validate(agent)


@router.delete(
    "/{agent_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Удалить агента",
    description="Удалить определение агента.",
)
async def delete_agent(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Удалить агента."""
    result = await db.execute(
        select(AgentDefinition).where(AgentDefinition.id == agent_id)
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Агент не найден")

    await db.delete(agent)
    await db.flush()


@router.post(
    "/{agent_id}/run",
    response_model=AgentRunResponse,
    summary="Запустить агента",
    description="Запустить AI-агента на выполнение задачи.",
)
async def run_agent(
    agent_id: str,
    body: AgentRunRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AgentRunResponse:
    """
    Запустить агента.

    TODO: Реализовать полноценный запуск через CrewAI.
    Пока возвращает заглушку.
    """
    result = await db.execute(
        select(AgentDefinition).where(AgentDefinition.id == agent_id)
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Агент не найден")

    return AgentRunResponse(
        agent_id=agent_id,
        result=f"Агент '{agent.name}' запущен. "
               f"Задача: '{body.task}'. "
               f"Полноценный запуск через CrewAI будет добавлен позже.",
    )