// "The night": table-side tools for running the game, fed by the crew's own answers.

const NIGHT_KEY = "nightshift.gm.night";
const TAB_KEY = "nightshift.gm.tab";

const night = Object.assign({ status: {}, pulls: {}, sinceBuild: 0, focus: null }, store(NIGHT_KEY) || {});

function saveNight() {
  store(NIGHT_KEY, night);
}

// ---------- Twists built from specific answers ----------
// {who} is the goon's jumpsuit name; {a} is their answer.

const TWISTS = {
  p_cut: "The radio crackles. A calm voice reads out exactly what {who}'s cut was for: “{a}”. Then static.",
  p_home: "{who}'s phone buzzes. Unknown number. It's about who's waiting at home (“{a}”). Just two words: GO HOME.",
  p_lastjob: "{who} smells it again — the last thing before it went dark last time: “{a}”. It's coming from the vents.",
  p_rule: "Corner {who}: break their one rule (“{a}”) or leave a crewmate behind.",
  p_rumor: "Another goon starts talking about the rumor {who} won't believe (“{a}”) like it's true. Their voice is shaking.",
  m_ceiling: "{who} checks the ceiling. Clear. Checks again. On the third look, a ceiling tile is missing that wasn't before.",
  m_afraid: "Bring in a taste of what {who} is really afraid of: “{a}”. Just enough that they have to pull to keep moving.",
  m_beaten: "Someone asks {who}, right now, what really happened the night they went down (“{a}”). Make them tell it.",
  m_bullet: "The crewmate {who} would take a bullet for (“{a}”) goes quiet on the radio.",
  w_engine: "Faint, outside: an engine idling. {who} knows it — “{a}”. Then it cuts out.",
  w_exit: "{who}'s exit rule just triggered (“{a}”). Do they go? The door they'd use is locked from the outside.",
  w_glovebox: "What {who} keeps in the glovebox (“{a}”) is sitting on a crate in front of them. The car is three blocks away.",
  w_inside: "{who} realises nobody is waiting in the car. Nobody at all.",
  s_silence: "{who} hears it again, closer — the sound from the last vault: “{a}”.",
  s_count: "{who} is counting under their breath. Someone in the dark is counting with them. One number ahead.",
  s_kept: "Pinned to the vault door: a photo of the thing {who} never fenced (“{a}”).",
  s_lock: "The lock in front of {who} is the same make as the one that never opened (“{a}”).",
  l_rooftop: "{who} sees it again: “{a}”. This time it's inside.",
  l_signal: "{who}'s warning signal (“{a}”) goes off somewhere {who} isn't.",
  l_quiet: "The city goes quiet. Completely. {who} knows what that means: “{a}”.",
  l_missed: "{who} misses something again. Tell them only after the next pull.",
  b_variable: "The variable {who} couldn't account for (“{a}”) just happened.",
  b_expendable: "The goon {who} marked as expendable (“{a}”) finds the plan.",
  b_blueprints: "There's a room on the blueprints that's been drawn in by hand. Not by {who}. Not by whoever supplied them (“{a}”).",
  b_secret: "The part of the plan {who} kept to themselves (“{a}”) — the crew finds out the hard way.",
  t_blindspot: "The too-dark patch on the feed (“{a}”) is on {who}'s monitor now. It moves when they look away.",
  t_deleted: "The footage {who} deleted (“{a}”) is playing on every screen in the security room.",
  t_tapped: "{who}'s earpiece clicks. Someone else is on the channel, breathing.",
  t_gadget: "{who}'s gadget (“{a}”) works perfectly. For the other side.",
  g_missed: "{who} raises the gun at a shape in the dark. Same as last time (“{a}”). Pull to fire. Hitting is another matter.",
  g_light: "Both of {who}'s flashlights die at the same moment.",
  g_never: "The one person {who} would never shoot (“{a}”) — put them, or their voice, in the line of fire.",
  d_injuries: "The crew finds a guard with exactly the injuries {who} keeps seeing: “{a}”. Fresh.",
  d_hands: "{who}'s hands start shaking. Pull to keep them steady enough to work.",
  d_crew: "What {who} promised not to tell (“{a}”) — someone on the crew asks about it. Now.",
  i_door: "The door {who} could never get through (“{a}”) is standing open.",
  i_rat: "{who} finds a note in their own pocket: THANKS FOR THE TIP. Let someone else see it first.",
  i_nightshift: "What {who} noticed about the night shift (“{a}”) — tonight, it's different.",
  i_guilt: "The person on the inside {who} felt bad about (“{a}”) is here tonight. They shouldn't be.",
  r_advice: "The veterans' advice about working nights (“{a}”) turns out to be literal.",
  r_pocket: "{who}'s lucky charm (“{a}”) is gone. They hear it drop somewhere above them.",
  r_promise: "The only way out is the thing {who} promised they'd never do: “{a}”.",
  r_vouch: "{who} gets a text from the person who vouched for them (“{a}”): HOW'S IT GOING. It was sent an hour from now.",
};

