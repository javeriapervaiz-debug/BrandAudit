import { json } from '@sveltejs/kit';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const { text, filename, companyName } = await request.json();

    if (!text || !filename) {
      return json({
        success: false,
        error: 'Text content and filename are required'
      }, { status: 400 });
    }

    // Create debug directory if it doesn't exist
    const debugDir = join(process.cwd(), 'debug-text-files');
    try {
      await mkdir(debugDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Save the text file
    const filePath = join(debugDir, filename);
    await writeFile(filePath, text, 'utf8');

    console.log('✅ Debug text file saved:', filePath);
    console.log('📝 Text length:', text.length);
    console.log('🏢 Company:', companyName);

    return json({
      success: true,
      filePath: filePath,
      filename: filename,
      textLength: text.length,
      companyName: companyName
    });

  } catch (error) {
    console.error('❌ Debug save error:', error);
    return json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}