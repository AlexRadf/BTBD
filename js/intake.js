// Player-facing intake: brief -> role -> questionnaire -> filed.

const DRAFT_KEY = "nightshift.draft";
const ID_KEY = "nightshift.id";

const state = store(DRAFT_KEY) || { role: null, fields: {}, answers: {}, submitted: false };

function dossierId() {
  let id = store(ID_KEY);
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()).replace(/-/g, "");
    store(ID_KEY, id);
  }
  return id;
}

function save() {
  store(DRAFT_KEY, state);
}

function show(name) {
  for (const s of document.querySelectorAll(".screen")) s.hidden = s.id !== `screen-${name}`;
  window.scrollTo(0, 0);
}

// ---------- Role picker ----------

function renderRoles() {
  const current = roleById(state.role);
  $("#assigned-bar").hidden = !current;
  if (current) $("#assigned-role").textContent = current.title;
  const grid = $("#role-grid");
  grid.replaceChildren(
    ...ROLES.map((r) =>
      el(
        "button",
        {
          type: "button",
          class: "role-card" + (state.role === r.id ? " selected" : ""),
          onclick: () => {
            state.role = r.id;
            save();
            openForm();
          },
        },
        el("span", { class: "role-title", text: r.title }),
        el("span", { class: "role-tag", text: r.tag })
      )
    )
  );
}

// ---------- Questionnaire ----------

function openForm() {
  const role = roleById(state.role);
  if (!role) return show("role");
  $("#form-title").textContent = `${role.title} — personnel file`;

  const form = $("#intake");
  for (const name of ["playerName", "characterName", "look"]) {
    form.elements[name].value = state.fields[name] || "";
  }

  let n = 0;
  let lastSection = null;
  const nodes = [];
  for (const item of questionsFor(role)) {
    if (item.section !== lastSection) {
      nodes.push(el("h2", { class: "q-section", text: item.section === "Stencil" ? "One more thing" : item.section }));
      lastSection = item.section;
    }
    n++;
    const isStencil = item.id === FINAL_QUESTION.id;
    const field = isStencil
      ? el("input", { id: `q-${item.id}`, name: item.id, maxlength: 40, class: "stencil-input", placeholder: "e.g. GOON #4, KNUCKLES, MR. TUESDAY" })
      : el("textarea", { id: `q-${item.id}`, name: item.id, rows: 3, maxlength: MAX_ANSWER });
    field.value = state.answers[item.id] || "";
    nodes.push(
      el(
        "div",
        { class: "q" },
        el("label", { for: `q-${item.id}` }, el("span", { class: "q-num", text: String(n).padStart(2, "0") }), item.q),
        field
      )
    );
  }
  $("#questions").replaceChildren(...nodes);
  updateTower();
  setSaveState(state.submitted ? "Filed. Changes will need to be filed again." : "");
  show("form");
}

function answeredCount() {
  const role = roleById(state.role);
  const qs = questionsFor(role);
  return [qs.filter((q) => (state.answers[q.id] || "").trim()).length, qs.length];
}

function updateTower() {
  const [done, total] = answeredCount();
  const tower = $("#tower");
  if (tower.childElementCount !== total) {
    tower.replaceChildren(...Array.from({ length: total }, (_, i) => el("span", { class: "block" + (Math.floor(i / 3) % 2 ? " cross" : "") })));
  }
  // The tower wraps in reverse, so the first block sits at the bottom.
  [...tower.children].forEach((b, i) => b.classList.toggle("on", i < done));
  $("#tower-count").textContent = `${done} / ${total}`;
}

let saveTimer;
function setSaveState(text) {
  $("#save-state").textContent = text;
}

$("#intake").addEventListener("input", (e) => {
  const t = e.target;
  if (["playerName", "characterName", "look"].includes(t.name)) state.fields[t.name] = t.value;
  else state.answers[t.name] = t.value;
  clearTimeout(saveTimer);
  setSaveState("Saving…");
  saveTimer = setTimeout(() => {
    save();
    setSaveState(state.submitted ? "Saved here. File it again to send the changes." : "Saved on this device.");
  }, 400);
  updateTower();
});

function buildDossier() {
  const role = roleById(state.role);
  return {
    id: dossierId(),
    role: role.id,
    playerName: (state.fields.playerName || "").trim(),
    characterName: (state.fields.characterName || "").trim(),
    look: (state.fields.look || "").trim(),
    alias: (state.answers[FINAL_QUESTION.id] || "").trim(),
    updatedAt: new Date().toISOString(),
    // Question text travels with the answers so old files stay readable if questions change.
    answers: questionsFor(role).map((q) => ({ id: q.id, section: q.section, q: q.q, a: (state.answers[q.id] || "").trim() })),
  };
}