// ---------- Beats: the building is wrong ----------

const BEATS = [
  "The lights on this floor go out. Count to ten out loud. When they come back, {who} is standing somewhere slightly different.",
  "{who}'s radio clicks, then another goon's voice says their name. That goon says they didn't.",
  "A door at the end of the hall closes. Softly. Nobody is near it.",
  "The rain on the skylight stops, as if something is covering it.",
  "A guard, out cold, zip-tied to a pipe. Neat work. Not the crew's.",
  "{who} notices a fresh scuff on the wall, eight feet up.",
  "The driver stops answering.",
  "Every monitor shows the same empty corridor. The timestamp is frozen.",
  "A heavy landing somewhere above. Then nothing at all.",
  "{who}'s weapon is gone. They had it a minute ago.",
  "Broken glass under a window — on the inside.",
  "{who} catches movement in a reflection. Nothing behind them.",
  "The planned exit is chained shut. The chain is new.",
  "A cold draft from a vent far too small for a person.",
  "The alarm should have gone off by now. It hasn't.",
  "{who} finds a crewmate's flashlight, still on, pointing at the ceiling.",
  "Somewhere in the building a phone starts ringing. It's the boss's ringtone.",
  "Footprints in the dust. They stop in the middle of the room.",
];

// When the tower falls. They're never found dead — just gone, or found later, neatly done.
const TAKEN = [
  "{who} steps into the dark to check a noise. A short sound — cloth, air — and their flashlight rolls back out alone.",
  "Mid-sentence, {who} goes silent on the radio. When the crew gets there: their gear in a tidy pile. No {who}.",
  "{who} is yanked upward into the dark. One shoe is left behind.",
  "The lights stutter. When they steady, {who} is gone. Their earpiece is still warm on the floor.",
  "The crew finds {who} later: alive, out cold, trussed up and hanging upside down from the stairwell rail.",
  "{who} turns a corner a step ahead of the others. By the time they follow, the corridor is empty and the far window is open.",
];

const MOODS = [
  [0, "steady"],
  [12, "leaning"],
  [22, "groaning"],
  [32, "any second now"],
];

// ---------- Rendering ----------

function crew() {
  return typeof allDossiers === "function" ? allDossiers().filter((d) => !d.withdrawn) : [];
}

function nameOf(d) {
  return d.alias || d.characterName || "the new guy";
}

function fill(template, d, answer = "") {
  // Trailing full stops would double up against the template's own punctuation.
  const clean = answer.trim().replace(/[.\s]+$/, "");
  const short = clean.length > 160 ? clean.slice(0, 157).trimEnd() + "…" : clean;
  return template.replaceAll("{who}", nameOf(d)).replaceAll("{a}", short);
}

