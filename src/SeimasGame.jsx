/*
 * Seimas: Battle for Lithuania
 * A mobile-first campaign & coalition simulator of Lithuania's mixed electoral system:
 * 70 proportional seats (5% threshold, Hare–Niemeyer) + 71 single-mandate seats (two-round runoff).
 * Single-file React component. Tailwind CSS + lucide-react. No external APIs.
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Map as MapIcon, BarChart3, Landmark, Newspaper, ChevronRight, ChevronDown, X, Zap, Wallet, TrendingUp,
  TrendingDown, Megaphone, Smartphone, Radio, DoorOpen, Swords, Users, Shield, Home, HeartPulse, Truck,
  Factory, Tractor, Plane, Anchor, GraduationCap, Globe, Coins, HandCoins, Handshake, Crown, Vote,
  RotateCcw, HelpCircle, AlertTriangle, Flame, Mic, Scale, Leaf, Info, ArrowRight, TramFront, TrainFront,
  Languages, PiggyBank, Trophy, Music, Mail, SkipForward, Award, Check, Lock, Building2, Tv, Target,
  Briefcase, Play, Sparkles, ShieldAlert, Siren, Flag,
} from 'lucide-react';

/* ============================================================
   Typography & layout tokens
   ============================================================ */
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap';
const F_DISPLAY = { fontFamily: "'Archivo', 'Arial Narrow', 'Roboto Condensed', sans-serif", fontStretch: '74%' };
const F_MONO = { fontFamily: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace", fontVariantNumeric: 'tabular-nums' };
const F_BODY = "'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const GUTTER = {
  paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))',
  paddingRight: 'max(16px, env(safe-area-inset-right, 0px))',
};
const FLAG = { y: '#FDB913', g: '#006A44', r: '#C1272D' };
const GOLD = '#FBBF24';

const GLOBAL_CSS = `
@keyframes sbl-up { from { transform: translateY(28px); opacity: 0 } to { transform: none; opacity: 1 } }
@keyframes sbl-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes sbl-pop { 0% { transform: scale(.6); opacity: 0 } 70% { transform: scale(1.08) } 100% { transform: scale(1); opacity: 1 } }
@keyframes sbl-toast { from { transform: translateY(12px); opacity: 0 } to { transform: none; opacity: 1 } }
@keyframes sbl-blink { 0%, 100% { opacity: 1 } 50% { opacity: .35 } }
.sbl-sheet { animation: sbl-up .28s cubic-bezier(.2,.8,.2,1) both }
.sbl-fade { animation: sbl-fade .2s ease both }
.sbl-pop { animation: sbl-pop .35s ease both }
.sbl-toast { animation: sbl-toast .22s ease both }
.sbl-blink { animation: sbl-blink 1.2s ease-in-out infinite }
.sbl-scroll { -webkit-overflow-scrolling: touch; overscroll-behavior: contain }
.sbl-map path, .sbl-map rect { transition: fill-opacity .35s ease, fill .35s ease }
@media (prefers-reduced-motion: reduce) {
  .sbl-sheet, .sbl-fade, .sbl-pop, .sbl-toast, .sbl-blink { animation: none !important }
  .sbl-map path, .sbl-map rect { transition: none }
}
`;

/* ============================================================
   Utilities
   ============================================================ */
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const clone = (o) => JSON.parse(JSON.stringify(o));
const sum = (arr) => arr.reduce((a, b) => a + b, 0);
function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(rand = Math.random) {
  let u = 0, v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function weightedPick(weights, rand = Math.random) {
  const t = sum(weights) * rand();
  let acc = 0;
  for (let i = 0; i < weights.length; i++) { acc += weights[i]; if (t <= acc) return i; }
  return weights.length - 1;
}
const fmtEur = (k) => {
  const v = Math.round(k);
  if (Math.abs(v) >= 1000) return `€${(v / 1000).toFixed(2)}M`;
  return `€${v}k`;
};
const fmtSigned = (x, d = 1) => `${x >= 0 ? '+' : '−'}${Math.abs(x).toFixed(d)}`;
const fmtInt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/* ============================================================
   Parties
   ============================================================ */
const PARTIES = {
  LSDP: {
    id: 'LSDP', short: 'LSDP', name: 'Socialdemokratai', full: 'Lietuvos socialdemokratų partija', color: '#E11D48',
    ideology: 'Centre-left', pos: { econ: -30, social: 0, defense: 60, green: 30 }, funds: 1200,
    strongholds: 'Rural municipalities & industrial towns: Jonava, Alytus, Akmenė',
    trait: 'Welfare machine', traitDesc: 'Pension and cost-of-living pledges land 40% harder. Rural rallies +15%. Deep local branches.',
    difficulty: 'Standard',
  },
  TS: {
    id: 'TS', short: 'TS-LKD', name: 'Tėvynės sąjunga', full: 'Tėvynės sąjunga – Lietuvos krikščionys demokratai', color: '#0284C7',
    ideology: 'Centre-right · Conservative', pos: { econ: 30, social: 30, defense: 90, green: 30 }, funds: 1400,
    strongholds: 'Vilnius, Kaunas and the diaspora',
    trait: 'Security & donors', traitDesc: 'Defence messaging +30%, fundraising ×1.6. Rural voters push back: rural rallies −15%.',
    difficulty: 'Standard',
  },
  NA: {
    id: 'NA', short: 'NA', name: 'Nemuno aušra', full: 'Partija „Nemuno aušra“', color: '#D97706',
    ideology: 'Right-wing populist', pos: { econ: -30, social: 60, defense: 0, green: -60 }, funds: 700,
    strongholds: 'Samogitia (Žemaitija) and rural provinces',
    trait: 'Rally machine', traitDesc: 'Rallies cost half and hit 30% harder. Scandal risk builds twice as fast and hurts 50% more.',
    difficulty: 'Standard',
  },
  DSVL: {
    id: 'DSVL', short: 'DSVL', name: 'Vardan Lietuvos', full: 'Demokratų sąjunga „Vardan Lietuvos“', color: '#0D9488',
    ideology: 'Centre-left · Green-conservative', pos: { econ: 0, social: 30, defense: 60, green: 60 }, funds: 900,
    strongholds: 'Central Lithuania and moderate voters',
    trait: 'Kingmaker', traitDesc: '+20 compatibility with every party in coalition talks. Moderate image: attacks backfire more often.',
    difficulty: 'Hard',
  },
  LS: {
    id: 'LS', short: 'LS', name: 'Liberalų sąjūdis', full: 'Lietuvos Respublikos liberalų sąjūdis', color: '#EAB308',
    ideology: 'Classical liberal', pos: { econ: 60, social: -60, defense: 60, green: 30 }, funds: 1000,
    strongholds: 'Klaipėda, Vilnius and the coastal resorts',
    trait: 'Business & youth', traitDesc: 'Fundraising ×1.35. Digital ads +25% and extra youth turnout in cities.',
    difficulty: 'Hard',
  },
  LVZS: {
    id: 'LVZS', short: 'LVŽS', name: 'Valstiečiai ir žalieji', full: 'Lietuvos valstiečių ir žaliųjų sąjunga', color: '#16A34A',
    ideology: 'Agrarian · Social conservative', pos: { econ: -30, social: 90, defense: 30, green: 0 }, funds: 850,
    strongholds: 'Rural Aukštaitija and Suvalkija',
    trait: 'Village roots', traitDesc: 'Farm and family pledges +40%. Rural rallies and TV/radio +20%.',
    difficulty: 'Hard',
  },
  LP: {
    id: 'LP', short: 'LP', name: 'Laisvės partija', full: 'Laisvės partija', color: '#DB2777',
    ideology: 'Progressive liberal', pos: { econ: 30, social: -90, defense: 60, green: 60 }, funds: 550,
    strongholds: 'Young voters in Vilnius and Kaunas',
    trait: 'Viral', traitDesc: 'Digital ads ×1.6. Weak outside the big cities (−40%). Starts just under the 5% threshold.',
    difficulty: 'Very hard',
  },
  LLRA: {
    id: 'LLRA', short: 'LLRA-KŠS', name: 'Lenkų rinkimų akcija', full: 'Lietuvos lenkų rinkimų akcija – Krikščioniškų šeimų sąjunga', color: '#881337',
    ideology: 'Polish minority · Christian conservative', pos: { econ: -30, social: 90, defense: 0, green: -30 }, funds: 450,
    strongholds: 'Vilnius District and Šalčininkai',
    trait: 'Fortress vote', traitDesc: 'Campaigning in Vilnius County ×1.5, Vilnius City ×1.3, elsewhere ×0.45. Can win single-mandate seats even below 5%.',
    difficulty: 'Very hard',
  },
  KITI: {
    id: 'KITI', short: 'Kiti', name: 'Others & independents', full: 'Minor parties and independent candidates', color: '#64748B',
    ideology: 'Fragmented', pos: { econ: -10, social: 30, defense: 30, green: 0 },
  },
};
const PARTY_IDS = ['LSDP', 'TS', 'NA', 'DSVL', 'LS', 'LVZS', 'LP', 'LLRA'];
const ALL_IDS = [...PARTY_IDS, 'KITI'];
const SEAT_ORDER = ['LSDP', 'DSVL', 'LVZS', 'NA', 'LLRA', 'KITI', 'LP', 'LS', 'TS'];
const WEEKS = 12;
const MAJORITY = 71;
const DEBATE_WEEKS = [4, 8, 11];
const FUND_MULT = { LSDP: 1, TS: 1.6, NA: 0.7, DSVL: 0.95, LS: 1.35, LVZS: 0.9, LP: 0.85, LLRA: 0.8 };
const BACKFIRE = { LSDP: 0.22, TS: 0.2, NA: 0.07, DSVL: 0.38, LS: 0.22, LVZS: 0.18, LP: 0.2, LLRA: 0.25 };
const FATIGUE = [1, 0.8, 0.62, 0.48, 0.38, 0.3];

/* ============================================================
   Policy axes
   ============================================================ */
const AXES = [
  { id: 'econ', label: 'Economy & taxes', icon: Coins, left: 'Redistribute', right: 'Cut taxes',
    steps: ['Wealth tax', 'Progressive tax', 'Social market', 'Centrist', 'Pro-business', 'Tax cuts', 'Flat & lean'] },
  { id: 'social', label: 'Social values', icon: Users, left: 'Progressive', right: 'Traditional',
    steps: ['Radical liberal', 'Progressive', 'Liberal', 'Centrist', 'Traditional', 'Conservative', 'Family values'] },
  { id: 'defense', label: 'Defence spending', icon: Shield, left: 'Lower', right: 'Maximum',
    steps: ['2.5% GDP', '3% GDP', '3.5% GDP', '4% GDP', '5% GDP', '5.5% GDP', '6%+ GDP'] },
  { id: 'green', label: 'Green & energy', icon: Leaf, left: 'Cheap fossil', right: 'Fast transition',
    steps: ['Gas & oil first', 'Slow transition', 'Energy security', 'Balanced', 'Wind & solar', 'Green deal+', 'Net zero 2040'] },
];
const AXIS_IDS = AXES.map((a) => a.id);
const stepIndex = (v) => clamp(Math.round((v + 90) / 30), 0, 6);

/* ============================================================
   Local issues
   ============================================================ */
const ISSUES = {
  col: { label: 'Cost of living', icon: Wallet },
  def: { label: 'Defence & Belarus border', icon: Shield },
  roads: { label: 'Roads & infrastructure', icon: Truck },
  health: { label: 'Healthcare access', icon: HeartPulse },
  tax: { label: 'Taxes', icon: Coins },
  housing: { label: 'Housing prices', icon: Home },
  transit: { label: 'Public transport', icon: TramFront },
  jobs: { label: 'Jobs & investment', icon: Factory },
  emig: { label: 'Emigration', icon: Plane },
  agri: { label: 'Farm incomes', icon: Tractor },
  energy: { label: 'Energy prices', icon: Zap },
  port: { label: 'Port & logistics', icon: Anchor },
  minority: { label: 'Minority language rights', icon: Languages },
  diaspora: { label: 'Dual citizenship', icon: Globe },
  pensions: { label: 'Pensions', icon: PiggyBank },
  trust: { label: 'Trust in politicians', icon: Scale },
};

/* ============================================================
   Map geometry (hand-projected, ~lon/lat → SVG units)
   ============================================================ */
const V = {
  O1: [12, 50], O2: [48, 14], K1: [62, 19], O3: [75, 24], T1: [112, 15], O4: [116, 14], O5: [156, 21], O6: [197, 18],
  S1: [211, 14], O7: [231, 9], O8: [262, 24], O9: [303, 53], O10: [326, 65], P1: [337, 72], O11: [360, 88],
  O12: [390, 98], O13: [388, 124], U1: [392, 145], O14: [398, 156], O15: [367, 171], O16: [337, 201], O17: [330, 230],
  O18: [330, 248], O19: [309, 271], A3: [290, 271], O20: [272, 271], O21: [241, 289], O22: [209, 295], O23: [177, 301],
  O24: [177, 268], M5: [160, 261], O25: [143, 254], O26: [124, 242], O27: [133, 204], O28: [114, 169], O29: [68, 168],
  K6: [50, 158], O30: [27, 145], O31: [30, 142], O32: [23, 114], O33: [16, 93], O34: [12, 68],
  K2: [56, 52], K3: [48, 80], K4: [52, 108], K5: [58, 132], T2: [114, 45], T3: [108, 78], T4: [88, 100],
  TA1: [120, 112], TA2: [130, 140], TA3: [152, 168], S2: [212, 60], S3: [200, 95], S4: [178, 112], S5: [150, 118],
  P2: [322, 92], P3: [290, 98], P4: [262, 112], P5: [225, 120], U2: [350, 150], U3: [322, 165], U4: [292, 160],
  U5: [278, 135], V1: [240, 150], V2: [250, 175], V3: [248, 200], V4: [238, 225], A1: [262, 238], A2: [282, 250],
  A4: [215, 232], M1: [185, 178], M2: [190, 205], M3: [188, 228], M4: [172, 248],
};
const COAST = new Set(['O30', 'O31', 'O32', 'O33', 'O34', 'O1']);
function edgePts(a, b) {
  const flip = a > b;
  const [ka, kb] = flip ? [b, a] : [a, b];
  const A = V[ka], B = V[kb];
  const rand = mulberry32(hashStr(`${ka}|${kb}`));
  const len = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const n = Math.max(1, Math.round(len / 8));
  const nx = -(B[1] - A[1]) / len, ny = (B[0] - A[0]) / len;
  const amp = COAST.has(ka) && COAST.has(kb) ? 0.7 : 2.1;
  const pts = [];
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const off = (rand() - 0.5) * 2 * amp;
    pts.push([A[0] + (B[0] - A[0]) * t + nx * off, A[1] + (B[1] - A[1]) * t + ny * off]);
  }
  return flip ? pts.reverse() : pts;
}
function polyPath(names) {
  const pts = [];
  names.forEach((nm, i) => {
    const next = names[(i + 1) % names.length];
    pts.push(V[nm]);
    pts.push(...edgePts(nm, next));
  });
  return `M${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L')}Z`;
}
function blobPath(cx, cy, r, seed) {
  const rand = mulberry32(seed);
  const n = 16;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (0.86 + rand() * 0.24);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.92]);
  }
  return `M${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L')}Z`;
}
const SPIT = 'M14.5,92 L12.2,97 L9,112 L6.2,128 L4.2,144.5 L6.2,145 L8.4,128 L11.2,112 L14.6,97.5 Z';
const OUTLINE = ['O1', 'O2', 'K1', 'O3', 'T1', 'O4', 'O5', 'O6', 'S1', 'O7', 'O8', 'O9', 'O10', 'P1', 'O11', 'O12', 'O13',
  'U1', 'O14', 'O15', 'O16', 'O17', 'O18', 'O19', 'A3', 'O20', 'O21', 'O22', 'O23', 'O24', 'M5', 'O25', 'O26', 'O27',
  'O28', 'O29', 'K6', 'O30', 'O31', 'O32', 'O33', 'O34'];

/* ============================================================
   Regions & constituencies
   [name, urbanity 0..1, special leans]
   ============================================================ */
