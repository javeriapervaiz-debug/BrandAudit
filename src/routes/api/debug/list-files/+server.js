import { json } from '@sveltejs/kit';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  try {
    const debugDir = join(process.cwd(), 'debug-text-files');
    
    try {
      const files = await readdir(debugDir);
      const fileStats = await Promise.all(
        files.map(async (file) => {
          const filePath = join(debugDir, file);
          const stats = await stat(filePath);
          return {
            name: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        })
      );

      // Sort by creation time (newest first)
      fileStats.sort((a, b) => new Date(b.created) - new Date(a.created));

      return json({
        success: true,
        files: fileStats,
        directory: debugDir
      });

    } catch (error) {
      // Directory doesn't exist yet
      return json({
        success: true,
        files: [],
        directory: debugDir,
        message: 'Debug directory not created yet'
      });
    }

  } catch (error) {
    console.error('❌ Debug list error:', error);
    return json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

