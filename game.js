'use strict';

/* ============================================================
   GRL Transport — strategiskt planeringsspel
   Vanilla JS, inga beroenden. Symboler: game-icons.net (CC BY 3.0)
   ============================================================ */

const VERSION = '1.0.0';

const CHANGELOG = [
  {
    version: '1.0.0',
    date: '2026-07-28',
    items: [
      '10 nivåer med leveransuppdrag av ökande svårighet.',
      'Kartvy: tryck på platser för att köa stopp, ordna om och ta bort.',
      'Resurser: batteri, förarens energi och mat — planera laddning, sömn och matstopp.',
      'Butik med uppgraderingar: större batteri, snabbladdning, större flak, termos och kylbox.',
      'Pengar och sparning: framsteg sparas automatiskt i webbläsaren.',
      'Symboler från game-icons.net, dubbelklickszoom och textmarkering avstängt för mobil.'
    ]
  }
];

/* ---------- Värld & vägnät ---------- */

const W = 960, H = 640;
const GRID_X = [90, 300, 510, 720, 880];
const GRID_Y = [90, 250, 410, 560];

function nodeKey(x, y) { return x + ',' + y; }

const graph = {}; // key -> [{key, dist}]
(function buildGraph() {
  for (const x of GRID_X) for (const y of GRID_Y) graph[nodeKey(x, y)] = [];
  for (let i = 0; i < GRID_X.length; i++) {
    for (let j = 0; j < GRID_Y.length; j++) {
      const a = nodeKey(GRID_X[i], GRID_Y[j]);
      if (i + 1 < GRID_X.length) {
        const b = nodeKey(GRID_X[i + 1], GRID_Y[j]);
        const d = GRID_X[i + 1] - GRID_X[i];
        graph[a].push({ key: b, dist: d });
        graph[b].push({ key: a, dist: d });
      }
      if (j + 1 < GRID_Y.length) {
        const b = nodeKey(GRID_X[i], GRID_Y[j + 1]);
        const d = GRID_Y[j + 1] - GRID_Y[j];
        graph[a].push({ key: b, dist: d });
        graph[b].push({ key: a, dist: d });
      }
    }
  }
})();

function shortestPath(fromKey, toKey) {
  if (fromKey === toKey) return { path: [fromKey], dist: 0 };
  const dist = {}, prev = {}, visited = {};
  for (const k in graph) dist[k] = Infinity;
  dist[fromKey] = 0;
  while (true) {
    let cur = null, best = Infinity;
    for (const k in graph) {
      if (!visited[k] && dist[k] < best) { best = dist[k]; cur = k; }
    }
    if (cur === null || cur === toKey) break;
    visited[cur] = true;
    for (const e of graph[cur]) {
      const nd = dist[cur] + e.dist;
      if (nd < dist[e.key]) { dist[e.key] = nd; prev[e.key] = cur; }
    }
  }
  const path = [];
  let k = toKey;
  while (k) { path.unshift(k); k = prev[k]; }
  return { path, dist: dist[toKey] };
}

function keyToPoint(k) {
  const [x, y] = k.split(',').map(Number);
  return { x, y };
}

/* ---------- Platser ---------- */

const LOCATIONS = {
  depot:    { id: 'depot',    name: 'Depån',            icon: 'house',   color: '#f6b93b', x: 90,  y: 560 },
  rosen:    { id: 'rosen',    name: 'Restaurang Rosen', icon: 'chef',    color: '#e57fa3', x: 510, y: 90 },
  masen:    { id: 'masen',    name: 'Restaurang Måsen', icon: 'chef',    color: '#8fd3f4', x: 880, y: 250 },
  eken:     { id: 'eken',     name: 'Restaurang Eken',  icon: 'chef',    color: '#a3d977', x: 720, y: 560 },
  grossist: { id: 'grossist', name: 'Grossisten',       icon: 'crate',   color: '#c9a066', x: 300, y: 90 },
  laddNord: { id: 'laddNord', name: 'Laddstation Nord', icon: 'gasPump', color: '#57c26b', x: 300, y: 250, service: 'charge' },
  laddSyd:  { id: 'laddSyd',  name: 'Laddstation Syd',  icon: 'gasPump', color: '#57c26b', x: 510, y: 410, service: 'charge' },
  krog:     { id: 'krog',     name: 'Vägkrogen',        icon: 'burger',  color: '#f0913d', x: 90,  y: 250, service: 'eat' },
  motell:   { id: 'motell',   name: 'Motell Vilan',     icon: 'bed',     color: '#b18ae0', x: 880, y: 560, service: 'sleep' }
};

const SERVICE_TEXT = {
  charge: { doing: 'Laddar batteriet', queued: 'ladda batteriet', icon: 'charge' },
  eat:    { doing: 'Äter',             queued: 'ät',              icon: 'meal' },
  sleep:  { doing: 'Sover',            queued: 'sov',             icon: 'nightSleep' }
};

/* ---------- Nivåer ---------- */

