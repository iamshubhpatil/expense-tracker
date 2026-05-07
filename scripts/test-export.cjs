/**
 * Test script to verify the export endpoint works with a valid Supabase JWT
 * 
 * Usage:
 *   node scripts/test-export.cjs <userId>
 * 
 * This script:
 * 1. Generates a valid Supabase JWT token using your service role key
 * 2. Tests the export endpoint directly
 * 3. Helps debug authentication issues
 */

require('dotenv').config();
const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_URL = process.env.API_URL || 'http://localhost:3002';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Function to generate a test JWT token
function generateTestJWT(userId, expiresIn = 3600) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userId,
    aud: 'authenticated',
    iss: SUPABASE_URL,
    iat: now,
    exp: now + expiresIn,
    email: `test-${userId}@example.com`,
    email_confirmed_at: new Date().toISOString(),
    phone_confirmed_at: null,
    user_metadata: {},
    identities: [],
    role: 'authenticated',
  };

  const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SUPABASE_SERVICE_ROLE_KEY)
    .update(`${header}.${payloadEncoded}`)
    .digest('base64url');

  return `${header}.${payloadEncoded}.${signature}`;
}

// Main test function
async function testExport() {
  const userId = process.argv[2];
  if (!userId) {
    console.error('❌ Usage: node scripts/test-export.cjs <userId>');
    console.error('   Example: node scripts/test-export.cjs a4a8b75d-8f4b-4ffb-bbe3-a8ba05051dd9');
    process.exit(1);
  }

  console.log('🔧 Testing export endpoint...\n');
  console.log(`📋 Configuration:`);
  console.log(`   SUPABASE_URL: ${SUPABASE_URL}`);
  console.log(`   API_URL: ${API_URL}`);
  console.log(`   userId: ${userId}\n`);

  try {
    // Generate a valid JWT
    const token = generateTestJWT(userId);
    console.log(`✅ Generated JWT token:\n${token}\n`);

    // Test the export endpoint
    const exportUrl = `${API_URL}/api/reports/export/csv?startDate=2024-01-01&endDate=2024-12-31&type=all`;
    console.log(`📡 Testing GET ${exportUrl}\n`);

    const response = await fetch(exportUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/csv',
      },
    });

    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📄 Content-Type: ${response.headers.get('Content-Type')}\n`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`❌ Error: ${errorBody}\n`);
      return;
    }

    const csvContent = await response.text();
    console.log(`✅ Export successful!\n`);
    console.log(`📋 CSV Content (first 500 chars):\n${csvContent.substring(0, 500)}\n`);

    // Save to file
    const fs = require('fs');
    const filename = `export_test_${new Date().toISOString().split('T')[0]}.csv`;
    fs.writeFileSync(filename, csvContent);
    console.log(`💾 Full CSV saved to: ${filename}\n`);

  } catch (error) {
    console.error(`❌ Test failed:`, error.message);
    console.error(`\nDebug info:`);
    console.error(`- Check that API server is running on ${API_URL}`);
    console.error(`- Verify userId exists in database: ${userId}`);
    console.error(`- Check that user has expenses/income records to export\n`);
  }
}

testExport();
