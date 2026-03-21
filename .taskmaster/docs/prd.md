# PRD: Herstelopdrachten Overzicht

**Author:** Claude (AI-gegenereerd)
**Date:** 2026-03-21
**Status:** Draft
**Version:** 1.0
**Taskmaster Optimized:** Yes

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Goals & Success Metrics](#goals--success-metrics)
4. [User Stories](#user-stories)
5. [Functional Requirements](#functional-requirements)
6. [Non-Functional Requirements](#non-functional-requirements)
7. [Technical Considerations](#technical-considerations)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Out of Scope](#out-of-scope)
10. [Open Questions & Risks](#open-questions--risks)
11. [Validation Checkpoints](#validation-checkpoints)
12. [Appendix: Task Breakdown Hints](#appendix-task-breakdown-hints)

---

## Executive Summary

Ambtenaren bij het ministerie van Onderwijs werken met ODS/Excel-bestanden van de Onderwijsinspectie (62 kolommen, ~11.000 rijen) maar missen een effectief hulpmiddel om deze data te doorzoeken en analyseren. We bouwen een client-side webapp (React + Vite) die inspectiebestanden inleest, transformeert tot een doorzoekbaar overzicht van oordelen per school, bestuur en onderzoekstype, en export naar Excel/PDF ondersteunt. Alle data blijft client-side — er wordt geen privacy-gevoelige onderwijsdata opgeslagen op een server.

---

## Problem Statement

### Current Situation
Een klein team (2-5 personen) bij het ministerie moet handmatig door grote ODS/Excel-bestanden van de Onderwijsinspectie navigeren om oordelen per school of bestuur te vinden. Het bronbestand bevat 62 kolommen en ~11.431 rijen, wat navigatie in een spreadsheetprogramma onpraktisch maakt.

### User Impact
- **Who is affected:** Ambtenaren bij het ministerie van Onderwijs (2-5 personen)
- **How they're affected:** Tijdverlies bij het zoeken naar specifieke scholen, besturen of onderzoekstypen. Moeilijk om patronen te herkennen of gefilterde overzichten te maken voor rapportages.
- **Severity:** High — dit is hun dagelijkse werkproces

### Business Impact
- **Cost of problem:** Uren handmatig zoekwerk per week per medewerker
- **Opportunity cost:** Geen snelle inzichten in welke scholen herstelonderzoeken hebben, welke besturen aandacht nodig hebben
- **Strategic importance:** Directe ondersteuning van het toezichtproces op onderwijskwaliteit

### Why Solve This Now?
Het inspectiebestand is beschikbaar en het team heeft een concreet werkproces dat geoptimaliseerd kan worden. Een eenvoudige client-side webapp lost het probleem op zonder infrastructuurkosten of privacy-risico's.

---

## Goals & Success Metrics

### Goal 1: Snelle toegang tot inspectiedata
- **Description:** Gebruikers kunnen binnen seconden een school, bestuur of onderzoekstype vinden
- **Metric:** Tijd van bestand uploaden tot eerste gefilterd resultaat
- **Baseline:** Handmatig zoeken in Excel: 2-5 minuten per zoekopdracht
- **Target:** < 10 seconden na upload
- **Timeframe:** Direct na oplevering
- **Measurement Method:** Gebruikerstest met het echte bestand (11.431 rijen)

### Goal 2: Bruikbare exports voor rapportages
- **Description:** Gefilterde data kan geexporteerd worden naar Excel of PDF
- **Metric:** Export bevat dezelfde kolommen en filters als de UI toont
- **Baseline:** Handmatig kopieren/plakken uit Excel
- **Target:** 1-klik export naar Excel (.xlsx) of PDF
- **Timeframe:** Direct na oplevering
- **Measurement Method:** Export validatie met gefilterde datasets

### Goal 3: Overzicht per sector
- **Description:** Directe samenvatting bij upload: aantal scholen, besturen, onderzoeken per sector (PO/SO/VO)
- **Metric:** Samenvatting wordt automatisch getoond na upload
- **Baseline:** Handmatig tellen in spreadsheet
- **Target:** Automatische samenvatting binnen 2 seconden na parsing
- **Timeframe:** Direct na oplevering
- **Measurement Method:** Functionele test

---

## User Stories

### Story 1: Bestand uploaden en samenvatting zien

**As a** ambtenaar bij het ministerie,
**I want to** een ODS of Excel-bestand van de Inspectie uploaden,
**So that I can** direct een overzicht zien van het aantal scholen, besturen en onderzoeken per sector.

**Acceptance Criteria:**
- [ ] Gebruiker kan een ODS- of XLSX-bestand uploaden via drag-and-drop of bestandskiezer
- [ ] Na upload wordt een samenvatting getoond: "X scholen, Y besturen, Z onderzoeken" per sector (PO/SO/VO)
- [ ] Bestanden tot 11.500 rijen worden binnen 5 seconden geparsed
- [ ] Bij ongeldig bestandsformaat wordt een duidelijke foutmelding in het Nederlands getoond
- [ ] Geen data wordt naar een server verzonden — alles blijft client-side

**Task Breakdown Hint:**
- Task 1.1: Bestand upload component (drag-and-drop + bestandskiezer) (~3 uur)
- Task 1.2: ODS/XLSX parser met SheetJS (~4 uur)
- Task 1.3: Data normalisatie en samenvatting berekening (~3 uur)
- Task 1.4: Samenvatting UI component (~2 uur)

**Dependencies:** None

---

### Story 2: Filteren en doorzoeken van inspectiedata

**As a** ambtenaar,
**I want to** de inspectiedata filteren op sector, bestuur, school, oordeel, onderzoekstype en datum,
**So that I can** snel de informatie vinden die ik nodig heb.

**Acceptance Criteria:**
- [ ] Sector (PO/SO/VO) als primaire filter — altijd zichtbaar
- [ ] Zoeken op bestuursnaam of bestuursnummer
- [ ] Zoeken op BRIN-code of opleidingsnaam (OVTNaam)
- [ ] Multiselect filter op KwaliteitOnderwijs (6 waarden: Voldoende, Onvoldoende, Goed, Zeer zwak, Basistoezicht, Geen eindoordeel)
- [ ] Multiselect filter op TypeOnderzoek (39 types, top-5 gegroepeerd)
- [ ] Datumrange filter op Vaststellingsdatum
- [ ] Filters zijn combineerbaar (AND-logica)
- [ ] Resultaten tonen directe aantallen bij actieve filters

**Task Breakdown Hint:**
- Task 2.1: Filter state management met React context/hooks (~4 uur)
- Task 2.2: Sector filter component (~2 uur)
- Task 2.3: Zoekcomponent voor bestuur en school (~3 uur)
- Task 2.4: Multiselect filter voor KwaliteitOnderwijs (~3 uur)
- Task 2.5: Multiselect filter voor TypeOnderzoek met groepering (~4 uur)
- Task 2.6: Datumrange picker voor Vaststellingsdatum (~3 uur)
- Task 2.7: Filter combinatie logica en resultaat telling (~3 uur)

**Dependencies:** Story 1 (data moet geparsed zijn)

---

### Story 3: Resultaten tabel bekijken

**As a** ambtenaar,
**I want to** de gefilterde resultaten in een overzichtelijke tabel zien,
**So that I can** snel oordelen per school of bestuur vergelijken.

**Acceptance Criteria:**
- [ ] Tabel toont relevante kolommen: BRIN, OVTNaam, Bestuursnaam, Sector, TypeOnderzoek, KwaliteitOnderwijs, Vaststellingsdatum
- [ ] Kolommen zijn sorteerbaar (klik op kolomkop)
- [ ] "Geen eindoordeel" (74% van rijen) wordt als neutrale status getoond, niet als fout/waarschuwing
- [ ] Datums worden weergegeven als DD-MM-YYYY
- [ ] TypeOVT codes tonen volledige naam (BAS=Basisschool, VOS=Voortgezet onderwijs, SPEC=Speciaal onderwijs)
- [ ] Paginering of virtueel scrollen voor grote datasets
- [ ] Rijen groepeerbaar op BRIN+Vestiging

**Task Breakdown Hint:**
- Task 3.1: Tabel component met kolom configuratie (~4 uur)
- Task 3.2: Sortering functionaliteit (~2 uur)
- Task 3.3: Paginering of virtueel scrollen (~3 uur)
- Task 3.4: Status kleuren en labels voor oordelen (~2 uur)
- Task 3.5: TypeOVT en datum formattering (~2 uur)

**Dependencies:** Story 1 en 2

---

### Story 4: Detail-view per school/onderzoek

**As a** ambtenaar,
**I want to** doorklikken op een rij om alle details te zien inclusief standaard-oordelen,
**So that I can** het volledige beeld van een onderzoek bekijken.

**Acceptance Criteria:**
- [ ] Klik op een tabelrij opent een detail-view (modal of side panel)
- [ ] Detail-view toont alle 62 kolommen van het bronbestand
- [ ] Standaard-kolommen (OP1-OP8, SK1-SK2, VS1-VS2, etc.) worden overzichtelijk getoond
- [ ] NaN-waarden in standaard-kolommen worden getoond als "Niet beoordeeld" of verborgen
- [ ] Alle oordelen in het detail-view zijn niet-bewerkbaar (alleen-lezen)

**Task Breakdown Hint:**
- Task 4.1: Detail modal/panel component (~3 uur)
- Task 4.2: Standaard-oordelen weergave met NaN-handling (~3 uur)
- Task 4.3: Layout en styling detail-view (~2 uur)

**Dependencies:** Story 3

---

### Story 5: Exporteren naar Excel en PDF

**As a** ambtenaar,
**I want to** de gefilterde tabel exporteren naar Excel of PDF,
**So that I can** de resultaten delen met collega's of opnemen in rapportages.

**Acceptance Criteria:**
- [ ] Export knop voor Excel (.xlsx) en PDF
- [ ] Export bevat exact dezelfde kolommen en rijen als de huidige gefilterde weergave
- [ ] Excel-export behoudt Nederlandse kolomnamen
- [ ] PDF-export is leesbaar geformateerd (landscape, passende kolombreedte)
- [ ] Bestandsnaam bevat datum en actieve filters (bijv. "Inspectie_PO_Voldoende_2026-03-21.xlsx")

**Task Breakdown Hint:**
- Task 5.1: Excel export met SheetJS (~3 uur)
- Task 5.2: PDF export met jsPDF of pdfmake (~4 uur)
- Task 5.3: Dynamische bestandsnaam generatie (~1 uur)

**Dependencies:** Story 2 en 3

---

## Functional Requirements

### Must Have (P0) - Critical for Launch

#### REQ-001: Bestandsupload en parsing
**Description:** Systeem moet ODS- en XLSX-bestanden kunnen inlezen en parsen naar een bruikbare datastructuur.

**Acceptance Criteria:**
- [ ] Ondersteunt ODS (OpenDocument Spreadsheet) formaat
- [ ] Ondersteunt XLSX (Excel) formaat
- [ ] Parst bestanden tot 15.000 rijen zonder performance problemen
- [ ] Herkent en valideert verwachte kolommen (BRIN, Bestuursnummer, etc.)
- [ ] Geeft duidelijke foutmelding bij ontbrekende verplichte kolommen

**Technical Specification:**
```typescript
// Gebruik SheetJS (xlsx) library voor parsing
import * as XLSX from 'xlsx';

interface InspectieRij {
  BRIN: string;
  Vestiging: string;
  OVT: string;
  OVTNaam: string;
  Bestuursnummer: number;
  Bestuursnaam: string;
  Sector: 'PO' | 'SO' | 'VO';
  TypeOVT: string;
  Elementtype: string;
  TypeOnderzoek: string;
  TypeOnderzoekCode: string;
  Onderzoeksnummer: string;
  KwaliteitOnderwijs: string;
  Vaststellingsdatum: number; // YYYYMMDD als getal
  Publicatiedatum: number;   // YYYYMMDD als getal
  Peildatum: string;         // DD-MM-YYYY als string
  // + standaard kolommen (OP1-BA2)
  [key: string]: string | number | null;
}
```

**Task Breakdown:**
- Implementeer ODS/XLSX parser: Medium (4h)
- Data validatie en kolom mapping: Small (3h)
- Error handling en foutmeldingen (NL): Small (2h)

**Dependencies:** None

---

#### REQ-002: Data normalisatie
**Description:** Ruwe data uit het bronbestand moet genormaliseerd worden voor weergave.

**Acceptance Criteria:**
- [ ] Vaststellingsdatum (getal YYYYMMDD) → DD-MM-YYYY string
- [ ] Publicatiedatum (getal YYYYMMDD) → DD-MM-YYYY string
- [ ] Peildatum (string DD-MM-YYYY) → ongewijzigd
- [ ] TypeOVT codes → volledige namen (BAS=Basisschool, VOS=Voortgezet onderwijs, SPEC=Speciaal onderwijs, etc.)
- [ ] NaN/lege waarden in standaard-kolommen → "Niet beoordeeld"
- [ ] Bestuursnummer als primaire key voor bestuur (niet Bestuursnaam)
- [ ] BRIN als primaire identifier voor school (niet schoolnaam)

**Task Breakdown:**
- Datum conversie functies: Small (2h)
- TypeOVT mapping: Small (1h)
- NaN/null handling: Small (1h)

**Dependencies:** REQ-001

---

#### REQ-003: Filtersysteem
**Description:** Uitgebreid filtersysteem met combineerbare filters.

**Acceptance Criteria:**
- [ ] Sector filter (PO/SO/VO) — altijd zichtbaar, primaire filter
- [ ] Bestuur zoekfilter: zoeken op bestuursnaam of bestuursnummer
- [ ] School zoekfilter: zoeken op BRIN of OVTNaam
- [ ] KwaliteitOnderwijs multiselect: Voldoende, Onvoldoende, Goed, Zeer zwak, Basistoezicht, Geen eindoordeel
- [ ] TypeOnderzoek multiselect: 39 types, top-5 gegroepeerd (Stelselonderzoek, Herstelonderzoek school/opleiding, Kwaliteitsonderzoek naar aanleiding van risico's, Kwaliteitsonderzoek goede school, Onderzoek kwaliteitsverbetering)
- [ ] Datumrange op Vaststellingsdatum
- [ ] Alle filters AND-combineerbaar
- [ ] Filter reset knop

**Task Breakdown:**
- Filter state management: Medium (4h)
- Sector filter: Small (2h)
- Zoekfilters (bestuur + school): Small (3h)
- Multiselect filters: Medium (6h)
- Datumrange filter: Small (3h)
- Filter combinatie logica: Small (3h)

**Dependencies:** REQ-001, REQ-002

---

#### REQ-004: Resultaten tabel
**Description:** Overzichtelijke, sorteerbare tabel voor gefilterde resultaten.

**Acceptance Criteria:**
- [ ] Kolommen: BRIN, OVTNaam, Bestuursnaam, Sector, TypeOnderzoek, KwaliteitOnderwijs, Vaststellingsdatum
- [ ] Alle kolommen sorteerbaar
- [ ] Paginering (50 rijen per pagina) of virtueel scrollen
- [ ] "Geen eindoordeel" als neutrale status (geen fout-styling)
- [ ] Responsive layout
- [ ] Resultaat telling ("X resultaten gevonden")

**Task Breakdown:**
- Tabel component: Medium (4h)
- Sortering: Small (2h)
- Paginering: Small (3h)
- Status styling: Small (2h)

**Dependencies:** REQ-003

---

#### REQ-005: Export functionaliteit
**Description:** Gefilterde data exporteren naar Excel en PDF.

**Acceptance Criteria:**
- [ ] Excel (.xlsx) export met Nederlandse kolomnamen
- [ ] PDF export in landscape formaat
- [ ] Export bevat exact de gefilterde data
- [ ] Dynamische bestandsnaam met datum en filters

**Task Breakdown:**
- Excel export (SheetJS): Small (3h)
- PDF export (jsPDF/pdfmake): Medium (4h)
- Bestandsnaam logica: Small (1h)

**Dependencies:** REQ-003, REQ-004

---

### Should Have (P1) - Important but Not Blocking

#### REQ-006: Detail-view
**Description:** Gedetailleerde weergave van een individueel onderzoek met alle standaard-oordelen.

**Acceptance Criteria:**
- [ ] Modal of side panel bij klik op tabelrij
- [ ] Toont alle 62 kolommen
- [ ] Standaard-oordelen (OP1-BA2) overzichtelijk gegroepeerd
- [ ] NaN als "Niet beoordeeld"

**Task Breakdown:**
- Detail component: Medium (5h)
- Standaard groepering: Small (3h)

**Dependencies:** REQ-004

---

#### REQ-007: Upload samenvatting
**Description:** Directe samenvatting na bestandsupload.

**Acceptance Criteria:**
- [ ] Toont totaal aantal scholen, besturen, onderzoeken
- [ ] Opgesplitst per sector (PO/SO/VO)
- [ ] Visueel aantrekkelijke dashboard-achtige weergave

**Task Breakdown:**
- Samenvatting berekening: Small (2h)
- Dashboard component: Small (3h)

**Dependencies:** REQ-001

---

### Nice to Have (P2) - Future Enhancement

#### REQ-008: Geavanceerde visualisaties
**Description:** Grafieken en diagrammen voor inspectiedata.

**Acceptance Criteria:**
- [ ] Taartdiagram KwaliteitOnderwijs verdeling
- [ ] Staafdiagram per sector
- [ ] Trendlijn per datum

**Task Breakdown:**
- Chart library integratie: Medium (4h)
- Chart componenten: Medium (6h)

**Dependencies:** REQ-001, REQ-002

---

## Non-Functional Requirements

### Performance
- **Bestand parsing:** < 5 seconden voor 11.500 rijen ODS-bestand
- **Filter toepassing:** < 200ms responstijd na filter wijziging
- **Tabel rendering:** Vloeiend scrollen bij 11.500 rijen (virtualisatie of paginering)
- **Export generatie:** < 10 seconden voor volledige dataset als Excel

### Security
- **Geen server-side opslag:** Alle data blijft in de browser (client-side)
- **Geen externe API-calls:** Data verlaat nooit het apparaat van de gebruiker
- **Geen tracking/analytics:** Privacy-gevoelige onderwijsdata
- **Content Security Policy:** Strikte CSP headers in productie

### Compatibility
- **Browsers:** Chrome (laatste 2 versies), Firefox (laatste 2 versies), Edge (laatste 2 versies)
- **Desktop only:** Geen mobiele ondersteuning vereist (desktop-werkplek ambtenaren)
- **Bestandsformaten:** ODS (OpenDocument), XLSX (Excel)

### Accessibility
- **Taalvereiste:** Alle UI-tekst in het Nederlands
- **Contrast:** Voldoende kleurcontrast voor leesbaarheid
- **Keyboard:** Basis keyboard navigatie

### Reliability
- **Offline capable:** Na laden van de app werkt alles zonder internet
- **Foutafhandeling:** Duidelijke Nederlandse foutmeldingen
- **Data integriteit:** Brondata wordt nooit gewijzigd — alleen gelezen en getransformeerd

---

## Technical Considerations

### System Architecture

**Proposed Architecture:** Pure client-side Single Page Application (SPA)

```
┌─────────────────────────────────────────────────────┐
│                    Browser                           │
│                                                     │
│  ┌─────────┐    ┌──────────────┐    ┌────────────┐ │
│  │ Upload  │───>│  Parser      │───>│  Data      │ │
│  │ (ODS/   │    │  (SheetJS)   │    │  Store     │ │
│  │  XLSX)  │    │              │    │  (Memory)  │ │
│  └─────────┘    └──────────────┘    └─────┬──────┘ │
│                                           │        │
│                 ┌──────────────┐           │        │
│                 │  Filters     │───────────┤        │
│                 │  (React      │           │        │
│                 │   State)     │           │        │
│                 └──────────────┘           │        │
│                                           v        │
│  ┌─────────┐    ┌──────────────┐    ┌────────────┐ │
│  │ Export  │<───│  Tabel       │<───│  Filtered  │ │
│  │ (XLSX/  │    │  (Sortable,  │    │  Data      │ │
│  │  PDF)   │    │   Paginated) │    │            │ │
│  └─────────┘    └──────────────┘    └────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Key Components:**
1. **File Parser:** SheetJS (xlsx) voor ODS en XLSX parsing
2. **Data Store:** React state (useState/useReducer) — geen externe state library nodig voor 2-5 gebruikers
3. **Filter Engine:** Client-side filtering met useMemo voor performance
4. **Table:** Virtualized table of paginering voor grote datasets
5. **Export:** SheetJS voor Excel, jsPDF/pdfmake voor PDF

### Technology Stack

**Frontend:**
- React 18+ met TypeScript
- Vite als build tool
- TailwindCSS voor styling
- SheetJS (xlsx) voor ODS/XLSX parsing en Excel export
- jsPDF of pdfmake voor PDF export
- @tanstack/react-table voor tabel functionaliteit (optioneel)

**Development:**
- ESLint voor code kwaliteit
- TypeScript strict mode

**Geen backend nodig** — pure static site deployment

### External Dependencies

**NPM Packages:**
1. **xlsx (SheetJS):**
   - Purpose: ODS en XLSX parsing + Excel export
   - Criticality: Essential — kerntechnologie voor bestandsverwerking
   - Size: ~500KB

2. **jsPDF of pdfmake:**
   - Purpose: PDF export
   - Size: ~200-300KB

3. **@tanstack/react-table (optioneel):**
   - Purpose: Headless table met sortering, filtering, paginering
   - Alternative: Custom implementatie

### Data Flow

1. Gebruiker upload ODS/XLSX bestand
2. SheetJS parst bestand naar JSON array
3. Data wordt genormaliseerd (datums, codes, null-waarden)
4. Samenvatting wordt berekend en getoond
5. Data wordt opgeslagen in React state (in-memory)
6. Filters worden toegepast op de dataset (client-side)
7. Gefilterde data wordt getoond in tabel
8. Export genereert bestand uit gefilterde data

---

## Implementation Roadmap

### Phase 1: Project Setup en Bestandsverwerking (Week 1)
**Goal:** Project opzetten, bestand uploaden en parsen

**Tasks:**
- [ ] Task 1.1: Vite + React + TypeScript project setup met TailwindCSS
  - Complexity: Small (2h)
  - Dependencies: None

- [ ] Task 1.2: Bestand upload component (drag-and-drop + klik)
  - Complexity: Small (3h)
  - Dependencies: Task 1.1

- [ ] Task 1.3: ODS/XLSX parser met SheetJS
  - Complexity: Medium (4h)
  - Dependencies: Task 1.1

- [ ] Task 1.4: Data normalisatie (datums, TypeOVT codes, null-handling)
  - Complexity: Small (3h)
  - Dependencies: Task 1.3

- [ ] Task 1.5: Upload samenvatting component
  - Complexity: Small (3h)
  - Dependencies: Task 1.4

**Validation Checkpoint:** Bestand wordt correct geparsed en samenvatting getoond

---

### Phase 2: Filtersysteem (Week 2)
**Goal:** Alle filters werkend

**Tasks:**
- [ ] Task 2.1: Filter state management (React context/hooks)
  - Complexity: Medium (4h)
  - Dependencies: Phase 1

- [ ] Task 2.2: Sector filter (PO/SO/VO) — primaire filter
  - Complexity: Small (2h)
  - Dependencies: Task 2.1

- [ ] Task 2.3: Bestuur zoekfilter (naam + nummer)
  - Complexity: Small (3h)
  - Dependencies: Task 2.1

- [ ] Task 2.4: School zoekfilter (BRIN + OVTNaam)
  - Complexity: Small (2h)
  - Dependencies: Task 2.1

- [ ] Task 2.5: KwaliteitOnderwijs multiselect filter
  - Complexity: Small (3h)
  - Dependencies: Task 2.1

- [ ] Task 2.6: TypeOnderzoek multiselect filter met groepering
  - Complexity: Medium (4h)
  - Dependencies: Task 2.1

- [ ] Task 2.7: Datumrange filter op Vaststellingsdatum
  - Complexity: Small (3h)
  - Dependencies: Task 2.1

- [ ] Task 2.8: Filter combinatie logica en resultaat telling
  - Complexity: Small (3h)
  - Dependencies: Tasks 2.2-2.7

**Validation Checkpoint:** Alle filters werken individueel en gecombineerd

---

### Phase 3: Resultaten Tabel (Week 3)
**Goal:** Gefilterde data in sorteerbare, gepagineerde tabel

**Tasks:**
- [ ] Task 3.1: Tabel component met kolom configuratie
  - Complexity: Medium (4h)
  - Dependencies: Phase 2

- [ ] Task 3.2: Sortering op alle kolommen
  - Complexity: Small (2h)
  - Dependencies: Task 3.1

- [ ] Task 3.3: Paginering (50 rijen/pagina)
  - Complexity: Small (3h)
  - Dependencies: Task 3.1

- [ ] Task 3.4: Status styling voor KwaliteitOnderwijs oordelen
  - Complexity: Small (2h)
  - Dependencies: Task 3.1

- [ ] Task 3.5: Detail-view modal bij klik op rij
  - Complexity: Medium (5h)
  - Dependencies: Task 3.1

**Validation Checkpoint:** Tabel toont gefilterde, gesorteerde data met paginering en detail-view

---

### Phase 4: Export en Polish (Week 4)
**Goal:** Export functionaliteit en afwerking

**Tasks:**
- [ ] Task 4.1: Excel (.xlsx) export met SheetJS
  - Complexity: Small (3h)
  - Dependencies: Phase 3

- [ ] Task 4.2: PDF export
  - Complexity: Medium (4h)
  - Dependencies: Phase 3

- [ ] Task 4.3: Dynamische bestandsnaam (datum + filters)
  - Complexity: Small (1h)
  - Dependencies: Tasks 4.1, 4.2

- [ ] Task 4.4: UI polish en Nederlandse labels controle
  - Complexity: Small (3h)
  - Dependencies: All previous

- [ ] Task 4.5: Performance optimalisatie (grote dataset)
  - Complexity: Medium (4h)
  - Dependencies: All previous

- [ ] Task 4.6: Error handling en foutmeldingen (Nederlands)
  - Complexity: Small (2h)
  - Dependencies: All previous

**Validation Checkpoint:** Export werkt correct, UI is afgewerkt, performance is goed met 11.431 rijen

---

### Task Dependencies Visualization

```
Phase 1 (Setup & Parsing):
  1.1 (Setup) → 1.2 (Upload) & 1.3 (Parser)
  1.3 → 1.4 (Normalisatie) → 1.5 (Samenvatting)

Phase 2 (Filters):
  Phase 1 → 2.1 (State) → 2.2-2.7 (Filters, parallel) → 2.8 (Combinatie)

Phase 3 (Tabel):
  Phase 2 → 3.1 (Tabel) → 3.2 (Sort) & 3.3 (Paginering) & 3.4 (Status) & 3.5 (Detail)

Phase 4 (Export & Polish):
  Phase 3 → 4.1 (Excel) & 4.2 (PDF) → 4.3 (Bestandsnaam)
  Phase 3 → 4.4 (Polish) & 4.5 (Performance) & 4.6 (Errors)

Critical Path: 1.1 → 1.3 → 1.4 → 2.1 → 2.8 → 3.1 → 4.1/4.2 → 4.3
```

### Effort Estimation

**Total Estimated Effort:**
- Phase 1: 15 uur
- Phase 2: 24 uur
- Phase 3: 16 uur
- Phase 4: 17 uur
- **Totaal: ~72 uur**

**Risk Buffer:** +20% (14 uur) voor onvoorziene problemen
**Final Estimate:** ~86 uur

---

## Out of Scope

1. **Server-side opslag of database**
   - Reden: Privacy-gevoelige onderwijsdata, geen server nodig
   - Alle verwerking gebeurt client-side

2. **Gebruikersbeheer / authenticatie**
   - Reden: Kleine gebruikersgroep (2-5), geen multi-user scenario
   - Bestand wordt lokaal verwerkt

3. **Mobiele ondersteuning**
   - Reden: Gebruikers werken op desktop werkplekken
   - Future: Kan later toegevoegd worden indien nodig

4. **Data bewerking / schrijven**
   - Reden: Brondata mag nooit gewijzigd worden
   - Alleen lezen, transformeren en tonen

5. **Geavanceerde visualisaties (grafieken)**
   - Reden: Nice-to-have, niet kritisch voor eerste versie
   - Future: Kan als P2 feature worden toegevoegd

6. **Meerdere bestanden tegelijk vergelijken**
   - Reden: Complexiteit, niet gevraagd
   - Workaround: Upload nieuw bestand vervangt het vorige

---

## Open Questions & Risks

### Risks & Mitigation

| Risk | Likelihood | Impact | Severity | Mitigation | Contingency |
|------|------------|--------|----------|------------|-------------|
| ODS parsing problemen met SheetJS | Medium | High | **High** | Test vroeg met echt bestand, fallback XLSX | Converteer ODS naar XLSX als preprocessing |
| Performance bij 11.431 rijen filtering | Low | Medium | **Medium** | useMemo, virtualisatie, paginering | Web Worker voor zware berekeningen |
| Onverwachte kolomnamen in bronbestand | Low | High | **High** | Validatie bij upload, flexibele mapping | Foutmelding met verwachte kolommen |
| PDF export layout bij veel kolommen | Medium | Low | **Low** | Landscape, selecteerbare kolommen | Alleen Excel export als fallback |
| Browser geheugengebruik bij grote bestanden | Low | Medium | **Medium** | Efficiënte data structuur, geen kopieën | Limiet op bestandsgrootte (bijv. 50MB) |

---

## Validation Checkpoints

### Checkpoint 1: Einde Phase 1
**Criteria:**
- [ ] ODS- en XLSX-bestand wordt correct geparsed
- [ ] Data normalisatie werkt (datums, codes)
- [ ] Samenvatting toont correcte aantallen
- [ ] Getest met echt bestand (11.431 rijen)

**If Failed:** Debug parser, controleer kolomnamen

---

### Checkpoint 2: Einde Phase 2
**Criteria:**
- [ ] Alle 6 filtertypen werken individueel
- [ ] Filters zijn combineerbaar
- [ ] Resultaat telling is correct
- [ ] Performance < 200ms bij filter wijziging

**If Failed:** Optimaliseer filter logica, fix bugs

---

### Checkpoint 3: Einde Phase 3
**Criteria:**
- [ ] Tabel toont gefilterde data correct
- [ ] Sortering werkt op alle kolommen
- [ ] Paginering werkt
- [ ] Detail-view toont alle kolommen inclusief standaarden

**If Failed:** Fix tabel bugs, test met edge cases

---

### Checkpoint 4: Einde Phase 4
**Criteria:**
- [ ] Excel export bevat correcte data en Nederlandse kolomnamen
- [ ] PDF export is leesbaar
- [ ] Alle UI-tekst is in het Nederlands
- [ ] `npm run build` draait foutloos
- [ ] Performance is acceptabel met 11.431 rijen

**If Failed:** Fix export bugs, performance optimalisatie

---

## Appendix: Task Breakdown Hints

### Suggested Taskmaster Task Structure

**Setup & Parsing (5 tasks, ~15 uur)**
1. Vite + React + TypeScript + TailwindCSS project setup (2h)
2. Bestand upload component met drag-and-drop (3h)
3. ODS/XLSX parser met SheetJS (4h)
4. Data normalisatie en transformatie (3h)
5. Upload samenvatting dashboard (3h)

**Filters (8 tasks, ~24 uur)**
6. Filter state management (4h)
7. Sector filter PO/SO/VO (2h)
8. Bestuur zoekfilter (3h)
9. School zoekfilter BRIN/OVTNaam (2h)
10. KwaliteitOnderwijs multiselect (3h)
11. TypeOnderzoek multiselect met groepering (4h)
12. Datumrange filter Vaststellingsdatum (3h)
13. Filter combinatie en resultaat telling (3h)

**Tabel & Detail (5 tasks, ~16 uur)**
14. Resultaten tabel component (4h)
15. Kolom sortering (2h)
16. Paginering (3h)
17. Status styling oordelen (2h)
18. Detail-view modal (5h)

**Export & Polish (6 tasks, ~17 uur)**
19. Excel export met SheetJS (3h)
20. PDF export (4h)
21. Dynamische bestandsnaam (1h)
22. UI polish en NL labels controle (3h)
23. Performance optimalisatie (4h)
24. Error handling en NL foutmeldingen (2h)

**Totaal: 24 taken, ~72 uur**

### Parallelizable Tasks

**Can work in parallel:**
- Tasks 7-12 (alle individuele filters) na task 6
- Tasks 15-18 (tabel features) na task 14
- Tasks 19-20 (Excel en PDF export) na phase 3
- Tasks 22-24 (polish taken) na phase 3

**Must be sequential:**
- Setup (1-5) → Filters (6-13) → Tabel (14-18) → Export (19-24)

### Critical Path Tasks
1. Project setup (1)
2. ODS/XLSX parser (3)
3. Data normalisatie (4)
4. Filter state management (6)
5. Filter combinatie (13)
6. Tabel component (14)
7. Excel/PDF export (19-20)

**Critical path duration:** ~35 uur

---

**End of PRD**

*This PRD is optimized for taskmaster AI task generation. All requirements include task breakdown hints, complexity estimates, and dependency mapping to enable effective automated task planning.*
