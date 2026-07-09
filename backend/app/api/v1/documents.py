"""
Super AI RU — Documents / RAG API.

POST /v1/documents/upload — загрузка документа
POST /v1/rag/search — поиск по документам
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.models.document import Document
from app.models.user import User
from app.services.rag_engine import rag_engine

router = APIRouter(prefix="/v1", tags=["documents"])


@router.post(
    "/documents/upload",
    summary="Загрузить документ",
    description="Загрузить файл для RAG-индексации.",
    status_code=201,
)
async def upload_document(
    project_id: str = Form(..., description="ID проекта"),
    file: UploadFile = File(..., description="Файл для загрузки"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Загрузить документ в проект.

    Файл сохраняется (в будущем — в S3) и отправляется в RAG Engine.
    """
    # Читаем содержимое файла
    content_bytes = await file.read()
    content = content_bytes.decode("utf-8", errors="replace")

    # Создаём запись в БД
    document = Document(
        project_id=project_id,
        filename=file.filename or "unknown",
        content_type=file.content_type or "application/octet-stream",
        size_bytes=len(content_bytes),
        status="processing",
    )
    db.add(document)
    await db.flush()

    # Отправляем в RAG Engine
    rag_result = await rag_engine.ingest_document(
        document_id=document.id,
        text=content,
        metadata={
            "project_id": project_id,
            "filename": document.filename,
            "content_type": document.content_type,
        },
    )

    document.status = "ready"
    document.chunk_count = rag_result.get("chunks_count", 0)
    await db.flush()

    return {
        "document_id": document.id,
        "filename": document.filename,
        "status": document.status,
        "rag": rag_result,
    }


@router.post(
    "/rag/search",
    summary="Поиск по документам (RAG)",
    description="Поиск релевантных чанков по текстовому запросу.",
)
async def rag_search(
    query: str = Query(..., description="Поисковый запрос"),
    project_id: str = Query(..., description="ID проекта"),
    top_k: int = Query(5, ge=1, le=50, description="Количество результатов"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Поиск релевантных фрагментов документов по запросу.

    Использует RAG Engine (LangChain + Qdrant).
    """
    results = await rag_engine.search(
        query=query,
        project_id=project_id,
        top_k=top_k,
    )

    return {
        "query": query,
        "results": results,
        "total": len(results),
    }


@router.get(
    "/documents",
    summary="Список документов",
    description="Получить список загруженных документов проекта.",
)
async def list_documents(
    project_id: str = Query(..., description="ID проекта"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    """Получить список документов проекта."""
    result = await db.execute(
        select(Document)
        .where(Document.project_id == project_id)
        .order_by(Document.uploaded_at.desc())
    )
    documents = result.scalars().all()

    return [
        {
            "id": doc.id,
            "filename": doc.filename,
            "content_type": doc.content_type,
            "size_bytes": doc.size_bytes,
            "chunk_count": doc.chunk_count,
            "status": doc.status,
            "uploaded_at": doc.uploaded_at.isoformat(),
        }
        for doc in documents
    ]


@router.delete(
    "/documents/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Удалить документ",
    description="Удалить документ из проекта.",
)
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Удалить документ."""
    result = await db.execute(
        select(Document).where(Document.id == document_id)
    )
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Документ не найден")

    await rag_engine.delete_document(document_id=document_id)
    await db.delete(document)
    await db.flush()