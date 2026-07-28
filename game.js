'use strict';

/* ============================================================
   Delivery Girl — ett varmt strategiskt planeringsspel
   Vanilla JS + Canvas. Symboler: game-icons.net (CC BY 3.0)
   ============================================================ */

const VERSION = '1.2.0';

const CHANGELOG = [
  {
    version: '1.2.0',
    date: '2026-07-28',
    items: [
      'Nytt inställningsläge (kugghjulet uppe till höger) med två sätt att spela.',
      'Direktkörning (standard): klockan startar när du lägger till ditt första stopp och du väljer nya åtgärder i realtid medan bilen rullar.',
      'Planering: du lägger upp hela körschemat i lugn och ro och trycker på Kör för att simulera det.',
      'Valet sparas och gäller direkt — du kan byta mitt i ett uppdrag.',
      'Cache-busting på varje push, så nya versioner alltid laddas i webbläsaren.'
    ]
  },
  {
    version: '1.1.0',
    date: '2026-07-28',
    items: [
      'Kartan går att panorera och zooma — dra för att flytta, nyp eller scrolla för att zooma.',
      'Kartan fyller hela skärmen och fungerar lika bra stående som liggande.',
      'Tydligare färdväg med riktningspilar, numrerade stopp och markerad aktiv sträcka.',
      'Status (batteri, energi, mat och last) ligger nu som överlägg ovanpå kartan.',
      'Mätarna fylls med färgzoner — rött när det börjar ta slut, grönt när det är gott om.',
      'Flytande kontrollrad längst ned med Kör, hastighet, rensa och ny omstartsknapp.',
      'Uppdragsrutan uppe till höger — tryck på den för hela historien, som också visas vid nivåstart.',
      'Berättelse och personer: du är Delivery Girl och hjälper Greta, Rosa, Enzo, Majken, Gustav, Bengt och Vera.',
      'Husen ligger vid vägkorsningarna med egna infarter, och kartan har fått kust, åkrar och skog.',
      'Snävare tidsgränser, och långpassen börjar med trött förare så att mat- och sovstopp spelar roll.'
    ]
  },
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

/* ---------- Världen ---------- */

const W = 1180, H = 1040;
const GRID_X = [140, 440, 740, 1040];
const GRID_Y = [130, 390, 650, 910];
const COAST_X = 1092;

function nodeKey(x, y) { return x + ',' + y; }
function keyToPoint(k) { const p = k.split(','); return { x: +p[0], y: +p[1] }; }

const graph = {};
(function buildGraph() {
  for (const x of GRID_X) for (const y of GRID_Y) graph[nodeKey(x, y)] = [];
  const link = (a, b, d) => { graph[a].push({ key: b, dist: d }); graph[b].push({ key: a, dist: d }); };
  for (let i = 0; i < GRID_X.length; i++) {
    for (let j = 0; j < GRID_Y.length; j++) {
      if (i + 1 < GRID_X.length) link(nodeKey(GRID_X[i], GRID_Y[j]), nodeKey(GRID_X[i + 1], GRID_Y[j]), GRID_X[i + 1] - GRID_X[i]);
      if (j + 1 < GRID_Y.length) link(nodeKey(GRID_X[i], GRID_Y[j]), nodeKey(GRID_X[i], GRID_Y[j + 1]), GRID_Y[j + 1] - GRID_Y[j]);
    }
  }
})();

const pathCache = {};
function shortestPath(fromKey, toKey) {
  const ck = fromKey + '>' + toKey;
  if (pathCache[ck]) return pathCache[ck];
  const dist = {}, prev = {}, visited = {};
  for (const k in graph) dist[k] = Infinity;
  dist[fromKey] = 0;
  for (;;) {
    let cur = null, best = Infinity;
    for (const k in graph) if (!visited[k] && dist[k] < best) { best = dist[k]; cur = k; }
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
  const res = { path, dist: dist[toKey] };
  pathCache[ck] = res;
  return res;
}

/* ---------- Personer & platser ---------- */

const LOCATIONS = {
  depot: {
    id: 'depot', name: 'Depån', who: 'Mormor Greta', icon: 'house', color: '#f6b93b',
    x: 140, y: 910, ox: 66, oy: -66, blurb: 'Ditt garage och ditt hem. Greta packar lådorna och har alltid kaffe på.'
  },
  grossist: {
    id: 'grossist', name: 'Grossisten', who: 'Gustav', icon: 'crate', color: '#c9a066',
    x: 140, y: 130, ox: 66, oy: 66, blurb: 'Gustav kan varje låda vid namn och vinkar med hela armen när du kommer.'
  },
  rosen: {
    id: 'rosen', name: 'Restaurang Rosen', who: 'Rosa', icon: 'chef', color: '#f28fb1',
    x: 740, y: 130, ox: 66, oy: 66, blurb: 'Rosa bakar kanelbullar som tar slut på tjugo minuter. Hon är alltid lite nervös.'
  },
  masen: {
    id: 'masen', name: 'Restaurang Måsen', who: 'Majken', icon: 'cook', color: '#8fd3f4',
    x: 1040, y: 390, ox: -66, oy: 66, blurb: 'Skaldjur vid vattnet. Katten Sill sitter i fönstret och väntar på dig.'
  },
  eken: {
    id: 'eken', name: 'Restaurang Eken', who: 'Enzo', icon: 'chef', color: '#a3d977',
    x: 740, y: 910, ox: -66, oy: -66, blurb: 'Enzo sjunger opera medan han knådar pizzadeg. Grannarna har vant sig.'
  },
  laddNord: {
    id: 'laddNord', name: 'Laddstation Nord', who: null, icon: 'gasPump', color: '#57c26b',
    x: 440, y: 390, ox: 66, oy: -66, service: 'charge', blurb: 'Snabbladdare mellan åkrarna. Fågelsång ingår.'
  },
  laddSyd: {
    id: 'laddSyd', name: 'Laddstation Syd', who: null, icon: 'gasPump', color: '#57c26b',
    x: 740, y: 650, ox: -66, oy: 66, service: 'charge', blurb: 'Laddaren vid rondellen. Alltid en ledig plats.'
  },
  krog: {
    id: 'krog', name: 'Vägkrogen', who: 'Bengt', icon: 'burger', color: '#f0913d',
    x: 140, y: 650, ox: 66, oy: 66, service: 'eat', blurb: 'Bengt håller en tallrik köttbullar varm åt dig. Varje dag.'
  },
  motell: {
    id: 'motell', name: 'Motell Vilan', who: 'Vera', icon: 'bed', color: '#b18ae0',
    x: 1040, y: 910, ox: -66, oy: -66, service: 'sleep', blurb: 'Vera bäddar rent och väcker dig med termosen fylld.'
  }
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
    story: 'Det är din första dag med den lilla eldrivna lastbilen. Mormor Greta har packat en låda nybakade kanelbullar och knutit ett snöre runt den. "Rosa har öppning i dag och är nervös som en fågelunge. Ta med de här, så ordnar sig resten." Kör dit, lämna lådan och kom hem till kaffet.',
    timeLimit: null, reward: 450,
    deliveries: [{ from: 'depot', to: 'rosen', label: 'Kanelbullar', icon: 'cupcake' }],
    returnHome: true
  },
  {
    title: 'Två beställningar',
    story: 'Rosa ringde och skrattade rakt in i luren — bullarna tog slut på tjugo minuter. Nu vill hon ha grönsaker. Och Enzo på Eken har glömt beställa bröd till kvällens pizzakväll igen. Två lådor, ett flak: det blir två vändor, om du inte hunnit köpa ett större.',
    timeLimit: 70, reward: 550,
    deliveries: [
      { from: 'depot', to: 'rosen', label: 'Grönsaker', icon: 'flowers' },
      { from: 'depot', to: 'eken', label: 'Färskt bröd', icon: 'bread' }
    ],
    returnHome: true
  },
  {
    title: 'Grossistens varor',
    story: 'Gustav står i porten och vinkar med en fisklåda över huvudet. "Till Majken vid vattnet! Och kryddorna till Rosa — glöm inte kryddorna, hon blir ledsen annars." Det är en bit att köra, så håll ett öga på batteriet.',
    timeLimit: 72, reward: 650,
    deliveries: [
      { from: 'grossist', to: 'masen', label: 'Fiskleverans', icon: 'fish' },
      { from: 'grossist', to: 'rosen', label: 'Kryddor', icon: 'flowerPot' }
    ],
    returnHome: true
  },
  {
    title: 'Lunchrusningen',
    story: 'Kvart i elva och tre kök väntar. Rosa har pastavattnet kokande, Enzo skriker opera över salladsskålen och Majken har lovat räkor till ett dopfölje som redan sitter vid borden. Ingen press alls.',
    timeLimit: 110, reward: 800,
    deliveries: [
      { from: 'depot', to: 'rosen', label: 'Pastalådor', icon: 'box' },
      { from: 'depot', to: 'eken', label: 'Sallad', icon: 'flowers' },
      { from: 'depot', to: 'masen', label: 'Räkor', icon: 'fish' }
    ],
    returnHome: true
  },
  {
    title: 'Långpasset',
    story: 'Ett långt pass med varor från Gustav till hela stan. Bengt på Vägkrogen har lovat hålla en tallrik köttbullar varm åt dig, och Vera på Motell Vilan bäddar alltid rent. Ta hand om dig själv också — du hjälper ingen om du somnar vid ratten.',
    timeLimit: 115, reward: 950, startEnergy: 65, startFood: 60,
    deliveries: [
      { from: 'grossist', to: 'rosen', label: 'Mjöl', icon: 'bread' },
      { from: 'grossist', to: 'eken', label: 'Ost', icon: 'box' },
      { from: 'grossist', to: 'masen', label: 'Oliver', icon: 'flowerPot' }
    ],
    returnHome: true
  },
  {
    title: 'Dubbelbokat',
    story: 'Två brådskande körningar samtidigt. Majken ska ha catering till hamnfesten och Enzo har fått slut på dricka mitt i fredagsrusningen. Sill sitter redan i fönstret på Måsen och spanar efter din lastbil.',
    timeLimit: 60, reward: 900,
    deliveries: [
      { from: 'depot', to: 'masen', label: 'Cateringlåda', icon: 'box' },
      { from: 'grossist', to: 'eken', label: 'Drycker', icon: 'wine' }
    ],
    returnHome: true
  },
  {
    title: 'Fullt schema',
    story: 'Porslin, kött och grönsaker. Rosa har fått en ny servis som står och väntar i Depån, och Enzo viskar att han provlagar något nytt i kväll. Han vill inte säga vad, bara att du måste komma och smaka.',
    timeLimit: 78, reward: 1100,
    deliveries: [
      { from: 'depot', to: 'rosen', label: 'Porslin', icon: 'box' },
      { from: 'depot', to: 'eken', label: 'Kött', icon: 'pizza' },
      { from: 'grossist', to: 'masen', label: 'Grönsaker', icon: 'flowers' }
    ],
    returnHome: true
  },
  {
    title: 'Storleveransen',
    story: 'Gustav tömmer lagret inför inventeringen och har staplat lådor ända ut på gården. "Ta allt du orkar, tjejen — och kom tillbaka efter mer!" Fyra leveranser, och ett flak som kanske är för litet.',
    timeLimit: 140, reward: 1300, startEnergy: 65,
    deliveries: [
      { from: 'grossist', to: 'rosen', label: 'Konserver', icon: 'fish' },
      { from: 'grossist', to: 'masen', label: 'Frukt', icon: 'flowers' },
      { from: 'grossist', to: 'eken', label: 'Kaffe', icon: 'coffee' },
      { from: 'depot', to: 'masen', label: 'Servetter', icon: 'box' }
    ],
    returnHome: true
  },
  {
    title: 'Expressrundan',
    story: 'Det är Sills födelsedag — ja, katten — och Majken har beställt skaldjur till kalaset. Rosa har en tårta som måste fram innan den smälter, och Enzo väntar på glassen. Spring, Delivery Girl. Spring.',
    timeLimit: 70, reward: 1500,
    deliveries: [
      { from: 'depot', to: 'rosen', label: 'Tårtor', icon: 'cupcake' },
      { from: 'grossist', to: 'masen', label: 'Skaldjur', icon: 'fish' },
      { from: 'depot', to: 'eken', label: 'Glass', icon: 'cupcake' }
    ],
    returnHome: true
  },
  {
    title: 'Maratonrundan',
    story: 'Stadens sommarfest. Alla behöver allt, samtidigt, och alla ler mot dig när du svänger in på gården. Greta har hängt upp en flagga på Depån. Sista rundan innan lyktorna tänds på torget — kör den fint.',
    timeLimit: 190, reward: 2000, startEnergy: 70, startFood: 60,
    deliveries: [
      { from: 'grossist', to: 'rosen', label: 'Mjölk', icon: 'box' },
      { from: 'grossist', to: 'eken', label: 'Ägg', icon: 'box' },
      { from: 'depot', to: 'masen', label: 'Blommor', icon: 'sunflower' },
      { from: 'depot', to: 'rosen', label: 'Vin', icon: 'wine' },
      { from: 'grossist', to: 'masen', label: 'Choklad', icon: 'cupcake' }
    ],
    returnHome: true
  }
];

/* ---------- Uppgraderingar ---------- */

const UPGRADES = {
  batteryCap:  { name: 'Större batteri', icon: 'batteryPack', desc: '+40 batterikapacitet per nivå.', costs: [500, 900, 1400] },
  chargeSpeed: { name: 'Snabbladdning',  icon: 'charge',      desc: 'Dubbelt så snabb laddning per nivå.', costs: [400, 800] },
  cargo:       { name: 'Större flak',    icon: 'box',         desc: '+1 lastplats per nivå.', costs: [600, 1000, 1500] },
  thermos:     { name: 'Kaffetermos',    icon: 'coffee',      desc: 'Energin räcker 25 % längre per nivå.', costs: [450, 850] },
  coolbox:     { name: 'Kylbox',         icon: 'meal',        desc: 'Maten räcker 25 % längre per nivå.', costs: [350, 700] }
};

/* ---------- Balans ---------- */

const BAL = {
  truckSpeed: 200,
  minutesPerSecond: 1,
  batteryBase: 100,
  batteryPerUpgrade: 40,
  batteryDrainPer100px: 2.4,
  chargeRate: 5,
  energyMax: 100,
  energyDrainDrive: 0.8,
  energyDrainIdle: 0.35,
  sleepRate: 6,
  foodMax: 100,
  foodDrain: 0.45,
  eatRate: 12
};

/* ---------- Sparning ---------- */

const SAVE_KEY = 'grl-transport-save';

function defaultSave() {
  return {
    level: 0, money: 0, finished: false,
    mode: 'realtime', // 'realtime' = välj åtgärder medan bilen kör, 'planning' = planera först och tryck Kör
    upgrades: { batteryCap: 0, chargeSpeed: 0, cargo: 0, thermos: 0, coolbox: 0 }
  };
}
function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const s = Object.assign(defaultSave(), JSON.parse(raw));
    s.upgrades = Object.assign(defaultSave().upgrades, s.upgrades);
    return s;
  } catch (e) { return defaultSave(); }
}
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* privat läge */ } }

