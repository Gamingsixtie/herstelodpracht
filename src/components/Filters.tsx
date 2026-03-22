import { useState, useCallback } from 'react';
import type { FilterState } from '../types/inspectie';
import { KWALITEIT_ONDERWIJS_WAARDEN, TOP_ONDERZOEKSTYPEN } from '../types/inspectie';
import { HERSTELCODE_TOELICHTING } from '../utils/legenda';

interface Props {
  filters: FilterState;
  updateFilter: <K extends keyof FilterState>(key: K, waarde: FilterState[K]) => void;
  resetFilters: () => void;
  uniekeTypeOnderzoeken: string[];
  uniekeHerstelCodes: string[];
  aantalResultaten: number;
}

export function Filters({ filters, updateFilter, resetFilters, uniekeTypeOnderzoeken, uniekeHerstelCodes, aantalResultaten }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        <button
          onClick={resetFilters}
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          Filters wissen
        </button>
      </div>

      {/* Resultaat telling */}
      <div className="text-sm text-gray-600 bg-gray-50 rounded px-3 py-2">
        {aantalResultaten.toLocaleString('nl-NL')} resultaten gevonden
      </div>

      {/* Sector filter */}
      <SectorFilter
        geselecteerd={filters.sector}
        onChange={waarde => updateFilter('sector', waarde)}
      />

      {/* Bestuur zoeken */}
      <ZoekVeld
        label="Bestuur"
        placeholder="Zoek op bestuursnaam of -nummer..."
        waarde={filters.bestuurZoek}
        onChange={waarde => updateFilter('bestuurZoek', waarde)}
      />

      {/* School zoeken */}
      <ZoekVeld
        label="School"
        placeholder="Zoek op BRIN-code of opleidingsnaam..."
        waarde={filters.schoolZoek}
        onChange={waarde => updateFilter('schoolZoek', waarde)}
      />

      {/* KwaliteitOnderwijs multiselect */}
      <MultiSelect
        label="Kwaliteit onderwijs"
        opties={[...KWALITEIT_ONDERWIJS_WAARDEN]}
        geselecteerd={filters.kwaliteitOnderwijs}
        onChange={waarde => updateFilter('kwaliteitOnderwijs', waarde)}
      />

      {/* TypeOnderzoek multiselect */}
      <TypeOnderzoekFilter
        opties={uniekeTypeOnderzoeken}
        geselecteerd={filters.typeOnderzoek}
        onChange={waarde => updateFilter('typeOnderzoek', waarde)}
      />

      {/* Herstelcode filter */}
      {uniekeHerstelCodes.length > 0 && (
        <HerstelCodeFilter
          opties={uniekeHerstelCodes}
          geselecteerd={filters.herstelCode}
          onChange={waarde => updateFilter('herstelCode', waarde)}
        />
      )}

      {/* Datumrange */}
      <DatumRange
        van={filters.datumVan}
        tot={filters.datumTot}
        onVanChange={waarde => updateFilter('datumVan', waarde)}
        onTotChange={waarde => updateFilter('datumTot', waarde)}
      />
    </div>
  );
}

