require("dotenv").config();
const bcrypt = require("bcryptjs");
const { db } = require("../config/config");

async function hashPassword(password) {
	return bcrypt.hash(password + (process.env.PASSWORD_PEPPER || ""), Number(process.env.BCRYPT_SALT_ROUNDS) || 12);
}

/**
 * Script tạo dữ liệu mẫu cho database.
 * Tạo user admin/user và một URL demo nếu chưa tồn tại.
 */
const users = [
	{ email: "admin@example.com", password: "secret123", role: "admin" },
	{ email: "user@example.com", password: "secret123", role: "user" },
];

async function seed() {
	try {
		for (const user of users) {
			const [existing] = await db.query(
				"SELECT id FROM users WHERE email = ?",
				[user.email],
			);
			if (existing.length) {
				console.log(`User already exists: ${user.email}`);
				continue;
			}

			const passwordHash = await hashPassword(user.password);
			const [result] = await db.query(
				"INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
				[user.email, passwordHash, user.role],
			);
			console.log(
				`Created user ${user.email} with id ${result.insertId}`,
			);
		}

		const [adminRow] = await db.query(
			"SELECT id FROM users WHERE email = ?",
			["user@example.com"],
		);
		if (adminRow.length) {
			const userId = adminRow[0].id;
			const [existingUrl] = await db.query(
				"SELECT id FROM urls WHERE code = ?",
				["example"],
			);
			if (!existingUrl.length) {
				const [urlResult] = await db.query(
					"INSERT INTO urls (user_id, original, code, custom_alias, expires_at) VALUES (?, ?, ?, ?, ?)",
					[userId, "https://example.com", "example", "example", null],
				);
				console.log(`Created seed URL with id ${urlResult.insertId}`);
			} else {
				console.log("Seed URL already exists");
			}
		}

		console.log("Seed complete");
		process.exit(0);
	} catch (err) {
		console.error("Seed failed:", err);
		process.exit(1);
	}
}

seed();
