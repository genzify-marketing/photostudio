function errorHandler(error, req, res, next) {
  console.error(error);
  if (res.headersSent) return next(error);
  const status = error.status || 500;
  res.status(status).json({ error: status === 500 ? 'Something went wrong on the server.' : error.message });
}

module.exports = errorHandler;
