from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Template(Base):
    __tablename__ = "checklist_templates"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    creator = relationship("User", back_populates="templates")
    tasks = relationship("TemplateTask", back_populates="template", cascade="all, delete-orphan")
    checklists = relationship("Checklist", back_populates="template")


class TemplateTask(Base):
    __tablename__ = "template_tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    template_id: Mapped[int] = mapped_column(ForeignKey("checklist_templates.id"), nullable=False)
    task_name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)

    template = relationship("Template", back_populates="tasks")