let save = loadSave();

/* ---------- Speltillstånd ---------- */

const game = {
  levelIndex: 0,
  running: false,
  speed: 1,
  clock: 0,
  queue: [],
  deliveries: [],
  route: [],
  over: false,
  userPaused: false,
  truck: {
    x: LOCATIONS.depot.x, y: LOCATIONS.depot.y,
    atNode: nodeKey(LOCATIONS.depot.x, LOCATIONS.depot.y),
    path: [], pathIndex: 0, facing: 1,
    state: 'idle',
    battery: 100, energy: 100, food: 100
  }
};

const batteryMax = () => BAL.batteryBase + save.upgrades.batteryCap * BAL.batteryPerUpgrade;
const cargoMax = () => 1 + save.upgrades.cargo;
const chargeRate = () => BAL.chargeRate * Math.pow(2, save.upgrades.chargeSpeed);
const energyFactor = () => Math.pow(0.75, save.upgrades.thermos);
const foodFactor = () => Math.pow(0.75, save.upgrades.coolbox);
const currentLevel = () => LEVELS[game.levelIndex];
const isRealtime = () => save.mode !== 'planning';
const carriedCount = () => game.deliveries.filter(d => d.state === 'carried').length;

/* ---------- DOM ---------- */

const $ = sel => document.querySelector(sel);
const iconSpan = name => '<span class="icon">' + ICONS[name] + '</span>';
function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}
document.querySelectorAll('[data-icon]').forEach(n => { n.innerHTML = ICONS[n.dataset.icon]; });

