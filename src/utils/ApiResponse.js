class ApiResponse {
  /**
   * The ApiResponse class is a utility class which is used to create
   * a formatted JSON response for the API.
   * @param {number} statusCode - The HTTP status code
   * @param {string} message - The message to be sent with the response
   * @param {Object} data - Any additional data to be sent with the response
   */
  constructor(statusCode = 200, message = "default", data = null) {
    /**
     * The HTTP status code
     * @type {number}
     */
    this.statusCode = statusCode;
    /**
     * The message to be sent with the response
     * @type {string}
     */
    this.message = message;
    /**
     * Any additional data to be sent with the response
     * @type {Object}
     */
    this.data = data;
  }
}

module.exports = ApiResponse;
