# Delivery Girl

Ett varmt, strategiskt planeringsspel i vanilla JavaScript — inga beroenden, ingen byggprocess. Körs direkt på GitHub Pages.

Du är Delivery Girl och kör stadens lilla eldrivna lastbil. Mormor Greta packar lådorna, Rosa bakar kanelbullar, Enzo sjunger opera över pizzadegen och Majkens katt Sill sitter i fönstret och väntar på dig. Ditt jobb är att planera körschemat: tryck på platser på kartan för att köa stopp, tryck på **Kör** och se rutten simuleras.

## Spelet

- **10 nivåer** med egna berättelser, leveranser och tidsgränser.
- **Planera i förväg:** köa hur många stopp du vill — kör, ladda, ät, sov. Lägg till och ta bort stopp även medan bilen rullar, så slipper du väntetid mellan uppdragen.
- **Tre resurser:** bilens batteri, din energi och din mat. Ladda på laddstationerna, ät hos Bengt på Vägkrogen och sov hos Vera på Motell Vilan. Långpassen börjar med trött förare, så vila måste planeras in.
- **Pengar & butik:** klarade uppdrag ger pengar som köper uppgraderingar — större batteri, snabbladdning, större flak, kaffetermos och kylbox.
- Framsteg sparas automatiskt i webbläsaren (localStorage).

## Kartan

Kartan går att panorera och zooma: dra för att flytta, nyp eller scrolla för att zooma, och knapparna nere till höger zoomar in, ut och visar hela kartan. Vyn är inte låst till liggande läge utan fyller skärmen lika bra stående som liggande.

## Teknik

- Vanilla JS + Canvas, en enda statisk sida (`index.html`, `style.css`, `game.js`, `icons.js`).
- Dubbeltryck-zoom, nyp-zoom på sidan, textmarkering och iOS-förstoringsglas är avstängda för en app-lik känsla på mobil.
- Versionsnummer och ändringslogg visas i spelet — tryck på versionsknappen (v…) uppe till höger.

## Attribution

Symboler av [Delapouite](https://delapouite.com) & [Lorc](https://lorcblog.blogspot.com) från [game-icons.net](https://game-icons.net), licens [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).
