import React, { useState, useRef, useEffect } from 'react';

export default function ResizablePanel({ leftContent, rightContent, bottomContent }) {
    const [leftWidth, setLeftWidth] = useState(70); // 왼쪽 패널 너비 (%)
    const [bottomHeight, setBottomHeight] = useState(150); // 하단 패널 높이 (px)
    const [isDraggingH, setIsDraggingH] = useState(false); // 좌우 리사이징 상태
    const [isDraggingV, setIsDraggingV] = useState(false); // 상하 리사이징 상태

    const containerRef = useRef(null);
    const topSectionRef = useRef(null);

    const handleMouseDownH = (e) => {
        setIsDraggingH(true);
        e.preventDefault();
    };

    const handleMouseDownV = (e) => {
        setIsDraggingV(true);
        e.preventDefault();
    };

    const handleMouseMove = (e) => {
        if (isDraggingH && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
            if (newLeftWidth >= 20 && newLeftWidth <= 80) {
                setLeftWidth(newLeftWidth);
            }
        }

        if (isDraggingV && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const newBottomHeight = containerRect.bottom - e.clientY;
            // 최소/최대 높이 제한 (50px ~ 400px)
            if (newBottomHeight >= 50 && newBottomHeight <= 400) {
                setBottomHeight(newBottomHeight);
            }
        }
    };

    const handleMouseUp = () => {
        setIsDraggingH(false);
        setIsDraggingV(false);
    };

    useEffect(() => {
        if (isDraggingH || isDraggingV) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = isDraggingH ? 'col-resize' : 'row-resize';
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
    }, [isDraggingH, isDraggingV]);

    return (
        <div
            ref={containerRef}
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100vh - 200px)',
                position: 'relative',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-card)'
            }}
        >
            {/* 상단 섹션 (좌우 분할) */}
            <div
                ref={topSectionRef}
                style={{
                    display: 'flex',
                    flex: 1,
                    minHeight: 0 // 중요: flex 자식의 overflow 허용을 위함
                }}
            >
                {/* 왼쪽 패널 - 파라미터 정의 */}
                <div
                    style={{
                        width: `${leftWidth}%`,
                        overflowY: 'auto',
                        padding: '1.5rem',
                        background: 'var(--bg-card)',
                        borderRight: 'none'
                    }}
                >
                    {leftContent}
                </div>

                {/* 세로 리사이저 (좌우 조절) */}
                <div
                    onMouseDown={handleMouseDownH}
                    style={{
                        width: '4px',
                        cursor: 'col-resize',
                        background: isDraggingH ? 'var(--accent-primary)' : 'var(--border-color)',
                        transition: isDraggingH ? 'none' : 'background 0.2s',
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
                            background: isDraggingH ? 'var(--accent-primary)' : 'var(--border-color)',
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
                        borderLeft: 'none'
                    }}
                >
                    {rightContent}
                </div>
            </div>

            {/* 가로 리사이저 (상하 조절) */}
            <div
                onMouseDown={handleMouseDownV}
                style={{
                    height: '4px',
                    cursor: 'row-resize',
                    background: isDraggingV ? 'var(--accent-primary)' : 'var(--border-color)',
                    transition: isDraggingV ? 'none' : 'background 0.2s',
                    position: 'relative',
                    zIndex: 10
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '40px',
                        height: '20px',
                        background: isDraggingV ? 'var(--accent-primary)' : 'var(--border-color)',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: 'var(--text-secondary)',
                        lineHeight: '1'
                    }}
                >
                    ⋯
                </div>
            </div>

            {/* 하단 단일 패널 */}
            <div
                style={{
                    height: `${bottomHeight}px`,
                    minHeight: `${bottomHeight}px`,
                    background: 'var(--bg-card)',
                    overflowY: 'auto',
                    borderTop: 'none'
                }}
            >
                {bottomContent}
            </div>
        </div>
    );
}
