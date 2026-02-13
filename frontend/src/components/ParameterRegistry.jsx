import React from 'react';

export default function ParameterRegistry({ parameters }) {
    if (!parameters) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                등록된 파라미터가 없습니다.
            </div>
        );
    }

    // --- 수식 평가 로직 (내부 컨텍스트 구축 및 평가) ---
    const evaluateExpression = (expression, context) => {
        if (!expression || typeof expression !== 'string') return expression;
        const trimmed = expression.trim();
        // 괄호로 감싸진 경우만 수식으로 취급
        if (!trimmed.startsWith('(') || !trimmed.endsWith(')')) return expression;

        try {
            const formula = trimmed.slice(1, -1).trim();
            const keys = Object.keys(context);
            const vals = Object.values(context);
            // Function 생성자를 이용한 안전한(?) 평가
            const result = new Function(...keys, `return ${formula}`)(...vals);
            return typeof result === 'number' && !isNaN(result) ? result : null;
        } catch (e) {
            return null;
        }
    };

    // 컨텍스트 생성 (1단계: 정적 값 우선 채우기)
    const context = {};
    Object.entries(parameters).forEach(([key, param]) => {
        const val = param.Default;
        // 수식이 아닌 값들(숫자, 불리언, 일반 문자열)을 컨텍스트에 담음
        if (typeof val !== 'string' || !val.trim().startsWith('(')) {
            context[key] = typeof val === 'number' ? val : (typeof val === 'boolean' ? val : 0);
        }
    });

    // 컨텍스트 생성 (2단계: 수식 값 평가하여 덮어쓰기)
    Object.entries(parameters).forEach(([key, param]) => {
        const val = param.Default;
        if (typeof val === 'string' && val.trim().startsWith('(')) {
            const result = evaluateExpression(val, context);
            context[key] = result !== null ? result : 0;
        }
    });

    const paramEntries = Object.entries(parameters);

    return (
        <div style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
            {/* 상단 헤더 */}
            <div style={{
                verticalAlign: 'middle',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                    📋 파라미터 레지스트리
                </h2>
                <div style={{
                    background: 'rgba(52, 152, 219, 0.05)',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '30px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: 'var(--accent-primary)',
                    border: '1px solid rgba(52, 152, 219, 0.2)'
                }}>
                    총 {paramEntries.length}개 변수 등록됨
                </div>
            </div>

            {/* 테이블 컨테이너 */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    fontSize: '0.95rem'
                }}>
                    <thead>
                        <tr style={{ background: '#fcfcfc', borderBottom: '2px solid var(--border-color)' }}>
                            <th style={headerStyle}>변수명</th>
                            <th style={headerStyle}>현재 값 (수식 포함)</th>
                            <th style={headerStyle}>타입</th>
                            <th style={headerStyle}>출처</th>
                            <th style={headerStyle}>설명 및 제약조건</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paramEntries.map(([key, param], index) => {
                            // 현재 행의 최종 표시 값 결정
                            const isFormula = param.Formula || (typeof param.Default === 'string' && param.Default.trim().startsWith('('));
                            const evaluatedValue = context[key] !== undefined ? context[key] : param.Default;
                            const formulaString = param.Formula || (isFormula ? param.Default : null);

                            return (
                                <tr
                                    key={key}
                                    style={{
                                        borderBottom: index === paramEntries.length - 1 ? 'none' : '1px solid #f0f0f0',
                                        transition: 'all 0.2s'
                                    }}
                                    className="registry-row"
                                >
                                    <td style={{ ...cellStyle, fontWeight: '700', color: 'var(--accent-primary)', fontFamily: 'monospace', fontSize: '1rem' }}>
                                        {key}
                                    </td>
                                    <td style={cellStyle}>
                                        {formatValue(evaluatedValue, formulaString, param.Unit)}
                                    </td>
                                    <td style={cellStyle}>
                                        <span style={{
                                            padding: '0.25rem 0.6rem',
                                            background: '#f1f3f5',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            color: '#495057'
                                        }}>
                                            {param.Type}
                                        </span>
                                    </td>
                                    <td style={cellStyle}>
                                        <span style={{
                                            padding: '0.25rem 0.6rem',
                                            background: param.IsCalculated ? 'rgba(52, 152, 219, 0.12)' : 'rgba(155, 89, 182, 0.12)',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            fontWeight: '800',
                                            color: param.IsCalculated ? 'var(--accent-primary)' : '#9b59b6',
                                            border: param.IsCalculated ? '1px solid rgba(52, 152, 219, 0.1)' : '1px solid rgba(155, 89, 182, 0.1)'
                                        }}>
                                            {param.IsCalculated ? 'CALCULATED' : 'YAML'}
                                        </span>
                                    </td>
                                    <td style={{ ...cellStyle, maxWidth: '400px' }}>
                                        <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '0.4rem', lineHeight: '1.4' }}>
                                            {param.Description || '-'}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <style>
                {`
                .registry-row:hover {
                    background-color: #f8fbff !important;
                }
                `}
            </style>
        </div>
    );
}

const formatValue = (val, formula, unit) => {
    // 수식이 있는 경우: (수식) = 결과값 + 단위
    if (formula) {
        const isYamlFormula = formula.startsWith('(');
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: isYamlFormula ? 'rgba(155, 89, 182, 0.04)' : '#f0f7ff',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                border: isYamlFormula ? '1px solid rgba(155, 89, 182, 0.1)' : '1px solid rgba(52, 152, 219, 0.1)'
            }}>
                <span style={{ fontSize: '0.95rem', color: isYamlFormula ? '#9b59b6' : 'var(--accent-primary)', fontFamily: 'monospace', fontWeight: '500' }}>
                    {formula}
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#666' }}>=</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                    {formatNumericValue(val)}{unit}
                </span>
            </div>
        );
    }

    // 일반 값 표시
    if (typeof val === 'boolean') return <span style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: 'monospace' }}>{val ? 'True' : 'False'}</span>;
    return (
        <span style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'monospace' }}>
            {formatNumericValue(val)}{unit}
        </span>
    );
};

const formatNumericValue = (val) => {
    if (typeof val !== 'number') return val;
    if (Number.isInteger(val)) return val.toString();
    return val.toFixed(4).replace(/\.?0+$/, '');
};

const headerStyle = {
    padding: '1.5rem',
    fontWeight: '700',
    color: '#666',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    whiteSpace: 'nowrap'
};

const cellStyle = {
    padding: '1.5rem',
    verticalAlign: 'middle'
};
