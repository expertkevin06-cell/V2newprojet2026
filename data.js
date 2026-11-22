/* ═══════════════════════════════════════════════════════════════════════════
   KEV FUSION 2026 — BASE TECHNIQUE v17  ·  window.KFD  ·  auto-expansion
   Couverture 2017 → 2027 · corrélation marque → modèle → motorisation → puissance
   Format catalogue compact (expansé en fin de fichier) :
     marque : [Nom, Pays, `modèles`]
     modèle : id~Nom~y0~y1~SEG~moteurs            (années sur 2 chiffres)
     moteur : Famille#ch[,ch:kWh]#CODE[#ÉNERGIE][#années][#technologie]
              énergie par défaut E ; années par défaut = celles du modèle
   ═══════════════════════════════════════════════════════════════════════════ */
window.KFD = (function () {
"use strict";

var fuel = { E:"Essence", D:"Diesel", H:"Hybride", P:"PHEV", EV:"Électrique", G:"GPL" };
var sev  = { critique:{n:"Critique",r:0}, eleve:{n:"Élevé",r:1}, moyen:{n:"Moyen",r:2}, info:{n:"Info",r:3} };
var kind = { rappel:"Rappel", campagne:"Campagne", tsb:"TSB / bulletin", panne:"Panne connue" };

var dom = [
["moteur","Moteur / mécanique","i-piston","am"],["distribution","Distribution","i-chain","rd"],
["injection","Injection / pompe HP","i-inj","am"],["allumage","Allumage / préchauffage","i-spark","am"],
["suralim","Turbo / suralimentation","i-turbo","bl"],["depol","Dépollution EGR/FAP/SCR","i-filter","gr"],
["transmission","Boîte / transmission","i-gear","vi"],["acoups","À-coups / vibrations","i-wave","mg"],
["freinage","Freinage","i-brake","rd"],["abs","ABS / ESP","i-abs","rd"],
["airbag","Airbag / prétensionneurs","i-airbag","rd"],["ceinture","Ceintures / ancrages","i-belt","am"],
["siege","Sièges / occupancy","i-seat","vi"],["train","Trains roulants","i-wheel","bl"],
["geometrie","Géométrie / direction","i-align","bl"],["portes","Ouvrants / serrures","i-door","te"],
["cle","Clé / antidémarrage","i-key","te"],["elec12","Batterie 12 V","i-batt","am"],
["elec48","Réseau 48 V","i-batt","gr"],["hv","Batterie haute tension","i-hv","cy"],
["charge","Charge AC / DC","i-plug","cy"],["autonomie","Autonomie / consommation","i-gauge","gr"],
["thermique","Refroidissement / clim","i-temp","bl"],["adas","ADAS / radar","i-radar","vi"],
["camera","Caméras / vision","i-cam","vi"],["telematique","Télématique / OTA","i-wifi","mg"],
["tablette","Écran / multimédia","i-screen","mg"],["eclairage","Éclairage","i-light","am"],
["carrosserie","Carrosserie / étanchéité","i-body","te"]];

/* [regex, cm³, cylindres, architecture, alimentation, distribution] */
var eng = [
["^(1KR|K10|K12)",998,3,"3 en ligne","Atmosphérique MPI","Chaîne"],
["^EB0",999,3,"3 en ligne","Atmosphérique MPI","Courroie humide"],
["^EB2LTEDH",1199,3,"3 en ligne Miller","Turbo VGT + MHEV 48 V","Chaîne"],
["^EB2LTED",1199,3,"3 en ligne Miller","Turbo VGT injection directe","Chaîne"],
["^EB2ADT",1199,3,"3 en ligne","Turbo injection directe","Courroie humide"],
["^EB2",1199,3,"3 en ligne","Turbo injection directe","Courroie humide"],
["^DV4",1397,4,"4 en ligne","Diesel HDi common rail","Courroie"],
["^DV5",1499,4,"4 en ligne","Diesel BlueHDi + SCR","Courroie + chaîne AAC"],
["^DV6",1560,4,"4 en ligne","Diesel HDi/BlueHDi","Courroie"],
["^DW10",1997,4,"4 en ligne","Diesel BlueHDi + SCR","Courroie"],
["^DW12",2179,4,"4 en ligne","Diesel HDi + SCR","Courroie"],
["^EP6",1598,4,"4 en ligne","Turbo injection directe","Chaîne"],
["^H4B",898,3,"3 en ligne","Turbo MPI TCe","Chaîne"],
["^H4D",999,3,"3 en ligne","TCe turbo / SCe atmo","Chaîne"],
["^H5F",1197,4,"4 en ligne","Turbo injection directe TCe","Chaîne"],
["^H5H",1332,4,"4 en ligne","Turbo DI TCe + GPF","Chaîne"],
["^HR10",999,3,"3 en ligne","Turbo DI DIG-T","Chaîne"],
["^HR12",1199,3,"3 en ligne","Turbo injection directe","Chaîne"],
["^HR13",1332,4,"4 en ligne","Turbo DI DIG-T","Chaîne"],
["^HR16",1598,4,"4 en ligne","Atkinson / e-POWER","Chaîne"],
["^HR18",1798,4,"4 en ligne","Atkinson full hybrid","Chaîne"],
["^KR15",1497,3,"3 en ligne VC-Turbo","Compression variable","Chaîne"],
["^KR20",1997,4,"4 en ligne VC-Turbo","Compression variable","Chaîne"],
["^K9K",1461,4,"4 en ligne","Diesel dCi common rail","Courroie"],
["^M9R",1995,4,"4 en ligne","Diesel dCi common rail","Chaîne"],
["^M9T",2299,4,"4 en ligne","Diesel dCi + SCR","Chaîne"],
["^R9M",1598,4,"4 en ligne","Diesel dCi biturbo","Chaîne"],
["^H4M",1598,4,"4 en ligne Atkinson","Hybride E-Tech multimode","Chaîne"],
["^M5P",1798,4,"4 en ligne","Turbo injection directe","Chaîne"],
["^M5M",1618,4,"4 en ligne","Turbo injection directe","Chaîne"],
["^CHY",999,3,"3 en ligne","Atmosphérique MPI","Chaîne"],
["^(CHZ|DKL|DKR)",999,3,"3 en ligne","Turbo TSI DI","Chaîne"],
["^(CZC|CZD|DAC|DPC|DPB|DUV|DUA)",1498,4,"4 en ligne","Turbo TSI ACT (EA211 evo)","Chaîne"],
["^(DKZ|CZB)",1197,4,"4 en ligne","Turbo TSI DI","Chaîne"],
["^(CZP|DNN|DKT|DNF|CJX|CYR|CVK|DKN|DKX|DLZ)",1984,4,"4 en ligne","Turbo TSI EA888","Chaîne"],
["^(DNW|DNE|DNH)",2480,5,"5 en ligne","Turbo TFSI DI","Chaîne"],
["^(CYY|CUNA|CRL|DDY|DDYA|DFG|DFH|DSU|DTU|DES|DEU|DETA|DDVE|DTSA|CXH|CXG|DMZ|DFC)",1968,4,"4 en ligne","Diesel TDI + SCR (EA288)","Courroie"],
["^(DGE|DGEB)",1395,4,"4 en ligne","TSI + électrique (PHEV)","Chaîne"],
["^DKUA",2995,6,"V6","Turbo TFSI + électrique","Chaîne"],
["^B38",1499,3,"3 en ligne","Turbo Valvetronic DI","Chaîne"],
["^B37",1496,3,"3 en ligne","Diesel common rail","Chaîne"],
["^B48",1998,4,"4 en ligne","Turbo Valvetronic DI","Chaîne"],
["^B46",1998,4,"4 en ligne","Turbo Valvetronic DI","Chaîne"],
["^B47",1995,4,"4 en ligne","Diesel common rail","Chaîne (côté boîte)"],
["^B57",2993,6,"6 en ligne","Diesel common rail biturbo","Chaîne"],
["^B58",2998,6,"6 en ligne","Turbo TwinPower DI","Chaîne"],
["^S58",2993,6,"6 en ligne","Biturbo M Performance","Chaîne"],
["^S55",2979,6,"6 en ligne","Biturbo M","Chaîne"],
["^N63",4395,8,"V8","Biturbo injection directe","Chaîne"],
["^S63",4395,8,"V8","Biturbo M","Chaîne"],
["^N20",1997,4,"4 en ligne","Turbo injection directe","Chaîne"],
["^M282",1332,4,"4 en ligne","Turbo injection directe","Chaîne"],
["^M260",1991,4,"4 en ligne","Turbo DI","Chaîne"],
["^M264",1991,4,"4 en ligne","Turbo DI + EQ Boost","Chaîne"],
["^M254",1999,4,"4 en ligne","Turbo + ISG 48 V","Chaîne"],
["^M256",2999,6,"6 en ligne","Turbo + EQ Boost 48 V","Chaîne"],
["^M139",1991,4,"4 en ligne","Turbo AMG haute pression","Chaîne"],
["^M177",3982,8,"V8","Biturbo AMG","Chaîne"],
["^M176",3982,8,"V8","Biturbo","Chaîne"],
["^M276",2996,6,"V6","Biturbo","Chaîne"],
["^OM608",1461,4,"4 en ligne","Diesel dCi common rail","Courroie"],
["^OM607",1461,4,"4 en ligne","Diesel dCi common rail","Courroie"],
["^OM622",1598,4,"4 en ligne","Diesel common rail","Courroie"],
["^OM626",1598,4,"4 en ligne","Diesel common rail","Courroie"],
["^OM651",2143,4,"4 en ligne","Diesel common rail","Chaîne"],
["^OM654",1950,4,"4 en ligne","Diesel common rail + SCR","Chaîne"],
["^OM656",2925,6,"6 en ligne","Diesel common rail + SCR","Chaîne"],
["^M15A",1490,3,"3 en ligne Dynamic Force","Atkinson hybride / VVT-i","Chaîne"],
["^M20A",1987,4,"4 en ligne Dynamic Force","Atkinson hybride","Chaîne"],
["^A25A",2487,4,"4 en ligne Dynamic Force","Hybride / PHEV","Chaîne"],
["^2ZR",1798,4,"4 en ligne Atkinson","Hybride HSD","Chaîne"],
["^8NR",1197,4,"4 en ligne","Turbo D-4T","Chaîne"],
["^1ND",1398,4,"4 en ligne","Diesel D-4D","Chaîne"],
["^1GD",2755,4,"4 en ligne","Diesel D-4D + SCR","Chaîne"],
["^2GD",2393,4,"4 en ligne","Diesel D-4D + SCR","Chaîne"],
["^G16E",1618,3,"3 en ligne","Turbo GR haute pression","Chaîne"],
["^2GR",3456,6,"V6","Atkinson hybride","Chaîne"],
["^T24A",2393,4,"4 en ligne","Turbo hybride MAX","Chaîne"],
["^G3LD",998,3,"3 en ligne","Atmosphérique MPi","Chaîne"],
["^G3LC",998,3,"3 en ligne","Turbo T-GDi","Chaîne"],
["^G4LF",1197,4,"4 en ligne","MPi / T-GDi","Chaîne"],
["^G4LC",1368,4,"4 en ligne","Atmosphérique MPi","Chaîne"],
["^G4LD",1353,4,"4 en ligne","Turbo T-GDi","Chaîne"],
["^G4FJ",1591,4,"4 en ligne","Turbo T-GDi","Chaîne"],
["^G4FT",1598,4,"4 en ligne Smartstream","Turbo T-GDi CVVD","Chaîne"],
["^G4LE",1580,4,"4 en ligne Atkinson","GDi hybride / PHEV","Chaîne"],
["^G4KH",1998,4,"4 en ligne","Turbo T-GDi Performance","Chaîne"],
["^G6DP",3342,6,"V6","Biturbo T-GDi","Chaîne"],
["^D4FB",1582,4,"4 en ligne","Diesel CRDi VGT","Chaîne"],
["^D4FE",1598,4,"4 en ligne Smartstream","Diesel CRDi + SCR","Chaîne"],
["^D4HB",2199,4,"4 en ligne","Diesel CRDi + SCR","Chaîne"],
["^B3CA",999,3,"3 en ligne","Turbo EcoBoost DI","Courroie humide"],
["^B7JA",999,3,"3 en ligne","Turbo EcoBoost + MHEV 48 V","Courroie humide"],
["^B3CB",1499,3,"3 en ligne Dragon","Turbo EcoBoost","Courroie humide"],
["^B7DA",1499,4,"4 en ligne","Diesel EcoBlue + SCR","Courroie humide"],
["^XVJ",1499,4,"4 en ligne","Diesel TDCi","Courroie humide"],
["^(YLC|BKF)",1995,4,"4 en ligne","Diesel EcoBlue + SCR","Courroie humide"],
["^YVC",2261,4,"4 en ligne","Turbo EcoBoost performance","Chaîne"],
["^BGCA",2488,4,"4 en ligne Atkinson","Hybride / PHEV","Chaîne"],
["^LEB",1498,4,"4 en ligne Atkinson","Hybride i-MMD / e:HEV","Chaîne"],
["^LFA",1993,4,"4 en ligne Atkinson","Hybride e:HEV DI","Chaîne"],
["^L15C",1498,4,"4 en ligne","Turbo VTEC","Chaîne"],
["^K20C",1996,4,"4 en ligne","Turbo VTEC Type R","Chaîne"],
["^N16",1597,4,"4 en ligne","Turbo VTEC","Chaîne"],
["^PE-VPS",1998,4,"4 en ligne Skyactiv-G","Atmosphérique haute compression","Chaîne"],
["^PY-VPS",2488,4,"4 en ligne Skyactiv-G","Atmosphérique / PHEV","Chaîne"],
["^SH-VPTS",2191,4,"4 en ligne Skyactiv-D","Diesel biturbo","Chaîne"],
["^SPCCI",1998,4,"4 en ligne Skyactiv-X","Allumage par compression","Chaîne"],
["^T3-VPT",3283,6,"6 en ligne","Diesel MHEV 48 V","Chaîne"],
["^K14",1373,4,"4 en ligne","Turbo Boosterjet","Chaîne"],
["^K15",1462,4,"4 en ligne","Atmo / Strong Hybrid","Chaîne"],
["^Z12E",1197,3,"3 en ligne","Mild Hybrid 12 V","Chaîne"],
["^FB",1995,4,"Boxer 4 à plat","Atmo / e-Boxer","Chaîne"],
["^FA",1998,4,"Boxer 4 à plat","Turbo injection directe","Chaîne"],
["^4B12",2360,4,"4 en ligne Atkinson","PHEV Twin Motor","Chaîne"],
["^4B40",1499,4,"4 en ligne MIVEC","Turbo essence","Chaîne"],
["^4N14",2268,4,"4 en ligne DI-D","Diesel common rail","Chaîne"],
["^(4A9|4B11)",1590,4,"4 en ligne MIVEC","Atmosphérique","Chaîne"],
["^B4204",1969,4,"4 en ligne","Drive-E turbo","Courroie"],
["^B3154",1477,3,"3 en ligne","Drive-E turbo","Courroie"],
["^D4204",1969,4,"4 en ligne","Drive-E diesel","Courroie"],
["^PT204",1997,4,"4 en ligne Ingenium","Turbo essence","Chaîne"],
["^PT15",1498,3,"3 en ligne Ingenium","Turbo essence","Chaîne"],
["^204DT",1999,4,"4 en ligne Ingenium","Diesel turbo","Chaîne"],
["^AJ200D",2996,6,"6 en ligne Ingenium","Diesel MHEV 48 V","Chaîne"],
["^AJ300",2996,6,"6 en ligne Ingenium","Essence MHEV 48 V","Chaîne"],
["^AJ133",5000,8,"V8","Compresseur","Chaîne"],
["^9A2",2981,6,"Flat-6","Biturbo injection directe","Chaîne"],
["^9A1",3995,6,"Flat-6","Atmosphérique injection directe","Chaîne"],
["^CWV",2995,6,"V6","Turbo / E-Hybrid","Chaîne"],
["^CSZ",2894,6,"V6","Biturbo","Chaîne"],
["^EA825",3996,8,"V8","Biturbo","Chaîne"],
["^W12",5950,12,"W12","Biturbo","Chaîne"],
["^GME",1995,4,"4 en ligne MultiAir","Turbo essence","Chaîne"],
["^690T",2891,6,"V6 90°","Biturbo injection directe","Chaîne"],
["^552",1598,4,"4 en ligne","Diesel MultiJet II","Courroie"],
["^F1AGL",2179,4,"4 en ligne","Diesel MultiJet III + SCR","Courroie"],
["^GSE",999,3,"3 en ligne FireFly","Turbo / MHEV 12 V","Chaîne"],
["^312A1",1368,4,"4 en ligne T-Jet","Turbo MultiAir","Courroie"],
["^(169A4|843A1)",1242,4,"4 en ligne Fire","Atmosphérique MPI","Courroie"],
["^312A2",875,2,"2 en ligne TwinAir","Turbo MultiAir","Chaîne"],
["^M156",2979,6,"V6 Nettuno","Biturbo préchambre","Chaîne"],
["^F160",2979,6,"V6","Biturbo","Chaîne"],
["^VM",2987,6,"V6","Diesel common rail","Chaîne"],
["^F154",3902,8,"V8","Biturbo","Chaîne"],
["^F163",2992,6,"V6","Biturbo + hybride","Chaîne"],
["^F140",6496,12,"V12","Atmosphérique / hybride","Chaîne"],
["^L539",6498,12,"V12","Atmosphérique","Chaîne"],
["^CEH",3996,8,"V8","Biturbo","Chaîne"],
["^AE31",5204,12,"V12","Biturbo","Chaîne"],
["^M840",3994,8,"V8","Biturbo","Chaîne"],
["^M630",2993,6,"V6","Biturbo + hybride","Chaîne"],
["^N74",6749,12,"V12","Biturbo","Chaîne"],
["^D20DT",1998,4,"4 en ligne","Diesel common rail","Chaîne"],
["^G15T",1497,4,"4 en ligne","Turbo essence","Chaîne"],
["^RZ4E",1898,4,"4 en ligne","Diesel common rail","Chaîne"],
["^F1C",2998,4,"4 en ligne","Diesel common rail","Courroie"],
["^SQR",1598,4,"4 en ligne","Turbo TGDi","Chaîne"],
["^JLH",1477,3,"3 en ligne","Turbo / PHEV","Chaîne"],
["^15E4E",1490,4,"4 en ligne","Turbo T-GDi / PHEV","Chaîne"],
["^MG3-HEV",1498,4,"4 en ligne Atkinson","Hybrid+ 3 rapports","Chaîne"],
["^BYD-DMI",1498,4,"4 en ligne Xiaoyun","DM-i série/parallèle","Chaîne"],
["^BYD-DMO",1498,4,"4 en ligne","DM-o hybride AWD","Chaîne"],
["^RE-ROT",830,1,"Rotatif Wankel","Générateur range extender","—"],
["^DCI",479,2,"2 en ligne","Diesel common rail","Courroie"],
["^B16D",1598,4,"4 en ligne","Diesel common rail","Chaîne"],
["^LE2",1399,4,"4 en ligne","Turbo essence","Chaîne"]];

/* [regex, architecture moteur électrique, volts, plateforme] */
var eva = [
["^(APP|MEB)","Synchrone aimants permanents",400,"MEB / MEB+"],
["^PPE","Synchrone aimants permanents",800,"PPE"],
["^EM(17|21|23)","Synchrone aimants permanents",800,"E-GMP 800 V"],
["^EM16","Synchrone aimants permanents",400,"E-GMP 400 V"],
["^(5AM|6AK|EV-R|EV-TWI|EV-LF|EV-A39|EV-AMP)","Synchrone rotor bobiné",400,"AmpR"],
["^GEN5","Synchrone rotor bobiné Gen5",400,"BMW Gen5"],
["^NK","Synchrone rotor bobiné Gen6",800,"Neue Klasse"],
["^IB1","Synchrone hybride eDrive",400,"BMW i"],
["^J1","Synchrone aimants permanents",800,"J1"],
["^(3D|TS|TX|CT)","Synchrone + asynchrone",400,"Tesla"],
["^(EVA|MMA|EAS)","Synchrone aimants permanents",800,"Mercedes EVA / MMA"],
["^EQS-SUV","Synchrone aimants permanents",400,"EVA2"],
["^BYD","Synchrone · Blade LFP",400,"e-Platform 3.0"],
["^1YM","Synchrone aimants permanents",400,"e-TNGA"],
["^EM57","Synchrone aimants permanents",400,"Nissan EV"],
["^(ZKX|EM0|STLA|EV-CMP)","Synchrone aimants permanents",400,"Stellantis e-CMP"],
["^SEA","Synchrone aimants permanents",400,"SEA / SEA-E"],
["^EV-","Synchrone aimants permanents",400,"Plateforme EV"]];

var tq = {
"eb2|82":118,"eb2|83":118,"eb2|110":205,"eb2|130":230,"eb2adts|100":205,"eb2dts|130":230,
"eb2ltedh|100":205,"eb2ltedh|136":230,"eb2lted|100":205,"eb2lted|110":205,
"dv5|100":250,"dv5|110":250,"dv5|130":300,"dv6|75":230,"dv6|100":254,"dv6|120":300,
"dw10|130":300,"dw10|150":370,"dw10|180":400,"dw12|120":300,"dw12|140":340,"dw12|165":380,
"ep6|180":250,"ep6|225":300,"ep6|205":275,"h4bt|90":135,"h4dt|90":160,"h4dt|100":170,
"h5ft|120":205,"h5ht|115":220,"h5ht|130":240,"h5ht|140":240,"h5ht|150":250,"h5ht|160":270,
"k9k|85":220,"k9k|90":220,"k9k|110":240,"k9k|115":260,"m9r|130":320,"m9r|150":340,"m9r|170":380,
"m9t|130":330,"m9t|150":360,"m9t|180":400,"r9m|130":320,"r9m|145":340,"hr13ddt|140":240,
"hr13ddt|158":270,"hr10ddt|114":200,"hr10ddt|117":200,"dkla|95":175,"dklb|110":200,"dkl|115":200,
"dpca|150":250,"dpca|130":220,"duv|150":250,"czpb|190":320,"dnna|245":370,"dnf|320":420,
"dsud|115":300,"dsua|150":360,"dfga|150":340,"dfha|200":400,"dtu|193":400,"ddve|344":700,
"b38|136":220,"b38|140":220,"b48|184":300,"b48|245":400,"b48|258":400,"b48|306":450,
"b58|340":500,"b58|374":500,"b58|387":500,"b47|150":320,"b47|190":400,"b47|211":400,
"b57|286":650,"b57|340":700,"s58|480":550,"s58|510":650,"m282|136":200,"m282|163":250,
"m254|170":250,"m254|204":320,"m254|258":400,"m256|381":500,"m139|421":500,"m177|585":800,
"om654|150":320,"om654|190":400,"om654|200":440,"om654|265":550,"om656|330":700,
"om651|136":300,"om651|163":360,"om651|204":500,"m15a-fxe|116":125,"m15a-fxe|130":131,
"2zr-fxe|122":142,"2zr-fxe|140":142,"a25a-fxs|218":221,"a25a-fxs|244":221,"m20a-fxs|184":190,
"m20a-fxs|197":190,"g4ft|150":250,"g4ft|180":265,"g4fj|177":265,"g4kh|280":392,
"g6dp|370":510,"d4fe|115":280,"d4fe|136":320,"b3ca|100":170,"b3ca|125":170,"b3ca|140":200,
"b7ja|125":210,"b7ja|155":240,"b7da|120":300,"ylcb|150":350,"ylcb|190":400,"bkf|130":360,
"bkf|170":405,"yvc|280":420,"leb|109":253,"leb|131":253,"lfa|184":335,"l15c|182":240,
"k20c|329":420,"pe-vps|122":213,"pe-vps|150":213,"pe-vps|165":213,"sh-vpts|150":380,
"sh-vpts|184":445,"k14|129":235,"k14|140":220,"b4204|190":300,"b4204|250":350,
"pt204|250":365,"pt204|300":400,"204dt|204":430,"aj200d|300":650,"aj300|400":550,
"gme|200":330,"gme|280":400,"690t|510":600,"552|120":320,"552|130":350,"f1agl|140":350,
"f1agl|180":400,"gse|100":190,"gse|130":230,"312a1|145":230,"312a1|165":250,"m156|630":730,
"f160|430":580,"f154|720":770,"f163|663":740,"ceh|640":850,"ae31|725":900,"n74|571":900,
"d20dt|181":400,"g15t|163":275,"rz4e|163":400,"f1c|160":380,"sqr|147":290,"sqr|185":310,
"jlh|261":425,"15e4e|162":250,"mg3-hev|194":250,"byd-dmi|218":300,"t24a|243":360};

/* ═══ CATALOGUE ═══ */
var SEG = { C:"Citadine", Y:"Micro-citadine", K:"Compacte", B:"Berline", T:"Break", S:"SUV",
U:"SUV urbain", E:"SUV compact", W:"SUV premium", M:"Monospace", L:"Ludospace", F:"Utilitaire",
G:"Grand utilitaire", V:"Van", P:"Pickup", R:"Roadster", X:"Coupé sport", Q:"Quadricycle",
Z:"Berline premium", H:"Berline électrique", J:"SUV électrique", N:"SUV coupé" };

var RAW = {
peugeot:["Peugeot","FR",`
108~108~17~21~Y~1.0 VTi#68,72#1KR;1.2 PureTech#82#EB2
208-1~208 I~17~19~C~1.2 PureTech#82,110#EB2;1.6 BlueHDi#75,100,120#DV6#D;1.6 THP GTi#208#EP6
208-2~208 II~19~25~C~1.2 PureTech#75,100,130#EB2;1.5 BlueHDi#100#DV5#D;Électrique#136:50,156:51#ZKX#EV
208-2f~208 II restylée~25~27~C~1.2 Hybrid 48V#100,136#EB2LTEDH#H;Électrique#156:51,156:54#ZKX#EV
208-3~208 III~26~27~C~1.2 Hybrid 48V#100,136#EB2LTEDH#H;Électrique#156:51,210:73#STLA#EV
2008-1~2008 I~17~19~U~1.2 PureTech#82,110,130#EB2;1.5 BlueHDi#100,120#DV5#D;1.6 BlueHDi#100,120#DV6#D
2008-2~2008 II~19~27~U~1.2 PureTech#100,130#EB2;1.2 Hybrid 48V#136#EB2LTEDH#H;1.5 BlueHDi#110,130#DV5#D;Électrique#136:50,156:51,156:54#ZKX#EV
308-2~308 II~17~21~K~1.2 PureTech#110,130#EB2;1.6 PureTech GTi#250,270#EP6;1.5 BlueHDi#100,130#DV5#D;2.0 BlueHDi#150,180#DW10#D
308-3~308 III~21~27~K~1.2 PureTech#110,130#EB2;1.2 Hybrid 48V#136#EB2LTEDH#H;1.5 BlueHDi#130#DV5#D;1.6 PHEV#180,225#EP6#P;Électrique#156:54#EM0#EV
308-3sw~308 III SW~21~27~T~1.2 PureTech#110,130#EB2;1.2 Hybrid 48V#136#EB2LTEDH#H;1.5 BlueHDi#130#DV5#D;1.6 PHEV#180,225#EP6#P
408~408~22~27~N~1.2 Hybrid 48V#136#EB2LTEDH#H;1.6 PHEV#180,225#EP6#P;Électrique#210:73#STLA#EV
3008-2~3008 II~17~23~E~1.2 PureTech#130#EB2;1.6 PureTech#180#EP6;1.5 BlueHDi#130#DV5#D;2.0 BlueHDi#150,180#DW10#D;1.6 PHEV#225,300#EP6#P
3008-3~3008 III~24~27~E~1.2 Hybrid 48V#136#EB2LTEDH#H;Électrique#210:73,230:97,320:73#STLA#EV
5008-2~5008 II~17~24~S~1.2 PureTech#130#EB2;1.6 PureTech#180#EP6;1.5 BlueHDi#130#DV5#D;2.0 BlueHDi#180#DW10#D
5008-3~5008 III~24~27~S~1.2 Hybrid 48V#136#EB2LTEDH#H;Électrique#210:73,230:97,320:73#STLA#EV
508-2~508 II~18~27~B~1.6 PureTech#180,225#EP6;1.5 BlueHDi#130#DV5#D;2.0 BlueHDi#160,180#DW10#D;1.6 PHEV#225,360#EP6#P
508-2sw~508 II SW~19~27~T~1.6 PureTech#180,225#EP6;1.5 BlueHDi#130#DV5#D;2.0 BlueHDi#180#DW10#D;1.6 PHEV#225#EP6#P
rifter~Rifter~18~27~L~1.2 PureTech#110,130#EB2;1.5 BlueHDi#75,100,130#DV5#D;Électrique#136:50#ZKX#EV
traveller~Traveller~17~27~V~1.5 BlueHDi#100,120#DV5#D;2.0 BlueHDi#145,150,180#DW10#D;Électrique#136:50,136:75#ZKX#EV
partner~Partner~18~27~L~1.2 PureTech#110,130#EB2;1.5 BlueHDi#75,100,130#DV5#D;Électrique#136:50#ZKX#EV
expert~Expert III~17~27~F~1.5 BlueHDi#100,120#DV5#D;2.0 BlueHDi#145,150,180#DW10#D;Électrique#136:50,136:75#ZKX#EV
boxer~Boxer III~17~27~G~2.2 BlueHDi#120,140,165#DW12#D;Électrique#122:70,270:110#EV-BOX#EV
`],
renault:["Renault","FR",`
twingo-3~Twingo III~17~24~Y~0.9 TCe#90#H4B;1.0 SCe#65,70#H4D;Électrique#82:22#EV-TWI#EV
twingo-e~Twingo E-Tech~26~27~Y~Électrique#82:27.5,95:27.5#EV-TWI2#EV
clio-4~Clio IV~17~20~C~0.9 TCe#90#H4B;1.2 TCe#120#H5F;1.5 dCi#75,90,110#K9K#D;1.6 RS#200,220#M5M
clio-5~Clio V~19~26~C~1.0 SCe#65,75#H4D;1.0 TCe#90,100#H4D;1.0 ECO-G#100#H4D#G;1.3 TCe#130#H5H;1.5 Blue dCi#85,115#K9K#D;1.6 E-Tech#140,145#H4M#H
clio-6~Clio VI~25~27~C~1.2 TCe#115#HR12;1.6 E-Tech#145#H4M#H;1.8 E-Tech#160#HR18#H
captur-1~Captur I~17~19~U~0.9 TCe#90#H4B;1.2 TCe#120#H5F;1.5 dCi#90,110#K9K#D
captur-2~Captur II~19~27~U~1.0 TCe#90,100#H4D;1.3 TCe#130,140,155#H5H;1.5 Blue dCi#115#K9K#D;1.6 E-Tech#145#H4M#H;1.6 PHEV#160#H4M#P
megane-4~Mégane IV~17~24~K~1.2 TCe#130#H5F;1.3 TCe#115,140,160#H5H;1.5 Blue dCi#115#K9K#D;1.6 dCi#130,165#R9M#D;1.8 RS#280,300#M5P
megane-4rs~Mégane IV RS / Trophy~18~23~X~1.8 RS#280,300#M5P
megane-e~Mégane E-Tech~22~27~J~Électrique#130:40,220:60#6AK#EV
scenic-4~Scenic IV~17~22~M~1.3 TCe#115,140,160#H5H;1.5 Blue dCi#110,115#K9K#D;1.7 Blue dCi#120,150#R9M#D
scenic-e~Scenic E-Tech~24~27~J~Électrique#170:60,220:87#6AK#EV
kadjar~Kadjar~17~22~E~1.2 TCe#130#H5F;1.3 TCe#140,160#H5H;1.5 Blue dCi#115#K9K#D;1.7 Blue dCi#150#R9M#D
koleos~Koleos~17~22~W~1.7 Blue dCi#150#R9M#D;2.0 dCi#175#M9R#D
arkana~Arkana~21~27~N~1.3 TCe MHEV#140,160#H5H#H;1.6 E-Tech#145#H4M#H
austral~Austral~22~27~E~1.2 TCe MHEV#130#HR12#H;1.3 TCe MHEV#140,160#H5H#H;1.2 E-Tech#200#HR12#H
symbioz~Symbioz~24~27~E~1.3 TCe MHEV#140#H5H#H;1.6 E-Tech#145#H4M#H
rafale~Rafale~24~27~N~1.2 E-Tech#200#HR12#H;1.2 E-Tech 4Control#300#HR12#P
espace-5~Espace V~17~23~M~1.8 TCe#225#M5P;2.0 dCi#160,200#M9R#D
espace-6~Espace VI~23~27~S~1.2 E-Tech#200#HR12#H
talisman~Talisman~17~22~B~1.6 TCe#150,200#M5M;1.6 dCi#130,160#R9M#D;2.0 dCi#175#M9R#D
r4~Renault 4 E-Tech~25~27~J~Électrique#122:52,150:52#EV-R4#EV
r5~Renault 5 E-Tech~24~27~J~Électrique#95:40,122:52,150:52#EV-R5#EV
zoe~Zoe~17~24~C~Électrique#92:41,108:41,135:52#5AM#EV
kangoo-2~Kangoo II~17~21~L~1.2 TCe#115#H5F;1.5 dCi#75,90,110#K9K#D;Électrique#60:33#EV-KAN#EV
kangoo-3~Kangoo III~21~27~L~1.3 TCe#130#H5H;1.5 Blue dCi#75,95,115#K9K#D;Électrique#122:45#EV-KAN#EV
trafic~Trafic III~17~27~F~1.6 dCi#95,120,125,145#R9M#D;2.0 dCi#110,150,170#M9R#D;Électrique#122:52#EV-TRA#EV
master~Master III~17~27~G~2.3 dCi#130,150,165,180#M9T#D;Électrique#76:52,143:87#EV-MAS#EV
estafette~Estafette~26~27~G~Électrique#122:45,143:60#EV-EST#EV
`],
citroen:["Citroën","FR",`
c1~C1~17~21~Y~1.0 VTi#68,72#1KR;1.2 PureTech#82#EB2
c3-3~C3 III~17~24~C~1.2 PureTech#68,83,110#EB2;1.5 BlueHDi#100,120#DV5#D;1.6 BlueHDi#75,100#DV6#D
c3-4~C3 IV~24~27~C~1.2 PureTech#100#EB2LTED;1.2 Hybrid 48V#100,136#EB2LTEDH#H;Électrique#113:44#EV-C3#EV
c3air-1~C3 Aircross I~17~24~U~1.2 PureTech#82,110,130#EB2;1.5 BlueHDi#100,110,120#DV5#D
c3air-2~C3 Aircross II~24~27~U~1.2 Hybrid 48V#100,136#EB2LTEDH#H;Électrique#113:44#EV-C3#EV
c4-2~C4 II / C4 SpaceTourer~17~22~K~1.2 PureTech#110,130#EB2;1.5 BlueHDi#100,130#DV5#D;2.0 BlueHDi#150,160#DW10#D
c4-3~C4 III~20~27~K~1.2 PureTech#100,130#EB2;1.2 Hybrid 48V#136#EB2LTEDH#H;1.5 BlueHDi#130#DV5#D;Électrique#136:50,156:54#ZKX#EV
c4x~C4 X~22~27~N~1.2 PureTech#130#EB2;1.2 Hybrid 48V#136#EB2LTEDH#H;Électrique#156:54#ZKX#EV
c5air-1~C5 Aircross I~18~25~E~1.2 PureTech#130#EB2;1.6 PureTech#180#EP6;1.5 BlueHDi#130#DV5#D;2.0 BlueHDi#180#DW10#D;1.6 PHEV#225#EP6#P
c5air-2~C5 Aircross II~25~27~E~1.2 Hybrid 48V#136#EB2LTEDH#H;1.5 BlueHDi#130#DV5#D;1.6 PHEV#195#EP6#P;Électrique#210:73,230:97#STLA#EV
c5x~C5 X~21~27~T~1.2 PureTech#130#EB2;1.6 PureTech#180#EP6;1.6 PHEV#180,225#EP6#P
celysee~C-Elysée~17~20~B~1.2 PureTech#82#EB2;1.6 BlueHDi#100#DV6#D
berlingo~Berlingo III~18~27~L~1.2 PureTech#110,130#EB2;1.5 BlueHDi#75,100,130#DV5#D;Électrique#136:50#ZKX#EV
spacetourer~SpaceTourer~17~27~V~1.5 BlueHDi#100,120#DV5#D;2.0 BlueHDi#145,150,180#DW10#D;Électrique#136:50,136:75#ZKX#EV
jumpy~Jumpy III~17~27~F~1.5 BlueHDi#100,120#DV5#D;2.0 BlueHDi#145,150,180#DW10#D;Électrique#136:50,136:75#ZKX#EV
jumper~Jumper III~17~27~G~2.2 BlueHDi#120,140,165#DW12#D;Électrique#122:70,270:110#EV-BOX#EV
ami~Ami / Ami Buggy~20~27~Q~Électrique#8:5.5#AMI#EV
`],
ds:["DS Automobiles","FR",`
ds3~DS 3~17~19~C~1.2 PureTech#82,110,130#EB2;1.6 BlueHDi#100,120#DV6#D;1.6 THP Performance#208#EP6
ds3cb~DS 3 Crossback~18~26~U~1.2 PureTech#100,130,155#EB2;1.5 BlueHDi#110#DV5#D;Électrique#136:50#ZKX#EV
ds4-2~DS 4 II~21~27~K~1.2 PureTech#130#EB2;1.6 PureTech#180,225#EP6;1.5 BlueHDi#130#DV5#D;1.6 PHEV#225#EP6#P
ds5~DS 5~17~18~B~1.6 THP#165,200#EP6;2.0 BlueHDi#150,180#DW10#D;2.0 Hybrid4#200#DW10#H
ds7~DS 7 Crossback~17~27~W~1.2 PureTech#130#EB2;1.6 PureTech#180,225#EP6;1.5 BlueHDi#130#DV5#D;2.0 BlueHDi#180#DW10#D;E-Tense#225,300,360#EP6#P
ds9~DS 9~21~27~Z~1.6 PureTech#225#EP6;E-Tense#250,360#EP6#P
dsn4~DS N°4~26~27~K~1.2 Hybrid 48V#136#EB2LTEDH#H;Électrique#210:73,230:97#STLA#EV
dsn8~DS N°8~25~27~H~Électrique#230:74,350:97,375:97#STLA#EV
`],
dacia:["Dacia","RO",`
sandero-2~Sandero II~17~20~C~0.9 TCe#90#H4B;1.0 SCe#75#H4D;1.5 dCi#75,90#K9K#D
sandero-3~Sandero III~21~27~C~1.0 SCe#65#H4D;1.0 TCe#90,110#H4D;1.0 ECO-G#100#H4D#G
sandero-4~Sandero IV~26~27~C~1.0 TCe#100#H4D;1.2 TCe MHEV#120#HR12#H;1.6 Hybrid#140#H4M#H
logan-3~Logan III~21~27~B~1.0 SCe#65#H4D;1.0 TCe#90,110#H4D;1.0 ECO-G#100#H4D#G
duster-2~Duster II~18~24~E~1.0 TCe#90,100#H4D;1.3 TCe#130,150#H5H;1.5 Blue dCi#95,115#K9K#D
duster-3~Duster III~24~27~E~1.0 ECO-G#100#H4D#G;1.2 TCe MHEV#130#HR12#H;1.6 Hybrid#140#H4M#H
lodgy~Lodgy~17~22~M~1.3 TCe#130#H5H;1.5 Blue dCi#95,110,115#K9K#D
dokker~Dokker~17~21~L~1.2 TCe#115#H5F;1.5 dCi#75,90,110#K9K#D
jogger~Jogger~22~27~M~1.0 TCe#110#H4D;1.0 ECO-G#100#H4D#G;1.6 Hybrid#140#H4M#H
spring~Spring~21~27~Y~Électrique#45:26.8,65:26.8,70:26.8#EV-SPR#EV
bigster~Bigster~25~27~S~1.0 ECO-G#100#H4D#G;1.2 TCe MHEV#140#HR12#H;1.6 Hybrid#155#H4M#H;1.2 TCe 4x4#130#HR12
`],
alpine:["Alpine","FR",`
a110~A110~17~27~X~1.8 TCe#252,292,300,350#M5P
a110gt~A110 GT / R~22~27~X~1.8 TCe#300,350#M5P
a290~A290~24~27~C~Électrique#180:52,220:52#EV-R5#EV
a390~A390~25~27~N~Électrique#400:89,470:89,540:89#EV-A39#EV
`],
volkswagen:["Volkswagen","DE",`
up~up! / e-up!~17~23~Y~1.0 MPI#60,75#CHY;1.0 TSI GTI#115#DKL;Électrique#82:36.8#EV-UP#EV
polo~Polo VI~17~27~C~1.0 MPI#65,80#CHY;1.0 TSI#95,110,115#DKL;1.5 TSI#150#DPCA;2.0 TSI GTI#200,207#CZP
golf-7~Golf VII~17~20~K~1.0 TSI#85,110#CHZ;1.4 TSI#125,150#CZC;1.5 TSI#130,150#DPCA;1.6 TDI#115#DDYA#D;2.0 TDI#150,184#CRL#D;2.0 TSI GTI#230,245#CZP;2.0 TSI R#300,310#CJX;1.4 GTE#204#DGE#P;Électrique#136:35.8#EV-GLF#EV
golf-8~Golf VIII~19~27~K~1.0 TSI#110#DKL;1.0 eTSI#110#DKL#H;1.5 TSI#130,150#DPCA;1.5 eTSI#130,150#DPCA#H;2.0 TDI#115,150,200#DSU#D;2.0 TSI GTI#245,265,300#DNNA;2.0 TSI R#320,333#DNF;1.4 eHybrid#204,245#DGEA#P;1.5 eHybrid#272#DUV#P
golf-8sw~Golf VIII Variant~20~27~T~1.0 eTSI#110#DKL#H;1.5 eTSI#130,150#DPCA#H;2.0 TDI#115,150#DSU#D;2.0 TSI R#320#DNF
tcross~T-Cross~19~27~U~1.0 TSI#95,110,115#DKL;1.5 TSI#150#DPCA
troc~T-Roc~17~27~E~1.0 TSI#110,115#DKL;1.5 TSI#150#DPCA;2.0 TSI#190,300#CZP;2.0 TDI#115,150#DSU#D
troc-cab~T-Roc Cabriolet~20~24~R~1.0 TSI#115#DKL;1.5 TSI#150#DPCA
tiguan-2~Tiguan II~17~24~E~1.4 TSI#125,150#CZC;1.5 TSI#130,150#DPCA;2.0 TSI#190,230,245#CZP;2.0 TDI#115,150,190,200,240#DFG#D;1.4 eHybrid#245#DGEA#P
tiguan-3~Tiguan III~24~27~E~1.5 eTSI#130,150#DUV#H;2.0 TDI#150,193#DTU#D;2.0 TSI#204,265#DTU;1.5 eHybrid#204,272#DUV#P
tayron~Tayron~25~27~S~1.5 eTSI#150#DUV#H;2.0 TDI#150,193#DTU#D;2.0 TSI#204,265#DTU;1.5 eHybrid#204,272#DUV#P
touareg~Touareg III~18~27~W~3.0 TSI#340#DKUA;3.0 TDI#231,286#DDVE#D;4.0 TDI V8#421#DDVE#D;3.0 eHybrid#381,462#DKUA#P
passat-b8~Passat B8~17~23~B~1.4 TSI#125,150#CZC;1.5 TSI#150#DPCA;2.0 TSI#190,272#CZP;2.0 TDI#120,150,190,240#DFG#D;1.4 GTE#218#DGEA#P
passat-b9~Passat B9 Variant~24~27~T~1.5 eTSI#150#DUV#H;2.0 TDI#150,193#DTU#D;2.0 TSI#204,265#DTU;1.5 eHybrid#204,272#DUV#P
arteon~Arteon / Shooting Brake~17~24~N~2.0 TSI#190,280,320#CZP;2.0 TDI#150,200#DFG#D;2.0 eHybrid#218,272#DGEA#P
touran~Touran~17~22~M~1.0 TSI#115#DKL;1.5 TSI#150#DPCA;2.0 TDI#115,150#DFG#D
sharan~Sharan~17~22~V~1.4 TSI#150#CZC;2.0 TDI#150,184#DFG#D
id3~ID.3~20~27~J~Électrique#150:58,170:58,204:77,326:79#APP310#EV
id4~ID.4~21~27~J~Électrique#148:52,174:77,204:77,286:77,340:79#APP310#EV
id5~ID.5~22~27~J~Électrique#174:77,204:77,299:77#APP310#EV
id7~ID.7 / Tourer~23~27~H~Électrique#286:77,286:86,340:86#APP550#EV
idbuzz~ID. Buzz~22~27~V~Électrique#204:77,204:86,340:86#APP310#EV
id2~ID.2all / ID. EVERY1~26~27~C~Électrique#95:38,116:45,226:56#MEB#EV
caddy~Caddy V~20~27~L~1.5 TSI#114#DPB;2.0 TDI#75,102,122#DTSA#D;1.5 eHybrid#150#DUV#P
multivan~Multivan T7~21~27~V~1.4 eHybrid#218#DGEA#P;2.0 TSI#204#DTU;2.0 TDI#150#DTU#D
transporter~Transporter T6 / T6.1~17~24~F~2.0 TDI#90,110,150,199,204#CXH#D
transporter7~Transporter T7~24~27~F~2.0 TDI#110,150,170#DTU#D;Électrique#136:64,286:77#EV-TRA#EV
crafter~Crafter~17~27~G~2.0 TDI#102,140,177#DMZ#D;Électrique#136:35#EV-CRA#EV
`],
audi:["Audi","DE",`
a1~A1 GB~18~27~C~1.0 TFSI#95,110#DKL;1.5 TFSI#150#DPCA;2.0 TFSI#200,207#CZP
a3~A3 8Y~20~27~K~1.0 TFSI#110#DKL;1.5 TFSI#150#DPCA;2.0 TDI#116,150#DSU#D;2.0 TFSI S3#310,333#DNF;2.5 TFSI RS3#400#DNW;1.4 TFSI e#204,245#DGEA#P
a3-8v~A3 8V~17~20~K~1.0 TFSI#115#DKL;1.4 TFSI#150#CZC;1.5 TFSI#150#DPCA;2.0 TDI#150#DFG#D;2.0 TFSI S3#310#CJX;2.5 TFSI RS3#400#DNW;1.4 e-tron#204#DGEA#P
a4~A4 B9~17~24~B~1.4 TFSI#150#CZC;2.0 TFSI#150,190,245,265#CVK;2.0 TDI#122,136,150,163,190,204#DEU#D;3.0 TDI#286#DDVE#D
a5~A5 B10~24~27~B~2.0 TFSI#150,204,272#DKN;2.0 TDI#204#DETA#D;3.0 TFSI S5#367#DKUA
a5-b9~A5 B9 Coupé / Sportback~17~24~X~2.0 TFSI#190,245,265#CVK;2.0 TDI#190,204#DEU#D;3.0 TFSI S5#354#CWV;2.9 TFSI RS5#450#CSZ
a6~A6 C8~18~27~Z~2.0 TFSI#204,265#DNN;2.0 TDI#204#DETA#D;3.0 TDI#231,286,344#DDVE#D;2.0 TFSI e#299,367#CYR#P;3.0 TFSI e#462#DKUA#P
a6e~A6 e-tron~24~27~H~Électrique#245:83,300:83,380:83,503:83,551:100#PPE#EV
a7~A7 C8~18~27~N~2.0 TFSI#245,265#DNN;3.0 TDI#231,286#DDVE#D;3.0 TFSI#340#DKUA;2.0 TFSI e#367#CYR#P
a8~A8 D5~17~27~Z~3.0 TFSI#340#DKUA;4.0 TFSI S8#571#CWV;3.0 TDI#286#DDVE#D;3.0 TFSI e#462#DKUA#P
q2~Q2~17~27~U~1.0 TFSI#110#DKL;1.5 TFSI#150#DPCA;2.0 TDI#116,150#DSU#D;2.0 TFSI SQ2#300#DNF
q3~Q3 F3~18~27~E~1.5 TFSI#150#DPCA;2.0 TFSI#190,230,245#DKT;2.0 TDI#150,200#DFG#D;2.5 TFSI RS Q3#400#DNW;1.4 TFSI e#245#DGEA#P
q4~Q4 e-tron~21~27~J~Électrique#170:52,204:77,286:77,299:77,340:79#APP310#EV
q5~Q5 FY / GU~17~27~W~2.0 TFSI#204,245,265#DKT;2.0 TDI#163,190,204#DEU#D;3.0 TFSI SQ5#354,367#CWV;2.0 TFSI e#299,367#CYR#P
q6~Q6 e-tron~24~27~J~Électrique#292:83,292:94.9,388:94.9,517:94.9#PPE#EV
q7~Q7 4M~17~27~W~3.0 TFSI#340#DKUA;3.0 TDI#231,286#DDVE#D;4.0 TDI SQ7#435#DDVE#D;3.0 TFSI e#381,462,490#DKUA#P
q8~Q8 4M~18~27~N~3.0 TFSI#340#DKUA;3.0 TDI#286#DDVE#D;4.0 TFSI SQ8#507#CWV;4.0 TFSI RS Q8#600,640#CWV
q8e~Q8 e-tron~19~27~J~Électrique#340:71,408:95,503:114#EAS#EV
etrongt~e-tron GT / RS~21~27~H~Électrique#476:93,530:93,598:93,646:93,925:105#J1#EV
tt~TT / TTS~17~23~X~2.0 TFSI#197,245,306#CZP;2.5 TFSI TT RS#400#DNW
`],
skoda:["Škoda","CZ",`
citigo~Citigo / Citigo-e~17~21~Y~1.0 MPI#60,75#CHY;Électrique#83:36.8#EV-CIT#EV
fabia-3~Fabia III~17~21~C~1.0 MPI#60,75#CHY;1.0 TSI#95,110#CHZ;1.4 TDI#90#CYY#D
fabia-4~Fabia IV~21~27~C~1.0 MPI#80#CHY;1.0 TSI#95,110,115#DKL;1.5 TSI#150#DPCA
scala~Scala~19~27~K~1.0 TSI#95,110,115#DKL;1.5 TSI#150#DPCA
rapid~Rapid / Spaceback~17~19~K~1.0 TSI#95,110#CHZ;1.4 TDI#90#CYY#D
octavia-3~Octavia III~17~20~K~1.0 TSI#115#CHZ;1.4 TSI#150#CZC;1.5 TSI#150#DPCA;2.0 TDI#115,150,184#DFG#D;2.0 TSI RS#230,245#CZP
octavia-4~Octavia IV~20~27~K~1.0 TSI#110#DKL;1.0 e-TEC#110#DKL#H;1.5 TSI#150#DPCA;1.5 e-TEC#150#DPCA#H;2.0 TDI#115,150,200#DSU#D;2.0 TSI RS#245,265#DNNA;1.4 iV#204,245#DGEA#P
superb-3~Superb III~17~24~B~1.4 TSI#150#CZC;1.5 TSI#150#DPCA;2.0 TSI#190,272,280#CZP;2.0 TDI#120,150,190,200#DFG#D;1.4 iV#218#DGEA#P
superb-4~Superb IV~24~27~B~1.5 TSI MHEV#150#DUV#H;2.0 TDI#150,193#DTU#D;2.0 TSI#204,265#DTU;1.5 TSI iV#204,272#DUV#P
kamiq~Kamiq~19~27~U~1.0 TSI#95,110,115#DKL;1.5 TSI#150#DPCA
karoq~Karoq~17~27~E~1.0 TSI#110,115#DKL;1.5 TSI#150#DPCA;2.0 TDI#115,150#DSU#D
kodiaq-1~Kodiaq I~17~24~S~1.4 TSI#125,150#CZC;1.5 TSI#150#DPCA;2.0 TSI#180,190,245#CZP;2.0 TDI#150,190,200,240#DFG#D
kodiaq-2~Kodiaq II~24~27~S~1.5 TSI MHEV#150#DUV#H;2.0 TDI#150,193#DTU#D;2.0 TSI#204,265#DTU;1.5 TSI iV#204,272#DUV#P
enyaq~Enyaq / Coupé~21~27~J~Électrique#180:58,204:77,286:77,299:77,340:79#APP310#EV
elroq~Elroq~24~27~J~Électrique#170:52,204:59,286:77#APP310#EV
epiq~Epiq~26~27~J~Électrique#116:38,150:52,204:52#MEB#EV
vision~Vision 7S / Grand~27~27~J~Électrique#204:89,286:89#MEB#EV
`],
seat:["SEAT","ES",`
mii~Mii / Mii electric~17~21~Y~1.0 MPI#60,75#CHY;Électrique#83:36.8#EV-MII#EV
ibiza-5~Ibiza V~17~27~C~1.0 MPI#65,80#CHY;1.0 TSI#95,110,115#DKL;1.5 TSI#150#DPCA;1.6 TDI#95,115#DDYA#D
leon-3~Leon III~17~20~K~1.0 TSI#115#CHZ;1.4 TSI#125,150#CZC;1.5 TSI#130,150#DPCA;2.0 TDI#115,150,184#DFG#D;2.0 TSI Cupra#290,300,310#CJX
leon-4~Leon IV~20~27~K~1.0 TSI#110#DKL;1.0 eTSI#110#DKL#H;1.5 TSI#130,150#DPCA;1.5 eTSI#150#DPCA#H;2.0 TDI#115,150#DSU#D;1.4 eHybrid#204,245#DGEA#P
arona~Arona~17~27~U~1.0 TSI#95,110,115#DKL;1.5 TSI#150#DPCA;1.6 TDI#95,115#DDYA#D
ateca~Ateca~17~27~E~1.0 TSI#110,115#DKL;1.5 TSI#150#DPCA;2.0 TSI#190,300#CZP;2.0 TDI#115,150,190#DSU#D
tarraco~Tarraco~18~27~S~1.5 TSI#150#DPCA;2.0 TSI#190,245#CZP;2.0 TDI#150,200#DFG#D;1.4 eHybrid#245#DGEA#P
alhambra~Alhambra~17~22~V~1.4 TSI#150#CZC;2.0 TDI#150,184#DFG#D
toledo~Toledo IV~17~19~K~1.0 TSI#95,110#CHZ;1.4 TDI#90#CYY#D
`],
cupra:["Cupra","ES",`
ateca~Cupra Ateca~18~24~E~2.0 TSI#300#CZP
leon~Cupra Leon~20~27~K~2.0 TSI#245,300,310,333#DNNA;1.4 eHybrid#245#DGEA#P;1.5 eHybrid#272#DUV#P
formentor~Formentor~20~27~N~1.5 TSI#150#DPCA;2.0 TSI#190,245,310,333#CZP;2.5 TFSI VZ5#390#DNE;2.0 TDI#150#DSU#D;1.4 e-Hybrid#204,245#DGEA#P;1.5 e-Hybrid#272#DUV#P
born~Born~21~27~J~Électrique#150:58,204:77,231:77,326:79#APP310#EV
tavascan~Tavascan~24~27~J~Électrique#286:77,340:77#APP550#EV
terramar~Terramar~24~27~E~1.5 eTSI#150#DUV#H;2.0 TSI#204,272#DTU;1.5 e-Hybrid#272#DUV#P
raval~Raval~26~27~C~Électrique#218:52,226:52,226:79#MEB#EV
`],
bmw:["BMW","DE",`
s1~Série 1 F40 / F70~19~27~K~1.5 118i#136,140,156#B38;2.0 120i#178#B48;2.0 M135i#306#B48;1.5 116d#116#B37#D;2.0 118d#150#B47#D;2.0 120d#190#B47#D
s2~Série 2 Gran Coupé~20~27~K~1.5 218i#136#B38;2.0 220i#178#B48;2.0 M235i#306#B48;2.0 218d#150#B47#D
s2c~Série 2 Coupé G42~21~27~X~2.0 220i#184#B48;2.0 230i#245#B48;3.0 M240i#374#B58;2.0 220d#190#B47#D
s3~Série 3 G20~18~27~B~2.0 318i#156#B48;2.0 320i#184#B48;2.0 330i#245,258#B48;3.0 M340i#374,387#B58;2.0 318d#150#B47#D;2.0 320d#190#B47#D;3.0 330d#286#B57#D;2.0 320e#204#B48#P;2.0 330e#292#B48#P
s3t~Série 3 Touring G21~19~27~T~2.0 320i#184#B48;3.0 M340i#374#B58;2.0 318d#150#B47#D;2.0 320d#190#B47#D;3.0 330d#286#B57#D;2.0 330e#292#B48#P
s4~Série 4 G22 / G26~20~27~X~2.0 420i#184#B48;2.0 430i#245#B48;3.0 M440i#374#B58;2.0 420d#190#B47#D;3.0 430d#286#B57#D
s5~Série 5 G30 / G60~17~27~Z~2.0 520i#184,208#B48;2.0 530i#252#B48;3.0 540i#340,381#B58;2.0 520d#190#B47#D;3.0 530d#265,286#B57#D;3.0 540d#340#B57#D;2.0 530e#292,299#B48#P;3.0 550e#489#B58#P
s7~Série 7 G70~22~27~Z~3.0 740i#381#B58;3.0 740d#300#B57#D;4.4 M760e#727#S63#P
s8~Série 8 G15~18~27~X~3.0 840i#340#B58;4.4 M850i#530#N63;4.4 M8 Comp#625#S63
x1~X1 F48 / U11~17~27~E~1.5 sDrive18i#136#B38;2.0 sDrive20i#170,178,192#B48;2.0 sDrive18d#150#B47#D;2.0 xDrive20d#190,211#B47#D;1.5 xDrive25e#220#B38#P;1.5 xDrive30e#326#B38#P
x2~X2 F39 / U10~18~27~N~1.5 sDrive18i#136#B38;2.0 sDrive20i#178,192#B48;2.0 M35i#306,317#B48;2.0 sDrive18d#150#B47#D
x3~X3 G01 / G45~17~27~W~2.0 xDrive20i#184#B48;2.0 xDrive30i#252#B48;3.0 M40i#360,398#B58;2.0 xDrive20d#190#B47#D;3.0 xDrive30d#286#B57#D;2.0 xDrive30e#292#B48#P
x4~X4 G02~18~27~N~2.0 xDrive20i#184#B48;3.0 M40i#360#B58;2.0 xDrive20d#190#B47#D;3.0 xDrive30d#286#B57#D
x5~X5 G05~18~27~W~3.0 xDrive40i#340,381#B58;3.0 xDrive30d#286,298#B57#D;3.0 xDrive40d#340#B57#D;4.4 M50i#530#N63;3.0 xDrive50e#489#B58#P
x6~X6 G06~19~27~N~3.0 xDrive40i#340,381#B58;3.0 xDrive30d#286,298#B57#D;4.4 M60i#530#S63
x7~X7 G07~19~27~W~3.0 xDrive40i#340,381#B58;3.0 xDrive40d#340,352#B57#D;4.4 M60i#530#S63
z4~Z4 G29~18~27~R~2.0 sDrive20i#197#B48;2.0 sDrive30i#258#B48;3.0 M40i#340,382#B58
i3~i3 / i3s~17~22~C~Électrique#170:33,184:42.2#IB1#EV
i4~i4~21~27~H~Électrique#286:70.2,340:83.9,544:83.9#GEN5#EV
i5~i5 / i5 Touring~23~27~H~Électrique#340:81.2,389:81.2,601:81.2#GEN5#EV
i7~i7~22~27~H~Électrique#455:101.7,544:101.7,660:101.7#GEN5#EV
ix~iX~21~27~J~Électrique#326:76.6,385:76.6,523:111.5,619:111.5,659:111.5#GEN5#EV
ix1~iX1 / iX2~22~27~J~Électrique#204:64.7,272:64.7,313:64.7#GEN5#EV
ix3~iX3 G08~20~27~J~Électrique#286:80#GEN5#EV
ix3na~iX3 Neue Klasse~26~27~J~Électrique#313:108,469:108#NK#EV
`],
mini:["MINI","GB",`
hatch~MINI 3/5 portes F56~17~24~C~1.5 One#102#B38;1.5 Cooper#136#B38;2.0 Cooper S#178,192#B48;2.0 JCW#231#B48;1.5 Cooper D#116#B37#D;2.0 Cooper SD#170#B47#D
se~MINI Cooper SE~19~24~C~Électrique#184:32.6#EV-MIN#EV
clubman~Clubman F54~17~24~T~1.5 Cooper#136#B38;2.0 Cooper S#178,192#B48;2.0 JCW#306#B48;2.0 Cooper D#150#B47#D
countryman-f60~Countryman F60~17~24~E~1.5 Cooper#136#B38;2.0 Cooper S#178,192#B48;2.0 JCW#306#B48;1.5 Cooper SE#220#B38#P
countryman~Countryman U25~24~27~E~1.5 C#170#B38#H;2.0 S ALL4#218,245#B48;2.0 JCW#300,317#B48;Électrique#204:64.7,313:64.7#EV-CM#EV
cooper-j01~Cooper E J01~24~27~C~Électrique#190:40.7,218:54.2,258:54.2#EV-CO#EV
aceman~Aceman~24~27~U~Électrique#190:42.5,218:54.2,260:54.2#SEA#EV
`],
mercedes:["Mercedes-Benz","DE",`
classea~Classe A W177~18~27~K~1.3 A180#136#M282;1.3 A200#163#M282;2.0 A250#224#M260;2.0 A35 AMG#306#M260;2.0 A45 S AMG#421#M139;1.5 A180d#116#OM608#D;2.0 A200d#150#OM654#D;2.0 A220d#190#OM654#D;1.3 A250e#218#M282#P
classeb~Classe B W247~18~27~M~1.3 B180#136#M282;1.3 B200#163#M282;2.0 B200d#150#OM654#D;2.0 B220d#190#OM654#D;1.3 B250e#218#M282#P
cla~CLA C118 / C119~19~27~N~1.3 CLA180#136#M282;1.3 CLA200#163#M282;2.0 CLA250#224#M260;2.0 CLA35 AMG#306#M260;2.0 CLA45 S AMG#421#M139;1.3 CLA250e#218#M282#P
claev~CLA électrique~25~27~H~Électrique#272:85,354:85#MMA#EV
classec~Classe C W206~21~27~B~1.5 C180#170#M254#H;1.5 C200#204#M254#H;2.0 C300#258#M254#H;2.0 C43 AMG#408#M139#H;2.0 C63 S E#680#M139#P;2.0 C220d#200#OM654#D;2.0 C300d#265#OM654#D;2.0 C300e#313#M254#P;2.0 C300de#306#OM654#P
classee~Classe E W214~23~27~Z~2.0 E200#204#M254#H;2.0 E220d#197#OM654#D;3.0 E450#381#M256#H;2.0 E300e#312#M254#P;3.0 E400e#381#M256#P;2.0 E300de#306#OM654#P
classes~Classe S W223~20~27~Z~3.0 S450#381#M256#H;3.0 S500#435#M256#H;4.0 S580#503#M176#H;3.0 S400d#330#OM656#D;3.0 S580e#510#M256#P
cle~CLE C236~23~27~X~2.0 CLE200#204#M254#H;2.0 CLE300#258#M254#H;3.0 CLE450#381#M256#H;2.0 CLE220d#197#OM654#D
gla~GLA H247~20~27~U~1.3 GLA200#163#M282;2.0 GLA250#224#M260;2.0 GLA35 AMG#306#M260;2.0 GLA200d#150#OM654#D;1.3 GLA250e#218#M282#P
glb~GLB X247~19~27~E~1.3 GLB200#163#M282;2.0 GLB250#224#M260;2.0 GLB200d#150#OM654#D;2.0 GLB220d#190#OM654#D
glc~GLC X254~22~27~W~2.0 GLC200#204#M254#H;2.0 GLC300#258#M254#H;2.0 GLC220d#197#OM654#D;2.0 GLC300d#269#OM654#D;2.0 GLC300e#313#M254#P;2.0 GLC400e#381#M254#P
glcev~GLC électrique~26~27~J~Électrique#360:94,490:94#MMA#EV
gle~GLE V167~18~27~W~3.0 GLE450#381#M256#H;3.0 GLE400d#330#OM656#D;3.0 GLE350de#333#OM654#P;4.0 GLE63 S AMG#612#M177#H
gls~GLS X167~19~27~W~3.0 GLS450#381#M256#H;3.0 GLS400d#330#OM656#D;4.0 GLS580#510#M176#H
classeg~Classe G W463~18~27~W~4.0 G500#421#M176;4.0 G63 AMG#585#M177
eqa~EQA~21~27~J~Électrique#190:66.5,228:66.5,292:66.5#EVA#EV
eqb~EQB~21~27~J~Électrique#190:66.5,228:66.5,292:66.5#EVA#EV
eqc~EQC~19~24~J~Électrique#408:80#EVA#EV
eqe~EQE / EQE SUV~22~27~H~Électrique#245:89,292:96,292:90.6,408:90.6,544:90.6,626:90.6#EVA#EV
eqs~EQS / EQS SUV~21~27~H~Électrique#333:107.8,360:107.8,453:107.8,523:107.8,544:107.8,658:118#EVA#EV
eqt~EQT~23~27~L~Électrique#122:45#EV-EQT#EV
citan~Citan~21~27~L~1.5 110 CDI#95#OM608#D;1.5 112 CDI#116#OM608#D;Électrique#122:45#EV-CIT2#EV
vito~Vito W447~17~27~F~1.6 110 CDI#102#OM622#D;2.2 114 CDI#136#OM651#D;2.2 116 CDI#163#OM651#D;2.0 119 CDI#190#OM654#D;2.0 124 CDI#239#OM654#D
classev~Classe V / EQV~17~27~V~2.2 V220d#163#OM651#D;2.0 V250d#190#OM654#D;2.0 V300d#239#OM654#D;Électrique#204:90#EV-VIT#EV
sprinter~Sprinter~18~27~G~2.0 311 CDI#114#OM654#D;2.0 314 CDI#143#OM654#D;2.0 317 CDI#170#OM654#D;2.0 319 CDI#190#OM654#D;Électrique#116:55,116:113#EV-SPR#EV
`],
smart:["smart","DE",`
fortwo~fortwo EQ~17~24~Y~Électrique#82:17.6#EV-FTW#EV
forfour~forfour EQ~17~21~Y~Électrique#82:17.6#EV-FTR#EV
s1~#1~22~27~U~Électrique#272:49,272:66,428:66#SEA#EV
s3~#3~23~27~N~Électrique#272:66,428:66#SEA#EV
s5~#5~25~27~E~Électrique#360:76,360:100,646:100#SEA#EV
`],
opel:["Opel","DE",`
adam~Adam~17~19~Y~1.2#70#B12X;1.4#87,100#B14X;1.0 Turbo#90,115#B10X
corsa-e~Corsa E~17~19~C~1.2#70#B12X;1.4#90#B14X;1.0 Turbo#90,115#B10X;1.3 CDTI#75,95#B13D#D
corsa-f~Corsa F~19~27~C~1.2#75#EB2;1.2 Turbo#100,130#EB2;1.2 Hybrid#100,136#EB2LTEDH#H;1.5 Diesel#100#DV5#D;Électrique#136:50,156:51,156:54#ZKX#EV
mokka-a~Mokka X~17~20~U~1.4 Turbo#140#B14T;1.6 CDTI#110,136#B16D#D
mokka-b~Mokka B~20~27~U~1.2 Turbo#100,130#EB2;1.5 Diesel#110#DV5#D;Électrique#136:50,156:54#ZKX#EV
astra-k~Astra K~17~21~K~1.0 Turbo#105#B10X;1.4 Turbo#125,150#B14T;1.6 CDTI#110,136#B16D#D
astra-l~Astra L~21~27~K~1.2 Turbo#110,130#EB2;1.2 Hybrid#136#EB2LTEDH#H;1.5 Diesel#130#DV5#D;1.6 PHEV#180,225#EP6#P;Électrique#156:54#EM0#EV
insignia~Insignia B~17~22~B~1.5 Turbo#140,165#B15T;2.0 Turbo#230,260#B20T;1.6 Diesel#110,136#B16D#D;2.0 Diesel#170,210#B20D#D
crossland~Crossland~17~24~U~1.2#83#EB2;1.2 Turbo#110,130#EB2;1.5 Diesel#110,120#DV5#D
grandland-1~Grandland X~17~24~E~1.2 Turbo#130#EB2;1.6 Diesel#120#DV6#D;1.5 Diesel#130#DV5#D;1.6 PHEV#225,300#EP6#P
grandland-2~Grandland II~24~27~E~1.2 Hybrid#136#EB2LTEDH#H;Électrique#210:73,230:97,320:73#STLA#EV
frontera~Frontera~24~27~E~1.2 Hybrid#100,136#EB2LTEDH#H;Électrique#113:44,156:51#EM0#EV
combo~Combo E~18~27~L~1.2 Turbo#110,130#EB2;1.5 Diesel#75,100,130#DV5#D;Électrique#136:50#ZKX#EV
zafira~Zafira Life~19~27~V~1.5 Diesel#100,120#DV5#D;2.0 Diesel#145,150,180#DW10#D;Électrique#136:50,136:75#ZKX#EV
vivaro~Vivaro C~19~27~F~1.5 Diesel#100,120#DV5#D;2.0 Diesel#145,150,180#DW10#D;Électrique#136:50,136:75#ZKX#EV
movano~Movano~17~27~G~2.3 CDTI#130,150,165,180#M9T#D;Électrique#76:52,143:87#EV-MOV#EV
`],
ford:["Ford","US",`
ka~Ka+~17~21~Y~1.2 Ti-VCT#70,85#B12X
fiesta~Fiesta VII~17~23~C~1.0 EcoBoost#100,125,140#B3CA;1.0 EcoBoost MHEV#125,155#B7JA#H;1.5 TDCi#85#XVJ#D;1.5 EcoBlue#120#B7DA#D;1.5 ST#200#B3CA
focus~Focus IV~18~27~K~1.0 EcoBoost MHEV#125,155#B7JA#H;1.5 EcoBlue#95,120#B7DA#D;2.0 EcoBlue#150#YLCB#D;2.3 EcoBoost ST#280#YVC;2.3 EcoBoost ST Track#347#YVC
puma~Puma~19~27~U~1.0 EcoBoost MHEV#125,155#B7JA#H;1.0 EcoBoost ST#200#B3CA;Électrique#168:43#EV-PUM#EV
ecosport~EcoSport~17~22~U~1.0 EcoBoost#125#B3CA;1.5 TDCi#100#XVJ#D
kuga~Kuga III~19~27~E~1.5 EcoBoost#150#B3CB;2.0 EcoBlue#150,190#YLCB#D;2.5 PHEV#225,243#BGCA#P;2.5 FHEV#190#BGCA#H
mondeo~Mondeo V~17~22~B~2.0 EcoBlue#120,150,190#YLCB#D;2.0 Hybrid#187#BGCA#H
smax~S-MAX / Galaxy~17~22~V~2.0 EcoBlue#120,150,190#YLCB#D;2.0 EcoBlue AWD#240#YLCB#D
tourneo~Tourneo Connect~18~27~L~1.5 EcoBlue#75,100,120#B7DA#D;2.0 EcoBlue#122#YLCB#D;1.5 TSI#114#DPB
custom~Transit Custom~17~27~F~2.0 EcoBlue#105,130,170,185#BKF#D
transit~Transit~17~27~G~2.0 EcoBlue#105,130,170,185#BKF#D;Électrique#184:64,269:68#EV-TRA#EV
mache~Mustang Mach-E~21~27~J~Électrique#269:70,294:91,351:91,487:91#EV-MAC#EV
explorer~Explorer EV~24~27~J~Électrique#170:52,286:77,340:79#APP310#EV
capri~Capri EV~24~27~J~Électrique#170:52,286:77,340:79#APP310#EV
ranger~Ranger~17~27~P~2.0 EcoBlue#130,170,205#BKF#D;3.0 V6 TDCi#250#BKF#D;2.3 EcoBoost PHEV#281#YVC#P
`],
toyota:["Toyota","JP",`
aygo~Aygo II~17~21~Y~1.0 VVT-i#69,72#1KR
aygox~Aygo X~22~27~Y~1.0 VVT-i#72#1KR;1.0 Hybrid#116#1KR#H
yaris-3~Yaris III~17~20~C~1.0 VVT-i#69#1KR;1.33 Dual VVT-i#99#1NR;1.5 Hybrid#100#1NZ#H;1.5 GRMN#212#2ZR
yaris-4~Yaris IV~20~27~C~1.0 VVT-i#72#1KR;1.5 VVT-i#125#M15A;1.5 Hybrid#116,130#M15A-FXE#H;1.6 GR#261,280,300#G16E
yariscross~Yaris Cross~21~27~U~1.5 VVT-i#125#M15A;1.5 Hybrid#116,130#M15A-FXE#H
corolla~Corolla XII~18~27~K~1.2 Turbo#116#8NR;1.8 Hybrid#122,140#2ZR-FXE#H;2.0 Hybrid#184,196#M20A-FXS#H
corollats~Corolla Touring Sports~18~27~T~1.2 Turbo#116#8NR;1.8 Hybrid#122,140#2ZR-FXE#H;2.0 Hybrid#184,196#M20A-FXS#H
chr-1~C-HR I~17~23~N~1.2 Turbo#116#8NR;1.8 Hybrid#122#2ZR-FXE#H;2.0 Hybrid#184#M20A-FXS#H
chr-2~C-HR II~23~27~N~1.8 Hybrid#140#2ZR-FXE#H;2.0 Hybrid#197#M20A-FXS#H;2.0 PHEV#223#M20A#P
prius~Prius IV / V~17~27~B~1.8 Hybrid#122,220#2ZR-FXE#H;2.0 PHEV#223#M20A#P
camry~Camry~18~27~B~2.5 Hybrid#218,230#A25A-FXS#H
rav4-5~RAV4 V~18~25~E~2.5 Hybrid#218,222#A25A-FXS#H;2.5 PHEV#306,309#A25A#P
rav4-6~RAV4 VI~25~27~E~2.5 Hybrid#236,240,243#A25A-FXS#H;2.5 PHEV#320,342#A25A#P
highlander~Highlander~21~27~W~2.5 Hybrid#248#A25A-FXS#H
landcruiser~Land Cruiser 250~24~27~W~2.8 D-4D#205#1GD#D;2.8 D-4D MHEV#205#1GD#H
bz4x~bZ4X~22~27~J~Électrique#204:71.4,218:71.4,313:71.4,343:71.4#1YM#EV
urbcr~Urban Cruiser~25~27~J~Électrique#144:49,174:61,184:61#1YM#EV
bzurban~bZ Urban Cruiser / C-HR+~25~27~J~Électrique#170:57,224:77,313:77#1YM#EV
proace~Proace / Proace City~17~27~F~1.5 D-4D#100,120#DV5#D;2.0 D-4D#145,150,180#DW10#D;Électrique#136:50,136:75#ZKX#EV
hilux~Hilux~17~27~P~2.4 D-4D#150#2GD#D;2.8 D-4D#177,204#1GD#D;2.8 D-4D MHEV#204#1GD#H
gr86~GR86~22~27~X~2.4 Boxer#234#FA
supra~GR Supra~19~27~X~2.0 Turbo#258#B48;3.0 Turbo#340,382#B58
`],
lexus:["Lexus","JP",`
ct~CT 200h~17~22~K~1.8 Hybrid#136#2ZR-FXE#H
is~IS 300h~17~21~B~2.5 Hybrid#223#2AR-FSE#H
ux~UX 250h / 300h / 300e~18~27~U~2.0 Hybrid#184,199#M20A-FXS#H;Électrique#204:54.3,204:72.8#EV-UX#EV
nx~NX 350h / 450h+~21~27~W~2.5 Hybrid#244#A25A-FXS#H;2.5 PHEV#309#A25A#P
es~ES 300h~18~27~Z~2.5 Hybrid#218#A25A-FXS#H
rx~RX 450h+ / 500h~22~27~W~2.5 PHEV#309#A25A#P;2.4 Turbo Hybrid#371#T24A#H
rz~RZ 300e / 450e / 550e~23~27~J~Électrique#204:71.4,313:71.4,381:71.4#1YM#EV
lbx~LBX~23~27~U~1.5 Hybrid#136#M15A-FXE#H
lm~LM 350h~23~27~V~2.5 Hybrid#250#A25A-FXS#H
`],
nissan:["Nissan","JP",`
micra-5~Micra V~17~24~C~0.9 IG-T#90#HR09;1.0 IG-T#100#HR10;1.5 dCi#90#K9K#D;1.0 N-Sport#117#HR10
micra-6~Micra VI~25~27~C~Électrique#95:40,122:52,150:52#EV-R5#EV
note~Note e-POWER~17~22~M~1.2 e-POWER#109#HR12#H
juke-2~Juke II~19~27~U~1.0 DIG-T#114,117#HR10;1.6 Hybrid#143#HR16#H
qashqai-2~Qashqai II~17~21~E~1.2 DIG-T#115#HR12;1.3 DIG-T#140,160#HR13;1.5 dCi#110#K9K#D;1.6 dCi#130#R9M#D
qashqai-3~Qashqai III~21~27~E~1.3 DIG-T MHEV#140,158#HR13#H;1.5 e-POWER#190#KR15#H
xtrail-3~X-Trail III~17~22~S~1.3 DIG-T#160#HR13;1.6 dCi#130#R9M#D;1.7 dCi#150#R9M#D
xtrail-4~X-Trail IV~22~27~S~1.5 e-POWER#204,213#KR15#H
leaf-2~Leaf II~17~26~J~Électrique#150:40,217:62#EM57#EV
leaf-3~Leaf III~25~27~J~Électrique#176:52,218:75#EV-LF3#EV
ariya~Ariya~22~27~J~Électrique#218:63,242:87,306:87,394:87#EV-ARI#EV
townstar~Townstar~21~27~L~1.3 DIG-T#130#HR13;1.5 dCi#75,95,115#K9K#D;Électrique#122:45#EV-KAN#EV
primastar~Primastar~21~27~F~2.0 dCi#110,150,170#M9R#D
interstar~Interstar~21~27~G~2.3 dCi#130,150,180#M9T#D;Électrique#76:52,143:87#EV-MAS#EV
navara~Navara NP300~17~22~P~2.3 dCi#163,190#YS23#D
gt-r~GT-R R35~17~22~X~3.8 V6 Biturbo#570,600#VR38
`],
honda:["Honda","JP",`
jazz-3~Jazz III~17~20~Y~1.3 i-VTEC#102#L13Z;1.5 Sport#130#L15B
jazz-4~Jazz IV e:HEV~20~27~Y~1.5 e:HEV#109#LEB#H
civic-10~Civic X~17~22~K~1.0 VTEC Turbo#129#P10A;1.5 VTEC Turbo#182#L15B;1.6 i-DTEC#120#N16#D;2.0 Type R#320#K20C
civic-11~Civic XI e:HEV~22~27~K~2.0 e:HEV#184#LFA#H;2.0 Type R#329#K20C
hrv-2~HR-V II~17~21~U~1.5 i-VTEC#130#L15B;1.6 i-DTEC#120#N16#D
hrv-3~HR-V III e:HEV~21~27~U~1.5 e:HEV#131#LEB#H
zrv~ZR-V e:HEV~23~27~E~2.0 e:HEV#184#LFA#H
crv-5~CR-V V~17~23~E~1.5 VTEC Turbo#173,193#L15B;2.0 Hybrid#184#LFA#H
crv-6~CR-V VI~23~27~E~2.0 e:HEV#184#LFA#H;2.0 e:PHEV#184#LFA#P
eny1~e:Ny1~24~27~J~Électrique#204:68.4#EV-ENY#EV
cr-v-h2~CR-V e:FCEV~25~27~E~Électrique#176:17.7#EV-FCEV#EV
`],
mazda:["Mazda","JP",`
m2~Mazda2~17~27~C~1.5 Skyactiv-G#75,90,115#P5-VPS;1.5 Skyactiv-D#105#S5-DPTS#D;1.5 Hybrid#116#M15A-FXE#H
m3~Mazda3 IV~19~27~K~2.0 Skyactiv-G#122,150#PE-VPS;2.0 Skyactiv-X#180,186#SPCCI;2.5 Skyactiv-G#140#PY-VPS
m6~Mazda6 III~17~24~B~2.0 Skyactiv-G#145,165#PE-VPS;2.5 Skyactiv-G#192#PY-VPS;2.2 Skyactiv-D#150,184#SH-VPTS#D
m6e~Mazda6e~25~27~H~Électrique#258:68.8,245:80#EV-MZ6#EV
cx3~CX-3~17~22~U~2.0 Skyactiv-G#121,150#PE-VPS;1.8 Skyactiv-D#115#S8-DPTS#D
cx30~CX-30~19~27~U~2.0 Skyactiv-G#122,150#PE-VPS;2.0 Skyactiv-X#186#SPCCI;2.5 Skyactiv-G#140#PY-VPS
cx5~CX-5 II~17~27~E~2.0 Skyactiv-G#165#PE-VPS;2.5 Skyactiv-G#194#PY-VPS;2.2 Skyactiv-D#150,184#SH-VPTS#D
cx60~CX-60~22~27~W~3.3 e-Skyactiv D#200,254#T3-VPT#D;2.5 e-Skyactiv PHEV#327#PY-VPS#P
cx80~CX-80~24~27~W~3.3 e-Skyactiv D#254#T3-VPT#D;2.5 e-Skyactiv PHEV#327#PY-VPS#P
mx5~MX-5 ND~17~27~R~1.5 Skyactiv-G#131#P5-VPS;2.0 Skyactiv-G#160,184#PE-VPS
mx30~MX-30~20~26~U~Électrique#143:35.5#EV-MX#EV;0.8 R-EV#170#RE-ROT#P
`],
suzuki:["Suzuki","JP",`
ignis~Ignis~17~27~Y~1.2 Dualjet#83,90#K12#H
swift-3~Swift III~17~24~C~1.0 Boosterjet#111#K10;1.2 Dualjet#83,90#K12#H;1.4 Sport#140#K14
swift-4~Swift IV~24~27~C~1.2 Mild Hybrid#82#Z12E#H
baleno~Baleno~17~22~C~1.0 Boosterjet#111#K10;1.2 Dualjet#90#K12#H
vitara~Vitara~17~27~U~1.0 Boosterjet#111#K10;1.4 Boosterjet#140#K14;1.4 Boosterjet Hybrid#129#K14#H;1.5 Dualjet Hybrid#115#K15#H;1.6 VVT#120#M16A
scross~S-Cross~17~27~E~1.0 Boosterjet#111#K10;1.4 Boosterjet#140#K14;1.4 Boosterjet Hybrid#129#K14#H;1.5 Dualjet Hybrid#115#K15#H
swace~Swace~20~27~T~1.8 Hybrid#122#2ZR-FXE#H
across~Across~20~27~E~2.5 PHEV#306#A25A#P
jimny~Jimny IV~18~27~U~1.5#102#K15;1.5 5 portes#102#K15
evitara~e Vitara~25~27~J~Électrique#144:49,174:61,184:61#EV-EVT#EV
`],
mitsubishi:["Mitsubishi","JP",`
spacestar~Space Star~17~27~Y~1.0 MIVEC#71#3A9;1.2 MIVEC#80#3A9
asx~ASX~17~27~U~1.6 MIVEC#117#4A9;2.0 MIVEC#150#4B11;1.3 Turbo#140,158#HR13
eclipse~Eclipse Cross~17~27~E~1.5 MIVEC Turbo#163#4B40;2.2 DI-D#150#4N14#D;2.4 PHEV#188#4B12#P;1.3 Turbo#140,158#HR13
outlander~Outlander III / IV~17~27~S~2.0 MIVEC#150#4B11;2.2 DI-D#150#4N14#D;2.4 PHEV#203,248,306#4B12#P
l200~L200~17~27~P~2.2 DI-D#150,180#4N14#D;2.4 DI-D#154,181#4N15#D
colt~Colt~23~27~C~1.0#65#H4D;1.0 Turbo#90#H4D;1.6 Hybrid#140#H4M#H
`],
subaru:["Subaru","JP",`
impreza~Impreza~17~27~K~1.6i#114#FB16;2.0i e-Boxer#150#FB20#H
xv~XV / Crosstrek~17~27~U~1.6i#114#FB16;2.0i e-Boxer#150#FB20#H
forester~Forester~17~27~E~2.0i e-Boxer#150#FB20#H;2.5i#169#FB25
outback~Outback~17~27~T~2.5i#169#FB25;2.4 Turbo#260#FA24
solterra~Solterra~22~27~J~Électrique#218:71.4,343:71.4#1YM#EV
brz~BRZ~21~27~X~2.4 Boxer#234#FA24
wrx~WRX STI~17~21~X~2.5 Turbo#300#EJ25
`],
hyundai:["Hyundai","KR",`
i10~i10 III~19~27~Y~1.0 MPi#67#G3LD;1.0 T-GDi#90,100#G3LC;1.2 MPi#84#G4LF
i20~i20 III~20~27~C~1.2 MPi#84#G4LF;1.0 T-GDi#100#G3LC;1.0 T-GDi MHEV#100,120#G3LC#H;1.0 T-GDi N#204#G3LC
i30~i30 III~17~27~K~1.0 T-GDi#120#G3LC;1.4 T-GDi#140#G4LD;1.5 T-GDi#160#G4LF;1.6 CRDi#115,136#D4FE#D;2.0 T-GDi N#250,275,280#G4KH
bayon~Bayon~21~27~U~1.2 MPi#84#G4LF;1.0 T-GDi#100#G3LC;1.0 T-GDi MHEV#120#G3LC#H
kona-1~Kona I~17~23~U~1.0 T-GDi#120#G3LC;1.6 T-GDi#177#G4FJ;1.6 CRDi#136#D4FE#D;Électrique#136:39.2,204:64#EM16#EV
kona-2~Kona II~23~27~U~1.0 T-GDi#120#G3LC;1.6 T-GDi#150,198#G4FT;1.6 Hybrid#141#G4LE#H;Électrique#156:48.4,218:65.4#EM16#EV
tucson~Tucson IV~20~27~E~1.6 T-GDi#150,180#G4FT;1.6 T-GDi MHEV#150#G4FT#H;1.6 T-GDi Hybrid#215,230#G4FT#H;1.6 T-GDi PHEV#253,265#G4FT#P;1.6 CRDi#115,136#D4FE#D;1.6 CRDi MHEV#136#D4FE#H
santafe~Santa Fe IV / V~18~27~W~1.6 T-GDi Hybrid#230,239#G4FT#H;1.6 T-GDi PHEV#265,288#G4FT#P;2.2 CRDi#202#D4HB#D
ioniq~Ioniq~17~22~K~1.6 Hybrid#141#G4LE#H;1.6 PHEV#141#G4LE#P;Électrique#136:38.3#EM16#EV
ioniq5~Ioniq 5~21~27~J~Électrique#170:58,229:77.4,325:77.4,650:84#EM17#EV
ioniq6~Ioniq 6~22~27~H~Électrique#151:53,229:77.4,325:77.4#EM17#EV
ioniq9~Ioniq 9~25~27~J~Électrique#218:110.3,315:110.3,435:110.3#EM23#EV
inster~Inster~24~27~Y~Électrique#97:42,115:49#EM16#EV
nexo~Nexo~18~27~E~Électrique#163:1.56#EV-NEXO#EV
staria~Staria~21~27~V~2.2 CRDi#177#D4HB#D;1.6 T-GDi Hybrid#230#G4FT#H
`],
kia:["Kia","KR",`
picanto~Picanto III~17~27~Y~1.0 MPi#67#G3LD;1.0 T-GDi#100#G3LC;1.2 MPi#84#G4LF
rio~Rio IV~17~27~C~1.2 MPi#84#G4LF;1.0 T-GDi#100,120#G3LC;1.0 T-GDi MHEV#100,120#G3LC#H
ceed~Ceed III / XCeed / ProCeed~18~27~K~1.0 T-GDi#120#G3LC;1.4 T-GDi#140#G4LD;1.5 T-GDi#160#G4LF;1.6 CRDi#115,136#D4FE#D;1.6 PHEV#141#G4LE#P;2.0 T-GDi GT#204#G4KH
stonic~Stonic~17~27~U~1.0 T-GDi#100,120#G3LC;1.0 T-GDi MHEV#100,120#G3LC#H;1.4 MPi#100#G4LC
niro-1~Niro I~17~22~E~1.6 Hybrid#141#G4LE#H;1.6 PHEV#141#G4LE#P;Électrique#204:64#EM16#EV
niro-2~Niro II~22~27~E~1.6 Hybrid#141#G4LE#H;1.6 PHEV#183#G4LE#P;Électrique#204:64.8#EM16#EV
sportage~Sportage V~21~27~E~1.6 T-GDi#150,180#G4FT;1.6 T-GDi MHEV#150#G4FT#H;1.6 T-GDi Hybrid#215,230#G4FT#H;1.6 T-GDi PHEV#253,265#G4FT#P;1.6 CRDi MHEV#136#D4FE#H
sorento~Sorento IV~20~27~W~1.6 T-GDi Hybrid#230#G4FT#H;1.6 T-GDi PHEV#265#G4FT#P;2.2 CRDi#202#D4HB#D
ev3~EV3~24~27~J~Électrique#204:58.3,204:81.4#EM16#EV
ev4~EV4~25~27~H~Électrique#170:58.3,204:81.4#EM16#EV
ev5~EV5~25~27~J~Électrique#218:81.4#EM16#EV
ev6~EV6~21~27~J~Électrique#170:58,229:77.4,325:77.4,585:77.4,650:84#EM21#EV
ev9~EV9~23~27~J~Électrique#204:99.8,385:99.8,508:99.8#EM23#EV
pv5~PV5~25~27~V~Électrique#122:51.5,163:71.2#EV-PV5#EV
stinger~Stinger~17~23~Z~2.0 T-GDi#247#G4KL;3.3 T-GDi GT#370#G6DP
`],
genesis:["Genesis","KR",`
g70~G70~21~27~B~2.0 T-GDi#245#G4KL;3.3 T-GDi#370#G6DP;2.2 CRDi#210#D4HC#D
g80~G80~21~27~Z~2.5 T-GDi#304#G4KN;3.5 T-GDi#380#G6DP;Électrique#370:87.2#EV-G80#EV
g90~G90~22~27~Z~3.5 T-GDi#415#G6DP
gv60~GV60~22~27~J~Électrique#229:77.4,318:77.4,490:77.4#EM17#EV
gv70~GV70~21~27~W~2.5 T-GDi#304#G4KN;2.2 CRDi#210#D4HC#D;Électrique#490:77.4#EV-GV70#EV
gv80~GV80~21~27~W~2.5 T-GDi#304#G4KN;3.5 T-GDi#380#G6DP;2.2 CRDi#210#D4HC#D
`],
kgm:["KGM / SsangYong","KR",`
tivoli~Tivoli~17~27~U~1.6 e-XGi#128#G16;1.5 T-GDi#163#G15T;1.6 e-XDi#115,136#D16DT#D
korando~Korando~19~27~E~1.5 T-GDi#163#G15T;1.6 e-XDi#136#D16DT#D;Électrique#190:61.5#EV-KOR#EV
torres~Torres~22~27~W~1.5 T-GDi#163#G15T;Électrique#207:73.4#EV-TOR#EV
rexton~Rexton~17~27~W~2.2 e-XDi#181,202#D20DT#D
musso~Musso~18~27~P~2.2 e-XDi#181,202#D20DT#D;Électrique#207:73.4#EV-MUS#EV
`],
tesla:["Tesla","US",`
models~Model S~17~27~H~Électrique#670:100,750:100,1020:100#TS#EV
model3~Model 3~17~27~H~Électrique#283:60,351:75,440:79,460:79,498:75,510:79#3D3#EV
modelx~Model X~17~27~J~Électrique#670:100,750:100,1020:100#TX#EV
modely~Model Y~20~27~J~Électrique#299:60,440:79,534:79,510:75#3D3#EV
cyber~Cybertruck~23~27~P~Électrique#600:123,845:123#CT#EV
roadster2~Roadster~26~27~R~Électrique#1020:200#TR#EV
`],
jeep:["Jeep","US",`
renegade~Renegade~17~27~U~1.0 T3#120#GSE;1.3 T4#150,180#GSE;1.6 MultiJet#95,120,130#552#D;2.0 MultiJet#140,170#552#D;1.3 PHEV 4xe#190,240#GSE#P
compass~Compass II~17~27~E~1.3 T4#130,150,180#GSE;1.6 MultiJet#120,130#552#D;2.0 MultiJet#140,170#552#D;1.3 PHEV 4xe#240#GSE#P;1.5 Hybrid#130#GSE#H
cherokee~Cherokee KL~17~23~E~2.0 MultiJet#140,170#552#D;2.4 Tigershark#177#ED6
wrangler~Wrangler JL~18~27~W~2.0 Turbo#272#EC1;2.2 MultiJet#200#552#D;2.0 PHEV 4xe#380#EC1#P
gladiator~Gladiator~20~27~P~3.0 V6 MultiJet#264#VM#D
avenger~Avenger~23~27~U~1.2 Turbo#100#EB2LTED;1.2 Hybrid#100,136#EB2LTEDH#H;Électrique#156:54#EM0#EV
grandcherokee~Grand Cherokee 4xe~22~27~W~2.0 PHEV 4xe#380#EC1#P
wagoneer~Wagoneer S~24~27~J~Électrique#600:100#EV-WGS#EV
`],
fiat:["Fiat","IT",`
panda-3~Panda III~17~27~Y~1.0 FireFly Hybrid#70#GSE#H;1.2 Fire#69#169A4;0.9 TwinAir#85#312A2;1.3 MultiJet#80,95#552#D
panda-4~Grande Panda~24~27~C~1.2 Hybrid 48V#100,136#EB2LTEDH#H;Électrique#113:44#EV-C3#EV
500-3~500 III~17~24~Y~1.2 Fire#69#169A4;0.9 TwinAir#85,105#312A2;1.0 FireFly Hybrid#70#GSE#H;1.3 MultiJet#95#552#D
500e~500e~20~27~Y~Électrique#95:23.8,118:42#EV-500#EV
500l~500L~17~22~M~1.4 Fire#95#843A1;1.4 T-Jet#120#312A1;1.3 MultiJet#95#552#D;1.6 MultiJet#120#552#D
500x~500X~17~24~U~1.0 T3#120#GSE;1.3 T4#150,180#GSE;1.3 MultiJet#95#552#D;1.6 MultiJet#120#552#D;1.5 Hybrid#130#GSE#H
600~600 / 600e~23~27~U~1.2 Hybrid 48V#100,136#EB2LTEDH#H;Électrique#156:54#EM0#EV
tipo~Tipo / Egea~17~27~K~1.4 Fire#95#843A1;1.0 FireFly#100#GSE;1.4 T-Jet#120#312A1;1.3 MultiJet#95#552#D;1.6 MultiJet#120#552#D;1.5 Hybrid#130#GSE#H
topolino~Topolino~23~27~Q~Électrique#8:5.5#AMI#EV
doblo~Doblò III~22~27~L~1.2 Turbo#110,130#EB2;1.5 BlueHDi#100,130#DV5#D;Électrique#136:50#ZKX#EV
scudo~Scudo~22~27~F~1.5 BlueHDi#100,120#DV5#D;2.0 BlueHDi#145,180#DW10#D;Électrique#136:50,136:75#ZKX#EV
ducato~Ducato~17~27~G~2.2 MultiJet#120,140,180#F1AGL#D;Électrique#122:70,270:110#EV-DUC#EV
`],
abarth:["Abarth","IT",`
595~595 / 695~17~24~Y~1.4 T-Jet#145,165,180#312A1
124~124 Spider~17~20~R~1.4 MultiAir Turbo#140,170#312A1
500e~500e / 595e~23~27~Y~Électrique#155:42#EV-500A#EV
600e~600e~24~27~U~Électrique#240:54#EM0#EV
grande-panda~Grande Panda Abarth~25~27~C~1.2 Hybrid#156#EB2LTEDH#H
`],
alfa:["Alfa Romeo","IT",`
giulietta~Giulietta~17~20~K~1.4 TB#120#312A1;1.75 TBi#240#940B;1.6 JTDm#120#552#D;2.0 JTDm#150,175#552#D
giulia~Giulia~17~27~B~2.0 Turbo#200,280#GME;2.2 JTDm#136,150,180,190,210#552#D;2.9 V6 QV#510,520#690T
stelvio~Stelvio~17~27~W~2.0 Turbo#200,280#GME;2.2 JTDm#150,180,190,210#552#D;2.9 V6 QV#510#690T
tonale~Tonale~22~27~E~1.5 Hybrid#130,160#GSE#H;1.3 PHEV Q4#280#GSE#P;2.0 Turbo#268#GME;1.6 JTDm#130#552#D
junior~Junior~24~27~U~1.2 Hybrid#136,156#EB2LTEDH#H;Électrique#156:54,240:54,280:54#EM0#EV
4c~4C~17~20~X~1.75 TBi#240#940B
`],
lancia:["Lancia","IT",`
ypsilon-3~Ypsilon III~17~24~C~1.2 Fire#69#169A4;0.9 TwinAir#85#312A2;1.0 FireFly Hybrid#70#GSE#H;1.3 MultiJet#95#552#D
ypsilon-4~Ypsilon IV~24~27~C~1.2 Turbo#100#EB2LTED;1.2 Hybrid#100,136#EB2LTEDH#H;Électrique#156:51#EM0#EV
delta~Delta~26~27~K~1.2 Hybrid#136#EB2LTEDH#H;Électrique#156:54,240:54#EM0#EV
gamma~Gamma~26~27~N~Électrique#230:74,350:97#STLA#EV
`],
landrover:["Land Rover","GB",`
evoque-1~Range Rover Evoque I~17~19~E~2.0 Si4#240#PT204;2.0 D150#150#204DT#D;2.0 D180#180#204DT#D
evoque-2~Range Rover Evoque II~19~27~E~2.0 P200#200#PT204;2.0 P250#249#PT204;2.0 P300#300#PT204;2.0 D165#163#204DT#D;2.0 D200#204#204DT#D;1.5 P300e#309#PT15#P
discovery-sport~Discovery Sport~17~27~E~2.0 P200#200#PT204;2.0 P250#249#PT204;2.0 D150#150#204DT#D;2.0 D165#163#204DT#D;2.0 D200#204#204DT#D;1.5 P300e#309#PT15#P
discovery~Discovery 5~17~27~W~3.0 D250#249#AJ200D#D;3.0 D300#300#AJ200D#D;3.0 P360#360#AJ300;2.0 P300#300#PT204;3.0 SDV6#306#AJ200D#D
velar~Range Rover Velar~17~27~N~2.0 P250#250#PT204;2.0 P300#300#PT204;3.0 P400#400#AJ300;2.0 D180#180#204DT#D;2.0 D200#204#204DT#D;3.0 D300#300#AJ200D#D;2.0 P400e#404#PT204#P
rangerover~Range Rover L460~21~27~W~3.0 P400#400#AJ300;3.0 D300#300#AJ200D#D;3.0 D350#350#AJ200D#D;4.4 P530#530#N63;3.0 P460e#460#AJ300#P;3.0 P550e#550#AJ300#P
rrsport~Range Rover Sport L461~22~27~W~3.0 P400#400#AJ300;3.0 D300#300#AJ200D#D;3.0 D350#350#AJ200D#D;4.4 P635 SV#635#N63;3.0 P460e#460#AJ300#P;3.0 P550e#550#AJ300#P
defender~Defender L663~20~27~W~2.0 P300#300#PT204;3.0 P400#400#AJ300;3.0 D200#200#AJ200D#D;3.0 D250#249#AJ200D#D;3.0 D300#300#AJ200D#D;2.0 P400e#404#PT204#P;5.0 P525 V8#525#AJ133
`],
jaguar:["Jaguar","GB",`
xe~XE~17~24~B~2.0 P200#200#PT204;2.0 P250#250#PT204;2.0 P300#300#PT204;2.0 D180#180#204DT#D
xf~XF~17~24~Z~2.0 P250#250#PT204;2.0 P300#300#PT204;2.0 D180#180#204DT#D;3.0 D300#300#AJ200D#D
fpace~F-Pace~17~27~W~2.0 P250#250#PT204;3.0 P400#400#AJ300;2.0 D163#163#204DT#D;2.0 D204#204#204DT#D;3.0 D300#300#AJ200D#D;2.0 P400e#404#PT204#P;5.0 P550 SVR#550#AJ133
epace~E-Pace~17~24~E~2.0 P200#200#PT204;2.0 P250#249#PT204;2.0 D150#150#204DT#D;2.0 D180#180#204DT#D;1.5 P300e#309#PT15#P
ipace~I-Pace~18~27~J~Électrique#400:90#EV-JLR#EV
ftype~F-Type~17~24~X~2.0 P300#300#PT204;3.0 P380#380#AJ126;5.0 P575 R#575#AJ133
`],
porsche:["Porsche","DE",`
718~718 Boxster / Cayman~17~27~X~2.0 Turbo#300#9A2B;2.5 GTS#350,365#9A2B;4.0 GTS/GT4#400,420,500#9A1
911-992~911 992~19~27~X~3.0 Carrera#385,394#9A2;3.0 Carrera S#450,480#9A2;3.6 GTS T-Hybrid#541#9A2#H;3.7 Turbo S#650,711#9A2
911-991~911 991.2~17~19~X~3.0 Carrera#370,420#9A2;3.8 Turbo S#580,607#9A2;4.0 GT3#500,520#9A1
taycan~Taycan~19~27~H~Électrique#408:79.2,435:93.4,476:93.4,530:93.4,598:93.4,680:93.4,761:93.4,1034:105#J1#EV
macane~Macan Electric~24~27~J~Électrique#360:100,408:100,476:100,639:100#PPE#EV
macan~Macan thermique~17~24~W~2.0#245,265#EA888;2.9 S/GTS#354,380,440#CSZ
cayenne~Cayenne E3~17~27~W~3.0 V6#340,353#CWV;2.9 S#440,474#CSZ;4.0 Turbo GT#640,659#EA825;3.0 E-Hybrid#462,470#CWV#P;4.0 Turbo E-Hybrid#739#EA825#P
panamera~Panamera 971 / 976~17~27~Z~2.9 V6#330,353#CSZ;4.0 Turbo S#630,680#EA825;2.9 E-Hybrid#462,470#CSZ#P;4.0 Turbo S E-Hybrid#700,782#EA825#P
`],
volvo:["Volvo","SE",`
v40~V40~17~19~K~1.5 T3#152#B4154;2.0 T4#190#B4204;2.0 D2#120#D4204#D;2.0 D3#150#D4204#D
s60~S60 III~19~27~B~2.0 B4 MHEV#197#B4204#H;2.0 B5 MHEV#250#B4204#H;2.0 T8 PHEV#455#B4204#P
v60~V60 II~18~27~T~2.0 B3 MHEV#163#B4204#H;2.0 B4 MHEV#197#B4204#H;2.0 B5 MHEV#250#B4204#H;2.0 T6 PHEV#350#B4204#P;2.0 T8 PHEV#455#B4204#P
s90~S90 / V90~17~27~Z~2.0 B5 MHEV#250#B4204#H;2.0 T8 PHEV#455#B4204#P;2.0 D4#190#D4204#D
xc40~XC40~17~27~E~1.5 T3#163#B3154;2.0 T4#190#B4204;2.0 B3 MHEV#163#B4204#H;2.0 B4 MHEV#197#B4204#H;2.0 D3#150#D4204#D;2.0 D4#190#D4204#D;1.5 T5 PHEV#262#B3154#P
xc60~XC60 II~17~27~W~2.0 B4 MHEV#197#B4204#H;2.0 B5 MHEV#250#B4204#H;2.0 D4#190#D4204#D;2.0 T6 PHEV#350#B4204#P;2.0 T8 PHEV#455#B4204#P
xc90~XC90 II~17~27~W~2.0 B5 MHEV#250#B4204#H;2.0 B6 MHEV#300#B4204#H;2.0 T8 PHEV#455#B4204#P;2.0 D5#235#D4204#D
ex30~EX30~23~27~J~Électrique#272:51,272:69,428:69#SEA#EV
ex40~EX40 / EC40~21~27~J~Électrique#231:69,252:82,408:82#EV-EX4#EV
ex90~EX90~24~27~J~Électrique#313:111,408:111,517:111#EV-EX9#EV
es90~ES90~25~27~H~Électrique#333:111,453:111,680:111#EV-EX9#EV
em90~EM90~24~27~V~Électrique#272:116#SEA#EV
`],
polestar:["Polestar","SE",`
ps1~Polestar 1~19~21~X~2.0 PHEV#609#B4204#P
ps2~Polestar 2~20~27~H~Électrique#231:64,272:69,299:82,408:78,476:78#EV-PS2#EV
ps3~Polestar 3~24~27~J~Électrique#489:111,517:111#EV-PS3#EV
ps4~Polestar 4~24~27~N~Électrique#272:100,544:100#SEA#EV
ps5~Polestar 5~25~27~Z~Électrique#450:106,650:106,884:106#PPE#EV
ps6~Polestar 6~26~27~R~Électrique#884:106#SEA#EV
`],
mg:["MG","CN",`
mg3~MG3 Hybrid+~24~27~C~1.5 Hybrid+#194#MG3-HEV#H
mg4~MG4~22~27~K~Électrique#170:51,204:64,245:77,435:64#EV-MG4#EV
mg5~MG5 EV~21~27~T~Électrique#156:50.3,177:61.1#EV-MG5#EV
zsev~ZS EV~19~27~U~Électrique#143:44.5,156:51,156:72#EV-ZS#EV
zs~ZS~21~27~U~1.5 VTi#106#15S4C;1.0 T-GDi#111#10E4E;1.5 Hybrid+#194#MG3-HEV#H
hs~HS / EHS~18~27~E~1.5 T-GDi#162#15E4E;1.5 PHEV#258#15E4E#P;1.5 Hybrid+#194#MG3-HEV#H
mgs5~MG S5 EV~25~27~E~Électrique#170:49,231:64#EV-MGS5#EV
cyberster~Cyberster~24~27~R~Électrique#314:64,340:77,544:77#EV-CYB#EV
marvelr~Marvel R~21~24~E~Électrique#180:70,288:70#EV-MVR#EV
`],
byd:["BYD","CN",`
atto2~Atto 2~25~27~U~Électrique#177:51.1#BYD#EV
atto3~Atto 3~22~27~E~Électrique#204:60.5#BYD#EV
dolphin~Dolphin~23~27~C~Électrique#95:44.9,176:60.4,204:60.4#BYD#EV
dolphin-surf~Dolphin Surf / Seagull~25~27~Y~Électrique#88:30,115:43.2#BYD#EV
seal~Seal~23~27~H~Électrique#313:82.5,530:82.5#BYD#EV
sealion7~Sealion 7~25~27~J~Électrique#313:82.5,530:82.5,570:91.3#BYD#EV
sealu~Seal U DM-i~24~27~E~1.5 DM-i#218,324#BYD-DMI#P
seal6~Seal 6 DM-i~25~27~B~1.5 DM-i#184,238#BYD-DMI#P
tang~Tang EV~23~27~W~Électrique#517:108.8#BYD#EV
han~Han EV~23~27~Z~Électrique#517:85.4#BYD#EV
`],
xpeng:["XPeng","CN",`
g6~G6~24~27~J~Électrique#258:66,286:87.5,487:87.5#EV-XG6#EV
g9~G9~23~27~J~Électrique#313:98,551:98#EV-XG9#EV
p7~P7 / P7+~23~27~H~Électrique#276:86.2,473:86.2,505:86.2#EV-XP7#EV
g7~G7~25~27~J~Électrique#296:80.8#EV-XG7#EV
x9~X9~25~27~V~Électrique#320:101.5#EV-X9#EV
`],
nio:["NIO","CN",`
et5~ET5 / ET5T~23~27~H~Électrique#490:75,490:100#EV-NIO#EV
et7~ET7~23~27~Z~Électrique#653:100#EV-NIO#EV
el6~EL6 / ES6~23~27~J~Électrique#490:75,490:100#EV-NIO#EV
el7~EL7 / ES7~23~27~J~Électrique#653:100#EV-NIO#EV
el8~EL8 / ES8~23~27~W~Électrique#653:100,653:150#EV-NIO#EV
ec6~EC6 / EC7~24~27~N~Électrique#490:100#EV-NIO#EV
`],
zeekr:["Zeekr","CN",`
zx~X~24~27~U~Électrique#272:66,428:66#SEA#EV
z001~001~24~27~N~Électrique#272:100,544:100,580:100#SEA#EV
z007~007~25~27~H~Électrique#422:75,646:100#SEA#EV
z7x~7X~25~27~J~Électrique#421:75,646:100#SEA#EV
`],
leapmotor:["Leapmotor","CN",`
t03~T03~23~27~Y~Électrique#95:37.3,109:41.3#EV-LM#EV
c10~C10~24~27~J~Électrique#218:69.9#EV-LM#EV;1.5 EREV#218:28.4#RE-ROT#P
b10~B10~25~27~E~Électrique#218:67.1#EV-LM#EV
c01~C01~25~27~H~Électrique#272:90#EV-LM#EV
`],
omoda:["Omoda","CN",`
o5~5 / C5~24~27~N~1.6 T-GDi#147,185#SQR;1.5 T-GDi#156#SQR
oe5~E5~24~27~J~Électrique#204:61#EV-OM#EV
o7~7~25~27~E~1.6 T-GDi#147#SQR;1.5 PHEV#347#SQR#P
o9~9 / E9~25~27~W~Électrique#408:80#EV-OM9#EV
`],
jaecoo:["Jaecoo","CN",`
j7~7 / J7~24~27~E~1.6 T-GDi#147,185#SQR;1.5 PHEV#347#SQR#P
j8~8 / J8~25~27~W~1.5 PHEV#347,530#SQR#P
j5~5 / J5~25~27~U~1.5 T-GDi#147#SQR;Électrique#204:61#EV-JC#EV
`],
ora:["Ora","CN",`
o03~03 / Funky Cat~23~27~C~Électrique#171:48,171:63#EV-ORA#EV
o07~07 / Lightning Cat~24~27~H~Électrique#204:83.5,408:83.5#EV-ORA7#EV
`],
lynk:["Lynk & Co","CN",`
l01~01~21~27~E~1.5 PHEV#261,276#JLH#P;1.5 HEV#150#JLH#H
l02~02~24~27~N~Électrique#272:66#SEA#EV
l08~08~25~27~W~1.5 PHEV#280,544#JLH#P
l09~09~25~27~W~2.0 PHEV#544#JLH#P
`],
chery:["Chery","CN",`
tiggo7~Tiggo 7 Pro~24~27~E~1.6 T-GDi#147,186#SQR;1.5 PHEV#347#SQR#P
tiggo8~Tiggo 8 Pro~24~27~S~1.6 T-GDi#186#SQR;1.5 PHEV#347#SQR#P
tiggo9~Tiggo 9~25~27~W~1.5 PHEV#347,530#SQR#P
arrizo8~Arrizo 8~25~27~B~1.6 T-GDi#186#SQR
`],
gwm:["GWM / Haval","CN",`
jolion~Jolion~23~27~U~1.5 Turbo#143#GW4B15;1.5 HEV#190#GW4B15#H
h6~H6~24~27~E~1.5 Turbo#150#GW4B15;2.0 Turbo#204#GW4C20;1.5 PHEV#326#GW4B15#P
wey05~Wey 05 / Coffee 01~24~27~W~2.0 PHEV#476#GW4C20#P
poer~Poer / Wingle~24~27~P~2.0 Turbo Diesel#163#GW4D20#D
`],
dongfeng:["DFSK / Dongfeng","CN",`
s580~580 / Glory~23~27~S~1.5 Turbo#145#SFG15;1.5 PHEV#184#SFG15#P
seres3~Seres 3~23~27~U~Électrique#163:52#EV-SER#EV
seres5~Seres 5~24~27~E~Électrique#299:80#EV-SER5#EV;1.5 EREV#456:40#RE-ROT#P
box~Box / Nammi~25~27~C~Électrique#95:42.3#EV-BOX2#EV
`],
maxus:["Maxus","CN",`
euniq5~Euniq 5~21~27~M~Électrique#177:52.5,177:70#EV-MX5#EV
euniq6~Euniq 6~21~27~E~Électrique#204:70#EV-MX6#EV
t90~T90 EV~22~27~P~Électrique#204:88.5#EV-MXT9#EV
edeliver3~eDeliver 3~21~27~F~Électrique#163:50.2#EV-MXD3#EV
edeliver9~eDeliver 9~21~27~G~Électrique#204:88.5#EV-MXD9#EV
`],
lotus:["Lotus","GB",`
eletre~Eletre~24~27~J~Électrique#612:112,918:112#SEA#EV
emeya~Emeya~24~27~Z~Électrique#612:102,918:102#SEA#EV
emira~Emira~22~27~X~2.0 Turbo#365#M139;3.5 V6#405#2GR
`],
maserati:["Maserati","IT",`
ghibli~Ghibli~17~24~Z~3.0 V6#350,430#F160;3.0 V6 Diesel#275#VM#D;2.0 Hybrid#330#GME#H
levante~Levante~17~24~W~3.0 V6#350,430#F160;3.8 V8 Trofeo#580#F154;3.0 V6 Diesel#275#VM#D
grecale~Grecale~22~27~W~2.0 GT#300#GME#H;3.0 Trofeo#530#M156;Électrique#410:105#EV-GRC#EV
granturismo~GranTurismo / GranCabrio~23~27~X~3.0 Modena#490#M156;3.0 Trofeo#550#M156;Électrique#761:92.5#EV-GT#EV
mc20~MC20 / MCPura~21~27~X~3.0 Nettuno#630#M156
`],
bentley:["Bentley","GB",`
bentayga~Bentayga~17~27~W~4.0 V8#550#EA825;6.0 W12#608,635#W12;3.0 V6 Hybrid#462,544#CWV#P
continental~Continental GT~18~27~X~4.0 V8#550#EA825;6.0 W12#635,659#W12;4.0 V8 Hybrid#782#EA825#P
flyingspur~Flying Spur~19~27~Z~4.0 V8#550#EA825;6.0 W12#635#W12;4.0 V8 Hybrid#680#EA825#P
`],
ferrari:["Ferrari","IT",`
roma~Roma / Spider~20~27~X~3.9 V8#620,663#F154
296~296 GTB / GTS~22~27~X~3.0 V6 PHEV#830#F163#P
sf90~SF90 Stradale / Spider~20~27~X~4.0 V8 PHEV#1000#F154#P
purosangue~Purosangue~23~27~W~6.5 V12#725#F140
12cilindri~12Cilindri~24~27~X~6.5 V12#830#F140
portofino~Portofino M~17~23~R~3.9 V8#620#F154
f8~F8 Tributo / Spider~19~23~X~3.9 V8#720#F154
812~812 Superfast / Competizione~17~24~X~6.5 V12#800,830#F140
`],
lamborghini:["Lamborghini","IT",`
urus~Urus / SE~18~27~W~4.0 V8#650,666#CEH;4.0 V8 PHEV#800#CEH#P
huracan~Huracán~17~24~X~5.2 V10#610,640#L520
revuelto~Revuelto~23~27~X~6.5 V12 PHEV#1015#L539#P
temerario~Temerario~25~27~X~4.0 V8 PHEV#920#CEH#P
`],
aston:["Aston Martin","GB",`
db11~DB11~17~23~X~4.0 V8#510#M177;5.2 V12#608,639#AE31
db12~DB12~23~27~X~4.0 V8#680#M177
vantage~Vantage~18~27~X~4.0 V8#510,550,665#M177
dbx~DBX / DBX707~20~27~W~4.0 V8#550,707#M177
valhalla~Valhalla~25~27~X~4.0 V8 PHEV#1079#M177#P
`],
mclaren:["McLaren","GB",`
720s~720S / 750S~17~27~X~4.0 V8#720,750#M840
artura~Artura~22~27~X~3.0 V6 PHEV#680,700#M630#P
gt~GT~19~25~X~4.0 V8#620#M840
750s~750S / 765LT~21~27~X~4.0 V8#750,765#M840
`],
rolls:["Rolls-Royce","GB",`
cullinan~Cullinan / Series II~18~27~W~6.75 V12#571,600#N74
phantom~Phantom VIII~17~27~Z~6.75 V12#571#N74
ghost~Ghost II~20~27~Z~6.75 V12#571,600#N74
spectre~Spectre~23~27~X~Électrique#585:102#EV-RR#EV
`],
bugatti:["Bugatti","FR",`
chiron~Chiron / Super Sport~17~24~X~8.0 W16#1500,1600#W16
tourbillon~Tourbillon~26~27~X~8.3 V16 PHEV#1800#V16#P
`],
isuzu:["Isuzu","JP",`
dmax~D-Max~17~27~P~1.9 Ddi#163#RZ4E#D;2.2 Ddi#163#RZ4E#D
mux~MU-X~21~27~W~1.9 Ddi#150#RZ4E#D;2.2 Ddi#163#RZ4E#D
`],
iveco:["Iveco","IT",`
daily~Daily~17~27~G~3.0 F1C#140,160,180,210#F1C#D;Électrique#190:74,190:111#EV-DAY#EV
`],
man:["MAN","DE",`
tge~TGE~17~27~G~2.0 TDI#102,140,177#DMZ#D;Électrique#136:35#EV-TGE#EV
`],
chevrolet:["Chevrolet","US",`
spark~Spark~17~19~Y~1.0#68#B10D;1.2#82#B12D
cruze~Cruze~17~19~K~1.4 Turbo#150#LE2;1.6 CDTI#136#B16D#D
orlando~Orlando~17~19~M~2.0 CDTI#163#Z20D#D
`],
aixam:["Aixam","FR",`
city~City / Crossline~17~27~Q~0.5 DCI#8#DCI#D;Électrique#8:8#EV-AIX#EV
coupe~Coupé / GTI~17~27~Q~0.5 DCI#8#DCI#D;Électrique#20:12#EV-AIX2#EV
`],
ligier:["Ligier","FR",`
js50~JS50 / JS60~17~27~Q~0.5 DCI#8#DCI#D
pulse4~Pulse 4~22~27~Q~Électrique#14:12#EV-LIG#EV
`],
fisker:["Fisker","US",`
ocean~Ocean~23~25~J~Électrique#282:113,564:113#EV-OCN#EV
`],
lucid:["Lucid","US",`
air~Air~24~27~H~Électrique#480:88,620:112,1234:118#EV-AIR#EV
gravity~Gravity~25~27~J~Électrique#828:123#EV-GRV#EV
`],
vinfast:["VinFast","VN",`
vf6~VF 6~24~27~U~Électrique#177:59.6,204:59.6#EV-VF6#EV
vf7~VF 7~24~27~E~Électrique#204:75.3,354:75.3#EV-VF7#EV
vf8~VF 8~23~27~W~Électrique#354:87.7,408:87.7#EV-VF8#EV
vf9~VF 9~24~27~W~Électrique#408:123#EV-VF9#EV
`],
hongqi:["Hongqi","CN",`
ehs9~E-HS9~22~27~W~Électrique#435:99,551:120#EV-HQ9#EV
e-h9~E-H9~24~27~Z~Électrique#394:111#EV-HQ9S#EV
`],
forthing:["Forthing","CN",`
t5evo~T5 Evo~24~27~E~1.5 T-GDi#177#4A15T
u-tour~U-Tour / Friday~24~27~J~Électrique#204:85.9#EV-FRT#EV
`],
denza:["Denza","CN",`
d9~D9~25~27~V~Électrique#313:103#BYD#EV;1.5 DM-i#408:40#BYD-DMI#P
z9gt~Z9 GT~25~27~N~Électrique#965:100#BYD#EV
`]
};

/* ═══ PANNES · CAMPAGNES · RAPPELS · TSB ═══
   [id, portée, marques|ALL, cible, nature, sévérité, y0, y1, titre,
    symptômes+mots-clés, protocole|…, organes, DTC, source, domaines] */
var faults = [
["F-EB2-BELT","engine","peugeot,citroen,ds,opel,fiat,alfa,jeep,lancia","1.2 PureTech","rappel","critique",2017,2024,"Courroie humide 1.2 PureTech — dégradation, débris et colmatage de crépine","Bruit de courroie à froid, voyant pression huile, perte de puissance, débris dans l'huile, wet belt, courroie bain d'huile, calage, casse moteur.","Vérifier l'éligibilité VIN de la campagne Stellantis|Mesurer la largeur de courroie au gabarit constructeur|Déposer le carter et inspecter la crépine de pompe à huile|Contrôler la pression d'huile manométrique à chaud|Remplacer kit courroie + pompe + crépine, vidange et rinçage|Effacer adaptations et essai routier","Kit courroie humide, pompe à huile, crépine, tendeur, galets","P0016,P0011,P0521,P0341,P0087,P0300","Rappel Conso · Stellantis EB2","distribution,moteur,injection"],
["F-EB2-PUMP","engine","peugeot,citroen,ds,opel,fiat,alfa,jeep,lancia","1.2 PureTech","campagne","critique",2017,2024,"Pompe à huile — crépine colmatée par débris de courroie","Voyant pression huile, mode dégradé, casse turbo, limailles, huile starved, pression basse.","Mesurer la pression d'huile à chaud au manomètre|Contrôler crépine et carter inférieur|Vérifier turbo, coussinets et arbre à cames|Remplacer pompe + crépine + kit courroie|Rincer le circuit et vidanger huile normée","Pompe à huile, crépine, turbo, coussinets, déphaseur","P0521,P0087,P0299,P0011","Campagne Stellantis EB2","moteur,distribution,suralim"],
["F-EB2-HYB","engine","peugeot,citroen,ds,opel,fiat,alfa,jeep,lancia,abarth","1.2 Hybrid 48V","tsb","moyen",2023,2027,"e-DCS6 — apprentissage boîte, à-coups et chaîne de distribution","À-coups au démarrage, hésitation 1↔2, bruit de chaîne à froid, broutage, hybrid 48V, eDCS6.","Lire les adaptations et compteurs d'usure e-DCS6|Appliquer la calibration TCU constructeur|Exécuter l'apprentissage d'embrayage|Contrôler l'huile de boîte et la chaîne|Essai routier de validation","Boîte e-DCS6, chaîne, TCU, embrayage, ISG","P0700,P1750,P0A7F","TSB Stellantis e-DCS6","transmission,acoups,distribution,elec48"],
["F-DV5-CHAIN","engine","peugeot,citroen,ds,opel","1.5 BlueHDi","campagne","eleve",2017,2023,"Chaîne d'arbres à cames 7 mm — allongement et rupture","Claquement distribution à froid, défaut corrélation vilo/AAC, calage décalé, chaîne AAC 7mm 8mm.","Contrôler jeu et allongement de chaîne AAC 7 mm|Vérifier la référence du kit renforcé 8 mm selon VIN|Remplacer chaîne + tendeur + pignons|Reprendre le calage et effacer les adaptations","Kit chaîne AAC 8 mm, tendeur, pignons, courroie","P0016,P0017,P0340,P0341","Campagne Stellantis DV5","distribution,moteur"],
["F-DV5-SCR","engine","peugeot,citroen,ds,opel","1.5 BlueHDi","rappel","eleve",2017,2025,"SCR AdBlue — cristallisation injecteur, pompe et capteurs NOx","Compte à rebours de non-redémarrage, voyant AdBlue, perte de puissance, NOx, urée, SCR.","Lire P20EE / P204F et les compteurs SCR|Mesurer le débit de pompe AdBlue|Inspecter la cristallisation de l'injecteur et du mélangeur|Remplacer selon campagne puis réinitialiser les compteurs|Contrôler la qualité d'AdBlue au réfractomètre","Pompe AdBlue, injecteur SCR, capteurs NOx amont/aval, réservoir","P20EE,P204F,P207F,P2201,P229F","Rappel Conso · Stellantis SCR","depol,injection,telematique"],
["F-DV5-FAP","engine","peugeot,citroen,ds,opel","1.5 BlueHDi","panne","moyen",2017,2025,"FAP — colmatage sur trajets courts et dilution d'huile","Régénérations rapprochées, perte de puissance, niveau d'huile qui monte, FAP, DPF, suie, cendres.","Mesurer ΔP FAP, charge de suie et de cendres|Vérifier nombre de régénérations et distance moyenne|Contrôler le niveau et l'odeur de l'huile|Régénération forcée puis essai routier long|Remplacer si colmatage irréversible et réinitialiser","FAP, capteur ΔP, injecteurs, huile moteur","P2002,P2463,P246C,P242F","Retour terrain Stellantis","depol,moteur,injection"],
["F-EP6-CHAIN","engine","peugeot,citroen,ds,opel,mini,bmw","1.6 PureTech","panne","eleve",2017,2023,"Chaîne EP6 / Prince — tendeur et décalage de calage","Claquement métallique à froid, ralenti instable, ratés, chaîne Prince THP PureTech.","Contrôler la synchro vilo/AAC à l'oscilloscope|Inspecter tendeur, patins et guides|Remplacer le kit chaîne complet|Vérifier pression d'huile et déphaseur d'AAC","Kit chaîne, tendeur, patins, déphaseur, pompe à huile","P0016,P0011,P0341,P0300","TSB PSA / BMW EP6","distribution,moteur,allumage"],
["F-EP6-OIL","engine","peugeot,citroen,ds","1.6 THP","panne","eleve",2017,2021,"Consommation d'huile et calamine admission","Baisse de niveau, fumée bleue, ratés, perte de puissance, calamine, segmentation, PCV.","Mesurer la consommation sur 1 000 km|Endoscopie cylindres et soupapes d'admission|Contrôler séparateur d'huile et dépressurisation carter|Décalaminage puis contrôle segmentation et joints de queues","Segments, PCV, soupapes admission, joints de queues, turbo","P0300,P0301,P0171,P0521","TSB PSA THP","moteur,injection,allumage,suralim"],
["F-PSA-EAT","engine","peugeot,citroen,ds,opel","1.6 PureTech","tsb","moyen",2018,2027,"EAT6 / EAT8 — à-coups, patinage et huile « à vie »","À-coups basse vitesse, passages brutaux, patinage à chaud, ATF, Aisin, convertisseur.","Lire adaptations et compteurs d'usure d'embrayage|Contrôler le niveau ATF à température normée|Appliquer la mise à jour TCU|Vidanger l'ATF selon intervalle révisé|Essai avec apprentissage","Mécatronique EAT, ATF, convertisseur, échangeur","P0700,P1750,P0218","TSB Stellantis EAT / Aisin","transmission,acoups,thermique"],
["F-PSA-SCREEN","brand","peugeot,citroen,ds,opel","","panne","moyen",2017,2027,"Tablette tactile — touches fantômes, délaminage et redémarrages","Écran qui clique seul, reboot, perte CarPlay/Android Auto, écran noir, bulles, NAC, IVI.","Relever version logicielle et journaux|Contrôler nappe LVDS et alimentation de la dalle|Appliquer la mise à jour multimédia|Remplacer la dalle si défaut tactile persistant|Contrôler la masse du boîtier","Dalle tactile, nappe LVDS, calculateur multimédia","U0101,U0121,B1000","Retour terrain Stellantis","tablette,telematique,elec12"],
["F-PSA-KEY","brand","peugeot,citroen,ds,opel","","panne","moyen",2017,2027,"Keyless — non-détection de clé, démarrage refusé, ouvrants","Message clé non détectée, démarrage impossible, ouverture aléatoire, télécommande, BSI.","Contrôler la pile de télécommande|Vérifier la 12 V et la chute au démarrage|Tester les antennes BF d'habitacle|Contrôler les interférences (badge, téléphone, chargeur)|Reprogrammer la clé selon procédure","Pile, antennes BF, BSI, 12 V, transpondeur","B1000,U0100,P0562","Retour terrain Stellantis","cle,elec12,portes"],
["F-STLA-OBC","model","peugeot,citroen,ds,opel,fiat,alfa,lancia,abarth","c5air-2,408,3008-3,5008-3,frontera,panda-4,600,junior,grandland-2,ypsilon-4,delta,gamma,500e,dsn4,dsn8","campagne","eleve",2024,2027,"STLA Medium / e-CMP2 — OBC 11 kW, verrou de trappe et infiltration","Charge AC interrompue, trappe qui ne verrouille pas, eau dans la prise, OBC, chargeur embarqué.","Lire les codes OBC et actuateur de trappe|Tester sur plusieurs bornes AC et un autre câble|Contrôler le verrou, les joints et les évacuations|Appliquer la campagne OBC / trappe|Revalider charge AC, DC et verrouillage","OBC, actuateur trappe, joints, faisceau HV","P0D11,B1000,P0C00,P0AA6","Campagne Stellantis STLA","charge,hv,portes,carrosserie"],
["F-H5F-OIL","engine","renault,dacia","1.2 TCe","panne","critique",2017,2019,"1.2 TCe H5Ft — consommation d'huile et casse moteur","Consommation anormale, fumée bleue, cliquetis, casse turbo, moteur DIG-T 1.2, segments.","Mesurer la consommation sur 1 000 km|Contrôler pression d'huile et crépine|Endoscopie cylindres (rayures, segments)|Vérifier l'éligibilité à la campagne moteur|Contrôler turbo et dépressurisation carter","Segments, piston, turbo, PCV, crépine, pompe à huile","P0301,P0521,P0299,P0016","Campagne Renault H5Ft","moteur,suralim,injection,distribution"],
["F-H5H-CHAIN","engine","renault,dacia,nissan,mercedes","1.3 TCe","tsb","eleve",2018,2025,"1.3 TCe H5Ht / M282 — chaîne, huile et GPF","Claquement à froid, voyant moteur, baisse de niveau, GPF, filtre à particules essence.","Contrôler synchro AAC/vilebrequin|Inspecter tendeur et guides de chaîne|Mesurer la consommation d'huile|Vérifier le GPF et la pression différentielle|Appliquer la mise à jour logicielle moteur","Kit chaîne, tendeur, GPF, PCV, bougies","P0016,P0420,P0299,P2002","TSB Alliance H5H / M282","distribution,moteur,depol"],
["F-K9K-EGR","engine","renault,dacia,nissan","1.5 Blue dCi","campagne","eleve",2017,2024,"EGR et refroidisseur — encrassement, fuite de LDR","Perte de puissance bas régime, fumée noire, fuite de liquide, vanne EGR, caloportage.","Lire P0401 et position EGR consigne/réel|Mettre le circuit LDR sous pression|Contrôler l'encrassement du refroidisseur et du mélangeur|Nettoyer ou remplacer puis réinitialiser les adaptations|Vérifier l'impact sur le FAP","Vanne EGR, refroidisseur EGR, capteur position, joints","P0401,P0402,P0490,P040B","Campagne Renault dCi","depol,thermique,moteur"],
["F-K9K-TURBO","engine","renault,dacia,nissan","1.5 dCi","panne","eleve",2017,2021,"Turbo — géométrie variable grippée, durite de suralimentation","Sifflement, perte de puissance, mode dégradé, fumée noire, GAV, wastegate, boost.","Lire pression de suralimentation consigne/réel|Tester l'actionneur de géométrie variable|Recherche de fuite au générateur de fumée|Contrôler la crépine d'alimentation d'huile du turbo","Turbo, GAV, durites, échangeur, capteur MAP","P0299,P0234,P2263,P00AF","Retour terrain dCi","suralim,moteur"],
["F-M9T","engine","renault,opel,nissan","2.3 dCi","tsb","moyen",2017,2027,"Master / Movano M9T — chaîne, injecteurs et pression rail","Claquement à froid, démarrage difficile, fumée, ratés, rail, débit retour.","Contrôler allongement de chaîne et tendeur|Test des débits de retour injecteurs|Vérifier la pression rail au démarrage|Contrôler FAP et SCR puis réinitialiser","Kit chaîne, injecteurs, pompe HP, rail","P0016,P0087,P0201,P0202","TSB Renault M9T","distribution,injection,depol"],
["F-RN-EDC","brand","renault,dacia,alpine","","tsb","moyen",2017,2027,"EDC / boîte multimode — à-coups, surchauffe et usure d'embrayage","Broutage au démarrage, à-coups 1↔2, message boîte chaude, Getrag, DCT, multimode.","Lire adaptations et température d'embrayage|Contrôler le niveau d'huile de boîte|Appliquer mise à jour TCU et apprentissage|Contrôler embrayage, butée et actionneur|Essai de validation à froid et à chaud","Embrayage EDC, mécatronique, TCU, huile DCT","P0700,P1750,P0218","TSB Renault EDC","transmission,acoups,thermique"],
["F-AMP-BMS","model","renault,nissan,dacia,alpine","r5,r4,twingo-e,micra-6,a290,a390,scenic-e,megane-e,leaf-3","tsb","moyen",2022,2027,"AmpR — BMS, estimation SOC, équilibrage et préconditionnement","Jauge imprécise, charge lente à froid, delta cellules élevé, autonomie, SOH, préconditionnement.","Lire delta de cellules, SOH et températures|Cycle de charge lente complet à 100 % pour équilibrage|Appliquer la mise à jour BMS|Réapprendre l'estimation SOC|Contrôler pompe LDR et préconditionnement","BMS, modules, sondes température, pompe LDR","P0AA6,P0C00,U0111,P0AFA","TSB Renault AmpR","hv,autonomie,charge,thermique"],
["F-ZOE-OBC","model","renault","zoe","campagne","eleve",2019,2024,"Chargeur embarqué / connecteur Type 2 — échauffement","Charge AC interrompue, odeur de chaud, broches noircies, Caméléon, 22 kW, Type 2.","Inspecter les broches véhicule et câble|Thermographie en charge AC|Contrôler les codes du chargeur embarqué|Remplacer connecteur / OBC selon campagne|Tester sur plusieurs bornes et câbles","Connecteur Type 2, OBC, faisceau HV, contacteurs","P0D11,P0C00,U0111","Campagne Renault Zoe","charge,hv,elec12"],
["F-RN-CARD","brand","renault,dacia","","panne","moyen",2017,2027,"Carte mains libres — non-reconnaissance et ouverture refusée","Message carte non détectée, ouverture impossible, démarrage aléatoire, UCH, keyless.","Contrôler la pile de carte|Vérifier 12 V et masses|Tester antennes BF et lecteur de carte|Contrôler interférences et UCH|Reprogrammer la carte","Carte, antennes BF, UCH, 12 V","B1000,U0100,P0562","Retour terrain Renault","cle,portes,elec12"],
["F-SPR-BRAKE","model","dacia","spring","rappel","critique",2021,2026,"Spring — servofrein électrique défaillant","Pédale dure, distance de freinage allongée, voyant freinage, assistance, iBooster.","Vérifier l'éligibilité VIN|Tester l'assistance et lire les codes|Contrôler le capteur de course de pédale|Remplacer le servofrein selon campagne|Essai de freinage de validation","Servofrein électrique, capteur pédale, 12 V","C1365,P0562,U0121","Rappel Conso / Safety Gate","freinage,abs,elec12"],
["F-BIG-SPRING","model","dacia","bigster,duster-3","rappel","critique",2024,2027,"Ressorts arrière — risque de rupture (diamètre de fil)","Claquement arrière, véhicule penché, fissure visible, ressort, suspension, train arrière.","Vérifier le VIN sur Rappel Conso / Safety Gate|Lever le véhicule roues arrière suspendues|Inspecter les deux ressorts (fissures, corrosion, diamètre)|Remplacer ressorts + coupelles et butées|Serrer aux couples puis contrôle géométrie","Ressorts AR, coupelles, butées, amortisseurs","","Rappel Conso / Safety Gate","train,geometrie"],
["F-EA211","engine","volkswagen,audi,skoda,seat,cupra","1.5 TSI","tsb","moyen",2017,2027,"EA211 evo — courroie, désactivation ACT et à-coups","Bruit de courroie, à-coups bas régime, voyant moteur, ACT, cylindre désactivé, kangaroo.","Contrôler état et tension de courroie crantée|Lire les défauts de désactivation ACT|Vérifier la consommation d'huile|Appliquer la mise à jour logicielle moteur","Courroie, tendeur, ACT, bougies, PCV","P0016,P0300,P0301,P0171","TSB VAG EA211 evo","distribution,acoups,moteur,allumage"],
["F-EA888","engine","volkswagen,audi,skoda,seat,cupra","2.0 TSI","panne","eleve",2017,2022,"EA888 gen3 — tendeur de chaîne et consommation d'huile","Claquement au démarrage à froid, ratés, baisse de niveau, tendeur, chaîne, PCV.","Contrôler corrélation vilo/AAC à l'oscilloscope|Inspecter le tendeur (référence révisée)|Mesurer la consommation d'huile sur 1 000 km|Contrôler PCV et segmentation","Kit chaîne, tendeur, PCV, segments, déphaseur","P0016,P0011,P0300,P0521","TSB VAG EA888","distribution,moteur,allumage"],
["F-EA288-SCR","engine","volkswagen,audi,skoda,seat,cupra","2.0 TDI","campagne","eleve",2017,2027,"EA288 — SCR, capteurs NOx et pompe AdBlue","Voyant AdBlue, compte à rebours, défaut NOx, rendement SCR, urée, cristallisation.","Lire P20EE et valeurs NOx amont/aval|Tester le débit de pompe AdBlue|Contrôler la cristallisation de l'injecteur|Appliquer la mise à jour NOx puis réinitialiser les compteurs","Pompe AdBlue, injecteur, capteurs NOx, mélangeur","P20EE,P2201,P204F,P229F","Campagne VAG EA288 / dieselgate","depol,injection"],
["F-EA288-EGR","engine","volkswagen,audi,skoda,seat,cupra","2.0 TDI","panne","moyen",2017,2027,"EA288 — refroidisseur EGR et vanne encrassée","Perte de puissance, fumée, consommation de LDR, EGR, caloportage, encrassement.","Test de pression du circuit de refroidissement|Lire position EGR consigne/réel|Contrôler le ΔP du FAP|Nettoyer ou remplacer vanne et refroidisseur|Réinitialiser adaptations","Vanne EGR, refroidisseur, FAP, joints","P0401,P0402,P2002,P040B","Retour terrain VAG","depol,thermique,moteur"],
["F-VAG-DSG","brand","volkswagen,audi,skoda,seat,cupra","","tsb","eleve",2017,2027,"DSG DQ200 / DQ250 / DQ381 — mécatronique et huile","À-coups au démarrage, vitesses non engagées, patinage, mécatronique, DSG7, DSG6, S-tronic.","Lire codes TCU et adaptations d'embrayage|Contrôler niveau et état d'huile|Vérifier la pression hydraulique de mécatronique|Appliquer mise à jour TCU + apprentissage|Remplacer la mécatronique si hors tolérance","Mécatronique, embrayages, huile DSG, accumulateur","P0700,P1750,P189C,P0218","TSB VAG DSG","transmission,acoups"],
["F-MEB-12V","model","volkswagen,audi,skoda,seat,cupra,ford","id3,id4,id5,id7,idbuzz,enyaq,elroq,epiq,born,q4,explorer,capri,tavascan,tayron,id2,raval,vision","campagne","eleve",2020,2027,"MEB / MEB+ — décharge 12 V et logiciel ICU/ICAS","Non démarrable après immobilisation, écrans qui redémarrent, veille, 12 V lithium, OTA.","Mesurer le courant de repos après mise en veille complète|Contrôler le SOH de la 12 V (Li-ion ou AGM)|Appliquer la campagne logicielle ICU/ICAS|Remplacer la 12 V si dégradée|Contrôler le DC-DC","Batterie 12 V, DC-DC, ICAS, TCU","U0111,P0562,P0AA6,U0101","Campagne VW MEB","elec12,hv,telematique,tablette"],
["F-MEB-BRAKE","model","volkswagen,audi,skoda,cupra","id3,id4,id5,id7,enyaq,elroq,born,epiq,q4,tavascan","tsb","moyen",2020,2027,"MEB — freinage régénératif et corrosion des disques arrière","Bruit au freinage, freinage arrière faible, à-coups en décélération, disques corrodés, regen.","Contrôler épaisseur et voile des disques arrière|Vérifier la mobilité des étriers (faible sollicitation)|Appliquer la calibration régénératif|Nettoyer étriers et remplacer disques corrodés|Rodage puis essai","Disques AR, étriers, logiciel freinage, plaquettes","C1365,U0121","TSB VW MEB","freinage,abs,acoups,train"],
["F-MEB-DOOR","model","volkswagen,audi,skoda,cupra,ford","id3,id4,id5,id7,idbuzz,enyaq,elroq,capri,explorer","campagne","eleve",2020,2027,"Poignées affleurantes / ouvrants — ouverture électronique défaillante","Porte qui ne s'ouvre pas, ouverture intempestive, poignée, module de porte, keyless.","Lire les défauts du module de porte|Contrôler actionneur et micro-contact de poignée|Vérifier alimentation, masses et 12 V|Appliquer la campagne logicielle|Contrôler le déverrouillage de secours","Actionneur de poignée, module de porte, faisceau","B1000,U0100,P0562","Campagne VW MEB ouvrants","portes,cle,elec12"],
["F-PPE-800","model","audi,porsche,polestar","a6e,q6,etrongt,macane,taycan,ps5","tsb","eleve",2024,2027,"PPE / J1 800 V — contacteurs DC, précharge et thermique","Claquement à la connexion, charge DC refusée, alerte HV, 800V, précharge, contacteur.","Lire les codes contacteurs et précharge|Contrôler la tension de précharge|Inspecter les contacteurs DC et le verrouillage|Appliquer la mise à jour gestion de charge|Revalider sur borne 800 V et courbe de charge","Contacteurs DC, résistance de précharge, BMS, OBC","P0AA6,P0D11,P0C00,P0AFA","TSB PPE / J1","charge,hv,thermique"],
["F-B47-CHAIN","engine","bmw,mini","2.0 320d","panne","eleve",2017,2024,"B47 — chaîne de distribution côté boîte de vitesses","Claquement à froid, bruit côté tablier, démarrage difficile, chaîne arrière, B47 B37.","Contrôler synchro AAC/vilebrequin|Écouter le bruit côté boîte (chaîne en sortie de vilebrequin)|Déposer la boîte pour accès au kit|Remplacer chaîne + tendeur + patins complets","Kit chaîne B47, tendeur, patins, guides","P0016,P0017,P0335,P0341","TSB BMW B47","distribution,moteur"],
["F-B47-EGR","model","bmw,mini","s3,x3,x1,s1,s5,x5,s4,x2,x4,s2,s2c","rappel","critique",2017,2022,"Refroidisseur EGR — fuite de LDR et risque d'incendie","Odeur de liquide chaud, fumée blanche à l'échappement, baisse du niveau LDR, glycol, incendie.","Vérifier l'éligibilité VIN de la campagne refroidisseur EGR|Mettre le circuit sous pression et localiser la fuite|Contrôler la présence de LDR dans l'admission|Remplacer le refroidisseur par la référence révisée|Contrôler le FAP en aval","Refroidisseur EGR, joints, durites, FAP","P0401,P0402,P0217,P040B","Rappel BMW · NHTSA / KBA","depol,thermique,moteur"],
["F-BM-DC","model","bmw","ix,i4,i5,i7,ix1,ix3,ix3na","campagne","moyen",2021,2027,"Charge DC — limitation thermique batterie et préconditionnement","Charge rapide lente, puissance plafonnée, préconditionnement inefficace, courbe de charge.","Lire l'historique thermique de la batterie|Contrôler le débit de la pompe du circuit LDR|Appliquer la mise à jour gestion de charge|Tester sur borne haute puissance à froid et à chaud","Pompe LDR, échangeur, BMS, vanne de boucle","P0C00,P0AA6,P0D11","Campagne BMW Gen5","charge,hv,thermique,autonomie"],
["F-BM-IDRIVE","brand","bmw,mini","","panne","moyen",2017,2027,"iDrive — écran noir, reboot, navigation et caméra perdus","Écran figé, redémarrages, perte CarPlay, caméra de recul absente, head unit, MGU.","Relever version et journaux head unit|Contrôler alimentation et nappe vidéo|Appliquer la mise à jour logicielle|Contrôler la mémoire interne / eMMC|Remplacer le head unit si défaut persistant","Head unit, nappe vidéo, mémoire, TCU","U0101,U0121,B1000","Retour terrain BMW","tablette,telematique,camera,elec12"],
["F-NK-OTA","model","bmw","ix3na","tsb","moyen",2026,2027,"Neue Klasse — logiciel BMS, OTA et Panoramic iDrive","OTA interrompu, SOC figé, affichage panoramique figé, fonctions perdues, Gen6.","Relever version et journaux OTA|Contrôler la 12 V pendant la mise à jour|Re-flasher le BMS selon procédure|Réapprendre le SOC|Contrôler le module télématique et l'affichage","BMS, TCU, 12 V, Panoramic Vision","U0101,P0AA6,P0562,U0121","TSB BMW Neue Klasse","telematique,hv,tablette,elec12"],
["F-OM654-NOX","engine","mercedes","2.0 A200d","campagne","eleve",2018,2027,"OM654 — capteurs NOx, injecteur AdBlue et compteurs SCR","Voyant AdBlue, compte à rebours de non-redémarrage, perte de puissance, BlueTEC.","Lire valeurs des capteurs NOx amont/aval|Contrôler la cristallisation de l'injecteur AdBlue|Tester le débit de pompe|Remplacer puis réinitialiser les compteurs SCR","Capteurs NOx, injecteur AdBlue, pompe, réservoir","P20EE,P2201,P204F,P229F","Campagne Mercedes OM654","depol,injection"],
["F-OM651-CHAIN","engine","mercedes","2.2 116 CDI","panne","eleve",2017,2021,"OM651 — chaîne de distribution et patins","Claquement à froid, bruit côté distribution, ratés, chaîne OM651 CDI.","Contrôler l'allongement de chaîne|Inspecter patins et tendeur hydraulique|Remplacer le kit complet|Vérifier la pression d'huile","Kit chaîne OM651, tendeur, patins","P0016,P0017,P0341","TSB Mercedes OM651","distribution,moteur"],
["F-MB-48V","model","mercedes","classea,classeb,classec,classee,gla,glb,glc,gle,gls,cla,cle","campagne","eleve",2018,2027,"Alterno-démarreur 48 V / réseau de bord et DC-DC","Non-démarrage, voyant batterie, stop&start inopérant, EQ Boost, ISG, 48V.","Lire les codes du réseau 48 V et du DC-DC|Contrôler tension et SOH de la batterie 48 V|Vérifier l'éligibilité campagne alterno-démarreur|Contrôler masses et faisceau|Appliquer la mise à jour logicielle","Alterno-démarreur 48 V, batterie 48 V, DC-DC, masses","P0562,U0111,P0A7F,U0101","Campagne Mercedes 48 V","elec48,elec12,acoups"],
["F-MB-MBUX","brand","mercedes,smart","","panne","moyen",2018,2027,"MBUX / Hyperscreen — tactile inopérant, reboot et assistant vocal","Écran noir, tactile inerte, assistant vocal indisponible, Hyperscreen, OTA.","Relever version MBUX et journaux|Contrôler alimentation de la dalle et la nappe|Appliquer la mise à jour logicielle|Contrôler le module télématique|Remplacer la dalle si nécessaire","Dalle MBUX, module télématique, nappe vidéo","U0101,U0121,B1000","Retour terrain Mercedes","tablette,telematique,camera"],
["F-MB-9G","brand","mercedes","","tsb","moyen",2017,2027,"9G-Tronic — à-coups de convertisseur et huile « à vie »","À-coups à basse vitesse, vibrations en charge légère, passages brutaux, 9G, ATF.","Lire adaptations et température d'huile|Contrôler le niveau ATF à température normée|Appliquer la mise à jour TCU|Vidanger l'ATF selon intervalle révisé|Contrôler le convertisseur de couple","Convertisseur, ATF, TCU, échangeur","P0700,P1750,P0218","TSB Mercedes 9G","transmission,acoups,thermique"],
["F-MMA-CO2","model","mercedes","claev,glcev","campagne","moyen",2025,2027,"MMA 800 V — pompe à chaleur CO₂ et gestion thermique","Autonomie hivernale réduite, alerte thermique pack, chauffage faible, R744, CO₂.","Lire les codes du circuit thermique|Contrôler la charge de CO₂ et le compresseur|Tester les vannes de boucle et l'échangeur|Appliquer la mise à jour thermique|Revalider autonomie et charge DC","Pompe à chaleur CO₂, vannes, compresseur, BMS","P0C00,P0AA6,P0A7A","Campagne Mercedes MMA","thermique,hv,autonomie,charge"],
["F-G4FJ-LSPI","engine","hyundai,kia","1.6 T-GDi","tsb","eleve",2017,2023,"G4FJ / Theta — cliquetis LSPI et coussinets de bielle","Claquement sourd à chaud, limailles dans l'huile, perte de puissance, LSPI, bielle, Theta.","Analyser l'huile (présence de limailles)|Contrôler les compteurs de cliquetis|Vérifier l'éligibilité à la campagne moteur|Contrôler la pression d'huile|Utiliser l'huile normée anti-LSPI","Coussinets de bielle, piston, pompe à huile, turbo","P0301,P0521,P0234,P0300","Campagne Hyundai/Kia Theta · NHTSA","moteur,injection,suralim"],
["F-D4FE-FAP","engine","hyundai,kia","1.6 CRDi","campagne","moyen",2018,2025,"D4FE — FAP, EGR et logiciel de dépollution","Régénérations fréquentes, perte de puissance, voyant moteur, CRDi, DPF, EGR.","Lire charge de suie et ΔP FAP|Contrôler vanne EGR et refroidisseur|Appliquer la mise à jour logicielle FAP|Vérifier le niveau d'huile (dilution)","FAP, vanne EGR, capteur ΔP, huile","P2002,P2463,P0401,P242F","Campagne Hyundai/Kia CRDi","depol,moteur,thermique"],
["F-ICCU","model","hyundai,kia,genesis","ioniq5,ioniq6,ioniq9,ev3,ev4,ev5,ev6,ev9,gv60,gv70","rappel","critique",2021,2027,"ICCU (E-GMP) — chargeur intégré et DC-DC défaillants","Non-charge AC et DC, 12 V à plat, immobilisation, ICCU, V2L, E-GMP.","Lire les codes ICCU et l'état du DC-DC|Contrôler la tension 12 V après repos|Vérifier l'éligibilité VIN de la campagne ICCU|Remplacer l'ICCU et la 12 V selon procédure|Contrôler le fusible HV et réinitialiser","ICCU, DC-DC, batterie 12 V, fusible HV","P1B77,P0AA6,U0111,P0562,P0D11","Rappel Hyundai/Kia E-GMP · NHTSA","charge,elec12,hv"],
["F-KONA-BAT","model","hyundai","kona-1,ioniq","rappel","critique",2018,2022,"Batterie haute tension — cellules et risque d'incendie en charge","Odeur inhabituelle, perte d'autonomie brutale, alerte batterie, incendie, LG Energy.","Vérifier l'éligibilité VIN de la campagne batterie|Lire delta de cellules et températures|Appliquer la limitation de charge logicielle provisoire|Remplacer modules ou pack selon campagne|Ne pas charger à 100 % avant intervention","Modules batterie HV, BMS, contacteurs","P0AA6,P0AFA,U0111","Rappel Hyundai Kona / Ioniq EV · NHTSA","hv,charge,autonomie"],
["F-HK-DCT","brand","hyundai,kia","","tsb","moyen",2017,2027,"DCT7 / DCT6 hybride — à-coups et apprentissage d'embrayage","Broutage au démarrage, hésitation en reprise, à-coups à chaud, DCT, double embrayage.","Lire adaptations et température|Appliquer la mise à jour TCU|Exécuter l'apprentissage constructeur|Contrôler huile et actionneur d'embrayage|Essai de validation","Embrayages DCT, actionneur, TCU, huile","P0700,P1750,P0218","TSB Hyundai/Kia DCT","transmission,acoups"],
["F-HK-SEAT","brand","hyundai,kia,genesis","","panne","info",2017,2027,"Siège — réglage électrique, nappe de présence et voyant airbag","Réglage inopérant, voyant airbag passager, détection d'occupant erratique, occupancy.","Lire défauts module siège et airbag|Contrôler la nappe et le connecteur jaune sous siège|Tester moteurs et fins de course|Contrôler le capteur de présence passager|Réinitialiser après intervention","Nappe occupancy, moteurs de siège, connectique SRS","B1000,B0072,B0081","Retour terrain Hyundai/Kia","siege,airbag,ceinture"],
["F-TOY-PUMP","model","toyota,lexus","rav4-5,rav4-6,corolla,corollats,chr-1,chr-2,nx,ux,es,camry,prius","rappel","critique",2018,2021,"Pompe à carburant basse pression — calage et non-démarrage","Calage en roulant, démarrage impossible, ralenti instable, Denso, pompe BP.","Vérifier l'éligibilité VIN de la campagne pompe|Lire la pression rail au démarrage|Contrôler relais et alimentation de pompe|Remplacer la pompe BP par la référence révisée","Pompe carburant BP, relais, filtre","P0087,P0230,P0627","Rappel Toyota/Lexus · NHTSA","injection,moteur"],
["F-TOY-HSD","engine","toyota,lexus","2.5 Hybrid","tsb","moyen",2018,2027,"HSD — pompe à eau électrique d'onduleur et filtre HV","Voyant système hybride, surchauffe onduleur, perte de puissance, HSD, inverter.","Lire les codes onduleur et la température|Contrôler le débit de la pompe à eau électrique|Vérifier niveau et état du LDR onduleur|Nettoyer le filtre de refroidissement HV|Remplacer la pompe si débit insuffisant","Pompe à eau onduleur, LDR, onduleur, filtre HV","P0A93,P0A7A,P0AA6","TSB Toyota HSD","thermique,hv,autonomie"],
["F-TOY-12V","engine","toyota,lexus","1.5 Hybrid","tsb","moyen",2020,2027,"Hybride — batterie 12 V AGM et courant de veille","Non-démarrage après immobilisation prolongée, voyants multiples, 12V AGM, READY.","Mesurer le courant de repos|Contrôler le SOH de la 12 V (AGM)|Vérifier la charge DC-DC en mode READY|Remplacer par référence AGM","Batterie 12 V AGM, DC-DC, masses","P0562,U0111,U0101","TSB Toyota Hybrid","elec12,hv"],
["F-BZ4X-WHEEL","model","toyota,subaru","bz4x,solterra","rappel","critique",2022,2024,"Boulons de roue — desserrage et risque de perte de roue","Bruit de roue, vibration, risque de perte de roue, moyeu, boulon, e-TNGA.","Vérifier l'éligibilité VIN de la campagne|Contrôler le couple de serrage des boulons|Remplacer les boulons par la référence révisée avec rondelle|Reprendre le serrage au couple constructeur","Boulons de roue, moyeu","C1365","Rappel Toyota bZ4X / Subaru Solterra","train,geometrie,acoups"],
["F-NIS-CVT","brand","nissan","","tsb","eleve",2017,2024,"CVT Xtronic — broutage, surchauffe et huile NS-3","Broutage à basse vitesse, perte de puissance, message transmission, JATCO, CVT.","Lire température et codes CVT|Contrôler l'état de l'huile NS-3 et le niveau|Appliquer la mise à jour TCU|Contrôler chaîne et poulies|Remplacer l'huile selon intervalle révisé","CVT, huile NS-3, échangeur, poulies","P0700,P1750,P0218","TSB Nissan Xtronic","transmission,acoups,thermique"],
["F-LEAF-SOH","model","nissan","leaf-2,leaf-3","panne","eleve",2017,2027,"Leaf — dégradation accélérée du SOH et charge bridée","Perte d'autonomie importante, charge rapide bridée, barres de capacité, Rapidgate.","Lire SOH et nombre de charges rapides|Contrôler le delta de cellules|Vérifier l'éligibilité garantie batterie|Contrôler la thermique (refroidissement passif ou actif)","Modules batterie, BMS, chargeur","P0AA6,P0AFA,P0C00","Retour terrain / garantie Nissan Leaf","hv,autonomie,charge,thermique"],
["F-HON-DIL","engine","honda","1.5 VTEC Turbo","tsb","eleve",2017,2024,"1.5 VTEC Turbo — dilution d'huile par le carburant","Niveau d'huile qui monte, odeur d'essence, cliquetis, usure anormale, trajets courts à froid.","Contrôler niveau et odeur de l'huile|Appliquer la mise à jour injection/thermique|Réduire l'intervalle de vidange en usage urbain froid|Contrôler thermostat et montée en température","Injecteurs, thermostat, huile moteur","P0128,P0172,P0521","TSB Honda 1.5T","injection,moteur,thermique"],
["F-HON-ENY","model","honda","eny1","tsb","moyen",2024,2027,"e:N — charge DC bridée et logiciel BMS","Charge rapide plafonnée bien sous le maximum, courbe de charge, e:Ny1.","Lire l'historique thermique de charge|Contrôler la boucle LDR batterie|Appliquer la mise à jour BMS|Tester sur borne 150 kW|Revalider la courbe de charge","BMS, boucle LDR, logiciel, OBC","P0C00,P0AA6,P0D11","TSB Honda e:N","charge,hv,thermique"],
["F-MAZDA-D","engine","mazda","2.2 Skyactiv-D","panne","eleve",2017,2022,"Skyactiv-D 2.2 — calamine admission et dilution d'huile","Perte de puissance, fumée, niveau d'huile qui monte, FAP colmaté, calamine, Skyactiv.","Lire charge de suie et régénérations|Endoscopie admission (calamine importante)|Contrôler les injecteurs et la dilution|Décalaminage et remplacement FAP si nécessaire|Vidange rapprochée en usage urbain","Admission, EGR, FAP, injecteurs, huile","P2002,P2463,P0401,P0521","Retour terrain Mazda Skyactiv-D","depol,moteur,injection"],
["F-MAZ-6E","model","mazda","m6e","tsb","moyen",2025,2027,"Mazda6e — tablette, OTA et 12 V","Écran noir après OTA, reboots, perte CarPlay, 12V faible, head unit.","Relever version et journaux head unit|Contrôler alimentation et nappe|Re-flasher la mise à jour|Contrôler la 12 V et le DC-DC|Remplacer le head unit si persistant","Head unit, TCU, 12 V","U0101,P0562,U0121","TSB Mazda","tablette,telematique,elec12"],
["F-SUZ-48","engine","suzuki","1.4 Boosterjet Hybrid","tsb","info",2020,2027,"SHVS 48 V / 12 V — batterie lithium et à-coups au redémarrage","Stop&start inopérant, à-coups, voyant hybride, SHVS, ISG, mild hybrid.","Lire codes SHVS|Contrôler la tension et le SOH de la batterie lithium|Vérifier l'ISG et sa courroie|Appliquer la mise à jour logicielle","Batterie 48 V / 12 V, ISG, DC-DC, courroie","P0A7F,P0562,U0111","TSB Suzuki SHVS","elec48,acoups,elec12"],
["F-SUZ-EVT","model","suzuki","evitara","panne","eleve",2025,2027,"e Vitara — infiltration au connecteur HV arrière","Alerte isolement après pluie ou lavage haute pression, isolement, HEARTECT-e.","Lire la valeur d'isolement par branche|Inspecter le connecteur HV arrière (humidité, oxydation)|Sécher, contrôler joints et passe-câbles|Remplacer joints / connecteur|Revalider l'isolement","Connecteur HV, joints, faisceau, pack","P0AA6,P0AFA","Retour terrain Suzuki","hv,carrosserie"],
["F-FORD-WET","engine","ford","1.0 EcoBoost","panne","critique",2017,2023,"EcoBoost 1.0 — courroie humide et intrusion de liquide de refroidissement","Surchauffe, perte de LDR, fumée blanche, ratés après stationnement, casse moteur, wet belt.","Contrôler l'état de la courroie humide (débris, largeur)|Test de pression du circuit de refroidissement|Endoscopie cylindres (intrusion LDR)|Remplacer kit courroie + pompe à eau|Contrôler joint de culasse et chemises","Kit courroie humide, pompe à eau, joint de culasse","P0300,P0301,P0217,P0016,P0521","TSB Ford EcoBoost","distribution,thermique,moteur"],
["F-FORD-EB-CHAIN","engine","ford","2.0 EcoBlue","tsb","critique",2017,2027,"2.0 EcoBlue — chaîne de distribution : 240 000 → 160 000 km","Claquement à froid, allongement de chaîne, décalage de calage, casse moteur, EcoBlue Panther.","Contrôler l'allongement de chaîne et le tendeur hydraulique|Écouter le bruit à froid côté distribution|Vérifier pression et état d'huile (dilution)|Appliquer l'intervalle révisé 160 000 km / 8 ans|Remplacer kit chaîne + tendeur + guides","Kit chaîne, tendeur hydraulique, guides, pompe à huile","P0016,P0017,P0521,P0341","TSB Ford EcoBlue · révision d'intervalle","distribution,moteur"],
["F-FORD-EB-PUMP","engine","ford","2.0 EcoBlue","tsb","eleve",2017,2027,"2.0 EcoBlue — courroie de pompe à huile en bain d'huile","Bruit de courroie, pression d'huile basse, claquement, fumée, débris carter.","Contrôler la courroie de pompe à huile et les débris dans le carter|Mesurer la pression d'huile à chaud|Test des débits de retour injecteurs|Remplacer courroie + pompe selon TSB|Vidange et rinçage du circuit","Courroie pompe à huile, pompe, injecteurs","P0087,P0521,P0201","TSB Ford EcoBlue","moteur,injection,distribution"],
["F-KUGA-BAT","model","ford","kuga","rappel","critique",2020,2022,"Kuga PHEV — batterie haute tension et risque d'incendie en charge","Odeur de chaud, fumée, véhicule qui ne démarre plus, alerte batterie HV, incendie.","Vérifier l'éligibilité VIN|Ne pas recharger avant intervention|Lire codes BMS et isolement HV|Remplacer les modules ou le pack selon campagne|Contrôler le connecteur de charge","Pack batterie HV, BMS, contacteurs","P0AA6,P0AFA,U0111","Rappel Ford Kuga PHEV · Safety Gate","hv,charge"],
["F-FORD-PS","brand","ford","","tsb","eleve",2017,2023,"PowerShift — broutage d'embrayage sec","Vibrations au démarrage, à-coups basse vitesse, patinage, DPS6, double embrayage.","Lire les adaptations d'embrayage|Appliquer apprentissage et mise à jour TCU|Contrôler le kit d'embrayage sec et la fourchette|Remplacer le kit si hors tolérance","Kit embrayage, fourchette, TCU, actionneur","P0700,P1750,P0218","TSB Ford PowerShift · NHTSA","transmission,acoups"],
["F-FORD-SYNC","brand","ford","","panne","moyen",2017,2027,"SYNC — écran figé, connexion perdue et caméra absente","Écran noir, Bluetooth qui décroche, caméra de recul absente, reboot, APIM, SYNC3 SYNC4.","Relever version SYNC et journaux|Contrôler l'APIM et son alimentation|Appliquer la mise à jour logicielle|Contrôler le faisceau caméra|Remplacer l'APIM si défaut persistant","APIM, dalle, faisceau caméra","U0101,U0121,B1000","Retour terrain Ford","tablette,telematique,camera"],
["F-TESLA-MCU","model","tesla","model3,modely,models,modelx","rappel","eleve",2017,2023,"MCU — usure de la mémoire eMMC","Écran tactile noir, lenteurs, perte caméra de recul, Bluetooth instable, eMMC, MCU1 MCU2.","Lire les journaux de redémarrage du MCU|Contrôler la santé de l'eMMC en mode service|Vérifier l'éligibilité campagne MCU|Remplacer ou mettre à niveau le MCU","MCU, mémoire eMMC","U0101,U0121","Rappel Tesla MCU · NHTSA","tablette,telematique,camera"],
["F-TESLA-PHANTOM","model","tesla","model3,modely,models,modelx","campagne","eleve",2021,2027,"Freinage fantôme en Autopilot / ACC","Freinages intempestifs sans obstacle, désengagements ACC, alertes collision injustifiées, FSD.","Relever version logicielle et journaux|Contrôler propreté et calibration des caméras|Appliquer la mise à jour logicielle|Recalibrer les caméras après remplacement de pare-brise","Caméras, calculateur ADAS","U0121,U0101,C1A00","Campagne Tesla · NHTSA","adas,camera,freinage"],
["F-TESLA-SUSP","model","tesla","model3,modely","panne","moyen",2019,2024,"Bras de suspension avant — usure prématurée des rotules","Claquement avant sur bosses, usure irrégulière des pneus, jeu au volant, bras supérieur.","Contrôler le jeu des rotules et silentblocs|Inspecter les bras supérieurs avant|Remplacer les bras et reprendre la géométrie|Vérifier le couple des fixations de berceau","Bras avant, rotules, silentblocs, pneus","","Retour terrain Tesla / NHTSA","train,geometrie,acoups"],
["F-TESLA-HEAT","model","tesla","model3,modely,models,modelx,cyber","tsb","moyen",2020,2027,"Octovalve / pompe à chaleur — perte de chauffage et autonomie","Chauffage habitacle absent, autonomie hivernale réduite, charge lente à froid, octovalve.","Lire les codes du circuit thermique|Contrôler l'octovalve et les actionneurs|Vérifier la charge de fluide frigorigène|Appliquer la mise à jour logicielle thermique","Octovalve, pompe à chaleur, compresseur","P0C00,P0AA6,P0A7A","TSB Tesla thermal","thermique,autonomie,hv,charge"],
["F-TESLA-DOOR","model","tesla","model3,modely,models,modelx,cyber","panne","moyen",2017,2027,"Poignées / ouvrants — ouverture bloquée et 12 V faible","Porte qui ne s'ouvre plus, poignée qui ne sort pas, véhicule verrouillé, 12V Li-ion.","Contrôler la tension 12 V (cause la plus fréquente)|Lire les défauts des modules de porte|Tester l'actionneur de poignée|Utiliser l'alimentation de secours 12 V|Remplacer l'actionneur si nécessaire","Actionneur de poignée, 12 V, module de porte","B1000,P0562,U0100","Retour terrain Tesla","portes,cle,elec12"],
["F-VOLVO-BMS","model","volvo,polestar","ex30,ex40,ex90,es90,em90,ps2,ps3,ps4,ps5,ps6","rappel","eleve",2023,2027,"Logiciel BMS — surchauffe, limitation et charge bridée","Limitation de puissance, alerte batterie, charge bridée, EX30, SPA2, SEA.","Vérifier l'éligibilité VIN de la campagne logicielle|Lire températures et delta de cellules|Appliquer la mise à jour BMS|Contrôler la boucle de refroidissement et la pompe","BMS, pompe LDR, modules, OBC","P0AA6,P0C00,P0D11","Rappel Volvo EX30 · Safety Gate","hv,thermique,charge"],
["F-VOLVO-SPA","brand","volvo,polestar","","panne","info",2017,2027,"Sièges / SIPS — connectique sous siège et voyant airbag","Voyant airbag, réglage de siège inopérant, détection d'occupant erratique, SIPS.","Lire défauts SRS et module de siège|Contrôler le connecteur jaune sous siège (oxydation)|Tester les moteurs de réglage|Contrôler le capteur de présence|Effacer après réparation","Connectique sous siège, moteurs, capteur occupancy","B1000,B0072,B0081","Retour terrain Volvo","siege,airbag,ceinture"],
["F-JLR-AIR","brand","landrover,jaguar","","panne","eleve",2017,2027,"Suspension pneumatique — fuites de coussins et compresseur","Véhicule affaissé après stationnement, message défaut suspension, hauteur incohérente.","Test de fuite au produit moussant sur coussins et raccords|Contrôler le temps de montée du compresseur|Lire les capteurs de hauteur|Remplacer coussin / compresseur selon diagnostic|Calibrer les hauteurs","Coussins, compresseur, capteurs hauteur, bloc vannes","C1A00,U0121,P0562","Retour terrain JLR","train,geometrie,elec12"],
["F-JLR-INGENIUM","engine","landrover,jaguar","2.0 D200","campagne","eleve",2017,2024,"Ingenium diesel — chaîne de distribution et équilibrage","Claquement à froid, bruit côté boîte, voyant moteur, Ingenium, chaîne.","Contrôler l'allongement de chaîne|Inspecter tendeur et guides|Vérifier la consommation d'huile|Remplacer le kit chaîne selon TSB","Kit chaîne, tendeur, guides, arbres d'équilibrage","P0016,P0017,P0341","TSB JLR Ingenium","distribution,moteur"],
["F-JLR-PT204","engine","landrover,jaguar","2.0 P250","panne","moyen",2017,2027,"Ingenium essence — chaîne, PCV et consommation d'huile","Bruit de chaîne à froid, niveau d'huile en baisse, ratés, Ingenium PT204.","Contrôler synchro AAC/vilo|Inspecter tendeur et guides|Contrôler PCV et séparateur d'huile|Mesurer la consommation sur 1 000 km","Kit chaîne, PCV, segments, bougies","P0016,P0300,P0521,P0171","Retour terrain JLR Ingenium","distribution,moteur,allumage"],
["F-PORSCHE-800","model","porsche","taycan,macane","campagne","eleve",2019,2027,"Charge DC et gestion thermique 800 V","Charge DC bridée, puissance limitée, alerte système électrique, 800V, Taycan Macan.","Lire l'historique thermique batterie|Contrôler la boucle LDR et l'échangeur|Appliquer la mise à jour gestion de charge|Vérifier l'isolement HV 800 V et les contacteurs","BMS, échangeur, OBC 800 V, contacteurs","P0C00,P0AA6,P0D11","Campagne Porsche 800 V","charge,hv,thermique"],
["F-PDK","engine","porsche","3.0 Carrera","tsb","moyen",2019,2027,"PDK — à-coups et surchauffe de mécatronique","À-coups à basse vitesse, message boîte chaude, passages hésitants, PDK, Doppelkupplung.","Lire les adaptations d'embrayage|Contrôler niveau et état d'huile PDK|Appliquer la mise à jour TCU|Contrôler le refroidissement de boîte","Mécatronique PDK, huile, échangeur","P0700,P1750,P0218","TSB Porsche PDK","transmission,acoups,thermique"],
["F-MG-12V","model","mg","mg4,zsev,mg3,hs,cyberster,mg5,mgs5,marvelr","campagne","eleve",2020,2027,"MG — décharge 12 V, DC-DC et écran figé","12 V à plat après 48 h, véhicule non démarrable, écrans figés, iSMART.","Mesurer le courant de repos|Tester la sortie du DC-DC|Appliquer la mise à jour logicielle|Remplacer la 12 V si SOH dégradé|Contrôler le module télématique","DC-DC, batterie 12 V, télématique","U0111,P0562,U0101","Campagne MG","elec12,telematique,tablette"],
["F-BYD-CTB","model","byd","seal,sealion7,atto3,dolphin,atto2,tang,han,dolphin-surf","tsb","moyen",2023,2027,"Blade LFP / CTB — capteurs de cellule et équilibrage","Delta cellules après charge rapide, charge plafonnée, SOC imprécis, Blade, LFP.","Lire delta de cellules et températures|Cycle lent complet d'équilibrage|Contrôler les capteurs de cellule|Appliquer la mise à jour BMS|Revalider charge DC et estimation SOC","BMS, capteurs de cellule, modules Blade","P0AA6,P0AFA,P0C00","TSB BYD Blade","hv,charge,autonomie"],
["F-BYD-DMI","model","byd,denza","sealu,seal6,d9","tsb","moyen",2024,2027,"DM-i / DM-o — pompe à huile du moteur thermique","Voyant pression d'huile, claquement à chaud, mode dégradé, DM-i, hybride série.","Mesurer la pression d'huile moteur à chaud|Contrôler crépine et pompe|Vidange et remplacement pompe si hors cote|Contrôler le fonctionnement en mode série","Pompe à huile, crépine, moteur thermique","P0087,P0521,P0300","TSB BYD DM-i","moteur,injection"],
["F-MJT","engine","jeep,fiat,alfa","1.6 MultiJet","panne","eleve",2017,2022,"MultiJet — injecteurs et FAP","Claquement, fumée, ratés, régénérations fréquentes, JTDm, MultiJet II.","Test des débits de retour injecteurs|Banc injecteurs si hors tolérance|Contrôler le ΔP FAP|Remplacer et coder les injecteurs (IMA)","Injecteurs, FAP, pompe HP, rail","P0201,P0202,P2002,P0087","Retour terrain MultiJet","injection,depol,moteur"],
["F-500E-OBC","model","fiat,abarth","500e,600,500e,600e","campagne","eleve",2020,2027,"500e / 600e — chargeur embarqué AC","Non-charge AC, charge interrompue, voyant charge, OBC, mode 2.","Lire les codes OBC|Tester sur plusieurs bornes AC|Contrôler le câble mode 2 (CP/PP)|Remplacer l'OBC selon campagne","OBC, connecteur, faisceau HV, câble mode 2","P0D11,P0C00,P0AA6","Campagne Stellantis 500e","charge,hv"],
["F-ALFA-ELEC","model","alfa","giulia,stelvio,tonale,junior,giulietta","tsb","moyen",2017,2027,"Électronique de bord — 12 V, masses et défauts multiples","Défauts multiples au tableau de bord, démarrage aléatoire, direction assistée intermittente.","Contrôler le SOH et la tension de la 12 V|Vérifier les masses (points de corrosion)|Lire les défauts CAN|Appliquer les mises à jour calculateurs","Batterie 12 V, masses, faisceau CAN, EPS","U0101,U0121,P0562,C1A00","TSB Alfa Romeo","elec12,geometrie,telematique"],
["F-CN-OTA","brand","xpeng,nio,zeekr,leapmotor,omoda,jaecoo,ora,lynk,chery,gwm,dongfeng,maxus,byd,mg,smart,forthing,hongqi,vinfast,denza","","tsb","moyen",2022,2027,"OTA — mise à jour incomplète, ADAS et écran indisponibles","Perte de fonctions ADAS après OTA, écran figé, calibration caméra perdue, 12 V faible.","Relever version logicielle et journaux OTA|Re-flasher le calculateur si mise à jour incomplète|Recalibrer caméras et radar|Contrôler la 12 V (sensibilité aux coupures)|Vérifier la connexion du module télématique","Calculateur ADAS, 12 V, caméras, TCU","U0121,U0101,P0562,C1A00","TSB constructeurs CN","telematique,adas,camera,tablette,elec12"],
["F-JEEP-WGS","model","jeep","wagoneer","panne","eleve",2024,2027,"Wagoneer S — décharge 12 V et OTA en échec","12 V faible, OTA interrompu, véhicule non démarrable, STLA Large.","Mesurer le courant de repos|Contrôler SOH 12 V et DC-DC|Re-flasher l'OTA échoué|Contrôler le module télématique|Remplacer la 12 V si dégradée","12 V, DC-DC, TCU","P0562,U0101,U0111","Retour terrain Jeep","elec12,telematique,hv"],
["F-SMART-5","model","smart","s5,s3,s1","tsb","moyen",2025,2027,"#5 / SEA 800 V — préconditionnement hivernal et charge","Préconditionnement absent, charge DC lente à froid, PMA, SEA.","Lire les codes du circuit thermique|Contrôler pompe à chaleur et vannes|Vérifier la commande de préconditionnement|Appliquer la mise à jour|Revalider en conditions froides","Pompe à chaleur, vannes, BMS","P0C00,P0AA6,P0D11","TSB smart SEA / PMA","thermique,charge,hv"],
["F-EXOTIC-12V","brand","ferrari,lamborghini,mclaren,aston,bentley,rolls,maserati,bugatti,lotus","","panne","moyen",2017,2027,"Super-sportives — décharge 12 V, mainteneur et télématique","Batterie à plat après immobilisation, défauts multiples, mainteneur de charge, lithium 12V.","Mesurer le courant de repos (télématique, alarme)|Contrôler le mainteneur et la batterie 12 V|Vérifier les masses et les relais de coupure|Recharger avec mainteneur constructeur|Effacer les défauts et revalider","Batterie 12 V, mainteneur, télématique, masses","P0562,U0101,B1000","Protocole atelier premium","elec12,telematique,cle"],
["F-EXOTIC-DCT","brand","ferrari,lamborghini,mclaren,aston,maserati,bugatti","","tsb","moyen",2017,2027,"Boîtes double embrayage haute performance — usure et apprentissage","À-coups à froid, patinage en usage sportif, compteurs d'usure, DCT, F1, LDF, PDK.","Lire compteurs d'usure et température d'embrayage|Contrôler l'huile et l'échangeur|Appliquer l'apprentissage constructeur|Contrôler actionneurs et accumulateur|Essai routier progressif","Embrayages, mécatronique, huile, accumulateur","P0700,P1750,P0218","Protocole atelier premium","transmission,acoups,thermique"],
["F-QUAD-CTRL","brand","aixam,ligier,fiat,citroen","","panne","moyen",2017,2027,"Quadricycles — variateur, contrôleur et batterie de traction","Perte de puissance, à-coups, refus de charge, variateur, contrôleur, L6e L7e.","Lire les codes du contrôleur|Contrôler le variateur / la courroie (thermique)|Mesurer tension et SOH du pack|Vérifier contacteurs et chargeur|Essai en charge","Contrôleur, variateur, pack, chargeur, contacteurs","P0AA6,P0C00,U0111","Protocole atelier quadricycle","hv,charge,transmission,elec12"],
["F-LCV-SCR","brand","peugeot,citroen,ds,opel,fiat,renault,nissan,ford,volkswagen,mercedes,toyota,iveco,man,isuzu,maxus","","campagne","eleve",2017,2027,"Utilitaires — SCR AdBlue, FAP et usage urbain intensif","Compte à rebours AdBlue, régénérations incomplètes, mode dégradé, utilitaire, LCV.","Lire compteurs SCR et charge de suie|Contrôler qualité d'AdBlue et cristallisation|Vérifier les cycles de régénération en usage réel|Régénération forcée puis essai chargé|Réinitialiser compteurs et adaptations","Pompe AdBlue, injecteur, FAP, capteurs NOx","P20EE,P204F,P2002,P2463,P2201","Campagnes multi-constructeurs LCV","depol,injection,moteur"],
["F-TAKATA","brand","ALL","","rappel","critique",2017,2021,"Airbags Takata — générateur de gaz susceptible de rupture","Voyant airbag, campagne ouverte au VIN, risque de projection métallique, inflateur, Takata.","Vérifier impérativement l'éligibilité VIN (Rappel Conso / NHTSA)|Ne pas désactiver l'airbag sans procédure constructeur|Remplacer l'inflateur par la référence de campagne|Effacer les défauts et contrôler le voyant","Inflateur airbag conducteur/passager","","Rappel Takata · Rappel Conso / NHTSA","airbag,ceinture"],
["F-BELT","brand","ALL","","rappel","eleve",2017,2026,"Ceintures — prétensionneur ou ancrage non conforme","Voyant airbag, ceinture qui ne se verrouille pas, campagne ouverte au VIN, ancrage.","Vérifier l'éligibilité VIN sur Rappel Conso / Safety Gate|Contrôler l'ancrage et le couple de serrage|Tester le verrouillage de l'enrouleur|Lire les défauts prétensionneur|Remplacer l'ensemble selon campagne","Prétensionneur, enrouleur, ancrage, boucle","B0072,B1000,B0081","Rappel Conso / Safety Gate","ceinture,airbag,siege"],
["F-ADAS-CAL","brand","ALL","","tsb","moyen",2017,2027,"ADAS — recalibration caméra / radar obligatoire après intervention","Défaut calibration, freinage intempestif, régulateur inopérant après pare-brise ou géométrie.","Lire les défauts de calibration|Contrôler propreté et fixation du support caméra|Effectuer la calibration statique puis dynamique|Contrôler géométrie et hauteur de caisse","Caméra pare-brise, radar, support, calculateurs","U0121,U0101,C1A00","TSB multi-constructeurs ADAS","adas,camera,geometrie,freinage"],
["F-TPMS","brand","ALL","","panne","info",2017,2027,"TPMS — capteurs de pression et apprentissage","Voyant pression pneus, valeur absente, alerte après changement de roues, TPMS 433 MHz.","Lire les identifiants de capteurs et leur batterie|Contrôler la pression à froid|Effectuer l'apprentissage des capteurs|Remplacer le capteur défaillant","Capteurs TPMS, antenne, calculateur","C1365","Retour terrain multi-marques","train,geometrie,telematique"],
["F-EV-TRAP","brand","ALL","","campagne","eleve",2024,2027,"Trappe de charge — verrou, joints et infiltration d'eau","Verrou bloqué, eau dans la trappe, charge refusée par sécurité, CCS, Type 2.","Inspecter verrou, joints et évacuations|Contrôler l'actuateur et son faisceau|Sécher et tester l'isolement|Appliquer la campagne verrou / joints|Revalider charge AC et DC","Actuateur verrou, joints, connecteur","B1000,P0D11,P0AA6","Campagnes multi-constructeurs EV","charge,portes,carrosserie,hv"],
["F-OTA-FAIL","brand","ALL","","tsb","moyen",2024,2027,"OTA — échec de mise à jour et retour atelier","Véhicule bloqué après OTA, fonctions perdues, écran figé, brique logiciel, eSIM.","Relever version et journaux OTA|Contrôler la 12 V pendant la mise à jour|Re-flasher selon procédure constructeur|Réinitialiser les calculateurs concernés|Valider par essai complet","TCU, head unit, calculateurs, 12 V","U0101,U0121,P0562","TSB multi-constructeurs OTA","telematique,tablette,elec12"],
["F-EV-12V-LI","brand","ALL","","campagne","eleve",2023,2027,"Batterie 12 V lithium — décharge profonde et non-démarrage","Véhicule non démarrable après immobilisation, 12 V Li-ion, veille, DC-DC, BMS 12V.","Mesurer le courant de repos après veille complète|Lire SOH et tension de la 12 V lithium|Contrôler la stratégie de recharge DC-DC|Appliquer la campagne logicielle|Remplacer la 12 V si dégradée","Batterie 12 V Li-ion, DC-DC, BMS","P0562,U0111,P0A7F","Campagnes EV multi-constructeurs","elec12,hv,telematique"]
];

/* ═══ PROTOCOLES TRANSVERSAUX CONDITIONNELS ═══
   [id, domaines, nature, sévérité, titre, symptômes, protocole|…, organes, DTC, condition] */
var rules = [
["DR-MOT1","moteur","panne","eleve","Consommation d'huile — segmentation, PCV et joints de queues","Baisse de niveau, fumée bleue, dépôt sur bougies, blow-by, huile.","Quantifier la consommation sur 1 000 km|Contrôler séparateur d'huile et dépressurisation carter|Endoscopie cylindres (rayures, glaçage)|Mesurer compressions et blow-by|Contrôler joints de queues et turbo","Segments, PCV, joints de queues, turbo, huile","P0300,P0521,P0171","ice"],
["DR-MOT2","moteur,thermique","panne","critique","Joint de culasse / intrusion de liquide de refroidissement","Surchauffe, LDR qui disparaît, fumée blanche persistante, mayonnaise, glycol.","Test de pression du circuit à froid|Recherche de CO₂ dans le vase d'expansion|Endoscopie cylindres (traces de lavage)|Contrôle du plan de joint et du serrage|Analyse d'huile (présence de glycol)","Joint de culasse, chemises, culasse, échangeur","P0217,P0300,P0301","ice"],
["DR-CHAIN","distribution,moteur","tsb","eleve","Chaîne de distribution — allongement, tendeur et guides","Claquement métallique à froid, défaut corrélation vilo/AAC, démarrage difficile.","Contrôler synchro à l'oscilloscope|Mesurer décalage de phase et allongement|Inspecter tendeur hydraulique, patins et guides|Vérifier la pression d'huile (tendeur alimenté)|Remplacer le kit complet et recaler","Kit chaîne, tendeur, patins, guides, pignons","P0016,P0017,P0011,P0335","chain"],
["DR-WET","distribution,moteur","rappel","critique","Courroie en bain d'huile — dégradation et colmatage de crépine","Bruit de courroie, débris dans l'huile, voyant pression huile, wet belt.","Mesurer la largeur de courroie au gabarit|Déposer le carter et inspecter la crépine|Contrôler la pression d'huile à chaud|Remplacer kit courroie + pompe + crépine|Vidange huile strictement normée et rinçage","Kit courroie humide, pompe à huile, crépine, tendeur","P0016,P0521,P0087,P0341","wet"],
["DR-DRY","distribution","tsb","eleve","Courroie de distribution sèche — double échéance km et années","Bruit de courroie, fissures, usure des galets, risque de rupture.","Contrôler état, tension et alignement|Inspecter galets, tendeur et pompe à eau|Vérifier absence de fuite d'huile sur la courroie|Respecter km ET années|Remplacer kit complet + pompe à eau","Kit courroie, galets, tendeur, pompe à eau","P0016,P0017","dry"],
["DR-INJD","injection,moteur","panne","eleve","Injecteurs diesel — débits de retour et codage","Claquement, fumée, ratés, démarrage difficile, common rail, IMA IQA.","Lire corrections de débit par cylindre|Test des débits de retour à chaud et au démarrage|Banc injecteurs si hors tolérance|Remplacer et coder les injecteurs|Contrôler filtre et qualité carburant","Injecteurs, joints d'embase, filtre, rail","P0201,P0202,P0203,P0204,P0087","diesel"],
["DR-INJE","injection,allumage","panne","eleve","Injection directe essence — calamine admission et injecteurs","Ratés à froid, ralenti instable, cliquetis, LSPI, calamine, DI.","Lire corrections et compteurs de ratés|Endoscopie soupapes d'admission|Contrôler étanchéité des injecteurs DI|Décalaminage puis réapprentissage|Vérifier carburant et huile anti-LSPI","Injecteurs DI, soupapes, joints, PCV","P0300,P0301,P0171,P0201","petrol"],
["DR-HP","injection","panne","critique","Pompe haute pression — pression rail insuffisante","Démarrage difficile, mode dégradé, à-coups en charge, calage, HP.","Lire pression rail consigne/réel au démarrage et en charge|Contrôler alimentation BP et filtre|Test débits de retour|Contrôler régulateur / vanne de dosage|Remplacer la pompe HP et rincer si limailles","Pompe HP, régulateur, vanne de dosage, rail","P0087,P0088,P0191,P025A","ice"],
["DR-ALLE","allumage","panne","moyen","Bougies / bobines essence — ratés d'allumage","À-coups, voyant moteur clignotant, perte de puissance, surconsommation, misfire.","Lire compteurs de ratés par cylindre|Permuter bobines et bougies pour localiser|Contrôler écartement, aspect et couple|Mesurer compressions si ratés persistants|Respecter l'intervalle bougies (iridium inclus)","Bougies, bobines, faisceau, injecteurs","P0300,P0301,P0302,P0303,P0304","petrol"],
["DR-ALLD","allumage,elec12","panne","moyen","Préchauffage diesel — bougies et boîtier de commande","Démarrage difficile à froid, fumée blanche, voyant préchauffage, glow plug.","Contrôler la résistance de chaque bougie|Tester le boîtier / relais et son alimentation|Vérifier la 12 V au démarrage|Lire défauts et temps de préchauffage|Remplacer par jeu complet","Bougies de préchauffage, boîtier, relais, 12 V","P0380,P0671,P0672,P0673","diesel"],
["DR-TURBO","suralim,moteur","panne","eleve","Turbo — géométrie variable, wastegate et fuites d'air","Sifflement anormal, perte de puissance, mode dégradé, fumée, boost.","Lire pression de suralimentation consigne/réel|Tester l'actionneur GAV / wastegate et sa course|Recherche de fuite au générateur de fumée|Contrôler jeux et alimentation d'huile|Vérifier le ΔP FAP en aval","Turbo, GAV, wastegate, durites, échangeur","P0299,P0234,P2263,P00AF","turbo"],
["DR-TACT","suralim,elec12","panne","eleve","Actuateur de turbo électrique / wastegate pilotée","P00AF, puissance limitée, sifflement, actuateur, position incohérente.","Lire position consigne/réel de l'actuateur|Tester alimentation et masse|Contrôler la course mécanique|Remplacer l'actuateur et réapprendre","Actuateur turbo, faisceau, turbo","P00AF,P0299,P0234","turbo"],
["DR-EGR","depol,moteur","panne","eleve","Vanne EGR et refroidisseur — encrassement et fuite","Perte de puissance bas régime, fumée, LDR qui baisse, EGR, caloportage.","Lire position EGR consigne/réel et débit calculé|Mettre le circuit LDR sous pression|Contrôler encrassement refroidisseur et mélangeur|Nettoyer ou remplacer puis réinitialiser|Vérifier l'impact sur le FAP","Vanne EGR, refroidisseur, capteur, joints","P0401,P0402,P0490,P040B","egr"],
["DR-FAP","depol","panne","eleve","FAP / GPF — colmatage et régénérations incomplètes","Régénérations rapprochées, perte de puissance, dilution d'huile, DPF, GPF, suie.","Lire charge de suie, cendres et ΔP|Compter régénérations et distance moyenne|Contrôler niveau et odeur d'huile|Régénération forcée puis essai long|Remplacer si irréversible et réinitialiser","FAP/GPF, capteur ΔP, sondes température","P2002,P2463,P246C,P242F","dpf"],
["DR-DPFS","depol","panne","moyen","Capteur de pression différentielle FAP — dérive","Régénérations anormales, P2463 sans colmatage réel, capteur ΔP.","Comparer ΔP mesuré et valeur capteur|Contrôler les tuyaux de prise (fissure, bouchon)|Tester le capteur sous pression connue|Remplacer capteur et réinitialiser","Capteur ΔP, tuyaux, FAP","P2463,P2002,P2452","diesel"],
["DR-SCR","depol","campagne","eleve","SCR AdBlue — pompe, injecteur, capteurs NOx et qualité","Compte à rebours, voyant AdBlue, défaut rendement NOx, urée, DEF.","Lire P20EE / P204F et compteurs|Mesurer débit pompe et pression d'injection|Inspecter cristallisation|Contrôler qualité au réfractomètre|Remplacer et réinitialiser","Pompe AdBlue, injecteur, capteurs NOx, réservoir","P20EE,P204F,P207F,P2201,P229F","scr"],
["DR-AT","transmission,acoups","tsb","eleve","Boîte automatique — huile « à vie », adaptations et à-coups","À-coups, patinage, message boîte chaude, ATF, convertisseur, ZF, Aisin.","Lire codes TCU, adaptations, température|Contrôler niveau ATF à température normée|Analyser l'huile (particules, odeur)|Appliquer mise à jour TCU puis apprentissage|Vidanger selon intervalle révisé","ATF, mécatronique, convertisseur, échangeur","P0700,P1750,P0218","ice"],
["DR-CLUTCH","transmission,acoups","panne","eleve","Embrayage / volant bi-masse — broutage et vibrations","Vibrations au démarrage, broutage, bruit de grelot au ralenti, DMF, bi-masse.","Essai routier à froid et à chaud|Contrôler jeu et course de commande|Inspecter le volant bi-masse (jeu angulaire)|Mesurer usure disque et mécanisme|Remplacer kit + volant si hors tolérance","Kit embrayage, volant bi-masse, butée, commande","P0700,P1750","ice"],
["DR-DCTW","transmission,acoups","tsb","moyen","Embrayages DCT / e-DCS6 / DSG — usure et apprentissage","Compteurs d'usure élevés, à-coups à chaud, patinage, double embrayage.","Lire les compteurs d'usure d'embrayage|Contrôler température et adaptations|Appliquer l'apprentissage constructeur|Planifier le remplacement si seuil atteint","Embrayages DCT, mécatronique, huile","P0700,P1750,P0218","dct"],
["DR-EVRED","transmission,acoups","tsb","moyen","Réducteur électrique — bruit, jeu et huile","Ronflement, claquement en décélération, à-coups à la mise en couple, réducteur.","Écouter en montée / décélération|Contrôler jeu et supports moteur|Vérifier état et niveau d'huile de réducteur|Appliquer la mise à jour gestion de couple|Remplacer l'huile selon intervalle révisé","Réducteur, huile, supports, cardans","P0A7A","ev"],
["DR-NVH","acoups,train","panne","moyen","À-coups et vibrations — moteur, transmission ou roues","Vibrations volant / siège, à-coups en reprise, bruit sourd, NVH, balourd.","Qualifier la vibration (régime, vitesse, charge)|Contrôler supports moteur et boîte|Vérifier équilibrage, faux-rond jante et pneu|Contrôler cardans et rotules|Essai avec relevé vibratoire","Supports, cardans, roues, pneus, silentblocs","","all"],
["DR-BRAKE1","freinage","panne","eleve","Freinage — disques, plaquettes et corrosion","Vibrations à la pédale, bruit de frottement, distance allongée, voile, DTV.","Mesurer épaisseur et voile des disques au comparateur|Contrôler état et montage des plaquettes|Vérifier mobilité colonnettes et pistons|Contrôler le liquide (humidité, échéance)|Remplacer par essieu et roder","Disques, plaquettes, étriers, flexible, liquide DOT","C1365","all"],
["DR-BRAKE2","freinage,abs","panne","critique","Assistance de freinage — servofrein, dépression ou électrique","Pédale dure, assistance absente, voyant freinage, distance très allongée, iBooster.","Lire défauts bloc freinage et assistance|Contrôler dépression ou alimentation du servofrein|Tester le capteur de course de pédale|Vérifier 12 V et masses|Essai de freinage sécurisé","Servofrein, pompe à vide, capteur pédale, 12 V","C1365,P0562,U0121","all"],
["DR-EPB","freinage,elec12","panne","eleve","Frein de parking électrique — actuateurs et câbles","EPB ne serre / ne libère pas, voyant rouge, frein de parking, actuateur.","Lire défauts EPB et courant des actuateurs|Contrôler câbles et étriers arrière|Tester commande et alimentation|Remplacer l'actuateur puis réinitialiser","Actuateurs EPB, câbles, étriers","C1365,P0562,C0561","all"],
["DR-ABS","abs,freinage","panne","eleve","ABS / ESP — capteur de roue, couronne et bloc hydraulique","Voyant ABS/ESP, freinage bloquant une roue, régulateur inopérant.","Lire vitesses de roue en roulage (4 canaux)|Contrôler couronne / cible magnétique et entrefer|Vérifier faisceau (coupure, oxydation)|Contrôler bloc hydraulique et alimentation|Effacer puis essai de validation","Capteurs ABS, couronnes, faisceau, bloc hydraulique","C1365,C0035,C0040,U0121","all"],
["DR-AIRBAG","airbag,ceinture","panne","critique","SRS — connectique sous siège, prétensionneurs et calculateur","Voyant airbag, détection d'occupant erratique, ceinture non verrouillée, SRS.","Lire défauts SRS et compteurs de déploiement|Contrôler connecteurs jaunes sous siège|Mesurer résistance des circuits (procédure constructeur)|Vérifier prétensionneurs et ancrages|Effacer après réparation, jamais de shunt","Connectique SRS, prétensionneurs, nappe occupancy","B1000,B0072,B0081","all"],
["DR-SEAT","siege,airbag","panne","moyen","Sièges — réglages électriques, rails et nappe de présence","Réglage inopérant, siège qui bouge, voyant airbag passager, chauffage HS.","Lire défauts module de siège|Tester moteurs, fins de course, alimentation|Contrôler jeu des rails et serrage|Vérifier nappe de présence et chauffage|Réinitialiser / calibrer les positions","Moteurs de siège, rails, nappe, résistance chauffante","B1000,B0072,B0081","all"],
["DR-TRAIN","train,acoups","panne","eleve","Trains roulants — rotules, silentblocs, amortisseurs, roulements","Claquement sur bosses, tenue de route dégradée, bruit de roulement, usure pneus.","Contrôler jeu rotules et biellettes à la pince|Inspecter silentblocs triangles et berceau|Tester amortisseurs (rebond, fuite)|Écouter roulements en appui / délestage|Remplacer par paire puis géométrie","Rotules, silentblocs, amortisseurs, roulements, biellettes","","all"],
["DR-GEO","geometrie,train","panne","moyen","Géométrie / direction — parallélisme, chasse, capteur d'angle","Usure anormale pneus, volant décentré, véhicule qui tire, ESP intempestif.","Contrôler pressions et usure par plage|Mesurer parallélisme, carrossage et chasse|Vérifier hauteur de caisse et ressorts|Contrôler et calibrer le capteur d'angle volant|Contrôler crémaillère / colonne","Pneus, ressorts, crémaillère, capteur angle, biellettes","C1A00,U0121","all"],
["DR-EPS","geometrie,adas","panne","eleve","Direction assistée électrique — capteur de couple et calibration","Direction dure, assistance intermittente, volant qui tire, EPS, colonne.","Lire défauts EPS et capteur de couple|Contrôler alimentation et masses EPS|Vérifier l'absence de campagne de recalibration|Recalibrer le capteur après intervention|Essai routier","EPS, capteur de couple, faisceau, crémaillère","C1A00,U0121,C1B00","all"],
["DR-DOOR","portes,cle","panne","moyen","Ouvrants — serrures, actionneurs, hayon et portes coulissantes","Porte qui ne s'ouvre pas, hayon inopérant, porte coulissante bloquée, anti-pincement.","Lire défauts modules de porte / hayon|Contrôler actionneurs et micro-contacts|Vérifier alimentation, masses et 12 V|Lubrifier rails et contrôler anti-pincement|Tester le déverrouillage de secours","Serrures, actionneurs, modules, rails, galets","B1000,U0100","all"],
["DR-KEY","cle,elec12","panne","eleve","Clé / antidémarrage — non-reconnaissance et démarrage refusé","Message clé non détectée, démarrage impossible, ouverture aléatoire, transpondeur.","Contrôler la pile de télécommande / carte|Mesurer la 12 V au repos et au démarrage|Tester antennes BF et lecteur de secours|Vérifier les interférences|Contrôler le calculateur d'antidémarrage","Pile, antennes BF, transpondeur, BSI/UCH, 12 V","B1000,U0100,P0562","all"],
["DR-12V","elec12,telematique","panne","eleve","Batterie 12 V — décharge, courant de repos et masses","Non-démarrage après immobilisation, voyants multiples, écrans qui redémarrent.","Mesurer le courant de repos après veille complète|Contrôler SOH, capacité et tension|Tester alternateur / DC-DC en charge|Identifier le consommateur parasite par fusibles|Contrôler masses et corrosion","Batterie 12 V, alternateur, DC-DC, masses","P0562,U0111,U0101","all"],
["DR-48V","elec48,acoups","campagne","eleve","Réseau 48 V — batterie lithium, DC-DC et alterno-démarreur","Stop&start inopérant, à-coups au redémarrage, voyant batterie, MHEV, ISG.","Lire codes réseau 48 V et DC-DC|Contrôler tension, SOH et équilibrage|Tester l'ISG et sa courroie|Vérifier le DC-DC 48/12 V et masses|Appliquer la mise à jour logicielle","Batterie 48 V, ISG, DC-DC, courroie, masses","P0A7F,P0562,U0111","mhev"],
["DR-HVISO","hv","panne","critique","Isolement haute tension — défaut et coupure de sécurité","Alerte isolement, véhicule immobilisé, limitation de puissance, refus de charge, HV.","Lire défaut et valeur d'isolement|Mesurer au mégohmmètre (habilitation HV)|Isoler les branches : clim, chauffage, OBC, pack|Contrôler humidité des connecteurs HV|Remplacer le composant fautif et revalider","Câblage HV, compresseur clim, chauffage HV, pack","P0AA6,P0AFA,U0111","hv"],
["DR-HVCELL","hv,autonomie","panne","eleve","Batterie HV — SOH, delta de cellules et équilibrage","Perte d'autonomie, charge plafonnée, limitation de puissance, jauge incohérente.","Lire SOH, delta de tension cellules et températures|Cycle de charge lente complet|Contrôler historique de charges rapides|Appliquer mise à jour BMS et réapprendre SOC|Remplacer le module si delta persiste","Modules, BMS, sondes, contacteurs","P0AA6,P0AFA,U0111","hv"],
["DR-AC","charge,hv","panne","eleve","Charge AC — OBC, câble mode 2 et connecteur","Charge AC impossible ou interrompue, charge lente, odeur de chaud, Type 2, CP PP.","Lire codes OBC|Tester plusieurs bornes et un autre câble|Contrôler résistances CP/PP du câble|Inspecter et thermographier les broches|Remplacer OBC ou connecteur","OBC, connecteur, câble mode 2, faisceau HV","P0D11,P0C00,U0111","plug"],
["DR-DC","charge,hv,thermique","panne","moyen","Charge DC — puissance bridée et préconditionnement","Charge rapide lente, arrêt de charge, puissance plafonnée à froid, CCS.","Lire historique thermique et température pack|Contrôler préconditionnement et boucle LDR|Tester plusieurs bornes DC|Vérifier verrouillage connecteur et contacteurs|Appliquer la mise à jour gestion de charge","BMS, boucle LDR, contacteurs, connecteur DC","P0C00,P0AA6,P0D11","plug"],
["DR-V2L","charge,elec12","tsb","info","V2L / V2G / prise externe — protection et disponibilité","V2L indisponible, alerte surcharge, coupure en usage, bidirectionnel.","Lire l'état V2L et les protections|Contrôler la prise et le câblage|Vérifier le SOC minimum autorisé|Appliquer la mise à jour logicielle","Prise V2L, ICCU, protections","P1B77,P0D11","ev"],
["DR-RANGE","autonomie,thermique","panne","moyen","Autonomie / consommation excessive — écart au réel","Autonomie réelle très inférieure à l'annonce, consommation en hausse, WLTP.","Comparer consommation mesurée / annoncée sur trajet témoin|Contrôler pressions, monte et usure pneus|Vérifier freins traînants et étriers grippés|Contrôler pompe à chaleur et préconditionnement|Lire SOH et température moyenne du pack","Pneus, étriers, pompe à chaleur, BMS","P0C00,P0AA6,C1365","all"],
["DR-THERM","thermique,moteur","panne","eleve","Refroidissement — thermostat, pompe à eau, ventilateur","Température instable, surchauffe en charge, chauffage habitacle faible, LDR.","Lire température LDR et consigne thermostat|Test de pression à froid|Contrôler pompe à eau (débit, fuite) et courroie|Tester ventilateur, résistance et commande|Purger et contrôler le vase d'expansion","Thermostat, pompe à eau, ventilateur, durites, sonde","P0128,P0217,P0480,P00B7","ice"],
["DR-THERMEV","thermique,hv,autonomie","panne","moyen","Thermique batterie / habitacle — pompe à chaleur et boucle LDR","Chauffage absent, autonomie hivernale effondrée, charge lente à froid, R744 R1234yf.","Lire codes circuit thermique HV|Contrôler pompe LDR, échangeur et vannes|Vérifier charge de fluide et compresseur|Contrôler préconditionnement et sondes pack|Appliquer la mise à jour thermique","Pompe LDR, échangeur, vannes, compresseur, sondes","P0C00,P0AA6,P0A7A","plug"],
["DR-CAM","camera,adas","panne","moyen","Caméras — buée, perte de signal et calibration","Image trouble ou absente, caméra de recul inopérante, défaut calibration.","Contrôler étanchéité et présence de buée|Vérifier alimentation, masse et liaison vidéo|Nettoyer optique et support|Calibrer après intervention|Remplacer si signal absent","Caméra, support, faisceau vidéo, calculateur ADAS","U0121,U0101,B1000","all"],
["DR-ADAS","adas,camera,freinage","tsb","eleve","ADAS — radar, calibration et freinage intempestif","Freinages fantômes, régulateur qui se désengage, alertes collision injustifiées, ACC.","Relever version et journaux ADAS|Contrôler propreté, fixation, alignement radar|Vérifier carrosserie / géométrie non calibrée|Calibration statique puis dynamique|Contrôler cohérence caméra / radar","Radar, caméra, support, calculateur ADAS","U0121,U0101,C1A00","all"],
["DR-TEL","telematique,tablette,elec12","panne","moyen","Télématique / OTA — connexion, eSIM et mise à jour","Application déconnectée, services absents, OTA qui échoue, géolocalisation perdue.","Contrôler module télématique (alimentation, antenne, eSIM)|Vérifier la 12 V (coupures corrompent les OTA)|Lire journaux et version|Relancer / re-flasher la mise à jour|Contrôler abonnement et réseau","TCU, antenne, eSIM, 12 V","U0101,U0121,P0562","all"],
["DR-SCREEN","tablette,telematique","panne","moyen","Écran / tablette — tactile fantôme, délaminage, reboot","Touches fantômes, écran noir ou figé, bulles sous la dalle, perte CarPlay.","Relever version et journaux multimédia|Contrôler nappe vidéo, alimentation, masse|Inspecter la dalle (délaminage, points de pression)|Appliquer mise à jour puis réinitialiser|Remplacer la dalle si persistant","Dalle tactile, nappe LVDS, calculateur multimédia","U0101,U0121","all"],
["DR-WIRE","tablette,elec12","panne","info","Chargeur sans fil / ports USB — surchauffe et coupures","Charge interrompue, téléphone chaud, port inopérant, Qi, USB-C.","Contrôler le module de charge et sa ventilation|Tester ports USB et alimentation|Vérifier absence d'objet métallique|Remplacer le module Qi","Module Qi, ports USB, alimentation","U0101,B1000","all"],
["DR-LIGHT","eclairage,elec12","panne","info","Éclairage — LED, condensation et modules de puissance","Phare embué, LED partiellement éteinte, clignotement, défaut feux, matriciel.","Inspecter étanchéité et évents du projecteur|Contrôler connecteurs et module LED|Vérifier alimentation, masses et 12 V|Lire défauts calculateur d'éclairage|Remplacer et calibrer si matriciel","Projecteur, module LED, connectique, calculateur","B1000,U0100","all"],
["DR-BODY","carrosserie,portes,elec12","panne","info","Carrosserie / étanchéité — infiltrations et corrosion","Humidité habitacle, buée persistante, corrosion de hayon, connecteurs oxydés.","Localiser l'infiltration (arrosage, joints, évents)|Contrôler évacuations bas de caisse et toit ouvrant|Inspecter corrosion et soudures|Vérifier connecteurs en zone humide|Traiter, remplacer joints, sécuriser masses","Joints, évents, passe-câbles, connecteurs, masses","B1000,U0101","all"],
["DR-HYBRID","hv,thermique,moteur","tsb","eleve","Système hybride — onduleur, LDR, isolement et 12 V","Voyant système hybride, perte de puissance, surchauffe onduleur, HSD e-POWER E-Tech.","Lire codes onduleur et températures|Contrôler débit pompe LDR et niveau|Vérifier isolement HV et connecteurs|Contrôler DC-DC et 12 V en mode READY|Nettoyer filtre de refroidissement HV","Onduleur, pompe LDR, DC-DC, pack, filtre HV","P0A93,P0A7A,P0AA6,P0562","hv"]
];

/* ═══ INTERVALLES RÉVISÉS ═══
   [id, marques|ALL, regex famille/code, organe, ancKm, nouvKm, ancMo, nouvMo, source, motif] */
var revs = [
["RV-FORD-EB-CHAIN","ford","2\\.0 EcoBlue|YLCB|BKF","Chaîne de distribution",240000,160000,120,96,"TSB Ford EcoBlue · révision constructeur","Allongement de chaîne et usure du tendeur hydraulique : échéance ramenée à 160 000 km / 8 ans."],
["RV-FORD-EB-PUMP","ford","2\\.0 EcoBlue|YLCB|BKF","Courroie de pompe à huile",240000,150000,120,96,"TSB Ford EcoBlue","Débris colmatant la crépine : remplacement anticipé avec la chaîne."],
["RV-FORD-ECO-BELT","ford","1\\.0 EcoBoost|B3CA|B7JA|B3CB","Courroie de distribution humide",240000,150000,120,72,"TSB Ford EcoBoost","Dégradation prématurée en bain d'huile : 150 000 km / 6 ans, contrôle annuel."],
["RV-PSA-BELT","peugeot,citroen,ds,opel,fiat,jeep,alfa,lancia,abarth","1\\.2 PureTech|EB2","Courroie de distribution humide",180000,100000,120,72,"Campagne Stellantis · Rappel Conso","Usure accélérée et colmatage crépine : 100 000 km / 6 ans, gabarit à chaque entretien."],
["RV-PSA-PUMP","peugeot,citroen,ds,opel,fiat,alfa,jeep,lancia","1\\.2 PureTech|EB2","Pompe à huile + crépine",180000,100000,120,72,"Campagne Stellantis","Remplacement systématique avec le kit courroie."],
["RV-PSA-DV5","peugeot,citroen,ds,opel,toyota","1\\.5 BlueHDi|DV5|1\\.5 D-4D","Chaîne AAC (7→8 mm)",0,120000,0,96,"Campagne Stellantis DV5","Organe sans échéance : contrôle / kit renforcé à 120 000 km."],
["RV-PSA-ATF","peugeot,citroen,ds,opel,toyota","EAT6|EAT8|EP6|DW10","Huile de boîte EAT6 / EAT8",0,100000,0,96,"TSB Stellantis EAT / Aisin","Fin de l'huile « à vie » : 100 000 km / 8 ans."],
["RV-STA-48","peugeot,citroen,ds,opel,fiat,alfa,jeep,lancia,abarth","1\\.2 Hybrid|EB2LTEDH","Courroie d'accessoires + galets",0,90000,0,72,"TSB Stellantis 48V / e-DCS6","Contrôle ajouté à 90 000 km / 6 ans sur les 48 V e-DCS6."],
["RV-STA-EDCS6","peugeot,citroen,ds,opel,fiat,alfa,jeep,lancia,abarth","1\\.2 Hybrid|EB2LTEDH","Huile de boîte e-DCS6",0,120000,0,96,"TSB Stellantis e-DCS6","Boîte annoncée sans entretien : vidange à 120 000 km / 8 ans."],
["RV-RN-H5F","renault,dacia","1\\.2 TCe|H5F","Vidange huile + filtre",30000,15000,24,12,"Campagne Renault H5Ft","Consommation d'huile et dilution : intervalle divisé par deux."],
["RV-RN-K9K","renault,dacia,nissan","1\\.5 (Blue )?dCi|K9K","Kit distribution + pompe à eau",160000,120000,72,60,"Révision Renault dCi","Ruptures constatées : 120 000 km / 5 ans."],
["RV-H5H","renault,dacia,nissan,mercedes","1\\.3 TCe|H5H|M282","Vidange huile + filtre",30000,20000,24,12,"TSB Alliance H5H / M282","DI et GPF : huile normée, intervalle réduit en urbain."],
["RV-RN-EDC","renault,dacia,alpine","E-Tech|H4M|Multimode|EDC","Huile de boîte EDC / multimode",0,120000,0,96,"TSB Renault EDC","Vidange et contrôle d'usure d'embrayage à 120 000 km."],
["RV-AMPR-BMS","renault,nissan,dacia,alpine","EV-R|6AK|5AM|EV-TWI|EV-A39|EV-LF","Mise à jour BMS + contrôle SOH",0,30000,0,24,"TSB AmpR","Mise à jour BMS et contrôle SOH tous les 30 000 km / 2 ans."],
["RV-EA888","volkswagen,audi,skoda,seat,cupra","2\\.0 TSI|2\\.0 TFSI|EA888|CZP|DNN|DNF|DKN","Contrôle chaîne + tendeur",0,120000,0,96,"TSB VAG EA888","Organe « à vie » : contrôle d'allongement à 120 000 km."],
["RV-DSG-WET","volkswagen,audi,skoda,seat,cupra","DSG|DQ250|DQ381|DQ500|S-tronic|2\\.0 TDI|2\\.0 TSI","Huile + filtre DSG (bain d'huile)",60000,60000,0,48,"TSB VAG DSG","Échéance calendaire ajoutée : 60 000 km ou 4 ans."],
["RV-DQ200","volkswagen,audi,skoda,seat,cupra","1\\.0 TSI|1\\.5 TSI|DQ200|DKL|DPC","Huile mécatronique DQ200",0,120000,0,96,"TSB VAG DQ200","Annoncée sans entretien : vidange mécatronique à 120 000 km."],
["RV-SCR-VAG","volkswagen,audi,skoda,seat,cupra","2\\.0 TDI|EA288|DSU|DTU|DFG","Filtre / injecteur AdBlue",120000,60000,0,48,"Campagne VAG SCR","Cristallisation fréquente : remplacement anticipé."],
["RV-MEB-12LI","volkswagen,audi,skoda,seat,cupra,ford","APP310|APP550|MEB","Contrôle batterie 12 V lithium",0,60000,0,48,"TSB VAG MEB+","12 V Li-ion : contrôle SOH et connexions à 60 000 km / 4 ans."],
["RV-PPE-COOL","audi,porsche,polestar","PPE|J1","Liquide boucle 800 V",0,120000,0,96,"TSB PPE / J1","Remplacement du liquide de la boucle 800 V à 120 000 km / 8 ans."],
["RV-B47","bmw,mini","B47|B37|2\\.0 .*d|1\\.5 .*d","Contrôle chaîne de distribution",0,150000,0,120,"TSB BMW B47","Chaîne côté boîte : contrôle à 150 000 km / 10 ans."],
["RV-BMW-PLUG","bmw,mini,toyota","B58|B48|S58|M340|M40|3\\.0|2\\.0 .*i|Supra","Bougies d'allumage",60000,40000,0,48,"TSB BMW M Performance","Usage sportif / forte charge : bougies à 40 000 km."],
["RV-ZF8","bmw,mini,landrover,jaguar,aston","B48|B58|B47|B57|ZF8|8HP","Huile de boîte ZF 8HP",0,100000,0,96,"TSB ZF / BMW","Fin de l'huile « à vie » : 100 000 km / 8 ans."],
["RV-OM651","mercedes","OM651|2\\.2 .*CDI","Contrôle chaîne + patins",0,180000,0,120,"TSB Mercedes OM651","Usure des patins : contrôle à 180 000 km."],
["RV-9G","mercedes","9G|OM654|M254|M256","Huile de boîte 9G-Tronic",0,100000,0,80,"TSB Mercedes 9G","Vidange ATF + filtre à 100 000 km / 80 mois."],
["RV-MB48","mercedes","M254|M256|M264|48","Contrôle batterie 48 V + DC-DC",0,60000,0,48,"Campagne Mercedes 48 V","Contrôle SOH / équilibrage à 60 000 km."],
["RV-THETA","hyundai,kia,genesis","1\\.6 T-GDi|2\\.0 T-GDi|G4FJ|G4KH|G4FT|G4KL","Vidange huile + filtre",15000,7500,12,6,"Campagne Hyundai/Kia Theta · NHTSA","Usage sévère / LSPI : intervalle divisé par deux, huile anti-LSPI."],
["RV-HK-DCT","hyundai,kia","DCT|G4LE|G4FT|1\\.6 .*Hybrid","Huile de boîte DCT",0,90000,0,72,"TSB Hyundai/Kia DCT","Annoncée sans entretien : 90 000 km / 6 ans."],
["RV-EGMP2","hyundai,kia,genesis","EM17|EM21|EM23|EM16","Contrôle ICCU gen2 + V2L",0,60000,0,48,"Campagne E-GMP","Contrôle ICCU et prise V2L ajouté à 60 000 km / 4 ans."],
["RV-HSD-PUMP","toyota,lexus,suzuki","Hybrid|HSD|A25A|M20A|2ZR|PHEV|e:HEV|Swace|Across","Contrôle pompe à eau onduleur",0,90000,0,120,"TSB Toyota HSD","Contrôle de débit ajouté à 90 000 km."],
["RV-HVFILT","toyota,lexus,honda,suzuki","Hybrid|PHEV|HSD|e:HEV|e:PHEV","Nettoyage filtre batterie HV",0,30000,0,24,"TSB Toyota HSD","Encrassement du filtre HV : 30 000 km / 2 ans."],
["RV-HON-15T","honda","1\\.5 VTEC Turbo|L15|1\\.0 VTEC","Vidange huile + filtre",20000,10000,12,6,"TSB Honda 1.5T dilution","Dilution d'huile en urbain froid : intervalle divisé par deux."],
["RV-MAZDA-D","mazda","Skyactiv-D|SH-VPTS|2\\.2","Vidange huile + filtre",20000,10000,12,6,"Retour terrain Skyactiv-D","Dilution par régénérations FAP : intervalle divisé par deux en urbain."],
["RV-MAZDA-X","mazda","Skyactiv-X|SPCCI","Bougies + contrôle compression",60000,40000,0,48,"TSB Mazda Skyactiv-X","Allumage par compression : bougies et capteurs de pression à 40 000 km."],
["RV-SUZ-48","suzuki","Boosterjet Hybrid|K14|Dualjet|SHVS","Contrôle batterie lithium + ISG",0,60000,0,48,"TSB Suzuki SHVS","Contrôle SOH et courroie ISG à 60 000 km."],
["RV-VOLVO-DE","volvo","B4204|B3154|D4204|Drive-E","Kit distribution + pompe à eau",240000,160000,120,96,"Révision Volvo Drive-E","Ruptures constatées : 160 000 km / 8 ans."],
["RV-JLR-ING","landrover,jaguar","PT204|PT15|204DT|Ingenium|D200|P250","Contrôle chaîne de distribution",0,150000,0,96,"TSB JLR Ingenium","Allongement constaté : contrôle à 150 000 km / 8 ans."],
["RV-JLR-AIR","landrover,jaguar","","Filtre / dessiccateur suspension pneumatique",0,120000,0,96,"Protocole atelier JLR","Remplacement du dessiccateur de compresseur à 120 000 km."],
["RV-NIS-CVT","nissan","CVT|Xtronic|e-POWER|KR15","Huile CVT NS-3 / contrôle e-POWER",60000,40000,0,48,"TSB Nissan Xtronic","Usage urbain / charge : huile CVT à 40 000 km."],
["RV-MIT-PHEV","mitsubishi,outlander","PHEV|4B12","Contrôle pack HV + liquide onduleur",0,60000,0,48,"TSB Mitsubishi PHEV","Contrôle SOH et boucle onduleur à 60 000 km."],
["RV-SUB-BOX","subaru","e-Boxer|FB20|FB25|Boxer","Vidange + contrôle courroie/chaîne",15000,10000,12,12,"Protocole atelier Subaru","Usage sévère / AWD : intervalle réduit, contrôle boîte CVT."],
["RV-PORSCHE-PDK","porsche","PDK|Carrera|Turbo|9A2|CSZ","Huile de boîte PDK",0,80000,0,72,"TSB Porsche PDK","Vidange PDK + filtre à 80 000 km / 6 ans."],
["RV-FERRARI","ferrari,lamborghini,mclaren,aston,maserati,bugatti","","Vidange huile + contrôle DCT",20000,10000,12,12,"Protocole atelier super-sportives","Usage sportif : vidange annuelle, contrôle DCT et liquides haute température."],
["RV-BENTLEY","bentley,rolls,maserati","","Vidange + filtres + liquide frein",20000,10000,24,12,"Protocole atelier premium","Faible kilométrage : échéance calendaire dominante, contrôle annuel complet."],
["RV-EVRED","ALL","Électrique|EV|APP|PPE|EM1|EM2|GEN5|J1|3D|EVA|MMA|ZKX|STLA|1YM|BYD|MEB|NK|SEA","Huile de réducteur",0,120000,0,96,"TSB constructeurs EV","Réducteur « à vie » : vidange / contrôle à 120 000 km / 8 ans."],
["RV-EVCOOL","ALL","Électrique|EV|APP|PPE|EM1|EM2|GEN5|J1|3D|EVA|MMA|ZKX|STLA|1YM|BYD|MEB|NK|SEA","Liquide de refroidissement pack HV",0,120000,0,96,"TSB constructeurs EV","Circuit HV sans entretien : remplacement à 120 000 km / 8 ans."],
["RV-EV12","ALL","Électrique|EV|APP|PPE|EM1|EM2|GEN5|3D|EVA|MMA|ZKX|STLA|1YM|BYD|MEB|NK|SEA","Contrôle batterie 12 V + DC-DC",0,30000,0,24,"Campagne / TSB EV","Décharge récurrente : contrôle SOH et DC-DC tous les 30 000 km."],
["RV-EV-BRAKE","ALL","Électrique|EV|Hybrid|PHEV|e:HEV|HSD","Nettoyage / graissage étriers (régénératif)",0,30000,0,24,"Protocole atelier EV / hybride","Faible sollicitation : corrosion des disques, graissage annuel des colonnettes."],
["RV-GDI","ALL","TSI|TFSI|T-GDi|EcoBoost|PureTech|TCe|VTEC|Skyactiv-G|TGDi|Turbo","Bougies d'allumage (iridium inclus)",60000,40000,0,48,"TSB multi-constructeurs GDI turbo","DI turbo : bougies à 40 000 km / 4 ans."],
["RV-DPF","ALL","BlueHDi|dCi|TDI|EcoBlue|CRDi|Skyactiv-D|DI-D|JTDm|MultiJet|D-4D|CDI|TDCi|Ddi","Nettoyage / contrôle FAP",120000,90000,0,72,"Protocole atelier diesel","Urbain : nettoyage préventif à 90 000 km pour éviter le colmatage irréversible."],
["RV-ADBLUE","ALL","BlueHDi|TDI|EcoBlue|CRDi|CDI|SCR|dCi|MultiJet|D-4D","Filtre / injecteur AdBlue",120000,80000,0,60,"Campagnes SCR multi-constructeurs","Cristallisation : remplacement anticipé du filtre et de l'injecteur."],
["RV-BRAKE","ALL","","Liquide de frein DOT 4 / DOT 4 LV",60000,60000,24,24,"Protocole atelier · norme constructeur","Double échéance : 60 000 km OU 24 mois, contrôle d'humidité annuel."],
["RV-CABIN","ALL","","Filtre d'habitacle charbon actif",30000,15000,24,12,"Protocole atelier · qualité d'air","Urbain / pollué : 15 000 km / 12 mois."],
["RV-ACC","ALL","","Courroie d'accessoires + galets",120000,90000,120,72,"Protocole atelier","Rupture entraînant la distribution : remplacement anticipé."],
["RV-AIR","ALL","","Filtre à air moteur",60000,40000,0,48,"Protocole atelier","Usage urbain / poussiéreux : remplacement anticipé."],
["RV-COOL","ALL","","Liquide de refroidissement moteur",120000,100000,120,60,"Protocole atelier · norme constructeur","Long-life annoncé : remplacement à 100 000 km / 5 ans, contrôle du pH."],
["RV-4X4","ALL","4Motion|xDrive|4MATIC|quattro|AWD|4xe|ALL4|4Control|e-4ORCE","Huile de pont / boîte de transfert",0,90000,0,72,"Protocole atelier AWD","Transmission intégrale : vidange ponts et transfert à 90 000 km."],
["RV-LCV","peugeot,citroen,ds,opel,fiat,renault,nissan,ford,volkswagen,mercedes,toyota,iveco,man,isuzu,maxus","","Vidange huile usage intensif + filtre gasoil",40000,20000,24,12,"Protocole atelier utilitaires","Charge, remorquage, urbain : intervalle divisé par deux, filtre gasoil annuel."]
];

/* ═══ DICTIONNAIRE DTC ═══ [libellé, causes, contrôle] */
var dtc = {
P0011:["Position AAC A — calage trop avancé","Chaîne/courroie allongée, déphaseur, pression d'huile","Contrôle calage, tendeur, VVT, pression d'huile"],
P0012:["Position AAC A — calage trop retardé","Tendeur, déphaseur, pression d'huile basse","Contrôle calage et alimentation d'huile"],
P0016:["Corrélation vilebrequin / AAC A rangée 1","Chaîne ou courroie décalée, tendeur usé","Oscilloscope synchro vilo/AAC, kit distribution"],
P0017:["Corrélation vilebrequin / AAC B rangée 1","Décalage distribution, capteur AAC B","Contrôle calage et capteurs"],
P0030:["Chauffage sonde O2 — circuit","Résistance de sonde, relais, faisceau","Mesure résistance et alimentation"],
P0087:["Pression rail carburant trop basse","Pompe HP, filtre colmaté, injecteurs, crépine","Pression rail consigne/réel, débits retour"],
P0088:["Pression rail carburant trop haute","Régulateur, vanne de dosage, pompe HP","Contrôle régulateur et consigne rail"],
P0089:["Régulateur de pression carburant — performance","Vanne de dosage, capteur rail","Comparaison consigne / réel"],
P00AF:["Commande turbo — performance","Actionneur GAV, wastegate, faisceau","Test course actionneur et alimentation"],
P00B7:["Débit LDR insuffisant","Pompe à eau, thermostat, air dans le circuit","Contrôle débit, purge, pompe"],
P0101:["Débitmètre MAF — plage / performance","MAF encrassé, fuite admission, PCV","Comparaison MAF / MAP, test fumée"],
P0106:["Capteur MAP — plage / performance","Capteur, fuite admission, faisceau","Comparaison MAP / barométrique"],
P0113:["Capteur température admission — signal haut","Sonde IAT, faisceau","Mesure résistance vs température"],
P0128:["Température LDR sous seuil thermostat","Thermostat bloqué ouvert, sonde","Contrôle thermostat et montée en température"],
P0135:["Sonde O2 amont — chauffage","Résistance, relais, faisceau","Mesure résistance de chauffage"],
P0171:["Mélange trop pauvre rangée 1","Prise d'air, débitmètre, injecteurs, PCV","Test fumée admission, sonde O2"],
P0172:["Mélange trop riche rangée 1","Injecteur qui fuit, pression haute, sonde O2","Contrôle injecteurs, pression rail"],
P0191:["Capteur pression rail — performance","Capteur rail, faisceau","Comparaison capteur / manomètre"],
P0201:["Circuit injecteur cylindre 1","Injecteur, faisceau, calculateur","Résistance / débit retour, faisceau"],
P0202:["Circuit injecteur cylindre 2","Injecteur, faisceau, calculateur","Résistance / débit retour, faisceau"],
P0203:["Circuit injecteur cylindre 3","Injecteur, faisceau, calculateur","Résistance / débit retour, faisceau"],
P0204:["Circuit injecteur cylindre 4","Injecteur, faisceau, calculateur","Résistance / débit retour, faisceau"],
P0217:["Surchauffe moteur","Pompe à eau, thermostat, fuite LDR, joint de culasse","Test pression circuit, pompe, ventilateur"],
P0218:["Huile de boîte — surchauffe","Niveau ATF, échangeur, usage intensif","Contrôle niveau, échangeur, adaptations"],
P0230:["Circuit primaire pompe à carburant","Relais, alimentation, pompe BP","Contrôle relais, tension, masse"],
P0234:["Suralimentation excessive","Wastegate grippée, GAV, capteur","Contrôle actionneur turbo et MAP"],
P025A:["Commande module pompe à carburant","Calculateur pompe, faisceau","Contrôle commande et alimentation"],
P0299:["Suralimentation insuffisante","Fuite durite, GAV grippée, échangeur, EGR","Test fumée, GAV, pression consigne"],
P0300:["Ratés d'allumage multiples","Bougies, bobines, injecteurs, compression","Compteurs de ratés, permutation bobines"],
P0301:["Ratés d'allumage cylindre 1","Bougie, bobine, injecteur, compression","Permutation bobine/bougie, compression"],
P0302:["Ratés d'allumage cylindre 2","Bougie, bobine, injecteur, compression","Permutation bobine/bougie, compression"],
P0303:["Ratés d'allumage cylindre 3","Bougie, bobine, injecteur, compression","Permutation bobine/bougie, compression"],
P0304:["Ratés d'allumage cylindre 4","Bougie, bobine, injecteur, compression","Permutation bobine/bougie, compression"],
P0335:["Capteur position vilebrequin","Capteur CKP, cible, faisceau","Signal CKP à l'oscilloscope"],
P0340:["Capteur position AAC — circuit","Capteur CMP, faisceau, calage","Signal CMP, alimentation, masse"],
P0341:["Capteur AAC — performance","Capteur CMP, chaîne allongée","Synchro vilo/AAC, contrôle capteur"],
P0380:["Circuit bougies de préchauffage","Relais / boîtier, bougies, faisceau","Résistance bougies et commande"],
P0401:["EGR — débit insuffisant","Vanne encrassée, refroidisseur, capteur ΔP","Position consigne/réel, nettoyage"],
P0402:["EGR — débit excessif","Vanne bloquée ouverte, capteur","Étanchéité vanne fermée"],
P040B:["Capteur température EGR","Sonde EGR, faisceau","Comparaison températures, résistance"],
P0420:["Rendement catalyseur sous seuil","Catalyseur vieilli, sonde O2 aval, fuite","Comparaison sondes, contre-pression"],
P042F:["Sonde O2 aval — performance","Sonde, faisceau, catalyseur","Comparaison amont / aval"],
P0471:["Capteur pression échappement — plage","Capteur, tuyau bouché","Comparaison pression / consigne"],
P0480:["Commande ventilateur","Relais, résistance, moteur","Test commande et alimentation"],
P0490:["Commande EGR — signal haut","Faisceau, vanne, calculateur","Alimentation et commande vanne"],
P0500:["Capteur vitesse véhicule","Capteur, faisceau, ABS","Comparaison vitesses de roue"],
P0521:["Capteur pression d'huile — performance","Niveau/qualité huile, crépine, pompe","Pression manométrique à chaud"],
P0524:["Pression d'huile trop basse","Niveau, pompe, crépine, coussinets","Pression manométrique, endoscopie"],
P0562:["Tension système basse","Batterie 12 V, alternateur / DC-DC, masses","Test charge et courant de repos"],
P0563:["Tension système haute","Régulateur d'alternateur, DC-DC","Mesure tension en charge"],
P0606:["Calculateur — erreur interne","Calculateur, alimentation, mémoire","Contrôle alimentations et reprogrammation"],
P0627:["Commande pompe à carburant — ouvert","Relais, faisceau, pompe BP","Continuité et commande"],
P0671:["Bougie de préchauffage cylindre 1","Bougie, boîtier, faisceau","Mesure résistance bougie 1"],
P0672:["Bougie de préchauffage cylindre 2","Bougie, boîtier, faisceau","Mesure résistance bougie 2"],
P0673:["Bougie de préchauffage cylindre 3","Bougie, boîtier, faisceau","Mesure résistance bougie 3"],
P0674:["Bougie de préchauffage cylindre 4","Bougie, boîtier, faisceau","Mesure résistance bougie 4"],
P0700:["Commande boîte — défaut signalé","TCU / mécatronique","Lecture codes TCU détaillés"],
P0715:["Capteur régime d'entrée de boîte","Capteur, faisceau, huile","Signal capteur, niveau ATF"],
P0730:["Rapport de transmission incorrect","Embrayage, mécatronique, huile","Adaptations, pression hydraulique"],
P0741:["Convertisseur — patinage excessif","Convertisseur, huile, lock-up","Température et adaptations"],
P0A7A:["Batterie / onduleur — performance","Modules, BMS, refroidissement","SOH, delta cellules, températures"],
P0A7F:["Batterie hybride / 48 V — dégradation","Vieillissement modules, déséquilibre","Test capacité et delta cellules"],
P0A80:["Remplacer pack batterie hybride","Modules dégradés, SOH bas","Test capacité, delta, historique"],
P0A93:["Refroidissement onduleur","Pompe à eau électrique, LDR, échangeur","Débit pompe et niveau LDR"],
P0AA6:["Isolement haute tension — défaut","Câblage HV, clim, batterie, chauffage HV","Mesure mégohmmètre par branche"],
P0AFA:["Batterie HV — déséquilibre cellules","Module dégradé, BMS","Delta cellules, équilibrage, module"],
P0B3D:["Capteur tension cellule — plage","Capteur, faisceau interne, module","Comparaison tensions cellules"],
P0C00:["Refroidissement batterie / traction","Pompe LDR, échangeur, vanne, logiciel","Débit, températures, mise à jour"],
P0C73:["Refroidissement moteur électrique","Pompe, échangeur, LDR","Débit et température onduleur"],
P0D11:["Chargeur embarqué — performance","OBC, connecteur, câble, borne","Test AC multi-bornes, codes OBC"],
P0D5A:["Charge DC — communication borne","Contacteurs, PLC, verrou","Test DC multi-bornes, verrouillage"],
P0DAE:["Verrou de connecteur de charge","Actuateur, capteur, faisceau","Test verrouillage et micro-contact"],
P1101:["Débit d'air — incohérence","Fuite admission, MAF, PCV","Test fumée, comparaison MAF/MAP"],
P1750:["Boîte — défaut mécanique / hydraulique","Mécatronique, huile, embrayage","Adaptations, niveau huile, codes TCU"],
P189C:["Pression hydraulique boîte insuffisante","Pompe, accumulateur, fuite interne","Contrôle pression et niveau ATF"],
P1B77:["ICCU / charge — défaut interne","ICCU, DC-DC, fusible HV","Codes ICCU, 12 V et fusible"],
P1E00:["Système hybride — défaut général","Onduleur, pack, DC-DC","Lecture sous-codes et températures"],
P2002:["FAP — efficacité sous seuil","FAP colmaté, capteur ΔP, régénérations","Charge de suie, ΔP, régénération"],
P204F:["SCR — performance rangée 1","Pompe / injecteur AdBlue, qualité","Débit pompe, cristallisation"],
P207F:["Qualité réactif SCR insuffisante","AdBlue contaminé ou dilué","Réfractomètre, vidange réservoir"],
P208E:["Injecteur AdBlue — bloqué","Cristallisation, injecteur","Test débit et nettoyage"],
P20E8:["Pression AdBlue trop basse","Pompe, fuite, filtre","Mesure pression et débit"],
P2200:["Capteur NOx amont — circuit","Capteur, module, faisceau","Comparaison valeurs, alimentation"],
P2201:["Capteur NOx — circuit / plage","Capteur NOx, faisceau, module","Comparaison amont / aval"],
P2263:["Turbo — performance","GAV grippée, fuite, capteur","Actionneur et étanchéité"],
P226D:["FAP absent / modifié","FAP supprimé, logiciel","Contrôle physique et logiciel"],
P229F:["Capteur NOx 2 — performance","Capteur aval, faisceau","Comparaison valeurs, alimentation"],
P242F:["FAP — restriction, cendres","Accumulation de cendres","Charge de cendres, remplacement"],
P2452:["Capteur ΔP FAP — circuit","Capteur, tuyaux, faisceau","Comparaison pression / manomètre"],
P2453:["Capteur ΔP FAP — plage","Capteur dérivé, tuyaux bouchés","Test capteur sous pression connue"],
P2463:["FAP — accumulation de suie","Trajets courts, régénérations interrompues","Régénération forcée, dilution huile"],
P246C:["FAP — restriction excessive","FAP colmaté irréversible","Remplacement, réinitialisation"],
P2BAE:["NOx — dépassement","SCR, EGR, injecteurs","Compteurs SCR, test NOx"],
U0001:["Bus CAN haut — défaut","Faisceau CAN, terminaison, calculateur","Oscilloscope CAN, résistances"],
U0100:["Perte communication ECM / PCM","Faisceau CAN, alimentation, calculateur","CAN, masses, alimentations"],
U0101:["Perte communication moteur / TCU","Faisceau CAN, alimentations","CAN, masses, alimentations"],
U0110:["Perte communication moteur électrique","Faisceau, onduleur, alimentation","CAN et alimentations onduleur"],
U0111:["Perte communication batterie / énergie","Faisceau, BMS, DC-DC, 12 V","Réseau, tension 12 V"],
U0121:["Perte communication ABS / ADAS","Faisceau CAN, capteurs, calculateur","CAN et calibration ADAS"],
U0140:["Perte communication BCM / BSI","Faisceau, alimentation, masses","CAN, masses, alimentations"],
U0155:["Perte communication combiné","Faisceau CAN, combiné","CAN et alimentation combiné"],
U0293:["Perte communication hybride / EV","Faisceau, calculateur HV","CAN, alimentation, isolement"],
U110B:["Perte communication chargeur","OBC, faisceau, alimentation","CAN OBC et alimentation"],
B0001:["Circuit airbag conducteur","Inflateur, connectique, SRS","Résistance circuit (procédure constructeur)"],
B0072:["Circuit prétensionneur / ceinture","Prétensionneur, connectique, SRS","Résistance circuit (procédure constructeur)"],
B0081:["Capteur de présence passager","Nappe occupancy, connectique sous siège","Contrôle nappe et connecteur"],
B1000:["Défaut module électronique de bord","Module, alimentation, faisceau","Défauts module, alimentation"],
B1318:["Tension batterie basse — module","12 V, masses, alternateur","Test charge et courant de repos"],
C0035:["Capteur vitesse roue AV gauche","Capteur ABS, couronne, faisceau","Vitesses de roue, contrôle cible"],
C0040:["Capteur vitesse roue AV droite","Capteur ABS, couronne, faisceau","Vitesses de roue, contrôle cible"],
C0045:["Capteur vitesse roue AR gauche","Capteur ABS, couronne, faisceau","Vitesses de roue, contrôle cible"],
C0050:["Capteur vitesse roue AR droite","Capteur ABS, couronne, faisceau","Vitesses de roue, contrôle cible"],
C0561:["Frein de parking — défaut système","Actuateur, câbles, alimentation","Test actuateurs et commande"],
C1095:["Pompe ABS — défaut moteur","Pompe, relais, bloc hydraulique","Test commande et alimentation"],
C1201:["ESP — défaut système","Capteurs, bloc, calibration","Lecture sous-codes, calibration"],
C1365:["Freinage — assistance / régénératif","Servofrein, capteur pédale, logiciel","Assistance, calibration régénératif"],
C1A00:["ADAS / suspension — calibration requise","Caméra / radar non calibré, capteurs hauteur","Calibration constructeur"],
C1B00:["Capteur angle volant — calibration","Capteur, colonne, alimentation","Calibration capteur d'angle"],
C2200:["Suspension pneumatique — pression","Compresseur, coussins, fuites","Test de fuite et temps de montée"]
};

/* ═══ EXPANSION DU CATALOGUE COMPACT → STRUCTURE APP ═══ */
var cat = Object.keys(RAW).map(function (bid) {
  var b = RAW[bid];
  var models = String(b[2]).split("\n").map(function (l) { return l.trim(); }).filter(Boolean).map(function (line) {
    var p = line.split("~");
    var y0 = 2000 + parseInt(p[2], 10), y1 = 2000 + parseInt(p[3], 10);
    var seg = SEG[p[4]] || "Véhicule";
    var engs = String(p[5] || "").split(";").filter(Boolean).map(function (t) {
      var e = t.split("#");
      var fam = e[0], hps = e[1] || "0", code = e[2] || "—";
      var fu = e[3] || "E", yr = e[4] || (p[2] + "-" + p[3]), tech = e[5] || "";
      return fam + "|" + hps + "|" + code + "|" + fu + "|" + yr + "|" + tech;
    }).join(";");
    return [p[0], p[1], y0, y1, seg, engs];
  });
  return [bid, b[0], b[1], models];
});

return { fuel:fuel, sev:sev, kind:kind, dom:dom, eng:eng, eva:eva, tq:tq,
         cat:cat, faults:faults, rules:rules, revs:revs, dtc:dtc };
})();
