import { Request, Response, NextFunction } from 'express';
import { logger } from '../util/logger.js';

export interface ApiError extends Error {
	status?: number;
	statusCode?: number;
}

/**
 * Error handling middleware
 */
export function errorHandler(
	err: ApiError,
	req: Request,
	res: Response,
	next: NextFunction
): void {
	const status = err.status || err.statusCode || 500;
	const message = err.message || 'Internal server error';

	logger.error('Request error', {
		status,
		message,
		path: req.path,
		method: req.method,
		stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
	});

	res.status(status).json({
		error: message,
		...(process.env.NODE_ENV === 'development' && { stack: err.stack })
	});
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
	logger.warn('Route not found', {
		path: req.path,
		method: req.method
	});
	
	res.status(404).json({
		error: 'Route not found',
		path: req.path
	});
}

