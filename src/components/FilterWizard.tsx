import { useState } from 'react';
import type { FilterState } from '../types/inspectie';

interface Props {
  updateFilter: <K extends keyof FilterState>(key: K, waarde: FilterState[K]) => void;
  resetFilters: () => void;
  onSluiten: () => void;
}

type Stap = 'doel' | 'sector' | 'oordeel' | 'periode' | 'klaar';

interface WizardState {
  doel: string | null;
  sector: ('PO' | 'SO' | 'VO')[];
  oordeel: string[];
  typeOnderzoek: string[];
  periode: string | null;
}

const DOELEN = [
  {
    id: 'herstelopdrachten',
    titel: 'Herstelopdrachten',
    omschrijving: 'Scholen met onvoldoende of zeer zwak oordeel en lopende herstelonderzoeken',
  },
  {
    id: 'risico',
    titel: 'Risicoscholen',
    omschrijving: 'Scholen die onderzocht worden naar aanleiding van risicosignalen',
  },
  {
    id: 'verbeteringen',
    titel: 'Kwaliteitsverbeteringen',
    omschrijving: 'Scholen die eerder onvoldoende scoorden en nu verbeterd zijn',
  },
  {
    id: 'goede-scholen',
    titel: 'Goede scholen',
    omschrijving: 'Scholen met een goed oordeel of positief kwaliteitsonderzoek',
  },
  {
    id: 'totaaloverzicht',
    titel: 'Totaaloverzicht',
    omschrijving: 'Alle onderzoeken zonder specifieke filtervoorkeur',
  },
];

const PERIODES = [
  { id: 'huidig-schooljaar', titel: 'Huidig schooljaar (2024-2025)', van: '2024-08-01', tot: '2025-07-31' },
  { id: 'vorig-schooljaar', titel: 'Vorig schooljaar (2023-2024)', van: '2023-08-01', tot: '2024-07-31' },
  { id: 'laatste-6-maanden', titel: 'Laatste 6 maanden', van: null, tot: null, relatief: true },
  { id: 'alles', titel: 'Alle periodes', van: null, tot: null },
];

function berekenRelatieveDatum(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString().slice(0, 10);
}

