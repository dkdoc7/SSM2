import React, { useState } from 'react';
import DynamicField from './DynamicField';
import Modal from './Modal';

export default function DynamicUI({ parameters }) {
    const [values, setValues] = useState({});
    const [hoveredParam, setHoveredParam] = useState(null);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '' });

    const showModal = (title, message) => {
        setModalConfig({ isOpen: true, title, message });
    };

    if (!parameters || Object.keys(parameters).length === 0) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-secondary)'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👈</div>
                <div style={{ fontSize: '1.1rem' }}>왼쪽에 YAML 파라미터를 정의하세요</div>
                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                    변경사항이 실시간으로 여기에 반영됩니다
                </div>
            </div>
        );
    }

    const handleValueChange = (key, newValue) => {
        setValues(prev => ({
            ...prev,
            [key]: newValue
        }));
    };

    // 수식 평가 함수
    const evaluateExpression = (expression, context) => {
        if (!expression || typeof expression !== 'string') return expression;

        // 괄호로 감싸진 수식인지 확인
        const trimmed = expression.trim();
        if (!trimmed.startsWith('(') || !trimmed.endsWith(')')) {
            return expression;
        }

        try {
            // 괄호 제거
            const formula = trimmed.slice(1, -1).trim();

            // 컨텍스트의 키와 값 추출
            const keys = Object.keys(context);
            const vals = Object.values(context);

            // Function 생성자로 수식 평가
            const result = new Function(...keys, `return ${formula}`)(...vals);

            // 결과가 유효한 숫자인지 확인
            if (typeof result === 'number' && !isNaN(result)) {
                // 부동소수점 오차 제거를 위해 소수점 10자리로 반올림
                return Math.round(result * 1e10) / 1e10;
            }
            return { value: null, error: '수식 결과가 유효한 숫자가 아닙니다' };
        } catch (e) {
            console.warn(`Expression evaluation failed for "${expression}":`, e);
            return { value: null, error: `수식 오류: ${e.message}` };
        }
    };

    const getValue = (param) => {
        if (values[param.key] !== undefined) {
            return values[param.key];
        }
        return param.Default !== undefined ? param.Default : '';
    };

    // 모든 파라미터의 현재 값을 포함하는 컨텍스트 생성 (조건 및 수식 평가용)
    const context = {};
    const expressionErrors = {}; // 수식 오류 메시지 저장
    Object.entries(parameters).forEach(([key, param]) => {
        const rawValue = getValue({ key, ...param });
        // 수식이 아닌 일반 값만 컨텍스트에 추가 (순환 참조 방지)
        context[key] = typeof rawValue === 'string' && rawValue.startsWith('(')
            ? null
            : rawValue;
    });

    // 두 번째 패스: 수식 평가
    Object.entries(parameters).forEach(([key, param]) => {
        const rawValue = getValue({ key, ...param });
        if (typeof rawValue === 'string' && rawValue.startsWith('(')) {
            const result = evaluateExpression(rawValue, context);
            if (result && typeof result === 'object' && result.error) {
                // 오류 발생
                context[key] = result.value;
                expressionErrors[key] = result.error;
            } else {
                // 정상 결과
                context[key] = result;
            }
        }
    });

    // 조건 평가 함수
    const isVisible = (condition) => {
        if (!condition) return true;
        try {
            // 변수 이름이 숫자나 특수문자로 시작할 수 있으므로 context를 활용
            const keys = Object.keys(context);
            const vals = Object.values(context);
            // 조건을 안전하게 평가하기 위해 Function 생성자 사용
            return new Function(...keys, `return ${condition}`)(...vals);
        } catch (e) {
            console.warn(`Condition evaluation failed for "${condition}":`, e);
            return true; // 오류 발생 시 기본적으로 표시
        }
    };

    return (
        <div>
            <h3 style={{
                fontSize: '1.2rem',
                marginBottom: '1.5rem',
                color: 'var(--accent-primary)',
                borderBottom: '2px solid var(--border-color)',
                paddingBottom: '0.5rem'
            }}>
                ⚙️ 동적 UI
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {Object.entries(parameters).map(([key, param]) => {
                    const rawValue = getValue({ key, ...param });
                    // 컨텍스트에서 평가된 값 가져오기 (수식이 있으면 계산된 값)
                    const currentValue = context[key] !== undefined ? context[key] : rawValue;
                    const showTooltip = hoveredParam === key;

                    // 수식 평가 실패 여부 확인
                    const isExpressionInvalid = typeof rawValue === 'string'
                        && rawValue.startsWith('(')
                        && currentValue === null;

                    // 조건 확인
                    if (!isVisible(param.Condition)) return null;

                    return (
                        <div
                            key={key}
                            style={{
                                padding: '0.4rem 0',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.01)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            {/* 한 줄 배치 컨테이너 */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                width: '100%'
                            }}>
                                {/* 1. 라벨 (이름이 _로 시작하면 숨김 처리) */}
                                {!key.startsWith('_') && (
                                    <label style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)',
                                        minWidth: '120px',
                                        flexShrink: 0
                                    }}>
                                        {key}
                                    </label>
                                )}

                                {/* 라벨이 숨겨졌을 때 간격을 맞추기 위한 여백 (옵션: 필요 시 추가) */}
                                {key.startsWith('_') && <div style={{ minWidth: '0px' }} />}

                                {/* 2. 입력 필드 (가운데 유연한 공간) */}
                                <div style={{ flex: 1, minWidth: '100px' }}>
                                    <DynamicField
                                        parameter={{
                                            type: param.Type?.toLowerCase() || 'string',
                                            min: param.Range?.[0],
                                            max: param.Range?.[1],
                                            options: param.Options,
                                            Range: param.Range,
                                            isExpressionInvalid: isExpressionInvalid
                                        }}
                                        value={currentValue}
                                        onChange={(newValue) => handleValueChange(key, newValue)}
                                    />
                                </div>

                                {/* 3. 단위 표시 (입력 필드 바로 뒤) */}
                                {param.Unit && (
                                    <div style={{
                                        fontSize: '0.95rem',
                                        color: 'var(--text-primary)',
                                        fontWeight: '500',
                                        minWidth: '30px',
                                        textAlign: 'left',
                                        flexShrink: 0
                                    }}>
                                        {param.Unit}
                                    </div>
                                )}

                                {/* 4. 정보 아이콘 (맨 오른쪽) */}
                                {param.Description && (
                                    <div
                                        style={{ position: 'relative', flexShrink: 0 }}
                                        onMouseEnter={() => setHoveredParam(key)}
                                        onMouseLeave={() => setHoveredParam(null)}
                                    >
                                        <div style={{
                                            width: '17px',
                                            height: '17px',
                                            borderRadius: '50%',
                                            border: '1px solid var(--border-color)',
                                            background: 'white',
                                            color: 'var(--text-secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.6rem',
                                            fontWeight: '500',
                                            cursor: 'help',
                                            transition: 'all 0.2s'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                                e.currentTarget.style.color = 'var(--accent-primary)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                                e.currentTarget.style.color = 'var(--text-secondary)';
                                            }}
                                        >
                                            i
                                        </div>

                                        {/* 툴팁 (그림과 유사한 다크 스타일) */}
                                        {showTooltip && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '100%',
                                                right: '0',
                                                marginBottom: '10px',
                                                minWidth: '150px',
                                                padding: '0.6rem 1rem',
                                                background: 'rgba(0, 0, 0, 0.75)',
                                                color: 'white',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                                zIndex: 1000,
                                                fontSize: '0.85rem',
                                                textAlign: 'center',
                                                animation: 'fadeIn 0.2s'
                                            }}>
                                                <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                                                    {param.Description}
                                                </div>
                                                {param.Range && (
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                                        ({param.Range[0]}~{param.Range[1]} {param.Unit})
                                                    </div>
                                                )}
                                                {/* 말꼬리 모양 */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    right: '10px',
                                                    width: 0,
                                                    height: 0,
                                                    borderLeft: '6px solid transparent',
                                                    borderRight: '6px solid transparent',
                                                    borderTop: '6px solid rgba(0, 0, 0, 0.75)'
                                                }}></div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* 수식 오류 메시지 표시 (한 줄 배치 아래) */}
                            {expressionErrors[key] && (
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: 'tomato',
                                    marginTop: '0.25rem',
                                    marginLeft: !key.startsWith('_') ? '120px' : '0',
                                    fontStyle: 'italic'
                                }}>
                                    ⚠️ {expressionErrors[key]}
                                </div>
                            )}

                            {/* 하단 메타 정보 제거 (필요시 툴팁 확인) */}
                        </div>
                    );
                })}
            </div>

            {/* 저장 버튼 */}
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => {
                        console.log('Current values:', values);
                        showModal(
                            '💾 파라미터 저장 완료',
                            '설정하신 파라미터 값이 성공적으로 저장되었습니다.'
                        );
                    }}
                >
                    💾 저장
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={() => {
                        setValues({});
                        showModal(
                            '🔄 초기화 완료',
                            '모든 파라미터가 초기값으로 재설정되었습니다.'
                        );
                    }}
                >
                    🔄 초기화
                </button>
            </div>

            {/* 커스텀 알림 모달 */}
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                title={modalConfig.title}
            >
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <p style={{ fontSize: '1.1rem' }}>{modalConfig.message}</p>
                </div>
            </Modal>
        </div>
    );
}
