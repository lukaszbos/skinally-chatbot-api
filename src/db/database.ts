import Database from 'better-sqlite3';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { mkdirSync } from 'fs';
import { runMigrations } from './migrations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let dbInstance: Database.Database | null = null;

/**
 * Get database instance (singleton)
 * Creates database file if it doesn't exist
 */
export function getDb(): Database.Database {
	if (!dbInstance) {
		const dbPath = join(__dirname, '../../data/conversations.db');
		
		// Create data directory if it doesn't exist
		const dataDir = join(__dirname, '../../data');
		try {
			mkdirSync(dataDir, { recursive: true });
		} catch (error) {
			// Directory might already exist
		}

		dbInstance = new Database(dbPath);
		
		// Enable WAL mode for better concurrency
		dbInstance.pragma('journal_mode = WAL');
		
		// Run migrations
		runMigrations(dbInstance);
	}

	return dbInstance;
}

/**
 * Close database connection
 */
export function closeDb(): void {
	if (dbInstance) {
		dbInstance.close();
		dbInstance = null;
	}
}

