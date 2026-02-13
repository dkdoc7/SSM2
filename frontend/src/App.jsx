import React, { useState } from 'react';
import './styles/index.css';
import ResizablePanel from './components/ResizablePanel';
import YamlEditor from './components/YamlEditor';
import DynamicUI from './components/DynamicUI';
import FormulaEditor from './components/FormulaEditor';
import ParameterRegistry from './components/ParameterRegistry';

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
  const [calculatedParameters, setCalculatedParameters] = useState({});

  const handleYamlChange = (parsed, rawYaml) => {
    setYamlText(rawYaml);
    if (parsed) {
      setParameters(parsed);
    }
  };

  // 수식 편집기 결과를 파라미터에 등록
  const handleFormulaResult = (varName, value, formula) => {
    if (!varName) return;
    setCalculatedParameters(prev => ({
      ...prev,
      [varName]: {
        Default: value,
        Formula: formula, // 수식 원본 저장
        Description: '수식에 의해 계산된 변수',
        Type: 'Double',
        IsCalculated: true // 계산된 변수임을 표시
      }
    }));
  };

  // 일반 파라미터와 계산된 파라미터 병합
  const combinedParameters = parameters ? { ...parameters, ...calculatedParameters } : null;

  const [activeTab, setActiveTab] = useState('ui'); // 'ui', 'formula', 'registry'

  return (
    <div style={{ padding: '0 2rem 2rem 2rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* 헤더 */}
      <div className="header" style={{ marginBottom: '1.5rem' }}>
        <h1>⚙️ Parameter Management System</h1>
        <p>YAML 기반 동적 UI 생성기</p>
      </div>

      {/* 최상위 탭 메뉴 */}
      <div style={{
        display: 'flex',
        gap: '2.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '2rem',
        paddingLeft: '1rem'
      }}>
        <TabItem id="ui" label="🖥️ UI 편집" activeTab={activeTab} onClick={setActiveTab} />
        <TabItem id="formula" label="🧮 수식 편집" activeTab={activeTab} onClick={setActiveTab} />
        <TabItem id="registry" label="📋 데이터 레지스트리" activeTab={activeTab} onClick={setActiveTab} />
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div style={{ height: 'calc(100vh - 280px)' }}>
        {activeTab === 'ui' && (
          <ResizablePanel
            leftContent={
              <YamlEditor
                initialYaml={initialYaml}
                onChange={handleYamlChange}
              />
            }
            rightContent={
              <DynamicUI parameters={combinedParameters} />
            }
          />
        )}

        {activeTab === 'formula' && (
          <div style={{
            height: '100%',
            background: 'var(--bg-card)',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden'
          }}>
            <FormulaEditor
              parameters={combinedParameters}
              onResultChange={handleFormulaResult}
            />
          </div>
        )}

        {activeTab === 'registry' && (
          <div style={{
            height: '100%',
            background: 'var(--bg-card)',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden'
          }}>
            <ParameterRegistry parameters={combinedParameters} />
          </div>
        )}
      </div>

      {/* 푸터 정보 */}
      <div style={{
        marginTop: '1.5rem',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem'
      }}>
        <p>💡 {
          activeTab === 'ui' ? '왼쪽에서 YAML을 편집하면 오른쪽 UI에 즉시 반영됩니다.' :
            activeTab === 'formula' ? '수식을 입력하고 [등록] 버튼을 눌러 변수로 활용하세요.' :
              '등록된 모든 파라미터의 상세 정보와 현재 값을 확인할 수 있습니다.'
        }</p>
      </div>
    </div>
  );
}

export default App;

// 탭 아이템 컴포넌트
function TabItem({ id, label, activeTab, onClick }) {
  const isActive = activeTab === id;
  return (
    <div
      onClick={() => onClick(id)}
      style={{
        cursor: 'pointer',
        fontSize: '1.2rem',
        fontWeight: '700',
        color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
        borderBottom: isActive ? '4px solid var(--accent-primary)' : '4px solid transparent',
        paddingBottom: '0.75rem',
        transition: 'all 0.3s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem'
      }}
    >
      {label}
    </div>
  );
}
