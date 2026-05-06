function sendJson(res, data, statusCode = 200) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sendError(res, message, statusCode = 500) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: false,
    message,
  }));
}

function sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    message,
    ...(data && { data }),
  }));
}

module.exports = {
  sendJson,
  sendError,
  sendSuccess,
};
