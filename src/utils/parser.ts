import * as XLSX from 'xlsx';
import type { InspectieRij, RuweInspectieRij, DataSamenvatting, SectorTelling } from '../types/inspectie';

/** Verwachte kolommen die aanwezig moeten zijn */
const VERPLICHTE_KOLOMMEN = [
  'BRIN', 'Vestiging', 'OVT', 'OVTNaam',
  'Bestuursnummer', 'Bestuursnaam',
  'Sector', 'TypeOVT',
  'TypeOnderzoek', 'KwaliteitOnderwijs',
  'Vaststellingsdatum',
];

/**
 * Converteer YYYYMMDD getal naar DD-MM-YYYY string.
 * Bijv. 20241008 → "08-10-2024"
 */
export function formatDatumGetal(datum: number | null | undefined): string {
  if (datum == null || datum === 0) return '';
  const s = String(datum);
  if (s.length !== 8) return s;
  return `${s.slice(6, 8)}-${s.slice(4, 6)}-${s.slice(0, 4)}`;
}

/**
 * Parse een YYYYMMDD getal naar een sorteerbaar getal.
 * Geeft 0 terug als het geen geldig getal is.
 */
export function parseDatumGetal(waarde: unknown): number {
  if (waarde == null) return 0;
  const num = Number(waarde);
  if (isNaN(num) || num === 0) return 0;
  return num;
}

/**
 * Parse een ODS of XLSX bestand naar genormaliseerde inspectierijen.
 */
export function parseBestand(buffer: ArrayBuffer): {
  rijen: InspectieRij[];
  samenvatting: DataSamenvatting;
} {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const eersteSheet = workbook.SheetNames[0];
  if (!eersteSheet) {
    throw new Error('Het bestand bevat geen werkbladen.');
  }

  const sheet = workbook.Sheets[eersteSheet];
  if (!sheet) {
    throw new Error('Het werkblad kon niet worden gelezen.');
  }

  const ruweData = XLSX.utils.sheet_to_json<RuweInspectieRij>(sheet);

  if (ruweData.length === 0) {
    throw new Error('Het bestand bevat geen gegevens.');
  }

  // Valideer kolommen
  const eersteRij = ruweData[0];
  if (eersteRij) {
    const kolommen = Object.keys(eersteRij);
    const ontbrekendeKolommen = VERPLICHTE_KOLOMMEN.filter(k => !kolommen.includes(k));
    if (ontbrekendeKolommen.length > 0) {
      throw new Error(
        `De volgende kolommen ontbreken in het bestand: ${ontbrekendeKolommen.join(', ')}. ` +
        `Controleer of het juiste inspectiebestand is geüpload.`
      );
    }
  }

  // Normaliseer rijen
  const rijen: InspectieRij[] = ruweData.map(rij => normaliseerRij(rij));

  const samenvatting = berekenSamenvatting(rijen);

  return { rijen, samenvatting };
}

function normaliseerRij(rij: RuweInspectieRij): InspectieRij {
  const vaststellingRaw = parseDatumGetal(rij['Vaststellingsdatum']);
  const publicatieRaw = parseDatumGetal(rij['Publicatiedatum']);

  const genormaliseerd: InspectieRij = {
    BRIN: String(rij['BRIN'] ?? ''),
    Vestiging: String(rij['Vestiging'] ?? ''),
    OVT: String(rij['OVT'] ?? ''),
    OVTNaam: String(rij['OVTNaam'] ?? ''),
    Bestuursnummer: Number(rij['Bestuursnummer'] ?? 0),
    Bestuursnaam: String(rij['Bestuursnaam'] ?? ''),
    Sector: String(rij['Sector'] ?? '') as 'PO' | 'SO' | 'VO',
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

  // Kopieer alle overige kolommen (standaard-oordelen etc.)
  for (const [key, value] of Object.entries(rij)) {
    if (!(key in genormaliseerd)) {
      genormaliseerd[key] = value == null || String(value) === 'NaN' || String(value) === 'nan'
        ? 'Niet beoordeeld'
        : value as string | number;
    }
  }

  return genormaliseerd;
}

export function berekenSamenvatting(rijen: InspectieRij[]): DataSamenvatting {
  const sectoren: ('PO' | 'SO' | 'VO')[] = ['PO', 'SO', 'VO'];

  const perSector = {} as Record<'PO' | 'SO' | 'VO', SectorTelling>;
  for (const sector of sectoren) {
    const sectorRijen = rijen.filter(r => r.Sector === sector);
    perSector[sector] = {
      rijen: sectorRijen.length,
      scholen: new Set(sectorRijen.map(r => r.BRIN)).size,
      vestigingen: new Set(sectorRijen.map(r => `${r.BRIN}|${r.Vestiging}`)).size,
      opleidingen: new Set(sectorRijen.map(r => r.OVT)).size,
      besturen: new Set(sectorRijen.map(r => r.Bestuursnummer)).size,
      onderzoeken: new Set(sectorRijen.map(r => r.Onderzoeksnummer).filter(n => n)).size,
    };
  }

  return {
    totaalRijen: rijen.length,
    uniekeBRIN: new Set(rijen.map(r => r.BRIN)).size,
    uniekeVestigingen: new Set(rijen.map(r => `${r.BRIN}|${r.Vestiging}`)).size,
    uniekeOpleidingen: new Set(rijen.map(r => r.OVT)).size,
    uniekeBesturen: new Set(rijen.map(r => r.Bestuursnummer)).size,
    uniekeOnderzoeken: new Set(rijen.map(r => r.Onderzoeksnummer).filter(n => n)).size,
    perSector,
  };
}
