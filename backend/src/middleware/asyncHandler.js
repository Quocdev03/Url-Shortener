/**
 * Async Route Handler Wrapper
 * Automatically catches and forwards errors from async route handlers to error middleware
 */

/**
 * Wraps async route handlers to catch unhandled promise rejections
 * @param {Function} fn - Async route handler function (req, res, next)
 * @returns {Function} Express middleware
 */
function asyncHandler(fn) {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}

module.exports = {
	asyncHandler,
};
