import React, { useState, useEffect } from 'react';
import './EditBudgetModal.css';

const EditBudgetModal = ({ isOpen, onClose, onSave, currentBudget }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [amount, setAmount] = useState('');

    useEffect(() => {
        if (isOpen) {
            setAmount(currentBudget ? currentBudget.toString() : '');
        }
    }, [isOpen, currentBudget]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return;

        setIsSubmitting(true);
        try {
            await onSave(parseFloat(amount));
            onClose();
        } catch (error) {
            console.error('Error saving budget:', error);
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
                        <h2>Edit Monthly Budget</h2>
                        <p>Adjust your overall monthly spending limit</p>
                    </div>
                    <button className="close-modal" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>
                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Monthly Limit (₱)</label>
                        <input
                            type="number"
                            name="amount"
                            placeholder="2000.00"
                            step="0.01"
                            min="0.01"
                            autoFocus
                            required
                            disabled={isSubmitting}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBudgetModal;
