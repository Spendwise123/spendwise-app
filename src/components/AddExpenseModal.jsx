import React, { useState } from 'react';
import './AddExpenseModal.css';
import { CATEGORIES } from '../constants/categories';

const AddExpenseModal = ({ isOpen, onClose, onAdd }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.category || !formData.description || !formData.date) return;

        setIsSubmitting(true);
        try {
            await onAdd({
                ...formData,
                amount: parseFloat(formData.amount)
            });

            setFormData({
                amount: '',
                category: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-header-text">
                        <h2>Add New Expense</h2>
                        <p>Log a new expense to track your spending</p>
                    </div>
                    <button className="close-modal" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>
                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Amount (₱)</label>
                        <input
                            type="number"
                            name="amount"
                            placeholder="0.00"
                            step="0.01"
                            autoFocus
                            required
                            disabled={isSubmitting}
                            value={formData.amount}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select 
                            name="category" 
                            required 
                            disabled={isSubmitting}
                            value={formData.category} 
                            onChange={handleInputChange} 
                        >
                            <option value="" disabled>Select category</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <input
                            type="text"
                            name="description"
                            placeholder="What did you spend on?"
                            required
                            disabled={isSubmitting}
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            name="date"
                            required
                            disabled={isSubmitting}
                            value={formData.date}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddExpenseModal;
