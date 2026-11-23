/*
 * Seimas: Battle for Lithuania · Seimas: kova dėl Lietuvos
 * A friendly, mobile-first campaign & coalition game built on Lithuania's real mixed electoral system:
 * 70 proportional seats (5% threshold, Hare–Niemeyer) + 71 single-mandate seats (two-round runoff).
 * Scenario: the 2028 Seimas election, starting from approximate late-2026 polling.
 * Fictional simulation: real party names and leaders give context; every event, statement and result is invented.
 * Single-file React component. Tailwind CSS + lucide-react. No external APIs. Lithuanian & English.
 * Map outlines simplified from @react-map/lithuania (MIT License, Copyright (c) Shubham Singh).
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Map as MapIcon, BarChart3, Building2, Newspaper, ChevronRight, ChevronDown, X, Zap, Wallet, TrendingUp,
  TrendingDown, Megaphone, Smartphone, Radio, DoorOpen, Swords, Users, Shield, Home, HeartPulse, Truck,
  Factory, Tractor, Plane, Anchor, GraduationCap, Globe, Coins, HandCoins, Handshake, Crown, Vote,
  RotateCcw, HelpCircle, AlertTriangle, Flame, Mic, Scale, Leaf, Info, ArrowRight, TramFront, TrainFront,
  Languages, PiggyBank, Trophy, Music, Mail, SkipForward, Check, Tv, Target, Briefcase, Play, Sparkles,
  ShieldAlert, Siren, Flag, Star, Smile, Meh, Frown, Wand2, Lightbulb, Medal, Landmark, Heart, Sprout,
  Wheat, LockOpen, Rocket, Dices, Search, Cloud, CloudRain, Sun, Gavel, Ticket, Eye,
} from 'lucide-react';

/* ============================================================
   Language (lt / en)
   ============================================================ */
let LANG = 'lt';
const tt = (en, lt) => (LANG === 'lt' ? lt : en);
const bi = (en, lt) => ({ en, lt });
const L = (x) => (x == null ? '' : typeof x === 'string' ? x : x[LANG] != null ? x[LANG] : x.en);
function plur(n, en1, enN, lt1, lt2, lt3) {
  if (LANG !== 'lt') return n === 1 ? en1 : enN;
  const a = Math.abs(n) % 10, b = Math.abs(n) % 100;
  if (a === 1 && b !== 11) return lt1;
  if (a >= 2 && a <= 9 && !(b >= 12 && b <= 19)) return lt2;
  return lt3;
}
const seatsWord = (n) => plur(n, 'seat', 'seats', 'mandatas', 'mandatai', 'mandatų');
const nf = (x, d = 1) => {
  const s = Math.abs(x).toFixed(d);
  return LANG === 'lt' ? s.replace('.', ',') : s;
};
const fmtNum = (x, d = 1) => `${x < 0 ? '−' : ''}${nf(x, d)}`;
const fmtPct = (x, d = 1) => (LANG === 'lt' ? `${fmtNum(x, d)} %` : `${fmtNum(x, d)}%`);
const fmtSigned = (x, d = 1) => `${x >= 0 ? '+' : '−'}${nf(x, d)}`;
const fmtSignedPct = (x, d = 1) => (LANG === 'lt' ? `${fmtSigned(x, d)} %` : `${fmtSigned(x, d)}%`);
const fmtEur = (k) => {
  const v = Math.round(k);
  if (Math.abs(v) >= 1000) return LANG === 'lt' ? `${nf(v / 1000, 2)} mln. €` : `€${(v / 1000).toFixed(2)}M`;
  return LANG === 'lt' ? `${v} tūkst. €` : `€${v}k`;
};
const fmtEurShort = (k) => (LANG === 'lt' ? `${nf(k / 1000, Math.abs(k) >= 1000 ? 1 : 2)} mln. €` : `€${(k / 1000).toFixed(Math.abs(k) >= 1000 ? 1 : 2)}M`);
const fmtInt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/* ============================================================
   Typography & look
   ============================================================ */
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@500;600;700;800;900&display=swap';
const FONT_TITLE = "'Fredoka', 'Baloo 2', 'Trebuchet MS', system-ui, sans-serif";
const F_DISPLAY = { fontFamily: FONT_TITLE, fontWeight: 700 };
const F_MONO = { fontFamily: FONT_TITLE, fontVariantNumeric: 'tabular-nums', fontWeight: 600 };
const F_BODY = "'Nunito', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const GUTTER = {
  paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))',
  paddingRight: 'max(16px, env(safe-area-inset-right, 0px))',
};
const FLAG = { y: '#FDB913', g: '#006A44', r: '#C1272D' };
const INK = '#1F2544';
const SUN = '#FDB913';
const GOLD = SUN;
const MUTED = '#56607A';
const GREEN = '#15803D';
const RED = '#DC2626';
const AMBER = '#B45309';

