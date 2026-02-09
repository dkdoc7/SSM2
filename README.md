# Parameter Management System

YAML 기반 동적 UI 생성기 - 파라미터를 YAML로 정의하면 자동으로 UI가 생성됩니다

## 🚀 빠른 시작 (Quick Start)

### Frontend 실행

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

프론트엔드가 `http://localhost:5173`에서 실행됩니다.

## 📁 프로젝트 구조

```
SSM/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                      # 메인 애플리케이션
│   │   ├── components/
│   │   │   ├── ResizablePanel.jsx      # 좌우 분할 패널
│   │   │   ├── YamlEditor.jsx          # YAML 편집기
│   │   │   ├── DynamicUI.jsx           # 동적 UI 생성기
│   │   │   └── DynamicField.jsx        # 타입별 입력 필드
│   │   └── styles/
│   │       └── index.css               # 글로벌 스타일
│   └── package.json
└── docs/
    ├── requirements.md                  # 요구사항 문서
    └── tech-stack.md                    # 기술 스택 문서
```

## ✨ 주요 기능

### 1. YAML 기반 파라미터 정의
왼쪽 패널에서 YAML 형식으로 파라미터를 정의합니다:

```yaml
MAX_Freq:
  Description: 최대 주파수
  Type: Double
  Range: [1.0, 100.0]
  Default: 5.0
  Unit: Hz

MAX_Volt:
  Description: 최대 전압
  Type: Double
  Range: [1.0, 10.0]
  Default: 7.2
  Unit: V

ENABLE_LOGGING:
  Description: 로깅 활성화 여부
  Type: Boolean
  Default: true
```

### 2. 자동 UI 생성
오른쪽 패널에 자동으로 UI가 생성됩니다:
- 파라미터명 + 입력 필드 + 단위 표시
- 정보 아이콘(ℹ️) 마우스 오버 시 설명 툴팁
- 타입에 맞는 입력 컴포넌트 자동 렌더링

### 3. 지원 데이터 타입
- **String**: 텍스트 입력
- **Double/Number**: 소수점 숫자 입력
- **Integer**: 정수 입력
- **Boolean**: 토글 스위치
- **Select**: 드롭다운 (Options 필요)
- **Date**: 날짜 선택기
- **JSON**: JSON 객체 입력

### 4. 리사이저블 패널
- 중앙의 드래그 바를 이용해 좌우 패널 너비 조정 가능
- 최소/최대 너비 제한 (20% ~ 80%)

## 🎨 UI 특징

- **다크 모드**: 눈에 편안한 다크 테마
- **Glassmorphism**: 현대적인 반투명 카드 디자인
- **코드 에디터 스타일**: 왼쪽 YAML 편집기는 Monaco 스타일
- **실시간 검증**: YAML 구문 오류 즉시 표시
- **툴팁**: 각 파라미터의 설명을 정보 아이콘으로 확인

## 📝 YAML 속성 설명

| 속성 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `Description` | String | 선택 | 파라미터 설명 (툴팁 표시) |
| `Type` | String | 필수 | 데이터 타입 |
| `Range` | Array | 선택 | 숫자형 범위 `[min, max]` |
| `Default` | Any | 선택 | 기본값 |
| `Unit` | String | 선택 | 단위 (Hz, V 등) |
| `Options` | Array | 선택 | 선택형 옵션 리스트 |

## 🛠 기술 스택

- **Frontend**: React, Vite, js-yaml
- **Styling**: Vanilla CSS (Glassmorphism, Dark Mode)
- **State**: React useState (클라이언트 사이드)

## 📝 라이선스

MIT License


## 📁 프로젝트 구조

```
SSM/
├── backend/
│   ├── main.py              # FastAPI 애플리케이션
│   ├── database.py          # SQLite 연결 및 초기화
│   ├── models.py            # Pydantic 모델
│   ├── crud.py              # CRUD 로직
│   ├── routers/
│   │   └── parameters.py    # API 엔드포인트
│   ├── schemas/
│   │   └── default_schema.json  # 파라미터 정의
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   ├── services/
│   │   └── styles/
│   └── package.json
└── docs/
    ├── requirements.md
    └── tech-stack.md
```

## ✨ 주요 기능

### 1. 동적 UI 구성 (File-Driven UI)
- `backend/schemas/default_schema.json` 파일을 수정하면 UI가 자동으로 변경됩니다.
- 코드 수정 없이 새로운 파라미터 타입과 그룹을 추가할 수 있습니다.

### 2. 다양한 데이터 타입 지원
- **문자열 (string)**: 텍스트 입력
- **숫자 (number)**: 숫자 입력 (min/max 제한 가능)
- **불리언 (boolean)**: 토글 스위치
- **선택형 (select)**: 드롭다운 메뉴
- **날짜 (date)**: 날짜 선택기
- **JSON (json)**: JSON 객체 입력

### 3. 검색 및 필터링
- 키워드 검색: 파라미터 키, 값, 설명 검색
- 그룹별 필터링

### 4. 인라인 편집
- 목록에서 직접 값 수정 가능
- 실시간 저장 및 반영

## 🎨 UI 특징

- **다크 모드**: 눈에 편안한 다크 테마
- **Glassmorphism**: 현대적인 반투명 카드 디자인
- **반응형**: 데스크탑 및 태블릿 지원
- **애니메이션**: 부드러운 전환 효과

## 🔧 스키마 파일 수정 방법

`backend/schemas/default_schema.json` 파일을 수정한 후:

1. 웹 UI에서 "🔄 스키마 동기화" 버튼 클릭
2. 또는 API 직접 호출:
   ```bash
   curl -X POST http://localhost:8000/api/parameters/sync-schema
   ```

## 📡 API 엔드포인트

- `GET /api/parameters` - 전체 파라미터 조회
- `PUT /api/parameters/update` - 파라미터 값 수정
- `DELETE /api/parameters/{group_id}/{key}` - 파라미터 삭제
- `POST /api/parameters/{group_id}` - 새 파라미터 추가
- `POST /api/parameters/sync-schema` - 스키마 재동기화

## 🛠 기술 스택

- **Backend**: FastAPI, SQLite, Pydantic
- **Frontend**: React, Vite
- **Styling**: Vanilla CSS (Glassmorphism, Dark Mode)

## 📝 라이선스

MIT License
