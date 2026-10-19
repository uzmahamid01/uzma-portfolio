import { useEffect, useRef } from 'react';

// An ink-drawn two-joint robot arm that reaches for the cursor.
// Classic two-link inverse kinematics: given the target point, solve the
// shoulder and elbow angles (elbow kept up), then redraw the links each frame.
// Pressing the mouse closes the gripper. With no cursor around (touch devices,
// or a few idle seconds) it drifts on its own.

const INK = 'var(--ink)';
const PAPER = 'var(--paper)';

export default function RobotArm() {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    const $ = (sel) => svg.querySelector(sel);
    const links = [$('.arm-l1o'), $('.arm-l1i'), $('.arm-l2o'), $('.arm-l2i')];
    const [j0, j1, j2, j2dot] = [$('.arm-j0'), $('.arm-j1'), $('.arm-j2'), $('.arm-j2dot')];
    const [f1, f2] = [$('.arm-f1'), $('.arm-f2')];
    const base = $('.arm-base');

    let tx = null, ty = null; // where the cursor is (svg pixels)
    let cx = 0, cy = 0; // where the gripper currently is (eased)
    let grip = 0, gripTarget = 0; // 0 open, 1 closed
    let lastMove = -1e9;
    let raf = 0, started = false;

    const onMove = (e) => {
      const r = svg.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      lastMove = performance.now();
    };
    const onDown = () => (gripTarget = 1);
    const onUp = () => (gripTarget = 0);

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const r = svg.getBoundingClientRect();
      if (r.right < 0 || r.left > innerWidth) return; // scrolled away: skip work

      const W = r.width, H = r.height;
      const bx = W * 0.47, by = H * 0.9; // shoulder sits on the "floor"
      const L1 = Math.min(Math.max(H * 0.24, 120), 200);
      const L2 = L1 * 0.86;

      // With no recent cursor, wander in a slow loop above the base.
      let gx = tx, gy = ty;
      if (tx === null || now - lastMove > 3000) {
        const t = now / 1000;
        gx = bx + Math.sin(t * 0.6) * L1 * 0.9;
        gy = by - L1 * 1.15 + Math.cos(t * 0.9) * L1 * 0.35;
      }
      if (!started) {
        cx = gx; cy = gy; started = true;
      }
      cx += (gx - cx) * 0.12;
      cy += (gy - cy) * 0.12;
      grip += (gripTarget - grip) * 0.25;

      // Inverse kinematics (two links, elbow up).
      const dx = cx - bx, dy = cy - by;
      // never fully straight: keep a bend in the elbow even when the cursor is far away
      const d = Math.min(Math.max(Math.hypot(dx, dy), Math.abs(L1 - L2) + 1), (L1 + L2) * 0.86);
      const a = Math.atan2(dy, dx);
      const k = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d));
      // pick whichever solution keeps the elbow higher on screen
      const s1 = a - k, s2 = a + k;
      const shoulder = Math.sin(s1) < Math.sin(s2) ? s1 : s2;
      const ex = bx + L1 * Math.cos(shoulder), ey = by + L1 * Math.sin(shoulder);
      const hx0 = bx + d * Math.cos(a), hy0 = by + d * Math.sin(a);
      const fore = Math.atan2(hy0 - ey, hx0 - ex);
      const hx = ex + L2 * Math.cos(fore), hy = ey + L2 * Math.sin(fore);

      const seg = (x1, y1, x2, y2) => `M${x1} ${y1} L${x2} ${y2}`;
      links[0].setAttribute('d', seg(bx, by, ex, ey));
      links[1].setAttribute('d', seg(bx, by, ex, ey));
      links[2].setAttribute('d', seg(ex, ey, hx, hy));
      links[3].setAttribute('d', seg(ex, ey, hx, hy));
      j0.setAttribute('cx', bx); j0.setAttribute('cy', by);
      j1.setAttribute('cx', ex); j1.setAttribute('cy', ey);
      j2.setAttribute('cx', hx); j2.setAttribute('cy', hy);
      j2dot.setAttribute('cx', hx); j2dot.setAttribute('cy', hy);
      base.setAttribute('transform', `translate(${bx} ${by})`);

      // Two fingers, splayed open; they close together when the mouse is down.
      const deg = (fore * 180) / Math.PI;
      const open = 28 - grip * 24;
      f1.setAttribute('transform', `translate(${hx} ${hy}) rotate(${deg - open})`);
      f2.setAttribute('transform', `translate(${hx} ${hy}) rotate(${deg + open})`);
    };

    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerdown', onDown);
    addEventListener('pointerup', onUp);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerdown', onDown);
      removeEventListener('pointerup', onUp);
    };
  }, []);

  const finger = (flip) => (
    <path
      d={`M0 0 L34 ${flip * 6} L44 ${flip * -2}`}
      fill="none"
      stroke={INK}
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );

  return (
    <svg ref={svgRef} className="arm" aria-hidden="true">
      <g filter="url(#ink)">
        {/* base plate bolted to the floor */}
        <g className="arm-base">
          <path d="M-46 4 H46 L38 -14 H-38 Z" fill={PAPER} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M-60 6 H60" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <circle cx="-28" cy="-4" r="2.5" fill={INK} />
          <circle cx="28" cy="-4" r="2.5" fill={INK} />
        </g>
        {/* links: a thick ink stroke with a paper stroke inside = outlined tube */}
        <path className="arm-l1o" stroke={INK} strokeWidth="26" strokeLinecap="round" />
        <path className="arm-l1i" stroke={PAPER} strokeWidth="19" strokeLinecap="round" />
        <path className="arm-l2o" stroke={INK} strokeWidth="20" strokeLinecap="round" />
        <path className="arm-l2i" stroke={PAPER} strokeWidth="13" strokeLinecap="round" />
        <g className="arm-f1">{finger(1)}</g>
        <g className="arm-f2">{finger(-1)}</g>
        <circle className="arm-j0" r="19" fill={PAPER} stroke={INK} strokeWidth="3" />
        <circle className="arm-j1" r="15" fill={PAPER} stroke={INK} strokeWidth="3" />
        <circle className="arm-j2" r="10" fill={INK} />
        <circle className="arm-j2dot" r="3.5" fill="var(--hover)" />
      </g>
    </svg>
  );
}
