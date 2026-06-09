class ApiError extends Error {
	constructor(message, status = 500, errors = []) {
		super(message);

		this.status = status;
		this.errors = errors;

		Error.captureStackTrace(this, this.constructor);
	}
}

function badRequest(message, errors = []) {
	return new ApiError(message, 400, errors);
}

function unauthorized(message = "Unauthorized") {
	return new ApiError(message, 401);
}

function forbidden(message = "Forbidden") {
	return new ApiError(message, 403);
}
function notFound(message = "Not found") {
	return new ApiError(message, 404);
}

function conflict(message = "Conflict") {
	return new ApiError(message, 409);
}

function tooManyRequests(message = "Too many requests") {
	return new ApiError(message, 429);
}

module.exports = {
	ApiError,
	badRequest,
	unauthorized,
	forbidden,
	notFound,
	conflict,
	tooManyRequests,
};