const LEVELS = [
  {
    title: 'Första körningen',
    brief: 'Välkommen till GRL Transport! Hämta matlådan på Depån, leverera den till Restaurang Rosen och kör sedan tillbaka hem.',
    timeLimit: null, reward: 450,
    deliveries: [ { from: 'depot', to: 'rosen', label: 'Matlådor' } ],
    returnHome: true
  },
  {
    title: 'Två beställningar',
    brief: 'Två restauranger väntar på varor från Depån. Flaket rymmer bara en last i taget, så planera rutten klokt.',
    timeLimit: 70, reward: 550,
    deliveries: [
      { from: 'depot', to: 'rosen', label: 'Grönsaker' },
      { from: 'depot', to: 'eken',  label: 'Färskt bröd' }
    ],
    returnHome: true
  },
  {
    title: 'Grossistens varor',
    brief: 'Grossisten har varor som ska ut till stan. Håll ett öga på batteriet — det kan behövas ett laddstopp på vägen.',
    timeLimit: 90, reward: 650,
    deliveries: [
      { from: 'grossist', to: 'masen', label: 'Fiskleverans' },
      { from: 'grossist', to: 'rosen', label: 'Kryddor' }
    ],
    returnHome: true
  },
  {
    title: 'Lunchrusningen',
    brief: 'Alla tre restauranger behöver varor före lunch. Klockan tickar!',
    timeLimit: 110, reward: 800,
    deliveries: [
      { from: 'depot', to: 'rosen', label: 'Pastalådor' },
      { from: 'depot', to: 'eken',  label: 'Sallad' },
      { from: 'depot', to: 'masen', label: 'Räkor' }
    ],
    returnHome: true
  },
  {
    title: 'Långpasset',
    brief: 'Ett långt arbetspass med varor från Grossisten till hela stan. Glöm inte att äta och vila — en trött förare är en farlig förare.',
    timeLimit: 150, reward: 950,
    deliveries: [
      { from: 'grossist', to: 'rosen', label: 'Mjöl' },
      { from: 'grossist', to: 'eken',  label: 'Ost' },
      { from: 'grossist', to: 'masen', label: 'Oliver' }
    ],
    returnHome: true
  },
  {
    title: 'Dubbelbokat',
    brief: 'Två brådskande körningar från olika håll — en från Depån och en från Grossisten. Snäv tidsgräns!',
    timeLimit: 60, reward: 900,
    deliveries: [
      { from: 'depot',    to: 'masen', label: 'Cateringlåda' },
      { from: 'grossist', to: 'eken',  label: 'Drycker' }
    ],
    returnHome: true
  },
  {
    title: 'Fullt schema',
    brief: 'Beställningar från både Depån och Grossisten. Planera hämtningar och lämningar i rätt ordning.',
    timeLimit: 120, reward: 1100,
    deliveries: [
      { from: 'depot',    to: 'rosen', label: 'Porslin' },
      { from: 'depot',    to: 'eken',  label: 'Kött' },
      { from: 'grossist', to: 'masen', label: 'Grönsaker' }
    ],
    returnHome: true
  },
  {
    title: 'Storleveransen',
    brief: 'Grossisten tömmer lagret — fyra leveranser ska ut. Ett större flak gör livet lättare, annars blir det många vändor.',
    timeLimit: 170, reward: 1300,
    deliveries: [
      { from: 'grossist', to: 'rosen', label: 'Konserver' },
      { from: 'grossist', to: 'masen', label: 'Frukt' },
      { from: 'grossist', to: 'eken',  label: 'Kaffe' },
      { from: 'depot',    to: 'masen', label: 'Servetter' }
    ],
    returnHome: true
  },
  {
    title: 'Expressrundan',
    brief: 'Tre leveranser på rekordtid. Varje minut räknas — undvik onödiga omvägar.',
    timeLimit: 85, reward: 1500,
    deliveries: [
      { from: 'depot',    to: 'rosen', label: 'Tårtor' },
      { from: 'grossist', to: 'masen', label: 'Skaldjur' },
      { from: 'depot',    to: 'eken',  label: 'Glass' }
    ],
    returnHome: true
  },
  {
    title: 'Maratonrundan',
    brief: 'Sista uppdraget: fem leveranser över hela kartan. Använd allt du lärt dig — ladda, ät och sov i rätt läge.',
    timeLimit: 220, reward: 2000,
    deliveries: [
      { from: 'grossist', to: 'rosen', label: 'Mjölk' },
      { from: 'grossist', to: 'eken',  label: 'Ägg' },
      { from: 'depot',    to: 'masen', label: 'Blommor' },
      { from: 'depot',    to: 'rosen', label: 'Vin' },
      { from: 'grossist', to: 'masen', label: 'Choklad' }
    ],
    returnHome: true
  }
];

/* ---------- Uppgraderingar ---------- */

const UPGRADES = {
  batteryCap:  { name: 'Större batteri',  icon: 'batteryPack', desc: '+40 batterikapacitet per nivå.', costs: [500, 900, 1400] },
  chargeSpeed: { name: 'Snabbladdning',   icon: 'charge',      desc: 'Batteriet laddar dubbelt så snabbt per nivå.', costs: [400, 800] },
  cargo:       { name: 'Större flak',     icon: 'box',         desc: '+1 lastplats per nivå.', costs: [600, 1000, 1500] },
  thermos:     { name: 'Kaffetermos',     icon: 'coffee',      desc: 'Energin räcker 25 % längre per nivå.', costs: [450, 850] },
  coolbox:     { name: 'Kylbox',          icon: 'meal',        desc: 'Maten räcker 25 % längre per nivå.', costs: [350, 700] }
};

/* ---------- Balans ---------- */

const BAL = {
  truckSpeed: 130,          // px per verklig sekund (1x)
  minutesPerSecond: 1,      // spelminuter per verklig sekund (1x)
  batteryBase: 100,
  batteryPerUpgrade: 40,
  batteryDrainPer100px: 3.5,
  chargeRate: 5,            // batteri per spelminut (grundnivå)
  energyMax: 100,
  energyDrainDrive: 0.8,    // per spelminut vid körning
  energyDrainIdle: 0.35,
  sleepRate: 6,             // energi per spelminut
  foodMax: 100,
  foodDrain: 0.45,          // per spelminut
  eatRate: 12               // mat per spelminut
};

/* ---------- Sparning ---------- */

const SAVE_KEY = 'grl-transport-save';

function defaultSave() {
  return {
    level: 0,
    money: 0,
    upgrades: { batteryCap: 0, chargeSpeed: 0, cargo: 0, thermos: 0, coolbox: 0 },
    finished: false
  };
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const s = Object.assign(defaultSave(), JSON.parse(raw));
    s.upgrades = Object.assign(defaultSave().upgrades, s.upgrades);
    return s;
  } catch (e) {
    return defaultSave();
  }
}

