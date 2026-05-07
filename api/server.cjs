const http = require('http');
const dotenv = require('dotenv');
const apiRouter = require('./router.cjs');

dotenv.config();

// Ensure development mode for local testing
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

const port = process.env.PORT || 3002;

const server = http.createServer(async (req, res) => {
  try {
    await apiRouter(req, res);
  } catch (error) {
    console.error('Local API server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Internal server error' }));
  }
});

server.listen(port, () => {
  console.log(`Local serverless API running on http://localhost:${port}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
});
