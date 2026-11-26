/*
 * Seimas: Battle for Lithuania · Seimas: kova dėl Lietuvos
 * A friendly, mobile-first campaign & coalition game built on Lithuania's real mixed electoral system:
 * 70 proportional seats (5% threshold, Hare–Niemeyer) + 71 single-mandate seats (two-round runoff).
 * Scenario: the 2028 Seimas election, starting from approximate late-2026 polling.
 * Fictional simulation: real party names and leaders give context; every event, statement and result is invented.
 * Single-file React component. Tailwind CSS + lucide-react. No external APIs. Lithuanian & English.
 * Map outlines simplified from @react-map/lithuania (MIT License, Copyright (c) Shubham Singh).
 */
import React, { useState, useEffect, useMemo, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import {
  Map as MapIcon, BarChart3, Building2, Newspaper, ChevronRight, ChevronDown, X, Zap, Wallet,
  Megaphone, Smartphone, Radio, DoorOpen, Swords, Users, Shield, Home, HeartPulse, Truck,
  Factory, Tractor, Plane, Anchor, GraduationCap, Globe, Coins, HandCoins, Handshake, Crown, Vote,
  RotateCcw, HelpCircle, AlertTriangle, Flame, Mic, Scale, Leaf, Info, ArrowRight, TramFront, TrainFront,
  Languages, PiggyBank, Trophy, Music, Mail, SkipForward, Check, Tv, Target, Briefcase, Play, Sparkles,
  ShieldAlert, Siren, Flag, Star, Smile, Meh, Frown, Lightbulb, Medal, Landmark, Heart, Sprout,
  Wheat, LockOpen, Rocket, Hammer, Church, Bus, MessageCircle, ShieldCheck, TrendingUp, Route, Layers, Clock, Dices, Search, Cloud, CloudRain, Sun, Gavel, Ticket, Eye,
  ThumbsUp, ThumbsDown, Volume2, VolumeX, Plus, Minus, Maximize2, LocateFixed, Menu, Repeat2, MessageSquare, Hash, Camera, BadgeCheck, Clapperboard, Share2, Calendar,
} from 'lucide-react';

/* ============================================================
   Language (lt / en)
   ============================================================ */
let LANG = 'lt';
let ADVISOR = true; // Rūta's tutorial & tips (chosen per campaign)
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
  'https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,500;0,600;0,700;0,800;1,600;1,700;1,800&family=Barlow:wght@400;500;600;700;800&display=swap';
const FONT_TITLE = "'Barlow Condensed', 'Arial Narrow', system-ui, sans-serif";
const F_DISPLAY = { fontFamily: FONT_TITLE, fontWeight: 700 };
const F_MONO = { fontFamily: FONT_TITLE, fontVariantNumeric: 'tabular-nums', fontWeight: 600 };
const F_BODY = "'Barlow', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const GUTTER = {
  paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))',
  paddingRight: 'max(16px, env(safe-area-inset-right, 0px))',
};
const FLAG = { y: '#FDB913', g: '#006A44', r: '#C1272D' };
// Dark "political drama" palette.
const INK = '#0F131B';
const SUN = '#F5A524';
const GOLD = SUN;
const MUTED = '#98A2B3';
const GREEN = '#4ADE80';
const RED = '#F87171';
const AMBER = '#FBBF24';
const TEXT = '#ECEFF4';
const PANEL = '#181E29';
const PANEL2 = '#212836';
const PANEL3 = '#2A3242';
const LINE = 'rgba(255,255,255,0.10)';
const LINE2 = 'rgba(255,255,255,0.18)';
const SHADOW = '0 10px 28px rgba(0,0,0,0.35)';
const GOOD_BG = 'rgba(74,222,128,0.14)';
const BAD_BG = 'rgba(248,113,113,0.15)';
const WARN_BG = 'rgba(251,191,36,0.15)';
const ACC_BG = 'rgba(245,165,36,0.14)';
const MAP_SEA = '#0E1828';
// Party colour darkened towards the panel colour, for tinted rows.
const tint = (c, k = 0.55) => mixHex(c, '#141922', k);

const GLOBAL_CSS = `
.sbl { --ink: #0F131B; --bg: #0D1118; --panel: #181E29; --panel2: #212836; --panel3: #2A3242; --line: rgba(255,255,255,.10); --line2: rgba(255,255,255,.18);
  --text: #ECEFF4; --muted: #98A2B3; --sun: #F5A524; --acc: #F5A524; --good: #4ADE80; --bad: #F87171; --warn: #FBBF24;
  color: var(--text); background: var(--bg); font-family: 'Barlow', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  position: relative; isolation: isolate; }
.sbl ::selection { background: rgba(245,165,36,.4) }
.sbl ::-webkit-scrollbar { width: 8px; height: 8px } .sbl ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.14); border-radius: 8px } .sbl ::-webkit-scrollbar-track { background: transparent }
.cx-card { background: linear-gradient(180deg, rgba(34,41,55,.97), rgba(22,27,37,.97)); border: 1px solid var(--line); border-radius: 14px;
  box-shadow: 0 12px 32px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.05); }
.cx-soft { background: rgba(255,255,255,.045); border: 1px solid rgba(255,255,255,.05); border-radius: 10px; }
.cx-panel2 { background: var(--panel2); }
:where(.cx-btn) { display: inline-flex; align-items: center; justify-content: center; gap: 8px; text-align: center; }
.cx-btn { border: 1px solid var(--line2); border-radius: 10px; font-weight: 700; color: var(--text); background: var(--panel3);
  cursor: pointer; user-select: none; -webkit-user-select: none; box-shadow: 0 4px 14px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.07);
  transition: transform .08s ease, filter .15s ease, background-color .15s ease, border-color .15s ease; }
.cx-btn:hover:not(:disabled) { filter: brightness(1.1); border-color: rgba(255,255,255,.32); }
.cx-btn:active:not(:disabled) { transform: translateY(1px) scale(.99); }
.cx-btn:disabled { opacity: .38; cursor: not-allowed; }
.cx-btn:focus-visible, .cx-tap:focus-visible { outline: 2px solid var(--acc); outline-offset: 2px; }
.cx-cta { font-family: 'Barlow Condensed', 'Arial Narrow', system-ui, sans-serif; font-style: italic; font-weight: 700; letter-spacing: .015em; }
.cx-tap { cursor: pointer; transition: transform .08s ease, border-color .15s ease, background-color .15s ease; }
.cx-tap:hover { border-color: rgba(255,255,255,.24); }
.cx-tap:active { transform: scale(.99); }
.cx-sun { background: linear-gradient(180deg, #FFBA3F, #EE980F); color: #1B1204; border-color: rgba(0,0,0,.3);
  box-shadow: 0 6px 20px rgba(245,165,36,.25), inset 0 1px 0 rgba(255,255,255,.4); }
.cx-leaf { background: linear-gradient(180deg, #34B26A, #22874D); color: #fff; }
.cx-berry { background: linear-gradient(180deg, #E5484D, #C2353A); color: #fff; }
.cx-white { background: var(--panel3); color: var(--text); }
.cx-pale { background: rgba(255,255,255,.06); color: var(--text); }
.cx-cream { background: linear-gradient(180deg, rgba(245,165,36,.13), rgba(245,165,36,.05)), var(--panel); border-color: rgba(245,165,36,.35); }
.cx-night { background: var(--panel); color: var(--text); }
.cx-quote { background: #F3F4F6; color: #11141B; border: 0; border-radius: 18px; box-shadow: 0 8px 20px rgba(0,0,0,.35); }
.cx-quote:hover:not(:disabled) { background: #fff; transform: translateX(3px); }
.cx-quote:disabled { opacity: .35; }
.cx-quote.cx-sun { background: linear-gradient(180deg, #FFBA3F, #EE980F); }
:where(.cx-chip) { display: inline-flex; align-items: center; gap: 6px; }
.cx-chip { border: 1px solid var(--line2); border-radius: 999px; background: rgba(255,255,255,.06); color: var(--text); font-weight: 700; }
.cx-pill { display: inline-flex; align-items: center; gap: 6px; background: #F3F4F6; color: #11141B; border-radius: 999px;
  font-family: 'Barlow Condensed', 'Arial Narrow', system-ui, sans-serif; font-weight: 700; font-variant-numeric: tabular-nums; box-shadow: 0 3px 10px rgba(0,0,0,.3); }
.cx-title { font-family: 'Barlow Condensed', 'Arial Narrow', system-ui, sans-serif; font-style: italic; font-weight: 700; letter-spacing: .005em; text-wrap: balance; }
.truncate { text-wrap: nowrap; }
.cx-num { font-family: 'Barlow Condensed', 'Arial Narrow', system-ui, sans-serif; font-variant-numeric: tabular-nums; font-weight: 700; }
.cx-kicker { font-family: 'Barlow Condensed', 'Arial Narrow', system-ui, sans-serif; font-style: italic; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--acc); }
.cx-bar { background: #07090D; color: #fff; }
.t-muted { color: var(--muted); }
.cx-track { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.10); border-radius: 999px; overflow: hidden; }
.cx-logo { font-family: 'Barlow Condensed', 'Arial Narrow', system-ui, sans-serif; font-style: italic; font-weight: 800; color: #fff; letter-spacing: .01em;
  text-shadow: 0 10px 40px rgba(0,0,0,.7); }
.cx-scene svg { filter: saturate(.82) contrast(1.06); }
.cx-scene svg path, .cx-scene svg rect, .cx-scene svg circle, .cx-scene svg ellipse, .cx-scene svg line, .cx-scene svg polyline { stroke-opacity: .55; }
.cx-map-dark path, .cx-map-dark circle { transition: fill .35s ease }
.cx-wheel { transition: transform 3.4s cubic-bezier(.12,.75,.12,1); transform-box: fill-box; transform-origin: center; }
.cx-ticker-wrap { overflow: hidden; white-space: nowrap; }
.cx-ticker { display: inline-flex; gap: 32px; padding-left: 100%; animation: cx-ticker 38s linear infinite; }
@keyframes cx-ticker { from { transform: translateX(0) } to { transform: translateX(-100%) } }
@keyframes cx-up { from { transform: translateY(32px); opacity: 0 } to { transform: none; opacity: 1 } }
@keyframes cx-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes cx-pop { 0% { transform: scale(.7); opacity: 0 } 70% { transform: scale(1.06) } 100% { transform: scale(1); opacity: 1 } }
@keyframes cx-bob { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-7px) } }
@keyframes cx-glow { 0% { box-shadow: 0 0 0 0 rgba(245,165,36,.75) } 100% { box-shadow: 0 0 0 16px rgba(245,165,36,0) } }
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
.cx-confetti { position: fixed; top: 0; width: 9px; height: 14px; border-radius: 2px; z-index: 70; pointer-events: none; animation: cx-fall linear forwards; }
.sbl-scroll { -webkit-overflow-scrolling: touch; overscroll-behavior: contain }
.cx-map path, .cx-map circle { transition: fill .35s ease }
@keyframes cx-ping { 0% { transform: scale(1); opacity: .7 } 100% { transform: scale(2.3); opacity: 0 } }
@keyframes cx-dash { to { stroke-dashoffset: -38 } }
.cx-ping { animation: cx-ping 1.5s ease-out infinite; transform-box: fill-box; transform-origin: center }
.cx-pop-svg { animation: cx-pop .45s ease both; transform-box: fill-box; transform-origin: center }
.cx-travel { transition: transform .9s cubic-bezier(.5,0,.3,1) }
.cx-dash { stroke-dasharray: 10 9; animation: cx-dash 1.2s linear infinite }
.cx-layers { scrollbar-width: none } .cx-layers::-webkit-scrollbar { display: none }
@keyframes cx-kb { 0% { transform: scale(1) translate(0, 0) } 100% { transform: scale(1.12) translate(-2%, -1.5%) } }
@keyframes cx-beam { 0%, 100% { transform: rotate(-9deg); opacity: .55 } 50% { transform: rotate(9deg); opacity: 1 } }
@keyframes cx-rise { 0% { transform: translateY(0) scale(.6); opacity: 0 } 15% { opacity: 1 } 100% { transform: translateY(-55vh) scale(1.15); opacity: 0 } }
@keyframes cx-slam { 0% { transform: scale(2.4); opacity: 0; filter: blur(8px) } 60% { transform: scale(.96); opacity: 1; filter: none } 100% { transform: scale(1) } }
@keyframes cx-wipe { from { transform: scaleX(0) } to { transform: scaleX(1) } }
@keyframes cx-chyron { from { transform: translateY(26px); opacity: 0 } to { transform: none; opacity: 1 } }
@keyframes cx-caret { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }
@keyframes cx-float { 0% { transform: translateY(8px); opacity: 0 } 15% { transform: translateY(0); opacity: 1 } 75% { opacity: 1 } 100% { transform: translateY(-70px); opacity: 0 } }
@keyframes cx-ripple { 0% { transform: scale(.6); opacity: .9 } 100% { transform: scale(3); opacity: 0 } }
@keyframes cx-tabin { from { transform: translateY(10px); opacity: 0 } to { transform: none; opacity: 1 } }
@keyframes cx-flashbulb { 0%, 100% { opacity: 0 } 50% { opacity: .9 } }
.cx-kb { animation: cx-kb 22s ease-in-out infinite alternate; transform-origin: 50% 60%; }
.cx-beam { animation: cx-beam 7s ease-in-out infinite; transform-origin: 50% 0; mix-blend-mode: screen; }
.cx-rise { animation: cx-rise 2.2s ease-out both; }
.cx-slam { animation: cx-slam .7s cubic-bezier(.2,.9,.25,1) both; }
.cx-wipe { animation: cx-wipe .6s .45s cubic-bezier(.2,.8,.2,1) both; transform-origin: left; }
.cx-chyron { animation: cx-chyron .35s cubic-bezier(.2,.9,.3,1.1) both; }
.cx-caret { animation: cx-caret .8s steps(1) infinite; }
.cx-pop-in { animation: cx-pop .45s cubic-bezier(.2,.9,.3,1.3) both; }
.cx-float { animation: cx-float 2.1s ease-out forwards; transform-box: fill-box; }
.cx-ripple { animation: cx-ripple 1.1s ease-out 2 forwards; transform-box: fill-box; transform-origin: center; }
.cx-tabin { animation: cx-tabin .32s ease both; }
@keyframes cx-eq { 0%, 100% { transform: scaleY(.35) } 50% { transform: scaleY(1) } }
.cx-eq { animation: cx-eq .7s ease-in-out infinite; transform-origin: bottom; }
.cx-weekintro { animation: cx-fade .25s ease both; }
.cx-flashbulb { position: absolute; border-radius: 999px; background: radial-gradient(circle, #fff, rgba(255,255,255,0) 70%); animation: cx-flashbulb .5s ease-out both; pointer-events: none; }
@media (prefers-reduced-motion: reduce) {
  .sbl-sheet, .sbl-fade, .sbl-pop, .sbl-toast, .sbl-blink, .cx-bob, .cx-glow, .cx-shake, .cx-ping, .cx-pop-svg, .cx-dash, .cx-kb, .cx-beam, .cx-slam, .cx-wipe, .cx-chyron, .cx-caret, .cx-pop-in, .cx-tabin, .cx-weekintro, .cx-eq { animation: none !important }
  .cx-rise, .cx-float, .cx-ripple, .cx-flashbulb { display: none }
  .cx-travel { transition: none }
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
  DP: {
    id: 'DP', short: 'DP', name: 'Darbo partija', full: 'Darbo partija', color: '#7C3AED', emblem: Hammer,
    leader: 'Gintaras Steponėnas', ideology: bi('Centre-left · Populist', 'Centro kairė · Populistai'), pos: { econ: -30, social: 30, defense: 30, green: 0 }, funds: 500,
    difficulty: 'hard', stars: 3,
    blurb: bi('The once-mighty Labour Party, hoping for a comeback in the regions.', 'Kadaise galinga Darbo partija, tikinti sugrįžimu regionuose.'),
    perk: bi('Old local networks: door-knocking builds your ground team 50% faster.', 'Seni vietos tinklai: agitacija nuo durų iki durų stiprina komandą 50 % greičiau.'),
    strongholds: bi('Kaunas County, Panevėžys and small towns', 'Kauno apskritis, Panevėžys ir miesteliai'),
  },
  LIT: {
    id: 'LIT', short: 'L&T', name: 'Laisvė ir teisingumas', full: 'Partija „Laisvė ir teisingumas“', color: '#1E3A8A', emblem: Scale,
    leader: 'Artūras Zuokas', ideology: bi('Liberal-conservative', 'Liberalūs konservatoriai'), pos: { econ: 30, social: 30, defense: 60, green: 0 }, funds: 550,
    difficulty: 'hard', stars: 3,
    blurb: bi('A small liberal-conservative party with a well-known Vilnius politician at the helm.', 'Nedidelė liberalių konservatorių partija, kuriai vadovauja žinomas Vilniaus politikas.'),
    perk: bi('Vilnius knows your leader: campaigning in Vilnius City works 30% better.', 'Vilnius pažįsta jūsų lyderį: agitacija Vilniaus mieste veikia 30 % geriau.'),
    strongholds: bi('Vilnius City', 'Vilniaus miestas'),
  },
  KS: {
    id: 'KS', short: 'KS', name: 'Krikščionių sąjunga', full: 'Krikščionių sąjunga', color: '#92400E', emblem: Church,
    leader: 'Rimantas Jonas Dagys', ideology: bi('Christian conservative', 'Krikščionys konservatoriai'), pos: { econ: 30, social: 90, defense: 60, green: -30 }, funds: 450,
    difficulty: 'hard', stars: 3,
    blurb: bi('Christian conservatives campaigning on family values.', 'Krikščionys konservatoriai, kurių kampanijos ašis – šeimos vertybės.'),
    perk: bi('Family-values pledges land 40% harder with traditional voters.', 'Šeimos vertybių pažadai tradiciniams rinkėjams veikia 40 % stipriau.'),
    strongholds: bi('Kaunas and traditional rural parishes', 'Kaunas ir tradicinės kaimo parapijos'),
  },
  LZP: {
    id: 'LZP', short: 'LŽP', name: 'Žaliųjų partija', full: 'Lietuvos žaliųjų partija', color: '#06B6D4', emblem: Leaf,
    leader: 'Ieva Budraitė', ideology: bi('Green · Progressive', 'Žalieji · Progresyvieji'), pos: { econ: 0, social: -60, defense: 30, green: 90 }, funds: 400,
    difficulty: 'hard', stars: 3,
    blurb: bi('Environmentalists who want Lithuania to go green, fast.', 'Aplinkosaugininkai, norintys, kad Lietuva kuo greičiau žalėtų.'),
    perk: bi('Green pledges and online ads work extra well with young city voters.', 'Žali pažadai ir reklama internete ypač veikia jaunus miestiečius.'),
    strongholds: bi('Young voters in Vilnius, Kaunas and Klaipėda', 'Jauni Vilniaus, Kauno ir Klaipėdos rinkėjai'),
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
const PARTY_IDS = ['LSDP', 'TS', 'NA', 'DSVL', 'LS', 'LVZS', 'LP', 'LLRA', 'DP', 'LIT', 'KS', 'LZP'];
const ALL_IDS = [...PARTY_IDS, 'KITI'];
const SEAT_LEFT = ['LSDP', 'DP', 'DSVL', 'LVZS', 'NA', 'LLRA', 'KS', 'KITI'];
const SEAT_RIGHT = ['LZP', 'LP', 'LS', 'LIT', 'TS'];
const SEAT_ORDER = [...SEAT_LEFT, ...SEAT_RIGHT];
const WEEKS = 12;
const MAJORITY = 71;
const DEBATE_WEEKS = [4, 8, 11];
const ENDORSE_WEEKS = [6, 10];
// Campaign staff you can hire (max 3). Wages are paid every week.
const STAFF = [
  { id: 'strategist', look: 'strat', wage: 60, name: bi('Campaign strategist', 'Kampanijos strategas'), desc: bi('+1 energy every week.', '+1 energija kas savaitę.') },
  { id: 'press', look: 'pressec', wage: 25, name: bi('Press secretary', 'Atstovė spaudai'), desc: bi('Scandal risk fades twice as fast; press conferences work 50% better.', 'Skandalo rizika blėsta dvigubai greičiau; spaudos konferencijos veikia 50 % geriau.') },
  { id: 'digital', look: 'digi', wage: 30, name: bi('Digital director', 'Skaitmeninės kampanijos vadovas'), desc: bi('Online ads work 30% better.', 'Reklama internete veikia 30 % geriau.') },
  { id: 'field', look: 'fieldorg', wage: 25, name: bi('Field organiser', 'Lauko kampanijos organizatorė'), desc: bi('Door-knocking builds ground teams 50% faster.', 'Agitacija nuo durų iki durų stiprina komandas 50 % greičiau.') },
  { id: 'pollster', look: 'pollst', wage: 30, name: bi('In-house pollster', 'Štabo sociologas'), desc: bi('Micro-targeting: every regional move works 6% better.', 'Tikslinė auditorija: visi veiksmai regionuose 6 % stipresni.') },
  { id: 'fundraiser', look: 'fundr', wage: 20, name: bi('Fundraiser', 'Lėšų rinkėja'), desc: bi('Weekly donations +35%, donor dinners +25%.', 'Savaitinės aukos +35 %, rėmėjų vakarienės +25 %.') },
  { id: 'lawyer', look: 'lawyer', wage: 30, name: bi('Election lawyer', 'Rinkimų teisininkas'), desc: bi('Halves VRK fines and the risk of gambling or dirt-digging leaking.', 'Perpus sumažina VRK baudas ir riziką, kad nutekės lošimai ar kompromato paieškos.') },
];
const STAFF_MAX = 3;
const hasStaff = (g, id) => (g.staff || []).includes(id);
// The week's campaign message. It lifts moves in regions where its issues matter.
const THEMES = [
  { id: 'econ', icon: Wallet, name: bi('Cost of living', 'Pragyvenimas'), issues: ['col', 'tax', 'pensions', 'energy'], groups: { seniors: 1.2, public: 0.8, business: -0.4 } },
  { id: 'security', icon: Shield, name: bi('Security', 'Saugumas'), issues: ['def'], groups: { seniors: 0.6, business: 0.6 } },
  { id: 'regions', icon: Tractor, name: bi('Regions & jobs', 'Regionai'), issues: ['roads', 'health', 'jobs', 'agri', 'emig'], groups: { farmers: 1.2, public: 0.6 } },
  { id: 'city', icon: Building2, name: bi('Cities & future', 'Miestai ir ateitis'), issues: ['housing', 'transit', 'port', 'diaspora'], groups: { youth: 1.2, business: 0.6 } },
  { id: 'trust', icon: Scale, name: bi('Honest politics', 'Sąžininga politika'), issues: ['trust', 'minority'], groups: { seniors: 0.4, youth: 0.4 }, cred: 1 },
];
const THEME_MAP = Object.fromEntries(THEMES.map((t) => [t.id, t]));
const SCENARIOS = [
  { id: 'standard', name: bi('Standard election', 'Įprasti rinkimai'), desc: bi('The 2028 race as the polls see it today.', '2028 m. rinkimai, kaip juos šiandien mato apklausos.') },
  { id: 'energy', name: bi('Energy shock', 'Energetikos šokas'), desc: bi('Heating bills explode. Governing parties start on the back foot and cost-of-living messages hit harder.', 'Sprogsta šildymo sąskaitos. Valdantieji startuoja silpniau, pragyvenimo tema veikia stipriau.') },
  { id: 'security', name: bi('Security scare', 'Saugumo nerimas'), desc: bi('Incidents on the Belarus border. Hawks gain and security messages hit harder.', 'Incidentai pasienyje su Baltarusija. Kietos linijos šalininkai stiprėja, saugumo tema veikia stipriau.') },
  { id: 'scandal', name: bi('Autumn of scandals', 'Skandalų ruduo'), desc: bi('Leaks everywhere: more rival scandals, low trust, and reputation matters even more.', 'Nutekinimai visur: daugiau varžovų skandalų, žemas pasitikėjimas, reputacija dar svarbesnė.') },
];
const DIFFS = {
  easy: { name: bi('Easy', 'Lengvas'), desc: bi('Calmer rivals, more donations.', 'Ramesni varžovai, daugiau aukų.'), income: 1.25, ai: -1 },
  normal: { name: bi('Normal', 'Įprastas'), desc: bi('The intended challenge.', 'Numatytas iššūkis.'), income: 1, ai: 0 },
  hard: { name: bi('Hard', 'Sunkus'), desc: bi('Aggressive rivals, tighter money.', 'Agresyvūs varžovai, mažiau pinigų.'), income: 0.85, ai: 1 },
};
const ACHIEVEMENTS = [
  { id: 'pm', name: bi('Prime Minister', 'Ministras Pirmininkas'), desc: bi('Win the confidence vote.', 'Laimėkite balsavimą dėl premjero.') },
  { id: 'majority', name: bi('One-party rule', 'Vienos partijos valdžia'), desc: bi('Win 71 seats on your own.', 'Laimėkite 71 mandatą vieni.') },
  { id: 'outsider', name: bi('Over the line', 'Per barjerą'), desc: bi('Get an outsider party over 5%.', 'Įveskite autsaiderių partiją per 5 % barjerą.') },
  { id: 'outsider_gov', name: bi('From nowhere to power', 'Iš niekur – į valdžią'), desc: bi('Govern with an outsider party.', 'Patekite į valdžią su autsaiderių partija.') },
  { id: 'debates', name: bi('Debate champion', 'Debatų čempionas'), desc: bi('Win all three LRT debates.', 'Laimėkite visus tris LRT debatus.') },
  { id: 'clean', name: bi('Clean hands', 'Švarios rankos'), desc: bi('No scandals, no gambling, no dirt-digging.', 'Jokių skandalų, lošimų ar kompromato.') },
  { id: 'gambler', name: bi('House loses', 'Kazino pralaimi'), desc: bi('Finish ahead at the casino and bookies.', 'Baikite pliuse kazino ir lažybose.') },
  { id: 'trusted', name: bi('Word of honour', 'Garbės žodis'), desc: bi('Finish with reputation 80 or more.', 'Baikite su 80+ reputacija.') },
  { id: 'unity', name: bi('One team', 'Viena komanda'), desc: bi('Finish with party unity 85 or more.', 'Baikite su 85+ partijos vienybe.') },
  { id: 'tour', name: bi('Grand tour', 'Didysis turas'), desc: bi('Take your leader to all 13 regions.', 'Nuvežkite lyderį į visus 13 regionų.') },
  { id: 'runoffs', name: bi('Runoff king', 'Antrojo turo karalius'), desc: bi('Win 8 or more runoffs.', 'Laimėkite 8 ar daugiau antrųjų turų.') },
  { id: 'diaspora', name: bi('Voice of the diaspora', 'Diasporos balsas'), desc: bi('Win the Lithuanians-abroad seat.', 'Laimėkite užsienio lietuvių apygardą.') },
  { id: 'boardroom', name: bi('Model member', 'Pavyzdingas narys'), desc: bi('Complete 8 party-board tasks.', 'Įvykdykite 8 partijos tarybos užduotis.') },
  { id: 'hard', name: bi('Against the odds', 'Prieš visus'), desc: bi('Become PM on Hard.', 'Tapkite premjeru sunkiu lygiu.') },
  { id: 'solo', name: bi('No hand-holding', 'Be pagalbos'), desc: bi('Become PM without Rūta.', 'Tapkite premjeru be Rūtos.') },
];
const ACH_KEY = 'seimas-bfl-ach';
function loadAch() { try { return JSON.parse(window.localStorage.getItem(ACH_KEY) || '[]'); } catch (e) { return []; } }
function saveAch(list) { try { window.localStorage.setItem(ACH_KEY, JSON.stringify(list)); } catch (e) { /* storage unavailable */ } }
function earnedAchievements(g) {
  const E = g.election, R = g.result || {};
  const me = g.player;
  const pm = R.kind === 'pm' || R.kind === 'majority';
  const gov = pm || R.kind === 'junior';
  const outsider = ['DP', 'LIT', 'KS', 'LZP'].includes(me);
  const out = [];
  if (pm) out.push('pm');
  if (E && E.seats[me] >= MAJORITY) out.push('majority');
  if (outsider && E && E.natShares[me] >= 5) out.push('outsider');
  if (outsider && gov) out.push('outsider_gov');
  if (g.stats.debates.length === 3 && g.stats.debates.every((d) => d.won)) out.push('debates');
  if (!g.stats.gambles && !g.stats.kompro && !['scandal_mp', 'scandal_money', 'fu_donor'].some((id) => g.usedEvents.includes(id))) out.push('clean');
  if (g.stats.gambles && g.stats.gambleNet > 0) out.push('gambler');
  if (g.cred >= 80) out.push('trusted');
  if (g.unity >= 85) out.push('unity');
  if ((g.toured || []).length >= REGIONS.length) out.push('tour');
  if (E && E.smd.filter((e) => e.round === 2 && e.winner === me).length >= 8) out.push('runoffs');
  if (E && E.smd.some((e) => e.rid === 'ABR' && e.winner === me)) out.push('diaspora');
  if ((g.stats.objectives || 0) >= 8) out.push('boardroom');
  if (pm && g.diff === 'hard') out.push('hard');
  if (pm && g.advisor === false) out.push('solo');
  return out;
}
// Party-board tasks: one per week, judged when the week ends.
function makeObjective(g) {
  const me = g.player;
  if (DEBATE_WEEKS.includes(g.week)) return { kind: 'debate', reward: 'pc' };
  const kinds = ['region', 'money', 'visit', 'door', 'clean', 'national'].filter((k) => k !== (g.objective && g.objective.kind));
  const kind = kinds[Math.floor(Math.random() * kinds.length)];
  const reward = ['pc', 'money', 'unity'][g.week % 3];
  if (kind === 'region') {
    const cands = REGIONS.filter((r) => r.id !== 'ABR' && r.seats >= 5 && Math.abs(raceInfo(g, r).gap) < 9);
    const r = (cands.length ? cands : REGIONS.filter((x) => x.seats >= 5))[Math.floor(Math.random() * (cands.length || 1))];
    return { kind, rid: r.id, need: 0.8, reward };
  }
  if (kind === 'money') return { kind, need: Math.round((110 + g.week * 8) * Math.sqrt(FUND_MULT[me]) / 10) * 10, reward: reward === 'money' ? 'unity' : reward };
  if (kind === 'visit') return { kind, need: 3, reward };
  if (kind === 'door') return { kind, need: 2, reward };
  if (kind === 'national') return { kind, need: 0.35, reward };
  return { kind: 'clean', reward };
}
function objectiveText(o) {
  switch (o.kind) {
    case 'region': return bi(`Gain at least ${o.need} pts in ${L(REG[o.rid].short)} this week.`, `Šią savaitę pakelkite paramą: ${L(REG[o.rid].short)} bent +${String(o.need).replace('.', ',')} p.`);
    case 'money': return bi(`Raise at least ${fmtEur(o.need)} this week.`, `Šią savaitę surinkite bent ${fmtEur(o.need)}.`);
    case 'visit': return bi(`Campaign in ${o.need} different regions.`, `Agituokite ${o.need} skirtinguose regionuose.`);
    case 'door': return bi(`Knock on doors at least ${o.need} times.`, `Bent ${o.need} kartus agituokite nuo durų iki durų.`);
    case 'national': return bi(`Lift your national rating by ${o.need} pts.`, `Pakelkite reitingą šalyje bent ${String(o.need).replace('.', ',')} p.`);
    case 'debate': return bi('Finish first or second in this week’s LRT debate.', 'Šios savaitės LRT debatuose užimkite 1 ar 2 vietą.');
    default: return bi('Run a clean week: no attack ads, no gambling, no shady deals, no dirt-digging.', 'Švari savaitė: jokių puolimų, lošimų, abejotinų sandorių ar kompromato.');
  }
}
const REWARD_TEXT = { pc: bi('+1 favour', '+1 ryšys'), money: bi('+€40k', '+40 tūkst. €'), unity: bi('+6 unity', '+6 vienybės') };
function objectiveProgress(g) {
  const o = g.objective;
  const me = g.player;
  if (!o) return { ok: false, now: 0 };
  switch (o.kind) {
    case 'region': { const d = regionShares(g, REG[o.rid])[me] - ((g.weekStart && g.weekStart[o.rid]) ? g.weekStart[o.rid][me] : 0); return { ok: d >= o.need, now: d, need: o.need }; }
    case 'money': return { ok: (g.weekRaised || 0) >= o.need, now: g.weekRaised || 0, need: o.need };
    case 'visit': { const n = new Set((g.weekMoves || []).map((m) => m.rid)).size; return { ok: n >= o.need, now: n, need: o.need }; }
    case 'door': { const n = (g.weekMoves || []).filter((m) => m.type === 'door').length; return { ok: n >= o.need, now: n, need: o.need }; }
    case 'national': { const d = nationalShares(g)[me] - (g.weekNatStart || 0); return { ok: d >= o.need, now: d, need: o.need }; }
    case 'debate': { const d = g.stats.debates.find((x) => x.idx === DEBATE_WEEKS.indexOf(g.week)); return { ok: !!d && d.rank <= 2, now: d ? d.rank : 0 }; }
    default: return { ok: !g.attacksThisWeek && !g.weekShady, now: 0 };
  }
}
function judgeObjective(g) {
  const o = g.objective;
  if (!o) return;
  const { ok } = objectiveProgress(g);
  if (ok) {
    g.stats.objectives = (g.stats.objectives || 0) + 1;
    g.unity = clamp(g.unity + 4, 0, 100);
    if (o.reward === 'pc') g.pc += 1;
    else if (o.reward === 'money') g.money += 40;
    else g.unity = clamp(g.unity + 6, 0, 100);
    addCons(g, 'good', bi(`Party board task done: ${objectiveText(o).en} (${REWARD_TEXT[o.reward].en}, +4 unity)`, `Partijos tarybos užduotis įvykdyta: ${objectiveText(o).lt} (${REWARD_TEXT[o.reward].lt}, +4 vienybės)`));
  } else {
    g.unity = clamp(g.unity - 5, 0, 100);
    addCons(g, 'bad', bi(`Party board task missed: ${objectiveText(o).en} Unity −5.`, `Partijos tarybos užduotis neįvykdyta: ${objectiveText(o).lt} Vienybė −5.`));
  }
}
function themeMult(g, r) {
  const T = g.theme && THEME_MAP[g.theme];
  if (!T) return 1;
  const match = r.issues.some((i) => T.issues.includes(i));
  let m = match ? 1.12 : 0.97;
  m += 0.02 * Math.min(g.themeStreak || 0, 3);
  if ((g.scen === 'energy' && T.id === 'econ') || (g.scen === 'security' && T.id === 'security')) m += 0.08;
  return m;
}
function setTheme(g, id) {
  if (g.theme === id) return { ok: true };
  if (g.themeLocked) return { ok: false, msg: tt('You already campaigned on this week’s message. Change it next week.', 'Šios savaitės žinutę jau skleidžiate. Pakeisti galėsite kitą savaitę.') };
  if (g.theme && (g.themeStreak || 0) >= 2) {
    g.momentum[g.player] = clamp(g.momentum[g.player] - 0.3, -10, 10);
    addCons(g, 'warn', bi('You dropped a message you had pushed for weeks. Commentators call it confusing (buzz −0.3).', 'Atsisakėte kelias savaites kartotos žinutės. Komentatoriai tai vadina painiava (pagreitis −0,3).'));
  }
  g.theme = id;
  return { ok: true, tone: 'good', msg: tt(`This week’s message: ${THEME_MAP[id].name.en}`, `Šios savaitės žinutė: ${THEME_MAP[id].name.lt}`) };
}
function hireStaff(g, id) {
  const S = STAFF.find((x) => x.id === id);
  if (hasStaff(g, id)) return { ok: false, msg: tt('Already on the team.', 'Jau komandoje.') };
  if ((g.staff || []).length >= STAFF_MAX) return { ok: false, msg: tt('Your HQ is full: let someone go first.', 'Štabas pilnas: pirmiausia ką nors atleiskite.') };
  const fee = S.wage * 2;
  if (g.money < fee) return { ok: false, msg: tt(`Signing fee: ${fmtEur(fee)}.`, `Įstojimo išmoka: ${fmtEur(fee)}.`) };
  spend(g, fee);
  g.staff = [...(g.staff || []), id];
  if (id === 'strategist') { g.apMax += 1; g.ap += 1; }
  return { ok: true, tone: 'good', msg: tt(`${S.name.en} joins your HQ.`, `${S.name.lt} prisijungia prie štabo.`) };
}
function fireStaff(g, id) {
  if (!hasStaff(g, id)) return { ok: false };
  g.staff = g.staff.filter((x) => x !== id);
  if (id === 'strategist') { g.apMax -= 1; g.ap = Math.min(g.ap, g.apMax); }
  g.unity = clamp(g.unity - 1, 0, 100);
  const S = STAFF.find((x) => x.id === id);
  return { ok: true, tone: 'warn', msg: tt(`${S.name.en} leaves the campaign.`, `${S.name.lt} palieka kampaniją.`) };
}
// Runoff pacts: a partner's voters lean to you in your runoffs, yours to them in theirs.
function pactCost(g, q) {
  if (q === g.player || q === 'KITI') return null;
  const c = compat(g, g.player, q);
  return c >= 55 ? 1 : c >= 40 ? 2 : null;
}
function runoffTally(g, ctx, e, pacts, boosts, extraNoise) {
  const me = g.player;
  const A = e.runoff.a, B = e.runoff.b;
  const tAff = (q, X) => {
    let a = transferAff(g, q, X) * (X === ctx.lead0 ? ctx.damp : 1);
    if (pacts && X === me && pacts[q]) a *= 2.4;
    if (pacts && q === me && pacts[X]) a *= 2.4;
    return a;
  };
  let va = e.sA * 0.9, vb = e.sB * 0.9;
  const mine = A === me || B === me;
  for (const x of e.cand) {
    if (x.p === A || x.p === B) continue;
    const da = tAff(x.p, A), db = tAff(x.p, B);
    const turn = pacts && mine && pacts[x.p] ? 0.75 : 0.6;
    va += (x.s * turn * da) / (da + db);
    vb += (x.s * turn * db) / (da + db);
  }
  va *= e.nA * (1 + g.gg[e.rid][A] / 600);
  vb *= e.nB * (1 + g.gg[e.rid][B] / 600);
  const b = (boosts && boosts[e.cid]) || 0;
  if (A === me) va *= 1 + 0.06 * b;
  if (B === me) vb *= 1 + 0.06 * b;
  if (extraNoise) { va *= Math.exp(gauss() * 0.03); vb *= Math.exp(gauss() * 0.03); }
  const t = va + vb;
  return { sa: (va / t) * 100, sb: (vb / t) * 100, winner: va >= vb ? A : B, margin: (Math.abs(va - vb) / t) * 100 };
}
function applyRunoffDeals(g, pacts, boosts) {
  const E = g.election;
  const me = g.player;
  const chosen = Object.keys(pacts).filter((q) => pacts[q]);
  g.pc = Math.max(0, g.pc - sum(chosen.map((q) => pactCost(g, q) || 0)));
  g.pacts = chosen;
  E.smd.forEach((e) => {
    if (e.round !== 2) return;
    const r = runoffTally(g, E, e, pacts, boosts, true);
    e.runoff = { ...e.runoff, sa: r.sa, sb: r.sb };
    e.winner = r.winner;
    e.margin = r.margin;
  });
  const seats = Object.fromEntries(ALL_IDS.map((q) => [q, E.pr[q] || 0]));
  const smdSeats = Object.fromEntries(ALL_IDS.map((q) => [q, 0]));
  E.smd.forEach((e) => { seats[e.winner] += 1; smdSeats[e.winner] += 1; });
  E.seats = seats;
  E.smdSeats = smdSeats;
  E.dealsDone = true;
  if (chosen.length) addNews(g, { kind: 'pacts', list: chosen });
}

// Where each leader starts the campaign (party HQ or home turf).
const HOME = { NA: 'TAU', LLRA: 'VLC', DP: 'KNC', KS: 'KNS' };
// Land borders between the 13 campaign regions (cities sit inside their counties).
const ADJ = (() => {
  const pairs = [['VNO', 'VLC'], ['VLC', 'KNC'], ['VLC', 'UTE'], ['VLC', 'ALY'], ['KNS', 'KNC'], ['KNC', 'ALY'], ['KNC', 'MAR'], ['KNC', 'TAU'], ['KNC', 'SIA'], ['KNC', 'PAN'],
    ['KLP', 'TEL'], ['KLP', 'TAU'], ['TEL', 'TAU'], ['TEL', 'SIA'], ['TAU', 'SIA'], ['SIA', 'PAN'], ['PAN', 'UTE'], ['ALY', 'MAR']];
  const out = {};
  for (const [a, b] of pairs) { (out[a] = out[a] || []).push(b); (out[b] = out[b] || []).push(a); }
  out.ABR = [];
  return out;
})();
// Fictional polling firms with small house effects.
const POLLSTERS = [
  { name: 'Baltijos apklausos', n: 1004, house: { TS: 0.8, LS: 0.4, NA: -0.6 } },
  { name: 'Rinkos pulsas', n: 1012, house: { LSDP: 0.7, NA: 0.6, TS: -0.5 } },
  { name: 'Vilniaus tyrimų centras', n: 806, house: { LP: 0.5, DSVL: 0.4, LVZS: -0.5 } },
  { name: 'Visuomenės nuomonė', n: 1508, house: { LVZS: 0.6, LLRA: 0.3, LS: -0.4 } },
];
const ORGS = [
  { id: 'unions', group: 'public', week: 6, name: bi('Trade unions', 'Profesinės sąjungos') },
  { id: 'farmorgs', group: 'farmers', week: 6, name: bi('Farmers’ organisations', 'Ūkininkų organizacijos') },
  { id: 'bizorgs', group: 'business', week: 6, name: bi('Business associations', 'Verslo asociacijos') },
  { id: 'youthorgs', group: 'youth', week: 10, name: bi('Youth organisations', 'Jaunimo organizacijos') },
  { id: 'seniororgs', group: 'seniors', week: 10, name: bi('Seniors’ associations', 'Senjorų bendrijos') },
  { id: 'minorityorgs', group: 'minority', week: 10, name: bi('Minority community councils', 'Tautinių bendrijų tarybos') },
];
const VRK_LIMIT = 2300;
const FUND_MULT = { LSDP: 1, TS: 1.6, NA: 0.75, DSVL: 0.9, LS: 1.35, LVZS: 0.95, LP: 0.85, LLRA: 0.8, DP: 0.75, LIT: 0.85, KS: 0.7, LZP: 0.65 };
const BACKFIRE = { LSDP: 0.22, TS: 0.2, NA: 0.07, DSVL: 0.38, LS: 0.22, LVZS: 0.18, LP: 0.2, LLRA: 0.25, DP: 0.15, LIT: 0.18, KS: 0.2, LZP: 0.3 };
const FATIGUE = [1, 0.8, 0.62, 0.48, 0.38, 0.3];
// Late-2026 polling shift relative to the 2024 regional baselines below.
const BASE_SHIFT = { TS: 1.13, LSDP: 0.84, NA: 0.98, LVZS: 1.75, DSVL: 0.97, LS: 0.95, LP: 0.92, LLRA: 1, KITI: 0.86, DP: 1, LIT: 1, KS: 1, LZP: 1 };
// Smaller parties carved out of the 'others' bloc (percent of each region's vote, before the 2026 shift).
const MINOR_BASE = {
  VNO: { DP: 1.5, LIT: 4, KS: 1.5, LZP: 2.5 }, VLC: { DP: 2, LIT: 2, KS: 1.5, LZP: 0.8 }, KNS: { DP: 2.5, LIT: 2, KS: 2.5, LZP: 2 },
  KNC: { DP: 3.5, LIT: 1.5, KS: 2, LZP: 1 }, KLP: { DP: 2.5, LIT: 2, KS: 1.5, LZP: 1.8 }, TEL: { DP: 2.5, LIT: 1.5, KS: 2, LZP: 0.8 },
  TAU: { DP: 3, LIT: 1.5, KS: 2, LZP: 0.8 }, SIA: { DP: 3, LIT: 1.5, KS: 1.8, LZP: 1 }, PAN: { DP: 3.5, LIT: 1.5, KS: 1.8, LZP: 1 },
  UTE: { DP: 3, LIT: 1.5, KS: 1.5, LZP: 1.2 }, ALY: { DP: 3, LIT: 1.5, KS: 1.8, LZP: 1 }, MAR: { DP: 3, LIT: 1.5, KS: 2.2, LZP: 0.8 },
  ABR: { DP: 0.5, LIT: 2.5, KS: 1, LZP: 2.5 },
};

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
      ['Senamiesčio–Žvėryno', 1, { LP: 1.6, TS: 1.3, LS: 1.35, NA: 0.6, LLRA: 0.4 }, 1, 'Senamiestis–Žvėrynas', '', ['Viktorija Čmilytė-Nielsen', 'LS']],
      ['Naujamiesčio–Vilkpėdės', 1, { LP: 1.5, TS: 1.25, LS: 1.2, NA: 0.6, LLRA: 0.5 }, 2, 'Naujamiestis–Vilkpėdė', '', ['Žygimantas Pavilionis', 'TS']],
      ['Antakalnio', 1, { TS: 1.35, LS: 1.1, LP: 1.2, LLRA: 0.5 }, 3, 'Antakalnis', '', ['Ingrida Šimonytė', 'TS']],
      ['Žirmūnų', 1, { TS: 1.15, LSDP: 1.05, LLRA: 0.8 }, 4, 'Žirmūnai', '', ['Paulė Kuzmickienė', 'TS']],
      ['Fabijoniškių', 1, { LSDP: 1.15, LLRA: 1.1, NA: 1.1 }, 5, 'Fabijoniškės', '', ['Remigijus Motuzas', 'LSDP']],
      ['Šeškinės–Šnipiškių', 1, { TS: 1.05, LLRA: 1.2, LSDP: 1.05 }, 6, 'Šeškinė–Šnipiškės', '', ['Mindaugas Lingė', 'TS']],
      ['Justiniškių–Viršuliškių', 1, { DSVL: 1.25, LSDP: 1.1, NA: 1.1 }, 7, 'Justiniškės–Viršuliškės', '', ['Linas Kukuraitis', 'DSVL']],
      ['Pilaitės–Karoliniškių', 1, { TS: 1.1, LS: 1.1, LP: 1.1, KITI: 1.3, LLRA: 0.7 }, 8, 'Pilaitė–Karoliniškės', '', ['Vytautas Sinica', 'KITI']],
      ['Lazdynų', 1, { TS: 1.15, LSDP: 1.05 }, 9, 'Lazdynai', '', ['Laurynas Kasčiūnas', 'TS']],
      ['Naujosios Vilnios', 1, { LLRA: 2.6, LSDP: 1.15, NA: 1.2, LP: 0.6, TS: 0.8 }, 10, 'Naujoji Vilnia', '', ['Liutauras Kazlavickas', 'TS']],
      ['Pietinė', 1, { LLRA: 2.3, LSDP: 1.1, LP: 0.7, TS: 0.85 }, 11, 'South Vilnius', '', ['Česlav Olševski', 'LLRA']],
      ['Verkių', 1, { TS: 1.2, LS: 1.1, LLRA: 1.1 }, 12, 'Verkiai', '', ['Dainius Kreivys', 'TS']],
      ['Pašilaičių', 1, { LS: 1.2, TS: 1.1, LP: 1.1 }, 13, 'Pašilaičiai', '', ['Eugenijus Gentvilas', 'LS']],
      ['Naujininkų–Rasų', 1, { LIT: 2.2, LLRA: 1.8, LSDP: 1.05 }, 14, 'Naujininkai–Rasos', '', ['Artūras Zuokas', 'LIT']],
      ['Riešės', 0.4, { LLRA: 1.6, TS: 1.2 }, 55, 'Riešė', 'Vilniaus r.', ['Daiva Ulbinaitė', 'TS']],
    ],
  },
  {
    id: 'VLC', short: bi('Vilnius area', 'Vilniaus apskr.'), long: bi('Vilnius County', 'Vilniaus apskritis'), seats: 7, pop: 260, urban: 0.32, turnout: 0.5,
    ideal: { econ: -20, social: 55, defense: 40, green: 0 }, sal: { econ: 1.1, social: 1.0, defense: 0.8, green: 0.6 }, issues: ['minority', 'roads', 'def'],
    base: { LSDP: 18, TS: 11, NA: 12, DSVL: 10, LS: 4, LVZS: 7, LP: 1.5, LLRA: 23, KITI: 13.5 }, count: 0,
    cons: [
      ['Šalčininkų–Vilniaus', 0.1, { LLRA: 3.0, TS: 0.5, LS: 0.4, LP: 0.3 }, 56, 'Šalčininkai–Vilnius', 'Šalčininkai–Vilniaus r.', ['Jaroslav Narkevič', 'LLRA']],
      ['Nemenčinės', 0.3, { LLRA: 2.6, TS: 0.6, LP: 0.4 }, 57, 'Nemenčinė', 'Vilniaus r.–Švenčionys', ['Rita Tamašunienė', 'LLRA']],
      ['Trakų–Vievio', 0.4, { LLRA: 1.0, LSDP: 1.15 }, 58, 'Trakai–Vievis', 'Trakai–Vievis', ['Kęstutis Vilkauskas', 'LSDP']],
      ['Kaišiadorių–Elektrėnų', 0.4, { LSDP: 1.15 }, 59, 'Kaišiadorys–Elektrėnai', 'Kaišiadorys–Elektrėnai', ['Algimantas Radvila', 'LSDP']],
      ['Pietų Deltuvos', 0.3, { LSDP: 1.15, NA: 1.15, LLRA: 0.1 }, 61, 'South Deltuva (Ukmergė–Širvintos)', 'Ukmergė–Širvintos', ['Indrė Kižienė', 'LSDP']],
      ['Pietų Nalšios', 0.2, { LLRA: 1.0, LSDP: 1.15 }, 53, 'South Nalšia (Molėtai–Švenčionys)', 'Molėtai–Švenčionys', ['Šarūnas Birutis', 'LSDP']],
      ['Šiaurės Nalšios', 0.5, { LLRA: 1.6, LS: 1.2, LSDP: 1.05 }, 52, 'North Nalšia (Ignalina–Visaginas)', 'Ignalina–Visaginas', ['Jevgenij Šuklin', 'LS']],
    ],
  },
  {
    id: 'KNS', short: bi('Kaunas', 'Kaunas'), long: bi('Kaunas City', 'Kauno miestas'), seats: 8, pop: 305, urban: 0.98, turnout: 0.57,
    ideal: { econ: 20, social: -10, defense: 75, green: 40 }, sal: SAL_URBAN, issues: ['jobs', 'housing', 'def'],
    base: { LSDP: 16, TS: 27, NA: 11, DSVL: 8, LS: 11, LVZS: 4, LP: 7, LLRA: 0.3, KITI: 15.7 }, count: 0.22,
    cons: [
      ['Kalniečių', 1, { TS: 1.15, LSDP: 1.05 }, 15, 'Kalniečiai', '', ['Arvydas Anušauskas', 'TS']],
      ['Savanorių', 1, { LSDP: 1.15 }, 16, 'Savanoriai', '', ['Orinta Leiputė', 'LSDP']],
      ['Petrašiūnų–Gričiupio', 1, { LSDP: 1.15, NA: 1.15 }, 17, 'Petrašiūnai–Gričiupis', '', ['Darius Razmislevičius', 'LSDP']],
      ['Panemunės', 1, { LSDP: 1.05, TS: 1.1, LS: 1.1 }, 18, 'Panemunė', '', ['Audrius Radvilavičius', 'LSDP']],
      ['Aleksoto–Vilijampolės', 1, { LSDP: 1.1 }, 19, 'Aleksotas–Vilijampolė', '', ['Robertas Kaunas', 'LSDP']],
      ['Centro–Žaliakalnio', 1, { TS: 1.2, LP: 1.35, LS: 1.3, NA: 0.75 }, 20, 'Centras–Žaliakalnis', '', ['Simonas Kairys', 'LS']],
      ['Šilainių', 1, { LSDP: 1.1, NA: 1.1 }, 21, 'Šilainiai', '', ['Laurynas Šedvydis', 'LSDP']],
      ['Raudondvario', 0.4, { LSDP: 1.1 }, 65, 'Raudondvaris', 'Kauno r.', ['Raminta Popovienė', 'LSDP']],
    ],
  },
  {
    id: 'KNC', short: bi('Kaunas area', 'Kauno apskr.'), long: bi('Kaunas County', 'Kauno apskritis'), seats: 7, pop: 275, urban: 0.38, turnout: 0.51,
    ideal: { econ: -15, social: 30, defense: 55, green: 15 }, sal: SAL_RURAL, issues: ['col', 'roads', 'health'],
    base: { LSDP: 23, TS: 17, NA: 16, DSVL: 12, LS: 6, LVZS: 9, LP: 2, LLRA: 0.3, KITI: 14.7 }, count: 0,
    cons: [
      ['Raseinių–Josvainių', 0.1, { LSDP: 1.15 }, 42, 'Raseiniai–Josvainiai', 'Raseiniai–Kėdainių r.', ['Matas Skamarakas', 'LSDP']],
      ['Kėdainių', 0.4, { KITI: 1.6 }, 43, 'Kėdainiai', 'Kėdainiai', ['Viktoras Fiodorovas', 'KITI']],
      ['Jonavos', 0.5, { LSDP: 1.25 }, 60, 'Jonava', 'Jonava', ['Eugenijus Sabutis', 'LSDP']],
      ['Karšuvos', 0.1, { LS: 1.3 }, 62, 'Karšuva (Pagėgiai–Jurbarkas)', 'Pagėgiai–Jurbarkas', ['Ričardas Juška', 'LS']],
      ['Šiaurės Sūduvos', 0.1, { LSDP: 1.1 }, 64, 'North Sūduva (Šakiai–Kazlų Rūda)', 'Šakiai–Kazlų Rūda', ['Darius Jakavičius', 'LSDP']],
      ['Garliavos', 0.3, { LSDP: 1.1 }, 66, 'Garliava', 'Kauno r.', ['Šarūnas Šukevičius', 'LSDP']],
      ['Dainavos', 0.2, { LSDP: 1.1 }, 67, 'Dainava (Prienai–Birštonas)', 'Prienai–Birštonas', ['Jūratė Zailskienė', 'LSDP']],
    ],
  },
  {
    id: 'KLP', short: bi('Klaipėda', 'Klaipėda'), long: bi('Klaipėda & Coast', 'Klaipėda ir pajūris'), seats: 8, pop: 330, urban: 0.7, turnout: 0.5,
    ideal: { econ: 15, social: 5, defense: 60, green: 20 }, sal: SAL_URBAN, issues: ['port', 'col', 'energy'],
    base: { LSDP: 19, TS: 15, NA: 18, DSVL: 9, LS: 11, LVZS: 6, LP: 3, LLRA: 0.3, KITI: 18.7 }, count: 0.12,
    cons: [
      ['Pajūrio', 1, { NA: 1.2 }, 22, 'Pajūris (Curonian Spit–West Klaipėda)', 'Neringa–vakarų Klaipėda', ['Daiva Petkevičienė', 'NA']],
      ['Danės', 1, { TS: 1.15 }, 23, 'Danė (North Klaipėda)', 'šiaurės Klaipėda', ['Audrius Petrošius', 'TS']],
      ['Baltijos', 1, { LSDP: 1.1 }, 24, 'Baltija (Central Klaipėda)', 'centrinė Klaipėda', ['Vytautas Grubliauskas', 'LSDP']],
      ['Marių', 1, { LVZS: 1.25 }, 25, 'Marios (South Klaipėda)', 'pietų Klaipėda', ['Ligita Girskienė', 'LVZS']],
      ['Gargždų', 0.3, { LSDP: 1.1 }, 31, 'Gargždai', 'Gargždai', ['Alvydas Mockus', 'LSDP']],
      ['Šilutės', 0.2, { NA: 1.2 }, 32, 'Šilutė', 'Šilutė', ['Daiva Žebelienė', 'NA']],
      ['Mėguvos', 0.7, { NA: 1.15, LS: 1.1 }, 36, 'Mėguva (Palanga)', 'Palanga', ['Karolis Neimantas', 'NA']],
      ['Kuršo', 0.2, { LSDP: 1.1, NA: 1.1 }, 37, 'Kuršas (Kretinga–Skuodas)', 'Kretinga–Skuodas', ['Violeta Turauskaitė', 'LSDP']],
    ],
  },
  {
    id: 'TEL', short: bi('Telšiai', 'Telšiai'), long: bi('Telšiai · Samogitia', 'Telšiai · Žemaitija'), seats: 3, pop: 125, urban: 0.45, turnout: 0.45,
    ideal: { econ: -20, social: 55, defense: 30, green: -35 }, sal: SAL_RURAL, issues: ['col', 'tax', 'trust'],
    base: { LSDP: 19, TS: 11, NA: 28, DSVL: 9, LS: 5, LVZS: 9, LP: 1.5, LLRA: 0.2, KITI: 17.3 }, count: 0,
    cons: [
      ['Plungės–Rietavo', 0.3, { NA: 1.25 }, 35, 'Plungė–Rietavas', 'Plungė–Rietavas', ['Tomas Domarkas', 'NA']],
      ['Mažeikių', 0.5, { LSDP: 1.1 }, 38, 'Mažeikiai', 'Mažeikiai', ['Ingrida Braziulienė', 'LSDP']],
      ['Telšių', 0.4, { DSVL: 1.25 }, 40, 'Telšiai', 'Telšiai', ['Agnė Jakavičiūtė-Miliauskienė', 'DSVL']],
    ],
  },
  {
    id: 'TAU', short: bi('Tauragė', 'Tauragė'), long: bi('Tauragė', 'Tauragės apskritis'), seats: 2, pop: 90, urban: 0.38, turnout: 0.44,
    ideal: { econ: -30, social: 45, defense: 35, green: -15 }, sal: SAL_RURAL, issues: ['emig', 'roads', 'col'],
    base: { LSDP: 20, TS: 12, NA: 23, DSVL: 9, LS: 5, LVZS: 10, LP: 1.5, LLRA: 0.2, KITI: 19.3 }, count: 0,
    cons: [
      ['Tauragės', 0.4, { NA: 1.2 }, 34, 'Tauragė', 'Tauragė', ['Tadas Sadauskis', 'NA']],
      ['Kelmės–Šilalės', 0, { NA: 1.4 }, 41, 'Kelmė–Šilalė', 'Kelmė–Šilalė', ['Remigijus Žemaitaitis', 'NA']],
    ],
  },
  {
    id: 'SIA', short: bi('Šiauliai', 'Šiauliai'), long: bi('Šiauliai', 'Šiaulių apskritis'), seats: 6, pop: 260, urban: 0.55, turnout: 0.47,
    ideal: { econ: -30, social: 35, defense: 50, green: -5 }, sal: SAL_RURAL, issues: ['col', 'emig', 'health'],
    base: { LSDP: 24, TS: 13, NA: 19, DSVL: 10, LS: 6, LVZS: 9, LP: 1.8, LLRA: 0.2, KITI: 17 }, count: 0,
    cons: [
      ['Saulės', 1, { DSVL: 1.25 }, 26, 'Saulė (South Šiauliai)', 'pietų Šiauliai', ['Domas Griškevičius', 'DSVL']],
      ['Aušros', 1, { LSDP: 1.1 }, 27, 'Aušra (North Šiauliai)', 'šiaurės Šiauliai', ['Roma Janušonienė', 'LSDP']],
      ['Šiaurės Žemaitijos', 0.3, { LSDP: 1.2 }, 39, 'North Samogitia (Naujoji Akmenė)', 'Naujoji Akmenė', ['Tomas Martinaitis', 'LSDP']],
      ['Radviliškio–Tytuvėnų', 0.3, { LSDP: 1.1 }, 44, 'Radviliškis–Tytuvėnai', 'Radviliškis–Tytuvėnai', ['Saulius Luščikas', 'LSDP']],
      ['Šiaulių kaimiškoji', 0.1, { LVZS: 1.3 }, 45, 'Šiauliai District', 'Šiaulių r.', ['Eimantas Kirkutis', 'LVZS']],
      ['Vakarų Žiemgalos', 0.1, { LSDP: 1.15 }, 46, 'West Žiemgala (Joniškis)', 'Joniškis', ['Vaida Aleknavičienė', 'LSDP']],
    ],
  },
  {
    id: 'PAN', short: bi('Panevėžys', 'Panevėžys'), long: bi('Panevėžys', 'Panevėžio apskritis'), seats: 5, pop: 215, urban: 0.52, turnout: 0.48,
    ideal: { econ: -25, social: 35, defense: 50, green: 0 }, sal: SAL_RURAL, issues: ['jobs', 'col', 'roads'],
    base: { LSDP: 23, TS: 14, NA: 17, DSVL: 12, LS: 6, LVZS: 10, LP: 1.8, LLRA: 0.2, KITI: 16 }, count: 0,
    cons: [
      ['Nevėžio', 1, { LSDP: 1.1 }, 28, 'Nevėžis (North Panevėžys)', 'šiaurės Panevėžys', ['Ramūnas Vyžintas', 'LSDP']],
      ['Panevėžio vakarinė', 1, { LSDP: 1.1 }, 29, 'West Panevėžys', 'vakarų Panevėžys', ['Andrius Busila', 'LSDP']],
      ['Aukštaitijos', 0.1, { LSDP: 1.1 }, 33, 'Aukštaitija (Panevėžys District)', 'Panevėžio r.', ['Modesta Petrauskaitė', 'LSDP']],
      ['Rytų Žiemgalos', 0.1, { LSDP: 1.1 }, 47, 'East Žiemgala (Pakruojis–Pasvalys)', 'Pakruojis–Pasvalys', ['Ilona Gelažnikienė', 'LSDP']],
      ['Vakarų Sėlos', 0.2, { LSDP: 1.1, LVZS: 1.1 }, 48, 'West Sėla (Biržai–Kupiškis)', 'Biržai–Kupiškis', ['Lilija Vaitiekūnienė', 'LSDP']],
    ],
  },
  {
    id: 'UTE', short: bi('Utena', 'Utena'), long: bi('Utena', 'Utenos apskritis'), seats: 3, pop: 125, urban: 0.5, turnout: 0.48,
    ideal: { econ: -30, social: 35, defense: 55, green: 10 }, sal: SAL_RURAL, issues: ['health', 'emig', 'energy'],
    base: { LSDP: 24, TS: 12, NA: 15, DSVL: 14, LS: 5, LVZS: 11, LP: 1.5, LLRA: 1.5, KITI: 16 }, count: 0,
    cons: [
      ['Utenos', 0.5, { KITI: 1.5 }, 51, 'Utena', 'Utena', ['Vitalijus Šeršniovas', 'KITI']],
      ['Šiaurės Deltuvos', 0.2, { LSDP: 1.1 }, 49, 'North Deltuva (Anykščiai)', 'Anykščiai', ['Arūnas Dudėnas', 'LSDP']],
      ['Rytų Sėlos', 0.3, { LSDP: 1.15 }, 50, 'East Sėla (Rokiškis–Zarasai)', 'Rokiškis–Zarasai', ['Tadas Barauskas', 'LSDP']],
    ],
  },
  {
    id: 'ALY', short: bi('Alytus', 'Alytus'), long: bi('Alytus · Dzūkija', 'Alytus · Dzūkija'), seats: 3, pop: 135, urban: 0.5, turnout: 0.47,
    ideal: { econ: -35, social: 30, defense: 50, green: 5 }, sal: SAL_RURAL, issues: ['pensions', 'health', 'def'],
    base: { LSDP: 28, TS: 13, NA: 14, DSVL: 11, LS: 5, LVZS: 9, LP: 1.5, LLRA: 0.5, KITI: 18 }, count: 0,
    cons: [
      ['Alytaus', 0.8, { LSDP: 1.1 }, 30, 'Alytus', 'Alytus', ['Jurgita Šukevičienė', 'LSDP']],
      ['Dzūkijos', 0.1, { LSDP: 1.1 }, 69, 'Dzūkija (Varėna)', 'Varėna', ['Martynas Katelynas', 'LSDP']],
      ['Jotvingių', 0.3, { DSVL: 1.2 }, 70, 'Jotvingiai (Lazdijai–Druskininkai)', 'Lazdijai–Druskininkai', ['Linas Urmanavičius', 'DSVL']],
    ],
  },
  {
    id: 'MAR', short: bi('Marijampolė', 'Marijampolė'), long: bi('Marijampolė · Suvalkija', 'Marijampolė · Suvalkija'), seats: 3, pop: 135, urban: 0.42, turnout: 0.46,
    ideal: { econ: -25, social: 45, defense: 40, green: -10 }, sal: SAL_RURAL, issues: ['agri', 'roads', 'emig'],
    base: { LSDP: 21, TS: 13, NA: 16, DSVL: 10, LS: 5, LVZS: 15, LP: 1.5, LLRA: 0.2, KITI: 18.3 }, count: 0,
    cons: [
      ['Marijampolės', 0.6, { LSDP: 1.1 }, 54, 'Marijampolė', 'Marijampolė', ['Karolis Podolskis', 'LSDP']],
      ['Pietų Sūduvos', 0.1, { DSVL: 1.2, LZP: 1.1 }, 63, 'South Sūduva (Kalvarija–Simnas)', 'Kalvarija–Simnas', ['Kęstutis Mažeika', 'DSVL']],
      ['Vilkaviškio', 0.2, { DSVL: 1.15, LZP: 1.2 }, 68, 'Vilkaviškis', 'Vilkaviškis', ['Algirdas Butkevičius', 'DSVL']],
    ],
  },
  {
    id: 'ABR', short: bi('Abroad', 'Užsienis'), long: bi('Lithuanians abroad', 'Užsienio lietuviai'), seats: 1, pop: 62, voters: 62, urban: 0.9, turnout: 0.6,
    ideal: { econ: 35, social: -30, defense: 90, green: 45 }, sal: SAL_URBAN, issues: ['diaspora', 'def', 'tax'],
    base: { LSDP: 9, TS: 35, NA: 7, DSVL: 6, LS: 17, LVZS: 2, LP: 13, LLRA: 0.5, KITI: 10.5 }, count: 0.45,
    cons: [
      ['Pasaulio lietuvių', 1, {}, 71, 'Worldwide', '', ['Dalia Asanavičiūtė', 'TS']],
    ],
  },
];
REGIONS.forEach((r) => {
  if (!r.voters) r.voters = Math.round(r.pop * 0.82);
  const mb = MINOR_BASE[r.id];
  Object.assign(r.base, mb);
  r.base.KITI = Math.max(3, r.base.KITI - sum(Object.values(mb)));
  ALL_IDS.forEach((p) => { r.base[p] *= BASE_SHIFT[p]; });
});
const REG = Object.fromEntries(REGIONS.map((r) => [r.id, r]));
const rs = (r) => L((typeof r === 'string' ? REG[r] : r).short);
const rl = (r) => L((typeof r === 'string' ? REG[r] : r).long);
const consName = (name) => tt(`${name} district`, `${name} apygarda`);
const TOTAL_VOTERS = sum(REGIONS.map((r) => r.voters));
const AXIS_MEAN = Object.fromEntries(AXIS_IDS.map((a) => [a, sum(REGIONS.map((r) => r.ideal[a] * r.voters)) / TOTAL_VOTERS]));
const URB_SENS = { LSDP: -0.15, TS: 0.5, NA: -0.5, DSVL: -0.1, LS: 0.6, LVZS: -0.7, LP: 1.0, LLRA: 0, KITI: -0.1, DP: -0.3, LIT: 0.3, KS: -0.2, LZP: 0.6 };
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
  { id: 'presser', group: 'nat', icon: Mic, ap: 1, cost: 5, label: bi('Press conference', 'Spaudos konferencija'), desc: bi('Take two reporters’ questions live. Adds buzz, less each time.', 'Atsakykite į žurnalistų klausimus. Didina pagreitį, kaskart mažiau.') },
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
  DP: ['soc', 'eco', 'agr'], LIT: ['eco', 'tra', 'jus'], KS: ['soc', 'edu', 'cul'], LZP: ['env', 'ene', 'tra'],
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
  DP: { text: bi('A higher minimum wage and a regional jobs programme', 'Didesnė MMA ir regionų darbo vietų programa'), axis: ['econ', -1] },
  LIT: { text: bi('More powers for mayors and lower business taxes', 'Daugiau galių merams ir mažesni verslo mokesčiai'), axis: ['econ', 1] },
  KS: { text: bi('Constitutional protection of the traditional family', 'Tradicinės šeimos apsauga Konstitucijoje'), axis: ['social', 1] },
  LZP: { text: bi('A climate law for net zero by 2040', 'Klimato įstatymas: neutralumas iki 2040 m.'), axis: ['green', 1] },
  KITI: { text: bi('Local projects in their districts', 'Vietiniai projektai jų apygardose'), axis: null },
};
const AFFINITY = {
  'NA|TS': -35, 'LS|NA': -40, 'LP|NA': -50, 'DSVL|NA': -10, 'LSDP|NA': 10, 'LVZS|NA': 10, 'LLRA|LP': -35, 'LP|LVZS': -30,
  'LS|LVZS': -15, 'LVZS|TS': -10, 'LLRA|LS': -15, 'LSDP|LVZS': 10, 'LS|TS': 10, 'LP|TS': 5, 'DSVL|LSDP': 5, 'LLRA|TS': 5, 'LLRA|LSDP': 5,
  'DP|LSDP': 8, 'DP|NA': 5, 'KS|TS': 10, 'KS|LP': -40, 'KS|LS': -20, 'KS|LZP': -25, 'LP|LZP': 12, 'LZP|NA': -30, 'LIT|TS': 5, 'LIT|LS': 5,
  'DSVL|LZP': 10, 'KS|LVZS': 10, 'KS|LLRA': 5,
};

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
    id: 'drones', cat: bi('Security', 'Saugumas'), icon: ShieldAlert, scene: 'klaipeda',
    title: bi('Unidentified drones circle the Klaipėda LNG terminal', 'Virš Klaipėdos SGD terminalo sukasi neatpažinti dronai'),
    body: bi('For two nights running, drones hover over the gas terminal and the port. The navy says it lacks the equipment to bring them down.', 'Dvi naktis iš eilės dronai sklando virš dujų terminalo ir uosto. Karinės jūrų pajėgos sako neturinčios įrangos jiems numušti.'),
    choices: [
      { label: bi('Promise a €100M anti-drone shield', 'Pažadėti 100 mln. eurų priešdroninį skydą'), tag: 'security', fx: { reg: [['KLP', 1.6], ['border', 0.6]], axis: ['defense', 1, 0.7], groups: { business: 2 } } },
      { label: bi('Ask NATO allies for help and keep calm', 'Kreiptis į NATO sąjungininkus ir nekelti panikos'), tag: 'moderate', fx: { pc: 1, mom: 0.3, reg: [['urban', 0.4]] } },
      { label: bi('Blame the government for leaving the port open', 'Kaltinti Vyriausybę, kad paliko uostą neapsaugotą'), tag: 'populist', fx: { mom: 1, reg: [['KLP', 0.8]], pc: -1 } },
    ],
  },
  {
    id: 'housing', cat: bi('Housing', 'Būstas'), icon: Home, scene: 'vilnius',
    title: bi('Vilnius rents jump 20% in a year', 'Nuoma Vilniuje per metus pabrango 20 %'),
    body: bi('A one-bedroom flat in Žvėrynas now costs more than an average monthly salary. Young families say they are being priced out of the capital.', 'Vieno kambario butas Žvėryne jau kainuoja daugiau nei vidutinis mėnesio atlyginimas. Jaunos šeimos sako, kad sostinė joms tampa neįperkama.'),
    choices: [
      { label: bi('Cap rent rises at inflation', 'Apriboti nuomos kainų augimą infliacijos dydžiu'), tag: 'welfare', fx: { reg: [['VNO', 1.3], ['KNS', 0.6]], axis: ['econ', -1, 0.6], groups: { youth: 4, business: -5 } } },
      { label: bi('Build 10,000 municipal rental flats', 'Pastatyti 10 000 savivaldybės nuomojamų butų'), tag: 'moderate', fx: { money: -30, reg: [['urban', 0.9]], groups: { youth: 3, public: 2 } } },
      { label: bi('Cut red tape so developers build faster', 'Mažinti biurokratiją, kad statytojai statytų greičiau'), tag: 'business', fx: { reg: [['VNO', 0.8]], axis: ['econ', 1, 0.5], groups: { business: 5 }, money: 40 } },
    ],
  },
  {
    id: 'forest', cat: bi('Environment', 'Aplinka'), icon: Leaf, scene: 'lakes',
    title: bi('Plan to log old-growth forest in Labanoras sparks protests', 'Planas kirsti senąjį Labanoro mišką sukėlė protestus'),
    body: bi('State forest managers want to clear 2,000 hectares for biomass. Activists chain themselves to pine trees; local sawmills want the jobs.', 'Valstybinių miškų urėdija nori iškirsti 2 000 hektarų biokurui. Aktyvistai prisirakina prie pušų, o vietos lentpjūvės nori darbo vietų.'),
    choices: [
      { label: bi('Protect the forest: no logging in parks', 'Apsaugoti mišką – jokių kirtimų parkuose'), tag: 'green', fx: { reg: [['urban', 1], ['UTE', -0.5]], axis: ['green', 1, 0.6], groups: { youth: 4, farmers: -2 } } },
      { label: bi('Allow logging, keep the jobs', 'Leisti kirsti ir išsaugoti darbo vietas'), tag: 'agri', fx: { reg: [['rural', 0.9], ['urban', -0.6]], axis: ['green', -1, 0.5], groups: { farmers: 3, youth: -4 } } },
      { label: bi('Order an independent study first', 'Pirmiausia užsakyti nepriklausomą tyrimą'), tag: 'moderate', fx: { pc: 1, und: 0.3 } },
    ],
  },
  {
    id: 'pilgrims', cat: bi('Culture', 'Kultūra'), icon: Church, scene: 'crosses',
    title: bi('50,000 pilgrims expected at the Hill of Crosses', 'Prie Kryžių kalno laukiama 50 000 piligrimų'),
    body: bi('A national pilgrimage day near Šiauliai draws crowds from every parish. Party leaders are being asked whether they will attend.', 'Nacionalinė piligrimystės diena prie Šiaulių sutraukia tikinčiuosius iš visų parapijų. Partijų lyderių klausiama, ar jie dalyvaus.'),
    choices: [
      { label: bi('Walk with the pilgrims', 'Eiti kartu su piligrimais'), tag: 'traditional', fx: { reg: [['SIA', 1.4], ['rural', 0.6], ['VNO', -0.3]], axis: ['social', 1, 0.5], groups: { seniors: 4, youth: -2 } } },
      { label: bi('Fund the site’s restoration, skip the photo-op', 'Skirti lėšų vietovės tvarkymui, bet nesifotografuoti'), tag: 'moderate', fx: { money: -25, pc: 1, reg: [['SIA', 0.6]] } },
      { label: bi('Spend the day at a tech fair in Vilnius instead', 'Tą dieną praleisti technologijų mugėje Vilniuje'), tag: 'progressive', fx: { reg: [['VNO', 0.8], ['SIA', -0.8]], groups: { youth: 3, seniors: -3 } } },
    ],
  },
  {
    id: 'banks', cat: bi('Economy', 'Ekonomika'), icon: Landmark, scene: 'vilnius',
    title: bi('Banks post record profits of €1.4 billion', 'Bankų pelnas pasiekė rekordinius 1,4 mlrd. eurų'),
    body: bi('High interest rates helped the big Scandinavian banks earn more in Lithuania than ever. Calls grow for a solidarity tax.', 'Dėl aukštų palūkanų didieji Skandinavijos bankai Lietuvoje uždirbo daugiau nei bet kada. Vis garsiau kalbama apie solidarumo mokestį.'),
    choices: [
      { label: bi('A windfall tax to fund defence and pensions', 'Solidarumo mokestis gynybai ir pensijoms'), tag: 'welfare', fx: { reg: [['all', 0.7]], axis: ['econ', -1, 0.6], groups: { seniors: 3, business: -4 } } },
      { label: bi('Hands off: taxes scare off investors', 'Neliesti – mokesčiai baido investuotojus'), tag: 'business', fx: { money: 60, axis: ['econ', 1, 0.5], groups: { business: 5 }, mom: -0.3 } },
      { label: bi('Negotiate a voluntary contribution', 'Derėtis dėl savanoriško įnašo'), tag: 'moderate', fx: { pc: 2, mom: 0.2 } },
    ],
  },
  {
    id: 'flood', cat: bi('Disaster', 'Nelaimė'), icon: CloudRain, scene: 'fields',
    title: bi('Spring floods cut off villages near Rusnė', 'Pavasario potvynis atkirto kaimus prie Rusnės'),
    body: bi('The Nemunas delta is under water. Hundreds of homes are flooded and farmers have lost their first crop of the year.', 'Nemuno delta apsemta. Užlieta šimtai namų, ūkininkai neteko pirmojo metų derliaus.'),
    choices: [
      { label: bi('Go there in waders and promise compensation', 'Nuvykti su bridkelnėmis ir pažadėti kompensacijas'), tag: 'welfare', fx: { money: -20, reg: [['KLP', 1.2], ['TAU', 1], ['rural', 0.4]], groups: { farmers: 4 }, mom: 0.5 } },
      { label: bi('Present a climate adaptation plan', 'Pristatyti klimato kaitos prisitaikymo planą'), tag: 'green', fx: { reg: [['urban', 0.8]], axis: ['green', 1, 0.5], pc: 1 } },
      { label: bi('Attack the slow emergency response', 'Kritikuoti lėtą gelbėjimo tarnybų darbą'), tag: 'populist', fx: { mom: 1, reg: [['KLP', 0.6]], pc: -1 } },
    ],
  },
  {
    id: 'callcentre', cat: bi('Jobs', 'Darbo vietos'), icon: Factory, scene: 'town',
    title: bi('Šiauliai call centre replaces 600 workers with AI', 'Šiaulių skambučių centras 600 darbuotojų pakeičia dirbtiniu intelektu'),
    body: bi('A foreign-owned company says chatbots will now answer customers in 12 languages. It is the city’s biggest layoff in a decade.', 'Užsienio kapitalo įmonė skelbia, kad klientams 12 kalbų dabar atsakys pokalbių robotai. Tai didžiausias atleidimas mieste per dešimtmetį.'),
    choices: [
      { label: bi('A retraining fund for every laid-off worker', 'Perkvalifikavimo fondas kiekvienam atleistajam'), tag: 'welfare', fx: { money: -20, reg: [['SIA', 1.4], ['rural', 0.4]], groups: { public: 2 }, axis: ['econ', -1, 0.3] } },
      { label: bi('Make Lithuania Europe’s AI hub', 'Paversti Lietuvą Europos dirbtinio intelekto centru'), tag: 'business', fx: { reg: [['VNO', 0.9], ['KNS', 0.5], ['SIA', -0.6]], groups: { business: 4, youth: 2 } } },
      { label: bi('Propose a “robot tax”', 'Pasiūlyti „robotų mokestį“'), tag: 'populist', fx: { mom: 0.9, reg: [['SIA', 0.8]], axis: ['econ', -1, 0.4], groups: { business: -4 } } },
    ],
  },
  {
    id: 'eurovision', cat: bi('Culture', 'Kultūra'), icon: Music, scene: 'vilnius',
    title: bi('Lithuania wins Eurovision! Who hosts next year?', 'Lietuva laimėjo „Euroviziją“! Kas rengs kitais metais?'),
    body: bi('The whole country is singing. Now Vilnius and Kaunas both want the contest, and it will cost around €30 million.', 'Dainuoja visa šalis. Dabar konkursą nori rengti ir Vilnius, ir Kaunas, o tai kainuos apie 30 mln. eurų.'),
    choices: [
      { label: bi('Back Vilnius, the capital', 'Palaikyti sostinę Vilnių'), tag: 'youth', fx: { reg: [['VNO', 1.3], ['KNS', -0.8]], groups: { youth: 3 } } },
      { label: bi('Back Kaunas and its Žalgiris Arena', 'Palaikyti Kauną ir „Žalgirio“ areną'), tag: 'youth', fx: { reg: [['KNS', 1.4], ['KNC', 0.5], ['VNO', -0.7]], groups: { youth: 2 } } },
      { label: bi('Spend the €30M on hospitals instead', 'Tuos 30 mln. eurų skirti ligoninėms'), tag: 'populist', fx: { reg: [['rural', 0.9], ['urban', -0.4]], groups: { seniors: 3, youth: -3 }, mom: 0.4 } },
    ],
  },
  {
    id: 'deepfake', cat: bi('Online', 'Internetas'), icon: Smartphone, scene: 'town',
    title: bi('A deepfake of your leader goes viral on TikTok', 'TikTok’e plinta jūsų lyderio klastotė'),
    body: bi('A fake video shows your leader “admitting” to taking bribes. It has 300,000 views and is spreading fast in Russian-language groups.', 'Suklastotame vaizdo įraše jūsų lyderis neva „prisipažįsta“ ėmęs kyšius. Jį jau peržiūrėjo 300 000 žmonių, jis sparčiai plinta rusakalbėse grupėse.'),
    choices: [
      { label: bi('Laugh it off with your own funny video', 'Atsakyti savo juokingu vaizdo įrašu'), tag: 'youth', risk: { chance: 0.6, ok: { mom: 1.8, groups: { youth: 4 } }, okText: bi('Your reply gets twice the views of the fake.', 'Jūsų atsakymas surenka dvigubai daugiau peržiūrų nei klastotė.'), fail: { mom: -1.2, scandal: 4 }, failText: bi('The joke falls flat and the fake keeps spreading.', 'Juokelis nepavyko, o klastotė plinta toliau.') } },
      { label: bi('Report it to the police and the VRK', 'Pranešti policijai ir VRK'), tag: 'moderate', fx: { pc: 1, scandal: -3, mom: -0.2 } },
      { label: bi('Demand a ban on political deepfakes', 'Reikalauti uždrausti politines klastotes'), tag: 'security', fx: { reg: [['urban', 0.6]], axis: ['defense', 1, 0.3], pc: 1 } },
    ],
  },
  {
    id: 'alcohol', cat: bi('Health', 'Sveikata'), icon: HeartPulse, scene: 'town',
    title: bi('Proposal: no alcohol sales at petrol stations, drinking age 21', 'Siūloma uždrausti prekybą alkoholiu degalinėse ir didinti amžių iki 21'),
    body: bi('Health experts say Lithuania still drinks more than almost any country in the EU. Shop owners warn of a black market.', 'Sveikatos ekspertai teigia, kad Lietuvoje vis dar geriama daugiau nei beveik bet kurioje ES šalyje. Prekybininkai perspėja dėl juodosios rinkos.'),
    choices: [
      { label: bi('Support it: health comes first', 'Palaikyti – sveikata svarbiausia'), tag: 'traditional', fx: { reg: [['rural', 0.7]], axis: ['social', 1, 0.5], groups: { seniors: 3, public: 2, youth: -4, business: -2 } } },
      { label: bi('Oppose it: adults can decide for themselves', 'Prieštarauti – suaugusieji gali spręsti patys'), tag: 'progressive', fx: { reg: [['urban', 0.9]], axis: ['social', -1, 0.4], groups: { youth: 4, business: 2 } } },
      { label: bi('Fund prevention programmes in schools instead', 'Vietoj to finansuoti prevencijos programas mokyklose'), tag: 'moderate', fx: { money: -15, pc: 1, groups: { public: 3 } } },
    ],
  },
  {
    id: 'nuclear', rid: 'UTE', cat: bi('Energy', 'Energetika'), icon: Zap, scene: 'lakes',
    title: bi('Plan for small nuclear reactors at Visaginas', 'Planas statyti mažuosius branduolinius reaktorius Visagine'),
    body: bi('An energy company proposes small modular reactors on the old Ignalina site. Locals want the jobs; environmentalists worry about the waste.', 'Energetikos bendrovė siūlo mažuosius modulinius reaktorius statyti buvusios Ignalinos AE teritorijoje. Vietiniai nori darbo vietų, aplinkosaugininkai nerimauja dėl atliekų.'),
    choices: [
      { label: bi('Back it: jobs and energy independence', 'Palaikyti: darbo vietos ir energetinė nepriklausomybė'), tag: 'security', fx: { reg: [['UTE', 1.5], ['urban', 0.3]], groups: { business: 3, youth: -1 } } },
      { label: bi('Wind and solar instead', 'Vietoj to – vėjas ir saulė'), tag: 'green', fx: { reg: [['UTE', -0.8], ['urban', 0.6]], axis: ['green', 1, 0.5], groups: { youth: 3 } } },
      { label: bi('Let Visaginas decide in a local referendum', 'Tegul sprendžia Visaginas vietos referendumu'), tag: 'moderate', fx: { reg: [['UTE', 0.8]], pc: 1, groups: { minority: 2 } } },
    ],
  },
  {
    id: 'layoffs', rid: 'TEL', cat: bi('Jobs', 'Darbo vietos'), icon: Factory, scene: 'town',
    title: bi('A large plant in Mažeikiai plans 300 layoffs', 'Didelė Mažeikių įmonė planuoja atleisti 300 žmonių'),
    body: bi('The biggest employer in the district says falling margins force cuts. Whole families in Žemaitija depend on these jobs.', 'Didžiausias rajono darbdavys teigia, kad dėl mažėjančių pajamų teks mažinti darbuotojų. Nuo šių darbo vietų Žemaitijoje priklauso ištisos šeimos.'),
    choices: [
      { label: bi('Demand that the state steps in', 'Reikalauti, kad įsikištų valstybė'), tag: 'populist', fx: { reg: [['TEL', 1.5]], axis: ['econ', -1, 0.4], groups: { business: -2 } } },
      { label: bi('A retraining and relocation package', 'Perkvalifikavimo ir persikėlimo paketas'), tag: 'moderate', fx: { money: -15, reg: [['TEL', 0.8]], pc: 1 } },
      { label: bi('Let the market adjust', 'Leisti rinkai prisitaikyti'), tag: 'business', fx: { reg: [['TEL', -1.2]], axis: ['econ', 1, 0.4], groups: { business: 3 } } },
    ],
  },
  {
    id: 'dronefactory', rid: 'PAN', cat: bi('Security', 'Saugumas'), icon: Factory, scene: 'town',
    title: bi('Panevėžys could get a drone factory with 800 jobs', 'Panevėžyje gali iškilti dronų gamykla su 800 darbo vietų'),
    body: bi('A defence company wants to build military drones in the free economic zone. Some neighbours fear the town would become a target.', 'Gynybos pramonės bendrovė nori laisvojoje ekonominėje zonoje gaminti karinius dronus. Dalis kaimynų baiminasi, kad miestas taps taikiniu.'),
    choices: [
      { label: bi('Champion it loudly', 'Garsiai palaikyti'), tag: 'security', fx: { reg: [['PAN', 1.5]], axis: ['defense', 1, 0.5], groups: { business: 2 } } },
      { label: bi('Yes, with local hiring guarantees', 'Taip, bet su vietos darbo vietų garantijomis'), tag: 'welfare', fx: { reg: [['PAN', 1]], groups: { public: 2 }, pc: 1 } },
      { label: bi('Keep weapons factories away from homes', 'Ginklų gamyklos – toliau nuo namų'), tag: 'populist', fx: { reg: [['PAN', -0.4], ['rural', 0.4]], axis: ['defense', -1, 0.4] } },
    ],
  },
  {
    id: 'airbase', rid: 'SIA', cat: bi('Security', 'Saugumas'), icon: Plane, scene: 'fields',
    title: bi('NATO wants to expand the Šiauliai air base', 'NATO nori plėsti Šiaulių oro bazę'),
    body: bi('More fighter jets would mean more noise for Zokniai residents, but also hundreds of millions in investment.', 'Daugiau naikintuvų reikštų daugiau triukšmo Zoknių gyventojams, bet ir šimtus milijonų investicijų.'),
    choices: [
      { label: bi('Full support, no conditions', 'Visiška parama be sąlygų'), tag: 'security', fx: { reg: [['SIA', 0.8], ['VNO', 0.6]], axis: ['defense', 1, 0.5] } },
      { label: bi('Support it, with noise compensation', 'Palaikyti, bet su kompensacijomis už triukšmą'), tag: 'moderate', fx: { money: -10, reg: [['SIA', 1.3]] } },
      { label: bi('Let residents vote first', 'Pirmiausia tegul balsuoja gyventojai'), tag: 'populist', fx: { reg: [['SIA', 0.5]], axis: ['defense', -1, 0.3], pc: -1 } },
    ],
  },
  {
    id: 'carmarket', rid: 'MAR', cat: bi('Economy', 'Ekonomika'), icon: Truck, scene: 'town',
    title: bi('New EU emissions rules hit the Marijampolė car market', 'Naujos ES taršos taisyklės smogė Marijampolės automobilių turgui'),
    body: bi('One of Europe’s biggest used-car markets fears a ban on exporting older diesels. Thousands of local jobs depend on it.', 'Vienas didžiausių Europoje naudotų automobilių turgų baiminasi senų dyzelinių automobilių eksporto draudimo. Nuo jo priklauso tūkstančiai vietos darbo vietų.'),
    choices: [
      { label: bi('Fight the rules in Brussels', 'Kovoti su taisyklėmis Briuselyje'), tag: 'populist', fx: { reg: [['MAR', 1.6]], axis: ['green', -1, 0.4], groups: { business: 2 } } },
      { label: bi('Help dealers switch to electric cars', 'Padėti prekeiviams pereiti prie elektromobilių'), tag: 'green', fx: { money: -10, reg: [['MAR', 0.4], ['urban', 0.5]], axis: ['green', 1, 0.3] } },
      { label: bi('Rules are rules', 'Taisyklės yra taisyklės'), tag: 'moderate', fx: { reg: [['MAR', -1.2]], cred: 2, pc: 1 } },
    ],
  },
  {
    id: 'spa', rid: 'ALY', cat: bi('Tourism', 'Turizmas'), icon: Sun, scene: 'lakes',
    title: bi('Druskininkai: tourists stay away from the border', 'Druskininkai: turistai vengia pasienio'),
    body: bi('Hotels in the spa town report bookings down 30% as visitors worry about the Belarus border.', 'Kurorto viešbučiai skelbia, kad užsakymų sumažėjo 30 %: lankytojai nerimauja dėl sienos su Baltarusija.'),
    choices: [
      { label: bi('Fund a “Visit Dzūkija” campaign', 'Finansuoti kampaniją „Atrask Dzūkiją“'), tag: 'moderate', fx: { money: -15, reg: [['ALY', 1.4]] } },
      { label: bi('More border guards to reassure visitors', 'Daugiau pasieniečių, kad lankytojai nurimtų'), tag: 'security', fx: { reg: [['ALY', 0.8]], axis: ['defense', 1, 0.3] } },
      { label: bi('Cut VAT for hotels and restaurants', 'Sumažinti PVM viešbučiams ir restoranams'), tag: 'business', fx: { reg: [['ALY', 1]], axis: ['econ', 1, 0.3], groups: { business: 3 } } },
    ],
  },
  {
    id: 'fu_farmers', followUp: true, cat: bi('Agriculture', 'Žemės ūkis'), icon: Tractor, scene: 'fields',
    title: bi('Farmers remind you of your promise', 'Ūkininkai primena jūsų pažadą'),
    body: bi('You stood with them on Gedimino prospektas. Now they bring a petition with 40,000 signatures and ask you to sign it live on TV: scrap the fertiliser limits.', 'Stovėjote su jais Gedimino prospekte. Dabar jie atneša peticiją su 40 000 parašų ir prašo ją pasirašyti tiesioginiame eteryje: atšaukti trąšų ribojimus.'),
    choices: [
      { label: bi('Sign it on camera', 'Pasirašyti prieš kameras'), tag: 'agri', fx: { reg: [['agri', 1.2]], axis: ['green', -1, 0.4], groups: { farmers: 5, youth: -2 }, cred: 3 } },
      { label: bi('Sign a softer version', 'Pasirašyti švelnesnę versiją'), tag: 'moderate', fx: { groups: { farmers: 1 }, cred: -2, pc: 1 } },
      { label: bi('Refuse: the EU rules stay', 'Atsisakyti: ES taisyklės lieka'), tag: 'green', fx: { reg: [['agri', -1.4]], axis: ['green', 1, 0.4], groups: { farmers: -8 }, cred: -6 } },
    ],
  },
  {
    id: 'fu_donor', followUp: true, scandal: true, cat: bi('Scandal', 'Skandalas'), icon: Mail, scene: 'seimas',
    title: bi('Journalists link your silence to a donor', 'Žurnalistai jūsų tylą sieja su rėmėju'),
    body: bi('A portal reveals that the IT firm in the procurement story gave your party €90,000 weeks before you chose to stay quiet.', 'Portalas atskleidžia, kad pirkimų istorijoje minima IT įmonė jūsų partijai paaukojo 90 000 eurų likus kelioms savaitėms iki jūsų tylos.'),
    choices: [
      { label: bi('Return the donation', 'Grąžinti auką'), tag: null, fx: { money: -90, scandal: -6, cred: -2, mom: -0.5 } },
      { label: bi('Call it a coincidence', 'Pavadinti tai sutapimu'), tag: null, risk: { chance: 0.4, ok: { mom: -0.3 }, okText: bi('The story fades by the weekend.', 'Iki savaitgalio istorija nuslūgo.'), fail: { mom: -2, scandal: 10, cred: -8 }, failText: bi('Then the emails leak.', 'Tada nutekėjo laiškai.') } },
      { label: bi('Fire your party treasurer', 'Atleisti partijos iždininką'), tag: null, fx: { mom: -1, scandal: -3, pc: -1 } },
    ],
  },
  {
    id: 'fu_landlords', followUp: true, rid: 'VNO', cat: bi('Housing', 'Būstas'), icon: Home, scene: 'vilnius',
    title: bi('Landlords’ billboards target your rent cap', 'Nuomotojų stendai taikosi į jūsų nuomos lubas'),
    body: bi('Billboards across Vilnius show your leader’s face next to the slogan “Rent caps = no flats”.', 'Visame Vilniuje – stendai su jūsų lyderio veidu ir šūkiu „Nuomos lubos = butų nebus“.'),
    choices: [
      { label: bi('Stand firm', 'Laikytis savo'), tag: 'welfare', fx: { reg: [['VNO', 0.6]], groups: { youth: 3, business: -3 }, cred: 3 } },
      { label: bi('Add tax breaks for long leases', 'Pridėti mokesčių lengvatų už ilgalaikę nuomą'), tag: 'moderate', fx: { money: -15, groups: { business: 2 }, pc: 1 } },
      { label: bi('Quietly drop the cap', 'Tyliai atsisakyti lubų'), tag: 'business', fx: { axis: ['econ', 1, 0.3], groups: { youth: -5 }, cred: -6 } },
    ],
  },
  {
    id: 'fu_teachers', followUp: true, rid: 'KNS', cat: bi('Education', 'Švietimas'), icon: GraduationCap, scene: 'kaunas',
    title: bi('The teachers’ union wants your promise in writing', 'Mokytojų profsąjunga nori jūsų pažado raštu'),
    body: bi('Before it endorses anyone, the union asks for a signed pledge: a 15% raise in your first budget.', 'Prieš ką nors paremdama, profsąjunga prašo pasirašyto pažado: 15 % didesni atlyginimai pirmajame jūsų biudžete.'),
    choices: [
      { label: bi('Sign it', 'Pasirašyti'), tag: 'welfare', fx: { reg: [['all', 0.4]], axis: ['econ', -1, 0.3], groups: { public: 6 }, cred: 2 } },
      { label: bi('Offer 10% instead', 'Pasiūlyti 10 %'), tag: 'moderate', fx: { groups: { public: 1 } } },
      { label: bi('Refuse to sign anything', 'Nieko nepasirašyti'), tag: null, fx: { groups: { public: -6, business: 2 }, cred: -5 } },
    ],
  },
  {
    id: 'fu_factcheck', followUp: true, cat: bi('Economy', 'Ekonomika'), icon: Search, scene: 'seimas',
    title: bi('Fact-check: your pension promise costs €900 million', 'Faktų patikra: jūsų pensijų pažadas kainuoja 900 mln. eurų'),
    body: bi('Fact-checkers say your pledge would need new taxes or more debt. Rivals are sharing the article everywhere.', 'Faktų tikrintojai teigia, kad jūsų pažadui reikėtų naujų mokesčių arba daugiau skolos. Varžovai straipsniu dalijasi visur.'),
    choices: [
      { label: bi('Publish a costed plan with a bank-profit tax', 'Paskelbti apskaičiuotą planą su bankų pelno mokesčiu'), tag: 'welfare', fx: { axis: ['econ', -1, 0.3], groups: { business: -2 }, cred: 4 } },
      { label: bi('Phase it in over four years', 'Įgyvendinti per ketverius metus'), tag: 'moderate', fx: { groups: { seniors: -2 }, cred: 2 } },
      { label: bi('Call the fact-check biased', 'Pavadinti patikrą šališka'), tag: 'populist', risk: { chance: 0.5, ok: { mom: 1 }, okText: bi('Your supporters rally behind you.', 'Jūsų rėmėjai susitelkia.'), fail: { cred: -10, mom: -1 }, failText: bi('Even friendly media call it a dodge.', 'Net palankūs žurnalistai tai vadina išsisukinėjimu.') } },
    ],
  },
  {
    id: 'fu_border_trade', followUp: true, rid: 'VLC', cat: bi('Economy', 'Ekonomika'), icon: Coins, scene: 'trakai',
    title: bi('Border traders: the closure is killing us', 'Pasienio prekeiviai: uždaryta siena mus žlugdo'),
    body: bi('Shops and petrol stations near Šalčininkai report sales down 40% since your call to close the border.', 'Parduotuvės ir degalinės prie Šalčininkų skelbia, kad nuo jūsų raginimo uždaryti sieną pardavimai krito 40 %.'),
    choices: [
      { label: bi('A support fund for border towns', 'Paramos fondas pasienio miesteliams'), tag: 'welfare', fx: { money: -20, reg: [['VLC', 1.2]], groups: { minority: 3 } } },
      { label: bi('Security comes first', 'Saugumas svarbiau'), tag: 'security', fx: { reg: [['VLC', -0.8], ['VNO', 0.4]], cred: 2 } },
      { label: bi('Reopen it for trade only', 'Atverti tik prekybai'), tag: 'moderate', fx: { reg: [['VLC', 0.8]], axis: ['defense', -1, 0.3] } },
    ],
  },
  {
    id: 'fu_forest', followUp: true, rid: 'UTE', cat: bi('Environment', 'Aplinka'), icon: Leaf, scene: 'lakes',
    title: bi('Climate activists follow your campaign bus', 'Klimato aktyvistai seka jūsų kampanijos autobusą'),
    body: bi('Since you backed the logging plan, activists turn up at every rally holding tree stumps.', 'Nuo tada, kai palaikėte kirtimus, aktyvistai į kiekvieną mitingą ateina nešini kelmais.'),
    choices: [
      { label: bi('Meet them and plant 10,000 trees', 'Susitikti ir pasodinti 10 000 medžių'), tag: 'green', fx: { money: -20, groups: { youth: 3 }, cred: -2 } },
      { label: bi('Ignore them', 'Ignoruoti'), tag: null, fx: { reg: [['urban', -0.6]], groups: { youth: -3 } } },
      { label: bi('Defend the jobs, loudly', 'Garsiai ginti darbo vietas'), tag: 'agri', fx: { reg: [['rural', 0.6]], groups: { farmers: 2, youth: -3 }, cred: 2 } },
    ],
  },
  {
    id: 'fu_banks', followUp: true, cat: bi('Economy', 'Ekonomika'), icon: Landmark, scene: 'vilnius',
    title: bi('Banks warn: your tax means dearer mortgages', 'Bankai perspėja: jūsų mokestis pabrangins paskolas'),
    body: bi('Two large banks say they would pass your windfall tax on to borrowers. Young families are worried.', 'Du dideli bankai sako, kad jūsų solidarumo mokestį perkels paskolų gavėjams. Jaunos šeimos nerimauja.'),
    choices: [
      { label: bi('Ban passing it on to customers', 'Uždrausti perkelti jį klientams'), tag: 'populist', fx: { groups: { youth: 2, business: -4 }, cred: 2 } },
      { label: bi('Halve the tax rate', 'Perpus sumažinti tarifą'), tag: 'moderate', fx: { groups: { business: 2 }, cred: -4 } },
      { label: bi('Call their bluff', 'Pasakyti, kad jie blefuoja'), tag: 'welfare', risk: { chance: 0.55, ok: { mom: 1.2, groups: { seniors: 3 } }, okText: bi('The banks back down.', 'Bankai atsitraukia.'), fail: { groups: { youth: -4 }, mom: -1 }, failText: bi('Mortgage rates tick up the next day.', 'Kitą dieną paskolų palūkanos pakyla.') } },
    ],
  },
  {
    id: 'fu_flood', followUp: true, rid: 'KLP', cat: bi('Disaster', 'Nelaimė'), icon: CloudRain, scene: 'fields',
    title: bi('Flood victims: where is the money you promised?', 'Potvynio aukos: kur pažadėti pinigai?'),
    body: bi('Families near Rusnė say not a cent has arrived. A local TV crew is waiting outside your HQ.', 'Šeimos prie Rusnės sako negavusios nė cento. Prie jūsų štabo laukia vietos televizija.'),
    choices: [
      { label: bi('Pay a first €40k from party funds', 'Pirmuosius 40 tūkst. eurų skirti iš partijos lėšų'), tag: 'welfare', fx: { money: -40, reg: [['KLP', 1.4]], groups: { farmers: 3 }, cred: 5 } },
      { label: bi('Blame the bureaucracy', 'Kaltinti biurokratiją'), tag: 'populist', fx: { reg: [['KLP', -0.8]], cred: -6 } },
      { label: bi('Send volunteers to help rebuild', 'Siųsti savanorius padėti atstatyti'), tag: 'moderate', fx: { money: -10, reg: [['KLP', 0.8]], groups: { youth: 2 }, cred: 2 } },
    ],
  },
  {
    id: 'fu_investor', followUp: true, cat: bi('Money', 'Pinigai'), icon: Briefcase, scene: 'vilnius',
    title: bi('A tech investor offers you €150,000', 'Technologijų investuotojas siūlo jums 150 000 eurų'),
    body: bi('A start-up founder likes your AI plan and offers to fund your campaign, if you promise lighter rules for his company.', 'Startuolio įkūrėjui patinka jūsų dirbtinio intelekto planas, ir jis siūlo finansuoti kampaniją, jei pažadėsite švelnesnes taisykles jo įmonei.'),
    choices: [
      { label: bi('Take the money and the deal', 'Paimti pinigus ir sutikti'), tag: null, fx: { money: 150, scandal: 8, cred: -4 } },
      { label: bi('Take the money, promise nothing', 'Paimti pinigus, nieko nežadant'), tag: null, risk: { chance: 0.5, ok: { money: 150 }, okText: bi('He agrees anyway.', 'Jis vis tiek sutinka.'), fail: { mom: -0.5 }, failText: bi('He walks away and complains on social media.', 'Jis pasitraukia ir skundžiasi socialiniuose tinkluose.') } },
      { label: bi('Decline politely', 'Mandagiai atsisakyti'), tag: null, fx: { groups: { business: -1 }, cred: 3 } },
    ],
  },
  {
    id: 'rv_debts', rival: true, cat: bi('Rival scandal', 'Varžovų skandalas'), icon: Search, scene: 'seimas',
    title: bi('A candidate on the {P} list hid €200,000 in debts', '{P} sąrašo kandidatas nuslėpė 200 000 eurų skolų'),
    body: bi('Journalists find unpaid loans and a court case in {R}. The {P} campaign is scrambling.', 'Žurnalistai rado negrąžintų paskolų ir teismo bylą – {R}. {P} štabas blaškosi.'),
    choices: [
      { label: bi('Hit them hard on every channel', 'Smogti visais kanalais'), tag: 'populist', rivalHit: 1, risk: { chance: 0.7, ok: { mom: 1, reg: [['RV', 0.6]] }, okText: bi('The attack lands.', 'Smūgis pataikė.'), fail: { mom: -0.4, cred: -3 }, failText: bi('Voters find it petty.', 'Rinkėjams tai pasirodė smulkmeniška.') } },
      { label: bi('Stay above it', 'Likti virš to'), tag: 'moderate', fx: { cred: 3, unity: 2 } },
      { label: bi('Ask the VRK to check every list', 'Prašyti VRK patikrinti visus sąrašus'), tag: 'moderate', fx: { pc: 1, cred: 1 } },
    ],
  },
  {
    id: 'rv_posters', rival: true, cat: bi('Rival scandal', 'Varžovų skandalas'), icon: Eye, scene: 'town',
    title: bi('Video: {P} activists tear down rivals’ posters in {R}', 'Vaizdo įrašas: {P} aktyvistai plėšia varžovų plakatus – {R}'),
    body: bi('A night-time phone video spreads fast. Your posters are among those on the ground.', 'Naktį nufilmuotas įrašas sparčiai plinta. Tarp nuplėštų – ir jūsų plakatai.'),
    choices: [
      { label: bi('Share it everywhere', 'Dalintis visur'), tag: 'populist', rivalHit: 0.8, fx: { mom: 1, reg: [['RV', 0.5]], scandal: 2 } },
      { label: bi('Call for a clean campaign', 'Kviesti švariai kampanijai'), tag: 'moderate', fx: { cred: 3, reg: [['RV', 0.3]] } },
      { label: bi('File a complaint with the VRK', 'Skųstis VRK'), tag: 'moderate', fx: { pc: 1, reg: [['RV', 0.4]] } },
    ],
  },
  {
    id: 'rv_defect', rival: true, cat: bi('Defections', 'Perbėgėliai'), icon: Users, scene: 'town',
    title: bi('Two {P} councillors in {R} want to join you', 'Du {P} tarybos nariai – {R} – nori prisijungti prie jūsų'),
    body: bi('They bring local networks and a few thousand loyal voters. Your own members there are not thrilled.', 'Jie atsineša vietos ryšius ir kelis tūkstančius lojalių rinkėjų. Jūsų pačių nariai ten nesidžiaugia.'),
    choices: [
      { label: bi('Welcome both with a press event', 'Pasveikinti abu su spaudos renginiu'), tag: null, rivalHit: 0.6, fx: { reg: [['RV', 1.4]], unity: -4, mom: 0.4 } },
      { label: bi('Take one, quietly', 'Priimti vieną, tyliai'), tag: null, fx: { reg: [['RV', 0.7]], unity: -1 } },
      { label: bi('Turn them away: no turncoats', 'Atsisakyti: jokių perbėgėlių'), tag: null, fx: { unity: 4, cred: 2 } },
    ],
  },
  {
    id: 'rv_hotmic', rival: true, cat: bi('Rival gaffe', 'Varžovų gafa'), icon: Mic, scene: 'studio',
    title: bi('Hot mic: {P}’s campaign chief mocks voters in {R}', 'Neišjungtas mikrofonas: {P} štabo vadovas tyčiojasi iš {R} rinkėjų'),
    body: bi('“They’ll vote for anyone who promises them a road,” the recording says. It is on every news site by lunchtime.', '„Jie balsuos už bet ką, kas pažadės kelią“, – girdėti įraše. Iki pietų jis visuose portaluose.'),
    choices: [
      { label: bi('Go to {R} and promise the road', 'Nuvažiuoti į {R} ir pažadėti kelią'), tag: 'populist', rivalHit: 0.6, fx: { reg: [['RV', 1.2]], mom: 0.4 } },
      { label: bi('Say voters deserve respect from everyone', 'Pasakyti, kad rinkėjai nusipelno visų pagarbos'), tag: 'moderate', fx: { cred: 2, reg: [['RV', 0.5]] } },
      { label: bi('Turn it into an attack ad', 'Paversti tai puolamąja reklama'), tag: 'populist', rivalHit: 1.2, fx: { mom: 0.8, reg: [['RV', 0.6]], cred: -1 } },
    ],
  },
  {
    id: 'unity_revolt', followUp: true, cat: bi('Party', 'Partija'), icon: Users, scene: 'seimas',
    title: bi('Revolt in your parliamentary group', 'Maištas jūsų frakcijoje'),
    body: bi('A dozen party heavyweights sign a letter: the campaign has lost its way and broken too many promises. They want changes, now.', 'Keliolika partijos sunkiasvorių pasirašo laišką: kampanija paklydo ir sulaužė per daug pažadų. Jie reikalauja pokyčių – dabar.'),
    choices: [
      { label: bi('Give in: go back to the party programme', 'Nusileisti: grįžti prie partijos programos'), tag: null, fx: { unity: 14, restore: true, cred: -2 } },
      { label: bi('Discipline the ringleaders', 'Nubausti kurstytojus'), tag: null, fx: { unity: 8, pc: -2, mom: -0.6 } },
      { label: bi('Ignore the letter', 'Ignoruoti laišką'), tag: null, fx: { unity: -5, cred: -2 } },
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
const EVENT_SCENE = {
  energy: 'town', border: 'trakai', leak: 'seimas', tractors: 'fields', eurobarometer: 'town', teachers: 'kaunas', hospitals: 'town',
  rail: 'fields', brigade: 'vilnius', emigration: 'world', port: 'klaipeda', cyber: 'seimas', language: 'trakai', basketball: 'kaunas',
  pensions: 'town', taxes: 'seimas', festival: 'klaipeda', partnership: 'seimas', president: 'palace', scandal_mp: 'kaunas', scandal_money: 'seimas',
};
EVENTS.forEach((e) => { if (!e.scene) e.scene = EVENT_SCENE[e.id] || 'town'; });
// Where on the map a story happens (shown as a pin for two weeks).
const EVENT_RID = {
  border: 'VLC', tractors: 'VNO', teachers: 'KNS', port: 'KLP', brigade: 'VLC', language: 'VLC', basketball: 'KNS', emigration: 'ABR', festival: 'KLP',
  drones: 'KLP', housing: 'VNO', forest: 'UTE', pilgrims: 'SIA', flood: 'KLP', callcentre: 'SIA',
};
EVENTS.forEach((e) => { if (!e.rid && EVENT_RID[e.id]) e.rid = EVENT_RID[e.id]; });
// Choices that come back two or three weeks later as a follow-up story.
const FOLLOW_LINKS = {
  tractors: { 0: 'fu_farmers' }, leak: { 2: 'fu_donor' }, housing: { 0: 'fu_landlords' }, teachers: { 0: 'fu_teachers' },
  eurobarometer: { 0: 'fu_factcheck' }, border: { 0: 'fu_border_trade' }, forest: { 1: 'fu_forest' }, banks: { 0: 'fu_banks' },
  flood: { 0: 'fu_flood' }, callcentre: { 1: 'fu_investor' },
};
const EVENT_MAP = Object.fromEntries(EVENTS.map((e) => [e.id, e]));

/* ============================================================
   Voter encounters (after rallies and door-knocking). 'HERE' = the region you are in.
   ============================================================ */
const ENCOUNTERS = [
  {
    id: 'pension', who: 'seniors', urban: false,
    q: bi('My pension is €480 and heating costs €200 a month. What will you actually do?', 'Mano pensija – 480 eurų, o šildymas kainuoja 200 per mėnesį. Ką iš tikrųjų darysite?'),
    answers: [
      { t: bi('Index pensions every year. I promise.', 'Kasmet indeksuosime pensijas. Pažadu.'), fx: { groups: { seniors: 4 }, reg: [['HERE', 0.5]], axis: ['econ', -1, 0.3] }, reply: bi('“I’ll be watching whether you keep it.”', '„Žiūrėsiu, ar ištesėsite.“') },
      { t: bi('No miracles, but heating subsidies will reach you faster.', 'Stebuklų nežadu, bet šildymo kompensacijos pasieks jus greičiau.'), fx: { groups: { seniors: 1 }, cred: 3 }, reply: bi('“Well, at least you’re honest.”', '„Na, bent jau sąžiningai.“') },
      { t: bi('Ask the government. They caused this.', 'Klauskite Vyriausybės – tai jų kaltė.'), fx: { mom: 0.3, cred: -2 }, reply: bi('“You all say that.”', '„Jūs visi taip sakot.“') },
    ],
  },
  {
    id: 'emigrant', who: 'youth', urban: true,
    q: bi('All my friends left for Norway. Why should I stay?', 'Visi mano draugai išvažiavo į Norvegiją. Kodėl man likti?'),
    answers: [
      { t: bi('Lower income tax for everyone under 30.', 'Mažesnis pajamų mokestis visiems iki 30 metų.'), fx: { groups: { youth: 3 }, axis: ['econ', 1, 0.2] }, reply: bi('“That would actually help.”', '„Tai iš tiesų padėtų.“') },
      { t: bi('Affordable rental flats in every city.', 'Įperkami nuomojami butai kiekviename mieste.'), fx: { groups: { youth: 3 }, axis: ['econ', -1, 0.2] }, reply: bi('“If it’s real, I’d stay.”', '„Jei tai tiesa, likčiau.“') },
      { t: bi('Honestly? Because Lithuania needs you.', 'Atvirai? Nes Lietuvai jūsų reikia.'), fx: { groups: { youth: 1 }, reg: [['HERE', 0.3]], cred: 2 }, reply: bi('“Okay, that was kind of nice.”', '„Gerai, tai buvo gražu.“') },
    ],
  },
  {
    id: 'milk', who: 'farmers', urban: false,
    q: bi('Buyers pay me 30 cents a litre for milk. That’s below what it costs me.', 'Supirkėjai už litrą pieno moka 30 centų. Tai mažiau, nei man kainuoja.'),
    answers: [
      { t: bi('A minimum purchase price, written into law.', 'Minimali supirkimo kaina, įtvirtinta įstatyme.'), fx: { groups: { farmers: 5, business: -2 }, axis: ['econ', -1, 0.3] }, reply: bi('“Now you’re talking.”', '„Štai čia kalba.“') },
      { t: bi('Help co-ops build their own dairy.', 'Padėti kooperatyvams pasistatyti savo pieninę.'), fx: { groups: { farmers: 3 }, cred: 2 }, reply: bi('“We’ve heard that before, but fine.”', '„Jau girdėjom, bet gerai.“') },
      { t: bi('The market sets the price.', 'Kainą nustato rinka.'), fx: { groups: { farmers: -5, business: 2 }, axis: ['econ', 1, 0.3] }, reply: bi('He turns his back on you.', 'Jis nusisuka.') },
    ],
  },
  {
    id: 'smallbiz', who: 'business', urban: true,
    q: bi('Taxes change every single year. How am I supposed to plan?', 'Mokesčiai keičiasi kasmet. Kaip man planuoti?'),
    answers: [
      { t: bi('A four-year tax freeze.', 'Mokesčių įšaldymas ketveriems metams.'), fx: { groups: { business: 5 }, axis: ['econ', 1, 0.2], cred: 1 }, reply: bi('“Put that in writing.”', '„Užrašykite tai.“') },
      { t: bi('Taxes must rise for defence, but predictably.', 'Gynybai mokesčiai turės kilti, bet nuspėjamai.'), fx: { groups: { business: -1 }, axis: ['defense', 1, 0.2], cred: 3 }, reply: bi('“Not what I hoped, but honest.”', '„Ne to tikėjausi, bet sąžininga.“') },
      { t: bi('Big companies should pay more, not you.', 'Daugiau turi mokėti didžiosios įmonės, o ne jūs.'), fx: { groups: { business: 2 }, axis: ['econ', -1, 0.2], mom: 0.2 }, reply: bi('“Fine by me.”', '„Man tinka.“') },
    ],
  },
  {
    id: 'nurse', who: 'public',
    q: bi('I work double shifts. Hospitals are closing whole wards.', 'Dirbu dvigubas pamainas. Ligoninės uždaro ištisus skyrius.'),
    answers: [
      { t: bi('A 20% pay rise for medics.', 'Medikams – 20 % didesni atlyginimai.'), fx: { groups: { public: 5 }, axis: ['econ', -1, 0.3] }, reply: bi('“My colleagues will hear about this.”', '„Kolegos apie tai sužinos.“') },
      { t: bi('Every district hospital stays open.', 'Visos rajonų ligoninės liks atviros.'), fx: { groups: { public: 2 }, reg: [['HERE', 0.6]], cred: -1 }, reply: bi('“With what staff?”', '„O su kokiu personalu?“') },
      { t: bi('Merging hospitals will mean better care.', 'Sujungtos ligoninės teiks geresnę priežiūrą.'), fx: { groups: { public: -3 }, cred: 2 }, reply: bi('“Tell that to my patients.”', '„Pasakykite tai mano pacientams.“') },
    ],
  },
  {
    id: 'minority', who: 'minority', where: ['VLC', 'VNO', 'KLP', 'UTE'],
    q: bi('Can my children keep learning in Polish or Russian?', 'Ar mano vaikai galės toliau mokytis lenkų ar rusų kalba?'),
    answers: [
      { t: bi('Yes. Minority schools stay.', 'Taip. Tautinių mažumų mokyklos liks.'), fx: { groups: { minority: 6 }, reg: [['HERE', 0.6]] }, reply: bi('“Thank you. Dziękuję.”', '„Ačiū. Dziękuję.“') },
      { t: bi('Yes, with more Lithuanian lessons.', 'Taip, bet su daugiau lietuvių kalbos pamokų.'), fx: { groups: { minority: 2 }, cred: 2 }, reply: bi('“That sounds fair.”', '„Skamba teisingai.“') },
      { t: bi('Everyone should learn in Lithuanian.', 'Visi turėtų mokytis lietuviškai.'), fx: { groups: { minority: -7 }, reg: [['HERE', -0.6]], axis: ['social', 1, 0.2] }, reply: bi('She walks away without a word.', 'Ji nueina netarusi nė žodžio.') },
    ],
  },
  {
    id: 'border', who: 'seniors', where: ['VLC', 'ALY', 'UTE'],
    q: bi('Balloons, migrants, fighter jets… are we safe living here?', 'Balionai, migrantai, naikintuvai… ar mums saugu čia gyventi?'),
    answers: [
      { t: bi('More border guards and a better fence.', 'Daugiau pasieniečių ir geresnė tvora.'), fx: { reg: [['HERE', 0.6]], axis: ['defense', 1, 0.3] }, reply: bi('“Good. We need that.”', '„Gerai. To mums reikia.“') },
      { t: bi('NATO is here. Panic helps nobody.', 'NATO čia. Panika niekam nepadeda.'), fx: { groups: { seniors: 1 }, cred: 2 }, reply: bi('“I hope you’re right.”', '„Tikiuosi, kad jūs teisus.“') },
      { t: bi('The government has left you on your own.', 'Vyriausybė jus paliko likimo valiai.'), fx: { reg: [['HERE', 0.3]], mom: 0.3, cred: -1 }, reply: bi('“That’s exactly how it feels.”', '„Būtent taip ir jaučiamės.“') },
    ],
  },
  {
    id: 'commuter', who: 'youth', where: ['KNC', 'VLC', 'PAN', 'SIA', 'TEL', 'TAU', 'ALY', 'MAR'],
    q: bi('My bus to the city runs twice a day. How do I get to work?', 'Autobusas į miestą važiuoja du kartus per dieną. Kaip man nuvažiuoti į darbą?'),
    answers: [
      { t: bi('Free regional buses for students and pensioners.', 'Nemokami regioniniai autobusai moksleiviams ir senjorams.'), fx: { groups: { youth: 2, seniors: 2 }, axis: ['econ', -1, 0.2] }, reply: bi('“My gran will love that.”', '„Mano močiutei patiks.“') },
      { t: bi('On-demand minibuses you book with an app.', 'Mikroautobusai pagal poreikį, užsakomi programėle.'), fx: { groups: { youth: 3 }, cred: 1 }, reply: bi('“Finally, something modern.”', '„Pagaliau kažkas modernaus.“') },
      { t: bi('Buy a car, and I’ll cut the fuel excise.', 'Pirkite automobilį, o aš sumažinsiu degalų akcizą.'), fx: { groups: { youth: -1 }, reg: [['HERE', 0.4]], axis: ['green', -1, 0.3] }, reply: bi('“With what money?”', '„Už kokius pinigus?“') },
    ],
  },
  {
    id: 'port', who: 'farmers', where: ['KLP'],
    q: bi('The port lost its Belarusian cargo. Are our jobs next?', 'Uostas neteko baltarusiškų krovinių. Ar dabar mūsų darbo vietos?'),
    answers: [
      { t: bi('New cargo routes with Ukraine and Poland.', 'Nauji krovinių maršrutai su Ukraina ir Lenkija.'), fx: { reg: [['KLP', 0.8]], cred: 1 }, reply: bi('“If it happens fast.”', '„Jei tai įvyks greitai.“') },
      { t: bi('A wind-turbine factory at the port.', 'Vėjo jėgainių gamykla uoste.'), fx: { reg: [['KLP', 0.6]], groups: { youth: 1 }, axis: ['green', 1, 0.3] }, reply: bi('“My son could work there.”', '„Mano sūnus galėtų ten dirbti.“') },
      { t: bi('Bring back the Belarus trade.', 'Grąžinti prekybą su Baltarusija.'), fx: { reg: [['KLP', 0.4]], axis: ['defense', -1, 0.4], cred: -4 }, reply: bi('A reporter writes it down.', 'Žurnalistas tai užsirašo.') },
    ],
  },
  {
    id: 'school', who: 'public', urban: false,
    q: bi('They’re closing our village school. The kids will ride a bus for 30 km.', 'Uždaro mūsų kaimo mokyklą. Vaikai važinės autobusu 30 km.'),
    answers: [
      { t: bi('No village school closes while we govern.', 'Kol valdysime, neužsidarys nė viena kaimo mokykla.'), fx: { reg: [['HERE', 0.8]], groups: { public: 2 }, cred: -1 }, reply: bi('“The whole village will vote for you.”', '„Visas kaimas už jus balsuos.“') },
      { t: bi('Fewer but better schools, with free buses.', 'Mažiau, bet geresnių mokyklų – su nemokamais autobusais.'), fx: { groups: { public: -1 }, cred: 2 }, reply: bi('“Better for whom?”', '„Geresnių kam?“') },
      { t: bi('That’s for the municipality to decide.', 'Tai savivaldybės sprendimas.'), fx: { reg: [['HERE', -0.4]], groups: { public: -3 } }, reply: bi('“Then why are you here?”', '„Tai ko jūs čia atvažiavote?“') },
    ],
  },
  {
    id: 'selfie', who: 'youth',
    q: bi('Can I get a selfie for my TikTok?', 'Galima asmenukė mano TikTok’ui?'),
    answers: [
      { t: bi('Sure! Let’s do a dance.', 'Žinoma! Pašokim.'), fx: { groups: { youth: 3 }, mom: 0.3 }, reply: bi('The video gets 80,000 views.', 'Vaizdo įrašas surenka 80 000 peržiūrų.') },
      { t: bi('A quick photo, then back to work.', 'Greita nuotrauka – ir atgal prie darbų.'), fx: { groups: { youth: 1 } }, reply: bi('“Thanks!”', '„Ačiū!“') },
      { t: bi('Sorry, no time.', 'Atsiprašau, neturiu laiko.'), fx: { groups: { youth: -2 } }, reply: bi('“Wow. Okay.”', '„Vau. Gerai.“') },
    ],
  },
  {
    id: 'heckler', who: 'seniors',
    q: bi('You’re all the same! Liars, every one of you!', 'Jūs visi vienodi! Visi meluojat!'),
    answers: [
      { t: bi('Fair enough. Judge me by what I deliver.', 'Suprantu. Vertinkite mane pagal darbus.'), fx: { cred: 3 }, reply: bi('The crowd claps.', 'Minia ploja.') },
      { t: bi('Smile and move on.', 'Nusišypsoti ir eiti toliau.'), fx: { mom: -0.1 }, reply: bi('Nobody notices.', 'Niekas nepastebi.') },
      { t: bi('“Who paid you to shout?”', '„Kas jums sumokėjo rėkti?“'), risk: { chance: 0.45, ok: { mom: 0.5 }, okText: bi('Your fans love the comeback.', 'Rėmėjams patiko atkirtis.'), fail: { mom: -1.2, cred: -3 }, failText: bi('The clip goes viral: “Leader mocks pensioner”.', 'Įrašas plinta: „Lyderis išjuokė senjorą“.') }, reply: bi('Phones are filming.', 'Telefonai filmuoja.') },
    ],
  },
];
function pickEncounter(g, rid) {
  const r = REG[rid];
  const pool = ENCOUNTERS.filter((e) => !(g.usedEnc || []).includes(e.id)
    && (!e.where || e.where.includes(rid))
    && (e.urban == null || (e.urban ? r.urban >= 0.6 : r.urban < 0.6)));
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}
const ENC_MAP = Object.fromEntries(ENCOUNTERS.map((e) => [e.id, e]));
function resolveEncounter(g, ci) {
  const item = g.queue[0];
  const enc = ENC_MAP[item.id];
  const ans = enc.answers[ci];
  const p = g.player;
  const here = (fx) => ({ ...fx, reg: (fx.reg || []).map(([t, d]) => [t === 'HERE' ? item.rid : t, d]) });
  const before = { share: nationalShares(g)[p], money: g.money, pc: g.pc, mom: g.momentum[p], cred: g.cred };
  const c0 = (g.consequences || []).length;
  let note = ans.reply;
  if (ans.risk) {
    const ok = Math.random() < ans.risk.chance;
    applyFx(g, here(ok ? ans.risk.ok : ans.risk.fail), null);
    note = ok ? ans.risk.okText : ans.risk.failText;
  } else applyFx(g, here(ans.fx), null);
  const after = { share: nationalShares(g)[p], money: g.money, pc: g.pc, mom: g.momentum[p], cred: g.cred };
  addNews(g, { kind: 'meet', enc: enc.id, ci, rid: item.rid });
  item.done = { ci, before, after, note, cons: (g.consequences || []).slice(c0) };
}

/* ============================================================
   Debate clashes: a rival attacks you mid-debate
   ============================================================ */
const CLASHES = [
  {
    q: bi('{R} attacks your programme: your promises cost billions the budget doesn’t have.', '{R} puola jūsų programą: jūsų pažadai kainuoja milijardus, kurių biudžete nėra.'),
    answers: [
      { t: bi('Here are the numbers, line by line.', 'Štai skaičiai, eilutė po eilutės.'), style: 'technocrat', base: 6, cred: 2 },
      { t: bi('And who left the deficit we have now?', 'O kas paliko dabartinį deficitą?'), style: 'attack', base: 6 },
      { t: bi('People in the regions don’t care about your spreadsheets.', 'Žmonėms regionuose nerūpi jūsų lentelės.'), style: 'populist', base: 5.5 },
      { t: bi('A joke about their own promises, then back to the plan.', 'Pajuokauti apie jų pačių pažadus ir grįžti prie plano.'), style: 'youth', base: 6 },
    ],
  },
  {
    q: bi('{R} says your party has promised the same things for years and delivered nothing.', '{R} sako, kad jūsų partija tą patį žada jau daug metų ir nieko neįgyvendina.'),
    answers: [
      { t: bi('List what you actually achieved.', 'Išvardyti, ką iš tikrųjų pasiekėte.'), style: 'technocrat', base: 6, cred: 2 },
      { t: bi('“Your record is worse, and you know it.”', '„Jūsų darbai dar prastesni, ir jūs tai žinote.“'), style: 'attack', base: 6 },
      { t: bi('Stay calm and talk about the future.', 'Ramiai kalbėti apie ateitį.'), style: 'moderate', base: 6 },
      { t: bi('Promise this time will be different.', 'Pažadėti, kad šįkart bus kitaip.'), style: 'welfare', base: 5 },
    ],
  },
  {
    q: bi('{R} says you change your positions every week. Why should anyone believe you?', '{R} sako, kad pozicijas keičiate kas savaitę. Kodėl kas nors turėtų jumis tikėti?'),
    answers: [
      { t: bi('Admit one mistake and explain what you learned.', 'Pripažinti vieną klaidą ir paaiškinti, ko išmokote.'), style: 'moderate', base: 6.5, cred: 3 },
      { t: bi('Deny it flatly.', 'Kategoriškai neigti.'), style: 'populist', base: 4.5, cred: -2 },
      { t: bi('“At least I listen to voters. You never do.”', '„Bent jau aš klausausi rinkėjų. Jūs – niekada.“'), style: 'attack', base: 5.5 },
      { t: bi('Point to the numbers that changed your mind.', 'Parodyti skaičius, kurie pakeitė jūsų nuomonę.'), style: 'technocrat', base: 5.5, cred: 1 },
    ],
  },
];

/* ============================================================
   LRT debates (weeks 4, 8, 11)
   ============================================================ */
const DEBATES = [
  {
    title: bi('The Economy', 'Ekonomika'), closing: true,
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
        q: bi('Should owners of second and third homes pay a progressive property tax?', 'Ar antrųjų ir trečiųjų būstų savininkai turėtų mokėti progresinį nekilnojamojo turto mokestį?'),
        answers: [
          { t: bi('Yes. Someone with three flats can pay more than a nurse.', 'Taip. Turintis tris butus gali mokėti daugiau nei slaugytoja.'), style: 'welfare', base: 6, axis: ['econ', -1], tags: [['urban', 0.4], ['rural', 0.5]] },
          { t: bi('No. Taxing savings punishes the middle class.', 'Ne. Apmokestinti santaupas – bausti vidurinę klasę.'), style: 'business', base: 6, axis: ['econ', 1], tags: [['urban', 0.7]] },
          { t: bi('Only after we fix the property register and close the loopholes.', 'Tik sutvarkę turto registrą ir užkamšę spragas.'), style: 'technocrat', base: 5.5, tags: [['all', 0.3]] },
          { t: bi('Tax the banks before you tax families!', 'Pirma apmokestinkite bankus, o ne šeimas!'), style: 'populist', base: 6, axis: ['econ', -1], tags: [['rural', 0.7]], pc: -1 },
        ],
      },
      {
        q: bi('Small towns are emptying while Vilnius booms. What is your plan for the regions?', 'Miesteliai tuštėja, o Vilnius klesti. Koks jūsų planas regionams?'),
        answers: [
          { t: bi('Move state agencies out of Vilnius and pay a regional bonus.', 'Iškelti valstybės įstaigas iš Vilniaus ir mokėti regioninį priedą.'), style: 'welfare', base: 6, axis: ['econ', -1], tags: [['rural', 1], ['VNO', -0.5]] },
          { t: bi('Zero profit tax for five years for firms that invest in the regions.', 'Penkerius metus jokio pelno mokesčio regionuose investuojančioms įmonėms.'), style: 'business', base: 6, axis: ['econ', 1], tags: [['rural', 0.6], ['urban', 0.3]] },
          { t: bi('Fast trains: Rail Baltica stops in every county seat.', 'Greiti traukiniai: „Rail Baltica“ sustos kiekviename apskrities centre.'), style: 'technocrat', base: 5.5, tags: [['all', 0.4]] },
          { t: bi('The Vilnius elite forgot you. We won’t.', 'Vilniaus elitas jus pamiršo. Mes – ne.'), style: 'populist', base: 6, tags: [['rural', 0.9], ['VNO', -0.7]] },
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
      {
        q: bi('Ukraine asks for more air defence. Should we send systems we still need ourselves?', 'Ukraina prašo daugiau oro gynybos. Ar siųsti sistemas, kurių patiems dar reikia?'),
        answers: [
          { t: bi('Yes. Ukraine’s fight is our fight.', 'Taip. Ukrainos kova – mūsų kova.'), style: 'security', base: 6, axis: ['defense', 1], tags: [['VNO', 0.8], ['urban', 0.4]] },
          { t: bi('Help with money and training, but keep our own shield.', 'Padėti pinigais ir mokymais, bet išlaikyti savo skydą.'), style: 'moderate', base: 6, tags: [['all', 0.4]] },
          { t: bi('Our own villages come first.', 'Pirmiausia – mūsų pačių kaimai.'), style: 'populist', base: 5.5, axis: ['defense', -1], tags: [['rural', 0.6], ['VNO', -0.8]], pc: -1 },
        ],
      },
      {
        q: bi('Russian disinformation floods social media before the vote. How do you fight back?', 'Prieš rinkimus socialinius tinklus užlieja Rusijos dezinformacija. Kaip kovosite?'),
        answers: [
          { t: bi('A media literacy course in every school.', 'Medijų raštingumo pamokos kiekvienoje mokykloje.'), style: 'youth', base: 6, tags: [['urban', 0.6]] },
          { t: bi('Block the channels and fine the platforms hard.', 'Blokuoti kanalus ir skirti platformoms dideles baudas.'), style: 'security', base: 6, axis: ['defense', 1], tags: [['VNO', 0.5], ['border', 0.4]] },
          { t: bi('Trust people: free speech, not censorship.', 'Pasitikėti žmonėmis: žodžio laisvė, ne cenzūra.'), style: 'populist', base: 5.5, tags: [['rural', 0.5], ['urban', -0.3]] },
        ],
      },
    ],
  },
  {
    title: bi('Values, Energy & the Future', 'Vertybės, energetika ir ateitis'), closing: true,
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
        q: bi('Should Lithuania move to a four-day working week?', 'Ar Lietuvai pereiti prie keturių dienų darbo savaitės?'),
        answers: [
          { t: bi('Yes, starting with a public-sector pilot next year.', 'Taip, pradedant bandomuoju projektu viešajame sektoriuje kitais metais.'), style: 'progressive', base: 6, axis: ['econ', -1], tags: [['urban', 0.7]] },
          { t: bi('Productivity first. Shorter weeks will follow.', 'Pirmiausia našumas. Trumpesnė savaitė ateis vėliau.'), style: 'business', base: 6, axis: ['econ', 1], tags: [['urban', 0.4]] },
          { t: bi('Families need time together: yes, and keep Sundays free.', 'Šeimoms reikia laiko kartu: taip, ir sekmadieniai turi likti laisvi.'), style: 'traditional', base: 5.5, axis: ['social', 1], tags: [['rural', 0.6]] },
          { t: bi('Fine, but raise pensions first.', 'Gerai, bet pirmiausia pakelkime pensijas.'), style: 'welfare', base: 5.5, tags: [['rural', 0.7]] },
        ],
      },
      {
        q: bi('Climate: should petrol and diesel cars be taxed more?', 'Klimatas: ar benzininius ir dyzelinius automobilius reikia apmokestinti labiau?'),
        answers: [
          { t: bi('Yes, and spend every cent on public transport.', 'Taip, ir kiekvieną centą skirti viešajam transportui.'), style: 'green', base: 6, axis: ['green', 1], tags: [['urban', 0.8], ['rural', -0.6]] },
          { t: bi('No new taxes on people who must drive to work.', 'Jokių naujų mokesčių tiems, kam į darbą tenka važiuoti automobiliu.'), style: 'populist', base: 6, axis: ['green', -1], tags: [['rural', 0.9], ['urban', -0.3]] },
          { t: bi('Subsidies for used electric cars instead of penalties.', 'Vietoj baudų – subsidijos naudotiems elektromobiliams.'), style: 'moderate', base: 6, tags: [['all', 0.4]] },
          { t: bi('Cut fuel excise and let the market decide.', 'Sumažinti degalų akcizą ir leisti spręsti rinkai.'), style: 'business', base: 5.5, axis: ['econ', 1], tags: [['rural', 0.4]] },
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
    case 'DP': return rural ? 22 : 12;
    case 'LIT': return r.id === 'VNO' ? 18 : 6;
    case 'KS': return 10;
    case 'LZP': return rural ? 3 : 8;
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
  if (p === 'LIT') return r.id === 'VNO' ? 26 : 16;
  if (p === 'LZP') return r.urban > 0.6 ? 24 : 10;
  if (p === 'DP' || p === 'KS') return 24;
  return 58;
}
const satOf = (p, r, share) => clamp(1 - share / ceilingOf(p, r), 0.08, 1);
const POWER = { rally: 0.95, digital: 1.05, tv: 1.0, door: 0.3, attack: 1.5, backfire: 0.9 };
function geoMult(p, r) {
  if (p === 'LLRA') return r.id === 'VLC' ? 1.5 : r.id === 'VNO' ? 1.3 : r.id === 'UTE' ? 0.7 : 0.35;
  if (p === 'LP') return ['VNO', 'KNS', 'ABR'].includes(r.id) ? 1 : r.id === 'KLP' ? 0.85 : 0.6;
  if (p === 'TS' && r.id === 'ABR') return 1.2;
  if (p === 'LIT') return r.id === 'VNO' ? 1.3 : 0.8;
  if (p === 'LZP') return r.urban > 0.6 ? 1 : 0.6;
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
    if (p === 'LZP') m *= 1.3;
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
  if (x > 0 && g.cred != null) g.cred = clamp(g.cred - x * (g.scen === 'scandal' ? 0.45 : 0.3), 0, 100);
  if (x > 0 && g.unity != null) g.unity = clamp(g.unity - x * 0.12, 0, 100);
}
// Consequences are collected through the week and shown in the weekly recap.
function addCons(g, tone, text, rid) {
  if (!g.consequences) g.consequences = [];
  g.consequences.push({ tone, text, rid: rid || null, week: g.week });
}
function addCred(g, d) { g.cred = clamp((g.cred == null ? 65 : g.cred) + d, 0, 100); }
// 0.7 (nobody believes you) … 1.3 (trusted): scales how much good news lifts you.
const credMult = (g) => 0.7 + 0.6 * ((g.cred == null ? 65 : g.cred) / 100);
// Remember what you promised. Saying the opposite later costs credibility.
function pledge(g, ax, dir, source) {
  if (!g.promises) g.promises = [];
  const prev = g.promises.find((x) => x.ax === ax);
  const axL = AXES.find((a) => a.id === ax);
  const side = (d) => (d < 0 ? axL.left : axL.right);
  if (prev && prev.dir !== dir) {
    addCred(g, -10);
    g.momentum[g.player] = clamp(g.momentum[g.player] - 0.6, -10, 10);
    if (g.unity != null) g.unity = clamp(g.unity - 5, 0, 100);
    if (g.stats) g.stats.flips = (g.stats.flips || 0) + 1;
    addCons(g, 'bad', bi(`Flip-flop! In week ${prev.week} you promised “${side(prev.dir).en}” on ${axL.label.en.toLowerCase()}, now the opposite. Credibility −10.`,
      `Pozicijos keitimas! ${prev.week} sav. žadėjote „${side(prev.dir).lt}“ (${axL.label.lt.toLowerCase()}), o dabar – priešingai. Patikimumas −10.`));
    prev.dir = dir; prev.week = g.week; prev.n = 1; prev.source = source;
    return 'flip';
  }
  if (prev) { prev.n += 1; prev.week = g.week; addCred(g, 1.5); return 'keep'; }
  g.promises.push({ ax, dir, week: g.week, n: 1, source });
  return 'new';
}
function addNews(g, item) {
  g.newsId = (g.newsId || 0) + 1;
  g.news.unshift({ id: g.newsId, week: g.week, ...item });
  if (g.news.length > 90) g.news.length = 90;
}
function spend(g, k) { g.money -= k; g.stats.spent += k; }
function vrkCheck(g) {
  if (g.vrkHit || g.stats.spent <= VRK_LIMIT) return null;
  g.vrkHit = true;
  const fine = Math.min(g.money, hasStaff(g, 'lawyer') ? 75 : 150);
  g.money -= fine;
  g.momentum[g.player] = clamp(g.momentum[g.player] - 1.5, -10, 10);
  addScandal(g, 10);
  addNews(g, { kind: 'vrk', fine });
  return tt(` VRK fined you ${fmtEur(fine)} for overspending!`, ` VRK skyrė ${fmtEur(fine)} baudą už viršytas išlaidas!`);
}

/* ============================================================
   New game
   ============================================================ */
function newGame(pid, advisor = true, diff = 'normal', scen = 'standard') {
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
    const n = ['TS', 'LSDP', 'NA', 'LVZS'].includes(p) ? 3 : ['DP', 'LIT', 'KS', 'LZP'].includes(p) ? 1 : 2;
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
    v: 6, seed, player: pid, week: 1, phase: 'campaign', tut: advisor ? 0 : 99, advisor,
    ap: 6, apMax: 6, money: PARTIES[pid].funds, pc: 6, scandal: pid === 'NA' ? 10 : 4,
    stance: { ...PARTIES[pid].pos }, lastShift: {},
    momentum: Object.fromEntries(ALL_IDS.map((p) => [p, 0])),
    groupMood: Object.fromEntries(GROUPS.map((G) => [G.id, 0])),
    support, undecided, gg, boost, leans, stars,
    weekActs: {}, natActs: {}, weekLog: {}, attacksThisWeek: 0, lastIncome: 0, vrkHit: false, weather: null,
    history: [], news: [], newsId: 0, queue: advisor ? [{ type: 'brief' }] : [], usedEvents: [], lastEventWeek: 1,
    debateQs: DEBATES.map((D) => {
      const n = D.questions.length - (D.closing ? 1 : 0);
      const pick = Array.from({ length: n }, (_, i) => [i, rand()]).sort((a, b) => a[1] - b[1]).slice(0, D.closing ? 2 : 3).map((x) => x[0]).sort((a, b) => a - b);
      return D.closing ? [...pick, n] : pick;
    }),
    stats: { actions: 0, spent: 0, shifts: 0, debates: [], events: 0, gambleNet: 0, gambles: 0 },
    election: null, coal: null, vote: null, result: null,
    leaderAt: HOME[pid] || 'VNO', freeTrip: true, route: [HOME[pid] || 'VNO'], cred: 65, promises: [], followUps: [], consequences: [],
    provoked: {}, lastVisit: Object.fromEntries(REGIONS.map((r) => [r.id, 1])), neglected: {}, weekMoves: [], rivalMoves: [], rivalAt: {},
    newsPins: [], encWeek: 0, usedEnc: [], endorsements: [],
    diff, scen, staff: [], theme: null, themeStreak: 0, unity: 70, objective: null, pacts: [], weekRaised: 0, weekShady: false,
    toured: [HOME[pid] || 'VNO'],
  };
  g.stats.objectives = 0; g.stats.flips = 0; g.stats.kompro = 0;
  if (scen === 'energy') { ['LSDP', 'NA', 'LVZS'].forEach((q) => { g.momentum[q] -= 1.4; }); g.followUps.push({ id: 'energy', week: 2 }); }
  if (scen === 'security') { g.momentum.TS += 1.4; g.momentum.LS += 0.6; g.momentum.NA -= 0.5; g.momentum.LLRA -= 0.5; g.followUps.push({ id: 'drones', week: 2 }); }
  if (scen === 'scandal') { g.scandal += 8; g.cred = 55; PARTY_IDS.forEach((q) => { g.momentum[q] += gauss() * 0.8; }); }
  g.objective = makeObjective(g);
  g.weekStart = Object.fromEntries(REGIONS.map((r) => [r.id, regionShares(g, r)]));
  g.prevStart = g.weekStart;
  g.weekNatStart = nationalShares(g)[pid];
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
  const k = FATIGUE[Math.min(n, FATIGUE.length - 1)] * satOf(p, r, sh) * geoMult(p, r) * themeMult(g, r) * (hasStaff(g, 'pollster') ? 1.06 : 1);
  if (type === 'rally') return POWER.rally * traitMult(p, 'rally', r) * k * (g.leaderAt === rid ? LEADER_RALLY : NO_LEADER_RALLY);
  if (type === 'digital') return POWER.digital * (0.35 + r.urban) * traitMult(p, 'digital', r) * k * (hasStaff(g, 'digital') ? 1.3 : 1);
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
function travelCost(g, rid) {
  if (!g.leaderAt || rid === g.leaderAt) return null;
  if (rid === 'ABR' || g.leaderAt === 'ABR') return { ap: 1, eur: 60, mode: 'plane' };
  if (g.freeTrip && (ADJ[g.leaderAt] || []).includes(rid)) return { ap: 0, eur: 6, mode: 'bus' };
  return { ap: 1, eur: 14, mode: 'bus' };
}
function travel(g, rid) {
  const c = travelCost(g, rid);
  if (!c) return { ok: false, msg: tt('Your leader is already here.', 'Jūsų lyderis jau čia.') };
  if (g.ap < c.ap) return { ok: false, msg: tt('Not enough energy for a long trip.', 'Ilgai kelionei trūksta energijos.') };
  if (g.money < c.eur) return { ok: false, msg: tt(`Not enough money: ${fmtEur(c.eur)} needed.`, `Trūksta pinigų: reikia ${fmtEur(c.eur)}.`) };
  g.ap -= c.ap; spend(g, c.eur);
  if (c.ap === 0) g.freeTrip = false;
  g.leaderAt = rid;
  g.route.push(rid);
  g.lastVisit[rid] = g.week;
  if (!(g.toured || []).includes(rid)) g.toured = [...(g.toured || []), rid];
  return { ok: true, tone: 'good', msg: tt(`${leaderSurname(g.player)} is now in ${rs(rid)}. Rallies here get a boost.`, `${leaderSurname(g.player)} dabar – ${rs(rid)}. Mitingai čia stipresni.`) };
}
const LEADER_RALLY = 1.3, NO_LEADER_RALLY = 0.85;
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
    const name = cnm(tgt.cid);
    return { ok: true, tone: 'good', msg: tt(`${L(STAR_PEOPLE[who])} will run for you in ${consName(name)}!`, `${consName(name)}: už jus kandidatuos ${L(STAR_PEOPLE[who])}!`) + (vrkCheck(g) || '') };
  }
  g.ap -= 1; spend(g, cost);
  g.stats.actions += 1;
  g.weekLog[type] = (g.weekLog[type] || 0) + 1;
  const n = g.weekActs[rid] || 0;
  g.weekActs[rid] = n + 1;
  const before = regionShares(g, r);
  const fat = FATIGUE[Math.min(n, FATIGUE.length - 1)];
  const here = g.leaderAt === rid;
  const early = g.week >= WEEKS ? 0.85 : 1;
  const k = fat * satOf(p, r, before[p]) * geoMult(p, r) * (0.85 + Math.random() * 0.3) * early * themeMult(g, r) * (hasStaff(g, 'pollster') ? 1.06 : 1);
  g.themeLocked = true;
  g.weekMoves.push({ rid, type });
  g.lastVisit[rid] = g.week;
  let tone = 'good';
  let msg;
  const v = vrkCheck;
  if (type === 'rally') {
    gainSupport(g, rid, p, POWER.rally * traitMult(p, 'rally', r) * k * (here ? LEADER_RALLY : NO_LEADER_RALLY), 0.5);
    g.boost[rid][p] = Math.min(0.25, g.boost[rid][p] + 0.03);
  } else if (type === 'digital') {
    gainSupport(g, rid, p, POWER.digital * (0.35 + r.urban) * traitMult(p, 'digital', r) * k * (hasStaff(g, 'digital') ? 1.3 : 1), 0.8);
    if (p === 'LS' || p === 'LP') g.boost[rid][p] = Math.min(0.25, g.boost[rid][p] + 0.015 * r.urban);
  } else if (type === 'tv') {
    gainSupport(g, rid, p, POWER.tv * (1.25 - 0.65 * r.urban) * traitMult(p, 'tv', r) * k, 0.8);
  } else if (type === 'door') {
    const gg0 = g.gg[rid][p];
    g.gg[rid][p] = Math.min(100, gg0 + 14 * (1 - gg0 / 110) * geoMult(p, r) * (p === 'DP' ? 1.5 : 1) * (here ? 1.25 : 1) * (hasStaff(g, 'field') ? 1.5 : 1));
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
    g.provoked[target] = rid;
    const after = regionShares(g, r);
    return { ok: true, tone, msg: tt(`Attack ad hit ${partyShort(target)} in ${rs(r)}: ${fmtSignedPct(after[target] - before[target])} for them`, `Puolamoji reklama smogė ${partyShort(target)} – ${rs(r)}: ${fmtSignedPct(after[target] - before[target])}`) + (v(g) || '') };
  }
  if ((type === 'rally' || type === 'door') && g.encWeek !== g.week && g.phase === 'campaign' && Math.random() < 0.4) {
    const enc = pickEncounter(g, rid);
    if (enc) { g.encWeek = g.week; g.queue.push({ type: 'encounter', id: enc.id, rid }); g.usedEnc.push(enc.id); }
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
  return Math.round((80 + 3.5 * share) * FUND_MULT[g.player] * [1, 0.7, 0.5, 0.35][Math.min(g.natActs.gala || 0, 3)] * (hasStaff(g, 'fundraiser') ? 1.25 : 1));
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
    g.money += amt; addScandal(g, 1.5); g.weekRaised = (g.weekRaised || 0) + amt;
    msg = tt(`Donor dinner raised ${fmtEur(amt)}`, `Rėmėjų vakarienė surinko ${fmtEur(amt)}`);
  } else if (id === 'small') {
    const amt = Math.round(smallAmount(g) * (0.9 + Math.random() * 0.2));
    g.money += amt; g.weekRaised = (g.weekRaised || 0) + amt;
    if (['NA', 'LVZS', 'LP', 'LLRA', 'DP', 'KS', 'LZP'].includes(p)) g.momentum[p] = clamp(g.momentum[p] + 0.4, -10, 10);
    msg = tt(`Small donors chipped in ${fmtEur(amt)}`, `Smulkūs aukotojai suaukojo ${fmtEur(amt)}`);
  } else if (id === 'lobby') {
    g.pc -= A.pc;
    const amt = lobbyAmount(g);
    g.money += amt; addScandal(g, 12); g.weekRaised = (g.weekRaised || 0) + amt; g.weekShady = true;
    g.unity = clamp(g.unity - 2, 0, 100);
    msg = tt(`Business deal: +${fmtEur(amt)}. Scandal risk is rising!`, `Verslo sandoris: +${fmtEur(amt)}. Skandalo rizika auga!`);
    tone = 'warn';
  } else if (id === 'tvspot') {
    const before = nationalShares(g)[p];
    for (const r of REGIONS) gainSupport(g, r.id, p, 0.4 * (1.15 - 0.4 * r.urban) * geoMult(p, r) * satOf(p, r, regionShares(g, r)[p]), 0.7);
    msg = tt(`TV ad aired everywhere: ${fmtSignedPct(nationalShares(g)[p] - before)} nationally`, `TV reklama visoje šalyje: ${fmtSignedPct(nationalShares(g)[p] - before)}`);
  } else if (id === 'presser') {
    const d = 0.9 * [1, 0.55, 0.3, 0.15][Math.min(n, 3)] * (hasStaff(g, 'press') ? 1.5 : 1);
    g.momentum[p] = clamp(g.momentum[p] + d, -10, 10);
    msg = tt(`You lead the evening news: buzz ${fmtSigned(d)}`, `Jūs – vakaro žiniose: pagreitis ${fmtSigned(d)}`);
  } else if (id === 'backchannel') {
    const d = [2, 1, 1, 0][Math.min(n, 3)];
    g.pc += d;
    msg = d ? tt(`Coffee with rivals: +${d} favour${d > 1 ? 's' : ''}`, `Kava su varžovais: +${d} ${plur(d, '', '', 'ryšys', 'ryšiai', 'ryšių')}`) : tt('Nobody wants another coffee this week.', 'Šią savaitę niekas nebenori kavos.');
  } else if (id === 'kompro') {
    const roll = Math.random();
    g.weekShady = true;
    g.stats.kompro = (g.stats.kompro || 0) + 1;
    if (roll < 0.45) {
      g.momentum[target] = clamp(g.momentum[target] - 2.5, -10, 10);
      for (const r of REGIONS) loseSupport(g, r.id, target, 0.5 * (1 - g.gg[r.id][target] / 200), 0.6);
      REGIONS.forEach((r) => normalizeRegion(g, r.id));
      addNews(g, { kind: 'kompro', target, outcome: 'hit' });
      chron(g, 'kompro', bi(`Leaked documents hurt ${partyShort(target)}`, `Nutekinti dokumentai pakenkė ${partyShort(target)}`));
      msg = tt(`Jackpot: leaked documents embarrass ${partyShort(target)}!`, `Pavyko: nutekinti dokumentai sukompromitavo ${partyShort(target)}!`);
    } else if (roll < (hasStaff(g, 'lawyer') ? 0.9 : 0.8)) {
      msg = tt('Your investigators found nothing useful.', 'Tyrėjai nieko naudingo nerado.');
      tone = 'warn';
    } else {
      g.momentum[p] = clamp(g.momentum[p] - 1.5, -10, 10);
      addScandal(g, 10);
      addNews(g, { kind: 'kompro', target, outcome: 'exposed' });
      chron(g, 'kompro', bi('Caught digging for dirt', 'Įkliuvote renkant kompromatą'), 'bad');
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
  const caught = Math.random() < (hasStaff(g, 'lawyer') ? 0.06 : 0.12);
  g.weekShady = true;
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
  const caught = Math.random() < (hasStaff(g, 'lawyer') ? 0.06 : 0.12);
  g.weekShady = true;
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
  for (const a of c.changes) { g.lastShift[a] = Math.sign(draft[a] - g.stance[a]); pledge(g, a, Math.sign(draft[a] - g.stance[a]), 'platform'); }
  addNews(g, { kind: 'platform', changes: c.changes.map((a) => [a, draft[a]]), uturn: c.uturns.length > 0 });
  g.stance = { ...draft };
  g.momentum[g.player] = clamp(g.momentum[g.player] - c.mom, -10, 10);
  if (driftSteps(draft, PARTIES[g.player].pos) > 2.5) {
    g.unity = clamp(g.unity - 3, 0, 100);
    addCons(g, 'bad', bi('Party veterans grumble that you have drifted far from the party programme (unity −3).', 'Partijos senbuviai burba, kad nutolote nuo partijos programos (vienybė −3).'));
  }
  g.pc = Math.max(0, g.pc - c.pc);
  g.stats.shifts += c.steps;
  return { ok: true, tone: c.mom > 0 ? 'warn' : 'good', msg: tt('New promises announced', 'Nauji pažadai paskelbti') + (c.mom > 0 ? tt(` · buzz ${fmtSigned(-c.mom)}`, ` · pagreitis ${fmtSigned(-c.mom)}`) : '') };
}

/* ============================================================
   AI campaigns & weekly cycle
   ============================================================ */
function aiTurn(g) {
  const moves = [];
  const me = g.player;
  // How much did you gain in each region this week? Region leaders hit back where you surged.
  const gains = Object.fromEntries(REGIONS.map((r) => [r.id, regionShares(g, r)[me] - ((g.weekStart && g.weekStart[r.id]) ? g.weekStart[r.id][me] : 0)]));
  const nat0 = nationalShares(g);
  const order0 = PARTY_IDS.slice().sort((a, b) => nat0[b] - nat0[a]);
  const playerFront = order0[0] === g.player && nat0[order0[0]] - nat0[order0[1]] > 2;
  for (const p of PARTY_IDS) {
    if (p === g.player) continue;
    const nat = nationalShares(g)[p];
    const n = Math.max(1, (nat > 14 ? 4 : nat > 7 ? 3 : nat > 3 ? 2 : 1) + (DIFFS[g.diff || 'normal'].ai > 0 && nat > 7 ? 1 : DIFFS[g.diff || 'normal'].ai < 0 ? -1 : 0));
    const size = clamp(Math.sqrt(nat / 12), 0.5, 1.15);
    const list = [];
    const prov = g.provoked && g.provoked[p];
    if (prov && Math.random() < 0.8) {
      const r = REG[prov];
      const k = 0.75 * size * geoMult(p, r) * (0.8 + Math.random() * 0.4);
      if (Math.random() < BACKFIRE[p]) { loseSupport(g, r.id, p, POWER.backfire * k, 0.6); list.push({ type: 'backfire', rid: r.id, target: me, retal: true }); }
      else { loseSupport(g, r.id, me, POWER.attack * k * (1 - g.gg[r.id][me] / 160), 0.45, p, 0.35); list.push({ type: 'attack', rid: r.id, target: me, retal: true }); }
      addCons(g, 'bad', bi(`${partyShort(p)} hit back at your attack ad with one of its own in ${L(r.short)}.`, `${partyShort(p)} atsakė į jūsų puolimą savo puolamąja reklama – ${L(r.short)}.`), r.id);
    }
    const defend = REGIONS.filter((r) => gains[r.id] > 1.1 && leaderOf(regionShares(g, r)) === p).sort((a, b) => gains[b.id] - gains[a.id])[0];
    if (defend) {
      const k = 0.75 * size * geoMult(p, defend) * satOf(p, defend, regionShares(g, defend)[p]);
      gainSupport(g, defend.id, p, POWER.rally * traitMult(p, 'rally', defend) * k, 0.5);
      list.push({ type: 'rally', rid: defend.id, target: null, defend: true });
      addCons(g, 'warn', bi(`${partyShort(p)} rushed to defend ${L(defend.short)} after your surge there (+${nf(gains[defend.id])} pts).`, `${partyShort(p)} skubiai gina ${L(defend.short)}, kur jūs šią savaitę augote (+${nf(gains[defend.id])} proc. p.).`), defend.id);
    }
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
      const atk = (p === 'NA' ? 0.24 : 0.1) + (playerFront ? 0.08 : 0) + (g.diff === 'hard' ? 0.06 : 0);
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
    const cnt = {};
    list.forEach((m) => { cnt[m.rid] = (cnt[m.rid] || 0) + 1; });
    g.rivalAt[p] = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0] || g.rivalAt[p];
  }
  g.provoked = {};
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
  const rivalPool = EVENTS.filter((e) => e.rival && !g.usedEvents.includes(e.id));
  if (rivalPool.length && Math.random() < (g.scen === 'scandal' ? 0.6 : 0.3)) return rivalPool[Math.floor(Math.random() * rivalPool.length)].id;
  const pool = EVENTS.filter((e) => !e.scandal && !e.followUp && !e.rival && !g.usedEvents.includes(e.id));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)].id;
}
function startWeek(g) {
  g.week += 1;
  g.ap = g.apMax;
  g.freeTrip = true;
  g.route = [g.leaderAt];
  g.weekMoves = [];
  g.prevStart = g.weekStart;
  g.weekStart = Object.fromEntries(REGIONS.map((r) => [r.id, regionShares(g, r)]));
  g.newsPins = (g.newsPins || []).filter((x) => g.week - x.week < 2);
  const share = nationalShares(g)[g.player];
  const income = Math.round((40 + 5 * share) * FUND_MULT[g.player] * DIFFS[g.diff || 'normal'].income * (hasStaff(g, 'fundraiser') ? 1.35 : 1));
  g.money += income;
  g.lastIncome = income;
  runAds(g);
  g.apMax = 6 + (hasStaff(g, 'strategist') ? 1 : 0);
  g.ap = g.apMax;
  const wages = sum((g.staff || []).map((id) => STAFF.find((x) => x.id === id).wage));
  if (wages) {
    if (g.money >= wages) { g.money -= wages; g.lastWages = wages; }
    else {
      const gone = g.staff[g.staff.length - 1];
      fireStaff(g, gone);
      g.money = Math.max(0, g.money - sum(g.staff.map((id) => STAFF.find((x) => x.id === id).wage)));
      addCons(g, 'bad', bi(`You couldn’t pay wages: your ${STAFF.find((x) => x.id === gone).name.en.toLowerCase()} quit.`, `Neturėjote kuo sumokėti algų: išėjo ${STAFF.find((x) => x.id === gone).name.lt.toLowerCase()}.`));
    }
  }
  g.weekRaised = 0; g.weekShady = false; g.themeLocked = false;
  g.weekNatStart = nationalShares(g)[g.player];
  g.objective = makeObjective(g);
  if (g.unity < 40 && !g.usedEvents.includes('unity_revolt') && !(g.followUps || []).some((f) => f.id === 'unity_revolt')) g.followUps.push({ id: 'unity_revolt', week: g.week });
  g.weekActs = {}; g.natActs = {}; g.weekLog = {}; g.attacksThisWeek = 0;
  if (DEBATE_WEEKS.includes(g.week)) g.queue.push({ type: 'debate', id: DEBATE_WEEKS.indexOf(g.week) });
  let ev = null;
  if (Math.random() * 100 < g.scandal * 0.55) {
    if (g.scandal > 22 && !g.usedEvents.includes('scandal_money')) ev = 'scandal_money';
    else if (!g.usedEvents.includes('scandal_mp')) ev = 'scandal_mp';
  }
  const due = (g.followUps || []).find((f) => f.week <= g.week && !g.usedEvents.includes(f.id));
  if (!ev && due) { ev = due.id; g.followUps = g.followUps.filter((f) => f !== due); }
  if (!ev && (g.week - g.lastEventWeek >= 2 || Math.random() < 0.4)) ev = pickEvent(g);
  if (ev) {
    const item = { type: 'event', id: ev };
    if (EVENT_MAP[ev].rival) {
      const nat = nationalShares(g);
      const pool = PARTY_IDS.filter((q) => q !== g.player).sort((a, b) => nat[b] - nat[a]).slice(0, 6);
      item.rv = pool[weightedPick(pool.map((q) => nat[q]))];
      item.rr = REGIONS.filter((r) => r.id !== 'ABR').sort((a, b) => regionShares(g, b)[item.rv] - regionShares(g, a)[item.rv])[0].id;
    }
    g.queue.push(item);
    g.usedEvents.push(ev);
    g.lastEventWeek = g.week;
    const pinR = item.rr || EVENT_MAP[ev].rid;
    if (pinR) g.newsPins.push({ rid: pinR, id: ev, week: g.week, rv: item.rv });
  }
}
function neglectCheck(g) {
  const p = g.player;
  if (g.leaderAt) g.lastVisit[g.leaderAt] = g.week;
  for (const r of REGIONS) {
    if (r.id === 'ABR' || r.seats < 3) continue;
    const info = raceInfo(g, r);
    const away = g.week - (g.lastVisit[r.id] || 0);
    if (info.status === 'safe' && away >= 4 && g.week - (g.neglected[r.id] || -9) >= 3) {
      loseSupport(g, r.id, p, 0.55, 0.7);
      g.neglected[r.id] = g.week;
      addCons(g, 'bad', bi(`Voters in ${L(r.short)} feel forgotten: you haven’t been there for ${away} weeks.`, `${L(r.short)} rinkėjai jaučiasi pamiršti: ten nebuvote jau ${away} sav.`), r.id);
    }
  }
}
function runEndorsements(g) {
  const me = g.player;
  ORGS.filter((o) => o.week === g.week).forEach((o) => {
    const G = GROUPS.find((x) => x.id === o.group);
    const score = (q) => (q === me ? groupApproval(g, G) : 88 - sum(AXIS_IDS.map((a) => Math.abs(PARTIES[q].pos[a] - G.ideal[a]))) / 4.2) + Math.random() * 6;
    const nat = nationalShares(g);
    const field = PARTY_IDS.filter((q) => nat[q] >= 2 || q === me);
    const win = field.sort((a, b) => score(b) - score(a))[0];
    for (const r of REGIONS) gainSupport(g, r.id, win, 3.2 * groupWeight(G.id, r), 0.8);
    g.momentum[win] = clamp(g.momentum[win] + 0.4, -10, 10);
    g.endorsements.push({ org: o.id, p: win, week: g.week });
    addNews(g, { kind: 'endorse', org: o.id, p: win });
    if (win === me) addCons(g, 'good', bi(`${o.name.en} endorsed you! A boost wherever ${G.name.en.toLowerCase()} live.`, `${o.name.lt} parėmė jus! Postūmis ten, kur daug grupės „${G.name.lt.toLowerCase()}“.`));
    else addCons(g, 'warn', bi(`${o.name.en} endorsed ${partyShort(win)}, not you.`, `${o.name.lt} parėmė ${partyShort(win)}, ne jus.`));
  });
}
function endWeek(g) {
  judgeObjective(g);
  if (g.theme) {
    const T = THEME_MAP[g.theme];
    g.themeStreak = g.theme === g.lastTheme ? (g.themeStreak || 0) + 1 : 1;
    g.lastTheme = g.theme;
    Object.entries(T.groups).forEach(([id, d]) => { g.groupMood[id] = clamp((g.groupMood[id] || 0) + d, -20, 20); });
    if (T.cred) addCred(g, T.cred);
    g.momentum[g.player] = clamp(g.momentum[g.player] + 0.12 * Math.min(g.themeStreak, 3), -10, 10);
  }
  if (g.unity >= 75) g.momentum[g.player] = clamp(g.momentum[g.player] + 0.15, -10, 10);
  const before = nationalShares(g);
  if (Object.values(g.weekLog).some((n) => n > 0)) addNews(g, { kind: 'you', log: { ...g.weekLog } });
  const moves = aiTurn(g);
  weeklyDrift(g);
  neglectCheck(g);
  runEndorsements(g);
  g.cred = clamp(g.cred + (62 - g.cred) * 0.06, 0, 100);
  for (const p of ALL_IDS) g.momentum[p] *= 0.8;
  g.scandal = Math.max(0, g.scandal - (hasStaff(g, 'press') ? 3 : 1.5));
  const mid = nationalShares(g);
  const ord = PARTY_IDS.slice().sort((a, b) => mid[b] - mid[a]);
  const lead = mid[ord[0]] - mid[ord[1]];
  if (lead > 2.5) {
    g.momentum[ord[0]] = clamp(g.momentum[ord[0]] - 0.45 * (lead - 2.5), -10, 10);
    if (ord[0] === g.player) addNews(g, { kind: 'front', lead });
  }
  const after = nationalShares(g);
  const poll = {};
  const pi = g.week % POLLSTERS.length;
  const PO = POLLSTERS[pi];
  for (const p of ALL_IDS) {
    const sd = Math.sqrt((after[p] / 100) * (1 - after[p] / 100) / PO.n) * 100;
    poll[p] = Math.max(0.3, after[p] + (PO.house[p] || 0) + gauss() * sd * 0.8);
  }
  const pt = sum(Object.values(poll));
  for (const p of ALL_IDS) poll[p] = (poll[p] / pt) * 100;
  g.history.push({ week: g.week, shares: poll, pol: pi });
  g.rivalMoves = moves.map((m) => ({ p: m.p, list: m.list }));
  moves.forEach((m) => addNews(g, { kind: 'rival', p: m.p, list: m.list }));
  if (g.week >= WEEKS) {
    g.queue = [];
    g.phase = 'night';
    const roll = Math.random();
    g.weather = roll < 0.3 ? 'sun' : roll < 0.75 ? 'cloud' : 'rain';
    g.election = simulateElection(g, true);
    return;
  }
  const report = { type: 'report', week: g.week, before, after, moves, cons: (g.consequences || []).slice() };
  g.consequences = [];
  if (g.tut >= 1 && g.tut < 5) g.tut = 5;
  startWeek(g);
  g.queue.unshift(report);
}

/* ============================================================
   Event & debate effects
   ============================================================ */
const TAG_BONUS = {
  welfare: { LSDP: 1.4, DSVL: 1.15, LVZS: 1.1, DP: 1.2 }, security: { TS: 1.3, LS: 1.1 }, populist: { NA: 1.4, LVZS: 1.15, DP: 1.15 },
  agri: { LVZS: 1.4, LSDP: 1.1 }, business: { LS: 1.3, TS: 1.15, LIT: 1.15 }, youth: { LP: 1.5, LS: 1.2, LZP: 1.2 }, minority: { LLRA: 2 },
  moderate: { DSVL: 1.3 }, green: { LP: 1.2, DSVL: 1.25, LZP: 1.5 }, traditional: { LVZS: 1.4, LLRA: 1.3, NA: 1.1, KS: 1.4 }, progressive: { LP: 1.5, LS: 1.2, LZP: 1.2 },
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
  const mult = ((TAG_BONUS[tag] && TAG_BONUS[tag][p]) || 1) * credMult(g);
  if (fx.cred) addCred(g, fx.cred);
  if (fx.unity) g.unity = clamp((g.unity == null ? 70 : g.unity) + fx.unity, 0, 100);
  if (fx.restore) {
    const orig = PARTIES[p].pos;
    const ax = AXIS_IDS.slice().sort((a, b) => Math.abs(g.stance[b] - orig[b]) - Math.abs(g.stance[a] - orig[a]))[0];
    if (g.stance[ax] !== orig[ax]) g.stance = { ...g.stance, [ax]: g.stance[ax] + Math.sign(orig[ax] - g.stance[ax]) * 30 };
  }
  if (fx.axis) pledge(g, fx.axis[0], fx.axis[1], 'event');
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
function resolveEvent(g, ci) {
  const item = g.queue[0];
  const ev = EVENT_MAP[item.id];
  const ch = ev.choices[ci];
  const p = g.player;
  const before = { share: nationalShares(g)[p], money: g.money, pc: g.pc, mom: g.momentum[p], cred: g.cred };
  const c0 = (g.consequences || []).length;
  let note = null;
  const here = (fx) => (item.rr ? { ...fx, reg: (fx.reg || []).map(([t, d]) => [t === 'RV' ? item.rr : t, d]) } : fx);
  if (ev.rival && item.rv) {
    g.momentum[item.rv] = clamp(g.momentum[item.rv] - 1.5, -10, 10);
    loseSupport(g, item.rr, item.rv, 0.8, 0.6);
    normalizeRegion(g, item.rr);
  }
  if (ch.risk) {
    const ok = Math.random() < ch.risk.chance;
    applyFx(g, here(ok ? ch.risk.ok : ch.risk.fail), ch.tag, ev.scandal);
    note = ok ? ch.risk.okText : ch.risk.failText;
  } else applyFx(g, here(ch.fx), ch.tag, ev.scandal);
  if (ch.rivalHit && item.rv) { g.momentum[item.rv] = clamp(g.momentum[item.rv] - ch.rivalHit, -10, 10); }
  const after = { share: nationalShares(g)[p], money: g.money, pc: g.pc, mom: g.momentum[p] };
  g.stats.events += 1;
  addNews(g, { kind: 'event', ev: ev.id, ci, note, rv: item.rv, rr: item.rr });
  const fillT = (t, k) => String(t).replace(/\{P\}/g, item.rv ? partyShort(item.rv) : '').replace(/\{R\}/g, item.rr ? REG[item.rr].short[k] : '');
  chron(g, 'event', bi(fillT(ev.title.en, 'en'), fillT(ev.title.lt, 'lt')), after.share >= before.share ? 'good' : 'bad');
  const fu = (FOLLOW_LINKS[ev.id] || {})[ci];
  if (fu && g.week < WEEKS - 1) {
    g.followUps.push({ id: fu, week: g.week + 2 + (Math.random() < 0.4 ? 1 : 0) });
    addCons(g, 'warn', bi(`“${ev.title.en}”: this decision will come back to you.`, `„${ev.title.lt}“: šis sprendimas dar sugrįš.`));
  }
  after.cred = g.cred;
  item.done = { ci, before, after, note, fu: !!fu, cons: (g.consequences || []).slice(c0) };
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
  DP: { welfare: 1.5, populist: 1.5, attack: 0.5 },
  LIT: { business: 1, populist: 1, moderate: 0.5 },
  KS: { traditional: 2.5, security: 0.5, progressive: -2 },
  LZP: { green: 2.5, progressive: 1.5, youth: 1, populist: -1 },
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
  const c0 = (g.consequences || []).length;
  picks.forEach(({ qi, ai, score, clash }) => {
    const ans = clash != null ? CLASHES[clash].answers[ai] : D.questions[qi].answers[ai];
    if (ans.axis) pledge(g, ans.axis[0], ans.axis[1], 'debate');
    if (ans.cred) addCred(g, ans.cred * (score >= 5.5 ? 1 : -1));
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
  const dm = (avg - 6) * 0.8 + (won ? 1 : 0);
  g.momentum[p] = clamp(g.momentum[p] + (dm > 0 ? dm * credMult(g) : dm), -10, 10);
  g.pc += won ? 2 : avg > 6 ? 1 : 0;
  poll.forEach((x) => { if (x.p !== p) g.momentum[x.p] = clamp(g.momentum[x.p] + (x.s - 6) * 0.5, -10, 10); });
  REGIONS.forEach((r) => normalizeRegion(g, r.id));
  const after = nationalShares(g)[p];
  g.stats.debates.push({ idx, avg, rank, won });
  chron(g, 'debate', won ? bi(`Won LRT debate ${idx + 1}`, `Laimėti ${idx + 1}-ieji LRT debatai`) : bi(`LRT debate ${idx + 1}: finished #${rank}`, `${idx + 1}-ieji LRT debatai: ${rank} vieta`), won ? 'good' : rank <= 2 ? 'warn' : 'bad');
  addNews(g, { kind: 'debate', d: idx, winner: poll[0].p, pct: poll[0].pct, rank });
  return { poll, avg, rank, won, delta: after - before, cons: (g.consequences || []).slice(c0) };
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
  if (['LP', 'LS', 'LZP'].includes(q) && ['NA', 'LLRA', 'KS'].includes(X)) aff *= 0.45;
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
  const smd = [];
  for (const r of REGIONS) {
    r.cons.forEach((c, i) => {
      const cid = `${r.id}-${i}`;
      const Lc = g.leans[cid];
      const st = g.stars[cid] || {};
      const cs = candidatesOf(g, cid);
      const cand = ALL_IDS.map((p) => ({ p, s: regions[r.id].shares[p] * Lc[p] * (st[p] != null ? (p === g.player ? 1.1 : 1.06) : 1) * candQ(cs.find((x) => x.p === p)) * Math.exp(ng() * 0.1) }));
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
        e.round = 2;
        e.cand = cand.map((x) => ({ p: x.p, s: x.s }));
        e.sA = A.s; e.sB = B.s;
        e.nA = Math.exp(ng() * 0.05); e.nB = Math.exp(ng() * 0.05);
        e.runoff = { a: A.p, b: B.p };
        const res = runoffTally(g, { damp, lead0: natOrd[0] }, e, null, null, false);
        e.runoff.sa = res.sa; e.runoff.sb = res.sb;
        e.winner = res.winner;
        e.margin = res.margin;
      }
      smd.push(e);
    });
  }
  const seats = Object.fromEntries(ALL_IDS.map((p) => [p, pr[p] || 0]));
  const smdSeats = Object.fromEntries(ALL_IDS.map((p) => [p, 0]));
  smd.forEach((e) => { seats[e.winner] += 1; smdSeats[e.winner] += 1; });
  return { regions, natShares, natVotes, total, eligible, pr, smd, seats, smdSeats, turnout: total / (TOTAL_VOTERS * 1000), damp, lead0: natOrd[0] };
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
// A partner much bigger than you wants the Prime Minister's job for itself.
const sizePenalty = (g, p) => (p === 'KITI' ? 0 : clamp(Math.round((g.election.seats[p] / Math.max(1, g.election.seats[g.player]) - 1.2) * 30), 0, 80));
function willingness(g, p, coal) {
  const S = g.election.seats;
  const largest = ALL_IDS.slice().sort((a, b) => S[b] - S[a])[0];
  let w = compat(g, g.player, p) + (coal.accepted[p] ? 15 : 0) + 7 * (coal.sweet[p] || 0) + (largest === g.player ? 8 : -5) - sizePenalty(g, p) + Math.round(((g.cred == null ? 65 : g.cred) - 60) / 5) + ((g.pacts || []).includes(p) ? 6 : 0);
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
  members.forEach((p) => {
    let rebels = Math.round(S[p] * defectRate * (0.4 + Math.random() * 1.2));
    if (p === g.player && g.unity != null && g.unity < 60) rebels += Math.round(S[p] * ((60 - g.unity) / 260) * (0.7 + Math.random() * 0.6));
    ayes += S[p] - rebels;
  });
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
   Race status helpers
   ============================================================ */
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
  safe: { label: bi('Winning', 'Pirmaujate'), bg: 'rgba(74,222,128,0.18)', fg: '#86EFAC' },
  close: { label: bi('Toss-up', 'Lygi kova'), bg: 'rgba(251,191,36,0.2)', fg: '#FCD34D' },
  behind: { label: bi('Behind', 'Atsiliekate'), bg: 'rgba(251,146,60,0.18)', fg: '#FDBA74' },
  far: { label: bi('Long shot', 'Mažai šansų'), bg: 'rgba(248,113,113,0.18)', fg: '#FCA5A5' },
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
const SAVE_KEY = 'seimas-bfl-save-v6';
function loadSave() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const g = JSON.parse(raw);
    return g && g.v === 6 && g.phase !== 'result' ? g : null;
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
    <div className={`flex flex-col overflow-hidden rounded-sm ${className}`} style={{ boxShadow: '0 4px 14px rgba(0,0,0,.4)' }} aria-hidden="true">
      <span style={{ background: FLAG.y, height: h }} />
      <span style={{ background: FLAG.g, height: h }} />
      <span style={{ background: FLAG.r, height: h }} />
    </div>
  );
}
function Btn({ children, onClick, disabled, kind = 'sun', className = '', ...rest }) {
  return <button type="button" onClick={onClick} disabled={disabled} className={`cx-btn cx-cta cx-${kind} ${className}`} {...rest}>{children}</button>;
}
function Card({ children, className = '', style }) {
  return <section className={`cx-card ${className}`} style={style}>{children}</section>;
}
function CardTitle({ children, sub, right, info }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="min-w-0">
        <h3 className="cx-title text-xl leading-tight inline-flex items-center gap-2"><span className="inline-block rounded-sm shrink-0" style={{ width: 4, height: 18, background: SUN }} />{children}{info}</h3>
        {sub && <p className="text-sm t-muted font-medium mt-1 leading-snug">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
function PartyDot({ p, size = 14 }) {
  return <span className="inline-block rounded-full shrink-0" style={{ width: size, height: size, background: PARTIES[p].color, boxShadow: '0 0 0 1.5px rgba(255,255,255,.55)' }} />;
}
function PartyEmblem({ p, size = 48, label }) {
  const P = PARTIES[p];
  const Icon = P.emblem;
  const uid = useId().replace(/:/g, '');
  const h = Math.round(size * 1.1);
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: h }} aria-hidden="true">
      <svg viewBox="0 0 64 70" width={size} height={h} style={{ display: 'block', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,.5))' }}>
        <defs>
          <linearGradient id={`sr${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2D99A" /><stop offset="1" stopColor="#A9823C" /></linearGradient>
          <linearGradient id={`sf${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mixHex(P.color, '#FFFFFF', 0.18)} /><stop offset="1" stopColor={mixHex(P.color, '#000000', 0.3)} /></linearGradient>
        </defs>
        <path d="M32 2 L60 10 V33 C60 51 47 62 32 68 C17 62 4 51 4 33 V10 Z" fill={`url(#sr${uid})`} />
        <path d="M32 7 L55 13.5 V33 C55 48 44.5 57.5 32 62.5 C19.5 57.5 9 48 9 33 V13.5 Z" fill={`url(#sf${uid})`} />
        <path d="M32 7 L55 13.5 V30 C44 26 20 26 9 30 V13.5 Z" fill="#fff" opacity="0.12" />
      </svg>
      <span className="absolute inset-x-0 top-0 grid place-items-center" style={{ height: h * 0.9 }}><Icon size={Math.round(size * 0.4)} strokeWidth={2.4} color="#fff" /></span>
      {label != null && (
        <span className="absolute -bottom-1 -right-2 cx-pill text-xs px-1.5" style={{ lineHeight: '18px' }}>{label}</span>
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
      <div className="h-full" style={{ width: `${clamp((value / max) * 100, 0, 100)}%`, background: `linear-gradient(180deg, ${mixHex(color, '#FFFFFF', 0.18)}, ${color})`, borderRadius: 999 }} />
      {mark != null && <div className="absolute top-0 bottom-0" style={{ left: `${(mark / max) * 100}%`, width: 2, background: 'rgba(255,255,255,.85)' }} />}
    </div>
  );
}
function Delta({ v, d = 1, pct }) {
  if (v == null || Math.abs(v) < 0.05) return <span className="t-muted">±0</span>;
  return <span style={{ color: v > 0 ? GREEN : RED }}>{v > 0 ? '▲' : '▼'}{pct ? fmtPct(Math.abs(v), d) : nf(Math.abs(v), d)}</span>;
}
/* ============================================================
   Cartoon portraits. Original drawings: stylised avatars, not photos or likenesses.
   ============================================================ */
const SKIN = ['#FBD9BE', '#F4C29F', '#E5A77D', '#C68B63'];
const LOOKS = {
  LSDP: { s: 1, hair: 'side', hc: '#3A2A22', suit: '#27304F' },
  TS: { s: 0, hair: 'short', hc: '#4A3426', suit: '#1E2A46', beard: 'stubble' },
  NA: { s: 1, hair: 'crop', hc: '#2E2620', suit: '#3B3F4A', brow: 2.6 },
  DSVL: { s: 0, hair: 'quiff', hc: '#5A3A24', suit: '#24463A', beard: 'short' },
  LS: { s: 0, hair: 'long', hc: '#D9B26A', top: '#F4F4F5', fem: true },
  LVZS: { s: 1, hair: 'shaved', hc: '#6B5A4A', suit: '#2C4527', beard: 'full', glasses: 'rect' },
  LP: { s: 0, hair: 'messy', hc: '#2D211B', suit: '#3A2D57', glasses: 'round' },
  LLRA: { s: 1, hair: 'receding', hc: '#A1A7AE', suit: '#2B2B3A', mous: true },
  DP: { s: 2, hair: 'side', hc: '#7A7F86', suit: '#3A2F55' },
  LIT: { s: 0, hair: 'swept', hc: '#C9CDD2', suit: '#1E2B4F' },
  KS: { s: 1, hair: 'receding', hc: '#BABEC4', suit: '#4A3322', glasses: 'rect' },
  LZP: { s: 0, hair: 'bun', hc: '#8A4B2A', top: '#0E7C74', fem: true, earring: true },
  KITI: { s: 2, hair: 'short', hc: '#4A4A4A', suit: '#475569' },
  ruta: { s: 0, hair: 'long', hc: '#7A4A2E', top: '#2F6FDE', fem: true, scarf: true, bg: '#FFE08A' },
  host: { s: 1, hair: 'side', hc: '#2A2A2A', suit: '#111827', glasses: 'rect', headset: true, acc: '#DC2626', bg: '#C7D2FE' },
  anchor: { s: 0, hair: 'bob', hc: '#2D211B', top: '#B91C1C', fem: true, acc: '#FDB913', bg: '#FDE68A' },
  croupier: { s: 2, hair: 'slick', hc: '#1F1F1F', suit: '#111111', bow: true, visor: true, acc: '#DC2626', bg: '#86EFAC' },
  detective: { s: 1, hair: 'short', hc: '#3A2A22', suit: '#6B5B45', hat: true, mous: true, acc: '#1F2544', bg: '#D6D3D1' },
  bookie: { s: 0, hair: 'short', hc: '#8A4B2A', suit: '#14532D', cap: '#166534', acc: '#FDB913', bg: '#BBF7D0' },
  seniors: { s: 0, hair: 'bun', hc: '#D4D4D8', top: '#9D4E77', fem: true, glasses: 'round', bg: '#FBCFE8' },
  youth: { s: 2, hair: 'curly', hc: '#2A1C14', top: '#F97316', hood: true, bg: '#FED7AA' },
  farmers: { s: 1, hair: 'short', hc: '#6B4A2A', top: '#4D7C0F', cap: '#3F6212', mous: true, bg: '#D9F99D' },
  business: { s: 0, hair: 'swept', hc: '#3A2A22', suit: '#1E293B', acc: '#0284C7', bg: '#BAE6FD' },
  public: { s: 1, hair: 'bob', hc: '#5A3A24', top: '#FFFFFF', fem: true, glasses: 'rect', steth: true, bg: '#BFDBFE' },
  minority: { s: 1, hair: 'long', hc: '#3A2A22', top: '#BE123C', fem: true, acc: '#FDB913', bg: '#FECDD3' },
  strat: { s: 1, hair: 'swept', hc: '#3A2A22', suit: '#1F2937', glasses: 'rect', acc: '#F5A524', bg: '#FDE68A' },
  pressec: { s: 0, hair: 'bob', hc: '#7A4A2E', top: '#6D28D9', fem: true, earring: true, acc: '#F5A524', bg: '#DDD6FE' },
  digi: { s: 2, hair: 'messy', hc: '#1F1F1F', top: '#0EA5E9', hood: true, bg: '#BAE6FD' },
  fieldorg: { s: 1, hair: 'long', hc: '#A0522D', top: '#15803D', fem: true, acc: '#FDE68A', bg: '#BBF7D0' },
  pollst: { s: 0, hair: 'receding', hc: '#6B7280', suit: '#334155', glasses: 'round', acc: '#38BDF8', bg: '#CBD5E1' },
  fundr: { s: 1, hair: 'bun', hc: '#1F1F1F', top: '#B91C1C', fem: true, acc: '#FDB913', bg: '#FECACA' },
  lawyer: { s: 0, hair: 'side', hc: '#9CA3AF', suit: '#111827', acc: '#6B7280', mous: true, bg: '#E5E7EB' },
};
const CHAR_NAMES = {
  ruta: bi('Rūta, your campaign manager', 'Rūta, jūsų štabo vadovė'), host: bi('LRT debate host', 'LRT debatų vedėjas'),
  anchor: bi('News anchor', 'Žinių vedėja'), croupier: bi('Croupier', 'Krupjė'), detective: bi('Private investigator', 'Privatus detektyvas'),
  bookie: bi('Bookmaker', 'Lažybų agentas'),
  ...Object.fromEntries(STAFF.map((x) => [x.look, x.name])),
};
function mixHex(a, b, k) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, '0')).join('')}`;
}
const HAIR_BACK = {
  long: 'M15.8 52 C13 38 14.5 17 32 15.6 C49.5 17 51 38 48.2 52 Z',
  bob: 'M16.6 44 C14.8 30 18.3 16.2 32 16.2 C45.7 16.2 49.2 30 47.4 44 C44 45.5 41.5 44.5 40.5 42 L23.5 42 C22.5 44.5 20 45.5 16.6 44 Z',
  bun: 'M19 34 C17.6 24 22 17 32 16.6 C42 17 46.4 24 45 34 Z',
};
const HAIR_FRONT = {
  short: 'M18.8 30 C18.5 20 25 16.5 32 16.5 C39 16.5 45.5 20 45.2 30 C42 25.5 38 23.5 32 23.5 C26 23.5 22 25.5 18.8 30 Z',
  side: 'M18.8 30 C18 19 26 15.5 33 16.2 C40 16.8 46 21 45.2 30 C43 25 39.5 22.2 34.5 22.4 C30 22.6 27 21.8 24.6 23.6 C22 25.4 20 27.6 18.8 30 Z',
  crop: 'M19.4 27.5 C19.6 20 25 17 32 17 C39 17 44.4 20 44.6 27.5 C41 24 37 22.6 32 22.6 C27 22.6 23 24 19.4 27.5 Z',
  quiff: 'M18.8 30 C18 21 22.5 17 27.5 16.6 C29.5 12.6 37 12.2 40.2 15.6 C44.2 17.6 46 23 45.2 30 C42 25 38 23 32 23 C26 23 22 25.5 18.8 30 Z',
  shaved: 'M19.6 27 C20 20 25.5 17.3 32 17.3 C38.5 17.3 44 20 44.4 27 C40 23.6 36 22.6 32 22.6 C28 22.6 24 23.6 19.6 27 Z',
  messy: 'M18.8 30 C16.8 22 20.6 16.2 26.6 16.4 L28.6 12.8 L31.8 15.6 L35.2 12.4 L37.2 16.4 C43 16.4 47.2 22 45.2 30 C42 25 38 23 32 23 C26 23 22 25.5 18.8 30 Z',
  swept: 'M18.8 30 C18 20 25 15.6 33 15.8 C41 16 46 21 45.2 30 C44 24.6 40 21.4 34 21 C28 20.6 22 24 18.8 30 Z',
  slick: 'M19 29 C18.6 20 25 16.4 32 16.4 C39 16.4 45.4 20 45 29 C43 24.6 39 22.2 32 22.2 C25 22.2 21 24.6 19 29 Z',
  curly: 'M18.4 31 C14.8 27 17.6 21 21.4 21 C21 16 26.8 13.6 29.4 16.4 C31 12.8 37 13.2 38.2 16.8 C42.2 15.4 46.8 19 45.2 23 C48.2 25 47.6 30 45.6 31 C42 26 37 24 32 24 C27 24 22 26 18.4 31 Z',
  long: 'M18.8 31 C18.4 21 25 16.6 32 16.6 C39 16.6 45.6 21 45.2 31 C41 25 36 22 30 22.4 C25.4 22.8 21.4 26.4 18.8 31 Z',
  bob: 'M18.8 30 C18.6 21 25 16.8 32 16.8 C39 16.8 45.4 21 45.2 30 C44 26.2 42 24.6 40 24.6 L24 24.6 C22 24.6 20 26.2 18.8 30 Z',
  bun: 'M18.8 30 C18.6 21 25 17 32 17 C39 17 45.4 21 45.2 30 C42 25.4 37.6 23.4 32 23.4 C26.4 23.4 22 25.4 18.8 30 Z',
};
function FaceArt({ who, mood = 'happy', ring, uid, shape = 'circle' }) {
  const P = PARTIES[who];
  const lk = LOOKS[who] || LOOKS.KITI;
  const acc = lk.acc || (P ? P.color : SUN);
  const base = P ? P.color : lk.bg ? mixHex(lk.bg, '#334155', 0.35) : '#64748B';
  const skin = SKIN[lk.s || 0];
  const gl = lk.glasses;
  const by = gl ? -1.3 : 0;
  const brow = lk.brow || 1.9;
  const browD = mood === 'sad' ? ['M24.6 28.6 L29.6 26.9', 'M34.4 26.9 L39.4 28.6'] : mood === 'grr' ? ['M24.6 27 L29.6 28.6', 'M34.4 28.6 L39.4 27'] : ['M24.6 28.4 Q27.1 26.8 29.6 28.2', 'M34.4 28.2 Q36.9 26.8 39.4 28.4'];
  const my = lk.mous ? 1 : 0;
  const mouth = {
    happy: <path d={`M27 ${38 + my} Q32 ${43 + my} 37 ${38 + my}`} fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />,
    grin: <path d={`M26.4 ${37.4 + my} Q32 ${45.5 + my} 37.6 ${37.4 + my} Z`} fill="#7F1D1D" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />,
    ok: <path d={`M27.6 ${39.6 + my} Q32 ${41 + my} 36.4 ${39.6 + my}`} fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />,
    sad: <path d={`M27.4 ${41.4 + my} Q32 ${37.6 + my} 36.6 ${41.4 + my}`} fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />,
    wow: <ellipse cx="32" cy={40 + my} rx="2.6" ry="3" fill="#7F1D1D" stroke={INK} strokeWidth="1.3" />,
    grr: <path d={`M27.6 ${40.4 + my} L36.4 ${40.4 + my}`} fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />,
  }[mood] || null;
  const eyeR = mood === 'wow' ? 2.3 : 1.9;
  const top = lk.top;
  return (
    <g>
      <defs>
        <clipPath id={`pc${uid}`}>{shape === 'circle' ? <circle cx="32" cy="32" r="29.5" /> : shape === 'sq' ? <rect x="2" y="2" width="60" height="60" rx="9" /> : <rect x="0" y="0" width="64" height="64" />}</clipPath>
        <radialGradient id={`bg${uid}`} cx="50%" cy="38%" r="70%"><stop offset="0" stopColor={mixHex(base, '#1B2333', 0.35)} /><stop offset="1" stopColor="#0A0D14" /></radialGradient>
        <radialGradient id={`fs${uid}`} cx="42%" cy="36%" r="70%"><stop offset="0" stopColor={mixHex(skin, '#FFFFFF', 0.14)} /><stop offset="0.7" stopColor={skin} /><stop offset="1" stopColor={mixHex(skin, '#6B3A22', 0.28)} /></radialGradient>
        <linearGradient id={`sh${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0.14" /><stop offset="1" stopColor="#000000" stopOpacity="0.32" /></linearGradient>
        <linearGradient id={`hl${uid}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0.22" /><stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" /></linearGradient>
      </defs>
      {shape === 'circle' ? <circle cx="32" cy="32" r="29.5" fill={`url(#bg${uid})`} /> : <rect x={shape === 'sq' ? 2 : 0} y={shape === 'sq' ? 2 : 0} width={shape === 'sq' ? 60 : 64} height={shape === 'sq' ? 60 : 64} rx={shape === 'sq' ? 9 : 0} fill={`url(#bg${uid})`} />}
      <g clipPath={`url(#pc${uid})`}>
        <circle cx="32" cy="74" r="34" fill={base} opacity="0.35" />
        <circle cx="32" cy="30" r="26" fill="#FFFFFF" opacity="0.04" />
        {lk.hood && <path d="M12 64 C10 40 16 13 32 12 C48 13 54 40 52 64 Z" fill={top} stroke={INK} strokeWidth="1.7" />}
        {HAIR_BACK[lk.hair] && <path d={HAIR_BACK[lk.hair]} fill={lk.hc} stroke={INK} strokeWidth="1.7" strokeLinejoin="round" />}
        {lk.hair === 'bun' && <circle cx="32" cy="14.6" r="5.6" fill={lk.hc} stroke={INK} strokeWidth="1.6" />}
        <path d="M11.5 66 C12.5 53 20.5 47.6 32 47.6 C43.5 47.6 51.5 53 52.5 66 Z" fill={lk.suit || top || '#475569'} stroke={INK} strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M11.5 66 C12.5 53 20.5 47.6 32 47.6 C43.5 47.6 51.5 53 52.5 66 Z" fill={`url(#sh${uid})`} />
        <path d="M28 43.5 L28 49.5 Q32 52.5 36 49.5 L36 43.5 Z" fill={mixHex(skin, '#6B3A22', 0.12)} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
        <ellipse cx="32" cy="45.6" rx="5.6" ry="2.2" fill="#000" opacity="0.16" />
        {lk.suit && !lk.hood && (
          <g>
            <path d="M26.8 48.4 L32 58.5 L37.2 48.4 Q32 51.6 26.8 48.4 Z" fill="#FFFFFF" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
            {lk.bow
              ? <path d="M27.6 49.6 L31.4 51.4 L27.6 53.2 Z M36.4 49.6 L32.6 51.4 L36.4 53.2 Z" fill={acc} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
              : <path d="M30.9 50.2 L33.1 50.2 L34 56 L32 59.5 L30 56 Z" fill={acc} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />}
            <path d="M26.8 48.4 L29.2 56 M37.2 48.4 L34.8 56" stroke={INK} strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
          </g>
        )}
        {!lk.suit && !lk.scarf && !lk.hood && <circle cx="32" cy="53.4" r="2.1" fill={acc} stroke={INK} strokeWidth="1.5" />}
        {lk.scarf && (
          <g>
            <rect x="26.5" y="47.4" width="11" height="3" fill={FLAG.y} /><rect x="26.5" y="50.4" width="11" height="3" fill={FLAG.g} /><rect x="26.5" y="53.4" width="11" height="3" fill={FLAG.r} />
            <rect x="26.5" y="47.4" width="11" height="9" fill="none" stroke={INK} strokeWidth="1.5" />
          </g>
        )}
        {lk.steth && <path d="M25 48 C24 55 28 58.5 32 58.5 C36 58.5 40 55 39 48 M32 58.5 L32 61" fill="none" stroke="#334155" strokeWidth="1.3" strokeLinecap="round" />}
        <circle cx="18.8" cy="33.2" r="2.9" fill={skin} stroke={INK} strokeWidth="1.4" />
        <circle cx="45.2" cy="33.2" r="2.9" fill={skin} stroke={INK} strokeWidth="1.4" />
        {lk.earring && <circle cx="18.6" cy="37.4" r="1.4" fill={SUN} stroke={INK} strokeWidth="1" />}
        <ellipse cx="32" cy="31.6" rx="13.2" ry="14.2" fill={`url(#fs${uid})`} stroke={INK} strokeWidth="1.7" />
        {lk.beard && (
          <path
            d="M19.4 33.6 C19.8 44 25 47.4 32 47.4 C39 47.4 44.2 44 44.6 33.6 C43.6 39 41 42.2 38 42.8 C35 43.3 29 43.3 26 42.8 C23 42.2 20.4 39 19.4 33.6 Z"
            fill={lk.hc} opacity={lk.beard === 'stubble' ? 0.28 : 0.95} stroke={lk.beard === 'stubble' ? 'none' : INK} strokeWidth="1.4" strokeLinejoin="round"
          />
        )}
        {(lk.mous || lk.beard === 'full') && <path d="M26.8 37.6 C28.8 35.8 31 36.2 32 37.2 C33 36.2 35.2 35.8 37.2 37.6 C35.6 38.8 33.6 38.6 32 38 C30.4 38.6 28.4 38.8 26.8 37.6 Z" fill={lk.hc} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />}
        {HAIR_FRONT[lk.hair] && (
          <g><path d={HAIR_FRONT[lk.hair]} fill={lk.hc} opacity={lk.hair === 'shaved' ? 0.6 : 1} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" /><path d={HAIR_FRONT[lk.hair]} fill={`url(#hl${uid})`} /></g>
        )}
        {lk.hair === 'receding' && (
          <g fill={lk.hc} stroke={INK} strokeWidth="1.4" strokeLinejoin="round">
            <path d="M18.9 34 C18.4 27.5 19.6 24 22.4 22.2 C21.6 26 21.6 29.6 22.2 34 Z" />
            <path d="M45.1 34 C45.6 27.5 44.4 24 41.6 22.2 C42.4 26 42.4 29.6 41.8 34 Z" />
          </g>
        )}
        {lk.hair === 'receding' && <path d="M27 21.2 Q32 19.6 37 21.2" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />}
        <g transform={`translate(0 ${by})`} fill="none" stroke={mixHex(lk.hc, '#1F2544', 0.55)} strokeWidth={brow} strokeLinecap="round">
          <path d={browD[0]} /><path d={browD[1]} />
        </g>
        {mood === 'grin'
          ? <g fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round"><path d="M24.8 33 Q27 30.6 29.2 33" /><path d="M34.8 33 Q37 30.6 39.2 33" /></g>
          : <g><g fill={INK}><circle cx="27" cy="32.6" r={eyeR} /><circle cx="37" cy="32.6" r={eyeR} /></g><g fill="#fff" opacity="0.85"><circle cx="27.7" cy="31.9" r="0.6" /><circle cx="37.7" cy="31.9" r="0.6" /></g></g>}
        {gl === 'round' && <g fill="#FFFFFF" fillOpacity="0.18" stroke={INK} strokeWidth="1.3"><circle cx="27" cy="32.6" r="4.4" /><circle cx="37" cy="32.6" r="4.4" /><path d="M31.4 32.2 L32.6 32.2" /></g>}
        {gl === 'rect' && <g fill="#FFFFFF" fillOpacity="0.18" stroke={INK} strokeWidth="1.3"><rect x="22.4" y="29.4" width="9" height="6.6" rx="1.8" /><rect x="32.6" y="29.4" width="9" height="6.6" rx="1.8" /><path d="M31.4 31.6 L32.6 31.6" /></g>}
        <circle cx="23.2" cy="37.4" r="2.4" fill="#E07A6E" opacity="0.22" /><circle cx="40.8" cy="37.4" r="2.4" fill="#E07A6E" opacity="0.22" />
        <path d="M32.6 33.4 Q30.9 37 32.9 37.8" fill="none" stroke={mixHex(skin, '#5A2E1A', 0.55)} strokeWidth="1.1" strokeLinecap="round" />
        {mouth}
        {lk.headset && (
          <g fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round">
            <path d="M17.6 31 C17 14 47 14 46.4 31" />
            <rect x="15" y="29" width="5" height="8" rx="2" fill="#334155" />
            <path d="M17.6 36.6 C18.6 41.6 22.4 43 26 42.2" strokeWidth="1.3" />
            <circle cx="26.4" cy="42.1" r="1.4" fill={INK} />
          </g>
        )}
        {lk.visor && <path d="M17.2 25.6 C22 21.6 42 21.6 46.8 25.6 L48.6 28.4 C42 24.6 22 24.6 15.4 28.4 Z" fill="#16A34A" fillOpacity="0.85" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />}
        {lk.hat && (
          <g stroke={INK} strokeWidth="1.6" strokeLinejoin="round">
            <path d="M21 23.6 C20.6 12.4 43.4 12.4 43 23.6 Z" fill="#57534E" />
            <path d="M21.2 21 L42.8 21 L43 23.6 L21 23.6 Z" fill="#1F2544" />
            <ellipse cx="32" cy="24" rx="17.4" ry="3.4" fill="#57534E" />
          </g>
        )}
        {lk.cap && (
          <g stroke={INK} strokeWidth="1.6" strokeLinejoin="round">
            <path d="M18.8 26.4 C18.4 15.6 45.6 15.6 45.2 26.4 Z" fill={lk.cap} />
            <path d="M30 26.2 C36 24 44 24.4 50.6 26.8 C46 29 36 28.8 30 26.2 Z" fill={lk.cap} />
          </g>
        )}
      </g>
      {shape === 'circle' && <circle cx="32" cy="32" r="29.5" fill="none" stroke={ring || 'rgba(255,255,255,0.6)'} strokeWidth={ring ? 3 : 1.6} />}
      {shape === 'sq' && <rect x="2" y="2" width="60" height="60" rx="9" fill="none" stroke={ring || (P ? P.color : 'rgba(255,255,255,0.6)')} strokeWidth={ring ? 3 : 2.2} />}
    </g>
  );
}
// Fill {P} (rival party) and {R} (region) in rival-scandal stories.
function evFill(text, it) {
  return String(text).replace(/\{P\}/g, it && it.rv ? partyShort(it.rv) : '').replace(/\{R\}/g, it && it.rr ? L(REG[it.rr].short) : '');
}
function faceName(who) {
  const P = PARTIES[who];
  return P ? (P.leader || partyShort(who)) : CHAR_NAMES[who] ? L(CHAR_NAMES[who]) : '';
}
function Portrait({ who, size = 56, mood = 'happy', badge, ring, title, square, frameless }) {
  const uid = useId().replace(/:/g, '');
  const P = PARTIES[who];
  const fluid = typeof size === 'string';
  const num = fluid ? 96 : size;
  return (
    <span className="relative inline-block shrink-0 align-middle" style={fluid ? { width: size, aspectRatio: '1 / 1', display: 'block' } : { width: size, height: size }}>
      <svg viewBox="0 0 64 64" width={fluid ? '100%' : size} height={fluid ? '100%' : size} role="img" aria-label={title || faceName(who)} style={{ display: 'block' }}>
        <FaceArt who={who} mood={mood} ring={ring} uid={uid} shape={frameless ? 'full' : square ? 'sq' : 'circle'} />
      </svg>
      {badge && P && who !== 'KITI' && (
        <span className="absolute" style={{ right: -Math.round(num * 0.1), bottom: -Math.round(num * 0.1) }}>
          <PartyEmblem p={who} size={Math.max(18, Math.round(num * 0.36))} />
        </span>
      )}
    </span>
  );
}
// A portrait placed inside another SVG (the map), centred on (x, y) in that SVG's units.
function MapFace({ who, x, y, size, mood = 'happy', ring }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg x={x - size / 2} y={y - size / 2} width={size} height={size} viewBox="0 0 64 64" overflow="visible" aria-hidden="true">
      <circle cx="32" cy="36" r="29.5" fill={INK} />
      <FaceArt who={who} mood={mood} ring={ring} uid={uid} />
    </svg>
  );
}
function Advisor({ size = 48 }) {
  return <Portrait who="ruta" size={size} />;
}
function FaceRow({ ids, size = 34, overlap = 0.28 }) {
  return (
    <div className="flex items-center" aria-hidden="true">
      {ids.map((p, i) => (
        <span key={p} style={{ marginLeft: i ? -Math.round(size * overlap) : 0, zIndex: ids.length - i }} className="relative"><Portrait who={p} size={size} /></span>
      ))}
    </div>
  );
}

/* ============================================================
   Landmark scenes (original illustrations of real places)
   ============================================================ */
const SCENE_CAP = {
  vilnius: bi('Gediminas Tower, Vilnius', 'Gedimino pilies bokštas, Vilnius'),
  trakai: bi('Trakai Island Castle', 'Trakų salos pilis'),
  kaunas: bi('Kaunas Castle', 'Kauno pilis'),
  klaipeda: bi('Klaipėda harbour and the Meridianas', 'Klaipėdos uostas ir „Meridianas“'),
  crosses: bi('Hill of Crosses, near Šiauliai', 'Kryžių kalnas prie Šiaulių'),
  lakes: bi('Lakes and pine forests', 'Ežerai ir pušynai'),
  fields: bi('Farmland and a stork’s nest', 'Laukai ir gandralizdis'),
  town: bi('A Lithuanian town square', 'Lietuvos miestelio aikštė'),
  world: bi('Lithuanians around the world', 'Lietuviai visame pasaulyje'),
  seimas: bi('The Seimas Palace, Vilnius', 'Seimo rūmai, Vilnius'),
  palace: bi('The Presidential Palace, Vilnius', 'Prezidentūra, Vilnius'),
  studio: bi('LRT debate studio', 'LRT debatų studija'),
  night: bi('Election night at the Seimas', 'Rinkimų naktis prie Seimo'),
};
const REGION_SCENE = { VNO: 'vilnius', VLC: 'trakai', KNS: 'kaunas', KNC: 'fields', KLP: 'klaipeda', TEL: 'lakes', TAU: 'fields', SIA: 'crosses', PAN: 'town', UTE: 'lakes', ALY: 'town', MAR: 'fields', ABR: 'world' };
const SW = { stroke: INK, strokeWidth: 1.8, strokeLinejoin: 'round' };
function SkyCloud({ x, y, s = 1 }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 14 C-1 7 6 3 11 6 C13 -1 25 -2 28 5 C34 3 39 8 37 14 Z" fill="#F6DCCB" opacity="0.42" />;
}
function TriFlag({ x, y, w = 18, pole = 22 }) {
  const h = w * 0.6;
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + pole} stroke={INK} strokeWidth="2" />
      <rect x={x} y={y} width={w} height={h / 3} fill={FLAG.y} /><rect x={x} y={y + h / 3} width={w} height={h / 3} fill={FLAG.g} /><rect x={x} y={y + (2 * h) / 3} width={w} height={h / 3} fill={FLAG.r} />
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={INK} strokeWidth="1.6" />
    </g>
  );
}
function Pine({ x, y, s = 1, c = '#1F7A4D' }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -26 L8 -12 L5 -12 L11 -2 L-11 -2 L-5 -12 L-8 -12 Z M-1.5 -2 L-1.5 4 L1.5 4 L1.5 -2" fill={c} stroke={INK} strokeWidth={1.8 / s} strokeLinejoin="round" />;
}
function Bricks({ x, y, w, h }) {
  const rows = [];
  for (let yy = y + 6; yy < y + h - 2; yy += 7) rows.push(<line key={yy} x1={x + 3} x2={x + w - 3} y1={yy} y2={yy} stroke="#7C2D12" strokeWidth="1" opacity="0.35" />);
  return <g>{rows}</g>;
}
function Battlement({ x, y, w, n, fill }) {
  const step = w / (2 * n - 1);
  let d = `M${x} ${y + 6}`;
  for (let i = 0; i < n; i++) {
    const x0 = x + i * 2 * step;
    d += ` L${x0} ${y} L${x0 + step} ${y} L${x0 + step} ${y + 6}`;
    if (i < n - 1) d += ` L${x0 + 2 * step} ${y + 6}`;
  }
  d += ' Z';
  return <path d={d} fill={fill} {...SW} strokeWidth="2" />;
}
function sceneRand(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
function SceneArt({ kind, uid, parties }) {
  const night = kind === 'night' || kind === 'studio';
  const sky = night ? ['#070B1C', '#1B2150', '#353A70'] : ['#22365A', '#71819F', '#E9AE7E'];
  const water = (y, c = '#3E6E9A') => (
    <g>
      <rect x="-2" y={y} width="364" height={142 - y} fill={c} stroke={INK} strokeWidth="2.4" />
      {[0, 1, 2].map((i) => <path key={i} d={`M${30 + i * 110} ${y + 14 + (i % 2) * 10} q8 -5 16 0 t16 0`} fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />)}
    </g>
  );
  const ground = (c = '#5C8F48', d = 'M-2 112 C60 99 120 104 180 109 C240 114 300 100 362 105 L362 142 L-2 142 Z') => <path d={d} fill={c} {...SW} />;
  let body = null;
  if (kind === 'vilnius') {
    body = (
      <g>
        {[[8, 78, 26, 34], [36, 70, 22, 42], [210, 74, 26, 38], [300, 80, 30, 32], [334, 72, 26, 40]].map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} fill="#A9B4C4" stroke={INK} strokeWidth="1.8" />)}
        <rect x="246" y="46" width="16" height="66" fill="#D3D9E2" stroke={INK} strokeWidth="2" />
        <path d="M244 46 L254 30 L264 46 Z" fill="#D3D9E2" {...SW} strokeWidth="2" />
        <rect x="250" y="56" width="8" height="10" rx="4" fill="#94A3B8" stroke={INK} strokeWidth="1.4" />
        <path d="M266 112 L266 72 L298 72 L298 112 Z" fill="#D3D9E2" stroke={INK} strokeWidth="2" />
        <path d="M262 72 L282 58 L302 72 Z" fill="#C6CDD8" {...SW} strokeWidth="2" />
        {[270, 278, 286, 294].map((x) => <line key={x} x1={x} x2={x} y1="76" y2="110" stroke={INK} strokeWidth="1.4" opacity="0.5" />)}
        <path d="M64 114 C84 82 104 68 140 66 C176 68 196 84 216 114 Z" fill="#4E8642" {...SW} />
        {[[82, 98], [96, 86], [190, 92], [204, 104], [112, 78]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="7" fill="#2E7448" stroke={INK} strokeWidth="1.8" />)}
        <path d="M118 112 C126 98 134 86 140 80" fill="none" stroke="#B9A57E" strokeWidth="3" strokeLinecap="round" />
        <rect x="126" y="34" width="28" height="34" fill="#A2492A" stroke={INK} strokeWidth="2.4" />
        <Bricks x={126} y={34} w={28} h={34} />
        <line x1="134" y1="36" x2="134" y2="66" stroke={INK} strokeWidth="1.2" opacity="0.4" /><line x1="146" y1="36" x2="146" y2="66" stroke={INK} strokeWidth="1.2" opacity="0.4" />
        <path d="M136 52 L136 46 Q140 42 144 46 L144 52 Z" fill="#1F2544" />
        <Battlement x={124} y={28} w={32} n={4} fill="#A2492A" />
        <TriFlag x={140} y={6} w={20} pole={22} />
      </g>
    );
  } else if (kind === 'trakai') {
    body = (
      <g>
        <path d="M-2 92 C40 84 80 88 120 86 C170 84 220 90 260 86 C300 82 330 88 362 86 L362 100 L-2 100 Z" fill="#2B6A43" {...SW} />
        {[20, 46, 300, 326, 350].map((x, i) => <Pine key={i} x={x} y={90} s={0.8} />)}
        {water(96)}
        <ellipse cx="200" cy="104" rx="96" ry="9" fill="#4E8642" stroke={INK} strokeWidth="2.2" />
        <rect x="132" y="66" width="136" height="36" fill="#A2492A" stroke={INK} strokeWidth="2.4" />
        <Bricks x={132} y={66} w={136} h={36} />
        <Battlement x={132} y={60} w={136} n={9} fill="#A2492A" />
        {[[118, 58], [266, 58]].map(([x, y]) => (
          <g key={x}>
            <rect x={x} y={y} width="16" height={102 - y} fill="#934025" stroke={INK} strokeWidth="2.2" />
            <path d={`M${x - 3} ${y} L${x + 8} ${y - 18} L${x + 19} ${y} Z`} fill="#9F1D20" {...SW} strokeWidth="2" />
          </g>
        ))}
        <rect x="186" y="34" width="30" height="68" fill="#A2492A" stroke={INK} strokeWidth="2.4" />
        <Bricks x={186} y={34} w={30} h={68} />
        <path d="M182 34 L201 10 L220 34 Z" fill="#9F1D20" {...SW} />
        {[194, 204].map((x) => <path key={x} d={`M${x} 52 L${x} 46 Q${x + 2.5} 43 ${x + 5} 46 L${x + 5} 52 Z`} fill="#1F2544" />)}
        <path d="M200 102 L200 112" stroke={INK} strokeWidth="2" />
        <path d="M30 104 L118 102" stroke="#8B5A2B" strokeWidth="4" strokeLinecap="round" />
        {[44, 66, 88, 110].map((x) => <line key={x} x1={x} x2={x} y1="103" y2="112" stroke={INK} strokeWidth="2" />)}
        <path d="M300 122 L332 122 L326 130 L306 130 Z" fill="#FFFFFF" {...SW} strokeWidth="2" />
        <path d="M316 120 L316 100 L330 118 Z" fill="#FFFFFF" {...SW} strokeWidth="2" />
      </g>
    );
  } else if (kind === 'kaunas') {
    body = (
      <g>
        <path d="M-2 96 C50 88 90 92 140 94 C200 96 260 86 362 90 L362 142 L-2 142 Z" fill="#5C8F48" {...SW} />
        <path d="M200 142 C220 124 270 112 362 110 L362 142 Z" fill="#4FA3E0" {...SW} />
        <path d="M250 128 q8 -5 16 0 t16 0" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <rect x="282" y="40" width="14" height="56" fill="#D3D9E2" stroke={INK} strokeWidth="2" />
        <path d="M286 40 L286 32 L292 32 L292 40" fill="#D3D9E2" stroke={INK} strokeWidth="1.8" />
        <path d="M289 24 L289 32 M285.5 27 L292.5 27" stroke={INK} strokeWidth="2" />
        <rect x="150" y="70" width="100" height="36" fill="#A2492A" stroke={INK} strokeWidth="2.4" />
        <Bricks x={150} y={70} w={100} h={36} />
        <Battlement x={150} y={64} w={100} n={7} fill="#A2492A" />
        <rect x="250" y="58" width="22" height="48" fill="#934025" stroke={INK} strokeWidth="2.2" />
        <path d="M246 58 L261 40 L276 58 Z" fill="#9F1D20" {...SW} strokeWidth="2" />
        <rect x="108" y="44" width="44" height="62" rx="4" fill="#A2492A" stroke={INK} strokeWidth="2.4" />
        <Bricks x={108} y={44} w={44} h={62} />
        {[118, 130, 142].map((x) => <line key={x} x1={x} y1="46" x2={x} y2="104" stroke={INK} strokeWidth="1.1" opacity="0.35" />)}
        <path d="M100 46 L130 10 L160 46 Z" fill="#9F1D20" {...SW} />
        <path d="M124 70 L124 62 Q130 56 136 62 L136 70 Z" fill="#1F2544" />
        <TriFlag x={130} y={-2} w={16} pole={14} />
        <path d="M-2 116 C60 110 120 114 200 120 L200 142 L-2 142 Z" fill="#4E8642" {...SW} />
      </g>
    );
  } else if (kind === 'klaipeda') {
    body = (
      <g>
        {[[250, 40], [280, 50]].map(([x, y]) => <path key={x} d={`M${x} 102 L${x} ${y} L${x + 34} ${y} M${x} ${y + 10} L${x + 22} ${y} M${x + 30} ${y} L${x + 30} ${y + 18}`} fill="none" stroke="#C2962A" strokeWidth="3" strokeLinecap="round" />)}
        <path d="M-2 104 C20 80 60 74 96 86 C110 92 116 98 120 104 Z" fill="#C7AD79" {...SW} />
        {[30, 62, 84].map((x) => <path key={x} d={`M${x} 86 l-3 -8 M${x + 3} 86 l1 -9 M${x + 6} 86 l4 -7`} stroke="#4D7C0F" strokeWidth="1.8" strokeLinecap="round" />)}
        <path d="M44 86 L48 40 L60 40 L64 86 Z" fill="#FFFFFF" {...SW} />
        {[48, 64].map((y) => <path key={y} d={`M${46.5 - (y - 40) * 0.04} ${y} L${61.5 + (y - 40) * 0.04} ${y} L${62 + (y - 40) * 0.05} ${y + 8} L${46 - (y - 40) * 0.05} ${y + 8} Z`} fill="#DC2626" />)}
        <rect x="45" y="30" width="18" height="10" fill="#F2D58C" stroke={INK} strokeWidth="2" />
        <path d="M43 30 L54 20 L65 30 Z" fill="#DC2626" {...SW} strokeWidth="2" />
        {water(102, '#335C88')}
        <path d="M150 104 L300 104 L286 124 L166 124 Z" fill="#1F2544" {...SW} />
        <path d="M168 112 L284 112" stroke="#FFFFFF" strokeWidth="2" />
        {[186, 226, 266].map((x, i) => (
          <g key={x}>
            <line x1={x} y1="104" x2={x} y2={i === 1 ? 18 : 28} stroke={INK} strokeWidth="2.4" />
            <path d={`M${x - 14} ${i === 1 ? 26 : 36} L${x + 14} ${i === 1 ? 26 : 36} L${x + 17} ${i === 1 ? 54 : 60} L${x - 17} ${i === 1 ? 54 : 60} Z`} fill="#FFFFFF" {...SW} strokeWidth="2" />
            <path d={`M${x - 16} ${i === 1 ? 60 : 66} L${x + 16} ${i === 1 ? 60 : 66} L${x + 19} ${i === 1 ? 88 : 92} L${x - 19} ${i === 1 ? 88 : 92} Z`} fill="#FFFFFF" {...SW} strokeWidth="2" />
          </g>
        ))}
        <path d="M150 104 L140 84 L186 98" fill="none" stroke={INK} strokeWidth="1.6" />
        <TriFlag x={292} y={78} w={14} pole={26} />
      </g>
    );
  } else if (kind === 'crosses') {
    const rnd = sceneRand(7);
    const crosses = [];
    for (let i = 0; i < 64; i++) {
      const x = 46 + rnd() * 268;
      const surf = 60 + Math.pow((x - 180) / 150, 2) * 58;
      const y = surf + 8 + rnd() * (122 - surf) * 0.75;
      const s = 5 + ((y - 60) / 62) * 9 + rnd() * 3;
      crosses.push([x, y, s]);
    }
    crosses.sort((a, b) => a[1] - b[1]);
    body = (
      <g>
        {ground('#9BD37A', 'M-2 118 C60 112 120 116 180 116 C240 116 300 110 362 114 L362 142 L-2 142 Z')}
        <path d="M28 124 C60 76 120 58 180 58 C240 58 300 76 332 124 Z" fill="#93A665" {...SW} />
        <path d="M172 124 L176 64 L184 64 L188 124 Z" fill="#B9A57E" stroke={INK} strokeWidth="1.6" />
        {crosses.map(([x, y, s], i) => (
          <path key={i} d={`M${x.toFixed(1)} ${y.toFixed(1)} l0 ${(-s * 1.6).toFixed(1)} M${(x - s * 0.5).toFixed(1)} ${(y - s * 1.15).toFixed(1)} l${s.toFixed(1)} 0`} stroke={i % 5 === 0 ? '#5B3A1E' : INK} strokeWidth={Math.max(1.4, s / 5)} strokeLinecap="round" />
        ))}
        <path d="M178 54 L178 20 M168 30 L188 30" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      </g>
    );
  } else if (kind === 'lakes') {
    body = (
      <g>
        <path d="M-2 86 C40 70 90 74 140 82 C190 90 240 72 290 74 C320 76 340 80 362 78 L362 104 L-2 104 Z" fill="#2B6A43" {...SW} />
        {[12, 34, 56, 78, 214, 236, 258, 280, 302, 324, 346].map((x, i) => <Pine key={x} x={x} y={92 - (i % 3) * 4} s={0.9 + (i % 2) * 0.2} c={i % 2 ? '#245E40' : '#1C5136'} />)}
        <rect x="120" y="58" width="44" height="40" fill="#A16207" stroke={INK} strokeWidth="2.2" />
        {[128, 136, 144, 152].map((x) => <line key={x} x1={x} x2={x} y1="60" y2="96" stroke={INK} strokeWidth="1" opacity="0.35" />)}
        <path d="M114 60 L142 40 L170 60 Z" fill="#78350F" {...SW} strokeWidth="2" />
        <rect x="136" y="22" width="12" height="22" fill="#A16207" stroke={INK} strokeWidth="2" />
        <path d="M133 24 L142 8 L151 24 Z" fill="#78350F" {...SW} strokeWidth="2" />
        <path d="M142 2 L142 8 M139 4 L145 4" stroke={INK} strokeWidth="1.8" />
        <path d="M136 98 L136 84 Q142 78 148 84 L148 98 Z" fill="#1F2544" />
        {water(100)}
        <path d="M222 120 L262 120 L256 127 L228 127 Z" fill="#B45309" {...SW} strokeWidth="2" />
        <path d="M240 120 L246 108" stroke={INK} strokeWidth="2" />
      </g>
    );
  } else if (kind === 'fields') {
    body = (
      <g>
        <path d="M-2 92 C60 84 140 88 200 90 C260 92 320 84 362 86 L362 142 L-2 142 Z" fill="#C99F3C" {...SW} />
        <path d="M-2 108 C80 98 160 104 240 108 C290 110 330 104 362 104 L362 142 L-2 142 Z" fill="#6C962E" {...SW} />
        <path d="M-2 126 C90 118 200 124 362 120 L362 142 L-2 142 Z" fill="#557D1F" {...SW} />
        {[30, 60, 90].map((x) => <path key={x} d={`M${x} 98 q20 -4 40 0`} fill="none" stroke="#A16207" strokeWidth="1.6" opacity="0.6" />)}
        <rect x="40" y="62" width="60" height="32" fill="#FFFFFF" stroke={INK} strokeWidth="2.2" />
        <path d="M34 64 L70 40 L106 64 Z" fill="#B91C1C" {...SW} />
        <rect x="64" y="74" width="12" height="20" fill="#92400E" stroke={INK} strokeWidth="1.8" />
        <rect x="46" y="70" width="12" height="10" fill="#8FB3DA" stroke={INK} strokeWidth="1.8" /><rect x="82" y="70" width="12" height="10" fill="#8FB3DA" stroke={INK} strokeWidth="1.8" />
        <line x1="250" y1="108" x2="250" y2="44" stroke="#78350F" strokeWidth="4" />
        <ellipse cx="250" cy="44" rx="18" ry="6" fill="#A16207" stroke={INK} strokeWidth="2" />
        <path d="M244 38 C242 28 250 24 256 28 L262 30 L256 32 C258 36 256 40 250 40 Z" fill="#FFFFFF" {...SW} strokeWidth="1.8" />
        <path d="M247 37 C250 40 256 39 257 36 L252 36 Z" fill={INK} />
        <path d="M261 29 L272 32 L261 31.5 Z" fill="#DC2626" stroke={INK} strokeWidth="1" />
        <circle cx="257" cy="28.5" r="1" fill={INK} />
        {[[160, 104], [196, 108], [300, 112]].map(([x, y]) => (
          <g key={x}>
            <circle cx={x} cy={y} r="11" fill="#C2962A" stroke={INK} strokeWidth="2.2" />
            <path d={`M${x} ${y} m-5 0 a5 5 0 1 1 5 5 a3 3 0 1 1 -3 -3`} fill="none" stroke="#A16207" strokeWidth="1.6" />
          </g>
        ))}
      </g>
    );
  } else if (kind === 'town') {
    const houses = [[6, 78, 38, '#FCA5A5'], [44, 72, 36, '#FDE68A'], [234, 74, 38, '#BAE6FD'], [272, 80, 36, '#BBF7D0'], [308, 72, 40, '#FBCFE8']];
    body = (
      <g>
        {houses.map(([x, y, w, c]) => (
          <g key={x}>
            <rect x={x} y={y} width={w} height={112 - y} fill={c} stroke={INK} strokeWidth="2" />
            <path d={`M${x - 3} ${y} L${x + w / 2} ${y - 16} L${x + w + 3} ${y} Z`} fill="#B91C1C" {...SW} strokeWidth="2" />
            <rect x={x + w / 2 - 5} y={y + 10} width="10" height="10" fill="#FFFFFF" stroke={INK} strokeWidth="1.6" />
          </g>
        ))}
        <rect x="112" y="56" width="104" height="56" fill="#D3D9E2" stroke={INK} strokeWidth="2.4" />
        <path d="M108 58 L164 34 L220 58 Z" fill="#C6CDD8" {...SW} />
        {[[112, 22], [196, 22]].map(([x, y]) => (
          <g key={x}>
            <rect x={x} y={y + 12} width="20" height={100 - y} fill="#D3D9E2" stroke={INK} strokeWidth="2.2" />
            <path d={`M${x - 2} ${y + 12} L${x + 10} ${y - 12} L${x + 22} ${y + 12} Z`} fill="#334155" {...SW} strokeWidth="2" />
            <path d={`M${x + 10} ${y - 20} L${x + 10} ${y - 12} M${x + 6.5} ${y - 17} L${x + 13.5} ${y - 17}`} stroke={INK} strokeWidth="1.8" />
            <path d={`M${x + 6} ${y + 30} L${x + 6} ${y + 24} Q${x + 10} ${y + 19} ${x + 14} ${y + 24} L${x + 14} ${y + 30} Z`} fill="#1F2544" />
          </g>
        ))}
        <path d="M152 112 L152 86 Q164 74 176 86 L176 112 Z" fill="#92400E" stroke={INK} strokeWidth="2" />
        <circle cx="164" cy="66" r="6" fill="#8FB3DA" stroke={INK} strokeWidth="1.8" />
        <path d="M-2 112 L362 112 L362 142 L-2 142 Z" fill="#8D8885" {...SW} />
        {[20, 60, 100, 140, 180, 220, 260, 300, 340].map((x) => <path key={x} d={`M${x} 122 l12 0 M${x + 18} 132 l12 0`} stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" />)}
      </g>
    );
  } else if (kind === 'world') {
    body = (
      <g>
        <circle cx="180" cy="120" r="78" fill="#3B82F6" {...SW} />
        <path d="M120 74 C136 62 158 60 170 70 C182 78 176 92 162 94 C150 96 146 108 134 104 C122 100 112 86 120 74 Z" fill="#4ADE80" {...SW} strokeWidth="2" />
        <path d="M196 66 C214 58 238 66 244 82 C250 96 236 104 224 98 C214 94 206 100 198 92 C190 84 186 72 196 66 Z" fill="#4ADE80" {...SW} strokeWidth="2" />
        <path d="M150 120 C162 112 184 114 192 124 C198 134 186 142 170 142 C156 142 144 130 150 120 Z" fill="#4ADE80" {...SW} strokeWidth="2" />
        <path d="M40 60 C90 20 160 22 214 40" fill="none" stroke={INK} strokeWidth="2" strokeDasharray="5 6" strokeLinecap="round" />
        <g transform="translate(236 46) rotate(18)">
          <path d="M-22 0 C-22 -4 18 -5 24 -1 C27 1 24 3 20 3 L-22 3 Z" fill="#FFFFFF" {...SW} strokeWidth="2" />
          <path d="M-4 -1 L-14 -16 L-6 -16 L8 -1 Z M-4 3 L-12 14 L-5 14 L8 3 Z M-20 -1 L-26 -10 L-21 -10 L-14 -1 Z" fill="#E2E8F0" {...SW} strokeWidth="1.8" />
        </g>
        <TriFlag x={204} y={58} w={16} pole={18} />
        <path d="M56 58 c-4 -6 4 -10 6 -4 c2 -6 10 -2 6 4 l-6 6 z" fill="#F87171" stroke={INK} strokeWidth="1.5" />
      </g>
    );
  } else if (kind === 'seimas' || kind === 'night') {
    const win = night ? '#FDE68A' : '#93C5FD';
    body = (
      <g>
        <rect x="52" y="70" width="98" height="44" fill="#C6CDD8" stroke={INK} strokeWidth="2.4" />
        <rect x="230" y="70" width="98" height="44" fill="#C6CDD8" stroke={INK} strokeWidth="2.4" />
        {[80, 94].map((y) => (
          <g key={y}>
            <rect x="58" y={y} width="86" height="7" fill={win} stroke={INK} strokeWidth="1.4" />
            <rect x="236" y={y} width="86" height="7" fill={win} stroke={INK} strokeWidth="1.4" />
          </g>
        ))}
        <rect x="150" y="28" width="80" height="86" fill="#D3D9E2" stroke={INK} strokeWidth="2.6" />
        {[158, 170, 182, 194, 206, 218].map((x) => <rect key={x} x={x} y="36" width="6" height="66" fill={win} stroke={INK} strokeWidth="1.2" />)}
        <rect x="146" y="22" width="88" height="8" fill="#CBD5E1" stroke={INK} strokeWidth="2.2" />
        <TriFlag x={190} y={-2} w={22} pole={24} />
        <path d="M-2 114 L362 114 L362 142 L-2 142 Z" fill={night ? '#475569' : '#D6D3D1'} {...SW} />
        {[118, 124, 130].map((y, i) => <line key={y} x1={160 - i * 8} x2={220 + i * 8} y1={y} y2={y} stroke={INK} strokeWidth="1.6" opacity="0.5" />)}
        {[24, 336].map((x) => <g key={x}><line x1={x} y1="114" x2={x} y2="56" stroke={INK} strokeWidth="2" /><rect x={x} y="56" width="20" height="13" fill="#1D4ED8" stroke={INK} strokeWidth="1.6" />{[0, 1, 2, 3, 4, 5].map((k) => <circle key={k} cx={x + 10 + 4 * Math.cos(k * 1.047)} cy={62.5 + 4 * Math.sin(k * 1.047)} r="0.9" fill={SUN} />)}</g>)}
      </g>
    );
  } else if (kind === 'palace') {
    body = (
      <g>
        <rect x="40" y="58" width="280" height="56" fill="#D7C799" stroke={INK} strokeWidth="2.4" />
        <rect x="36" y="50" width="288" height="10" fill="#CBD5E1" stroke={INK} strokeWidth="2.2" />
        {[54, 78, 102, 238, 262, 286].map((x) => [66, 88].map((y) => <rect key={`${x}${y}`} x={x} y={y} width="14" height="14" fill="#8FB3DA" stroke={INK} strokeWidth="1.6" />))}
        <path d="M136 50 L180 26 L224 50 Z" fill="#E2D6AE" {...SW} />
        <rect x="136" y="50" width="88" height="64" fill="#E2D6AE" stroke={INK} strokeWidth="2.2" />
        {[144, 158, 172, 186, 200, 214].map((x) => <rect key={x} x={x - 3} y="56" width="8" height="58" fill="#FFFFFF" stroke={INK} strokeWidth="1.5" />)}
        <TriFlag x={180} y={4} w={18} pole={22} />
        <path d="M-2 114 L362 114 L362 142 L-2 142 Z" fill="#8D8885" {...SW} />
        {[20, 330].map((x) => <circle key={x} cx={x} cy="108" r="12" fill="#2E7448" stroke={INK} strokeWidth="2" />)}
      </g>
    );
  } else if (kind === 'studio') {
    const ps = (parties || []).slice(0, 5);
    const n = Math.max(ps.length, 1);
    body = (
      <g>
        {[60, 180, 300].map((x) => <path key={x} d={`M${x - 8} -2 L${x + 8} -2 L${x + 46} 120 L${x - 46} 120 Z`} fill="#FFFFFF" opacity="0.08" />)}
        <rect x="120" y="14" width="120" height="44" rx="6" fill="#0F172A" stroke="#8FB3DA" strokeWidth="2.4" />
        <text x="180" y="40" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900" style={F_DISPLAY}>LRT</text>
        <text x="180" y="52" textAnchor="middle" fill="#8FB3DA" fontSize="8" fontWeight="800" letterSpacing="2">{tt('DEBATE', 'DEBATAI')}</text>
        <path d="M-2 112 L362 112 L362 142 L-2 142 Z" fill="#1C2140" stroke="#4B5288" strokeWidth="2" />
        {ps.map((p, i) => {
          const x = 30 + ((300 / n) * (i + 0.5));
          return (
            <g key={p}>
              <path d={`M${x - 20} 84 L${x + 20} 84 L${x + 16} 116 L${x - 16} 116 Z`} fill={PARTIES[p].color} stroke={INK} strokeWidth="2.2" />
              <rect x={x - 22} y="80" width="44" height="6" fill="#E2E8F0" stroke={INK} strokeWidth="1.8" />
              <circle cx={x} cy="100" r="6" fill="#FFFFFF" stroke={INK} strokeWidth="1.6" />
            </g>
          );
        })}
      </g>
    );
  }
  return (
    <g>
      <defs>
        <linearGradient id={`sk${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="0.6" stopColor={sky[1]} /><stop offset="1" stopColor={sky[2]} /></linearGradient>
        <radialGradient id={`sn${uid}`} cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#FFE7B8" stopOpacity="0.9" /><stop offset="0.35" stopColor="#FFC98A" stopOpacity="0.45" /><stop offset="1" stopColor="#FFC98A" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x="-2" y="-2" width="364" height="144" fill={`url(#sk${uid})`} />
      {night ? (
        <g>
          {[[30, 18], [70, 34], [110, 12], [250, 22], [290, 40], [330, 14], [160, 30]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 2 ? 1.4 : 2} fill="#F2D58C" />)}
          {kind === 'night' && <path d="M312 22 a14 14 0 1 0 10 24 a11 11 0 1 1 -10 -24 Z" fill="#F2D58C" stroke={INK} strokeWidth="2" />}
        </g>
      ) : (
        <g>
          <circle cx="318" cy="40" r="46" fill={`url(#sn${uid})`} />
          <circle cx="318" cy="40" r="11" fill="#FFE9C2" />
          <SkyCloud x={24} y={18} s={1.1} />
          <SkyCloud x={196} y={10} s={0.85} />
        </g>
      )}
      {body}
    </g>
  );
}
function Scene({ kind, h = 128, caption = true, className = '', parties, children, flush, kb }) {
  const uid = useId().replace(/:/g, '');
  const cap = caption && SCENE_CAP[kind] ? L(SCENE_CAP[kind]) : null;
  return (
    <div className={`cx-scene relative overflow-hidden ${className}`} style={{ height: h == null ? undefined : h, border: flush ? 'none' : `1px solid ${LINE2}`, borderRadius: flush ? 0 : 14, background: '#0B0F16', boxShadow: flush ? 'none' : SHADOW }}>
      <svg viewBox="0 0 360 140" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" role="img" aria-label={cap || ''} style={{ display: 'block' }} className={kb ? 'cx-kb' : undefined}>
        <SceneArt kind={kind} uid={uid} parties={parties} />
      </svg>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(40,60,110,.22), rgba(150,80,30,.14))', mixBlendMode: 'multiply' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 52%, rgba(0,0,0,.55) 100%), linear-gradient(0deg, rgba(8,10,15,.6), rgba(8,10,15,0) 42%)' }} />
      {cap && <span className="absolute left-2 bottom-2 px-2 py-0.5 text-xs font-semibold rounded" style={{ background: 'rgba(7,9,13,.75)', color: '#E5E7EB', border: `1px solid ${LINE}` }}>{cap}</span>}
      {children}
    </div>
  );
}
function Coach({ title, children, actions, onSkip, className = '', essential }) {
  if (!ADVISOR && !essential) return null;
  return (
    <div className={`cx-card cx-cream p-3 sbl-pop ${className}`} role="note">
      <div className="flex gap-3 items-start">
        {ADVISOR ? <Advisor size={46} /> : <span className="grid place-items-center rounded-full shrink-0 cx-panel2" style={{ width: 40, height: 40, border: `1px solid ${LINE}` }}><Info size={20} strokeWidth={2.6} /></span>}
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
  const host = typeof document !== 'undefined' ? document.getElementById('sbl-portal') : null;
  const el = (
    <div className={`fixed inset-0 ${z} flex flex-col justify-end lg:justify-center lg:items-center lg:p-8`} role="dialog" aria-modal="true" aria-label={label}>
      <div className="absolute inset-0 sbl-fade" style={{ background: 'rgba(5,7,11,0.72)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }} onClick={onClose || undefined} />
      <div
        className="sbl-sheet sbl-scroll relative w-full max-w-lg lg:max-w-3xl mx-auto overflow-y-auto rounded-t-[22px] lg:rounded-[18px]"
        style={{ maxHeight: '92vh', background: 'linear-gradient(180deg, #1D2430, #141922)', border: `1px solid ${LINE2}`, boxShadow: '0 30px 80px rgba(0,0,0,.6)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 22px)' }}
      >
        {children}
      </div>
    </div>
  );
  return host ? createPortal(el, host) : el;
}
function SheetHead({ kicker, title, onClose, dark }) {
  return (
    <div className="sticky top-0 z-10 pt-2 pb-3 cx-bar" style={{ ...GUTTER, borderBottom: `1px solid ${LINE}` }}>
      <div className="mx-auto w-10 h-1 rounded-full mb-2 lg:hidden" style={{ background: 'rgba(255,255,255,.25)' }} />
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          {kicker && <div className="cx-kicker text-xs">{kicker}</div>}
          <h2 className="cx-title text-3xl leading-none mt-0.5">{title}</h2>
        </div>
        {onClose && <button type="button" onClick={onClose} aria-label={tt('Close', 'Uždaryti')} className="cx-btn shrink-0" style={{ width: 42, height: 42, borderRadius: 999, background: 'rgba(255,255,255,.08)' }}><X size={20} /></button>}
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
      <button type="button" onClick={() => setOpen(true)} aria-label={tt(`What is ${title}?`, `Kas yra „${title}“?`)} className="inline-grid place-items-center rounded-full shrink-0 cx-panel2" style={{ width: 24, height: 24, border: `1px solid ${LINE}` }}>
        <HelpCircle size={14} strokeWidth={2.6} />
      </button>
      {open && (
        <Sheet onClose={() => setOpen(false)} label={title} z="z-50">
          <SheetHead title={title} onClose={() => setOpen(false)} />
          <div style={GUTTER} className="pt-4 flex flex-col gap-3">
            <div className="flex gap-3 items-start">{ADVISOR ? <Advisor size={44} /> : <Info size={26} className="shrink-0" strokeWidth={2.6} />}<div className="font-semibold leading-relaxed">{children}</div></div>
            <Btn className="h-12" onClick={() => setOpen(false)}>{tt('Got it', 'Supratau')}</Btn>
          </div>
        </Sheet>
      )}
    </>
  );
}
function useWide() {
  const q = '(min-width: 1024px)';
  const [wide, setWide] = useState(() => { try { return window.matchMedia(q).matches; } catch (e) { return false; } });
  useEffect(() => {
    let m;
    try { m = window.matchMedia(q); } catch (e) { return undefined; }
    const on = () => setWide(m.matches);
    if (m.addEventListener) m.addEventListener('change', on); else m.addListener(on);
    return () => { if (m.removeEventListener) m.removeEventListener('change', on); else m.removeListener(on); };
  }, []);
  return wide;
}
// The campaign runs for the 12 weeks before election day, Sunday 8 October 2028.
const weekStartDate = (w) => new Date(2028, 6, 17 + (w - 1) * 7);
const MONTHS_LT = ['saus.', 'vas.', 'kov.', 'bal.', 'geg.', 'birž.', 'liep.', 'rugp.', 'rugs.', 'spal.', 'lapkr.', 'gruod.'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDay = (d) => (LANG === 'lt' ? `${MONTHS_LT[d.getMonth()]} ${d.getDate()} d.` : `${MONTHS_EN[d.getMonth()]} ${d.getDate()}`);
function StatPill({ icon: Icon, children, label, iconStyle, big, bg }) {
  return (
    <span className={`cx-pill shrink-0 ${big ? 'px-3 h-8 text-lg' : 'px-2.5 h-7 text-base'}`} title={label} aria-label={label} style={bg ? { background: bg } : undefined}>
      <span className="leading-none whitespace-nowrap">{children}</span>
      <Icon size={big ? 17 : 15} strokeWidth={2.5} style={iconStyle} className="shrink-0" />
    </span>
  );
}
function HudPills({ g, seats, big }) {
  return (
    <>
      <StatPill big={big} icon={Zap} iconStyle={{ fill: SUN, color: '#7A4E00' }} label={tt(`${g.ap} of ${g.apMax} energy left`, `Liko ${g.ap} iš ${g.apMax} energijos`)}>{g.ap}<span style={{ color: '#6B7280' }}>/{g.apMax}</span></StatPill>
      <StatPill big={big} icon={Wallet} iconStyle={{ color: '#15803D' }} label={tt(`Money ${fmtEur(g.money)}`, `Pinigai ${fmtEur(g.money)}`)}>{<CountUp to={g.money} fmt={(v) => fmtEurShort(Math.round(v))} />}</StatPill>
      <StatPill big={big} icon={Landmark} iconStyle={{ color: '#1D4ED8' }} bg={seats >= MAJORITY ? '#BBF7D0' : undefined} label={tt(`${seats} projected seats, 71 needed`, `Numatoma ${seats} mandatų, reikia 71`)}>{<CountUp to={seats} />}<span style={{ color: '#6B7280' }}>/71</span></StatPill>
      <StatPill big={big} icon={ShieldCheck} iconStyle={{ color: g.cred >= 60 ? '#15803D' : g.cred >= 40 ? AMBER : RED }} bg={g.cred < 40 ? '#FECACA' : undefined} label={tt(`Reputation ${Math.round(g.cred)} of 100`, `Reputacija ${Math.round(g.cred)} iš 100`)}>{<CountUp to={g.cred} />}</StatPill>
    </>
  );
}
function WeekTimeline({ g, compact }) {
  const W = WEEKS;
  const months = [];
  let lastM = -1;
  for (let w = 1; w <= W; w++) { const d = weekStartDate(w); if (d.getMonth() !== lastM) { months.push({ w, m: d.getMonth() }); lastM = d.getMonth(); } }
  const pct = (w) => ((w - 0.5) / W) * 100;
  const marks = [];
  for (let w = 1; w <= W; w++) {
    if (w === W) marks.push({ w, Icon: Vote, c: '#E5484D', t: tt('Election day', 'Rinkimų diena') });
    else if (DEBATE_WEEKS.includes(w)) marks.push({ w, Icon: Tv, c: '#3B82F6', t: tt(`LRT debate, week ${w}`, `LRT debatai, ${w} sav.`) });
    else if (ENDORSE_WEEKS.includes(w)) marks.push({ w, Icon: Handshake, c: '#22A06B', t: tt(`Endorsements, week ${w}`, `Organizacijų parama, ${w} sav.`) });
  }
  const top = compact ? 22 : 26;
  return (
    <div className="relative select-none" style={{ height: compact ? 40 : 46 }} role="img" aria-label={tt(`Campaign calendar: week ${g.week} of ${W}`, `Kampanijos kalendorius: ${g.week} savaitė iš ${W}`)}>
      <div className="absolute inset-x-0" style={{ top, height: 5, borderRadius: 99, background: 'rgba(255,255,255,.10)' }} />
      <div className="absolute left-0" style={{ top, height: 5, borderRadius: 99, width: `${((g.week - 0.5) / W) * 100}%`, background: 'linear-gradient(90deg, rgba(245,165,36,.15), rgba(245,165,36,.85))' }} />
      {Array.from({ length: W + 1 }).map((_, i) => <span key={i} className="absolute" style={{ left: `${(i / W) * 100}%`, top: top - 3, width: 1.5, height: 11, background: 'rgba(255,255,255,.22)' }} />)}
      {marks.map((m) => (
        <span key={m.w} className="absolute grid place-items-center rounded-full" title={m.t} style={{ left: `calc(${pct(m.w)}% - 9px)`, top: 0, width: 18, height: 18, background: m.w < g.week ? '#3A4252' : m.c, boxShadow: '0 0 0 2px #0B0E14' }}>
          <m.Icon size={10} color="#fff" strokeWidth={2.6} />
        </span>
      ))}
      <span className="absolute" style={{ left: `calc(${pct(g.week)}% - 7px)`, top: top - 11, width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: `10px solid ${SUN}`, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.7))' }} />
      {months.map((m) => <span key={m.w} className="absolute cx-title t-muted" style={{ left: `${((m.w - 1) / W) * 100}%`, top: top + 7, paddingLeft: 3, fontSize: 11, lineHeight: 1 }}>{(LANG === 'lt' ? MONTHS_LT : MONTHS_EN)[m.m]}</span>)}
    </div>
  );
}
function NewsTicker({ g }) {
  const items = g.news.slice(0, 8).map((n) => newsView(g, n).title).filter(Boolean);
  return (
    <div className="flex items-stretch overflow-hidden" style={{ height: 28, background: 'linear-gradient(90deg, #4A1014, #1C0A0C)', borderBottom: `1px solid ${LINE}` }}>
      <span className="shrink-0 flex items-center gap-1.5 px-2.5 cx-title text-sm" style={{ background: '#B91C1C', color: '#fff' }}>
        <span className="grid place-items-center rounded-sm font-black not-italic" style={{ width: 22, height: 17, background: '#fff', color: '#B91C1C', fontSize: 11 }}>NŽ</span>
        <span className="lg:hidden">{tt('NEWS', 'ŽINIOS')}</span><span className="hidden lg:inline">{tt('NATIONAL NEWS', 'NACIONALINĖS ŽINIOS')}</span>
      </span>
      <div className="cx-ticker-wrap flex-1 flex items-center" aria-label={tt('Latest headlines', 'Naujausios antraštės')}>
        <div className="cx-ticker cx-title text-sm uppercase" style={{ letterSpacing: '.03em' }}>
          {items.map((t, i) => <span key={i} className="inline-flex items-center gap-2"><span style={{ color: '#F87171' }}>◆</span>{t}</span>)}
        </div>
      </div>
    </div>
  );
}
function LangToggle({ lang, setLang, className = '' }) {
  return (
    <div className={`inline-flex rounded-full cx-panel2 p-0.5 shrink-0 ${className}`} style={{ border: `1px solid ${LINE}` }} role="radiogroup" aria-label={tt('Language', 'Kalba')}>
      {[['lt', 'LT'], ['en', 'EN']].map(([v, l]) => (
        <button key={v} type="button" role="radio" aria-checked={lang === v} onClick={() => setLang(v)} className="rounded-full px-2.5 h-8 text-sm font-extrabold" style={{ background: lang === v ? SUN : 'transparent', color: lang === v ? '#1B1204' : TEXT }}>{l}</button>
      ))}
    </div>
  );
}
// Blurred landmark behind every screen, like a painted set seen out of focus.
function Backdrop({ kind }) {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
      <div className="absolute" style={{ inset: '-6%', filter: 'blur(16px) saturate(.85)', opacity: 0.6 }}>
        <svg viewBox="0 0 360 140" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><SceneArt kind={kind} uid={`bd${kind}`} /></svg>
      </div>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 10%, rgba(13,17,24,.45), rgba(13,17,24,.93) 65%), linear-gradient(180deg, rgba(13,17,24,.55), rgba(13,17,24,.96))' }} />
    </div>
  );
}
function Gauge({ value, max = 10, low, high }) {
  const t = clamp(value / max, 0, 1);
  const cx = 100, cy = 100, R = 78;
  const pt = (f, r = R) => [cx - r * Math.cos(Math.PI * f), cy - r * Math.sin(Math.PI * f)];
  const seg = (a, b, c) => { const [x0, y0] = pt(a + 0.006); const [x1, y1] = pt(b - 0.006); return <path d={`M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}`} stroke={c} strokeWidth="24" fill="none" />; };
  const [nx, ny] = pt(t, R - 10);
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 112" width="100%" style={{ maxWidth: 280, display: 'block' }} role="img" aria-label={`${nf(value)} / ${max}`}>
        <path d={`M${pt(0)[0]} ${pt(0)[1]} A${R} ${R} 0 0 1 ${pt(1)[0]} ${pt(1)[1]}`} stroke="#0B0E14" strokeWidth="32" fill="none" />
        {seg(0, 0.2, '#B91C1C')}{seg(0.2, 0.4, '#EF6B6B')}{seg(0.4, 0.6, '#D7DCE4')}{seg(0.6, 0.8, '#6EE7A0')}{seg(0.8, 1, '#16A34A')}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#fff" strokeWidth="7" strokeLinecap="round" style={{ transition: 'all .6s cubic-bezier(.3,1.4,.5,1)' }} />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#0B0E14" strokeWidth="3.5" strokeLinecap="round" style={{ transition: 'all .6s cubic-bezier(.3,1.4,.5,1)' }} />
        <circle cx={cx} cy={cy} r="11" fill="#2A3242" stroke="#fff" strokeWidth="2.5" />
      </svg>
      <div className="flex justify-between w-full text-xs font-semibold t-muted -mt-1" style={{ maxWidth: 280 }}><span>{low}</span><span>{high}</span></div>
    </div>
  );
}
function ResultBanner({ ok, title, sub, icon: Icon }) {
  const c = ok ? '#16A34A' : '#DC2626';
  const I = Icon || (ok ? Check : X);
  return (
    <div className="flex items-center gap-3 sbl-pop">
      <span className="relative shrink-0" style={{ width: 64, height: 72 }}>
        <svg viewBox="0 0 64 72" width="64" height="72" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.5))' }}>
          <path d="M32 2 L60 10 V33 C60 51 47 63 32 70 C17 63 4 51 4 33 V10 Z" fill="#C9A45C" />
          <path d="M32 7 L55 13.5 V33 C55 48 44.5 58 32 64.5 C19.5 58 9 48 9 33 V13.5 Z" fill={c} />
        </svg>
        <span className="absolute inset-x-0 top-0 grid place-items-center" style={{ height: 64 }}><I size={30} color="#fff" strokeWidth={2.8} /></span>
      </span>
      <div className="min-w-0 flex-1 rounded-xl px-4 py-2.5" style={{ background: 'rgba(7,9,13,.82)', border: `1px solid ${LINE2}` }}>
        <span className="inline-block rounded-lg px-3 py-0.5 cx-title text-2xl lg:text-3xl leading-tight" style={{ background: c, color: '#fff' }}>{title}</span>
        {sub && <div className="cx-title text-lg mt-1 leading-tight" style={{ color: '#D5DBE5' }}>{sub}</div>}
      </div>
    </div>
  );
}
function CandidateCard({ p, w = 104, active, onClick, mood }) {
  const P = PARTIES[p];
  const inner = (
    <>
      <Portrait who={p} size={w} frameless mood={mood || (active ? 'grin' : 'happy')} />
      <div className="px-2 py-1.5" style={{ background: `linear-gradient(180deg, ${P.color}, ${mixHex(P.color, '#000000', 0.35)})` }}>
        <span className="cx-title text-base leading-none block truncate text-white">{P.short}</span>
        <span className="block text-[11px] font-semibold truncate" style={{ color: 'rgba(255,255,255,.82)' }}>{leaderSurname(p)}</span>
      </div>
    </>
  );
  const style = { width: w, background: '#0B0E14', border: `1px solid ${active ? SUN : LINE2}`, boxShadow: active ? `0 0 0 2px ${SUN}, ${SHADOW}` : SHADOW };
  return onClick
    ? <button type="button" onClick={onClick} aria-pressed={!!active} className="cx-tap shrink-0 rounded-xl overflow-hidden text-left" style={style}>{inner}</button>
    : <div className="shrink-0 rounded-xl overflow-hidden" style={style}>{inner}</div>;
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
  const left = SEAT_LEFT;
  const right = SEAT_RIGHT;
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
        return <circle key={i} cx={s.x} cy={s.y} r={0.042} fill={p ? PARTIES[p].color : '#2A3242'} fillOpacity={faded ? 0.3 : 1} stroke={INK} strokeWidth={p === highlight && p ? 0.02 : 0.009} strokeOpacity={faded ? 0.3 : 1} />;
      })}
      {showCount && (
        <g>
          <text x="0" y="-0.09" textAnchor="middle" fill={TEXT} fontSize="0.26" fontWeight="700" fontStyle="italic" style={{ fontFamily: FONT_TITLE }}>{n}</text>
          <text x="0" y="-0.0" textAnchor="middle" fill={MUTED} fontSize="0.075" fontWeight="800" style={{ fontFamily: F_BODY }}>{label}</text>
        </g>
      )}
    </svg>
  );
}
function PollBars({ shares, highlight, threshold, deltas, minShow = 0 }) {
  const ids = ALL_IDS.filter((p) => p === highlight || p === 'KITI' || shares[p] >= minShow)
    .sort((a, b) => (a === 'KITI' ? 1 : 0) - (b === 'KITI' ? 1 : 0) || shares[b] - shares[a]);
  const max = Math.max(30, ...ids.map((p) => shares[p]));
  const cols = deltas ? '84px 1fr 52px 50px' : '84px 1fr 56px';
  return (
    <div className="flex flex-col gap-2">
      {ids.map((p) => (
        <div key={p} className="grid items-center gap-2" style={{ gridTemplateColumns: cols }}>
          <span className={`text-sm truncate inline-flex items-center gap-1.5 ${p === highlight ? 'font-black' : 'font-bold'}`}><PartyDot p={p} size={11} />{partyShort(p)}</span>
          <div className="cx-track relative" style={{ height: 16 }}>
            <div className="h-full" style={{ width: `${(shares[p] / max) * 100}%`, background: PARTIES[p].color, borderRight: `1px solid ${LINE}` }} />
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
  const shown = PARTY_IDS.filter((p) => p === player || Math.max(...history.map((h) => h.shares[p])) >= 3);
  const vals = history.flatMap((h) => shown.map((p) => h.shares[p]));
  const yMax = Math.ceil(Math.max(25, ...vals) / 5) * 5;
  const x = (w) => pl + (w / WEEKS) * (W - pl - pr);
  const y = (v) => pt + (1 - v / yMax) * (H - pt - pb);
  const last = history[history.length - 1];
  const labels = shown.map((p) => ({ p, y: y(last.shares[p]) })).sort((a, b) => a.y - b.y);
  for (let i = 1; i < labels.length; i++) if (labels[i].y - labels[i - 1].y < 10) labels[i].y = labels[i - 1].y + 10;
  const over = labels.length ? labels[labels.length - 1].y - (H - pb + 2) : 0;
  if (over > 0) labels.forEach((l) => { l.y -= over; });
  const ticks = [];
  for (let v = 0; v <= yMax; v += 10) ticks.push(v);
  const order = shown.filter((p) => p !== player).concat(player);
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
      {labels.map((l) => <text key={l.p} x={x(last.week) + 7} y={l.y + 3} fontSize="8.5" fontWeight={l.p === player ? 800 : 600} fill={TEXT}>{PARTIES[l.p].short} {nf(last.shares[l.p], 0)}</text>)}
    </svg>
  );
}

/* ============================================================
   Cartoon map
   ============================================================ */
const TOKENS = { VNO: { pos: CITY_POS.VNO, r: 40 }, KNS: { pos: CITY_POS.KNS, r: 34 }, ABR: { pos: [770, 588], r: 32 } };
const COUNTY_IDS = Object.keys(COUNTY_SHAPES);
const WAVES = [[-26, 70], [-14, 150], [-28, 230], [-10, 330], [30, 400]];
function regionLook(s) {
  const ord = PARTY_IDS.slice().sort((a, b) => s[b] - s[a]);
  return { lead: ord[0], tossup: s[ord[0]] - s[ord[1]] < 3 };
}
const MAP_LAYERS = [
  { id: 'lead', icon: Flag, label: bi('Who leads', 'Kas pirmauja') },
  { id: 'you', icon: Heart, label: bi('Your support', 'Jūsų parama') },
  { id: 'swing', icon: TrendingUp, label: bi('Change', 'Pokytis') },
  { id: 'battle', icon: Swords, label: bi('Battlegrounds', 'Kovos') },
  { id: 'team', icon: Users, label: bi('Ground teams', 'Komandos') },
  { id: 'rivals', icon: Eye, label: bi('Rivals', 'Varžovai') },
];
// Where to draw markers for each region (label circle centre or city token centre).
function anchorOf(id) {
  if (TOKENS[id]) return TOKENS[id].pos;
  const [lx, ly] = COUNTY_SHAPES[id].label;
  return [lx, ly - 14];
}
function leaderSpot(id) {
  const [x, y] = anchorOf(id);
  if (id === 'ABR') return [x - 74, y - 6];
  if (TOKENS[id]) return [x + TOKENS[id].r + 30, y - TOKENS[id].r - 6];
  return [x, y - 74];
}
function layerFill(layer, id, ctx) {
  const s = ctx.shares[id];
  const me = ctx.me;
  if (ctx.live) {
    const f = ctx.live[id] || 0;
    const lead = regionLook(s).lead;
    return f < 0.03 ? '#2A3140' : mixHex(PARTIES[lead].color, '#2A3140', clamp(1 - f, 0, 1) * 0.8);
  }
  switch (layer) {
    case 'you': return mixHex('#1E2532', PARTIES[me].color, 0.08 + 0.92 * clamp(s[me] / 36, 0, 1));
    case 'swing': {
      const d = s[me] - ((ctx.g.prevStart && ctx.g.prevStart[id]) ? ctx.g.prevStart[id][me] : s[me]);
      const t = clamp(Math.abs(d) / 2.5, 0, 1);
      return Math.abs(d) < 0.1 ? '#262D3B' : d > 0 ? mixHex('#262D3B', '#16A34A', 0.25 + 0.75 * t) : mixHex('#262D3B', '#DC2626', 0.25 + 0.75 * t);
    }
    case 'battle': {
      const gap = Math.abs(raceInfo(ctx.g, REG[id], s).gap);
      return gap < 2 ? '#EA580C' : gap < 5 ? '#B7860B' : '#262D3B';
    }
    case 'team': return mixHex('#1E2532', '#3B82F6', clamp(ctx.g.gg[id][me] / 100, 0, 1));
    case 'rivals': return mixHex('#1E2532', PARTIES[regionLook(s).lead].color, 0.4);
    default: return mixHex(PARTIES[regionLook(s).lead].color, '#0E121A', 0.1);
  }
}
function layerValue(layer, id, ctx) {
  const s = ctx.shares[id];
  const me = ctx.me;
  if (ctx.live) return String(REG[id].seats);
  switch (layer) {
    case 'you': return nf(s[me], 0);
    case 'swing': { const d = s[me] - ((ctx.g.prevStart && ctx.g.prevStart[id]) ? ctx.g.prevStart[id][me] : s[me]); return `${d >= 0 ? '+' : '−'}${nf(Math.abs(d), 1)}`; }
    case 'battle': { const gap = raceInfo(ctx.g, REG[id], s).gap; return `${gap >= 0 ? '+' : '−'}${nf(Math.abs(gap), 0)}`; }
    case 'team': return String(Math.round(ctx.g.gg[id][me]));
    default: return String(REG[id].seats);
  }
}
const MOVE_ICON = { rally: Megaphone, digital: Smartphone, tv: Radio, door: DoorOpen, star: Star, attack: Swords, backfire: Swords };
function CartoonMap({ shares, sel, onSelect, g, proj, layer = 'lead', live, fx, view, onHover, hover }) {
  const hv = (id) => (onHover ? { onMouseEnter: () => onHover(id), onMouseLeave: () => onHover(null) } : {});
  const key = (id) => (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(id); } };
  const txt = { fill: '#fff', stroke: '#05070B', strokeWidth: 6, paintOrder: 'stroke', strokeLinejoin: 'round', style: { fontFamily: FONT_TITLE }, fontWeight: 700, fontStyle: 'italic' };
  const me = g ? g.player : null;
  const ctx = { shares, g, me, live };
  const lay = g || live ? layer : 'lead';
  const aria = (id, look) => `${rl(id)}: ${REG[id].seats} ${seatsWord(REG[id].seats)}, ${tt('leading', 'pirmauja')} ${partyShort(look.lead)}`;
  const showPips = proj && (lay === 'lead' || lay === 'battle') && !live;
  const winners = (id) => (proj ? proj.smd.filter((e) => e.rid === id).map((e) => e.winner).sort((a, b) => SEAT_ORDER.indexOf(a) - SEAT_ORDER.indexOf(b)) : []);
  const pips = (id) => {
    const w = winners(id);
    const [x, y] = anchorOf(id);
    const tok = TOKENS[id];
    const R = tok ? tok.r + 12 : 36;
    return w.map((p, i) => {
      const ang = tok ? -Math.PI / 2 + (i / w.length) * Math.PI * 2 : Math.PI + ((i + 0.5) / w.length) * Math.PI;
      const cx = x + R * Math.cos(ang), cy = y + R * Math.sin(ang), rr = tok ? 7 : 7.5;
      return (
        <g key={i}>
          <circle cx={cx} cy={cy} r={rr + 2.4} fill={INK} />
          <circle cx={cx} cy={cy} r={rr} fill={PARTIES[p].color} stroke="#fff" strokeWidth="2" />
        </g>
      );
    });
  };
  // Your campaign this week: route, moves, leader position.
  const route = g && !live ? (g.route || []).filter((r, i, a) => i === 0 || a[i - 1] !== r) : [];
  const moveBy = {};
  if (g && !live) (g.weekMoves || []).forEach((m) => { (moveBy[m.rid] = moveBy[m.rid] || []).push(m.type); });
  const pins = g && !live ? (g.newsPins || []) : [];
  const waiting = g && !live ? REGIONS.filter((r) => r.id !== 'ABR' && r.seats >= 3 && g.leaderAt !== r.id
    && g.week - (g.lastVisit[r.id] || 0) >= 3 && raceInfo(g, r, shares[r.id]).status === 'safe').map((r) => r.id) : [];
  const nat = g ? nationalShares(g) : null;
  const rivalFaces = g && lay === 'rivals' && !live
    ? PARTY_IDS.filter((q) => q !== me && g.rivalAt && g.rivalAt[q]).sort((a, b) => nat[b] - nat[a]).slice(0, 6)
    : [];
  const byRegion = {};
  rivalFaces.forEach((q) => { (byRegion[g.rivalAt[q]] = byRegion[g.rivalAt[q]] || []).push(q); });
  const hits = {};
  if (g && lay === 'rivals') (g.rivalMoves || []).forEach((m) => m.list.forEach((x) => { if (x.type === 'attack' && x.target === me) hits[x.rid] = (hits[x.rid] || 0) + 1; }));
  const [lx0, ly0] = g && g.leaderAt && !live ? leaderSpot(g.leaderAt) : [0, 0];
  return (
    <svg viewBox={(view || MAP_VB).join(' ')} className="cx-map w-full h-auto block select-none" role="group" aria-label={tt('Map of Lithuania’s electoral regions', 'Lietuvos rinkimų regionų žemėlapis')}>
      <defs>
        <pattern id="cx-stripes" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect x="0" y="0" width="6" height="16" fill="#fff" fillOpacity="0.26" />
        </pattern>
        <pattern id="cx-grid" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M44 0 H0 V44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" /></pattern>
        <radialGradient id="cx-glow-land" cx="50%" cy="45%" r="60%"><stop offset="0" stopColor="rgba(120,170,255,0.18)" /><stop offset="1" stopColor="rgba(120,170,255,0)" /></radialGradient>
      </defs>
      <rect x="-40" y="-26" width="870" height="660" fill="url(#cx-grid)" />
      <ellipse cx="400" cy="320" rx="430" ry="300" fill="url(#cx-glow-land)" />
      {WAVES.map(([x, y], i) => <path key={i} d={`M${x},${y} q7,-7 14,0 t14,0`} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.16" />)}
      <text x="-20" y="520" fontSize="17" fontWeight="800" fill="#5B7699" letterSpacing="2" transform="rotate(-90 -20 520)" textAnchor="middle">{tt('BALTIC SEA', 'BALTIJOS JŪRA')}</text>
      <text x="660" y="20" fontSize="18" fontWeight="800" fill="#5B7699" letterSpacing="3" textAnchor="middle">{tt('LATVIA', 'LATVIJA')}</text>
      <text x="752" y="432" fontSize="18" fontWeight="800" fill="#5B7699" letterSpacing="2" textAnchor="middle">{tt('BELARUS', 'BALTARUSIJA')}</text>
      <text x="215" y="612" fontSize="18" fontWeight="800" fill="#5B7699" letterSpacing="3" textAnchor="middle">{tt('POLAND', 'LENKIJA')}</text>
      <text x="100" y="420" fontSize="18" fontWeight="800" fill="#5B7699" letterSpacing="3" textAnchor="middle">{tt('RUSSIA', 'RUSIJA')}</text>
      <g transform="translate(0,10)" opacity="0.9">{COUNTY_IDS.map((id) => <path key={`x-${id}`} d={COUNTY_SHAPES[id].d} fill="#03050A" stroke="#03050A" strokeWidth="12" strokeLinejoin="round" />)}</g>
      {COUNTY_IDS.map((id) => <path key={`o-${id}`} d={COUNTY_SHAPES[id].d} fill="#0B0F16" stroke="#C9D3E3" strokeWidth="5" strokeLinejoin="round" strokeOpacity="0.55" />)}
      {COUNTY_IDS.map((id) => {
        const look = regionLook(shares[id]);
        return (
          <g key={id} role="button" tabIndex={0} aria-label={aria(id, look)} onClick={() => onSelect(id)} onKeyDown={key(id)} style={{ cursor: 'pointer', outline: 'none' }} {...hv(id)}>
            <path d={COUNTY_SHAPES[id].d} fill={layerFill(lay, id, ctx)} stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinejoin="round" />
            {lay === 'lead' && !live && look.tossup && <path d={COUNTY_SHAPES[id].d} fill="url(#cx-stripes)" pointerEvents="none" />}
          </g>
        );
      })}
      {hover && hover !== sel && COUNTY_SHAPES[hover] && <path d={COUNTY_SHAPES[hover].d} fill="rgba(255,255,255,.14)" stroke="#fff" strokeWidth="6" strokeLinejoin="round" pointerEvents="none" />}
      {sel && COUNTY_SHAPES[sel] && <path d={COUNTY_SHAPES[sel].d} fill="none" stroke={SUN} strokeWidth="9" strokeLinejoin="round" pointerEvents="none" />}
      {sel && COUNTY_SHAPES[sel] && <path d={COUNTY_SHAPES[sel].d} fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" pointerEvents="none" />}
      {route.length > 1 && (
        <g pointerEvents="none">
          <polyline points={route.map((id) => anchorOf(id).join(',')).join(' ')} fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity="0.25" />
          <polyline className="cx-dash" points={route.map((id) => anchorOf(id).join(',')).join(' ')} fill="none" stroke={SUN} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {Object.entries(TOKENS).map(([id, t]) => {
        const look = regionLook(shares[id]);
        const [x, y] = t.pos;
        const val = layerValue(lay, id, ctx);
        return (
          <g key={id} role="button" tabIndex={0} aria-label={aria(id, look)} onClick={() => onSelect(id)} onKeyDown={key(id)} style={{ cursor: 'pointer', outline: 'none' }} {...hv(id)}>
            <circle cx={x} cy={y + 6} r={t.r} fill="#03050A" opacity="0.9" />
            <circle cx={x} cy={y} r={t.r} fill={layerFill(lay, id, ctx)} stroke={sel === id ? SUN : 'rgba(255,255,255,0.85)'} strokeWidth={sel === id ? 7 : 3} />
            {lay === 'lead' && !live && look.tossup && <circle cx={x} cy={y} r={t.r - 4} fill="url(#cx-stripes)" pointerEvents="none" />}
            {id === 'ABR' && <path d={`M${x - t.r + 8},${y} H${x + t.r - 8} M${x},${y - t.r + 8} V${y + t.r - 8}`} stroke="#fff" strokeOpacity="0.35" strokeWidth="3" pointerEvents="none" />}
            <text x={x} y={y + 10} textAnchor="middle" fontSize={val.length > 3 ? 22 : t.r > 36 ? 32 : 28} fontWeight="700" fill="#fff" stroke={INK} strokeWidth="6" paintOrder="stroke" strokeLinejoin="round" style={{ fontFamily: FONT_TITLE }} pointerEvents="none">{val}</text>
          </g>
        );
      })}
      {showPips && <g pointerEvents="none">{REGIONS.map((r) => <g key={`p-${r.id}`}>{pips(r.id)}</g>)}</g>}
      {COUNTY_IDS.map((id) => {
        const [lx, ly] = COUNTY_SHAPES[id].label;
        const val = layerValue(lay, id, ctx);
        const wide = val.length > 2;
        return (
          <g key={`l-${id}`} pointerEvents="none">
            {wide ? <rect x={lx - 30} y={ly - 33} width="60" height="38" rx="19" fill="#0B0F16" stroke="#fff" strokeWidth="2.5" /> : <circle cx={lx} cy={ly - 14} r="22" fill="#0B0F16" stroke="#fff" strokeWidth="2.5" />}
            <text x={lx} y={ly - 5} textAnchor="middle" fontSize={wide ? 23 : 26} fontWeight="700" fontStyle="italic" fill="#fff" style={{ fontFamily: FONT_TITLE }}>{val}</text>
            <text x={lx} y={ly + 30} textAnchor="middle" fontSize="25" {...txt}>{rs(id)}</text>
          </g>
        );
      })}
      {Object.entries(TOKENS).map(([id, t]) => {
        const [x, y] = t.pos;
        return <text key={`n-${id}`} x={x} y={id === 'ABR' ? y - t.r - 12 : y + t.r + 28} textAnchor="middle" fontSize="25" {...txt} pointerEvents="none">{rs(id)}</text>;
      })}
      {/* markers */}
      <g pointerEvents="none">
        {g && !live && (() => {
          const F = festivalNow(g);
          if (!F || (g.fest && g.fest[F.id] != null)) return null;
          const [x, y] = anchorOf(F.rid);
          const [bx, by] = TOKENS[F.rid] ? [x, y - TOKENS[F.rid].r - 30] : [x, y - 58];
          return (
            <g key="fest">
              <circle className="cx-ping" cx={bx} cy={by} r="20" fill={SUN} opacity="0.5" />
              <circle cx={bx} cy={by} r="20" fill={SUN} stroke={INK} strokeWidth="3.5" />
              <Sparkles x={bx - 11} y={by - 11} width={22} height={22} strokeWidth={2.6} color={INK} />
            </g>
          );
        })()}
        {g && !live && (lay === 'lead' || lay === 'battle') && REGIONS.filter((r) => raceInfo(g, r, shares[r.id]).status === 'close').map((r) => {
          const [x, y] = anchorOf(r.id);
          const rr = TOKENS[r.id] ? TOKENS[r.id].r + 6 : 26;
          return <circle key={`hot-${r.id}`} className="cx-ping" cx={x} cy={y} r={rr} fill="none" stroke="#FB923C" strokeWidth="5" />;
        })}
        {waiting.map((id) => {
          const [x, y] = anchorOf(id);
          const [bx, by] = TOKENS[id] ? [x - TOKENS[id].r - 4, y + TOKENS[id].r - 4] : [x - 44, y - 30];
          return (
            <g key={`z-${id}`}>
              <circle cx={bx} cy={by} r="15" fill="#2B2210" stroke="#FBBF24" strokeWidth="2.5" />
              <text x={bx} y={by + 6} textAnchor="middle" fontSize="16" fontWeight="900" fill="#FBBF24" style={{ fontFamily: FONT_TITLE }}>zz</text>
            </g>
          );
        })}
        {Object.entries(moveBy).map(([id, list]) => {
          const [x, y] = anchorOf(id);
          const [bx, by] = TOKENS[id] ? [x - TOKENS[id].r + 2, y - TOKENS[id].r + 2] : [x + 44, y + 6];
          const Icon = MOVE_ICON[list[list.length - 1]] || Flag;
          return (
            <g key={`m-${id}-${list.length}`} className="cx-pop-svg">
              <circle cx={bx} cy={by} r="18" fill={SUN} stroke={INK} strokeWidth="3.5" />
              <Icon x={bx - 10} y={by - 10} width={20} height={20} strokeWidth={2.6} color={INK} />
              {list.length > 1 && (
                <g>
                  <circle cx={bx + 15} cy={by - 14} r="11" fill="#fff" stroke={INK} strokeWidth="2.5" />
                  <text x={bx + 15} y={by - 9} textAnchor="middle" fontSize="15" fontWeight="900" fill={INK}>{list.length}</text>
                </g>
              )}
            </g>
          );
        })}
        {pins.map((pin) => {
          const [x, y] = anchorOf(pin.rid);
          const [bx, by] = TOKENS[pin.rid] ? [x + TOKENS[pin.rid].r - 2, y + TOKENS[pin.rid].r - 2] : [x - 44, y + 8];
          return (
            <g key={`n-${pin.id}`}>
              <circle className="cx-ping" cx={bx} cy={by} r="16" fill="#E5484D" opacity="0.6" />
              <circle cx={bx} cy={by} r="16" fill="#E5484D" stroke={INK} strokeWidth="3.5" />
              <text x={bx} y={by + 7} textAnchor="middle" fontSize="21" fontWeight="900" fill="#fff" style={{ fontFamily: FONT_TITLE }}>!</text>
            </g>
          );
        })}
        {Object.entries(hits).map(([id, n]) => {
          const [x, y] = anchorOf(id);
          return (
            <g key={`h-${id}`}>
              <circle cx={x + 40} cy={y + 8} r="16" fill="#3A1518" stroke="#F87171" strokeWidth="2.5" />
              <Swords x={x + 31} y={y - 1} width={18} height={18} strokeWidth={2.6} color="#F87171" />
              {n > 1 && <text x={x + 58} y={y - 6} fontSize="16" fontWeight="900" fill="#F87171">×{n}</text>}
            </g>
          );
        })}
        {Object.entries(byRegion).map(([id, list]) => {
          const [x, y] = anchorOf(id);
          return list.map((q, i) => <MapFace key={`r-${q}`} who={q} x={x + (i - (list.length - 1) / 2) * 46} y={y + (TOKENS[id] ? 0 : 4)} size={50} mood="grr" ring={PARTIES[q].color} />);
        })}
      </g>
      {g && g.leaderAt && !live && (
        <g className="cx-travel" style={{ transform: `translate(${lx0}px, ${ly0}px)` }} pointerEvents="none">
          <line x1="0" y1="30" x2={anchorOf(g.leaderAt)[0] - lx0} y2={anchorOf(g.leaderAt)[1] - ly0} stroke={INK} strokeWidth="4" strokeDasharray="2 6" strokeLinecap="round" />
          <MapFace who={me} x={0} y={0} size={70} mood="happy" ring={SUN} />
          <circle cx="26" cy="24" r="15" fill={SUN} stroke={INK} strokeWidth="3.5" />
          <Bus x={16} y={14} width={20} height={20} strokeWidth={2.6} color={INK} />
        </g>
      )}
      {fx && !live && (() => {
        const [x, y] = anchorOf(fx.rid);
        const c = fx.who === me ? (fx.d >= 0 ? '#4ADE80' : '#F87171') : '#F87171';
        return (
          <g key={fx.n} pointerEvents="none" aria-hidden="true">
            <circle className="cx-ripple" cx={x} cy={y} r="34" fill="none" stroke={fx.who === me ? c : PARTIES[fx.who].color} strokeWidth="6" />
            <g className="cx-float">
              <text x={x} y={y - 44} textAnchor="middle" fontSize="44" {...txt} fill={c}>{fmtSignedPct(fx.d)}</text>
              {fx.who !== me && <text x={x} y={y - 8} textAnchor="middle" fontSize="24" {...txt}>{partyShort(fx.who)}</text>}
            </g>
          </g>
        );
      })()}
    </svg>
  );
}
function MapLegend({ layer, g, shares }) {
  const me = g.player;
  const leaders = [...new Set(REGIONS.map((r) => regionLook(shares[r.id]).lead))];
  const grad = (a, b) => <span className="inline-block rounded-full" style={{ width: 72, height: 12, background: `linear-gradient(90deg, ${a}, ${b})`, border: `1px solid ${LINE}` }} />;
  let body;
  if (layer === 'you') body = <span className="inline-flex items-center gap-2">0 {grad('#1E2532', PARTIES[me].color)} 36 %+ <span className="t-muted">{tt('your share of the vote', 'jūsų balsų dalis')}</span></span>;
  else if (layer === 'swing') body = <span className="inline-flex items-center gap-2 flex-wrap">{grad('#DC2626', '#262D3B')}{grad('#262D3B', '#16A34A')}<span className="t-muted">{tt('your change since last week, pts', 'jūsų pokytis per savaitę, proc. p.')}</span></span>;
  else if (layer === 'battle') body = <span className="inline-flex items-center gap-2 flex-wrap">{[['#EA580C', tt('within 2 pts', 'iki 2 p.')], ['#B7860B', tt('within 5 pts', 'iki 5 p.')], ['#262D3B', tt('not close', 'neartima')]].map(([c, l]) => <span key={l} className="inline-flex items-center gap-1"><span className="inline-block rounded" style={{ width: 14, height: 14, background: c, border: `1px solid ${LINE}` }} />{l}</span>)}<span className="t-muted">{tt('number = your lead', 'skaičius – jūsų persvara')}</span></span>;
  else if (layer === 'team') body = <span className="inline-flex items-center gap-2">0 {grad('#1E2532', '#3B82F6')} 100 <span className="t-muted">{tt('your volunteers: they protect you from attacks', 'jūsų savanoriai: saugo nuo puolimų')}</span></span>;
  else if (layer === 'rivals') body = <span className="t-muted">{tt('Rival leaders where they campaigned most last week. Swords = attack ads on you.', 'Varžovų lyderiai ten, kur praėjusią savaitę daugiausiai agitavo. Kardai – puolimai prieš jus.')}</span>;
  else body = (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {leaders.map((q) => <span key={q} className="inline-flex items-center gap-1.5"><PartyDot p={q} size={12} />{partyShort(q)}</span>)}
      <span className="t-muted text-xs w-full">{tt('Colour = who leads · stripes = close · dots = projected district winners', 'Spalva – kas pirmauja · juostos – lygi kova · taškeliai – numatomi apygardų nugalėtojai')}</span>
    </span>
  );
  return (
    <div className="px-2 pb-2 pt-1 text-sm font-extrabold flex flex-col gap-1.5">
      {body}
      <span className="flex flex-wrap gap-x-3 gap-y-1 text-xs t-muted">
        <span className="inline-flex items-center gap-1"><Bus size={13} />{tt('your leader', 'jūsų lyderis')}</span>
        <span className="inline-flex items-center gap-1"><span className="grid place-items-center rounded-full text-white font-black" style={{ width: 14, height: 14, background: '#E5484D', fontSize: 10 }}>!</span>{tt('news', 'naujiena')}</span>
        <span className="inline-flex items-center gap-1"><span className="grid place-items-center rounded-full font-black" style={{ width: 16, height: 14, background: '#2B2210', border: '1.5px solid #FBBF24', fontSize: 8, color: '#FBBF24' }}>zz</span>{tt('stronghold waiting for you', 'tvirtovė laukia vizito')}</span>
        <span className="inline-flex items-center gap-1"><span className="inline-block rounded-full" style={{ width: 12, height: 12, background: SUN, border: `1px solid ${LINE}` }} />{tt('your moves', 'jūsų veiksmai')}</span>
      </span>
    </div>
  );
}

/* ============================================================
   Region list & region card
   ============================================================ */
function StatusPill({ status }) {
  const S = STATUS_LOOK[status];
  return <span className="cx-chip px-2.5 py-0.5 text-xs whitespace-nowrap" style={{ background: S.bg, color: S.fg, borderColor: 'transparent' }}>{L(S.label)}</span>;
}
function RegionRow({ r, g, s, mySeats, onClick }) {
  const info = raceInfo(g, r, s);
  const acts = g.weekActs[r.id] || 0;
  return (
    <button type="button" onClick={onClick} className="cx-tap w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-xl" style={{ background: `linear-gradient(90deg, ${tint(PARTIES[info.lead].color, 0.42)}, ${tint(PARTIES[info.lead].color, 0.78)})`, border: `1px solid ${LINE}`, borderLeft: `4px solid ${PARTIES[info.lead].color}`, boxShadow: '0 6px 18px rgba(0,0,0,.28)' }}>
      <div className="relative shrink-0 grid place-items-center rounded-full cx-num text-lg" style={{ width: 44, height: 44, background: 'rgba(0,0,0,.38)', border: '2px solid rgba(255,255,255,.8)', color: '#fff' }}>
        {r.seats}
      </div>
      <div className="min-w-0 flex-1">
        <div className="cx-title text-lg leading-tight truncate inline-flex items-center gap-1.5 max-w-full">{g.leaderAt === r.id && <Bus size={16} className="shrink-0" />}<span className="truncate lg:hidden">{rs(r)}</span><span className="truncate hidden lg:inline">{rl(r)}</span>{(g.newsPins || []).some((x) => x.rid === r.id) && <span className="grid place-items-center rounded-full text-white font-black shrink-0" style={{ width: 18, height: 18, background: '#E5484D', fontSize: 12 }}>!</span>}</div>
        <div className="text-[13px] font-semibold t-muted leading-snug">{raceText(info)}</div>
        <div className="flex items-center gap-1.5 mt-1" aria-hidden="true">
          <span className="flex-1 rounded-full overflow-hidden" style={{ height: 5, background: 'rgba(0,0,0,.35)' }}><span className="block h-full rounded-full" style={{ width: `${clamp((s[g.player] / Math.max(1, s[info.ord[0]])) * 100, 3, 100)}%`, background: info.lead === g.player ? '#fff' : PARTIES[g.player].color, transition: 'width .6s ease' }} /></span>
          <span className="text-[11px] font-extrabold cx-num">{fmtPct(s[g.player], 1)}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <StatusPill status={info.status} />
        <span className="text-xs font-extrabold t-muted">{acts > 0 ? tt(`${acts}× this week`, `${acts}× šią sav.`) : tt(`you win ${mySeats}/${r.seats}`, `laimite ${mySeats}/${r.seats}`)}</span>
      </div>
      <ChevronRight size={20} className="shrink-0" />
    </button>
  );
}
function ActionTile({ type, g, r, rival, onAction }) {
  const A = ACTIONS[type];
  const p = g.player;
  const cost = actionCost(type, r, p);
  const disabled = g.ap < 1 || g.money < cost;
  const und = g.undecided[r.id];
  let effect;
  if (type === 'attack') effect = tt(`${partyShort(rival)} ▼ · ${Math.round(attackBackfire(g, r) * 100)}% backfire risk`, `${partyShort(rival)} ▼ · ${Math.round(attackBackfire(g, r) * 100)} % rizika atsisukti`);
  else if (type === 'door') effect = tt(`Ground team ${Math.round(g.gg[r.id][p])} → ${Math.round(Math.min(100, g.gg[r.id][p] + 14 * (1 - g.gg[r.id][p] / 110) * geoMult(p, r) * (p === 'DP' ? 1.5 : 1)))}`, `Komanda ${Math.round(g.gg[r.id][p])} → ${Math.round(Math.min(100, g.gg[r.id][p] + 14 * (1 - g.gg[r.id][p] / 110) * geoMult(p, r) * (p === 'DP' ? 1.5 : 1)))}`);
  else if (type === 'star') {
    const t = starTarget(g, r.id);
    effect = t ? tt(`${cnm(t.cid)}: ${t.gap < 0 ? 'you trail' : 'you lead'}`, `${cnm(t.cid)}: ${t.gap < 0 ? 'atsiliekate' : 'pirmaujate'}`) : tt('Every district covered', 'Visos apygardos užimtos');
  } else effect = ADVISOR ? tt(`Rūta’s guess: about +${nf((actionPreview(g, r.id, type) * 100) / (100 - und))}% for you`, `Rūtos spėjimas: apie +${nf((actionPreview(g, r.id, type) * 100) / (100 - und))} % jums`) : null;
  const Icon = A.icon;
  return (
    <button type="button" disabled={disabled} onClick={() => onAction(r.id, type)} className="cx-btn flex-col items-start text-left p-3" style={{ minHeight: 132, justifyContent: 'flex-start', gap: 6, background: 'linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.03))' }}>
      <div className="flex items-center gap-2 w-full">
        <span className="grid place-items-center rounded-full shrink-0" style={{ width: 36, height: 36, background: A.color, border: `1px solid ${LINE}` }}><Icon size={18} strokeWidth={2.5} /></span>
        <span className="cx-title text-base leading-tight">{L(A.label)}</span>
      </div>
      <span className="text-sm font-semibold t-muted leading-snug">{L(A.desc)}</span>
      {type === 'rally' && <span className="text-xs font-extrabold" style={{ color: g.leaderAt === r.id ? GREEN : AMBER }}>{g.leaderAt === r.id ? tt('Leader here: +30%', 'Lyderis čia: +30 %') : tt('No leader: −15%', 'Be lyderio: −15 %')}</span>}
      {effect && <span className="text-sm font-extrabold leading-snug" style={{ color: type === 'attack' ? RED : GREEN }}>{effect}</span>}
      <span className="mt-auto inline-flex items-center gap-1 text-sm font-extrabold"><Zap size={15} style={{ fill: SUN }} />1 · {fmtEur(cost)}</span>
    </button>
  );
}
function moveWord(x, me) {
  if (x.type === 'attack') return (x.target === me ? tt('attack ad on you', 'puolimas prieš jus') : tt(`attack ad on ${partyShort(x.target)}`, `puolimas prieš ${partyShort(x.target)}`)) + (x.retal ? tt(' (revenge)', ' (atsakas)') : '');
  if (x.defend) return tt('defensive rally', 'gynybinis mitingas');
  return L(AI_VERB[x.type] || bi(x.type, x.type));
}
function LeaderCard({ g, r, onTravel }) {
  const here = g.leaderAt === r.id;
  const c = travelCost(g, r.id);
  const name = leaderSurname(g.player);
  const can = c && g.ap >= c.ap && g.money >= c.eur;
  return (
    <div className="cx-card p-3 flex items-center gap-3" style={{ background: here ? GOOD_BG : PANEL2, boxShadow: SHADOW }}>
      <Portrait who={g.player} size={48} mood={here ? 'grin' : 'ok'} />
      <div className="min-w-0 flex-1">
        <div className="font-black leading-tight">{here ? tt(`${name} is here`, `${name} – čia`) : tt(`${name} is in ${rs(g.leaderAt)}`, `${name} dabar – ${rs(g.leaderAt)}`)}</div>
        <div className="text-xs font-bold t-muted leading-snug">{here ? tt('While the leader is here: rallies +30%, door-knocking +25%.', 'Kol lyderis čia: mitingai +30 %, agitacija +25 %.') : tt('Rallies without the leader are 15% weaker.', 'Be lyderio mitingai 15 % silpnesni.')}</div>
      </div>
      {!here && c && (
        <Btn kind="sun" className="h-12 px-3 text-sm shrink-0 flex-col" style={{ gap: 0, lineHeight: 1.1 }} disabled={!can} onClick={() => onTravel(r.id)}>
          <span className="inline-flex items-center gap-1">{c.mode === 'plane' ? <Plane size={15} /> : <Bus size={15} />}{tt('Travel', 'Važiuoti')}</span>
          <span className="text-xs">{c.ap ? <><Zap size={11} style={{ fill: INK }} />1 · </> : tt('free · ', 'nemok. · ')}{fmtEur(c.eur)}</span>
        </Btn>
      )}
    </div>
  );
}
function RegionIntel({ g, r }) {
  const me = g.player;
  const pin = (g.newsPins || []).find((x) => x.rid === r.id);
  const rivals = (g.rivalMoves || []).map((m) => ({ p: m.p, list: m.list.filter((x) => x.rid === r.id) })).filter((m) => m.list.length);
  const away = g.week - (g.lastVisit[r.id] || 0);
  const items = [];
  if (pin) items.push(<div key="pin" className="flex gap-2 items-start"><span className="grid place-items-center rounded-full text-white font-black shrink-0" style={{ width: 22, height: 22, background: '#E5484D', border: `1px solid ${LINE}` }}>!</span><span><span className="font-black">{tt('News here:', 'Naujiena čia:')}</span> {evFill(L(EVENT_MAP[pin.id].title), { rv: pin.rv, rr: pin.rid })}</span></div>);
  rivals.forEach((m) => items.push(<div key={m.p} className="flex gap-2 items-center"><Portrait who={m.p} size={28} mood={m.list.some((x) => x.target === me) ? 'grr' : 'ok'} /><span><span className="font-black">{partyShort(m.p)}</span> {tt('last week:', 'praėjusią sav.:')} {m.list.map((x) => moveWord(x, me)).join(', ')}</span></div>));
  if (away >= 3 && g.leaderAt !== r.id && r.id !== 'ABR' && r.seats >= 3 && raceInfo(g, r).status === 'safe') items.push(<div key="away" className="font-extrabold" style={{ color: AMBER }}>{tt(`A stronghold you haven’t visited for ${away} weeks. Ignore it for 4 and it starts to slip.`, `Tvirtovė, kurioje nebuvote jau ${away} sav. Apleista 4 sav., ji ima slysti.`)}</div>);
  if (!items.length) return null;
  return <div className="cx-soft p-3 flex flex-col gap-2 text-sm font-semibold"><div className="font-black text-xs t-muted">{tt('LOCAL INTEL', 'VIETOS ŽINIOS')}</div>{items}</div>;
}
function RegionDrawer({ g, rid, proj, onClose, onAction, onTravel, tutStep, onSkipTips, docked }) {
  const Wrap = docked ? DockPanel : Sheet;
  const r = REG[rid];
  const p = g.player;
  const info = raceInfo(g, r);
  const cons = proj.smd.filter((e) => e.rid === rid);
  const mine = cons.filter((e) => e.winner === p).length;
  const acts = g.weekActs[rid] || 0;
  const [more, setMore] = useState(false);
  const top = info.ord.slice(0, 3);
  if (!top.includes(p)) top[2] = p;
  const maxS = Math.max(...top.map((q) => info.s[q]), 20);
  return (
    <Wrap onClose={onClose} label={rl(r)}>
      <SheetHead kicker={tt(`${r.seats} ${seatsWord(r.seats)} to win here`, `Čia galima laimėti: ${r.seats} ${seatsWord(r.seats)}`)} title={rl(r)} onClose={onClose} />
      <div className="flex flex-col gap-4 pt-4" style={GUTTER}>
        <Scene kind={REGION_SCENE[rid] || 'town'} h={112} kb />
        <LeaderCard g={g} r={r} onTravel={onTravel} />
        <RegionIntel g={g} r={r} />
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
        {tutStep === 2 && (
          <Coach title={tt('This is a region card', 'Tai regiono kortelė')} onSkip={onSkipTips}>
            {tt('Each button is a move you can make here. Every move shows its cost and roughly what it does. Think about this race, then pick one.', 'Kiekvienas mygtukas – tai veiksmas šiame regione. Matote jo kainą ir apytikslį poveikį. Įvertinkite kovą ir pasirinkite.')}
          </Coach>
        )}
        {g.ap === 0 && <div className="cx-soft p-3 text-sm font-bold">{tt('Out of energy this week. Tap Next week to refill.', 'Šią savaitę energijos nebeliko. Spauskite „Kita savaitė“.')}</div>}
        <div className="grid grid-cols-2 gap-3">
          {['rally', 'digital', 'tv', 'door', 'star', 'attack'].map((t) => <ActionTile key={t} type={t} g={g} r={r} rival={info.rival} onAction={onAction} />)}
        </div>
        {acts >= 2 && <p className="text-sm font-bold" style={{ color: AMBER }}>{tt('Voters here are getting tired of you this week. Each extra move here works less well.', 'Šio regiono rinkėjai šią savaitę jau pavargo nuo jūsų. Kiekvienas papildomas veiksmas čia veikia silpniau.')}</p>}
        <RegionDistricts g={g} rid={rid} proj={proj} />
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
              <PollBars shares={info.s} highlight={p} minShow={2} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="cx-soft p-3"><div className="text-xs font-extrabold t-muted mb-1.5">{tt('Your ground team', 'Jūsų komanda vietoje')}</div><Bar value={g.gg[rid][p]} color={PARTIES[p].color} /><div className="cx-num mt-1">{Math.round(g.gg[rid][p])}/100</div></div>
              <div className="cx-soft p-3"><div className="text-xs font-extrabold t-muted mb-1.5">{tt('Turnout boost', 'Aktyvumo postūmis')}</div><Bar value={g.boost[rid][p]} max={0.25} color="#34D399" /><div className="cx-num mt-1">+{Math.round(g.boost[rid][p] * 100)}{LANG === 'lt' ? ' %' : '%'}</div></div>
            </div>
          </div>
        )}
      </div>
    </Wrap>
  );
}

/* ============================================================
   Header, ticker & bottom navigation
   ============================================================ */
function nextUp(g) {
  for (let w = g.week + 1; w <= WEEKS; w++) {
    if (DEBATE_WEEKS.includes(w)) return tt(`Next: debate, week ${w}`, `Toliau: LRT debatai ${w} sav.`);
    if (ENDORSE_WEEKS.includes(w)) return tt(`Endorsements in week ${w}`, `Toliau: rėmimas (${w} sav.)`);
  }
  return g.week >= WEEKS ? tt('Early voting is open: moves are 15% weaker', 'Vyksta išankstinis balsavimas: veiksmai 15 % silpnesni') : tt('Next: election day', 'Toliau: rinkimų diena');
}
function Header({ g, proj, onHelp, lang, setLang, onFind }) {
  const P = PARTIES[g.player];
  const seats = proj.seats[g.player];
  return (
    <header className="sticky z-30" style={{ top: 'env(safe-area-inset-top, 0px)', background: 'linear-gradient(180deg, rgba(7,9,13,.97), rgba(12,15,22,.94))', borderBottom: `1px solid ${LINE}`, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div className="max-w-lg mx-auto pt-2.5" style={GUTTER}>
        <div className="flex items-center gap-2.5">
          <Portrait who={g.player} size={48} square badge />
          <div className="min-w-0 flex-1">
            <div className="cx-title leading-none truncate" style={{ fontSize: P.leader.length > 18 ? 18 : 20 }}>{P.leader}</div>
            <div className="flex items-center gap-1.5 mt-1 min-w-0">
              <span className="shrink-0 rounded px-1.5 text-xs font-extrabold" style={{ background: P.color, color: '#fff', lineHeight: '18px' }}>{P.short}</span>
              <span className="shrink-0 cx-title text-sm" style={{ color: SUN }}>{tt(`Week ${g.week}/12`, `${g.week}/12 sav.`)}</span>
              <span className="text-xs font-semibold t-muted truncate">· {nextUp(g)}</span>
            </div>
          </div>
          <FindButton onClick={onFind} />
          <HeaderMenu lang={lang} setLang={setLang} onHelp={onHelp} />
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <HudPills g={g} seats={seats} />
        </div>
        <div className="mt-1"><WeekTimeline g={g} compact /></div>
      </div>
    </header>
  );
}
function DesktopHud({ g, proj, onHelp, lang, setLang, onEnd, glowEnd, onFind }) {
  const P = PARTIES[g.player];
  const seats = proj.seats[g.player];
  const last = g.week >= WEEKS;
  return (
    <header className="sticky top-0 z-30" style={{ background: 'linear-gradient(180deg, rgba(7,9,13,.97), rgba(12,15,22,.92))', borderBottom: `1px solid ${LINE}`, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div className="flex items-center gap-6 px-5 py-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2 shrink-0" style={{ background: `linear-gradient(135deg, ${tint(P.color, 0.35)}, ${tint(P.color, 0.7)})`, border: `1px solid ${LINE2}`, boxShadow: SHADOW }}>
          <Portrait who={g.player} size={64} square badge />
          <div className="min-w-0">
            <div className="cx-title text-xl leading-none whitespace-nowrap">{P.leader} <span className="t-muted">({P.short})</span></div>
            <div className="flex items-center gap-1.5 mt-2"><HudPills g={g} seats={seats} /></div>
          </div>
        </div>
        <div className="flex-1 min-w-0 max-w-3xl">
          <div className="flex items-baseline justify-between gap-3">
            <span className="cx-title text-2xl leading-none">{tt(`Week ${g.week}`, `${g.week} savaitė`)} <span className="t-muted text-lg">{tt('of 12', 'iš 12')}</span></span>
            <span className="text-sm font-semibold t-muted truncate">{fmtDay(weekStartDate(g.week))} · {nextUp(g)}</span>
          </div>
          <div className="mt-1"><WeekTimeline g={g} /></div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <FindButton onClick={onFind} wide />
          <LangToggle lang={lang} setLang={setLang} />
          <SoundToggle size={42} />
          <button type="button" onClick={onHelp} aria-label={tt('How to play', 'Kaip žaisti')} className="cx-btn shrink-0" style={{ width: 42, height: 42, borderRadius: 999, background: 'rgba(255,255,255,.07)' }}><HelpCircle size={20} /></button>
          <Btn className={`h-14 px-6 text-xl ${glowEnd ? 'cx-glow' : ''}`} onClick={onEnd}>{last ? <Vote size={22} /> : <Play size={20} style={{ fill: '#1B1204' }} />}{last ? tt('Vote!', 'Balsuoti!') : tt('Next week', 'Kita savaitė')}</Btn>
        </div>
      </div>
    </header>
  );
}
function NavRail({ tab, setTab }) {
  const items = [['map', MapIcon, tt('Map', 'Žemėlapis')], ['polls', BarChart3, tt('Polls', 'Apklausos')], ['hq', Building2, tt('HQ', 'Štabas')], ['news', Newspaper, tt('News', 'Naujienos')]];
  return (
    <nav className="sticky flex flex-col gap-2" style={{ top: 118 }} aria-label={tt('Sections', 'Skiltys')}>
      {items.map(([id, Icon, label]) => (
        <button key={id} type="button" onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined} className="cx-btn flex-col gap-1 text-[11px] font-bold" style={{ height: 72, background: tab === id ? '#F3F4F6' : 'rgba(255,255,255,.05)', color: tab === id ? '#0B0E14' : TEXT }}>
          <Icon size={24} strokeWidth={tab === id ? 2.6 : 2.1} />{label}
        </button>
      ))}
    </nav>
  );
}
function SidePanel({ g, shares, onSelect, act }) {
  const [pane, setPane] = useState('week');
  return (
    <div className="flex flex-col gap-4 sbl-scroll overflow-y-auto pr-1" style={{ position: 'sticky', top: 118, maxHeight: 'calc(100vh - 170px)' }}>
      <SubTabs value={pane} onChange={setPane} label={tt('Side panel', 'Šoninis skydelis')} items={[['week', Calendar, tt('This week', 'Ši savaitė')], ['news', Newspaper, tt('News', 'Žinios'), g.news.filter((n) => n.week === g.week).length || null]]} />
      {pane === 'week' && <FestivalCard g={g} act={act} />}
      {pane === 'week' && <WeekPlan g={g} act={act} />}
      {pane === 'week' && <TourCard g={g} onSelect={onSelect} />}
      {pane === 'week' && <Warnings g={g} />}
      {pane === 'week' && <RaceBriefing g={g} shares={shares} onOpen={onSelect} />}
      {pane === 'news' && <section className="cx-card p-4">
        <CardTitle>{tt('Latest news', 'Naujausios žinios')}</CardTitle>
        <div className="flex flex-col">
          {g.news.slice(0, 6).map((n) => {
            const v = newsView(g, n);
            const Icon = v.icon;
            return (
              <div key={n.id} className="flex gap-2.5 py-2" style={{ borderTop: `1px solid ${LINE}` }}>
                {v.p ? <Portrait who={v.p} size={30} /> : <span className="grid place-items-center rounded-full shrink-0" style={{ width: 30, height: 30, background: 'rgba(255,255,255,.07)' }}><Icon size={15} /></span>}
                <div className="min-w-0"><div className="font-bold text-sm leading-snug">{v.title}</div><div className="text-xs t-muted leading-snug mt-0.5">{v.text}</div></div>
              </div>
            );
          })}
        </div>
      </section>}
      {pane === 'news' && <SocialFeed g={g} limit={5} compact />}
    </div>
  );
}
function DockPanel({ children, label }) {
  return <section className="cx-card sbl-scroll overflow-y-auto sbl-fade" aria-label={label} style={{ position: 'sticky', top: 118, maxHeight: 'calc(100vh - 170px)', paddingBottom: 18, padding: 0 }}>{children}</section>;
}
function Ticker({ g }) {
  const items = g.news.slice(0, 6).map((n) => newsView(g, n).title);
  if (!items.length) return null;
  return (
    <div className="cx-card flex items-stretch overflow-hidden" style={{ padding: 0, boxShadow: SHADOW }}>
      <span className="shrink-0 grid place-items-center px-3 text-xs font-black text-white" style={{ background: '#E5484D', borderRight: `1px solid ${LINE}` }}>{tt('NEWS', 'ŽINIOS')}</span>
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
    <button key={id} type="button" onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined} className="flex flex-col items-center justify-center gap-0.5 h-14 rounded-xl font-bold transition" style={{ fontSize: 11, color: tab === id ? '#0B0E14' : '#AAB3C2', background: tab === id ? '#F3F4F6' : 'transparent' }}>
      <Icon size={22} strokeWidth={tab === id ? 2.6 : 2.1} />{label}
    </button>
  );
  const last = g.week >= WEEKS;
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', background: 'rgba(8,10,15,.97)', borderTop: `1px solid ${LINE}`, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <NewsTicker g={g} />
      <div className="max-w-lg mx-auto grid grid-cols-5 items-center gap-1 py-1.5" style={GUTTER}>
        {item('map', MapIcon, tt('Map', 'Žemėlapis'))}
        {item('polls', BarChart3, tt('Polls', 'Apklausos'))}
        <div className="flex justify-center">
          <button type="button" onClick={onEnd} className={`cx-btn cx-cta cx-sun -mt-8 flex-col gap-0.5 ${glowEnd ? 'cx-glow' : ''}`} style={{ width: 86, height: 70, borderRadius: 18, fontSize: 15, lineHeight: 1.05 }}>
            {last ? <Vote size={25} strokeWidth={2.6} /> : <Play size={24} strokeWidth={2.6} style={{ fill: '#1B1204' }} />}
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
    case 'event': { const ev = EVENT_MAP[n.ev]; return { icon: Newspaper, p: n.rv, title: evFill(L(ev.title), n), text: `${tt('You chose:', 'Jūsų sprendimas:')} ${evFill(L(ev.choices[n.ci].label), n)}.${n.note ? ` ${L(n.note)}` : ''}` }; }
    case 'pacts': return { icon: Handshake, title: tt('Runoff pacts signed', 'Pasirašyti antrojo turo susitarimai'), text: n.list.map((q) => partyShort(q)).join(', ') };
    case 'debate': return { icon: Mic, title: tt(`LRT debate: ${L(DEBATES[n.d].title)}`, `LRT debatai: ${L(DEBATES[n.d].title)}`), text: tt(`Viewers say ${P(n.winner)} won (${fmtPct(n.pct, 0)}). You came #${n.rank}.`, `Žiūrovų nuomone, laimėjo ${P(n.winner)} (${fmtPct(n.pct, 0)}). Jūsų vieta – ${n.rank}.`) };
    case 'vrk': return { icon: Gavel, title: tt('VRK fines your party', 'VRK skyrė baudą jūsų partijai'), text: tt(`You broke the campaign spending limit. Fine: ${fmtEur(n.fine)}.`, `Viršijote rinkimų kampanijos išlaidų limitą. Bauda: ${fmtEur(n.fine)}.`) };
    case 'gamble': return n.game === 'casino'
      ? { icon: Dices, title: tt('Photos: your campaign team at a casino', 'Nuotraukos: jūsų štabas – kazino'), text: tt('Tabloids show your team betting party money in Vilnius Old Town. Scandal!', 'Bulvariniai portalai skelbia, kad jūsų komanda Vilniaus senamiestyje statė partijos pinigus. Skandalas!') }
      : { icon: Ticket, title: tt('Leaked: a betting slip paid with party money', 'Nutekėjo lažybų kvitas, apmokėtas partijos pinigais'), text: tt('A Žalgiris betting slip paid from the campaign account goes viral.', 'Kvitas su statymu už „Žalgirį“, apmokėtas iš kampanijos sąskaitos, plinta internete.') };
    case 'kompro': return n.outcome === 'hit'
      ? { icon: Search, p: n.target, title: tt(`Leaked documents embarrass ${P(n.target)}`, `Nutekinti dokumentai kompromituoja ${P(n.target)}`), text: tt(`Your investigators’ findings are on every front page. ${P(n.target)} loses ground.`, `Jūsų tyrėjų radiniai – visų portalų pirmuosiuose puslapiuose. ${P(n.target)} praranda pozicijas.`) }
      : { icon: Search, title: tt('Caught digging for dirt', 'Įkliuvote renkant kompromatą'), text: tt(`Journalists reveal you hired investigators to target ${P(n.target)}.`, `Žurnalistai atskleidė, kad samdėte tyrėjus prieš ${P(n.target)}.`) };
    case 'star': return { icon: Star, title: tt('Star candidate signed', 'Pritrauktas žinomas kandidatas'), text: tt(`${L(STAR_PEOPLE[n.who])} will run for you in ${consName(cnm(n.cid))}.`, `${consName(cnm(n.cid))}: už jus kandidatuos ${L(STAR_PEOPLE[n.who])}.`) };
    case 'endorse': { const o = ORGS.find((x) => x.id === n.org); return { icon: Handshake, p: n.p, title: tt(`${o.name.en} back ${P(n.p)}`, `${o.name.lt} remia ${P(n.p)}`), text: n.p === g.player ? tt('A big endorsement for your campaign.', 'Didelė parama jūsų kampanijai.') : tt('A rival wins an important endorsement.', 'Varžovas gauna svarbią paramą.') }; }
    case 'meet': { const e = ENC_MAP[n.enc]; return { icon: MessageCircle, title: tt(`Street conversation in ${rs(n.rid)}`, `Pokalbis gatvėje – ${rs(n.rid)}`), text: `${tt('“', '„')}${L(e.q)}${tt('”', '“')} ${tt('You:', 'Jūs:')} ${L(e.answers[n.ci].t)}` }; }
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
      {out.map((t) => <div key={t} className="rounded-2xl px-3 py-2 text-sm font-bold flex gap-2 items-start" style={{ background: BAD_BG, border: `1px solid ${LINE}` }}><AlertTriangle size={17} className="shrink-0 mt-0.5" style={{ color: RED }} />{t}</div>)}
    </div>
  );
}
function RaceBriefing({ g, shares, onOpen }) {
  if (g.ap <= 0) {
    return <Coach essential title={tt('That’s your week done!', 'Savaitė baigta!')}>{tt('You’ve used all your energy. Tap the big yellow Next week button to see how the polls move.', 'Panaudojote visą energiją. Spauskite didelį geltoną mygtuką „Kita savaitė“ ir pažiūrėkite, kaip pasikeis reitingai.')}</Coach>;
  }
  const races = REGIONS.map((r) => ({ r, info: raceInfo(g, r, shares[r.id]) })).filter((x) => Math.abs(x.info.gap) < 4).sort((a, b) => Math.abs(a.info.gap) - Math.abs(b.info.gap));
  return (
    <Card className="p-3">
      <div className="flex items-center gap-3">
        <span className="grid place-items-center rounded-full shrink-0" style={{ width: 42, height: 42, background: WARN_BG, border: `1px solid ${LINE}` }}><Target size={21} strokeWidth={2.5} /></span>
        <div className="min-w-0 flex-1">
          <div className="cx-title text-lg leading-tight">{tt(`Week ${g.week}: your call`, `${g.week} savaitė: sprendžiate jūs`)}</div>
          <div className="text-sm font-semibold t-muted">{tt(`${g.ap} energy left. These are the closest races right now.`, `Liko ${g.ap} energijos. Štai šiuo metu lygiausios kovos.`)}</div>
        </div>
      </div>
      {races.length ? (
        <div className="flex flex-wrap gap-2 mt-3">
          {races.map(({ r, info }) => (
            <button key={r.id} type="button" onClick={() => onOpen(r.id)} className="cx-chip cx-tap px-3 py-1.5 text-sm" style={{ background: info.gap >= 0 ? GOOD_BG : WARN_BG }}>
              <PartyDot p={info.lead} size={11} />{rs(r)}
              <span className="cx-num" style={{ color: info.gap >= 0 ? GREEN : AMBER }}>{fmtSigned(info.gap)}</span>
              <span className="t-muted text-xs">· {r.seats}</span>
            </button>
          ))}
        </div>
      ) : <p className="text-sm font-semibold t-muted mt-3">{tt('No region is within 4 points right now.', 'Šiuo metu nė viename regione skirtumas nesiekia 4 punktų.')}</p>}
      <p className="text-xs font-bold t-muted mt-2">{tt('Number = your lead (+) or gap (−) in points · after the dot = seats', 'Skaičius – jūsų persvara (+) arba atsilikimas (−) punktais · po taško – mandatai')}</p>
    </Card>
  );
}
function WeekPlan({ g, act }) {
  const o = g.objective;
  const pr = objectiveProgress(g);
  const unity = Math.round(g.unity == null ? 70 : g.unity);
  const prog = !o ? '' : o.kind === 'region' || o.kind === 'national' ? `${fmtSigned(pr.now)} / +${nf(pr.need)}` : o.kind === 'money' ? `${fmtEur(pr.now)} / ${fmtEur(pr.need)}` : o.kind === 'visit' || o.kind === 'door' ? `${pr.now} / ${pr.need}` : o.kind === 'debate' ? tt('Judged after the debate', 'Vertinama po debatų') : pr.ok ? tt('Clean so far', 'Kol kas švaru') : tt('Broken', 'Sulaužyta');
  return (
    <section className="cx-card p-3 flex flex-col gap-3" aria-label={tt('This week’s plan', 'Savaitės planas')}>
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="cx-kicker text-xs">{tt('Message of the week', 'Savaitės žinutė')}</span>
          {g.theme && (g.themeStreak || 0) > 0 && g.theme === g.lastTheme && <span className="text-xs t-muted font-semibold">{tt(`${g.themeStreak} wk in a row`, `${g.themeStreak} sav. iš eilės`)}</span>}
        </div>
        <div className="flex gap-1.5 mt-2 overflow-x-auto cx-layers pb-0.5" role="radiogroup" aria-label={tt('Message of the week', 'Savaitės žinutė')}>
          {THEMES.map((T) => {
            const on = g.theme === T.id;
            return (
              <button key={T.id} type="button" role="radio" aria-checked={on} disabled={!!g.themeLocked && !on} onClick={() => act((gg) => setTheme(gg, T.id))} className="cx-chip shrink-0 px-2.5 text-xs disabled:opacity-40" style={{ minHeight: 32, background: on ? SUN : 'rgba(255,255,255,.06)', color: on ? '#1B1204' : TEXT, borderColor: on ? SUN : LINE2 }}>
                <T.icon size={13} strokeWidth={2.6} />{L(T.name)}
              </button>
            );
          })}
        </div>
        <div className="text-xs t-muted mt-1.5 leading-snug">{g.theme ? tt('Moves where voters care about this: +12%. Elsewhere: −3%. Keeping it for weeks builds buzz.', 'Veiksmai ten, kur tai rūpi: +12 %. Kitur: −3 %. Kartojant kelias savaites auga pagreitis.') : tt('Pick a message before you campaign: it lifts moves where voters care about it.', 'Pasirinkite žinutę prieš agituodami: ji stiprina veiksmus ten, kur tai rūpi.')}{g.themeLocked ? tt(' Locked until next week.', ' Užfiksuota iki kitos savaitės.') : ''}</div>
      </div>
      {o && (
        <div className="rounded-xl p-2.5" style={{ background: pr.ok ? GOOD_BG : 'rgba(255,255,255,.04)', border: `1px solid ${pr.ok ? 'rgba(74,222,128,.4)' : LINE}` }}>
          <div className="flex items-center gap-2">
            <span className="cx-kicker text-xs">{tt('Party board task', 'Partijos tarybos užduotis')}</span>
            <span className="ml-auto cx-pill text-xs px-2 h-6">{L(REWARD_TEXT[o.reward])}</span>
          </div>
          <div className="text-sm font-semibold mt-1 leading-snug">{L(objectiveText(o))}</div>
          <div className="text-xs font-bold mt-1" style={{ color: pr.ok ? GREEN : MUTED }}>{pr.ok ? `✓ ${tt('On track', 'Vykdoma')}` : prog}</div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Users size={16} className="shrink-0" />
        <span className="text-xs font-bold shrink-0">{tt('Party unity', 'Partijos vienybė')}</span>
        <div className="flex-1"><Bar value={unity} color={unity >= 60 ? '#4ADE80' : unity >= 40 ? SUN : '#F87171'} h={10} mark={40} /></div>
        <span className="cx-num">{unity}</span>
      </div>
      {unity < 40 && <div className="text-xs font-bold" style={{ color: RED }}>{tt('Low unity: a revolt is brewing, and rebels may vote against you as PM.', 'Vienybė žema: bręsta maištas, maištininkai gali balsuoti prieš jus.')}</div>}
    </section>
  );
}
function StaffRoom({ g, act }) {
  const staff = g.staff || [];
  const wages = sum(staff.map((id) => STAFF.find((x) => x.id === id).wage));
  return (
    <Card className="p-4">
      <CardTitle sub={tt(`Hire up to ${STAFF_MAX}. Wages are paid every week: ${fmtEur(wages)} now. If you can’t pay, someone quits.`, `Galite samdyti iki ${STAFF_MAX}. Algos mokamos kas savaitę: dabar ${fmtEur(wages)}. Nesumokėjus kas nors išeina.`)}>{tt('Campaign team', 'Štabo komanda')}</CardTitle>
      <div className="flex flex-col gap-2">
        {STAFF.map((S) => {
          const on = staff.includes(S.id);
          return (
            <div key={S.id} className="rounded-xl p-2.5 flex items-center gap-3" style={{ background: on ? ACC_BG : 'rgba(255,255,255,.04)', border: `1px solid ${on ? 'rgba(245,165,36,.45)' : LINE}` }}>
              <Portrait who={S.look} size={46} square mood={on ? 'grin' : 'ok'} title={L(S.name)} />
              <div className="min-w-0 flex-1">
                <div className="font-bold leading-tight">{L(S.name)}</div>
                <div className="text-xs t-muted leading-snug">{L(S.desc)}</div>
                <div className="text-xs font-semibold mt-0.5">{fmtEur(S.wage)} / {tt('week', 'sav.')}{on ? '' : ` · ${tt('signing', 'įstojimas')} ${fmtEur(S.wage * 2)}`}</div>
              </div>
              {on
                ? <Btn kind="white" className="h-10 px-3 text-sm shrink-0" onClick={() => act((gg) => fireStaff(gg, S.id))}>{tt('Let go', 'Atleisti')}</Btn>
                : <Btn className="h-10 px-3 text-sm shrink-0" disabled={staff.length >= STAFF_MAX || g.money < S.wage * 2} onClick={() => act((gg) => hireStaff(gg, S.id))}>{tt('Hire', 'Samdyti')}</Btn>}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
function RivalsCard({ g, nat }) {
  const me = g.player;
  const H = g.history;
  const prev = H.length > 1 ? H[H.length - 2].shares : H[0].shares;
  const rivals = PARTY_IDS.filter((q) => q !== me).sort((a, b) => nat[b] - nat[a]).slice(0, 6);
  const [open, setOpen] = useState(null);
  return (
    <Card className="p-4">
      {open && <RivalSheet g={g} q={open} onClose={() => setOpen(null)} />}
      <CardTitle sub={tt('The six biggest rivals. Tap one for the full dossier.', 'Šeši didžiausi varžovai. Paspauskite, kad atvertumėte dosjė.')}>{tt('Rival dossier', 'Varžovų dosjė')}</CardTitle>
      <div className="flex flex-col">
        {rivals.map((q) => {
          const mv = (g.rivalMoves || []).find((m) => m.p === q);
          const hits = mv ? mv.list.filter((x) => x.type === 'attack' && x.target === me).length : 0;
          const c = compat(g, me, q);
          const mom = g.momentum[q];
          return (
            <button type="button" key={q} onClick={() => { setOpen(q); SFX.play('tap'); }} aria-label={tt(`${partyShort(q)} dossier`, `${partyShort(q)} dosjė`)} className="cx-tap w-full text-left flex items-center gap-3 py-2" style={{ borderTop: `1px solid ${LINE}` }}>
              <Portrait who={q} size={42} square mood={hits ? 'grr' : mom > 0.5 ? 'grin' : 'ok'} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2"><span className="cx-title text-lg leading-none">{partyShort(q)}</span><span className="cx-num">{fmtPct(nat[q])}</span><span className="text-xs"><Delta v={nat[q] - prev[q]} pct /></span></div>
                <div className="text-xs t-muted truncate mt-0.5">{mv && mv.list.length ? mv.list.map((x) => `${moveWord(x, me)} – ${rs(x.rid)}`).join(' · ') : tt('Quiet week', 'Rami savaitė')}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-bold" style={{ color: c >= 55 ? GREEN : c >= 40 ? AMBER : RED }}>{c >= 55 ? tt('Possible ally', 'Galimas partneris') : c >= 40 ? tt('Maybe', 'Galbūt') : tt('Opponent', 'Priešininkas')}</div>
                <div className="text-xs t-muted">{mom > 0.5 ? '▲' : mom < -0.5 ? '▼' : '•'} {tt('buzz', 'pagreitis')}{hits ? ` · ⚔ ${hits}` : ''}</div>
              </div>
              <ChevronRight size={18} className="shrink-0 t-muted" />
            </button>
          );
        })}
      </div>
    </Card>
  );
}
function TourCard({ g, onSelect }) {
  const route = (g.route || []).filter((x, i, arr) => i === 0 || arr[i - 1] !== x);
  return (
    <button type="button" onClick={() => onSelect(g.leaderAt)} className="cx-tap cx-card w-full p-3 flex items-center gap-3 text-left" style={{ boxShadow: SHADOW }}>
      <Portrait who={g.player} size={46} badge />
      <div className="min-w-0 flex-1">
        <div className="font-black leading-tight">{tt(`${leaderSurname(g.player)} is in ${rs(g.leaderAt)}`, `${leaderSurname(g.player)} dabar – ${rs(g.leaderAt)}`)}</div>
        <div className="text-xs font-bold t-muted leading-snug">{g.freeTrip ? tt('One free bus ride to a neighbouring region this week. Longer trips cost 1 energy.', 'Šią savaitę – viena nemokama kelionė į kaimyninį regioną. Tolimesnės – 1 energija.') : tt('Free ride used. Further trips cost 1 energy.', 'Nemokama kelionė išnaudota. Kitos kelionės – 1 energija.')}</div>
        {route.length > 1 && <div className="text-xs font-extrabold mt-1 inline-flex items-center gap-1 flex-wrap"><Route size={13} />{route.map((x) => rs(x)).join(' → ')}</div>}
      </div>
      <ChevronRight size={20} className="shrink-0" />
    </button>
  );
}
const LAYER_KEY = 'seimas-bfl-layer';
/* ============================================================
   Map board: zoom, pan, pinch, hover card, overlays, seat strip
   ============================================================ */
const MAP_VB = [-40, -26, 870, 660];
function clampView(v) {
  const [X, Y, W, H] = MAP_VB;
  const w = clamp(v[2], W / 3.6, W);
  const h = (w * H) / W;
  return [clamp(v[0], X, X + W - w), clamp(v[1], Y, Y + H - h), w, h];
}
function SeatStrip({ seats, me }) {
  const order = SEAT_ORDER.filter((q) => (seats[q] || 0) > 0);
  const mine = seats[me] || 0;
  return (
    <div className="px-3 py-2.5" style={{ borderTop: `1px solid ${LINE}`, background: 'rgba(7,9,13,.55)' }}>
      <div className="flex items-baseline justify-between gap-2 text-xs font-bold">
        <span className="cx-kicker">{tt('Projected Seimas', 'Numatomas Seimas')}</span>
        <span><span className="cx-num text-base" style={{ color: mine >= MAJORITY ? GREEN : TEXT }}><CountUp to={mine} /></span> <span className="t-muted">/ 141 · {mine >= MAJORITY ? tt('majority!', 'dauguma!') : tt(`${MAJORITY - mine} short of 71`, `iki 71 trūksta ${MAJORITY - mine}`)}</span></span>
      </div>
      <div className="relative mt-1.5 flex rounded-md overflow-hidden" style={{ height: 16, background: 'rgba(255,255,255,.06)' }} role="img" aria-label={tt(`Projected seats: you ${mine} of 141`, `Numatomi mandatai: jūs ${mine} iš 141`)}>
        {order.map((q) => (
          <div key={q} title={`${partyShort(q)} ${seats[q]}`} style={{ width: `${(seats[q] / 141) * 100}%`, background: PARTIES[q] ? PARTIES[q].color : '#64748B', opacity: q === me ? 1 : 0.62, boxShadow: q === me ? `inset 0 0 0 2px #fff` : 'inset -1px 0 0 rgba(0,0,0,.45)', transition: 'width .6s cubic-bezier(.2,.8,.2,1)' }} />
        ))}
        <span className="absolute top-[-3px] bottom-[-3px]" style={{ left: `${(MAJORITY / 141) * 100}%`, width: 2, background: '#fff', boxShadow: '0 0 0 1px #000' }} />
      </div>
      <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 mt-1.5 text-[11px] font-bold t-muted">
        {order.slice().sort((a, b) => seats[b] - seats[a]).slice(0, 6).map((q) => <span key={q} className="inline-flex items-center gap-1" style={{ color: q === me ? TEXT : undefined }}><span className="inline-block rounded-sm" style={{ width: 8, height: 8, background: PARTIES[q] ? PARTIES[q].color : '#64748B' }} />{partyShort(q)} {seats[q]}</span>)}
        <span className="ml-auto">{tt('line = 71', 'linija – 71')}</span>
      </div>
    </div>
  );
}
function RegionTip({ g, id, shares, proj }) {
  const r = REG[id];
  const s = shares[id];
  const info = raceInfo(g, r, s);
  const top = info.ord.slice(0, 3);
  const mySeats = proj.smd.filter((e) => e.rid === id && e.winner === g.player).length;
  const moves = (g.weekMoves || []).filter((m) => m.rid === id).length;
  return (
    <div className="rounded-xl p-3" style={{ width: 250, background: 'rgba(12,15,22,.96)', border: `1px solid ${LINE2}`, boxShadow: '0 18px 40px rgba(0,0,0,.55)' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="cx-title text-lg leading-tight">{rl(id)}</div>
          <div className="text-xs t-muted font-semibold">{r.seats} {seatsWord(r.seats)} · {tt(`you win ${mySeats}`, `laimėtumėte ${mySeats}`)}</div>
        </div>
        <StatusPill status={info.status} />
      </div>
      <div className="flex flex-col gap-1 mt-2">
        {top.map((q) => (
          <div key={q} className="grid items-center gap-2 text-xs font-bold" style={{ gridTemplateColumns: '58px 1fr 40px' }}>
            <span className="truncate" style={{ color: q === g.player ? SUN : TEXT }}>{q === g.player ? tt('You', 'Jūs') : partyShort(q)}</span>
            <span className="cx-track" style={{ height: 7 }}><span className="block h-full" style={{ width: `${clamp(s[q] / Math.max(1, s[top[0]]) * 100, 2, 100)}%`, background: PARTIES[q].color }} /></span>
            <span className="text-right cx-num">{fmtPct(s[q], 1)}</span>
          </div>
        ))}
      </div>
      <div className="text-xs font-semibold mt-2 leading-snug">{raceText(info)}</div>
      <div className="flex flex-wrap gap-1.5 mt-2 text-[11px] font-bold">
        {g.leaderAt === id && <span className="cx-chip px-2 py-0.5" style={{ color: SUN }}><Bus size={11} />{tt('Leader here', 'Lyderis čia')}</span>}
        {moves > 0 && <span className="cx-chip px-2 py-0.5"><Check size={11} />{tt(`${moves} moves this week`, `${moves} veiksm. šią sav.`)}</span>}
        <span className="cx-chip px-2 py-0.5"><Users size={11} />{tt('Team', 'Komanda')} {Math.round(g.gg[id][g.player])}</span>
      </div>
      <div className="text-[11px] t-muted mt-2">{tt('Click to open the region', 'Spauskite, kad atvertumėte regioną')}</div>
    </div>
  );
}
function MapBoard({ g, shares, proj, sel, onSelect, fx, wide }) {
  const me = g.player;
  const [layer, setLayer] = useState(() => { try { return window.localStorage.getItem(LAYER_KEY) || 'lead'; } catch (e) { return 'lead'; } });
  const pickLayer = (id) => { setLayer(id); SFX.play('tap'); try { window.localStorage.setItem(LAYER_KEY, id); } catch (e) { /* ignore */ } };
  const [view, setView] = useState(MAP_VB);
  const [hover, setHover] = useState(null);
  const wrap = useRef(null);
  const tip = useRef(null);
  const ptrs = useRef(new Map());
  const gest = useRef(null);
  const suppress = useRef(false);
  const viewRef = useRef(view);
  viewRef.current = view;
  const zoomed = view[2] < MAP_VB[2] - 1;
  const zoomBy = (k, ax = 0.5, ay = 0.5) => setView((v) => { const w = v[2] * k, h = v[3] * k; return clampView([v[0] + (v[2] - w) * ax, v[1] + (v[3] - h) * ay, w, h]); });
  const rel = (cx, cy) => { const r = wrap.current.getBoundingClientRect(); return [(cx - r.left) / r.width, (cy - r.top) / r.height, r]; };
  useEffect(() => {
    const el = wrap.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      if (!(e.ctrlKey || e.metaKey || viewRef.current[2] < MAP_VB[2] - 1)) return;
      e.preventDefault();
      const [ax, ay] = rel(e.clientX, e.clientY);
      zoomBy(e.deltaY > 0 ? 1.15 : 1 / 1.15, ax, ay);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);
  const moveTip = (e) => {
    if (!tip.current || !wrap.current) return;
    const [, , r] = rel(e.clientX, e.clientY);
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const left = x > r.width - 280 ? x - 266 : x + 16;
    const top = clamp(y - 40, 6, Math.max(6, r.height - 230));
    tip.current.style.transform = `translate(${left}px, ${top}px)`;
  };
  const onDown = (e) => {
    suppress.current = false;
    ptrs.current.set(e.pointerId, [e.clientX, e.clientY]);
    if (ptrs.current.size === 1) gest.current = { x: e.clientX, y: e.clientY, v: viewRef.current, moved: false };
    else if (ptrs.current.size === 2) {
      const [a, b] = [...ptrs.current.values()];
      const [mx, my] = rel((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      gest.current = { pinch: Math.hypot(a[0] - b[0], a[1] - b[1]), v: viewRef.current, mx, my, moved: true };
    }
  };
  const onMove = (e) => {
    if (e.pointerType === 'mouse') moveTip(e);
    if (!ptrs.current.has(e.pointerId)) return;
    ptrs.current.set(e.pointerId, [e.clientX, e.clientY]);
    const G = gest.current;
    if (!G) return;
    if (G.pinch && ptrs.current.size === 2) {
      const [a, b] = [...ptrs.current.values()];
      const k = G.pinch / Math.max(20, Math.hypot(a[0] - b[0], a[1] - b[1]));
      const w = G.v[2] * k, h = G.v[3] * k;
      setView(clampView([G.v[0] + (G.v[2] - w) * G.mx, G.v[1] + (G.v[3] - h) * G.my, w, h]));
      return;
    }
    const dx = e.clientX - G.x, dy = e.clientY - G.y;
    if (!G.moved && Math.hypot(dx, dy) > 6) G.moved = true;
    if (G.moved && G.v[2] < MAP_VB[2] - 1) {
      const r = wrap.current.getBoundingClientRect();
      setView(clampView([G.v[0] - (dx / r.width) * G.v[2], G.v[1] - (dy / r.height) * G.v[3], G.v[2], G.v[3]]));
    }
  };
  const onUp = (e) => {
    ptrs.current.delete(e.pointerId);
    if (gest.current && gest.current.moved && (gest.current.pinch || gest.current.v[2] < MAP_VB[2] - 1)) suppress.current = true;
    if (ptrs.current.size === 0) gest.current = null;
  };
  const onCancel = (e) => { ptrs.current.delete(e.pointerId); if (ptrs.current.size === 0) gest.current = null; };
  const onClickCap = (e) => { if (suppress.current) { e.stopPropagation(); e.preventDefault(); suppress.current = false; } };
  const onHover = wide ? setHover : undefined;
  const lead = REGIONS.filter((r) => regionLook(shares[r.id]).lead === me).length;
  const close = REGIONS.filter((r) => raceInfo(g, r, shares[r.id]).status === 'close').length;
  const ctrl = (label, Icon, fn, dis) => (
    <button type="button" aria-label={label} title={label} disabled={dis} onClick={(e) => { e.stopPropagation(); fn(); SFX.play('tap'); }} className="cx-btn grid place-items-center" style={{ width: wide ? 36 : 32, height: wide ? 36 : 32, borderRadius: 10, background: 'rgba(12,15,22,.85)', border: `1px solid ${LINE2}`, opacity: dis ? 0.4 : 1 }}><Icon size={17} /></button>
  );
  return (
    <div className="cx-card overflow-hidden -mx-2 lg:mx-0" style={{ padding: 0, background: `radial-gradient(ellipse at 50% 40%, #13233A, ${MAP_SEA} 70%)` }}>
      <div className="flex items-center gap-2 px-3 py-2.5 cx-bar">
        <Layers size={18} strokeWidth={2.4} color={SUN} />
        <span className="cx-title text-lg lg:text-xl leading-none whitespace-nowrap">{wide ? tt('Campaign map', 'Kampanijos žemėlapis') : tt('Map', 'Žemėlapis')}</span>
        <span className="ml-auto flex items-center gap-1.5 text-xs font-bold">
          <span className="cx-chip px-2 py-0.5"><Flag size={12} color={SUN} />{tt(`Lead ${lead}/12`, `Pirmaujate ${lead}/12`)}</span>
          <span className="cx-chip px-2 py-0.5 hidden sm:inline-flex"><Swords size={12} color="#FB923C" />{tt(`${close} toss-ups`, `${close} lygios kovos`)}</span>
        </span>
      </div>
      <div className="cx-layers flex gap-1.5 overflow-x-auto px-3 pt-2 pb-1" role="tablist" aria-label={tt('Map layers', 'Žemėlapio sluoksniai')}>
        {MAP_LAYERS.map((Ly) => {
          const Icon = Ly.icon;
          const on = layer === Ly.id;
          return <button key={Ly.id} type="button" role="tab" aria-selected={on} onClick={() => pickLayer(Ly.id)} className="cx-chip shrink-0 px-3 py-1 text-xs" style={{ background: on ? '#F3F4F6' : 'rgba(255,255,255,.06)', color: on ? '#0B0E14' : TEXT, borderColor: on ? '#F3F4F6' : LINE2, minHeight: 32 }}><Icon size={13} strokeWidth={2.6} />{L(Ly.label)}</button>;
        })}
      </div>
      <div
        ref={wrap}
        className="relative"
        style={{ padding: 4, touchAction: zoomed ? 'none' : 'pan-y', cursor: zoomed ? 'grab' : undefined }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onCancel}
        onPointerLeave={(e) => { if (e.pointerType === 'mouse') { onCancel(e); setHover(null); } }}
        onClickCapture={onClickCap}
        onDoubleClick={(e) => { const [ax, ay] = rel(e.clientX, e.clientY); zoomBy(0.6, ax, ay); }}
      >
        <CartoonMap shares={shares} sel={sel} onSelect={onSelect} g={g} proj={proj} layer={layer} fx={fx} view={view} onHover={onHover} hover={hover} />
        <div className="absolute flex flex-col gap-1.5" style={{ top: 10, right: 10 }}>
          {ctrl(tt('Zoom in', 'Priartinti'), Plus, () => zoomBy(0.7), view[2] <= MAP_VB[2] / 3.6 + 1)}
          {ctrl(tt('Zoom out', 'Nutolinti'), Minus, () => zoomBy(1 / 0.7), !zoomed)}
          {ctrl(tt('Show all of Lithuania', 'Rodyti visą Lietuvą'), Maximize2, () => setView(MAP_VB), !zoomed)}
          {g.leaderAt && ctrl(tt('Find your leader', 'Rasti lyderį'), LocateFixed, () => { const [x, y] = anchorOf(g.leaderAt); const w = MAP_VB[2] / 2, h = (w * MAP_VB[3]) / MAP_VB[2]; setView(clampView([x - w / 2, y - h / 2, w, h])); })}
        </div>
        {zoomed && <div className="absolute left-3 top-3 text-[11px] font-bold px-2 py-1 rounded-md pointer-events-none" style={{ background: 'rgba(12,15,22,.8)', border: `1px solid ${LINE}` }}>{tt('Drag to move', 'Tempkite, kad judintumėte')} · {Math.round((MAP_VB[2] / view[2]) * 100)}%</div>}
        {wide && (
          <div ref={tip} className="absolute left-0 top-0 pointer-events-none z-10" style={{ transition: 'opacity .15s', opacity: hover ? 1 : 0 }}>
            {hover && <RegionTip g={g} id={hover} shares={shares} proj={proj} />}
          </div>
        )}
      </div>
      <SeatStrip seats={proj.seats} me={me} />
      <div style={{ borderTop: `1px solid ${LINE}`, background: 'rgba(7,9,13,.55)' }}><MapLegend layer={layer} g={g} shares={shares} /></div>
    </div>
  );
}

/* ============================================================
   Phone header menu (language, sound, help)
   ============================================================ */
function HeaderMenu({ lang, setLang, onHelp }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative shrink-0">
      <button type="button" aria-label={tt('Menu', 'Meniu')} aria-expanded={open} onClick={() => { setOpen(!open); SFX.play('tap'); }} className="cx-btn" style={{ width: 40, height: 40, borderRadius: 12, background: open ? '#F3F4F6' : 'rgba(255,255,255,.07)', color: open ? INK : TEXT }}><Menu size={20} /></button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 z-50 mt-2 p-2 rounded-xl flex flex-col gap-1 sbl-pop" style={{ width: 230, background: '#1A202B', border: `1px solid ${LINE2}`, boxShadow: '0 18px 40px rgba(0,0,0,.6)' }}>
            <div className="flex items-center justify-between px-2 py-1.5"><span className="font-bold text-sm">{tt('Language', 'Kalba')}</span><LangToggle lang={lang} setLang={setLang} /></div>
            <div className="flex items-center justify-between px-2 py-1.5"><span className="font-bold text-sm">{tt('Sound', 'Garsas')}</span><SoundToggle size={36} /></div>
            <button type="button" onClick={() => { setOpen(false); onHelp(); }} className="cx-btn justify-start gap-2 px-2 py-2.5 text-sm font-bold rounded-lg" style={{ background: 'rgba(255,255,255,.05)' }}><HelpCircle size={18} />{tt('How to play', 'Kaip žaisti')}</button>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   Social media feed
   ============================================================ */
const FEED_PEOPLE = {
  seniors: { name: bi('Ona, pensioner', 'Ona, pensininkė'), handle: '@ona_kaunas' },
  youth: { name: bi('Mantas', 'Mantas'), handle: '@mantas.vln' },
  farmers: { name: bi('Jonas, farmer', 'Jonas, ūkininkas'), handle: '@ukis_jonas' },
  business: { name: bi('Tomas, founder', 'Tomas, įkūrėjas'), handle: '@tomas_startup' },
  public: { name: bi('Dr Daiva', 'Dr. Daiva'), handle: '@dr_daiva' },
  minority: { name: bi('Irena', 'Irena'), handle: '@irena_vilnius' },
  anchor: { name: bi('Politics 360', 'Politika 360'), handle: '@politika360', verified: true },
  pollst: { name: bi('Poll Watch LT', 'Apklausų stebėtojas'), handle: '@apklausos_lt', verified: true },
};
const FEED_MOVE = {
  rally: bi('Went to {L}’s rally in {R}. Bigger crowd than I expected! 👏', 'Buvau {P} mitinge – {R}. Minia didesnė, nei tikėjausi! 👏'),
  digital: bi('Third {P} ad in my feed today 🙄', 'Jau trečia {P} reklama mano sraute šiandien 🙄'),
  tv: bi('Another {P} ad during the evening news. At least it was short.', 'Per vakaro žinias – vėl {P} reklama. Bent jau trumpa.'),
  door: bi('{P} volunteers knocked on our door in {R}. Polite, left a leaflet.', '{R}: pas mus užsuko {P} savanoriai. Mandagūs, paliko lankstinuką.'),
  attack: bi('That {P} attack ad in {R} is a bit much. Talk about ideas!', 'Ta {P} puolamoji reklama ({R}) – per daug. Kalbėkit apie idėjas!'),
  star: bi('Heard a well-known name will run for {P} here in {R} 👀', 'Girdėjau, kad {R} už {P} kandidatuos žinomas žmogus 👀'),
};
const FEED_MOOD = {
  good: [bi('First time in years {P} talks about people like me. Voting for them.', 'Pirmą kartą per daug metų {P} kalba apie tokius kaip aš. Balsuosiu.'), bi('{L} actually listens. Didn’t expect that.', '{L} tikrai klauso. Nesitikėjau.')],
  bad: [bi('{P} doesn’t care about us at all. Not voting for them.', '{P} mumis visai nesidomi. Už juos nebalsuosiu.'), bi('Nice promises, {L}. We’ve heard them before.', '{P} gražiai žada, bet tai girdėjom jau ne kartą.')],
};
const FEED_TAKES = [bi('Let’s see what this does to the polls.', 'Pažiūrėsim, kaip tai atsilieps reitingams.'), bi('The campaign is heating up 🔥', 'Kampanija įkaista 🔥'), bi('Big week in Lithuanian politics.', 'Didelė savaitė Lietuvos politikoje.'), bi('Nobody saw that coming.', 'To niekas nesitikėjo.')];
function feedRng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function feedPosts(g) {
  const me = g.player;
  const P = partyShort(me);
  const Lname = PARTIES[me].leader;
  const rnd = feedRng(g.week * 977 + (g.stats.actions || 0) * 31 + g.news.length * 7 + me.length);
  const fill = (t, rid) => L(t).replace(/\{P\}/g, P).replace(/\{L\}/g, Lname).replace(/\{R\}/g, rid ? rs(rid) : '');
  const big = (k) => Math.round((k * (0.5 + rnd())) / 10) * 10 + Math.round(rnd() * 9);
  const posts = [];
  (g.weekMoves || []).slice(-4).reverse().forEach((m, i) => {
    const r = REG[m.rid];
    const who = m.type === 'digital' || (r && r.urban > 0.6) ? (i % 2 ? 'business' : 'youth') : (i % 2 ? 'farmers' : 'seniors');
    const t = FEED_MOVE[m.type] || FEED_MOVE.rally;
    const tone = m.type === 'attack' || m.type === 'digital' ? 'bad' : 'good';
    posts.push({ who, text: fill(t, m.rid), likes: big(tone === 'good' ? 300 : 180), shares: big(40), comments: big(25), tone, time: tt(`${i + 1}h`, `${i + 1} val.`) });
  });
  const H = g.history;
  if (H.length > 1) {
    const d = H[H.length - 1].shares[me] - H[H.length - 2].shares[me];
    posts.push({ who: 'pollst', text: tt(`New poll: ${P} ${fmtPct(H[H.length - 1].shares[me])} (${d >= 0 ? '+' : '−'}${nf(Math.abs(d))} pts). Leader: ${partyShort(PARTY_IDS.slice().sort((a, b) => H[H.length - 1].shares[b] - H[H.length - 1].shares[a])[0])}. #Seimas2028`, `Nauja apklausa: ${P} ${fmtPct(H[H.length - 1].shares[me])} (${d >= 0 ? '+' : '−'}${nf(Math.abs(d))} proc. p.). Pirmauja ${partyShort(PARTY_IDS.slice().sort((a, b) => H[H.length - 1].shares[b] - H[H.length - 1].shares[a])[0])}. #Seimas2028`), likes: big(900), shares: big(220), comments: big(140), tone: d >= 0 ? 'good' : 'bad', time: tt('5h', '5 val.') });
  }
  const moods = GROUPS.map((G) => [G.id, (g.groupMood && g.groupMood[G.id]) || 0]).sort((a, b) => b[1] - a[1]);
  if (moods[0][1] > 1.5) posts.push({ who: moods[0][0], text: fill(FEED_MOOD.good[Math.floor(rnd() * 2)]), likes: big(500), shares: big(60), comments: big(40), tone: 'good', time: tt('7h', '7 val.') });
  const low = moods[moods.length - 1];
  if (low[1] < -1.5) posts.push({ who: low[0], text: fill(FEED_MOOD.bad[Math.floor(rnd() * 2)]), likes: big(450), shares: big(80), comments: big(70), tone: 'bad', time: tt('8h', '8 val.') });
  if (g.cred < 45) posts.push({ who: 'public', text: tt(`Does anyone still believe ${Lname}’s promises? #flipflop`, `Ar dar kas nors tiki ${P} pažadais? #pozicijoskeitimas`), likes: big(700), shares: big(160), comments: big(120), tone: 'bad', time: tt('9h', '9 val.') });
  else if (g.cred > 75) posts.push({ who: 'public', text: tt(`Say what you like about ${P}, they keep their word.`, `Galima ginčytis dėl ${P}, bet žodį jie laiko.`), likes: big(420), shares: big(50), comments: big(30), tone: 'good', time: tt('9h', '9 val.') });
  if (g.scandal > 35) posts.push({ who: 'youth', text: tt(`#${P.replace(/[^A-Za-z]/g, '')}scandal is trending again. Who funds these people?`, `#${P.replace(/[^A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]/g, '')}skandalas vėl populiarus. Kas finansuoja šiuos žmones?`), likes: big(1200), shares: big(400), comments: big(300), tone: 'bad', time: tt('10h', '10 val.') });
  g.news.slice(0, 3).forEach((n, i) => {
    const v = newsView(g, n);
    posts.push({ who: 'anchor', text: `„${v.title}“ – ${L(FEED_TAKES[(n.id + i) % FEED_TAKES.length])}`, likes: big(600), shares: big(150), comments: big(90), tone: 'neutral', time: tt(`${12 + i * 3}h`, `${12 + i * 3} val.`) });
  });
  return posts;
}
function FeedPost({ post, compact }) {
  const pp = FEED_PEOPLE[post.who] || FEED_PEOPLE.anchor;
  const c = post.tone === 'good' ? GREEN : post.tone === 'bad' ? RED : MUTED;
  return (
    <article className="flex gap-2.5 py-2.5" style={{ borderTop: `1px solid ${LINE}` }}>
      <Portrait who={post.who} size={compact ? 34 : 40} mood={post.tone === 'good' ? 'grin' : post.tone === 'bad' ? 'grr' : 'ok'} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-sm min-w-0">
          <span className="font-extrabold truncate">{L(pp.name)}</span>
          {pp.verified && <BadgeCheck size={14} color="#60A5FA" className="shrink-0" />}
          <span className="t-muted text-xs truncate">{pp.handle} · {post.time}</span>
        </div>
        <div className="text-sm leading-snug mt-0.5">{post.text}</div>
        <div className="flex items-center gap-4 mt-1.5 text-xs font-bold t-muted">
          <span className="inline-flex items-center gap-1"><MessageSquare size={13} />{fmtNum(post.comments, 0)}</span>
          <span className="inline-flex items-center gap-1"><Repeat2 size={13} />{fmtNum(post.shares, 0)}</span>
          <span className="inline-flex items-center gap-1" style={{ color: post.tone === 'good' ? '#F472B6' : undefined }}><Heart size={13} fill={post.tone === 'good' ? '#F472B6' : 'none'} />{fmtNum(post.likes, 0)}</span>
          <span className="ml-auto inline-block rounded-full" style={{ width: 8, height: 8, background: c }} title={post.tone} />
        </div>
      </div>
    </article>
  );
}
function SocialFeed({ g, limit = 8, compact }) {
  const posts = useMemo(() => feedPosts(g), [g]).slice(0, limit);
  const good = posts.filter((x) => x.tone === 'good').length;
  const bad = posts.filter((x) => x.tone === 'bad').length;
  const mood = good + bad ? Math.round((good / (good + bad)) * 100) : 50;
  const theme = g.theme && THEMES.find((t) => t.id === g.theme);
  const tags = ['#Seimas2028', `#${partyShort(g.player).replace(/[^A-Za-z0-9ĄČĘĖĮŠŲŪŽąčęėįšųūž]/g, '')}`, theme ? `#${L(theme.name).split(' ')[0]}` : null, DEBATE_WEEKS.includes(g.week) ? (LANG === 'lt' ? '#LRTdebatai' : '#LRTdebate') : null].filter(Boolean);
  return (
    <section className="cx-card p-4">
      <div className="flex items-center gap-2">
        <Hash size={18} color={SUN} />
        <span className="cx-title text-xl">{tt('Social media', 'Socialiniai tinklai')}</span>
        <span className="ml-auto text-xs font-bold" style={{ color: mood >= 55 ? GREEN : mood >= 45 ? SUN : RED }}>{tt(`Mood ${mood}% positive`, `Nuotaika: ${mood} % teigiama`)}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">{tags.map((t) => <span key={t} className="cx-chip px-2 py-0.5 text-xs" style={{ color: '#93C5FD' }}>{t}</span>)}</div>
      <div className="mt-2">
        {posts.length ? posts.map((p, i) => <FeedPost key={i} post={p} compact={compact} />) : <div className="text-sm t-muted py-3">{tt('Quiet online so far. Make some moves!', 'Internete kol kas tylu. Imkitės veiksmų!')}</div>}
      </div>
    </section>
  );
}

/* ============================================================
   Press conference
   ============================================================ */
const OUTLETS = ['Vakaro kurjeris', 'Portalas 24', 'Baltijos žinios', 'Radijas Aušra', 'Verslo dienraštis', 'Regionų balsas'];
const PRESS_QS = [
  { q: bi('Prices keep rising in the shops. What exactly will you do?', 'Kainos parduotuvėse auga. Ką konkrečiai darysite?'), answers: [
    { t: bi('Cut VAT on basic food.', 'Sumažinsime PVM būtiniausiam maistui.'), buzz: 1.25, groups: { seniors: 2, business: -1 } },
    { t: bi('First we balance the budget. No magic tricks.', 'Pirmiausia subalansuosime biudžetą. Jokių stebuklų.'), buzz: 0.7, cred: 2, groups: { business: 2, seniors: -1 } },
    { t: bi('Ask the current government. It’s their mess.', 'Klauskite dabartinės Vyriausybės – tai jų netvarka.'), buzz: 1.0, cred: -1 } ] },
  { q: bi('Do your donors expect something in return?', 'Ar jūsų rėmėjai tikisi ko nors mainais?'), answers: [
    { t: bi('Every donor is public. We’ll publish the full list tomorrow.', 'Visi rėmėjai vieši. Rytoj paskelbsime visą sąrašą.'), buzz: 0.9, cred: 4, scandal: -4 },
    { t: bi('No comment.', 'Be komentarų.'), buzz: 0.4, cred: -3, scandal: 3 },
    { t: bi('Ask my rivals: their donors are far more interesting.', 'Paklauskite varžovų – jų rėmėjai daug įdomesni.'), buzz: 1.15, cred: -1 } ] },
  { q: bi('Will you back 3% of GDP for defence?', 'Ar remiate 3 % BVP gynybai?'), answers: [
    { t: bi('Yes, and more if needed.', 'Taip, ir daugiau, jei reikės.'), buzz: 1.0, groups: { business: 1, youth: 1, seniors: -1 } },
    { t: bi('Yes, but not by cutting pensions.', 'Taip, bet ne pensijų sąskaita.'), buzz: 1.05, cred: 1, groups: { seniors: 1, public: 1 } },
    { t: bi('That needs a wider discussion.', 'Tam reikia platesnės diskusijos.'), buzz: 0.5, cred: -1 } ] },
  { q: bi('Why should young people stay in Lithuania?', 'Kodėl jaunimas turėtų likti Lietuvoje?'), answers: [
    { t: bi('Affordable rent and better pay outside Vilnius.', 'Įperkama nuoma ir didesni atlyginimai ne tik Vilniuje.'), buzz: 1.1, groups: { youth: 2 } },
    { t: bi('Because this is their home.', 'Nes čia jų namai.'), buzz: 0.6, groups: { seniors: 1, youth: -1 } },
    { t: bi('Lower taxes for people starting their careers.', 'Mažesni mokesčiai pradedantiems karjerą.'), buzz: 1.0, groups: { youth: 1, business: 1 } } ] },
  { q: bi('Farmers are threatening tractor protests. Will you meet them?', 'Ūkininkai grasina traktorių protestu. Ar susitiksite su jais?'), answers: [
    { t: bi('Yes, this week, on a farm, not in an office.', 'Taip, dar šią savaitę – ūkyje, ne kabinete.'), buzz: 1.2, groups: { farmers: 3 } },
    { t: bi('Blocking roads is no way to negotiate.', 'Kelių blokavimas – ne derybų būdas.'), buzz: 0.85, groups: { farmers: -2, business: 1 } },
    { t: bi('After the election.', 'Po rinkimų.'), buzz: 0.4, cred: -1, groups: { farmers: -1 } } ] },
  { q: bi('Patients wait months to see a doctor. Your plan?', 'Pas gydytojus laukiama mėnesiais. Jūsų planas?'), answers: [
    { t: bi('More money for family doctors, starting next year.', 'Daugiau lėšų šeimos gydytojams – nuo kitų metų.'), buzz: 1.05, groups: { public: 2, seniors: 1 } },
    { t: bi('Let private clinics take state-paid patients.', 'Leisti privačioms klinikoms priimti valstybės apmokamus pacientus.'), buzz: 0.95, groups: { business: 1, youth: 1, public: -1 } },
    { t: bi('The whole system needs reform.', 'Visą sistemą reikia reformuoti.'), buzz: 0.6 } ] },
  { q: bi('Do you support original spelling of minority surnames in passports?', 'Ar pritariate originaliai mažumų pavardžių rašybai pasuose?'), answers: [
    { t: bi('Yes, it’s the European norm.', 'Taip, tai europinė norma.'), buzz: 1.0, groups: { minority: 3, youth: 1, seniors: -1 } },
    { t: bi('No. There is one state language.', 'Ne. Valstybinė kalba – viena.'), buzz: 1.0, groups: { minority: -3, seniors: 1, farmers: 1 } },
    { t: bi('The courts should settle it.', 'Tai turi išspręsti teismai.'), buzz: 0.5 } ] },
  { q: bi('Who would you never form a coalition with?', 'Su kuo niekada nesudarytumėte koalicijos?'), answers: [
    { t: bi('With anyone who denies the facts.', 'Su tais, kurie neigia faktus.'), buzz: 1.2, cred: 1 },
    { t: bi('We’ll talk to everyone.', 'Kalbėsimės su visais.'), buzz: 0.65, cred: 1 },
    { t: bi('We’ll answer that after the vote.', 'Į tai atsakysime po rinkimų.'), buzz: 0.4, cred: -1 } ] },
  { q: bi('Locals oppose a new wind farm. Would you stop it?', 'Gyventojai prieš naują vėjo parką. Ar jį sustabdytumėte?'), answers: [
    { t: bi('No. Clean energy is national security.', 'Ne. Švari energija – nacionalinis saugumas.'), buzz: 1.0, groups: { youth: 2, farmers: -1 } },
    { t: bi('Yes, if the community says no.', 'Taip, jei bendruomenė prieš.'), buzz: 0.95, groups: { farmers: 2, youth: -1 } },
    { t: bi('Locals should get a share of the profits.', 'Gyventojai turi gauti dalį pajamų.'), buzz: 1.15, groups: { farmers: 1, youth: 1 } } ] },
];
function resolvePresser(g, picks) {
  const p = g.player;
  const n = g.natActs.presser || 0;
  if (g.ap < 1) return { ok: false, msg: tt('Needs 1 energy.', 'Reikia 1 energijos.') };
  if (g.money < 5) return { ok: false, msg: tt(`Not enough money: ${fmtEur(5)} needed.`, `Trūksta pinigų: reikia ${fmtEur(5)}.`) };
  g.ap -= 1; spend(g, 5); g.stats.actions += 1;
  let m = 0, cr = 0;
  picks.forEach(({ q, a }) => {
    const A = PRESS_QS[q].answers[a];
    m += A.buzz; cr += A.cred || 0;
    if (A.groups) Object.entries(A.groups).forEach(([id, d]) => { g.groupMood[id] = clamp((g.groupMood[id] || 0) + d, -20, 20); });
    if (A.scandal) addScandal(g, A.scandal);
  });
  m /= Math.max(1, picks.length);
  const d = 0.9 * m * [1, 0.55, 0.3, 0.15][Math.min(n, 3)] * (hasStaff(g, 'press') ? 1.5 : 1);
  g.momentum[p] = clamp(g.momentum[p] + d, -10, 10);
  if (cr) addCred(g, cr);
  g.natActs.presser = n + 1;
  chron(g, 'presser', bi(`Press conference: buzz ${fmtSigned(d)}`, `Spaudos konferencija: pagreitis ${fmtSigned(d)}`), m >= 1 ? 'good' : 'warn');
  addCons(g, m >= 1 ? 'good' : 'warn', bi(`Press conference: buzz ${fmtSigned(d)}${cr ? `, credibility ${fmtSigned(cr)}` : ''}.`, `Spaudos konferencija: pagreitis ${fmtSigned(d)}${cr ? `, patikimumas ${fmtSigned(cr)}` : ''}.`));
  return { ok: true, tone: m >= 1 ? 'good' : 'warn', msg: tt(`Press conference: buzz ${fmtSigned(d)}${cr ? ` · credibility ${fmtSigned(cr)}` : ''}`, `Spaudos konferencija: pagreitis ${fmtSigned(d)}${cr ? ` · patikimumas ${fmtSigned(cr)}` : ''}`) + (vrkCheck(g) || '') };
}
function PressSheet({ g, onDone, onClose }) {
  const qs = useMemo(() => { const a = PRESS_QS.map((_, i) => i).sort(() => Math.random() - 0.5); return a.slice(0, 2); }, []);
  const outlets = useMemo(() => qs.map(() => OUTLETS[Math.floor(Math.random() * OUTLETS.length)]), []);
  const reporters = ['anchor', 'pressec'];
  const [i, setI] = useState(0);
  const [picks, setPicks] = useState([]);
  const [chosen, setChosen] = useState(null);
  const [flash, setFlash] = useState(0);
  const Q = PRESS_QS[qs[i]];
  const [typed, done, finish] = useTypewriter(L(Q.q), 18, true);
  useEffect(() => { SFX.play('gavel'); }, []);
  const choose = (a) => {
    if (chosen != null) return;
    setChosen(a);
    setFlash((f) => f + 1);
    SFX.play('pop');
    setPicks([...picks, { q: qs[i], a }]);
  };
  const next = () => {
    if (i < qs.length - 1) { setI(i + 1); setChosen(null); SFX.play('tap'); }
    else onDone(picks);
  };
  return (
    <Sheet label={tt('Press conference', 'Spaudos konferencija')} onClose={onClose} z="z-50">
      <div className="relative">
        <Scene kind="seimas" h={null} caption={false} flush kb className="h-[200px] lg:h-[260px]">
          <div className="absolute inset-0 flex items-end justify-center pb-3">
            <Portrait who={g.player} size={'clamp(84px, 24vw, 130px)'} square mood={chosen == null ? 'ok' : 'happy'} />
          </div>
          {flash > 0 && [0, 1, 2, 3].map((k) => <span key={`${flash}-${k}`} className="cx-flashbulb" style={{ left: `${10 + k * 24}%`, top: `${20 + (k % 2) * 30}%`, width: 90, height: 90, animationDelay: `${k * 0.12}s` }} />)}
          <span className="absolute left-3 top-3 flex items-center gap-1.5 px-2 py-0.5 text-xs font-extrabold text-white rounded" style={{ background: '#DC2626' }}><Camera size={13} />{tt('PRESS CONFERENCE', 'SPAUDOS KONFERENCIJA')}</span>
          <span className="absolute right-3 top-3 text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(7,9,13,.8)' }}>{i + 1} / {qs.length}</span>
        </Scene>
        <button type="button" onClick={onClose} aria-label={tt('Close', 'Uždaryti')} className="cx-btn absolute right-3 bottom-3 grid place-items-center" style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(7,9,13,.8)' }}><X size={18} /></button>
      </div>
      <div style={GUTTER} className="pt-4 flex flex-col gap-3">
        <div className="flex items-start gap-3" onClick={finish}>
          <Portrait who={reporters[i % 2]} size={48} square mood="ok" />
          <div className="min-w-0">
            <div className="cx-kicker text-xs">{outlets[i]}</div>
            <div className="cx-title text-xl leading-snug" style={{ minHeight: '2.6em' }}>{typed}{!done && <span className="cx-caret" style={{ color: SUN }}>▌</span>}</div>
          </div>
        </div>
        {done && Q.answers.map((a, k) => (
          <button key={k} type="button" onClick={() => choose(k)} disabled={chosen != null && chosen !== k} className="cx-btn cx-quote cx-answer w-full items-center text-left px-4 py-2.5 cx-pop-in" style={{ gap: 12, minHeight: 50, justifyContent: 'flex-start', animationDelay: `${k * 0.06}s`, outline: chosen === k ? `3px solid ${SUN}` : 'none' }}>
            <span className="cx-num grid place-items-center rounded-full shrink-0" style={{ width: 26, height: 26, background: '#11141B', color: '#fff' }}>{String.fromCharCode(65 + k)}</span>
            <span className="font-bold text-[15px] leading-snug flex-1">{L(a.t)}</span>
          </button>
        ))}
        {chosen != null && (
          <div className="flex items-center gap-3 sbl-fade">
            <div className="text-sm font-semibold t-muted flex-1">{tt('Cameras flash. The reporters scribble it down.', 'Sužimba fotoaparatai. Žurnalistai užsirašo.')}</div>
            <Btn className="h-12 px-5 shrink-0" onClick={next}>{i < qs.length - 1 ? tt('Next question', 'Kitas klausimas') : tt('Wrap up', 'Baigti')} <ArrowRight size={18} /></Btn>
          </div>
        )}
      </div>
    </Sheet>
  );
}
/* ============================================================
   Navigation helpers: sub-tabs and the "Where is it?" finder
   ============================================================ */
function SubTabs({ value, onChange, items, label, className = '' }) {
  return (
    <div className={`cx-layers flex gap-1 p-1 rounded-2xl overflow-x-auto ${className}`} role="tablist" aria-label={label} style={{ background: 'rgba(255,255,255,.05)', border: `1px solid ${LINE}` }}>
      {items.map(([id, Icon, text, badge]) => {
        const on = value === id;
        return (
          <button key={id} type="button" role="tab" aria-selected={on} onClick={() => { if (!on) { onChange(id); SFX.play('tap'); } }} className="flex-1 shrink-0 inline-flex items-center justify-center gap-1.5 px-3 rounded-xl text-sm font-extrabold whitespace-nowrap" style={{ minHeight: 40, background: on ? '#F3F4F6' : 'transparent', color: on ? INK : TEXT, transition: 'background .2s' }}>
            <Icon size={16} />{text}
            {badge ? <span className="grid place-items-center rounded-full text-[10px] font-black" style={{ minWidth: 18, height: 18, padding: '0 4px', background: on ? INK : SUN, color: on ? '#fff' : INK }}>{badge}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
const HQ_SUBS = () => [
  ['media', Megaphone, tt('Media', 'Žiniasklaida')],
  ['money', Wallet, tt('Money', 'Pinigai')],
  ['team', Users, tt('Team', 'Komanda')],
  ['promises', ShieldCheck, tt('Promises', 'Pažadai')],
];
const POLL_SUBS = () => [
  ['seats', Landmark, tt('Seats', 'Mandatai')],
  ['polls', BarChart3, tt('Polls', 'Reitingai')],
  ['rivals', Eye, tt('Rivals', 'Varžovai')],
];
// Everything you can do, and where it lives.
const FINDER = [
  { id: 'districts', icon: Landmark, label: bi('All 71 districts and their candidates', 'Visos 71 apygarda ir kandidatai'), where: bi('Map › Districts', 'Žemėlapis › Apygardos'), kw: 'apygard district kandidat candidate vienmand smd numeris', go: { tab: 'map', sub: 'districts' } },
  { id: 'members', icon: Users, label: bi('Current Seimas: all 141 members', 'Dabartinis Seimas: visi 141 narys'), where: bi('Polls › Seats', 'Apklausos › Mandatai'), kw: 'seimo nariai members seimas 2024 narys', go: { members: 'current' } },
  { id: 'festival', icon: Sparkles, label: bi('This week’s public event', 'Šios savaitės renginys'), where: bi('Map › This week', 'Žemėlapis › Ši savaitė'), kw: 'renginys event festival svente maraton zoline krepsin', go: { tab: 'map', sub: 'week' } },
  { id: 'region', icon: MapIcon, label: bi('Rallies, ads and door-knocking in a region', 'Mitingai, reklama ir agitacija regione'), where: bi('Map › tap a region', 'Žemėlapis › paspauskite regioną'), kw: 'rally miting reklama durys door ads tv region regionas star kandidat attack puolim', go: { tab: 'map', sub: 'regions' } },
  { id: 'travel', icon: Bus, label: bi('Move your leader (bus tour)', 'Perkelti lyderį (autobuso turas)'), where: bi('Map › region › Travel', 'Žemėlapis › regionas › Važiuoti'), kw: 'travel kelion autobus bus leader lyder', go: { tab: 'map', sub: 'regions' } },
  { id: 'theme', icon: Megaphone, label: bi('Message of the week', 'Savaitės žinutė'), where: bi('Map › This week', 'Žemėlapis › Ši savaitė'), kw: 'theme tema zinute message week savait', go: { tab: 'map', sub: 'week' } },
  { id: 'board', icon: Target, label: bi('Party board task and unity', 'Partijos tarybos užduotis ir vienybė'), where: bi('Map › This week', 'Žemėlapis › Ši savaitė'), kw: 'board taryb uzduot task unity vienyb', go: { tab: 'map', sub: 'week' } },
  { id: 'ads', icon: Clapperboard, label: bi('Ad studio: make your own ad', 'Reklamos studija: sukurkite reklamą'), where: bi('HQ › Media', 'Štabas › Žiniasklaida'), kw: 'ad reklam studij tv internet stend radij billboard', go: { sheet: 'ads' } },
  { id: 'presser', icon: Mic, label: bi('Press conference', 'Spaudos konferencija'), where: bi('HQ › Media', 'Štabas › Žiniasklaida'), kw: 'press spaud konferencij zurnalist journalist', go: { sheet: 'presser' } },
  { id: 'tvspot', icon: Tv, label: bi('Nationwide TV ad', 'Nacionalinė TV reklama'), where: bi('HQ › Media', 'Štabas › Žiniasklaida'), kw: 'tv nacional reklam nationwide', go: { tab: 'hq', sub: 'media' } },
  { id: 'kompro', icon: Search, label: bi('Dig up dirt on a rival', 'Ieškoti kompromato'), where: bi('HQ › Media', 'Štabas › Žiniasklaida'), kw: 'kompromat dirt detektyv detective investig', go: { sheet: 'kompro' } },
  { id: 'backchannel', icon: Handshake, label: bi('Coffee with rivals (favours)', 'Kava su varžovais (ryšiai)'), where: bi('HQ › Media', 'Štabas › Žiniasklaida'), kw: 'kava coffee rysiai favours backchannel', go: { tab: 'hq', sub: 'media' } },
  { id: 'fund', icon: Wallet, label: bi('Raise money: donors and small donations', 'Rinkti pinigus: rėmėjai ir aukos'), where: bi('HQ › Money', 'Štabas › Pinigai'), kw: 'pinig money aukos donor remej vakarien dinner verslo lobby', go: { tab: 'hq', sub: 'money' } },
  { id: 'casino', icon: Dices, label: bi('Casino night', 'Vakaras kazino'), where: bi('HQ › Money', 'Štabas › Pinigai'), kw: 'kazino casino rulet roulette losim gamble', go: { sheet: 'casino' } },
  { id: 'bet', icon: Ticket, label: bi('Bet on Žalgiris', 'Lažybos dėl „Žalgirio“'), where: bi('HQ › Money', 'Štabas › Pinigai'), kw: 'lazyb bet zalgir krepsin basketball', go: { sheet: 'bet' } },
  { id: 'vrk', icon: Scale, label: bi('Spending limit (VRK)', 'Išlaidų limitas (VRK)'), where: bi('HQ › Money', 'Štabas › Pinigai'), kw: 'vrk limit islaid spending bauda fine', go: { tab: 'hq', sub: 'money' } },
  { id: 'staff', icon: Users, label: bi('Hire campaign staff', 'Samdyti štabo komandą'), where: bi('HQ › Team', 'Štabas › Komanda'), kw: 'staff komand samdyt hire strateg spaudos sekretor lawyer teisinink', go: { tab: 'hq', sub: 'team' } },
  { id: 'promises', icon: ShieldCheck, label: bi('Change your promises', 'Keisti pažadus'), where: bi('HQ › Promises', 'Štabas › Pažadai'), kw: 'pazad promise platform pozicij stance reputacij credib', go: { tab: 'hq', sub: 'promises' } },
  { id: 'rep', icon: ShieldCheck, label: bi('Reputation and endorsements', 'Reputacija ir organizacijų parama'), where: bi('HQ › Promises', 'Štabas › Pažadai'), kw: 'reputac endors parama organizac', go: { tab: 'hq', sub: 'promises' } },
  { id: 'seats', icon: Landmark, label: bi('Seat projection', 'Mandatų prognozė'), where: bi('Polls › Seats', 'Apklausos › Mandatai'), kw: 'mandat seats seim prognoz projection', go: { tab: 'polls', sub: 'seats' } },
  { id: 'calc', icon: Handshake, label: bi('Coalition calculator', 'Koalicijų skaičiuoklė'), where: bi('Polls › Seats', 'Apklausos › Mandatai'), kw: 'koalicij coalition skaiciuokl calculator partner', go: { tab: 'polls', sub: 'seats' } },
  { id: 'polls', icon: BarChart3, label: bi('National polls and trend', 'Šalies reitingai ir dinamika'), where: bi('Polls › Polls', 'Apklausos › Reitingai'), kw: 'reiting poll apklaus trend dinamik', go: { tab: 'polls', sub: 'polls' } },
  { id: 'groups', icon: Smile, label: bi('Voter groups: who likes you', 'Rinkėjų grupės: kas jus palaiko'), where: bi('Polls › Polls', 'Apklausos › Reitingai'), kw: 'grup group senjor jaunim ukinink verslinink mokytoj', go: { tab: 'polls', sub: 'polls' } },
  { id: 'rivals', icon: Eye, label: bi('Rival dossiers', 'Varžovų dosjė'), where: bi('Polls › Rivals', 'Apklausos › Varžovai'), kw: 'varzov rival dosj dossier opponent', go: { tab: 'polls', sub: 'rivals' } },
  { id: 'news', icon: Newspaper, label: bi('News and social media', 'Naujienos ir socialiniai tinklai'), where: bi('News', 'Naujienos'), kw: 'naujien news social tinkl feed', go: { tab: 'news' } },
  { id: 'help', icon: HelpCircle, label: bi('How to play', 'Kaip žaisti'), where: bi('Menu', 'Meniu'), kw: 'help pagalb kaip zaist rules taisykl', go: { help: true } },
];
const fold = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function FinderSheet({ onGo, onClose, wide }) {
  const [q, setQ] = useState('');
  const f = fold(q.trim());
  const list = FINDER.filter((x) => !f || fold(`${L(x.label)} ${L(x.where)} ${x.kw}`).includes(f));
  const groups = [];
  list.forEach((x) => { const top = L(x.where).split(' › ')[0]; let gr = groups.find((g0) => g0.top === top); if (!gr) { gr = { top, items: [] }; groups.push(gr); } gr.items.push(x); });
  return (
    <Sheet label={tt('Where is it?', 'Kur rasti?')} onClose={onClose} z="z-50">
      <SheetHead kicker={tt('Everything you can do', 'Viskas, ką galite daryti')} title={tt('Where is it?', 'Kur rasti?')} onClose={onClose} />
      <div style={GUTTER} className="flex flex-col gap-3">
        <label className="flex items-center gap-2 rounded-xl px-3" style={{ background: 'rgba(255,255,255,.06)', border: `1px solid ${LINE2}`, minHeight: 48 }}>
          <Search size={18} className="t-muted shrink-0" />
          <input value={q} onChange={(e) => setQ(e.target.value)} autoFocus={wide} placeholder={tt('Search: casino, ads, promises…', 'Ieškoti: kazino, reklama, pažadai…')} aria-label={tt('Search', 'Ieškoti')} className="flex-1 bg-transparent outline-none text-base font-semibold" style={{ color: TEXT, minWidth: 0 }} />
          {q && <button type="button" onClick={() => setQ('')} aria-label={tt('Clear', 'Išvalyti')}><X size={16} /></button>}
        </label>
        {groups.length === 0 && <div className="text-sm t-muted py-4 text-center">{tt('Nothing found. Try another word.', 'Nieko nerasta. Pabandykite kitą žodį.')}</div>}
        {groups.map((gr) => (
          <div key={gr.top}>
            <div className="cx-kicker text-xs mb-1.5">{gr.top}</div>
            <div className="flex flex-col gap-1.5">
              {gr.items.map((x) => (
                <button key={x.id} type="button" onClick={() => onGo(x.go)} className="cx-tap w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left" style={{ background: 'rgba(255,255,255,.04)', border: `1px solid ${LINE}` }}>
                  <span className="grid place-items-center rounded-lg shrink-0" style={{ width: 36, height: 36, background: ACC_BG }}><x.icon size={18} /></span>
                  <span className="min-w-0 flex-1"><span className="block font-bold leading-snug">{L(x.label)}</span><span className="block text-xs t-muted">{L(x.where)}</span></span>
                  <ArrowRight size={16} className="shrink-0 t-muted" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Sheet>
  );
}
function FindButton({ onClick, wide }) {
  return wide ? (
    <button type="button" onClick={onClick} className="cx-btn shrink-0 gap-2 px-3 text-sm font-extrabold" style={{ height: 42, borderRadius: 999, background: 'rgba(255,255,255,.07)' }}><Search size={17} />{tt('Where is it?', 'Kur rasti?')}</button>
  ) : (
    <button type="button" onClick={onClick} aria-label={tt('Where is it?', 'Kur rasti?')} className="cx-btn shrink-0" style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.07)' }}><Search size={19} /></button>
  );
}
function MapTab({ g, shares, proj, sel, onSelect, skipTips, wide, act, fx, sub = 'week', setSub = () => {} }) {
  const rows = REGIONS.slice().sort((a, b) => b.seats - a.seats);
  const p = g.player;
  return (
    <div className="flex flex-col gap-4 pt-4">
      {g.tut === 1 && (
        <Coach title={tt('Let’s make your first move!', 'Žengiame pirmą žingsnį!')} onSkip={skipTips}>
          {tt('This is Lithuania. Each colour shows who’s winning a region, and the dots are its local districts. Your leader’s face shows where you are. Tap any region you think is worth fighting for.', 'Tai Lietuva. Spalva rodo, kas pirmauja regione, o taškeliai – jo apygardos. Jūsų lyderio veidas rodo, kur esate. Paspauskite regioną, dėl kurio, jūsų manymu, verta kovoti.')}
        </Coach>
      )}
      {g.tut === 3 && (
        <Coach title={tt('Nice, that’s your first move!', 'Puiku – pirmas žingsnis žengtas!')} onSkip={skipTips}>
          {tt('Every move costs 1 energy plus some money, and leaves a mark on the map. Move your leader to where you rally: rallies are stronger with the leader there.', 'Kiekvienas veiksmas kainuoja 1 energiją ir šiek tiek pinigų bei palieka žymę žemėlapyje. Vežkite lyderį ten, kur rengiate mitingus – su juo jie stipresni.')}
        </Coach>
      )}
      {g.tut === 4 && (
        <Coach title={tt('Out of energy!', 'Energija baigėsi!')} onSkip={skipTips}>
          {tt('Tap the big yellow Next week button at the bottom. Your rivals will react to what you did, and a new poll comes out.', 'Spauskite didelį geltoną mygtuką „Kita savaitė“ apačioje. Varžovai sureaguos į jūsų veiksmus, o mes gausime naują apklausą.')}
        </Coach>
      )}
      <MapBoard g={g} shares={shares} proj={proj} sel={sel} onSelect={onSelect} fx={fx} wide={wide} />
      {!wide && <SubTabs value={sub} onChange={setSub} label={tt('Map sections', 'Žemėlapio skiltys')} items={[['week', Calendar, tt('This week', 'Ši savaitė'), g.ap > 0 ? `${g.ap}⚡` : null], ['regions', MapIcon, tt('Regions', 'Regionai')], ['districts', Landmark, tt('Districts', 'Apygardos')]]} />}
      {wide && <SubTabs value={sub === 'districts' ? 'districts' : 'regions'} onChange={setSub} label={tt('Lists', 'Sąrašai')} items={[['regions', MapIcon, tt('12 regions', '12 regionų')], ['districts', Landmark, tt('71 districts', '71 apygarda')]]} />}
      {sub === 'districts' && <DistrictList g={g} proj={proj} />}
      {!wide && sub === 'week' && <FestivalCard g={g} act={act} />}
      {!wide && sub === 'week' && <WeekPlan g={g} act={act} />}
      {!wide && sub === 'week' && <TourCard g={g} onSelect={onSelect} />}
      {!wide && sub === 'week' && (g.tut === 0 || g.tut >= 5) && <Warnings g={g} />}
      {!wide && sub === 'week' && (g.tut === 0 || g.tut >= 5) && <RaceBriefing g={g} shares={shares} onOpen={onSelect} />}
      {((wide && sub !== 'districts') || sub === 'regions') && <div className="flex flex-col gap-2.5 lg:grid lg:grid-cols-2 lg:gap-3">
        <h3 className="cx-title text-2xl lg:col-span-2">{tt('All regions', 'Visi regionai')}</h3>
        {rows.map((r) => <RegionRow key={r.id} r={r} g={g} s={shares[r.id]} mySeats={proj.smd.filter((e) => e.rid === r.id && e.winner === p).length} onClick={() => onSelect(r.id)} />)}
      </div>}
    </div>
  );
}

/* ============================================================
   Polls tab
   ============================================================ */
function PollsTab({ g, nat, proj, sub = 'seats', setSub = () => {} }) {
  const p = g.player;
  const last = g.history[g.history.length - 1];
  const deltas = Object.fromEntries(ALL_IDS.map((q) => [q, nat[q] - last.shares[q]]));
  const paths = coalitionPaths(g, proj.seats);
  const [table, setTable] = useState(false);
  const mine = proj.seats[p];
  const need = MAJORITY - mine;
  return (
    <div className="flex flex-col gap-4 pt-4 lg:grid lg:grid-cols-2 lg:items-start">
      <h2 className="cx-title text-4xl lg:col-span-2">{tt('Polls', 'Apklausos')}</h2>
      <SubTabs value={sub} onChange={setSub} items={POLL_SUBS()} label={tt('Poll sections', 'Apklausų skiltys')} className="lg:col-span-2" />
      {sub === 'seats' && (<>
      <SeimasMembersCard g={g} />
      <Card className="p-4">
        <CardTitle sub={tt('Each dot is one of the Seimas’ 141 seats. The dashed line marks 71.', 'Kiekvienas taškas – viena iš 141 Seimo vietos. Brūkšninė linija – 71.')} info={<InfoTip title={tt('Seats', 'Mandatai')}>{tt('The Seimas has 141 seats. 70 are shared by the national vote among parties over 5%. 71 go to local winners, one per district. To govern you need 71, alone or with partners.', 'Seime – 141 vieta. 70 paskirstoma pagal balsus visoje šalyje partijoms, surinkusioms daugiau nei 5 %. 71 tenka apygardų nugalėtojams. Valdyti reikia 71 – vieniems arba su partneriais.')}</InfoTip>}>{tt('If the vote were today', 'Jei rinkimai vyktų šiandien')}</CardTitle>
        <Hemicycle seats={proj.seats} highlight={p} label={`${partyShort(p)}`} />
        <p className="font-bold mt-2">{need > 0 ? tt(`You’d have ${mine} seats. You need ${need} more, or partners to team up with.`, `Turėtumėte ${mine} ${seatsWord(mine)}. Iki 71 trūksta ${need} – arba reikės partnerių.`) : tt(`You’d have ${mine} seats: enough to govern alone!`, `Turėtumėte ${mine} ${seatsWord(mine)} – užtektų valdyti vieniems!`)}</p>
        <Btn kind="pale" className="h-11 w-full mt-3 text-sm" onClick={() => setTable(!table)}>{table ? tt('Hide seats by party', 'Slėpti mandatus pagal partijas') : tt('Show seats by party', 'Rodyti mandatus pagal partijas')}</Btn>
        {table && <div className="mt-3"><SeatTable seats={proj.seats} pr={proj.pr} smd={proj.smdSeats} highlight={p} /></div>}
      </Card>
      <CoalitionCalc g={g} seats={proj.seats} />
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
      </>)}
      {sub === 'polls' && (<>
      <Card className="p-4">
        <CardTitle sub={tt('Arrows show the change since last week’s poll', 'Rodyklės – pokytis nuo praėjusios savaitės apklausos')}>{tt('Who’s ahead nationally', 'Kas pirmauja šalyje')}</CardTitle>
        <PollBars shares={nat} highlight={p} threshold deltas={deltas} />
        {last.pol != null && <div className="text-xs font-bold t-muted mt-2">{tt('Last published poll:', 'Paskutinė paskelbta apklausa:')} {POLLSTERS[last.pol].name}, n={POLLSTERS[last.pol].n}, {tt('margin of error', 'paklaida')} ±{nf(moe(last.shares[p], POLLSTERS[last.pol].n))} {tt('pts for you', 'proc. p. jums')}. {tt('Pollsters are fictional and each leans a little.', 'Apklausų bendrovės išgalvotos, kiekviena šiek tiek „kreivoja“.')}</div>}
      </Card>
      <Card className="p-4"><CardTitle sub={tt('Weekly published polls. LRT = debate weeks.', 'Savaitinės apklausos. LRT – debatų savaitės.')}>{tt('Week by week', 'Savaitė po savaitės')}</CardTitle><TrendChart history={g.history} player={p} /></Card>
      <Card className="p-4">
        <CardTitle sub={tt('How each voter group feels about you', 'Kaip jus vertina skirtingos rinkėjų grupės')} info={<InfoTip title={tt('Voter groups', 'Rinkėjų grupės')}>{tt('Groups react to your promises and to how you handle news and debates. A happy group lifts your vote where many of its members live, for example pensioners in villages and young people in cities.', 'Grupės reaguoja į jūsų pažadus ir į tai, kaip elgiatės su naujienomis bei debatuose. Patenkinta grupė kelia jūsų reitingą ten, kur jos daug: senjorai – kaimuose, jaunimas – miestuose.')}</InfoTip>}>{tt('Who likes you', 'Kas jus palaiko')}</CardTitle>
        <div className="flex flex-col gap-2.5">
          {GROUPS.map((G) => {
            const a = groupApproval(g, G);
            const Icon = G.icon;
            return (
              <div key={G.id} className="grid items-center gap-2" style={{ gridTemplateColumns: '36px 1fr 96px 24px' }}>
                <Portrait who={G.id} size={36} mood={a >= 55 ? 'happy' : a >= 40 ? 'ok' : 'sad'} title={L(G.name)} />
                <span className="font-extrabold text-sm truncate">{L(G.name)}</span>
                <Bar value={a} color={a >= 55 ? '#4ADE80' : a >= 40 ? SUN : '#F87171'} h={14} />
                <Mood w={a} size={20} />
              </div>
            );
          })}
        </div>
      </Card>
      </>)}
      {sub === 'rivals' && (<>
      <RivalsCard g={g} nat={nat} />
      <Card className="p-4">
        <CardTitle sub={tt('Arrows show the change since last week’s poll', 'Rodyklės – pokytis nuo praėjusios savaitės apklausos')}>{tt('Who’s ahead nationally', 'Kas pirmauja šalyje')}</CardTitle>
        <PollBars shares={nat} highlight={p} threshold deltas={deltas} />
        {last.pol != null && <div className="text-xs font-bold t-muted mt-2">{tt('Last published poll:', 'Paskutinė paskelbta apklausa:')} {POLLSTERS[last.pol].name}, n={POLLSTERS[last.pol].n}, {tt('margin of error', 'paklaida')} ±{nf(moe(last.shares[p], POLLSTERS[last.pol].n))} {tt('pts for you', 'proc. p. jums')}. {tt('Pollsters are fictional and each leans a little.', 'Apklausų bendrovės išgalvotos, kiekviena šiek tiek „kreivoja“.')}</div>}
      </Card>
      </>)}
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
      <span className="grid place-items-center rounded-full shrink-0" style={{ width: 40, height: 40, background: dark ? '#C7D2FE' : ACC_BG, border: `1px solid ${LINE}` }}><Icon size={19} strokeWidth={2.5} /></span>
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
function PromisesCard({ g }) {
  const cred = Math.round(g.cred);
  const col = cred >= 60 ? '#4ADE80' : cred >= 40 ? SUN : '#F87171';
  const upcoming = ORGS.filter((o) => o.week >= g.week);
  return (
    <Card className="p-4">
      <CardTitle sub={tt('What you promise in news, debates and on the street is remembered. Saying the opposite later costs reputation.', 'Tai, ką pažadate naujienose, debatuose ir gatvėje, įsimenama. Vėliau pasakius priešingai – krenta reputacija.')}>{tt('Promises & reputation', 'Pažadai ir reputacija')}</CardTitle>
      <div className="flex items-center gap-3">
        <ShieldCheck size={26} strokeWidth={2.4} />
        <div className="flex-1"><Bar value={cred} color={col} h={16} mark={60} /></div>
        <span className="cx-num text-2xl">{cred}</span>
      </div>
      <div className="text-xs font-bold t-muted mt-1">{tt('High reputation: good news lifts you more and partners join more willingly.', 'Aukšta reputacija: geros naujienos kelia labiau, partneriai jungiasi noriau.')}</div>
      <div className="flex flex-col gap-1.5 mt-3">
        {(g.promises || []).length === 0 && <div className="text-sm font-bold t-muted">{tt('No promises yet. Your answers to news, debates and voters will become promises.', 'Kol kas jokių pažadų. Jūsų atsakymai naujienose, debatuose ir rinkėjams taps pažadais.')}</div>}
        {(g.promises || []).map((pr) => {
          const ax = AXES.find((x) => x.id === pr.ax);
          const Icon = ax.icon;
          return (
            <div key={pr.ax} className="cx-soft px-3 py-2 flex items-center gap-2 text-sm font-bold">
              <Icon size={16} className="shrink-0" />
              <span className="flex-1 min-w-0"><span className="t-muted">{L(ax.label)}:</span> {L(pr.dir < 0 ? ax.left : ax.right)}</span>
              <span className="text-xs t-muted shrink-0">{tt(`week ${pr.week}`, `${pr.week} sav.`)}{pr.n > 1 ? ` · ×${pr.n}` : ''}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-sm font-extrabold">{tt('Endorsements', 'Organizacijų parama')}</div>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {(g.endorsements || []).map((e) => { const o = ORGS.find((x) => x.id === e.org); return <span key={e.org} className="cx-chip px-2 py-0.5 text-xs" style={{ background: e.p === g.player ? GOOD_BG : PANEL2 }}><PartyDot p={e.p} size={10} />{L(o.name)}</span>; })}
        {upcoming.map((o) => <span key={o.id} className="cx-chip px-2 py-0.5 text-xs t-muted"><Clock size={11} />{L(o.name)} · {tt(`wk ${o.week}`, `${o.week} sav.`)}</span>)}
      </div>
    </Card>
  );
}
/* ============================================================
   Ad studio: build your own ad campaign
   ============================================================ */
const AD_MEDIA = [
  { id: 'tv', icon: Tv, label: bi('TV', 'Televizija'), cost: 140, urban: -0.6, power: 1.0, desc: bi('Huge reach, best in towns and villages.', 'Didžiausia auditorija, geriausia miesteliuose ir kaimuose.') },
  { id: 'web', icon: Smartphone, label: bi('Internet', 'Internetas'), cost: 80, urban: 0.7, power: 0.82, desc: bi('Cheap and targeted, best in cities.', 'Pigu ir taikliai, geriausia miestuose.') },
  { id: 'bill', icon: Landmark, label: bi('Billboards', 'Stendai'), cost: 100, urban: 0.1, power: 0.85, desc: bi('Seen by everyone on the road.', 'Mato visi keliaujantys.') },
  { id: 'radio', icon: Radio, label: bi('Radio', 'Radijas'), cost: 55, urban: -0.3, power: 0.6, desc: bi('Low cost, loyal older listeners.', 'Pigu, ištikimi vyresni klausytojai.') },
];
const AD_TONES = [
  { id: 'hope', icon: Sun, label: bi('Positive', 'Pozityvi'), desc: bi('Lifts you. No risk.', 'Kelia jus. Jokios rizikos.') },
  { id: 'contrast', icon: Scale, label: bi('Contrast', 'Palyginimas'), desc: bi('You vs a rival: a bit of both.', 'Jūs prieš varžovą: po truputį abiem.') },
  { id: 'attack', icon: Swords, label: bi('Attack', 'Puolamoji'), desc: bi('Hurts a rival. Can backfire.', 'Kenkia varžovui. Gali atsisukti prieš jus.') },
];
const AD_SCENE = { econ: 'town', security: 'vilnius', regions: 'fields', city: 'klaipeda', trust: 'seimas' };
const AD_SLOGANS = {
  econ: { hope: bi('Wages that grow faster than prices.', 'Kad algos augtų greičiau nei kainos.'), contrast: bi('{T} raised prices. {P} will raise wages.', '{T} kėlė kainas. {P} kels algas.'), attack: bi('{T}: higher prices, emptier wallets.', '{T}: didesnės kainos, tuštesnės piniginės.') },
  security: { hope: bi('A safe Lithuania. Every day.', 'Saugi Lietuva. Kiekvieną dieną.'), contrast: bi('{T} talks. {P} defends.', '{T} kalba. {P} gina.'), attack: bi('Can you trust {T} with our security?', 'Ar patikėtumėte {T} mūsų saugumą?') },
  regions: { hope: bi('Every town deserves a future.', 'Kiekvienas miestelis vertas ateities.'), contrast: bi('{T} forgot the regions. {P} never did.', '{T} pamiršo regionus. {P} – niekada.'), attack: bi('{T} closed your school. Remember that.', '{T} uždarė jūsų mokyklą. Prisiminkite.') },
  city: { hope: bi('A home you can afford. A city you love.', 'Įperkami namai. Mylimas miestas.'), contrast: bi('{T} built offices. {P} builds homes.', '{T} statė biurus. {P} stato namus.'), attack: bi('Stuck in traffic? Thank {T}.', 'Įstrigote kamštyje? Padėkokite {T}.') },
  trust: { hope: bi('Clean hands. Clear promises.', 'Švarios rankos. Aiškūs pažadai.'), contrast: bi('{T} has scandals. {P} has a plan.', '{T} turi skandalų. {P} turi planą.'), attack: bi('{T}: who pays them?', '{T}: kas jiems moka?') },
};
const AD_MAX = 2;
function adCost(spec) { return AD_MEDIA.find((m) => m.id === spec.medium).cost; }
function adSlogan(g, spec) {
  const t = AD_SLOGANS[spec.topic][spec.tone];
  return L(t).replace(/\{P\}/g, partyShort(g.player)).replace(/\{T\}/g, spec.target ? partyShort(spec.target) : '');
}
// One burst of an ad campaign. Returns your national change (pts).
function applyAd(g, ad) {
  const p = g.player;
  const M = AD_MEDIA.find((m) => m.id === ad.medium);
  const before = nationalShares(g);
  const avgW = sum(REGIONS.map((r) => groupWeight(ad.group, r))) / REGIONS.length || 1;
  const topicBoost = g.theme === ad.topic ? 1.15 : 1;
  for (const r of REGIONS) {
    const w = clamp(groupWeight(ad.group, r) / avgW, 0.4, 2.2);
    const u = clamp(1 + M.urban * (r.urban - 0.5) * 1.6, 0.35, 1.8);
    const sh = regionShares(g, r);
    const k = 0.22 * M.power * w * u * geoMult(p, r) * satOf(p, r, sh[p]) * topicBoost * credMult(g);
    if (ad.tone === 'hope') gainSupport(g, r.id, p, k, 0.7);
    else if (ad.tone === 'contrast') { gainSupport(g, r.id, p, k * 0.6, 0.7); if (ad.target) loseSupport(g, r.id, ad.target, k * 0.5 * (1 - g.gg[r.id][ad.target] / 180), 0.45, p, 0.3); }
    else if (ad.target && !ad.backfired) loseSupport(g, r.id, ad.target, k * 1.15 * (1 - g.gg[r.id][ad.target] / 160), 0.45, p, 0.35);
    normalizeRegion(g, r.id);
  }
  g.groupMood[ad.group] = clamp((g.groupMood[ad.group] || 0) + (ad.tone === 'hope' ? 1 : ad.tone === 'contrast' ? 0.5 : -0.5), -20, 20);
  const after = nationalShares(g);
  ad.lastEff = after[p] - before[p];
  ad.lastHit = ad.target ? after[ad.target] - before[ad.target] : 0;
  return ad.lastEff;
}
function launchAd(g, spec) {
  const cost = adCost(spec);
  if ((g.ads || []).filter((a) => a.left > 0).length >= AD_MAX) return { ok: false, msg: tt('Two ad campaigns are already running.', 'Jau vyksta dvi reklamos kampanijos.') };
  if (g.ap < 1) return { ok: false, msg: tt('Needs 1 energy.', 'Reikia 1 energijos.') };
  if (g.money < cost) return { ok: false, msg: tt(`Not enough money: ${fmtEur(cost)} needed.`, `Trūksta pinigų: reikia ${fmtEur(cost)}.`) };
  if (spec.tone !== 'hope' && !spec.target) return { ok: false, msg: tt('Pick a rival first.', 'Pirmiausia pasirinkite varžovą.') };
  g.ap -= 1; spend(g, cost); g.stats.actions += 1;
  g.adId = (g.adId || 0) + 1;
  const ad = { ...spec, id: g.adId, week: g.week, left: 2, slogan: adSlogan(g, spec) };
  if (spec.tone === 'attack' && Math.random() < BACKFIRE[g.player] + 0.06) {
    ad.backfired = true;
    g.momentum[g.player] = clamp(g.momentum[g.player] - 1.2, -10, 10);
    addCred(g, -3);
    addCons(g, 'bad', bi(`Your attack ad on ${partyShort(spec.target)} backfired: viewers found it nasty.`, `Jūsų puolamoji reklama prieš ${partyShort(spec.target)} atsisuko prieš jus: žiūrovams ji pasirodė bjauri.`));
  }
  const d = applyAd(g, ad);
  ad.left -= 1;
  g.ads = [...(g.ads || []).filter((a) => a.left > 0 || g.week - a.week < 2), ad];
  g.stats.ads = (g.stats.ads || 0) + 1;
  chron(g, 'ad', bi(`Ad: “${ad.slogan}”`, `Reklama: „${ad.slogan}“`), ad.backfired ? 'bad' : 'good');
  const msg = ad.backfired
    ? tt(`Backfire! The ad hurt you more than ${partyShort(spec.target)}.`, `Atsisuko prieš jus! Reklama pakenkė jums labiau nei ${partyShort(spec.target)}.`)
    : spec.tone === 'attack' ? tt(`Ad is live: ${partyShort(spec.target)} ${fmtSignedPct(ad.lastHit)} nationally`, `Reklama paleista: ${partyShort(spec.target)} ${fmtSignedPct(ad.lastHit)} šalyje`)
      : tt(`Ad is live: ${fmtSignedPct(d)} for you nationally. It runs again next week.`, `Reklama paleista: jums ${fmtSignedPct(d)} šalyje. Kitą savaitę ji bus rodoma dar kartą.`);
  return { ok: true, tone: ad.backfired ? 'bad' : 'good', msg: msg + (vrkCheck(g) || '') };
}
// Called from startWeek: running ads air once more.
function runAds(g) {
  (g.ads || []).forEach((ad) => {
    if (ad.left > 0) {
      const d = applyAd(g, ad);
      ad.left -= 1;
      addCons(g, d >= 0 || ad.tone === 'attack' ? 'good' : 'warn', bi(`Your ${L(AD_MEDIA.find((m) => m.id === ad.medium).label).toLowerCase()} ad “${ad.slogan}” aired again: ${ad.tone === 'attack' ? `${partyShort(ad.target)} ${fmtSignedPct(ad.lastHit)}` : fmtSignedPct(d)}.`,
        `Jūsų reklama („${ad.slogan}“) rodyta dar kartą: ${ad.tone === 'attack' ? `${partyShort(ad.target)} ${fmtSignedPct(ad.lastHit)}` : fmtSignedPct(d)}.`));
    }
  });
  g.ads = (g.ads || []).filter((a) => a.left > 0 || g.week - a.week < 2);
}
function AdPreview({ g, spec }) {
  const P = PARTIES[g.player];
  const slogan = adSlogan(g, spec);
  const M = spec.medium;
  const inner = (
    <Scene kind={AD_SCENE[spec.topic]} h={null} caption={false} flush kb className="h-full w-full">
      <div className="absolute inset-0" style={{ background: spec.tone === 'attack' ? 'linear-gradient(0deg, rgba(60,0,0,.85), rgba(0,0,0,.15))' : `linear-gradient(0deg, ${tint(P.color, 0.15)}ee, rgba(0,0,0,0) 70%)`, filter: spec.tone === 'attack' ? 'grayscale(.6)' : undefined }} />
      <div className="absolute inset-x-3 bottom-3 flex items-end gap-3">
        {spec.tone !== 'attack' ? <Portrait who={g.player} size={58} square mood="grin" /> : spec.target ? <Portrait who={spec.target} size={58} square mood="sad" /> : null}
        <div className="min-w-0 flex-1">
          <div key={slogan} className="cx-title text-white leading-tight sbl-fade" style={{ fontSize: 'clamp(18px, 4.6vw, 26px)', textShadow: '0 3px 12px rgba(0,0,0,.8)' }}>{slogan}</div>
          <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-extrabold text-white" style={{ background: P.color }}>{P.short} · {tt('Vote', 'Balsuok')} {P.short}</div>
        </div>
      </div>
    </Scene>
  );
  if (M === 'web') return (
    <div className="mx-auto rounded-[26px] p-2" style={{ width: 230, background: '#05070B', border: '2px solid #2A3242' }}>
      <div className="flex items-center gap-1.5 px-1 pb-1.5 text-[10px] font-bold t-muted"><span className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN }} />{tt('Sponsored', 'Remiama')} · {P.short}</div>
      <div className="rounded-xl overflow-hidden" style={{ height: 250 }}>{inner}</div>
      <div className="flex justify-around pt-1.5 text-[10px] t-muted"><Heart size={12} /><MessageSquare size={12} /><Share2 size={12} /></div>
    </div>
  );
  if (M === 'bill') return (
    <div className="mx-auto flex flex-col items-center" style={{ maxWidth: 420 }}>
      <div className="w-full rounded-md overflow-hidden" style={{ height: 170, border: '6px solid #1B2130', boxShadow: '0 12px 30px rgba(0,0,0,.6)' }}>{inner}</div>
      <div className="flex justify-between w-2/3"><span style={{ width: 8, height: 46, background: '#2A3242' }} /><span style={{ width: 8, height: 46, background: '#2A3242' }} /></div>
    </div>
  );
  if (M === 'radio') return (
    <div className="mx-auto rounded-2xl p-4 flex items-center gap-4" style={{ maxWidth: 420, background: 'linear-gradient(135deg, #2A3242, #161B25)', border: `1px solid ${LINE2}` }}>
      <div className="grid place-items-center rounded-full shrink-0" style={{ width: 64, height: 64, background: '#0B0E14', border: `3px solid ${SUN}` }}><Radio size={28} color={SUN} /></div>
      <div className="min-w-0">
        <div className="flex items-end gap-0.5 h-6 mb-1" aria-hidden="true">{Array.from({ length: 22 }).map((_, i) => <span key={i} className="cx-eq" style={{ width: 4, background: SUN, borderRadius: 2, height: `${30 + ((i * 37) % 70)}%`, animationDelay: `${(i % 7) * 0.09}s` }} />)}</div>
        <div className="cx-title text-lg leading-tight">„{slogan}“</div>
        <div className="text-xs t-muted mt-0.5">{tt('Read by a familiar voice, 30 seconds', 'Skaito žinomas balsas, 30 sekundžių')}</div>
      </div>
    </div>
  );
  return (
    <div className="mx-auto" style={{ maxWidth: 440 }}>
      <div className="rounded-xl p-2" style={{ background: '#0B0E14', border: '2px solid #2A3242', boxShadow: '0 14px 34px rgba(0,0,0,.6)' }}>
        <div className="relative rounded-md overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
          {inner}
          <span className="absolute left-2 top-2 px-1.5 py-0.5 rounded text-[10px] font-extrabold text-white" style={{ background: 'rgba(0,0,0,.6)' }}>{tt('POLITICAL AD', 'POLITINĖ REKLAMA')}</span>
        </div>
      </div>
      <div className="mx-auto rounded-b-lg" style={{ width: 90, height: 10, background: '#1B2130' }} />
    </div>
  );
}
function AdStudioSheet({ g, onLaunch, onClose }) {
  const me = g.player;
  const nat = nationalShares(g);
  const rivals = PARTY_IDS.filter((q) => q !== me).sort((a, b) => nat[b] - nat[a]).slice(0, 5);
  const [spec, setSpec] = useState({ medium: 'tv', tone: 'hope', target: rivals[0], group: 'seniors', topic: g.theme || 'econ' });
  const set = (k, v) => { setSpec((s) => ({ ...s, [k]: v })); SFX.play('tap'); };
  const cost = adCost(spec);
  const running = (g.ads || []).filter((a) => a.left > 0).length;
  const dis = g.ap < 1 || g.money < cost || running >= AD_MAX;
  const chip = (on, onClick, children, key, extra = {}) => (
    <button key={key} type="button" aria-pressed={on} onClick={onClick} className="cx-chip shrink-0 px-3 py-1.5 text-sm" style={{ background: on ? '#F3F4F6' : 'rgba(255,255,255,.06)', color: on ? '#0B0E14' : TEXT, borderColor: on ? '#F3F4F6' : LINE2, minHeight: 38, ...extra }}>{children}</button>
  );
  const Row = ({ label, children }) => (
    <div>
      <div className="cx-kicker text-xs mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
  return (
    <Sheet label={tt('Ad studio', 'Reklamos studija')} onClose={onClose}>
      <SheetHead kicker={tt('Make your own campaign ad', 'Sukurkite savo reklamą')} title={tt('Ad studio', 'Reklamos studija')} onClose={onClose} />
      <div style={GUTTER} className="flex flex-col gap-4 pb-2 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        <div className="py-2 lg:sticky lg:top-2"><AdPreview g={g} spec={spec} /></div>
        <div className="flex flex-col gap-4">
        <Row label={tt('1 · Medium', '1 · Kanalas')}>{AD_MEDIA.map((m) => chip(spec.medium === m.id, () => set('medium', m.id), <><m.icon size={15} />{L(m.label)} <span className="opacity-70 text-xs">{fmtEur(m.cost)}</span></>, m.id))}</Row>
        <div className="text-xs t-muted -mt-2">{L(AD_MEDIA.find((m) => m.id === spec.medium).desc)}</div>
        <Row label={tt('2 · Message', '2 · Tema')}>{THEMES.map((t) => chip(spec.topic === t.id, () => set('topic', t.id), <><t.icon size={15} />{L(t.name)}{g.theme === t.id && <Star size={12} style={{ fill: SUN, color: SUN }} />}</>, t.id))}</Row>
        <Row label={tt('3 · Tone', '3 · Tonas')}>{AD_TONES.map((t) => chip(spec.tone === t.id, () => set('tone', t.id), <><t.icon size={15} />{L(t.label)}</>, t.id, t.id === 'attack' ? { borderColor: spec.tone === t.id ? '#F3F4F6' : 'rgba(248,113,113,.5)' } : {}))}</Row>
        <div className="text-xs t-muted -mt-2">{L(AD_TONES.find((t) => t.id === spec.tone).desc)}</div>
        {spec.tone !== 'hope' && (
          <Row label={tt('4 · Rival', '4 · Varžovas')}>{rivals.map((q) => chip(spec.target === q, () => set('target', q), <><PartyDot p={q} size={10} />{partyShort(q)}</>, q))}</Row>
        )}
        <Row label={spec.tone !== 'hope' ? tt('5 · Audience', '5 · Auditorija') : tt('4 · Audience', '4 · Auditorija')}>
          {GROUPS.map((G) => chip(spec.group === G.id, () => set('group', G.id), <><Portrait who={G.id} size={22} />{L(G.name)}</>, G.id, { paddingLeft: 4 }))}
        </Row>
        <div className="cx-soft p-3 text-sm font-semibold flex items-start gap-2">
          <Info size={16} className="shrink-0 mt-0.5" />
          <span>{tt('Runs twice: now and again next week. It reaches the regions where your audience lives. The week’s message gives a bonus.', 'Rodoma du kartus: dabar ir kitą savaitę. Pasiekia regionus, kur gyvena pasirinkta auditorija. Savaitės žinutė suteikia premiją.')}{running >= AD_MAX ? ' ' + tt('Two ads are already running.', 'Jau vyksta dvi reklamos.') : ''}</span>
        </div>
        <Btn className="h-14 text-lg" disabled={dis} onClick={() => onLaunch(spec)}><Play size={18} style={{ fill: INK }} />{tt('Launch the ad', 'Paleisti reklamą')} · <Zap size={15} style={{ fill: INK }} />1 · {fmtEur(cost)}</Btn>
        </div>
      </div>
    </Sheet>
  );
}
function AdsCard({ g, openSheet }) {
  const ads = (g.ads || []).slice().reverse();
  return (
    <Card className="p-4">
      <CardTitle sub={tt('Design an ad: medium, message, tone and audience.', 'Sukurkite reklamą: kanalas, tema, tonas ir auditorija.')} right={<span className="cx-chip px-2 py-0.5 text-xs shrink-0">{(g.ads || []).filter((a) => a.left > 0).length}/{AD_MAX}</span>}>{tt('Ad campaigns', 'Reklamos kampanijos')}</CardTitle>
      <div className="flex flex-col gap-2">
        {ads.map((a) => {
          const M = AD_MEDIA.find((m) => m.id === a.medium);
          return (
            <div key={a.id} className="cx-soft p-2.5 flex items-center gap-3">
              <span className="grid place-items-center rounded-lg shrink-0" style={{ width: 40, height: 40, background: a.tone === 'attack' ? BAD_BG : ACC_BG }}><M.icon size={19} /></span>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm leading-snug truncate">„{a.slogan}“</div>
                <div className="text-xs t-muted">{L(M.label)} · {L(GROUPS.find((x) => x.id === a.group).name)} · {a.left > 0 ? tt('airs again next week', 'kitą savaitę – dar kartą') : tt('finished', 'baigta')}</div>
              </div>
              <span className="text-sm font-extrabold shrink-0" style={{ color: a.backfired ? RED : GREEN }}>{a.backfired ? tt('Backfire', 'Atsisuko') : a.tone === 'attack' ? `${partyShort(a.target)} ${fmtSignedPct(a.lastHit || 0)}` : fmtSignedPct(a.lastEff || 0)}</span>
            </div>
          );
        })}
        <Btn kind="white" className="h-12" onClick={() => openSheet('ads')}><Clapperboard size={18} />{tt('Open the ad studio', 'Atidaryti reklamos studiją')}</Btn>
      </div>
    </Card>
  );
}

/* ============================================================
   Rival dossier and coalition calculator
   ============================================================ */
function Spark({ data, color, w = 220, h = 48 }) {
  const lo = Math.min(...data), hi = Math.max(...data);
  const span = Math.max(1, hi - lo);
  const pts = data.map((v, i) => `${((i / Math.max(1, data.length - 1)) * w).toFixed(1)},${(h - 4 - ((v - lo) / span) * (h - 8)).toFixed(1)}`).join(' ');
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height: h, display: 'block' }} aria-hidden="true">
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color} opacity="0.16" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
function RivalSheet({ g, q, onClose }) {
  const me = g.player;
  const P = PARTIES[q];
  const nat = nationalShares(g);
  const hist = [...g.history.map((h) => h.shares[q]), nat[q]];
  const regs = REGIONS.map((r) => ({ r, s: regionShares(g, r) })).sort((a, b) => b.s[q] - a.s[q]);
  const leads = regs.filter((x) => regionLook(x.s).lead === q);
  const mv = (g.rivalMoves || []).find((m) => m.p === q);
  const c = compat(g, me, q);
  const pos = posOf(g, q);
  const mine = posOf(g, me);
  return (
    <Sheet label={tt(`${P.short} dossier`, `${P.short} dosjė`)} onClose={onClose}>
      <div className="relative">
        <div style={{ height: 150, background: `linear-gradient(135deg, ${tint(P.color, 0.25)}, #0B0E14)` }} />
        <div className="absolute left-4 bottom-[-40px] flex items-end gap-3">
          <Portrait who={q} size={110} square mood={(mv && mv.list.some((x) => x.target === me)) ? 'grr' : 'grin'} />
          <div className="pb-11">
            <div className="cx-kicker text-xs" style={{ color: '#fff' }}>{tt('Rival dossier', 'Varžovo dosjė')}</div>
            <div className="cx-title text-2xl leading-none">{P.leader}</div>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label={tt('Close', 'Uždaryti')} className="cx-btn absolute right-3 top-3 grid place-items-center" style={{ width: 38, height: 38, borderRadius: 999, background: 'rgba(7,9,13,.7)' }}><X size={18} /></button>
      </div>
      <div style={GUTTER} className="pt-14 flex flex-col gap-4">
        <div>
          <div className="font-black">{P.full}</div>
          <div className="text-sm t-muted font-semibold mt-0.5">{L(P.ideology)} · {L(P.blurb)}</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[[tt('Poll', 'Reitingas'), fmtPct(nat[q])], [tt('Leads in', 'Pirmauja'), tt(`${leads.length} regions`, `${leads.length} reg.`)], [tt('Buzz', 'Pagreitis'), fmtSigned(g.momentum[q])]].map(([l, v]) => <div key={l} className="cx-soft p-2.5"><div className="text-[11px] font-bold t-muted">{l}</div><div className="cx-num text-xl">{v}</div></div>)}
        </div>
        <div className="cx-soft p-3">
          <div className="text-xs font-bold t-muted mb-1">{tt('Poll trend this campaign', 'Reitingo kaita per kampaniją')}</div>
          <Spark data={hist} color={P.color} />
        </div>
        <div>
          <div className="cx-kicker text-xs mb-1.5">{tt('Strongest regions', 'Stipriausi regionai')}</div>
          <div className="flex flex-col gap-1.5">
            {regs.slice(0, 4).map(({ r, s }) => (
              <div key={r.id} className="grid items-center gap-2 text-sm font-bold" style={{ gridTemplateColumns: '110px 1fr 50px' }}>
                <span className="truncate">{rs(r)}</span>
                <span className="cx-track" style={{ height: 8 }}><span className="block h-full" style={{ width: `${clamp(s[q] * 2, 2, 100)}%`, background: P.color }} /></span>
                <span className="text-right cx-num">{fmtPct(s[q])}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="cx-kicker text-xs mb-1.5">{tt('Where they stand vs you', 'Pozicijos, palyginti su jumis')}</div>
          <div className="flex flex-col gap-2">
            {AXES.map((ax) => (
              <div key={ax.id}>
                <div className="flex justify-between text-[11px] font-bold t-muted"><span>{L(ax.left)}</span><span>{L(ax.label)}</span><span>{L(ax.right)}</span></div>
                <div className="relative mt-1 rounded-full" style={{ height: 8, background: 'rgba(255,255,255,.08)' }}>
                  <span className="absolute top-1/2 rounded-full" style={{ left: `calc(${(pos[ax.id] + 100) / 2}% - 8px)`, width: 16, height: 16, marginTop: -8, background: P.color, border: '2px solid #fff' }} title={partyShort(q)} />
                  <span className="absolute top-1/2 rounded-full" style={{ left: `calc(${(mine[ax.id] + 100) / 2}% - 6px)`, width: 12, height: 12, marginTop: -6, background: '#0B0E14', border: `3px solid ${SUN}` }} title={tt('You', 'Jūs')} />
                </div>
              </div>
            ))}
            <div className="text-[11px] t-muted flex gap-3"><span className="inline-flex items-center gap-1"><span className="inline-block rounded-full" style={{ width: 10, height: 10, background: P.color, border: '2px solid #fff' }} />{P.short}</span><span className="inline-flex items-center gap-1"><span className="inline-block rounded-full" style={{ width: 10, height: 10, border: `3px solid ${SUN}` }} />{tt('You', 'Jūs')}</span></div>
          </div>
        </div>
        <div className="cx-soft p-3 text-sm font-semibold">
          <div className="font-black mb-1">{tt('Last week', 'Praėjusią savaitę')}</div>
          {mv && mv.list.length ? mv.list.map((x, i) => <div key={i} className="flex items-center gap-1.5">{x.target === me ? <Swords size={14} color={RED} /> : <Check size={14} />}{moveWord(x, me)} – {rs(x.rid)}</div>) : tt('A quiet week.', 'Rami savaitė.')}
        </div>
        <div className="cx-card p-3 flex items-center gap-3" style={{ background: c >= 55 ? GOOD_BG : c >= 40 ? WARN_BG : BAD_BG }}>
          <Handshake size={22} className="shrink-0" />
          <div className="text-sm font-bold">{tt(`Coalition fit with you: ${c}/100.`, `Tinkamumas koalicijai su jumis: ${c}/100.`)} {c >= 55 ? tt('A natural partner after the vote.', 'Natūralus partneris po rinkimų.') : c >= 40 ? tt('Possible, at a price.', 'Įmanoma, bet brangiai kainuos.') : tt('They would rather sit in opposition than with you.', 'Jie mieliau liktų opozicijoje nei eitų su jumis.')}</div>
        </div>
      </div>
    </Sheet>
  );
}
function CoalitionCalc({ g, seats }) {
  const me = g.player;
  const options = SEAT_ORDER.filter((q) => q !== me && q !== 'KITI' && (seats[q] || 0) > 0).sort((a, b) => seats[b] - seats[a]);
  const [picked, setPicked] = useState([]);
  const members = [me, ...picked.filter((q) => options.includes(q))];
  const total = sum(members.map((q) => seats[q] || 0));
  let minC = 100, worst = null;
  for (let i = 0; i < members.length; i++) for (let j = i + 1; j < members.length; j++) { const c = compat(g, members[i], members[j]); if (c < minC) { minC = c; worst = [members[i], members[j]]; } }
  const toggle = (q) => { setPicked((p) => (p.includes(q) ? p.filter((x) => x !== q) : [...p, q])); SFX.play('tap'); };
  const ok = total >= MAJORITY;
  return (
    <Card className="p-4">
      <CardTitle sub={tt('Tap parties to build a team on today’s projection.', 'Spauskite partijas ir sudėliokite komandą pagal šiandienos prognozę.')}>{tt('Coalition calculator', 'Koalicijų skaičiuoklė')}</CardTitle>
      <div className="flex flex-wrap gap-1.5">
        <span className="cx-chip px-2.5 py-1 text-sm" style={{ background: tint(PARTIES[me].color, 0.35), borderColor: PARTIES[me].color }}><PartyDot p={me} size={10} />{partyShort(me)} {seats[me]}</span>
        {options.map((q) => {
          const on = picked.includes(q);
          return <button key={q} type="button" aria-pressed={on} onClick={() => toggle(q)} className="cx-chip px-2.5 py-1 text-sm" style={{ background: on ? '#F3F4F6' : 'rgba(255,255,255,.06)', color: on ? INK : TEXT, borderColor: on ? '#F3F4F6' : LINE2, minHeight: 34 }}><PartyDot p={q} size={10} />{partyShort(q)} {seats[q]}</button>;
        })}
      </div>
      <div className="relative mt-3 flex rounded-md overflow-hidden" style={{ height: 22, background: 'rgba(255,255,255,.06)' }}>
        {members.map((q) => <div key={q} style={{ width: `${((seats[q] || 0) / 141) * 100}%`, background: PARTIES[q].color, boxShadow: 'inset -1px 0 0 rgba(0,0,0,.5)', transition: 'width .4s ease' }} />)}
        <span className="absolute top-0 bottom-0" style={{ left: `${(MAJORITY / 141) * 100}%`, width: 2, background: '#fff' }} />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="cx-num text-3xl" style={{ color: ok ? GREEN : TEXT }}><CountUp to={total} /> <span className="text-base t-muted">/ 71</span></span>
        <span className="text-sm font-extrabold text-right" style={{ color: !ok ? MUTED : minC >= 55 ? GREEN : minC >= 40 ? AMBER : RED }}>
          {!ok ? tt(`${MAJORITY - total} seats short`, `trūksta ${MAJORITY - total}`) : minC >= 55 ? tt('Majority, and they get along', 'Dauguma, ir sutaria') : minC >= 40 ? tt('Majority, but shaky', 'Dauguma, bet trapi') : tt('Majority on paper only', 'Dauguma tik popieriuje')}
        </span>
      </div>
      {worst && members.length > 1 && <div className="text-xs t-muted mt-1">{tt(`Weakest link: ${partyShort(worst[0])} and ${partyShort(worst[1])} (${minC}/100).`, `Silpniausia grandis: ${partyShort(worst[0])} ir ${partyShort(worst[1])} (${minC}/100).`)}</div>}
    </Card>
  );
}
/* ============================================================
   Real-calendar events, election-day turnout drive, campaign chronicle
   ============================================================ */
const SKIP_CHOICE = { t: bi('Skip it', 'Praleisti'), skip: true };
const FESTIVALS = [
  { id: 'sea', week: 2, rid: 'KLP', scene: 'klaipeda', icon: Anchor, name: bi('Klaipėda Sea Festival', 'Klaipėdos jūros šventė'), text: bi('Half a million people at the harbour. The main stage is yours for ten minutes, if you want it.', 'Pusė milijono žmonių uoste. Jei norite, pagrindinė scena jūsų dešimčiai minučių.'), choices: [
    { t: bi('Give a speech from the main stage', 'Sakyti kalbą iš pagrindinės scenos'), ap: 1, cost: 20, reg: 1.4, mom: 0.3, risk: { chance: 0.22, text: bi('A heckler steals the moment on camera.', 'Švilpikas prieš kameras pavagia jūsų akimirką.'), mom: -0.7 } },
    { t: bi('Walk the waterfront: selfies and fish soup', 'Vaikščioti krantine: asmenukės ir žuvienė'), ap: 1, cost: 5, reg: 0.9, groups: { youth: 1 } },
    SKIP_CHOICE] },
  { id: 'hoops', week: 3, rid: 'KNS', scene: 'kaunas', icon: Trophy, name: bi('Lithuania vs Latvia basketball friendly', 'Lietuva – Latvija: draugiškos krepšinio rungtynės'), text: bi('Žalgiris Arena is sold out. Cameras love politicians in team scarves.', '„Žalgirio“ arena pilnutėlė. Kameros mėgsta politikus su sirgalių šalikais.'), choices: [
    { t: bi('Sit courtside in a national team jersey', 'Sėdėti prie aikštelės su rinktinės marškinėliais'), ap: 1, cost: 15, reg: 1.1, mom: 0.2, groups: { youth: 1 } },
    { t: bi('Buy tickets for a youth club and go with them', 'Nupirkti bilietus jaunimo klubui ir eiti kartu'), ap: 1, cost: 40, reg: 0.8, cred: 2, groups: { youth: 2, public: 1 } },
    SKIP_CHOICE] },
  { id: 'zoline', week: 5, rid: 'ALY', scene: 'town', icon: Church, name: bi('Žolinė at Pivašiūnai', 'Žolinė Pivašiūnuose'), text: bi('Thousands of pilgrims and a big rural fair on the Feast of the Assumption.', 'Tūkstančiai piligrimų ir didelė kaimo mugė per Žolinę.'), choices: [
    { t: bi('Join the procession quietly', 'Tyliai dalyvauti procesijoje'), ap: 1, reg: 1.0, cred: 1, groups: { seniors: 2, farmers: 1 } },
    { t: bi('Hand out leaflets at the fair', 'Dalinti lankstinukus mugėje'), ap: 1, cost: 10, reg: 1.25, groups: { seniors: -1 }, risk: { chance: 0.3, text: bi('Locals are angry about campaigning on a holy day.', 'Vietiniai piktinasi agitacija per šventę.'), cred: -3 } },
    SKIP_CHOICE] },
  { id: 'balticway', week: 6, rid: 'VNO', scene: 'vilnius', icon: Users, name: bi('Baltic Way anniversary', 'Baltijos kelio metinės'), text: bi('23 August: people hold hands again along the old route. A day of unity and memory.', 'Rugpjūčio 23-ioji: žmonės vėl susikimba rankomis senuoju maršrutu. Vienybės ir atminties diena.'), choices: [
    { t: bi('Stand in the chain, no party symbols', 'Stovėti grandinėje be partijos simbolių'), ap: 1, nat: 0.22, cred: 3, groups: { seniors: 1 } },
    { t: bi('Give a speech on defence and freedom', 'Kalbėti apie gynybą ir laisvę'), ap: 1, nat: 0.32, mom: 0.3, groups: { business: 1, seniors: 1, minority: -1 } },
    SKIP_CHOICE] },
  { id: 'school', week: 7, rid: 'PAN', scene: 'town', icon: GraduationCap, name: bi('1 September: back to school', 'Rugsėjo 1-oji: mokslo metų pradžia'), text: bi('Schools reopen. Teachers are short of staff and parents are short of money.', 'Atsidaro mokyklos. Trūksta mokytojų, o tėvams – pinigų.'), choices: [
    { t: bi('Visit a rural school and promise teachers a pay rise', 'Aplankyti kaimo mokyklą ir pažadėti mokytojams didesnes algas'), ap: 1, reg: 0.9, nat: 0.12, groups: { public: 3 } },
    { t: bi('Announce free school meals', 'Paskelbti nemokamą maitinimą mokyklose'), ap: 1, cost: 25, nat: 0.24, groups: { seniors: 1, public: 1, business: -1 } },
    SKIP_CHOICE] },
  { id: 'marathon', week: 9, rid: 'VNO', scene: 'vilnius', icon: Route, name: bi('Vilnius Marathon', 'Vilniaus maratonas'), text: bi('Ten thousand runners through the Old Town. Will you run?', 'Dešimt tūkstančių bėgikų senamiestyje. Ar bėgsite?'), choices: [
    { t: bi('Run the 10 km in party colours', 'Bėgti 10 km su partijos spalvomis'), ap: 1, reg: 1.05, groups: { youth: 2 }, risk: { chance: 0.25, text: bi('You finish last, and the video goes viral.', 'Finišuojate paskutinis, o vaizdo įrašas plinta internete.'), mom: -0.5 } },
    { t: bi('Hand out water at the finish line', 'Dalinti vandenį finiše'), ap: 1, cost: 5, reg: 0.8, cred: 1, groups: { youth: 1 } },
    SKIP_CHOICE] },
  { id: 'harvest', week: 10, rid: 'MAR', scene: 'fields', icon: Wheat, name: bi('Suvalkija harvest fair', 'Suvalkijos derliaus šventė'), text: bi('Farmers show off the harvest in Marijampolė. They also brought a list of complaints.', 'Ūkininkai Marijampolėje rodo derlių. Atsivežė ir nusiskundimų sąrašą.'), choices: [
    { t: bi('Listen to the farmers for two hours', 'Dvi valandas klausytis ūkininkų'), ap: 1, reg: 1.1, groups: { farmers: 3 } },
    { t: bi('Promise cheaper fuel for farm machinery', 'Pažadėti pigesnį kurą žemės ūkio technikai'), ap: 1, reg: 1.35, cred: -1, groups: { farmers: 2, youth: -1 } },
    SKIP_CHOICE] },
];
const festivalNow = (g) => FESTIVALS.find((f) => f.week === g.week) || null;
const festivalNext = (g) => FESTIVALS.find((f) => f.week > g.week) || null;
function chron(g, kind, text, tone = 'good') {
  if (!g.chron) g.chron = [];
  g.chron.push({ week: g.week, kind, text, tone });
  if (g.chron.length > 80) g.chron.shift();
}
function resolveFestival(g, ci) {
  const F = festivalNow(g);
  if (!F || (g.fest && g.fest[F.id] != null)) return { ok: false, msg: tt('Nothing on this week.', 'Šią savaitę renginių nėra.') };
  const C = F.choices[ci];
  const p = g.player;
  const r = REG[F.rid];
  if (C.skip) {
    const sh = regionShares(g, r);
    const rv = PARTY_IDS.filter((q) => q !== p).sort((a, b) => sh[b] - sh[a])[0];
    gainSupport(g, F.rid, rv, 0.6, 0.6); normalizeRegion(g, F.rid);
    g.fest = { ...(g.fest || {}), [F.id]: ci };
    g.festRes = { id: F.id, d: 0, rv };
    addCons(g, 'warn', bi(`You skipped the ${F.name.en}. ${partyShort(rv)} took the stage instead.`, `Praleidote renginį „${F.name.lt}“. Sceną vietoj jūsų užėmė ${partyShort(rv)}.`), F.rid);
    chron(g, 'festival', bi(`Skipped the ${F.name.en}`, `Praleistas renginys „${F.name.lt}“`), 'warn');
    return { ok: true, tone: 'warn', msg: tt(`${partyShort(rv)} took the stage instead of you.`, `Sceną vietoj jūsų užėmė ${partyShort(rv)}.`) };
  }
  if (g.ap < (C.ap || 0)) return { ok: false, msg: tt('Out of energy!', 'Baigėsi energija!') };
  if (C.cost && g.money < C.cost) return { ok: false, msg: tt(`Not enough money: ${fmtEur(C.cost)} needed.`, `Trūksta pinigų: reikia ${fmtEur(C.cost)}.`) };
  g.ap -= C.ap || 0;
  if (C.cost) spend(g, C.cost);
  g.stats.actions += 1;
  const before = nationalShares(g)[p];
  const here = g.leaderAt === F.rid ? 1.3 : 1;
  if (C.reg) { gainSupport(g, F.rid, p, C.reg * here * satOf(p, r, regionShares(g, r)[p]) * credMult(g), 0.6); normalizeRegion(g, F.rid); }
  if (C.nat) REGIONS.forEach((rr) => { gainSupport(g, rr.id, p, C.nat * satOf(p, rr, regionShares(g, rr)[p]), 0.6); normalizeRegion(g, rr.id); });
  if (C.groups) Object.entries(C.groups).forEach(([id, d]) => { g.groupMood[id] = clamp((g.groupMood[id] || 0) + d, -20, 20); });
  if (C.mom) g.momentum[p] = clamp(g.momentum[p] + C.mom, -10, 10);
  if (C.cred) addCred(g, C.cred);
  let note = null;
  if (C.risk && Math.random() < C.risk.chance) {
    if (C.risk.mom) g.momentum[p] = clamp(g.momentum[p] + C.risk.mom, -10, 10);
    if (C.risk.cred) addCred(g, C.risk.cred);
    note = C.risk.text;
    addCons(g, 'bad', bi(`${F.name.en}: ${C.risk.text.en}`, `${F.name.lt}: ${C.risk.text.lt}`), F.rid);
  }
  const d = nationalShares(g)[p] - before;
  g.fest = { ...(g.fest || {}), [F.id]: ci };
  g.festRes = { id: F.id, d, note };
  g.weekMoves = [...(g.weekMoves || []), { rid: F.rid, type: 'rally' }];
  chron(g, 'festival', bi(`${F.name.en}: ${C.t.en.toLowerCase()}`, `${F.name.lt}: ${C.t.lt.toLowerCase()}`), note ? 'bad' : 'good');
  return { ok: true, tone: note ? 'bad' : 'good', msg: note ? L(note) : tt(`${L(F.name)}: ${fmtSignedPct(d)} nationally${here > 1 ? ' (leader bonus!)' : ''}`, `${L(F.name)}: ${fmtSignedPct(d)} šalyje${here > 1 ? ' (lyderio premija!)' : ''}`) };
}
function FestivalCard({ g, act }) {
  const F = festivalNow(g);
  const next = festivalNext(g);
  if (!F) {
    if (!next) return null;
    return (
      <div className="cx-soft p-3 flex items-center gap-3">
        <span className="grid place-items-center rounded-lg shrink-0" style={{ width: 38, height: 38, background: ACC_BG }}><next.icon size={18} /></span>
        <div className="min-w-0 text-sm"><div className="font-bold leading-snug">{tt('Coming up:', 'Netrukus:')} {L(next.name)}</div><div className="text-xs t-muted">{tt(`Week ${next.week} · ${rs(next.rid)} · move your leader there in time`, `${next.week} sav. · ${rs(next.rid)} · laiku nuvežkite ten lyderį`)}</div></div>
      </div>
    );
  }
  const done = g.fest && g.fest[F.id] != null ? g.fest[F.id] : null;
  const res = g.festRes && g.festRes.id === F.id ? g.festRes : null;
  const here = g.leaderAt === F.rid;
  return (
    <section className="cx-card overflow-hidden" style={{ padding: 0, borderColor: done == null ? 'rgba(245,165,36,.5)' : LINE }} aria-label={L(F.name)}>
      <Scene kind={F.scene} h={null} caption={false} flush kb className="h-[110px]">
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-extrabold" style={{ background: SUN, color: INK }}><Sparkles size={12} />{tt('EVENT THIS WEEK', 'ŠIOS SAVAITĖS RENGINYS')}</span>
        <div className="absolute left-3 right-3 bottom-2 cx-title text-xl leading-tight text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,.8)' }}>{L(F.name)}</div>
      </Scene>
      <div className="p-3 flex flex-col gap-2">
        <div className="text-xs font-bold t-muted">{fmtDay(weekStartDate(g.week))} · {rl(F.rid)}{here ? <span style={{ color: GREEN }}> · {tt('your leader is here: +30%', 'lyderis čia: +30 %')}</span> : <span> · {tt('leader elsewhere', 'lyderis kitur')}</span>}</div>
        <p className="text-sm font-semibold leading-snug">{L(F.text)}</p>
        {done == null ? F.choices.map((C, i) => (
          <button key={i} type="button" disabled={!C.skip && (g.ap < (C.ap || 0) || (C.cost && g.money < C.cost))} onClick={() => act((gg) => resolveFestival(gg, i))} className={`cx-btn ${C.skip ? '' : 'cx-quote'} w-full items-center text-left px-3 py-2`} style={{ gap: 10, minHeight: 44, justifyContent: 'flex-start', background: C.skip ? 'rgba(255,255,255,.05)' : undefined }}>
            <span className="font-bold text-sm leading-snug flex-1">{L(C.t)}</span>
            {!C.skip && <span className="text-xs font-extrabold shrink-0 inline-flex items-center gap-1">{C.ap ? <><Zap size={12} style={{ fill: SUN }} />{C.ap}</> : null}{C.cost ? ` · ${fmtEur(C.cost)}` : ''}</span>}
          </button>
        )) : (
          <div className="cx-soft p-2.5 text-sm font-semibold flex items-start gap-2">
            {F.choices[done].skip ? <Clock size={16} className="shrink-0 mt-0.5" style={{ color: AMBER }} /> : <Check size={16} className="shrink-0 mt-0.5" style={{ color: GREEN }} />}
            <span>{F.choices[done].skip ? tt(`You stayed away. ${res && res.rv ? partyShort(res.rv) : 'A rival'} took the stage.`, `Nedalyvavote. Sceną užėmė ${res && res.rv ? partyShort(res.rv) : 'varžovas'}.`) : <>{L(F.choices[done].t)}{res ? <> · <b>{fmtSignedPct(res.d)}</b></> : null}{res && res.note ? <span style={{ color: RED }}> · {L(res.note)}</span> : null}</>}</span>
          </div>
        )}
      </div>
    </section>
  );
}
// Election day: send volunteers to get your voters out.
function applyGotv(g, rids) {
  const p = g.player;
  rids.forEach((rid) => {
    const team = (g.gg[rid] && g.gg[rid][p]) || 0;
    gainSupport(g, rid, p, 0.45 + (team / 100) * 1.25, 0.95);
    normalizeRegion(g, rid);
  });
  g.gotv = rids;
  if (rids.length) chron(g, 'gotv', bi(`Election day: volunteers sent to ${rids.map((r) => REG[r].short.en).join(', ')}`, `Rinkimų diena: savanoriai išsiųsti į ${rids.map((r) => REG[r].short.lt).join(', ')}`));
}
function GotvSheet({ g, onDone, onClose }) {
  const me = g.player;
  const rows = REGIONS.map((r) => ({ r, info: raceInfo(g, r) })).sort((a, b) => Math.abs(a.info.gap) - Math.abs(b.info.gap));
  const [picks, setPicks] = useState([]);
  const toggle = (id) => { setPicks((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 3 ? p : [...p, id])); SFX.play('tap'); };
  return (
    <Sheet label={tt('Election day', 'Rinkimų diena')} onClose={onClose} z="z-50">
      <div className="relative">
        <Scene kind="night" h={null} caption={false} flush kb className="h-[140px]">
          <div className="absolute inset-x-4 bottom-3">
            <div className="cx-kicker text-xs" style={{ color: '#fff' }}>{tt('Your last decision', 'Paskutinis jūsų sprendimas')}</div>
            <div className="cx-title text-3xl leading-none text-white">{tt('Get out the vote!', 'Mobilizuokite rinkėjus!')}</div>
          </div>
        </Scene>
        <button type="button" onClick={onClose} aria-label={tt('Close', 'Uždaryti')} className="cx-btn absolute right-3 top-3 grid place-items-center" style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(7,9,13,.8)' }}><X size={18} /></button>
      </div>
      <div style={GUTTER} className="pt-4 flex flex-col gap-3">
        <p className="text-sm font-semibold">{tt('Polls open at 7:00. Send your volunteers to up to three regions to drive voters to the polls. Bigger ground teams bring out more people. Close races matter most.', 'Apylinkės atsidaro 7:00. Nusiųskite savanorius į iki trijų regionų, kad jie atvežtų rinkėjus balsuoti. Kuo didesnė vietos komanda, tuo daugiau žmonių ateis. Svarbiausios – artimos kovos.')}</p>
        <div className="flex flex-col gap-1.5">
          {rows.map(({ r, info }) => {
            const on = picks.includes(r.id);
            const team = Math.round(g.gg[r.id][me]);
            return (
              <button key={r.id} type="button" aria-pressed={on} onClick={() => toggle(r.id)} className="cx-tap w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left" style={{ background: on ? ACC_BG : 'rgba(255,255,255,.04)', border: `1px solid ${on ? SUN : LINE}` }}>
                <span className="grid place-items-center rounded-full shrink-0" style={{ width: 26, height: 26, border: `2px solid ${on ? SUN : LINE2}`, background: on ? SUN : 'transparent' }}>{on && <Check size={15} color={INK} />}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2"><span className="font-bold truncate">{rs(r)}</span><StatusPill status={info.status} /></span>
                  <span className="flex items-center gap-2 mt-1 text-[11px] font-bold t-muted"><Users size={12} />{tt('Team', 'Komanda')} {team}<span className="flex-1 cx-track" style={{ height: 5 }}><span className="block h-full" style={{ width: `${team}%`, background: '#3B82F6' }} /></span></span>
                </span>
                <span className="text-right shrink-0"><span className="block cx-num">{r.seats}</span><span className="block text-[10px] t-muted">{seatsWord(r.seats)}</span></span>
              </button>
            );
          })}
        </div>
        <Btn className="h-14 text-lg" onClick={() => onDone(picks)}><Vote size={20} />{picks.length ? tt(`Send volunteers (${picks.length}/3) and vote`, `Siųsti savanorius (${picks.length}/3) ir balsuoti`) : tt('Vote without a turnout drive', 'Balsuoti be mobilizacijos')}</Btn>
      </div>
    </Sheet>
  );
}
const CHRON_ICON = { debate: Tv, festival: Sparkles, ad: Clapperboard, presser: Mic, event: Newspaper, kompro: Search, gotv: Users };
function Chronicle({ g }) {
  const me = g.player;
  const hist = g.history.map((h) => h.shares[me]);
  const items = g.chron || [];
  const weeks = [...new Set(items.map((x) => x.week))].sort((a, b) => a - b);
  return (
    <Card className="mt-4 p-4 lg:col-span-2">
      <CardTitle sub={tt('Your poll through the campaign, and the moments that shaped it.', 'Jūsų reitingas per kampaniją ir svarbiausios akimirkos.')}>{tt('Campaign chronicle', 'Kampanijos kronika')}</CardTitle>
      <div className="flex items-baseline justify-between text-sm font-bold mb-1"><span className="t-muted">{tt('Start', 'Pradžia')} {fmtPct(hist[0])}</span><span>{tt('Final poll', 'Paskutinė apklausa')} {fmtPct(hist[hist.length - 1])}</span></div>
      <Spark data={hist} color={PARTIES[me].color} h={60} />
      {weeks.length === 0 ? <p className="text-sm t-muted mt-3">{tt('A quiet campaign.', 'Rami kampanija.')}</p> : (
        <ol className="mt-3 flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-x-6">
          {weeks.map((w) => (
            <li key={w} className="flex gap-3">
              <span className="cx-num shrink-0 grid place-items-center rounded-lg text-sm" style={{ width: 40, height: 28, background: 'rgba(255,255,255,.07)' }}>{tt(`W${w}`, `${w} s.`)}</span>
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                {items.filter((x) => x.week === w).map((x, i) => {
                  const Icon = CHRON_ICON[x.kind] || Star;
                  return <div key={i} className="flex items-start gap-1.5 text-sm font-semibold leading-snug"><Icon size={14} className="shrink-0 mt-0.5" style={{ color: x.tone === 'bad' ? RED : x.tone === 'warn' ? AMBER : GREEN }} /><span>{L(x.text)}</span></div>;
                })}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
const LIST_2024 = {
  LSDP: ['Gintautas Paluckas', 'Juozas Olekas', 'Rasa Budbergytė', 'Inga Ruginienė', 'Algirdas Sysas', 'Dovilė Šakalienė', 'Laura Asadauskaitė', 'Julius Sabatauskas', 'Giedrius Drukteinis', 'Saulius Čaplinskas', 'Linas Jonauskas', 'Tadas Prajara', 'Rimantas Sinkevičius', 'Linas Balsys', 'Antanas Nedzinskas', 'Ruslanas Baranovas', 'Birutė Vėsaitė', 'Paulius Visockas'],
  TS: ['Radvilė Morkūnaitė-Mikulėnienė', 'Gintarė Skaistė', 'Agnė Bilotaitė', 'Matas Maldeikis', 'Liudas Mažylis', 'Audronius Ažubalis', 'Jurgis Razma', 'Arūnas Valinskas', 'Vytautas Kernagis', 'Kazys Starkevičius', 'Raimondas Kuodis', 'Valdas Rakutis', 'Giedrė Balčytytė', 'Aistė Gedvilienė', 'Emanuelis Zingeris', 'Arvydas Pocius', 'Vytautas Juozapaitis'],
  NA: ['Agnė Širinskienė', 'Vytautas Jucius', 'Robert Puchovič', 'Artūras Skardžius', 'Aidas Gedvilas', 'Lina Šukytė-Korsakė', 'Kęstutis Bilius', 'Saulius Bucevičius', 'Mantas Poškus', 'Martynas Gedvilas', 'Petras Dargis', 'Raimondas Šukys', 'Dainius Varnas', 'Dainoras Bradauskas'],
  DSVL: ['Saulius Skvernelis', 'Lukas Savickas', 'Jekaterina Rojaka', 'Rima Baškienė', 'Tomas Tomilinas', 'Zigmantas Balčytis', 'Giedrimas Jeglinskas', 'Rūta Miliūtė'],
  LS: ['Virgilijus Alekna', 'Edita Rudelienė', 'Viktoras Pranckietis', 'Arminas Lydeka', 'Andrius Bagdonas', 'Vitalijus Gailius', 'Simonas Gentvilas'],
  LVZS: ['Ignas Vėgėlė', 'Valius Ąžuolas', 'Bronis Ropė', 'Dainius Gaižauskas', 'Aušrinė Norkienė', 'Rimas Jonas Jankūnas'],
};
/* ============================================================
   Districts and candidates
   Incumbents are the real members elected in each single-member constituency in October 2024
   (source: Wikipedia, "2024 Lithuanian parliamentary election"). Their party is the one they were
   elected for. Challengers are fictional and generated per game.
   ============================================================ */
const KITI_LABEL_2024 = { 'Vytautas Sinica': bi('National Alliance', 'Nacionalinis susivienijimas'), 'Viktoras Fiodorovas': bi('Independent', 'Išsikėlęs pats'), 'Vitalijus Šeršniovas': bi('Independent', 'Išsikėlęs pats') };
const FN_M = ['Tomas', 'Mantas', 'Andrius', 'Darius', 'Mindaugas', 'Paulius', 'Lukas', 'Justinas', 'Marius', 'Rokas', 'Vytautas', 'Jonas', 'Aurimas', 'Giedrius', 'Arnas', 'Karolis', 'Edvinas', 'Žygimantas', 'Dovydas', 'Saulius', 'Rimantas', 'Kęstutis', 'Algirdas', 'Gediminas', 'Martynas', 'Ignas', 'Evaldas', 'Tadas', 'Linas', 'Raimundas', 'Vaidas', 'Donatas', 'Arūnas', 'Valdas', 'Šarūnas'];
const FN_F = ['Rūta', 'Ieva', 'Eglė', 'Greta', 'Aistė', 'Jurgita', 'Kristina', 'Inga', 'Rasa', 'Lina', 'Monika', 'Gintarė', 'Agnė', 'Simona', 'Vaida', 'Neringa', 'Indrė', 'Laura', 'Asta', 'Dalia', 'Jolanta', 'Ugnė', 'Gabija', 'Milda', 'Vilma', 'Audronė', 'Renata', 'Edita', 'Živilė', 'Sigita', 'Loreta', 'Žaneta', 'Brigita'];
const SURN = ['Petrauskas', 'Jankauskas', 'Kazlauskas', 'Paulauskas', 'Stankevičius', 'Vasiliauskas', 'Žukauskas', 'Butkus', 'Urbonas', 'Navickas', 'Kavaliauskas', 'Ramanauskas', 'Sakalauskas', 'Rimkus', 'Bielskis', 'Lukoševičius', 'Baranauskas', 'Jonaitis', 'Gudelis', 'Adomaitis', 'Šimkus', 'Vaitkus', 'Grigas', 'Morkūnas', 'Juknevičius', 'Dambrauskas', 'Bernotas', 'Valatka', 'Kriaučiūnas', 'Matulis', 'Rutkauskas', 'Žilinskas', 'Petkus', 'Daukša', 'Kalinauskas', 'Lapinskas', 'Tamošiūnas', 'Jurgaitis', 'Norkus', 'Sabaliauskas', 'Mažeikis', 'Venckus', 'Banys', 'Leonavičius', 'Zabarauskas'];
function femSurname(s, maiden) {
  if (maiden) {
    if (s.endsWith('us')) return `${s.slice(0, -2)}utė`;
    if (s.endsWith('ys')) return `${s.slice(0, -2)}ytė`;
    if (s.endsWith('is')) return `${s.slice(0, -2)}ytė`;
    if (s.endsWith('as')) return `${s.slice(0, -2)}aitė`;
    return `${s.slice(0, -1)}aitė`;
  }
  if (s.endsWith('us')) return `${s.slice(0, -2)}uvienė`;
  if (s.endsWith('as') || s.endsWith('is') || s.endsWith('ys')) return `${s.slice(0, -2)}ienė`;
  return `${s.slice(0, -1)}ienė`;
}
const PROFS = [
  ['teacher', 'mokytojas', 'mokytoja'], ['family doctor', 'šeimos gydytojas', 'šeimos gydytoja'], ['farmer', 'ūkininkas', 'ūkininkė'], ['business owner', 'verslininkas', 'verslininkė'],
  ['lawyer', 'teisininkas', 'teisininkė'], ['municipal councillor', 'savivaldybės tarybos narys', 'savivaldybės tarybos narė'], ['former deputy mayor', 'buvęs vicemeras', 'buvusi vicemerė'],
  ['engineer', 'inžinierius', 'inžinierė'], ['journalist', 'žurnalistas', 'žurnalistė'], ['economist', 'ekonomistas', 'ekonomistė'], ['police officer', 'policininkas', 'policininkė'],
  ['nurse', 'slaugytojas', 'slaugytoja'], ['IT specialist', 'IT specialistas', 'IT specialistė'], ['basketball coach', 'krepšinio treneris', 'krepšinio trenerė'],
  ['social worker', 'socialinis darbuotojas', 'socialinė darbuotoja'], ['school head', 'mokyklos direktorius', 'mokyklos direktorė'], ['army reserve officer', 'atsargos karininkas', 'atsargos karininkė'],
  ['pharmacist', 'vaistininkas', 'vaistininkė'], ['NGO leader', 'NVO vadovas', 'NVO vadovė'], ['student activist', 'studentų aktyvistas', 'studentų aktyvistė'], ['agronomist', 'agronomas', 'agronomė'],
];
const FOCUS = {
  welfare: bi('pensions and social support', 'pensijos ir socialinė parama'), security: bi('defence and security', 'gynyba ir saugumas'), business: bi('jobs and investment', 'darbo vietos ir investicijos'),
  health: bi('local healthcare', 'sveikatos priežiūra vietoje'), roads: bi('roads and buses', 'keliai ir autobusai'), schools: bi('schools', 'mokyklos'), green: bi('climate and nature', 'klimatas ir gamta'),
  farmers: bi('farmers', 'ūkininkai'), housing: bi('affordable housing', 'įperkamas būstas'), trust: bi('honest politics', 'sąžininga politika'), minority: bi('minority rights', 'tautinių mažumų teisės'), youth: bi('young families', 'jaunos šeimos'),
};
const PARTY_FOCUS = { LSDP: ['welfare', 'health', 'schools'], TS: ['security', 'business', 'youth'], NA: ['trust', 'welfare', 'farmers'], DSVL: ['health', 'roads', 'trust'], LS: ['business', 'housing', 'youth'], LVZS: ['farmers', 'health', 'schools'], LP: ['housing', 'green', 'youth'], LLRA: ['minority', 'schools', 'welfare'], DP: ['welfare', 'roads', 'business'], LIT: ['business', 'roads', 'trust'], KS: ['schools', 'youth', 'trust'], LZP: ['green', 'farmers', 'health'], KITI: ['roads', 'trust', 'health'] };
const HAIR_M = ['short', 'crop', 'quiff', 'side', 'swept', 'messy', 'receding', 'shaved', 'curly'];
const HAIR_F = ['long', 'bob', 'bun'];
const HAIR_C = ['#2A1C14', '#4A3426', '#6B4A2A', '#8A6A3A', '#C9A46A', '#D9B26A', '#7A7F86', '#BABEC4', '#1F1F1F', '#8A4B2A'];
const isFemName = (full) => /[aė]$/.test(full.split(' ')[0]);
const CAND_CACHE = new Map();
function contests(p, r, cons, rand, inc, player) {
  if (p === player || (inc && inc[1] === p)) return true;
  if (['LSDP', 'TS', 'NA', 'DSVL', 'LS', 'LVZS'].includes(p)) return true;
  if (p === 'LLRA') return ['VNO', 'VLC', 'KLP'].includes(r.id) || (cons[6] && /Nalšios|Rytų Sėlos/.test(cons[0]));
  if (p === 'LP') return cons[1] >= 0.5 || rand() < 0.35;
  if (p === 'KITI') return rand() < 0.55;
  return rand() < ({ DP: 0.6, LIT: 0.55, KS: 0.45, LZP: 0.45 }[p] || 0.5);
}
// Base (unmodified) candidates for one district, cached per game seed.
function baseCandidates(seed, cid, player) {
  const key = `${seed}|${cid}|${player}`;
  if (CAND_CACHE.has(key)) return CAND_CACHE.get(key);
  const [rid] = cid.split('-');
  const r = REG[rid];
  const cons = consById(cid);
  const inc = cons[6] || null;
  const rand = mulberry32(hashStr(`${seed}|${cid}`));
  const list = [];
  ALL_IDS.forEach((p) => {
    if (!contests(p, r, cons, rand, inc, player)) return;
    const id = `${cid}-${p}`;
    if (inc && inc[1] === p) {
      const fem = isFemName(inc[0]);
      list.push({ id, cid, p, name: inc[0], fem, real: true, inc: true, leader: PARTIES[p] && PARTIES[p].leader === inc[0], label: KITI_LABEL_2024[inc[0]] || null,
        fame: 62 + Math.round(rand() * 22), cha: 45 + Math.round(rand() * 40), exp: 75 + Math.round(rand() * 20), roots: 55 + Math.round(rand() * 35), risk: 0, focus: PARTY_FOCUS[p].slice(0, 2), look: lookFor(id, fem, p, rand) });
      return;
    }
    const fem = rand() < 0.45;
    const first = (fem ? FN_F : FN_M)[Math.floor(rand() * (fem ? FN_F.length : FN_M.length))];
    const sur0 = SURN[Math.floor(rand() * SURN.length)];
    const name = `${first} ${fem ? femSurname(sur0, rand() < 0.3) : sur0}`;
    const big = ['LSDP', 'TS', 'NA', 'DSVL'].includes(p);
    const pf = PARTY_FOCUS[p] || PARTY_FOCUS.KITI;
    const f1 = pf[Math.floor(rand() * pf.length)];
    const f2 = (r.issues || []).length && rand() < 0.5 ? ({ housing: 'housing', def: 'security', transit: 'roads', roads: 'roads', health: 'health', jobs: 'business', agri: 'farmers', emig: 'youth', col: 'welfare', pensions: 'welfare', energy: 'welfare', tax: 'business', trust: 'trust', minority: 'minority', port: 'business' }[r.issues[Math.floor(rand() * r.issues.length)]] || 'roads') : pf[(pf.indexOf(f1) + 1) % pf.length];
    list.push({ id, cid, p, name, fem, real: false, inc: false, age: 28 + Math.floor(rand() * 38), prof: Math.floor(rand() * PROFS.length),
      fame: Math.round((big ? 22 : 12) + rand() * (big ? 40 : 30)), cha: 30 + Math.round(rand() * 60), exp: Math.round(10 + rand() * 60), roots: 30 + Math.round(rand() * 60), risk: Math.round(4 + rand() * 30),
      focus: [f1, f2 === f1 ? pf[(pf.indexOf(f1) + 2) % pf.length] : f2], years: 2 + Math.floor(rand() * 20), look: lookFor(id, fem, p, rand) });
  });
  CAND_CACHE.set(key, list);
  return list;
}
function lookFor(id, fem, p, rand) {
  const key = `cand:${id}`;
  if (!LOOKS[key]) {
    const col = (PARTIES[p] || PARTIES.KITI).color;
    const lk = { s: Math.floor(rand() * 3), hair: fem ? HAIR_F[Math.floor(rand() * HAIR_F.length)] : HAIR_M[Math.floor(rand() * HAIR_M.length)], hc: HAIR_C[Math.floor(rand() * HAIR_C.length)], acc: col, bg: mixHex(col, '#FFFFFF', 0.55) };
    if (fem) { lk.fem = true; lk.top = mixHex(col, '#111827', 0.35); if (rand() < 0.3) lk.earring = true; } else { lk.suit = mixHex(col, '#111827', 0.55); if (rand() < 0.25) lk.beard = ['stubble', 'short', 'full'][Math.floor(rand() * 3)]; if (rand() < 0.1) lk.mous = true; }
    if (rand() < 0.28) lk.glasses = rand() < 0.5 ? 'rect' : 'round';
    LOOKS[key] = lk;
  }
  return key;
}
// Candidates with this game's changes applied (your investments, star recruits).
function candidatesOf(g, cid) {
  const inv = (g.candInv && g.candInv[cid]) || null;
  const st = (g.stars && g.stars[cid]) || {};
  return baseCandidates(g.seed, cid, g.player).map((c0) => {
    const c = { ...c0 };
    if (st[c.p] != null && !c.inc) { c.star = st[c.p]; c.fame = Math.min(95, c.fame + 28); c.cha = Math.min(95, c.cha + 8); }
    if (inv && c.p === g.player) { c.fame = Math.min(98, c.fame + (inv.fame || 0)); c.roots = Math.min(98, c.roots + (inv.roots || 0)); c.meet = inv.meet || 0; c.ads = inv.ads || 0; }
    return c;
  });
}
const candOf = (g, cid, p) => candidatesOf(g, cid).find((c) => c.p === p) || null;
const candQ = (c) => (c ? Math.exp(0.0042 * (c.fame - 50) + 0.0022 * (c.cha - 50) + 0.0016 * (c.roots - 50) + (c.inc ? 0.06 : 0)) : 0.12);
// First-round projection for one district (no noise).
function districtView(g, cid, regShares) {
  const r = REG[cid.split('-')[0]];
  const sh = regShares || regionShares(g, r);
  const Lc = g.leans[cid];
  const cs = candidatesOf(g, cid);
  const rows = cs.map((c) => ({ c, s: sh[c.p] * Lc[c.p] * candQ(c) * (c.p === 'KITI' ? 0.45 : 1) }));
  const t = sum(rows.map((x) => x.s)) || 1;
  rows.forEach((x) => { x.s = (x.s / t) * 100; });
  return rows.sort((a, b) => b.s - a.s);
}
const cnm = (cid) => { const c = consById(cid); return LANG === 'lt' ? c[0] : (c[4] || c[0]); };
const cnum = (cid) => consById(cid)[3];
const ALL_CIDS = REGIONS.flatMap((r) => r.cons.map((_, i) => `${r.id}-${i}`));
function candInvest(g, cid, kind) {
  const p = g.player;
  const c = candOf(g, cid, p);
  if (!c) return { ok: false, msg: tt('Your party has no candidate here.', 'Jūsų partija čia kandidato neturi.') };
  const cost = kind === 'ads' ? 18 : 6;
  if (g.ap < 1) return { ok: false, msg: tt('Out of energy! Tap Next week to refill.', 'Baigėsi energija! Spauskite „Kita savaitė“.') };
  if (g.money < cost) return { ok: false, msg: tt(`Not enough money: ${fmtEur(cost)} needed.`, `Trūksta pinigų: reikia ${fmtEur(cost)}.`) };
  g.ap -= 1; spend(g, cost); g.stats.actions += 1;
  if (!g.candInv) g.candInv = {};
  const inv = { ...(g.candInv[cid] || {}) };
  const rid = cid.split('-')[0];
  if (kind === 'ads') {
    const d = Math.round(12 * (1 - c.fame / 115));
    inv.fame = (inv.fame || 0) + d; inv.ads = (inv.ads || 0) + 1;
    g.candInv[cid] = inv;
    return { ok: true, tone: 'good', msg: tt(`${c.name}’s posters and local ads are up: name recognition +${d}`, `${c.name}: stendai ir vietinė reklama – žinomumas +${d}`) + (vrkCheck(g) || '') };
  }
  const d = Math.round(10 * (1 - c.roots / 115));
  inv.roots = (inv.roots || 0) + d; inv.meet = (inv.meet || 0) + 1;
  g.candInv[cid] = inv;
  g.gg[rid][p] = Math.min(100, g.gg[rid][p] + 3);
  return { ok: true, tone: 'good', msg: tt(`${c.name} met voters at the community centre: local ties +${d}`, `${c.name} susitiko su bendruomene: vietos ryšiai +${d}`) };
}
/* ---------- district & member screens ---------- */
const NavCtx = React.createContext({ openDistrict: () => {}, openCand: () => {}, openMembers: () => {} });
function CandFace({ c, size = 40, mood = 'ok' }) {
  return <Portrait who={c.look} size={size} square mood={mood} ring={(PARTIES[c.p] || PARTIES.KITI).color} title={c.name} />;
}
function partyLabel(c) {
  if (c.p === 'KITI') return c.label ? L(c.label) : tt('Independent', 'Išsikėlęs pats');
  return partyShort(c.p);
}
function profText(c) {
  if (c.real) return c.leader ? tt('Party leader · Seimas member', c.fem ? 'Partijos pirmininkė · Seimo narė' : 'Partijos pirmininkas · Seimo narys') : tt('Seimas member, elected 2024', c.fem ? 'Seimo narė, išrinkta 2024 m.' : 'Seimo narys, išrinktas 2024 m.');
  if (c.star != null) return L(STAR_PEOPLE[c.star]);
  const P = PROFS[c.prof];
  return LANG === 'lt' ? P[c.fem ? 2 : 1] : P[0];
}
function DistrictRow({ g, cid, e, onOpen }) {
  const me = g.player;
  const view = districtView(g, cid);
  const mine = view.find((x) => x.c.p === me);
  const lead = view[0];
  const second = view[1];
  const status = !mine ? 'far' : lead.c.p === me ? (lead.s - second.s >= 6 ? 'safe' : 'close') : (lead.s - mine.s < 6 ? 'close' : lead.s - mine.s < 14 ? 'behind' : 'far');
  return (
    <button type="button" onClick={() => onOpen(cid)} className="cx-tap w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left" style={{ background: 'rgba(255,255,255,.04)', border: `1px solid ${LINE}`, borderLeft: `4px solid ${PARTIES[(e && e.winner) || lead.c.p] ? PARTIES[(e && e.winner) || lead.c.p].color : '#64748B'}` }}>
      <span className="cx-num shrink-0 grid place-items-center rounded-lg text-sm" style={{ width: 34, height: 34, background: 'rgba(0,0,0,.35)' }}>{cnum(cid)}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold leading-tight truncate">{cnm(cid)}</span>
        <span className="flex items-center gap-1.5 mt-0.5 text-[11px] font-bold t-muted min-w-0">
          <CandFace c={lead.c} size={18} /><span className="truncate">{lead.c.name}</span><span className="shrink-0">{fmtPct(lead.s, 0)}</span>
        </span>
      </span>
      <span className="flex flex-col items-end gap-1 shrink-0">
        <StatusPill status={status} />
        <span className="text-[11px] font-bold t-muted">{mine ? tt(`you ${fmtPct(mine.s, 0)}`, `jūs ${fmtPct(mine.s, 0)}`) : tt('no candidate', 'be kandidato')}</span>
      </span>
    </button>
  );
}
function DistrictList({ g, proj, compact }) {
  const nav = React.useContext(NavCtx);
  const [q, setQ] = useState('');
  const [rf, setRf] = useState('all');
  const [sf, setSf] = useState('all');
  const me = g.player;
  const f = fold(q.trim());
  const rows = useMemo(() => ALL_CIDS.map((cid) => {
    const e = proj.smd.find((x) => x.cid === cid);
    const cs = candidatesOf(g, cid);
    return { cid, e, text: fold(`${cnum(cid)} ${consById(cid)[0]} ${consById(cid)[4]} ${consById(cid)[5]} ${cs.map((c) => c.name).join(' ')}`) };
  }), [g, proj]);
  const list = rows.filter((x) => (rf === 'all' || x.cid.startsWith(`${rf}-`)) && (!f || x.text.includes(f)) && (sf === 'all' || (sf === 'win' ? x.e && x.e.winner === me : sf === 'run' ? x.e && x.e.round === 2 && (x.e.runoff.a === me || x.e.runoff.b === me) : !(x.e && x.e.winner === me))))
    .sort((a, b) => cnum(a.cid) - cnum(b.cid));
  const wins = rows.filter((x) => x.e && x.e.winner === me).length;
  const chip = (on, onClick, label, key) => <button key={key} type="button" aria-pressed={on} onClick={onClick} className="cx-chip shrink-0 px-2.5 py-1 text-xs" style={{ background: on ? '#F3F4F6' : 'rgba(255,255,255,.06)', color: on ? INK : TEXT, borderColor: on ? '#F3F4F6' : LINE2, minHeight: 30 }}>{label}</button>;
  return (
    <section className="flex flex-col gap-2.5" aria-label={tt('All 71 districts', 'Visos 71 apygardos')}>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="cx-title text-2xl">{tt('71 local districts', '71 vienmandatė apygarda')}</h3>
        <span className="text-sm font-bold">{tt(`You’d win ${wins}`, `Laimėtumėte ${wins}`)}</span>
      </div>
      <label className="flex items-center gap-2 rounded-xl px-3" style={{ background: 'rgba(255,255,255,.06)', border: `1px solid ${LINE2}`, minHeight: 44 }}>
        <Search size={16} className="t-muted shrink-0" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tt('District, town, number or candidate…', 'Apygarda, miestas, numeris ar kandidatas…')} aria-label={tt('Search districts', 'Ieškoti apygardų')} className="flex-1 bg-transparent outline-none text-sm font-semibold" style={{ color: TEXT, minWidth: 0 }} />
      </label>
      <div className="cx-layers flex gap-1.5 overflow-x-auto pb-0.5">
        {chip(sf === 'all', () => setSf('all'), tt('All', 'Visos'), 'a')}
        {chip(sf === 'win', () => setSf('win'), tt('You win', 'Laimite'), 'w')}
        {chip(sf === 'run', () => setSf('run'), tt('Your runoffs', 'Jūsų II turai'), 'r')}
        {chip(sf === 'lose', () => setSf('lose'), tt('Not yours', 'Ne jūsų'), 'l')}
      </div>
      <div className="cx-layers flex gap-1.5 overflow-x-auto pb-0.5">
        {chip(rf === 'all', () => setRf('all'), tt('All regions', 'Visi regionai'), 'all')}
        {REGIONS.map((r) => chip(rf === r.id, () => setRf(r.id), rs(r), r.id))}
      </div>
      <div className={`flex flex-col gap-1.5 ${compact ? '' : 'lg:grid lg:grid-cols-2 lg:gap-2'}`}>
        {list.map((x) => <DistrictRow key={x.cid} g={g} cid={x.cid} e={x.e} onOpen={nav.openDistrict} />)}
        {list.length === 0 && <div className="text-sm t-muted py-3">{tt('No districts match.', 'Tokių apygardų nėra.')}</div>}
      </div>
    </section>
  );
}
function RegionDistricts({ g, rid, proj }) {
  const nav = React.useContext(NavCtx);
  const r = REG[rid];
  const mine = proj.smd.filter((e) => e.rid === rid && e.winner === g.player).length;
  return (
    <div>
      <div className="text-sm font-extrabold t-muted mb-2">{tt(`Local districts: you’d win ${mine} of ${r.seats}. Tap one for candidates.`, `Apygardos: laimėtumėte ${mine} iš ${r.seats}. Paspauskite – pamatysite kandidatus.`)}</div>
      <div className="flex flex-col gap-1.5">
        {r.cons.map((_, i) => { const cid = `${rid}-${i}`; return <DistrictRow key={cid} g={g} cid={cid} e={proj.smd.find((e) => e.cid === cid)} onOpen={nav.openDistrict} />; })}
      </div>
    </div>
  );
}
function StatBar({ label, v, color = SUN, hint }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold"><span>{label}</span><span className="cx-num">{Math.round(v)}</span></div>
      <div className="cx-track mt-1" style={{ height: 8 }}><div className="h-full" style={{ width: `${clamp(v, 2, 100)}%`, background: color, transition: 'width .5s ease' }} /></div>
      {hint && <div className="text-[10px] t-muted mt-0.5">{hint}</div>}
    </div>
  );
}
function DistrictSheet({ g, cid, act, onClose }) {
  const nav = React.useContext(NavCtx);
  const me = g.player;
  const c0 = consById(cid);
  const r = REG[cid.split('-')[0]];
  const E = g.election;
  const result = E ? E.smd.find((x) => x.cid === cid) : null;
  const view = districtView(g, cid);
  const proj = useMemo(() => (E ? null : simulateElection(g, false)), [g]);
  const pe = proj ? proj.smd.find((x) => x.cid === cid) : null;
  const mine = view.find((x) => x.c.p === me);
  const inc = c0[6];
  const campaign = g.phase === 'campaign';
  const voters = Math.round((r.voters * 1000) / r.cons.length);
  return (
    <Sheet label={tt(`District ${c0[3]}`, `${c0[3]} apygarda`)} onClose={onClose} z="z-50">
      <div className="relative">
        <Scene kind={REGION_SCENE[r.id] || 'town'} h={null} caption={false} flush kb className="h-[130px]">
          <div className="absolute inset-x-4 bottom-3 flex items-end gap-3">
            <span className="cx-num grid place-items-center rounded-xl text-2xl shrink-0" style={{ width: 54, height: 54, background: SUN, color: INK }}>{c0[3]}</span>
            <div className="min-w-0">
              <div className="cx-kicker text-xs" style={{ color: '#fff' }}>{rl(r)}{c0[5] ? ` · ${c0[5]}` : ''}</div>
              <div className="cx-title text-2xl leading-tight text-white truncate">{consName(cnm(cid))}</div>
            </div>
          </div>
        </Scene>
        <button type="button" onClick={onClose} aria-label={tt('Close', 'Uždaryti')} className="cx-btn absolute right-3 top-3 grid place-items-center" style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(7,9,13,.8)' }}><X size={18} /></button>
      </div>
      <div style={GUTTER} className="pt-4 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          {[[tt('Voters', 'Rinkėjai'), `~${fmtNum(voters / 1000, 0)}k`], [tt('City share', 'Miesto dalis'), `${Math.round(c0[1] * 100)}${LANG === 'lt' ? ' %' : '%'}`], [tt('Candidates', 'Kandidatai'), String(view.length)]].map(([l, v]) => <div key={l} className="cx-soft p-2.5"><div className="text-[11px] font-bold t-muted">{l}</div><div className="cx-num text-xl">{v}</div></div>)}
        </div>
        {inc && (
          <div className="cx-soft p-3 flex items-center gap-3 text-sm">
            <Landmark size={18} className="shrink-0" />
            <span><b>{tt('2024 result:', '2024 m. rezultatas:')}</b> {inc[0]} ({inc[1] === 'KITI' ? L(KITI_LABEL_2024[inc[0]] || bi('Independent', 'Išsikėlęs pats')) : partyShort(inc[1])}) {tt('won this seat.', 'laimėjo šią apygardą.')}</span>
          </div>
        )}
        <div>
          <div className="cx-kicker text-xs mb-2">{result ? tt('Election result', 'Rinkimų rezultatas') : tt('First-round projection', 'I turo prognozė')}</div>
          <div className="flex flex-col gap-1.5">
            {view.map(({ c, s }, i) => {
              const won = result ? result.winner === c.p : null;
              return (
                <button key={c.id} type="button" onClick={() => nav.openCand(cid, c.p)} className="cx-tap w-full grid items-center gap-2.5 rounded-xl px-2.5 py-2 text-left" style={{ gridTemplateColumns: '40px 1fr 54px', background: c.p === me ? ACC_BG : 'rgba(255,255,255,.04)', border: `1px solid ${won ? GREEN : LINE}` }}>
                  <CandFace c={c} size={40} mood={i === 0 ? 'grin' : 'ok'} />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 min-w-0"><span className="font-bold truncate">{c.name}</span>{c.inc && <span className="cx-chip px-1.5 text-[10px] shrink-0" style={{ color: SUN }}>{tt('MP', c.fem ? 'Seimo narė' : 'Seimo narys')}</span>}{c.star != null && <Star size={12} className="shrink-0" style={{ fill: SUN, color: SUN }} />}{won && <Trophy size={13} className="shrink-0" style={{ color: GREEN }} />}</span>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold t-muted"><PartyDot p={c.p} size={9} />{partyLabel(c)} · {profText(c)}</span>
                    <span className="cx-track block mt-1" style={{ height: 6 }}><span className="block h-full" style={{ width: `${clamp(s * 2, 2, 100)}%`, background: (PARTIES[c.p] || PARTIES.KITI).color }} /></span>
                  </span>
                  <span className="cx-num text-right">{fmtPct(s, 1)}</span>
                </button>
              );
            })}
          </div>
          <div className="text-[11px] t-muted mt-1.5">{tt('Projection = regional poll × local lean × candidate strength. Tap a candidate for the profile.', 'Prognozė = regiono reitingas × vietos polinkis × kandidato stiprumas. Paspauskite kandidatą – pamatysite profilį.')}</div>
        </div>
        {(pe || result) && (
          <div className="cx-soft p-3 text-sm font-semibold">
            {(() => {
              const e = result || pe;
              if (e.round === 1) return tt(`${(candOf(g, cid, e.winner) || {}).name || partyShort(e.winner)} ${result ? 'won' : 'would win'} outright in round one.`, `${(candOf(g, cid, e.winner) || {}).name || partyShort(e.winner)} ${result ? 'laimėjo' : 'laimėtų'} jau pirmajame ture.`);
              const a = candOf(g, cid, e.runoff.a), b = candOf(g, cid, e.runoff.b);
              return <>{tt('Runoff:', 'II turas:')} <b>{a ? a.name : partyShort(e.runoff.a)}</b> {tt('vs', 'prieš')} <b>{b ? b.name : partyShort(e.runoff.b)}</b>{e.runoff.sa != null ? ` · ${fmtPct(e.runoff.sa, 0)} – ${fmtPct(e.runoff.sb, 0)}` : ''}{` · ${tt(result ? 'winner' : 'likely winner', result ? 'laimėjo' : 'tikėtinas laimėtojas')}: ${(candOf(g, cid, e.winner) || {}).name || partyShort(e.winner)}`}</>;
            })()}
          </div>
        )}
        {campaign && mine && (
          <div className="cx-card p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2"><CandFace c={mine.c} size={36} /><div className="min-w-0"><div className="font-black leading-tight truncate">{tt('Your candidate:', 'Jūsų kandidatas:')} {mine.c.name}</div><div className="text-xs t-muted">{tt('Spend on them directly', 'Investuokite tiesiogiai į kandidatą')}</div></div></div>
            <Btn kind="white" className="h-12 justify-between px-3" disabled={g.ap < 1 || g.money < 18} onClick={() => act((gg) => candInvest(gg, cid, 'ads'))}><span className="inline-flex items-center gap-2"><Megaphone size={17} />{tt('Local posters and ads', 'Vietiniai stendai ir reklama')}</span><span className="text-sm inline-flex items-center gap-1"><Zap size={13} style={{ fill: INK }} />1 · {fmtEur(18)}</span></Btn>
            <Btn kind="white" className="h-12 justify-between px-3" disabled={g.ap < 1 || g.money < 6} onClick={() => act((gg) => candInvest(gg, cid, 'meet'))}><span className="inline-flex items-center gap-2"><Users size={17} />{tt('Community meetings', 'Susitikimai su bendruomene')}</span><span className="text-sm inline-flex items-center gap-1"><Zap size={13} style={{ fill: INK }} />1 · {fmtEur(6)}</span></Btn>
          </div>
        )}
        {campaign && !mine && <div className="cx-soft p-3 text-sm font-semibold">{tt('Your party is not running a candidate here.', 'Jūsų partija čia kandidato neiškėlė.')}</div>}
      </div>
    </Sheet>
  );
}
function CandidateSheet({ g, cid, p, onClose, onBack }) {
  const c = candOf(g, cid, p);
  if (!c) return null;
  const P = PARTIES[p] || PARTIES.KITI;
  const view = districtView(g, cid);
  const row = view.find((x) => x.c.p === p);
  const rank = view.indexOf(row) + 1;
  const E = g.election;
  const res = E ? E.smd.find((x) => x.cid === cid) : null;
  const won = res && res.winner === p;
  const bio = c.real
    ? tt(`Elected for ${c.label ? L(c.label) : partyShort(p)} in this district in October 2024${c.leader ? ' and now leads the party' : ''}. In this game they seek re-election in 2028. Profile scores below are game estimates, not real data.`,
      `2024 m. spalį ${c.fem ? 'išrinkta' : 'išrinktas'} šioje apygardoje nuo ${c.label ? L(c.label) : partyShort(p)}${c.leader ? ' ir dabar vadovauja partijai' : ''}. Žaidime 2028 m. siekia būti ${c.fem ? 'perrinkta' : 'perrinktas'}. Žemiau pateikti vertinimai – žaidimo, ne tikri duomenys.`)
    : tt(`${c.age}, ${profText(c)}. Active in local politics for ${c.years} years. Running in ${cnm(cid)} on ${L(FOCUS[c.focus[0]])} and ${L(FOCUS[c.focus[1]])}.`,
      `${c.age} m., ${profText(c)}. Vietos politikoje – ${c.years} m. ${cnm(cid)} apygardoje kandidatuoja ${c.fem ? 'žadėdama' : 'žadėdamas'} rūpintis tema „${L(FOCUS[c.focus[0]])}“ ir „${L(FOCUS[c.focus[1]])}“.`);
  return (
    <Sheet label={c.name} onClose={onClose} z="z-50">
      <div className="relative">
        <div style={{ height: 130, background: `linear-gradient(135deg, ${tint(P.color, 0.3)}, #0B0E14)` }} />
        <div className="absolute left-4 bottom-[-44px] flex items-end gap-3">
          <CandFace c={c} size={104} mood={won ? 'grin' : 'happy'} />
          <div className="pb-12 min-w-0">
            <div className="cx-kicker text-xs" style={{ color: '#fff' }}>{tt(`Candidate · district ${cnum(cid)}`, `Kandidatas · ${cnum(cid)} apygarda`)}</div>
            <div className="cx-title text-2xl leading-none">{c.name}</div>
          </div>
        </div>
        <div className="absolute right-3 top-3 flex gap-2">
          {onBack && <button type="button" onClick={onBack} aria-label={tt('Back to the district', 'Atgal į apygardą')} className="cx-btn grid place-items-center" style={{ width: 38, height: 38, borderRadius: 999, background: 'rgba(7,9,13,.7)' }}><ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} /></button>}
          <button type="button" onClick={onClose} aria-label={tt('Close', 'Uždaryti')} className="cx-btn grid place-items-center" style={{ width: 38, height: 38, borderRadius: 999, background: 'rgba(7,9,13,.7)' }}><X size={18} /></button>
        </div>
      </div>
      <div style={GUTTER} className="pt-14 flex flex-col gap-4">
        <div className="flex flex-wrap gap-1.5">
          <span className="cx-chip px-2.5 py-1 text-sm" style={{ background: tint(P.color, 0.3), borderColor: P.color }}><PartyDot p={p} size={10} />{partyLabel(c)}</span>
          {c.real && <span className="cx-chip px-2.5 py-1 text-sm" style={{ color: SUN }}><Landmark size={14} />{tt('Real Seimas member (2024–2028)', c.fem ? 'Tikra Seimo narė (2024–2028)' : 'Tikras Seimo narys (2024–2028)')}</span>}
          {c.leader && <span className="cx-chip px-2.5 py-1 text-sm"><Crown size={14} />{tt('Party leader', c.fem ? 'Partijos pirmininkė' : 'Partijos pirmininkas')}</span>}
          {!c.real && <span className="cx-chip px-2.5 py-1 text-sm t-muted"><Sparkles size={14} />{tt('Fictional candidate', c.fem ? 'Išgalvota kandidatė' : 'Išgalvotas kandidatas')}</span>}
          {c.star != null && <span className="cx-chip px-2.5 py-1 text-sm" style={{ color: SUN }}><Star size={14} />{tt('Star recruit', 'Žinomas veidas')}</span>}
        </div>
        <p className="text-sm font-semibold leading-relaxed">{bio}</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="cx-soft p-2.5"><div className="text-[11px] font-bold t-muted">{res ? tt('Result', 'Rezultatas') : tt('Projected', 'Prognozė')}</div><div className="cx-num text-xl">{res ? (won ? tt('Elected', 'Išrinktas') : tt('Lost', 'Pralaimėjo')) : `${fmtPct(row.s, 1)} · #${rank}`}</div></div>
          <div className="cx-soft p-2.5"><div className="text-[11px] font-bold t-muted">{tt('District', 'Apygarda')}</div><div className="font-bold text-sm leading-tight">{cnum(cid)}. {cnm(cid)}</div></div>
        </div>
        <div className="flex flex-col gap-2.5">
          <StatBar label={tt('Name recognition', 'Žinomumas')} v={c.fame} color="#60A5FA" hint={c.p === g.player && (c.ads || c.meet) ? tt(`Your investment: ${c.ads || 0} ad pushes, ${c.meet || 0} meetings`, `Jūsų investicijos: ${c.ads || 0} reklamos, ${c.meet || 0} susitikimai`) : null} />
          <StatBar label={tt('Charisma', 'Charizma')} v={c.cha} color="#F472B6" />
          <StatBar label={tt('Local ties', 'Vietos ryšiai')} v={c.roots} color="#34D399" />
          <StatBar label={tt('Experience', 'Patirtis')} v={c.exp} color={SUN} />
          {!c.real && <StatBar label={tt('Scandal risk', 'Skandalo rizika')} v={c.risk} color="#F87171" />}
          <div className="text-[11px] t-muted">{tt('Strength in this district:', 'Stiprumas šioje apygardoje:')} ×{nf(candQ(c), 2)}{c.inc ? tt(' (incumbent bonus)', ' (dabartinio nario premija)') : ''}</div>
        </div>
        {!c.real && (
          <div>
            <div className="cx-kicker text-xs mb-1.5">{tt('Priorities', 'Prioritetai')}</div>
            <div className="flex flex-wrap gap-1.5">{c.focus.map((k) => <span key={k} className="cx-chip px-2.5 py-1 text-sm">{L(FOCUS[k])}</span>)}</div>
          </div>
        )}
      </div>
    </Sheet>
  );
}
// Members of the current Seimas (elected 2024) and of the newly elected one.
const PARTY_FROM_2024 = (code) => code;
function currentSeimas() {
  const out = [];
  ALL_CIDS.forEach((cid) => { const inc = consById(cid)[6]; if (inc) out.push({ name: inc[0], p: inc[1], how: 'smd', cid, real: true, label: KITI_LABEL_2024[inc[0]] || null }); });
  Object.entries(LIST_2024).forEach(([p, names]) => names.forEach((n, i) => out.push({ name: n, p, how: 'list', no: i + 1, real: true })));
  return out;
}
function listNames(g, p, n, exclude) {
  const out = [];
  if (PARTIES[p] && !exclude.has(PARTIES[p].leader)) out.push({ name: PARTIES[p].leader, real: true, leader: true });
  (LIST_2024[p] || []).forEach((nm) => { if (!exclude.has(nm) && nm !== (PARTIES[p] || {}).leader) out.push({ name: nm, real: true }); });
  const rand = mulberry32(hashStr(`${g.seed}|list|${p}`));
  while (out.length < n) {
    const fem = rand() < 0.45;
    const nm = `${(fem ? FN_F : FN_M)[Math.floor(rand() * (fem ? FN_F.length : FN_M.length))]} ${fem ? femSurname(SURN[Math.floor(rand() * SURN.length)], rand() < 0.3) : SURN[Math.floor(rand() * SURN.length)]}`;
    if (!exclude.has(nm)) out.push({ name: nm, real: false });
  }
  return out.slice(0, n);
}
function newSeimas(g) {
  const E = g.election;
  const out = [];
  const smdNames = new Set();
  E.smd.forEach((e) => { const c = candOf(g, e.cid, e.winner); if (c) smdNames.add(c.name); out.push({ name: c ? c.name : partyShort(e.winner), p: e.winner === 'MINOR' ? 'KITI' : e.winner, how: 'smd', cid: e.cid, real: !!(c && c.real), cand: c }); });
  Object.entries(E.pr).forEach(([p, n]) => { listNames(g, p, n, smdNames).forEach((x, i) => out.push({ ...x, p, how: 'list', no: i + 1 })); });
  return out;
}
function MembersSheet({ g, kind, onClose }) {
  const nav = React.useContext(NavCtx);
  const members = useMemo(() => (kind === 'new' && g.election ? newSeimas(g) : currentSeimas()), [g, kind]);
  const [q, setQ] = useState('');
  const f = fold(q.trim());
  const byParty = {};
  members.filter((m) => !f || fold(`${m.name} ${partyShort(m.p)} ${m.cid ? cnm(m.cid) : ''}`).includes(f)).forEach((m) => { (byParty[m.p] = byParty[m.p] || []).push(m); });
  const order = Object.keys(byParty).sort((a, b) => byParty[b].length - byParty[a].length);
  const total = members.length;
  return (
    <Sheet label={kind === 'new' ? tt('The new Seimas', 'Naujasis Seimas') : tt('Current Seimas', 'Dabartinis Seimas')} onClose={onClose} z="z-50">
      <SheetHead kicker={kind === 'new' ? tt(`Elected in 2028 · ${total} members`, `Išrinktas 2028 m. · ${total} narių`) : tt('Elected in October 2024 · real members', 'Išrinktas 2024 m. spalį · tikri nariai')} title={kind === 'new' ? tt('The new Seimas', 'Naujasis Seimas') : tt('Current Seimas', 'Dabartinis Seimas')} onClose={onClose} />
      <div style={GUTTER} className="flex flex-col gap-3">
        {kind !== 'new' && <p className="text-xs t-muted">{tt('Members as elected in 2024, with the party they were elected for (source: Wikipedia). Later resignations and party switches are not shown.', 'Nariai pagal 2024 m. rinkimų rezultatus ir partiją, nuo kurios išrinkti (šaltinis: Vikipedija). Vėlesni pasitraukimai ir perėjimai į kitas partijas neparodyti.')}</p>}
        {kind === 'new' && <p className="text-xs t-muted">{tt('District winners are your game’s candidates. List seats go to the party leader, then to real 2024 list members of that party, then to fictional names.', 'Apygardose – žaidimo kandidatai. Sąrašo vietos atitenka partijos pirmininkui, tada tikriems tos partijos 2024 m. sąrašo nariams, o likusios – išgalvotiems vardams.')}</p>}
        <label className="flex items-center gap-2 rounded-xl px-3" style={{ background: 'rgba(255,255,255,.06)', border: `1px solid ${LINE2}`, minHeight: 44 }}>
          <Search size={16} className="t-muted shrink-0" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tt('Search a member or district…', 'Ieškoti nario ar apygardos…')} aria-label={tt('Search members', 'Ieškoti narių')} className="flex-1 bg-transparent outline-none text-sm font-semibold" style={{ color: TEXT, minWidth: 0 }} />
        </label>
        {order.map((p) => (
          <div key={p}>
            <div className="flex items-center gap-2 mb-1.5"><PartyDot p={p} size={12} /><span className="cx-title text-lg">{p === 'KITI' ? tt('Others & independents', 'Kiti ir nepriklausomi') : partyShort(p)}</span><span className="cx-num t-muted">{byParty[p].length}</span></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {byParty[p].map((m, i) => {
                const clickable = m.how === 'smd' && m.cid && candOf(g, m.cid, m.p);
                const Tag = clickable ? 'button' : 'div';
                return (
                  <Tag key={`${m.name}-${i}`} type={clickable ? 'button' : undefined} onClick={clickable ? () => nav.openCand(m.cid, m.p) : undefined} className={`${clickable ? 'cx-tap' : ''} flex items-center gap-2 rounded-lg px-2 py-1.5 text-left`} style={{ background: 'rgba(255,255,255,.04)', border: `1px solid ${LINE}` }}>
                    {m.how === 'smd' && m.cid && candOf(g, m.cid, m.p) ? <CandFace c={candOf(g, m.cid, m.p)} size={30} /> : <span className="grid place-items-center rounded-md shrink-0 text-[11px] font-black" style={{ width: 30, height: 30, background: tint((PARTIES[p] || PARTIES.KITI).color, 0.35) }}>{m.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>}
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold truncate">{m.name}{m.leader ? ' ★' : ''}</span>
                      <span className="block text-[11px] t-muted truncate">{m.how === 'smd' ? `${cnum(m.cid)}. ${cnm(m.cid)}` : tt(`List #${m.no}`, `Sąrašo Nr. ${m.no}`)}{m.real && kind === 'new' ? tt(' · real person', ' · tikras asmuo') : ''}</span>
                    </span>
                  </Tag>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Sheet>
  );
}
function SeimasMembersCard({ g }) {
  const nav = React.useContext(NavCtx);
  const cur = useMemo(() => currentSeimas(), []);
  const counts = {};
  cur.forEach((m) => { counts[m.p] = (counts[m.p] || 0) + 1; });
  const order = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  return (
    <Card className="p-4">
      <CardTitle sub={tt('The 141 real members elected in October 2024, by the party they were elected for.', '141 tikras Seimo narys, išrinktas 2024 m. spalį, pagal partiją, nuo kurios išrinktas.')}>{tt('Current Seimas', 'Dabartinis Seimas')}</CardTitle>
      <div className="flex flex-wrap gap-1.5 mb-3">{order.map((p) => <span key={p} className="cx-chip px-2 py-0.5 text-xs"><PartyDot p={p} size={9} />{p === 'KITI' ? tt('Others', 'Kiti') : partyShort(p)} {counts[p]}</span>)}</div>
      <Btn kind="white" className="h-12 w-full" onClick={() => nav.openMembers('current')}><Users size={18} />{tt('See all 141 members', 'Peržiūrėti visus 141 narį')}</Btn>
    </Card>
  );
}
function NewSeimasButton() {
  const nav = React.useContext(NavCtx);
  return <Btn kind="white" className="h-12 w-full" onClick={() => nav.openMembers('new')}><Users size={18} />{tt('The new Seimas: all 141 members', 'Naujasis Seimas: visi 141 narys')}</Btn>;
}
function HQTab({ g, act, openSheet, sub = 'media', setSub = () => {} }) {
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
    <div className="flex flex-col gap-4 pt-4 lg:grid lg:grid-cols-2 lg:items-start">
      <h2 className="cx-title text-4xl lg:col-span-2">{tt('Campaign HQ', 'Rinkimų štabas')}</h2>
      <SubTabs value={sub} onChange={setSub} items={HQ_SUBS()} label={tt('HQ sections', 'Štabo skiltys')} className="lg:col-span-2" />
      <div className="grid grid-cols-3 gap-2 lg:col-span-2">
        <div className={statCard} style={{ boxShadow: SHADOW }}>
          <div className="flex items-center justify-between"><Handshake size={20} /><InfoTip title={tt('Favours', 'Ryšiai')}>{tt('Favours are political connections. Earn them in debates and over coffee with rivals. After the vote, spend them to win coalition partners.', 'Ryšiai – tai politinės pažintys. Juos užsitarnaujate debatuose ir per kavą su varžovais. Po rinkimų jie padeda prisivilioti koalicijos partnerius.')}</InfoTip></div>
          <div className="cx-num text-2xl leading-none mt-1">{g.pc}</div>
          <div className="text-xs font-extrabold t-muted">{tt('Favours', 'Ryšiai')}</div>
        </div>
        <div className={statCard} style={{ boxShadow: SHADOW }}>
          <div className="flex items-center justify-between"><Flame size={20} style={{ color: '#EA580C' }} /><InfoTip title={tt('Buzz', 'Pagreitis')}>{tt('Buzz is how much people are talking about you. Positive buzz lifts your support everywhere; it fades a little every week.', 'Pagreitis rodo, kiek apie jus kalbama. Teigiamas pagreitis kelia palaikymą visur, bet kas savaitę šiek tiek blėsta.')}</InfoTip></div>
          <div className="cx-num text-2xl leading-none mt-1" style={{ color: mom >= 0.05 ? GREEN : mom <= -0.05 ? RED : INK }}>{fmtSigned(mom)}</div>
          <div className="text-xs font-extrabold t-muted">{tt('Buzz', 'Pagreitis')}</div>
        </div>
        <div className={statCard} style={{ boxShadow: SHADOW }}>
          <div className="flex items-center justify-between"><ShieldAlert size={20} style={{ color: g.scandal > 20 ? RED : INK }} /><InfoTip title={tt('Scandal risk', 'Skandalo rizika')}>{tt('The higher it is, the more likely journalists dig up a scandal at the start of a week. Shady deals and gambling raise it; it slowly falls on its own.', 'Kuo ji didesnė, tuo labiau tikėtina, kad savaitės pradžioje žurnalistai iškels skandalą. Abejotini sandoriai ir lošimai ją didina, savaime ji lėtai mažėja.')}</InfoTip></div>
          <div className="cx-num text-2xl leading-none mt-1">{Math.round(g.scandal)}{LANG === 'lt' ? ' %' : '%'}</div>
          <div className="text-xs font-extrabold t-muted">{tt('Scandal risk', 'Skandalo rizika')}</div>
        </div>
      </div>
      {sub === 'media' && (<>
      <AdsCard g={g} openSheet={openSheet} />
      <Card className="p-4">
        <CardTitle sub={tt('Moves that work across the whole country', 'Veiksmai visai šaliai')}>{tt('Big moves', 'Dideli žingsniai')}</CardTitle>
        <div className="flex flex-col gap-3">
          {NATIONAL_ACTIONS.filter((a) => a.group === 'nat').map((a) => (
            <MoveRow key={a.id} a={a} g={g} est={a.id === 'backchannel' ? tt('+Favours', '+Ryšiai') : a.id === 'presser' ? tt('+Buzz', '+Pagreitis') : a.id === 'kompro' ? tt('45% hit', '45 % sėkmė') : tt('All regions', 'Visi regionai')} onClick={() => (a.id === 'kompro' ? openSheet('kompro') : a.id === 'presser' ? openSheet('presser') : act((gg) => doNational(gg, a.id)))} />
          ))}
        </div>
      </Card>
      </>)}
      {sub === 'money' && (<>
      <Card className="p-4">
        <CardTitle sub={tt(`Donations last week: ${fmtEur(g.lastIncome || 0)}`, `Praėjusios savaitės aukos: ${fmtEur(g.lastIncome || 0)}`)}>{tt('Raise money', 'Pinigų rinkimas')}</CardTitle>
        <div className="flex flex-col gap-3">
          {NATIONAL_ACTIONS.filter((a) => a.group === 'fund').map((a) => <MoveRow key={a.id} a={a} g={g} est={`+${fmtEur(fundEst[a.id])}`} onClick={() => act((gg) => doNational(gg, a.id))} />)}
        </div>
      </Card>
      <section className="cx-card p-4" style={{ background: 'linear-gradient(180deg, rgba(229,72,77,.16), rgba(22,27,37,.97))', borderColor: 'rgba(229,72,77,.35)' }}>
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <h3 className="cx-title text-xl leading-tight inline-flex items-center gap-2"><Dices size={22} />{tt('Risky money', 'Rizikingi pinigai')}</h3>
            <p className="text-sm font-semibold mt-0.5" style={{ color: '#C7CCEB' }}>{tt('Gamble campaign cash. The house usually wins, and journalists are watching.', 'Rizikuokite kampanijos pinigais. Dažniausiai laimi kazino, o žurnalistai stebi.')}</p>
          </div>
          <span className="cx-chip px-2 py-0.5 text-xs shrink-0" style={{ background: BAD_BG, color: INK }}>{tt('Very risky', 'Labai rizikinga')}</span>
        </div>
        <div className="flex flex-col gap-3 mt-3">
          <button type="button" onClick={() => openSheet('casino')} disabled={!g.natActs.casino && g.ap < 1} className="cx-btn w-full justify-start gap-3 px-3 py-3 text-left" style={{ background: WARN_BG }}>
            <span className="grid place-items-center rounded-full shrink-0" style={{ width: 40, height: 40, background: '#E5484D', border: `1px solid ${LINE}`, color: '#fff' }}><Dices size={20} /></span>
            <span className="min-w-0 flex-1"><span className="block font-black">{tt('Casino night', 'Vakaras kazino')}</span><span className="block text-sm font-semibold" style={{ color: '#5B4A12' }}>{tt('Roulette in Vilnius Old Town. Up to 5 spins.', 'Ruletė Vilniaus senamiestyje. Iki 5 sukimų.')}</span></span>
            <span className="text-sm font-black shrink-0 inline-flex items-center gap-1">{g.natActs.casino ? tt('Open', 'Atidaryta') : <><Zap size={14} style={{ fill: INK }} />1</>}</span>
          </button>
          <button type="button" onClick={() => openSheet('bet')} disabled={g.ap < 1} className="cx-btn w-full justify-start gap-3 px-3 py-3 text-left" style={{ background: GOOD_BG }}>
            <span className="grid place-items-center rounded-full shrink-0" style={{ width: 40, height: 40, background: FLAG.g, border: `1px solid ${LINE}`, color: '#fff' }}><Ticket size={20} /></span>
            <span className="min-w-0 flex-1"><span className="block font-black">{tt('Bet on Žalgiris', 'Lažybos dėl „Žalgirio“')}</span><span className="block text-sm font-semibold" style={{ color: '#14532D' }}>{tt('Put money on tonight’s EuroLeague game.', 'Statykite už šio vakaro Eurolygos rungtynes.')}</span></span>
            <span className="text-sm font-black shrink-0 inline-flex items-center gap-1"><Zap size={14} style={{ fill: INK }} />1</span>
          </button>
          <div className="text-xs font-bold" style={{ color: '#C7CCEB' }}>{tt(`Each bet: 12% chance it leaks to the press. Gambling net so far: `, `Kiekvienas statymas: 12 % tikimybė, kad sužinos žiniasklaida. Lošimų balansas: `)}<span className="cx-num" style={{ color: g.stats.gambleNet >= 0 ? '#86EFAC' : '#FCA5A5' }}>{g.stats.gambleNet >= 0 ? '+' : '−'}{fmtEur(Math.abs(g.stats.gambleNet))}</span></div>
        </div>
      </section>
      <Card className="p-4">
        <CardTitle sub={tt('The Central Electoral Commission caps campaign spending.', 'Vyriausioji rinkimų komisija riboja kampanijos išlaidas.')} info={<InfoTip title={tt('VRK limit', 'VRK limitas')}>{tt('In Lithuania the VRK (Central Electoral Commission) limits how much a party may spend on its campaign. Go over and you get a fine plus a scandal.', 'Lietuvoje VRK (Vyriausioji rinkimų komisija) riboja, kiek partija gali išleisti kampanijai. Viršijus – bauda ir skandalas.')}</InfoTip>}>{tt('Spending limit', 'Išlaidų limitas')}</CardTitle>
        <Bar value={g.stats.spent} max={VRK_LIMIT} color={vrkPct > 1 ? '#F87171' : vrkPct > 0.85 ? SUN : '#4ADE80'} h={18} />
        <div className="flex justify-between text-sm font-extrabold mt-1.5"><span>{fmtEur(g.stats.spent)}</span><span className="t-muted">{tt('limit', 'limitas')} {fmtEur(VRK_LIMIT)}</span></div>
        {g.vrkHit && <p className="text-sm font-bold mt-1" style={{ color: RED }}>{tt('You already broke the limit and were fined.', 'Limitą jau viršijote ir gavote baudą.')}</p>}
      </Card>
      </>)}
      {sub === 'team' && (<>
      <StaffRoom g={g} act={act} />
      </>)}
      {sub === 'promises' && (<>
      <PromisesCard g={g} />
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
                      <button key={i} type="button" role="radio" aria-checked={isDraft} aria-label={L(st)} onClick={() => setDraft({ ...draft, [ax.id]: v })} className="h-11 rounded-xl grid place-items-center cx-tap" style={{ background: isDraft ? SUN : isNow ? ACC_BG : PANEL2, border: `1px solid ${LINE}` }}>
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
          <div className="mt-3 cx-cream rounded-2xl p-3 flex flex-col gap-2" style={{ border: `1px solid ${LINE}` }}>
            <div className="font-black">{tt('If you announce this:', 'Jei tai paskelbsite:')}</div>
            <div className="flex justify-between text-sm font-bold gap-2"><span>{tt('Your national poll', 'Jūsų reitingas')}</span><span className="cx-num">{fmtPct(preview.now)} → {fmtPct(preview.next)} <Delta v={preview.next - preview.now} /></span></div>
            <div className="flex justify-between text-sm font-bold gap-2"><span>{tt('Seats if the vote were today', 'Mandatai, jei rinkimai būtų šiandien')}</span><span className="cx-num">{preview.seatsNow} → {preview.seatsNext} <Delta v={preview.seatsNext - preview.seatsNow} d={0} /></span></div>
            <div className="flex justify-between text-sm font-bold gap-2"><span>{tt('Your core fans’ enthusiasm', 'Ištikimų rėmėjų entuziazmas')}</span><span className="cx-num" style={{ color: base < 0.95 ? RED : GREEN }}>{Math.round(base * 100)}{LANG === 'lt' ? ' %' : '%'}</span></div>
            <div className="flex flex-wrap gap-1.5">
              {preview.regs.slice(0, 3).filter((x) => x.d > 0.05).map((x) => <span key={x.r.id} className="cx-chip px-2 py-0.5 text-xs" style={{ background: GOOD_BG }}>{rs(x.r)} {fmtSigned(x.d)}</span>)}
              {preview.regs.slice(-3).filter((x) => x.d < -0.05).map((x) => <span key={x.r.id} className="cx-chip px-2 py-0.5 text-xs" style={{ background: BAD_BG }}>{rs(x.r)} {fmtSigned(x.d)}</span>)}
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
      </>)}
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
        <button key={s} type="button" role="radio" aria-checked={stake === s} disabled={money < s} onClick={() => setStake(s)} className="cx-btn h-12 text-base" style={{ background: stake === s ? SUN : PANEL2, color: INK, boxShadow: SHADOW }}>{LANG === 'lt' ? `${s}k €` : `€${s}k`}</button>
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
        <div className="flex items-center gap-3">
          <Portrait who="croupier" size={56} mood={spinning ? 'wow' : 'happy'} />
          <div className="rounded-2xl px-3 py-2 font-extrabold text-sm" style={{ background: PANEL3, border: '2.5px solid #4B5288' }}>{tt('“Faites vos jeux! Place your bets, please.”', '„Faites vos jeux! Statykite, prašom.“')}</div>
        </div>
        <div className="rounded-2xl p-3 text-sm font-bold flex gap-2" style={{ background: BAD_BG, border: `2.5px solid #E5484D` }}>
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
        <div className="flex items-center gap-3">
          <Portrait who="bookie" size={56} mood={res ? (res.win ? 'sad' : 'grin') : 'happy'} />
          <div className="rounded-2xl px-3 py-2 font-extrabold text-sm" style={{ background: PANEL3, border: '2.5px solid #4B5288' }}>{tt('“Žalgiris at home? Safe as houses, friend.”', '„Žalgiris namuose? Tikri pinigai, drauguži.“')}</div>
        </div>
        {!res ? (
          <>
            <div className="rounded-2xl p-3 text-sm font-bold flex gap-2" style={{ background: BAD_BG, border: '2.5px solid #E5484D' }}>
              <AlertTriangle size={18} className="shrink-0" style={{ color: '#FCA5A5' }} />
              <span>{tt('Betting party money is a terrible idea. 12% chance the slip leaks.', 'Statyti partijos pinigus – bloga mintis. 12 % tikimybė, kad kvitas nutekės.')}</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-sm font-extrabold" style={{ color: '#C7CCEB' }}>{tt('Stake', 'Statymas')} · {tt('you have', 'turite')} {fmtEur(g.money)}</div>
              <StakePicker stake={stake} setStake={setStake} money={g.money} />
            </div>
            <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-label={tt('Your bet', 'Jūsų statymas')}>
              {[['win', tt('Žalgiris wins', '„Žalgiris“ laimės'), '×1.85'], ['big', tt('Žalgiris wins by 12+ points', '„Žalgiris“ laimės 12+ taškų'), '×4.5']].map(([v, l, o]) => (
                <button key={v} type="button" role="radio" aria-checked={pick === v} onClick={() => setPick(v)} className="cx-btn h-14 justify-between px-4" style={{ background: pick === v ? SUN : PANEL2, color: INK }}>
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
        <div className="flex items-center gap-3">
          <Portrait who="detective" size={56} mood="ok" />
          <div className="cx-soft px-3 py-2 font-extrabold text-sm">{tt('“Everyone has a skeleton somewhere. Who are we looking at?”', '„Kiekvienas turi griaučių spintoje. Ką tikriname?“')}</div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[['45%', tt('Dirt found', 'Rasta'), GOOD_BG], ['35%', tt('Nothing', 'Nieko'), LINE], ['20%', tt('You get caught', 'Įkliūsite'), BAD_BG]].map(([v, l, c]) => (
            <div key={l} className="rounded-2xl p-2" style={{ background: c, border: `1px solid ${LINE}` }}><div className="cx-num text-xl">{LANG === 'lt' ? v.replace('%', ' %') : v}</div><div className="text-xs font-extrabold">{l}</div></div>
          ))}
        </div>
        <div className="text-sm font-extrabold t-muted">{tt('Pick a target', 'Pasirinkite taikinį')}</div>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={tt('Target party', 'Partija')}>
          {rivals.map((q) => (
            <button key={q} type="button" role="radio" aria-checked={target === q} onClick={() => setTarget(q)} className="cx-btn justify-start gap-2 px-2 py-2 min-w-0" style={{ background: target === q ? ACC_BG : PANEL2, boxShadow: SHADOW }}>
              <Portrait who={q} size={38} mood={target === q ? 'wow' : 'ok'} />
              <span className="text-left min-w-0"><span className="block font-black text-sm truncate">{partyShort(q)}</span><span className="block text-xs font-bold t-muted truncate">{leaderSurname(q)}</span></span>
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
function NewsTab({ g, wide }) {
  let lastWeek = null;
  return (
    <div className="pt-4 flex flex-col gap-4 lg:grid lg:items-start" style={{ gridTemplateColumns: wide ? 'minmax(0, 1fr) minmax(0, 1fr)' : undefined }}>
    <div className="flex flex-col gap-3 lg:order-1">
      <h2 className="cx-title text-4xl">{tt('News', 'Naujienos')}</h2>
      {!wide && <SocialFeed g={g} limit={4} compact />}
      {g.news.map((n) => {
        const v = newsView(g, n);
        const Icon = v.icon;
        const header = n.week !== lastWeek ? <div key={`w${n.week}-${n.id}`} className="cx-title text-lg pt-1">{tt(`Week ${n.week}`, `${n.week} savaitė`)}</div> : null;
        lastWeek = n.week;
        return (
          <React.Fragment key={n.id}>
            {header}
            <article className="cx-card flex gap-3 p-3" style={{ boxShadow: SHADOW }}>
              <span className="grid place-items-center rounded-full shrink-0" style={{ width: 40, height: 40, background: v.p ? PARTIES[v.p].color : ACC_BG, border: `1px solid ${LINE}`, color: v.p ? '#fff' : INK }}><Icon size={19} strokeWidth={2.5} /></span>
              <div className="min-w-0">
                <div className="font-black leading-tight">{v.title}</div>
                <div className="text-sm font-semibold t-muted leading-snug mt-0.5">{v.text}</div>
              </div>
            </article>
          </React.Fragment>
        );
      })}
    </div>
    {wide && <div className="lg:order-2 pt-1" style={{ position: 'sticky', top: 118 }}><SocialFeed g={g} limit={9} /></div>}
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
    [Vote, WARN_BG, tt('Win seats on election night', 'Laimėkite mandatus rinkimų naktį'), tt('70 seats come from the national vote, 71 from local winners.', '70 vietų paskirstoma pagal balsus visoje šalyje, 71 tenka apygardų nugalėtojams.')],
    [Handshake, '#86EFAC', tt('Team up to reach 71', 'Surinkite 71 su partneriais'), tt('Most winners need partners. Make friends with the right parties.', 'Daugumai nugalėtojų reikia partnerių. Susidraugaukite su tinkamomis partijomis.')],
  ];
  return (
    <Sheet label={tt('Welcome', 'Sveiki')}>
      <div style={GUTTER} className="pt-6 flex flex-col gap-4">
        <Scene kind="seimas" h={104} caption={false}>
          <div className="absolute right-3 bottom-2 flex items-end gap-1"><Portrait who={p} size={52} badge /></div>
        </Scene>
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
              <span className="grid place-items-center rounded-full shrink-0" style={{ width: 40, height: 40, background: bgc, border: `1px solid ${LINE}` }}><Icon size={19} strokeWidth={2.5} /></span>
              <div><div className="font-black">{i + 1}. {t}</div><div className="text-sm font-semibold t-muted">{d}</div></div>
            </div>
          ))}
        </div>
        <div className="cx-card cx-cream p-3" style={{ boxShadow: SHADOW }}>
          <div className="font-black">{tt('Your party’s superpower', 'Jūsų partijos supergalia')}</div>
          <div className="text-sm font-semibold mt-0.5">{L(P.perk)}</div>
        </div>
        <Btn className="h-14 text-lg" onClick={onStart}>{tt('Show me how', 'Parodyk, kaip')} <ArrowRight size={20} /></Btn>
        <Btn kind="white" className="h-12" onClick={onSkip}>{tt('I know how to play', 'Moku žaisti')}</Btn>
      </div>
    </Sheet>
  );
}
const moe = (pct, n) => 1.96 * Math.sqrt((pct / 100) * (1 - pct / 100) / n) * 100;
function ReportModal({ g, item, onClose }) {
  const p = g.player;
  const H = g.history;
  const cur = H[H.length - 1].shares;
  const prev = H[H.length - 2] ? H[H.length - 2].shares : cur;
  const d = cur[p] - prev[p];
  const upcoming = g.queue.slice(1).map((x) => x.type);
  const attacks = item.moves.flatMap((m) => m.list.filter((x) => x.type === 'attack' && x.target === p).map((x) => ({ p: m.p, rid: x.rid })));
  const riser = PARTY_IDS.filter((q) => q !== p).map((q) => ({ q, d: cur[q] - prev[q] })).sort((a, b) => b.d - a.d)[0];
  const [intro, setIntro] = useState(true);
  if (intro) return <WeekIntro g={g} item={item} onDone={() => setIntro(false)} />;
  return (
    <Sheet label={tt(`Week ${item.week} recap`, `${item.week} savaitės apžvalga`)}>
      <div style={GUTTER} className="pt-6 flex flex-col gap-4">
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${LINE2}` }}>
          <div className="flex items-center gap-2 px-3 py-2" style={{ background: '#B91C1C' }}>
            <span className="grid place-items-center rounded-sm font-black" style={{ width: 24, height: 19, background: '#fff', color: '#B91C1C', fontSize: 12 }}>NŽ</span>
            <span className="cx-title text-lg text-white leading-none">{tt('NATIONAL NEWS', 'NACIONALINĖS ŽINIOS')}</span>
            <span className="ml-auto text-xs font-semibold" style={{ color: 'rgba(255,255,255,.85)' }}>{fmtDay(weekStartDate(item.week))}</span>
          </div>
          <div className="cx-bar px-3 py-3"><div className="cx-title text-3xl leading-none">{tt(`Week ${item.week} is over!`, `${item.week} savaitė baigėsi!`)}</div></div>
        </div>
        <div className="cx-card p-4 flex items-center gap-4" style={{ background: d >= 0 ? GOOD_BG : BAD_BG }}>
          <Portrait who={p} size={58} mood={d >= 0.3 ? 'grin' : d >= 0 ? 'happy' : d > -0.5 ? 'ok' : 'sad'} />
          <div>
            <div className="text-sm font-extrabold t-muted">{tt(`New poll for ${partyShort(p)}`, `Nauja ${partyShort(p)} apklausa`)}</div>
            <div className="cx-num text-4xl leading-none">{fmtPct(cur[p])} <span className="text-xl"><Delta v={d} /></span></div>
            {H[H.length - 1].pol != null && <div className="text-xs font-bold t-muted mt-1">{POLLSTERS[H[H.length - 1].pol].name} · n={POLLSTERS[H[H.length - 1].pol].n} · ±{nf(moe(cur[p], POLLSTERS[H[H.length - 1].pol].n))} {tt('pts', 'proc. p.')}</div>}
          </div>
        </div>
        <ConsList items={item.cons} title={tt('What your choices led to', 'Jūsų sprendimų pasekmės')} />
        <div className="cx-soft p-3 flex flex-col gap-2 text-sm font-semibold">
          <div className="font-black text-base">{tt('Meanwhile…', 'Tuo metu…')}</div>
          {riser && riser.d > 0.1 && <div className="flex gap-2 items-center"><Portrait who={riser.q} size={34} mood="grin" />{tt(`${partyShort(riser.q)} gained the most this week (${fmtSignedPct(riser.d)}).`, `Daugiausia šią savaitę paaugo ${partyShort(riser.q)} (${fmtSignedPct(riser.d)}).`)}</div>}
          {attacks.length > 0
            ? <div className="flex gap-2 items-center"><FaceRow ids={[...new Set(attacks.map((a) => a.p))].slice(0, 3)} size={34} /><span>{tt('Attack ads against you:', 'Puolimai prieš jus:')} {attacks.map((a) => `${partyShort(a.p)} (${rs(a.rid)})`).join(', ')}.{g.advisor !== false ? tt(' Door-knocking protects you from these.', ' Nuo jų apsaugo agitacija nuo durų iki durų.') : ''}</span></div>
            : <div className="flex gap-2 items-start"><Shield size={16} className="shrink-0 mt-0.5" />{tt('No rival attacked you this week.', 'Šią savaitę jūsų niekas nepuolė.')}</div>}
          <div className="flex gap-2 items-start"><Wallet size={16} className="shrink-0 mt-0.5" style={{ color: GREEN }} />{tt(`Supporters donated ${fmtEur(g.lastIncome)}.`, `Rėmėjai paaukojo ${fmtEur(g.lastIncome)}.`)}</div>
        </div>
        <div className="cx-card cx-cream p-3 flex items-center gap-3" style={{ boxShadow: SHADOW }}>
          {upcoming.includes('debate') ? <Tv size={26} /> : upcoming.includes('event') ? <Newspaper size={26} /> : <Sparkles size={26} />}
          <div className="font-black">{upcoming.includes('debate') ? tt('Coming up: a live LRT debate!', 'Netrukus – tiesioginiai LRT debatai!') : upcoming.includes('event') ? tt('Coming up: breaking news!', 'Netrukus – skubi naujiena!') : tt('A quiet start to the week.', 'Rami savaitės pradžia.')}</div>
        </div>
        {g.tut === 5 && <Coach title={tt('You’ve got the hang of it!', 'Jau perpratote!')}>{tt('Every week: spend your energy, then tap Next week. Polls change, rivals campaign and news breaks. LRT debates come in weeks 4, 8 and 11. The rest is up to you!', 'Kas savaitę: išleiskite energiją ir spauskite „Kita savaitė“. Keičiasi apklausos, varžovai agituoja, pasirodo naujienos. LRT debatai – 4, 8 ir 11 savaitėmis. Toliau – jūsų sprendimai!')}</Coach>}
        <Btn className="h-14 text-lg" onClick={onClose}>{tt(`Start week ${g.week}`, `Pradėti ${g.week} savaitę`)} <ArrowRight size={20} /></Btn>
      </div>
    </Sheet>
  );
}
function ConsList({ items, title }) {
  if (!items || !items.length) return null;
  const look = { bad: [AlertTriangle, BAD_BG, RED], warn: [Clock, WARN_BG, AMBER], good: [Check, GOOD_BG, GREEN] };
  return (
    <div className="flex flex-col gap-1.5">
      {title && <div className="font-black">{title}</div>}
      {items.map((c, i) => {
        const [Icon, bg, fg] = look[c.tone] || look.warn;
        return (
          <div key={i} className="rounded-2xl px-3 py-2 text-sm font-bold flex gap-2 items-start sbl-fade" style={{ background: bg, border: `1px solid ${LINE}` }}>
            <Icon size={17} className="shrink-0 mt-0.5" style={{ color: fg }} strokeWidth={2.6} />
            <span>{L(c.text)}</span>
          </div>
        );
      })}
    </div>
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
  if (before.cred != null && after.cred != null) cells.push([tt('Reputation', 'Reputacija'), <Delta key="e" v={after.cred - before.cred} d={0} />]);
  return <div className="grid grid-cols-2 gap-2">{cells.map(([l, v], i) => <div key={l} className="cx-soft p-3" style={i === 4 ? { gridColumn: '1 / -1' } : undefined}><div className="text-xs font-extrabold t-muted">{l}</div><div className="cx-num text-xl">{v}</div></div>)}</div>;
}
function EventModal({ g, item, onChoose, onClose }) {
  const ev = EVENT_MAP[item.id];
  const done = item.done;
  const Icon = ev.icon;
  return (
    <Sheet label={tt('Breaking news', 'Skubi naujiena')}>
      <Scene kind={ev.scene || 'town'} h={null} caption={false} flush kb className="h-[230px] lg:h-[310px]">
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span className={`cx-chip px-3 py-1 text-xs text-white ${done ? '' : 'sbl-blink'}`} style={{ background: '#DC2626', borderColor: 'transparent' }}>{ev.scandal ? tt('SCANDAL!', 'SKANDALAS!') : tt('BREAKING NEWS', 'SKUBI NAUJIENA')}</span>
          <span className="cx-chip px-2.5 py-1 text-xs" style={{ background: 'rgba(7,9,13,.78)' }}><Icon size={13} strokeWidth={2.6} />{L(ev.cat)}</span>
        </div>
        <div className="absolute right-3 top-3 flex gap-2">{item.rv && <Portrait who={item.rv} size={62} square mood="sad" />}<Portrait who="anchor" size={62} square mood={ev.scandal || item.rv ? 'wow' : 'ok'} /></div>
        <div className="absolute left-0 bottom-0 cx-bar px-4 py-3 lg:px-6" style={{ maxWidth: '94%', borderTopRightRadius: 10 }}>
          <h2 className="cx-title text-2xl lg:text-3xl leading-tight">{evFill(L(ev.title), item)}</h2>
        </div>
      </Scene>
      <div style={GUTTER} className="pt-4 flex flex-col gap-4 lg:px-8">
        <p className="font-medium leading-relaxed text-[15px] lg:text-base" style={{ color: '#D5DBE5' }}>{evFill(L(ev.body), item)}</p>
        {!done ? (
          <div className="flex flex-col gap-3">
            <div className="cx-kicker text-sm">{tt('What do you say?', 'Ką atsakysite?')}</div>
            {ev.choices.map((ch, i) => (
              <button key={i} type="button" onClick={() => onChoose(i)} className="cx-btn cx-quote w-full items-center text-left px-4 py-3" style={{ gap: 12, minHeight: 58, justifyContent: 'flex-start' }}>
                <span className="cx-num grid place-items-center rounded-full shrink-0" style={{ width: 28, height: 28, background: '#11141B', color: '#fff' }}>{String.fromCharCode(65 + i)}</span>
                <span className="font-black text-base flex-1">{evFill(L(ch.label), item)}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 sbl-fade">
            <div className="cx-soft p-3 font-bold">{tt('You chose:', 'Jūsų sprendimas:')} <span className="font-black">{evFill(L(ev.choices[done.ci].label), item)}</span>{done.note && <div className="mt-1" style={{ color: AMBER }}>{L(done.note)}</div>}</div>
            <OutcomeGrid before={done.before} after={done.after} />
            <ConsList items={done.cons} />
            <Btn className="h-14 text-lg" onClick={onClose}>{tt('Back to the campaign', 'Atgal į kampaniją')} <ArrowRight size={20} /></Btn>
          </div>
        )}
      </div>
    </Sheet>
  );
}
function EncounterModal({ g, item, onChoose, onClose }) {
  const enc = ENC_MAP[item.id];
  const done = item.done;
  const G = GROUPS.find((x) => x.id === enc.who);
  const q1 = tt('“', '„'), q2 = tt('”', '“');
  const mood = done ? (done.after.share - done.before.share >= 0.01 || (done.after.cred || 0) > (done.before.cred || 0) ? 'happy' : 'grr') : 'ok';
  return (
    <Sheet label={tt('A voter stops you', 'Jus sustabdo rinkėjas')}>
      <Scene kind={REGION_SCENE[item.rid] || 'town'} h={null} caption={false} flush kb className="h-[230px] lg:h-[300px]">
        <span className="absolute left-3 top-3 cx-chip px-2.5 py-1 text-xs" style={{ background: 'rgba(7,9,13,.78)' }}><MessageCircle size={13} />{rl(item.rid)}{G ? ` · ${L(G.name)}` : ''}</span>
        <div className="absolute right-4 bottom-4"><Portrait who={enc.who} size={110} square mood={mood} title={G ? L(G.name) : ''} /></div>
        <div className="absolute left-0 bottom-0 cx-bar px-4 py-3" style={{ maxWidth: '64%', borderTopRightRadius: 10 }}>
          <div className="cx-kicker text-xs">{tt('A voter stops you', 'Jus sustabdo rinkėjas')}</div>
          <p className="cx-title text-xl lg:text-2xl leading-snug mt-0.5">{q1}{L(enc.q)}{q2}</p>
        </div>
      </Scene>
      <div style={GUTTER} className="pt-4 flex flex-col gap-4 lg:px-8">
        {!done ? (
          <div className="flex flex-col gap-3">
            {enc.answers.map((a, i) => (
              <button key={i} type="button" onClick={() => onChoose(i)} className="cx-btn cx-quote w-full items-center text-left px-4 py-3" style={{ gap: 12, minHeight: 58, justifyContent: 'flex-start' }}>
                <span className="cx-num grid place-items-center rounded-full shrink-0" style={{ width: 28, height: 28, background: '#11141B', color: '#fff' }}>{String.fromCharCode(65 + i)}</span>
                <span className="font-black text-base flex-1">{L(a.t)}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 sbl-fade">
            <div className="cx-soft p-3 font-bold">{tt('You said:', 'Jūs atsakėte:')} <span className="font-black">{L(enc.answers[done.ci].t)}</span><div className="mt-1 font-black" style={{ color: '#C4B5FD' }}>{L(done.note)}</div></div>
            <OutcomeGrid before={done.before} after={done.after} />
            <ConsList items={done.cons} />
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
/* ============================================================
   Immersion: sound effects, typewriter, count-ups, debate broadcast, week intro
   ============================================================ */
const REDUCED = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
// Tiny synthesised sound effects (no audio files). Muted state is remembered per browser.
const SFX = (() => {
  let ctx = null;
  let on = true;
  try { on = window.localStorage.getItem('seimas-bfl-sfx') !== '0'; } catch (e) { /* default on */ }
  const ac = () => {
    try {
      if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch (e) { return null; }
  };
  const tone = (c, f, t0, d, type = 'sine', v = 0.06, f2) => {
    const o = c.createOscillator();
    const gn = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
    gn.gain.setValueAtTime(0.0001, t0);
    gn.gain.exponentialRampToValueAtTime(v, t0 + 0.015);
    gn.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(gn).connect(c.destination);
    o.start(t0);
    o.stop(t0 + d + 0.05);
  };
  const noise = (c, t0, d, v, freq, q = 0.8, type = 'bandpass') => {
    const len = Math.floor(c.sampleRate * d);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    const gn = c.createGain();
    gn.gain.setValueAtTime(0.0001, t0);
    gn.gain.exponentialRampToValueAtTime(v, t0 + d * 0.2);
    gn.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    src.connect(f).connect(gn).connect(c.destination);
    src.start(t0);
    src.stop(t0 + d);
  };
  const play = (name) => {
    if (!on) return;
    const c = ac();
    if (!c) return;
    const t = c.currentTime + 0.01;
    try {
      switch (name) {
        case 'tap': tone(c, 520, t, 0.07, 'triangle', 0.035, 760); break;
        case 'bad': tone(c, 220, t, 0.2, 'sawtooth', 0.025, 140); break;
        case 'sting': tone(c, 392, t, 0.16, 'square', 0.03); tone(c, 523, t + 0.14, 0.16, 'square', 0.03); tone(c, 784, t + 0.28, 0.45, 'square', 0.03); break;
        case 'whoosh': noise(c, t, 0.7, 0.1, 900, 0.6); break;
        case 'applause': for (let i = 0; i < 5; i++) noise(c, t + i * 0.16, 0.9, 0.07, 2000 + Math.random() * 900, 0.5); break;
        case 'boo': noise(c, t, 1.1, 0.07, 260, 1.2, 'lowpass'); tone(c, 130, t, 1.0, 'sawtooth', 0.018, 95); break;
        case 'win': [523, 659, 784, 1046].forEach((f, i) => tone(c, f, t + i * 0.11, 0.38, 'triangle', 0.045)); break;
        case 'lose': [392, 349, 311].forEach((f, i) => tone(c, f, t + i * 0.16, 0.4, 'triangle', 0.04)); break;
        case 'pop': tone(c, 880, t, 0.09, 'sine', 0.05, 1320); break;
        case 'gavel': noise(c, t, 0.12, 0.2, 400, 2, 'lowpass'); noise(c, t + 0.22, 0.12, 0.2, 400, 2, 'lowpass'); break;
        default: break;
      }
    } catch (e) { /* audio unavailable */ }
  };
  // Browsers only allow audio after a user gesture: unlock on the first tap.
  try { window.addEventListener('pointerdown', () => { if (on) ac(); }, { once: true }); } catch (e) { /* no window */ }
  return { play, isOn: () => on, set: (v) => { on = v; try { window.localStorage.setItem('seimas-bfl-sfx', v ? '1' : '0'); } catch (e) { /* storage unavailable */ } } };
})();
function SoundToggle({ size = 38 }) {
  const [on, setOn] = useState(SFX.isOn());
  return (
    <button type="button" onClick={() => { SFX.set(!on); setOn(!on); if (!on) SFX.play('pop'); }} aria-pressed={on} aria-label={on ? tt('Mute sound', 'Išjungti garsą') : tt('Turn sound on', 'Įjungti garsą')} className="cx-btn shrink-0" style={{ width: size, height: size, borderRadius: 999, background: 'rgba(255,255,255,.07)' }}>
      {on ? <Volume2 size={18} /> : <VolumeX size={18} />}
    </button>
  );
}
function useTypewriter(text, speed = 18, run = true) {
  const [st, setSt] = useState(() => ({ text, n: REDUCED() ? text.length : 0 }));
  const cur = st.text === text ? st.n : (REDUCED() ? text.length : 0);
  if (st.text !== text) setSt({ text, n: cur });
  useEffect(() => {
    if (!run || cur >= text.length) return undefined;
    const id = setTimeout(() => setSt((s) => (s.text === text ? { text, n: Math.min(text.length, s.n + 2) } : s)), speed);
    return () => clearTimeout(id);
  }, [cur, text, run, speed]);
  return [text.slice(0, cur), cur >= text.length, () => setSt({ text, n: text.length })];
}
function CountUp({ to, from, fmt = (v) => String(Math.round(v)), dur = 750 }) {
  const start = from == null ? to : from;
  const [v, setV] = useState(start);
  const last = useRef(start);
  useEffect(() => {
    const a = last.current, b = to;
    if (a === b || REDUCED()) { setV(b); last.current = b; return undefined; }
    const t0 = performance.now();
    let raf;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setV(a + (b - a) * e);
      if (k < 1) raf = requestAnimationFrame(step); else last.current = b;
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); last.current = b; };
  }, [to]);
  return <>{fmt(v)}</>;
}
function Worm({ data, w = 240, h = 64 }) {
  const last = data[data.length - 1];
  const pts = data.map((v, i) => `${((i / Math.max(1, data.length - 1)) * w).toFixed(1)},${(h - (v / 10) * h).toFixed(1)}`).join(' ');
  const c = last >= 6 ? '#4ADE80' : last >= 5 ? SUN : '#F87171';
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block', height: h }} aria-hidden="true">
      <line x1="0" x2={w} y1={h / 2} y2={h / 2} stroke="rgba(255,255,255,.22)" strokeDasharray="3 5" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={c} opacity="0.12" />
      <polyline points={pts} fill="none" stroke={c} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
function StageBeams() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {[18, 50, 82].map((x, i) => (
        <div key={x} className="absolute top-[-10%] cx-beam" style={{ left: `${x - 14}%`, width: '28%', height: '120%', animationDelay: `${i * -2.3}s`, background: 'linear-gradient(180deg, rgba(255,236,190,.20), rgba(255,236,190,0) 85%)', clipPath: 'polygon(44% 0, 56% 0, 100% 100%, 0 100%)' }} />
      ))}
    </div>
  );
}
function CrowdBurst({ burst }) {
  if (!burst) return null;
  const Icon = burst.good ? ThumbsUp : ThumbsDown;
  return (
    <div className="absolute inset-x-0 bottom-0 h-full pointer-events-none overflow-hidden" aria-hidden="true">
      {Array.from({ length: 16 }).map((_, i) => (
        <span key={`${burst.n}-${i}`} className="absolute cx-rise" style={{ left: `${6 + ((i * 37) % 88)}%`, bottom: '6%', animationDelay: `${(i % 8) * 0.12}s` }}>
          {i % 3 === 0 ? <Heart size={20} color={burst.good ? '#F472B6' : '#64748B'} fill={burst.good ? '#F472B6' : 'none'} /> : <Icon size={22} color={burst.good ? '#4ADE80' : '#F87171'} />}
        </span>
      ))}
    </div>
  );
}
function DebateBroadcast({ g, item, onFinish, onClose }) {
  const D = DEBATES[item.id];
  const res = item.done;
  const me = g.player;
  const [phase, setPhase] = useState(res ? 'results' : 'intro');
  const [qi, setQi] = useState(0);
  const [picks, setPicks] = useState([]);
  const [reveal, setReveal] = useState(null);
  const [meter, setMeter] = useState(5);
  const [worm, setWorm] = useState([5, 5]);
  const [burst, setBurst] = useState(null);
  const qs = (g.debateQs && g.debateQs[item.id]) || D.questions.map((_, i) => i).slice(0, 3);
  const rivalsOnStage = useMemo(() => { const n = nationalShares(g); return PARTY_IDS.filter((q) => q !== me).sort((a, b) => n[b] - n[a]).slice(0, 4); }, []);
  const clashIdx = useMemo(() => ((g.cred == null ? 65 : g.cred) < 55 ? 2 : Math.floor(Math.random() * 2)), []);
  const steps = useMemo(() => { const base = qs.map((i) => ({ qi: i })); return [...base.slice(0, 2), { clash: clashIdx }, ...base.slice(2)]; }, [qs.join(','), clashIdx]);
  const st = steps[Math.min(qi, steps.length - 1)];
  const attacker = rivalsOnStage[0];
  const Q = st.clash != null ? CLASHES[st.clash] : D.questions[st.qi];
  const qText = st.clash != null ? L(Q.q).replace('{R}', tt(`The ${partyShort(attacker)} leader`, `${partyShort(attacker)} lyderis`)) : L(Q.q);
  const stage = [me, ...rivalsOnStage];
  const rivalReply = useMemo(() => {
    if (!reveal) return null;
    const q = st.clash != null ? attacker : rivalsOnStage[qi % rivalsOnStage.length];
    const opts = Q.answers.map((a, i) => ({ a, i, s: a.base + ((STYLE_BONUS[q] || {})[a.style] || 0) + Math.random() * 1.2 })).filter((x) => x.i !== reveal.ai).sort((a, b) => b.s - a.s);
    const best = opts[0];
    return { q, text: L(best.a.t), score: clamp(best.s * 0.85 + 0.5, 2, 9.4) };
  }, [reveal, qi]);
  const speakText = reveal ? L(Q.answers[reveal.ai].t) : '';
  const [askTyped, askDone, finishAsk] = useTypewriter(qText, 16, phase === 'ask');
  const [meTyped, meDone, finishMe] = useTypewriter(speakText, 16, phase === 'speak');
  const [rvTyped, rvDone, finishRv] = useTypewriter(rivalReply ? rivalReply.text : '', 16, phase === 'rival');
  // Intro card, then the first question.
  useEffect(() => {
    if (phase !== 'intro') return undefined;
    SFX.play('sting');
    const t = setTimeout(() => setPhase('ask'), REDUCED() ? 100 : 2800);
    return () => clearTimeout(t);
  }, [phase]);
  // After your answer has been spoken, hand over to a rival.
  useEffect(() => {
    if (phase === 'speak' && meDone) { const t = setTimeout(() => setPhase('rival'), REDUCED() ? 50 : 1100); return () => clearTimeout(t); }
    return undefined;
  }, [phase, meDone]);
  // The audience "worm" drifts towards the reaction to whoever is speaking.
  useEffect(() => {
    if (phase !== 'speak' && phase !== 'rival') return undefined;
    const target = phase === 'speak' ? meter : (meter * 0.6 + (10 - (rivalReply ? rivalReply.score : 5)) * 0.4);
    const id = setInterval(() => setWorm((w) => {
      const lastV = w[w.length - 1];
      const nv = clamp(lastV + (target - lastV) * 0.22 + (Math.random() - 0.5) * 0.8, 0, 10);
      return [...w, nv].slice(-48);
    }), 110);
    return () => clearInterval(id);
  }, [phase, meter, rivalReply]);
  useEffect(() => { if (res) { setPhase('results'); SFX.play(res.won ? 'win' : res.avg > 6 ? 'applause' : 'lose'); } }, [!!res]);
  const choose = (ai) => {
    if (reveal) return;
    const sc = scoreAnswer(g, Q.answers[ai]);
    setMeter(sc.score);
    setReveal({ ai, ...sc });
    setPicks([...picks, { qi: st.qi != null ? st.qi : -1, clash: st.clash, ai, score: sc.score }]);
    setPhase('speak');
    setBurst({ good: sc.score >= 5.6, n: Date.now() });
    SFX.play(sc.score >= 5.6 ? 'applause' : 'boo');
  };
  const next = () => {
    if (qi < steps.length - 1) { setQi(qi + 1); setReveal(null); setBurst(null); setPhase('ask'); SFX.play('tap'); }
    else onFinish(picks);
  };
  const skipTyping = () => {
    if (phase === 'intro') setPhase('ask');
    else if (phase === 'ask') finishAsk();
    else if (phase === 'speak') finishMe();
    else if (phase === 'rival') finishRv();
  };
  const speaker = phase === 'ask' ? (st.clash != null ? attacker : 'host') : phase === 'speak' ? me : phase === 'rival' && rivalReply ? rivalReply.q : null;
  const chyron = phase === 'ask'
    ? { who: st.clash != null ? attacker : 'host', label: st.clash != null ? tt(`ATTACK! · ${PARTIES[attacker].leader}`, `KIRTIS! · ${PARTIES[attacker].leader}`) : tt('LRT host', 'LRT laidos vedėjas'), text: askTyped, done: askDone, accent: st.clash != null ? '#DC2626' : '#0B5CAD' }
    : phase === 'speak' ? { who: me, label: `${PARTIES[me].leader} · ${partyShort(me)}`, text: meTyped, done: meDone, accent: PARTIES[me].color }
      : phase === 'rival' && rivalReply ? { who: rivalReply.q, label: `${PARTIES[rivalReply.q].leader} · ${partyShort(rivalReply.q)}`, text: rvTyped, done: rvDone, accent: PARTIES[rivalReply.q].color } : null;
  const mins = 5 + qi * 9 + (phase === 'speak' ? 3 : phase === 'rival' ? 5 : 0);
  const clock = `20:${String(Math.min(59, mins)).padStart(2, '0')}`;
  const moodOf = (q) => (q === me && reveal ? (reveal.score >= 6.6 ? 'grin' : reveal.score >= 5.6 ? 'happy' : reveal.score >= 4.6 ? 'ok' : 'sad') : speaker === q ? 'happy' : 'ok');
  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" role="dialog" aria-modal="true" aria-label={tt('LRT debate', 'LRT debatai')} style={{ background: '#04060A' }}>
      <div className="relative flex-1 min-h-0 overflow-hidden" onClick={skipTyping}>
        <svg className="absolute inset-0 cx-kb" viewBox="0 0 360 140" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" aria-hidden="true"><SceneArt kind="studio" uid="debate" parties={stage} /></svg>
        <StageBeams />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 38%, rgba(0,0,0,0) 25%, rgba(0,0,0,.78) 100%), linear-gradient(0deg, rgba(4,6,10,.85), rgba(4,6,10,0) 40%)' }} />
        <div className="absolute top-0 inset-x-0 flex items-center gap-2 px-3 lg:px-6" style={{ paddingTop: 'max(10px, env(safe-area-inset-top))', paddingBottom: 8 }}>
          <span className="cx-title text-white px-2 text-xl leading-tight" style={{ background: '#0B5CAD' }}>LRT</span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-extrabold text-white" style={{ background: '#DC2626' }}><span className="w-2 h-2 rounded-full bg-white sbl-blink" />{tt('LIVE', 'TIESIOGIAI')}</span>
          <span className="cx-title text-white text-lg truncate hidden sm:inline">{tt('Debate', 'Debatai')}: {L(D.title)}</span>
          <span className="ml-auto flex items-center gap-1">{steps.map((x, i) => <span key={i} className="rounded-full" style={{ width: 18, height: 5, background: i < qi || (i === qi && reveal) ? (x.clash != null ? '#F87171' : SUN) : i === qi ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.2)' }} />)}</span>
          <span className="cx-num text-white/85 text-lg ml-2">{clock}</span>
        </div>
        {phase !== 'intro' && phase !== 'results' && (
          <div className="absolute inset-x-0 flex justify-center items-end gap-1.5 sm:gap-4 lg:gap-8 px-2" style={{ bottom: chyron ? 'clamp(110px, 26%, 190px)' : '16%' }}>
            {stage.map((q, i) => {
              const active = speaker === q;
              const sz = i === 0 ? 'clamp(58px, 15vw, 120px)' : 'clamp(48px, 12vw, 100px)';
              return (
                <div key={q} className="relative flex flex-col items-center transition-all duration-500" style={{ transform: `translateY(${active ? -10 : 0}px) scale(${active ? 1.12 : 1})`, opacity: speaker && !active ? 0.5 : 1, filter: speaker && !active ? 'saturate(.5) brightness(.8)' : 'none' }}>
                  {active && <span className="absolute rounded-full cx-ping" style={{ inset: -6, background: `radial-gradient(circle, ${SUN}55, transparent 70%)` }} />}
                  <Portrait who={q} size={sz} mood={moodOf(q)} ring={active ? SUN : PARTIES[q].color} />
                  <span className="mt-1 px-1.5 text-[10px] lg:text-xs font-extrabold text-white rounded-sm whitespace-nowrap" style={{ background: PARTIES[q].color }}>{i === 0 ? tt('YOU', 'JŪS') : leaderSurname(q)}</span>
                  <span className="mt-0.5 rounded-t-md" style={{ width: 'clamp(44px, 12vw, 110px)', height: 'clamp(16px, 4vh, 40px)', background: `linear-gradient(180deg, ${mixHex(PARTIES[q].color, '#000000', 0.15)}, ${mixHex(PARTIES[q].color, '#000000', 0.65)})`, borderTop: '2px solid rgba(255,255,255,.55)' }} />
                </div>
              );
            })}
          </div>
        )}
        {chyron && (
          <div key={`${phase}-${qi}`} className={`absolute left-3 right-3 lg:left-[12%] lg:right-[12%] cx-chyron ${phase === 'ask' && st.clash != null ? 'cx-shake' : ''}`} style={{ bottom: 12 }}>
            <div className="flex items-stretch rounded-md overflow-hidden" style={{ boxShadow: '0 12px 30px rgba(0,0,0,.6)' }}>
              <div className="shrink-0" style={{ width: 6, background: chyron.accent }} />
              {chyron.who === 'host' && <div className="shrink-0 pl-2 lg:pl-3 flex items-center" style={{ background: 'rgba(6,8,12,.93)' }}><Portrait who="host" size={'clamp(44px, 11vw, 64px)'} square mood="ok" /></div>}
              <div className="flex-1 px-3 py-2 lg:px-5 lg:py-3" style={{ background: 'rgba(6,8,12,.93)' }}>
                <div className="cx-kicker text-[11px] lg:text-xs" style={{ color: chyron.accent === '#0B5CAD' ? '#7DB8F0' : chyron.accent }}>{chyron.label}</div>
                <div className="cx-title text-lg lg:text-3xl leading-snug text-white" style={{ minHeight: '1.4em' }}>{chyron.text}{!chyron.done && <span className="cx-caret" style={{ color: SUN }}>▌</span>}</div>
              </div>
            </div>
          </div>
        )}
        {(phase === 'speak' || phase === 'rival') && (
          <div className="absolute right-3 lg:right-8 w-[46%] max-w-[300px] rounded-lg p-2 lg:p-3 cx-pop-in" style={{ top: 'calc(max(10px, env(safe-area-inset-top)) + 44px)', background: 'rgba(6,8,12,.82)', border: `1px solid ${LINE2}` }}>
            <div className="flex items-baseline justify-between"><span className="cx-kicker text-[10px]">{tt('Audience reaction', 'Žiūrovų reakcija')}</span><span className="cx-num text-white">{nf(worm[worm.length - 1])}</span></div>
            <Worm data={worm} h={48} />
          </div>
        )}
        <CrowdBurst burst={burst} />
        {phase === 'intro' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6" style={{ background: 'rgba(4,6,10,.55)' }}>
            <div className="flex items-center gap-2 cx-pop-in"><span className="cx-title text-white px-3 text-3xl" style={{ background: '#0B5CAD' }}>LRT</span><span className="cx-kicker text-lg">{tt(`Election debate ${item.id + 1} of 3`, `Rinkimų debatai ${item.id + 1} iš 3`)}</span></div>
            <div className="cx-logo cx-slam mt-3" style={{ fontSize: 'clamp(44px, 12vw, 120px)', lineHeight: 0.95 }}>{L(D.title)}</div>
            <div className="h-1 w-48 mt-4 cx-wipe" style={{ background: SUN }} />
            <div className="flex gap-3 mt-7 flex-wrap justify-center">
              {stage.map((q, i) => (
                <div key={q} className="flex flex-col items-center cx-pop-in" style={{ animationDelay: `${0.5 + i * 0.14}s` }}>
                  <Portrait who={q} size={'clamp(52px, 14vw, 96px)'} square mood="happy" />
                  <span className="mt-1 text-xs font-bold text-white">{i === 0 ? tt('You', 'Jūs') : leaderSurname(q)}</span>
                </div>
              ))}
            </div>
            <div className="text-xs t-muted mt-8">{tt('Tap to start', 'Paspauskite, kad pradėtumėte')}</div>
          </div>
        )}
        {phase === 'results' && res && (
          <div className="absolute inset-0 overflow-y-auto sbl-scroll" style={{ background: 'rgba(4,6,10,.72)' }} onClick={(e) => e.stopPropagation()}>
            {res.won && <Confetti />}
            <div className="max-w-2xl mx-auto px-4 flex flex-col items-center gap-4" style={{ paddingTop: 'calc(max(10px, env(safe-area-inset-top)) + 64px)', paddingBottom: 24 }}>
              <div className="cx-kicker text-sm">{tt('Viewers’ vote', 'Žiūrovų balsavimas')}</div>
              <div className="relative cx-pop-in">
                <span className="absolute rounded-full" style={{ inset: -30, background: `radial-gradient(circle, ${SUN}66, transparent 70%)` }} />
                <Portrait who={res.poll[0].p} size={'clamp(110px, 30vw, 170px)'} square mood="grin" />
              </div>
              <div className="cx-logo cx-slam text-center" style={{ fontSize: 'clamp(30px, 8vw, 60px)', lineHeight: 1 }}>{res.poll[0].p === me ? tt('You won the debate!', 'Laimėjote debatus!') : tt(`${PARTIES[res.poll[0].p].leader} wins`, `Laimėjo ${PARTIES[res.poll[0].p].leader}`)}</div>
              <div className="w-full flex flex-col gap-2 mt-1">
                {res.poll.map((x, i) => <PollRaceRow key={x.p} x={x} i={i} me={me} />)}
              </div>
              <div className="cx-card p-3 w-full font-semibold">
                {res.won ? tt('You get 2 favours and a big burst of buzz.', 'Gaunate 2 ryšius ir didelį pagreitį.') : res.avg > 6 ? tt('A good night. The pundits liked you: +1 favour.', 'Geras vakaras. Komentatoriams patikote: +1 ryšys.') : tt('Not your best night. Rivals will replay your weakest moment.', 'Ne pats geriausias vakaras. Varžovai kartos jūsų silpniausią akimirką.')}
                <div className="mt-1">{tt('Your poll:', 'Jūsų reitingas:')} <Delta v={res.delta} pct /></div>
              </div>
              <div className="w-full"><ConsList items={res.cons} /></div>
              <Btn className="h-14 w-full text-lg" onClick={onClose}>{tt('Back to the campaign', 'Atgal į kampaniją')} <ArrowRight size={20} /></Btn>
            </div>
          </div>
        )}
      </div>
      {phase !== 'results' && phase !== 'intro' && (
        <div className="relative shrink-0" style={{ background: 'linear-gradient(180deg, #0B0E14, #06080C)', borderTop: `1px solid ${LINE}`, paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <div className="max-w-3xl mx-auto px-3 pt-3 flex flex-col gap-2">
            {phase === 'ask' && !askDone && <button type="button" onClick={finishAsk} className="text-sm t-muted text-left py-3">{st.clash != null ? tt('A rival is attacking you… (tap to skip)', 'Varžovas puola jus… (paspauskite, kad praleistumėte)') : tt('The host is asking… (tap to skip)', 'Vedėjas klausia… (paspauskite, kad praleistumėte)')}</button>}
            {phase === 'ask' && askDone && (
              <>
                <div className="cx-kicker text-xs">{tt('Your answer', 'Jūsų atsakymas')}</div>
                {Q.answers.map((a, i) => (
                  <button key={i} type="button" onClick={() => choose(i)} className="cx-btn cx-quote cx-answer w-full items-center text-left px-4 py-2.5 cx-pop-in" style={{ gap: 12, minHeight: 52, justifyContent: 'flex-start', animationDelay: `${i * 0.07}s` }}>
                    <span className="cx-num grid place-items-center rounded-full shrink-0" style={{ width: 26, height: 26, background: '#11141B', color: '#fff' }}>{String.fromCharCode(65 + i)}</span>
                    <span className="font-bold text-[15px] leading-snug flex-1">{L(a.t)}</span>
                  </button>
                ))}
                {item.id === 0 && qi === 0 && g.tut !== 99 && <div className="text-xs t-muted">{tt('Tip: answers that fit your party’s style and your promises go down best.', 'Patarimas: geriausiai vertinami atsakymai, atitinkantys jūsų partijos stilių ir pažadus.')}</div>}
              </>
            )}
            {(phase === 'speak' || phase === 'rival') && reveal && (
              <div className="flex items-center gap-3 py-1">
                <div className="cx-num text-4xl leading-none" style={{ color: reactionLabel(reveal.score)[1] }}>{nf(reveal.score)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold" style={{ color: reactionLabel(reveal.score)[1] }}>{reactionLabel(reveal.score)[0]}</div>
                  {reveal.note && <div className="text-xs font-bold" style={{ color: reveal.note === 'fits' ? GREEN : RED }}>{reveal.note === 'fits' ? tt('Fits your promises', 'Atitinka jūsų pažadus') : tt('Clashes with your promises', 'Prieštarauja jūsų pažadams')}</div>}
                  {phase === 'rival' && rivalReply && <div className="text-xs t-muted mt-0.5">{tt(`${leaderSurname(rivalReply.q)} responds…`, `${leaderSurname(rivalReply.q)} atsako…`)}</div>}
                </div>
                <Btn className="h-12 px-5 shrink-0" disabled={phase !== 'rival'} onClick={next}>{qi < steps.length - 1 ? tt('Next', 'Toliau') : tt('Results', 'Rezultatai')} <ArrowRight size={18} /></Btn>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
function PollRaceRow({ x, i, me }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(x.pct), 200 + i * 160); return () => clearTimeout(t); }, [x.pct]);
  return (
    <div className="grid items-center gap-2 rounded-lg px-2 py-1.5" style={{ gridTemplateColumns: '28px 1fr 52px', background: x.p === me ? ACC_BG : 'rgba(255,255,255,.04)' }}>
      <span className="cx-num text-center">{i === 0 ? <Trophy size={18} style={{ color: SUN }} /> : `#${i + 1}`}</span>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-sm font-bold"><Portrait who={x.p} size={24} mood={i === 0 ? 'grin' : 'ok'} />{x.p === me ? tt('You', 'Jūs') : PARTIES[x.p].leader}</div>
        <div className="cx-track mt-1" style={{ height: 10 }}><div className="h-full" style={{ width: `${w}%`, background: PARTIES[x.p].color, transition: 'width 1s cubic-bezier(.2,.8,.2,1)' }} /></div>
      </div>
      <span className="cx-num text-right"><CountUp to={w} from={0} fmt={(v) => fmtPct(v, 0)} /></span>
    </div>
  );
}
function WeekIntro({ g, item, onDone }) {
  useEffect(() => {
    SFX.play('whoosh');
    const t = setTimeout(onDone, REDUCED() ? 50 : 3000);
    return () => clearTimeout(t);
  }, []);
  const p = g.player;
  const H = g.history;
  const cur = H[H.length - 1].shares[p];
  const prev = H.length > 1 ? H[H.length - 2].shares[p] : cur;
  const movers = item.moves.filter((m) => m.list.length).sort((a, b) => b.list.length - a.list.length).slice(0, 5);
  return (
    <div className="fixed inset-0 z-[60] cx-weekintro flex flex-col items-center justify-center overflow-hidden text-center px-4" onClick={onDone} role="presentation" style={{ background: 'radial-gradient(ellipse at center, #151B28, #04060A 72%)' }}>
      <StageBeams />
      <div className="relative cx-kicker text-sm cx-pop-in">{fmtDay(weekStartDate(g.week))} · {tt(`${WEEKS - g.week + 1} weeks to the vote`, `iki rinkimų ${WEEKS - g.week + 1} sav.`)}</div>
      <div className="relative cx-logo cx-slam mt-2" style={{ fontSize: 'clamp(64px, 19vw, 170px)', lineHeight: 0.88 }}>{tt(`WEEK ${g.week}`, `${g.week} SAVAITĖ`)}</div>
      <div className="relative h-1 w-44 mt-4 cx-wipe" style={{ background: SUN }} />
      <div className="relative mt-7 flex gap-2.5 flex-wrap justify-center max-w-2xl">
        {movers.map((m, i) => (
          <div key={m.p} className="cx-pop-in flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-left" style={{ animationDelay: `${0.45 + i * 0.16}s`, background: 'rgba(255,255,255,.06)', border: `1px solid ${LINE}` }}>
            <Portrait who={m.p} size={34} square mood={m.list.some((x) => x.target === p) ? 'grr' : 'ok'} />
            <div className="text-xs"><div className="font-bold">{partyShort(m.p)}</div><div className="t-muted">{m.list.some((x) => x.target === p) ? tt('attacked you', 'puolė jus') : tt(`${m.list.length} moves`, `${m.list.length} ėjimai`)}</div></div>
          </div>
        ))}
      </div>
      <div className="relative mt-7 cx-pop-in flex items-center gap-3" style={{ animationDelay: '1.3s' }}>
        <Portrait who={p} size={52} badge />
        <div className="text-left">
          <div className="text-xs t-muted">{tt('Your new poll', 'Jūsų nauja apklausa')}</div>
          <div className="cx-num text-5xl leading-none"><CountUp to={cur} from={prev} fmt={(v) => fmtPct(v)} dur={1400} /> <span className="text-2xl"><Delta v={cur - prev} /></span></div>
        </div>
      </div>
      <div className="absolute bottom-8 text-xs t-muted">{tt('Tap to continue', 'Paspauskite, kad tęstumėte')}</div>
    </div>
  );
}
function HelpSheet({ onClose }) {
  const items = [
    [Crown, tt('The goal', 'Tikslas'), tt('Become Prime Minister. You need 71 of the 141 seats in the Seimas, on your own or with partner parties. Then the Seimas votes on your appointment.', 'Tapkite Ministru Pirmininku. Reikia 71 iš 141 Seimo vietos – vieniems arba su partneriais. Tada Seimas balsuoja dėl jūsų paskyrimo.')],
    [Zap, tt('Energy & money', 'Energija ir pinigai'), tt('You get 6 energy every week, plus donations. Every move costs 1 energy and some money. Unused energy is lost.', 'Kas savaitę gaunate 6 energijos ir aukų. Kiekvienas veiksmas kainuoja 1 energiją ir pinigų. Nepanaudota energija dingsta.')],
    [MapIcon, tt('Regions', 'Regionai'), tt('Tap a region to campaign there. Stripes mean a close race, where a push matters most. Repeating moves in one region in the same week works less well.', 'Paspauskite regioną ir agituokite jame. Juostos reiškia lygią kovą – ten postūmis svarbiausias. Kartojami veiksmai tame pačiame regione per savaitę veikia silpniau.')],
    [Bus, tt('Your leader on tour', 'Lyderio kelionės'), tt('Your leader’s face on the map shows where they are. Rallies are 30% stronger where the leader is and 15% weaker elsewhere. Each week you get one free bus ride to a neighbouring region; longer trips cost 1 energy.', 'Lyderio veidas žemėlapyje rodo, kur jis yra. Kur lyderis, ten mitingai 30 % stipresni, kitur – 15 % silpnesni. Kas savaitę – viena nemokama kelionė į kaimyninį regioną, tolimesnės kainuoja 1 energiją.')],
    [Layers, tt('Map layers', 'Žemėlapio sluoksniai'), tt('Switch the map between who leads, your support, this week’s change, battlegrounds, your ground teams and rival moves. Pins show news stories, your moves and strongholds waiting for a visit.', 'Žemėlapį galite perjungti: kas pirmauja, jūsų parama, savaitės pokytis, kovos, jūsų komandos ir varžovų ėjimai. Ženkleliai rodo naujienas, jūsų veiksmus ir tvirtoves, laukiančias vizito.')],
    [ShieldCheck, tt('Promises & reputation', 'Pažadai ir reputacija'), tt('Every answer in the news, in debates and on the street becomes a promise. Saying the opposite later is a flip-flop and costs reputation. High reputation makes good news count for more and partners more willing.', 'Kiekvienas atsakymas naujienose, debatuose ir gatvėje tampa pažadu. Vėliau pasakius priešingai – tai pozicijos keitimas, ir krenta reputacija. Aukšta reputacija stiprina geras naujienas ir partnerių norą jungtis.')],
    [Clock, tt('Consequences', 'Pasekmės'), tt('Some decisions come back weeks later. Rivals hit back where you attacked them and defend where you surge. Strongholds you ignore for 4 weeks slip. Voters stop you after rallies with questions of their own.', 'Kai kurie sprendimai sugrįžta po kelių savaičių. Varžovai atsako ten, kur juos puolėte, ir ginasi ten, kur jūs augate. Tvirtovės, kurių nelankote 4 sav., ima slysti. Po mitingų jus sustabdo rinkėjai su savais klausimais.')],
    [Megaphone, tt('Message of the week', 'Savaitės žinutė'), tt('Pick one of five messages each week. Moves in regions where voters care about it are 12% stronger, elsewhere 3% weaker. Sticking with a message builds buzz; dropping one you pushed for weeks looks confused.', 'Kas savaitę pasirinkite vieną iš penkių žinučių. Veiksmai regionuose, kur tai rūpi, 12 % stipresni, kitur – 3 % silpnesni. Laikantis žinutės auga pagreitis, o staiga jos atsisakius atrodote pasimetę.')],
    [Users, tt('Party board & unity', 'Partijos taryba ir vienybė'), tt('The party board sets a task every week. Complete it for a reward; miss it and unity drops. Flip-flops, shady deals and drifting from the party programme hurt unity too. Below 40 a revolt breaks out, and rebels can vote against you as Prime Minister.', 'Partijos taryba kas savaitę skiria užduotį. Įvykdę gausite atlygį, neįvykdę – krenta vienybė. Ją mažina ir pozicijų keitimas, abejotini sandoriai bei nutolimas nuo programos. Nukritus žemiau 40 kyla maištas, o maištininkai gali balsuoti prieš jus.')],
    [Building2, tt('Campaign team', 'Štabo komanda'), tt('Hire up to three specialists in HQ: a strategist, a press secretary, a digital director, a field organiser, a pollster, a fundraiser or a lawyer. Each has a weekly wage.', 'Štabe galite samdyti iki trijų specialistų: strategą, atstovę spaudai, skaitmeninės kampanijos vadovą, lauko organizatorę, sociologą, lėšų rinkėją ar teisininką. Kiekvienas gauna savaitinę algą.')],
    [Handshake, tt('Between the rounds', 'Tarp turų'), tt('After round one you can sign up to two runoff pacts and send three volunteer teams to your closest runoffs. Projections update as you choose.', 'Po pirmojo turo galite pasirašyti iki dviejų antrojo turo susitarimų ir pasiųsti tris savanorių komandas į lygiausias apygardas. Prognozės keičiasi jums renkantis.')],
    [Star, tt('Star candidates', 'Žinomi kandidatai'), tt('A famous local candidate makes you much stronger in one district. Rivals have some too: look for coloured stars in the district list.', 'Žinomas vietos kandidatas gerokai sustiprina jus vienoje apygardoje. Jų turi ir varžovai – ieškokite spalvotų žvaigždučių apygardų sąraše.')],
    [BarChart3, tt('How seats work', 'Kaip skirstomi mandatai'), tt('70 seats are shared by the national vote (5% minimum). 71 go to local winners; if nobody gets 50%, the top two face a runoff two weeks later.', '70 vietų paskirstoma pagal balsus visoje šalyje (būtina bent 5 %). 71 tenka apygardų nugalėtojams; jei niekas negauna 50 %, po dviejų savaičių vyksta antrasis turas.')],
    [Gavel, tt('VRK spending limit', 'VRK išlaidų limitas'), tt(`The electoral commission lets you spend ${fmtEur(VRK_LIMIT)} in total. Spend more and you are fined.`, `Rinkimų komisija leidžia išleisti iš viso ${fmtEur(VRK_LIMIT)}. Išleidus daugiau – bauda.`)],
    [Dices, tt('Risky money', 'Rizikingi pinigai'), tt('The casino and sports bets can refill your budget fast, but you usually lose, and every bet can leak to the press.', 'Kazino ir lažybos gali greitai papildyti biudžetą, bet dažniausiai pralošiate, o kiekvienas statymas gali nutekėti žiniasklaidai.')],
    [Lightbulb, tt('Thinking tips', 'Kaip mąstyti'), tt('Close races (stripes) swing the most seats. Big regions matter for the national vote too. Watch your money, the VRK limit and scandal risk, and keep potential partners happy with your promises.', 'Lygios kovos (juostos) nulemia daugiausia mandatų. Dideli regionai svarbūs ir bendram balsų skaičiui. Stebėkite pinigus, VRK limitą ir skandalo riziką, o pažadais neatstumkite būsimų partnerių.')],
    [Info, tt('About this game', 'Apie žaidimą'), tt('A fictional simulation of the 2028 Seimas election. Real parties and leaders appear for context; every event, quote and result is invented. Party emblems are original designs, not official logos.', 'Išgalvota 2028 m. Seimo rinkimų simuliacija. Tikros partijos ir lyderiai naudojami tik kontekstui; visi įvykiai, citatos ir rezultatai išgalvoti. Partijų ženkliukai sukurti žaidimui, tai ne oficialūs logotipai.')],
  ];
  return (
    <Sheet onClose={onClose} label={tt('How to play', 'Kaip žaisti')}>
      <SheetHead title={tt('How to play', 'Kaip žaisti')} onClose={onClose} />
      <div style={GUTTER} className="pt-4 flex flex-col gap-3">
        {items.map(([Icon, t, d]) => (
          <div key={t} className="cx-soft p-3 flex gap-3 items-start">
            <span className="grid place-items-center rounded-full shrink-0" style={{ width: 38, height: 38, background: ACC_BG, border: `1px solid ${LINE}` }}><Icon size={18} strokeWidth={2.5} /></span>
            <div><div className="font-black">{t}</div><div className="text-sm font-semibold leading-relaxed">{d}</div></div>
          </div>
        ))}
        <Btn className="h-14 text-lg mt-1" onClick={onClose}>{tt('Got it!', 'Supratau!')}</Btn>
      </div>
    </Sheet>
  );
}
function ConfirmEnd({ g, onCancel, onConfirm }) {
  return (
    <Sheet onClose={onCancel} label={tt('End week', 'Baigti savaitę')}>
      <div style={GUTTER} className="pt-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {ADVISOR ? <Advisor size={56} /> : <span className="grid place-items-center rounded-full shrink-0" style={{ width: 52, height: 52, background: ACC_BG, border: `1px solid ${LINE}` }}><Zap size={26} style={{ fill: SUN }} /></span>}
          <div className="cx-title text-2xl leading-tight">{tt(`Wait, you still have ${g.ap} energy!`, `Palaukite – dar liko ${g.ap} energijos!`)}</div>
        </div>
        <p className="font-semibold">{tt('Energy doesn’t carry over to next week.', 'Energija į kitą savaitę nepersikelia.')}{g.week >= WEEKS ? tt(' This is the last week. After this, the country votes!', ' Tai paskutinė savaitė – po jos šalis balsuoja!') : ''}</p>
        <Btn className="h-14 text-base" onClick={onConfirm}>{g.week >= WEEKS ? tt('Go straight to the vote', 'Iš karto į rinkimus') : tt('End the week anyway', 'Vis tiek baigti savaitę')}</Btn>
        <Btn kind="pale" className="h-12" onClick={onCancel}>{tt('Keep campaigning', 'Toliau agituoti')}</Btn>
      </div>
    </Sheet>
  );
}

/* ============================================================
   Title & party picker
   ============================================================ */
function TitleScreen({ saved, onNew, onContinue, lang, setLang }) {
  const [ach, setAch] = useState(false);
  const achN = useMemo(() => loadAch().length, []);
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-0 h-[58vh] lg:h-auto lg:inset-y-0 lg:left-[30%]" style={{ filter: 'blur(1.5px) saturate(.9)', opacity: 0.75 }}>
          <svg viewBox="0 0 360 140" preserveAspectRatio="xMidYMax slice" width="100%" height="100%" style={{ display: 'block' }}><SceneArt kind="night" uid="title" /></svg>
        </div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(8,10,15,.96) 0%, rgba(8,10,15,.7) 45%, rgba(8,10,15,.3) 100%), linear-gradient(0deg, rgba(8,10,15,.97) 0%, rgba(8,10,15,.2) 50%, rgba(8,10,15,.85) 100%)' }} />
      </div>
      <div className="relative max-w-6xl mx-auto min-h-screen flex flex-col" style={{ ...GUTTER, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
        <div className="pt-5 flex items-center justify-between gap-3">
          <span className="cx-kicker text-sm">{tt('Seimas election · October 2028', '2028 m. spalio Seimo rinkimai')}</span>
          <LangToggle lang={lang} setLang={setLang} />
        </div>
        <div className="mt-[9vh] lg:mt-[13vh] max-w-xl">
          <Tricolor className="w-20 mb-5" h={5} />
          <h1 className="cx-logo leading-[0.82]" style={{ fontSize: 'clamp(72px, 22vw, 176px)', paddingRight: '0.08em' }}>SEIMAS</h1>
          <div className="cx-title text-3xl lg:text-4xl mt-2" style={{ color: SUN }}>{tt('Battle for Lithuania', 'Kova dėl Lietuvos')}</div>
          <p className="mt-4 text-base lg:text-lg font-medium leading-relaxed" style={{ color: '#C9D1DE' }}>{tt('Lead a real Lithuanian party through a 12-week campaign, win LRT debates and runoffs, then build a coalition of 71 out of 141 seats.', 'Veskite tikrą Lietuvos partiją per 12 savaičių kampaniją, laimėkite LRT debatus ir antruosius turus, o tada suburkite 71 iš 141 Seimo narių koaliciją.')}</p>
          <div className="flex flex-col sm:flex-row gap-3 mt-7">
            <Btn className="h-16 px-10 text-2xl" onClick={onNew}><Play size={24} style={{ fill: '#1B1204' }} />{tt('Play', 'Žaisti')}</Btn>
            <Btn kind="white" className="h-16 px-5 text-lg" onClick={() => setAch(true)}><Trophy size={20} color={SUN} />{achN}/{ACHIEVEMENTS.length}</Btn>
            {saved && <Btn kind="white" className="h-16 px-6 text-lg" onClick={onContinue}>{tt('Continue', 'Tęsti')} · {PARTIES[saved.player].short}, {saved.phase === 'campaign' ? tt(`week ${saved.week}`, `${saved.week} sav.`) : tt('after the vote', 'po rinkimų')}</Btn>}
          </div>
          <div className="flex gap-6 mt-8">
            {[['12', tt('weeks', 'savaičių')], ['3', tt('LRT debates', 'LRT debatai')], ['141', tt('seats', 'vietų Seime')], ['71', tt('to govern', 'valdžiai')]].map(([n, l]) => (
              <div key={l}><div className="cx-num text-4xl leading-none italic">{n}</div><div className="text-[11px] t-muted font-bold uppercase tracking-wider mt-1">{l}</div></div>
            ))}
          </div>
        </div>
        <div className="mt-auto pt-10">
          <div className="cx-kicker text-xs mb-2">{tt('12 parties · 12 real leaders', '12 partijų · 12 tikrų lyderių')}</div>
          <div className="flex gap-2.5 overflow-x-auto cx-layers pb-2">{PARTY_IDS.map((p) => <CandidateCard key={p} p={p} w={92} />)}</div>
          {ach && <AchievementsSheet onClose={() => setAch(false)} />}
          <p className="text-xs t-muted mt-3 max-w-3xl leading-relaxed">{tt('A fictional simulation. Real parties and leaders appear for context; all events, quotes and results are invented. Emblems are not official logos and portraits are drawings, not photos.', 'Išgalvota simuliacija. Tikros partijos ir lyderiai naudojami kontekstui; visi įvykiai, citatos ir rezultatai išgalvoti. Ženkliukai – ne oficialūs logotipai, portretai – piešti, ne nuotraukos.')}</p>
        </div>
      </div>
    </div>
  );
}
function PartyStats({ p, startNat }) {
  const P = PARTIES[p];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <StatPill icon={BarChart3} iconStyle={{ color: '#1D4ED8' }} label={tt('Starting poll', 'Pradinis reitingas')}>{fmtPct(startNat[p])}</StatPill>
      <StatPill icon={Wallet} iconStyle={{ color: '#15803D' }} label={tt('Campaign funds', 'Kampanijos lėšos')}>{fmtEurShort(P.funds)}</StatPill>
      <StatPill icon={Star} iconStyle={{ fill: SUN, color: '#7A4E00' }} label={L(DIFF_LABEL[P.difficulty])}>{L(DIFF_LABEL[P.difficulty])}</StatPill>
    </div>
  );
}
function SettingsCard({ diff, setDiff, scen, setScen }) {
  return (
    <div className="cx-card p-3">
      <div className="cx-title text-lg leading-tight">{tt('Game settings', 'Žaidimo nustatymai')}</div>
      <div className="text-xs font-bold t-muted mt-2 mb-1">{tt('Difficulty', 'Sudėtingumas')}</div>
      <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label={tt('Difficulty', 'Sudėtingumas')}>
        {Object.entries(DIFFS).map(([id, D]) => <button key={id} type="button" role="radio" aria-checked={diff === id} onClick={() => setDiff(id)} className={`cx-btn cx-cta h-10 text-base ${diff === id ? 'cx-sun' : 'cx-white'}`}>{L(D.name)}</button>)}
      </div>
      <div className="text-xs t-muted mt-1">{L(DIFFS[diff].desc)}</div>
      <div className="text-xs font-bold t-muted mt-3 mb-1">{tt('Scenario', 'Scenarijus')}</div>
      <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label={tt('Scenario', 'Scenarijus')}>
        {SCENARIOS.map((S) => (
          <button key={S.id} type="button" role="radio" aria-checked={scen === S.id} onClick={() => setScen(S.id)} className="rounded-xl p-2 text-left cx-tap" style={{ background: scen === S.id ? ACC_BG : 'rgba(255,255,255,.04)', border: `1px solid ${scen === S.id ? 'rgba(245,165,36,.6)' : LINE}` }}>
            <div className="font-bold text-sm leading-tight">{L(S.name)}</div>
            <div className="text-[11px] t-muted leading-snug mt-0.5">{L(S.desc)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
function RutaSwitch({ helper, setHelper }) {
  return (
    <div className="cx-card p-3">
      <div className="flex items-center gap-3">
        <span style={{ opacity: helper ? 1 : 0.35, filter: helper ? 'none' : 'grayscale(1)' }}><Advisor size={48} /></span>
        <div className="min-w-0 flex-1">
          <div className="cx-title text-lg leading-tight">{tt('Rūta, campaign manager', 'Rūta, štabo vadovė')}</div>
          <div className="text-xs font-medium t-muted">{helper ? tt('Walks you through week 1 and explains the rules. Never picks moves for you.', 'Pirmą savaitę paaiškina taisykles. Niekada nesirenka už jus.') : tt('Off: no tutorial, no tips, no forecasts. Just you.', 'Išjungta: jokio mokymo, patarimų ar prognozių. Tik jūs.')}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3" role="radiogroup" aria-label={tt('Campaign manager', 'Štabo vadovė')}>
        {[[true, tt('With Rūta', 'Su Rūta')], [false, tt('Play solo', 'Žaisti vienam')]].map(([v, l]) => (
          <button key={l} type="button" role="radio" aria-checked={helper === v} onClick={() => setHelper(v)} className={`cx-btn cx-cta ${helper === v ? 'cx-sun' : 'cx-white'} h-11 text-base`}>{helper === v && <Check size={16} />}{l}</button>
        ))}
      </div>
    </div>
  );
}
function PartySelect({ onPick, onBack }) {
  const [sel, setSel] = useState(null);
  const [helper, setHelper] = useState(true);
  const [diff, setDiff] = useState('normal');
  const [scen, setScen] = useState('standard');
  const wide = useWide();
  const startNat = useMemo(() => nationalShares(newGame('LSDP')), []);
  const groups = [[tt('In the Seimas now', 'Dabar Seime'), tt('Parties with seats today.', 'Partijos, šiandien turinčios vietų.'), PARTY_IDS.slice(0, 8)], [tt('Outsiders', 'Autsaideriai'), tt('Under 5% today. Can you get them over the line?', 'Šiandien žemiau 5 %. Ar pavyks peržengti barjerą?'), PARTY_IDS.slice(8)]];
  const startBtn = <Btn className="h-14 w-full text-xl" disabled={!sel} onClick={() => onPick(sel, helper, diff, scen)}>{sel ? <>{tt(`Play as ${PARTIES[sel].short}`, `Žaisti už ${PARTIES[sel].short}`)} <ArrowRight size={20} /></> : tt('Tap a party to choose it', 'Paspauskite partiją')}</Btn>;
  const head = (
    <div className="pt-6 flex items-center gap-3">
      <button type="button" onClick={onBack} aria-label={tt('Back', 'Atgal')} className="cx-btn shrink-0" style={{ width: 44, height: 44, borderRadius: 999, background: 'rgba(255,255,255,.07)' }}><ArrowRight size={20} className="rotate-180" /></button>
      <div>
        <div className="cx-kicker text-xs">{tt('New campaign', 'Nauja kampanija')}</div>
        <h2 className="cx-title text-3xl lg:text-4xl leading-none">{tt('Choose your candidate', 'Pasirinkite kandidatą')}</h2>
      </div>
    </div>
  );
  if (wide) {
    const P = sel ? PARTIES[sel] : null;
    return (
      <div className="max-w-7xl mx-auto min-h-screen px-6 pb-10">
        {head}
        <div className="grid gap-6 mt-6" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.05fr)' }}>
          <section className="cx-card overflow-hidden self-start sticky top-6" style={{ padding: 0 }}>
            {P ? (
              <>
                <Scene kind="seimas" h={320} caption={false} flush kb>
                  <div className="absolute left-6 bottom-0"><Portrait who={sel} size={250} frameless mood="grin" /></div>
                  <div className="absolute right-5 top-5"><PartyEmblem p={sel} size={70} /></div>
                </Scene>
                <div className="flex items-center gap-3 px-5 py-3" style={{ background: `linear-gradient(90deg, ${P.color}, ${mixHex(P.color, '#000000', 0.45)})` }}>
                  <Handshake size={26} color="#fff" />
                  <div className="cx-title text-3xl leading-none text-white">{P.leader} <span style={{ color: 'rgba(255,255,255,.75)' }}>({P.short})</span></div>
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <PartyStats p={sel} startNat={startNat} />
                  <div className="flex flex-wrap gap-1.5"><span className="cx-chip px-3 py-1 text-sm">{L(P.ideology)}</span><span className="cx-chip px-3 py-1 text-sm">{L(P.strongholds)}</span></div>
                  <p className="font-medium leading-relaxed" style={{ color: '#D5DBE5' }}>{L(P.blurb)}</p>
                  <div className="cx-soft p-3 text-sm"><span className="cx-kicker text-xs block mb-0.5">{tt('Superpower', 'Supergalia')}</span>{L(P.perk)}</div>
                </div>
              </>
            ) : (
              <div className="p-8 flex flex-col items-center text-center gap-4" style={{ minHeight: 520, justifyContent: 'center' }}>
                <FaceRow ids={PARTY_IDS.slice(0, 6)} size={64} overlap={0.25} />
                <div className="cx-title text-3xl">{tt('Who will you lead?', 'Kam vadovausite?')}</div>
                <p className="t-muted max-w-sm">{tt('Pick a party on the right. Easy parties start strong; outsiders begin under the 5% line.', 'Pasirinkite partiją dešinėje. Lengvos partijos pradeda stipriai, autsaideriai – žemiau 5 % barjero.')}</p>
              </div>
            )}
          </section>
          <div className="flex flex-col gap-5">
            {groups.map(([t, sub, ids]) => (
              <div key={t}>
                <div className="cx-title text-2xl leading-none">{t}</div>
                <div className="text-sm t-muted font-medium mt-1 mb-3">{sub}</div>
                <div className="grid grid-cols-4 gap-3">{ids.map((p) => <CandidateCard key={p} p={p} w={'100%'} active={sel === p} onClick={() => setSel(p)} />)}</div>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3 items-start"><RutaSwitch helper={helper} setHelper={setHelper} /><SettingsCard diff={diff} setDiff={setDiff} scen={scen} setScen={setScen} /></div>
            {startBtn}
            <p className="text-xs t-muted">{tt('Starting polls roughly follow late-2026 averages. Portraits are drawings, not photos.', 'Pradiniai reitingai apytiksliai atitinka 2026 m. pabaigos vidurkius. Portretai – piešti, ne nuotraukos.')}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-lg mx-auto min-h-screen" style={{ ...GUTTER, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 110px)' }}>
      {head}
      <div className="flex flex-col gap-2.5 mt-5">
        {groups.map(([t, sub, ids]) => (
          <React.Fragment key={t}>
            <div className="mt-2">
              <div className="cx-title text-xl leading-none">{t}</div>
              <div className="text-xs font-medium t-muted mt-1">{sub}</div>
            </div>
            {ids.map((p) => {
              const P = PARTIES[p];
              const on = sel === p;
              return (
                <button key={p} type="button" onClick={() => setSel(p)} aria-pressed={on} className="cx-tap w-full flex flex-col items-stretch text-left rounded-xl overflow-hidden" style={{ background: `linear-gradient(90deg, ${tint(P.color, 0.4)}, ${tint(P.color, 0.8)})`, border: `1px solid ${on ? SUN : LINE}`, borderLeft: `4px solid ${P.color}`, boxShadow: on ? `0 0 0 2px ${SUN}, ${SHADOW}` : '0 6px 18px rgba(0,0,0,.28)' }}>
                  <div className="flex items-center gap-3 p-2.5">
                    <Portrait who={p} size={64} square badge mood={on ? 'grin' : 'happy'} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="cx-title text-2xl leading-none whitespace-nowrap">{P.short}</span>
                        <span className="text-xs font-semibold t-muted truncate hidden min-[400px]:inline">{L(P.ideology)}</span>
                      </div>
                      <div className="text-sm font-semibold mt-0.5 truncate" style={{ color: '#D5DBE5' }}>{P.leader}</div>
                      <div className="mt-1.5"><PartyStats p={p} startNat={startNat} /></div>
                    </div>
                  </div>
                  {on && (
                    <div className="px-3 pb-3 text-sm sbl-fade flex flex-col gap-1.5" style={{ color: '#D5DBE5' }}>
                      <div>{L(P.blurb)}</div>
                      <div><span className="cx-kicker text-xs">{tt('Superpower', 'Supergalia')} </span>{L(P.perk)}</div>
                      <div><span className="cx-kicker text-xs">{tt('Home turf', 'Tvirtovės')} </span>{L(P.strongholds)}</div>
                    </div>
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <p className="text-xs t-muted mt-4">{tt('Starting polls roughly follow late-2026 averages. Portraits are drawings, not photos.', 'Pradiniai reitingai apytiksliai atitinka 2026 m. pabaigos vidurkius. Portretai – piešti, ne nuotraukos.')}</p>
      <div className="mt-4 flex flex-col gap-3"><RutaSwitch helper={helper} setHelper={setHelper} /><SettingsCard diff={diff} setDiff={setDiff} scen={scen} setScen={setScen} /></div>
      <div className="fixed bottom-0 inset-x-0 z-20" style={{ background: 'rgba(8,10,15,.96)', borderTop: `1px solid ${LINE}`, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)', backdropFilter: 'blur(8px)' }}>
        <div className="max-w-lg mx-auto pt-3" style={GUTTER}>{startBtn}</div>
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
    <li className="rounded-2xl px-3 py-2 sbl-fade" style={{ border: `1px solid ${LINE}`, background: mine ? ACC_BG : PANEL2 }}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-black truncate">{cnm(e.cid)}</span>
        <span className="text-sm font-extrabold inline-flex items-center gap-1 shrink-0"><PartyDot p={e.winner} size={11} />{tt(`${partyShort(e.winner)} wins`, `laimi ${partyShort(e.winner)}`)}</span>
      </div>
      <div className="flex mt-1.5 overflow-hidden rounded-full" style={{ height: 12, border: `1px solid ${LINE}` }}>
        <div style={{ width: `${sa}%`, background: PARTIES[a].color, borderRight: `1px solid ${LINE}` }} />
        <div style={{ width: `${sb}%`, background: PARTIES[b].color }} />
      </div>
      <div className="flex justify-between text-xs font-extrabold t-muted mt-1"><span>{partyShort(a)} {fmtPct(sa)}</span><span>{partyShort(b)} {fmtPct(sb)}</span></div>
    </li>
  );
}
function RunoffDeals({ g, onConfirm }) {
  const E = g.election;
  const me = g.player;
  const mine = E.smd.filter((e) => e.round === 2 && (e.runoff.a === me || e.runoff.b === me));
  const [pacts, setPacts] = useState({});
  const [boosts, setBoosts] = useState({});
  const BOOSTS = 3;
  const used = sum(Object.values(boosts));
  const chosen = Object.keys(pacts).filter((q) => pacts[q]);
  const cost = sum(chosen.map((q) => pactCost(g, q) || 0));
  const potential = (q) => sum(mine.map((e) => (e.runoff.a === q || e.runoff.b === q ? 0 : ((e.cand.find((c) => c.p === q) || {}).s || 0))));
  const cands = PARTY_IDS.filter((q) => q !== me).map((q) => ({ q, pot: potential(q), c: pactCost(g, q) })).filter((x) => x.pot > 3).sort((a, b) => b.pot - a.pot).slice(0, 6);
  const proj = mine.map((e) => ({ e, r: runoffTally(g, E, e, pacts, boosts, false) }));
  const wins = proj.filter((x) => x.r.winner === me).length;
  // The eight closest races, in a fixed order so rows don't jump while you plan.
  const focus = useMemo(() => mine.map((e) => { const r = runoffTally(g, E, e, null, null, false); return { cid: e.cid, d: Math.abs((e.runoff.a === me ? r.sa : r.sb) - 50) }; }).sort((a, b) => a.d - b.d).slice(0, 8).map((x) => x.cid), []);
  const rest = proj.filter((x) => !focus.includes(x.e.cid));
  const restWins = rest.filter((x) => x.r.winner === me).length;
  const toggle = (q, c) => {
    if (pacts[q]) { const n = { ...pacts }; delete n[q]; setPacts(n); return; }
    if (c == null || chosen.length >= 2 || g.pc - cost < c) return;
    setPacts({ ...pacts, [q]: true });
  };
  const bump = (cid, d) => {
    const v = (boosts[cid] || 0) + d;
    if (v < 0 || v > 2 || (d > 0 && used >= BOOSTS)) return;
    setBoosts({ ...boosts, [cid]: v });
  };
  return (
    <div className="flex flex-col gap-4 mt-3">
      <div className="flex items-center gap-3">
        <div className="cx-num text-4xl leading-none" style={{ color: SUN }}>{wins}<span className="t-muted text-xl">/{mine.length}</span></div>
        <div className="text-sm font-semibold leading-snug">{tt('runoffs you would win if the vote were today. Sign pacts and send your last volunteers to change that.', 'antrųjų turų laimėtumėte, jei balsuotų šiandien. Pasirašykite susitarimus ir pasiųskite paskutinius savanorius.')}</div>
      </div>
      <div>
        <div className="flex items-baseline justify-between"><span className="cx-kicker text-xs">{tt('Runoff pacts (max 2)', 'Antrojo turo susitarimai (iki 2)')}</span><span className="text-xs font-semibold t-muted">{tt(`Favours: ${g.pc - cost}`, `Ryšiai: ${g.pc - cost}`)}</span></div>
        <div className="text-xs t-muted mt-0.5 mb-2">{tt('Their voters back you where they are out of the race; yours back them in their runoffs. Partners also remember it in coalition talks.', 'Jų rinkėjai remia jus ten, kur jie iškrito; jūsiškiai remia juos jų antruosiuose turuose. Partneriai tai prisimins ir koalicijos derybose.')}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {cands.map(({ q, pot, c }) => {
            const on = !!pacts[q];
            return (
              <button key={q} type="button" onClick={() => toggle(q, c)} aria-pressed={on} disabled={!on && (c == null || chosen.length >= 2 || g.pc - cost < c)} className="rounded-xl p-2 flex items-center gap-2.5 text-left cx-tap disabled:opacity-45" style={{ background: on ? ACC_BG : 'rgba(255,255,255,.04)', border: `1px solid ${on ? 'rgba(245,165,36,.6)' : LINE}` }}>
                <Portrait who={q} size={38} square mood={on ? 'grin' : c == null ? 'grr' : 'ok'} />
                <div className="min-w-0 flex-1">
                  <div className="font-bold leading-tight">{partyShort(q)}</div>
                  <div className="text-xs t-muted">{tt(`${nf(pot, 0)} pts of voters in your races`, `${nf(pot, 0)} p. rinkėjų jūsų apygardose`)}</div>
                </div>
                <span className="text-xs font-bold shrink-0" style={{ color: c == null ? RED : on ? SUN : TEXT }}>{c == null ? tt('Refuses', 'Atsisako') : on ? tt('Signed', 'Pasirašyta') : tt(`${c} favour${c > 1 ? 's' : ''}`, `${c} ${plur(c, '', '', 'ryšys', 'ryšiai', 'ryšių')}`)}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="flex items-baseline justify-between"><span className="cx-kicker text-xs">{tt('Final push', 'Paskutinis spurtas')}</span><span className="text-xs font-semibold t-muted">{tt(`${BOOSTS - used} of ${BOOSTS} teams left`, `Liko ${BOOSTS - used} iš ${BOOSTS} komandų`)}</span></div>
        <div className="flex flex-col gap-1.5 mt-2">
          {focus.map((cid) => proj.find((x) => x.e.cid === cid)).map(({ e, r }) => {
            const mineA = e.runoff.a === me;
            const myS = mineA ? r.sa : r.sb;
            const opp = mineA ? e.runoff.b : e.runoff.a;
            return (
              <div key={e.cid} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(255,255,255,.04)', border: `1px solid ${LINE}` }}>
                <div className="min-w-0 flex-1"><div className="text-sm font-bold truncate">{consName(cnm(e.cid))}</div><div className="text-xs t-muted">{tt('vs', 'prieš')} {partyShort(opp)}</div></div>
                <span className="cx-num text-lg w-14 text-right" style={{ color: myS >= 50 ? GREEN : RED }}>{nf(myS, 0)}%</span>
                <button type="button" aria-label="−" onClick={() => bump(e.cid, -1)} className="cx-btn h-8 w-8" style={{ borderRadius: 999 }}>−</button>
                <span className="cx-num w-4 text-center">{boosts[e.cid] || 0}</span>
                <button type="button" aria-label="+" onClick={() => bump(e.cid, 1)} className="cx-btn h-8 w-8" style={{ borderRadius: 999 }}>+</button>
              </div>
            );
          })}
        </div>
        {rest.length > 0 && <div className="text-xs font-semibold mt-1.5">{tt(`Your other ${rest.length} runoffs: winning ${restWins}, losing ${rest.length - restWins}.`, `Kiti ${rest.length} jūsų antrieji turai: laimite ${restWins}, pralaimite ${rest.length - restWins}.`)}</div>}
        <div className="text-xs t-muted mt-1">{tt('Projections are close but not certain: the real count can swing a few points.', 'Prognozės artimos, bet ne tikslios: tikri rezultatai gali svyruoti keliais punktais.')}</div>
      </div>
      <Btn className="h-14 w-full text-lg" onClick={() => onConfirm(pacts, boosts)}>{tt('Run the runoffs', 'Vykdyti antrąjį turą')} <ArrowRight size={20} /></Btn>
    </div>
  );
}
function ElectionNight({ g, onFinish, onDeals }) {
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
  const liveMap = useMemo(() => Object.fromEntries(REGIONS.map((r) => {
    const R = E.regions[r.id];
    const tot = sum(ALL_IDS.map((q) => R.votes[q])) || 1;
    return [r.id, Object.fromEntries(ALL_IDS.map((q) => [q, (R.votes[q] / tot) * 100]))];
  })), [E]);
  const dealsPending = !E.dealsDone && E.smd.some((e) => e.round === 2 && (e.runoff.a === me || e.runoff.b === me));
  const skip = () => { setProg(1); if (dealsPending && (stage === 'count' || stage === 'intro')) { setStage('r1'); return; } setRo(runoffs.length); setStage('final'); };
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
    <div className="max-w-lg lg:max-w-6xl mx-auto min-h-screen lg:grid lg:grid-cols-2 lg:gap-x-6 lg:items-start" style={{ ...GUTTER, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
      <div className="pt-6 flex items-center justify-between gap-3 lg:col-span-2">
        <div>
          <div className="text-sm font-extrabold t-muted">{tt('Seimas election 2028', '2028 m. Seimo rinkimai')}</div>
          <h2 className="cx-title text-4xl leading-none">{stage === 'runoff' ? tt('Runoff day', 'Antrasis turas') : stage === 'final' ? tt('The results are in!', 'Rezultatai paaiškėjo!') : tt('Election night', 'Rinkimų naktis')}</h2>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="cx-chip px-3 py-1 cx-num text-lg">{stage === 'runoff' || stage === 'final' ? tt('Round 2', 'II turas') : clock}</span>
          {stage !== 'final' && stage !== 'intro' && <button type="button" onClick={skip} className="text-sm font-extrabold underline inline-flex items-center gap-1 h-9">{tt('Skip to results', 'Iškart į rezultatus')} <SkipForward size={15} /></button>}
        </div>
      </div>
      <Scene kind="night" h={104} className="mt-4 lg:col-span-2" caption={false}>
        <div className="absolute right-2 bottom-2"><Portrait who={me} size={50} badge mood={stage === 'final' ? (E.seats[me] >= 40 ? 'grin' : E.seats[me] >= 15 ? 'happy' : 'sad') : 'wow'} /></div>
      </Scene>
      {stage !== 'intro' && (
        <Card className="mt-4 overflow-hidden" style={{ background: MAP_SEA, padding: 6 }}>
          <CartoonMap shares={liveMap} sel={null} onSelect={() => {}} live={live.fr} />
          <div className="px-2 pb-1 text-xs font-extrabold t-muted">{tt(`Counted: ${fmtPct(live.counted * 100, 0)} · grey = not counted yet`, `Suskaičiuota: ${fmtPct(live.counted * 100, 0)} · pilka – dar neskaičiuota`)}</div>
        </Card>
      )}
      {stage === 'intro' && (
        <Card className="mt-4 p-4 cx-cream sbl-pop">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center rounded-2xl shrink-0" style={{ width: 56, height: 56, background: PANEL2, border: `1px solid ${LINE}` }}><WIcon size={30} strokeWidth={2.4} /></span>
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
          <div className="cx-title text-2xl leading-tight">{dealsPending ? tt('Between the rounds', 'Tarp turų') : tt('Round one done!', 'Pirmasis turas baigtas!')}</div>
          <p className="font-semibold mt-1">{tt(`Only ${r1.length} of 71 local districts picked a winner outright. The other ${runoffs.length} go to a runoff between the top two. You’re in ${myRunoffs.length} of them.`, `Tik ${r1.length} iš 71 apygardos išrinko nugalėtoją iš karto. Likusiose ${runoffs.length} vyks antrasis turas tarp dviejų lyderių. Jūsų kandidatai – ${myRunoffs.length} iš jų.`)}</p>
          {dealsPending
            ? <RunoffDeals g={g} onConfirm={(pacts, boosts) => { onDeals(pacts, boosts); setStage('runoff'); }} />
            : <Btn className="h-14 w-full text-lg mt-3" onClick={() => setStage('runoff')}>{tt('Run the runoffs', 'Vykdyti antrąjį turą')} <ArrowRight size={20} /></Btn>}
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
          <NewSeimasButton />
          <Btn kind="pale" className="h-12 w-full" onClick={() => setShowAll(!showAll)}>{showAll ? tt('Hide the 71 districts', 'Slėpti 71 apygardą') : tt('Show all 71 local districts', 'Rodyti visas 71 apygardą')}</Btn>
          {showAll && (
            <ul className="flex flex-col gap-2">
              {E.smd.map((e) => (e.round === 2 ? <RunoffRow key={e.cid} e={e} me={me} /> : (
                <li key={e.cid} className="rounded-2xl px-3 py-2 flex items-center gap-2 cx-panel2" style={{ border: `1px solid ${LINE}` }}>
                  <PartyDot p={e.winner} size={12} /><span className="font-black flex-1 min-w-0 truncate">{cnum(e.cid)}. {cnm(e.cid)} <span className="font-semibold t-muted">· {(candOf(g, e.cid, e.winner) || {}).name || ''}</span></span>
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
  return (
    <div className="max-w-lg lg:max-w-5xl mx-auto min-h-screen" style={{ ...GUTTER, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 190px)' }}>
      <div className="pt-6">
        <h2 className="cx-title text-4xl leading-none">{tt('Build your coalition', 'Burkite koaliciją')}</h2>
        <p className="font-semibold t-muted mt-1">{tt('Invite parties until your team has 71 seats. Everyone you invite has to be happy to join.', 'Kvieskite partijas, kol komanda turės 71 mandatą. Visi pakviestieji turi norėti prisijungti.')}</p>
      </div>
      {!tip && <Coach essential className="mt-4" title={tt('This will be tough', 'Bus sunku')}>{tt('No team that includes you reaches 71 easily. You could join the winners as a junior partner, or go into opposition.', 'Jokia koalicija su jumis lengvai nesurenka 71. Galite prisijungti prie nugalėtojų kaip jaunesnysis partneris arba likti opozicijoje.')}</Coach>}
      <Card className="mt-4 p-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm font-extrabold t-muted">{tt('Your team', 'Jūsų komanda')}</div>
            <div className="cx-num text-4xl leading-none">{total}<span className="text-lg t-muted"> / 71</span></div>
          </div>
          <span className="cx-chip px-3 py-1 text-sm" style={{ background: total >= MAJORITY ? GOOD_BG : WARN_BG }}>{total >= MAJORITY ? tt('Majority!', 'Dauguma!') : tt(`${MAJORITY - total} more`, `Trūksta ${MAJORITY - total}`)}</span>
        </div>
        <div className="relative flex mt-3 overflow-hidden rounded-full" style={{ height: 22, border: `1px solid ${LINE}`, background: LINE }}>
          {members.map((p) => <div key={p} style={{ width: `${(S[p] / 141) * 100}%`, background: PARTIES[p].color, borderRight: `1px solid ${LINE}` }} />)}
          <div className="absolute top-0 bottom-0" style={{ left: `${(MAJORITY / 141) * 100}%`, width: 3, background: INK }} />
        </div>
        {C.partners.length > 0 && (
          <>
            <div className="mt-3 flex items-center gap-2 font-extrabold"><Mood w={stab} size={24} /><span style={{ color: harmony[1] }}>{harmony[0]}</span><span className="t-muted text-sm ml-auto">{tt('Harmony', 'Darna')} {stab}/100</span></div>
            <div className="mt-3">
              <div className="text-xs font-extrabold t-muted mb-1.5">{tt('Who runs which ministry (14)', 'Kas vadovaus ministerijoms (14)')}</div>
              <div className="flex flex-wrap gap-1.5">
                {members.filter((p) => p !== 'KITI').flatMap((p) => cab.alloc[p].map((m) => <span key={m} className="text-xs font-bold rounded-full px-2 py-0.5 inline-flex items-center gap-1 cx-panel2" style={{ border: `1px solid ${LINE}` }}><PartyDot p={p} size={9} />{L(MINISTRIES[m])}</span>))}
              </div>
            </div>
          </>
        )}
      </Card>
      <div className="mt-4 flex flex-col gap-3 lg:grid lg:grid-cols-2">
        <h3 className="cx-title text-2xl lg:col-span-2">{tt('Parties in the new Seimas', 'Naujojo Seimo partijos')}</h3>
        {sorted.map((p) => {
          const P = PARTIES[p];
          const inC = C.partners.includes(p);
          const w = will[p];
          const mood = w >= 65 ? tt('Keen to join', 'Mielai prisijungs') : w >= 50 ? tt('Willing', 'Sutinka') : w >= 35 ? tt('Not sure', 'Abejoja') : tt('Says no', 'Atsisako');
          const clashes = C.partners.filter((q) => q !== p && compat(g, p, q) < 25);
          return (
            <div key={p} className="rounded-xl p-3" style={{ background: `linear-gradient(90deg, ${tint(P.color, 0.45)}, ${tint(P.color, 0.82)})`, border: `1px solid ${inC ? SUN : LINE}`, borderLeft: `4px solid ${P.color}`, boxShadow: inC ? `0 0 0 2px ${SUN}, ${SHADOW}` : SHADOW }}>
              <div className="flex items-center gap-3">
                <Portrait who={p} size={56} badge mood={w >= 65 ? 'grin' : w >= 50 ? 'happy' : w >= 35 ? 'ok' : 'grr'} />
                <div className="min-w-0 flex-1">
                  <div className="cx-title text-lg leading-tight truncate">{p === 'KITI' ? tt('Independents', 'Nepriklausomi') : P.short} <span className="cx-num text-base t-muted">· {S[p]}</span></div>
                  {P.leader && <div className="text-xs font-bold t-muted truncate">{P.leader}</div>}
                  <div className="inline-flex items-center gap-1.5 text-sm font-extrabold"><Mood w={w} size={18} />{mood}</div>
                </div>
                <Btn kind={inC ? 'white' : 'sun'} className="h-11 px-4 text-sm shrink-0" onClick={() => toggle(p)}>{inC ? tt('Remove', 'Pašalinti') : tt('Invite', 'Kviesti')}</Btn>
              </div>
              <div className="mt-2.5"><Bar value={w} color={w >= 50 ? '#4ADE80' : w >= 35 ? SUN : '#F87171'} mark={50} h={14} /></div>
              <div className="text-xs font-extrabold t-muted mt-1">{tt(`Happiness ${w}/100 · needs 50 to join`, `Noras ${w}/100 · reikia 50`)}</div>
              <div className="mt-2 text-sm font-semibold"><span className="font-black">{tt('They want:', 'Jie nori:')} </span>{L(DEMANDS[p].text)}</div>
              {sizePenalty(g, p) > 0 && <div className="mt-1.5 text-sm font-extrabold flex items-center gap-1.5" style={{ color: AMBER }}><Crown size={15} className="shrink-0" />{tt(`They are bigger than you and want the PM job themselves (−${sizePenalty(g, p)})`, `Jie didesni už jus ir patys nori premjero posto (−${sizePenalty(g, p)})`)}</div>}
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
      <div className="fixed bottom-0 inset-x-0 z-20" style={{ background: PANEL2, borderTop: `1px solid ${LINE}`, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
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
    <div className="max-w-lg lg:max-w-4xl mx-auto min-h-screen" style={{ ...GUTTER, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
      <div className="pt-6">
        <div className="text-sm font-extrabold t-muted">{tt('Seimas plenary hall', 'Seimo plenarinių posėdžių salė')}</div>
        <h2 className="cx-title text-4xl leading-none">{tt('The confidence vote', 'Balsavimas dėl Premjero')}</h2>
        <Scene kind="seimas" h={110} className="mt-3" caption={false}>
          <div className="absolute right-2 bottom-2"><Portrait who={g.player} size={52} badge mood={done ? (V.passed ? 'grin' : 'sad') : 'ok'} /></div>
        </Scene>
        <p className="font-semibold mt-2">{tt(`The President has nominated you, leader of ${P.short}, as Prime Minister. Now the Seimas votes.`, `Prezidentas pateikė jūsų, ${P.short} lyderio, kandidatūrą į Ministrus Pirmininkus. Dabar balsuoja Seimas.`)}</p>
      </div>
      <Card className="mt-4 p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[[tt('For', 'Už'), ayes, '#4ADE80'], [tt('Against', 'Prieš'), noes, '#F87171'], [tt('Abstain', 'Susilaikė'), abst, LINE]].map(([l, v, c]) => (
            <div key={l} className="rounded-2xl p-3" style={{ background: c, border: `1px solid ${LINE}`, color: c === LINE ? TEXT : '#0B0E14' }}>
              <div className="cx-num text-4xl leading-none">{v}</div>
              <div className="text-sm font-black mt-1">{l}</div>
            </div>
          ))}
        </div>
        <div className="mt-4"><Bar value={ayes} max={141} color="#4ADE80" mark={71} h={22} /></div>
        <div className="text-xs font-extrabold t-muted mt-1">{tt('More votes for than against are needed.', 'Reikia daugiau balsų „už“ nei „prieš“.')}</div>
      </Card>
      {done && (
        <Card className="mt-4 p-4 sbl-pop" style={{ background: V.passed ? GOOD_BG : BAD_BG }}>
          <ResultBanner ok={V.passed} title={V.passed ? tt('Approved!', 'Pritarta!') : tt('Rejected!', 'Atmesta!')} sub={V.passed ? tt('You are Prime Minister.', 'Jūs – Ministras Pirmininkas.') : tt('Rebels sank your nomination.', 'Maištininkai paskandino jūsų kandidatūrą.')} />
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
function AchievementsWon({ g }) {
  const [res] = useState(() => {
    const prev = loadAch();
    const got = earnedAchievements(g);
    saveAch([...new Set([...prev, ...got])]);
    return { got, fresh: got.filter((x) => !prev.includes(x)) };
  });
  if (!res.got.length) return null;
  return (
    <section className="cx-card p-4 mt-4 lg:col-span-2">
      <CardTitle sub={tt(`${res.got.length} earned this campaign · ${loadAch().length} of ${ACHIEVEMENTS.length} overall`, `Šioje kampanijoje: ${res.got.length} · iš viso ${loadAch().length} iš ${ACHIEVEMENTS.length}`)}>{tt('Achievements', 'Pasiekimai')}</CardTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {res.got.map((id) => {
          const A = ACHIEVEMENTS.find((x) => x.id === id);
          return (
            <div key={id} className="rounded-xl p-2.5 flex items-center gap-2.5" style={{ background: ACC_BG, border: '1px solid rgba(245,165,36,.4)' }}>
              <Trophy size={22} color={SUN} className="shrink-0" />
              <div className="min-w-0"><div className="font-bold leading-tight">{L(A.name)}{res.fresh.includes(id) && <span className="ml-1.5 cx-pill text-[10px] px-1.5 align-middle">{tt('NEW', 'NAUJA')}</span>}</div><div className="text-xs t-muted">{L(A.desc)}</div></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
function AchievementsSheet({ onClose }) {
  const got = loadAch();
  return (
    <Sheet onClose={onClose} label={tt('Achievements', 'Pasiekimai')}>
      <SheetHead kicker={tt(`${got.length} of ${ACHIEVEMENTS.length}`, `${got.length} iš ${ACHIEVEMENTS.length}`)} title={tt('Achievements', 'Pasiekimai')} onClose={onClose} />
      <div style={GUTTER} className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ACHIEVEMENTS.map((A) => {
          const on = got.includes(A.id);
          return (
            <div key={A.id} className="rounded-xl p-2.5 flex items-center gap-2.5" style={{ background: on ? ACC_BG : 'rgba(255,255,255,.04)', border: `1px solid ${on ? 'rgba(245,165,36,.4)' : LINE}`, opacity: on ? 1 : 0.6 }}>
              <Trophy size={22} color={on ? SUN : MUTED} className="shrink-0" />
              <div className="min-w-0"><div className="font-bold leading-tight">{L(A.name)}</div><div className="text-xs t-muted">{L(A.desc)}</div></div>
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}
function ResultScreen({ g, onRestart }) {
  const E = g.election;
  const R = g.result;
  const me = g.player;
  const P = PARTIES[me];
  const [grade, title, blurb] = gradeOf(g);
  const gov = R.kind === 'majority' ? [me] : R.kind === 'pm' ? [me, ...R.partners] : R.kind === 'failed' ? [] : R.members || [];
  const deb = g.stats.debates;
  const medal = { S: '#FDB913', A: '#FDB913', B: '#CBD5E1', C: '#E8A46B', D: '#BFDBFE', E: BAD_BG, F: BAD_BG }[grade];
  return (
    <div className="max-w-lg lg:max-w-6xl mx-auto min-h-screen lg:grid lg:grid-cols-2 lg:gap-x-6 lg:items-start" style={{ ...GUTTER, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
      {['S', 'A', 'B'].includes(grade) && <Confetti />}
      <div className="pt-6 flex flex-col items-center text-center lg:col-span-2">
        <Scene kind={['S', 'A', 'B', 'C'].includes(grade) ? 'palace' : 'seimas'} h={null} className="w-full h-[150px] lg:h-[230px]" caption={false} kb>
          <div className="absolute inset-x-0 bottom-2 flex justify-center"><Portrait who={me} size={92} badge mood={['S', 'A', 'B'].includes(grade) ? 'grin' : grade === 'C' || grade === 'D' ? 'ok' : 'sad'} /></div>
          <div className="absolute right-2 top-2 sbl-pop">
            <div className="grid place-items-center rounded-full" style={{ width: 70, height: 70, background: medal, border: '3px solid rgba(255,255,255,.85)', boxShadow: SHADOW, color: '#14100A' }}><span className="cx-title" style={{ fontSize: 38, lineHeight: 1 }}>{grade}</span></div>
            {['S', 'A', 'B'].includes(grade) && <Medal size={26} className="absolute -bottom-2 -right-2" style={{ fill: '#fff' }} strokeWidth={2.4} />}
          </div>
        </Scene>
        <div className="text-sm font-extrabold t-muted mt-4">{P.short} · {P.leader}</div>
        <h2 className="cx-title text-4xl leading-none mt-1">{title}</h2>
        <p className="font-semibold mt-3 leading-relaxed">{blurb}</p>
      </div>
      <AchievementsWon g={g} />
      {g.vote && (
        <div className="mt-4 cx-soft p-3 text-sm font-bold text-center lg:col-span-2">{tt('Seimas vote:', 'Seimo balsavimas:')} <span className="cx-num">{g.vote.ayes}</span> {tt('for', 'už')} · <span className="cx-num">{g.vote.noes}</span> {tt('against', 'prieš')} · <span className="cx-num">{g.vote.abst}</span> {tt('abstained', 'susilaikė')}</div>
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
        ].map(([l, v]) => <div key={l} className="cx-card p-3" style={{ boxShadow: SHADOW }}><div className="text-xs font-extrabold t-muted">{l}</div><div className="cx-num text-2xl">{v}</div></div>)}
      </div>
      <div className="mt-4 lg:col-span-2"><NewSeimasButton /></div>
      <Chronicle g={g} />
      <Card className="mt-4 p-4"><CardTitle>{tt('Final Seimas', 'Naujasis Seimas')}</CardTitle><SeatTable seats={E.seats} pr={E.pr} smd={E.smdSeats} highlight={me} /></Card>
      <Btn className="h-16 text-xl w-full mt-5 lg:col-span-2" onClick={onRestart}><RotateCcw size={22} />{tt('Play again', 'Žaisti dar kartą')}</Btn>
    </div>
  );
}

/* ============================================================
   Toast, queue & root
   ============================================================ */
function Toast({ t, wideToast }) {
  const bad = t.ok === false || t.tone === 'bad';
  const edge = bad ? RED : t.tone === 'warn' ? AMBER : GREEN;
  return (
    <div className="fixed inset-x-0 z-50 pointer-events-none flex justify-center" style={{ bottom: wideToast ? 52 : 'calc(env(safe-area-inset-bottom, 0px) + 140px)', ...GUTTER }} role="status" aria-live="polite">
      <div key={t.id} className="sbl-toast max-w-md w-full rounded-xl px-4 py-3 font-bold" style={{ background: 'rgba(12,15,21,.94)', color: TEXT, border: `1px solid ${LINE2}`, borderLeft: `4px solid ${edge}`, boxShadow: '0 14px 34px rgba(0,0,0,.5)', backdropFilter: 'blur(6px)' }}>{t.msg}</div>
    </div>
  );
}
function QueueModal({ g, item, act, nat, proj }) {
  const shift = () => act((gg) => { if (gg.queue[0] && gg.queue[0].type === 'report' && gg.tut === 5) gg.tut = 99; gg.queue.shift(); return null; });
  if (item.type === 'brief') return <WelcomeModal g={g} nat={nat} proj={proj} onStart={() => act((gg) => { gg.tut = 1; gg.queue.shift(); return null; })} onSkip={() => act((gg) => { gg.tut = 99; gg.queue.shift(); return null; })} />;
  if (item.type === 'report') return <ReportModal g={g} item={item} onClose={shift} />;
  if (item.type === 'event') return <EventModal g={g} item={item} onChoose={(i) => act((gg) => { resolveEvent(gg, i); return null; })} onClose={shift} />;
  if (item.type === 'encounter') return <EncounterModal g={g} item={item} onChoose={(i) => act((gg) => { resolveEncounter(gg, i); return null; })} onClose={shift} />;
  if (item.type === 'debate') return <DebateBroadcast key={`d${item.id}`} g={g} item={item} onFinish={(picks) => act((gg) => { gg.queue[0].done = resolveDebate(gg, item.id, picks); return null; })} onClose={shift} />;
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
  const [fx, setFx] = useState(null);
  const [subs, setSubs] = useState({ map: 'week', hq: 'media', polls: 'seats' });
  const setSubFor = (k) => (v) => setSubs((s) => ({ ...s, [k]: v }));
  const [finder, setFinder] = useState(false);
  const [gotvOpen, setGotvOpen] = useState(false);
  const [distOpen, setDistOpen] = useState(null);
  const [candOpen, setCandOpen] = useState(null);
  const [membersOpen, setMembersOpen] = useState(null);
  const nav = useMemo(() => ({
    openDistrict: (cid) => { setCandOpen(null); setDistOpen(cid); SFX.play('tap'); },
    openCand: (cid, p) => { setCandOpen({ cid, p }); SFX.play('tap'); },
    openMembers: (kind) => { setMembersOpen(kind); SFX.play('tap'); },
  }), []);
  const fxTimer = useRef(null);
  const wide = useWide();
  const gameRef = useRef(game);
  gameRef.current = game;
  ADVISOR = !game || game.advisor !== false;
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
    SFX.play(res.ok === false || res.tone === 'bad' ? 'bad' : 'pop');
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
    };
  }, [game, lang]);
  const goTab = (t) => { setTab(t); try { window.scrollTo({ top: 0 }); } catch (e) { /* ignore */ } };
  const openRegion = (rid) => { setSel(rid); if (gameRef.current && gameRef.current.tut === 1) act((g) => { g.tut = 2; return null; }); };
  const closeRegion = () => { setSel(null); const g0 = gameRef.current; if (g0 && g0.tut === 2) act((g) => { g.tut = 1; return null; }); };
  const skipTips = () => act((g) => { g.tut = 99; return null; });
  const openSheet = (name) => setSheet(name);
  const goFind = (d) => {
    setFinder(false); setSel(null);
    if (d.help) { setHelp(true); return; }
    if (d.members) { setMembersOpen(d.members); return; }
    if (d.sheet) { setSheet(d.sheet); return; }
    if (d.sub) setSubs((s) => ({ ...s, [d.tab]: d.sub }));
    goTab(d.tab);
  };
  const doEnd = (arg) => {
    const picks = Array.isArray(arg) ? arg : null;
    if (gameRef.current && gameRef.current.week >= WEEKS && !picks) { setConfirmEnd(false); setGotvOpen(true); return; }
    setConfirmEnd(false); setSel(null); setSheet(null); setGotvOpen(false);
    act((g) => { if (picks && picks.length) applyGotv(g, picks); endWeek(g); return null; });
    goTab('map');
  };

  const restart = () => { writeSave(null); setGame(null); gameRef.current = null; setSaved(null); setSel(null); setTab('map'); setScreen('select'); };

  let body;
  if (screen === 'select') {
    body = <PartySelect onBack={() => setScreen('title')} onPick={(pid, helper, diff, scen) => { const g = newGame(pid, helper, diff, scen); gameRef.current = g; setGame(g); setTab('map'); setSel(null); setScreen('game'); try { window.scrollTo({ top: 0 }); } catch (e) { /* ignore */ } }} />;
  } else if (screen === 'title' || !game) {
    body = <TitleScreen lang={lang} setLang={setLang} saved={saved} onNew={() => { setScreen('select'); try { window.scrollTo({ top: 0 }); } catch (e) { /* ignore */ } }} onContinue={() => { gameRef.current = saved; setGame(saved); setScreen('game'); try { window.scrollTo({ top: 0 }); } catch (e) { /* ignore */ } }} />;
  } else if (game.phase === 'campaign' && derived) {
    const { shares, nat, proj } = derived;
    const glowEnd = game.tut === 4 || (game.ap === 0 && game.tut >= 5);
    const onEnd = () => (game.ap > 0 ? setConfirmEnd(true) : doEnd());
    const tabBody = (
      <>
        {tab === 'map' && <MapTab g={game} shares={shares} proj={proj} sel={sel} onSelect={openRegion} skipTips={skipTips} wide={wide} act={act} fx={fx} sub={subs.map} setSub={setSubFor('map')} />}
        {tab === 'polls' && <PollsTab g={game} nat={nat} proj={proj} sub={subs.polls} setSub={setSubFor('polls')} />}
        {tab === 'hq' && <HQTab g={game} act={act} openSheet={openSheet} sub={subs.hq} setSub={setSubFor('hq')} />}
        {tab === 'news' && <NewsTab g={game} wide={wide} />}
      </>
    );
    const drawer = sel && <RegionDrawer g={game} rid={sel} proj={proj} docked={wide} onClose={closeRegion} onAction={(rid, type) => { const g0 = gameRef.current; const first = g0.tut === 2; const b4 = regionShares(g0, REG[rid]); const res = act((g) => doRegionAction(g, rid, type)); if (res && res.ok) { const af = regionShares(gameRef.current, REG[rid]); const me = g0.player; let d = af[me] - b4[me], who = me; if (type === 'attack') { const drop = PARTY_IDS.filter((q) => q !== me).map((q) => [q, af[q] - b4[q]]).sort((x, y) => x[1] - y[1])[0]; if (drop && drop[1] < d) { d = drop[1]; who = drop[0]; } } setFx({ rid, d, who, n: Date.now() }); clearTimeout(fxTimer.current); fxTimer.current = setTimeout(() => setFx(null), 2400); } if (first && !wide) setSel(null); }} onTravel={(rid) => act((g) => travel(g, rid))} tutStep={game.tut} onSkipTips={skipTips} />;
    body = wide ? (
      <>
        <DesktopHud g={game} proj={proj} onHelp={() => setHelp(true)} lang={lang} setLang={setLang} onEnd={onEnd} glowEnd={glowEnd} onFind={() => setFinder(true)} />
        <div className="grid gap-5 px-5 pt-1" style={{ gridTemplateColumns: '84px minmax(0, 1fr) 410px', paddingBottom: 56 }}>
          <div className="pt-4"><NavRail tab={tab} setTab={goTab} /></div>
          <main key={tab} className="min-w-0 pb-4 cx-tabin">{tabBody}</main>
          <aside className="min-w-0 pt-4">{drawer || <SidePanel g={game} shares={shares} onSelect={openRegion} act={act} />}</aside>
        </div>
        <div className="fixed bottom-0 inset-x-0 z-30"><NewsTicker g={game} /></div>
        {sheet === 'casino' && <CasinoSheet g={game} act={act} onClose={() => setSheet(null)} />}
        {sheet === 'bet' && <BetSheet g={game} act={act} onClose={() => setSheet(null)} />}
        {sheet === 'kompro' && <KomproSheet g={game} act={act} onClose={() => setSheet(null)} />}
        {sheet === 'ads' && <AdStudioSheet g={game} onLaunch={(spec) => { setSheet(null); act((g) => launchAd(g, spec)); SFX.play('sting'); }} onClose={() => setSheet(null)} />}
        {sheet === 'presser' && <PressSheet g={game} onDone={(picks) => { setSheet(null); act((g) => resolvePresser(g, picks)); }} onClose={() => setSheet(null)} />}
        {confirmEnd && <ConfirmEnd g={game} onCancel={() => setConfirmEnd(false)} onConfirm={doEnd} />}
        {help && <HelpSheet onClose={() => setHelp(false)} />}
        {gotvOpen && <GotvSheet g={game} onDone={(p) => doEnd(p)} onClose={() => setGotvOpen(false)} />}
        {finder && <FinderSheet wide={wide} onClose={() => setFinder(false)} onGo={goFind} />}
        {game.queue.length > 0 && <QueueModal g={game} item={game.queue[0]} act={act} nat={nat} proj={proj} />}
      </>
    ) : (
      <>
        <Header g={game} proj={proj} onHelp={() => setHelp(true)} lang={lang} setLang={setLang} onFind={() => setFinder(true)} />
        <main key={tab} className="max-w-lg mx-auto cx-tabin" style={{ ...GUTTER, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 150px)' }}>{tabBody}</main>
        <BottomNav tab={tab} setTab={goTab} g={game} glowEnd={glowEnd} onEnd={onEnd} />
        {drawer}
        {sheet === 'casino' && <CasinoSheet g={game} act={act} onClose={() => setSheet(null)} />}
        {sheet === 'bet' && <BetSheet g={game} act={act} onClose={() => setSheet(null)} />}
        {sheet === 'kompro' && <KomproSheet g={game} act={act} onClose={() => setSheet(null)} />}
        {sheet === 'ads' && <AdStudioSheet g={game} onLaunch={(spec) => { setSheet(null); act((g) => launchAd(g, spec)); SFX.play('sting'); }} onClose={() => setSheet(null)} />}
        {sheet === 'presser' && <PressSheet g={game} onDone={(picks) => { setSheet(null); act((g) => resolvePresser(g, picks)); }} onClose={() => setSheet(null)} />}
        {confirmEnd && <ConfirmEnd g={game} onCancel={() => setConfirmEnd(false)} onConfirm={doEnd} />}
        {help && <HelpSheet onClose={() => setHelp(false)} />}
        {gotvOpen && <GotvSheet g={game} onDone={(p) => doEnd(p)} onClose={() => setGotvOpen(false)} />}
        {finder && <FinderSheet wide={wide} onClose={() => setFinder(false)} onGo={goFind} />}
        {game.queue.length > 0 && <QueueModal g={game} item={game.queue[0]} act={act} nat={nat} proj={proj} />}
      </>
    );
  } else if (game.phase === 'night') {
    body = (
      <ElectionNight
        key={`night-${game.seed}`}
        g={game}
        onDeals={(pacts, boosts) => act((g) => { applyRunoffDeals(g, pacts, boosts); return null; })}
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
      <Backdrop kind={screen !== 'game' || !game ? 'night' : game.phase === 'campaign' ? 'seimas' : game.phase === 'result' || game.phase === 'vote' ? 'palace' : 'night'} />
      <NavCtx.Provider value={nav}>
      {body}
      {game && distOpen && !candOpen && <DistrictSheet g={game} cid={distOpen} act={act} onClose={() => setDistOpen(null)} />}
      {game && candOpen && <CandidateSheet g={game} cid={candOpen.cid} p={candOpen.p} onClose={() => { setCandOpen(null); setDistOpen(null); }} onBack={distOpen ? () => setCandOpen(null) : null} />}
      {game && membersOpen && !candOpen && <MembersSheet g={game} kind={membersOpen} onClose={() => setMembersOpen(null)} />}
      </NavCtx.Provider>
      {toast && <Toast t={toast} wideToast={wide} />}
      <div id="sbl-portal" />
    </div>
  );
}
