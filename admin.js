const $ = s => document.querySelector(s);
let levels = LEVELS.map(l => ({ ...l })), log = CHANGELOG.map(e => ({ ...e })), stack = [], kind = "add", added = [];
$("#date").value = new Date().toLocaleDateString("sv-SE");
$("#diff").innerHTML = Object.entries(DIFFS).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join("");

function refresh() {
  const cur = $("#lvl").value;
  $("#lvl").innerHTML = levels.map((l, i) => `<option value="${esc(l.id)}">#${i + 1} ${esc(l.name)} — ${esc(l.creator)}</option>`).join("");
  if (levels.some(l => l.id === cur)) $("#lvl").value = cur;
  $("#pos").max = levels.length + (kind === "add" ? 1 : 0);
  if (!$("#pos").value) $("#pos").placeholder = kind === "add" ? `1–${levels.length + 1}` : `1–${levels.length}`;
  $("#pending").innerHTML = added.length ? added.map(e => `<div class="log ${e.type}"><span>${e.date}</span><p>${describe(e)}</p></div>`).join("") : '<p class="empty">Brak zmian.</p>';
  $("#undo").disabled = !stack.length;
  $("#out").value = serialize(levels, log, PROGRESS);
}
document.querySelectorAll("[data-for]").forEach(el => el.hidden = !el.dataset.for.split(" ").includes(kind));
function fillEdit() {
  const l = levels.find(x => x.id === $("#lvl").value); if (!l || kind !== "edit") return;
  $("#name").value = l.name; $("#creator").value = l.creator; $("#diff").value = l.diff;
  $("#thumb").value = l.thumb || ""; $("#link").value = l.link || ""; $("#hard").checked = !!l.hardest;
}
$("#lvl").onchange = fillEdit;
$("#kind").onclick = e => {
  const b = e.target.closest("button"); if (!b) return; kind = b.dataset.k;
  document.querySelectorAll("#kind button").forEach(x => x.classList.toggle("on", x === b));
  document.querySelectorAll("[data-for]").forEach(el => el.hidden = !el.dataset.for.split(" ").includes(kind));
  $("#msg").textContent = "";
  ["name", "creator", "thumb", "link", "pos"].forEach(i => $("#" + i).value = "");
  refresh(); fillEdit();
};
$("#apply").onclick = () => {
  const p = { pos: +$("#pos").value }, date = $("#date").value, msg = $("#msg"), n = levels.length;
  const fail = t => { msg.className = "msg err"; msg.textContent = t; };
  if (kind === "edit") {
    const id = $("#lvl").value, name = $("#name").value.trim(), creator = $("#creator").value.trim(), hard = $("#hard").checked;
    if (!name || !creator) return fail("Nazwa i twórca są wymagane.");
    stack.push([levels, log, added]);
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
  stack.push([levels, log, added]); levels = r.levels; log = [...r.entries, ...log]; added = [...r.entries, ...added];
  msg.className = "msg ok"; msg.textContent = `Gotowe. Zmieniło się ${r.entries.length} wpisów historii.`;
  ["name", "creator", "thumb", "link", "pos"].forEach(i => $("#" + i).value = "");
  refresh();
};
$("#undo").onclick = () => { [levels, log, added] = stack.pop(); $("#msg").textContent = ""; refresh(); };
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
