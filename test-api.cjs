const http = require('http');
const https = require('https');
const apiRouter = require('./api/router.cjs');

// Create a test server
const server = http.createServer(async (req, res) => {
  // Add mock user for testing
  req.user = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'user',
    email_verified: true,
    is_active: true
  };
  
  await apiRouter(req, res);
});

server.listen(4000, async () => {
  console.log('Test server running on port 4000');
  
  // Test the endpoint
  const testUrl = 'http://localhost:4000/api/reports/overview';
  
  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/reports/overview',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer test-token'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
      server.close();
      process.exit(0);
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error);
    server.close();
    process.exit(1);
  });

  req.end();
});
