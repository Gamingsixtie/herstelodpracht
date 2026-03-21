/**
 * Legenda: toelichting op alle onderzoekstypen, oordelen en codes
 * uit het inspectiekader van de Onderwijsinspectie.
 */

export interface LegendaItem {
  naam: string;
  uitleg: string;
  categorie: 'herstelopdracht' | 'kwaliteitsonderzoek' | 'regulier' | 'overig';
  citoRelevant?: string; // Wat Cito kan bieden in relatie tot dit type
}

/** Toelichting per TypeOnderzoek */
export const TYPE_ONDERZOEK_LEGENDA: Record<string, LegendaItem> = {
  'Herstelonderzoek school/opleiding': {
    naam: 'Herstelonderzoek school/opleiding',
    uitleg: 'De Inspectie komt terug bij een school die eerder als onvoldoende of zeer zwak is beoordeeld om te controleren of de tekortkomingen zijn opgelost. De school heeft een herstelopdracht gekregen en een verbeterplan uitgevoerd.',
    categorie: 'herstelopdracht',
    citoRelevant: 'Cito kan ondersteunen met: leerlingvolgsysteem-analyses, toetsresultaten vergelijken voor/na herstelperiode, referentieniveaus monitoring.',
  },
  'Onderzoek kwaliteitsverbetering': {
    naam: 'Onderzoek kwaliteitsverbetering',
    uitleg: 'Vervolgonderzoek bij een school die eerder tekortkomingen had. De Inspectie bekijkt of de school aantoonbare verbeteringen heeft gerealiseerd. Verschilt van herstelonderzoek doordat het breder kijkt dan alleen de specifieke tekortkomingen.',
    categorie: 'herstelopdracht',
    citoRelevant: 'Cito kan ondersteunen met: trendanalyses van toetsresultaten over meerdere jaren, vergelijking met landelijke gemiddelden, groei-indicatoren.',
  },
  "Kwaliteitsonderzoek naar aanleiding van risico's": {
    naam: "Kwaliteitsonderzoek naar aanleiding van risico's",
    uitleg: 'De Inspectie heeft risicosignalen gedetecteerd bij deze school — bijvoorbeeld dalende toetsresultaten, hoog personeelsverloop, of klachten. Dit onderzoek bepaalt of er daadwerkelijk kwaliteitsproblemen zijn. Kan leiden tot een herstelopdracht.',
    categorie: 'kwaliteitsonderzoek',
    citoRelevant: 'Cito kan ondersteunen met: risicosignalering via toetsdata, afwijkingen van verwachte scores identificeren, vergelijking met schoolweging.',
  },
  'Kwaliteitsonderzoek goede school': {
    naam: 'Kwaliteitsonderzoek goede school',
    uitleg: 'Onderzoek bij scholen die al goed presteren. De Inspectie bekijkt of de school het predicaat "Goed" verdient — dit is een positieve beoordeling boven de basiskwaliteit.',
    categorie: 'kwaliteitsonderzoek',
    citoRelevant: 'Cito kan ondersteunen met: bevestiging van bovengemiddelde resultaten, analyse van toegevoegde waarde, differentiatie-analyses.',
  },
  'Stelselonderzoek': {
    naam: 'Stelselonderzoek',
    uitleg: 'Regulier, steekproefsgewijs onderzoek dat de Inspectie uitvoert over het hele onderwijsstelsel. Niet gericht op één school maar op thema\'s zoals burgerschapsonderwijs, digitale geletterdheid, etc. Leidt meestal niet tot een individueel oordeel (vandaar "Geen eindoordeel").',
    categorie: 'regulier',
    citoRelevant: 'Cito kan ondersteunen met: landelijke referentiedata, stelselmonitoring, peilingen.',
  },
  'Vierjaarlijks onderzoek': {
    naam: 'Vierjaarlijks onderzoek',
    uitleg: 'Standaard inspectiebezoek dat elke school eens per vier jaar krijgt. De Inspectie beoordeelt de basiskwaliteit. Als alles in orde is, volgt basistoezicht; bij tekortkomingen volgt een herstelopdracht.',
    categorie: 'regulier',
    citoRelevant: 'Cito kan ondersteunen met: voorbereiding via inzicht in eigen toetsresultaten, vergelijking met vergelijkbare scholen (schoolweging).',
  },
  'Themaonderzoek': {
    naam: 'Themaonderzoek',
    uitleg: 'Gericht onderzoek naar een specifiek thema, zoals passend onderwijs, basisvaardigheden, of veiligheid. Wordt bij meerdere scholen tegelijk uitgevoerd om een landelijk beeld te krijgen.',
    categorie: 'regulier',
    citoRelevant: 'Cito kan ondersteunen met: thema-specifieke toetsdata en analyses, bijvoorbeeld basisvaardigheden taal/rekenen.',
  },
  'Verificatieonderzoek': {
    naam: 'Verificatieonderzoek',
    uitleg: 'Kort onderzoek om te controleren of eerder geconstateerde bevindingen kloppen of zijn opgelost. Lichter dan een volledig herstelonderzoek.',
    categorie: 'herstelopdracht',
    citoRelevant: 'Cito kan ondersteunen met: actuele toetsresultaten als verificatie van verbeteringen.',
  },
  'Onderzoek naar bestuurlijk handelen': {
    naam: 'Onderzoek naar bestuurlijk handelen',
    uitleg: 'Onderzoek gericht op het schoolbestuur, niet op individuele scholen. De Inspectie bekijkt of het bestuur voldoende kwaliteitszorg heeft, financieel gezond is, en effectief stuurt op onderwijskwaliteit.',
    categorie: 'overig',
    citoRelevant: 'Cito kan ondersteunen met: bestuursrapportages over toetsresultaten van alle scholen onder het bestuur.',
  },
  'Incidentonderzoek': {
    naam: 'Incidentonderzoek',
    uitleg: 'Onderzoek naar aanleiding van een specifiek incident, zoals een ernstige klacht, veiligheidsincident, of mediabericht. Kan leiden tot verscherpt toezicht.',
    categorie: 'overig',
  },
  'Stimulerend onderzoek': {
    naam: 'Stimulerend onderzoek',
    uitleg: 'Onderzoek gericht op het stimuleren van verbetering, zonder direct sanctionerend karakter. De Inspectie geeft feedback en aanbevelingen.',
    categorie: 'regulier',
  },
};

