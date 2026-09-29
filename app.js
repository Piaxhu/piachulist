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
  let q = "", d = "all";
  const total = LEVELS.length, count = k => LEVELS.filter(l => l.diff === k).length;
  const hardest = LEVELS.find(l => l.hardest) || LEVELS[0];
  $("#stats").innerHTML = [[total,"poziomów"],[count("extreme")+count("insane")+count("hard"),"hard+ demonów"],[esc(hardest.name),"najcięższy"]]
    .map(([n,t]) => `<div><b>${n}</b><span>${t}</span></div>`).join("");
  $("#dist").innerHTML = Object.keys(DIFFS).filter(count).map(k =>
    `<i data-d="${k}" style="flex:${count(k)};background:${DIFFS[k][1]}" title="${DIFFS[k][0]}: ${count(k)}"></i>`).join("");
  $("#chips").innerHTML = [["all","Wszystkie",total],...Object.keys(DIFFS).filter(count).map(k => [k,DIFFS[k][0],count(k)])]
    .map(([k,t,n]) => `<button data-d="${k}" class="${k==="all"?"on":""}">${t} <em>${n}</em></button>`).join("");

  function render() {
    const needle = q.trim().toLowerCase(), plain = !needle && d === "all";
    let html = "";
    LEVELS.forEach((l, i) => {
      const rank = i + 1;
      if (d !== "all" && l.diff !== d) return;
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
      c.classList.remove("open"); c.querySelector(".main").setAttribute("aria-expanded", "false"); c.querySelector(".hist")?.remove();
    });
    if (wasOpen) return;
    const open = card.classList.toggle("open");
    main.setAttribute("aria-expanded", open);
    let h = card.querySelector(".hist");
    if (open && !h) {
      const es = hist(card.dataset.id);
      h = document.createElement("div"); h.className = "hist";
      h.innerHTML = es.length ? es.map(e => `<div><time>${esc(e.date)}</time><span>${describe(e, true)}</span></div>`).join("")
        : "<div><span>Brak zmian miejsca od czasu wprowadzenia historii.</span></div>";
      card.appendChild(h);
    }
  }
  listEl.onclick = e => { const m = e.target.closest(".main"); if (m && !e.target.closest("a")) toggle(m); };
  listEl.onkeydown = e => { if ((e.key === "Enter" || e.key === " ") && e.target.matches(".main")) { e.preventDefault(); toggle(e.target); } };
  const setD = k => {
    d = d === k ? "all" : k;
    document.querySelectorAll(".chips button").forEach(b => b.classList.toggle("on", b.dataset.d === d));
    render();
  };
  $("#chips").onclick = e => { const b = e.target.closest("button"); if (b) { d = "x"; setD(b.dataset.d); } };
  $("#dist").onclick = e => { if (e.target.dataset.d) setD(e.target.dataset.d); };
  $("#q").oninput = e => { q = e.target.value; render(); };
  $("#rnd").onclick = () => {
    const c = listEl.querySelectorAll(".card"); if (!c.length) return;
    const el = c[Math.floor(Math.random() * c.length)];
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
  };
  render();
  const up = $("#totop");
  const onScroll = () => up.classList.toggle("show", window.scrollY > 500);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  up.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
}
