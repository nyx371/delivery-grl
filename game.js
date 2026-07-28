'use strict';

/* ============================================================
   Delivery Girl — ett varmt strategiskt planeringsspel
   Vanilla JS + Canvas. Symboler: game-icons.net (CC BY 3.0)
   ============================================================ */

const VERSION = '1.5.0';

const CHANGELOG = [
  {
    version: '1.5.0',
    date: '2026-07-28',
    items: [
      'Enklare uppdrag: kort beskrivning, inga personnamn, och platser som helt enkelt heter Bageriet, Caféet och Fiskrestaurangen.',
      'Bara de platser uppdraget handlar om visas på kartan — fler dyker upp allt eftersom uppdragen blir svårare.',
      'Hämtställen ritas som en hög med fem varor, så man ser direkt vad som finns att hämta.',
      'Butiker är hus med en skylt som visar vad de handlar med.',
      'Den som väntar på en leverans har en gungande pratbubbla med symbolen för varan den vill ha.',
      'Bilen kryper fram när batteriet eller föraren börjar ta slut, och visar en pratbubbla med vad som fattas.'
    ]
  },
  {
    version: '1.4.0',
    date: '2026-07-28',
    items: [
      'Ny och mycket större karta: en stadsö i Södermalms anda, omgiven av vatten man inte kan köra i.',
      'Riktiga gator i stället för rutnät — Götgatan, Hornsgatan, den krokiga Ringvägen, Folkungagatan och Katarinavägen, med gatunamn när du zoomar in.',
      'Två broar till fastlandet: Slussenbron upp till Grossisten och Skanstullsbron ner till Motell Vilan.',
      'Parker och berg som Vitabergsparken och Tantolunden ligger i vägen och måste köras runt.',
      'Inget sparas längre mellan sidladdningar — varje omladdning är en ny arbetsdag.',
      'Uppdragsväljare i inställningarna: hoppa till vilket pass du vill och få med dig lönen för dem du hoppar över.',
      'Körschemat göms i direktläge, där du ändå styr direkt på kartan — de köade stoppen syns som numrerade brickor.',
      'Mobilanpassning: tumstora knappar, träffytor som mäts i skärmpixlar och skyltar som växer när du zoomar ut.'
    ]
  },
  {
    version: '1.3.0',
    date: '2026-07-28',
    items: [
      'Kartan fyller hela webbläsarfönstret — inga svarta kanter kvar oavsett skärmform.',
      'Landsbygden fortsätter utanför stan med åkrar, skogsdungar och hav, så vyn aldrig tar slut.',
      'Vägarna löper ut ur stan och kameran får svepa en bit ut i landskapet.',
      'Du kan zooma ut längre än förut och fortfarande se sammanhängande mark.',
      'Ikonerna ritas av till små bilder en gång i stället för att skalas om varje bildruta — kartan går nu flera gånger snabbare trots mycket mer landskap.'
    ]
  },
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
/* En ö med oregelbundna gator, i andan av Södermalm i Stockholm:
   en lång huvudgata norrut–söderut, en krokig ringväg runt söderkanten,
   branta parker man inte kan köra i, och två broar till fastlandet. */

const W = 3200, H = 2400;

// Vägkorsningar. Allt annat härleds ur gatorna nedan.
const NODES = {
  gamlastan:  [1210, 430],   // fastlandet i norr, andra sidan bron
  slussen:    [1250, 700],
  mariatorget:[1255, 850],
  medis:      [1270, 1010],  // Medborgarplatsen
  gotg4:      [1290, 1190],
  gotg5:      [1305, 1400],
  skanstull:  [1325, 1620],
  arsta:      [1370, 1880],  // fastlandet i söder

  horns1:     [1060, 900],
  horns2:     [860, 960],
  horns3:     [660, 1030],
  hornstull:  [450, 1120],

  bergs1:     [470, 930],
  bergs2:     [680, 840],
  bergs3:     [930, 780],

  sweden1:    [840, 1140],
  sweden2:    [810, 1300],

  ring1:      [520, 1290],
  ring2:      [790, 1420],
  ring3:      [1060, 1520],
  ring5:      [1610, 1560],
  ring6:      [1870, 1490],
  ring7:      [2120, 1390],
  ring8:      [2340, 1250],
  ring9:      [2450, 1060],

  folk1:      [1520, 1000],
  folk2:      [1780, 990],
  folk3:      [2040, 1000],
  folk4:      [2280, 1040],

  kat1:       [1500, 740],
  kat2:       [1780, 770],
  kat3:       [2060, 810],
  kat4:       [2320, 880],

  rens1:      [1810, 1180],
  rens2:      [1840, 1340],
  skane1:     [1550, 1185],  // Nytorget
  bonde1:     [1570, 1370]
};

// Gator som polylinjer — ger både vägnätet och hur de ritas ut
const STREETS = [
  { name: 'Götgatan',        nodes: ['slussen', 'mariatorget', 'medis', 'gotg4', 'gotg5', 'skanstull'], big: true },
  { name: 'Hornsgatan',      nodes: ['mariatorget', 'horns1', 'horns2', 'horns3', 'hornstull'], big: true },
  { name: 'Folkungagatan',   nodes: ['medis', 'folk1', 'folk2', 'folk3', 'folk4', 'ring9'], big: true },
  { name: 'Ringvägen',       nodes: ['hornstull', 'ring1', 'ring2', 'ring3', 'skanstull', 'ring5', 'ring6', 'ring7', 'ring8', 'ring9'], big: true },
  { name: 'Katarinavägen',   nodes: ['slussen', 'kat1', 'kat2', 'kat3', 'kat4', 'ring9'], big: true },
  { name: 'Bergsgatan',      nodes: ['hornstull', 'bergs1', 'bergs2', 'bergs3', 'slussen'] },
  { name: 'Swedenborgsgatan',nodes: ['horns2', 'sweden1', 'sweden2', 'ring2'] },
  { name: 'Renstiernas gata',nodes: ['folk2', 'rens1', 'rens2', 'ring6'] },
  { name: 'Skånegatan',      nodes: ['gotg4', 'skane1', 'rens1'] },
  { name: 'Bondegatan',      nodes: ['gotg5', 'bonde1', 'rens2'] },
  { name: 'Ansgariegatan',   nodes: ['horns3', 'ring1'] },
  { name: 'Blekingegatan',   nodes: ['gotg5', 'ring3'] },
  { name: 'Nytorgsgatan',    nodes: ['skane1', 'bonde1'] },
  { name: 'Tjärhovsgatan',   nodes: ['folk1', 'skane1'] },
  { name: 'Slussenbron',     nodes: ['slussen', 'gamlastan'], bridge: true },
  { name: 'Skanstullsbron',  nodes: ['skanstull', 'arsta'], bridge: true }
];

function nodeKey(x, y) { return x + ',' + y; }
function keyToPoint(k) { const p = k.split(','); return { x: +p[0], y: +p[1] }; }
const nodeAt = id => ({ x: NODES[id][0], y: NODES[id][1] });
const keyOf = id => nodeKey(NODES[id][0], NODES[id][1]);

const graph = {};
(function buildGraph() {
  for (const id in NODES) graph[keyOf(id)] = [];
  for (const st of STREETS) {
    for (let i = 0; i < st.nodes.length - 1; i++) {
      const a = nodeAt(st.nodes[i]), b = nodeAt(st.nodes[i + 1]);
      const ka = keyOf(st.nodes[i]), kb = keyOf(st.nodes[i + 1]);
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      if (!graph[ka].some(e => e.key === kb)) graph[ka].push({ key: kb, dist: d });
      if (!graph[kb].some(e => e.key === ka)) graph[kb].push({ key: ka, dist: d });
    }
  }
})();

// Ön och fastlandsbitarna. Allt utanför är vatten som inte går att köra i.
const ISLAND = [
  [330, 1050], [420, 880], [620, 760], [900, 680], [1200, 620], [1500, 600],
  [1800, 620], [2100, 660], [2350, 730], [2560, 830], [2680, 980], [2700, 1150],
  [2620, 1320], [2450, 1450], [2200, 1550], [1950, 1620], [1700, 1680],
  [1450, 1710], [1200, 1700], [950, 1650], [720, 1560], [520, 1420], [380, 1240]
];
const MAINLAND_N = [[880, 180], [1620, 180], [1660, 470], [1420, 520], [1080, 500], [860, 440]];
const MAINLAND_S = [[1120, 1830], [1500, 1800], [1780, 1870], [1800, 2180], [1140, 2160]];
const LANDS = [ISLAND, MAINLAND_N, MAINLAND_S];

// Parker och berg — vackra, men inget man kör igenom
const PARKS = [
  { name: 'Vitabergsparken',    cx: 2000, cy: 1230, rx: 175, ry: 145 },
  { name: 'Tantolunden',        cx: 700,  cy: 1555, rx: 175, ry: 95 },
  { name: 'Skinnarviksberget',  cx: 855,  cy: 880,  rx: 115, ry: 70 },
  { name: 'Vasaparken',         cx: 2270, cy: 1180, rx: 90,  ry: 70 },
  { name: 'Fatbursparken',      cx: 1120, cy: 1300, rx: 120, ry: 85 },
  { name: 'Rosenlundsparken',   cx: 1000, cy: 1130, rx: 95,  ry: 60 }
];

function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const onLand = (x, y) => LANDS.some(poly => pointInPoly(x, y, poly));
const inPark = (x, y) => PARKS.some(p => ((x - p.cx) / p.rx) ** 2 + ((y - p.cy) / p.ry) ** 2 < 1);

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

/* Varje plats är antingen ett ställe man hämtar varor (ritas som en hög
   av fem varor), ett ställe som vill ha leverans (ett hus med skylt), en
   service, eller depån. Bara de platser uppdraget handlar om visas. */

const LOC_DEFS = {
  depot:    { node: 'hornstull', name: 'Depån', kind: 'depot', icon: 'truck', color: '#f6b93b' },

  // Hämtställen
  bageriet: { node: 'mariatorget', name: 'Bageriet',     kind: 'pickup', item: 'bread',  color: '#e0b978' },
  fisken:   { node: 'kat3',        name: 'Fiskhamnen',   kind: 'pickup', item: 'fish',   color: '#8fd3f4' },
  odlingen: { node: 'ring3',       name: 'Odlingen',     kind: 'pickup', item: 'carrot', color: '#e08a4a' },
  mejeriet: { node: 'bergs3',      name: 'Mejeriet',     kind: 'pickup', item: 'milk',   color: '#dfe6ee' },
  lagret:   { node: 'gamlastan',   name: 'Lagret',       kind: 'pickup', item: 'crate',  color: '#c9a066' },
  bryggeriet:{ node: 'ring7',      name: 'Bryggeriet',   kind: 'pickup', item: 'beer',   color: '#c98a3a' },

  // Ställen som vill ha leverans
  cafeet:   { node: 'medis',       name: 'Caféet',           kind: 'shop', icon: 'coffee',   color: '#d9a066' },
  fiskrest: { node: 'skane1',      name: 'Fiskrestaurangen', kind: 'shop', icon: 'fish',     color: '#7fc4e8' },
  pizzerian:{ node: 'folk2',       name: 'Pizzerian',        kind: 'shop', icon: 'pizza',    color: '#e2705a' },
  glassbaren:{ node: 'ring5',      name: 'Glassbaren',       kind: 'shop', icon: 'icecream', color: '#f5b8d0' },
  blomsteraffaren:{ node: 'sweden1',name: 'Blomsteraffären',  kind: 'shop', icon: 'sunflower',color: '#e8c84a' },
  hotellet: { node: 'kat1',        name: 'Hotellet',         kind: 'shop', icon: 'wine',     color: '#b18ae0' },
  skolan:   { node: 'bonde1',       name: 'Skolan',           kind: 'shop', icon: 'apple',    color: '#a3d977' },

  // Service
  laddstationen: { node: 'gotg4', name: 'Laddstationen', kind: 'service', icon: 'gasPump', color: '#57c26b', service: 'charge' },
  matstallet:    { node: 'horns3', name: 'Matstället',   kind: 'service', icon: 'burger',  color: '#f0913d', service: 'eat' },
  vandrarhemmet: { node: 'arsta',  name: 'Vandrarhemmet',kind: 'service', icon: 'bed',     color: '#b18ae0', service: 'sleep' }
};

// Vart husen ställs i förhållande till korsningen de ligger vid
const LOC_OFFSETS = {
  depot: [-60, -90], bageriet: [-105, -72], fisken: [20, -100], odlingen: [-20, 100],
  mejeriet: [10, -105], lagret: [-100, -70], bryggeriet: [95, 70],
  cafeet: [-105, 80], fiskrest: [96, 78], pizzerian: [30, -100], glassbaren: [-30, 100],
  blomsteraffaren: [-100, 60], hotellet: [-40, -100], skolan: [-40, 100],
  laddstationen: [100, -60], matstallet: [-20, -98], vandrarhemmet: [105, 40]
};

const LOCATIONS = {};
for (const id in LOC_DEFS) {
  const d = LOC_DEFS[id];
  const off = LOC_OFFSETS[id] || [0, -90];
  LOCATIONS[id] = Object.assign({ id, x: NODES[d.node][0], y: NODES[d.node][1], ox: off[0], oy: off[1] }, d);
  // Hämtställen visar sin vara, butiker sin skylt
  if (!LOCATIONS[id].icon) LOCATIONS[id].icon = LOCATIONS[id].item;
}

const ITEM_NAMES = {
  bread: 'Bröd', fish: 'Fisk', carrot: 'Grönsaker', milk: 'Mjölk', crate: 'Lådor',
  beer: 'Dryck', sunflower: 'Blommor', cake: 'Tårta', coffee: 'Kaffe', wine: 'Vin',
  cheese: 'Ost', meat: 'Kött', icecream: 'Glass', apple: 'Frukt', box: 'Paket'
};
const itemName = it => ITEM_NAMES[it] || 'Varor';

const SERVICE_TEXT = {
  charge: { doing: 'Laddar batteriet', queued: 'ladda batteriet', icon: 'charge' },
  eat:    { doing: 'Äter',             queued: 'ät',              icon: 'meal' },
  sleep:  { doing: 'Sover',            queued: 'sov',             icon: 'nightSleep' }
};

/* ---------- Nivåer ---------- */

/* Varje uppdrag listar sina leveranser (hämtställe → butik) och vilka
   extra platser som ska synas. Bara dessa platser ritas ut på kartan. */

const LEVELS = [
  {
    title: 'Bröd till caféet',
    story: 'Hämta bröd i bageriet och kör det till caféet. Åk sedan hem till depån.',
    timeLimit: null, reward: 450,
    deliveries: [{ from: 'bageriet', to: 'cafeet', item: 'bread' }],
    returnHome: true
  },
  {
    title: 'Bröd och fisk',
    story: 'Två leveranser. Flaket rymmer bara en last i taget, så det blir två vändor.',
    timeLimit: 55, reward: 550,
    deliveries: [
      { from: 'bageriet', to: 'cafeet', item: 'bread' },
      { from: 'fisken', to: 'fiskrest', item: 'fish' }
    ],
    returnHome: true
  },
  {
    title: 'Grönsaker till pizzerian',
    story: 'Längre körningar i dag. Ladda batteriet på vägen om det behövs.',
    timeLimit: 75, reward: 650,
    deliveries: [
      { from: 'odlingen', to: 'pizzerian', item: 'carrot' },
      { from: 'fisken', to: 'fiskrest', item: 'fish' }
    ],
    extra: ['laddstationen'],
    returnHome: true
  },
  {
    title: 'Lunchrusningen',
    story: 'Tre kök väntar på varor före lunch.',
    timeLimit: 105, reward: 800,
    deliveries: [
      { from: 'bageriet', to: 'cafeet', item: 'bread' },
      { from: 'odlingen', to: 'pizzerian', item: 'carrot' },
      { from: 'fisken', to: 'fiskrest', item: 'fish' }
    ],
    extra: ['laddstationen'],
    returnHome: true
  },
  {
    title: 'Långpasset',
    story: 'Ett långt pass. Du har redan kört i dag, så planera in mat och vila.',
    timeLimit: 100, reward: 950, startEnergy: 65, startFood: 60,
    deliveries: [
      { from: 'mejeriet', to: 'cafeet', item: 'milk' },
      { from: 'odlingen', to: 'pizzerian', item: 'carrot' },
      { from: 'fisken', to: 'fiskrest', item: 'fish' }
    ],
    extra: ['laddstationen', 'matstallet', 'vandrarhemmet'],
    returnHome: true
  },
  {
    title: 'Över bron',
    story: 'Varorna ligger i lagret på andra sidan bron. Enda vägen dit är över Slussenbron.',
    timeLimit: 48, reward: 900,
    deliveries: [
      { from: 'lagret', to: 'glassbaren', item: 'crate' },
      { from: 'mejeriet', to: 'cafeet', item: 'milk' }
    ],
    extra: ['laddstationen', 'matstallet'],
    returnHome: true
  },
  {
    title: 'Blommor och bröd',
    story: 'Fyra stopp, tre olika varor. Tänk ut i vilken ordning du tar dem.',
    timeLimit: 58, reward: 1100,
    deliveries: [
      { from: 'odlingen', to: 'blomsteraffaren', item: 'sunflower' },
      { from: 'bageriet', to: 'cafeet', item: 'bread' },
      { from: 'fisken', to: 'hotellet', item: 'fish' }
    ],
    extra: ['laddstationen', 'matstallet', 'vandrarhemmet'],
    returnHome: true
  },
  {
    title: 'Storleveransen',
    story: 'Lagret ska tömmas. Ett större flak sparar många vändor.',
    timeLimit: 135, reward: 1300, startEnergy: 65,
    deliveries: [
      { from: 'lagret', to: 'skolan', item: 'crate' },
      { from: 'mejeriet', to: 'skolan', item: 'milk' },
      { from: 'odlingen', to: 'pizzerian', item: 'carrot' },
      { from: 'bageriet', to: 'cafeet', item: 'bread' }
    ],
    extra: ['laddstationen', 'matstallet', 'vandrarhemmet'],
    returnHome: true
  },
  {
    title: 'Expressrundan',
    story: 'Tre leveranser på kort tid. Undvik omvägar.',
    timeLimit: 100, reward: 1500,
    deliveries: [
      { from: 'bageriet', to: 'glassbaren', item: 'cake' },
      { from: 'fisken', to: 'fiskrest', item: 'fish' },
      { from: 'bryggeriet', to: 'hotellet', item: 'beer' }
    ],
    extra: ['laddstationen', 'matstallet'],
    returnHome: true
  },
  {
    title: 'Hela stan',
    story: 'Sista passet: fem leveranser över hela stan. Ladda, ät och sov i rätt lägen.',
    timeLimit: 250, reward: 2000, startEnergy: 70, startFood: 60,
    deliveries: [
      { from: 'mejeriet', to: 'cafeet', item: 'milk' },
      { from: 'odlingen', to: 'pizzerian', item: 'carrot' },
      { from: 'fisken', to: 'fiskrest', item: 'fish' },
      { from: 'bryggeriet', to: 'hotellet', item: 'beer' },
      { from: 'lagret', to: 'skolan', item: 'crate' }
    ],
    extra: ['laddstationen', 'matstallet', 'vandrarhemmet'],
    returnHome: true
  }
];

// Vilka platser som ska ritas ut under ett visst uppdrag
function levelPlaces(lvl) {
  const set = new Set(['depot']);
  for (const d of lvl.deliveries) { set.add(d.from); set.add(d.to); }
  for (const e of lvl.extra || []) set.add(e);
  return set;
}

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
  truckSpeed: 260,
  minutesPerSecond: 1.65,
  batteryBase: 100,
  batteryPerUpgrade: 40,
  batteryDrainPer100px: 1.42,
  chargeRate: 5,
  energyMax: 100,
  energyDrainDrive: 0.8,
  energyDrainIdle: 0.35,
  sleepRate: 6,
  foodMax: 100,
  foodDrain: 0.45,
  eatRate: 12
};

