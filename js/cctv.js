// Building security monitor: looping CCTV feeds drawn on a canvas.
// Each camera is a scene drawn in code; set a `src` in CONFIG.CCTV to use a real video
// clip instead (it gets the same grain, timestamp and glitches).

(() => {
  const root = document.getElementById("monitor");
  if (!root) return;

  const W = 320;
  const H = 240;
  const canvas = root.querySelector("canvas");
  const g = canvas.getContext("2d");
  canvas.width = W;
  canvas.height = H;

  const rand = (a, b) => a + Math.random() * (b - a);
  const lerp = (a, b, t) => a + (b - a) * t;
  const grey = (v, a = 1) => `rgba(${v},${v + 4},${v},${a})`;

  function layer(draw) {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    draw(c.getContext("2d"));
    return c;
  }

  function poly(c, pts, fill) {
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    for (const [x, y] of pts.slice(1)) c.lineTo(x, y);
    c.closePath();
    c.fillStyle = fill;
    c.fill();
  }

  // A dark human shape. `hunch` folds it into a crouch.
  function figure(c, x, y, h, shade = 14, hunch = 0) {
    c.fillStyle = grey(shade);
    const w = h * 0.28;
    c.beginPath();
    c.ellipse(x, y - h + w * 0.45, w * 0.36, w * 0.42, 0, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.moveTo(x - w * 0.55, y - h + w * 0.95);
    c.lineTo(x + w * 0.55, y - h + w * 0.95);
    c.lineTo(x + w * (0.45 + hunch), y);
    c.lineTo(x - w * (0.45 + hunch), y);
    c.closePath();
    c.fill();
  }

  // ---------- Scenes ----------

  const corridor = (() => {
    const vx = 160, top = 92, bot = 128, bl = 128, br = 192;
    const L = (d, f) => [lerp(0, bl, d), lerp(lerp(240, bot, d), lerp(0, top, d), f)];
    const R = (d, f) => [lerp(W, br, d), lerp(lerp(240, bot, d), lerp(0, top, d), f)];
    const base = layer((c) => {
      c.fillStyle = grey(30);
      c.fillRect(0, 0, W, H);
      poly(c, [[0, 0], [W, 0], [br, top], [bl, top]], grey(22)); // ceiling
      poly(c, [[0, 240], [W, 240], [br, bot], [bl, bot]], grey(44)); // floor
      poly(c, [[0, 0], [bl, top], [bl, bot], [0, 240]], grey(36)); // left wall
      poly(c, [[W, 0], [br, top], [br, bot], [W, 240]], grey(32)); // right wall
      c.fillStyle = grey(12);
      c.fillRect(bl, top, br - bl, bot - top); // far end
      c.fillStyle = grey(26);
      c.fillRect(vx - 7, top + 8, 14, bot - top - 8); // far door
      // floor sheen
      const sheen = c.createLinearGradient(0, 240, 0, bot);
      sheen.addColorStop(0, "rgba(255,255,255,0.05)");
      sheen.addColorStop(1, "rgba(255,255,255,0.12)");
      poly(c, [[110, 240], [210, 240], [vx + 6, bot], [vx - 6, bot]], sheen);
      // doors
      for (const [d1, d2] of [[0.12, 0.3], [0.45, 0.58], [0.72, 0.8]]) {
        poly(c, [L(d1, 0), L(d2, 0), L(d2, 0.72), L(d1, 0.72)], grey(20));
        poly(c, [R(d1 + 0.05, 0), R(d2 + 0.05, 0), R(d2 + 0.05, 0.72), R(d1 + 0.05, 0.72)], grey(18));
      }
      // exit sign
      c.fillStyle = grey(120);
      c.fillRect(vx - 6, top + 2, 12, 4);
    });
    const lights = [0.08, 0.32, 0.55, 0.75];
    return {
      label: "CORRIDOR 3F",
      draw(c, t, ev) {
        c.drawImage(base, 0, 0);
        lights.forEach((d, i) => {
          const y = lerp(0, top, d) + 2;
          const w = lerp(70, 10, d);
          let on = 1;
          if (i === 1) on = Math.sin(t * 13) > 0.92 || Math.sin(t * 0.7) < -0.95 ? 0.3 : 1; // the bad tube
          if (ev && ev.kind === "dark" && i >= ev.from) on = 0.08;
          c.fillStyle = grey(200, 0.85 * on);
          c.fillRect(vx - w / 2, y, w, lerp(5, 1, d));
          const glow = c.createRadialGradient(vx, y, 1, vx, y + 20, lerp(90, 20, d));
          glow.addColorStop(0, `rgba(255,255,240,${0.16 * on})`);
          glow.addColorStop(1, "rgba(0,0,0,0)");
          c.fillStyle = glow;
          c.fillRect(0, 0, W, H);
        });
        if (ev && ev.kind === "dark") {
          c.fillStyle = "rgba(0,0,0,0.55)";
          c.fillRect(0, 0, W, H);
        }
        if (ev && ev.kind === "walker") {
          // Someone at the far end, stepping out of a doorway and back.
          const p = Math.sin(Math.PI * Math.min(1, (t - ev.start) / ev.length));
          figure(c, vx + 2, bot - 1, 26, 8, 0);
          c.fillStyle = grey(12);
          c.fillRect(vx + 7 - 10 * (1 - p), top + 6, 10 * (1 - p) + 2, bot - top - 6);
        }
      },
      events: [
        { kind: "dark", length: 2.4, setup: (e) => (e.from = Math.random() < 0.5 ? 2 : 1) },
        { kind: "walker", length: 3.2 },
      ],
    };
  })();

  const office = (() => {
    const winTop = 22, winBot = 92;
    const skyline = [];
    for (let x = 0; x < W; ) {
      const w = rand(14, 34);
      skyline.push({ x, w, h: rand(18, 60), lit: Array.from({ length: 6 }, () => Math.random() < 0.25) });
      x += w + rand(1, 4);
    }
    const base = layer((c) => {
      c.fillStyle = grey(26);
      c.fillRect(0, 0, W, H);
      // window wall
      c.fillStyle = grey(8);
      c.fillRect(0, winTop, W, winBot - winTop);
      for (const b of skyline) {
        c.fillStyle = grey(18);
        c.fillRect(b.x, winBot - b.h, b.w, b.h);
        b.lit.forEach((on, i) => {
          if (!on) return;
          c.fillStyle = grey(110, 0.8);
          c.fillRect(b.x + 3 + (i % 3) * (b.w / 3.4), winBot - b.h + 5 + Math.floor(i / 3) * 9, 3, 3);
        });
      }
      c.fillStyle = grey(30);
      for (let x = 0; x <= W; x += 64) c.fillRect(x - 2, winTop, 4, winBot - winTop); // mullions
      // floor
      poly(c, [[0, winBot], [W, winBot], [W, H], [0, H]], grey(38));
      // desks: three rows in perspective
      [[104, 0.55], [140, 0.75], [188, 1]].forEach(([y, s]) => {
        for (let i = 0; i < 4; i++) {
          const x = 20 + i * 78 * s + (1 - s) * 60;
          poly(c, [[x, y], [x + 60 * s, y], [x + 66 * s, y + 14 * s], [x - 6 * s, y + 14 * s]], grey(56));
          c.fillStyle = grey(20);
          c.fillRect(x + 18 * s, y - 16 * s, 24 * s, 15 * s); // monitor
          c.fillRect(x + 28 * s, y - 2 * s, 4 * s, 3 * s);
        }
      });
    });
    const drops = Array.from({ length: 40 }, () => ({ x: rand(0, W), y: rand(winTop, winBot), v: rand(40, 70) }));
    return {
      label: "OPEN PLAN 4F",
      draw(c, t, ev) {
        c.drawImage(base, 0, 0);
        // rain on the glass
        c.strokeStyle = grey(140, 0.25);
        c.lineWidth = 1;
        c.beginPath();
        for (const d of drops) {
          const y = winTop + ((d.y - winTop + t * d.v) % (winBot - winTop));
          c.moveTo(d.x, y);
          c.lineTo(d.x - 1, y + 4);
        }
        c.stroke();
        // one monitor left on
        const glowOn = !(ev && ev.kind === "monitor") || Math.sin(t * 40) > 0;
        c.fillStyle = grey(glowOn ? 150 : 40, 0.9);
        c.fillRect(20 + 78 * 2 * 0.75 + 15 + 18 * 0.75, 140 - 16 * 0.75 + 1, 24 * 0.75 - 2, 15 * 0.75 - 2);
        // the chair
        const turn = ev && ev.kind === "chair" ? Math.sin(Math.PI * Math.min(1, (t - ev.start) / ev.length)) * 9 : 0;
        c.fillStyle = grey(16);
        c.beginPath();
        c.ellipse(98, 214, 13, 6, 0, 0, Math.PI * 2);
        c.fill();
        c.fillRect(90 + turn, 194, 16, 18);
        // something passing the window
        if (ev && ev.kind === "window") {
          const p = (t - ev.start) / ev.length;
          c.fillStyle = grey(4, 0.9);
          c.beginPath();
          c.ellipse(lerp(-30, W + 30, p), winTop + 18 + Math.sin(p * 6) * 4, 22, 9, 0.2, 0, Math.PI * 2);
          c.fill();
        }
      },
      events: [
        { kind: "chair", length: 4 },
        { kind: "monitor", length: 1.6 },
        { kind: "window", length: 0.45, rare: true },
      ],
    };
  })();

  const lobby = (() => {
    const base = layer((c) => {
      c.fillStyle = grey(30);
      c.fillRect(0, 0, W, H);
      // glass front, street beyond
      c.fillStyle = grey(12);
      c.fillRect(60, 40, 200, 90);
      const street = c.createRadialGradient(210, 70, 2, 210, 70, 70);
      street.addColorStop(0, "rgba(255,240,200,0.35)");
      street.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = street;
      c.fillRect(60, 40, 200, 90);
      c.fillStyle = grey(34);
      for (let x = 60; x <= 260; x += 50) c.fillRect(x - 2, 40, 4, 90);
      // floor
      poly(c, [[0, 130], [W, 130], [W, H], [0, H]], grey(48));
      c.strokeStyle = grey(56);
      for (let i = -6; i < 12; i++) {
        c.beginPath();
        c.moveTo(160 + i * 18, 130);
        c.lineTo(160 + i * 60, H);
        c.stroke();
      }
      // reception desk
      poly(c, [[192, 158], [312, 150], [312, 204], [192, 214]], grey(20)); // counter front
      poly(c, [[186, 152], [312, 143], [318, 150], [192, 158]], grey(72)); // counter top
      c.fillStyle = grey(30);
      for (let x = 210; x < 310; x += 24) c.fillRect(x, 160, 2, 46); // panelling
      // plant
      c.fillStyle = grey(18);
      c.fillRect(24, 168, 22, 26);
      c.beginPath();
      c.ellipse(35, 156, 20, 22, 0, 0, Math.PI * 2);
      c.fill();
    });
    return {
      label: "LOBBY",
      draw(c, t, ev) {
        c.drawImage(base, 0, 0);
        // the guard's empty chair, and the screen at the desk
        c.fillStyle = grey(16);
        c.fillRect(250, 120, 14, 18);
        c.fillStyle = grey(120, 0.6 + Math.sin(t * 3) * 0.1);
        c.fillRect(230, 128, 12, 8);
        if (ev && ev.kind === "outside") {
          // someone standing at the glass, looking in
          figure(c, 110, 128, 54, 6);
        }
        if (ev && ev.kind === "door") {
          c.fillStyle = "rgba(255,255,255,0.07)";
          c.fillRect(160, 40, 50, 90);
        }
      },
      events: [
        { kind: "outside", length: 2.2, rare: true },
        { kind: "door", length: 3 },
      ],
    };
  })();

  const roof = (() => {
    const base = layer((c) => {
      const sky = c.createLinearGradient(0, 0, 0, 150);
      sky.addColorStop(0, grey(14));
      sky.addColorStop(0.6, grey(42));
      sky.addColorStop(1, grey(70)); // the city's glow on low cloud
      c.fillStyle = sky;
      c.fillRect(0, 0, W, H);
      // distant towers
      for (let x = 0; x < W; ) {
        const w = rand(16, 40);
        const h = rand(20, 80);
        c.fillStyle = grey(30);
        c.fillRect(x, 150 - h, w, h);
        for (let k = 0; k < 4; k++) {
          if (Math.random() < 0.3) {
            c.fillStyle = grey(110, 0.7);
            c.fillRect(x + 3 + rand(0, w - 6), 150 - h + 4 + rand(0, h - 8), 2, 2);
          }
        }
        x += w + rand(2, 10);
      }
      // water tower
      c.fillStyle = grey(10);
      c.fillRect(226, 70, 52, 46);
      poly(c, [[222, 70], [282, 70], [252, 52]], grey(10));
      c.strokeStyle = grey(10);
      c.lineWidth = 3;
      for (const x of [232, 272]) {
        c.beginPath();
        c.moveTo(x, 116);
        c.lineTo(x + (x < 250 ? -6 : 6), 166);
        c.stroke();
      }
      // roof surface and ledge
      poly(c, [[0, 160], [W, 150], [W, H], [0, H]], grey(28));
      c.fillStyle = grey(46);
      c.fillRect(0, 154, W, 6);
      // access door
      c.fillStyle = grey(26);
      c.fillRect(30, 104, 50, 60);
      c.fillStyle = grey(14);
      c.fillRect(44, 120, 22, 44);
    });
    return {
      label: "ROOF ACCESS",
      draw(c, t, ev) {
        c.drawImage(base, 0, 0);
        // bulb over the door
        const glow = c.createRadialGradient(55, 112, 1, 55, 120, 46);
        glow.addColorStop(0, `rgba(255,240,200,${0.25 + Math.sin(t * 2.3) * 0.03})`);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = glow;
        c.fillRect(0, 60, 140, 120);
        // rain
        c.strokeStyle = grey(160, 0.18);
        c.beginPath();
        for (let i = 0; i < 60; i++) {
          const x = (i * 53.3 + t * 30) % W;
          const y = (i * 97.1 + t * 220) % H;
          c.moveTo(x, y);
          c.lineTo(x - 2, y + 7);
        }
        c.stroke();
        if (ev && ev.kind === "perch") {
          // A crouched shape on top of the water tower. There, then not.
          figure(c, 252, 54, 22, 4, 0.9);
          poly(c, [[244, 46], [262, 46], [268, 66], [238, 66]], grey(4));
        }
      },
      events: [{ kind: "perch", length: 1.4, rare: true }],
    };
  })();

  // ---------- Feeds ----------

  const SCENES = [lobby, corridor, office, roof];
  const custom = (typeof CONFIG !== "undefined" && Array.isArray(CONFIG.CCTV) && CONFIG.CCTV) || [];
  const feeds = SCENES.map((scene, i) => {
    const feed = { scene, label: (custom[i] && custom[i].label) || scene.label, ev: null, next: rand(6, 18) };
    if (custom[i] && custom[i].src) {
      const v = document.createElement("video");
      Object.assign(v, { muted: true, loop: true, playsInline: true, autoplay: true, src: custom[i].src });
      v.addEventListener("error", () => (feed.video = null));
      feed.video = v;
    }
    return feed;
  });

  // ---------- Post-processing ----------

  const noise = Array.from({ length: 6 }, () =>
    layer((c) => {
      const img = c.createImageData(W, H);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 34;
      }
      c.putImageData(img, 0, 0);
    })
  );
  const snow = Array.from({ length: 3 }, () =>
    layer((c) => {
      const img = c.createImageData(W, H);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      c.putImageData(img, 0, 0);
    })
  );
  const vignette = layer((c) => {
    const v = c.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.85);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,0.7)");
    c.fillStyle = v;
    c.fillRect(0, 0, W, H);
  });

  const pad = (n) => String(n).padStart(2, "0");
  function stamp(d) {
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${d.getFullYear()}  ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  // Every night at 2:13 the building goes wrong.
  function witchingMinute(d) {
    return d.getHours() === 2 && d.getMinutes() === 13;
  }

  let current = 0;
  let switchUntil = 0;
  let auto = true;
  let lastAutoSwitch = 0;
  let visible = true;

  function setChannel(i, byUser) {
    current = (i + feeds.length) % feeds.length;
    switchUntil = performance.now() / 1000 + 0.28;
    if (byUser) auto = false;
    for (const b of root.querySelectorAll("[data-cam]")) b.setAttribute("aria-pressed", String(+b.dataset.cam === current));
    const f = feeds[current];
    root.querySelector(".monitor-label").textContent = `CAM ${pad(current + 1)} · ${f.label}`;
  }

  function frame(now) {
    const t = now / 1000;
    const d = new Date();
    const f = feeds[current];

    // events tick on every camera, watched or not
    for (const feed of feeds) {
      if (feed.ev && t > feed.ev.start + feed.ev.length) feed.ev = null;
      if (!feed.ev && t > feed.next) {
        const pool = feed.scene.events.filter((e) => !e.rare || Math.random() < 0.35);
        if (pool.length) {
          const e = { ...pool[Math.floor(Math.random() * pool.length)], start: t };
          if (e.setup) e.setup(e);
          feed.ev = e;
        }
        feed.next = t + rand(14, 40);
      }
    }

    if (auto && t - lastAutoSwitch > 11) {
      lastAutoSwitch = t;
      setChannel(current + 1);
    }

    g.save();
    if (Math.random() < 0.02) g.translate(rand(-2, 2), 0);
    if (t < switchUntil) {
      g.drawImage(snow[Math.floor(Math.random() * snow.length)], 0, 0);
    } else if (witchingMinute(d) && f.scene !== roof) {
      g.drawImage(snow[Math.floor(Math.random() * snow.length)], 0, 0);
      g.fillStyle = "rgba(0,0,0,0.7)";
      g.fillRect(90, 106, 140, 26);
      g.fillStyle = "#ddd";
      g.font = "bold 14px monospace";
      g.textAlign = "center";
      g.fillText("SIGNAL LOST", W / 2, 124);
      g.textAlign = "left";
    } else {
      if (f.video && f.video.readyState >= 2) g.drawImage(f.video, 0, 0, W, H);
      else f.scene.draw(g, t, witchingMinute(d) ? { kind: "perch", start: t, length: 1 } : f.ev);
      // rolling tracking band
      const y = (t * 22) % (H + 40) - 20;
      g.fillStyle = "rgba(255,255,255,0.04)";
      g.fillRect(0, y, W, 14);
      g.drawImage(noise[Math.floor(Math.random() * noise.length)], 0, 0);
      g.drawImage(vignette, 0, 0);
    }
    g.restore();

    // overlay text
    g.font = "10px monospace";
    g.fillStyle = "rgba(230,235,225,0.85)";
    g.fillText(`CAM ${pad(current + 1)}  ${f.label}`, 8, 16);
    g.fillText(stamp(d), 8, H - 10);
    if (Math.floor(t * 1.2) % 2 === 0) {
      g.fillStyle = "rgba(220,40,30,0.9)";
      g.beginPath();
      g.arc(W - 40, 12, 3.5, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = "rgba(230,235,225,0.85)";
    g.fillText("REC", W - 32, 16);
  }

  // ~12 frames a second: security footage, not cinema.
  let last = 0;
  function loop(now) {
    if (visible && now - last > 80) {
      last = now;
      frame(now);
    }
    requestAnimationFrame(loop);
  }

  for (const b of root.querySelectorAll("[data-cam]")) b.addEventListener("click", () => setChannel(+b.dataset.cam, true));
  root.querySelector("[data-auto]").addEventListener("click", () => {
    auto = true;
    lastAutoSwitch = performance.now() / 1000;
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
  }
  setChannel(0);
  requestAnimationFrame(loop);
})();
