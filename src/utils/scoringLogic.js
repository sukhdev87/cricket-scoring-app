export const calculateRunRate = (runs, balls) => {
    if (balls === 0) return '0.00';
    return (runs / (balls / 6)).toFixed(2);
};

export const formatOvers = (balls) => {
    const overs = Math.floor(balls / 6);
    const remainingBalls = balls % 6;
    return `${overs}.${remainingBalls}`;
};

export const calculateStrikeRate = (runs, balls) => {
    if (balls === 0) return '0.00';
    return ((runs / balls) * 100).toFixed(2);
};

export const handleBallOutcome = (currentState, action) => {
    // Deep clone to avoid mutating history references
    const newState = JSON.parse(JSON.stringify(currentState));

    // 1. Save history snapshot BEFORE applying this action
    newState.history.push({
        ...JSON.parse(JSON.stringify(currentState)),
        history: [] // Don't nest history inside history
    });

    const { type, payload } = action;

    let validDelivery = false;
    let runsAdded = 0;
    let extrasAdded = 0;
    let strikerSwaps = false;
    let wicketFalls = false;
    let newTimelineBadge = '';

    const striker = newState.batsmen[newState.strikerIndex];
    const bowler = newState.bowlers[newState.currentBowlerIndex];

    switch (type) {
        case 'RUNS':
            validDelivery = true;
            runsAdded = payload.runs;
            striker.runs += runsAdded;
            striker.balls += 1;
            if (runsAdded === 4) striker.fours += 1;
            if (runsAdded === 6) striker.sixes += 1;

            bowler.runsConceded += runsAdded;
            if (runsAdded % 2 !== 0) strikerSwaps = true;
            newTimelineBadge = runsAdded.toString();
            break;

        case 'WIDE':
            validDelivery = false;
            extrasAdded = 1 + (payload.runs || 0);
            newState.extras.wides += extrasAdded;
            bowler.runsConceded += extrasAdded;
            if ((payload.runs || 0) % 2 !== 0) strikerSwaps = true;
            newTimelineBadge = payload.runs ? `Wd+${payload.runs}` : 'Wd';
            break;

        case 'NO_BALL':
            validDelivery = false;
            extrasAdded = 1;
            runsAdded = payload.runs || 0; // Runs off bat on a no-ball
            newState.extras.noBalls += 1;

            if (runsAdded > 0) {
                striker.runs += runsAdded;
                if (runsAdded === 4) striker.fours += 1;
                if (runsAdded === 6) striker.sixes += 1;
            }
            striker.balls += 1; // Faces a ball
            bowler.runsConceded += extrasAdded + runsAdded;
            if (runsAdded % 2 !== 0) strikerSwaps = true;

            newTimelineBadge = runsAdded ? `NB+${runsAdded}` : 'NB';
            break;

        case 'BYE':
            validDelivery = true;
            extrasAdded = payload.runs;
            newState.extras.byes += extrasAdded;
            striker.balls += 1;
            // Note: Byes are NOT added to bowler's runs conceded in some formats, but usually they are as extras.
            // Standard: Byes and leg byes do not count against the bowler's analysis.
            if (payload.runs % 2 !== 0) strikerSwaps = true;
            newTimelineBadge = `${payload.runs}B`;
            break;

        case 'LEG_BYE':
            validDelivery = true;
            extrasAdded = payload.runs;
            newState.extras.legByes += extrasAdded;
            striker.balls += 1;
            // Standard: Byes and leg byes do not count against the bowler's analysis.
            if (payload.runs % 2 !== 0) strikerSwaps = true;
            newTimelineBadge = `${payload.runs}LB`;
            break;

        case 'WICKET':
            validDelivery = true;
            wicketFalls = true;
            striker.balls += 1;
            striker.dismissal = 'Bowled/Caught/LBW'; // Generic
            bowler.wickets += 1;
            newTimelineBadge = 'W';
            break;

        case 'RUN_OUT':
            validDelivery = true; // Typically run outs happen on valid balls unless on an extra
            wicketFalls = true;
            runsAdded = payload.runs || 0;
            if (runsAdded > 0) {
                striker.runs += runsAdded;
            }
            striker.balls += 1;
            striker.dismissal = 'Run Out';
            // Run outs DO NOT go to the bowler's wicket count.
            if (runsAdded % 2 !== 0) strikerSwaps = true; // They crossed before out? Depends on rules, we assume strike swaps if odd runs completed.
            newTimelineBadge = runsAdded ? `W+${runsAdded}` : 'W';
            break;

        case 'SWAP_STRIKE':
            // Manual overide
            [newState.strikerIndex, newState.nonStrikerIndex] = [newState.nonStrikerIndex, newState.strikerIndex];
            return newState;

        case 'NEW_BOWLER':
            // user entered a new bowler
            newState.bowlers.push({
                id: `BW${newState.bowlers.length + 1}`,
                name: payload.bowlerName,
                overs: 0, balls: 0, maidens: 0, runsConceded: 0, wickets: 0
            });
            newState.currentBowlerIndex = newState.bowlers.length - 1;
            newState.currentOverTimeline = []; // Clear timeline for new over
            return newState;

        case 'SELECT_BOWLER':
            // user selected an existing bowler
            newState.currentBowlerIndex = payload.bowlerIndex;
            newState.currentOverTimeline = []; // Clear timeline for new over
            return newState;

        default:
            return newState;
    }

    // Update Core Score
    newState.totalRuns += runsAdded + extrasAdded;

    if (validDelivery) {
        newState.deliveries += 1;
        bowler.balls += 1;
        newState.currentOverTimeline.push({ badge: newTimelineBadge, event: type });

        // Calculate Maidens (Only applicable at End of Over, omitted for simplicity here unless handled specifically)

        // Check End of Over
        if (newState.deliveries % 6 === 0 && newState.deliveries > 0) {
            bowler.overs += 1;
            strikerSwaps = !strikerSwaps; // Strike swaps at end of over

            // Need a new bowler, normally requires UI prompt. For now, we auto-create a new one or swap.
            // We'll leave the bowler swap to a separate manual UI action for realism, or just create a new one.
        }
    } else {
        // Timeline entry for invalid balls
        newState.currentOverTimeline.push({ badge: newTimelineBadge, event: type, invalid: true });
    }

    // Handle Strike Swap dynamically
    if (strikerSwaps) {
        [newState.strikerIndex, newState.nonStrikerIndex] = [newState.nonStrikerIndex, newState.strikerIndex];
    }

    if (wicketFalls) {
        newState.wickets += 1;
        // Add new batsman. In reality, UI asks for name. Auto-generate for now.
        const newBatsmanId = `B${newState.batsmen.length + 1}`;
        const bName = payload.newBatsmanName || `${newState.battingTeam} Bat ${newState.batsmen.length + 1}`;
        newState.batsmen.push({
            id: newBatsmanId,
            name: bName,
            runs: 0, balls: 0, fours: 0, sixes: 0, dismissal: null
        });
        // The new batsman takes the strike of the dismissed player.
        // We already marked the old striker as dismissed.
        newState.strikerIndex = newState.batsmen.length - 1;
    }

    // Match Complete Check (All Out or Overs Finished)
    if (newState.wickets >= 10 || Math.floor(newState.deliveries / 6) >= newState.totalOvers) {
        if (newState.currentInnings === 1) {
            // Transition to Innings 2 (Require UI prompt ideally, but for MVP we auto switch?)
            // We will handle innings break in a separate function to not overcomplicate state transition here.
        } else {
            newState.screen = 'scorecard';
        }
    }

    return newState;
};
