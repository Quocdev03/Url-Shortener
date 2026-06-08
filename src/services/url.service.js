/**
 * URL Service
 * Handles URL shortening, caching, analytics, and redirect logic
 */

const { nanoid } = require("nanoid");
const { redis } = require("../config/config");
const { REDIS: REDIS_KEYS } = require("../config/constants");
const {
	badRequest,
	forbidden,
	notFound,
	conflict,
} = require("../utils/errors");
const { validateUrl } = require("../utils/validators");
const urlRepository = require("../repositories/url.repository");

const URL_CACHE_PREFIX = REDIS_KEYS.URL_CACHE || "url:";
const CLICK_COUNT_PREFIX = REDIS_KEYS.CLICK_COUNT || "clicks:";
const URL_CACHE_TTL = 60 * 60; // 1 hour

// ============================================================================
// Redis Cache Operations
// ============================================================================

/**
 * Get cached URL by code
 * @param {string} code
 * @returns {Promise<string|null>}
 */
function getUrlCache(code) {
	return redis.get(`${URL_CACHE_PREFIX}${code}`);
}

/**
 * Cache URL with TTL
 * @param {string} code
 * @param {string} original
 * @returns {Promise<void>}
 */
function setUrlCache(code, original) {
	return redis.setex(`${URL_CACHE_PREFIX}${code}`, URL_CACHE_TTL, original);
}

/**
 * Delete cached URL
 * @param {string} code
 * @returns {Promise<void>}
 */
function deleteUrlCache(code) {
	return redis.del(`${URL_CACHE_PREFIX}${code}`);
}

/**
 * Increment click counter
 * @param {string} code
 * @returns {Promise<number>}
 */
function incrementClickCache(code) {
	return redis.incr(`${CLICK_COUNT_PREFIX}${code}`);
}

/**
 * Get click counter value
 * @param {string} code
 * @returns {Promise<string|null>}
 */
function getClickCache(code) {
	return redis.get(`${CLICK_COUNT_PREFIX}${code}`);
}

// ============================================================================
// URL Management Service Logic
// ============================================================================

/**
 * Create a new shortened URL
 * Generates unique code or validates custom alias
 * @param {Object} params
 * @param {string} params.originalUrl
 * @param {string} params.customAlias
 * @param {string} params.expiresAt
 * @param {number} params.userId
 * @returns {Promise<Object>}
 */
async function createShortUrl({ originalUrl, customAlias, expiresAt, userId }) {
	const normalizedUrl = validateUrl(originalUrl);
	let code = customAlias || nanoid(7);

	if (customAlias) {
		const exists = await urlRepository.isCodeTaken(customAlias);
		if (exists) throw conflict("Alias already taken");
	} else {
		let attempt = 0;
		while (await urlRepository.isCodeTaken(code)) {
			attempt += 1;
			if (attempt > 5) {
				throw conflict("Unable to generate a unique short code");
			}
			code = nanoid(7);
		}
	}

	const url = await urlRepository.createUrl({
		userId,
		original: normalizedUrl,
		code,
		customAlias: customAlias || null,
		expiresAt: expiresAt || null,
	});

	await setUrlCache(code, normalizedUrl);
	return url;
}

async function resolveCode(code) {
	const cached = await getUrlCache(code);
	if (cached) return cached;

	const url = await urlRepository.findUrlByCode(code);
	if (!url) return null;
	if (url.expiresAt && new Date(url.expiresAt) < new Date()) return null;

	await setUrlCache(code, url.original);
	return url.original;
}

async function recordClick(code, { ip, userAgent, referer }) {
	const url = await urlRepository.findUrlByCode(code);
	if (!url) return;

	await urlRepository.recordClick({ urlId: url.id, ip, userAgent, referer });
	await incrementClickCache(code);
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
	const offset =
		(Number(page) > 0 ? Number(page) - 1 : 0) * Number(limit || 20);
	const queryUserId = isAdmin ? undefined : userId;
	let filterExpired;

	if (expired === "true") {
		filterExpired = true;
	} else if (expired === "false") {
		filterExpired = false;
	}

	const total = await urlRepository.countUrlsByQuery({
		userId: queryUserId,
		search,
		filterExpired,
	});
	const items = await urlRepository.findUrlsByQuery({
		userId: queryUserId,
		search,
		filterExpired,
		sortBy,
		order,
		offset,
		limit: Number(limit) || 20,
	});

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
	const url = await urlRepository.findUrlById(id);
	if (!url) throw notFound("URL not found");
	if (!isAdmin && url.userId !== userId) throw forbidden("Access denied");
	return url;
}

