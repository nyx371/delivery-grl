#!/usr/bin/env node
'use strict';

/*
 * Stämplar innehållshashar på tillgångarna i index.html så att webbläsare
 * aldrig serverar en gammal version efter en push. GitHub Pages revaliderar
 * index.html ofta men cachar css/js — därför byter vi ?v= när filen ändras.
 *
 * Körs automatiskt av .github/workflows/cache-bust.yml vid varje push,
 * och kan köras för hand med: node tools/cache-bust.js [--check]
 * Avslutar med kod 1 i --check-läge om något behövde uppdateras.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'index.html');
const checkOnly = process.argv.includes('--check');

const hashOf = file =>
  crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 10);

const original = fs.readFileSync(htmlPath, 'utf8');
const changed = [];

// href="style.css" / src="game.js" — med eller utan befintlig ?v=
const updated = original.replace(
  /((?:href|src)=")([^"?#]+\.(?:css|js))(?:\?v=[^"#]*)?(")/g,
  (match, pre, asset, post) => {
    const assetPath = path.join(root, asset);
    if (!fs.existsSync(assetPath)) {
      console.warn('cache-bust: hoppar över ' + asset + ' (filen finns inte)');
      return match;
    }
    const stamped = pre + asset + '?v=' + hashOf(assetPath) + post;
    if (stamped !== match) changed.push(asset);
    return stamped;
  }
);

if (updated === original) {
  console.log('cache-bust: index.html är redan aktuell.');
  process.exit(0);
}

if (checkOnly) {
  console.error('cache-bust: föråldrade hashar för ' + changed.join(', ') + '. Kör: node tools/cache-bust.js');
  process.exit(1);
}

fs.writeFileSync(htmlPath, updated);
console.log('cache-bust: uppdaterade ' + changed.join(', '));
