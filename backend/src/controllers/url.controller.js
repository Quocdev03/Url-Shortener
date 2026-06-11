const urlService = require("../services/url.service");
const analyticsService = require("../services/analytics.service");
const { logger } = require("../utils/logger");
const {
	formatCreateUrlResponse,
	formatListUrlsResponse,
	formatGetUrlResponse,
	formatUpdateUrlResponse,
	formatDeleteUrlResponse,
	formatStatsResponse,
	formatAnalyticsResponse,
} = require("../utils/response.formatter");

const createUrlPublic = async (req, res, next) => {
	try {
		const { originalUrl } = req.body;

		const url = await urlService.createShortUrlPublic({
			originalUrl,
		});

		const baseUrl =
			process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

		const response = formatCreateUrlResponse(
			url,
			baseUrl,
			"URL created successfully (temporary, not saved)",
			201,
		);

		res.status(response.statusCode).json(response.body);
	} catch (error) {
		next(error);
	}
};

/**
 * Tạo short URL cho người dùng đã xác thực
 * URL sẽ được lưu vào database vĩnh viễn
 * Hỗ trợ custom alias và expiration date
 */
const createUrlAuth = async (req, res, next) => {
	try {
		const { originalUrl, customAlias, expiresAt } = req.body;
		const userId = req.user.userId;

		const url = await urlService.createShortUrl({
			originalUrl,
			customAlias,
			expiresAt,
			userId,
		});

		const baseUrl =
			process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

		const response = formatCreateUrlResponse(
			url,
			baseUrl,
			"URL created successfully",
			201,
		);

		res.status(response.statusCode).json(response.body);
	} catch (error) {
		next(error);
	}
};

const listUrls = async (req, res, next) => {
	try {
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

		const response = formatListUrlsResponse(
			urlList.items,
			urlList.meta,
			baseUrl,
		);

		res.json(response.body);
	} catch (error) {
		next(error);
	}
};

/**
 * Lấy chi tiết một URL
 * Kiểm tra quyền truy cập
 */
const getUrl = async (req, res, next) => {
	try {
		const { id } = req.params;

		const url = await urlService.getUrlById(
			Number(id),
			req.user.userId,
			req.user.role === "admin",
		);

		const baseUrl =
			process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

		const response = formatGetUrlResponse(url, baseUrl);

		res.json(response.body);
	} catch (error) {
		next(error);
	}
};

/**
 * Cập nhật URL
 * Chỉ có thể cập nhật originalUrl và expiresAt
 * customAlias không được phép cập nhật
 */
const updateUrl = async (req, res, next) => {
	try {
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

		const response = formatUpdateUrlResponse(url, baseUrl);

		res.json(response.body);
	} catch (error) {
		next(error);
	}
};

const deleteUrl = async (req, res, next) => {
	try {
		const { id } = req.params;

		await urlService.deleteUrl(
			Number(id),
			req.user.userId,
			req.user.role === "admin",
		);

		const response = formatDeleteUrlResponse();

		res.json(response.body);
	} catch (error) {
		next(error);
	}
};

const getStats = async (req, res, next) => {
	try {
		const { id } = req.params;

		const stats = await analyticsService.getStats(
			Number(id),
			req.user.userId,
			req.user.role === "admin",
		);

		const baseUrl =
			process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

		const response = formatStatsResponse(stats, baseUrl);

		res.json(response.body);
	} catch (error) {
		next(error);
	}
};

/**
 * Lấy danh sách analytics (click records)
 * Hỗ trợ lọc theo URL, tìm kiếm, sắp xếp, phân trang
 */
const getAnalytics = async (req, res, next) => {
	try {
		const { page, limit, search, sortBy, order, urlId } = req.query;
		const isAdmin = req.user.role === "admin";
		const userId = req.user.userId;

		const analytics = await analyticsService.getAnalytics({
			page: Number(page) || 1,
			limit: Number(limit) || 20,
			search,
			sortBy,
			order,
			urlId: urlId ? Number(urlId) : undefined,
			userId: isAdmin ? undefined : userId,
		});

		const response = formatAnalyticsResponse(analytics.items, analytics.meta);

		res.json(response.body);
	} catch (error) {
		next(error);
	}
};

const redirect = async (req, res, next) => {
	try {
		const { code } = req.params;
		const original = await urlService.resolveCode(code);

		if (!original) {
			// Lấy frontend URL từ biến môi trường, hoặc dùng default
			const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5174";
			// Redirect user tới trang thông báo expired của frontend
			return res.redirect(302, `${frontendUrl}/expired`);
		}

		// Increment click count (fire and forget)
		analyticsService
			.incrementClick(code, {
				ip: req.ip,
				userAgent: req.get("User-Agent"),
				referer: req.get("Referer"),
			})
			.catch((err) => {
				logger.error(`Click increment failed for code=${code}`, err);
			});

		return res.redirect(302, original);
	} catch (error) {
		next(error);
	}
};

module.exports = {
	// Creation
	createUrlPublic,
	createUrlAuth,
	// Management
	listUrls,
	getUrl,
	updateUrl,
	deleteUrl,
	// Analytics
	getStats,
	getAnalytics,
	// Redirect
	redirect,
};
