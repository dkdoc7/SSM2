import React, { useState } from 'react';
import './styles/index.css';
import ResizablePanel from './components/ResizablePanel';
import YamlEditor from './components/YamlEditor';
import DynamicUI from './components/DynamicUI';

// 초기 YAML 예제
const initialYaml = `_Frame:
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

A_Volt:
  Description: A 동작 전압
  Type: Double
  Range: [1.0, 10.0]
  Default: 1.2
  Unit: V

B_Volt:
  Description: B 동작 전압
  Type: Double
  Range: [1.0, 10.0]
  Default: 2.4
  Unit: V

MAX_Volt:
  Description: 최대 전압 (A_Volt + B_Volt)
  Type: Double
  Range: [1.0, 10.0]
  Default: (A_Volt + B_Volt)
  Unit: V

ENABLE_LOGGING:
  Description: 로깅 활성화 여부
  Type: Boolean
  Default: true

LOG_LEVEL:
  Description: 로그 레벨
  Type: String
  Default: INFO
  Options: [DEBUG, INFO, WARNING, ERROR]

RETRY_COUNT:
  Description: 재시도 횟수
  Type: Integer
  Range: [1, 10]
  Default: 3
`;

function App() {
  const [parameters, setParameters] = useState(null);
  const [yamlText, setYamlText] = useState(initialYaml);

  const handleYamlChange = (parsed, rawYaml) => {
    setYamlText(rawYaml);
    if (parsed) {
      setParameters(parsed);
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="header">
        <h1>⚙️ Parameter Management System</h1>
        <p>YAML 기반 동적 UI 생성기</p>
        <div style={{
          marginTop: '1rem',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          왼쪽에 YAML로 파라미터를 정의하면, 오른쪽에 자동으로 UI가 생성됩니다
        </div>
      </div>

      {/* 좌우 분할 패널 */}
      <ResizablePanel
        leftContent={
          <YamlEditor
            initialYaml={initialYaml}
            onChange={handleYamlChange}
          />
        }
        rightContent={
          <DynamicUI parameters={parameters} />
        }
      />

      {/* 푸터 정보 */}
      <div style={{
        marginTop: '2rem',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem'
      }}>
        <p>💡 YAML 형식으로 파라미터를 정의하고 실시간으로 UI를 확인하세요</p>
      </div>
    </div>
  );
}

export default App;
