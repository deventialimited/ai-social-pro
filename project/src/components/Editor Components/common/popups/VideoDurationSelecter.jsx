import React, { useState, useRef, useEffect } from 'react';
import { useEditor } from '../../EditorStoreHooks/FullEditorHooks';
const VideoDurationSelecter = ({ onDurationSelect }) => {
    const { duration,setduration } = useEditor();
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (!isNaN(value) && value >= 0) {
            const num = Number(value);
            setduration(num);
            onDurationSelect(num);
        }
    };

    // Auto-focus input when editing starts
    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editing]);

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Toolbar display */}
            <div
                onClick={() => setEditing(true)}
                style={{
                    cursor: 'pointer',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    userSelect: 'none'
                }}
            >
                {duration} sec
            </div>

            {/* Floating input dropdown */}
            {editing && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        marginTop: '5px',
                        background: 'white',
                        border: '1px solid #ccc',
                        padding: '5px',
                        borderRadius: '4px',
                        zIndex: 100,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}
                    onBlur={() => setEditing(false)}
                >
                    <div className='flex items-center gap-4'>
                    <input
                        ref={inputRef}
                        type="number"
                        value={duration}
                        onChange={handleInputChange}
                        min="0"
                        style={{ width: '100px' }}
                        onBlur={() => setEditing(false)}
                    />
                    <span>s</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoDurationSelecter;