import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { InspectieRij, FilterState } from '../types/inspectie';

/** Kolommen die in de tabel en exports getoond worden */
const EXPORT_KOLOMMEN = [
  { key: 'BRIN', label: 'BRIN' },
  { key: 'OVTNaam', label: 'Opleidingsnaam' },
  { key: 'Bestuursnaam', label: 'Bestuursnaam' },
  { key: 'Sector', label: 'Sector' },
  { key: 'TypeOnderzoek', label: 'Type onderzoek' },
  { key: 'KwaliteitOnderwijs', label: 'Kwaliteit onderwijs' },
  { key: 'Vaststellingsdatum', label: 'Vaststellingsdatum' },
];

function genereerBestandsnaam(filters: FilterState): string {
  const delen: string[] = ['Inspectie'];

  if (filters.sector.length > 0 && filters.sector.length <= 2) {
    delen.push(filters.sector.join('-'));
  }

  if (filters.kwaliteitOnderwijs.length === 1) {
    delen.push(filters.kwaliteitOnderwijs[0]!.replace(/\s+/g, '_'));
  }

  const datum = new Date().toISOString().slice(0, 10);
  delen.push(datum);

  return delen.join('_');
}

/**
 * Exporteer gefilterde data naar Excel (.xlsx).
 * Geeft null terug bij succes, of een foutmelding bij falen.
 */
export function exportNaarExcel(rijen: InspectieRij[], filters: FilterState): string | null {
  try {
    if (rijen.length === 0) {
      return 'Er zijn geen resultaten om te exporteren. Pas de filters aan.';
    }

    const headers = EXPORT_KOLOMMEN.map(k => k.label);
    const data = rijen.map(rij =>
      EXPORT_KOLOMMEN.map(k => rij[k.key] ?? '')
    );

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    ws['!cols'] = EXPORT_KOLOMMEN.map(k => ({
      wch: k.key === 'OVTNaam' || k.key === 'TypeOnderzoek' ? 40
        : k.key === 'Bestuursnaam' ? 30
        : 18,
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inspectiedata');

    const bestandsnaam = `${genereerBestandsnaam(filters)}.xlsx`;
    XLSX.writeFile(wb, bestandsnaam);
    return null;
  } catch (e) {
    return `Excel-export mislukt: ${e instanceof Error ? e.message : 'Onbekende fout'}`;
  }
}

/**
 * Exporteer gefilterde data naar PDF.
 * Geeft null terug bij succes, of een foutmelding bij falen.
 */
export function exportNaarPDF(rijen: InspectieRij[], filters: FilterState): string | null {
  try {
    if (rijen.length === 0) {
      return 'Er zijn geen resultaten om te exporteren. Pas de filters aan.';
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFontSize(14);
    doc.text('Herstelopdrachten Overzicht \u2014 Inspectie van het Onderwijs', 14, 15);

    doc.setFontSize(9);
    doc.text(`Gegenereerd: ${new Date().toLocaleDateString('nl-NL')} | ${rijen.length} resultaten`, 14, 22);

    const headers = EXPORT_KOLOMMEN.map(k => k.label);
    const data = rijen.map(rij =>
      EXPORT_KOLOMMEN.map(k => String(rij[k.key] ?? ''))
    );

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 27,
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: [31, 78, 121], fontSize: 7 },
      columnStyles: {
        1: { cellWidth: 50 },
        2: { cellWidth: 35 },
        4: { cellWidth: 45 },
      },
    });

    const bestandsnaam = `${genereerBestandsnaam(filters)}.pdf`;
    doc.save(bestandsnaam);
    return null;
  } catch (e) {
    return `PDF-export mislukt: ${e instanceof Error ? e.message : 'Onbekende fout'}`;
  }
}