const iconImageCache = {};
function iconImage(name, color) {
  const key = name + '|' + color;
  if (!iconImageCache[key]) {
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ICONS[name].replace('fill="currentColor"', 'fill="' + color + '"'));
    iconImageCache[key] = img;
  }
  return iconImageCache[key];
}
function drawIcon(name, color, cx, cy, size) {
  const img = iconImage(name, color);
  if (img.complete && img.naturalWidth) ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
}

function toast(msg, icon) {
  const box = $('#toasts');
  const t = el('div', 'toast', (icon ? iconSpan(icon) : '') + '<span>' + msg + '</span>');
  box.appendChild(t);
  while (box.childElementCount > 3) box.firstElementChild.remove();
  setTimeout(() => t.remove(), 3300);
}

/* ---------- Kö ---------- */

function queueLocation(locId) {
  if (game.over) return;
  const loc = LOCATIONS[locId];
  const last = game.queue.length ? game.queue[game.queue.length - 1].locId : null;
  if (last === locId) { toast('Redan nästa stopp.', 'marker'); return; }
  if (!game.queue.length && game.truck.state !== 'driving' && game.truck.atNode === nodeKey(loc.x, loc.y) && !loc.service) {
    toast('Du står redan här.', 'marker'); return;
  }
  game.queue.push({ locId, service: loc.service || null });
  toast('Tillagt: ' + loc.name, loc.service ? SERVICE_TEXT[loc.service].icon : 'marker');
  rebuildRoute();
  // I direktläge rullar allt igång av sig självt vid första stoppet
  if (isRealtime() && !game.running && !game.over && !game.userPaused) startLevel();
  renderQueue();
}

function removeQueueItem(index) {
  if (index === 0 && game.running && game.truck.state !== 'idle') {
    game.queue.shift();
    if (game.truck.state === 'driving') game.truck.path = [];
    else game.truck.state = 'idle';
  } else {
    game.queue.splice(index, 1);
  }
  rebuildRoute();
  renderQueue();
}

function clearQueue() {
  const keep = game.running && game.truck.state !== 'idle' ? 1 : 0;
  game.queue = game.queue.slice(0, keep);
  rebuildRoute();
  renderQueue();
}

/* ---------- Rutt ---------- */

function rebuildRoute() {
  const t = game.truck;
  const driving = t.state === 'driving' && t.path.length > 0;
  let fromKey = driving ? nodeKey(t.path[t.path.length - 1].x, t.path[t.path.length - 1].y) : t.atNode;
  const segs = [];
  for (let i = driving ? 1 : 0; i < game.queue.length; i++) {
    const loc = LOCATIONS[game.queue[i].locId];
    const toKey = nodeKey(loc.x, loc.y);
    segs.push({ pts: shortestPath(fromKey, toKey).path.map(keyToPoint), index: i });
    fromKey = toKey;
  }
  game.route = segs;
}

/* ---------- Simulering ---------- */

function startDriveTo(locId) {
  const t = game.truck;
  const loc = LOCATIONS[locId];
  t.path = shortestPath(t.atNode, nodeKey(loc.x, loc.y)).path.map(keyToPoint);
  t.pathIndex = 0;
  t.state = 'driving';
  rebuildRoute();
}

function arriveAt(locId) {
  const t = game.truck;
  const loc = LOCATIONS[locId];
  t.atNode = nodeKey(loc.x, loc.y);
  t.x = loc.x; t.y = loc.y;

  for (const d of game.deliveries) {
    if (d.state === 'carried' && d.to === locId) {
      d.state = 'done';
      toast(d.label + ' framme hos ' + (loc.who || loc.name) + '!', 'check');
    }
  }
  tryPickupAt(locId);

  const item = game.queue[0];
  if (item && item.locId === locId && item.service) {
    const s = item.service;
    const full = (s === 'charge' && t.battery >= batteryMax() - 0.5) ||
                 (s === 'eat' && t.food >= BAL.foodMax - 0.5) ||
                 (s === 'sleep' && t.energy >= BAL.energyMax - 0.5);
    if (full) { toast('Redan fullt — inget att göra här.', 'check'); game.queue.shift(); t.state = 'idle'; }
    else { t.state = s; toast(SERVICE_TEXT[s].doing + '…', SERVICE_TEXT[s].icon); }
  } else {
    if (item && item.locId === locId) game.queue.shift();
    t.state = 'idle';
  }
  rebuildRoute();
  renderQueue();
  renderQuestChip();
  checkLevelComplete();
}

function tryPickupAt(locId) {
  for (const d of game.deliveries) {
    if (d.state === 'waiting' && d.from === locId) {
      if (carriedCount() < cargoMax()) {
        d.state = 'carried';
        toast(d.label + ' lastat (' + carriedCount() + '/' + cargoMax() + ').', d.icon || 'box');
      } else {
        toast('Flaket är fullt — ' + d.label + ' fick vänta.', 'cancel');
      }
    }
  }
}

function tick(dtReal) {
  if (!game.running || game.over) return;
  const dtMin = dtReal * BAL.minutesPerSecond * game.speed;
  const t = game.truck;
  game.clock += dtMin;

  if (t.state === 'idle' && game.queue.length) {
    const next = game.queue[0];
    const loc = LOCATIONS[next.locId];
    if (t.atNode === nodeKey(loc.x, loc.y)) arriveAt(next.locId);
    else { startDriveTo(next.locId); renderQueue(); }
  }

  if (t.state === 'driving') {
    let travel = BAL.truckSpeed * dtReal * game.speed;
    while (travel > 0 && t.pathIndex < t.path.length - 1) {
      const next = t.path[t.pathIndex + 1];
      const dx = next.x - t.x, dy = next.y - t.y;
      const segLen = Math.hypot(dx, dy);
      if (Math.abs(dx) > 0.01) t.facing = dx > 0 ? 1 : -1;
      const step = Math.min(travel, segLen);
      if (segLen > 0) { t.x += (dx / segLen) * step; t.y += (dy / segLen) * step; }
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
      if (item && t.atNode === nodeKey(LOCATIONS[item.locId].x, LOCATIONS[item.locId].y)) arriveAt(item.locId);
      else { t.state = 'idle'; rebuildRoute(); }
    }
    if (t.battery <= 0) { t.battery = 0; return failLevel('Batteriet tog slut mitt på vägen. Gustav fick komma med bärgaren och Greta blev orolig.', 'batteryPack'); }
  }

  if (t.state === 'charge') {
    t.battery = Math.min(batteryMax(), t.battery + chargeRate() * dtMin);
    if (t.battery >= batteryMax() - 0.01) finishService('Batteriet fulladdat!', 'charge');
  } else if (t.state === 'eat') {
    t.food = Math.min(BAL.foodMax, t.food + BAL.eatRate * dtMin);
    if (t.food >= BAL.foodMax - 0.01) finishService('Mätt och belåten. Bengt vinkar av dig.', 'meal');
  } else if (t.state === 'sleep') {
    t.energy = Math.min(BAL.energyMax, t.energy + BAL.sleepRate * dtMin);
    if (t.energy >= BAL.energyMax - 0.01) finishService('Utsövd! Vera har fyllt termosen.', 'nightSleep');
  }

  const drain = (t.state === 'driving' ? BAL.energyDrainDrive : BAL.energyDrainIdle) * energyFactor();
  if (t.state !== 'sleep') t.energy -= drain * dtMin;
  if (t.state !== 'eat') t.food -= BAL.foodDrain * foodFactor() * dtMin;

  if (t.energy <= 0) { t.energy = 0; return failLevel('Du somnade vid ratten. Vera på Motell Vilan har alltid en säng — sov innan energin tar slut.', 'nightSleep'); }
  if (t.food <= 0) { t.food = 0; return failLevel('Du blev yr av hunger. Bengt på Vägkrogen har köttbullar som väntar — stanna och ät i tid.', 'meal'); }

  const lim = currentLevel().timeLimit;
  if (lim !== null && game.clock >= lim) return failLevel('Tiden rann ut. Ingen blir arg på dig, men maten hann bli kall.', 'stopwatch');

  checkLevelComplete();
}

