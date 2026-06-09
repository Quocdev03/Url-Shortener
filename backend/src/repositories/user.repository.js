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

async function createUser(email, passwordHash) {
	const [result] = await db.query(
		`
			INSERT INTO users (
				email,
				password,
				role
			)
			VALUES (?, ?, ?)
		`,
		[email, passwordHash, USER],
	);

	return {
		id: result.insertId,
		email,
		role: USER,
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

module.exports = {
	findUserByEmail,
	findUserById,
	findUserWithPasswordById,
	createUser,
	updateUserPassword,
};
