// All copy lives here so the layout files stay about layout.

export const LINKS = {
  email: 'mailto:uzmah@stanford.edu',
  linkedin: 'https://linkedin.com/in/uzmah',
  github: 'https://github.com/uzmahamid01',
  resume: '/media/MasterResumeUHM.pdf',
  calendly: 'https://calendly.com/uzma_hamid-tamu/30min',
};

// Section 1: things i like & own, scattered around a centred heading.
// `obj` keys map to drawings in objects.jsx; `img` (optional) swaps in a picture
// from /public/media, falling back to the drawing if the file isn't there.
// `x`/`y` place each object in its panel (percent), `depth` drives parallax,
// `thread` means the string passes through it.
export const THINGS = [
  // top row
  { obj: 'laptop', img: 'laptop.png', scale: 0.72, name: 'the laptop', note: 'where it all happens.', x: 14, y: 16, depth: 20 },
  { obj: 'saturn', img: 'black-hole.png', name: 'sci-fi & time travel', note: 'dark broke my brain in the best way. interstellar finished the job.', x: 40, y: 12, depth: 30 },
  { obj: 'headphones', img: 'headphones.png', scale: 0.5, listen: true, name: 'headphones, always', note: 'on for focus, on for walks, on when nothing’s even playing.', x: 64, y: 14, depth: -10 },
  // around the sides and below
  { obj: 'tv', img: 'tv.png', screen: ['show-silo.jpg', 'show-bigbang.jpg', 'show-interstellar.jpg', 'show-odyssey.jpg'], scale: 0.85, name: 'name a show. i’ve seen it.', note: 'sci-fi, time travel, dystopia, classic. big bang theory is the comfort show.', x: 64, y: 64, depth: -20 },
  { obj: 'camera', img: 'camera.png', polaroid: ['photo-1.jpg', 'photo-2.jpg', 'photo-3.jpg', 'photo-4.jpg', 'photo-5.jpg', 'photo-6.jpg'], name: 'photography', note: 'i love taking pictures.of everything and anything. these are few.', x: 74, y: 41, depth: 15 },
  { obj: 'lego', img: 'lego-orchid.png', scale: 0.85, name: 'lego', note: 'small parts, infinite builds.', x: 10, y: 50, depth: -15 },
  { obj: 'books', img: ['art-birds.png', 'art-ghost.png'], scale: 0.62, name: 'art', note: 'a hobby that takes me back to childhood.', x: 33, y: 68, depth: 15 },
  // { obj: 'mountain', name: 'hiking', note: 'the bay has trails, so naturally i go up them.', x: 88, y: 58, depth: -40 },
];

// Section 2: where it started, and what i care for. The string threads
// through each object. `x`/`y` place each card (vw / vh from the panel's corner).
export const STORY = [
  { obj: 'controller', img: 'tomb-raider.png', kicker: 'it started with tomb raider.', line: 'the first game that got me. i had to know how those worlds were made. why cs? “i didn’t know anything else.”', x: 40, y: 52 },
  { obj: 'robot', img: 'robot-3d.png', kicker: 'then, robots.', line: 'first love. 2022: taught one to grasp things (it mostly dropped them). now: steering microrobots through blood vessels.', x: 86, y: 34 },
  { obj: 'neural', img: 'ai.png', kicker: 'and now, ai.', line: 'everyone is racing to make ai better. i care more about who makes sure it’s safe.', x: 132, y: 54 },
  { obj: 'globe', img: 'privacy-world.png', kicker: 'for people everywhere.', line: "i want to make stuff that works for everyone, and keeps their data theirs. how? still figuring that out. that's half the fun.", x: 178, y: 36 },
];


