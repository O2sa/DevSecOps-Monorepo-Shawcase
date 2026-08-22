import { app } from './app';
import { environment } from './config/environment';

const PORT = environment.port;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Notification Service] Running on port ${PORT}`);
});

const handleShutdown = (signal: string) => {
  console.log(`[Notification Service] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[Notification Service] Closed out remaining connections.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
