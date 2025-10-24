/**
 * Debug script to check environment variable loading
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Debugging environment variables...');

// Check if we're in Node.js environment
console.log('Node.js environment:', typeof process !== 'undefined');

// Check process.env
if (typeof process !== 'undefined') {
  console.log('process.env exists:', !!process.env);
  console.log('GOOGLE_AI_API_KEY exists:', !!process.env.GOOGLE_AI_API_KEY);
  console.log('GOOGLE_AI_API_KEY length:', process.env.GOOGLE_AI_API_KEY?.length || 0);
  console.log('GOOGLE_AI_API_KEY starts with:', process.env.GOOGLE_AI_API_KEY?.substring(0, 10) || 'undefined');
  
  // Check all environment variables that contain 'GOOGLE' or 'AI'
  const googleVars = Object.keys(process.env).filter(key => 
    key.toLowerCase().includes('google') || 
    key.toLowerCase().includes('ai') ||
    key.toLowerCase().includes('gemini')
  );
  console.log('Google/AI related env vars:', googleVars);
}

// Check import.meta.env (for Vite)
if (typeof import.meta !== 'undefined') {
  console.log('import.meta.env exists:', !!import.meta.env);
  console.log('VITE_GOOGLE_AI_API_KEY exists:', !!import.meta.env.VITE_GOOGLE_AI_API_KEY);
  console.log('VITE_GOOGLE_AI_API_KEY length:', import.meta.env.VITE_GOOGLE_AI_API_KEY?.length || 0);
}

// Test the actual function
try {
  const { getGoogleAIAPIKey } = await import('./src/lib/config/llmConfig.js');
  const apiKey = getGoogleAIAPIKey();
  console.log('getGoogleAIAPIKey() result:', apiKey ? 'Found' : 'Not found');
  console.log('API key length:', apiKey?.length || 0);
} catch (error) {
  console.error('Error importing getGoogleAIAPIKey:', error.message);
}
