const userRepository = require("../repositories/user.repository");
const urlRepository = require("../repositories/url.repository");
const urlService = require("../services/url.service");
const { hashPassword } = require("../services/auth.service");
const { validateEmail, validatePassword } = require("../utils/validators");
const { forbidden, notFound, conflict, badRequest } = require("../utils/errors");

/**
 * Lấy danh sách users kèm phân trang và tìm kiếm
 */
async function listUsers({ search = "", page = 1, limit = 20 }) {
	const offset = (page - 1) * limit;
	const users = await userRepository.findAllUsers({ search, limit, offset });
	const total = await userRepository.countAllUsers({ search });

	return {
		users,
		total,
		totalPages: Math.ceil(total / limit),
	};
}

/**
 * Tạo người dùng mới (admin tool)
 */
async function createUser({ email, password, role }) {
	const validatedEmail = validateEmail(email);
	validatePassword(password);

	if (role !== "user" && role !== "admin") {
		throw badRequest("Invalid role");
	}

	const existingUser = await userRepository.findUserByEmail(validatedEmail);
	if (existingUser) {
		throw conflict("Email already exists");
	}

	const passwordHash = await hashPassword(password);
	const user = await userRepository.createUser(validatedEmail, passwordHash, role);

	return {
		id: user.id,
		email: user.email,
		role: user.role,
	};
}

/**
 * Cập nhật thông tin người dùng (admin tool)
 */
async function updateUser(id, { email, role, password }, currentUserId) {
	if (isNaN(id)) {
		throw badRequest("Invalid user ID");
	}

	// RULE 1: Cấm tự chỉnh sửa chính mình
	if (id === currentUserId) {
		throw forbidden("You cannot update your own account role/status here. Please update via Profile page.");
	}

	const targetUser = await userRepository.findUserById(id);
	if (!targetUser) {
		throw notFound("User not found");
	}

	// RULE 2: Cấm chỉnh sửa admin khác
	if (targetUser.role === "admin") {
		throw forbidden("You cannot update another admin's account.");
	}

	const fieldsToUpdate = {};

	if (email) {
		const validatedEmail = validateEmail(email);
		if (validatedEmail !== targetUser.email) {
			const existingUser = await userRepository.findUserByEmail(validatedEmail);
			if (existingUser) {
				throw conflict("Email already exists");
			}
			fieldsToUpdate.email = validatedEmail;
		}
	}

	if (role) {
		if (role !== "user" && role !== "admin") {
			throw badRequest("Invalid role");
		}
		fieldsToUpdate.role = role;
	}

	if (password) {
		validatePassword(password);
		fieldsToUpdate.password = await hashPassword(password);
	}

	const updatedUser = await userRepository.updateUser(id, fieldsToUpdate);
	return {
		id: updatedUser.id,
		email: updatedUser.email,
		role: updatedUser.role,
		createdAt: updatedUser.createdAt,
	};
}

/**
 * Xoá người dùng và cascade URLs (admin tool)
 */
async function deleteUser(id, currentUserId) {
	if (isNaN(id)) {
		throw badRequest("Invalid user ID");
	}

	// RULE 1: Cấm tự xoá chính mình
	if (id === currentUserId) {
		throw forbidden("You cannot delete your own account.");
	}

	const targetUser = await userRepository.findUserById(id);
	if (!targetUser) {
		throw notFound("User not found");
	}

	// RULE 2: Cấm xoá admin khác
	if (targetUser.role === "admin") {
		throw forbidden("You cannot delete another admin's account.");
	}

	// Xoá tất cả URLs thuộc về user này (cascade)
	const userUrls = await urlRepository.findUrlsByQuery({ userId: id, limit: 10000 });
	for (const url of userUrls) {
		await urlRepository.deleteUrl(url.id);
	}

	// Xoá user
	await userRepository.deleteUser(id);
}

/**
 * Lấy danh sách URLs (admin tool)
 */
async function listUrls({ userId, search = "", page = 1, limit = 20 }) {
	const offset = (page - 1) * limit;
	let filterUserId = undefined;

	if (userId) {
		filterUserId = Number(userId);
		if (isNaN(filterUserId)) {
			throw badRequest("Invalid userId filter");
		}
	}

	const urls = await urlRepository.findUrlsByQuery({
		userId: filterUserId,
		search,
		limit,
		offset,
	});

	const total = await urlRepository.countUrlsByQuery({
		userId: filterUserId,
		search,
	});

	return {
		urls,
		total,
		totalPages: Math.ceil(total / limit),
	};
}

/**
 * Tạo URL mới cho một user cụ thể (admin tool)
 */
async function createUrl({ originalUrl, customAlias, expiresAt, userId }) {
	if (!userId) {
		throw badRequest("userId is required");
	}

	const targetUser = await userRepository.findUserById(Number(userId));
	if (!targetUser) {
		throw notFound("Owner user not found");
	}

	const url = await urlService.createShortUrl({
		originalUrl,
		customAlias,
		expiresAt,
		userId: Number(userId),
	});

	return url;
}

/**
 * Cập nhật thông tin URL (admin tool)
 */
async function updateUrl(id, { originalUrl, expiresAt }) {
	if (isNaN(id)) {
		throw badRequest("Invalid URL ID");
	}

	const targetUrl = await urlRepository.findUrlById(id);
	if (!targetUrl) {
		throw notFound("URL not found");
	}

	const fieldsToUpdate = {};
	if (originalUrl) {
		fieldsToUpdate.original = originalUrl;
	}
	if (expiresAt !== undefined) {
		fieldsToUpdate.expiresAt = expiresAt;
	}

	const updatedUrl = await urlRepository.updateUrl(id, fieldsToUpdate);
	return updatedUrl;
}

/**
 * Xoá URL (admin tool)
 */
async function deleteUrl(id) {
	if (isNaN(id)) {
		throw badRequest("Invalid URL ID");
	}

	const targetUrl = await urlRepository.findUrlById(id);
	if (!targetUrl) {
		throw notFound("URL not found");
	}

	await urlRepository.deleteUrl(id);
}

module.exports = {
	listUsers,
	createUser,
	updateUser,
	deleteUser,
	listUrls,
	createUrl,
	updateUrl,
	deleteUrl,
};
