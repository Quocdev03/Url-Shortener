/**
 * Input Validation Utilities
 * Validates user inputs like email, password, and URL
 */

const { badRequest } = require("./errors");

/**
 * Validate and normalize email address
 * @param {string} email
 * @returns {string} Normalized email (trimmed, lowercase)
 * @throws {ApiError} 400 if email is invalid
 */
function validateEmail(email) {
	if (typeof email !== "string") {
		throw badRequest("Email is required");
	}

	const value = email.trim().toLowerCase();

	if (!value) {
		throw badRequest("Email is required");
	}

	const regex =
		/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/u;

	if (!regex.test(value)) {
		throw badRequest("Invalid email format");
	}

	return value;
}

/**
 * Validate password strength
 * @param {string} password
 * @param {Object} options
 * @param {number} options.min - Minimum length (default: 8)
 * @param {number} options.max - Maximum length (default: 100)
 * @returns {string} Password
 * @throws {ApiError} 400 if password is invalid
 */
function validatePassword(password, { min = 8, max = 100 } = {}) {
	if (typeof password !== "string") {
		throw badRequest("Password is required");
	}

	if (!password) {
		throw badRequest("Password is required");
	}

	if (password.length < min) {
		throw badRequest(`Password must be at least ${min} characters`);
	}

	if (password.length > max) {
		throw badRequest(`Password must not exceed ${max} characters`);
	}

	return password;
}

/**
 * Validate and normalize URL
 * @param {string} url
 * @returns {string} Normalized URL
 * @throws {ApiError} 400 if URL is invalid
 */
function validateUrl(url) {
	if (typeof url !== "string") {
		throw badRequest("URL is required");
	}

	const value = url.trim();

	if (!value) {
		throw badRequest("URL is required");
	}

	let parsed;

	try {
		parsed = new URL(value);
	} catch {
		throw badRequest("Invalid URL format");
	}

	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
		throw badRequest("Invalid URL format");
	}

	return parsed.toString();
}

module.exports = {
	validateEmail,
	validatePassword,
	validateUrl,
};