function finishService(msg, icon) {
  toast(msg, icon);
  game.queue.shift();
  game.truck.state = 'idle';
  rebuildRoute();
  renderQueue();
}

function checkLevelComplete() {
  if (game.over || !game.running) return;
  if (!game.deliveries.every(d => d.state === 'done')) return;
  if (currentLevel().returnHome) {
    if (game.truck.atNode !== nodeKey(LOCATIONS.depot.x, LOCATIONS.depot.y) || game.truck.state === 'driving') return;
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
  game.route = [];
  game.userPaused = false;
  game.deliveries = lvl.deliveries.map(d => Object.assign({}, d, { state: 'waiting' }));
  const t = game.truck;
  t.x = LOCATIONS.depot.x; t.y = LOCATIONS.depot.y;
  t.atNode = nodeKey(LOCATIONS.depot.x, LOCATIONS.depot.y);
  t.path = []; t.pathIndex = 0; t.facing = 1;
  t.state = 'idle';
  t.battery = batteryMax();
  t.energy = lvl.startEnergy || BAL.energyMax;
  t.food = lvl.startFood || BAL.foodMax;
  fitView();
  renderAll();
  showQuestModal(true);
}

function startLevel() {
  if (game.running || game.over) return;
  game.running = true;
  game.userPaused = false;
  tryPickupAt('depot');
  renderAll();
}

function completeLevel() {
  game.over = true;
  game.running = false;
  const lvl = currentLevel();
  const timeBonus = lvl.timeLimit !== null ? Math.max(0, Math.round((lvl.timeLimit - game.clock) * 2)) : 0;
  const total = lvl.reward + timeBonus;
  save.money += total;
  const wasLast = game.levelIndex >= LEVELS.length - 1;
  if (!wasLast) save.level = Math.max(save.level, game.levelIndex + 1);
  else save.finished = true;
  persist();
  renderChips();
  showCompleteModal(lvl, timeBonus, total, wasLast);
}

function failLevel(reason, icon) {
  if (game.over) return;
  game.over = true;
  game.running = false;
  renderStatus();
  renderControls();
  showFailModal(reason, icon);
}

/* ---------- Modaler ---------- */

function showModal(html) {
  $('#modal').innerHTML = html;
  $('#modalBackdrop').classList.remove('hidden');
}
function hideModal() { $('#modalBackdrop').classList.add('hidden'); }
const modalOpen = () => !$('#modalBackdrop').classList.contains('hidden');

function objectiveList() {
  const lvl = currentLevel();
  let html = '<ul class="objectives">';
  for (const d of game.deliveries) {
    const cls = d.state === 'done' ? 'done' : d.state === 'carried' ? 'carried' : 'pending';
    const ic = d.state === 'done' ? 'check' : (d.icon || 'box');
    const to = LOCATIONS[d.to], from = LOCATIONS[d.from];
    const where = d.state === 'carried' ? 'på flaket → ' + (to.who || to.name)
                : d.state === 'done' ? 'levererat till ' + (to.who || to.name)
                : 'hämtas hos ' + (from.who || from.name) + ' → ' + (to.who || to.name);
    html += '<li class="' + cls + '">' + iconSpan(ic) + '<span class="obj-text"><b>' + d.label + '</b> — ' + where + '</span></li>';
  }
  if (lvl.returnHome) {
    const allDone = game.deliveries.every(d => d.state === 'done');
    const home = allDone && game.truck.atNode === nodeKey(LOCATIONS.depot.x, LOCATIONS.depot.y) && game.truck.state !== 'driving';
    html += '<li class="' + (home ? 'done' : allDone ? 'carried' : 'pending') + '">' + iconSpan(home ? 'check' : 'house') +
      '<span class="obj-text">Kör hem till Greta på Depån</span></li>';
  }
  return html + '</ul>';
}

function showQuestModal(atStart) {
  const lvl = currentLevel();
  const lim = lvl.timeLimit;
  showModal(
    '<p class="eyebrow">' + (atStart ? 'Nytt uppdrag' : 'Uppdrag') + ' · Nivå ' + (game.levelIndex + 1) + ' av ' + LEVELS.length + '</p>' +
    '<h2>' + iconSpan('quest') + lvl.title + '</h2>' +
    '<p class="story">' + lvl.story + '</p>' +
    objectiveList() +
    '<p class="sub">' + iconSpan(lim !== null ? 'stopwatch' : 'sun') + ' ' +
      (lim !== null
        ? (game.running || game.clock > 0
            ? Math.ceil(Math.max(0, lim - game.clock)) + ' min kvar av ' + lim
            : 'Tidsgräns ' + lim + ' min')
        : 'Ingen tidsgräns — ta den tid du behöver') +
    ' &nbsp;·&nbsp; ' + iconSpan('money') + ' ' + lvl.reward + ' kr' + (lim !== null ? ' + tidsbonus' : '') + '</p>' +
    (lvl.startEnergy || lvl.startFood
      ? '<p class="sub">' + iconSpan('coffee') + ' Du har redan kört ett pass i dag' +
        (lvl.startEnergy ? ', energin är nere på ' + lvl.startEnergy + ' %' : '') +
        (lvl.startFood ? ' och du börjar bli hungrig' : '') +
        '. Planera in vila hos Vera eller mat hos Bengt.</p>'
      : '') +
    (atStart ? '<p class="sub">' + iconSpan('info') + ' ' + (isRealtime()
        ? 'Tryck på en plats på kartan så åker hon dit direkt — klockan startar vid ditt första stopp, och du väljer nya åtgärder medan hon kör.'
        : 'Lägg upp hela körschemat först och tryck sedan på Kör.') +
        ' Dra för att panorera, nyp eller scrolla för att zooma.</p>' : '') +
    '<div class="btnrow"><button class="btn primary" id="modalOk">' + iconSpan('check') + '<span class="lbl">' + (atStart ? 'Börja planera' : 'Stäng') + '</span></button></div>'
  );
  $('#modalOk').addEventListener('click', hideModal);
}

function showCompleteModal(lvl, timeBonus, total, wasLast) {
  const cheers = [
    'Greta möter dig på gården med kaffepannan i hand.',
    'Rosa vinkar från fönstret. Allt kom fram i tid.',
    'Enzo sjunger en hel aria till din ära.',
    'Sill spinner. Det betyder att du gjorde bra ifrån dig.',
    'Bengt höjer kaffekoppen mot dig när du kör förbi.'
  ];
  showModal(
    '<p class="eyebrow">Uppdrag slutfört</p>' +
    '<h2>' + iconSpan('trophy') + lvl.title + '</h2>' +
    '<p class="story">' + cheers[game.levelIndex % cheers.length] + ' Du klarade rundan på ' + Math.round(game.clock) + ' minuter.</p>' +
    '<ul class="rewardlist">' +
    '<li><span>Belöning</span><span>' + lvl.reward + ' kr</span></li>' +
    (lvl.timeLimit !== null ? '<li><span>Tidsbonus</span><span>' + timeBonus + ' kr</span></li>' : '') +
    '<li class="total"><span>Totalt</span><span>+' + total + ' kr</span></li></ul>' +
    '<div class="btnrow">' +
    '<button class="btn" id="modalShop">' + iconSpan('shop') + '<span class="lbl">Butiken</span></button>' +
    (wasLast
      ? '<button class="btn primary" id="modalVictory">' + iconSpan('sparkles') + '<span class="lbl">Fortsätt</span></button>'
      : '<button class="btn primary" id="modalNext">' + iconSpan('play') + '<span class="lbl">Nästa uppdrag</span></button>') +
    '</div>'
  );
  $('#modalShop').addEventListener('click', () => showShopModal(wasLast ? 'victory' : 'next'));
  if (wasLast) $('#modalVictory').addEventListener('click', showVictoryModal);
  else $('#modalNext').addEventListener('click', () => { game.levelIndex = save.level; setupLevel(); });
}

function showVictoryModal() {
  showModal(
    '<p class="eyebrow">Alla uppdrag slutförda</p>' +
    '<h2>' + iconSpan('trophy') + 'Tack, Delivery Girl</h2>' +
    '<p class="story">Torget är fullt av folk och lyktorna tänds en efter en. Rosa har bakat en tårta med en liten lastbil i marsipan, Enzo sjunger falskt men innerligt, och Greta säger att hon alltid vetat att du skulle klara det. Sill sover i din förarstol.</p>' +
    '<p class="sub">' + iconSpan('money') + ' Sammanlagd kassa: ' + save.money + ' kr</p>' +
    '<div class="btnrow">' +
    '<button class="btn" id="modalReplay">' + iconSpan('retry') + '<span class="lbl">Kör sista igen</span></button>' +
    '<button class="btn danger" id="modalReset">' + iconSpan('cancel') + '<span class="lbl">Börja om</span></button>' +
    '</div>'
  );
  $('#modalReplay').addEventListener('click', () => setupLevel());
  $('#modalReset').addEventListener('click', () => {
    save = defaultSave(); persist();
    game.levelIndex = 0; renderChips(); setupLevel();
  });
}

function showFailModal(reason, icon) {
  showModal(
    '<p class="eyebrow">Uppdraget misslyckades</p>' +
    '<h2>' + iconSpan(icon || 'cancel') + 'Det gick inte hela vägen</h2>' +
    '<p class="story">' + reason + '</p>' +
    '<p class="sub">Inga pengar går förlorade — ta ett djupt andetag och försök igen.</p>' +
    '<div class="btnrow">' +
    '<button class="btn" id="modalShop2">' + iconSpan('shop') + '<span class="lbl">Butiken</span></button>' +
    '<button class="btn primary" id="modalRetry">' + iconSpan('retry') + '<span class="lbl">Försök igen</span></button>' +
    '</div>'
  );
  $('#modalRetry').addEventListener('click', () => setupLevel());
  $('#modalShop2').addEventListener('click', () => showShopModal('retry'));
}

function showShopModal(returnTo) {
  let html = '<p class="eyebrow">Gustavs verkstad &amp; butik</p><h2>' + iconSpan('shop') + 'Butiken</h2>' +
    '<p class="sub">Kassa: <b style="color:var(--accent)">' + save.money + ' kr</b></p>';
  for (const id in UPGRADES) {
    const u = UPGRADES[id];
    const lv = save.upgrades[id];
    const maxed = lv >= u.costs.length;
    const cost = maxed ? null : u.costs[lv];
    html += '<div class="shopitem">' + iconSpan(u.icon) +
      '<span class="info"><b>' + u.name + ' <small>(' + lv + '/' + u.costs.length + ')</small></b><small>' + u.desc + '</small></span>' +
      (maxed ? '<span class="maxed">' + iconSpan('check') + 'Max</span>'
             : '<button class="buy" data-upg="' + id + '"' + (save.money < cost ? ' disabled' : '') + '>' + iconSpan('money') + cost + ' kr</button>') +
      '</div>';
  }
  html += '<div class="btnrow"><button class="btn primary" id="modalBack">' + iconSpan('check') + '<span class="lbl">Klar</span></button></div>';
  showModal(html);
  document.querySelectorAll('.buy[data-upg]').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.dataset.upg;
      const cost = UPGRADES[id].costs[save.upgrades[id]];
      if (save.money < cost) return;
      save.money -= cost;
      save.upgrades[id] += 1;
      persist();
      renderChips(); renderStatus();
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

const MODES = [
  {
    id: 'realtime', name: 'Direktkörning', icon: 'click',
    tagline: 'Välj åtgärder i realtid medan hon kör',
    desc: 'Tryck på en plats så rullar bilen dit direkt. Klockan startar vid ditt första stopp och du fyller på med nya stopp allt eftersom — precis som en riktig arbetsdag.'
  },
  {
    id: 'planning', name: 'Planering', icon: 'checklist',
    tagline: 'Lägg upp hela schemat och tryck Kör',
    desc: 'Klockan står stilla medan du bygger hela körschemat i lugn och ro. När du är nöjd trycker du på Kör och ser rutten simuleras från början till slut.'
  }
];

function showSettingsModal() {
  let html = '<p class="eyebrow">Inställningar</p><h2>' + iconSpan('cog') + 'Så vill jag spela</h2>';
  for (const m of MODES) {
    const on = save.mode === m.id;
    html += '<button class="modeopt' + (on ? ' active' : '') + '" data-mode="' + m.id + '" type="button">' +
      '<span class="icon">' + ICONS[m.icon] + '</span>' +
      '<span class="info"><b>' + m.name + (on ? ' <em>· valt</em>' : '') + '</b>' +
      '<small>' + m.tagline + '</small><small class="long">' + m.desc + '</small></span>' +
      '<span class="tick">' + (on ? ICONS.check : '') + '</span></button>';
  }
  html += '<p class="sub">Valet sparas och gäller direkt, även mitt i ett uppdrag.</p>' +
    '<div class="btnrow"><button class="btn primary" id="modalOk">' + iconSpan('check') + '<span class="lbl">Klar</span></button></div>';
  showModal(html);
  document.querySelectorAll('.modeopt[data-mode]').forEach(b => {
    b.addEventListener('click', () => {
      setMode(b.dataset.mode);
      showSettingsModal();
    });
  });
  $('#modalOk').addEventListener('click', hideModal);
}

function setMode(mode) {
  if (save.mode === mode) return;
  save.mode = mode;
  persist();
  if (mode === 'planning') {
    // Pausa så spelaren hinner planera klart
    game.running = false;
    game.userPaused = false;
  } else if (!game.over && game.queue.length && !game.userPaused) {
    startLevel();
  }
  toast(mode === 'planning' ? 'Planeringsläge.' : 'Direktkörning.', mode === 'planning' ? 'checklist' : 'click');
  renderQueue();
  renderControls();
}

function showChangelogModal() {
  let html = '<p class="eyebrow">Version ' + VERSION + '</p><h2>' + iconSpan('truck') + 'Delivery Girl</h2>' +
    '<p class="sub">Vad som ingår i varje version:</p><ul class="changelog">';
  for (const c of CHANGELOG) {
    html += '<li><span class="ver">v' + c.version + '</span><span class="date">' + c.date + '</span><ul>' +
      c.items.map(i => '<li>' + i + '</li>').join('') + '</ul></li>';
  }
  html += '</ul><p class="credit">Symboler av Delapouite &amp; Lorc från <a href="https://game-icons.net" target="_blank" rel="noopener">game-icons.net</a>, licens CC BY 3.0.</p>' +
    '<div class="btnrow"><button class="btn primary" id="modalOk">' + iconSpan('check') + '<span class="lbl">Stäng</span></button></div>';
  showModal(html);
  $('#modalOk').addEventListener('click', hideModal);
}

/* ---------- HUD ---------- */

const BAR_DEFS = [
  { key: 'battery', icon: 'battery',   label: 'Batteri', col: '#57c26b', col2: '#8ce89f', max: batteryMax },
  { key: 'energy',  icon: 'coffee',    label: 'Energi',  col: '#5aa9e6', col2: '#93cdf6', max: () => BAL.energyMax },
  { key: 'food',    icon: 'knifeFork', label: 'Mat',     col: '#a3d977', col2: '#cdf0a4', max: () => BAL.foodMax }
];

function renderStatus() {
  const wrap = $('#bars');
  if (!wrap.childElementCount) {
    for (const b of BAR_DEFS) {
      const row = el('div', 'barrow');
      row.id = 'row-' + b.key;
      row.innerHTML = '<span class="icon" title="' + b.label + '">' + ICONS[b.icon] + '</span>' +
        '<span class="bar" style="--barcol:' + b.col + ';--barcol2:' + b.col2 + '"><span class="empty" id="empty-' + b.key + '"></span></span>' +
        '<span class="val" id="val-' + b.key + '"></span>';
      wrap.appendChild(row);
    }
  }
  for (const b of BAR_DEFS) {
    const max = b.max();
    const v = Math.max(0, game.truck[b.key]);
    const pct = Math.max(0, Math.min(100, (v / max) * 100));
    $('#empty-' + b.key).style.width = (100 - pct) + '%';
    $('#val-' + b.key).textContent = Math.round(v);
    $('#row-' + b.key).classList.toggle('low', pct < 25);
  }
  const carried = game.deliveries.filter(d => d.state === 'carried');
  let slots = '';
  for (let i = 0; i < cargoMax(); i++) {
    const d = carried[i];
    slots += '<span class="slot' + (d ? ' full' : '') + '" title="' + (d ? d.label : 'Tom lastplats') + '">' +
      (d ? iconSpan(d.icon || 'box') : '') + '</span>';
  }
  $('#cargoRow').innerHTML = slots + '<span>' + carried.length + '/' + cargoMax() + '</span>';
}

function renderQuestChip() {
  const lvl = currentLevel();
  $('#qcTitle').textContent = (game.levelIndex + 1) + '. ' + lvl.title;
  const done = game.deliveries.filter(d => d.state === 'done').length;
  const total = game.deliveries.length;
  let time;
  if (lvl.timeLimit === null) {
    time = iconSpan('sun') + '<b>' + Math.floor(game.clock) + '</b> min';
  } else {
    const left = Math.max(0, lvl.timeLimit - game.clock);
    const warn = left < lvl.timeLimit * 0.25 ? ' warn' : '';
    time = '<span class="' + warn.trim() + '">' + iconSpan('stopwatch') + '<b>' + Math.ceil(left) + '</b> min</span>';
  }
  $('#qcBody').innerHTML = '<span>' + iconSpan('box') + '<b>' + done + '/' + total + '</b></span>' + time;
}

function renderQueue() {
  const ol = $('#queueList');
  ol.innerHTML = '';
  $('#queueHint').style.display = game.queue.length ? 'none' : '';
  $('#queueHint').textContent = isRealtime()
    ? 'Tryck på en plats på kartan så rullar bilen dit direkt. Lägg till fler stopp medan hon kör.'
    : 'Tryck på platser på kartan för att bygga hela körschemat, tryck sedan på Kör.';
  $('#queueCount').textContent = game.queue.length;
  game.queue.forEach((item, i) => {
    const loc = LOCATIONS[item.locId];
    const active = i === 0 && game.running && game.truck.state !== 'idle';
    const li = el('li', active ? 'active' : '');
    let text = loc.name;
    if (item.service) text += ' · ' + SERVICE_TEXT[item.service].queued;
    let prog = '';
    if (active) {
      const t = game.truck;
      if (t.state === 'charge') prog = Math.round((t.battery / batteryMax()) * 100) + ' %';
      else if (t.state === 'eat') prog = Math.round(t.food) + ' %';
      else if (t.state === 'sleep') prog = Math.round(t.energy) + ' %';
      else if (t.state === 'driving') prog = 'kör…';
    }
    li.innerHTML = '<span class="num">' + (i + 1) + '</span>' +
      iconSpan(item.service ? SERVICE_TEXT[item.service].icon : 'marker') +
      '<span class="qtext">' + text + '</span>' +
      (prog ? '<span class="qprog">' + prog + '</span>' : '') +
      '<button class="rm" aria-label="Ta bort">' + iconSpan('trash') + '</button>';
    li.querySelector('.rm').addEventListener('click', ev => { ev.stopPropagation(); removeQueueItem(i); });
    ol.appendChild(li);
  });
  renderControls();
}

function renderControls() {
  const play = $('#playBtn');
  play.innerHTML = game.running
    ? iconSpan('pause') + '<span class="lbl">Paus</span>'
    : iconSpan('play') + '<span class="lbl">' + (isRealtime() && !game.userPaused && !game.queue.length ? 'Starta' : 'Kör') + '</span>';
  play.disabled = game.over;
  $('#speedBtn').innerHTML = iconSpan('fast') + '<span class="lbl">' + game.speed + 'x</span>';
  $('#clearBtn').innerHTML = iconSpan('trash') + '<span class="lbl">Rensa</span>';
  $('#clearBtn').disabled = game.queue.length === 0;
  $('#restartBtn').innerHTML = iconSpan('retry') + '<span class="lbl">Börja om</span>';
}

function renderChips() {
  $('#moneyChip').innerHTML = iconSpan('money') + save.money + ' kr';
  $('#shopBtn').innerHTML = iconSpan('shop') + 'Butik';
  $('#settingsBtn').innerHTML = iconSpan('cog');
  $('#versionBtn').textContent = 'v' + VERSION;
}

function renderAll() {
  renderChips();
  renderQuestChip();
  renderStatus();
  renderQueue();
}

/* ---------- Kamera ---------- */

const canvas = $('#map');
const ctx = canvas.getContext('2d');
const cam = { x: W / 2, y: H / 2, scale: 1 };
let viewW = 0, viewH = 0, dpr = 1;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fitScale = () => Math.min(viewW / (W + 90), viewH / (H + 90));
const minScale = () => fitScale() * 0.75;
const maxScale = () => Math.max(fitScale() * 3.2, 1.8);

// Hela kartan får plats när skärmen har ungefär samma proportioner som världen.
// På smala eller låga skärmar zoomar vi in en bit i stället för att lämna
// halva skärmen tom — resten når man genom att dra.
function defaultScale() {
  const sw = viewW / (W + 90), sh = viewH / (H + 90);
  const fit = Math.min(sw, sh), cover = Math.max(sw, sh);
  if (cover / fit < 1.6) return fit;
  return Math.min(fit * 1.55, cover * 0.8);
}

function clampCam() {
  cam.scale = clamp(cam.scale, minScale(), maxScale());
  const halfW = viewW / (2 * cam.scale), halfH = viewH / (2 * cam.scale);
  const m = 70;
  if (W + m * 2 <= halfW * 2) cam.x = W / 2;
  else cam.x = clamp(cam.x, halfW - m, W - halfW + m);
  if (H + m * 2 <= halfH * 2) cam.y = H / 2;
  else cam.y = clamp(cam.y, halfH - m, H - halfH + m);
}

function resizeCanvas() {
  viewW = window.innerWidth;
  viewH = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  canvas.width = Math.round(viewW * dpr);
  canvas.height = Math.round(viewH * dpr);
  canvas.style.width = viewW + 'px';
  canvas.style.height = viewH + 'px';
  clampCam();
}

function fitView() {
  viewW = window.innerWidth; viewH = window.innerHeight;
  cam.scale = defaultScale();
  cam.x = W / 2; cam.y = H / 2;
  clampCam();
}

function screenToWorld(sx, sy) {
  return { x: (sx - viewW / 2) / cam.scale + cam.x, y: (sy - viewH / 2) / cam.scale + cam.y };
}

function zoomAt(sx, sy, newScale) {
  const before = screenToWorld(sx, sy);
  cam.scale = clamp(newScale, minScale(), maxScale());
  const after = screenToWorld(sx, sy);
  cam.x += before.x - after.x;
  cam.y += before.y - after.y;
  clampCam();
}

/* ---------- Landskap ---------- */

let seed = 1337;
function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }

const scenery = [];
(function buildScenery() {
  const props = ['pine', 'birch', 'pine', 'flowers', 'sunflower', 'pine', 'huts', 'village', 'flowerPot'];
  const isNearRoad = (x, y) => {
    for (const gx of GRID_X) if (Math.abs(x - gx) < 46) return true;
    for (const gy of GRID_Y) if (Math.abs(y - gy) < 46) return true;
    return false;
  };
  for (let i = 0; i < 190; i++) {
    const x = 20 + rnd() * (COAST_X - 40);
    const y = 20 + rnd() * (H - 40);
    if (isNearRoad(x, y)) continue;
    let near = false;
    for (const id in LOCATIONS) {
      const L = LOCATIONS[id];
      if (Math.hypot(L.x + (L.ox || 0) - x, L.y + (L.oy || 0) - y) < 100) { near = true; break; }
    }
    if (near) continue;
    const name = props[(rnd() * props.length) | 0];
    const isTree = name === 'pine' || name === 'birch';
    scenery.push({
      name, x, y,
      size: isTree ? 30 + rnd() * 16 : 22 + rnd() * 10,
      color: isTree ? (rnd() < 0.5 ? '#4f7a45' : '#5c8a4e')
           : name === 'flowers' || name === 'sunflower' || name === 'flowerPot' ? '#c9a84c'
           : '#6d7a86'
    });
  }
  scenery.sort((a, b) => a.y - b.y);
})();

/* ---------- Rendering av kartan ---------- */

let animTime = 0;

function draw() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#1a2430';
  ctx.fillRect(0, 0, viewW, viewH);
  ctx.save();
  ctx.translate(viewW / 2, viewH / 2);
  ctx.scale(cam.scale, cam.scale);
  ctx.translate(-cam.x, -cam.y);

  drawGround();
  drawRoads();
  drawScenery();
  drawRoute();
  for (const id in LOCATIONS) drawLocation(LOCATIONS[id]);
  drawRouteBadges();
  drawTruck();

  ctx.restore();
}

