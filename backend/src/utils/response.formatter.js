/**
 * Helper để build response object với cấu trúc thống nhất
 * @param {string} message - Thông báo
 * @param {*} data - Dữ liệu để return
 * @param {number} statusCode - HTTP status code
 * @param {Object} meta - Optional metadata
 * @returns {Object} - Response object
 */
function buildResponse(message, data, statusCode = 200, meta = null) {
	const body = {
		success: true,
		message,
		data,
	};
	if (meta) body.meta = meta;
	return { statusCode, body };
}

/**
 * Format dữ liệu URL để trả về
 */
function formatUrlResponse(url, baseUrl) {
	return {
		id: url.id,
		code: url.code,
		shortUrl: `${baseUrl}/${url.code}`,
		originalUrl: url.original,
		customAlias: url.customAlias,
		expiresAt: url.expiresAt,
		createdAt: url.createdAt,
		userId: url.userId,
	};
}

/**
 * Format danh sách URLs
 */
function formatUrlListResponse(urls, baseUrl) {
	return urls.map((url) => formatUrlResponse(url, baseUrl));
}

/**
 * Format response cho tạo URL
 */
function formatCreateUrlResponse(url, baseUrl, message, statusCode = 201) {
	return buildResponse(message, formatUrlResponse(url, baseUrl), statusCode);
}

/**
 * Format response cho danh sách URLs
 */
function formatListUrlsResponse(items, meta, baseUrl) {
	return buildResponse(
		"URLs retrieved successfully",
		formatUrlListResponse(items, baseUrl),
		200,
		meta,
	);
}

/**
 * Format response cho lấy một URL
 */
function formatGetUrlResponse(url, baseUrl) {
	return buildResponse(
		"URL retrieved successfully",
		formatUrlResponse(url, baseUrl),
	);
}

/**
 * Format response cho update URL
 */
function formatUpdateUrlResponse(url, baseUrl) {
	return buildResponse(
		"URL updated successfully",
		formatUrlResponse(url, baseUrl),
	);
}

/**
 * Format response cho xóa URL
 */
function formatDeleteUrlResponse() {
	return buildResponse("URL deleted successfully", {});
}

/**
 * Format response cho stats/analytics
 */
function formatStatsResponse(stats, baseUrl) {
	return buildResponse("URL stats retrieved successfully", {
		...formatUrlResponse(stats.url, baseUrl),
		analytics: {
			totalClicks: stats.totalClicks,
			cacheClicks: stats.cacheClicks,
			recentClicks: stats.recentClicks,
		},
	});
}

/**
 * Format response cho danh sách analytics
 */
function formatAnalyticsResponse(items, meta) {
	return buildResponse("Analytics retrieved successfully", items, 200, meta);
}

module.exports = {
	formatUrlResponse,
	formatUrlListResponse,
	formatCreateUrlResponse,
	formatListUrlsResponse,
	formatGetUrlResponse,
	formatUpdateUrlResponse,
	formatDeleteUrlResponse,
	formatStatsResponse,
	formatAnalyticsResponse,
};