/* ---------- Körningen ---------- */
/* Inget sparas mellan sidladdningar — varje omladdning är en ny arbetsdag.
   Vill man hoppa till ett senare uppdrag finns uppdragsväljaren i
   inställningarna, och man får då med sig lönen för passen man hoppat över. */

function newRun() {
  return {
    level: 0, money: 0,
    mode: 'realtime', // 'realtime' = välj åtgärder medan bilen kör, 'planning' = planera först
    upgrades: { batteryCap: 0, chargeSpeed: 0, cargo: 0, thermos: 0, coolbox: 0 }
  };
}

let run = newRun();

/* ---------- Speltillstånd ---------- */

const game = {
  levelIndex: 0,
  running: false,
  speed: 1,
  clock: 0,
  queue: [],
  deliveries: [],
  route: [],
  places: new Set(['depot']),
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

const batteryMax = () => BAL.batteryBase + run.upgrades.batteryCap * BAL.batteryPerUpgrade;
const cargoMax = () => 1 + run.upgrades.cargo;
const chargeRate = () => BAL.chargeRate * Math.pow(2, run.upgrades.chargeSpeed);
const energyFactor = () => Math.pow(0.75, run.upgrades.thermos);
const foodFactor = () => Math.pow(0.75, run.upgrades.coolbox);
const currentLevel = () => LEVELS[game.levelIndex];
const isRealtime = () => run.mode !== 'planning';
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
// SVG:erna rasteriseras i 512x512. Att skala ner dem till 30 px varje bild
// är dyrt, så vi ritar av dem en gång till en liten canvas och återanvänder den.
const rasterCache = {};
function rasterIcon(name, color, size) {
  // Bucket efter hur stor ikonen faktiskt blir på skärmen, så den håller
  // sig skarp när man zoomar in utan att kosta något när man zoomar ut.
  const onScreen = size * cam.scale;
  const bucket = onScreen <= 48 ? 64 : onScreen <= 112 ? 128 : 256;
  const key = name + '|' + color + '|' + bucket;
  let c = rasterCache[key];
  if (!c) {
    const img = iconImage(name, color);
    if (!img.complete || !img.naturalWidth) return null; // laddas fortfarande
    c = document.createElement('canvas');
    c.width = c.height = bucket;
    c.getContext('2d').drawImage(img, 0, 0, bucket, bucket);
    rasterCache[key] = c;
  }
  return c;
}

function drawIcon(name, color, cx, cy, size) {
  const c = rasterIcon(name, color, size);
  if (c) ctx.drawImage(c, cx - size / 2, cy - size / 2, size, size);
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
      toast(itemName(d.item) + ' levererat till ' + loc.name + '!', 'check');
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
        toast(itemName(d.item) + ' lastat (' + carriedCount() + '/' + cargoMax() + ').', d.item);
      } else {
        toast('Flaket är fullt — ' + itemName(d.item) + ' fick vänta.', 'cancel');
      }
    }
  }
}

