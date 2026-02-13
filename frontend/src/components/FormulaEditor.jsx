import React, { useState, useRef, useEffect } from 'react';

export default function FormulaEditor({ parameters }) {
    const [formula, setFormula] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
    const [evaluationResult, setEvaluationResult] = useState(null);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // 파라미터 키 목록 추출
    const availableVariables = parameters ? Object.keys(parameters) : [];

    // 현재 커서 위치에서 입력 중인 단어 추출
    const getCurrentWord = (text, position) => {
        const beforeCursor = text.substring(0, position);
        const matches = beforeCursor.match(/[a-zA-Z_][a-zA-Z0-9_]*$/);
        return matches ? matches[0] : '';
    };

    // 수식 입력 처리
    const handleFormulaChange = (e) => {
        const newFormula = e.target.value;
        const newCursorPosition = e.target.selectionStart;

        setFormula(newFormula);
        setCursorPosition(newCursorPosition);

        // 현재 입력 중인 단어 찾기
        const currentWord = getCurrentWord(newFormula, newCursorPosition);

        if (currentWord.length > 0) {
            // 변수 자동완성 제안
            const matchedVars = availableVariables.filter(v =>
                v.toLowerCase().startsWith(currentWord.toLowerCase())
            );

            if (matchedVars.length > 0) {
                setSuggestions(matchedVars);
                setShowSuggestions(true);
                setSelectedSuggestionIndex(0);
            } else {
                setShowSuggestions(false);
            }
        } else {
            setShowSuggestions(false);
        }

        // 수식 평가
        evaluateFormula(newFormula);
    };

    // 자동완성 선택
    const selectSuggestion = (suggestion) => {
        const currentWord = getCurrentWord(formula, cursorPosition);
        const beforeWord = formula.substring(0, cursorPosition - currentWord.length);
        const afterCursor = formula.substring(cursorPosition);

        const newFormula = beforeWord + suggestion + afterCursor;
        const newCursorPosition = beforeWord.length + suggestion.length;

        setFormula(newFormula);
        setShowSuggestions(false);

        // 포커스 복원 및 커서 위치 설정
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
            }
        }, 0);

        evaluateFormula(newFormula);
    };

    // 키보드 이벤트 처리
    const handleKeyDown = (e) => {
        if (!showSuggestions) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedSuggestionIndex(prev =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : 0);
        } else if (e.key === 'Enter' && suggestions.length > 0) {
            e.preventDefault();
            selectSuggestion(suggestions[selectedSuggestionIndex]);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    // 수식 평가 함수
    const evaluateFormula = (formulaText) => {
        if (!formulaText.trim()) {
            setError(null);
            setEvaluationResult(null);
            return;
        }

        if (!parameters) {
            setError('파라미터가 정의되지 않았습니다.');
            setEvaluationResult(null);
            return;
        }

        try {
            // 변수 유효성 검사
            const variablesInFormula = formulaText.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
            const invalidVars = variablesInFormula.filter(v => !availableVariables.includes(v));

            if (invalidVars.length > 0) {
                setError(`미등록 변수: ${invalidVars.join(', ')}`);
                setEvaluationResult(null);
                return;
            }

            // 현재 파라미터 값으로 컨텍스트 생성
            const context = {};
            Object.entries(parameters).forEach(([key, param]) => {
                const value = param.Default;
                context[key] = typeof value === 'number' ? value : 0;
            });

            // 수식 평가
            const keys = Object.keys(context);
            const values = Object.values(context);
            const result = new Function(...keys, `return ${formulaText}`)(...values);

            if (typeof result === 'number' && !isNaN(result)) {
                setEvaluationResult({
                    value: result,
                    usedVariables: variablesInFormula.filter((v, i, arr) => arr.indexOf(v) === i),
                    context
                });
                setError(null);
            } else {
                setError('수식 결과가 유효한 숫자가 아닙니다.');
                setEvaluationResult(null);
            }
        } catch (err) {
            setError(`구문 오류: ${err.message}`);
            setEvaluationResult(null);
        }
    };

    // 수식 상태에 따른 스타일
    const getInputStyle = () => {
        if (error) return { borderColor: 'var(--accent-danger)', background: 'rgba(239, 68, 68, 0.05)' };
        if (evaluationResult) return { borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.05)' };
        return {};
    };

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            background: 'var(--bg-card)'
        }}>
            {/* 헤더 */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid var(--border-color)'
            }}>
                <h3 style={{
                    fontSize: '1.1rem',
                    color: 'var(--accent-primary)',
                    margin: 0
                }}>
                    🧮 수식 편집기
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {availableVariables.length}개 변수 사용 가능
                </div>
            </div>

            {/* 수식 입력 영역 */}
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <input
                    ref={inputRef}
                    type="text"
                    value={formula}
                    onChange={handleFormulaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="수식을 입력하세요 (예: A_Volt + B_Volt * 2)"
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '1rem',
                        border: '2px solid var(--border-color)',
                        borderRadius: '6px',
                        outline: 'none',
                        fontFamily: 'Monaco, Menlo, "Courier New", monospace',
                        transition: 'all 0.3s',
                        textAlign: 'left',
                        ...getInputStyle()
                    }}
                />

                {/* VS Code 스타일 자동완성 드롭다운 */}
                {showSuggestions && suggestions.length > 0 && (
                    <div
                        ref={suggestionsRef}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '4px',
                            background: '#1e1e1e',
                            border: '1px solid #454545',
                            borderRadius: '4px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                            zIndex: 1000,
                            maxHeight: '300px',
                            overflowY: 'auto',
                            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                        }}
                    >
                        {suggestions.map((suggestion, index) => {
                            const param = parameters[suggestion];
                            const typeMap = {
                                'Double': { icon: '🔢', color: '#4EC9B0', label: 'number' },
                                'Integer': { icon: '🔢', color: '#4EC9B0', label: 'int' },
                                'String': { icon: '📝', color: '#CE9178', label: 'string' },
                                'Boolean': { icon: '✓', color: '#569CD6', label: 'bool' },
                                'Group': { icon: '📁', color: '#DCDCAA', label: 'group' }
                            };
                            const typeInfo = typeMap[param?.Type] || { icon: '📌', color: '#9CDCFE', label: 'var' };

                            return (
                                <div
                                    key={suggestion}
                                    onClick={() => selectSuggestion(suggestion)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0.5rem 0.75rem',
                                        cursor: 'pointer',
                                        background: index === selectedSuggestionIndex ? '#094771' : 'transparent',
                                        borderLeft: index === selectedSuggestionIndex ? '3px solid #007ACC' : '3px solid transparent',
                                        transition: 'all 0.1s'
                                    }}
                                    onMouseEnter={() => setSelectedSuggestionIndex(index)}
                                >
                                    {/* 아이콘 */}
                                    <span style={{
                                        fontSize: '1rem',
                                        marginRight: '0.5rem',
                                        width: '20px',
                                        textAlign: 'center'
                                    }}>
                                        {typeInfo.icon}
                                    </span>

                                    {/* 변수명 */}
                                    <span style={{
                                        flex: 1,
                                        color: '#9CDCFE',
                                        fontFamily: 'Monaco, Menlo, "Courier New", monospace',
                                        fontSize: '0.9rem',
                                        fontWeight: '500'
                                    }}>
                                        {suggestion}
                                    </span>

                                    {/* 타입 배지 */}
                                    <span style={{
                                        padding: '0.15rem 0.4rem',
                                        background: 'rgba(255,255,255,0.1)',
                                        color: typeInfo.color,
                                        fontSize: '0.7rem',
                                        borderRadius: '3px',
                                        marginRight: '0.5rem',
                                        fontWeight: '600',
                                        textTransform: 'uppercase'
                                    }}>
                                        {typeInfo.label}
                                    </span>

                                    {/* 현재 값 */}
                                    <span style={{
                                        color: '#858585',
                                        fontSize: '0.85rem',
                                        fontFamily: 'Monaco, Menlo, monospace',
                                        minWidth: '60px',
                                        textAlign: 'right'
                                    }}>
                                        {param?.Default ?? 'N/A'}
                                    </span>

                                    {/* 키보드 힌트 (선택된 항목에만 표시) */}
                                    {index === selectedSuggestionIndex && (
                                        <span style={{
                                            marginLeft: '0.75rem',
                                            padding: '0.15rem 0.35rem',
                                            background: 'rgba(255,255,255,0.15)',
                                            color: '#CCCCCC',
                                            fontSize: '0.7rem',
                                            borderRadius: '3px',
                                            fontWeight: '600'
                                        }}>
                                            ⏎
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 결과 및 오류 표시 */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {error && (
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid var(--accent-danger)',
                        borderRadius: '6px',
                        marginBottom: '1rem'
                    }}>
                        <div style={{
                            color: 'var(--accent-danger)',
                            fontWeight: '600',
                            marginBottom: '0.25rem'
                        }}>
                            ⚠️ 오류
                        </div>
                        <div style={{
                            color: 'var(--accent-danger)',
                            fontSize: '0.9rem',
                            fontFamily: 'monospace'
                        }}>
                            {error}
                        </div>
                    </div>
                )}

                {evaluationResult && (
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid #10b981',
                        borderRadius: '6px'
                    }}>
                        <div style={{
                            color: '#10b981',
                            fontWeight: '600',
                            fontSize: '1rem',
                            marginBottom: '0.75rem'
                        }}>
                            ✓ 평가 결과
                        </div>

                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: 'var(--text-primary)',
                            marginBottom: '1rem',
                            fontFamily: 'monospace'
                        }}>
                            = {evaluationResult.value.toFixed(4)}
                        </div>

                        <div style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.5rem',
                            fontWeight: '600'
                        }}>
                            사용된 변수:
                        </div>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem'
                        }}>
                            {evaluationResult.usedVariables.map(variable => (
                                <div
                                    key={variable}
                                    style={{
                                        padding: '0.25rem 0.75rem',
                                        background: 'white',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        fontSize: '0.85rem',
                                        fontFamily: 'monospace'
                                    }}
                                >
                                    <span style={{
                                        color: 'var(--accent-primary)',
                                        fontWeight: '600'
                                    }}>
                                        {variable}
                                    </span>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        {' '}= {evaluationResult.context[variable]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!formula && !error && !evaluationResult && (
                    <div style={{
                        padding: '2rem',
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                        <div>수식을 입력하면 실시간으로 결과가 표시됩니다</div>
                        <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                            변수명 입력 시 자동완성이 지원됩니다
                        </div>
                    </div>
                )}
            </div>

            {/* 간단한 도움말 */}
            <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: '#e3f2fd',
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
            }}>
                <strong>💡 Tip:</strong> 사칙연산(+, -, *, /)과 괄호를 사용할 수 있습니다.
                변수 입력 시 자동완성(↑↓ 키로 선택, Enter로 적용)이 지원됩니다.
            </div>
        </div>
    );
}
