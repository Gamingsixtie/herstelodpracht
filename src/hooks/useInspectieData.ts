import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { InspectieRij, DataSamenvatting, FilterState } from '../types/inspectie';
import { INITIAL_FILTER_STATE } from '../types/inspectie';
import { parseBestand, berekenSamenvatting } from '../utils/parser';
import { filterData, sorteerData } from '../utils/filters';

const STORAGE_KEY_FILTERS = 'inspectie_filters';
const STORAGE_KEY_BESTANDEN = 'inspectie_bestanden';
const STORAGE_KEY_WEERGAVE = 'inspectie_weergave';

function laadUitStorage<T>(key: string, fallback: T): T {
  try {
    const opgeslagen = localStorage.getItem(key);
    if (opgeslagen) return JSON.parse(opgeslagen) as T;
  } catch {
    // Bij fout: gebruik fallback
  }
  return fallback;
}

function slaOpInStorage(key: string, waarde: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(waarde));
  } catch {
    // localStorage vol of niet beschikbaar — negeer
  }
}

interface SortState {
  kolom: string;
  richting: 'asc' | 'desc';
}

export function useInspectieData() {
  const [rijen, setRijen] = useState<InspectieRij[]>([]);
  const [samenvatting, setSamenvatting] = useState<DataSamenvatting | null>(null);
  const [filters, setFilters] = useState<FilterState>(() =>
    laadUitStorage(STORAGE_KEY_FILTERS, INITIAL_FILTER_STATE)
  );
  const [sortState, setSortState] = useState<SortState>({ kolom: 'BRIN', richting: 'asc' });
  const [isLaden, setIsLaden] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [geladenBestanden, setGeladenBestanden] = useState<string[]>([]);
  const [bronBestandenGeladen, setBronBestandenGeladen] = useState(false);
  const rijenPerPagina = 50;
  const initRef = useRef(false);

  // Persisteer filters bij elke wijziging
  useEffect(() => {
    slaOpInStorage(STORAGE_KEY_FILTERS, filters);
  }, [filters]);

  // Persisteer bestandsnamen
  useEffect(() => {
    slaOpInStorage(STORAGE_KEY_BESTANDEN, geladenBestanden);
  }, [geladenBestanden]);

  // Laad ingebouwde bronbestanden bij app-start
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    async function laadBronBestanden() {
      try {
        const response = await fetch('./bronbestanden/manifest.json');
        if (!response.ok) return;

        const manifest = await response.json() as { bestanden: string[] };
        if (!manifest.bestanden || manifest.bestanden.length === 0) return;

        setIsLaden(true);
        const alleRijen: InspectieRij[] = [];
        const geladen: string[] = [];

        for (const bestandsnaam of manifest.bestanden) {
          try {
            const res = await fetch(`./bronbestanden/${bestandsnaam}`);
            if (!res.ok) continue;
            const buffer = await res.arrayBuffer();
            const result = parseBestand(buffer);
            alleRijen.push(...result.rijen);
            geladen.push(bestandsnaam);
          } catch {
            // Individueel bestand overslaan bij fout
          }
        }

        if (alleRijen.length > 0) {
          setRijen(alleRijen);
          setSamenvatting(berekenSamenvatting(alleRijen));
          setGeladenBestanden(geladen);
          setBronBestandenGeladen(true);
        }
      } catch {
        // Manifest niet gevonden = geen ingebouwde bestanden, dat is OK
      } finally {
        setIsLaden(false);
      }
    }

    laadBronBestanden();
  }, []);

  const laadBestanden = useCallback(async (files: File[]) => {
    setIsLaden(true);
    setFout(null);
    try {
      const nieuweRijen: InspectieRij[] = [];
      const fouten: string[] = [];

      for (const file of files) {
        try {
          const buffer = await file.arrayBuffer();
          const result = parseBestand(buffer);
          nieuweRijen.push(...result.rijen);
        } catch (e) {
          fouten.push(`${file.name}: ${e instanceof Error ? e.message : 'Onbekende fout'}`);
        }
      }

      if (fouten.length > 0 && nieuweRijen.length === 0) {
        setFout(`Geen bestanden konden worden geladen:\n${fouten.join('\n')}`);
        return;
      }

      if (fouten.length > 0) {
        setFout(`Sommige bestanden konden niet worden geladen:\n${fouten.join('\n')}`);
      }

      setRijen(prev => {
        const samengevoegd = [...prev, ...nieuweRijen];
        setSamenvatting(berekenSamenvatting(samengevoegd));
        return samengevoegd;
      });

      setGeladenBestanden(prev => [
        ...prev,
        ...files
          .filter(f => !fouten.some(fout => fout.startsWith(f.name + ':')))
          .map(f => f.name),
      ]);

      setPagina(1);
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'Er is een onbekende fout opgetreden.');
    } finally {
      setIsLaden(false);
    }
  }, []);

  const wisAlleData = useCallback(() => {
    setRijen([]);
    setSamenvatting(null);
    setGeladenBestanden([]);
    setFilters(INITIAL_FILTER_STATE);
    setFout(null);
    setPagina(1);
    setBronBestandenGeladen(false);
    localStorage.removeItem(STORAGE_KEY_FILTERS);
    localStorage.removeItem(STORAGE_KEY_BESTANDEN);
    localStorage.removeItem(STORAGE_KEY_WEERGAVE);
  }, []);

  const gefilterdeRijen = useMemo(
    () => filterData(rijen, filters),
    [rijen, filters]
  );

  const gesorteerdeRijen = useMemo(
    () => sorteerData(gefilterdeRijen, sortState.kolom, sortState.richting),
    [gefilterdeRijen, sortState]
  );

  const totaalPaginas = Math.ceil(gesorteerdeRijen.length / rijenPerPagina);
  const paginaRijen = useMemo(
    () => gesorteerdeRijen.slice((pagina - 1) * rijenPerPagina, pagina * rijenPerPagina),
    [gesorteerdeRijen, pagina, rijenPerPagina]
  );

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, waarde: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: waarde }));
    setPagina(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTER_STATE);
    setPagina(1);
  }, []);

  const updateSort = useCallback((kolom: string) => {
    setSortState(prev => ({
      kolom,
      richting: prev.kolom === kolom && prev.richting === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const uniekeTypeOnderzoeken = useMemo(
    () => [...new Set(rijen.map(r => r.TypeOnderzoek))].sort(),
    [rijen]
  );

  return {
    rijen,
    samenvatting,
    filters,
    sortState,
    isLaden,
    fout,
    pagina,
    totaalPaginas,
    rijenPerPagina,
    gefilterdeRijen,
    gesorteerdeRijen,
    paginaRijen,
    uniekeTypeOnderzoeken,
    geladenBestanden,
    bronBestandenGeladen,
    laadBestanden,
    wisAlleData,
    updateFilter,
    resetFilters,
    updateSort,
    setPagina,
  };
}
