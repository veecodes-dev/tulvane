// Draws the Tulvane tulip mark and exports all icon sizes. Run: node scripts/make-icons.mjs
// The tulip is original artwork made from simple shapes (no outside images or fonts).
import sharp from 'sharp';

const C = { deep: '#2f4a3c', sage: '#7a9a86', cream: '#f4f1ea', clay: '#c9876b' };

// Mark drawn in a 1024 x 1024 box. `scale` shrinks it around the center (for safe zones).
const mark = ({ petal, center, stem }, scale = 1) => `
<g transform="translate(512 512) scale(${scale}) translate(-512 -512)">
  <rect x="500" y="590" width="24" height="250" rx="12" fill="${stem}"/>
  <path d="M512 820 C 625 820 700 755 712 655 C 605 668 532 725 512 820 Z" fill="${stem}"/>
  <path d="M350 320 C 330 470 400 600 512 610 C 470 520 440 420 350 320 Z" fill="${petal}"/>
  <path d="M674 320 C 694 470 624 600 512 610 C 554 520 584 420 674 320 Z" fill="${petal}"/>
  <path d="M512 240 C 590 330 620 450 560 560 C 540 595 484 595 464 560 C 404 450 434 330 512 240 Z" fill="${center}"/>
</g>`;

const svg = (bg, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${bg ? `<rect width="1024" height="1024" fill="${bg}"/>` : ''}${body}</svg>`;
const png = (s, size, file) => sharp(Buffer.from(s)).resize(size, size).png().toFile(file);

const onDark = { petal: C.cream, center: C.clay, stem: C.sage };
const onLight = { petal: C.sage, center: C.clay, stem: C.deep };

await Promise.all([
  png(svg(C.deep, mark(onDark, 1)), 1024, 'assets/icon.png'),
  png(svg(C.deep, ''), 1024, 'assets/android-icon-background.png'),
  png(svg(null, mark(onDark, 0.72)), 1024, 'assets/android-icon-foreground.png'),
  png(svg(null, mark({ petal: '#fff', center: '#fff', stem: '#fff' }, 0.72)), 1024, 'assets/android-icon-monochrome.png'),
  png(svg(null, mark(onLight, 1)), 512, 'assets/splash-icon.png'),
  png(svg(C.deep, mark(onDark, 1.1)), 96, 'assets/favicon.png'),
  png(svg(null, mark(onLight, 1.35)), 256, 'assets/logo-mark.png'),
]);
console.log('icons ready');
