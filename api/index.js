// Vercel serverless function entry point
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const apiRouter = require('./router.cjs');
export default apiRouter;
