import { useState, useEffect } from 'react';
import { useInspectieData } from './hooks/useInspectieData';
import { BestandUpload } from './components/BestandUpload';
import { Samenvatting } from './components/Samenvatting';
import { Filters } from './components/Filters';
import { ResultatenTabel } from './components/ResultatenTabel';
import { BestuurOverzicht } from './components/BestuurOverzicht';
import { DetailModal } from './components/DetailModal';
import { FilterWizard } from './components/FilterWizard';
import { Legenda } from './components/Legenda';
import { exportNaarExcel, exportNaarPDF } from './utils/exportUtils';
import type { InspectieRij } from './types/inspectie';

type Weergave = 'tabel' | 'bestuur';

export default function App() {
  const {
    rijen,
    besturenData,
    besturenMap,
    samenvatting,
    filters,
    sortState,
    isLaden,
    fout,
    pagina,
    totaalPaginas,
    gefilterdeRijen,
    paginaRijen,
    uniekeTypeOnderzoeken,
    uniekeHerstelCodes,
    geladenBestanden,
    bronBestandenGeladen,
    laadBestanden,
    wisAlleData,
    updateFilter,
    resetFilters,
    updateSort,
    setPagina,
  } = useInspectieData();

  const [geselecteerdeRij, setGeselecteerdeRij] = useState<InspectieRij | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [legendaOpen, setLegendaOpen] = useState(false);
  const [weergave, setWeergave] = useState<Weergave>('tabel');
  const [exportFout, setExportFout] = useState<string | null>(null);
  const [devModus, setDevModus] = useState(false);

  // Developer modus: Ctrl+Shift+D
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setDevModus(prev => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Herstelopdrachten Overzicht
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Inspectie van het Onderwijs
            </p>
          </div>
          {devModus && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full border border-yellow-300">
              Developer modus
            </span>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Laden indicator bij bronbestanden */}
        {isLaden && !samenvatting && (
          <div className="text-center py-12">
            <div className="text-lg font-medium text-gray-700">Bronbestanden worden geladen...</div>
            <div className="mt-2 text-sm text-gray-500">
              {geladenBestanden.length > 0
                ? `${geladenBestanden.length} bestanden verwerkt, even geduld...`
                : 'Even geduld alstublieft'
              }
            </div>
            {geladenBestanden.length > 0 && (
              <div className="mt-3 max-w-xs mx-auto bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 rounded-full h-2 transition-all"
                  style={{ width: `${Math.min((geladenBestanden.length / 14) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Upload — alleen in dev modus OF als er geen bronbestanden zijn */}
        {!isLaden && !samenvatting && !bronBestandenGeladen && (
          devModus ? (
            <BestandUpload
              onBestanden={laadBestanden}
              isLaden={isLaden}
              geladenBestanden={geladenBestanden}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-lg font-medium">Geen bronbestanden beschikbaar</div>
              <div className="mt-2 text-sm">Neem contact op met de beheerder om bestanden toe te voegen.</div>
            </div>
          )
        )}

        {/* Dev modus: extra bestanden uploaden */}
        {devModus && samenvatting && (
          <details className="group">
            <summary className="cursor-pointer text-sm text-yellow-700 hover:text-yellow-900 list-none flex items-center gap-1">
              <span className="group-open:rotate-90 transition-transform">▶</span>
              [Dev] Bestanden toevoegen of vervangen ({geladenBestanden.length} geladen)
            </summary>
            <div className="mt-3 space-y-2">
              <BestandUpload
                onBestanden={laadBestanden}
                isLaden={isLaden}
                geladenBestanden={geladenBestanden}
              />
              <button
                onClick={wisAlleData}
                className="text-sm text-red-600 hover:text-red-800 hover:underline"
              >
                Alle data wissen en opnieuw beginnen
              </button>
            </div>
          </details>
        )}

        {/* Foutmelding */}
        {fout && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm whitespace-pre-line">
            {fout}
          </div>
        )}

        {/* Samenvatting + Content */}
        {samenvatting && (
          <>
            <Samenvatting samenvatting={samenvatting} besturenData={besturenData} schoolRijen={rijen} />

            {/* Filters + Content layout */}
            <div className="flex gap-6">
              {/* Sidebar */}
              <div className="w-72 flex-shrink-0 space-y-3">
                {/* Hulpknoppen */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setWizardOpen(true)}
                    className="flex-1 px-3 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>🧭</span> Filterhulp
                  </button>
                  <button
                    onClick={() => setLegendaOpen(true)}
                    className="flex-1 px-3 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>📖</span> Legenda
                  </button>
                </div>

                {/* Weergave toggle */}
                <div className="bg-white border border-gray-200 rounded-lg p-1 flex">
                  <button
                    onClick={() => setWeergave('tabel')}
                    className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                      weergave === 'tabel'
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Tabel
                  </button>
                  <button
                    onClick={() => setWeergave('bestuur')}
                    className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                      weergave === 'bestuur'
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Per bestuur
                  </button>
                </div>

                {/* Filters */}
                <Filters
                  filters={filters}
                  updateFilter={updateFilter}
                  resetFilters={resetFilters}
                  uniekeTypeOnderzoeken={uniekeTypeOnderzoeken}
                  uniekeHerstelCodes={uniekeHerstelCodes}
                  aantalResultaten={gefilterdeRijen.length}
                />
              </div>

              {/* Hoofdcontent */}
              <div className="flex-1 min-w-0 space-y-3">
                {exportFout && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm flex items-center justify-between">
                    <span>{exportFout}</span>
                    <button onClick={() => setExportFout(null)} aria-label="Melding sluiten" className="text-red-400 hover:text-red-600 ml-2">×</button>
                  </div>
                )}
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setExportFout(exportNaarExcel(gefilterdeRijen, filters))}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Exporteer Excel
                  </button>
                  <button
                    onClick={() => setExportFout(exportNaarPDF(gefilterdeRijen, filters))}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Exporteer PDF
                  </button>
                </div>

                {weergave === 'tabel' ? (
                  <ResultatenTabel
                    rijen={paginaRijen}
                    sortKolom={sortState.kolom}
                    sortRichting={sortState.richting}
                    onSort={updateSort}
                    onRijKlik={setGeselecteerdeRij}
                    pagina={pagina}
                    totaalPaginas={totaalPaginas}
                    onPaginaChange={setPagina}
                    totaalResultaten={gefilterdeRijen.length}
                  />
                ) : (
                  <BestuurOverzicht
                    rijen={gefilterdeRijen}
                    alleRijen={rijen}
                    besturenMap={besturenMap}
                    onRijKlik={setGeselecteerdeRij}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Legenda modal */}
      {legendaOpen && (
        <Legenda
          onSluiten={() => setLegendaOpen(false)}
          uniekeTypeOnderzoeken={uniekeTypeOnderzoeken}
        />
      )}

      {/* Filter wizard modal */}
      {wizardOpen && (
        <FilterWizard
          updateFilter={updateFilter}
          resetFilters={resetFilters}
          onSluiten={() => setWizardOpen(false)}
        />
      )}

      {/* Detail modal */}
      {geselecteerdeRij && (
        <DetailModal
          rij={geselecteerdeRij}
          onSluiten={() => setGeselecteerdeRij(null)}
        />
      )}
    </div>
  );
}
