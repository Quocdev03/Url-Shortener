const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { redis } = require("../config/config");
const {
	JWT,
	ROLES,
	REDIS: REDIS_KEYS,
	SHORT_URL_DOMAIN,
} = require("../config/constants");

const { validateEmail, validatePassword } = require("../utils/validators");

const {
	badRequest,
	conflict,
	unauthorized,
	notFound,
} = require("../utils/errors");

const { logger } = require("../utils/logger");
const userRepository = require("../repositories/user.repository");
const urlRepository = require("../repositories/url.repository");

const {
	ACCESS_TOKEN_EXPIRES_IN,
	REFRESH_TOKEN_EXPIRES_IN,
	ACCESS_TOKEN_TYPE,
	REFRESH_TOKEN_TYPE,
} = JWT;

const { USER } = ROLES;

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

const PEPPER = process.env.PASSWORD_PEPPER || "";

function hashPassword(password) {
	return bcrypt.hash(password + PEPPER, SALT_ROUNDS);
}

function verifyPassword(password, hash) {
	return bcrypt.compare(password + PEPPER, hash);
}

function parseExpiration(value) {
	const match = String(value).match(/^(\d+)([smhd])$/);

	if (!match) {
		return 30 * 24 * 60 * 60;
	}

	const [, amount, unit] = match;

	const map = {
		s: 1,
		m: 60,
		h: 3600,
		d: 86400,
	};

	return Number(amount) * map[unit];
}

const REFRESH_TOKEN_TTL = parseExpiration(REFRESH_TOKEN_EXPIRES_IN);

function createAccessToken(user) {
	return jwt.sign(
		{
			userId: user.id,
			email: user.email,
			role: user.role,
			type: ACCESS_TOKEN_TYPE,
		},
		process.env.JWT_SECRET,
		{
			expiresIn: ACCESS_TOKEN_EXPIRES_IN,
		},
	);
}

function createRefreshToken(userId, tokenId) {
	return jwt.sign(
		{
			userId,
			tokenId,
			type: REFRESH_TOKEN_TYPE,
		},
		process.env.JWT_SECRET,
		{
			expiresIn: REFRESH_TOKEN_EXPIRES_IN,
		},
	);
}

async function saveRefreshToken(tokenId, userId) {
	const tokenKey = `${REDIS_KEYS.REFRESH_TOKEN}${tokenId}`;

	const setKey = `${REDIS_KEYS.USER_REFRESH_SET}${userId}`;

	await redis
		.multi()
		.set(tokenKey, userId, "EX", REFRESH_TOKEN_TTL)
		.sadd(setKey, tokenId)
		.exec();
}

async function revokeRefreshToken(tokenId, userId) {
	const tokenKey = `${REDIS_KEYS.REFRESH_TOKEN}${tokenId}`;

	const setKey = `${REDIS_KEYS.USER_REFRESH_SET}${userId}`;

	await redis.multi().del(tokenKey).srem(setKey, tokenId).exec();
}

async function revokeAllRefreshTokens(userId) {
	// Redis set key lưu tất cả refresh tokenIds của user (format: "user_refresh_set:${userId}")
	const setKey = `${REDIS_KEYS.USER_REFRESH_SET}${userId}`;

	// Lấy tất cả tokenIds từ Redis set (O(N) complexity)
	const tokenIds = await redis.smembers(setKey);

	// Early exit nếu user không có token nào
	if (!tokenIds.length) {
		return;
	}

	// Khởi tạo Redis pipeline (batch multiple commands → 1 RTT)
	// Thay vì gửi N+1 commands riêng biệt, gửi all commands cùng lúc
	const pipeline = redis.multi();

	// Loop qua tất cả tokenIds và xóa từng token khỏi Redis
	// Format: "refresh_token:${tokenId}"
	for (const tokenId of tokenIds) {
		pipeline.del(`${REDIS_KEYS.REFRESH_TOKEN}${tokenId}`);
	}

	// Xóa luôn Redis set chứa tokenIds (cleanup set này)
	pipeline.del(setKey);

	// Execute tất cả commands trong pipeline atomically
	await pipeline.exec();
}

async function register(email, password) {
	email = validateEmail(email);

	password = validatePassword(password, {
		min: 8,
	});

	const existing = await userRepository.findUserByEmail(email);

	if (existing) {
		throw conflict("Email already registered");
	}

	const passwordHash = await hashPassword(password);

	const user = await userRepository.createUser(email, passwordHash);

	logger.info("User registered", {
		userId: user.id,
		email,
	});

	return user;
}

async function registerAndCreateTokens(email, password) {
	// Register user first
	const user = await register(email, password);

	// Create tokens
	const tokenId = crypto.randomBytes(16).toString("hex");
	const accessToken = createAccessToken(user);
	const refreshToken = createRefreshToken(user.id, tokenId);

	await saveRefreshToken(tokenId, user.id);

	return {
		accessToken,
		refreshToken,
		tokenType: "Bearer",
		expiresIn: ACCESS_TOKEN_EXPIRES_IN,
		user: {
			id: user.id,
			email: user.email,
			role: user.role,
		},
	};
}

