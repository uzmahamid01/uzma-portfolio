// Ink drawings, in the same hand as the desk doodle. Each is a 200×200 SVG.
// Stroke and fill colours come from CSS variables so the palette stays in one place.

const INK = 'var(--ink)';
const PAPER = 'var(--paper)';
const RED = 'var(--accent)';
const RED_DARK = 'var(--accent-dark)';
const RED_MID = 'var(--accent-mid)';

const line = { stroke: INK, strokeWidth: 3.2, strokeLinecap: 'round', strokeLinejoin: 'round' };

function Robot() {
  return (
    <g {...line}>
      <line x1="100" y1="30" x2="100" y2="48" />
      <circle cx="100" cy="26" r="5" fill={RED} />
      <rect x="68" y="48" width="64" height="44" rx="10" fill={PAPER} />
      <circle cx="86" cy="70" r="9" fill={PAPER} />
      <circle cx="114" cy="70" r="9" fill={PAPER} />
      <circle cx="87" cy="70" r="3.5" fill={INK} />
      <circle cx="115" cy="70" r="3.5" fill={INK} />
      <rect x="92" y="92" width="16" height="8" fill={PAPER} />
      <path d="M62 112 C44 118 40 136 46 150" fill="none" />
      <path d="M38 148 l8 4 l6 -8" fill="none" />
      <path d="M138 112 C156 118 160 136 154 150" fill="none" />
      <path d="M162 148 l-8 4 l-6 -8" fill="none" />
      <rect x="62" y="100" width="76" height="58" rx="8" fill={PAPER} />
      <rect x="80" y="112" width="40" height="18" rx="3" fill={INK} />
      <path d="M84 121 h6 l3 -4 l4 8 l3 -4 h16" stroke={PAPER} strokeWidth="2" fill="none" />
      <circle cx="86" cy="145" r="3" fill={INK} />
      <circle cx="100" cy="145" r="3" fill={RED} />
      <circle cx="114" cy="145" r="3" fill={INK} />
      <rect x="60" y="158" width="80" height="20" rx="10" fill={PAPER} />
      <circle cx="74" cy="168" r="4.5" fill={INK} />
      <circle cx="100" cy="168" r="4.5" fill={INK} />
      <circle cx="126" cy="168" r="4.5" fill={INK} />
    </g>
  );
}

function Lego() {
  // Isometric 2×2 brick: top face, two side faces, four studs drawn back-to-front.
  const studs = [[100, 65], [74, 80], [126, 80], [100, 95]];
  return (
    <g {...line}>
      <path d="M48 80 L100 110 L100 150 L48 120 Z" fill={RED_DARK} />
      <path d="M100 110 L152 80 L152 120 L100 150 Z" fill={RED_MID} />
      <path d="M100 50 L152 80 L100 110 L48 80 Z" fill={RED} />
      {studs.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <path d={`M${x - 10} ${y} v-7 a10 5.8 0 0 0 20 0 v7 a10 5.8 0 0 1 -20 0 Z`} fill={RED_MID} />
          <ellipse cx={x} cy={y - 7} rx="10" ry="5.8" fill={RED} />
        </g>
      ))}
    </g>
  );
}

function Saturn() {
  return (
    <g {...line}>
      <g transform="rotate(-18 100 100)">
        <ellipse cx="100" cy="100" rx="80" ry="19" fill="none" />
      </g>
      <circle cx="100" cy="100" r="38" fill={PAPER} />
      <path d="M66 86 Q100 78 134 86" fill="none" strokeWidth="2" />
      <path d="M63 101 Q100 93 137 101" fill="none" strokeWidth="2" />
      <path d="M68 118 Q100 111 132 118" fill="none" strokeWidth="2" />
      <g transform="rotate(-18 100 100)">
        <path d="M20 100 A80 19 0 0 0 180 100" fill="none" />
        <path d="M30 100 A70 14 0 0 0 170 100" fill="none" strokeWidth="1.6" />
      </g>
      <circle cx="160" cy="46" r="6" fill={RED} />
      <path d="M40 40 v10 M35 45 h10 M164 150 v8 M160 154 h8" strokeWidth="2" />
    </g>
  );
}