function drawGround() {
  ctx.fillStyle = '#3d5138';
  ctx.fillRect(0, 0, W, H);
  // Fält mellan vägarna
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  const xs = [0].concat(GRID_X, [W]);
  const ys = [0].concat(GRID_Y, [H]);
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      if ((i + j) % 2 === 0) ctx.fillRect(xs[i] + 22, ys[j] + 22, xs[i + 1] - xs[i] - 44, ys[j + 1] - ys[j] - 44);
    }
  }
  // Kust och vatten
  ctx.fillStyle = '#2f5f78';
  ctx.fillRect(COAST_X, 0, W - COAST_X, H);
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  for (let y = 20; y < H; y += 46) {
    const off = Math.sin((y + animTime * 22) / 60) * 9;
    ctx.fillRect(COAST_X + 22 + off, y, 34, 3);
  }
  ctx.fillStyle = '#c8b98d';
  ctx.fillRect(COAST_X - 14, 0, 14, H);
  // Världskant
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 6;
  ctx.strokeRect(0, 0, W, H);
}

function drawRoads() {
  const roadW = 44;
  ctx.lineCap = 'round';
  // Kantsten
  ctx.strokeStyle = '#20242b';
  ctx.lineWidth = roadW + 8;
  strokeGrid();
  // Asfalt
  ctx.strokeStyle = '#33383f';
  ctx.lineWidth = roadW;
  strokeGrid();
  // Mittlinje
  ctx.strokeStyle = 'rgba(246,185,59,0.45)';
  ctx.lineWidth = 3;
  ctx.setLineDash([18, 16]);
  strokeGrid();
  ctx.setLineDash([]);
}

