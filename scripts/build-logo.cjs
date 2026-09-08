const fs = require('fs');
const path = require('path');

function generateOfficialLogoSvg() {
  const cx = 250;
  const cy = 250;

  // 8 Linked Orange People
  const numOrange = 8;
  const orangeHeadDist = 148;
  const orangeHeadRadius = 15;

  // 4 Blue Figures in center
  const blueHeadDist = 58;
  const blueHeadRadius = 11.5;

  return `<?xml version="1.0" encoding="utf-8"?>
<svg viewBox="0 0 500 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Soft Natural Drop Shadow matching user logo -->
    <filter id="naturalShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#000000" flood-opacity="0.18" />
      <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="#000000" flood-opacity="0.10" />
    </filter>

    <!-- Vibrant Nature Green Gradient for Leaf & Wreath -->
    <linearGradient id="leafGrad" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#00C853" />
      <stop offset="50%" stop-color="#00B050" />
      <stop offset="100%" stop-color="#009A44" />
    </linearGradient>

    <!-- Vibrant Green Gradient for Caring Hand -->
    <linearGradient id="handGrad" x1="100%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#009A44" />
      <stop offset="60%" stop-color="#00B050" />
      <stop offset="100%" stop-color="#00D258" />
    </linearGradient>

    <!-- Warm Orange for 8 Unified People -->
    <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF965B" />
      <stop offset="100%" stop-color="#FF7033" />
    </linearGradient>

    <!-- Royal Blue for Center Leadership 4-Star -->
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3D75EE" />
      <stop offset="100%" stop-color="#255AD6" />
    </linearGradient>
  </defs>

  <!-- Clean Transparent Canvas - Emblem fills the entire frame with natural shadow -->
  <g filter="url(#naturalShadow)">
    
    <!-- ========================================================== -->
    <!-- 1. OUTER GREEN EMBRACE: LEAF + CARING HAND CIRCLE          -->
    <!-- ========================================================== -->
    <!-- Continuous Outer Green Circular Frame -->
    <circle
      cx="${cx}"
      cy="${cy}"
      r="220"
      fill="none"
      stroke="url(#leafGrad)"
      stroke-width="22"
      stroke-linecap="round"
    />

    <!-- A. Top-Left Organic Green Leaf (Bold Swelling Leaf from 8:30 to 1:00) -->
    <path
      d="M 52 230
         C 44 165, 76 96, 140 52
         C 194 14, 282 20, 360 88
         C 294 56, 222 50, 164 76
         C 106 102, 70 155, 64 220
         C 60 250, 68 280, 76 302
         C 64 286, 54 260, 52 230
         Z"
      fill="url(#leafGrad)"
    />

    <!-- Leaf Inner Highlight -->
    <path
      d="M 74 220
         C 88 152, 138 92, 216 66
         C 258 52, 308 60, 360 88
         C 290 74, 220 80, 160 120
         C 116 148, 90 186, 74 220
         Z"
      fill="#43E081"
      opacity="0.30"
    />

    <!-- B. Right Caring Hand with Articulated Cupped Fingers (From 5:00 to 1:30) -->
    <g fill="url(#handGrad)">
      <!-- Main Forearm & Palm Swell -->
      <path
        d="M 405 385
           C 446 338, 466 280, 460 220
           C 454 164, 426 118, 385 82
           C 372 98, 364 118, 363 138
           C 362 152, 367 170, 375 190
           C 384 212, 393 236, 393 264
           C 393 306, 373 346, 342 376
           C 368 384, 390 388, 405 385
           Z"
      />

      <!-- Finger 1 (Index Finger curving gracefully toward top leaf tip) -->
      <path
        d="M 385 82
           C 370 68, 352 60, 342 58
           C 334 56, 332 63, 338 68
           C 352 78, 368 90, 380 106
           C 385 99, 385 90, 385 82
           Z"
      />

      <!-- Finger 2 (Middle Finger) -->
      <path
        d="M 401 108
           C 383 86, 361 70, 348 64
           C 343 61, 340 67, 345 71
           C 361 84, 381 104, 392 128
           C 397 122, 399 115, 401 108
           Z"
      />

      <!-- Finger 3 (Ring Finger) -->
      <path
        d="M 419 140
           C 405 116, 385 96, 367 82
           C 362 78, 359 84, 364 89
           C 380 104, 400 128, 410 158
           C 414 152, 417 146, 419 140
           Z"
      />

      <!-- Caring Thumb supporting from inner curve -->
      <path
        d="M 390 215
           C 380 192, 364 176, 344 170
           C 334 167, 332 174, 339 179
           C 355 188, 369 204, 376 224
           C 383 226, 388 221, 390 215
           Z"
      />
    </g>

    <!-- ========================================================== -->
    <!-- 2. EIGHT LINKED ORANGE PEOPLE (HARMONY & COMMUNITY)        -->
    <!-- ========================================================== -->
    <!-- 8 Orange Heads -->
    ${Array.from({ length: numOrange }).map((_, i) => {
      const deg = i * 45 - 90;
      const rad = (deg * Math.PI) / 180;
      const hx = (cx + orangeHeadDist * Math.cos(rad)).toFixed(2);
      const hy = (cy + orangeHeadDist * Math.sin(rad)).toFixed(2);
      return `<circle cx="${hx}" cy="${hy}" r="${orangeHeadRadius}" fill="url(#orangeGrad)" />`;
    }).join('\n    ')}

    <!-- 8 Interlinked Bodies & Outstretched Hands -->
    <path 
      d="${generateEightPeoplePath(cx, cy)}" 
      fill="url(#orangeGrad)" 
    />

    <!-- ========================================================== -->
    <!-- 3. FOUR SWIRLING BLUE FIGURES (CENTRAL LEADERSHIP CORE)   -->
    <!-- ========================================================== -->
    <!-- 4 Blue Heads at 0°, 90°, 180°, 270° -->
    ${[0, 90, 180, 270].map((deg) => {
      const rad = ((deg - 90) * Math.PI) / 180;
      const hx = (cx + blueHeadDist * Math.cos(rad)).toFixed(2);
      const hy = (cy + blueHeadDist * Math.sin(rad)).toFixed(2);
      return `<circle cx="${hx}" cy="${hy}" r="${blueHeadRadius}" fill="url(#blueGrad)" />`;
    }).join('\n    ')}

    <!-- 4 Swirling Interlocking Arms creating the Pinwheel Symbol -->
    ${[0, 90, 180, 270].map((deg) => {
      return `
    <g transform="rotate(${deg} ${cx} ${cy})">
      <path 
        d="M 238 198 
           C 255 195, 264 202, 262 214 
           C 259 229, 243 239, 230 247 
           C 216 256, 214 270, 228 277 
           C 242 282, 261 275, 272 262
           C 264 275, 243 285, 223 279
           C 204 271, 202 248, 221 234
           C 238 223, 247 212, 245 204
           C 243 198, 234 198, 229 202
           Z" 
        fill="url(#blueGrad)" 
      />
    </g>`;
    }).join('')}

    <!-- Central Interlocking Ring -->
    <circle 
      cx="${cx}" 
      cy="${cy}" 
      r="17" 
      fill="none" 
      stroke="url(#blueGrad)" 
      stroke-width="6" 
    />
  </g>
</svg>`;
}

