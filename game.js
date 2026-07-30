'use strict';

/* ============================================================
   Delivery Girl — ett varmt strategiskt planeringsspel
   Vanilla JS + Canvas. Symboler: game-icons.net (CC BY 3.0)
   ============================================================ */

const VERSION = '2.1.0';

const CHANGELOG = [
  {
    version: '2.1.0',
    date: '2026-07-28',
    items: [
      'Varje uppdrag är nu ett pussel med bara 1–3 turordningar som går ihop, i stället för en öppen körning.',
      'Avstängda gator: ett uppdrag kan stänga av en gata eller bro helt, markerad med rödvita bockar.',
      'Broar med tidtabell fälls upp för båttrafik — grön bricka betyder öppen, röd visar minuter kvar.',
      'Ruttvalet tar hänsyn till tidtabellen och kör hellre runt en uppfälld bro än väntar, när det går.',
      'Alla tio banor omgjorda kring hindren, med tidsgränser satta så att bara de avsedda lösningarna hinner fram.',
      'Bandesignen är dokumenterad i LEVELS.md, och tools/verify-levels.js räknar lösningarna per bana.'
    ]
  },
  {
    version: '2.0.0',
    date: '2026-07-28',
    items: [
      'Hus och symboler är flera gånger större och krymper inte längre när du zoomar ut — de håller sin storlek på skärmen och krymper bara där grannplatserna ligger tätt, så inget överlappar.',
      'Bilen är vit och rejält tilltagen.',
      'Sömn visas med zzz i stället för kaffekopp, och mätarna har fått var sin färg: grönt för ström, blått för sömn, orange för mat.',
      'Laddstationer, matställen och viloställen bär nu samma symboler och färger som mätarna, så de är lätta att hitta på kartan.',
      'Bara två laddstationer kvar — räckvidden måste planeras.',
      'Gott om vatten runt staden och lägre lägsta zoom, så du kan dra och zooma fritt.',
      'Inställningarna för spelläge och ljud sparas mellan sidladdningar (spelframstegen börjar fortfarande om).'
    ]
  },
  {
    version: '1.9.0',
    date: '2026-07-28',
    items: [
      'Enkla ljudeffekter: pling när du köar ett stopp, lastar, levererar, laddar, äter och sover.',
      'Egna signaler när ett uppdrag är klart, när det misslyckas och när en mätare börjar närma sig botten.',
      'Ljudet går att stänga av under Ljud i inställningarna.',
      'Tonerna räknas fram i webbläsaren — inga ljudfiler att ladda ner.'
    ]
  },
  {
    version: '1.8.0',
    date: '2026-07-28',
    items: [
      'Kameran följer bilen av sig själv medan hon kör — dra för att titta någon annanstans, och tryck på bilknappen för att följa igen.',
      'Mål som ligger utanför skärmen visas som pilar i kanten med platsens symbol, så man aldrig tappar bort vart man ska.',
      'Slimmad status uppe till vänster och en bottenrad med bara Kör och hastighet — gränssnittet täcker nu 18 % av skärmen i stället för 23 %.',
      'Rensa flyttade in i körschemats rubrik och Börja om till menyn, där de hör hemma.',
      'Körschemat fäller ihop sig till en liten flik när det är tomt och fälls ut när du lägger till ett stopp.',
      'En ring visas där du tryckte på kartan, så du ser att trycket gick fram.'
    ]
  },
  {
    version: '1.7.0',
    date: '2026-07-28',
    items: [
      'Mycket större och svårare karta: hela staden med sex stadsdelar — city, Kungsholmen, Östermalm, Gamla stan, Söder och Djurgården — med Stockholm som inspiration.',
      'Sju broar binder ihop stadsdelarna och blir flaskhalsar att planera kring.',
      'Platserna ligger utspridda över hela stan, så en leverans kan vara flera tusen meter lång och kräva laddstopp på vägen.',
      'Fyra laddstationer, två matställen och två ställen att sova på, spridda över stadsdelarna.',
      'Uppdragen visas som en lista uppe till höger och stryks över när de är levererade.',
      'Kartan börjar centrerad på bilen, och bilens symbol är rejält större.',
      'Minimalare gränssnitt: pengarna bor i butiken och versionen i menyn.'
    ]
  },
  {
    version: '1.6.0',
    date: '2026-07-28',
    items: [
      'Startplatsen har inget namn längre — den är bara där bilen står när dagen börjar.',
      'Uppdraget är slut så fort sista leveransen är framme; ingen återresa krävs.',
      'Kön med åtgärder är tillbaka i båda spellägena, och varje rad har ett X för att ta bort just den.',
      'Tidsgränserna är omräknade nu när återresan är borta.'
    ]
  },
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

const W = 5400, H = 4000;
const START_NODE = "nm_i";

// Vägkorsningar i stadens sex delar
const NODES = {
  kh_a: [700, 1690],
  kh_b: [1050, 1620],
  kh_c: [1400, 1620],
  kh_d: [1660, 1680],
  kh_e: [740, 1900],
  kh_f: [1090, 1870],
  kh_g: [1440, 1860],
  kh_h: [1150, 2010],
  nm_a: [1980, 1140],
  nm_b: [2320, 1090],
  nm_c: [2660, 1080],
  nm_d: [2970, 1130],
  nm_e: [2000, 1440],
  nm_f: [2350, 1410],
  nm_g: [2700, 1400],
  nm_h: [3000, 1440],
  nm_i: [2120, 1670],
  nm_j: [2500, 1650],
  nm_k: [2860, 1630],
  om_a: [3450, 1160],
  om_b: [3820, 1090],
  om_c: [4200, 1070],
  om_d: [4520, 1170],
  om_e: [3490, 1480],
  om_f: [3860, 1450],
  om_g: [4240, 1430],
  om_h: [4540, 1500],
  om_i: [3900, 1730],
  om_j: [4300, 1700],
  gs_a: [2290, 2150],
  gs_b: [2290, 2410],
  sm_a: [1200, 3060],
  sm_b: [1720, 2960],
  sm_c: [2270, 2910],
  sm_d: [2820, 2930],
  sm_e: [3320, 3010],
  sm_f: [1260, 3360],
  sm_g: [1770, 3310],
  sm_h: [2320, 3290],
  sm_i: [2870, 3310],
  sm_j: [3370, 3340],
  dj_a: [4050, 2400],
  dj_b: [4450, 2330],
  dj_c: [4760, 2470],
  dj_d: [4300, 2700],
  dj_e: [3950, 2740],
};

// Gator och broar som polylinjer
const STREETS = [
  { name: "Hantverkargatan", nodes: ['kh_a', 'kh_b', 'kh_c', 'kh_d'], big: true },
  { name: "Fleminggatan", nodes: ['kh_e', 'kh_f', 'kh_g'], big: true },
  { name: "S:t Eriksgatan", nodes: ['kh_a', 'kh_e'] },
  { name: "Scheelegatan", nodes: ['kh_c', 'kh_g'] },
  { name: "Norr M\u00e4larstrand", nodes: ['kh_f', 'kh_h'] },
  { name: "Kungsgatan", nodes: ['nm_a', 'nm_b', 'nm_c', 'nm_d'], big: true },
  { name: "Klarabergsgatan", nodes: ['nm_e', 'nm_f', 'nm_g', 'nm_h'], big: true },
  { name: "Tegelbacken", nodes: ['nm_i', 'nm_j', 'nm_k'], big: true },
  { name: "Vasagatan", nodes: ['nm_a', 'nm_e', 'nm_i'] },
  { name: "Sveav\u00e4gen", nodes: ['nm_c', 'nm_g', 'nm_k'] },
  { name: "Drottninggatan", nodes: ['nm_b', 'nm_f', 'nm_j'] },
  { name: "Karlav\u00e4gen", nodes: ['om_a', 'om_b', 'om_c', 'om_d'], big: true },
  { name: "Strandv\u00e4gen", nodes: ['om_e', 'om_f', 'om_g', 'om_h'], big: true },
  { name: "Narvav\u00e4gen", nodes: ['om_c', 'om_g', 'om_j'] },
  { name: "Grev Turegatan", nodes: ['om_a', 'om_e', 'om_i'] },
  { name: "Linn\u00e9gatan", nodes: ['om_i', 'om_j'] },
  { name: "V\u00e4sterl\u00e5nggatan", nodes: ['gs_a', 'gs_b'], big: true },
  { name: "Hornsgatan", nodes: ['sm_a', 'sm_b', 'sm_c', 'sm_d', 'sm_e'], big: true },
  { name: "Ringv\u00e4gen", nodes: ['sm_f', 'sm_g', 'sm_h', 'sm_i', 'sm_j'], big: true },
  { name: "Torkel Knutssonsgatan", nodes: ['sm_a', 'sm_f'] },
  { name: "G\u00f6tgatan", nodes: ['sm_c', 'sm_h'], big: true },
  { name: "Renstiernas gata", nodes: ['sm_e', 'sm_j'] },
  { name: "Swedenborgsgatan", nodes: ['sm_b', 'sm_g'] },
  { name: "Nyn\u00e4sv\u00e4gen", nodes: ['sm_d', 'sm_i'] },
  { name: "Djurg\u00e5rdsv\u00e4gen", nodes: ['dj_a', 'dj_b', 'dj_c'], big: true },
  { name: "Rosendalsv\u00e4gen", nodes: ['dj_a', 'dj_e', 'dj_d', 'dj_b'] },
  { name: "Stadshusbron", nodes: ['kh_d', 'nm_i'], bridge: true },
  { name: "V\u00e4sterbron", nodes: ['kh_h', 'sm_b'], bridge: true },
  { name: "Vasabron", nodes: ['nm_i', 'gs_a'], bridge: true },
  { name: "Slussen", nodes: ['gs_b', 'sm_c'], bridge: true },
  { name: "Nybrobron", nodes: ['nm_d', 'om_a'], bridge: true },
  { name: "Djurg\u00e5rdsbron", nodes: ['om_i', 'dj_a'], bridge: true },
  { name: "Danviksbron", nodes: ['sm_e', 'dj_e'], bridge: true },
];

// Stadsdelarna. Allt utanför är vatten.
const KUNGSHOLMEN = [[430, 1520], [900, 1400], [1400, 1420], [1720, 1520], [1780, 1750], [1650, 1990], [1250, 2090], [780, 2060], [450, 1870]];
const NORRMALM = [[1870, 920], [2500, 860], [3000, 900], [3160, 1120], [3120, 1480], [2950, 1700], [2500, 1790], [2050, 1740], [1860, 1480]];
const OSTERMALM = [[3300, 980], [3900, 910], [4400, 970], [4680, 1160], [4720, 1520], [4520, 1800], [4020, 1900], [3560, 1840], [3320, 1560]];
const GAMLASTAN = [[2030, 2060], [2400, 2030], [2570, 2160], [2580, 2410], [2430, 2530], [2120, 2540], [2010, 2390]];
const SODERMALM = [[930, 2870], [1500, 2730], [2200, 2690], [2900, 2710], [3400, 2790], [3660, 2960], [3710, 3260], [3460, 3510], [2900, 3630], [2200, 3670], [1500, 3610], [1060, 3410], [900, 3110]];
const DJURGARDEN = [[3880, 2170], [4480, 2110], [4880, 2260], [4980, 2560], [4830, 2820], [4400, 2910], [4000, 2860], [3830, 2610]];
const LANDS = [KUNGSHOLMEN, NORRMALM, OSTERMALM, GAMLASTAN, SODERMALM, DJURGARDEN];

// Parker och berg — vackra, men inget man kör igenom
const PARKS = [
  { name: "R\u00e5lambshovsparken", cx: 640, cy: 1780, rx: 150, ry: 120 },
  { name: "Kungstr\u00e4dg\u00e5rden", cx: 2560, cy: 1540, rx: 130, ry: 95 },
  { name: "Observatorielunden", cx: 2180, cy: 1270, rx: 120, ry: 95 },
  { name: "Humleg\u00e5rden", cx: 3660, cy: 1290, rx: 160, ry: 120 },
  { name: "G\u00e4rdet", cx: 4420, cy: 1620, rx: 150, ry: 110 },
  { name: "Vitabergsparken", cx: 3080, cy: 3130, rx: 160, ry: 120 },
  { name: "Tantolunden", cx: 1480, cy: 3140, rx: 150, ry: 110 },
  { name: "Skinnarviksberget", cx: 980, cy: 3210, rx: 120, ry: 90 },
  { name: "Rosendal", cx: 4620, cy: 2660, rx: 150, ry: 120 },
  { name: "Djurg\u00e5rdsbrunn", cx: 4120, cy: 2530, rx: 130, ry: 100 },
];

function nodeKey(x, y) { return x + ',' + y; }
function keyToPoint(k) { const p = k.split(','); return { x: +p[0], y: +p[1] }; }
const nodeAt = id => ({ x: NODES[id][0], y: NODES[id][1] });
const keyOf = id => nodeKey(NODES[id][0], NODES[id][1]);

const graph = {};
const edgeStreet = {};   // vilken gata en viss sträcka tillhör
const edgeKey = (a, b) => a < b ? a + '~' + b : b + '~' + a;

(function mapEdges() {
  for (const st of STREETS) {
    for (let i = 0; i < st.nodes.length - 1; i++) {
      edgeStreet[edgeKey(keyOf(st.nodes[i]), keyOf(st.nodes[i + 1]))] = st.name;
    }
  }
})();

// Vägnätet byggs om per uppdrag, eftersom gator kan vara avstängda
function buildGraph(closed) {
  for (const k in graph) delete graph[k];
  for (const k in pathCache) delete pathCache[k];
  for (const id in NODES) graph[keyOf(id)] = [];
  for (const st of STREETS) {
    if (closed && closed.has(st.name)) continue;
    for (let i = 0; i < st.nodes.length - 1; i++) {
      const a = nodeAt(st.nodes[i]), b = nodeAt(st.nodes[i + 1]);
      const ka = keyOf(st.nodes[i]), kb = keyOf(st.nodes[i + 1]);
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      if (!graph[ka].some(e => e.key === kb)) graph[ka].push({ key: kb, dist: d });
      if (!graph[kb].some(e => e.key === ka)) graph[kb].push({ key: ka, dist: d });
    }
  }
}

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
buildGraph(null);

// Vilka broar som står uppfällda just nu — ingår i cachenyckeln eftersom
// rutten ser olika ut beroende på tidtabellen.
function shutStreets() {
  const gates = (typeof game !== 'undefined' && game.levelIndex != null) ? (currentLevel().gates || []) : [];
  const out = new Set();
  for (const g of gates) if (gateShutAt(g, game.clock)) out.add(g.street);
  return out;
}

function dijkstra(fromKey, toKey, blocked) {
  const dist = {}, prev = {}, visited = {};
  for (const k in graph) dist[k] = Infinity;
  dist[fromKey] = 0;
  for (;;) {
    let cur = null, best = Infinity;
    for (const k in graph) if (!visited[k] && dist[k] < best) { best = dist[k]; cur = k; }
    if (cur === null || cur === toKey) break;
    visited[cur] = true;
    for (const e of graph[cur]) {
      if (blocked && blocked.size && blocked.has(edgeStreet[edgeKey(cur, e.key)])) continue;
      const nd = dist[cur] + e.dist;
      if (nd < dist[e.key]) { dist[e.key] = nd; prev[e.key] = cur; }
    }
  }
  const path = [];
  let k = toKey;
  while (k) { path.unshift(k); k = prev[k]; }
  return { path, dist: dist[toKey] };
}

/* Ruttval tar hänsyn till vilka broar som är uppfällda just nu: hon kör
   hellre runt än ställer sig och väntar. Går det inte runt får hon vänta
   vid bron. */
function shortestPath(fromKey, toKey, ignoreGates) {
  const blocked = ignoreGates ? null : shutStreets();
  const sig = blocked && blocked.size ? [...blocked].sort().join('+') : '-';
  const ck = sig + '|' + fromKey + '>' + toKey;
  if (pathCache[ck]) return pathCache[ck];
  let res = dijkstra(fromKey, toKey, blocked);
  // Ingen väg runt? Ta den vanliga och vänta ut bron.
  if (!isFinite(res.dist)) res = dijkstra(fromKey, toKey, null);
  pathCache[ck] = res;
  return res;
}

/* ---------- Broöppningar ---------- */
/* En bro med tidtabell är stängd för biltrafik i vissa fönster medan
   båtarna passerar. Kör man fram när den är uppfälld får man vänta. */

function gateFor(streetName) {
  return (currentLevel().gates || []).find(g => g.street === streetName) || null;
}

// Är bron uppfälld vid en viss tidpunkt?
function gateShutAt(gate, minute) {
  if (!gate) return false;
  const p = gate.every;
  const t = p ? minute % p : minute;
  return gate.shut.some(w => t >= w[0] && t < w[1]);
}

// Hur många minuter tills den öppnar igen
function gateOpensIn(gate, minute) {
  const p = gate.every;
  const t = p ? minute % p : minute;
  for (const w of gate.shut) if (t >= w[0] && t < w[1]) return w[1] - t;
  return 0;
}

// Är sträckan mellan två noder spärrad just nu?
function edgeBlockedNow(ka, kb) {
  const name = edgeStreet[edgeKey(ka, kb)];
  if (!name) return null;
  const gate = gateFor(name);
  if (gate && gateShutAt(gate, game.clock)) return { name, gate };
  return null;
}

/* ---------- Personer & platser ---------- */

/* Varje plats är antingen ett ställe man hämtar varor (ritas som en hög
   av fem varor), ett ställe som vill ha leverans (ett hus med skylt), en
   service. Bara de platser uppdraget handlar om visas. Bilen börjar vid
   en startpunkt i stan som inte är någon plats i sig. */

const LOC_DEFS = {
  bageriet: { node: 'nm_b', name: "Bageriet", kind: 'pickup', color: '#e0b978', item: 'bread' },
  fisken: { node: 'dj_c', name: "Fiskhamnen", kind: 'pickup', color: '#8fd3f4', item: 'fish' },
  odlingen: { node: 'sm_f', name: "Odlingen", kind: 'pickup', color: '#e08a4a', item: 'carrot' },
  mejeriet: { node: 'kh_b', name: "Mejeriet", kind: 'pickup', color: '#dfe6ee', item: 'milk' },
  lagret: { node: 'gs_a', name: "Lagret", kind: 'pickup', color: '#c9a066', item: 'crate' },
  bryggeriet: { node: 'om_j', name: "Bryggeriet", kind: 'pickup', color: '#c98a3a', item: 'beer' },
  cafeet: { node: 'nm_g', name: "Caf\u00e9et", kind: 'shop', color: '#d9a066', icon: 'coffee' },
  fiskrest: { node: 'sm_h', name: "Fiskrestaurangen", kind: 'shop', color: '#7fc4e8', icon: 'fish' },
  pizzerian: { node: 'sm_d', name: "Pizzerian", kind: 'shop', color: '#e2705a', icon: 'pizza' },
  glassbaren: { node: 'dj_b', name: "Glassbaren", kind: 'shop', color: '#f5b8d0', icon: 'icecream' },
  blomsteraffaren: { node: 'om_f', name: "Blomsteraff\u00e4ren", kind: 'shop', color: '#e8c84a', icon: 'sunflower' },
  hotellet: { node: 'om_c', name: "Hotellet", kind: 'shop', color: '#b18ae0', icon: 'wine' },
  skolan: { node: 'kh_g', name: "Skolan", kind: 'shop', color: '#a3d977', icon: 'apple' },
  laddCity: { node: 'nm_f', name: "Laddstation City", kind: 'service', color: '#57c26b', icon: 'charge', service: 'charge' },
  laddSoder: { node: 'sm_i', name: "Laddstation S\u00f6der", kind: 'service', color: '#57c26b', icon: 'charge', service: 'charge' },
  matstallet: { node: 'sm_b', name: "Matst\u00e4llet", kind: 'service', color: '#f0913d', icon: 'knifeFork', service: 'eat' },
  vandrarhemmet: { node: 'kh_f', name: "Vandrarhemmet", kind: 'service', color: '#5aa9e6', icon: 'nightSleep', service: 'sleep' },
  vilohemmet: { node: 'dj_d', name: "Vilohemmet", kind: 'service', color: '#5aa9e6', icon: 'nightSleep', service: 'sleep' },
  korvkiosken: { node: 'om_b', name: "Korvkiosken", kind: 'service', color: '#f0913d', icon: 'knifeFork', service: 'eat' },
};

const LOC_OFFSETS = {
  bageriet: [0, -115],
  fisken: [106, 44],
  odlingen: [-81, 81],
  mejeriet: [0, -115],
  lagret: [115, 0],
  bryggeriet: [106, 44],
  cafeet: [81, -81],
  fiskrest: [0, 115],
  pizzerian: [0, -115],
  glassbaren: [0, -115],
  blomsteraffaren: [0, -115],
  hotellet: [0, -115],
  skolan: [81, 81],
  laddCity: [-44, 106],
  laddSoder: [0, 115],
  matstallet: [44, -106],
  vandrarhemmet: [0, -115],
  vilohemmet: [106, 44],
  korvkiosken: [0, -115],
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

/* Varje uppdrag är ett pussel: avstängda gator, broar med tidtabell och
   knappa marginaler gör att bara någon enstaka turordning går ihop.
   Se LEVELS.md för lösningarna. */

const CH = ['laddCity', 'laddSoder'];
const ALL_SERVICE = ['laddCity', 'laddSoder', 'matstallet', 'korvkiosken', 'vandrarhemmet', 'vilohemmet'];

const LEVELS = [
  {
    title: 'Bröd till caféet',
    story: 'Hämta bröd i bageriet och kör det till caféet. Båda ligger i city.',
    timeLimit: null, reward: 450,
    deliveries: [{ from: 'bageriet', to: 'cafeet', item: 'bread' }]
  },
  {
    title: 'Bron öppnar för båtarna',
    story: 'Fisken ska från hamnen i öster till söder. Danviksbron fälls upp för båttrafik — kör före den stänger, annars får du vänta ut den eller ta vägen runt.',
    timeLimit: 88, reward: 600,
    deliveries: [{ from: 'fisken', to: 'fiskrest', item: 'fish' }],
    extra: CH,
    gates: [{ street: 'Danviksbron', shut: [[22, 55]] }]
  },
  {
    title: 'Västerbron är avstängd',
    story: 'Vägarbete på Västerbron. Enda vägen till Kungsholmen går via Stadshusbron, så ordningen på ärendena avgör.',
    timeLimit: 86, reward: 750,
    deliveries: [
      { from: 'mejeriet', to: 'cafeet', item: 'milk' },
      { from: 'odlingen', to: 'pizzerian', item: 'carrot' }
    ],
    extra: CH,
    closed: ['Västerbron']
  },
  {
    title: 'Slussen i tid',
    story: 'Tre leveranser, och Slussen fälls upp var femtionde minut. Planera så att du passerar när den är nere.',
    timeLimit: 94, reward: 950,
    deliveries: [
      { from: 'bageriet', to: 'cafeet', item: 'bread' },
      { from: 'odlingen', to: 'pizzerian', item: 'carrot' },
      { from: 'lagret', to: 'skolan', item: 'crate' }
    ],
    extra: CH,
    closed: ['Västerbron'],
    gates: [{ street: 'Slussen', shut: [[32, 50]], every: 50 }]
  },
  {
    title: 'Långpasset',
    story: 'Du har redan kört ett pass, och Stadshusbron är avstängd. Både mat och vila måste vävas in i rundan.',
    timeLimit: 300, reward: 1100, startEnergy: 60, startFood: 55,
    deliveries: [
      { from: 'mejeriet', to: 'cafeet', item: 'milk' },
      { from: 'odlingen', to: 'pizzerian', item: 'carrot' },
      { from: 'fisken', to: 'fiskrest', item: 'fish' }
    ],
    extra: ALL_SERVICE,
    closed: ['Stadshusbron']
  },
  {
    title: 'Genom Gamla stan',
    story: 'Lådorna står i lagret på Gamla stan och Vasabron öppnas i perioder. Nybrobron är dessutom avstängd — östra sidan nås bara söderifrån.',
    timeLimit: 97, reward: 1000,
    deliveries: [
      { from: 'lagret', to: 'glassbaren', item: 'crate' },
      { from: 'mejeriet', to: 'cafeet', item: 'milk' }
    ],
    extra: CH.concat(['matstallet']),
    closed: ['Nybrobron'],
    gates: [{ street: 'Vasabron', shut: [[40, 62]] }]
  },
  {
    title: 'Två broar, ett fönster',
    story: 'Djurgårdsbron och Danviksbron fälls upp växelvis — bara den ena är nere åt gången. Du ska både in på ön och ut igen, så det gäller att komma i rätt ände av fönstret.',
    timeLimit: 150, reward: 1300,
    deliveries: [
      { from: 'lagret', to: 'glassbaren', item: 'crate' },
      { from: 'fisken', to: 'fiskrest', item: 'fish' },
      { from: 'bageriet', to: 'cafeet', item: 'bread' }
    ],
    extra: ALL_SERVICE,
    gates: [
      { street: 'Djurgårdsbron', shut: [[0, 45]], every: 90 },
      { street: 'Danviksbron', shut: [[45, 90]], every: 90 }
    ]
  },
  {
    title: 'Storleveransen',
    story: 'Fyra leveranser med Västerbron avstängd. Ett större flak sparar många vändor.',
    timeLimit: 160, reward: 1600, startEnergy: 65,
    deliveries: [
      { from: 'lagret', to: 'skolan', item: 'crate' },
      { from: 'mejeriet', to: 'skolan', item: 'milk' },
      { from: 'odlingen', to: 'pizzerian', item: 'carrot' },
      { from: 'bageriet', to: 'cafeet', item: 'bread' }
    ],
    extra: ALL_SERVICE,
    closed: ['Västerbron']
  },
  {
    title: 'Expressrundan',
    story: 'Tre leveranser, snäv tid och Slussen som öppnar mitt i rundan. Bara en ordning hinner fram.',
    timeLimit: 158, reward: 1800,
    deliveries: [
      { from: 'bageriet', to: 'glassbaren', item: 'cake' },
      { from: 'fisken', to: 'fiskrest', item: 'fish' },
      { from: 'bryggeriet', to: 'hotellet', item: 'beer' }
    ],
    extra: ALL_SERVICE,
    gates: [{ street: 'Slussen', shut: [[55, 85]] }]
  },
  {
    title: 'Hela stan',
    story: 'Sista passet: fyra leveranser, avstängd Nybrobro och en Västerbro som öppnas för båtarna. Ladda, ät och sov i rätt lägen.',
    timeLimit: 215, reward: 2400, startEnergy: 70, startFood: 60,
    deliveries: [
      { from: 'mejeriet', to: 'cafeet', item: 'milk' },
      { from: 'odlingen', to: 'pizzerian', item: 'carrot' },
      { from: 'fisken', to: 'fiskrest', item: 'fish' },
      { from: 'lagret', to: 'skolan', item: 'crate' }
    ],
    extra: ALL_SERVICE,
    closed: ['Nybrobron'],
    gates: [{ street: 'Västerbron', shut: [[60, 95]], every: 130 }]
  }
];

// Vilka platser som ska ritas ut under ett visst uppdrag
function levelPlaces(lvl) {
  const set = new Set();
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
  batteryDrainPer100px: 1.0,
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

const SETTINGS_KEY = 'delivery-girl-settings';

// Bara inställningarna sparas — nivå, pengar och uppgraderingar
// börjar om vid varje sidladdning.
function loadSettings() {
  const def = { mode: 'realtime', sound: true };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return def;
    const s = JSON.parse(raw);
    return {
      mode: s.mode === 'planning' ? 'planning' : 'realtime',
      sound: s.sound !== false
    };
  } catch (e) { return def; }
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ mode: run.mode, sound: run.sound }));
  } catch (e) { /* privat läge m.m. */ }
}

