const { badRequest } = require("./errors");

function validateEmail(email) {
	if (typeof email !== "string" || !email.trim()) {
		throw badRequest("Email is required");
	}

	const value = email.trim().toLowerCase();
	const regex =
		/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/u;

	if (!regex.test(value)) {
		throw badRequest("Invalid email format");
	}

	return value;
}

function validatePassword(password, { min = 8, max = 100 } = {}) {
	if (typeof password !== "string" || !password) {
		throw badRequest("Password is required");
	}

	if (password.length < min || password.length > max) {
		throw badRequest(
			password.length < min
				? `Password must be at least ${min} characters`
				: `Password must not exceed ${max} characters`,
		);
	}

	return password;
}

function validateUrl(url) {
	if (typeof url !== "string" || !url.trim()) {
		throw badRequest("URL is required");
	}

	let parsed;
	try {
		parsed = new URL(url.trim());
	} catch {
		throw badRequest("Invalid URL format");
	}

	if (!/^https?:$/.test(parsed.protocol)) {
		throw badRequest("Invalid URL format");
	}

	return parsed.toString();
}

module.exports = {
	validateEmail,
	validatePassword,
	validateUrl,
};