// Med lite ström i batteriet eller trött förare kryper bilen fram
function powerFactor() {
  const t = game.truck;
  const b = t.battery / batteryMax(), e = t.energy / BAL.energyMax;
  let f = 1;
  if (b < 0.25) f = Math.min(f, 0.5 + (b / 0.25) * 0.5);
  if (e < 0.25) f = Math.min(f, 0.6 + (e / 0.25) * 0.4);
  return Math.max(0.5, f);
}

// Vilken varning bilen ska visa i sin pratbubbla, om någon
function truckWarning() {
  const t = game.truck;
  if (t.state !== 'driving') return null;
  const b = t.battery / batteryMax(), e = t.energy / BAL.energyMax, f = t.food / BAL.foodMax;
  const worst = Math.min(b, e, f);
  if (worst >= 0.25) return null;
  if (worst === b) return 'charge';
  if (worst === e) return 'coffee';
  return 'meal';
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
    let travel = BAL.truckSpeed * dtReal * game.speed * powerFactor();
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
    if (t.battery <= 0) { t.battery = 0; return failLevel('Batteriet tog slut mitt på vägen. Ladda innan mätaren når botten.', 'batteryPack'); }
  }

  if (t.state === 'charge') {
    t.battery = Math.min(batteryMax(), t.battery + chargeRate() * dtMin);
    if (t.battery >= batteryMax() - 0.01) finishService('Batteriet fulladdat!', 'charge');
  } else if (t.state === 'eat') {
    t.food = Math.min(BAL.foodMax, t.food + BAL.eatRate * dtMin);
    if (t.food >= BAL.foodMax - 0.01) finishService('Mätt och belåten.', 'meal');
  } else if (t.state === 'sleep') {
    t.energy = Math.min(BAL.energyMax, t.energy + BAL.sleepRate * dtMin);
    if (t.energy >= BAL.energyMax - 0.01) finishService('Utsövd och pigg!', 'nightSleep');
  }

  const drain = (t.state === 'driving' ? BAL.energyDrainDrive : BAL.energyDrainIdle) * energyFactor();
  if (t.state !== 'sleep') t.energy -= drain * dtMin;
  if (t.state !== 'eat') t.food -= BAL.foodDrain * foodFactor() * dtMin;

  if (t.energy <= 0) { t.energy = 0; return failLevel('Du somnade vid ratten. Sov på vandrarhemmet innan energin tar slut.', 'nightSleep'); }
  if (t.food <= 0) { t.food = 0; return failLevel('Du blev yr av hunger. Stanna vid matstället och ät i tid.', 'meal'); }

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
  game.places = levelPlaces(lvl);
  game.deliveries = lvl.deliveries.map(d => Object.assign({}, d, { state: 'waiting' }));
  const t = game.truck;
  t.x = LOCATIONS.depot.x; t.y = LOCATIONS.depot.y;
  t.atNode = nodeKey(LOCATIONS.depot.x, LOCATIONS.depot.y);
  t.path = []; t.pathIndex = 0; t.facing = 1;
  t.state = 'idle';
  t.battery = batteryMax();
  t.energy = lvl.startEnergy || BAL.energyMax;
  t.food = lvl.startFood || BAL.foodMax;
  resetView();
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
  run.money += total;
  const wasLast = game.levelIndex >= LEVELS.length - 1;
  if (!wasLast) run.level = Math.max(run.level, game.levelIndex + 1);
  else run.finished = true;
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
    const ic = d.state === 'done' ? 'check' : d.item;
    const to = LOCATIONS[d.to], from = LOCATIONS[d.from];
    const where = d.state === 'carried' ? 'på flaket → ' + to.name
                : d.state === 'done' ? 'levererat till ' + to.name
                : from.name + ' → ' + to.name;
    html += '<li class="' + cls + '">' + iconSpan(ic) + '<span class="obj-text"><b>' + itemName(d.item) + '</b> — ' + where + '</span></li>';
  }
  if (lvl.returnHome) {
    const allDone = game.deliveries.every(d => d.state === 'done');
    const home = allDone && game.truck.atNode === nodeKey(LOCATIONS.depot.x, LOCATIONS.depot.y) && game.truck.state !== 'driving';
    html += '<li class="' + (home ? 'done' : allDone ? 'carried' : 'pending') + '">' + iconSpan(home ? 'check' : 'house') +
      '<span class="obj-text">Kör tillbaka till depån</span></li>';
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
        '. Planera in vila och mat.</p>'
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
    'Allt kom fram i tid.',
    'Kunderna är nöjda.',
    'Snyggt kört.',
    'Inte en enda låda tappad.',
    'Precis i tid, som vanligt.'
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
  else $('#modalNext').addEventListener('click', () => { game.levelIndex = run.level; setupLevel(); });
}

