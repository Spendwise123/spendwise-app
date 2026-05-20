import React, { useState, useEffect } from 'react';
import './Expenses.css';
import AddExpenseModal from '../components/AddExpenseModal';
import { useAuth } from '../context/AuthContext';
import { getExpenses, addExpense, deleteExpense, updateExpense } from '../data/mockApi';
import { CATEGORIES } from '../constants/categories';
import useToast from '../components/Toast';

const Expenses = () => {
    const { getToken } = useAuth();
    const { addToast, ToastContainer } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All Categories');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [editingExpense, setEditingExpense] = useState(null);

    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        const fetchExpenses = async () => {
            setIsLoading(true);
            try {
                const data = await getExpenses();
                setExpenses(data);
            } catch (error) {
                console.error('Error fetching expenses:', error);
                if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
                    addToast('Session expired. Please login again.', 'warning');
                } else {
                    addToast('Failed to load expenses.', 'error');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchExpenses();
    }, []);

    const handleAddExpense = async (newExpense) => {
        try {
            const data = await addExpense(newExpense);
            setExpenses(prev => [data, ...prev]);
            setIsModalOpen(false);
            addToast('Expense added successfully!', 'success');
        } catch (error) {
            console.error('Error adding expense:', error);
            addToast('Failed to add expense. Please try again.', 'error');
        }
    };

    const handleUpdateExpense = async (updatedData) => {
        if (!editingExpense) return;
        const id = editingExpense.id || editingExpense._id;
        try {
            const data = await updateExpense(id, updatedData);
            setExpenses(prev => prev.map(exp =>
                (exp.id || exp._id) === id ? data : exp
            ));
            setEditingExpense(null);
            setIsModalOpen(false);
            addToast('Expense updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating expense:', error);
            addToast('Failed to update expense. Please try again.', 'error');
        }
    };

    const handleDeleteExpense = async (id) => {
        try {
            await deleteExpense(id);
            setExpenses(prev => prev.filter(exp => (exp.id || exp._id) !== id));
            addToast('Expense deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting expense:', error);
            addToast('Failed to delete expense.', 'error');
        }
    };

    const openEditModal = (expense) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingExpense(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingExpense(null);
    };

    const filteredExpenses = expenses.filter(exp => {
        const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All Categories' || exp.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const totalSpent = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    if (isLoading) {
        return (
            <div className="expenses-container loading-wrapper">
                <div className="spinner"></div>
                <p>Curating your transaction history...</p>
            </div>
        );
    }

    return (
        <div className="expenses-container">
            <ToastContainer />
            <header className="page-header">
                <div className="header-left">
                    <h1>Expenses</h1>
                    <p>Manage and track all your expenses</p>
                </div>
                <button className="add-expense-btn" onClick={openAddModal}>
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
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
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
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="empty-state">
                                        <p>No transactions found matching your criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map((exp) => (
                                    <tr key={exp.id || exp._id}>
                                        <td>{new Date(exp.date).toLocaleDateString()}</td>
                                        <td className="description">{exp.description}</td>
                                        <td><span className="category-pill">{exp.category}</span></td>
                                        <td className="amount">₱{exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="actions">
                                            <button className="edit-btn" onClick={() => openEditModal(exp)} title="Edit expense">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                            </button>
                                            <button className="delete-btn" onClick={() => handleDeleteExpense(exp.id || exp._id)} title="Delete expense">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Shared Modal Component — supports both Add and Edit */}
            <AddExpenseModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onAdd={editingExpense ? handleUpdateExpense : handleAddExpense}
                editingExpense={editingExpense}
            />
        </div>
    );
};

export default Expenses;
