import React from 'react';
import { createRoot } from 'react-dom/client';
import SeimasGame from '../src/SeimasGame.jsx';

const root = createRoot(document.getElementById('root'));
const start = (data) => root.render(<SeimasGame hotData={data || {}} />);
const hot = window.claude && window.claude.hot;
if (hot && hot.ready) hot.ready(start);
else start((hot && hot.data) || {});
