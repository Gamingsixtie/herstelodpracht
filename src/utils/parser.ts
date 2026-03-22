import * as XLSX from 'xlsx';
import type { InspectieRij, RuweInspectieRij, DataSamenvatting, SectorTelling, BestuurRij } from '../types/inspectie';

/** Verwachte kolommen voor school-bestanden (PO/SO/VO) */
const SCHOOL_KOLOMMEN = [
  'BRIN', 'Bestuursnummer', 'Bestuursnaam',
  'Sector', 'TypeOnderzoek', 'KwaliteitOnderwijs',
];

/** Verwachte kolommen voor bestuur-bestanden (BG) */
const BESTUUR_KOLOMMEN = ['Bestuursnummer', 'Bestuursnaam'];
const BESTUUR_UNIEKE_KOLOMMEN = ['SectorenBijBestuur', 'FinancieelBeheer'];

export type BestandType = 'school' | 'bestuur';

export interface ParseResultaat {
  type: BestandType;
  schoolRijen: InspectieRij[];
  bestuurRijen: BestuurRij[];
}

/**
 * Converteer YYYYMMDD getal naar DD-MM-YYYY string.
 */
export function formatDatumGetal(datum: number | null | undefined): string {
  if (datum == null || datum === 0) return '';
  const s = String(datum);
  if (s.length !== 8) return s;
  return `${s.slice(6, 8)}-${s.slice(4, 6)}-${s.slice(0, 4)}`;
}

export function parseDatumGetal(waarde: unknown): number {
  if (waarde == null) return 0;
  const num = Number(waarde);
  if (isNaN(num) || num === 0) return 0;
  return num;
}

/**
 * Normaliseer Bestuursnummer — kan binnenkomen als:
 * - Getal: 8
 * - String: "00008"
 * - Excel formule: ="00008"
 */
function normaliseerBestuursnummer(waarde: unknown): { nummer: number; origineel: string } {
  if (waarde == null) return { nummer: 0, origineel: '' };

  let str = String(waarde).trim();

  // Strip Excel formula-formaat: ="00008" → 00008
  if (str.startsWith('="') && str.endsWith('"')) {
    str = str.slice(2, -1);
  }
  // Strip enkele quotes
  if (str.startsWith("='") && str.endsWith("'")) {
    str = str.slice(2, -1);
  }

  const origineel = str;
  const nummer = parseInt(str, 10) || 0;

  return { nummer, origineel };
}

/**
 * Detecteer bestandstype en parse naar het juiste formaat.
 */
export function parseBestand(buffer: ArrayBuffer): ParseResultaat {
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

  const eersteRij = ruweData[0];
  if (!eersteRij) {
    throw new Error('Het bestand bevat geen gegevens.');
  }

  const kolommen = Object.keys(eersteRij);

  // Auto-detectie: heeft het BRIN → school, heeft het SectorenBijBestuur → bestuur
  const heeftSchoolKolommen = SCHOOL_KOLOMMEN.every(k => kolommen.includes(k));
  const heeftBestuurKolommen = BESTUUR_UNIEKE_KOLOMMEN.some(k => kolommen.includes(k));

  if (heeftBestuurKolommen && !heeftSchoolKolommen) {
    // === BESTUUR-BESTAND ===
    const ontbrekend = BESTUUR_KOLOMMEN.filter(k => !kolommen.includes(k));
    if (ontbrekend.length > 0) {
      throw new Error(`Besturenbestand mist kolommen: ${ontbrekend.join(', ')}`);
    }

    const bestuurRijen = ruweData.map(rij => normaliseerBestuurRij(rij));
    return { type: 'bestuur', schoolRijen: [], bestuurRijen };
  }

  if (heeftSchoolKolommen) {
    // === SCHOOL-BESTAND ===
    const schoolRijen = ruweData.map(rij => normaliseerSchoolRij(rij));
    return { type: 'school', schoolRijen, bestuurRijen: [] };
  }

  // Onbekend formaat
  throw new Error(
    'Onherkenbaar bestandsformaat. Verwacht een school-bestand (met BRIN, Sector, etc.) ' +
    'of een besturenbestand (met SectorenBijBestuur, FinancieelBeheer).'
  );
}

function normaliseerSchoolRij(rij: RuweInspectieRij): InspectieRij {
  const vaststellingRaw = parseDatumGetal(rij['Vaststellingsdatum']);
  const publicatieRaw = parseDatumGetal(rij['Publicatiedatum']);
  const { nummer: bestuursnummer } = normaliseerBestuursnummer(rij['Bestuursnummer']);

  const genormaliseerd: InspectieRij = {
    BRIN: String(rij['BRIN'] ?? ''),
    Vestiging: String(rij['Vestiging'] ?? ''),
    OVT: String(rij['OVT'] ?? ''),
    OVTNaam: String(rij['OVTNaam'] ?? ''),
    Bestuursnummer: bestuursnummer,
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

  // Kopieer overige kolommen (standaard-oordelen etc.)
  for (const [key, value] of Object.entries(rij)) {
    if (!(key in genormaliseerd)) {
      genormaliseerd[key] = value == null || String(value) === 'NaN' || String(value) === 'nan'
        ? 'Niet beoordeeld'
        : value as string | number;
    }
  }

  return genormaliseerd;
}

function normaliseerBestuurRij(rij: RuweInspectieRij): BestuurRij {
  const { nummer, origineel } = normaliseerBestuursnummer(rij['Bestuursnummer']);

  return {
    Peildatum: String(rij['Peildatum'] ?? ''),
    Bestuursnummer: nummer,
    BestuursnummerOrigineel: origineel,
    Bestuursnaam: String(rij['Bestuursnaam'] ?? ''),
    SectorenBijBestuur: String(rij['SectorenBijBestuur'] ?? ''),
    FinancieelBeheer: String(rij['FinancieelBeheer'] ?? 'Geen samenvattend oordeel') || 'Geen samenvattend oordeel',
  };
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
