const { db } = require("../config/config");
const bcrypt = require("bcryptjs");
const { logger } = require("../utils/logger");

async function hashPassword(password) {
	return bcrypt.hash(password + (process.env.PASSWORD_PEPPER || ""), Number(process.env.BCRYPT_SALT_ROUNDS) || 12);
}

async function initializeDatabase() {
	try {
		const [users] = await db.query("SELECT COUNT(*) as count FROM users");

		if (users[0].count > 0) {
			logger.info("Database already initialized");
			return;
		}

		logger.info("Database is empty, running seed...");

		const seedUsers = [
			{
				email: "admin@example.com",
				password: "secret123",
				role: "admin",
			},
			{ email: "user@example.com", password: "secret123", role: "user" },
		];

		for (const user of seedUsers) {
			const passwordHash = await hashPassword(user.password);
			await db.query(
				"INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
				[user.email, passwordHash, user.role],
			);
			logger.success(`Created user: ${user.email}`);
		}

		const [userRow] = await db.query("SELECT id FROM users WHERE email = ?", [
			"user@example.com",
		]);

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
		process.exit(1);
	}
}

module.exports = { initializeDatabase };