function showVictoryModal() {
  showModal(
    '<p class="eyebrow">Alla uppdrag slutförda</p>' +
    '<h2>' + iconSpan('trophy') + 'Tack för i dag!</h2>' +
    '<p class="story">Alla leveranser är gjorda och lyktorna tänds på torget. Du är stadens bästa budbil.</p>' +
    '<p class="sub">' + iconSpan('money') + ' Sammanlagd kassa: ' + run.money + ' kr</p>' +
    '<div class="btnrow">' +
    '<button class="btn" id="modalReplay">' + iconSpan('retry') + '<span class="lbl">Kör sista igen</span></button>' +
    '<button class="btn danger" id="modalReset">' + iconSpan('cancel') + '<span class="lbl">Börja om</span></button>' +
    '</div>'
  );
  $('#modalReplay').addEventListener('click', () => setupLevel());
  $('#modalReset').addEventListener('click', () => {
    run = newRun();
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
  let html = '<p class="eyebrow">Verkstad &amp; butik</p><h2>' + iconSpan('shop') + 'Butiken</h2>' +
    '<p class="sub">Kassa: <b style="color:var(--accent)">' + run.money + ' kr</b></p>';
  for (const id in UPGRADES) {
    const u = UPGRADES[id];
    const lv = run.upgrades[id];
    const maxed = lv >= u.costs.length;
    const cost = maxed ? null : u.costs[lv];
    html += '<div class="shopitem">' + iconSpan(u.icon) +
      '<span class="info"><b>' + u.name + ' <small>(' + lv + '/' + u.costs.length + ')</small></b><small>' + u.desc + '</small></span>' +
      (maxed ? '<span class="maxed">' + iconSpan('check') + 'Max</span>'
             : '<button class="buy" data-upg="' + id + '"' + (run.money < cost ? ' disabled' : '') + '>' + iconSpan('money') + cost + ' kr</button>') +
      '</div>';
  }
  html += '<div class="btnrow"><button class="btn primary" id="modalBack">' + iconSpan('check') + '<span class="lbl">Klar</span></button></div>';
  showModal(html);
  document.querySelectorAll('.buy[data-upg]').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.dataset.upg;
      const cost = UPGRADES[id].costs[run.upgrades[id]];
      if (run.money < cost) return;
      run.money -= cost;
      run.upgrades[id] += 1;
      renderChips(); renderStatus();
      toast(UPGRADES[id].name + ' uppgraderad!', 'upgrade');
      showShopModal(returnTo);
    });
  });
  $('#modalBack').addEventListener('click', () => {
    if (returnTo === 'next') { game.levelIndex = run.level; setupLevel(); }
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
    const on = run.mode === m.id;
    html += '<button class="modeopt' + (on ? ' active' : '') + '" data-mode="' + m.id + '" type="button">' +
      '<span class="icon">' + ICONS[m.icon] + '</span>' +
      '<span class="info"><b>' + m.name + (on ? ' <em>· valt</em>' : '') + '</b>' +
      '<small>' + m.tagline + '</small><small class="long">' + m.desc + '</small></span>' +
      '<span class="tick">' + (on ? ICONS.check : '') + '</span></button>';
  }
  html += '<p class="sub">Valet gäller direkt, även mitt i ett uppdrag.</p>';

  html += '<h2 class="section">' + iconSpan('quest') + 'Välj uppdrag</h2>' +
    '<p class="sub">Inget sparas mellan sidladdningar — här hoppar du till vilket pass du vill. ' +
    'Du får med dig lönen för passen du hoppar över.</p><div class="levelgrid">';
  LEVELS.forEach((lv, i) => {
    html += '<button class="levelbtn' + (i === game.levelIndex ? ' active' : '') + '" data-level="' + i + '" type="button">' +
      '<b>' + (i + 1) + '</b><span>' + lv.title + '</span></button>';
  });
  html += '</div>' +
    '<div class="btnrow"><button class="btn primary" id="modalOk">' + iconSpan('check') + '<span class="lbl">Klar</span></button></div>';
  showModal(html);
  document.querySelectorAll('.modeopt[data-mode]').forEach(b => {
    b.addEventListener('click', () => { setMode(b.dataset.mode); showSettingsModal(); });
  });
  document.querySelectorAll('.levelbtn[data-level]').forEach(b => {
    b.addEventListener('click', () => {
      const i = +b.dataset.level;
      game.levelIndex = i;
      run.level = i;
      catchUpMoney(i);
      setupLevel();
    });
  });
  $('#modalOk').addEventListener('click', hideModal);
}

