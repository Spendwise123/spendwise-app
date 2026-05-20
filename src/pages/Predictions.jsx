import React, { useState, useEffect, useRef, useMemo } from 'react';
import './Predictions.css';
import { getSummary, getBudgets } from '../data/mockApi';

// Simple Linear Regression simulation
const calculatePrediction = (actualData) => {
    const n = actualData.length;
    if (n < 2) return { slope: 0, intercept: actualData[0]?.val || 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    actualData.forEach((d, i) => {
        const x = d.day;
        const y = d.val;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
};

const Predictions = () => {
    const [summary, setSummary] = useState({ trajectory: [] });
    const [budgetLimit, setBudgetLimit] = useState(2000.00);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryData, budgetData] = await Promise.all([
                    getSummary(),
                    getBudgets()
                ]);
                setSummary(summaryData);
                
                const totalBudget = budgetData.find(b => b.category === 'Total' && b.period === 'monthly');
                if (totalBudget) {
                    setBudgetLimit(parseFloat(totalBudget.limit));
                }
            } catch (error) {
                console.error('Error fetching prediction data:', error);
            }
        };
        fetchData();
    }, []);

    const { predictionData, stats } = useMemo(() => {
        const actuals = summary.trajectory.map(item => ({ day: item.day, val: item.actual }));
        const { slope, intercept } = calculatePrediction(actuals);

        const data = [];
        for (let i = 1; i <= 30; i++) {
            const pred = Math.max(0, slope * i + intercept);
            const actualItem = summary.trajectory.find(d => d.day === i);
            data.push({
                day: i,
                predicted: pred,
                actual: actualItem ? actualItem.actual : null
            });
        }

        const predictedTotal = data[29].predicted;
        const lastActual = actuals.length > 0 ? actuals[actuals.length - 1].val : 0;
        const budget = budgetLimit;
        const overBudget = Math.max(0, predictedTotal - budget);
        const daysRemaining = 30 - actuals.length;
        const dailyLimit = overBudget > 0 ? 0 : (budget - lastActual) / daysRemaining;

        return {
            predictionData: data,
            stats: {
                predictedTotal,
                overBudget,
                dailyLimit,
                daysRemaining,
                confidence: 98.4
            }
        };
    }, [summary.trajectory, budgetLimit]);

    const [hoveredPoint, setHoveredPoint] = useState(null);
    const chartRef = useRef(null);

    // ── Chart Helpers ──
    const pad = { top: 40, right: 40, bottom: 50, left: 70 };
    const w = 900, h = 280;
    const iW = w - pad.left - pad.right;
    const iH = h - pad.top - pad.bottom;
    const maxY = Math.max(2400, budgetLimit * 1.2);
    const budgetY = budgetLimit;

    const tx = (day) => pad.left + ((day - 1) / 29) * iW;
    const ty = (val) => pad.top + iH - (val / maxY) * iH;

    const buildPath = (data, key) => {
        const pts = data.filter(d => d[key] != null);
        return pts.map((d, i) => `${i === 0 ? 'M' : 'L'}${tx(d.day).toFixed(1)} ${ty(d[key]).toFixed(1)}`).join(' ');
    };

    const handleHover = (e) => {
        if (!chartRef.current) return;
        const rect = chartRef.current.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * w;
        let closest = null, minDist = Infinity;
        predictionData.forEach(d => {
            const dist = Math.abs(tx(d.day) - mouseX);
            if (dist < minDist) { minDist = dist; closest = d; }
        });
        if (closest && minDist < iW / 30) setHoveredPoint(closest);
        else setHoveredPoint(null);
    };

    const isOver = stats.predictedTotal > budgetLimit;
    const predictedPercent = budgetLimit > 0 ? Math.round((stats.predictedTotal / budgetLimit) * 100) : 0;
    const strokeDashoffset = 188.5 - (Math.min(1, stats.predictedTotal / budgetLimit) * 188.5);
    const yTicks = [0, Math.round(maxY * 0.25), Math.round(maxY * 0.5), Math.round(maxY * 0.75), Math.round(maxY)];

    return (
        <div className="predictions-container">
            <header className="page-header">
                <div className="header-left">
                    <h1>ML Predictions</h1>
                    <p>AI-powered spending forecast and recommendations</p>
                </div>
            </header>

            <div className={`alert-banner ${isOver ? 'risk' : 'success'} full-width`}>
                <div className="alert-icon-container">
                    {isOver ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    )}
                </div>
                <div className="alert-content">
                    <div className="alert-title">
                        {isOver ? 'High Risk of Overspending' : 'Spending is On Track'}
                        <span className={`badge ${isOver ? 'danger' : 'success'}`}>{isOver ? 'High Risk' : 'Safe'}</span>
                    </div>
                    <p className="alert-desc">
                        {isOver 
                            ? `At the current rate, you're projected to exceed your budget by ₱${stats.overBudget.toFixed(2)}. Immediate action is recommended to reduce spending.`
                            : `At the current rate, your spending is projected to stay within your monthly limit.`
                        }
                    </p>
                </div>
            </div>

            <div className="predictions-grid">
                <div className="card gauge-card">
                    <div className="gauge-outer">
                        <div className="gauge-container">
                            <svg viewBox="0 0 100 100" className="gauge">
                                <path d="M 20 80 A 40 40 0 1 1 80 80" fill="none" stroke="#1f1f23" strokeWidth="8" strokeLinecap="round" />
                                <path d="M 20 80 A 40 40 0 1 1 80 80" fill="none" stroke={isOver ? 'var(--danger)' : 'var(--primary)'} strokeWidth="8" strokeLinecap="round" strokeDasharray="188.5" strokeDashoffset={strokeDashoffset} />
                                <text x="50" y="45" className="gauge-percent">{predictedPercent}%</text>
                                <text x="50" y="60" className="gauge-label">of budget</text>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">Predicted Total</p>
                        <h2 className="stat-value">₱{stats.predictedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                        <p className={`stat-subtext ${isOver ? 'danger' : 'success'}`}>
                            {isOver ? `₱${stats.overBudget.toFixed(2)} over budget` : 'Under budget'}
                        </p>
                    </div>
                    <div className="stat-icon-top">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 20-4-4h-3l2-2h3l2-2h-3l2-2h-3l2-2" /></svg>
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">Suggested Daily</p>
                        <h2 className="stat-value">₱{stats.dailyLimit.toFixed(2)}</h2>
                        <p className="stat-subtext">for {stats.daysRemaining} remaining days</p>
                    </div>
                    <div className="stat-icon-top">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">Model Confidence</p>
                        <h2 className="stat-value">{stats.confidence}%</h2>
                        <p className="stat-subtext">R-squared accuracy</p>
                    </div>
                    <div className="stat-icon-top">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 9.5L12 2s7.5 7.5 7.5 7.5v8l-7.5 4.5-7.5-4.5z" /></svg>
                    </div>
                </div>
            </div>

            <div className="card trajectory-card full-width">
                <div className="section-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                    <h3>Spending Trajectory</h3>
                </div>
                <p className="chart-subtitle">Day-by-day projected spending with actual data overlay</p>
                <div className="chart-wrapper">
                    <svg
                        ref={chartRef}
                        viewBox={`0 0 ${w} ${h}`}
                        preserveAspectRatio="xMidYMid meet"
                        className="interactive-chart"
                        onMouseMove={handleHover}
                        onMouseLeave={() => setHoveredPoint(null)}
                    >
                        {/* Grid lines */}
                        {yTicks.map(v => (
                            <g key={v}>
                                <line x1={pad.left} y1={ty(v)} x2={w - pad.right} y2={ty(v)} stroke="#1f1f23" strokeWidth="1" strokeDasharray="3 3" />
                                <text x={pad.left - 12} y={ty(v) + 4} textAnchor="end" fill="#71717a" fontSize="11">₱{v.toLocaleString()}</text>
                            </g>
                        ))}

                        {/* X-axis days */}
                        {[1, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30].map(d => (
                            <text key={d} x={tx(d)} y={h - 10} textAnchor="middle" fill="#71717a" fontSize="11">{d}</text>
                        ))}

                        {/* Budget Threshold Line */}
                        <line x1={pad.left} y1={ty(budgetY)} x2={w - pad.right} y2={ty(budgetY)} stroke="var(--danger)" strokeWidth="1" strokeDasharray="6 4" opacity="0.5" />
                        <text x={w - pad.right + 5} y={ty(budgetY) + 4} fill="var(--danger)" fontSize="10" opacity="0.8">Budget</text>

                        {/* Predicted Trajectory (Dashed) */}
                        <path d={buildPath(predictionData, 'predicted')} fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" strokeDasharray="5 5" />

                        {/* Actual Spending (Solid) */}
                        <path d={buildPath(predictionData.filter(d => d.actual), 'actual')} fill="none" stroke="var(--primary)" strokeWidth="3" />

                        {/* Hover elements */}
                        {hoveredPoint && (
                            <g>
                                <line x1={tx(hoveredPoint.day)} y1={pad.top} x2={tx(hoveredPoint.day)} y2={h - pad.bottom} stroke="#3f3f46" strokeWidth="1" />
                                {hoveredPoint.actual && (
                                    <circle cx={tx(hoveredPoint.day)} cy={ty(hoveredPoint.actual)} r="5" fill="var(--primary)" stroke="#fff" strokeWidth="2" />
                                )}
                                <circle cx={tx(hoveredPoint.day)} cy={ty(hoveredPoint.predicted)} r="5" fill="#18181b" stroke="#71717a" strokeWidth="2" />

                                {(() => {
                                    const tipX = Math.min(tx(hoveredPoint.day) + 15, w - 180);
                                    const tipY = Math.max(ty(hoveredPoint.predicted) - 80, pad.top);
                                    return (
                                        <g className="chart-tooltip">
                                            <rect x={tipX} y={tipY} width={160} height={hoveredPoint.actual ? 70 : 50} rx="8" fill="#18181b" stroke="#27272a" strokeWidth="1" />
                                            <text x={tipX + 12} y={tipY + 22} fill="#e4e4e7" fontSize="13" fontWeight="600">Day {hoveredPoint.day}</text>
                                            {hoveredPoint.actual && (
                                                <text x={tipX + 12} y={tipY + 42} fill="var(--primary)" fontSize="12" fontWeight="500">Actual : ₱{hoveredPoint.actual.toFixed(2)}</text>
                                            )}
                                            <text x={tipX + 12} y={tipY + (hoveredPoint.actual ? 60 : 42)} fill="#a1a1aa" fontSize="11">Predicted : ₱{hoveredPoint.predicted.toFixed(2)}</text>
                                        </g>
                                    );
                                })()}
                            </g>
                        )}
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default Predictions;
