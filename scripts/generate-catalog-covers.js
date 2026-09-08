import fs from 'fs';
import path from 'path';

const covers = [
  {
    name: 'catalog-skin.svg',
    title: 'SWEDISH BOTANICAL SKINCARE',
    subtitle: 'Official Oriflame E-Catalog • 2026 Collection',
    bg: ['#042920', '#0a4c3a'],
    accent: '#4ade80'
  },
  {
    name: 'catalog-fragrance.svg',
    title: 'SCANDINAVIAN HAUTE PARFUMERIE',
    subtitle: 'Giordani Gold, Possess & Amber Elixir',
    bg: ['#2e1a06', '#59340e'],
    accent: '#fbbf24'
  },
  {
    name: 'catalog-wellness.svg',
    title: 'WELLNESS BY ORIFLAME SWEDEN',
    subtitle: 'Stockholm Archipelago Astaxanthin & Omega 3',
    bg: ['#0d223a', '#183c66'],
    accent: '#38bdf8'
  },
  {
    name: 'catalog-novage.svg',
    title: 'NOVAGE+ BIO-SCIENCE PROTOCOL',
    subtitle: 'Patented Bio-Peptides & Edelweiss Phyto-Stem Cells',
    bg: ['#280f2d', '#4d1e57'],
    accent: '#ec4899'
  },
  {
    name: 'proof-clearance.svg',
    title: 'ORIFLAME SPO VERIFIED CLEARANCE',
    subtitle: 'Official Invoice & Batch Authenticity Certificate',
    bg: ['#0f172a', '#1e293b'],
    accent: '#00A859'
  },
  {
    name: 'fallback-product.svg',
    title: 'ORIFLAME SWEDEN',
    subtitle: 'Original Authentic Product • Team Golden Star Hub',
    bg: ['#042920', '#064234'],
    accent: '#00A859'
  }
];

const dir = path.join(process.cwd(), 'public', 'products');
for (const c of covers) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_${c.name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.bg[0]}" />
      <stop offset="100%" stop-color="${c.bg[1]}" />
    </linearGradient>
  </defs>
  <rect width="800" height="500" rx="28" fill="url(#bg_${c.name})" />
  <circle cx="400" cy="250" r="160" fill="${c.accent}" opacity="0.08" filter="blur(30px)" />
  <rect x="30" y="30" width="740" height="440" rx="20" fill="none" stroke="${c.accent}" stroke-width="2" stroke-opacity="0.3" stroke-dasharray="10 6" />
  
  <g transform="translate(400, 160)">
    <!-- Oriflame Swedish Seal -->
    <circle cx="0" cy="0" r="48" fill="#000000" opacity="0.4" stroke="${c.accent}" stroke-width="2" />
    <text x="0" y="8" text-anchor="middle" font-family="serif" font-size="28" font-weight="bold" fill="${c.accent}">★</text>
  </g>

  <text x="400" y="270" text-anchor="middle" font-family="serif" font-size="26" font-weight="extrabold" fill="#ffffff" letter-spacing="3">${c.title}</text>
  <text x="400" y="305" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="semibold" fill="${c.accent}" letter-spacing="1">${c.subtitle}</text>
  <text x="400" y="350" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#94a3b8" letter-spacing="2">TEAM GOLDEN STAR • SUBHASHREE GHOSH DIAMOND DIRECTOR HUB</text>
  <text x="400" y="420" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#00A859">100% SWEDISH ORIFLAME AUTHENTICITY GUARANTEE</text>
</svg>`;
  fs.writeFileSync(path.join(dir, c.name), svg, 'utf-8');
}
console.log('Covers created successfully');
