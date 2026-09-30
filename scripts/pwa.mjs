// Runs after "expo export". Adds what a phone needs to install the website like an app (PWA):
// a manifest, icons, and the right tags in index.html.
import { copyFileSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

const dist = new URL('../dist/', import.meta.url);
if (!existsSync(dist)) throw new Error('Run "expo export" first.');

for (const f of ['pwa-192.png', 'pwa-512.png', 'pwa-maskable-512.png', 'apple-touch-icon.png']) {
  copyFileSync(new URL(`../assets/${f}`, import.meta.url), new URL(f, dist));
}

writeFileSync(
  new URL('manifest.webmanifest', dist),
  JSON.stringify(
    {
      name: 'Tulvane',
      short_name: 'Tulvane',
      description: 'Demo flower shop: choose a bouquet, pay in test mode, ask the AI helper.',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#f4f1ea',
      theme_color: '#7a9a86',
      icons: [
        { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    null,
    2
  )
);

const tags = `
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="theme-color" content="#7a9a86" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="Tulvane" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="description" content="Demo flower shop: choose a bouquet, pay in test mode, ask the AI helper." />
  `;
const indexUrl = new URL('index.html', dist);
let html = readFileSync(indexUrl, 'utf8');
if (!html.includes('manifest.webmanifest')) html = html.replace('</head>', `${tags}</head>`);
writeFileSync(indexUrl, html);
console.log('PWA files added to dist');
