const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { protect } = require('../middleware/authMiddleware');

// All routes below require authentication
router.use(protect);

// @desc    Get all expenses for current user
// @route   GET /api/expenses
router.get('/', async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// @desc    Add new expense
// @route   POST /api/expenses
router.post('/', async (req, res) => {
    const { description, amount, category, date } = req.body;

    if (!description || amount == null || !category) {
        return res.status(400).json({ message: 'Please provide description, amount and category' });
    }

    try {
        const expense = await Expense.create({
            userId: req.user.id,
            description,
            amount: Number(amount),
            category,
            date: date || new Date()
        });

        res.status(201).json(expense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
    try {
        const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });

        if (expense) {
            await expense.deleteOne();
            res.json({ message: 'Expense removed' });
        } else {
            res.status(404).json({ message: 'Expense not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
