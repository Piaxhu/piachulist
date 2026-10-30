const DIFFS = {
  extreme:["Extreme Demon","#ef4444","extreme_d.png"], insane:["Insane Demon","#f472b6","insane_d.png"],
  hard:["Hard Demon","#fb923c","hard_d.png"], medium:["Medium Demon","#facc15","medium_d.png"],
  easy:["Easy Demon","#4ade80","easy_d.png"], unrated:["Unrated","#94a3b8","unrated.png"]
};
// ====== JĘZYK (PL / EN): wybór zapisuje się w przeglądarce ======
const I18N = {
  pl: {
    nav_list: "Lista", nav_progress: "Postępy", nav_changelog: "Changelog",
    title_list: "Piachulist — Lista", title_progress: "Piachulist — Postępy", title_changelog: "Piachulist — Changelog",
    home_h1: "Lista najcięższych poziomów <span>ukończonych przez p1achu</span>",
    home_sub: "Ranking demonów, które pokonałem — od easy po extreme. Zobacz całą listę, sprawdź, nad czym teraz pracuję, i śledź każdą zmianę miejsc.",
    btn_go: "Sprawdź listę", btn_progress: "Postępy", btn_changelog: "Changelog", btn_admin: "Panel admina",
    st_levels: "poziomów", st_hard: "hard demonów lub wyżej", st_hardest: "najcięższy",
    list_eyebrow: "Lista główna", list_h1: "Najcięższe poziomy,<br><span>które przeszedłem.</span>",
    dist_tip: "Kliknij, aby filtrować", ph_search: "Szukaj poziomu lub twórcy…", btn_rnd: "🎲 Losowy",
    f_all: "Wszystkie", f_shitty_tip: "Poziomy z „Shitty” w nazwie", main_tip: "Kliknij, aby zobaczyć historię miejsca",
    hist_none: "Brak zmian miejsca od czasu wprowadzenia historii.", empty_list: "Nic nie znaleziono 🤷", totop: "Do góry",
    prog_eyebrow: "W trakcie · p1achu", prog_h1: "Nad czym<br><span>teraz pracuję.</span>", runs: "runy:", est: "Estimated", prog_empty: "Brak poziomów w trakcie.",
    log_eyebrow: "Historia miejsc · p1achu", log_h1: "Changelog<br><span>listy.</span>",
    lf_all: "Wszystko", lf_add: "Dodane", lf_move: "Przesunięcia", lf_remove: "Usunięte",
    log_empty: "Brak wpisów. Historia pojawi się po pierwszej zmianie zrobionej w panelu admina.",
    d_add: "dodany na", d_remove: "usunięty z", d_move: "przesunięty", d_down: "zepchnięty przez", d_newlvl: " (nowy poziom)",
    d_up_removed: "awans, usunięto", d_up_moved: "przesunięty niżej"
  },
  en: {
    nav_list: "Main List", nav_progress: "Progress", nav_changelog: "Changelog",
    title_list: "Piachulist — Main List", title_progress: "Piachulist — Progress", title_changelog: "Piachulist — Changelog",
    home_h1: "The hardest levels <span>completed by p1achu</span>",
    home_sub: "A ranking of the demons I've beaten — from easy to extreme. Browse the full list, see what I'm working on right now, and follow every change in the rankings.",
    btn_go: "View the list", btn_progress: "Progress", btn_changelog: "Changelog", btn_admin: "Admin panel",
    st_levels: "levels", st_hard: "hard demons or higher", st_hardest: "hardest",
    list_eyebrow: "Main List", list_h1: "The hardest levels<br><span>I've beaten.</span>",
    dist_tip: "Click to filter", ph_search: "Search level or creator…", btn_rnd: "🎲 Random",
    f_all: "All", f_shitty_tip: "Levels with “Shitty” in the name", main_tip: "Click to see placement history",
    hist_none: "No placement changes since history tracking began.", empty_list: "Nothing found 🤷", totop: "Back to top",
    prog_eyebrow: "In progress · p1achu", prog_h1: "What I'm<br><span>working on now.</span>", runs: "runs:", est: "Estimated", prog_empty: "Nothing in progress.",
    log_eyebrow: "Placement history · p1achu", log_h1: "List<br><span>changelog.</span>",
    lf_all: "All", lf_add: "Added", lf_move: "Moves", lf_remove: "Removed",
    log_empty: "No entries yet. History will appear after the first change made in the admin panel.",
    d_add: "added at", d_remove: "removed from", d_move: "moved", d_down: "pushed down by", d_newlvl: " (new level)",
    d_up_removed: "moved up after removing", d_up_moved: "moved down"
  }
};
let LANG = "pl";
try { LANG = localStorage.getItem("piachulist-lang") || ""; } catch (e) {}
if (!I18N[LANG]) LANG = typeof navigator !== "undefined" && /^pl/i.test(navigator.language || "") ? "pl" : "en";   // pierwsza wizyta: język przeglądarki
if (typeof document !== "undefined" && document.body && document.body.dataset.page === "admin") LANG = "pl";      // panel admina zawsze po polsku
const t = k => (I18N[LANG] && I18N[LANG][k]) ?? I18N.pl[k] ?? k;
function applyLang() {
  if (typeof document === "undefined") return;
  document.documentElement.lang = LANG;
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = t(el.dataset.i18n));
  document.querySelectorAll("[data-i18n-html]").forEach(el => el.innerHTML = t(el.dataset.i18nHtml));
  document.querySelectorAll("[data-i18n-ph]").forEach(el => el.placeholder = t(el.dataset.i18nPh));
  document.querySelectorAll("[data-i18n-title]").forEach(el => el.title = t(el.dataset.i18nTitle));
  document.querySelectorAll("[data-i18n-aria]").forEach(el => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
  document.querySelectorAll(".lang button").forEach(b => { b.classList.toggle("on", b.dataset.lang === LANG); b.setAttribute("aria-pressed", b.dataset.lang === LANG); });
  const tt = I18N[LANG]["title_" + document.body.dataset.page]; if (tt) document.title = tt;
}
function setLang(l) {
  if (!I18N[l] || l === LANG) return;
  LANG = l; try { localStorage.setItem("piachulist-lang", l); } catch (e) {}
  applyLang(); if (typeof window.onLang === "function") window.onLang();   // strony przerysowują dynamiczne elementy
}

