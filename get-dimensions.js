import fs from 'fs';
import { PNG } from 'pngjs';

const viewports = ['1440px', '375px'];

for (const vp of viewports) {
  const baselinePath = `screenshots/baseline/${vp}.png`;
  const currentPath = `screenshots/current/${vp}.png`;
  
  if (fs.existsSync(baselinePath)) {
    const baselineImg = PNG.sync.read(fs.readFileSync(baselinePath));
    console.log(`Baseline ${vp}: ${baselineImg.width}x${baselineImg.height}`);
  } else {
    console.log(`Baseline ${vp}: DOES NOT EXIST`);
  }
  
  if (fs.existsSync(currentPath)) {
    const currentImg = PNG.sync.read(fs.readFileSync(currentPath));
    console.log(`Current ${vp}: ${currentImg.width}x${currentImg.height}`);
  } else {
    console.log(`Current ${vp}: DOES NOT EXIST`);
  }
}
