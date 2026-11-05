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

for (const entry of fs.readdirSync(resRoot, { withFileTypes: true })) {
  if (!entry.isDirectory() || !/^mipmap-(mdpi|hdpi|xhdpi|xxhdpi|xxxhdpi)$/i.test(entry.name)) continue;
  const mipmapDir = path.join(resRoot, entry.name);
  for (const name of ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png']) {
    fs.writeFileSync(path.join(mipmapDir, name), iconBytes);
  }
}
const adaptiveDir = path.join(resRoot, 'mipmap-anydpi-v26');
fs.mkdirSync(adaptiveDir, { recursive: true });
const adaptiveIcon = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher" />
    <foreground android:drawable="@mipmap/ic_launcher" />
</adaptive-icon>
`;
fs.writeFileSync(path.join(adaptiveDir, 'ic_launcher.xml'), adaptiveIcon);
fs.writeFileSync(path.join(adaptiveDir, 'ic_launcher_round.xml'), adaptiveIcon);

console.log('Applied the original MathsLess Play Store icon to all Android launcher resources.');
