/**
 * Generates icon-192.png and icon-512.png without any external dependencies.
 * Pure Node.js built-in modules only.
 * Run: node generate-icons-simple.mjs
 */
import { deflateSync } from 'zlib';
import { writeFileSync } from 'fs';

function crc32(buf) {
  let crc = 0xffffffff;
  for (const b of buf) {
    crc ^= b;
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u32(n) {
  const b = Buffer.alloc(4); b.writeUInt32BE(n); return b;
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const crc = u32(crc32(Buffer.concat([t, data])));
  return Buffer.concat([u32(data.length), t, data, crc]);
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function makePNG(size) {
  const [r, g, b] = hexToRgb('#0d1117');
  const rows = [];
  const s = size / 512;

  const barDefs = [
    { lx: 80,  ly: 320, rw: 64, rh: 112, cr: 0x22, cg: 0xc5, cb: 0x5e, a: 0.7 },
    { lx: 168, ly: 256, rw: 64, rh: 176, cr: 0x22, cg: 0xc5, cb: 0x5e, a: 0.85 },
    { lx: 256, ly: 192, rw: 64, rh: 240, cr: 0x22, cg: 0xc5, cb: 0x5e, a: 1.0 },
    { lx: 344, ly: 128, rw: 64, rh: 304, cr: 0x3b, cg: 0x82, cb: 0xf6, a: 1.0 },
  ];
  const trendPts = [[112,310],[200,246],[288,182],[376,118]];

  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3);
    row[0] = 0; // filter type None
    for (let x = 0; x < size; x++) {
      let pr = r, pg = g, pb = b;

      for (const bar of barDefs) {
        const bx = bar.lx * s, by = bar.ly * s, bw = bar.rw * s, bh = bar.rh * s;
        if (x >= bx && x < bx + bw && y >= by && y < by + bh) {
          pr = Math.round(r + (bar.cr - r) * bar.a);
          pg = Math.round(g + (bar.cg - g) * bar.a);
          pb = Math.round(b + (bar.cb - b) * bar.a);
        }
      }

      for (let i = 0; i < trendPts.length - 1; i++) {
        const x1 = trendPts[i][0] * s,   y1 = trendPts[i][1] * s;
        const x2 = trendPts[i+1][0] * s, y2 = trendPts[i+1][1] * s;
        const dx = x2 - x1, dy = y2 - y1;
        const lenSq = dx*dx + dy*dy;
        const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((x-x1)*dx + (y-y1)*dy) / lenSq));
        const dist = Math.sqrt((x1 + t*dx - x)**2 + (y1 + t*dy - y)**2);
        if (dist < 7 * s) { pr = 0xf5; pg = 0x9e; pb = 0x0b; }
      }

      const dotX = 376 * s, dotY = 118 * s;
      const dd = Math.sqrt((x - dotX)**2 + (y - dotY)**2);
      if (dd < 18 * s) { pr = 0xf5; pg = 0x9e; pb = 0x0b; }
      if (dd < 10 * s) { pr = 0xff; pg = 0xff; pb = 0xff; }

      const off = 1 + x * 3;
      row[off] = pr; row[off+1] = pg; row[off+2] = pb;
    }
    rows.push(row);
  }

  const rawData = Buffer.concat(rows);
  const compressed = deflateSync(rawData);
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.concat([u32(size), u32(size), Buffer.from([8, 2, 0, 0, 0])]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

for (const size of [192, 512]) {
  const png = makePNG(size);
  writeFileSync(`public/icons/icon-${size}.png`, png);
  console.log(`✓ public/icons/icon-${size}.png  (${(png.length / 1024).toFixed(1)} KB)`);
}
console.log('Icons generated!');
