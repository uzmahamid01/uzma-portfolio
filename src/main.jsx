import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import ProjectPage from './ProjectPage.jsx';
import { useRoute } from './router.js';
import './styles.css';

function Root() {
  const { path, hash } = useRoute();
  const match = path.match(/^\/projects\/([^/]+)\/?$/);

  // Coming back to "/#work" (or any anchor): jump to it once the page has laid out.
  useEffect(() => {
    if (match || !hash) return;
    requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'instant' }));
  }, [path, hash]); // eslint-disable-line react-hooks/exhaustive-deps

  return match ? <ProjectPage slug={match[1]} /> : <App />;
}

createRoot(document.getElementById('root')).render(<Root />);