const SAL_URBAN = { econ: 0.8, social: 1.1, defense: 1.15, green: 0.9 };
const SAL_RURAL = { econ: 1.2, social: 0.95, defense: 0.8, green: 0.7 };
const REGIONS = [
  {
    id: 'VNO', name: 'Vilnius', en: 'Vilnius City', seats: 15, pop: 605, urban: 0.97, turnout: 0.6,
    ideal: { econ: 25, social: -35, defense: 85, green: 55 }, sal: SAL_URBAN, issues: ['housing', 'def', 'transit'],
    base: { LSDP: 14, TS: 28, NA: 6, DSVL: 7, LS: 13, LVZS: 3, LP: 10, LLRA: 7, KITI: 12 },
    blob: [298, 211, 17], label: [298, 211], count: 0.32,
    cons: [
      ['Naujamiesčio', 1, { LP: 1.7, TS: 1.2, LS: 1.25, NA: 0.6, LLRA: 0.4 }],
      ['Senamiesčio', 1, { LP: 1.6, TS: 1.25, LS: 1.3, NA: 0.6, LLRA: 0.5 }],
      ['Žvėryno', 1, { LP: 1.4, TS: 1.35, LS: 1.25, NA: 0.6, LLRA: 0.4 }],
      ['Antakalnio', 1, { TS: 1.3, LS: 1.1, LP: 1.2, LLRA: 0.5 }],
      ['Žirmūnų', 1, { LSDP: 1.1, LLRA: 0.8 }],
      ['Šnipiškių', 1, { LP: 1.2, LLRA: 1.0 }],
      ['Fabijoniškių', 1, { LSDP: 1.15, LLRA: 1.2, NA: 1.1 }],
      ['Šeškinės', 1, { LLRA: 1.3, LSDP: 1.1 }],
      ['Justiniškių', 1, { LSDP: 1.15, NA: 1.15, LLRA: 0.9 }],
      ['Pilaitės', 1, { TS: 1.15, LS: 1.15, LP: 1.1, LLRA: 0.6 }],
      ['Karoliniškių', 1, { LSDP: 1.1, LLRA: 0.9 }],
      ['Lazdynų', 1, { LSDP: 1.1, TS: 1.05, LLRA: 1.0 }],
      ['Naujininkų', 1, { LLRA: 2.3, LSDP: 1.1, LP: 0.7, TS: 0.85 }],
      ['Naujosios Vilnios', 1, { LLRA: 2.7, LSDP: 1.15, NA: 1.2, LP: 0.6, TS: 0.75 }],
      ['Verkių', 1, { LLRA: 1.6, TS: 1.05 }],
    ],
  },
  {
    id: 'VLC', name: 'Vilniaus apskr.', en: 'Vilnius County', seats: 7, pop: 260, urban: 0.32, turnout: 0.5,
    ideal: { econ: -20, social: 55, defense: 40, green: 0 }, sal: { econ: 1.1, social: 1.0, defense: 0.8, green: 0.6 },
    issues: ['minority', 'roads', 'def'],
    base: { LSDP: 18, TS: 11, NA: 12, DSVL: 10, LS: 4, LVZS: 7, LP: 1.5, LLRA: 23, KITI: 13.5 },
    poly: ['P4', 'U5', 'U4', 'U3', 'U2', 'U1', 'O14', 'O15', 'O16', 'O17', 'O18', 'O19', 'A3', 'A2', 'A1', 'V4', 'V3', 'V2', 'V1', 'P5'],
    label: [287, 178], count: 0,
    cons: [
      ['Šalčininkų', 0.1, { LLRA: 3.0, TS: 0.5, LS: 0.4, LP: 0.3 }],
      ['Medininkų', 0.3, { LLRA: 2.5, TS: 0.6, LP: 0.4 }],
      ['Nemenčinės', 0.3, { LLRA: 2.2, TS: 0.7 }],
      ['Trakų–Elektrėnų', 0.5, { LLRA: 0.6 }],
      ['Ukmergės', 0.4, { LLRA: 0.08, NA: 1.2, LSDP: 1.15 }],
      ['Širvintų', 0.2, { LLRA: 0.3, LVZS: 1.2 }],
      ['Švenčionių', 0.3, { LLRA: 0.9, LSDP: 1.1 }],
    ],
  },
  {
    id: 'KNS', name: 'Kaunas', en: 'Kaunas City', seats: 8, pop: 305, urban: 0.98, turnout: 0.57,
    ideal: { econ: 20, social: -10, defense: 75, green: 40 }, sal: SAL_URBAN, issues: ['jobs', 'housing', 'def'],
    base: { LSDP: 16, TS: 27, NA: 11, DSVL: 8, LS: 11, LVZS: 4, LP: 7, LLRA: 0.3, KITI: 15.7 },
    blob: [204, 189, 14], label: [204, 189], count: 0.22,
    cons: [
      ['Centro', 1, { TS: 1.2, LP: 1.4, LS: 1.2, NA: 0.75 }], ['Kalniečių', 1, { LSDP: 1.1 }], ['Šilainių', 1, { NA: 1.15, LSDP: 1.1 }],
      ['Aleksoto–Vilijampolės', 1, { LSDP: 1.05 }], ['Dainavos', 1, { NA: 1.1, LSDP: 1.1 }], ['Petrašiūnų', 1, { LSDP: 1.15, NA: 1.15 }],
      ['Panemunės', 1, { TS: 1.15, LS: 1.1 }], ['Eigulių', 1, { LSDP: 1.05 }],
    ],
  },
  {
    id: 'KNC', name: 'Kauno apskr.', en: 'Kaunas County', seats: 7, pop: 275, urban: 0.38, turnout: 0.51,
    ideal: { econ: -15, social: 30, defense: 55, green: 15 }, sal: SAL_RURAL, issues: ['col', 'roads', 'health'],
    base: { LSDP: 23, TS: 17, NA: 16, DSVL: 12, LS: 6, LVZS: 9, LP: 2, LLRA: 0.3, KITI: 14.7 },
    poly: ['TA1', 'S5', 'S4', 'S3', 'P5', 'V1', 'V2', 'V3', 'V4', 'A4', 'M3', 'M2', 'M1', 'TA3', 'TA2'],
    label: [177, 146], count: 0,
    cons: [
      ['Kėdainių', 0.4, {}], ['Jonavos', 0.5, { LSDP: 1.2 }], ['Raseinių', 0, {}], ['Kaišiadorių', 0, {}],
      ['Garliavos', 0.3, {}], ['Karmėlavos', 0.3, {}], ['Prienų–Birštono', 0.2, {}],
    ],
  },
  {
    id: 'KLP', name: 'Klaipėda', en: 'Klaipėda & Coast', seats: 8, pop: 330, urban: 0.7, turnout: 0.5,
    ideal: { econ: 15, social: 5, defense: 60, green: 20 }, sal: SAL_URBAN, issues: ['port', 'col', 'energy'],
    base: { LSDP: 19, TS: 15, NA: 18, DSVL: 9, LS: 11, LVZS: 6, LP: 3, LLRA: 0.3, KITI: 18.7 },
    poly: ['O1', 'O2', 'K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'O30', 'O31', 'O32', 'O33', 'O34'],
    label: [34, 103], count: 0.12,
    cons: [
      ['Baltijos', 1, {}], ['Danės', 1, {}], ['Marių', 1, {}], ['Palangos', 0.7, { LS: 1.15 }], ['Kretingos', 0.4, {}],
      ['Gargždų', 0.3, {}], ['Šilutės', 0.2, { NA: 1.1 }], ['Skuodo', 0, { NA: 1.15 }],
    ],
  },
  {
    id: 'TEL', name: 'Telšiai', en: 'Telšiai · Samogitia', seats: 3, pop: 125, urban: 0.45, turnout: 0.45,
    ideal: { econ: -20, social: 55, defense: 30, green: -35 }, sal: SAL_RURAL, issues: ['col', 'tax', 'trust'],
    base: { LSDP: 19, TS: 11, NA: 28, DSVL: 9, LS: 5, LVZS: 9, LP: 1.5, LLRA: 0.2, KITI: 17.3 },
    poly: ['K1', 'O3', 'T1', 'T2', 'T3', 'T4', 'K4', 'K3', 'K2'], label: [84, 62], count: 0,
    cons: [['Telšių', 0.4, {}], ['Mažeikių', 0.5, { NA: 1.1 }], ['Plungės', 0.3, {}]],
  },
  {
    id: 'TAU', name: 'Tauragė', en: 'Tauragė', seats: 2, pop: 90, urban: 0.38, turnout: 0.44,
    ideal: { econ: -30, social: 45, defense: 35, green: -15 }, sal: SAL_RURAL, issues: ['emig', 'roads', 'col'],
    base: { LSDP: 20, TS: 12, NA: 23, DSVL: 9, LS: 5, LVZS: 10, LP: 1.5, LLRA: 0.2, KITI: 19.3 },
    poly: ['K4', 'T4', 'TA1', 'TA2', 'TA3', 'O28', 'O29', 'K6', 'K5'], label: [93, 136], count: 0,
    cons: [['Tauragės', 0.4, {}], ['Šilalės–Jurbarko', 0, {}]],
  },
  {
    id: 'SIA', name: 'Šiauliai', en: 'Šiauliai', seats: 6, pop: 260, urban: 0.55, turnout: 0.47,
    ideal: { econ: -30, social: 35, defense: 50, green: -5 }, sal: SAL_RURAL, issues: ['col', 'emig', 'health'],
    base: { LSDP: 24, TS: 13, NA: 19, DSVL: 10, LS: 6, LVZS: 9, LP: 1.8, LLRA: 0.2, KITI: 17 },
    poly: ['T1', 'O4', 'O5', 'O6', 'S1', 'S2', 'S3', 'S4', 'S5', 'TA1', 'T4', 'T3', 'T2'], label: [160, 68], count: 0,
    cons: [['Saulės', 1, {}], ['Aušros', 1, {}], ['Radviliškio', 0.3, {}], ['Joniškio', 0.1, {}], ['Kelmės', 0, {}], ['Akmenės', 0.3, { LSDP: 1.2 }]],
  },
  {
    id: 'PAN', name: 'Panevėžys', en: 'Panevėžys', seats: 5, pop: 215, urban: 0.52, turnout: 0.48,
    ideal: { econ: -25, social: 35, defense: 50, green: 0 }, sal: SAL_RURAL, issues: ['jobs', 'col', 'roads'],
    base: { LSDP: 23, TS: 14, NA: 17, DSVL: 12, LS: 6, LVZS: 10, LP: 1.8, LLRA: 0.2, KITI: 16 },
    poly: ['S1', 'O7', 'O8', 'O9', 'O10', 'P1', 'P2', 'P3', 'P4', 'P5', 'S3', 'S2'], label: [258, 72], count: 0,
    cons: [['Aukštaitijos', 1, {}], ['Nevėžio', 1, {}], ['Biržų–Pasvalio', 0.2, {}], ['Rokiškio', 0.2, {}], ['Kupiškio', 0.1, { LVZS: 1.15 }]],
  },
  {
    id: 'UTE', name: 'Utena', en: 'Utena', seats: 3, pop: 125, urban: 0.5, turnout: 0.48,
    ideal: { econ: -30, social: 35, defense: 55, green: 10 }, sal: SAL_RURAL, issues: ['health', 'emig', 'energy'],
    base: { LSDP: 24, TS: 12, NA: 15, DSVL: 14, LS: 5, LVZS: 11, LP: 1.5, LLRA: 1.5, KITI: 16 },
    poly: ['P1', 'O11', 'O12', 'O13', 'U1', 'U2', 'U3', 'U4', 'U5', 'P4', 'P3', 'P2'], label: [338, 122], count: 0,
    cons: [['Utenos', 0.5, {}], ['Anykščių–Molėtų', 0.1, {}], ['Zarasų–Visagino', 0.5, { LLRA: 2.0, LSDP: 1.1 }]],
  },
  {
    id: 'ALY', name: 'Alytus', en: 'Alytus · Dzūkija', seats: 3, pop: 135, urban: 0.5, turnout: 0.47,
    ideal: { econ: -35, social: 30, defense: 50, green: 5 }, sal: SAL_RURAL, issues: ['pensions', 'health', 'def'],
    base: { LSDP: 28, TS: 13, NA: 14, DSVL: 11, LS: 5, LVZS: 9, LP: 1.5, LLRA: 0.5, KITI: 18 },
    poly: ['V4', 'A1', 'A2', 'A3', 'O20', 'O21', 'O22', 'O23', 'O24', 'M5', 'M4', 'M3', 'A4'], label: [228, 262], count: 0,
    cons: [['Alytaus', 0.8, { LSDP: 1.1 }], ['Dzūkijos', 0.3, {}], ['Lazdijų', 0, {}]],
  },
  {
    id: 'MAR', name: 'Marijampolė', en: 'Marijampolė · Suvalkija', seats: 3, pop: 135, urban: 0.42, turnout: 0.46,
    ideal: { econ: -25, social: 45, defense: 40, green: -10 }, sal: SAL_RURAL, issues: ['agri', 'roads', 'emig'],
    base: { LSDP: 21, TS: 13, NA: 16, DSVL: 10, LS: 5, LVZS: 15, LP: 1.5, LLRA: 0.2, KITI: 18.3 },
    poly: ['O28', 'TA3', 'M1', 'M2', 'M3', 'M4', 'M5', 'O25', 'O26', 'O27'], label: [157, 214], count: 0,
    cons: [['Marijampolės', 0.6, {}], ['Vilkaviškio', 0.2, { LVZS: 1.1 }], ['Šakių', 0, {}]],
  },
  {
    id: 'ABR', name: 'Pasaulio lietuviai', en: 'Lithuanians abroad', seats: 1, pop: 62, voters: 62, urban: 0.9, turnout: 0.6,
    ideal: { econ: 35, social: -30, defense: 90, green: 45 }, sal: SAL_URBAN, issues: ['diaspora', 'def', 'tax'],
    base: { LSDP: 9, TS: 35, NA: 7, DSVL: 6, LS: 17, LVZS: 2, LP: 13, LLRA: 0.5, KITI: 10.5 },
    tile: [332, 279, 66, 22], label: [365, 290], count: 0.45,
    cons: [['Pasaulio lietuvių', 1, {}]],
  },
];
REGIONS.forEach((r) => {
  if (!r.voters) r.voters = Math.round(r.pop * 0.82);
  if (r.poly) r.path = polyPath(r.poly);
  if (r.blob) r.path = blobPath(r.blob[0], r.blob[1], r.blob[2], hashStr(r.id));
});
const REG = Object.fromEntries(REGIONS.map((r) => [r.id, r]));
const TOTAL_VOTERS = sum(REGIONS.map((r) => r.voters));
const AXIS_MEAN = Object.fromEntries(AXIS_IDS.map((a) => [a, sum(REGIONS.map((r) => r.ideal[a] * r.voters)) / TOTAL_VOTERS]));
const URB_SENS = { LSDP: -0.15, TS: 0.5, NA: -0.5, DSVL: -0.1, LS: 0.6, LVZS: -0.7, LP: 1.0, LLRA: 0, KITI: -0.1 };
const LEAN_SIGMA = { KITI: 0.32, LLRA: 0.15 };

function buildLeans(rand) {
  const leans = {};
  for (const r of REGIONS) {
    const raw = r.cons.map(([, u, sp]) =>
      Object.fromEntries(ALL_IDS.map((p) => [p, Math.exp((u - r.urban) * URB_SENS[p]) * Math.exp(gauss(rand) * (LEAN_SIGMA[p] || 0.1)) * (sp[p] || 1)])));
    for (const p of ALL_IDS) {
      const m = sum(raw.map((x) => x[p])) / raw.length;
      raw.forEach((x) => { x[p] /= m; });
    }
    raw.forEach((x, i) => { leans[`${r.id}-${i}`] = x; });
  }
  return leans;
}

function initGG(p, r) {
  const rural = r.urban < 0.6;
  switch (p) {
    case 'LSDP': return rural ? 40 : 30;
    case 'TS': return rural ? 20 : 35;
    case 'NA': return ['TEL', 'TAU', 'KLP', 'SIA'].includes(r.id) ? 30 : 15;
    case 'DSVL': return ['KNC', 'PAN', 'UTE', 'SIA'].includes(r.id) ? 28 : 18;
    case 'LS': return rural ? 10 : 25;
    case 'LVZS': return rural ? 32 : 10;
    case 'LP': return ['VNO', 'KNS'].includes(r.id) ? 18 : 4;
    case 'LLRA': return r.id === 'VLC' ? 50 : r.id === 'VNO' ? 28 : 3;
    default: return 8;
  }
}

/* ============================================================
   Core model
   ============================================================ */
const posOf = (g, p, stance) => (p === g.player ? stance || g.stance : PARTIES[p].pos);
function fitScore(pos, r) {
  return sum(AXIS_IDS.map((a) => (r.sal[a] * Math.abs(pos[a] - r.ideal[a])) / 100));
}
function driftSteps(stance, orig) {
  return sum(AXIS_IDS.map((a) => Math.abs(stance[a] - orig[a]) / 30));
}
function alienation(stance, orig) {
  const d = driftSteps(stance, orig);
  return Math.exp(-0.05 * Math.pow(Math.max(0, d - 1), 1.4));
}
function policyMult(g, r, stance) {
  const st = stance || g.stance;
  const o = PARTIES[g.player].pos;
  return Math.exp(-0.55 * (fitScore(st, r) - fitScore(o, r))) * alienation(st, o);
}
function effSupport(g, r, p, stance) {
  const raw = g.support[r.id][p];
  const mom = 1 + 0.03 * (g.momentum[p] || 0);
  const pol = p === g.player ? policyMult(g, r, stance) : 1;
  return Math.max(0.02, raw * mom * pol);
}
function regionShares(g, r, stance) {
  const e = {};
  let t = 0;
  for (const p of ALL_IDS) { e[p] = effSupport(g, r, p, stance); t += e[p]; }
  for (const p of ALL_IDS) e[p] = (e[p] / t) * 100;
  return e;
}
function nationalShares(g, stance) {
  const out = Object.fromEntries(ALL_IDS.map((p) => [p, 0]));
  let W = 0;
  for (const r of REGIONS) {
    const w = r.voters * r.turnout;
    W += w;
    const s = regionShares(g, r, stance);
    for (const p of ALL_IDS) out[p] += s[p] * w;
  }
  for (const p of ALL_IDS) out[p] /= W;
  return out;
}
function leaderOf(shares, exclude) {
  return PARTY_IDS.filter((p) => p !== exclude).sort((a, b) => shares[b] - shares[a])[0];
}
function ceilingOf(p, r) {
  if (p === 'LLRA') return r.id === 'VLC' ? 56 : r.id === 'VNO' ? 16 : r.id === 'UTE' ? 12 : 5;
  if (p === 'LP') return { VNO: 34, KNS: 26, ABR: 34, KLP: 16 }[r.id] || 9;
  return 58;
}
const satOf = (p, r, share) => clamp(1 - share / ceilingOf(p, r), 0.08, 1);
const POWER = { rally: 0.95, digital: 1.05, tv: 1.0, door: 0.3, attack: 1.5, backfire: 0.9 };
function geoMult(p, r) {
  if (p === 'LLRA') return r.id === 'VLC' ? 1.5 : r.id === 'VNO' ? 1.3 : r.id === 'UTE' ? 0.7 : 0.35;
  if (p === 'LP') return ['VNO', 'KNS', 'ABR'].includes(r.id) ? 1 : r.id === 'KLP' ? 0.85 : 0.6;
  if (p === 'TS' && r.id === 'ABR') return 1.2;
  return 1;
}
function traitMult(p, type, r) {
  const rural = r.urban < 0.6;
  let m = 1;
  if (type === 'rally') {
    if (p === 'LSDP' && rural) m *= 1.15;
    if (p === 'TS' && rural) m *= 0.85;
    if (p === 'NA') m *= 1.3;
    if (p === 'LVZS' && rural) m *= 1.2;
    if (p === 'LS' && !rural) m *= 1.1;
  } else if (type === 'digital') {
    if (p === 'LP') m *= 1.6;
    if (p === 'LS') m *= 1.25;
    if (p === 'LVZS' || p === 'LLRA') m *= 0.8;
  } else if (type === 'tv') {
    if (p === 'LVZS') m *= 1.2;
    if (p === 'LSDP') m *= 1.1;
    if (p === 'LP') m *= 0.7;
  }
  return m;
}
function normalizeRegion(g, rid) {
  const S = g.support[rid];
  const t = sum(ALL_IDS.map((p) => S[p])) + g.undecided[rid];
  for (const p of ALL_IDS) S[p] = (S[p] / t) * 100;
  g.undecided[rid] = (g.undecided[rid] / t) * 100;
}
function gainSupport(g, rid, p, amt, fromU = 0.5) {
  if (!(amt > 0)) return;
  const S = g.support[rid];
  const u = clamp(amt * fromU, 0, Math.max(0, g.undecided[rid] - 2));
  g.undecided[rid] -= u;
  const rest = amt - u;
  const others = ALL_IDS.filter((q) => q !== p);
  const w = others.map((q) => S[q] * (1 - g.gg[rid][q] / 220));
  const tw = sum(w) || 1;
  others.forEach((q, i) => { S[q] = Math.max(0.05, S[q] - (rest * w[i]) / tw); });
  S[p] += amt;
}
function loseSupport(g, rid, p, amt, toU = 0.5, ben = null, benFrac = 0) {
  if (!(amt > 0)) return;
  const S = g.support[rid];
  const lost = Math.min(Math.max(0, S[p] - 0.1), amt);
  S[p] -= lost;
  const u = lost * toU;
  g.undecided[rid] += u;
  let rest = lost - u;
  if (ben) { const b = rest * benFrac; S[ben] += b; rest -= b; }
  const others = ALL_IDS.filter((q) => q !== p);
  const tot = sum(others.map((q) => S[q])) || 1;
  for (const q of others) S[q] += (rest * S[q]) / tot;
}
function applyRegionDelta(g, rid, p, d) {
  if (d >= 0) gainSupport(g, rid, p, d, 0.6);
  else loseSupport(g, rid, p, -d * (1 - g.gg[rid][p] / 200), 0.6);
}
function addScandal(g, x) {
  g.scandal = clamp(g.scandal + (x > 0 && g.player === 'NA' ? x * 2 : x), 0, 100);
}
function addNews(g, item) {
  g.newsId = (g.newsId || 0) + 1;
  g.news.unshift({ id: g.newsId, week: g.week, ...item });
  if (g.news.length > 90) g.news.length = 90;
}

/* ============================================================
   New game
   ============================================================ */
function newGame(pid) {
  const seed = (Math.random() * 1e9) | 0;
  const rand = mulberry32(seed);
  const support = {}, undecided = {}, gg = {}, boost = {};
  for (const r of REGIONS) {
    const und = r.id === 'ABR' ? 26 : r.urban < 0.6 ? 22 : 19;
    const tot = sum(ALL_IDS.map((p) => r.base[p]));
    support[r.id] = {};
    gg[r.id] = {};
    boost[r.id] = {};
    for (const p of ALL_IDS) {
      support[r.id][p] = (r.base[p] / tot) * (100 - und);
      gg[r.id][p] = initGG(p, r);
      boost[r.id][p] = 0;
    }
    undecided[r.id] = und;
  }
  const g = {
    v: 1, seed, player: pid, week: 1, phase: 'campaign',
    ap: 6, apMax: 6, money: PARTIES[pid].funds, pc: 6, scandal: pid === 'NA' ? 10 : 4,
    stance: { ...PARTIES[pid].pos }, lastShift: {},
    momentum: Object.fromEntries(ALL_IDS.map((p) => [p, 0])),
    support, undecided, gg, boost, leans: buildLeans(rand),
    weekActs: {}, natActs: {}, weekLog: {}, attacksThisWeek: 0, lastIncome: 0,
    history: [], news: [], newsId: 0, queue: [{ type: 'brief' }], usedEvents: [], lastEventWeek: 1,
    stats: { actions: 0, spent: 0, shifts: 0, debates: [], events: 0 },
    election: null, coal: null, result: null,
  };
  g.history.push({ week: 0, shares: nationalShares(g) });
  addNews(g, { kind: 'system', title: 'Campaign launched', text: `${PARTIES[pid].short} opens its war room. Twelve weeks to election day.` });
  return g;
}

/* ============================================================
   Campaign actions
   ============================================================ */
const ACTIONS = {
  rally: { label: 'Town hall & rally', icon: Megaphone, desc: 'Local support up, your voters more likely to turn out.' },
  digital: { label: 'Facebook & TikTok ads', icon: Smartphone, desc: 'Wins undecided voters. Strongest in urban, younger areas.' },
  tv: { label: 'TV & local radio', icon: Radio, desc: 'Wins undecided voters. Strongest in rural, older areas.' },
  door: { label: 'Door-to-door canvass', icon: DoorOpen, desc: 'Permanent ground game: shields you from attacks and lifts turnout.' },
  attack: { label: 'Attack the frontrunner', icon: Swords, desc: 'Cuts the top rival here. Can backfire on moderate parties.' },
};
function actionCost(type, r, p) {
  const s = r.seats;
  switch (type) {
    case 'rally': return p === 'NA' ? Math.round((16 + 3 * s) * 0.5) : 16 + 3 * s;
    case 'digital': return 20 + 4 * s;
    case 'tv': return 26 + 4 * s;
    case 'door': return 8 + s;
    case 'attack': return 18 + 2 * s;
    default: return 0;
  }
}
function actionPreview(g, rid, type) {
  const r = REG[rid], p = g.player;
  const n = g.weekActs[rid] || 0;
  const sh = regionShares(g, r)[p];
  const k = FATIGUE[Math.min(n, FATIGUE.length - 1)] * satOf(p, r, sh) * geoMult(p, r);
  if (type === 'rally') return POWER.rally * traitMult(p, 'rally', r) * k;
  if (type === 'digital') return POWER.digital * (0.35 + r.urban) * traitMult(p, 'digital', r) * k;
  if (type === 'tv') return POWER.tv * (1.25 - 0.65 * r.urban) * traitMult(p, 'tv', r) * k;
  if (type === 'door') return POWER.door * k;
  return 0;
}
function doRegionAction(g, rid, type) {
  const r = REG[rid], p = g.player;
  const cost = actionCost(type, r, p);
  if (g.ap < 1) return { ok: false, msg: 'No action points left. End the week to refill.' };
  if (g.money < cost) return { ok: false, msg: `Not enough funds: ${fmtEur(cost)} needed.` };
  g.ap -= 1; g.money -= cost;
  g.stats.actions += 1; g.stats.spent += cost;
  g.weekLog[type] = (g.weekLog[type] || 0) + 1;
  const n = g.weekActs[rid] || 0;
  g.weekActs[rid] = n + 1;
  const before = regionShares(g, r);
  const fat = FATIGUE[Math.min(n, FATIGUE.length - 1)];
  const sat = satOf(p, r, before[p]);
  const k = fat * sat * geoMult(p, r) * (0.85 + Math.random() * 0.3);
  let tone = 'good', lead = ACTIONS[type].label;
  if (type === 'rally') {
    gainSupport(g, rid, p, POWER.rally * traitMult(p, 'rally', r) * k, 0.5);
    g.boost[rid][p] = Math.min(0.25, g.boost[rid][p] + 0.03);
    lead = rid === 'ABR' ? 'Diaspora town hall in Dublin' : `Town hall in ${r.name}`;
  } else if (type === 'digital') {
    gainSupport(g, rid, p, POWER.digital * (0.35 + r.urban) * traitMult(p, 'digital', r) * k, 0.8);
    if (p === 'LS' || p === 'LP') g.boost[rid][p] = Math.min(0.25, g.boost[rid][p] + 0.015 * r.urban);
    lead = 'Social ads live';
  } else if (type === 'tv') {
    gainSupport(g, rid, p, POWER.tv * (1.25 - 0.65 * r.urban) * traitMult(p, 'tv', r) * k, 0.8);
    lead = 'TV & radio spots aired';
  } else if (type === 'door') {
    const gg0 = g.gg[rid][p];
    g.gg[rid][p] = Math.min(100, gg0 + 14 * (1 - gg0 / 110) * geoMult(p, r));
    g.boost[rid][p] = Math.min(0.25, g.boost[rid][p] + 0.02);
    gainSupport(g, rid, p, POWER.door * k, 0.6);
    const after = regionShares(g, r);
    return { ok: true, tone, msg: `Canvassers out in ${r.name}: ground game ${Math.round(gg0)}→${Math.round(g.gg[rid][p])}, ${fmtSigned(after[p] - before[p])} pts` };
  } else if (type === 'attack') {
    const target = leaderOf(before, p);
    const bf = BACKFIRE[p] + (p === 'TS' && r.urban < 0.6 ? 0.1 : 0) + 0.06 * g.attacksThisWeek;
    g.attacksThisWeek += 1;
    if (Math.random() < bf) {
      loseSupport(g, rid, p, POWER.backfire * fat, 0.6);
      g.momentum[p] = clamp(g.momentum[p] - 0.6, -10, 10);
      const after = regionShares(g, r);
      return { ok: true, tone: 'bad', msg: `Backfire! Voters in ${r.name} punish the negativity: ${fmtSigned(after[p] - before[p])} pts` };
    }
    const dmg = POWER.attack * fat * geoMult(p, r) * (1 - g.gg[rid][target] / 160) * (0.85 + Math.random() * 0.3);
    loseSupport(g, rid, target, dmg, 0.45, p, 0.35);
    g.momentum[target] = clamp(g.momentum[target] - 0.25, -10, 10);
    const after = regionShares(g, r);
    return { ok: true, tone, msg: `Attack ads hit ${PARTIES[target].short} in ${r.name}: ${fmtSigned(after[target] - before[target])} for them, ${fmtSigned(after[p] - before[p])} for you` };
  }
  const after = regionShares(g, r);
  return { ok: true, tone, msg: `${lead}: ${fmtSigned(after[p] - before[p])} pts in ${r.name}` };
}

const NATIONAL_ACTIONS = [
  { id: 'gala', group: 'fund', label: 'Donor dinner', icon: HandCoins, ap: 1, desc: 'Major donors, an Old Town restaurant, a long evening.' },
  { id: 'small', group: 'fund', label: 'Small-donor drive', icon: Coins, ap: 1, desc: '€5 memberships and crowdfunding. Grassroots parties get a buzz.' },
  { id: 'lobby', group: 'fund', label: 'Lobbying deal', icon: Briefcase, ap: 0, pc: 2, desc: 'Trade 2 political capital for a big cheque. Raises scandal risk.' },
  { id: 'tvspot', group: 'nat', label: 'National TV spot', icon: Tv, ap: 2, cost: 200, desc: 'Prime time on LRT, LNK and TV3. A small lift in every region.' },
  { id: 'presser', group: 'nat', label: 'Press conference', icon: Mic, ap: 1, cost: 5, desc: 'Set the news agenda. Momentum boost, weaker if repeated.' },
  { id: 'backchannel', group: 'nat', label: 'Back-channel talks', icon: Handshake, ap: 1, cost: 0, desc: 'Quiet coffees with other party leaders. Earns political capital for coalition talks.' },
];
function galaAmount(g) {
  const share = nationalShares(g)[g.player];
  const n = g.natActs.gala || 0;
  return Math.round((80 + 3.5 * share) * FUND_MULT[g.player] * [1, 0.7, 0.5, 0.35][Math.min(n, 3)]);
}
function smallAmount(g) {
  const share = nationalShares(g)[g.player];
  const n = g.natActs.small || 0;
  return Math.round((35 + 2 * share) * [1, 0.7, 0.5, 0.35][Math.min(n, 3)]);
}
const lobbyAmount = (g) => Math.round(150 * Math.sqrt(FUND_MULT[g.player]));
function doNational(g, id) {
  const A = NATIONAL_ACTIONS.find((a) => a.id === id);
  const p = g.player;
  if (g.ap < A.ap) return { ok: false, msg: `Needs ${A.ap} action point${A.ap > 1 ? 's' : ''}.` };
  if (A.pc && g.pc < A.pc) return { ok: false, msg: `Needs ${A.pc} political capital.` };
  if (A.cost && g.money < A.cost) return { ok: false, msg: `Not enough funds: ${fmtEur(A.cost)} needed.` };
  const n = g.natActs[id] || 0;
  g.ap -= A.ap;
  if (A.cost) { g.money -= A.cost; g.stats.spent += A.cost; }
  if (A.ap) g.stats.actions += 1;
  let msg = '';
  if (id === 'gala') {
    const amt = Math.round(galaAmount(g) * (0.9 + Math.random() * 0.2));
    g.money += amt; addScandal(g, 1.5);
    msg = `Donor dinner raised ${fmtEur(amt)}`;
  } else if (id === 'small') {
    const amt = Math.round(smallAmount(g) * (0.9 + Math.random() * 0.2));
    g.money += amt;
    if (['NA', 'LVZS', 'LP', 'LLRA'].includes(p)) g.momentum[p] = clamp(g.momentum[p] + 0.4, -10, 10);
    msg = `Small donors chipped in ${fmtEur(amt)}`;
  } else if (id === 'lobby') {
    g.pc -= A.pc;
    const amt = lobbyAmount(g);
    g.money += amt; addScandal(g, 12);
    msg = `Lobbying deal: +${fmtEur(amt)}. Scandal risk rising.`;
  } else if (id === 'tvspot') {
    const before = nationalShares(g)[p];
    for (const r of REGIONS) gainSupport(g, r.id, p, 0.4 * (1.15 - 0.4 * r.urban) * geoMult(p, r) * satOf(p, r, regionShares(g, r)[p]), 0.7);
    msg = `National TV spot: ${fmtSigned(nationalShares(g)[p] - before)} pts nationally`;
  } else if (id === 'presser') {
    const d = 0.9 * [1, 0.55, 0.3, 0.15][Math.min(n, 3)];
    g.momentum[p] = clamp(g.momentum[p] + d, -10, 10);
    msg = `Press conference leads the evening news: momentum ${fmtSigned(d)}`;
  } else if (id === 'backchannel') {
    const d = [2, 1, 1, 0][Math.min(n, 3)];
    g.pc += d;
    msg = d ? `Back-channel talks: +${d} political capital` : 'Nobody wants another coffee this week.';
  }
  g.natActs[id] = n + 1;
  return { ok: true, tone: 'good', msg };
}

function platformCost(g, draft) {
  const changes = AXIS_IDS.filter((a) => draft[a] !== g.stance[a]);
  const steps = sum(changes.map((a) => Math.abs(draft[a] - g.stance[a]) / 30));
  let mom = steps > 1 ? 0.35 * (steps - 1) : 0;
  let pc = 0;
  const uturns = [];
  for (const a of changes) {
    const dir = Math.sign(draft[a] - g.stance[a]);
    if (g.lastShift[a] && g.lastShift[a] !== dir) { mom += 1.2; pc += 1; uturns.push(a); }
  }
  return { changes, steps, mom, pc, uturns };
}
function announcePlatform(g, draft) {
  const c = platformCost(g, draft);
  if (!c.changes.length) return { ok: false, msg: 'No changes to announce.' };
  if (g.ap < 1) return { ok: false, msg: 'Needs 1 action point.' };
  g.ap -= 1;
  for (const a of c.changes) g.lastShift[a] = Math.sign(draft[a] - g.stance[a]);
  const labels = c.changes.map((a) => {
    const ax = AXES.find((x) => x.id === a);
    return `${ax.label}: ${ax.steps[stepIndex(draft[a])]}`;
  });
  g.stance = { ...draft };
  g.momentum[g.player] = clamp(g.momentum[g.player] - c.mom, -10, 10);
  g.pc = Math.max(0, g.pc - c.pc);
  g.stats.shifts += c.steps;
  addNews(g, { kind: 'you', title: 'Platform update', text: `${labels.join(' · ')}${c.uturns.length ? '. Commentators call it a U-turn.' : '.'}` });
  return { ok: true, tone: c.mom > 0 ? 'warn' : 'good', msg: `Platform announced${c.mom > 0 ? ` · momentum ${fmtSigned(-c.mom)}` : ''}` };
}

/* ============================================================
   AI campaigns & weekly cycle
   ============================================================ */
const AI_VERB = { rally: 'rallies', digital: 'social ads', tv: 'TV & radio', door: 'canvassing', attack: 'attack ads', backfire: 'botched attack' };
function aiTurn(g) {
  const moves = [];
  const nat0 = nationalShares(g);
  const order0 = PARTY_IDS.slice().sort((a, b) => nat0[b] - nat0[a]);
  const playerFront = order0[0] === g.player && nat0[order0[0]] - nat0[order0[1]] > 2;
  for (const p of PARTY_IDS) {
    if (p === g.player) continue;
    const nat = nationalShares(g)[p];
    const n = nat > 14 ? 4 : nat > 7 ? 3 : 2;
    const size = clamp(Math.sqrt(nat / 12), 0.5, 1.15);
    const list = [];
    for (let i = 0; i < n; i++) {
      const weights = REGIONS.map((r) => {
        const sh = regionShares(g, r);
        const top = Math.max(...PARTY_IDS.filter((q) => q !== p).map((q) => sh[q]));
        const close = Math.abs(sh[p] - top) < 7 ? 2.2 : 1;
        return (r.seats + 1.5) * Math.sqrt(sh[p] + 0.5) * close * geoMult(p, r);
      });
      const r = REGIONS[weightedPick(weights)];
      const sh = regionShares(g, r);
      const roll = Math.random();
      const atk = (p === 'NA' ? 0.24 : 0.1) + (playerFront ? 0.08 : 0);
      let type = roll < atk ? 'attack' : roll < atk + 0.38 ? 'rally' : roll < atk + 0.76 ? (r.urban > 0.6 ? 'digital' : 'tv') : 'door';
      const k = 0.75 * size * geoMult(p, r) * satOf(p, r, sh[p]) * (0.8 + Math.random() * 0.4);
      let target = null;
      if (type === 'rally') {
        gainSupport(g, r.id, p, POWER.rally * traitMult(p, 'rally', r) * k, 0.5);
        g.boost[r.id][p] = Math.min(0.25, g.boost[r.id][p] + 0.025);
      } else if (type === 'digital') {
        gainSupport(g, r.id, p, POWER.digital * (0.35 + r.urban) * traitMult(p, 'digital', r) * k, 0.8);
      } else if (type === 'tv') {
        gainSupport(g, r.id, p, POWER.tv * (1.25 - 0.65 * r.urban) * traitMult(p, 'tv', r) * k, 0.8);
      } else if (type === 'door') {
        g.gg[r.id][p] = Math.min(100, g.gg[r.id][p] + 10 * (1 - g.gg[r.id][p] / 110));
        gainSupport(g, r.id, p, POWER.door * k, 0.6);
      } else {
        const rivals = PARTY_IDS.filter((q) => q !== p).sort((a, b) => sh[b] - sh[a]);
        target = rivals.slice(0, 2).includes(g.player) && Math.random() < (playerFront ? 0.75 : 0.6) ? g.player : rivals[0];
        if (Math.random() < BACKFIRE[p]) {
          loseSupport(g, r.id, p, POWER.backfire * k, 0.6);
          type = 'backfire';
        } else {
          loseSupport(g, r.id, target, POWER.attack * k * (1 - g.gg[r.id][target] / 160), 0.45, p, 0.35);
        }
      }
      list.push({ type, rid: r.id, target });
    }
    g.momentum[p] = clamp(g.momentum[p] + gauss() * 0.45, -10, 10);
    moves.push({ p, list });
  }
  return moves;
}
function describeMoves(m) {
  const by = {};
  m.list.forEach((x) => {
    const key = x.type === 'attack' ? `attack ads vs ${PARTIES[x.target].short}` : AI_VERB[x.type];
    (by[key] = by[key] || new Set()).add(REG[x.rid].name);
  });
  return Object.entries(by).map(([k, set]) => `${k} in ${[...set].join(', ')}`).join('; ');
}
function weeklyDrift(g) {
  for (const r of REGIONS) {
    const S = g.support[r.id];
    const rel = g.undecided[r.id] * 0.085;
    const e = ALL_IDS.map((p) => Math.pow(effSupport(g, r, p), 1.1));
    const te = sum(e);
    ALL_IDS.forEach((p, i) => { S[p] += (rel * e[i]) / te; });
    g.undecided[r.id] -= rel;
    const und = g.undecided[r.id];
    const bsum = sum(ALL_IDS.map((p) => r.base[p]));
    for (const p of ALL_IDS) {
      const target = (r.base[p] / bsum) * (100 - und);
      const rate = p === 'KITI' ? 0.07 : 0.035 * (1 - g.gg[r.id][p] / 200);
      S[p] += rate * (target - S[p]);
    }
    normalizeRegion(g, r.id);
  }
}
function pickEvent(g) {
  const pool = EVENTS.filter((e) => !e.scandal && !g.usedEvents.includes(e.id));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)].id;
}
function startWeek(g) {
  g.week += 1;
  g.ap = g.apMax;
  const share = nationalShares(g)[g.player];
  const income = Math.round((40 + 5 * share) * FUND_MULT[g.player]);
  g.money += income;
  g.lastIncome = income;
  g.weekActs = {}; g.natActs = {}; g.weekLog = {}; g.attacksThisWeek = 0;
  if (DEBATE_WEEKS.includes(g.week)) g.queue.push({ type: 'debate', id: DEBATE_WEEKS.indexOf(g.week) });
  let ev = null;
  if (Math.random() * 100 < g.scandal * 0.55) {
    if (g.scandal > 22 && !g.usedEvents.includes('scandal_money')) ev = 'scandal_money';
    else if (!g.usedEvents.includes('scandal_mp')) ev = 'scandal_mp';
  }
  if (!ev && (g.week - g.lastEventWeek >= 2 || Math.random() < 0.4)) ev = pickEvent(g);
  if (ev) {
    g.queue.push({ type: 'event', id: ev });
    g.usedEvents.push(ev);
    g.lastEventWeek = g.week;
  }
}
function endWeek(g) {
  const before = nationalShares(g);
  const log = Object.entries(g.weekLog).filter(([, n]) => n > 0);
  if (log.length) {
    addNews(g, { kind: 'you', title: 'Your week on the trail', text: log.map(([t, n]) => `${n}× ${ACTIONS[t].label.toLowerCase()}`).join(', ') });
  }
  const moves = aiTurn(g);
  weeklyDrift(g);
  for (const p of ALL_IDS) g.momentum[p] *= 0.8;
  g.scandal = Math.max(0, g.scandal - 1.5);
  const mid = nationalShares(g);
  const ord = PARTY_IDS.slice().sort((a, b) => mid[b] - mid[a]);
  const lead = mid[ord[0]] - mid[ord[1]];
  if (lead > 2.5) {
    g.momentum[ord[0]] = clamp(g.momentum[ord[0]] - 0.45 * (lead - 2.5), -10, 10);
    if (ord[0] === g.player) addNews(g, { kind: 'system', title: 'Frontrunner scrutiny', text: `A ${lead.toFixed(1)}-point lead puts ${PARTIES[ord[0]].short} under the media microscope. Rivals are coming for you.` });
  }
  const after = nationalShares(g);
  const poll = {};
  for (const p of ALL_IDS) poll[p] = Math.max(0.3, after[p] + gauss() * 0.5);
  const pt = sum(Object.values(poll));
  for (const p of ALL_IDS) poll[p] = (poll[p] / pt) * 100;
  g.history.push({ week: g.week, shares: poll });
  moves.forEach((m) => addNews(g, { kind: 'rival', p: m.p, title: `${PARTIES[m.p].short} on the trail`, text: describeMoves(m) }));
  if (g.week >= WEEKS) {
    g.queue = [];
    g.phase = 'night';
    g.election = simulateElection(g, true);
    return;
  }
  const report = { type: 'report', week: g.week, before, after, moves };
  startWeek(g);
  g.queue.unshift(report);
}

