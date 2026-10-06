import { useEffect, useRef, useState } from 'react';
import { PLAYLISTS } from './data.js';

// A glass record player for the spotify playlists. Opened from anywhere with
// `openPlayer()`. The record spins (and the tonearm drops) only while Spotify
// reports it's actually playing, via the official iFrame API.

export const openPlayer = () => dispatchEvent(new Event('open-player'));

// Load Spotify's iFrame API once and hand back its IFrameAPI object.
let apiPromise;
function loadSpotify() {
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      window.onSpotifyIframeApiReady = resolve;
      const s = document.createElement('script');
      s.src = 'https://open.spotify.com/embed/iframe-api/v1';
      s.async = true;
      document.body.appendChild(s);
    });
  }
  return apiPromise;
}

export default function Player() {
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState(0);
  const [playing, setPlaying] = useState(false);
  const embedRef = useRef(null);
  const controller = useRef(null);
  const list = PLAYLISTS[pick];

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    addEventListener('open-player', onOpen);
    addEventListener('keydown', onKey);
    return () => {
      removeEventListener('open-player', onOpen);
      removeEventListener('keydown', onKey);
    };
  }, []);

  // Create the embed the first time the player opens.
  useEffect(() => {
    if (!open || controller.current) return;
    let cancelled = false;
    loadSpotify().then((IFrameAPI) => {
      if (cancelled || !embedRef.current) return;
      IFrameAPI.createController(
        embedRef.current,
        { uri: `spotify:playlist:${PLAYLISTS[pick].id}`, width: '100%', height: 152, theme: 'dark' },
        (c) => {
          controller.current = c;
          c.addListener('playback_update', (e) => setPlaying(!e.data.isPaused));
        },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (i) => {
    setPick(i);
    setPlaying(false);
    controller.current?.loadUri(`spotify:playlist:${PLAYLISTS[i].id}`);
  };

  return (
    <div className={`player-wrap ${open ? 'open' : ''}`} aria-hidden={!open}>
      <div className="player-scrim" onClick={() => setOpen(false)} />
      <section className="player" role="dialog" aria-label="music player">
        {/* The colour behind the glass: the current cover, blown up and blurred. */}
        <div className="player-glow" aria-hidden="true">
          <img key={list.cover} src={`/media/${list.cover}`} alt="" />
        </div>

        <button className="player-close" onClick={() => setOpen(false)} aria-label="close">
          ×
        </button>

        <div className="player-top">
          <div className={`deck ${playing ? 'spinning' : ''}`}>
            <div className="vinyl">
              <img className="vinyl-label" src={`/media/${list.cover}`} alt="" />
              <span className="vinyl-hole" />
            </div>
            <svg className="tonearm" viewBox="0 0 60 140" aria-hidden="true">
              <circle cx="44" cy="14" r="10" />
              <path d="M44 14 L40 104 L24 124" />
              <rect x="16" y="118" width="16" height="10" rx="2" />
            </svg>
          </div>

          <div className="player-side">
            <p className="player-kicker">{playing ? 'now spinning' : 'on rotation'}</p>
            <h3 className="player-title">{list.title}</h3>
            <p className="player-mood">{list.mood}</p>
            <div className="player-chips">
              {PLAYLISTS.map((p, i) => (
                <button key={p.id} className={`chip ${i === pick ? 'on' : ''}`} onClick={() => choose(i)}>
                  <img src={`/media/${p.cover}`} alt="" />
                  {p.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="player-embed">
          <div ref={embedRef} />
        </div>
      </section>
    </div>
  );
}
