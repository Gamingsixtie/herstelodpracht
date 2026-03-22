/** Eén rij uit het inspectiebestand (62 kolommen) */
export interface InspectieRij {
  // Identificatie
  BRIN: string;
  Vestiging: string;
  OVT: string;
  OVTNaam: string;

  // Bestuur
  Bestuursnummer: number;
  Bestuursnaam: string;

  // Classificatie
  Sector: 'PO' | 'SO' | 'VO';
  TypeOVT: string;
  Elementtype: string;

  // Onderzoek
  TypeOnderzoek: string;
  TypeOnderzoekCode: string;
  Onderzoeksnummer: string;

  // Oordeel
  KwaliteitOnderwijs: string;

  // Datums (genormaliseerd naar DD-MM-YYYY strings)
  Vaststellingsdatum: string;
  Publicatiedatum: string;
  Peildatum: string;

  // Ruwe datum getallen (voor filtering/sortering)
  _vaststellingsdatumRaw: number;
  _publicatiedatumRaw: number;

  // Standaard-oordelen (OP1-BA2) — dynamische keys
  [key: string]: string | number;
}

/** Ruwe rij direct uit de parser, vóór normalisatie */
export interface RuweInspectieRij {
  [key: string]: string | number | null | undefined;
}

/** Eén rij uit een besturenbestand (BG) — 5 kolommen */
export interface BestuurRij {
  Peildatum: string;
  Bestuursnummer: number;       // genormaliseerd (leading zeros gestript)
  BestuursnummerOrigineel: string; // origineel met leading zeros bijv. "00008"
  Bestuursnaam: string;
  SectorenBijBestuur: string;   // bijv. "PO-VO-SO"
  Eindoordeel: string;          // bestuursoordeel
  FinancieelBeheer: string;     // bijv. "Voldoende" of "Geen samenvattend oordeel"
  FinancielePositie: string;
  KwaliteitszorgEnAmbitie: string;
  Onderwijsresultaten: string;
}

/** Samenvatting na upload */
export interface DataSamenvatting {
  totaalRijen: number;
  uniekeBRIN: number;           // unieke BRIN-codes (echte scholen)
  uniekeVestigingen: number;    // unieke BRIN+Vestiging combinaties
  uniekeOpleidingen: number;    // unieke OVT-codes
  uniekeBesturen: number;       // unieke Bestuursnummers
  uniekeOnderzoeken: number;    // unieke Onderzoeksnummers
  perSector: {
    PO: SectorTelling;
    SO: SectorTelling;
    VO: SectorTelling;
  };
}

export interface SectorTelling {
  rijen: number;
  scholen: number;              // unieke BRIN
  vestigingen: number;          // unieke BRIN+Vestiging
  opleidingen: number;          // unieke OVT
  besturen: number;
  onderzoeken: number;          // unieke Onderzoeksnummers
}

/** TypeOVT code naar volledige naam mapping */
export const TYPE_OVT_LABELS: Record<string, string> = {
  BAS: 'Basisschool',
  VOS: 'Voortgezet onderwijs',
  SPEC: 'Speciaal onderwijs',
  SBO: 'Speciaal basisonderwijs',
  VSO: 'Voortgezet speciaal onderwijs',
  SO: 'Speciaal onderwijs',
  PRO: 'Praktijkonderwijs',
  VMBO: 'Voorbereidend middelbaar beroepsonderwijs',
  HAVO: 'Hoger algemeen voortgezet onderwijs',
  VWO: 'Voorbereidend wetenschappelijk onderwijs',
};

/** Mogelijke waarden voor KwaliteitOnderwijs */
export const KWALITEIT_ONDERWIJS_WAARDEN = [
  'Voldoende',
  'Onvoldoende',
  'Goed',
  'Zeer zwak',
  'Basistoezicht',
  'Geen eindoordeel',
] as const;

export type KwaliteitOnderwijs = typeof KWALITEIT_ONDERWIJS_WAARDEN[number];

/** Top-5 onderzoekstypen voor groepering in filter */
export const TOP_ONDERZOEKSTYPEN = [
  'Stelselonderzoek',
  'Herstelonderzoek school/opleiding',
  "Kwaliteitsonderzoek naar aanleiding van risico's",
  'Kwaliteitsonderzoek goede school',
  'Onderzoek kwaliteitsverbetering',
] as const;

/** Filter state */
export interface FilterState {
  sector: ('PO' | 'SO' | 'VO')[];
  bestuurZoek: string;
  schoolZoek: string;
  kwaliteitOnderwijs: string[];
  typeOnderzoek: string[];
  herstelCode: string[];
  datumVan: string | null;   // DD-MM-YYYY
  datumTot: string | null;   // DD-MM-YYYY
}

export const INITIAL_FILTER_STATE: FilterState = {
  sector: [],
  bestuurZoek: '',
  schoolZoek: '',
  kwaliteitOnderwijs: [],
  typeOnderzoek: [],
  herstelCode: [],
  datumVan: null,
  datumTot: null,
};
