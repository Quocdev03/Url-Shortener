/**
 * Application Configuration Constants
 * Centralized constants for pagination, rate limiting, caching, and API constraints
 */

module.exports = {
	// Pagination Configuration
	PAGINATION: {
		DEFAULT_PAGE: 1,
		DEFAULT_LIMIT: 20,
		MAX_LIMIT: 100,
	},

	// Rate Limiting Configuration (requests per window)
	RATE_LIMIT: {
		AUTH_REGISTER: { limit: 5, windowSec: 60 },
		URL_PUBLIC: { limit: 10, windowSec: 60 },
		URL_AUTH: { limit: 30, windowSec: 60 },
		DEFAULT: { limit: 30, windowSec: 60 },
	},

	// Redis Key Prefixes
	REDIS: {
		REFRESH_TOKEN: "refresh_token:",
		USER_REFRESH_SET: "user_refresh_tokens:",
		URL_CACHE: "url:",
		CLICK_COUNT: "clicks:",
		RATE_LIMIT: "rl:",
	},

	// HTTP Headers
	HEADERS: {
		AUTHORIZATION: "authorization",
		REFRESH_TOKEN: "x-refresh-token",
		REQUEST_ID: "x-request-id",
	},

	// API Constraints and Limits
	API: {
		MAX_TITLE_LENGTH: 255,
		MAX_URL_LENGTH: 2048,
		MAX_ALIAS_LENGTH: 100,
	},

	// Sorting Options
	SORT: {
		CREATED_AT: "created_at",
		CLICKS: "clicks",
		VALID_FIELDS: ["created_at", "clicks"],
	},

	// HTTP Status Codes
	HTTP: {
		OK: 200,
		CREATED: 201,
		BAD_REQUEST: 400,
		UNAUTHORIZED: 401,
		FORBIDDEN: 403,
		NOT_FOUND: 404,
		CONFLICT: 409,
		TOO_MANY_REQUESTS: 429,
		INTERNAL_ERROR: 500,
	},

	// Time Constants (in seconds)
	TIME: {
		SECOND: 1,
		MINUTE: 60,
		HOUR: 3600,
		DAY: 86400,
	},

	// User Roles
	ROLES: {
		USER: "user",
		ADMIN: "admin",
	},

	// JWT Configuration
	JWT: {
		ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "7d",
		REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
		ACCESS_TOKEN_TYPE: "access",
		REFRESH_TOKEN_TYPE: "refresh",
	},
};