/** Categorie labels en kleuren */
export const CATEGORIE_INFO: Record<string, { label: string; kleur: string; uitleg: string }> = {
  herstelopdracht: {
    label: 'Herstelopdrachten',
    kleur: 'bg-red-50 border-red-200 text-red-800',
    uitleg: 'Onderzoeken die direct te maken hebben met scholen die tekortkomingen moeten herstellen.',
  },
  kwaliteitsonderzoek: {
    label: 'Kwaliteitsonderzoeken',
    kleur: 'bg-orange-50 border-orange-200 text-orange-800',
    uitleg: 'Gerichte onderzoeken naar de kwaliteit van een specifieke school.',
  },
  regulier: {
    label: 'Regulier toezicht',
    kleur: 'bg-blue-50 border-blue-200 text-blue-800',
    uitleg: 'Standaard inspectieactiviteiten die niet gericht zijn op specifieke problemen.',
  },
  overig: {
    label: 'Overig',
    kleur: 'bg-gray-50 border-gray-200 text-gray-700',
    uitleg: 'Overige onderzoekstypen.',
  },
};

/** Toelichting per KwaliteitOnderwijs oordeel */
export const OORDEEL_LEGENDA: Record<string, { uitleg: string; kleur: string; gevolg: string }> = {
  'Zeer zwak': {
    uitleg: 'De school heeft ernstige en structurele tekortkomingen. De kwaliteit van het onderwijs is onacceptabel.',
    kleur: 'bg-red-100 text-red-800',
    gevolg: 'School komt onder verscherpt toezicht. Herstelopdracht is verplicht. Het bestuur moet binnen een jaar aantoonbare verbeteringen realiseren. Bij onvoldoende herstel kan de bekostiging worden ingetrokken.',
  },
  'Onvoldoende': {
    uitleg: 'De school voldoet niet aan de basiskwaliteit op één of meer standaarden. Er zijn tekortkomingen geconstateerd die hersteld moeten worden.',
    kleur: 'bg-orange-100 text-orange-800',
    gevolg: 'School krijgt een herstelopdracht met een termijn (meestal 1-2 jaar). Na afloop volgt een herstelonderzoek om te controleren of de verbeteringen zijn doorgevoerd.',
  },
  'Voldoende': {
    uitleg: 'De school voldoet aan de basiskwaliteit. Alle beoordeelde standaarden zijn op orde.',
    kleur: 'bg-blue-100 text-blue-800',
    gevolg: 'Geen verdere actie nodig. School valt onder regulier (basis)toezicht.',
  },
  'Goed': {
    uitleg: 'De school presteert bovengemiddeld en onderscheidt zich positief. Dit is een beoordeling boven de basiskwaliteit.',
    kleur: 'bg-green-100 text-green-800',
    gevolg: 'School krijgt het predicaat "Goed". Dit is een positieve erkenning die publiek wordt gemaakt.',
  },
  'Basistoezicht': {
    uitleg: 'De school valt onder het reguliere toezichtkader zonder bijzonderheden. Er zijn geen signalen van risico\'s of tekortkomingen.',
    kleur: 'bg-purple-100 text-purple-800',
    gevolg: 'Geen actie nodig. School wordt eens per vier jaar bezocht voor een reguliere inspectie.',
  },
  'Geen eindoordeel': {
    uitleg: 'Er is geen oordeel over de kwaliteit van het onderwijs gegeven. Dit komt het vaakst voor bij stelselonderzoeken, themaonderzoeken, of onderzoeken die niet gericht zijn op het beoordelen van individuele scholen.',
    kleur: 'bg-gray-100 text-gray-600',
    gevolg: 'Geen directe gevolgen voor de school. De resultaten worden gebruikt voor landelijke analyses en beleidsvorming.',
  },
};

