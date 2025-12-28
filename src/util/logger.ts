type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const colors = {
	info: '\x1b[36m', // Cyan
	warn: '\x1b[33m', // Yellow
	error: '\x1b[31m', // Red
	debug: '\x1b[90m', // Gray
	reset: '\x1b[0m'
};

function formatTimestamp(): string {
	return new Date().toISOString();
}

function formatMessage(level: LogLevel, message: string, data?: any): string {
	const timestamp = formatTimestamp();
	const color = colors[level];
	const reset = colors.reset;
	const levelUpper = level.toUpperCase().padEnd(5);
	
	let output = `${color}[${timestamp}] ${levelUpper}${reset} ${message}`;
	
	if (data !== undefined) {
		output += ` ${JSON.stringify(data, null, 2)}`;
	}
	
	return output;
}

export const logger = {
	info: (message: string, data?: any) => {
		console.log(formatMessage('info', message, data));
	},
	
	warn: (message: string, data?: any) => {
		console.warn(formatMessage('warn', message, data));
	},
	
	error: (message: string, data?: any) => {
		console.error(formatMessage('error', message, data));
	},
	
	debug: (message: string, data?: any) => {
		if (process.env.NODE_ENV === 'development') {
			console.log(formatMessage('debug', message, data));
		}
	}
};

