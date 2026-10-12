// Helpers shared by the intake form and the GM page.

const MAX_ANSWER = 1500;

function $(sel, root = document) {
  return root.querySelector(sel);
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) {
    if (c == null) continue;
    node.append(c instanceof Node ? c : document.createTextNode(c));
  }
  return node;
}

function store(key, value) {
  try {
    if (value === undefined) return JSON.parse(localStorage.getItem(key));
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return null;
  }
}

function roleById(id) {
  return ROLES.find((r) => r.id === id);
}

// The full question list for a role, in order, tagged by section.
function questionsFor(role) {
  return [
    ...PERSONNEL.map((x) => ({ ...x, section: "Personnel" })),
    ...role.questions.map((x) => ({ ...x, section: role.title })),
    { ...FINAL_QUESTION, section: "Stencil" },
  ];
}

// Dossier codes: base64url of UTF-8 JSON, so they survive chat apps and email.
const CODE_PREFIX = "DOSSIER:";

function encodeDossier(d) {
  const bytes = new TextEncoder().encode(JSON.stringify(d));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return CODE_PREFIX + btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeDossier(code) {
  let s = code.trim().replace(/\s+/g, "");
  if (s.startsWith(CODE_PREFIX)) s = s.slice(CODE_PREFIX.length);
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  const d = JSON.parse(new TextDecoder().decode(bytes));
  if (!d || typeof d.id !== "string" || !Array.isArray(d.answers)) throw new Error("Not a dossier");
  return d;
}

function formatDate(iso) {
  const d = new Date(iso);
  return isNaN(d) ? "—" : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

// Renders a dossier as a printable case file. Used by the player's preview and the GM page.
function renderDossier(d) {
  const role = roleById(d.role);
  const answered = d.answers.filter((a) => a.a && a.a.trim()).length;
  let lastSection = null;
  const body = [];
  for (const a of d.answers) {
    if (a.section !== lastSection) {
      body.push(el("h3", { class: "file-section", text: a.section }));
      lastSection = a.section;
    }
    body.push(
      el(
        "div",
        { class: "file-qa" },
        el("p", { class: "file-q", text: a.q }),
        a.a && a.a.trim()
          ? el("p", { class: "file-a", text: a.a })
          : el("p", { class: "file-a blank", text: "[no answer given]" })
      )
    );
  }
  return el(
    "article",
    { class: "case-file paper stained burned" },
    el("span", { class: "clip", "aria-hidden": "true" }),
    el(
      "header",
      { class: "file-head" },
      el("div", { class: "file-stamp", text: role ? role.title : d.role }),
      el("p", { class: "file-label", text: "Jumpsuit reads" }),
      el("h2", { class: "file-alias", text: d.alias || "UNNAMED" }),
      el(
        "dl",
        { class: "file-meta" },
        el("dt", { text: "Name" }),
        el("dd", { text: d.characterName || "—" }),
        el("dt", { text: "Look" }),
        el("dd", { text: d.look || "—" }),
        el("dt", { text: "Played by" }),
        el("dd", { text: d.playerName || "—" }),
        el("dt", { text: "Filed" }),
        el("dd", { text: `${formatDate(d.updatedAt)} · ${answered}/${d.answers.length} answered` })
      )
    ),
    ...body
  );
}