function strokeGrid() {
  ctx.beginPath();
  for (const y of GRID_Y) { ctx.moveTo(GRID_X[0], y); ctx.lineTo(GRID_X[GRID_X.length - 1], y); }
  for (const x of GRID_X) { ctx.moveTo(x, GRID_Y[0]); ctx.lineTo(x, GRID_Y[GRID_Y.length - 1]); }
  ctx.stroke();
}

function drawScenery() {
  if (cam.scale < 0.18) return;
  for (const s of scenery) drawIcon(s.name, s.color, s.x, s.y, s.size);
}

/* ---------- Färdvägen ---------- */

function livePathPoints() {
  const t = game.truck;
  if (t.state !== 'driving' || !t.path.length) return null;
  const pts = [{ x: t.x, y: t.y }];
  for (let i = t.pathIndex + 1; i < t.path.length; i++) pts.push(t.path[i]);
  return pts.length > 1 ? pts : null;
}

function tracePoly(pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
}

function drawRoute() {
  const live = livePathPoints();
  const segs = [];
  if (live) segs.push({ pts: live, live: true, index: 0 });
  for (const s of game.route) segs.push(s);
  if (!segs.length) return;

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Mörk kontur så rutten syns mot asfalten
  ctx.strokeStyle = 'rgba(10,14,20,0.75)';
  ctx.lineWidth = 20;
  for (const s of segs) { tracePoly(s.pts); ctx.stroke(); }

  // Kommande sträckor
  ctx.strokeStyle = 'rgba(126,190,240,0.55)';
  ctx.lineWidth = 11;
  ctx.setLineDash([26, 20]);
  ctx.lineDashOffset = -animTime * 46;
  for (const s of segs) { if (!s.live) { tracePoly(s.pts); ctx.stroke(); } }

  // Aktiv sträcka i gult
  if (live) {
    ctx.strokeStyle = 'rgba(246,185,59,0.95)';
    ctx.lineWidth = 12;
    tracePoly(live);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Riktningspilar
  for (const s of segs) drawArrows(s.pts, s.live ? '#ffd97a' : '#bfe0f7');

  // Numrerade stopp
}

// Numrerade stopp ritas efter husen så de aldrig hamnar bakom
function drawRouteBadges() {
  const segs = [];
  if (livePathPoints()) segs.push({ index: 0 });
  for (const seg of game.route) segs.push(seg);
  if (!segs.length) return;
  const badges = {};
  for (const s of segs) {
    const item = game.queue[s.index];
    if (!item) continue;
    const loc = LOCATIONS[item.locId];
    const b = badges[item.locId] || (badges[item.locId] = { x: markerX(loc) - 34, y: markerY(loc) - 34, nums: [] });
    b.nums.push(s.index + 1);
  }
  for (const k in badges) {
    const b = badges[k];
    const label = b.nums.join(',');
    const r = 15 + (label.length - 1) * 3.5;
    ctx.beginPath();
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#f6b93b';
    ctx.fill();
    ctx.strokeStyle = 'rgba(10,14,20,0.8)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#1c1608';
    ctx.font = '700 19px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, b.x, b.y + 1);
  }
  ctx.textBaseline = 'alphabetic';
}

function drawArrows(pts, color) {
  const spacing = 130;
  let carry = 55 - (animTime * 40) % spacing;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (len < 1) continue;
    const ux = (b.x - a.x) / len, uy = (b.y - a.y) / len;
    for (let d = carry; d < len; d += spacing) {
      if (d < 0) continue;
      const x = a.x + ux * d, y = a.y + uy * d;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.atan2(uy, ux));
      ctx.beginPath();
      ctx.moveTo(9, 0); ctx.lineTo(-7, 7); ctx.lineTo(-3.5, 0); ctx.lineTo(-7, -7);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.strokeStyle = 'rgba(10,14,20,0.7)';
      ctx.lineWidth = 2;
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    carry = ((carry - len) % spacing + spacing) % spacing;
  }
}

