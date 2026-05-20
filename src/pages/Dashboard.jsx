import React, { useState, useRef, useEffect, useMemo } from 'react';
import './Dashboard.css';
import AddExpenseModal from '../components/AddExpenseModal';
import EditBudgetModal from '../components/EditBudgetModal';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import { getExpenses, addExpense, getSummary, getBudgets, createBudget, updateBudget } from '../data/mockApi';
import { CATEGORIES } from '../constants/categories';
import useToast from '../components/Toast';

const Dashboard = () => {
    const { getToken } = useAuth();
    const { addToast, ToastContainer } = useToast();
    // ══════════════════════════════════════════════════════════
    // ARRAY #1: Expenses Array (Array of Objects)
    // Each element is an object with id, date, description, category, amount.
    // We use useState so React re-renders when the array changes.
    // ══════════════════════════════════════════════════════════
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState({
        total_spending: 0,
        category_breakdown: [],
        trajectory: [],
        count: 0
    });

    const [isLoading, setIsLoading] = useState(true);
    const [budgetObj, setBudgetObj] = useState(null);
    const [budgetLimit, setBudgetLimit] = useState(2000.00);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [expenseData, summaryData, budgetData] = await Promise.all([
                    getExpenses(),
                    getSummary(),
                    getBudgets()
                ]);
                setExpenses(expenseData);
                setSummary(summaryData);
                
                const totalBudget = budgetData.find(b => b.category === 'Total' && b.period === 'monthly');
                if (totalBudget) {
                    setBudgetObj(totalBudget);
                    setBudgetLimit(parseFloat(totalBudget.limit));
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);

    // ══════════════════════════════════════════════════════════
    // ARRAY METHOD: .push() via setExpenses
    // When a new expense is added, we create a new array with
    // the new item at the front using the spread operator [...prev]
    // ══════════════════════════════════════════════════════════
    const handleAddExpense = async (newExpense) => {
        try {
            const data = await addExpense(newExpense);
            setExpenses(prev => [data, ...prev]);
            // Refresh summary after adding
            const newSummary = await getSummary();
            setSummary(newSummary);
            setIsModalOpen(false);
            addToast('Expense added successfully!', 'success');
        } catch (error) {
            console.error('Error adding expense:', error);
            addToast('Failed to add expense. Please try again.', 'error');
        }
    };

    const handleSaveBudget = async (newLimit) => {
        try {
            if (budgetObj) {
                const updated = await updateBudget(budgetObj.id, {
                    category: 'Total',
                    limit: newLimit,
                    period: 'monthly'
                });
                setBudgetObj(updated);
                setBudgetLimit(parseFloat(updated.limit));
            } else {
                const created = await createBudget({
                    category: 'Total',
                    limit: newLimit,
                    period: 'monthly'
                });
                setBudgetObj(created);
                setBudgetLimit(parseFloat(created.limit));
            }
            addToast('Monthly budget updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating budget:', error);
            addToast('Failed to update monthly budget.', 'error');
            throw error;
        }
    };

    // ══════════════════════════════════════════════════════════
    // ARRAY METHOD: .reduce() — Computes the total of all amounts
    // This loops through every item in the expenses array and
    // adds up the 'amount' field to get the total spending.
    // ══════════════════════════════════════════════════════════
    const totalSpending = summary.total_spending;

    // ══════════════════════════════════════════════════════════
    // ARRAY #2: Categories Array (Simple String Array)
    // Used to define what categories are available in the system.
    // This same array can be reused in dropdowns and filters.
    // ══════════════════════════════════════════════════════════
    const categories = ['Food & Dining', 'Shopping', 'Transport', 'Health', 'Education', 'Entertainment', 'Utilities'];

    // ══════════════════════════════════════════════════════════
    // ARRAY #3: Summary Stats Array (Array of Objects)
    // Instead of hardcoding each stat card, we define them in
    // an array and use .map() to render them dynamically.
    // ══════════════════════════════════════════════════════════
    const summaryStats = [
        { 
            label: 'Monthly Budget', 
            value: (
                <div className="budget-value-container">
                    <span>₱{budgetLimit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <button className="edit-budget-inline-btn" onClick={() => setIsBudgetModalOpen(true)} title="Edit Budget">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                    </button>
                </div>
            )
        },
        { label: 'Current Spending', value: `₱${totalSpending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { label: 'Total Expenses', value: summary.count },
        { label: 'Over Budget', value: `₱${Math.max(0, totalSpending - budgetLimit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    ];

    // ── Trajectory Chart data & state ──
    const trajectoryData = useMemo(() => {
        if (!summary.trajectory.length) return [];
        const data = [...summary.trajectory];
        const lastDay = data[data.length - 1];
        for (let i = data.length + 1; i <= 30; i++) {
            data.push({
                day: i,
                predicted: lastDay.actual + (lastDay.actual / lastDay.day) * (i - lastDay.day)
            });
        }
        return data;
    }, [summary.trajectory]);

    const [hoveredPoint, setHoveredPoint] = useState(null);
    const trajRef = useRef(null);

    const predictedTotal = useMemo(() => {
        if (!trajectoryData.length) return totalSpending;
        return trajectoryData[trajectoryData.length - 1]?.predicted ?? totalSpending;
    }, [trajectoryData, totalSpending]);

    const gaugePercent = budgetLimit > 0 ? Math.round((predictedTotal / budgetLimit) * 100) : 0;
    const strokeDashoffset = 188.5 - (Math.min(1, predictedTotal / budgetLimit) * 188.5);
    const isOver = predictedTotal > budgetLimit;

    // ══════════════════════════════════════════════════════════
    // ARRAY #5: Category Chart Data (Array of Objects)
    // Each element has a label and amount. We use .map() later
    // to render each bar in the horizontal bar chart.
    // ══════════════════════════════════════════════════════════
    const categoryData = summary.category_breakdown.map(item => ({
        label: item.category,
        amount: item.amount
    }));
    const maxCategory = 1200;
    const [hoveredBar, setHoveredBar] = useState(null);

    // ── Trajectory helpers ──
    const tPad = { top: 20, right: 20, bottom: 30, left: 50 };
    const tW = 560, tH = 260;
    const innerW = tW - tPad.left - tPad.right;
    const innerH = tH - tPad.top - tPad.bottom;
    const maxY = 3400;
    const yTicks = [0, 850, 1700, 2550, 3400];

    const tx = (day) => tPad.left + ((day - 1) / 27) * innerW;
    const ty = (val) => tPad.top + innerH - (val / maxY) * innerH;

    const buildPath = (data, key) => {
        const pts = data.filter(d => d[key] != null);
        return pts.map((d, i) => `${i === 0 ? 'M' : 'L'}${tx(d.day).toFixed(1)} ${ty(d[key]).toFixed(1)}`).join(' ');
    };

    const actualPath = buildPath(trajectoryData, 'actual');
    const predictedPath = buildPath(trajectoryData, 'predicted');

    const handleTrajHover = (e) => {
        if (!trajRef.current) return;
        const rect = trajRef.current.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * tW;
        let closest = null, minDist = Infinity;
        trajectoryData.forEach(d => {
            const dist = Math.abs(tx(d.day) - mouseX);
            if (dist < minDist) { minDist = dist; closest = d; }
        });
        if (closest && minDist < innerW / 28) {
            setHoveredPoint(closest);
        } else {
            setHoveredPoint(null);
        }
    };

    // ── Category helpers ──
    const cPad = { top: 30, right: 30, bottom: 30, left: 110 };
    const cW = 560, cH = 280;
    const cInnerW = cW - cPad.left - cPad.right;
    const cInnerH = cH - cPad.top - cPad.bottom;
    const barH = 20;
    const barGap = (cInnerH - categoryData.length * barH) / (categoryData.length + 1);
    const xTicks = [0, 300, 600, 900, 1200];

    if (isLoading) {
        return (
            <div className="dashboard-container loading-container">
                <div className="spinner"></div>
                <p>Loading your financial summary...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <ToastContainer />
            <header className="page-header">
                <div className="header-left">
                    <h1>Budget Dashboard</h1>
                    <p>Track your spending and AI predictions</p>
                </div>
                <Button className="add-expense-btn" onClick={() => setIsModalOpen(true)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                    Add Expense
                </Button>
            </header>

            <div className="dashboard-grid">
                {/* ── Top Row: Gauge and Stats ── */}
                <div className="top-row-grid full-width">
                    <Card className="gauge-card">
                        <div className="gauge-outer">
                            <div className="gauge-container">
                                <svg viewBox="0 0 100 100" className="gauge">
                                    <path
                                        d="M 20 80 A 40 40 0 1 1 80 80"
                                        fill="none"
                                        stroke="#1f1f23"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M 20 80 A 40 40 0 1 1 80 80"
                                        fill="none"
                                        stroke={isOver ? 'var(--danger)' : 'var(--primary)'}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray="188.5"
                                        strokeDashoffset={strokeDashoffset}
                                    />
                                    <text x="50" y="45" className="gauge-percent">{gaugePercent}%</text>
                                    <text x="50" y="60" className="gauge-label">of budget</text>
                                </svg>
                            </div>
                            <p className="gauge-subtext">Predicted vs Budget</p>
                            <span className={`badge ${isOver ? 'danger' : 'success'}`}>
                                {isOver ? 'High Risk' : 'On Track'}
                            </span>
                        </div>
                    </Card>

                    {/* ══ ARRAY .map() — Renders stat cards dynamically from summaryStats array ══ */}
                    <div className="summary-stats">
                        {summaryStats.map((stat, index) => (
                            <Card className="stat-card" key={index}>
                                <div className="stat-content">
                                    <p className="stat-label">{stat.label}</p>
                                    <h2 className="stat-value">{stat.value}</h2>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* ── Charts Row ── */}
                <div className="charts-row full-width">
                    <Card className="chart-card trajectory-chart">
                        <h3>Spending Trajectory</h3>
                        <p className="chart-subtitle">Actual vs predicted spending this month</p>
                        <div className="chart-wrapper">
                            <svg ref={trajRef} viewBox={`0 0 ${tW} ${tH}`} preserveAspectRatio="xMidYMid meet" className="interactive-chart" onMouseMove={handleTrajHover} onMouseLeave={() => setHoveredPoint(null)}>
                                {yTicks.map(v => (
                                    <g key={v}>
                                        <line x1={tPad.left} y1={ty(v)} x2={tW - tPad.right} y2={ty(v)} stroke="#1f1f23" strokeWidth="1" strokeDasharray="3 3" />
                                        <text x={tPad.left - 8} y={ty(v) + 4} textAnchor="end" fill="#71717a" fontSize="10">₱{v.toLocaleString()}</text>
                                    </g>
                                ))}
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28].map(day => (
                                    <text key={day} x={tx(day)} y={tH - 8} textAnchor="middle" fill="#71717a" fontSize="9">{day}</text>
                                ))}
                                <path d={predictedPath} fill="none" stroke="rgba(113, 113, 122, 0.5)" strokeWidth="2" strokeDasharray="5 4" />
                                <path d={actualPath} fill="none" stroke="var(--primary)" strokeWidth="3" />
                                {hoveredPoint && (
                                    <g>
                                        <line x1={tx(hoveredPoint.day)} y1={tPad.top} x2={tx(hoveredPoint.day)} y2={tH - tPad.bottom} stroke="#e4e4e7" strokeWidth="1" />
                                        {hoveredPoint.actual != null && (
                                            <circle cx={tx(hoveredPoint.day)} cy={ty(hoveredPoint.actual)} r="5" fill="var(--primary)" stroke="#fff" strokeWidth="2" />
                                        )}
                                        {(() => {
                                            const tooltipX = tx(hoveredPoint.day) + 12;
                                            const tooltipY = Math.max(ty(hoveredPoint.predicted ?? hoveredPoint.actual) - 10, 10);
                                            const boxW = 120, boxH = hoveredPoint.actual != null && hoveredPoint.predicted != null ? 68 : 48;
                                            const clampedX = Math.min(tooltipX, tW - tPad.right - boxW - 5);
                                            return (
                                                <g>
                                                    <rect x={clampedX} y={tooltipY} width={boxW} height={boxH} rx="8" fill="#18181b" stroke="#27272a" strokeWidth="1" />
                                                    <text x={clampedX + 12} y={tooltipY + 20} fill="#e4e4e7" fontSize="12" fontWeight="500">Day {hoveredPoint.day}</text>
                                                    {hoveredPoint.actual != null && (
                                                        <text x={clampedX + 12} y={tooltipY + 38} fill="var(--primary)" fontSize="12" fontWeight="600">
                                                            ₱{hoveredPoint.actual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </text>
                                                    )}
                                                    {hoveredPoint.predicted != null && (
                                                        <text x={clampedX + 12} y={tooltipY + (hoveredPoint.actual != null ? 56 : 38)} fill="#a1a1aa" fontSize="11">
                                                            ₱{hoveredPoint.predicted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </text>
                                                    )}
                                                </g>
                                            );
                                        })()}
                                    </g>
                                )}
                            </svg>
                        </div>
                    </Card>

                    <Card className="chart-card category-chart">
                        <h3>Top Spending Categories</h3>
                        <p className="chart-subtitle">Highest spending areas this month</p>
                        <div className="chart-wrapper">
                            <svg viewBox={`0 0 ${cW} ${cH}`} preserveAspectRatio="xMidYMid meet" className="interactive-chart">
                                {xTicks.map(v => {
                                    const xPos = cPad.left + (v / maxCategory) * cInnerW;
                                    return (
                                        <g key={v}>
                                            <line x1={xPos} y1={cPad.top} x2={xPos} y2={cH - cPad.bottom} stroke="#1f1f23" strokeWidth="1" strokeDasharray="3 3" />
                                            <text x={xPos} y={cH - 10} textAnchor="middle" fill="#71717a" fontSize="10">₱{v}</text>
                                        </g>
                                    );
                                })}
                                {categoryData.map((cat, i) => {
                                    const barY = cPad.top + barGap * (i + 1) + barH * i;
                                    const barWidth = (cat.amount / maxCategory) * cInnerW;
                                    const isHovered = hoveredBar === i;
                                    return (
                                        <g key={i} onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)} style={{ cursor: 'pointer' }}>
                                            <rect x={cPad.left} y={barY - 4} width={cInnerW} height={barH + 8} fill="transparent" />
                                            <rect x={cPad.left} y={barY} width={cInnerW} height={barH} rx="2" fill="#1f1f23" />
                                            <rect x={cPad.left} y={barY} width={barWidth} height={barH} rx="2" fill={isHovered ? '#e4e4e7' : 'var(--primary)'} className="bar-rect" />
                                            <text x={cPad.left - 8} y={barY + barH / 2 + 4} textAnchor="end" fill="#a1a1aa" fontSize="10">{cat.label}</text>
                                            {isHovered && (() => {
                                                const tipX = cPad.left + barWidth + 12;
                                                const tipY = barY - 8;
                                                const tipW = 140, tipH = 52;
                                                const clampedX = Math.min(tipX, cW - cPad.right - tipW);
                                                return (
                                                    <g>
                                                        <rect x={clampedX} y={tipY} width={tipW} height={tipH} rx="8" fill="#18181b" stroke="#27272a" strokeWidth="1" />
                                                        <text x={clampedX + 12} y={tipY + 20} fill="#e4e4e7" fontSize="11" fontWeight="500">{cat.label}</text>
                                                        <text x={clampedX + 12} y={tipY + 40} fill="var(--primary)" fontSize="11" fontWeight="600">
                                                            Total : ₱{cat.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </text>
                                                    </g>
                                                );
                                            })()}
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                    </Card>
                </div>

                {/* Recent Expenses */}
                <Card className="full-width">
                    <h3>Recent Expenses</h3>
                    <div className="table-container">
                        <table className="recent-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((expense) => (
                                    <tr key={expense._id}>
                                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                                        <td>{expense.description}</td>
                                        <td><span className="category-pill">{expense.category}</span></td>
                                        <td className="amount">₱{expense.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Reusable Modal Component */}
            <AddExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddExpense}
            />

            <EditBudgetModal
                isOpen={isBudgetModalOpen}
                onClose={() => setIsBudgetModalOpen(false)}
                onSave={handleSaveBudget}
                currentBudget={budgetLimit}
            />
        </div>
    );
};

export default Dashboard;
