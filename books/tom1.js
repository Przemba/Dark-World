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
    "- Pozwól sobie spocząć na tej ławie - rzekł do ciebie sędziwy już gospodarz, kiedy {wszedłeś|weszłaś} do chaty zbudowanej z solidnych bali. Popatrzy{łeś|łaś} na niego nieufnym wzrokiem i niechętnie położy{łeś|łaś} ekwipunek na wskazanym miejscu. Zdziwiło cię, że ten stary Indianin nie odczuwał żadnego lęku przed tobą. Był całkowicie spokojny, jakby wiedział, kim jesteś i po co {przyszedłeś|przyszłaś}, zanim jeszcze zapuka{łeś|łaś}.",
    "Poda ci kufel, z którego unosiły się ciepłe opary, sobie postawił gliniany kubek. Poczu{łeś|łaś} intensywny zapach ziół. Zerkn{ąłeś|ęłaś} na ściany domostwa: jedno drewniane łoże, dwa stołki, jakaś szafa, ława, przy której siedzisz, i dwa regały, na których swobodnie leży kilka ksiąg. Ludzie nazywają go Siwym. On sam nie poprawia."],
    x: [
      "- Znasz nasz świat? Świat, po którym dane ci będzie stąpać przez, daj twój bóg, kolejne kilka wiosen? - pyta starzec, widząc twoje zainteresowanie regałami. - Jeśli nie, pozwól, że powiem ci co nieco. Ludzie chodzą tu na ślepo i potem się dziwią."
    ],
    ch: [
      { l: "Pytam o świat i o to, co leży między krajami", to: 2, vis: N("t_swiat") },
      { l: "Pytam o wiarę i o to, czym są Dzieci Nocy", to: 3, vis: N("t_wiara") },
      { l: "Pytam, co czeka mnie na szlaku", to: 4, vis: N("t_los") },
      { l: "Proszę o wgląd w księgi na regale", to: 5, vis: N("t_ksiegi") },
      { l: "Dość słuchania. Pytam, po co mnie tu ściągnął", to: 6 }
    ] };

  SC[2] = { t: "Świat", chap: ["Prolog", "Gardło Śmierci"],
    on: function (s, E) { s.flags.t_swiat = true; },
    x: [
      "- Wiedz, że znany nam świat składa się z dwóch kontynentów podzielonych na małe państewka. Rządzą nimi zamożne rodziny, które znalazły sobie dość popleczników, żeby pokonać rywali w wyścigu o władzę. To, jak się żyje w danym kraju, zależy od charakteru jego pana. Nasz jest w miarę spokojny. Poza daninami, podatkami i kilkoma opłatami, o których wolę nie mówić, nikt nas tu nie gnębi. Są krainy, gdzie ludzie umierają z głodu. My mamy szczęście, że urodziliśmy się na tej ziemi.",
      "- Pomiędzy lądami snuje się wąski, niebezpieczny przesmyk. Nazywają go Gardłem Śmierci. Najbogatsze państwa leżą po obu jego krańcach i biorą niezłą opłatę za bezpieczne przejście. Sprzedadzą ci nawet ochronę, płatną z góry. Zwykle wraca do domu po paru kilometrach, zostawiając cię losowi, bo na tym odcinku może cię spotkać wszystko, zwłaszcza gdy zejdziesz z traktu.",
      "- Pieniądze znajdziesz tylko w miastach i zajazdach. Na wsi się wymienia, towar za towar. Handel to u nas cień handlu. Jedynym miejscem bez pana jest wielki bór na wschodnim kontynencie. Powiem ci tylko tyle: weszli do Wielkiego Boru tacy jak ty i ja, z tego czy innego powodu, i nikt z nich nie wrócił do normalności.",
      "- A klimat? - uśmiecha się krzywo. - Zimny, deszczowy i skrzętnie ponury. Podobno są na południu wyspy, gdzie jest ciepło. Może to sprawdzisz. Pewnie dopiero na emeryturze. Widzia{łeś|łaś} kiedyś Łowcę emeryta?"
    ],
    ch: [{ l: "Wracam do rozmowy", to: 1 }] };

  SC[3] = { t: "Wiara", chap: ["Prolog", "Bez imion"],
    on: function (s, E) { s.flags.t_wiara = true; },
    x: [
      "- Czy wierzysz w jakiegoś Boga? Nie, nie odpowiadaj, tylko pytam, to ciekawość starego głupca. U nas każdy modli się do sobie znanych, ale żaden nie ma imienia. Przede wszystkim modlimy się do natury. Ziemia, nasza matka, kiedy jest litościwa, daje pożywienie i schronienie, więc dwa razy w roku, kiedy dzień jest równy nocy, prosimy ją o litość najmocniej. Wiatr łamie drzewa, z których stawiamy domy, a czasem przynosi dobrą pogodę. Ogień daje ciepło i smaczne jedzenie i, daj Boże, nie spali ci chałupy. Wody jest pod dostatkiem, przeważnie za dużo. A słońce, ach, wyjdź choć na chwilę, żebym rozgrzał stare kości.",
      "- No i są Dzieci Nocy. Raczej demony niż bogowie, ale lepiej się nie narażać, może dzisiejszej nocy ominą twoje domostwo. One jako jedyne mają imiona. Jeśli je znasz, nie wymawiaj ich, bo ściągniesz na siebie zgubę. To imiona nadane im przez nich samych albo przez ludzi. Ich prawdziwe imiona mają dopiero moc."
    ],
    ch: [{ l: "Wracam do rozmowy", to: 1 }] };

  SC[4] = { t: "Przeznaczenie", chap: ["Prolog", "Cztery lata z jednym Łowcą"],
    on: function (s, E) { s.flags.t_los = true; },
    x: [
      "- Co cię czeka? Nie jestem wyrocznią, ale powiem ci jedno. Podróżowałem kiedyś z jednym takim jak ty. Nie powiem, żebym stracił te cztery lata, ale mam żal, że byłem zmuszony. Spotykało nas to samo: brud, smród, przygnębienie i wyklęcie. No i oczywiście walka, ale to trzymało go przy życiu. Pewnie i ciebie.",
      "- Żadnego bohaterstwa. Czasem za pracę dostawaliśmy kilka groszy, czasem jedzenie albo jakieś rzeczy mniej lub bardziej przydatne. W wielu przypadkach ludzie, którym pomogliśmy, po wszystkim stawali się wobec nas obojętni, a rzekłbym nawet, że chłodni. Miałem wrażenie, że podzielimy los naszego niedawnego celu. Miałem jednak szczęście, bo towarzysz mojej podróży potrafił wzbudzić szacunek.",
      "- Były też dobre strony. Poznaliśmy miejsca, o których wielu nie słyszało. Było kilka miejsc, gdzie nas ciepło witano, i tam wracaliśmy z chęcią. W takim miejscu teraz siedzę.",
      "- Pytasz o koniec? Jestem jedynym świadkiem jego śmierci. Nadeszła nagle, podczas księżycowej pełni. Na kilka chwil przed walką usłyszałem od niego, że to jakiś wampir wyższy, a potem krzyczał, żebym brał nogi za pas i uciekał z tego przeklętego miejsca. Usłyszałem jego krzyk, urwany w połowie przeraźliwym charkotem. Wróciłem tu, wiedziałem, że będą chcieli wiedzieć, co się stało.",
      "- Jego imię będzie pamiętane. Pamiętaj jednak, że są tacy, których imiona nigdy nie będą zapamiętane, bo nikt nie wiedział, że istnieli. Mam nadzieję, że twoje imię będzie zapamiętane. Tylko na tyle możesz liczyć."
    ],
    ch: [{ l: "Wracam do rozmowy", to: 1 }] };

  SC[5] = { t: "Księgi na regale", chap: ["Prolog", "Wiedza kosztuje"],
    on: function (s, E) { s.flags.t_ksiegi = true; E.fakt("gen_domy"); E.fakt("gen_kolek"); E.fakt("gen_ogien"); },
    test: { at: "SU", sk: "Wiedza o bestiach", st: 13, label: "Czytam Księgę Ras, powoli i ze zrozumieniem",
      ok: function (s, E) { E.fakt("draugr_rodzaj"); E.fakt("bruk_krzyk"); } },
    x: [
      "Siwy kładzie ci na kolanach wiekowy wolumin. Skóra okładki jest miękka od rąk, które ją wertowały. Pierwsza stronica kończy się ostrzeżeniem: znaleziono tu wszystko, co znane o rasach i istotach, które stąpają po tej ziemi. Niejednokrotnie przelała się krew badaczy, żebyś mógł to teraz czytać w zaciszu. Sama treść może być dla ciebie szkodliwa. Znam takich, którzy wpadli w obłęd. Pamiętaj, wiedza kosztuje.",
      "Przeglądasz karty. Domy, Rada, kasty. O wampirach więcej tu domysłów niż pewności. Zapisujesz to, co wydaje się najbardziej użyteczne: czym zabijać, czym straszyć, gdzie szukać kryjówki. Starzec patrzy na ciebie znad kubka i niczego nie komentuje."
    ],
    after: [
      { t: "ok", x: "Przy kilku wpisach wyłapujesz coś więcej: kto zostaje nieumarłym i na co zwracać uwagę, gdy wieś opowiada o krzyku w nocy. Zapisujesz to w Dzienniku, zanim zdążysz zapomnieć." },
      { t: "no", x: "Tekst jest gęsty jak błoto. Wyławiasz tylko to, co zdążysz zapamiętać, i wiesz, że sporo przeoczy{łeś|łaś}." }
    ],
    ch: [{ l: "Zamykam księgę i wracam do rozmowy", to: 1 }] };

  SC[6] = { t: "Zlecenie", chap: ["Prolog", "Szarówka"],
    on: function (s, E) { E.dodaj("bandaz", 2); },
    x: [
      "- Do Szarówki dwa dni drogi na północ, na wyżynach - mówi starzec, wyciągając spod ławy zawiniątko. W środku dwa zwoje bandaży i słoik tłustej maści. - Mieszka tam mój krewny, sołtys. Pisze, że od tygodnia giną im zwierzęta. Nie jedna sztuka, nie dwie. Całe stada, zagonione na śmierć, jakby ktoś je ścigał całą noc. A rano ślady idą w jedną stronę, na wzgórze.",
      "- Mówią, że to wilki. Wilki, mówią. - Pije z kubka. - Wilki nie gonią bydła, żeby je zabić i zostawić. Ludzie z wyżyn są uparci, i jeśli teraz zaczęli się bać, to już nie wilków.",
      "- Sołtys zapłaci. Niewiele, bo nikt tam nic nie ma, ale uczciwie. Na drogę nie dam ci nic poza tą maścią i radą. Rada jest taka: nie wchodź tam z nikim. Takie rzeczy mają swoje prawa. Jeśli nie wiesz jakie, zapytaj starych bab."
    ],
    ch: [{ l: "Ruszam na północ", to: 7 }] };

  /* ===================== DROGA ===================== */
  SC[7] = { t: "Pierwsza noc na szlaku", chap: ["Rozdział I", "Dwa dni na wyżyny"], intro: [
    "Wyżyny nie witają. Deszcz idzie poziomo, buty nasiąkają po pierwszej godzinie i potem już tylko ciągną w dół. Do zmierzchu mijasz trzy puste wsie, w których drzwi są zaparte od środka, i jedną, w której ktoś patrzy na ciebie przez szparę w okiennicy i nie otwiera."],
    x: [
      "Zmierzcha się. Droga rozdziela się: przy skrzyżowaniu stoi zagroda z dymem nad dachem, a dalej ciemny zagajnik, w którym możesz rozpalić ogień. Jedno i drugie ma swoje wady. Pierwsze wymaga rozmowy z kimś, kto cię nie lubi. Drugie wymaga, żebyś nie zasnął za głęboko.",
      "Nocleg to nie luksus, tylko rachunek: ile ciepła masz na sobie, ile jeszcze masz w sobie i czy masz czym zapalić. Karta postaci i plecak pokażą ci, ile zimna i głodu już uzbiera{łeś|łaś}."
    ],
    ch: [
      { l: "Proszę gospodarzy o stodołę (Charyzma, ST 11)", test: { sk: "Charyzma", st: 11, label: "Nocleg u obcych" }, toOk: 71, toNo: 72,
        fx: function (s, E) { E.czas(1); } },
      { l: "Rozpalam ognisko w zagajniku", to: 8, c: function (s) { return EN.has(s, "krzesiwo"); }, why: "Nie masz krzesiwa",
        fx: function (s, E) { E.czas(1); E.nocleg("ognisko"); } },
      { l: "Kładę się pod drzewem, bez ognia", to: 8, fx: function (s, E) { E.czas(1); E.nocleg("niebo"); } }
    ] };

  SC[71] = { t: "Stodoła", chap: ["Rozdział I", "Obcy dach"],
    on: function (s, E) { E.nocleg("stodola"); },
    x: ["Gospodarz patrzy na ciebie dłuższą chwilę, na miecz u pasa, na płaszcz w dziurach. Potem wzrusza ramionami i wskazuje stodołę. Nie pyta o imię. Śpisz na sianie, a krowy oddychają w ciemności jak spokojne duchy. Rano w progu stoi garnek z wodą i połówka chleba. Gospodarza już nie ma."],
    ch: [{ l: "Ruszam dalej", to: 8 }] };

  SC[72] = { t: "Zamknięte drzwi", chap: ["Rozdział I", "Odmowa"],
    on: function (s, E) { E.nocleg("niebo"); },
    x: ["- Tu nie ma dla ciebie miejsca - mówi gospodarz przez drzwi, których nie otwiera. - Łowców tu nie trzymamy. Pójdź tam, skąd {przyszedłeś|przyszłaś}.", "Nie dyskutujesz. Sypiasz pod płotem, w deszczu, w mokrym płaszczu, z ręką na rękojeści. Rano jesteś wymarznięty bardziej, niż chciałbyś się przyznać."],
    ch: [{ l: "Ruszam dalej", to: 8 }] };

  SC[8] = { t: "Drugi dzień", chap: ["Rozdział I", "Pod górę"], intro: [
    "Drugi dzień idzie pod górę, w mgle, która siada na ramionach jak mokry pies. Droga staje się ścieżką, ścieżka śladem, ślad zawraca, a ty zgadujesz, czy to ty się zgubi{łeś|łaś}, czy wyżyny wolą, żebyś nie dotarł. Zerkasz na buty. Dopiero teraz widzisz, że woda ma w nich stałe miejsce zamieszkania."],
    x: ["Pod wieczór widzisz pierwsze dachy Szarówki: kilkanaście chat z szarych bali, ukrytych w zagłębieniu jak zwierzęta, które wiedzą, że ktoś na nie poluje. Nad nimi, na łysym wzgórzu, widać kopiec. Zbyt okrągły jak na naturalną rzecz. Zbyt cichy jak na miejsce, gdzie wieje."],
    ch: [{ l: "Wchodzę do wsi", to: 9, fx: function (s, E) { E.czas(2); } }] };

  SC[9] = { t: "Szarówka", chap: ["Rozdział II", "Wieś pod kurhanem"], intro: [
    "Szarówka stoi w zagłębieniu terenu, którego nie ruszyłaby ani powódź, ani woda z nieba. Tak przynajmniej myślano, kiedy ją stawiano. Kilkanaście domów, karczma, kramik, kuźnia pod dachem z dranic. Psy szczekają krótko i cichną, jakby nauczono je, że głośne szczekanie przyciąga.",
    "Ludzie na twój widok odwracają głowy. Na wyżynach nikt nie patrzy Łowcy w twarz. Wiedzą, kim jesteś, i wiedzą, co ci zawdzięczą, jeśli się uda. Wiedzą też, że nie będą cię o tym przypominać.",
    "Z komina karczmy idzie dym, cienki i pochylony, jakby i on bał się wyjść w górę. Kobieta przy studni zamiera z wiadrem w pół ruchu, patrzy na ciebie, na miecz, potem na wzgórze i szybko przeżegnuje się na swój sposób: dotknięciem czoła, ust i ziemi. Dzieci, które bawiły się w błocie, znikają, jakby je wciągnęła ziemia. Zostaje po nich jedna drewniana laleczka, leżąca twarzą w kałuży."],
    x: [
      "Zmierzcha. Kiedy stajesz na wiejskim placu, z zagrody obok wychodzi mężczyzna w skórzanym fartuchu, patrzy na ciebie, na miecz i mówi cicho: - Jeśli to ty od Siwego, sołtys czeka w karczmie. Idź tam, zanim zrobi się całkiem ciemno. Po zmroku nikt tu nie wychodzi."
    ],
    ch: [{ l: "Idę na wiejski plac", to: 10 }] };

  /* ===================== HUB ===================== */
  SC[10] = { t: "Szarówka", chap: ["Rozdział II", "Wieś"], intro: [
    { c: function (s) { return s.pora === 2; }, x: "Zmierzcha się. Drzwi chat zamykają się jedne po drugich, bez trzasku, z odruchem ludzi, którzy robią to każdego wieczoru od tygodnia." },
    { c: function (s) { return s.pora <= 1; }, x: "Dzień w Szarówce jest szary jak jej nazwa. Z rynny nad karczmą kapie woda, ludzie idą do swoich obowiązków z oczami wbitymi w ziemię. Kowal wali w kowadło, jakby chciał zagłuszyć coś, czego nikt nie chce nazwać. Gdzieś na skraju wsi rży koń, krótko i nerwowo, i zaraz cichnie." },
    { c: NIGHT, x: "Noc. Szarówka wygląda jak wymarła. W oknach nie ma światła, ale czujesz setkę oczu przyklejonych do szczelin. Ziemia pod stopami jest zimna i wilgotna, a wiatr ma w sobie coś z oddechu kogoś, kto stoi tuż za tobą. Na wzgórzu, ponad dachami, kopiec rysuje się jak ciemniejsza dziura w ciemności." }],
    x: [
      { c: function (s) { return (s.flags.strach || 0) >= 3; }, x: "Strach jest tu teraz namacalny. Dwie rodziny już spakowały wozy. Ktoś pyta cię na głos, czy w ogóle ma sens zostawać." },
      { c: function (s) { return !!s.flags.ucieklem; }, x: "Ludzie patrzą na ciebie inaczej, niż rano. Uciek{łeś|łaś}, a oni to widzieli." },
      "Co robisz?"
    ],
    ch: [
      { l: "Idę do karczmy „Pod Zdechłym Kozłem”", to: 11, vis: DAY, fx: function (s, E) { E.czas(1); } },
      { l: "Podchodzę do kramiku Szymona", to: 12, vis: DAY, fx: function (s, E) { E.czas(1); } },
      { l: "Oglądam zagrodę, w której zginęło bydło", to: 13, vis: LIGHT, fx: function (s, E) { E.czas(1); }, hint: "Tylko za dnia" },
      { l: "Idę do chaty pasterza Wojtka", to: 14, vis: DAY, fx: function (s, E) { E.czas(1); } },
      { l: "Wchodzę na wzgórze, do kurhanu", to: 15, vis: LIGHT, fx: function (s, E) { E.czas(1); }, hint: "Tylko za dnia" },
      { l: "Pukam do chaty zielarki Marzanny", to: 16, vis: DAY, fx: function (s, E) { E.czas(1); } },
      { l: "Idę na wiejski cmentarz", to: 50, vis: function (s) { return LIGHT(s) && !!s.flags.cmentarz_wiem && !s.flags.hanna_grob; }, hint: "Tylko za dnia" },
      { l: "Idę do opuszczonej chaty Jędrzeja Wrony", to: 52, vis: function (s) { return LIGHT(s) && !!s.flags.jedrzej_pytano && !s.flags.chata_byla; }, hint: "Tylko za dnia" },
      { l: "Idę tropem z zagrody na wzgórze", to: 51, vis: function (s) { return LIGHT(s) && s.pc.klasa === "tropiciel" && !!s.flags.zagroda_byla && !s.flags.tylna; }, hint: "Tylko dla tropiciela" },
      { l: "Siadam i zbieram myśli: z czym mam do czynienia?", to: 20 },
      { l: "Idę na kurhan, teraz", to: 24, vis: function (s) { return !!s.flags.sołtys || DAY(s) || NIGHT(s); }, hint: "Przygotowania i decyzja" },
      { l: "Szukam miejsca na nocleg", to: 17, vis: function (s) { return s.pora >= 2; } },
      { l: "Czuwam na skraju wsi", to: 18, vis: NIGHT }
    ] };

  /* ===================== LUDZIE I MIEJSCA ===================== */
  SC[11] = { t: "Pod Zdechłym Kozłem", chap: ["Rozdział II", "Karczma"], intro: [
    "Karczma ma jedną izbę i jeden piec. Powietrze jest tu gęste od dymu, mokrej wełny i kwaśnego piwa. Pod stropem wiszą pęczki suszonego chmielu i jedno kopyto, którego pochodzenia lepiej nie sprawdzać. Na ławach siedzi kilku mężczyzn, i w chwili, gdy wchodzisz, rozmowa spada o oktawę, jakby ktoś przykręcił knot.",
    "Przy piecu siedzi człowiek o twarzy, którą mogłaby nosić skała: sołtys Mirosław Kruk, pięćdziesiąt kilka lat, ręce jak szpadle. Naprzeciw niego karczmarz Gniewko, tłusty i zmęczony, wyciera ten sam kufel od dwóch minut."],
    x: [
      { c: N("sołtys"), x: "- Siwy pisał, że przyślesz kogoś. - Sołtys mierzy cię wzrokiem. - Nie miał pisać, że kogoś takiego. Dobrze, to słuchaj. Ginie nam bydło, od tygodnia. Pasterz Wojtek ledwo uszedł z życiem. Dziesięć dni temu mój sąsiad stracił dwadzieścia owiec w jedną noc. Nie wilk, nie zbójca, nie głód. Płacę trzydzieści miedziaków, jeśli to się skończy, i zapłacę wcześniej, jeśli wcześniej się skończy."
        + "\n\nCicha uwaga: Łowcy są poza prawem, i sołtys o tym wie. Nie powie tego na głos, ale będzie się pilnować, żeby nikt z zewnątrz nie dowiedział się, że płacił." },
      { c: F("sołtys"), x: "Sołtys podnosi głowę znad kubka i patrzy na ciebie z tym wyrazem, który widzia{łeś|łaś} już w wielu karczmach: nadzieja zmieszana z poczuciem winy, że w ogóle potrzebuje takiej nadziei." }
    ],
    on: function (s, E) { if (!s.flags.sołtys) { s.flags.sołtys = true; E.notatka("Sołtys Kruk płaci 30 MD, jeśli polowanie się uda."); } },
    ch: [
      { l: "Targuję się o zapłatę (Charyzma, ST 12)", test: { sk: "Charyzma", st: 12, label: "Targ z sołtysem",
          ok: function (s, E) { s.flags.targ_ok = true; E.chip("Sołtys zgadza się na 45 MD i kolację", "pos"); },
          no: function (s, E) { E.chip("Sołtys się obraża. Zostaje przy 30 MD", "neg"); } }, to: 11, c: N("targ_probowano"), why: "Już próbowa{łeś|łaś}",
        fx: function (s, E) { s.flags.targ_probowano = true; } },
      { l: "Pytam o Jędrzeja Wronę", to: 111, vis: N("jedrzej_pytano") },
      { l: "Stawiam kolejkę i siadam przy piecu (1 MD)", to: 113, vis: function (s) { return !s.flags.rozmowa_piec && !!s.flags.jedrzej_pytano; }, c: function (s) { return s.money >= MD; }, why: "Brakuje Ci 1 MD" },
      { l: "Proszę sołtysa o wgląd w księgę wsi", to: 57, vis: function (s) { return s.pc.klasa === "uczony" && !s.flags.ksiega_wsi; }, hint: "Tylko dla uczonego" },
      { l: "Wymykam się na zaplecze i słucham przez ścianę", to: 56, vis: function (s) { return s.pc.klasa === "zlodziej" && !s.flags.podsluch; } },
      { l: "Wynajmuję miejsce w izbie na noc (3 MD)", to: 112, vis: function (s) { return s.pora >= 2; }, c: function (s) { return s.money >= 3 * MD; }, why: "Brakuje Ci 3 MD" },
      { l: "Wychodzę", to: 10 }
    ] };

  SC[111] = { t: "O Jędrzeju", chap: ["Rozdział II", "Karczma"],
    on: function (s, E) { s.flags.jedrzej_pytano = true; s.flags.cmentarz_wiem = true; E.notatka("Jędrzej Wrona: wdowiec, pochowany w kurhanie bez księdza, bo ziemia była zmarznięta. Nie pił."); },
    x: [
      "- Jędrzej Wrona? - Sołtys i karczmarz wymieniają spojrzenia. - Dobry człowiek był. Po śmierci żony, Hanny, jesienią, zamknął się w sobie. Nie pił, nie zbierał długów, nie hałasował. Nikomu nie zawiniał. Zimą znaleźliśmy go na belce.",
      "- Ziemia była zmarznięta na łokieć głębokości - mówi karczmarz cicho. - Nie dało się wykopać grobu. Ksiądz z doliny nie przyjechał, bo drogi pozamiatało śniegiem. Zawinęliśmy go w płótno i położyliśmy do starego kurhanu na wzgórzu, żeby nie leżał na mrozie, aż ziemia puści. No i... ziemia puściła. Ale my już tam nie poszliśmy.",
      "- Nikt nie lubi chodzić na ten kurhan - dodaje sołtys. - Od zawsze był przeklęty. Dziadowie mówili, że to grób jakiegoś dawnego pana. Nikt nie znał jego imienia."
    ],
    ch: [{ l: "Wracam do rozmowy", to: 11 }] };

  SC[112] = { t: "Nocleg w izbie", chap: ["Rozdział II", "Pod dachem"],
    x: ["Pościel pachnie kapustą i dymem, pod głową masz worek słomy. Za ścianą ktoś kaszle całą noc. Mimo to śpisz jak człowiek, który ma nad sobą dach, a przed sobą drzwi, i jest to najlepsze, co może ci dać Szarówka."],
    on: function (s, E) { E.kasa(-3 * MD); E.nocleg("karczma"); nightFall(s, E); },
    ch: [{ l: "Czekam do rana", to: 19 }] };

  SC[12] = { t: "Kramik Szymona", chap: ["Rozdział II", "Handel"], intro: [
    "Szymon, kramarz, ma twarz człowieka, który widział bankructwo i go nie wybaczył. Jego kramik to trzy półki i beczka. Pytasz o ceny. Odpowiada, nie podnosząc wzroku: - Wszystko za miedziaki. Wymiany nie biorę, chyba że to coś, czego sam potrzebuję."],
    x: ["Na wyżynach rzadko spotyka się zastaw większy niż koza. Dziś to, co leży na półkach, jest jedyną ofertą w promieniu dwóch dni drogi."],
    shop: { title: "Kramik Szymona", sell: true,
      stock: [{ id: "racja" }, { id: "bandaz" }, { id: "pochodnia" }, { id: "olej" }, { id: "krzesiwo" }, { id: "kolek" }, { id: "lopata" },
        { id: "sol" }, { id: "ocet" }, { id: "kozik" }, { id: "topor" }, { id: "maczuga" },
        { id: "trzewiki" }, { id: "buty" }, { id: "plaszcz" }, { id: "kurtka" }, { id: "spodnie_s" }, { id: "czepiec" },
        { id: "p_skorzany" }, { id: "p_cwiek" }] },
    ch: [{ l: "Wychodzę", to: 10 }] };

  SC[13] = { t: "Zagroda Kopciuchów", chap: ["Rozdział II", "Ślady"], intro: [
    "Zagroda jest na skraju wsi, pod wzgórzem. Obora otwarta, wrota wyrwane z zawiasów. W środku leżą krowy, w pozach, które żadnej krowie się nie przytrafiają: łby zadarte, oczy wywrócone, kopyta zakrzywione od biegu, którego nie dokończyły."],
    test: { sk: "Tropienie", st: 11, label: "Czytanie śladów", ok: function (s, E) { E.fakt("draugr_sila"); E.notatka("Ślady: ciężkie, bosych stóp, głęboko w błocie. Ślad ciągnięcia z kurhanu."); } },
    on: function (s, E) { s.flags.zagroda_byla = true; E.fakt("draugr_zazdr"); },
    x: [
      "Obchodzisz oborę wolno. Krowy nie mają ran. Są po prostu martwe, jakby ktoś zaganiał je całą noc, aż serce stanęło. To nie wygląda na wilki. Nie wygląda też na ludzi. W kącie, pod żłobem, siedzi dziewczynka, może dziewięcioletnia, z kolanami pod brodą. Nie płacze. Patrzy na jedną z krów, jakby czekała, aż wstanie.",
      "- To była Łaciata - mówi cicho, kiedy przechodzisz. - Dawała mi mleko, jak mama chorowała. - I nic więcej. Nie pyta, czy to skończysz. Wie, że ci, którzy pytają, rzadko dostają odpowiedź, jakiej chcą."
    ],
    after: [
      { t: "ok", x: "Przy wyrwanych wrotach, w błocie, odciski bosych stóp. Za duże jak na człowieka, za głębokie jak na samotnego. Za nimi ślad ciągnięcia. To, co tu było, szło wolno, bez pośpiechu, i wracało prosto na wzgórze, jakby znało drogę na pamięć. Dotykasz śladu: woda w nim jest zimna jak studnia w styczniu, choć błoto wokół jeszcze nie zamarzło." },
      { t: "no", x: "Ślady są, ale deszcz rozmył to, co mogło coś znaczyć. Widzisz tylko, że wszystko idzie jednym kierunkiem: na wzgórze." }
    ],
    ch: [{ l: "Wychodzę", to: 10 }] };

  SC[14] = { t: "Chata Wojtka", chap: ["Rozdział II", "Ranny pasterz"], intro: [
    "Wojtek Kopeć leży w łóżku z zabandażowaną ręką, w której nie ma już czucia. Ma z czterdzieści lat i wygląda na sześćdziesiąt. Patrzy na ciebie z lękiem, który ma już własny kształt: kształt stworzenia, które nie mruga."],
    x: [
      "- To nie wilk - powtarza, zanim ktokolwiek o to zapyta. - Wilk robi hałas. Tamto nie robiło. Przyszło po stado, ja stanąłem przed nim, a ono przeszło mnie, jak się przechodzi przez płot.",
      "W chacie pachnie tłuszczem i potem chorego człowieka. Na stole, obok kubka z zimnym wywarem, leży różaniec z suszonych jagód, na którym ktoś zawiązał trzy supły. Za oknem, na wzgórzu, kopiec patrzy dokładnie w to okno. Wojtek obrócił łóżko tak, żeby leżeć do niego plecami."
    ],
    ch: [
      { l: "Opatruję mu rękę (bandaż, Pierwsza pomoc)", to: 141, c: function (s) { return EN.has(s, "bandaz"); }, why: "Nie masz bandaży", vis: N("wojtek_pytany"),
        fx: function (s, E) { E.zabierz("bandaz", 1); E.rep("lud", 1); s.flags.wojtek_pytany = true; } },
      { l: "Proszę, żeby pokazał, co jest pod opatrunkiem (oko żołnierza)", to: 142, vis: function (s) { return s.pc.klasa === "wojownik" && !s.flags.wojtek_rana; }, hint: "Tylko dla wojownika" },
      { l: "Naciskam, zmuszam go do mówienia (Zastraszanie, ST 10)", test: { sk: "Zastraszanie", st: 10, label: "Przesłuchanie",
          ok: function (s, E) { E.fakt("draugr_sila"); E.notatka("Wojtek: czarny, wysoki, bez krzyku. Patrzył i przeszedł."); },
          no: function (s, E) { E.chip("Wojtek zamyka się w sobie", "neg"); } }, to: 14, vis: N("wojtek_pytany"),
        fx: function (s, E) { s.flags.wojtek_pytany = true; E.rep("lud", -1); } },
      { l: "Wychodzę", to: 10 }
    ] };

  SC[141] = { t: "Opatrunek", chap: ["Rozdział II", "Ranny pasterz"],
    on: function (s, E) { E.fakt("draugr_sila"); E.notatka("Wojtek: czarny, wysoki, zimny. Nie krzyczał. Patrzył. To wykluczało brukołaka."); },
    x: [
      "Rozwijasz stary opatrunek. Pod nim ręka jest sina i zimna jak coś, co dotknęło lodu. Czyścisz, smarujesz, wiążesz. Wojtek patrzy w sufit i mówi, jakby mówił do niego.",
      "- Był czarny. Nie jak sadza, jak śmierć. Wysoki jak drzwi. Zimny, czułem to z trzech kroków. Nie krzyknął. Wszyscy mówią, że takie rzeczy krzyczą. Ono nie. Ono patrzyło na mnie, jakby zazdrościło mi, że stoję. Jakby chciało mi to zabrać."
    ],
    ch: [{ l: "Wychodzę", to: 10 }] };

  SC[15] = { t: "Kurhan", chap: ["Rozdział II", "Wzgórze"], intro: [
    "Kurhan jest wyższy, niż z dołu wyglądał. Trawa wokół jest dziwnie krótka, wypalona, jakby ktoś przeszedł tędy z lodem zamiast ognia. Nad wejściem, które nie jest wejściem, tylko szczeliną między dwoma głazami, wisi cisza."],
    test: { sk: "Spostrzegawczość", st: 12, label: "Szczegóły przy kopcu", ok: function (s, E) { E.fakt("draugr_dom"); E.notatka("Kurhan otwarty od środka. Ziemia przy wejściu zmrożona."); } },
    x: ["Chodzisz wokół kopca w deszczu. Nie wchodzisz, jeszcze nie.",
      "Wejście, jeśli można tak nazwać szczelinę między dwoma głazami, jest ciemne i wąskie jak gardło. Z wnętrza ciągnie chłód, który nie zależy od pory roku. Wiatr, który szarpie trawę na zboczu, omija szczelinę szerokim łukiem. Z dołu, od wsi, kopiec wygląda jak garb na plecach ziemi. Stąd, z bliska, wygląda jak coś, co śpi z jednym otwartym okiem."],
    after: [
      { t: "ok", x: "Przy wejściu kamień jest odsunięty od środka, nie od zewnątrz. Ziemia wokół szczeliny pokryta jest szronem, choć jesień dopiero zaczęła się na dobre. Zapach: mokra ziemia i coś słodkiego, od którego robi się nieswojo. Ktoś, kto leży tu za dnia, dobrze zna drogę do wsi w nocy." },
      { t: "no", x: "Kopiec jest kopcem. Szczelina między głazami za ciasna, żeby się przecisnąć, a odór z wnętrza odrzuca każdą ciekawość. Nic konkretnego nie przychodzi ci do głowy." }
    ],
    ch: [
      { l: "Przepisuję runy z głazów", to: 54, vis: function (s) { return s.pc.klasa === "uczony" && !s.dz.draugr_runy; }, hint: "Tylko dla uczonego" },
      { l: "Wybieram i oczyszczam miejsce pod pojedynek", to: 53, vis: function (s) { return s.pc.klasa === "wojownik" && !s.flags.pole_wybrane; }, hint: "Tylko dla wojownika" },
      { l: "Schodzę ze wzgórza", to: 10 }
    ] };

  SC[16] = { t: "Chata Marzanny", chap: ["Rozdział II", "Zielarka"], intro: [
    "Marzanna mieszka na skraju lasu, w chacie tak starej, że sama wydaje się rośliną. Pęki ziół wiszą pod stropem. Zapach jest ostry i mądry. Sama Marzanna: niska, sucha, z oczami jak dwa świdry, patrzy na ciebie, jakbyś był chorobą, której nie jest pewna, czy chce leczyć."],
    x: [
      "W chacie pachnie szałwią, dymem i czymś gorzkim, co osadza się w gardle. Na parapecie siedzi kruk z podciętym skrzydłem i patrzy na ciebie okiem bez wyrazu. Na ścianach wiszą pęki ziół, jak powieszone ludzkie dłonie, a pod nimi, na gwoździu, wisi stary sierp z wyszczerbionym ostrzem.",
      "- Wiem, po co {przyszedłeś|przyszłaś} - mówi, zanim siadasz. - Pewnie nie oczekujesz, że po ludzku powiem ci wszystko za darmo.",
      { c: N("marzanna_rodzaj"), x: "Podaje ci kubek naparu i, nie dając czasu na odmowę, opowiada: - To nie wilk i nie zbójca. To Jędrzej. Nie, nie mów nic, sama widziałam, jak go pochowali. Człowiek, który odszedł bez księdza, bez modlitwy, w złym stanie, w ziemi, która go nie chciała. Takie rzeczy nie leżą cicho. Zazdroszczą żywym, wszystkiego, nawet pary z kubka." }
    ],
    on: function (s, E) { if (!s.flags.marzanna_rodzaj) { s.flags.marzanna_rodzaj = true; E.fakt("draugr_rodzaj"); E.fakt("gen_wiedzmy"); } },
    ch: [
      { l: "Płacę 5 MD za wskazówki, jak go zabić", to: 161, c: function (s) { return s.money >= 5 * MD; }, why: "Brakuje Ci 5 MD", vis: N("rytual_znany"),
        fx: function (s, E) { E.kasa(-5 * MD); } },
      { l: "Przekonuję ją, by powiedziała za darmo (Charyzma, ST 12)", test: { sk: "Charyzma", st: 12, label: "Rozmowa z Marzanną" }, toOk: 161, toNo: 162, vis: N("rytual_znany") },
      { l: "Wychodzę", to: 10 }
    ] };

  SC[161] = { t: "Rytuał", chap: ["Rozdział II", "Zielarka"],
    on: function (s, E) { s.flags.rytual_znany = true; E.fakt("draugr_rytual"); E.notatka("Marzanna: pojedynek jeden na jednego, ściąć głowę, spalić do zimnych popiołów, pogrzebać daleko albo oddać wodzie. Nikt nie może pomagać."); E.rep("wiedzmy", 1); },
    x: [
      "Marzanna przeciera dłonie fartuchem i wyciąga zza pieca zakurzoną księgę, którą ledwo otwiera. - Nie czytaj, tylko słuchaj. Taki jak on odchodzi tylko wtedy, kiedy zmierzy się go jeden na jednego. Jeśli ktoś stanie obok ciebie, choćby po to, żeby pomóc, nic nie wyjdzie. Rozumiesz? Nic.",
      "- Kiedy położysz go, ściąć mu głowę. Mieczem, siekierą, byle ostrym. Potem spalić, do zimnych popiołów, nie do ciepłych. A popioły, to najważniejsze, trzeba pogrzebać daleko od wsi. Albo oddać wodzie. Rzeka weźmie je dalej, niż ty zaniesiesz. Jeśli zostawisz je blisko, wróci. Jeśli zostawisz ciało całe, wróci. Jeśli ktoś ci pomoże, wróci."
    ],
    ch: [{ l: "Dziękuję i wychodzę", to: 10 }] };

  SC[162] = { t: "Odmowa", chap: ["Rozdział II", "Zielarka"],
    x: ["Marzanna uśmiecha się cienko. - Młody, zadziorny, i chciałby wszystko za darmo. Nie ze mną. Wróć, jak zrozumiesz, że wiedza ma cenę. Teraz idź, bo mi zioła więdną od twojego ciężkiego oddechu."],
    ch: [{ l: "Wychodzę", to: 10 }] };

  /* ===================== NOC I RANO ===================== */
  SC[17] = { t: "Nocleg w Szarówce", chap: ["Rozdział II", "Noc"], intro: [
    "Szarówka wygląda w nocy jak opuszczona. Nikt nie pali świateł, nikt nie spaceruje. Tylko psy czasem warczą, a potem cichną, jakby ktoś odebrał im głos."],
    x: ["Musisz się gdzieś ułożyć. Możesz zaryzykować stodołę, wynająć miejsce w karczmie albo przespać się pod chmurką, jak na szlaku."],
    ch: [
      { l: "Wynajmuję miejsce w karczmie (3 MD)", to: 112, c: function (s) { return s.money >= 3 * MD; }, why: "Brakuje Ci 3 MD" },
      { l: "Śpię w stodole przy placu", to: 19, fx: function (s, E) { E.nocleg("stodola"); nightFall(s, E); } },
      { l: "Śpię pod gołym niebem", to: 19, fx: function (s, E) { E.nocleg("niebo"); nightFall(s, E); } }
    ] };

  SC[18] = { t: "Straż na skraju wsi", chap: ["Rozdział II", "Czuwanie"], intro: [
    "Siadasz pod ścianą stodoły, tak, żeby widzieć ścieżkę na wzgórze, i czekasz. Deszcz przechodzi w mżawkę, mżawka w ciszę, cisza w coś, co jest gorsze od ciszy."],
    test: { sk: "Spostrzegawczość", st: 11, label: "Czuwanie", ok: function (s, E) { E.fakt("draugr_dom"); E.notatka("Nocą wraca przed świtem do kurhanu."); } },
    x: ["Przez długą chwilę nic się nie dzieje. Słyszysz własny puls, oddech konia za ścianą i cienki gwizd wiatru w szparze między deskami. Czas rozciąga się jak mokra skóra. Raz wydaje ci się, że ktoś szepcze twoje imię, ale to tylko deszcz na liściach. Zimno wchodzi pod płaszcz i siada ci na plecach jak kot."],
    after: [
      { t: "ok", x: "Około północy dostrzegasz cień, który nie pasuje do żadnego cienia drzew. Idzie powoli, powłócząc nogami, w stronę zagrody na skraju wsi, z której dobiega rozpaczliwe rżenie. Nie biegnie. Nie musi. Potem zawraca, wolno, i znika w kierunku wzgórza. Wiesz już, dokąd ma wrócić przed świtem." },
      { t: "no", x: "Przysypiasz, choć obieca{łeś|łaś} sobie, że nie zaśniesz. Budzi cię krzyk w oddali, potem cisza. Za późno, żeby cokolwiek zobaczyć." }
    ],
    ch: [
      { l: "Ruszam za nim w ciemność, teraz", to: 24, vis: function (s) { return s.tr === "ok"; }, fx: function (s, E) { s.flags.nocny_pochod = true; } },
      { l: "Pozwalam mu odejść i czekam rana", to: 19, fx: function (s, E) { E.nocleg("niebo"); nightFall(s, E); } }
    ] };

  SC[19] = { t: "Poranek", chap: ["Rozdział II", "Rano"], intro: [
    "Rano w Szarówce wygląda jak po stypie: mokro, szaro i bez słów."],
    x: [
      { c: function (s) { return s.flags.noce === 1; }, x: "Ludzie stoją w grupkach. Znaleziono kolejne zagrody z martwymi zwierzętami. Psy leżą rządkiem przy płocie jak śpiące." },
      { c: function (s) { return s.flags.noce === 2; }, x: "Wieś nie stoi w grupkach, tylko wokół jednego miejsca. Parobek Staszek został znaleziony przy studni. Bez śladów, bez krwi, tylko oczy otwarte i twarz zwrócona w stronę wzgórza. Kobiety płaczą w milczeniu, mężczyźni zaciskają szczęki. Sołtys patrzy na ciebie i nie musi nic mówić." },
      { c: function (s) { return (s.flags.noce || 0) >= 3; }, x: "Szarówka jest jak chora. Dwie rodziny odjechały nocą. Kramik Szymona stoi zamknięty. Ci, którzy zostali, patrzą na ciebie z mieszaniną nadziei i pretensji, z którą nie umiesz nic zrobić." }
    ],
    ch: [{ l: "Wracam do wsi", to: 10 }] };

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
      { l: "Jestem {pewien|pewna}: to Draugr", to: 24, fx: function (s, E) { s.flags.rozp = "draugr"; E.chip("Wniosek: Draugr", "note"); } },
      { l: "Jestem {pewien|pewna}: to Brukołak", to: 24, fx: function (s, E) { s.flags.rozp = "brukolak"; E.chip("Wniosek: Brukołak", "note"); } },
      { l: "Jestem {pewien|pewna}: to Wrykołak", to: 24, fx: function (s, E) { s.flags.rozp = "wrykolak"; E.chip("Wniosek: Wrykołak", "note"); } },
      { l: "Wiem za mało. Wracam do wsi", to: 10 }
    ] };

  /* ===================== PRZYGOTOWANIA ===================== */
  SC[24] = { t: "Przygotowania", chap: ["Rozdział III", "Zanim wejdziesz"], intro: [
    { c: R("draugr"), x: "Jesteś {pewien|pewna}. Wszystko pasuje: zazdrość, siła, zimno, ślady, powrót przed świtem. Draugr, nieumarły z wyżyn. Teraz pytanie, czy wiesz, jak go skończyć." },
    { c: R("brukolak"), x: "Masz swoją teorię: obrzmiały, twardy, niosący zarazy. Czy to na pewno to, to inna sprawa. Ale każda teoria jest lepsza od braku." },
    { c: R("wrykolak"), x: "Wrykołak. Pijak, który nie umie leżeć w grobie. Zabija się go gwoździem w pępek albo wrzącym olejem. Brzmi dziwnie, ale Łowca nie wybrzydza." },
    { c: function (s) { return !s.flags.rozp; }, x: "Nie rozstrzygn{ąłeś|ęłaś}, z czym masz do czynienia. Idziesz na ślepo." }],
    x: [
      { c: N("bartek_sprawa"), x: "Gdy wychodzisz z placu, ktoś staje ci na drodze. Młody chłopak, może dziewiętnaście lat, kosa przewieszona przez ramię. Bartek, syn sołtysa. - Idę z tobą - mówi twardo. - Moja wieś. Mój obowiązek. Nie będę siedział w domu, kiedy cudzy człowiek ryzykuje życie." },
      { c: F("bartek_sprawa"), x: "Bartek stoi gdzieś z boku i udaje, że go tam nie ma." }
    ],
    ch: [
      { l: "Odsyłam Bartka do domu (Zastraszanie, ST 11)", vis: N("bartek_sprawa"), test: { sk: "Zastraszanie", st: 11, label: "Odesłanie Bartka" }, toOk: 241, toNo: 242 },
      { l: "Przekonuję go, że może pomóc inaczej (Charyzma, ST 12)", vis: N("bartek_sprawa"), test: { sk: "Charyzma", st: 12, label: "Przekonanie Bartka" }, toOk: 241, toNo: 242 },
      { l: "Pozwalam mu iść ze sobą", to: 243, vis: N("bartek_sprawa") },
      { l: "Robię jeszcze zakupy w kramiku", to: 12, fx: function (s, E) { E.czas(1); } },
      { l: "Wchodzę do kurhanu za dnia", to: 30, vis: function (s) { return LIGHT(s) && !!s.flags.bartek_sprawa; } },
      { l: "Czekam nocą przy kurhanie", to: 26, vis: function (s) { return !!s.flags.bartek_sprawa; },
        fx: function (s, E) { if (s.pora < 3) E.czas(3 - s.pora); } },
      { l: "Wracam do wsi", to: 10 }
    ] };

  SC[241] = { t: "Bartek zostaje", chap: ["Rozdział III", "Zanim wejdziesz"],
    on: function (s, E) { s.flags.bartek_sprawa = true; E.rep("lud", 1); },
    x: ["Bartek opuszcza głowę, zaciska szczękę i, choć widać, że kosztuje go to więcej niż wszystko, co dotąd zrobił w życiu, cofa się. - Wróć - mówi cicho. - Żywy."],
    ch: [{ l: "Wracam do przygotowań", to: 24 }] };

  SC[242] = { t: "Bartek nie słucha", chap: ["Rozdział III", "Zanim wejdziesz"],
    on: function (s, E) { s.flags.bartek_sprawa = true; s.flags.bartek_idzie = true; s.flags.bartek_los = EN.d(2); },
    x: ["Bartek kiwa głową, patrzy ci w oczy i mówi, że rozumie. Jest w tym coś, co nie przekonuje. Odwraca się i wraca do domu. Ale w jego chodzie jest coś, co każdy Łowca zna z doświadczenia: to krok człowieka, który właśnie podjął decyzję i nie zamierza o niej nikomu mówić."],
    ch: [{ l: "Wracam do przygotowań", to: 24 }] };

  SC[243] = { t: "Bartek idzie", chap: ["Rozdział III", "Zanim wejdziesz"],
    on: function (s, E) { s.flags.bartek_sprawa = true; s.flags.bartek_idzie = true; s.flags.bartek_los = EN.d(2); E.chip("Bartek idzie z Tobą", "neg"); },
    x: ["Bartek rozjaśnia się jak mały chłopiec. Podaje ci rękę, niezdarnie, jak przyjacielowi. Z jakiegoś powodu czujesz, że właśnie popełni{łeś|łaś} błąd, którego nie umiesz nazwać."],
    ch: [{ l: "Wracam do przygotowań", to: 24 }] };

  /* ===================== KURHAN: DZIEŃ ===================== */
  SC[30] = { t: "Do wnętrza za dnia", chap: ["Rozdział IV", "Szczelina"], intro: [
    "Idziesz na wzgórze przy szarym świetle dnia. Deszcz ustał, i to jest gorsze, bo teraz słyszysz własne kroki. Przy szczelinie między głazami stoisz dłużej, niż chciałbyś przyznać."],
    x: ["Wnętrze kurhanu śpi. Jeśli to, co w nim leży, nie czuje twojej obecności, możesz mieć przewagę pierwszego ciosu. Ale najpierw trzeba odsunąć kamień i nie narobić hałasu."],
    ch: [
      { l: "Odsuwam kamień i wchodzę cicho (Skradanie, ST 12)", test: { sk: "Skradanie", st: 12, label: "Wejście do kurhanu" }, toOk: 31, toNo: 311 },
      { l: "Wchodzę zawalonym bokiem, od północy, tak jak szło ciało", to: 31, vis: F("tylna"), hint: "Tropiciel znalazł tę drogę" },
      { l: "Wycofuję się", to: 24 }
    ] };

  SC[31] = { t: "Uśpiony", chap: ["Rozdział IV", "Szczelina"],
    fight: { foes: [{ base: "draugr", atkMod: -1, n: "Draugr" }], surprise: 2, noFlee: false, flee: 32, cover: 0 },
    x: [
      "Wnętrze jest szersze, niż się spodziewa{łeś|łaś}. Zimne powietrze uderza w twarz jak płótno. Na ziemi, w niszy, leży Draugr. Nie oddycha, nie rusza się, ale w jego bezruchu jest coś, co każe myśleć o zwierzęciu, które udaje martwe. Czarna skóra, zapadnięte policzki, dłonie jak korzenie.",
      "Wyciągasz miecz i robisz krok."
    ],
    after: [{ x: "Wyskakuje z ciemności ostatnim ruchem, którego się nie spodziewał nawet on sam. A potem, nagle, jest tylko cisza, i ciężki oddech tego, kto przeżył." }],
    ch: [{ l: "Zabieram się za rytuał", to: 28, c: function (s) { return !!s.flags.pokonany_draugr; }, why: "Walka jeszcze trwa" }] };

  SC[311] = { t: "Hałas", chap: ["Rozdział IV", "Szczelina"],
    fight: { foes: [{ base: "draugr", n: "Draugr" }], surprise: 0, flee: 32 },
    x: [
      "Kamień trzeszczy, kruszy się coś pod stopą. W niszy poruszają się oczy, które nie mają białek. Wielki cień unosi się z ziemi, prostując się bez pośpiechu. Nie rzuca się. Podchodzi, jakby sprawdzał, kto ma odwagę stać."
    ],
    after: [{ x: "Kiedy cień w końcu pada, w grobowcu zapada cisza, a ty stoisz nad nim dłuższą chwilę, dopóki ręce przestają drżeć." }],
    ch: [{ l: "Zabieram się za rytuał", to: 28, c: function (s) { return !!s.flags.pokonany_draugr; }, why: "Walka jeszcze trwa" }] };

  /* ===================== KURHAN: NOC ===================== */
  SC[26] = { t: "Kurhan nocą", chap: ["Rozdział IV", "Pojedynek"], intro: [
    "Idziesz na wzgórze o zmroku. Księżyc, jeśli jest, przecieka przez chmury jak mleko przez płótno. Kurhan czeka. Z jego szczeliny sączy się chłód, który czujesz przez skórę.",
    { c: function (s) { return EN.isFull(s.day); }, x: "Dziś pełnia. Księżyc patrzy wprost na kopiec i wszystko jest widoczne aż za dobrze. Coś w tym świetle czyni to, co w kopcu, silniejszym." }],
    x: [
      "Czekasz. Wiatr łamie się o głazy. Nie ma żadnego dźwięku poza deszczem i twoim własnym oddechem, który wydaje ci się za głośny, jakby słyszała go cała dolina. Nie wiesz, ile to trwa. Dłonie na rękojeści są zimne i wilgotne, a w ustach masz posmak żelaza, jak przed każdą walką. W końcu coś zmienia się w powietrzu, jakby ktoś wyssał z niego ciepło. Kiedy w końcu to wychodzi, nie robi tego z pośpiechem. Przez szczelinę przeciska się najpierw ręka, długa i czarna, potem ramię, potem ciało, które nie powinno się już poruszać. Jest wyższy, niż mówił Wojtek. Bez butów, w resztkach płótna. Zwraca ku tobie twarz, której nie ma sensu opisywać.",
      { c: F("bartek_idzie"), x: "Z krzaków za twoimi plecami wypada Bartek z kosą w obu rękach, krzycząc coś, co brzmi jak imię jego ojca. Draugr patrzy na niego, potem na ciebie. Pojedynek, który miał być jeden na jednego, przestaje być pojedynkiem." }
    ],
    on: function (s, E) { if (s.flags.bartek_idzie) { s.flags.rytual_zepsuty = true; E.chip("Pojedynek zepsuty przez Bartka", "neg"); } },
    ch: [
      { l: "Staję do walki", to: 27 }
    ] };

  SC[27] = { t: "Draugr", chap: ["Rozdział IV", "Pojedynek"],
    fight: { foes: [{ base: "draugr", n: "Draugr" }], nightFull: true, noFlee: false, flee: 32 },
    x: ["Pierwsza rzecz, jaką zauważasz, to że nie czujesz żadnej złości. Tylko zimno i głód, i dziwny żal, który nie ma w tej chwili żadnego uzasadnienia.",
      "To nie jest już Jędrzej. A jednak, kiedy Draugr wyciąga ku tobie rękę, w tej ręce jest coś ze starego gestu: tak wyciąga się dłoń do kogoś, kto cię zostawił, żeby go zatrzymać. Potem palce zaciskają się w pięść i walka zaczyna się naprawdę."],
    after: [
      { c: function (s) { return !!s.flags.pokonany_draugr; }, x: "Draugr osuwa się na kolana, potem na ziemię. Nie rusza się, ale też nie jest martwy w żaden sposób, który rozumiesz. Zimno unosi się z niego jak z lodu." },
      { c: function (s) { return !!s.flags.bartek_idzie && s.flags.bartek_los === 1; }, x: "Bartek leży kilka kroków dalej, twarzą do ziemi. Dłoń zaciśnięta na drzewcu kosy. Nie rusza się." },
      { c: function (s) { return !!s.flags.bartek_idzie && s.flags.bartek_los === 2; }, x: "Bartek siedzi pod głazem, trzymając się za żebra, blady jak ściana. Żyje. Będzie żył, jeśli ktoś mu pomoże, i jeśli zdoła przekonać samego siebie, że ten wieczór się nie wydarzył." }
    ],
    ch: [{ l: "Zabieram się za rytuał", to: 28, c: function (s) { return !!s.flags.pokonany_draugr; }, why: "Walka jeszcze trwa" }] };

  SC[32] = { t: "Ucieczka", chap: ["Rozdział IV", "Odwrót"],
    on: function (s, E) { s.flags.ucieklem = true; E.rep("lud", -1); E.czl(-5, "ucieczka"); s.flags.strach = (s.flags.strach || 0) + 1; E.czas(1); },
    x: ["Biegniesz. Nie jest to bohaterskie, ale też nie jest głupie. Wiatr szarpie płaszczem, a za plecami słychać zimne, powolne kroki, które nie muszą się spieszyć. Docierasz na plac w Szarówce, z sercem w gardle. Ludzie widzą. Nikt nic nie mówi."],
    ch: [{ l: "Wracam do wsi", to: 10 }] };

  /* ===================== RYTUAŁ ===================== */
  SC[28] = { t: "Rytuał", chap: ["Rozdział V", "Po walce"], intro: [
    "Draugr leży. Chłód, który z niego idzie, zamraża ci oddech. Czujesz, że to jeszcze nie koniec."],
    x: [
      { c: D("draugr_rytual"), x: "Wiesz, co dalej: głowa, ogień, popioły daleko. Zrób to jak należy, w kolejności, bez pomocy." },
      { c: function (s) { return !s.dz.draugr_rytual; }, x: "Coś nie daje ci spokoju. Wydaje ci się, że to jeszcze nie koniec, ale nie wiesz, co dalej. Zostaje intuicja i to, co przeczyta{łeś|łaś}." },
      { c: F("r_glowa"), x: "Robisz to szybko, żeby nie myśleć. Ostrze wchodzi w szyję z oporem, jak w mokre drewno, i nic nie krzyczy, nic nie broczy. Z rany wydobywa się tylko para, siwa i zimna, i zapach starej ziemi. Głowa toczy się o pół kroku, z oczami wciąż otwartymi, wpatrzonymi w stronę wsi. Patrzysz na nie dłużej, niż {powinieneś|powinnaś}. Potem je zamykasz." },
      { c: F("r_glowa"), x: "- Głowa leży osobno." },
      { c: F("r_ogien"), x: "Ogień nie łapie od razu. Ciało jest mokre i zimne, jakby sprzeciwiało się zakończeniu. Dopiero kiedy olej przesiąka w płótno, płomień wstaje wysoki, żółty i hałaśliwy, i w jego świetle widzisz twarz, która już nie przypomina nikogo. Czas płynie wolno. Kiedy ogień opada, zostaje czarna, krucha skorupa, a z niej szary proch, zimny jak pierwszy śnieg. Dotykasz go palcem. Naprawdę zimny." },
      { c: F("r_ogien"), x: "- Ciało i głowa spalone do zimnych popiołów." },
      { c: function (s) { return s.flags.r_pochowek === "daleko"; }, x: "- Popioły pochowane daleko od ludzi." },
      { c: function (s) { return s.flags.r_pochowek === "hanna"; }, x: "- Popioły spoczęły przy grobie Hanny." },
      { c: function (s) { return s.flags.r_pochowek === "blisko"; }, x: "- Popioły zostały blisko wsi." }
    ],
    ch: [
      { l: "Ścinam mu głowę", to: 28, vis: N("r_glowa"), c: function (s) { return !!EN.weapon(s).ciecie; }, why: "Twoja broń nie nadaje się do ścinania głowy",
        fx: function (s, E) { s.flags.r_glowa = true; E.chip("Głowa odcięta", "note"); } },
      { l: "Palę ciało i głowę", to: 28, vis: function (s) { return !!s.flags.r_glowa && !s.flags.r_ogien; },
        c: function (s) { return EN.has(s, "krzesiwo") && (EN.qty(s, "olej") >= 1 || EN.qty(s, "pochodnia") >= 2); }, why: "Potrzebujesz krzesiwa i oleju (albo dwóch pochodni)",
        fx: function (s, E) { if (EN.qty(s, "olej") >= 1) E.zabierz("olej", 1); else E.zabierz("pochodnia", 2); s.flags.r_ogien = true; E.czas(1); E.chip("Zimne popioły", "note"); } },
      { l: "Układam stos z chrustu i drewna z okolicy (krzesiwo, dwie pory, zimno)", to: 28, vis: function (s) { return !!s.flags.r_glowa && !s.flags.r_ogien && !(EN.has(s, "krzesiwo") && (EN.qty(s, "olej") >= 1 || EN.qty(s, "pochodnia") >= 2)); },
        c: function (s) { return EN.has(s, "krzesiwo"); }, why: "Bez krzesiwa nie rozpalisz nawet chrustu",
        fx: function (s, E) { s.flags.r_ogien = true; E.czas(2); E.zimno(1); E.chip("Zimne popioły (po długiej nocy przy stosie)", "note"); } },
      { l: "Staram się przypomnieć, co jeszcze trzeba zrobić (Wiedza o bestiach, ST 14)", vis: function (s) { return !s.dz.draugr_rytual; },
        test: { sk: "Wiedza o bestiach", st: 14, label: "Intuicja Łowcy", ok: function (s, E) { E.fakt("draugr_rytual"); } }, to: 28 },
      { l: "Niosę popioły daleko od wsi i zakopuję je w ziemi", to: 29, vis: function (s) { return !!s.flags.r_ogien && !s.flags.r_pochowek; }, c: D("draugr_rytual"), why: "Nie wiesz, że to wymagane",
        fx: function (s, E) { s.flags.r_pochowek = "daleko"; E.czas(1); } },
      { l: "Wrzucam popioły do rzeki", to: 29, vis: function (s) { return !!s.flags.r_ogien && !s.flags.r_pochowek; }, c: D("draugr_rytual"), why: "Nie wiesz, że to wymagane",
        fx: function (s, E) { s.flags.r_pochowek = "daleko"; E.czas(1); } },
      { l: "Chowam popioły obok grobu Hanny, żony Jędrzeja", to: 29, vis: function (s) { return !!s.flags.r_ogien && !s.flags.r_pochowek && !!s.flags.hanna_grob; },
        fx: function (s, E) { s.flags.r_pochowek = "hanna"; E.czas(1); E.czl(10, "litość"); } },
      { l: "Zostawiam popioły i wracam do wsi", to: 29, vis: function (s) { return !!s.flags.r_ogien && !s.flags.r_pochowek; },
        fx: function (s, E) { s.flags.r_pochowek = "blisko"; } },
      { l: "Wracam do wsi (rytuał nieskończony)", to: 29, vis: function (s) { return !s.flags.r_ogien; },
        fx: function (s, E) { s.flags.r_pochowek = "brak"; } }
    ] };

  SC[29] = { t: "Świt", chap: ["Rozdział V", "Rano"], intro: [
    "Idziesz do Szarówki, kiedy szarzeje, a deszcz wraca, jakby miał ci zrobić przysługę. Trawa na zboczu jest szara od rosy, kopiec za plecami wygląda jak zwykły kopiec, zwykły garb ziemi, i nie wiesz, czy odczuwasz ulgę, czy tylko zmęczenie. Nad dachami wsi unosi się pierwszy dym. Ktoś otwiera okiennicę, wygląda w twoją stronę, i długo nie zamyka."],
    on: function (s, E) { if (s.pora !== 0) E.czas((4 - s.pora) % 4); },
    x: [
      { c: function (s) { return !!s.flags.rytual_zepsuty || s.flags.r_pochowek === "brak" || s.flags.r_pochowek === "blisko" || (!s.flags.r_glowa) || (!s.flags.r_ogien); },
        x: "Szarzeje. Coś w tobie podpowiada, że zrobi{łeś|łaś} za mało albo za źle. Nie masz dowodu. Masz tylko wieś, która ma wreszcie wyjść z domów." },
      { c: function (s) { return !s.flags.rytual_zepsuty && s.flags.r_pochowek === "daleko"; },
        x: "Szarzeje. Nic nie ciągnie cię z tyłu. Wiatr jest tylko wiatrem, a zimno tylko zimnem. Wiesz, że zrobi{łeś|łaś} to, co trzeba." },
      { c: function (s) { return s.flags.r_pochowek === "hanna" && !s.flags.rytual_zepsuty; },
        x: "Szarzeje. Zrobi{łeś|łaś} to inaczej, niż mówią księgi, bo uzna{łeś|łaś}, że człowiek, który zazdrościł żywym, zasługuje na to, żeby choć raz leżeć przy tej, którą kochał. Nie wiesz, czy to nie był błąd. Nie wiesz jeszcze." }
    ],
    ch: [
      { l: "Wchodzę do wsi", to: 33, c: function (s) { return !!s.flags.pokonany_draugr; }, vis: function (s) { return !(s.flags.rytual_zepsuty || s.flags.r_pochowek === "brak" || s.flags.r_pochowek === "blisko" || !s.flags.r_glowa || !s.flags.r_ogien); } },
      { l: "Wchodzę do wsi", to: 36, vis: function (s) { return !!(s.flags.rytual_zepsuty || s.flags.r_pochowek === "brak" || s.flags.r_pochowek === "blisko" || !s.flags.r_glowa || !s.flags.r_ogien); } }
    ] };

  /* ===================== POWRÓT (rytuał zepsuty) ===================== */
  SC[36] = { t: "Powrót", chap: ["Rozdział V", "Druga noc"], intro: [
    "Wchodzisz do wsi bez fanfar. Sołtys dziękuje ci cicho, tak, żeby nie słyszał nikt, kto mógłby kiedyś zeznawać. Płaci. Wieś patrzy z ulgą, która trwa do wieczora."],
    x: [
      "O zmroku słyszysz coś, co przypomina odgłos kroków na wzgórzu. Najpierw jeden. Potem drugi, wolniejszy. Ktoś w karczmie zaczyna się modlić po cichu. Wiesz, że Draugr wraca, słabszy, ale nie martwy.",
      { c: function (s) { return !!s.flags.rytual_zepsuty; }, x: "Pojedynek był zepsuty. To wystarczyło." },
      { c: function (s) { return !s.flags.rytual_zepsuty; }, x: "Rytuał był niepełny. To wystarczyło." }
    ],
    ch: [{ l: "Wychodzę mu naprzeciw", to: 37 }] };

  SC[37] = { t: "Powrót Draugra", chap: ["Rozdział V", "Druga noc"],
    fight: { foes: [{ base: "draugr", zyw: 20, atkMod: -1, n: "Draugr (wrócił)" }], flee: 32 },
    x: ["Nie masz już siły, żeby się bać. Ma jeszcze mniej wiary w siebie niż ty. Idzie wolniej, a jednak z tym samym uporem."],
    after: [{ x: "Tym razem jest inaczej. Kiedy pada, ciało prawie rozsypuje się w proch. Zrobi{łeś|łaś}, co trzeba, tym razem do końca." }],
    ch: [{ l: "Kończę sprawę", to: 33, c: function (s) { return !!s.flags.pokonany_draugr; }, why: "Walka jeszcze trwa",
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
    ch: [{ l: "Chowam sygnet i idę dalej", to: 39, fx: function (s, E) { E.dodaj("sygnet"); E.fakt("gen_domy"); } }] };

  SC[39] = { t: "Koniec Tomu I", chap: ["Tom I", "Szarówka"], end: "Koniec Tomu I",
    x: [
      "Schodzisz ze wzgórza, ku drodze, która prowadzi gdzieś, gdzie nikt cię nie zna. Siwy miał rację: nikt tu nie będzie ci dziękował głośno. Kilka groszy, trochę jedzenia, zimne spojrzenia. Ale tej nocy nikt w Szarówce nie zamknął drzwi na zasuwę.",
      "Sygnet w kieszeni jest chłodny. Odwracasz go w palcach. Runa niczego ci nie mówi. Ale gdzieś, w jakimś Domu, ktoś będzie wiedział, że straci{łeś|łaś} go w tych górach, i że Łowca z Szarówki żyje."
    ], ch: [] };

  SC[34] = { t: "Śmierć", chap: ["Tom I", "Koniec"], end: "Śmierć",
    x: [
      "Ostatnie, co czujesz, to zimno ziemi pod policzkiem i dziwne ciepło krwi.",
      "Szarówka znajdzie cię rano, albo w ogóle. Nikt nie powie głośno, że był tu jakiś Łowca. Nikt nie przypomni sobie twojego imienia. Siwy będzie miał jeszcze jeden powód, żeby pić ze swojego kubka w milczeniu.",
      "Pamiętaj, powiedział. Niektórych imion nikt nie zapamięta."
    ], ch: [] };

  SC[38] = { t: "Potwór", chap: ["Tom I", "Koniec"], end: "Potwór",
    x: ["Ktoś, kto patrzy na ciebie, widzi już tylko to, czego się boi. Nie widzi Łowcy, nie widzi człowieka. Widzi to, na co sam polujesz. I w tej chwili nie masz argumentów, żeby go w tym błędzie przekonać."], ch: [] };

  /* ===================== ROZBUDOWA: MIEJSCA I ŚCIEŻKI KLASOWE ===================== */
  var K = function (k) { return function (s) { return s.pc.klasa === k; }; };

  /* --- rozmowa przy piecu (wszyscy, kosztuje kolejkę) --- */
  SC[113] = { t: "Przy piecu", chap: ["Rozdział II", "Karczma"],
    on: function (s, E) { s.flags.rozmowa_piec = true; E.kasa(-1 * MD); E.czas(1); E.notatka("Przy piecu w karczmie: ludzie mówią o Jędrzeju szeptem. Jego żona leży na cmentarzu."); s.flags.cmentarz_wiem = true; E.fakt("gen_hanna"); },
    x: [
      "Stawiasz kolejkę. Gniewko rozlewa kwaśne piwo do glinianych kubków, a ludzie, którzy do tej pory udawali, że cię nie ma, przysuwają się o pół kroku, jak psy do ognia, którego jeszcze nie są pewne. Nikt nie podnosi kubka pierwszy. Dopiero kiedy sołtys kiwa głową, piją.",
      "- Mnie tam nic do niego - zaczyna kowal, nie czekając na pytanie. Ma ręce czarne od roboty i oczy czerwone od niewyspania. - Jędrzej to był cichy człowiek. Taki, co się kłaniał pierwszy, i jeszcze przepraszał, że się kłania. Kiedy Hanna zachorowała, nosił ją na rękach do Marzanny, trzy mile, w deszczu. Nie pomogło. Pochował ją na cmentarzu, przy samym płocie, żeby miała widok na wzgórze. A potem już tylko chodził tam co wieczór i siedział. Siedział, rozumiesz? Jak pies na grobie.",
      "- A zimą przyszedł ktoś - wtrąca stara kobieta z kąta, której dotąd nie zauważy{łeś|łaś}, i natychmiast cichnie, bo Gniewko rzuca jej spojrzenie. Pije, patrzy w kubek. Reszta wsi też patrzy w kubki.",
      "Zostajesz jeszcze chwilę. Za oknem ciemnieje, a w izbie pachnie dymem, mokrą wełną i strachem, który przestał być nowością i stał się domownikiem. Wychodzisz, kiedy kubki są puste, a rozmowa wróciła do bydła i cen."
    ],
    ch: [{ l: "Wychodzę z karczmy", to: 10 }] };

  /* --- cmentarz --- */
  SC[50] = { t: "Cmentarz", chap: ["Rozdział II", "Przy płocie"], intro: [
    "Cmentarz w Szarówce jest mały, pochylony na bok, jak coś, co przez lata ktoś próbował zepchnąć ze wzgórza. Kilkanaście drewnianych krzyży, kilka kamieni. Wiatr gra na dachu kapliczki, w której od lat nie było księdza. Trawa jest mokra i gęsta, pachnie rozkładem i miętą."],
    on: function (s, E) { s.flags.hanna_grob = true; E.fakt("gen_hanna"); E.czas(1); },
    test: { sk: "Spostrzegawczość", st: 11, label: "Przy grobie Hanny", ok: function (s, E) { E.fakt("draugr_dom"); E.notatka("Przy grobie Hanny: ślady bosych stóp i szron tylko na jej kamieniu. Przychodzi tu."); } },
    x: [
      "Grób Hanny znajdujesz bez pytania. Jest przy samym płocie, z widokiem na wzgórze, tak jak mówili. Na kamieniu wyryto jedno słowo: HANNA. Pod nim, dłutem mniej pewnym, ktoś dopisał: ŻONA. Nic więcej. Ludzie, którzy kochają, nie mają zwykle czasu na epitafia. Teraz widzisz, że to prawda."
    ],
    after: [
      { t: "ok", x: "Na kamieniu, tylko na tym jednym, leży cienka warstwa szronu, choć dzień jest mokry, a ziemia wokół ciemna. W trawie, w stronę płotu i dalej, na wzgórze, ciągną się płytkie odciski bosych stóp. Za duże, za głębokie i zbyt równe, jakby ten, kto je zostawił, szedł tędy setki razy, nie myśląc o drodze. Przy grobie ziemia jest ubita w półkole. Tu ktoś stał, tu klęczał, tu siedział. Całe noce." },
      { t: "no", x: "Deszcz zatarł wszystko, co mogło cokolwiek znaczyć. Zostaje kamień, trawa i zapach mięty. Jest w nim jednak coś, co zapamiętujesz: grób jest zadbany. Ktoś go pielęgnuje, choć nikt we wsi nie przyznaje się, że to robi." }
    ],
    ch: [{ l: "Wracam do wsi", to: 10 }] };

  /* --- opuszczona chata Jędrzeja --- */
  SC[52] = { t: "Chata Jędrzeja", chap: ["Rozdział II", "Pusty dom"], intro: [
    "Chata Wrony stoi na uboczu, na końcu ścieżki, którą nikt już nie chodzi. Dach zapadł się z jednej strony. Okiennice są zamknięte, z drzwi zwisa skobel i zardzewiały zamek, który ktoś zawiesił tu bardziej z lęku niż z przezorności."],
    x: [
      "Z komina nie idzie dym. W ogrodzie leżą suche łodygi fasoli, zgięte jak palce. Na płocie wisi garnek, w którym nikt już nie gotuje. Wszędzie panuje spokój, który nie jest spokojem, tylko brakiem."
    ],
    ch: [
      { l: "Otwieram zamek cichym ruchem (Złodziejstwo, ST 10)", vis: K("zlodziej"), test: { sk: "Złodziejstwo", st: 10, label: "Zamek w drzwiach Jędrzeja" }, toOk: 521, toNo: 522 },
      { l: "Wyważam drzwi barkiem (Siła, ST 9)", vis: K("wojownik"), test: { at: "SF", st: 9, label: "Drzwi chaty Jędrzeja" }, toOk: 523, toNo: 522 },
      { l: "Wchodzę przez okno z tyłu (Skradanie, ST 12)", vis: K("tropiciel"), test: { sk: "Skradanie", st: 12, label: "Okno od ogrodu" }, toOk: 521, toNo: 522 },
      { l: "Przyglądam się drzwiom i okiennicom. To nie dla mnie.", vis: function (s) { return !K("zlodziej")(s) && !K("wojownik")(s) && !K("tropiciel")(s); }, to: 10, hint: "Tylko ktoś o odpowiednich umiejętnościach wejdzie tu bez hałasu" },
      { l: "Wracam do wsi", to: 10 }
    ] };

  SC[521] = { t: "Wewnątrz", chap: ["Rozdział II", "Pusty dom"],
    on: function (s, E) { s.flags.chata_byla = true; E.fakt("gen_obcy"); E.fakt("gen_hanna"); E.czas(1); E.kasa(6 * MD); E.notatka("Chata Jędrzeja: dwa kubki na stole, jeden nietknięty. Zimą gościł obcego w czarnym płaszczu. Zostawił po nim wosk i woń czegoś słodkiego."); },
    x: [
      "W środku jest zimno jak w grobie. Na stole stoją dwa kubki. Jeden pełen kurzu, drugi pusty. Obok leży nieskończona drewniana łyżka, której ostrze poszło tak głęboko w serce brzozy, że ktoś porzucił robotę w pół ruchu. Nad łóżkiem wisi czerwona wstążka, którą kiedyś nosiło się we włosach.",
      "Pod belką, na której go znaleziono, ziemia jest wydeptana w kółko, wiele razy, w jedną stronę. Przy piecu stoi trzeci stołek, bez śladu kurzu. Ktoś siedział tu zimą, długo, i patrzył na Jędrzeja tak, jak patrzy się na kogoś, kto jest ci coś winien.",
      "Na parapecie widzisz coś, co przyciąga wzrok: kropla czarnego wosku, stwardniała w kształt ucha. Zapach, który uniósł się z niej, kiedy jej dotkną{łeś|łaś}, jest słodki i obcy. Taki sam, jaki stoi w kurhanie, kiedy ktoś z niego wychodzi. Zapamiętujesz to.",
      "W skrzyni pod łóżkiem, pod zeszytami z rachunkami, leży woreczek z monetami. Sześć miedziaków, odłożonych starannie, każdy owinięty w kawałek płótna. Zabierasz je z uczuciem, które trudno nazwać. Nie jest to wstyd. To bliżej szacunku dla człowieka, który odkładał każdy grosz na pogrzeb żony, a sam został pochowany za darmo."
    ],
    ch: [{ l: "Wychodzę, zamykając drzwi tak, jak były", to: 10 }] };

  SC[522] = { t: "Nie tędy", chap: ["Rozdział II", "Pusty dom"],
    on: function (s, E) { E.czas(1); E.chip("Zmarnowana pora", "neg"); },
    x: ["Zamek trzyma, okiennica nie puszcza, a ty tracisz dłuższą chwilę na coś, co nie ma szans, i czujesz, że ktoś z okna sąsiedniej chaty patrzy na ciebie i zapamiętuje. Odchodzisz z niczym, ze skórą, która swędzi pod spojrzeniem."],
    ch: [{ l: "Wracam do wsi", to: 10, fx: function (s, E) { E.rep("lud", -1); } }] };

  SC[523] = { t: "Drzwi lecą", chap: ["Rozdział II", "Pusty dom"],
    on: function (s, E) { E.rep("lud", -1); E.chip("Hałas słychać w całej wsi", "neg"); },
    x: ["Drzwi pękają z trzaskiem, który niesie się po dolinie jak strzał. Z sąsiedniej chaty wygląda kobieta, patrzy na ciebie bez słowa i zamyka okiennicę. Zostaje ci tylko to, co zostało po Jędrzeju. Wchodzisz."],
    ch: [{ l: "Rozglądam się po izbie", to: 521 }] };

  /* --- Tropiciel: tropem do kurhanu --- */
  SC[51] = { t: "Tropem", chap: ["Rozdział II", "Ślad"], intro: [
    "Zagroda, z której wychodzisz, ma za sobą ślad ciągnięcia, szeroki na dwie dłonie, ciemny od krwi bydła i mokrej ziemi. Zaczynasz od końca i idziesz do początku."],
    on: function (s, E) { E.czas(1); },
    test: { sk: "Tropienie", st: 10, label: "Pójście śladem do kurhanu", ok: function (s, E) { s.flags.tylna = true; E.fakt("draugr_sila"); E.fakt("draugr_dom"); E.notatka("Tropiciel: ślad prowadzi do zawalonego boku kurhanu. Od tyłu da się wejść bez ruszania kamienia."); } },
    x: [
      "Tropienie nie jest sztuką. Jest cierpliwością. Pochylasz się nad każdą wgniecioną kępą trawy, nad każdym odciskiem, nad każdym złamanym źdźbłem, i układasz je w zdanie, które ziemia napisała dla kogoś, kto umie czytać."
    ],
    after: [
      { t: "ok", x: "Ślad nie idzie do szczeliny między głazami, którą zna cała wieś. Skręca w bok, okrąża kopiec od północy, tam, gdzie od dawna runęła część ściany, i znika w ciemnej wyrwie. Z tej strony nikt nigdy nie patrzył. Ślady biegną tam, wracają tamtędy. Idą i wracają dokładnie tą samą ścieżką, tak jak chodzi się po domu, który zna się po ciemku. Zimny wiatr wciąga ci powietrze z ust, kiedy się pochylasz do wyrwy. Wiesz już, jak wejść bez hałasu." },
      { t: "no", x: "Idziesz za śladem do połowy zbocza i tam go tracisz. Ziemia jest twarda, deszcz zmył wszystko. Wracasz {niezadowolony|niezadowolona}, {zziębnięty|zziębnięta} i ze świadomością, że gdzieś w tej ziemi leży zdanie, którego nie umia{łeś|łaś} przeczytać." }
    ],
    ch: [{ l: "Wracam do wsi", to: 10 }] };

  /* --- Wojownik: oględziny rany --- */
  SC[142] = { t: "Oko żołnierza", chap: ["Rozdział II", "Ranny pasterz"],
    on: function (s, E) { s.flags.wojtek_rana = true; s.flags.obrona_bonus = (s.flags.obrona_bonus || 0) + 1; E.fakt("draugr_styl"); E.fakt("draugr_sila"); E.notatka("Wojownik: rana Wojtka wskazuje na ciosy z góry, bez gardy. Draugr nie osłania się."); E.chip("Znasz jego styl: +1 do Obrony w walce z nim", "pos"); },
    x: [
      "Prosisz, żeby pokazał rękę. Nie opatrunek, tylko to, co pod nim. Wojtek niechętnie odwija płótno, a ty patrzysz na ranę oczami kogoś, kto widział ich setki. Nie jest to zagryzienie, nie jest to cięcie. To zgniecenie, od łokcia do nadgarstka, tak głębokie, że kość przeszła przez skórę i wróciła.",
      "- Uderzył z góry, jedną ręką - mówisz powoli, bardziej do siebie niż do niego. - Z ramienia. Nie zasłaniał się, nie cofnął ręki. Nie uczono go tego i nie musiał się uczyć. Nie boi się, że oddasz.",
      "Wojtek patrzy na ciebie z szacunkiem, który pojawia się u prostych ludzi wobec tych, którzy rozumieją ich nieszczęście. Zapamiętujesz wszystko, co mówiła rana: kąt, siłę, rytm. Będziesz wiedzieć, w którą stronę się uchylić."
    ],
    ch: [{ l: "Dziękuję i wychodzę", to: 10 }] };

  /* --- Wojownik: miejsce pojedynku --- */
  SC[53] = { t: "Pole pojedynku", chap: ["Rozdział II", "Wzgórze"],
    on: function (s, E) { s.flags.pole_wybrane = true; s.flags.atak_bonus = (s.flags.atak_bonus || 0) + 1; E.czas(1); E.chip("Wybrane miejsce: +1 do ataku w pojedynku", "pos"); E.notatka("Wojownik: wybrałem i oczyściłem płaski skrawek ziemi przed kurhanem."); },
    x: [
      "Obchodzisz podnóże kopca, mierząc ziemię krokami. Tu zbocze zbyt strome. Tu stos głazów, o który zawadzisz piętą. Tu mokra glina, która zje ci podeszwy. W końcu znajdujesz płaski skrawek, dwadzieścia kroków od szczeliny, suchy i twardy, z którego widać wejście, i na którym nic nie przeszkodzi.",
      "Oczyszczasz go z kamieni, jednego po drugim, odkładając je na bok, aż zostanie tylko trawa. Pot spływa ci po plecach pod kaftanem. Robisz to tak, jak robił to każdy, kto wiedział, że na tym miejscu będzie umierał albo zabijał. Zgrzyt kamienia o kamień niesie się po wzgórzu. Nic nie odpowiada."
    ],
    ch: [{ l: "Schodzę ze wzgórza", to: 10 }] };

  /* --- Uczony: runy na głazach --- */
  SC[54] = { t: "Runy", chap: ["Rozdział II", "Wzgórze"], intro: [
    "Głazy przy szczelinie są porośnięte mchem tak grubo, że wyglądają jak futro. Zdrapujesz je paznokciem, płat po płacie, aż spod zieleni wychodzi coś, co wieś zapomniała, że ma w swoim sąsiedztwie: cienkie, powtarzalne, wyryte ręką, która wiedziała, co robi, znaki."],
    on: function (s, E) { E.czas(1); },
    test: { at: "SU", sk: "Wiedza o bestiach", st: 11, label: "Odczytanie run", ok: function (s, E) { E.fakt("draugr_runy"); E.fakt("draugr_rytual"); s.flags.rytual_znany = true; E.notatka("Uczony: runy na głazach kurhanu. Pojedynek, nie tłum. Głowa, ogień, popioły daleko."); },
      no: function (s, E) { E.fakt("draugr_runy"); } },
    x: ["Wyciągasz z torby kawałek węgla i pergamin. Przepisujesz znak po znaku, bo pamięć zawodzi, a papier nie. Wiatr szarpie rogi kartki."],
    after: [
      { t: "ok", x: "Układasz znaki w zdanie. Nie jest to modlitwa, nie jest zaklęcie. To ostrzeżenie, wyryte dla tych, którzy przyjdą później. Mówi o tym, kto tu leży, że spoczywa, a nie śpi, i że jeśli powstanie, należy mu się to, czego się domaga każdy wojownik: pojedynek, jeden na jednego, bez świadków i bez pomocy, a potem głowa, ogień i ziemia daleko od domów. Ktoś, kto to wyrył, wiedział więcej o nieumarłych, niż napisano w jakiejkolwiek księdze na regale Siwego. Przepisujesz ostatni znak ze ściśniętym gardłem. Rozumiesz, że to nie pierwszy raz." },
      { t: "no", x: "Rozpoznajesz układ znaków i rytm. Tyle, że mowa jest starsza niż wszystko, co czyta{łeś|łaś}. Rozumiesz tylko, że to nie jest zwykły grób. Że tu spoczywa ktoś, komu należał się szacunek, albo kogo należało się bać. Zwijasz pergamin i chowasz do torby. Może Marzanna będzie wiedziała więcej." }
    ],
    ch: [{ l: "Schodzę ze wzgórza", to: 10 }] };

  /* --- Złodziej: podsłuch w karczmie --- */
  SC[56] = { t: "Za ścianą", chap: ["Rozdział II", "Karczma"], intro: [
    "Wychodzisz tylnymi drzwiami, jakbyś szedł za potrzebą, ale zamiast do wygódki skręcasz pod ścianę izby, tam, gdzie deski są zbite krzywo, a szpara między nimi ma szerokość palca."],
    on: function (s, E) { s.flags.podsluch = true; E.czas(1); },
    test: { sk: "Skradanie", st: 10, label: "Pod ścianą karczmy", ok: function (s, E) { E.fakt("gen_obcy"); E.notatka("Podsłuchałem: sołtys i Gniewko boją się, że obcy w czarnym płaszczu wróci."); }, no: function (s, E) { E.chip("Gniewko wyszedł, kiedy sta{łeś|łaś} pod ścianą", "neg"); E.rep("lud", -1); } },
    x: ["Stoisz bez ruchu. Z izby dobiega szept dwóch mężczyzn, którzy nie chcą być usłyszani, i wiedzą, że są."],
    after: [
      { t: "ok", x: "- ...Zapłacił z góry - mówi Gniewko. - Za nocleg i milczenie. Przyszedł zimą, w ten mróz, w czarnym płaszczu, i siedział u Wrony trzy dni. Nikt go nie widział, jak wychodził. - Cisza. - A potem Jędrzej... - Nie mów tego głośno - ucina sołtys. - Jeśli wróci, a ten Łowca nic nie wie... - Sołtys przerywa, a po chwili dodaje ciszej: - Niech nie wie. Niech zrobi swoje i idzie. Wystarczy mu to, co umie." },
      { t: "no", x: "Słyszysz tylko urywki, jakieś słowa o zimie i płaszczu, i nagle skrzypnięcie, i drzwi. Gniewko wychodzi na zaplecze z wiadrem pomyj, mierzy cię wzrokiem, widzi, gdzie stoisz, i odwraca się bez słowa. Wystarczy. Wieczorem pół wsi będzie wiedziało, że Łowca podsłuchuje pod ścianami." }
    ],
    ch: [{ l: "Wracam do izby", to: 11 }] };

  /* --- Uczony: księga wsi --- */
  SC[57] = { t: "Księga wsi", chap: ["Rozdział II", "Karczma"], intro: [
    "Sołtys patrzy na ciebie z wyraźną niechęcią, ale potem, bez słowa, otwiera skrzynię pod ławą i wyciąga księgę w skórzanej oprawie, grubą jak cegła. Wieś Szarówka prowadzi swoje zapiski już od czterech pokoleń. Nie wszystko w nich jest do czytania, ale ty umiesz czytać także to, co ktoś próbował ukryć."],
    on: function (s, E) { s.flags.ksiega_wsi = true; E.czas(1); },
    test: { at: "SU", sk: "Wiedza o bestiach", st: 10, label: "Księga wsi", ok: function (s, E) { E.fakt("gen_obcy"); E.fakt("gen_hanna"); E.notatka("Księga wsi: zimą u Wrony gościł obcy, a Hannę pochowano w poświęconej ziemi, Jędrzeja nie."); } },
    x: ["Wertujesz kartki, mijasz zapisy o urodzajach i podatkach, o wyrokach i kłótniach o miedzę. Szukasz zimy, tej ostatniej."],
    after: [
      { t: "ok", x: "Wpis jest krótki, zapisany pośpiesznie, innym atramentem niż reszta. Pod datą w środku zimy: Przybył obcy, w czerni, bez imienia. Zatrzymał się u Wrony. Opłacił milczenie. Kilka dni później kolejny wpis, ręką sołtysa: Wrona nie żyje. Pochowany w kurhanie, bez księdza, ziemia nie pozwoliła. Nie ma słowa o tym, kim był obcy, ani czego chciał. Jest za to wyskrobany fragment, taki, który ktoś próbował usunąć nożem. Pod światło wyłapujesz resztę: znak, który wygląda jak odwrócony klucz." },
      { t: "no", x: "Przeglądasz kartki do późnej nocy i wiesz tylko tyle, że zima była ciężka, a ludzie umierali. Nic, co wskazywałoby, że ta zima była inna niż pozostałe. Sołtys zamyka księgę z ulgą, którą ledwo maskuje." }
    ],
    ch: [{ l: "Oddaję księgę i wracam do izby", to: 11 }] };

  var BOOK = {
    id: "tom1", title: "Tom I: Szarówka", start: 1, SC: SC, deathPara: 34, monsterPara: 38,
    startHook: function (s) { s.poszuk = 1; s.day = 8; s.pora = 1; }
  };
  EN.registerBook(BOOK);
})(typeof globalThis !== "undefined" ? globalThis : this);
