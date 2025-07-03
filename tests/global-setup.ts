import { chromium, FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🔧 Building Chrome extension...');
  
  // Build the extension
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Extension built successfully');
  } catch (error) {
    console.error('❌ Failed to build extension:', error);
    process.exit(1);
  }

  // Verify dist folder exists
  const distPath = path.resolve(__dirname, '..', 'dist');
  const manifestPath = path.resolve(distPath, 'manifest.json');
  
  try {
    require('fs').accessSync(manifestPath);
    console.log('✅ Extension manifest found at:', manifestPath);
  } catch (error) {
    console.error('❌ Extension manifest not found. Build may have failed.');
    process.exit(1);
  }

  console.log('🚀 Ready to run tests!');
}

export default globalSetup; 