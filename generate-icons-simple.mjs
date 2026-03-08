/**
 * Generates icon-192.png and icon-512.png without any external dependencies.
 * Pure Node.js built-in modules only.
 * Run: node generate-icons-simple.mjs
 *
 * Design: Crown + bold checkmark — "I CALLED IT" ego energy
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

// Ray-casting point-in-polygon
function pointInPolygon(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

// Distance from point to line segment
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  return Math.sqrt((px - (x1 + t * dx)) ** 2 + (py - (y1 + t * dy)) ** 2);
}

function makePNG(size) {
  const s = size / 512;
  const [bgR, bgG, bgB] = hexToRgb('#0d1117');
  const [goldR, goldG, goldB] = hexToRgb('#f59e0b'); // 245, 158, 11

  // Crown polygon (512-space): 3 points + flat base
  const crownPoly = [
    [256, 52], [296, 108], [346, 70], [322, 148],
    [190, 148], [166, 70], [216, 108]
  ];
  // Crown base bar rect
  const cb = { x: 182, y: 134, w: 148, h: 28 };

  // Checkmark polyline: 80,290 → 205,415 → 432,155
  const ckPts = [[80, 290], [205, 415], [432, 155]];
  const ckHalf = 36;       // half of stroke-width 72
  const ckInnerHalf = 10;  // half of inner white stroke 20 (opacity 0.18)

  // Exclamation dot: cx=434, cy=445, r=20
  const dotCx = 434, dotCy = 445, dotR = 20;

  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3);
    row[0] = 0; // filter None
    for (let x = 0; x < size; x++) {
      // Map pixel to 512-coordinate space
      const sx = x / s;
      const sy = y / s;

      let pr = bgR, pg = bgG, pb = bgB;

      // 1. Crown polygon
      if (pointInPolygon(sx, sy, crownPoly)) {
        pr = goldR; pg = goldG; pb = goldB;
      }

      // 2. Crown base rect
      if (sx >= cb.x && sx < cb.x + cb.w && sy >= cb.y && sy < cb.y + cb.h) {
        pr = goldR; pg = goldG; pb = goldB;
      }

      // 3. Bold checkmark (stroke)
      let minDist = Infinity;
      for (let i = 0; i < ckPts.length - 1; i++) {
        const d = distToSegment(sx, sy, ckPts[i][0], ckPts[i][1], ckPts[i + 1][0], ckPts[i + 1][1]);
        if (d < minDist) minDist = d;
      }
      if (minDist < ckHalf) {
        pr = goldR; pg = goldG; pb = goldB;
        // Inner white highlight (opacity 0.18 over gold)
        if (minDist < ckInnerHalf) {
          pr = Math.round(goldR + (255 - goldR) * 0.18);
          pg = Math.round(goldG + (255 - goldG) * 0.18);
          pb = Math.round(goldB + (255 - goldB) * 0.18);
        }
      }

      // 4. Exclamation dot (bottom-right)
      const dd = Math.sqrt((sx - dotCx) ** 2 + (sy - dotCy) ** 2);
      if (dd < dotR) {
        pr = goldR; pg = goldG; pb = goldB;
      }

      const off = 1 + x * 3;
      row[off] = pr; row[off + 1] = pg; row[off + 2] = pb;
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
