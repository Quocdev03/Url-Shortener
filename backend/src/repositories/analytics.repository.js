const { db } = require("../config/config");

/**
 * Ghi nhận một click/truy cập URL
 * @param {Object} params - {urlId, ip, userAgent, referer}
 * @returns {Promise<void>}
 */
async function recordClick({ urlId, ip, userAgent, referer }) {
	await db.query(
		"INSERT INTO analytics (url_id, ip, user_agent, referer) VALUES (?, ?, ?, ?)",
		[urlId, ip || null, userAgent || null, referer || null],
	);
}

/**
 * Lấy thống kê chi tiết của một URL
 * @param {number} urlId - ID của URL
 * @param {number} limit - Số click gần đây để lấy (default: 10)
 * @returns {Promise<Object>} - {total, recent}
 */
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
 * Đếm tổng số analytics records theo điều kiện
 * @param {Object} options - {search, urlId}
 * @returns {Promise<number>} - Tổng số records
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
 * Lấy danh sách analytics với lọc, tìm kiếm, sắp xếp, phân trang
 * @param {Object} options - {search, urlId, sortBy, order, offset, limit}
 * @returns {Promise<Array>} - Mảng analytics records
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
	recordClick,
	getUrlAnalytics,
	countAnalyticsByQuery,
	getAllAnalytics,
};
