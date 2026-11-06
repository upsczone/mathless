import fs from 'node:fs';
import path from 'node:path';

const iconPath = path.resolve('android-assets/mathless-playstore-icon.png');
const appRoot = path.resolve('android/app');
const resRoot = path.join(appRoot, 'src/main/res');

if (!fs.existsSync(iconPath)) {
  throw new Error(`Expected original MathsLess Play Store icon: ${iconPath}`);
}
if (!fs.existsSync(resRoot)) {
  throw new Error(`Expected generated Android resources: ${resRoot}`);
}

const iconBytes = fs.readFileSync(iconPath);
if (iconBytes.length < 8 || iconBytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
  throw new Error('The original MathsLess Play Store icon is not a valid PNG.');
}

const writtenIcons = [];
for (const entry of fs.readdirSync(resRoot, { withFileTypes: true })) {
  if (!entry.isDirectory() || !/^mipmap-(mdpi|hdpi|xhdpi|xxhdpi|xxxhdpi)$/i.test(entry.name)) continue;
  const mipmapDir = path.join(resRoot, entry.name);
  for (const name of ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png']) {
    fs.writeFileSync(path.join(mipmapDir, name), iconBytes);
    writtenIcons.push(path.join(mipmapDir, name));
  }
}

// Android adaptive icons mask and layer foreground/background separately. The
// store asset is a complete square icon, so keep Android on the identical
// raster asset instead of wrapping it in an adaptive-icon definition.
const adaptiveDir = path.join(resRoot, 'mipmap-anydpi-v26');
for (const name of ['ic_launcher.xml', 'ic_launcher_round.xml']) {
  fs.rmSync(path.join(adaptiveDir, name), { force: true });
}

if (writtenIcons.length < 3) {
  throw new Error('No density-specific Android launcher icons were written.');
}

console.log(`Applied the original MathsLess Play Store icon to ${writtenIcons.length} raster launcher resources and removed adaptive masks.`);
