const authService = require("../services/auth.service");
const { HEADERS } = require("../config/constants");

// Đăng ký user mới với email + password
const register = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		// Call service để validate + hash password + create user + generate tokens
		const result = await authService.registerAndCreateTokens(email, password);
		res.status(201).json({
			success: true,
			message: "User registered successfully",
			data: result,
		});
	} catch (error) {
		next(error);
	}
};

// Đăng nhập user, trả về access + refresh tokens
const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		// Call service để verify password + create tokens + save refresh token to Redis
		const tokens = await authService.login(email, password);
		res.json({
			success: true,
			message: "Login successful",
			data: tokens,
		});
	} catch (error) {
		next(error);
	}
};

// Refresh access token bằng refresh token (one-time use pattern)
const refreshToken = async (req, res, next) => {
	try {
		// Lấy refresh token từ body hoặc custom header
		const token = req.body.refreshToken ?? req.headers[HEADERS.REFRESH_TOKEN];
		// Call service để verify + revoke old token + generate new tokens
		const tokens = await authService.refreshAccessToken(token);
		res.json({
			success: true,
			message: "Token refreshed successfully",
			data: tokens,
		});
	} catch (error) {
		next(error);
	}
};

// Logout: revoke refresh token
const logout = async (req, res, next) => {
	try {
		const token = req.body.refreshToken ?? req.headers[HEADERS.REFRESH_TOKEN];
		// Call service để xóa refresh token từ Redis (revoke)
		await authService.logout(token);
		res.json({
			success: true,
			message: "Logged out successfully",
			data: {},
		});
	} catch (error) {
		next(error);
	}
};

// Lấy profile của user đang đăng nhập
const profile = async (req, res, next) => {
	try {
		// userId đã được parse từ JWT bởi auth middleware
		const user = await authService.getProfile(req.user.userId);
		res.json({
			success: true,
			message: "Profile retrieved successfully",
			data: {
				user: {
					id: user.id,
					email: user.email,
					role: user.role,
					createdAt: user.createdAt,
					urls: user.urls,
				},
			},
		});
	} catch (error) {
		next(error);
	}
};

const changePassword = async (req, res, next) => {
	try {
		const { currentPassword, newPassword } = req.body;
		await authService.changePassword(
			req.user.userId,
			currentPassword,
			newPassword,
		);
		res.json({
			success: true,
			message: "Password changed successfully",
			data: {},
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	register,
	login,
	refreshToken,
	logout,
	profile,
	changePassword,
};
