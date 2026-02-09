import sqlite3
import json
from pathlib import Path
from datetime import datetime
from typing import Optional

DB_PATH = Path(__file__).parent / "app.db"


def get_db_connection():
    """SQLite 데이터베이스 연결 생성"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row  # 딕셔너리 형태로 결과 반환
    return conn


def init_db():
    """데이터베이스 초기화 및 테이블 생성"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # configurations 테이블 생성
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS configurations (
            key TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            version INTEGER DEFAULT 1,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    conn.close()
    print("✅ Database initialized successfully")


def load_schema_to_db(schema_path: str = "schemas/default_schema.json"):
    """스키마 파일을 읽어 DB에 저장"""
    schema_file = Path(__file__).parent / schema_path
    
    if not schema_file.exists():
        print(f"⚠️  Schema file not found: {schema_file}")
        return
    
    with open(schema_file, "r", encoding="utf-8") as f:
        schema_data = json.load(f)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 전체 스키마를 'global_config' 키로 저장
    cursor.execute("""
        INSERT OR REPLACE INTO configurations (key, data, version, updated_at)
        VALUES (?, ?, ?, ?)
    """, (
        "global_config",
        json.dumps(schema_data, ensure_ascii=False),
        1,
        datetime.now().isoformat()
    ))
    
    conn.commit()
    conn.close()
    print(f"✅ Schema loaded from {schema_path}")


if __name__ == "__main__":
    # 직접 실행 시 DB 초기화 및 스키마 로드
    init_db()
    load_schema_to_db()
