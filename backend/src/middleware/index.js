const jwt = require("jsonwebtoken");
const { redis } = require("../config/config");
const { HEADERS, REDIS: REDIS_KEYS } = require("../config/constants");
const { logger } = require("../utils/logger");
const { unauthorized, forbidden, tooManyRequests } = require("../utils/errors");

// Middleware kiểm tra JWT access token
function auth(req, res, next) {
	// Lấy Authorization header (format: "Bearer <token>")
	const header = req.headers.authorization;
	if (!header || !header.startsWith("Bearer ")) {
		return next(unauthorized("Missing or invalid token"));
	}

	try {
		// Verify JWT signature + check expiration
		const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
		// Verify token type là ACCESS (không phải REFRESH)
		if (payload.type !== "access") {
			return next(unauthorized("Invalid token type"));
		}

		// Attach user info vào req.user cho handlers sử dụng
		req.user = {
			userId: payload.userId,
			email: payload.email,
			role: payload.role,
		};

		next();
	} catch (err) {
		// JWT invalid, expired, or signature mismatch
		next(unauthorized("Token expired or invalid"));
	}
}

// Middleware kiểm tra quyền (role-based access)
function authorize(...allowedRoles) {
	return (req, res, next) => {
		const user = req.user; // From auth middleware
		// Verify user có role trong allowedRoles list
		if (!user || !allowedRoles.includes(user.role)) {
			return next(forbidden("Insufficient permissions"));
		}
		next();
	};
}

// Rate limit middleware (Redis Sorted Set)
function rateLimit({ limit = 30, windowSec = 60 } = {}) {
	return async (req, res, next) => {
		try {
			// Tạo identifier (user-based cho authenticated, IP-based cho public)
			// Format: "user:123" hoặc "ip:192.168.1.1"
			// Fallback IP lấy từ: req.ip (với trust proxy) → req.socket.remoteAddress → 'unknown'
			const ip = req.ip || req.socket?.remoteAddress || "unknown";
			const identifier = req.user ? `user:${req.user.userId}` : `ip:${ip}`;

			// Redis key: "rate_limit:user:123" hoặc "rate_limit:ip:..."
			const key = `${REDIS_KEYS.RATE_LIMIT}${identifier}`;
			const now = Date.now();
			const windowMs = windowSec * 1000;

			// Remove old entries (older than window) từ Redis Sorted Set
			// zremrangebyscore: xóa các member có score < (now - windowMs)
			await redis.zremrangebyscore(key, 0, now - windowMs);

			// Add current timestamp vào sorted set (score = now)
			await redis.zadd(key, now, String(now));

			// Set expiration cho key (cleanup data sau khi window kết thúc)
			await redis.expire(key, windowSec);

			// Get total requests trong window
			const count = await redis.zcard(key);
			// Tính remaining requests
			const remaining = Math.max(0, limit - count);

			// Set response headers cho client biết limit status
			res.setHeader("X-RateLimit-Limit", limit);
			res.setHeader("X-RateLimit-Remaining", remaining);
			res.setHeader(
				"X-RateLimit-Reset",
				new Date(now + windowMs).toISOString(),
			);

			// Nếu vượt quá limit → reject request
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
			// Nếu Redis error → log + allow request (fail-open)
			logger.error("Rate limit middleware error", err);
			next();
		}
	};
}

// Centralized error handler middleware
function errorHandler(err, req, res, next) {
	// Get HTTP status code (default 500)
	const status = err.status ?? 500;
	// Get request ID từ headers (set by app middleware)
	const requestId = req.headers[HEADERS.REQUEST_ID] || "unknown";
	// Get error message
	const message = err.message ?? "Internal server error";

	// Log error với request context
	logger.error(`[${requestId}] ${message}`, err);

	// Build error response
	const payload = { success: false, message, errors: err.errors ?? [] };

	// Set request ID header cho tracing
	res.setHeader(HEADERS.REQUEST_ID, requestId);
	res.status(status).json(payload);
}

module.exports = {
	auth,
	authorize,
	rateLimit,
	errorHandler,
};
