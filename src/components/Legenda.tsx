import { useState } from 'react';
import { useEscapeToets } from '../hooks/useEscapeToets';
import {
  TYPE_ONDERZOEK_LEGENDA,
  CATEGORIE_INFO,
  OORDEEL_LEGENDA,
  STANDAARD_GROEP_LEGENDA,
} from '../utils/legenda';

interface Props {
  onSluiten: () => void;
  uniekeTypeOnderzoeken: string[];
}

type Tab = 'onderzoekstypen' | 'oordelen' | 'standaarden';

export function Legenda({ onSluiten, uniekeTypeOnderzoeken }: Props) {
  useEscapeToets(onSluiten);
  const [actieveTab, setActieveTab] = useState<Tab>('onderzoekstypen');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Legenda" onClick={onSluiten}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Legenda</h2>
            <p className="text-sm text-gray-500">Toelichting op onderzoekstypen, oordelen en standaarden</p>
          </div>
          <button
            onClick={onSluiten}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none px-2"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6 flex gap-0">
          {([
            { id: 'onderzoekstypen' as Tab, label: 'Onderzoekstypen' },
            { id: 'oordelen' as Tab, label: 'Oordelen' },
            { id: 'standaarden' as Tab, label: 'Standaarden' },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActieveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                actieveTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {actieveTab === 'onderzoekstypen' && (
            <OnderzoekstypenTab uniekeTypeOnderzoeken={uniekeTypeOnderzoeken} />
          )}
          {actieveTab === 'oordelen' && <OordelenTab />}
          {actieveTab === 'standaarden' && <StandaardenTab />}
        </div>
      </div>
    </div>
  );
}

function OnderzoekstypenTab({ uniekeTypeOnderzoeken }: { uniekeTypeOnderzoeken: string[] }) {
  // Groepeer per categorie
  const categorieën = ['herstelopdracht', 'kwaliteitsonderzoek', 'regulier', 'overig'] as const;

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        De Inspectie van het Onderwijs voert verschillende soorten onderzoeken uit.
        Hieronder staat uitgelegd wat elk type betekent en hoe het zich verhoudt tot herstelopdrachten.
      </p>

      {categorieën.map(cat => {
        const info = CATEGORIE_INFO[cat];
        if (!info) return null;

        // Items in deze categorie die ook in de data voorkomen
        const items = Object.entries(TYPE_ONDERZOEK_LEGENDA)
          .filter(([, item]) => item.categorie === cat);

        if (items.length === 0) return null;

        return (
          <div key={cat}>
            <div className={`rounded-lg border p-3 mb-3 ${info.kleur}`}>
              <div className="font-semibold text-sm">{info.label}</div>
              <div className="text-xs mt-0.5">{info.uitleg}</div>
            </div>

            <div className="space-y-3 pl-2">
              {items.map(([key, item]) => {
                const inData = uniekeTypeOnderzoeken.includes(key);
                return (
                  <div key={key} className={`border-l-2 pl-3 py-1 ${inData ? 'border-blue-400' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-sm text-gray-900">{item.naam}</div>
                      {inData && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                          in data
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{item.uitleg}</div>
                    {item.citoRelevant && (
                      <div className="text-xs text-green-700 bg-green-50 rounded px-2 py-1.5 mt-2">
                        <span className="font-semibold">Cito-aanbod:</span> {item.citoRelevant}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Types in data maar niet in legenda */}
      {(() => {
        const onbekend = uniekeTypeOnderzoeken.filter(t => !(t in TYPE_ONDERZOEK_LEGENDA));
        if (onbekend.length === 0) return null;
        return (
          <div>
            <div className="rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-800 p-3 mb-3">
              <div className="font-semibold text-sm">Overige typen in uw data</div>
              <div className="text-xs mt-0.5">
                Deze onderzoekstypen komen voor in de geladen bestanden maar hebben nog geen toelichting in de legenda.
              </div>
            </div>
            <div className="space-y-1 pl-2">
              {onbekend.map(type => (
                <div key={type} className="text-sm text-gray-700 border-l-2 border-yellow-300 pl-3 py-1">
                  {type}
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function OordelenTab() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Na een onderzoek geeft de Inspectie een oordeel over de kwaliteit van het onderwijs.
        Dit oordeel bepaalt of een school een herstelopdracht krijgt en welk toezicht volgt.
      </p>

      {/* Visueel overzicht: van zwaar naar licht */}
      <div className="space-y-3">
        {(['Zeer zwak', 'Onvoldoende', 'Voldoende', 'Goed', 'Basistoezicht', 'Geen eindoordeel']).map(oordeel => {
          const info = OORDEEL_LEGENDA[oordeel];
          if (!info) return null;
          return (
            <div key={oordeel} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className={`px-4 py-2 font-semibold text-sm ${info.kleur}`}>
                {oordeel}
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="text-sm text-gray-700">{info.uitleg}</div>
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Gevolg: </span>
                  <span className="text-gray-600">{info.gevolg}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Herstelopdracht flow */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="font-semibold text-sm text-gray-800 mb-2">Hoe werkt een herstelopdracht?</div>
        <div className="text-sm text-gray-600 space-y-2">
          <div className="flex gap-3">
            <span className="text-gray-400 font-mono text-xs mt-0.5">1.</span>
            <span>Inspectie constateert tekortkomingen → oordeel <strong>Onvoldoende</strong> of <strong>Zeer zwak</strong></span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-400 font-mono text-xs mt-0.5">2.</span>
            <span>School ontvangt een <strong>herstelopdracht</strong> met specifieke verbeterpunten en een termijn (1-2 jaar)</span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-400 font-mono text-xs mt-0.5">3.</span>
            <span>School voert een verbeterplan uit, eventueel met ondersteuning (bijv. Cito-analyses)</span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-400 font-mono text-xs mt-0.5">4.</span>
            <span>Inspectie voert een <strong>herstelonderzoek</strong> uit om te controleren of de verbeteringen zijn doorgevoerd</span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-400 font-mono text-xs mt-0.5">5.</span>
            <span>Bij voldoende herstel → terug naar basistoezicht. Bij onvoldoende → verscherpt toezicht / sancties</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StandaardenTab() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        De Inspectie beoordeelt scholen op meerdere standaarden, gegroepeerd in domeinen.
        Elke standaard krijgt een oordeel: Voldoende, Onvoldoende, Goed, of Niet beoordeeld.
      </p>

      {Object.entries(STANDAARD_GROEP_LEGENDA).map(([prefix, groep]) => (
        <div key={prefix} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
            <div className="font-semibold text-sm text-gray-900">{groep.naam} ({prefix})</div>
            <div className="text-xs text-gray-500 mt-0.5">{groep.uitleg}</div>
          </div>
          <div className="divide-y divide-gray-100">
            {Object.entries(groep.standaarden).map(([code, naam]) => (
              <div key={code} className="px-4 py-2 flex items-center gap-3">
                <span className="text-xs font-mono text-gray-400 w-8">{code}</span>
                <span className="text-sm text-gray-700">{naam}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
