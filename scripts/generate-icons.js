const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Generate premium PK Marketing OS SVG Icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient: Obsidian Slate -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141519" />
      <stop offset="50%" stop-color="#0F1014" />
      <stop offset="100%" stop-color="#08090B" />
    </linearGradient>

    <!-- Luxury Champagne Gold Gradient for PK Monogram -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF3D6" />
      <stop offset="25%" stop-color="#F2D184" />
      <stop offset="55%" stop-color="#D4AA55" />
      <stop offset="85%" stop-color="#AA7E2F" />
      <stop offset="100%" stop-color="#7C5516" />
    </linearGradient>

    <!-- Accent Gold for Border & Sparkle -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F2D184" stop-opacity="0.6" />
      <stop offset="50%" stop-color="#AA7E2F" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#D4AA55" stop-opacity="0.5" />
    </linearGradient>

    <!-- Subtle Radial Glow in Center -->
    <radialGradient id="centerGlow" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#D4AA55" stop-opacity="0.18" />
      <stop offset="70%" stop-color="#D4AA55" stop-opacity="0.03" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.65" />
    </filter>

    <filter id="sparkleGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- iOS-style Squircle Rounded Background -->
  <rect x="8" y="8" width="496" height="496" rx="112" ry="112" fill="url(#bgGrad)" />
  <rect x="8" y="8" width="496" height="496" rx="112" ry="112" fill="url(#centerGlow)" />
  <rect x="8" y="8" width="496" height="496" rx="112" ry="112" fill="none" stroke="url(#borderGrad)" stroke-width="4" />

  <!-- PK Monogram & AI Star Element -->
  <g filter="url(#glow)">
    <!-- Letter P -->
    <path d="M 125 155 L 210 155 C 248 155 272 176 272 210 C 272 245 248 266 210 266 L 176 266 L 176 355 L 125 355 Z M 176 222 L 206 222 C 223 222 233 216 233 210 C 233 204 223 199 206 199 L 176 199 Z" fill="url(#goldGrad)" />
    
    <!-- Letter K -->
    <path d="M 288 155 L 339 155 L 339 235 L 398 155 L 458 155 L 382 250 L 465 355 L 402 355 L 339 270 L 339 355 L 288 355 Z" fill="url(#goldGrad)" />
  </g>

  <!-- AI Sparkle Core (Top-Right Accent) -->
  <g filter="url(#sparkleGlow)" transform="translate(425, 120)">
    <path d="M 0 -24 Q 0 0 24 0 Q 0 0 0 24 Q 0 0 -24 0 Q 0 0 0 -24 Z" fill="#FFF6DC" />
    <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
  </g>

  <!-- High-Tech Micro Pill: AI OS -->
  <g transform="translate(256, 395)">
    <rect x="-82" y="-14" width="164" height="28" rx="14" fill="#1C1E24" stroke="url(#borderGrad)" stroke-width="1.5" />
    <text x="0" y="5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" fill="#E5C388" letter-spacing="4" text-anchor="middle">MARKETING OS</text>
  </g>
</svg>`;

async function generate() {
  const publicDir = path.join(__dirname, '..', 'public');
  const appDir = path.join(__dirname, '..', 'src', 'app');

  // Save SVG
  const svgPath = path.join(publicDir, 'favicon.svg');
  fs.writeFileSync(svgPath, svgIcon);
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svgIcon);
  console.log('Saved SVG icon to public/favicon.svg and src/app/icon.svg');

  const svgBuffer = Buffer.from(svgIcon);

  // Generate PNG sizes
  // 1. 32x32 for standard favicon
  await sharp(svgBuffer).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));
  // 2. 16x16 for small favicon
  await sharp(svgBuffer).resize(16, 16).png().toFile(path.join(publicDir, 'favicon-16x16.png'));
  // 3. 180x180 for Apple Touch Icon (iPhone & iPad home screen)
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  // 4. 192x192 for Android / PWA
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  // 5. 512x512 for PWA Splash / Retina
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  // 6. Also copy to src/app/icon.png and apple-icon.png
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(appDir, 'icon.png'));
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(appDir, 'apple-icon.png'));

  console.log('Successfully generated all PNG icons!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
