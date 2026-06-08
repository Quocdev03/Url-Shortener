/**
 * Logger Utility
 * Provides color-coded console logging with timestamps
 */

// Determine if running in development environment
const isDev = process.env.NODE_ENV === "development";

// ANSI color codes for console output
const colors = {
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
};

/**
 * Get current timestamp in ISO format
 * @returns {string}
 */
function getTimestamp() {
	return new Date().toISOString();
}

/**
 * Logger object with color-coded output methods
 */
const logger = {
	/**
	 * Log info level message
	 * @param {string} message
	 * @param {Object} data
	 */
	info(message, data = {}) {
		console.log(
			`${colors.blue}[${getTimestamp()}] INFO${colors.reset}`,
			message,
			Object.keys(data).length > 0 ? data : "",
		);
	},

	/**
	 * Log success level message
	 * @param {string} message
	 * @param {Object} data
	 */
	success(message, data = {}) {
		console.log(
			`${colors.green}[${getTimestamp()}] SUCCESS${colors.reset}`,
			message,
			Object.keys(data).length > 0 ? data : "",
		);
	},

	/**
	 * Log warning level message
	 * @param {string} message
	 * @param {Object} data
	 */
	warn(message, data = {}) {
		console.warn(
			`${colors.yellow}[${getTimestamp()}] WARN${colors.reset}`,
			message,
			Object.keys(data).length > 0 ? data : "",
		);
	},

	/**
	 * Log error level message with stack trace in development
	 * @param {string} message
	 * @param {Error} err
	 */
	error(message, err = null) {
		console.error(
			`${colors.red}[${getTimestamp()}] ERROR${colors.reset}`,
			message,
		);

		if (err) {
			if (isDev && err.stack) {
				console.error(err.stack);
			} else if (err.message) {
				console.error("Error:", err.message);
			}
		}
	},

	/**
	 * Log debug level message (development only)
	 * @param {string} message
	 * @param {Object} data
	 */
	debug(message, data = {}) {
		if (!isDev) return;

		console.log(
			`${colors.cyan}[${getTimestamp()}] DEBUG${colors.reset}`,
			message,
			data,
		);
	},
};

module.exports = {
	logger,
};
