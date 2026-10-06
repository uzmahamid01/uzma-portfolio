import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Obj, InkDefs } from './objects.jsx';
import Player, { openPlayer } from './Player.jsx';
import { linkTo, projectPath } from './router.js';
import { LINKS, THINGS, STORY, PATH, CREDO, WORK, PLAY, VERSIONS } from './data.js';

const MOBILE = '(max-width: 820px)';
const RAIL = 0.52; // vertical position (fraction of viewport) of the thread through the timeline

// ---------------------------------------------------------------------------
// Horizontal track: a tall outer section whose sticky child slides sideways
// as you scroll down. On narrow screens it falls back to a normal stack.

function HorizontalScroll({ children, onProgress }) {
  const outerRef = useRef(null);
  const trackRef = useRef(null);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const track = trackRef.current;
    const mq = matchMedia(MOBILE);
    let max = 0;
    let raf = 0;

    const thread = () => track.querySelector('.thread-path');

    const update = () => {
      raf = 0;
      if (mq.matches) return onProgress(0, false);
      const top = outer.getBoundingClientRect().top;
      const p = max > 0 ? Math.min(Math.max(-top / max, 0), 1) : 0;
      track.style.transform = `translate3d(${-p * max}px,0,0)`;
      track.style.setProperty('--p', p.toFixed(4));
      // Draw the thread up to roughly three quarters across the viewport.
      const path = thread();
      if (path) {
        // Nothing drawn until the first scroll; then the line pulls out of the
        // laptop and catches up to running just ahead of the viewport.
        const start = +path.dataset.x0;
        const scrolled = p * max;
        const lead = Math.min(scrolled * 0.8, innerWidth * 0.92 - start);
        const head = scrolled > 0 ? start + scrolled + lead : -Infinity;
        const { drawn, tip } = drawnUpTo(path, head);
        path.style.strokeDashoffset = String(1 - drawn);
        track.classList.toggle('thread-done', drawn >= 1);
        // The blob of ink riding the tip of the line while it's still drawing.
        const blob = track.querySelector('.thread-tip');
        if (blob) {
          blob.setAttribute('cx', tip[0]);
          blob.setAttribute('cy', tip[1]);
          blob.classList.toggle('on', drawn > 0.002 && drawn < 1);
        }
        track.querySelectorAll('.thread-bead').forEach((b) => b.classList.toggle('on', +b.dataset.x < head));
      }
      // Edge blur only while the track is actually moving between its ends,
      // so the hero and the last panel sit sharp at rest.
      track.parentElement.classList.toggle('moving', p > 0.002 && p < 0.998);
      onProgress(p, top <= 1 && top > -max);
    };

    const measure = () => {
      if (mq.matches) {
        outer.style.height = '';
        track.style.transform = '';
        max = 0;
      } else {
        max = track.scrollWidth - innerWidth;
        outer.style.height = `${max + innerHeight}px`;
      }
      update();
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', measure);
    mq.addEventListener('change', measure);
    return () => {
      ro.disconnect();
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', measure);
      mq.removeEventListener('change', measure);
      cancelAnimationFrame(raf);
    };
  }, [onProgress]);

  return (
    <section ref={outerRef} className="h-outer" id="about">
      <div className="h-sticky">
        <div ref={trackRef} className="h-track">
          <Thread trackRef={trackRef} />
          {children}
        </div>
        {/* Progressive blur on both edges: things soften as they slide in and out. */}
        {['left', 'right'].map((side) => (
          <div key={side} className={`edge edge-${side}`} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
    </section>
  );
}

// How much of the thread's length lies left of `x`, and where that point is.
// The cable drops straight down and the loops double back, so horizontal
// distance alone would under-draw it; sample the real path once and cache the
// samples on the node.
function drawnUpTo(path, x) {
  if (path.dataset.d !== path.getAttribute('d')) {
    const total = path.getTotalLength();
    const pts = [];
    for (let i = 0; i <= 1200; i++) {
      const pt = path.getPointAtLength((total * i) / 1200);
      pts.push([pt.x, pt.y]);
    }
    path._pts = pts;
    path.dataset.d = path.getAttribute('d');
  }
  const pts = path._pts;
  let i = 0;
  while (i < pts.length - 1 && pts[i + 1][0] <= x) i++;
  return { drawn: i / (pts.length - 1), tip: pts[i] };
}

// Where the cable leaves the doodle, as fractions of the image: the laptop's
// front corner, over the table edge, down between the table legs, onto the floor.
const CABLE = [[0.44, 0.575], [0.47, 0.615], [0.43, 0.75], [0.46, 0.9], [0.62, 0.95], [0.86, 0.955]];
// Along the free-running stretches, every few points gets a big hanging loop,
// a small loop or a tight knot. Big loop sizes cycle through SWING_SIZES.
const SWING_SIZES = [124, 100, 140, 112];
// Big round loops, with a smaller round one in between; both hang below the line.
const decorate = (k) => (k % 4 === 1 ? 'swing' : k % 4 === 3 ? 'small' : null);

// A big, round loop that hangs below the line, the way a loose string coils
// when it's dropped. It's a stretched cycloid, sampled into short segments.
function swing(x, y, b) {
  const a = b * 0.38; // forward drift per turn
  const c = b * 0.55; // squash vertically so the loop comes out round, not a teardrop
  let d = '';
  for (let i = 1; i <= 48; i++) {
    const t = (i / 48) * Math.PI * 2;
    d += ` L${x + a * t + b * Math.sin(t)} ${y + c * (1 - Math.cos(t))}`;
  }
  return { d, end: [x + a * Math.PI * 2, y] };
}

// A loop that climbs over itself and carries on to the right. Returns the
// path segments and where the pen ends up.
function loop(x, y, r) {
  const d =
    ` C${x + 1.6 * r} ${y} ${x + 1.3 * r} ${y - 2 * r} ${x + 0.5 * r} ${y - 2 * r}` +
    ` C${x - 0.3 * r} ${y - 2 * r} ${x - 0.1 * r} ${y - 0.2 * r} ${x + 1.4 * r} ${y}`;
  return { d, end: [x + 1.4 * r, y] };
}

// One continuous ink line: it comes out of the laptop in the desk doodle,
// wanders through the panels with a few loops and knots tied in, then runs
// flat through the timeline so it strings the dots like beads.
function Thread({ trackRef }) {
  const [geo, setGeo] = useState(null);

  // A passive effect, not a layout one: the parent's track ref isn't attached
  // yet when a child's layout effects run.
  useEffect(() => {
    const track = trackRef.current;
    const img = track?.querySelector('.hero-desk img');

    const build = () => {
      if (!track || !img || matchMedia(MOBILE).matches) return setGeo(null);
      const W = track.scrollWidth;
      const H = innerHeight;
      const tr = track.getBoundingClientRect();
      const ir = img.getBoundingClientRect();
      const onImg = ([fx, fy]) => ({ x: ir.left - tr.left + ir.width * fx, y: ir.top - tr.top + ir.height * fy });

      const rail = track.querySelector('.panel-path');
      const r0 = rail ? rail.offsetLeft : -1;
      const r1 = rail ? r0 + rail.offsetWidth : -1;
      const credo = track.querySelector('.panel-credo');
      const end = credo ? credo.offsetLeft + innerWidth * 0.04 : W;

      const pts = CABLE.map(onImg);
      const floor = pts[pts.length - 1].y;
      // A small coil on the floor beside the desk.
      pts[pts.length - 2].loop = 14;

      // Objects the string passes through: the centre of anything marked
      // `data-thread`, in track coordinates, left to right.
      const anchors = [...track.querySelectorAll('[data-thread]')]
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.left - tr.left + r.width / 2, y: r.top - tr.top + r.height / 2 };
        })
        .filter((a) => a.x > innerWidth * 1.05 && !(a.x > r0 - 40 && a.x < r1 + 40))
        .sort((a, b) => a.x - b.x);

      // Hand-drawn routes: a panel can carry `data-route`, a list of
      // [x fraction of panel width, y fraction of screen height, loop size?].
      // Inside that panel the string follows the route instead of the wave.
      const routes = [...track.querySelectorAll('[data-route]')].map((el) =>
        JSON.parse(el.dataset.route).map(([fx, fy, sw]) => ({ x: el.offsetLeft + fx * el.offsetWidth, y: H * fy, swing: sw })),
      );
      for (const r of routes) {
        const a = r[0].x, b = r[r.length - 1].x;
        for (let i = anchors.length - 1; i >= 0; i--) if (anchors[i].x >= a && anchors[i].x <= b) anchors.splice(i, 1);
      }

      let x = pts[pts.length - 1].x + 300;
      let k = 0;
      let s = 0;
      while (x <= end) {
        const ri = routes.findIndex((r) => x >= r[0].x - 380);
        if (ri >= 0) {
          const r = routes.splice(ri, 1)[0];
          // Where one route ends and the next begins they can share a point;
          // two points that close together make a sharp cusp, so drop the dup.
          for (const q of r) {
            const last = pts[pts.length - 1];
            if (!last || Math.hypot(q.x - last.x, q.y - last.y) > 80) pts.push(q);
          }
          x = r[r.length - 1].x + 380;
          continue;
        }
        const next = anchors[0];
        if (next && next.x - x < 320) {
          // Close enough: run straight through the object.
          pts.push({ x: next.x, y: next.y });
          anchors.shift();
          x = next.x + 420; // a longer run-out after each object keeps the curve easy
          continue;
        }
        const flat = x > r0 - 40 && x < r1 + 40;
        const inHero = x < innerWidth * 1.05;
        // Slow, gentle swells around the lower middle, like a string left lying loose.
        const wave = 0.58 + 0.12 * Math.sin(k * 0.75) + 0.04 * Math.sin(k * 0.31);
        let y = flat ? H * RAIL + Math.sin(x / 260) * H * 0.02 : inHero ? floor : H * Math.min(0.8, Math.max(0.32, wave));
        const pt = { x, y };
        if (!flat && !inHero) {
          const kind = decorate(k);
          const roomy = !next || next.x - x > 520;
          if ((kind === 'swing' || kind === 'small') && roomy) {
            const b = kind === 'small' ? 56 : SWING_SIZES[s++ % SWING_SIZES.length];
            pt.swing = b;
            pt.y = Math.min(y, H - 1.1 * b - 50); // keep the loop's bottom on screen
            x += Math.PI * 2 * 0.38 * b; // the loop travels right; leave it room
          }
          k++;
        }
        pts.push(pt);
        x += 380;
      }

      // Catmull-Rom through the points, written as cubic Béziers, with loops
      // and knots spliced in where a point asks for one.
      let d = `M${pts[0].x} ${pts[0].y}`;
      let pen = [pts[0].x, pts[0].y];
      const beads = [];
      let spliced = false;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] || p2;
        // Every loop leaves heading right, so after one the next curve sets off
        // horizontally instead of using the (now stale) neighbouring tangent.
        // Loops enter and leave heading right; a handle half the chord long gives
        // the line room to turn instead of bending sharply right at the loop.
        const chord = Math.hypot(p2.x - pen[0], p2.y - pen[1]) * 0.5;
        const c1 = spliced
          ? [pen[0] + chord, pen[1]]
          : [pen[0] + (p2.x - p0.x) / 6, pen[1] + (p2.y - p0.y) / 6];
        spliced = Boolean(p2.loop || p2.swing || p2.knot);
        // A loop starts heading right, so arrive at it heading right too (no kink).
        const c2 = p2.swing || p2.loop
          ? [p2.x - chord, p2.y]
          : [p2.x - (p3.x - pts[i].x) / 6, p2.y - (p3.y - pts[i].y) / 6];
        d += ` C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2.x} ${p2.y}`;
        pen = [p2.x, p2.y];
        if (p2.loop) {
          const l = loop(p2.x, p2.y, p2.loop);
          d += l.d;
          pen = l.end;
        }
        if (p2.swing) {
          const s = swing(p2.x, p2.y, p2.swing);
          d += s.d;
          pen = s.end;
        }
        if (p2.knot) {
          // An overhand knot: one small turn, pulled tight where it crosses.
          const k = loop(p2.x, p2.y, 18);
          d += k.d;
          beads.push({ x: p2.x + 18 * 0.45, y: p2.y - 1 });
          pen = k.end;
        }
      }
      setGeo({ W, H, d, beads, x0: pts[0].x, knot: pen });
    };

    build();
    // Anchor positions depend on images having their real size, so rebuild
    // once everything (not just the doodle) has loaded.
    img?.addEventListener('load', build);
    addEventListener('load', build);
    addEventListener('resize', build);
    return () => {
      img?.removeEventListener('load', build);
      removeEventListener('load', build);
      removeEventListener('resize', build);
    };
  }, [trackRef]);

  // Once the path exists, nudge the scroll handler so it sets the draw length.
  useEffect(() => {
    if (geo) dispatchEvent(new Event('scroll'));
  }, [geo]);

  if (!geo) return null;
  return (
    <svg className="thread" width={geo.W} height={geo.H} aria-hidden="true">
      <path className="thread-path" d={geo.d} pathLength="1" data-x0={geo.x0} />
      {geo.beads.map((b) => (
        <ellipse key={b.x} className="thread-bead" data-x={b.x} cx={b.x} cy={b.y} rx="5.5" ry="4.5" />
      ))}
      <ellipse className="thread-knot" cx={geo.knot[0]} cy={geo.knot[1]} rx="11" ry="7.5" />
      <ellipse className="thread-tip" cx="0" cy="0" rx="11" ry="7.5" />
    </svg>
  );
}

