import { useEffect, useRef, useState } from 'react';

// A minimal robot arm in the opening section that learns by imitation.
// - The visitor draws in pencil (the demonstration). Every finished stroke
//   joins a queue and she repaints it in watercolour with her brush, so you can
//   keep drawing while she works. Pencil is what you meant; paint is what she did.
// - Her hand is a robot's: she resamples at her own pace and smooths what her
//   joints can't follow, more so on fast strokes (speed costs fidelity), plus a
//   learner's wobble that shrinks with every stroke she copies.
// - After each stroke she scores herself: how close her paint came to your line.
// - Her base floats and glides after the brush, so a short arm reaches anywhere.
// - On load she warms up by painting a little cat.
// Two-link inverse kinematics solves her shoulder and elbow every frame.

const HELLO = 'draw anything in pencil · she’ll paint it back ✎';
const PIGMENTS = ['#4f78c9', '#6b9e8f', '#8f7bc4', '#d0849a', '#c99a4f'];

// ---- geometry helpers ------------------------------------------------------
function resample(points, step) {
  const out = [points[0]];
  let carry = 0;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1], [x1, y1] = points[i];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    let t = step - carry;
    while (t <= seg) {
      out.push([x0 + ((x1 - x0) * t) / seg, y0 + ((y1 - y0) * t) / seg]);
      t += step;
    }
    carry = seg - (t - step);
  }
  out.push(points[points.length - 1]);
  return out;
}
function smooth(p, w) {
  if (w < 1) return p.slice();
  return p.map((_, i) => {
    let sx = 0, sy = 0, n = 0;
    for (let j = -w; j <= w; j++) {
      const q = p[Math.max(0, Math.min(p.length - 1, i + j))];
      sx += q[0]; sy += q[1]; n++;
    }
    return [sx / n, sy / n];
  });
}
function catmull(ctrl, per = 10) {
  const out = [];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = ctrl[i - 1] || ctrl[i], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[i + 2] || p2;
    for (let k = 0; k < per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(ctrl[ctrl.length - 1]);
  return out;
}
const hexA = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

// her warm-up: a little smiling cat face, in unit coordinates (y down)
const CAT = [
  [[-0.8, 0.2], [-0.92, -0.35], [-0.78, -1.0], [-0.42, -0.62], [0, -0.68], [0.42, -0.62], [0.78, -1.0], [0.92, -0.35], [0.8, 0.2], [0.48, 0.6], [0, 0.72], [-0.48, 0.6], [-0.8, 0.2]],
  [[-0.44, -0.12], [-0.33, -0.22], [-0.22, -0.12]],
  [[0.22, -0.12], [0.33, -0.22], [0.44, -0.12]],
  [[-0.07, 0.1], [0.07, 0.1], [0, 0.2], [-0.07, 0.1]],
  [[-0.18, 0.28], [-0.09, 0.36], [0, 0.2], [0.09, 0.36], [0.18, 0.28]],
  [[-0.38, 0.2], [-1.1, 0.1]],
  [[-0.38, 0.3], [-1.1, 0.38]],
  [[0.38, 0.2], [1.1, 0.1]],
  [[0.38, 0.3], [1.1, 0.38]],
];

export default function RobotArm() {
  const svgRef = useRef(null);
  const paintRef = useRef(null);
  const wetRef = useRef(null);
  const [status, setStatus] = useState(HELLO);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const svg = svgRef.current;
    const canvas = paintRef.current;
    const ctx = canvas.getContext('2d');
    const wetCanvas = wetRef.current;
    const wet = wetCanvas.getContext('2d');
    const panel = svg.parentElement;
    const $ = (sel) => svg.querySelector(sel);
    const [link1, link2] = [$('.link1'), $('.link2')];
    const [shoulder, elbow, brush] = [$('.j-shoulder'), $('.j-elbow'), $('.j-brush')];
    const shadow = $('.base-shadow');
    const pencilLayer = $('.pencil');

    // keep the paint canvas the size of the section, crisp on retina
    const fit = () => {
      const r = svg.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (canvas.width === w && canvas.height === h) return;
      const prev = canvas.width ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;
      canvas.width = wetCanvas.width = w;
      canvas.height = wetCanvas.height = h;
      if (prev) ctx.putImageData(prev, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      wet.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    addEventListener('resize', fit);

    let tx = null, ty = null; // cursor (px in the section)
    let cx = 0, cy = 0; // brush tip
    let baseX = null, baseY = null; // her floating base
    let lastMove = -1e9, started = false, raf = 0;

    let live = null; // the stroke being drawn right now: { pts, el }
    const queue = []; // finished strokes waiting to be painted
    let job = null; // the stroke she's painting
    let learned = 0, firstScore = null, strokeNo = 0;
    let warmTimer = 0;

    const local = (e) => {
      const r = svg.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    const pencil = (pts) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      el.setAttribute('class', 'pencil-stroke');
      el.setAttribute('d', 'M' + pts.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L'));
      pencilLayer.appendChild(el);
      return el;
    };

    const onMove = (e) => {
      [tx, ty] = local(e);
      lastMove = performance.now();
      if (live) {
        const r = svg.getBoundingClientRect();
        tx = Math.min(Math.max(tx, 0), r.width);
        ty = Math.min(Math.max(ty, 0), r.height);
        const last = live.pts[live.pts.length - 1];
        if (Math.hypot(tx - last[0], ty - last[1]) > 2) {
          live.pts.push([tx, ty]);
          live.el.setAttribute('d', 'M' + live.pts.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L'));
        }
      }
    };
    const onDown = (e) => {
      if (e.button !== 0 || e.target.closest('a, button')) return;
      e.preventDefault();
      clearTimeout(warmTimer);
      [tx, ty] = local(e);
      live = { pts: [[tx, ty]] };
      live.el = pencil(live.pts);
      if (!job && !queue.length) setStatus('watching you… 👀');
    };
    const onUp = () => {
      if (!live) return;
      if (live.pts.length > 2) queue.push({ intent: live.pts, el: live.el });
      else live.el.remove();
      live = null;
    };

    // what her hand will actually do with a demonstration
    const interpret = (intent) => {
      let speed = 0;
      for (let i = 1; i < intent.length; i++) speed += Math.hypot(intent[i][0] - intent[i - 1][0], intent[i][1] - intent[i - 1][1]);
      speed /= Math.max(1, intent.length - 1);
      const w = Math.min(10, Math.round(1 + speed * 0.45)); // fast strokes get smoothed more
      const wobble = Math.max(0.5, 7 * 0.72 ** learned); // shrinks as she learns
      const seed = Math.random() * 100;
      return smooth(resample(intent, 4), w).map(([x, y], n) => [
        x + Math.sin(n * 0.09 + seed) * wobble + Math.sin(n * 0.031 + seed * 2) * wobble * 0.6,
        y + Math.cos(n * 0.08 + seed * 3) * wobble + Math.sin(n * 0.027 + seed) * wobble * 0.6,
      ]);
    };
    const score = (intent, ink) => {
      const a = resample(intent, 6);
      let dev = 0;
      for (const [qx, qy] of a) {
        let m = 1e9;
        for (const [rx, ry] of ink) m = Math.min(m, (rx - qx) ** 2 + (ry - qy) ** 2);
        dev += Math.sqrt(m);
      }
      dev /= a.length;
      return Math.max(0, Math.min(100, Math.round(100 - dev * 3)));
    };

    // watercolour: the stroke in progress lives on a "wet" layer that is
    // redrawn whole each frame (so it never beads where it overlaps itself):
    // a soft wash, a body and a darker core, swelling in the middle of the
    // stroke and thinning at its ends like brush pressure. When the stroke is
    // finished it dries onto the paper layer with a multiply blend, so strokes
    // that cross each other pool like real pigment.
    const clearWet = () => {
      wet.save(); wet.setTransform(1, 0, 0, 1, 0, 0);
      wet.clearRect(0, 0, wetCanvas.width, wetCanvas.height);
      wet.restore();
    };
    const drawWet = (pts, color, total) => {
      clearWet();
      if (pts.length < 2) return;
      // half-width at each point: brush pressure swells mid-stroke, thins at the ends
      const hw = pts.map((_, i) => {
        const t = i / Math.max(1, total - 1);
        return 4.5 * (0.35 + 0.65 * Math.sin(Math.PI * Math.min(Math.max(t, 0), 1)) ** 0.7);
      });
      // the stroke as one filled outline (left edge out, round cap, right edge back),
      // so a single fill per pass has no seams or overlaps
      const outline = (k) => {
        const L = [], R = [];
        for (let i = 0; i < pts.length; i++) {
          const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(pts.length - 1, i + 1)];
          let nx = -(p1[1] - p0[1]), ny = p1[0] - p0[0];
          const n = Math.hypot(nx, ny) || 1;
          nx /= n; ny /= n;
          const w = hw[i] * k;
          L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]);
          R.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
        }
        wet.beginPath();
        wet.moveTo(L[0][0], L[0][1]);
        for (const q of L) wet.lineTo(q[0], q[1]);
        const e = pts[pts.length - 1], s0 = pts[0];
        const ae = Math.atan2(L[L.length - 1][1] - e[1], L[L.length - 1][0] - e[0]);
        wet.arc(e[0], e[1], hw[hw.length - 1] * k, ae, ae + Math.PI, true);
        for (let i = R.length - 1; i >= 0; i--) wet.lineTo(R[i][0], R[i][1]);
        const as = Math.atan2(R[0][1] - s0[1], R[0][0] - s0[0]);
        wet.arc(s0[0], s0[1], hw[0] * k, as, as + Math.PI, true);
        wet.closePath();
      };
      for (const [k, a] of [[1.8, 0.1], [1.05, 0.16], [0.42, 0.22]]) {
        wet.fillStyle = hexA(color, a);
        outline(k);
        wet.fill('nonzero');
      }
    };
    const dry = () => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(wetCanvas, 0, 0);
      ctx.restore();
      clearWet();
    };

    const warmUp = () => {
      const r = svg.getBoundingClientRect();
      const s = Math.min(r.height * 0.1, 85), ox = r.width * 0.36, oy = r.height * 0.5;
      setStatus('warming up with a cat… 🐈');
      for (const ctrl of CAT) {
        const intent = catmull(ctrl.map(([x, y]) => [ox + x * s, oy + y * s]), 8);
        queue.push({ intent, el: pencil(intent), warm: true });
      }
    };
    warmTimer = setTimeout(warmUp, 1400);

    const onClear = () => {
      clearTimeout(warmTimer);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      clearWet();
      pencilLayer.replaceChildren();
      queue.length = 0;
      job = null;
      live = null;
      setHasInk(false);
      setStatus(learned ? 'ready when you are ✎' : HELLO);
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const r = svg.getBoundingClientRect();
      if (r.right < 0 || r.left > innerWidth) return;
      const W = r.width, H = r.height;
      const L1 = Math.min(Math.max(H * 0.2, 110), 190), L2 = L1 * 0.9;
      if (baseX === null) { baseX = W * 0.47; baseY = H * 0.72; }

      // next stroke to paint
      if (!job && queue.length) {
        const next = queue.shift();
        job = { ...next, plan: interpret(next.intent), i: 0, travelling: true, inkPts: [], color: PIGMENTS[strokeNo++ % PIGMENTS.length] };
        if (!next.warm) setStatus(`painting… ${queue.length ? `(${queue.length} more)` : ''}`);
      }

      // where the brush should be this frame
      let gx, gy, follow = 0.12;
      if (job) {
        if (job.travelling) {
          [gx, gy] = job.plan[0];
          follow = 0.2;
          if (Math.hypot(cx - gx, cy - gy) < 3) { job.travelling = false; setHasInk(true); }
        } else {
          job.i = Math.min(job.i + 2, job.plan.length - 1);
          [gx, gy] = job.plan[job.i];
          follow = 1;
        }
      } else if (live) {
        gx = baseX + L1 * 0.4; gy = baseY + L1 * 0.5; // step back and watch
      } else if (tx !== null && now - lastMove < 3000 && tx > 0 && tx < W && ty > 0 && ty < H) {
        gx = tx; gy = ty;
      } else {
        // idle: a slow figure-eight around the middle of the section
        const t = now / 1000;
        gx = W * 0.47 + Math.sin(t * 0.35) * W * 0.12;
        gy = H * 0.5 + Math.sin(t * 0.7) * H * 0.12;
      }
      gx = Math.min(Math.max(gx, 30), W - 30);
      gy = Math.min(Math.max(gy, 70), H - 30);
      if (!started) { cx = gx; cy = gy; started = true; }
      cx += (gx - cx) * follow;
      cy += (gy - cy) * follow;

      // her base glides after the brush, staying a comfortable reach away
      const dx = cx - baseX, dy = cy - baseY, d0 = Math.hypot(dx, dy);
      const R = (L1 + L2) * 0.62;
      if (d0 > R) {
        const k = job && !job.travelling ? 0.3 : 0.12;
        baseX += (dx / d0) * (d0 - R) * k;
        baseY += (dy / d0) * (d0 - R) * k;
      }
      const M = L1 + L2 - 2, d1 = Math.hypot(cx - baseX, cy - baseY);
      if (d1 > M) { baseX = cx - ((cx - baseX) / d1) * M; baseY = cy - ((cy - baseY) / d1) * M; }
      baseX = Math.min(Math.max(baseX, 40), W - 40);
      baseY = Math.min(Math.max(baseY, 80), H - 40);

      // paint while the brush is down
      if (job && !job.travelling) {
        job.inkPts.push([cx, cy]);
        drawWet(job.inkPts, job.color, job.plan.length / 2);
        if (job.i >= job.plan.length - 1) {
          dry();
          const sc = score(job.intent, job.inkPts);
          learned++;
          if (!job.warm) {
            if (firstScore === null) firstScore = sc;
            setStatus(firstScore !== sc ? `accuracy ${firstScore}% → ${sc}% · she’s learning` : `accuracy ${sc}% · first try`);
          } else if (!queue.some((q) => q.warm)) setStatus(HELLO);
          const el = job.el;
          el.classList.add('fade');
          setTimeout(() => el.remove(), 1200);
          job = null;
        }
      }

      // two-link inverse kinematics from the base to the brush
      const bx = baseX, by = baseY;
      const dd = Math.min(Math.max(Math.hypot(cx - bx, cy - by), Math.abs(L1 - L2) + 1), L1 + L2 - 0.5);
      const a = Math.atan2(cy - by, cx - bx);
      const k = Math.acos(Math.min(1, (L1 * L1 + dd * dd - L2 * L2) / (2 * L1 * dd)));
      const sh = a + k; // keep one consistent elbow side
      const ex = bx + L1 * Math.cos(sh), ey = by + L1 * Math.sin(sh);
      const hx = bx + dd * Math.cos(a), hy = by + dd * Math.sin(a);

      const place = (el, x1, y1, x2, y2, r1, r2) => {
        const len = Math.hypot(x2 - x1, y2 - y1), deg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
        el.setAttribute('transform', `translate(${x1} ${y1}) rotate(${deg})`);
        el.querySelector('path').setAttribute('d', `M0 ${-r1} L${len} ${-r2} A${r2} ${r2} 0 0 1 ${len} ${r2} L0 ${r1} A${r1} ${r1} 0 0 1 0 ${-r1} Z`);
      };
      place(link1, bx, by, ex, ey, 14, 10);
      place(link2, ex, ey, hx, hy, 9, 6);
      shoulder.setAttribute('transform', `translate(${bx} ${by})`);
      shadow.setAttribute('transform', `translate(${bx + 10} ${by + 14})`);
      elbow.setAttribute('transform', `translate(${ex} ${ey})`);
      brush.setAttribute('transform', `translate(${hx} ${hy})`);
      brush.classList.toggle('wet', !!job && !job.travelling);
      brush.style.setProperty('--paint', job ? job.color : '#3a3a3a');
    };

    panel.addEventListener('pointerdown', onDown);
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerup', onUp);
    addEventListener('clear-drawing', onClear);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(warmTimer);
      removeEventListener('resize', fit);
      panel.removeEventListener('pointerdown', onDown);
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerup', onUp);
      removeEventListener('clear-drawing', onClear);
    };
  }, []);

  // a joint: a shaded disc with a raised cap and a small accent
  const joint = (cls, r) => (
    <g className={cls}>
      <circle r={r} fill="url(#ra-joint)" />
      <circle r={r * 0.58} fill="url(#ra-cap)" />
      <circle r={r * 0.2} className="joint-dot" />
    </g>
  );

  return (
    <>
      <canvas ref={paintRef} className="arm-paint" aria-hidden="true" />
      <canvas ref={wetRef} className="arm-paint" aria-hidden="true" />
      <svg ref={svgRef} className="arm" aria-hidden="true">
        <defs>
          <linearGradient id="ra-tube" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbfbfa" />
            <stop offset="0.45" stopColor="#e6e6e3" />
            <stop offset="1" stopColor="#c4c4c0" />
          </linearGradient>
          <radialGradient id="ra-joint" cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.6" stopColor="#e2e2df" />
            <stop offset="1" stopColor="#b9b9b5" />
          </radialGradient>
          <radialGradient id="ra-cap" cx="0.4" cy="0.35" r="0.75">
            <stop offset="0" stopColor="#f2f2f0" />
            <stop offset="1" stopColor="#cdcdc9" />
          </radialGradient>
          <filter id="ra-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <g className="pencil" />
        <g className="robot">
          <ellipse className="base-shadow" rx="30" ry="14" filter="url(#ra-soft)" />
          <g className="link1"><path fill="url(#ra-tube)" /></g>
          <g className="link2"><path fill="url(#ra-tube)" /></g>
          {/* the brush: a shaded tip that takes on the colour it's painting */}
          <g className="j-brush">
            <circle r="9" fill="url(#ra-joint)" />
            <circle r="4.5" className="brush-tip" />
          </g>
          {joint('j-elbow', 13)}
          {joint('j-shoulder', 22)}
        </g>
      </svg>
      <p className="mono arm-hint">{status}</p>
      {hasInk && (
        <button className="mono arm-clear" onClick={() => dispatchEvent(new Event('clear-drawing'))}>
          clear ↺
        </button>
      )}
    </>
  );
}