// Hoppar man fram i uppdragslistan får man lönen för passen man hoppat över,
// annars vore butiken meningslös när man börjar mitt i.
function catchUpMoney(levelIndex) {
  let earned = 0;
  for (let i = 0; i < levelIndex; i++) earned += LEVELS[i].reward;
  if (run.money < earned) run.money = earned;
  renderChips();
}

function setMode(mode) {
  if (run.mode === mode) return;
  run.mode = mode;
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
  applyModeLayout();
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
    slots += '<span class="slot' + (d ? ' full' : '') + '" title="' + (d ? itemName(d.item) : 'Tom lastplats') + '">' +
      (d ? iconSpan(d.item) : '') + '</span>';
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
  $('#moneyChip').innerHTML = iconSpan('money') + run.money + ' kr';
  $('#shopBtn').innerHTML = iconSpan('shop') + 'Butik';
  $('#settingsBtn').innerHTML = iconSpan('cog');
  $('#versionBtn').textContent = 'v' + VERSION;
}

// I direktläge styr man direkt på kartan — då är körschemat bara i vägen.
// De köade stoppen syns ändå som numrerade brickor på kartan.
function applyModeLayout() {
  $('#queuePanel').style.display = isRealtime() ? 'none' : '';
}

function renderAll() {
  applyModeLayout();
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

// Landsbygden fortsätter en bra bit utanför vägnätet, så vyn aldrig tar slut
const TERRAIN = 500;
// Landytans utsträckning — startvyn ska rama in staden, inte havet omkring
const CONTENT = (function () {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const poly of LANDS) for (const p of poly) {
    x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]);
    x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]);
  }
  const m = 110;
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: x1 - x0 + m * 2, h: y1 - y0 + m * 2 };
})();

