const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// This script processes the Projectmaven logo into different sizes for the Chrome extension
console.log('Processing Projectmaven logo for Chrome extension...');

const logoPath = 'assets/logo/projectmaven-logo.png';
const publicIconsDir = 'public/icons';

// Ensure directories exist
if (!fs.existsSync('assets/logo')) {
  fs.mkdirSync('assets/logo', { recursive: true });
}

if (!fs.existsSync(publicIconsDir)) {
  fs.mkdirSync(publicIconsDir, { recursive: true });
}

// Check if source logo exists
if (!fs.existsSync(logoPath)) {
  console.log('\n📋 INSTRUCTIONS:');
  console.log('1. Save the uploaded Projectmaven logo as: assets/logo/projectmaven-logo.png');
  console.log('2. Then run this script again with: node scripts/process-logo.js');
  console.log('\nThe logo should be at least 128x128 pixels for best quality.');
  process.exit(0);
}

// Resize logo to different sizes using macOS sips
const sizes = [16, 48, 128];

console.log('Creating different sized icons...');

sizes.forEach(size => {
  const outputPath = path.join(publicIconsDir, `icon-${size}.png`);
  try {
    execSync(`sips -z ${size} ${size} "${logoPath}" --out "${outputPath}"`, { stdio: 'pipe' });
    console.log(`✅ Created ${size}x${size} icon: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Failed to create ${size}x${size} icon:`, error.message);
  }
});

// Also create a logo for the popup (64x64)
const popupLogoPath = 'src/assets/logo-64.png';
if (!fs.existsSync('src/assets')) {
  fs.mkdirSync('src/assets', { recursive: true });
}

try {
  execSync(`sips -z 64 64 "${logoPath}" --out "${popupLogoPath}"`, { stdio: 'pipe' });
  console.log(`✅ Created popup logo: ${popupLogoPath}`);
} catch (error) {
  console.error(`❌ Failed to create popup logo:`, error.message);
}

console.log('\n🎨 Logo processing complete!');
console.log('Next steps:');
console.log('1. Update popup.html to include the logo');
console.log('2. Build the extension: npm run build');
console.log('3. Load the updated extension in Chrome'); 