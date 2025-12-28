import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import conversationsRoutes from './routes/conversations.js';
import usersRoutes from './routes/users.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { closeDb } from './db/database.js';
import { logger } from './util/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Request logging middleware
app.use((req, res, next) => {
	const start = Date.now();
	
	res.on('finish', () => {
		const duration = Date.now() - start;
		logger.info(`${req.method} ${req.path}`, {
			status: res.statusCode,
			duration: `${duration}ms`,
			ip: req.ip || req.socket.remoteAddress
		});
	});
	
	next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/conversations', conversationsRoutes);
app.use('/api/users', usersRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
	logger.info(`🚀 Server started successfully`, {
		port: PORT,
		environment: process.env.NODE_ENV || 'development',
		healthCheck: `http://localhost:${PORT}/health`
	});
});

// Graceful shutdown
process.on('SIGTERM', () => {
	logger.info('SIGTERM signal received: closing HTTP server');
	server.close(() => {
		logger.info('HTTP server closed');
		closeDb();
		process.exit(0);
	});
});

process.on('SIGINT', () => {
	logger.info('SIGINT signal received: closing HTTP server');
	server.close(() => {
		logger.info('HTTP server closed');
		closeDb();
		process.exit(0);
	});
});

export default app;

