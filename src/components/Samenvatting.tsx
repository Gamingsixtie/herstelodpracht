import type { DataSamenvatting, BestuurRij } from '../types/inspectie';

interface Props {
  samenvatting: DataSamenvatting;
  besturenData: BestuurRij[];
}

export function Samenvatting({ samenvatting, besturenData }: Props) {
  const { perSector } = samenvatting;

  return (
    <div className="space-y-4">
      {/* Totalen — duidelijk onderscheid */}
      <div className="grid grid-cols-5 gap-3">
        <Kaart
          titel="Scholen"
          waarde={samenvatting.uniekeBRIN}
          toelichting="Unieke BRIN-codes"
          kleur="text-blue-700"
        />
        <Kaart
          titel="Vestigingen"
          waarde={samenvatting.uniekeVestigingen}
          toelichting="BRIN + vestigingsnr"
          kleur="text-indigo-700"
        />
        <Kaart
          titel="Opleidingen"
          waarde={samenvatting.uniekeOpleidingen}
          toelichting="Unieke OVT-codes"
          kleur="text-purple-700"
        />
        <Kaart
          titel="Besturen"
          waarde={samenvatting.uniekeBesturen}
          toelichting="Unieke bestuursnummers"
          kleur="text-teal-700"
        />
        <Kaart
          titel="Onderzoeken"
          waarde={samenvatting.uniekeOnderzoeken}
          toelichting="Unieke onderzoeksnrs"
          kleur="text-orange-700"
        />
      </div>

      {/* Toelichting */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-xs text-blue-800">
        <strong>Let op:</strong> Eén school (BRIN) kan meerdere vestigingen, opleidingen en onderzoeken hebben.
        Bijvoorbeeld: een VO-school met HAVO, VWO en VMBO telt als 1 school maar 3 opleidingen.
        Het totaal aantal rijen in de data is {samenvatting.totaalRijen.toLocaleString('nl-NL')}.
      </div>

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

      {/* Besturendata */}
      {besturenData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Bestuursgegevens (uit BG-bestanden)
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <span><strong className="text-gray-900">{besturenData.length}</strong> besturen met bestuursdata</span>
            <span>
              <strong className="text-gray-900">
                {besturenData.filter(b => b.FinancieelBeheer === 'Voldoende').length}
              </strong> financieel voldoende
            </span>
            <span>
              <strong className="text-gray-900">
                {besturenData.filter(b => b.FinancieelBeheer === 'Onvoldoende').length}
              </strong> financieel onvoldoende
            </span>
          </div>
        </div>
      )}
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
