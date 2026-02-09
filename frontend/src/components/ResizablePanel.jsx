import React, { useState, useRef, useEffect } from 'react';

export default function ResizablePanel({ leftContent, rightContent }) {
    const [leftWidth, setLeftWidth] = useState(40); // 왼쪽 패널 너비 (%)
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        e.preventDefault();
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

        // 최소/최대 너비 제한 (20% ~ 80%)
        if (newLeftWidth >= 20 && newLeftWidth <= 80) {
            setLeftWidth(newLeftWidth);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging]);

    return (
        <div
            ref={containerRef}
            style={{
                display: 'flex',
                height: 'calc(100vh - 200px)',
                gap: '0',
                position: 'relative'
            }}
        >
            {/* 왼쪽 패널 - 파라미터 정의 */}
            <div
                style={{
                    width: `${leftWidth}%`,
                    overflowY: 'auto',
                    padding: '1.5rem',
                    background: 'var(--bg-card)',
                    borderRadius: '8px 0 0 8px',
                    border: '1px solid var(--border-color)',
                    borderRight: 'none',
                    boxShadow: 'var(--shadow-card)'
                }}
            >
                {leftContent}
            </div>

            {/* 리사이저 */}
            <div
                onMouseDown={handleMouseDown}
                style={{
                    width: '4px',
                    cursor: 'col-resize',
                    background: isDragging ? 'var(--accent-primary)' : 'var(--border-color)',
                    transition: isDragging ? 'none' : 'background 0.2s',
                    position: 'relative',
                    zIndex: 10
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '20px',
                        height: '40px',
                        background: isDragging ? 'var(--accent-primary)' : 'var(--border-color)',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: 'var(--text-secondary)'
                    }}
                >
                    ⋮
                </div>
            </div>

            {/* 오른쪽 패널 - UI 구성 */}
            <div
                style={{
                    width: `${100 - leftWidth}%`,
                    overflowY: 'auto',
                    padding: '1.5rem',
                    background: 'var(--bg-card)',
                    borderRadius: '0 8px 8px 0',
                    border: '1px solid var(--border-color)',
                    borderLeft: 'none',
                    boxShadow: 'var(--shadow-card)'
                }}
            >
                {rightContent}
            </div>
        </div>
    );
}
