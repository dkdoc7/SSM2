# 기술 스택 및 아키텍처 설계 (Tech Stack & Architecture Design)

## 1. 기술 스택 (Technology Stack)

### Frontend (User Interface)
- **Framework**: **React** (Vite 기반)
  - 빠른 빌드 속도와 최신 개발 경험 제공
- **YAML Parser**: **js-yaml**
  - YAML 형식 파싱 및 JavaScript 객체 변환
- **State Management**: **React useState**
  - 로컬 상태 관리 (YAML 텍스트, 파싱된 파라미터)
- **Styling**: **Vanilla CSS**
  - Glassmorphism, Dark Mode, 커스텀 컴포넌트
- **UI Components**:
  - ResizablePanel: 드래그 가능한 좌우 분할 패널
  - YamlEditor: 코드 에디터 스타일 YAML 편집기
  - DynamicUI: YAML 기반 자동 UI 생성기
  - DynamicField: 타입별 입력 필드 컴포넌트

### Backend (Optional - 현재 미사용)
- **Framework**: **FastAPI** (Python)
  - 추후 서버 저장/로드 기능 추가 시 사용 가능
  - 현재는 프론트엔드 전용 (클라이언트 사이드)

---

## 2. 아키텍처 설계 (Architecture Design)

### 2.1 YAML 기반 동적 UI 생성 (YAML-Driven Dynamic UI)

**핵심 개념:**
사용자가 YAML 형식으로 파라미터를 정의하면, 시스템이 이를 파싱하여 자동으로 UI를 생성합니다.

**데이터 흐름:**
```
1. 사용자 입력 (YAML 텍스트)
   ↓
2. js-yaml 파싱
   ↓
3. JavaScript 객체 변환
   ↓
4. DynamicUI 컴포넌트
   ↓
5. 타입별 DynamicField 렌더링
   ↓
6. 사용자 인터페이스 표시
```

### 2.2 좌우 분할 패널 구조

```
┌─────────────────────────────────────────────────┐
│              Header (제목, 설명)                  │
├──────────────────┬──────────────────────────────┤
│                  │                              │
│  YAML Editor     │  Dynamic UI                  │
│  (좌측 40%)      │  (우측 60%)                  │
│                  │                              │
│  - YAML 텍스트   │  - 자동 생성 입력 필드        │
│  - 실시간 검증   │  - 툴팁 (Description)        │
│  - 오류 표시     │  - 단위 표시 (Unit)          │
│                  │  - 메타 정보                 │
│                  │                              │
├──────────────────┴──────────────────────────────┤
│              Footer (도움말, 버전)                │
└─────────────────────────────────────────────────┘
         ↑
    드래그 가능한 리사이저
```

### 2.3 컴포넌트 구조

```
App.jsx
├── Header
├── ResizablePanel
│   ├── YamlEditor (좌측)
│   │   ├── YAML 텍스트 입력
│   │   ├── 구문 검사
│   │   └── 오류 메시지
│   └── DynamicUI (우측)
│       └── 파라미터별 렌더링
│           ├── 파라미터 라벨
│           ├── 정보 아이콘 (툴팁)
│           ├── DynamicField (입력 필드)
│           ├── 단위 표시
│           └── 메타 정보
└── Footer
```

---

## 3. 데이터 저장 방식 (Data Storage - 현재 버전)

### 클라이언트 사이드 전용 (Client-Side Only)
현재 구현은 **브라우저 메모리**에만 데이터를 저장합니다.
- **장점**: 서버 불필요, 빠른 프로토타이핑
- **단점**: 새로고침 시 데이터 손실

### 향후 확장 가능성
1. **LocalStorage**: 브라우저 로컬 저장소 활용
2. **Backend 연동**: FastAPI + SQLite로 서버 저장
3. **파일 내보내기/가져오기**: YAML 파일 다운로드/업로드

---

## 4. YAML 스키마 정의 (YAML Schema)

각 파라미터는 다음 속성을 가질 수 있습니다:

| 속성 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `Description` | String | 선택 | 파라미터 설명 (툴팁 표시) |
| `Type` | String | 필수 | 데이터 타입 (String, Double, Integer, Boolean 등) |
| `Range` | Array | 선택 | 숫자형 최소/최대 범위 `[min, max]` |
| `Default` | Any | 선택 | 기본값 |
| `Unit` | String | 선택 | 단위 (Hz, V, °C 등) |
| `Options` | Array | 선택 | 선택형 옵션 리스트 |

