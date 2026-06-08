/**
 * 处理 TabBar 图标：去除黑色背景、统一为 81x81 透明 PNG
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const TABBAR_DIR = path.join(__dirname, '..', 'static', 'tabbar');
const OUTPUT_SIZE = 81;
const BG_THRESHOLD = 40;

function removeBlackBackground(png) {
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2;
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      if (r <= BG_THRESHOLD && g <= BG_THRESHOLD && b <= BG_THRESHOLD) {
        png.data[idx + 3] = 0;
      }
    }
  }
}

function resizeContain(src, targetSize) {
  const dst = new PNG({ width: targetSize, height: targetSize });
  const scale = Math.min(targetSize / src.width, targetSize / src.height);
  const drawW = Math.round(src.width * scale);
  const drawH = Math.round(src.height * scale);
  const offsetX = Math.floor((targetSize - drawW) / 2);
  const offsetY = Math.floor((targetSize - drawH) / 2);

  for (let y = 0; y < targetSize; y++) {
    for (let x = 0; x < targetSize; x++) {
      const dstIdx = (targetSize * y + x) << 2;
      dst.data[dstIdx] = 0;
      dst.data[dstIdx + 1] = 0;
      dst.data[dstIdx + 2] = 0;
      dst.data[dstIdx + 3] = 0;

      const sx = Math.floor((x - offsetX) / scale);
      const sy = Math.floor((y - offsetY) / scale);
      if (sx < 0 || sy < 0 || sx >= src.width || sy >= src.height) continue;

      const srcIdx = (src.width * sy + sx) << 2;
      dst.data[dstIdx] = src.data[srcIdx];
      dst.data[dstIdx + 1] = src.data[srcIdx + 1];
      dst.data[dstIdx + 2] = src.data[srcIdx + 2];
      dst.data[dstIdx + 3] = src.data[srcIdx + 3];
    }
  }

  return dst;
}

function processIcon(filename) {
  const inputPath = path.join(TABBAR_DIR, filename);
  const buffer = fs.readFileSync(inputPath);
  const src = PNG.sync.read(buffer);
  removeBlackBackground(src);
  const result = resizeContain(src, OUTPUT_SIZE);
  fs.writeFileSync(inputPath, PNG.sync.write(result));
  console.log(`✓ ${filename} -> ${OUTPUT_SIZE}x${OUTPUT_SIZE} 透明底`);
}

function main() {
  const files = fs.readdirSync(TABBAR_DIR).filter((f) => f.endsWith('.png'));
  files.forEach(processIcon);
  console.log(`\n共处理 ${files.length} 个图标`);
}

main();
