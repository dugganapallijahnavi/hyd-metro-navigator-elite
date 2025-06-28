
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const Database = require('./database/database');
const lineRoutes = require('./routes/lineRoutes');
const stationRoutes = require('./routes/stationRoutes');
const routeRoutes = require('./routes/routeRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
const db = new Database();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add database to request
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/lines', lineRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/route', routeRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  console.log(`🚇 Hyderabad Metro Backend Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  
  // Initialize database tables
  try {
    await db.initialize();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
});

module.exports = app;
