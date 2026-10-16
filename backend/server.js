const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5183',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5183',
    'http://127.0.0.1:3000',
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (Postman, curl, same-origin) or whitelisted origins
        if (!origin || ALLOWED_ORIGINS.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy: origin ${origin} not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth',            require('./routes/auth'));
app.use('/api/family-members',  require('./routes/family'));
app.use('/api/budgets',         require('./routes/budget'));
app.use('/api/inventory',       require('./routes/inventory'));
app.use('/api/equipment',       require('./routes/equipment'));
app.use('/api/preferences',     require('./routes/preferences'));
app.use('/api/ingredients',     require('./routes/ingredients'));
app.use('/api/recipes',         require('./routes/recipes'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/dashboard',       require('./routes/dashboard'));
app.use('/api/admin',           require('./routes/admin'));
app.use('/api/dataset',         require('./routes/dataset'));   // Dataset Management

// Ensure tmp_uploads dir exists
const tmpDir = path.join(__dirname, 'tmp_uploads');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
