import { Router } from 'express';
import { getDb } from '../db/database.js';

const router = Router();

// GET /api/conversations/:userName - Get all conversations for a user
router.get('/:userName', async (req, res, next) => {
	try {
		const { userName } = req.params;
		const db = getDb();

		const conversations = db
			.prepare('SELECT * FROM conversations WHERE userName = ? ORDER BY updatedAt DESC')
			.all(userName);

		res.json(conversations);
	} catch (error) {
		next(error);
	}
});

// GET /api/conversations/:userName/:analysisId - Get specific conversation
router.get('/:userName/:analysisId', async (req, res, next) => {
	try {
		const { userName, analysisId } = req.params;
		const db = getDb();

		const conversation = db
			.prepare('SELECT * FROM conversations WHERE userName = ? AND analysisId = ?')
			.get(userName, analysisId);

		if (!conversation) {
			return res.status(404).json({ error: 'Conversation not found' });
		}

		res.json(conversation);
	} catch (error) {
		next(error);
	}
});

// POST /api/conversations - Create new conversation
router.post('/', async (req, res, next) => {
	try {
		const { userName, analysisId, analysisData, chatMessages, beautyPlan } = req.body;

		if (!userName || !analysisId) {
			return res.status(400).json({ error: 'userName and analysisId are required' });
		}

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

		res.status(201).json({
			id: result.lastInsertRowid,
			userName,
			analysisId,
			createdAt: now,
			updatedAt: now
		});
	} catch (error) {
		next(error);
	}
});

// PUT /api/conversations/:userName/:analysisId - Update conversation
router.put('/:userName/:analysisId', async (req, res, next) => {
	try {
		const { userName, analysisId } = req.params;
		const { analysisData, chatMessages, beautyPlan } = req.body;
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
			return res.status(404).json({ error: 'Conversation not found' });
		}

		const updated = db
			.prepare('SELECT * FROM conversations WHERE userName = ? AND analysisId = ?')
			.get(userName, analysisId);

		res.json(updated);
	} catch (error) {
		next(error);
	}
});

// DELETE /api/conversations/:userName/:analysisId - Delete conversation
router.delete('/:userName/:analysisId', async (req, res, next) => {
	try {
		const { userName, analysisId } = req.params;
		const db = getDb();

		const result = db
			.prepare('DELETE FROM conversations WHERE userName = ? AND analysisId = ?')
			.run(userName, analysisId);

		if (result.changes === 0) {
			return res.status(404).json({ error: 'Conversation not found' });
		}

		res.status(204).send();
	} catch (error) {
		next(error);
	}
});

export default router;

