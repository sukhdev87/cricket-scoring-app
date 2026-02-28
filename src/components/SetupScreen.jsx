import React, { useState } from 'react';

export function SetupScreen({ onStart }) {
    const [teamA, setTeamA] = useState('Team A');
    const [teamB, setTeamB] = useState('Team B');
    const [overs, setOvers] = useState(20);
    const [players, setPlayers] = useState(11);
    const [tossWinner, setTossWinner] = useState('');
    const [tossDecision, setTossDecision] = useState('');

    const handleStart = () => {
        if (!tossWinner || !tossDecision) {
            alert('Please select the toss winner and their decision.');
            return;
        }
        onStart({
            teamA,
            teamB,
            totalOvers: overs,
            playersPerTeam: players,
            tossWinner,
            tossDecision
        });
    };

    return (
        <div className="container">
            <div className="input-group">
                <label>Team A Name</label>
                <input
                    type="text"
                    className="input-field"
                    value={teamA}
                    onChange={e => setTeamA(e.target.value)}
                />
            </div>

            <div className="input-group">
                <label>Team B Name</label>
                <input
                    type="text"
                    className="input-field"
                    value={teamB}
                    onChange={e => setTeamB(e.target.value)}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                    <label>Total Overs</label>
                    <input
                        type="number"
                        className="input-field"
                        value={overs}
                        onChange={e => setOvers(Number(e.target.value))}
                        min="1"
                    />
                </div>
                <div className="input-group">
                    <label>Players per Team</label>
                    <input
                        type="number"
                        className="input-field"
                        value={players}
                        onChange={e => setPlayers(Number(e.target.value))}
                        min="2"
                    />
                </div>
            </div>

            <div className="input-group" style={{ marginTop: '1rem' }}>
                <label>Toss Won By</label>
                <div className="radio-group">
                    <label className="radio-label">
                        <input
                            type="radio"
                            name="tossWinner"
                            checked={tossWinner === teamA}
                            onChange={() => setTossWinner(teamA)}
                        />
                        {teamA}
                    </label>
                    <label className="radio-label">
                        <input
                            type="radio"
                            name="tossWinner"
                            checked={tossWinner === teamB}
                            onChange={() => setTossWinner(teamB)}
                        />
                        {teamB}
                    </label>
                </div>
            </div>

            {tossWinner && (
                <div className="input-group">
                    <label>Elected To</label>
                    <div className="radio-group">
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="decision"
                                checked={tossDecision === 'Bat'}
                                onChange={() => setTossDecision('Bat')}
                            />
                            Bat
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="decision"
                                checked={tossDecision === 'Bowl'}
                                onChange={() => setTossDecision('Bowl')}
                            />
                            Bowl
                        </label>
                    </div>
                </div>
            )}

            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                <button
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '1.25rem', padding: '1.25rem' }}
                    onClick={handleStart}
                >
                    START MATCH
                </button>
            </div>
        </div>
    );
}
