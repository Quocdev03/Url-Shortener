/**
 * Custom API Error Classes and Error Factory Functions
 * Centralized error handling for the API
 */

/**
 * Standard API Error Class
 * Extends Error with status code and error details
 */
class ApiError extends Error {
	/**
	 * @param {string} message - Error message
	 * @param {number} status - HTTP status code (default: 500)
	 * @param {Array} errors - Additional error details (default: [])
	 */
	constructor(message, status = 500, errors = []) {
		super(message);

		this.status = status;
		this.errors = errors;

		Error.captureStackTrace(this, this.constructor);
	}
}

/**
 * Create 400 Bad Request error
 * @param {string} message
 * @param {Array} errors - Additional error details
 * @returns {ApiError}
 */
function badRequest(message, errors = []) {
	return new ApiError(message, 400, errors);
}

/**
 * Create 401 Unauthorized error
 * @param {string} message
 * @returns {ApiError}
 */
function unauthorized(message = "Unauthorized") {
	return new ApiError(message, 401);
}

/**
 * Create 403 Forbidden error
 * @param {string} message
 * @returns {ApiError}
 */
function forbidden(message = "Forbidden") {
	return new ApiError(message, 403);
}

/**
 * Create 404 Not Found error
 * @param {string} message
 * @returns {ApiError}
 */
function notFound(message = "Not found") {
	return new ApiError(message, 404);
}

/**
 * Create 409 Conflict error
 * @param {string} message
 * @returns {ApiError}
 */
function conflict(message = "Conflict") {
	return new ApiError(message, 409);
}

/**
 * Create 429 Too Many Requests error
 * @param {string} message
 * @returns {ApiError}
 */
function tooManyRequests(message = "Too many requests") {
	return new ApiError(message, 429);
}

module.exports = {
	ApiError,
	badRequest,
	unauthorized,
	forbidden,
	notFound,
	conflict,
	tooManyRequests,
};