function persist() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* privat läge m.m. */ }
}

let save = loadSave();

/* ---------- Speltillstånd ---------- */

const game = {
  levelIndex: save.level,
  running: false,
  speed: 1,
  clock: 0,           // spelminuter sedan start av nivån
  queue: [],          // [{locId, service}]
  deliveries: [],     // [{from,to,label,state:'waiting'|'carried'|'done'}]
  over: false,        // nivån avslutad (lyckad/misslyckad)
  truck: {
    x: LOCATIONS.depot.x, y: LOCATIONS.depot.y,
    atNode: nodeKey(LOCATIONS.depot.x, LOCATIONS.depot.y),
    path: [], pathIndex: 0,
    facing: 1,
    state: 'idle',    // idle | driving | charge | eat | sleep
    battery: 100, energy: 100, food: 100
  }
};

function batteryMax() { return BAL.batteryBase + save.upgrades.batteryCap * BAL.batteryPerUpgrade; }
function cargoMax() { return 1 + save.upgrades.cargo; }
function chargeRate() { return BAL.chargeRate * Math.pow(2, save.upgrades.chargeSpeed); }
function energyFactor() { return Math.pow(0.75, save.upgrades.thermos); }
function foodFactor() { return Math.pow(0.75, save.upgrades.coolbox); }

function currentLevel() { return LEVELS[game.levelIndex]; }
function carriedCount() { return game.deliveries.filter(d => d.state === 'carried').length; }

/* ---------- DOM-hjälpare ---------- */

const $ = sel => document.querySelector(sel);

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function iconSpan(name) { return '<span class="icon">' + ICONS[name] + '</span>'; }

document.querySelectorAll('[data-icon]').forEach(n => { n.innerHTML = ICONS[n.dataset.icon]; });
$('#brandIcon').innerHTML = ICONS.truck;

/* ---------- Ikonbilder för kartan ---------- */

const iconImageCache = {};
function iconImage(name, color) {
  const key = name + '|' + color;
  if (!iconImageCache[key]) {
    const svg = ICONS[name].replace('fill="currentColor"', 'fill="' + color + '"');
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    iconImageCache[key] = img;
  }
  return iconImageCache[key];
}

/* ---------- Toasts ---------- */

function toast(msg, icon) {
  const t = el('div', 'toast', (icon ? iconSpan(icon) + ' ' : '') + msg);
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), 3600);
}

/* ---------- Kö-logik ---------- */

function queueLocation(locId) {
  if (game.over) return;
  const loc = LOCATIONS[locId];
  const last = game.queue.length ? game.queue[game.queue.length - 1] : null;
  const lastLocId = last ? last.locId : destinationWhenIdle();
  if (lastLocId === locId && !(game.queue.length === 0 && game.truck.state !== 'idle')) {
    toast('Bilen är redan på väg dit.', 'marker');
    return;
  }
  game.queue.push({ locId, service: loc.service || null });
  toast('Tillagt: ' + loc.name, 'marker');
  renderQueue();
}

function destinationWhenIdle() {
  // Platsen bilen står på (eller är på väg mot) när kön är tom
  const t = game.truck;
  for (const id in LOCATIONS) {
    const L = LOCATIONS[id];
    if (nodeKey(L.x, L.y) === t.atNode && t.state !== 'driving') return id;
  }
  return null;
}

function removeQueueItem(index) {
  if (index === 0 && game.running && game.truck.state !== 'idle') {
    // Aktivt stopp: avbryt pågående aktivitet och fortsätt till nästa
    game.queue.shift();
    if (game.truck.state === 'driving') {
      game.truck.path = []; // stannar vid nästa nod
    } else {
      game.truck.state = 'idle';
    }
  } else {
    game.queue.splice(index, 1);
  }
  renderQueue();
}

function clearQueue() {
  game.queue = game.queue.slice(0, game.running && game.truck.state !== 'idle' ? 1 : 0);
  renderQueue();
}

/* ---------- Simulering ---------- */

function startDriveTo(locId) {
  const t = game.truck;
  const loc = LOCATIONS[locId];
  const { path } = shortestPath(t.atNode, nodeKey(loc.x, loc.y));
  t.path = path.map(keyToPoint);
  t.pathIndex = 0;
  t.state = 'driving';
}

function arriveAt(locId) {
  const t = game.truck;
  const loc = LOCATIONS[locId];
  t.atNode = nodeKey(loc.x, loc.y);
  t.x = loc.x; t.y = loc.y;

  // Lämna paket
  for (const d of game.deliveries) {
    if (d.state === 'carried' && d.to === locId) {
      d.state = 'done';
      toast(d.label + ' levererat till ' + loc.name + '!', 'check');
    }
  }
  // Hämta paket
  tryPickupAt(locId);

  const item = game.queue[0];
  if (item && item.locId === locId && item.service) {
    const s = item.service;
    const t2 = game.truck;
    const full =
      (s === 'charge' && t2.battery >= batteryMax() - 0.5) ||
      (s === 'eat' && t2.food >= BAL.foodMax - 0.5) ||
      (s === 'sleep' && t2.energy >= BAL.energyMax - 0.5);
    if (full) {
      toast('Redan fullt — inget att göra här.', 'check');
      game.queue.shift();
      t.state = 'idle';
    } else {
      t.state = s;
      toast(SERVICE_TEXT[s].doing + '…', SERVICE_TEXT[s].icon);
    }
  } else {
    if (item && item.locId === locId) game.queue.shift();
    t.state = 'idle';
  }
  renderQueue();
  renderObjectives();
  checkLevelComplete();
}

