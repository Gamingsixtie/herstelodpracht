# Stelopdrachten Overzicht — Inspectie van het Onderwijs

Webapp die ODS/Excel-bestanden van de Onderwijsinspectie verwerkt tot een doorzoekbaar overzicht van oordelen per school, bestuur en onderzoekstype. Input: inspectiebestand (62 kolommen, ~11K rijen). Output: filtertabel + export naar Excel/PDF. Gebruikers: klein team (2-5 personen) bij het ministerie.

# Commands

```bash
npm run dev       # Dev server
npm run build     # Production build
npm run lint      # Linting
```

# Rules

- IMPORTANT: Alle UI-tekst in het Nederlands — gebruikers zijn ambtenaren, geen developers
- IMPORTANT: Wijzig NOOIT data uit het bronbestand — alleen lezen, transformeren en tonen
- Gebruik de exacte kolomnamen uit het bronbestand als interne keys (zie Data Structuur)
- Toon Nederlandse labels in de UI: "Bestuursnaam" niet "Board name", "Kwaliteit Onderwijs" niet "Education Quality"
- Datums komen binnen als `YYYYMMDD` (getal) of `DD-MM-YYYY` (string) — normaliseer naar DD-MM-YYYY voor weergave
- BRIN-code is de primaire identifier voor scholen, NIET de schoolnaam
- Bestuursnummer is de primaire identifier voor besturen, NIET de bestuursnaam (3 bestuursnamen zijn niet-uniek)

# Data Structuur — De kolommen die ertoe doen

Het bronbestand heeft 62 kolommen. Deze zijn relevant voor het overzicht:

**Identificatie**: `BRIN` (schoolcode), `Vestiging` (vestigingsnr), `OVT` (unieke combinatie BRIN|vestiging|opleiding), `OVTNaam` (opleidingsnaam)

**Bestuur**: `Bestuursnummer`, `Bestuursnaam` — relatie is 1 bestuur → N scholen

**Classificatie**: `Sector` (PO/SO/VO), `TypeOVT` (9 types: BAS, VOS, SPEC, etc.), `Elementtype` (CLR=PO, ODS=VO, OKE=SO)

**Onderzoek**: `TypeOnderzoek` (39 types, waaronder "Stelselonderzoek", "Herstelonderzoek school/opleiding", "Kwaliteitsonderzoek naar aanleiding van risico's"), `TypeOnderzoekCode` (korte code), `Onderzoeksnummer`

**Oordeel**: `KwaliteitOnderwijs` — 6 mogelijke waarden: Voldoende, Onvoldoende, Goed, Zeer zwak, Basistoezicht, Geen eindoordeel

**Datums**: `Vaststellingsdatum`, `Publicatiedatum` (als YYYYMMDD getal), `Peildatum` (als DD-MM-YYYY string)

**Standaarden** (kolommen 25-61): individuele oordelen per standaard (OP1-OP8, SK1-SK2, VS1-VS2, etc.) — waarden: Voldoende/Onvoldoende/Goed/Niet beoordeeld/NaN

# Filters — Wat de gebruiker moet kunnen

- IMPORTANT: Sector (PO/SO/VO) als primaire filter — altijd zichtbaar
- Bestuur: zoeken op bestuursnaam of bestuursnummer
- School: zoeken op BRIN of OVTNaam
- KwaliteitOnderwijs: multiselect (6 waarden)
- TypeOnderzoek: multiselect (39 types, groepeer de top-5: Stelselonderzoek, Herstelonderzoek, Kwaliteitsonderzoek risico, Kwaliteitsonderzoek goede school, Onderzoek kwaliteitsverbetering)
- Datumrange op Vaststellingsdatum

# Gotchas

