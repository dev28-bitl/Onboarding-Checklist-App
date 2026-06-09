from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.auth.deps import get_current_user, require_roles
from app.database.session import get_db
from app.models.template import Template, TemplateTask
from app.models.user import User
from app.schemas.template import TemplateCreate, TemplateOut, TemplateUpdate

router = APIRouter(prefix="/templates", tags=["Templates"])


@router.get("", response_model=list[TemplateOut])
def list_templates(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    templates = db.scalars(select(Template).options(selectinload(Template.tasks))).all()
    return templates


@router.post("", response_model=TemplateOut)
def create_template(
    payload: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "manager")),
):
    template = Template(
        title=payload.title,
        description=payload.description,
        created_by=current_user.id,
        tasks=[TemplateTask(task_name=t.task_name, category=t.category) for t in payload.tasks],
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


@router.put("/{template_id}", response_model=TemplateOut)
def update_template(
    template_id: int,
    payload: TemplateUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "manager")),
):
    template = db.scalar(
        select(Template).where(Template.id == template_id).options(selectinload(Template.tasks))
    )
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    if payload.title is not None:
        template.title = payload.title
    if payload.description is not None:
        template.description = payload.description
    if payload.tasks is not None:
        template.tasks.clear()
        template.tasks.extend(
            [TemplateTask(task_name=t.task_name, category=t.category) for t in payload.tasks]
        )

    db.commit()
    db.refresh(template)
    return template


@router.delete("/{template_id}")
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "manager")),
):
    template = db.get(Template, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    db.delete(template)
    db.commit()
    return {"message": "Template deleted"}
