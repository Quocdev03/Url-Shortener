const urlService = require("../services/url.service");
const { asyncHandler } = require("../middleware/asyncHandler");
const { logger } = require("../utils/logger");

/**
 * URL Controller
 * Handles URL shortening, management, redirection, and analytics
 */

/**
 * Create a new shortened URL
 * POST /api/v1/urls
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const createUrl = asyncHandler(async (req, res) => {
	const { originalUrl, customAlias, expiresAt } = req.body;
	const userId = req.user?.userId || null;

	const url = await urlService.createShortUrl({
		originalUrl,
		customAlias,
		expiresAt,
		userId,
	});

	const baseUrl =
		process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

	res.status(201).json({
		success: true,
		message: "URL created successfully",
		data: {
			id: url.id,
			code: url.code,
			shortUrl: `${baseUrl}/${url.code}`,
			originalUrl: url.original,
			customAlias: url.customAlias,
			expiresAt: url.expiresAt,
			createdAt: url.createdAt,
			userId: url.userId,
		},
	});
});

/**
 * List URLs with pagination, search, and filtering
 * GET /api/v1/urls
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const listUrls = asyncHandler(async (req, res) => {
	const { page, limit, search, sortBy, order, expired } = req.query;
	const isAdmin = req.user.role === "admin";

	const urlList = await urlService.listUrls({
		userId: req.user.userId,
		isAdmin,
		page: Number(page) || 1,
		limit: Number(limit) || 20,
		search,
		sortBy,
		order,
		expired,
	});

	const baseUrl =
		process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

	const formattedItems = urlList.items.map((url) => ({
		id: url.id,
		code: url.code,
		shortUrl: `${baseUrl}/${url.code}`,
		originalUrl: url.original,
		customAlias: url.customAlias,
		expiresAt: url.expiresAt,
		createdAt: url.createdAt,
		userId: url.userId,
	}));

	res.json({
		success: true,
		message: "URLs retrieved successfully",
		data: formattedItems,
		meta: urlList.meta,
	});
});

/**
 * Get URL details by ID
 * GET /api/v1/urls/:id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getUrl = asyncHandler(async (req, res) => {
	const { id } = req.params;

	const url = await urlService.getUrlById(
		Number(id),
		req.user.userId,
		req.user.role === "admin",
	);

	const baseUrl =
		process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

	res.json({
		success: true,
		message: "URL retrieved successfully",
		data: {
			id: url.id,
			code: url.code,
			shortUrl: `${baseUrl}/${url.code}`,
			originalUrl: url.original,
			customAlias: url.customAlias,
			expiresAt: url.expiresAt,
			createdAt: url.createdAt,
			userId: url.userId,
		},
	});
});

/**
 * Update URL information
 * PATCH /api/v1/urls/:id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const updateUrl = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { originalUrl, customAlias, expiresAt } = req.body;

	const url = await urlService.updateUrl(
		Number(id),
		{
			originalUrl,
			customAlias,
			expiresAt,
		},
		req.user.userId,
		req.user.role === "admin",
	);

	const baseUrl =
		process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

	res.json({
		success: true,
		message: "URL updated successfully",
		data: {
			id: url.id,
			code: url.code,
			shortUrl: `${baseUrl}/${url.code}`,
			originalUrl: url.original,
			customAlias: url.customAlias,
			expiresAt: url.expiresAt,
			createdAt: url.createdAt,
			userId: url.userId,
		},
	});
});

/**
 * Delete URL by ID
 * DELETE /api/v1/urls/:id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const deleteUrl = asyncHandler(async (req, res) => {
	const { id } = req.params;

	await urlService.deleteUrl(
		Number(id),
		req.user.userId,
		req.user.role === "admin",
	);

	res.json({
		success: true,
		message: "URL deleted successfully",
		data: {},
	});
});

/**
 * Get URL analytics and click statistics
 * GET /api/v1/urls/:id/stats
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getStats = asyncHandler(async (req, res) => {
	const { id } = req.params;

	const stats = await urlService.getStats(
		Number(id),
		req.user.userId,
		req.user.role === "admin",
	);

	const baseUrl =
		process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

	res.json({
		success: true,
		message: "URL stats retrieved successfully",
		data: {
			id: stats.url.id,
			code: stats.url.code,
			shortUrl: `${baseUrl}/${stats.url.code}`,
			originalUrl: stats.url.original,
			customAlias: stats.url.customAlias,
			expiresAt: stats.url.expiresAt,
			createdAt: stats.url.createdAt,
			analytics: {
				totalClicks: stats.totalClicks,
				cacheClicks: stats.cacheClicks,
				recentClicks: stats.recentClicks,
			},
		},
	});
});

/**
 * Redirect from short code to original URL and track click
 * GET /:code
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const redirect = asyncHandler(async (req, res) => {
	const { code } = req.params;
	const original = await urlService.resolveCode(code);

	if (!original) {
		return res.status(404).json({
			success: false,
			message: "URL not found or expired",
			errors: [],
		});
	}

	// Record click analytics asynchronously
	urlService
		.recordClick(code, {
			ip: req.ip,
			userAgent: req.get("User-Agent"),
			referer: req.get("Referer"),
		})
		.catch((err) => {
			logger.error(`Click recording failed for code=${code}`, err);
		});

	return res.redirect(302, original);
});

/**
 * Get analytics data (Admin only)
 * GET /api/v1/analytics
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getAnalytics = asyncHandler(async (req, res) => {
	const { page, limit, search, sortBy, order, urlId } = req.query;

	const analytics = await urlService.getAnalytics({
		page: Number(page) || 1,
		limit: Number(limit) || 20,
		search,
		sortBy,
		order,
		urlId: urlId ? Number(urlId) : undefined,
	});

	res.json({
		success: true,
		message: "Analytics retrieved successfully",
		data: analytics.items,
		meta: analytics.meta,
	});
});

module.exports = {
	createUrl,
	listUrls,
	getUrl,
	updateUrl,
	deleteUrl,
	getStats,
	getAnalytics,
	redirect,
};
