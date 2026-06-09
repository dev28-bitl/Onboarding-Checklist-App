from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.checklist import Checklist, ChecklistTask
from app.models.template import Template
from app.models.user import User


def assign_checklist(db: Session, user_id: int, template_id: int) -> Checklist:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    template = db.get(Template, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    checklist = Checklist(user_id=user_id, template_id=template_id, status="assigned")
    db.add(checklist)
    db.flush()

    for task in template.tasks:
        db.add(
            ChecklistTask(
                checklist_id=checklist.id,
                task_name=task.task_name,
                category=task.category,
                completed=False,
            )
        )

    db.commit()
    db.refresh(checklist)
    return checklist


def refresh_checklist_status(checklist: Checklist) -> None:
    if checklist.tasks and all(task.completed for task in checklist.tasks):
        checklist.status = "completed"
    elif any(task.completed for task in checklist.tasks):
        checklist.status = "in_progress"
    else:
        checklist.status = "assigned"


def mark_task(db: Session, task: ChecklistTask, completed: bool, notes: str | None) -> ChecklistTask:
    task.completed = completed
    task.notes = notes
    task.completed_at = datetime.utcnow() if completed else None
    refresh_checklist_status(task.checklist)
    db.commit()
    db.refresh(task)
    return task