// Adds `.in` once an element has scrolled (or slid) into view.
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
      { threshold: 0.2 },
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ---------------------------------------------------------------------------
// Horizontal panels

function Hero() {
  return (
    <div className="panel panel-hero">
      <figure className="hero-desk">
        <img src="/media/doodle.png" alt="an ink drawing of me at a desk, under a lamp, laptop open" />
        <figcaption className="aside">
          <svg viewBox="0 0 60 30" className="aside-arrow" aria-hidden="true">
            <path d="M58 6 C40 2 18 8 6 24 M6 24 l2 -10 M6 24 l10 -3" />
          </svg>
          me, mid rabbit hole.
          <br />
          coffee within reach.
        </figcaption>
      </figure>
      <h1 className="hero-title">
        <span>the neural net</span>
        <span>of an engineer</span>
        <em>in heels.</em>
      </h1>
      <div className="hero-side">
        <p>
          hi, i’m <strong>uzma hamid</strong>. engineer, founder, researcher, and builder of things. kashmiri, based in san
          francisco.
        </p>
        <div className="btns">
          <a className="btn" href="#work">see the work</a>
          <a className="btn btn-ink" href="#talk">let’s talk</a>
        </div>
      </div>
      <p className="mono scroll-hint">
        keep scrolling <span>→</span>
      </p>
    </div>
  );
}

