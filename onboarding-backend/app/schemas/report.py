from pydantic import BaseModel


class ProgressReportItem(BaseModel):
    checklist_id: int
    developer_name: str
    completed_tasks: int
    total_tasks: int
    completion_percent: float


class TeamStatusItem(BaseModel):
    user_id: int
    developer_name: str
    active_checklists: int
    completed_checklists: int
