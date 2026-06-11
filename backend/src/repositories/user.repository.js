const { db } = require("../config/config");
const { ROLES } = require("../config/constants");

const { USER } = ROLES;

async function findUserByEmail(email) {
	const [rows] = await db.query(
		`
			SELECT 
				id,
				email,
				password,
				role
			FROM users
			WHERE email = ?
		`,
		[email],
	);

	return rows[0] || null;
}

async function findUserById(id) {
	const [rows] = await db.query(
		`
			SELECT
				id,
				email,
				role,
				created_at AS createdAt
			FROM users
			WHERE id = ?
		`,
		[id],
	);

	return rows[0] || null;
}

async function findUserWithPasswordById(id) {
	const [rows] = await db.query(
		`
			SELECT
				id,
				email,
				password,
				role
			FROM users
			WHERE id = ?
		`,
		[id],
	);

	return rows[0] || null;
}

async function createUser(email, passwordHash, role = USER) {
	const [result] = await db.query(
		`
			INSERT INTO users (
				email,
				password,
				role
			)
			VALUES (?, ?, ?)
		`,
		[email, passwordHash, role],
	);

	return {
		id: result.insertId,
		email,
		role,
	};
}

async function updateUserPassword(userId, passwordHash) {
	await db.query(
		`
			UPDATE users
			SET password = ?
			WHERE id = ?
		`,
		[passwordHash, userId],
	);
}

async function findAllUsers({ search, limit = 20, offset = 0 } = {}) {
	const conditions = [];
	const values = [];

	if (search) {
		conditions.push("(email LIKE ? OR role LIKE ?)");
		values.push(`%${search}%`, `%${search}%`);
	}

	const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
	values.push(limit, offset);

	const [rows] = await db.query(
		`
			SELECT
				id,
				email,
				role,
				created_at AS createdAt
			FROM users
			${where}
			ORDER BY created_at DESC
			LIMIT ? OFFSET ?
		`,
		values,
	);

	return rows;
}

async function countAllUsers({ search } = {}) {
	const conditions = [];
	const values = [];

	if (search) {
		conditions.push("(email LIKE ? OR role LIKE ?)");
		values.push(`%${search}%`, `%${search}%`);
	}

	const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

	const [rows] = await db.query(
		`
			SELECT COUNT(*) AS total
			FROM users
			${where}
		`,
		values,
	);

	return rows[0]?.total || 0;
}

async function updateUser(id, fields) {
	const updates = [];
	const values = [];

	if (fields.email) {
		updates.push("email = ?");
		values.push(fields.email);
	}
	if (fields.role) {
		updates.push("role = ?");
		values.push(fields.role);
	}
	if (fields.password) {
		updates.push("password = ?");
		values.push(fields.password);
	}

	if (!updates.length) return null;

	values.push(id);
	await db.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);
	return findUserById(id);
}

async function deleteUser(id) {
	await db.query("DELETE FROM users WHERE id = ?", [id]);
}

module.exports = {
	findUserByEmail,
	findUserById,
	findUserWithPasswordById,
	createUser,
	updateUserPassword,
	findAllUsers,
	countAllUsers,
	updateUser,
	deleteUser,
};