// The string's path through the things panel, drawn by hand:
// [x fraction of panel, y fraction of screen, optional loop size].
const THINGS_ROUTE = [
  [0, 0.58],
  [0.09, 0.34, 56], // coils out from under the laptop
  [0.2, 0.66], // past the lego orchid
  [0.27, 0.86, 72], // loop, bottom left
  [0.5, 0.88], // along the bottom, under the paintings and the tv
  [0.74, 0.8, 64], // loop after the tv
  [0.92, 0.66],
  [1, 0.6],
];

// The TV: its photo, with stills from the shows cross-fading on the screen.
// The screen box is the picture tube's position within tv.png, in percent.
function Tv({ item, onError }) {
  const [on, setOn] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setOn((i) => (i + 1) % item.screen.length), 2200);
    return () => clearInterval(t);
  }, [item.screen.length]);
  const w = 130 * (item.scale || 1);
  return (
    <div className="tv" style={{ width: `${w}%`, marginLeft: `${(100 - w) / 2}%` }}>
      <img className="obj obj-img" src={`/media/${item.img}`} alt="" onError={onError} />
      <div className="tv-screen">
        {item.screen.map((s, i) => (
          <img key={s} src={`/media/${s}`} alt="" className={i === on ? 'on' : ''} />
        ))}
      </div>
    </div>
  );
}

