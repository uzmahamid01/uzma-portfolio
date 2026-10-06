// A tiny path router: the home page at "/", a page per project at
// "/projects/<slug>". No dependency needed for two kinds of page.
import { useEffect, useState } from 'react';

export const slugify = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const projectPath = (title) => `/projects/${slugify(title)}`;

export function go(to) {
  if (to === location.pathname + location.hash) return;
  history.pushState(null, '', to);
  dispatchEvent(new Event('route'));
}

export function useRoute() {
  const read = () => ({ path: location.pathname, hash: location.hash });
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => setRoute(read());
    addEventListener('popstate', onChange);
    addEventListener('route', onChange);
    return () => {
      removeEventListener('popstate', onChange);
      removeEventListener('route', onChange);
    };
  }, []);
  return route;
}

// Lets a plain <a href> navigate inside the app without a full reload.
export function linkTo(to) {
  return {
    href: to,
    onClick: (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      go(to);
    },
  };
}
