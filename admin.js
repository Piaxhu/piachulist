const $ = s => document.querySelector(s);
let levels = LEVELS.map(l => ({ ...l })), log = CHANGELOG.map(e => ({ ...e })), prog = PROGRESS.map(p => ({ ...p })), stack = [], kind = "add", added = [], sess = [], mode = "list";
const key = () => (mode === "progress" ? "p-" : "") + kind, snap = () => stack.push([levels, log, added, prog, sess]);
const FIELDS = ["name", "creator", "thumb", "link", "pos", "pname", "pcreator", "pest", "pthumb", "pbest", "pruns"];
function showFor() {
  document.querySelectorAll("[data-for]").forEach(el => el.hidden = !el.dataset.for.split(" ").includes(key()));
  document.querySelectorAll("#kind button").forEach(b => { b.hidden = b.dataset.m !== mode; b.classList.toggle("on", b.dataset.m === mode && b.dataset.k === kind); });
  document.querySelectorAll("#mode button").forEach(b => b.classList.toggle("on", b.dataset.m === mode));
}
$("#date").value = new Date().toLocaleDateString("sv-SE");
$("#diff").innerHTML = Object.entries(DIFFS).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join("");

function refresh() {
  const cur = $("#lvl").value;
  $("#lvl").innerHTML = levels.map((l, i) => `<option value="${esc(l.id)}">#${i + 1} ${esc(l.name)} — ${esc(l.creator)}</option>`).join("");
  if (levels.some(l => l.id === cur)) $("#lvl").value = cur;
  const pc = $("#plvl").value;
  $("#plvl").innerHTML = prog.map((p, i) => `<option value="${i}">${i + 1}. ${esc(p.name)} — ${esc(p.creator)}</option>`).join("");
  if (+pc < prog.length) $("#plvl").value = pc;
  $("#pos").max = levels.length + (kind === "add" ? 1 : 0);
  if (!$("#pos").value) $("#pos").placeholder = kind === "add" ? `1–${levels.length + 1}` : `1–${levels.length}`;
  const rows = added.map(e => `<div class="log ${e.type}"><span>${e.date}</span><p>${describe(e)}</p></div>`).concat(sess.map(t => `<div class="log"><span>Progress</span><p>${t}</p></div>`)).join("");
  $("#pending").innerHTML = rows || '<p class="empty">Brak zmian.</p>';
  $("#undo").disabled = !stack.length;
  $("#out").value = serialize(levels, log, prog);
}
showFor();
function fillEdit() {
  if (key() === "p-edit") {
    const p = prog[+$("#plvl").value]; if (!p) return;
    $("#pname").value = p.name; $("#pcreator").value = p.creator; $("#pest").value = p.est || ""; $("#pthumb").value = p.thumb || "";
    $("#pbest").value = p.best ?? ""; $("#pruns").value = p.runs || ""; return;
  }
  const l = levels.find(x => x.id === $("#lvl").value); if (!l || kind !== "edit" || mode !== "list") return;
  $("#name").value = l.name; $("#creator").value = l.creator; $("#diff").value = l.diff;
  $("#thumb").value = l.thumb || ""; $("#link").value = l.link || ""; $("#hard").checked = !!l.hardest;
}
$("#plvl").onchange = fillEdit;
$("#lvl").onchange = fillEdit;
function reset() { $("#msg").textContent = ""; FIELDS.forEach(i => $("#" + i).value = ""); showFor(); refresh(); fillEdit(); }
$("#kind").onclick = e => { const b = e.target.closest("button"); if (!b) return; kind = b.dataset.k; reset(); };
$("#mode").onclick = e => { const b = e.target.closest("button"); if (!b) return; mode = b.dataset.m; kind = "add"; reset(); };
function applyProgress(msg, fail) {
  const say = t => { msg.className = "msg ok"; msg.textContent = t; };
  if (kind === "remove") {
    const i = +$("#plvl").value, p = prog[i]; if (!p) return fail("Brak poziomów do usunięcia.");
    snap(); prog = prog.filter((_, x) => x !== i); sess = [`usunięto <b>${esc(p.name)}</b>`, ...sess]; say("Usunięto z Progress."); return refresh();
  }
  const name = $("#pname").value.trim(), creator = $("#pcreator").value.trim();
  if (!name || !creator) return fail("Nazwa i twórca są wymagane.");
  let best = $("#pbest").value.trim().replace(/%/g, "").replace(/\s+/g, "").replace(/[–—]/g, "-");
  const m = best.match(/^(\d{1,3})(?:-(\d{1,3}))?$/);
  if (best && !(m && +m[1] <= 100 && (m[2] === undefined || (+m[1] < +m[2] && +m[2] <= 100)))) return fail("Best run: wpisz np. 35 albo 20-100 (0–100).");
  let est = $("#pest").value.trim(); if (est && !/[a-z]/i.test(est)) est = "Top " + est;
  const item = { name, creator, best, runs: $("#pruns").value.trim(), est, thumb: $("#pthumb").value.trim() };
  snap();
  if (kind === "add") { prog = [...prog, item]; sess = [`dodano <b>${esc(name)}</b>`, ...sess]; say("Dodano do Progress."); }
  else { const i = +$("#plvl").value; prog = prog.map((p, x) => x === i ? item : p); sess = [`zmieniono <b>${esc(name)}</b>`, ...sess]; say("Zapisano zmiany w Progress."); }
  if (kind === "add") FIELDS.forEach(i => $("#" + i).value = "");
  refresh();
}
$("#apply").onclick = () => {
  const p = { pos: +$("#pos").value }, date = $("#date").value, msg = $("#msg"), n = levels.length;
  const fail = t => { msg.className = "msg err"; msg.textContent = t; };
  if (mode === "progress") return applyProgress(msg, fail);
  if (kind === "edit") {
    const id = $("#lvl").value, name = $("#name").value.trim(), creator = $("#creator").value.trim(), hard = $("#hard").checked;
    if (!name || !creator) return fail("Nazwa i twórca są wymagane.");
    snap();
    levels = levels.map(l => l.id === id
      ? { ...l, name, creator, diff: $("#diff").value, thumb: $("#thumb").value.trim(), link: $("#link").value.trim() || undefined, hardest: hard || undefined }
      : hard ? { ...l, hardest: undefined } : l);
    const ren = e => ({ ...e, name: e.id === id ? name : e.name, byName: e.by === id ? name : e.byName });
    log = log.map(ren); added = added.map(ren);
    msg.className = "msg ok"; msg.textContent = "Zapisano zmiany poziomu (nie trafiają do historii)."; refresh(); return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail("Podaj datę.");
  if (kind === "add") {
    Object.assign(p, { name: $("#name").value.trim(), creator: $("#creator").value.trim(), diff: $("#diff").value, thumb: $("#thumb").value.trim(), link: $("#link").value.trim() });
    if (!p.name || !p.creator) return fail("Nazwa i twórca są wymagane.");
  } else p.id = $("#lvl").value;
  if ((kind === "add" || kind === "move") && !(p.pos >= 1 && p.pos <= n + (kind === "add" ? 1 : 0))) return fail("Nieprawidłowe miejsce.");
  if (kind === "move" && p.pos === levels.findIndex(l => l.id === p.id) + 1) return fail("Poziom już jest na tym miejscu.");
  const r = applyChange(levels, kind, p, date);
  snap(); levels = r.levels; log = [...r.entries, ...log]; added = [...r.entries, ...added];
  msg.className = "msg ok"; msg.textContent = `Gotowe. Zmieniło się ${r.entries.length} wpisów historii.`;
  ["name", "creator", "thumb", "link", "pos"].forEach(i => $("#" + i).value = "");
  refresh();
};
$("#undo").onclick = () => { [levels, log, added, prog, sess] = stack.pop(); $("#msg").textContent = ""; refresh(); };
$("#copy").onclick = async () => { await navigator.clipboard.writeText($("#out").value).catch(() => { $("#out").select(); document.execCommand("copy"); }); $("#copy").textContent = "Skopiowano ✓"; setTimeout(() => $("#copy").textContent = "Kopiuj", 1500); };
$("#dl").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([$("#out").value], { type: "text/javascript" })); a.download = "data.js"; a.click(); };
$("#vsc").onclick = () => {
  const m = $("#msg2");
  if (location.protocol !== "file:") { m.className = "msg err"; m.textContent = "Ta opcja działa tylko, gdy admin.html jest otwarty z dysku (plik lokalny), nie ze strony w internecie."; return; }
  const dir = decodeURIComponent(location.pathname).replace(/[^/]*$/, "");
  location.href = "vscode://file" + encodeURI(dir + "data.js");
  m.className = "msg ok"; m.textContent = "Otwieram data.js w VS Code. Wklej skopiowaną zawartość i zapisz plik.";
};
refresh();
