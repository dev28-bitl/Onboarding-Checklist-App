from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.deps import require_roles
from app.database.session import get_db
from app.models.user import User
from app.schemas.report import ProgressReportItem, TeamStatusItem
from app.services.report_service import build_progress_report, build_team_status

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/progress", response_model=list[ProgressReportItem])
def progress(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "manager")),
):
    return build_progress_report(db)


@router.get("/team-status", response_model=list[TeamStatusItem])
def team_status(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "manager")),
):
    return build_team_status(db)