// The record player. Public playlists from spotify user 31piumjkqa4basjwvr6sctlfzes4.
export const PLAYLISTS = [
  { id: '6vpXwIaGnSbzH2KP0lEUeE', title: 'in my feels', cover: 'playlist-feels.jpg', mood: 'for the 2am overthinking' },
  { id: '3nki5CCNLP4WaFj0VWuQsN', title: 'in the dark', cover: 'playlist-dark.jpg', mood: 'lights off, headphones on' },
  { id: '77nsWEslOtxFowJdERpRT4', title: 'Juz', cover: 'playlist-juz.jpg', mood: 'just because' },
];

// Section 4: the timeline. Stops alternate above and below the string.
export const PATH = [
  { title: 'picked computer science.', body: 'drake university, iowa. long winters, short days, infinite reasons to stay in and write code.', when: '2021' },
  { title: 'fell into research.', body: 'robots, vision, physics. turns out asking “why does this break?” is a whole career.', when: '2022' },
  { title: 'switched schools.', body: 'packed up for texas a&m. new campus, same obsession, bigger sky.', when: '2023' },
  { title: 'more research. more shipping.', body: 'a stanford research summer by day, real software engineering by night. somehow, both.', when: '2024' },
  { title: 'said yes to everything.', body: 'building, research, internships, a lot of leetcode, an ieee paper, and a cap and gown. graduated. finally.', when: '2025' },
  { title: 'went all in.', body: 'became an ai engineer, sketched a fashion-tech company, and picked grad school. what better place than stanford?', when: '2026' },
  { title: 'and now…', body: 'stanford, robotics, startup, and everything else i haven’t told my calendar about yet.', when: 'now' },
];

export const CREDO = ['i notice bugs everywhere.', 'tell me it can’t be done.', 'build it anyway.', 'make it work for people.', 'repeat.'];