/* ============================================================
   Event effects
   ============================================================ */
const TAG_BONUS = {
  welfare: { LSDP: 1.4, DSVL: 1.15, LVZS: 1.1 },
  security: { TS: 1.3, LS: 1.1 },
  populist: { NA: 1.4, LVZS: 1.15 },
  agri: { LVZS: 1.4, LSDP: 1.1 },
  business: { LS: 1.3, TS: 1.15 },
  youth: { LP: 1.5, LS: 1.2 },
  minority: { LLRA: 2 },
  moderate: { DSVL: 1.3 },
  green: { LP: 1.2, DSVL: 1.25 },
  traditional: { LVZS: 1.4, LLRA: 1.3, NA: 1.1 },
  progressive: { LP: 1.5, LS: 1.2 },
};
const TAG_NAMES = { welfare: 'Welfare', security: 'Security', populist: 'Populist', agri: 'Farm', business: 'Business', youth: 'Youth', minority: 'Minority', moderate: 'Moderate', green: 'Green', traditional: 'Family values', progressive: 'Progressive' };
const TARGET_LABEL = { all: 'Everywhere', urban: 'Cities', rural: 'Countryside', border: 'Border regions', agri: 'Farm country' };
function targetRegions(t) {
  if (t === 'all') return REGIONS.map((r) => [r, 1]);
  if (t === 'urban') return REGIONS.map((r) => [r, r.urban]);
  if (t === 'rural') return REGIONS.map((r) => [r, 1 - r.urban]);
  if (t === 'border') return ['VLC', 'VNO', 'ALY', 'UTE'].map((id) => [REG[id], 1]);
  if (t === 'agri') return ['MAR', 'PAN', 'SIA', 'TAU', 'UTE', 'KNC'].map((id) => [REG[id], 1]);
  return REG[t] ? [[REG[t], 1]] : [];
}
const FX_SCALE = 0.7;
function applyTarget(g, t, delta, mult = 1) {
  const p = g.player;
  for (const [r, w] of targetRegions(t)) {
    if (w <= 0.02) continue;
    applyRegionDelta(g, r.id, p, FX_SCALE * delta * w * (delta > 0 ? mult * geoMult(p, r) : 1));
  }
}
function applyAxis(g, ax, dir, k, mult = 1) {
  const p = g.player;
  const align = 1 + 0.35 * dir * (g.stance[ax] / 90);
  for (const r of REGIONS) {
    const d = (FX_SCALE * k * dir * (r.ideal[ax] - AXIS_MEAN[ax])) / 50 * r.sal[ax] * align;
    applyRegionDelta(g, r.id, p, d > 0 ? d * mult * geoMult(p, r) : d);
  }
}
function applyFx(g, fx, tag, isScandal) {
  const p = g.player;
  const mult = (TAG_BONUS[tag] && TAG_BONUS[tag][p]) || 1;
  if (fx.money) g.money = Math.max(0, g.money + fx.money);
  if (fx.pc) g.pc = Math.max(0, g.pc + fx.pc);
  if (fx.scandal) addScandal(g, fx.scandal);
  if (fx.mom) {
    const m = fx.mom > 0 ? fx.mom * mult : fx.mom * (isScandal && p === 'NA' ? 1.5 : 1);
    g.momentum[p] = clamp(g.momentum[p] + m, -10, 10);
  }
  if (fx.reg) fx.reg.forEach(([t, d]) => applyTarget(g, t, d, mult));
  if (fx.axis) applyAxis(g, fx.axis[0], fx.axis[1], fx.axis[2], mult);
  if (fx.und) REGIONS.forEach((r) => gainSupport(g, r.id, p, FX_SCALE * fx.und * mult * geoMult(p, r), 1));
  REGIONS.forEach((r) => normalizeRegion(g, r.id));
}
function fxChips(fx) {
  if (!fx) return [];
  const out = [];
  if (fx.money) out.push({ t: `${fx.money > 0 ? '+' : '−'}${fmtEur(Math.abs(fx.money))}`, good: fx.money > 0 });
  if (fx.mom) out.push({ t: `Momentum ${fx.mom > 0 ? '▲' : '▼'}`, good: fx.mom > 0 });
  if (fx.pc) out.push({ t: `PC ${fx.pc > 0 ? '+' : '−'}${Math.abs(fx.pc)}`, good: fx.pc > 0 });
  if (fx.scandal) out.push({ t: `Scandal risk ${fx.scandal > 0 ? '▲' : '▼'}`, good: fx.scandal < 0 });
  if (fx.und) out.push({ t: 'Undecided ▲', good: true });
  (fx.reg || []).forEach(([t, d]) => {
    const name = TARGET_LABEL[t] || (REG[t] && REG[t].name) || t;
    out.push({ t: `${name} ${d > 0 ? (d >= 1.5 ? '▲▲' : '▲') : d <= -1.5 ? '▼▼' : '▼'}`, good: d > 0 });
  });
  if (fx.axis) {
    const [ax, dir] = fx.axis;
    const nm = { econ: dir < 0 ? 'Left-leaning voters' : 'Pro-market voters', social: dir < 0 ? 'Liberal voters' : 'Traditional voters', defense: dir > 0 ? 'Security hawks' : 'Defence sceptics', green: dir > 0 ? 'Green voters' : 'Energy-bill voters' }[ax];
    out.push({ t: `${nm} ▲`, good: true });
  }
  return out;
}
function resolveEvent(g, ci) {
  const item = g.queue[0];
  const ev = EVENT_MAP[item.id];
  const ch = ev.choices[ci];
  const p = g.player;
  const before = { share: nationalShares(g)[p], money: g.money, pc: g.pc, mom: g.momentum[p] };
  let note = null;
  if (ch.risk) {
    const ok = Math.random() < ch.risk.chance;
    applyFx(g, ok ? ch.risk.ok : ch.risk.fail, ch.tag, ev.scandal);
    note = ok ? ch.risk.okText : ch.risk.failText;
  } else {
    applyFx(g, ch.fx, ch.tag, ev.scandal);
  }
  const after = { share: nationalShares(g)[p], money: g.money, pc: g.pc, mom: g.momentum[p] };
  g.stats.events += 1;
  addNews(g, { kind: 'event', title: evTitle(ev, g), text: `You chose: ${ch.label}.${note ? ` ${note}` : ''}` });
  item.done = { ci, before, after, note };
}
const evTitle = (ev, g) => (typeof ev.title === 'function' ? ev.title(g) : ev.title);

/* ============================================================
   Debates
   ============================================================ */
const STYLE_BONUS = {
  LSDP: { welfare: 2, moderate: 1, attack: -0.5, business: -1 },
  TS: { security: 2, technocrat: 1, business: 1, populist: -1, traditional: 0.5 },
  NA: { populist: 2.5, attack: 1.5, welfare: 0.5, technocrat: -1, business: -1 },
  DSVL: { moderate: 2.5, green: 1.5, welfare: 1, technocrat: 1, attack: -2 },
  LS: { technocrat: 1.5, business: 2, progressive: 1.5, youth: 1.5, populist: -1.5 },
  LVZS: { traditional: 2, welfare: 1, populist: 1, progressive: -1 },
  LP: { progressive: 2.5, youth: 2, green: 1.5, business: 0.5, populist: -1, traditional: -2 },
  LLRA: { traditional: 2, minority: 3, welfare: 0.5 },
};
function scoreAnswer(g, ans) {
  let s = ans.base + ((STYLE_BONUS[g.player] || {})[ans.style] || 0);
  let note = null;
  if (ans.axis) {
    const [ax, dir] = ans.axis;
    const st = (g.stance[ax] / 90) * dir;
    if (st >= 0.3) { s += 1.2 * st; note = 'On-message'; }
    else if (st <= -0.3) { s += 2.8 * st; note = 'Contradicts your platform'; }
  }
  s += (Math.random() - 0.5) * 1.6;
  return { score: clamp(s, 0, 10), note };
}
function resolveDebate(g, idx, picks) {
  const p = g.player;
  const D = DEBATES[idx];
  const avg = sum(picks.map((x) => x.score)) / picks.length;
  const before = nationalShares(g)[p];
  picks.forEach(({ qi, ai, score }) => {
    const ans = D.questions[qi].answers[ai];
    const m = score / 6;
    (ans.tags || []).forEach(([t, d]) => applyTarget(g, t, d > 0 ? d * m : d, 1));
    if (ans.axis) applyAxis(g, ans.axis[0], ans.axis[1], 0.45 * m, 1);
    if (ans.pc) g.pc = Math.max(0, g.pc + ans.pc);
  });
  for (const r of REGIONS) gainSupport(g, r.id, p, 0.22 * Math.max(0, avg - 5) * geoMult(p, r), 1);
  const nat = nationalShares(g);
  const rivals = PARTY_IDS.filter((q) => q !== p).sort((a, b) => nat[b] - nat[a]).slice(0, 4);
  const scores = [{ p, s: avg }, ...rivals.map((q) => ({ p: q, s: 4.6 + Math.random() * 2.8 + nat[q] / 14 }))];
  const ex = scores.map((x) => Math.exp(x.s * 0.9));
  const te = sum(ex);
  const poll = scores.map((x, i) => ({ p: x.p, s: x.s, pct: (ex[i] / te) * 100 })).sort((a, b) => b.pct - a.pct);
  const rank = poll.findIndex((x) => x.p === p) + 1;
  const won = rank === 1;
  g.momentum[p] = clamp(g.momentum[p] + (avg - 6) * 0.8 + (won ? 1 : 0), -10, 10);
  g.pc += won ? 2 : avg > 6 ? 1 : 0;
  poll.forEach((x) => { if (x.p !== p) g.momentum[x.p] = clamp(g.momentum[x.p] + (x.s - 6) * 0.5, -10, 10); });
  REGIONS.forEach((r) => normalizeRegion(g, r.id));
  const after = nationalShares(g)[p];
  g.stats.debates.push({ idx, avg, rank, won });
  addNews(g, { kind: 'debate', title: `LRT debate: ${D.title}`, text: `Snap poll: ${PARTIES[poll[0].p].short} won the night with ${poll[0].pct.toFixed(0)}%. You finished #${rank}.` });
  return { poll, avg, rank, won, delta: after - before };
}

/* ============================================================
   Election simulation
   ============================================================ */
function hare(entries, seats) {
  const out = {};
  const tot = sum(entries.map((e) => e[1]));
  if (!tot) return out;
  const q = tot / seats;
  let used = 0;
  const rem = entries.map(([p, v]) => {
    const f = Math.floor(v / q);
    out[p] = f; used += f;
    return [p, v / q - f];
  });
  rem.sort((a, b) => b[1] - a[1]);
  for (let i = 0; used < seats; i++, used++) out[rem[i % rem.length][0]] += 1;
  return out;
}
function transferAff(g, q, X) {
  const pq = q === 'MINOR' ? PARTIES.KITI.pos : posOf(g, q);
  const px = posOf(g, X);
  const d = sum(AXIS_IDS.map((a) => Math.abs(pq[a] - px[a])));
  let aff = Math.exp(-d / 150);
  if (q === 'NA' && ['TS', 'LS', 'LP'].includes(X)) aff *= 0.5;
  if (['LP', 'LS'].includes(q) && ['NA', 'LLRA'].includes(X)) aff *= 0.45;
  if ((q === 'MINOR' || q === 'KITI') && ['NA', 'LVZS'].includes(X)) aff *= 1.3;
  return aff;
}
function simulateElection(g, noisy) {
  const ng = () => (noisy ? gauss() : 0);
  const natErr = Object.fromEntries(ALL_IDS.map((p) => [p, Math.exp(ng() * 0.045)]));
  const regions = {};
  const natVotes = Object.fromEntries(ALL_IDS.map((p) => [p, 0]));
  let total = 0;
  for (const r of REGIONS) {
    const eff = Object.fromEntries(ALL_IDS.map((p) => [p, effSupport(g, r, p)]));
    const w = Object.fromEntries(ALL_IDS.map((p) => [p, Math.pow(eff[p], 1.1)]));
    const ws = sum(Object.values(w));
    const U = g.undecided[r.id];
    const vs = {};
    for (const p of ALL_IDS) {
      let f = eff[p] + (U * w[p]) / ws;
      f *= natErr[p] * Math.exp(ng() * 0.05);
      f *= 1 + g.boost[r.id][p] + g.gg[r.id][p] / 400;
      vs[p] = f;
    }
    const t = sum(Object.values(vs));
    const avgBoost = sum(ALL_IDS.map((p) => (g.boost[r.id][p] * vs[p]) / t));
    const turnout = clamp(r.turnout * (1 + 0.5 * avgBoost) + ng() * 0.01, 0.2, 0.85);
    const cast = Math.round(r.voters * 1000 * turnout);
    const shares = {}, votes = {};
    for (const p of ALL_IDS) {
      shares[p] = (vs[p] / t) * 100;
      votes[p] = Math.round((cast * vs[p]) / t);
      natVotes[p] += votes[p];
    }
    total += cast;
    regions[r.id] = { shares, votes, cast, turnout };
  }
  const natShares = Object.fromEntries(ALL_IDS.map((p) => [p, (natVotes[p] / total) * 100]));
  const eligible = PARTY_IDS.filter((p) => natShares[p] >= 5);
  const pr = hare(eligible.map((p) => [p, natVotes[p]]), 70);
  // Tactical anti-landslide voting: runoff transfers to a runaway national leader weaken.
  const natOrd = PARTY_IDS.slice().sort((a, b) => natShares[b] - natShares[a]);
  const natLead = natShares[natOrd[0]] - natShares[natOrd[1]];
  const damp = natLead > 4 ? Math.max(0.45, 1 - (natLead - 4) * 0.09) : 1;
  const tAff = (q, X) => transferAff(g, q, X) * (X === natOrd[0] ? damp : 1);
  const smd = [];
  for (const r of REGIONS) {
    r.cons.forEach((c, i) => {
      const cid = `${r.id}-${i}`;
      const L = g.leans[cid];
      const cand = ALL_IDS.map((p) => ({ p, s: regions[r.id].shares[p] * L[p] * Math.exp(ng() * 0.1) }));
      const kiti = cand.find((x) => x.p === 'KITI');
      cand.push({ p: 'MINOR', s: kiti.s * 0.55 });
      kiti.s *= 0.45;
      const ts = sum(cand.map((x) => x.s));
      cand.forEach((x) => { x.s = (x.s / ts) * 100; });
      cand.sort((a, b) => b.s - a.s);
      const ranked = cand.filter((x) => x.p !== 'MINOR');
      const e = { cid, rid: r.id, name: c[0], r1: cand.slice(0, 4).map((x) => ({ p: x.p, s: x.s })) };
      if (ranked[0].s > 50) {
        e.round = 1; e.winner = ranked[0].p; e.margin = ranked[0].s - ranked[1].s;
      } else {
        const A = ranked[0], B = ranked[1];
        let va = A.s * 0.9, vb = B.s * 0.9;
        for (const x of cand) {
          if (x.p === A.p || x.p === B.p) continue;
          const da = tAff(x.p, A.p), db = tAff(x.p, B.p);
          va += (x.s * 0.6 * da) / (da + db);
          vb += (x.s * 0.6 * db) / (da + db);
        }
        va *= Math.exp(ng() * 0.05) * (1 + g.gg[r.id][A.p] / 600);
        vb *= Math.exp(ng() * 0.05) * (1 + g.gg[r.id][B.p] / 600);
        const tt = va + vb;
        e.round = 2;
        e.runoff = { a: A.p, b: B.p, sa: (va / tt) * 100, sb: (vb / tt) * 100 };
        e.winner = va >= vb ? A.p : B.p;
        e.margin = (Math.abs(va - vb) / tt) * 100;
      }
      smd.push(e);
    });
  }
  const seats = Object.fromEntries(ALL_IDS.map((p) => [p, pr[p] || 0]));
  const smdSeats = Object.fromEntries(ALL_IDS.map((p) => [p, 0]));
  smd.forEach((e) => { seats[e.winner] += 1; smdSeats[e.winner] += 1; });
  return { regions, natShares, natVotes, total, eligible, pr, smd, seats, smdSeats, turnout: total / (TOTAL_VOTERS * 1000) };
}

/* ============================================================
   Coalition logic
   ============================================================ */
const AFFINITY = {
  'NA|TS': -35, 'LS|NA': -40, 'LP|NA': -50, 'DSVL|NA': -10, 'LSDP|NA': 5, 'LLRA|LP': -35, 'LP|LVZS': -30,
  'LS|LVZS': -15, 'LVZS|TS': -10, 'LLRA|LS': -15, 'LSDP|LVZS': 5, 'LS|TS': 10, 'LP|TS': 5, 'DSVL|LSDP': 5,
  'LLRA|TS': 5, 'LLRA|LSDP': 5,
};
const affKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
function compat(g, a, b) {
  if (a === 'KITI' || b === 'KITI') return 55;
  const pa = posOf(g, a), pb = posOf(g, b);
  const d = sum(AXIS_IDS.map((x) => Math.abs(pa[x] - pb[x])));
  let c = 100 - d / 3.6 + (AFFINITY[affKey(a, b)] || 0);
  if (a === 'DSVL' || b === 'DSVL') c += 20;
  return clamp(Math.round(c), 0, 100);
}
const MINISTRIES = ['Finance', 'Foreign Affairs', 'National Defence', 'Interior', 'Economy & Innovation', 'Social Security & Labour',
  'Health', 'Education, Science & Sport', 'Justice', 'Environment', 'Energy', 'Agriculture', 'Transport & Communications', 'Culture'];
