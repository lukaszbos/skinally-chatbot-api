import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import conversationsRoutes from './routes/conversations.js';
import usersRoutes from './routes/users.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { closeDb } from './db/database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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
	console.log(`🚀 Server running on http://localhost:${PORT}`);
	console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
	console.log('SIGTERM signal received: closing HTTP server');
	server.close(() => {
		console.log('HTTP server closed');
		closeDb();
		process.exit(0);
	});
});

process.on('SIGINT', () => {
	console.log('SIGINT signal received: closing HTTP server');
	server.close(() => {
		console.log('HTTP server closed');
		closeDb();
		process.exit(0);
	});
});

export default app;