// Resolves true when the sheet confirmed it, "unconfirmed" when it went out but the reply
// couldn't be read (Google's redirect often trips CORS even though the row was written).
async function sendToBoss(dossier) {
  if (!CONFIG.ENDPOINT) return false;
  const body = JSON.stringify(dossier);
  let res;
  try {
    // text/plain keeps this a "simple" request, which Apps Script accepts without a CORS preflight.
    res = await fetch(CONFIG.ENDPOINT, { method: "POST", body, credentials: "omit" });
  } catch {
    // Unreadable reply. Send it again blind; Apps Script still runs doPost, and re-filing
    // the same id just overwrites the same row.
    await fetch(CONFIG.ENDPOINT, { method: "POST", body, mode: "no-cors", credentials: "omit" });
    return "unconfirmed";
  }
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(/sign ?in|accounts\.google/i.test(text) ? "the script wants a Google sign-in" : `unexpected reply (HTTP ${res.status})`);
  }
  if (!json.ok) throw new Error(json.error || "rejected");
  return true;
}

$("#intake").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  if (!form.elements.playerName.value.trim()) {
    form.elements.playerName.focus();
    setSaveState("The boss needs to know who's holding the dice. Fill in your name.");
    return;
  }
  const [done, total] = answeredCount();
  if (done < total && !confirm(`You've left ${total - done} question(s) blank. File it anyway?`)) return;

  const btn = $("#btn-submit");
  btn.disabled = true;
  btn.textContent = "Filing…";
  const dossier = buildDossier();
  let sent = false;
  let failed = null;
  try {
    sent = await sendToBoss(dossier);
  } catch (err) {
    console.error(err);
    failed = err.message || "network error";
  }
  btn.disabled = false;
  btn.textContent = "File it with the boss";

  state.submitted = true;
  save();
  showDone(dossier, sent, failed);
});

// Frees up the role. Answers stay saved here in case they pick it (or another) again.
async function unassign() {
  const role = roleById(state.role);
  if (!role) return;
  if (!confirm(`Unassign yourself from ${role.title}? Your answers stay saved on this device.`)) return;
  if (state.submitted) {
    // Tell the boss, so the GM sees the role is open again. Re-filing later reinstates the file.
    const dossier = { ...buildDossier(), withdrawn: true };
    sendToBoss(dossier).catch((err) => console.error(err));
  }
  state.role = null;
  state.submitted = false;
  save();
  $("#btn-resume").hidden = true;
  $("#btn-start").hidden = false;
  renderRoles();
  show("role");
}

// ---------- Filed ----------

function showDone(dossier, sent, failed) {
  const code = encodeDossier(dossier);
  $("#dossier-code").value = code;
  if (sent) {
    $("#done-eyebrow").textContent = (sent === true ? "Received · " : "Sent · ") + formatDate(dossier.updatedAt);
    $("#done-message").textContent =
      "The boss has your file. Sit tight, keep your phone on, and don't tell anyone where you're going tonight. You can come back and change your answers until the van shows up." +
      (sent === true ? "" : " (If the GM says it never arrived, send them the code below.)");
    $("#code-box").hidden = sent === true;
  } else {
    $("#done-eyebrow").textContent = failed ? "The line went dead" : "Hand delivery";
    $("#done-message").textContent = failed
      ? `Couldn't reach the boss just now (${failed}). Your file is saved on this device — send the GM the code below so nothing gets lost.`
      : "Send the code below to the GM. It holds your whole file.";
    $("#code-box").hidden = false;
  }
  $("#preview").replaceChildren(el("h2", { class: "preview-title", text: "Your file, as the boss sees it" }), renderDossier(dossier));
  show("done");
}

$("#btn-copy").addEventListener("click", async () => {
  const ta = $("#dossier-code");
  try {
    await navigator.clipboard.writeText(ta.value);
  } catch {
    ta.select();
    document.execCommand("copy");
  }
  $("#btn-copy").textContent = "Copied";
  setTimeout(() => ($("#btn-copy").textContent = "Copy code"), 1500);
});

$("#btn-show-code").addEventListener("click", () => {
  $("#code-box").hidden = false;
  $("#code-box").scrollIntoView({ behavior: "smooth", block: "center" });
});
$("#btn-edit").addEventListener("click", openForm);
$("#btn-unassign").addEventListener("click", unassign);
$("#btn-unassign-form").addEventListener("click", unassign);
$("#btn-change-role").addEventListener("click", () => {
  renderRoles();
  show("role");
});
$("#btn-start").addEventListener("click", () => {
  renderRoles();
  state.role ? openForm() : show("role");
});
$("#btn-resume").addEventListener("click", openForm);

// ---------- Boot ----------

if (state.role && roleById(state.role)) {
  $("#btn-resume").hidden = false;
  $("#btn-start").hidden = true;
}