function tryPickupAt(locId) {
  for (const d of game.deliveries) {
    if (d.state === 'waiting' && d.from === locId) {
      if (carriedCount() < cargoMax()) {
        d.state = 'carried';
        toast(d.label + ' lastat (' + carriedCount() + '/' + cargoMax() + ').', 'box');
      } else {
        toast('Flaket är fullt — ' + d.label + ' fick inte plats.', 'cancel');
      }
    }
  }
}

function tick(dtReal) {
  if (!game.running || game.over) return;
  const dtMin = dtReal * BAL.minutesPerSecond * game.speed;
  const t = game.truck;

  game.clock += dtMin;

  // Starta nästa köade stopp
  if (t.state === 'idle' && game.queue.length) {
    const next = game.queue[0];
    const loc = LOCATIONS[next.locId];
    if (t.atNode === nodeKey(loc.x, loc.y)) {
      arriveAt(next.locId);
    } else {
      startDriveTo(next.locId);
      renderQueue();
    }
  }

  // Förflyttning
  if (t.state === 'driving') {
    let travel = BAL.truckSpeed * dtReal * game.speed;
    while (travel > 0 && t.pathIndex < t.path.length - 1) {
      const next = t.path[t.pathIndex + 1];
      const dx = next.x - t.x, dy = next.y - t.y;
      const segLen = Math.hypot(dx, dy);
      if (dx !== 0) t.facing = dx > 0 ? 1 : -1;
      const step = Math.min(travel, segLen);
      if (segLen > 0) {
        t.x += (dx / segLen) * step;
        t.y += (dy / segLen) * step;
      }
      t.battery -= (step / 100) * BAL.batteryDrainPer100px;
      travel -= step;
      if (step >= segLen - 0.001) {
        t.x = next.x; t.y = next.y;
        t.pathIndex++;
        t.atNode = nodeKey(next.x, next.y);
      }
    }
    if (t.pathIndex >= t.path.length - 1) {
      const item = game.queue[0];
      if (item) {
        const loc = LOCATIONS[item.locId];
        if (t.atNode === nodeKey(loc.x, loc.y)) {
          arriveAt(item.locId);
        } else {
          t.state = 'idle'; // stoppet togs bort under körning
        }
      } else {
        t.state = 'idle';
      }
    }
    if (t.battery <= 0) { t.battery = 0; return failLevel('Batteriet tog slut mitt på vägen. Bärgaren fick hämta bilen.', 'batteryPack'); }
  }

  // Tjänster
  if (t.state === 'charge') {
    t.battery = Math.min(batteryMax(), t.battery + chargeRate() * dtMin);
    if (t.battery >= batteryMax() - 0.01) { finishService('Batteriet fulladdat!', 'charge'); }
  } else if (t.state === 'eat') {
    t.food = Math.min(BAL.foodMax, t.food + BAL.eatRate * dtMin);
    if (t.food >= BAL.foodMax - 0.01) { finishService('Mätt och belåten!', 'meal'); }
  } else if (t.state === 'sleep') {
    t.energy = Math.min(BAL.energyMax, t.energy + BAL.sleepRate * dtMin);
    if (t.energy >= BAL.energyMax - 0.01) { finishService('Utsövd och pigg!', 'nightSleep'); }
  }

  // Förarens behov
  const energyDrain = (t.state === 'driving' ? BAL.energyDrainDrive : BAL.energyDrainIdle) * energyFactor();
  if (t.state !== 'sleep') t.energy -= energyDrain * dtMin;
  if (t.state !== 'eat') t.food -= BAL.foodDrain * foodFactor() * dtMin;

  if (t.energy <= 0) { t.energy = 0; return failLevel('Föraren somnade av utmattning. Sov på Motell Vilan innan energin tar slut.', 'nightSleep'); }
  if (t.food <= 0) { t.food = 0; return failLevel('Föraren svimmade av hunger. Stanna vid Vägkrogen och ät i tid.', 'meal'); }

  // Tidsgräns
  const lim = currentLevel().timeLimit;
  if (lim !== null && game.clock >= lim) {
    return failLevel('Tiden tog slut! Kunden hann tröttna på att vänta.', 'stopwatch');
  }

  renderStatus();
  checkLevelComplete();
}

function finishService(msg, icon) {
  toast(msg, icon);
  game.queue.shift();
  game.truck.state = 'idle';
  renderQueue();
}

function checkLevelComplete() {
  if (game.over || !game.running) return;
  const lvl = currentLevel();
  const allDone = game.deliveries.every(d => d.state === 'done');
  if (!allDone) return;
  if (lvl.returnHome) {
    const home = nodeKey(LOCATIONS.depot.x, LOCATIONS.depot.y);
    if (game.truck.atNode !== home || game.truck.state === 'driving') return;
  }
  completeLevel();
}

/* ---------- Nivåflöde ---------- */

function setupLevel() {
  const lvl = currentLevel();
  game.running = false;
  game.over = false;
  game.clock = 0;
  game.queue = [];
  game.deliveries = lvl.deliveries.map(d => ({ ...d, state: 'waiting' }));
  const t = game.truck;
  t.x = LOCATIONS.depot.x; t.y = LOCATIONS.depot.y;
  t.atNode = nodeKey(LOCATIONS.depot.x, LOCATIONS.depot.y);
  t.path = []; t.pathIndex = 0; t.facing = 1;
  t.state = 'idle';
  t.battery = batteryMax();
  t.energy = BAL.energyMax;
  t.food = BAL.foodMax;
  renderAll();
  showIntroModal();
}

function startLevel() {
  if (game.running || game.over) return;
  game.running = true;
  // Lasta det som väntar där bilen står
  tryPickupAt('depot');
  renderAll();
}

