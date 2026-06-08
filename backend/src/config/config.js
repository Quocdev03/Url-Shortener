/**
 * Database and Cache Configuration
 * Initializes MySQL connection pool and Redis client
 */

const mysql = require("mysql2/promise");
const Redis = require("ioredis");

/**
 * MySQL Connection Pool
 * Manages connections to MySQL/MariaDB database
 */
const db = mysql.createPool({
	host: process.env.DB_HOST || "localhost",
	port: process.env.DB_PORT || 3306,
	user: process.env.DB_USER || "root",
	password: process.env.DB_PASSWORD || "secret",
	database: process.env.DB_NAME || "urlshortener",
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

/**
 * Redis Client
 * Handles caching and session management
 * Uses lazy connect to allow graceful startup
 */
const redis = new Redis({
	host: process.env.REDIS_HOST || "localhost",
	port: process.env.REDIS_PORT || 6379,
	lazyConnect: true,
});

// Redis event listeners
redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err));

module.exports = {
	db,
	redis,
};
