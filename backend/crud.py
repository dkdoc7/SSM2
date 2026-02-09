import json
from typing import Optional, Any
from datetime import datetime
from database import get_db_connection
from models import ConfigurationSchema


def get_configuration(key: str = "global_config") -> Optional[dict]:
    """특정 설정 조회"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM configurations WHERE key = ?", (key,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            "key": row["key"],
            "data": json.loads(row["data"]),
            "version": row["version"],
            "updated_at": row["updated_at"]
        }
    return None


def get_all_configurations() -> list:
    """전체 설정 조회"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM configurations")
    rows = cursor.fetchall()
    conn.close()
    
    return [
        {
            "key": row["key"],
            "data": json.loads(row["data"]),
            "version": row["version"],
            "updated_at": row["updated_at"]
        }
        for row in rows
    ]


def update_parameter(group_id: str, parameter_key: str, new_value: Any) -> bool:
    """특정 파라미터 값 업데이트"""
    config = get_configuration("global_config")
    
    if not config:
        return False
    
    data = config["data"]
    updated = False
    
    # 그룹 찾기 및 파라미터 업데이트
    for group in data.get("groups", []):
        if group["id"] == group_id:
            for param in group.get("parameters", []):
                if param["key"] == parameter_key:
                    param["value"] = new_value
                    updated = True
                    break
            break
    
    if not updated:
        return False
    
    # DB에 저장
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE configurations
        SET data = ?, version = version + 1, updated_at = ?
        WHERE key = ?
    """, (
        json.dumps(data, ensure_ascii=False),
        datetime.now().isoformat(),
        "global_config"
    ))
    
    conn.commit()
    conn.close()
    
    return True


def delete_parameter(group_id: str, parameter_key: str) -> bool:
    """특정 파라미터 삭제"""
    config = get_configuration("global_config")
    
    if not config:
        return False
    
    data = config["data"]
    deleted = False
    
    # 그룹 찾기 및 파라미터 삭제
    for group in data.get("groups", []):
        if group["id"] == group_id:
            original_length = len(group.get("parameters", []))
            group["parameters"] = [
                p for p in group.get("parameters", [])
                if p["key"] != parameter_key
            ]
            deleted = len(group["parameters"]) < original_length
            break
    
    if not deleted:
        return False
    
    # DB에 저장
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE configurations
        SET data = ?, version = version + 1, updated_at = ?
        WHERE key = ?
    """, (
        json.dumps(data, ensure_ascii=False),
        datetime.now().isoformat(),
        "global_config"
    ))
    
    conn.commit()
    conn.close()
    
    return True


def add_parameter(group_id: str, parameter: dict) -> bool:
    """새 파라미터 추가"""
    config = get_configuration("global_config")
    
    if not config:
        return False
    
    data = config["data"]
    added = False
    
    # 그룹 찾기 및 파라미터 추가
    for group in data.get("groups", []):
        if group["id"] == group_id:
            # 중복 체크
            if any(p["key"] == parameter["key"] for p in group.get("parameters", [])):
                return False
            
            group["parameters"].append(parameter)
            added = True
            break
    
    if not added:
        return False
    
    # DB에 저장
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE configurations
        SET data = ?, version = version + 1, updated_at = ?
        WHERE key = ?
    """, (
        json.dumps(data, ensure_ascii=False),
        datetime.now().isoformat(),
        "global_config"
    ))
    
    conn.commit()
    conn.close()
    
    return True
