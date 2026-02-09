from fastapi import APIRouter, HTTPException
from typing import Any
from models import UpdateParameterRequest, ConfigurationResponse, Parameter
from crud import (
    get_configuration,
    get_all_configurations,
    update_parameter,
    delete_parameter,
    add_parameter
)
from database import load_schema_to_db

router = APIRouter(prefix="/api/parameters", tags=["Parameters"])


@router.get("/", response_model=dict)
async def get_parameters():
    """전체 파라미터 설정 조회"""
    config = get_configuration("global_config")
    
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    return config


@router.put("/update")
async def update_param(request: UpdateParameterRequest):
    """파라미터 값 업데이트"""
    success = update_parameter(
        request.group_id,
        request.parameter_key,
        request.new_value
    )
    
    if not success:
        raise HTTPException(
            status_code=404,
            detail=f"Parameter {request.parameter_key} in group {request.group_id} not found"
        )
    
    return {"message": "Parameter updated successfully"}


@router.delete("/{group_id}/{parameter_key}")
async def delete_param(group_id: str, parameter_key: str):
    """파라미터 삭제"""
    success = delete_parameter(group_id, parameter_key)
    
    if not success:
        raise HTTPException(
            status_code=404,
            detail=f"Parameter {parameter_key} in group {group_id} not found"
        )
    
    return {"message": "Parameter deleted successfully"}


@router.post("/{group_id}")
async def add_param(group_id: str, parameter: Parameter):
    """새 파라미터 추가"""
    success = add_parameter(group_id, parameter.model_dump())
    
    if not success:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to add parameter. Group {group_id} not found or parameter already exists."
        )
    
    return {"message": "Parameter added successfully"}


@router.post("/sync-schema")
async def sync_schema():
    """스키마 파일을 DB에 재동기화"""
    try:
        load_schema_to_db()
        return {"message": "Schema synchronized successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
