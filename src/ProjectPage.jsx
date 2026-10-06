import { useEffect, useState } from 'react';
import { Obj, InkDefs } from './objects.jsx';
import { WORK, LINKS } from './data.js';
import CASES from './cases.json';
import { slugify, projectPath, linkTo } from './router.js';

// Laid out like the v1 project page: a cover band with the project playing on
// a laptop and prev/next pills, the title block, then a sticky section rail
// beside the case study.

// Case-study copy for projects that weren't in v1.
const EXTRA = {
  'Secret Garden': {
    tagline: 'privacy-preserving multi-agent ai',
    role: 'hackathon · team',
    about: [
      'A decentralized multi-agent event planner built with Flower. Every person gets their own agent, and their personal information and preferences never leave their device. The agents negotiate a plan together without anyone handing over the raw details.',
    ],
    sections: [
      {
        heading: 'how privacy holds up',
        body: [
          'Agents talk through schema-based output guards, so nothing outside an agreed shape can be said. Sharing anything sensitive needs a binary consent from the owner, and a disclosure ledger measures exactly how much information leaked, in bits.',
        ],
      },
      { heading: 'result', body: ['1st place at the Collaborative Agent Hackathon at Stanford, run by Flower Labs.'] },
    ],
  },
};

// v1 section names for the headings stored in cases.json.
const LABELS = {
  'the problem': 'problem',
  'the approach': 'approach',
  'what i built': 'solution',
  'under the hood': 'implementation',
};

// The v1 write-ups carry a little HTML (lists, bold). It is our own copy from
// cases.json, so render it; a paragraph holding a list becomes a div.
function Para({ html }) {
  const Tag = /<(ul|ol|li)\b/.test(html) ? 'div' : 'p';
  return <Tag className="para" dangerouslySetInnerHTML={{ __html: html }} />;
}

