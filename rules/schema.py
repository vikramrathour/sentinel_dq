from enum import Enum
from typing import List, Optional, Union, Literal, Annotated
from pydantic import BaseModel, Field
import yaml

class CheckType(str, Enum):
    NOT_NULL = "not_null"
    REGEX_MATCH = "regex_match"
    RANGE = "range"

class Dimension(str, Enum):
    ACCURACY = "Accuracy"
    COMPLETENESS = "Completeness"
    CONSISTENCY = "Consistency"
    TIMELINESS = "Timeliness"
    VALIDITY = "Validity"
    UNIQUENESS = "Uniqueness"

class RuleBase(BaseModel):
    column: str
    dimension: Dimension
    type: CheckType
    hitl_required: bool = False

class NotNullRule(RuleBase):
    type: Literal[CheckType.NOT_NULL] = CheckType.NOT_NULL

class RegexMatchRule(RuleBase):
    type: Literal[CheckType.REGEX_MATCH] = CheckType.REGEX_MATCH
    pattern: str

class RangeRule(RuleBase):
    type: Literal[CheckType.RANGE] = CheckType.RANGE
    min_value: Optional[float] = None
    max_value: Optional[float] = None

class RulesConfig(BaseModel):
    dataset_id: str
    rules: List[Annotated[Union[NotNullRule, RegexMatchRule, RangeRule], Field(discriminator='type')]]

def load_rules(path: str) -> RulesConfig:
    with open(path, 'r') as f:
        data = yaml.safe_load(f)
    return RulesConfig(**data)
