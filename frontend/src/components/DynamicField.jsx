import React from 'react';

export default function DynamicField({ parameter, value, onChange }) {
    const handleChange = (e) => {
        let newValue;

        const paramType = (parameter.type || 'string').toLowerCase();

        if (paramType === 'number' || paramType === 'double' || paramType === 'integer') {
            newValue = paramType === 'integer'
                ? parseInt(e.target.value, 10)
                : parseFloat(e.target.value);
        } else if (paramType === 'boolean') {
            newValue = e.target.checked;
        } else {
            newValue = e.target.value;
        }

        onChange(newValue);
    };

    const paramType = (parameter.type || 'string').toLowerCase();

    switch (paramType) {
        case 'group': {
            const options = parameter.Options || parameter.options || [];
            return (
                <div className="segmented-control">
                    {options.map(option => (
                        <div
                            key={option}
                            className={`segment-item ${value === option ? 'active' : ''}`}
                            onClick={() => onChange(option)}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            );
        }

        case 'boolean':
            return (
                <label className="toggle-switch">
                    <input
                        type="checkbox"
                        checked={value}
                        onChange={handleChange}
                    />
                    <span className="toggle-slider"></span>
                </label>
            );

        case 'number':
        case 'double':
        case 'integer': {
            const min = Array.isArray(parameter.Range) ? parameter.Range[0] : parameter.min;
            const max = Array.isArray(parameter.Range) ? parameter.Range[1] : parameter.max;
            const isOutOfRange = (min !== undefined && value < min) || (max !== undefined && value > max);
            const hasError = parameter.isExpressionInvalid || isOutOfRange;

            return (
                <input
                    type="number"
                    value={value || ''}
                    onChange={handleChange}
                    min={min}
                    max={max}
                    step={paramType === 'integer' ? 1 : 0.1}
                    placeholder={parameter.label}
                    style={{
                        background: hasError ? 'rgba(255, 99, 71, 0.1)' : 'white',
                        color: hasError ? 'tomato' : 'var(--text-primary)',
                        borderColor: hasError ? 'tomato' : 'var(--border-color)',
                    }}
                />
            );
        }

        case 'select':
        case 'string':
            if (parameter.Options || parameter.options) {
                const options = parameter.Options || parameter.options;
                return (
                    <select value={value} onChange={handleChange}>
                        {options.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );
            }
        // Fall through to default text input if no options

        case 'date':
            return (
                <input
                    type="date"
                    value={value}
                    onChange={handleChange}
                />
            );

        case 'json':
            return (
                <textarea
                    value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                    onChange={(e) => {
                        try {
                            const parsed = JSON.parse(e.target.value);
                            onChange(parsed);
                        } catch {
                            onChange(e.target.value);
                        }
                    }}
                    rows={6}
                    placeholder="JSON 형식으로 입력하세요"
                />
            );

        default: // string
            return (
                <input
                    type="text"
                    value={value || ''}
                    onChange={handleChange}
                    placeholder={parameter.label}
                />
            );
    }
}