- IMPORTANT: 74% van de rijen (8.500/11.431) heeft "Geen eindoordeel" — toon dit als neutrale status, niet als fout of waarschuwing
- `Vaststellingsdatum` en `Publicatiedatum` zijn GETALLEN (20241008 = 8 okt 2024), niet date-objecten — parse ze als string en formateer
- Eén BRIN kan meerdere rijen hebben (verschillende opleidingen/vestigingen) — groepeer op BRIN+Vestiging, niet alleen BRIN
- De 37 standaard-kolommen (OP0-BA2) bevatten grotendeels NaN — toon ze alleen in een detail-view, niet in het hoofdoverzicht
- IMPORTANT: Het bestand is ODS-formaat (OpenDocument), niet XLSX — de parser moet beide ondersteunen
- `TypeOVT` codes zijn afkortingen zonder toelichting in het bestand (BAS=basisschool, VOS=voortgezet, SPEC=speciaal) — toon de volledige naam in de UI
- Bestuursnummer en Bestuursnaam hebben 3 mismatches (1065 nummers vs 1062 namen) — gebruik altijd Bestuursnummer als key

# Workflow

- IMPORTANT: Run `npm run build` voordat je klaar bent — moet foutloos draaien
- Bij upload: toon direct een samenvatting ("X scholen, Y besturen, Z onderzoeken, per sector")
- IMPORTANT: Geen data opslaan server-side — alles client-side in geheugen. Privacy-gevoelige onderwijsdata.
- Export: gefilterde tabel als Excel (.xlsx) of PDF, met dezelfde kolommen als de UI toont
- Test de parser altijd met het echte bestand (11.431 rijen) — niet alleen met mock data van 10 rijen

# Testprotocol — VERPLICHT na elke feature/optimalisatie

IMPORTANT: Draai dit testprotocol na ELKE code-wijziging voordat je commit. Gebruik plan modus om de tests uit te voeren.

```bash
# Stap 1: TypeScript compilatie (0 fouten verwacht)
npx tsc --noEmit

# Stap 2: Build (moet foutloos draaien, incl. data.json generatie)
npm run build

# Stap 3: Data-integriteitstest (Python)
python3 -c "
import json
from collections import Counter
with open('public/data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
school = data['schoolRijen']
bestuur = data['bestuurRijen']

# Verwachte minimale waarden
assert len(school) >= 12000, f'Te weinig schoolrijen: {len(school)}'
assert len(bestuur) >= 1400, f'Te weinig bestuurrijen: {len(bestuur)}'
assert len(data['geladenBestanden']) == 14, f'Niet alle bestanden geladen: {len(data[\"geladenBestanden\"])}'

# Verplichte velden school
for veld in ['BRIN','Bestuursnummer','Sector','KwaliteitOnderwijs','TypeOnderzoekCode']:
    assert all(veld in r for r in school), f'Veld {veld} ontbreekt in schoolrijen'

# Verplichte velden bestuur
for veld in ['Bestuursnummer','Bestuursnaam','Eindoordeel','FinancieelBeheer']:
    assert all(veld in r for r in bestuur), f'Veld {veld} ontbreekt in bestuurrijen'

# Cross-referentie
school_bn = set(r['Bestuursnummer'] for r in school if r['Bestuursnummer'] != 0)
bestuur_bn = set(r['Bestuursnummer'] for r in bestuur)
overlap = school_bn & bestuur_bn
assert len(overlap) / len(school_bn) > 0.95, f'Cross-ref te laag: {len(overlap)}/{len(school_bn)}'

# KwaliteitOnderwijs waarden
kw = set(r['KwaliteitOnderwijs'] for r in school)
assert 'Voldoende' in kw and 'Onvoldoende' in kw and 'Geen eindoordeel' in kw

# Sectoren
sec = set(r['Sector'] for r in school)
assert sec == {'PO','SO','VO'}, f'Onverwachte sectoren: {sec}'

print('ALLE TESTS GESLAAGD')
print(f'  School: {len(school)} rijen, Bestuur: {len(bestuur)} rijen')
print(f'  Cross-ref: {len(overlap)}/{len(school_bn)} ({len(overlap)/len(school_bn)*100:.1f}%)')
print(f'  Bestanden: {len(data[\"geladenBestanden\"])}')
"
```

Verwachte uitkomst:
- TypeScript: 0 fouten
- Build: slaagt
- Data-test: "ALLE TESTS GESLAAGD" met ~12.208 school, ~1.415 bestuur, 97%+ cross-ref
