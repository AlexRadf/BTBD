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
  return [...byId.values()].sort(
    (a, b) => !!a.withdrawn - !!b.withdrawn || order.indexOf(a.role) - order.indexOf(b.role) || (a.alias || "").localeCompare(b.alias || "")
  );
}

function renderList() {
  const list = allDossiers();
  const active = list.filter((d) => !d.withdrawn).length;
  $("#crew-count").textContent = list.length ? `(${active})` : "";
  if (!list.length) {
    $("#crew-list").replaceChildren(el("p", { class: "empty", text: "No files yet. Pull from the sheet or paste a dossier code." }));
    $("#file-view").replaceChildren();
    if (typeof renderNight === "function") renderNight();
    return;
  }
  if (!selected || !list.some((d) => d.id === selected)) selected = list[0].id;

  $("#crew-list").replaceChildren(
    ...list.map((d) => {
      const role = roleById(d.role);
      const answered = d.answers.filter((a) => a.a).length;
      return el(
        "button",
        { type: "button", class: "crew-card" + (d.id === selected ? " selected" : "") + (d.withdrawn ? " withdrawn" : ""), onclick: () => ((selected = d.id), renderList()) },
        el("span", { class: "crew-alias", text: d.alias || "UNNAMED" }),
        el("span", { class: "crew-role", text: (d.withdrawn ? "Withdrawn from " : "") + (role ? role.title : d.role) }),
        el("span", { class: "crew-meta", text: `${d.playerName || "?"} · ${answered}/${d.answers.length} · via ${d._src}` })
      );
    })
  );

  const d = list.find((x) => x.id === selected);
  const tools = el(
    "div",
    { class: "file-tools no-print" },
    el("button", { class: "btn btn-small", type: "button", onclick: () => printFiles([d]) }, "Print this file"),
    el(
      "button",
      {
        class: "btn btn-small btn-ghost",
        type: "button",
        onclick: () => {
          if (confirm(`Delete ${d.alias || "this file"} for good? Their dossier is removed from the sheet and this browser.`)) deleteFiles([d.id], d.alias || "the file");
        },
      },
      "Delete file"
    )
  );
  $("#file-view").replaceChildren(tools, renderDossier(d));
  if (typeof renderNight === "function") renderNight();
}

function printFiles(files) {
  const view = $("#file-view");
  const keep = [...view.childNodes];
  view.replaceChildren(...files.map(renderDossier));
  window.addEventListener("afterprint", () => view.replaceChildren(...keep), { once: true });
  window.print();
}

// Plain fetch first: it carries no Google cookies, so being signed into several Google
// accounts can't send it to the wrong one. JSONP is the fallback for when CORS gets in the way.
async function readSheet(key, extra = {}) {
  const params = { key, ...extra };
  try {
    const res = await fetch(`${CONFIG.ENDPOINT}?${new URLSearchParams(params)}`, { credentials: "omit" });
    return await res.json();
  } catch (err) {
    console.warn("fetch failed, trying JSONP", err);
    return jsonp(CONFIG.ENDPOINT, params);
  }
}

// Deletes from the sheet (if it's there) and from this browser's pasted codes.
// `ids` is a list of dossier ids, or "*" for everything.
async function deleteFiles(ids, what) {
  const everything = ids === "*";
  const onSheet = everything ? remote.length > 0 : remote.some((d) => ids.includes(d.id));
  const status = $("#remote-status");
  if (onSheet) {
    const key = store(KEY_KEY);
    if (!key) return alert("Pull files with your GM key first, so the sheet knows it's you.");
    status.textContent = `Shredding ${what}…`;
    try {
      const json = await readSheet(key, { delete: everything ? "*" : ids.join(",") });
      if (!json.ok) throw new Error(json.error || "rejected");
      // An old deployment ignores ?delete and just lists the files.
      if (json.deleted === undefined) throw new Error("the deployed script is out of date — paste the latest Code.gs and deploy a new version");
      remote = everything ? [] : remote.filter((d) => !ids.includes(d.id));
      status.textContent = `Deleted ${json.deleted} file(s) from the sheet.`;
    } catch (err) {
      status.textContent = `Couldn't delete: ${err.message}.`;
      return;
    }
  }
  local = everything ? [] : local.filter((d) => !ids.includes(d.id));
  store(LOCAL_KEY, local);
  selected = null;
  renderList();
}

async function pull(key) {
  const status = $("#remote-status");
  if (!CONFIG.ENDPOINT) return;
  status.textContent = "Calling the sheet…";
  try {
    const json = await readSheet(key);
    if (!json.ok) throw new Error(json.error || "Rejected");
    remote = json.dossiers;
    store(KEY_KEY, key);
    status.textContent = `Pulled ${remote.length} file(s) at ${new Date().toLocaleTimeString()}.`;
    renderList();
  } catch (err) {
    status.replaceChildren(
      err.message === "unauthorized" ? "Wrong key." : `Couldn't reach the sheet: ${err.message}. `,
      err.message === "unauthorized" ? "" : el("a", { href: CONFIG.ENDPOINT, target: "_blank", rel: "noopener" }, "Open the script URL to see what Google says.")
    );
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

$("#btn-delete-all").addEventListener("click", () => {
  const n = allDossiers().length;
  if (!n) return;
  const typed = prompt(`This deletes all ${n} file(s), from the sheet and from this browser. It can't be undone.\n\nType DELETE to go ahead.`);
  if (typed && typed.trim().toUpperCase() === "DELETE") deleteFiles("*", "every file");
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
