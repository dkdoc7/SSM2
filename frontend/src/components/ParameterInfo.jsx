import React from 'react';

export default function ParameterInfo({ groups, selectedGroup, selectedParam, onSelectParam }) {
    return (
        <div>
            <h3 style={{
                fontSize: '1.2rem',
                marginBottom: '1rem',
                color: 'var(--accent-primary)',
                borderBottom: '2px solid var(--border-color)',
                paddingBottom: '0.5rem'
            }}>
                📋 파라미터 정보
            </h3>

            {groups.map(group => (
                <div key={group.id} style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{
                        fontSize: '1rem',
                        color: 'var(--text-primary)',
                        marginBottom: '0.75rem',
                        fontWeight: '600'
                    }}>
                        {group.label}
                    </h4>
                    {group.description && (
                        <p style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.75rem',
                            fontStyle: 'italic'
                        }}>
                            {group.description}
                        </p>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {group.parameters.map(param => {
                            const isSelected = selectedParam?.key === param.key && selectedGroup === group.id;

                            return (
                                <div
                                    key={param.key}
                                    onClick={() => onSelectParam(group.id, param)}
                                    style={{
                                        padding: '0.75rem',
                                        background: isSelected
                                            ? 'rgba(100, 255, 218, 0.1)'
                                            : 'rgba(255, 255, 255, 0.03)',
                                        border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: isSelected ? '0 0 10px rgba(100, 255, 218, 0.2)' : 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                            e.currentTarget.style.borderColor = 'var(--border-hover)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                            e.currentTarget.style.borderColor = 'var(--border-color)';
                                        }
                                    }}
                                >
                                    <div style={{
                                        fontWeight: '600',
                                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                                        marginBottom: '0.25rem',
                                        fontSize: '0.95rem'
                                    }}>
                                        {param.label}
                                    </div>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--text-secondary)',
                                        fontFamily: 'monospace',
                                        marginBottom: '0.25rem'
                                    }}>
                                        {param.key}
                                    </div>
                                    {param.description && (
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--text-secondary)',
                                            marginTop: '0.25rem'
                                        }}>
                                            {param.description}
                                        </div>
                                    )}
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--accent-secondary)',
                                        marginTop: '0.5rem',
                                        display: 'inline-block',
                                        padding: '0.2rem 0.5rem',
                                        background: 'rgba(124, 58, 237, 0.2)',
                                        borderRadius: '4px'
                                    }}>
                                        {param.type}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