function Cat() {
  return (
    <g {...line}>
      <ellipse cx="102" cy="176" rx="52" ry="5" fill={INK} opacity="0.08" stroke="none" />
      <path d="M126 170 C162 170 170 140 150 126" fill="none" strokeWidth="9" />
      <path d="M70 172 C60 140 70 106 100 100 C130 106 142 140 132 172 Z" fill={INK} />
      <path d="M73 70 L75 38 L93 56 Z" fill={INK} />
      <path d="M127 70 L125 38 L107 56 Z" fill={INK} />
      <ellipse cx="100" cy="78" rx="30" ry="26" fill={INK} />
      <ellipse cx="89" cy="78" rx="6" ry="3.8" fill={PAPER} stroke="none" />
      <ellipse cx="111" cy="78" rx="6" ry="3.8" fill={PAPER} stroke="none" />
      <ellipse cx="89" cy="78" rx="1.4" ry="3.2" fill={INK} stroke="none" />
      <ellipse cx="111" cy="78" rx="1.4" ry="3.2" fill={INK} stroke="none" />
      <path d="M97 90 l3 3 l3 -3" stroke={PAPER} strokeWidth="1.6" fill="none" />
      <path d="M72 86 L48 82 M72 91 L48 93 M128 86 L152 82 M128 91 L152 93" strokeWidth="1.4" />
    </g>
  );
}

function Camera() {
  return (
    <g {...line}>
      <path d="M52 72 V60 h28 v12" fill={PAPER} />
      <rect x="58" y="52" width="16" height="6" rx="2" fill={RED} />
      <rect x="36" y="72" width="128" height="80" rx="10" fill={PAPER} />
      <rect x="36" y="94" width="128" height="40" fill={INK} />
      <rect x="124" y="80" width="26" height="9" rx="2" fill={PAPER} strokeWidth="2.4" />
      <circle cx="100" cy="113" r="31" fill={PAPER} />
      <circle cx="100" cy="113" r="21" fill={INK} />
      <circle cx="100" cy="113" r="9" fill="none" stroke={PAPER} strokeWidth="2" />
      <path d="M90 104 a12 12 0 0 1 8 -4" stroke={PAPER} strokeWidth="2.4" fill="none" />
      <circle cx="50" cy="83" r="3" fill={INK} />
    </g>
  );
}

function Mountain() {
  return (
    <g {...line}>
      <path d="M10 160 H190" />
      <path d="M60 160 L110 70 L160 160 Z" fill={PAPER} />
      <path d="M97 94 l7 -4 l8 9 l7 -9 l5 4" fill="none" />
      <path d="M20 160 L72 96 L124 160 Z" fill={PAPER} />
      <path d="M40 160 C70 150 58 132 78 120" fill="none" strokeDasharray="1 7" />
      <line x1="110" y1="70" x2="110" y2="44" />
      <path d="M110 44 l20 6 l-20 6 Z" fill={RED} />
      <circle cx="160" cy="44" r="10" fill="none" strokeWidth="2" />
    </g>
  );
}

function Shield() {
  return (
    <g {...line}>
      <path d="M100 28 L156 48 V98 C156 136 130 160 100 174 C70 160 44 136 44 98 V48 Z" fill={PAPER} />
      <path d="M100 42 L144 58 V98 C144 128 124 148 100 160" fill="none" strokeWidth="1.6" />
      <circle cx="100" cy="92" r="13" fill={INK} />
      <path d="M94 100 L90 128 H110 L106 100 Z" fill={INK} />
      <circle cx="100" cy="92" r="4" fill={RED} stroke="none" />
    </g>
  );
}

function Neural() {
  const layers = [
    [[40, 60], [40, 100], [40, 140]],
    [[100, 42], [100, 80], [100, 120], [100, 158]],
    [[160, 80], [160, 120]],
  ];
  const edges = [];
  for (let l = 0; l < layers.length - 1; l++)
    for (const a of layers[l]) for (const b of layers[l + 1]) edges.push([a, b]);
  const lit = new Set(['100,80', '160,120', '40,60']);
  return (
    <g {...line}>
      {edges.map(([a, b], i) => (
        <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} strokeWidth="1.4" />
      ))}
      {layers.flat().map(([x, y]) => (
        <circle key={`${x},${y}`} cx={x} cy={y} r="10" fill={lit.has(`${x},${y}`) ? RED : PAPER} />
      ))}
    </g>
  );
}

