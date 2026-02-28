import React from 'react';

export function ActionControls({ onRun, onWicket, onExtra, onUndo }) {
    return (
        <div className="glass-panel action-controls">
            <div className="control-section">
                <h3>Runs</h3>
                <div className="btn-grid">
                    {[0, 1, 2, 3].map(run => (
                        <button key={run} className="btn btn-run" onClick={() => onRun(run)}>
                            {run}
                        </button>
                    ))}
                    <button className="btn btn-run btn-boundary" onClick={() => onRun(4)}>4</button>
                    <button className="btn btn-run btn-boundary" onClick={() => onRun(6)}>6</button>
                </div>
            </div>

            <div className="control-section">
                <h3>Extras</h3>
                <div className="btn-grid">
                    <button className="btn btn-extra" onClick={() => onExtra('Wd')}>Wide</button>
                    <button className="btn btn-extra" onClick={() => onExtra('Nb')}>No Ball</button>
                    <button className="btn btn-extra" onClick={() => onExtra('Lb')}>Leg Bye</button>
                    <button className="btn btn-extra" onClick={() => onExtra('B')}>Bye</button>
                </div>
            </div>

            <div className="control-section mb-0">
                <h3>Wickets & Actions</h3>
                <div className="btn-grid">
                    <button className="btn btn-wicket" onClick={onWicket}>Out</button>
                    <button className="btn" onClick={onUndo}>Undo</button>
                </div>
            </div>
        </div>
    );
}