const MIN_PREF = {
  LSDP: ['Finance', 'Social Security & Labour', 'Health', 'Interior'],
  TS: ['Foreign Affairs', 'National Defence', 'Finance', 'Energy'],
  NA: ['Interior', 'Environment', 'Justice', 'Agriculture'],
  DSVL: ['Environment', 'Health', 'Energy', 'Education, Science & Sport'],
  LS: ['Economy & Innovation', 'Justice', 'Transport & Communications', 'Education, Science & Sport'],
  LVZS: ['Agriculture', 'Health', 'Culture', 'Education, Science & Sport'],
  LP: ['Justice', 'Culture', 'Education, Science & Sport', 'Economy & Innovation'],
  LLRA: ['Energy', 'Transport & Communications', 'Culture'],
};
const DEMANDS = {
  LSDP: { text: 'Progressive income tax and pension indexation', axis: ['econ', -1] },
  TS: { text: 'Defence spending of 5% of GDP written into law', axis: ['defense', 1] },
  NA: { text: 'VAT cut on food and a heating price freeze', axis: ['econ', -1] },
  DSVL: { text: 'Green energy investment and a regional healthcare guarantee', axis: ['green', 1] },
  LS: { text: 'Civil partnership law and lower labour taxes', axis: ['social', -1] },
  LVZS: { text: 'Farm support package and strict alcohol control', axis: ['social', 1] },
  LP: { text: 'Civil partnership and cannabis decriminalisation', axis: ['social', -1] },
  LLRA: { text: 'Minority-language schools and original-spelling surnames', axis: null },
  KITI: { text: 'Local projects in their constituencies', axis: null },
};
function cabinet(g, partners) {
  const S = g.election.seats;
  const members = [g.player, ...partners.filter((p) => p !== 'KITI')];
  const total = sum(members.map((p) => S[p]));
  const counts = {};
  let used = 0;
  members.slice(1).forEach((p) => { counts[p] = Math.max(1, Math.round((S[p] / total) * 14)); used += counts[p]; });
  counts[g.player] = Math.max(0, 14 - used);
  const free = [...MINISTRIES];
  const alloc = {};
  members.forEach((p) => { alloc[p] = []; });
  const take = (p) => {
    const pref = (MIN_PREF[p] || []).find((m) => free.includes(m)) || free[0];
    free.splice(free.indexOf(pref), 1);
    alloc[p].push(pref);
  };
  const order = [g.player, ...members.slice(1).sort((a, b) => S[b] - S[a])];
  let guard = 0;
  while (free.length && guard < 60) {
    order.forEach((p) => { if (free.length && alloc[p].length < counts[p]) take(p); });
    guard += 1;
  }
  return { counts, alloc, mine: counts[g.player] };
}
function demandConflicts(g, partners, accepted) {
  const out = [];
  partners.forEach((d) => {
    if (!accepted[d] || !DEMANDS[d].axis) return;
    const [ax, dir] = DEMANDS[d].axis;
    partners.forEach((q) => { if (q !== d && q !== 'KITI' && PARTIES[q].pos[ax] * dir <= -30) out.push([d, q]); });
  });
  return out;
}
function willingness(g, p, coal) {
  const S = g.election.seats;
  const largest = PARTY_IDS.concat('KITI').sort((a, b) => S[b] - S[a])[0];
  let w = compat(g, g.player, p) + (coal.accepted[p] ? 15 : 0) + 7 * (coal.sweet[p] || 0) + (largest === g.player ? 8 : -5);
  coal.partners.forEach((q) => { if (q !== p && compat(g, p, q) < 25) w -= 18; });
  demandConflicts(g, coal.partners, coal.accepted).forEach(([, q]) => { if (q === p) w -= 10; });
  return clamp(Math.round(w), 0, 100);
}
function stability(g, coal) {
  const S = g.election.seats;
  const partners = coal.partners;
  const members = [g.player, ...partners];
  const seats = sum(members.map((p) => S[p]));
  if (!partners.length) return seats >= MAJORITY ? 82 : 0;
  let s = 58 + clamp((seats - MAJORITY) * 1.4, -30, 14) - 9 * (partners.length - 1);
  const pcs = [];
  for (let i = 0; i < members.length; i++) for (let j = i + 1; j < members.length; j++) pcs.push(compat(g, members[i], members[j]));
  s += 0.3 * (sum(pcs) / pcs.length - 55);
  s -= 12 * pcs.filter((c) => c < 25).length;
  s += 3 * partners.filter((p) => coal.accepted[p]).length;
  s -= 4 * demandConflicts(g, partners, coal.accepted).length;
  if (g.player === 'DSVL') s += 8;
  if (cabinet(g, partners).mine < 5) s -= 8;
  if (partners.includes('KITI')) s -= 8;
  return clamp(Math.round(s), 0, 100);
}
function aiCoalition(g, leader, mustInclude) {
  const S = g.election.seats;
  const members = [leader];
  if (mustInclude) members.push(mustInclude);
  let total = sum(members.map((p) => S[p]));
  const pool = PARTY_IDS.filter((p) => !members.includes(p) && S[p] > 0).sort((a, b) => compat(g, leader, b) - compat(g, leader, a));
  for (const p of pool) {
    if (total >= MAJORITY) break;
    if (compat(g, leader, p) < 40) continue;
    if (members.some((m) => compat(g, m, p) < 25)) continue;
    members.push(p); total += S[p];
  }
  if (total < MAJORITY && S.KITI && !members.includes('KITI')) { members.push('KITI'); total += S.KITI; }
  return { members, total, ok: total >= MAJORITY };
}

/* ============================================================
   Hemicycle layout (141 seats)
   ============================================================ */
function hemiLayout(total, rows) {
  const r0 = 0.36, r1 = 1;
  const radii = Array.from({ length: rows }, (_, i) => r0 + ((r1 - r0) * i) / (rows - 1));
  const rs = sum(radii);
  const counts = radii.map((r) => Math.round((total * r) / rs));
  let diff = total - sum(counts);
  let i = rows - 1;
  while (diff !== 0) {
    counts[i] += diff > 0 ? 1 : -1;
    diff += diff > 0 ? -1 : 1;
    i = (i - 1 + rows) % rows;
  }
  const seats = [];
  radii.forEach((r, ri) => {
    const n = counts[ri];
    for (let j = 0; j < n; j++) {
      const a = Math.PI - (n === 1 ? Math.PI / 2 : (j / (n - 1)) * Math.PI);
      seats.push({ x: r * Math.cos(a), y: -r * Math.sin(a), a, r });
    }
  });
  seats.sort((s1, s2) => s2.a - s1.a || s1.r - s2.r);
  return seats;
}
const HEMI = hemiLayout(141, 8);

/* ============================================================
   News events (three strategic choices each)
   ============================================================ */
const EVENTS = [
  {
    id: 'energy', cat: 'Economy', icon: Zap, title: 'Heating bills set to jump 30% this winter',
    body: 'Gas prices spike after a pipeline outage in the region. District heating companies in Šiauliai, Panevėžys and Utena warn of record bills.',
    choices: [
      { label: 'Demand a VAT cut on heating', tag: 'welfare', fx: { reg: [['rural', 1.5], ['urban', 0.3]], pc: -1, axis: ['econ', -1, 0.5] } },
      { label: 'Fast-track solar and wind subsidies', tag: 'green', fx: { reg: [['urban', 1.3], ['rural', -0.4]], axis: ['green', 1, 0.7], mom: 0.4 } },
      { label: 'Blame the government’s energy policy', tag: 'populist', fx: { mom: 1.2, und: 0.5, pc: -1 } },
    ],
  },
  {
    id: 'border', cat: 'Security', icon: ShieldAlert, title: 'Smuggling balloons from Belarus shut Vilnius Airport again',
    body: 'For the third night this month, contraband balloons drift across the border and flights are grounded. Residents of Šalčininkai and Druskininkai demand action.',
    choices: [
      { label: 'Close the Belarus border completely', tag: 'security', fx: { reg: [['border', 1.4]], axis: ['defense', 1, 0.9], mom: 0.6 } },
      { label: 'Coordinate an EU and NATO response', tag: 'moderate', fx: { pc: 1, mom: 0.3, reg: [['urban', 0.6]] } },
      { label: 'Accuse the government of sleeping on the job', tag: 'populist', fx: { mom: 1.1, reg: [['rural', 0.6]], pc: -1 } },
    ],
  },
  {
    id: 'leak', cat: 'Scandal', icon: Mail, title: 'Leaked ministerial emails hint at procurement favours',
    body: 'An investigative portal publishes emails suggesting a ministry steered a €40M IT contract. No party is named yet.',
    choices: [
      { label: 'Demand an STT anti-corruption probe', tag: 'populist', fx: { mom: 1, pc: 1 } },
      { label: 'Publish your own party’s procurement records', tag: 'moderate', fx: { money: -20, pc: 2, reg: [['urban', 0.8]], mom: 0.4 } },
      { label: 'Stay quiet: one of the firms is a donor', tag: null, fx: { money: 90, scandal: 10, mom: -0.4 } },
    ],
  },
  {
    id: 'tractors', cat: 'Agriculture', icon: Tractor, title: '400 tractors roll into Vilnius over EU green rules',
    body: 'Farmers from Suvalkija and Aukštaitija block Gedimino prospektas, protesting fertiliser limits and low purchase prices for milk and grain.',
    choices: [
      { label: 'Join the farmers on Gedimino prospektas', tag: 'agri', fx: { reg: [['agri', 1.8], ['VNO', -1.0]], axis: ['green', -1, 0.5] } },
      { label: 'Propose a €50M transition fund', tag: 'moderate', fx: { money: -30, reg: [['rural', 0.9]], pc: 1 } },
      { label: 'Back the green rules: climate can’t wait', tag: 'green', fx: { reg: [['urban', 1.1], ['agri', -1.5]], axis: ['green', 1, 0.5] } },
    ],
  },
  {
    id: 'eurobarometer', cat: 'Economy', icon: BarChart3, title: 'Eurobarometer: inflation is Lithuanians’ No. 1 worry',
    body: '58% of Lithuanians name rising prices as their top concern, the highest share in the Baltics. Food prices are up 9% on the year.',
    choices: [
      { label: 'Pledge to index pensions and raise the minimum wage', tag: 'welfare', fx: { reg: [['rural', 1.4]], axis: ['econ', -1, 0.6], pc: -1 } },
      { label: 'Promise tax cuts for working families', tag: 'business', fx: { reg: [['urban', 1.1]], axis: ['econ', 1, 0.6] } },
      { label: 'Publish a costed anti-inflation plan', tag: 'moderate', fx: { pc: 2, und: 0.6, mom: 0.3 } },
    ],
  },
  {
    id: 'teachers', cat: 'Education', icon: GraduationCap, title: 'Teachers’ union announces a national strike',
    body: 'Schools in Kaunas and Klaipėda will close on Monday as teachers demand a 15% raise and smaller classes.',
    choices: [
      { label: 'Stand with the teachers', tag: 'welfare', fx: { reg: [['all', 0.6]], pc: -1, axis: ['econ', -1, 0.3] } },
      { label: 'Offer a pay-for-performance reform', tag: 'business', fx: { reg: [['urban', 0.8], ['rural', -0.4]] } },
      { label: 'Call for mediation and calm', tag: 'moderate', fx: { pc: 1, mom: 0.2 } },
    ],
  },
  {
    id: 'hospitals', cat: 'Health', icon: HeartPulse, title: 'Ministry plans to close maternity wards in nine district hospitals',
    body: 'Hospitals in Ignalina, Šilalė, Lazdijai and six other towns would lose services under the consolidation plan.',
    choices: [
      { label: 'Promise every district hospital stays open', tag: 'welfare', fx: { reg: [['rural', 1.6]], pc: -1 } },
      { label: 'Back consolidation and fund new ambulances', tag: 'moderate', fx: { reg: [['urban', 0.6], ['rural', -0.8]], pc: 1 } },
      { label: 'Tour the affected towns', tag: null, fx: { money: -40, reg: [['UTE', 2], ['TAU', 2], ['ALY', 2]] } },
    ],
  },
  {
    id: 'rail', cat: 'Infrastructure', icon: TrainFront, title: 'Rail Baltica delayed again: Kaunas–Vilnius line slips to 2032',
    body: 'The EU’s flagship rail project faces cost overruns. Contractors blame land disputes near Jonava.',
    choices: [
      { label: 'Pledge to fast-track it with EU money', tag: 'business', fx: { reg: [['KNS', 1.2], ['KNC', 1], ['VNO', 0.8], ['PAN', 0.6]] } },
      { label: 'Redirect the money to regional roads', tag: 'populist', fx: { reg: [['rural', 1.1], ['urban', -0.5]] } },
      { label: 'Demand a full audit of the contractors', tag: 'moderate', fx: { pc: 1, mom: 0.5 } },
    ],
  },
  {
    id: 'brigade', cat: 'Security', icon: Shield, title: 'German brigade base expands at Rūdninkai, landowners protest',
    body: 'NATO’s new brigade needs more training ground. Farmers in Šalčininkai district say the compensation offered is too low.',
    choices: [
      { label: 'Champion the brigade: security first', tag: 'security', fx: { axis: ['defense', 1, 1], reg: [['VNO', 0.8]] } },
      { label: 'Demand fair compensation for landowners', tag: 'welfare', fx: { reg: [['VLC', 1.6], ['rural', 0.4]] } },
      { label: 'Question the cost of the deployment', tag: 'populist', fx: { axis: ['defense', -1, 0.8], reg: [['rural', 0.5]], mom: -0.3 } },
    ],
  },
  {
    id: 'emigration', cat: 'Society', icon: Plane, title: '15,000 young people left the regions this year',
    body: 'New figures from Statistics Lithuania show Utena, Tauragė and Šiauliai counties losing residents fastest.',
    choices: [
      { label: 'A regional jobs fund for Šiauliai, Panevėžys and Utena', tag: 'welfare', fx: { reg: [['SIA', 1.4], ['PAN', 1.4], ['UTE', 1.4]] } },
      { label: 'Startup visas and remote-work hubs', tag: 'youth', fx: { reg: [['urban', 0.9], ['ABR', 2]] } },
      { label: 'Blame Brussels and the big-city elites', tag: 'populist', fx: { reg: [['rural', 1.3], ['urban', -1]], mom: 0.4 } },
    ],
  },
  {
    id: 'port', cat: 'Economy', icon: Anchor, title: 'Klaipėda port cargo falls 12% after sanctions and storms',
    body: 'Stevedoring companies warn of layoffs. Klaipėda’s mayor wants a national rescue plan before winter.',
    choices: [
      { label: 'Pledge LNG and port expansion', tag: 'business', fx: { reg: [['KLP', 2.2]], axis: ['green', -1, 0.3] } },
      { label: 'Make Klaipėda an offshore wind hub', tag: 'green', fx: { reg: [['KLP', 1.4], ['urban', 0.4]], axis: ['green', 1, 0.4] } },
      { label: 'Stay on your national message', tag: null, fx: { pc: 1 } },
    ],
  },
  {
    id: 'cyber', cat: 'Security', icon: AlertTriangle, title: 'Cyberattack takes down government e-services for two days',
    body: 'Tax filings, e-health and the Sodra portal go dark. Investigators point to a pro-Kremlin hacker group.',
    choices: [
      { label: 'Propose a national cyber command', tag: 'security', fx: { axis: ['defense', 1, 0.6], reg: [['urban', 0.8]], pc: 1 } },
      { label: 'Demand new EU sanctions on Russia', tag: 'moderate', fx: { mom: 0.6, reg: [['VNO', 0.6], ['KNS', 0.4]] } },
      { label: 'Slam the government’s IT incompetence', tag: 'populist', fx: { mom: 1.1, pc: -1 } },
    ],
  },
  {
    id: 'language', cat: 'Minorities', icon: Languages, title: 'Seimas clashes over bilingual street signs in Vilnius District',
    body: 'A bill would allow Polish-language street names alongside Lithuanian ones where minorities are a majority.',
    choices: [
      { label: 'Support bilingual signs', tag: 'minority', fx: { reg: [['VLC', 2.4], ['VNO', 0.4], ['rural', -0.5]] } },
      { label: 'Oppose: one state language', tag: 'traditional', fx: { reg: [['rural', 0.8], ['VLC', -2.4]] } },
      { label: 'Propose an expert commission', tag: 'moderate', fx: { pc: 1 } },
    ],
  },
  {
    id: 'basketball', cat: 'Sport', icon: Trophy, title: 'Lithuania reaches the EuroBasket semi-final',
    body: 'The whole country is wearing green. Kaunas’ Žalgirio Arena is hosting a public screening for 15,000 fans.',
    choices: [
      { label: 'Host a fan zone in Kaunas', tag: 'populist', fx: { money: -30, reg: [['KNS', 1.3], ['KNC', 0.6]] } },
      { label: 'Post a celebration video', tag: 'youth', fx: { mom: 0.6, reg: [['urban', 0.4]] } },
      { label: 'Stay focused on policy', tag: null, fx: { pc: 1 } },
    ],
  },
  {
    id: 'pensions', cat: 'Welfare', icon: PiggyBank, title: 'Sodra warns of a pension fund gap by 2035',
    body: 'The social insurance fund projects a €1.2bn annual shortfall as the population ages and young workers emigrate.',
    choices: [
      { label: 'Guarantee pensions with higher employer contributions', tag: 'welfare', fx: { reg: [['rural', 1.3], ['urban', -0.4]], axis: ['econ', -1, 0.5] } },
      { label: 'Raise the retirement age gradually', tag: 'business', fx: { reg: [['urban', 0.5], ['rural', -1.2]], pc: 2 } },
      { label: 'Promise no age hike and no tax hike', tag: 'populist', fx: { und: 0.8, mom: 0.4, pc: -2 } },
    ],
  },
  {
    id: 'taxes', cat: 'Economy', icon: Coins, title: 'Finance ministry floats a property tax on second homes',
    body: 'Economists call it fair. Homeowners in Vilnius and on the coast are furious.',
    choices: [
      { label: 'Back it: wealth should pay its share', tag: 'welfare', fx: { reg: [['rural', 1.0], ['urban', -0.8]], axis: ['econ', -1, 0.5], money: -40 } },
      { label: 'Oppose it: hands off family homes', tag: 'business', fx: { reg: [['urban', 0.9], ['KLP', 0.6]], axis: ['econ', 1, 0.5], money: 60 } },
      { label: 'Propose a narrow luxury tax instead', tag: 'moderate', fx: { pc: 1, und: 0.4 } },
    ],
  },
  {
    id: 'festival', cat: 'Culture', icon: Music, title: 'A chart-topping singer wants to endorse you in Palanga',
    body: 'Fifty thousand fans, one stage at the summer festival, and a lot of TikTok cameras.',
    choices: [
      { label: 'Join them on stage', tag: 'youth', fx: { reg: [['KLP', 1.3], ['urban', 0.5]], money: -15 } },
      { label: 'Film a short video together', tag: 'youth', fx: { reg: [['urban', 0.8]], mom: 0.3 } },
      { label: 'Politely decline', tag: null, fx: { pc: 1 } },
    ],
  },
  {
    id: 'partnership', cat: 'Values', icon: Users, title: 'Court ruling reopens the civil partnership debate',
    body: 'The Constitutional Court says same-sex couples must have legal recognition. The Seimas has to act, and every party has to answer.',
    choices: [
      { label: 'Pledge a full civil partnership law', tag: 'progressive', fx: { reg: [['urban', 1.0], ['rural', -1.0]], axis: ['social', -1, 0.7] } },
      { label: 'Offer a narrow cohabitation agreement', tag: 'moderate', fx: { pc: 1, und: 0.3 } },
      { label: 'Defend the traditional family', tag: 'traditional', fx: { reg: [['rural', 1.0], ['urban', -0.9]], axis: ['social', 1, 0.7] } },
    ],
  },
  {
    id: 'scandal_mp', scandal: true, cat: 'Scandal', icon: Flame,
    title: (g) => `${PARTIES[g.player].short} MP filmed driving drunk in Kaunas`,
    body: 'The dashcam video has 400,000 views by breakfast. Every TV channel wants your reaction.',
    choices: [
      { label: 'Expel the MP immediately', tag: null, fx: { mom: -0.4, pc: 1 } },
      { label: 'Stand by him: he apologised', tag: null, fx: { mom: -2.2, scandal: 4 } },
      { label: 'Hold a road-safety press conference', tag: null, fx: { money: -25, mom: -1, und: 0.2 } },
    ],
  },
  {
    id: 'scandal_money', scandal: true, cat: 'Scandal', icon: Siren,
    title: (g) => `Investigation: ${PARTIES[g.player].short} got €200k via a shell company`,
    body: 'Journalists trace the payments to a construction firm bidding for public contracts. Your lobbying meetings are now front-page news.',
    choices: [
      { label: 'Return the money and order an audit', tag: null, fx: { money: -200, scandal: -20, mom: -0.8 } },
      {
        label: 'Deny everything', tag: null, risky: true,
        risk: { chance: 0.5, ok: { scandal: -5 }, okText: 'The story fizzles out.', fail: { mom: -3, pc: -2 }, failText: 'Then the bank statements leak.' },
      },
      { label: 'Blame a rogue treasurer', tag: null, fx: { mom: -1.5, scandal: -8 } },
    ],
  },
];
const EVENT_MAP = Object.fromEntries(EVENTS.map((e) => [e.id, e]));

/* ============================================================
   LRT debates (weeks 4, 8, 11)
   ============================================================ */
const DEBATES = [
  {
    title: 'The Economy', subtitle: 'LRT pre-election debate · 1 of 3',
    questions: [
      {
        q: 'Prices are up a quarter in three years. What exactly will you do about the cost of living?',
        answers: [
          { t: 'Index pensions and raise the minimum wage to €1,200.', style: 'welfare', base: 6, axis: ['econ', -1], tags: [['rural', 0.8]] },
          { t: 'Cut VAT on food and medicine to 9%, from day one.', style: 'populist', base: 6.5, axis: ['econ', -1], tags: [['all', 0.4]], pc: -1 },
          { t: 'Fiscal discipline and higher productivity. No magic tricks.', style: 'technocrat', base: 5.5, axis: ['econ', 1], tags: [['urban', 0.7]] },
          { t: '“The government let prices explode, and they want four more years?”', style: 'attack', base: 5.5, tags: [['all', 0.3]] },
        ],
      },
      {
        q: 'Lithuania loses thousands of young people abroad every year. How do you bring them home?',
        answers: [
          { t: 'A regional investment fund and affordable rental housing.', style: 'welfare', base: 6, axis: ['econ', -1], tags: [['rural', 0.6]] },
          { t: 'Lower income tax for young professionals under 30.', style: 'business', base: 6, axis: ['econ', 1], tags: [['urban', 0.6], ['ABR', 1.5]] },
          { t: 'Dual citizenship and a real diaspora strategy.', style: 'youth', base: 6, tags: [['ABR', 2.5], ['urban', 0.3]] },
        ],
      },
      {
        q: 'Thirty seconds. Why should an undecided voter in Panevėžys trust you?',
        answers: [
          { t: 'A calm promise: competent, honest government for every region.', style: 'moderate', base: 6, tags: [['all', 0.3]] },
          { t: 'A fiery speech against the Vilnius elites.', style: 'populist', base: 6, tags: [['rural', 0.8], ['urban', -0.5]] },
          { t: 'Three concrete, costed pledges, read straight to camera.', style: 'technocrat', base: 6, tags: [['urban', 0.5]] },
        ],
      },
    ],
  },
  {
    title: 'Security & Foreign Policy', subtitle: 'LRT pre-election debate · 2 of 3',
    questions: [
      {
        q: 'Should defence spending rise to 5–6% of GDP, even if it means new taxes?',
        answers: [
          { t: 'Yes. Security has no price: 6% now.', style: 'security', base: 6, axis: ['defense', 1], tags: [['VNO', 0.8], ['border', 0.6]] },
          { t: 'Yes, but paid for by a bank-profit tax, not by families.', style: 'welfare', base: 6.5, axis: ['econ', -1], tags: [['all', 0.4]] },
          { t: 'We need balance: 4%, and invest the rest in people.', style: 'populist', base: 5.5, axis: ['defense', -1], tags: [['rural', 0.6], ['VNO', -0.8]] },
        ],
      },
      {
        q: 'Belarus keeps sending smuggling balloons and migrants. What is your red line?',
        answers: [
          { t: 'Close the border until it stops. Full stop.', style: 'security', base: 6, axis: ['defense', 1], tags: [['border', 1.0]] },
          { t: 'Coordinated EU sanctions and modern airspace defence.', style: 'moderate', base: 6, tags: [['urban', 0.5]] },
          { t: 'De-escalate through diplomatic channels.', style: 'technocrat', base: 4.5, axis: ['defense', -1], tags: [['border', -0.8]] },
        ],
      },
      {
        q: 'Should every 18-year-old, men and women, do military service?',
        answers: [
          { t: 'Yes. Universal service, like Finland.', style: 'security', base: 5.5, axis: ['defense', 1], tags: [['urban', 0.3]] },
          { t: 'Expand it for men, keep it voluntary for women.', style: 'traditional', base: 6, axis: ['social', 1], tags: [['rural', 0.5]] },
          { t: 'No. Build a professional army instead.', style: 'youth', base: 5.5, axis: ['defense', -1], tags: [['urban', 0.4]] },
        ],
      },
    ],
  },
  {
    title: 'Values, Energy & the Future', subtitle: 'LRT pre-election debate · 3 of 3',
    questions: [
      {
        q: 'Will your government pass the civil partnership law?',
        answers: [
          { t: 'Yes: equal recognition for every family.', style: 'progressive', base: 6, axis: ['social', -1], tags: [['urban', 1.0], ['rural', -0.8]] },
          { t: 'A narrow cohabitation agreement, not partnership.', style: 'moderate', base: 6, tags: [['all', 0.3]] },
          { t: 'No. We protect the traditional family.', style: 'traditional', base: 6, axis: ['social', 1], tags: [['rural', 1.0], ['urban', -0.8]] },
        ],
      },
      {
        q: 'Energy: offshore wind, a new nuclear plant, or cheap gas?',
        answers: [
          { t: 'Offshore wind and solar: green independence.', style: 'green', base: 6, axis: ['green', 1], tags: [['urban', 0.7], ['KLP', 0.8]] },
          { t: 'Small modular reactors at Visaginas.', style: 'technocrat', base: 6, axis: ['green', 1], tags: [['UTE', 2.5]] },
          { t: 'Keep gas cheap and stop the green experiments.', style: 'populist', base: 6, axis: ['green', -1], tags: [['rural', 0.8], ['urban', -0.6]] },
        ],
      },
      {
        q: 'Final word. Look into the camera and speak to the undecided.',
        answers: [
          { t: '“Lithuania is stronger when we stop shouting at each other.”', style: 'moderate', base: 6, tags: [['all', 0.4]] },
          { t: '“Throw out the people who forgot you exist.”', style: 'populist', base: 6, tags: [['rural', 0.8], ['urban', -0.4]] },
          { t: '“Vote for competence. Read our programme.”', style: 'technocrat', base: 6, tags: [['urban', 0.6]] },
        ],
      },
    ],
  },
];

