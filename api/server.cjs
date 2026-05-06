const http = require('http');
const dotenv = require('dotenv');
const apiRouter = require('./router.cjs');

dotenv.config();

const port = process.env.PORT || 3000;

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
});
