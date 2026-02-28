import { useState } from 'react';

export const initialMatchState = {
    screen: 'setup', // 'setup', 'playerSelection', 'scoring', 'scorecard'
    teamA: 'Team A',
    teamB: 'Team B',
    playersPerTeam: 11,
    totalOvers: 20,
    tossWinner: '',
    tossDecision: '',

    currentInnings: 1,
    battingTeam: '',
    bowlingTeam: '',
    target: null, // For 2nd innings

    // Score
    totalRuns: 0,
    wickets: 0,
    deliveries: 0,
    extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },

    // Players
    batsmen: [],
    bowlers: [],

    strikerIndex: 0,
    nonStrikerIndex: 1,
    currentBowlerIndex: 0,

    currentOverTimeline: [],
    history: [],

    // Full match history for PDF reporting
    innings1Data: null,
};

export const useMatchState = () => {
    const [matchState, setMatchState] = useState(initialMatchState);

    const startMatch = (setupData) => {
        const battingTeam = setupData.tossDecision === 'Bat' ? setupData.tossWinner : (setupData.tossWinner === setupData.teamA ? setupData.teamB : setupData.teamA);
        const bowlingTeam = setupData.tossDecision === 'Bowl' ? setupData.tossWinner : (setupData.tossWinner === setupData.teamA ? setupData.teamB : setupData.teamA);

        setMatchState(prev => ({
            ...prev,
            ...setupData,
            screen: 'playerSelection',
            battingTeam,
            bowlingTeam,
        }));
    };

    const startInnings = (playerData) => {
        setMatchState(prev => ({
            ...prev,
            screen: 'scoring',
            batsmen: [
                { id: 'B1', name: playerData.striker, runs: 0, balls: 0, fours: 0, sixes: 0, dismissal: null },
                { id: 'B2', name: playerData.nonStriker, runs: 0, balls: 0, fours: 0, sixes: 0, dismissal: null }
            ],
            bowlers: [
                { id: 'BW1', name: playerData.bowler, overs: 0, balls: 0, maidens: 0, runsConceded: 0, wickets: 0 }
            ],
            strikerIndex: 0,
            nonStrikerIndex: 1,
            currentBowlerIndex: 0,
            history: [],
            currentOverTimeline: [], // Ensure fresh timeline
        }));
    };

    const endInnings = () => {
        setMatchState(prev => {
            // If we are currently in Innings 1, transition to Innings 2 setup
            if (prev.currentInnings === 1) {
                // Save Innings 1 state
                const inn1Data = {
                    battingTeam: prev.battingTeam,
                    bowlingTeam: prev.bowlingTeam,
                    totalRuns: prev.totalRuns,
                    wickets: prev.wickets,
                    deliveries: prev.deliveries,
                    extras: { ...prev.extras },
                    batsmen: [...prev.batsmen],
                    bowlers: [...prev.bowlers]
                };

                const nextBatting = prev.bowlingTeam;
                const nextBowling = prev.battingTeam;

                return {
                    ...prev,
                    screen: 'playerSelection',
                    currentInnings: 2,
                    target: prev.totalRuns + 1,
                    battingTeam: nextBatting,
                    bowlingTeam: nextBowling,

                    innings1Data: inn1Data,

                    // Reset scoring vars
                    totalRuns: 0,
                    wickets: 0,
                    deliveries: 0,
                    extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
                    batsmen: [],
                    bowlers: [],
                    currentOverTimeline: [],
                    history: []
                };
            } else {
                // End of match
                return {
                    ...prev,
                    screen: 'scorecard'
                };
            }
        });
    };

    const restartMatch = () => {
        setMatchState(initialMatchState);
    };

    return {
        matchState,
        setMatchState,
        startMatch,
        startInnings,
        endInnings,
        restartMatch
    };
};