/* ============================================================
   Save / load (per-viewer convenience)
   ============================================================ */
const SAVE_KEY = 'seimas-bfl-save-v1';
function loadSave() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const g = JSON.parse(raw);
    return g && g.v === 1 && g.phase !== 'result' ? g : null;
  } catch (e) {
    return null;
  }
}
function writeSave(g) {
  try {
    if (!g || g.phase === 'result') window.localStorage.removeItem(SAVE_KEY);
    else window.localStorage.setItem(SAVE_KEY, JSON.stringify(g));
  } catch (e) { /* storage unavailable */ }
}

/* ============================================================
   UI primitives
   ============================================================ */
function Tricolor({ className = '', h = 3 }) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-sm ${className}`} aria-hidden="true">
      <span style={{ background: FLAG.y, height: h }} />
      <span style={{ background: FLAG.g, height: h }} />
      <span style={{ background: FLAG.r, height: h }} />
    </div>
  );
}
function Kicker({ children, className = '' }) {
  return <div className={`text-xs uppercase tracking-widest text-slate-400 ${className}`} style={F_MONO}>{children}</div>;
}
function Swatch({ p, size = 10 }) {
  return <span className="inline-block rounded-sm shrink-0" style={{ width: size, height: size, background: PARTIES[p].color }} />;
}
function Btn({ children, onClick, disabled, kind = 'primary', className = '', ...rest }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:opacity-40 disabled:cursor-not-allowed';
  const kinds = {
    primary: 'bg-amber-400 text-slate-950 hover:bg-amber-300',
    ghost: 'bg-slate-800 text-slate-100 hover:bg-slate-700',
    outline: 'border border-slate-600 text-slate-100 hover:bg-slate-800',
    danger: 'bg-rose-600 text-white hover:bg-rose-500',
  };
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${kinds[kind]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
function Section({ title, kicker, children, right }) {
  return (
    <section className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
      <div className="flex items-end justify-between gap-3 mb-3">
        <div className="min-w-0">
          {kicker && <Kicker>{kicker}</Kicker>}
          <h3 style={F_DISPLAY} className="text-xl font-extrabold leading-tight text-slate-50">{title}</h3>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}
function Segmented({ value, onChange, options, label }) {
  return (
    <div className="inline-flex rounded-xl bg-slate-900 border border-slate-700 p-1" role="radiogroup" aria-label={label}>
      {options.map(([v, l]) => (
        <button
          key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}
          className={`h-9 px-3 rounded-lg text-sm font-semibold whitespace-nowrap transition ${value === v ? 'bg-slate-100 text-slate-950' : 'text-slate-300'}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
function Sheet({ onClose, children, label, z = 'z-40' }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className={`fixed inset-0 ${z} flex flex-col justify-end`} role="dialog" aria-modal="true" aria-label={label}>
      <div className="absolute inset-0 bg-slate-950/80 sbl-fade" onClick={onClose || undefined} />
      <div
        className="sbl-sheet sbl-scroll relative w-full max-w-lg mx-auto bg-slate-900 border-t border-slate-700 rounded-t-3xl overflow-y-auto shadow-2xl"
        style={{ maxHeight: '92vh', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}
      >
        {children}
      </div>
    </div>
  );
}
function Meter({ value, max = 100, color = GOLD, mark }) {
  return (
    <div className="relative h-2.5 rounded-full bg-slate-800 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${clamp((value / max) * 100, 0, 100)}%`, background: color }} />
      {mark != null && <div className="absolute top-0 bottom-0 w-0.5 bg-slate-100" style={{ left: `${(mark / max) * 100}%` }} />}
    </div>
  );
}
function Delta({ v, d = 1, unit = '' }) {
  if (v == null || Math.abs(v) < 0.05) return <span className="text-slate-500">±0{unit}</span>;
  return <span className={v > 0 ? 'text-emerald-400' : 'text-rose-400'}>{fmtSigned(v, d)}{unit}</span>;
}

/* ============================================================
   Hemicycle
   ============================================================ */
function Hemicycle({ seats, highlight, dim, label = 'seats', showCount = true }) {
  const left = SEAT_ORDER.slice(0, 6);
  const right = SEAT_ORDER.slice(6);
  const L = [], R = [];
  left.forEach((p) => { for (let i = 0; i < (seats[p] || 0); i++) L.push(p); });
  right.forEach((p) => { for (let i = 0; i < (seats[p] || 0); i++) R.push(p); });
  const empty = Math.max(0, 141 - L.length - R.length);
  const colors = [...L, ...Array(empty).fill(null), ...R].slice(0, 141);
  const n = highlight ? seats[highlight] || 0 : sum(Object.values(seats));
  return (
    <svg viewBox="-1.08 -1.08 2.16 1.14" className="w-full h-auto block" role="img" aria-label={`Seimas hemicycle: ${n} ${label}`}>
      <line x1="0" y1="-1.07" x2="0" y2="-0.3" stroke="#94A3B8" strokeWidth="0.008" strokeDasharray="0.03 0.025" />
      {HEMI.map((s, i) => {
        const p = colors[i];
        const faded = p && dim && !dim.includes(p);
        return (
          <circle
            key={i} cx={s.x} cy={s.y} r={0.041}
            fill={p ? PARTIES[p].color : '#1E293B'} fillOpacity={faded ? 0.25 : 1}
            stroke={p && p === highlight ? '#F8FAFC' : 'none'} strokeWidth={0.014}
          />
        );
      })}
      {showCount && (
        <g>
          <text x="0" y="-0.1" textAnchor="middle" fill="#F8FAFC" fontSize="0.24" fontWeight="800" style={F_MONO}>{n}</text>
          <text x="0" y="-0.01" textAnchor="middle" fill="#94A3B8" fontSize="0.068" style={F_MONO}>{label}</text>
        </g>
      )}
    </svg>
  );
}

/* ============================================================
   Bars, tables & charts
   ============================================================ */