const fitScale = () => Math.min(viewW / CONTENT.w, viewH / CONTENT.h);
const coverScale = () => Math.max(viewW / CONTENT.w, viewH / CONTENT.h);
const minScale = () => fitScale() * 0.6;
const maxScale = () => Math.max(fitScale() * 3.6, 2);

// Visa hela vägnätet från start, men zooma in något på riktigt smala
// skärmar så att husen inte blir frimärken.
function defaultScale() {
  return clamp(Math.max(fitScale(), coverScale() * 0.55), minScale(), maxScale());
}

// Kameran får svepa ut i landskapet, men inte hur långt som helst
function clampCam() {
  cam.scale = clamp(cam.scale, minScale(), maxScale());
  const halfW = viewW / (2 * cam.scale), halfH = viewH / (2 * cam.scale);
  const loX = -TERRAIN + halfW, hiX = W + TERRAIN - halfW;
  const loY = -TERRAIN + halfH, hiY = H + TERRAIN - halfH;
  cam.x = loX > hiX ? CONTENT.x : clamp(cam.x, loX, hiX);
  cam.y = loY > hiY ? CONTENT.y : clamp(cam.y, loY, hiY);
}

// Världsrektangeln som just nu syns på skärmen
function visibleRect() {
  const halfW = viewW / (2 * cam.scale), halfH = viewH / (2 * cam.scale);
  return { x0: cam.x - halfW, y0: cam.y - halfH, x1: cam.x + halfW, y1: cam.y + halfH };
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

// Knappen "visa hela kartan" ramar in hela staden
function fitView() {
  viewW = window.innerWidth; viewH = window.innerHeight;
  cam.scale = fitScale();
  cam.x = CONTENT.x; cam.y = CONTENT.y;
  clampCam();
}

// Vyn vid nivåstart: staden om den får plats, annars utgår vi från bilen
// så att man alltid ser var dagen börjar.
function resetView() {
  viewW = window.innerWidth; viewH = window.innerHeight;
  cam.scale = defaultScale();
  cam.x = CONTENT.x; cam.y = CONTENT.y;
  clampCam();
  // Knuffa vyn precis så mycket att bilen kommer med, hellre än att
  // centrera på den och kasta bort halva staden i havet.
  const t = game.truck;
  const halfW = viewW / (2 * cam.scale), halfH = viewH / (2 * cam.scale);
  const m = Math.min(130, halfW * 0.4, halfH * 0.4);
  cam.x = clamp(cam.x, t.x - (halfW - m), t.x + (halfW - m));
  cam.y = clamp(cam.y, t.y - (halfH - m), t.y + (halfH - m));
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

// Hur nära en gata en punkt ligger (för att slippa placera träd i vägbanan)
function nearStreet(x, y, margin) {
  for (const st of STREETS) {
    for (let i = 0; i < st.nodes.length - 1; i++) {
      const a = nodeAt(st.nodes[i]), b = nodeAt(st.nodes[i + 1]);
      const dx = b.x - a.x, dy = b.y - a.y;
      const len2 = dx * dx + dy * dy;
      let t = len2 ? ((x - a.x) * dx + (y - a.y) * dy) / len2 : 0;
      t = Math.max(0, Math.min(1, t));
      if (Math.hypot(x - (a.x + dx * t), y - (a.y + dy * t)) < margin) return true;
    }
  }
  return false;
}

const scenery = [];
(function buildScenery() {
  const nearHouse = (x, y) => {
    for (const id in LOCATIONS) {
      const L = LOCATIONS[id];
      if (Math.hypot(L.x + (L.ox || 0) - x, L.y + (L.oy || 0) - y) < 105) return true;
    }
    return false;
  };
  const add = (name, x, y, size, color) => scenery.push({ name, x, y, size, color });

  // Kvartersbebyggelse: tät utanför parkerna, precis som på en stadsö
  for (let i = 0; i < 5200; i++) {
    const x = rnd() * W, y = rnd() * H;
    if (!onLand(x, y) || inPark(x, y) || nearHouse(x, y) || nearStreet(x, y, 42)) continue;
    const r = rnd();
    if (r < 0.72) {
      add(r < 0.4 ? 'huts' : 'village', x, y, 26 + rnd() * 14, rnd() < 0.5 ? '#7c8794' : '#6d7a86');
    } else if (r < 0.86) {
      add(rnd() < 0.6 ? 'pine' : 'birch', x, y, 24 + rnd() * 12, rnd() < 0.5 ? '#4f7a45' : '#5c8a4e');
    } else {
      add(rnd() < 0.5 ? 'flowers' : rnd() < 0.5 ? 'sunflower' : 'flowerPot', x, y, 20 + rnd() * 10, '#c9a84c');
    }
  }
  // Parkerna får tät skog
  for (const pk of PARKS) {
    const n = Math.round((pk.rx * pk.ry) / 360);
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd());
      const x = pk.cx + Math.cos(a) * pk.rx * r * 0.86, y = pk.cy + Math.sin(a) * pk.ry * r * 0.86;
      if (!onLand(x, y) || nearHouse(x, y)) continue;
      add(rnd() < 0.72 ? 'pine' : 'birch', x, y, 32 + rnd() * 18, rnd() < 0.5 ? '#54834a' : '#628f53');
    }
  }
  scenery.sort((a, b) => a.y - b.y);
})();

/* ---------- Rendering av kartan ---------- */

let animTime = 0;

function draw() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.save();
  ctx.translate(viewW / 2, viewH / 2);
  ctx.scale(cam.scale, cam.scale);
  ctx.translate(-cam.x, -cam.y);

  drawGround();
  drawRoads();
  drawStreetNames();
  drawScenery();
  drawRoute();
  for (const id of game.places) drawLocation(LOCATIONS[id]);
  drawLabels();
  drawRouteBadges();
  drawTruck();

  ctx.restore();
}

