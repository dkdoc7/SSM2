from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import parameters
from database import init_db, load_schema_to_db

app = FastAPI(
    title="Parameter Management System",
    description="동적 파라미터 관리 시스템 API",
    version="1.0.0"
)

# CORS 설정 (프론트엔드 연동)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite 기본 포트
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(parameters.router)


@app.on_event("startup")
async def startup_event():
    """서버 시작 시 DB 초기화 및 스키마 로드"""
    init_db()
    load_schema_to_db()
    print("🚀 Server started successfully")


@app.get("/")
async def root():
    return {
        "message": "Parameter Management System API",
        "docs": "/docs",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