function PollBars({ shares, highlight, threshold, deltas, scale }) {
  const ids = ALL_IDS.slice().sort((a, b) => (a === 'KITI' ? 1 : 0) - (b === 'KITI' ? 1 : 0) || shares[b] - shares[a]);
  const max = scale || Math.max(30, ...ids.map((p) => shares[p]));
  return (
    <div className="flex flex-col gap-1.5">
      {threshold && (
        <div className="grid gap-2 text-xs text-slate-400" style={{ gridTemplateColumns: deltas ? '68px 1fr 40px 40px' : '68px 1fr 44px' }}>
          <span />
          <div className="relative h-4">
            <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${(5 / max) * 100}%`, ...F_MONO }}>5%</span>
          </div>
          <span />{deltas && <span />}
        </div>
      )}
      {ids.map((p) => (
        <div key={p} className="grid items-center gap-2" style={{ gridTemplateColumns: deltas ? '68px 1fr 40px 40px' : '68px 1fr 44px' }}>
          <span className={`text-xs truncate ${p === highlight ? 'font-bold text-slate-50' : 'text-slate-300'}`}>{PARTIES[p].short}</span>
          <div className="relative h-5 rounded bg-slate-800 overflow-hidden">
            <div className="h-full rounded-r" style={{ width: `${(shares[p] / max) * 100}%`, background: PARTIES[p].color }} />
            {threshold && <div className="absolute top-0 bottom-0 border-l border-dashed border-slate-300" style={{ left: `${(5 / max) * 100}%`, opacity: 0.6 }} />}
          </div>
          <span className={`text-xs text-right ${p === highlight ? 'text-slate-50 font-semibold' : 'text-slate-300'}`} style={F_MONO}>{shares[p].toFixed(1)}</span>
          {deltas && <span className="text-xs text-right" style={F_MONO}><Delta v={deltas[p]} /></span>}
        </div>
      ))}
    </div>
  );
}
function SeatTable({ seats, pr, smd, highlight }) {
  const ids = ALL_IDS.filter((p) => (seats[p] || 0) > 0).sort((a, b) => seats[b] - seats[a]);
  return (
    <table className="w-full text-sm" style={F_MONO}>
      <thead>
        <tr className="text-xs text-slate-400">
          <th className="text-left font-normal py-1">Party</th>
          <th className="text-right font-normal">PR</th>
          <th className="text-right font-normal">SMD</th>
          <th className="text-right font-normal">Total</th>
        </tr>
      </thead>
      <tbody>
        {ids.map((p) => (
          <tr key={p} className={`border-t border-slate-800 ${p === highlight ? 'text-slate-50 font-semibold' : 'text-slate-300'}`}>
            <td className="py-1.5"><span className="inline-flex items-center gap-2"><Swatch p={p} />{PARTIES[p].short}</span></td>
            <td className="text-right">{pr[p] || 0}</td>
            <td className="text-right">{smd[p] || 0}</td>
            <td className="text-right">{seats[p]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
function TrendChart({ history, player }) {
  const W = 340, H = 196, pl = 26, pr = 54, pt = 10, pb = 22;
  const vals = history.flatMap((h) => PARTY_IDS.map((p) => h.shares[p]));
  const yMax = Math.ceil(Math.max(25, ...vals) / 5) * 5;
  const x = (w) => pl + (w / WEEKS) * (W - pl - pr);
  const y = (v) => pt + (1 - v / yMax) * (H - pt - pb);
  const last = history[history.length - 1];
  const labels = PARTY_IDS.map((p) => ({ p, y: y(last.shares[p]) })).sort((a, b) => a.y - b.y);
  for (let i = 1; i < labels.length; i++) if (labels[i].y - labels[i - 1].y < 9.5) labels[i].y = labels[i - 1].y + 9.5;
  const over = labels.length ? labels[labels.length - 1].y - (H - pb + 2) : 0;
  if (over > 0) labels.forEach((l) => { l.y -= over; });
  const ticks = [];
  for (let v = 0; v <= yMax; v += 5) ticks.push(v);
  const order = PARTY_IDS.filter((p) => p !== player).concat(player);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label="Weekly national polling trend">
      {ticks.map((v) => (
        <g key={v}>
          <line x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} stroke="#1E293B" strokeWidth="1" />
          <text x={pl - 5} y={y(v) + 3} textAnchor="end" fontSize="8" fill="#64748B" style={F_MONO}>{v}</text>
        </g>
      ))}
      <line x1={pl} x2={W - pr} y1={y(5)} y2={y(5)} stroke={GOLD} strokeWidth="1" strokeDasharray="4 3" opacity="0.8" />
      {DEBATE_WEEKS.map((w) => (
        <g key={w}>
          <line x1={x(w)} x2={x(w)} y1={pt} y2={H - pb} stroke="#334155" strokeWidth="1" strokeDasharray="2 3" />
          <text x={x(w)} y={H - pb + 11} textAnchor="middle" fontSize="7.5" fill="#94A3B8" style={F_MONO}>LRT</text>
        </g>
      ))}
      {[0, 12].map((w) => (
        <text key={w} x={x(w)} y={H - pb + 11} textAnchor="middle" fontSize="7.5" fill="#64748B" style={F_MONO}>{w === 0 ? 'W0' : 'W12'}</text>
      ))}
      {order.map((p) => {
        const pts = history.map((h) => `${x(h.week).toFixed(1)},${y(h.shares[p]).toFixed(1)}`).join(' ');
        const me = p === player;
        return (
          <g key={p}>
            <polyline points={pts} fill="none" stroke={PARTIES[p].color} strokeWidth={me ? 2.8 : 1.4} strokeOpacity={me ? 1 : 0.75} strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={x(last.week)} cy={y(last.shares[p])} r={me ? 3.2 : 2} fill={PARTIES[p].color} />
          </g>
        );
      })}
      {labels.map((l) => (
        <text key={l.p} x={x(last.week) + 6} y={l.y + 3} fontSize="8" fontWeight={l.p === player ? 700 : 500} fill={l.p === player ? '#F8FAFC' : '#CBD5E1'} style={F_MONO}>
          {PARTIES[l.p].short} {last.shares[l.p].toFixed(0)}
        </text>
      ))}
    </svg>
  );
}
function coalitionPaths(g, seats) {
  const me = g.player;
  const others = PARTY_IDS.filter((p) => p !== me && seats[p] > 0);
  const out = [];
  const rec = (start, chosen) => {
    if (chosen.length) {
      const members = [me, ...chosen];
      const total = sum(members.map((p) => seats[p]));
      const minimal = chosen.every((m) => total - seats[m] < MAJORITY);
      if (total >= MAJORITY && minimal) {
        let minC = 100;
        for (let i = 0; i < members.length; i++) for (let j = i + 1; j < members.length; j++) minC = Math.min(minC, compat(g, members[i], members[j]));
        out.push({ chosen: [...chosen], total, minC });
      }
    }
    if (chosen.length >= 3) return;
    for (let i = start; i < others.length; i++) { chosen.push(others[i]); rec(i + 1, chosen); chosen.pop(); }
  };
  rec(0, []);
  return out.sort((a, b) => b.minC - a.minC || a.chosen.length - b.chosen.length || b.total - a.total).slice(0, 4);
}

/* ============================================================
   Map
   ============================================================ */
const SEA = 'M-18,0 L9,0 L12,50 L12,68 L14.5,92 L4.2,144.5 L2,162 L-5,200 L-18,214 Z';
const LAGOON = 'M14.6,97.5 L23,114 L30,142 L27,145 L6.2,145 L8.4,128 L11.2,112 Z';
const OUTLINE_PATH = polyPath(OUTLINE);
function regionFill(g, s, mode) {
  if (mode === 'mine') return { fill: PARTIES[g.player].color, op: clamp(0.1 + s[g.player] / 38, 0.1, 0.95) };
  const ord = PARTY_IDS.slice().sort((a, b) => s[b] - s[a]);
  const margin = s[ord[0]] - s[ord[1]];
  return { fill: PARTIES[ord[0]].color, op: clamp(0.78 + margin / 40, 0.78, 1), tossup: margin < 3 };
}
function LithuaniaMap({ g, shares, mode, sel, onSelect }) {
  const key = (id) => (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(id); } };
  const label = (r) => {
    const [lx, ly] = r.label;
    const acts = g.weekActs[r.id] || 0;
    const nm = r.id === 'ABR' ? 'Abroad' : r.id === 'VLC' ? 'Vilniaus r.' : r.id === 'KNC' ? 'Kauno r.' : r.name;
    const txt = { fill: '#F8FAFC', stroke: '#020617', strokeWidth: 2.6, paintOrder: 'stroke', strokeLinejoin: 'round' };
    return (
      <g key={`l-${r.id}`} pointerEvents="none">
        <text x={lx} y={ly - 1} textAnchor="middle" fontSize="11" fontWeight="800" {...txt} style={F_MONO}>{r.seats}</text>
        <text x={lx} y={ly + 7.5} textAnchor="middle" fontSize="6.6" fontWeight="600" {...txt} style={{ fontFamily: F_BODY }}>{nm}</text>
        {acts > 0 && Array.from({ length: Math.min(acts, 6) }).map((_, i) => (
          <circle key={i} cx={lx - (Math.min(acts, 6) - 1) * 2.4 + i * 4.8} cy={ly + 12.5} r="1.6" fill={GOLD} stroke="#020617" strokeWidth="0.6" />
        ))}
      </g>
    );
  };
  const regionShape = (r) => {
    const f = regionFill(g, shares[r.id], mode);
    const common = {
      fill: f.fill, fillOpacity: f.op, stroke: '#0B1220', strokeWidth: 1.1, strokeLinejoin: 'round',
    };
    return (
      <g key={r.id} role="button" tabIndex={0} aria-label={`${r.en}, ${r.seats} seats`} onClick={() => onSelect(r.id)} onKeyDown={key(r.id)} style={{ cursor: 'pointer', outline: 'none' }}>
        {r.tile ? (
          <rect x={r.tile[0]} y={r.tile[1]} width={r.tile[2]} height={r.tile[3]} rx="5" {...common} stroke="#475569" />
        ) : (
          <path d={r.path} {...common} stroke={r.blob ? '#E2E8F0' : '#0B1220'} strokeOpacity={r.blob ? 0.7 : 1} />
        )}
        {r.id === 'KLP' && <path d={SPIT} {...common} />}
        {f.tossup && (r.tile
          ? <rect x={r.tile[0]} y={r.tile[1]} width={r.tile[2]} height={r.tile[3]} rx="5" fill="url(#sbl-hatch)" pointerEvents="none" />
          : <path d={r.path} fill="url(#sbl-hatch)" pointerEvents="none" />)}
      </g>
    );
  };
  const S = sel ? REG[sel] : null;
  return (
    <svg viewBox="-18 0 426 306" className="sbl-map w-full h-auto block select-none" role="group" aria-label="Map of Lithuania's electoral regions">
      <defs>
        <pattern id="sbl-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="#020617" strokeWidth="1.8" strokeOpacity="0.6" />
        </pattern>
      </defs>
      <path d={SEA} fill="#0C1A2E" />
      <path d={LAGOON} fill="#0C1A2E" />
      <text x="-7" y="96" fontSize="6.5" fill="#3B5A80" letterSpacing="1.5" transform="rotate(-90 -7 96)" textAnchor="middle" style={F_MONO}>BALTIJOS JŪRA</text>
      <text x="150" y="9" fontSize="6.5" fill="#475569" letterSpacing="2" textAnchor="middle" style={F_MONO}>LATVIJA</text>
      <text x="372" y="230" fontSize="6.5" fill="#475569" letterSpacing="2" textAnchor="middle" style={F_MONO}>BALTARUSIJA</text>
      <text x="128" y="284" fontSize="6.5" fill="#475569" letterSpacing="2" textAnchor="middle" style={F_MONO}>LENKIJA</text>
      <text x="74" y="198" fontSize="6.5" fill="#475569" letterSpacing="2" textAnchor="middle" style={F_MONO}>RUSIJA</text>
      {REGIONS.filter((r) => r.poly).map(regionShape)}
      <path d={OUTLINE_PATH} fill="none" stroke="#94A3B8" strokeOpacity="0.55" strokeWidth="1.2" strokeLinejoin="round" pointerEvents="none" />
      {REGIONS.filter((r) => r.blob || r.tile).map(regionShape)}
      {S && (S.tile
        ? <rect x={S.tile[0]} y={S.tile[1]} width={S.tile[2]} height={S.tile[3]} rx="5" fill="none" stroke={GOLD} strokeWidth="2.4" pointerEvents="none" />
        : <path d={S.path} fill="none" stroke={GOLD} strokeWidth="2.4" strokeLinejoin="round" pointerEvents="none" />)}
      {REGIONS.map(label)}
    </svg>
  );
}
function MapLegend({ g, shares, mode }) {
  if (mode === 'mine') {
    return (
      <div className="flex items-center gap-2 px-2 pb-1 pt-2 text-xs text-slate-400">
        <span>0%</span>
        <div className="flex-1 h-2 rounded-full" style={{ background: `linear-gradient(90deg, ${PARTIES[g.player].color}22, ${PARTIES[g.player].color})` }} />
        <span>35%+ for {PARTIES[g.player].short}</span>
      </div>
    );
  }
  const leaders = [...new Set(REGIONS.map((r) => leaderOf(shares[r.id])))];
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-2 pb-1 pt-2 text-xs text-slate-300">
      {leaders.map((p) => <span key={p} className="inline-flex items-center gap-1.5"><Swatch p={p} />{PARTIES[p].short}</span>)}
      <span className="text-slate-500">Hatched = toss-up under 3 pts · numbers = seats</span>
    </div>
  );
}
function RegionRow({ r, s, g, mySeats, onClick }) {
  const p = g.player;
  const ord = PARTY_IDS.slice().sort((a, b) => s[b] - s[a]);
  const lead = ord[0];
  const rank = ord.indexOf(p) + 1;
  const gap = lead === p ? s[p] - s[ord[1]] : s[p] - s[lead];
  const acts = g.weekActs[r.id] || 0;
  return (
    <button type="button" onClick={onClick} className="w-full flex items-center gap-3 rounded-xl bg-slate-900 border border-slate-800 px-3 py-3 text-left transition hover:border-slate-600 active:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
      <div className="w-11 h-11 rounded-lg grid place-items-center shrink-0 text-base font-bold text-slate-50" style={{ background: `${PARTIES[lead].color}33`, border: `1px solid ${PARTIES[lead].color}`, ...F_MONO }}>
        {r.seats}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-slate-100 truncate">{r.en}{acts > 0 && <span className="ml-2 text-xs font-normal text-amber-300">{acts}× this week</span>}</div>
        <div className="text-xs text-slate-400 truncate">
          {lead === p ? 'You lead' : `${PARTIES[lead].short} leads ${s[lead].toFixed(1)}%`} · you #{rank} at {s[p].toFixed(1)}%
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0" style={F_MONO}>
        <span className={`text-xs px-1.5 py-0.5 rounded-md ${gap >= 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>{fmtSigned(gap)}</span>
        <span className="text-xs text-slate-400">{mySeats}/{r.seats} won</span>
      </div>
      <ChevronRight size={18} className="text-slate-500 shrink-0" />
    </button>
  );
}
function MapTab({ g, shares, proj, sel, onSelect }) {
  const [mode, setMode] = useState('leader');
  const rows = REGIONS.slice().sort((a, b) => b.seats - a.seats);
  const p = g.player;
  const mySmd = proj.smdSeats[p] || 0;
  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 style={F_DISPLAY} className="text-3xl font-extrabold leading-none text-slate-50">Battleground</h2>
          <p className="text-sm text-slate-400 mt-1">Tap a region to campaign there.</p>
        </div>
        <Segmented value={mode} onChange={setMode} label="Map colouring" options={[['leader', 'Leader'], ['mine', 'Mine']]} />
      </div>
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-2">
        <LithuaniaMap g={g} shares={shares} mode={mode} sel={sel} onSelect={onSelect} />
        <MapLegend g={g} shares={shares} mode={mode} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          ['Projected', proj.seats[p], 'text-slate-50'],
          ['List seats', proj.pr[p] || 0, 'text-slate-200'],
          ['Constituency', mySmd, 'text-slate-200'],
        ].map(([l, v, c]) => (
          <div key={l} className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-2.5">
            <div className="text-xs text-slate-400 truncate">{l}</div>
            <div className={`text-2xl font-bold ${c}`} style={F_MONO}>{v}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Kicker>Regions by seats</Kicker>
        {rows.map((r) => (
          <RegionRow key={r.id} r={r} s={shares[r.id]} g={g} mySeats={proj.smd.filter((e) => e.rid === r.id && e.winner === p).length} onClick={() => onSelect(r.id)} />
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Region drawer
   ============================================================ */
function ActionCard({ type, g, r, rival, onAction }) {
  const A = ACTIONS[type];
  const p = g.player;
  const cost = actionCost(type, r, p);
  const disabled = g.ap < 1 || g.money < cost;
  const und = g.undecided[r.id];
  let hint;
  if (type === 'attack') {
    const bf = BACKFIRE[p] + (p === 'TS' && r.urban < 0.6 ? 0.1 : 0) + 0.06 * g.attacksThisWeek;
    hint = `vs ${PARTIES[rival].short} · ${Math.round(bf * 100)}% backfire`;
  } else if (type === 'door') {
    hint = `Ground game ${Math.round(g.gg[r.id][p])} → ${Math.round(Math.min(100, g.gg[r.id][p] + 14 * (1 - g.gg[r.id][p] / 110) * geoMult(p, r)))}`;
  } else {
    hint = `≈ +${((actionPreview(g, r.id, type) * 100) / (100 - und)).toFixed(1)} pts`;
  }
  const Icon = A.icon;
  return (
    <button
      type="button" disabled={disabled} onClick={() => onAction(r.id, type)}
      className={`flex flex-col items-start gap-1.5 rounded-xl bg-slate-800 border border-slate-700 p-3 text-left transition active:scale-95 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${type === 'attack' ? 'col-span-2' : ''}`}
      style={{ minHeight: 112 }}
    >
      <div className="flex items-center gap-2">
        <Icon size={18} className={type === 'attack' ? 'text-rose-300' : 'text-amber-300'} />
        <span className="font-semibold text-sm leading-tight text-slate-50">{A.label}</span>
      </div>
      <div className="text-xs text-slate-400 leading-snug">{A.desc}</div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 w-full text-xs" style={F_MONO}>
        <span className="text-slate-300">1 AP · {fmtEur(cost)}</span>
        <span className={type === 'attack' ? 'text-rose-300' : 'text-emerald-300'}>{hint}</span>
      </div>
    </button>
  );
}
function RegionDrawer({ g, rid, proj, onClose, onAction }) {
  const r = REG[rid];
  const p = g.player;
  const s = regionShares(g, r);
  const rival = leaderOf(s, p);
  const cons = proj.smd.filter((e) => e.rid === rid);
  const mine = cons.filter((e) => e.winner === p).length;
  const acts = g.weekActs[rid] || 0;
  const [showCons, setShowCons] = useState(false);
  return (
    <Sheet onClose={onClose} label={`${r.en} region`}>
      <div className="sticky top-0 z-10 bg-slate-900 pt-3 pb-3 border-b border-slate-800" style={GUTTER}>
        <div className="mx-auto w-10 h-1.5 rounded-full bg-slate-700 mb-3" />
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <Kicker>{r.name}</Kicker>
            <h3 style={F_DISPLAY} className="text-3xl font-extrabold leading-none mt-1 text-slate-50">{r.en}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close region" className="w-11 h-11 rounded-full bg-slate-800 grid place-items-center text-slate-200 shrink-0"><X size={20} /></button>
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-300" style={F_MONO}>
          <span className="inline-flex items-center gap-1"><Zap size={14} className="text-amber-300" />{g.ap} AP</span>
          <span className="inline-flex items-center gap-1"><Wallet size={14} className="text-amber-300" />{fmtEur(g.money)}</span>
          {acts > 0 && <span className="text-amber-300">{acts} action{acts > 1 ? 's' : ''} here this week</span>}
        </div>
      </div>
      <div className="flex flex-col gap-5 pt-4" style={GUTTER}>
        <div className="grid grid-cols-3 gap-2" style={F_MONO}>
          <div className="rounded-xl bg-slate-800 px-3 py-2">
            <div className="text-xs text-slate-400" style={{ fontFamily: F_BODY }}>Seats</div>
            <div className="text-xl font-bold text-slate-50">{r.seats}</div>
          </div>
          <div className="rounded-xl bg-slate-800 px-3 py-2">
            <div className="text-xs text-slate-400" style={{ fontFamily: F_BODY }}>{r.id === 'ABR' ? 'Registered' : 'Population'}</div>
            <div className="text-xl font-bold text-slate-50">{r.id === 'ABR' ? `${r.voters}k` : `${r.pop}k`}</div>
          </div>
          <div className="rounded-xl bg-slate-800 px-3 py-2">
            <div className="text-xs text-slate-400" style={{ fontFamily: F_BODY }}>Turnout</div>
            <div className="text-xl font-bold text-slate-50">~{Math.round(r.turnout * 100)}%</div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Urban {Math.round(r.urban * 100)}%</span><span>Rural {Math.round((1 - r.urban) * 100)}%</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden">
            <div style={{ width: `${r.urban * 100}%`, background: '#38BDF8' }} />
            <div style={{ width: `${(1 - r.urban) * 100}%`, background: '#65A30D' }} />
          </div>
        </div>
        <div>
          <Kicker className="mb-2">Top local issues</Kicker>
          <div className="flex flex-wrap gap-2">
            {r.issues.map((k, i) => {
              const I = ISSUES[k];
              const Icon = I.icon;
              return (
                <span key={k} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-sm text-slate-100">
                  <span className="text-xs text-slate-500" style={F_MONO}>{i + 1}</span><Icon size={15} className="text-amber-300" />{I.label}
                </span>
              );
            })}
          </div>
        </div>
        <div>
          <div className="flex items-end justify-between mb-2">
            <Kicker>Internal polling · decided voters</Kicker>
            <span className="text-xs text-slate-400">Undecided {g.undecided[rid].toFixed(0)}%</span>
          </div>
          <PollBars shares={s} highlight={p} />
        </div>
        <div>
          <Kicker className="mb-2">Campaign here</Kicker>
          <div className="grid grid-cols-2 gap-2">
            {['rally', 'digital', 'tv', 'door', 'attack'].map((t) => (
              <ActionCard key={t} type={t} g={g} r={r} rival={rival} onAction={onAction} />
            ))}
          </div>
          {acts >= 2 && <p className="text-xs text-amber-200 mt-2">Diminishing returns: each extra action here this week is weaker. Spread out or come back next week.</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-800 p-3">
            <div className="text-xs text-slate-400 mb-1.5">Your ground game</div>
            <Meter value={g.gg[rid][p]} color={PARTIES[p].color} />
            <div className="text-sm mt-1 text-slate-100" style={F_MONO}>{Math.round(g.gg[rid][p])}/100</div>
          </div>
          <div className="rounded-xl bg-slate-800 p-3">
            <div className="text-xs text-slate-400 mb-1.5">Turnout boost</div>
            <Meter value={g.boost[rid][p]} max={0.25} color="#34D399" />
            <div className="text-sm mt-1 text-slate-100" style={F_MONO}>+{Math.round(g.boost[rid][p] * 100)}%</div>
          </div>
        </div>
        <div>
          <button type="button" onClick={() => setShowCons(!showCons)} className="w-full flex items-center justify-between rounded-xl bg-slate-800 px-3 h-12 text-left">
            <span className="font-semibold text-sm text-slate-100">Constituencies · projected {mine}/{r.seats} for you</span>
            <ChevronDown size={18} className={`text-slate-400 transition ${showCons ? 'rotate-180' : ''}`} />
          </button>
          {showCons && (
            <ul className="mt-2 flex flex-col gap-1.5">
              {cons.map((e) => (
                <li key={e.cid} className="flex items-center gap-2 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm">
                  <Swatch p={e.winner} size={12} />
                  <span className="flex-1 min-w-0 truncate text-slate-100">{e.name}</span>
                  <span className="text-xs text-slate-400 shrink-0" style={F_MONO}>
                    {e.round === 1 ? `${PARTIES[e.winner].short} R1` : `${PARTIES[e.runoff.a].short} v ${PARTIES[e.runoff.b].short} → ${PARTIES[e.winner].short} +${e.margin.toFixed(0)}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Sheet>
  );
}

/* ============================================================
   Header & navigation
   ============================================================ */
function WeekTrack({ week }) {
  return (
    <div className="grid gap-1 mt-2.5" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }} aria-label={`Week ${week} of 12`}>
      {Array.from({ length: WEEKS }).map((_, i) => {
        const w = i + 1;
        const debate = DEBATE_WEEKS.includes(w);
        return (
          <div key={w} className="relative h-1.5 rounded-full" style={{ background: w < week ? '#64748B' : w === week ? GOLD : '#1E293B' }}>
            {debate && <span className="absolute left-1/2 -translate-x-1/2 rounded-full" style={{ top: -3, width: 4, height: 4, background: w <= week ? '#F8FAFC' : '#94A3B8' }} />}
          </div>
        );
      })}
    </div>
  );
}
function Header({ g, nat, onHelp }) {
  const P = PARTIES[g.player];
  const share = nat[g.player];
  const last = g.history[g.history.length - 1].shares[g.player];
  const mom = g.momentum[g.player];
  const cell = 'rounded-lg bg-slate-900 border border-slate-800 px-2 py-1.5 min-w-0';
  return (
    <header className="sticky z-30 bg-slate-950 border-b border-slate-800" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
      <div className="max-w-lg mx-auto" style={GUTTER}>
        <div className="flex items-center gap-3 pt-3">
          <div className="w-1.5 self-stretch rounded-full" style={{ background: P.color }} />
          <div className="min-w-0 flex-1">
            <Kicker className="truncate">{P.short} · {(WEEKS - g.week + 1) * 7} days left</Kicker>
            <div style={{ ...F_DISPLAY, fontWeight: 800 }} className="text-2xl leading-none text-slate-50 whitespace-nowrap">Week {g.week}<span className="text-slate-500">/12</span></div>
          </div>
          <div className="h-11 px-3 rounded-full bg-slate-900 border border-slate-700 flex items-center gap-1.5 shrink-0" aria-label={`${g.pc} political capital`}>
            <Landmark size={16} className="text-amber-300" />
            <span className="text-sm font-semibold text-slate-50" style={F_MONO}>{g.pc}</span>
            <span className="text-xs text-slate-400">PC</span>
          </div>
          <button type="button" onClick={onHelp} aria-label="How to play" className="w-11 h-11 rounded-full bg-slate-900 border border-slate-700 grid place-items-center text-slate-300 shrink-0">
            <HelpCircle size={20} />
          </button>
        </div>
        <WeekTrack week={g.week} />
        <div className="grid grid-cols-4 gap-1.5 py-2.5">
          <div className={cell}>
            <div className="text-xs text-slate-400">Action pts</div>
            <div className="flex gap-0.5 mt-1.5" aria-label={`${g.ap} of ${g.apMax} action points`}>
              {Array.from({ length: g.apMax }).map((_, i) => (
                <span key={i} className="h-2.5 flex-1 rounded-sm" style={{ background: i < g.ap ? GOLD : '#334155' }} />
              ))}
            </div>
          </div>
          <div className={cell}>
            <div className="text-xs text-slate-400">Budget</div>
            <div className="text-sm font-semibold text-slate-50 truncate" style={F_MONO}>{fmtEur(g.money)}</div>
          </div>
          <div className={cell}>
            <div className="text-xs text-slate-400">Poll</div>
            <div className="text-sm font-semibold text-slate-50 truncate" style={F_MONO}>
              {share.toFixed(1)}<span className="text-xs ml-1"><Delta v={share - last} /></span>
            </div>
          </div>
          <div className={cell}>
            <div className="text-xs text-slate-400">Momentum</div>
            <div className={`text-sm font-semibold truncate ${mom >= 0.05 ? 'text-emerald-400' : mom <= -0.05 ? 'text-rose-400' : 'text-slate-300'}`} style={F_MONO}>{fmtSigned(mom)}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
function BottomNav({ tab, setTab, onEnd, g }) {
  const item = (id, Icon, label) => (
    <button
      key={id} type="button" onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}
      className={`flex flex-col items-center justify-center gap-1 h-16 rounded-xl transition ${tab === id ? 'text-amber-300' : 'text-slate-400 hover:text-slate-200'}`}
    >
      <Icon size={22} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
  const last = g.week >= WEEKS;
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-slate-950 border-t border-slate-800" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="max-w-lg mx-auto grid grid-cols-5 items-center" style={GUTTER}>
        {item('map', MapIcon, 'Map')}
        {item('polls', BarChart3, 'Polls')}
        <div className="flex justify-center">
          <button
            type="button" onClick={onEnd}
            className="-mt-8 rounded-full bg-amber-400 text-slate-950 flex flex-col items-center justify-center shadow-lg shadow-amber-500/20 border-4 border-slate-950 active:scale-95 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            style={{ width: 76, height: 76 }}
          >
            {last ? <Vote size={22} /> : <ArrowRight size={22} />}
            <span className="text-xs font-bold leading-none mt-1">{last ? 'Vote!' : 'End week'}</span>
          </button>
        </div>
        {item('platform', Landmark, 'Platform')}
        {item('news', Newspaper, 'News')}
      </div>
    </nav>
  );
}

/* ============================================================
   Polls tab
   ============================================================ */
function PollsTab({ g, nat, proj }) {
  const p = g.player;
  const last = g.history[g.history.length - 1];
  const deltas = Object.fromEntries(ALL_IDS.map((q) => [q, nat[q] - last.shares[q]]));
  const paths = coalitionPaths(g, proj.seats);
  const near = PARTY_IDS.filter((q) => nat[q] > 3 && nat[q] < 7);
  return (
    <div className="flex flex-col gap-4 pt-4">
      <h2 style={F_DISPLAY} className="text-3xl font-extrabold leading-none text-slate-50">Polls & projection</h2>
      <Section title="Seat projection" kicker="If the election were held today">
        <Hemicycle seats={proj.seats} highlight={p} label={`${PARTIES[p].short} seats`} />
        <div className="mt-3"><SeatTable seats={proj.seats} pr={proj.pr} smd={proj.smdSeats} highlight={p} /></div>
        <p className="text-xs text-slate-500 mt-2">Dashed line marks the 71-seat majority. PR = 70 list seats split by Hare–Niemeyer among parties over 5%. SMD = 71 single-mandate seats after runoffs.</p>
      </Section>
      <Section title="National tracking poll" kicker="Live · change since last week">
        <PollBars shares={nat} highlight={p} threshold deltas={deltas} />
        {near.length > 0 && (
          <p className="text-xs text-amber-200 mt-3">Threshold watch: {near.map((q) => `${PARTIES[q].short} ${nat[q].toFixed(1)}%`).join(' · ')}</p>
        )}
      </Section>
      <Section title="Campaign trend" kicker="Published weekly polls">
        <TrendChart history={g.history} player={p} />
      </Section>
      <Section title="Paths to 71" kicker="Smallest winning coalitions on today’s projection">
        {proj.seats[p] >= MAJORITY ? (
          <p className="text-sm text-emerald-300">You are on course for a single-party majority.</p>
        ) : paths.length === 0 ? (
          <p className="text-sm text-slate-400">No coalition of up to four parties including you reaches 71 yet. Win more seats or move your platform toward potential partners.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {paths.map((c) => (
              <li key={c.chosen.join('-')} className="flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2.5">
                <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                  {[p, ...c.chosen].map((q) => (
                    <span key={q} className="inline-flex items-center gap-1 rounded-md bg-slate-950 px-1.5 py-0.5 text-xs text-slate-100"><Swatch p={q} />{PARTIES[q].short} {proj.seats[q]}</span>
                  ))}
                </div>
                <div className="text-right shrink-0" style={F_MONO}>
                  <div className="text-sm font-bold text-slate-50">{c.total}</div>
                  <div className={`text-xs ${c.minC >= 50 ? 'text-emerald-300' : c.minC >= 30 ? 'text-amber-300' : 'text-rose-300'}`}>fit {c.minC}%</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

/* ============================================================
   Platform tab
   ============================================================ */
function PlatformTab({ g, act }) {
  const P = PARTIES[g.player];
  const orig = P.pos;
  const [draft, setDraft] = useState(g.stance);
  const stanceKey = JSON.stringify(g.stance);
  useEffect(() => { setDraft(JSON.parse(stanceKey)); }, [stanceKey]);
  const changed = AXIS_IDS.some((a) => draft[a] !== g.stance[a]);
  const cost = platformCost(g, draft);
  const preview = useMemo(() => {
    if (!changed) return null;
    const p = g.player;
    const now = nationalShares(g)[p];
    const next = nationalShares(g, draft)[p];
    const regs = REGIONS.map((r) => ({ r, d: regionShares(g, r, draft)[p] - regionShares(g, r)[p] })).sort((a, b) => b.d - a.d);
    const gd = { ...g, stance: draft };
    const seatsNow = simulateElection(g, false).seats[p];
    const seatsNext = simulateElection(gd, false).seats[p];
    const comp = PARTY_IDS.filter((q) => q !== p).map((q) => ({ q, now: compat(g, p, q), next: compat(gd, p, q) })).filter((x) => x.now !== x.next).sort((a, b) => (b.next - b.now) - (a.next - a.now));
    return { now, next, regs, seatsNow, seatsNext, comp };
  }, [g, draft, changed]);
  const base = alienation(draft, orig);
  const fundEst = { gala: galaAmount(g), small: smallAmount(g), lobby: lobbyAmount(g) };
  return (
    <div className="flex flex-col gap-4 pt-4">
      <div>
        <h2 style={F_DISPLAY} className="text-3xl font-extrabold leading-none text-slate-50">Platform & HQ</h2>
        <p className="text-sm text-slate-400 mt-1">Shift your stances to court regions and partners. Drift too far and your base stays home.</p>
      </div>
      <Section title="Policy platform" kicker="Pick a position, then announce" right={<span className="text-xs text-slate-400 inline-flex items-center gap-1 whitespace-nowrap"><Home size={12} />Founding</span>}>
        <div className="flex flex-col gap-3">
          {AXES.map((ax) => {
            const Icon = ax.icon;
            return (
              <div key={ax.id} className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0"><Icon size={16} className="text-slate-300 shrink-0" /><span className="font-semibold text-sm text-slate-100 truncate">{ax.label}</span></div>
                  <span className={`text-sm shrink-0 ${draft[ax.id] !== g.stance[ax.id] ? 'text-amber-300' : 'text-slate-200'}`} style={F_MONO}>{ax.steps[stepIndex(draft[ax.id])]}</span>
                </div>
                <div className="grid grid-cols-7 gap-1 mt-3" role="radiogroup" aria-label={ax.label}>
                  {ax.steps.map((st, i) => {
                    const v = -90 + i * 30;
                    const isDraft = draft[ax.id] === v;
                    const isNow = g.stance[ax.id] === v;
                    return (
                      <button
                        key={st} type="button" role="radio" aria-checked={isDraft} aria-label={st}
                        onClick={() => setDraft({ ...draft, [ax.id]: v })}
                        className="h-11 rounded-md relative grid place-items-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                        style={{ background: isDraft ? GOLD : isNow ? '#475569' : '#1E293B', border: isNow && !isDraft ? `1px solid ${GOLD}` : '1px solid transparent' }}
                      >
                        {orig[ax.id] === v && <Home size={13} className={isDraft ? 'text-slate-950' : 'text-slate-300'} />}
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-7 gap-1 mt-1.5" aria-hidden="true">
                  {ax.steps.map((st, i) => {
                    const v = -90 + i * 30;
                    const here = PARTY_IDS.filter((q) => q !== g.player && PARTIES[q].pos[ax.id] === v);
                    return (
                      <div key={st} className="flex flex-wrap justify-center gap-0.5 min-h-2">
                        {here.map((q) => <span key={q} className="rounded-full" style={{ width: 6, height: 6, background: PARTIES[q].color }} title={PARTIES[q].short} />)}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1"><span>{ax.left}</span><span>{ax.right}</span></div>
              </div>
            );
          })}
          <p className="text-xs text-slate-500">Coloured dots show where rival parties stand. Distance to them shapes coalition talks.</p>
        </div>
        <div className="mt-4 rounded-xl bg-slate-950 border border-slate-800 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">Core-voter enthusiasm</span>
            <span className={base < 0.97 ? 'text-amber-300' : 'text-emerald-300'} style={F_MONO}>{Math.round(base * 100)}%</span>
          </div>
          <div className="mt-2"><Meter value={base * 100} color={base < 0.9 ? '#F87171' : base < 0.97 ? GOLD : '#34D399'} /></div>
          {preview ? (
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">National poll</span><span style={F_MONO}>{preview.now.toFixed(1)} → {preview.next.toFixed(1)} <Delta v={preview.next - preview.now} /></span></div>
              <div className="flex justify-between"><span className="text-slate-400">Projected seats</span><span style={F_MONO}>{preview.seatsNow} → {preview.seatsNext} <Delta v={preview.seatsNext - preview.seatsNow} d={0} /></span></div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {preview.regs.slice(0, 3).filter((x) => x.d > 0.05).map((x) => <span key={x.r.id} className="text-xs rounded-md bg-emerald-500/15 text-emerald-300 px-2 py-1">{x.r.en} {fmtSigned(x.d)}</span>)}
                {preview.regs.slice(-3).filter((x) => x.d < -0.05).map((x) => <span key={x.r.id} className="text-xs rounded-md bg-rose-500/15 text-rose-300 px-2 py-1">{x.r.en} {fmtSigned(x.d)}</span>)}
              </div>
              {preview.comp.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {preview.comp.slice(0, 4).map((x) => (
                    <span key={x.q} className="text-xs rounded-md bg-slate-800 px-2 py-1 text-slate-200 inline-flex items-center gap-1"><Swatch p={x.q} size={8} />{PARTIES[x.q].short} fit {x.now}→{x.next}</span>
                  ))}
                </div>
              )}
              {(cost.mom > 0 || cost.pc > 0) && (
                <p className="text-xs text-amber-200">
                  {cost.uturns.length ? 'U-turn! ' : ''}Announcing costs momentum {fmtSigned(-cost.mom)}{cost.pc ? ` and ${cost.pc} PC` : ''}{cost.steps > 1 ? ' (big shifts look opportunistic)' : ''}.
                </p>
              )}
              <div className="flex gap-2 mt-1">
                <Btn kind="ghost" className="h-12 px-4" onClick={() => setDraft(g.stance)}><RotateCcw size={16} />Reset</Btn>
                <Btn className="h-12 flex-1" disabled={g.ap < 1} onClick={() => act((gg) => announcePlatform(gg, draft))}><Megaphone size={18} />Announce · 1 AP</Btn>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 mt-2">Tap a different position on any axis to preview the impact before announcing.</p>
          )}
        </div>
      </Section>
      <Section title="Fundraising" kicker={`Weekly donations last came to ${fmtEur(g.lastIncome || 0)}`}>
        <div className="flex flex-col gap-2">
          {NATIONAL_ACTIONS.filter((a) => a.group === 'fund').map((a) => (
            <NationalRow key={a.id} a={a} g={g} est={`+${fmtEur(fundEst[a.id])}`} onClick={() => act((gg) => doNational(gg, a.id))} />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <ShieldAlert size={14} className={g.scandal > 20 ? 'text-rose-400' : 'text-slate-500'} />
          Scandal risk {Math.round(g.scandal)}%{g.player === 'NA' ? ' · builds twice as fast for NA' : ''}
        </div>
      </Section>
      <Section title="National campaign" kicker="Nationwide moves">
        <div className="flex flex-col gap-2">
          {NATIONAL_ACTIONS.filter((a) => a.group === 'nat').map((a) => (
            <NationalRow key={a.id} a={a} g={g} est={a.id === 'backchannel' ? '+PC' : a.id === 'presser' ? '+Mom' : 'All regions'} onClick={() => act((gg) => doNational(gg, a.id))} />
          ))}
        </div>
      </Section>
    </div>
  );
}
function NationalRow({ a, g, est, onClick }) {
  const Icon = a.icon;
  const disabled = g.ap < a.ap || (a.pc && g.pc < a.pc) || (a.cost && g.money < a.cost);
  const n = g.natActs[a.id] || 0;
  return (
    <button
      type="button" onClick={onClick} disabled={disabled}
      className="w-full flex items-center gap-3 rounded-xl bg-slate-800 border border-slate-700 px-3 py-3 text-left transition active:scale-95 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
    >
      <div className="w-10 h-10 rounded-lg bg-slate-950 grid place-items-center shrink-0"><Icon size={18} className="text-amber-300" /></div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-sm text-slate-50">{a.label}{n > 0 && <span className="ml-2 text-xs font-normal text-slate-400">{n}× this week</span>}</div>
        <div className="text-xs text-slate-400 leading-snug">{a.desc}</div>
      </div>
      <div className="text-right shrink-0 text-xs" style={F_MONO}>
        <div className="text-slate-200">{a.ap ? `${a.ap} AP` : `${a.pc} PC`}{a.cost ? ` · ${fmtEur(a.cost)}` : ''}</div>
        <div className="text-emerald-300">{est}</div>
      </div>
    </button>
  );
}

/* ============================================================
   News tab
   ============================================================ */
function NewsTab({ g }) {
  const iconFor = (n) => (n.kind === 'event' ? Newspaper : n.kind === 'debate' ? Mic : n.kind === 'rival' ? Target : n.kind === 'you' ? Flag : Info);
  let lastWeek = null;
  return (
    <div className="flex flex-col gap-3 pt-4">
      <div>
        <h2 style={F_DISPLAY} className="text-3xl font-extrabold leading-none text-slate-50">Newswire</h2>
        <p className="text-sm text-slate-400 mt-1">Headlines, rival campaign moves and your decisions.</p>
      </div>
      {g.news.map((n) => {
        const Icon = iconFor(n);
        const header = n.week !== lastWeek ? <Kicker key={`w${n.week}-${n.id}`} className="pt-2">Week {n.week}</Kicker> : null;
        lastWeek = n.week;
        return (
          <React.Fragment key={n.id}>
            {header}
            <article className="flex gap-3 rounded-xl bg-slate-900 border border-slate-800 p-3">
              <div className="w-9 h-9 rounded-lg grid place-items-center shrink-0" style={{ background: n.p ? `${PARTIES[n.p].color}33` : '#1E293B' }}>
                <Icon size={17} className="text-slate-200" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-slate-50">{n.title}</div>
                <div className="text-sm text-slate-400 leading-snug">{n.text}</div>
              </div>
            </article>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ============================================================
   Modals: briefing, weekly report, events, debates
   ============================================================ */
function BriefModal({ g, nat, proj, onClose }) {
  const P = PARTIES[g.player];
  const p = g.player;
  return (
    <Sheet label="Campaign briefing">
      <div style={GUTTER} className="pt-6 flex flex-col gap-4">
        <Tricolor className="w-12" />
        <Kicker>Campaign HQ · Day one</Kicker>
        <h2 style={F_DISPLAY} className="text-4xl font-extrabold leading-none text-slate-50" >Twelve weeks to win the Seimas</h2>
        <p className="text-slate-300 leading-relaxed">
          You lead <span className="font-semibold text-slate-50">{P.full}</span>. Polls put you at <span style={F_MONO} className="text-slate-50">{nat[p].toFixed(1)}%</span>, worth a projected <span style={F_MONO} className="text-slate-50">{proj.seats[p]}</span> seats.
        </p>
        <div className="grid grid-cols-1 gap-2">
          <div className="rounded-xl bg-slate-800 p-3"><Kicker>Strongholds</Kicker><div className="text-sm text-slate-100 mt-1">{P.strongholds}</div></div>
          <div className="rounded-xl bg-slate-800 p-3"><Kicker>Passive · {P.trait}</Kicker><div className="text-sm text-slate-100 mt-1">{P.traitDesc}</div></div>
        </div>
        <ol className="flex flex-col gap-2 text-sm text-slate-300">
          <li className="flex gap-3"><span className="text-amber-300 font-bold" style={F_MONO}>1</span><span>Each week you get 6 action points and fresh donations. Tap regions on the map to rally, advertise, canvass or attack.</span></li>
          <li className="flex gap-3"><span className="text-amber-300 font-bold" style={F_MONO}>2</span><span>LRT hosts televised debates in weeks 4, 8 and 11. Breaking news lands every week or two.</span></li>
          <li className="flex gap-3"><span className="text-amber-300 font-bold" style={F_MONO}>3</span><span>You need 71 of 141 seats to govern. Almost nobody wins alone, so your platform and political capital decide who will sit with you.</span></li>
        </ol>
        <Btn className="h-14 text-lg mt-1" onClick={onClose}>Open the war room <ArrowRight size={20} /></Btn>
      </div>
    </Sheet>
  );
}
function ReportModal({ g, item, onClose }) {
  const p = g.player;
  const H = g.history;
  const cur = H[H.length - 1].shares;
  const prev = H[H.length - 2] ? H[H.length - 2].shares : cur;
  const d = cur[p] - prev[p];
  const movers = PARTY_IDS.map((q) => ({ q, d: cur[q] - prev[q] })).sort((a, b) => Math.abs(b.d) - Math.abs(a.d)).slice(0, 5);
  const upcoming = g.queue.slice(1).map((x) => x.type);
  const attacks = item.moves.flatMap((m) => m.list.filter((x) => x.type === 'attack' && x.target === p).map((x) => ({ p: m.p, rid: x.rid })));
  return (
    <Sheet label={`Week ${item.week} report`}>
      <div style={GUTTER} className="pt-6 flex flex-col gap-4">
        <Kicker>Week {item.week} wrap-up · new poll published</Kicker>
        <div className="flex items-end gap-4">
          <div style={{ ...F_MONO, fontSize: 56, lineHeight: 0.9 }} className="font-bold text-slate-50">{cur[p].toFixed(1)}<span className="text-2xl text-slate-500">%</span></div>
          <div className="pb-1 text-lg font-semibold" style={F_MONO}><Delta v={d} /> <span className="text-sm text-slate-400 font-normal" style={{ fontFamily: F_BODY }}>vs last week</span></div>
        </div>
        <div className="rounded-xl bg-slate-800 p-3">
          <Kicker className="mb-2">Biggest movers</Kicker>
          <div className="flex flex-col gap-1.5">
            {movers.map((m) => (
              <div key={m.q} className="flex items-center gap-2 text-sm">
                <Swatch p={m.q} /><span className={`flex-1 ${m.q === p ? 'font-bold text-slate-50' : 'text-slate-200'}`}>{PARTIES[m.q].short}</span>
                <span style={F_MONO} className="text-slate-300">{cur[m.q].toFixed(1)}%</span>
                <span style={F_MONO} className="w-12 text-right"><Delta v={m.d} /></span>
              </div>
            ))}
          </div>
        </div>
        {attacks.length > 0 && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-sm text-rose-100 flex gap-2">
            <Swords size={18} className="shrink-0 text-rose-300" />
            <span>Under fire: {attacks.map((a) => `${PARTIES[a.p].short} in ${REG[a.rid].name}`).join(', ')}. Ground game softens these hits.</span>
          </div>
        )}
        <div className="rounded-xl bg-slate-800 p-3">
          <Kicker className="mb-2">Rival campaigns</Kicker>
          <ul className="flex flex-col gap-1.5 text-sm text-slate-300">
            {item.moves.map((m) => (
              <li key={m.p} className="flex gap-2"><Swatch p={m.p} size={9} /><span className="-mt-1"><span className="font-semibold text-slate-100">{PARTIES[m.p].short}:</span> {describeMoves(m)}</span></li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-slate-800 p-3"><Kicker>Donations in</Kicker><div className="text-lg font-bold text-emerald-300" style={F_MONO}>+{fmtEur(g.lastIncome)}</div></div>
          <div className="rounded-xl bg-slate-800 p-3"><Kicker>Up next</Kicker><div className="text-sm font-semibold text-slate-100 mt-1">{upcoming.includes('debate') ? 'LRT TV debate' : upcoming.includes('event') ? 'Breaking news' : 'A quiet week'}</div></div>
        </div>
        <Btn className="h-14 text-lg" onClick={onClose}>Start week {g.week} <ArrowRight size={20} /></Btn>
      </div>
    </Sheet>
  );
}
function OutcomeGrid({ before, after }) {
  const cells = [
    ['National poll', <Delta key="a" v={after.share - before.share} />],
    ['Budget', after.money === before.money ? <span key="b" className="text-slate-500">±0</span> : <span key="b" className={after.money > before.money ? 'text-emerald-400' : 'text-rose-400'}>{after.money > before.money ? '+' : '−'}{fmtEur(Math.abs(after.money - before.money))}</span>],
    ['Momentum', <Delta key="c" v={after.mom - before.mom} />],
    ['Political capital', <Delta key="d" v={after.pc - before.pc} d={0} />],
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {cells.map(([l, v]) => (
        <div key={l} className="rounded-xl bg-slate-800 p-3">
          <div className="text-xs text-slate-400">{l}</div>
          <div className="text-lg font-bold" style={F_MONO}>{v}</div>
        </div>
      ))}
    </div>
  );
}
function EventModal({ g, item, onChoose, onClose }) {
  const ev = EVENT_MAP[item.id];
  const done = item.done;
  const Icon = ev.icon;
  return (
    <Sheet label="Breaking news">
      <div style={GUTTER} className="pt-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-white text-xs font-bold tracking-widest ${ev.scandal ? 'bg-rose-700' : 'bg-rose-600'} ${done ? '' : 'sbl-blink'}`} style={F_MONO}>{ev.scandal ? 'SCANDAL' : 'BREAKING'}</span>
          <Kicker>{ev.cat} · Week {g.week}</Kicker>
        </div>
        <div className="flex gap-3 items-start">
          <div className="w-12 h-12 rounded-xl bg-slate-800 grid place-items-center shrink-0"><Icon size={24} className="text-amber-300" /></div>
          <h2 style={{ ...F_DISPLAY, textWrap: 'balance' }} className="text-3xl font-extrabold leading-none text-slate-50">{evTitle(ev, g)}</h2>
        </div>
        <p className="text-slate-300 leading-relaxed">{ev.body}</p>
        {!done ? (
          <div className="flex flex-col gap-2">
            <Kicker>How do you respond?</Kicker>
            {ev.choices.map((ch, i) => {
              const bonus = ch.tag && TAG_BONUS[ch.tag] && TAG_BONUS[ch.tag][g.player] > 1;
              const chips = ch.risk ? [{ t: '50/50 gamble', good: false }] : fxChips(ch.fx);
              return (
                <button key={ch.label} type="button" onClick={() => onChoose(i)} className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-left transition active:scale-95 hover:border-amber-400/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-slate-50 flex-1">{ch.label}</span>
                    {bonus && <span className="text-xs rounded-md bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 shrink-0">Your brand</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {ch.tag && <span className="text-xs rounded-md bg-slate-950 text-slate-300 px-1.5 py-0.5">{TAG_NAMES[ch.tag]}</span>}
                    {chips.map((c) => <span key={c.t} className={`text-xs rounded-md px-1.5 py-0.5 ${c.good ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>{c.t}</span>)}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-3 sbl-fade">
            <div className="rounded-xl bg-slate-800 p-3 text-sm text-slate-200">
              <span className="text-slate-400">You chose:</span> <span className="font-semibold text-slate-50">{ev.choices[done.ci].label}</span>
              {done.note && <div className="mt-1 text-amber-200">{done.note}</div>}
            </div>
            <OutcomeGrid before={done.before} after={done.after} />
            <Btn className="h-14 text-lg" onClick={onClose}>Back to the campaign <ArrowRight size={20} /></Btn>
          </div>
        )}
      </div>
    </Sheet>
  );
}
function reactionLabel(s) {
  if (s >= 7.6) return ['The studio erupts', 'text-emerald-300'];
  if (s >= 6.6) return ['Strong answer', 'text-emerald-300'];
  if (s >= 5.6) return ['Solid', 'text-slate-200'];
  if (s >= 4.6) return ['Flat', 'text-amber-300'];
  return ['Disaster', 'text-rose-300'];
}
function Worm({ pts }) {
  const W = 320, H = 70;
  const n = Math.max(pts.length - 1, 1);
  const x = (i) => (i / Math.max(n, 18)) * W;
  const y = (v) => H - (v / 10) * H;
  const line = pts.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const lastV = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block rounded-lg bg-slate-950" role="img" aria-label="Audience reaction worm">
      <rect x="0" y="0" width={W} height={H / 2} fill="#10B981" fillOpacity="0.06" />
      <rect x="0" y={H / 2} width={W} height={H / 2} fill="#F43F5E" fillOpacity="0.06" />
      <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="#334155" strokeDasharray="3 3" />
      <polyline points={line} fill="none" stroke={GOLD} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(pts.length - 1)} cy={y(lastV)} r="3.5" fill={GOLD} />
    </svg>
  );
}
function DebateModal({ g, item, onFinish, onClose }) {
  const D = DEBATES[item.id];
  const [qi, setQi] = useState(0);
  const [picks, setPicks] = useState([]);
  const [reveal, setReveal] = useState(null);
  const [worm, setWorm] = useState([5, 5.1, 4.9, 5]);
  const res = item.done;
  const Q = D.questions[qi];
  const choose = (ai) => {
    if (reveal) return;
    const sc = scoreAnswer(g, Q.answers[ai]);
    const pts = [];
    let v = worm[worm.length - 1];
    for (let k = 0; k < 6; k++) { v = clamp(v + (sc.score - v) * 0.4 + (Math.random() - 0.5) * 0.7, 0.2, 9.8); pts.push(v); }
    setWorm([...worm, ...pts]);
    setReveal({ ai, ...sc });
    setPicks([...picks, { qi, ai, score: sc.score }]);
  };
  const next = () => {
    if (qi < D.questions.length - 1) { setQi(qi + 1); setReveal(null); }
    else onFinish(picks);
  };
  return (
    <Sheet label="LRT debate">
      <div style={GUTTER} className="pt-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded bg-slate-100 text-slate-950 text-xs font-extrabold tracking-widest" style={F_MONO}>LRT</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-300" style={F_MONO}><span className="w-2 h-2 rounded-full bg-rose-500 sbl-blink" />LIVE</span>
          <Kicker className="ml-auto">{D.subtitle}</Kicker>
        </div>
        <h2 style={F_DISPLAY} className="text-3xl font-extrabold leading-none text-slate-50">{D.title}</h2>
        {!res ? (
          <>
            <div className="flex gap-1.5" aria-label={`Question ${qi + 1} of ${D.questions.length}`}>
              {D.questions.map((_, i) => <span key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i < qi || (i === qi && reveal) ? GOLD : i === qi ? '#94A3B8' : '#334155' }} />)}
            </div>
            <div className="rounded-xl bg-slate-800 p-4">
              <Kicker className="mb-1.5">Moderator · question {qi + 1}</Kicker>
              <p className="text-lg text-slate-50 leading-snug" style={{ textWrap: 'balance' }}>{Q.q}</p>
            </div>
            <Worm pts={worm} />
            <div className="flex flex-col gap-2">
              {Q.answers.map((a, i) => {
                const chosen = reveal && reveal.ai === i;
                return (
                  <button
                    key={a.t} type="button" disabled={!!reveal && !chosen} onClick={() => choose(i)}
                    className={`w-full rounded-xl border p-3 text-left transition ${chosen ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-slate-800 border-slate-700 text-slate-50 hover:border-amber-400/60 active:scale-95'} disabled:opacity-35`}
                  >
                    <div className="font-semibold leading-snug">{a.t}</div>
                    <div className={`text-xs mt-1 ${chosen ? 'text-slate-800' : 'text-slate-400'}`}>{TAG_NAMES[a.style] || (a.style === 'technocrat' ? 'Technocratic' : a.style === 'attack' ? 'Attack' : a.style)}{a.pc ? ' · experts will object (−1 PC)' : ''}</div>
                  </button>
                );
              })}
            </div>
            {reveal && (
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 flex items-center gap-3 sbl-pop">
                <div style={{ ...F_MONO, fontSize: 34 }} className="font-bold text-slate-50 leading-none">{reveal.score.toFixed(1)}</div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold ${reactionLabel(reveal.score)[1]}`}>{reactionLabel(reveal.score)[0]}</div>
                  {reveal.note && <div className={`text-xs ${reveal.note === 'On-message' ? 'text-emerald-300' : 'text-rose-300'}`}>{reveal.note}</div>}
                </div>
                <Btn className="h-12 px-4" onClick={next}>{qi < D.questions.length - 1 ? 'Next' : 'Verdict'} <ArrowRight size={18} /></Btn>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-3 sbl-fade">
            <div className="rounded-xl bg-slate-800 p-4">
              <Kicker className="mb-2">Snap poll · who won the debate?</Kicker>
              <div className="flex flex-col gap-2">
                {res.poll.map((x) => (
                  <div key={x.p} className="grid items-center gap-2" style={{ gridTemplateColumns: '72px 1fr 44px' }}>
                    <span className={`text-sm truncate ${x.p === g.player ? 'font-bold text-slate-50' : 'text-slate-300'}`}>{PARTIES[x.p].short}</span>
                    <div className="h-5 rounded bg-slate-950 overflow-hidden"><div className="h-full" style={{ width: `${x.pct}%`, background: PARTIES[x.p].color }} /></div>
                    <span className="text-sm text-right" style={F_MONO}>{x.pct.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-slate-800 p-3"><div className="text-xs text-slate-400">Your score</div><div className="text-lg font-bold text-slate-50" style={F_MONO}>{res.avg.toFixed(1)}</div></div>
              <div className="rounded-xl bg-slate-800 p-3"><div className="text-xs text-slate-400">Finish</div><div className="text-lg font-bold text-slate-50" style={F_MONO}>#{res.rank}</div></div>
              <div className="rounded-xl bg-slate-800 p-3"><div className="text-xs text-slate-400">Poll</div><div className="text-lg font-bold" style={F_MONO}><Delta v={res.delta} /></div></div>
            </div>
            <p className="text-sm text-slate-300">{res.won ? 'You won the night: +2 political capital and a momentum surge.' : res.avg > 6 ? 'A respectable night. Pundits give you credit: +1 political capital.' : 'A forgettable performance. Rivals will clip your worst moment.'}</p>
            <Btn className="h-14 text-lg" onClick={onClose}>Leave the studio <ArrowRight size={20} /></Btn>
          </div>
        )}
      </div>
    </Sheet>
  );
}
function HelpSheet({ onClose }) {
  const items = [
    ['Goal', 'Become Prime Minister. That takes 71 of the Seimas’ 141 seats, alone or with coalition partners.'],
    ['70 list seats', 'Split nationally by the Hare–Niemeyer largest-remainder method among parties with at least 5% of the vote. Below 5% you get none.'],
    ['71 single-mandate seats', 'Win more than 50% in round one, or finish top-two and win the runoff two weeks later. Eliminated parties’ voters transfer by ideological closeness, and some stay home.'],
    ['Each week', '6 action points plus donations scaled by your poll. Region actions have diminishing returns if repeated in the same week. Campaign gains fade slowly; ground game slows the fade and shields you.'],
    ['Momentum', 'Multiplies your support everywhere. Debates, events and press conferences build it; scandals, U-turns and botched attacks drain it. A big poll lead attracts media scrutiny.'],
    ['Political capital (PC)', 'Earned in debates, through back-channel talks and by careful choices. Spend it on lobbying cash or on sweeteners in coalition talks.'],
    ['Platform', 'Moving toward a region’s ideal position wins votes there and loses them elsewhere. Drifting far from your founding line demotivates your base. Your final platform sets your compatibility with partners.'],
    ['Coalitions', 'Invite partners, accept their policy demands or spend PC to win them over. Every partner must be willing (50+) and the bloc must reach 71. Stability falls with more parties and clashing partners.'],
  ];
  return (
    <Sheet onClose={onClose} label="How to play">
      <div style={GUTTER} className="pt-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 style={F_DISPLAY} className="text-3xl font-extrabold leading-none text-slate-50">How the Seimas is won</h2>
          <button type="button" onClick={onClose} aria-label="Close help" className="w-11 h-11 rounded-full bg-slate-800 grid place-items-center text-slate-200"><X size={20} /></button>
        </div>
        <dl className="flex flex-col gap-3">
          {items.map(([t, d]) => (
            <div key={t} className="rounded-xl bg-slate-800 p-3">
              <dt className="font-semibold text-slate-50">{t}</dt>
              <dd className="text-sm text-slate-300 leading-relaxed mt-1">{d}</dd>
            </div>
          ))}
        </dl>
        <Btn className="h-14 text-lg" onClick={onClose}>Got it</Btn>
      </div>
    </Sheet>
  );
}
function ConfirmEnd({ g, onCancel, onConfirm }) {
  return (
    <Sheet onClose={onCancel} label="End week">
      <div style={GUTTER} className="pt-6 flex flex-col gap-4">
        <h2 style={F_DISPLAY} className="text-3xl font-extrabold leading-none text-slate-50">{g.week >= WEEKS ? 'Close the campaign?' : `End week ${g.week}?`}</h2>
        <p className="text-slate-300">You still have <span className="font-bold text-amber-300" style={F_MONO}>{g.ap} action point{g.ap > 1 ? 's' : ''}</span>. Unused points don’t carry over.{g.week >= WEEKS ? ' Polls open next. There is no going back.' : ''}</p>
        <div className="flex gap-2">
          <Btn kind="ghost" className="h-14 flex-1" onClick={onCancel}>Keep campaigning</Btn>
          <Btn className="h-14 flex-1" onClick={onConfirm}>{g.week >= WEEKS ? 'Go to the polls' : 'End week'}</Btn>
        </div>
      </div>
    </Sheet>
  );
}

/* ============================================================
   Title & party selection
   ============================================================ */
const SEIMAS_2024 = { LSDP: 52, TS: 28, NA: 20, DSVL: 14, LS: 12, LVZS: 8, LLRA: 3, KITI: 4 };
function TitleScreen({ saved, onNew, onContinue }) {
  return (
    <div className="max-w-lg mx-auto min-h-screen flex flex-col" style={GUTTER}>
      <div className="pt-10">
        <Tricolor className="w-16 mb-6" h={4} />
        <Kicker>Lietuvos Respublikos Seimo rinkimai</Kicker>
        <h1 style={{ ...F_DISPLAY, fontSize: 'clamp(64px, 22vw, 112px)', lineHeight: 0.82, fontWeight: 900, fontStretch: '68%' }} className="mt-3 text-slate-50">SEIMAS</h1>
        <div style={{ ...F_DISPLAY, fontWeight: 700 }} className="text-3xl text-amber-400 mt-1">Battle for Lithuania</div>
        <p className="mt-4 text-slate-300 leading-relaxed">
          Twelve weeks. 141 seats. Run the campaign war room for one of Lithuania’s parties, survive three LRT debates, win the runoffs and build a coalition of 71.
        </p>
      </div>
      <div className="mt-6 rounded-2xl bg-slate-900 border border-slate-800 p-3">
        <Hemicycle seats={SEIMAS_2024} showCount={false} />
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-slate-400">
          {SEAT_ORDER.filter((p) => SEIMAS_2024[p]).map((p) => <span key={p} className="inline-flex items-center gap-1"><Swatch p={p} size={8} />{PARTIES[p].short} {SEIMAS_2024[p]}</span>)}
        </div>
        <div className="text-xs text-slate-500 mt-1">The Seimas elected in 2024</div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {[['70', 'list seats', '5% threshold'], ['71', 'single-mandate', 'two rounds'], ['71', 'for majority', 'of 141']].map(([n, a, b]) => (
          <div key={a} className="rounded-xl bg-slate-900 border border-slate-800 p-3">
            <div className="text-2xl font-bold text-slate-50" style={F_MONO}>{n}</div>
            <div className="text-xs text-slate-300">{a}</div>
            <div className="text-xs text-slate-500">{b}</div>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-8 pb-8 flex flex-col gap-3">
        {saved && (
          <Btn kind="ghost" className="h-14 text-base" onClick={onContinue}>
            <Play size={18} />Continue · {PARTIES[saved.player].short}, {saved.phase === 'campaign' ? `week ${saved.week}` : saved.phase === 'night' ? 'election night' : 'coalition talks'}
          </Btn>
        )}
        <Btn className="h-14 text-lg" onClick={onNew}>New campaign <ArrowRight size={20} /></Btn>
      </div>
    </div>
  );
}
function PartySelect({ onPick, onBack }) {
  const [sel, setSel] = useState(null);
  const startNat = useMemo(() => nationalShares(newGame('LSDP')), []);
  const diffTone = { Standard: 'text-emerald-300', Hard: 'text-amber-300', 'Very hard': 'text-rose-300' };
  return (
    <div className="max-w-lg mx-auto min-h-screen" style={{ ...GUTTER, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 110px)' }}>
      <div className="pt-6 flex items-center gap-3">
        <button type="button" onClick={onBack} aria-label="Back" className="w-11 h-11 rounded-full bg-slate-900 border border-slate-700 grid place-items-center text-slate-300"><ArrowRight size={18} className="rotate-180" /></button>
        <div>
          <Kicker>Step 1 of 1</Kicker>
          <h2 style={F_DISPLAY} className="text-3xl font-extrabold leading-none text-slate-50">Choose your party</h2>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 mt-5">
        {PARTY_IDS.map((p) => {
          const P = PARTIES[p];
          const on = sel === p;
          return (
            <button
              key={p} type="button" onClick={() => setSel(p)} aria-pressed={on}
              className={`w-full text-left rounded-2xl border p-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${on ? 'bg-slate-800 border-amber-400' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-2 self-stretch rounded-full" style={{ background: P.color }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span style={F_DISPLAY} className="text-2xl font-extrabold text-slate-50 leading-none">{P.short}</span>
                    <span className="text-sm text-slate-300 shrink-0" style={F_MONO}>{startNat[p].toFixed(1)}%</span>
                  </div>
                  <div className="text-sm text-slate-300 mt-0.5">{P.name} · <span className="text-slate-400">{P.ideology}</span></div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs" style={F_MONO}>
                    <span className={diffTone[P.difficulty]}>{P.difficulty}</span>
                    <span className="text-slate-400">Funds {fmtEur(P.funds)}</span>
                  </div>
                  {on && (
                    <div className="mt-3 flex flex-col gap-2 text-sm sbl-fade">
                      <div><span className="text-slate-400">Strongholds: </span><span className="text-slate-100">{P.strongholds}</span></div>
                      <div><span className="text-slate-400">{P.trait}: </span><span className="text-slate-100">{P.traitDesc}</span></div>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="fixed bottom-0 inset-x-0 z-20 bg-slate-950 border-t border-slate-800" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
        <div className="max-w-lg mx-auto pt-3" style={GUTTER}>
          <Btn className="h-14 w-full text-lg" disabled={!sel} onClick={() => onPick(sel)}>
            {sel ? <>Lead {PARTIES[sel].short} <ArrowRight size={20} /></> : 'Pick a party'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Election night
   ============================================================ */
const COUNT_SPAN = 0.55;
const countedFrac = (r, prog) => clamp((prog - r.count) / COUNT_SPAN, 0, 1);
function ElectionNight({ g, onFinish }) {
  const E = g.election;
  const me = g.player;
  const P = PARTIES[me];
  const [stage, setStage] = useState('count');
  const [prog, setProg] = useState(0);
  const [ro, setRo] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const runoffs = useMemo(() => {
    const list = E.smd.filter((e) => e.round === 2);
    return list.sort((a, b) => (a.runoff.a === me || a.runoff.b === me ? 1 : 0) - (b.runoff.a === me || b.runoff.b === me ? 1 : 0));
  }, [E, me]);
  const r1 = useMemo(() => E.smd.filter((e) => e.round === 1), [E]);
  useEffect(() => {
    if (stage !== 'count') return undefined;
    const id = setInterval(() => setProg((x) => Math.min(1, x + 0.0085)), 70);
    return () => clearInterval(id);
  }, [stage]);
  useEffect(() => { if (stage === 'count' && prog >= 1) setStage('r1'); }, [prog, stage]);
  useEffect(() => {
    if (stage !== 'runoff') return undefined;
    const id = setInterval(() => setRo((n) => Math.min(runoffs.length, n + 1)), 130);
    return () => clearInterval(id);
  }, [stage, runoffs.length]);
  useEffect(() => {
    if (stage === 'runoff' && ro >= runoffs.length) {
      const t = setTimeout(() => setStage('final'), 700);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [ro, stage, runoffs.length]);
  const live = useMemo(() => {
    const votes = Object.fromEntries(ALL_IDS.map((p) => [p, 0]));
    let tot = 0;
    const fr = {};
    for (const r of REGIONS) {
      const f = stage === 'count' ? countedFrac(r, prog) : 1;
      fr[r.id] = f;
      const R = E.regions[r.id];
      tot += R.cast * f;
      for (const p of ALL_IDS) votes[p] += R.votes[p] * f;
    }
    const shares = Object.fromEntries(ALL_IDS.map((p) => [p, tot ? (votes[p] / tot) * 100 : 0]));
    const elig = PARTY_IDS.filter((p) => shares[p] >= 5);
    const pr = tot > 0 ? hare(elig.map((p) => [p, votes[p]]), 70) : {};
    return { shares, pr, fr, counted: tot / E.total };
  }, [prog, stage, E]);
  const skip = () => { setProg(1); setRo(runoffs.length); setStage('final'); };
  const shownRunoffs = stage === 'final' ? runoffs.length : stage === 'runoff' ? ro : 0;
  const smdNow = Object.fromEntries(ALL_IDS.map((p) => [p, 0]));
  r1.forEach((e) => { if (live.fr[e.rid] >= 1) smdNow[e.winner] += 1; });
  runoffs.slice(0, shownRunoffs).forEach((e) => { smdNow[e.winner] += 1; });
  const seatsNow = Object.fromEntries(ALL_IDS.map((p) => [p, (live.counted > 0.04 ? live.pr[p] || 0 : 0) + smdNow[p]]));
  const declared = sum(Object.values(seatsNow));
  const clock = (() => {
    const mins = Math.round(20 * 60 + (stage === 'count' ? prog : 1) * 6.5 * 60);
    const h = Math.floor(mins / 60) % 24, m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  })();
  const pending = REGIONS.filter((r) => live.fr[r.id] < 1).map((r) => (r.id === 'ABR' ? 'Abroad' : r.name));
  const order = ALL_IDS.filter((p) => E.seats[p] > 0).sort((a, b) => E.seats[b] - E.seats[a]);
  const largest = order.filter((p) => p !== 'KITI')[0];
  const recent = runoffs.slice(Math.max(0, shownRunoffs - 6), shownRunoffs).reverse();
  return (
    <div className="max-w-lg mx-auto min-h-screen" style={{ ...GUTTER, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
      <div className="pt-6 flex items-center justify-between gap-3">
        <div>
          <Kicker>Rinkimų naktis · Election night</Kicker>
          <h2 style={F_DISPLAY} className="text-4xl font-extrabold leading-none text-slate-50">{stage === 'runoff' ? 'Runoff day' : stage === 'final' ? 'The new Seimas' : 'Polls closed'}</h2>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-amber-300" style={F_MONO}>{stage === 'runoff' || stage === 'final' ? 'R2' : clock}</div>
          {stage !== 'final' && <button type="button" onClick={skip} className="text-xs text-slate-400 inline-flex items-center gap-1 h-8">Skip <SkipForward size={14} /></button>}
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-slate-900 border border-slate-800 p-3">
        <Hemicycle seats={seatsNow} highlight={me} label={`${P.short} seats`} />
        <div className="flex items-center justify-between text-xs text-slate-400 mt-1" style={F_MONO}>
          <span>{declared}/141 seats declared</span>
          <span>{stage === 'count' ? `${Math.round(live.counted * 100)}% counted` : `Turnout ${(E.turnout * 100).toFixed(1)}%`}</span>
        </div>
        {stage === 'count' && (
          <>
            <div className="mt-2"><Meter value={live.counted * 100} color={GOLD} /></div>
            {pending.length > 0 && <div className="text-xs text-slate-500 mt-1.5">Still counting: {pending.slice(0, 5).join(', ')}{pending.length > 5 ? '…' : ''}</div>}
          </>
        )}
      </div>
      <div className="mt-3">
        <Section title="Multi-member vote" kicker="70 list seats · 5% threshold">
          <PollBars shares={live.shares} highlight={me} threshold />
        </Section>
      </div>
      {stage === 'r1' && (
        <div className="mt-3 rounded-2xl bg-slate-900 border border-amber-400/50 p-4 flex flex-col gap-3 sbl-pop">
          <Kicker>Single-mandate · round one</Kicker>
          <p className="text-slate-200">
            <span className="font-bold text-slate-50" style={F_MONO}>{r1.length}</span> of 71 constituencies elected an MP outright.{' '}
            <span className="font-bold text-slate-50" style={F_MONO}>{runoffs.length}</span> go to runoffs in two weeks. Your candidates are in{' '}
            <span className="font-bold text-amber-300" style={F_MONO}>{runoffs.filter((e) => e.runoff.a === me || e.runoff.b === me).length}</span> of them.
          </p>
          {r1.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {r1.map((e) => <span key={e.cid} className="text-xs rounded-md bg-slate-800 px-2 py-1 inline-flex items-center gap-1 text-slate-200"><Swatch p={e.winner} size={8} />{e.name} {e.r1[0].s.toFixed(0)}%</span>)}
            </div>
          )}
          <Btn className="h-14 text-lg" onClick={() => setStage('runoff')}>Run the runoffs <ArrowRight size={20} /></Btn>
        </div>
      )}
      {stage === 'runoff' && (
        <div className="mt-3 rounded-2xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex justify-between items-center mb-2"><Kicker>Second round</Kicker><span className="text-xs text-slate-400" style={F_MONO}>{ro}/{runoffs.length}</span></div>
          <ul className="flex flex-col gap-1.5">
            {recent.map((e) => <RunoffRow key={e.cid} e={e} me={me} />)}
          </ul>
        </div>
      )}
      {stage === 'final' && (
        <div className="mt-3 flex flex-col gap-3 sbl-fade">
          <div className="rounded-2xl bg-slate-900 border border-amber-400/50 p-4">
            <Kicker>Result</Kicker>
            <h3 style={F_DISPLAY} className="text-3xl font-extrabold leading-none mt-1 text-slate-50">
              {E.seats[me] >= MAJORITY ? `${P.short} wins an outright majority` : largest === me ? `${P.short} is the largest party` : `${PARTIES[largest].short} is the largest party`}
            </h3>
            <p className="text-sm text-slate-300 mt-2">
              You took <span style={F_MONO} className="text-slate-50">{E.natShares[me].toFixed(1)}%</span> of the list vote{E.natShares[me] < 5 ? ', below the 5% threshold' : ''} and <span style={F_MONO} className="text-slate-50">{E.seats[me]}</span> seats ({E.pr[me] || 0} list + {E.smdSeats[me]} single-mandate).
            </p>
            <div className="mt-3"><SeatTable seats={E.seats} pr={E.pr} smd={E.smdSeats} highlight={me} /></div>
          </div>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3">
            <button type="button" onClick={() => setShowAll(!showAll)} className="w-full flex items-center justify-between h-10 text-left">
              <span className="font-semibold text-sm text-slate-100">All 71 constituencies</span>
              <ChevronDown size={18} className={`text-slate-400 transition ${showAll ? 'rotate-180' : ''}`} />
            </button>
            {showAll && (
              <ul className="flex flex-col gap-1.5 mt-2">
                {E.smd.map((e) => (e.round === 2 ? <RunoffRow key={e.cid} e={e} me={me} withRegion /> : (
                  <li key={e.cid} className="flex items-center gap-2 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm">
                    <Swatch p={e.winner} size={12} /><span className="flex-1 min-w-0 truncate text-slate-100">{e.name}</span>
                    <span className="text-xs text-slate-400" style={F_MONO}>{PARTIES[e.winner].short} {e.r1[0].s.toFixed(0)}% R1</span>
                  </li>
                )))}
              </ul>
            )}
          </div>
          <Btn className="h-14 text-lg" onClick={() => onFinish(E.seats[me] >= MAJORITY ? 'majority' : 'coalition')}>
            {E.seats[me] >= MAJORITY ? <>Form a single-party government <Crown size={20} /></> : <>Open coalition talks <Handshake size={20} /></>}
          </Btn>
        </div>
      )}
    </div>
  );
}
function RunoffRow({ e, me, withRegion }) {
  const { a, b, sa, sb } = e.runoff;
  const mine = a === me || b === me;
  return (
    <li className={`rounded-lg border px-3 py-2 text-sm sbl-fade ${mine ? 'bg-slate-800 border-amber-400/40' : 'bg-slate-950 border-slate-800'}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-slate-100 truncate">{e.name}{withRegion ? <span className="text-xs text-slate-500 font-normal"> · R2</span> : ''}</span>
        <span className="text-xs inline-flex items-center gap-1 shrink-0 text-slate-200" style={F_MONO}><Swatch p={e.winner} size={9} />{PARTIES[e.winner].short} wins</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden mt-1.5">
        <div style={{ width: `${sa}%`, background: PARTIES[a].color }} />
        <div style={{ width: `${sb}%`, background: PARTIES[b].color }} />
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-1" style={F_MONO}>
        <span>{PARTIES[a].short} {sa.toFixed(1)}%</span><span>{PARTIES[b].short} {sb.toFixed(1)}%</span>
      </div>
    </li>
  );
}

/* ============================================================
   Coalition talks
   ============================================================ */
function CoalitionTalks({ g, act }) {
  const E = g.election;
  const me = g.player;
  const S = E.seats;
  const C = g.coal;
  const members = [me, ...C.partners];
  const total = sum(members.map((p) => S[p]));
  const stab = stability(g, C);
  const cab = cabinet(g, C.partners);
  const cands = [...PARTY_IDS.filter((p) => p !== me && S[p] > 0), ...(S.KITI > 0 ? ['KITI'] : [])];
  const will = Object.fromEntries(cands.map((p) => [p, willingness(g, p, C)]));
  const unwilling = C.partners.filter((p) => will[p] < 50);
  const canSign = total >= MAJORITY && unwilling.length === 0;
  const ranked = ALL_IDS.filter((p) => S[p] > 0 && p !== 'KITI').sort((a, b) => S[b] - S[a]);
  const largest = ranked[0];
  const junior = largest !== me ? aiCoalition(g, largest, me) : null;
  const juniorOk = !!junior && junior.ok && compat(g, largest, me) >= 45;
  const sortedCands = cands.slice().sort((a, b) => (C.partners.includes(b) ? 1 : 0) - (C.partners.includes(a) ? 1 : 0) || will[b] - will[a]);
  const toggle = (p) => act((gg) => {
    const c = gg.coal;
    c.partners = c.partners.includes(p) ? c.partners.filter((x) => x !== p) : [...c.partners, p];
    return null;
  });
  const accept = (p) => act((gg) => { gg.coal.accepted[p] = !gg.coal.accepted[p]; return null; });
  const sweeten = (p) => act((gg) => {
    if (gg.pc < 2) return { ok: false, msg: 'Not enough political capital.' };
    if ((gg.coal.sweet[p] || 0) >= 3) return { ok: false, msg: 'They can’t be sweetened any further.' };
    gg.pc -= 2;
    gg.coal.sweet[p] = (gg.coal.sweet[p] || 0) + 1;
    return { ok: true, tone: 'good', msg: `${PARTIES[p].short} warms to the deal: willingness +7` };
  });
  const sign = () => act((gg) => {
    gg.result = { kind: 'pm', partners: [...gg.coal.partners], stability: stability(gg, gg.coal), seats: total, cabinet: cabinet(gg, gg.coal.partners) };
    gg.phase = 'result';
    return null;
  });
  const goJunior = () => act((gg) => {
    gg.result = { kind: 'junior', leader: largest, members: junior.members, seats: junior.total, ministries: Math.max(1, Math.round((S[me] / junior.total) * 14)) };
    gg.phase = 'result';
    return null;
  });
  const goOpp = () => act((gg) => {
    const L = ranked.find((p) => p !== me);
    const ai = aiCoalition(gg, L, null);
    gg.result = { kind: 'opposition', leader: L, members: ai.members, seats: ai.total, ok: ai.ok };
    gg.phase = 'result';
    return null;
  });
  const stabTone = stab >= 65 ? '#34D399' : stab >= 45 ? GOLD : '#F87171';
  return (
    <div className="max-w-lg mx-auto min-h-screen" style={{ ...GUTTER, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 170px)' }}>
      <div className="pt-6">
        <Kicker>Seimas · coalition talks</Kicker>
        <h2 style={F_DISPLAY} className="text-4xl font-extrabold leading-none text-slate-50">Build a majority</h2>
        <p className="text-sm text-slate-400 mt-1">
          {largest === me ? 'As leader of the largest party, the President asks you to form a government.' : `${PARTIES[largest].short} is the largest party, but if you can assemble 71 seats the President will back you.`}
        </p>
      </div>
      <div className="mt-4 rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <div><Kicker>Coalition seats</Kicker><div className="text-4xl font-bold text-slate-50" style={F_MONO}>{total}<span className="text-lg text-slate-500">/141</span></div></div>
          <div className={`text-sm font-semibold ${total >= MAJORITY ? 'text-emerald-300' : 'text-amber-300'}`}>{total >= MAJORITY ? `Majority +${total - MAJORITY + 1}` : `${MAJORITY - total} short`}</div>
        </div>
        <div className="relative h-5 rounded-md bg-slate-800 overflow-hidden flex">
          {members.map((p) => <div key={p} style={{ width: `${(S[p] / 141) * 100}%`, background: PARTIES[p].color }} />)}
          <div className="absolute top-0 bottom-0 w-0.5 bg-slate-50" style={{ left: `${(MAJORITY / 141) * 100}%` }} />
        </div>
        <div>
          <div className="flex items-center justify-between text-sm"><span className="text-slate-300">Projected stability</span><span style={{ ...F_MONO, color: stabTone }} className="font-bold">{stab}</span></div>
          <div className="mt-1.5"><Meter value={stab} color={stabTone} /></div>
        </div>
        <div>
          <Kicker className="mb-1.5">Cabinet · 14 ministries</Kicker>
          <div className="flex flex-wrap gap-1.5">
            {members.filter((p) => p !== 'KITI').flatMap((p) => cab.alloc[p].map((m) => (
              <span key={m} className="text-xs rounded-md px-2 py-1 text-slate-100" style={{ background: `${PARTIES[p].color}30`, border: `1px solid ${PARTIES[p].color}80` }}>{m}</span>
            )))}
          </div>
          {cab.mine < 5 && C.partners.length > 0 && <p className="text-xs text-amber-200 mt-1.5">You keep only {cab.mine} ministries. A weak PM party hurts stability.</p>}
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2.5">
        <Kicker>Potential partners</Kicker>
        {sortedCands.map((p) => {
          const P = PARTIES[p];
          const inC = C.partners.includes(p);
          const w = will[p];
          const status = w >= 65 ? ['Eager', 'text-emerald-300'] : w >= 50 ? ['Open', 'text-emerald-300'] : w >= 35 ? ['Reluctant', 'text-amber-300'] : ['Refuses', 'text-rose-300'];
          const clashes = C.partners.filter((q) => q !== p && compat(g, p, q) < 25);
          return (
            <div key={p} className={`rounded-2xl border p-3 ${inC ? 'border-amber-400/70 bg-slate-900' : 'border-slate-800 bg-slate-900'}`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl grid place-items-center font-bold text-lg text-slate-50 shrink-0" style={{ background: `${P.color}30`, border: `1px solid ${P.color}`, ...F_MONO }}>{S[p]}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-50 truncate">{P.short} <span className="text-slate-400 font-normal text-sm">{p === 'KITI' ? 'Independents' : P.name}</span></div>
                  <div className="text-xs text-slate-400">Fit {compat(g, me, p)}% · <span className={status[1]}>{status[0]}</span></div>
                </div>
                <Btn kind={inC ? 'outline' : 'ghost'} onClick={() => toggle(p)} className="h-11 px-3 text-sm shrink-0">{inC ? 'Remove' : 'Invite'}</Btn>
              </div>
              <div className="mt-2.5">
                <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Willingness</span><span style={F_MONO}>{w}/100 · needs 50</span></div>
                <Meter value={w} color={w >= 50 ? '#34D399' : w >= 35 ? GOLD : '#F87171'} mark={50} />
              </div>
              <div className="mt-2.5 text-sm text-slate-300"><span className="text-slate-500">Demand: </span>{DEMANDS[p].text}</div>
              {clashes.length > 0 && (
                <div className="mt-2 text-xs text-rose-300 flex items-center gap-1.5"><AlertTriangle size={14} />Won’t sit comfortably with {clashes.map((q) => PARTIES[q].short).join(', ')}</div>
              )}
              <div className="flex gap-2 mt-2.5">
                <Btn kind={C.accepted[p] ? 'primary' : 'ghost'} onClick={() => accept(p)} className="flex-1 h-11 text-sm">
                  {C.accepted[p] ? <><Check size={16} />Demand accepted</> : 'Accept demand · +15'}
                </Btn>
                <Btn kind="ghost" onClick={() => sweeten(p)} disabled={g.pc < 2 || (C.sweet[p] || 0) >= 3} className="h-11 px-3 text-sm shrink-0">
                  <Sparkles size={16} />2 PC{C.sweet[p] ? ` ×${C.sweet[p]}` : ''}
                </Btn>
              </div>
              {inC && p !== 'KITI' && <div className="text-xs text-slate-400 mt-2">Gets {cab.counts[p]} ministr{cab.counts[p] === 1 ? 'y' : 'ies'}: {cab.alloc[p].join(', ')}</div>}
            </div>
          );
        })}
      </div>
      <div className="fixed bottom-0 inset-x-0 z-20 bg-slate-950 border-t border-slate-800" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
        <div className="max-w-lg mx-auto pt-3 flex flex-col gap-2" style={GUTTER}>
          <div className="flex items-center justify-between text-xs text-slate-400" style={F_MONO}>
            <span>PC available: <span className="text-slate-100">{g.pc}</span></span>
            <span>{unwilling.length ? `Not yet willing: ${unwilling.map((p) => PARTIES[p].short).join(', ')}` : total >= MAJORITY ? 'Ready to sign' : 'Need 71 seats'}</span>
          </div>
          <Btn className="h-14 text-lg w-full" disabled={!canSign} onClick={sign}><Handshake size={20} />Sign coalition agreement</Btn>
          <div className="flex gap-2">
            {juniorOk && <Btn kind="ghost" className="h-11 flex-1 text-sm" onClick={goJunior}>Join {PARTIES[largest].short} as junior partner</Btn>}
            <Btn kind="outline" className="h-11 flex-1 text-sm" onClick={goOpp}>Go into opposition</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Result
   ============================================================ */
function gradeOf(g) {
  const R = g.result;
  const E = g.election;
  const seats = E.seats[g.player];
  if (R.kind === 'majority') return ['S', 'Single-party majority', 'You govern alone, a feat no party has managed since 1992.'];
  if (R.kind === 'pm') {
    if (R.stability >= 65) return ['A', 'Prime Minister · stable majority', 'Your coalition looks built to last a full four-year term.'];
    if (R.stability >= 45) return ['B', 'Prime Minister · workable coalition', 'You hold the keys to the government at Gedimino pr. 11, but expect late-night crisis meetings.'];
    return ['C', 'Prime Minister · on borrowed time', 'You are Prime Minister, but analysts give the coalition a year before it cracks.'];
  }
  if (R.kind === 'junior') return [PARTIES[g.player].difficulty === 'Standard' ? 'C' : 'B', 'Junior coalition partner', `You enter government with ${R.ministries} ministr${R.ministries === 1 ? 'y' : 'ies'} under a ${PARTIES[R.leader].short}-led cabinet.`];
  if (E.natShares[g.player] >= 5) return ['D', 'Opposition', 'You cleared the threshold and hold a sizeable bench, but someone else governs.'];
  if (seats > 0) return ['E', 'Survived on single-mandate seats', 'Below 5% nationally, but your local candidates kept you in the chamber.'];
  return ['F', 'Wiped out', 'No list seats, no constituencies. Time for a new party leader.'];
}
function ResultScreen({ g, onRestart }) {
  const E = g.election;
  const R = g.result;
  const me = g.player;
  const P = PARTIES[me];
  const [grade, title, blurb] = gradeOf(g);
  const gov = R.kind === 'majority' ? [me] : R.kind === 'pm' ? [me, ...R.partners] : R.members || [];
  const deb = g.stats.debates;
  const tone = { S: '#34D399', A: '#34D399', B: GOLD, C: GOLD, D: '#94A3B8', E: '#F87171', F: '#F87171' }[grade];
  return (
    <div className="max-w-lg mx-auto min-h-screen" style={{ ...GUTTER, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
      <div className="pt-8 flex items-start gap-4">
        <div className="sbl-pop rounded-2xl grid place-items-center shrink-0" style={{ width: 84, height: 84, background: `${tone}22`, border: `2px solid ${tone}` }}>
          <span style={{ ...F_DISPLAY, fontSize: 52, fontWeight: 900, color: tone }}>{grade}</span>
        </div>
        <div className="min-w-0">
          <Kicker>{P.short} · final verdict</Kicker>
          <h2 style={{ ...F_DISPLAY, textWrap: 'balance' }} className="text-3xl font-extrabold leading-none text-slate-50 mt-1">{title}</h2>
        </div>
      </div>
      <p className="text-slate-300 mt-4 leading-relaxed">{blurb}</p>
      <div className="mt-4 rounded-2xl bg-slate-900 border border-slate-800 p-3">
        <Hemicycle seats={E.seats} highlight={me} dim={gov.length ? gov : null} label="government seats" showCount={false} />
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="text-xs text-slate-400">Government:</span>
          {gov.map((p) => <span key={p} className="text-xs rounded-md bg-slate-800 px-2 py-1 inline-flex items-center gap-1 text-slate-100"><Swatch p={p} size={8} />{PARTIES[p].short} {E.seats[p]}</span>)}
          <span className="text-xs text-slate-300 ml-auto" style={F_MONO}>{sum(gov.map((p) => E.seats[p]))} seats</span>
        </div>
        {R.kind === 'pm' && <div className="text-xs text-slate-400 mt-2">Stability {R.stability}/100 · you hold {R.cabinet.mine} of 14 ministries</div>}
        {R.kind === 'opposition' && !R.ok && <div className="text-xs text-amber-200 mt-2">No stable majority exists: {PARTIES[R.leader].short} attempts a minority government.</div>}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        {[
          ['List vote', `${E.natShares[me].toFixed(1)}%`],
          ['Seats', `${E.seats[me]} (${E.pr[me] || 0}+${E.smdSeats[me]})`],
          ['Debates won', `${deb.filter((d) => d.won).length}/${deb.length}`],
          ['Campaign actions', `${g.stats.actions}`],
          ['Money spent', fmtEur(g.stats.spent)],
          ['Turnout', `${(E.turnout * 100).toFixed(1)}%`],
        ].map(([l, v]) => (
          <div key={l} className="rounded-xl bg-slate-900 border border-slate-800 p-3">
            <div className="text-xs text-slate-400">{l}</div>
            <div className="text-lg font-bold text-slate-50" style={F_MONO}>{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-3"><Section title="Final Seimas" kicker="141 seats"><SeatTable seats={E.seats} pr={E.pr} smd={E.smdSeats} highlight={me} /></Section></div>
      <Btn className="h-14 text-lg w-full mt-5" onClick={onRestart}><RotateCcw size={20} />New campaign</Btn>
    </div>
  );
}

/* ============================================================
   Toast & queue
   ============================================================ */
function Toast({ t }) {
  const bg = t.ok === false || t.tone === 'bad' ? 'bg-rose-600 text-white' : t.tone === 'warn' ? 'bg-amber-300 text-slate-950' : 'bg-slate-100 text-slate-950';
  return (
    <div className="fixed inset-x-0 z-50 pointer-events-none flex justify-center" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)', ...GUTTER }} role="status" aria-live="polite">
      <div key={t.id} className={`sbl-toast max-w-md w-full rounded-xl px-4 py-3 text-sm font-semibold shadow-2xl ${bg}`}>{t.msg}</div>
    </div>
  );
}
function QueueModal({ g, item, act, nat, proj }) {
  const shift = () => act((gg) => { gg.queue.shift(); return null; });
  if (item.type === 'brief') return <BriefModal g={g} nat={nat} proj={proj} onClose={shift} />;
  if (item.type === 'report') return <ReportModal g={g} item={item} onClose={shift} />;
  if (item.type === 'event') return <EventModal g={g} item={item} onChoose={(i) => act((gg) => { resolveEvent(gg, i); return null; })} onClose={shift} />;
  if (item.type === 'debate') return <DebateModal key={`d${item.id}`} g={g} item={item} onFinish={(picks) => act((gg) => { gg.queue[0].done = resolveDebate(gg, item.id, picks); return null; })} onClose={shift} />;
  return null;
}

/* ============================================================
   Root component
   ============================================================ */
export default function SeimasGame({ hotData } = {}) {
  const [game, setGame] = useState(() => (hotData && hotData.game) || null);
  const [screen, setScreen] = useState(() => (hotData && hotData.game ? 'game' : 'title'));
  const [saved, setSaved] = useState(null);
  const [tab, setTab] = useState('map');
  const [sel, setSel] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [help, setHelp] = useState(false);
  const gameRef = useRef(game);
  gameRef.current = game;
  const toastTimer = useRef(null);

  useEffect(() => {
    if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Archivo"]')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = FONT_HREF;
      document.head.appendChild(l);
    }
    setSaved(loadSave());
    try {
      if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => ({ game: gameRef.current }));
    } catch (e) { /* no hot reload host */ }
    return () => clearTimeout(toastTimer.current);
  }, []);
  useEffect(() => { if (game) writeSave(game); }, [game]);

  const flash = (res) => {
    if (!res || !res.msg) return;
    setToast({ ...res, id: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };
  const act = (fn) => {
    const cur = gameRef.current;
    if (!cur) return null;
    const g = clone(cur);
    const res = fn(g);
    gameRef.current = g;
    setGame(g);
    flash(res);
    return res;
  };
  const derived = useMemo(() => {
    if (!game || game.phase !== 'campaign') return null;
    return {
      shares: Object.fromEntries(REGIONS.map((r) => [r.id, regionShares(game, r)])),
      nat: nationalShares(game),
      proj: simulateElection(game, false),
    };
  }, [game]);
  const goTab = (t) => { setTab(t); try { window.scrollTo({ top: 0 }); } catch (e) { /* ignore */ } };
  const doEnd = () => {
    setConfirmEnd(false);
    setSel(null);
    act((g) => { endWeek(g); return null; });
    goTab(tab);
  };
  const restart = () => {
    writeSave(null);
    setGame(null);
    gameRef.current = null;
    setSaved(null);
    setSel(null);
    setTab('map');
    setScreen('select');
  };

  let body;
  if (screen === 'select') {
    body = <PartySelect onBack={() => setScreen('title')} onPick={(pid) => { const g = newGame(pid); gameRef.current = g; setGame(g); setTab('map'); setSel(null); setScreen('game'); }} />;
  } else if (screen === 'title' || !game) {
    body = <TitleScreen saved={saved} onNew={() => setScreen('select')} onContinue={() => { gameRef.current = saved; setGame(saved); setScreen('game'); }} />;
  } else if (game.phase === 'campaign' && derived) {
    const { shares, nat, proj } = derived;
    body = (
      <>
        <Header g={game} nat={nat} onHelp={() => setHelp(true)} />
        <main className="max-w-lg mx-auto" style={{ ...GUTTER, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 120px)' }}>
          {tab === 'map' && <MapTab g={game} shares={shares} proj={proj} sel={sel} onSelect={setSel} />}
          {tab === 'polls' && <PollsTab g={game} nat={nat} proj={proj} />}
          {tab === 'platform' && <PlatformTab g={game} act={act} />}
          {tab === 'news' && <NewsTab g={game} />}
        </main>
        <BottomNav tab={tab} setTab={goTab} g={game} onEnd={() => (game.ap > 0 ? setConfirmEnd(true) : doEnd())} />
        {sel && <RegionDrawer g={game} rid={sel} proj={proj} onClose={() => setSel(null)} onAction={(rid, type) => act((g) => doRegionAction(g, rid, type))} />}
        {confirmEnd && <ConfirmEnd g={game} onCancel={() => setConfirmEnd(false)} onConfirm={doEnd} />}
        {help && <HelpSheet onClose={() => setHelp(false)} />}
        {game.queue.length > 0 && <QueueModal g={game} item={game.queue[0]} act={act} nat={nat} proj={proj} />}
      </>
    );
  } else if (game.phase === 'night') {
    body = (
      <ElectionNight
        key={`night-${game.seed}`}
        g={game}
        onFinish={(kind) => act((g) => {
          if (kind === 'majority') { g.result = { kind: 'majority' }; g.phase = 'result'; }
          else { g.coal = { partners: [], accepted: {}, sweet: {} }; g.phase = 'coalition'; }
          try { window.scrollTo({ top: 0 }); } catch (e) { /* ignore */ }
          return null;
        })}
      />
    );
  } else if (game.phase === 'coalition') {
    body = <CoalitionTalks g={game} act={act} />;
  } else {
    body = <ResultScreen g={game} onRestart={restart} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased" style={{ fontFamily: F_BODY }}>
      <style>{GLOBAL_CSS}</style>
      {body}
      {toast && <Toast t={toast} />}
    </div>
  );
}
