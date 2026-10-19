import { useEffect, useRef } from 'react';

// A little rover that rides the tip of the string as it draws itself across
// the sideways sections, so it looks like the rover is laying the line down.
// It tilts with the slope, and in the timeline its two-joint arm reaches out
// and taps each milestone's dot as it passes (the dot then stays lit).
export default function StringRover() {
  const ref = useRef(null);

  useEffect(() => {
    const svg = ref.current;
    const track = svg.parentElement;
    const $ = (s) => svg.querySelector(s);
    const parts = { l1o: $('.sr-l1o'), l1i: $('.sr-l1i'), l2o: $('.sr-l2o'), l2i: $('.sr-l2i'), j1: $('.sr-j1'), j2: $('.sr-j2'), body: $('.sr-body') };
    const L1 = 58, L2 = 56;
    let x = null, y = 0, ang = 0; // rover position + tilt, eased
    let ax = 0, ay = 0; // arm tip, eased
    let raf = 0;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const tip = track._tip;
      const path = track.querySelector('.thread-path');
      const show = !!(tip && tip.on && path?._pts) && getComputedStyle(svg).display !== 'none';
      svg.classList.toggle('on', show);
      if (!show) return;

      // ease toward the tip, and tilt along the direction the line is heading
      const pts = path._pts;
      const a = pts[Math.max(0, tip.i - 8)], b = pts[Math.min(pts.length - 1, tip.i)];
      let goalAng = Math.atan2(b[1] - a[1], b[0] - a[0]);
      goalAng = Math.max(-0.9, Math.min(0.9, goalAng)); // never flip over
      if (x === null) { x = tip.x; y = tip.y; ang = goalAng; }
      x += (tip.x - x) * 0.25;
      y += (tip.y - y) * 0.25;
      ang += (goalAng - ang) * 0.15;

      // shoulder sits on the rover's back, perpendicular to the slope
      const nx = Math.sin(ang), ny = -Math.cos(ang);
      const sx = x + nx * 22, sy = y + ny * 22;

      // nearest timeline milestone in reach: tap its dot
      const tr = svg.getBoundingClientRect();
      let target = null;
      for (const stop of track.querySelectorAll('.stop')) {
        const stem = stop.querySelector('.stem').getBoundingClientRect();
        const stx = stem.left + stem.width / 2 - tr.left;
        // scrolled past too fast for a tap? still count it as visited
        if (stx < x - 50) stop.classList.add('tapped');
        if (Math.abs(stx - x) < 50) {
          const above = stop.classList.contains('stop-above');
          target = { x: stx, y: (above ? stem.top : stem.bottom) - tr.top, stop };
        }
      }
      // otherwise rest folded over the rover's head
      const tx = target ? target.x : sx + Math.cos(ang) * 30 + nx * 30;
      const ty = target ? target.y : sy + Math.sin(ang) * 30 + ny * 30;
      ax += (tx - ax) * 0.22;
      ay += (ty - ay) * 0.22;
      if (target && Math.hypot(ax - target.x, ay - target.y) < 9) target.stop.classList.add('tapped');

      // two-link inverse kinematics, elbow trailing behind
      const dx = ax - sx, dy = ay - sy;
      const d = Math.min(Math.max(Math.hypot(dx, dy), 8), L1 + L2 - 0.5);
      const t = Math.atan2(dy, dx);
      const k = Math.acos(Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)));
      const s1 = t - k, s2 = t + k;
      const sh = Math.cos(s1 - ang) < Math.cos(s2 - ang) ? s1 : s2;
      const ex = sx + L1 * Math.cos(sh), ey = sy + L1 * Math.sin(sh);
      const fa = Math.atan2(sy + d * Math.sin(t) - ey, sx + d * Math.cos(t) - ex);
      const hx = ex + L2 * Math.cos(fa), hy = ey + L2 * Math.sin(fa);

      const seg1 = `M${sx} ${sy} L${ex} ${ey}`, seg2 = `M${ex} ${ey} L${hx} ${hy}`;
      parts.l1o.setAttribute('d', seg1); parts.l1i.setAttribute('d', seg1);
      parts.l2o.setAttribute('d', seg2); parts.l2i.setAttribute('d', seg2);
      parts.j1.setAttribute('cx', ex); parts.j1.setAttribute('cy', ey);
      parts.j2.setAttribute('cx', hx); parts.j2.setAttribute('cy', hy);
      parts.body.setAttribute('transform', `translate(${x} ${y}) rotate(${(ang * 180) / Math.PI})`);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg ref={ref} className="srover" aria-hidden="true">
      <path className="sr-l1o" /><path className="sr-l1i" />
      <path className="sr-l2o" /><path className="sr-l2i" />
      <circle className="sr-j1" r="6" />
      <circle className="sr-j2" r="5" />
      <g className="sr-body">
        <rect x="-24" y="-30" width="48" height="20" rx="6" />
        <circle className="sr-eye" cx="-10" cy="-20" r="2.5" />
        <circle className="sr-eye" cx="10" cy="-20" r="2.5" />
        <circle className="sr-wheel" cx="-13" cy="-4" r="6" />
        <circle className="sr-wheel" cx="13" cy="-4" r="6" />
      </g>
    </svg>
  );
}