// The camera, with a polaroid tucked beside it that shuffles through photos.
function CameraWithPolaroid({ item, onError }) {
  const [on, setOn] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setOn((i) => (i + 1) % item.polaroid.length), 2600);
    return () => clearInterval(t);
  }, [item.polaroid.length]);
  return (
    <div className="cam">
      <div className="polaroid">
        <div className="polaroid-photo">
          {item.polaroid.map((s, i) => (
            <img key={s} src={`/media/${s}`} alt="" className={i === on ? 'on' : ''} />
          ))}
        </div>
      </div>
      <img className="obj obj-img" src={`/media/${item.img}`} alt="" onError={onError} />
    </div>
  );
}

// A shelf object: the picture if one is set and it loads, otherwise the drawing.
// `img` can be a list, in which case the pictures stand together as a pair.
function Thing({ item }) {
  const [failed, setFailed] = useState(false);
  if (item.screen && !failed) return <Tv item={item} onError={() => setFailed(true)} />;
  if (item.polaroid && !failed) return <CameraWithPolaroid item={item} onError={() => setFailed(true)} />;
  if (!item.img || failed) return <Obj name={item.obj} />;
  const imgs = [].concat(item.img);
  // `scale` shrinks tall photos so they sit at the same visual size as the rest.
  const style = item.scale && imgs.length === 1 ? { width: `${130 * item.scale}%`, marginLeft: `${(100 - 130 * item.scale) / 2}%` } : undefined;
  const pic = (src) => <img key={src} className="obj obj-img" src={`/media/${src}`} alt="" style={style} onError={() => setFailed(true)} />;
  // A pair scales as a whole, staying centred in its slot.
  const pairStyle = item.scale ? { width: `${175 * item.scale}%`, marginLeft: `${(100 - 175 * item.scale) / 2}%` } : undefined;
  return imgs.length > 1 ? <div className="obj-pair" style={pairStyle}>{imgs.map(pic)}</div> : pic(imgs[0]);
}

