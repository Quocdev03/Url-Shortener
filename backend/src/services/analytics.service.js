const { forbidden, notFound } = require("../utils/errors");
const urlRepository = require("../repositories/url.repository");
const analyticsRepository = require("../repositories/analytics.repository");

/**
 * Increment click count và lưu chi tiết click
 * @param {string} code - Mã rút gọn
 * @param {Object} clickData - Thông tin click {ip, userAgent, referer}
 * @returns {Promise<void>}
 */
async function incrementClick(code, { ip, userAgent, referer }) {
	const url = await urlRepository.findUrlByCode(code);
	if (!url) return;

	// Increment clicks counter trong urls table
	await analyticsRepository.incrementClickCount(url.id);

	// Lưu chi tiết click vào analytics table
	await analyticsRepository.recordClick({
		urlId: url.id,
		ip,
		userAgent,
		referer,
	});
}

/**
 * Lấy thống kê chi tiết của một URL
 * @param {number} id - ID của URL
 * @param {number} userId - ID người dùng hiện tại
 * @param {boolean} isAdmin - Có phải admin không
 * @returns {Promise<Object>} - Thống kê URL {url, totalClicks, recentClicks}
 */
async function getStats(id, userId, isAdmin) {
	const url = await urlRepository.findUrlById(id);
	if (!url) throw notFound("URL not found");
	if (!isAdmin && url.userId !== userId) throw forbidden("Access denied");

	const analytics = await analyticsRepository.getUrlAnalytics(id);

	return {
		url,
		totalClicks: analytics.total,
		recentClicks: analytics.recent,
	};
}

/**
 * Lấy danh sách analytics của tất cả URLs hoặc một URL cụ thể
 * @param {Object} options - Tùy chọn lọc {page, limit, search, sortBy, order, urlId}
 * @returns {Promise<Object>} - {items, meta}
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

	const total = await analyticsRepository.countAnalyticsByQuery({
		search,
		urlId,
	});

	const items = await analyticsRepository.getAllAnalytics({
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
	incrementClick,
	getStats,
	getAnalytics,
};
