class ApiError {
  constructor(
    statusCode = 400,
    message = "default",
    data = null,
    error = null,
    redirectUrl = null
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.error = error ? error : null;
  }
}

module.exports = ApiError;
