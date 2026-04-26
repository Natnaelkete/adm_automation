from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class DispositionEnum(str, Enum):
    Retire = "Retire"
    Retain = "Retain"
    Rehost = "Rehost"
    Replatform = "Replatform"
    Refactor = "Refactor"
    Rearchitect = "Rearchitect"

class Application(BaseModel):
    name: str
    business_unit: str
    age_years: float
    tech_stack: str
    annual_run_cost: float
    disposition: DispositionEnum

class Competitor(BaseModel):
    name: str
    capabilities: List[str] = []
    gaps: List[str] = []

class TransformationTargets(BaseModel):
    target_roi: float
    modernization_backlog_reduction_percentage: float
    innovation_shift_percentage: float

class ClientInput(BaseModel):
    company_name: str
    industry: str
    annual_adm_spend: float
    total_fte_count: int = 500
    onshore_fte_percentage: float = 0.3
    offshore_fte_percentage: float = 0.7
    onshore_rate: float = 120.0
    offshore_rate: float = 45.0
    applications: List[Application]
    competitors: List[Competitor]
    transformation_targets: Optional[TransformationTargets] = None
