const $ = s => document.querySelector(s);
const IMG = 'onerror="this.style.visibility=\'hidden\'" loading="lazy"';
const listEl = $("#list"), page = document.body.dataset.page;
const hist = id => CHANGELOG.filter(e => e.id === id);

if (page === "progress") {
  const pct = b => { const t = String(b).replace(/%/g, "").trim(); return /^\d/.test(t) ? t + "%" : t; };
  const range = b => { const m = String(b).match(/^\s*(\d+)\s*[-–]\s*(\d+)/); if (m) return [+m[1], +m[2] - +m[1]]; const n = parseFloat(b); return isNaN(n) ? null : [0, n]; };
  listEl.innerHTML = PROGRESS.map(p => {
    const r = p.best != null && p.best !== "" ? range(p.best) : null;
    return `
    <article class="card prog" style="--c:#c04bd6"><div class="main">
      <div class="th"><img src="${esc(p.thumb || "")}" alt="" ${IMG}></div>
      <div class="info"><h3>${esc(p.name)}</h3><p>by ${esc(p.creator)}</p>
        ${r ? `<div class="bar"><i style="margin-left:${r[0]}%;width:${r[1]}%"></i></div>` : ""}
        <p class="runs">${p.best != null && p.best !== "" ? `<b>${esc(pct(p.best))}</b> best` : ""}${p.runs ? ` · runy: ${esc(p.runs)}` : ""}</p></div>
      ${p.est ? `<div class="badge est"><small>Estimated</small><b>${esc(p.est)}</b></div>` : ""}</div></article>`;
  }).join("") || '<p class="empty">Brak poziomów w trakcie.</p>';
} else if (page === "changelog") {
  let t = "all";
  const draw = () => {
    const es = CHANGELOG.filter(e => t === "all" || e.type === t).map((e, i) => [e, i]).sort((a, b) => b[0].date.localeCompare(a[0].date) || a[1] - b[1]).map(x => x[0]);
    let html = "", day = "";
    es.forEach(e => {
      if (e.date !== day) { day = e.date; html += `<h2 class="tier">${esc(day)}</h2>`; }
      const ic = { add: "＋", remove: "✕", move: e.to > e.from ? "▼" : "▲" }[e.type];
      html += `<div class="log ${e.type}"><span>${ic}</span><p>${describe(e)}</p></div>`;
    });
    listEl.innerHTML = html || '<p class="empty">Brak wpisów. Historia pojawi się po pierwszej zmianie zrobionej w panelu admina.</p>';
  };
  $("#chips").onclick = e => {
    const b = e.target.closest("button"); if (!b) return; t = b.dataset.t;
    document.querySelectorAll("#chips button").forEach(x => x.classList.toggle("on", x === b)); draw();
  };
  draw();
} else {
  let q = "", d = "all", shitty = false;
  const total = LEVELS.length, count = k => LEVELS.filter(l => l.diff === k).length, isShitty = l => /shitty/i.test(l.name), nShitty = LEVELS.filter(isShitty).length;
  const hardest = LEVELS.find(l => l.hardest) || LEVELS[0];
  const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const IC = { lv: '<path d="M12 3 3 8l9 5 9-5-9-5z"/><path d="m3 13 9 5 9-5"/>', hot: '<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>', cup: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H5v2a3 3 0 0 0 3 3M16 6h3v2a3 3 0 0 1-3 3M12 13v4M8 20h8"/>' };
  $("#stats").innerHTML = [[IC.lv, total, "poziomów"], [IC.hot, count("extreme") + count("insane") + count("hard"), "hard demonów lub wyżej"], [IC.cup, esc(hardest.name), "najcięższy"]]
    .map(([ic, n, t], x) => `<div class="pill rise" style="--i:${x + 5}">${svg(ic)}<b>${n}</b><span>${t}</span></div>`).join("");
  $("#dist").innerHTML = Object.keys(DIFFS).filter(count).map(k =>
    `<i data-d="${k}" style="flex:${count(k)};background:${DIFFS[k][1]}" title="${DIFFS[k][0]}: ${count(k)}"></i>`).join("");
  $("#chips").innerHTML = [["all","Wszystkie",total],...Object.keys(DIFFS).filter(count).map(k => [k,DIFFS[k][0],count(k)])]
    .map(([k,t,n]) => `<button data-d="${k}" class="${k==="all"?"on":""}">${t} <em>${n}</em></button>`).join("")
    + (nShitty ? `<button data-s="1" title="Poziomy z „Shitty" w nazwie">Shitty <em>${nShitty}</em></button>` : "");

  function render() {
    const needle = q.trim().toLowerCase(), plain = !needle && d === "all" && !shitty;
    let html = "";
    LEVELS.forEach((l, i) => {
      const rank = i + 1;
      if (d !== "all" && l.diff !== d) return;
      if (shitty && !isShitty(l)) return;
      if (needle && !(l.name + " " + l.creator).toLowerCase().includes(needle)) return;
      if (plain && rank % 10 === 1) html += `<h2 class="tier">${rank === 1 ? "Top 10" : "#" + rank + " – #" + Math.min(rank + 9, total)}</h2>`;
      const [label, color, icon] = DIFFS[l.diff] || DIFFS.unrated;
      const title = l.link ? `<a href="${esc(l.link)}" target="_blank" rel="noopener">${esc(l.name)}</a>` : esc(l.name);
      html += `<article class="card${rank <= 3 ? " top" + rank : ""}" data-id="${esc(l.id)}" style="--c:${color}">
        <div class="main" tabindex="0" role="button" aria-expanded="false" title="Kliknij, aby zobaczyć historię miejsca">
        <span class="rank">#${rank}</span>
        <div class="th"><img src="${esc(l.thumb)}" alt="" ${IMG}></div>
        <div class="info"><h3>${title}${l.hardest ? "<em>🥇 HARDEST</em>" : ""}</h3><p>by ${esc(l.creator)}</p></div>
        <div class="badge"><img src="${icon}" alt="${label}"><small>${label}</small></div></div></article>`;
    });
    listEl.innerHTML = html || '<p class="empty">Nic nie znaleziono 🤷</p>';
  }
  function toggle(main) {
    const card = main.parentElement, wasOpen = card.classList.contains("open");
    listEl.querySelectorAll(".card.open").forEach(c => {
      c.classList.remove("open"); c.querySelector(".main").setAttribute("aria-expanded", "false");
      const old = c.querySelector(".hist"); if (old) setTimeout(() => { if (!c.classList.contains("open")) old.remove(); }, 450);
    });
    if (wasOpen) return;
    let h = card.querySelector(".hist");
    if (!h) {
      const es = hist(card.dataset.id);
      h = document.createElement("div"); h.className = "hist";
      h.innerHTML = '<div class="in"><div class="pad">' + (es.length ? es.map(e => `<div><time>${esc(e.date)}</time><span>${describe(e, true)}</span></div>`).join("")
        : "<div><span>Brak zmian miejsca od czasu wprowadzenia historii.</span></div>") + "</div></div>";
      card.appendChild(h); void h.offsetHeight;
    }
    card.classList.add("open"); main.setAttribute("aria-expanded", "true");
  }
  listEl.onclick = e => { const m = e.target.closest(".main"); if (m && !e.target.closest("a")) toggle(m); };
  listEl.onkeydown = e => { if ((e.key === "Enter" || e.key === " ") && e.target.matches(".main")) { e.preventDefault(); toggle(e.target); } };
  const sync = () => {
    document.querySelectorAll(".chips button").forEach(b => b.classList.toggle("on", b.dataset.s ? shitty : b.dataset.d === "all" ? d === "all" && !shitty : b.dataset.d === d));
    render();
  };
  const setD = k => { d = d === k ? "all" : k; shitty = false; sync(); };
  $("#chips").onclick = e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.s) { shitty = !shitty; d = "all"; }          // Shitty jest wyłączne: wybierasz ALBO Shitty, ALBO trudność
    else if (b.dataset.d === "all") { d = "all"; shitty = false; }
    else { d = b.dataset.d; shitty = false; }
    sync();
  };
  $("#dist").onclick = e => { if (e.target.dataset.d) setD(e.target.dataset.d); };
  $("#q").oninput = e => { q = e.target.value; render(); };
  $("#rnd").onclick = () => {
    const c = listEl.querySelectorAll(".card"); if (!c.length) return;
    const el = c[Math.floor(Math.random() * c.length)];
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
  };
  render();
  // --- ekran powitalny <-> lista (jeden plik)
  const home = $("#home"), view = $("#listview"), navList = document.querySelector('nav a[href^="list.html"]');
  const show = w => { const l = w === "list"; home.hidden = l; view.hidden = !l; navList.classList.toggle("on", l); document.body.classList.toggle("is-home", !l); window.scrollTo(0, 0); };
  const go = w => { try { history.pushState({ v: w }, ""); } catch (e) {} show(w); };
  const fromNav = new URLSearchParams(location.search).get("view") === "list";
  if (fromNav) { try { history.replaceState({ v: "list" }, "", location.pathname); } catch (e) {} }
  show(fromNav ? "list" : "home");
  window.addEventListener("popstate", e => show(e.state && e.state.v === "list" ? "list" : "home"));
  $("#go").onclick = e => { e.preventDefault(); go("list"); };
  navList.onclick = e => { e.preventDefault(); if (view.hidden) go("list"); };
  document.querySelector(".brand").onclick = e => { e.preventDefault(); if (home.hidden) go("home"); else window.scrollTo({ top: 0, behavior: "smooth" }); };
  if (location.protocol === "file:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) $("#adminBtn").hidden = false;
  const up = $("#totop");
  const onScroll = () => up.classList.toggle("show", window.scrollY > 500);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  up.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
}
