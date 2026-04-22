
import { chromium } from 'playwright';
import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const VIEWPORTS = [
  { width: 1440, height: 1080, name: '1440px' },
  { width: 375, height: 812, name: '375px' }
];

const BASE_URL = 'https://eleoro.com';
const CURRENT_URL = 'http://localhost:4321';

async function captureScreenshot(url, viewport, outputPath) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height }
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  // Wait for animations and fonts
  await page.waitForTimeout(10000);
  await page.screenshot({ path: outputPath, fullPage: true });
  await browser.close();
}

async function compareScreenshots(baselinePath, currentPath, diffPath) {
  const img1 = PNG.sync.read(fs.readFileSync(baselinePath));
  const img2 = PNG.sync.read(fs.readFileSync(currentPath));
  
  const width = Math.max(img1.width, img2.width);
  const height = Math.max(img1.height, img2.height);
  
  const img1Resized = new PNG({ width, height });
  const img2Resized = new PNG({ width, height });
  
  // Fill with white or transparent (0,0,0,0) - let's use white for comparison consistency
  for (let i = 0; i < width * height * 4; i += 4) {
    img1Resized.data[i] = 255;
    img1Resized.data[i+1] = 255;
    img1Resized.data[i+2] = 255;
    img1Resized.data[i+3] = 255;
    
    img2Resized.data[i] = 255;
    img2Resized.data[i+1] = 255;
    img2Resized.data[i+2] = 255;
    img2Resized.data[i+3] = 255;
  }

  // Copy img1 to img1Resized
  for (let y = 0; y < img1.height; y++) {
    for (let x = 0; x < img1.width; x++) {
      const idx = (width * y + x) << 2;
      const oldIdx = (img1.width * y + x) << 2;
      img1Resized.data[idx] = img1.data[oldIdx];
      img1Resized.data[idx+1] = img1.data[oldIdx+1];
      img1Resized.data[idx+2] = img1.data[oldIdx+2];
      img1Resized.data[idx+3] = img1.data[oldIdx+3];
    }
  }

  // Copy img2 to img2Resized
  for (let y = 0; y < img2.height; y++) {
    for (let x = 0; x < img2.width; x++) {
      const idx = (width * y + x) << 2;
      const oldIdx = (img2.width * y + x) << 2;
      img2Resized.data[idx] = img2.data[oldIdx];
      img2Resized.data[idx+1] = img2.data[oldIdx+1];
      img2Resized.data[idx+2] = img2.data[oldIdx+2];
      img2Resized.data[idx+3] = img2.data[oldIdx+3];
    }
  }

  const diff = new PNG({ width, height });
  const numDiffPixels = pixelmatch(img1Resized.data, img2Resized.data, diff.data, width, height, { threshold: 0.1 });
  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  const totalPixels = width * height;
  const diffPercentage = (numDiffPixels / totalPixels) * 100;
  return diffPercentage;
}

async function main() {
  let allPassed = true;
  const report = [];

  for (const vp of VIEWPORTS) {
    const baselinePath = `screenshots/baseline/${vp.name}.png`;
    const currentPath = `screenshots/current/${vp.name}.png`;
    const diffPath = `screenshots/diffs/${vp.name}.png`;

    if (!fs.existsSync(baselinePath)) {
      console.log(`Capturing baseline for ${vp.name}...`);
      await captureScreenshot(BASE_URL, vp, baselinePath);
    }

    console.log(`Capturing current for ${vp.name}...`);
    await captureScreenshot(CURRENT_URL, vp, currentPath);

    console.log(`Comparing ${vp.name}...`);
    const diffPercentage = await compareScreenshots(baselinePath, currentPath, diffPath);
    
    const passed = diffPercentage <= 0.1;
    if (!passed) allPassed = false;

    report.push({
      viewport: vp.name,
      status: passed ? 'PASS' : 'FAIL',
      diff: diffPercentage.toFixed(3)
    });
  }

  console.log('\n--- Visual Diff Report ---');
  report.forEach(r => {
    console.log(`${r.viewport} viewport: ${r.status} (${r.diff}% difference)`);
  });

  if (allPassed) {
    console.log('\nDIFF_PASSED');
  } else {
    console.log('\nDIFF_FAILED');
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
