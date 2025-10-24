import { json } from '@sveltejs/kit';

// GET /api/health - Health check endpoint
export async function GET() {
  try {
    return json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'brand-audit-api',
      version: '1.0.0'
    });
  } catch (error) {
    return json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
