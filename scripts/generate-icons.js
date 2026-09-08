import fs from 'fs';
import zlib from 'zlib';

function createSolidPng(width, height, r, g, b, a = 255) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with filter byte 0 per scanline
  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0; // None filter
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      // create a subtle golden star gradient or border pattern
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const isRing = Math.abs(dist - width * 0.4) < 4;
      const isCenter = dist < width * 0.28;

      if (isCenter) {
        raw[pxOffset] = 245;     // R (Amber gold)
        raw[pxOffset + 1] = 158; // G
        raw[pxOffset + 2] = 11;  // B
        raw[pxOffset + 3] = 255;
      } else if (isRing) {
        raw[pxOffset] = 217;     // R
        raw[pxOffset + 1] = 119; // G
        raw[pxOffset + 2] = 6;   // B
        raw[pxOffset + 3] = 255;
      } else {
        raw[pxOffset] = 10;      // Neutral 950 dark background
        raw[pxOffset + 1] = 10;
        raw[pxOffset + 2] = 10;
        raw[pxOffset + 3] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(raw);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(toCrc);
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// Standard CRC-32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

const p192 = createSolidPng(192, 192, 245, 158, 11);
const p512 = createSolidPng(512, 512, 245, 158, 11);

fs.writeFileSync('public/pwa-192x192.png', p192);
fs.writeFileSync('public/pwa-512x512.png', p512);
fs.writeFileSync('public/pwa-maskable-512x512.png', p512);
fs.writeFileSync('public/apple-touch-icon.png', p192);
fs.writeFileSync('public/favicon.ico', p192);
console.log('Successfully generated PWA icon files.');
