import { useState, useMemo } from 'react';
import type { InspectieRij, BestuurRij } from '../types/inspectie';
import { TYPE_OVT_LABELS } from '../types/inspectie';

interface Props {
  rijen: InspectieRij[]; // gefilterde rijen
  alleRijen: InspectieRij[]; // alle rijen (voor context)
  besturenMap: Map<number, BestuurRij>;
  onRijKlik: (rij: InspectieRij) => void;
}

interface BestuurGroep {
  bestuursnummer: number;
  bestuursnaam: string;
  // Bestuursdata uit BG-bestand
  bestuursInfo: BestuurRij | null;
  // Onderzoeken op bestuursniveau
  bestuurOnderzoeken: InspectieRij[];
  heeftBestuurHerstel: boolean;
  // Scholen onder dit bestuur
  scholen: SchoolGroep[];
  totaalHerstelScholen: number;
}

interface SchoolGroep {
  brin: string;
  naam: string;
  sector: string;
  typeOVT: string;
  onderzoeken: InspectieRij[];
  heeftHerstel: boolean;
  ernstigsteOordeel: string;
}

const HERSTEL_OORDELEN = ['Onvoldoende', 'Zeer zwak'];
const HERSTEL_ONDERZOEKEN = [
  'Herstelonderzoek school/opleiding',
  'Onderzoek kwaliteitsverbetering',
  "Kwaliteitsonderzoek naar aanleiding van risico's",
  'Onderzoek naar bestuurlijk handelen',
];

function isHerstelRij(rij: InspectieRij): boolean {
  return HERSTEL_OORDELEN.includes(rij.KwaliteitOnderwijs) ||
    HERSTEL_ONDERZOEKEN.some(t => rij.TypeOnderzoek.includes(t));
}

function isBestuurNiveau(rij: InspectieRij): boolean {
  return rij.TypeOnderzoek.toLowerCase().includes('bestuurlijk') ||
    rij.TypeOnderzoek.toLowerCase().includes('bestuur');
}

function oordeelPrioriteit(oordeel: string): number {
  switch (oordeel) {
    case 'Zeer zwak': return 0;
    case 'Onvoldoende': return 1;
    case 'Voldoende': return 3;
    case 'Goed': return 4;
    case 'Basistoezicht': return 5;
    default: return 6;
  }
}

