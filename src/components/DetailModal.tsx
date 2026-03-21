import type { InspectieRij } from '../types/inspectie';
import { TYPE_OVT_LABELS } from '../types/inspectie';

interface Props {
  rij: InspectieRij;
  onSluiten: () => void;
}

/** Standaard-kolom groepen */
const STANDAARD_GROEPEN: { naam: string; prefix: string }[] = [
  { naam: 'Onderwijsproces (OP)', prefix: 'OP' },
  { naam: 'Schoolklimaat (SK)', prefix: 'SK' },
  { naam: 'Veiligheid & Schoolklimaat (VS)', prefix: 'VS' },
  { naam: 'Kwaliteitszorg (KA)', prefix: 'KA' },
  { naam: 'Kwaliteitscultuur (KC)', prefix: 'KC' },
  { naam: 'Financieel beheer (FB)', prefix: 'FB' },
  { naam: 'Basiskwaliteit (BA)', prefix: 'BA' },
];

function kwaliteitKleur(waarde: string): string {
  switch (waarde) {
    case 'Goed': return 'text-green-700 bg-green-50';
    case 'Voldoende': return 'text-blue-700 bg-blue-50';
    case 'Onvoldoende': return 'text-orange-700 bg-orange-50';
    case 'Zeer zwak': return 'text-red-700 bg-red-50';
    case 'Basistoezicht': return 'text-purple-700 bg-purple-50';
    default: return 'text-gray-500 bg-gray-50';
  }
}

export function DetailModal({ rij, onSluiten }: Props) {
  // Verzamel standaard-oordelen per groep
  const standaardGroepen = STANDAARD_GROEPEN.map(groep => {
    const oordelen = Object.entries(rij)
      .filter(([key]) => key.startsWith(groep.prefix) && /^[A-Z]{2}\d/.test(key))
      .filter(([, value]) => value !== 'Niet beoordeeld' && value != null && value !== '')
      .map(([key, value]) => ({ key, value: String(value) }));
    return { ...groep, oordelen };
  }).filter(g => g.oordelen.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onSluiten}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{rij.OVTNaam}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              BRIN: {rij.BRIN} | Vestiging: {rij.Vestiging}
            </p>
          </div>
          <button
            onClick={onSluiten}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none px-2"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-6">
          {/* Identificatie */}
          <Sectie titel="Identificatie">
            <InfoRij label="BRIN-code" waarde={rij.BRIN} />
            <InfoRij label="Vestigingsnummer" waarde={rij.Vestiging} />
            <InfoRij label="OVT" waarde={rij.OVT} />
            <InfoRij label="Opleidingsnaam" waarde={rij.OVTNaam} />
            <InfoRij label="Type" waarde={TYPE_OVT_LABELS[rij.TypeOVT] ?? rij.TypeOVT} />
            <InfoRij label="Sector" waarde={rij.Sector} />
            <InfoRij label="Elementtype" waarde={rij.Elementtype} />
          </Sectie>

          {/* Bestuur */}
          <Sectie titel="Bestuur">
            <InfoRij label="Bestuursnummer" waarde={String(rij.Bestuursnummer)} />
            <InfoRij label="Bestuursnaam" waarde={rij.Bestuursnaam} />
          </Sectie>

          {/* Onderzoek */}
          <Sectie titel="Onderzoek">
            <InfoRij label="Type onderzoek" waarde={rij.TypeOnderzoek} />
            <InfoRij label="Onderzoekscode" waarde={rij.TypeOnderzoekCode} />
            <InfoRij label="Onderzoeksnummer" waarde={rij.Onderzoeksnummer} />
            <InfoRij label="Vaststellingsdatum" waarde={rij.Vaststellingsdatum} />
            <InfoRij label="Publicatiedatum" waarde={rij.Publicatiedatum} />
            <InfoRij label="Peildatum" waarde={rij.Peildatum} />
            <div className="flex items-center justify-between py-1.5">
              <span className="text-sm text-gray-600">Kwaliteit onderwijs</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${kwaliteitKleur(rij.KwaliteitOnderwijs)}`}>
                {rij.KwaliteitOnderwijs}
              </span>
            </div>
          </Sectie>

          {/* Standaard-oordelen */}
          {standaardGroepen.length > 0 && (
            <Sectie titel="Standaard-oordelen">
              {standaardGroepen.map(groep => (
                <div key={groep.prefix} className="mb-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    {groep.naam}
                  </div>
                  {groep.oordelen.map(({ key, value }) => (
                    <div key={key} className="flex items-center justify-between py-1 pl-3">
                      <span className="text-sm text-gray-600">{key}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${kwaliteitKleur(value)}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </Sectie>
          )}
        </div>
      </div>
    </div>
  );
}

function Sectie({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-1 mb-2">{titel}</h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function InfoRij({ label, waarde }: { label: string; waarde: string }) {
  if (!waarde) return null;
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{waarde}</span>
    </div>
  );
}