/* ---------- Platser & lastbil ---------- */

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const markerX = loc => loc.x + (loc.ox || 0);
const markerY = loc => loc.y + (loc.oy || 0);

function drawLocation(loc) {
  const pickup = game.deliveries.some(d => d.state === 'waiting' && d.from === loc.id);
  const dropoff = game.deliveries.some(d => d.state === 'carried' && d.to === loc.id);
  const s = 62;
  const mx = markerX(loc), my = markerY(loc);

  // Infart från vägkorsningen fram till huset
  ctx.strokeStyle = '#4a4034';
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(loc.x, loc.y);
  ctx.lineTo(mx, my);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = 'rgba(22,27,35,0.92)';
  roundRect(mx - s / 2, my - s / 2, s, s, 14);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = dropoff ? '#f6b93b' : pickup ? '#7ebef0' : 'rgba(255,255,255,0.28)';
  ctx.lineWidth = dropoff || pickup ? 4 : 2;
  roundRect(mx - s / 2, my - s / 2, s, s, 14);
  ctx.stroke();

  drawIcon(loc.icon, loc.color, mx, my - 2, 36);

  if (pickup || dropoff) {
    const bx = mx + s / 2 - 4, by = my - s / 2 + 4;
    ctx.beginPath();
    ctx.arc(bx, by, 13, 0, Math.PI * 2);
    ctx.fillStyle = dropoff ? '#f6b93b' : '#7ebef0';
    ctx.fill();
    ctx.strokeStyle = 'rgba(10,14,20,0.8)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    drawIcon('box', '#14181f', bx, by, 15);
  }

  // Skärmkonstant etikett
  const fs = clamp(15 / cam.scale, 13, 34);
  ctx.font = '700 ' + fs + 'px system-ui, sans-serif';
  ctx.textAlign = 'center';
  const label = loc.who && cam.scale > 0.55 ? loc.name + ' · ' + loc.who : loc.name;
  const tw = ctx.measureText(label).width;
  const ly = my + s / 2 + fs * 0.55 + 6;
  ctx.fillStyle = 'rgba(16,20,27,0.82)';
  roundRect(mx - tw / 2 - 8, ly - fs * 0.78, tw + 16, fs * 1.25, fs * 0.5);
  ctx.fill();
  ctx.fillStyle = '#e8ecf2';
  ctx.fillText(label, mx, ly + fs * 0.28);
}

