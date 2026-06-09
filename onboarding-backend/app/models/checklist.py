from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Checklist(Base):
    __tablename__ = "onboarding_checklists"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    template_id: Mapped[int] = mapped_column(ForeignKey("checklist_templates.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="assigned", nullable=False)
    assigned_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="checklists")
    template = relationship("Template", back_populates="checklists")
    tasks = relationship("ChecklistTask", back_populates="checklist", cascade="all, delete-orphan")


class ChecklistTask(Base):
    __tablename__ = "checklist_tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    checklist_id: Mapped[int] = mapped_column(ForeignKey("onboarding_checklists.id"), nullable=False)
    task_name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    checklist = relationship("Checklist", back_populates="tasks")
