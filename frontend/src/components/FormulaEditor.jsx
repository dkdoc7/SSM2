import React, { useState, useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function FormulaEditor({ parameters, onResultChange }) {
    const [outputVarName, setOutputVarName] = useState('Result_Var');
    const [formula, setFormula] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
    const [evaluationResult, setEvaluationResult] = useState(null);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // 수식 평가 결과를 부모 컴포넌트에 등록
    const handleRegister = () => {
        if (evaluationResult && outputVarName) {
            onResultChange(outputVarName, evaluationResult.value, formula);
        }
    };

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

            // --- 향상된 컨텍스트 생성 (수식 계층 처리) ---
            const context = {};

            // 1단계: 기본 값 채우기
            Object.entries(parameters).forEach(([key, param]) => {
                const val = param.Default;
                // 수식이 아닌 숫자/부울/일반 문자열은 그대로 사용
                if (typeof val !== 'string' || !val.trim().startsWith('(')) {
                    context[key] = typeof val === 'number' ? val : (typeof val === 'boolean' ? val : 0);
                } else {
                    context[key] = 0; // 수식은 일단 0으로 초기화
                }
            });

            // 2단계: 수식으로 정의된 변수들 평가 (간단한 2패스 전략)
            // 실제 상용 앱에서는 순환 참조를 감지하는 유향 그래프(DAG) 처리가 필요하지만 
            // 여기서는 단순 수식 변수를 위해 evaluateExpression 로직을 활용합니다.
            Object.entries(parameters).forEach(([key, param]) => {
                const val = param.Default;
                if (typeof val === 'string' && val.trim().startsWith('(')) {
                    const innerFormula = val.trim().slice(1, -1).trim();
                    try {
                        const keys = Object.keys(context);
                        const vals = Object.values(context);
                        const result = new Function(...keys, `return ${innerFormula}`)(...vals);
                        if (typeof result === 'number' && !isNaN(result)) {
                            context[key] = result;
                        }
                    } catch (e) {
                        console.warn(`Failed to pre-evaluate ${key}:`, e);
                    }
                }
            });

            // --- 최종 수식 평가 ---
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

    // 수식을 LaTeX 형식으로 변환
    const convertToLatex = (formulaText) => {
        if (!formulaText) return '';

        // 1. 변수명을 먼저 보호 (\text{...})
        let latex = formulaText;
        const variables = formulaText.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
        const sortedVars = [...new Set(variables)].sort((a, b) => b.length - a.length);

        sortedVars.forEach(variable => {
            const escapedVar = variable.replace(/_/g, '\\_');
            latex = latex.replace(new RegExp(`\\b${variable}\\b`, 'g'), `\\text{${escapedVar}}`);
        });

        // 2. 분수 처리 (a / b -> \frac{a}{b})
        // 중첩 괄호를 지원하기 위한 정규식 (최대 3단계 중첩 지원)
        // term1: 괄호로 묶인 식
        const nestedParen = '\\((?:[^()]|\\((?:[^()]|\\([^()]*\\))*\\))*\\)';
        // term2: \text{...}로 보호된 변수, 숫자, 소수점
        const simpleTerm = '\\\\text\\{[^{}]+\\}|[a-zA-Z0-9.\\_]+';
        // 전체 항: (항) 또는 (괄호식) 들이 곱셈(*)으로 연결된 것까지 포함
        const baseTerm = `(?:${nestedParen}|${simpleTerm})`;
        const fullTerm = `${baseTerm}(?:\\s*\\*\\s*${baseTerm})*`;

        let prevLatex;
        let iteration = 0;
        // 최대 10번 반복하여 중첩 분수 처리
        do {
            prevLatex = latex;
            const fractionRegex = new RegExp(`(${fullTerm})\\s*\\/\\s*(${fullTerm})`, 'g');

            latex = latex.replace(fractionRegex, (match, p1, p2) => {
                // 양 끝의 불필요한 괄호 제거 로직
                let num = p1.trim();
                let den = p2.trim();

                // 분자/분모 전체가 괄호로 감싸져 있다면 제거
                if (num.startsWith('(') && num.endsWith(')')) {
                    // 내부 괄호가 짝이 맞는지 확인 후 제거
                    num = num.slice(1, -1);
                }
                if (den.startsWith('(') && den.endsWith(')')) {
                    den = den.slice(1, -1);
                }

                return `\\frac{${num}}{${den}}`;
            });
            iteration++;
        } while (latex !== prevLatex && iteration < 10);

        // 3. 나머지 연산자 처리
        latex = latex
            .replace(/\*/g, ' \\times ')
            .replace(/\+/g, ' + ')
            .replace(/-/g, ' - ');

        // 남은 / 가 있다면 (정규식에 안 걸린 경우) \div로 변경
        latex = latex.replace(/\//g, ' \\div ');

        return latex;
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{
                        fontSize: '1.1rem',
                        color: 'var(--accent-primary)',
                        margin: 0
                    }}>
                        🧮 수식 편집기
                    </h3>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {availableVariables.length}개 변수 사용 가능
                </div>
            </div>

            {/* 출력 변수 및 수식 입력 영역 */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'nowrap' }}>
                {/* 출력 변수명 입력 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <input
                        type="text"
                        value={outputVarName}
                        onChange={(e) => setOutputVarName(e.target.value)}
                        placeholder="출력 변수명"
                        style={{
                            width: '140px',
                            padding: '0.75rem 0.5rem',
                            fontSize: '0.95rem',
                            border: '2px solid var(--border-color)',
                            borderRadius: '6px',
                            outline: 'none',
                            fontFamily: 'monospace',
                            textAlign: 'center',
                            fontWeight: '700',
                            color: 'var(--accent-primary)',
                            background: 'rgba(52, 152, 219, 0.05)'
                        }}
                    />
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>=</span>
                </div>

                {/* 수식 입력 필드 */}
                <div style={{ position: 'relative', flex: 1 }}>
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
                            background: 'white',
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
                                        <span style={{ fontSize: '1rem', marginRight: '0.5rem', width: '20px', textAlign: 'center' }}>
                                            {typeInfo.icon}
                                        </span>
                                        <span style={{ flex: 1, color: '#9CDCFE', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                            {suggestion}
                                        </span>
                                        <span style={{ padding: '0.15rem 0.4rem', background: 'rgba(255,255,255,0.1)', color: typeInfo.color, fontSize: '0.7rem', borderRadius: '3px', marginRight: '0.5rem' }}>
                                            {typeInfo.label}
                                        </span>
                                        <span style={{ color: '#858585', fontSize: '0.85rem', fontFamily: 'monospace', minWidth: '60px', textAlign: 'right' }}>
                                            {param?.Default ?? 'N/A'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 등록 버튼 */}
                <button
                    onClick={handleRegister}
                    disabled={!evaluationResult || !outputVarName}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: evaluationResult ? 'var(--accent-primary)' : 'var(--border-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: evaluationResult ? 'pointer' : 'not-allowed',
                        fontWeight: '600',
                        transition: 'all 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: evaluationResult ? '0 4px 10px rgba(52, 152, 219, 0.3)' : 'none'
                    }}
                >
                    📥 등록
                </button>
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
                        <div style={{ color: 'var(--accent-danger)', fontWeight: '600', marginBottom: '0.25rem' }}>⚠️ 오류</div>
                        <div style={{ color: 'var(--accent-danger)', fontSize: '0.9rem', fontFamily: 'monospace' }}>{error}</div>
                    </div>
                )}

                {evaluationResult && (
                    <div style={{
                        padding: '1.25rem',
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid #10b981',
                        borderRadius: '8px'
                    }}>
                        <div style={{ color: '#10b981', fontWeight: '700', fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>✓</span> 평가 결과
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            {/* 왼쪽 컬럼 */}
                            <div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.25rem', fontFamily: 'monospace' }}>
                                    {outputVarName} = {evaluationResult.value.toFixed(4)}
                                </div>

                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: '700' }}>사용된 변수 목록:</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {evaluationResult.usedVariables.map(variable => (
                                        <div key={variable} style={{ padding: '0.6rem 0.8rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                                            <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{variable}</span>
                                            <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>= {evaluationResult.context[variable]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 우측 컬럼: LaTeX */}
                            <div style={{ display: 'flex', flexDirection: 'column', background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>LaTeX Preview</div>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} dangerouslySetInnerHTML={{ __html: katex.renderToString(`${outputVarName} = ${convertToLatex(formula)}`, { throwOnError: false, displayMode: true }) }} />
                                <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', background: '#f8f9fa', padding: '0.75rem', borderRadius: '4px', border: '1px solid #eee', overflowX: 'auto' }}>
                                    {outputVarName} = {convertToLatex(formula)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!formula && !error && !evaluationResult && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>수식을 입력하면 실시간으로 결과가 표시됩니다</div>
                        <div style={{ fontSize: '0.85rem', marginTop: '0.75rem', opacity: 0.8 }}>변수명을 입력하면 VS Code 스타일의 자동완성이 나타납니다</div>
                    </div>
                )}
            </div>

            {/* 하단 팁 */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(52, 152, 219, 0.08)', borderLeft: '4px solid var(--accent-primary)', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>💡</span>
                <div>
                    <strong>Tip:</strong> 사칙연산과 괄호, 변수명을 자유롭게 조합하세요. 계산 결과를 <strong>[등록]</strong> 버튼으로 상단 UI에 반영할 수 있습니다.
                </div>
            </div>
        </div>
    );
}
