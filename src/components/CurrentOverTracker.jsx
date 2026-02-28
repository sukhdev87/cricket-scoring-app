import React, { useRef, useEffect } from 'react';

export function CurrentOverTracker({ balls }) {
    const containerRef = useRef(null);

    useEffect(() => {
        // Scroll to right when new ball arrives
        if (containerRef.current) {
            containerRef.current.scrollLeft = containerRef.current.scrollWidth;
        }
    }, [balls]);

    const getStyleClass = (ball) => {
        if (ball === 'W') return 'wicket';
        if (ball === 4 || ball === '4') return 'boundary run';
        if (ball === 6 || ball === '6') return 'boundary run';
        if (typeof ball === 'string' && ['Wd', 'Nb', 'Lb', 'B'].includes(ball)) return 'extra';
        return 'run';
    };

    return (
        <div className="glass-panel over-tracker">
            <h3>This Over</h3>
            <div className="balls-container" ref={containerRef}>
                {balls.length === 0 ? (
                    <div className="ball-bubble placeholder">-</div>
                ) : (
                    balls.map((b, i) => (
                        <div key={i} className={`ball-bubble ${getStyleClass(b)}`}>
                            {b}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
