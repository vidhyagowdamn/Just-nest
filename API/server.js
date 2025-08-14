const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Import routes
const authRoutes = require('./routes/auth');
const legalIssuesRoutes = require('./routes/legalIssues');
const lawyersRoutes = require('./routes/lawyers');
const resourcesRoutes = require('./routes/resources');
const translationsRoutes = require('./routes/translations');
const notificationsRoutes = require('./routes/notifications');
const emergencyRoutes = require('./routes/emergency');

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            connectSrc: ["'self'", "wss:", "ws:"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Middleware
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/legal-issues', legalIssuesRoutes);
app.use('/api/lawyers', lawyersRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/translations', translationsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/emergency', emergencyRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Serve the main HTML file for all routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO for real-time features
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user to their language room
    socket.on('join-language', (language) => {
        socket.join(`lang-${language}`);
        console.log(`User ${socket.id} joined language room: ${language}`);
    });

    // Handle legal issue submissions
    socket.on('submit-legal-issue', (data) => {
        // Broadcast to all users in the same language room
        socket.to(`lang-${data.language}`).emit('new-legal-issue', data);
        
        // Notify lawyers about new case
        socket.to('lawyers').emit('new-case-available', {
            category: data.category,
            urgency: data.urgency,
            language: data.language
        });
    });

    // Handle emergency alerts
    socket.on('emergency-alert', (data) => {
        // Broadcast emergency to all connected users
        io.emit('emergency-broadcast', {
            type: 'emergency',
            message: data.message,
            location: data.location,
            timestamp: new Date().toISOString()
        });
    });

    // Handle lawyer availability updates
    socket.on('lawyer-status-update', (data) => {
        socket.broadcast.emit('lawyer-status-changed', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🚀 JUSTNEST Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = { app, server, io }; 