function Things() {
  return (
    <div className="panel panel-things" data-route={JSON.stringify(THINGS_ROUTE)}>
      <header className="things-head reveal">
        <p className="kicker">i tinker with a lot of stuff.</p>
        <h2 className="display">
          a collector of <em>rabbit holes.</em>
        </h2>
        <p className="sub">a few things that have my heart: the ones on my desk, the ones on my shelf, and the ones i keep coming back to at 2am.</p>
      </header>
      {/* Objects scattered around the heading, no labels; the note shows on hover. */}
      {THINGS.map((t, i) => (
        <figure
          key={t.name}
          className={`thing reveal ${t.listen ? 'thing-listen' : ''}`}
          style={{ left: `${t.x}%`, top: `${t.y}%`, '--i': i, '--depth': t.depth }}
          tabIndex={0}
          onClick={t.listen ? openPlayer : undefined}
          onKeyDown={t.listen ? (e) => e.key === 'Enter' && openPlayer() : undefined}
        >
          <div className="float" data-thread={t.thread ? '' : undefined}>
            <Thing item={t} />
          </div>
          {t.listen && <span className="listen-tag">♫ press play</span>}
          <figcaption className="thing-note">
            <strong>{t.name}</strong>
            <span>{t.note}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

// The string through the story panel: wobbles and loops, but still passes
// through each object. [x fraction of panel, y fraction of screen, loop size?]
const STORY_ROUTE = [
  [0, 0.62],
  [0.09, 0.7],
  [0.201, 0.589], // tomb raider
  [0.28, 0.76],
  [0.32, 0.66],
  [0.408, 0.418], // robot
  [0.49, 0.66],
  [0.55, 0.5],
  [0.615, 0.604], // ai
  [0.68, 0.78, 76],
  [0.76, 0.56],
  [0.822, 0.438], // globe
  [0.9, 0.66],
  [0.95, 0.6],
  [1, 0.56],
];

// Section 2: where it started and what i care for. Each card is an object with
// its words beside it; the string runs through every object.
function Story() {
  return (
    <div className="panel panel-story" data-route={JSON.stringify(STORY_ROUTE)}>
      <header className="story-head reveal">
        <p className="kicker">but few things stick.</p>
        <h2 className="display">
          where it started,
          <br />
          and what <em>matters.</em>
        </h2>
      </header>
      <figure className="story-portrait reveal">
        <img src="/media/uzma-portrait.jpg" alt="uzma hamid" />
        <figcaption className="mono">me, mid-thought</figcaption>
      </figure>
      {STORY.map((h, i) => (
        <article key={h.obj} className="story reveal" style={{ left: `${h.x}vw`, top: `${h.y}vh`, '--i': i }}>
          <div className="float" data-thread="">
            <Thing item={h} />
          </div>
          <div className="story-text">
            <h3>{h.kicker}</h3>
            <p>{h.line}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function Path() {
  return (
    <div className="panel panel-path" style={{ '--stops': PATH.length }}>
      {/* Stops alternate above and below the string, each on a thin stem. */}
      <ol className="stops">
        {PATH.map((s, i) => (
          <li key={s.title} className={`stop ${i % 2 ? 'stop-below' : 'stop-above'} reveal`} style={{ '--i': i }}>
            <div className="stop-text">
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <span className="stop-when">{s.when}</span>
            </div>
            <span className="stem" />
          </li>
        ))}
      </ol>
      <p className="path-line path-line-start reveal">
        somehow, <span>i keep ending up…</span>
      </p>
      <p className="path-line path-line-end reveal">
        <span>building</span> the thing.
      </p>
    </div>
  );
}

function Credo() {
  return (
    <div className="panel panel-credo">
      <ul className="credo">
        {CREDO.map((c, i) => (
          <li key={c} className="reveal" style={{ '--i': i }}>
            {c}
          </li>
        ))}
      </ul>
      <div className="outro reveal">
        <p className="kicker">enough autobiography.</p>
        <h2 className="display">
          here’s what <em>came out of it.</em>
        </h2>
        <a className="btn btn-ink" href="#work">
          see the work ↓
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vertical work index

function Media({ item }) {
  if (!item.media) return <div className="media media-obj"><Obj name={item.obj || 'lego'} /></div>;
  const src = `/media/${item.media}`;
  return item.media.endsWith('.mp4') ? (
    <video className="media" src={src} muted loop playsInline autoPlay preload="auto" />
  ) : (
    <img className="media" src={src} alt="" loading="lazy" />
  );
}

// A paperclip under a glass bell jar, on a plinth.
function MuseumExhibit() {
  return (
    <svg className="exhibit-art" viewBox="0 0 220 260" aria-hidden="true">
      <g fill="none" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" filter="url(#ink)">
        {/* plinth */}
        <path d="M58 196 H162 V250 H58 Z" fill="var(--paper)" />
        <path d="M50 196 H170" />
        <path d="M66 214 H154" strokeWidth="1.2" opacity="0.4" />
        {/* the exhibit: one paperclip */}
        <g className="exhibit-clip">
          <path d="M96 186 V146 a10 10 0 0 1 20 0 V180 a6 6 0 0 1 -12 0 V150" strokeWidth="2.6" />
        </g>
        {/* bell jar */}
        <path className="jar" d="M66 192 V112 C66 66 154 66 154 112 V192" fill="rgba(47,107,255,0.04)" />
        <path d="M100 62 a10 7 0 0 1 20 0" />
        <path d="M80 104 C82 88 92 80 104 78" strokeWidth="1.6" opacity="0.45" />
        <path className="glint" d="M76 150 L126 76" stroke="#fff" strokeWidth="10" opacity="0" />
        <path d="M62 192 H158" strokeWidth="3" />
      </g>
    </svg>
  );
}

// A dandelion clock. Hover blows the seeds away; they drift back.
function DandelionExhibit() {
  const seeds = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2;
    return { a, x: Math.cos(a) * 36, y: Math.sin(a) * 36, i };
  });
  return (
    <svg className="exhibit-art" viewBox="0 0 220 260" aria-hidden="true">
      <g fill="none" stroke="var(--ink)" strokeLinecap="round" filter="url(#ink)">
        <path d="M110 250 C108 214 116 170 110 118" strokeWidth="2.6" />
        <path d="M110 214 C96 206 86 208 76 220 C90 222 100 220 110 214" strokeWidth="2" fill="var(--paper)" />
        {seeds.map((s) => (
          <g
            key={s.i}
            className="seed"
            style={{
              '--dx': `${70 + (s.i % 5) * 26}px`,
              '--dy': `${-80 - (s.i % 7) * 18}px`,
              '--r': `${(s.i % 2 ? 1 : -1) * (40 + s.i * 6)}deg`,
              '--d': `${(s.i % 6) * 60}ms`,
            }}
          >
            <g className="sway">
              <line x1="110" y1="96" x2={110 + s.x} y2={96 + s.y} strokeWidth="1.2" />
              <g transform={`translate(${110 + s.x} ${96 + s.y}) rotate(${(s.a * 180) / Math.PI + 90})`}>
                <path d="M0 0 L-5 -7 M0 0 L0 -8 M0 0 L5 -7" strokeWidth="1.2" />
              </g>
            </g>
          </g>
        ))}
        <circle cx="110" cy="96" r="5" fill="var(--ink)" />
      </g>
    </svg>
  );
}

const EXHIBITS = { museum: MuseumExhibit, dandelion: DandelionExhibit };

function Work() {
  const [open, setOpen] = useState(null);

  return (
    <section className="work" id="work">
      <header className="work-head">
        <p className="mono">index · {WORK.length} projects · 2022–2026</p>
        <h2 className="display">
          the <em>work.</em>
        </h2>
        <p className="sub">research, products, and a startup. click any row to open it up.</p>
      </header>

      <ol className="rows">
        {WORK.map((w, i) => {
          const isOpen = open === i;
          return (
            <li key={w.title} className={`row ${isOpen ? 'open' : ''}`}>
              <button className="row-head" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                <span className="mono row-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="row-title">
                  {w.title}
                  {w.award && <sup className="row-award">1st</sup>}
                </span>
                <span className="mono row-kind">{w.kind}</span>
                <span className="mono row-year">{w.year}</span>
                <span className="row-plus" aria-hidden="true" />
              </button>
              <div className="row-body">
                <div className="row-inner">
                  <div className="row-media canvas">{isOpen && <Media item={w} />}</div>
                  <div className="row-text">
                    {w.award && <p className="award">★ {w.award}</p>}
                    <p>{w.blurb}</p>
                    <ul className="chips">
                      {w.tags.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                    <div className="row-actions">
                      <a className="btn btn-ink" {...linkTo(projectPath(w.title))}>
                        read the full story →
                      </a>
                      <p className="row-links">
                        {w.live && <a href={w.live} target="_blank" rel="noreferrer">visit ↗</a>}
                        {w.code && <a href={w.code} target="_blank" rel="noreferrer">code ↗</a>}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="play" id="play">
        <header className="play-head">
          <p className="mono">the after-hours wing</p>
          <h3 className="play-title">
            made for <em>no reason.</em>
          </h3>
        </header>
        <div className="exhibits">
          {PLAY.map((p, i) => {
            const Art = EXHIBITS[p.exhibit];
            return (
              <a key={p.title} className={`exhibit exhibit-${p.exhibit}`} href={p.live} target="_blank" rel="noreferrer">
                <div className="exhibit-stage">{Art && <Art />}</div>
                <div className="placard">
                  <p className="mono">no. {String(i + 1).padStart(2, '0')}</p>
                  <h4>{p.title}</h4>
                  <p className="placard-blurb">{p.blurb}</p>
                  <span className="placard-cta">{p.cta} <em>→</em></span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// A small "past versions" link in the footer that opens a card of earlier sites.
function PastVersions() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    addEventListener('mousedown', onDown);
    addEventListener('keydown', onKey);
    return () => {
      removeEventListener('mousedown', onDown);
      removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div className="versions" ref={ref}>
      <button className="mono versions-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        past versions <em>{open ? '↓' : '↑'}</em>
      </button>
      {open && (
        <div className="versions-card" role="dialog" aria-label="past versions">
          <ul>
            <li className="versions-now">
              <span>this one</span>
              <span className="mono">now</span>
            </li>
            {VERSIONS.map((v) => (
              <li key={v.url}>
                <a href={v.url} target="_blank" rel="noreferrer">
                  <span>
                    {v.title} <em>↗</em>
                  </span>
                  <span className="mono">{v.year}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Talk() {
  return (
    <section className="talk" id="talk">
      <figure className="talk-photo">
        <img src="/media/uzma-headshot.jpg" alt="uzma hamid" />
      </figure>
      <p className="kicker">that’s me. say hi.</p>
      <h2 className="display talk-title">
        let’s <em>talk.</em>
      </h2>
      <ul className="talk-links">
        <li><a href={LINKS.email}>email</a></li>
        <li><a href={LINKS.calendly} target="_blank" rel="noreferrer">schedule a call</a></li>
        <li><a href={LINKS.github} target="_blank" rel="noreferrer">github</a></li>
        <li><a href={LINKS.resume} target="_blank" rel="noreferrer">resume</a></li>
      </ul>
      <footer className="foot">
        <div className="foot-left">
          <span className="mono">© 2026 uzma hamid</span>
          <PastVersions />
        </div>
        <p className="foot-credit">
          design inspired by{' '}
          <a href="https://www.somehowliving.tech/" target="_blank" rel="noreferrer">
            nidhi prajapati
          </a>
        </p>
        <a className="mono foot-top" href="#top" onClick={(e) => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); }}>
          back to top <em>↑</em>
        </a>
      </footer>
    </section>
  );
}

// ---------------------------------------------------------------------------

export default function App() {
  const barRef = useRef(null);
  useReveal();

  const onProgress = useRef((p, active) => {
    const bar = barRef.current;
    if (!bar) return;
    bar.style.setProperty('--p', p);
    bar.classList.toggle('show', active);
  }).current;

  return (
    <>
      <InkDefs />
      <Player />
      <nav className="nav">
        <a href="#top" className="brand">uzma h.</a>
        <div className="nav-links">
          <a href="#about">about</a>
          <a href="#work">work</a>
          <a href={LINKS.linkedin} target="_blank" rel="noreferrer">linkedin ↗</a>
          <a href="#talk">let’s talk</a>
        </div>
      </nav>
      <main id="top">
        <HorizontalScroll onProgress={onProgress}>
          <Hero />
          <Things />
          <Story />
          <Path />
          <Credo />
        </HorizontalScroll>
        <Work />
        <Talk />
      </main>
      <div ref={barRef} className="progress" aria-hidden="true">
        <span />
      </div>
    </>
  );
}
