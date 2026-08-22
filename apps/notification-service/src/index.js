const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 8003;

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'notification-service',
    framework: 'Express',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root fallback endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'Notification Service',
    description: 'Internal notification and alert dispatch microservice',
    status: 'Scaffolded (Phase 1)',
    health: '/health'
  });
});

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Notification Service] Running on port ${PORT}`);
});

// Graceful Shutdown
const handleShutdown = (signal) => {
  console.log(`[Notification Service] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[Notification Service] Closed out remaining connections.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
