# Bandesign

Varje uppdrag är ett **pussel med 1–3 rätta lösningar**, inte en öppen
optimeringsövning. Kartan är stor och rutterna långa, så det som avgör är
i vilken ordning du tar ärendena och när du passerar broarna.

Antalet lösningar mäts med `tools/verify-levels.js`, som provar varje
turordning av leveranserna med grundutrustning och räknar hur många som
går ihop inom tidsgränsen. Uppgraderingar från butiken gör pusslen
lättare — det är vad du köper för pengarna.

## Vad som gör dem till pussel

**Ett flak.** Utan uppgradering rymmer flaket en last, så varje leverans
är hämta → lämna. Turordningen är därmed hela lösningen.

**Avstängda gator.** Ett uppdrag kan stänga av en gata eller bro helt
(`closed`). Den ritas grå och streckad med rödvita bockar, och finns inte
i vägnätet. Stänger man Västerbron nås Kungsholmen bara via Stadshusbron,
vilket vänder upp och ner på vilken ordning som är kortast.

**Broar med tidtabell.** En bro kan fällas upp för båttrafik i bestämda
fönster (`gates`). En grön bricka med bock betyder öppen, en röd bricka
med siffra visar hur många minuter tills den fälls ner igen.

Ruttvalet tar hänsyn till tidtabellen: står bron uppfälld kör hon hellre
runt än ställer sig och väntar. Omvägen kostar tid — på nivå 7 växer
sträckan Lagret → Glassbaren från 3 254 till 4 443 px när bron går upp.
Finns ingen väg runt kör hon fram och väntar ut bron med en klocka över
taket.

**Knappa resurser.** Två laddstationer, två matställen och två
viloställen på en stad som mäter 5 400 × 4 000 px. Långpassen börjar
dessutom med trött och hungrig förare, så vila måste vävas in i rundan.

## Uppdragen

| # | Uppdrag | Leveranser | Hinder | Tid | Lösningar |
|---|---------|-----------|--------|-----|-----------|
| 1 | Bröd till caféet | 1 | — | ingen gräns | 1 av 1 |
| 2 | Bron öppnar för båtarna | 1 | Danviksbron uppfälld 22–55 | 88 | 1 av 1 |
| 3 | Västerbron är avstängd | 2 | Västerbron avstängd | 86 | 2 av 2 |
| 4 | Slussen i tid | 3 | Västerbron avstängd, Slussen uppfälld 32–50 var 50:e min | 94 | 3 av 6 |
| 5 | Långpasset | 3 | Stadshusbron avstängd, trött och hungrig förare | 300 | 3 av 6 |
| 6 | Genom Gamla stan | 2 | Nybrobron avstängd, Vasabron uppfälld 40–62 | 97 | 2 av 2 |
| 7 | Två broar, ett fönster | 3 | Djurgårdsbron och Danviksbron uppfällda växelvis | 150 | 1 av 6 |
| 8 | Storleveransen | 4 | Västerbron avstängd, trött förare | 160 | 1 av 24 |
| 9 | Expressrundan | 3 | Slussen uppfälld 55–85 | 158 | 2 av 6 |
| 10 | Hela stan | 4 | Nybrobron avstängd, Västerbron uppfälld 60–95 var 130:e min | 215 | 2 av 24 |

### Lösningarna

**1. Bröd till caféet** — Bageriet → Caféet. Introduktion utan hinder,
båda platserna ligger i city. *12 min.*

**2. Bron öppnar för båtarna** — Fiskhamnen → Fiskrestaurangen. Enda
ärendet, men Danviksbron är uppfälld halva passet. Åker du direkt hinner
du över innan den stänger; annars kör hon runt via Djurgårdsbron, vilket
är det som får plats i tidsgränsen. *81 min.*

**3. Västerbron är avstängd** — Mejeriet → Caféet, sedan Odlingen →
Pizzerian *(78 min)*, eller omvänt *(82 min)*. Med Västerbron borta måste
Kungsholmen nås via Stadshusbron, så båda ordningarna passerar city.

**4. Slussen i tid** — Bageriet → Caféet först, sedan Odlingen →
Pizzerian eller Lagret → Skolan *(92 min)*, alternativt Lagret → Skolan
först *(94 min)*. Poängen är att lägga Slussenpassagen utanför fönstret
32–50; de tre ordningar som misslyckas fastnar i uppfällningen.

**5. Långpasset** — Mejeriet → Caféet, Odlingen → Pizzerian, Fiskhamnen →
Fiskrestaurangen *(258 min)*, med två varianter till. Stadshusbron är
avstängd och du börjar med 60 i sömn och 55 i mat, så både ett matstopp
och en vila måste in i rundan.

**6. Genom Gamla stan** — Mejeriet → Caféet, sedan Lagret → Glassbaren
*(90 min)*, eller omvänt *(92 min)*. Nybrobron är borta, så östra sidan
nås bara söderifrån, och Vasabron är uppfälld 40–62.

**7. Två broar, ett fönster** — Lagret → Glassbaren, Fiskhamnen →
Fiskrestaurangen, Bageriet → Caféet. *Enda* lösningen: broarna till
Djurgården fälls upp växelvis, så du måste in på ön genom den ena och ut
genom den andra. *136 min.*

**8. Storleveransen** — Mejeriet → Skolan, Bageriet → Caféet, Lagret →
Skolan, Odlingen → Pizzerian. Enda lösningen av tjugofyra: de två
leveranserna till Skolan måste delas upp så att Kungsholmen bara besöks
en gång, trots att Västerbron är avstängd. *152 min.*

**9. Expressrundan** — Bageriet → Glassbaren, Fiskhamnen →
Fiskrestaurangen, Bryggeriet → Hotellet *(130 min)*, eller Bryggeriet →
Hotellet först *(150 min)*. Slussen är uppfälld 55–85 mitt i rundan.

**10. Hela stan** — Lagret → Skolan, Odlingen → Pizzerian, Fiskhamnen →
Fiskrestaurangen, Mejeriet → Caféet *(196 min)*, eller med de två sista
omkastade *(197 min)*. Nybrobron är avstängd och Västerbron öppnas
periodiskt, så staden måste betas av i ett varv snarare än fram och
tillbaka.

## Att ändra en bana

Uppdragen ligger i `LEVELS` i `game.js`. Utöver leveranser och tidsgräns
finns:

- `closed: ['Västerbron']` — gator som är helt avstängda under uppdraget.
- `gates: [{ street: 'Slussen', shut: [[32, 50]], every: 50 }]` — broar
  med tidtabell. `shut` är fönster i spelminuter; `every` gör dem
  periodiska, annars gäller de en gång.
- `extra: [...]` — vilka serviceplatser som visas.
- `startEnergy` / `startFood` — börja passet halvtrött eller hungrig.

Kör `node tools/verify-levels.js` efter varje ändring. Ligger antalet
lösningar utanför 1–3 justerar du tidsgränsen: `--probe` visar hur lång
tid varje turordning tar utan gräns, och gränsen sätts mellan den tredje
och fjärde snabbaste.
