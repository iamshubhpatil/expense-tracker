const { verifySupabaseAccessToken, ensureLocalUser } = require('./supabaseAuth.cjs');
const jwt = require('jsonwebtoken');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    console.log('[authenticate] Authorization header:', authHeader ? 'present' : 'missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[authenticate] Invalid auth header format');
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Missing or invalid authorization header',
      }));
      return;
    }

    const token = authHeader.substring(7);
    console.log('[authenticate] Verifying token...');

    let supabaseUser = null;

    // In development mode, allow local JWT tokens without Supabase verification
    if (process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true') {
      try {
        const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const decoded = jwt.decode(token, { complete: true });
        
        if (decoded && decoded.payload && decoded.payload.sub) {
          console.log('[authenticate] Development mode: accepting local JWT');
          supabaseUser = { id: decoded.payload.sub, email: decoded.payload.email };
        }
      } catch (e) {
        console.log('[authenticate] Not a local JWT, trying Supabase verification...');
      }
    }

    // If not a local token or not in dev mode, verify against Supabase
    if (!supabaseUser) {
      supabaseUser = await verifySupabaseAccessToken(token);
    }

    console.log('[authenticate] Supabase user:', supabaseUser ? 'verified' : 'failed');

    if (!supabaseUser) {
      console.log('[authenticate] Supabase token validation failed');
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Invalid or expired Supabase token',
      }));
      return;
    }

    console.log('[authenticate] Ensuring local user...');
    const localUser = await ensureLocalUser(supabaseUser);
    console.log('[authenticate] Local user:', localUser ? 'created/found' : 'failed');
    
    if (!localUser) {
      console.log('[authenticate] Local user creation failed');
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'User not found',
      }));
      return;
    }

    req.user = localUser;
    console.log('[authenticate] User authenticated:', req.user.id);
    await next();
  } catch (error) {
    console.error('[authenticate] Authentication error:', error.message);
    console.error('[authenticate] Stack:', error.stack);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: 'Authentication error',
      error: error.message,
    }));
  }
}

module.exports = {
  authenticate,
};