// Vattnet fyller hela den synliga världsrektangeln, sedan läggs land ovanpå.
// På så vis finns aldrig tomrum runt kartan hur man än panorerar eller zoomar.
function drawGround() {
  const v = visibleRect();
  const vw = v.x1 - v.x0, vh = v.y1 - v.y0;

  ctx.fillStyle = '#28536b';
  ctx.fillRect(v.x0, v.y0, vw, vh);

  // Vågor
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  const step = 150;
  const y0 = Math.floor(v.y0 / step) * step;
  const x0 = Math.floor(v.x0 / step) * step;
  for (let y = y0; y < v.y1; y += step) {
    for (let x = x0; x < v.x1; x += step) {
      const off = Math.sin((x + y + animTime * 26) / 90) * 12;
      ctx.fillRect(x + off, y + ((x / step) % 2) * 60, 46, 4);
    }
  }

  for (const poly of LANDS) drawLand(poly);
  for (const pk of PARKS) drawPark(pk);
}

function tracePolygon(poly) {
  ctx.beginPath();
  ctx.moveTo(poly[0][0], poly[0][1]);
  for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]);
  ctx.closePath();
}

function drawLand(poly) {
  // Strandkant
  ctx.save();
  tracePolygon(poly);
  ctx.strokeStyle = '#c8b98d';
  ctx.lineWidth = 26;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.fillStyle = '#4a4f47';
  ctx.fill();
  // Kvartersstruktur: svag ljusare ton innanför kanten
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.022)';
  for (let gx = 0; gx < W; gx += 230) {
    for (let gy = 0; gy < H; gy += 190) {
      if (((gx / 230 + gy / 190) | 0) % 2 === 0) ctx.fillRect(gx, gy, 230, 190);
    }
  }
  ctx.restore();
}

function drawPark(pk) {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(pk.cx, pk.cy, pk.rx, pk.ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#35502f';
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,160,110,0.35)';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();
}

function traceStreet(st) {
  ctx.beginPath();
  const a = nodeAt(st.nodes[0]);
  ctx.moveTo(a.x, a.y);
  for (let i = 1; i < st.nodes.length; i++) {
    const p = nodeAt(st.nodes[i]);
    ctx.lineTo(p.x, p.y);
  }
}

function drawRoads() {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const width = st => st.bridge ? 46 : st.big ? 52 : 38;

  // Broarna får räcken som sticker ut i vattnet
  for (const st of STREETS) {
    if (!st.bridge) continue;
    ctx.strokeStyle = '#1a1d23';
    ctx.lineWidth = width(st) + 18;
    traceStreet(st);
    ctx.stroke();
  }
  // Kantsten
  ctx.strokeStyle = '#20242b';
  for (const st of STREETS) { ctx.lineWidth = width(st) + 9; traceStreet(st); ctx.stroke(); }
  // Asfalt
  for (const st of STREETS) {
    ctx.strokeStyle = st.bridge ? '#3a3f47' : '#33383f';
    ctx.lineWidth = width(st);
    traceStreet(st);
    ctx.stroke();
  }
  // Mittlinje på huvudgatorna
  ctx.strokeStyle = 'rgba(246,185,59,0.45)';
  ctx.lineWidth = 3;
  ctx.setLineDash([20, 18]);
  for (const st of STREETS) { if (st.big || st.bridge) { traceStreet(st); ctx.stroke(); } }
  ctx.setLineDash([]);
}

// Gatunamnen dyker upp när man zoomar in
function drawStreetNames() {
  if (cam.scale < 0.5) return;
  const v = visibleRect();
  const fs = clamp(15 / cam.scale, 12, 30);
  ctx.font = '600 ' + fs + 'px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const st of STREETS) {
    for (let i = 0; i < st.nodes.length - 1; i++) {
      const a = nodeAt(st.nodes[i]), b = nodeAt(st.nodes[i + 1]);
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      if (len < 210) continue;
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      if (mx < v.x0 || mx > v.x1 || my < v.y0 || my > v.y1) continue;
      let ang = Math.atan2(b.y - a.y, b.x - a.x);
      if (ang > Math.PI / 2 || ang < -Math.PI / 2) ang += Math.PI;
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(ang);
      ctx.fillStyle = 'rgba(232,236,242,0.5)';
      ctx.fillText(st.name, 0, 0);
      ctx.restore();
    }
  }
  ctx.textBaseline = 'alphabetic';
}

function drawScenery() {
  if (cam.scale < 0.14) return;
  const v = visibleRect();
  for (const s of scenery) {
    if (s.x < v.x0 - 40 || s.x > v.x1 + 40 || s.y < v.y0 - 40 || s.y > v.y1 + 40) continue;
    drawIcon(s.name, s.color, s.x, s.y, s.size);
  }
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
    const off = markerSize() / 2 + 4;
    const b = badges[item.locId] || (badges[item.locId] = { x: markerX(loc) - off, y: markerY(loc) - off, nums: [] });
    b.nums.push(s.index + 1);
  }
  for (const k in badges) {
    const b = badges[k];
    const label = b.nums.join(',');
    const r = (15 + (label.length - 1) * 3.5) * clamp(markerSize() / 62, 1, 1.9);
    ctx.beginPath();
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#f6b93b';
    ctx.fill();
    ctx.strokeStyle = 'rgba(10,14,20,0.8)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#1c1608';
    ctx.font = '700 ' + (r * 1.25).toFixed(1) + 'px system-ui, sans-serif';
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
// Husen ritas större i världsmått när man zoomar ut, så de aldrig blir
// omöjliga att se eller träffa i översiktsvyn.
const markerSize = () => clamp(46 / cam.scale, 62, 150);

// Etiketter samlas upp under ritningen och placeras sist, så att två
// namn aldrig hamnar ovanpå varandra i översiktsvyn.
const pendingLabels = [];

function drawLabels() {
  const fs = clamp(15 / cam.scale, 13, 46);
  ctx.font = '700 ' + fs + 'px system-ui, sans-serif';
  ctx.textAlign = 'center';
  const placed = [];
  const overlaps = r => placed.some(q => r.x0 < q.x1 && r.x1 > q.x0 && r.y0 < q.y1 && r.y1 > q.y0);

  for (const l of pendingLabels) {
    const tw = ctx.measureText(l.text).width;
    let box = null;
    // Försök under skylten, annars strax ovanför, annars hoppa över
    for (const dy of [fs * 0.55 + 6, -(fs * 2.2), fs * 2.1]) {
      const ly = l.y + dy;
      const cand = { x0: l.x - tw / 2 - 8, x1: l.x + tw / 2 + 8, y0: ly - fs * 0.78, y1: ly + fs * 0.47, ly };
      if (!overlaps(cand)) { box = cand; break; }
    }
    if (!box) continue;
    placed.push(box);
    ctx.fillStyle = 'rgba(16,20,27,0.82)';
    roundRect(box.x0, box.y0, box.x1 - box.x0, fs * 1.25, fs * 0.5);
    ctx.fill();
    ctx.fillStyle = '#e8ecf2';
    ctx.fillText(l.text, l.x, box.ly + fs * 0.28);
  }
  pendingLabels.length = 0;
}

// Gemensam pratbubbla — används både för beställningar och för bilen
function drawSpeechBubble(cx, cy, iconName, color, size, phase, inkColor) {
  const bob = Math.sin(animTime * 2.4 + phase) * size * 0.09;
  const y = cy + bob;
  const r = size * 0.5;
  ctx.save();
  ctx.beginPath();
  roundRect(cx - r, y - r, r * 2, r * 2 * 0.86, r * 0.42);
  // Svans ned mot ägaren
  ctx.moveTo(cx - r * 0.26, y + r * 0.7);
  ctx.lineTo(cx - r * 0.02, y + r * 1.12);
  ctx.lineTo(cx + r * 0.3, y + r * 0.7);
  ctx.closePath();
  ctx.fillStyle = 'rgba(250,250,248,0.97)';
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2.5, size * 0.075);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  drawIcon(iconName, inkColor || color, cx, y - r * 0.06, size * 0.68);
}

