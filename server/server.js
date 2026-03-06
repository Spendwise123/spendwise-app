const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Seed demo accounts if they don't exist
const seedDemoAccounts = async () => {
    try {
        const demoAccounts = [
            { name: 'Admin User', email: 'admin@spendwise.com', password: 'demo123', role: 'admin' },
            { name: 'Sarah Johnson', email: 'sarah@example.com', password: 'demo123', role: 'user' }
        ];

        for (const account of demoAccounts) {
            const exists = await User.findOne({ email: account.email });
            if (!exists) {
                await User.create(account);
                console.log(`Demo account created: ${account.email}`);
            }
        }
    } catch (error) {
        console.error('Error seeding demo accounts:', error.message);
    }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    // Seed demo accounts after server starts and DB is connected
    setTimeout(seedDemoAccounts, 2000);
});
