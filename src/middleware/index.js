/**
 * Application Middleware
 * Handles authentication, authorization, rate limiting, and error handling
 */

const jwt = require("jsonwebtoken");
const { redis } = require("../config/config");
const { HEADERS, REDIS: REDIS_KEYS } = require("../config/constants");
const { logger } = require("../utils/logger");
const { unauthorized, forbidden, tooManyRequests } = require("../utils/errors");

/**
 * JWT Authentication Middleware
 * Validates Bearer token and attaches user to request
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 */
function auth(req, res, next) {
	const header = req.headers.authorization;
	if (!header || !header.startsWith("Bearer ")) {
		return next(unauthorized("Missing or invalid token"));
	}

	try {
		const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
		if (payload.type !== "access") {
			return next(unauthorized("Invalid token type"));
		}

		req.user = {
			userId: payload.userId,
			email: payload.email,
			role: payload.role,
		};

		next();
	} catch (err) {
		next(unauthorized("Token expired or invalid"));
	}
}

/**
 * Role-Based Authorization Middleware
 * Ensures user has required role permissions
 * @param {...string} allowedRoles - Allowed user roles
 * @returns {Function} Express middleware
 */
function authorize(...allowedRoles) {
	return (req, res, next) => {
		const user = req.user;
		if (!user || !allowedRoles.includes(user.role)) {
			return next(forbidden("Insufficient permissions"));
		}
		next();
	};
}

/**
 * Sliding Window Rate Limiting Middleware
 * Uses Redis sorted sets to track requests per user or IP
 * @param {Object} options - Configuration
 * @param {number} options.limit - Max requests per window
 * @param {number} options.windowSec - Time window in seconds
 * @returns {Function} Express middleware
 */
function rateLimit({ limit = 30, windowSec = 60 } = {}) {
	return async (req, res, next) => {
		try {
			// Track by user ID if authenticated, otherwise by IP
			const identifier = req.user
				? `user:${req.user.userId}`
				: `ip:${req.ip}`;
			const key = `${REDIS_KEYS.RATE_LIMIT}${identifier}`;
			const now = Date.now();
			const windowMs = windowSec * 1000;

			// Remove old requests outside the window
			await redis.zremrangebyscore(key, 0, now - windowMs);
			// Add current request
			await redis.zadd(key, now, String(now));
			await redis.expire(key, windowSec);

			const count = await redis.zcard(key);
			const remaining = Math.max(0, limit - count);

			// Set rate limit response headers
			res.setHeader("X-RateLimit-Limit", limit);
			res.setHeader("X-RateLimit-Remaining", remaining);
			res.setHeader(
				"X-RateLimit-Reset",
				new Date(now + windowMs).toISOString(),
			);

			if (count > limit) {
				logger.warn("Rate limit exceeded", {
					identifier,
					count,
					limit,
				});
				return next(
					tooManyRequests("Too many requests, please try again later"),
				);
			}

			next();
		} catch (err) {
			logger.error("Rate limit middleware error", err);
			next();
		}
	};
}

/**
 * Centralized Error Handler Middleware
 * Processes all errors and formats response
 * @param {Error} err - Error object
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 */
function errorHandler(err, req, res, next) {
	const status = err.status ?? 500;
	const requestId = req.headers[HEADERS.REQUEST_ID] || "unknown";
	const message = err.message ?? "Internal server error";

	logger.error(`[${requestId}] ${message}`, err);

	const payload = { success: false, message, errors: err.errors ?? [] };

	res.setHeader(HEADERS.REQUEST_ID, requestId);
	res.status(status).json(payload);
}

module.exports = {
	auth,
	authorize,
	rateLimit,
	errorHandler,
};
