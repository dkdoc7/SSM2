# 파라미터 관리 시스템 요구사항 (Parameter Management System Requirements)

## 1. 개요 (Overview)
YAML 형식으로 파라미터를 정의하면 웹 UI가 자동으로 생성되는 **동적 파라미터 관리 시스템**을 구현한다. 
좌우 분할 패널 구조로, 왼쪽에서 YAML을 편집하면 오른쪽에 실시간으로 UI가 반영된다.

## 2. 기능 요구사항 (Functional Requirements)

### 2.1 YAML 기반 파라미터 정의
- **좌측 패널 - YAML 에디터:**
  - 실시간 구문 검사 및 오류 표시.
  - 변경사항 즉시 우측 UI 반영.
  - **명명 규칙 (Naming Rule)**: 파라미터 이름이 언더바(`_`)로 시작하는 경우 (예: `_HiddenParam`), UI에서 라벨을 숨기고 입력 필드만 표시.

### 2.2 파라미터 속성 및 제어
- **표준 속성:** `Description`, `Type`, `Range`, `Default`, `Unit`, `Options`.
- **조건부 렌더링 (Conditional Rendering):** 
  - `Condition` 속성을 통해 특정 조건이 충족될 때만 파라미터를 표시.
  - 예: `Condition: _Frame=="Primary"` (JavaScript 논리 연산식 지원).
- **수식 평가 (Expression Evaluation):**
  - `Default` 값에 괄호로 감싼 수식을 작성하면 다른 파라미터 값을 참조하여 자동 계산.
  - 예: `Default: (A_Volt + B_Volt)` → A_Volt와 B_Volt의 합을 실시간으로 계산.
  - 수식 작성 규칙: 파라미터명과 연산자 사이 공백 필수.
  - 부동소수점 연산 오차 자동 보정 (소수점 10자리 반올림).
  - **오류 처리**: 수식 평가 실패 시 입력 필드 아래에 구체적인 오류 메시지 표시.
    - 예: "수식 오류: A_Volt is not defined", "수식 결과가 유효한 숫자가 아닙니다"
  - 수식 평가 실패 또는 결과가 범위를 벗어날 경우 tomato 색상으로 경고 표시.
- **유효성 검증:** 숫자형 타입이 지정된 `Range`를 벗어날 경우 시각적 피드백 제공 (배경 및 텍스트 Tomato 화).

### 2.3 지원 데이터 타입 (Supported Data Types)
- **String**: 텍스트 입력 필드.
- **Double/Number**: 소수점 숫자 입력 (입력창 내 오른쪽 정렬).
- **Integer**: 정수 입력.
- **Boolean**: 토글 스위치.
- **Select**: 드롭다운 메뉴.
- **Group (Segmented Control)**: 캡슐 모양의 토글 버튼 바. (예: Primary/Secondary 선택).
- **Date**: 날짜 선택기.
- **JSON**: JSON 객체 입력 (Textarea).

## 3. UI/UX 요구사항 (UI/UX Requirements)

### 3.1 디자인 스타일 (Design Identity)
- **테마**: 일반적인 화이트 톤의 라이트 모드 (`#f8f9fa` 배경).
- **레이아웃**: 개별 박스나 구분선이 없는 **Flat 리스트 스타일**.
- **행 구성**: `[라벨] [입력 필드] [단위] [정보 아이콘]` 순서의 가로 한 줄(Row) 배치.
- **컴포넌트 디테일**:
  - 입력창 내부 텍스트 오른쪽 정렬 (수치 가독성).
  - 숫자 입력창 스핀 버튼과 값 사이 충분한 간격 유지.
  - 정보 아이콘: 17px 크기의 작은 원형 `i`. 마우스 오버 시 다크 테마의 버블 툴팁 표시.

### 3.2 사용성 (Usability)
- **실시간 피드백**: YAML 구문 오류 및 값 범위 초과 시 즉각적인 시각적 경고.
- **리사이저블 패널**: 중앙의 핸들을 드래그하여 에디터와 UI 패널의 비율 조정 가능.

## 4. 기술 스택 (Technical Stack)
- **Frontend**: React (Vite), js-yaml.
- **Styling**: Vanilla CSS (CSS Variables 활용).

## 5. YAML 구조 예시
```yaml
_Frame:
  Description: 동작 타이밍 시퀀스
  Type: Group
  Default: Primary
  Options: [Primary, Secondary]

MAX_Freq:
  Description: 최대 주파수
  Condition: _Frame=="Primary"
  Type: Double
  Range: [1.0, 100.0]
  Default: 5.0
  Unit: Hz

_Separator:
  Description: 라벨 없이 표시되는 텍스트 예시
  Type: String
  Default: "라벨이 숨겨진 필드 예시"

MAX_Volt:
  Description: 최대 전압
  Type: Double
  Range: [1.0, 10.0]
  Default: 7.2
  Unit: V
```
