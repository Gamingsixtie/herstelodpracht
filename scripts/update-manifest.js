/**
 * Scant public/bronbestanden/ en genereert manifest.json
 * Gebruik: node scripts/update-manifest.js
 */
import { readdirSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

const dir = join(import.meta.dirname, '..', 'bronbestanden');
const manifestPath = join(import.meta.dirname, '..', 'public', 'bronbestanden', 'manifest.json');

const extensies = ['.ods', '.xlsx', '.xls'];
const bestanden = readdirSync(dir)
  .filter(f => extensies.includes(extname(f).toLowerCase()))
  .sort();

const manifest = { bestanden };
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');

console.log(`Manifest bijgewerkt: ${bestanden.length} bestanden gevonden`);
bestanden.forEach(f => console.log(`  - ${f}`));
