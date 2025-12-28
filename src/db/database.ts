import Database from 'better-sqlite3';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { mkdirSync } from 'fs';
import { runMigrations } from './migrations.js';
import { logger } from '../util/logger.js';

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
		
		logger.info('Initializing database connection', { dbPath });
		
		// Create data directory if it doesn't exist
		const dataDir = join(__dirname, '../../data');
		try {
			mkdirSync(dataDir, { recursive: true });
			logger.debug('Data directory created or already exists', { dataDir });
		} catch (error) {
			// Directory might already exist
			logger.debug('Data directory creation skipped (may already exist)', { dataDir });
		}

		dbInstance = new Database(dbPath);
		logger.info('Database connection established');
		
		// Enable WAL mode for better concurrency
		dbInstance.pragma('journal_mode = WAL');
		logger.debug('WAL mode enabled for database');
		
		// Run migrations
		logger.info('Running database migrations');
		runMigrations(dbInstance);
		logger.info('Database migrations completed');
	}

	return dbInstance;
}

/**
 * Close database connection
 */
export function closeDb(): void {
	if (dbInstance) {
		logger.info('Closing database connection');
		dbInstance.close();
		dbInstance = null;
		logger.info('Database connection closed');
	} else {
		logger.debug('Database connection already closed');
	}
}

