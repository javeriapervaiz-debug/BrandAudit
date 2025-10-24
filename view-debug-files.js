/**
 * Simple script to view debug text files
 * Run with: node view-debug-files.js
 */
const fs = require('fs');
const path = require('path');

const debugDir = path.join(__dirname, 'debug-text-files');

console.log('🔍 Debug Text Files Viewer');
console.log('==========================');

if (!fs.existsSync(debugDir)) {
  console.log('❌ Debug directory does not exist:', debugDir);
  console.log('💡 Upload a PDF first to create debug files');
  process.exit(1);
}

const files = fs.readdirSync(debugDir).filter(file => file.endsWith('.txt'));

if (files.length === 0) {
  console.log('📁 No debug files found in:', debugDir);
  console.log('💡 Upload a PDF first to create debug files');
  process.exit(1);
}

console.log(`📁 Found ${files.length} debug file(s):`);
console.log('');

files.forEach((file, index) => {
  const filePath = path.join(debugDir, file);
  const stats = fs.statSync(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log(`${index + 1}. ${file}`);
  console.log(`   Size: ${stats.size} bytes`);
  console.log(`   Created: ${stats.birthtime.toLocaleString()}`);
  console.log(`   Text Length: ${content.length} characters`);
  console.log(`   First 200 chars: ${content.substring(0, 200).replace(/\n/g, ' ')}...`);
  console.log('');
});

// Show the most recent file in detail
const mostRecentFile = files
  .map(file => ({
    name: file,
    path: path.join(debugDir, file),
    stats: fs.statSync(path.join(debugDir, file))
  }))
  .sort((a, b) => b.stats.birthtime - a.stats.birthtime)[0];

console.log('📄 Most Recent File Details:');
console.log('============================');
console.log(`File: ${mostRecentFile.name}`);
console.log(`Size: ${mostRecentFile.stats.size} bytes`);
console.log(`Created: ${mostRecentFile.stats.birthtime.toLocaleString()}`);
console.log('');

const content = fs.readFileSync(mostRecentFile.path, 'utf8');
console.log('📝 Full Content:');
console.log('================');
console.log(content);
console.log('');
console.log('✅ End of file');
