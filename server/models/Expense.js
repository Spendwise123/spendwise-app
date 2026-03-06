const mongoose = require('mongoose');

const expenseSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