function completeLevel() {
  game.over = true;
  game.running = false;
  const lvl = currentLevel();
  const lim = lvl.timeLimit;
  const timeBonus = lim !== null ? Math.max(0, Math.round((lim - game.clock) * 2)) : 0;
  const total = lvl.reward + timeBonus;
  save.money += total;
  const wasLast = game.levelIndex >= LEVELS.length - 1;
  if (!wasLast) save.level = game.levelIndex + 1;
  else save.finished = true;
  persist();
  renderTopbar();
  showCompleteModal(lvl, timeBonus, total, wasLast);
}

function failLevel(reason, icon) {
  if (game.over) return;
  game.over = true;
  game.running = false;
  renderStatus();
  showFailModal(reason, icon);
}

/* ---------- Modaler ---------- */

function showModal(html) {
  $('#modal').innerHTML = html;
  $('#modalBackdrop').classList.remove('hidden');
}
function hideModal() { $('#modalBackdrop').classList.add('hidden'); }

function showIntroModal() {
  const lvl = currentLevel();
  const rows = game.deliveries.map(d =>
    '<li>' + iconSpan('box') + '<span class="obj-text">' + d.label + ': ' +
    LOCATIONS[d.from].name + ' → ' + LOCATIONS[d.to].name + '</span></li>').join('');
  showModal(
    '<h2>' + iconSpan('marker') + 'Nivå ' + (game.levelIndex + 1) + ': ' + lvl.title + '</h2>' +
    '<p>' + lvl.brief + '</p>' +
    '<ul class="objectives">' + rows +
    (lvl.returnHome ? '<li>' + iconSpan('house') + '<span class="obj-text">Återvänd till Depån</span></li>' : '') +
    '</ul>' +
    (lvl.timeLimit !== null
      ? '<p class="sub">' + iconSpan('stopwatch') + ' Tidsgräns: ' + lvl.timeLimit + ' min &nbsp;·&nbsp; Belöning: ' + lvl.reward + ' kr + tidsbonus</p>'
      : '<p class="sub">Ingen tidsgräns &nbsp;·&nbsp; Belöning: ' + lvl.reward + ' kr</p>') +
    '<p class="sub">Tryck på platser på kartan för att planera rutten, tryck sedan på Kör.</p>' +
    '<div class="btnrow"><button class="btn primary" id="modalOk">' + iconSpan('check') + ' Börja planera</button></div>'
  );
  $('#modalOk').addEventListener('click', hideModal);
}

function showCompleteModal(lvl, timeBonus, total, wasLast) {
  showModal(
    '<h2>' + iconSpan('trophy') + 'Uppdrag slutfört!</h2>' +
    '<p>' + lvl.title + ' avklarat på ' + Math.round(game.clock) + ' minuter.</p>' +
    '<ul class="rewardlist">' +
    '<li><span>Belöning</span><span>' + lvl.reward + ' kr</span></li>' +
    (lvl.timeLimit !== null ? '<li><span>Tidsbonus</span><span>' + timeBonus + ' kr</span></li>' : '') +
    '<li class="total"><span>Totalt</span><span>+' + total + ' kr</span></li>' +
    '</ul>' +
    '<div class="btnrow">' +
    '<button class="btn" id="modalShop">' + iconSpan('shop') + ' Butiken</button>' +
    (wasLast
      ? '<button class="btn primary" id="modalVictory">' + iconSpan('trophy') + ' Fortsätt</button>'
      : '<button class="btn primary" id="modalNext">' + iconSpan('play') + ' Nästa nivå</button>') +
    '</div>'
  );
  $('#modalShop').addEventListener('click', () => showShopModal(wasLast ? 'victory' : 'next'));
  if (wasLast) $('#modalVictory').addEventListener('click', showVictoryModal);
  else $('#modalNext').addEventListener('click', () => { game.levelIndex = save.level; setupLevel(); });
}

function showVictoryModal() {
  showModal(
    '<h2>' + iconSpan('trophy') + 'Alla uppdrag slutförda!</h2>' +
    '<p>Du har klarat alla ' + LEVELS.length + ' nivåer och är stadens bästa transportförare. Grattis!</p>' +
    '<p class="sub">Sammanlagd kassa: ' + save.money + ' kr</p>' +
    '<div class="btnrow">' +
    '<button class="btn" id="modalReplay">' + iconSpan('retry') + ' Spela om sista nivån</button>' +
    '<button class="btn danger" id="modalReset">' + iconSpan('cancel') + ' Börja om från början</button>' +
    '</div>'
  );
  $('#modalReplay').addEventListener('click', () => setupLevel());
  $('#modalReset').addEventListener('click', () => {
    save = defaultSave();
    persist();
    game.levelIndex = 0;
    renderTopbar();
    setupLevel();
  });
}

function showFailModal(reason, icon) {
  showModal(
    '<h2>' + iconSpan(icon || 'cancel') + 'Uppdraget misslyckades</h2>' +
    '<p>' + reason + '</p>' +
    '<p class="sub">Inga pengar går förlorade — försök igen!</p>' +
    '<div class="btnrow">' +
    '<button class="btn" id="modalShop2">' + iconSpan('shop') + ' Butiken</button>' +
    '<button class="btn primary" id="modalRetry">' + iconSpan('retry') + ' Försök igen</button>' +
    '</div>'
  );
  $('#modalRetry').addEventListener('click', () => setupLevel());
  $('#modalShop2').addEventListener('click', () => showShopModal('retry'));
}

