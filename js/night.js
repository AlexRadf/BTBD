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
    sound("snap");
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
  Object.assign(night, { status: {}, pulls: {}, sinceBuild: 0 });
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

// ---------- Ambience (synthesised, no audio files) ----------

let ctx, master;
const loops = {};

function audio() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = +$("#volume").value;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function noiseBuffer(seconds = 2) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function noise(seconds) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(seconds);
  return src;
}

function chain(...nodes) {
  nodes.reduce((a, b) => (a.connect(b), b));
  return nodes[nodes.length - 1];
}

function envelope(attack, hold, release, peak = 1) {
  const g = ctx.createGain();
  const t = ctx.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.setValueAtTime(peak, t + attack + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
  return g;
}

const LOOPS = {
  rain() {
    const src = noise(4);
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1800;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 300;
    const g = ctx.createGain();
    g.gain.value = 0.35;
    chain(src, hp, lp, g, master);
    src.start();
    return () => src.stop();
  },
  hum() {
    const g = ctx.createGain();
    g.gain.value = 0.12;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 220;
    chain(lp, g, master);
    const oscs = [55, 55.4, 110.3].map((f) => {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f;
      o.connect(lp);
      o.start();
      return o;
    });
    return () => oscs.forEach((o) => o.stop());
  },
};

function thudAt(when, gain = 0.9, freq = 70) {
  const o = ctx.createOscillator();
  o.frequency.setValueAtTime(freq, ctx.currentTime + when);
  o.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + when + 0.4);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.setValueAtTime(0.0001, ctx.currentTime + when);
  g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + when + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + when + 0.5);
  chain(o, g, master);
  o.start(ctx.currentTime + when);
  o.stop(ctx.currentTime + when + 0.6);
}

const SHOTS = {
  thud() {
    thudAt(0, 1, 60);
    const n = noise(1);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 400;
    chain(n, lp, envelope(0.005, 0.02, 0.6, 0.5), master);
    n.start();
  },
  steps() {
    let t = 0;
    for (let i = 0; i < 6; i++) {
      t += 0.45 + Math.random() * 0.15;
      thudAt(t, 0.35 - i * 0.04, 90);
    }
  },
  creak() {
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    const t = ctx.currentTime;
    o.frequency.setValueAtTime(70, t);
    o.frequency.linearRampToValueAtTime(110, t + 0.8);
    o.frequency.linearRampToValueAtTime(60, t + 1.8);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 900;
    bp.Q.value = 12;
    chain(o, bp, envelope(0.2, 1.2, 0.6, 0.5), master);
    o.start();
    o.stop(t + 2.2);
  },
  static() {
    const n = noise(2);
    const hp = ctx.createBiquadFilter();
    hp.type = "bandpass";
    hp.frequency.value = 2500;
    hp.Q.value = 0.7;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0, t);
    for (let i = 0; i < 14; i++) g.gain.setValueAtTime(Math.random() < 0.6 ? 0.25 : 0.02, t + i * 0.1);
    g.gain.setValueAtTime(0, t + 1.5);
    chain(n, hp, g, master);
    n.start();
  },
  snap() {
    // Two quick rushes of air, like heavy fabric pulled taut.
    [0, 0.12].forEach((delay, i) => {
      const n = noise(0.5);
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1200 - i * 400;
      bp.Q.value = 0.9;
      const g = ctx.createGain();
      const t = ctx.currentTime + delay;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.8, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      chain(n, bp, g, master);
      n.start(t);
    });
  },
};

function sound(name) {
  try {
    audio();
    SHOTS[name]();
  } catch (err) {
    console.error(err);
  }
}

for (const b of document.querySelectorAll("[data-shot]")) b.addEventListener("click", () => sound(b.dataset.shot));

for (const b of document.querySelectorAll("[data-loop]")) {
  b.addEventListener("click", () => {
    audio();
    const name = b.dataset.loop;
    if (loops[name]) {
      loops[name]();
      delete loops[name];
    } else {
      loops[name] = LOOPS[name]();
    }
    b.classList.toggle("on", !!loops[name]);
    b.setAttribute("aria-pressed", String(!!loops[name]));
  });
}

$("#volume").addEventListener("input", (e) => {
  if (master) master.gain.value = +e.target.value;
});

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