// Work list. `media` is a video or image in /public/media; `obj` is the fallback drawing.
export const WORK = [
  { title: 'Secret Garden', year: 2026, kind: 'multi-agent · privacy', award: '1st place · stanford collaborative agent hackathon', blurb: 'A decentralized multi-agent event planner where everyone’s preferences stay on their own device. Schema-based output guards, binary consent and a disclosure ledger that measures leakage in bits.', tags: ['Python', 'Flower', 'Multi-agent', 'Distributed AI'], obj: 'shield' },
  { title: 'Gaussian Research Graph', year: 2026, kind: 'research · agents', blurb: 'An agent that read 70+ Gaussian Splatting papers and built a Neo4j knowledge graph of the methods, datasets and ideas inside them, with 85% relationship-extraction accuracy.', tags: ['TypeScript', 'Python', 'Neo4j', 'LLMs'], media: 'gaussian.png' },
  { title: 'DeepNeural', year: 2026, kind: 'web app', blurb: 'An infinite scroll for AI/ML research from 8 sources: BM25 full-text search, Claude summaries with caching, cron ingestion and full PWA support.', tags: ['Next.js', 'Anthropic API', 'Turso', 'Drizzle'], media: 'deepneural.mp4', live: 'https://deepneuralscroll.vercel.app/', code: 'https://github.com/uzmahamid01/deepneural' },
  { title: 'ShieldED Haven', year: 2026, kind: 'startup', blurb: 'AI-powered cyberbullying detection. A multi-model pipeline (fine-tuned BERT, Llama 2, LLM fallback) at 92% accuracy, with real-time alerts across ~5K daily events.', tags: ['BERT', 'Llama 2', 'WebSockets', 'CI/CD'], media: 'sh.mp4', live: 'https://shieldedhaven.com' },
  { title: 'Yemberzal', year: 2025, kind: 'web app', blurb: 'A marketplace and search engine bringing Kashmiri clothing and craft to a global audience, linking straight to artisan brands.', tags: ['E-commerce', 'Search', 'Culture'], media: 'yemberzal.mp4', live: 'https://theyemberzal.com' },
  { title: 'Zyora', year: 2025, kind: 'chrome extension', blurb: 'Virtual try-on for online shopping. Pick a garment on any page and see yourself wearing it, generated with Vertex AI.', tags: ['React', 'Vertex AI', 'Firebase'], media: 'zyora.mp4', live: 'https://chromewebstore.google.com/detail/zyora/fnjejfgmebolpelbegpjekpafcammkhc' },
  { title: 'M3SH', year: 2025, kind: '3d platform', blurb: 'Cloud-native 3D model management: upload, store and inspect 3D assets right in the browser, no desktop software.', tags: ['Three.js', 'R3F', 'Firebase'], media: 'meshh.png', code: 'https://github.com/uzmahamid01/m3sh' },
  { title: 'iChild HealthWise', year: 2024, kind: 'ai · health', blurb: 'A RAG-powered health assistant for pregnant women and families, grounded in the OliviaHealth knowledge base. 18% more accurate answers, 25% faster search.', tags: ['LangChain', 'Flask', 'PostgreSQL', 'AWS'], media: 'ichild.mp4', live: 'https://oliviahealth.org/', code: 'https://github.com/oliviahealth/ichild' },
  { title: 'Accuracy on the Negative Line', year: 2024, kind: 'ml research', blurb: 'Why models that ace their benchmarks can do worse on shifted, real-world data, and what that means for deploying them.', tags: ['Keras', 'sklearn', 'OOD'], media: 'poster.png', code: 'https://github.com/uzmahamid01/stan' },
  { title: 'Cleo', year: 2024, kind: 'software', blurb: 'A course schedule builder that recommends classes around degree requirements and prerequisites.', tags: ['Rails', 'PostgreSQL', 'Docker'], media: 'cleo.png', live: 'https://teamup.org/apps/cleo/' },
  { title: 'Revs', year: 2024, kind: 'software', blurb: 'A modern point-of-sale system for Rev’s Grill, from orders to inventory.', tags: ['Django', 'PostgreSQL', 'OAuth'], media: 'revs.mp4' },
  { title: 'CreatorVerse', year: 2023, kind: 'web app', blurb: 'A curated home for discovering top creators and builders across fields.', tags: ['React', 'Node.js', 'PostgreSQL'], media: 'creator.png', code: 'https://github.com/uzmahamid01/CreatorVerse' },
  { title: 'Connect Four', year: 2023, kind: 'game', blurb: 'The classic, in JavaFX, with a single-player opponent and a clean MVC core.', tags: ['Java', 'JavaFX', 'MVC'], media: 'connect-four.mp4', code: 'https://github.com/uzmahamid01/Connect-Four' },
  { title: 'Robot Object Grasping', year: 2022, kind: 'robotics research', blurb: 'Better robotic grasping with image segmentation and graph neural networks that model how object parts relate in clutter.', tags: ['PyTorch', 'GNNs', 'Segmentation'], media: 'grasping.png' },
];

export const PLAY = [
  {
    title: 'Museum of Everything',
    exhibit: 'museum',
    blurb: 'every ordinary thing gets a plinth and a label.',
    medium: 'react, curiosity, an unreasonable love of paperclips',
    cta: 'enter the museum',
    live: 'https://museum-of-everything.vercel.app/',
  },
  {
    title: 'Dandelion',
    exhibit: 'dandelion',
    blurb: 'make a wish, then blow into your mic.',
    medium: 'web audio api, framer motion, one deep breath',
    cta: 'make a wish',
    live: 'https://blowawish.vercel.app/',
  },
];

// Earlier versions of this site, newest first (from v1's archive page).
export const VERSIONS = [
  { year: 2026, title: 'research portfolio', note: 'papers and projects, laid out plain so the work does the talking.', url: 'https://uzmahamid.vercel.app/' },
  { year: 2026, title: 'portfolio', note: 'ai, ml, product and design in one place, with architecture diagrams.', url: 'https://uzmahamid.netlify.app/' },
  { year: 2025, title: 'portfolio', note: 'the full-stack era: backend systems and database architecture.', url: 'https://uzmah.netlify.app/' },
];
