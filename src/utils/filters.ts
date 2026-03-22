import type { InspectieRij, FilterState } from '../types/inspectie';

/**
 * Pas alle actieve filters toe op de dataset (AND-logica).
 */
export function filterData(rijen: InspectieRij[], filters: FilterState): InspectieRij[] {
  return rijen.filter(rij => {
    // Sector filter
    if (filters.sector.length > 0 && !filters.sector.includes(rij.Sector)) {
      return false;
    }

    // Bestuur zoekfilter
    if (filters.bestuurZoek) {
      const zoek = filters.bestuurZoek.toLowerCase();
      const naamMatch = rij.Bestuursnaam.toLowerCase().includes(zoek);
      const nummerMatch = String(rij.Bestuursnummer).includes(zoek);
      if (!naamMatch && !nummerMatch) return false;
    }

    // School zoekfilter
    if (filters.schoolZoek) {
      const zoek = filters.schoolZoek.toLowerCase();
      const brinMatch = rij.BRIN.toLowerCase().includes(zoek);
      const naamMatch = rij.OVTNaam.toLowerCase().includes(zoek);
      if (!brinMatch && !naamMatch) return false;
    }

    // KwaliteitOnderwijs multiselect
    if (filters.kwaliteitOnderwijs.length > 0 && !filters.kwaliteitOnderwijs.includes(rij.KwaliteitOnderwijs)) {
      return false;
    }

    // TypeOnderzoek multiselect
    if (filters.typeOnderzoek.length > 0 && !filters.typeOnderzoek.includes(rij.TypeOnderzoek)) {
      return false;
    }

    // Herstelcode filter (TypeOnderzoekCode)
    if (filters.herstelCode.length > 0 && !filters.herstelCode.includes(rij.TypeOnderzoekCode)) {
      return false;
    }

    // Datumrange op Vaststellingsdatum
    if (filters.datumVan) {
      const vanGetal = datumStringNaarGetal(filters.datumVan);
      if (vanGetal && rij._vaststellingsdatumRaw !== 0 && rij._vaststellingsdatumRaw < vanGetal) return false;
    }
    if (filters.datumTot) {
      const totGetal = datumStringNaarGetal(filters.datumTot);
      if (totGetal && rij._vaststellingsdatumRaw !== 0 && rij._vaststellingsdatumRaw > totGetal) return false;
    }

    return true;
  });
}

/**
 * Converteer DD-MM-YYYY string naar YYYYMMDD getal voor vergelijking.
 */
function datumStringNaarGetal(datum: string): number {
  // Accepteer zowel DD-MM-YYYY als YYYY-MM-DD (HTML date input)
  if (datum.includes('-')) {
    const delen = datum.split('-');
    if (delen.length === 3) {
      if (delen[0]!.length === 4) {
        // YYYY-MM-DD formaat (van HTML date input)
        return Number(`${delen[0]}${delen[1]}${delen[2]}`);
      } else {
        // DD-MM-YYYY formaat
        return Number(`${delen[2]}${delen[1]}${delen[0]}`);
      }
    }
  }
  return 0;
}

/**
 * Sorteer rijen op een kolom.
 */
export function sorteerData(
  rijen: InspectieRij[],
  kolom: string,
  richting: 'asc' | 'desc'
): InspectieRij[] {
  const sorted = [...rijen].sort((a, b) => {
    let waardA = kolom === 'Vaststellingsdatum' ? a._vaststellingsdatumRaw : a[kolom];
    let waardB = kolom === 'Vaststellingsdatum' ? b._vaststellingsdatumRaw : b[kolom];

    if (waardA == null) waardA = '';
    if (waardB == null) waardB = '';

    if (typeof waardA === 'number' && typeof waardB === 'number') {
      return waardA - waardB;
    }

    return String(waardA).localeCompare(String(waardB), 'nl');
  });

  return richting === 'desc' ? sorted.reverse() : sorted;
}