**예시:**
```yaml
MAX_Freq:
  Description: 최대 주파수
  Type: Double
  Range: [1.0, 100.0]
  Default: 5.0
  Unit: Hz
```

---

## 5. 결론

**선택된 아키텍처:**
- **프론트엔드**: React + Vite + js-yaml
- **저장 방식**: 클라이언트 사이드 (메모리)
- **UI 생성**: YAML 파싱 → 동적 렌더링

**이유:**
1. **유연성**: YAML 수정만으로 UI 변경 가능
2. **단순성**: 서버 없이 독립 실행 가능
3. **확장성**: 추후 백엔드 연동 용이
4. **사용성**: 직관적인 좌우 분할 인터페이스
추가되거나 속성(예: `description`, `type`, `options`)이 바뀔 때마다 `ALTER TABLE`로 스키마를 수정해야 합니다. 이는 매우 번거롭고 유연하지 못합니다.
- **해결책 (NoSQL 접근):** DB의 장점(트랜잭션, 파일 하나로 관리)은 유지하되, 내용물은 유연한 JSON(텍스트) 형태로 저장합니다.

### ✅ 제안 솔루션: SQLite + JSON Column
1.  **극대화된 유연성 (Schema-less):**
    -   새로운 파라미터가 생겨도 DB 스키마 변경 불필요.
    -   파라미터의 구조(깊이, 배열 등)가 복잡해도 그대로 저장 가능.
2.  **파일 기반 관리 용이 (File-Driven):**
    -   `config.json` 파일을 백엔드에서 읽어 DB에 텍스트 형태로 '밀어넣기(Upsert)'만 하면 UI가 즉시 반영됨.
3.  **검색 가능:**
    -   최신 SQLite(3.9+)는 JSON 내부 필드에 대한 쿼리(`json_extract`)를 지원하므로, 텍스트로 저장해도 검색/필터링이 가능함.

#### **단점 (Cons):**
1.  **데이터 무결성 약화:** DB 레벨에서 강제적인 타입 체크가 어려움 (애플리케이션 레벨인 Pydantic에서 처리해야 함).
2.  **부분 업데이트의 복잡함:** 특정 필드 하나만 수정하려면 전체 JSON을 읽고 수정 후 다시 저장해야 할 수 있음 (최신 SQLite 함수로 완화 가능).

---

## 3. 구현 상세 설계 (Implementation Design)

### 3.1 테이블 구조 (Table Schema)
복잡한 컬럼 대신, **메타데이터(버전, 날짜)**와 **실제 데이터(JSON Payload)**만 관리합니다.

```sql
CREATE TABLE configurations (
    key TEXT PRIMARY KEY,        -- 설정의 고유 키 (예: 'global_settings', 'payment_params')
    data TEXT NOT NULL,          -- 실제 설정값 (JSON 문자열)
    version INTEGER DEFAULT 1,   -- 설정 버전 (낙관적 락킹용)
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 데이터 흐름 (Data Flow) - "File to DB to UI"
1.  **Definition (정의)**: 개발자/관리자가 `params_schema.yaml` 파일에 파라미터 스펙(키, 타입, 라벨 등)을 정의.
2.  **Sync (동기화)**: 서버 시작 시(또는 관리자 요청 시) 파일을 읽어 DB의 `configurations` 테이블에 JSON 포맷으로 저장.
3.  **Render (렌더링)**: React 클라이언트는 DB에서 JSON을 받아와, 그 구조에 맞춰 동적으로 Input/Toggle 등을 그림.
4.  **Update (값 수정)**: 사용자가 UI에서 값을 바꾸면, 변경된 값만 DB 내 JSON의 해당 위치에 업데이트.

---

## 4. 결론
- **저장소:** **SQLite** (단일 파일 DB)
- **저장 방식:** **JSON Text Column** (NoSQL 스타일)
- **이유:**
    1.  빈번한 UI/데이터 구조 변경에 유연하게 대처 가능.
    2.  `ALTER TABLE` 없이 파일 수정만으로 기능 확장 가능.
    3.  SQL의 안정성과 NoSQL의 유연성을 동시에 확보.
