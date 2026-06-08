const { db } = require("../config/config");

async function createUrl({ userId, original, code, customAlias, expiresAt }) {
	const [result] = await db.query(
		"INSERT INTO urls (user_id, original, code, custom_alias, expires_at) VALUES (?, ?, ?, ?, ?)",
		[userId || null, original, code, customAlias || null, expiresAt || null],
	);
	return {
		id: result.insertId,
		userId: userId || null,
		original,
		code,
		customAlias: customAlias || null,
		expiresAt,
		createdAt: new Date().toISOString(),
	};
}

async function findUrlByCode(code) {
	const [rows] = await db.query(
		"SELECT id, user_id AS userId, original, code, custom_alias AS customAlias, expires_at AS expiresAt, created_at AS createdAt FROM urls WHERE code = ?",
		[code],
	);
	return rows[0] || null;
}

async function findUrlById(id) {
	const [rows] = await db.query(
		"SELECT id, user_id AS userId, original, code, custom_alias AS customAlias, expires_at AS expiresAt, created_at AS createdAt FROM urls WHERE id = ?",
		[id],
	);
	return rows[0] || null;
}

async function isCodeTaken(code) {
	const [rows] = await db.query("SELECT id FROM urls WHERE code = ?", [code]);
	return rows.length > 0;
}

async function updateUrl(id, fields) {
	const updates = [];
	const values = [];

	if (fields.original) {
		updates.push("original = ?");
		values.push(fields.original);
	}
	if (fields.customAlias !== undefined) {
		updates.push("custom_alias = ?");
		values.push(fields.customAlias);
	}
	if (fields.expiresAt !== undefined) {
		updates.push("expires_at = ?");
		values.push(fields.expiresAt);
	}

	if (!updates.length) return null;
	values.push(id);

	await db.query(`UPDATE urls SET ${updates.join(", ")} WHERE id = ?`, values);
	return findUrlById(id);
}

async function deleteUrl(id) {
	await db.query("DELETE FROM urls WHERE id = ?", [id]);
}

async function countUrlsByQuery({ userId, search, filterExpired }) {
	const conditions = [];
	const values = [];

	if (userId !== undefined) {
		conditions.push("user_id = ?");
		values.push(userId);
	}
	if (search) {
		conditions.push(
			"(original LIKE ? OR code LIKE ? OR custom_alias LIKE ?)",
		);
		values.push(`%${search}%`, `%${search}%`, `%${search}%`);
	}
	if (filterExpired === true) {
		conditions.push("expires_at IS NOT NULL AND expires_at < NOW()");
	}
	if (filterExpired === false) {
		conditions.push("(expires_at IS NULL OR expires_at > NOW())");
	}

	const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
	const [rows] = await db.query(
		`SELECT COUNT(*) AS total FROM urls ${where}`,
		values,
	);
	return rows[0]?.total || 0;
}

async function findUrlsByQuery({
	userId,
	search,
	filterExpired,
	sortBy = "created_at",
	order = "DESC",
	offset = 0,
	limit = 20,
}) {
	const conditions = [];
	const values = [];

	if (userId !== undefined) {
		conditions.push("user_id = ?");
		values.push(userId);
	}
	if (search) {
		conditions.push(
			"(original LIKE ? OR code LIKE ? OR custom_alias LIKE ?)",
		);
		values.push(`%${search}%`, `%${search}%`, `%${search}%`);
	}
	if (filterExpired === true) {
		conditions.push("expires_at IS NOT NULL AND expires_at < NOW()");
	}
	if (filterExpired === false) {
		conditions.push("(expires_at IS NULL OR expires_at > NOW())");
	}

	const sortableFields = ["created_at", "expires_at", "code", "original"];
	const direction = order.toUpperCase() === "ASC" ? "ASC" : "DESC";
	const safeSortBy = sortableFields.includes(sortBy) ? sortBy : "created_at";

	const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
	const query = `SELECT id, user_id AS userId, original, code, custom_alias AS customAlias, expires_at AS expiresAt, created_at AS createdAt
    FROM urls ${where}
    ORDER BY ${safeSortBy} ${direction}
    LIMIT ? OFFSET ?`;

	values.push(limit, offset);
	const [rows] = await db.query(query, values);
	return rows;
}

async function recordClick({ urlId, ip, userAgent, referer }) {
	await db.query(
		"INSERT INTO analytics (url_id, ip, user_agent, referer) VALUES (?, ?, ?, ?)",
		[urlId, ip || null, userAgent || null, referer || null],
	);
}

async function getUrlAnalytics(urlId, limit = 10) {
	const [countRows] = await db.query(
		"SELECT COUNT(*) AS total FROM analytics WHERE url_id = ?",
		[urlId],
	);
	const [recent] = await db.query(
		"SELECT ip, user_agent AS userAgent, referer, clicked_at AS clickedAt FROM analytics WHERE url_id = ? ORDER BY clicked_at DESC LIMIT ?",
		[urlId, limit],
	);
	return { total: countRows[0]?.total || 0, recent };
}

/**
 * Count analytics records by query
 * @param {Object} params
 * @returns {Promise<number>} Total count
 */
async function countAnalyticsByQuery({ search, urlId }) {
	const conditions = [];
	const values = [];

	if (urlId !== undefined) {
		conditions.push("a.url_id = ?");
		values.push(urlId);
	}

	if (search) {
		conditions.push("(u.original LIKE ? OR u.code LIKE ? OR a.ip LIKE ?)");
		values.push(`%${search}%`, `%${search}%`, `%${search}%`);
	}

	const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
	const [rows] = await db.query(
		`SELECT COUNT(*) AS total FROM analytics a
		 LEFT JOIN urls u ON a.url_id = u.id ${where}`,
		values,
	);

	return rows[0]?.total || 0;
}

/**
 * Get all analytics with pagination and filtering
 * @param {Object} params
 * @returns {Promise<Array>} Analytics records
 */
async function getAllAnalytics({
	search,
	urlId,
	sortBy = "clicked_at",
	order = "DESC",
	offset = 0,
	limit = 20,
}) {
	const conditions = [];
	const values = [];

	if (urlId !== undefined) {
		conditions.push("a.url_id = ?");
		values.push(urlId);
	}

	if (search) {
		conditions.push("(u.original LIKE ? OR u.code LIKE ? OR a.ip LIKE ?)");
		values.push(`%${search}%`, `%${search}%`, `%${search}%`);
	}

	const sortableFields = ["clicked_at", "ip", "url_id"];
	const direction = order.toUpperCase() === "ASC" ? "ASC" : "DESC";
	const safeSortBy = sortableFields.includes(sortBy) ? sortBy : "clicked_at";

	const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
	const query = `
		SELECT 
			a.id,
			a.url_id AS urlId,
			u.code,
			u.original AS originalUrl,
			a.ip,
			a.user_agent AS userAgent,
			a.referer,
			a.clicked_at AS clickedAt
		FROM analytics a
		LEFT JOIN urls u ON a.url_id = u.id
		${where}
		ORDER BY a.${safeSortBy} ${direction}
		LIMIT ? OFFSET ?
	`;

	values.push(limit, offset);
	const [rows] = await db.query(query, values);
	return rows;
}

module.exports = {
	createUrl,
	findUrlByCode,
	findUrlById,
	isCodeTaken,
	updateUrl,
	deleteUrl,
	countUrlsByQuery,
	findUrlsByQuery,
	recordClick,
	getUrlAnalytics,
	countAnalyticsByQuery,
	getAllAnalytics,
};
