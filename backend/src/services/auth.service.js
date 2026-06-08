const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { redis } = require("../config/config");
const { JWT, ROLES, REDIS: REDIS_KEYS } = require("../config/constants");

const { validateEmail, validatePassword } = require("../utils/validators");

const {
	badRequest,
	conflict,
	unauthorized,
	notFound,
} = require("../utils/errors");

const { logger } = require("../utils/logger");
const userRepository = require("../repositories/user.repository");

const {
	ACCESS_TOKEN_EXPIRES_IN,
	REFRESH_TOKEN_EXPIRES_IN,
	ACCESS_TOKEN_TYPE,
	REFRESH_TOKEN_TYPE,
} = JWT;

const { USER } = ROLES;

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

const PEPPER = process.env.PASSWORD_PEPPER || "";

/* ================================
   PASSWORD
================================ */

function hashPassword(password) {
	return bcrypt.hash(password + PEPPER, SALT_ROUNDS);
}

function verifyPassword(password, hash) {
	return bcrypt.compare(password + PEPPER, hash);
}

/* ================================
   TOKEN
================================ */

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

/* ================================
   REDIS
================================ */

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
	const setKey = `${REDIS_KEYS.USER_REFRESH_SET}${userId}`;

	const tokenIds = await redis.smembers(setKey);

	if (!tokenIds.length) {
		return;
	}

	const pipeline = redis.multi();

	for (const tokenId of tokenIds) {
		pipeline.del(`${REDIS_KEYS.REFRESH_TOKEN}${tokenId}`);
	}

	pipeline.del(setKey);

	await pipeline.exec();
}

/* ================================
   SERVICE
================================ */

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
	};
}

async function refreshAccessToken(refreshToken) {
	if (!refreshToken) {
		throw unauthorized("Refresh token is required");
	}

	let payload;

	try {
		payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
	} catch {
		throw unauthorized("Invalid refresh token");
	}

	if (payload.type !== REFRESH_TOKEN_TYPE) {
		throw unauthorized("Invalid token type");
	}

	const redisKey = `${REDIS_KEYS.REFRESH_TOKEN}${payload.tokenId}`;

	const storedUserId = await redis.get(redisKey);

	if (!storedUserId || Number(storedUserId) !== payload.userId) {
		throw unauthorized("Refresh token revoked");
	}

	const user = await userRepository.findUserById(payload.userId);

	if (!user) {
		await revokeRefreshToken(payload.tokenId, payload.userId);

		throw notFound("User not found");
	}

	await revokeRefreshToken(payload.tokenId, payload.userId);

	const newTokenId = crypto.randomBytes(16).toString("hex");

	const accessToken = createAccessToken(user);

	const newRefreshToken = createRefreshToken(user.id, newTokenId);

	await saveRefreshToken(newTokenId, user.id);

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

	return user;
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

/* ================================
   EXPORT
================================ */

/**
 * Register a new user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */

/**
 * Login user and create tokens
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} Contains accessToken, refreshToken, tokenType, expiresIn
 */

/**
 * Refresh access token using refresh token
 * Revokes old token and issues new tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>} Contains new accessToken, refreshToken, tokenType, expiresIn
 */

/**
 * Logout user by revoking refresh token
 * @param {string} refreshToken
 * @returns {Promise<void>}
 */

/**
 * Get user profile information
 * @param {number} userId
 * @returns {Promise<Object>} User object
 */

/**
 * Change user password
 * Revokes all user tokens after password change
 * @param {number} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<void>}
 */

module.exports = {
	register,
	login,
	refreshAccessToken,
	logout,
	getProfile,
	changePassword,
};
