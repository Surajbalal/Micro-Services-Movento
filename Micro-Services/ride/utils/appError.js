class AppError extends Error {
    constructor(message, code, status = 500) {
    super(message);
    this.code = code;
    this.status = status;

    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;