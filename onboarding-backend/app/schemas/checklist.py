from datetime import datetime

from pydantic import BaseModel


class AssignChecklistRequest(BaseModel):
    user_id: int
    template_id: int


class ChecklistTaskUpdate(BaseModel):
    completed: bool
    notes: str | None = None


class ChecklistTaskOut(BaseModel):
    id: int
    checklist_id: int
    task_name: str
    category: str
    completed: bool
    completed_at: datetime | None
    notes: str | None

    model_config = {"from_attributes": True}


class ChecklistOut(BaseModel):
    id: int
    user_id: int
    template_id: int
    status: str
    assigned_date: datetime
    tasks: list[ChecklistTaskOut]

    model_config = {"from_attributes": True}
