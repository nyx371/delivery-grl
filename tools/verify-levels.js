#!/usr/bin/env node
/*
 * Pusselkontroll för banorna.
 *
 * För varje uppdrag provas alla turordningar av leveranserna. Servicestopp
 * (ladda, äta, sova) läggs in av en fast policy, så en "lösning" är en
 * turordning som går ihop inom tidsgränsen med grundutrustning. Målet är
 * 1-3 lösningar per uppdrag — se LEVELS.md.
 *
 *   node tools/verify-levels.js            räkna lösningar per uppdrag
 *   node tools/verify-levels.js --probe    visa tiderna utan tidsgräns
 *
 * Kräver playwright-core och en Chromium; sökvägen nedan pekar på den
 * förinstallerade webbläsaren i utvecklingsmiljön.
 */
const { chromium } = require('playwright-core');

const PLANNER = () => {
  window.__solve = {
    dist(toLoc) {
      return shortestPath(game.truck.atNode, nodeKey(LOCATIONS[toLoc].x, LOCATIONS[toLoc].y)).dist;
    },
    nearest(ids) {
      let best = null, bd = Infinity;
      for (const id of ids) { const d = this.dist(id); if (d < bd) { bd = d; best = id; } }
      return best;
    },
    withService(kind) { return [...game.places].filter(id => LOCATIONS[id].service === kind); },
    cost(px) { return (px / 100) * BAL.batteryDrainPer100px; },
    chargerFrom(fromId) {
      const from = nodeKey(LOCATIONS[fromId].x, LOCATIONS[fromId].y);
      let best = null, bd = Infinity;
      for (const id of this.withService('charge')) {
        const d = shortestPath(from, nodeKey(LOCATIONS[id].x, LOCATIONS[id].y)).dist;
        if (d < bd) { bd = d; best = { id, dist: d }; }
      }
      return best;
    },
    // Nästa ärende enligt den turordning vi provar
    errand(order) {
      const cap = cargoMax();
      const carried = game.deliveries.filter(d => d.state === 'carried');
      // Lämna av det vi har om flaket är fullt eller inget mer går att hämta
      const waiting = order.filter(i => game.deliveries[i].state === 'waiting');
      if (carried.length && (carried.length >= cap || !waiting.length)) {
        return this.nearest(carried.map(d => d.to));
      }
      if (waiting.length) return game.deliveries[waiting[0]].from;
      return null;
    },
    next(order) {
      const t = game.truck;
      const beds = this.withService('sleep'), diners = this.withService('eat');
      let target = null;
      if (t.energy < 58 && beds.length) target = this.nearest(beds);
      else if (t.food < 58 && diners.length) target = this.nearest(diners);
      else target = this.errand(order);
      if (!target) return null;
      const chargers = this.withService('charge');
      if (chargers.length && t.battery < batteryMax() - 1) {
        const leg = this.cost(this.dist(target));
        const onward = this.chargerFrom(target);
        const reserve = onward ? this.cost(onward.dist) : 0;
        if (t.battery - leg - reserve < 12) return this.nearest(chargers);
      }
      return target;
    },
    step(order) {
      if (game.over || !game.running || game.queue.length) return;
      const id = this.next(order);
      if (id) queueLocation(id);
    }
  };
};

function permutations(n) {
  const out = [];
  const walk = (cur, left) => {
    if (!left.length) { out.push(cur.slice()); return; }
    for (let i = 0; i < left.length; i++) {
      walk(cur.concat(left[i]), left.slice(0, i).concat(left.slice(i + 1)));
    }
  };
  walk([], Array.from({ length: n }, (_, i) => i));
  return out;
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true, args: ['--no-sandbox'] });
  const page = await (await browser.newContext({ viewport: { width: 900, height: 700 } })).newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').join(__dirname, '..', 'index.html'));
  await page.waitForTimeout(400);
  await page.evaluate(PLANNER);
  const probe = process.argv.includes('--probe');
  if (probe) await page.evaluate(() => { window.__probe = true; });

  const n = await page.evaluate(() => LEVELS.length);
  const summary = [];

  for (let lvl = 0; lvl < n; lvl++) {
    const info = await page.evaluate(l => ({
      title: LEVELS[l].title, deliveries: LEVELS[l].deliveries.length, limit: LEVELS[l].timeLimit
    }), lvl);
    const perms = permutations(info.deliveries);
    const wins = [];
    const times = [];

    for (const order of perms) {
      const res = await page.evaluate(async ([l, ord]) => {
        run.upgrades = { batteryCap: 0, chargeSpeed: 0, cargo: 0, thermos: 0, coolbox: 0 };
        if (window.__probe) { LEVELS[l].__lim = LEVELS[l].timeLimit; LEVELS[l].timeLimit = null; }
        game.levelIndex = l;
        setupLevel();
        hideModal();
        game.speed = 30;
        startLevel();
        return await new Promise(resolve => {
          const timer = setInterval(() => {
            window.__solve.step(ord);
            if (game.over) {
              clearInterval(timer);
              resolve({ won: game.deliveries.every(d => d.state === 'done'), clock: Math.round(game.clock) });
            }
          }, 12);
          setTimeout(() => { clearInterval(timer); resolve({ won: false, clock: -1 }); }, 30000);
        });
      }, [lvl, order]);
      if (res.won) wins.push({ order, clock: res.clock });
      if (probe) times.push({ order, clock: res.clock, won: res.won });
    }

    const names = await page.evaluate(l => LEVELS[l].deliveries.map(d => LOCATIONS[d.from].name + '→' + LOCATIONS[d.to].name), lvl);
    const verdict = wins.length === 0 ? 'OLÖSLIGT' : (wins.length <= 3 ? 'OK' : 'FÖR MÅNGA');
    console.log(
      String(lvl + 1).padStart(2) + '. ' + info.title.padEnd(26) +
      wins.length + '/' + perms.length + ' turordningar går ihop  ' + verdict +
      (wins.length ? '  (bäst ' + Math.min(...wins.map(w => w.clock)) + '/' + info.limit + ' min)' : ''));
    for (const w of wins.slice(0, 3)) {
      console.log('      lösning: ' + w.order.map(i => names[i]).join('  →  ') + '   [' + w.clock + ' min]');
    }
    if (probe) {
      const ok = times.filter(t => t.won).map(t => t.clock).sort((a, b) => a - b);
      console.log('      tider utan gräns: ' + ok.join(', ') + '  (nuvarande gräns ' + info.limit + ')');
    }
    summary.push({ lvl: lvl + 1, wins: wins.length, of: perms.length });
  }

  const bad = summary.filter(s => s.wins === 0 || s.wins > 3);
  console.log('\nSammanfattning:', bad.length ? 'justera nivå ' + bad.map(b => b.lvl + ' (' + b.wins + ')').join(', ') : 'alla uppdrag har 1–3 lösningar');
  console.log('ERRORS:', errors.length ? errors.join('|') : 'none');
  await browser.close();
})();
