const { db } = require("../config/config");
const bcrypt = require("bcryptjs");
const { logger } = require("../utils/logger");

// Hash password với pepper + salt
async function hashPassword(password) {
	// Append PEPPER để tăng bảo mật (server-side secret added to password trước khi hash)
	// SALT_ROUNDS default 12 (adaptive, tăng khi cpu speed tăng)
	return bcrypt.hash(
		password + (process.env.PASSWORD_PEPPER || ""),
		Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
	);
}

// Retry connection với exponential backoff (handle DB init race condition)
async function retryDbConnection(maxRetries = 10, delayMs = 500) {
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			// Test connection by querying user count
			await db.query("SELECT 1");
			logger.success("Database connection established");
			return true;
		} catch (err) {
			if (attempt === maxRetries) {
				throw err;
			}
			// Exponential backoff: 500ms, 1s, 2s, 4s...
			const wait = delayMs * Math.pow(2, attempt - 1);
			logger.warn(
				`DB connection attempt ${attempt}/${maxRetries} failed, retrying in ${wait}ms...`,
			);
			await new Promise((resolve) => setTimeout(resolve, wait));
		}
	}
}

// Initialize database với seed data (nếu chưa init)
async function initializeDatabase() {
	try {
		// Wait for DB to be ready (schema init complete)
		await retryDbConnection();

		// Check nếu database đã có users (bypass seed nếu đã init)
		const [users] = await db.query("SELECT COUNT(*) as count FROM users");

		if (users[0].count > 0) {
			logger.info("Database already initialized");
			return;
		}

		logger.info("Database is empty, running seed...");

		// Seed users (admin + regular user) cho testing
		const seedUsers = [
			{
				email: "admin@example.com",
				password: "secret123",
				role: "admin",
			},
			{ email: "user@example.com", password: "secret123", role: "user" },
		];

		// Insert seed users
		for (const user of seedUsers) {
			// Hash password trước insert
			const passwordHash = await hashPassword(user.password);
			await db.query(
				"INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
				[user.email, passwordHash, user.role],
			);
			logger.success(`Created user: ${user.email}`);
		}

		// Get regular user ID để seed URLs
		const [userRow] = await db.query("SELECT id FROM users WHERE email = ?", [
			"user@example.com",
		]);

		// Seed một example URL cho user
		if (userRow.length > 0) {
			await db.query(
				"INSERT INTO urls (user_id, original, code, custom_alias) VALUES (?, ?, ?, ?)",
				[userRow[0].id, "https://example.com", "example", "example"],
			);
			logger.success("Created seed URL");
		}

		logger.success("Database initialization complete");
	} catch (err) {
		logger.error("Database initialization failed", err);
		process.exit(1); // Exit nếu seed fail (DB schema chưa ready)
	}
}

module.exports = { initializeDatabase };
