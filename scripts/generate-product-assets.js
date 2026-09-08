import fs from 'fs';
import path from 'path';

const products = [
  {
    sku: '12760',
    name: 'Tender Care',
    category: 'Swedish Miracle Balm',
    theme: ['#0f3e2e', '#1c5e46'],
    accent: '#f59e0b',
    details: '100% Organic Beeswax & Vitamin E • 15ml',
    shape: `
      <!-- Hexagonal / Oval Heritage Egg Pot -->
      <ellipse cx="250" cy="280" rx="90" ry="110" fill="url(#jarGrad)" stroke="#d97706" stroke-width="4" filter="url(#dropGlow)" />
      <!-- Golden Oriflame Crown Crest -->
      <circle cx="250" cy="240" r="28" fill="#d97706" opacity="0.9" />
      <path d="M 238 245 L 245 232 L 250 242 L 255 232 L 262 245 Z" fill="#ffffff" />
      <ellipse cx="250" cy="200" rx="80" ry="24" fill="#fef3c7" stroke="#b45309" stroke-width="3" />
      <!-- Tender Care Script -->
      <text x="250" y="310" text-anchor="middle" font-family="serif" font-size="16" font-weight="bold" fill="#fef3c7" letter-spacing="2">TENDER CARE</text>
      <text x="250" y="328" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#cbd5e1" letter-spacing="1">PROTECTING BALM</text>
    `
  },
  {
    sku: '38531',
    name: 'Giordani Gold Essenza',
    category: 'Haute Parfum',
    theme: ['#2e1f08', '#543b14'],
    accent: '#fbbf24',
    details: '24K Real Gold Leaf Cap • 50ml Parfum',
    shape: `
      <!-- Heavy Crystalline Perfume Bottle -->
      <rect x="175" y="190" width="150" height="180" rx="20" fill="url(#jarGrad)" stroke="#fbbf24" stroke-width="3" filter="url(#dropGlow)" />
      <rect x="185" y="200" width="130" height="160" rx="14" fill="#fef08a" opacity="0.15" />
      <!-- 24K Hammered Gold Cap -->
      <rect x="205" y="130" width="90" height="60" rx="8" fill="url(#goldCapGrad)" stroke="#f59e0b" stroke-width="3" />
      <rect x="235" y="120" width="30" height="12" rx="3" fill="#d97706" />
      <!-- Giordani Gold Monogram -->
      <circle cx="250" cy="270" r="32" fill="none" stroke="#fbbf24" stroke-width="2" />
      <text x="250" y="277" text-anchor="middle" font-family="serif" font-size="22" font-weight="bold" fill="#fbbf24">GG</text>
      <text x="250" y="325" text-anchor="middle" font-family="serif" font-size="13" font-weight="bold" fill="#ffffff" letter-spacing="2">ESSENZA</text>
      <text x="250" y="340" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#fde68a" letter-spacing="2">PARFUM</text>
    `
  },
  {
    sku: '29697',
    name: 'WellnessPack Woman',
    category: 'Daily Swedish Nutrition',
    theme: ['#280f2d', '#4a1b52'],
    accent: '#ec4899',
    details: 'Astaxanthin, Omega 3 & Multivitamin • 21 Sachets',
    shape: `
      <!-- Wellness Box Packaging -->
      <rect x="160" y="150" width="180" height="220" rx="12" fill="url(#jarGrad)" stroke="#ec4899" stroke-width="2" filter="url(#dropGlow)" />
      <rect x="160" y="150" width="180" height="45" rx="12" fill="#be185d" />
      <text x="250" y="180" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="bold" fill="#ffffff" letter-spacing="2">WELLNESS</text>
      <!-- Astaxanthin & Omega 3 Capsules Graphic -->
      <ellipse cx="220" cy="245" rx="18" ry="10" transform="rotate(-25 220 245)" fill="#dc2626" />
      <ellipse cx="250" cy="255" rx="20" ry="11" fill="#f59e0b" />
      <ellipse cx="280" cy="245" rx="20" ry="11" transform="rotate(25 280 245)" fill="#fbbf24" />
      <text x="250" y="310" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">WellnessPack</text>
      <text x="250" y="328" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="semibold" fill="#fbcfe8">woman</text>
      <text x="250" y="348" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#9ca3af">21 DAILY SACHETS</text>
    `
  },
  {
    sku: '29696',
    name: 'WellnessPack Man',
    category: 'Male Endurance & Vitality',
    theme: ['#0f1f38', '#1a365d'],
    accent: '#38bdf8',
    details: 'Astaxanthin, Omega 3, Magnesium & Zinc • 21 Sachets',
    shape: `
      <!-- Wellness Box Packaging -->
      <rect x="160" y="150" width="180" height="220" rx="12" fill="url(#jarGrad)" stroke="#0284c7" stroke-width="2" filter="url(#dropGlow)" />
      <rect x="160" y="150" width="180" height="45" rx="12" fill="#0369a1" />
      <text x="250" y="180" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="bold" fill="#ffffff" letter-spacing="2">WELLNESS</text>
      <!-- Capsules Graphic -->
      <ellipse cx="220" cy="245" rx="18" ry="10" transform="rotate(-25 220 245)" fill="#dc2626" />
      <ellipse cx="250" cy="255" rx="20" ry="11" fill="#f59e0b" />
      <ellipse cx="280" cy="245" rx="20" ry="11" transform="rotate(25 280 245)" fill="#94a3b8" />
      <text x="250" y="310" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">WellnessPack</text>
      <text x="250" y="328" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="semibold" fill="#bae6fd">man</text>
      <text x="250" y="348" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#9ca3af">21 DAILY SACHETS</text>
    `
  },
  {
    sku: '31601',
    name: 'NovAge Ecollagen Serum',
    category: 'Patented Collagen Booster',
    theme: ['#052e16', '#14532d'],
    accent: '#4ade80',
    details: 'Bio-Peptide & Hyaluronic Booster • 30ml Dropper',
    shape: `
      <!-- Elegant Serum Dropper Bottle -->
      <rect x="195" y="195" width="110" height="175" rx="24" fill="url(#jarGrad)" stroke="#4ade80" stroke-width="2" filter="url(#dropGlow)" />
      <!-- Gold Dropper Collar -->
      <rect x="220" y="165" width="60" height="30" rx="4" fill="#d97706" />
      <rect x="235" y="130" width="30" height="35" rx="8" fill="#ffffff" />
      <!-- Tri-Peptide Helix Graphic -->
      <path d="M 235 250 Q 250 240 265 250 Q 250 260 235 250" fill="none" stroke="#4ade80" stroke-width="3" />
      <path d="M 235 270 Q 250 260 265 270 Q 250 280 235 270" fill="none" stroke="#86efac" stroke-width="3" />
      <text x="250" y="315" text-anchor="middle" font-family="serif" font-size="16" font-weight="bold" fill="#ffffff" letter-spacing="3">NOVAGE</text>
      <text x="250" y="332" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="semibold" fill="#86efac" letter-spacing="1">ECOLLAGEN</text>
      <text x="250" y="348" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#cbd5e1" letter-spacing="1">WRINKLE POWER SERUM</text>
    `
  },
  {
    sku: '31602',
    name: 'Milk & Honey Gold Scrub',
    category: 'Swedish Luxury Body Scrub',
    theme: ['#382405', '#573a09'],
    accent: '#fbbf24',
    details: 'Organic Milk Protein & Honey Nectar • 200ml Jar',
    shape: `
      <!-- Round Luxury Tub -->
      <ellipse cx="250" cy="270" rx="105" ry="90" fill="url(#jarGrad)" stroke="#f59e0b" stroke-width="3" filter="url(#dropGlow)" />
      <ellipse cx="250" cy="205" rx="95" ry="25" fill="#fef08a" stroke="#d97706" stroke-width="3" />
      <!-- Golden Bee & Honeycomb Badge -->
      <polygon points="250,240 265,248 265,265 250,273 235,265 235,248" fill="#f59e0b" opacity="0.8" />
      <text x="250" y="305" text-anchor="middle" font-family="serif" font-size="14" font-weight="bold" fill="#fef3c7">MILK & HONEY</text>
      <text x="250" y="322" text-anchor="middle" font-family="serif" font-size="12" font-weight="bold" fill="#fde68a">GOLD</text>
      <text x="250" y="338" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#cbd5e1">SMOOTHING SUGAR SCRUB</text>
    `
  },
  {
    sku: '42119',
    name: 'The ONE 5-in-1 Wonder Lash',
    category: 'Precision Lash Architecture',
    theme: ['#1e1026', '#3b1c4e'],
    accent: '#c084fc',
    details: 'Length, Volume & Pro-Vitamin B5 • 8ml Mascara',
    shape: `
      <!-- Slender Mascara Tube and Wand -->
      <rect x="235" y="140" width="30" height="230" rx="15" fill="url(#jarGrad)" stroke="#a855f7" stroke-width="2" filter="url(#dropGlow)" />
      <rect x="232" y="240" width="36" height="8" rx="2" fill="#e9d5ff" />
      <text x="250" y="300" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#f3e8ff" transform="rotate(-90 250 300)">THE ONE</text>
      <text x="250" y="200" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="semibold" fill="#c084fc" transform="rotate(-90 250 200)">WONDER LASH</text>
    `
  },
  {
    sku: '33650',
    name: 'Possess The Secret Man',
    category: 'Norse Mythology Parfum',
    theme: ['#0f172a', '#1e293b'],
    accent: '#38bdf8',
    details: 'Frozen Ice Accord & Oak Wood • 75ml EDP',
    shape: `
      <!-- Chiseled Norse Flask -->
      <rect x="175" y="180" width="150" height="185" rx="18" fill="url(#jarGrad)" stroke="#38bdf8" stroke-width="3" filter="url(#dropGlow)" />
      <!-- Thor Hammer / Ice Chain Band -->
      <rect x="175" y="240" width="150" height="30" fill="#334155" stroke="#94a3b8" stroke-width="1.5" />
      <text x="250" y="260" text-anchor="middle" font-family="serif" font-size="14" font-weight="bold" fill="#f8fafc" letter-spacing="3">POSSESS</text>
      <!-- Flask Cap -->
      <rect x="215" y="130" width="70" height="50" rx="8" fill="#64748b" stroke="#cbd5e1" stroke-width="2" />
      <text x="250" y="315" text-anchor="middle" font-family="serif" font-size="11" font-weight="semibold" fill="#38bdf8" letter-spacing="2">THE SECRET MAN</text>
      <text x="250" y="335" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#94a3b8" letter-spacing="2">EAU DE PARFUM</text>
    `
  },
  {
    sku: '35681',
    name: 'Optimals Hydra Radiance',
    category: 'Swedish Algae Moisture Shield',
    theme: ['#062e2e', '#0f5252'],
    accent: '#2dd4bf',
    details: 'Red & Brown Arctic Algae • 50ml Gel-Cream',
    shape: `
      <!-- Scandinavian Frosted Glass Jar -->
      <ellipse cx="250" cy="275" rx="95" ry="75" fill="url(#jarGrad)" stroke="#2dd4bf" stroke-width="2.5" filter="url(#dropGlow)" />
      <ellipse cx="250" cy="220" rx="85" ry="22" fill="#ffffff" stroke="#99f6e4" stroke-width="2" />
      <text x="250" y="280" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="bold" fill="#ffffff" letter-spacing="2">OPTIMALS</text>
      <text x="250" y="300" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="semibold" fill="#5eead4">HydraRadiance</text>
      <text x="250" y="318" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#ccfbf1">DAY CREAM LIGHT</text>
    `
  },
  {
    sku: '34843',
    name: 'Love Nature Tea Tree & Lime',
    category: 'Organic Spot Cleansing Solution',
    theme: ['#0f351f', '#1b5e37'],
    accent: '#86efac',
    details: 'Organic Mexican Lime & Tea Tree • 10ml Vial',
    shape: `
      <!-- Apothecary Dropper Vial -->
      <rect x="210" y="210" width="80" height="150" rx="16" fill="url(#jarGrad)" stroke="#86efac" stroke-width="2" filter="url(#dropGlow)" />
      <!-- Dropper Pipette -->
      <rect x="230" y="180" width="40" height="30" rx="4" fill="#ffffff" />
      <path d="M 240 180 L 250 145 L 260 180 Z" fill="#15803d" />
      <circle cx="250" cy="265" r="22" fill="#22c55e" opacity="0.25" />
      <text x="250" y="260" text-anchor="middle" font-family="serif" font-size="10" font-weight="bold" fill="#86efac">LOVE NATURE</text>
      <text x="250" y="278" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="semibold" fill="#ffffff">Tea Tree & Lime</text>
      <text x="250" y="325" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#bbf7d0">PURIFYING FACE OIL</text>
    `
  },
  {
    sku: '30886',
    name: 'North For Men Subzero',
    category: 'Arctic Cleansing & Shaving Foam',
    theme: ['#0b1a2b', '#18314f'],
    accent: '#60a5fa',
    details: 'Rhodiola Rosea & Polar Electrolytes • 200ml Canister',
    shape: `
      <!-- Matte Canister with Cooling Blue Cap -->
      <rect x="195" y="160" width="110" height="210" rx="14" fill="url(#jarGrad)" stroke="#60a5fa" stroke-width="2" filter="url(#dropGlow)" />
      <rect x="200" y="130" width="100" height="40" rx="8" fill="#3b82f6" />
      <!-- Polar Snowflake Crystal -->
      <text x="250" y="235" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#93c5fd">❄</text>
      <text x="250" y="275" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ffffff" letter-spacing="2">NORTH FOR MEN</text>
      <text x="250" y="295" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="extrabold" fill="#93c5fd" letter-spacing="1">SUBZERO</text>
      <text x="250" y="315" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#cbd5e1">2-IN-1 SHAVING & FOAM</text>
    `
  },
  {
    sku: '38557',
    name: 'Amber Elixir Mystery',
    category: 'Enigmatic Sensual Fragrance',
    theme: ['#3b1115', '#611b22'],
    accent: '#f59e0b',
    details: 'Baltic Amber & Red Scandinavian Lily • 50ml EDP',
    shape: `
      <!-- Fluted Amber Glass Sphere -->
      <circle cx="250" cy="270" r="85" fill="url(#jarGrad)" stroke="#f59e0b" stroke-width="3" filter="url(#dropGlow)" />
      <rect x="225" y="155" width="50" height="40" rx="6" fill="#f59e0b" stroke="#d97706" stroke-width="2" />
      <circle cx="250" cy="140" r="14" fill="#b45309" />
      <text x="250" y="260" text-anchor="middle" font-family="serif" font-size="14" font-weight="bold" fill="#fef3c7" letter-spacing="2">AMBER ELIXIR</text>
      <text x="250" y="280" text-anchor="middle" font-family="serif" font-size="12" font-style="italic" fill="#fde68a">Mystery</text>
      <text x="250" y="300" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#fca5a5" letter-spacing="1">EAU DE PARFUM</text>
    `
  }
];

