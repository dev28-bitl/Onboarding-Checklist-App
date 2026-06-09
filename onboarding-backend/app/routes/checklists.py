from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.auth.deps import get_current_user, require_roles
from app.database.session import get_db
from app.models.checklist import Checklist, ChecklistTask
from app.models.user import User
from app.schemas.checklist import (
    AssignChecklistRequest,
    ChecklistOut,
    ChecklistTaskOut,
    ChecklistTaskUpdate,
)
from app.services.checklist_service import assign_checklist, mark_task

router = APIRouter(prefix="/checklists", tags=["Checklists"])


@router.post("/assign", response_model=ChecklistOut)
def assign(
    payload: AssignChecklistRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "manager")),
):
    checklist = assign_checklist(db, payload.user_id, payload.template_id)
    checklist = db.scalar(
        select(Checklist)
        .where(Checklist.id == checklist.id)
        .options(selectinload(Checklist.tasks))
    )
    return checklist


@router.get("/user/{user_id}", response_model=list[ChecklistOut])
def get_user_checklists(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "developer" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    checklists = db.scalars(
        select(Checklist)
        .where(Checklist.user_id == user_id)
        .options(selectinload(Checklist.tasks))
    ).all()
    return checklists


@router.put("/task/{task_id}", response_model=ChecklistTaskOut)
def update_task(
    task_id: int,
    payload: ChecklistTaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.scalar(
        select(ChecklistTask)
        .where(ChecklistTask.id == task_id)
        .options(selectinload(ChecklistTask.checklist).selectinload(Checklist.tasks))
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.role == "developer" and task.checklist.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    return mark_task(db, task, payload.completed, payload.notes)
