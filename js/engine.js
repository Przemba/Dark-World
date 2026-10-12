/* DARK WORLD: silnik zasad i przebiegu gry (bez DOM; działa w przeglądarce i w Node).
   Rdzeń testów, Szczęścia i walki rundowej wywodzi się z silnika COBRA: Okres próbny.
   Nowe względem COBRY: zegary (pora, księżyc, pogoda, Zimno, Głód), waga i pieniądze,
   Dziennik bestii, reputacja, Poszukiwany, nieumarli, którzy po pokonaniu wymagają rytuału. */
(function (G) {
  "use strict";
  var DW = G.DW = G.DW || {};
  var IT = DW.items;

  /* ---------- losowość ---------- */
  function mkRng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var RNG = Math.random;
  function setRng(r) { RNG = r; }
  function d(n) { return 1 + Math.floor(RNG() * n); }
  function dice(n, s, p) { var t = p || 0, r = [], i; for (i = 0; i < n; i++) { var x = d(s); r.push(x); t += x; } return { total: t, rolls: r }; }

  /* k10 z zasadą dziesiątki, podwójnej dziesiątki, jedynki i podwójnej jedynki (jak w COBRZE) */
  function k10x() {
    var first = d(10), rolls = [first], total = first, crit = false, fumble = false;
    if (first === 10) { var r = d(10); rolls.push(r); total = 10 + r; if (r === 10) crit = true; }
    else if (first === 1) { var r2 = d(10); rolls.push(r2); total = 1 - r2; if (r2 === 1) fumble = true; }
    return { total: total, rolls: rolls, crit: crit, fumble: fumble };
  }

  /* ---------- cechy i umiejętności ---------- */
  var ATTRS = ["SF", "WT", "BŁ", "ZR", "SU", "SZ"];
  var ATTR_NAMES = { SF: "Siła Fizyczna", WT: "Wytrzymałość", "BŁ": "Błyskotliwość", ZR: "Zręczność", SU: "Siła Umysłu", SZ: "Szybkość", WALKA: "Walka", OBRONA: "Obrona" };
  /* [nazwa, cecha, opis] */
  var SKILLS = [
    ["Walka", "WALKA", "Cięcie, pchnięcie, bójka."],
    ["Strzelanie", "ZR", "Pistolety na kołki i inna broń miotana."],
    ["Unik", "OBRONA", "Schodzenie z linii ciosu."],
    ["Tropienie", "BŁ", "Ślady, wiatr, zła ziemia."],
    ["Spostrzegawczość", "BŁ", "Szczegóły, które inni pomijają."],
    ["Wiedza o bestiach", "SU", "To, co przeczytałeś, usłyszałeś albo przeżyłeś."],
    ["Przetrwanie", "WT", "Nocleg, ogień, jedzenie z niczego."],
    ["Skradanie", "ZR", "Cicho, nisko, z wiatrem."],
    ["Zastraszanie", "SU", "Spojrzenie, które zamyka usta."],
    ["Charyzma", "SU", "Przekonywanie, targ, uśmiech."],
    ["Pierwsza pomoc", "BŁ", "Opatrunki, szwy, kauteryzacja."],
    ["Zielarstwo", "SU", "Co leczy, co truje, co uspokaja."],
    ["Siła woli", "SU", "Opór wobec strachu i klątw."],
    ["Złodziejstwo", "ZR", "Zamki, kieszenie, cudze skrytki."]
  ];
  var SKILL_ATTR = {}; SKILLS.forEach(function (s) { SKILL_ATTR[s[0]] = s[1]; });

  var KLASY = {
    wojownik: { n: "Wojownik", opis: "Twardy, silny, zaprawiony w bójkach. Na kilku bestiach nauczył się, że siła rozwiązuje więcej, niż głowa.",
      at: { SF: 8, WT: 7, "BŁ": 5, ZR: 6, SU: 4, SZ: 5 },
      sk: { "Walka": 4, "Unik": 3, "Strzelanie": 2, "Przetrwanie": 3, "Zastraszanie": 3, "Spostrzegawczość": 2, "Tropienie": 1, "Wiedza o bestiach": 1, "Siła woli": 2, "Pierwsza pomoc": 1 } },
    tropiciel: { n: "Tropiciel", opis: "Zna las, ślady i to, co nocą chodzi między drzewami. Nie wchodzi do walki, jeśli może jej uniknąć.",
      at: { SF: 6, WT: 6, "BŁ": 7, ZR: 7, SU: 5, SZ: 6 },
      sk: { "Tropienie": 4, "Spostrzegawczość": 4, "Strzelanie": 4, "Przetrwanie": 4, "Skradanie": 3, "Walka": 3, "Unik": 3, "Wiedza o bestiach": 2, "Pierwsza pomoc": 2, "Zielarstwo": 1 } },
    zlodziej: { n: "Złodziej", opis: "Nie lubi walczyć fair. Wie, jak wejść, wyjść i co zabrać po drodze.",
      at: { SF: 5, WT: 5, "BŁ": 7, ZR: 8, SU: 5, SZ: 7 },
      sk: { "Skradanie": 4, "Złodziejstwo": 4, "Unik": 4, "Spostrzegawczość": 3, "Walka": 3, "Strzelanie": 3, "Charyzma": 3, "Przetrwanie": 2, "Wiedza o bestiach": 1 } },
    uczony: { n: "Uczony", opis: "Wie więcej o bestiach niż większość żywych łowców. Dlatego jeszcze żyje.",
      at: { SF: 4, WT: 5, "BŁ": 7, ZR: 5, SU: 9, SZ: 4 },
      sk: { "Wiedza o bestiach": 5, "Zielarstwo": 3, "Pierwsza pomoc": 3, "Siła woli": 4, "Spostrzegawczość": 3, "Charyzma": 3, "Walka": 1, "Strzelanie": 2, "Unik": 2, "Przetrwanie": 2 } }
  };

  function attrVal(pc, k) {
    if (k === "WALKA") return Math.floor((pc.at.SF + pc.at["BŁ"]) / 2);
    if (k === "OBRONA") return Math.floor((pc.at.ZR + pc.at["BŁ"]) / 2);
    return pc.at[k] || 0;
  }
  function zywMaxOf(pc) { return 10 + pc.at.WT * 4; }

  /* ---------- czas, księżyc, pogoda ---------- */
  var PORY = ["Świt", "Dzień", "Zmierzch", "Noc"];
  function moonPhase(day) {
    var m = ((day % 28) + 28) % 28;
    if (m >= 26 || m <= 1) return "Nów";
    if (m <= 11) return "Rosnący księżyc";
    if (m <= 16) return "Pełnia";
    return "Malejący księżyc";
  }
  function isFull(day) { return moonPhase(day) === "Pełnia"; }
  var POGODY = ["Mżawka", "Ulewa", "Mgła", "Zachmurzenie", "Mróz", "Przejaśnienia", "Ulewa", "Mżawka"];
  function pogoda(s) {
    var h = ((s.seed | 0) * 2654435761 + s.day * 40503) >>> 0;
    h = (h ^ (h >>> 13)) >>> 0;
    return POGODY[h % POGODY.length];
  }
  function wet(w) { return w === "Ulewa" || w === "Mżawka"; }

  /* ---------- stan ---------- */
  function freshState() {
    return { v: 1, book: null, pc: null, zyw: 0, zywMax: 0, sz: 0, szMax: 0, czl: 100, cuda: 0,
      day: 8, pora: 1, zimno: 0, glod: 0, money: 0,
      inv: {}, eq: {}, pistol: 2, flags: {}, dz: {}, rep: { lud: 0, wladza: 0, wiedzmy: 0, dhampiry: 0 },
      poszuk: 0, leg: 0, cur: 0, visited: {}, log: [], end: null, chips: [], seed: (Math.random() * 4294967295) >>> 0 };
  }

  function startState(pc, bookId) {
    var s = freshState();
    s.book = bookId || null;
    s.pc = JSON.parse(JSON.stringify(pc));
    s.zywMax = zywMaxOf(s.pc); s.zyw = s.zywMax;
    s.szMax = 3 + (s.pc.perks && s.pc.perks.farciarz ? 1 : 0); s.sz = s.szMax;
    return s;
  }
  function giveStartGear(s) {
    ["trzewiki_p", "plaszcz_z", "spodnie", "kaftan"].forEach(function (id) { addItem(s, id, 1); equip(s, id, true); });
    addItem(s, "miecz", 1); equip(s, "miecz", true);
    addItem(s, "kozik", 1);
    addItem(s, "pistolet", 1);
    addItem(s, "kolek", 6);
    addItem(s, "racja", 2);
    addItem(s, "krzesiwo", 1);
    s.money = 12 * IT.MD;
    s.pistol = 2;
  }

  /* ---------- przedmioty ---------- */
  function item(id) { return IT.ITEMS[id]; }
  function has(s, id) { return (s.inv[id] || 0) > 0; }
  function qty(s, id) { return s.inv[id] || 0; }
  function addItem(s, id, n) { s.inv[id] = (s.inv[id] || 0) + (n || 1); }
  function removeItem(s, id, n) {
    n = n || 1; if ((s.inv[id] || 0) < n) return false;
    s.inv[id] -= n;
    if (s.inv[id] <= 0) { delete s.inv[id]; if (s.eq) for (var k in s.eq) if (s.eq[k] === id) delete s.eq[k]; }
    return true;
  }
  function equip(s, id, on) {
    var it = item(id); if (!it || !it.slot) return false;
    if (on === false) { if (s.eq[it.slot] === id) delete s.eq[it.slot]; return true; }
    if (!has(s, id)) return false;
    s.eq[it.slot] = id; return true;
  }
  function weight(s) { var w = 0; for (var k in s.inv) w += (item(k) ? item(k).waga : 0) * s.inv[k]; return Math.round(w * 10) / 10; }
  function capacity(s) { return s.pc.at.SF * 10; }
  function overload(s) { var c = capacity(s), w = weight(s); return w > c ? 2 : (w > c * 0.5 ? 1 : 0); }
  function cieplo(s) { var c = 0; for (var k in s.eq) { var it = item(s.eq[k]); if (it && it.cieplo) c += it.cieplo; } return c; }
  function weapon(s) { var id = s.eq.bron; return id ? item(id) : { n: "pięści", dice: [1, 3, 0], mod: -1, sk: "Walka", ciecie: false }; }
  function armorWyp(s, loc) {
    var a = s.eq.pancerz ? item(s.eq.pancerz).wyp : 0;
    if (loc === "glowa") { var g = s.eq.glowa ? item(s.eq.glowa).glowa || 0 : 0; return a > 0 ? Math.min(a, 2) + g : g; }
    return a;
  }
  function inicjatywaMod(s) {
    var a = s.eq.pancerz ? item(s.eq.pancerz) : null; if (!a) return 0;
    var sf = s.pc.at.SF, i = sf <= 3 ? 0 : sf <= 6 ? 1 : sf <= 9 ? 2 : 3; return a.zaw[i];
  }
  function buy(s, id, price) {
    price = price === undefined ? item(id).cena : price;
    if (s.money < price) return { ok: false, why: "Brakuje Ci pieniędzy." };
    s.money -= price; addItem(s, id, 1); return { ok: true };
  }
  function sell(s, id, price) {
    if (!has(s, id)) return { ok: false };
    var p = price === undefined ? Math.floor(item(id).cena / 3) : price;
    removeItem(s, id, 1); s.money += p; return { ok: true, price: p };
  }
  function useItem(s, id) {
    if (!has(s, id)) return null;
    var it = item(id);
    if (it.uzyj === "jedz") { removeItem(s, id, 1); s.glod = Math.max(0, s.glod - 2); return { t: "Zjadasz rację. Głód " + s.glod + "." }; }
    if (it.uzyj === "lecz") {
      if (s.zyw >= s.zywMax) return { t: "Nie masz czego opatrywać." };
      removeItem(s, id, 1);
      var h = d(6) + (s.pc.sk["Pierwsza pomoc"] || 0) * 2;
      s.zyw = Math.min(s.zywMax, s.zyw + h);
      return { t: "Opatrujesz rany. Odzyskujesz " + h + " Żywotności." };
    }
    return null;
  }

  /* ---------- kary i testy ---------- */
  function kary(s) {
    var parts = [], tot = 0, ratio = 1 - s.zyw / s.zywMax;
    var w = ratio >= 0.75 ? -4 : ratio >= 0.5 ? -2 : ratio >= 0.25 ? -1 : 0;
    if (w) { parts.push(["rany", w]); tot += w; }
    var z = s.zimno >= 5 ? -2 : s.zimno >= 3 ? -1 : 0;
    if (z) { parts.push(["Zimno", z]); tot += z; }
    var g = s.glod >= 4 ? -2 : s.glod >= 2 ? -1 : 0;
    if (g) { parts.push(["Głód", g]); tot += g; }
    var o = overload(s) ? -1 : 0;
    if (o) { parts.push(["ciężar", o]); tot += o; }
    return { total: tot, parts: parts };
  }
  function testBase(s, spec) {
    var at = spec.at || (spec.sk ? SKILL_ATTR[spec.sk] : "BŁ");
    var parts = [[at, attrVal(s.pc, at)]], base = attrVal(s.pc, at);
    if (spec.sk) { var v = s.pc.sk[spec.sk] || 0; base += v; parts.push([spec.sk, v]); }
    if (spec.mod) { base += spec.mod; parts.push([spec.modLabel || "modyfikator", spec.mod]); }
    var k = kary(s); if (k.total) { base += k.total; k.parts.forEach(function (p) { parts.push(p); }); }
    return { base: base, parts: parts, st: spec.st };
  }
  function calcTest(res) {
    res.total = res.tb.base + res.pre + res.post + res.roll.total;
    res.ok = res.roll.fumble ? false : (res.roll.crit ? true : res.total >= res.tb.st);
    res.margin = res.total - res.tb.st;
    return res;
  }
  function rollTest(s, spec, pre) {
    var tb = testBase(s, spec); pre = Math.max(0, Math.min(pre || 0, s.sz));
    s.sz -= pre;
    return calcTest({ spec: spec, tb: tb, pre: pre, roll: k10x(), post: 0, rerolls: 0 });
  }
  function luckAdd(s, res) { if (s.sz < 2 || res.roll.fumble) return false; s.sz -= 2; res.post += 1; calcTest(res); return true; }
  function luckReroll(s, res) { if (s.sz < 4) return false; s.sz -= 4; res.roll = k10x(); res.rerolls++; calcTest(res); return true; }

  /* ---------- czas, pory, noclegi ---------- */
  function newDay(s, E) {
    if (s.inv.racja > 0) { removeItem(s, "racja", 1); s.glod = Math.max(0, s.glod - 1); }
    else { s.glod = Math.min(6, s.glod + 1); if (E) E.chip("Brak jedzenia: Głód " + s.glod, "neg"); }
    if (s.glod >= 5) { s.zyw -= 2; if (E) E.chip("Głodujesz: -2 Żywotności", "neg"); }
  }
  function czas(s, n, E) {
    for (var i = 0; i < n; i++) {
      s.pora++;
      if (s.pora > 3) { s.pora = 0; s.day++; newDay(s, E); }
    }
  }
  /* nocleg: kończy się Świtem następnego dnia */
  function nocleg(s, mode, E) {
    var w = pogoda(s), msg = "", zi = 0, heal = 0;
    var c = cieplo(s);
    if (mode === "karczma") { zi = -2; heal = s.pc.at.WT * 2; msg = "Nocleg pod dachem"; }
    else if (mode === "stodola") { zi = -1; heal = Math.floor(s.pc.at.WT * 1.5); msg = "Nocleg w stodole"; }
    else if (mode === "ognisko" && has(s, "krzesiwo")) { zi = Math.max(0, 4 - c) + (wet(w) ? 1 : 0); heal = Math.floor(s.pc.at.WT / 2); msg = "Nocleg przy ognisku"; }
    else { zi = Math.max(0, 5 - c) + (wet(w) || w === "Mróz" ? 1 : 0); heal = Math.floor(s.pc.at.WT / 2); msg = "Nocleg pod gołym niebem (" + w.toLowerCase() + ")"; }
    if (s.pora < 3) czas(s, 3 - s.pora, E);
    var before = s.zimno;
    s.zimno = Math.max(0, Math.min(6, s.zimno + zi));
    czas(s, 1, E);
    if (s.glod < 4) s.zyw = Math.min(s.zywMax, s.zyw + heal);
    if (E) E.chip(msg + ": Zimno " + before + " → " + s.zimno + (heal ? ", +" + heal + " Żyw." : ""), zi > 0 ? "neg" : "pos");
  }

  /* ---------- walka ---------- */
  function mkFoe(spec, i) {
    var base = typeof spec === "string" ? { base: spec } : spec;
    var sp = DW.bestiary.SPECIES[base.base];
    var f = JSON.parse(JSON.stringify(sp.foe));
    f.id = i; f.key = base.base;
    if (base.n) f.n = base.n;
    ["zyw", "atk", "obr", "wyp", "ini"].forEach(function (k) { if (base[k] !== undefined) f[k] = base[k]; });
    if (base.zywMod) f.zyw += base.zywMod; if (base.atkMod) f.atk += base.atkMod;
    f.max = f.zyw; f.dmg = 0; f.down = false;
    return f;
  }
  function startFight(s, spec) {
    var f = { spec: spec, round: 0, aim: 0, over: false, won: false, dead: false, fled: false, log: [], lostAction: false, defense: false,
      foes: spec.foes.map(mkFoe), surprise: spec.surprise || 0, reload: false };
    if (spec.nightFull && isFull(s.day)) f.foes.forEach(function (x) { x.atk += 1; x.zyw += 4; x.max += 4; });
    return f;
  }
  function pick1(a) { return a[Math.floor(Math.random() * a.length)]; }
  function liveFoes(f) { return f.foes.filter(function (e) { return !e.down; }); }
  var LOCS = [null, "głowa", "tułów", "tułów", "tułów", "tułów", "tułów", "ręka", "noga", "noga", "noga"];
  function locMul(loc, foe) { return loc === "głowa" ? (foe && foe.nieumarly ? 1 : 1.5) : (loc === "tułów" ? 1 : 0.75); }

  function fightRound(s, f, action) {
    if (f.over) return f;
    f.round++;
    var L = [], spec = f.spec, w = weapon(s), live;
    var pInit = s.pc.at["BŁ"] + d(10) + inicjatywaMod(s);
    var order = [];
    var surprise = f.surprise > 0;
    if (surprise) { f.surprise--; L.push("Zaskoczenie: " + (f.surprise + 1 > 1 ? "masz jeszcze " + f.surprise + " darmowe ataki." : "to Twój darmowy atak.")); order = [{ who: "p", init: 99 }]; }
    else { order.push({ who: "p", init: pInit }); liveFoes(f).forEach(function (e) { order.push({ who: e, init: e.ini + d(10) }); }); order.sort(function (a, b) { return b.init - a.init; }); }
    f.defense = (action === "unik");
    for (var i = 0; i < order.length && !f.over; i++) {
      var o = order[i];
      if (o.who === "p") {
        if (f.lostAction) { f.lostAction = false; L.push("Tracisz tę akcję, bo ciemnieje Ci przed oczami."); continue; }
        if (action === "ostroznie") { f.aim = Math.min(3, f.aim + 2); L.push("Czekasz na okazję i mierzysz (+" + f.aim + ")."); continue; }
        if (action === "unik") { L.push("Odskakujesz i kryjesz się za własną gardą (+3 do Obrony)."); continue; }
        if (action === "ladowanie") {
          var need = 2 - s.pistol, can = Math.min(need, qty(s, "kolek"));
          if (can <= 0) { L.push("Nie masz czym ładować."); continue; }
          removeItem(s, "kolek", can); s.pistol += can; L.push("Przeładowujesz pistolety (" + s.pistol + "/2)."); continue;
        }
        if (action === "ucieczka") {
          var fl = k10x(), ft = fl.total + s.pc.at.SZ + (s.pc.sk["Przetrwanie"] || 0) + kary(s).total;
          if (spec.noFlee) { L.push("Nie ma dokąd uciekać."); continue; }
          if (!fl.fumble && ft >= 14) { f.over = true; f.fled = true; L.push("Uciekasz: " + ft + " przeciw 14."); break; }
          L.push("Próba ucieczki: " + ft + " przeciw 14. Nie udaje się."); continue;
        }
        var tgt = liveFoes(f)[0]; if (!tgt) break;
        var ranged = (action === "pistolet");
        if (ranged) {
          if (s.pistol <= 0) { L.push("Pistolety są puste."); continue; }
          s.pistol--;
        }
        var r = k10x();
        var atkSk = ranged ? "Strzelanie" : "Walka";
        var tot = r.total + attrVal(s.pc, ranged ? "ZR" : "WALKA") + (s.pc.sk[atkSk] || 0) + (ranged ? 0 : w.mod) + f.aim + (s.flags.atak_bonus || 0) + kary(s).total + (surprise ? 2 : 0);
        var st = 6 + tgt.obr;
        if (r.fumble) { L.push("Podwójna jedynka: tracisz równowagę, a " + tgt.n + " to widzi."); f.defense = false; f.aim = 0; continue; }
        var hit = r.crit || tot >= st;
        if (!hit) { L.push((ranged ? "Strzał" : "Cios") + " w " + tgt.n + ": " + tot + " przeciw " + st + ". Pudło."); f.aim = 0; continue; }
        var raw = ranged ? dice(2, 6, 2).total : dice(w.dice[0], w.dice[1], w.dice[2]).total + Math.floor(s.pc.at.SF / 2);
        var loc = LOCS[d(10)], mul = locMul(loc, tgt);
        if (r.crit) mul *= 1.5;
        var dm = Math.max(0, Math.round(raw * mul) - tgt.wyp + (ranged ? 1 : 0));
        if (raw * mul > tgt.wyp && dm < 1) dm = 1;
        tgt.dmg += dm;
        L.push((ranged ? "Strzał" : "Cios") + " w " + tgt.n + ": " + tot + " przeciw " + st + ", trafienie w " + loc + ": " + dm + " obrażeń" + (r.crit ? " (krytyk)" : "") + ".");
        if (tgt.dmg >= tgt.zyw) {
          tgt.down = true;
          L.push(tgt.nieumarly ? tgt.n + " osuwa się na ziemię. Nie rusza się. Ale to jeszcze nie koniec." : tgt.n + " pada.");
          if (tgt.nieumarly) s.flags["pokonany_" + tgt.key] = true;
        }
        f.aim = 0;
      } else {
        var e = o.who; if (e.down) continue;
        var er = k10x();
        var def = 6 + attrVal(s.pc, "OBRONA") + Math.floor((s.pc.sk["Unik"] || 0) / 2) + (f.defense ? 3 : 0) + (spec.cover || 0) + (s.flags.obrona_bonus || 0);
        var et = er.total + e.atk;
        if (er.fumble || !(er.crit || et >= def)) { L.push((e.fl ? pick1(e.fl.miss) + " (" + et + " przeciw " + def + ")" : e.n + " atakuje: " + et + " przeciw " + def + ". Chybia.")); continue; }
        var eloc = LOCS[d(10)];
        var eraw = dice(e.dice[0], e.dice[1], e.dice[2]).total;
        var edm = Math.round(eraw * locMul(eloc, null)) - armorWyp(s, eloc);
        if (er.crit) edm = Math.round(edm * 1.5);
        if (edm <= 0) { L.push(e.fl ? pick1(e.fl.armor) : e.n + " trafia w " + eloc + ": " + eraw + ", ale pancerz zatrzymuje cios."); continue; }
        s.zyw -= edm;
        var extra = "";
        if (e.zimny) { s.zimno = Math.min(6, s.zimno + 1); extra = " Zimno przenika Cię do kości (Zimno " + s.zimno + ")."; }
        L.push((e.fl ? pick1(e.fl.hit) + " (" + edm + " obrażeń, " + eloc + "). Zostaje Ci " : e.n + " trafia w " + eloc + ": " + edm + " obrażeń. Zostaje Ci ") + Math.max(0, s.zyw) + "/" + s.zywMax + "." + extra);
        /* test przytomności po ciężkim ciosie */
        if (edm >= 8 && s.zyw > 0) { var sr = d(10); if (sr > s.pc.at.WT) { f.lostAction = true; L.push("Test przytomności: " + sr + " przeciw " + s.pc.at.WT + ". Tracisz następną akcję."); } }
        if (s.zyw <= 0) {
          var cud = d(10), need2 = s.pc.at.WT - s.cuda * 3;
          if (cud <= need2) { s.zyw = 1; s.cuda++; L.push("Rzut na zachowanie życia: " + cud + " przeciw " + need2 + ". Wciąż żyjesz, ledwo."); }
          else { f.over = true; f.dead = true; L.push("Rzut na zachowanie życia: " + cud + " przeciw " + need2 + ". Ciemność."); }
        }
      }
      if (!liveFoes(f).length) { f.over = true; f.won = true; L.push("Koniec walki."); }
    }
    f.log = L.concat(f.log);
    f.last = L;
    return f;
  }

  /* ---------- gra: przebieg paragrafów ---------- */
  var BOOKS = {};
  function registerBook(b) { BOOKS[b.id] = b; }
  function SC(s) { return BOOKS[s.book].SC; }
  function snapshot(s) { var c = JSON.parse(JSON.stringify(s)); c.hist = null; c.chips = []; c.tr = null; c.pending = null; return c; }

  function mkE(s) {
    var E = {
      chip: function (t, cls) { s.chips.push({ t: t, cls: cls || "" }); },
      czas: function (n) { czas(s, n, E); },
      nocleg: function (mode) { nocleg(s, mode, E); },
      dodaj: function (id, n) { addItem(s, id, n || 1); E.chip("+ " + item(id).n + (n > 1 ? " ×" + n : ""), "pos"); },
      zabierz: function (id, n) { if (removeItem(s, id, n || 1)) E.chip("- " + item(id).n + (n > 1 ? " ×" + n : ""), "neg"); },
      kasa: function (bl) { s.money = Math.max(0, s.money + bl); E.chip((bl >= 0 ? "+ " : "- ") + IT.fmtMoney(Math.abs(bl)), bl >= 0 ? "pos" : "neg"); },
      flaga: function (k, v) { s.flags[k] = v === undefined ? true : v; },
      licz: function (k, dd) { s.flags[k] = (s.flags[k] || 0) + dd; return s.flags[k]; },
      fakt: function (id) { if (!s.dz[id]) { s.dz[id] = true; E.chip("Dziennik: " + factText(id), "akta"); } },
      rep: function (k, dd) { s.rep[k] = Math.max(-5, Math.min(5, s.rep[k] + dd)); var n = { lud: "Lud", wladza: "Władza", wiedzmy: "Wiedźmy", dhampiry: "Dhampiry" }[k]; E.chip(n + " " + (dd > 0 ? "+" : "") + dd, dd > 0 ? "pos" : "neg"); },
      czl: function (dd, why) { var b = s.czl; s.czl = Math.max(0, Math.min(100, s.czl + dd)); if (s.czl !== b) E.chip("Człowieczeństwo " + (dd > 0 ? "+" : "") + (s.czl - b) + (why ? " (" + why + ")" : ""), dd > 0 ? "pos" : "neg"); },
      zyw: function (dd) { s.zyw = Math.max(0, Math.min(s.zywMax, s.zyw + dd)); E.chip("Żywotność " + (dd > 0 ? "+" : "") + dd, dd > 0 ? "pos" : "neg"); },
      szczescie: function (dd) { s.sz = Math.max(0, Math.min(s.szMax + 3, s.sz + dd)); E.chip("Szczęście " + (dd > 0 ? "+" : "") + dd, dd > 0 ? "pos" : "neg"); },
      zimno: function (dd) { s.zimno = Math.max(0, Math.min(6, s.zimno + dd)); E.chip("Zimno " + (dd > 0 ? "+" : "") + dd, dd > 0 ? "neg" : "pos"); },
      glod: function (dd) { s.glod = Math.max(0, Math.min(6, s.glod + dd)); E.chip("Głód " + (dd > 0 ? "+" : "") + dd, dd > 0 ? "neg" : "pos"); },
      poszukiwany: function (dd) { s.poszuk = Math.max(0, Math.min(5, s.poszuk + dd)); E.chip("Poszukiwany " + (dd > 0 ? "+" : "") + dd, dd > 0 ? "neg" : "pos"); },
      legenda: function (dd) { s.leg += dd; E.chip("Legenda +" + dd, "note"); },
      notatka: function (t) { s.log.push({ day: s.day, t: t }); },
      pokonany: function (k) { return !!s.flags["pokonany_" + k]; }
    };
    return E;
  }
  function factText(id) {
    var B = DW.bestiary, k, i, sp;
    for (k in B.SPECIES) { sp = B.SPECIES[k]; for (i = 0; i < sp.facts.length; i++) if (sp.facts[i].id === id) return sp.facts[i].t; }
    for (i = 0; i < B.GENERAL.length; i++) if (B.GENERAL[i].id === id) return B.GENERAL[i].t;
    return id;
  }

  function go(s, n, keepHist) {
    if (!keepHist) { s.hist = s.hist || []; s.hist.push(snapshot(s)); if (s.hist.length > 40) s.hist.shift(); }
    s.cur = n; s.chips = []; s.tr = null; s.pending = null; s.afterShown = false;
    s.visited[n] = (s.visited[n] || 0) + 1;
    var p = SC(s)[n]; var E = mkE(s);
    if (p.on) p.on(s, E);
    if (p.end) s.end = p.end;
    if (p.test) s.pending = { type: "test", spec: typeof p.test === "function" ? p.test(s) : p.test, from: "entry" };
    else if (p.fight) s.pending = { type: "fight", spec: p.fight, f: startFight(s, p.fight), from: "entry" };
    checkGlobal(s);
    return s;
  }
  function checkGlobal(s) {
    if (s.end) return;
    var B = BOOKS[s.book];
    if (s.zyw <= 0 || s.dead) { s.dead = false; if (B.deathPara) go(s, B.deathPara, true); return; }
    if (s.czl <= 0 && B.monsterPara) go(s, B.monsterPara, true);
  }
  function begin(pc, bookId, seed) {
    var s = startState(pc, bookId); var B = BOOKS[bookId];
    if (seed != null) s.seed = seed;
    giveStartGear(s);
    if (B.startHook) B.startHook(s);
    return go(s, B.start || 1, true);
  }
  /* po wczytaniu zapisu: odtwórz test/walkę wejściową, jeśli akapit jeszcze nie został rozstrzygnięty */
  function resume(s) {
    s.chips = s.chips || []; s.hist = s.hist || [];
    if (s.end || s.pending || s.afterShown || s.tr) return s;
    var p = SC(s)[s.cur];
    if (p.test) s.pending = { type: "test", spec: typeof p.test === "function" ? p.test(s) : p.test, from: "entry" };
    else if (p.fight) s.pending = { type: "fight", spec: p.fight, f: startFight(s, p.fight), from: "entry" };
    return s;
  }
  function undo(s) { if (!s.hist || !s.hist.length) return s; var h = s.hist, prev = h.pop(); prev.hist = h; return prev; }

  function textOf(b, s) {
    if (typeof b === "string") return b;
    if (b && b.c) return b.c(s) ? b.x : null;
    if (b && b.t) return s.tr === b.t ? b.x : null;
    return null;
  }
  function gtext(s, str) {
    var k = s.pc && s.pc.plec === "k";
    return str.replace(/\{([^{}|]*)\|([^{}]*)\}/g, function (_, m, f) { return k ? f : m; })
      .replace(/\{IMIE\}/g, s.pc.name)
      .replace(/\{ZAPLATA\}/g, String((s.flags && s.flags.zaplata) || 0));
  }
  function blocks(s) {
    var p = SC(s)[s.cur], out = [];
    (p.intro || []).forEach(function (b) { var t = textOf(b, s); if (t !== null) out.push({ k: "intro", t: gtext(s, t) }); });
    var gate = !!p.test && !s.tr, cut = false;
    (p.x || []).forEach(function (b) {
      if (gate && b && b.t) cut = true;
      if (cut) return;
      var t = textOf(b, s);
      if (t !== null) out.push({ k: t.indexOf("- ") === 0 ? "d" : "p", t: gtext(s, t) });
    });
    if (p.after && s.afterShown) p.after.forEach(function (b) { var t = textOf(b, s); if (t !== null) out.push({ k: t.indexOf("- ") === 0 ? "d" : "p", t: gtext(s, t) }); });
    return out;
  }
  function choices(s) {
    var p = SC(s)[s.cur];
    return (p.ch || []).map(function (c, i) {
      if (c.vis && !c.vis(s)) return null;
      var ok = !c.c || c.c(s);
      return { i: i, l: gtext(s, typeof c.l === "function" ? c.l(s) : c.l), to: c.to, ok: ok, why: ok ? "" : (c.why || ""), test: !!c.test, fight: !!c.fight, hint: c.hint || "" };
    }).filter(Boolean);
  }
  function pick(s, i) {
    var p = SC(s)[s.cur], c = p.ch[i];
    if (!c || (c.vis && !c.vis(s)) || (c.c && !c.c(s)) || s.pending || s.end) return s;
    if (c.test) { s.pending = { type: "test", spec: typeof c.test === "function" ? c.test(s) : c.test, from: "choice", ci: i }; return s; }
    if (c.fight) { s.pending = { type: "fight", spec: c.fight, f: startFight(s, c.fight), from: "choice", ci: i }; return s; }
    return follow(s, c);
  }
  function follow(s, c, to) {
    var hist = snapshot(s), keep = s.hist || [];
    s.chips = []; var E = mkE(s);
    if (c.fx) c.fx(s, E);
    var carry = s.chips.slice();
    keep.push(hist); if (keep.length > 40) keep.shift(); s.hist = keep;
    go(s, to === undefined ? c.to : to, true);
    s.chips = carry.concat(s.chips);
    return s;
  }
  function resolveTest(s, res) {
    var pd = s.pending; if (!pd || pd.type !== "test") return s;
    var E = mkE(s), spec = pd.spec;
    if (res.ok && spec.ok) spec.ok(s, E);
    if (!res.ok && spec.no) spec.no(s, E);
    s.lastTest = { ok: res.ok, total: res.total, st: res.tb.st, label: spec.label };
    if (pd.from === "entry") { s.tr = res.ok ? "ok" : "no"; s.pending = null; s.afterShown = true; checkGlobal(s); return s; }
    var c = SC(s)[s.cur].ch[pd.ci];
    /* test z wyboru może kierować osobno przy sukcesie i porażce */
    if (c.toOk !== undefined || c.toNo !== undefined) { s.pending = null; return follow(s, c, res.ok ? (c.toOk !== undefined ? c.toOk : c.to) : (c.toNo !== undefined ? c.toNo : c.to)); }
    s.pending = { type: "next", ci: pd.ci }; s.afterShown = true;
    return s;
  }
  function resolveFight(s) {
    var pd = s.pending; if (!pd || pd.type !== "fight" || !pd.f.over) return s;
    if (pd.f.dead) { s.pending = null; s.dead = true; checkGlobal(s); return s; }
    if (pd.f.fled && pd.spec.flee) { s.pending = null; return follow(s, { to: pd.spec.flee }); }
    var E = mkE(s);
    if (pd.f.won && pd.spec.ok) pd.spec.ok(s, E);
    if (pd.from === "entry") { s.pending = null; s.afterShown = true; checkGlobal(s); return s; }
    s.pending = { type: "next", ci: pd.ci }; s.afterShown = true;
    return s;
  }
  function next(s) {
    var pd = s.pending; if (!pd || pd.type !== "next") return s;
    s.pending = null; return follow(s, SC(s)[s.cur].ch[pd.ci]);
  }

  /* ---------- zapis i kod przeniesienia ---------- */
  var CARRY_KEYS = ["pc", "zywMax", "szMax", "czl", "money", "inv", "eq", "dz", "rep", "poszuk", "leg", "cuda", "pistol"];
  function carryOf(s) {
    var o = {}; CARRY_KEYS.forEach(function (k) { o[k] = s[k]; });
    o.zyw = s.zywMax; o.v = 1;
    return o;
  }
  function checksum(str) { var h = 5381, i; for (i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0; return h.toString(36); }
  function b64e(str) { return (typeof btoa === "function" ? btoa(unescape(encodeURIComponent(str))) : Buffer.from(str, "utf8").toString("base64")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function b64d(str) { str = str.replace(/-/g, "+").replace(/_/g, "/"); while (str.length % 4) str += "="; return typeof atob === "function" ? decodeURIComponent(escape(atob(str))) : Buffer.from(str, "base64").toString("utf8"); }
  function carryCode(s) { var j = JSON.stringify(carryOf(s)); return "DW1." + checksum(j) + "." + b64e(j); }
  function fromCarryCode(code) {
    try {
      var parts = String(code).trim().split("."); if (parts[0] !== "DW1" || parts.length !== 3) return null;
      var j = b64d(parts[2]); if (checksum(j) !== parts[1]) return null;
      return JSON.parse(j);
    } catch (e) { return null; }
  }
  function continueFrom(carry, bookId) {
    var s = freshState(); s.book = bookId;
    CARRY_KEYS.forEach(function (k) { s[k] = JSON.parse(JSON.stringify(carry[k])); });
    s.zyw = s.zywMax; s.sz = s.szMax; s.glod = 0; s.zimno = 0;
    return s;
  }

  DW.engine = {
    mkRng: mkRng, setRng: setRng, d: d, dice: dice, k10x: k10x,
    ATTRS: ATTRS, ATTR_NAMES: ATTR_NAMES, SKILLS: SKILLS, SKILL_ATTR: SKILL_ATTR, KLASY: KLASY, PORY: PORY,
    attrVal: attrVal, zywMaxOf: zywMaxOf, moonPhase: moonPhase, isFull: isFull, pogoda: pogoda,
    freshState: freshState, startState: startState, giveStartGear: giveStartGear,
    item: item, has: has, qty: qty, addItem: addItem, removeItem: removeItem, equip: equip, weight: weight, capacity: capacity, overload: overload,
    cieplo: cieplo, weapon: weapon, armorWyp: armorWyp, inicjatywaMod: inicjatywaMod, buy: buy, sell: sell, useItem: useItem,
    kary: kary, testBase: testBase, rollTest: rollTest, calcTest: calcTest, luckAdd: luckAdd, luckReroll: luckReroll,
    czas: czas, nocleg: nocleg, startFight: startFight, fightRound: fightRound, liveFoes: liveFoes,
    registerBook: registerBook, begin: begin, resume: resume, BOOKS: BOOKS, mkE: mkE, go: go, undo: undo, blocks: blocks, choices: choices, pick: pick, follow: follow,
    resolveTest: resolveTest, resolveFight: resolveFight, next: next, gtext: gtext, factText: factText,
    carryCode: carryCode, fromCarryCode: fromCarryCode, continueFrom: continueFrom, snapshot: snapshot
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
