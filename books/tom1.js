/* DARK WORLD, Tom I: Szarówka. Scenariusz próbny: prolog i jedno pełne polowanie (Draugr).
   Format paragrafu (jak w COBRZE):
   t: tytuł, chap: [numer, nazwa], intro: [akapity wstępne], x: [akapity; string | {c:warunek,x} | {t:"ok"/"no",x}],
   after: [akapity po teście/walce], on(s,E): efekty wejścia, test/fight: test lub walka na wejściu,
   shop: sklep, ch: [{l, to, c(warunek), vis, why, fx(s,E), test, fight, toOk, toNo}], end: zakończenie. */
(function (G) {
  "use strict";
  var DW = G.DW = G.DW || {};
  var EN = DW.engine;
  var IT = DW.items, MD = IT.MD;

  var D = function (id) { return function (s) { return !!s.dz[id]; }; };
  var F = function (k) { return function (s) { return !!s.flags[k]; }; };
  var N = function (k) { return function (s) { return !s.flags[k]; }; };
  var R = function (v) { return function (s) { return s.flags.rozp === v; }; };
  var DAY = function (s) { return s.pora <= 2; };       /* świt, dzień, zmierzch */
  var LIGHT = function (s) { return s.pora <= 1; };      /* świt, dzień */
  var NIGHT = function (s) { return s.pora === 3; };

  /* wspólne: wizyta w miejscu kosztuje porę dnia; po niej pora zmienia się i hub to pokaże */
  function visit(to, why) { return { to: to, vis: DAY, fx: function (s, E) { E.czas(1); } }; }

  /* skutki nocy, w której Draugr hasa na wolności */
  function nightFall(s, E) {
    s.flags.noce = (s.flags.noce || 0) + 1;
    if (s.flags.noce === 1) { E.chip("Noc: znów giną zwierzęta", "neg"); s.flags.strach = (s.flags.strach || 0) + 1; E.rep("lud", -1); }
    else if (s.flags.noce === 2) { E.chip("Noc: ginie człowiek, parobek Staszek", "neg"); s.flags.strach = (s.flags.strach || 0) + 2; E.rep("lud", -1); }
    else { E.chip("Noc: kolejna zagroda pusta, wieś zaczyna się pakować", "neg"); s.flags.strach = (s.flags.strach || 0) + 1; }
  }

  var SC = {};

  /* ===================== PROLOG ===================== */
  SC[1] = { t: "Chata Siwego", chap: ["Prolog", "Ławka przy ogniu"], intro: [
    "- Pozwól sobie spocząć na tej ławie - rzekł do ciebie sędziwy już gospodarz, kiedy {wszedłeś|weszłaś} do chaty zbudowanej z solidnych bali. Popatrzyłeś na niego nieufnym wzrokiem i niechętnie położyłeś ekwipunek na wskazanym miejscu. Zdziwiło cię, że ten stary Indianin nie odczuwał żadnego lęku przed tobą. Był całkowicie spokojny, jakby wiedział, kim jesteś i po co przyszedłeś, zanim jeszcze zapukałeś.",
    "Poda ci kufel, z którego unosiły się ciepłe opary, sobie postawił gliniany kubek. Poczułeś intensywny zapach ziół. Zerknąłeś na ściany domostwa: jedno drewniane łoże, dwa stołki, jakaś szafa, ława, przy której siedzisz, i dwa regały, na których swobodnie leży kilka ksiąg. Ludzie nazywają go Siwym. On sam nie poprawia."],
    x: [
      "- Znasz nasz świat? Świat, po którym dane ci będzie stąpać przez, daj twój bóg, kolejne kilka wiosen? - pyta starzec, widząc twoje zainteresowanie regałami. - Jeśli nie, pozwól, że powiem ci co nieco. Ludzie chodzą tu na ślepo i potem się dziwią."
    ],
    ch: [
      { l: "Zapytać o świat i o to, co leży między krajami", to: 2, vis: N("t_swiat") },
      { l: "Zapytać o wiarę i o to, czym są Dzieci Nocy", to: 3, vis: N("t_wiara") },
      { l: "Zapytać o to, co czeka cię na szlaku", to: 4, vis: N("t_los") },
      { l: "Poprosić o wgląd w księgi na regale", to: 5, vis: N("t_ksiegi") },
      { l: "Dość słuchania. Spytać, po co cię tu ściągnął", to: 6 }
    ] };

  SC[2] = { t: "Świat", chap: ["Prolog", "Gardło Śmierci"],
    on: function (s, E) { s.flags.t_swiat = true; },
    x: [
      "- Wiedz, że znany nam świat składa się z dwóch kontynentów podzielonych na małe państewka. Rządzą nimi zamożne rodziny, które znalazły sobie dość popleczników, żeby pokonać rywali w wyścigu o władzę. To, jak się żyje w danym kraju, zależy od charakteru jego pana. Nasz jest w miarę spokojny. Poza daninami, podatkami i kilkoma opłatami, o których wolę nie mówić, nikt nas tu nie gnębi. Są krainy, gdzie ludzie umierają z głodu. My mamy szczęście, że urodziliśmy się na tej ziemi.",
      "- Pomiędzy lądami snuje się wąski, niebezpieczny przesmyk. Nazywają go Gardłem Śmierci. Najbogatsze państwa leżą po obu jego krańcach i biorą niezłą opłatę za bezpieczne przejście. Sprzedadzą ci nawet ochronę, płatną z góry. Zwykle wraca do domu po paru kilometrach, zostawiając cię losowi, bo na tym odcinku może cię spotkać wszystko, zwłaszcza gdy zejdziesz z traktu.",
      "- Pieniądze znajdziesz tylko w miastach i zajazdach. Na wsi się wymienia, towar za towar. Handel to u nas cień handlu. Jedynym miejscem bez pana jest wielki bór na wschodnim kontynencie. Powiem ci tylko tyle: weszli do Wielkiego Boru tacy jak ty i ja, z tego czy innego powodu, i nikt z nich nie wrócił do normalności.",
      "- A klimat? - uśmiecha się krzywo. - Zimny, deszczowy i skrzętnie ponury. Podobno są na południu wyspy, gdzie jest ciepło. Może to sprawdzisz. Pewnie dopiero na emeryturze. Widziałeś kiedyś Łowcę emeryta?"
    ],
    ch: [{ l: "Wracasz do rozmowy", to: 1 }] };

  SC[3] = { t: "Wiara", chap: ["Prolog", "Bez imion"],
    on: function (s, E) { s.flags.t_wiara = true; },
    x: [
      "- Czy wierzysz w jakiegoś Boga? Nie, nie odpowiadaj, tylko pytam, to ciekawość starego głupca. U nas każdy modli się do sobie znanych, ale żaden nie ma imienia. Przede wszystkim modlimy się do natury. Ziemia, nasza matka, kiedy jest litościwa, daje pożywienie i schronienie, więc dwa razy w roku, kiedy dzień jest równy nocy, prosimy ją o litość najmocniej. Wiatr łamie drzewa, z których stawiamy domy, a czasem przynosi dobrą pogodę. Ogień daje ciepło i smaczne jedzenie i, daj Boże, nie spali ci chałupy. Wody jest pod dostatkiem, przeważnie za dużo. A słońce, ach, wyjdź choć na chwilę, żebym rozgrzał stare kości.",
      "- No i są Dzieci Nocy. Raczej demony niż bogowie, ale lepiej się nie narażać, może dzisiejszej nocy ominą twoje domostwo. One jako jedyne mają imiona. Jeśli je znasz, nie wymawiaj ich, bo ściągniesz na siebie zgubę. To imiona nadane im przez nich samych albo przez ludzi. Ich prawdziwe imiona mają dopiero moc."
    ],
    ch: [{ l: "Wracasz do rozmowy", to: 1 }] };

  SC[4] = { t: "Przeznaczenie", chap: ["Prolog", "Cztery lata z jednym Łowcą"],
    on: function (s, E) { s.flags.t_los = true; },
    x: [
      "- Co cię czeka? Nie jestem wyrocznią, ale powiem ci jedno. Podróżowałem kiedyś z jednym takim jak ty. Nie powiem, żebym stracił te cztery lata, ale mam żal, że byłem zmuszony. Spotykało nas to samo: brud, smród, przygnębienie i wyklęcie. No i oczywiście walka, ale to trzymało go przy życiu. Pewnie i ciebie.",
      "- Żadnego bohaterstwa. Czasem za pracę dostawaliśmy kilka groszy, czasem jedzenie albo jakieś rzeczy mniej lub bardziej przydatne. W wielu przypadkach ludzie, którym pomogliśmy, po wszystkim stawali się wobec nas obojętni, a rzekłbym nawet, że chłodni. Miałem wrażenie, że podzielimy los naszego niedawnego celu. Miałem jednak szczęście, bo towarzysz mojej podróży potrafił wzbudzić szacunek.",
      "- Były też dobre strony. Poznaliśmy miejsca, o których wielu nie słyszało. Było kilka miejsc, gdzie nas ciepło witano, i tam wracaliśmy z chęcią. W takim miejscu teraz siedzę.",
      "- Pytasz o koniec? Jestem jedynym świadkiem jego śmierci. Nadeszła nagle, podczas księżycowej pełni. Na kilka chwil przed walką usłyszałem od niego, że to jakiś wampir wyższy, a potem krzyczał, żebym brał nogi za pas i uciekał z tego przeklętego miejsca. Usłyszałem jego krzyk, urwany w połowie przeraźliwym charkotem. Wróciłem tu, wiedziałem, że będą chcieli wiedzieć, co się stało.",
      "- Jego imię będzie pamiętane. Pamiętaj jednak, że są tacy, których imiona nigdy nie będą zapamiętane, bo nikt nie wiedział, że istnieli. Mam nadzieję, że twoje imię będzie zapamiętane. Tylko na tyle możesz liczyć."
    ],
    ch: [{ l: "Wracasz do rozmowy", to: 1 }] };

  SC[5] = { t: "Księgi na regale", chap: ["Prolog", "Wiedza kosztuje"],
    on: function (s, E) { s.flags.t_ksiegi = true; E.fakt("gen_domy"); E.fakt("gen_kolek"); E.fakt("gen_ogien"); },
    test: { at: "SU", sk: "Wiedza o bestiach", st: 13, label: "Księga Ras: czytanie ze zrozumieniem",
      ok: function (s, E) { E.fakt("draugr_rodzaj"); E.fakt("bruk_krzyk"); } },
    x: [
      "Siwy kładzie ci na kolanach wiekowy wolumin. Skóra okładki jest miękka od rąk, które ją wertowały. Pierwsza stronica kończy się ostrzeżeniem: znaleziono tu wszystko, co znane o rasach i istotach, które stąpają po tej ziemi. Niejednokrotnie przelała się krew badaczy, żebyś mógł to teraz czytać w zaciszu. Sama treść może być dla ciebie szkodliwa. Znam takich, którzy wpadli w obłęd. Pamiętaj, wiedza kosztuje.",
      "Przeglądasz karty. Domy, Rada, kasty. O wampirach więcej tu domysłów niż pewności. Zapisujesz to, co wydaje się najbardziej użyteczne: czym zabijać, czym straszyć, gdzie szukać kryjówki. Starzec patrzy na ciebie znad kubka i niczego nie komentuje."
    ],
    after: [
      { t: "ok", x: "Przy kilku wpisach wyłapujesz coś więcej: kto zostaje nieumarłym i na co zwracać uwagę, gdy wieś opowiada o krzyku w nocy. Zapisujesz to w Dzienniku, zanim zdążysz zapomnieć." },
      { t: "no", x: "Tekst jest gęsty jak błoto. Wyławiasz tylko to, co zdążysz zapamiętać, i wiesz, że sporo przeoczyłeś." }
    ],
    ch: [{ l: "Zamykasz księgę i wracasz do rozmowy", to: 1 }] };

  SC[6] = { t: "Zlecenie", chap: ["Prolog", "Szarówka"],
    on: function (s, E) { E.dodaj("bandaz", 2); },
    x: [
      "- Do Szarówki dwa dni drogi na północ, na wyżynach - mówi starzec, wyciągając spod ławy zawiniątko. W środku dwa zwoje bandaży i słoik tłustej maści. - Mieszka tam mój krewny, sołtys. Pisze, że od tygodnia giną im zwierzęta. Nie jedna sztuka, nie dwie. Całe stada, zagonione na śmierć, jakby ktoś je ścigał całą noc. A rano ślady idą w jedną stronę, na wzgórze.",
      "- Mówią, że to wilki. Wilki, mówią. - Pije z kubka. - Wilki nie gonią bydła, żeby je zabić i zostawić. Ludzie z wyżyn są uparci, i jeśli teraz zaczęli się bać, to już nie wilków.",
      "- Sołtys zapłaci. Niewiele, bo nikt tam nic nie ma, ale uczciwie. Na drogę nie dam ci nic poza tą maścią i radą. Rada jest taka: nie wchodź tam z nikim. Takie rzeczy mają swoje prawa. Jeśli nie wiesz jakie, zapytaj starych bab."
    ],
    ch: [{ l: "Ruszasz na północ", to: 7 }] };

  /* ===================== DROGA ===================== */
  SC[7] = { t: "Pierwsza noc na szlaku", chap: ["Rozdział I", "Dwa dni na wyżyny"], intro: [
    "Wyżyny nie witają. Deszcz idzie poziomo, buty nasiąkają po pierwszej godzinie i potem już tylko ciągną w dół. Do zmierzchu mijasz trzy puste wsie, w których drzwi są zaparte od środka, i jedną, w której ktoś patrzy na ciebie przez szparę w okiennicy i nie otwiera."],
    x: [
      "Zmierzcha się. Droga rozdziela się: przy skrzyżowaniu stoi zagroda z dymem nad dachem, a dalej ciemny zagajnik, w którym możesz rozpalić ogień. Jedno i drugie ma swoje wady. Pierwsze wymaga rozmowy z kimś, kto cię nie lubi. Drugie wymaga, żebyś nie zasnął za głęboko.",
      "Nocleg to nie luksus, tylko rachunek: ile ciepła masz na sobie, ile jeszcze masz w sobie i czy masz czym zapalić. Karta postaci i plecak pokażą ci, ile zimna i głodu już uzbierałeś."
    ],
    ch: [
      { l: "Poprosić o stodołę w zagrodzie (Charyzma, ST 11)", test: { sk: "Charyzma", st: 11, label: "Nocleg u obcych" }, toOk: 71, toNo: 72,
        fx: function (s, E) { E.czas(1); } },
      { l: "Rozpalić ognisko w zagajniku", to: 8, c: function (s) { return EN.has(s, "krzesiwo"); }, why: "Nie masz krzesiwa",
        fx: function (s, E) { E.czas(1); E.nocleg("ognisko"); } },
      { l: "Przespać się pod drzewem, bez ognia", to: 8, fx: function (s, E) { E.czas(1); E.nocleg("niebo"); } }
    ] };

  SC[71] = { t: "Stodoła", chap: ["Rozdział I", "Obcy dach"],
    on: function (s, E) { E.nocleg("stodola"); },
    x: ["Gospodarz patrzy na ciebie dłuższą chwilę, na miecz u pasa, na płaszcz w dziurach. Potem wzrusza ramionami i wskazuje stodołę. Nie pyta o imię. Śpisz na sianie, a krowy oddychają w ciemności jak spokojne duchy. Rano w progu stoi garnek z wodą i połówka chleba. Gospodarza już nie ma."],
    ch: [{ l: "Ruszasz dalej", to: 8 }] };

  SC[72] = { t: "Zamknięte drzwi", chap: ["Rozdział I", "Odmowa"],
    on: function (s, E) { E.nocleg("niebo"); },
    x: ["- Tu nie ma dla ciebie miejsca - mówi gospodarz przez drzwi, których nie otwiera. - Łowców tu nie trzymamy. Pójdź tam, skąd przyszedłeś.", "Nie dyskutujesz. Sypiasz pod płotem, w deszczu, w mokrym płaszczu, z ręką na rękojeści. Rano jesteś wymarznięty bardziej, niż chciałbyś się przyznać."],
    ch: [{ l: "Ruszasz dalej", to: 8 }] };

  SC[8] = { t: "Drugi dzień", chap: ["Rozdział I", "Pod górę"], intro: [
    "Drugi dzień idzie pod górę, w mgle, która siada na ramionach jak mokry pies. Droga staje się ścieżką, ścieżka śladem, ślad zawraca, a ty zgadujesz, czy to ty się zgubiłeś, czy wyżyny wolą, żebyś nie dotarł. Zerkasz na buty. Dopiero teraz widzisz, że woda ma w nich stałe miejsce zamieszkania."],
    x: ["Pod wieczór widzisz pierwsze dachy Szarówki: kilkanaście chat z szarych bali, ukrytych w zagłębieniu jak zwierzęta, które wiedzą, że ktoś na nie poluje. Nad nimi, na łysym wzgórzu, widać kopiec. Zbyt okrągły jak na naturalną rzecz. Zbyt cichy jak na miejsce, gdzie wieje."],
    ch: [{ l: "Wchodzisz do wsi", to: 9, fx: function (s, E) { E.czas(2); } }] };

  SC[9] = { t: "Szarówka", chap: ["Rozdział II", "Wieś pod kurhanem"], intro: [
    "Szarówka stoi w zagłębieniu terenu, którego nie ruszyłaby ani powódź, ani woda z nieba. Tak przynajmniej myślano, kiedy ją stawiano. Kilkanaście domów, karczma, kramik, kuźnia pod dachem z dranic. Psy szczekają krótko i cichną, jakby nauczono je, że głośne szczekanie przyciąga.",
    "Ludzie na twój widok odwracają głowy. Na wyżynach nikt nie patrzy Łowcy w twarz. Wiedzą, kim jesteś, i wiedzą, co ci zawdzięczą, jeśli się uda. Wiedzą też, że nie będą cię o tym przypominać."],
    x: [
      "Zmierzcha. Kiedy stajesz na wiejskim placu, z zagrody obok wychodzi mężczyzna w skórzanym fartuchu, patrzy na ciebie, na miecz i mówi cicho: - Jeśli to ty od Siwego, sołtys czeka w karczmie. Idź tam, zanim zrobi się całkiem ciemno. Po zmroku nikt tu nie wychodzi."
    ],
    ch: [{ l: "Idziesz na wiejski plac", to: 10 }] };

  /* ===================== HUB ===================== */
  SC[10] = { t: "Szarówka", chap: ["Rozdział II", "Wieś"], intro: [
    { c: function (s) { return s.pora === 2; }, x: "Zmierzcha się. Drzwi chat zamykają się jedne po drugich, bez trzasku, z odruchem ludzi, którzy robią to każdego wieczoru od tygodnia." },
    { c: function (s) { return s.pora <= 1; }, x: "Dzień w Szarówce jest szary jak jej nazwa. Z rynny nad karczmą kapie woda, kmiotki idą do swoich obowiązków z oczami wbitymi w ziemię." },
    { c: NIGHT, x: "Noc. Szarówka wygląda jak wymarła. W oknach nie ma światła, ale czujesz setkę oczu przyklejonych do szczelin." }],
    x: [
      { c: function (s) { return (s.flags.strach || 0) >= 3; }, x: "Strach jest tu teraz namacalny. Dwie rodziny już spakowały wozy. Ktoś pyta cię na głos, czy w ogóle ma sens zostawać." },
      { c: function (s) { return !!s.flags.ucieklem; }, x: "Ludzie patrzą na ciebie inaczej, niż rano. Uciekłeś, a oni to widzieli." },
      "Co robisz?"
    ],
    ch: [
      { l: "Karczma „Pod Zdechłym Kozłem”", to: 11, vis: DAY, fx: function (s, E) { E.czas(1); } },
      { l: "Kramik Szymona", to: 12, vis: DAY, fx: function (s, E) { E.czas(1); } },
      { l: "Zagroda, w której zginęło bydło", to: 13, vis: LIGHT, fx: function (s, E) { E.czas(1); }, hint: "Tylko za dnia" },
      { l: "Chata pasterza Wojtka", to: 14, vis: DAY, fx: function (s, E) { E.czas(1); } },
      { l: "Kurhan na wzgórzu", to: 15, vis: LIGHT, fx: function (s, E) { E.czas(1); }, hint: "Tylko za dnia" },
      { l: "Chata zielarki Marzanny", to: 16, vis: DAY, fx: function (s, E) { E.czas(1); } },
      { l: "Zebrać myśli i ustalić, z czym masz do czynienia", to: 20 },
      { l: "Iść na kurhan, teraz", to: 24, vis: function (s) { return !!s.flags.sołtys || DAY(s) || NIGHT(s); }, hint: "Przygotowania i decyzja" },
      { l: "Szukać noclegu", to: 17, vis: function (s) { return s.pora >= 2; } },
      { l: "Czuwać na skraju wsi", to: 18, vis: NIGHT }
    ] };

  /* ===================== LUDZIE I MIEJSCA ===================== */
  SC[11] = { t: "Pod Zdechłym Kozłem", chap: ["Rozdział II", "Karczma"], intro: [
    "Karczma ma jedną izbę i jeden piec. Przy piecu siedzi człowiek o twarzy, którą mogłaby nosić skała: sołtys Mirosław Kruk, pięćdziesiąt kilka lat, ręce jak szpadle. Naprzeciw niego karczmarz Gniewko, tłusty i zmęczony, wyciera ten sam kufel od dwóch minut."],
    x: [
      { c: N("sołtys"), x: "- Siwy pisał, że przyślesz kogoś. - Sołtys mierzy cię wzrokiem. - Nie miał pisać, że kogoś takiego. Dobrze, to słuchaj. Ginie nam bydło, od tygodnia. Pasterz Wojtek ledwo uszedł z życiem. Dziesięć dni temu mój sąsiad stracił dwadzieścia owiec w jedną noc. Nie wilk, nie zbójca, nie głód. Płacę trzydzieści miedziaków, jeśli to się skończy, i zapłacę wcześniej, jeśli wcześniej się skończy."
        + "\n\nCicha uwaga: Łowcy są poza prawem, i sołtys o tym wie. Nie powie tego na głos, ale będzie się pilnować, żeby nikt z zewnątrz nie dowiedział się, że płacił." },
      { c: F("sołtys"), x: "Sołtys podnosi głowę znad kubka i patrzy na ciebie z tym wyrazem, który widziałeś już w wielu karczmach: nadzieja zmieszana z poczuciem winy, że w ogóle potrzebuje takiej nadziei." }
    ],
    on: function (s, E) { if (!s.flags.sołtys) { s.flags.sołtys = true; E.notatka("Sołtys Kruk płaci 30 MD, jeśli polowanie się uda."); } },
    ch: [
      { l: "Targować się o zapłatę (Charyzma, ST 12)", test: { sk: "Charyzma", st: 12, label: "Targ z sołtysem",
          ok: function (s, E) { s.flags.targ_ok = true; E.chip("Sołtys zgadza się na 45 MD i kolację", "pos"); },
          no: function (s, E) { E.chip("Sołtys się obraża. Zostaje przy 30 MD", "neg"); } }, to: 11, c: N("targ_probowano"), why: "Już próbowałeś",
        fx: function (s, E) { s.flags.targ_probowano = true; } },
      { l: "Zapytać o Jędrzeja Wronę", to: 111, vis: N("jedrzej_pytano") },
      { l: "Wynająć miejsce w izbie na noc (3 MD)", to: 112, vis: function (s) { return s.pora >= 2; }, c: function (s) { return s.money >= 3 * MD; }, why: "Brakuje Ci 3 MD" },
      { l: "Wychodzisz", to: 10 }
    ] };

  SC[111] = { t: "O Jędrzeju", chap: ["Rozdział II", "Karczma"],
    on: function (s, E) { s.flags.jedrzej_pytano = true; E.notatka("Jędrzej Wrona: wdowiec, pochowany w kurhanie bez księdza, bo ziemia była zmarznięta. Nie pił."); },
    x: [
      "- Jędrzej Wrona? - Sołtys i karczmarz wymieniają spojrzenia. - Dobry człowiek był. Po śmierci żony, Hanny, jesienią, zamknął się w sobie. Nie pił, nie zbierał długów, nie hałasował. Nikomu nie zawiniał. Zimą znaleźliśmy go na belce.",
      "- Ziemia była zmarznięta na łokieć głębokości - mówi karczmarz cicho. - Nie dało się wykopać grobu. Ksiądz z doliny nie przyjechał, bo drogi pozamiatało śniegiem. Zawinęliśmy go w płótno i położyliśmy do starego kurhanu na wzgórzu, żeby nie leżał na mrozie, aż ziemia puści. No i... ziemia puściła. Ale my już tam nie poszliśmy.",
      "- Nikt nie lubi chodzić na ten kurhan - dodaje sołtys. - Od zawsze był przeklęty. Dziadowie mówili, że to grób jakiegoś dawnego pana. Nikt nie znał jego imienia."
    ],
    ch: [{ l: "Wracasz do rozmowy", to: 11 }] };

  SC[112] = { t: "Nocleg w izbie", chap: ["Rozdział II", "Pod dachem"],
    x: ["Pościel pachnie kapustą i dymem, pod głową masz worek słomy. Za ścianą ktoś kaszle całą noc. Mimo to śpisz jak człowiek, który ma nad sobą dach, a przed sobą drzwi, i jest to najlepsze, co może ci dać Szarówka."],
    on: function (s, E) { E.kasa(-3 * MD); E.nocleg("karczma"); nightFall(s, E); },
    ch: [{ l: "Rano", to: 19 }] };

  SC[12] = { t: "Kramik Szymona", chap: ["Rozdział II", "Handel"], intro: [
    "Szymon, kramarz, ma twarz człowieka, który widział bankructwo i go nie wybaczył. Jego kramik to trzy półki i beczka. Pytasz o ceny. Odpowiada, nie podnosząc wzroku: - Wszystko za miedziaki. Wymiany nie biorę, chyba że to coś, czego sam potrzebuję."],
    x: ["Na wyżynach rzadko spotyka się zastaw większy niż koza. Dziś to, co leży na półkach, jest jedyną ofertą w promieniu dwóch dni drogi."],
    shop: { title: "Kramik Szymona", sell: true,
      stock: [{ id: "racja" }, { id: "bandaz" }, { id: "pochodnia" }, { id: "olej" }, { id: "krzesiwo" }, { id: "kolek" }, { id: "lopata" },
        { id: "sol" }, { id: "ocet" }, { id: "kozik" }, { id: "topor" }, { id: "maczuga" },
        { id: "trzewiki" }, { id: "buty" }, { id: "plaszcz" }, { id: "kurtka" }, { id: "spodnie_s" }, { id: "czepiec" },
        { id: "p_skorzany" }, { id: "p_cwiek" }] },
    ch: [{ l: "Wychodzisz", to: 10 }] };

  SC[13] = { t: "Zagroda Kopciuchów", chap: ["Rozdział II", "Ślady"], intro: [
    "Zagroda jest na skraju wsi, pod wzgórzem. Obora otwarta, wrota wyrwane z zawiasów. W środku leżą krowy, w pozach, które żadnej krowie się nie przytrafiają: łby zadarte, oczy wywrócone, kopyta zakrzywione od biegu, którego nie dokończyły."],
    test: { sk: "Tropienie", st: 11, label: "Czytanie śladów", ok: function (s, E) { E.fakt("draugr_sila"); E.notatka("Ślady: ciężkie, bosych stóp, głęboko w błocie. Ślad ciągnięcia z kurhanu."); } },
    on: function (s, E) { E.fakt("draugr_zazdr"); },
    x: [
      "Obchodzisz oborę wolno. Krowy nie mają ran. Są po prostu martwe, jakby ktoś zaganiał je całą noc, aż serce stanęło. To nie wygląda na wilki. Nie wygląda też na ludzi."
    ],
    after: [
      { t: "ok", x: "Przy wyrwanych wrotach, w błocie, odciski bosych stóp. Za duże jak na człowieka, za głębokie jak na samotnego. Za nimi ślad ciągnięcia. To, co tu było, szło wolno, bez pośpiechu, i wracało prosto na wzgórze, jakby znało drogę na pamięć. Dotykasz śladu: woda w nim jest zimna jak studnia w styczniu, choć błoto wokół jeszcze nie zamarzło." },
      { t: "no", x: "Ślady są, ale deszcz rozmył to, co mogło coś znaczyć. Widzisz tylko, że wszystko idzie jednym kierunkiem: na wzgórze." }
    ],
    ch: [{ l: "Wychodzisz", to: 10 }] };

  SC[14] = { t: "Chata Wojtka", chap: ["Rozdział II", "Ranny pasterz"], intro: [
    "Wojtek Kopeć leży w łóżku z zabandażowaną ręką, w której nie ma już czucia. Ma z czterdzieści lat i wygląda na sześćdziesiąt. Patrzy na ciebie z lękiem, który ma już własny kształt: kształt stworzenia, które nie mruga."],
    x: [
      "- To nie wilk - powtarza, zanim ktokolwiek o to zapyta. - Wilk robi hałas. Tamto nie robiło. Przyszło po stado, ja stanąłem przed nim, a ono przeszło mnie, jak się przechodzi przez płot."
    ],
    ch: [
      { l: "Opatrzyć mu rękę (bandaż, Pierwsza pomoc)", to: 141, c: function (s) { return EN.has(s, "bandaz"); }, why: "Nie masz bandaży", vis: N("wojtek_pytany"),
        fx: function (s, E) { E.zabierz("bandaz", 1); E.rep("lud", 1); s.flags.wojtek_pytany = true; } },
      { l: "Naciskać, zmusić do mówienia (Zastraszanie, ST 10)", test: { sk: "Zastraszanie", st: 10, label: "Przesłuchanie",
          ok: function (s, E) { E.fakt("draugr_sila"); E.notatka("Wojtek: czarny, wysoki, bez krzyku. Patrzył i przeszedł."); },
          no: function (s, E) { E.chip("Wojtek zamyka się w sobie", "neg"); } }, to: 14, vis: N("wojtek_pytany"),
        fx: function (s, E) { s.flags.wojtek_pytany = true; E.rep("lud", -1); } },
      { l: "Wychodzisz", to: 10 }
    ] };

  SC[141] = { t: "Opatrunek", chap: ["Rozdział II", "Ranny pasterz"],
    on: function (s, E) { E.fakt("draugr_sila"); E.notatka("Wojtek: czarny, wysoki, zimny. Nie krzyczał. Patrzył. To wykluczało brukołaka."); },
    x: [
      "Rozwijasz stary opatrunek. Pod nim ręka jest sina i zimna jak coś, co dotknęło lodu. Czyścisz, smarujesz, wiążesz. Wojtek patrzy w sufit i mówi, jakby mówił do niego.",
      "- Był czarny. Nie jak sadza, jak śmierć. Wysoki jak drzwi. Zimny, czułem to z trzech kroków. Nie krzyknął. Wszyscy mówią, że takie rzeczy krzyczą. Ono nie. Ono patrzyło na mnie, jakby zazdrościło mi, że stoję. Jakby chciało mi to zabrać."
    ],
    ch: [{ l: "Wychodzisz", to: 10 }] };

  SC[15] = { t: "Kurhan", chap: ["Rozdział II", "Wzgórze"], intro: [
    "Kurhan jest wyższy, niż z dołu wyglądał. Trawa wokół jest dziwnie krótka, wypalona, jakby ktoś przeszedł tędy z lodem zamiast ognia. Nad wejściem, które nie jest wejściem, tylko szczeliną między dwoma głazami, wisi cisza."],
    test: { sk: "Spostrzegawczość", st: 12, label: "Szczegóły przy kopcu", ok: function (s, E) { E.fakt("draugr_dom"); E.notatka("Kurhan otwarty od środka. Ziemia przy wejściu zmrożona."); } },
    x: ["Chodzisz wokół kopca w deszczu. Nie wchodzisz, jeszcze nie."],
    after: [
      { t: "ok", x: "Przy wejściu kamień jest odsunięty od środka, nie od zewnątrz. Ziemia wokół szczeliny pokryta jest szronem, choć jesień dopiero zaczęła się na dobre. Zapach: mokra ziemia i coś słodkiego, od którego robi się nieswojo. Ktoś, kto leży tu za dnia, dobrze zna drogę do wsi w nocy." },
      { t: "no", x: "Kopiec jest kopcem. Szczelina między głazami za ciasna, żeby się przecisnąć, a odór z wnętrza odrzuca każdą ciekawość. Nic konkretnego nie przychodzi ci do głowy." }
    ],
    ch: [{ l: "Schodzisz", to: 10 }] };

  SC[16] = { t: "Chata Marzanny", chap: ["Rozdział II", "Zielarka"], intro: [
    "Marzanna mieszka na skraju lasu, w chacie tak starej, że sama wydaje się rośliną. Pęki ziół wiszą pod stropem. Zapach jest ostry i mądry. Sama Marzanna: niska, sucha, z oczami jak dwa świdry, patrzy na ciebie, jakbyś był chorobą, której nie jest pewna, czy chce leczyć."],
    x: [
      "- Wiem, po co przyszedłeś - mówi, zanim siadasz. - Pewnie nie oczekujesz, że po ludzku powiem ci wszystko za darmo.",
      { c: N("marzanna_rodzaj"), x: "Podaje ci kubek naparu i, nie dając czasu na odmowę, opowiada: - To nie wilk i nie zbójca. To Jędrzej. Nie, nie mów nic, sama widziałam, jak go pochowali. Człowiek, który odszedł bez księdza, bez modlitwy, w złym stanie, w ziemi, która go nie chciała. Takie rzeczy nie leżą cicho. Zazdroszczą żywym, wszystkiego, nawet pary z kubka." }
    ],
    on: function (s, E) { if (!s.flags.marzanna_rodzaj) { s.flags.marzanna_rodzaj = true; E.fakt("draugr_rodzaj"); E.fakt("gen_wiedzmy"); } },
    ch: [
      { l: "Zapłacić 5 MD za wskazówki, jak go zabić", to: 161, c: function (s) { return s.money >= 5 * MD; }, why: "Brakuje Ci 5 MD", vis: N("rytual_znany"),
        fx: function (s, E) { E.kasa(-5 * MD); } },
      { l: "Przekonać ją, by powiedziała za darmo (Charyzma, ST 12)", test: { sk: "Charyzma", st: 12, label: "Rozmowa z Marzanną" }, toOk: 161, toNo: 162, vis: N("rytual_znany") },
      { l: "Wychodzisz", to: 10 }
    ] };

  SC[161] = { t: "Rytuał", chap: ["Rozdział II", "Zielarka"],
    on: function (s, E) { s.flags.rytual_znany = true; E.fakt("draugr_rytual"); E.notatka("Marzanna: pojedynek jeden na jednego, ściąć głowę, spalić do zimnych popiołów, pogrzebać daleko albo oddać wodzie. Nikt nie może pomagać."); E.rep("wiedzmy", 1); },
    x: [
      "Marzanna przeciera dłonie fartuchem i wyciąga zza pieca zakurzoną księgę, którą ledwo otwiera. - Nie czytaj, tylko słuchaj. Taki jak on odchodzi tylko wtedy, kiedy zmierzy się go jeden na jednego. Jeśli ktoś stanie obok ciebie, choćby po to, żeby pomóc, nic nie wyjdzie. Rozumiesz? Nic.",
      "- Kiedy położysz go, ściąć mu głowę. Mieczem, siekierą, byle ostrym. Potem spalić, do zimnych popiołów, nie do ciepłych. A popioły, to najważniejsze, trzeba pogrzebać daleko od wsi. Albo oddać wodzie. Rzeka weźmie je dalej, niż ty zaniesiesz. Jeśli zostawisz je blisko, wróci. Jeśli zostawisz ciało całe, wróci. Jeśli ktoś ci pomoże, wróci."
    ],
    ch: [{ l: "Dziękujesz i wychodzisz", to: 10 }] };

  SC[162] = { t: "Odmowa", chap: ["Rozdział II", "Zielarka"],
    x: ["Marzanna uśmiecha się cienko. - Młody, zadziorny, i chciałby wszystko za darmo. Nie ze mną. Wróć, jak zrozumiesz, że wiedza ma cenę. Teraz idź, bo mi zioła więdną od twojego ciężkiego oddechu."],
    ch: [{ l: "Wychodzisz", to: 10 }] };

  /* ===================== NOC I RANO ===================== */
  SC[17] = { t: "Nocleg w Szarówce", chap: ["Rozdział II", "Noc"], intro: [
    "Szarówka wygląda w nocy jak opuszczona. Nikt nie pali świateł, nikt nie spaceruje. Tylko psy czasem warczą, a potem cichną, jakby ktoś odebrał im głos."],
    x: ["Musisz się gdzieś ułożyć. Możesz zaryzykować stodołę, wynająć miejsce w karczmie albo przespać się pod chmurką, jak na szlaku."],
    ch: [
      { l: "Wynająć miejsce w karczmie (3 MD)", to: 112, c: function (s) { return s.money >= 3 * MD; }, why: "Brakuje Ci 3 MD" },
      { l: "Przespać się w stodole przy placu", to: 19, fx: function (s, E) { E.nocleg("stodola"); nightFall(s, E); } },
      { l: "Przespać się pod chmurką", to: 19, fx: function (s, E) { E.nocleg("niebo"); nightFall(s, E); } }
    ] };

  SC[18] = { t: "Straż na skraju wsi", chap: ["Rozdział II", "Czuwanie"], intro: [
    "Siadasz pod ścianą stodoły, tak, żeby widzieć ścieżkę na wzgórze, i czekasz. Deszcz przechodzi w mżawkę, mżawka w ciszę, cisza w coś, co jest gorsze od ciszy."],
    test: { sk: "Spostrzegawczość", st: 11, label: "Czuwanie", ok: function (s, E) { E.fakt("draugr_dom"); E.notatka("Nocą wraca przed świtem do kurhanu."); } },
    x: ["Przez długą chwilę nic się nie dzieje."],
    after: [
      { t: "ok", x: "Około północy dostrzegasz cień, który nie pasuje do żadnego cienia drzew. Idzie powoli, powłócząc nogami, w stronę zagrody na skraju wsi, z której dobiega rozpaczliwe rżenie. Nie biegnie. Nie musi. Potem zawraca, wolno, i znika w kierunku wzgórza. Wiesz już, dokąd ma wrócić przed świtem." },
      { t: "no", x: "Przysypiasz, choć obiecałeś sobie, że nie zaśniesz. Budzi cię krzyk w oddali, potem cisza. Za późno, żeby cokolwiek zobaczyć." }
    ],
    ch: [
      { l: "Ruszyć za nim w ciemność, teraz", to: 24, vis: function (s) { return s.tr === "ok"; }, fx: function (s, E) { s.flags.nocny_pochod = true; } },
      { l: "Pozwolić odejść i doczekać rana", to: 19, fx: function (s, E) { E.nocleg("niebo"); nightFall(s, E); } }
    ] };

  SC[19] = { t: "Poranek", chap: ["Rozdział II", "Rano"], intro: [
    "Rano w Szarówce wygląda jak po stypie: mokro, szaro i bez słów."],
    x: [
      { c: function (s) { return s.flags.noce === 1; }, x: "Ludzie stoją w grupkach. Znaleziono kolejne zagrody z martwymi zwierzętami. Psy leżą rządkiem przy płocie jak śpiące." },
      { c: function (s) { return s.flags.noce === 2; }, x: "Wieś nie stoi w grupkach, tylko wokół jednego miejsca. Parobek Staszek został znaleziony przy studni. Bez śladów, bez krwi, tylko oczy otwarte i twarz zwrócona w stronę wzgórza. Kobiety płaczą w milczeniu, mężczyźni zaciskają szczęki. Sołtys patrzy na ciebie i nie musi nic mówić." },
      { c: function (s) { return (s.flags.noce || 0) >= 3; }, x: "Szarówka jest jak chora. Dwie rodziny odjechały nocą. Kramik Szymona stoi zamknięty. Ci, którzy zostali, patrzą na ciebie z mieszaniną nadziei i pretensji, z którą nie umiesz nic zrobić." }
    ],
    ch: [{ l: "Wracasz do wsi", to: 10 }] };

  /* ===================== ROZPOZNANIE ===================== */
  SC[20] = { t: "Co to jest?", chap: ["Rozdział III", "Zebrać myśli"], intro: [
    "Siadasz z boku, wyciągasz notatki i układasz je w głowie. Nie każdy łowca to robi. Wielu zginęło, bo uznali, że wystarczy ostrze."],
    x: [
      "Co wiesz:",
      { c: D("draugr_zazdr"), x: "- Bydło zagnane na śmierć, bez ran. Coś, co zazdrości żywym." },
      { c: D("draugr_sila"), x: "- Ślady: ciężkie, bosych stóp. Czarny, wysoki, zimny, nie krzyczy." },
      { c: D("draugr_dom"), x: "- Kurhan: otwarty od środka, ziemia wokół zmrożona. Wraca przed świtem." },
      { c: D("draugr_rodzaj"), x: "- Jędrzej Wrona: samobójca pochowany bez księdza i modlitwy." },
      { c: F("jedrzej_pytano"), x: "- Jędrzej nie pił, nie był niechlujny, nikomu nie wadził." },
      { c: D("bruk_krzyk"), x: "- Brukołak krzyczy raz w nocy, a kto odpowie, ginie. Tu nikt nie słyszał krzyku." },
      { c: D("draugr_rytual"), x: "- Znasz sposób: pojedynek jeden na jednego, głowa, ogień, popioły daleko." },
      { c: function (s) { return !s.dz.draugr_zazdr && !s.dz.draugr_sila && !s.dz.draugr_dom && !s.dz.draugr_rodzaj; }, x: "Niewiele. Zbyt niewiele, żeby sobie cokolwiek rozstrzygnąć." },
      "Możesz rozpoznać, z czym masz do czynienia. Od tego zależy, czego będziesz się trzymał w walce i czym będziesz ją kończył."
    ],
    ch: [
      { l: "To Draugr", to: 24, fx: function (s, E) { s.flags.rozp = "draugr"; E.chip("Wniosek: Draugr", "note"); } },
      { l: "To Brukołak", to: 24, fx: function (s, E) { s.flags.rozp = "brukolak"; E.chip("Wniosek: Brukołak", "note"); } },
      { l: "To Wrykołak", to: 24, fx: function (s, E) { s.flags.rozp = "wrykolak"; E.chip("Wniosek: Wrykołak", "note"); } },
      { l: "Wiem za mało. Wracam do wsi", to: 10 }
    ] };

  /* ===================== PRZYGOTOWANIA ===================== */
  SC[24] = { t: "Przygotowania", chap: ["Rozdział III", "Zanim wejdziesz"], intro: [
    { c: R("draugr"), x: "Jesteś pewien. Wszystko pasuje: zazdrość, siła, zimno, ślady, powrót przed świtem. Draugr, nieumarły z wyżyn. Teraz pytanie, czy wiesz, jak go skończyć." },
    { c: R("brukolak"), x: "Masz swoją teorię: obrzmiały, twardy, niosący zarazy. Czy to na pewno to, to inna sprawa. Ale każda teoria jest lepsza od braku." },
    { c: R("wrykolak"), x: "Wrykołak. Pijak, który nie umie leżeć w grobie. Zabija się go gwoździem w pępek albo wrzącym olejem. Brzmi dziwnie, ale Łowca nie wybrzydza." },
    { c: function (s) { return !s.flags.rozp; }, x: "Nie rozstrzygnąłeś, z czym masz do czynienia. Idziesz na ślepo." }],
    x: [
      { c: N("bartek_sprawa"), x: "Gdy wychodzisz z placu, ktoś staje ci na drodze. Młody chłopak, może dziewiętnaście lat, kosa przewieszona przez ramię. Bartek, syn sołtysa. - Idę z tobą - mówi twardo. - Moja wieś. Mój obowiązek. Nie będę siedział w domu, kiedy cudzy człowiek ryzykuje życie." },
      { c: F("bartek_sprawa"), x: "Bartek stoi gdzieś z boku i udaje, że go tam nie ma." }
    ],
    ch: [
      { l: "Odesłać Bartka do domu (Zastraszanie, ST 11)", vis: N("bartek_sprawa"), test: { sk: "Zastraszanie", st: 11, label: "Odesłanie Bartka" }, toOk: 241, toNo: 242 },
      { l: "Przekonać go, że może pomóc inaczej (Charyzma, ST 12)", vis: N("bartek_sprawa"), test: { sk: "Charyzma", st: 12, label: "Przekonanie Bartka" }, toOk: 241, toNo: 242 },
      { l: "Pozwolić mu iść z Tobą", to: 243, vis: N("bartek_sprawa") },
      { l: "Zrobić jeszcze zakupy w kramiku", to: 12, fx: function (s, E) { E.czas(1); } },
      { l: "Wejść do kurhanu za dnia", to: 30, vis: function (s) { return LIGHT(s) && !!s.flags.bartek_sprawa; } },
      { l: "Czekać nocą przy kurhanie", to: 26, vis: function (s) { return !!s.flags.bartek_sprawa; },
        fx: function (s, E) { if (s.pora < 3) E.czas(3 - s.pora); } },
      { l: "Wracasz do wsi", to: 10 }
    ] };

  SC[241] = { t: "Bartek zostaje", chap: ["Rozdział III", "Zanim wejdziesz"],
    on: function (s, E) { s.flags.bartek_sprawa = true; E.rep("lud", 1); },
    x: ["Bartek opuszcza głowę, zaciska szczękę i, choć widać, że kosztuje go to więcej niż wszystko, co dotąd zrobił w życiu, cofa się. - Wróć - mówi cicho. - Żywy."],
    ch: [{ l: "Wracasz do przygotowań", to: 24 }] };

  SC[242] = { t: "Bartek nie słucha", chap: ["Rozdział III", "Zanim wejdziesz"],
    on: function (s, E) { s.flags.bartek_sprawa = true; s.flags.bartek_idzie = true; s.flags.bartek_los = EN.d(2); },
    x: ["Bartek kiwa głową, patrzy ci w oczy i mówi, że rozumie. Jest w tym coś, co nie przekonuje. Odwraca się i wraca do domu. Ale w jego chodzie jest coś, co każdy Łowca zna z doświadczenia: to krok człowieka, który właśnie podjął decyzję i nie zamierza o niej nikomu mówić."],
    ch: [{ l: "Wracasz do przygotowań", to: 24 }] };

  SC[243] = { t: "Bartek idzie", chap: ["Rozdział III", "Zanim wejdziesz"],
    on: function (s, E) { s.flags.bartek_sprawa = true; s.flags.bartek_idzie = true; s.flags.bartek_los = EN.d(2); E.chip("Bartek idzie z Tobą", "neg"); },
    x: ["Bartek rozjaśnia się jak mały chłopiec. Podaje ci rękę, niezdarnie, jak przyjacielowi. Z jakiegoś powodu czujesz, że właśnie popełniłeś błąd, którego nie umiesz nazwać."],
    ch: [{ l: "Wracasz do przygotowań", to: 24 }] };

  /* ===================== KURHAN: DZIEŃ ===================== */
  SC[30] = { t: "Do wnętrza za dnia", chap: ["Rozdział IV", "Szczelina"], intro: [
    "Idziesz na wzgórze przy szarym świetle dnia. Deszcz ustał, i to jest gorsze, bo teraz słyszysz własne kroki. Przy szczelinie między głazami stoisz dłużej, niż chciałbyś przyznać."],
    x: ["Wnętrze kurhanu śpi. Jeśli to, co w nim leży, nie czuje twojej obecności, możesz mieć przewagę pierwszego ciosu. Ale najpierw trzeba odsunąć kamień i nie narobić hałasu."],
    ch: [
      { l: "Odsunąć kamień i wejść cicho (Skradanie, ST 12)", test: { sk: "Skradanie", st: 12, label: "Wejście do kurhanu" }, toOk: 31, toNo: 311 },
      { l: "Wycofać się", to: 24 }
    ] };

  SC[31] = { t: "Uśpiony", chap: ["Rozdział IV", "Szczelina"],
    fight: { foes: [{ base: "draugr", atkMod: -1, n: "Draugr" }], surprise: 2, noFlee: false, flee: 32, cover: 0 },
    x: [
      "Wnętrze jest szersze, niż się spodziewałeś. Zimne powietrze uderza w twarz jak płótno. Na ziemi, w niszy, leży Draugr. Nie oddycha, nie rusza się, ale w jego bezruchu jest coś, co każe myśleć o zwierzęciu, które udaje martwe. Czarna skóra, zapadnięte policzki, dłonie jak korzenie.",
      "Wyciągasz miecz i robisz krok."
    ],
    after: [{ x: "Wyskakuje z ciemności ostatnim ruchem, którego się nie spodziewał nawet on sam. A potem, nagle, jest tylko cisza, i ciężki oddech tego, kto przeżył." }],
    ch: [{ l: "Zająć się rytuałem", to: 28, c: function (s) { return !!s.flags.pokonany_draugr; }, why: "Walka jeszcze trwa" }] };

  SC[311] = { t: "Hałas", chap: ["Rozdział IV", "Szczelina"],
    fight: { foes: [{ base: "draugr", n: "Draugr" }], surprise: 0, flee: 32 },
    x: [
      "Kamień trzeszczy, kruszy się coś pod stopą. W niszy poruszają się oczy, które nie mają białek. Wielki cień unosi się z ziemi, prostując się bez pośpiechu. Nie rzuca się. Podchodzi, jakby sprawdzał, kto ma odwagę stać."
    ],
    after: [{ x: "Kiedy cień w końcu pada, w grobowcu zapada cisza, a ty stoisz nad nim dłuższą chwilę, dopóki ręce przestają drżeć." }],
    ch: [{ l: "Zająć się rytuałem", to: 28, c: function (s) { return !!s.flags.pokonany_draugr; }, why: "Walka jeszcze trwa" }] };

  /* ===================== KURHAN: NOC ===================== */
  SC[26] = { t: "Kurhan nocą", chap: ["Rozdział IV", "Pojedynek"], intro: [
    "Idziesz na wzgórze o zmroku. Księżyc, jeśli jest, przecieka przez chmury jak mleko przez płótno. Kurhan czeka. Z jego szczeliny sączy się chłód, który czujesz przez skórę.",
    { c: function (s) { return EN.isFull(s.day); }, x: "Dziś pełnia. Księżyc patrzy wprost na kopiec i wszystko jest widoczne aż za dobrze. Coś w tym świetle czyni to, co w kopcu, silniejszym." }],
    x: [
      "Czekasz. Wiatr łamie się o głazy. Kiedy w końcu to wychodzi, nie robi tego z pośpiechem. Przez szczelinę przeciska się najpierw ręka, długa i czarna, potem ramię, potem ciało, które nie powinno się już poruszać. Jest wyższy, niż mówił Wojtek. Bez butów, w resztkach płótna. Zwraca ku tobie twarz, której nie ma sensu opisywać.",
      { c: F("bartek_idzie"), x: "Z krzaków za twoimi plecami wypada Bartek z kosą w obu rękach, krzycząc coś, co brzmi jak imię jego ojca. Draugr patrzy na niego, potem na ciebie. Pojedynek, który miał być jeden na jednego, przestaje być pojedynkiem." }
    ],
    on: function (s, E) { if (s.flags.bartek_idzie) { s.flags.rytual_zepsuty = true; E.chip("Pojedynek zepsuty przez Bartka", "neg"); } },
    ch: [
      { l: "Stanąć do walki", to: 27 }
    ] };

  SC[27] = { t: "Draugr", chap: ["Rozdział IV", "Pojedynek"],
    fight: { foes: [{ base: "draugr", n: "Draugr" }], nightFull: true, noFlee: false, flee: 32 },
    x: ["Pierwsza rzecz, jaką zauważasz, to że nie czujesz żadnej złości. Tylko zimno i głód, i dziwny żal, który nie ma w tej chwili żadnego uzasadnienia."],
    after: [
      { c: function (s) { return !!s.flags.pokonany_draugr; }, x: "Draugr osuwa się na kolana, potem na ziemię. Nie rusza się, ale też nie jest martwy w żaden sposób, który rozumiesz. Zimno unosi się z niego jak z lodu." },
      { c: function (s) { return !!s.flags.bartek_idzie && s.flags.bartek_los === 1; }, x: "Bartek leży kilka kroków dalej, twarzą do ziemi. Dłoń zaciśnięta na drzewcu kosy. Nie rusza się." },
      { c: function (s) { return !!s.flags.bartek_idzie && s.flags.bartek_los === 2; }, x: "Bartek siedzi pod głazem, trzymając się za żebra, blady jak ściana. Żyje. Będzie żył, jeśli ktoś mu pomoże, i jeśli zdoła przekonać samego siebie, że ten wieczór się nie wydarzył." }
    ],
    ch: [{ l: "Zająć się rytuałem", to: 28, c: function (s) { return !!s.flags.pokonany_draugr; }, why: "Walka jeszcze trwa" }] };

  SC[32] = { t: "Ucieczka", chap: ["Rozdział IV", "Odwrót"],
    on: function (s, E) { s.flags.ucieklem = true; E.rep("lud", -1); E.czl(-5, "ucieczka"); s.flags.strach = (s.flags.strach || 0) + 1; E.czas(1); },
    x: ["Biegniesz. Nie jest to bohaterskie, ale też nie jest głupie. Wiatr szarpie płaszczem, a za plecami słychać zimne, powolne kroki, które nie muszą się spieszyć. Docierasz na plac w Szarówce, z sercem w gardle. Ludzie widzą. Nikt nic nie mówi."],
    ch: [{ l: "Wracasz do wsi", to: 10 }] };

  /* ===================== RYTUAŁ ===================== */
  SC[28] = { t: "Rytuał", chap: ["Rozdział V", "Po walce"], intro: [
    "Draugr leży. Chłód, który z niego idzie, zamraża ci oddech. Czujesz, że to jeszcze nie koniec."],
    x: [
      { c: D("draugr_rytual"), x: "Wiesz, co dalej: głowa, ogień, popioły daleko. Zrób to jak należy, w kolejności, bez pomocy." },
      { c: function (s) { return !s.dz.draugr_rytual; }, x: "Coś nie daje ci spokoju. Wydaje ci się, że to jeszcze nie koniec, ale nie wiesz, co dalej. Zostaje intuicja i to, co przeczytałeś." },
      { c: F("r_glowa"), x: "- Głowa leży osobno." },
      { c: F("r_ogien"), x: "- Ciało i głowa spalone do zimnych popiołów." },
      { c: function (s) { return s.flags.r_pochowek === "daleko"; }, x: "- Popioły pochowane daleko od ludzi." },
      { c: function (s) { return s.flags.r_pochowek === "hanna"; }, x: "- Popioły spoczęły przy grobie Hanny." },
      { c: function (s) { return s.flags.r_pochowek === "blisko"; }, x: "- Popioły zostały blisko wsi." }
    ],
    ch: [
      { l: "Ściąć mu głowę", to: 28, vis: N("r_glowa"), c: function (s) { return !!EN.weapon(s).ciecie; }, why: "Twoja broń nie nadaje się do ścinania głowy",
        fx: function (s, E) { s.flags.r_glowa = true; E.chip("Głowa odcięta", "note"); } },
      { l: "Spalić ciało i głowę", to: 28, vis: function (s) { return !!s.flags.r_glowa && !s.flags.r_ogien; },
        c: function (s) { return EN.has(s, "krzesiwo") && (EN.qty(s, "olej") >= 1 || EN.qty(s, "pochodnia") >= 2); }, why: "Potrzebujesz krzesiwa i oleju (albo dwóch pochodni)",
        fx: function (s, E) { if (EN.qty(s, "olej") >= 1) E.zabierz("olej", 1); else E.zabierz("pochodnia", 2); s.flags.r_ogien = true; E.czas(1); E.chip("Zimne popioły", "note"); } },
      { l: "Przypomnieć sobie, co jeszcze trzeba zrobić (Wiedza o bestiach, ST 14)", vis: function (s) { return !s.dz.draugr_rytual; },
        test: { sk: "Wiedza o bestiach", st: 14, label: "Intuicja Łowcy", ok: function (s, E) { E.fakt("draugr_rytual"); } }, to: 28 },
      { l: "Zanieść popioły daleko od wsi i pogrzebać je w ziemi", to: 29, vis: function (s) { return !!s.flags.r_ogien && !s.flags.r_pochowek; }, c: D("draugr_rytual"), why: "Nie wiesz, że to wymagane",
        fx: function (s, E) { s.flags.r_pochowek = "daleko"; E.czas(1); } },
      { l: "Wrzucić popioły do rzeki", to: 29, vis: function (s) { return !!s.flags.r_ogien && !s.flags.r_pochowek; }, c: D("draugr_rytual"), why: "Nie wiesz, że to wymagane",
        fx: function (s, E) { s.flags.r_pochowek = "daleko"; E.czas(1); } },
      { l: "Pochować popioły obok grobu Hanny, żony Jędrzeja", to: 29, vis: function (s) { return !!s.flags.r_ogien && !s.flags.r_pochowek; },
        fx: function (s, E) { s.flags.r_pochowek = "hanna"; E.czas(1); E.czl(10, "litość"); } },
      { l: "Zostawić popioły i wracać do wsi", to: 29, vis: function (s) { return !!s.flags.r_ogien && !s.flags.r_pochowek; },
        fx: function (s, E) { s.flags.r_pochowek = "blisko"; } },
      { l: "Wracać do wsi (rytuał nieskończony)", to: 29, vis: function (s) { return !s.flags.r_ogien; },
        fx: function (s, E) { s.flags.r_pochowek = "brak"; } }
    ] };

  SC[29] = { t: "Świt", chap: ["Rozdział V", "Rano"], intro: [
    "Idziesz do Szarówki, kiedy szarzeje, a deszcz wraca, jakby miał ci zrobić przysługę."],
    on: function (s, E) { if (s.pora !== 0) E.czas((4 - s.pora) % 4); },
    x: [
      { c: function (s) { return !!s.flags.rytual_zepsuty || s.flags.r_pochowek === "brak" || s.flags.r_pochowek === "blisko" || (!s.flags.r_glowa) || (!s.flags.r_ogien); },
        x: "Szarzeje. Coś w tobie podpowiada, że zrobiłeś za mało albo za źle. Nie masz dowodu. Masz tylko wieś, która ma wreszcie wyjść z domów." },
      { c: function (s) { return !s.flags.rytual_zepsuty && s.flags.r_pochowek === "daleko"; },
        x: "Szarzeje. Nic nie ciągnie cię z tyłu. Wiatr jest tylko wiatrem, a zimno tylko zimnem. Wiesz, że zrobiłeś to, co trzeba." },
      { c: function (s) { return s.flags.r_pochowek === "hanna" && !s.flags.rytual_zepsuty; },
        x: "Szarzeje. Zrobiłeś to inaczej, niż mówią księgi, bo uznałeś, że człowiek, który zazdrościł żywym, zasługuje na to, żeby choć raz leżeć przy tej, którą kochał. Nie wiesz, czy to nie był błąd. Nie wiesz jeszcze." }
    ],
    ch: [
      { l: "Wchodzisz do wsi", to: 33, c: function (s) { return !!s.flags.pokonany_draugr; }, vis: function (s) { return !(s.flags.rytual_zepsuty || s.flags.r_pochowek === "brak" || s.flags.r_pochowek === "blisko" || !s.flags.r_glowa || !s.flags.r_ogien); } },
      { l: "Wchodzisz do wsi", to: 36, vis: function (s) { return !!(s.flags.rytual_zepsuty || s.flags.r_pochowek === "brak" || s.flags.r_pochowek === "blisko" || !s.flags.r_glowa || !s.flags.r_ogien); } }
    ] };

  /* ===================== POWRÓT (rytuał zepsuty) ===================== */
  SC[36] = { t: "Powrót", chap: ["Rozdział V", "Druga noc"], intro: [
    "Wchodzisz do wsi bez fanfar. Sołtys dziękuje ci cicho, tak, żeby nie słyszał nikt, kto mógłby kiedyś zeznawać. Płaci. Wieś patrzy z ulgą, która trwa do wieczora."],
    x: [
      "O zmroku słyszysz coś, co przypomina odgłos kroków na wzgórzu. Najpierw jeden. Potem drugi, wolniejszy. Ktoś w karczmie zaczyna się modlić po cichu. Wiesz, że Draugr wraca, słabszy, ale nie martwy.",
      { c: function (s) { return !!s.flags.rytual_zepsuty; }, x: "Pojedynek był zepsuty. To wystarczyło." },
      { c: function (s) { return !s.flags.rytual_zepsuty; }, x: "Rytuał był niepełny. To wystarczyło." }
    ],
    ch: [{ l: "Wyjść mu naprzeciw", to: 37 }] };

  SC[37] = { t: "Powrót Draugra", chap: ["Rozdział V", "Druga noc"],
    fight: { foes: [{ base: "draugr", zyw: 20, atkMod: -1, n: "Draugr (wrócił)" }], flee: 32 },
    x: ["Nie masz już siły, żeby się bać. Ma jeszcze mniej wiary w siebie niż ty. Idzie wolniej, a jednak z tym samym uporem."],
    after: [{ x: "Tym razem jest inaczej. Kiedy pada, ciało prawie rozsypuje się w proch. Zrobiłeś, co trzeba, tym razem do końca." }],
    ch: [{ l: "Zakończyć sprawę", to: 33, c: function (s) { return !!s.flags.pokonany_draugr; }, why: "Walka jeszcze trwa",
      fx: function (s, E) { s.flags.r_glowa = true; s.flags.r_ogien = true; s.flags.r_pochowek = "daleko"; s.flags.drugi_raz = true; E.czas(2); } }] };

  /* ===================== ZAKOŃCZENIE ===================== */
  SC[33] = { t: "Rozliczenie", chap: ["Rozdział VI", "Po wszystkim"], intro: [
    "W Szarówce zrobiło się cicho, ale nie tą ciszą, która była przedtem. Tamta była ciszą strachu. Ta jest ciszą wieczoru po żałobie."],
    on: function (s, E) {
      if (s.flags.zakonczono) return; s.flags.zakonczono = true;
      var base = s.flags.targ_ok ? 45 : 30;
      var pay = Math.max(15, base - 5 * ((s.flags.noce || 0)));
      s.flags.zaplata = pay;
      E.kasa(pay * MD);
      var bad = s.flags.bartek_idzie && s.flags.bartek_los === 1;
      if (bad) { E.rep("lud", -1); }
      if (s.flags.drugi_raz) { E.legenda(1); } else { E.legenda(2); }
      if (s.flags.r_pochowek === "hanna") { E.rep("lud", 1); }
      else { E.rep("lud", 2); }
      E.notatka("Draugr z Szarówki: koniec.");
      E.czas(1);
    },
    x: [
      { c: function (s) { return !!s.flags.bartek_idzie && s.flags.bartek_los === 1; }, x: "Sołtys nie patrzy ci w oczy, kiedy odlicza pieniądze. Bartka pochowano rano, na wzgórzu nad wsią, w ziemi, która tym razem puściła. - Powiedziałem mu - mówi tylko. - Powiedziałem, żeby nie szedł." },
      { c: function (s) { return !!s.flags.bartek_idzie && s.flags.bartek_los === 2; }, x: "Bartek leży w łóżku, owinięty prześcieradłem, z żebrami w opatrunku. Sołtys kładzie ci pieniądze na stole i długo trzyma rękę nad nimi, jakby chciał coś powiedzieć. Nie mówi." },
      { c: function (s) { return !s.flags.bartek_idzie; }, x: "Sołtys odlicza pieniądze bez słowa i kładzie ci je na stole. Bartek, który stoi w progu, jest wyższy, niż się wczoraj zdawał. Kiwa ci głową." },
      "Zapłata: {ZAPLATA} MD.",
      { c: function (s) { return s.flags.r_pochowek === "hanna"; }, x: "W wiosce mówi się, że ktoś posypał grób Hanny świeżą ziemią i że rano wyglądał, jakby leżało tam dwoje ludzi. Nikt nie komentuje. Marzanna, kiedy ją mijasz, tylko kręci głową, nie ze złością, raczej ze smutkiem kogoś, kto wie więcej, niż chciałby." },
      { c: function (s) { return s.flags.r_pochowek === "daleko"; }, x: "Marzanna kiwa ci z daleka głową. To najwięcej, co Łowca może liczyć w takim miejscu." },
      "Zanim odejdziesz, wracasz jeszcze na wzgórze, w dzień. Kurhan jest teraz tylko kopcem. W głębi, w niszy, gdzie Draugr leżał, coś błyszczy. Podnosisz to. Srebrny sygnet z wyrytą runą, która nie pochodzi z tych stron. Ktoś miał kiedyś powód, żeby go tu złożyć, razem z tym nieszczęsnym Jędrzejem. Ktoś, kto wiedział, co robi.",
    ],
    ch: [{ l: "Schować sygnet i pójść dalej", to: 39, fx: function (s, E) { E.dodaj("sygnet"); E.fakt("gen_domy"); } }] };

  SC[39] = { t: "Koniec Tomu I", chap: ["Tom I", "Szarówka"], end: "Koniec Tomu I",
    x: [
      "Schodzisz ze wzgórza, ku drodze, która prowadzi gdzieś, gdzie nikt cię nie zna. Siwy miał rację: nikt tu nie będzie ci dziękował głośno. Kilka groszy, trochę jedzenia, zimne spojrzenia. Ale tej nocy nikt w Szarówce nie zamknął drzwi na zasuwę.",
      "Sygnet w kieszeni jest chłodny. Odwracasz go w palcach. Runa niczego ci nie mówi. Ale gdzieś, w jakimś Domu, ktoś będzie wiedział, że straciłeś go w tych górach, i że Łowca z Szarówki żyje."
    ], ch: [] };

  SC[34] = { t: "Śmierć", chap: ["Tom I", "Koniec"], end: "Śmierć",
    x: [
      "Ostatnie, co czujesz, to zimno ziemi pod policzkiem i dziwne ciepło krwi.",
      "Szarówka znajdzie cię rano, albo w ogóle. Nikt nie powie głośno, że był tu jakiś Łowca. Nikt nie przypomni sobie twojego imienia. Siwy będzie miał jeszcze jeden powód, żeby pić ze swojego kubka w milczeniu.",
      "Pamiętaj, powiedział. Niektórych imion nikt nie zapamięta."
    ], ch: [] };

  SC[38] = { t: "Potwór", chap: ["Tom I", "Koniec"], end: "Potwór",
    x: ["Ktoś, kto patrzy na ciebie, widzi już tylko to, czego się boi. Nie widzi Łowcy, nie widzi człowieka. Widzi to, na co sam polujesz. I w tej chwili nie masz argumentów, żeby go w tym błędzie przekonać."], ch: [] };

  var BOOK = {
    id: "tom1", title: "Tom I: Szarówka", start: 1, SC: SC, deathPara: 34, monsterPara: 38,
    startHook: function (s) { s.poszuk = 1; s.day = 8; s.pora = 1; }
  };
  EN.registerBook(BOOK);
})(typeof globalThis !== "undefined" ? globalThis : this);
