# GRL Transport

Ett strategiskt planeringsspel i vanilla JavaScript — inga beroenden, ingen byggprocess. Körs direkt på GitHub Pages.

Du styr en transportbil och planerar dess körschema: tryck på platser på kartan för att köa stopp (kör, ladda, ät, sov), tryck på **Kör** och se rutten simuleras på kartan.

## Spelet

- **10 nivåer** med leveransuppdrag av ökande svårighet och tidsgränser.
- **Tre resurser att hålla koll på:** bilens batteri, förarens energi och mat. Ladda på laddstationer, sov på motellet och ät på vägkrogen.
- **Körschema:** köa hur många stopp du vill, ta bort och lägg till även medan bilen kör.
- **Pengar & butik:** klarade uppdrag ger pengar som köper uppgraderingar — större batteri, snabbladdning, större flak, kaffetermos och kylbox.
- Framsteg sparas automatiskt i webbläsaren (localStorage).

## Teknik

- Vanilla JS + Canvas, en enda statisk sida (`index.html`, `style.css`, `game.js`, `icons.js`).
- Dubbeltryck-zoom, nyp-zoom, textmarkering och iOS-förstoringsglas är avstängda för en app-lik känsla på mobil.
- Versionsnummer och ändringslogg visas i spelet — tryck på versionsknappen (v…) i sidhuvudet.

## Attribution

Symboler av [Delapouite](https://delapouite.com) & [Lorc](https://lorcblog.blogspot.com) från [game-icons.net](https://game-icons.net), licens [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).