// Ett hus med en skylt: skylten visar vad stället handlar med
function drawShop(loc, mx, my, s, highlight) {
  const w = s * 0.92, h = s * 0.6;
  const top = my - s * 0.1;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = s * 0.2;
  ctx.shadowOffsetY = s * 0.07;
  // Tak
  ctx.beginPath();
  ctx.moveTo(mx - w * 0.62, top);
  ctx.lineTo(mx, top - s * 0.42);
  ctx.lineTo(mx + w * 0.62, top);
  ctx.closePath();
  ctx.fillStyle = loc.color;
  ctx.fill();
  // Fasad
  ctx.fillStyle = '#232932';
  roundRect(mx - w / 2, top, w, h, s * 0.07);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = highlight ? '#f6b93b' : 'rgba(255,255,255,0.3)';
  ctx.lineWidth = (highlight ? 3.5 : 2) * Math.max(1, s / 62);
  roundRect(mx - w / 2, top, w, h, s * 0.07);
  ctx.stroke();

  // Skylten över dörren
  const sw = w * 0.74, sh = h * 0.48;
  const sx = mx - sw / 2, sy = top + h * 0.13;
  ctx.fillStyle = '#f4efe3';
  roundRect(sx, sy, sw, sh, sh * 0.28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(16,20,27,0.8)';
  ctx.lineWidth = Math.max(1.5, s * 0.028);
  ctx.stroke();
  drawIcon(loc.icon, '#2b3038', mx, sy + sh / 2, sh * 0.86);

  // Dörr
  ctx.fillStyle = '#3c434e';
  roundRect(mx - w * 0.11, top + h * 0.68, w * 0.22, h * 0.32, s * 0.03);
  ctx.fill();
}

// Ett hämtställe ritas som en hög med fem varor
function drawPile(loc, mx, my, s, highlight) {
  const r = s * 0.5;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(mx, my + r * 0.62, r * 0.95, r * 0.4, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(20,24,31,0.55)';
  ctx.fill();
  ctx.restore();

  if (highlight) {
    ctx.beginPath();
    ctx.ellipse(mx, my + r * 0.62, r * 1.02, r * 0.46, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#f6b93b';
    ctx.lineWidth = 3 * Math.max(1, s / 62);
    ctx.stroke();
  }

  const one = s * 0.42;
  const spots = [
    [-0.29, 0.30], [0.00, 0.36], [0.29, 0.30],
    [-0.15, 0.02], [0.16, 0.02]
  ];
  for (const [dx, dy] of spots) drawIcon(loc.icon, loc.color, mx + dx * s, my + dy * s, one);
}

function drawLocation(loc) {
  const pickup = game.deliveries.some(d => d.state === 'waiting' && d.from === loc.id);
  const wants = game.deliveries.filter(d => d.state !== 'done' && d.to === loc.id);
  const ready = game.deliveries.some(d => d.state === 'carried' && d.to === loc.id);
  const s = markerSize();
  const mx = markerX(loc), my = markerY(loc);

  // Infart från gatan fram till huset
  ctx.strokeStyle = '#4a4034';
  ctx.lineWidth = Math.max(12, s * 0.26);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(loc.x, loc.y);
  ctx.lineTo(mx, my);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = Math.max(2, s * 0.05);
  ctx.stroke();

  if (loc.kind === 'pickup') drawPile(loc, mx, my, s, pickup);
  else drawShop(loc, mx, my, s, ready);

  pendingLabels.push({ text: loc.name, x: mx, y: my + s * 0.62 });

  // Beställningar: en gungande pratbubbla per vara som väntar
  wants.forEach((d, i) => {
    const bs = s * 0.82;
    const spread = (i - (wants.length - 1) / 2) * bs * 1.12;
    drawSpeechBubble(mx + spread, my - s * 0.66 - bs * 0.5, d.item,
      d.state === 'carried' ? '#3f8f4c' : '#c2503f', bs, i * 1.3, '#2b3038');
  });
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
  const c = rasterIcon('truck', '#f6b93b', 48);
  if (c) ctx.drawImage(c, -24, -26, 48, 48);
  ctx.restore();

  const busy = t.state === 'charge' ? 'charge' : t.state === 'eat' ? 'meal' : t.state === 'sleep' ? 'nightSleep' : null;
  const warn = truckWarning();
  const bubble = busy || warn;
  if (bubble) {
    const bs = clamp(54 / cam.scale, 50, 104);
    const col = warn && !busy ? '#c2503f' : '#c98a1e';
    drawSpeechBubble(t.x, t.y - 30 - bs * 0.5, bubble, col, bs, 0, col);
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
    if (moveDist < 14 && performance.now() - downTime < 650) {
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
  // Träffytan räknas i skärmpixlar så den alltid är tumstor, oavsett zoom
  const touch = matchMedia('(pointer: coarse)').matches;
  const rHouse = Math.max(markerSize() * 0.62, (touch ? 30 : 24) / cam.scale);
  const rNode = Math.max(34, (touch ? 22 : 16) / cam.scale);
  let best = null, bestD = Infinity;
  for (const id of game.places) {
    const L = LOCATIONS[id];
    const d = Math.min(
      Math.hypot(markerX(L) - wx, markerY(L) - wy) / rHouse,
      Math.hypot(L.x - wx, L.y - wy) / rNode
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

game.levelIndex = Math.min(run.level, LEVELS.length - 1);
if (window.innerWidth < 560) $('#queuePanel').classList.add('collapsed');
resizeCanvas();
fitView();
renderAll();
setupLevel();
requestAnimationFrame(frame);
