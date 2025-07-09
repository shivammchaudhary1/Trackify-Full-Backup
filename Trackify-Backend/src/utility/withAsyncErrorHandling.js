const logger = require("../config/lib/logger");

function withAsyncErrorHandling(handler) {
  async function wrapped(req, res, ...rest) {
    try {
      // As a bonus, this catches both synchronous and asynchronous errors, as
      // it is a no-op to `await` a non-awaitable value.
      await handler(req, res, ...rest);
    } catch (error) {
      logger.error(error);
      console.log("error : ", error);
      res.json({
        message: "Unexpected error occurred. Please try again later.",
        statusCode: 500,
      });
    }
  }
  return wrapped;
}

module.exports = { withAsyncErrorHandling };
