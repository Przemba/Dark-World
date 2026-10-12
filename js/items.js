/* DARK WORLD: przedmioty, waluta, pancerze, broń.
   Ceny trzymamy w BL (blaszakach): 1 MD = 100 BL, 1 SR = 100 MD, 1 DK = 100 SR.
   Wagi i opisy pochodzą z podstawki; ceny pancerzy to propozycja robocza (w podstawce pola były puste). */
(function (G) {
  "use strict";
  var DW = G.DW = G.DW || {};

  var BL = 1, MD = 100, SR = 10000, DK = 1000000;

  /* slot: gdzie nosisz rzecz. ciepło: ile daje przeciw Zimnu. wyp: Wyparowanie pancerza.
     zaw: kary/premie do Inicjatywy wg SF (1-3, 4-6, 7-9, 10) dla pancerzy. */
  var ITEMS = {
    /* obuwie */
    onuce:      { n: "Onuce", kat: "odziez", slot: "buty", waga: 0.5, cena: 5 * BL, cieplo: 0, d: "Szmaciane owijki na stopy. Trudno nazwać to obuwiem. Nie chronią przed wodą ani przed nierównościami terenu." },
    trzewiki_p: { n: "Przeciekające trzewiki", kat: "odziez", slot: "buty", waga: 0.5, cena: 0, cieplo: 1, d: "Twoje. Podeszwa miękka, wierzch w dziurach. Chronią tyle, ile nic." },
    trzewiki:   { n: "Trzewiki", kat: "odziez", slot: "buty", waga: 0.5, cena: 3 * MD, cieplo: 1, d: "Standardowe obuwie z miękką podeszwą. Przyzwoite na nizinach, w górach długo w nich nie pochodzisz." },
    buty:       { n: "Ciężkie buty", kat: "odziez", slot: "buty", waga: 0.5, cena: 8 * MD, cieplo: 2, d: "Skóra na twardej podeszwie. Chronią przed chłodem i nierównościami terenu." },
    /* okrycia */
    plaszcz_z:  { n: "Znoszony płaszcz", kat: "odziez", slot: "okrycie", waga: 4, cena: 0, cieplo: 1, d: "Stary, wypłowiały, ale jeszcze trzyma wiatr." },
    plaszcz:    { n: "Płaszcz", kat: "odziez", slot: "okrycie", waga: 5, cena: 16 * MD, cieplo: 2, d: "Gruby, wełniany, z kapturem. Cena zależy od zużycia." },
    kurtka:     { n: "Skórzana kurtka", kat: "odziez", slot: "tors", waga: 1, cena: 9 * MD, cieplo: 1, d: "Cena waha się w zależności od zużycia i jakości wykonania." },
    kaftan:     { n: "Skórzany kaftan", kat: "odziez", slot: "tors", waga: 2, cena: 8 * MD, cieplo: 1, d: "Sztywniejszy od kurtki, trochę chroni przed otarciami." },
    spodnie:    { n: "Spodnie", kat: "odziez", slot: "nogi", waga: 0.5, cena: 3 * MD, cieplo: 1, d: "Zwykłe spodnie z dostępnego powszechnie materiału." },
    spodnie_s:  { n: "Skórzane spodnie", kat: "odziez", slot: "nogi", waga: 1, cena: 6 * MD, cieplo: 2, d: "Uszyte ze skóry. Ciepłe i trwałe." },
    czepiec:    { n: "Skórzany czepiec", kat: "odziez", slot: "glowa", waga: 0.5, cena: 4 * MD, cieplo: 1, glowa: 1, d: "Podstawowe nakrycie ochronne głowy." },

    /* pancerze: wyp = Wyparowanie, zaw = Inicjatywa wg SF (1-3, 4-6, 7-9, 10) */
    p_skorzany: { n: "Pancerz skórzany", kat: "pancerz", slot: "pancerz", waga: 2, cena: 12 * MD, wyp: 1, zaw: [-1, 0, 1, 2], dost: "powszechna",
      d: "Skóra wzmacniana gotowaniem w oleju. Lekki i niedrogi, dobry dla nowicjuszy i tych, którzy wolą szybkość od siły." },
    p_cwiek:    { n: "Ćwiekowany pancerz skórzany", kat: "pancerz", slot: "pancerz", waga: 5, cena: 60 * MD, wyp: 3, zaw: [-2, -1, 0, 1], dost: "słaba",
      d: "Miękka skóra ponabijana metalowymi ćwiekami. Rozpowszechniony wśród żołnierzy." },
    p_kolczuga: { n: "Kolczuga", kat: "pancerz", slot: "pancerz", waga: 10, cena: 250 * MD, wyp: 5, zaw: [-5, -2, -1, 0], dost: "rzadka",
      d: "Giętka sieć metalicznych ogniw. Jeden z najpopularniejszych rodzajów pancerza." },
    p_luskowy:  { n: "Pancerz łuskowy", kat: "pancerz", slot: "pancerz", waga: 15, cena: 600 * MD, wyp: 8, zaw: [-7, -5, -2, -1], dost: "kłopotliwa",
      d: "Płytki z metalu, rogu lub kości nitowane do skórzanego podkładu. Słabszy od płytowego, ale daje większą swobodę ruchu." },
    p_plytowy:  { n: "Zbroja płytowa", kat: "pancerz", slot: "pancerz", waga: 20, cena: 1500 * MD, wyp: 10, zaw: [-10, -7, -5, -2], dost: "kłopotliwa",
      d: "Najczęstsza wśród rycerstwa. Najlepsza ochrona ze wszystkich pancerzy, ale mocno ogranicza swobodę ruchu." },

    /* broń: dice = [ile, ścianek, stała]; mod = premia do trafienia */
    miecz:      { n: "Wierny miecz", kat: "bron", slot: "bron", waga: 1.5, cena: 3 * SR, dice: [2, 6, 0], mod: 0, ciecie: true, sk: "Walka", d: "Nie jest piękny, ale dotąd Cię nie zawiódł." },
    kozik:      { n: "Kozik", kat: "bron", slot: "bron", waga: 0.3, cena: 5 * MD, dice: [1, 6, 0], mod: 1, ciecie: false, sk: "Walka", d: "Krótki, wygodny w ścisku. Dobry do skórowania i do bójki w ciemnej uliczce." },
    topor:      { n: "Topór", kat: "bron", slot: "bron", waga: 2.5, cena: 8 * MD, dice: [2, 6, 1], mod: -1, ciecie: true, sk: "Walka", d: "Cięższy od miecza, brzydszy, równie skuteczny na szyi." },
    maczuga:    { n: "Maczuga okuta", kat: "bron", slot: "bron", waga: 2, cena: 4 * MD, dice: [2, 6, 0], mod: 0, ciecie: false, sk: "Walka", d: "Rozwala kości. Nie nadaje się do ścinania głów." },
    pistolet:   { n: "Para pistoletów na kołki", kat: "specjalne", slot: null, waga: 2.4, cena: 6 * SR, d: "Dwa strzały, potem ładowanie. Kołek osikowy w nieosłoniętą pierś bestii. A nuż." },

    /* zapasy i narzędzia */
    kolek:      { n: "Kołek osikowy", kat: "zapas", waga: 0.1, cena: 2 * MD, stack: true, d: "Amunicja do pistoletów. Osika, zaostrzona na oba końce." },
    racja:      { n: "Racja żywności", kat: "zapas", waga: 0.5, cena: 2 * MD, stack: true, uzyj: "jedz", d: "Chleb, ser, kawał kiełbasy. Wystarcza na dzień." },
    bandaz:     { n: "Bandaże i maść", kat: "zapas", waga: 0.2, cena: 5 * MD, stack: true, uzyj: "lecz", d: "Płótno i tłusta maść z ziół. Pomaga zatamować i nie dać ranie zgnić." },
    pochodnia:  { n: "Pochodnia", kat: "narzedzie", waga: 0.5, cena: 3 * MD, stack: true, ogien: true, d: "Smolna szczapa. Daje światło i ogień na godzinę." },
    olej:       { n: "Bukłak oleju", kat: "narzedzie", waga: 1, cena: 8 * MD, stack: true, ogien: true, d: "Olej lampowy. Płonie chętnie i długo. Dobry na wrzący olej, jeszcze lepszy na stos." },
    krzesiwo:   { n: "Krzesiwo i hubka", kat: "narzedzie", waga: 0.1, cena: 4 * MD, d: "Bez tego nie rozpalisz ogniska ani stosu." },
    lopata:     { n: "Łopata", kat: "narzedzie", waga: 3, cena: 10 * MD, d: "Do grzebania. Zwykle cudzych kłopotów." },
    sol:        { n: "Sól (woreczek)", kat: "zapas", waga: 1, cena: 5 * MD, stack: true, d: "Na mięso, na ranę, a według niektórych także na złe oko." },
    ocet:       { n: "Ocet (butla)", kat: "zapas", waga: 1, cena: 6 * MD, stack: true, d: "Kwaśny, mętny. Podobno nie tylko do kapusty." },
    cytryna:    { n: "Cytryna", kat: "zapas", waga: 0.2, cena: 3 * SR, stack: true, d: "Egzotyczna rzadkość. Na północy trudno ją znaleźć." },
    sygnet:     { n: "Srebrny sygnet z runą", kat: "fabula", waga: 0.1, cena: 0, d: "Znaleziony w kurhanie. Wyryta runa nie pochodzi z tych stron." }
  };

  function fmtMoney(bl) {
    bl = Math.max(0, Math.round(bl));
    if (bl === 0) return "0 BL";
    var out = [];
    var dk = Math.floor(bl / DK); bl -= dk * DK;
    var sr = Math.floor(bl / SR); bl -= sr * SR;
    var md = Math.floor(bl / MD); bl -= md * MD;
    if (dk) out.push(dk + " DK");
    if (sr) out.push(sr + " SR");
    if (md) out.push(md + " MD");
    if (bl) out.push(bl + " BL");
    return out.join(" ");
  }

  DW.items = { ITEMS: ITEMS, BL: BL, MD: MD, SR: SR, DK: DK, fmtMoney: fmtMoney };
})(typeof globalThis !== "undefined" ? globalThis : this);
