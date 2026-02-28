import React from 'react';
import { SetupScreen } from './components/SetupScreen';
import { PlayerSelectionScreen } from './components/PlayerSelectionScreen';
import { ScoringDashboard } from './components/ScoringDashboard';
import { ScorecardScreen } from './components/ScorecardScreen';
import { useMatchState } from './hooks/useMatchState';

function App() {
  const { matchState, setMatchState, startMatch, startInnings, endInnings, restartMatch } = useMatchState();

  return (
    <div>
      <div className="header">
        Anti Gravity
      </div>

      {matchState.screen === 'setup' && (
        <SetupScreen onStart={startMatch} />
      )}

      {matchState.screen === 'playerSelection' && (
        <PlayerSelectionScreen onSubmit={startInnings} />
      )}

      {matchState.screen === 'scoring' && (
        <ScoringDashboard
          state={matchState}
          dispatch={setMatchState}
          onEndInnings={endInnings}
        />
      )}

      {matchState.screen === 'scorecard' && (
        <ScorecardScreen
          state={matchState}
          onRestart={restartMatch}
        />
      )}
    </div>
  );
}

export default App;
