const { db } = require("../config/config");

/**
 * Convert bất kỳ giá trị date nào → MySQL DATETIME string (YYYY-MM-DD HH:MM:SS, UTC)
 * MySQL DATETIME không chứa timezone, ta lưu theo UTC
 * @param {Date|string|null} value
 * @returns {string|null}
 */
function toMySQLDatetime(value) {
	if (!value) return null;
	const d = value instanceof Date ? value : new Date(value);
	if (isNaN(d.getTime())) return null;
	// Lấy các thành phần UTC rồi format thủ công → "YYYY-MM-DD HH:MM:SS"
	const pad = (n) => String(n).padStart(2, "0");
	return (
		`${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
		`${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
	);
}

async function createUrl({ userId, original, code, customAlias, expiresAt }) {
	// Convert expiresAt → MySQL DATETIME string (MySQL không hiểu ISO 8601 có 'T'/'Z')
	const mysqlExpiresAt = toMySQLDatetime(expiresAt);

	// INSERT vào database với parameters (SQLi-safe)
	// Nếu không có userId/customAlias/expiresAt → NULL trong DB
	const [result] = await db.query(
		"INSERT INTO urls (user_id, original, code, custom_alias, expires_at) VALUES (?, ?, ?, ?, ?)",
		[userId || null, original, code, customAlias || null, mysqlExpiresAt],
	);

	// Return object với insertId từ DB (trả ISO string để formatter xử lý nhất quán)
	return {
		id: result.insertId,
		userId: userId || null,
		original,
		code,
		customAlias: customAlias || null,
		expiresAt: mysqlExpiresAt,
		clicks: 0,
		createdAt: new Date().toISOString(),
	};
}

async function findUrlByCode(code) {
	// Query URL by short code (exact match)
	// SELECT statement converts snake_case → camelCase (u.d AS userId)
	const [rows] = await db.query(
		"SELECT id, user_id AS userId, original, code, custom_alias AS customAlias, expires_at AS expiresAt, clicks, created_at AS createdAt FROM urls WHERE code = ?",
		[code],
	);
	// Return first row hay null nếu không tìm thấy
	return rows[0] || null;
}

async function findUrlById(id) {
	// Query URL by ID (PK lookup)
	const [rows] = await db.query(
		"SELECT id, user_id AS userId, original, code, custom_alias AS customAlias, expires_at AS expiresAt, clicks, created_at AS createdAt FROM urls WHERE id = ?",
		[id],
	);
	return rows[0] || null;
}

async function isCodeTaken(code) {
	// Check nếu code đã tồn tại (SELECT only id for efficiency)
	// Return true nếu có records, false nếu không
	const [rows] = await db.query("SELECT id FROM urls WHERE code = ?", [code]);
	return rows.length > 0;
}

async function updateUrl(id, fields) {
	// Xây dựng dynamic UPDATE clause dựa trên fields có
	const updates = []; // SQL SET clauses (original = ?, ...)
	const values = []; // Parameterized values

	// Chỉ thêm field nào nào có giá trị
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
		// Convert → MySQL DATETIME format (MySQL không hiểu ISO 8601 có 'T'/'Z')
		values.push(toMySQLDatetime(fields.expiresAt));
	}

	// Nếu không có field nào update → return null
	if (!updates.length) return null;

	// Thêm id đến cuối cho WHERE clause
	values.push(id);

	// Execute UPDATE với dynamic SET clause
	await db.query(`UPDATE urls SET ${updates.join(", ")} WHERE id = ?`, values);

	// Return updated record
	return findUrlById(id);
}

async function deleteUrl(id) {
	// Xóa URL by ID
	await db.query("DELETE FROM urls WHERE id = ?", [id]);
}

async function countUrlsByQuery({ userId, search, filterExpired }) {
	// Xây dựng dynamic WHERE clause dựa trên filters
	const conditions = []; // SQL conditions
	const values = []; // Parameterized values

	// Filter 1: User ownership (undefined = all, specific userId = only that user)
	if (userId !== undefined) {
		conditions.push("user_id = ?");
		values.push(userId);
	}

	// Filter 2: Text search trong 3 fields
	if (search) {
		conditions.push(
			"(original LIKE ? OR code LIKE ? OR custom_alias LIKE ?)",
		);
		values.push(`%${search}%`, `%${search}%`, `%${search}%`);
	}

	// Filter 3: Expiration status
	if (filterExpired === true) {
		conditions.push("expires_at IS NOT NULL AND expires_at < NOW()");
	}
	if (filterExpired === false) {
		conditions.push("(expires_at IS NULL OR expires_at > NOW())");
	}

	// Build WHERE clause
	const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

	// COUNT query
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
	// Khởi tạo arrays để xây dựng WHERE clause động
	const conditions = []; // SQL conditions (WHERE clauses)
	const values = []; // Parameterized query values (ngăn SQL injection)

	// === FILTER 1: User ownership ===
	// Nếu userId cung cấp → chỉ lấy URLs của user này (undefined = admin, lấy all)
	if (userId !== undefined) {
		conditions.push("user_id = ?");
		values.push(userId);
	}

	// === FILTER 2: Text search ===
	// Search trong 3 fields: original_url, code, custom_alias
	// Sử dụng LIKE wildcard (%search%) để match partial strings
	if (search) {
		conditions.push(
			"(original LIKE ? OR code LIKE ? OR custom_alias LIKE ?)",
		);
		// Thêm 3 giá trị: search với wildcard cho mỗi field
		values.push(`%${search}%`, `%${search}%`, `%${search}%`);
	}

	// === FILTER 3: Expiration status ===
	// filterExpired = true  → chỉ expired URLs (expires_at < NOW)
	// filterExpired = false → chỉ active URLs (expires_at IS NULL hoặc > NOW)
	// filterExpired = undefined → ignore filter (lấy all)
	if (filterExpired === true) {
		// URL expired khi: có expiration date AND date đó < hiện tại
		conditions.push("expires_at IS NOT NULL AND expires_at < NOW()");
	}
	if (filterExpired === false) {
		// URL active khi: không có expiration date HOẶC date > hiện tại
		conditions.push("(expires_at IS NULL OR expires_at > NOW())");
	}

	// === SORTING (SQL Injection prevention) ===
	// Whitelist các fields cho phép sort (ngăn user injection malicious SQL)
	const sortableFields = ["created_at", "expires_at", "code", "original"];
	// Normalize order: ASC hoặc DESC (mặc định DESC = newest first)
	const direction = order.toUpperCase() === "ASC" ? "ASC" : "DESC";
	// Nếu sortBy không trong whitelist → default created_at
	const safeSortBy = sortableFields.includes(sortBy) ? sortBy : "created_at";

	// === BUILD SQL QUERY ===
	// Nếu có conditions → WHERE clause, nếu không → query all
	const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

	// SQL query với parameterized placeholders (?) để bảo vệ injection
	// AS clauses để convert snake_case từ DB → camelCase cho API
	const query = `SELECT id, user_id AS userId, original, code, custom_alias AS customAlias, expires_at AS expiresAt, clicks, created_at AS createdAt
    FROM urls ${where}
    ORDER BY ${safeSortBy} ${direction}
    LIMIT ? OFFSET ?`;

	// Thêm LIMIT + OFFSET cho pagination vào values array
	values.push(limit, offset);

	// Execute query với all parameterized values (SQLi-safe)
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
};
