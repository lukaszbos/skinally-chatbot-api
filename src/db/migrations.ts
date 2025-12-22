import type Database from 'better-sqlite3';

/**
 * Run database migrations
 */
export function runMigrations(db: Database.Database): void {
	// Create conversations table
	db.exec(`
		CREATE TABLE IF NOT EXISTS conversations (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			userName TEXT NOT NULL,
			analysisId TEXT NOT NULL,
			analysisData TEXT,
			chatMessages TEXT NOT NULL,
			beautyPlan TEXT,
			createdAt TEXT NOT NULL,
			updatedAt TEXT NOT NULL,
			UNIQUE(userName, analysisId)
		)
	`);

	// Create users table
	db.exec(`
		CREATE TABLE IF NOT EXISTS users (
			userName TEXT PRIMARY KEY,
			currentAnalysisId TEXT,
			createdAt TEXT NOT NULL,
			lastActiveAt TEXT NOT NULL
		)
	`);

	// Create indexes for better query performance
	db.exec(`
		CREATE INDEX IF NOT EXISTS idx_conversations_userName ON conversations(userName);
		CREATE INDEX IF NOT EXISTS idx_conversations_analysisId ON conversations(analysisId);
		CREATE INDEX IF NOT EXISTS idx_conversations_updatedAt ON conversations(updatedAt DESC);
		CREATE INDEX IF NOT EXISTS idx_users_lastActiveAt ON users(lastActiveAt DESC);
	`);

	console.log('✅ Database migrations completed');
}