const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const slugify = s => s.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "level";

// Opis jednego wpisu historii. forLevel=true -> bez nazwy poziomu (widok karty)
function describe(e, forLevel) {
  const nm = forLevel ? "" : `<b>${esc(e.name)}</b> `, by = e.byName ? `<b>${esc(e.byName)}</b>` : "";
  if (e.type === "add") return `${nm}${t("d_add")} <b>#${e.to}</b>`;
  if (e.type === "remove") return `${nm}${t("d_remove")} <b>#${e.from}</b>`;
  const down = e.to > e.from, arrow = `${down ? "▼" : "▲"} #${e.from} → #${e.to}`;
  if (!e.by) return `${nm}${t("d_move")} ${arrow}`;
  if (down) return `${nm}${arrow} · ${t("d_down")} ${by}${e.cause === "add" ? t("d_newlvl") : ""}`;
  return `${nm}${arrow} · ${e.cause === "remove" ? `${t("d_up_removed")} ${by}` : `${by} ${t("d_up_moved")}`}`;
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
// ====== TŁO: ikony z Twojego icon setu (gamemode'y GD) dryfujące w górę ======
// Dodasz nową ikonę: wrzuć PNG do bgicons/ i dopisz jej nazwę (bez .png) w BG_ICONS.
const BG_ICONS = ["ball", "cube", "robot", "ship", "spider", "swing", "ufo", "wave"];
// Tu zmieniasz wygląd ikon w tle ("daleko" = małe, rozmyte, słabe; "blisko" = większe, ostrzejsze):
const BG_CFG = {
  count: 16,                      // ile ikon naraz — komputer
  countMobile: 9,                 // ile ikon naraz — telefon (ekran węższy niż 600 px)
  sizeMin: 28.6, sizeMax: 57.2,   // rozmiar w px: daleko → blisko
  opacityMin: 0.18, opacityMax: 0.34, // przezroczystość (1 = pełna): daleko → blisko
  blurMax: 1.6,                   // rozmycie najdalszych ikon w px (0 = brak)
  durFar: [44, 53],               // czas przelotu w sekundach dla dalekich [min, max] (MNIEJ = SZYBCIEJ)
  durNear: [23, 32],              // czas przelotu w sekundach dla bliskich [min, max]
  driftX: 180,                    // maks. dryf w bok w px
  rotate: [120, 420]              // obrót w stopniach podczas przelotu [min, max]
};
function makeBg() {
  if (typeof document === "undefined" || document.querySelector(".shapes")) return;
  const C = BG_CFG, r = Math.random, lerp = (a, b, t) => a + (b - a) * t, n = innerWidth < 600 ? C.countMobile : C.count;
  const box = document.createElement("div"); box.className = "shapes"; box.setAttribute("aria-hidden", "true");
  const lanes = [...Array(n).keys()].sort(() => r() - .5);   // każda ikona ma własny pas poziomy → równy rozkład na szerokości
  let last = -1;
  const place = (el, i, depth, dur, restart) => {
    let k; do { k = Math.floor(r() * BG_ICONS.length); } while (k === last && BG_ICONS.length > 1); last = k;
    const left = ((lanes[i] + .5 + (r() - .5) * .6) / n) * 96, sz = lerp(C.sizeMin, C.sizeMax, depth) * (.95 + r() * .1);
    el.src = `bgicons/${BG_ICONS[k]}.png`;
    el.style.cssText = `left:${left.toFixed(1)}%;width:${sz.toFixed(0)}px;--o:${lerp(C.opacityMin, C.opacityMax, depth).toFixed(2)};--bl:${((1 - depth) * C.blurMax).toFixed(1)}px;` +
      `--dx:${((r() - .5) * 2 * C.driftX) | 0}px;--rot:${(r() < .5 ? -1 : 1) * (C.rotate[0] + r() * (C.rotate[1] - C.rotate[0])) | 0}deg;animation-duration:${dur.toFixed(1)}s` +
      (restart ? "" : `;animation-delay:-${((i / n) * dur).toFixed(1)}s`);   // równo rozłożone fazy na starcie
    if (restart) { el.style.animationName = "none"; void el.offsetWidth; el.style.animationName = ""; }
  };
  for (let i = 0; i < n; i++) {
    const depth = (i * 0.618034 + .15) % 1,   // równomierne wymieszanie dalekich i bliskich ikon
      lo = lerp(C.durFar[0], C.durNear[0], depth), hi = lerp(C.durFar[1], C.durNear[1], depth), dur = lo + r() * (hi - lo);
    const el = document.createElement("img"); el.className = "bgi"; el.alt = ""; el.draggable = false; el.decoding = "async";
    el.onerror = () => el.remove();
    el.addEventListener("animationiteration", () => place(el, i, depth, dur, true));   // po każdym przelocie: nowa ikona i pozycja w swoim pasie
    place(el, i, depth, dur, false); box.appendChild(el);
  }
  document.body.prepend(box);
}
makeBg();
if (typeof document !== "undefined") {
  document.querySelectorAll(".lang button").forEach(b => b.onclick = () => setLang(b.dataset.lang));
  applyLang();
}
if (typeof module !== "undefined") module.exports = { applyChange, serialize, describe };
