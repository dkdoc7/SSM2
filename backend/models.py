from pydantic import BaseModel, Field
from typing import Any, Optional, List, Union


class Parameter(BaseModel):
    """개별 파라미터 모델"""
    key: str
    value: Any
    type: str  # "string", "number", "boolean", "select", "date", "json"
    label: str
    description: Optional[str] = None
    options: Optional[List[str]] = None  # select 타입일 경우 선택 옵션
    min: Optional[Union[int, float]] = None  # number 타입일 경우 최소값
    max: Optional[Union[int, float]] = None  # number 타입일 경우 최대값


class ParameterGroup(BaseModel):
    """파라미터 그룹 모델"""
    id: str
    label: str
    description: Optional[str] = None
    parameters: List[Parameter]


class ConfigurationSchema(BaseModel):
    """전체 설정 스키마"""
    version: str
    groups: List[ParameterGroup]


class UpdateParameterRequest(BaseModel):
    """파라미터 값 업데이트 요청"""
    group_id: str
    parameter_key: str
    new_value: Any


class ConfigurationResponse(BaseModel):
    """API 응답 모델"""
    key: str
    data: ConfigurationSchema
    version: int
    updated_at: str