// A silver laptop drawn in CSS, as on v1: the project plays on its screen.
function Laptop({ w }) {
  const src = w.media && `/media/${w.media}`;
  return (
    <div className="mac">
      <div className="mac-lid">
        <div className="mac-bezel">
          <div className="mac-screen">
            {!src ? (
              <div className="mac-blank">
                <Obj name={w.obj || 'lego'} />
              </div>
            ) : w.media.endsWith('.mp4') ? (
              <video src={src} autoPlay loop muted playsInline />
            ) : (
              <img src={src} alt={`${w.title} screenshot`} />
            )}
            <span className="mac-notch" aria-hidden="true">
              <span />
            </span>
            <span className="mac-glare" aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className="mac-hinge" aria-hidden="true" />
      <div className="mac-deck" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}

export default function ProjectPage({ slug }) {
  const i = WORK.findIndex((w) => slugify(w.title) === slug);
  const w = WORK[i];
  const c = (w && (CASES[w.title] || EXTRA[w.title])) || { about: [], sections: [] };
  const prev = i > 0 ? WORK[i - 1] : null;
  const next = i >= 0 && i < WORK.length - 1 ? WORK[i + 1] : null;
  const [active, setActive] = useState('');
  const [readPct, setReadPct] = useState(0);
  const [lightbox, setLightbox] = useState(null);

  // Only sections with something in them make it onto the rail.
  const sections = w
    ? [
        { id: 'stack', label: 'stack', tags: w.tags },
        { id: 'overview', label: 'overview', lede: w.blurb, body: c.about, award: w.award },
        ...c.sections.map((s) => ({ id: slugify(s.heading), label: LABELS[s.heading] || s.heading, body: s.body })),
        c.diagram && { id: 'architecture', label: 'architecture', images: [`/media/${c.diagram}`] },
      ].filter(Boolean)
    : [];

  useEffect(() => {
    scrollTo({ top: 0, behavior: 'instant' });
    setActive('');
    document.title = w ? `${w.title} — uzma hamid` : 'not found — uzma hamid';
    return () => {
      document.title = 'Uzma Hamid — a field guide';
    };
  }, [w]);

  // Light up the rail dot for whichever section is nearest the top.
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (seen[0]) setActive(seen[0].target.id);
      },
      { rootMargin: '-25% 0px -65% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [slug, sections.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // How far through the case study you are, for the rail's ink line.
  useEffect(() => {
    const onScroll = () => {
      const body = document.querySelector('.pp-body');
      if (!body) return;
      const r = body.getBoundingClientRect();
      const p = (innerHeight * 0.35 - r.top) / Math.max(r.height - innerHeight * 0.4, 1);
      setReadPct(Math.min(Math.max(p, 0), 1));
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, [slug]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => e.key === 'Escape' && setLightbox(null);
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [lightbox]);

  const activeIndex = sections.findIndex((s) => s.id === active);

  // The prev / next pills floating on the cover band.
  const pill = (side, target) => (
    <a
      className={`cover-pill cover-pill-${side}`}
      {...linkTo(target ? projectPath(target.title) : '/#work')}
      aria-label={`${side === 'left' ? 'previous' : 'next'}: ${target ? target.title : 'all work'}`}
    >
      {side === 'left' && <span aria-hidden="true">←</span>}
      <span className="cover-pill-label">{target ? target.title : 'all work'}</span>
      {side === 'right' && <span aria-hidden="true">→</span>}
    </a>
  );

  return (
    <>
      <InkDefs />
      <nav className="nav">
        <a className="brand" {...linkTo('/')}>uzma h.</a>
        <div className="nav-links">
          <a {...linkTo('/#work')}>← all work</a>
          <a href={LINKS.linkedin} target="_blank" rel="noreferrer">linkedin ↗</a>
          <a href={LINKS.email}>let’s talk</a>
        </div>
      </nav>

      {!w ? (
        <main className="case case-missing">
          <h1 className="display">
            nothing <em>here.</em>
          </h1>
          <a className="btn btn-ink" {...linkTo('/#work')}>back to the work</a>
        </main>
      ) : (
        <main className="pp">
          <div className="cover">
            <div className="cover-stage">
              <Laptop w={w} />
              {/* a museum tag hung off the laptop's corner on a string */}
              <div className="tag" aria-hidden="true">
                <svg className="tag-string" viewBox="0 0 60 90">
                  <path d="M4 2 C 20 20, 30 40, 34 86" />
                </svg>
                <div className="tag-card">
                  <span className="tag-hole" />
                  <span className="mono">no. {String(i + 1).padStart(2, '0')}</span>
                  <strong>{w.year}</strong>
                </div>
              </div>
            </div>
            {pill('left', prev)}
            {pill('right', next)}
          </div>

          <div className="pp-wrap">
            <div className="pp-row">
              <div className="pp-rail-space">
                <span className="pp-ghost" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <header className="pp-head">
                <div className="pp-cats">
                  {[...new Set([w.kind, ...(c.role ? c.role.split(' · ') : []), String(w.year)].map((t) => t.toLowerCase()))].map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <h1 className="pp-title">
                  {w.title}
                  {c.tagline && <span>: {c.tagline.toLowerCase()}</span>}
                </h1>
                {(w.live || w.code) && (
                  <div className="pp-buttons">
                    {w.live && (
                      <a className="btn btn-ink" href={w.live} target="_blank" rel="noreferrer">
                        live site ↗
                      </a>
                    )}
                    {w.code && (
                      <a className="btn" href={w.code} target="_blank" rel="noreferrer">
                        github ↗
                      </a>
                    )}
                  </div>
                )}
              </header>
            </div>

            <div className="pp-row">
              <nav className="pp-rail" aria-label="sections">
                <ul style={{ '--read': readPct }}>
                  {sections.map((s, n) => (
                    <li key={s.id} className={active === s.id ? 'on' : n < activeIndex ? 'read' : ''}>
                      <a
                        href={`#${s.id}`}
                        aria-current={active === s.id ? 'true' : undefined}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="pp-body">
                {sections.map((s, n) => (
                  <section key={s.id} id={s.id} className="pp-section">
                    <h2>
                      <span>{String(n + 1).padStart(2, '0')}</span> / {s.label}
                    </h2>
                    {s.award && <p className="award">★ {s.award}</p>}
                    {s.tags && (
                      <ul className="chips">
                        {s.tags.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    )}
                    {s.lede && <p className="pp-lede">{s.lede}</p>}
                    {s.body && s.body.map((para, k) => <Para key={k} html={para} />)}
                    {s.images && (
                      <div className="pp-figs">
                        {s.images.map((src) => (
                          <button key={src} className="canvas pp-fig" onClick={() => setLightbox(src)} aria-label="open full size">
                            <img src={src} alt={`${w.title} architecture diagram`} />
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" aria-label="close">
            ×
          </button>
          <img src={lightbox} alt="full size" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
