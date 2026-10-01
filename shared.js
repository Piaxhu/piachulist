const DIFFS = {
  extreme:["Extreme Demon","#ef4444","extreme_d.png"], insane:["Insane Demon","#f472b6","insane_d.png"],
  hard:["Hard Demon","#fb923c","hard_d.png"], medium:["Medium Demon","#facc15","medium_d.png"],
  easy:["Easy Demon","#4ade80","easy_d.png"], unrated:["Unrated","#94a3b8","unrated.png"]
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const slugify = s => s.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "level";

// Opis jednego wpisu historii. forLevel=true -> bez nazwy poziomu (widok karty)
function describe(e, forLevel) {
  const nm = forLevel ? "" : `<b>${esc(e.name)}</b> `, by = e.byName ? `<b>${esc(e.byName)}</b>` : "";
  if (e.type === "add") return `${nm}dodany na <b>#${e.to}</b>`;
  if (e.type === "remove") return `${nm}usunięty z <b>#${e.from}</b>`;
  const down = e.to > e.from, arrow = `${down ? "▼" : "▲"} #${e.from} → #${e.to}`;
  if (!e.by) return `${nm}przesunięty ${arrow}`;
  if (down) return `${nm}${arrow} · zepchnięty przez ${by}${e.cause === "add" ? " (nowy poziom)" : ""}`;
  return `${nm}${arrow} · awans, ${e.cause === "remove" ? `usunięto ${by}` : `${by} przesunięty niżej`}`;
}

// Czysta logika zmian: zwraca {levels, entries} (nie modyfikuje wejścia)
function applyChange(levels, kind, p, date) {
  const old = new Map(levels.map((l, i) => [l.id, i + 1])), n = levels.length;
  let list = levels.slice(), main, cause = kind;
  if (kind === "add") {
    let id = slugify(p.name); if (old.has(id)) id = slugify(p.name + " " + p.creator);
    for (let k = 2; old.has(id); k++) id = id.replace(/-\d+$/, "") + "-" + k;
    const lv = { id, name: p.name, creator: p.creator, diff: p.diff, thumb: p.thumb || "" };
    if (p.link) lv.link = p.link;
    list.splice(p.pos - 1, 0, lv);
    main = { date, type: "add", id, name: lv.name, to: p.pos };
  } else {
    const i = list.findIndex(l => l.id === p.id), [lv] = list.splice(i, 1);
    if (kind === "remove") main = { date, type: "remove", id: lv.id, name: lv.name, from: i + 1 };
    else { list.splice(p.pos - 1, 0, lv); main = { date, type: "move", id: lv.id, name: lv.name, from: i + 1, to: p.pos }; }
  }
  const entries = [main];
  list.forEach((l, i) => {
    const from = old.get(l.id);
    if (l.id !== main.id && from && from !== i + 1)
      entries.push({ date, type: "move", id: l.id, name: l.name, from, to: i + 1, by: main.id, byName: main.name, cause });
  });
  return { levels: list, entries };
}

function serialize(levels, changelog, progress) {
  const obj = (o, keys) => "{ " + keys.filter(k => o[k] !== undefined && o[k] !== "").map(k => `${k}:${JSON.stringify(o[k])}`).join(", ") + " }";
  const L = levels.map(l => "  " + obj(l, ["id","name","creator","diff","thumb","link","hardest"]) + ",").join("\n");
  const C = changelog.map(e => "  " + obj(e, ["date","type","id","name","from","to","by","byName","cause"]) + ",").join("\n");
  const P = progress.map(x => "  " + obj(x, ["name","creator","best","runs","est","thumb"]) + ",").join("\n");
  return `// ============================================================
//  PIACHULIST — dane poziomów (plik generowany przez admin.html)
//  Kolejność w tablicy = miejsce na liście; numery liczą się same.
//  id: unikalny, nie zmieniaj go po dodaniu (po nim liczy się historia)
//  diff: easy | medium | hard | insane | extreme | unrated
//  link (opcjonalne): link do Twojego przejścia; hardest:true (opcjonalne)
// ============================================================
const LEVELS = [\n${L}\n];

// Historia zmian — najnowsze na górze. Generuje ją admin.html
const CHANGELOG = [\n${C}\n];

// Progress — poziomy nad którymi teraz pracujesz
const PROGRESS = [\n${P}\n];\n`;
}
// Tło: ikony z Twojego icon setu (gamemode'y GD) dryfujące w górę.
// Dodasz nową ikonę: wrzuć PNG do bgicons/ i dopisz jej nazwę (bez .png) poniżej.
const BG_ICONS = ["ball", "cube", "robot", "ship", "spider", "swing", "ufo", "wave"];
function makeBg() {
  if (typeof document === "undefined" || document.querySelector(".shapes")) return;
  const box = document.createElement("div"); box.className = "shapes"; box.setAttribute("aria-hidden", "true");
  const n = innerWidth < 600 ? 7 : 13, r = Math.random; let last = -1;
  const place = (el, first) => {
    let k; do { k = Math.floor(r() * BG_ICONS.length); } while (k === last && BG_ICONS.length > 1); last = k;
    const depth = r(), sz = 26 + depth * 26, dur = 46 - depth * 22 + r() * 10;   // depth: 0 = daleko (mniejsze, rozmyte, wolne), 1 = bliżej
    el.src = `bgicons/${BG_ICONS[k]}.png`;
    el.style.cssText = `left:${(r() * 96).toFixed(1)}%;width:${sz.toFixed(0)}px;--o:${(.10 + depth * .13).toFixed(2)};--bl:${((1 - depth) * 1.6).toFixed(1)}px;--dx:${((r() - .5) * 180) | 0}px;--rot:${(r() < .5 ? -1 : 1) * ((120 + r() * 300) | 0)}deg;animation-duration:${dur.toFixed(1)}s` + (first ? `;animation-delay:-${(r() * dur).toFixed(1)}s` : "");
    if (!first) { el.style.animationName = "none"; void el.offsetWidth; el.style.animationName = ""; }
  };
  for (let i = 0; i < n; i++) {
    const el = document.createElement("img"); el.className = "bgi"; el.alt = ""; el.draggable = false; el.decoding = "async";
    el.onerror = () => el.remove(); el.addEventListener("animationiteration", () => place(el, false));   // po każdym przelocie: nowa ikona, miejsce i rozmiar
    place(el, true); box.appendChild(el);
  }
  document.body.prepend(box);
}
makeBg();
if (typeof module !== "undefined") module.exports = { applyChange, serialize, describe };
