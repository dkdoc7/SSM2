import React, { useState } from 'react';
import DynamicField from './DynamicField';

export default function ParameterList({ groups, onUpdate, onDelete, searchTerm, selectedGroup }) {
    const [editingParam, setEditingParam] = useState(null);
    const [editValue, setEditValue] = useState(null);
    const [expandedGroups, setExpandedGroups] = useState(new Set(groups.map(g => g.id)));

    const toggleGroup = (groupId) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupId)) {
            newExpanded.delete(groupId);
        } else {
            newExpanded.add(groupId);
        }
        setExpandedGroups(newExpanded);
    };

    const startEdit = (groupId, param) => {
        setEditingParam(`${groupId}-${param.key}`);
        setEditValue(param.value);
    };

    const saveEdit = async (groupId, paramKey) => {
        try {
            await onUpdate(groupId, paramKey, editValue);
            setEditingParam(null);
            setEditValue(null);
        } catch (error) {
            alert('업데이트 실패: ' + error.message);
        }
    };

    const cancelEdit = () => {
        setEditingParam(null);
        setEditValue(null);
    };

    const handleDelete = async (groupId, paramKey) => {
        if (confirm(`정말로 "${paramKey}" 파라미터를 삭제하시겠습니까?`)) {
            try {
                await onDelete(groupId, paramKey);
            } catch (error) {
                alert('삭제 실패: ' + error.message);
            }
        }
    };

    const filterParameters = (parameters) => {
        if (!searchTerm) return parameters;

        return parameters.filter(param =>
            param.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            param.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (param.description && param.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            String(param.value).toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const filteredGroups = selectedGroup === 'all'
        ? groups
        : groups.filter(g => g.id === selectedGroup);

    return (
        <div>
            {filteredGroups.map(group => {
                const filteredParams = filterParameters(group.parameters);
                if (filteredParams.length === 0 && searchTerm) return null;

                return (
                    <div key={group.id} className="card fade-in" style={{ marginBottom: '1.5rem' }}>
                        {/* 그룹 헤더 */}
                        <div
                            onClick={() => toggleGroup(group.id)}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: expandedGroups.has(group.id) ? '1.5rem' : '0'
                            }}
                        >
                            <div>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                                    {expandedGroups.has(group.id) ? '▼' : '▶'} {group.label}
                                </h2>
                                {group.description && (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        {group.description}
                                    </p>
                                )}
                            </div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                {filteredParams.length}개 파라미터
                            </span>
                        </div>

                        {/* 파라미터 목록 */}
                        {expandedGroups.has(group.id) && (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {filteredParams.map(param => {
                                    const isEditing = editingParam === `${group.id}-${param.key}`;

                                    return (
                                        <div
                                            key={param.key}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                padding: '1rem',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(100, 255, 218, 0.1)'
                                            }}
                                        >
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '1rem', alignItems: 'center' }}>
                                                {/* 파라미터 정보 */}
                                                <div>
                                                    <div style={{ fontWeight: '600', color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>
                                                        {param.label}
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                                        {param.key}
                                                    </div>
                                                    {param.description && (
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                            {param.description}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 값 편집 */}
                                                <div>
                                                    {isEditing ? (
                                                        <DynamicField
                                                            parameter={param}
                                                            value={editValue}
                                                            onChange={setEditValue}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            padding: '0.5rem',
                                                            background: 'rgba(100, 255, 218, 0.05)',
                                                            borderRadius: '4px',
                                                            fontFamily: param.type === 'boolean' ? 'inherit' : 'monospace'
                                                        }}>
                                                            {param.type === 'boolean'
                                                                ? (param.value ? '✅ 활성화' : '❌ 비활성화')
                                                                : typeof param.value === 'object'
                                                                    ? JSON.stringify(param.value)
                                                                    : String(param.value)
                                                            }
                                                            <span style={{
                                                                marginLeft: '0.5rem',
                                                                fontSize: '0.8rem',
                                                                color: 'var(--text-secondary)'
                                                            }}>
                                                                ({param.type})
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 액션 버튼 */}
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    {isEditing ? (
                                                        <>
                                                            <button
                                                                className="btn btn-primary"
                                                                onClick={() => saveEdit(group.id, param.key)}
                                                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                                            >
                                                                저장
                                                            </button>
                                                            <button
                                                                className="btn btn-secondary"
                                                                onClick={cancelEdit}
                                                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                                            >
                                                                취소
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                className="btn btn-secondary"
                                                                onClick={() => startEdit(group.id, param)}
                                                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                                            >
                                                                ✏️ 수정
                                                            </button>
                                                            <button
                                                                className="btn btn-danger"
                                                                onClick={() => handleDelete(group.id, param.key)}
                                                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                                            >
                                                                🗑️
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