function generateEightPeoplePath(cx, cy) {
  const n = 8;
  let outerD = '';
  let innerD = '';

  for (let i = 0; i < n; i++) {
    const aPerson = i * 45 - 90;
    const aHand = aPerson + 22.5;
    const aNextPerson = (i + 1) * 45 - 90;

    const radPerson = (aPerson * Math.PI) / 180;
    const radShoulderL = ((aPerson - 11.5) * Math.PI) / 180;
    const radShoulderR = ((aPerson + 11.5) * Math.PI) / 180;
    const radHand = (aHand * Math.PI) / 180;
    const radNextShoulderL = ((aNextPerson - 11.5) * Math.PI) / 180;

    const rNeck = 132;
    const rShoulder = 124;
    const rHandOut = 139;

    const sx = cx + rShoulder * Math.cos(radShoulderR);
    const sy = cy + rShoulder * Math.sin(radShoulderR);

    const hx = cx + rHandOut * Math.cos(radHand);
    const hy = cy + rHandOut * Math.sin(radHand);

    const nextSx = cx + rShoulder * Math.cos(radNextShoulderL);
    const nextSy = cy + rShoulder * Math.sin(radNextShoulderL);

    const nx = cx + rNeck * Math.cos(radPerson);
    const ny = cy + rNeck * Math.sin(radPerson);

    if (i === 0) {
      outerD += `M ${(cx + rShoulder * Math.cos(radShoulderL)).toFixed(2)} ${(cy + rShoulder * Math.sin(radShoulderL)).toFixed(2)} `;
    }

    outerD += `Q ${nx.toFixed(2)} ${ny.toFixed(2)} ${sx.toFixed(2)} ${sy.toFixed(2)} `;
    outerD += `L ${hx.toFixed(2)} ${hy.toFixed(2)} `;
    outerD += `L ${nextSx.toFixed(2)} ${nextSy.toFixed(2)} `;
  }

  for (let i = n - 1; i >= 0; i--) {
    const aPerson = i * 45 - 90;
    const aValley = aPerson - 22.5;

    const radPerson = (aPerson * Math.PI) / 180;
    const radValley = (aValley * Math.PI) / 180;

    const rWaist = 88;
    const rValley = 111;

    const wx = cx + rWaist * Math.cos(radPerson);
    const wy = cy + rWaist * Math.sin(radPerson);

    const vx = cx + rValley * Math.cos(radValley);
    const vy = cy + rValley * Math.sin(radValley);

    innerD += `L ${wx.toFixed(2)} ${wy.toFixed(2)} `;
    innerD += `Q ${(cx + (rWaist + 9) * Math.cos(radPerson - 0.18)).toFixed(2)} ${(cy + (rWaist + 9) * Math.sin(radPerson - 0.18)).toFixed(2)} ${vx.toFixed(2)} ${vy.toFixed(2)} `;
  }

  return outerD + innerD + 'Z';
}

const svg = generateOfficialLogoSvg();

const publicDir = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(publicDir, 'team-golden-star-logo.svg'), svg);
fs.writeFileSync(path.join(publicDir, 'logo.svg'), svg);
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg);

const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.join(distDir, 'team-golden-star-logo.svg'), svg);
  fs.writeFileSync(path.join(distDir, 'logo.svg'), svg);
  fs.writeFileSync(path.join(distDir, 'icon.svg'), svg);
}

console.log('Successfully generated full-bleed official Team Golden Star Logo SVG!');