function drawTruck() {
  const t = game.truck;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(t.x, t.y + 16, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(t.x, t.y);
  if (t.facing < 0) ctx.scale(-1, 1);
  const img = iconImage('truck', '#f6b93b');
  if (img.complete && img.naturalWidth) ctx.drawImage(img, -24, -26, 48, 48);
  ctx.restore();

  const bubble = t.state === 'charge' ? 'charge' : t.state === 'eat' ? 'meal' : t.state === 'sleep' ? 'nightSleep' : null;
  if (bubble) {
    const by = t.y - 44 - Math.sin(animTime * 3) * 3;
    ctx.beginPath();
    ctx.arc(t.x, by, 17, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16,20,27,0.92)';
    ctx.fill();
    ctx.strokeStyle = '#f6b93b';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawIcon(bubble, '#f6b93b', t.x, by, 21);
  }
}

/* ---------- Panorering, zoom och tryck ---------- */

const pointers = new Map();
let dragAnchor = null, moveDist = 0, downTime = 0, pinch = null;

canvas.addEventListener('pointerdown', ev => {
  canvas.setPointerCapture(ev.pointerId);
  pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  if (pointers.size === 1) {
    dragAnchor = { x: ev.clientX, y: ev.clientY };
    moveDist = 0;
    downTime = performance.now();
    canvas.classList.add('grabbing');
  } else if (pointers.size === 2) {
    const p = [...pointers.values()];
    pinch = {
      dist: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y),
      scale: cam.scale,
      mid: { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 }
    };
    dragAnchor = null;
    moveDist = 999;
  }
});

canvas.addEventListener('pointermove', ev => {
  if (!pointers.has(ev.pointerId)) return;
  pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  if (pointers.size >= 2 && pinch) {
    const p = [...pointers.values()];
    const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
    const mid = { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 };
    if (pinch.dist > 0) {
      // Panorera med mittpunkten och zooma med avståndet
      cam.x -= (mid.x - pinch.mid.x) / cam.scale;
      cam.y -= (mid.y - pinch.mid.y) / cam.scale;
      pinch.mid = mid;
      zoomAt(mid.x, mid.y, pinch.scale * (d / pinch.dist));
    }
  } else if (dragAnchor) {
    const dx = ev.clientX - dragAnchor.x, dy = ev.clientY - dragAnchor.y;
    moveDist += Math.hypot(dx, dy);
    cam.x -= dx / cam.scale;
    cam.y -= dy / cam.scale;
    clampCam();
    dragAnchor = { x: ev.clientX, y: ev.clientY };
  }
});

function endPointer(ev) {
  if (!pointers.has(ev.pointerId)) return;
  const wasSingle = pointers.size === 1;
  pointers.delete(ev.pointerId);
  if (wasSingle) {
    canvas.classList.remove('grabbing');
    if (moveDist < 10 && performance.now() - downTime < 500) {
      const p = screenToWorld(ev.clientX, ev.clientY);
      const id = locationAt(p.x, p.y);
      if (id) queueLocation(id);
    }
    dragAnchor = null;
  }
  if (pointers.size < 2) pinch = null;
  if (pointers.size === 1) {
    const p = [...pointers.values()][0];
    dragAnchor = { x: p.x, y: p.y };
    moveDist = 999;
  }
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);

canvas.addEventListener('wheel', ev => {
  ev.preventDefault();
  const factor = Math.pow(0.999, ev.deltaY * (ev.deltaMode === 1 ? 18 : 1));
  zoomAt(ev.clientX, ev.clientY, cam.scale * factor);
}, { passive: false });

function locationAt(wx, wy) {
  let best = null, bestD = Infinity;
  for (const id in LOCATIONS) {
    const L = LOCATIONS[id];
    // Träff både på huset och på vägkorsningen det ligger vid
    const d = Math.min(
      Math.hypot(markerX(L) - wx, markerY(L) - wy) / 56,
      Math.hypot(L.x - wx, L.y - wy) / 34
    );
    if (d < 1 && d < bestD) { bestD = d; best = id; }
  }
  return best;
}

/* ---------- Knappar ---------- */

$('#playBtn').addEventListener('click', () => {
  if (game.over) return;
  if (game.running) { game.running = false; game.userPaused = true; }
  else { game.userPaused = false; startLevel(); }
  renderControls();
});
$('#speedBtn').addEventListener('click', () => {
  game.speed = game.speed === 1 ? 2 : game.speed === 2 ? 4 : 1;
  renderControls();
});
$('#clearBtn').addEventListener('click', clearQueue);
$('#restartBtn').addEventListener('click', () => { toast('Uppdraget börjar om.', 'retry'); setupLevel(); });
$('#questChip').addEventListener('click', () => showQuestModal(false));
$('#versionBtn').addEventListener('click', showChangelogModal);
$('#settingsBtn').addEventListener('click', () => {
  if (game.running) { game.running = false; game.userPaused = true; renderControls(); }
  showSettingsModal();
});
$('#shopBtn').addEventListener('click', () => {
  if (game.running) { game.running = false; renderControls(); }
  showShopModal(null);
});
$('#queueToggle').addEventListener('click', () => $('#queuePanel').classList.toggle('collapsed'));
$('#zoomIn').addEventListener('click', () => zoomAt(viewW / 2, viewH / 2, cam.scale * 1.3));
$('#zoomOut').addEventListener('click', () => zoomAt(viewW / 2, viewH / 2, cam.scale / 1.3));
$('#zoomFit').innerHTML = ICONS.expand ? '<span class="icon">' + ICONS.expand + '</span>' : '⤢';
$('#zoomFit').addEventListener('click', fitView);
$('#modalBackdrop').addEventListener('pointerdown', ev => { if (ev.target.id === 'modalBackdrop') hideModal(); });

window.addEventListener('resize', () => { resizeCanvas(); });
window.addEventListener('orientationchange', () => setTimeout(() => { resizeCanvas(); fitView(); }, 120));

/* ---------- Blockera zoom, markering och förstoringsglas ---------- */

let lastTouchEnd = 0;
document.addEventListener('touchend', ev => {
  const now = Date.now();
  if (now - lastTouchEnd < 350) ev.preventDefault();
  lastTouchEnd = now;
}, { passive: false });
document.addEventListener('touchmove', ev => { if (ev.touches.length > 1) ev.preventDefault(); }, { passive: false });
for (const n of ['gesturestart', 'gesturechange', 'gestureend']) {
  document.addEventListener(n, ev => ev.preventDefault(), { passive: false });
}
document.addEventListener('dblclick', ev => ev.preventDefault(), { passive: false });
document.addEventListener('contextmenu', ev => ev.preventDefault());
document.addEventListener('selectstart', ev => ev.preventDefault());

/* ---------- Loop ---------- */

let lastTime = performance.now();
let hudAccum = 0;

function frame(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  animTime += dt;
  tick(dt);
  hudAccum += dt;
  if (hudAccum > 0.12) {
    hudAccum = 0;
    if (game.running) { renderStatus(); renderQuestChip(); renderQueue(); }
  }
  draw();
  requestAnimationFrame(frame);
}

/* ---------- Start ---------- */

game.levelIndex = Math.min(save.level, LEVELS.length - 1);
if (window.innerWidth < 560) $('#queuePanel').classList.add('collapsed');
resizeCanvas();
fitView();
renderAll();
setupLevel();
requestAnimationFrame(frame);
