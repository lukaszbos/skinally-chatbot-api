import { Router } from 'express';
import { getDb } from '../db/database.js';
import { logger } from '../util/logger.js';

const router = Router();

// POST /api/users/login - Login/Create user by name
router.post('/login', async (req, res, next) => {
	try {
		const { userName } = req.body;

		if (!userName || typeof userName !== 'string' || userName.trim().length === 0) {
			logger.warn('Login attempt with invalid userName', { userName });
			return res.status(400).json({ error: 'userName is required' });
		}

		const db = getDb();
		const trimmedUserName = userName.trim();
		const now = new Date().toISOString();

		logger.debug(`Processing login for user: ${trimmedUserName}`);

		// Check if user exists
		let user = db.prepare('SELECT * FROM users WHERE userName = ?').get(trimmedUserName);

		if (!user) {
			// Create new user
			logger.info(`Creating new user: ${trimmedUserName}`);
			const result = db
				.prepare('INSERT INTO users (userName, createdAt, lastActiveAt) VALUES (?, ?, ?)')
				.run(trimmedUserName, now, now);

			user = {
				userName: trimmedUserName,
				currentAnalysisId: null,
				createdAt: now,
				lastActiveAt: now
			};
			logger.info(`New user created successfully: ${trimmedUserName}`);
		} else {
			// Update lastActiveAt
			logger.debug(`User exists, updating lastActiveAt: ${trimmedUserName}`);
			db.prepare('UPDATE users SET lastActiveAt = ? WHERE userName = ?').run(now, trimmedUserName);
			// Re-fetch user to get latest currentAnalysisId
			user = db.prepare('SELECT * FROM users WHERE userName = ?').get(trimmedUserName);
			logger.info(`User logged in: ${trimmedUserName}`, { currentAnalysisId: user.currentAnalysisId });
		}

		res.json(user);
	} catch (error) {
		logger.error(`Error during login for user: ${req.body.userName}`, { error });
		next(error);
	}
});

// GET /api/users/:userName/sessions - Get user sessions (all conversations)
router.get('/:userName/sessions', async (req, res, next) => {
	try {
		const { userName } = req.params;
		logger.debug(`Fetching sessions for user: ${userName}`);
		const db = getDb();

		const user = db.prepare('SELECT * FROM users WHERE userName = ?').get(userName);

		if (!user) {
			logger.warn(`User not found: ${userName}`);
			return res.status(404).json({ error: 'User not found' });
		}

		// Get all conversations for this user
		const conversations = db
			.prepare('SELECT analysisId, updatedAt FROM conversations WHERE userName = ? ORDER BY updatedAt DESC')
			.all(userName);

		logger.info(`Retrieved ${conversations.length} session(s) for user: ${userName}`);
		res.json({
			userName: user.userName,
			currentAnalysisId: user.currentAnalysisId,
			lastActiveAt: user.lastActiveAt,
			conversations: conversations.map((c: any) => ({
				analysisId: c.analysisId,
				updatedAt: c.updatedAt
			}))
		});
	} catch (error) {
		logger.error(`Error fetching sessions for user: ${req.params.userName}`, { error });
		next(error);
	}
});

export default router;

