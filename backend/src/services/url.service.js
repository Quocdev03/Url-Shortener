const { nanoid } = require("nanoid");
const {
	badRequest,
	forbidden,
	notFound,
	conflict,
} = require("../utils/errors");
const { validateUrl } = require("../utils/validators");
const urlRepository = require("../repositories/url.repository");
const { getUrlCache, setUrlCache, deleteUrlCache } = require("./cache.service");

async function createShortUrlPublic({ originalUrl }) {
	// Validate và normalize URL đầu vào
	const normalizedUrl = validateUrl(originalUrl);
	// Generate random 7-ký-tự code cho public URL (không lưu DB)
	const code = nanoid(7);

	// Lưu vào Redis cache với TTL 24 giờ (default)
	await setUrlCache(code, normalizedUrl);

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

	// Sử dụng custom alias nếu có, nếu không generate random 7-ký-tự code
	let code = customAlias || nanoid(7);

	if (customAlias) {
		// CASE 1: User cung cấp custom alias
		// Kiểm tra xem custom alias đã tồn tại trong DB chưa
		const exists = await urlRepository.isCodeTaken(customAlias);
		// Nếu alias đã được dùng → throw conflict error
		if (exists) throw conflict("Alias already taken");
	} else {
		// CASE 2: Generate random code (collision detection logic)
		// Retry tối đa 5 lần nếu code bị duplicate
		let attempt = 0;
		while (await urlRepository.isCodeTaken(code)) {
			attempt += 1;
			// Nếu sau 5 lần vẫn collision → fail (xác suất rất thấp với nanoid(7))
			if (attempt > 5) {
				throw conflict("Unable to generate a unique short code");
			}
			// Generate code mới và retry
			code = nanoid(7);
		}
	}

	// Lưu vào DB với user_id, original URL, generated/custom code
	const url = await urlRepository.createUrl({
		userId,
		original: normalizedUrl,
		code,
		customAlias: customAlias || null,
		expiresAt: expiresAt || null,
	});

	// Cache vào Redis: key=code, value=original_url (TTL=1 giờ)
	await setUrlCache(code, normalizedUrl);
	return url;
}

async function resolveCode(code) {
	// Try lấy từ Redis cache trước (fast path, O(1))
	const cached = await getUrlCache(code);
	if (cached) return cached;

	// Nếu cache miss → query database
	const url = await urlRepository.findUrlByCode(code);
	if (!url) return null;

	// Check expiration: nếu có expires_at và < hiện tại → URL đã hết hạn
	if (url.expiresAt && new Date(url.expiresAt) < new Date()) return null;

	// Lưu lại vào cache để lần sau nhanh hơn
	await setUrlCache(code, url.original);
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
		fields.expiresAt = data.expiresAt || null; // Allow clear expiration
	}

	// Update vào DB
	const updated = await urlRepository.updateUrl(id, fields);
	if (!updated) throw badRequest("No valid fields to update");

	// Update cache với original URL mới
	await setUrlCache(url.code, updated.original);
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

	// Xóa từ cache
	await deleteUrlCache(url.code);
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
