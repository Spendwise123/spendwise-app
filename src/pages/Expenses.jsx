import React, { useState, useEffect } from 'react';
import './Expenses.css';
import AddExpenseModal from '../components/AddExpenseModal';
import { useAuth } from '../context/AuthContext';

const Expenses = () => {
    const { getToken } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All Categories');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ══════════════════════════════════════════════════════════
    // ARRAY: Expenses Array (Array of Objects)
    // Each element is an object with id, date, description, category, amount.
    // This is the main data structure for the Expenses page.
    // ══════════════════════════════════════════════════════════
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const response = await fetch('/api/expenses', {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
                const data = await response.json();
                setExpenses(data);
            } catch (error) {
                console.error('Error fetching expenses:', error);
            }
        };
        fetchExpenses();
    }, []);

    // ══════════════════════════════════════════════════════════
    // ARRAY METHOD: Adding to Array (Spread Operator)
    // Creates a new array with the new expense at the front.
    // [newEntry, ...prev] means: put newEntry first, then all previous items.
    // ══════════════════════════════════════════════════════════
    const handleAddExpense = async (newExpense) => {
        try {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify(newExpense),
            });
            const data = await response.json();
            setExpenses(prev => [data, ...prev]);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    };

    // ══════════════════════════════════════════════════════════
    // ARRAY METHOD: .filter() — Removing from Array
    // Creates a new array WITHOUT the deleted item.
    // Keeps only items whose id does NOT match the one being deleted.
    // ══════════════════════════════════════════════════════════
    const handleDeleteExpense = async (id) => {
        try {
            await fetch(`/api/expenses/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            setExpenses(prev => prev.filter(exp => exp._id !== id));
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    // ══════════════════════════════════════════════════════════
    // ARRAY METHOD: .filter() — Searching & Filtering
    // Creates a new array that only includes expenses matching
    // the search term AND the selected category.
    // ══════════════════════════════════════════════════════════
    const filteredExpenses = expenses.filter(exp => {
        const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All Categories' || exp.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // ══════════════════════════════════════════════════════════
    // ARRAY METHOD: .reduce() — Computing Total
    // Loops through every item and adds up the 'amount' field.
    // Result is a single number: the total amount spent.
    // ══════════════════════════════════════════════════════════
    const totalSpent = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <div className="expenses-container">
            <header className="page-header">
                <div className="header-left">
                    <h1>Expenses</h1>
                    <p>Manage and track all your expenses</p>
                </div>
                <button className="add-expense-btn" onClick={() => setIsModalOpen(true)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                    Add Expense
                </button>
            </header>

            <div className="expenses-stats">
                <div className="card stat-card">
                    <p className="stat-label">Total Expenses</p>
                    <h2 className="stat-value">{expenses.length}</h2>
                </div>
                <div className="card stat-card">
                    <p className="stat-label">Total Spent</p>
                    <h2 className="stat-value">₱{expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                </div>
                <div className="card stat-card">
                    <p className="stat-label">Filtered Total</p>
                    <h2 className="stat-value">₱{totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                </div>
            </div>

            <div className="card table-card">
                <div className="table-header">
                    <h3>Expense History</h3>
                    <p className="subtitle">{filteredExpenses.length} transactions</p>

                    <div className="table-controls">
                        <div className="search-bar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            <input
                                type="text"
                                placeholder="Search expenses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="category-select"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option>All Categories</option>
                            <option>Food & Dining</option>
                            <option>Shopping</option>
                            <option>Transport</option>
                            <option>Entertainment</option>
                            <option>Utilities</option>
                        </select>
                    </div>
                </div>

                <div className="table-container">
                    <table className="expenses-table">
                        <thead>
                            <tr>
                                <th>Date <span className="sort-icon">⌄</span></th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map((exp) => (
                                <tr key={exp._id}>
                                    <td>{new Date(exp.date).toLocaleDateString()}</td>
                                    <td className="description">{exp.description}</td>
                                    <td><span className="category-pill">{exp.category}</span></td>
                                    <td className="amount">₱{exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="actions">
                                        <button className="delete-btn" onClick={() => handleDeleteExpense(exp._id)}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Shared Modal Component */}
            <AddExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddExpense}
            />
        </div>
    );
};

export default Expenses;
