import { Router } from 'express';
import { getDb } from '../db/database.js';
import { logger } from '../util/logger.js';

const router = Router();

// GET /api/conversations/:userName - Get all conversations for a user
router.get('/:userName', async (req, res, next) => {
	try {
		const { userName } = req.params;
		logger.debug(`Fetching all conversations for user: ${userName}`);
		const db = getDb();

		const conversations = db
			.prepare('SELECT * FROM conversations WHERE userName = ? ORDER BY updatedAt DESC')
			.all(userName);

		logger.info(`Retrieved ${conversations.length} conversation(s) for user: ${userName}`);
		res.json(conversations);
	} catch (error) {
		logger.error(`Error fetching conversations for user ${req.params.userName}`, { error });
		next(error);
	}
});

// GET /api/conversations/:userName/:analysisId - Get specific conversation
router.get('/:userName/:analysisId', async (req, res, next) => {
	try {
		const { userName, analysisId } = req.params;
		logger.debug(`Fetching conversation: ${analysisId} for user: ${userName}`);
		const db = getDb();

		const conversation = db
			.prepare('SELECT * FROM conversations WHERE userName = ? AND analysisId = ?')
			.get(userName, analysisId);

		if (!conversation) {
			logger.warn(`Conversation not found: ${analysisId} for user: ${userName}`);
			return res.status(404).json({ error: 'Conversation not found' });
		}

		// Update user's currentAnalysisId to this conversation when they open it
		db.prepare('UPDATE users SET currentAnalysisId = ? WHERE userName = ?').run(analysisId, userName);
		logger.info(`Retrieved conversation: ${analysisId} for user: ${userName}`);

		res.json(conversation);
	} catch (error) {
		logger.error(`Error fetching conversation ${req.params.analysisId} for user ${req.params.userName}`, { error });
		next(error);
	}
});

// POST /api/conversations - Create new conversation
router.post('/', async (req, res, next) => {
	try {
		const { userName, analysisId, analysisData, chatMessages, beautyPlan } = req.body;

		if (!userName || !analysisId) {
			logger.warn('Attempted to create conversation without required fields', { userName, analysisId });
			return res.status(400).json({ error: 'userName and analysisId are required' });
		}

		logger.info(`Creating new conversation: ${analysisId} for user: ${userName}`);
		const db = getDb();
		const now = new Date().toISOString();

		const result = db
			.prepare(
				`INSERT INTO conversations (userName, analysisId, analysisData, chatMessages, beautyPlan, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
			)
			.run(
				userName,
				analysisId,
				JSON.stringify(analysisData || null),
				JSON.stringify(chatMessages || []),
				JSON.stringify(beautyPlan || null),
				now,
				now
			);

		const created = db
			.prepare('SELECT * FROM conversations WHERE userName = ? AND analysisId = ?')
			.get(userName, analysisId);

		// Update user's currentAnalysisId to this conversation
		db.prepare('UPDATE users SET currentAnalysisId = ? WHERE userName = ?').run(analysisId, userName);

		logger.info(`Successfully created conversation: ${analysisId} for user: ${userName}`);
		res.status(201).json(created);
	} catch (error: any) {
		// Handle unique constraint violation (if conversation already exists)
		if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
			logger.warn(`Conversation already exists: ${req.body.analysisId} for user: ${req.body.userName}`);
			return res.status(409).json({ error: 'Conversation already exists' });
		}
		logger.error(`Error creating conversation: ${req.body.analysisId} for user: ${req.body.userName}`, { error });
		next(error);
	}
});

// PUT /api/conversations/:userName/:analysisId - Update conversation
router.put('/:userName/:analysisId', async (req, res, next) => {
	try {
		const { userName, analysisId } = req.params;
		const { analysisData, chatMessages, beautyPlan } = req.body;
		logger.debug(`Updating conversation: ${analysisId} for user: ${userName}`, {
			hasAnalysisData: !!analysisData,
			hasChatMessages: !!chatMessages,
			hasBeautyPlan: !!beautyPlan
		});
		const db = getDb();

		const now = new Date().toISOString();

		const result = db
			.prepare(
				`UPDATE conversations 
         SET analysisData = COALESCE(?, analysisData),
             chatMessages = COALESCE(?, chatMessages),
             beautyPlan = COALESCE(?, beautyPlan),
             updatedAt = ?
         WHERE userName = ? AND analysisId = ?`
			)
			.run(
				analysisData ? JSON.stringify(analysisData) : null,
				chatMessages ? JSON.stringify(chatMessages) : null,
				beautyPlan ? JSON.stringify(beautyPlan) : null,
				now,
				userName,
				analysisId
			);

		if (result.changes === 0) {
			logger.warn(`Conversation not found for update: ${analysisId} for user: ${userName}`);
			return res.status(404).json({ error: 'Conversation not found' });
		}

		const updated = db
			.prepare('SELECT * FROM conversations WHERE userName = ? AND analysisId = ?')
			.get(userName, analysisId);

		// Update user's currentAnalysisId to this conversation
		db.prepare('UPDATE users SET currentAnalysisId = ? WHERE userName = ?').run(analysisId, userName);

		logger.info(`Successfully updated conversation: ${analysisId} for user: ${userName}`);
		res.json(updated);
	} catch (error) {
		logger.error(`Error updating conversation ${req.params.analysisId} for user ${req.params.userName}`, { error });
		next(error);
	}
});

// DELETE /api/conversations/:userName/:analysisId - Delete conversation
router.delete('/:userName/:analysisId', async (req, res, next) => {
	try {
		const { userName, analysisId } = req.params;
		logger.info(`Deleting conversation: ${analysisId} for user: ${userName}`);
		const db = getDb();

		const result = db
			.prepare('DELETE FROM conversations WHERE userName = ? AND analysisId = ?')
			.run(userName, analysisId);

		if (result.changes === 0) {
			logger.warn(`Conversation not found for deletion: ${analysisId} for user: ${userName}`);
			return res.status(404).json({ error: 'Conversation not found' });
		}

		logger.info(`Successfully deleted conversation: ${analysisId} for user: ${userName}`);
		res.status(204).send();
	} catch (error) {
		logger.error(`Error deleting conversation ${req.params.analysisId} for user ${req.params.userName}`, { error });
		next(error);
	}
});

export default router;