function renderNight() {
  const list = crew();
  if (!list.some((d) => d.id === night.focus)) night.focus = list[0] ? list[0].id : null;

  // Tower gauge
  $("#pull-total").textContent = night.sinceBuild;
  const mood = MOODS.filter(([n]) => night.sinceBuild >= n).pop()[1];
  $("#tower-mood").textContent = `the tower is ${mood}`;
  $("#tower-gauge span").style.width = Math.min(100, (night.sinceBuild / 40) * 100) + "%";

  // Crew rows
  $("#night-crew").replaceChildren(
    ...(list.length
      ? list.map((d) => {
          const taken = night.status[d.id] === "taken";
          const role = roleById(d.role);
          return el(
            "li",
            { class: "night-row" + (taken ? " taken" : "") + (d.id === night.focus ? " focus" : "") },
            el(
              "button",
              { type: "button", class: "night-who", onclick: () => ((night.focus = d.id), saveNight(), renderNight()) },
              el("strong", { text: nameOf(d) }),
              el("small", { text: `${role ? role.title : d.role} · ${night.pulls[d.id] || 0} pulls` })
            ),
            taken
              ? el("button", { type: "button", class: "btn btn-small btn-ghost", onclick: () => setTaken(d, false) }, "Bring back")
              : [
                  el("button", { type: "button", class: "btn btn-small", onclick: () => pullBlock(d), "aria-label": `${nameOf(d)} pulls a block` }, "Pull"),
                  el("button", { type: "button", class: "btn btn-small btn-ghost", onclick: () => setTaken(d, true) }, "It fell"),
                ]
          );
        })
      : [el("li", { class: "hint", text: "No crew yet. Pull files on the Case files tab first." })])
  );

  renderHooks(list.find((d) => d.id === night.focus));
  renderMomentControls(list.filter((d) => night.status[d.id] !== "taken"));
}

function renderHooks(d) {
  $("#hooks-who").textContent = d ? `· ${nameOf(d)}` : "";
  if (!d) return $("#hooks").replaceChildren();
  const hooks = d.answers
    .filter((a) => a.a && TWISTS[a.id])
    .map((a) => el("li", {}, el("p", { class: "hook-q", text: a.q }), el("p", { class: "hook-twist", text: fill(TWISTS[a.id], d, a.a) })));
  $("#hooks").replaceChildren(...(hooks.length ? hooks : [el("li", { class: "hint", text: "They haven't given you much to work with. Yet." })]));
}

