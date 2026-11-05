// Renders public/og.jpg (1200×630): the Ligne Inox mark and name over a drafting grid.
import sharp from 'sharp';

const grid = [...Array(16)].map((_, i) => `<path d="M${i * 80} 0V630" />`).join('') + [...Array(9)].map((_, i) => `<path d="M0 ${i * 80}H1200" />`).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0d0e0f"/>
  <g stroke="#ecebe7" stroke-opacity="0.06" stroke-width="1">${grid}</g>
  <g transform="translate(470 150) scale(6.5)">
    <rect x="1" y="1" width="38" height="26" rx="3" fill="none" stroke="#ecebe7" stroke-width="1.4"/>
    <path d="M-80 9H29a5 5 0 0 1 0 10H11" fill="none" stroke="#e2231a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="9" cy="19" r="2.2" fill="#e2231a"/>
  </g>
  <text x="600" y="430" text-anchor="middle" fill="#ecebe7" font-family="Helvetica, Arial, sans-serif" font-weight="500" font-size="76" letter-spacing="-2">Ligne Inox</text>
  <text x="600" y="490" text-anchor="middle" fill="#ecebe7" fill-opacity="0.55" font-family="Helvetica, Arial, sans-serif" font-size="22" letter-spacing="5">BUREAU D’ÉTUDES — CUISINES &amp; BUANDERIES · CONCEPT KOYOTEC</text>
</svg>`;

await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile('public/og.jpg');
console.log('og.jpg done');