function showShopModal(returnTo) {
  let html = '<h2>' + iconSpan('shop') + 'Butiken</h2>' +
    '<p class="sub">Kassa: <b>' + save.money + ' kr</b></p>';
  for (const id in UPGRADES) {
    const u = UPGRADES[id];
    const lvl = save.upgrades[id];
    const maxed = lvl >= u.costs.length;
    const cost = maxed ? null : u.costs[lvl];
    html += '<div class="shopitem">' +
      '<span class="icon">' + ICONS[u.icon] + '</span>' +
      '<span class="info"><b>' + u.name + ' <small>(' + lvl + '/' + u.costs.length + ')</small></b>' +
      '<small>' + u.desc + '</small></span>' +
      (maxed
        ? '<span class="maxed">' + iconSpan('check') + ' Max</span>'
        : '<button class="buy" data-upg="' + id + '"' + (save.money < cost ? ' disabled' : '') + '>' +
          iconSpan('money') + cost + ' kr</button>') +
      '</div>';
  }
  html += '<div class="btnrow"><button class="btn primary" id="modalBack">' + iconSpan('check') + ' Klar</button></div>';
  showModal(html);
  document.querySelectorAll('.buy[data-upg]').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.dataset.upg;
      const cost = UPGRADES[id].costs[save.upgrades[id]];
      if (save.money < cost) return;
      save.money -= cost;
      save.upgrades[id] += 1;
      persist();
      renderTopbar();
      renderStatus();
      toast(UPGRADES[id].name + ' uppgraderad!', 'upgrade');
      showShopModal(returnTo);
    });
  });
  $('#modalBack').addEventListener('click', () => {
    if (returnTo === 'next') { game.levelIndex = save.level; setupLevel(); }
    else if (returnTo === 'retry') setupLevel();
    else if (returnTo === 'victory') showVictoryModal();
    else hideModal();
  });
}

function showChangelogModal() {
  let html = '<h2>' + iconSpan('truck') + 'GRL Transport <small style="color:var(--muted);font-size:0.75em">v' + VERSION + '</small></h2>' +
    '<ul class="changelog">';
  for (const c of CHANGELOG) {
    html += '<li><span class="ver">v' + c.version + '</span><span class="date">' + c.date + '</span>' +
      '<ul>' + c.items.map(i => '<li>' + i + '</li>').join('') + '</ul></li>';
  }
  html += '</ul>' +
    '<p class="credit">Symboler av Delapouite &amp; Lorc från <a href="https://game-icons.net" target="_blank" rel="noopener">game-icons.net</a> (CC BY 3.0).</p>' +
    '<div class="btnrow"><button class="btn primary" id="modalOk">' + iconSpan('check') + ' Stäng</button></div>';
  showModal(html);
  $('#modalOk').addEventListener('click', hideModal);
}

/* ---------- Rendering: paneler ---------- */

function renderTopbar() {
  $('#levelStat').innerHTML = iconSpan('marker') + ' Nivå ' + (game.levelIndex + 1) + '/' + LEVELS.length;
  $('#moneyStat').innerHTML = iconSpan('money') + ' ' + save.money + ' kr';
  $('#shopBtn').innerHTML = iconSpan('shop') + ' Butik';
  $('#versionBtn').innerHTML = 'v' + VERSION;
}

function renderObjectives() {
  const lvl = currentLevel();
  $('#taskBrief').textContent = 'Nivå ' + (game.levelIndex + 1) + ': ' + lvl.title;
  const ul = $('#objectives');
  ul.innerHTML = '';
  for (const d of game.deliveries) {
    const li = el('li', d.state === 'done' ? 'done' : (d.state === 'carried' ? 'carried' : ''));
    const ic = d.state === 'done' ? 'check' : 'box';
    li.innerHTML = iconSpan(ic) + '<span class="obj-text">' + d.label + ': ' +
      LOCATIONS[d.from].name + ' → ' + LOCATIONS[d.to].name + '</span>';
    ul.appendChild(li);
  }
  if (lvl.returnHome) {
    const allDone = game.deliveries.every(d => d.state === 'done');
    const home = allDone && game.truck.atNode === nodeKey(LOCATIONS.depot.x, LOCATIONS.depot.y) && game.truck.state !== 'driving';
    const li = el('li', home ? 'done' : '');
    li.innerHTML = iconSpan(home ? 'check' : 'house') + '<span class="obj-text">Återvänd till Depån</span>';
    ul.appendChild(li);
  }
}

function renderTime() {
  const lvl = currentLevel();
  const row = $('#timeRow');
  if (lvl.timeLimit === null) {
    row.innerHTML = iconSpan('stopwatch') + ' ' + Math.floor(game.clock) + ' min (ingen tidsgräns)';
    row.classList.remove('warn');
  } else {
    const left = Math.max(0, lvl.timeLimit - game.clock);
    row.innerHTML = iconSpan('stopwatch') + ' ' + Math.ceil(left) + ' min kvar av ' + lvl.timeLimit;
    row.classList.toggle('warn', left < lvl.timeLimit * 0.25);
  }
}

const BAR_DEFS = [
  { key: 'battery', icon: 'battery',   label: 'Batteri', color: '#57c26b', max: batteryMax },
  { key: 'energy',  icon: 'coffee',    label: 'Energi',  color: '#5aa9e6', max: () => BAL.energyMax },
  { key: 'food',    icon: 'knifeFork', label: 'Mat',     color: '#f0913d', max: () => BAL.foodMax }
];

function renderStatus() {
  const wrap = $('#bars');
  if (!wrap.childElementCount) {
    for (const b of BAR_DEFS) {
      const row = el('div', 'barrow');
      row.innerHTML = '<span class="icon" title="' + b.label + '">' + ICONS[b.icon] + '</span>' +
        '<span class="bar"><span class="fill" id="fill-' + b.key + '" style="background:' + b.color + '"></span></span>' +
        '<span class="val" id="val-' + b.key + '"></span>';
      wrap.appendChild(row);
    }
  }
  for (const b of BAR_DEFS) {
    const max = b.max();
    const v = Math.max(0, game.truck[b.key]);
    const fill = $('#fill-' + b.key);
    fill.style.width = Math.min(100, (v / max) * 100) + '%';
    fill.style.background = v / max < 0.2 ? 'var(--red)' : b.color;
    $('#val-' + b.key).textContent = Math.round(v) + '/' + Math.round(max);
  }
  const cargo = $('#cargoRow');
  let slots = '';
  const carried = game.deliveries.filter(d => d.state === 'carried');
  for (let i = 0; i < cargoMax(); i++) {
    const full = i < carried.length;
    slots += '<span class="slot' + (full ? ' full' : '') + '" title="' + (full ? carried[i].label : 'Tom lastplats') + '">' +
      (full ? iconSpan('box') : '') + '</span>';
  }
  cargo.innerHTML = '<span>Last:</span>' + slots + '<span>' + carried.length + '/' + cargoMax() + '</span>';
  renderTime();
}