const GLOBAL_CSS = `
.sbl { --ink: #1F2544; --sky: #A9DCF6; --paper: #FFFFFF; --paper2: #EEF6FC; --muted: #56607A; --sun: #FDB913;
  --leaf: #1F9D55; --berry: #E5484D; color: var(--ink); background: var(--sky); font-family: 'Nunito', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
.sbl ::selection { background: #FDE68A }
.cx-card { background: var(--paper); border: 3px solid var(--ink); border-radius: 22px; box-shadow: 0 5px 0 var(--ink); }
.cx-soft { background: var(--paper2); border-radius: 16px; }
:where(.cx-btn) { display: inline-flex; align-items: center; justify-content: center; gap: 8px; text-align: center; }
.cx-btn { border: 3px solid var(--ink); border-radius: 16px; box-shadow: 0 5px 0 var(--ink); font-weight: 800; color: var(--ink);
  background: var(--paper); cursor: pointer; user-select: none; -webkit-user-select: none;
  transition: transform .08s ease, box-shadow .08s ease, background-color .15s ease; }
.cx-btn:active:not(:disabled) { transform: translateY(4px); box-shadow: 0 1px 0 var(--ink); }
.cx-btn:disabled { opacity: .45; cursor: not-allowed; box-shadow: 0 3px 0 var(--ink); }
.cx-btn:focus-visible, .cx-tap:focus-visible { outline: 3px solid #2563EB; outline-offset: 3px; }
.cx-tap { cursor: pointer; transition: transform .08s ease; }
.cx-tap:active { transform: scale(.98); }
.cx-sun { background: var(--sun); } .cx-leaf { background: var(--leaf); color: #fff; } .cx-berry { background: var(--berry); color: #fff; }
.cx-white { background: #fff; } .cx-pale { background: #DDF0FB; } .cx-cream { background: #FFF6D8; } .cx-night { background: #2A2F55; color: #fff; }
:where(.cx-chip) { display: inline-flex; align-items: center; gap: 6px; }
.cx-chip { border: 2.5px solid var(--ink); border-radius: 999px; background: #fff; font-weight: 800; }
.cx-title { font-family: 'Fredoka', 'Baloo 2', 'Trebuchet MS', system-ui, sans-serif; font-weight: 700; letter-spacing: -0.01em; text-wrap: balance; }
.cx-num { font-family: 'Fredoka', 'Baloo 2', 'Trebuchet MS', system-ui, sans-serif; font-variant-numeric: tabular-nums; font-weight: 600; }
.t-muted { color: var(--muted); }
.cx-track { background: #E3EDF5; border: 2.5px solid var(--ink); border-radius: 999px; overflow: hidden; }
.cx-logo { font-family: 'Fredoka', 'Baloo 2', 'Trebuchet MS', system-ui, sans-serif; font-weight: 700; color: var(--sun);
  -webkit-text-stroke: 4px var(--ink); paint-order: stroke fill; text-shadow: 0 7px 0 var(--ink); letter-spacing: 0.01em; }
.cx-wheel { transition: transform 3.4s cubic-bezier(.12,.75,.12,1); transform-box: fill-box; transform-origin: center; }
.cx-ticker-wrap { overflow: hidden; white-space: nowrap; }
.cx-ticker { display: inline-flex; gap: 32px; padding-left: 100%; animation: cx-ticker 38s linear infinite; }
@keyframes cx-ticker { from { transform: translateX(0) } to { transform: translateX(-100%) } }
@keyframes cx-up { from { transform: translateY(32px); opacity: 0 } to { transform: none; opacity: 1 } }
@keyframes cx-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes cx-pop { 0% { transform: scale(.7); opacity: 0 } 70% { transform: scale(1.06) } 100% { transform: scale(1); opacity: 1 } }
@keyframes cx-bob { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-7px) } }
@keyframes cx-glow { 0% { box-shadow: 0 5px 0 var(--ink), 0 0 0 0 rgba(253,185,19,.9) } 100% { box-shadow: 0 5px 0 var(--ink), 0 0 0 14px rgba(253,185,19,0) } }
@keyframes cx-blink { 0%, 100% { opacity: 1 } 50% { opacity: .4 } }
@keyframes cx-fall { 0% { transform: translateY(-12vh) rotate(0deg) } 100% { transform: translateY(112vh) rotate(760deg) } }
@keyframes cx-shake { 0%, 100% { transform: translateX(0) } 25% { transform: translateX(-6px) } 75% { transform: translateX(6px) } }
.sbl-sheet { animation: cx-up .3s cubic-bezier(.2,.9,.3,1.2) both }
.sbl-fade { animation: cx-fade .2s ease both }
.sbl-pop { animation: cx-pop .35s ease both }
.sbl-toast { animation: cx-pop .25s ease both }
.sbl-blink { animation: cx-blink 1.2s ease-in-out infinite }
.cx-shake { animation: cx-shake .35s ease 2 }
.cx-bob { animation: cx-bob 1.1s ease-in-out infinite; transform-box: fill-box; transform-origin: center }
.cx-glow { animation: cx-glow 1.3s ease-out infinite }
.cx-confetti { position: fixed; top: 0; width: 11px; height: 15px; border: 2px solid var(--ink); border-radius: 3px; z-index: 70; pointer-events: none; animation: cx-fall linear forwards; }
.sbl-scroll { -webkit-overflow-scrolling: touch; overscroll-behavior: contain }
.cx-map path, .cx-map circle { transition: fill .35s ease }
@media (prefers-reduced-motion: reduce) {
  .sbl-sheet, .sbl-fade, .sbl-pop, .sbl-toast, .sbl-blink, .cx-bob, .cx-glow, .cx-shake { animation: none !important }
  .cx-ticker { animation: none; padding-left: 0; }
  .cx-confetti { display: none; }
  .cx-wheel { transition-duration: .01s; }
  .cx-map path, .cx-map circle { transition: none }
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

/* ============================================================
   Parties (leaders verified Nov 2026; emblems are original designs, not party logos)
   ============================================================ */
const PARTIES = {
  LSDP: {
    id: 'LSDP', short: 'LSDP', name: 'Socialdemokratai', full: 'Lietuvos socialdemokratų partija', color: '#E11D48', emblem: Heart,
    leader: 'Mindaugas Sinkevičius', ideology: bi('Centre-left', 'Centro kairė'), pos: { econ: -30, social: 0, defense: 60, green: 30 }, funds: 1200,
    difficulty: 'easy', stars: 1,
    blurb: bi('The big centre-left party leading the governing coalition. Strong in towns and villages.', 'Didžioji centro kairės partija, vadovaujanti valdančiajai koalicijai. Stipri miesteliuose ir kaimuose.'),
    perk: bi('Rallies in towns and villages work extra well, and welfare promises land harder.', 'Mitingai miesteliuose ir kaimuose veikia ypač gerai, o socialiniai pažadai – stipriau.'),
    strongholds: bi('Small towns and industrial centres: Jonava, Alytus, Akmenė', 'Miesteliai ir pramonės centrai: Jonava, Alytus, Akmenė'),
  },
  TS: {
    id: 'TS', short: 'TS-LKD', name: 'Tėvynės sąjunga', full: 'Tėvynės sąjunga – Lietuvos krikščionys demokratai', color: '#0284C7', emblem: Shield,
    leader: 'Laurynas Kasčiūnas', ideology: bi('Centre-right · Conservative', 'Centro dešinė · Konservatoriai'), pos: { econ: 30, social: 30, defense: 90, green: 30 }, funds: 1400,
    difficulty: 'easy', stars: 1,
    blurb: bi('Conservatives, back on top of the polls. Rule Vilnius, Kaunas and the diaspora.', 'Konservatoriai, vėl pirmaujantys apklausose. Valdo Vilnių, Kauną ir užsienio lietuvius.'),
    perk: bi('Rich donors: fundraising pays 60% more. Villages are a tougher sell.', 'Turtingi rėmėjai: lėšų rinkimas duoda 60 % daugiau. Kaimuose sekasi sunkiau.'),
    strongholds: bi('Vilnius, Kaunas and Lithuanians abroad', 'Vilnius, Kaunas ir užsienio lietuviai'),
  },
  NA: {
    id: 'NA', short: 'NA', name: 'Nemuno aušra', full: 'Partija „Nemuno aušra“', color: '#D97706', emblem: Megaphone,
    leader: 'Remigijus Žemaitaitis', ideology: bi('Right-wing populist', 'Dešinieji populistai'), pos: { econ: -30, social: 60, defense: 0, green: -60 }, funds: 800,
    difficulty: 'medium', stars: 2,
    blurb: bi('Loud anti-establishment populists. Strong in Samogitia and rural areas.', 'Garsūs antisisteminiai populistai. Stiprūs Žemaitijoje ir kaimuose.'),
    perk: bi('Rallies are cheap and extra strong, but scandals hit you harder.', 'Mitingai pigūs ir itin stiprūs, bet skandalai smogia skaudžiau.'),
    strongholds: bi('Samogitia (Žemaitija) and the countryside', 'Žemaitija ir kaimo vietovės'),
  },
  DSVL: {
    id: 'DSVL', short: 'DSVL', name: 'Vardan Lietuvos', full: 'Demokratų sąjunga „Vardan Lietuvos“', color: '#0D9488', emblem: Sprout,
    leader: 'Virginijus Sinkevičius', ideology: bi('Centre-left · Green', 'Centro kairė · Žalieji'), pos: { econ: 0, social: 30, defense: 60, green: 60 }, funds: 800,
    difficulty: 'hard', stars: 3,
    blurb: bi('Centrists rebuilding under a new leader after a scandal.', 'Centristai, po skandalo atsigaunantys su nauju lyderiu.'),
    perk: bi('After the vote, every party finds it easy to team up with you.', 'Po rinkimų su jumis lengvai sutaria visos partijos.'),
    strongholds: bi('Central Lithuania and moderate voters', 'Vidurio Lietuva ir nuosaikūs rinkėjai'),
  },
  LS: {
    id: 'LS', short: 'LS', name: 'Liberalų sąjūdis', full: 'Lietuvos Respublikos liberalų sąjūdis', color: '#EAB308', emblem: Rocket,
    leader: 'Viktorija Čmilytė-Nielsen', ideology: bi('Classical liberal', 'Klasikiniai liberalai'), pos: { econ: 60, social: -60, defense: 60, green: 30 }, funds: 900,
    difficulty: 'medium', stars: 2,
    blurb: bi('Pro-business liberals, popular on the coast and in cities.', 'Verslui palankūs liberalai, populiarūs pajūryje ir miestuose.'),
    perk: bi('Online ads and fundraising work better.', 'Reklama internete ir lėšų rinkimas veikia geriau.'),
    strongholds: bi('Klaipėda, Vilnius and the seaside resorts', 'Klaipėda, Vilnius ir pajūrio kurortai'),
  },
  LVZS: {
    id: 'LVZS', short: 'LVŽS', name: 'Valstiečiai ir žalieji', full: 'Lietuvos valstiečių ir žaliųjų sąjunga', color: '#16A34A', emblem: Wheat,
    leader: 'Aurelijus Veryga', ideology: bi('Agrarian · Social conservative', 'Agrariniai · Socialiniai konservatoriai'), pos: { econ: -30, social: 90, defense: 30, green: 0 }, funds: 900,
    difficulty: 'medium', stars: 2,
    blurb: bi('Farmers’ party with family values, rising again in the polls.', 'Ūkininkų ir šeimos vertybių partija, vėl kylanti apklausose.'),
    perk: bi('Village rallies, TV ads and farm promises work better.', 'Mitingai kaimuose, TV reklama ir žemės ūkio pažadai veikia geriau.'),
    strongholds: bi('Rural Aukštaitija and Suvalkija', 'Aukštaitijos ir Suvalkijos kaimai'),
  },
  LP: {
    id: 'LP', short: 'LP', name: 'Laisvės partija', full: 'Laisvės partija', color: '#DB2777', emblem: LockOpen,
    leader: 'Vytautas Mitalas', ideology: bi('Progressive liberal', 'Progresyvieji liberalai'), pos: { econ: 30, social: -90, defense: 60, green: 60 }, funds: 550,
    difficulty: 'hard', stars: 3,
    blurb: bi('Young progressives fighting to get back into the Seimas.', 'Jauni progresyvieji, siekiantys sugrįžti į Seimą.'),
    perk: bi('Online ads are super strong, but you start below the 5% line.', 'Reklama internete itin stipri, bet pradedate žemiau 5 % barjero.'),
    strongholds: bi('Young voters in Vilnius and Kaunas', 'Jauni Vilniaus ir Kauno rinkėjai'),
  },
  LLRA: {
    id: 'LLRA', short: 'LLRA-KŠS', name: 'Lenkų rinkimų akcija', full: 'Lietuvos lenkų rinkimų akcija – Krikščioniškų šeimų sąjunga', color: '#881337', emblem: Home,
    leader: 'Valdemar Tomaševski', ideology: bi('Polish minority · Christian conservative', 'Lenkų mažuma · Krikščionys konservatoriai'), pos: { econ: -30, social: 90, defense: 0, green: -30 }, funds: 450,
    difficulty: 'hard', stars: 3,
    blurb: bi('The voice of the Polish minority around Vilnius.', 'Lenkų tautinės mažumos balsas Vilniaus krašte.'),
    perk: bi('Almost unbeatable at home, weak everywhere else.', 'Namuose beveik nenugalimi, kitur – silpni.'),
    strongholds: bi('Vilnius District and Šalčininkai', 'Vilniaus rajonas ir Šalčininkai'),
  },
  KITI: {
    id: 'KITI', short: 'Kiti', name: 'Kiti ir nepriklausomi', full: 'Mažosios partijos ir nepriklausomi kandidatai', color: '#64748B', emblem: Users,
    leader: '', ideology: bi('Fragmented', 'Įvairūs'), pos: { econ: -10, social: 30, defense: 30, green: 0 },
  },
};
const partyShort = (p) => (p === 'KITI' ? tt('Others', 'Kiti') : PARTIES[p].short);
const leaderSurname = (p) => {
  const n = PARTIES[p].leader;
  return n ? n.split(' ').slice(-1)[0] : '';
};
const DIFF_LABEL = { easy: bi('Easy', 'Lengva'), medium: bi('Medium', 'Vidutinė'), hard: bi('Hard', 'Sunki') };
const PARTY_IDS = ['LSDP', 'TS', 'NA', 'DSVL', 'LS', 'LVZS', 'LP', 'LLRA'];
const ALL_IDS = [...PARTY_IDS, 'KITI'];
const SEAT_ORDER = ['LSDP', 'DSVL', 'LVZS', 'NA', 'LLRA', 'KITI', 'LP', 'LS', 'TS'];
const WEEKS = 12;
const MAJORITY = 71;
const DEBATE_WEEKS = [4, 8, 11];
const VRK_LIMIT = 2300;
const FUND_MULT = { LSDP: 1, TS: 1.6, NA: 0.75, DSVL: 0.9, LS: 1.35, LVZS: 0.95, LP: 0.85, LLRA: 0.8 };
const BACKFIRE = { LSDP: 0.22, TS: 0.2, NA: 0.07, DSVL: 0.38, LS: 0.22, LVZS: 0.18, LP: 0.2, LLRA: 0.25 };
const FATIGUE = [1, 0.8, 0.62, 0.48, 0.38, 0.3];
// Late-2026 polling shift relative to the 2024 regional baselines below.
const BASE_SHIFT = { TS: 1.13, LSDP: 0.84, NA: 0.98, LVZS: 1.75, DSVL: 0.97, LS: 0.95, LP: 0.92, LLRA: 1, KITI: 0.86 };

/* ============================================================
   Policy axes, issues, voter groups
   ============================================================ */
const AXES = [
  { id: 'econ', icon: Coins, label: bi('Taxes & welfare', 'Mokesčiai ir parama'), left: bi('More welfare', 'Daugiau paramos'), right: bi('Lower taxes', 'Mažesni mokesčiai'),
    steps: [bi('Wealth tax', 'Turto mokestis'), bi('Progressive tax', 'Progresiniai mokesčiai'), bi('Social market', 'Socialinė rinka'), bi('Centrist', 'Centras'), bi('Pro-business', 'Verslui palanku'), bi('Tax cuts', 'Mažinti mokesčius'), bi('Flat & lean', 'Plokščias ir taupus')] },
  { id: 'social', icon: Users, label: bi('Family & values', 'Šeima ir vertybės'), left: bi('Modern', 'Modernu'), right: bi('Traditional', 'Tradiciška'),
    steps: [bi('Radical liberal', 'Radikaliai liberalu'), bi('Progressive', 'Progresyvu'), bi('Liberal', 'Liberalu'), bi('Centrist', 'Centras'), bi('Traditional', 'Tradiciška'), bi('Conservative', 'Konservatyvu'), bi('Family values', 'Šeimos vertybės')] },
  { id: 'defense', icon: Shield, label: bi('Defence spending', 'Krašto apsauga'), left: bi('Less', 'Mažiau'), right: bi('Maximum', 'Maksimaliai'),
    steps: [bi('2.5% GDP', '2,5 % BVP'), bi('3% GDP', '3 % BVP'), bi('3.5% GDP', '3,5 % BVP'), bi('4% GDP', '4 % BVP'), bi('5% GDP', '5 % BVP'), bi('5.5% GDP', '5,5 % BVP'), bi('6%+ GDP', '6 %+ BVP')] },
  { id: 'green', icon: Leaf, label: bi('Climate & energy', 'Klimatas ir energetika'), left: bi('Cheap gas', 'Pigios dujos'), right: bi('Go green fast', 'Greitai žalėti'),
    steps: [bi('Gas & oil first', 'Dujos ir nafta'), bi('Slow transition', 'Lėtas perėjimas'), bi('Energy security', 'Energetinis saugumas'), bi('Balanced', 'Pusiausvyra'), bi('Wind & solar', 'Vėjas ir saulė'), bi('Green deal+', 'Žaliasis kursas+'), bi('Net zero 2040', 'Neutralumas 2040')] },
];
const AXIS_IDS = AXES.map((a) => a.id);
const stepIndex = (v) => clamp(Math.round((v + 90) / 30), 0, 6);
const ISSUES = {
  col: { label: bi('Cost of living', 'Pragyvenimo kaina'), icon: Wallet },
  def: { label: bi('Defence & Belarus border', 'Gynyba ir Baltarusijos siena'), icon: Shield },
  roads: { label: bi('Roads & infrastructure', 'Keliai ir infrastruktūra'), icon: Truck },
  health: { label: bi('Healthcare access', 'Sveikatos paslaugos'), icon: HeartPulse },
  tax: { label: bi('Taxes', 'Mokesčiai'), icon: Coins },
  housing: { label: bi('Housing prices', 'Būsto kainos'), icon: Home },
  transit: { label: bi('Public transport', 'Viešasis transportas'), icon: TramFront },
  jobs: { label: bi('Jobs & investment', 'Darbo vietos ir investicijos'), icon: Factory },
  emig: { label: bi('Emigration', 'Emigracija'), icon: Plane },
  agri: { label: bi('Farm incomes', 'Ūkininkų pajamos'), icon: Tractor },
  energy: { label: bi('Energy prices', 'Energijos kainos'), icon: Zap },
  port: { label: bi('Port & logistics', 'Uostas ir logistika'), icon: Anchor },
  minority: { label: bi('Minority language rights', 'Tautinių mažumų teisės'), icon: Languages },
  diaspora: { label: bi('Dual citizenship', 'Dviguba pilietybė'), icon: Globe },
  pensions: { label: bi('Pensions', 'Pensijos'), icon: PiggyBank },
  trust: { label: bi('Trust in politicians', 'Pasitikėjimas politikais'), icon: Scale },
};
const GROUPS = [
  { id: 'seniors', icon: PiggyBank, name: bi('Pensioners', 'Senjorai'), ideal: { econ: -60, social: 50, defense: 30, green: -10 }, tags: ['welfare'] },
  { id: 'youth', icon: Smartphone, name: bi('Young people', 'Jaunimas'), ideal: { econ: 20, social: -60, defense: 50, green: 70 }, tags: ['youth', 'progressive', 'green'] },
  { id: 'farmers', icon: Tractor, name: bi('Farmers', 'Ūkininkai'), ideal: { econ: -20, social: 60, defense: 30, green: -50 }, tags: ['agri', 'traditional'] },
  { id: 'business', icon: Briefcase, name: bi('Business owners', 'Verslininkai'), ideal: { econ: 75, social: -10, defense: 70, green: 10 }, tags: ['business'] },
  { id: 'public', icon: GraduationCap, name: bi('Teachers & doctors', 'Mokytojai ir medikai'), ideal: { econ: -40, social: 0, defense: 40, green: 30 }, tags: ['welfare', 'moderate'] },
  { id: 'minority', icon: Languages, name: bi('Minorities', 'Tautinės mažumos'), ideal: { econ: -30, social: 40, defense: 0, green: -20 }, tags: ['minority'] },
];
function groupWeight(grp, r) {
  switch (grp) {
    case 'seniors': return 0.22 + 0.1 * (1 - r.urban);
    case 'youth': return 0.08 + 0.14 * r.urban;
    case 'farmers': return 0.16 * (1 - r.urban);
    case 'business': return 0.14 * r.urban;
    case 'public': return 0.18;
    case 'minority': return { VLC: 0.45, VNO: 0.25, KLP: 0.12, UTE: 0.18 }[r.id] || 0.03;
    default: return 0;
  }
}

/* ============================================================
   Regions & constituencies  [name, urbanity 0..1, special leans]
   ============================================================ */
const SAL_URBAN = { econ: 0.8, social: 1.1, defense: 1.15, green: 0.9 };
const SAL_RURAL = { econ: 1.2, social: 0.95, defense: 0.8, green: 0.7 };
const REGIONS = [
  {
    id: 'VNO', short: bi('Vilnius', 'Vilnius'), long: bi('Vilnius City', 'Vilniaus miestas'), seats: 15, pop: 605, urban: 0.97, turnout: 0.6,
    ideal: { econ: 25, social: -35, defense: 85, green: 55 }, sal: SAL_URBAN, issues: ['housing', 'def', 'transit'],
    base: { LSDP: 14, TS: 28, NA: 6, DSVL: 7, LS: 13, LVZS: 3, LP: 10, LLRA: 7, KITI: 12 }, count: 0.32,
    cons: [
      ['Naujamiesčio', 1, { LP: 1.7, TS: 1.2, LS: 1.25, NA: 0.6, LLRA: 0.4 }], ['Senamiesčio', 1, { LP: 1.6, TS: 1.25, LS: 1.3, NA: 0.6, LLRA: 0.5 }],
      ['Žvėryno', 1, { LP: 1.4, TS: 1.35, LS: 1.25, NA: 0.6, LLRA: 0.4 }], ['Antakalnio', 1, { TS: 1.3, LS: 1.1, LP: 1.2, LLRA: 0.5 }],
      ['Žirmūnų', 1, { LSDP: 1.1, LLRA: 0.8 }], ['Šnipiškių', 1, { LP: 1.2, LLRA: 1.0 }], ['Fabijoniškių', 1, { LSDP: 1.15, LLRA: 1.2, NA: 1.1 }],
      ['Šeškinės', 1, { LLRA: 1.3, LSDP: 1.1 }], ['Justiniškių', 1, { LSDP: 1.15, NA: 1.15, LLRA: 0.9 }], ['Pilaitės', 1, { TS: 1.15, LS: 1.15, LP: 1.1, LLRA: 0.6 }],
      ['Karoliniškių', 1, { LSDP: 1.1, LLRA: 0.9 }], ['Lazdynų', 1, { LSDP: 1.1, TS: 1.05, LLRA: 1.0 }], ['Naujininkų', 1, { LLRA: 2.3, LSDP: 1.1, LP: 0.7, TS: 0.85 }],
      ['Naujosios Vilnios', 1, { LLRA: 2.7, LSDP: 1.15, NA: 1.2, LP: 0.6, TS: 0.75 }], ['Verkių', 1, { LLRA: 1.6, TS: 1.05 }],
    ],
  },
  {
    id: 'VLC', short: bi('Vilnius area', 'Vilniaus apskr.'), long: bi('Vilnius County', 'Vilniaus apskritis'), seats: 7, pop: 260, urban: 0.32, turnout: 0.5,
    ideal: { econ: -20, social: 55, defense: 40, green: 0 }, sal: { econ: 1.1, social: 1.0, defense: 0.8, green: 0.6 }, issues: ['minority', 'roads', 'def'],
    base: { LSDP: 18, TS: 11, NA: 12, DSVL: 10, LS: 4, LVZS: 7, LP: 1.5, LLRA: 23, KITI: 13.5 }, count: 0,
    cons: [
      ['Šalčininkų', 0.1, { LLRA: 3.0, TS: 0.5, LS: 0.4, LP: 0.3 }], ['Medininkų', 0.3, { LLRA: 2.5, TS: 0.6, LP: 0.4 }], ['Nemenčinės', 0.3, { LLRA: 2.2, TS: 0.7 }],
      ['Trakų–Elektrėnų', 0.5, { LLRA: 0.6 }], ['Ukmergės', 0.4, { LLRA: 0.08, NA: 1.2, LSDP: 1.15 }], ['Širvintų', 0.2, { LLRA: 0.3, LVZS: 1.2 }], ['Švenčionių', 0.3, { LLRA: 0.9, LSDP: 1.1 }],
    ],
  },
  {
    id: 'KNS', short: bi('Kaunas', 'Kaunas'), long: bi('Kaunas City', 'Kauno miestas'), seats: 8, pop: 305, urban: 0.98, turnout: 0.57,
    ideal: { econ: 20, social: -10, defense: 75, green: 40 }, sal: SAL_URBAN, issues: ['jobs', 'housing', 'def'],
    base: { LSDP: 16, TS: 27, NA: 11, DSVL: 8, LS: 11, LVZS: 4, LP: 7, LLRA: 0.3, KITI: 15.7 }, count: 0.22,
    cons: [
      ['Centro', 1, { TS: 1.2, LP: 1.4, LS: 1.2, NA: 0.75 }], ['Kalniečių', 1, { LSDP: 1.1 }], ['Šilainių', 1, { NA: 1.15, LSDP: 1.1 }], ['Aleksoto–Vilijampolės', 1, { LSDP: 1.05 }],
      ['Dainavos', 1, { NA: 1.1, LSDP: 1.1 }], ['Petrašiūnų', 1, { LSDP: 1.15, NA: 1.15 }], ['Panemunės', 1, { TS: 1.15, LS: 1.1 }], ['Eigulių', 1, { LSDP: 1.05 }],
    ],
  },
  {
    id: 'KNC', short: bi('Kaunas area', 'Kauno apskr.'), long: bi('Kaunas County', 'Kauno apskritis'), seats: 7, pop: 275, urban: 0.38, turnout: 0.51,
    ideal: { econ: -15, social: 30, defense: 55, green: 15 }, sal: SAL_RURAL, issues: ['col', 'roads', 'health'],
    base: { LSDP: 23, TS: 17, NA: 16, DSVL: 12, LS: 6, LVZS: 9, LP: 2, LLRA: 0.3, KITI: 14.7 }, count: 0,
    cons: [['Kėdainių', 0.4, {}], ['Jonavos', 0.5, { LSDP: 1.2 }], ['Raseinių', 0, {}], ['Kaišiadorių', 0, {}], ['Garliavos', 0.3, {}], ['Karmėlavos', 0.3, {}], ['Prienų–Birštono', 0.2, {}]],
  },
  {
    id: 'KLP', short: bi('Klaipėda', 'Klaipėda'), long: bi('Klaipėda & Coast', 'Klaipėda ir pajūris'), seats: 8, pop: 330, urban: 0.7, turnout: 0.5,
    ideal: { econ: 15, social: 5, defense: 60, green: 20 }, sal: SAL_URBAN, issues: ['port', 'col', 'energy'],
    base: { LSDP: 19, TS: 15, NA: 18, DSVL: 9, LS: 11, LVZS: 6, LP: 3, LLRA: 0.3, KITI: 18.7 }, count: 0.12,
    cons: [['Baltijos', 1, {}], ['Danės', 1, {}], ['Marių', 1, {}], ['Palangos', 0.7, { LS: 1.15 }], ['Kretingos', 0.4, {}], ['Gargždų', 0.3, {}], ['Šilutės', 0.2, { NA: 1.1 }], ['Skuodo', 0, { NA: 1.15 }]],
  },
  {
    id: 'TEL', short: bi('Telšiai', 'Telšiai'), long: bi('Telšiai · Samogitia', 'Telšiai · Žemaitija'), seats: 3, pop: 125, urban: 0.45, turnout: 0.45,
    ideal: { econ: -20, social: 55, defense: 30, green: -35 }, sal: SAL_RURAL, issues: ['col', 'tax', 'trust'],
    base: { LSDP: 19, TS: 11, NA: 28, DSVL: 9, LS: 5, LVZS: 9, LP: 1.5, LLRA: 0.2, KITI: 17.3 }, count: 0,
    cons: [['Telšių', 0.4, {}], ['Mažeikių', 0.5, { NA: 1.1 }], ['Plungės', 0.3, {}]],
  },
  {
    id: 'TAU', short: bi('Tauragė', 'Tauragė'), long: bi('Tauragė', 'Tauragės apskritis'), seats: 2, pop: 90, urban: 0.38, turnout: 0.44,
    ideal: { econ: -30, social: 45, defense: 35, green: -15 }, sal: SAL_RURAL, issues: ['emig', 'roads', 'col'],
    base: { LSDP: 20, TS: 12, NA: 23, DSVL: 9, LS: 5, LVZS: 10, LP: 1.5, LLRA: 0.2, KITI: 19.3 }, count: 0,
    cons: [['Tauragės', 0.4, {}], ['Šilalės–Jurbarko', 0, {}]],
  },
  {
    id: 'SIA', short: bi('Šiauliai', 'Šiauliai'), long: bi('Šiauliai', 'Šiaulių apskritis'), seats: 6, pop: 260, urban: 0.55, turnout: 0.47,
    ideal: { econ: -30, social: 35, defense: 50, green: -5 }, sal: SAL_RURAL, issues: ['col', 'emig', 'health'],
    base: { LSDP: 24, TS: 13, NA: 19, DSVL: 10, LS: 6, LVZS: 9, LP: 1.8, LLRA: 0.2, KITI: 17 }, count: 0,
    cons: [['Saulės', 1, {}], ['Aušros', 1, {}], ['Radviliškio', 0.3, {}], ['Joniškio', 0.1, {}], ['Kelmės', 0, {}], ['Akmenės', 0.3, { LSDP: 1.2 }]],
  },
  {
    id: 'PAN', short: bi('Panevėžys', 'Panevėžys'), long: bi('Panevėžys', 'Panevėžio apskritis'), seats: 5, pop: 215, urban: 0.52, turnout: 0.48,
    ideal: { econ: -25, social: 35, defense: 50, green: 0 }, sal: SAL_RURAL, issues: ['jobs', 'col', 'roads'],
    base: { LSDP: 23, TS: 14, NA: 17, DSVL: 12, LS: 6, LVZS: 10, LP: 1.8, LLRA: 0.2, KITI: 16 }, count: 0,
    cons: [['Aukštaitijos', 1, {}], ['Nevėžio', 1, {}], ['Biržų–Pasvalio', 0.2, {}], ['Rokiškio', 0.2, {}], ['Kupiškio', 0.1, { LVZS: 1.15 }]],
  },
  {
    id: 'UTE', short: bi('Utena', 'Utena'), long: bi('Utena', 'Utenos apskritis'), seats: 3, pop: 125, urban: 0.5, turnout: 0.48,
    ideal: { econ: -30, social: 35, defense: 55, green: 10 }, sal: SAL_RURAL, issues: ['health', 'emig', 'energy'],
    base: { LSDP: 24, TS: 12, NA: 15, DSVL: 14, LS: 5, LVZS: 11, LP: 1.5, LLRA: 1.5, KITI: 16 }, count: 0,
    cons: [['Utenos', 0.5, {}], ['Anykščių–Molėtų', 0.1, {}], ['Zarasų–Visagino', 0.5, { LLRA: 2.0, LSDP: 1.1 }]],
  },
  {
    id: 'ALY', short: bi('Alytus', 'Alytus'), long: bi('Alytus · Dzūkija', 'Alytus · Dzūkija'), seats: 3, pop: 135, urban: 0.5, turnout: 0.47,
    ideal: { econ: -35, social: 30, defense: 50, green: 5 }, sal: SAL_RURAL, issues: ['pensions', 'health', 'def'],
    base: { LSDP: 28, TS: 13, NA: 14, DSVL: 11, LS: 5, LVZS: 9, LP: 1.5, LLRA: 0.5, KITI: 18 }, count: 0,
    cons: [['Alytaus', 0.8, { LSDP: 1.1 }], ['Dzūkijos', 0.3, {}], ['Lazdijų', 0, {}]],
  },
  {
    id: 'MAR', short: bi('Marijampolė', 'Marijampolė'), long: bi('Marijampolė · Suvalkija', 'Marijampolė · Suvalkija'), seats: 3, pop: 135, urban: 0.42, turnout: 0.46,
    ideal: { econ: -25, social: 45, defense: 40, green: -10 }, sal: SAL_RURAL, issues: ['agri', 'roads', 'emig'],
    base: { LSDP: 21, TS: 13, NA: 16, DSVL: 10, LS: 5, LVZS: 15, LP: 1.5, LLRA: 0.2, KITI: 18.3 }, count: 0,
    cons: [['Marijampolės', 0.6, {}], ['Vilkaviškio', 0.2, { LVZS: 1.1 }], ['Šakių', 0, {}]],
  },
  {
    id: 'ABR', short: bi('Abroad', 'Užsienis'), long: bi('Lithuanians abroad', 'Užsienio lietuviai'), seats: 1, pop: 62, voters: 62, urban: 0.9, turnout: 0.6,
    ideal: { econ: 35, social: -30, defense: 90, green: 45 }, sal: SAL_URBAN, issues: ['diaspora', 'def', 'tax'],
    base: { LSDP: 9, TS: 35, NA: 7, DSVL: 6, LS: 17, LVZS: 2, LP: 13, LLRA: 0.5, KITI: 10.5 }, count: 0.45,
    cons: [['Pasaulio lietuvių', 1, {}]],
  },
];
REGIONS.forEach((r) => {
  if (!r.voters) r.voters = Math.round(r.pop * 0.82);
  ALL_IDS.forEach((p) => { r.base[p] *= BASE_SHIFT[p]; });
});
const REG = Object.fromEntries(REGIONS.map((r) => [r.id, r]));
const rs = (r) => L((typeof r === 'string' ? REG[r] : r).short);
const rl = (r) => L((typeof r === 'string' ? REG[r] : r).long);
const consName = (name) => tt(`${name} district`, `${name} apygarda`);
const TOTAL_VOTERS = sum(REGIONS.map((r) => r.voters));
const AXIS_MEAN = Object.fromEntries(AXIS_IDS.map((a) => [a, sum(REGIONS.map((r) => r.ideal[a] * r.voters)) / TOTAL_VOTERS]));
const URB_SENS = { LSDP: -0.15, TS: 0.5, NA: -0.5, DSVL: -0.1, LS: 0.6, LVZS: -0.7, LP: 1.0, LLRA: 0, KITI: -0.1 };
const LEAN_SIGMA = { KITI: 0.32, LLRA: 0.15 };
const consById = (cid) => {
  const [rid, i] = cid.split('-');
  return REG[rid].cons[Number(i)];
};

/* ============================================================
   Actions
   ============================================================ */
const ACTIONS = {
  rally: { icon: Megaphone, color: '#FDB913', label: bi('Hold a rally', 'Surengti mitingą'), short: bi('rally', 'mitingas'), desc: bi('Win fans and get them to vote', 'Uždegti rėmėjus ir atvesti juos balsuoti') },
  digital: { icon: Smartphone, color: '#7DD3FC', label: bi('Online ads', 'Reklama internete'), short: bi('online ads', 'reklama internete'), desc: bi('Best in cities, with young voters', 'Geriausia miestuose, tarp jaunimo') },
  tv: { icon: Radio, color: '#C4B5FD', label: bi('TV & radio ads', 'TV ir radijo reklama'), short: bi('TV ads', 'TV reklama'), desc: bi('Best in villages, with older voters', 'Geriausia kaimuose, tarp vyresnių') },
  door: { icon: DoorOpen, color: '#86EFAC', label: bi('Knock on doors', 'Agituoti nuo durų iki durų'), short: bi('door-knocking', 'agitacija'), desc: bi('Protects your voters for good', 'Ilgam apsaugo jūsų rinkėjus') },
  star: { icon: Star, color: '#FDE68A', label: bi('Star candidate', 'Žinomas kandidatas'), short: bi('star candidate', 'žinomas kandidatas'), desc: bi('A famous face boosts one local district', 'Žinomas veidas sustiprina vieną apygardą') },
  attack: { icon: Swords, color: '#FCA5A5', label: bi('Attack ad', 'Puolamoji reklama'), short: bi('attack ad', 'puolamoji reklama'), desc: bi('Hurts the leader, but can backfire', 'Smogia lyderiui, bet gali atsisukti prieš jus') },
};
const STAR_PEOPLE = [
  bi('a former basketball star', 'buvusi krepšinio žvaigždė'), bi('a popular local mayor', 'populiarus vietos meras'), bi('a well-known doctor', 'žinoma gydytoja'),
  bi('a TV quiz host', 'TV viktorinos vedėjas'), bi('an Olympic rower', 'olimpinė irkluotoja'), bi('a farmers’ union leader', 'ūkininkų sąjungos vadovas'),
  bi('a celebrity chef', 'garsus virtuvės šefas'), bi('a beloved headteacher', 'mylima mokyklos direktorė'),
];
const NATIONAL_ACTIONS = [
  { id: 'gala', group: 'fund', icon: HandCoins, ap: 1, label: bi('Donor dinner', 'Rėmėjų vakarienė'), desc: bi('Big donors, fancy restaurant, lots of money.', 'Stambūs rėmėjai, prabangus restoranas, daug pinigų.') },
  { id: 'small', group: 'fund', icon: Coins, ap: 1, label: bi('Small donations', 'Smulkios aukos'), desc: bi('Ask fans for €5 each. Less money, but some buzz.', 'Paprašyti rėmėjų po 5 €. Mažiau pinigų, bet daugiau pagreičio.') },
  { id: 'lobby', group: 'fund', icon: Briefcase, ap: 0, pc: 2, label: bi('Shady business deal', 'Abejotinas verslo sandoris'), desc: bi('Swap 2 favours for a big cheque. Could turn into a scandal!', 'Iškeisti 2 ryšius į didelį čekį. Gali kilti skandalas!') },
  { id: 'tvspot', group: 'nat', icon: Tv, ap: 2, cost: 200, label: bi('Nationwide TV ad', 'Nacionalinė TV reklama'), desc: bi('A small boost in every region at once.', 'Nedidelis postūmis visuose regionuose iš karto.') },
  { id: 'presser', group: 'nat', icon: Mic, ap: 1, cost: 5, label: bi('Press conference', 'Spaudos konferencija'), desc: bi('Get in the news. Adds buzz, less each time.', 'Patekti į žinias. Didina pagreitį, kaskart mažiau.') },
  { id: 'backchannel', group: 'nat', icon: Handshake, ap: 1, cost: 0, label: bi('Coffee with rivals', 'Kava su varžovais'), desc: bi('Earn favours to spend on building a team after the vote.', 'Užsitarnauti ryšių, kurių prireiks formuojant koaliciją.') },
  { id: 'kompro', group: 'nat', icon: Search, ap: 1, cost: 60, label: bi('Dig up dirt', 'Ieškoti kompromato'), desc: bi('Pay investigators to find dirt on a rival. Might blow up in your face.', 'Samdyti tyrėjus ieškoti kompromato apie varžovą. Gali atsisukti prieš jus.') },
];
const WEATHER = {
  sun: { icon: Sun, name: bi('Sunny', 'Saulėta'), note: bi('High turnout everywhere.', 'Aktyvumas didelis visur.'), urban: 1.02, rural: 1.03 },
  cloud: { icon: Cloud, name: bi('Cloudy', 'Debesuota'), note: bi('A normal voting day.', 'Įprasta rinkimų diena.'), urban: 1, rural: 1 },
  rain: { icon: CloudRain, name: bi('Pouring rain', 'Liūtis'), note: bi('Village turnout drops.', 'Kaimuose balsuoja mažiau.'), urban: 0.99, rural: 0.94 },
};

/* ============================================================
   Coalition data
   ============================================================ */
const MINISTRIES = {
  fin: bi('Finance', 'Finansų'), mfa: bi('Foreign Affairs', 'Užsienio reikalų'), def: bi('National Defence', 'Krašto apsaugos'), int: bi('Interior', 'Vidaus reikalų'),
  eco: bi('Economy & Innovation', 'Ekonomikos ir inovacijų'), soc: bi('Social Security & Labour', 'Socialinės apsaugos ir darbo'), hea: bi('Health', 'Sveikatos apsaugos'),
  edu: bi('Education, Science & Sport', 'Švietimo, mokslo ir sporto'), jus: bi('Justice', 'Teisingumo'), env: bi('Environment', 'Aplinkos'), ene: bi('Energy', 'Energetikos'),
  agr: bi('Agriculture', 'Žemės ūkio'), tra: bi('Transport', 'Susisiekimo'), cul: bi('Culture', 'Kultūros'),
};
const MINISTRY_IDS = Object.keys(MINISTRIES);
const MIN_PREF = {
  LSDP: ['fin', 'soc', 'hea', 'int'], TS: ['mfa', 'def', 'fin', 'ene'], NA: ['int', 'env', 'jus', 'agr'], DSVL: ['env', 'hea', 'ene', 'edu'],
  LS: ['eco', 'jus', 'tra', 'edu'], LVZS: ['agr', 'hea', 'cul', 'edu'], LP: ['jus', 'cul', 'edu', 'eco'], LLRA: ['ene', 'tra', 'cul'],
};
const DEMANDS = {
  LSDP: { text: bi('Progressive income tax and pension indexation', 'Progresiniai pajamų mokesčiai ir pensijų indeksavimas'), axis: ['econ', -1] },
  TS: { text: bi('Defence spending of 5% of GDP written into law', '5 % BVP krašto apsaugai, įtvirtinta įstatyme'), axis: ['defense', 1] },
  NA: { text: bi('VAT cut on food and a heating price freeze', 'Mažesnis PVM maistui ir šildymo kainų įšaldymas'), axis: ['econ', -1] },
  DSVL: { text: bi('Green energy investment and a regional healthcare guarantee', 'Žaliosios energetikos investicijos ir sveikatos paslaugos regionuose'), axis: ['green', 1] },
  LS: { text: bi('Civil partnership law and lower labour taxes', 'Partnerystės įstatymas ir mažesni darbo mokesčiai'), axis: ['social', -1] },
  LVZS: { text: bi('Farm support package and strict alcohol control', 'Žemės ūkio paramos paketas ir griežta alkoholio kontrolė'), axis: ['social', 1] },
  LP: { text: bi('Civil partnership and cannabis decriminalisation', 'Partnerystė ir kanapių dekriminalizavimas'), axis: ['social', -1] },
  LLRA: { text: bi('Minority-language schools and original-spelling surnames', 'Tautinių mažumų mokyklos ir originali pavardžių rašyba'), axis: null },
  KITI: { text: bi('Local projects in their districts', 'Vietiniai projektai jų apygardose'), axis: null },
};
const AFFINITY = {
  'NA|TS': -35, 'LS|NA': -40, 'LP|NA': -50, 'DSVL|NA': -10, 'LSDP|NA': 10, 'LVZS|NA': 10, 'LLRA|LP': -35, 'LP|LVZS': -30,
  'LS|LVZS': -15, 'LVZS|TS': -10, 'LLRA|LS': -15, 'LSDP|LVZS': 10, 'LS|TS': 10, 'LP|TS': 5, 'DSVL|LSDP': 5, 'LLRA|TS': 5, 'LLRA|LSDP': 5,
};
const SEIMAS_2024 = { LSDP: 52, TS: 28, NA: 20, DSVL: 14, LS: 12, LVZS: 8, LLRA: 3, KITI: 4 };

/* ============================================================
   News events (three choices each). Fictional; no real person is named.
   ============================================================ */
const EVENTS = [
  {
    id: 'energy', cat: bi('Economy', 'Ekonomika'), icon: Zap,
    title: bi('Heating bills set to jump 30% this winter', 'Šildymo sąskaitos šią žiemą šoktels 30 %'),
    body: bi('Gas prices spike after a pipeline outage in the region. District heating companies in Šiauliai, Panevėžys and Utena warn of record bills.', 'Po dujotiekio avarijos regione kainos šoktelėjo. Šiaulių, Panevėžio ir Utenos šilumos tiekėjai įspėja apie rekordines sąskaitas.'),
    choices: [
      { label: bi('Demand a VAT cut on heating', 'Reikalauti mažinti PVM šildymui'), tag: 'welfare', fx: { reg: [['rural', 1.5], ['urban', 0.3]], pc: -1, axis: ['econ', -1, 0.5] } },
      { label: bi('Fast-track solar and wind subsidies', 'Paspartinti saulės ir vėjo energijos subsidijas'), tag: 'green', fx: { reg: [['urban', 1.3], ['rural', -0.4]], axis: ['green', 1, 0.7], mom: 0.4 } },
      { label: bi('Blame the government’s energy policy', 'Kaltinti Vyriausybės energetikos politiką'), tag: 'populist', fx: { mom: 1.2, und: 0.5, pc: -1 } },
    ],
  },
  {
    id: 'border', cat: bi('Security', 'Saugumas'), icon: ShieldAlert,
    title: bi('Smuggling balloons from Belarus shut Vilnius Airport again', 'Kontrabandos balionai iš Baltarusijos vėl uždarė Vilniaus oro uostą'),
    body: bi('For the third night this month, contraband balloons drift across the border and flights are grounded. Residents of Šalčininkai and Druskininkai demand action.', 'Jau trečią naktį šį mėnesį per sieną skrenda kontrabandos balionai, skrydžiai stabdomi. Šalčininkų ir Druskininkų gyventojai reikalauja veiksmų.'),
    choices: [
      { label: bi('Close the Belarus border completely', 'Visiškai uždaryti sieną su Baltarusija'), tag: 'security', fx: { reg: [['border', 1.4]], axis: ['defense', 1, 0.9], mom: 0.6 } },
      { label: bi('Coordinate an EU and NATO response', 'Koordinuoti ES ir NATO atsaką'), tag: 'moderate', fx: { pc: 1, mom: 0.3, reg: [['urban', 0.6]] } },
      { label: bi('Accuse the government of sleeping on the job', 'Kaltinti Vyriausybę, kad pramiegojo grėsmę'), tag: 'populist', fx: { mom: 1.1, reg: [['rural', 0.6]], pc: -1 } },
    ],
  },
  {
    id: 'leak', cat: bi('Scandal', 'Skandalas'), icon: Mail,
    title: bi('Leaked ministry emails hint at procurement favours', 'Nutekinti ministerijos laiškai rodo galimą protegavimą pirkimuose'),
    body: bi('An investigative portal publishes emails suggesting a ministry steered a €40M IT contract. No party is named yet.', 'Tiriamosios žurnalistikos portalas paskelbė laiškus, iš kurių matyti, kad ministerija galėjo „pritempti“ 40 mln. eurų IT pirkimą. Partijos kol kas neįvardijamos.'),
    choices: [
      { label: bi('Demand an STT anti-corruption probe', 'Reikalauti STT tyrimo'), tag: 'populist', fx: { mom: 1, pc: 1 } },
      { label: bi('Publish your own party’s procurement records', 'Paskelbti savo partijos pirkimų dokumentus'), tag: 'moderate', fx: { money: -20, pc: 2, reg: [['urban', 0.8]], mom: 0.4 } },
      { label: bi('Stay quiet: one of the firms is a donor', 'Patylėti – viena iš įmonių yra jūsų rėmėja'), tag: null, fx: { money: 90, scandal: 10, mom: -0.4 } },
    ],
  },
  {
    id: 'tractors', cat: bi('Agriculture', 'Žemės ūkis'), icon: Tractor,
    title: bi('400 tractors roll into Vilnius over EU green rules', '400 traktorių įriedėjo į Vilnių protestuoti prieš ES žaliąsias taisykles'),
    body: bi('Farmers from Suvalkija and Aukštaitija block Gedimino prospektas, protesting fertiliser limits and low purchase prices for milk and grain.', 'Suvalkijos ir Aukštaitijos ūkininkai blokuoja Gedimino prospektą – piktinasi trąšų ribojimais ir mažomis pieno bei grūdų supirkimo kainomis.'),
    choices: [
      { label: bi('Join the farmers on Gedimino prospektas', 'Prisijungti prie ūkininkų Gedimino prospekte'), tag: 'agri', fx: { reg: [['agri', 1.8], ['VNO', -1.0]], axis: ['green', -1, 0.5], groups: { farmers: 6, youth: -3 } } },
      { label: bi('Propose a €50M transition fund', 'Pasiūlyti 50 mln. eurų pereinamąjį fondą'), tag: 'moderate', fx: { money: -30, reg: [['rural', 0.9]], pc: 1, groups: { farmers: 3 } } },
      { label: bi('Back the green rules: climate can’t wait', 'Palaikyti žaliąsias taisykles – klimatas nelauks'), tag: 'green', fx: { reg: [['urban', 1.1], ['agri', -1.5]], axis: ['green', 1, 0.5], groups: { farmers: -7, youth: 4 } } },
    ],
  },
  {
    id: 'eurobarometer', cat: bi('Economy', 'Ekonomika'), icon: BarChart3,
    title: bi('Eurobarometer: inflation is Lithuanians’ No. 1 worry', 'Eurobarometras: infliacija – didžiausias lietuvių rūpestis'),
    body: bi('58% of Lithuanians name rising prices as their top concern, the highest share in the Baltics. Food prices are up 9% on the year.', '58 % lietuvių kylančias kainas įvardija kaip didžiausią problemą – daugiausia Baltijos šalyse. Maistas per metus pabrango 9 %.'),
    choices: [
      { label: bi('Pledge to index pensions and raise the minimum wage', 'Pažadėti indeksuoti pensijas ir didinti MMA'), tag: 'welfare', fx: { reg: [['rural', 1.4]], axis: ['econ', -1, 0.6], pc: -1, groups: { seniors: 5, business: -3 } } },
      { label: bi('Promise tax cuts for working families', 'Pažadėti mažinti mokesčius dirbančioms šeimoms'), tag: 'business', fx: { reg: [['urban', 1.1]], axis: ['econ', 1, 0.6] } },
      { label: bi('Publish a costed anti-inflation plan', 'Pristatyti apskaičiuotą kovos su infliacija planą'), tag: 'moderate', fx: { pc: 2, und: 0.6, mom: 0.3 } },
    ],
  },
  {
    id: 'teachers', cat: bi('Education', 'Švietimas'), icon: GraduationCap,
    title: bi('Teachers’ union announces a national strike', 'Mokytojų profesinė sąjunga skelbia nacionalinį streiką'),
    body: bi('Schools in Kaunas and Klaipėda will close on Monday as teachers demand a 15% raise and smaller classes.', 'Pirmadienį Kauno ir Klaipėdos mokyklos užsidarys – mokytojai reikalauja 15 % didesnių algų ir mažesnių klasių.'),
    choices: [
      { label: bi('Stand with the teachers', 'Palaikyti mokytojus'), tag: 'welfare', fx: { reg: [['all', 0.6]], pc: -1, axis: ['econ', -1, 0.3], groups: { public: 6 } } },
      { label: bi('Offer pay-for-performance reform', 'Pasiūlyti atlyginimą pagal rezultatus'), tag: 'business', fx: { reg: [['urban', 0.8], ['rural', -0.4]], groups: { public: -5, business: 3 } } },
      { label: bi('Call for mediation and calm', 'Raginti tartis ir nurimti'), tag: 'moderate', fx: { pc: 1, mom: 0.2 } },
    ],
  },
  {
    id: 'hospitals', cat: bi('Health', 'Sveikata'), icon: HeartPulse,
    title: bi('Ministry plans to close maternity wards in nine district hospitals', 'Ministerija planuoja uždaryti gimdymo skyrius devyniose rajonų ligoninėse'),
    body: bi('Hospitals in Ignalina, Šilalė, Lazdijai and six other towns would lose services under the consolidation plan.', 'Pagal pertvarkos planą paslaugų netektų Ignalinos, Šilalės, Lazdijų ir dar šešių miestų ligoninės.'),
    choices: [
      { label: bi('Promise every district hospital stays open', 'Pažadėti, kad visos rajonų ligoninės liks'), tag: 'welfare', fx: { reg: [['rural', 1.6]], pc: -1, groups: { seniors: 4 } } },
      { label: bi('Back consolidation and fund new ambulances', 'Palaikyti pertvarką ir finansuoti naujus greitosios automobilius'), tag: 'moderate', fx: { reg: [['urban', 0.6], ['rural', -0.8]], pc: 1 } },
      { label: bi('Tour the affected towns', 'Apvažiuoti paveiktus miestelius'), tag: null, fx: { money: -40, reg: [['UTE', 2], ['TAU', 2], ['ALY', 2]] } },
    ],
  },
  {
    id: 'rail', cat: bi('Infrastructure', 'Infrastruktūra'), icon: TrainFront,
    title: bi('Rail Baltica delayed again: Kaunas–Vilnius line slips to 2032', '„Rail Baltica“ vėl vėluoja: Kauno–Vilniaus atkarpa nukelta į 2032-uosius'),
    body: bi('The EU’s flagship rail project faces cost overruns. Contractors blame land disputes near Jonava.', 'ES flagmaniniam geležinkelio projektui trūksta pinigų. Rangovai kaltina žemės ginčus prie Jonavos.'),
    choices: [
      { label: bi('Pledge to fast-track it with EU money', 'Pažadėti paspartinti statybas ES lėšomis'), tag: 'business', fx: { reg: [['KNS', 1.2], ['KNC', 1], ['VNO', 0.8], ['PAN', 0.6]] } },
      { label: bi('Redirect the money to regional roads', 'Pinigus nukreipti regionų keliams'), tag: 'populist', fx: { reg: [['rural', 1.1], ['urban', -0.5]] } },
      { label: bi('Demand a full audit of the contractors', 'Reikalauti rangovų audito'), tag: 'moderate', fx: { pc: 1, mom: 0.5 } },
    ],
  },
  {
    id: 'brigade', cat: bi('Security', 'Saugumas'), icon: Shield,
    title: bi('German brigade base expands at Rūdninkai, landowners protest', 'Vokietijos brigados bazė Rūdninkuose plečiasi, žemės savininkai protestuoja'),
    body: bi('NATO’s new brigade needs more training ground. Farmers in Šalčininkai district say the compensation offered is too low.', 'NATO brigadai reikia daugiau poligono ploto. Šalčininkų rajono ūkininkai sako, kad siūloma kompensacija per maža.'),
    choices: [
      { label: bi('Champion the brigade: security first', 'Palaikyti brigadą: saugumas svarbiausia'), tag: 'security', fx: { axis: ['defense', 1, 1], reg: [['VNO', 0.8]] } },
      { label: bi('Demand fair compensation for landowners', 'Reikalauti teisingos kompensacijos savininkams'), tag: 'welfare', fx: { reg: [['VLC', 1.6], ['rural', 0.4]], groups: { farmers: 3, minority: 3 } } },
      { label: bi('Question the cost of the deployment', 'Abejoti dislokavimo kaina'), tag: 'populist', fx: { axis: ['defense', -1, 0.8], reg: [['rural', 0.5]], mom: -0.3 } },
    ],
  },
  {
    id: 'emigration', cat: bi('Society', 'Visuomenė'), icon: Plane,
    title: bi('15,000 young people left the regions this year', 'Šiemet regionus paliko 15 000 jaunų žmonių'),
    body: bi('New figures from Statistics Lithuania show Utena, Tauragė and Šiauliai counties losing residents fastest.', 'Naujausi Statistikos departamento duomenys rodo, kad sparčiausiai gyventojų netenka Utenos, Tauragės ir Šiaulių apskritys.'),
    choices: [
      { label: bi('A regional jobs fund for Šiauliai, Panevėžys and Utena', 'Regionų darbo vietų fondas Šiauliams, Panevėžiui ir Utenai'), tag: 'welfare', fx: { reg: [['SIA', 1.4], ['PAN', 1.4], ['UTE', 1.4]] } },
      { label: bi('Startup visas and remote-work hubs', 'Startuolių vizos ir nuotolinio darbo centrai'), tag: 'youth', fx: { reg: [['urban', 0.9], ['ABR', 2]] } },
      { label: bi('Blame Brussels and the big-city elites', 'Kaltinti Briuselį ir didmiesčių elitą'), tag: 'populist', fx: { reg: [['rural', 1.3], ['urban', -1]], mom: 0.4 } },
    ],
  },
  {
    id: 'port', cat: bi('Economy', 'Ekonomika'), icon: Anchor,
    title: bi('Klaipėda port cargo falls 12% after sanctions and storms', 'Klaipėdos uosto krova po sankcijų ir audrų smuko 12 %'),
    body: bi('Stevedoring companies warn of layoffs. Klaipėda’s mayor wants a national rescue plan before winter.', 'Krovos bendrovės įspėja apie atleidimus. Klaipėdos meras prašo nacionalinio gelbėjimo plano dar iki žiemos.'),
    choices: [
      { label: bi('Pledge LNG and port expansion', 'Pažadėti SGD ir uosto plėtrą'), tag: 'business', fx: { reg: [['KLP', 2.2]], axis: ['green', -1, 0.3] } },
      { label: bi('Make Klaipėda an offshore wind hub', 'Paversti Klaipėdą jūros vėjo energetikos centru'), tag: 'green', fx: { reg: [['KLP', 1.4], ['urban', 0.4]], axis: ['green', 1, 0.4] } },
      { label: bi('Stay on your national message', 'Laikytis savo nacionalinės žinios'), tag: null, fx: { pc: 1 } },
    ],
  },
  {
    id: 'cyber', cat: bi('Security', 'Saugumas'), icon: AlertTriangle,
    title: bi('Cyberattack takes down government e-services for two days', 'Kibernetinė ataka dviem dienoms išjungė valstybės e. paslaugas'),
    body: bi('Tax filings, e-health and the Sodra portal go dark. Investigators point to a pro-Kremlin hacker group.', 'Neveikė mokesčių deklaravimas, e. sveikata ir „Sodros“ portalas. Tyrėjai įtaria prokremlišką hakerių grupę.'),
    choices: [
      { label: bi('Propose a national cyber command', 'Siūlyti nacionalinę kibernetinę vadovybę'), tag: 'security', fx: { axis: ['defense', 1, 0.6], reg: [['urban', 0.8]], pc: 1 } },
      { label: bi('Demand new EU sanctions on Russia', 'Reikalauti naujų ES sankcijų Rusijai'), tag: 'moderate', fx: { mom: 0.6, reg: [['VNO', 0.6], ['KNS', 0.4]] } },
      { label: bi('Slam the government’s IT incompetence', 'Kritikuoti Vyriausybės IT nekompetenciją'), tag: 'populist', fx: { mom: 1.1, pc: -1 } },
    ],
  },
  {
    id: 'language', cat: bi('Minorities', 'Tautinės mažumos'), icon: Languages,
    title: bi('Seimas clashes over bilingual street signs in Vilnius District', 'Seime ginčai dėl dvikalbių gatvių lentelių Vilniaus rajone'),
    body: bi('A bill would allow Polish-language street names alongside Lithuanian ones where minorities are a majority.', 'Įstatymo projektas leistų greta lietuviškų rašyti ir lenkiškus gatvių pavadinimus ten, kur dauguma gyventojų – tautinė mažuma.'),
    choices: [
      { label: bi('Support bilingual signs', 'Palaikyti dvikalbes lenteles'), tag: 'minority', fx: { reg: [['VLC', 2.4], ['VNO', 0.4], ['rural', -0.5]], groups: { minority: 8 } } },
      { label: bi('Oppose: one state language', 'Prieštarauti: viena valstybinė kalba'), tag: 'traditional', fx: { reg: [['rural', 0.8], ['VLC', -2.4]], groups: { minority: -8 } } },
      { label: bi('Propose an expert commission', 'Siūlyti ekspertų komisiją'), tag: 'moderate', fx: { pc: 1 } },
    ],
  },
  {
    id: 'basketball', cat: bi('Sport', 'Sportas'), icon: Trophy,
    title: bi('Lithuania reaches the EuroBasket semi-final!', 'Lietuva – Europos krepšinio čempionato pusfinalyje!'),
    body: bi('The whole country is wearing green. Kaunas’ Žalgirio Arena is hosting a public screening for 15,000 fans.', 'Visa šalis pasipuošė žaliai. Kauno „Žalgirio“ arenoje rengiama transliacija 15 000 sirgalių.'),
    choices: [
      { label: bi('Host a fan zone in Kaunas', 'Surengti sirgalių zoną Kaune'), tag: 'populist', fx: { money: -30, reg: [['KNS', 1.3], ['KNC', 0.6]] } },
      { label: bi('Post a celebration video', 'Paskelbti šventinį vaizdo įrašą'), tag: 'youth', fx: { mom: 0.6, reg: [['urban', 0.4]] } },
      { label: bi('Stay focused on policy', 'Likti prie politikos'), tag: null, fx: { pc: 1 } },
    ],
  },
  {
    id: 'pensions', cat: bi('Welfare', 'Socialinė apsauga'), icon: PiggyBank,
    title: bi('Sodra warns of a pension fund gap by 2035', '„Sodra“ įspėja: iki 2035 m. pensijų fonde atsivers skylė'),
    body: bi('The social insurance fund projects a €1.2bn annual shortfall as the population ages and young workers emigrate.', 'Socialinio draudimo fondas prognozuoja 1,2 mlrd. eurų metinį trūkumą – visuomenė sensta, jauni dirbantieji emigruoja.'),
    choices: [
      { label: bi('Guarantee pensions with higher employer contributions', 'Garantuoti pensijas didinant darbdavių įmokas'), tag: 'welfare', fx: { reg: [['rural', 1.3], ['urban', -0.4]], axis: ['econ', -1, 0.5], groups: { seniors: 6, business: -4 } } },
      { label: bi('Raise the retirement age gradually', 'Palaipsniui didinti pensinį amžių'), tag: 'business', fx: { reg: [['urban', 0.5], ['rural', -1.2]], pc: 2, groups: { seniors: -8, business: 3 } } },
      { label: bi('Promise no age hike and no tax hike', 'Pažadėti: nei amžiaus, nei mokesčių didinimo'), tag: 'populist', fx: { und: 0.8, mom: 0.4, pc: -2 } },
    ],
  },
  {
    id: 'taxes', cat: bi('Economy', 'Ekonomika'), icon: Coins,
    title: bi('Finance ministry floats a property tax on second homes', 'Finansų ministerija svarsto mokestį antriesiems būstams'),
    body: bi('Economists call it fair. Homeowners in Vilnius and on the coast are furious.', 'Ekonomistai sako, kad tai teisinga. Vilniaus ir pajūrio būstų savininkai įsiutę.'),
    choices: [
      { label: bi('Back it: wealth should pay its share', 'Palaikyti: turtingieji turi prisidėti'), tag: 'welfare', fx: { reg: [['rural', 1.0], ['urban', -0.8]], axis: ['econ', -1, 0.5], money: -40, groups: { business: -5 } } },
      { label: bi('Oppose it: hands off family homes', 'Prieštarauti: rankas šalin nuo šeimų namų'), tag: 'business', fx: { reg: [['urban', 0.9], ['KLP', 0.6]], axis: ['econ', 1, 0.5], money: 60, groups: { business: 5 } } },
      { label: bi('Propose a narrow luxury tax instead', 'Siūlyti siaurą prabangos mokestį'), tag: 'moderate', fx: { pc: 1, und: 0.4 } },
    ],
  },
  {
    id: 'festival', cat: bi('Culture', 'Kultūra'), icon: Music,
    title: bi('A chart-topping singer wants to endorse you in Palanga', 'Populiarus atlikėjas nori jus paremti koncerte Palangoje'),
    body: bi('Fifty thousand fans, one stage at the summer festival, and a lot of phone cameras.', 'Penkiasdešimt tūkstančių gerbėjų, viena vasaros festivalio scena ir daugybė telefonų kamerų.'),
    choices: [
      { label: bi('Join them on stage', 'Užlipti kartu ant scenos'), tag: 'youth', fx: { reg: [['KLP', 1.3], ['urban', 0.5]], money: -15, groups: { youth: 5 } } },
      { label: bi('Film a short video together', 'Nufilmuoti trumpą vaizdo įrašą kartu'), tag: 'youth', fx: { reg: [['urban', 0.8]], mom: 0.3, groups: { youth: 3 } } },
      { label: bi('Politely decline', 'Mandagiai atsisakyti'), tag: null, fx: { pc: 1 } },
    ],
  },
  {
    id: 'partnership', cat: bi('Values', 'Vertybės'), icon: Users,
    title: bi('Court ruling reopens the civil partnership debate', 'Teismo sprendimas vėl atvėrė partnerystės diskusiją'),
    body: bi('The Constitutional Court says same-sex couples must have legal recognition. The Seimas has to act, and every party has to answer.', 'Konstitucinis Teismas sako, kad tos pačios lyties poros turi gauti teisinį pripažinimą. Seimas turi veikti, o kiekviena partija – atsakyti.'),
    choices: [
      { label: bi('Pledge a full civil partnership law', 'Pažadėti visavertį partnerystės įstatymą'), tag: 'progressive', fx: { reg: [['urban', 1.0], ['rural', -1.0]], axis: ['social', -1, 0.7], groups: { youth: 5, seniors: -3 } } },
      { label: bi('Offer a narrow cohabitation agreement', 'Siūlyti siaurą bendro gyvenimo sutartį'), tag: 'moderate', fx: { pc: 1, und: 0.3 } },
      { label: bi('Defend the traditional family', 'Ginti tradicinę šeimą'), tag: 'traditional', fx: { reg: [['rural', 1.0], ['urban', -0.9]], axis: ['social', 1, 0.7], groups: { seniors: 3, youth: -5 } } },
    ],
  },
  {
    id: 'president', cat: bi('Politics', 'Politika'), icon: Landmark,
    title: bi('The President warns parties against unaffordable promises', 'Prezidentas perspėja partijas dėl neįgyvendinamų pažadų'),
    body: bi('In a televised address, the head of state says campaign pledges add up to billions the budget does not have.', 'Televizijos kreipimesi valstybės vadovas sako, kad rinkimų pažadai siekia milijardus, kurių biudžete nėra.'),
    choices: [
      { label: bi('Agree and publish a costed programme', 'Sutikti ir paskelbti apskaičiuotą programą'), tag: 'moderate', fx: { pc: 2, mom: 0.2 } },
      { label: bi('Push back: people need help now', 'Atkirsti: žmonėms pagalbos reikia dabar'), tag: 'populist', fx: { mom: 0.9, reg: [['rural', 0.6]], pc: -1 } },
      { label: bi('Say nothing and keep campaigning', 'Nieko nesakyti ir toliau agituoti'), tag: null, fx: { und: 0.2 } },
    ],
  },
  {
    id: 'scandal_mp', scandal: true, cat: bi('Scandal', 'Skandalas'), icon: Flame,
    title: bi('Your party’s MP filmed driving drunk in Kaunas', 'Jūsų partijos Seimo narys nufilmuotas vairuojantis neblaivus Kaune'),
    body: bi('The dashcam video has 400,000 views by breakfast. Every TV channel wants your reaction.', 'Iki pusryčių vaizdo registratoriaus įrašas surinko 400 000 peržiūrų. Visi kanalai laukia jūsų reakcijos.'),
    choices: [
      { label: bi('Expel the MP immediately', 'Nedelsiant pašalinti jį iš partijos'), tag: null, fx: { mom: -0.4, pc: 1 } },
      { label: bi('Stand by him: he apologised', 'Užstoti – jis atsiprašė'), tag: null, fx: { mom: -2.2, scandal: 4 } },
      { label: bi('Hold a road-safety press conference', 'Surengti spaudos konferenciją apie saugų eismą'), tag: null, fx: { money: -25, mom: -1, und: 0.2 } },
    ],
  },
  {
    id: 'scandal_money', scandal: true, cat: bi('Scandal', 'Skandalas'), icon: Siren,
    title: bi('Investigation: your party got €200k via a shell company', 'Tyrimas: jūsų partija gavo 200 tūkst. eurų per fiktyvią įmonę'),
    body: bi('Journalists trace the payments to a construction firm bidding for public contracts. Your fundraising is now front-page news.', 'Žurnalistai atsekė, kad pinigai atkeliavo iš statybų bendrovės, dalyvaujančios viešuosiuose pirkimuose. Jūsų lėšų rinkimas – pirmuosiuose puslapiuose.'),
    choices: [
      { label: bi('Return the money and order an audit', 'Grąžinti pinigus ir užsakyti auditą'), tag: null, fx: { money: -200, scandal: -20, mom: -0.8 } },
      { label: bi('Deny everything', 'Viską neigti'), tag: null, risk: { chance: 0.5, ok: { scandal: -5 }, okText: bi('The story fizzles out.', 'Istorija nuslūgo.'), fail: { mom: -3, pc: -2 }, failText: bi('Then the bank statements leak.', 'Tada nutekėjo banko išrašai.') } },
      { label: bi('Blame a rogue treasurer', 'Kaltinti nesąžiningą iždininką'), tag: null, fx: { mom: -1.5, scandal: -8 } },
    ],
  },
];
const EVENT_MAP = Object.fromEntries(EVENTS.map((e) => [e.id, e]));

/* ============================================================
   LRT debates (weeks 4, 8, 11)
   ============================================================ */
const DEBATES = [
  {
    title: bi('The Economy', 'Ekonomika'),
    questions: [
      {
        q: bi('Prices are up a quarter in three years. What exactly will you do about the cost of living?', 'Kainos per trejus metus pakilo ketvirtadaliu. Ką konkrečiai darysite dėl pragyvenimo kainų?'),
        answers: [
          { t: bi('Index pensions and raise the minimum wage to €1,200.', 'Indeksuosime pensijas ir pakelsime MMA iki 1 200 eurų.'), style: 'welfare', base: 6, axis: ['econ', -1], tags: [['rural', 0.8]] },
          { t: bi('Cut VAT on food and medicine to 9%, from day one.', 'Nuo pirmos dienos sumažinsime PVM maistui ir vaistams iki 9 %.'), style: 'populist', base: 6.5, axis: ['econ', -1], tags: [['all', 0.4]], pc: -1 },
          { t: bi('Fiscal discipline and higher productivity. No magic tricks.', 'Fiskalinė drausmė ir didesnis produktyvumas. Jokių stebuklų.'), style: 'technocrat', base: 5.5, axis: ['econ', 1], tags: [['urban', 0.7]] },
          { t: bi('“The government let prices explode, and they want four more years?”', '„Vyriausybė leido kainoms sprogti – ir dar nori ketverių metų?“'), style: 'attack', base: 5.5, tags: [['all', 0.3]] },
        ],
      },
      {
        q: bi('Lithuania loses thousands of young people abroad every year. How do you bring them home?', 'Kasmet Lietuvą palieka tūkstančiai jaunų žmonių. Kaip juos susigrąžinsite?'),
        answers: [
          { t: bi('A regional investment fund and affordable rental housing.', 'Regionų investicijų fondas ir įperkamas nuomojamas būstas.'), style: 'welfare', base: 6, axis: ['econ', -1], tags: [['rural', 0.6]] },
          { t: bi('Lower income tax for young professionals under 30.', 'Mažesnis pajamų mokestis jauniems specialistams iki 30 metų.'), style: 'business', base: 6, axis: ['econ', 1], tags: [['urban', 0.6], ['ABR', 1.5]] },
          { t: bi('Dual citizenship and a real diaspora strategy.', 'Dviguba pilietybė ir tikra diasporos strategija.'), style: 'youth', base: 6, tags: [['ABR', 2.5], ['urban', 0.3]] },
        ],
      },
      {
        q: bi('Thirty seconds. Why should an undecided voter in Panevėžys trust you?', 'Trisdešimt sekundžių. Kodėl neapsisprendęs rinkėjas Panevėžyje turėtų jumis pasitikėti?'),
        answers: [
          { t: bi('A calm promise: competent, honest government for every region.', 'Ramus pažadas: kompetentinga ir sąžininga valdžia kiekvienam regionui.'), style: 'moderate', base: 6, tags: [['all', 0.3]] },
          { t: bi('A fiery speech against the Vilnius elites.', 'Ugninga kalba prieš Vilniaus elitą.'), style: 'populist', base: 6, tags: [['rural', 0.8], ['urban', -0.5]] },
          { t: bi('Three concrete, costed pledges, read straight to camera.', 'Trys konkretūs, apskaičiuoti pažadai – tiesiai į kamerą.'), style: 'technocrat', base: 6, tags: [['urban', 0.5]] },
        ],
      },
    ],
  },
  {
    title: bi('Security & Foreign Policy', 'Saugumas ir užsienio politika'),
    questions: [
      {
        q: bi('Should defence spending rise to 5–6% of GDP, even if it means new taxes?', 'Ar krašto apsaugai reikia skirti 5–6 % BVP, net jei tam prireiks naujų mokesčių?'),
        answers: [
          { t: bi('Yes. Security has no price: 6% now.', 'Taip. Saugumas neturi kainos – 6 % jau dabar.'), style: 'security', base: 6, axis: ['defense', 1], tags: [['VNO', 0.8], ['border', 0.6]] },
          { t: bi('Yes, but paid for by a bank-profit tax, not by families.', 'Taip, bet sumokės bankų pelno mokestis, o ne šeimos.'), style: 'welfare', base: 6.5, axis: ['econ', -1], tags: [['all', 0.4]] },
          { t: bi('We need balance: 4%, and invest the rest in people.', 'Reikia pusiausvyros: 4 %, o likusius – žmonėms.'), style: 'populist', base: 5.5, axis: ['defense', -1], tags: [['rural', 0.6], ['VNO', -0.8]] },
        ],
      },
      {
        q: bi('Belarus keeps sending smuggling balloons and migrants. What is your red line?', 'Baltarusija toliau siunčia kontrabandos balionus ir migrantus. Kur jūsų raudonoji linija?'),
        answers: [
          { t: bi('Close the border until it stops. Full stop.', 'Uždaryti sieną, kol tai liausis. Taškas.'), style: 'security', base: 6, axis: ['defense', 1], tags: [['border', 1.0]] },
          { t: bi('Coordinated EU sanctions and modern airspace defence.', 'Koordinuotos ES sankcijos ir moderni oro erdvės gynyba.'), style: 'moderate', base: 6, tags: [['urban', 0.5]] },
          { t: bi('De-escalate through diplomatic channels.', 'Mažinti įtampą diplomatiniais kanalais.'), style: 'technocrat', base: 4.5, axis: ['defense', -1], tags: [['border', -0.8]] },
        ],
      },
      {
        q: bi('Should every 18-year-old, men and women, do military service?', 'Ar kiekvienas 18-metis – ir vaikinai, ir merginos – turėtų atlikti karo tarnybą?'),
        answers: [
          { t: bi('Yes. Universal service, like Finland.', 'Taip. Visuotinė tarnyba, kaip Suomijoje.'), style: 'security', base: 5.5, axis: ['defense', 1], tags: [['urban', 0.3]] },
          { t: bi('Expand it for men, keep it voluntary for women.', 'Plėsti vaikinams, merginoms – savanoriškai.'), style: 'traditional', base: 6, axis: ['social', 1], tags: [['rural', 0.5]] },
          { t: bi('No. Build a professional army instead.', 'Ne. Kurkime profesionalią kariuomenę.'), style: 'youth', base: 5.5, axis: ['defense', -1], tags: [['urban', 0.4]] },
        ],
      },
    ],
  },
  {
    title: bi('Values, Energy & the Future', 'Vertybės, energetika ir ateitis'),
    questions: [
      {
        q: bi('Will your government pass the civil partnership law?', 'Ar jūsų Vyriausybė priims partnerystės įstatymą?'),
        answers: [
          { t: bi('Yes: equal recognition for every family.', 'Taip – lygios teisės kiekvienai šeimai.'), style: 'progressive', base: 6, axis: ['social', -1], tags: [['urban', 1.0], ['rural', -0.8]] },
          { t: bi('A narrow cohabitation agreement, not partnership.', 'Siaura bendro gyvenimo sutartis, ne partnerystė.'), style: 'moderate', base: 6, tags: [['all', 0.3]] },
          { t: bi('No. We protect the traditional family.', 'Ne. Ginsime tradicinę šeimą.'), style: 'traditional', base: 6, axis: ['social', 1], tags: [['rural', 1.0], ['urban', -0.8]] },
        ],
      },
      {
        q: bi('Energy: offshore wind, a new nuclear plant, or cheap gas?', 'Energetika: jūros vėjas, nauja atominė ar pigios dujos?'),
        answers: [
          { t: bi('Offshore wind and solar: green independence.', 'Jūros vėjas ir saulė – žalioji nepriklausomybė.'), style: 'green', base: 6, axis: ['green', 1], tags: [['urban', 0.7], ['KLP', 0.8]] },
          { t: bi('Small modular reactors at Visaginas.', 'Maži moduliniai reaktoriai Visagine.'), style: 'technocrat', base: 6, axis: ['green', 1], tags: [['UTE', 2.5]] },
          { t: bi('Keep gas cheap and stop the green experiments.', 'Išlaikyti pigias dujas ir baigti žaliuosius eksperimentus.'), style: 'populist', base: 6, axis: ['green', -1], tags: [['rural', 0.8], ['urban', -0.6]] },
        ],
      },
      {
        q: bi('Final word. Look into the camera and speak to the undecided.', 'Paskutinis žodis. Pažiūrėkite į kamerą ir kreipkitės į neapsisprendusius.'),
        answers: [
          { t: bi('“Lithuania is stronger when we stop shouting at each other.”', '„Lietuva stipresnė, kai nustojame vieni ant kitų rėkti.“'), style: 'moderate', base: 6, tags: [['all', 0.4]] },
          { t: bi('“Throw out the people who forgot you exist.”', '„Išvykite tuos, kurie pamiršo, kad jūs egzistuojate.“'), style: 'populist', base: 6, tags: [['rural', 0.8], ['urban', -0.4]] },
          { t: bi('“Vote for competence. Read our programme.”', '„Balsuokite už kompetenciją. Perskaitykite mūsų programą.“'), style: 'technocrat', base: 6, tags: [['urban', 0.6]] },
        ],
      },
    ],
  },
];
const STYLE_NAMES = {
  technocrat: bi('Expert', 'Ekspertiškai'), attack: bi('Attack', 'Puolimas'), security: bi('Security', 'Saugumas'), welfare: bi('Welfare', 'Socialinė parama'),
  populist: bi('Populist', 'Populistiškai'), business: bi('Business', 'Verslas'), youth: bi('Youth', 'Jaunimas'), moderate: bi('Calm', 'Ramiai'),
  traditional: bi('Family values', 'Šeimos vertybės'), progressive: bi('Progressive', 'Progresyviai'), green: bi('Green', 'Žaliai'),
};
const TAG_NAMES = {
  welfare: bi('Welfare', 'Socialinė parama'), security: bi('Security', 'Saugumas'), populist: bi('Populist', 'Populizmas'), agri: bi('Farm', 'Žemės ūkis'),
  business: bi('Business', 'Verslas'), youth: bi('Youth', 'Jaunimas'), minority: bi('Minority', 'Mažumos'), moderate: bi('Moderate', 'Nuosaikumas'),
  green: bi('Green', 'Žalia'), traditional: bi('Family values', 'Šeimos vertybės'), progressive: bi('Progressive', 'Progresyvumas'),
};
// Map outlines: simplified from @react-map/lithuania (MIT License, (c) Shubham Singh).
const COUNTY_SHAPES = {
  ALY: { label: [423, 519], d: 'M374,466L377,468L379,468L381,465L390,466L388,469L394,466L394,461L403,462L408,459L409,456L406,455L409,448L414,446L419,447L421,451L424,449L433,449L434,445L439,445L441,443L443,443L442,448L444,453L456,454L461,453L462,451L464,462L460,464L466,468L463,475L466,474L468,477L480,476L479,478L484,479L485,474L496,470L502,475L501,480L502,484L505,481L520,482L520,479L528,478L528,480L530,476L543,473L543,482L540,482L540,485L530,487L531,490L528,490L531,505L525,505L523,507L525,509L522,510L520,514L517,514L516,515L514,515L515,518L507,520L507,525L516,529L518,539L516,539L518,542L510,547L517,556L517,562L524,565L519,566L519,571L518,570L516,574L510,574L506,580L499,581L500,568L498,568L495,571L490,570L487,574L476,581L468,593L465,594L464,593L464,595L463,593L455,595L453,592L451,594L449,594L441,583L438,585L435,584L434,579L426,583L422,582L421,586L406,589L403,589L402,583L396,580L392,585L388,583L380,588L383,591L380,595L377,595L376,590L368,586L355,589L351,585L345,585L340,580L338,573L344,566L344,558L339,546L338,538L335,533L330,532L324,521L317,515L318,510L315,505L320,503L319,499L323,491L335,489L332,487L332,482L342,479L342,467L356,461L357,457L360,455L365,464L369,462Z' },
  KNC: { label: [382, 269], d: 'M231,232L234,229L235,230L241,223L243,226L253,225L253,231L250,232L252,236L254,234L258,235L264,230L273,230L279,224L281,226L281,224L285,226L283,218L286,217L286,211L290,210L290,214L293,214L302,211L304,209L306,218L308,220L310,217L312,218L319,215L324,218L327,225L334,227L333,229L336,229L338,227L337,222L345,220L349,224L349,232L362,232L361,229L367,224L393,211L396,215L394,216L395,219L398,223L401,225L405,223L412,231L415,230L414,238L420,239L422,237L424,237L426,240L430,237L435,237L436,232L441,234L441,237L448,240L450,236L454,240L461,242L460,246L467,250L467,255L464,256L462,261L460,274L464,275L465,277L463,288L475,291L472,295L475,304L480,307L478,309L480,315L482,317L485,317L487,325L490,325L494,331L491,333L491,335L486,336L486,340L483,341L481,345L485,349L490,349L493,353L498,355L499,360L507,359L516,365L514,370L512,369L508,371L509,384L506,385L505,384L504,385L499,386L493,390L492,396L493,401L492,401L491,411L486,412L485,409L481,408L480,414L475,412L471,412L468,417L470,427L467,429L470,429L472,434L470,434L465,438L464,436L464,444L461,453L444,453L442,448L443,443L441,443L439,445L434,445L433,449L424,449L421,451L419,447L414,446L409,448L406,455L409,456L408,459L403,462L394,461L394,466L388,469L390,466L381,465L379,468L377,468L374,466L379,458L374,453L373,447L367,449L362,439L367,437L363,431L359,432L360,430L357,429L363,426L361,423L364,421L363,418L359,411L363,408L359,401L360,398L358,397L351,399L360,389L355,384L356,382L354,380L357,376L346,367L340,370L337,368L337,360L326,354L333,348L342,346L352,341L352,335L338,332L328,326L332,323L338,314L338,305L341,295L334,292L326,293L324,291L323,286L316,286L314,288L299,287L299,279L290,282L284,281L283,284L274,283L277,278L270,274L272,268L267,270L264,268L265,270L260,271L260,273L258,273L256,276L256,271L253,270L253,267L246,267L246,263L249,261L247,254L241,254L240,252L238,252L239,243L233,245L230,237L232,235Z' },
  KLP: { label: [81, 241], d: 'M20,174L24,184L22,228L18,240L21,245L18,247L19,248L14,257L14,266L9,270L4,278L1,278L12,249L18,224L21,195ZM135,17L136,17L136,22L131,23L130,31L136,32L135,43L139,48L138,53L142,57L141,60L135,59L129,80L117,76L119,84L107,81L104,88L101,88L93,106L83,104L81,108L86,110L83,118L84,125L81,126L82,128L89,132L85,133L83,139L77,142L77,146L75,145L73,151L79,155L83,150L84,154L89,157L88,160L90,160L89,165L91,166L94,163L100,167L101,165L104,166L105,164L107,165L105,176L114,180L111,182L108,192L112,195L112,200L117,199L124,204L122,206L123,208L117,211L114,215L118,215L116,217L116,222L118,227L119,227L122,244L129,241L135,245L139,244L141,247L142,253L138,261L124,279L135,282L144,288L143,291L147,305L161,303L164,307L178,308L181,311L175,311L175,318L177,328L161,330L156,337L150,337L145,333L145,323L139,323L135,326L129,324L120,320L116,315L103,312L102,308L93,301L82,297L73,299L67,291L58,274L43,285L46,272L39,263L40,258L42,258L40,257L38,261L31,263L39,245L40,235L36,220L39,218L35,220L34,209L30,203L26,193L26,188L28,191L25,181L22,176L17,172L13,127L16,107L15,91L27,87L30,90L33,89L37,80L37,69L43,66L50,55L67,48L72,38L78,38L81,32L91,30L96,33L103,33L118,19L122,22Z' },
  MAR: { label: [299, 430], d: 'M219,327L229,332L239,329L244,325L254,323L265,324L281,318L317,327L331,326L338,332L352,335L350,342L342,346L333,348L326,354L337,360L337,368L340,370L346,367L357,376L354,380L356,382L355,384L360,389L351,399L358,397L360,398L359,401L363,408L359,411L364,421L361,423L363,426L357,429L360,430L359,432L363,431L367,437L362,439L367,449L373,447L374,453L379,458L378,461L374,466L369,462L365,464L360,455L356,461L342,467L342,479L332,482L332,487L335,489L327,489L320,494L320,503L315,505L318,510L317,515L305,513L300,507L294,505L295,502L293,501L286,505L280,501L279,498L282,495L273,490L275,485L271,484L254,479L251,480L246,489L237,475L231,451L235,444L231,438L239,429L239,425L241,424L237,415L240,410L239,406L243,400L253,397L255,394L254,392L257,391L258,386L256,384L257,381L255,380L256,377L252,374L253,367L250,363L246,365L244,360L241,362L242,358L239,357L237,351L232,349L231,346L228,347L229,351L226,349L224,342L220,338Z' },
  PAN: { label: [493, 108], d: 'M527,1L530,2L529,9L533,18L537,21L538,33L543,38L544,42L548,44L551,61L561,66L568,66L572,62L583,73L586,71L595,70L595,72L597,73L599,71L608,73L609,70L612,68L615,69L617,74L621,76L628,76L631,72L632,77L635,79L633,87L651,95L652,100L655,102L656,108L661,107L680,118L674,119L669,124L672,131L670,137L661,138L661,147L656,148L653,147L651,162L644,160L639,161L638,169L633,173L631,168L627,171L623,170L621,168L618,173L613,171L610,174L607,173L608,170L604,169L603,172L592,164L589,164L585,170L580,171L580,175L582,176L581,179L576,175L573,175L554,183L552,178L554,175L549,176L538,170L532,175L524,174L523,178L520,177L518,173L513,176L503,174L502,183L508,186L504,190L500,188L501,186L494,188L494,192L500,190L502,192L504,200L497,202L497,214L494,221L490,224L494,232L493,236L486,238L478,237L478,241L476,242L477,245L472,248L473,250L464,249L460,246L461,242L457,240L454,240L450,236L448,240L441,237L441,234L436,232L435,237L430,237L426,240L424,237L422,237L420,239L414,238L415,230L412,231L405,223L401,225L398,223L395,219L394,216L396,215L393,211L397,200L397,195L404,197L405,194L413,194L411,190L411,182L412,183L417,178L412,175L414,167L410,165L412,162L410,158L405,159L401,145L409,146L407,142L411,143L412,140L419,137L417,133L420,128L420,121L416,122L414,119L412,120L409,116L410,108L413,104L413,99L415,102L416,100L417,91L421,90L425,78L431,77L431,67L428,68L430,62L425,60L424,50L446,39L445,36L452,36L455,42L459,41L463,45L468,46L477,40L484,39L484,31L491,24L491,18L500,18L502,15L502,12L511,12L515,7L518,9L522,8L522,3L524,0Z' },
  SIA: { label: [321, 120], d: 'M267,8L273,10L277,29L279,31L283,30L286,35L298,27L296,20L311,19L315,16L325,17L329,19L332,23L346,28L358,21L376,18L377,21L375,30L378,31L380,26L382,26L409,29L410,33L413,36L413,40L420,41L422,48L428,47L423,52L425,60L430,62L428,68L431,67L431,77L425,78L421,90L417,91L416,100L415,102L413,99L413,104L410,108L409,116L412,120L414,119L416,122L420,121L420,128L417,133L419,137L412,140L411,143L407,142L409,146L401,145L405,159L410,158L412,162L410,165L414,167L412,175L417,178L412,183L411,182L411,190L413,194L405,194L404,197L397,195L397,200L393,211L367,224L361,229L362,232L349,232L349,224L345,220L337,222L338,227L336,229L333,229L334,227L327,225L324,218L319,215L312,218L310,217L308,220L306,218L304,209L302,211L293,214L290,214L290,210L286,211L286,217L283,218L285,226L281,224L281,226L279,224L273,230L264,230L258,235L254,234L252,236L250,232L253,231L253,225L243,226L241,223L235,230L234,229L231,232L223,231L227,228L218,215L218,212L214,212L211,206L207,205L209,197L204,194L205,188L203,185L205,182L211,180L211,177L210,168L204,156L217,153L217,140L224,141L228,137L231,139L230,135L234,135L232,127L236,126L235,124L232,124L229,114L226,113L228,119L223,119L220,118L221,115L218,112L222,109L225,100L223,96L225,98L229,94L233,95L241,93L240,89L235,86L237,80L234,78L225,80L225,84L222,85L212,81L209,81L207,83L197,81L200,79L200,76L196,78L198,72L193,70L197,48L205,47L207,39L204,39L202,35L211,36L212,33L220,35L223,27L219,21L228,21L231,23L237,19L254,20L263,16L264,13L263,12Z' },
  TAU: { label: [186, 261], d: 'M124,204L138,199L140,201L143,201L151,189L155,191L160,186L173,181L180,186L182,184L185,184L190,188L196,185L200,187L203,185L205,188L204,194L209,197L207,205L211,206L214,212L218,212L218,215L226,225L227,228L223,231L233,233L230,237L233,245L239,243L238,252L240,252L241,254L247,254L249,261L246,263L246,267L253,267L253,270L256,271L256,276L258,273L260,273L260,271L265,270L264,268L267,270L272,268L270,274L277,278L274,283L283,284L284,281L290,282L299,279L299,287L314,288L316,286L323,286L324,291L326,293L334,292L341,295L338,305L338,314L332,323L321,327L281,318L265,324L254,323L244,325L239,329L229,332L219,327L202,332L177,328L175,318L175,311L181,311L178,308L164,307L161,303L148,305L143,291L144,288L135,282L124,279L138,261L142,250L139,244L135,245L129,241L122,244L119,227L118,227L116,222L116,217L118,215L114,215L117,211L123,208L122,206Z' },
  TEL: { label: [157, 128], d: 'M157,4L162,7L167,6L172,11L182,10L187,13L195,9L204,11L208,14L222,16L226,20L219,21L223,27L220,35L212,33L211,36L202,35L204,39L207,39L205,47L197,48L193,70L198,72L196,78L200,76L200,79L197,81L203,83L212,81L222,85L225,84L225,80L236,79L235,86L240,89L241,93L233,95L229,94L225,98L223,96L225,100L222,109L218,112L221,115L220,118L223,119L228,119L226,113L229,114L232,124L235,124L236,126L232,127L234,135L230,135L231,139L228,137L224,141L217,140L217,153L204,156L211,170L211,180L209,181L205,182L200,187L196,185L190,188L185,184L182,184L180,186L173,181L160,186L155,191L151,189L143,201L140,201L138,199L124,204L117,198L112,200L112,194L108,192L111,182L114,180L105,176L107,165L105,164L104,166L101,165L100,167L94,163L91,166L89,165L90,160L88,160L89,157L84,154L83,150L79,155L73,151L75,145L77,146L77,142L83,139L85,133L89,132L82,128L81,126L84,125L83,118L86,110L81,108L83,104L93,106L101,88L104,88L107,81L119,84L117,76L129,80L135,59L141,60L142,57L138,53L139,48L135,43L136,32L130,31L131,23L136,22L139,8L142,8L142,6L146,8Z' },
  UTE: { label: [678, 214], d: 'M695,137L700,139L705,146L706,152L711,163L716,169L721,169L726,178L737,178L746,184L759,184L759,190L761,190L762,196L759,200L761,209L756,211L745,224L750,233L747,237L749,240L747,240L749,247L748,252L745,252L742,256L738,256L737,260L734,262L750,268L752,267L756,268L758,265L759,268L764,264L771,268L783,269L786,273L786,278L774,284L776,282L764,282L764,285L762,285L762,283L758,282L759,284L757,284L758,286L755,291L748,292L746,291L744,293L736,292L734,294L724,290L711,289L709,292L705,286L704,288L701,287L700,291L695,290L699,284L695,282L694,276L683,274L682,271L683,275L681,272L678,276L681,276L679,278L674,278L674,280L670,278L668,279L666,276L662,279L657,273L652,274L654,276L650,279L644,269L638,274L639,274L637,276L636,282L632,280L636,287L631,287L629,293L631,293L628,297L629,300L636,303L636,309L648,317L645,317L645,319L643,318L641,320L643,321L643,324L642,322L639,324L640,326L642,325L639,331L643,334L636,335L635,332L630,333L630,330L625,327L622,329L618,328L618,331L615,329L612,330L611,334L594,335L592,336L586,336L583,333L570,333L572,330L570,323L563,321L562,322L561,317L564,311L563,308L571,305L572,299L577,299L571,298L569,293L564,295L562,292L565,287L566,281L562,282L560,284L554,281L555,278L552,275L551,271L539,270L537,259L528,263L526,263L527,259L520,260L512,256L513,249L511,248L513,244L516,246L517,240L512,238L509,230L506,231L503,225L494,226L497,202L504,200L502,192L500,190L494,192L494,188L501,186L500,188L504,190L508,186L502,183L504,174L507,176L513,176L518,173L520,177L523,178L524,174L532,175L538,170L549,176L554,175L552,178L554,183L573,175L576,175L581,179L582,176L580,175L580,171L585,170L589,164L592,164L603,172L604,169L608,170L607,173L610,174L613,171L618,173L621,168L623,170L627,171L631,168L633,173L638,169L639,161L644,160L651,162L653,147L660,148L662,146L661,138L670,137L672,131L669,124L674,119L680,118L687,132L691,136Z' },
  VLC: { label: [524, 305], d: 'M494,221L494,226L503,225L506,231L509,230L512,238L517,240L516,246L513,244L511,248L513,249L512,256L520,260L527,259L526,263L528,263L537,259L539,270L551,271L552,275L555,278L554,281L560,284L562,282L566,281L565,287L562,292L564,295L569,293L571,298L577,299L572,299L571,305L563,308L564,311L561,317L562,322L563,321L570,323L572,329L570,333L583,333L586,335L592,336L594,335L611,334L612,330L615,329L618,331L618,328L622,329L625,327L630,330L630,333L635,332L636,335L643,334L639,331L642,325L640,326L639,324L642,322L643,324L643,321L641,320L643,318L645,319L645,317L648,317L636,309L636,303L629,300L628,297L631,293L629,293L631,287L636,287L632,279L636,282L637,276L639,274L638,274L644,269L650,279L654,276L652,274L657,273L662,279L666,276L668,279L670,278L674,280L674,278L679,278L681,276L678,276L681,272L683,275L682,271L683,274L694,276L695,282L699,284L695,290L700,291L701,287L704,288L705,286L709,292L711,289L725,290L734,294L736,292L744,293L746,291L748,292L755,291L758,286L757,284L759,284L758,283L762,283L762,285L764,285L764,282L776,282L772,287L772,292L769,296L767,295L765,296L769,303L767,304L765,303L764,306L762,305L758,308L753,307L747,309L743,305L739,308L736,313L730,310L728,312L722,308L718,309L718,311L715,312L715,314L705,318L710,325L707,327L702,343L699,345L691,346L689,350L685,350L685,354L682,355L683,356L674,355L672,353L665,358L656,359L655,367L645,376L644,384L640,385L641,407L639,417L643,441L632,450L626,465L622,468L625,468L625,476L622,482L620,481L620,487L616,489L615,494L612,494L612,497L614,497L615,501L619,499L621,501L624,502L625,500L627,502L632,499L636,505L635,509L641,511L643,517L647,518L640,523L644,526L645,534L647,536L642,533L639,537L635,534L632,540L626,543L625,540L612,537L609,533L610,530L616,528L613,520L620,521L615,512L616,510L610,508L610,502L608,502L603,506L597,504L595,508L588,512L582,511L581,513L577,510L574,515L572,512L570,513L568,522L551,542L540,540L538,535L535,533L523,539L518,539L516,529L507,525L507,520L515,518L514,515L516,515L517,514L520,514L522,510L525,509L523,507L525,505L531,505L528,490L531,490L531,487L540,485L540,482L543,482L543,473L530,476L528,480L528,478L520,479L520,482L505,481L502,484L501,480L502,475L496,471L485,474L484,479L479,478L480,476L468,477L466,474L463,475L466,468L460,464L464,462L462,453L464,444L464,436L465,438L470,434L472,434L470,429L467,429L470,427L468,417L471,413L475,412L480,414L481,408L485,409L486,412L491,411L492,401L493,401L492,397L493,390L505,384L506,385L509,384L508,371L515,369L516,366L507,359L499,360L498,355L493,353L490,349L485,349L481,345L483,341L486,340L486,336L491,335L491,333L494,331L490,325L487,325L485,317L482,317L480,315L478,309L480,307L475,304L472,295L475,291L463,288L465,277L464,275L460,274L462,261L464,256L467,255L467,250L473,250L472,248L477,245L476,242L478,241L479,236L486,238L493,236L494,232L490,224Z' },
};
const CITY_POS = { VNO: [579, 416], KNS: [396, 367] };

/* ============================================================
   Constituency leans & ground game
   ============================================================ */
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
    case 'TS': return rural ? 22 : 36;
    case 'NA': return ['TEL', 'TAU', 'KLP', 'SIA'].includes(r.id) ? 30 : 15;
    case 'DSVL': return ['KNC', 'PAN', 'UTE', 'SIA'].includes(r.id) ? 24 : 15;
    case 'LS': return rural ? 10 : 25;
    case 'LVZS': return rural ? 34 : 10;
    case 'LP': return ['VNO', 'KNS'].includes(r.id) ? 18 : 4;
    case 'LLRA': return r.id === 'VLC' ? 50 : r.id === 'VNO' ? 28 : 3;
    default: return 8;
  }
}

/* ============================================================
   Core model
   ============================================================ */
const posOf = (g, p, stance) => (p === g.player ? stance || g.stance : PARTIES[p].pos);
const fitScore = (pos, r) => sum(AXIS_IDS.map((a) => (r.sal[a] * Math.abs(pos[a] - r.ideal[a])) / 100));
const driftSteps = (stance, orig) => sum(AXIS_IDS.map((a) => Math.abs(stance[a] - orig[a]) / 30));
const alienation = (stance, orig) => Math.exp(-0.05 * Math.pow(Math.max(0, driftSteps(stance, orig) - 1), 1.4));
function policyMult(g, r, stance) {
  const st = stance || g.stance;
  const o = PARTIES[g.player].pos;
  return Math.exp(-0.55 * (fitScore(st, r) - fitScore(o, r))) * alienation(st, o);
}
function groupMult(g, r) {
  let s = 0;
  for (const G of GROUPS) s += groupWeight(G.id, r) * ((g.groupMood && g.groupMood[G.id]) || 0);
  return 1 + 0.004 * s;
}
function effSupport(g, r, p, stance) {
  const raw = g.support[r.id][p];
  const mom = 1 + 0.03 * (g.momentum[p] || 0);
  const pol = p === g.player ? policyMult(g, r, stance) * groupMult(g, r) : 1;
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
const leaderOf = (shares, exclude) => PARTY_IDS.filter((p) => p !== exclude).sort((a, b) => shares[b] - shares[a])[0];
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
function addScandal(g, x) { g.scandal = clamp(g.scandal + (x > 0 && g.player === 'NA' ? x * 2 : x), 0, 100); }
function addNews(g, item) {
  g.newsId = (g.newsId || 0) + 1;
  g.news.unshift({ id: g.newsId, week: g.week, ...item });
  if (g.news.length > 90) g.news.length = 90;
}
function spend(g, k) { g.money -= k; g.stats.spent += k; }
function vrkCheck(g) {
  if (g.vrkHit || g.stats.spent <= VRK_LIMIT) return null;
  g.vrkHit = true;
  const fine = Math.min(g.money, 150);
  g.money -= fine;
  g.momentum[g.player] = clamp(g.momentum[g.player] - 1.5, -10, 10);
  addScandal(g, 10);
  addNews(g, { kind: 'vrk', fine });
  return tt(` VRK fined you ${fmtEur(fine)} for overspending!`, ` VRK skyrė ${fmtEur(fine)} baudą už viršytas išlaidas!`);
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
    support[r.id] = {}; gg[r.id] = {}; boost[r.id] = {};
    for (const p of ALL_IDS) {
      support[r.id][p] = (r.base[p] / tot) * (100 - und);
      gg[r.id][p] = initGG(p, r);
      boost[r.id][p] = 0;
    }
    undecided[r.id] = und;
  }
  const leans = buildLeans(rand);
  const stars = {};
  PARTY_IDS.filter((p) => p !== pid).forEach((p) => {
    const n = ['TS', 'LSDP', 'NA', 'LVZS'].includes(p) ? 3 : 2;
    const cids = Object.keys(leans);
    for (let k = 0; k < n; k++) {
      const w = cids.map((cid) => {
        const r = REG[cid.split('-')[0]];
        return Math.pow(r.base[p] * leans[cid][p], 2);
      });
      const cid = cids[weightedPick(w, rand)];
      stars[cid] = { ...(stars[cid] || {}), [p]: Math.floor(rand() * STAR_PEOPLE.length) };
    }
  });
  const g = {
    v: 3, seed, player: pid, week: 1, phase: 'campaign', tut: 0,
    ap: 6, apMax: 6, money: PARTIES[pid].funds, pc: 6, scandal: pid === 'NA' ? 10 : 4,
    stance: { ...PARTIES[pid].pos }, lastShift: {},
    momentum: Object.fromEntries(ALL_IDS.map((p) => [p, 0])),
    groupMood: Object.fromEntries(GROUPS.map((G) => [G.id, 0])),
    support, undecided, gg, boost, leans, stars,
    weekActs: {}, natActs: {}, weekLog: {}, attacksThisWeek: 0, lastIncome: 0, vrkHit: false, weather: null,
    history: [], news: [], newsId: 0, queue: [{ type: 'brief' }], usedEvents: [], lastEventWeek: 1,
    stats: { actions: 0, spent: 0, shifts: 0, debates: [], events: 0, gambleNet: 0, gambles: 0 },
    election: null, coal: null, vote: null, result: null,
  };
  g.history.push({ week: 0, shares: nationalShares(g) });
  addNews(g, { kind: 'launch' });
  return g;
}

/* ============================================================
   Campaign actions
   ============================================================ */
function actionCost(type, r, p) {
  const s = r.seats;
  switch (type) {
    case 'rally': return p === 'NA' ? Math.round((16 + 3 * s) * 0.5) : 16 + 3 * s;
    case 'digital': return 20 + 4 * s;
    case 'tv': return 26 + 4 * s;
    case 'door': return 8 + s;
    case 'star': return 55;
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
function starTarget(g, rid) {
  const r = REG[rid];
  const s = regionShares(g, r);
  const p = g.player;
  let best = null;
  r.cons.forEach((c, i) => {
    const cid = `${rid}-${i}`;
    if (g.stars[cid] && g.stars[cid][p] != null) return;
    const Lc = g.leans[cid];
    const mine = s[p] * Lc[p];
    const other = Math.max(...PARTY_IDS.filter((q) => q !== p).map((q) => s[q] * Lc[q] * (g.stars[cid] && g.stars[cid][q] != null ? 1.18 : 1)));
    const gap = mine - other;
    const score = gap < 0 ? -gap : gap * 2.5;
    if (!best || score < best.score) best = { cid, gap, score };
  });
  return best;
}
function doRegionAction(g, rid, type) {
  const r = REG[rid], p = g.player;
  const cost = actionCost(type, r, p);
  if (g.ap < 1) return { ok: false, msg: tt('Out of energy! Tap Next week to refill.', 'Baigėsi energija! Spauskite „Kita savaitė“.') };
  if (g.money < cost) return { ok: false, msg: tt(`Not enough money: ${fmtEur(cost)} needed.`, `Trūksta pinigų: reikia ${fmtEur(cost)}.`) };
  if (type === 'star') {
    const tgt = starTarget(g, rid);
    if (!tgt) return { ok: false, msg: tt('You already have star candidates in every district here.', 'Visose šio regiono apygardose jau turite žinomų kandidatų.') };
    g.ap -= 1; spend(g, cost); g.stats.actions += 1;
    g.weekLog.star = (g.weekLog.star || 0) + 1;
    const who = Math.floor(Math.random() * STAR_PEOPLE.length);
    g.stars[tgt.cid] = { ...(g.stars[tgt.cid] || {}), [p]: who };
    addNews(g, { kind: 'star', cid: tgt.cid, who });
    const name = consById(tgt.cid)[0];
    return { ok: true, tone: 'good', msg: tt(`${L(STAR_PEOPLE[who])} will run for you in ${consName(name)}!`, `${consName(name)}: už jus kandidatuos ${L(STAR_PEOPLE[who])}!`) + (vrkCheck(g) || '') };
  }
  g.ap -= 1; spend(g, cost);
  g.stats.actions += 1;
  g.weekLog[type] = (g.weekLog[type] || 0) + 1;
  const n = g.weekActs[rid] || 0;
  g.weekActs[rid] = n + 1;
  const before = regionShares(g, r);
  const fat = FATIGUE[Math.min(n, FATIGUE.length - 1)];
  const k = fat * satOf(p, r, before[p]) * geoMult(p, r) * (0.85 + Math.random() * 0.3);
  let tone = 'good';
  let msg;
  const v = vrkCheck;
  if (type === 'rally') {
    gainSupport(g, rid, p, POWER.rally * traitMult(p, 'rally', r) * k, 0.5);
    g.boost[rid][p] = Math.min(0.25, g.boost[rid][p] + 0.03);
  } else if (type === 'digital') {
    gainSupport(g, rid, p, POWER.digital * (0.35 + r.urban) * traitMult(p, 'digital', r) * k, 0.8);
    if (p === 'LS' || p === 'LP') g.boost[rid][p] = Math.min(0.25, g.boost[rid][p] + 0.015 * r.urban);
  } else if (type === 'tv') {
    gainSupport(g, rid, p, POWER.tv * (1.25 - 0.65 * r.urban) * traitMult(p, 'tv', r) * k, 0.8);
  } else if (type === 'door') {
    const gg0 = g.gg[rid][p];
    g.gg[rid][p] = Math.min(100, gg0 + 14 * (1 - gg0 / 110) * geoMult(p, r));
    g.boost[rid][p] = Math.min(0.25, g.boost[rid][p] + 0.02);
    gainSupport(g, rid, p, POWER.door * k, 0.6);
    msg = tt(`Volunteers knocked on doors in ${rs(r)}: ground team ${Math.round(gg0)}→${Math.round(g.gg[rid][p])}`, `Savanoriai agitavo – ${rs(r)}: komanda ${Math.round(gg0)}→${Math.round(g.gg[rid][p])}`);
  } else if (type === 'attack') {
    const target = leaderOf(before, p);
    const bf = attackBackfire(g, r);
    g.attacksThisWeek += 1;
    if (Math.random() < bf) {
      loseSupport(g, rid, p, POWER.backfire * fat, 0.6);
      g.momentum[p] = clamp(g.momentum[p] - 0.6, -10, 10);
      const after = regionShares(g, r);
      return { ok: true, tone: 'bad', msg: tt(`Backfire! Voters in ${rs(r)} hated the attack: ${fmtSignedPct(after[p] - before[p])}`, `Atsisuko prieš jus! ${rs(r)} rinkėjams puolimas nepatiko: ${fmtSignedPct(after[p] - before[p])}`) + (v(g) || '') };
    }
    const dmg = POWER.attack * fat * geoMult(p, r) * (1 - g.gg[rid][target] / 160) * (0.85 + Math.random() * 0.3);
    loseSupport(g, rid, target, dmg, 0.45, p, 0.35);
    g.momentum[target] = clamp(g.momentum[target] - 0.25, -10, 10);
    const after = regionShares(g, r);
    return { ok: true, tone, msg: tt(`Attack ad hit ${partyShort(target)} in ${rs(r)}: ${fmtSignedPct(after[target] - before[target])} for them`, `Puolamoji reklama smogė ${partyShort(target)} – ${rs(r)}: ${fmtSignedPct(after[target] - before[target])}`) + (v(g) || '') };
  }
  const after = regionShares(g, r);
  if (!msg) {
    const lead = { rally: tt('Rally', 'Mitingas'), digital: tt('Online ads', 'Reklama internete'), tv: tt('TV & radio ads', 'TV ir radijo reklama') }[type];
    msg = tt(`${lead} in ${rs(r)}: ${fmtSignedPct(after[p] - before[p])} for you`, `${lead} – ${rs(r)}: jums ${fmtSignedPct(after[p] - before[p])}`);
  }
  return { ok: true, tone, msg: msg + (v(g) || '') };
}
function galaAmount(g) {
  const share = nationalShares(g)[g.player];
  return Math.round((80 + 3.5 * share) * FUND_MULT[g.player] * [1, 0.7, 0.5, 0.35][Math.min(g.natActs.gala || 0, 3)]);
}
function smallAmount(g) {
  const share = nationalShares(g)[g.player];
  return Math.round((35 + 2 * share) * [1, 0.7, 0.5, 0.35][Math.min(g.natActs.small || 0, 3)]);
}
const lobbyAmount = (g) => Math.round(150 * Math.sqrt(FUND_MULT[g.player]));
function doNational(g, id, target) {
  const A = NATIONAL_ACTIONS.find((a) => a.id === id);
  const p = g.player;
  if (g.ap < A.ap) return { ok: false, msg: tt(`Needs ${A.ap} energy.`, `Reikia ${A.ap} energijos.`) };
  if (A.pc && g.pc < A.pc) return { ok: false, msg: tt(`Needs ${A.pc} favours.`, `Reikia ${A.pc} ryšių.`) };
  if (A.cost && g.money < A.cost) return { ok: false, msg: tt(`Not enough money: ${fmtEur(A.cost)} needed.`, `Trūksta pinigų: reikia ${fmtEur(A.cost)}.`) };
  const n = g.natActs[id] || 0;
  g.ap -= A.ap;
  if (A.cost) spend(g, A.cost);
  if (A.ap) g.stats.actions += 1;
  let msg = '';
  let tone = 'good';
  if (id === 'gala') {
    const amt = Math.round(galaAmount(g) * (0.9 + Math.random() * 0.2));
    g.money += amt; addScandal(g, 1.5);
    msg = tt(`Donor dinner raised ${fmtEur(amt)}`, `Rėmėjų vakarienė surinko ${fmtEur(amt)}`);
  } else if (id === 'small') {
    const amt = Math.round(smallAmount(g) * (0.9 + Math.random() * 0.2));
    g.money += amt;
    if (['NA', 'LVZS', 'LP', 'LLRA'].includes(p)) g.momentum[p] = clamp(g.momentum[p] + 0.4, -10, 10);
    msg = tt(`Small donors chipped in ${fmtEur(amt)}`, `Smulkūs aukotojai suaukojo ${fmtEur(amt)}`);
  } else if (id === 'lobby') {
    g.pc -= A.pc;
    const amt = lobbyAmount(g);
    g.money += amt; addScandal(g, 12);
    msg = tt(`Business deal: +${fmtEur(amt)}. Scandal risk is rising!`, `Verslo sandoris: +${fmtEur(amt)}. Skandalo rizika auga!`);
    tone = 'warn';
  } else if (id === 'tvspot') {
    const before = nationalShares(g)[p];
    for (const r of REGIONS) gainSupport(g, r.id, p, 0.4 * (1.15 - 0.4 * r.urban) * geoMult(p, r) * satOf(p, r, regionShares(g, r)[p]), 0.7);
    msg = tt(`TV ad aired everywhere: ${fmtSignedPct(nationalShares(g)[p] - before)} nationally`, `TV reklama visoje šalyje: ${fmtSignedPct(nationalShares(g)[p] - before)}`);
  } else if (id === 'presser') {
    const d = 0.9 * [1, 0.55, 0.3, 0.15][Math.min(n, 3)];
    g.momentum[p] = clamp(g.momentum[p] + d, -10, 10);
    msg = tt(`You lead the evening news: buzz ${fmtSigned(d)}`, `Jūs – vakaro žiniose: pagreitis ${fmtSigned(d)}`);
  } else if (id === 'backchannel') {
    const d = [2, 1, 1, 0][Math.min(n, 3)];
    g.pc += d;
    msg = d ? tt(`Coffee with rivals: +${d} favour${d > 1 ? 's' : ''}`, `Kava su varžovais: +${d} ${plur(d, '', '', 'ryšys', 'ryšiai', 'ryšių')}`) : tt('Nobody wants another coffee this week.', 'Šią savaitę niekas nebenori kavos.');
  } else if (id === 'kompro') {
    const roll = Math.random();
    if (roll < 0.45) {
      g.momentum[target] = clamp(g.momentum[target] - 2.5, -10, 10);
      for (const r of REGIONS) loseSupport(g, r.id, target, 0.5 * (1 - g.gg[r.id][target] / 200), 0.6);
      REGIONS.forEach((r) => normalizeRegion(g, r.id));
      addNews(g, { kind: 'kompro', target, outcome: 'hit' });
      msg = tt(`Jackpot: leaked documents embarrass ${partyShort(target)}!`, `Pavyko: nutekinti dokumentai sukompromitavo ${partyShort(target)}!`);
    } else if (roll < 0.8) {
      msg = tt('Your investigators found nothing useful.', 'Tyrėjai nieko naudingo nerado.');
      tone = 'warn';
    } else {
      g.momentum[p] = clamp(g.momentum[p] - 1.5, -10, 10);
      addScandal(g, 10);
      addNews(g, { kind: 'kompro', target, outcome: 'exposed' });
      msg = tt('Exposed! The press found out you were digging for dirt.', 'Įkliuvote! Žiniasklaida sužinojo, kad rinkote kompromatą.');
      tone = 'bad';
    }
  }
  g.natActs[id] = n + 1;
  return { ok: true, tone, msg: msg + (vrkCheck(g) || '') };
}

/* ============================================================
   Risky money: casino & sports betting
   ============================================================ */
const RED_NUMS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const WHEEL_ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const CASINO_MAX_SPINS = 5;
function gambleCaught(g, game) {
  g.momentum[g.player] = clamp(g.momentum[g.player] - 1.8, -10, 10);
  addScandal(g, 14);
  addNews(g, { kind: 'gamble', game });
}
function enterCasino(g) {
  if (g.natActs.casino) return { ok: true };
  if (g.ap < 1) return { ok: false, msg: tt('Needs 1 energy.', 'Reikia 1 energijos.') };
  g.ap -= 1;
  g.natActs.casino = 1;
  g.natActs.spins = 0;
  return { ok: true };
}
function casinoSpin(g, stake, bet) {
  if (!g.natActs.casino) return { ok: false, msg: tt('You are not at the casino.', 'Jūs ne kazino.') };
  if ((g.natActs.spins || 0) >= CASINO_MAX_SPINS) return { ok: false, msg: tt('The casino manager asks you to leave.', 'Kazino vadybininkas mandagiai prašo išeiti.') };
  if (g.money < stake) return { ok: false, msg: tt('Not enough money for that stake.', 'Tokiam statymui pinigų nepakanka.') };
  g.natActs.spins = (g.natActs.spins || 0) + 1;
  const n = Math.floor(Math.random() * 37);
  const color = n === 0 ? 'green' : RED_NUMS.has(n) ? 'red' : 'black';
  const win = typeof bet === 'number' ? n === bet : color === bet;
  const payout = win ? (typeof bet === 'number' ? stake * 36 : stake * 2) : 0;
  g.money += payout - stake;
  g.stats.gambleNet += payout - stake;
  g.stats.gambles += 1;
  addScandal(g, win ? 5 : 3);
  const caught = Math.random() < 0.12;
  if (caught) gambleCaught(g, 'casino');
  return { ok: true, n, color, win, payout, caught };
}
const MATCHES = [bi('Real Madrid', 'Madrido „Real“'), bi('Fenerbahçe', 'Stambulo „Fenerbahçe“'), bi('Olympiacos', 'Pirėjo „Olympiacos“'), bi('Barcelona', '„Barcelona“'), bi('Panathinaikos', 'Atėnų „Panathinaikos“')];
function sportsBet(g, stake, pick) {
  if (g.ap < 1) return { ok: false, msg: tt('Needs 1 energy.', 'Reikia 1 energijos.') };
  if (g.money < stake) return { ok: false, msg: tt('Not enough money for that stake.', 'Tokiam statymui pinigų nepakanka.') };
  g.ap -= 1;
  g.stats.actions += 1;
  const opp = Math.floor(Math.random() * MATCHES.length);
  const zalg = Math.round(68 + Math.random() * 30);
  let other = Math.round(68 + Math.random() * 30);
  if (other === zalg) other += 1;
  const margin = zalg - other;
  const win = pick === 'win' ? margin > 0 : margin >= 12;
  const odds = pick === 'win' ? 1.85 : 4.5;
  const payout = win ? Math.round(stake * odds) : 0;
  g.money += payout - stake;
  g.stats.gambleNet += payout - stake;
  g.stats.gambles += 1;
  addScandal(g, win ? 5 : 3);
  const caught = Math.random() < 0.12;
  if (caught) gambleCaught(g, 'bet');
  return { ok: true, opp, zalg, other, win, payout, caught, odds };
}

/* ============================================================
   Platform
   ============================================================ */
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
  if (!c.changes.length) return { ok: false, msg: tt('No changes to announce.', 'Nėra ką skelbti.') };
  if (g.ap < 1) return { ok: false, msg: tt('Needs 1 energy.', 'Reikia 1 energijos.') };
  g.ap -= 1;
  for (const a of c.changes) g.lastShift[a] = Math.sign(draft[a] - g.stance[a]);
  addNews(g, { kind: 'platform', changes: c.changes.map((a) => [a, draft[a]]), uturn: c.uturns.length > 0 });
  g.stance = { ...draft };
  g.momentum[g.player] = clamp(g.momentum[g.player] - c.mom, -10, 10);
  g.pc = Math.max(0, g.pc - c.pc);
  g.stats.shifts += c.steps;
  return { ok: true, tone: c.mom > 0 ? 'warn' : 'good', msg: tt('New promises announced', 'Nauji pažadai paskelbti') + (c.mom > 0 ? tt(` · buzz ${fmtSigned(-c.mom)}`, ` · pagreitis ${fmtSigned(-c.mom)}`) : '') };
}

/* ============================================================
   AI campaigns & weekly cycle
   ============================================================ */
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
        if (Math.random() < BACKFIRE[p]) { loseSupport(g, r.id, p, POWER.backfire * k, 0.6); type = 'backfire'; }
        else loseSupport(g, r.id, target, POWER.attack * k * (1 - g.gg[r.id][target] / 160), 0.45, p, 0.35);
      }
      list.push({ type, rid: r.id, target });
    }
    g.momentum[p] = clamp(g.momentum[p] + gauss() * 0.45, -10, 10);
    moves.push({ p, list });
  }
  return moves;
}
const AI_VERB = {
  rally: bi('rallies', 'mitingai'), digital: bi('online ads', 'reklama internete'), tv: bi('TV & radio', 'TV ir radijas'),
  door: bi('door-knocking', 'agitacija'), backfire: bi('botched attack', 'nepavykęs puolimas'),
};
function describeMoves(m) {
  const by = {};
  const order = [];
  m.list.forEach((x) => {
    const key = x.type === 'attack' ? tt(`attack ads vs ${partyShort(x.target)}`, `puolimas prieš ${partyShort(x.target)}`) : L(AI_VERB[x.type]);
    if (!by[key]) { by[key] = new Set(); order.push(key); }
    by[key].add(rs(x.rid));
  });
  return order.map((k) => `${k} (${[...by[k]].join(', ')})`).join('; ');
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
  for (const G of GROUPS) g.groupMood[G.id] *= 0.93;
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
  if (Object.values(g.weekLog).some((n) => n > 0)) addNews(g, { kind: 'you', log: { ...g.weekLog } });
  const moves = aiTurn(g);
  weeklyDrift(g);
  for (const p of ALL_IDS) g.momentum[p] *= 0.8;
  g.scandal = Math.max(0, g.scandal - 1.5);
  const mid = nationalShares(g);
  const ord = PARTY_IDS.slice().sort((a, b) => mid[b] - mid[a]);
  const lead = mid[ord[0]] - mid[ord[1]];
  if (lead > 2.5) {
    g.momentum[ord[0]] = clamp(g.momentum[ord[0]] - 0.45 * (lead - 2.5), -10, 10);
    if (ord[0] === g.player) addNews(g, { kind: 'front', lead });
  }
  const after = nationalShares(g);
  const poll = {};
  for (const p of ALL_IDS) poll[p] = Math.max(0.3, after[p] + gauss() * 0.5);
  const pt = sum(Object.values(poll));
  for (const p of ALL_IDS) poll[p] = (poll[p] / pt) * 100;
  g.history.push({ week: g.week, shares: poll });
  moves.forEach((m) => addNews(g, { kind: 'rival', p: m.p, list: m.list }));
  if (g.week >= WEEKS) {
    g.queue = [];
    g.phase = 'night';
    const roll = Math.random();
    g.weather = roll < 0.3 ? 'sun' : roll < 0.75 ? 'cloud' : 'rain';
    g.election = simulateElection(g, true);
    return;
  }
  const report = { type: 'report', week: g.week, before, after, moves };
  if (g.tut >= 1 && g.tut < 5) g.tut = 5;
  startWeek(g);
  g.queue.unshift(report);
}

/* ============================================================
   Event & debate effects
   ============================================================ */
const TAG_BONUS = {
  welfare: { LSDP: 1.4, DSVL: 1.15, LVZS: 1.1 }, security: { TS: 1.3, LS: 1.1 }, populist: { NA: 1.4, LVZS: 1.15 },
  agri: { LVZS: 1.4, LSDP: 1.1 }, business: { LS: 1.3, TS: 1.15 }, youth: { LP: 1.5, LS: 1.2 }, minority: { LLRA: 2 },
  moderate: { DSVL: 1.3 }, green: { LP: 1.2, DSVL: 1.25 }, traditional: { LVZS: 1.4, LLRA: 1.3, NA: 1.1 }, progressive: { LP: 1.5, LS: 1.2 },
};
const TARGET_LABEL = { all: bi('Everywhere', 'Visur'), urban: bi('Cities', 'Miestai'), rural: bi('Villages', 'Kaimai'), border: bi('Border regions', 'Pasienis'), agri: bi('Farm country', 'Žemės ūkio kraštai') };
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
function applyGroups(g, groups, tag, mult = 1) {
  if (tag) GROUPS.forEach((G) => { if (G.tags.includes(tag)) g.groupMood[G.id] = clamp(g.groupMood[G.id] + 2.5 * mult, -20, 20); });
  if (groups) Object.entries(groups).forEach(([id, d]) => { g.groupMood[id] = clamp(g.groupMood[id] + d * (d > 0 ? mult : 1), -20, 20); });
}
function applyFx(g, fx, tag, isScandal) {
  const p = g.player;
  const mult = (TAG_BONUS[tag] && TAG_BONUS[tag][p]) || 1;
  if (fx.money) g.money = Math.max(0, g.money + fx.money);
  if (fx.pc) g.pc = Math.max(0, g.pc + fx.pc);
  if (fx.scandal) addScandal(g, fx.scandal);
  if (fx.mom) g.momentum[p] = clamp(g.momentum[p] + (fx.mom > 0 ? fx.mom * mult : fx.mom * (isScandal && p === 'NA' ? 1.5 : 1)), -10, 10);
  if (fx.reg) fx.reg.forEach(([t, d]) => applyTarget(g, t, d, mult));
  if (fx.axis) applyAxis(g, fx.axis[0], fx.axis[1], fx.axis[2], mult);
  if (fx.und) REGIONS.forEach((r) => gainSupport(g, r.id, p, FX_SCALE * fx.und * mult * geoMult(p, r), 1));
  applyGroups(g, fx.groups, tag, mult);
  REGIONS.forEach((r) => normalizeRegion(g, r.id));
}
function fxChips(fx) {
  if (!fx) return [];
  const out = [];
  if (fx.money) out.push({ t: `${fx.money > 0 ? '+' : '−'}${fmtEur(Math.abs(fx.money))}`, good: fx.money > 0 });
  if (fx.mom) out.push({ t: `${tt('Buzz', 'Pagreitis')} ${fx.mom > 0 ? '▲' : '▼'}`, good: fx.mom > 0 });
  if (fx.pc) out.push({ t: `${tt('Favours', 'Ryšiai')} ${fx.pc > 0 ? '+' : '−'}${Math.abs(fx.pc)}`, good: fx.pc > 0 });
  if (fx.scandal) out.push({ t: `${tt('Scandal risk', 'Skandalo rizika')} ${fx.scandal > 0 ? '▲' : '▼'}`, good: fx.scandal < 0 });
  if (fx.und) out.push({ t: `${tt('Undecided', 'Neapsisprendę')} ▲`, good: true });
  (fx.reg || []).forEach(([t, d]) => {
    const name = TARGET_LABEL[t] ? L(TARGET_LABEL[t]) : REG[t] ? rs(t) : t;
    out.push({ t: `${name} ${d > 0 ? (d >= 1.5 ? '▲▲' : '▲') : d <= -1.5 ? '▼▼' : '▼'}`, good: d > 0 });
  });
  if (fx.groups) Object.entries(fx.groups).forEach(([id, d]) => out.push({ t: `${L(GROUPS.find((G) => G.id === id).name)} ${d > 0 ? '▲' : '▼'}`, good: d > 0 }));
  if (fx.axis) {
    const [ax, dir] = fx.axis;
    const nm = {
      econ: dir < 0 ? tt('Welfare fans', 'Paramos šalininkai') : tt('Tax-cut fans', 'Mokesčių mažinimo šalininkai'),
      social: dir < 0 ? tt('Liberal voters', 'Liberalūs rinkėjai') : tt('Traditional voters', 'Tradicinių vertybių rinkėjai'),
      defense: dir > 0 ? tt('Army fans', 'Kariuomenės rėmėjai') : tt('Army sceptics', 'Kariuomenės skeptikai'),
      green: dir > 0 ? tt('Green voters', 'Žalieji rinkėjai') : tt('Energy-bill voters', 'Sąskaitomis susirūpinę'),
    }[ax];
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
  } else applyFx(g, ch.fx, ch.tag, ev.scandal);
  const after = { share: nationalShares(g)[p], money: g.money, pc: g.pc, mom: g.momentum[p] };
  g.stats.events += 1;
  addNews(g, { kind: 'event', ev: ev.id, ci, note });
  item.done = { ci, before, after, note };
}
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
    const st = (g.stance[ans.axis[0]] / 90) * ans.axis[1];
    if (st >= 0.3) { s += 1.2 * st; note = 'fits'; } else if (st <= -0.3) { s += 2.8 * st; note = 'clash'; }
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
    if (score > 6) applyGroups(g, null, ans.style, 0.6);
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
  addNews(g, { kind: 'debate', d: idx, winner: poll[0].p, pct: poll[0].pct, rank });
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
  const W = WEATHER[g.weather || 'cloud'];
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
    const rainHit = (W.rural - 1) * (1 - r.urban);
    for (const p of ALL_IDS) {
      let f = eff[p] + (U * w[p]) / ws;
      f *= natErr[p] * Math.exp(ng() * 0.05);
      f *= 1 + g.boost[r.id][p] + g.gg[r.id][p] / 400;
      f *= 1 + rainHit * (URB_SENS[p] < 0 ? 1.2 : 0.4) * (1 - g.gg[r.id][p] / 150);
      vs[p] = f;
    }
    const t = sum(Object.values(vs));
    const avgBoost = sum(ALL_IDS.map((p) => (g.boost[r.id][p] * vs[p]) / t));
    const wMult = r.urban * W.urban + (1 - r.urban) * W.rural;
    const turnout = clamp(r.turnout * wMult * (1 + 0.5 * avgBoost) + ng() * 0.01, 0.2, 0.85);
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
  const natOrd = PARTY_IDS.slice().sort((a, b) => natShares[b] - natShares[a]);
  const natLead = natShares[natOrd[0]] - natShares[natOrd[1]];
  const damp = natLead > 4 ? Math.max(0.45, 1 - (natLead - 4) * 0.09) : 1;
  const tAff = (q, X) => transferAff(g, q, X) * (X === natOrd[0] ? damp : 1);
  const smd = [];
  for (const r of REGIONS) {
    r.cons.forEach((c, i) => {
      const cid = `${r.id}-${i}`;
      const Lc = g.leans[cid];
      const st = g.stars[cid] || {};
      const cand = ALL_IDS.map((p) => ({ p, s: regions[r.id].shares[p] * Lc[p] * (st[p] != null ? (p === g.player ? 1.22 : 1.18) : 1) * Math.exp(ng() * 0.1) }));
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
        const tt2 = va + vb;
        e.round = 2;
        e.runoff = { a: A.p, b: B.p, sa: (va / tt2) * 100, sb: (vb / tt2) * 100 };
        e.winner = va >= vb ? A.p : B.p;
        e.margin = (Math.abs(va - vb) / tt2) * 100;
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
const affKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
function compat(g, a, b) {
  if (a === 'KITI' || b === 'KITI') return 55;
  const pa = posOf(g, a), pb = posOf(g, b);
  const d = sum(AXIS_IDS.map((x) => Math.abs(pa[x] - pb[x])));
  let c = 100 - d / 3.6 + (AFFINITY[affKey(a, b)] || 0);
  if (a === 'DSVL' || b === 'DSVL') c += 20;
  return clamp(Math.round(c), 0, 100);
}
function cabinet(g, partners) {
  const S = g.election.seats;
  const members = [g.player, ...partners.filter((p) => p !== 'KITI')];
  const total = sum(members.map((p) => S[p]));
  const counts = {};
  let used = 0;
  members.slice(1).forEach((p) => { counts[p] = Math.max(1, Math.round((S[p] / total) * 14)); used += counts[p]; });
  counts[g.player] = Math.max(0, 14 - used);
  const free = [...MINISTRY_IDS];
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
  const largest = ALL_IDS.slice().sort((a, b) => S[b] - S[a])[0];
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
function confidenceVote(g, members, stab) {
  const S = g.election.seats;
  const total = sum(members.map((p) => S[p]));
  const defectRate = clamp((72 - stab) / 380, 0, 0.13);
  let ayes = 0;
  members.forEach((p) => { ayes += S[p] - Math.round(S[p] * defectRate * (0.4 + Math.random() * 1.2)); });
  ayes += Math.round((141 - total) * (0.02 + Math.random() * 0.05));
  ayes = Math.min(141, ayes);
  const abst = Math.round((141 - ayes) * (0.06 + Math.random() * 0.08));
  const noes = 141 - ayes - abst;
  return { ayes, noes, abst, passed: ayes > noes };
}

/* ============================================================
   Hemicycle layout (141 seats)
   ============================================================ */
function hemiLayout(total, rows) {
  const r0 = 0.36, r1 = 1;
  const radii = Array.from({ length: rows }, (_, i) => r0 + ((r1 - r0) * i) / (rows - 1));
  const rsum = sum(radii);
  const counts = radii.map((r) => Math.round((total * r) / rsum));
  let diff = total - sum(counts);
  let i = rows - 1;
  while (diff !== 0) { counts[i] += diff > 0 ? 1 : -1; diff += diff > 0 ? -1 : 1; i = (i - 1 + rows) % rows; }
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
   Advisor (Rūta)
   ============================================================ */
const ACTION_WHY = {
  rally: bi('Rallies fire up your fans and get them to the polls.', 'Mitingai uždega rėmėjus ir atveda juos prie balsadėžių.'),
  digital: bi('Online ads reach young voters in the cities.', 'Reklama internete pasiekia jaunus miestų rinkėjus.'),
  tv: bi('TV & radio reach older voters in the villages.', 'TV ir radijas pasiekia vyresnius kaimų rinkėjus.'),
  door: bi('Door-knocking protects your voters from rival attacks.', 'Agitacija apsaugo jūsų rinkėjus nuo varžovų puolimų.'),
  star: bi('A famous local candidate can tip a close district.', 'Žinomas vietos kandidatas gali nulemti lygią apygardą.'),
  attack: bi('An attack ad can knock the leader down a peg.', 'Puolamoji reklama gali nuleisti lyderį žemyn.'),
};
function raceInfo(g, r, sharesIn) {
  const p = g.player;
  const s = sharesIn || regionShares(g, r);
  const ord = PARTY_IDS.slice().sort((a, b) => s[b] - s[a]);
  const lead = ord[0];
  const rival = lead === p ? ord[1] : lead;
  const gap = s[p] - s[rival];
  const rank = ord.indexOf(p) + 1;
  const status = gap >= 4 ? 'safe' : gap > -4 ? 'close' : gap > -10 ? 'behind' : 'far';
  return { s, ord, lead, rival, gap, rank, status };
}
const STATUS_LOOK = {
  safe: { label: bi('Winning', 'Pirmaujate'), bg: '#BBF7D0' },
  close: { label: bi('Toss-up', 'Lygi kova'), bg: '#FDE68A' },
  behind: { label: bi('Behind', 'Atsiliekate'), bg: '#FED7AA' },
  far: { label: bi('Long shot', 'Mažai šansų'), bg: '#FECACA' },
};
function raceText(info) {
  const R = partyShort(info.rival);
  const x = fmtPct(Math.abs(info.gap));
  if (info.gap >= 4) return tt(`You lead ${R} by ${x}`, `Lenkiate ${R} ${x}`);
  if (info.gap > 0) return tt(`Tight! You lead ${R} by just ${x}`, `Įtempta! Lenkiate ${R} vos ${x}`);
  if (info.gap > -4) return tt(`Close race: ${R} is ahead by ${x}`, `Lygi kova: ${R} priekyje ${x}`);
  return tt(`${R} is ahead by ${x}`, `${R} priekyje ${x}`);
}
function attackBackfire(g, r) { return BACKFIRE[g.player] + (g.player === 'TS' && r.urban < 0.6 ? 0.1 : 0) + 0.06 * g.attacksThisWeek; }
const vrkRoom = (g) => VRK_LIMIT - g.stats.spent;
function bestActionIn(g, r, info) {
  const p = g.player;
  let best = null;
  for (const type of ['rally', 'digital', 'tv']) {
    const cost = actionCost(type, r, p);
    if (cost > g.money || cost > vrkRoom(g)) continue;
    const gain = actionPreview(g, r.id, type);
    const sc = gain / Math.pow(cost, 0.3);
    if (!best || sc > best.sc) best = { type, gain, cost, sc };
  }
  const doorCost = actionCost('door', r, p);
  if (Math.abs(info.gap) < 5 && g.gg[r.id][p] < 45 && doorCost <= g.money && doorCost <= vrkRoom(g)) {
    const sc = (actionPreview(g, r.id, 'door') + 0.45) / Math.pow(doorCost, 0.3);
    if (!best || sc > best.sc) best = { type: 'door', gain: actionPreview(g, r.id, 'door'), cost: doorCost, sc };
  }
  const st = starTarget(g, r.id);
  if (st && st.gap < 0 && st.gap > -4 && g.money >= actionCost('star', r, p) + 60 && actionCost('star', r, p) <= vrkRoom(g)) {
    const sc = 1.4 / Math.pow(actionCost('star', r, p), 0.3);
    if (!best || sc > best.sc) best = { type: 'star', gain: 0, cost: actionCost('star', r, p), sc };
  }
  return best;
}
function recommendMoves(g, limit = 3) {
  const p = g.player;
  const nat = nationalShares(g)[p];
  const nearLine = nat < 6.5;
  const recs = [];
  for (const r of REGIONS) {
    const info = raceInfo(g, r);
    const best = bestActionIn(g, r, info);
    if (!best) continue;
    const closeness = Math.exp(-Math.abs(info.gap) / 6);
    const smd = r.seats * closeness * (nearLine ? 0.35 : 1);
    const pr = ((r.voters * r.turnout) / 90) * (nearLine ? 1.6 : 0.6);
    const fat = FATIGUE[Math.min(g.weekActs[r.id] || 0, FATIGUE.length - 1)];
    const score = best.sc * (smd + pr) * fat;
    let why;
    if (nearLine) why = tt(`You need 5% nationally to win list seats. ${rl(r)} has plenty of voters who like you.`, `Norint gauti daugiamandatės vietų, reikia 5 % visoje šalyje. ${rl(r)} – daug jums palankių rinkėjų.`);
    else if (Math.abs(info.gap) < 4) why = tt(`${raceText(info)}. A small push here could swing ${r.seats} ${seatsWord(r.seats)}.`, `${raceText(info)}. Mažas postūmis čia gali nulemti: ${r.seats} ${seatsWord(r.seats)}.`);
    else if (info.gap < 0) why = tt(`${raceText(info)}, but ${r.seats} ${seatsWord(r.seats)} are worth chasing.`, `${raceText(info)}, bet verta kovoti: ${r.seats} ${seatsWord(r.seats)}.`);
    else why = tt(`${raceText(info)}. Keep these ${r.seats} ${seatsWord(r.seats)} safe.`, `${raceText(info)}. Išsaugokite: ${r.seats} ${seatsWord(r.seats)}.`);
    recs.push({ kind: 'region', rid: r.id, type: best.type, cost: best.cost, gain: best.gain, score, why });
  }
  recs.sort((a, b) => b.score - a.score);
  const out = [];
  const cheapest = Math.min(...REGIONS.map((r) => actionCost('rally', r, p)));
  if (g.money < cheapest * 3 && g.ap >= 1) out.push({ kind: 'national', id: 'gala', why: tt('Money is running low, and every move costs euros.', 'Pinigų lieka mažai, o kiekvienas žingsnis kainuoja.') });
  for (const rc of recs) {
    if (out.length >= limit) break;
    if (!out.some((o) => o.rid === rc.rid)) out.push(rc);
  }
  return out;
}
const runRec = (g, rec) => (rec.kind === 'national' ? doNational(g, rec.id) : doRegionAction(g, rec.rid, rec.type));
function autoPlan(g) {
  const done = [];
  let guard = 0;
  while (g.ap > 0 && guard < 12) {
    guard += 1;
    const [rec] = recommendMoves(g, 1);
    if (!rec) break;
    const res = runRec(g, rec);
    if (!res.ok) break;
    done.push(rec.kind === 'national' ? tt('a fundraiser', 'lėšų rinkimas') : rs(rec.rid));
  }
  if (!done.length) return { ok: false, msg: tt('Nothing affordable left to do this week.', 'Šią savaitę įperkamų žingsnių neliko.') };
  const places = [...new Set(done)];
  const more = places.length > 3 ? tt(' and more', ' ir kt.') : '';
  return { ok: true, tone: 'good', msg: tt(`Rūta spent ${done.length} energy: ${places.slice(0, 3).join(', ')}${more}.`, `Rūta panaudojo ${done.length} energijos: ${places.slice(0, 3).join(', ')}${more}.`) };
}
function adviseEvent(g, ev) {
  let best = 0, bestScore = -Infinity;
  ev.choices.forEach((ch, i) => {
    let score;
    if (ch.risk) score = -0.5;
    else {
      const t = clone(g);
      const before = nationalShares(t)[t.player];
      applyFx(t, ch.fx, ch.tag, ev.scandal);
      score = (nationalShares(t)[t.player] - before) + 0.12 * (t.pc - g.pc) + (t.money - g.money) / 500 - Math.max(0, t.scandal - g.scandal) / 25;
    }
    if (score > bestScore) { bestScore = score; best = i; }
  });
  return best;
}
function expectedAnswerScore(g, ans) {
  let s = ans.base + ((STYLE_BONUS[g.player] || {})[ans.style] || 0);
  if (ans.axis) {
    const st = (g.stance[ans.axis[0]] / 90) * ans.axis[1];
    if (st >= 0.3) s += 1.2 * st;
    else if (st <= -0.3) s += 2.8 * st;
  }
  return s;
}
function coalitionPaths(g, seats) {
  const me = g.player;
  const others = PARTY_IDS.filter((p) => p !== me && seats[p] > 0);
  const out = [];
  const rec = (start, chosen) => {
    if (chosen.length) {
      const members = [me, ...chosen];
      const total = sum(members.map((p) => seats[p]));
      if (total >= MAJORITY && chosen.every((m) => total - seats[m] < MAJORITY)) {
        let minC = 100;
        for (let i = 0; i < members.length; i++) for (let j = i + 1; j < members.length; j++) minC = Math.min(minC, compat(g, members[i], members[j]));
        out.push({ chosen: [...chosen], total, minC });
      }
    }
    if (chosen.length >= 3) return;
    for (let i = start; i < others.length; i++) { chosen.push(others[i]); rec(i + 1, chosen); chosen.pop(); }
  };
  rec(0, []);
  return out.sort((a, b) => b.minC - a.minC || a.chosen.length - b.chosen.length || b.total - a.total).slice(0, 3);
}
function suggestTeam(g) {
  const S = g.election.seats;
  const me = g.player;
  const others = [...PARTY_IDS.filter((p) => p !== me && S[p] > 0), ...(S.KITI > 0 ? ['KITI'] : [])];
  let best = null;
  const rec = (start, chosen) => {
    if (chosen.length) {
      const total = S[me] + sum(chosen.map((p) => S[p]));
      if (total >= MAJORITY && chosen.every((m) => total - S[m] < MAJORITY)) {
        const coal = { partners: [...chosen], accepted: {}, sweet: {} };
        const minW = Math.min(...chosen.map((p) => willingness(g, p, coal)));
        const st = stability(g, coal);
        const score = Math.min(minW, 60) * 2 + st;
        if (!best || score > best.score) best = { partners: [...chosen], score, minW, st, total };
      }
    }
    if (chosen.length >= 4) return;
    for (let i = start; i < others.length; i++) { chosen.push(others[i]); rec(i + 1, chosen); chosen.pop(); }
  };
  rec(0, []);
  return best;
}
function groupApproval(g, G) {
  const d = sum(AXIS_IDS.map((a) => Math.abs(g.stance[a] - G.ideal[a])));
  return clamp(Math.round(88 - d / 4.2 + (g.groupMood[G.id] || 0) * 1.5), 3, 97);
}

/* ============================================================
   Save / load (per-viewer convenience)
   ============================================================ */
const SAVE_KEY = 'seimas-bfl-save-v3';
function loadSave() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const g = JSON.parse(raw);
    return g && g.v === 3 && g.phase !== 'result' ? g : null;
  } catch (e) { return null; }
}
function writeSave(g) {
  try {
    if (!g || g.phase === 'result') window.localStorage.removeItem(SAVE_KEY);
    else window.localStorage.setItem(SAVE_KEY, JSON.stringify(g));
  } catch (e) { /* storage unavailable */ }
}

/* ============================================================
   UI building blocks
   ============================================================ */
function Tricolor({ className = '', h = 5 }) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-md ${className}`} style={{ border: `2.5px solid ${INK}` }} aria-hidden="true">
      <span style={{ background: FLAG.y, height: h }} />
      <span style={{ background: FLAG.g, height: h }} />
      <span style={{ background: FLAG.r, height: h }} />
    </div>
  );
}
function Btn({ children, onClick, disabled, kind = 'sun', className = '', ...rest }) {
  return <button type="button" onClick={onClick} disabled={disabled} className={`cx-btn cx-${kind} ${className}`} {...rest}>{children}</button>;
}
function Card({ children, className = '', style }) {
  return <section className={`cx-card ${className}`} style={style}>{children}</section>;
}
function CardTitle({ children, sub, right, info }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="min-w-0">
        <h3 className="cx-title text-xl leading-tight inline-flex items-center gap-2">{children}{info}</h3>
        {sub && <p className="text-sm t-muted font-semibold mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
function PartyDot({ p, size = 14 }) {
  return <span className="inline-block rounded-full shrink-0" style={{ width: size, height: size, background: PARTIES[p].color, border: `2px solid ${INK}` }} />;
}
function PartyEmblem({ p, size = 48, label }) {
  const P = PARTIES[p];
  const Icon = P.emblem;
  return (
    <span className="relative inline-grid place-items-center rounded-full shrink-0" style={{ width: size, height: size, background: P.color, border: `3px solid ${INK}` }} aria-hidden="true">
      <span className="grid place-items-center rounded-full bg-white" style={{ width: size * 0.62, height: size * 0.62, border: `2px solid ${INK}` }}>
        <Icon size={size * 0.34} strokeWidth={2.6} style={{ color: P.color === '#EAB308' ? '#A16207' : P.color }} />
      </span>
      {label != null && (
        <span className="absolute -bottom-1.5 -right-1.5 cx-num text-xs rounded-full px-1.5 bg-white" style={{ border: `2px solid ${INK}`, lineHeight: '18px' }}>{label}</span>
      )}
    </span>
  );
}
function PartyChip({ p, children }) {
  return <span className="cx-chip px-2 py-0.5 text-sm"><PartyDot p={p} size={12} />{partyShort(p)}{children}</span>;
}
function Bar({ value, max = 100, color = SUN, mark, h = 14 }) {
  return (
    <div className="cx-track relative" style={{ height: h }}>
      <div className="h-full" style={{ width: `${clamp((value / max) * 100, 0, 100)}%`, background: color, borderRight: value > 0 ? `2px solid ${INK}` : 'none' }} />
      {mark != null && <div className="absolute top-0 bottom-0" style={{ left: `${(mark / max) * 100}%`, width: 3, background: INK }} />}
    </div>
  );
}
function Delta({ v, d = 1, pct }) {
  if (v == null || Math.abs(v) < 0.05) return <span className="t-muted">±0</span>;
  return <span style={{ color: v > 0 ? GREEN : RED }}>{v > 0 ? '▲' : '▼'}{pct ? fmtPct(Math.abs(v), d) : nf(Math.abs(v), d)}</span>;
}
function Advisor({ size = 48 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="shrink-0" role="img" aria-label={tt('Rūta, your campaign manager', 'Rūta, jūsų štabo vadovė')}>
      <circle cx="32" cy="32" r="29.5" fill="#FFE08A" stroke={INK} strokeWidth="3" />
      <path d="M13 40 C10 18 22 10 32 10 C44 10 54 18 51 40 Z" fill="#7A4A2E" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M17 61 C19 50 25 46 32 46 C39 46 45 50 47 61" fill="#2F6FDE" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="27" y="47" width="10" height="3" fill={FLAG.y} /><rect x="27" y="50" width="10" height="3" fill={FLAG.g} /><rect x="27" y="53" width="10" height="3" fill={FLAG.r} />
      <circle cx="32" cy="32" r="13.5" fill="#F8CBA6" stroke={INK} strokeWidth="2.5" />
      <path d="M18.5 30 C20 20 28 17 33 18 C40 19 45 23 45.5 30 C40 26 33 24 25 27 Z" fill="#7A4A2E" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="27" cy="32.5" r="1.9" fill={INK} /><circle cx="37" cy="32.5" r="1.9" fill={INK} />
      <circle cx="23.5" cy="37" r="2.2" fill="#F28B82" opacity="0.7" /><circle cx="40.5" cy="37" r="2.2" fill="#F28B82" opacity="0.7" />
      <path d="M27.5 38 Q32 42.5 36.5 38" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
function Coach({ title, children, actions, onSkip, className = '' }) {
  return (
    <div className={`cx-card cx-cream p-3 sbl-pop ${className}`} role="note">
      <div className="flex gap-3 items-start">
        <Advisor size={46} />
        <div className="min-w-0 flex-1">
          {title && <div className="cx-title text-lg leading-tight">{title}</div>}
          <div className="text-sm font-semibold leading-snug mt-0.5">{children}</div>
        </div>
        {onSkip && <button type="button" onClick={onSkip} className="text-xs font-extrabold underline t-muted shrink-0 h-8">{tt('Skip tips', 'Be patarimų')}</button>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 mt-3">{actions}</div>}
    </div>
  );
}
function Sheet({ onClose, children, label, z = 'z-40', dark }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className={`fixed inset-0 ${z} flex flex-col justify-end`} role="dialog" aria-modal="true" aria-label={label}>
      <div className="absolute inset-0 sbl-fade" style={{ background: 'rgba(31,37,68,0.55)' }} onClick={onClose || undefined} />
      <div
        className={`sbl-sheet sbl-scroll relative w-full max-w-lg mx-auto overflow-y-auto ${dark ? 'cx-night' : ''}`}
        style={{ maxHeight: '92vh', background: dark ? '#23284A' : '#fff', borderTop: `3px solid ${INK}`, borderLeft: `3px solid ${INK}`, borderRight: `3px solid ${INK}`, borderRadius: '28px 28px 0 0', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 22px)' }}
      >
        {children}
      </div>
    </div>
  );
}
function SheetHead({ kicker, title, onClose, dark }) {
  return (
    <div className="sticky top-0 z-10 pt-3 pb-3" style={{ ...GUTTER, background: dark ? '#23284A' : '#fff', borderBottom: `2px solid ${dark ? '#3A4070' : '#E3EDF5'}` }}>
      <div className="mx-auto w-12 h-1.5 rounded-full mb-3" style={{ background: dark ? '#4B5288' : '#CBD5E1' }} />
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          {kicker && <div className="text-sm font-extrabold" style={{ color: dark ? '#C7CCEB' : MUTED }}>{kicker}</div>}
          <h2 className="cx-title text-3xl leading-none">{title}</h2>
        </div>
        {onClose && <button type="button" onClick={onClose} aria-label={tt('Close', 'Uždaryti')} className="cx-btn cx-white shrink-0" style={{ width: 46, height: 46, borderRadius: 999, color: INK }}><X size={22} /></button>}
      </div>
    </div>
  );
}
function Mood({ w, size = 22 }) {
  const Icon = w >= 50 ? Smile : w >= 35 ? Meh : Frown;
  const color = w >= 65 ? GREEN : w >= 50 ? '#16A34A' : w >= 35 ? AMBER : RED;
  return <Icon size={size} style={{ color }} strokeWidth={2.6} />;
}
function InfoTip({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={tt(`What is ${title}?`, `Kas yra „${title}“?`)} className="inline-grid place-items-center rounded-full shrink-0 bg-white" style={{ width: 24, height: 24, border: `2px solid ${INK}` }}>
        <HelpCircle size={14} strokeWidth={2.6} />
      </button>
      {open && (
        <Sheet onClose={() => setOpen(false)} label={title} z="z-50">
          <SheetHead title={title} onClose={() => setOpen(false)} />
          <div style={GUTTER} className="pt-4 flex flex-col gap-3">
            <div className="flex gap-3 items-start"><Advisor size={44} /><div className="font-semibold leading-relaxed">{children}</div></div>
            <Btn className="h-12" onClick={() => setOpen(false)}>{tt('Got it', 'Supratau')}</Btn>
          </div>
        </Sheet>
      )}
    </>
  );
}
function LangToggle({ lang, setLang, className = '' }) {
  return (
    <div className={`inline-flex rounded-full bg-white p-0.5 shrink-0 ${className}`} style={{ border: `2.5px solid ${INK}` }} role="radiogroup" aria-label={tt('Language', 'Kalba')}>
      {[['lt', 'LT'], ['en', 'EN']].map(([v, l]) => (
        <button key={v} type="button" role="radio" aria-checked={lang === v} onClick={() => setLang(v)} className="rounded-full px-2.5 h-8 text-sm font-black" style={{ background: lang === v ? SUN : 'transparent' }}>{l}</button>
      ))}
    </div>
  );
}
function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 46 }).map((_, i) => ({
    left: Math.random() * 100, delay: Math.random() * 1.2, dur: 2.4 + Math.random() * 2, color: [FLAG.y, FLAG.g, FLAG.r, '#7DD3FC', '#F9A8D4', '#fff'][i % 6], rot: Math.random() * 180,
  })), []);
  return (
    <div aria-hidden="true">
      {pieces.map((c, i) => <span key={i} className="cx-confetti" style={{ left: `${c.left}%`, background: c.color, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s`, transform: `rotate(${c.rot}deg)` }} />)}
    </div>
  );
}

/* ============================================================
   Seat chart, poll bars, trend
   ============================================================ */
function Hemicycle({ seats, highlight, dim, label = '', showCount = true }) {
  const left = SEAT_ORDER.slice(0, 6);
  const right = SEAT_ORDER.slice(6);
  const Lx = [], Rx = [];
  left.forEach((p) => { for (let i = 0; i < (seats[p] || 0); i++) Lx.push(p); });
  right.forEach((p) => { for (let i = 0; i < (seats[p] || 0); i++) Rx.push(p); });
  const empty = Math.max(0, 141 - Lx.length - Rx.length);
  const colors = [...Lx, ...Array(empty).fill(null), ...Rx].slice(0, 141);
  const n = highlight ? seats[highlight] || 0 : sum(Object.values(seats));
  return (
    <svg viewBox="-1.08 -1.08 2.16 1.14" className="w-full h-auto block" role="img" aria-label={tt(`Seat chart: ${n} seats`, `Vietų schema: ${n} ${seatsWord(n)}`)}>
      <line x1="0" y1="-1.07" x2="0" y2="-0.3" stroke={INK} strokeWidth="0.012" strokeDasharray="0.035 0.03" />
      {HEMI.map((s, i) => {
        const p = colors[i];
        const faded = p && dim && !dim.includes(p);
        return <circle key={i} cx={s.x} cy={s.y} r={0.042} fill={p ? PARTIES[p].color : '#D6E4EF'} fillOpacity={faded ? 0.3 : 1} stroke={INK} strokeWidth={p === highlight && p ? 0.02 : 0.009} strokeOpacity={faded ? 0.3 : 1} />;
      })}
      {showCount && (
        <g>
          <text x="0" y="-0.09" textAnchor="middle" fill={INK} fontSize="0.26" fontWeight="700" style={{ fontFamily: FONT_TITLE }}>{n}</text>
          <text x="0" y="-0.0" textAnchor="middle" fill={MUTED} fontSize="0.075" fontWeight="800" style={{ fontFamily: F_BODY }}>{label}</text>
        </g>
      )}
    </svg>
  );
}
function PollBars({ shares, highlight, threshold, deltas }) {
  const ids = ALL_IDS.slice().sort((a, b) => (a === 'KITI' ? 1 : 0) - (b === 'KITI' ? 1 : 0) || shares[b] - shares[a]);
  const max = Math.max(30, ...ids.map((p) => shares[p]));
  const cols = deltas ? '84px 1fr 52px 50px' : '84px 1fr 56px';
  return (
    <div className="flex flex-col gap-2">
      {ids.map((p) => (
        <div key={p} className="grid items-center gap-2" style={{ gridTemplateColumns: cols }}>
          <span className={`text-sm truncate inline-flex items-center gap-1.5 ${p === highlight ? 'font-black' : 'font-bold'}`}><PartyDot p={p} size={11} />{partyShort(p)}</span>
          <div className="cx-track relative" style={{ height: 16 }}>
            <div className="h-full" style={{ width: `${(shares[p] / max) * 100}%`, background: PARTIES[p].color, borderRight: `2px solid ${INK}` }} />
            {threshold && <div className="absolute top-0 bottom-0" style={{ left: `${(5 / max) * 100}%`, borderLeft: `2px dashed ${INK}` }} />}
          </div>
          <span className={`text-sm text-right cx-num ${p === highlight ? 'font-black' : ''}`}>{fmtPct(shares[p])}</span>
          {deltas && <span className="text-xs text-right font-extrabold"><Delta v={deltas[p]} /></span>}
        </div>
      ))}
      {threshold && <div className="text-xs font-bold t-muted">{tt('Dashed line = 5%. Below it, a party gets no list seats.', 'Brūkšninė linija – 5 %. Žemiau jos partija negauna vietų pagal sąrašą.')}</div>}
    </div>
  );
}
function SeatTable({ seats, pr, smd, highlight }) {
  const ids = ALL_IDS.filter((p) => (seats[p] || 0) > 0).sort((a, b) => seats[b] - seats[a]);
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="t-muted text-xs font-extrabold">
          <th className="text-left py-1">{tt('Party', 'Partija')}</th>
          <th className="text-right">{tt('List', 'Sąrašas')}</th>
          <th className="text-right">{tt('Local', 'Apygardos')}</th>
          <th className="text-right">{tt('Total', 'Iš viso')}</th>
        </tr>
      </thead>
      <tbody className="cx-num">
        {ids.map((p) => (
          <tr key={p} style={{ borderTop: '2px solid #E3EDF5' }} className={p === highlight ? 'font-black' : ''}>
            <td className="py-1.5"><span className="inline-flex items-center gap-2" style={{ fontFamily: F_BODY, fontWeight: 800 }}><PartyDot p={p} size={11} />{partyShort(p)}</span></td>
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
  const W = 340, H = 190, pl = 24, pr = 62, pt = 10, pb = 22;
  const vals = history.flatMap((h) => PARTY_IDS.map((p) => h.shares[p]));
  const yMax = Math.ceil(Math.max(25, ...vals) / 5) * 5;
  const x = (w) => pl + (w / WEEKS) * (W - pl - pr);
  const y = (v) => pt + (1 - v / yMax) * (H - pt - pb);
  const last = history[history.length - 1];
  const labels = PARTY_IDS.map((p) => ({ p, y: y(last.shares[p]) })).sort((a, b) => a.y - b.y);
  for (let i = 1; i < labels.length; i++) if (labels[i].y - labels[i - 1].y < 10) labels[i].y = labels[i - 1].y + 10;
  const over = labels.length ? labels[labels.length - 1].y - (H - pb + 2) : 0;
  if (over > 0) labels.forEach((l) => { l.y -= over; });
  const ticks = [];
  for (let v = 0; v <= yMax; v += 10) ticks.push(v);
  const order = PARTY_IDS.filter((p) => p !== player).concat(player);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={tt('Weekly national polling trend', 'Savaitinių apklausų tendencija')}>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} stroke="#DCE7F0" strokeWidth="1.2" />
          <text x={pl - 5} y={y(v) + 3} textAnchor="end" fontSize="8.5" fill={MUTED} fontWeight="700">{v}</text>
        </g>
      ))}
      <line x1={pl} x2={W - pr} y1={y(5)} y2={y(5)} stroke={INK} strokeWidth="1.2" strokeDasharray="4 3" opacity="0.6" />
      {DEBATE_WEEKS.map((w) => (
        <g key={w}>
          <line x1={x(w)} x2={x(w)} y1={pt} y2={H - pb} stroke="#B8C7D6" strokeWidth="1" strokeDasharray="2 3" />
          <text x={x(w)} y={H - pb + 12} textAnchor="middle" fontSize="8" fill={MUTED} fontWeight="800">LRT</text>
        </g>
      ))}
      {[0, 12].map((w) => <text key={w} x={x(w)} y={H - pb + 12} textAnchor="middle" fontSize="8" fill={MUTED} fontWeight="800">{w === 0 ? tt('Start', 'Pradžia') : tt('Vote', 'Rinkimai')}</text>)}
      {order.map((p) => {
        const pts = history.map((h) => `${x(h.week).toFixed(1)},${y(h.shares[p]).toFixed(1)}`).join(' ');
        const me = p === player;
        return (
          <g key={p}>
            {me && <polyline points={pts} fill="none" stroke={INK} strokeWidth={5.5} strokeLinejoin="round" strokeLinecap="round" />}
            <polyline points={pts} fill="none" stroke={PARTIES[p].color} strokeWidth={me ? 3 : 1.6} strokeOpacity={me ? 1 : 0.8} strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={x(last.week)} cy={y(last.shares[p])} r={me ? 4 : 2.4} fill={PARTIES[p].color} stroke={INK} strokeWidth={me ? 1.6 : 0.8} />
          </g>
        );
      })}
      {labels.map((l) => <text key={l.p} x={x(last.week) + 7} y={l.y + 3} fontSize="8.5" fontWeight={l.p === player ? 900 : 700} fill={INK}>{PARTIES[l.p].short} {nf(last.shares[l.p], 0)}</text>)}
    </svg>
  );
}

/* ============================================================
   Cartoon map
   ============================================================ */
const TOKENS = { VNO: { pos: CITY_POS.VNO, r: 40 }, KNS: { pos: CITY_POS.KNS, r: 34 }, ABR: { pos: [770, 588], r: 32 } };
const COUNTY_IDS = Object.keys(COUNTY_SHAPES);
const WAVES = [[-26, 70], [-14, 150], [-28, 230], [-10, 330], [30, 400]];
function starPath(cx, cy, R, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r : R;
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
}
function regionLook(s) {
  const ord = PARTY_IDS.slice().sort((a, b) => s[b] - s[a]);
  return { lead: ord[0], tossup: s[ord[0]] - s[ord[1]] < 3 };
}
function CartoonMap({ shares, sel, onSelect, stars }) {
  const starSet = new Set(stars || []);
  const key = (id) => (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(id); } };
  const txt = { fill: INK, stroke: '#fff', strokeWidth: 7, paintOrder: 'stroke', strokeLinejoin: 'round', style: { fontFamily: FONT_TITLE }, fontWeight: 700 };
  const aria = (id, look) => `${rl(id)}: ${REG[id].seats} ${seatsWord(REG[id].seats)}, ${tt('leading', 'pirmauja')} ${partyShort(look.lead)}${starSet.has(id) ? tt(', recommended', ', rekomenduojama') : ''}`;
  const star = (x, y, id) => <path key={`s-${id}`} className="cx-bob" d={starPath(x, y, 19, 8.5)} fill={SUN} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" pointerEvents="none" />;
  return (
    <svg viewBox="-40 -26 870 660" className="cx-map w-full h-auto block select-none" role="group" aria-label={tt('Map of Lithuania’s electoral regions', 'Lietuvos rinkimų regionų žemėlapis')}>
      <defs>
        <pattern id="cx-stripes" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect x="0" y="0" width="6" height="16" fill="#fff" fillOpacity="0.5" />
        </pattern>
      </defs>
      {WAVES.map(([x, y], i) => <path key={i} d={`M${x},${y} q7,-7 14,0 t14,0`} fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />)}
      <text x="-20" y="520" fontSize="17" fontWeight="800" fill="#3E77A3" letterSpacing="2" transform="rotate(-90 -20 520)" textAnchor="middle">{tt('BALTIC SEA', 'BALTIJOS JŪRA')}</text>
      <text x="660" y="20" fontSize="18" fontWeight="800" fill="#3E77A3" letterSpacing="3" textAnchor="middle">{tt('LATVIA', 'LATVIJA')}</text>
      <text x="752" y="432" fontSize="18" fontWeight="800" fill="#3E77A3" letterSpacing="2" textAnchor="middle">{tt('BELARUS', 'BALTARUSIJA')}</text>
      <text x="215" y="612" fontSize="18" fontWeight="800" fill="#3E77A3" letterSpacing="3" textAnchor="middle">{tt('POLAND', 'LENKIJA')}</text>
      <text x="100" y="420" fontSize="18" fontWeight="800" fill="#3E77A3" letterSpacing="3" textAnchor="middle">{tt('RUSSIA', 'RUSIJA')}</text>
      <g transform="translate(0,12)">{COUNTY_IDS.map((id) => <path key={`x-${id}`} d={COUNTY_SHAPES[id].d} fill={INK} stroke={INK} strokeWidth="13" strokeLinejoin="round" />)}</g>
      {COUNTY_IDS.map((id) => <path key={`o-${id}`} d={COUNTY_SHAPES[id].d} fill="#fff" stroke={INK} strokeWidth="13" strokeLinejoin="round" />)}
      {COUNTY_IDS.map((id) => {
        const look = regionLook(shares[id]);
        return (
          <g key={id} role="button" tabIndex={0} aria-label={aria(id, look)} onClick={() => onSelect(id)} onKeyDown={key(id)} style={{ cursor: 'pointer', outline: 'none' }}>
            <path d={COUNTY_SHAPES[id].d} fill={PARTIES[look.lead].color} stroke="#fff" strokeWidth="4.5" strokeLinejoin="round" />
            {look.tossup && <path d={COUNTY_SHAPES[id].d} fill="url(#cx-stripes)" pointerEvents="none" />}
          </g>
        );
      })}
      {sel && COUNTY_SHAPES[sel] && <path d={COUNTY_SHAPES[sel].d} fill="none" stroke={SUN} strokeWidth="9" strokeLinejoin="round" pointerEvents="none" />}
      {sel && COUNTY_SHAPES[sel] && <path d={COUNTY_SHAPES[sel].d} fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" pointerEvents="none" />}
      {Object.entries(TOKENS).map(([id, t]) => {
        const look = regionLook(shares[id]);
        const [x, y] = t.pos;
        return (
          <g key={id} role="button" tabIndex={0} aria-label={aria(id, look)} onClick={() => onSelect(id)} onKeyDown={key(id)} style={{ cursor: 'pointer', outline: 'none' }}>
            <circle cx={x} cy={y + 7} r={t.r} fill={INK} />
            <circle cx={x} cy={y} r={t.r} fill={PARTIES[look.lead].color} stroke={sel === id ? SUN : INK} strokeWidth={sel === id ? 8 : 5} />
            {look.tossup && <circle cx={x} cy={y} r={t.r - 4} fill="url(#cx-stripes)" pointerEvents="none" />}
            {id === 'ABR' && <path d={`M${x - t.r + 8},${y} H${x + t.r - 8} M${x},${y - t.r + 8} V${y + t.r - 8}`} stroke="#fff" strokeOpacity="0.35" strokeWidth="3" pointerEvents="none" />}
            <text x={x} y={y + 11} textAnchor="middle" fontSize={t.r > 36 ? 32 : 28} fontWeight="700" fill="#fff" stroke={INK} strokeWidth="6" paintOrder="stroke" strokeLinejoin="round" style={{ fontFamily: FONT_TITLE }} pointerEvents="none">{REG[id].seats}</text>
          </g>
        );
      })}
      {COUNTY_IDS.map((id) => {
        const [lx, ly] = COUNTY_SHAPES[id].label;
        return (
          <g key={`l-${id}`} pointerEvents="none">
            <circle cx={lx} cy={ly - 14} r="22" fill="#fff" stroke={INK} strokeWidth="4" />
            <text x={lx} y={ly - 5} textAnchor="middle" fontSize="26" fontWeight="700" fill={INK} style={{ fontFamily: FONT_TITLE }}>{REG[id].seats}</text>
            <text x={lx} y={ly + 30} textAnchor="middle" fontSize="25" {...txt}>{rs(id)}</text>
          </g>
        );
      })}
      {Object.entries(TOKENS).map(([id, t]) => {
        const [x, y] = t.pos;
        return <text key={`n-${id}`} x={x} y={id === 'ABR' ? y - t.r - 12 : y + t.r + 28} textAnchor="middle" fontSize="25" {...txt} pointerEvents="none">{rs(id)}</text>;
      })}
      {COUNTY_IDS.filter((id) => starSet.has(id)).map((id) => { const [lx, ly] = COUNTY_SHAPES[id].label; return star(lx + 26, ly - 38, id); })}
      {Object.entries(TOKENS).filter(([id]) => starSet.has(id)).map(([id, t]) => star(t.pos[0] + t.r * 0.8, t.pos[1] - t.r * 0.85, id))}
    </svg>
  );
}

/* ============================================================
   Region list & region card
   ============================================================ */
function StatusPill({ status }) {
  const S = STATUS_LOOK[status];
  return <span className="cx-chip px-2.5 py-0.5 text-xs whitespace-nowrap" style={{ background: S.bg }}>{L(S.label)}</span>;
}
function RegionRow({ r, g, s, mySeats, star, onClick }) {
  const info = raceInfo(g, r, s);
  const acts = g.weekActs[r.id] || 0;
  return (
    <button type="button" onClick={onClick} className="cx-tap cx-card w-full flex items-center gap-3 px-3 py-3 text-left" style={{ boxShadow: `0 4px 0 ${INK}` }}>
      <div className="relative shrink-0 grid place-items-center rounded-full cx-num text-lg" style={{ width: 48, height: 48, background: PARTIES[info.lead].color, border: `3px solid ${INK}`, color: '#fff', textShadow: `0 0 3px ${INK}, 0 0 1px ${INK}` }}>
        {r.seats}
        {star && <Star size={20} className="absolute -top-2 -right-2" style={{ color: INK, fill: SUN }} strokeWidth={2.5} aria-hidden="true" />}
        {star && <span className="sr-only">{tt('Recommended:', 'Rekomenduojama:')}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="cx-title text-lg leading-tight truncate">{rl(r)}</div>
        <div className="text-sm font-semibold t-muted truncate">{raceText(info)}</div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <StatusPill status={info.status} />
        <span className="text-xs font-extrabold t-muted">{acts > 0 ? tt(`${acts}× this week`, `${acts}× šią sav.`) : tt(`you win ${mySeats}/${r.seats}`, `laimite ${mySeats}/${r.seats}`)}</span>
      </div>
      <ChevronRight size={20} className="shrink-0" />
    </button>
  );
}
function ActionTile({ type, g, r, rival, onAction, best }) {
  const A = ACTIONS[type];
  const p = g.player;
  const cost = actionCost(type, r, p);
  const disabled = g.ap < 1 || g.money < cost;
  const und = g.undecided[r.id];
  let effect;
  if (type === 'attack') effect = tt(`${partyShort(rival)} ▼ · ${Math.round(attackBackfire(g, r) * 100)}% backfire risk`, `${partyShort(rival)} ▼ · ${Math.round(attackBackfire(g, r) * 100)} % rizika atsisukti`);
  else if (type === 'door') effect = tt(`Ground team ${Math.round(g.gg[r.id][p])} → ${Math.round(Math.min(100, g.gg[r.id][p] + 14 * (1 - g.gg[r.id][p] / 110) * geoMult(p, r)))}`, `Komanda ${Math.round(g.gg[r.id][p])} → ${Math.round(Math.min(100, g.gg[r.id][p] + 14 * (1 - g.gg[r.id][p] / 110) * geoMult(p, r)))}`);
  else if (type === 'star') {
    const t = starTarget(g, r.id);
    effect = t ? tt(`${consById(t.cid)[0]}: ${t.gap < 0 ? 'you trail' : 'you lead'}`, `${consById(t.cid)[0]}: ${t.gap < 0 ? 'atsiliekate' : 'pirmaujate'}`) : tt('Every district covered', 'Visos apygardos užimtos');
  } else effect = tt(`About +${nf((actionPreview(g, r.id, type) * 100) / (100 - und))}% for you`, `Apie +${nf((actionPreview(g, r.id, type) * 100) / (100 - und))} % jums`);
  const Icon = A.icon;
  return (
    <button type="button" disabled={disabled} onClick={() => onAction(r.id, type)} className={`cx-btn ${best ? 'cx-cream' : 'cx-white'} flex-col items-start text-left p-3`} style={{ minHeight: 132, justifyContent: 'flex-start', gap: 6 }}>
      <div className="flex items-center gap-2 w-full">
        <span className="grid place-items-center rounded-full shrink-0" style={{ width: 36, height: 36, background: A.color, border: `2.5px solid ${INK}` }}><Icon size={18} strokeWidth={2.5} /></span>
        <span className="cx-title text-base leading-tight">{L(A.label)}</span>
        {best && <Star size={18} className="ml-auto shrink-0" style={{ fill: SUN }} strokeWidth={2.5} aria-hidden="true" />}
        {best && <span className="sr-only">{tt('(Rūta’s pick)', '(Rūtos pasirinkimas)')}</span>}
      </div>
      <span className="text-sm font-semibold t-muted leading-snug">{L(A.desc)}</span>
      <span className="text-sm font-extrabold leading-snug" style={{ color: type === 'attack' ? '#B91C1C' : GREEN }}>{effect}</span>
      <span className="mt-auto inline-flex items-center gap-1 text-sm font-extrabold"><Zap size={15} style={{ fill: SUN }} />1 · {fmtEur(cost)}</span>
    </button>
  );
}
function RegionDrawer({ g, rid, proj, onClose, onAction, tutStep, onSkipTips }) {
  const r = REG[rid];
  const p = g.player;
  const info = raceInfo(g, r);
  const best = bestActionIn(g, r, info);
  const cons = proj.smd.filter((e) => e.rid === rid);
  const mine = cons.filter((e) => e.winner === p).length;
  const acts = g.weekActs[rid] || 0;
  const [more, setMore] = useState(false);
  const top = info.ord.slice(0, 3);
  if (!top.includes(p)) top[2] = p;
  const maxS = Math.max(...top.map((q) => info.s[q]), 20);
  return (
    <Sheet onClose={onClose} label={rl(r)}>
      <SheetHead kicker={tt(`${r.seats} ${seatsWord(r.seats)} to win here`, `Čia galima laimėti: ${r.seats} ${seatsWord(r.seats)}`)} title={rl(r)} onClose={onClose} />
      <div className="flex flex-col gap-4 pt-4" style={GUTTER}>
        <div className="cx-soft p-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="font-extrabold">{raceText(info)}</span>
            <StatusPill status={info.status} />
          </div>
          <div className="flex flex-col gap-2">
            {top.map((q) => (
              <div key={q} className="grid items-center gap-2" style={{ gridTemplateColumns: '92px 1fr 56px' }}>
                <span className={`text-sm inline-flex items-center gap-1.5 truncate ${q === p ? 'font-black' : 'font-bold'}`}><PartyDot p={q} size={12} />{q === p ? tt('You', 'Jūs') : partyShort(q)}</span>
                <Bar value={info.s[q]} max={maxS} color={PARTIES[q].color} h={18} />
                <span className="cx-num text-right">{fmtPct(info.s[q])}</span>
              </div>
            ))}
          </div>
        </div>
        {tutStep === 2 ? (
          <Coach title={tt('This is a region card', 'Tai regiono kortelė')} onSkip={onSkipTips}>
            {tt('Each button is a move you can make here. The one with the star is my pick. Tap it!', 'Kiekvienas mygtukas – tai veiksmas šiame regione. Pažymėtas žvaigždute – mano patarimas. Spauskite jį!')}
          </Coach>
        ) : best && g.ap > 0 ? (
          <div className="flex items-center gap-3">
            <Advisor size={40} />
            <p className="text-sm font-semibold leading-snug flex-1"><span className="font-black">{tt('Rūta’s pick:', 'Rūtos patarimas:')} {L(ACTIONS[best.type].label).toLowerCase()}.</span> {L(ACTION_WHY[best.type])}</p>
          </div>
        ) : g.ap === 0 ? (
          <div className="cx-soft p-3 text-sm font-bold">{tt('Out of energy this week. Tap Next week to refill.', 'Šią savaitę energijos nebeliko. Spauskite „Kita savaitė“.')}</div>
        ) : null}
        <div className="grid grid-cols-2 gap-3">
          {['rally', 'digital', 'tv', 'door', 'star', 'attack'].map((t) => <ActionTile key={t} type={t} g={g} r={r} rival={info.rival} onAction={onAction} best={best && best.type === t} />)}
        </div>
        {acts >= 2 && <p className="text-sm font-bold" style={{ color: AMBER }}>{tt('Voters here are getting tired of you this week. Each extra move here works less well.', 'Šio regiono rinkėjai šią savaitę jau pavargo nuo jūsų. Kiekvienas papildomas veiksmas čia veikia silpniau.')}</p>}
        <button type="button" onClick={() => setMore(!more)} className="cx-btn cx-pale w-full h-12 justify-between px-4">
          <span>{tt('About this region', 'Apie regioną')}</span>
          <ChevronDown size={20} className={`transition ${more ? 'rotate-180' : ''}`} />
        </button>
        {more && (
          <div className="flex flex-col gap-4 sbl-fade">
            <div>
              <div className="text-sm font-extrabold t-muted mb-2">{tt('What voters here care about', 'Kas rūpi šio regiono rinkėjams')}</div>
              <div className="flex flex-wrap gap-2">
                {r.issues.map((k) => { const I = ISSUES[k]; const Icon = I.icon; return <span key={k} className="cx-chip px-3 py-1.5 text-sm"><Icon size={16} />{L(I.label)}</span>; })}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[[r.id === 'ABR' ? tt('Registered', 'Užsiregistravę') : tt('People', 'Gyventojai'), r.id === 'ABR' ? `${r.voters}k` : `${r.pop}k`], [tt('Turnout', 'Aktyvumas'), `~${Math.round(r.turnout * 100)}${LANG === 'lt' ? ' %' : '%'}`], [tt('In cities', 'Miestuose'), `${Math.round(r.urban * 100)}${LANG === 'lt' ? ' %' : '%'}`]].map(([l, v]) => (
                <div key={l} className="cx-soft p-2.5"><div className="text-xs font-extrabold t-muted">{l}</div><div className="cx-num text-xl">{v}</div></div>
              ))}
            </div>
            <div>
              <div className="text-sm font-extrabold t-muted mb-2">{tt(`Every party here (${fmtPct(g.undecided[rid], 0)} still undecided)`, `Visos partijos (${fmtPct(g.undecided[rid], 0)} dar neapsisprendę)`)}</div>
              <PollBars shares={info.s} highlight={p} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="cx-soft p-3"><div className="text-xs font-extrabold t-muted mb-1.5">{tt('Your ground team', 'Jūsų komanda vietoje')}</div><Bar value={g.gg[rid][p]} color={PARTIES[p].color} /><div className="cx-num mt-1">{Math.round(g.gg[rid][p])}/100</div></div>
              <div className="cx-soft p-3"><div className="text-xs font-extrabold t-muted mb-1.5">{tt('Turnout boost', 'Aktyvumo postūmis')}</div><Bar value={g.boost[rid][p]} max={0.25} color="#34D399" /><div className="cx-num mt-1">+{Math.round(g.boost[rid][p] * 100)}{LANG === 'lt' ? ' %' : '%'}</div></div>
            </div>
            <div>
              <div className="text-sm font-extrabold t-muted mb-2">{tt(`Local districts: you’d win ${mine} of ${r.seats}`, `Apygardos: laimėtumėte ${mine} iš ${r.seats}`)}</div>
              <ul className="flex flex-col gap-1.5">
                {cons.map((e) => {
                  const st = g.stars[e.cid] || {};
                  return (
                    <li key={e.cid} className="flex items-center gap-2 cx-soft px-3 py-2 text-sm font-bold">
                      <PartyDot p={e.winner} size={12} />
                      <span className="flex-1 min-w-0 truncate">{e.name}</span>
                      {Object.keys(st).map((q) => <Star key={q} size={14} style={{ fill: PARTIES[q].color }} strokeWidth={2.4} aria-label={tt(`${partyShort(q)} star candidate`, `${partyShort(q)} žinomas kandidatas`)} />)}
                      <span className="text-xs t-muted shrink-0">{e.round === 1 ? tt(`${partyShort(e.winner)} wins outright`, `${partyShort(e.winner)} laimi I ture`) : tt(`${partyShort(e.runoff.a)} v ${partyShort(e.runoff.b)} runoff`, `II turas: ${partyShort(e.runoff.a)} – ${partyShort(e.runoff.b)}`)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}

/* ============================================================
   Header, ticker & bottom navigation
   ============================================================ */
function Header({ g, proj, onHelp, lang, setLang }) {
  const P = PARTIES[g.player];
  const seats = proj.seats[g.player];
  const stat = 'flex items-center gap-1.5 rounded-2xl bg-white px-2 py-1.5 min-w-0';
  return (
    <header className="sticky z-30" style={{ top: 'env(safe-area-inset-top, 0px)', background: '#fff', borderBottom: `3px solid ${INK}` }}>
      <div className="max-w-lg mx-auto pt-2.5 pb-2.5" style={GUTTER}>
        <div className="flex items-center gap-2.5">
          <PartyEmblem p={g.player} size={44} />
          <div className="min-w-0 flex-1">
            <div className="cx-title text-xl leading-none whitespace-nowrap">{tt(`Week ${g.week}`, `${g.week} savaitė`)} <span className="t-muted">{tt('of 12', 'iš 12')}</span></div>
            <div className="grid gap-1 mt-1.5" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }} aria-hidden="true">
              {Array.from({ length: WEEKS }).map((_, i) => <span key={i} className="rounded-full" style={{ height: 8, background: i + 1 < g.week ? '#94A3B8' : i + 1 === g.week ? SUN : '#E3EDF5', border: `1.5px solid ${INK}` }} />)}
            </div>
          </div>
          <LangToggle lang={lang} setLang={setLang} />
          <button type="button" onClick={onHelp} aria-label={tt('How to play', 'Kaip žaisti')} className="cx-btn cx-white shrink-0" style={{ width: 40, height: 40, borderRadius: 999, boxShadow: `0 3px 0 ${INK}` }}><HelpCircle size={20} /></button>
        </div>
        <div className="grid gap-2 mt-2.5" style={{ gridTemplateColumns: '1fr 1.35fr 1fr' }}>
          <div className={stat} style={{ border: `2.5px solid ${INK}` }} aria-label={tt(`${g.ap} of ${g.apMax} energy left`, `Liko ${g.ap} iš ${g.apMax} energijos`)}>
            <Zap size={18} style={{ fill: SUN }} strokeWidth={2.4} className="shrink-0" />
            <div className="min-w-0"><div className="cx-num text-lg leading-none">{g.ap}<span className="t-muted text-sm">/{g.apMax}</span></div><div className="text-xs font-extrabold t-muted truncate">{tt('Energy', 'Energija')}</div></div>
          </div>
          <div className={stat} style={{ border: `2.5px solid ${INK}` }}>
            <Wallet size={18} className="shrink-0" strokeWidth={2.4} style={{ color: GREEN }} />
            <div className="min-w-0"><div className="cx-num text-base leading-none truncate">{fmtEurShort(g.money)}</div><div className="text-xs font-extrabold t-muted truncate">{tt('Money', 'Pinigai')}</div></div>
          </div>
          <div className={stat} style={{ border: `2.5px solid ${INK}`, background: seats >= MAJORITY ? '#DCFCE7' : '#fff' }}>
            <Landmark size={18} className="shrink-0" strokeWidth={2.4} style={{ color: '#2563EB' }} />
            <div className="min-w-0"><div className="cx-num text-lg leading-none">{seats}<span className="t-muted text-sm">/71</span></div><div className="text-xs font-extrabold t-muted truncate">{tt('Seats', 'Mandatai')}</div></div>
          </div>
        </div>
      </div>
    </header>
  );
}
function Ticker({ g }) {
  const items = g.news.slice(0, 6).map((n) => newsView(g, n).title);
  if (!items.length) return null;
  return (
    <div className="cx-card flex items-stretch overflow-hidden" style={{ padding: 0, boxShadow: `0 4px 0 ${INK}` }}>
      <span className="shrink-0 grid place-items-center px-3 text-xs font-black text-white" style={{ background: '#E5484D', borderRight: `3px solid ${INK}` }}>{tt('NEWS', 'ŽINIOS')}</span>
      <div className="cx-ticker-wrap flex-1 py-2" aria-label={tt('Latest headlines', 'Naujausios antraštės')}>
        <div className="cx-ticker text-sm font-extrabold">
          {items.map((t, i) => <span key={i} className="inline-flex items-center gap-2"><span style={{ color: '#E5484D' }}>●</span>{t}</span>)}
        </div>
      </div>
    </div>
  );
}
function BottomNav({ tab, setTab, onEnd, g, glowEnd }) {
  const item = (id, Icon, label) => (
    <button key={id} type="button" onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined} className="flex flex-col items-center justify-center gap-0.5 h-16 rounded-2xl font-extrabold text-xs transition" style={{ color: tab === id ? INK : '#64748B', background: tab === id ? '#FFF1C2' : 'transparent' }}>
      <Icon size={24} strokeWidth={tab === id ? 2.8 : 2.2} />{label}
    </button>
  );
  const last = g.week >= WEEKS;
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', background: '#fff', borderTop: `3px solid ${INK}` }}>
      <div className="max-w-lg mx-auto grid grid-cols-5 items-center gap-1 py-1" style={GUTTER}>
        {item('map', MapIcon, tt('Map', 'Žemėlapis'))}
        {item('polls', BarChart3, tt('Polls', 'Apklausos'))}
        <div className="flex justify-center">
          <button type="button" onClick={onEnd} className={`cx-btn cx-sun -mt-8 flex-col gap-0.5 ${glowEnd ? 'cx-glow' : ''}`} style={{ width: 88, height: 74, borderRadius: 24, fontSize: 13, lineHeight: 1.05 }}>
            {last ? <Vote size={26} strokeWidth={2.6} /> : <Play size={26} strokeWidth={2.6} style={{ fill: INK }} />}
            <span>{last ? tt('Vote!', 'Balsuoti!') : tt('Next week', 'Kita savaitė')}</span>
          </button>
        </div>
        {item('hq', Building2, tt('HQ', 'Štabas'))}
        {item('news', Newspaper, tt('News', 'Naujienos'))}
      </div>
    </nav>
  );
}

/* ============================================================
   News rendering (structured items → current language)
   ============================================================ */
function newsView(g, n) {
  const P = (p) => partyShort(p);
  switch (n.kind) {
    case 'launch': return { icon: Flag, title: tt('Campaign launched', 'Kampanija prasidėjo'), text: tt(`${P(g.player)} opens its campaign HQ. Twelve weeks until the 2028 Seimas election.`, `${P(g.player)} atidarė rinkimų štabą. Iki 2028 m. Seimo rinkimų – dvylika savaičių.`) };
    case 'you': return { icon: Flag, title: tt('Your week on the trail', 'Jūsų savaitė kampanijoje'), text: Object.entries(n.log).map(([t, k]) => `${k}× ${L(ACTIONS[t].short)}`).join(', ') };
    case 'platform': return {
      icon: Megaphone, title: tt('New promises', 'Nauji pažadai'),
      text: n.changes.map(([a, v]) => { const ax = AXES.find((x) => x.id === a); return `${L(ax.label)}: ${L(ax.steps[stepIndex(v)])}`; }).join(' · ') + (n.uturn ? tt('. Commentators call it a U-turn.', '. Komentatoriai tai vadina staigiu posūkiu.') : ''),
    };
    case 'rival': return { icon: Target, p: n.p, title: tt(`${P(n.p)} on the campaign trail`, `${P(n.p)} kampanija`), text: describeMoves(n) };
    case 'front': return { icon: Eye, title: tt('All eyes on you', 'Visų akys – į jus'), text: tt(`A ${nf(n.lead)}-point lead means reporters dig into everything you do. Your buzz drops a little.`, `${nf(n.lead)} proc. punkto persvara reiškia, kad žurnalistai knisasi po viską. Pagreitis šiek tiek krenta.`) };
    case 'event': { const ev = EVENT_MAP[n.ev]; return { icon: Newspaper, title: L(ev.title), text: `${tt('You chose:', 'Jūsų sprendimas:')} ${L(ev.choices[n.ci].label)}.${n.note ? ` ${L(n.note)}` : ''}` }; }
    case 'debate': return { icon: Mic, title: tt(`LRT debate: ${L(DEBATES[n.d].title)}`, `LRT debatai: ${L(DEBATES[n.d].title)}`), text: tt(`Viewers say ${P(n.winner)} won (${fmtPct(n.pct, 0)}). You came #${n.rank}.`, `Žiūrovų nuomone, laimėjo ${P(n.winner)} (${fmtPct(n.pct, 0)}). Jūsų vieta – ${n.rank}.`) };
    case 'vrk': return { icon: Gavel, title: tt('VRK fines your party', 'VRK skyrė baudą jūsų partijai'), text: tt(`You broke the campaign spending limit. Fine: ${fmtEur(n.fine)}.`, `Viršijote rinkimų kampanijos išlaidų limitą. Bauda: ${fmtEur(n.fine)}.`) };
    case 'gamble': return n.game === 'casino'
      ? { icon: Dices, title: tt('Photos: your campaign team at a casino', 'Nuotraukos: jūsų štabas – kazino'), text: tt('Tabloids show your team betting party money in Vilnius Old Town. Scandal!', 'Bulvariniai portalai skelbia, kad jūsų komanda Vilniaus senamiestyje statė partijos pinigus. Skandalas!') }
      : { icon: Ticket, title: tt('Leaked: a betting slip paid with party money', 'Nutekėjo lažybų kvitas, apmokėtas partijos pinigais'), text: tt('A Žalgiris betting slip paid from the campaign account goes viral.', 'Kvitas su statymu už „Žalgirį“, apmokėtas iš kampanijos sąskaitos, plinta internete.') };
    case 'kompro': return n.outcome === 'hit'
      ? { icon: Search, p: n.target, title: tt(`Leaked documents embarrass ${P(n.target)}`, `Nutekinti dokumentai kompromituoja ${P(n.target)}`), text: tt(`Your investigators’ findings are on every front page. ${P(n.target)} loses ground.`, `Jūsų tyrėjų radiniai – visų portalų pirmuosiuose puslapiuose. ${P(n.target)} praranda pozicijas.`) }
      : { icon: Search, title: tt('Caught digging for dirt', 'Įkliuvote renkant kompromatą'), text: tt(`Journalists reveal you hired investigators to target ${P(n.target)}.`, `Žurnalistai atskleidė, kad samdėte tyrėjus prieš ${P(n.target)}.`) };
    case 'star': return { icon: Star, title: tt('Star candidate signed', 'Pritrauktas žinomas kandidatas'), text: tt(`${L(STAR_PEOPLE[n.who])} will run for you in ${consName(consById(n.cid)[0])}.`, `${consName(consById(n.cid)[0])}: už jus kandidatuos ${L(STAR_PEOPLE[n.who])}.`) };
    default: return { icon: Info, title: '', text: '' };
  }
}

/* ============================================================
   Map tab
   ============================================================ */
function Warnings({ g }) {
  const out = [];
  if (g.stats.spent > VRK_LIMIT * 0.85 && !g.vrkHit) out.push(tt(`You have spent ${fmtEur(g.stats.spent)} of the ${fmtEur(VRK_LIMIT)} VRK limit. Going over means a fine and a scandal.`, `Išleidote ${fmtEur(g.stats.spent)} iš ${fmtEur(VRK_LIMIT)} VRK limito. Viršijus – bauda ir skandalas.`));
  if (g.scandal > 25) out.push(tt(`Scandal risk is ${Math.round(g.scandal)}%. Journalists are circling. Avoid shady deals and gambling.`, `Skandalo rizika – ${Math.round(g.scandal)} %. Žurnalistai budi. Venkite abejotinų sandorių ir azartinių lošimų.`));
  if (!out.length) return null;
  return (
    <div className="flex flex-col gap-1.5">
      {out.map((t) => <div key={t} className="rounded-2xl px-3 py-2 text-sm font-bold flex gap-2 items-start" style={{ background: '#FEE2E2', border: `2.5px solid ${INK}` }}><AlertTriangle size={17} className="shrink-0 mt-0.5" style={{ color: RED }} />{t}</div>)}
    </div>
  );
}
function TipsCard({ g, recs, act, onOpen }) {
  if (g.ap <= 0) {
    return <Coach title={tt('That’s your week done!', 'Savaitė baigta!')}>{tt('You’ve used all your energy. Tap the big yellow Next week button to see how the polls move.', 'Panaudojote visą energiją. Spauskite didelį geltoną mygtuką „Kita savaitė“ ir pažiūrėkite, kaip pasikeis reitingai.')}</Coach>;
  }
  return (
    <Card className="p-3 cx-cream">
      <div className="flex items-center gap-3">
        <Advisor size={46} />
        <div className="min-w-0 flex-1">
          <div className="cx-title text-lg leading-tight">{tt(`Rūta’s tips for week ${g.week}`, `Rūtos patarimai ${g.week} savaitei`)}</div>
          <div className="text-sm font-semibold t-muted">{tt(`You have ${g.ap} energy left. Here’s where it counts most.`, `Liko ${g.ap} energijos. Štai kur ji svarbiausia.`)}</div>
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-3">
        {recs.slice(0, 2).map((rc, i) => {
          const isRegion = rc.kind === 'region';
          const A = isRegion ? ACTIONS[rc.type] : null;
          const Icon = isRegion ? A.icon : HandCoins;
          const title = isRegion ? tt(`${L(A.label)} in ${rl(rc.rid)}`, `${L(A.label)}: ${rl(rc.rid)}`) : tt('Host a donor dinner', 'Surengti rėmėjų vakarienę');
          return (
            <div key={`${rc.rid || rc.id}-${i}`} className="bg-white rounded-2xl p-3" style={{ border: `2.5px solid ${INK}` }}>
              <div className="flex items-start gap-3">
                <span className="grid place-items-center rounded-full shrink-0" style={{ width: 38, height: 38, background: isRegion ? A.color : '#86EFAC', border: `2.5px solid ${INK}` }}><Icon size={19} strokeWidth={2.5} /></span>
                <div className="min-w-0 flex-1">
                  <div className="font-black leading-tight">{title}</div>
                  <div className="text-sm font-semibold t-muted leading-snug mt-0.5">{rc.why}</div>
                </div>
              </div>
              <div className="flex gap-2 mt-2.5">
                <Btn className="h-11 flex-1 text-sm" onClick={() => act((gg) => runRec(gg, rc))}>{tt('Do it', 'Daryti')} <span className="inline-flex items-center gap-0.5"><Zap size={14} style={{ fill: INK }} />1</span>{isRegion ? ` · ${fmtEur(rc.cost)}` : ''}</Btn>
                {isRegion && <Btn kind="white" className="h-11 px-3 text-sm" onClick={() => onOpen(rc.rid)}>{tt('See region', 'Regionas')}</Btn>}
              </div>
            </div>
          );
        })}
      </div>
      <Btn kind="white" className="h-12 w-full mt-3 text-sm" onClick={() => act((gg) => autoPlan(gg))}><Wand2 size={18} />{tt('Let Rūta plan the rest of my week', 'Tegul Rūta suplanuoja likusią savaitę')}</Btn>
    </Card>
  );
}
function MapTab({ g, shares, proj, sel, onSelect, act, recs, skipTips }) {
  const rows = REGIONS.slice().sort((a, b) => b.seats - a.seats);
  const p = g.player;
  const starIds = recs.filter((r) => r.kind === 'region').slice(0, g.tut === 1 ? 1 : 2).map((r) => r.rid);
  const leaders = [...new Set(REGIONS.map((r) => regionLook(shares[r.id]).lead))];
  return (
    <div className="flex flex-col gap-4 pt-4">
      <Ticker g={g} />
      {g.tut === 1 && (
        <Coach title={tt('Let’s make your first move!', 'Žengiame pirmą žingsnį!')} onSkip={skipTips}>
          {tt('This is Lithuania. Each colour shows who’s winning that region right now. Tap the region with the bouncing star. That’s where I think you can win the most.', 'Tai Lietuva. Spalva rodo, kas dabar pirmauja regione. Paspauskite regioną su šokinėjančia žvaigždute – ten, mano manymu, galite laimėti daugiausia.')}
        </Coach>
      )}
      {g.tut === 3 && (
        <Coach title={tt('Nice, voters are moving your way!', 'Puiku, rinkėjai pasuko jūsų pusėn!')} onSkip={skipTips} actions={<Btn className="h-11 px-4 text-sm" onClick={() => act((gg) => autoPlan(gg))}><Wand2 size={17} />{tt('Plan my week for me', 'Suplanuok mano savaitę')}</Btn>}>
          {tt('Every move costs 1 energy plus some money. You get 6 energy each week. Spend the rest yourself on the map, or let me do it.', 'Kiekvienas veiksmas kainuoja 1 energiją ir šiek tiek pinigų. Kas savaitę gaunate 6 energijos. Likusią išleiskite patys arba patikėkite man.')}
        </Coach>
      )}
      {g.tut === 4 && (
        <Coach title={tt('Out of energy!', 'Energija baigėsi!')} onSkip={skipTips}>
          {tt('Tap the big yellow Next week button at the bottom. Your rivals will make their moves and a new poll comes out.', 'Spauskite didelį geltoną mygtuką „Kita savaitė“ apačioje. Varžovai atliks savo ėjimus, o mes gausime naują apklausą.')}
        </Coach>
      )}
      {(g.tut === 0 || g.tut >= 5) && <Warnings g={g} />}
      {(g.tut === 0 || g.tut >= 5) && <TipsCard g={g} recs={recs} act={act} onOpen={onSelect} />}
      <Card className="overflow-hidden" style={{ background: '#BFE6FA', padding: 6 }}>
        <CartoonMap shares={shares} sel={sel} onSelect={onSelect} stars={starIds} />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-2 pb-1.5 pt-1 text-sm font-extrabold">
          {leaders.map((q) => <span key={q} className="inline-flex items-center gap-1.5"><PartyDot p={q} size={13} />{partyShort(q)}</span>)}
          <span className="t-muted text-xs w-full">{tt('Colour = who’s ahead · stripes = close race · number = seats', 'Spalva – kas pirmauja · juostos – lygi kova · skaičius – mandatai')}</span>
        </div>
      </Card>
      <div className="flex flex-col gap-2.5">
        <h3 className="cx-title text-xl">{tt('All regions', 'Visi regionai')}</h3>
        {rows.map((r) => <RegionRow key={r.id} r={r} g={g} s={shares[r.id]} star={starIds.includes(r.id)} mySeats={proj.smd.filter((e) => e.rid === r.id && e.winner === p).length} onClick={() => onSelect(r.id)} />)}
      </div>
    </div>
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
  const [table, setTable] = useState(false);
  const mine = proj.seats[p];
  const need = MAJORITY - mine;
  return (
    <div className="flex flex-col gap-4 pt-4">
      <h2 className="cx-title text-3xl">{tt('Polls', 'Apklausos')}</h2>
      <Card className="p-4">
        <CardTitle sub={tt('Each dot is one of the Seimas’ 141 seats. The dashed line marks 71.', 'Kiekvienas taškas – viena iš 141 Seimo vietos. Brūkšninė linija – 71.')} info={<InfoTip title={tt('Seats', 'Mandatai')}>{tt('The Seimas has 141 seats. 70 are shared by the national vote among parties over 5%. 71 go to local winners, one per district. To govern you need 71, alone or with partners.', 'Seime – 141 vieta. 70 paskirstoma pagal balsus visoje šalyje partijoms, surinkusioms daugiau nei 5 %. 71 tenka apygardų nugalėtojams. Valdyti reikia 71 – vieniems arba su partneriais.')}</InfoTip>}>{tt('If the vote were today', 'Jei rinkimai vyktų šiandien')}</CardTitle>
        <Hemicycle seats={proj.seats} highlight={p} label={`${partyShort(p)}`} />
        <p className="font-bold mt-2">{need > 0 ? tt(`You’d have ${mine} seats. You need ${need} more, or partners to team up with.`, `Turėtumėte ${mine} ${seatsWord(mine)}. Iki 71 trūksta ${need} – arba reikės partnerių.`) : tt(`You’d have ${mine} seats: enough to govern alone!`, `Turėtumėte ${mine} ${seatsWord(mine)} – užtektų valdyti vieniems!`)}</p>
        <Btn kind="pale" className="h-11 w-full mt-3 text-sm" onClick={() => setTable(!table)}>{table ? tt('Hide seats by party', 'Slėpti mandatus pagal partijas') : tt('Show seats by party', 'Rodyti mandatus pagal partijas')}</Btn>
        {table && <div className="mt-3"><SeatTable seats={proj.seats} pr={proj.pr} smd={proj.smdSeats} highlight={p} /></div>}
      </Card>
      <Card className="p-4">
        <CardTitle sub={tt('Arrows show the change since last week’s poll', 'Rodyklės – pokytis nuo praėjusios savaitės apklausos')}>{tt('Who’s ahead nationally', 'Kas pirmauja šalyje')}</CardTitle>
        <PollBars shares={nat} highlight={p} threshold deltas={deltas} />
      </Card>
      <Card className="p-4">
        <CardTitle sub={tt('How each voter group feels about you', 'Kaip jus vertina skirtingos rinkėjų grupės')} info={<InfoTip title={tt('Voter groups', 'Rinkėjų grupės')}>{tt('Groups react to your promises and to how you handle news and debates. A happy group lifts your vote where many of its members live, for example pensioners in villages and young people in cities.', 'Grupės reaguoja į jūsų pažadus ir į tai, kaip elgiatės su naujienomis bei debatuose. Patenkinta grupė kelia jūsų reitingą ten, kur jos daug: senjorai – kaimuose, jaunimas – miestuose.')}</InfoTip>}>{tt('Who likes you', 'Kas jus palaiko')}</CardTitle>
        <div className="flex flex-col gap-2.5">
          {GROUPS.map((G) => {
            const a = groupApproval(g, G);
            const Icon = G.icon;
            return (
              <div key={G.id} className="grid items-center gap-2" style={{ gridTemplateColumns: '28px 1fr 96px 24px' }}>
                <Icon size={20} strokeWidth={2.4} />
                <span className="font-extrabold text-sm truncate">{L(G.name)}</span>
                <Bar value={a} color={a >= 55 ? '#4ADE80' : a >= 40 ? SUN : '#F87171'} h={14} />
                <Mood w={a} size={20} />
              </div>
            );
          })}
        </div>
      </Card>
      <Card className="p-4">
        <CardTitle sub={tt('The smallest teams that reach 71 seats today', 'Mažiausios koalicijos, šiandien surenkančios 71 mandatą')}>{tt('Possible teams', 'Galimos koalicijos')}</CardTitle>
        {mine >= MAJORITY ? <p className="font-bold" style={{ color: GREEN }}>{tt('You don’t need a team right now: you’re on course for a majority!', 'Šiuo metu partnerių nereikia – einate daugumos link!')}</p>
          : paths.length === 0 ? <p className="font-semibold t-muted">{tt('No team with you in it reaches 71 yet. Win more seats, or move your promises closer to other parties in HQ.', 'Kol kas nė viena koalicija su jumis nesurenka 71. Laimėkite daugiau mandatų arba priartinkite pažadus prie kitų partijų.')}</p>
            : (
              <ul className="flex flex-col gap-2">
                {paths.map((c) => (
                  <li key={c.chosen.join('-')} className="cx-soft flex items-center gap-2 px-3 py-2.5">
                    <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">{[p, ...c.chosen].map((q) => <PartyChip key={q} p={q}> {proj.seats[q]}</PartyChip>)}</div>
                    <div className="text-right shrink-0">
                      <div className="cx-num text-lg leading-none">{c.total}</div>
                      <div className="inline-flex items-center gap-1 text-xs font-extrabold"><Mood w={c.minC} size={16} />{c.minC >= 50 ? tt('Good fit', 'Dera') : c.minC >= 30 ? tt('Awkward', 'Sudėtinga') : tt('Clash', 'Konfliktas')}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
      </Card>
      <Card className="p-4"><CardTitle sub={tt('Weekly published polls. LRT = debate weeks.', 'Savaitinės apklausos. LRT – debatų savaitės.')}>{tt('Week by week', 'Savaitė po savaitės')}</CardTitle><TrendChart history={g.history} player={p} /></Card>
    </div>
  );
}

/* ============================================================
   HQ tab
   ============================================================ */
function MoveRow({ a, g, est, onClick, dark }) {
  const Icon = a.icon;
  const disabled = g.ap < (a.ap || 0) || (a.pc && g.pc < a.pc) || (a.cost && g.money < a.cost);
  const n = g.natActs[a.id] || 0;
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="cx-btn cx-white w-full justify-start gap-3 px-3 py-3 text-left">
      <span className="grid place-items-center rounded-full shrink-0" style={{ width: 40, height: 40, background: dark ? '#C7D2FE' : '#FFF1C2', border: `2.5px solid ${INK}` }}><Icon size={19} strokeWidth={2.5} /></span>
      <span className="min-w-0 flex-1">
        <span className="block font-black leading-tight">{L(a.label)}{n > 0 && <span className="ml-2 text-xs t-muted">{tt(`${n}× this week`, `${n}× šią sav.`)}</span>}</span>
        <span className="block text-sm font-semibold t-muted leading-snug">{L(a.desc)}</span>
      </span>
      <span className="text-right shrink-0 text-sm">
        <span className="flex items-center justify-end gap-1">{a.ap ? <><Zap size={14} style={{ fill: SUN }} />{a.ap}</> : a.pc ? <><Handshake size={14} />{a.pc}</> : null}{a.cost ? ` · ${fmtEur(a.cost)}` : ''}</span>
        <span className="block font-black" style={{ color: GREEN }}>{est}</span>
      </span>
    </button>
  );
}
function HQTab({ g, act, openSheet }) {
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
    const comp = PARTY_IDS.filter((q) => q !== p).map((q) => ({ q, now: compat(g, p, q), next: compat(gd, p, q) })).filter((x) => Math.abs(x.next - x.now) >= 3).sort((a, b) => (b.next - b.now) - (a.next - a.now));
    return { now, next, regs, seatsNow: simulateElection(g, false).seats[p], seatsNext: simulateElection(gd, false).seats[p], comp };
  }, [g, draft, changed]);
  const base = alienation(draft, orig);
  const fundEst = { gala: galaAmount(g), small: smallAmount(g), lobby: lobbyAmount(g) };
  const mom = g.momentum[g.player];
  const vrkPct = g.stats.spent / VRK_LIMIT;
  const statCard = 'cx-card p-3';
  return (
    <div className="flex flex-col gap-4 pt-4">
      <h2 className="cx-title text-3xl">{tt('Campaign HQ', 'Rinkimų štabas')}</h2>
      <div className="grid grid-cols-3 gap-2">
        <div className={statCard} style={{ boxShadow: `0 4px 0 ${INK}` }}>
          <div className="flex items-center justify-between"><Handshake size={20} /><InfoTip title={tt('Favours', 'Ryšiai')}>{tt('Favours are political connections. Earn them in debates and over coffee with rivals. After the vote, spend them to win coalition partners.', 'Ryšiai – tai politinės pažintys. Juos užsitarnaujate debatuose ir per kavą su varžovais. Po rinkimų jie padeda prisivilioti koalicijos partnerius.')}</InfoTip></div>
          <div className="cx-num text-2xl leading-none mt-1">{g.pc}</div>
          <div className="text-xs font-extrabold t-muted">{tt('Favours', 'Ryšiai')}</div>
        </div>
        <div className={statCard} style={{ boxShadow: `0 4px 0 ${INK}` }}>
          <div className="flex items-center justify-between"><Flame size={20} style={{ color: '#EA580C' }} /><InfoTip title={tt('Buzz', 'Pagreitis')}>{tt('Buzz is how much people are talking about you. Positive buzz lifts your support everywhere; it fades a little every week.', 'Pagreitis rodo, kiek apie jus kalbama. Teigiamas pagreitis kelia palaikymą visur, bet kas savaitę šiek tiek blėsta.')}</InfoTip></div>
          <div className="cx-num text-2xl leading-none mt-1" style={{ color: mom >= 0.05 ? GREEN : mom <= -0.05 ? RED : INK }}>{fmtSigned(mom)}</div>
          <div className="text-xs font-extrabold t-muted">{tt('Buzz', 'Pagreitis')}</div>
        </div>
        <div className={statCard} style={{ boxShadow: `0 4px 0 ${INK}` }}>
          <div className="flex items-center justify-between"><ShieldAlert size={20} style={{ color: g.scandal > 20 ? RED : INK }} /><InfoTip title={tt('Scandal risk', 'Skandalo rizika')}>{tt('The higher it is, the more likely journalists dig up a scandal at the start of a week. Shady deals and gambling raise it; it slowly falls on its own.', 'Kuo ji didesnė, tuo labiau tikėtina, kad savaitės pradžioje žurnalistai iškels skandalą. Abejotini sandoriai ir lošimai ją didina, savaime ji lėtai mažėja.')}</InfoTip></div>
          <div className="cx-num text-2xl leading-none mt-1">{Math.round(g.scandal)}{LANG === 'lt' ? ' %' : '%'}</div>
          <div className="text-xs font-extrabold t-muted">{tt('Scandal risk', 'Skandalo rizika')}</div>
        </div>
      </div>
      <Card className="p-4">
        <CardTitle sub={tt('The Central Electoral Commission caps campaign spending.', 'Vyriausioji rinkimų komisija riboja kampanijos išlaidas.')} info={<InfoTip title={tt('VRK limit', 'VRK limitas')}>{tt('In Lithuania the VRK (Central Electoral Commission) limits how much a party may spend on its campaign. Go over and you get a fine plus a scandal. Rūta never plans past the limit, but you can.', 'Lietuvoje VRK (Vyriausioji rinkimų komisija) riboja, kiek partija gali išleisti kampanijai. Viršijus – bauda ir skandalas. Rūta limito neviršija, bet jūs galite.')}</InfoTip>}>{tt('Spending limit', 'Išlaidų limitas')}</CardTitle>
        <Bar value={g.stats.spent} max={VRK_LIMIT} color={vrkPct > 1 ? '#F87171' : vrkPct > 0.85 ? SUN : '#4ADE80'} h={18} />
        <div className="flex justify-between text-sm font-extrabold mt-1.5"><span>{fmtEur(g.stats.spent)}</span><span className="t-muted">{tt('limit', 'limitas')} {fmtEur(VRK_LIMIT)}</span></div>
        {g.vrkHit && <p className="text-sm font-bold mt-1" style={{ color: RED }}>{tt('You already broke the limit and were fined.', 'Limitą jau viršijote ir gavote baudą.')}</p>}
      </Card>
      <Card className="p-4">
        <CardTitle sub={tt(`Donations last week: ${fmtEur(g.lastIncome || 0)}`, `Praėjusios savaitės aukos: ${fmtEur(g.lastIncome || 0)}`)}>{tt('Raise money', 'Pinigų rinkimas')}</CardTitle>
        <div className="flex flex-col gap-3">
          {NATIONAL_ACTIONS.filter((a) => a.group === 'fund').map((a) => <MoveRow key={a.id} a={a} g={g} est={`+${fmtEur(fundEst[a.id])}`} onClick={() => act((gg) => doNational(gg, a.id))} />)}
        </div>
      </Card>
      <section className="cx-card p-4" style={{ background: '#2A2F55', color: '#fff' }}>
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <h3 className="cx-title text-xl leading-tight inline-flex items-center gap-2"><Dices size={22} />{tt('Risky money', 'Rizikingi pinigai')}</h3>
            <p className="text-sm font-semibold mt-0.5" style={{ color: '#C7CCEB' }}>{tt('Gamble campaign cash. The house usually wins, and journalists are watching.', 'Rizikuokite kampanijos pinigais. Dažniausiai laimi kazino, o žurnalistai stebi.')}</p>
          </div>
          <span className="cx-chip px-2 py-0.5 text-xs shrink-0" style={{ background: '#FECACA', color: INK }}>{tt('Very risky', 'Labai rizikinga')}</span>
        </div>
        <div className="flex flex-col gap-3 mt-3">
          <button type="button" onClick={() => openSheet('casino')} disabled={!g.natActs.casino && g.ap < 1} className="cx-btn w-full justify-start gap-3 px-3 py-3 text-left" style={{ background: '#FDE68A' }}>
            <span className="grid place-items-center rounded-full shrink-0" style={{ width: 40, height: 40, background: '#E5484D', border: `2.5px solid ${INK}`, color: '#fff' }}><Dices size={20} /></span>
            <span className="min-w-0 flex-1"><span className="block font-black">{tt('Casino night', 'Vakaras kazino')}</span><span className="block text-sm font-semibold" style={{ color: '#5B4A12' }}>{tt('Roulette in Vilnius Old Town. Up to 5 spins.', 'Ruletė Vilniaus senamiestyje. Iki 5 sukimų.')}</span></span>
            <span className="text-sm font-black shrink-0 inline-flex items-center gap-1">{g.natActs.casino ? tt('Open', 'Atidaryta') : <><Zap size={14} style={{ fill: INK }} />1</>}</span>
          </button>
          <button type="button" onClick={() => openSheet('bet')} disabled={g.ap < 1} className="cx-btn w-full justify-start gap-3 px-3 py-3 text-left" style={{ background: '#BBF7D0' }}>
            <span className="grid place-items-center rounded-full shrink-0" style={{ width: 40, height: 40, background: FLAG.g, border: `2.5px solid ${INK}`, color: '#fff' }}><Ticket size={20} /></span>
            <span className="min-w-0 flex-1"><span className="block font-black">{tt('Bet on Žalgiris', 'Lažybos dėl „Žalgirio“')}</span><span className="block text-sm font-semibold" style={{ color: '#14532D' }}>{tt('Put money on tonight’s EuroLeague game.', 'Statykite už šio vakaro Eurolygos rungtynes.')}</span></span>
            <span className="text-sm font-black shrink-0 inline-flex items-center gap-1"><Zap size={14} style={{ fill: INK }} />1</span>
          </button>
          <div className="text-xs font-bold" style={{ color: '#C7CCEB' }}>{tt(`Each bet: 12% chance it leaks to the press. Gambling net so far: `, `Kiekvienas statymas: 12 % tikimybė, kad sužinos žiniasklaida. Lošimų balansas: `)}<span className="cx-num" style={{ color: g.stats.gambleNet >= 0 ? '#86EFAC' : '#FCA5A5' }}>{g.stats.gambleNet >= 0 ? '+' : '−'}{fmtEur(Math.abs(g.stats.gambleNet))}</span></div>
        </div>
      </section>
      <Card className="p-4">
        <CardTitle sub={tt('Moves that work across the whole country', 'Veiksmai visai šaliai')}>{tt('Big moves', 'Dideli žingsniai')}</CardTitle>
        <div className="flex flex-col gap-3">
          {NATIONAL_ACTIONS.filter((a) => a.group === 'nat').map((a) => (
            <MoveRow key={a.id} a={a} g={g} est={a.id === 'backchannel' ? tt('+Favours', '+Ryšiai') : a.id === 'presser' ? tt('+Buzz', '+Pagreitis') : a.id === 'kompro' ? tt('45% hit', '45 % sėkmė') : tt('All regions', 'Visi regionai')} onClick={() => (a.id === 'kompro' ? openSheet('kompro') : act((gg) => doNational(gg, a.id)))} />
          ))}
        </div>
      </Card>
      <Card className="p-4">
        <CardTitle sub={tt('Shift a promise to win over some regions (and lose others).', 'Pakeiskite pažadą – kai kuriuos regionus laimėsite, kitus prarasite.')} right={<span className="cx-chip px-2 py-0.5 text-xs shrink-0 whitespace-nowrap"><Home size={13} />{tt('= your roots', '= jūsų šaknys')}</span>}>{tt('Your promises', 'Jūsų pažadai')}</CardTitle>
        <div className="flex flex-col gap-3">
          {AXES.map((ax) => {
            const Icon = ax.icon;
            const moved = draft[ax.id] !== g.stance[ax.id];
            return (
              <div key={ax.id} className="cx-soft p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 font-black"><Icon size={18} />{L(ax.label)}</span>
                  <span className="text-sm font-extrabold text-right" style={{ color: moved ? AMBER : INK }}>{L(ax.steps[stepIndex(draft[ax.id])])}</span>
                </div>
                <div className="grid grid-cols-7 gap-1 mt-2.5" role="radiogroup" aria-label={L(ax.label)}>
                  {ax.steps.map((st, i) => {
                    const v = -90 + i * 30;
                    const isDraft = draft[ax.id] === v;
                    const isNow = g.stance[ax.id] === v;
                    return (
                      <button key={i} type="button" role="radio" aria-checked={isDraft} aria-label={L(st)} onClick={() => setDraft({ ...draft, [ax.id]: v })} className="h-11 rounded-xl grid place-items-center cx-tap" style={{ background: isDraft ? SUN : isNow ? '#FFF1C2' : '#fff', border: `2.5px solid ${INK}` }}>
                        {orig[ax.id] === v && <Home size={14} strokeWidth={2.6} />}
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-7 gap-1 mt-1.5" aria-hidden="true">
                  {ax.steps.map((st, i) => {
                    const v = -90 + i * 30;
                    const here = PARTY_IDS.filter((q) => q !== g.player && PARTIES[q].pos[ax.id] === v);
                    return <div key={i} className="flex flex-wrap justify-center gap-0.5" style={{ minHeight: 9 }}>{here.map((q) => <PartyDot key={q} p={q} size={9} />)}</div>;
                  })}
                </div>
                <div className="flex justify-between text-xs font-extrabold t-muted mt-1"><span>{L(ax.left)}</span><span>{L(ax.right)}</span></div>
              </div>
            );
          })}
          <p className="text-xs font-bold t-muted">{tt('Coloured dots show where other parties stand. The closer you are, the happier they’ll be to team up.', 'Spalvoti taškai rodo kitų partijų pozicijas. Kuo arčiau esate, tuo noriau jos jungsis į koaliciją.')}</p>
        </div>
        {preview ? (
          <div className="mt-3 cx-cream rounded-2xl p-3 flex flex-col gap-2" style={{ border: `2.5px solid ${INK}` }}>
            <div className="font-black">{tt('If you announce this:', 'Jei tai paskelbsite:')}</div>
            <div className="flex justify-between text-sm font-bold gap-2"><span>{tt('Your national poll', 'Jūsų reitingas')}</span><span className="cx-num">{fmtPct(preview.now)} → {fmtPct(preview.next)} <Delta v={preview.next - preview.now} /></span></div>
            <div className="flex justify-between text-sm font-bold gap-2"><span>{tt('Seats if the vote were today', 'Mandatai, jei rinkimai būtų šiandien')}</span><span className="cx-num">{preview.seatsNow} → {preview.seatsNext} <Delta v={preview.seatsNext - preview.seatsNow} d={0} /></span></div>
            <div className="flex justify-between text-sm font-bold gap-2"><span>{tt('Your core fans’ enthusiasm', 'Ištikimų rėmėjų entuziazmas')}</span><span className="cx-num" style={{ color: base < 0.95 ? RED : GREEN }}>{Math.round(base * 100)}{LANG === 'lt' ? ' %' : '%'}</span></div>
            <div className="flex flex-wrap gap-1.5">
              {preview.regs.slice(0, 3).filter((x) => x.d > 0.05).map((x) => <span key={x.r.id} className="cx-chip px-2 py-0.5 text-xs" style={{ background: '#BBF7D0' }}>{rs(x.r)} {fmtSigned(x.d)}</span>)}
              {preview.regs.slice(-3).filter((x) => x.d < -0.05).map((x) => <span key={x.r.id} className="cx-chip px-2 py-0.5 text-xs" style={{ background: '#FECACA' }}>{rs(x.r)} {fmtSigned(x.d)}</span>)}
            </div>
            {preview.comp.length > 0 && <div className="flex flex-wrap gap-1.5">{preview.comp.slice(0, 4).map((x) => <PartyChip key={x.q} p={x.q}> {x.next > x.now ? tt('likes this', 'pritaria') : tt('dislikes this', 'nepritaria')}</PartyChip>)}</div>}
            {(cost.mom > 0 || cost.pc > 0) && <p className="text-sm font-bold" style={{ color: AMBER }}>{cost.uturns.length ? tt('That’s a U-turn! ', 'Tai staigus posūkis! ') : tt('Big jumps look fishy. ', 'Dideli šuoliai atrodo įtartinai. ')}{tt('Costs some buzz', 'Kainuos pagreičio')}{cost.pc ? tt(` and ${cost.pc} favour${cost.pc > 1 ? 's' : ''}`, ` ir ${cost.pc} ${plur(cost.pc, '', '', 'ryšį', 'ryšius', 'ryšių')}`) : ''}.</p>}
            <div className="flex gap-2 mt-1">
              <Btn kind="white" className="h-12 px-4" onClick={() => setDraft(g.stance)}><RotateCcw size={17} />{tt('Undo', 'Atšaukti')}</Btn>
              <Btn className="h-12 flex-1" disabled={g.ap < 1} onClick={() => act((gg) => announcePlatform(gg, draft))}><Megaphone size={18} />{tt('Announce', 'Paskelbti')} · <Zap size={14} style={{ fill: INK }} />1</Btn>
            </div>
          </div>
        ) : <p className="text-sm font-semibold t-muted mt-3">{tt('Tap a different box on any row to see what would happen. Nothing changes until you announce it.', 'Paspauskite kitą langelį bet kurioje eilutėje ir pamatysite, kas nutiktų. Niekas nepasikeis, kol nepaskelbsite.')}</p>}
      </Card>
    </div>
  );
}

/* ============================================================
   Casino, betting & opposition research sheets
   ============================================================ */
function RouletteWheel({ rotation }) {
  const n = WHEEL_ORDER.length;
  const seg = 360 / n;
  const R = 100;
  const path = (i) => {
    const a0 = ((i * seg - 90 - seg / 2) * Math.PI) / 180, a1 = (((i + 1) * seg - 90 - seg / 2) * Math.PI) / 180;
    return `M0,0 L${(R * Math.cos(a0)).toFixed(2)},${(R * Math.sin(a0)).toFixed(2)} A${R},${R} 0 0 1 ${(R * Math.cos(a1)).toFixed(2)},${(R * Math.sin(a1)).toFixed(2)} Z`;
  };
  return (
    <div className="relative mx-auto" style={{ width: 230, maxWidth: '100%' }}>
      <svg viewBox="-112 -118 224 230" className="w-full h-auto block" aria-hidden="true">
        <circle cx="0" cy="4" r="108" fill={INK} />
        <g className="cx-wheel" style={{ transform: `rotate(${rotation}deg)` }}>
          <circle cx="0" cy="0" r="106" fill="#7A4A2E" stroke={INK} strokeWidth="4" />
          {WHEEL_ORDER.map((num, i) => (
            <g key={num}>
              <path d={path(i)} fill={num === 0 ? '#16A34A' : RED_NUMS.has(num) ? '#DC2626' : '#1F2544'} stroke="#FDE68A" strokeWidth="0.8" />
              <text x="0" y={-R + 13} textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff" transform={`rotate(${i * seg})`} style={{ fontFamily: FONT_TITLE }}>{num}</text>
            </g>
          ))}
          <circle cx="0" cy="0" r="52" fill="#FDE68A" stroke={INK} strokeWidth="4" />
          <circle cx="0" cy="0" r="14" fill={SUN} stroke={INK} strokeWidth="3" />
        </g>
        <path d="M-11,-116 L11,-116 L0,-96 Z" fill="#fff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
function StakePicker({ stake, setStake, money, stakes = [25, 50, 100, 200] }) {
  return (
    <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label={tt('Stake', 'Statymas')}>
      {stakes.map((s) => (
        <button key={s} type="button" role="radio" aria-checked={stake === s} disabled={money < s} onClick={() => setStake(s)} className="cx-btn h-12 text-base" style={{ background: stake === s ? SUN : '#fff', color: INK, boxShadow: `0 3px 0 ${INK}` }}>{LANG === 'lt' ? `${s}k €` : `€${s}k`}</button>
      ))}
    </div>
  );
}
function CasinoSheet({ g, act, onClose }) {
  const [stake, setStake] = useState(50);
  const [bet, setBet] = useState('red');
  const [num, setNum] = useState(17);
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [res, setRes] = useState(null);
  const entered = !!g.natActs.casino;
  const spinsLeft = CASINO_MAX_SPINS - (g.natActs.spins || 0);
  const enter = () => act((gg) => enterCasino(gg));
  const spin = () => {
    if (spinning) return;
    let out = null;
    act((gg) => { out = casinoSpin(gg, stake, bet === 'num' ? num : bet); return out.ok ? null : out; });
    if (!out || !out.ok) return;
    const idx = WHEEL_ORDER.indexOf(out.n);
    const seg = 360 / WHEEL_ORDER.length;
    const target = 360 - idx * seg;
    const base = Math.ceil(rot / 360) * 360 + 360 * 5;
    setRot(base + target);
    setSpinning(true);
    setRes(null);
    setTimeout(() => { setSpinning(false); setRes(out); }, 3400);
  };
  const colorName = (c) => ({ red: tt('red', 'raudona'), black: tt('black', 'juoda'), green: tt('green', 'žalia') }[c]);
  return (
    <Sheet onClose={spinning ? undefined : onClose} label={tt('Casino', 'Kazino')} dark>
      <SheetHead kicker={tt('Vilnius Old Town · after midnight', 'Vilniaus senamiestis · po vidurnakčio')} title={tt('Casino night', 'Vakaras kazino')} onClose={spinning ? undefined : onClose} dark />
      <div style={GUTTER} className="pt-4 flex flex-col gap-4">
        <div className="rounded-2xl p-3 text-sm font-bold flex gap-2" style={{ background: '#3A1F2B', border: `2.5px solid #E5484D` }}>
          <AlertTriangle size={18} className="shrink-0" style={{ color: '#FCA5A5' }} />
          <span>{tt('This is party money. Every spin has a 12% chance of a photographer, and winnings make VRK suspicious. On average the casino wins.', 'Tai partijos pinigai. Kiekvieno sukimo metu 12 % tikimybė, kad jus nufotografuos, o laimėjimai sukelia VRK įtarimų. Vidutiniškai laimi kazino.')}</span>
        </div>
        {!entered ? (
          <>
            <RouletteWheel rotation={0} />
            <Btn className="h-14 text-lg" disabled={g.ap < 1} onClick={enter}><Dices size={20} />{tt('Walk in', 'Užeiti')} · <Zap size={15} style={{ fill: INK }} />1</Btn>
            <Btn kind="white" className="h-12" onClick={onClose}>{tt('Better not', 'Geriau ne')}</Btn>
          </>
        ) : (
          <>
            <RouletteWheel rotation={rot} />
            <div className="text-center min-h-12" aria-live="polite">
              {spinning ? <div className="cx-title text-2xl sbl-blink">{tt('Spinning…', 'Sukasi…')}</div> : res ? (
                <div className={res.win ? 'sbl-pop' : 'cx-shake'}>
                  <div className="cx-title text-2xl">{tt(`${res.n} ${colorName(res.color)}`, `${res.n} – ${colorName(res.color)}`)}</div>
                  <div className="font-black text-lg" style={{ color: res.win ? '#86EFAC' : '#FCA5A5' }}>{res.win ? tt(`You win ${fmtEur(res.payout)}!`, `Laimėjote ${fmtEur(res.payout)}!`) : tt(`You lose ${fmtEur(stake)}.`, `Pralošėte ${fmtEur(stake)}.`)}</div>
                  {res.caught && <div className="font-black mt-1" style={{ color: SUN }}>{tt('A flash goes off. Someone took a photo!', 'Sužybčiojo blykstė – kažkas nufotografavo!')}</div>}
                </div>
              ) : <div className="font-bold" style={{ color: '#C7CCEB' }}>{tt('Place your bet.', 'Statykite.')}</div>}
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-sm font-extrabold" style={{ color: '#C7CCEB' }}>{tt('Stake', 'Statymas')} · {tt('you have', 'turite')} {fmtEur(g.money)}</div>
              <StakePicker stake={stake} setStake={setStake} money={g.money} />
            </div>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={tt('Bet on', 'Statyti už')}>
              {[['red', tt('Red ×2', 'Raudona ×2'), '#DC2626'], ['black', tt('Black ×2', 'Juoda ×2'), '#1F2544'], ['num', tt('Number ×36', 'Skaičius ×36'), '#16A34A']].map(([v, l, c]) => (
                <button key={v} type="button" role="radio" aria-checked={bet === v} onClick={() => setBet(v)} className="cx-btn h-12 text-sm" style={{ background: c, color: '#fff', borderColor: '#fff', outline: bet === v ? `4px solid ${SUN}` : 'none', outlineOffset: 2 }}>{l}</button>
              ))}
            </div>
            {bet === 'num' && (
              <div className="flex items-center justify-center gap-3">
                <Btn kind="white" className="h-12 w-12 text-xl" onClick={() => setNum((num + 36) % 37)} aria-label={tt('Lower number', 'Mažesnis skaičius')}>−</Btn>
                <span className="cx-num text-4xl w-16 text-center">{num}</span>
                <Btn kind="white" className="h-12 w-12 text-xl" onClick={() => setNum((num + 1) % 37)} aria-label={tt('Higher number', 'Didesnis skaičius')}>+</Btn>
              </div>
            )}
            <Btn className="h-14 text-lg" disabled={spinning || spinsLeft <= 0 || g.money < stake} onClick={spin}><RotateCcw size={20} />{tt('Spin!', 'Sukti!')} <span className="text-sm">({tt(`${spinsLeft} left`, `liko ${spinsLeft}`)})</span></Btn>
            <Btn kind="white" className="h-12" disabled={spinning} onClick={onClose}>{tt('Leave the casino', 'Išeiti iš kazino')}</Btn>
          </>
        )}
      </div>
    </Sheet>
  );
}
function BetSheet({ g, act, onClose }) {
  const [stake, setStake] = useState(50);
  const [pick, setPick] = useState('win');
  const [res, setRes] = useState(null);
  const place = () => {
    let out = null;
    act((gg) => { out = sportsBet(gg, stake, pick); return out.ok ? null : out; });
    if (out && out.ok) setRes(out);
  };
  return (
    <Sheet onClose={onClose} label={tt('Bet on Žalgiris', 'Lažybos dėl „Žalgirio“')} dark>
      <SheetHead kicker={tt('Tonight · EuroLeague', 'Šįvakar · Eurolyga')} title={tt('Bet on Žalgiris', 'Lažybos dėl „Žalgirio“')} onClose={onClose} dark />
      <div style={GUTTER} className="pt-4 flex flex-col gap-4">
        {!res ? (
          <>
            <div className="rounded-2xl p-3 text-sm font-bold flex gap-2" style={{ background: '#3A1F2B', border: '2.5px solid #E5484D' }}>
              <AlertTriangle size={18} className="shrink-0" style={{ color: '#FCA5A5' }} />
              <span>{tt('Betting party money is a terrible idea. 12% chance the slip leaks.', 'Statyti partijos pinigus – bloga mintis. 12 % tikimybė, kad kvitas nutekės.')}</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-sm font-extrabold" style={{ color: '#C7CCEB' }}>{tt('Stake', 'Statymas')} · {tt('you have', 'turite')} {fmtEur(g.money)}</div>
              <StakePicker stake={stake} setStake={setStake} money={g.money} />
            </div>
            <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-label={tt('Your bet', 'Jūsų statymas')}>
              {[['win', tt('Žalgiris wins', '„Žalgiris“ laimės'), '×1.85'], ['big', tt('Žalgiris wins by 12+ points', '„Žalgiris“ laimės 12+ taškų'), '×4.5']].map(([v, l, o]) => (
                <button key={v} type="button" role="radio" aria-checked={pick === v} onClick={() => setPick(v)} className="cx-btn h-14 justify-between px-4" style={{ background: pick === v ? SUN : '#fff', color: INK }}>
                  <span>{l}</span><span className="cx-num">{LANG === 'lt' ? o.replace('.', ',') : o}</span>
                </button>
              ))}
            </div>
            <Btn className="h-14 text-lg" disabled={g.ap < 1 || g.money < stake} onClick={place}><Ticket size={20} />{tt('Place bet', 'Statyti')} · <Zap size={15} style={{ fill: INK }} />1</Btn>
          </>
        ) : (
          <div className="flex flex-col gap-4 sbl-pop">
            <div className="rounded-2xl p-4 text-center" style={{ background: '#111633', border: `3px solid ${SUN}` }}>
              <div className="text-xs font-extrabold tracking-widest" style={{ color: SUN }}>{tt('FINAL SCORE', 'GALUTINIS REZULTATAS')}</div>
              <div className="grid grid-cols-3 items-center mt-2">
                <div className="font-black">{tt('Žalgiris', '„Žalgiris“')}</div>
                <div className="cx-num text-4xl">{res.zalg}:{res.other}</div>
                <div className="font-black">{L(MATCHES[res.opp])}</div>
              </div>
            </div>
            <div className="text-center">
              <div className="cx-title text-2xl" style={{ color: res.win ? '#86EFAC' : '#FCA5A5' }}>{res.win ? tt(`You win ${fmtEur(res.payout)}!`, `Laimėjote ${fmtEur(res.payout)}!`) : tt(`You lose ${fmtEur(stake)}.`, `Pralošėte ${fmtEur(stake)}.`)}</div>
              {res.caught && <div className="font-black mt-1" style={{ color: SUN }}>{tt('Uh-oh: the betting slip is all over social media.', 'Oi: lažybų kvitas jau plinta socialiniuose tinkluose.')}</div>}
            </div>
            <Btn className="h-14 text-lg" onClick={onClose}>{tt('Back to HQ', 'Atgal į štabą')}</Btn>
          </div>
        )}
      </div>
    </Sheet>
  );
}
function KomproSheet({ g, act, onClose }) {
  const rivals = PARTY_IDS.filter((q) => q !== g.player);
  const [target, setTarget] = useState(rivals[0]);
  return (
    <Sheet onClose={onClose} label={tt('Dig up dirt', 'Ieškoti kompromato')}>
      <SheetHead kicker={tt('Opposition research', 'Opozicijos tyrimas')} title={tt('Dig up dirt', 'Ieškoti kompromato')} onClose={onClose} />
      <div style={GUTTER} className="pt-4 flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[['45%', tt('Dirt found', 'Rasta'), '#BBF7D0'], ['35%', tt('Nothing', 'Nieko'), '#E3EDF5'], ['20%', tt('You get caught', 'Įkliūsite'), '#FECACA']].map(([v, l, c]) => (
            <div key={l} className="rounded-2xl p-2" style={{ background: c, border: `2.5px solid ${INK}` }}><div className="cx-num text-xl">{LANG === 'lt' ? v.replace('%', ' %') : v}</div><div className="text-xs font-extrabold">{l}</div></div>
          ))}
        </div>
        <div className="text-sm font-extrabold t-muted">{tt('Pick a target', 'Pasirinkite taikinį')}</div>
        <div className="flex flex-col gap-2" role="radiogroup" aria-label={tt('Target party', 'Partija')}>
          {rivals.map((q) => (
            <button key={q} type="button" role="radio" aria-checked={target === q} onClick={() => setTarget(q)} className="cx-btn justify-start gap-3 px-3 py-2" style={{ background: target === q ? '#FFF1C2' : '#fff', boxShadow: `0 3px 0 ${INK}` }}>
              <PartyEmblem p={q} size={36} />
              <span className="text-left"><span className="block font-black">{partyShort(q)}</span><span className="block text-xs font-bold t-muted">{PARTIES[q].leader}</span></span>
            </button>
          ))}
        </div>
        <Btn className="h-14 text-lg" disabled={g.ap < 1 || g.money < 60} onClick={() => { act((gg) => doNational(gg, 'kompro', target)); onClose(); }}><Search size={20} />{tt('Send the investigators', 'Siųsti tyrėjus')} · <Zap size={15} style={{ fill: INK }} />1 · {fmtEur(60)}</Btn>
      </div>
    </Sheet>
  );
}

/* ============================================================
   News tab
   ============================================================ */
function NewsTab({ g }) {
  let lastWeek = null;
  return (
    <div className="flex flex-col gap-3 pt-4">
      <h2 className="cx-title text-3xl">{tt('News', 'Naujienos')}</h2>
      {g.news.map((n) => {
        const v = newsView(g, n);
        const Icon = v.icon;
        const header = n.week !== lastWeek ? <div key={`w${n.week}-${n.id}`} className="cx-title text-lg pt-1">{tt(`Week ${n.week}`, `${n.week} savaitė`)}</div> : null;
        lastWeek = n.week;
        return (
          <React.Fragment key={n.id}>
            {header}
            <article className="cx-card flex gap-3 p-3" style={{ boxShadow: `0 4px 0 ${INK}` }}>
              <span className="grid place-items-center rounded-full shrink-0" style={{ width: 40, height: 40, background: v.p ? PARTIES[v.p].color : '#FFF1C2', border: `2.5px solid ${INK}`, color: v.p ? '#fff' : INK }}><Icon size={19} strokeWidth={2.5} /></span>
              <div className="min-w-0">
                <div className="font-black leading-tight">{v.title}</div>
                <div className="text-sm font-semibold t-muted leading-snug mt-0.5">{v.text}</div>
              </div>
            </article>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ============================================================
   Modals
   ============================================================ */
function WelcomeModal({ g, nat, proj, onStart, onSkip }) {
  const P = PARTIES[g.player];
  const p = g.player;
  const steps = [
    [MapIcon, '#7DD3FC', tt('Campaign for 12 weeks', '12 savaičių kampanija'), tt('Each week you get 6 energy. Spend it on rallies and ads in the regions.', 'Kas savaitę gaunate 6 energijos. Išleiskite ją mitingams ir reklamai regionuose.')],
    [Vote, '#FDE68A', tt('Win seats on election night', 'Laimėkite mandatus rinkimų naktį'), tt('70 seats come from the national vote, 71 from local winners.', '70 vietų paskirstoma pagal balsus visoje šalyje, 71 tenka apygardų nugalėtojams.')],
    [Handshake, '#86EFAC', tt('Team up to reach 71', 'Surinkite 71 su partneriais'), tt('Most winners need partners. Make friends with the right parties.', 'Daugumai nugalėtojų reikia partnerių. Susidraugaukite su tinkamomis partijomis.')],
  ];
  return (
    <Sheet label={tt('Welcome', 'Sveiki')}>
      <div style={GUTTER} className="pt-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Advisor size={72} />
          <div>
            <div className="cx-title text-3xl leading-none">{tt('Hi! I’m Rūta.', 'Labas! Aš – Rūta.')}</div>
            <div className="font-bold t-muted mt-1">{tt(`Campaign manager for ${P.short} and ${P.leader}.`, `${P.short} ir ${P.leader} rinkimų štabo vadovė.`)}</div>
          </div>
        </div>
        <p className="font-semibold leading-relaxed">{tt(`We start at ${fmtPct(nat[p])} in the polls, worth about ${proj.seats[p]} seats. Here’s how we win:`, `Pradedame nuo ${fmtPct(nat[p])} – tai apie ${proj.seats[p]} ${seatsWord(proj.seats[p])}. Štai kaip laimėsime:`)}</p>
        <div className="flex flex-col gap-2">
          {steps.map(([Icon, bgc, t, d], i) => (
            <div key={t} className="cx-soft p-3 flex gap-3 items-start">
              <span className="grid place-items-center rounded-full shrink-0" style={{ width: 40, height: 40, background: bgc, border: `2.5px solid ${INK}` }}><Icon size={19} strokeWidth={2.5} /></span>
              <div><div className="font-black">{i + 1}. {t}</div><div className="text-sm font-semibold t-muted">{d}</div></div>
            </div>
          ))}
        </div>
        <div className="cx-card cx-cream p-3" style={{ boxShadow: `0 4px 0 ${INK}` }}>
          <div className="font-black">{tt('Your party’s superpower', 'Jūsų partijos supergalia')}</div>
          <div className="text-sm font-semibold mt-0.5">{L(P.perk)}</div>
        </div>
        <Btn className="h-14 text-lg" onClick={onStart}>{tt('Show me how', 'Parodyk, kaip')} <ArrowRight size={20} /></Btn>
        <Btn kind="white" className="h-12" onClick={onSkip}>{tt('I know how to play', 'Moku žaisti')}</Btn>
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
  const upcoming = g.queue.slice(1).map((x) => x.type);
  const attacks = item.moves.flatMap((m) => m.list.filter((x) => x.type === 'attack' && x.target === p).map((x) => ({ p: m.p, rid: x.rid })));
  const riser = PARTY_IDS.filter((q) => q !== p).map((q) => ({ q, d: cur[q] - prev[q] })).sort((a, b) => b.d - a.d)[0];
  return (
    <Sheet label={tt(`Week ${item.week} recap`, `${item.week} savaitės apžvalga`)}>
      <div style={GUTTER} className="pt-6 flex flex-col gap-4">
        <div className="cx-title text-3xl leading-none">{tt(`Week ${item.week} is over!`, `${item.week} savaitė baigėsi!`)}</div>
        <div className="cx-card p-4 flex items-center gap-4" style={{ background: d >= 0 ? '#DCFCE7' : '#FEE2E2' }}>
          {d >= 0 ? <TrendingUp size={44} strokeWidth={2.6} style={{ color: GREEN }} /> : <TrendingDown size={44} strokeWidth={2.6} style={{ color: RED }} />}
          <div>
            <div className="text-sm font-extrabold t-muted">{tt(`New poll for ${partyShort(p)}`, `Nauja ${partyShort(p)} apklausa`)}</div>
            <div className="cx-num text-4xl leading-none">{fmtPct(cur[p])} <span className="text-xl"><Delta v={d} /></span></div>
          </div>
        </div>
        <div className="cx-soft p-3 flex flex-col gap-2 text-sm font-semibold">
          <div className="font-black text-base">{tt('Meanwhile…', 'Tuo metu…')}</div>
          {riser && riser.d > 0.1 && <div className="flex gap-2 items-start"><PartyDot p={riser.q} />{tt(`${partyShort(riser.q)} gained the most this week (${fmtSignedPct(riser.d)}).`, `Daugiausia šią savaitę paaugo ${partyShort(riser.q)} (${fmtSignedPct(riser.d)}).`)}</div>}
          {attacks.length > 0
            ? <div className="flex gap-2 items-start"><Swords size={16} className="shrink-0 mt-0.5" style={{ color: RED }} />{tt('Attack ads against you:', 'Puolimai prieš jus:')} {attacks.map((a) => `${partyShort(a.p)} (${rs(a.rid)})`).join(', ')}. {tt('Door-knocking protects you from these.', 'Nuo jų apsaugo agitacija nuo durų iki durų.')}</div>
            : <div className="flex gap-2 items-start"><Shield size={16} className="shrink-0 mt-0.5" />{tt('No rival attacked you this week.', 'Šią savaitę jūsų niekas nepuolė.')}</div>}
          <div className="flex gap-2 items-start"><Wallet size={16} className="shrink-0 mt-0.5" style={{ color: GREEN }} />{tt(`Supporters donated ${fmtEur(g.lastIncome)}.`, `Rėmėjai paaukojo ${fmtEur(g.lastIncome)}.`)}</div>
        </div>
        <div className="cx-card cx-cream p-3 flex items-center gap-3" style={{ boxShadow: `0 4px 0 ${INK}` }}>
          {upcoming.includes('debate') ? <Tv size={26} /> : upcoming.includes('event') ? <Newspaper size={26} /> : <Sparkles size={26} />}
          <div className="font-black">{upcoming.includes('debate') ? tt('Coming up: a live LRT debate!', 'Netrukus – tiesioginiai LRT debatai!') : upcoming.includes('event') ? tt('Coming up: breaking news!', 'Netrukus – skubi naujiena!') : tt('A quiet start to the week.', 'Rami savaitės pradžia.')}</div>
        </div>
        {g.tut === 5 && <Coach title={tt('You’ve got the hang of it!', 'Jau perpratote!')}>{tt('Every week: spend your energy, then tap Next week. Polls change, rivals campaign and news breaks. LRT debates come in weeks 4, 8 and 11. My tips stay on the map whenever you need them.', 'Kas savaitę: išleiskite energiją ir spauskite „Kita savaitė“. Keičiasi apklausos, varžovai agituoja, pasirodo naujienos. LRT debatai – 4, 8 ir 11 savaitėmis. Mano patarimai visada laukia žemėlapyje.')}</Coach>}
        <Btn className="h-14 text-lg" onClick={onClose}>{tt(`Start week ${g.week}`, `Pradėti ${g.week} savaitę`)} <ArrowRight size={20} /></Btn>
      </div>
    </Sheet>
  );
}
function OutcomeGrid({ before, after }) {
  const money = after.money - before.money;
  const cells = [
    [tt('Your poll', 'Jūsų reitingas'), <Delta key="a" v={after.share - before.share} pct />],
    [tt('Money', 'Pinigai'), money === 0 ? <span key="b" className="t-muted">±0</span> : <span key="b" style={{ color: money > 0 ? GREEN : RED }}>{money > 0 ? '+' : '−'}{fmtEur(Math.abs(money))}</span>],
    [tt('Buzz', 'Pagreitis'), <Delta key="c" v={after.mom - before.mom} />],
    [tt('Favours', 'Ryšiai'), <Delta key="d" v={after.pc - before.pc} d={0} />],
  ];
  return <div className="grid grid-cols-2 gap-2">{cells.map(([l, v]) => <div key={l} className="cx-soft p-3"><div className="text-xs font-extrabold t-muted">{l}</div><div className="cx-num text-xl">{v}</div></div>)}</div>;
}
function EventModal({ g, item, onChoose, onClose }) {
  const ev = EVENT_MAP[item.id];
  const done = item.done;
  const Icon = ev.icon;
  const pick = useMemo(() => adviseEvent(g, ev), [item.id]);
  return (
    <Sheet label={tt('Breaking news', 'Skubi naujiena')}>
      <div style={GUTTER} className="pt-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className={`cx-chip px-3 py-1 text-sm text-white ${done ? '' : 'sbl-blink'}`} style={{ background: '#E5484D' }}>{ev.scandal ? tt('SCANDAL!', 'SKANDALAS!') : tt('BREAKING NEWS', 'SKUBI NAUJIENA')}</span>
          <span className="text-sm font-extrabold t-muted">{L(ev.cat)}</span>
        </div>
        <div className="flex gap-3 items-start">
          <span className="grid place-items-center rounded-2xl shrink-0" style={{ width: 52, height: 52, background: '#FFF1C2', border: `3px solid ${INK}` }}><Icon size={26} strokeWidth={2.5} /></span>
          <h2 className="cx-title text-2xl leading-tight">{L(ev.title)}</h2>
        </div>
        <p className="font-semibold leading-relaxed">{L(ev.body)}</p>
        {!done ? (
          <div className="flex flex-col gap-3">
            <div className="cx-title text-lg">{tt('What do you say?', 'Ką atsakysite?')}</div>
            {ev.choices.map((ch, i) => {
              const chips = ch.risk ? [{ t: tt('50/50 gamble', 'Loterija 50/50'), good: false }] : fxChips(ch.fx);
              const fits = ch.tag && TAG_BONUS[ch.tag] && TAG_BONUS[ch.tag][g.player] > 1;
              return (
                <button key={i} type="button" onClick={() => onChoose(i)} className={`cx-btn ${i === pick ? 'cx-cream' : 'cx-white'} w-full flex-col items-start text-left p-3`} style={{ gap: 8 }}>
                  <div className="flex items-start gap-2 w-full">
                    <span className="font-black text-base flex-1">{L(ch.label)}</span>
                    {i === pick && <span className="cx-chip px-2 py-0.5 text-xs shrink-0" style={{ background: SUN }}><Star size={12} style={{ fill: INK }} />{tt('Rūta’s pick', 'Rūtos patarimas')}</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {fits && <span className="cx-chip px-2 py-0.5 text-xs" style={{ background: '#E9D5FF' }}>{tt('Fits your party', 'Tinka jūsų partijai')}</span>}
                    {chips.map((c) => <span key={c.t} className="cx-chip px-2 py-0.5 text-xs" style={{ background: c.good ? '#BBF7D0' : '#FECACA' }}>{c.t}</span>)}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-3 sbl-fade">
            <div className="cx-soft p-3 font-bold">{tt('You chose:', 'Jūsų sprendimas:')} <span className="font-black">{L(ev.choices[done.ci].label)}</span>{done.note && <div className="mt-1" style={{ color: AMBER }}>{L(done.note)}</div>}</div>
            <OutcomeGrid before={done.before} after={done.after} />
            <Btn className="h-14 text-lg" onClick={onClose}>{tt('Back to the campaign', 'Atgal į kampaniją')} <ArrowRight size={20} /></Btn>
          </div>
        )}
      </div>
    </Sheet>
  );
}
function reactionLabel(s) {
  if (s >= 7.6) return [tt('The crowd goes wild!', 'Salė ploja atsistojusi!'), GREEN];
  if (s >= 6.6) return [tt('Great answer!', 'Puikus atsakymas!'), GREEN];
  if (s >= 5.6) return [tt('Solid answer', 'Tvirtas atsakymas'), INK];
  if (s >= 4.6) return [tt('Hmm, a bit flat', 'Hmm, blankoka'), AMBER];
  return [tt('Ouch. That went badly', 'Oi. Nepavyko'), RED];
}
function DebateModal({ g, item, onFinish, onClose }) {
  const D = DEBATES[item.id];
  const [qi, setQi] = useState(0);
  const [picks, setPicks] = useState([]);
  const [reveal, setReveal] = useState(null);
  const [meter, setMeter] = useState(5);
  const res = item.done;
  const Q = D.questions[qi];
  const pickIdx = useMemo(() => {
    let b = 0;
    Q.answers.forEach((a, i) => { if (expectedAnswerScore(g, a) > expectedAnswerScore(g, Q.answers[b])) b = i; });
    return b;
  }, [qi]);
  const choose = (ai) => {
    if (reveal) return;
    const sc = scoreAnswer(g, Q.answers[ai]);
    setMeter(sc.score);
    setReveal({ ai, ...sc });
    setPicks([...picks, { qi, ai, score: sc.score }]);
  };
  const next = () => { if (qi < D.questions.length - 1) { setQi(qi + 1); setReveal(null); } else onFinish(picks); };
  const rivalsOnStage = PARTY_IDS.filter((q) => q !== g.player).slice(0, 5);
  return (
    <Sheet label={tt('LRT debate', 'LRT debatai')}>
      <div style={GUTTER} className="pt-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="cx-chip px-3 py-1 text-sm text-white" style={{ background: INK }}>LRT</span>
          <span className="cx-chip px-3 py-1 text-sm" style={{ background: '#FECACA' }}><span className="w-2.5 h-2.5 rounded-full sbl-blink" style={{ background: RED }} />{tt('LIVE', 'TIESIOGIAI')}</span>
          <span className="text-sm font-extrabold t-muted ml-auto">{tt(`Debate ${item.id + 1} of 3`, `${item.id + 1} iš 3 debatų`)}</span>
        </div>
        <h2 className="cx-title text-3xl leading-none">{L(D.title)}</h2>
        {!res && qi === 0 && !reveal && (
          <div className="flex items-center gap-1.5 flex-wrap" aria-label={tt('On stage', 'Studijoje')}>
            <PartyEmblem p={g.player} size={32} />
            <span className="text-xs font-black mr-1">{tt('You', 'Jūs')}</span>
            {rivalsOnStage.map((q) => <span key={q} className="inline-flex items-center gap-1 text-xs font-bold t-muted"><PartyDot p={q} size={10} />{leaderSurname(q)}</span>)}
          </div>
        )}
        {!res ? (
          <>
            <div className="flex gap-1.5" aria-label={tt(`Question ${qi + 1} of ${D.questions.length}`, `${qi + 1} klausimas iš ${D.questions.length}`)}>
              {D.questions.map((_, i) => <span key={i} className="flex-1 rounded-full" style={{ height: 10, border: `2px solid ${INK}`, background: i < qi || (i === qi && reveal) ? SUN : i === qi ? '#FFF1C2' : '#fff' }} />)}
            </div>
            <div className="cx-card p-4" style={{ background: '#DDF0FB' }}>
              <div className="text-sm font-extrabold t-muted mb-1">{tt('The host asks:', 'Laidos vedėjas klausia:')}</div>
              <p className="cx-title text-xl leading-snug">{L(Q.q)}</p>
            </div>
            <div>
              <div className="flex justify-between text-xs font-extrabold t-muted mb-1"><span>{tt('Audience hates it', 'Žiūrovams nepatinka')}</span><span>{tt('Audience loves it', 'Žiūrovai sužavėti')}</span></div>
              <Bar value={meter} max={10} color={meter >= 6 ? '#22C55E' : meter >= 5 ? SUN : '#F87171'} mark={5} h={18} />
            </div>
            {item.id === 0 && qi === 0 && !reveal && <Coach title={tt('Debate tip', 'Debatų patarimas')}>{tt('Pick answers that fit your party and your promises. My favourite has a star.', 'Rinkitės atsakymus, kurie tinka jūsų partijai ir pažadams. Mano favoritas pažymėtas žvaigždute.')}</Coach>}
            <div className="flex flex-col gap-3">
              {Q.answers.map((a, i) => {
                const chosen = reveal && reveal.ai === i;
                return (
                  <button key={i} type="button" disabled={!!reveal && !chosen} onClick={() => choose(i)} className={`cx-btn ${chosen ? 'cx-sun' : i === pickIdx && !reveal ? 'cx-cream' : 'cx-white'} w-full flex-col items-start text-left p-3`} style={{ gap: 6 }}>
                    <span className="font-black text-base leading-snug">{L(a.t)}</span>
                    <span className="flex flex-wrap gap-1.5">
                      <span className="cx-chip px-2 py-0.5 text-xs">{L(STYLE_NAMES[a.style])}</span>
                      {i === pickIdx && !reveal && <span className="cx-chip px-2 py-0.5 text-xs" style={{ background: SUN }}><Star size={12} style={{ fill: INK }} />{tt('Rūta’s pick', 'Rūtos patarimas')}</span>}
                      {a.pc ? <span className="cx-chip px-2 py-0.5 text-xs" style={{ background: '#FECACA' }}>{tt('Experts will scoff: −1 favour', 'Ekspertai pasišieps: −1 ryšys')}</span> : null}
                    </span>
                  </button>
                );
              })}
            </div>
            {reveal && (
              <div className="cx-card p-3 flex items-center gap-3 sbl-pop" style={{ boxShadow: `0 4px 0 ${INK}` }}>
                <div className="cx-num text-4xl leading-none">{nf(reveal.score)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-black" style={{ color: reactionLabel(reveal.score)[1] }}>{reactionLabel(reveal.score)[0]}</div>
                  {reveal.note && <div className="text-xs font-extrabold" style={{ color: reveal.note === 'fits' ? GREEN : RED }}>{reveal.note === 'fits' ? tt('Fits your promises', 'Atitinka jūsų pažadus') : tt('Clashes with your promises', 'Prieštarauja jūsų pažadams')}</div>}
                </div>
                <Btn className="h-12 px-4" onClick={next}>{qi < D.questions.length - 1 ? tt('Next', 'Toliau') : tt('Results', 'Rezultatai')} <ArrowRight size={18} /></Btn>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-3 sbl-fade">
            <div className="cx-card p-4" style={{ boxShadow: `0 4px 0 ${INK}` }}>
              <div className="cx-title text-lg mb-2">{tt('Viewers’ vote: who won?', 'Žiūrovų balsavimas: kas laimėjo?')}</div>
              <div className="flex flex-col gap-2">
                {res.poll.map((x, i) => (
                  <div key={x.p} className="grid items-center gap-2" style={{ gridTemplateColumns: '26px 104px 1fr 48px' }}>
                    <span className="cx-num">{i === 0 ? <Trophy size={20} style={{ color: AMBER }} /> : `#${i + 1}`}</span>
                    <span className={`text-sm truncate inline-flex items-center gap-1.5 ${x.p === g.player ? 'font-black' : 'font-bold'}`}><PartyDot p={x.p} size={11} />{x.p === g.player ? tt('You', 'Jūs') : `${leaderSurname(x.p)}`}</span>
                    <Bar value={x.pct} max={100} color={PARTIES[x.p].color} h={16} />
                    <span className="cx-num text-sm text-right">{fmtPct(x.pct, 0)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="cx-soft p-3 font-bold">
              {res.won ? tt('You won the debate! You get 2 favours and a big burst of buzz.', 'Laimėjote debatus! Gaunate 2 ryšius ir didelį pagreitį.') : res.avg > 6 ? tt('A good night. The pundits liked you: +1 favour.', 'Geras vakaras. Komentatoriams patikote: +1 ryšys.') : tt('Not your best night. Rivals will replay your weakest moment.', 'Ne pats geriausias vakaras. Varžovai kartos jūsų silpniausią akimirką.')}
              <div className="mt-1">{tt('Your poll:', 'Jūsų reitingas:')} <Delta v={res.delta} pct /></div>
            </div>
            <Btn className="h-14 text-lg" onClick={onClose}>{tt('Back to the campaign', 'Atgal į kampaniją')} <ArrowRight size={20} /></Btn>
          </div>
        )}
      </div>
    </Sheet>
  );
}
function HelpSheet({ onClose }) {
  const items = [
    [Crown, tt('The goal', 'Tikslas'), tt('Become Prime Minister. You need 71 of the 141 seats in the Seimas, on your own or with partner parties. Then the Seimas votes on your appointment.', 'Tapkite Ministru Pirmininku. Reikia 71 iš 141 Seimo vietos – vieniems arba su partneriais. Tada Seimas balsuoja dėl jūsų paskyrimo.')],
    [Zap, tt('Energy & money', 'Energija ir pinigai'), tt('You get 6 energy every week, plus donations. Every move costs 1 energy and some money. Unused energy is lost.', 'Kas savaitę gaunate 6 energijos ir aukų. Kiekvienas veiksmas kainuoja 1 energiją ir pinigų. Nepanaudota energija dingsta.')],
    [MapIcon, tt('Regions', 'Regionai'), tt('Tap a region to campaign there. Stripes mean a close race, where a push matters most. Repeating moves in one region in the same week works less well.', 'Paspauskite regioną ir agituokite jame. Juostos reiškia lygią kovą – ten postūmis svarbiausias. Kartojami veiksmai tame pačiame regione per savaitę veikia silpniau.')],
    [Star, tt('Star candidates', 'Žinomi kandidatai'), tt('A famous local candidate makes you much stronger in one district. Rivals have some too: look for coloured stars in the district list.', 'Žinomas vietos kandidatas gerokai sustiprina jus vienoje apygardoje. Jų turi ir varžovai – ieškokite spalvotų žvaigždučių apygardų sąraše.')],
    [BarChart3, tt('How seats work', 'Kaip skirstomi mandatai'), tt('70 seats are shared by the national vote (5% minimum). 71 go to local winners; if nobody gets 50%, the top two face a runoff two weeks later.', '70 vietų paskirstoma pagal balsus visoje šalyje (būtina bent 5 %). 71 tenka apygardų nugalėtojams; jei niekas negauna 50 %, po dviejų savaičių vyksta antrasis turas.')],
    [Gavel, tt('VRK spending limit', 'VRK išlaidų limitas'), tt(`The electoral commission lets you spend ${fmtEur(VRK_LIMIT)} in total. Spend more and you are fined.`, `Rinkimų komisija leidžia išleisti iš viso ${fmtEur(VRK_LIMIT)}. Išleidus daugiau – bauda.`)],
    [Dices, tt('Risky money', 'Rizikingi pinigai'), tt('The casino and sports bets can refill your budget fast, but you usually lose, and every bet can leak to the press.', 'Kazino ir lažybos gali greitai papildyti biudžetą, bet dažniausiai pralošiate, o kiekvienas statymas gali nutekėti žiniasklaidai.')],
    [Lightbulb, tt('Stuck?', 'Nežinote, ką daryti?'), tt('Follow Rūta’s tips on the map, or let her plan your week for you.', 'Sekite Rūtos patarimus žemėlapyje arba leiskite jai suplanuoti savaitę.')],
    [Info, tt('About this game', 'Apie žaidimą'), tt('A fictional simulation of the 2028 Seimas election. Real parties and leaders appear for context; every event, quote and result is invented. Party emblems are original designs, not official logos.', 'Išgalvota 2028 m. Seimo rinkimų simuliacija. Tikros partijos ir lyderiai naudojami tik kontekstui; visi įvykiai, citatos ir rezultatai išgalvoti. Partijų ženkliukai sukurti žaidimui, tai ne oficialūs logotipai.')],
  ];
  return (
    <Sheet onClose={onClose} label={tt('How to play', 'Kaip žaisti')}>
      <SheetHead title={tt('How to play', 'Kaip žaisti')} onClose={onClose} />
      <div style={GUTTER} className="pt-4 flex flex-col gap-3">
        {items.map(([Icon, t, d]) => (
          <div key={t} className="cx-soft p-3 flex gap-3 items-start">
            <span className="grid place-items-center rounded-full shrink-0" style={{ width: 38, height: 38, background: '#FFF1C2', border: `2.5px solid ${INK}` }}><Icon size={18} strokeWidth={2.5} /></span>
            <div><div className="font-black">{t}</div><div className="text-sm font-semibold leading-relaxed">{d}</div></div>
          </div>
        ))}
        <Btn className="h-14 text-lg mt-1" onClick={onClose}>{tt('Got it!', 'Supratau!')}</Btn>
      </div>
    </Sheet>
  );
}
function ConfirmEnd({ g, onCancel, onConfirm, onAuto }) {
  return (
    <Sheet onClose={onCancel} label={tt('End week', 'Baigti savaitę')}>
      <div style={GUTTER} className="pt-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Advisor size={56} />
          <div className="cx-title text-2xl leading-tight">{tt(`Wait, you still have ${g.ap} energy!`, `Palaukite – dar liko ${g.ap} energijos!`)}</div>
        </div>
        <p className="font-semibold">{tt('Energy doesn’t carry over to next week.', 'Energija į kitą savaitę nepersikelia.')}{g.week >= WEEKS ? tt(' This is the last week. After this, the country votes!', ' Tai paskutinė savaitė – po jos šalis balsuoja!') : ''}</p>
        <Btn className="h-14 text-base" onClick={onAuto}><Wand2 size={19} />{tt('Let Rūta spend it, then continue', 'Tegul Rūta ją išleidžia, tada tęsti')}</Btn>
        <Btn kind="white" className="h-12" onClick={onConfirm}>{g.week >= WEEKS ? tt('Go straight to the vote', 'Iš karto į rinkimus') : tt('Skip it and end the week', 'Praleisti ir baigti savaitę')}</Btn>
        <Btn kind="pale" className="h-12" onClick={onCancel}>{tt('Keep campaigning', 'Toliau agituoti')}</Btn>
      </div>
    </Sheet>
  );
}

/* ============================================================
   Title & party picker
   ============================================================ */
function TitleScreen({ saved, onNew, onContinue, lang, setLang }) {
  const demoShares = useMemo(() => Object.fromEntries(REGIONS.map((r) => {
    const t = sum(ALL_IDS.map((p) => r.base[p]));
    return [r.id, Object.fromEntries(ALL_IDS.map((p) => [p, (r.base[p] / t) * 100]))];
  })), []);
  return (
    <div className="max-w-lg mx-auto min-h-screen flex flex-col" style={{ ...GUTTER, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
      <div className="pt-5 flex justify-end"><LangToggle lang={lang} setLang={setLang} /></div>
      <div className="pt-3 text-center">
        <Tricolor className="w-16 mx-auto mb-4" h={6} />
        <h1 className="cx-logo leading-none" style={{ fontSize: 'clamp(64px, 21vw, 104px)' }}>SEIMAS</h1>
        <div className="inline-block mt-4 cx-chip px-4 py-1.5 cx-title text-lg">{tt('Battle for Lithuania · 2028', 'Kova dėl Lietuvos · 2028')}</div>
        <p className="mt-4 font-semibold leading-relaxed text-base">{tt('Lead a real Lithuanian party through a 12-week campaign, win LRT debates and runoffs, then build a coalition of 71 out of 141 seats.', 'Veskite tikrą Lietuvos partiją per 12 savaičių kampaniją, laimėkite LRT debatus ir antruosius turus, o tada suburkite 71 iš 141 Seimo narių koaliciją.')}</p>
      </div>
      <Card className="mt-5" style={{ background: '#BFE6FA', padding: 6 }}>
        <CartoonMap shares={demoShares} sel={null} onSelect={() => {}} stars={[]} />
      </Card>
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[[MapIcon, tt('12 weeks', '12 savaičių'), tt('of campaigning', 'kampanijos')], [Tv, tt('3 debates', '3 debatai'), tt('live on LRT', 'tiesiogiai LRT')], [Handshake, '71', tt('seats to govern', 'mandatas valdžiai')]].map(([Icon, a, b]) => (
          <div key={a} className="cx-card p-3 text-center" style={{ boxShadow: `0 4px 0 ${INK}` }}>
            <Icon size={22} className="mx-auto" strokeWidth={2.5} />
            <div className="cx-title text-base mt-1 leading-tight">{a}</div>
            <div className="text-xs font-bold t-muted">{b}</div>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-6 flex flex-col gap-3">
        <Btn className="h-16 text-xl" onClick={onNew}><Play size={22} style={{ fill: INK }} />{tt('Play', 'Žaisti')}</Btn>
        {saved && <Btn kind="white" className="h-14 text-base" onClick={onContinue}>{tt('Continue', 'Tęsti')} · {PARTIES[saved.player].short}, {saved.phase === 'campaign' ? tt(`week ${saved.week}`, `${saved.week} sav.`) : tt('after the vote', 'po rinkimų')}</Btn>}
        <p className="text-xs font-bold t-muted text-center leading-relaxed">{tt('A fictional simulation. Real parties and leaders appear for context; all events, quotes and results are invented. Emblems are not official logos.', 'Išgalvota simuliacija. Tikros partijos ir lyderiai naudojami kontekstui; visi įvykiai, citatos ir rezultatai išgalvoti. Ženkliukai – ne oficialūs logotipai.')}</p>
      </div>
    </div>
  );
}
function PartySelect({ onPick, onBack }) {
  const [sel, setSel] = useState(null);
  const startNat = useMemo(() => nationalShares(newGame('LSDP')), []);
  const diffColor = { easy: '#BBF7D0', medium: '#FDE68A', hard: '#FECACA' };
  return (
    <div className="max-w-lg mx-auto min-h-screen" style={{ ...GUTTER, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 120px)' }}>
      <div className="pt-6 flex items-center gap-3">
        <button type="button" onClick={onBack} aria-label={tt('Back', 'Atgal')} className="cx-btn cx-white shrink-0" style={{ width: 46, height: 46, borderRadius: 999 }}><ArrowRight size={20} className="rotate-180" /></button>
        <div>
          <h2 className="cx-title text-3xl leading-none">{tt('Pick your party', 'Pasirinkite partiją')}</h2>
          <p className="text-sm font-bold t-muted mt-1">{tt('New to the game? Start with an Easy one.', 'Pirmą kartą? Pradėkite nuo lengvos.')}</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 mt-5">
        {PARTY_IDS.map((p) => {
          const P = PARTIES[p];
          const on = sel === p;
          return (
            <button key={p} type="button" onClick={() => setSel(p)} aria-pressed={on} className={`cx-btn ${on ? 'cx-cream' : 'cx-white'} w-full flex-col items-stretch text-left p-3`} style={{ gap: 8, borderWidth: on ? 4 : 3 }}>
              <div className="flex items-center gap-3">
                <PartyEmblem p={p} size={54} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="cx-title text-xl leading-tight">{P.short}</span>
                    <span className="cx-num text-sm shrink-0">{fmtPct(startNat[p])}</span>
                  </div>
                  <div className="text-xs font-extrabold t-muted">{tt('Leader', 'Lyderis')}: {P.leader}</div>
                  <div className="text-sm font-semibold t-muted leading-snug mt-0.5">{L(P.blurb)}</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="cx-chip px-2.5 py-0.5 text-xs" style={{ background: diffColor[P.difficulty] }}>{Array.from({ length: 3 }).map((_, i) => <Star key={i} size={12} style={{ fill: i < P.stars ? INK : 'transparent' }} />)}{L(DIFF_LABEL[P.difficulty])}</span>
                <span className="cx-chip px-2.5 py-0.5 text-xs">{L(P.ideology)}</span>
                <span className="cx-chip px-2.5 py-0.5 text-xs">{fmtEur(P.funds)}</span>
              </div>
              {on && (
                <div className="cx-soft p-3 text-sm font-semibold sbl-fade">
                  <div><span className="font-black">{tt('Superpower:', 'Supergalia:')} </span>{L(P.perk)}</div>
                  <div className="mt-1"><span className="font-black">{tt('Home turf:', 'Tvirtovės:')} </span>{L(P.strongholds)}</div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs font-bold t-muted mt-4">{tt('Starting polls roughly follow late-2026 averages.', 'Pradiniai reitingai apytiksliai atitinka 2026 m. pabaigos vidurkius.')}</p>
      <div className="fixed bottom-0 inset-x-0 z-20" style={{ background: '#fff', borderTop: `3px solid ${INK}`, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)' }}>
        <div className="max-w-lg mx-auto pt-3" style={GUTTER}>
          <Btn className="h-14 w-full text-lg" disabled={!sel} onClick={() => onPick(sel)}>{sel ? <>{tt(`Play as ${PARTIES[sel].short}`, `Žaisti už ${PARTIES[sel].short}`)} <ArrowRight size={20} /></> : tt('Tap a party to choose it', 'Paspauskite partiją')}</Btn>
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
function RunoffRow({ e, me }) {
  const { a, b, sa, sb } = e.runoff;
  const mine = a === me || b === me;
  return (
    <li className="rounded-2xl px-3 py-2 sbl-fade" style={{ border: `2.5px solid ${INK}`, background: mine ? '#FFF6D8' : '#fff' }}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-black truncate">{e.name}</span>
        <span className="text-sm font-extrabold inline-flex items-center gap-1 shrink-0"><PartyDot p={e.winner} size={11} />{tt(`${partyShort(e.winner)} wins`, `laimi ${partyShort(e.winner)}`)}</span>
      </div>
      <div className="flex mt-1.5 overflow-hidden rounded-full" style={{ height: 12, border: `2px solid ${INK}` }}>
        <div style={{ width: `${sa}%`, background: PARTIES[a].color, borderRight: `2px solid ${INK}` }} />
        <div style={{ width: `${sb}%`, background: PARTIES[b].color }} />
      </div>
      <div className="flex justify-between text-xs font-extrabold t-muted mt-1"><span>{partyShort(a)} {fmtPct(sa)}</span><span>{partyShort(b)} {fmtPct(sb)}</span></div>
    </li>
  );
}
function ElectionNight({ g, onFinish }) {
  const E = g.election;
  const me = g.player;
  const P = PARTIES[me];
  const W = WEATHER[g.weather || 'cloud'];
  const WIcon = W.icon;
  const [stage, setStage] = useState('intro');
  const [prog, setProg] = useState(0);
  const [ro, setRo] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const early = useMemo(() => 14 + Math.round(Math.random() * 6), []);
  const runoffs = useMemo(() => E.smd.filter((e) => e.round === 2).sort((a, b) => (a.runoff.a === me || a.runoff.b === me ? 1 : 0) - (b.runoff.a === me || b.runoff.b === me ? 1 : 0)), [E, me]);
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
    if (stage === 'runoff' && ro >= runoffs.length) { const t = setTimeout(() => setStage('final'), 700); return () => clearTimeout(t); }
    return undefined;
  }, [ro, stage, runoffs.length]);
  const counting = stage === 'count' || stage === 'intro';
  const live = useMemo(() => {
    const votes = Object.fromEntries(ALL_IDS.map((p) => [p, 0]));
    let tot = 0;
    const fr = {};
    for (const r of REGIONS) {
      const f = counting ? countedFrac(r, prog) : 1;
      fr[r.id] = f;
      const R = E.regions[r.id];
      tot += R.cast * f;
      for (const p of ALL_IDS) votes[p] += R.votes[p] * f;
    }
    const shares = Object.fromEntries(ALL_IDS.map((p) => [p, tot ? (votes[p] / tot) * 100 : 0]));
    const elig = PARTY_IDS.filter((p) => shares[p] >= 5);
    return { shares, pr: tot > 0 ? hare(elig.map((p) => [p, votes[p]]), 70) : {}, fr, counted: tot / E.total };
  }, [prog, counting, E]);
  const skip = () => { setProg(1); setRo(runoffs.length); setStage('final'); };
  const shown = stage === 'final' ? runoffs.length : stage === 'runoff' ? ro : 0;
  const smdNow = Object.fromEntries(ALL_IDS.map((p) => [p, 0]));
  r1.forEach((e) => { if (live.fr[e.rid] >= 1) smdNow[e.winner] += 1; });
  runoffs.slice(0, shown).forEach((e) => { smdNow[e.winner] += 1; });
  const seatsNow = Object.fromEntries(ALL_IDS.map((p) => [p, (live.counted > 0.04 ? live.pr[p] || 0 : 0) + smdNow[p]]));
  const declared = sum(Object.values(seatsNow));
  const mins = Math.round(20 * 60 + (counting ? prog : 1) * 6.5 * 60);
  const clock = `${String(Math.floor(mins / 60) % 24).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  const order = ALL_IDS.filter((p) => E.seats[p] > 0).sort((a, b) => E.seats[b] - E.seats[a]);
  const largest = order.filter((p) => p !== 'KITI')[0];
  const recent = runoffs.slice(Math.max(0, shown - 5), shown).reverse();
  const myRunoffs = runoffs.filter((e) => e.runoff.a === me || e.runoff.b === me);
  return (
    <div className="max-w-lg mx-auto min-h-screen" style={{ ...GUTTER, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
      <div className="pt-6 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold t-muted">{tt('Seimas election 2028', '2028 m. Seimo rinkimai')}</div>
          <h2 className="cx-title text-4xl leading-none">{stage === 'runoff' ? tt('Runoff day', 'Antrasis turas') : stage === 'final' ? tt('The results are in!', 'Rezultatai paaiškėjo!') : tt('Election night', 'Rinkimų naktis')}</h2>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="cx-chip px-3 py-1 cx-num text-lg">{stage === 'runoff' || stage === 'final' ? tt('Round 2', 'II turas') : clock}</span>
          {stage !== 'final' && stage !== 'intro' && <button type="button" onClick={skip} className="text-sm font-extrabold underline inline-flex items-center gap-1 h-9">{tt('Skip to results', 'Iškart į rezultatus')} <SkipForward size={15} /></button>}
        </div>
      </div>
      {stage === 'intro' && (
        <Card className="mt-4 p-4 cx-cream sbl-pop">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center rounded-2xl shrink-0" style={{ width: 56, height: 56, background: '#fff', border: `3px solid ${INK}` }}><WIcon size={30} strokeWidth={2.4} /></span>
            <div>
              <div className="cx-title text-2xl leading-tight">{tt('Election day:', 'Rinkimų diena:')} {L(W.name).toLowerCase()}</div>
              <div className="font-semibold">{L(W.note)}</div>
            </div>
          </div>
          <p className="font-semibold mt-3">{tt(`${early}% of voters already voted early. Polls close at 20:00 and the count begins.`, `${early} % rinkėjų jau balsavo iš anksto. Apylinkės užsidaro 20:00 – prasideda skaičiavimas.`)}</p>
          <Btn className="h-14 w-full text-lg mt-3" onClick={() => setStage('count')}><Vote size={20} />{tt('Start the count', 'Pradėti skaičiavimą')}</Btn>
        </Card>
      )}
      <Card className="mt-4 p-3">
        <Hemicycle seats={seatsNow} highlight={me} label={P.short} />
        <div className="flex items-center justify-between text-sm font-extrabold t-muted mt-1 gap-2">
          <span>{tt(`${declared} of 141 seats decided`, `Paaiškėjo ${declared} iš 141`)}</span>
          <span>{counting ? tt(`${Math.round(live.counted * 100)}% counted`, `Suskaičiuota ${Math.round(live.counted * 100)} %`) : tt(`Turnout ${fmtPct(E.turnout * 100)}`, `Aktyvumas ${fmtPct(E.turnout * 100)}`)}</span>
        </div>
        {stage === 'count' && <div className="mt-2"><Bar value={live.counted * 100} color={SUN} h={16} /></div>}
      </Card>
      <Card className="mt-4 p-4">
        <CardTitle sub={tt('Shares out 70 seats. Under 5% gets nothing.', 'Paskirsto 70 vietų. Mažiau nei 5 % – nieko.')}>{tt('National vote', 'Daugiamandatė apygarda')}</CardTitle>
        <PollBars shares={live.shares} highlight={me} threshold />
      </Card>
      {stage === 'r1' && (
        <Card className="mt-4 p-4 sbl-pop cx-cream">
          <div className="cx-title text-2xl leading-tight">{tt('Round one done!', 'Pirmasis turas baigtas!')}</div>
          <p className="font-semibold mt-1">{tt(`Only ${r1.length} of 71 local districts picked a winner outright. The other ${runoffs.length} go to a runoff between the top two. You’re in ${myRunoffs.length} of them.`, `Tik ${r1.length} iš 71 apygardos išrinko nugalėtoją iš karto. Likusiose ${runoffs.length} vyks antrasis turas tarp dviejų lyderių. Jūsų kandidatai – ${myRunoffs.length} iš jų.`)}</p>
          <Btn className="h-14 w-full text-lg mt-3" onClick={() => setStage('runoff')}>{tt('Run the runoffs', 'Vykdyti antrąjį turą')} <ArrowRight size={20} /></Btn>
        </Card>
      )}
      {stage === 'runoff' && (
        <Card className="mt-4 p-4">
          <CardTitle right={<span className="cx-num">{ro}/{runoffs.length}</span>}>{tt('Runoffs', 'Antrasis turas')}</CardTitle>
          <ul className="flex flex-col gap-2">{recent.map((e) => <RunoffRow key={e.cid} e={e} me={me} />)}</ul>
        </Card>
      )}
      {stage === 'final' && (
        <div className="mt-4 flex flex-col gap-4 sbl-fade">
          <Card className="p-4 cx-cream">
            <h3 className="cx-title text-3xl leading-tight">{E.seats[me] >= MAJORITY ? tt(`${P.short} wins a majority!`, `${P.short} laimi daugumą!`) : largest === me ? tt(`${P.short} is the biggest party!`, `${P.short} – didžiausia partija!`) : tt(`${partyShort(largest)} is the biggest party`, `Didžiausia partija – ${partyShort(largest)}`)}</h3>
            <p className="font-semibold mt-2">{tt(`You got ${fmtPct(E.natShares[me])} of the national vote${E.natShares[me] < 5 ? ' (under 5%, so no list seats)' : ''} and ${E.seats[me]} seats.`, `Gavote ${fmtPct(E.natShares[me])} balsų${E.natShares[me] < 5 ? ' (mažiau nei 5 %, todėl sąrašo vietų nėra)' : ''} ir ${E.seats[me]} ${seatsWord(E.seats[me])}.`)}{E.seats[me] < MAJORITY ? tt(' Nobody has 71 alone, so it’s time to build a team.', ' Niekas neturi 71 vienas – laikas burti koaliciją.') : ''}</p>
            <div className="mt-3"><SeatTable seats={E.seats} pr={E.pr} smd={E.smdSeats} highlight={me} /></div>
          </Card>
          <Btn kind="pale" className="h-12 w-full" onClick={() => setShowAll(!showAll)}>{showAll ? tt('Hide the 71 districts', 'Slėpti 71 apygardą') : tt('Show all 71 local districts', 'Rodyti visas 71 apygardą')}</Btn>
          {showAll && (
            <ul className="flex flex-col gap-2">
              {E.smd.map((e) => (e.round === 2 ? <RunoffRow key={e.cid} e={e} me={me} /> : (
                <li key={e.cid} className="rounded-2xl px-3 py-2 flex items-center gap-2 bg-white" style={{ border: `2.5px solid ${INK}` }}>
                  <PartyDot p={e.winner} size={12} /><span className="font-black flex-1 min-w-0 truncate">{e.name}</span>
                  <span className="text-xs font-extrabold t-muted">{tt(`${partyShort(e.winner)} won outright`, `${partyShort(e.winner)} laimėjo I ture`)}</span>
                </li>
              )))}
            </ul>
          )}
          <Btn className="h-16 text-lg w-full" onClick={() => onFinish(E.seats[me] >= MAJORITY ? 'majority' : 'coalition')}>
            {E.seats[me] >= MAJORITY ? <>{tt('Form your government', 'Formuoti Vyriausybę')} <Crown size={22} /></> : <>{tt('Start building a team', 'Pradėti derybas')} <Handshake size={22} /></>}
          </Btn>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Coalition builder
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
  const tip = useMemo(() => suggestTeam(g), [g.election, g.player]);
  const sorted = cands.slice().sort((a, b) => (C.partners.includes(b) ? 1 : 0) - (C.partners.includes(a) ? 1 : 0) || will[b] - will[a]);
  const toggle = (p) => act((gg) => { const c = gg.coal; c.partners = c.partners.includes(p) ? c.partners.filter((x) => x !== p) : [...c.partners, p]; return null; });
  const useTip = () => act((gg) => { gg.coal.partners = [...tip.partners]; return { ok: true, tone: 'good', msg: tt('Invited Rūta’s suggested team.', 'Pakviesta Rūtos siūloma koalicija.') }; });
  const accept = (p) => act((gg) => { gg.coal.accepted[p] = !gg.coal.accepted[p]; return null; });
  const sweeten = (p) => act((gg) => {
    if (gg.pc < 2) return { ok: false, msg: tt('Not enough favours.', 'Nepakanka ryšių.') };
    if ((gg.coal.sweet[p] || 0) >= 3) return { ok: false, msg: tt('They can’t be won over any further.', 'Labiau jų palenkti nepavyks.') };
    gg.pc -= 2;
    gg.coal.sweet[p] = (gg.coal.sweet[p] || 0) + 1;
    return { ok: true, tone: 'good', msg: tt(`${partyShort(p)} likes you more now`, `${partyShort(p)} jums palankesni`) };
  });
  const sign = () => act((gg) => {
    const st = stability(gg, gg.coal);
    gg.vote = { ...confidenceVote(gg, [gg.player, ...gg.coal.partners], st), members: [gg.player, ...gg.coal.partners], stability: st };
    gg.phase = 'vote';
    return null;
  });
  const goJunior = () => act((gg) => { gg.result = { kind: 'junior', leader: largest, members: junior.members, seats: junior.total, ministries: Math.max(1, Math.round((S[me] / junior.total) * 14)) }; gg.phase = 'result'; return null; });
  const goOpp = () => act((gg) => { const Lp = ranked.find((p) => p !== me); const ai = aiCoalition(gg, Lp, null); gg.result = { kind: 'opposition', leader: Lp, members: ai.members, seats: ai.total, ok: ai.ok }; gg.phase = 'result'; return null; });
  const harmony = stab >= 65 ? [tt('Happy team', 'Darni komanda'), GREEN] : stab >= 45 ? [tt('Some grumbling', 'Šiek tiek bambėjimo'), AMBER] : [tt('Lots of fighting', 'Daug barnių'), RED];
  const tipIsCurrent = tip && tip.partners.length === C.partners.length && tip.partners.every((p) => C.partners.includes(p));
  return (
    <div className="max-w-lg mx-auto min-h-screen" style={{ ...GUTTER, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 190px)' }}>
      <div className="pt-6">
        <h2 className="cx-title text-4xl leading-none">{tt('Build your coalition', 'Burkite koaliciją')}</h2>
        <p className="font-semibold t-muted mt-1">{tt('Invite parties until your team has 71 seats. Everyone you invite has to be happy to join.', 'Kvieskite partijas, kol komanda turės 71 mandatą. Visi pakviestieji turi norėti prisijungti.')}</p>
      </div>
      {tip && !tipIsCurrent && (
        <Coach className="mt-4" title={tt('My suggestion', 'Mano pasiūlymas')} actions={<Btn className="h-11 px-4 text-sm" onClick={useTip}><Users size={17} />{tt('Invite this team', 'Pakviesti šią komandą')}</Btn>}>
          {tt(`Team up with ${tip.partners.map((p) => partyShort(p)).join(' + ')} for ${tip.total} seats. ${tip.minW >= 50 ? 'They should say yes.' : 'Some will need convincing: agree to their wishes or spend favours.'}`, `Junkitės su ${tip.partners.map((p) => partyShort(p)).join(' + ')} – iš viso ${tip.total} ${seatsWord(tip.total)}. ${tip.minW >= 50 ? 'Jie turėtų sutikti.' : 'Kai kuriuos reikės įtikinti: priimkite jų reikalavimus arba panaudokite ryšius.'}`)}
        </Coach>
      )}
      {!tip && <Coach className="mt-4" title={tt('This will be tough', 'Bus sunku')}>{tt('No team that includes you reaches 71 easily. You could join the winners as a junior partner, or go into opposition.', 'Jokia koalicija su jumis lengvai nesurenka 71. Galite prisijungti prie nugalėtojų kaip jaunesnysis partneris arba likti opozicijoje.')}</Coach>}
      <Card className="mt-4 p-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm font-extrabold t-muted">{tt('Your team', 'Jūsų komanda')}</div>
            <div className="cx-num text-4xl leading-none">{total}<span className="text-lg t-muted"> / 71</span></div>
          </div>
          <span className="cx-chip px-3 py-1 text-sm" style={{ background: total >= MAJORITY ? '#BBF7D0' : '#FDE68A' }}>{total >= MAJORITY ? tt('Majority!', 'Dauguma!') : tt(`${MAJORITY - total} more`, `Trūksta ${MAJORITY - total}`)}</span>
        </div>
        <div className="relative flex mt-3 overflow-hidden rounded-full" style={{ height: 22, border: `3px solid ${INK}`, background: '#E3EDF5' }}>
          {members.map((p) => <div key={p} style={{ width: `${(S[p] / 141) * 100}%`, background: PARTIES[p].color, borderRight: `2px solid ${INK}` }} />)}
          <div className="absolute top-0 bottom-0" style={{ left: `${(MAJORITY / 141) * 100}%`, width: 3, background: INK }} />
        </div>
        {C.partners.length > 0 && (
          <>
            <div className="mt-3 flex items-center gap-2 font-extrabold"><Mood w={stab} size={24} /><span style={{ color: harmony[1] }}>{harmony[0]}</span><span className="t-muted text-sm ml-auto">{tt('Harmony', 'Darna')} {stab}/100</span></div>
            <div className="mt-3">
              <div className="text-xs font-extrabold t-muted mb-1.5">{tt('Who runs which ministry (14)', 'Kas vadovaus ministerijoms (14)')}</div>
              <div className="flex flex-wrap gap-1.5">
                {members.filter((p) => p !== 'KITI').flatMap((p) => cab.alloc[p].map((m) => <span key={m} className="text-xs font-bold rounded-full px-2 py-0.5 inline-flex items-center gap-1 bg-white" style={{ border: `2px solid ${INK}` }}><PartyDot p={p} size={9} />{L(MINISTRIES[m])}</span>))}
              </div>
            </div>
          </>
        )}
      </Card>
      <div className="mt-4 flex flex-col gap-3">
        <h3 className="cx-title text-xl">{tt('Parties in the new Seimas', 'Naujojo Seimo partijos')}</h3>
        {sorted.map((p) => {
          const P = PARTIES[p];
          const inC = C.partners.includes(p);
          const w = will[p];
          const mood = w >= 65 ? tt('Keen to join', 'Mielai prisijungs') : w >= 50 ? tt('Willing', 'Sutinka') : w >= 35 ? tt('Not sure', 'Abejoja') : tt('Says no', 'Atsisako');
          const clashes = C.partners.filter((q) => q !== p && compat(g, p, q) < 25);
          return (
            <div key={p} className="cx-card p-3" style={{ background: inC ? '#FFF6D8' : '#fff', boxShadow: `0 4px 0 ${INK}` }}>
              <div className="flex items-center gap-3">
                <PartyEmblem p={p} size={50} label={S[p]} />
                <div className="min-w-0 flex-1">
                  <div className="cx-title text-lg leading-tight truncate">{p === 'KITI' ? tt('Independents', 'Nepriklausomi') : P.short}</div>
                  {P.leader && <div className="text-xs font-bold t-muted truncate">{P.leader}</div>}
                  <div className="inline-flex items-center gap-1.5 text-sm font-extrabold"><Mood w={w} size={18} />{mood}</div>
                </div>
                <Btn kind={inC ? 'white' : 'sun'} className="h-11 px-4 text-sm shrink-0" onClick={() => toggle(p)}>{inC ? tt('Remove', 'Pašalinti') : tt('Invite', 'Kviesti')}</Btn>
              </div>
              <div className="mt-2.5"><Bar value={w} color={w >= 50 ? '#4ADE80' : w >= 35 ? SUN : '#F87171'} mark={50} h={14} /></div>
              <div className="text-xs font-extrabold t-muted mt-1">{tt(`Happiness ${w}/100 · needs 50 to join`, `Noras ${w}/100 · reikia 50`)}</div>
              <div className="mt-2 text-sm font-semibold"><span className="font-black">{tt('They want:', 'Jie nori:')} </span>{L(DEMANDS[p].text)}</div>
              {clashes.length > 0 && <div className="mt-1.5 text-sm font-extrabold inline-flex items-center gap-1.5" style={{ color: RED }}><AlertTriangle size={15} />{tt('Doesn’t get along with', 'Nesutaria su')} {clashes.map((q) => partyShort(q)).join(', ')}</div>}
              <div className="flex gap-2 mt-2.5">
                <Btn kind={C.accepted[p] ? 'leaf' : 'white'} className="flex-1 h-11 text-sm" onClick={() => accept(p)}>{C.accepted[p] ? <><Check size={16} />{tt('Agreed', 'Sutarta')}</> : tt('Agree to it (+15)', 'Sutikti (+15)')}</Btn>
                <Btn kind="white" className="h-11 px-3 text-sm shrink-0" disabled={g.pc < 2 || (C.sweet[p] || 0) >= 3} onClick={() => sweeten(p)}><Handshake size={16} />{tt('2 favours', '2 ryšiai')}</Btn>
              </div>
              {inC && p !== 'KITI' && <div className="text-xs font-bold t-muted mt-2">{tt('Ministries:', 'Ministerijos:')} {cab.alloc[p].map((m) => L(MINISTRIES[m])).join(', ')}</div>}
            </div>
          );
        })}
      </div>
      <div className="fixed bottom-0 inset-x-0 z-20" style={{ background: '#fff', borderTop: `3px solid ${INK}`, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
        <div className="max-w-lg mx-auto pt-3 flex flex-col gap-2" style={GUTTER}>
          <div className="flex items-center justify-between text-sm font-extrabold gap-2">
            <span className="inline-flex items-center gap-1 shrink-0"><Handshake size={15} />{g.pc} {tt('favours', 'ryšiai')}</span>
            <span className="t-muted text-right truncate">{unwilling.length ? tt(`Not happy yet: ${unwilling.map((p) => partyShort(p)).join(', ')}`, `Dar nepatenkinti: ${unwilling.map((p) => partyShort(p)).join(', ')}`) : total >= MAJORITY ? tt('Ready to sign!', 'Galima pasirašyti!') : tt('Need 71 seats', 'Reikia 71 mandato')}</span>
          </div>
          <Btn className="h-14 text-lg w-full" disabled={!canSign} onClick={sign}><Crown size={20} />{tt('Sign the coalition deal', 'Pasirašyti koalicijos sutartį')}</Btn>
          <div className="flex gap-2">
            {juniorOk && <Btn kind="white" className="h-11 flex-1 text-sm" onClick={goJunior}>{tt(`Join ${partyShort(largest)} instead`, `Jungtis prie ${partyShort(largest)}`)}</Btn>}
            <Btn kind="pale" className="h-11 flex-1 text-sm" onClick={goOpp}>{tt('Go into opposition', 'Likti opozicijoje')}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Seimas confidence vote
   ============================================================ */
function VoteScreen({ g, onDone }) {
  const V = g.vote;
  const P = PARTIES[g.player];
  const [t, setT] = useState(0);
  useEffect(() => {
    if (t >= 1) return undefined;
    const id = setInterval(() => setT((x) => Math.min(1, x + 0.025)), 60);
    return () => clearInterval(id);
  }, [t]);
  const ayes = Math.round(V.ayes * t), noes = Math.round(V.noes * t), abst = Math.round(V.abst * t);
  const done = t >= 1;
  return (
    <div className="max-w-lg mx-auto min-h-screen" style={{ ...GUTTER, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
      <div className="pt-6">
        <div className="text-sm font-extrabold t-muted">{tt('Seimas plenary hall', 'Seimo plenarinių posėdžių salė')}</div>
        <h2 className="cx-title text-4xl leading-none">{tt('The confidence vote', 'Balsavimas dėl Premjero')}</h2>
        <p className="font-semibold mt-2">{tt(`The President has nominated you, leader of ${P.short}, as Prime Minister. Now the Seimas votes.`, `Prezidentas pateikė jūsų, ${P.short} lyderio, kandidatūrą į Ministrus Pirmininkus. Dabar balsuoja Seimas.`)}</p>
      </div>
      <Card className="mt-4 p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[[tt('For', 'Už'), ayes, '#4ADE80'], [tt('Against', 'Prieš'), noes, '#F87171'], [tt('Abstain', 'Susilaikė'), abst, '#E3EDF5']].map(([l, v, c]) => (
            <div key={l} className="rounded-2xl p-3" style={{ background: c, border: `3px solid ${INK}` }}>
              <div className="cx-num text-4xl leading-none">{v}</div>
              <div className="text-sm font-black mt-1">{l}</div>
            </div>
          ))}
        </div>
        <div className="mt-4"><Bar value={ayes} max={141} color="#4ADE80" mark={71} h={22} /></div>
        <div className="text-xs font-extrabold t-muted mt-1">{tt('More votes for than against are needed.', 'Reikia daugiau balsų „už“ nei „prieš“.')}</div>
      </Card>
      {done && (
        <Card className="mt-4 p-4 sbl-pop" style={{ background: V.passed ? '#DCFCE7' : '#FEE2E2' }}>
          <div className="cx-title text-3xl leading-tight">{V.passed ? tt('Approved! You are Prime Minister.', 'Pritarta! Jūs – Ministras Pirmininkas.') : tt('Rejected! Rebels sank your nomination.', 'Atmesta! Maištininkai paskandino jūsų kandidatūrą.')}</div>
          <p className="font-semibold mt-1">{V.passed ? tt(`${V.ayes} MPs backed you. Time to form the government.`, `Jus palaikė ${V.ayes} Seimo nariai. Laikas formuoti Vyriausybę.`) : tt('Too many coalition MPs broke ranks. A shaky coalition is a risky coalition.', 'Per daug koalicijos narių balsavo kitaip. Nestabili koalicija – rizikinga koalicija.')}</p>
          <Btn className="h-14 w-full text-lg mt-3" onClick={onDone}>{tt('See the final result', 'Galutinis rezultatas')} <ArrowRight size={20} /></Btn>
        </Card>
      )}
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
  if (R.kind === 'failed') return ['D', tt('The Seimas said no', 'Seimas nepritarė'), tt('You built a coalition, but rebels voted your nomination down.', 'Suburėte koaliciją, bet maištininkai atmetė jūsų kandidatūrą.')];
  if (R.kind === 'majority') return ['S', tt('You govern alone!', 'Valdote vieni!'), tt('A single-party majority, something no party has managed since 1992.', 'Vienos partijos dauguma – to nebuvo nuo 1992 metų.')];
  if (R.kind === 'pm') {
    if (R.stability >= 65) return ['A', tt('Prime Minister!', 'Ministras Pirmininkas!'), tt('Your team gets along and looks set to last a full four years.', 'Jūsų komanda sutaria ir, regis, ištvers visus ketverius metus.')];
    if (R.stability >= 45) return ['B', tt('Prime Minister!', 'Ministras Pirmininkas!'), tt('You run the government at Gedimino pr. 11, but expect some late-night arguments.', 'Vadovaujate Vyriausybei Gedimino pr. 11, bet laukia ir vėlyvų ginčų.')];
    return ['C', tt('Prime Minister (for now)', 'Premjeras (kol kas)'), tt('You got the top job, but your team is already squabbling.', 'Gavote aukščiausią postą, bet komanda jau pešasi.')];
  }
  if (R.kind === 'junior') return [PARTIES[g.player].difficulty === 'easy' ? 'C' : 'B', tt('Junior partner', 'Jaunesnysis partneris'), tt(`You join a ${partyShort(R.leader)}-led government and run ${R.ministries} ministr${R.ministries === 1 ? 'y' : 'ies'}.`, `Prisijungiate prie ${partyShort(R.leader)} vadovaujamos Vyriausybės ir gaunate ministerijų: ${R.ministries}.`)];
  if (E.natShares[g.player] >= 5) return ['D', tt('Opposition', 'Opozicija'), tt('You made it into the Seimas, but someone else is in charge.', 'Patekote į Seimą, bet valdo kiti.')];
  if (seats > 0) return ['E', tt('Hanging on', 'Išsilaikėte'), tt('Under 5% nationally, but your local candidates kept you in the Seimas.', 'Mažiau nei 5 % šalyje, bet apygardų kandidatai išlaikė jus Seime.')];
  return ['F', tt('Wiped out', 'Visiškas pralaimėjimas'), tt('No seats at all. Time for a new party leader…', 'Nė vieno mandato. Laikas ieškoti naujo lyderio…')];
}
function ResultScreen({ g, onRestart }) {
  const E = g.election;
  const R = g.result;
  const me = g.player;
  const P = PARTIES[me];
  const [grade, title, blurb] = gradeOf(g);
  const gov = R.kind === 'majority' ? [me] : R.kind === 'pm' ? [me, ...R.partners] : R.kind === 'failed' ? [] : R.members || [];
  const deb = g.stats.debates;
  const medal = { S: '#FDB913', A: '#FDB913', B: '#CBD5E1', C: '#E8A46B', D: '#BFDBFE', E: '#FECACA', F: '#FECACA' }[grade];
  return (
    <div className="max-w-lg mx-auto min-h-screen" style={{ ...GUTTER, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
      {['S', 'A', 'B'].includes(grade) && <Confetti />}
      <div className="pt-8 flex flex-col items-center text-center">
        <div className="relative sbl-pop">
          <div className="grid place-items-center rounded-full" style={{ width: 124, height: 124, background: medal, border: `4px solid ${INK}`, boxShadow: `0 6px 0 ${INK}` }}><span className="cx-title" style={{ fontSize: 64, lineHeight: 1 }}>{grade}</span></div>
          {['S', 'A', 'B'].includes(grade) && <Medal size={34} className="absolute -bottom-2 -right-2" style={{ fill: '#fff' }} strokeWidth={2.4} />}
        </div>
        <div className="text-sm font-extrabold t-muted mt-4">{P.short} · {P.leader}</div>
        <h2 className="cx-title text-4xl leading-none mt-1">{title}</h2>
        <p className="font-semibold mt-3 leading-relaxed">{blurb}</p>
      </div>
      {g.vote && (
        <div className="mt-4 cx-soft p-3 text-sm font-bold text-center">{tt('Seimas vote:', 'Seimo balsavimas:')} <span className="cx-num">{g.vote.ayes}</span> {tt('for', 'už')} · <span className="cx-num">{g.vote.noes}</span> {tt('against', 'prieš')} · <span className="cx-num">{g.vote.abst}</span> {tt('abstained', 'susilaikė')}</div>
      )}
      <Card className="mt-4 p-3">
        <Hemicycle seats={E.seats} highlight={me} dim={gov.length ? gov : null} showCount={false} />
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="text-sm font-extrabold">{tt('Government:', 'Vyriausybė:')}</span>
          {gov.length ? gov.map((p) => <PartyChip key={p} p={p}> {E.seats[p]}</PartyChip>) : <span className="text-sm font-bold t-muted">{tt('still being negotiated', 'dar derinama')}</span>}
          {gov.length > 0 && <span className="cx-num ml-auto">{sum(gov.map((p) => E.seats[p]))}</span>}
        </div>
        {R.kind === 'opposition' && !R.ok && <div className="text-sm font-bold mt-2" style={{ color: AMBER }}>{tt(`Nobody could build a majority: ${partyShort(R.leader)} tries to rule as a minority.`, `Niekam nepavyko suburti daugumos: ${partyShort(R.leader)} bando valdyti mažumos Vyriausybe.`)}</div>}
      </Card>
      <div className="grid grid-cols-2 gap-3 mt-4">
        {[
          [tt('National vote', 'Balsai šalyje'), fmtPct(E.natShares[me])],
          [tt('Seats won', 'Mandatai'), `${E.seats[me]}`],
          [tt('Debates won', 'Laimėti debatai'), tt(`${deb.filter((d) => d.won).length} of ${deb.length}`, `${deb.filter((d) => d.won).length} iš ${deb.length}`)],
          [tt('Gambling', 'Lošimai'), g.stats.gambles ? `${g.stats.gambleNet >= 0 ? '+' : '−'}${fmtEur(Math.abs(g.stats.gambleNet))}` : tt('Stayed clean', 'Nelošta')],
        ].map(([l, v]) => <div key={l} className="cx-card p-3" style={{ boxShadow: `0 4px 0 ${INK}` }}><div className="text-xs font-extrabold t-muted">{l}</div><div className="cx-num text-2xl">{v}</div></div>)}
      </div>
      <Card className="mt-4 p-4"><CardTitle>{tt('Final Seimas', 'Naujasis Seimas')}</CardTitle><SeatTable seats={E.seats} pr={E.pr} smd={E.smdSeats} highlight={me} /></Card>
      <Btn className="h-16 text-xl w-full mt-5" onClick={onRestart}><RotateCcw size={22} />{tt('Play again', 'Žaisti dar kartą')}</Btn>
    </div>
  );
}

/* ============================================================
   Toast, queue & root
   ============================================================ */
function Toast({ t }) {
  const bad = t.ok === false || t.tone === 'bad';
  const bg = bad ? '#E5484D' : t.tone === 'warn' ? '#FDE68A' : '#fff';
  return (
    <div className="fixed inset-x-0 z-50 pointer-events-none flex justify-center" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 104px)', ...GUTTER }} role="status" aria-live="polite">
      <div key={t.id} className="sbl-toast max-w-md w-full rounded-2xl px-4 py-3 font-extrabold" style={{ background: bg, color: bad ? '#fff' : INK, border: `3px solid ${INK}`, boxShadow: `0 5px 0 ${INK}` }}>{t.msg}</div>
    </div>
  );
}
function QueueModal({ g, item, act, nat, proj }) {
  const shift = () => act((gg) => { if (gg.queue[0] && gg.queue[0].type === 'report' && gg.tut === 5) gg.tut = 99; gg.queue.shift(); return null; });
  if (item.type === 'brief') return <WelcomeModal g={g} nat={nat} proj={proj} onStart={() => act((gg) => { gg.tut = 1; gg.queue.shift(); return null; })} onSkip={() => act((gg) => { gg.tut = 99; gg.queue.shift(); return null; })} />;
  if (item.type === 'report') return <ReportModal g={g} item={item} onClose={shift} />;
  if (item.type === 'event') return <EventModal g={g} item={item} onChoose={(i) => act((gg) => { resolveEvent(gg, i); return null; })} onClose={shift} />;
  if (item.type === 'debate') return <DebateModal key={`d${item.id}`} g={g} item={item} onFinish={(picks) => act((gg) => { gg.queue[0].done = resolveDebate(gg, item.id, picks); return null; })} onClose={shift} />;
  return null;
}
const LANG_KEY = 'seimas-bfl-lang';
export default function SeimasGame({ hotData } = {}) {
  const [lang, setLangState] = useState(() => {
    try { return window.localStorage.getItem(LANG_KEY) || 'lt'; } catch (e) { return 'lt'; }
  });
  LANG = lang;
  const setLang = (l) => { setLangState(l); try { window.localStorage.setItem(LANG_KEY, l); } catch (e) { /* ignore */ } };
  const [game, setGame] = useState(() => (hotData && hotData.game) || null);
  const [screen, setScreen] = useState(() => (hotData && hotData.game ? 'game' : 'title'));
  const [saved, setSaved] = useState(null);
  const [tab, setTab] = useState('map');
  const [sel, setSel] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [help, setHelp] = useState(false);
  const gameRef = useRef(game);
  gameRef.current = game;
  const toastTimer = useRef(null);
  useEffect(() => {
    if (!document.querySelector('link[href*="family=Fredoka"]')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = FONT_HREF;
      document.head.appendChild(l);
    }
    setSaved(loadSave());
    try { if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => ({ game: gameRef.current })); } catch (e) { /* no hot reload host */ }
    return () => clearTimeout(toastTimer.current);
  }, []);
  useEffect(() => { try { document.documentElement.lang = lang; } catch (e) { /* ignore */ } }, [lang]);
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
    if (g.phase === 'campaign') {
      if (g.tut === 2 && g.stats.actions > cur.stats.actions) g.tut = 3;
      if (g.tut === 3 && g.ap === 0) g.tut = 4;
    }
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
      recs: recommendMoves(game, 3),
    };
  }, [game, lang]);
  const goTab = (t) => { setTab(t); try { window.scrollTo({ top: 0 }); } catch (e) { /* ignore */ } };
  const openRegion = (rid) => { setSel(rid); if (gameRef.current && gameRef.current.tut === 1) act((g) => { g.tut = 2; return null; }); };
  const closeRegion = () => { setSel(null); const g0 = gameRef.current; if (g0 && g0.tut === 2) act((g) => { g.tut = 1; return null; }); };
  const skipTips = () => act((g) => { g.tut = 99; return null; });
  const openSheet = (name) => setSheet(name);
  const doEnd = (auto) => {
    setConfirmEnd(false); setSel(null); setSheet(null);
    act((g) => { if (auto) autoPlan(g); endWeek(g); return null; });
    goTab('map');
  };
  const restart = () => { writeSave(null); setGame(null); gameRef.current = null; setSaved(null); setSel(null); setTab('map'); setScreen('select'); };

  let body;
  if (screen === 'select') {
    body = <PartySelect onBack={() => setScreen('title')} onPick={(pid) => { const g = newGame(pid); gameRef.current = g; setGame(g); setTab('map'); setSel(null); setScreen('game'); }} />;
  } else if (screen === 'title' || !game) {
    body = <TitleScreen lang={lang} setLang={setLang} saved={saved} onNew={() => setScreen('select')} onContinue={() => { gameRef.current = saved; setGame(saved); setScreen('game'); }} />;
  } else if (game.phase === 'campaign' && derived) {
    const { shares, nat, proj, recs } = derived;
    body = (
      <>
        <Header g={game} proj={proj} onHelp={() => setHelp(true)} lang={lang} setLang={setLang} />
        <main className="max-w-lg mx-auto" style={{ ...GUTTER, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 128px)' }}>
          {tab === 'map' && <MapTab g={game} shares={shares} proj={proj} sel={sel} onSelect={openRegion} act={act} recs={recs} skipTips={skipTips} />}
          {tab === 'polls' && <PollsTab g={game} nat={nat} proj={proj} />}
          {tab === 'hq' && <HQTab g={game} act={act} openSheet={openSheet} />}
          {tab === 'news' && <NewsTab g={game} />}
        </main>
        <BottomNav tab={tab} setTab={goTab} g={game} glowEnd={game.tut === 4 || (game.ap === 0 && game.tut >= 5)} onEnd={() => (game.ap > 0 ? setConfirmEnd(true) : doEnd(false))} />
        {sel && <RegionDrawer g={game} rid={sel} proj={proj} onClose={closeRegion} onAction={(rid, type) => { const first = gameRef.current.tut === 2; act((g) => doRegionAction(g, rid, type)); if (first) setSel(null); }} tutStep={game.tut} onSkipTips={skipTips} />}
        {sheet === 'casino' && <CasinoSheet g={game} act={act} onClose={() => setSheet(null)} />}
        {sheet === 'bet' && <BetSheet g={game} act={act} onClose={() => setSheet(null)} />}
        {sheet === 'kompro' && <KomproSheet g={game} act={act} onClose={() => setSheet(null)} />}
        {confirmEnd && <ConfirmEnd g={game} onCancel={() => setConfirmEnd(false)} onConfirm={() => doEnd(false)} onAuto={() => doEnd(true)} />}
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
          if (kind === 'majority') {
            g.vote = { ...confidenceVote(g, [g.player], 82), members: [g.player], stability: 82 };
            g.phase = 'vote';
          } else { g.coal = { partners: [], accepted: {}, sweet: {} }; g.phase = 'coalition'; }
          try { window.scrollTo({ top: 0 }); } catch (e) { /* ignore */ }
          return null;
        })}
      />
    );
  } else if (game.phase === 'coalition') {
    body = <CoalitionTalks g={game} act={act} />;
  } else if (game.phase === 'vote') {
    body = (
      <VoteScreen
        key={`vote-${game.seed}`}
        g={game}
        onDone={() => act((g) => {
          const V = g.vote;
          if (!V.passed) g.result = { kind: 'failed', members: V.members };
          else if (V.members.length === 1) g.result = { kind: 'majority' };
          else g.result = { kind: 'pm', partners: V.members.slice(1), stability: V.stability, cabinet: cabinet(g, V.members.slice(1)) };
          g.phase = 'result';
          try { window.scrollTo({ top: 0 }); } catch (e) { /* ignore */ }
          return null;
        })}
      />
    );
  } else {
    body = <ResultScreen g={game} onRestart={restart} />;
  }
  return (
    <div className="sbl min-h-screen antialiased" lang={lang}>
      <style>{GLOBAL_CSS}</style>
      {body}
      {toast && <Toast t={toast} />}
    </div>
  );
}