function newRun() {
  const set = loadSettings();
  return {
    level: 0, money: 0,
    mode: set.mode, // 'realtime' = välj åtgärder medan bilen kör, 'planning' = planera först
    sound: set.sound,
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
  places: new Set(),
  closed: new Set(),
  follow: true,
  warned: { battery: false, energy: false, food: false },
  over: false,
  userPaused: false,
  truck: {
    x: NODES[START_NODE][0], y: NODES[START_NODE][1],
    atNode: nodeKey(NODES[START_NODE][0], NODES[START_NODE][1]),
    path: [], pathIndex: 0, facing: 1,
    blocked: null, blockNoticed: false,
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

/* ---------- Ljud ---------- */
/* Korta toner som ritas fram i webbläsaren — inga ljudfiler att ladda.
   Ljudkortet får inte startas förrän spelaren rört skärmen, så vi väcker
   det vid första trycket. */

let audioCtx = null;
let audioReady = false;

function wakeAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { audioCtx = new AC(); } catch (e) { return null; }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  audioReady = audioCtx.state === 'running';
  return audioCtx;
}

// Spelar en liten slinga toner
function tones(freqs, opt) {
  if (!run.sound || !audioReady || !audioCtx) return;
  const o = opt || {};
  const dur = o.dur || 0.12, gap = o.gap || 0.075;
  const type = o.type || 'triangle', vol = o.gain || 0.11;
  const t0 = audioCtx.currentTime;
  freqs.forEach((f, i) => {
    const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f, t0 + i * gap);
    const s = t0 + i * gap;
    g.gain.setValueAtTime(0.0001, s);
    g.gain.linearRampToValueAtTime(vol, s + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(s); osc.stop(s + dur + 0.03);
  });
}

const SFX = {
  tap:     () => tones([440], { dur: 0.06, gain: 0.05, type: 'sine' }),
  queue:   () => tones([523, 784], { dur: 0.09, gain: 0.08, gap: 0.05 }),
  pickup:  () => tones([523, 698], { dur: 0.11, gain: 0.09 }),
  deliver: () => tones([659, 880, 1175], { dur: 0.13, gain: 0.1, gap: 0.075 }),
  service: () => tones([392, 587], { dur: 0.16, gain: 0.07, type: 'sine', gap: 0.09 }),
  done:    () => tones([523, 659, 784, 1047], { dur: 0.22, gain: 0.12, gap: 0.11 }),
  fail:    () => tones([440, 349, 262], { dur: 0.3, gain: 0.1, type: 'sine', gap: 0.15 }),
  warn:    () => tones([392, 294], { dur: 0.17, gain: 0.09, gap: 0.13 }),
  ui:      () => tones([660], { dur: 0.05, gain: 0.045, type: 'sine' }),
  money:   () => tones([784, 1047, 1319], { dur: 0.1, gain: 0.09, gap: 0.06 })
};

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
  SFX.queue();
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
      SFX.deliver();
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
    else { t.state = s; SFX.service(); toast(SERVICE_TEXT[s].doing + '…', SERVICE_TEXT[s].icon); }
  } else {
    if (item && item.locId === locId) game.queue.shift();
    t.state = 'idle';
  }
  rebuildRoute();
  renderQueue();
  renderQuestChip();
  checkLevelComplete();
}