function renderQueue() {
  const ol = $('#queueList');
  ol.innerHTML = '';
  $('#queueHint').style.display = game.queue.length ? 'none' : '';
  game.queue.forEach((item, i) => {
    const loc = LOCATIONS[item.locId];
    const active = i === 0 && game.running && game.truck.state !== 'idle';
    const li = el('li', active ? 'active' : '');
    let text = 'Kör till ' + loc.name;
    if (item.service) text += ' och ' + SERVICE_TEXT[item.service].queued;
    let prog = '';
    if (active) {
      const t = game.truck;
      if (t.state === 'charge') prog = Math.round((t.battery / batteryMax()) * 100) + ' %';
      else if (t.state === 'eat') prog = Math.round(t.food) + '/' + BAL.foodMax;
      else if (t.state === 'sleep') prog = Math.round(t.energy) + '/' + BAL.energyMax;
      else if (t.state === 'driving') prog = 'kör…';
    }
    li.innerHTML = '<span class="num">' + (i + 1) + '.</span>' +
      iconSpan(item.service ? SERVICE_TEXT[item.service].icon : 'marker') +
      '<span class="qtext">' + text + '</span>' +
      (prog ? '<span class="qprog">' + prog + '</span>' : '') +
      '<button class="rm" title="Ta bort" aria-label="Ta bort">' + iconSpan('trash') + '</button>';
    li.querySelector('.rm').addEventListener('click', () => removeQueueItem(i));
    ol.appendChild(li);
  });
  renderControls();
}

function renderControls() {
  const play = $('#playBtn');
  if (!game.running) {
    play.innerHTML = iconSpan('play') + ' Kör';
    play.disabled = game.over;
  } else {
    play.innerHTML = iconSpan('pause') + ' Paus';
    play.disabled = false;
  }
  $('#speedBtn').innerHTML = iconSpan('fast') + ' ' + game.speed + 'x';
  $('#clearBtn').innerHTML = iconSpan('trash') + ' Rensa';
  $('#clearBtn').disabled = game.queue.length === 0;
}

function renderAll() {
  renderTopbar();
  renderObjectives();
  renderStatus();
  renderQueue();
}

/* ---------- Rendering: karta ---------- */

const canvas = $('#map');
const ctx = canvas.getContext('2d');
let dpr = 1, cssScale = 1;

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const cssW = rect.width;
  const cssH = cssW * (H / W);
  dpr = window.devicePixelRatio || 1;
  cssScale = cssW / W;
  canvas.style.height = cssH + 'px';
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
}
window.addEventListener('resize', resizeCanvas);

function drawMap() {
  ctx.setTransform(dpr * cssScale, 0, 0, dpr * cssScale, 0, 0);
  // Gräs
  ctx.fillStyle = '#3a4a33';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  for (let i = 0; i < 60; i++) {
    const gx = (i * 137) % W, gy = (i * 89) % H;
    ctx.fillRect(gx, gy, 3, 3);
  }

  // Vägar
  const roadW = 26;
  ctx.strokeStyle = '#2b2f36';
  ctx.lineWidth = roadW;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (const y of GRID_Y) { ctx.moveTo(GRID_X[0], y); ctx.lineTo(GRID_X[GRID_X.length - 1], y); }
  for (const x of GRID_X) { ctx.moveTo(x, GRID_Y[0]); ctx.lineTo(x, GRID_Y[GRID_Y.length - 1]); }
  ctx.stroke();

  // Mittlinjer
  ctx.strokeStyle = 'rgba(246,185,59,0.55)';
  ctx.lineWidth = 2;
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  for (const y of GRID_Y) { ctx.moveTo(GRID_X[0], y); ctx.lineTo(GRID_X[GRID_X.length - 1], y); }
  for (const x of GRID_X) { ctx.moveTo(x, GRID_Y[0]); ctx.lineTo(x, GRID_Y[GRID_Y.length - 1]); }
  ctx.stroke();
  ctx.setLineDash([]);

  // Planerad rutt
  drawPlannedRoute();

  // Platser
  for (const id in LOCATIONS) drawLocation(LOCATIONS[id]);

  // Lastbil
  drawTruck();
}

