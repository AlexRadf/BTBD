// GM case-file viewer. Merges dossiers pulled from the sheet with codes pasted in by hand.

const KEY_KEY = "nightshift.gm.key";
const LOCAL_KEY = "nightshift.gm.local";

let remote = [];
let local = store(LOCAL_KEY) || [];
let selected = null;

function allDossiers() {
  // Newest copy of each id wins, wherever it came from.
  const byId = new Map();
  for (const d of [...remote.map((x) => ({ ...x, _src: "sheet" })), ...local.map((x) => ({ ...x, _src: "code" }))]) {
    const prev = byId.get(d.id);
    if (!prev || new Date(d.updatedAt) > new Date(prev.updatedAt)) byId.set(d.id, d);
  }
  const order = ROLES.map((r) => r.id);
  return [...byId.values()].sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role) || (a.alias || "").localeCompare(b.alias || ""));
}

function renderList() {
  const list = allDossiers();
  $("#crew-count").textContent = list.length ? `(${list.length})` : "";
  if (!list.length) {
    $("#crew-list").replaceChildren(el("p", { class: "empty", text: "No files yet. Pull from the sheet or paste a dossier code." }));
    $("#file-view").replaceChildren();
    return;
  }
  if (!selected || !list.some((d) => d.id === selected)) selected = list[0].id;

  $("#crew-list").replaceChildren(
    ...list.map((d) => {
      const role = roleById(d.role);
      const answered = d.answers.filter((a) => a.a).length;
      return el(
        "button",
        { type: "button", class: "crew-card" + (d.id === selected ? " selected" : ""), onclick: () => ((selected = d.id), renderList()) },
        el("span", { class: "crew-alias", text: d.alias || "UNNAMED" }),
        el("span", { class: "crew-role", text: role ? role.title : d.role }),
        el("span", { class: "crew-meta", text: `${d.playerName || "?"} · ${answered}/${d.answers.length} · via ${d._src}` })
      );
    })
  );

  const d = list.find((x) => x.id === selected);
  const tools = el(
    "div",
    { class: "file-tools no-print" },
    el("button", { class: "btn btn-small", type: "button", onclick: () => printFiles([d]) }, "Print this file"),
    d._src === "code"
      ? el("button", { class: "btn btn-small btn-ghost", type: "button", onclick: () => removeLocal(d.id) }, "Remove pasted copy")
      : null
  );
  $("#file-view").replaceChildren(tools, renderDossier(d));
}

function printFiles(files) {
  const view = $("#file-view");
  const keep = [...view.childNodes];
  view.replaceChildren(...files.map(renderDossier));
  window.addEventListener("afterprint", () => view.replaceChildren(...keep), { once: true });
  window.print();
}

function removeLocal(id) {
  if (!confirm("Remove this pasted copy from this browser?")) return;
  local = local.filter((d) => d.id !== id);
  store(LOCAL_KEY, local);
  renderList();
}

async function pull(key) {
  const status = $("#remote-status");
  if (!CONFIG.ENDPOINT) return;
  status.textContent = "Calling the sheet…";
  try {
    const res = await fetch(`${CONFIG.ENDPOINT}?key=${encodeURIComponent(key)}`);
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "Rejected");
    remote = json.dossiers;
    store(KEY_KEY, key);
    status.textContent = `Pulled ${remote.length} file(s) at ${new Date().toLocaleTimeString()}.`;
    renderList();
  } catch (err) {
    status.textContent = err.message === "unauthorized" ? "Wrong key." : `Couldn't reach the sheet (${err.message}).`;
  }
}

$("#key-form").addEventListener("submit", (e) => {
  e.preventDefault();
  pull($("#gm-key").value.trim());
});

$("#import-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const raw = $("#import-code").value;
  const codes = raw.split(/(?=DOSSIER:)/).map((s) => s.trim()).filter(Boolean);
  let added = 0;
  let bad = 0;
  for (const code of codes) {
    try {
      const d = decodeDossier(code);
      local = local.filter((x) => x.id !== d.id || new Date(x.updatedAt) > new Date(d.updatedAt));
      if (!local.some((x) => x.id === d.id)) local.push(d);
      selected = d.id;
      added++;
    } catch {
      bad++;
    }
  }
  store(LOCAL_KEY, local);
  $("#import-status").textContent = `${added} added${bad ? `, ${bad} unreadable` : ""}.`;
  if (added) $("#import-code").value = "";
  renderList();
});

$("#btn-print-all").addEventListener("click", () => {
  const list = allDossiers();
  if (list.length) printFiles(list);
});

$("#btn-export").addEventListener("click", () => {
  const data = allDossiers().map(({ _src, ...d }) => d);
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  el("a", { href: url, download: `crew-files-${new Date().toISOString().slice(0, 10)}.json` }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

// ---------- Boot ----------

if (CONFIG.ENDPOINT) {
  $("#endpoint-hint").textContent = "Enter the GM key you set in the Apps Script project.";
  const saved = store(KEY_KEY);
  if (saved) {
    $("#gm-key").value = saved;
    pull(saved);
  }
} else {
  $("#endpoint-hint").textContent = "No sheet connected yet — set ENDPOINT in js/config.js (see README). Pasted codes still work.";
  $("#key-form").hidden = true;
}
renderList();
