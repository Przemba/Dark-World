/* DARK WORLD: interfejs (mobile-first). Cała logika jest w DW.engine. */
(function () {
  "use strict";
  var EN = DW.engine, IT = DW.items, B = DW.bestiary;
  var KEY = "dw_save_v1", app = document.getElementById("app");
  var wide = window.matchMedia ? window.matchMedia("(min-width: 1000px)") : { matches: false };
  var sideTab = "karta";
  var S = null, sheet = null, tab = null, testUi = null, create = null, toastT = null;

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function h(html) { app.innerHTML = html; }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function on(sel, fn) { var els = document.querySelectorAll(sel); for (var i = 0; i < els.length; i++) (function (el) { el.onclick = function (e) { e.preventDefault(); fn(el, e); }; })(els[i]); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function toast(t) { var d = document.createElement("div"); d.className = "toast"; d.textContent = t; document.body.appendChild(d); clearTimeout(toastT); toastT = setTimeout(function () { d.remove(); }, 1800); }

  /* ---------- zapis ---------- */
  function save() {
    if (!S) return;
    try {
      var c = JSON.parse(JSON.stringify(S, function (k, v) { return k === "pending" ? undefined : v; }));
      if (c.hist) c.hist = c.hist.slice(-12);
      lsSet(KEY, JSON.stringify(c));
    } catch (e) {}
  }
  function load() { var j = lsGet(KEY); if (!j) return null; try { return EN.resume(JSON.parse(j)); } catch (e) { return null; } }

  /* ---------- ekran tytułowy ---------- */
  function titleScreen() {
    sheet = null; var has = !!lsGet(KEY);
    h('<div class="title"><h1>Dark World</h1><p>Gra paragrafowa o łowcy wampirów.<br>Działa bez internetu.</p>' +
      '<div class="choices">' + (has ? '<button class="ch primary" id="cont">Kontynuuj</button>' : '') +
      '<button class="ch' + (has ? '' : ' primary') + '" id="new">Nowa gra: Tom I, Szarówka</button>' +
      '<button class="ch" id="code">Mam kod z poprzedniego tomu</button></div>' +
      '<p style="margin-top:30px;font-size:.75em">Wskazówka: w przeglądarce telefonu wybierz „Dodaj do ekranu głównego”, a gra będzie działać jak aplikacja.</p></div>');
    on("#cont", function () { S = load(); S ? render() : titleScreen(); });
    on("#new", function () { create = { name: "", plec: "m", klasa: "wojownik", carry: null }; creator(); });
    on("#code", codeScreen);
  }
  function codeScreen(msg) {
    h('<div class="title"><h2>Kod przeniesienia</h2><p>Wklej kod z końca poprzedniego tomu.</p><div style="text-align:left;padding:0 16px"><textarea id="ta" placeholder="DW1...."></textarea></div>' +
      (msg ? '<p class="no">' + esc(msg) + '</p>' : '') +
      '<div class="choices"><button class="ch primary" id="ok">Wczytaj</button><button class="ch" id="bk">Wróć</button></div></div>');
    on("#bk", titleScreen);
    on("#ok", function () {
      var c = EN.fromCarryCode($("#ta").value);
      if (!c) return codeScreen("Kod jest uszkodzony albo niepełny.");
      var ids = Object.keys(EN.BOOKS), last = ids[ids.length - 1];
      S = EN.continueFrom(c, last); S = EN.go(S, EN.BOOKS[last].start || 1, true); save(); render();
    });
  }

  /* ---------- kreator postaci ---------- */
  function creator() {
    var K = EN.KLASY, cs = create;
    h('<div class="text"><h2 style="color:var(--gold)">Twój Łowca</h2><p>Imię:</p><input id="nm" maxlength="24" value="' + esc(cs.name) + '" placeholder="Jak cię nazywają?">' +
      '<p>Płeć:</p><div class="row"><button class="btn ' + (cs.plec === "m" ? "" : "alt") + '" data-p="m">Mężczyzna</button><button class="btn ' + (cs.plec === "k" ? "" : "alt") + '" data-p="k">Kobieta</button></div>' +
      '<p>Dotychczasowa droga:</p><div class="cards">' + Object.keys(K).map(function (k) {
        var c = K[k]; return '<button class="card ' + (cs.klasa === k ? "sel" : "") + '" data-k="' + k + '"><b>' + c.n + '</b><br>' + esc(c.opis) + '<div class="parts">' +
          EN.ATTRS.map(function (a) { return a + " " + c.at[a]; }).join(" · ") + '</div></button>';
      }).join("") + '</div><div class="choices"><button class="ch primary" id="go">Zaczynam</button><button class="ch" id="bk">Wróć</button></div></div>');
    on("[data-p]", function (el) { cs.name = $("#nm").value; cs.plec = el.dataset.p; creator(); });
    on("[data-k]", function (el) { cs.name = $("#nm").value; cs.klasa = el.dataset.k; creator(); });
    on("#bk", titleScreen);
    on("#go", function () {
      var nm = $("#nm").value.trim() || (cs.plec === "k" ? "Wilga" : "Wilk"), k = K[cs.klasa];
      var pc = { name: nm, plec: cs.plec, klasa: cs.klasa, at: JSON.parse(JSON.stringify(k.at)), sk: JSON.parse(JSON.stringify(k.sk)), perks: {} };
      S = EN.begin(pc, "tom1"); save(); render();
    });
  }

  /* ---------- główny widok ---------- */
  function hud() {
    var s = S, p = SCp(), pct = Math.max(0, Math.round(100 * s.zyw / s.zywMax));
    var w = EN.pogoda(s), k = EN.kary(s);
    return '<div class="top"><div class="chap">' + esc((p.chap || [])[0] || "") + (p.chap && p.chap[1] ? " · " + esc(p.chap[1]) : "") + '</div><div class="ttl">' + esc(p.t || "") + '</div>' +
      '<div class="hud"><span>Życie <b>' + Math.max(0, s.zyw) + '/' + s.zywMax + '</b></span><span class="bar"><i style="width:' + pct + '%"></i></span>' +
      '<span>Szczęście <b>' + s.sz + '/' + s.szMax + '</b></span><span>Dzień <b>' + s.day + '</b> · ' + EN.PORY[s.pora] + '</span><span>' + w + ' · ' + EN.moonPhase(s.day) + '</span>' +
      '<span>Pieniądze <b>' + IT.fmtMoney(s.money) + '</b></span>' +
      (s.zimno ? '<span class="no">Zimno ' + s.zimno + '</span>' : '') + (s.glod ? '<span class="no">Głód ' + s.glod + '</span>' : '') +
      (k.total ? '<span class="no">Kara ' + k.total + '</span>' : '') + '</div></div>';
  }
  function SCp() { return EN.BOOKS[S.book].SC[S.cur]; }

  function render(keep) {
    if (!S) return titleScreen();
    var y0 = window.scrollY;
    save();
    var s = S, p = SCp(), html = hud(), bl = EN.blocks(s), num = 0;
    html += '<div class="text">' + bl.map(function (b) { return '<p class="' + (b.k === "intro" ? "intro" : b.k === "d" ? "d" : "") + '">' + esc(b.k === "d" ? b.t.replace(/^- /, "") : b.t) + '</p>'; }).join("") + '</div>';
    if (s.chips && s.chips.length) html += '<div class="chips">' + s.chips.map(function (c) { return '<span class="chip ' + c.cls + '">' + esc(c.t) + '</span>'; }).join("") + '</div>';
    if (s.pending) {
      if (s.pending.type === "test") html += testPanel();
      else if (s.pending.type === "fight") html += fightPanel();
      else if (s.pending.type === "next") html += '<div class="choices"><button class="ch primary" id="nx">Dalej</button></div>';
    } else if (s.end) {
      html += endBox();
    } else {
      if (p.shop) html += shopPanel(p.shop);
      html += '<div class="choices">' + EN.choices(s).map(function (c) {
        num++;
        return '<button class="ch ' + (c.ok ? "" : "off") + '" data-i="' + c.i + '">' + (wide.matches ? '<span class="kn">' + num + '</span>' : '') + esc(c.l) + (!c.ok && c.why ? '<small>' + esc(c.why) + '</small>' : '') + '</button>';
      }).join("") + '</div>';
    }
    if (wide.matches) {
      html = '<div class="dsk"><div class="mainc">' + html + '</div><aside class="side">' + sideHtml() + '</aside></div>';
      h(html); bindMain(); bindSide();
    } else {
      html += tabsBar();
      h(html);
      bindMain();
      if (sheet) openSheet(sheet);
    }
    window.scrollTo(0, keep ? y0 : 0);
  }
  function bindMain() {
    on("[data-i]", function (el) { if (el.classList.contains("off")) return; EN.pick(S, +el.dataset.i); testUi = null; render(); });
    on("#nx", function () { EN.next(S); render(); });
    on("[data-tab]", function (el) { openSheet(el.dataset.tab); });
    bindTest(); bindFight(); bindShop();
  }
  function sideBody(name) { return name === "karta" ? sCard() : name === "plecak" ? sBag() : name === "dziennik" ? sJournal() : sMenu(); }
  function sideHtml() {
    return '<div class="stabs">' + [["karta", "Postać"], ["plecak", "Plecak"], ["dziennik", "Dziennik"], ["menu", "Menu"]].map(function (x) {
      return '<button data-stab="' + x[0] + '" class="' + (sideTab === x[0] ? "on" : "") + '">' + x[1] + '</button>'; }).join("") + '</div><div class="sbody">' + sideBody(sideTab) + '</div>';
  }
  function bindSide() {
    var a = $(".side"); if (!a) return;
    on("[data-stab]", function (el) { sideTab = el.dataset.stab; var y = a.scrollTop; a.innerHTML = sideHtml(); bindSide(); a.scrollTop = y; });
    bindSheet(a);
  }
  function tabsBar() {
    return '<div class="tabs">' + [["karta", "Postać"], ["plecak", "Plecak"], ["dziennik", "Dziennik"], ["menu", "Menu"]].map(function (t) {
      return '<button data-tab="' + t[0] + '" class="' + (sheet === t[0] ? "on" : "") + '">' + t[1] + '</button>'; }).join("") + '</div>';
  }

  /* ---------- test ---------- */
  function testPanel() {
    var pd = S.pending, tb = EN.testBase(S, pd.spec);
    var t = testUi && testUi.pd === pd ? testUi : (testUi = { pd: pd, pre: 0, res: null });
    var out = '<div class="panel"><h3>' + esc(pd.spec.label || pd.spec.sk || "Test") + '</h3><div class="parts">' +
      tb.parts.map(function (x) { return esc(x[0]) + " " + (x[1] >= 0 ? "+" : "") + x[1]; }).join(" · ") + ' · rzut k10 przeciw <b>' + pd.spec.st + '</b></div>';
    if (!t.res) {
      out += '<div class="row"><span>Szczęście przed rzutem: <b>' + t.pre + '</b> / ' + S.sz + '</span><button class="btn alt sm" data-pre="-1">−</button><button class="btn alt sm" data-pre="1">+</button></div>' +
        '<div class="row" style="margin-top:10px"><button class="btn" id="roll">Rzucam</button></div>';
    } else {
      var r = t.res;
      out += '<div class="big ' + (r.ok ? "ok" : "no") + '">' + r.total + '</div><div class="parts">rzut ' + r.roll.rolls.join(" + ") + (r.roll.crit ? " (krytyk)" : "") + (r.roll.fumble ? " (pech)" : "") +
        ' = ' + r.roll.total + ' · baza ' + r.tb.base + (r.pre ? ' · Szczęście +' + r.pre : '') + (r.post ? ' · +' + r.post : '') + '</div><p class="' + (r.ok ? "ok" : "no") + '">' + (r.ok ? "Udało się." : "Nie udało się.") + '</p>' +
        '<div class="row">' + (!r.ok && S.sz >= 2 && !r.roll.fumble ? '<button class="btn alt sm" id="l1">+1 za 2 Szczęścia</button>' : '') +
        (!r.ok && S.sz >= 4 ? '<button class="btn alt sm" id="l2">Przerzut za 4</button>' : '') + '<button class="btn" id="tdone">Dalej</button></div>';
    }
    return out + '</div>';
  }
  function bindTest() {
    if (!S.pending || S.pending.type !== "test") return;
    var t = testUi;
    on("[data-pre]", function (el) { t.pre = Math.max(0, Math.min(S.sz, t.pre + (+el.dataset.pre))); render(true); });
    on("#roll", function () { t.res = EN.rollTest(S, S.pending.spec, t.pre); render(true); });
    on("#l1", function () { EN.luckAdd(S, t.res); render(true); });
    on("#l2", function () { EN.luckReroll(S, t.res); render(true); });
    on("#tdone", function () { var r = t.res; testUi = null; EN.resolveTest(S, r); render(true); });
  }

  /* ---------- walka ---------- */
  function fightPanel() {
    var f = S.pending.f, out = '<div class="panel"><h3>Walka</h3>';
    f.foes.forEach(function (e) {
      var pct = Math.max(0, Math.round(100 * (e.zyw - e.dmg) / e.zyw));
      out += '<div class="foe">' + esc(e.n) + (e.down ? ' (powalony)' : '') + '<div class="bar"><i style="width:' + pct + '%"></i></div></div>';
    });
    if (!f.over) {
      var w = EN.weapon(S);
      out += '<div class="parts">Broń: ' + esc(w.n) + ' · Pistolety: ' + S.pistol + '/2 · Kołki: ' + EN.qty(S, "kolek") + (f.aim ? ' · Celowanie +' + f.aim : '') + '</div><div class="row">' +
        '<button class="btn" data-a="atak">Atak</button>' +
        '<button class="btn" data-a="pistolet"' + (S.pistol <= 0 ? " disabled" : "") + '>Strzał</button>' +
        '<button class="btn alt" data-a="ladowanie"' + (S.pistol >= 2 || !EN.qty(S, "kolek") ? " disabled" : "") + '>Ładuj</button>' +
        '<button class="btn alt" data-a="ostroznie">Mierz</button><button class="btn alt" data-a="unik">Unik</button>' +
        (f.spec.noFlee ? '' : '<button class="btn alt" data-a="ucieczka">Uciekaj</button>') + '</div>';
    } else {
      out += '<p class="' + (f.won ? "ok" : "no") + '">' + (f.won ? "Wygrywasz." : f.fled ? "Uciekasz." : "Przegrywasz.") + '</p><button class="btn" id="fdone">Dalej</button>';
    }
    if (f.last) out += '<div class="log">' + f.last.map(function (l) { return '<div>' + esc(l) + '</div>'; }).join("") + '</div>';
    return out + '</div>';
  }
  function bindFight() {
    if (!S.pending || S.pending.type !== "fight") return;
    on("[data-a]", function (el) { EN.fightRound(S, S.pending.f, el.dataset.a); render(true); });
    on("#fdone", function () { EN.resolveFight(S); render(true); });
  }

  /* ---------- sklep ---------- */
  function shopPanel(sh) {
    var out = '<div class="panel"><h3>' + esc(sh.title || "Handel") + '</h3>';
    sh.stock.forEach(function (st) {
      var it = EN.item(st.id), price = st.p !== undefined ? st.p : it.cena;
      out += '<div class="item"><div class="n">' + esc(it.n) + '<small>' + esc(it.d || "") + '</small></div><button class="btn sm" data-buy="' + st.id + '|' + price + '"' + (S.money < price ? " disabled" : "") + '>' + IT.fmtMoney(price) + '</button></div>';
    });
    if (sh.sell) {
      out += '<div class="sec">Sprzedaj</div>';
      Object.keys(S.inv).forEach(function (id) {
        var it = EN.item(id); if (!it || !it.cena || it.kat === "fabula") return;
        out += '<div class="item"><div class="n">' + esc(it.n) + ' ×' + S.inv[id] + '</div><button class="btn alt sm" data-sell="' + id + '">' + IT.fmtMoney(Math.floor(it.cena / 3)) + '</button></div>';
      });
    }
    return out + '</div>';
  }
  function bindShop() {
    on("[data-buy]", function (el) { var a = el.dataset.buy.split("|"); var r = EN.buy(S, a[0], +a[1]); toast(r.ok ? "Kupione" : r.why); render(true); });
    on("[data-sell]", function (el) { EN.sell(S, el.dataset.sell); render(true); });
  }

  /* ---------- zakończenie ---------- */
  function endBox() {
    var ok = S.end.indexOf("Koniec Tomu") === 0, code = ok ? EN.carryCode(S) : "";
    return '<div class="endbox"><h2>' + esc(S.end) + '</h2>' + (ok ?
      '<p>Twój kod przeniesienia do następnego tomu:</p><textarea readonly id="cc" onclick="this.select()">' + esc(code) + '</textarea><div class="row" style="justify-content:center;margin-top:8px"><button class="btn alt sm" id="cpy">Kopiuj</button></div>' :
      '<p>Możesz cofnąć ostatni ruch albo zacząć od nowa.</p>') +
      '<div class="choices"><button class="ch" id="und">Cofnij ostatni ruch</button><button class="ch" id="ttl">Ekran tytułowy</button></div></div>';
  }
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t.id === "cpy") { var ta = $("#cc"); ta.select(); try { navigator.clipboard.writeText(ta.value); toast("Skopiowano"); } catch (er) { document.execCommand("copy"); } }
    if (t.id === "und") { S = EN.undo(S); EN.resume(S); render(); }
    if (t.id === "ttl") { titleScreen(); }
  });

  /* ---------- panele pełnoekranowe ---------- */
  function openSheet(name) {
    sheet = name; var old = $(".sheet"); if (old) old.remove();
    var d = document.createElement("div"); d.className = "sheet";
    var body = name === "karta" ? sCard() : name === "plecak" ? sBag() : name === "dziennik" ? sJournal() : sMenu();
    d.innerHTML = '<div class="in"><button class="x" id="cl">✕</button>' + body + '</div>' + tabsBar();
    document.body.appendChild(d);
    d.querySelector("#cl").onclick = closeSheet;
    var tb = d.querySelectorAll("[data-tab]"); for (var i = 0; i < tb.length; i++) tb[i].onclick = function () { d.remove(); openSheet(this.dataset.tab); };
    bindSheet(d);
  }
  function closeSheet() { sheet = null; var o = $(".sheet"); if (o) o.remove(); var tb = document.querySelectorAll(".tabs button"); for (var i = 0; i < tb.length; i++) tb[i].classList.remove("on"); }
  function refreshSheet() {
    if (wide.matches) { var a = $(".side"), y0 = a ? a.scrollTop : 0; if (a) { a.innerHTML = sideHtml(); bindSide(); a.scrollTop = y0; } var top0 = $(".top"); if (top0) top0.outerHTML = hud(); save(); return; } var y = $(".sheet") ? $(".sheet").scrollTop : 0; var n = sheet; var o = $(".sheet"); if (o) o.remove(); openSheet(n); var s2 = $(".sheet"); if (s2) s2.scrollTop = y; if (!S.pending && !S.end) { /* odśwież HUD pod spodem */ var top = $(".top"); if (top) top.outerHTML = hud(); } save(); }

  function sCard() {
    var pc = S.pc, out = '<h2>' + esc(pc.name) + '</h2><div class="parts">' + esc(EN.KLASY[pc.klasa].n) + ' · ' + (pc.plec === "k" ? "kobieta" : "mężczyzna") + '</div><div class="sec">Cechy</div><table>' +
      EN.ATTRS.map(function (a) { return '<tr><td>' + EN.ATTR_NAMES[a] + '</td><td class="r">' + pc.at[a] + '</td></tr>'; }).join("") +
      '<tr><td>Walka</td><td class="r">' + EN.attrVal(pc, "WALKA") + '</td></tr><tr><td>Obrona</td><td class="r">' + EN.attrVal(pc, "OBRONA") + '</td></tr></table><div class="sec">Umiejętności</div><table>' +
      EN.SKILLS.map(function (k) { var v = pc.sk[k[0]] || 0; return '<tr><td>' + k[0] + '<small style="color:var(--dim)"> (' + EN.ATTR_NAMES[k[1]] + ')</small></td><td class="r">' + (v ? "+" + v : "–") + '</td></tr>'; }).join("") + '</table>' +
      '<div class="sec">Stan</div><table><tr><td>Życie</td><td class="r">' + S.zyw + ' / ' + S.zywMax + '</td></tr><tr><td>Szczęście</td><td class="r">' + S.sz + ' / ' + S.szMax + '</td></tr>' +
      '<tr><td>Człowieczeństwo</td><td class="r">' + S.czl + ' / 100</td></tr><tr><td>Zimno</td><td class="r">' + S.zimno + '</td></tr><tr><td>Głód</td><td class="r">' + S.glod + '</td></tr>' +
      '<tr><td>Legenda</td><td class="r">' + S.leg + '</td></tr><tr><td>Poszukiwany</td><td class="r">' + S.poszuk + ' / 5</td></tr></table><div class="sec">Reputacja</div><table>' +
      [["lud", "Lud"], ["wladza", "Władza"], ["wiedzmy", "Wiedźmy"], ["dhampiry", "Dhampiry"]].map(function (r) { return '<tr><td>' + r[1] + '</td><td class="r">' + (S.rep[r[0]] > 0 ? "+" : "") + S.rep[r[0]] + '</td></tr>'; }).join("") + '</table>';
    return out;
  }
  function sBag() {
    var out = '<h2>Plecak</h2><div class="parts">Udźwig <b>' + EN.weight(S) + ' / ' + EN.capacity(S) + ' kg</b>' + (EN.overload(S) ? ' · <span class="no">przeciążenie</span>' : '') + ' · Ciepło ubrań: ' + EN.cieplo(S) + ' · Pieniądze: ' + IT.fmtMoney(S.money) + '</div>';
    var ids = Object.keys(S.inv);
    if (!ids.length) out += '<p>Pusto.</p>';
    ids.forEach(function (id) {
      var it = EN.item(id), eq = it.slot && S.eq[it.slot] === id;
      var extra = it.wyp ? " · Wyp " + it.wyp : it.dice ? " · " + it.dice[0] + "k" + it.dice[1] + (it.dice[2] ? "+" + it.dice[2] : "") : "";
      out += '<div class="item"><div class="n">' + esc(it.n) + (S.inv[id] > 1 ? ' ×' + S.inv[id] : '') + (eq ? ' <span class="eq">(założone)</span>' : '') +
        '<small>' + esc(it.d || "") + extra + ' · ' + it.waga + ' kg</small></div>' +
        (it.slot ? '<button class="btn alt sm" data-eq="' + id + '">' + (eq ? "Zdejmij" : "Załóż") + '</button>' : '') +
        (it.uzyj ? '<button class="btn alt sm" data-use="' + id + '">Użyj</button>' : '') + '</div>';
    });
    return out;
  }
  function sJournal() {
    var out = '<h2>Dziennik</h2>' + huntPrep() + '<div class="sec">Dziennik bestii</div>', any = false;
    Object.keys(B.SPECIES).forEach(function (k) {
      var sp = B.SPECIES[k], fs = sp.facts.filter(function (f) { return S.dz[f.id]; });
      if (!fs.length) return; any = true;
      out += '<h3 style="color:var(--gold)">' + sp.n + '</h3>' + fs.map(function (f) { return '<p class="d" style="border-left:2px solid var(--line);padding-left:.7em">' + esc(f.t) + '</p>'; }).join("");
    });
    var gen = B.GENERAL.filter(function (f) { return S.dz[f.id]; });
    if (gen.length) { any = true; out += '<h3 style="color:var(--gold)">Ogólne</h3>' + gen.map(function (f) { return '<p style="border-left:2px solid var(--line);padding-left:.7em">' + esc(f.t) + '</p>'; }).join(""); }
    if (!any) out += '<p>Jeszcze nic nie wiesz.</p>';
    out += '<div class="sec">Notatki</div>' + (S.log.length ? S.log.slice().reverse().map(function (l) { return '<p><span class="parts">dzień ' + l.day + '</span> ' + esc(l.t) + '</p>'; }).join("") : '<p>Brak.</p>');
    return out;
  }
  function huntPrep() {
    var k = S.flags && S.flags.rozp, sp = k && B.SPECIES[k];
    if (!sp) return '<div class="sec">Przygotowanie do polowania</div><p>Jeszcze nie wiesz, na co polujesz. Rozmawiaj z ludźmi, oglądaj ślady, a potem zbierz myśli.</p>';
    var known = sp.facts.filter(function (f) { return S.dz[f.id]; }).length, pr = sp.prep || {}, killKnown = pr.kill && S.dz[pr.kill];
    function row(ok, txt) { return '<tr><td>' + esc(txt) + '</td><td class="r ' + (ok ? "ok" : "no") + '">' + (ok ? "jest" : "brak") + '</td></tr>'; }
    function meets(alt) { return Object.keys(alt).every(function (id) { return EN.qty(S, id) >= alt[id]; }); }
    var out = '<div class="sec">Przygotowanie do polowania</div><p>Cel: <b>' + esc(sp.n) + '</b>. Wiesz o nim ' + known + ' z ' + sp.facts.length + ' rzeczy, które da się ustalić.</p><table>' +
      '<tr><td>Wiesz, jak go zabić</td><td class="r ' + (killKnown ? "ok" : "no") + '">' + (killKnown ? "tak" : "nie") + '</td></tr></table>';
    if (killKnown && pr.gear) out += '<div class="parts" style="margin-top:8px">Sprzęt do rytuału:</div><table>' + pr.gear.map(function (g) { return row(g.any.some(meets), g.t); }).join("") + '</table>';
    else out += '<p class="parts">Nie wiesz jeszcze, czego będziesz potrzebować po walce.</p>';
    out += '<div class="parts" style="margin-top:8px">Ogólna gotowość:</div><table>' +
      (S.dz.draugr_styl ? row(true, "Znasz jego styl walki") : "") + (S.flags.pole_wybrane ? row(true, "Wybrane miejsce pojedynku") : "") + (S.flags.tylna ? row(true, "Znasz tylne wejście do kurhanu") : "") +
      row(S.pistol >= 2, "Pistolety załadowane (" + S.pistol + "/2)") + row(EN.qty(S, "kolek") >= 2, "Zapasowe kołki") +
      row(!!S.eq.pancerz, "Pancerz na sobie") + row(EN.qty(S, "bandaz") >= 1, "Bandaże") + row(EN.qty(S, "racja") >= 1, "Jedzenie") +
      row(EN.cieplo(S) >= 6, "Ciepłe ubranie (ciepło " + EN.cieplo(S) + ")") + '</table>';
    return out;
  }
  function sMenu() {
    return '<h2>Menu</h2><div class="choices" style="padding:0"><button class="ch" id="m_undo">Cofnij ostatni ruch</button><button class="ch" id="m_save">Zapisz teraz</button>' +
      '<button class="ch" id="m_big">Większa czcionka</button><button class="ch" id="m_small">Mniejsza czcionka</button><button class="ch" id="m_title">Ekran tytułowy</button>' +
      '<button class="ch" id="m_reset">Usuń zapis i zacznij od nowa</button></div><p class="parts" style="margin-top:20px">Dark World · Tom I. Gra zapisuje się sama w tej przeglądarce.</p>';
  }
  function setFs(d) { var v = Math.max(14, Math.min(26, (+lsGet("dw_fs") || 18) + d)); lsSet("dw_fs", v); document.documentElement.style.setProperty("--fs", v + "px"); }
  function bindSheet(d) {
    function q(sel, fn) { var e = d.querySelector(sel); if (e) e.onclick = fn; }
    var eqs = d.querySelectorAll("[data-eq]"), i;
    for (i = 0; i < eqs.length; i++) eqs[i].onclick = function () { var id = this.dataset.eq, it = EN.item(id); EN.equip(S, id, S.eq[it.slot] !== id); refreshSheet(); };
    var us = d.querySelectorAll("[data-use]");
    for (i = 0; i < us.length; i++) us[i].onclick = function () { var r = EN.useItem(S, this.dataset.use); if (r) toast(r.t); refreshSheet(); };
    q("#m_undo", function () { S = EN.undo(S); EN.resume(S); sheet = null; render(); });
    q("#m_save", function () { save(); toast("Zapisano"); });
    q("#m_big", function () { setFs(2); });
    q("#m_small", function () { setFs(-2); });
    q("#m_title", function () { sheet = null; titleScreen(); });
    q("#m_reset", function () { if (confirm("Usunąć zapis?")) { try { localStorage.removeItem(KEY); } catch (e) {} S = null; sheet = null; titleScreen(); } });
  }

  /* ---------- skróty klawiszowe (desktop) ---------- */
  document.addEventListener("keydown", function (e) {
    if (!S || e.ctrlKey || e.metaKey || e.altKey) return;
    var tag = (e.target && e.target.tagName) || ""; if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key >= "1" && e.key <= "9") { var b = document.querySelectorAll(".choices .ch[data-i]")[+e.key - 1]; if (b) b.click(); return; }
    if (e.key === "Enter" || e.key === " ") {
      var go = $("#roll") || $("#tdone") || $("#nx") || $("#fdone"); if (go) { e.preventDefault(); go.click(); return; }
    }
    if (e.key === "a" || e.key === "A") { var at = $("[data-a=atak]"); if (at) at.click(); }
    if (e.key === "s" || e.key === "S") { var st = $("[data-a=pistolet]:not([disabled])"); if (st) st.click(); }
    if (e.key === "u" || e.key === "U") { var un = $("[data-a=unik]"); if (un) un.click(); }
  });
  if (wide.addEventListener) wide.addEventListener("change", function () { if (S) { sheet = null; var o = $(".sheet"); if (o) o.remove(); render(true); } });

  /* ---------- start ---------- */
  var fs = +lsGet("dw_fs"); if (fs) document.documentElement.style.setProperty("--fs", fs + "px");
  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) navigator.serviceWorker.register("sw.js").catch(function () {});
  window.DWUI = { get state() { return S; } };
  titleScreen();
})();
