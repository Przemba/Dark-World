# Dark World

Gra paragrafowa (gamebook z systemem pod spodem) o łowcy wampirów. Działa w przeglądarce, na telefonie i offline (PWA).

**Zagraj:** https://przemba.github.io/Dark-World/

Na komputerze (okno szersze niż 1000 px) gra pokazuje stały panel boczny (Postać, Plecak, Dziennik, Menu) i obsługuje klawiaturę: 1-9 wybór opcji, Enter/Spacja dalej lub rzut, A atak, S strzał, U unik.

## Struktura
- `js/engine.js` – silnik zasad (testy k10, Szczęście, walka rundowa, zegary, Zimno/Głód, udźwig, kod przeniesienia). Bez DOM, działa też w Node.
- `js/items.js`, `js/bestiary.js` – przedmioty i bestiariusz wspólne dla wszystkich tomów.
- `books/tom1.js` – Tom I: Szarówka (paragrafy jako dane).
- `js/ui.js`, `css/style.css`, `index.html` – interfejs mobilny.
- `sw.js`, `manifest.webmanifest` – offline i instalacja na ekranie głównym.
- `tests/sim.js` – symulacja balansu walk i losowy bot po scenariuszu (`node tests/sim.js`).
- `tools/build-single.js` – buduje jeden plik `dist/dark-world.html`.

## Dodawanie kolejnego tomu
1. Skopiuj `books/tom1.js` do `books/tom2.js`, zmień `id`, `SC` i `startHook`.
2. Dopisz plik w `index.html` i w liście `FILES` w `sw.js` (oraz podbij `VERSION`).
3. Gracz przenosi postać kodem `DW1.…` z końca poprzedniego tomu.
