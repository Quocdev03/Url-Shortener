const authService = require("../services/auth.service");
const { asyncHandler } = require("../middleware/asyncHandler");
const { HEADERS } = require("../config/constants");

/**
 * Register new user
 */
const register = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	const user = await authService.register(email, password);
	res.status(201).json({
		success: true,
		message: "User registered successfully",
		data: { user },
	});
});

/**
 * Login user
 */
const login = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	const tokens = await authService.login(email, password);
	res.json({
		success: true,
		message: "Login successful",
		data: tokens,
	});
});

/**
 * Refresh access token
 */
const refreshToken = asyncHandler(async (req, res) => {
	const token = req.body.refreshToken ?? req.headers[HEADERS.REFRESH_TOKEN];
	const tokens = await authService.refreshAccessToken(token);
	res.json({
		success: true,
		message: "Token refreshed successfully",
		data: tokens,
	});
});

/**
 * Logout user
 */
const logout = asyncHandler(async (req, res) => {
	const token = req.body.refreshToken ?? req.headers[HEADERS.REFRESH_TOKEN];
	await authService.logout(token);
	res.json({
		success: true,
		message: "Logged out successfully",
		data: {},
	});
});

/**
 * Get user profile
 */
const profile = asyncHandler(async (req, res) => {
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
			},
		},
	});
});

/**
 * Change user password
 */
const changePassword = asyncHandler(async (req, res) => {
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
});

module.exports = {
	register,
	login,
	refreshToken,
	logout,
	profile,
	changePassword,
};
