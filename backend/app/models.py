from pydantic import BaseModel, Field


class TaskItem(BaseModel):
    title: str = ""
    owner: str | None = None
    status: str | None = None


class TimelineItem(BaseModel):
    milestone: str = ""
    due_date: str | None = None


class RiskItem(BaseModel):
    title: str = ""
    impact: str | None = None


class WorkCard(BaseModel):
    summary: str = ""
    tasks: list[TaskItem] = Field(default_factory=list)
    timeline: list[TimelineItem] = Field(default_factory=list)
    risks: list[RiskItem] = Field(default_factory=list)
    next_action: str | None = None
