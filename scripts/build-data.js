/**
 * Pre-process: parst alle ODS/XLSX bronbestanden naar één data.json
 * Draait tijdens npm run build, VÓÓR de Vite build.
 *
 * Gebruik: node scripts/build-data.js
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import * as XLSX from 'xlsx';

const bronDir = join(import.meta.dirname, '..', 'public', 'bronbestanden');
const outputPath = join(import.meta.dirname, '..', 'public', 'data.json');

const EXTENSIES = ['.ods', '.xlsx', '.xls'];

// --- Kolom-detectie ---
const SCHOOL_KOLOMMEN = ['BRIN', 'Bestuursnummer', 'Bestuursnaam', 'Sector', 'TypeOnderzoek', 'KwaliteitOnderwijs'];
const BESTUUR_UNIEKE_KOLOMMEN = ['SectorenBijBestuur', 'FinancieelBeheer'];

// --- Bestuursnummer normalisatie ---
function normaliseerBestuursnummer(waarde) {
  if (waarde == null) return { nummer: 0, origineel: '' };
  let str = String(waarde).trim();
  if (str.startsWith('="') && str.endsWith('"')) str = str.slice(2, -1);
  if (str.startsWith("='") && str.endsWith("'")) str = str.slice(2, -1);
  const origineel = str;
  const nummer = parseInt(str, 10) || 0;
  return { nummer, origineel };
}

// --- Datum ---
function formatDatumGetal(datum) {
  if (datum == null || datum === 0) return '';
  const s = String(datum);
  if (s.length !== 8) return s;
  return `${s.slice(6, 8)}-${s.slice(4, 6)}-${s.slice(0, 4)}`;
}

function parseDatumGetal(waarde) {
  if (waarde == null) return 0;
  const num = Number(waarde);
  if (isNaN(num) || num === 0) return 0;
  return num;
}

// --- Parse school rij ---
function normaliseerSchoolRij(rij) {
  const vaststellingRaw = parseDatumGetal(rij['Vaststellingsdatum']);
  const publicatieRaw = parseDatumGetal(rij['Publicatiedatum']);
  const { nummer: bestuursnummer } = normaliseerBestuursnummer(rij['Bestuursnummer']);

  const genormaliseerd = {
    BRIN: String(rij['BRIN'] ?? ''),
    Vestiging: String(rij['Vestiging'] ?? ''),
    OVT: String(rij['OVT'] ?? ''),
    OVTNaam: String(rij['OVTNaam'] ?? ''),
    Bestuursnummer: bestuursnummer,
    Bestuursnaam: String(rij['Bestuursnaam'] ?? ''),
    Sector: String(rij['Sector'] ?? ''),
    TypeOVT: String(rij['TypeOVT'] ?? ''),
    Elementtype: String(rij['Elementtype'] ?? ''),
    TypeOnderzoek: String(rij['TypeOnderzoek'] ?? ''),
    TypeOnderzoekCode: String(rij['TypeOnderzoekCode'] ?? ''),
    Onderzoeksnummer: String(rij['Onderzoeksnummer'] ?? ''),
    KwaliteitOnderwijs: String(rij['KwaliteitOnderwijs'] ?? 'Geen eindoordeel'),
    Vaststellingsdatum: formatDatumGetal(vaststellingRaw),
    Publicatiedatum: formatDatumGetal(publicatieRaw),
    Peildatum: String(rij['Peildatum'] ?? ''),
    _vaststellingsdatumRaw: vaststellingRaw,
    _publicatiedatumRaw: publicatieRaw,
  };

  // Kopieer standaard-oordelen
  for (const [key, value] of Object.entries(rij)) {
    if (!(key in genormaliseerd)) {
      genormaliseerd[key] = value == null || String(value) === 'NaN' || String(value) === 'nan'
        ? 'Niet beoordeeld'
        : value;
    }
  }

  return genormaliseerd;
}

// --- Parse bestuur rij ---
function normaliseerBestuurRij(rij) {
  const { nummer, origineel } = normaliseerBestuursnummer(rij['Bestuursnummer']);
  const fb = String(rij['FinancieelBeheer'] ?? '').trim();
  const eo = String(rij['Eindoordeel'] ?? '').trim();

  return {
    Peildatum: String(rij['Peildatum'] ?? ''),
    Bestuursnummer: nummer,
    BestuursnummerOrigineel: origineel,
    Bestuursnaam: String(rij['Bestuursnaam'] ?? ''),
    SectorenBijBestuur: String(rij['SectorenBijBestuur'] ?? ''),
    Eindoordeel: eo || 'Geen oordeel',
    FinancieelBeheer: fb || 'Geen samenvattend oordeel',
    FinancielePositie: String(rij['FinancielePositie'] ?? '').trim() || 'Geen oordeel',
    KwaliteitszorgEnAmbitie: String(rij['KwaliteitszorgEnAmbitie'] ?? '').trim() || 'Geen oordeel',
    Onderwijsresultaten: String(rij['Onderwijsresultaten'] ?? '').trim() || 'Geen oordeel',
  };
}

// --- Deduplicatie ---
function dedupliceerSchoolRijen(rijen) {
  const perKey = new Map();
  for (const rij of rijen) {
    const key = `${rij.OVT}|${rij.Onderzoeksnummer || rij.BRIN + rij.Vestiging}`;
    const bestaand = perKey.get(key);
    if (!bestaand || rij.Peildatum > bestaand.Peildatum) {
      perKey.set(key, rij);
    }
  }
  return Array.from(perKey.values());
}

function dedupliceerBesturen(rijen) {
  const perNummer = new Map();
  for (const rij of rijen) {
    const bestaand = perNummer.get(rij.Bestuursnummer);
    if (!bestaand || rij.Peildatum > bestaand.Peildatum) {
      perNummer.set(rij.Bestuursnummer, rij);
    }
  }
  return Array.from(perNummer.values());
}

// --- Main ---
console.log('Data build gestart...');

const bestanden = readdirSync(bronDir).filter(f => EXTENSIES.includes(extname(f).toLowerCase()));
console.log(`${bestanden.length} bronbestanden gevonden`);

const alleSchoolRijen = [];
const alleBestuurRijen = [];
const geladenBestanden = [];

for (const bestandsnaam of bestanden) {
  const pad = join(bronDir, bestandsnaam);
  try {
    const buffer = readFileSync(pad);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const eersteSheet = workbook.SheetNames[0];
    if (!eersteSheet) continue;
    const sheet = workbook.Sheets[eersteSheet];
    if (!sheet) continue;
    const ruweData = XLSX.utils.sheet_to_json(sheet);
    if (ruweData.length === 0) continue;

    const kolommen = Object.keys(ruweData[0]);
    const isSchool = SCHOOL_KOLOMMEN.every(k => kolommen.includes(k));
    const isBestuur = BESTUUR_UNIEKE_KOLOMMEN.some(k => kolommen.includes(k)) && !isSchool;

    if (isSchool) {
      const rijen = ruweData.map(r => normaliseerSchoolRij(r));
      alleSchoolRijen.push(...rijen);
      console.log(`  [SCHOOL] ${bestandsnaam}: ${rijen.length} rijen`);
    } else if (isBestuur) {
      const rijen = ruweData.map(r => normaliseerBestuurRij(r));
      alleBestuurRijen.push(...rijen);
      console.log(`  [BESTUUR] ${bestandsnaam}: ${rijen.length} rijen`);
    } else {
      console.log(`  [ONBEKEND] ${bestandsnaam}: overgeslagen`);
      continue;
    }
    geladenBestanden.push(bestandsnaam);
  } catch (e) {
    console.error(`  [FOUT] ${bestandsnaam}: ${e.message}`);
  }
}

// Dedupliceer
const schoolRijen = dedupliceerSchoolRijen(alleSchoolRijen);
const bestuurRijen = dedupliceerBesturen(alleBestuurRijen);

console.log(`\nResultaat na deduplicatie:`);
console.log(`  School: ${alleSchoolRijen.length} ruw -> ${schoolRijen.length} uniek`);
console.log(`  Bestuur: ${alleBestuurRijen.length} ruw -> ${bestuurRijen.length} uniek`);

// Schrijf data.json
const data = {
  schoolRijen,
  bestuurRijen,
  geladenBestanden,
  gebouwdOp: new Date().toISOString(),
};

const json = JSON.stringify(data);
writeFileSync(outputPath, json, 'utf-8');

const sizeMB = (Buffer.byteLength(json) / 1024 / 1024).toFixed(2);
console.log(`\ndata.json geschreven: ${sizeMB} MB`);
console.log('Data build voltooid!');
