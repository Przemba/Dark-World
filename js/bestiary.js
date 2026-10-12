/* DARK WORLD: Bestiariusz (wspólny dla wszystkich tomów).
   Fakty (facts) trafiają do Dziennika Łowcy, gdy gracz je odkryje. Opisy są przepisane na własne słowa gry.
   Wartości walki (foe) są punktem wyjścia do strojenia, nie świętością. */
(function (G) {
  "use strict";
  var DW = G.DW = G.DW || {};

  var SPECIES = {
    draugr: {
      n: "Draugr", tier: "niższy", reg: "wyżyny",
      opis: "Wędrujący nieumarły, który kiedyś miał ciało i dom. Za dnia leży w grobie albo kurhanie, nocą wychodzi i zabija wszystko, co kojarzy mu się z życiem.",
      facts: [
        { id: "draugr_dom",   t: "Za dnia spoczywa w swoim grobie lub kopcu. Nocą z niego wychodzi." },
        { id: "draugr_zazdr", t: "Z zazdrości o żywych zaszczuwa bydło na śmierć. Najpierw zwierzęta, potem ludzie." },
        { id: "draugr_sila",  t: "Czarny, ogromny, zimny w dotyku. Jego ciało długo nie gnije, a siła przewyższa człowieka." },
        { id: "draugr_rytual", t: "Pokonać go można tylko w pojedynku, jeden na jednego. Potem trzeba ściąć mu głowę, spalić ciało do zimnych popiołów i pogrzebać je daleko (albo wrzucić do wody). Pomoc innych wszystko psuje." },
        { id: "draugr_rodzaj", t: "Zwykle zostaje nim człowiek, który odszedł w złym stanie: samobójca, zmarły bez pochówku, nieprzebłagany za życia." }
      ],
      foe: { n: "Draugr", zyw: 34, atk: 8, obr: 4, dice: [3, 6, 0], wyp: 2, ini: 6, nieumarly: true, zimny: true }
    },
    brukolak: {
      n: "Brukołak", tier: "niższy", reg: "niziny",
      opis: "Obrzmiały, twardy jak bęben, roznosi zarazy. Krzyczy raz na noc i ten, kto odpowie, umiera.",
      facts: [
        { id: "bruk_krzyk",  t: "Krzyczy tylko raz w ciągu nocy. Kto odpowie na ten krzyk, umiera." },
        { id: "bruk_skora",  t: "Skóra obrzmiała i twarda, brzmi jak bęben, gdy w nią uderzyć. Za nim idą choroby." },
        { id: "bruk_zabic",  t: "Odcięta głowa, potem spalenie albo gotowanie. Nie wymaga pojedynku." }
      ],
      foe: { n: "Brukołak", zyw: 30, atk: 6, obr: 3, dice: [2, 6, 2], wyp: 3, ini: 4, nieumarly: true }
    },
    wrykolak: {
      n: "Wrykołak", tier: "niższy", reg: "wszędzie",
      opis: "Za życia niechlujny pijak. Jako wampir daje się zabić gwoździem w pępek albo wrzącym olejem.",
      facts: [
        { id: "wryk_zycie", t: "Został nim ktoś, kto za życia pił bez opamiętania." },
        { id: "wryk_zabic", t: "Przebić pępek gwoździem albo oblać ciało wrzącym olejem." }
      ],
      foe: { n: "Wrykołak", zyw: 26, atk: 6, obr: 3, dice: [2, 6, 0], wyp: 1, ini: 5, nieumarly: true }
    },
    katakan: {
      n: "Katakan", tier: "wyższy", reg: "—",
      opis: "Wesoły wampir, który stale szczerzy zęby. Pluje krwią, a ta, co na kogoś spadnie, pali.",
      facts: [
        { id: "kata_zabic", t: "Ścięta głowa musi być ugotowana w occie. Można go też odizolować za słoną wodą." }
      ],
      foe: { n: "Katakan", zyw: 42, atk: 9, obr: 5, dice: [3, 6, 0], wyp: 2, ini: 8, nieumarly: true }
    },
    alp: {
      n: "Alp", tier: "wyższy", reg: "—",
      opis: "Dręczy śpiących i spija z nich siły. Potrafi przybierać zwierzęce kształty.",
      facts: [{ id: "alp_zabic", t: "Cytryna włożona do ust przebija jego moc." }],
      foe: { n: "Alp", zyw: 36, atk: 8, obr: 5, dice: [2, 6, 3], wyp: 1, ini: 8, nieumarly: true }
    },
    lamia: {
      n: "Lamia", tier: "wyższy", reg: "—",
      opis: "Dawna władczyni, którą obłęd zamienił w demonicę żywiącą się krwią noworodków.",
      facts: [{ id: "lamia_zabic", t: "Można ją zabić tylko podczas odpoczynku po posiłku." }],
      foe: { n: "Lamia", zyw: 40, atk: 9, obr: 6, dice: [3, 6, 0], wyp: 1, ini: 9, nieumarly: true }
    },
    nosferatu: {
      n: "Nosferatu", tier: "niższy", reg: "—",
      opis: "Żywi się własną rodziną. Należy do kasty renegatów i często łazi także za dnia.",
      facts: [{ id: "nosf_rodzina", t: "Żywi się swoją rodziną. Wywodzi się od nieślubnych albo siódmych dzieci." }],
      foe: { n: "Nosferatu", zyw: 32, atk: 8, obr: 5, dice: [2, 6, 3], wyp: 1, ini: 8, nieumarly: true }
    }
  };

  /* wspólne fakty ogólne (do Dziennika) */
  var GENERAL = [
    { id: "gen_domy",    t: "Wampiry skupiają się w Domach. Głowy Domów zasiadają w Radzie, a Rada tworzy kastę. Znane kasty: Malkavian, Nosferatu, Giovanni." },
    { id: "gen_slonce",  t: "Słońce nie zabija wszystkich. Wampiry wyższe znoszą światło, niższe zwykle nie." },
    { id: "gen_kolek",   t: "Kołek osikowy w serce działa na wiele z nich. Ale trzeba wiedzieć, gdzie wampir śpi w dzień, bo nocą jest za silny." },
    { id: "gen_ogien",   t: "Ogień służy dobrze na te demony. Odcięta głowa i spalone ciało to najpewniejszy koniec." },
    { id: "gen_dhampir", t: "Dhampir to dziecko wampira i śmiertelnika. Pomaga w polowaniach, ale zwykle działa sam, pchany zemstą." },
    { id: "gen_wiedzmy", t: "Wiedźmy rzadko walczą z Dziećmi Nocy, chyba że ktoś na nie napadnie. Pakt z wiedźmą ma twarde warunki i zawsze kosztuje." }
  ];

  DW.bestiary = { SPECIES: SPECIES, GENERAL: GENERAL };
})(typeof globalThis !== "undefined" ? globalThis : this);
