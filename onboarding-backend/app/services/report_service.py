from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.checklist import Checklist, ChecklistTask
from app.models.user import User
from app.schemas.report import ProgressReportItem, TeamStatusItem


def build_progress_report(db: Session) -> list[ProgressReportItem]:
    checklists = db.scalars(select(Checklist)).all()
    items: list[ProgressReportItem] = []

    for checklist in checklists:
        total_tasks = db.scalar(
            select(func.count(ChecklistTask.id)).where(ChecklistTask.checklist_id == checklist.id)
        ) or 0
        completed_tasks = db.scalar(
            select(func.count(ChecklistTask.id)).where(
                ChecklistTask.checklist_id == checklist.id,
                ChecklistTask.completed.is_(True),
            )
        ) or 0
        user = db.get(User, checklist.user_id)
        percent = (completed_tasks / total_tasks * 100) if total_tasks else 0
        items.append(
            ProgressReportItem(
                checklist_id=checklist.id,
                developer_name=user.name if user else "Unknown",
                completed_tasks=completed_tasks,
                total_tasks=total_tasks,
                completion_percent=round(percent, 2),
            )
        )

    return items


def build_team_status(db: Session) -> list[TeamStatusItem]:
    developers = db.scalars(select(User).where(User.role == "developer")).all()
    items: list[TeamStatusItem] = []

    for developer in developers:
        active = db.scalar(
            select(func.count(Checklist.id)).where(
                Checklist.user_id == developer.id,
                Checklist.status.in_(["assigned", "in_progress"]),
            )
        ) or 0
        completed = db.scalar(
            select(func.count(Checklist.id)).where(
                Checklist.user_id == developer.id,
                Checklist.status == "completed",
            )
        ) or 0

        items.append(
            TeamStatusItem(
                user_id=developer.id,
                developer_name=developer.name,
                active_checklists=active,
                completed_checklists=completed,
            )
        )

    return items
