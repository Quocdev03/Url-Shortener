const { nanoid } = require("nanoid");
const {
	badRequest,
	forbidden,
	notFound,
	conflict,
} = require("../utils/errors");
const { validateUrl } = require("../utils/validators");
const urlRepository = require("../repositories/url.repository");

async function createShortUrlPublic({ originalUrl }) {
	// Validate và normalize URL đầu vào
	const normalizedUrl = validateUrl(originalUrl);
	// Generate random 7-ký-tự code cho public URL (không lưu DB)
	const code = nanoid(7);

	// Return URL object với id=null, userId=null (public, temporary)
	return {
		id: null,
		userId: null,
		original: normalizedUrl,
		code,
		customAlias: null,
		expiresAt: null,
		createdAt: new Date().toISOString(),
	};
}

async function createShortUrl({ originalUrl, customAlias, expiresAt, userId }) {
	// Validate và normalize URL đầu vào (remove whitespace, check format)
	const normalizedUrl = validateUrl(originalUrl);

	// Normalize expiresAt → UTC ISO string trước khi lưu DB
	let normalizedExpiresAt = null;
	if (expiresAt) {
		const d = new Date(expiresAt);
		if (!isNaN(d.getTime())) {
			normalizedExpiresAt = d.toISOString();
		}
	}

	if (customAlias) {
		// CASE 1: User cung cấp custom alias
		const exists = await urlRepository.isCodeTaken(customAlias);
		if (exists) throw conflict("Alias already taken");

		try {
			const url = await urlRepository.createUrl({
				userId,
				original: normalizedUrl,
				code: customAlias,
				customAlias,
				expiresAt: normalizedExpiresAt,
			});
			return url;
		} catch (error) {
			if (error.code === "ER_DUP_ENTRY") {
				throw conflict("Alias already taken");
			}
			throw error;
		}
	} else {
		// CASE 2: Generate random code (collision detection logic)
		let attempt = 0;
		while (attempt < 5) {
			const code = nanoid(7);
			const exists = await urlRepository.isCodeTaken(code);
			if (exists) {
				attempt += 1;
				continue;
			}

			try {
				const url = await urlRepository.createUrl({
					userId,
					original: normalizedUrl,
					code,
					customAlias: null,
					expiresAt: normalizedExpiresAt,
				});
				return url;
			} catch (error) {
				if (error.code === "ER_DUP_ENTRY") {
					attempt += 1;
					continue;
				}
				throw error;
			}
		}
		throw conflict("Unable to generate a unique short code");
	}
}

async function resolveCode(code) {
	// Query database trực tiếp
	const url = await urlRepository.findUrlByCode(code);
	if (!url) return null;

	// Check expiration: nếu có expires_at và < hiện tại → URL đã hết hạn
	if (url.expiresAt && new Date(url.expiresAt) < new Date()) return null;

	return url.original;
}

async function listUrls({
	userId,
	isAdmin,
	page = 1,
	limit = 20,
	search,
	sortBy,
	order,
	expired,
}) {
	// Tính offset cho pagination: (page-1)*limit
	const offset =
		(Number(page) > 0 ? Number(page) - 1 : 0) * Number(limit || 20);

	// Nếu admin → lấy tất cả URLs (queryUserId=undefined), ngược lại chỉ lấy URLs của user
	const queryUserId = isAdmin ? undefined : userId;

	// Parse query param expired (string) thành boolean
	let filterExpired;
	if (expired === "true") {
		filterExpired = true; // Lấy URLs đã hết hạn
	} else if (expired === "false") {
		filterExpired = false; // Lấy URLs còn hoạt động
	}

	// Lấy tổng số URLs match filter
	const total = await urlRepository.countUrlsByQuery({
		userId: queryUserId,
		search,
		filterExpired,
	});

	// Lấy danh sách URLs với filter + sort + pagination
	const items = await urlRepository.findUrlsByQuery({
		userId: queryUserId,
		search,
		filterExpired,
		sortBy,
		order,
		offset,
		limit: Number(limit) || 20,
	});

	// Return data + metadata cho pagination UI
	return {
		items,
		meta: {
			page: Number(page) || 1,
			limit: Number(limit) || 20,
			total,
			totalPages: Math.ceil(total / (Number(limit) || 20)),
		},
	};
}

async function getUrlById(id, userId, isAdmin) {
	// Lấy URL từ DB
	const url = await urlRepository.findUrlById(id);
	if (!url) throw notFound("URL not found");

	// Authorization: admin có quyền xem tất cả, user chỉ xem của hình
	if (!isAdmin && url.userId !== userId) throw forbidden("Access denied");

	return url;
}

async function updateUrl(id, data, userId, isAdmin) {
	// Lấy URL từ DB
	const url = await urlRepository.findUrlById(id);
	if (!url) throw notFound("URL not found");

	// Authorization check
	if (!isAdmin && url.userId !== userId) throw forbidden("Access denied");

	// Validate: customAlias không được phép update (immutable)
	if (
		data.customAlias !== undefined &&
		data.customAlias !== null &&
		data.customAlias !== url.customAlias
	) {
		throw badRequest("Custom alias cannot be updated");
	}

	// Xây dựng fields cần update (chỉ original + expiresAt)
	const fields = {};
	if (data.originalUrl !== undefined) {
		fields.original = validateUrl(data.originalUrl); // Validate nếu có
	}
	if (data.expiresAt !== undefined) {
		// Normalize → UTC ISO string, hoặc null nếu muốn xóa expiration
		if (data.expiresAt) {
			const d = new Date(data.expiresAt);
			fields.expiresAt = !isNaN(d.getTime()) ? d.toISOString() : null;
		} else {
			fields.expiresAt = null; // Allow clear expiration
		}
	}

	// Update vào DB
	const updated = await urlRepository.updateUrl(id, fields);
	if (!updated) throw badRequest("No valid fields to update");

	return updated;
}

async function deleteUrl(id, userId, isAdmin) {
	// Lấy URL từ DB
	const url = await urlRepository.findUrlById(id);
	if (!url) throw notFound("URL not found");

	// Authorization check
	if (!isAdmin && url.userId !== userId) throw forbidden("Access denied");

	// Xóa từ database
	await urlRepository.deleteUrl(id);
}

module.exports = {
	createShortUrlPublic,
	createShortUrl,
	resolveCode,
	listUrls,
	getUrlById,
	updateUrl,
	deleteUrl,
};