// Vilken plats som ligger vid en viss korsning, om någon
function placeAtNode(key) {
  for (const id of game.places) if (nodeKey(LOCATIONS[id].x, LOCATIONS[id].y) === key) return id;
  return null;
}

function tryPickupAt(locId) {
  if (!locId) return;
  for (const d of game.deliveries) {
    if (d.state === 'waiting' && d.from === locId) {
      if (carriedCount() < cargoMax()) {
        d.state = 'carried';
        SFX.pickup();
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
  if (worst === e) return 'nightSleep';
  return 'meal';
}

// Pling när en mätare passerar under en fjärdedel, en gång per resurs
function checkLowWarnings() {
  const t = game.truck;
  const lvls = { battery: t.battery / batteryMax(), energy: t.energy / BAL.energyMax, food: t.food / BAL.foodMax };
  for (const k in lvls) {
    const low = lvls[k] < 0.25;
    if (low && !game.warned[k]) { game.warned[k] = true; SFX.warn(); }
    else if (!low && lvls[k] > 0.32) game.warned[k] = false;
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
    let travel = BAL.truckSpeed * dtReal * game.speed * powerFactor();
    t.blocked = null;
    while (travel > 0 && t.pathIndex < t.path.length - 1) {
      const next = t.path[t.pathIndex + 1];
      // Står vi i en korsning framför en uppfälld bro får vi vänta ut den
      const here = t.path[t.pathIndex];
      if (Math.abs(t.x - here.x) < 0.5 && Math.abs(t.y - here.y) < 0.5) {
        const block = edgeBlockedNow(nodeKey(here.x, here.y), nodeKey(next.x, next.y));
        if (block) {
          if (!t.blockNoticed) { t.blockNoticed = true; SFX.warn(); toast(block.name + ' är uppfälld — väntar.', 'stopwatch'); }
          t.blocked = block;
          break;
        }
      }
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
        t.blockNoticed = false;
      }
    }
    if (!t.blocked && t.pathIndex >= t.path.length - 1) {
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

  checkLowWarnings();

  const lim = currentLevel().timeLimit;
  if (lim !== null && game.clock >= lim) return failLevel('Tiden rann ut. Ingen blir arg på dig, men maten hann bli kall.', 'stopwatch');

  checkLevelComplete();
}

function finishService(msg, icon) {
  SFX.service();
  toast(msg, icon);
  game.queue.shift();
  game.truck.state = 'idle';
  rebuildRoute();
  renderQueue();
}

function checkLevelComplete() {
  if (game.over || !game.running) return;
  if (!game.deliveries.every(d => d.state === 'done')) return;
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
  queueSig = null;
  lastQueueLen = -1;
  game.closed = new Set(lvl.closed || []);
  buildGraph(game.closed);
  game.places = levelPlaces(lvl);
  game.deliveries = lvl.deliveries.map(d => Object.assign({}, d, { state: 'waiting' }));
  const t = game.truck;
  t.x = NODES[START_NODE][0]; t.y = NODES[START_NODE][1];
  t.atNode = nodeKey(NODES[START_NODE][0], NODES[START_NODE][1]);
  t.path = []; t.pathIndex = 0; t.facing = 1;
  t.blocked = null; t.blockNoticed = false;
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
  tryPickupAt(placeAtNode(game.truck.atNode));
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
  SFX.done();
  showCompleteModal(lvl, timeBonus, total, wasLast);
}

function failLevel(reason, icon) {
  if (game.over) return;
  game.over = true;
  game.running = false;
  renderStatus();
  renderControls();
  SFX.fail();
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
    '<p class="wallet">' + iconSpan('money') + '<b>' + run.money + ' kr</b> i kassan</p>';
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
      SFX.money();
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

  html += '<h2 class="section">' + iconSpan(run.sound ? 'soundOn' : 'soundOff') + 'Ljud</h2>' +
    '<button class="toggle' + (run.sound ? ' on' : '') + '" id="soundToggle" type="button">' +
    '<span class="icon">' + ICONS[run.sound ? 'soundOn' : 'soundOff'] + '</span>' +
    '<span class="info"><b>Ljudeffekter</b><small>Korta pling när du lastar, levererar, laddar och när något börjar ta slut.</small></span>' +
    '<span class="sw"><span class="knob"></span></span></button>';

  html += '<h2 class="section">' + iconSpan('quest') + 'Välj uppdrag</h2>' +
    '<p class="sub">Inget sparas mellan sidladdningar — här hoppar du till vilket pass du vill. ' +
    'Du får med dig lönen för passen du hoppar över.</p><div class="levelgrid">';
  LEVELS.forEach((lv, i) => {
    html += '<button class="levelbtn' + (i === game.levelIndex ? ' active' : '') + '" data-level="' + i + '" type="button">' +
      '<b>' + (i + 1) + '</b><span>' + lv.title + '</span></button>';
  });
  html += '</div>' +
    '<div class="btnrow"><button class="btn danger" id="restartBtn" type="button">' + iconSpan('retry') +
    '<span class="lbl">Börja om uppdraget</span></button></div>' +
    '<p class="versionrow">Delivery Girl <b>v' + VERSION + '</b> · ' +
    '<button class="linkbtn" id="modalChangelog" type="button">vad som är nytt</button></p>' +
    '<div class="btnrow"><button class="btn primary" id="modalOk">' + iconSpan('check') + '<span class="lbl">Klar</span></button></div>';
  showModal(html);
  $('#modalChangelog').addEventListener('click', showChangelogModal);
  $('#restartBtn').addEventListener('click', () => { toast('Uppdraget börjar om.', 'retry'); setupLevel(); });
  document.querySelectorAll('.modeopt[data-mode]').forEach(b => {
    b.addEventListener('click', () => { setMode(b.dataset.mode); showSettingsModal(); });
  });
  $('#soundToggle').addEventListener('click', () => {
    run.sound = !run.sound;
    saveSettings();
    if (run.sound) { wakeAudio(); SFX.ui(); }
    toast(run.sound ? 'Ljud på.' : 'Ljud av.', run.sound ? 'soundOn' : 'soundOff');
    showSettingsModal();
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
  saveSettings();
  if (mode === 'planning') {
    // Pausa så spelaren hinner planera klart
    game.running = false;
    game.userPaused = false;
  } else if (!game.over && game.queue.length && !game.userPaused) {
    startLevel();
  }
  toast(mode === 'planning' ? 'Planeringsläge.' : 'Direktkörning.', mode === 'planning' ? 'checklist' : 'click');
  queueSig = null;
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
  { key: 'energy',  icon: 'nightSleep', label: 'Sömn', col: '#5aa9e6', col2: '#93cdf6', max: () => BAL.energyMax },
  { key: 'food',    icon: 'knifeFork',  label: 'Mat',  col: '#f0913d', col2: '#f7c48a', max: () => BAL.foodMax }
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
  $('#qcTitle').textContent = lvl.title;

  const timeEl = $('#qcTime');
  if (lvl.timeLimit === null) {
    timeEl.textContent = Math.floor(game.clock) + ' min';
    timeEl.classList.remove('warn');
  } else {
    const left = Math.max(0, lvl.timeLimit - game.clock);
    timeEl.textContent = Math.ceil(left) + ' min';
    timeEl.classList.toggle('warn', left < lvl.timeLimit * 0.25);
  }

  const ul = $('#qcList');
  const sig = game.deliveries.map(d => d.state).join(',');
  if (ul.dataset.sig !== sig) {
    ul.dataset.sig = sig;
    ul.innerHTML = game.deliveries.map(d =>
      '<li class="' + d.state + '">' + iconSpan(d.state === 'done' ? 'check' : d.item) +
      '<span>' + LOCATIONS[d.from].name + ' → ' + LOCATIONS[d.to].name + '</span></li>').join('');
  }
}

// Kön ritas bara om när den faktiskt ändras. Annars skulle raderna bytas
// ut åtta gånger i sekunden medan bilen kör, och ett tryck på X kunna
// hamna på ett element som just försvann.
let queueSig = null;

function queueSignature() {
  return game.queue.map(q => q.locId + (q.service || '')).join('>') +
    '|' + (game.running ? 1 : 0) + '|' + game.truck.state;
}

let lastQueueLen = -1;

function renderQueue() {
  const sig = queueSignature();
  if (sig === queueSig) { updateQueueProgress(); return; }
  queueSig = sig;

  // Tom kö tar ingen plats; första stoppet fäller ut den igen
  if (game.queue.length !== lastQueueLen) {
    const panel = $('#queuePanel');
    if (game.queue.length === 0) panel.classList.add('collapsed');
    else if (lastQueueLen === 0) panel.classList.remove('collapsed');
    lastQueueLen = game.queue.length;
  }

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
    li.innerHTML = '<span class="num">' + (i + 1) + '</span>' +
      iconSpan(item.service ? SERVICE_TEXT[item.service].icon : 'marker') +
      '<span class="qtext">' + text + '</span>' +
      '<span class="qprog"></span>' +
      '<button class="rm" aria-label="Ta bort ' + text + '" title="Ta bort">' + iconSpan('x') + '</button>';
    li.querySelector('.rm').addEventListener('click', ev => { ev.stopPropagation(); removeQueueItem(i); });
    ol.appendChild(li);
  });
  updateQueueProgress();
  renderControls();
}

// Bara framstegstexten på den rad som pågår behöver uppdateras löpande
function updateQueueProgress() {
  const cell = $('#queueList li .qprog');
  if (!cell) return;
  const t = game.truck;
  let prog = '';
  if (game.running && t.state !== 'idle') {
    if (t.state === 'charge') prog = Math.round((t.battery / batteryMax()) * 100) + ' %';
    else if (t.state === 'eat') prog = Math.round(t.food) + ' %';
    else if (t.state === 'sleep') prog = Math.round(t.energy) + ' %';
    else if (t.state === 'driving') prog = 'kör…';
  }
  if (cell.textContent !== prog) cell.textContent = prog;
}

function renderControls() {
  const play = $('#playBtn');
  play.innerHTML = game.running
    ? iconSpan('pause') + '<span class="lbl">Paus</span>'
    : iconSpan('play') + '<span class="lbl">' + (isRealtime() && !game.userPaused && !game.queue.length ? 'Starta' : 'Kör') + '</span>';
  play.disabled = game.over;
  $('#speedBtn').innerHTML = iconSpan('fast') + '<span class="lbl">' + game.speed + 'x</span>';
  const clear = $('#clearBtn');
  clear.innerHTML = iconSpan('trash');
  clear.hidden = game.queue.length === 0;
}

function renderChips() {
  $('#shopBtn').innerHTML = iconSpan('shop');
  $('#settingsBtn').innerHTML = iconSpan('cog');
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

// Landsbygden fortsätter en bra bit utanför vägnätet, så vyn aldrig tar slut
// Rejält med vatten runt staden, så man kan dra och zooma fritt
const TERRAIN = 2600;
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
const minScale = () => fitScale() * 0.34;
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

// Kameran följer bilen med en dödzon i mitten, så vyn bara glider med när
// hon är på väg ut ur bild. Drar man själv släpper följningen.
function followTruck(dt) {
  const t = game.truck;
  const halfW = viewW / (2 * cam.scale), halfH = viewH / (2 * cam.scale);
  const dzx = halfW * 0.32, dzy = halfH * 0.32;
  let tx = cam.x, ty = cam.y;
  if (t.x < cam.x - dzx) tx = t.x + dzx;
  else if (t.x > cam.x + dzx) tx = t.x - dzx;
  if (t.y < cam.y - dzy) ty = t.y + dzy;
  else if (t.y > cam.y + dzy) ty = t.y - dzy;
  if (tx === cam.x && ty === cam.y) return;
  const k = Math.min(1, dt * 3.5);
  cam.x += (tx - cam.x) * k;
  cam.y += (ty - cam.y) * k;
  clampCam();
}

function setFollow(on) {
  game.follow = on;
  $('#followBtn').classList.toggle('active', on);
  if (on) { cam.x = game.truck.x; cam.y = game.truck.y; clampCam(); }
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
  cam.x = game.truck.x; cam.y = game.truck.y;
  game.follow = true;
  const fb = document.getElementById('followBtn');
  if (fb) fb.classList.add('active');
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
let frameDt = 0;

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
  refreshNeighbours();
  for (const id of game.places) drawLocation(LOCATIONS[id]);
  drawLabels();
  drawRouteBadges();
  drawPulses(frameDt);
  drawTruck();

  ctx.restore();

  // Skärmrymd: pilar mot mål utanför vyn
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawOffscreenTargets();
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

  LANDS.forEach((poly, i) => {
    const box = LAND_BOX[i];
    if (box.x1 < v.x0 || box.x0 > v.x1 || box.y1 < v.y0 || box.y0 > v.y1) return;
    drawLand(poly, box);
  });
  for (const pk of PARKS) {
    if (pk.cx + pk.rx < v.x0 || pk.cx - pk.rx > v.x1 || pk.cy + pk.ry < v.y0 || pk.cy - pk.ry > v.y1) continue;
    drawPark(pk);
  }
}

function tracePolygon(poly) {
  ctx.beginPath();
  ctx.moveTo(poly[0][0], poly[0][1]);
  for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]);
  ctx.closePath();
}

// Bounding box per stadsdel, så kvartersrutorna bara ritas där de syns
const LAND_BOX = LANDS.map(poly => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of poly) {
    x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]);
    x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]);
  }
  return { x0, y0, x1, y1 };
});

