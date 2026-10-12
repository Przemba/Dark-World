/* Symulacja: balans walk z Draugrem i losowe przejścia po Tomie I (szukanie ślepych uliczek). */
require("../js/items.js"); require("../js/bestiary.js"); require("../js/engine.js"); require("../books/tom1.js");
const EN = DW.engine;
function mkPc(k) { const K = EN.KLASY[k]; return { name: "Test", plec: "m", klasa: k, at: Object.assign({}, K.at), sk: Object.assign({}, K.sk), perks: {} }; }

/* A. walka z Draugrem: czysto, rozne przygotowania */
function duel(klasa, prep) {
  const s = EN.begin(mkPc(klasa), "tom1");
  s.inv = Object.assign({}, s.inv);
  if (prep.armor) { EN.addItem(s, "p_cwiek", 1); EN.equip(s, "p_cwiek", true); }
  if (prep.bandage) { EN.addItem(s, "bandaz", 2); }
  s.day = 20; // nie pelnia? sprawdzane niżej
  const spec = { foes: [{ base: "draugr" }], nightFull: !!prep.full, surprise: prep.surprise || 0 };
  const f = EN.startFight(s, spec);
  let guard = 0;
  while (!f.over && guard++ < 60) {
    let a = "atak";
    if (s.pistol > 0 && f.round < 2) a = "pistolet";
    else if (s.pistol === 0 && f.round === 2 && prep.reload) a = "ladowanie";
    if (s.zyw < s.zywMax * 0.3 && EN.qty(s, "bandaz")) { EN.useItem(s, "bandaz"); }
    EN.fightRound(s, f, a);
  }
  return f.won;
}
function rate(klasa, prep, n) { let w = 0; for (let i = 0; i < n; i++) if (duel(klasa, prep)) w++; return Math.round(100 * w / n); }
const N = 600;
for (const k of Object.keys(EN.KLASY)) {
  console.log(k.padEnd(10), "gola:", rate(k, {}, N) + "%", "| zbroja+pistolet:", rate(k, { armor: 1 }, N) + "%", "| za dnia(zaskoczenie 2):", rate(k, { armor: 1, surprise: 2 }, N) + "%");
}

/* B. losowy bot po scenariuszu */
function bot(seedIdx) {
  const s = EN.begin(mkPc(["wojownik", "tropiciel", "zlodziej", "uczony"][seedIdx % 4]), "tom1");
  const seen = new Set(); let steps = 0;
  while (!s.end && steps++ < 600) {
    seen.add(s.cur);
    if (s.pending) {
      const pd = s.pending;
      if (pd.type === "test") { const r = EN.rollTest(s, pd.spec, 0); EN.resolveTest(s, r); }
      else if (pd.type === "fight") {
        let g = 0; while (!pd.f.over && g++ < 60) { EN.fightRound(s, pd.f, s.pistol > 0 ? "pistolet" : "atak"); }
        EN.resolveFight(s);
      } else if (pd.type === "next") EN.next(s);
      continue;
    }
    const ch = EN.choices(s).filter(c => c.ok);
    if (!ch.length) return { dead: true, cur: s.cur, seen };
    // preferuj nieodwiedzone cele
    ch.sort((a, b) => ((s.visited[a.to] || 0) - (s.visited[b.to] || 0)) + (Math.random() - .5));
    EN.pick(s, ch[0].i);
  }
  return { end: s.end, steps, seen, cur: s.cur };
}
const ends = {}, stuck = {}, all = new Set();
for (let i = 0; i < 400; i++) {
  let r; try { r = bot(i); } catch (e) { console.log("WYJĄTEK", e.stack.split("\n").slice(0, 4).join("\n")); break; }
  if (r.dead) stuck[r.cur] = (stuck[r.cur] || 0) + 1; else ends[r.end || "ZAPĘTLENIE@" + r.cur] = (ends[r.end || "ZAPĘTLENIE@" + r.cur] || 0) + 1;
  r.seen.forEach(x => all.add(x));
}
console.log("Zakończenia:", ends, "\nSlepe uliczki:", stuck);
const defined = Object.keys(EN.BOOKS.tom1.SC).map(Number);
console.log("Nieodwiedzone paragrafy:", defined.filter(x => !all.has(x)).join(", "));
