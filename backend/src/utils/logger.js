const isDev = process.env.NODE_ENV === "development";

const colors = {
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
};

function format(level, color, message, data) {
	const timestamp = new Date().toISOString();
	const header = `${color}[${timestamp}] ${level}${colors.reset}`;
	return { header, message, data };
}

const logger = {
	info(message, data = {}) {
		const log = format("INFO", colors.blue, message, data);
		console.log(log.header, message, data);
	},

	success(message, data = {}) {
		const log = format("SUCCESS", colors.green, message, data);
		console.log(log.header, message, data);
	},

	warn(message, data = {}) {
		const log = format("WARN", colors.yellow, message, data);
		console.warn(log.header, message, data);
	},

	error(message, err = null) {
		const log = format("ERROR", colors.red, message);
		console.error(log.header, message);
		if (err) {
			if (isDev && err.stack) console.error(err.stack);
			else if (err.message) console.error("Error:", err.message);
		}
	},

	debug(message, data = {}) {
		if (!isDev) return;
		const log = format("DEBUG", colors.cyan, message, data);
		console.log(log.header, message, data);
	},
};

module.exports = { logger };
