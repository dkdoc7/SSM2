import React, { useState, useEffect } from 'react';
import DynamicField from './DynamicField';

export default function ParameterUI({ selectedGroup, selectedParam, onUpdate, onDelete }) {
    const [editValue, setEditValue] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (selectedParam) {
            setEditValue(selectedParam.value);
            setIsEditing(false);
        }
    }, [selectedParam]);

    if (!selectedParam) {
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
                <div style={{ fontSize: '1.1rem' }}>왼쪽에서 파라미터를 선택하세요</div>
            </div>
        );
    }

    const handleSave = async () => {
        try {
            await onUpdate(selectedGroup, selectedParam.key, editValue);
            setIsEditing(false);
        } catch (error) {
            alert('업데이트 실패: ' + error.message);
        }
    };

    const handleDelete = async () => {
        if (confirm(`정말로 "${selectedParam.label}" 파라미터를 삭제하시겠습니까?`)) {
            try {
                await onDelete(selectedGroup, selectedParam.key);
            } catch (error) {
                alert('삭제 실패: ' + error.message);
            }
        }
    };

    return (
        <div>
            <h3 style={{
                fontSize: '1.2rem',
                marginBottom: '1rem',
                color: 'var(--accent-primary)',
                borderBottom: '2px solid var(--border-color)',
                paddingBottom: '0.5rem'
            }}>
                ⚙️ UI 구성
            </h3>

            {/* 파라미터 헤더 */}
            <div style={{
                background: 'rgba(100, 255, 218, 0.05)',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                border: '1px solid var(--accent-primary)'
            }}>
                <h4 style={{
                    fontSize: '1.3rem',
                    color: 'var(--accent-primary)',
                    marginBottom: '0.5rem'
                }}>
                    {selectedParam.label}
                </h4>
                <div style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    fontFamily: 'monospace'
                }}>
                    {selectedParam.key}
                </div>
            </div>

            {/* 현재 값 표시 */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem',
                    fontWeight: '600'
                }}>
                    현재 값
                </label>
                <div style={{
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontFamily: selectedParam.type === 'boolean' ? 'inherit' : 'monospace',
                    fontSize: '1.1rem',
                    color: 'var(--text-primary)'
                }}>
                    {selectedParam.type === 'boolean'
                        ? (selectedParam.value ? '✅ 활성화 (true)' : '❌ 비활성화 (false)')
                        : typeof selectedParam.value === 'object'
                            ? JSON.stringify(selectedParam.value, null, 2)
                            : String(selectedParam.value)
                    }
                </div>
            </div>

            {/* 값 편집 */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem',
                    fontWeight: '600'
                }}>
                    값 수정
                </label>
                <DynamicField
                    parameter={selectedParam}
                    value={editValue}
                    onChange={setEditValue}
                />
            </div>

            {/* 메타 정보 */}
            {selectedParam.description && (
                <div style={{
                    padding: '1rem',
                    background: 'rgba(124, 58, 237, 0.1)',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    border: '1px solid rgba(124, 58, 237, 0.3)'
                }}>
                    <div style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        fontWeight: '600',
                        marginBottom: '0.25rem'
                    }}>
                        📝 설명
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {selectedParam.description}
                    </div>
                </div>
            )}

            {/* 타입 정보 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                <div style={{
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>타입</div>
                    <div style={{ fontSize: '1rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                        {selectedParam.type}
                    </div>
                </div>

                {selectedParam.min !== undefined && (
                    <div style={{
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>범위</div>
                        <div style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                            {selectedParam.min} ~ {selectedParam.max}
                        </div>
                    </div>
                )}
            </div>

            {/* 액션 버튼 */}
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    style={{ flex: 1 }}
                >
                    💾 저장
                </button>
                <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                >
                    🗑️ 삭제
                </button>
            </div>
        </div>
    );
}
