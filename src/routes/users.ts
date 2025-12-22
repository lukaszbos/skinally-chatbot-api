import { Router } from 'express';
import { getDb } from '../db/database.js';

const router = Router();

// POST /api/users/login - Login/Create user by name
router.post('/login', async (req, res, next) => {
	try {
		const { userName } = req.body;

		if (!userName || typeof userName !== 'string' || userName.trim().length === 0) {
			return res.status(400).json({ error: 'userName is required' });
		}

		const db = getDb();
		const trimmedUserName = userName.trim();
		const now = new Date().toISOString();

		// Check if user exists
		let user = db.prepare('SELECT * FROM users WHERE userName = ?').get(trimmedUserName);

		if (!user) {
			// Create new user
			const result = db
				.prepare('INSERT INTO users (userName, createdAt, lastActiveAt) VALUES (?, ?, ?)')
				.run(trimmedUserName, now, now);

			user = {
				userName: trimmedUserName,
				currentAnalysisId: null,
				createdAt: now,
				lastActiveAt: now
			};
		} else {
			// Update lastActiveAt
			db.prepare('UPDATE users SET lastActiveAt = ? WHERE userName = ?').run(now, trimmedUserName);
			// Re-fetch user to get latest currentAnalysisId
			user = db.prepare('SELECT * FROM users WHERE userName = ?').get(trimmedUserName);
		}

		res.json(user);
	} catch (error) {
		next(error);
	}
});

// GET /api/users/:userName/sessions - Get user sessions (all conversations)
router.get('/:userName/sessions', async (req, res, next) => {
	try {
		const { userName } = req.params;
		const db = getDb();

		const user = db.prepare('SELECT * FROM users WHERE userName = ?').get(userName);

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Get all conversations for this user
		const conversations = db
			.prepare('SELECT analysisId, updatedAt FROM conversations WHERE userName = ? ORDER BY updatedAt DESC')
			.all(userName);

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
		next(error);
	}
});

export default router;