function Globe() {
  return (
    <g {...line}>
      <circle cx="100" cy="100" r="58" fill={PAPER} />
      <ellipse cx="100" cy="100" rx="24" ry="58" fill="none" strokeWidth="2" />
      <ellipse cx="100" cy="100" rx="46" ry="58" fill="none" strokeWidth="2" />
      <path d="M42 100 H158 M49 72 H151 M49 128 H151" strokeWidth="2" />
      <g transform="rotate(16 100 100)">
        <ellipse cx="100" cy="100" rx="88" ry="22" fill="none" strokeDasharray="2 8" strokeWidth="2.4" />
      </g>
      <path d="M126 70 c0 -10 -14 -10 -14 0 c0 8 7 14 7 18 c0 -4 7 -10 7 -18 Z" fill={RED} />
      <circle cx="119" cy="70" r="2.4" fill={PAPER} stroke="none" />
    </g>
  );
}

// A little CRT. `title` is whatever is "on" right now.
function Tv({ title = '' }) {
  return (
    <g {...line}>
      <path d="M78 52 L58 22 M122 52 L144 18" />
      <circle cx="58" cy="22" r="3.5" fill={INK} />
      <circle cx="144" cy="18" r="3.5" fill={RED} />
      <path d="M64 168 l-8 14 M136 168 l8 14" />
      <rect x="26" y="52" width="148" height="118" rx="16" fill={PAPER} />
      <rect x="40" y="66" width="98" height="88" rx="12" fill={INK} />
      <path d="M50 76 q10 -4 22 -2" stroke={PAPER} strokeWidth="2" fill="none" opacity="0.5" />
      <text x="89" y="114" textAnchor="middle" fill={PAPER} stroke="none" fontFamily="var(--mono)" fontSize={title.length > 12 ? 7.5 : 10} letterSpacing="0.8">
        {title.toUpperCase()}
      </text>
      <circle cx="156" cy="84" r="7" fill={PAPER} />
      <path d="M156 84 l3 -5" strokeWidth="2" />
      <circle cx="156" cy="108" r="5" fill={RED} />
      <path d="M150 128 h12 M150 136 h12 M150 144 h12" strokeWidth="2" />
    </g>
  );
}

function Books() {
  const spine = { stroke: 'none', fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: 1 };
  return (
    <g {...line}>
      <rect x="40" y="134" width="124" height="28" rx="3" fill={PAPER} />
      <text x="102" y="152" textAnchor="middle" fill={INK} {...spine}>CLEAN CODE</text>
      <rect x="30" y="106" width="132" height="28" rx="3" fill={INK} />
      <text x="96" y="123" textAnchor="middle" fill={PAPER} {...spine} fontSize="6.4" letterSpacing="0.4">THE PRAGMATIC PROGRAMMER</text>
      <rect x="50" y="78" width="104" height="28" rx="3" fill={RED} />
      <text x="102" y="96" textAnchor="middle" fill={PAPER} {...spine}>GBR</text>
      <path d="M140 78 v-20 l6 5 l6 -5 v20" fill={PAPER} strokeWidth="2.4" />
      <path d="M20 162 H180" />
    </g>
  );
}

function Rocket() {
  return (
    <g {...line}>
      <path d="M90 150 Q100 184 110 150" fill="none" strokeDasharray="2 6" />
      <path d="M72 112 L48 148 L72 140 Z" fill={RED} />
      <path d="M128 112 L152 148 L128 140 Z" fill={RED} />
      <path d="M100 22 C126 42 132 82 128 140 H72 C68 82 74 42 100 22 Z" fill={PAPER} />
      <circle cx="100" cy="76" r="13" fill={INK} />
      <circle cx="96" cy="72" r="3.5" fill={PAPER} stroke="none" />
      <path d="M74 106 H126" strokeWidth="2" />
      <rect x="84" y="140" width="32" height="10" rx="2" fill={INK} />
      <path d="M34 44 v10 M29 49 h10 M168 92 v8 M164 96 h8" strokeWidth="2" />
      <circle cx="160" cy="38" r="3" fill={INK} />
    </g>
  );
}