async function login(email, password) {
	email = validateEmail(email);

	password = validatePassword(password);

	const user = await userRepository.findUserByEmail(email);

	if (!user) {
		throw unauthorized("Invalid credentials");
	}

	const isValid = await verifyPassword(password, user.password);

	if (!isValid) {
		throw unauthorized("Invalid credentials");
	}

	const tokenId = crypto.randomBytes(16).toString("hex");

	const accessToken = createAccessToken(user);

	const refreshToken = createRefreshToken(user.id, tokenId);

	await saveRefreshToken(tokenId, user.id);

	return {
		accessToken,
		refreshToken,
		tokenType: "Bearer",
		expiresIn: ACCESS_TOKEN_EXPIRES_IN,
		user: {
			id: user.id,
			email: user.email,
			role: user.role,
		},
	};
}

async function refreshAccessToken(refreshToken) {
	// Kiểm tra refresh token có được cung cấp không
	if (!refreshToken) {
		throw unauthorized("Refresh token is required");
	}

	let payload;

	// Verify JWT signature + check expiration
	try {
		payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
	} catch {
		// Token invalid, expired, hoặc signature không match
		throw unauthorized("Invalid refresh token");
	}

	// Xác thực token loại là REFRESH (không phải ACCESS)
	if (payload.type !== REFRESH_TOKEN_TYPE) {
		throw unauthorized("Invalid token type");
	}

	// Xây dựng Redis key từ tokenId (format: "refresh_token:${tokenId}")
	const redisKey = `${REDIS_KEYS.REFRESH_TOKEN}${payload.tokenId}`;

	// Lấy userId từ Redis (nếu token bị revoke sẽ không tồn tại)
	const storedUserId = await redis.get(redisKey);

	// Kiểm tra: token có trong Redis + userId match JWT payload
	// Nếu fail → token đã bị revoke hoặc data không hợp lệ
	if (!storedUserId || Number(storedUserId) !== payload.userId) {
		throw unauthorized("Refresh token revoked");
	}

	// Fetch user từ DB để đảm bảo user vẫn tồn tại + lấy dữ liệu mới
	const user = await userRepository.findUserById(payload.userId);

	// Nếu user bị xóa → revoke token cũ rồi throw error
	if (!user) {
		await revokeRefreshToken(payload.tokenId, payload.userId);
		throw notFound("User not found");
	}

	// Revoke token cũ (one-time use) - ngăn reuse cùng 1 token nhiều lần
	await revokeRefreshToken(payload.tokenId, payload.userId);

	// Generate tokenId mới (random 32 hex) cho refresh token mới
	const newTokenId = crypto.randomBytes(16).toString("hex");

	// Tạo access token mới (short-lived, default 15m)
	const accessToken = createAccessToken(user);

	// Tạo refresh token mới với tokenId mới
	const newRefreshToken = createRefreshToken(user.id, newTokenId);

	// Lưu refresh token mới vào Redis với TTL (default 7 days)
	await saveRefreshToken(newTokenId, user.id);

	// Return cặp tokens mới
	return {
		accessToken,
		refreshToken: newRefreshToken,
		tokenType: "Bearer",
		expiresIn: ACCESS_TOKEN_EXPIRES_IN,
	};
}

async function logout(refreshToken) {
	if (!refreshToken) {
		throw unauthorized("Refresh token is required");
	}

	let payload;

	try {
		payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
	} catch {
		throw unauthorized("Invalid refresh token");
	}

	await revokeRefreshToken(payload.tokenId, payload.userId);

	logger.info("User logout", {
		userId: payload.userId,
	});
}

async function getProfile(userId) {
	const user = await userRepository.findUserById(userId);

	if (!user) {
		throw notFound("User not found");
	}

	// Fetch user's shortened URLs
	const urls = await urlRepository.findUrlsByQuery({
		userId: userId,
		sortBy: "created_at",
		order: "DESC",
		limit: 100,
	});

	// Enrich URLs with click stats, expiration status, and shortUrl
	const urlsWithStats = urls.map((url) => {
		const isExpired =
			url.expiresAt && new Date(url.expiresAt) < new Date() ? true : false;

		return {
			id: url.id,
			code: url.code,
			shortUrl: `${SHORT_URL_DOMAIN}${url.customAlias || url.code}`,
			originalUrl: url.original,
			customAlias: url.customAlias,
			expiresAt: url.expiresAt,
			createdAt: url.createdAt,
			userId: url.userId,
			clicks: url.clicks || 0,
			isExpired,
		};
	});

	// Remove password from user object
	const { password, ...userWithoutPassword } = user;

	return {
		...userWithoutPassword,
		urls: urlsWithStats,
		domain: SHORT_URL_DOMAIN,
	};
}

async function changePassword(userId, currentPassword, newPassword) {
	currentPassword = validatePassword(currentPassword);

	newPassword = validatePassword(newPassword, {
		min: 8,
	});

	if (currentPassword === newPassword) {
		throw badRequest("New password must be different");
	}

	const user = await userRepository.findUserWithPasswordById(userId);

	if (!user) {
		throw notFound("User not found");
	}

	const isValid = await verifyPassword(currentPassword, user.password);

	if (!isValid) {
		throw unauthorized("Current password incorrect");
	}

	const passwordHash = await hashPassword(newPassword);

	await userRepository.updateUserPassword(userId, passwordHash);

	await revokeAllRefreshTokens(userId);

	logger.info("Password changed", {
		userId,
	});
}

module.exports = {
	register,
	registerAndCreateTokens,
	login,
	refreshAccessToken,
	logout,
	getProfile,
	changePassword,
};