function oordeelKleur(oordeel: string): string {
  switch (oordeel) {
    case 'Zeer zwak': return 'bg-red-100 text-red-800 border-red-200';
    case 'Onvoldoende': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Voldoende': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Goed': return 'bg-green-100 text-green-800 border-green-200';
    case 'Basistoezicht': return 'bg-purple-100 text-purple-800 border-purple-200';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

type SortOptie = 'ernst' | 'naam' | 'aantal';
type FilterOptie = 'alle' | 'alleen-herstel' | 'bestuur-herstel';

export function BestuurOverzicht({ rijen, besturenMap, onRijKlik }: Props) {
  const [zoek, setZoek] = useState('');
  const [sorteer, setSorteer] = useState<SortOptie>('ernst');
  const [filter, setFilter] = useState<FilterOptie>('alleen-herstel');
  const [openBesturen, setOpenBesturen] = useState<Set<number>>(new Set());

  const bestuurGroepen = useMemo(() => {
    // Groepeer alle rijen per bestuursnummer
    const groepen = new Map<number, BestuurGroep>();

    for (const rij of rijen) {
      if (!groepen.has(rij.Bestuursnummer)) {
        groepen.set(rij.Bestuursnummer, {
          bestuursnummer: rij.Bestuursnummer,
          bestuursnaam: rij.Bestuursnaam,
          bestuursInfo: besturenMap.get(rij.Bestuursnummer) ?? null,
          bestuurOnderzoeken: [],
          heeftBestuurHerstel: false,
          scholen: [],
          totaalHerstelScholen: 0,
        });
      }

      const groep = groepen.get(rij.Bestuursnummer)!;

      // Is dit een bestuursniveau-onderzoek?
      if (isBestuurNiveau(rij)) {
        groep.bestuurOnderzoeken.push(rij);
        if (isHerstelRij(rij)) {
          groep.heeftBestuurHerstel = true;
        }
      }
    }

    // Nu scholen groeperen per BRIN binnen elk bestuur
    const scholenPerBestuur = new Map<number, Map<string, SchoolGroep>>();

    for (const rij of rijen) {
      if (isBestuurNiveau(rij)) continue; // bestuursniveau al apart

      if (!scholenPerBestuur.has(rij.Bestuursnummer)) {
        scholenPerBestuur.set(rij.Bestuursnummer, new Map());
      }
      const scholenMap = scholenPerBestuur.get(rij.Bestuursnummer)!;

      if (!scholenMap.has(rij.BRIN)) {
        scholenMap.set(rij.BRIN, {
          brin: rij.BRIN,
          naam: rij.OVTNaam,
          sector: rij.Sector,
          typeOVT: rij.TypeOVT,
          onderzoeken: [],
          heeftHerstel: false,
          ernstigsteOordeel: 'Geen eindoordeel',
        });
      }

      const school = scholenMap.get(rij.BRIN)!;
      school.onderzoeken.push(rij);

      if (isHerstelRij(rij)) {
        school.heeftHerstel = true;
      }

      // Track ernstigste oordeel
      if (oordeelPrioriteit(rij.KwaliteitOnderwijs) < oordeelPrioriteit(school.ernstigsteOordeel)) {
        school.ernstigsteOordeel = rij.KwaliteitOnderwijs;
      }
    }

    // Koppel scholen aan besturen
    for (const [bestuursnummer, scholenMap] of scholenPerBestuur) {
      const groep = groepen.get(bestuursnummer);
      if (groep) {
        groep.scholen = Array.from(scholenMap.values());
        groep.totaalHerstelScholen = groep.scholen.filter(s => s.heeftHerstel).length;
      }
    }

    return Array.from(groepen.values());
  }, [rijen, besturenMap]);

  // Filter en sorteer
  const gefilterd = useMemo(() => {
    let result = bestuurGroepen;

    // Zoekfilter
    if (zoek) {
      const z = zoek.toLowerCase();
      result = result.filter(b =>
        b.bestuursnaam.toLowerCase().includes(z) ||
        String(b.bestuursnummer).includes(z) ||
        b.scholen.some(s => s.brin.toLowerCase().includes(z) || s.naam.toLowerCase().includes(z))
      );
    }

    // Filter optie
    if (filter === 'alleen-herstel') {
      result = result.filter(b => b.heeftBestuurHerstel || b.totaalHerstelScholen > 0);
    } else if (filter === 'bestuur-herstel') {
      result = result.filter(b => b.heeftBestuurHerstel);
    }

    // Sorteer
    result = [...result].sort((a, b) => {
      if (sorteer === 'ernst') {
        // Bestuur-herstel eerst, dan meeste herstelscholen
        if (a.heeftBestuurHerstel !== b.heeftBestuurHerstel) {
          return a.heeftBestuurHerstel ? -1 : 1;
        }
        return b.totaalHerstelScholen - a.totaalHerstelScholen;
      }
      if (sorteer === 'naam') {
        return a.bestuursnaam.localeCompare(b.bestuursnaam, 'nl');
      }
      // aantal
      return b.scholen.length - a.scholen.length;
    });

    return result;
  }, [bestuurGroepen, zoek, filter, sorteer]);

  const toggleBestuur = (nr: number) => {
    setOpenBesturen(prev => {
      const next = new Set(prev);
      if (next.has(nr)) {
        next.delete(nr);
      } else {
        next.add(nr);
      }
      return next;
    });
  };

  const openAlles = () => setOpenBesturen(new Set(gefilterd.map(b => b.bestuursnummer)));
  const sluitAlles = () => setOpenBesturen(new Set());

  // Tellingen
  const totaalBestuurHerstel = gefilterd.filter(b => b.heeftBestuurHerstel).length;
  const totaalScholenHerstel = gefilterd.reduce((sum, b) => sum + b.totaalHerstelScholen, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Bestuur → Scholen overzicht</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Hiërarchisch overzicht van besturen en hun scholen met herstelopdrachten
        </p>
      </div>

      {/* Tellingen */}
      <div className="px-4 py-2.5 border-b border-gray-200 flex gap-4 text-sm">
        <span className="text-gray-600">
          <strong className="text-gray-900">{gefilterd.length}</strong> besturen
        </span>
        {totaalBestuurHerstel > 0 && (
          <span className="text-red-700">
            <strong>{totaalBestuurHerstel}</strong> met herstelopdracht op bestuursniveau
          </span>
        )}
        <span className="text-orange-700">
          <strong>{totaalScholenHerstel}</strong> scholen met herstelopdracht
        </span>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2.5 border-b border-gray-200 flex gap-3 items-center flex-wrap">
        <input
          type="text"
          placeholder="Zoek bestuur of school..."
          value={zoek}
          onChange={e => setZoek(e.target.value)}
          className="px-2.5 py-1.5 border border-gray-300 rounded text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={filter}
          onChange={e => setFilter(e.target.value as FilterOptie)}
          className="px-2.5 py-1.5 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="alleen-herstel">Alleen met herstelopdrachten</option>
          <option value="bestuur-herstel">Alleen bestuursniveau herstel</option>
          <option value="alle">Alle besturen</option>
        </select>

        <select
          value={sorteer}
          onChange={e => setSorteer(e.target.value as SortOptie)}
          className="px-2.5 py-1.5 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ernst">Sorteer op ernst</option>
          <option value="naam">Sorteer op naam</option>
          <option value="aantal">Sorteer op aantal scholen</option>
        </select>

        <div className="flex gap-1 text-xs">
          <button onClick={openAlles} className="text-blue-600 hover:underline">Alles openen</button>
          <span className="text-gray-300">|</span>
          <button onClick={sluitAlles} className="text-blue-600 hover:underline">Alles sluiten</button>
        </div>
      </div>

      {/* Lijst */}
      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {gefilterd.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            Geen besturen gevonden voor de huidige filters.
          </div>
        ) : (
          gefilterd.map(bestuur => (
            <BestuurRijComponent
              key={bestuur.bestuursnummer}
              bestuur={bestuur}
              isOpen={openBesturen.has(bestuur.bestuursnummer)}
              onToggle={() => toggleBestuur(bestuur.bestuursnummer)}
              onRijKlik={onRijKlik}
              verbergScholen={filter === 'bestuur-herstel'}
            />
          ))
        )}
      </div>
    </div>
  );
}

function BestuurRijComponent({ bestuur, isOpen, onToggle, onRijKlik, verbergScholen }: {
  bestuur: BestuurGroep;
  isOpen: boolean;
  onToggle: () => void;
  onRijKlik: (rij: InspectieRij) => void;
  verbergScholen: boolean;
}) {
  return (
    <div>
      {/* Bestuur header */}
      <div
        onClick={onToggle}
        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-start gap-3 ${
          bestuur.heeftBestuurHerstel ? 'bg-red-50/50' : ''
        }`}
      >
        <span className="text-gray-400 mt-0.5 text-xs select-none">
          {isOpen ? '▼' : '▶'}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">{bestuur.bestuursnaam}</span>
            <span className="text-xs text-gray-400 font-mono">#{bestuur.bestuursnummer}</span>

            {bestuur.heeftBestuurHerstel && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 font-medium">
                Herstelopdracht bestuur
              </span>
            )}
            {bestuur.bestuursInfo && bestuur.bestuursInfo.Eindoordeel !== 'Geen oordeel' && (
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                bestuur.bestuursInfo.Eindoordeel === 'Voldoende'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : bestuur.bestuursInfo.Eindoordeel === 'Onvoldoende' || bestuur.bestuursInfo.Eindoordeel === 'Zeer zwak'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-gray-50 text-gray-600 border-gray-200'
              }`}>
                {bestuur.bestuursInfo.Eindoordeel}
              </span>
            )}
            {bestuur.bestuursInfo && bestuur.bestuursInfo.FinancieelBeheer !== 'Geen samenvattend oordeel' && (
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                bestuur.bestuursInfo.FinancieelBeheer === 'Voldoende'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : bestuur.bestuursInfo.FinancieelBeheer === 'Onvoldoende'
                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                  : 'bg-gray-50 text-gray-600 border-gray-200'
              }`}>
                Financieel: {bestuur.bestuursInfo.FinancieelBeheer}
              </span>
            )}
          </div>

          <div className="flex gap-3 mt-1 text-xs text-gray-500">
            <span>{bestuur.scholen.length} scholen</span>
            {bestuur.totaalHerstelScholen > 0 && (
              <span className="text-orange-700 font-medium">
                {bestuur.totaalHerstelScholen} met herstelopdracht
              </span>
            )}
            {bestuur.bestuurOnderzoeken.length > 0 && (
              <span>{bestuur.bestuurOnderzoeken.length} bestuursonderzoeken</span>
            )}
            {bestuur.bestuursInfo && (
              <span className="text-gray-400">Sectoren: {bestuur.bestuursInfo.SectorenBijBestuur}</span>
            )}
          </div>
        </div>
      </div>

      {/* Inhoud */}
      {isOpen && (
        <div className="bg-gray-50/50 border-t border-gray-100">
          {/* Bestuursonderzoeken */}
          {bestuur.bestuurOnderzoeken.length > 0 && (
            <div className="px-4 py-2 ml-6 border-l-2 border-red-300">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Onderzoeken op bestuursniveau
              </div>
              {bestuur.bestuurOnderzoeken.map((rij, i) => (
                <div
                  key={`${rij.Onderzoeksnummer}-${i}`}
                  onClick={() => onRijKlik(rij)}
                  className="flex items-center gap-2 py-1 cursor-pointer hover:bg-white rounded px-2 -mx-2 text-sm"
                >
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${oordeelKleur(rij.KwaliteitOnderwijs)}`}>
                    {rij.KwaliteitOnderwijs}
                  </span>
                  <span className="text-gray-700 truncate">{rij.TypeOnderzoek}</span>
                  <span className="text-xs text-gray-400 ml-auto">{rij.Vaststellingsdatum}</span>
                </div>
              ))}
            </div>
          )}

          {/* Scholen — verborgen bij bestuursniveau filter */}
          {!verbergScholen && (
            <div className="px-4 py-2 ml-6">
              {bestuur.scholen
                .sort((a, b) => oordeelPrioriteit(a.ernstigsteOordeel) - oordeelPrioriteit(b.ernstigsteOordeel))
                .map(school => (
                  <SchoolRij key={school.brin} school={school} onRijKlik={onRijKlik} />
                ))}

              {bestuur.scholen.length === 0 && (
                <div className="text-xs text-gray-400 py-2">
                  Geen scholen met onderzoeken in de huidige selectie.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SchoolRij({ school, onRijKlik }: {
  school: SchoolGroep;
  onRijKlik: (rij: InspectieRij) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border-l-2 pl-3 mb-1 ${school.heeftHerstel ? 'border-orange-400' : 'border-gray-200'}`}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-white rounded px-2 -mx-2"
      >
        <span className="text-gray-400 text-xs select-none">{isOpen ? '▼' : '▶'}</span>

        <span className="font-mono text-xs text-gray-400">{school.brin}</span>
        <span className="text-sm text-gray-800 truncate">{school.naam}</span>
        <span className="text-xs text-gray-400">{school.sector}</span>
        <span className="text-xs text-gray-400">{TYPE_OVT_LABELS[school.typeOVT] ?? school.typeOVT}</span>

        <span className={`ml-auto px-1.5 py-0.5 rounded text-xs font-medium ${oordeelKleur(school.ernstigsteOordeel)}`}>
          {school.ernstigsteOordeel}
        </span>

        <span className="text-xs text-gray-400">{school.onderzoeken.length}x</span>
      </div>

      {isOpen && (
        <div className="ml-5 mb-2">
          {school.onderzoeken
            .sort((a, b) => b._vaststellingsdatumRaw - a._vaststellingsdatumRaw)
            .map((rij, i) => (
              <div
                key={`${rij.Onderzoeksnummer}-${i}`}
                onClick={() => onRijKlik(rij)}
                className="flex items-center gap-2 py-1 cursor-pointer hover:bg-white rounded px-2 -mx-2 text-xs"
              >
                <span className={`px-1.5 py-0.5 rounded font-medium ${oordeelKleur(rij.KwaliteitOnderwijs)}`}>
                  {rij.KwaliteitOnderwijs}
                </span>
                <span className="text-gray-600 truncate">{rij.TypeOnderzoek}</span>
                <span className="text-gray-400 ml-auto">{rij.Vaststellingsdatum}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
