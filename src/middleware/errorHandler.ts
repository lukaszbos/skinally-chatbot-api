import { Request, Response, NextFunction } from 'express';

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

	console.error('Error:', {
		status,
		message,
		stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
		path: req.path,
		method: req.method
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
	res.status(404).json({
		error: 'Route not found',
		path: req.path
	});
}