// The game controller tomb raider was played on.
function Controller() {
  return (
    <g {...line}>
      <path d="M60 70 H140 C168 70 184 92 188 124 C192 156 176 172 160 168 C148 165 140 150 128 142 H72 C60 150 52 165 40 168 C24 172 8 156 12 124 C16 92 32 70 60 70 Z" fill={PAPER} />
      <path d="M52 94 h12 v10 h10 v12 h-10 v10 h-12 v-10 h-10 v-12 h10 Z" fill={INK} />
      <circle cx="142" cy="94" r="6" fill={RED} />
      <circle cx="155" cy="107" r="6" fill={INK} />
      <circle cx="129" cy="107" r="6" fill={PAPER} />
      <circle cx="142" cy="120" r="6" fill={INK} />
      <circle cx="82" cy="130" r="10" fill={PAPER} />
      <circle cx="82" cy="130" r="4" fill={INK} />
      <circle cx="118" cy="130" r="10" fill={PAPER} />
      <circle cx="118" cy="130" r="4" fill={INK} />
      <path d="M90 92 h20" strokeWidth="2.4" />
      <path d="M70 70 q4 -12 14 -12 M130 70 q-4 -12 -14 -12" fill="none" strokeWidth="2.4" />
    </g>
  );
}

// An open laptop, seen from behind, covered in stickers.
function Laptop() {
  return (
    <g {...line}>
      {/* base in perspective first, then the lid tilted back over it */}
      <path d="M14 150 L64 128 H190 L150 166 H18 Z" fill={PAPER} />
      <path d="M40 152 L72 136 H168 L142 156 Z" fill={INK} opacity="0.12" stroke="none" />
      <path d="M34 150 L52 44 H172 L156 150 Z" fill={PAPER} />
      <path d="M40 146 L56 50" strokeWidth="1.6" opacity="0.5" />
      {/* stickers: a red 2×2 brick, a cat, a smiley, a {} */}
      <rect x="66" y="64" width="26" height="18" rx="2" fill={RED} />
      <circle cx="73" cy="64" r="3" fill={RED} />
      <circle cx="85" cy="64" r="3" fill={RED} />
      <path d="M128 112 l3 -10 l5 7 h8 l5 -7 l3 10 a13 12 0 0 1 -24 0 Z" fill={INK} />
      <circle cx="78" cy="118" r="11" fill={PAPER} strokeWidth="2.4" />
      <path d="M73 116 v1 M83 116 v1 M73 121 q5 4 10 0" fill="none" strokeWidth="2" />
      <path d="M126 70 q-5 0 -5 5 v3 q0 3 -3 3 q3 0 3 3 v3 q0 5 5 5 M144 70 q5 0 5 5 v3 q0 3 3 3 q-3 0 -3 3 v3 q0 5 -5 5" fill="none" strokeWidth="2.4" />
    </g>
  );
}

function Headphones() {
  return (
    <g {...line}>
      <path d="M46 116 V96 C46 50 154 50 154 96 V116" fill="none" strokeWidth="9" stroke={INK} />
      <path d="M58 104 V96 C58 62 142 62 142 96 V104" fill="none" strokeWidth="2" />
      <rect x="28" y="106" width="34" height="56" rx="14" fill={INK} />
      <rect x="138" y="106" width="34" height="56" rx="14" fill={INK} />
      <rect x="56" y="114" width="12" height="40" rx="6" fill={RED} />
      <rect x="132" y="114" width="12" height="40" rx="6" fill={RED} />
    </g>
  );
}

const DRAWINGS = {
  laptop: Laptop,
  headphones: Headphones,
  controller: Controller, robot: Robot, lego: Lego, saturn: Saturn, cat: Cat, camera: Camera, mountain: Mountain, shield: Shield, neural: Neural, globe: Globe, tv: Tv, books: Books, rocket: Rocket };

export function Obj({ name, className = '', ...props }) {
  const Drawing = DRAWINGS[name];
  return (
    <svg className={`obj ${className}`} viewBox="0 0 200 200" aria-hidden="true">
      <g filter="url(#ink)">
        <Drawing {...props} />
      </g>
    </svg>
  );
}

// Mounted once; every drawing references it for the slightly wobbly ink edge.
export function InkDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <filter id="ink" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="2.4" />
      </filter>
    </svg>
  );
}