function drawPlannedRoute() {
  if (!game.queue.length) return;
  const t = game.truck;
  let fromKey = t.atNode;
  ctx.strokeStyle = 'rgba(90,169,230,0.5)';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.setLineDash([2, 12]);
  ctx.beginPath();
  // Från bilens position längs återstående körväg
  if (t.state === 'driving' && t.path.length) {
    ctx.moveTo(t.x, t.y);
    for (let i = t.pathIndex + 1; i < t.path.length; i++) ctx.lineTo(t.path[i].x, t.path[i].y);
    fromKey = nodeKey(t.path[t.path.length - 1].x, t.path[t.path.length - 1].y);
  }
  for (let q = t.state === 'driving' ? 1 : 0; q < game.queue.length; q++) {
    const loc = LOCATIONS[game.queue[q].locId];
    const toKey = nodeKey(loc.x, loc.y);
    const { path } = shortestPath(fromKey, toKey);
    const pts = path.map(keyToPoint);
    if (pts.length) {
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    }
    fromKey = toKey;
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

const HIT_RADIUS = 44;

function drawLocation(loc) {
  const hasWaiting = game.deliveries.some(d => d.state === 'waiting' && d.from === loc.id);
  const isTarget = game.deliveries.some(d => d.state === 'carried' && d.to === loc.id);

  // Platta
  ctx.fillStyle = 'rgba(20,24,31,0.85)';
  ctx.strokeStyle = isTarget ? '#f6b93b' : (hasWaiting ? '#5aa9e6' : 'rgba(255,255,255,0.25)');
  ctx.lineWidth = isTarget || hasWaiting ? 3 : 1.5;
  roundRect(loc.x - 22, loc.y - 22, 44, 44, 10);
  ctx.fill();
  ctx.stroke();

  // Ikon
  const img = iconImage(loc.icon, loc.color);
  if (img.complete && img.naturalWidth) ctx.drawImage(img, loc.x - 14, loc.y - 14, 28, 28);

  // Paketmärke
  if (hasWaiting || isTarget) {
    const bimg = iconImage('box', '#14181f');
    ctx.fillStyle = isTarget ? '#f6b93b' : '#5aa9e6';
    ctx.beginPath();
    ctx.arc(loc.x + 19, loc.y - 19, 10, 0, Math.PI * 2);
    ctx.fill();
    if (bimg.complete && bimg.naturalWidth) ctx.drawImage(bimg, loc.x + 13, loc.y - 25, 12, 12);
  }

  // Etikett
  ctx.font = '600 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  const label = loc.name;
  const tw = ctx.measureText(label).width;
  const ly = loc.y + 36;
  ctx.fillStyle = 'rgba(20,24,31,0.75)';
  roundRect(loc.x - tw / 2 - 6, ly - 11, tw + 12, 17, 6);
  ctx.fill();
  ctx.fillStyle = '#e8ecf2';
  ctx.fillText(label, loc.x, ly + 2);
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawTruck() {
  const t = game.truck;
  ctx.save();
  ctx.translate(t.x, t.y);
  // Skugga
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 12, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  if (t.facing < 0) ctx.scale(-1, 1);
  const img = iconImage('truck', '#f6b93b');
  if (img.complete && img.naturalWidth) ctx.drawImage(img, -17, -20, 34, 34);
  ctx.restore();

  // Aktivitetsbubbla
  const bubbleIcon = t.state === 'charge' ? 'charge' : t.state === 'eat' ? 'meal' : t.state === 'sleep' ? 'nightSleep' : null;
  if (bubbleIcon) {
    ctx.fillStyle = 'rgba(20,24,31,0.9)';
    ctx.strokeStyle = '#f6b93b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(t.x, t.y - 32, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    const img2 = iconImage(bubbleIcon, '#f6b93b');
    if (img2.complete && img2.naturalWidth) ctx.drawImage(img2, t.x - 8, t.y - 40, 16, 16);
  }
}

/* ---------- Interaktion ---------- */

function canvasPointToWorld(evX, evY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (evX - rect.left) / rect.width * W,
    y: (evY - rect.top) / rect.height * H
  };
}

function locationAt(wx, wy) {
  let best = null, bestD = HIT_RADIUS;
  for (const id in LOCATIONS) {
    const L = LOCATIONS[id];
    const d = Math.hypot(L.x - wx, L.y - wy);
    if (d < bestD) { bestD = d; best = id; }
  }
  return best;
}

canvas.addEventListener('click', ev => {
  const p = canvasPointToWorld(ev.clientX, ev.clientY);
  const id = locationAt(p.x, p.y);
  if (id) queueLocation(id);
});

canvas.addEventListener('pointermove', ev => {
  const p = canvasPointToWorld(ev.clientX, ev.clientY);
  canvas.style.cursor = locationAt(p.x, p.y) ? 'pointer' : 'default';
});

$('#playBtn').addEventListener('click', () => {
  if (game.over) return;
  if (!game.running) startLevel();
  else game.running = false;
  renderControls();
});

$('#speedBtn').addEventListener('click', () => {
  game.speed = game.speed === 1 ? 2 : game.speed === 2 ? 4 : 1;
  renderControls();
});

$('#clearBtn').addEventListener('click', clearQueue);
$('#versionBtn').addEventListener('click', showChangelogModal);
$('#shopBtn').addEventListener('click', () => {
  if (game.running) { game.running = false; renderControls(); }
  showShopModal(null);
});

/* ---------- Blockera zoom, markering och förstoringsglas ---------- */

// Dubbeltryck-zoom (iOS Safari struntar i user-scalable=no)
let lastTouchEnd = 0;
document.addEventListener('touchend', ev => {
  const now = Date.now();
  if (now - lastTouchEnd < 350) ev.preventDefault();
  lastTouchEnd = now;
}, { passive: false });

// Nyp-zoom / gester (iOS)
for (const evName of ['gesturestart', 'gesturechange', 'gestureend']) {
  document.addEventListener(evName, ev => ev.preventDefault(), { passive: false });
}

// Dubbelklick och långtryck (förstoringsglas/kontextmeny)
document.addEventListener('dblclick', ev => ev.preventDefault(), { passive: false });
document.addEventListener('contextmenu', ev => ev.preventDefault());
document.addEventListener('selectstart', ev => ev.preventDefault());

/* ---------- Spelloop ---------- */

let lastTime = performance.now();
let statusAccum = 0;

function frame(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  tick(dt);
  // Uppdatera kö-progress i lagom takt
  statusAccum += dt;
  if (statusAccum > 0.25) {
    statusAccum = 0;
    if (game.running) renderQueue();
  }
  drawMap();
  requestAnimationFrame(frame);
}

/* ---------- Start ---------- */

resizeCanvas();
game.levelIndex = Math.min(save.level, LEVELS.length - 1);
renderAll();
setupLevel();
requestAnimationFrame(frame);
