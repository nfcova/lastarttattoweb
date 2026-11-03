/* ==========================================================================
   LASTART TATTOO — Intro sequence
   A rotary tattoo machine "inks" LASTART TATTOO with SVG stroke animation.
   The machine tip is driven by the exact point currently being drawn
   (getPointAtLength), so needle and line stay perfectly in sync.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var intro = document.getElementById('intro');
  if (!intro) return;

  var cfg = (window.LASTART_CONFIG && window.LASTART_CONFIG.intro) || {};
  var STORAGE_KEY = 'lastart:intro';

  function markSeen() {
    if (cfg.oncePerSession === false) return;
    try { sessionStorage.setItem(STORAGE_KEY, 'seen'); } catch (e) {}
  }

  function readyPage() {
    document.body.classList.add('is-ready');
    document.dispatchEvent(new CustomEvent('lastart:ready'));
  }

  // Intro disabled, already seen this session, or reduced motion → skip.
  if (cfg.enabled === false) { root.classList.remove('intro-play'); root.classList.add('intro-skip'); }
  if (!root.classList.contains('intro-play')) {
    intro.classList.add('is-gone');
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { requestAnimationFrame(readyPage); });
    } else { requestAnimationFrame(readyPage); }
    return;
  }

  /* ------------------------------------------------------------------ *
   * Monoline geometric alphabet (cap height 100, local units).
   * Each letter: width + list of strokes in natural hand order.
   * ------------------------------------------------------------------ */
  var GLYPHS = {
    L: { w: 55, d: ['M0 0 V100 H55'] },
    A: { w: 70, d: ['M0 100 L35 0 L70 100', 'M15 63 H55'] },
    S: { w: 58, d: ['M54 17 C49 6 40 0 29 0 C15 0 4 8 4 24 C4 40 18 45 30 48 C46 52 56 59 56 75 C56 91 44 100 29 100 C15 100 5 93 1 81'] },
    T: { w: 60, d: ['M0 0 H60', 'M30 0 V100'] },
    R: { w: 58, d: ['M0 100 V0 H30 C48 0 58 11 58 26 C58 41 48 52 30 52 H0', 'M30 52 L58 100'] },
    O: { w: 72, d: ['M36 0 C16 0 0 22 0 50 C0 78 16 100 36 100 C56 100 72 78 72 50 C72 22 56 0 36 0'] }
  };

  var LINES = [
    { text: 'LASTART', scale: 1, gap: 30, y: 108, stroke: 7 },
    { text: 'TATTOO', scale: 0.46, gap: 92, y: 262, stroke: 4 }
  ];
  var VIEW_W = 1000;
  var NS = 'http://www.w3.org/2000/svg';

  var svg = document.getElementById('intro-svg');
  var lettersGroup = document.getElementById('intro-letters');
  var machine = document.getElementById('machine');
  var skipBtn = document.getElementById('intro-skip');

  if (window.innerWidth < 700) lettersGroup.removeAttribute('filter'); // lighter on phones

  // Build strokes ---------------------------------------------------------
  var strokes = [];
  LINES.forEach(function (line) {
    var chars = line.text.split('');
    var width = chars.reduce(function (acc, c, i) { return acc + GLYPHS[c].w + (i ? line.gap : 0); }, 0);
    var x = (VIEW_W - width * line.scale) / 2;
    chars.forEach(function (c) {
      var g = GLYPHS[c];
      g.d.forEach(function (d) {
        var p = document.createElementNS(NS, 'path');
        p.setAttribute('d', d);
        p.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + line.y + ') scale(' + line.scale + ')');
        p.setAttribute('stroke-width', (line.stroke / line.scale).toFixed(2));
        p.style.visibility = 'hidden';
        lettersGroup.appendChild(p);
        var len = p.getTotalLength();
        p.style.strokeDasharray = len + ' ' + (len + 10);
        p.style.strokeDashoffset = len;
        strokes.push({ el: p, len: len, x: x, y: line.y, s: line.scale, rootLen: len * line.scale });
      });
      x += (g.w + line.gap) * line.scale;
    });
  });

  function rootPoint(st, l) {
    var pt = st.el.getPointAtLength(l);
    return { x: st.x + pt.x * st.s, y: st.y + pt.y * st.s };
  }

  // Timeline ---------------------------------------------------------------
  var DRAW_MS = 2500;      // pure inking time
  var ENTER_MS = 650;
  var totalInk = strokes.reduce(function (a, s) { return a + s.rootLen; }, 0);
  var speed = totalInk / DRAW_MS; // root units per ms

  var steps = [];
  var t = ENTER_MS;
  var prevEnd = null;
  strokes.forEach(function (st) {
    var start = rootPoint(st, 0);
    if (prevEnd) {
      var dist = Math.hypot(start.x - prevEnd.x, start.y - prevEnd.y);
      var travel = Math.min(120, Math.max(45, dist * 0.32));
      steps.push({ type: 'move', from: prevEnd, to: start, t0: t, t1: t + travel });
      t += travel;
    }
    var dur = st.rootLen / speed;
    steps.push({ type: 'ink', st: st, t0: t, t1: t + dur });
    t += dur;
    prevEnd = rootPoint(st, st.len);
  });
  var INK_END = t;
  var firstStart = rootPoint(strokes[0], 0);
  var enterFrom = { x: firstStart.x + 260, y: firstStart.y - 140 };
  var exitTo = { x: prevEnd.x + 360, y: prevEnd.y - 220 };

  function easeInOut(k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
  function easeOut(k) { return 1 - Math.pow(1 - k, 3); }
  function lerp(a, b, k) { return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }; }

  var tilt = 0, lastPos = null;
  function placeMachine(p, lift) {
    if (lastPos) {
      var targetTilt = Math.max(-7, Math.min(7, (p.x - lastPos.x) * 0.9));
      tilt += (targetTilt - tilt) * 0.18;
    }
    lastPos = p;
    var sc = 1 + (lift || 0) * 0.06;
    machine.setAttribute('transform', 'translate(' + p.x.toFixed(2) + ' ' + p.y.toFixed(2) + ') rotate(' + tilt.toFixed(2) + ') scale(' + sc.toFixed(3) + ')');
  }

  // Lifecycle --------------------------------------------------------------
  var raf = 0, t0 = 0, finished = false, timers = [];
  var inertTargets = [document.querySelector('header'), document.getElementById('main'), document.querySelector('footer')];

  function lock() {
    document.body.classList.add('is-locked');
    inertTargets.forEach(function (n) { if (n) n.inert = true; });
  }
  function unlock() {
    document.body.classList.remove('is-locked');
    inertTargets.forEach(function (n) { if (n) n.inert = false; });
  }

  function leave(fast) {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    timers.forEach(clearTimeout);
    markSeen();
    if (fast) {
      strokes.forEach(function (s) { s.el.style.visibility = 'visible'; s.el.style.strokeDashoffset = 0; });
      machine.style.opacity = 0;
      intro.classList.add('is-logo');
    }
    intro.classList.add('is-leaving');
    readyPage();
    unlock();
    setTimeout(function () {
      intro.classList.add('is-gone');
      intro.setAttribute('aria-hidden', 'true');
    }, fast ? 1000 : 1350);
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); leave(true); } }

  var logoShown = false;
  function frame(now) {
    if (!t0) t0 = now;
    var el = now - t0;

    if (el < ENTER_MS) {
      var k = easeOut(el / ENTER_MS);
      machine.style.opacity = Math.min(1, el / (ENTER_MS * 0.6));
      placeMachine(lerp(enterFrom, firstStart, k), 1 - k);
    } else if (el < INK_END) {
      for (var i = 0; i < steps.length; i++) {
        var s = steps[i];
        if (s.type === 'ink') {
          if (el >= s.t1) { s.st.el.style.visibility = 'visible'; s.st.el.style.strokeDashoffset = 0; continue; }
          if (el < s.t0) break;
          var kk = (el - s.t0) / (s.t1 - s.t0);
          var drawn = s.st.len * kk;
          s.st.el.style.visibility = 'visible';
          s.st.el.style.strokeDashoffset = s.st.len - drawn;
          machine.classList.add('is-inking');
          placeMachine(rootPoint(s.st, drawn), 0);
          break;
        } else {
          if (el >= s.t1) continue;
          if (el < s.t0) break;
          var km = easeInOut((el - s.t0) / (s.t1 - s.t0));
          machine.classList.remove('is-inking');
          placeMachine(lerp(s.from, s.to, km), Math.sin(km * Math.PI));
          break;
        }
      }
    } else {
      // all strokes complete
      if (!logoShown) {
        logoShown = true;
        strokes.forEach(function (s) { s.el.style.visibility = 'visible'; s.el.style.strokeDashoffset = 0; });
        machine.classList.remove('is-inking');
        timers.push(setTimeout(function () { intro.classList.add('is-logo'); }, 250));
        timers.push(setTimeout(function () { leave(false); }, 250 + 1500));
      }
      var ke = Math.min(1, (el - INK_END) / 700);
      placeMachine(lerp(prevEnd, exitTo, easeInOut(ke)), ke);
      machine.style.opacity = 1 - ke;
      if (ke >= 1) return; // stop rAF; timers finish the sequence
    }
    raf = requestAnimationFrame(frame);
  }

  function start() {
    lock();
    placeMachine(enterFrom, 1);
    skipBtn.addEventListener('click', function () { leave(true); });
    document.addEventListener('keydown', onKey);
    // Safety net: never trap visitors behind the intro.
    timers.push(setTimeout(function () { leave(true); }, 12000));
    raf = requestAnimationFrame(frame);
  }

  // Start once the logo image is decoded (so the hand-off is seamless),
  // but don't wait longer than ~700ms.
  var logoImg = document.querySelector('#intro-logo img');
  var started = false;
  function go() { if (!started) { started = true; start(); } }
  if (logoImg && logoImg.decode) { logoImg.decode().then(go, go); } else { go(); }
  setTimeout(go, 700);
})();