async function updateUrl(id, data, userId, isAdmin) {
	const url = await urlRepository.findUrlById(id);
	if (!url) throw notFound("URL not found");
	if (!isAdmin && url.userId !== userId) throw forbidden("Access denied");

	if (
		data.customAlias !== undefined &&
		data.customAlias !== null &&
		data.customAlias !== url.customAlias
	) {
		throw badRequest("Custom alias cannot be updated");
	}

	const fields = {};
	if (data.originalUrl !== undefined) {
		fields.original = validateUrl(data.originalUrl);
	}
	if (data.expiresAt !== undefined) {
		fields.expiresAt = data.expiresAt || null;
	}

	const updated = await urlRepository.updateUrl(id, fields);
	if (!updated) throw badRequest("No valid fields to update");

	await setUrlCache(url.code, updated.original);
	return updated;
}

async function deleteUrl(id, userId, isAdmin) {
	const url = await urlRepository.findUrlById(id);
	if (!url) throw notFound("URL not found");
	if (!isAdmin && url.userId !== userId) throw forbidden("Access denied");

	await urlRepository.deleteUrl(id);
	await deleteUrlCache(url.code);
}

async function getStats(id, userId, isAdmin) {
	const url = await urlRepository.findUrlById(id);
	if (!url) throw notFound("URL not found");
	if (!isAdmin && url.userId !== userId) throw forbidden("Access denied");

	const analytics = await urlRepository.getUrlAnalytics(id);
	const clickCount = await getClickCache(url.code);

	return {
		url,
		totalClicks: analytics.total,
		cacheClicks: clickCount ? Number(clickCount) : 0,
		recentClicks: analytics.recent,
	};
}

/**
 * Resolve short code to original URL
 * @param {string} code - Short code
 * @returns {Promise<string|null>} Original URL or null if not found
 */

/**
 * Record click analytics for URL
 * @param {string} code - Short code
 * @param {Object} analytics - Click metadata (ip, userAgent, referer)
 * @returns {Promise<void>}
 */

/**
 * List URLs with pagination and filtering
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Items and pagination meta
 */

/**
 * Get single URL by ID
 * @param {number} id - URL ID
 * @param {number} userId - User ID for permission check
 * @param {boolean} isAdmin - Admin flag
 * @returns {Promise<Object>} URL object
 */

/**
 * Update URL
 * @param {number} id - URL ID
 * @param {Object} data - Fields to update
 * @param {number} userId - User ID
 * @param {boolean} isAdmin - Admin flag
 * @returns {Promise<Object>} Updated URL
 */

/**
 * Delete URL
 * @param {number} id - URL ID
 * @param {number} userId - User ID
 * @param {boolean} isAdmin - Admin flag
 * @returns {Promise<void>}
 */

/**
 * Get URL analytics and click statistics
 * @param {number} id - URL ID
 * @param {number} userId - User ID
 * @param {boolean} isAdmin - Admin flag
 * @returns {Promise<Object>} Stats and analytics data
 */

/**
 * Get all analytics (Admin only)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Analytics items and meta
 */
async function getAnalytics({
	page = 1,
	limit = 20,
	search,
	sortBy,
	order,
	urlId,
}) {
	const offset =
		(Number(page) > 0 ? Number(page) - 1 : 0) * Number(limit || 20);

	const total = await urlRepository.countAnalyticsByQuery({
		search,
		urlId,
	});

	const items = await urlRepository.getAllAnalytics({
		search,
		urlId,
		sortBy,
		order,
		offset,
		limit: Number(limit) || 20,
	});

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

module.exports = {
	createShortUrl,
	resolveCode,
	recordClick,
	listUrls,
	getUrlById,
	updateUrl,
	deleteUrl,
	getStats,
	getAnalytics,
};
