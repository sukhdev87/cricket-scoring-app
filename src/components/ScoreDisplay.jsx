import React from 'react';

export function ScoreDisplay({ runs, wickets, overs, currentRunRate }) {
  // Format overs to always show ball number cleanly (e.g. 1.0, 1.1)
  const formatOvers = (overs) => {
    return overs.toFixed(1);
  };

  return (
    <div className="glass-panel score-display animate-slide-in">
      <div className="main-score">
        <span className="runs">{runs}</span>
        <span className="wickets">/ {wickets}</span>
      </div>
      <div className="overs">
        Overs: {formatOvers(overs)}
      </div>
      <div className="crr">
        CRR: {currentRunRate === 0 ? '0.00' : currentRunRate.toFixed(2)}
      </div>
    </div>
  );
}