const outputDir = path.join(process.cwd(), 'public', 'products');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

for (const p of products) {
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.theme[0]}" />
      <stop offset="100%" stop-color="${p.theme[1]}" />
    </linearGradient>

    <linearGradient id="jarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="50%" stop-color="${p.theme[1]}" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>

    <linearGradient id="goldCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#a16207" />
    </linearGradient>

    <filter id="dropGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="${p.accent}" flood-opacity="0.3" />
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.5" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="500" height="500" rx="36" fill="url(#bgGrad)" />

  <!-- Subtle Radial Spotlight -->
  <circle cx="250" cy="250" r="180" fill="${p.accent}" opacity="0.08" filter="blur(40px)" />

  <!-- Header Category & Oriflame Stockholm Badge -->
  <g transform="translate(30, 40)">
    <rect x="0" y="0" width="140" height="26" rx="13" fill="#000000" opacity="0.4" stroke="${p.accent}" stroke-width="1" />
    <text x="70" y="17" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="${p.accent}" letter-spacing="1">SKU #${p.sku}</text>
  </g>

  <g transform="translate(330, 40)">
    <text x="140" y="16" text-anchor="end" font-family="sans-serif" font-size="10" font-weight="semibold" fill="#94a3b8" letter-spacing="1">ORIFLAME SWEDEN</text>
  </g>

  <!-- Render Product Silhouette -->
  ${p.shape}

  <!-- Footer Verification & Extracts Info -->
  <g transform="translate(250, 440)">
    <rect x="-190" y="-20" width="380" height="34" rx="17" fill="#000000" opacity="0.6" stroke="#334155" stroke-width="1" />
    <text x="0" y="2" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="semibold" fill="#e2e8f0">${p.details}</text>
  </g>
</svg>`;

  const filePath = path.join(outputDir, `prod-${p.sku}.svg`);
  fs.writeFileSync(filePath, svgContent, 'utf-8');
  console.log(`Generated: ${filePath}`);
}

console.log('All 12 authentic Oriflame product SVGs generated successfully!');
