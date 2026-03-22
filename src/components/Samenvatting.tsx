import { useMemo, useState } from 'react';
import type { DataSamenvatting, BestuurRij, InspectieRij } from '../types/inspectie';
import { HERSTELCODE_TOELICHTING } from '../utils/legenda';

interface Props {
  samenvatting: DataSamenvatting;
  besturenData: BestuurRij[];
  schoolRijen: InspectieRij[];
}

/** Herstel-gerelateerde TypeOnderzoekCode patronen */
const SCHOOL_HERSTEL_CODES = ['HERST', 'OKV', 'KORISICO', 'KO_RISICO'];
const BESTUUR_HERSTEL_CODES = ['HOZVRW', 'VRWHERST', 'HERBST', 'BOV'];

function isHerstelCode(code: string, patronen: string[]): boolean {
  const upper = code.toUpperCase();
  return patronen.some(p => upper.includes(p));
}

function oordeelKleur(oordeel: string): string {
  switch (oordeel) {
    case 'Zeer zwak': return 'bg-red-100 text-red-800';
    case 'Onvoldoende': return 'bg-orange-100 text-orange-800';
    case 'Voldoende': return 'bg-blue-100 text-blue-800';
    case 'Goed': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-600';
  }
}

export function Samenvatting({ samenvatting, besturenData, schoolRijen }: Props) {
  const { perSector } = samenvatting;

  // Bereken herstelcodes
  const herstelData = useMemo(() => {
    // School-niveau herstelcodes
    const schoolCodes = new Map<string, { code: string; naam: string; aantal: number }>();
    const scholenOnvoldoende = new Set<string>();
    const scholenZeerZwak = new Set<string>();

    for (const rij of schoolRijen) {
      if (rij.KwaliteitOnderwijs === 'Onvoldoende') scholenOnvoldoende.add(rij.BRIN);
      if (rij.KwaliteitOnderwijs === 'Zeer zwak') scholenZeerZwak.add(rij.BRIN);

      const code = rij.TypeOnderzoekCode;
      if (code && isHerstelCode(code, SCHOOL_HERSTEL_CODES)) {
        const bestaand = schoolCodes.get(code);
        if (bestaand) {
          bestaand.aantal++;
        } else {
          schoolCodes.set(code, { code, naam: rij.TypeOnderzoek, aantal: 1 });
        }
      }
    }

    // Bestuur-niveau herstelcodes (uit school-data)
    const bestuurCodes = new Map<string, { code: string; naam: string; aantal: number }>();
    for (const rij of schoolRijen) {
      const code = rij.TypeOnderzoekCode;
      if (code && isHerstelCode(code, BESTUUR_HERSTEL_CODES)) {
        const bestaand = bestuurCodes.get(code);
        if (bestaand) {
          bestaand.aantal++;
        } else {
          bestuurCodes.set(code, { code, naam: rij.TypeOnderzoek, aantal: 1 });
        }
      }
    }

    // Bestuur eindoordelen (uit BG-data)
    const eindoordelen = new Map<string, number>();
    for (const b of besturenData) {
      const eo = b.Eindoordeel;
      eindoordelen.set(eo, (eindoordelen.get(eo) ?? 0) + 1);
    }

    return {
      schoolCodes: Array.from(schoolCodes.values()).sort((a, b) => b.aantal - a.aantal),
      bestuurCodes: Array.from(bestuurCodes.values()).sort((a, b) => b.aantal - a.aantal),
      scholenOnvoldoende: scholenOnvoldoende.size,
      scholenZeerZwak: scholenZeerZwak.size,
      eindoordelen,
    };
  }, [schoolRijen, besturenData]);

  return (
    <div className="space-y-4">
      {/* Totalen */}
      <div className="grid grid-cols-5 gap-3">
        <Kaart titel="Scholen" waarde={samenvatting.uniekeBRIN} toelichting="Unieke BRIN-codes" kleur="text-blue-700" />
        <Kaart titel="Vestigingen" waarde={samenvatting.uniekeVestigingen} toelichting="BRIN + vestigingsnr" kleur="text-indigo-700" />
        <Kaart titel="Opleidingen" waarde={samenvatting.uniekeOpleidingen} toelichting="Unieke OVT-codes" kleur="text-purple-700" />
        <Kaart titel="Besturen" waarde={samenvatting.uniekeBesturen} toelichting="Unieke bestuursnummers" kleur="text-teal-700" />
        <Kaart titel="Onderzoeken" waarde={samenvatting.uniekeOnderzoeken} toelichting="Unieke onderzoeksnrs" kleur="text-orange-700" />
      </div>

      {/* Toelichting */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-xs text-blue-800 space-y-1">
        <div>
          <strong>Let op:</strong> Eén school (BRIN) kan meerdere vestigingen, opleidingen en onderzoeken hebben.
          Het totaal aantal rijen in de data is {samenvatting.totaalRijen.toLocaleString('nl-NL')}.
        </div>
        <div>
          <strong>Databronnen:</strong> Schoolgegevens komen uit PO/SO/VO-bestanden, bestuursgegevens (Eindoordeel, Financieel beheer) uit aparte BG-bestanden.
          Tellingen kunnen verschillen omdat niet elk bestuur in beide bronnen voorkomt.
        </div>
        <div>
          <strong>Scholen zonder bestuur:</strong> 288 scholen (veelal buitenlandse NTC-scholen) hebben geen bestuursnummer en zijn niet gekoppeld aan een bestuur.
          Daarnaast hebben 30 besturen wel scholen maar geen bestuursdata in de BG-bestanden.
        </div>
      </div>

      {/* Herstelopdrachten overzicht */}
      {schoolRijen.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {/* Schoolniveau */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Herstelopdrachten — schoolniveau
            </div>

            {/* Oordelen samenvatting */}
            <div className="flex gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 text-sm">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-400" />
                <strong>{herstelData.scholenOnvoldoende}</strong>
                <span className="text-gray-500">scholen onvoldoende</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
                <strong>{herstelData.scholenZeerZwak}</strong>
                <span className="text-gray-500">zeer zwak</span>
              </span>
            </div>

            {/* Herstelcodes */}
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Herstelcodes
            </div>
            <div className="space-y-1">
              {herstelData.schoolCodes.map(({ code, naam, aantal }) => (
                <HerstelCodeRij key={code} code={code} naam={naam} aantal={aantal} />
              ))}
              {herstelData.schoolCodes.length === 0 && (
                <div className="text-sm text-gray-400">Geen herstelcodes gevonden</div>
              )}
            </div>
          </div>

          {/* Bestuursniveau */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Herstelopdrachten — bestuursniveau
            </div>

            {/* Eindoordelen uit BG-data */}
            {besturenData.length > 0 && (
              <>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Eindoordeel besturen
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['Onvoldoende', 'Voldoende', 'Goed'].map(oordeel => {
                    const aantal = herstelData.eindoordelen.get(oordeel) ?? 0;
                    if (aantal === 0) return null;
                    return (
                      <span key={oordeel} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${oordeelKleur(oordeel)}`}>
                        {oordeel}: {aantal}
                      </span>
                    );
                  })}
                </div>
              </>
            )}

            {/* Bestuur-herstelcodes uit school-data */}
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Herstelcodes bestuur
            </div>
            <div className="space-y-1">
              {herstelData.bestuurCodes.map(({ code, naam, aantal }) => (
                <HerstelCodeRij key={code} code={code} naam={naam} aantal={aantal} />
              ))}
              {herstelData.bestuurCodes.length === 0 && (
                <div className="text-sm text-gray-400">Geen bestuursherstelcodes gevonden</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Per sector */}
      <div className="grid grid-cols-3 gap-4">
        {(['PO', 'SO', 'VO'] as const).map(sector => {
          const s = perSector[sector];
          return (
            <div key={sector} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {sector === 'PO' ? 'Primair onderwijs' : sector === 'SO' ? 'Speciaal onderwijs' : 'Voortgezet onderwijs'}
                {' '}({sector})
              </div>
              <div className="space-y-1.5">
                <TelRij label="Scholen" waarde={s.scholen} toelichting="unieke BRIN" />
                <TelRij label="Vestigingen" waarde={s.vestigingen} toelichting="BRIN+vest." />
                <TelRij label="Opleidingen" waarde={s.opleidingen} toelichting="unieke OVT" />
                <TelRij label="Besturen" waarde={s.besturen} />
                <TelRij label="Onderzoeken" waarde={s.onderzoeken} accent />
                <div className="border-t border-gray-100 pt-1.5 mt-1.5">
                  <TelRij label="Rijen in data" waarde={s.rijen} muted />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Kaart({ titel, waarde, toelichting, kleur }: {
  titel: string;
  waarde: number;
  toelichting: string;
  kleur: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
      <div className={`text-2xl font-bold ${kleur}`}>{waarde.toLocaleString('nl-NL')}</div>
      <div className="text-sm font-medium text-gray-700 mt-1">{titel}</div>
      <div className="text-xs text-gray-400 mt-0.5">{toelichting}</div>
    </div>
  );
}

function HerstelCodeRij({ code, naam, aantal }: { code: string; naam: string; aantal: number }) {
  const [toonUitleg, setToonUitleg] = useState(false);
  const uitleg = HERSTELCODE_TOELICHTING[code];

  return (
    <div className="border-b border-gray-50">
      <div
        className={`flex items-center justify-between text-sm py-1.5 ${uitleg ? 'cursor-pointer hover:bg-gray-50 -mx-1 px-1 rounded' : ''}`}
        onClick={() => uitleg && setToonUitleg(!toonUitleg)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded flex-shrink-0">
            {code}
          </span>
          <span className="text-gray-600 truncate text-xs" title={naam}>{naam}</span>
          {uitleg && <span className="text-gray-300 text-xs flex-shrink-0">{toonUitleg ? '▲' : 'ⓘ'}</span>}
        </div>
        <span className="font-semibold text-gray-900 ml-2 flex-shrink-0">{aantal}</span>
      </div>
      {toonUitleg && uitleg && (
        <div className="text-xs text-gray-500 pb-2 pl-1 leading-relaxed">
          {uitleg}
        </div>
      )}
    </div>
  );
}

function TelRij({ label, waarde, toelichting, accent, muted }: {
  label: string;
  waarde: number;
  toelichting?: string;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={muted ? 'text-gray-400' : 'text-gray-600'}>
        {label}
        {toelichting && <span className="text-xs text-gray-400 ml-1">({toelichting})</span>}
      </span>
      <span className={`font-medium ${accent ? 'text-orange-700' : muted ? 'text-gray-400' : 'text-gray-900'}`}>
        {waarde.toLocaleString('nl-NL')}
      </span>
    </div>
  );
}
