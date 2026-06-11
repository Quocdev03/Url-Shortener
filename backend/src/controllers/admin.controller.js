const adminService = require("../services/admin.service");

// Helper to construct shortUrl
function getBaseUrl(req) {
	return process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
}

async function getUsers(req, res, next) {
	try {
		const page = Number(req.query.page) || 1;
		const limit = Number(req.query.limit) || 20;
		const search = req.query.search || "";

		const result = await adminService.listUsers({ search, page, limit });

		res.json({
			success: true,
			message: "Users retrieved successfully",
			data: result.users,
			meta: {
				page,
				limit,
				total: result.total,
				totalPages: result.totalPages,
			},
		});
	} catch (error) {
		next(error);
	}
}

async function createUser(req, res, next) {
	try {
		const { email, password, role } = req.body;
		const user = await adminService.createUser({ email, password, role });

		res.status(201).json({
			success: true,
			message: "User created successfully",
			data: user,
		});
	} catch (error) {
		next(error);
	}
}

async function updateUser(req, res, next) {
	try {
		const id = Number(req.params.id);
		const { email, password, role } = req.body;
		const currentUserId = req.user.userId;

		const user = await adminService.updateUser(id, { email, password, role }, currentUserId);

		res.json({
			success: true,
			message: "User updated successfully",
			data: user,
		});
	} catch (error) {
		next(error);
	}
}

async function deleteUser(req, res, next) {
	try {
		const id = Number(req.params.id);
		const currentUserId = req.user.userId;

		await adminService.deleteUser(id, currentUserId);

		res.json({
			success: true,
			message: "User and all associated URLs deleted successfully",
			data: {},
		});
	} catch (error) {
		next(error);
	}
}

async function getUrls(req, res, next) {
	try {
		const page = Number(req.query.page) || 1;
		const limit = Number(req.query.limit) || 20;
		const search = req.query.search || "";
		const userId = req.query.userId;

		const result = await adminService.listUrls({ userId, search, page, limit });
		const baseUrl = getBaseUrl(req);

		const formattedUrls = result.urls.map(url => ({
			...url,
			shortUrl: `${baseUrl}/${url.code}`,
		}));

		res.json({
			success: true,
			message: "URLs retrieved successfully",
			data: formattedUrls,
			meta: {
				page,
				limit,
				total: result.total,
				totalPages: result.totalPages,
			},
		});
	} catch (error) {
		next(error);
	}
}

async function createUrl(req, res, next) {
	try {
		const { originalUrl, customAlias, expiresAt, userId } = req.body;
		const url = await adminService.createUrl({ originalUrl, customAlias, expiresAt, userId });
		const baseUrl = getBaseUrl(req);

		res.status(201).json({
			success: true,
			message: "URL created successfully",
			data: {
				...url,
				shortUrl: `${baseUrl}/${url.code}`,
			},
		});
	} catch (error) {
		next(error);
	}
}

async function updateUrl(req, res, next) {
	try {
		const id = Number(req.params.id);
		const { originalUrl, expiresAt } = req.body;

		const url = await adminService.updateUrl(id, { originalUrl, expiresAt });
		const baseUrl = getBaseUrl(req);

		res.json({
			success: true,
			message: "URL updated successfully",
			data: {
				...url,
				shortUrl: `${baseUrl}/${url.code}`,
			},
		});
	} catch (error) {
		next(error);
	}
}

async function deleteUrl(req, res, next) {
	try {
		const id = Number(req.params.id);

		await adminService.deleteUrl(id);

		res.json({
			success: true,
			message: "URL deleted successfully",
			data: {},
		});
	} catch (error) {
		next(error);
	}
}

module.exports = {
	getUsers,
	createUser,
	updateUser,
	deleteUser,
	getUrls,
	createUrl,
	updateUrl,
	deleteUrl,
};
