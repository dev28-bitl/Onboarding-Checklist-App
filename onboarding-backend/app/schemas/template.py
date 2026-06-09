from datetime import datetime

from pydantic import BaseModel


class TemplateTaskCreate(BaseModel):
    task_name: str
    category: str


class TemplateTaskOut(TemplateTaskCreate):
    id: int

    model_config = {"from_attributes": True}


class TemplateCreate(BaseModel):
    title: str
    description: str | None = None
    tasks: list[TemplateTaskCreate]


class TemplateUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    tasks: list[TemplateTaskCreate] | None = None


class TemplateOut(BaseModel):
    id: int
    title: str
    description: str | None
    created_by: int
    created_at: datetime
    tasks: list[TemplateTaskOut]

    model_config = {"from_attributes": True}
