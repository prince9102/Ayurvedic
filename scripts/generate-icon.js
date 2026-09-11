const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PROJECT_ROOT = path.join(__dirname, '..');

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type);
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcData = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcData), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const raw = Buffer.allocUnsafe(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter None
    rgbaBuffer.copy(raw, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(raw);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createIcon(size) {
  const buffer = Buffer.allocUnsafe(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxR = size * 0.45;

      // Background: dark green
      const r = 30 + (x / size) * 20;
      const g = 80 + (y / size) * 40;
      const b = 40;
      let a = 255;

      if (dist < maxR) {
        // Leaf shape: vertical ellipse
        const leafW = maxR * 0.35;
        const leafH = maxR * 0.9;
        const nx = dx / leafW;
        const ny = dy / leafH;
        const leafDist = nx * nx + ny * ny;

        if (leafDist < 1) {
          // White leaf
          buffer[idx] = 255;
          buffer[idx + 1] = 255;
          buffer[idx + 2] = 255;
          buffer[idx + 3] = 255;
          continue;
        }

        // Center golden circle
        const goldR = maxR * 0.15;
        if (dist < goldR) {
          buffer[idx] = 255;
          buffer[idx + 1] = 193;
          buffer[idx + 2] = 7;
          buffer[idx + 3] = 255;
          continue;
        }
      }

      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }
  return buffer;
}

function resizeNearest(src, srcSize, dstSize) {
  const dst = Buffer.allocUnsafe(dstSize * dstSize * 4);
  for (let y = 0; y < dstSize; y++) {
    for (let x = 0; x < dstSize; x++) {
      const sx = Math.floor((x / dstSize) * srcSize);
      const sy = Math.floor((y / dstSize) * srcSize);
      const srcIdx = (sy * srcSize + sx) * 4;
      const dstIdx = (y * dstSize + x) * 4;
      dst[dstIdx] = src[srcIdx];
      dst[dstIdx + 1] = src[srcIdx + 1];
      dst[dstIdx + 2] = src[srcIdx + 2];
      dst[dstIdx + 3] = src[srcIdx + 3];
    }
  }
  return dst;
}

const SIZES = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
};

console.log('Generating app icon...');
const icon1024 = createIcon(1024);
const iconPng = encodePNG(1024, 1024, icon1024);
fs.writeFileSync(path.join(PROJECT_ROOT, 'icon.png'), iconPng);
console.log('Saved icon.png (1024x1024)');

for (const [name, size] of Object.entries(SIZES)) {
  const resized = resizeNearest(icon1024, 1024, size);
  const png = encodePNG(size, size, resized);
  const dir = path.join(PROJECT_ROOT, 'android', 'app', 'src', 'main', 'res', `mipmap-${name}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'ic_launcher.png'), png);
  fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), png);
  console.log(`Saved ${name} icons (${size}x${size})`);
}

console.log('Done.');
