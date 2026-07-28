# Delivery Girl

Ett varmt, strategiskt planeringsspel i vanilla JavaScript — inga beroenden, ingen byggprocess. Körs direkt på GitHub Pages.

Du är Delivery Girl och kör stadens lilla eldrivna lastbil. Mormor Greta packar lådorna, Rosa bakar kanelbullar, Enzo sjunger opera över pizzadegen och Majkens katt Sill sitter i fönstret och väntar på dig. Ditt jobb är att planera körschemat: tryck på platser på kartan för att köa stopp, tryck på **Kör** och se rutten simuleras.

## Spelet

- **10 nivåer** med egna berättelser, leveranser och tidsgränser.
- **Planera i förväg:** köa hur många stopp du vill — kör, ladda, ät, sov. Lägg till och ta bort stopp även medan bilen rullar, så slipper du väntetid mellan uppdragen.
- **Tre resurser:** bilens batteri, din energi och din mat. Ladda på laddstationerna, ät hos Bengt på Vägkrogen och sov hos Vera på Motell Vilan. Långpassen börjar med trött förare, så vila måste planeras in.
- **Pengar & butik:** klarade uppdrag ger pengar som köper uppgraderingar — större batteri, snabbladdning, större flak, kaffetermos och kylbox.
- Framsteg sparas automatiskt i webbläsaren (localStorage).

## Två sätt att spela

Kugghjulet uppe till höger öppnar inställningarna, där du väljer spelläge. Valet sparas och gäller direkt, även mitt i ett uppdrag.

- **Direktkörning** (standard) — tryck på en plats så rullar bilen dit direkt. Klockan startar vid ditt första stopp och du fyller på med nya åtgärder i realtid medan hon kör.
- **Planering** — klockan står stilla medan du bygger hela körschemat. När du är nöjd trycker du på **Kör** och ser rutten simuleras från början till slut.

## Kartan

Kartan fyller hela webbläsarfönstret, oavsett skärmform — landsbygden med åkrar, skogsdungar och hav fortsätter utanför stan, så det finns aldrig tomma kanter runt spelplanen. Dra för att panorera, nyp eller scrolla för att zooma; knapparna nere till höger zoomar in, ut och visar hela stan igen.

## Teknik

- Vanilla JS + Canvas, en enda statisk sida (`index.html`, `style.css`, `game.js`, `icons.js`).
- Dubbeltryck-zoom, nyp-zoom på sidan, textmarkering och iOS-förstoringsglas är avstängda för en app-lik känsla på mobil.
- Versionsnummer och ändringslogg visas i spelet — tryck på versionsknappen (v…) uppe till höger.
- **Cache-busting:** `tools/cache-bust.js` stämplar innehållshashar på `style.css`, `icons.js` och `game.js` i `index.html`. Det körs automatiskt vid varje push av `.github/workflows/cache-bust.yml`, som committar tillbaka uppdaterade hashar när något ändrats. Kör det lokalt med `node tools/cache-bust.js`, eller aktivera pre-commit-hooken en gång per klon med `git config core.hooksPath .githooks` så stämplas det redan vid commit.

## Attribution

Symboler av [Delapouite](https://delapouite.com) & [Lorc](https://lorcblog.blogspot.com) från [game-icons.net](https://game-icons.net), licens [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).
