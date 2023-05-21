class AppError extends Error {
	constructor(message = 'something broke!', status = 500) {
		super(message, status);
		this.message = message;
		this.status = status;
	}
}

module.exports = AppError;