/** Toelichting op standaard-oordelen (OP, SK, VS, etc.) */
export const STANDAARD_GROEP_LEGENDA: Record<string, { naam: string; uitleg: string; standaarden: Record<string, string> }> = {
  OP: {
    naam: 'Onderwijsproces',
    uitleg: 'Beoordeelt hoe het onderwijs wordt gegeven: aanbod, zicht op ontwikkeling, didactisch handelen, en extra ondersteuning.',
    standaarden: {
      OP0: 'Aanbod',
      OP1: 'Zicht op ontwikkeling',
      OP2: 'Didactisch handelen',
      OP3: 'Extra ondersteuning',
      OP4: 'Samenwerking',
      OP5: 'Leerresultaten (PO)',
      OP6: 'Leerresultaten (VO)',
      OP7: 'Onderwijsresultaten',
      OP8: 'Vervolgsucces',
    },
  },
  SK: {
    naam: 'Schoolklimaat',
    uitleg: 'Beoordeelt de veiligheid en het pedagogisch klimaat op school.',
    standaarden: {
      SK1: 'Veiligheid',
      SK2: 'Pedagogisch klimaat',
    },
  },
  VS: {
    naam: 'Veiligheid en schoolklimaat',
    uitleg: 'Aanvullende beoordeling van veiligheidsaspecten.',
    standaarden: {
      VS1: 'Sociale veiligheid',
      VS2: 'Fysieke veiligheid',
    },
  },
  KA: {
    naam: 'Kwaliteitszorg',
    uitleg: 'Beoordeelt hoe de school de eigen kwaliteit bewaakt en verbetert.',
    standaarden: {
      KA1: 'Kwaliteitszorg',
      KA2: 'Kwaliteitscultuur',
      KA3: 'Verantwoording en dialoog',
    },
  },
  BA: {
    naam: 'Basiskwaliteit',
    uitleg: 'Overkoepelende beoordeling of de school aan de wettelijke basiskwaliteit voldoet.',
    standaarden: {
      BA1: 'Basiskwaliteit',
      BA2: 'Wettelijke vereisten',
    },
  },
};