function SectorFilter({ geselecteerd, onChange }: {
  geselecteerd: ('PO' | 'SO' | 'VO')[];
  onChange: (waarde: ('PO' | 'SO' | 'VO')[]) => void;
}) {
  const sectoren: { code: 'PO' | 'SO' | 'VO'; label: string }[] = [
    { code: 'PO', label: 'Primair onderwijs' },
    { code: 'SO', label: 'Speciaal onderwijs' },
    { code: 'VO', label: 'Voortgezet onderwijs' },
  ];

  const toggle = (code: 'PO' | 'SO' | 'VO') => {
    if (geselecteerd.includes(code)) {
      onChange(geselecteerd.filter(s => s !== code));
    } else {
      onChange([...geselecteerd, code]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
      <div className="flex gap-2">
        {sectoren.map(s => (
          <button
            key={s.code}
            onClick={() => toggle(s.code)}
            className={`
              px-3 py-1.5 text-sm rounded-md border transition-colors
              ${geselecteerd.includes(s.code)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {s.code}
          </button>
        ))}
      </div>
    </div>
  );
}

function ZoekVeld({ label, placeholder, waarde, onChange }: {
  label: string;
  placeholder: string;
  waarde: string;
  onChange: (waarde: string) => void;
}) {
  const [lokaleWaarde, setLokaleWaarde] = useState(waarde);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLokaleWaarde(v);
    // Debounce: direct updaten voor nu (kan later met setTimeout)
    onChange(v);
  }, [onChange]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={lokaleWaarde}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}

function MultiSelect({ label, opties, geselecteerd, onChange }: {
  label: string;
  opties: string[];
  geselecteerd: string[];
  onChange: (waarde: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = (optie: string) => {
    if (geselecteerd.includes(optie)) {
      onChange(geselecteerd.filter(s => s !== optie));
    } else {
      onChange([...geselecteerd, optie]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {geselecteerd.length === 0
          ? 'Alle'
          : `${geselecteerd.length} geselecteerd`
        }
        <span className="float-right">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="mt-1 border border-gray-200 rounded-md bg-white max-h-48 overflow-y-auto shadow-sm">
          {opties.map(optie => (
            <label
              key={optie}
              className="flex items-center px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={geselecteerd.includes(optie)}
                onChange={() => toggle(optie)}
                className="mr-2"
              />
              {optie}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function TypeOnderzoekFilter({ opties, geselecteerd, onChange }: {
  opties: string[];
  geselecteerd: string[];
  onChange: (waarde: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const topOpties = opties.filter(o => TOP_ONDERZOEKSTYPEN.some(t => o.includes(t)));
  const overigeOpties = opties.filter(o => !TOP_ONDERZOEKSTYPEN.some(t => o.includes(t)));

  const toggle = (optie: string) => {
    if (geselecteerd.includes(optie)) {
      onChange(geselecteerd.filter(s => s !== optie));
    } else {
      onChange([...geselecteerd, optie]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Type onderzoek</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {geselecteerd.length === 0
          ? 'Alle'
          : `${geselecteerd.length} geselecteerd`
        }
        <span className="float-right">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="mt-1 border border-gray-200 rounded-md bg-white max-h-64 overflow-y-auto shadow-sm">
          {topOpties.length > 0 && (
            <>
              <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50 uppercase tracking-wide">
                Veelvoorkomend
              </div>
              {topOpties.map(optie => (
                <label
                  key={optie}
                  className="flex items-center px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={geselecteerd.includes(optie)}
                    onChange={() => toggle(optie)}
                    className="mr-2"
                  />
                  {optie}
                </label>
              ))}
            </>
          )}
          {overigeOpties.length > 0 && (
            <>
              <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50 uppercase tracking-wide">
                Overig
              </div>
              {overigeOpties.map(optie => (
                <label
                  key={optie}
                  className="flex items-center px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={geselecteerd.includes(optie)}
                    onChange={() => toggle(optie)}
                    className="mr-2"
                  />
                  {optie}
                </label>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function HerstelCodeFilter({ opties, geselecteerd, onChange }: {
  opties: string[];
  geselecteerd: string[];
  onChange: (waarde: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = (code: string) => {
    if (geselecteerd.includes(code)) {
      onChange(geselecteerd.filter(c => c !== code));
    } else {
      onChange([...geselecteerd, code]);
    }
  };

  // Groepeer: herstel-codes bovenaan, overige onderaan
  const herstelPatronen = ['HERST', 'OKV', 'KORISICO', 'KO_RISICO', 'HOZVRW', 'VRWHERST', 'HERBST', 'BOV'];
  const herstelCodes = opties.filter(c => herstelPatronen.some(p => c.toUpperCase().includes(p)));
  const overigeCodes = opties.filter(c => !herstelPatronen.some(p => c.toUpperCase().includes(p)));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Herstelcode</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {geselecteerd.length === 0
          ? 'Alle codes'
          : `${geselecteerd.length} geselecteerd`
        }
        <span className="float-right">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="mt-1 border border-gray-200 rounded-md bg-white max-h-72 overflow-y-auto shadow-sm">
          {herstelCodes.length > 0 && (
            <>
              <div className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-50 uppercase tracking-wide">
                Herstelopdrachten
              </div>
              {herstelCodes.map(code => {
                const toelichting = HERSTELCODE_TOELICHTING[code];
                return (
                  <label
                    key={code}
                    className="flex items-start px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={geselecteerd.includes(code)}
                      onChange={() => toggle(code)}
                      className="mt-0.5"
                    />
                    <div className="min-w-0">
                      <span className="font-mono text-xs bg-gray-100 px-1 rounded">{code}</span>
                      {toelichting && (
                        <div className="text-xs text-gray-500 mt-0.5 leading-snug">{toelichting.slice(0, 80)}...</div>
                      )}
                    </div>
                  </label>
                );
              })}
            </>
          )}
          {overigeCodes.length > 0 && (
            <>
              <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50 uppercase tracking-wide">
                Overige onderzoekscodes
              </div>
              {overigeCodes.map(code => (
                <label
                  key={code}
                  className="flex items-center px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm gap-2"
                >
                  <input
                    type="checkbox"
                    checked={geselecteerd.includes(code)}
                    onChange={() => toggle(code)}
                  />
                  <span className="font-mono text-xs">{code}</span>
                  {HERSTELCODE_TOELICHTING[code] && (
                    <span className="text-xs text-gray-400 truncate">{HERSTELCODE_TOELICHTING[code]?.slice(0, 50)}</span>
                  )}
                </label>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DatumRange({ van, tot, onVanChange, onTotChange }: {
  van: string | null;
  tot: string | null;
  onVanChange: (waarde: string | null) => void;
  onTotChange: (waarde: string | null) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Vaststellingsdatum</label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Van</label>
          <input
            type="date"
            value={van ?? ''}
            onChange={e => onVanChange(e.target.value || null)}
            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Tot</label>
          <input
            type="date"
            value={tot ?? ''}
            onChange={e => onTotChange(e.target.value || null)}
            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
