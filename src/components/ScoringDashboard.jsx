import React, { useState, useEffect } from 'react';
import '../ScoringDashboard.css';
import { calculateRunRate, formatOvers, handleBallOutcome } from '../utils/scoringLogic';

export function ScoringDashboard({ state, dispatch, onEndInnings }) {
    const [confirmEnd, setConfirmEnd] = useState(false);
    const [pendingWicket, setPendingWicket] = useState(null);
    const [newBatsmanName, setNewBatsmanName] = useState('');
    const [newBowlerName, setNewBowlerName] = useState('');

    const { totalRuns, wickets, deliveries, batsmen, bowlers, strikerIndex, nonStrikerIndex, currentBowlerIndex, currentOverTimeline, totalOvers, playersPerTeam, currentInnings, target } = state;

    useEffect(() => {
        const maxBalls = totalOvers * 6;
        const maxWickets = playersPerTeam - 1;
        if (deliveries >= maxBalls || wickets >= maxWickets) {
            onEndInnings();
        } else if (currentInnings === 2 && target && totalRuns >= target) {
            onEndInnings();
        }
    }, [deliveries, wickets, totalRuns, totalOvers, playersPerTeam, currentInnings, target, onEndInnings]);

    const striker = batsmen[strikerIndex];
    const nonStriker = batsmen[nonStrikerIndex];
    const bowler = bowlers[currentBowlerIndex];

    const doAction = (action) => {
        if (action.type === 'WICKET' || action.type === 'RUN_OUT') {
            setPendingWicket(action);
        } else {
            dispatch(prevState => handleBallOutcome(prevState, action));
        }
    };

    const submitWicket = () => {
        if (!newBatsmanName) return;
        dispatch(prevState => handleBallOutcome(prevState, {
            ...pendingWicket,
            payload: {
                ...pendingWicket.payload,
                newBatsmanName
            }
        }));
        setPendingWicket(null);
        setNewBatsmanName('');
    };

    const submitNewBowler = () => {
        if (!newBowlerName) return;
        dispatch(prevState => handleBallOutcome(prevState, {
            type: 'NEW_BOWLER',
            payload: { bowlerName: newBowlerName }
        }));
        setNewBowlerName('');
    };

    const selectExistingBowler = (bowlerIndex) => {
        dispatch(prevState => handleBallOutcome(prevState, {
            type: 'SELECT_BOWLER',
            payload: { bowlerIndex }
        }));
    };

    const needsNewBowler = deliveries > 0 && deliveries < totalOvers * 6 && wickets < playersPerTeam - 1 && deliveries % 6 === 0 && currentOverTimeline.length > 0;

    const getOverSummary = () => {
        let runs = 0;
        let wkts = 0;
        currentOverTimeline.forEach(curr => {
            const digitMatch = curr.badge.match(/\d+/);
            const digits = digitMatch ? parseInt(digitMatch[0], 10) : 0;
            if (curr.badge === 'Wd' || curr.badge === 'NB') runs += 1;
            else if (curr.badge.includes('Wd+') || curr.badge.includes('NB+')) runs += 1 + digits;
            else if (curr.badge === 'W') runs += 0;
            else runs += digits;

            if (curr.event === 'WICKET' || curr.event === 'RUN_OUT') wkts += 1;
        });
        return { runs, wkts };
    };

    const modalOverlayStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000, padding: '1rem'
    };
    const modalContentStyle = {
        backgroundColor: 'var(--primary-background)',
        padding: '1.5rem', borderRadius: '12px', width: '100%', maxWidth: '400px'
    };

    return (
        <div>
            {pendingWicket && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={{ color: 'var(--action-red)', marginTop: 0 }}>Wicket!</h3>
                        <p>Enter new batsman name:</p>
                        <input
                            type="text"
                            className="input-field"
                            value={newBatsmanName}
                            onChange={e => setNewBatsmanName(e.target.value)}
                            placeholder="Batsman Name"
                        />
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button className="btn btn-primary" onClick={submitWicket} style={{ flex: 1 }}>Submit</button>
                            <button className="btn btn-secondary" onClick={() => setPendingWicket(null)} style={{ flex: 1 }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {needsNewBowler && !pendingWicket && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={{ color: 'var(--primary-blue)', marginTop: 0 }}>End of Over {formatOvers(deliveries)}</h3>
                        <div style={{ backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', color: '#1e293b' }}>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>Over Summary</p>
                            <p style={{ margin: '0.5rem 0 0 0' }}>{getOverSummary().runs} Runs, {getOverSummary().wkts} Wickets</p>
                        </div>

                        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Select Next Bowler</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', maxHeight: '150px', overflowY: 'auto' }}>
                            {bowlers.map((b, idx) => (
                                <button
                                    key={b.id}
                                    className="btn btn-secondary"
                                    onClick={() => selectExistingBowler(idx)}
                                    disabled={idx === currentBowlerIndex}
                                    style={{ textAlign: 'left', opacity: idx === currentBowlerIndex ? 0.5 : 1 }}
                                >
                                    {b.name} ({formatOvers(b.balls)}-{b.maidens}-{b.runsConceded}-{b.wickets})
                                </button>
                            ))}
                        </div>

                        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Or Enter New Bowler</p>
                        <input
                            type="text"
                            className="input-field"
                            value={newBowlerName}
                            onChange={e => setNewBowlerName(e.target.value)}
                            placeholder="Bowler Name"
                        />
                        <button className="btn btn-primary" onClick={submitNewBowler} style={{ width: '100%', marginTop: '1rem' }}>Submit New Bowler</button>
                    </div>
                </div>
            )}

            <div className="dashboard-container">

                {/* Top Score Context */}
                <div className="score-card">
                    <div className="main-score">
                        {totalRuns} / {wickets}
                    </div>
                    <div className="overs-crr" style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span>Overs: {formatOvers(deliveries)}</span>
                        <span>CRR: {calculateRunRate(totalRuns, deliveries)}</span>
                        {currentInnings === 2 && target && (
                            <span style={{ color: 'var(--action-yellow)' }}>
                                RRR: {(((totalOvers * 6) - deliveries) > 0 ? ((target - totalRuns) / (((totalOvers * 6) - deliveries) / 6)).toFixed(2) : '0.00')}
                            </span>
                        )}
                    </div>
                    {currentInnings === 2 && target && (
                        <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary-grey)' }}>
                            Need {target - totalRuns > 0 ? target - totalRuns : 0} runs from {(totalOvers * 6) - deliveries > 0 ? (totalOvers * 6) - deliveries : 0} balls
                        </div>
                    )}
                </div>

                {/* Batsmen State */}
                <div className="stats-section">
                    <div className="stats-card">
                        <div className="stats-header">
                            <span>BATSMEN</span>
                            <span>R (B) SR</span>
                        </div>
                        <div className="player-row">
                            <span className="player-name">
                                <span className="striker-indicator">▶</span>
                                {striker.name}
                            </span>
                            <span className="player-stats">
                                {striker.runs} ({striker.balls}) {striker.balls > 0 ? ((striker.runs / striker.balls) * 100).toFixed(0) : '0'}
                            </span>
                        </div>
                        <div className="player-row" style={{ color: 'var(--secondary-grey)' }}>
                            <span className="player-name" style={{ paddingLeft: '1rem' }}>
                                {nonStriker.name}
                            </span>
                            <span className="player-stats">
                                {nonStriker.runs} ({nonStriker.balls}) {nonStriker.balls > 0 ? ((nonStriker.runs / nonStriker.balls) * 100).toFixed(0) : '0'}
                            </span>
                        </div>
                    </div>

                    {/* Bowler State */}
                    <div className="stats-card bowler">
                        <div className="stats-header">
                            <span>BOWLER</span>
                            <span>O-M-R-W</span>
                        </div>
                        <div className="player-row">
                            <span className="player-name">
                                {bowler.name}
                            </span>
                            <span className="player-stats">
                                {formatOvers(bowler.balls)}-{bowler.maidens}-{bowler.runsConceded}-{bowler.wickets}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div>
                    <div className="control-group-title" style={{ marginTop: 0 }}>This Over</div>
                    <div className="timeline-container">
                        {currentOverTimeline.length === 0 ? (
                            <div className="timeline-badge" style={{ backgroundColor: 'transparent', border: '1px solid #cbd5e1', color: '#cbd5e1' }}>0</div>
                        ) : (
                            currentOverTimeline.map((item, idx) => (
                                <div key={idx} className="timeline-badge" style={{
                                    backgroundColor: item.badge === 'W' ? 'var(--action-red)' :
                                        item.badge.includes('4') || item.badge.includes('6') ? 'var(--action-green)' :
                                            item.invalid ? 'var(--action-yellow)' : 'var(--primary-blue)',
                                    color: item.invalid ? 'var(--secondary-black)' : 'white'
                                }}>
                                    {item.badge}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div>
                    <div className="control-group-title">Runs</div>
                    <div className="control-grid">
                        <button className="btn btn-run" onClick={() => doAction({ type: 'RUNS', payload: { runs: 0 } })}>0</button>
                        <button className="btn btn-run" onClick={() => doAction({ type: 'RUNS', payload: { runs: 1 } })}>1</button>
                        <button className="btn btn-run" onClick={() => doAction({ type: 'RUNS', payload: { runs: 2 } })}>2</button>
                        <button className="btn btn-run" onClick={() => doAction({ type: 'RUNS', payload: { runs: 3 } })}>3</button>
                        <button className="btn btn-run" style={{ borderColor: 'var(--action-green)' }} onClick={() => doAction({ type: 'RUNS', payload: { runs: 4 } })}>4</button>
                        <button className="btn btn-run" onClick={() => doAction({ type: 'RUNS', payload: { runs: 5 } })}>5</button>
                        <button className="btn btn-run" style={{ borderColor: 'var(--action-green)' }} onClick={() => doAction({ type: 'RUNS', payload: { runs: 6 } })}>6</button>
                        <button className="btn btn-secondary" onClick={() => doAction({ type: 'SWAP_STRIKE' })}>Swap</button>
                    </div>

                    <div className="control-group-title">Extras</div>
                    <div className="control-grid">
                        <button className="btn btn-extra" onClick={() => doAction({ type: 'WIDE', payload: { runs: 0 } })}>Wd</button>
                        <button className="btn btn-extra" onClick={() => doAction({ type: 'NO_BALL', payload: { runs: 0 } })}>NB</button>
                        <button className="btn btn-extra" onClick={() => doAction({ type: 'BYE', payload: { runs: 1 } })}>B1</button>
                        <button className="btn btn-extra" onClick={() => doAction({ type: 'LEG_BYE', payload: { runs: 1 } })}>Lb1</button>
                    </div>

                    <div className="control-group-title">Wickets & Actions</div>
                    <div className="control-grid">
                        <button className="btn btn-wicket btn-wide" onClick={() => doAction({ type: 'WICKET' })}>Wicket</button>
                        <button className="btn btn-wicket btn-wide" onClick={() => doAction({ type: 'RUN_OUT', payload: { runs: 0 } })}>Run Out</button>

                        <button className="btn btn-secondary btn-wide" style={{ marginTop: '0.5rem' }} onClick={() => {
                            if (state.history.length > 0) {
                                dispatch(state.history[state.history.length - 1]);
                            }
                        }}>Undo Last</button>
                        {!confirmEnd ? (
                            <button className="btn btn-primary btn-wide" style={{ marginTop: '0.5rem' }} onClick={() => setConfirmEnd(true)}>End Inn</button>
                        ) : (
                            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <button className="btn btn-wicket" style={{ flex: 1, padding: '0.5rem' }} onClick={() => { setConfirmEnd(false); onEndInnings(); }}>Confirm</button>
                                <button className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem' }} onClick={() => setConfirmEnd(false)}>Cancel</button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