function drawLand(poly, box) {
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
  const v = visibleRect();
  const gx0 = Math.floor(Math.max(box.x0, v.x0) / 230) * 230;
  const gx1 = Math.min(box.x1, v.x1);
  const gy0 = Math.floor(Math.max(box.y0, v.y0) / 190) * 190;
  const gy1 = Math.min(box.y1, v.y1);
  for (let gx = gx0; gx < gx1; gx += 230) {
    for (let gy = gy0; gy < gy1; gy += 190) {
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
  const open = STREETS.filter(st => !game.closed.has(st.name));

  // Broarna får räcken som sticker ut i vattnet
  for (const st of open) {
    if (!st.bridge) continue;
    ctx.strokeStyle = '#1a1d23';
    ctx.lineWidth = width(st) + 18;
    traceStreet(st);
    ctx.stroke();
  }
  // Kantsten
  ctx.strokeStyle = '#20242b';
  for (const st of open) { ctx.lineWidth = width(st) + 9; traceStreet(st); ctx.stroke(); }
  // Asfalt
  for (const st of open) {
    ctx.strokeStyle = st.bridge ? '#3a3f47' : '#33383f';
    ctx.lineWidth = width(st);
    traceStreet(st);
    ctx.stroke();
  }
  // Mittlinje på huvudgatorna
  ctx.strokeStyle = 'rgba(246,185,59,0.45)';
  ctx.lineWidth = 3;
  ctx.setLineDash([20, 18]);
  for (const st of open) { if (st.big || st.bridge) { traceStreet(st); ctx.stroke(); } }
  ctx.setLineDash([]);

  drawClosedStreets();
  drawGates();
}

// Avstängda gator: grå stump med rödvita bockar
function drawClosedStreets() {
  for (const st of STREETS) {
    if (!game.closed.has(st.name)) continue;
    ctx.setLineDash([26, 30]);
    ctx.strokeStyle = 'rgba(120,128,140,0.5)';
    ctx.lineWidth = st.bridge ? 46 : st.big ? 52 : 38;
    traceStreet(st);
    ctx.stroke();
    ctx.setLineDash([]);
    for (let i = 0; i < st.nodes.length - 1; i++) {
      const a = nodeAt(st.nodes[i]), b = nodeAt(st.nodes[i + 1]);
      drawBarrier((a.x + b.x) / 2, (a.y + b.y) / 2, Math.atan2(b.y - a.y, b.x - a.x));
    }
  }
}

function drawBarrier(x, y, ang) {
  const w = clamp(80 / cam.scale, 90, 420);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang + Math.PI / 2);
  ctx.fillStyle = '#e55a51';
  roundRect(-w / 2, -w * 0.085, w, w * 0.17, w * 0.05);
  ctx.fill();
  ctx.fillStyle = '#f4efe3';
  for (let i = 0; i < 4; i++) ctx.fillRect(-w / 2 + w * (0.09 + i * 0.235), -w * 0.085, w * 0.11, w * 0.17);
  ctx.strokeStyle = 'rgba(16,20,27,0.75)';
  ctx.lineWidth = Math.max(2, w * 0.02);
  roundRect(-w / 2, -w * 0.085, w, w * 0.17, w * 0.05);
  ctx.stroke();
  ctx.restore();
}

// Broar med tidtabell: grön när öppen, röd när uppfälld, med nedräkning
function drawGates() {
  const gates = currentLevel().gates || [];
  for (const g of gates) {
    const st = STREETS.find(x => x.name === g.street);
    if (!st) continue;
    const a = nodeAt(st.nodes[0]), b = nodeAt(st.nodes[st.nodes.length - 1]);
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const shut = gateShutAt(g, game.clock);
    const w = clamp(96 / cam.scale, 110, 520);

    if (shut) {
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(Math.atan2(b.y - a.y, b.x - a.x) + Math.PI / 2);
      ctx.fillStyle = '#e55a51';
      roundRect(-w / 2, -w * 0.08, w, w * 0.16, w * 0.05);
      ctx.fill();
      ctx.restore();
    }

    // Skylt med tid kvar
    const r = w * 0.34;
    ctx.beginPath();
    ctx.arc(mx, my - w * 0.5, r, 0, Math.PI * 2);
    ctx.fillStyle = shut ? '#e55a51' : '#57c26b';
    ctx.fill();
    ctx.strokeStyle = 'rgba(16,20,27,0.8)';
    ctx.lineWidth = Math.max(2, r * 0.12);
    ctx.stroke();
    const mins = shut ? Math.ceil(gateOpensIn(g, game.clock)) : null;
    ctx.fillStyle = '#12161c';
    ctx.font = '700 ' + (r * 0.95).toFixed(1) + 'px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(shut ? String(mins) : '✓', mx, my - w * 0.5 + r * 0.04);
    ctx.textBaseline = 'alphabetic';
  }
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
    if (game.closed.has(st.name)) continue;
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
    const off = markerSize(loc) / 2 + 4;
    const b = badges[item.locId] || (badges[item.locId] = { x: markerX(loc) - off, y: markerY(loc) - off, nums: [] });
    b.nums.push(s.index + 1);
  }
  for (const k in badges) {
    const b = badges[k];
    const label = b.nums.join(',');
    const r = (15 + (label.length - 1) * 3.5) * clamp(markerSize() / 62, 1, 2.6);
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
/* Smart skalning av skyltarna: de hålls ungefär lika stora på skärmen
   oavsett zoom, men får aldrig bli så stora att grannplatserna hamnar
   ovanpå varandra. Ensligt liggande platser blir därför stora, tätt
   liggande något mindre — och inget överlappar. */

// Hur stora skyltarna ska vara på skärmen — något mindre på en telefon
// så de inte tar över hela vyn
const markerOnScreen = () => Math.min(124, Math.max(74, viewW * 0.22));
let neighbourGap = {};
let neighbourKey = '';

function refreshNeighbours() {
  const key = [...game.places].sort().join(',');
  if (key === neighbourKey) return;
  neighbourKey = key;
  neighbourGap = {};
  const ids = [...game.places];
  for (const a of ids) {
    let best = 2400;
    for (const b of ids) {
      if (a === b) continue;
      const A = LOCATIONS[a], B = LOCATIONS[b];
      const d = Math.hypot(markerX(A) - markerX(B), markerY(A) - markerY(B));
      if (d < best) best = d;
    }
    neighbourGap[a] = best;
  }
}

function markerSize(loc) {
  const room = loc ? (neighbourGap[loc.id] || 2400) * 0.84 : 2400;
  return clamp(Math.min(markerOnScreen() / cam.scale, room), 90, 1500);
}

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
  // Tak i platsens färg — grönt för ström, orange för mat, blått för sömn
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
  const s = markerSize(loc);
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

// Bilen hålls också skärmkonstant, och något större än husen
const truckSize = () => clamp(Math.min(128, Math.max(80, viewW * 0.23)) / cam.scale, 110, 1500);

// Liten ring där man tryckte, så man ser att trycket gick fram
const pulses = [];
function drawPulses(dt) {
  for (let i = pulses.length - 1; i >= 0; i--) {
    const p = pulses[i];
    p.t += dt;
    if (p.t > 0.55) { pulses.splice(i, 1); continue; }
    const k = p.t / 0.55;
    ctx.beginPath();
    ctx.arc(p.x, p.y, (18 + k * 46) / cam.scale, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(246,185,59,' + (0.75 * (1 - k)).toFixed(3) + ')';
    ctx.lineWidth = 4 / cam.scale;
    ctx.stroke();
  }
}

function drawTruck() {
  const t = game.truck;
  const ts = truckSize();
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(t.x, t.y + ts * 0.33, ts * 0.42, ts * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(t.x, t.y);
  if (t.facing < 0) ctx.scale(-1, 1);
  const c = rasterIcon('truck', '#f2f6fb', ts);
  if (c) ctx.drawImage(c, -ts / 2, -ts * 0.54, ts, ts);
  ctx.restore();

  const busy = t.state === 'charge' ? 'charge' : t.state === 'eat' ? 'meal' : t.state === 'sleep' ? 'nightSleep' : null;
  const warn = t.blocked ? 'stopwatch' : truckWarning();
  const bubble = busy || warn;
  if (bubble) {
    const bs = clamp(58 / cam.scale, 58, 120);
    const col = warn && !busy ? '#c2503f' : '#c98a1e';
    drawSpeechBubble(t.x, t.y - ts * 0.5 - bs * 0.45, bubble, col, bs, 0, col);
  }
}

// Mål som ligger utanför vyn visas som pilar i kanten, annars är det lätt
// att tappa bort vart man ska på den stora kartan.
function drawOffscreenTargets() {
  const ids = [];
  const seen = new Set();
  const push = id => { if (id && !seen.has(id) && game.places.has(id)) { seen.add(id); ids.push(id); } };
  for (const q of game.queue) push(q.locId);
  if (!ids.length) {
    for (const d of game.deliveries) {
      if (d.state === 'waiting') push(d.from);
      else if (d.state === 'carried') push(d.to);
    }
  }
  if (!ids.length) return;

  const padX = 30, padTop = 118, padBot = 96;
  const cx = viewW / 2, cy = viewH / 2;

  const placed = [];
  ids.slice(0, 3).forEach(id => {
    const L = LOCATIONS[id];
    const sx = (markerX(L) - cam.x) * cam.scale + cx;
    const sy = (markerY(L) - cam.y) * cam.scale + cy;
    if (sx > padX && sx < viewW - padX && sy > padTop && sy < viewH - padBot) return;

    // Skär linjen från mitten mot målet mot vyns kant
    const dx = sx - cx, dy = sy - cy;
    const limX = viewW / 2 - padX, limY = (viewH - padTop - padBot) / 2;
    const oy = (padTop - padBot) / 2;
    const t = Math.min(Math.abs(limX / (dx || 1e-6)), Math.abs(limY / (dy || 1e-6)));
    let ax = cx + dx * t, ay = cy + oy + dy * t;
    const ang = Math.atan2(dy, dx);
    const r = 21;
    // Knuffa isär brickor som annars skulle hamna ovanpå varandra
    for (const q of placed) {
      const d = Math.hypot(ax - q.x, ay - q.y);
      if (d < r * 2.3) {
        const push = (r * 2.3 - d) + 2;
        ax += (-dy / (Math.hypot(dx, dy) || 1)) * push;
        ay += (dx / (Math.hypot(dx, dy) || 1)) * push;
      }
    }
    placed.push({ x: ax, y: ay });

    ctx.save();
    ctx.translate(ax, ay);
    // Pilspets utåt
    ctx.save();
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(r + 12, 0); ctx.lineTo(r - 1, 8); ctx.lineTo(r - 1, -8);
    ctx.closePath();
    ctx.fillStyle = '#f6b93b';
    ctx.fill();
    ctx.restore();
    // Bricka med platsens symbol
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16,20,27,0.92)';
    ctx.fill();
    ctx.strokeStyle = '#f6b93b';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
    drawIcon(L.icon, L.color, ax, ay, r * 1.25);
  });
}

/* ---------- Panorering, zoom och tryck ---------- */

const pointers = new Map();
let dragAnchor = null, moveDist = 0, downTime = 0, pinch = null;

document.addEventListener('pointerdown', wakeAudio, { once: false, passive: true });

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
    if (moveDist > 14 && game.follow) setFollow(false);
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
      pulses.push({ x: p.x, y: p.y, t: 0 });
      if (id) queueLocation(id); else SFX.tap();
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
  const rNode = Math.max(34, (touch ? 22 : 16) / cam.scale);
  let best = null, bestD = Infinity;
  for (const id of game.places) {
    const L = LOCATIONS[id];
    const rHouse = Math.max(markerSize(L) * 0.62, (touch ? 30 : 24) / cam.scale);
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
  SFX.ui();
  if (game.running) { game.running = false; game.userPaused = true; }
  else { game.userPaused = false; startLevel(); }
  renderControls();
});
$('#speedBtn').addEventListener('click', () => {
  game.speed = game.speed === 1 ? 2 : game.speed === 2 ? 4 : 1;
  renderControls();
});
$('#clearBtn').addEventListener('click', clearQueue);
$('#followBtn').innerHTML = ICONS.truck ? '<span class="icon">' + ICONS.truck + '</span>' : '';
$('#followBtn').addEventListener('click', () => setFollow(!game.follow));
$('#questChip').addEventListener('click', () => showQuestModal(false));
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
  frameDt = dt;
  if (game.follow && !modalOpen()) followTruck(dt);
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
$('#queuePanel').classList.add('collapsed');
resizeCanvas();
fitView();
renderAll();
setupLevel();
requestAnimationFrame(frame);
