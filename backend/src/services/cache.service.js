const { redis } = require("../config/config");
const { REDIS: REDIS_KEYS } = require("../config/constants");

const URL_CACHE_PREFIX = REDIS_KEYS.URL_CACHE || "url:";
const CLICK_COUNT_PREFIX = REDIS_KEYS.CLICK_COUNT || "clicks:";
const URL_CACHE_TTL = 60 * 60; // 1 hour

/**
 * Lấy URL từ cache Redis
 * @param {string} code - Mã rút gọn của URL
 * @returns {Promise<string|null>} - Original URL hoặc null nếu không tìm thấy
 */
function getUrlCache(code) {
	return redis.get(`${URL_CACHE_PREFIX}${code}`);
}

/**
 * Lưu URL vào cache Redis
 * @param {string} code - Mã rút gọn
 * @param {string} original - URL gốc
 * @returns {Promise<void>}
 */
function setUrlCache(code, original) {
	return redis.setex(`${URL_CACHE_PREFIX}${code}`, URL_CACHE_TTL, original);
}

/**
 * Xóa URL khỏi cache
 * @param {string} code - Mã rút gọn
 * @returns {Promise<void>}
 */
function deleteUrlCache(code) {
	return redis.del(`${URL_CACHE_PREFIX}${code}`);
}

/**
 * Lấy số click từ cache
 * @param {string} code - Mã rút gọn
 * @returns {Promise<string|null>} - Số click hoặc null nếu không tìm thấy
 */
function getClickCache(code) {
	return redis.get(`${CLICK_COUNT_PREFIX}${code}`);
}

module.exports = {
	getUrlCache,
	setUrlCache,
	deleteUrlCache,
	getClickCache,
};