function showScene(title, text) {
  $("#scene").hidden = false;
  $("#scene-title").textContent = title;
  $("#scene-text").textContent = text;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------- Actions ----------

function pullBlock(d) {
  night.pulls[d.id] = (night.pulls[d.id] || 0) + 1;
  night.sinceBuild++;
  saveNight();
  renderNight();
}

function setTaken(d, taken) {
  if (taken) {
    if (!confirm(`The tower fell on ${nameOf(d)}? They're out.`)) return;
    night.status[d.id] = "taken";
    night.sinceBuild = 0;
    showScene(`${nameOf(d)} is gone`, fill(pick(TAKEN), d));
  } else {
    delete night.status[d.id];
  }
  saveNight();
  renderNight();
}

$("#btn-rebuild").addEventListener("click", () => {
  night.sinceBuild = 0;
  saveNight();
  renderNight();
});

$("#btn-new-night").addEventListener("click", () => {
  if (!confirm("Start a new night? Clears pulls and brings everyone back.")) return;
  Object.assign(night, { status: {}, pulls: {}, sinceBuild: 0, used: [] });
  $("#scene").hidden = true;
  saveNight();
  renderNight();
});

let lastBeat = -1;
$("#btn-beat").addEventListener("click", () => {
  const alive = crew().filter((d) => night.status[d.id] !== "taken");
  let i;
  do i = Math.floor(Math.random() * BEATS.length);
  while (i === lastBeat && BEATS.length > 1);
  lastBeat = i;
  $("#beat").textContent = fill(BEATS[i], alive.length ? pick(alive) : {});
});

// ---------- Moments: setup + turn + pull, built from a goon's answers ----------

const PLACES = [
  "the loading dock",
  "a stairwell with no lights",
  "the security office",
  "a maintenance crawlspace",
  "the vault antechamber",
  "the service elevator",
  "the roof access corridor",
  "a storage room full of covered furniture",
  "the boiler room",
  "the long hallway on the top floor",
];

const SETUPS = [
  "{who} is alone in {place}. The rest of the crew is a floor away.",
  "{who} and {other} are working {place}. The radio has been quiet for too long.",
  "The crew splits up. {who} takes {place}.",
  "{place}. The lights are on a timer, and the timer just ran out. {who} is closest to the switch.",
  "{who} is the last one through {place}. The door swings shut behind them.",
  "{who} stops in {place} to catch their breath. {other} keeps going without them.",
];

const MOMENT_KINDS = {
  scare: {
    label: "Scare",
    questions: Object.keys(TWISTS),
    turns: null, // uses that question's twist line
    fallback: "Something in {place} knows what {who} told the boss: “{a}”. It's here, and it's waiting.",
    pulls: [
      "Pull to hold it together. Refuse, and {who} runs — and ends up somewhere the crew can't follow.",
      "Pull to keep looking. Refuse, and {who} looks away; when they look back, something has moved.",
      "Pull to stay quiet. Refuse, and {who} cries out; everyone in the building now knows where the crew is.",
    ],
  },
  split: {
    label: "Turn the crew",
    questions: ["l_trust", "b_expendable", "m_bullet", "d_crew", "g_owed", "r_hero", "i_rat", "b_secret", "b_lastcrew", "r_lie", "g_never"],
    turns: [
      "{other} finds out what {who} said: “{a}”.",
      "{other} asks {who}, face to face, about “{a}”. Everyone else goes quiet.",
      "Something in the dark makes sure {other} hears it: “{a}”. It's {who}'s secret.",
    ],
    fallback: "{other} gets hold of {who}'s personnel file and reads it: “{a}”.",
    pulls: [
      "{who} pulls to talk {other} down. Refuse, and the two of them split up for the rest of the job.",
      "{other} pulls to trust {who} anyway. Refuse, and {other} won't watch {who}'s back again tonight.",
    ],
  },
  temptation: {
    label: "Temptation",
    questions: ["p_cut", "b_life", "i_after", "r_money", "s_kept", "p_home", "w_teacher"],
    turns: [
      "{who} finds a way out that leaves everyone else behind. It would take care of “{a}”.",
      "An unlocked side door, and a bag nobody has counted. Enough for “{a}”. Only {who} has seen it.",
      "{who}'s phone lights up: a clean exit, right now, if they ditch the crew. The message mentions “{a}”.",
    ],
    fallback: "{who} is offered a way out. The voice on the line knows about “{a}”.",
    pulls: [
      "Pull to walk away from it. Refuse, and {who} takes it — the crew finds out at the worst possible moment.",
      "Pull to tell the crew. Refuse, and {who} keeps it to themselves — and owes something in the dark a favour.",
    ],
  },
  closecall: {
    label: "Close call",
    questions: ["w_route", "l_signal", "s_roll", "t_backdoor", "t_alarm", "t_gadget", "g_gun", "m_weapon", "d_bag", "w_glovebox", "i_name", "r_pocket", "s_lock"],
    turns: [
      "Everything comes down to {who} and “{a}”. It has to work, right now.",
      "{who} reaches for the thing they always count on (“{a}”) — and it isn't where they left it.",
      "{other} is cornered. Only {who}'s “{a}” can get them out.",
    ],
    fallback: "It all comes down to {who} — and what they told the boss: “{a}”.",
    pulls: [
      "Pull to pull it off. Refuse, and someone else has to cover — {other} pulls instead, or it fails.",
      "Pull once to try, twice to do it quietly. Stop after one and it works — loudly.",
    ],
  },
};

night.kind = night.kind || "scare";
night.used = night.used || [];

function renderMomentControls(alive) {
  $("#moment-kinds").replaceChildren(
    ...Object.entries(MOMENT_KINDS).map(([k, v]) =>
      el(
        "button",
        {
          type: "button",
          role: "radio",
          class: "kind" + (night.kind === k ? " on" : ""),
          "aria-checked": String(night.kind === k),
          onclick: () => ((night.kind = k), saveNight(), renderMomentControls(crew().filter((d) => night.status[d.id] !== "taken"))),
        },
        v.label
      )
    )
  );
  const sel = $("#moment-target");
  const keep = sel.value;
  sel.replaceChildren(el("option", { value: "", text: "Anyone still in" }), ...alive.map((d) => el("option", { value: d.id, text: nameOf(d) })));
  if (alive.some((d) => d.id === keep)) sel.value = keep;
}

function fillMoment(template, ctx) {
  const text = fill(template, ctx.who, ctx.answer)
    .replaceAll("{other}", ctx.other ? nameOf(ctx.other) : "the boss")
    .replaceAll("{place}", ctx.place);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function makeMoment() {
  const alive = crew().filter((d) => night.status[d.id] !== "taken");
  if (!alive.length) return showMoment(null, "Nobody's left in the building.");
  const chosen = alive.find((d) => d.id === $("#moment-target").value);
  const kind = MOMENT_KINDS[night.kind];

  // Candidate answers: this kind's questions first, any answer as a fallback. Fresh ones before reused ones.
  const people = chosen ? [chosen] : alive;
  const all = people.flatMap((d) => d.answers.filter((a) => a.a && a.id !== FINAL_QUESTION.id).map((a) => ({ d, a })));
  const fit = all.filter(({ a }) => kind.questions.includes(a.id));
  const pool = fit.length ? fit : all;
  if (!pool.length) return showMoment(null, "They haven't written anything to use yet.");
  const fresh = pool.filter(({ d, a }) => !night.used.includes(`${d.id}:${a.id}`));
  const { d: who, a } = pick(fresh.length ? fresh : pool);
  night.used.push(`${who.id}:${a.id}`);
  saveNight();

  const others = alive.filter((x) => x.id !== who.id);
  const ctx = { who, answer: a.a, q: a.q, other: others.length ? pick(others) : null, place: pick(PLACES) };
  let turn;
  if (!fit.length) turn = kind.fallback;
  else if (kind.turns) turn = pick(kind.turns);
  else turn = TWISTS[a.id];

  showMoment({
    setup: fillMoment(pick(SETUPS.filter((s) => ctx.other || !s.includes("{other}"))), ctx),
    turn: fillMoment(turn, ctx),
    pull: fillMoment(pick(kind.pulls), ctx),
    source: `From ${nameOf(who)}'s answer to “${a.q}”`,
  });
}

function showMoment(m, empty) {
  $("#moment").hidden = false;
  $("#moment-setup").textContent = m ? m.setup : empty;
  $("#moment-turn").textContent = m ? m.turn : "";
  $("#moment-pull").textContent = m ? m.pull : "";
  $("#moment-source").textContent = m ? m.source : "";
  for (const n of document.querySelectorAll("#moment .moment-label, #moment-turn, #moment-pull")) n.hidden = !m;
}

$("#btn-moment").addEventListener("click", makeMoment);

// ---------- Tabs ----------

function showTab(tab) {
  $("#files-view").hidden = tab !== "files";
  $("#night-view").hidden = tab !== "night";
  for (const b of document.querySelectorAll(".gm-tab")) b.setAttribute("aria-current", String(b.dataset.tab === tab));
  store(TAB_KEY, tab);
}
for (const b of document.querySelectorAll(".gm-tab")) b.addEventListener("click", () => showTab(b.dataset.tab));

showTab(store(TAB_KEY) || "files");
renderNight();