export function FilterWizard({ updateFilter, resetFilters, onSluiten }: Props) {
  const [stap, setStap] = useState<Stap>('doel');
  const [wizardState, setWizardState] = useState<WizardState>({
    doel: null,
    sector: [],
    oordeel: [],
    typeOnderzoek: [],
    periode: null,
  });

  const kiesDoel = (doelId: string) => {
    const nieuweState = { ...wizardState, doel: doelId };

    // Stel automatisch filters in op basis van doel
    switch (doelId) {
      case 'herstelopdrachten':
        nieuweState.oordeel = ['Onvoldoende', 'Zeer zwak'];
        nieuweState.typeOnderzoek = [
          'Herstelonderzoek school/opleiding',
          'Onderzoek kwaliteitsverbetering',
          "Kwaliteitsonderzoek naar aanleiding van risico's",
        ];
        break;
      case 'risico':
        nieuweState.oordeel = ['Onvoldoende', 'Zeer zwak'];
        nieuweState.typeOnderzoek = [
          "Kwaliteitsonderzoek naar aanleiding van risico's",
        ];
        break;
      case 'verbeteringen':
        nieuweState.oordeel = ['Voldoende', 'Goed'];
        nieuweState.typeOnderzoek = [
          'Onderzoek kwaliteitsverbetering',
          'Herstelonderzoek school/opleiding',
        ];
        break;
      case 'goede-scholen':
        nieuweState.oordeel = ['Goed'];
        nieuweState.typeOnderzoek = [
          'Kwaliteitsonderzoek goede school',
        ];
        break;
      case 'totaaloverzicht':
        nieuweState.oordeel = [];
        nieuweState.typeOnderzoek = [];
        break;
    }

    setWizardState(nieuweState);
    setStap('sector');
  };

  const kiesSector = (sector: 'PO' | 'SO' | 'VO') => {
    setWizardState(prev => {
      const huidige = prev.sector;
      const nieuwe = huidige.includes(sector)
        ? huidige.filter(s => s !== sector)
        : [...huidige, sector];
      return { ...prev, sector: nieuwe };
    });
  };

  const kiesPeriode = (periodeId: string) => {
    setWizardState(prev => ({ ...prev, periode: periodeId }));
  };

  const pasFilterssToe = () => {
    resetFilters();

    if (wizardState.sector.length > 0) {
      updateFilter('sector', wizardState.sector);
    }
    if (wizardState.oordeel.length > 0) {
      updateFilter('kwaliteitOnderwijs', wizardState.oordeel);
    }
    if (wizardState.typeOnderzoek.length > 0) {
      updateFilter('typeOnderzoek', wizardState.typeOnderzoek);
    }

    // Periode
    if (wizardState.periode) {
      const periode = PERIODES.find(p => p.id === wizardState.periode);
      if (periode) {
        if ('relatief' in periode && periode.relatief) {
          updateFilter('datumVan', berekenRelatieveDatum());
        } else if (periode.van) {
          updateFilter('datumVan', periode.van);
        }
        if (periode.tot) {
          updateFilter('datumTot', periode.tot);
        }
      }
    }

    setStap('klaar');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onSluiten}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Filterhulp</h2>
            <p className="text-sm text-gray-500">
              {stap === 'doel' && 'Wat wilt u bekijken?'}
              {stap === 'sector' && 'Voor welke sector(en)?'}
              {stap === 'periode' && 'Welke periode?'}
              {stap === 'klaar' && 'Filters zijn ingesteld'}
            </p>
          </div>
          <button
            onClick={onSluiten}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none px-2"
          >
            ×
          </button>
        </div>

        {/* Stappen indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            {['Doel', 'Sector', 'Periode'].map((label, i) => {
              const stappenVolgorde: Stap[] = ['doel', 'sector', 'periode'];
              const huidigeIndex = stappenVolgorde.indexOf(stap);
              const isActief = i === huidigeIndex;
              const isKlaar = i < huidigeIndex || stap === 'klaar';
              return (
                <div key={label} className="flex items-center gap-1">
                  {i > 0 && <span className="text-gray-300 mx-1">—</span>}
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs
                    ${isActief ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
                    ${isKlaar ? 'text-green-600' : ''}
                  `}>
                    {isKlaar && !isActief ? '✓ ' : ''}{label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Stap 1: Doel */}
          {stap === 'doel' && (
            <div className="space-y-2">
              {DOELEN.map(doel => (
                <button
                  key={doel.id}
                  onClick={() => kiesDoel(doel.id)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-semibold text-gray-900">{doel.titel}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{doel.omschrijving}</div>
                </button>
              ))}
            </div>
          )}

          {/* Stap 2: Sector */}
          {stap === 'sector' && (
            <div className="space-y-4">
              <div className="space-y-2">
                {([
                  { code: 'PO' as const, titel: 'Primair onderwijs (PO)', omschrijving: 'Basisscholen en speciaal basisonderwijs' },
                  { code: 'SO' as const, titel: 'Speciaal onderwijs (SO)', omschrijving: '(Voortgezet) speciaal onderwijs' },
                  { code: 'VO' as const, titel: 'Voortgezet onderwijs (VO)', omschrijving: 'VMBO, HAVO, VWO en praktijkonderwijs' },
                ]).map(sector => (
                  <button
                    key={sector.code}
                    onClick={() => kiesSector(sector.code)}
                    className={`w-full text-left p-4 border rounded-lg transition-colors ${
                      wizardState.sector.includes(sector.code)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{sector.titel}</div>
                        <div className="text-sm text-gray-500 mt-0.5">{sector.omschrijving}</div>
                      </div>
                      {wizardState.sector.includes(sector.code) && (
                        <span className="text-blue-600 text-lg">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStap('doel')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Terug
                </button>
                <button
                  onClick={() => setStap('periode')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  {wizardState.sector.length === 0 ? 'Alle sectoren' : 'Volgende'} →
                </button>
              </div>
            </div>
          )}

          {/* Stap 3: Periode */}
          {stap === 'periode' && (
            <div className="space-y-4">
              <div className="space-y-2">
                {PERIODES.map(periode => (
                  <button
                    key={periode.id}
                    onClick={() => kiesPeriode(periode.id)}
                    className={`w-full text-left p-4 border rounded-lg transition-colors ${
                      wizardState.periode === periode.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-900">{periode.titel}</div>
                      {wizardState.periode === periode.id && (
                        <span className="text-blue-600 text-lg">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStap('sector')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Terug
                </button>
                <button
                  onClick={pasFilterssToe}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  Filters toepassen
                </button>
              </div>
            </div>
          )}

          {/* Klaar */}
          {stap === 'klaar' && (
            <div className="space-y-4 text-center py-4">
              <div className="text-4xl">✓</div>
              <div className="text-lg font-semibold text-gray-900">Filters zijn ingesteld</div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Doel:</span>{' '}
                  {DOELEN.find(d => d.id === wizardState.doel)?.titel}
                </p>
                {wizardState.sector.length > 0 && (
                  <p>
                    <span className="font-medium">Sector:</span>{' '}
                    {wizardState.sector.join(', ')}
                  </p>
                )}
                {wizardState.oordeel.length > 0 && (
                  <p>
                    <span className="font-medium">Oordeel:</span>{' '}
                    {wizardState.oordeel.join(', ')}
                  </p>
                )}
                {wizardState.typeOnderzoek.length > 0 && (
                  <p>
                    <span className="font-medium">Type onderzoek:</span>{' '}
                    {wizardState.typeOnderzoek.join(', ')}
                  </p>
                )}
                {wizardState.periode && (
                  <p>
                    <span className="font-medium">Periode:</span>{' '}
                    {PERIODES.find(p => p.id === wizardState.periode)?.titel}
                  </p>
                )}
              </div>
              <button
                onClick={onSluiten}
                className="px-6 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Bekijk resultaten
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
