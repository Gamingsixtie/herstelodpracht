import type { InspectieRij } from '../types/inspectie';


interface Props {
  rijen: InspectieRij[];
  sortKolom: string;
  sortRichting: 'asc' | 'desc';
  onSort: (kolom: string) => void;
  onRijKlik: (rij: InspectieRij) => void;
  pagina: number;
  totaalPaginas: number;
  onPaginaChange: (pagina: number) => void;
  totaalResultaten: number;
}

const KOLOMMEN = [
  { key: 'BRIN', label: 'BRIN', breedte: 'w-20' },
  { key: 'OVTNaam', label: 'Opleidingsnaam', breedte: 'w-52' },
  { key: 'Bestuursnaam', label: 'Bestuursnaam', breedte: 'w-44' },
  { key: 'Sector', label: 'Sector', breedte: 'w-16' },
  { key: 'TypeOnderzoek', label: 'Type onderzoek', breedte: 'w-52' },
  { key: 'KwaliteitOnderwijs', label: 'Kwaliteit onderwijs', breedte: 'w-36' },
  { key: 'Vaststellingsdatum', label: 'Vaststellingsdatum', breedte: 'w-32' },
];

function kwaliteitKleur(waarde: string): string {
  switch (waarde) {
    case 'Goed': return 'bg-green-100 text-green-800';
    case 'Voldoende': return 'bg-blue-100 text-blue-800';
    case 'Onvoldoende': return 'bg-orange-100 text-orange-800';
    case 'Zeer zwak': return 'bg-red-100 text-red-800';
    case 'Basistoezicht': return 'bg-purple-100 text-purple-800';
    case 'Geen eindoordeel': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-600';
  }
}

export function ResultatenTabel({
  rijen, sortKolom, sortRichting, onSort, onRijKlik,
  pagina, totaalPaginas, onPaginaChange, totaalResultaten,
}: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header met telling */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {totaalResultaten.toLocaleString('nl-NL')} resultaten
        </span>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {KOLOMMEN.map(kolom => (
                <th
                  key={kolom.key}
                  onClick={() => onSort(kolom.key)}
                  className={`px-3 py-2.5 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none ${kolom.breedte}`}
                >
                  {kolom.label}
                  {sortKolom === kolom.key && (
                    <span className="ml-1 text-blue-600">
                      {sortRichting === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rijen.length === 0 ? (
              <tr>
                <td colSpan={KOLOMMEN.length} className="px-4 py-8 text-center text-gray-500">
                  Geen resultaten gevonden voor de huidige filters.
                </td>
              </tr>
            ) : (
              rijen.map((rij, index) => (
                <tr
                  key={`${rij.OVT}-${rij.Onderzoeksnummer}-${index}`}
                  onClick={() => onRijKlik(rij)}
                  className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-3 py-2 font-mono text-xs">{rij.BRIN}</td>
                  <td className="px-3 py-2 truncate max-w-xs" title={rij.OVTNaam}>{rij.OVTNaam}</td>
                  <td className="px-3 py-2 truncate max-w-xs" title={rij.Bestuursnaam}>{rij.Bestuursnaam}</td>
                  <td className="px-3 py-2">{rij.Sector}</td>
                  <td className="px-3 py-2 truncate max-w-xs" title={rij.TypeOnderzoek}>{rij.TypeOnderzoek}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${kwaliteitKleur(rij.KwaliteitOnderwijs)}`}>
                      {rij.KwaliteitOnderwijs}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-600">{rij.Vaststellingsdatum}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginering */}
      {totaalPaginas > 1 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Pagina {pagina} van {totaalPaginas}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => onPaginaChange(1)}
              disabled={pagina === 1}
              className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ««
            </button>
            <button
              onClick={() => onPaginaChange(pagina - 1)}
              disabled={pagina === 1}
              className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              «
            </button>
            <button
              onClick={() => onPaginaChange(pagina + 1)}
              disabled={pagina === totaalPaginas}
              className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              »
            </button>
            <button
              onClick={() => onPaginaChange(totaalPaginas)}
              disabled={pagina === totaalPaginas}
              className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              »»
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
