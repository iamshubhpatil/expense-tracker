require('dotenv').config();
const http = require('http');
const apiRouter = require('../api/router.cjs');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

function createDevJwt(userId) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: userId,
    email: 'test@example.com',
    role: 'authenticated',
    email_confirmed_at: new Date().toISOString(),
    user_metadata: {},
  })).toString('base64url');
  const signature = Buffer.from('dev-signature').toString('base64url');
  return `${header}.${payload}.${signature}`;
}

const testUserId = process.argv[2] || process.env.TEST_USER_ID;
if (!testUserId) {
  console.error('❌ Usage: node scripts/test-api.cjs <userId>');
  console.error('   Example: node scripts/test-api.cjs a4a8b75d-8f4b-4ffb-bbe3-a8ba05051dd9');
  process.exit(1);
}

const authToken = process.env.TEST_API_TOKEN || createDevJwt(testUserId);

// Create a test server
const server = http.createServer(async (req, res) => {
  // Add mock user for testing
  req.user = {
    id: testUserId,
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
  console.log(`Testing endpoint: ${testUrl}`);
  
  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/reports/overview',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
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
