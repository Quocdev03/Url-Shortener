require("dotenv").config();

const crypto = require("crypto");
const express = require("express");
const cors = require("cors");

const { logger } = require("./utils/logger");
const { notFound } = require("./utils/errors");
const { HEADERS } = require("./config/constants");
const { errorHandler } = require("./middleware");
const { initializeDatabase } = require("./database/init");

const authRoutes = require("./routes/auth.routes");
const urlRoutes = require("./routes/url.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const urlController = require("./controllers/url.controller");

const app = express();
const PORT = process.env.PORT ?? 3000;

// Gắn requestId cho mỗi request để trace log
app.use((req, res, next) => {
	req.requestId = crypto.randomUUID();
	res.setHeader(HEADERS.REQUEST_ID, req.requestId);
	next();
});

app.use(cors());

// Parse JSON request body
app.use(express.json());

// Log thông tin request sau khi response hoàn tất
app.use((req, res, next) => {
	const startTime = Date.now();

	res.on("finish", () => {
		const duration = Date.now() - startTime;

		logger.debug(
			`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`,
			{
				requestId: req.requestId,
			},
		);
	});

	next();
});

// Endpoint kiểm tra trạng thái server
app.get("/health", (req, res) => {
	res.json({
		status: "ok",
		timestamp: new Date().toISOString(),
	});
});

// Auth APIs
app.use("/api/v1/auth", authRoutes);

// URL management APIs
app.use("/api/v1/urls", urlRoutes);

// Analytics APIs
app.use("/api/v1/analytics", analyticsRoutes);

// Redirect từ short code sang URL gốc
app.get("/:code", urlController.redirect);

// Fallback cho các route không tồn tại
app.use((req, res, next) => {
	next(notFound(`Route not found: ${req.method} ${req.path}`));
});

// Middleware xử lý lỗi tập trung
app.use(errorHandler);

// Khởi động server và kết nối database
app.listen(PORT, async () => {
	logger.success(`Server is running on port ${PORT}`, {
		environment: process.env.NODE_ENV ?? "development",
	});

	// Ensure Redis connects at startup (config uses lazyConnect)
	try {
		const { redis } = require("./config/config");
		if (redis && typeof redis.connect === "function") {
			await redis.connect();
			logger.success("Redis connected (established by app startup)");
		}
	} catch (err) {
		logger.error("Redis connection failed at startup", err);
	}

	await initializeDatabase();
});

// Bắt các lỗi đồng bộ không được xử lý
process.on("uncaughtException", (err) => {
	logger.error("Uncaught exception", err);

	process.exit(1);
});

// Bắt Promise bị reject nhưng không có catch handler
process.on("unhandledRejection", (reason) => {
	logger.error(
		"Unhandled rejection",
		new Error(`Promise rejected: ${reason}`),
	);
});

module.exports = app;
