import React, { useState } from 'react';

export function PlayerSelectionScreen({ onSubmit }) {
    const [striker, setStriker] = useState('');
    const [nonStriker, setNonStriker] = useState('');
    const [bowler, setBowler] = useState('');

    const handleSubmit = () => {
        if (!striker || !nonStriker || !bowler) {
            alert('Please fill in Striker, Non-Striker, and Bowler names to start scoring.');
            return;
        }
        onSubmit({ striker, nonStriker, bowler });
    };

    return (
        <div className="container">
            <h2 style={{ textAlign: 'center', color: 'var(--primary-blue)', marginBottom: '1rem' }}>Enter Players</h2>

            <div className="input-group">
                <label>Striker Name</label>
                <input
                    type="text"
                    className="input-field"
                    value={striker}
                    onChange={e => setStriker(e.target.value)}
                    placeholder="e.g. Virat Kohli"
                />
            </div>

            <div className="input-group">
                <label>Non-Striker Name</label>
                <input
                    type="text"
                    className="input-field"
                    value={nonStriker}
                    onChange={e => setNonStriker(e.target.value)}
                    placeholder="e.g. Rohit Sharma"
                />
            </div>

            <div className="input-group" style={{ marginTop: '1rem' }}>
                <label>Opening Bowler Name</label>
                <input
                    type="text"
                    className="input-field"
                    value={bowler}
                    onChange={e => setBowler(e.target.value)}
                    placeholder="e.g. Mitchell Starc"
                />
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                <button
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '1.25rem', padding: '1.25rem' }}
                    onClick={handleSubmit}
                >
                    START SCORING
                </button>
            </div>
        </div>
    );
}
