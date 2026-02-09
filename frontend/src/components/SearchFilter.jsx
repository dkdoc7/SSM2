import React, { useState } from 'react';

export default function SearchFilter({ onSearch, groups, onFilterGroup }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('all');

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch(value);
    };

    const handleGroupFilter = (e) => {
        const value = e.target.value;
        setSelectedGroup(value);
        onFilterGroup(value);
    };

    return (
        <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        🔍 검색
                    </label>
                    <input
                        type="text"
                        placeholder="파라미터 키, 값, 설명으로 검색..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        📁 그룹 필터
                    </label>
                    <select value={selectedGroup} onChange={handleGroupFilter}>
                        <option value="all">전체 그룹</option>
                        {groups.map(group => (
                            <option key={group.id} value={group.id}>
                                {group.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
