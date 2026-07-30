# Delivery Girl

Ett varmt, strategiskt planeringsspel i vanilla JavaScript — inga beroenden, ingen byggprocess. Körs direkt på GitHub Pages.

Du är Delivery Girl och kör stadens lilla eldrivna lastbil. Hämta varor och kör ut dem: tryck på platser på kartan så åker bilen dit.

## Spelet

- **10 uppdrag som är pussel:** varje bana har bara 1–3 turordningar som går ihop inom tidsgränsen. Avstängda gator och broar som fälls upp för båttrafik gör att ordningen och tidpunkten avgör. Hela bandesignen och lösningarna finns i [LEVELS.md](LEVELS.md).
- **Enkelt bildspråk:** ett hämtställe ritas som en hög med fem varor, en butik som ett hus med en skylt för vad den handlar med, och den som väntar på en leverans har en gungande pratbubbla med symbolen för varan den vill ha.
- **Bara det som hör till uppdraget syns** på kartan. Fler platser dyker upp allt eftersom uppdragen blir svårare.
- **Uppdragslista** uppe till höger som stryks över allt eftersom leveranserna kommer fram.
- **Kön med åtgärder:** köa hur många stopp du vill — kör, ladda, ät, sov. Varje rad i körschemat har ett **X** för att plocka bort just den, och du kan lägga till och ta bort stopp även medan bilen rullar.
- **Uppdraget är klart** så fort sista leveransen är framme. Bilen börjar dagen på en startplats i stan, men du behöver inte köra tillbaka dit.
- **Tre resurser med var sin färg och symbol:** grön blixt för bilens ström, blå zzz för din sömn och orange bestick för mat. Laddstationer, viloställen och matställen bär samma symboler och färger på kartan, så de är lätta att hitta.
- **Tre resurser:** bilens batteri, din energi och din mat. Ladda på laddstationen, ät på matstället och sov på vandrarhemmet. Börjar något ta slut kryper bilen fram och visar en pratbubbla med vad som fattas. Långpassen börjar med trött förare, så vila måste planeras in.
- **Pengar & butik:** klarade uppdrag ger pengar som köper uppgraderingar — större batteri, snabbladdning, större flak, kaffetermos och kylbox.
- **Spelframstegen sparas inte** — varje omladdning är en ny arbetsdag. Vill du hoppa till ett senare pass finns uppdragsväljaren i inställningarna, och du får då med dig lönen för passen du hoppar över. Dina *inställningar* (spelläge och ljud) sparas däremot mellan besök.

## Två sätt att spela

Kugghjulet uppe till höger öppnar inställningarna, där du väljer spelläge. Valet sparas och gäller direkt, även mitt i ett uppdrag.

- **Direktkörning** (standard) — tryck på en plats så rullar bilen dit direkt. Klockan startar vid ditt första stopp och du fyller på med nya åtgärder i realtid medan hon kör. Körschemat göms i det här läget: du styr på kartan, och de köade stoppen syns som numrerade brickor.
- **Planering** — klockan står stilla medan du bygger hela körschemat. När du är nöjd trycker du på **Kör** och ser rutten simuleras från början till slut.

## Kartan

Spelplanen är en hel stad med Stockholm som inspiration: sex stadsdelar — city, Kungsholmen, Östermalm, Gamla stan, Söder och Djurgården — omgivna av vatten som inte går att köra i. Gatorna är riktiga gator snarare än ett rutnät, från Kungsgatan och Klarabergsgatan i city till Hornsgatan och Ringvägen i söder och Strandvägen på Östermalm. Sju broar binder ihop stadsdelarna och blir flaskhalsar värda att planera kring — vissa uppdrag stänger av en helt, andra låter dem fällas upp för båttrafik i bestämda fönster. Ruttvalet tar hänsyn till tidtabellen och kör hellre runt en uppfälld bro än väntar, när det går. Parker som Humlegården, Tantolunden och Vitabergsparken ligger i vägen och måste köras runt.

Platserna ligger utspridda över hela stan, så en enda leverans kan gå från Djurgården i öster till Söder och kräva laddstopp på vägen. Det finns bara **två laddstationer**, två matställen och två ställen att sova på — räckvidden måste planeras.

Husen och symbolerna håller sin storlek på skärmen när du zoomar, så de går att läsa lika bra i översikt som inzoomat. Där platserna ligger tätt krymper de precis så mycket att de inte överlappar. Runt staden finns gott om vatten att panorera och zooma fritt i.

Kartan börjar centrerad på bilen och **kameran följer henne** medan hon kör. Dra för att titta någon annanstans — då släpper följningen — och tryck på bilknappen nere till höger för att följa igen. Mål som hamnar utanför skärmen visas som pilar i kanten med platsens symbol. Nyp eller scrolla för att zooma; knapparna nere till höger zoomar in, ut och ramar in hela stan. Gatunamnen dyker upp när du zoomar in, och skyltarna växer när du zoomar ut så att de går att se och träffa även i översikt.

## Teknik

- Vanilla JS + Canvas, en enda statisk sida (`index.html`, `style.css`, `game.js`, `icons.js`).
- Dubbeltryck-zoom, nyp-zoom på sidan, textmarkering och iOS-förstoringsglas är avstängda för en app-lik känsla på mobil. Knappar och träffytor är tumstora på pekskärmar, och träffytan för en plats mäts i skärmpixlar så den är lika lätt att träffa vid alla zoomnivåer.
- Mobilanpassat gränssnitt: slimmad status, en bottenrad med bara Kör och hastighet, ett körschema som fäller ihop sig när det är tomt, och en ring som kvitterar varje tryck på kartan. Sammanlagt täcker gränssnittet 18 % av en telefonskärm.
- Minimalt gränssnitt: pengarna visas i butiken och versionsnumret med ändringslogg i inställningsmenyn.
- **Bandesign:** `tools/verify-levels.js` provar varje turordning av leveranserna i varje uppdrag och räknar hur många som går ihop, så att banorna håller sig på 1–3 lösningar. Kör `node tools/verify-levels.js` (eller `--probe` för tiderna utan tidsgräns).
- **Cache-busting:** `tools/cache-bust.js` stämplar innehållshashar på `style.css`, `icons.js` och `game.js` i `index.html`. Det körs automatiskt vid varje push av `.github/workflows/cache-bust.yml`, som committar tillbaka uppdaterade hashar när något ändrats. Kör det lokalt med `node tools/cache-bust.js`, eller aktivera pre-commit-hooken en gång per klon med `git config core.hooksPath .githooks` så stämplas det redan vid commit.

## Attribution

Symboler av [Delapouite](https://delapouite.com) & [Lorc](https://lorcblog.blogspot.com) från [game-icons.net](https://game-icons.net), licens [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).
