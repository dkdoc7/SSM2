import React, { useState, useEffect } from 'react';
import yaml from 'js-yaml';

export default function YamlEditor({ initialYaml, onChange }) {
    const [yamlText, setYamlText] = useState(initialYaml);
    const [error, setError] = useState(null);

    useEffect(() => {
        setYamlText(initialYaml);
    }, [initialYaml]);

    const handleChange = (e) => {
        const newYaml = e.target.value;
        setYamlText(newYaml);

        try {
            const parsed = yaml.load(newYaml);
            setError(null);
            onChange(parsed, newYaml);
        } catch (err) {
            setError(err.message);
            onChange(null, newYaml);
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid var(--border-color)'
            }}>
                <h3 style={{
                    fontSize: '1.2rem',
                    color: 'var(--accent-primary)',
                    margin: 0
                }}>
                    📝 YAML 파라미터 정의
                </h3>
                {error && (
                    <span style={{
                        fontSize: '0.8rem',
                        color: 'var(--accent-danger)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px'
                    }}>
                        ⚠️ 구문 오류
                    </span>
                )}
            </div>

            <textarea
                value={yamlText}
                onChange={handleChange}
                spellCheck={false}
                style={{
                    flex: 1,
                    width: '100%',
                    padding: '1rem',
                    background: 'white',
                    border: error ? '1px solid var(--accent-danger)' : '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontFamily: 'Monaco, Menlo, "Courier New", monospace',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    resize: 'none',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                }}
                onFocus={(e) => {
                    if (!error) {
                        e.target.style.borderColor = 'var(--accent-primary)';
                    }
                }}
                onBlur={(e) => {
                    if (!error) {
                        e.target.style.borderColor = 'var(--border-color)';
                    }
                }}
            />

            {error && (
                <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    background: '#fee',
                    border: '1px solid var(--accent-danger)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: 'var(--accent-danger)',
                    fontFamily: 'monospace'
                }}>
                    {error}
                </div>
            )}

            <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: '#e3f2fd',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
            }}>
                <strong>💡 Tip:</strong> YAML 형식으로 파라미터를 정의하세요. 변경사항은 실시간으로 오른쪽 UI에 반영됩니다.
            </div>
        </div>
    );
}
