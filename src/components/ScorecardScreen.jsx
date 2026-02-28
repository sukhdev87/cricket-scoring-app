import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function ScorecardScreen({ state, onRestart }) {
    const [confirmRestart, setConfirmRestart] = useState(false);
    const {
        battingTeam, totalRuns, wickets, deliveries, extras, batsmen, bowlers,
        innings1Data, currentInnings
    } = state;
    const scorecardRef = useRef(null);

    const downloadPDF = async () => {
        if (!scorecardRef.current) return;

        try {
            const canvas = await html2canvas(scorecardRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            // Use standard A4 size to guarantee compatibility across all PDF viewers
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Scale the canvas image down to perfectly fit on one A4 page without cutoff
            const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
            const renderWidth = canvas.width * ratio;
            const renderHeight = canvas.height * ratio;

            // Center horizontally if it scales down due to height
            const xOffset = (pdfWidth - renderWidth) / 2;

            pdf.addImage(imgData, 'JPEG', xOffset, 10, renderWidth, renderHeight);

            // Output the PDF as a Blob to enforce download behavior and correct MIME Type
            const pdfBlob = pdf.output('blob');
            const blobUrl = URL.createObjectURL(pdfBlob);

            // Create a temporary link element and trigger a download
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `Anti_Gravity_Match_Summary.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error("Error generating PDF:", err);
            alert("Could not generate PDF. Consult console logs.");
        }
    };

    const renderInnings = (innData, title) => {
        if (!innData) return null;
        return (
            <div style={{ marginBottom: '2rem' }}>
                <div className="score-card" style={{ marginBottom: '1.5rem', borderRadius: 0 }}>
                    <h3 style={{ margin: 0, color: 'white' }}>{title} ({innData.battingTeam})</h3>
                    <div className="main-score" style={{ fontSize: '2rem', marginTop: '0.5rem' }}>
                        {innData.totalRuns} / {innData.wickets}
                    </div>
                    <div className="overs-crr">
                        <span>Overs: {Math.floor(innData.deliveries / 6)}.{innData.deliveries % 6}</span>
                        <span>Extras: {innData.extras.wides + innData.extras.noBalls + innData.extras.byes + innData.extras.legByes}</span>
                    </div>
                </div>

                <div className="stats-card">
                    <h4 style={{ borderBottom: '2px solid var(--primary-blue)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Batting</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ color: 'var(--secondary-grey)', textAlign: 'left' }}>
                                <th style={{ padding: '0.5rem 0' }}>Batter</th>
                                <th>R</th>
                                <th>B</th>
                                <th>4s</th>
                                <th>6s</th>
                                <th>SR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {innData.batsmen.map((b, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.5rem 0', display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 'bold' }}>{b.name}</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--secondary-grey)' }}>
                                            {b.dismissal ? b.dismissal : 'not out'}
                                        </span>
                                    </td>
                                    <td>{b.runs}</td>
                                    <td>{b.balls}</td>
                                    <td>{b.fours}</td>
                                    <td>{b.sixes}</td>
                                    <td>{b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(0) : '0'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="stats-card" style={{ marginTop: '1rem' }}>
                    <h4 style={{ borderBottom: '2px solid var(--primary-blue)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Bowling</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ color: 'var(--secondary-grey)', textAlign: 'left' }}>
                                <th style={{ padding: '0.5rem 0' }}>Bowler</th>
                                <th>O</th>
                                <th>M</th>
                                <th>R</th>
                                <th>W</th>
                                <th>ECO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {innData.bowlers.map((b, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.5rem 0', fontWeight: 'bold' }}>{b.name}</td>
                                    <td>{Math.floor(b.balls / 6)}.{b.balls % 6}</td>
                                    <td>{b.maidens}</td>
                                    <td>{b.runsConceded}</td>
                                    <td>{b.wickets}</td>
                                    <td>{b.balls > 0 ? ((b.runsConceded / (b.balls / 6)).toFixed(1)) : '0.0'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // The current state object holds Innings 2 data if we are in Innings 2
    const innings2Data = currentInnings === 2 ? {
        battingTeam, totalRuns, wickets, deliveries, extras, batsmen, bowlers
    } : null;

    const getAllBowlers = () => {
        const allBowlers = [];
        if (innings1Data && innings1Data.bowlers) allBowlers.push(...innings1Data.bowlers.map(b => ({ ...b, team: innings1Data.bowlingTeam })));
        if (innings2Data && innings2Data.bowlers) allBowlers.push(...innings2Data.bowlers.map(b => ({ ...b, team: innings2Data.bowlingTeam })));
        if (!innings1Data && !innings2Data) {
            // single innings match end
            allBowlers.push(...bowlers.map(b => ({ ...b, team: battingTeam === state.teamA ? state.teamB : state.teamA })));
        }
        return allBowlers;
    };

    return (
        <div className="container" style={{ paddingBottom: '2rem' }}>

            {/* Container to capture for PDF */}
            <div ref={scorecardRef} style={{ backgroundColor: 'var(--primary-background)', padding: '1rem', margin: '-1rem', marginBottom: '1rem' }}>
                <h2 style={{ textAlign: 'center', color: 'var(--primary-blue)', marginBottom: '1rem' }}>Match Summary</h2>

                {/* Render Innings 1 */}
                {renderInnings(innings1Data, "Innings 1")}

                {/* Render Innings 2 (if it exists) */}
                {renderInnings(innings2Data, "Innings 2")}

                {/* If match ended in Innings 1 (e.g. test mode or single innings logic), just render current state */}
                {!innings1Data && renderInnings({ battingTeam, totalRuns, wickets, deliveries, extras, batsmen, bowlers }, "Innings 1")}

                {/* Combined Bowlers Summary */}
                <div className="stats-card" style={{ marginTop: '2rem', borderTop: '4px solid var(--primary-blue)', paddingTop: '1rem' }}>
                    <h3 style={{ color: 'var(--primary-blue)', marginBottom: '1rem', textAlign: 'center' }}>Match Bowlers Summary</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ color: 'var(--secondary-grey)', textAlign: 'left', backgroundColor: '#f8fafc' }}>
                                <th style={{ padding: '0.75rem 0.5rem' }}>Bowler</th>
                                <th style={{ padding: '0.75rem 0.5rem' }}>O</th>
                                <th style={{ padding: '0.75rem 0.5rem' }}>M</th>
                                <th style={{ padding: '0.75rem 0.5rem' }}>R</th>
                                <th style={{ padding: '0.75rem 0.5rem' }}>W</th>
                                <th style={{ padding: '0.75rem 0.5rem' }}>ECO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getAllBowlers().map((b, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold' }}>
                                        {b.name} <span style={{ fontSize: '0.7rem', color: 'var(--secondary-grey)', fontWeight: 'normal' }}>({b.team})</span>
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>{Math.floor(b.balls / 6)}.{b.balls % 6}</td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>{b.maidens}</td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>{b.runsConceded}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold', color: b.wickets > 0 ? 'var(--action-red)' : 'inherit' }}>{b.wickets}</td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>{b.balls > 0 ? ((b.runsConceded / (b.balls / 6)).toFixed(1)) : '0.0'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <button
                    className="btn btn-secondary"
                    onClick={downloadPDF}
                >
                    Download PDF
                </button>
                {!confirmRestart ? (
                    <button
                        className="btn btn-primary"
                        onClick={() => setConfirmRestart(true)}
                    >
                        Restart Match
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-wicket" style={{ flex: 1, padding: '0.5rem' }} onClick={onRestart}>Confirm Restart</button>
                        <button className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem' }} onClick={() => setConfirmRestart(false)}>Cancel</button>
                    </div>
                )}
            </div>

        </div>
    );
}
