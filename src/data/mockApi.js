// src/data/mockApi.js

const API_BASE_URL = '/api/expenses';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

/**
 * Standardizes API responses to ensure both 'id' and '_id' are available.
 * This bridges the gap between Django (id) and legacy Express (_id).
 */
const mapResponse = (data) => {
    if (Array.isArray(data)) {
        return data.map(item => ({ ...item, _id: item.id || item._id, id: item.id || item._id }));
    }
    return { ...data, _id: data.id || data._id, id: data.id || data._id };
};

export const getExpenses = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch expenses');
        const data = await response.json();
        return mapResponse(data);
    } catch (error) {
        console.error('API Error (getExpenses):', error);
        throw error;
    }
};

export const addExpense = async (expense) => {
    try {
        const response = await fetch(`${API_BASE_URL}/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                ...expense,
                type: 'expense',
                date: expense.date || new Date().toISOString().split('T')[0]
            })
        });
        if (!response.ok) throw new Error('Failed to add expense');
        const data = await response.json();
        return mapResponse(data);
    } catch (error) {
        console.error('API Error (addExpense):', error);
        throw error;
    }
};

export const deleteExpense = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}/`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete expense');
        return { success: true };
    } catch (error) {
        console.error('API Error (deleteExpense):', error);
        throw error;
    }
};

export const updateExpense = async (id, expense) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}/`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({
                ...expense,
                type: 'expense',
                date: expense.date || new Date().toISOString().split('T')[0]
            })
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to update expense');
        }
        const data = await response.json();
        return mapResponse(data);
    } catch (error) {
        console.error('API Error (updateExpense):', error);
        throw error;
    }
};

export const getSummary = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/summary/`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch summary');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error (getSummary):', error);
        throw error;
    }
};

export const getBudgets = async () => {
    try {
        const response = await fetch('/api/budgets/', {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch budgets');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error (getBudgets):', error);
        throw error;
    }
};

export const createBudget = async (budget) => {
    try {
        const response = await fetch('/api/budgets/', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(budget)
        });
        if (!response.ok) throw new Error('Failed to create budget');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error (createBudget):', error);
        throw error;
    }
};

export const updateBudget = async (id, budget) => {
    try {
        const response = await fetch(`/api/budgets/${id}/`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(budget)
        });
        if (!response.ok) throw new Error('Failed to update budget');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error (updateBudget):', error);
        throw error;
    }
};
