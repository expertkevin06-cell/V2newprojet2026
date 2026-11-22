/* ═══════════════════════════════════════════════════════════════════════════
   KEV FUSION 2026 — BASE TECHNIQUE v18 · window.KFD · auto-expansion + carry
   2017 → 2027 · corrélation marque → modèle → motorisation → puissance
   DSL : modèle = id~Nom~y0~y1~SEG~moteurs
         moteur = Famille#ch[,ch:kWh]#CODE[#ÉNERGIE][#années][#techno]
         @x = preset moteur partagé (voir P)
   ═══════════════════════════════════════════════════════════════════════════ */
window.KFD = (function () {
"use strict";
var fuel={E:"Essence",D:"Diesel",H:"Hybride",P:"PHEV",EV:"Électrique",G:"GPL"};
var sev={critique:{n:"Critique",r:0},eleve:{n:"Élevé",r:1},moyen:{n:"Moyen",r:2},info:{n:"Info",r:3}};
var kind={rappel:"Rappel",campagne:"Campagne",tsb:"TSB / bulletin",panne:"Panne connue"};
var dom=[
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

var P={
a:"1.2 PureTech#75,82,100,110,130#EB2",b:"1.2 Hybrid 48V#100,136#EB2LTEDH#H",
c:"1.5 BlueHDi#100,110,130#DV5#D",d:"1.6 PureTech#180,225#EP6",e:"1.6 PHEV#180,225#EP6#P",
f:"2.0 BlueHDi#150,160,180#DW10#D",g:"2.2 BlueHDi#120,140,165#DW12#D",
h:"Électrique#136:50,156:51#ZKX#EV",i:"Électrique#156:54#EM0#EV",
j:"Électrique#210:73,230:97#STLA#EV",k:"1.0 TSI#95,110,115#DKL",l:"1.0 eTSI#110#DKL#H",
m:"1.5 TSI#130,150#DPCA",n:"1.5 eTSI#130,150#DPCA#H",o:"2.0 TDI#115,150,200#DSU#D",
p:"2.0 TSI#190,245,265,310#CZP",q:"1.4 eHybrid#204,245#DGEA#P",r:"1.5 eHybrid#204,272#DUV#P",
s:"Électrique#204:77,286:77,340:79#APP310#EV",t:"1.0 TCe#90,100#H4D",
u:"1.3 TCe#130,140,155#H5H",v:"1.5 Blue dCi#85,115#K9K#D",w:"1.6 E-Tech#140,145#H4M#H",
x:"1.6 T-GDi#150,180#G4FT",y:"1.6 T-GDi Hybrid#215,230#G4FT#H",
z:"1.6 T-GDi PHEV#253,265#G4FT#P",A:"1.6 CRDi#115,136#D4FE#D",
B:"1.8 Hybrid#122,140#2ZR-FXE#H",C:"2.0 Hybrid#184,196#M20A-FXS#H",
D:"2.5 Hybrid#218,222,244#A25A-FXS#H",E:"2.5 PHEV#306,309,320#A25A#P",
F:"2.0 Turbo#184,245,258#B48",G:"2.0 Diesel#150,190#B47#D",H:"3.0 Turbo#340,374,387#B58",
I:"1.3 Turbo#136,163#M282",J:"2.0 Turbo#204,258#M254#H",K:"2.0 Diesel#150,190,200#OM654#D",
L:"1.0 EcoBoost MHEV#125,155#B7JA#H",M:"2.0 EcoBlue#105,130,150,170,185,190#BKF#D",
N:"Électrique#229:77.4,325:77.4#EM17#EV",O:"1.5 Hybrid#130,160#GSE#H",
Q:"1.6 MultiJet#120,130#552#D",R:"2.0 MultiJet#140,170#552#D",
S:"2.0 Turbo#200,280#GME",T:"2.2 JTDm#150,180,210#552#D",
U:"2.0 P#200,250,300#PT204",V:"2.0 D#163,180,204#204DT#D",W:"1.5 PHEV#309#PT15#P",
X:"2.0 B4 MHEV#197#B4204#H",Y:"2.0 B5 MHEV#250#B4204#H",Z:"2.0 T8 PHEV#455#B4204#P",
0:"1.5 e:HEV#109,131#LEB#H",1:"2.0 e:HEV#184#LFA#H",2:"2.0 Skyactiv-G#122,150,165#PE-VPS",
3:"2.2 Skyactiv-D#150,184#SH-VPTS#D",4:"1.4 Boosterjet Hybrid#129#K14#H",
5:"1.5 Dualjet Hybrid#115#K15#H",6:"1.5 DM-i#218,324#BYD-DMI#P",
7:"1.6 T-GDi#147,185#SQR",8:"1.5 PHEV#347#SQR#P",9:"1.0 T-GDi#100,120#G3LC",
a1:"1.2 MPi#84#G4LF",a2:"1.0 MPi#67#G3LD",a3:"1.5 T-GDi#160#G4LF",
a4:"2.0 TSI RS#245,265,300#DNNA",a5:"2.5 TFSI#390,400#DNW",
a6:"3.0 TDI#231,286,344#DDVE#D",a7:"3.0 TFSI#340,353,381#DKUA",
a8:"Électrique#170:58,204:77,286:77#APP310#EV",a9:"1.6 Hybrid#141#G4LE#H",
b1:"2.0 T-GDi#245,250,275,280,304#G4KH",b2:"1.5 Turbo#150,180#GSE",
b3:"1.0 Turbo#100,115,120#B10X",b4:"1.4 Turbo#125,140,150#B14T",
b5:"1.6 CDTI#110,136#B16D#D",b6:"2.0 CDTI#170,210#B20D#D",
b7:"1.5 dCi#75,90,110#K9K#D",b8:"2.0 dCi#110,150,170#M9R#D",
b9:"2.3 dCi#130,150,165,180#M9T#D",c1:"1.2 TCe#115,120#H5F",
c2:"1.6 dCi#130,160#R9M#D",c3:"1.7 Blue dCi#120,150#R9M#D",
c4:"1.2 E-Tech#200#HR12#H",c5:"1.2 TCe MHEV#130,140#HR12#H",
c6:"Électrique#122:52,150:52#EV-R5#EV",c7:"Électrique#170:60,220:87#6AK#EV",
c8:"1.0 SCe#65,75#H4D",c9:"1.0 ECO-G#100#H4D#G",
d1:"2.0 TDI#120,150,190,240#DFG#D",d2:"1.4 TSI#125,150#CZC",
d3:"2.0 TFSI#190,204,245,265#CVK",d4:"2.0 TDI#136,163,190,204#DEU#D",
d5:"Électrique#292:94.9,388:94.9,517:94.9#PPE#EV",
d6:"Électrique#476:93,598:93,646:93,925:105#J1#EV",
d7:"1.5 TSI MHEV#150#DUV#H",d8:"2.0 TDI#150,193#DTU#D",d9:"2.0 TSI#204,265,272#DTU",
e1:"1.6 THP#150,165,180,200,208#EP6",e2:"1.6 BlueHDi#75,100,120#DV6#D",
e3:"1.2 VTi#68,72,82#1KR",e4:"1.0 VTi#68,72#1KR",
e5:"Électrique#113:44#EV-C3#EV",e6:"1.2 Turbo#100,130#EB2",
e7:"1.2 PureTech#100#EB2LTED",e8:"1.6 PHEV#195,225#EP6#P",
e9:"Électrique#136:75#ZKX#EV",f1:"2.0 EcoBlue#150,190#YLCB#D",
f2:"1.5 EcoBlue#95,120#B7DA#D",f3:"1.5 EcoBoost#150#B3CB",
f4:"2.5 PHEV#225,243#BGCA#P",f5:"2.5 FHEV#190#BGCA#H",
f6:"Électrique#286:77,340:79#APP310#EV",f7:"1.0 EcoBoost#100,125,140#B3CA",
f8:"2.3 EcoBoost#280,347#YVC",f9:"Électrique#269:70,294:91,351:91,487:91#EV-MAC#EV",
g1:"1.5 VTEC Turbo#173,182,193#L15C",g2:"1.0 VTEC Turbo#129#P10A",
g3:"2.0 Type R#320,329#K20C",g4:"1.6 i-DTEC#120#N16#D",
g5:"2.0 e:PHEV#184#LFA#P",g6:"Électrique#204:68.4#EV-ENY#EV",
h1:"1.5 Skyactiv-G#75,90,115#P5-VPS",h2:"2.0 Skyactiv-X#180,186#SPCCI",
h3:"2.5 Skyactiv-G#140,192,194#PY-VPS",h4:"3.3 e-Skyactiv D#200,254#T3-VPT#D",
h5:"2.5 e-Skyactiv PHEV#327#PY-VPS#P",h6:"2.4 Boxer#234#FA",
i1:"1.2 Dualjet#83,90#K12#H",i2:"1.0 Boosterjet#111#K10",i3:"1.4 Boosterjet#140#K14",
i4:"1.5#102#K15",i5:"1.2 Mild Hybrid#82#Z12E#H",
i6:"Électrique#144:49,174:61,184:61#EV-EVT#EV",
j1:"2.4 PHEV#188,203,248,306#4B12#P",j2:"1.5 MIVEC Turbo#163#4B40",
j3:"2.2 DI-D#150,180#4N14#D",j4:"1.6 MIVEC#117#4A9",j5:"2.0 MIVEC#150#4B11",
k1:"2.0i e-Boxer#150#FB20#H",k2:"2.5i#169#FB25",k3:"1.6i#114#FB16",
k4:"Électrique#218:71.4,343:71.4#1YM#EV",
l1:"1.0 T-GDi#120#G3LC",l2:"1.4 T-GDi#140#G4LD",l3:"2.2 CRDi#202#D4HB#D",
l4:"1.6 T-GDi MHEV#150#G4FT#H",l5:"1.6 CRDi MHEV#136#D4FE#H",
l6:"Électrique#204:58.3,204:81.4#EM16#EV",l7:"Électrique#170:58,229:77.4,325:77.4,585:77.4#EM21#EV",
l8:"Électrique#204:99.8,385:99.8,508:99.8#EM23#EV",
l9:"Électrique#156:48.4,218:65.4#EM16#EV",m1:"1.6 PHEV#141,183#G4LE#P",
m2:"Électrique#204:64.8#EM16#EV",m3:"2.5 T-GDi#304#G4KN",m4:"3.5 T-GDi#380,415#G6DP",
m5:"2.2 CRDi#210#D4HC#D",m6:"1.5 T-GDi#163#G15T",m7:"1.6 e-XDi#115,136#D16DT#D",
m8:"2.2 e-XDi#181,202#D20DT#D",n1:"1.3 DIG-T#140,158,160#HR13",
n2:"1.3 DIG-T MHEV#140,158#HR13#H",n3:"1.5 e-POWER#190,204,213#KR15#H",
n4:"1.0 DIG-T#114,117#HR10",n5:"1.6 Hybrid#143#HR16#H",
n6:"Électrique#150:40,217:62#EM57#EV",n7:"Électrique#218:63,242:87,306:87,394:87#EV-ARI#EV",
o1:"1.5 D-4D#100,120#DV5#D",o2:"2.0 D-4D#145,150,180#DW10#D",
o3:"2.8 D-4D#177,204,205#1GD#D",o4:"2.4 D-4D#150#2GD#D",
o5:"1.5 Hybrid#116,130#M15A-FXE#H",o6:"1.5 VVT-i#125#M15A",o7:"1.0 VVT-i#69,72#1KR",
o8:"1.6 GR#261,280,300#G16E",o9:"1.2 Turbo#116#8NR",
p1:"2.0 Hybrid#184,199#M20A-FXS#H",p2:"Électrique#313:71.4,381:71.4#EV-RZ#EV",
p3:"Électrique#204:54.3,204:72.8#EV-UX#EV",
q1:"2.0 PHEV#380#EC1#P",q2:"2.0 Turbo#272#EC1",q3:"1.3 PHEV 4xe#190,240#GSE#P",
q4:"1.3 T4#130,150,180#GSE",q5:"1.0 T3#120#GSE",
r1:"1.0 FireFly#100#GSE",r2:"1.0 FireFly Hybrid#70#GSE#H",r3:"1.2 Fire#69#169A4",
r4:"0.9 TwinAir#85,105#312A2",r5:"1.3 MultiJet#80,95#552#D",
r6:"2.2 MultiJet#120,140,180#F1AGL#D",r7:"Électrique#95:23.8,118:42#EV-500#EV",
r8:"Électrique#122:70,270:110#EV-DUC#EV",r9:"1.4 T-Jet#120,145,165,180#312A1",
s1:"2.9 V6 QV#510,520#690T",s2:"1.75 TBi#240#940B",s3:"1.3 PHEV Q4#280#GSE#P",
s4:"Électrique#156:54,240:54,280:54#EM0#EV",s5:"1.2 Hybrid#136,156#EB2LTEDH#H",
t1:"3.0 D#249,250,300,350#AJ200D#D",t2:"3.0 P#360,400#AJ300",
t3:"2.0 P400e#404#PT204#P",t4:"5.0 V8#525,550,575#AJ133",t5:"4.4 V8#530,635#N63",
u1:"3.0 V6#340,353,440,474#CWV",u2:"4.0 V8#550,640,659#EA825",
u3:"3.0 E-Hybrid#462,470#CWV#P",u4:"2.9 V6#330,354,367,440#CSZ",
u5:"3.6 T-Hybrid#541#9A2#H",u6:"3.0 Carrera#385,394,450,480#9A2",
u7:"3.7 Turbo S#650,711#9A2",u8:"4.0 GT#400,420,500,520#9A1",
v1:"2.0 T4#190#B4204",v2:"2.0 D3#150#D4204#D",v3:"2.0 D4#190#D4204#D",
v4:"1.5 T3#163#B3154",v5:"1.5 T5 PHEV#262#B3154#P",v6:"2.0 T6 PHEV#350#B4204#P",
v7:"2.0 B3 MHEV#163#B4204#H",v8:"2.0 B6 MHEV#300#B4204#H",
v9:"Électrique#272:51,272:69,428:69#SEA#EV",
w1:"Électrique#231:69,252:82,408:82#EV-EX4#EV",
w2:"Électrique#313:111,408:111,517:111#EV-EX9#EV",
w3:"Électrique#231:64,272:69,299:82,408:78,476:78#EV-PS2#EV",
w4:"Électrique#272:100,544:100#SEA#EV",w5:"Électrique#489:111,517:111#EV-PS3#EV",
x1:"1.5 Hybrid+#194#MG3-HEV#H",x2:"Électrique#170:51,204:64,245:77,435:64#EV-MG4#EV",
x3:"1.5 T-GDi#162#15E4E",x4:"1.5 PHEV#258#15E4E#P",
x5:"Électrique#143:44.5,156:51,156:72#EV-ZS#EV",
x6:"Électrique#314:64,340:77,544:77#EV-CYB#EV",
y1:"Électrique#204:60.5#BYD#EV",y2:"Électrique#95:44.9,176:60.4,204:60.4#BYD#EV",
y3:"Électrique#313:82.5,530:82.5#BYD#EV",y4:"Électrique#177:51.1#BYD#EV",
y5:"Électrique#88:30,115:43.2#BYD#EV",y6:"Électrique#517:108.8#BYD#EV",
z1:"Électrique#258:66,286:87.5,487:87.5#EV-XG6#EV",
z2:"Électrique#313:98,551:98#EV-XG9#EV",z3:"Électrique#276:86.2,473:86.2,505:86.2#EV-XP7#EV",
z4:"Électrique#490:75,490:100#EV-NIO#EV",z5:"Électrique#653:100#EV-NIO#EV",
z6:"Électrique#272:66,428:66#SEA#EV",z7:"Électrique#272:100,544:100,580:100#SEA#EV",
z8:"Électrique#218:69.9#EV-LM#EV",z9:"Électrique#218:67.1#EV-LM#EV",
A1:"Électrique#95:37.3,109:41.3#EV-LM#EV",A2:"1.5 EREV#218:28.4#RE-ROT#P",
A3:"Électrique#204:61#EV-OM#EV",A4:"Électrique#171:48,171:63#EV-ORA#EV",
A5:"1.5 PHEV#261,276#JLH#P",A6:"1.5 HEV#150#JLH#H",
B1:"2.0 Turbo#184,208#B48",B2:"3.0 Diesel#265,286,298#B57#D",
B3:"2.0 PHEV#292,299#B48#P",B4:"3.0 PHEV#489#B58#P",B5:"4.4 V8#530#N63",
B6:"2.0 M#306,317#B48",B7:"Électrique#340:81.2,389:81.2,601:81.2#GEN5#EV",
B8:"Électrique#455:101.7,544:101.7,660:101.7#GEN5#EV",
B9:"Électrique#326:76.6,385:76.6,523:111.5,619:111.5#GEN5#EV",
C1:"Électrique#204:64.7,272:64.7,313:64.7#GEN5#EV",C2:"1.5#136,140,156#B38",
C3:"Électrique#286:70.2,340:83.9,544:83.9#GEN5#EV",C4:"Électrique#286:80#GEN5#EV",
C5:"Électrique#313:108,469:108#NK#EV",C6:"3.0 M#360,374,387,398#B58",
D1:"2.0 A#224#M260",D2:"2.0 AMG#306,310#M260",D3:"2.0 AMG S#421#M139",
D4:"1.3 PHEV#218#M282#P",D5:"2.0 C220d#200#OM654#D",D6:"2.0 C300e#313#M254#P",
D7:"2.0 E300e#312#M254#P",D8:"3.0 E400e#381#M256#P",D9:"2.0 GLC300e#313#M254#P",
E1:"3.0 #381,435#M256#H",E2:"4.0 V8#503,510#M176#H",E3:"3.0 d#330,340#OM656#D",
E4:"2.0 d#197,269#OM654#D",E5:"3.0 PHEV#510#M256#P",
E6:"Électrique#190:66.5,228:66.5,292:66.5#EVA#EV",
E7:"Électrique#245:89,292:96,408:90.6,544:90.6#EVA#EV",
E8:"Électrique#333:107.8,360:107.8,453:107.8,523:107.8#EVA#EV",
E9:"Électrique#272:85,354:85#MMA#EV",F1:"Électrique#360:94,490:94#MMA#EV",
F2:"2.2 CDI#136,163#OM651#D",F3:"2.0 CDI#190,239#OM654#D",
F4:"1.6 CDI#102#OM622#D",F5:"1.5 CDI#95,116#OM608#D",
F6:"Électrique#116:55,116:113#EV-SPR#EV",F7:"Électrique#204:90#EV-VIT#EV",
F8:"Électrique#122:45#EV-EQT#EV",F9:"4.0 AMG#585,612#M177#H",
G1:"1.5 C#170#B38#H",G2:"2.0 S#178,192,218,245#B48",G3:"2.0 JCW#231,300,306,317#B48",
G4:"1.5 Cooper#136#B38",G5:"1.5 D#116#B37#D",G6:"2.0 SD#170#B47#D",
G7:"Électrique#184:32.6#EV-MIN#EV",G8:"1.5 PHEV#220#B38#P",
G9:"Électrique#190:40.7,218:54.2,258:54.2#EV-CO#EV",
H1:"Électrique#190:42.5,218:54.2,260:54.2#SEA#EV",
H2:"Électrique#204:64.7,313:64.7#EV-CM#EV",
H3:"Électrique#82:17.6#EV-FTW#EV",H4:"Électrique#272:49,272:66,428:66#SEA#EV",
H5:"Électrique#360:76,360:100,646:100#SEA#EV",
I1:"1.5#102#B38",I2:"2.0#178,192#B48",I3:"2.0#231#B48",
J1:"Électrique#670:100,750:100,1020:100#TS#EV",
J2:"Électrique#283:60,351:75,440:79,460:79,498:75,510:79#3D3#EV",
J3:"Électrique#299:60,440:79,534:79,510:75#3D3#EV",
J4:"Électrique#600:123,845:123#CT#EV",J5:"Électrique#1020:200#TR#EV",
K1:"3.0 V6#350,430#F160",K2:"3.0 V6 D#275#VM#D",K3:"2.0 Hybrid#330#GME#H",
K4:"3.0 Trofeo#530,550,630#M156",K5:"3.8 V8#580#F154",
K6:"Électrique#410:105#EV-GRC#EV",K7:"Électrique#761:92.5#EV-GT#EV",
L1:"6.0 W12#608,635,659#W12",L2:"3.0 V6 PHEV#462,544#CWV#P",
L3:"4.0 V8 PHEV#680,782#EA825#P",L4:"6.75 V12#571,600#N74",
L5:"Électrique#585:102#EV-RR#EV",
M1:"3.9 V8#620,663,720#F154",M2:"3.0 V6 PHEV#830#F163#P",
M3:"4.0 V8 PHEV#1000#F154#P",M4:"6.5 V12#725,800,830#F140",
N1:"4.0 V8#650,666#CEH",N2:"4.0 V8 PHEV#800,920#CEH#P",N3:"5.2 V10#610,640#L520",
N4:"6.5 V12 PHEV#1015#L539#P",O1:"4.0 V8#510,550,665,680,707#M177",
O2:"5.2 V12#608,639#AE31",O3:"4.0 V8 PHEV#1079#M177#P",
O4:"4.0 V8#620,720,750,765#M840",O5:"3.0 V6 PHEV#680,700#M630#P",
Q1:"8.0 W16#1500,1600#W16",Q2:"8.3 V16 PHEV#1800#V16#P",
R1:"1.9 Ddi#150,163#RZ4E#D",R2:"2.2 Ddi#163#RZ4E#D",
R3:"3.0 F1C#140,160,180,210#F1C#D",R4:"Électrique#190:74,190:111#EV-DAY#EV",
S1:"1.0#68#B10D",S2:"1.2#82#B12D",S3:"1.6 CDTI#136#B16D#D",
T1:"0.5 DCI#8#DCI#D",T2:"Électrique#8:8,14:12,20:12#EV-AIX#EV",
U1:"Électrique#282:113,564:113#EV-OCN#EV",
U2:"Électrique#480:88,620:112,1234:118#EV-AIR#EV",
U3:"Électrique#828:123#EV-GRV#EV",
V1:"Électrique#177:59.6,204:59.6#EV-VF6#EV",V2:"Électrique#204:75.3,354:75.3#EV-VF7#EV",
V3:"Électrique#354:87.7,408:87.7#EV-VF8#EV",V4:"Électrique#408:123#EV-VF9#EV",
W1:"Électrique#435:99,551:120#EV-HQ9#EV",W2:"1.5 T-GDi#177#4A15T",
W3:"Électrique#204:85.9#EV-FRT#EV",W4:"Électrique#313:103#BYD#EV",
W5:"1.5 Turbo#143,150#GW4B15",W6:"2.0 Turbo#204#GW4C20",W7:"1.5 PHEV#326,347#GW4B15#P",
W8:"1.5 HEV#190#GW4B15#H",W9:"2.0 PHEV#476#GW4C20#P",
X1:"1.5 Turbo#145#SFG15",X2:"Électrique#163:52#EV-SER#EV",
X3:"Électrique#299:80#EV-SER5#EV",X4:"1.5 EREV#456:40#RE-ROT#P",
Y1:"Électrique#177:52.5,177:70#EV-MX5#EV",Y2:"Électrique#204:70#EV-MX6#EV",
Y3:"Électrique#204:88.5#EV-MXT9#EV",Y4:"Électrique#163:50.2#EV-MXD3#EV",
Z1:"Électrique#612:112,918:112#SEA#EV",Z2:"Électrique#612:102,918:102#SEA#EV",
Z3:"2.0 Turbo#365#M139",Z4:"3.5 V6#405#2GR",
01:"Électrique#156:51#EM0#EV",02:"Électrique#230:74,350:97#STLA#EV",
03:"1.5 Turbo#147,186#SQR",04:"1.5 PHEV#347,530#SQR#P",
05:"Électrique#170:52,204:77#APP310#EV",06:"Électrique#286:77,340:77#APP550#EV",
07:"Électrique#218:52,226:52,226:79#MEB#EV",08:"Électrique#116:38,150:52,204:52#MEB#EV",
09:"1.8 TCe#252,292,300,350#M5P",10:"Électrique#180:52,220:52#EV-R5#EV",
11:"Électrique#400:89,470:89,540:89#EV-A39#EV",
12:"1.6 Hybrid#140,155#H4M#H",13:"1.2 TCe MHEV#130,140#HR12#H",
14:"Électrique#45:26.8,65:26.8,70:26.8#EV-SPR#EV",
15:"Électrique#95:40,122:52,150:52#EV-R5#EV",
16:"Électrique#82:27.5,95:27.5#EV-TWI2#EV",17:"Électrique#122:45#EV-KAN#EV",
18:"Électrique#76:52,143:87#EV-MAS#EV",19:"Électrique#122:52#EV-TRA#EV",
20:"Électrique#8:5.5#AMI#EV",21:"1.4 Fire#95#843A1",22:"1.5 Hybrid#130#GSE#H",
23:"Électrique#155:42#EV-500A#EV",24:"Électrique#240:54#EM0#EV",
25:"1.8 Hybrid#136#2ZR-FXE#H",26:"2.0 Turbo#258#B48",27:"3.0 Turbo#340,382#B58",
28:"1.3 TCe#130#H5H",29:"1.6 dCi#130#R9M#D",30:"2.0 dCi#175#M9R#D",
31:"1.8 TCe#225#M5P",32:"1.6 TCe#150,200#M5M",33:"1.5 Blue dCi#95,115#K9K#D",
34:"1.0 TCe#110#H4D",35:"1.2 TCe#130#H5F",36:"1.3 TCe#115,140,160#H5H",
37:"1.8 RS#280,300#M5P",38:"1.5 dCi#90,110#K9K#D",39:"0.9 TCe#90#H4B",
40:"1.2 TCe#120#H5F",41:"1.7 Blue dCi#150#R9M#D",42:"2.0 dCi#150,175,200#M9R#D",
43:"1.6 RS#200,220#M5M",44:"1.33#99#1NR",45:"1.5 Hybrid#100#1NZ#H",
46:"1.5 GRMN#212#2ZR",47:"1.0 Hybrid#116#1KR#H",48:"2.0 PHEV#223#M20A#P",
49:"1.8 Hybrid#122,220#2ZR-FXE#H",50:"2.5 Hybrid#230#A25A-FXS#H",
51:"2.5 Hybrid#248#A25A-FXS#H",52:"2.8 D-4D MHEV#204,205#1GD#H",
53:"Électrique#204:71.4,218:71.4,313:71.4#1YM#EV",54:"Électrique#144:49,174:61,184:61#1YM#EV",
55:"Électrique#170:57,224:77,313:77#1YM#EV",56:"2.5 Hybrid#250#A25A-FXS#H",
57:"2.5 Hybrid#223#2AR-FSE#H",58:"2.5 Hybrid#218#A25A-FXS#H",
59:"2.4 Turbo Hybrid#371#T24A#H",60:"2.5 PHEV#309#A25A#P",
61:"1.5 Hybrid#136#M15A-FXE#H",62:"0.9 IG-T#90#HR09",63:"1.0 IG-T#100,117#HR10",
64:"1.2 e-POWER#109#HR12#H",65:"1.2 DIG-T#115#HR12",66:"1.6 dCi#130#R9M#D",
67:"1.7 dCi#150#R9M#D",68:"Électrique#176:52,218:75#EV-LF3#EV",
69:"2.3 dCi#163,190#YS23#D",70:"3.8 V6#570,600#VR38",
71:"1.3 i-VTEC#102#L13Z",72:"1.5 Sport#130#L15B",73:"1.5 i-VTEC#130#L15B",
74:"Électrique#176:17.7#EV-FCEV#EV",75:"1.5 Skyactiv-D#105#S5-DPTS#D",
76:"1.5 Hybrid#116#M15A-FXE#H",77:"2.0 Skyactiv-G#145,165#PE-VPS",
78:"1.8 Skyactiv-D#115#S8-DPTS#D",79:"2.0 Skyactiv-G#121,150#PE-VPS",
80:"2.5 Skyactiv-G#140#PY-VPS",81:"1.5 Skyactiv-G#131#P5-VPS",
82:"2.0 Skyactiv-G#160,184#PE-VPS",83:"Électrique#143:35.5#EV-MX#EV",
84:"0.8 R-EV#170#RE-ROT#P",85:"Électrique#258:68.8,245:80#EV-MZ6#EV",
86:"1.4 Sport#140#K14",87:"1.6 VVT#120#M16A",88:"1.5 5p#102#K15",
89:"1.0 MIVEC#71#3A9",90:"1.2 MIVEC#80#3A9",91:"1.3 Turbo#140,158#HR13",
92:"2.4 DI-D#154,181#4N15#D",93:"1.0#65#H4D",94:"1.0 Turbo#90#H4D",
95:"2.0i#150#FB20",96:"2.4 Turbo#260#FA24",97:"2.5 Turbo#300#EJ25",
98:"1.0 T-GDi N#204#G3LC",99:"1.0 T-GDi MHEV#100,120#G3LC#H"
};

var SEG={C:"Citadine",Y:"Micro-citadine",K:"Compacte",B:"Berline",T:"Break",S:"SUV",
U:"SUV urbain",E:"SUV compact",W:"SUV premium",M:"Monospace",L:"Ludospace",F:"Utilitaire",
G:"Grand utilitaire",V:"Van",P:"Pickup",R:"Roadster",X:"Coupé sport",Q:"Quadricycle",
Z:"Berline premium",H:"Berline électrique",J:"SUV électrique",N:"SUV coupé"};

var RAW={
peugeot:["Peugeot","FR",`
108~108~17~21~Y~@e4;1.2 PureTech#82#EB2
208-1~208 I~17~19~C~1.2 PureTech#82,110#EB2;@e2;1.6 THP GTi#208#EP6
208-2~208 II~19~25~C~@a;@c;@h
208-2f~208 II restylée~25~27~C~@b;Électrique#156:51,156:54#ZKX#EV
208-3~208 III~26~27~C~@b;Électrique#156:51,210:73#STLA#EV
2008-1~2008 I~17~19~U~1.2 PureTech#82,110,130#EB2;@c;@e2
2008-2~2008 II~19~27~U~@a;@b;@c;@h
308-2~308 II~17~21~K~1.2 PureTech#110,130#EB2;1.6 PureTech GTi#250,270#EP6;@c;@f
308-3~308 III~21~27~K~@a;@b;@c;@e;@i
308-3sw~308 III SW~21~27~T~@a;@b;@c;@e
408~408~22~27~N~@b;@e;@j
3008-2~3008 II~17~23~E~1.2 PureTech#130#EB2;@d;@c;@f;1.6 PHEV#225,300#EP6#P
3008-3~3008 III~24~27~E~@b;Électrique#210:73,230:97,320:73#STLA#EV
5008-2~5008 II~17~24~S~1.2 PureTech#130#EB2;@d;@c;2.0 BlueHDi#180#DW10#D
5008-3~5008 III~24~27~S~@b;@j
508-2~508 II~18~27~B~@d;@c;@f;1.6 PHEV#225,360#EP6#P
508-2sw~508 II SW~19~27~T~@d;@c;2.0 BlueHDi#180#DW10#D;@e
508pse~508 PSE~21~27~B~1.6 PHEV#360#EP6#P
rifter~Rifter~18~27~L~@a;@c;@h
traveller~Traveller~17~27~V~@c;@f;@e9
partner~Partner~18~27~L~@a;@c;@h
expert~Expert III~17~27~F~@c;@f;@e9
boxer~Boxer III~17~27~G~@g;@r8
`],
renault:["Renault","FR",`
twingo-3~Twingo III~17~24~Y~@39;@c8;Électrique#82:22#EV-TWI#EV
twingo-e~Twingo E-Tech~26~27~Y~@16
clio-4~Clio IV~17~20~C~@39;@40;@b7;@43
clio-5~Clio V~19~26~C~@c8;@t;@c9;1.3 TCe#130#H5H;@v;@w
clio-6~Clio VI~25~27~C~1.2 TCe#115#HR12;@w;1.8 E-Tech#160#HR18#H
captur-1~Captur I~17~19~U~@39;@40;@38
captur-2~Captur II~19~27~U~@t;@u;@v;@w;1.6 PHEV#160#H4M#P
megane-4~Mégane IV~17~24~K~@35;@36;@v;@29;@37
megane-4rs~Mégane IV RS Trophy~18~23~X~@37
megane-e~Mégane E-Tech~22~27~J~Électrique#130:40,220:60#6AK#EV
scenic-4~Scenic IV~17~22~M~@36;@v;@c3
scenic-e~Scenic E-Tech~24~27~J~@c7
kadjar~Kadjar~17~22~E~@35;@36;@v;@41
koleos~Koleos~17~22~W~@41;@30
arkana~Arkana~21~27~N~1.3 TCe MHEV#140,160#H5H#H;@w
austral~Austral~22~27~E~@c5;1.3 TCe MHEV#140,160#H5H#H;@c4
symbioz~Symbioz~24~27~E~1.3 TCe MHEV#140#H5H#H;@w
rafale~Rafale~24~27~N~@c4;1.2 E-Tech 4Control#300#HR12#P
espace-5~Espace V~17~23~M~@31;@42
espace-6~Espace VI~23~27~S~@c4
talisman~Talisman~17~22~B~@32;@29;@30
r4~Renault 4 E-Tech~25~27~J~c6
r5~Renault 5 E-Tech~24~27~J~@15
r5gtl~5 Turbo 3E~26~27~X~Électrique#544:70#EV-R5T#EV
zoe~Zoe~17~24~C~Électrique#92:41,108:41,135:52#5AM#EV
kangoo-2~Kangoo II~17~21~L~@c1;@b7;Électrique#60:33#EV-KAN#EV
kangoo-3~Kangoo III~21~27~L~@28;@33;@17
trafic~Trafic III~17~27~F~@c2;@b8;@19
master~Master III~17~27~G~@b9;@18
estafette~Estafette~26~27~G~Électrique#122:45,143:60#EV-EST#EV
`],
citroen:["Citroën","FR",`
c1~C1~17~21~Y~@e4;1.2 PureTech#82#EB2
c3-3~C3 III~17~24~C~1.2 PureTech#68,83,110#EB2;@c;@e2
c3-4~C3 IV~24~27~C~@e7;@b;@e5
c3air-1~C3 Aircross I~17~24~U~1.2 PureTech#82,110,130#EB2;@c
c3air-2~C3 Aircross II~24~27~U~@b;@e5
c4-2~C4 II SpaceTourer~17~22~K~@a;@c;@f
c4-3~C4 III~20~27~K~@a;@b;@c;Électrique#136:50,156:54#ZKX#EV
c4x~C4 X~22~27~N~1.2 PureTech#130#EB2;@b;@i
c5air-1~C5 Aircross I~18~25~E~1.2 PureTech#130#EB2;@d;@c;2.0 BlueHDi#180#DW10#D;1.6 PHEV#225#EP6#P
c5air-2~C5 Aircross II~25~27~E~@b;@c;@e8;@j
c5x~C5 X~21~27~T~1.2 PureTech#130#EB2;@d;@e
berlingo~Berlingo III~18~27~L~@a;@c;@h
spacetourer~SpaceTourer~17~27~V~@c;@f;@e9
jumpy~Jumpy III~17~27~F~@c;@f;@e9
jumper~Jumper III~17~27~G~@g;@r8
ami~Ami Buggy~20~27~Q~@20
`],
ds:["DS Automobiles","FR",`
ds3~DS 3~17~19~C~1.2 PureTech#82,110,130#EB2;@e2;1.6 THP#208#EP6
ds3cb~DS 3 Crossback~18~26~U~1.2 PureTech#100,130,155#EB2;1.5 BlueHDi#110#DV5#D;@h
ds4-2~DS 4 II~21~27~K~1.2 PureTech#130#EB2;@d;@c;@e
ds5~DS 5~17~18~B~@e1;@f;2.0 Hybrid4#200#DW10#H
ds7~DS 7 Crossback~17~27~W~1.2 PureTech#130#EB2;@d;@c;2.0 BlueHDi#180#DW10#D;E-Tense#225,300,360#EP6#P
ds9~DS 9~21~27~Z~1.6 PureTech#225#EP6;E-Tense#250,360#EP6#P
dsn4~DS N°4~26~27~K~@b;@j
dsn8~DS N°8~25~27~H~Électrique#230:74,350:97,375:97#STLA#EV
`],
dacia:["Dacia","RO",`
sandero-2~Sandero II~17~20~C~@39;1.0 SCe#75#H4D;@b7
sandero-3~Sandero III~21~27~C~1.0 SCe#65#H4D;@t;@c9
sandero-4~Sandero IV~26~27~C~1.0 TCe#100#H4D;@13;@12
logan-3~Logan III~21~27~B~1.0 SCe#65#H4D;@t;@c9
duster-2~Duster II~18~24~E~@t;@u;@33
duster-3~Duster III~24~27~E~@c9;@13;@12
lodgy~Lodgy~17~22~M~@28;@33
dokker~Dokker~17~21~L~@c1;@b7
jogger~Jogger~22~27~M~@34;@c9;@12
spring~Spring~21~27~Y~@14
bigster~Bigster~25~27~S~@c9;1.2 TCe MHEV#140#HR12#H;1.6 Hybrid#155#H4M#H;1.2 TCe 4x4#130#HR12
`],
alpine:["Alpine","FR",`
a110~A110~17~27~X~@09
a110r~A110 R / GT~22~27~X~1.8 TCe#300,350#M5P
a290~A290~24~27~C~@10
a390~A390~25~27~N~@11
`],
volkswagen:["Volkswagen","DE",`
up~up! e-up!~17~23~Y~1.0 MPI#60,75#CHY;1.0 TSI GTI#115#DKL;Électrique#82:36.8#EV-UP#EV
polo~Polo VI~17~27~C~1.0 MPI#65,80#CHY;@k;@m;2.0 TSI GTI#200,207#CZP
golf-7~Golf VII~17~20~K~1.0 TSI#85,110#CHZ;@d2;@m;1.6 TDI#115#DDYA#D;2.0 TDI#150,184#CRL#D;2.0 TSI GTI#230,245#CZP;2.0 TSI R#300,310#CJX;1.4 GTE#204#DGE#P;Électrique#136:35.8#EV-GLF#EV
golf-8~Golf VIII~19~27~K~@k;@l;@m;@n;@o;2.0 TSI GTI#245,265,300#DNNA;2.0 TSI R#320,333#DNF;@q;@r
golf-8sw~Golf VIII Variant~20~27~T~@l;@n;@o;2.0 TSI R#320#DNF
tcross~T-Cross~19~27~U~@k;@m
troc~T-Roc~17~27~E~@k;@m;2.0 TSI#190,300#CZP;@o
troc-cab~T-Roc Cabriolet~20~24~R~1.0 TSI#115#DKL;@m
tiguan-2~Tiguan II~17~24~E~@d2;@m;2.0 TSI#190,230,245#CZP;@d1;@q
tiguan-3~Tiguan III~24~27~E~@d7;@d8;@d9;@r
tayron~Tayron~25~27~S~@d7;@d8;@d9;@r
touareg~Touareg III~18~27~W~@a7;@a6;4.0 TDI V8#421#DDVE#D;3.0 eHybrid#381,462#DKUA#P
passat-b8~Passat B8~17~23~B~@d2;@m;2.0 TSI#190,272#CZP;@d1;1.4 GTE#218#DGEA#P
passat-b9~Passat B9 Variant~24~27~T~@d7;@d8;@d9;@r
arteon~Arteon Shooting Brake~17~24~N~2.0 TSI#190,280,320#CZP;@d1;1.4 eHybrid#218,272#DGEA#P
touran~Touran~17~22~M~1.0 TSI#115#DKL;@m;@d1
sharan~Sharan~17~22~V~@d2;@d1
id3~ID.3~20~27~J~Électrique#150:58,170:58,204:77,326:79#APP310#EV
id4~ID.4~21~27~J~Électrique#148:52,174:77,204:77,286:77,340:79#APP310#EV
id5~ID.5~22~27~J~Électrique#174:77,204:77,299:77#APP310#EV
id7~ID.7 Tourer~23~27~H~Électrique#286:77,286:86,340:86#APP550#EV
idbuzz~ID. Buzz~22~27~V~Électrique#204:77,204:86,340:86#APP310#EV
id2~ID.2all EVERY1~26~27~C~Électrique#95:38,116:45,226:56#MEB#EV
caddy~Caddy V~20~27~L~1.5 TSI#114#DPB;2.0 TDI#75,102,122#DTSA#D;@r
multivan~Multivan T7~21~27~V~1.4 eHybrid#218#DGEA#P;@d9;@d8
transporter~Transporter T6.1~17~24~F~2.0 TDI#90,110,150,199,204#CXH#D
transporter7~Transporter T7~24~27~F~@d8;Électrique#136:64,286:77#EV-TRA#EV
crafter~Crafter~17~27~G~2.0 TDI#102,140,177#DMZ#D;Électrique#136:35#EV-CRA#EV
`],
audi:["Audi","DE",`
a1~A1 GB~18~27~C~1.0 TFSI#95,110#DKL;1.5 TFSI#150#DPCA;2.0 TFSI#200,207#CZP
a3~A3 8Y~20~27~K~1.0 TFSI#110#DKL;1.5 TFSI#150#DPCA;@o;2.0 TFSI S3#310,333#DNF;@a5;@q
a3-8v~A3 8V~17~20~K~1.0 TFSI#115#DKL;@d2;1.5 TFSI#150#DPCA;@d1;2.0 TFSI S3#310#CJX;@a5;1.4 e-tron#204#DGEA#P
a4~A4 B9~17~24~B~1.4 TFSI#150#CZC;@d3;@d4;3.0 TDI#286#DDVE#D
a5~A5 B10~24~27~B~2.0 TFSI#150,204,272#DKN;2.0 TDI#204#DETA#D;3.0 TFSI S5#367#DKUA
a5-b9~A5 B9 Coupé Sportback~17~24~X~@d3;@d4;3.0 TFSI S5#354#CWV;2.9 TFSI RS5#450#CSZ
a6~A6 C8~18~27~Z~2.0 TFSI#204,265#DNN;2.0 TDI#204#DETA#D;@a6;2.0 TFSI e#299,367#CYR#P;3.0 TFSI e#462#DKUA#P
a6e~A6 e-tron~24~27~H~Électrique#245:83,300:83,380:83,503:83,551:100#PPE#EV
a7~A7 C8~18~27~N~2.0 TFSI#245,265#DNN;@a6;@a7;2.0 TFSI e#367#CYR#P
a8~A8 D5~17~27~Z~@a7;4.0 TFSI S8#571#CWV;3.0 TDI#286#DDVE#D;3.0 TFSI e#462#DKUA#P
q2~Q2~17~27~U~1.0 TFSI#110#DKL;1.5 TFSI#150#DPCA;@o;2.0 TFSI SQ2#300#DNF
q3~Q3 F3~18~27~E~1.5 TFSI#150#DPCA;2.0 TFSI#190,230,245#DKT;@d1;2.5 TFSI RS Q3#400#DNW;1.4 TFSI e#245#DGEA#P
q4~Q4 e-tron~21~27~J~Électrique#170:52,204:77,286:77,299:77,340:79#APP310#EV
q5~Q5 FY GU~17~27~W~2.0 TFSI#204,245,265#DKT;@d4;3.0 TFSI SQ5#354,367#CWV;2.0 TFSI e#299,367#CYR#P
q6~Q6 e-tron~24~27~J~@d5
q7~Q7 4M~17~27~W~@a7;@a6;4.0 TDI SQ7#435#DDVE#D;3.0 TFSI e#381,462,490#DKUA#P
q8~Q8 4M~18~27~N~@a7;3.0 TDI#286#DDVE#D;4.0 TFSI SQ8#507#CWV;4.0 TFSI RS Q8#600,640#CWV
q8e~Q8 e-tron~19~27~J~Électrique#340:71,408:95,503:114#EAS#EV
etrongt~e-tron GT RS~21~27~H~@d6
tt~TT TTS~17~23~X~2.0 TFSI#197,245,306#CZP;2.5 TFSI TT RS#400#DNW
r8~R8~17~23~X~5.2 V10#540,570,620#L520
`],
skoda:["Škoda","CZ",`
citigo~Citigo-e~17~21~Y~1.0 MPI#60,75#CHY;Électrique#83:36.8#EV-CIT#EV
fabia-3~Fabia III~17~21~C~1.0 MPI#60,75#CHY;1.0 TSI#95,110#CHZ;1.4 TDI#90#CYY#D
fabia-4~Fabia IV~21~27~C~1.0 MPI#80#CHY;@k;@m
scala~Scala~19~27~K~@k;@m
rapid~Rapid Spaceback~17~19~K~1.0 TSI#95,110#CHZ;1.4 TDI#90#CYY#D
octavia-3~Octavia III~17~20~K~1.0 TSI#115#CHZ;@d2;@m;@d1;2.0 TSI RS#230,245#CZP
octavia-4~Octavia IV~20~27~K~@k;@l;@m;@n;@o;@a4;@q
superb-3~Superb III~17~24~B~@d2;@m;2.0 TSI#190,272,280#CZP;@d1;1.4 iV#218#DGEA#P
superb-4~Superb IV~24~27~B~@d7;@d8;@d9;@r
kamiq~Kamiq~19~27~U~@k;@m
karoq~Karoq~17~27~E~@k;@m;@o
kodiaq-1~Kodiaq I~17~24~S~@d2;@m;2.0 TSI#180,190,245#CZP;@d1
kodiaq-2~Kodiaq II~24~27~S~@d7;@d8;@d9;@r
enyaq~Enyaq Coupé~21~27~J~Électrique#180:58,204:77,286:77,299:77,340:79#APP310#EV
elroq~Elroq~24~27~J~Électrique#170:52,204:59,286:77#APP310#EV
epiq~Epiq~26~27~J~@08
vision~Vision 7S Grand~27~27~J~Électrique#204:89,286:89#MEB#EV
`],
seat:["SEAT","ES",`
mii~Mii electric~17~21~Y~1.0 MPI#60,75#CHY;Électrique#83:36.8#EV-MII#EV
ibiza-5~Ibiza V~17~27~C~1.0 MPI#65,80#CHY;@k;@m;1.6 TDI#95,115#DDYA#D
leon-3~Leon III~17~20~K~1.0 TSI#115#CHZ;@d2;@m;@d1;2.0 TSI Cupra#290,300,310#CJX
leon-4~Leon IV~20~27~K~@k;@l;@m;@n;@o;@q
arona~Arona~17~27~U~@k;@m;1.6 TDI#95,115#DDYA#D
ateca~Ateca~17~27~E~@k;@m;2.0 TSI#190,300#CZP;@o
tarraco~Tarraco~18~27~S~@m;2.0 TSI#190,245#CZP;@d1;@q
alhambra~Alhambra~17~22~V~@d2;@d1
toledo~Toledo IV~17~19~K~1.0 TSI#95,110#CHZ;1.4 TDI#90#CYY#D
`],
cupra:["Cupra","ES",`
ateca~Cupra Ateca~18~24~E~2.0 TSI#300#CZP
leon~Cupra Leon~20~27~K~2.0 TSI#245,300,310,333#DNNA;@q;@r
formentor~Formentor~20~27~N~@m;2.0 TSI#190,245,310,333#CZP;2.5 TFSI VZ5#390#DNE;@o;1.4 e-Hybrid#204,245#DGEA#P;@r
born~Born~21~27~J~Électrique#150:58,204:77,231:77,326:79#APP310#EV
tavascan~Tavascan~24~27~J~@06
terramar~Terramar~24~27~E~@d7;@d9;@r
raval~Raval~26~27~C~@07
`],
bmw:["BMW","DE",`
s1~Série 1 F40 F70~19~27~K~@C2;2.0 120i#178#B48;@B6;1.5 116d#116#B37#D;@G
s2~Série 2 Gran Coupé~20~27~K~1.5 218i#136#B38;2.0 220i#178#B48;2.0 M235i#306#B48;2.0 218d#150#B47#D
s2c~Série 2 Coupé G42~21~27~X~2.0 220i#184#B48;2.0 230i#245#B48;3.0 M240i#374#B58;2.0 220d#190#B47#D
m2~M2 G87~23~27~X~3.0 M#460,480#S58
s3~Série 3 G20~18~27~B~2.0 318i#156#B48;@F;@C6;2.0 318d#150#B47#D;@G;@B2;2.0 320e#204#B48#P;@B3
s3t~Série 3 Touring G21~19~27~T~2.0 320i#184#B48;@C6;@G;@B2;@B3
m3~M3 G80~21~27~B~3.0 M#480,510,530#S58
s4~Série 4 G22 G26~20~27~X~2.0 420i#184#B48;2.0 430i#245#B48;3.0 M440i#374#B58;2.0 420d#190#B47#D;3.0 430d#286#B57#D
m4~M4 G82~21~27~X~3.0 M#480,510,530#S58
s5~Série 5 G30 G60~17~27~Z~@B1;2.0 530i#252#B48;3.0 540i#340,381#B58;2.0 520d#190#B47#D;@B2;3.0 540d#340#B57#D;@B3;@B4
s7~Série 7 G70~22~27~Z~3.0 740i#381#B58;3.0 740d#300#B57#D;4.4 M760e#727#S63#P
s8~Série 8 G15~18~27~X~3.0 840i#340#B58;4.4 M850i#530#N63;4.4 M8 Comp#625#S63
x1~X1 F48 U11~17~27~E~1.5 sDrive18i#136#B38;2.0 sDrive20i#170,178,192#B48;2.0 sDrive18d#150#B47#D;2.0 xDrive20d#190,211#B47#D;@G8;1.5 xDrive30e#326#B38#P
x2~X2 F39 U10~18~27~N~1.5 sDrive18i#136#B38;2.0 sDrive20i#178,192#B48;2.0 M35i#306,317#B48;2.0 sDrive18d#150#B47#D
x3~X3 G01 G45~17~27~W~2.0 xDrive20i#184#B48;2.0 xDrive30i#252#B48;@C6;2.0 xDrive20d#190#B47#D;3.0 xDrive30d#286#B57#D;@B3
x4~X4 G02~18~27~N~2.0 xDrive20i#184#B48;@C6;2.0 xDrive20d#190#B47#D;3.0 xDrive30d#286#B57#D
x5~X5 G05~18~27~W~3.0 xDrive40i#340,381#B58;3.0 xDrive30d#286,298#B57#D;3.0 xDrive40d#340#B57#D;@B5;@B4
x6~X6 G06~19~27~N~3.0 xDrive40i#340,381#B58;3.0 xDrive30d#286,298#B57#D;4.4 M60i#530#S63
x7~X7 G07~19~27~W~3.0 xDrive40i#340,381#B58;3.0 xDrive40d#340,352#B57#D;4.4 M60i#530#S63
z4~Z4 G29~18~27~R~2.0 sDrive20i#197#B48;2.0 sDrive30i#258#B48;3.0 M40i#340,382#B58
i3~i3 i3s~17~22~C~Électrique#170:33,184:42.2#IB1#EV
i4~i4~21~27~H~@C3
i5~i5 Touring~23~27~H~@B7
i7~i7~22~27~H~@B8
ix~iX~21~27~J~@B9
ix1~iX1 iX2~22~27~J~@C1
ix3~iX3 G08~20~27~J~@C4
ix3na~iX3 Neue Klasse~26~27~J~@C5
`],
mini:["MINI","GB",`
hatch~MINI 3/5 portes F56~17~24~C~1.5 One#102#B38;@G4;@G2;@G3;@G5;@G6
se~MINI Cooper SE~19~24~C~@G7
clubman~Clubman F54~17~24~T~@G4;@G2;2.0 JCW#306#B48;2.0 Cooper D#150#B47#D
countryman-f60~Countryman F60~17~24~E~@G4;@G2;2.0 JCW#306#B48;@G8
countryman~Countryman U25~24~27~E~@G1;2.0 S ALL4#218,245#B48;@G3;@H2
cooper-j01~Cooper E J01~24~27~C~@G9
aceman~Aceman~24~27~U~@H1
`],
mercedes:["Mercedes-Benz","DE",`
classea~Classe A W177~18~27~K~@I;@D1;@D2;@D3;1.5 A180d#116#OM608#D;@K;@D4
classeb~Classe B W247~18~27~M~@I;2.0 B200d#150#OM654#D;2.0 B220d#190#OM654#D;@D4
cla~CLA C118 C119~19~27~N~1.3 CLA180#136#M282;1.3 CLA200#163#M282;@D1;@D2;@D3;@D4
claev~CLA électrique~25~27~H~@E9
classec~Classe C W206~21~27~B~1.5 C180#170#M254#H;1.5 C200#204#M254#H;2.0 C300#258#M254#H;2.0 C43 AMG#408#M139#H;2.0 C63 S E#680#M139#P;@D5;2.0 C300d#265#OM654#D;@D6;2.0 C300de#306#OM654#P
classee~Classe E W214~23~27~Z~2.0 E200#204#M254#H;2.0 E220d#197#OM654#D;3.0 E450#381#M256#H;@D7;@D8;2.0 E300de#306#OM654#P
classes~Classe S W223~20~27~Z~@E1;@E2;@E3;@E5
cle~CLE C236~23~27~X~2.0 CLE200#204#M254#H;2.0 CLE300#258#M254#H;3.0 CLE450#381#M256#H;2.0 CLE220d#197#OM654#D
gla~GLA H247~20~27~U~1.3 GLA200#163#M282;@D1;@D2;2.0 GLA200d#150#OM654#D;@D4
glb~GLB X247~19~27~E~1.3 GLB200#163#M282;2.0 GLB250#224#M260;@K
glc~GLC X254~22~27~W~2.0 GLC200#204#M254#H;2.0 GLC300#258#M254#H;2.0 GLC220d#197#OM654#D;2.0 GLC300d#269#OM654#D;@D9;2.0 GLC400e#381#M254#P
glcev~GLC électrique~26~27~J~@F1
gle~GLE V167~18~27~W~3.0 GLE450#381#M256#H;3.0 GLE400d#330#OM656#D;3.0 GLE350de#333#OM654#P;@F9
gls~GLS X167~19~27~W~3.0 GLS450#381#M256#H;3.0 GLS400d#330#OM656#D;4.0 GLS580#510#M176#H
classeg~Classe G W463~18~27~W~4.0 G500#421#M176;4.0 G63 AMG#585#M177
eqa~EQA~21~27~J~@E6
eqb~EQB~21~27~J~@E6
eqc~EQC~19~24~J~Électrique#408:80#EVA#EV
eqe~EQE SUV~22~27~H~@E7
eqs~EQS SUV~21~27~H~@E8
eqt~EQT~23~27~L~@F8
citan~Citan~21~27~L~@F5;@F8
vito~Vito W447~17~27~F~@F4;@F2;@F3
classev~Classe V EQV~17~27~V~2.2 V220d#163#OM651#D;2.0 V250d#190#OM654#D;2.0 V300d#239#OM654#D;@F7
sprinter~Sprinter~18~27~G~2.0 311 CDI#114#OM654#D;2.0 314 CDI#143#OM654#D;2.0 317 CDI#170#OM654#D;2.0 319 CDI#190#OM654#D;@F6
`],
smart:["smart","DE",`
fortwo~fortwo EQ~17~24~Y~@H3
forfour~forfour EQ~17~21~Y~@H3
s1~#1~22~27~U~@H4
s3~#3~23~27~N~@z6
s5~#5~25~27~E~@H5
`],
opel:["Opel","DE",`
adam~Adam~17~19~Y~1.2#70#B12X;1.4#87,100#B14X;@b3
corsa-e~Corsa E~17~19~C~1.2#70#B12X;1.4#90#B14X;@b3;1.3 CDTI#75,95#B13D#D
corsa-f~Corsa F~19~27~C~1.2#75#EB2;@e6;@b;1.5 Diesel#100#DV5#D;@h
mokka-a~Mokka X~17~20~U~@b4;@b5
mokka-b~Mokka B~20~27~U~@e6;1.5 Diesel#110#DV5#D;Électrique#136:50,156:54#ZKX#EV
astra-k~Astra K~17~21~K~1.0 Turbo#105#B10X;@b4;@b5
astra-l~Astra L~21~27~K~@e6;@b;@c;@e;@i
insignia~Insignia B~17~22~B~1.5 Turbo#140,165#B15T;2.0 Turbo#230,260#B20T;@b5;@b6
crossland~Crossland~17~24~U~1.2#83#EB2;@e6;1.5 Diesel#110,120#DV5#D
grandland-1~Grandland X~17~24~E~1.2 Turbo#130#EB2;1.6 Diesel#120#DV6#D;@c;1.6 PHEV#225,300#EP6#P
grandland-2~Grandland II~24~27~E~@b;Électrique#210:73,230:97,320:73#STLA#EV
frontera~Frontera~24~27~E~@b;Électrique#113:44,156:51#EM0#EV
combo~Combo E~18~27~L~@e6;@c;@h
zafira~Zafira Life~19~27~V~@c;@f;@e9
vivaro~Vivaro C~19~27~F~@c;@f;@e9
movano~Movano~17~27~G~@b9;@18
`],
ford:["Ford","US",`
ka~Ka+~17~21~Y~1.2 Ti-VCT#70,85#B12X
fiesta~Fiesta VII~17~23~C~@f7;@L;1.5 TDCi#85#XVJ#D;1.5 EcoBlue#120#B7DA#D;1.5 ST#200#B3CA
focus~Focus IV~18~27~K~@L;@f2;@f1;@f8
puma~Puma~19~27~U~@L;1.0 EcoBoost ST#200#B3CA;Électrique#168:43#EV-PUM#EV
ecosport~EcoSport~17~22~U~1.0 EcoBoost#125#B3CA;1.5 TDCi#100#XVJ#D
kuga~Kuga III~19~27~E~@f3;@f1;@f4;@f5
mondeo~Mondeo V~17~22~B~2.0 EcoBlue#120,150,190#YLCB#D;2.0 Hybrid#187#BGCA#H
smax~S-MAX Galaxy~17~22~V~2.0 EcoBlue#120,150,190,240#YLCB#D
tourneo~Tourneo Connect~18~27~L~1.5 EcoBlue#75,100,120#B7DA#D;2.0 EcoBlue#122#YLCB#D;1.5 TSI#114#DPB
custom~Transit Custom~17~27~F~@M
transit~Transit~17~27~G~@M;Électrique#184:64,269:68#EV-TRA#EV
mache~Mustang Mach-E~21~27~J~@f9
explorer~Explorer EV~24~27~J~@f6
capri~Capri EV~24~27~J~@f6
ranger~Ranger~17~27~P~2.0 EcoBlue#130,170,205#BKF#D;3.0 V6 TDCi#250#BKF#D;2.3 EcoBoost PHEV#281#YVC#P
`],
toyota:["Toyota","JP",`
aygo~Aygo II~17~21~Y~@o7
aygox~Aygo X~22~27~Y~@o7;@47
yaris-3~Yaris III~17~20~C~@o7;@44;@45;@46
yaris-4~Yaris IV~20~27~C~@o7;@o6;@o5;@o8
yariscross~Yaris Cross~21~27~U~@o6;@o5
corolla~Corolla XII~18~27~K~@o9;@B;@C
corollats~Corolla Touring Sports~18~27~T~@o9;@B;@C
chr-1~C-HR I~17~23~N~@o9;1.8 Hybrid#122#2ZR-FXE#H;2.0 Hybrid#184#M20A-FXS#H
chr-2~C-HR II~23~27~N~1.8 Hybrid#140#2ZR-FXE#H;2.0 Hybrid#197#M20A-FXS#H;@48
prius~Prius IV V~17~27~B~@49;@48
camry~Camry~18~27~B~@50
rav4-5~RAV4 V~18~25~E~2.5 Hybrid#218,222#A25A-FXS#H;2.5 PHEV#306,309#A25A#P
rav4-6~RAV4 VI~25~27~E~2.5 Hybrid#236,240,243#A25A-FXS#H;2.5 PHEV#320,342#A25A#P
highlander~Highlander~21~27~W~@51
landcruiser~Land Cruiser 250~24~27~W~@o3;@52
bz4x~bZ4X~22~27~J~@53
urbcr~Urban Cruiser~25~27~J~@54
bzurban~bZ Urban Cruiser C-HR+~25~27~J~@55
proace~Proace Proace City~17~27~F~@o1;@o2;@e9
hilux~Hilux~17~27~P~@o4;@o3;@52
gr86~GR86~22~27~X~@h6
supra~GR Supra~19~27~X~@26;@27
`],
lexus:["Lexus","JP",`
ct~CT 200h~17~22~K~@25
is~IS 300h~17~21~B~@57
ux~UX 250h 300h 300e~18~27~U~@p1;@p3
nx~NX 350h 450h+~21~27~W~2.5 Hybrid#244#A25A-FXS#H;@60
es~ES 300h~18~27~Z~@58
rx~RX 450h+ 500h~22~27~W~@60;@59
rz~RZ 300e 450e 550e~23~27~J~Électrique#204:71.4,313:71.4,381:71.4#EV-RZ#EV
lbx~LBX~23~27~U~@61
lm~LM 350h~23~27~V~@56
`],
nissan:["Nissan","JP",`
micra-5~Micra V~17~24~C~@62;@63;@b7
micra-6~Micra VI~25~27~C~@15
note~Note e-POWER~17~22~M~@64
juke-2~Juke II~19~27~U~@n4;@n5
qashqai-2~Qashqai II~17~21~E~@65;@n1;@b7;@66
qashqai-3~Qashqai III~21~27~E~@n2;@n3
xtrail-3~X-Trail III~17~22~S~@n1;@66;@67
xtrail-4~X-Trail IV~22~27~S~@n3
leaf-2~Leaf II~17~26~J~@n6
leaf-3~Leaf III~25~27~J~@68
ariya~Ariya~22~27~J~@n7
townstar~Townstar~21~27~L~@n1;@33;@17
primastar~Primastar~21~27~F~@b8
interstar~Interstar~21~27~G~@b9;@18
navara~Navara NP300~17~22~P~@69
gtr~GT-R R35~17~22~X~@70
`],
honda:["Honda","JP",`
jazz-3~Jazz III~17~20~Y~@71;@72
jazz-4~Jazz IV e:HEV~20~27~Y~1.5 e:HEV#109#LEB#H
civic-10~Civic X~17~22~K~@g2;1.5 VTEC Turbo#182#L15B;@g4;2.0 Type R#320#K20C
civic-11~Civic XI e:HEV~22~27~K~@1;@g3
hrv-2~HR-V II~17~21~U~@73;@g4
hrv-3~HR-V III e:HEV~21~27~U~1.5 e:HEV#131#LEB#H
zrv~ZR-V e:HEV~23~27~E~@1
crv-5~CR-V V~17~23~E~@g1;2.0 Hybrid#184#LFA#H
crv-6~CR-V VI~23~27~E~@1;@g5
eny1~e:Ny1~24~27~J~@g6
crvh2~CR-V e:FCEV~25~27~E~@74
`],
mazda:["Mazda","JP",`
m2~Mazda2~17~27~C~@h1;@75;@76
m3~Mazda3 IV~19~27~K~@2;@h2;@80
m6~Mazda6 III~17~24~B~@77;@h3;@3
m6e~Mazda6e~25~27~H~@85
cx3~CX-3~17~22~U~@79;@78
cx30~CX-30~19~27~U~@2;@h2;@80
cx5~CX-5 II~17~27~E~2.0 Skyactiv-G#165#PE-VPS;@h3;@3
cx60~CX-60~22~27~W~@h4;@h5
cx80~CX-80~24~27~W~2.5 e-Skyactiv PHEV#327#PY-VPS#P;3.3 e-Skyactiv D#254#T3-VPT#D
mx5~MX-5 ND~17~27~R~@81;@82
mx30~MX-30~20~26~U~@83;@84
`],
suzuki:["Suzuki","JP",`
ignis~Ignis~17~27~Y~@i1
swift-3~Swift III~17~24~C~@i2;@i1;@86
swift-4~Swift IV~24~27~C~@i5
baleno~Baleno~17~22~C~@i2;@i1
vitara~Vitara~17~27~U~@i2;@i3;@4;@5;@87
scross~S-Cross~17~27~E~@i2;@i3;@4;@5
swace~Swace~20~27~T~@B
across~Across~20~27~E~@E
jimny~Jimny IV~18~27~U~@i4;@88
evitara~e Vitara~25~27~J~@i6
`],
mitsubishi:["Mitsubishi","JP",`
spacestar~Space Star~17~27~Y~@89;@90
asx~ASX~17~27~U~@j4;@j5;@91
eclipse~Eclipse Cross~17~27~E~@j2;@j3;@j1;@91
outlander~Outlander III IV~17~27~S~@j5;@j3;@j1
l200~L200~17~27~P~@j3;@92
colt~Colt~23~27~C~@93;@94;@12
`],
subaru:["Subaru","JP",`
impreza~Impreza~17~27~K~@k3;@k1
xv~XV Crosstrek~17~27~U~@k3;@k1
forester~Forester~17~27~E~@k1;@k2
outback~Outback~17~27~T~@k2;@96
solterra~Solterra~22~27~J~@k4
brz~BRZ~21~27~X~@h6
wrx~WRX STI~17~21~X~@97
`],
hyundai:["Hyundai","KR",`
i10~i10 III~19~27~Y~@a2;@9;@a1
i20~i20 III~20~27~C~@a1;@9;@99;@98
i30~i30 III~17~27~K~@l1;@l2;@a3;@A;@b1
bayon~Bayon~21~27~U~@a1;@9;@99
kona-1~Kona I~17~23~U~1.0 T-GDi#120#G3LC;1.6 T-GDi#177#G4FJ;@A;Électrique#136:39.2,204:64#EM16#EV
kona-2~Kona II~23~27~U~1.0 T-GDi#120#G3LC;1.6 T-GDi#150,198#G4FT;@a9;@l9
tucson~Tucson IV~20~27~E~@x;@l4;@y;@z;@A;@l5
santafe~Santa Fe IV V~18~27~W~1.6 T-GDi Hybrid#230,239#G4FT#H;1.6 T-GDi PHEV#265,288#G4FT#P;@l3
ioniq~Ioniq~17~22~K~@a9;@m1;Électrique#136:38.3#EM16#EV
ioniq5~Ioniq 5~21~27~J~Électrique#170:58,229:77.4,325:77.4,650:84#EM17#EV
ioniq6~Ioniq 6~22~27~H~Électrique#151:53,229:77.4,325:77.4#EM17#EV
ioniq9~Ioniq 9~25~27~J~Électrique#218:110.3,315:110.3,435:110.3#EM23#EV
inster~Inster~24~27~Y~Électrique#97:42,115:49#EM16#EV
nexo~Nexo~18~27~E~Électrique#163:1.56#EV-NEXO#EV
staria~Staria~21~27~V~1.6 T-GDi Hybrid#230#G4FT#H;@l3
`],
kia:["Kia","KR",`
picanto~Picanto III~17~27~Y~@a2;@9;@a1
rio~Rio IV~17~27~C~@a1;@9;@99
ceed~Ceed III XCeed ProCeed~18~27~K~@l1;@l2;@a3;@A;@m1;2.0 T-GDi GT#204#G4KH
stonic~Stonic~17~27~U~@9;@99;1.4 MPi#100#G4LC
niro-1~Niro I~17~22~E~@a9;@m1;Électrique#204:64#EM16#EV
niro-2~Niro II~22~27~E~@a9;@m1;@m2
sportage~Sportage V~21~27~E~@x;@l4;@y;@z;@l5
sorento~Sorento IV~20~27~W~1.6 T-GDi Hybrid#230#G4FT#H;1.6 T-GDi PHEV#265#G4FT#P;@l3
ev3~EV3~24~27~J~@l6
ev4~EV4~25~27~H~@l6
ev5~EV5~25~27~J~Électrique#218:81.4#EM16#EV
ev6~EV6~21~27~J~@l7
ev9~EV9~23~27~J~@l8
pv5~PV5~25~27~V~Électrique#122:51.5,163:71.2#EV-PV5#EV
stinger~Stinger~17~23~Z~2.0 T-GDi#247#G4KL;3.3 T-GDi GT#370#G6DP
`],
genesis:["Genesis","KR",`
g70~G70~21~27~B~2.0 T-GDi#245#G4KL;3.3 T-GDi#370#G6DP;@m5
g80~G80~21~27~Z~@m3;@m4;Électrique#370:87.2#EV-G80#EV
g90~G90~22~27~Z~3.5 T-GDi#415#G6DP
gv60~GV60~22~27~J~@N
gv70~GV70~21~27~W~@m3;@m5;Électrique#490:77.4#EV-GV70#EV
gv80~GV80~21~27~W~@m3;@m4;@m5
`],
kgm:["KGM SsangYong","KR",`
tivoli~Tivoli~17~27~U~1.6 e-XGi#128#G16;@m6;@m7
korando~Korando~19~27~E~@m6;@m7;Électrique#190:61.5#EV-KOR#EV
torres~Torres~22~27~W~@m6;Électrique#207:73.4#EV-TOR#EV
rexton~Rexton~17~27~W~@m8
musso~Musso~18~27~P~@m8;Électrique#207:73.4#EV-MUS#EV
`],
tesla:["Tesla","US",`
models~Model S~17~27~H~@J1
model3~Model 3~17~27~H~@J2
modelx~Model X~17~27~J~@J1
modely~Model Y~20~27~J~@J3
cyber~Cybertruck~23~27~P~@J4
roadster2~Roadster~26~27~R~@J5
`],
jeep:["Jeep","US",`
renegade~Renegade~17~27~U~@q5;@q4;@Q;@R;@q3
compass~Compass II~17~27~E~@q4;@Q;@R;@q3;@O
cherokee~Cherokee KL~17~23~E~@R;2.4 Tigershark#177#ED6
wrangler~Wrangler JL~18~27~W~@q2;2.2 MultiJet#200#552#D;@q1
gladiator~Gladiator~20~27~P~3.0 V6 MultiJet#264#VM#D
avenger~Avenger~23~27~U~@e7;@b;@i
grandcherokee~Grand Cherokee 4xe~22~27~W~@q1
wagoneer~Wagoneer S~24~27~J~Électrique#600:100#EV-WGS#EV
`],
fiat:["Fiat","IT",`
panda-3~Panda III~17~27~Y~@r2;@r3;@r4;@r5
panda-4~Grande Panda~24~27~C~@b;@e5
500-3~500 III~17~24~Y~@r3;@r4;@r2;@r5
500e~500e~20~27~Y~@r7
500l~500L~17~22~M~@21;@r9;@r5;@Q
500x~500X~17~24~U~@q5;@q4;@r5;@Q;@22
600~600 600e~23~27~U~@b;@i
tipo~Tipo Egea~17~27~K~@21;@r1;@r9;@r5;@Q;@22
topolino~Topolino~23~27~Q~@20
doblo~Doblò III~22~27~L~@e6;@c;@h
scudo~Scudo~22~27~F~@c;@f;@e9
ducato~Ducato~17~27~G~@r6;@r8
`],
abarth:["Abarth","IT",`
595~595 695~17~24~Y~1.4 T-Jet#145,165,180#312A1
124~124 Spider~17~20~R~1.4 MultiAir#140,170#312A1
500e~500e 595e~23~27~Y~@23
600e~600e~24~27~U~@24
panda~Grande Panda Abarth~25~27~C~1.2 Hybrid#156#EB2LTEDH#H
`],
alfa:["Alfa Romeo","IT",`
giulietta~Giulietta~17~20~K~1.4 TB#120#312A1;@s2;1.6 JTDm#120#552#D;@T
giulia~Giulia~17~27~B~@S;@T;@s1
stelvio~Stelvio~17~27~W~@S;2.2 JTDm#190,210#552#D;2.9 V6 QV#510#690T
tonale~Tonale~22~27~E~@O;@s3;2.0 Turbo#268#GME;1.6 JTDm#130#552#D
junior~Junior~24~27~U~@s5;@s4
4c~4C~17~20~X~@s2
`],
lancia:["Lancia","IT",`
ypsilon-3~Ypsilon III~17~24~C~@r3;@r4;@r2;@r5
ypsilon-4~Ypsilon IV~24~27~C~@e7;@b;@01
delta~Delta~26~27~K~1.2 Hybrid#136#EB2LTEDH#H;@s4
gamma~Gamma~26~27~N~@02
`],
landrover:["Land Rover","GB",`
evoque-1~Evoque I~17~19~E~2.0 Si4#240#PT204;2.0 D150#150#204DT#D;2.0 D180#180#204DT#D
evoque-2~Evoque II~19~27~E~@U;2.0 D165#163#204DT#D;2.0 D200#204#204DT#D;@W
discovery-sport~Discovery Sport~17~27~E~@U;2.0 D150#150#204DT#D;@V;@W
discovery~Discovery 5~17~27~W~@t1;@t2;2.0 P300#300#PT204;3.0 SDV6#306#AJ200D#D
velar~Velar~17~27~N~@U;@t2;2.0 D180#180#204DT#D;2.0 D200#204#204DT#D;3.0 D300#300#AJ200D#D;@t3
rangerover~Range Rover L460~21~27~W~@t2;@t1;@t5;3.0 P460e#460#AJ300#P;3.0 P550e#550#AJ300#P
rrsport~Range Rover Sport~22~27~W~@t2;@t1;4.4 P635 SV#635#N63;3.0 P460e#460#AJ300#P;3.0 P550e#550#AJ300#P
defender~Defender L663~20~27~W~2.0 P300#300#PT204;@t2;3.0 D200#200#AJ200D#D;@t1;@t3;@t4
`],
jaguar:["Jaguar","GB",`
xe~XE~17~24~B~@U;2.0 D180#180#204DT#D
xf~XF~17~24~Z~@U;2.0 D180#180#204DT#D;3.0 D300#300#AJ200D#D
fpace~F-Pace~17~27~W~@U;@t2;2.0 D163#163#204DT#D;2.0 D204#204#204DT#D;3.0 D300#300#AJ200D#D;@t3;5.0 P550 SVR#550#AJ133
epace~E-Pace~17~24~E~@U;2.0 D150#150#204DT#D;2.0 D180#180#204DT#D;@W
ipace~I-Pace~18~27~J~Électrique#400:90#EV-JLR#EV
ftype~F-Type~17~24~X~2.0 P300#300#PT204;3.0 P380#380#AJ126;5.0 P575 R#575#AJ133
`],
porsche:["Porsche","DE",`
718~718 Boxster Cayman~17~27~X~2.0 Turbo#300#9A2B;2.5 GTS#350,365#9A2B;@u8
911-992~911 992~19~27~X~@u6;@u5;@u7
911-991~911 991.2~17~19~X~3.0 Carrera#370,420#9A2;3.8 Turbo S#580,607#9A2;@u8
taycan~Taycan~19~27~H~Électrique#408:79.2,435:93.4,476:93.4,530:93.4,598:93.4,680:93.4,761:93.4,1034:105#J1#EV
macane~Macan Electric~24~27~J~Électrique#360:100,408:100,476:100,639:100#PPE#EV
macan~Macan thermique~17~24~W~2.0#245,265#EA888;2.9 S GTS#354,380,440#CSZ
cayenne~Cayenne E3~17~27~W~@u1;2.9 S#440,474#CSZ;4.0 Turbo GT#640,659#EA825;@u3;4.0 Turbo E-Hybrid#739#EA825#P
panamera~Panamera 971 976~17~27~Z~@u4;4.0 Turbo S#630,680#EA825;2.9 E-Hybrid#462,470#CSZ#P;4.0 Turbo S E-Hybrid#700,782#EA825#P
`],
volvo:["Volvo","SE",`
v40~V40~17~19~K~1.5 T3#152#B4154;@v1;2.0 D2#120#D4204#D;@v2
s60~S60 III~19~27~B~@X;@Y;@Z
v60~V60 II~18~27~T~@v7;@X;@Y;@v6;@Z
s90~S90 V90~17~27~Z~@Y;@Z;@v3
xc40~XC40~17~27~E~@v4;@v1;@v7;@X;@v2;@v3;@v5
xc60~XC60 II~17~27~W~@X;@Y;@v3;@v6;@Z
xc90~XC90 II~17~27~W~@Y;@v8;@Z;2.0 D5#235#D4204#D
ex30~EX30~23~27~J~@v9
ex40~EX40 EC40~21~27~J~@w1
ex90~EX90~24~27~J~@w2
es90~ES90~25~27~H~Électrique#333:111,453:111,680:111#EV-EX9#EV
em90~EM90~24~27~V~Électrique#272:116#SEA#EV
`],
polestar:["Polestar","SE",`
ps1~Polestar 1~19~21~X~2.0 PHEV#609#B4204#P
ps2~Polestar 2~20~27~H~@w3
ps3~Polestar 3~24~27~J~@w5
ps4~Polestar 4~24~27~N~@w4
ps5~Polestar 5~25~27~Z~Électrique#450:106,650:106,884:106#PPE#EV
ps6~Polestar 6~26~27~R~Électrique#884:106#SEA#EV
`],
mg:["MG","CN",`
mg3~MG3 Hybrid+~24~27~C~@x1
mg4~MG4~22~27~K~@x2
mg5~MG5 EV~21~27~T~Électrique#156:50.3,177:61.1#EV-MG5#EV
zsev~ZS EV~19~27~U~@x5
zs~ZS~21~27~U~1.5 VTi#106#15S4C;1.0 T-GDi#111#10E4E;@x1
hs~HS EHS~18~27~E~@x3;@x4;@x1
mgs5~MG S5 EV~25~27~E~Électrique#170:49,231:64#EV-MGS5#EV
cyberster~Cyberster~24~27~R~@x6
marvelr~Marvel R~21~24~E~Électrique#180:70,288:70#EV-MVR#EV
`],
byd:["BYD","CN",`
atto2~Atto 2~25~27~U~@y4
atto3~Atto 3~22~27~E~@y1
dolphin~Dolphin~23~27~C~@y2
dolphin-surf~Dolphin Surf Seagull~25~27~Y~@y5
seal~Seal~23~27~H~@y3
sealion7~Sealion 7~25~27~J~Électrique#313:82.5,530:82.5,570:91.3#BYD#EV
sealu~Seal U DM-i~24~27~E~@6
seal6~Seal 6 DM-i~25~27~B~1.5 DM-i#184,238#BYD-DMI#P
tang~Tang EV~23~27~W~@y6
han~Han EV~23~27~Z~Électrique#517:85.4#BYD#EV
`],
xpeng:["XPeng","CN",`
g6~G6~24~27~J~@z1
g9~G9~23~27~J~@z2
p7~P7 P7+~23~27~H~@z3
g7~G7~25~27~J~Électrique#296:80.8#EV-XG7#EV
x9~X9~25~27~V~Électrique#320:101.5#EV-X9#EV
`],
nio:["NIO","CN",`
et5~ET5 ET5T~23~27~H~@z4
et7~ET7~23~27~Z~@z5
el6~EL6 ES6~23~27~J~@z4
el7~EL7 ES7~23~27~J~@z5
el8~EL8 ES8~23~27~W~Électrique#653:100,653:150#EV-NIO#EV
ec6~EC6 EC7~24~27~N~Électrique#490:100#EV-NIO#EV
`],
zeekr:["Zeekr","CN",`
zx~X~24~27~U~@z6
z001~001~24~27~N~@z7
z007~007~25~27~H~Électrique#422:75,646:100#SEA#EV
z7x~7X~25~27~J~Électrique#421:75,646:100#SEA#EV
`],
leapmotor:["Leapmotor","CN",`
t03~T03~23~27~Y~@A1
c10~C10~24~27~J~@z8;@A2
b10~B10~25~27~E~@z9
c01~C01~25~27~H~Électrique#272:90#EV-LM#EV
`],
omoda:["Omoda","CN",`
o5~5 C5~24~27~N~@7;1.5 T-GDi#156#SQR
oe5~E5~24~27~J~@A3
o7~7~25~27~E~1.6 T-GDi#147#SQR;@8
o9~9 E9~25~27~W~Électrique#408:80#EV-OM9#EV
`],
jaecoo:["Jaecoo","CN",`
j7~7 J7~24~27~E~@7;@8
j8~8 J8~25~27~W~1.5 PHEV#347,530#SQR#P
j5~5 J5~25~27~U~1.5 T-GDi#147#SQR;@A3
`],
ora:["Ora","CN",`
o03~03 Funky Cat~23~27~C~@A4
o07~07 Lightning Cat~24~27~H~Électrique#204:83.5,408:83.5#EV-ORA7#EV
`],
lynk:["Lynk & Co","CN",`
l01~01~21~27~E~@A5;@A6
l02~02~24~27~N~@z6
l08~08~25~27~W~1.5 PHEV#280,544#JLH#P
l09~09~25~27~W~2.0 PHEV#544#JLH#P
`],
chery:["Chery","CN",`
tiggo7~Tiggo 7 Pro~24~27~E~@03;@04
tiggo8~Tiggo 8 Pro~24~27~S~1.6 T-GDi#186#SQR;@8
tiggo9~Tiggo 9~25~27~W~@04
arrizo8~Arrizo 8~25~27~B~1.6 T-GDi#186#SQR
`],
gwm:["GWM Haval","CN",`
jolion~Jolion~23~27~U~@W5;@W8
h6~H6~24~27~E~@W5;@W6;@W7
wey05~Wey 05 Coffee 01~24~27~W~@W9
poer~Poer Wingle~24~27~P~2.0 Turbo Diesel#163#GW4D20#D
`],
dongfeng:["DFSK Dongfeng","CN",`
s580~580 Glory~23~27~S~@X1;1.5 PHEV#184#SFG15#P
seres3~Seres 3~23~27~U~@X2
seres5~Seres 5~24~27~E~@X3;@X4
box~Box Nammi~25~27~C~Électrique#95:42.3#EV-BOX2#EV
`],
maxus:["Maxus","CN",`
euniq5~Euniq 5~21~27~M~@Y1
euniq6~Euniq 6~21~27~E~@Y2
t90~T90 EV~22~27~P~@Y3
edeliver3~eDeliver 3~21~27~F~@Y4
edeliver9~eDeliver 9~21~27~G~@Y3
`],
lotus:["Lotus","GB",`
eletre~Eletre~24~27~J~@Z1
emeya~Emeya~24~27~Z~@Z2
emira~Emira~22~27~X~@Z3;@Z4
`],
maserati:["Maserati","IT",`
ghibli~Ghibli~17~24~Z~@K1;@K2;@K3
levante~Levante~17~24~W~@K1;@K5;@K2
grecale~Grecale~22~27~W~2.0 GT#300#GME#H;@K4;@K6
granturismo~GranTurismo GranCabrio~23~27~X~3.0 Modena#490#M156;3.0 Trofeo#550#M156;@K7
mc20~MC20 MCPura~21~27~X~3.0 Nettuno#630#M156
`],
bentley:["Bentley","GB",`
bentayga~Bentayga~17~27~W~4.0 V8#550#EA825;@L1;@L2
continental~Continental GT~18~27~X~4.0 V8#550#EA825;@L1;@L3
flyingspur~Flying Spur~19~27~Z~4.0 V8#550#EA825;6.0 W12#635#W12;@L3
`],
ferrari:["Ferrari","IT",`
roma~Roma Spider~20~27~X~@M1
296~296 GTB GTS~22~27~X~@M2
sf90~SF90 Stradale Spider~20~27~X~@M3
purosangue~Purosangue~23~27~W~6.5 V12#725#F140
12cilindri~12Cilindri~24~27~X~6.5 V12#830#F140
portofino~Portofino M~17~23~R~3.9 V8#620#F154
f8~F8 Tributo Spider~19~23~X~3.9 V8#720#F154
812~812 Superfast Competizione~17~24~X~@M4
`],
lamborghini:["Lamborghini","IT",`
urus~Urus SE~18~27~W~@N1;@N2
huracan~Huracán~17~24~X~@N3
revuelto~Revuelto~23~27~X~@N4
temerario~Temerario~25~27~X~4.0 V8 PHEV#920#CEH#P
`],
aston:["Aston Martin","GB",`
db11~DB11~17~23~X~4.0 V8#510#M177;@O2
db12~DB12~23~27~X~4.0 V8#680#M177
vantage~Vantage~18~27~X~@O1
dbx~DBX DBX707~20~27~W~@O1
valhalla~Valhalla~25~27~X~@O3
`],
mclaren:["McLaren","GB",`
720s~720S~17~27~X~4.0 V8#720#M840
artura~Artura~22~27~X~@O5
gt~GT~19~25~X~4.0 V8#620#M840
750s~750S 765LT~21~27~X~@O4
`],
rolls:["Rolls-Royce","GB",`
cullinan~Cullinan Series II~18~27~W~@L4
phantom~Phantom VIII~17~27~Z~6.75 V12#571#N74
ghost~Ghost II~20~27~Z~@L4
spectre~Spectre~23~27~X~@L5
`],
bugatti:["Bugatti","FR",`
chiron~Chiron Super Sport~17~24~X~@Q1
tourbillon~Tourbillon~26~27~X~@Q2
`],
isuzu:["Isuzu","JP",`
dmax~D-Max~17~27~P~@R1;@R2
mux~MU-X~21~27~W~@R1;@R2
`],
iveco:["Iveco","IT",`
daily~Daily~17~27~G~@R3;@R4
`],
man:["MAN","DE",`
tge~TGE~17~27~G~2.0 TDI#102,140,177#DMZ#D;Électrique#136:35#EV-TGE#EV
`],
chevrolet:["Chevrolet","US",`
spark~Spark~17~19~Y~@S1;@S2
cruze~Cruze~17~19~K~1.4 Turbo#150#LE2;@S3
orlando~Orlando~17~19~M~2.0 CDTI#163#Z20D#D
`],
aixam:["Aixam","FR",`
city~City Crossline~17~27~Q~@T1;@T2
coupe~Coupé GTI~17~27~Q~@T1;Électrique#20:12#EV-AIX2#EV
`],
ligier:["Ligier","FR",`
js50~JS50 JS60~17~27~Q~@T1
pulse4~Pulse 4~22~27~Q~Électrique#14:12#EV-LIG#EV
`],
fisker:["Fisker","US",`
ocean~Ocean~23~25~J~@U1
`],
lucid:["Lucid","US",`
air~Air~24~27~H~@U2
gravity~Gravity~25~27~J~@U3
`],
vinfast:["VinFast","VN",`
vf6~VF 6~24~27~U~@V1
vf7~VF 7~24~27~E~@V2
vf8~VF 8~23~27~W~@V3
vf9~VF 9~24~27~W~@V4
`],
hongqi:["Hongqi","CN",`
ehs9~E-HS9~22~27~W~@W1
eh9~E-H9~24~27~Z~Électrique#394:111#EV-HQ9S#EV
`],
forthing:["Forthing","CN",`
t5evo~T5 Evo~24~27~E~@W2
utour~U-Tour Friday~24~27~J~@W3
`],
denza:["Denza","CN",`
d9~D9~25~27~V~@W4;1.5 DM-i#408:40#BYD-DMI#P
z9gt~Z9 GT~25~27~N~Électrique#965:100#BYD#EV
`],
aion:["GAC Aion","CN",`
y~Aion Y~24~27~E~Électrique#204:63.2,204:76.8#EV-AION#EV
v~Aion V~24~27~W~Électrique#204:75.3,248:90#EV-AION#EV
ut~Aion UT~25~27~C~Électrique#136:44.1#EV-AION#EV
`],
geely:["Geely","CN",`
ex5~EX5~25~27~E~Électrique#218:60.2#SEA#EV
starray~Starray EM-i~25~27~E~1.5 PHEV#218,262#BHE15#P
coolray~Coolray~24~27~U~1.5 T-GDi#177#JLH-3G15
`],
changan:["Changan","CN",`
cs75~CS75 Plus~24~27~E~1.5 T-GDi#178,188#JL476
uni-k~Uni-K~24~27~W~1.5 PHEV#340#JL476#P
deepal-s07~Deepal S07~25~27~J~Électrique#258:79.9#EV-DEE#EV;1.5 EREV#238:31.7#RE-ROT#P
`],
deepal:["Deepal","CN",`
s05~S05~25~27~E~Électrique#218:68.8#EV-DEE#EV
g318~G318~25~27~W~1.5 EREV#430:35#RE-ROT#P
`],
exeed:["Exeed","CN",`
txl~TXL~24~27~W~1.6 T-GDi#186#SQR;2.0 T-GDi#261#SQR
rx~RX~25~27~W~1.5 PHEV#347,530#SQR#P
`],
jetour:["Jetour","CN",`
dashing~Dashing~24~27~E~1.6 T-GDi#186#SQR;1.5 PHEV#347#SQR#P
t2~T2 Traveller~25~27~W~2.0 T-GDi#254#SQR
`],
tank:["Tank","CN",`
t300~300~24~27~W~2.0 Turbo#220#GW4C20;2.0 PHEV#408#GW4C20#P
t500~500~24~27~W~3.0 V6 PHEV#517#GW6V30#P
`],
baic:["BAIC","CN",`
bj40~BJ40~24~27~W~2.0 Turbo#224#B20B
x55~X55~24~27~E~1.5 Turbo#177#A151
eu5~EU5~24~27~B~Électrique#163:60#EV-BAIC#EV
`],
jac:["JAC","CN",`
t9~T9~24~27~P~2.0 Turbo Diesel#170#HFC4DB#D
e30x~E30X~24~27~C~Électrique#136:50#EV-JAC#EV
js8~JS8 Pro~25~27~S~1.5 T-GDi#184#HFC4GC
`],
neta:["Neta","CN",`
v~V~23~26~U~Électrique#95:40.7#EV-NETA#EV
u~U~23~26~E~Électrique#170:60#EV-NETA#EV
s~S~24~26~N~Électrique#231:74.5#EV-NETA#EV
`],
liauto:["Li Auto","CN",`
l7~L7~24~27~W~1.5 EREV#449:42.8#RE-ROT#P
l8~L8~24~27~W~1.5 EREV#449:42.8#RE-ROT#P
l9~L9~24~27~W~1.5 EREV#449:52.3#RE-ROT#P
mega~Mega~25~27~V~Électrique#544:102.7#EV-LI#EV
`],
voyah:["Voyah","CN",`
free~Free~24~27~W~1.5 EREV#510:43#RE-ROT#P;Électrique#510:106#EV-VOY#EV
dream~Dream~24~27~V~1.5 EREV#571:43#RE-ROT#P
`],
avatr:["Avatr","CN",`
a11~11~25~27~N~Électrique#578:116#EV-AVT#EV
a12~12~25~27~Z~Électrique#578:94.5#EV-AVT#EV
`],
aito:["Aito Seres","CN",`
m5~M5~24~27~W~1.5 EREV#496:40#RE-ROT#P;Électrique#272:80#EV-AITO#EV
m7~M7~25~27~W~1.5 EREV#496:42#RE-ROT#P
m9~M9~25~27~W~1.5 EREV#530:52#RE-ROT#P
`],
yangwang:["Yangwang","CN",`
u8~U8~25~27~W~2.0 EREV#1197:49#RE-ROT#P
u9~U9~25~27~X~Électrique#1306:80#BYD#EV
`],
onvo:["Onvo","CN",`
l60~L60~25~27~J~Électrique#326:60,326:85#EV-NIO#EV
l90~L90~26~27~W~Électrique#440:85#EV-NIO#EV
`],
firefly:["Firefly","CN",`
f1~Firefly~25~27~Y~Électrique#143:42.1#EV-NIO#EV
`],
galaxy:["Geely Galaxy","CN",`
e5~E5~25~27~E~Électrique#218:60.2#SEA#EV
starship7~Starship 7 EM-i~25~27~E~1.5 PHEV#218,262#BHE15#P
`],
skyworth:["Skyworth","CN",`
ev6~EV6~24~27~E~Électrique#204:71.9#EV-SKY#EV
ht-i~HT-i~25~27~W~1.5 PHEV#231#SWM15#P
`],
fengon:["Fengon","CN",`
f500~500~24~27~E~1.5 Turbo#150#SFG15;1.5 PHEV#184#SFG15#P
mini~Mini EV~24~27~Y~Électrique#41:16.8#EV-FGN#EV
`],
bestune:["Bestune","CN",`
t99~T99~24~27~W~2.0 Turbo#224#CA4GC20
nat~NAT~24~27~M~Électrique#136:55#EV-BST#EV
`],
farizon:["Farizon","CN",`
sv~SuperVAN~25~27~G~Électrique#204:106#EV-FRZ#EV
`],
ineos:["Ineos","GB",`
grenadier~Grenadier~23~27~W~3.0 Diesel#249,286#B57#D;3.0 Essence#360,405#B58
quartermaster~Quartermaster~24~27~P~3.0 Diesel#249,286#B57#D
`],
alpina:["Alpina","DE",`
b3~B3~20~27~B~3.0 Biturbo#462,495#S58
b4~B4~21~27~X~3.0 Biturbo#495#S58
b5~B5~17~23~Z~4.4 V8#608,621#N63
xd3~XD3~18~27~W~3.0 Diesel#388,408#B57#D
xb7~XB7~20~27~W~4.4 V8#621#N63
`],
infiniti:["Infiniti","JP",`
q30~Q30~17~20~K~1.6 Turbo#122,156#M270;2.0 Turbo#211#M274;2.2 D#170#OM651#D
q50~Q50~17~22~B~2.0 Turbo#211#M274;3.0 V6#405#VR30;3.5 Hybrid#364#VQ35#H
q60~Q60~17~22~X~2.0 Turbo#211#M274;3.0 V6#405#VR30
qx70~QX70~17~19~W~3.0 D#238#V9X#D;5.0 V8#390#VK50
`],
cadillac:["Cadillac","US",`
xt4~XT4~19~24~E~2.0 Turbo#237#LSY
xt5~XT5~17~24~W~3.6 V6#314#LGX;2.0 Turbo#237#LSY
lyriq~Lyriq~23~27~J~Électrique#340:102,500:102#EV-ULT#EV
escalade~Escalade~21~27~W~6.2 V8#426#L87;3.0 Diesel#281#LM2#D
`],
dodge:["Dodge","US",`
charger~Charger~23~27~X~3.0 I6#420,550#DT;Électrique#496:100.5#EV-STLA#EV
hornet~Hornet~23~27~E~2.0 Turbo#272#GME;1.3 PHEV#288#GSE#P
`],
ram:["Ram","US",`
r1500~1500~19~27~P~3.0 I6#420,540#DT;3.0 Diesel#260#EXJ#D
rev~1500 REV Ramcharger~25~27~P~Électrique#663:168#EV-STLA#EV;3.6 V6 EREV#663:92#RE-ROT#P
`],
gmc:["GMC","US",`
hummer~Hummer EV~23~27~P~Électrique#635:212,1000:212#EV-ULT#EV
sierra~Sierra~19~27~P~6.2 V8#426#L87;3.0 Diesel#305#LZ0#D
`],
chrysler:["Chrysler","US",`
pacifica~Pacifica~17~24~V~3.6 V6#291#ERC;3.6 PHEV#264#ERC#P
voyager~Voyager~20~24~V~3.6 V6#291#ERC
`],
acura:["Acura","JP",`
mdx~MDX~17~24~W~3.5 V6#294#J35;3.0 Type S#360#J30
zdx~ZDX~24~27~J~Électrique#358:102,500:102#EV-ULT#EV
`],
morgan:["Morgan","GB",`
plusfour~Plus Four~21~27~R~2.0 Turbo#258#B48
plussix~Plus Six~19~27~R~3.0 Turbo#340#B58
`],
caterham:["Caterham","GB",`
seven~Seven 170 420~17~27~R~0.6 Turbo#84#K6A;2.0#210#Duratec
projectv~Project V~26~27~X~Électrique#272:55#EV-CAT#EV
`],
micro:["Micro","CH",`
microlino~Microlino~22~27~Q~Électrique#17:10.5,17:14#EV-MIC#EV
`],
mahindra:["Mahindra","IN",`
xuv700~XUV700~23~27~W~2.0 Turbo#203#mStallion;2.2 Diesel#185#mHawk#D
be6~BE6~25~27~J~Électrique#231:59,286:79#EV-INGLO#EV
`],
tata:["Tata","IN",`
nexon~Nexon EV~24~27~U~Électrique#143:40.5,143:45#EV-TATA#EV
curvv~Curvv EV~25~27~N~Électrique#167:55#EV-TATA#EV
`],
rivian:["Rivian","US",`
r1t~R1T~24~27~P~Électrique#542:135,1025:180#EV-RIV#EV
r1s~R1S~24~27~W~Électrique#542:135,1025:180#EV-RIV#EV
r2~R2~26~27~J~Électrique#450:100#EV-RIV2#EV
`]
};

/* ═══ RÉFÉRENTIEL MOTEUR ═══ */
var eng=[
["^(1KR|K10|K12|K6A)",998,3,"3 en ligne","Atmosphérique MPI","Chaîne"],
["^EB0",999,3,"3 en ligne","Atmosphérique MPI","Courroie humide"],
["^EB2LTEDH",1199,3,"3 en ligne Miller","Turbo VGT + MHEV 48 V","Chaîne"],
["^EB2LTED",1199,3,"3 en ligne Miller","Turbo VGT injection directe","Chaîne"],
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
["^HR09",898,3,"3 en ligne","Turbo IG-T","Chaîne"],
["^HR10",999,3,"3 en ligne","Turbo DI DIG-T","Chaîne"],
["^HR12",1199,3,"3 en ligne","Turbo injection directe","Chaîne"],
["^HR13",1332,4,"4 en ligne","Turbo DI DIG-T","Chaîne"],
["^HR16",1598,4,"4 en ligne","Atkinson / e-POWER","Chaîne"],
["^HR18",1798,4,"4 en ligne","Atkinson full hybrid","Chaîne"],
["^KR15",1497,3,"3 en ligne VC-Turbo","Compression variable","Chaîne"],
["^K9K",1461,4,"4 en ligne","Diesel dCi common rail","Courroie"],
["^M9R",1995,4,"4 en ligne","Diesel dCi common rail","Chaîne"],
["^M9T",2299,4,"4 en ligne","Diesel dCi + SCR","Chaîne"],
["^R9M",1598,4,"4 en ligne","Diesel dCi biturbo","Chaîne"],
["^H4M",1598,4,"4 en ligne Atkinson","Hybride E-Tech multimode","Chaîne"],
["^M5P",1798,4,"4 en ligne","Turbo injection directe","Chaîne"],
["^M5M",1618,4,"4 en ligne","Turbo injection directe","Chaîne"],
["^CHY",999,3,"3 en ligne","Atmosphérique MPI","Chaîne"],
["^(CHZ|DKL|DKR)",999,3,"3 en ligne","Turbo TSI DI","Chaîne"],
["^(CZC|CZD|DAC|DPC|DPB|DUV|DUA)",1498,4,"4 en ligne","Turbo TSI ACT EA211 evo","Chaîne"],
["^(CZP|DNN|DKT|DNF|CJX|CYR|CVK|DKN|DKX|EA888)",1984,4,"4 en ligne","Turbo TSI EA888","Chaîne"],
["^(DNW|DNE|DNH)",2480,5,"5 en ligne","Turbo TFSI DI","Chaîne"],
["^(CYY|CUNA|CRL|DDY|DDYA|DFG|DFH|DSU|DTU|DES|DEU|DETA|DDVE|DTSA|CXH|CXG|DMZ|DFC)",1968,4,"4 en ligne","Diesel TDI + SCR EA288","Courroie"],
["^(DGE|DGEA)",1395,4,"4 en ligne","TSI + électrique PHEV","Chaîne"],
["^DKUA",2995,6,"V6","Turbo TFSI / hybride","Chaîne"],
["^B38",1499,3,"3 en ligne","Turbo Valvetronic DI","Chaîne"],
["^B37",1496,3,"3 en ligne","Diesel common rail","Chaîne"],
["^B48",1998,4,"4 en ligne","Turbo Valvetronic DI","Chaîne"],
["^B47",1995,4,"4 en ligne","Diesel common rail","Chaîne côté boîte"],
["^B57",2993,6,"6 en ligne","Diesel common rail biturbo","Chaîne"],
["^B58",2998,6,"6 en ligne","Turbo TwinPower DI","Chaîne"],
["^S58",2993,6,"6 en ligne","Biturbo M Performance","Chaîne"],
["^S63",4395,8,"V8","Biturbo M","Chaîne"],
["^N63",4395,8,"V8","Biturbo injection directe","Chaîne"],
["^M282",1332,4,"4 en ligne","Turbo injection directe","Chaîne"],
["^M260",1991,4,"4 en ligne","Turbo DI","Chaîne"],
["^M264",1991,4,"4 en ligne","Turbo DI + EQ Boost","Chaîne"],
["^M254",1999,4,"4 en ligne","Turbo + ISG 48 V","Chaîne"],
["^M256",2999,6,"6 en ligne","Turbo + EQ Boost 48 V","Chaîne"],
["^M139",1991,4,"4 en ligne","Turbo AMG haute pression","Chaîne"],
["^M177",3982,8,"V8","Biturbo AMG","Chaîne"],
["^M176",3982,8,"V8","Biturbo","Chaîne"],
["^OM608",1461,4,"4 en ligne","Diesel dCi common rail","Courroie"],
["^OM622",1598,4,"4 en ligne","Diesel common rail","Courroie"],
["^OM651",2143,4,"4 en ligne","Diesel common rail","Chaîne"],
["^OM654",1950,4,"4 en ligne","Diesel common rail + SCR","Chaîne"],
["^OM656",2925,6,"6 en ligne","Diesel common rail + SCR","Chaîne"],
["^M15A",1490,3,"3 en ligne Dynamic Force","Atkinson hybride / VVT-i","Chaîne"],
["^M20A",1987,4,"4 en ligne Dynamic Force","Atkinson hybride","Chaîne"],
["^A25A",2487,4,"4 en ligne Dynamic Force","Hybride / PHEV","Chaîne"],
["^2ZR",1798,4,"4 en ligne Atkinson","Hybride HSD","Chaîne"],
["^1NZ",1497,4,"4 en ligne Atkinson","Hybride HSD","Chaîne"],
["^1NR",1329,4,"4 en ligne","Dual VVT-i","Chaîne"],
["^8NR",1197,4,"4 en ligne","Turbo D-4T","Chaîne"],
["^1GD",2755,4,"4 en ligne","Diesel D-4D + SCR","Chaîne"],
["^2GD",2393,4,"4 en ligne","Diesel D-4D + SCR","Chaîne"],
["^G16E",1618,3,"3 en ligne","Turbo GR haute pression","Chaîne"],
["^T24A",2393,4,"4 en ligne","Turbo hybride MAX","Chaîne"],
["^2AR",2494,4,"4 en ligne Atkinson","Hybride","Chaîne"],
["^G3LD",998,3,"3 en ligne","Atmosphérique MPi","Chaîne"],
["^G3LC",998,3,"3 en ligne","Turbo T-GDi","Chaîne"],
["^G4LF",1197,4,"4 en ligne","MPi / T-GDi","Chaîne"],
["^G4LC",1368,4,"4 en ligne","Atmosphérique MPi","Chaîne"],
["^G4LD",1353,4,"4 en ligne","Turbo T-GDi","Chaîne"],
["^G4FJ",1591,4,"4 en ligne","Turbo T-GDi","Chaîne"],
["^G4FT",1598,4,"4 en ligne Smartstream","Turbo T-GDi CVVD","Chaîne"],
["^G4LE",1580,4,"4 en ligne Atkinson","GDi hybride / PHEV","Chaîne"],
["^G4KH",1998,4,"4 en ligne","Turbo T-GDi Performance","Chaîne"],
["^G4KL",1998,4,"4 en ligne","Turbo T-GDi","Chaîne"],
["^G4KN",2497,4,"4 en ligne","Turbo T-GDi","Chaîne"],
["^G6DP",3342,6,"V6","Biturbo T-GDi","Chaîne"],
["^G16",1591,4,"4 en ligne","Atmosphérique / turbo","Chaîne"],
["^G15T",1497,4,"4 en ligne","Turbo essence","Chaîne"],
["^D16DT",1598,4,"4 en ligne","Diesel common rail","Chaîne"],
["^D20DT",1998,4,"4 en ligne","Diesel common rail","Chaîne"],
["^D4FB",1582,4,"4 en ligne","Diesel CRDi VGT","Chaîne"],
["^D4FE",1598,4,"4 en ligne Smartstream","Diesel CRDi + SCR","Chaîne"],
["^D4HB",2199,4,"4 en ligne","Diesel CRDi + SCR","Chaîne"],
["^D4HC",2199,4,"4 en ligne","Diesel CRDi + SCR","Chaîne"],
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
["^L15B",1498,4,"4 en ligne","Turbo VTEC","Chaîne"],
["^L15C",1498,4,"4 en ligne","Turbo VTEC","Chaîne"],
["^L13Z",1339,4,"4 en ligne","i-VTEC","Chaîne"],
["^K20C",1996,4,"4 en ligne","Turbo VTEC Type R","Chaîne"],
["^P10A",988,3,"3 en ligne","Turbo VTEC","Chaîne"],
["^N16",1597,4,"4 en ligne","Diesel i-DTEC","Chaîne"],
["^P5-VPS",1496,4,"4 en ligne Skyactiv-G","Atmosphérique","Chaîne"],
["^PE-VPS",1998,4,"4 en ligne Skyactiv-G","Atmosphérique haute compression","Chaîne"],
["^PY-VPS",2488,4,"4 en ligne Skyactiv-G","Atmosphérique / PHEV","Chaîne"],
["^S5-DPTS",1499,4,"4 en ligne Skyactiv-D","Diesel","Chaîne"],
["^S8-DPTS",1759,4,"4 en ligne Skyactiv-D","Diesel","Chaîne"],
["^SH-VPTS",2191,4,"4 en ligne Skyactiv-D","Diesel biturbo","Chaîne"],
["^SPCCI",1998,4,"4 en ligne Skyactiv-X","Allumage par compression","Chaîne"],
["^T3-VPT",3283,6,"6 en ligne","Diesel MHEV 48 V","Chaîne"],
["^K14",1373,4,"4 en ligne","Turbo Boosterjet","Chaîne"],
["^K15",1462,4,"4 en ligne","Atmo / Strong Hybrid","Chaîne"],
["^Z12E",1197,3,"3 en ligne","Mild Hybrid 12 V","Chaîne"],
["^M16A",1586,4,"4 en ligne","Atmosphérique VVT","Chaîne"],
["^FB",1995,4,"Boxer 4 à plat","Atmo / e-Boxer","Chaîne"],
["^FA",1998,4,"Boxer 4 à plat","Turbo injection directe","Chaîne"],
["^EJ25",2457,4,"Boxer 4 à plat","Turbo","Chaîne"],
["^4B12",2360,4,"4 en ligne Atkinson","PHEV Twin Motor","Chaîne"],
["^4B40",1499,4,"4 en ligne MIVEC","Turbo essence","Chaîne"],
["^4N14",2268,4,"4 en ligne DI-D","Diesel common rail","Chaîne"],
["^4N15",2442,4,"4 en ligne DI-D","Diesel common rail","Chaîne"],
["^(4A9|3A9)",1193,3,"3 en ligne MIVEC","Atmosphérique","Chaîne"],
["^4B11",1998,4,"4 en ligne MIVEC","Atmosphérique","Chaîne"],
["^B4204",1969,4,"4 en ligne","Drive-E turbo","Courroie"],
["^B4154",1498,4,"4 en ligne","Drive-E turbo","Courroie"],
["^B3154",1477,3,"3 en ligne","Drive-E turbo","Courroie"],
["^D4204",1969,4,"4 en ligne","Drive-E diesel","Courroie"],
["^PT204",1997,4,"4 en ligne Ingenium","Turbo essence","Chaîne"],
["^PT15",1498,3,"3 en ligne Ingenium","Turbo essence","Chaîne"],
["^204DT",1999,4,"4 en ligne Ingenium","Diesel turbo","Chaîne"],
["^AJ200D",2996,6,"6 en ligne Ingenium","Diesel MHEV 48 V","Chaîne"],
["^AJ300",2996,6,"6 en ligne Ingenium","Essence MHEV 48 V","Chaîne"],
["^AJ126",2995,6,"V6","Compresseur","Chaîne"],
["^AJ133",5000,8,"V8","Compresseur","Chaîne"],
["^9A2B",1988,4,"Flat-4","Turbo","Chaîne"],
["^9A2",2981,6,"Flat-6","Biturbo injection directe","Chaîne"],
["^9A1",3995,6,"Flat-6","Atmosphérique","Chaîne"],
["^CWV",2995,6,"V6","Turbo / E-Hybrid","Chaîne"],
["^CSZ",2894,6,"V6","Biturbo","Chaîne"],
["^EA825",3996,8,"V8","Biturbo","Chaîne"],
["^W12",5950,12,"W12","Biturbo","Chaîne"],
["^W16",7993,16,"W16","Quadriturbo","Chaîne"],
["^V16",8300,16,"V16","Atmosphérique + hybride","Chaîne"],
["^GME",1995,4,"4 en ligne MultiAir","Turbo essence","Chaîne"],
["^690T",2891,6,"V6 90°","Biturbo injection directe","Chaîne"],
["^940B",1742,4,"4 en ligne","Turbo MultiAir","Chaîne"],
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
["^F140",6496,12,"V12","Atmosphérique","Chaîne"],
["^L539",6498,12,"V12","Atmosphérique + hybride","Chaîne"],
["^L520",5204,10,"V10","Atmosphérique","Chaîne"],
["^CEH",3996,8,"V8","Biturbo","Chaîne"],
["^AE31",5204,12,"V12","Biturbo","Chaîne"],
["^M840",3994,8,"V8","Biturbo","Chaîne"],
["^M630",2993,6,"V6","Biturbo + hybride","Chaîne"],
["^N74",6749,12,"V12","Biturbo","Chaîne"],
["^RZ4E",1898,4,"4 en ligne","Diesel common rail","Chaîne"],
["^F1C",2998,4,"4 en ligne","Diesel common rail","Courroie"],
["^SQR",1598,4,"4 en ligne","Turbo TGDi","Chaîne"],
["^JL476",1498,4,"4 en ligne","Turbo TGDi","Chaîne"],
["^JLH",1477,3,"3 en ligne","Turbo / PHEV","Chaîne"],
["^BHE15",1499,4,"4 en ligne","Hybride EM-i","Chaîne"],
["^15E4E",1490,4,"4 en ligne","Turbo T-GDi / PHEV","Chaîne"],
["^10E4E",999,3,"3 en ligne","Turbo T-GDi","Chaîne"],
["^15S4C",1498,4,"4 en ligne","Atmosphérique VTi","Chaîne"],
["^MG3-HEV",1498,4,"4 en ligne Atkinson","Hybrid+ 3 rapports","Chaîne"],
["^BYD-DMI",1498,4,"4 en ligne Xiaoyun","DM-i série/parallèle","Chaîne"],
["^GW4B15",1499,4,"4 en ligne","Turbo / hybride","Chaîne"],
["^GW4C20",1998,4,"4 en ligne","Turbo","Chaîne"],
["^GW4D20",1996,4,"4 en ligne","Diesel common rail","Chaîne"],
["^GW6V30",2993,6,"V6","Turbo + hybride","Chaîne"],
["^SFG15",1498,4,"4 en ligne","Turbo / PHEV","Chaîne"],
["^SWM15",1498,4,"4 en ligne","Hybride","Chaîne"],
["^CA4GC20",1998,4,"4 en ligne","Turbo","Chaîne"],
["^A151",1498,4,"4 en ligne","Turbo","Chaîne"],
["^B20B",1998,4,"4 en ligne","Turbo","Chaîne"],
["^HFC4GC",1499,4,"4 en ligne","Turbo TGDi","Chaîne"],
["^HFC4DB",1999,4,"4 en ligne","Diesel common rail","Chaîne"],
["^RE-ROT",1498,4,"4 en ligne","Générateur range extender","Chaîne"],
["^DCI",479,2,"2 en ligne","Diesel common rail","Courroie"],
["^B10X",999,3,"3 en ligne","Turbo DI","Chaîne"],
["^B12X",1229,4,"4 en ligne","Atmosphérique","Chaîne"],
["^B14T",1364,4,"4 en ligne","Turbo MultiAir","Chaîne"],
["^B15T",1490,4,"4 en ligne","Turbo DI","Chaîne"],
["^B20T",1998,4,"4 en ligne","Turbo DI","Chaîne"],
["^B13D",1248,4,"4 en ligne","Diesel common rail","Courroie"],
["^B16D",1598,4,"4 en ligne","Diesel common rail","Chaîne"],
["^B20D",1956,4,"4 en ligne","Diesel common rail","Chaîne"],
["^B10D",995,4,"4 en ligne","Atmosphérique","Chaîne"],
["^B12D",1206,4,"4 en ligne","Atmosphérique","Chaîne"],
["^LE2",1399,4,"4 en ligne","Turbo essence","Chaîne"],
["^Z20D",1956,4,"4 en ligne","Diesel common rail","Chaîne"],
["^M270",1595,4,"4 en ligne","Turbo DI","Chaîne"],
["^M274",1991,4,"4 en ligne","Turbo DI","Chaîne"],
["^VR30",2997,6,"V6","Biturbo","Chaîne"],
["^VR38",3799,6,"V6","Biturbo","Chaîne"],
["^VQ35",3498,6,"V6","Hybride","Chaîne"],
["^V9X",2993,6,"V6","Diesel","Chaîne"],
["^VK50",5026,8,"V8","Atmosphérique","Chaîne"],
["^LSY",1998,4,"4 en ligne","Turbo DI","Chaîne"],
["^LGX",3649,6,"V6","Atmosphérique","Chaîne"],
["^L87",6162,8,"V8","Atmosphérique","Chaîne"],
["^LM2",2993,6,"6 en ligne","Diesel","Chaîne"],
["^LZ0",2993,6,"6 en ligne","Diesel","Chaîne"],
["^DT",2993,6,"6 en ligne","Biturbo Hurricane","Chaîne"],
["^EXJ",2993,6,"V6","Diesel EcoDiesel","Chaîne"],
["^ERC",3604,6,"V6","Atmosphérique / PHEV","Chaîne"],
["^EC1",1995,4,"4 en ligne","Turbo / PHEV","Chaîne"],
["^ED6",2360,4,"4 en ligne","Atmosphérique Tigershark","Chaîne"],
["^J35",3471,6,"V6","Atmosphérique","Chaîne"],
["^J30",2997,6,"V6","Turbo Type S","Chaîne"],
["^Duratec",1999,4,"4 en ligne","Atmosphérique","Chaîne"],
["^mStallion",1997,4,"4 en ligne","Turbo DI","Chaîne"],
["^mHawk",2184,4,"4 en ligne","Diesel common rail","Chaîne"],
["^YS23",2298,4,"4 en ligne","Diesel common rail","Chaîne"]];

var eva=[
["^(APP|MEB)","Synchrone aimants permanents",400,"MEB / MEB+"],
["^PPE","Synchrone aimants permanents",800,"PPE"],
["^EM(17|21|23)","Synchrone aimants permanents",800,"E-GMP 800 V"],
["^EM16","Synchrone aimants permanents",400,"E-GMP 400 V"],
["^(5AM|6AK|EV-R|EV-TWI|EV-LF|EV-A39)","Synchrone rotor bobiné",400,"AmpR"],
["^GEN5","Synchrone rotor bobiné Gen5",400,"BMW Gen5"],
["^NK","Synchrone rotor bobiné Gen6",800,"Neue Klasse"],
["^IB1","Synchrone hybride eDrive",400,"BMW i"],
["^J1","Synchrone aimants permanents",800,"J1"],
["^(3D|TS|TX|CT|TR)","Synchrone + asynchrone",400,"Tesla"],
["^(EVA|MMA|EAS)","Synchrone aimants permanents",800,"Mercedes EVA / MMA"],
["^BYD","Synchrone · Blade LFP",400,"e-Platform 3.0"],
["^1YM","Synchrone aimants permanents",400,"e-TNGA"],
["^EM57","Synchrone aimants permanents",400,"Nissan EV"],
["^(ZKX|EM0|STLA)","Synchrone aimants permanents",400,"Stellantis"],
["^SEA","Synchrone aimants permanents",400,"SEA / SEA-E"],
["^EV-ULT","Synchrone aimants permanents",400,"Ultium"],
["^EV-","Synchrone aimants permanents",400,"Plateforme EV"]];

var tq={"eb2|82":118,"eb2|110":205,"eb2|130":230,"eb2ltedh|100":205,"eb2ltedh|136":230,
"dv5|100":250,"dv5|130":300,"dv6|100":254,"dw10|150":370,"dw10|180":400,"dw12|165":380,
"ep6|180":250,"ep6|225":300,"h4bt|90":135,"h4dt|100":170,"h5ft|120":205,"h5ht|140":240,"h5ht|160":270,
"k9k|115":260,"m9r|150":340,"m9t|150":360,"m9t|180":400,"hr13|140":240,"hr13|158":270,
"dkl|110":200,"dpca|150":250,"duv|150":250,"czp|190":320,"dnna|245":370,"dnf|320":420,
"dsu|150":360,"dtu|193":400,"ddve|344":700,"b38|136":220,"b48|184":300,"b48|258":400,
"b58|340":500,"b58|387":500,"b47|190":400,"b57|286":650,"s58|510":650,"m282|163":250,
"m254|204":320,"m256|381":500,"m139|421":500,"om654|190":400,"om656|330":700,
"m15a-fxe|116":125,"2zr-fxe|140":142,"a25a-fxs|218":221,"m20a-fxs|196":190,
"g4ft|150":250,"g4ft|180":265,"g4fj|177":265,"g4kh|280":392,"d4fe|136":320,
"b7ja|125":210,"b7ja|155":240,"ylcb|150":350,"bkf|170":405,"leb|131":253,"lfa|184":335,
"k20c|329":420,"pe-vps|150":213,"sh-vpts|184":445,"pt204|250":365,"204dt|204":430,
"aj200d|300":650,"gme|280":400,"690t|510":600,"552|130":350,"gse|130":230,"m156|630":730,
"f154|720":770,"ceh|666":850,"n74|571":900,"sqr|185":310,"jlh|276":425,"mg3-hev|194":250};

/* ═══ PANNES · CAMPAGNES · RAPPELS · TSB ═══ */
var faults=[
["F-EB2-BELT","engine","peugeot,citroen,ds,opel,fiat,alfa,jeep,lancia","1.2 PureTech","rappel","critique",2017,2024,"Courroie humide — dégradation et colmatage crépine","Bruit courroie à froid, voyant pression huile, débris, perte puissance, wet belt, calage.","VIN campagne Stellantis|Largeur courroie au gabarit|Carter + crépine|Pression huile à chaud|Kit courroie+pompe+crépine, vidange rinçage","Courroie humide, pompe huile, crépine, tendeur","P0016,P0011,P0521,P0341,P0087","Rappel Conso Stellantis","distribution,moteur"],
["F-EB2-PUMP","engine","peugeot,citroen,ds,opel","1.2 PureTech","campagne","critique",2017,2024,"Pompe à huile — crépine colmatée par débris","Voyant huile, mode dégradé, casse turbo, limailles, pression basse.","Pression huile manométrique à chaud|Carter + crépine|Turbo et coussinets|Pompe+crépine+kit courroie|Rinçage vidange","Pompe huile, crépine, turbo, coussinets","P0521,P0087,P0299","Campagne Stellantis EB2","moteur,distribution,suralim"],
["F-EB2-HYB","engine","peugeot,citroen,ds,opel,fiat,alfa,jeep,lancia,abarth","1.2 Hybrid 48V","tsb","moyen",2023,2027,"e-DCS6 — apprentissage boîte et à-coups","À-coups démarrage, hésitation 1-2, bruit chaîne à froid, broutage, eDCS6.","Adaptations et usure e-DCS6|Calibration TCU|Apprentissage embrayage|Huile boîte et chaîne|Essai validation","Boîte e-DCS6, chaîne, TCU, ISG","P0700,P1750,P0A7F","TSB Stellantis e-DCS6","transmission,acoups,distribution,elec48"],
["F-DV5-CHAIN","engine","peugeot,citroen,ds,opel,toyota","1.5 BlueHDi","campagne","eleve",2017,2023,"Chaîne AAC 7 mm — allongement / rupture","Claquement à froid, corrélation vilo/AAC, calage décalé, chaîne 7mm 8mm.","Jeu et allongement chaîne AAC|Référence kit renfort 8 mm selon VIN|Chaîne+tendeur+pignons|Calage et adaptations","Kit chaîne AAC, tendeur, pignons","P0016,P0017,P0340","Campagne Stellantis DV5","distribution,moteur"],
["F-DV5-SCR","engine","peugeot,citroen,ds,opel","1.5 BlueHDi","rappel","eleve",2017,2025,"SCR AdBlue — cristallisation injecteur / pompe","Compte à rebours non-redémarrage, voyant AdBlue, NOx, urée, perte puissance.","P20EE/P204F et compteurs SCR|Débit pompe AdBlue|Cristallisation injecteur|Remplacement + réinitialisation|Qualité AdBlue réfractomètre","Pompe AdBlue, injecteur SCR, capteurs NOx","P20EE,P204F,P207F,P2201","Rappel Conso Stellantis SCR","depol,injection"],
["F-DV5-FAP","engine","peugeot,citroen,ds,opel","1.5 BlueHDi","panne","moyen",2017,2025,"FAP — colmatage trajets courts et dilution huile","Régénérations rapprochées, perte puissance, huile qui monte, DPF, suie.","ΔP FAP charge suie cendres|Nombre régénérations et distance|Niveau et odeur huile|Régénération forcée + essai long|Remplacement si irréversible","FAP, capteur ΔP, injecteurs, huile","P2002,P2463,P246C,P242F","Retour terrain Stellantis","depol,moteur"],
["F-EP6-CHAIN","engine","peugeot,citroen,ds,opel,mini,bmw","1.6 PureTech","panne","eleve",2017,2023,"Chaîne EP6 Prince — tendeur et calage","Claquement métallique à froid, ralenti instable, ratés, THP Prince.","Synchro vilo/AAC oscilloscope|Tendeur patins guides|Kit chaîne complet|Pression huile et déphaseur","Kit chaîne, tendeur, patins, déphaseur","P0016,P0011,P0341","TSB PSA BMW EP6","distribution,moteur"],
["F-EP6-OIL","engine","peugeot,citroen,ds","1.6 THP","panne","eleve",2017,2021,"Consommation huile et calamine admission","Baisse niveau, fumée bleue, ratés, calamine, segmentation, PCV.","Consommation sur 1000 km|Endoscopie cylindres soupapes|Séparateur huile et carter|Décalaminage puis segmentation","Segments, PCV, soupapes, joints queues","P0300,P0301,P0171","TSB PSA THP","moteur,injection,allumage"],
["F-PSA-EAT","engine","peugeot,citroen,ds,opel,toyota","1.6 PureTech","tsb","moyen",2018,2027,"EAT6 EAT8 — à-coups et huile à vie","À-coups basse vitesse, passages brutaux, patinage à chaud, ATF Aisin.","Adaptations et usure|Niveau ATF température normée|Mise à jour TCU|Vidange ATF intervalle révisé|Essai apprentissage","Mécatronique EAT, ATF, convertisseur","P0700,P1750,P0218","TSB Stellantis Aisin","transmission,acoups"],
["F-PSA-SCREEN","brand","peugeot,citroen,ds,opel","","panne","moyen",2017,2027,"Tablette tactile — touches fantômes et reboot","Écran clique seul, reboot, perte CarPlay, écran noir, bulles, NAC IVI.","Version et journaux|Nappe LVDS et alimentation dalle|Mise à jour multimédia|Remplacement dalle|Masse boîtier","Dalle tactile, nappe LVDS, multimédia","U0101,U0121,B1000","Retour terrain Stellantis","tablette,telematique"],
["F-PSA-KEY","brand","peugeot,citroen,ds,opel","","panne","moyen",2017,2027,"Keyless — non-détection clé, démarrage refusé","Clé non détectée, démarrage impossible, ouverture aléatoire, BSI.","Pile télécommande|12 V et chute au démarrage|Antennes BF habitacle|Interférences badge téléphone|Reprogrammation clé","Pile, antennes BF, BSI, 12 V","B1000,U0100,P0562","Retour terrain Stellantis","cle,elec12,portes"],
["F-STLA-OBC","model","peugeot,citroen,ds,opel,fiat,alfa,lancia,abarth","c5air-2,408,3008-3,5008-3,frontera,panda-4,600,junior,grandland-2,ypsilon-4,delta,gamma,500e,dsn4,dsn8","campagne","eleve",2024,2027,"STLA Medium e-CMP2 — OBC et verrou de trappe","Charge AC interrompue, trappe non verrouillée, eau dans prise, OBC.","Codes OBC et actuateur trappe|Multi-bornes AC et autre câble|Verrou joints évacuations|Campagne OBC trappe|Revalider AC DC verrouillage","OBC, actuateur trappe, joints, faisceau HV","P0D11,B1000,P0C00,P0AA6","Campagne Stellantis STLA","charge,hv,portes,carrosserie"],
["F-H5F-OIL","engine","renault,dacia","1.2 TCe","panne","critique",2017,2019,"1.2 TCe H5Ft — consommation huile et casse moteur","Consommation anormale, fumée bleue, cliquetis, casse turbo, DIG-T.","Consommation 1000 km|Pression huile et crépine|Endoscopie cylindres|Éligibilité campagne moteur|Turbo et dépressurisation carter","Segments, piston, turbo, PCV, crépine","P0301,P0521,P0299","Campagne Renault H5Ft","moteur,suralim,injection"],
["F-H5H-CHAIN","engine","renault,dacia,nissan,mercedes","1.3 TCe","tsb","eleve",2018,2025,"1.3 TCe H5Ht M282 — chaîne, huile et GPF","Claquement à froid, voyant moteur, baisse niveau, GPF, filtre particules essence.","Synchro AAC vilo|Tendeur et guides|Consommation huile|GPF et pression différentielle|Mise à jour moteur","Kit chaîne, tendeur, GPF, PCV","P0016,P0420,P0299,P2002","TSB Alliance H5H M282","distribution,moteur,depol"],
["F-K9K-EGR","engine","renault,dacia,nissan","1.5 Blue dCi","campagne","eleve",2017,2024,"EGR et refroidisseur — encrassement / fuite LDR","Perte puissance bas régime, fumée, fuite liquide, vanne EGR caloportage.","P0401 position EGR consigne réel|Circuit LDR sous pression|Encrassement refroidisseur mélangeur|Nettoyage remplacement + adaptations|Impact FAP","Vanne EGR, refroidisseur, capteur, joints","P0401,P0402,P0490,P040B","Campagne Renault dCi","depol,thermique"],
["F-K9K-TURBO","engine","renault,dacia,nissan","1.5 dCi","panne","eleve",2017,2021,"Turbo — GAV grippée et durite de suralimentation","Sifflement, perte puissance, mode dégradé, fumée noire, boost wastegate.","Pression suralimentation consigne réel|Actionneur GAV|Fuite au générateur de fumée|Crépine alimentation huile turbo","Turbo, GAV, durites, échangeur","P0299,P0234,P2263","Retour terrain dCi","suralim,moteur"],
["F-M9T","engine","renault,opel,nissan","2.3 dCi","tsb","moyen",2017,2027,"Master Movano M9T — chaîne et injecteurs","Claquement à froid, démarrage difficile, fumée, ratés, rail débit retour.","Allongement chaîne et tendeur|Débits retour injecteurs|Pression rail au démarrage|FAP SCR + réinitialisation","Kit chaîne, injecteurs, pompe HP, rail","P0016,P0087,P0201","TSB Renault M9T","distribution,injection"],
["F-RN-EDC","brand","renault,dacia,alpine","","tsb","moyen",2017,2027,"EDC / multimode — à-coups et usure embrayage","Broutage démarrage, à-coups 1-2, boîte chaude, Getrag DCT multimode.","Adaptations et température|Niveau huile boîte|Mise à jour TCU + apprentissage|Embrayage butée actionneur|Essai à froid et à chaud","Embrayage EDC, mécatronique, TCU","P0700,P1750,P0218","TSB Renault EDC","transmission,acoups"],
["F-AMP-BMS","model","renault,nissan,dacia,alpine","r5,r4,r5gtl,twingo-e,micra-6,a290,a390,scenic-e,megane-e,leaf-3","tsb","moyen",2022,2027,"AmpR — BMS, SOC, équilibrage et préconditionnement","Jauge imprécise, charge lente à froid, delta cellules, autonomie SOH.","Delta cellules SOH températures|Charge lente complète 100 %|Mise à jour BMS|Réapprentissage SOC|Pompe LDR préconditionnement","BMS, modules, sondes, pompe LDR","P0AA6,P0C00,U0111,P0AFA","TSB Renault AmpR","hv,autonomie,charge,thermique"],
["F-ZOE-OBC","model","renault","zoe","campagne","eleve",2019,2024,"Chargeur embarqué Type 2 — échauffement","Charge AC interrompue, odeur chaud, broches noircies, Caméléon 22 kW.","Broches véhicule et câble|Thermographie en charge AC|Codes chargeur embarqué|Connecteur OBC selon campagne|Multi-bornes et câbles","Connecteur Type 2, OBC, faisceau HV","P0D11,P0C00,U0111","Campagne Renault Zoe","charge,hv,elec12"],
["F-RN-CARD","brand","renault,dacia","","panne","moyen",2017,2027,"Carte mains libres — non-reconnaissance","Carte non détectée, ouverture impossible, démarrage aléatoire, UCH keyless.","Pile carte|12 V et masses|Antennes BF et lecteur|Interférences et UCH|Reprogrammation carte","Carte, antennes BF, UCH, 12 V","B1000,U0100","Retour terrain Renault","cle,portes,elec12"],
["F-SPR-BRAKE","model","dacia","spring","rappel","critique",2021,2026,"Spring — servofrein électrique défaillant","Pédale dure, distance allongée, voyant freinage, assistance iBooster.","Éligibilité VIN|Assistance et codes|Capteur course pédale|Servofrein selon campagne|Essai de freinage","Servofrein électrique, capteur pédale","C1365,P0562","Rappel Conso Safety Gate","freinage,abs,elec12"],
["F-BIG-SPRING","model","dacia","bigster,duster-3","rappel","critique",2024,2027,"Ressorts arrière — risque de rupture","Claquement arrière, véhicule penché, fissure ressort, suspension train AR.","VIN Rappel Conso|Roues arrière suspendues|Inspection deux ressorts|Ressorts coupelles butées|Couples puis géométrie","Ressorts AR, coupelles, butées","","Rappel Conso Safety Gate","train,geometrie"],
["F-EA211","engine","volkswagen,audi,skoda,seat,cupra","1.5 TSI","tsb","moyen",2017,2027,"EA211 evo — courroie, ACT et à-coups","Bruit courroie, à-coups bas régime, voyant moteur, ACT cylindre désactivé.","État tension courroie|Défauts désactivation ACT|Consommation huile|Mise à jour moteur","Courroie, tendeur, ACT, bougies","P0016,P0300,P0301","TSB VAG EA211 evo","distribution,acoups,moteur"],
["F-EA888","engine","volkswagen,audi,skoda,seat,cupra,porsche","2.0 TSI","panne","eleve",2017,2022,"EA888 gen3 — tendeur de chaîne et huile","Claquement démarrage à froid, ratés, baisse niveau, tendeur PCV.","Corrélation vilo AAC|Tendeur référence révisée|Consommation huile 1000 km|PCV et segmentation","Kit chaîne, tendeur, PCV, segments","P0016,P0011,P0300","TSB VAG EA888","distribution,moteur"],
["F-EA288-SCR","engine","volkswagen,audi,skoda,seat,cupra","2.0 TDI","campagne","eleve",2017,2027,"EA288 — SCR, capteurs NOx et pompe AdBlue","Voyant AdBlue, compte à rebours, défaut NOx, rendement SCR urée.","P20EE valeurs NOx amont aval|Débit pompe|Cristallisation|Mise à jour NOx + réinitialisation","Pompe AdBlue, injecteur, capteurs NOx","P20EE,P2201,P204F","Campagne VAG EA288","depol,injection"],
["F-EA288-EGR","engine","volkswagen,audi,skoda,seat,cupra","2.0 TDI","panne","moyen",2017,2027,"EA288 — refroidisseur EGR et vanne encrassée","Perte puissance, fumée, consommation LDR, EGR caloportage.","Circuit LDR sous pression|Position EGR consigne réel|ΔP FAP|Nettoyage remplacement vanne refroidisseur|Adaptations","Vanne EGR, refroidisseur, FAP","P0401,P0402,P2002","Retour terrain VAG","depol,thermique"],
["F-VAG-DSG","brand","volkswagen,audi,skoda,seat,cupra","","tsb","eleve",2017,2027,"DSG DQ200 DQ250 DQ381 — mécatronique","À-coups démarrage, vitesses non engagées, patinage, S-tronic DSG7.","Codes TCU adaptations|Niveau état huile|Pression hydraulique mécatronique|Mise à jour TCU apprentissage|Remplacement si hors tolérance","Mécatronique, embrayages, huile DSG","P0700,P1750,P189C","TSB VAG DSG","transmission,acoups"],
["F-MEB-12V","model","volkswagen,audi,skoda,seat,cupra,ford","id3,id4,id5,id7,idbuzz,enyaq,elroq,epiq,born,q4,explorer,capri,tavascan,tayron,id2,raval,vision","campagne","eleve",2020,2027,"MEB MEB+ — décharge 12 V et logiciel ICU ICAS","Non démarrable après immobilisation, écrans redémarrent, veille 12 V lithium.","Courant de repos après veille|SOH 12 V Li-ion ou AGM|Campagne ICU ICAS|Remplacement 12 V|Contrôle DC-DC","Batterie 12 V, DC-DC, ICAS, TCU","U0111,P0562,P0AA6,U0101","Campagne VW MEB","elec12,hv,telematique,tablette"],
["F-MEB-BRAKE","model","volkswagen,audi,skoda,cupra","id3,id4,id5,id7,enyaq,elroq,born,epiq,q4,tavascan","tsb","moyen",2020,2027,"MEB — régénératif et corrosion disques arrière","Bruit freinage, freinage AR faible, à-coups décélération, disques corrodés regen.","Épaisseur voile disques AR|Mobilité étriers|Calibration régénératif|Nettoyage étriers disques|Rodage essai","Disques AR, étriers, logiciel freinage","C1365","TSB VW MEB","freinage,abs,acoups"],
["F-MEB-DOOR","model","volkswagen,audi,skoda,cupra,ford","id3,id4,id5,id7,idbuzz,enyaq,elroq,capri,explorer","campagne","eleve",2020,2027,"Poignées affleurantes — ouverture électronique défaillante","Porte ne s'ouvre pas, ouverture intempestive, poignée module keyless.","Défauts module porte|Actionneur micro-contact|Alimentation masses 12 V|Campagne logicielle|Déverrouillage secours","Actionneur poignée, module porte, faisceau","B1000,U0100","Campagne VW MEB","portes,cle,elec12"],
["F-PPE-800","model","audi,porsche,polestar","a6e,q6,etrongt,macane,taycan,ps5","tsb","eleve",2024,2027,"PPE J1 800 V — contacteurs DC et précharge","Claquement connexion, charge DC refusée, alerte HV 800V précharge.","Codes contacteurs précharge|Tension de précharge|Contacteurs DC verrouillage|Mise à jour gestion charge|Revalider borne 800 V","Contacteurs DC, précharge, BMS, OBC","P0AA6,P0D11,P0C00","TSB PPE J1","charge,hv,thermique"],
["F-B47-CHAIN","engine","bmw,mini","2.0 320d","panne","eleve",2017,2024,"B47 — chaîne côté boîte de vitesses","Claquement à froid, bruit tablier, démarrage difficile, chaîne arrière B37.","Synchro AAC vilo|Bruit côté boîte|Dépose boîte accès kit|Chaîne tendeur patins complets","Kit chaîne B47, tendeur, patins","P0016,P0017,P0335","TSB BMW B47","distribution,moteur"],
["F-B47-EGR","model","bmw,mini","s3,x3,x1,s1,s5,x5,s4,x2,x4,s2,s2c,s3t","rappel","critique",2017,2022,"Refroidisseur EGR — fuite LDR et risque incendie","Odeur liquide chaud, fumée blanche, baisse niveau LDR, glycol incendie.","Éligibilité VIN campagne|Circuit sous pression localisation fuite|LDR dans admission|Refroidisseur référence révisée|FAP en aval","Refroidisseur EGR, joints, durites, FAP","P0401,P0402,P0217","Rappel BMW NHTSA KBA","depol,thermique,moteur"],
["F-BM-DC","model","bmw","ix,i4,i5,i7,ix1,ix3,ix3na","campagne","moyen",2021,2027,"Charge DC — limitation thermique et préconditionnement","Charge rapide lente, puissance plafonnée, préconditionnement inefficace.","Historique thermique batterie|Débit pompe LDR|Mise à jour gestion charge|Borne haute puissance froid chaud","Pompe LDR, échangeur, BMS, vanne","P0C00,P0AA6,P0D11","Campagne BMW Gen5","charge,hv,thermique,autonomie"],
["F-BM-IDRIVE","brand","bmw,mini","","panne","moyen",2017,2027,"iDrive — écran noir, reboot et caméra perdue","Écran figé, redémarrages, perte CarPlay, caméra recul absente, MGU.","Version journaux head unit|Alimentation nappe vidéo|Mise à jour logicielle|Mémoire eMMC|Remplacement head unit","Head unit, nappe vidéo, mémoire, TCU","U0101,U0121,B1000","Retour terrain BMW","tablette,telematique,camera"],
["F-NK-OTA","model","bmw","ix3na","tsb","moyen",2026,2027,"Neue Klasse — BMS, OTA et Panoramic iDrive","OTA interrompu, SOC figé, affichage panoramique figé, Gen6.","Version journaux OTA|12 V pendant mise à jour|Reflash BMS|Réapprentissage SOC|TCU et affichage","BMS, TCU, 12 V, Panoramic Vision","U0101,P0AA6,P0562","TSB BMW Neue Klasse","telematique,hv,tablette"],
["F-OM654-NOX","engine","mercedes","2.0 A200d","campagne","eleve",2018,2027,"OM654 — capteurs NOx et injecteur AdBlue","Voyant AdBlue, compte à rebours, perte puissance, BlueTEC SCR.","Valeurs NOx amont aval|Cristallisation injecteur|Débit pompe|Remplacement + compteurs SCR","Capteurs NOx, injecteur AdBlue, pompe","P20EE,P2201,P204F","Campagne Mercedes OM654","depol,injection"],
["F-OM651-CHAIN","engine","mercedes,infiniti","2.2 116 CDI","panne","eleve",2017,2021,"OM651 — chaîne de distribution et patins","Claquement à froid, bruit distribution, ratés, CDI 2.2.","Allongement chaîne|Patins tendeur hydraulique|Kit complet|Pression huile","Kit chaîne OM651, tendeur, patins","P0016,P0017","TSB Mercedes OM651","distribution,moteur"],
["F-MB-48V","model","mercedes","classea,classeb,classec,classee,gla,glb,glc,gle,gls,cla,cle","campagne","eleve",2018,2027,"Alterno-démarreur 48 V et DC-DC","Non-démarrage, voyant batterie, stop start inopérant, EQ Boost ISG.","Codes réseau 48 V DC-DC|Tension SOH batterie 48 V|Éligibilité campagne|Masses faisceau|Mise à jour logicielle","Alterno-démarreur 48 V, batterie, DC-DC","P0562,U0111,P0A7F","Campagne Mercedes 48 V","elec48,elec12,acoups"],
["F-MB-MBUX","brand","mercedes,smart","","panne","moyen",2018,2027,"MBUX Hyperscreen — tactile inopérant et reboot","Écran noir, tactile inerte, assistant vocal indisponible, OTA.","Version MBUX journaux|Alimentation dalle nappe|Mise à jour|Module télématique|Remplacement dalle","Dalle MBUX, télématique, nappe vidéo","U0101,U0121","Retour terrain Mercedes","tablette,telematique"],
["F-MB-9G","brand","mercedes","","tsb","moyen",2017,2027,"9G-Tronic — à-coups convertisseur et huile","À-coups basse vitesse, vibrations charge légère, 9G ATF.","Adaptations température huile|Niveau ATF normé|Mise à jour TCU|Vidange ATF intervalle révisé|Convertisseur","Convertisseur, ATF, TCU, échangeur","P0700,P1750","TSB Mercedes 9G","transmission,acoups"],
["F-MMA-CO2","model","mercedes","claev,glcev","campagne","moyen",2025,2027,"MMA 800 V — pompe à chaleur CO2 et thermique","Autonomie hivernale réduite, alerte thermique pack, chauffage faible R744.","Codes circuit thermique|Charge CO2 compresseur|Vannes boucle échangeur|Mise à jour thermique|Revalider autonomie charge DC","Pompe à chaleur CO2, vannes, compresseur","P0C00,P0AA6","Campagne Mercedes MMA","thermique,hv,autonomie"],
["F-G4FJ-LSPI","engine","hyundai,kia","1.6 T-GDi","tsb","eleve",2017,2023,"G4FJ Theta — cliquetis LSPI et coussinets","Claquement sourd à chaud, limailles huile, perte puissance, LSPI bielle.","Analyse huile limailles|Compteurs cliquetis|Éligibilité campagne moteur|Pression huile|Huile anti-LSPI normée","Coussinets bielle, piston, pompe huile","P0301,P0521,P0234","Campagne Hyundai Kia Theta NHTSA","moteur,injection,suralim"],
["F-D4FE-FAP","engine","hyundai,kia","1.6 CRDi","campagne","moyen",2018,2025,"D4FE — FAP, EGR et logiciel dépollution","Régénérations fréquentes, perte puissance, voyant moteur, CRDi DPF.","Charge suie ΔP FAP|Vanne EGR refroidisseur|Mise à jour FAP|Niveau huile dilution","FAP, vanne EGR, capteur ΔP","P2002,P2463,P0401","Campagne Hyundai Kia CRDi","depol,moteur"],
["F-ICCU","model","hyundai,kia,genesis","ioniq5,ioniq6,ioniq9,ev3,ev4,ev5,ev6,ev9,gv60,gv70","rappel","critique",2021,2027,"ICCU E-GMP — chargeur intégré et DC-DC","Non-charge AC DC, 12 V à plat, immobilisation, ICCU V2L.","Codes ICCU état DC-DC|12 V après repos|Éligibilité VIN|Remplacement ICCU 12 V|Fusible HV réinitialisation","ICCU, DC-DC, 12 V, fusible HV","P1B77,P0AA6,U0111,P0562","Rappel Hyundai Kia E-GMP NHTSA","charge,elec12,hv"],
["F-KONA-BAT","model","hyundai","kona-1,ioniq","rappel","critique",2018,2022,"Batterie HV — cellules et risque incendie en charge","Odeur inhabituelle, perte autonomie brutale, alerte batterie, incendie LG.","Éligibilité VIN|Delta cellules températures|Limitation charge provisoire|Modules ou pack|Ne pas charger 100 %","Modules HV, BMS, contacteurs","P0AA6,P0AFA,U0111","Rappel Hyundai Kona NHTSA","hv,charge,autonomie"],
["F-HK-DCT","brand","hyundai,kia","","tsb","moyen",2017,2027,"DCT7 DCT6 hybride — à-coups et apprentissage","Broutage démarrage, hésitation reprise, à-coups à chaud, double embrayage.","Adaptations température|Mise à jour TCU|Apprentissage constructeur|Huile actionneur|Essai validation","Embrayages DCT, actionneur, TCU","P0700,P1750","TSB Hyundai Kia DCT","transmission,acoups"],
["F-HK-SEAT","brand","hyundai,kia,genesis","","panne","info",2017,2027,"Siège — réglage électrique et nappe de présence","Réglage inopérant, voyant airbag passager, occupancy erratique.","Défauts module siège airbag|Nappe connecteur jaune sous siège|Moteurs fins de course|Capteur présence|Réinitialisation","Nappe occupancy, moteurs siège, SRS","B1000,B0072,B0081","Retour terrain Hyundai Kia","siege,airbag"],
["F-TOY-PUMP","model","toyota,lexus","rav4-5,rav4-6,corolla,corollats,chr-1,chr-2,nx,ux,es,camry,prius","rappel","critique",2018,2021,"Pompe carburant BP — calage et non-démarrage","Calage en roulant, démarrage impossible, ralenti instable, Denso.","Éligibilité VIN|Pression rail au démarrage|Relais alimentation pompe|Pompe BP référence révisée","Pompe carburant BP, relais, filtre","P0087,P0230,P0627","Rappel Toyota Lexus NHTSA","injection,moteur"],
["F-TOY-HSD","engine","toyota,lexus,suzuki","2.5 Hybrid","tsb","moyen",2018,2027,"HSD — pompe à eau onduleur et filtre HV","Voyant système hybride, surchauffe onduleur, perte puissance, inverter.","Codes onduleur température|Débit pompe électrique|Niveau état LDR onduleur|Nettoyage filtre HV|Remplacement pompe","Pompe eau onduleur, LDR, filtre HV","P0A93,P0A7A,P0AA6","TSB Toyota HSD","thermique,hv,autonomie"],
["F-TOY-12V","engine","toyota,lexus","1.5 Hybrid","tsb","moyen",2020,2027,"Hybride — batterie 12 V AGM et courant de veille","Non-démarrage après immobilisation, voyants multiples, READY 12V.","Courant de repos|SOH 12 V AGM|Charge DC-DC en READY|Remplacement référence AGM","Batterie 12 V AGM, DC-DC, masses","P0562,U0111","TSB Toyota Hybrid","elec12,hv"],
["F-BZ4X-WHEEL","model","toyota,subaru","bz4x,solterra","rappel","critique",2022,2024,"Boulons de roue — desserrage et perte de roue","Bruit roue, vibration, risque perte roue, moyeu boulon e-TNGA.","Éligibilité VIN|Couple de serrage boulons|Boulons référence révisée rondelle|Serrage au couple","Boulons de roue, moyeu","C1365","Rappel Toyota Subaru","train,geometrie,acoups"],
["F-NIS-CVT","brand","nissan","","tsb","eleve",2017,2024,"CVT Xtronic — broutage, surchauffe et huile NS-3","Broutage basse vitesse, perte puissance, message transmission, JATCO.","Température codes CVT|État huile NS-3 niveau|Mise à jour TCU|Chaîne poulies|Huile intervalle révisé","CVT, huile NS-3, échangeur, poulies","P0700,P1750","TSB Nissan Xtronic","transmission,acoups,thermique"],
["F-LEAF-SOH","model","nissan","leaf-2,leaf-3","panne","eleve",2017,2027,"Leaf — dégradation SOH et charge bridée","Perte autonomie importante, charge rapide bridée, barres capacité Rapidgate.","SOH nombre charges rapides|Delta cellules|Éligibilité garantie batterie|Thermique passive ou active","Modules batterie, BMS, chargeur","P0AA6,P0AFA,P0C00","Retour terrain garantie Nissan","hv,autonomie,charge"],
["F-HON-DIL","engine","honda","1.5 VTEC Turbo","tsb","eleve",2017,2024,"1.5 VTEC Turbo — dilution huile par carburant","Niveau huile monte, odeur essence, cliquetis, usure trajets courts froid.","Niveau odeur huile|Mise à jour injection thermique|Intervalle vidange réduit urbain froid|Thermostat montée température","Injecteurs, thermostat, huile","P0128,P0172,P0521","TSB Honda 1.5T","injection,moteur,thermique"],
["F-HON-ENY","model","honda","eny1","tsb","moyen",2024,2027,"e:N — charge DC bridée et logiciel BMS","Charge rapide plafonnée sous maximum, courbe de charge e:Ny1.","Historique thermique charge|Boucle LDR batterie|Mise à jour BMS|Borne 150 kW|Revalider courbe","BMS, boucle LDR, OBC","P0C00,P0AA6","TSB Honda e:N","charge,hv,thermique"],
["F-MAZDA-D","engine","mazda","2.2 Skyactiv-D","panne","eleve",2017,2022,"Skyactiv-D 2.2 — calamine et dilution huile","Perte puissance, fumée, huile monte, FAP colmaté, calamine admission.","Charge suie régénérations|Endoscopie admission|Injecteurs dilution|Décalaminage FAP|Vidange rapprochée urbain","Admission, EGR, FAP, injecteurs","P2002,P2463,P0401","Retour terrain Mazda","depol,moteur,injection"],
["F-MAZDA-X","engine","mazda","2.0 Skyactiv-X","tsb","moyen",2019,2027,"Skyactiv-X SPCCI — capteurs pression cylindre","Ratés à froid, cliquetis, mode dégradé, SPCCI allumage compression.","Codes capteurs pression cylindre|Bougies spécifiques|Compression et étanchéité|Mise à jour calculateur","Capteurs pression, bougies, injecteurs","P0300,P0301,P0171","TSB Mazda Skyactiv-X","allumage,moteur,injection"],
["F-SUZ-48","engine","suzuki","1.4 Boosterjet Hybrid","tsb","info",2020,2027,"SHVS 48 V 12 V — batterie lithium et à-coups","Stop start inopérant, à-coups, voyant hybride, SHVS ISG mild hybrid.","Codes SHVS|Tension SOH batterie lithium|ISG et courroie|Mise à jour logicielle","Batterie 48 V 12 V, ISG, DC-DC","P0A7F,P0562","TSB Suzuki SHVS","elec48,acoups,elec12"],
["F-FORD-WET","engine","ford","1.0 EcoBoost","panne","critique",2017,2023,"EcoBoost 1.0 — courroie humide et intrusion LDR","Surchauffe, perte LDR, fumée blanche, ratés après stationnement, wet belt.","État courroie humide débris|Circuit LDR sous pression|Endoscopie intrusion LDR|Kit courroie pompe eau|Joint culasse chemises","Courroie humide, pompe eau, joint culasse","P0300,P0301,P0217,P0016","TSB Ford EcoBoost","distribution,thermique,moteur"],
["F-FORD-EB-CHAIN","engine","ford","2.0 EcoBlue","tsb","critique",2017,2027,"2.0 EcoBlue — chaîne 240000 vers 160000 km","Claquement à froid, allongement chaîne, calage, casse moteur Panther.","Allongement chaîne tendeur|Bruit à froid côté distribution|Pression état huile dilution|Intervalle révisé 160000 km 8 ans|Kit chaîne tendeur guides","Kit chaîne, tendeur hydraulique, guides","P0016,P0017,P0521","TSB Ford EcoBlue révision intervalle","distribution,moteur"],
["F-FORD-EB-PUMP","engine","ford","2.0 EcoBlue","tsb","eleve",2017,2027,"2.0 EcoBlue — courroie de pompe à huile","Bruit courroie, pression huile basse, claquement, fumée, débris carter.","Courroie pompe et débris carter|Pression huile à chaud|Débits retour injecteurs|Courroie pompe selon TSB|Vidange rinçage","Courroie pompe huile, pompe, injecteurs","P0087,P0521,P0201","TSB Ford EcoBlue","moteur,injection,distribution"],
["F-KUGA-BAT","model","ford","kuga","rappel","critique",2020,2022,"Kuga PHEV — batterie HV et incendie en charge","Odeur chaud, fumée, non-démarrage, alerte batterie HV incendie.","Éligibilité VIN|Ne pas recharger avant intervention|Codes BMS isolement HV|Modules ou pack|Connecteur de charge","Pack HV, BMS, contacteurs","P0AA6,P0AFA,U0111","Rappel Ford Kuga PHEV Safety Gate","hv,charge"],
["F-FORD-PS","brand","ford","","tsb","eleve",2017,2023,"PowerShift — broutage embrayage sec","Vibrations démarrage, à-coups basse vitesse, patinage, DPS6.","Adaptations embrayage|Apprentissage mise à jour TCU|Kit sec fourchette|Remplacement si hors tolérance","Kit embrayage, fourchette, TCU","P0700,P1750","TSB Ford PowerShift NHTSA","transmission,acoups"],
["F-FORD-SYNC","brand","ford","","panne","moyen",2017,2027,"SYNC — écran figé et caméra absente","Écran noir, Bluetooth décroche, caméra recul absente, APIM SYNC3 SYNC4.","Version SYNC journaux|APIM alimentation|Mise à jour|Faisceau caméra|Remplacement APIM","APIM, dalle, faisceau caméra","U0101,U0121","Retour terrain Ford","tablette,telematique,camera"],
["F-TESLA-MCU","model","tesla","model3,modely,models,modelx","rappel","eleve",2017,2023,"MCU — usure mémoire eMMC","Écran tactile noir, lenteurs, perte caméra recul, Bluetooth, MCU1 MCU2.","Journaux redémarrage MCU|Santé eMMC mode service|Éligibilité campagne|Remplacement mise à niveau MCU","MCU, mémoire eMMC","U0101,U0121","Rappel Tesla MCU NHTSA","tablette,telematique,camera"],
["F-TESLA-PHANTOM","model","tesla","model3,modely,models,modelx","campagne","eleve",2021,2027,"Freinage fantôme Autopilot ACC","Freinages intempestifs sans obstacle, désengagements ACC, alertes collision FSD.","Version journaux|Propreté calibration caméras|Mise à jour logicielle|Recalibration après pare-brise","Caméras, calculateur ADAS","U0121,U0101,C1A00","Campagne Tesla NHTSA","adas,camera,freinage"],
["F-TESLA-SUSP","model","tesla","model3,modely","panne","moyen",2019,2024,"Bras suspension avant — rotules prématurées","Claquement avant sur bosses, usure irrégulière pneus, jeu volant.","Jeu rotules silentblocs|Bras supérieurs avant|Remplacement bras + géométrie|Couple fixations berceau","Bras avant, rotules, silentblocs","","Retour terrain Tesla NHTSA","train,geometrie,acoups"],
["F-TESLA-HEAT","model","tesla","model3,modely,models,modelx,cyber","tsb","moyen",2020,2027,"Octovalve pompe à chaleur — chauffage et autonomie","Chauffage absent, autonomie hivernale réduite, charge lente à froid.","Codes circuit thermique|Octovalve actionneurs|Charge fluide frigorigène|Mise à jour thermique","Octovalve, pompe chaleur, compresseur","P0C00,P0AA6","TSB Tesla thermal","thermique,autonomie,hv"],
["F-TESLA-DOOR","model","tesla","model3,modely,models,modelx,cyber","panne","moyen",2017,2027,"Poignées ouvrants — ouverture bloquée et 12 V","Porte ne s'ouvre plus, poignée ne sort pas, véhicule verrouillé 12V Li-ion.","Tension 12 V cause fréquente|Défauts modules porte|Actionneur poignée|Alimentation secours 12 V|Remplacement actionneur","Actionneur poignée, 12 V, module porte","B1000,P0562","Retour terrain Tesla","portes,cle,elec12"],
["F-VOLVO-BMS","model","volvo,polestar","ex30,ex40,ex90,es90,em90,ps2,ps3,ps4,ps5,ps6","rappel","eleve",2023,2027,"Logiciel BMS — surchauffe et charge bridée","Limitation puissance, alerte batterie, charge bridée, EX30 SPA2 SEA.","Éligibilité VIN|Températures delta cellules|Mise à jour BMS|Boucle refroidissement pompe","BMS, pompe LDR, modules, OBC","P0AA6,P0C00","Rappel Volvo EX30 Safety Gate","hv,thermique,charge"],
["F-JLR-AIR","brand","landrover,jaguar","","panne","eleve",2017,2027,"Suspension pneumatique — fuites et compresseur","Véhicule affaissé après stationnement, défaut suspension, hauteur incohérente.","Fuite coussins raccords produit moussant|Temps montée compresseur|Capteurs hauteur|Coussin compresseur|Calibration hauteurs","Coussins, compresseur, capteurs, bloc vannes","C1A00,U0121,C2200","Retour terrain JLR","train,geometrie"],
["F-JLR-ING-D","engine","landrover,jaguar","2.0 D200","campagne","eleve",2017,2024,"Ingenium diesel — chaîne et équilibrage","Claquement à froid, bruit côté boîte, voyant moteur, Ingenium chaîne.","Allongement chaîne|Tendeur guides|Consommation huile|Kit chaîne selon TSB","Kit chaîne, tendeur, guides, équilibrage","P0016,P0017","TSB JLR Ingenium","distribution,moteur"],
["F-JLR-ING-P","engine","landrover,jaguar","2.0 P250","panne","moyen",2017,2027,"Ingenium essence — chaîne, PCV et huile","Bruit chaîne à froid, niveau huile baisse, ratés, PT204.","Synchro AAC vilo|Tendeur guides|PCV séparateur huile|Consommation 1000 km","Kit chaîne, PCV, segments, bougies","P0016,P0300,P0521","Retour terrain JLR","distribution,moteur,allumage"],
["F-PORSCHE-800","model","porsche","taycan,macane","campagne","eleve",2019,2027,"Charge DC et thermique 800 V","Charge DC bridée, puissance limitée, alerte système électrique.","Historique thermique batterie|Boucle LDR échangeur|Mise à jour gestion charge|Isolement HV 800 V contacteurs","BMS, échangeur, OBC 800 V","P0C00,P0AA6","Campagne Porsche 800 V","charge,hv,thermique"],
["F-PDK","engine","porsche","3.0 Carrera","tsb","moyen",2019,2027,"PDK — à-coups et surchauffe mécatronique","À-coups basse vitesse, boîte chaude, passages hésitants, Doppelkupplung.","Adaptations embrayage|Niveau état huile PDK|Mise à jour TCU|Refroidissement boîte","Mécatronique PDK, huile, échangeur","P0700,P1750","TSB Porsche PDK","transmission,acoups,thermique"],
["F-MG-12V","model","mg","mg4,zsev,mg3,hs,cyberster,mg5,mgs5,marvelr,zs","campagne","eleve",2020,2027,"MG — décharge 12 V, DC-DC et écran figé","12 V à plat après 48 h, non démarrable, écrans figés iSMART.","Courant de repos|Sortie DC-DC|Mise à jour logicielle|12 V si SOH dégradé|Module télématique","DC-DC, batterie 12 V, télématique","U0111,P0562,U0101","Campagne MG","elec12,telematique,tablette"],
["F-BYD-CTB","model","byd,denza","seal,sealion7,atto3,dolphin,atto2,tang,han,dolphin-surf,d9,z9gt","tsb","moyen",2023,2027,"Blade LFP CTB — capteurs cellule et équilibrage","Delta cellules après charge rapide, charge plafonnée, SOC imprécis.","Delta cellules températures|Cycle lent équilibrage|Capteurs cellule|Mise à jour BMS|Revalider DC et SOC","BMS, capteurs cellule, modules Blade","P0AA6,P0AFA,P0C00","TSB BYD Blade","hv,charge,autonomie"],
["F-BYD-DMI","model","byd,denza","sealu,seal6,d9","tsb","moyen",2024,2027,"DM-i DM-o — pompe à huile moteur thermique","Voyant pression huile, claquement à chaud, mode dégradé hybride série.","Pression huile à chaud|Crépine pompe|Vidange remplacement pompe|Fonctionnement mode série","Pompe huile, crépine, moteur thermique","P0087,P0521","TSB BYD DM-i","moteur,injection"],
["F-MJT","engine","jeep,fiat,alfa","1.6 MultiJet","panne","eleve",2017,2022,"MultiJet — injecteurs et FAP","Claquement, fumée, ratés, régénérations fréquentes, JTDm MultiJet II.","Débits retour injecteurs|Banc injecteurs|ΔP FAP|Remplacement codage IMA","Injecteurs, FAP, pompe HP, rail","P0201,P0202,P2002","Retour terrain MultiJet","injection,depol"],
["F-500E-OBC","model","fiat,abarth","500e,600,600e","campagne","eleve",2020,2027,"500e 600e — chargeur embarqué AC","Non-charge AC, charge interrompue, voyant charge, OBC mode 2.","Codes OBC|Multi-bornes AC|Câble mode 2 CP PP|Remplacement OBC campagne","OBC, connecteur, faisceau HV","P0D11,P0C00","Campagne Stellantis 500e","charge,hv"],
["F-ALFA-ELEC","model","alfa","giulia,stelvio,tonale,junior,giulietta","tsb","moyen",2017,2027,"Électronique — 12 V, masses et défauts multiples","Défauts multiples tableau bord, démarrage aléatoire, direction intermittente.","SOH tension 12 V|Masses points corrosion|Défauts CAN|Mises à jour calculateurs","Batterie 12 V, masses, faisceau CAN, EPS","U0101,U0121,P0562,C1A00","TSB Alfa Romeo","elec12,geometrie,telematique"],
["F-CN-OTA","brand","xpeng,nio,zeekr,leapmotor,omoda,jaecoo,ora,lynk,chery,gwm,dongfeng,maxus,byd,mg,smart,forthing,hongqi,vinfast,denza,aion,geely,changan,deepal,exeed,jetour,tank,baic,jac,neta,liauto,voyah,avatr,aito,yangwang,onvo,firefly,galaxy,skyworth,fengon,bestune,farizon","","tsb","moyen",2022,2027,"OTA — mise à jour incomplète, ADAS et écran","Perte ADAS après OTA, écran figé, calibration caméra perdue, 12 V faible.","Version journaux OTA|Reflash calculateur|Recalibration caméras radar|12 V sensibilité coupures|Connexion télématique","Calculateur ADAS, 12 V, caméras, TCU","U0121,U0101,P0562,C1A00","TSB constructeurs CN","telematique,adas,camera,tablette,elec12"],
["F-CN-EREV","brand","liauto,aito,voyah,deepal,leapmotor,changan,ram,dongfeng","","tsb","moyen",2023,2027,"EREV prolongateur — démarrage, huile et refroidissement","Prolongateur ne démarre pas, voyant moteur, consommation élevée, range extender.","Codes prolongateur et génératrice|Huile niveau qualité malgré faible usage|Circuit refroidissement dédié|Cycle de maintenance forcé|Mise à jour gestion énergie","Prolongateur, génératrice, huile, LDR","P0087,P0521,P0A93","TSB EREV multi-constructeurs","moteur,thermique,hv,injection"],
["F-JEEP-WGS","model","jeep","wagoneer","panne","eleve",2024,2027,"Wagoneer S — décharge 12 V et OTA en échec","12 V faible, OTA interrompu, non démarrable, STLA Large.","Courant de repos|SOH 12 V DC-DC|Reflash OTA|Module télématique|Remplacement 12 V","12 V, DC-DC, TCU","P0562,U0101,U0111","Retour terrain Jeep","elec12,telematique"],
["F-ULTIUM","model","cadillac,gmc,acura,chevrolet","lyriq,zdx,escalade,hummer","tsb","moyen",2023,2027,"Ultium — module batterie et gestion thermique","Charge bridée, limitation puissance, alerte batterie, Ultium modules.","Codes modules et BMS|Delta cellules températures|Boucle LDR échangeur|Mise à jour logicielle|Remplacement module si écart","Modules Ultium, BMS, pompe LDR","P0AA6,P0AFA,P0C00","TSB GM Ultium","hv,charge,thermique"],
["F-EXOTIC-12V","brand","ferrari,lamborghini,mclaren,aston,bentley,rolls,maserati,bugatti,lotus,morgan,caterham","","panne","moyen",2017,2027,"Super-sportives — décharge 12 V et mainteneur","Batterie à plat après immobilisation, défauts multiples, mainteneur lithium.","Courant de repos télématique alarme|Mainteneur et batterie 12 V|Masses relais coupure|Recharge mainteneur constructeur|Effacement défauts","Batterie 12 V, mainteneur, télématique","P0562,U0101,B1000","Protocole atelier premium","elec12,telematique,cle"],
["F-EXOTIC-DCT","brand","ferrari,lamborghini,mclaren,aston,maserati,bugatti","","tsb","moyen",2017,2027,"DCT haute performance — usure et apprentissage","À-coups à froid, patinage usage sportif, compteurs usure, F1 LDF PDK.","Compteurs usure température|Huile échangeur|Apprentissage constructeur|Actionneurs accumulateur|Essai progressif","Embrayages, mécatronique, huile","P0700,P1750,P0218","Protocole atelier premium","transmission,acoups,thermique"],
["F-QUAD-CTRL","brand","aixam,ligier,fiat,citroen,micro","","panne","moyen",2017,2027,"Quadricycles — variateur, contrôleur et pack","Perte puissance, à-coups, refus de charge, variateur contrôleur L6e L7e.","Codes contrôleur|Variateur courroie thermique|Tension SOH pack|Contacteurs chargeur|Essai en charge","Contrôleur, variateur, pack, chargeur","P0AA6,P0C00,U0111","Protocole atelier quadricycle","hv,charge,transmission,elec12"],
["F-LCV-SCR","brand","peugeot,citroen,ds,opel,fiat,renault,nissan,ford,volkswagen,mercedes,toyota,iveco,man,isuzu,maxus,farizon","","campagne","eleve",2017,2027,"Utilitaires — SCR AdBlue, FAP et usage intensif","Compte à rebours AdBlue, régénérations incomplètes, mode dégradé LCV.","Compteurs SCR charge suie|Qualité AdBlue cristallisation|Cycles régénération usage réel|Régénération forcée essai chargé|Réinitialisation","Pompe AdBlue, injecteur, FAP, NOx","P20EE,P204F,P2002,P2463","Campagnes multi-constructeurs LCV","depol,injection,moteur"],
["F-NA-V8","brand","cadillac,gmc,chevrolet,dodge,ram,chrysler","","panne","moyen",2017,2027,"V8 américains — AFM DFM et poussoirs hydrauliques","Claquement à froid, ratés cylindre désactivé, consommation huile, AFM DFM.","Compteurs désactivation cylindres|Poussoirs AFM DFM et came|Consommation huile|Analyse huile limailles|Mise à jour calibration","Poussoirs, arbre à cames, segments","P0300,P0301,P0521","Retour terrain GM Stellantis US","moteur,allumage"],
["F-KGM-DPF","brand","kgm","","panne","moyen",2017,2027,"KGM SsangYong — FAP et vanne EGR diesel","Voyant moteur, perte puissance, régénérations fréquentes, e-XDi.","Charge suie ΔP|Vanne EGR refroidisseur|Injecteurs débits retour|Régénération forcée|Réinitialisation adaptations","FAP, EGR, injecteurs","P2002,P2463,P0401","Retour terrain KGM","depol,moteur,injection"],
["F-INFINITI-M274","engine","infiniti","2.0 Turbo","panne","eleve",2017,2022,"M274 — chaîne et turbo wastegate","Claquement à froid, perte puissance, voyant moteur, M274 turbo.","Synchro AAC vilo|Tendeur chaîne|Actionneur wastegate|Pression suralimentation","Kit chaîne, tendeur, turbo, wastegate","P0016,P0299,P0234","Retour terrain Infiniti","distribution,suralim,moteur"],
["F-TAKATA","brand","ALL","","rappel","critique",2017,2021,"Airbags Takata — générateur de gaz susceptible de rupture","Voyant airbag, campagne ouverte VIN, projection métallique, inflateur.","Éligibilité VIN Rappel Conso NHTSA|Pas de désactivation sans procédure|Inflateur référence campagne|Effacement défauts voyant","Inflateur airbag conducteur passager","","Rappel Takata Rappel Conso NHTSA","airbag,ceinture"],
["F-BELT","brand","ALL","","rappel","eleve",2017,2026,"Ceintures — prétensionneur ou ancrage non conforme","Voyant airbag, ceinture non verrouillée, campagne VIN, ancrage.","Éligibilité VIN|Ancrage couple serrage|Verrouillage enrouleur|Défauts prétensionneur|Remplacement ensemble","Prétensionneur, enrouleur, ancrage, boucle","B0072,B1000","Rappel Conso Safety Gate","ceinture,airbag,siege"],
["F-ADAS-CAL","brand","ALL","","tsb","moyen",2017,2027,"ADAS — recalibration caméra radar après intervention","Défaut calibration, freinage intempestif, régulateur inopérant après pare-brise.","Défauts calibration|Propreté fixation support|Calibration statique dynamique|Géométrie hauteur caisse","Caméra pare-brise, radar, support","U0121,U0101,C1A00","TSB multi-constructeurs ADAS","adas,camera,geometrie"],
["F-TPMS","brand","ALL","","panne","info",2017,2027,"TPMS — capteurs de pression et apprentissage","Voyant pression pneus, valeur absente, alerte après changement roues 433 MHz.","Identifiants capteurs batterie|Pression à froid|Apprentissage capteurs|Remplacement capteur","Capteurs TPMS, antenne, calculateur","C1365","Retour terrain multi-marques","train,geometrie,telematique"],
["F-EV-TRAP","brand","ALL","","campagne","eleve",2024,2027,"Trappe de charge — verrou, joints et infiltration","Verrou bloqué, eau dans trappe, charge refusée sécurité, CCS Type 2.","Verrou joints évacuations|Actuateur faisceau|Séchage test isolement|Campagne verrou joints|Revalider AC DC","Actuateur verrou, joints, connecteur","B1000,P0D11,P0AA6","Campagnes multi-constructeurs EV","charge,portes,carrosserie"],
["F-OTA-FAIL","brand","ALL","","tsb","moyen",2024,2027,"OTA — échec de mise à jour et retour atelier","Véhicule bloqué après OTA, fonctions perdues, écran figé, eSIM.","Version journaux OTA|12 V pendant mise à jour|Reflash procédure constructeur|Réinitialisation calculateurs|Essai complet","TCU, head unit, calculateurs, 12 V","U0101,U0121,P0562","TSB multi-constructeurs OTA","telematique,tablette,elec12"],
["F-EV-12V-LI","brand","ALL","","campagne","eleve",2023,2027,"Batterie 12 V lithium — décharge profonde","Non démarrable après immobilisation, 12 V Li-ion, veille DC-DC BMS.","Courant de repos après veille|SOH tension 12 V lithium|Stratégie recharge DC-DC|Campagne logicielle|Remplacement 12 V","Batterie 12 V Li-ion, DC-DC, BMS","P0562,U0111,P0A7F","Campagnes EV multi-constructeurs","elec12,hv,telematique"],
["F-EV-HEATPUMP","brand","ALL","","tsb","moyen",2020,2027,"Pompe à chaleur EV — perte d'efficacité hivernale","Chauffage faible, autonomie hivernale effondrée, charge DC lente à froid.","Codes circuit thermique|Charge fluide CO2 R1234yf|Compresseur vannes échangeur|Sondes pack préconditionnement|Mise à jour thermique","Pompe chaleur, compresseur, vannes","P0C00,P0AA6,P0A7A","TSB multi-constructeurs EV","thermique,hv,autonomie,charge"],
["F-BRAKE-CORR","brand","ALL","","panne","moyen",2017,2027,"Freinage — corrosion disques par faible sollicitation","Bruit frottement, disque voilé, freinage arrière faible, véhicule peu roulant.","Épaisseur voile au comparateur|Mobilité colonnettes pistons|État plaquettes décollées|Nettoyage graissage|Remplacement par essieu rodage","Disques, plaquettes, étriers, colonnettes","C1365","Protocole atelier freinage","freinage,train"],
["F-AC-COND","brand","ALL","","panne","info",2017,2027,"Climatisation — condenseur percé et compresseur grippé","Climatisation inefficace, bruit compresseur, odeur, fuite fluide.","Pression circuit et charge fluide|Étanchéité condenseur UV|Compresseur et embrayage|Filtre habitacle évaporateur|Recharge selon norme","Condenseur, compresseur, détendeur, fluide","P0530,P0532","Protocole atelier clim","thermique,carrosserie"],
["F-DPF-SENSOR","brand","ALL","","panne","moyen",2017,2027,"Capteur pression différentielle FAP — dérive","Régénérations anormales, P2463 sans colmatage réel, capteur ΔP.","ΔP mesuré vs capteur|Tuyaux prise fissure bouchon|Test capteur pression connue|Remplacement réinitialisation","Capteur ΔP, tuyaux, FAP","P2463,P2452,P2453","Protocole atelier diesel","depol"],
["F-START-STOP","brand","ALL","","panne","moyen",2017,2027,"Start and Stop — batterie AGM EFB et capteur IBS","Stop and start inopérant, voyant batterie, redémarrage brutal, IBS.","SOH batterie AGM EFB|Capteur IBS courant tension|Calibration après remplacement|Alternateur charge|Mise à jour calculateur","Batterie AGM EFB, IBS, alternateur","P0562,P0A7F","Protocole atelier 12 V","elec12,elec48,acoups"],
["F-WHEEL-BEAR","brand","ALL","","panne","moyen",2017,2027,"Roulements de roue — bruit et jeu","Ronflement croissant avec vitesse, bruit en virage, jeu roue, ABS erratique.","Écoute en appui délestage|Jeu au comparateur|Capteur ABS cible magnétique|Remplacement moyeu couple|Essai routier","Roulements, moyeux, capteurs ABS","C0035,C0040","Protocole atelier trains","train,abs,acoups"],
["F-STEER-RACK","brand","ALL","","panne","eleve",2017,2027,"Crémaillère de direction — jeu et bruit","Claquement colonne, jeu volant, direction imprécise, fuite assistance.","Jeu biellettes rotules|Fixations crémaillère berceau|Capteur angle couple|Fuite hydraulique ou EPS|Calibration après intervention","Crémaillère, biellettes, capteur angle","C1A00,C1B00","Protocole atelier direction","geometrie,train,adas"],
["F-HVAC-BLEND","brand","ALL","","panne","info",2017,2027,"Volets de mixage air — température incohérente","Air froid d'un côté chaud de l'autre, volet bloqué, actionneur HVAC.","Codes calculateurs clim|Actionneurs volets mixage|Calibration butées|Dépose tableau de bord si nécessaire|Test températures sorties","Actionneurs volets, calculateurs clim","B1000","Protocole atelier HVAC","thermique,tablette"],
["F-SUNROOF","brand","ALL","","panne","moyen",2017,2027,"Toit ouvrant — infiltration et rails bloqués","Eau dans habitacle, toit qui ne ferme plus, anti-pincement, coulissants.","Évacuations et joints|Rails graissage|Câbles et moteur|Apprentissage butées|Test étanchéité arrosage","Rails, câbles, joints, moteur toit","B1000","Protocole atelier carrosserie","carrosserie,portes,elec12"],
["F-CAM-BUEE","brand","ALL","","panne","info",2017,2027,"Caméra de recul — buée et perte de signal","Image trouble ou absente, buée boîtier, connecteur oxydé, hayon.","Étanchéité boîtier buée|Alimentation masse liaison vidéo|Nettoyage optique|Calibration après intervention|Remplacement caméra","Caméra, faisceau hayon, connecteur","U0121,B1000","Protocole atelier vision","camera,carrosserie,telematique"],
["F-KEY-INTERF","brand","ALL","","panne","moyen",2017,2027,"Antidémarrage — interférences et lecteur de secours","Clé non reconnue par intermittence, badge téléphone chargeur à proximité.","Pile clé et transpondeur|Antennes BF et lecteur secours|Interférences habitacle|12 V au démarrage|Reprogrammation constructeur","Clé, antennes BF, transpondeur, 12 V","B1000,U0100,P0562","Protocole atelier clé","cle,elec12"],
["F-TURBO-ACT","brand","ALL","","panne","eleve",2017,2027,"Actuateur de turbo électrique — position incohérente","P00AF, puissance limitée, sifflement, wastegate pilotée.","Position consigne réel actuateur|Alimentation masse|Course mécanique|Remplacement réapprentissage","Actuateur turbo, faisceau, turbo","P00AF,P0299","Protocole atelier suralimentation","suralim,elec12"],
["F-CLUTCH-DMF","brand","ALL","","panne","eleve",2017,2027,"Volant bi-masse — broutage et bruit de grelot","Vibrations démarrage, bruit grelot ralenti, à-coups, DMF bi-masse.","Essai à froid et à chaud|Jeu angulaire volant|Course commande embrayage|Usure disque mécanisme|Kit complet + volant","Kit embrayage, volant bi-masse, butée","P0700,P1750","Protocole atelier transmission","transmission,acoups"],
["F-ATF-LIFE","brand","ALL","","tsb","eleve",2017,2027,"Boîtes automatiques huile à vie — usure prématurée","À-coups, patinage, boîte chaude, ATF ZF Aisin DCT convertisseur.","Codes TCU adaptations température|Niveau ATF température normée|Analyse huile particules odeur|Mise à jour TCU apprentissage|Vidange intervalle révisé","ATF, mécatronique, convertisseur","P0700,P1750,P0218","TSB multi-constructeurs boîtes","transmission,acoups,thermique"],
["F-EPS-CAL","brand","ALL","","panne","eleve",2017,2027,"Direction assistée électrique — capteur de couple","Direction dure, assistance intermittente, volant qui tire, EPS colonne.","Défauts EPS capteur couple|Alimentation masses|Campagne recalibration|Calibration après intervention|Essai routier","EPS, capteur couple, crémaillère","C1A00,C1B00,U0121","Protocole atelier direction","geometrie,adas,elec12"],
["F-EPB-ACT","brand","ALL","","panne","eleve",2017,2027,"Frein de parking électrique — actuateurs et câbles","EPB ne serre ou ne libère pas, voyant rouge, frein parking.","Défauts EPB courant actuateurs|Câbles étriers arrière|Commande alimentation|Remplacement actuateur réinitialisation","Actuateurs EPB, câbles, étriers","C1365,C0561,P0562","Protocole atelier freinage","freinage,elec12"],
["F-ABS-SENSOR","brand","ALL","","panne","eleve",2017,2027,"ABS ESP — capteur de roue et couronne","Voyant ABS ESP, freinage bloquant une roue, régulateur inopérant.","Vitesses roue 4 canaux en roulage|Couronne cible entrefer|Faisceau coupure oxydation|Bloc hydraulique alimentation|Effacement essai","Capteurs ABS, couronnes, bloc hydraulique","C1365,C0035,C0040,U0121","Protocole atelier ABS","abs,freinage,train"],
["F-SRS-CONN","brand","ALL","","panne","critique",2017,2027,"SRS — connectique sous siège et prétensionneurs","Voyant airbag, occupancy erratique, ceinture non verrouillée.","Défauts SRS compteurs déploiement|Connecteurs jaunes sous siège|Résistance circuits procédure|Prétensionneurs ancrages|Effacement sans shunt","Connectique SRS, prétensionneurs, occupancy","B1000,B0072,B0081","Protocole atelier SRS","airbag,ceinture,siege"],
["F-SEAT-RAIL","brand","ALL","","panne","moyen",2017,2027,"Sièges — rails, moteurs et nappe de présence","Réglage inopérant, siège qui bouge, voyant airbag passager, chauffage HS.","Défauts module siège|Moteurs fins de course alimentation|Jeu rails serrage|Nappe présence chauffage|Calibration positions","Moteurs siège, rails, nappe, résistance","B1000,B0072","Protocole atelier sièges","siege,airbag"],
["F-SUSP-BUSH","brand","ALL","","panne","eleve",2017,2027,"Trains roulants — silentblocs et rotules","Claquement sur bosses, tenue route dégradée, usure pneus irrégulière.","Jeu rotules biellettes à la pince|Silentblocs triangles berceau|Amortisseurs rebond fuite|Roulements appui délestage|Remplacement par paire géométrie","Rotules, silentblocs, amortisseurs","","Protocole atelier trains","train,geometrie,acoups"],
["F-ALIGN","brand","ALL","","panne","moyen",2017,2027,"Géométrie — parallélisme, chasse et capteur angle","Usure anormale pneus, volant décentré, véhicule qui tire, ESP intempestif.","Pressions usure par plage|Parallélisme carrossage chasse|Hauteur caisse ressorts|Capteur angle volant calibration|Crémaillère colonne","Pneus, ressorts, crémaillère, capteur","C1A00,U0121","Protocole atelier géométrie","geometrie,train"],
["F-DOOR-LOCK","brand","ALL","","panne","moyen",2017,2027,"Ouvrants — serrures, actionneurs et hayon","Porte ne s'ouvre pas, hayon inopérant, porte coulissante bloquée.","Défauts modules porte hayon|Actionneurs micro-contacts|Alimentation masses 12 V|Rails anti-pincement|Déverrouillage secours","Serrures, actionneurs, modules, rails","B1000,U0100","Protocole atelier ouvrants","portes,cle"],
["F-12V-DRAIN","brand","ALL","","panne","eleve",2017,2027,"Batterie 12 V — courant de repos et masses","Non-démarrage après immobilisation, voyants multiples, écrans redémarrent.","Courant de repos après veille|SOH capacité tension|Alternateur DC-DC en charge|Consommateur parasite par fusibles|Masses corrosion","Batterie 12 V, alternateur, DC-DC, masses","P0562,U0111,U0101","Protocole atelier 12 V","elec12,telematique"],
["F-COOL-THERM","brand","ALL","","panne","eleve",2017,2027,"Refroidissement — thermostat, pompe à eau, ventilateur","Température instable, surchauffe en charge, chauffage habitacle faible.","Température LDR consigne thermostat|Pression circuit à froid|Pompe eau débit fuite courroie|Ventilateur résistance commande|Purge vase expansion","Thermostat, pompe eau, ventilateur","P0128,P0217,P0480,P00B7","Protocole atelier refroidissement","thermique,moteur"],
["F-HP-PUMP","brand","ALL","","panne","critique",2017,2027,"Pompe haute pression — pression rail insuffisante","Démarrage difficile, mode dégradé, à-coups en charge, calage HP.","Pression rail consigne réel|Alimentation BP filtre|Débits retour|Régulateur vanne dosage|Pompe HP rinçage limailles","Pompe HP, régulateur, vanne, rail","P0087,P0088,P0191,P025A","Protocole atelier injection","injection,moteur"],
["F-INJ-DIESEL","brand","ALL","","panne","eleve",2017,2027,"Injecteurs diesel — débits retour et codage","Claquement, fumée, ratés, démarrage difficile, common rail IMA IQA.","Corrections débit par cylindre|Débits retour à chaud démarrage|Banc injecteurs|Remplacement codage|Filtre qualité carburant","Injecteurs, joints embase, filtre, rail","P0201,P0202,P0203,P0204,P0087","Protocole atelier diesel","injection,moteur"],
["F-INJ-DI","brand","ALL","","panne","eleve",2017,2027,"Injection directe essence — calamine et injecteurs","Ratés à froid, ralenti instable, cliquetis LSPI, calamine DI.","Corrections compteurs ratés|Endoscopie soupapes admission|Étanchéité injecteurs DI|Décalaminage réapprentissage|Carburant huile anti-LSPI","Injecteurs DI, soupapes, PCV","P0300,P0301,P0171,P0201","Protocole atelier essence DI","injection,allumage,moteur"],
["F-IGN-COIL","brand","ALL","","panne","moyen",2017,2027,"Bougies bobines essence — ratés d'allumage","À-coups, voyant clignotant, perte puissance, surconsommation, misfire.","Compteurs ratés par cylindre|Permutation bobines bougies|Écartement aspect couple|Compressions si persistant|Intervalle bougies iridium","Bougies, bobines, faisceau","P0300,P0301,P0302,P0303","Protocole atelier allumage","allumage,moteur"],
["F-GLOW","brand","ALL","","panne","moyen",2017,2027,"Préchauffage diesel — bougies et boîtier","Démarrage difficile à froid, fumée blanche, voyant préchauffage, glow plug.","Résistance chaque bougie|Boîtier relais alimentation|12 V au démarrage|Défauts temps préchauffage|Remplacement jeu complet","Bougies préchauffage, boîtier, relais","P0380,P0671,P0672,P0673","Protocole atelier préchauffage","allumage,elec12"],
["F-OIL-CONS","brand","ALL","","panne","eleve",2017,2027,"Consommation huile — segmentation et PCV","Baisse niveau, fumée bleue, dépôt bougies, blow-by huile.","Consommation 1000 km|Séparateur huile dépressurisation carter|Endoscopie rayures glaçage|Compressions blow-by|Joints queues turbo","Segments, PCV, joints queues, turbo","P0300,P0521,P0171","Protocole atelier moteur","moteur,injection"],
["F-HEADGASKET","brand","ALL","","panne","critique",2017,2027,"Joint de culasse — intrusion liquide refroidissement","Surchauffe, LDR disparaît, fumée blanche persistante, mayonnaise glycol.","Pression circuit à froid|CO2 vase expansion|Endoscopie traces lavage|Plan joint serrage|Analyse huile glycol","Joint culasse, chemises, culasse","P0217,P0300,P0301","Protocole atelier moteur","moteur,thermique"],
["F-CHAIN-GEN","brand","ALL","","tsb","eleve",2017,2027,"Chaîne de distribution — allongement et tendeur","Claquement métallique à froid, corrélation vilo AAC, démarrage difficile.","Synchro oscilloscope|Décalage phase allongement|Tendeur patins guides|Pression huile tendeur|Kit complet recalage","Kit chaîne, tendeur, patins, guides","P0016,P0017,P0011,P0335","Protocole atelier distribution","distribution,moteur"],
["F-BELT-DRY","brand","ALL","","tsb","eleve",2017,2027,"Courroie de distribution sèche — double échéance","Bruit courroie, fissures, usure galets, risque rupture.","État tension alignement|Galets tendeur pompe eau|Fuite huile sur courroie|Respecter km ET années|Kit complet pompe eau","Kit courroie, galets, tendeur, pompe eau","P0016,P0017","Protocole atelier distribution","distribution,moteur"],
["F-HV-ISO","brand","ALL","","panne","critique",2017,2027,"Isolement haute tension — défaut et coupure sécurité","Alerte isolement, immobilisation, limitation puissance, refus charge HV.","Défaut valeur isolement|Mégohmmètre habilitation HV|Isoler branches clim chauffage OBC pack|Humidité connecteurs HV|Remplacement revalidation","Câblage HV, compresseur clim, chauffage HV","P0AA6,P0AFA,U0111","Protocole atelier HV","hv,charge,thermique"],
["F-HV-CELL","brand","ALL","","panne","eleve",2017,2027,"Batterie HV — SOH, delta cellules et équilibrage","Perte autonomie, charge plafonnée, limitation puissance, jauge incohérente.","SOH delta tension températures|Charge lente complète|Historique charges rapides|Mise à jour BMS réapprentissage SOC|Module si delta persiste","Modules, BMS, sondes, contacteurs","P0AA6,P0AFA,U0111","Protocole atelier batterie","hv,autonomie,charge"],
["F-CHARGE-AC","brand","ALL","","panne","eleve",2017,2027,"Charge AC — OBC, câble mode 2 et connecteur","Charge AC impossible ou interrompue, charge lente, odeur chaud Type 2.","Codes OBC|Multi-bornes autre câble|Résistances CP PP câble|Broches thermographie|Remplacement OBC connecteur","OBC, connecteur, câble mode 2","P0D11,P0C00,U0111","Protocole atelier charge","charge,hv"],
["F-CHARGE-DC","brand","ALL","","panne","moyen",2017,2027,"Charge DC — puissance bridée et préconditionnement","Charge rapide lente, arrêt de charge, puissance plafonnée à froid CCS.","Historique thermique température pack|Préconditionnement boucle LDR|Multi-bornes DC|Verrouillage connecteur contacteurs|Mise à jour gestion charge","BMS, boucle LDR, contacteurs DC","P0C00,P0AA6,P0D11","Protocole atelier charge DC","charge,hv,thermique"],
["F-V2L","brand","ALL","","tsb","info",2021,2027,"V2L V2G prise externe — protection et disponibilité","V2L indisponible, alerte surcharge, coupure en usage bidirectionnel.","État V2L protections|Prise câblage|SOC minimum autorisé|Mise à jour logicielle","Prise V2L, ICCU, protections","P1B77,P0D11","Protocole atelier V2L","charge,elec12"],
["F-RANGE","brand","ALL","","panne","moyen",2017,2027,"Autonomie consommation excessive — écart au réel","Autonomie réelle inférieure annonce, consommation en hausse WLTP.","Consommation mesurée trajet témoin|Pressions monte usure pneus|Freins traînants étriers grippés|Pompe chaleur préconditionnement|SOH température pack","Pneus, étriers, pompe chaleur, BMS","P0C00,P0AA6,C1365","Protocole atelier consommation","autonomie,thermique,train"],
["F-TEL-OTA","brand","ALL","","panne","moyen",2017,2027,"Télématique OTA — connexion, eSIM et services","Application déconnectée, services absents, OTA échoue, géolocalisation perdue.","Module télématique alimentation antenne eSIM|12 V coupures corrompent OTA|Journaux version|Relance reflash|Abonnement réseau","TCU, antenne, eSIM, 12 V","U0101,U0121,P0562","Protocole atelier télématique","telematique,tablette,elec12"],
["F-SCREEN-GEN","brand","ALL","","panne","moyen",2017,2027,"Écran tablette — tactile fantôme et délaminage","Touches fantômes, écran noir ou figé, bulles sous dalle, perte CarPlay.","Version journaux multimédia|Nappe vidéo alimentation masse|Dalle délaminage points pression|Mise à jour réinitialisation|Remplacement dalle","Dalle tactile, nappe LVDS, multimédia","U0101,U0121","Protocole atelier multimédia","tablette,telematique"],
["F-LIGHT-LED","brand","ALL","","panne","info",2017,2027,"Éclairage LED — condensation et modules puissance","Phare embué, LED partiellement éteinte, clignotement, matriciel.","Étanchéité évents projecteur|Connecteurs module LED|Alimentation masses 12 V|Défauts calculateur éclairage|Remplacement calibration","Projecteur, module LED, connectique","B1000,U0100","Protocole atelier éclairage","eclairage,elec12"],
["F-BODY-LEAK","brand","ALL","","panne","info",2017,2027,"Carrosserie étanchéité — infiltrations et corrosion","Humidité habitacle, buée persistante, corrosion hayon, connecteurs oxydés.","Localisation infiltration arrosage joints évents|Évacuations bas caisse toit ouvrant|Corrosion soudures|Connecteurs zone humide|Joints masses","Joints, évents, passe-câbles, connecteurs","B1000,U0101","Protocole atelier carrosserie","carrosserie,portes,elec12"]
];

/* ═══ PROTOCOLES CONDITIONNELS ═══ */
var rules=[
["DR-MOT1","moteur","panne","eleve","Consommation huile — segmentation PCV","Baisse niveau, fumée bleue, blow-by.","Consommation 1000 km|Séparateur huile carter|Endoscopie cylindres|Compressions blow-by","Segments, PCV, turbo","P0300,P0521,P0171","ice"],
["DR-MOT2","moteur,thermique","panne","critique","Joint de culasse — intrusion LDR","Surchauffe, LDR disparaît, fumée blanche.","Pression circuit à froid|CO2 vase expansion|Endoscopie|Plan joint serrage","Joint culasse, chemises","P0217,P0300,P0301","ice"],
["DR-CHAIN","distribution,moteur","tsb","eleve","Chaîne — allongement tendeur guides","Claquement à froid, corrélation vilo AAC.","Synchro oscilloscope|Décalage phase|Tendeur patins guides|Kit complet recalage","Kit chaîne, tendeur","P0016,P0017,P0335","chain"],
["DR-WET","distribution,moteur","rappel","critique","Courroie bain d'huile — colmatage crépine","Bruit courroie, débris huile, voyant pression.","Largeur au gabarit|Carter crépine|Pression huile à chaud|Kit pompe crépine vidange","Courroie humide, pompe, crépine","P0016,P0521,P0087","wet"],
["DR-DRY","distribution","tsb","eleve","Courroie sèche — km et années","Bruit, fissures, usure galets.","État tension alignement|Galets tendeur pompe eau|km ET années|Kit complet","Courroie, galets, pompe eau","P0016,P0017","dry"],
["DR-INJD","injection,moteur","panne","eleve","Injecteurs diesel — débits retour codage","Claquement, fumée, ratés, démarrage.","Corrections par cylindre|Débits retour|Banc injecteurs|Codage IMA IQA","Injecteurs, rail, filtre","P0201,P0202,P0087","diesel"],
["DR-INJE","injection,allumage","panne","eleve","Injection directe essence — calamine","Ratés à froid, cliquetis LSPI, calamine.","Compteurs ratés|Endoscopie soupapes|Étanchéité injecteurs|Décalaminage réapprentissage","Injecteurs DI, soupapes, PCV","P0300,P0301,P0171","petrol"],
["DR-HP","injection","panne","critique","Pompe HP — pression rail insuffisante","Démarrage difficile, mode dégradé, calage.","Pression rail consigne réel|Alimentation BP filtre|Débits retour|Pompe HP rinçage","Pompe HP, régulateur, rail","P0087,P0088,P0191","ice"],
["DR-ALLE","allumage","panne","moyen","Bougies bobines — ratés","À-coups, voyant clignotant, surconsommation.","Compteurs ratés|Permutation bobines bougies|Écartement couple|Compressions","Bougies, bobines, faisceau","P0300,P0301,P0302","petrol"],
["DR-ALLD","allumage,elec12","panne","moyen","Préchauffage diesel — bougies boîtier","Démarrage difficile à froid, fumée blanche.","Résistance bougies|Boîtier relais|12 V démarrage|Jeu complet","Bougies préchauffage, boîtier","P0380,P0671,P0672","diesel"],
["DR-TURBO","suralim,moteur","panne","eleve","Turbo — GAV wastegate fuites d'air","Sifflement, perte puissance, fumée.","Pression consigne réel|Actionneur GAV course|Fuite générateur fumée|Crépine huile turbo","Turbo, GAV, durites","P0299,P0234,P2263","turbo"],
["DR-TACT","suralim,elec12","panne","eleve","Actuateur turbo électrique","P00AF, puissance limitée, sifflement.","Position consigne réel|Alimentation masse|Course mécanique|Réapprentissage","Actuateur turbo, faisceau","P00AF,P0299","turbo"],
["DR-EGR","depol,moteur","panne","eleve","EGR refroidisseur — encrassement fuite","Perte puissance bas régime, fumée, LDR baisse.","Position EGR consigne réel|Circuit LDR pression|Encrassement|Nettoyage adaptations","Vanne EGR, refroidisseur","P0401,P0402,P0490","egr"],
["DR-FAP","depol","panne","eleve","FAP GPF — colmatage régénérations","Régénérations rapprochées, dilution huile.","Charge suie cendres ΔP|Nombre régénérations|Niveau odeur huile|Régénération forcée essai","FAP, capteur ΔP, sondes","P2002,P2463,P246C","dpf"],
["DR-DPFS","depol","panne","moyen","Capteur ΔP FAP — dérive","Régénérations anormales sans colmatage.","ΔP mesuré vs capteur|Tuyaux prise|Test pression connue|Remplacement","Capteur ΔP, tuyaux","P2463,P2452","diesel"],
["DR-SCR","depol","campagne","eleve","SCR AdBlue — pompe injecteur NOx","Compte à rebours, voyant AdBlue, NOx.","P20EE P204F compteurs|Débit pompe pression|Cristallisation|Réfractomètre réinitialisation","Pompe AdBlue, injecteur, NOx","P20EE,P204F,P2201","scr"],
["DR-AT","transmission,acoups","tsb","eleve","Boîte automatique — huile à vie","À-coups, patinage, boîte chaude.","Codes TCU adaptations|Niveau ATF normé|Analyse huile|Mise à jour apprentissage|Vidange révisée","ATF, mécatronique, convertisseur","P0700,P1750,P0218","ice"],
["DR-CLUTCH","transmission,acoups","panne","eleve","Embrayage volant bi-masse","Vibrations démarrage, grelot ralenti.","Essai froid chaud|Jeu angulaire volant|Course commande|Kit + volant","Embrayage, volant bi-masse","P0700,P1750","ice"],
["DR-DCTW","transmission,acoups","tsb","moyen","DCT e-DCS6 DSG — usure apprentissage","Compteurs usure élevés, à-coups à chaud.","Compteurs usure|Température adaptations|Apprentissage constructeur|Seuil remplacement","Embrayages DCT, mécatronique","P0700,P1750","dct"],
["DR-EVRED","transmission,acoups","tsb","moyen","Réducteur électrique — bruit jeu huile","Ronflement, claquement décélération.","Écoute montée décélération|Jeu supports|Niveau état huile|Mise à jour couple|Vidange révisée","Réducteur, huile, supports","P0A7A","ev"],
["DR-NVH","acoups,train","panne","moyen","Vibrations — moteur transmission roues","Vibrations volant siège, bruit sourd.","Qualifier régime vitesse charge|Supports moteur boîte|Équilibrage faux-rond|Cardans rotules","Supports, cardans, roues","","all"],
["DR-BRAKE1","freinage","panne","eleve","Freinage — disques plaquettes corrosion","Vibrations pédale, distance allongée.","Épaisseur voile comparateur|État montage plaquettes|Mobilité colonnettes|Liquide humidité|Rodage","Disques, plaquettes, étriers","C1365","all"],
["DR-BRAKE2","freinage,abs","panne","critique","Assistance freinage — servofrein","Pédale dure, assistance absente.","Défauts bloc assistance|Dépression alimentation|Capteur course pédale|12 V masses|Essai sécurisé","Servofrein, capteur pédale","C1365,P0562","all"],
["DR-EPB","freinage,elec12","panne","eleve","Frein parking électrique — actuateurs","EPB ne serre ou libère pas.","Défauts courant actuateurs|Câbles étriers AR|Commande alimentation|Réinitialisation","Actuateurs EPB, câbles","C1365,C0561","all"],
["DR-ABS","abs,freinage","panne","eleve","ABS ESP — capteur roue bloc","Voyant ABS ESP, roue bloquée.","Vitesses 4 canaux|Couronne entrefer|Faisceau oxydation|Bloc hydraulique|Essai","Capteurs ABS, bloc","C1365,C0035,C0040","all"],
["DR-AIRBAG","airbag,ceinture","panne","critique","SRS — connectique prétensionneurs","Voyant airbag, occupancy erratique.","Défauts SRS compteurs|Connecteurs jaunes|Résistance procédure|Prétensionneurs ancrages|Sans shunt","Connectique SRS, occupancy","B1000,B0072,B0081","all"],
["DR-SEAT","siege,airbag","panne","moyen","Sièges — rails moteurs nappe","Réglage inopérant, voyant passager.","Défauts module siège|Moteurs fins de course|Jeu rails serrage|Nappe chauffage|Calibration","Moteurs siège, rails, nappe","B1000,B0072","all"],
["DR-TRAIN","train,acoups","panne","eleve","Trains — rotules silentblocs amortisseurs","Claquement bosses, tenue route dégradée.","Jeu rotules pince|Silentblocs berceau|Amortisseurs rebond fuite|Roulements appui|Paire géométrie","Rotules, silentblocs, amortisseurs","","all"],
["DR-GEO","geometrie,train","panne","moyen","Géométrie — parallélisme chasse","Usure pneus, volant décentré.","Pressions usure|Parallélisme carrossage chasse|Hauteur caisse|Capteur angle calibration","Pneus, ressorts, capteur","C1A00,U0121","all"],
["DR-EPS","geometrie,adas","panne","eleve","Direction assistée électrique","Direction dure, assistance intermittente.","Défauts EPS capteur couple|Alimentation masses|Campagne recalibration|Essai routier","EPS, capteur couple","C1A00,C1B00","all"],
["DR-DOOR","portes,cle","panne","moyen","Ouvrants — serrures hayon","Porte ne s'ouvre pas, hayon inopérant.","Défauts modules|Actionneurs micro-contacts|Alimentation masses|Rails anti-pincement|Secours","Serrures, actionneurs, rails","B1000,U0100","all"],
["DR-KEY","cle,elec12","panne","eleve","Clé antidémarrage — non-reconnaissance","Clé non détectée, démarrage impossible.","Pile télécommande carte|12 V repos démarrage|Antennes BF lecteur secours|Interférences|Calculateur","Pile, antennes BF, transpondeur","B1000,U0100,P0562","all"],
["DR-12V","elec12,telematique","panne","eleve","Batterie 12 V — décharge masses","Non-démarrage après immobilisation.","Courant repos après veille|SOH capacité tension|Alternateur DC-DC|Parasite par fusibles|Masses","Batterie 12 V, DC-DC, masses","P0562,U0111,U0101","all"],
["DR-48V","elec48,acoups","campagne","eleve","Réseau 48 V — batterie DC-DC ISG","Stop start inopérant, à-coups.","Codes 48 V DC-DC|Tension SOH équilibrage|ISG courroie|DC-DC 48/12 masses|Mise à jour","Batterie 48 V, ISG, DC-DC","P0A7F,P0562,U0111","mhev"],
["DR-HVISO","hv","panne","critique","Isolement haute tension","Alerte isolement, immobilisation, refus charge.","Défaut valeur isolement|Mégohmmètre habilitation|Branches clim chauffage OBC pack|Humidité connecteurs|Revalidation","Câblage HV, clim, chauffage HV","P0AA6,P0AFA,U0111","hv"],
["DR-HVCELL","hv,autonomie","panne","eleve","Batterie HV — SOH delta cellules","Perte autonomie, charge plafonnée.","SOH delta températures|Charge lente complète|Historique DC|Mise à jour BMS SOC|Module si persiste","Modules, BMS, contacteurs","P0AA6,P0AFA,U0111","hv"],
["DR-AC","charge,hv","panne","eleve","Charge AC — OBC câble connecteur","Charge AC impossible ou interrompue.","Codes OBC|Multi-bornes câble|CP PP câble|Broches thermographie|OBC connecteur","OBC, connecteur, câble","P0D11,P0C00,U0111","plug"],
["DR-DC","charge,hv,thermique","panne","moyen","Charge DC — bridage préconditionnement","Charge rapide lente, arrêt à froid.","Historique thermique pack|Préconditionnement LDR|Multi-bornes DC|Verrouillage contacteurs|Mise à jour","BMS, LDR, contacteurs","P0C00,P0AA6,P0D11","plug"],
["DR-V2L","charge,elec12","tsb","info","V2L prise externe","V2L indisponible, surcharge.","État protections|Prise câblage|SOC minimum|Mise à jour","Prise V2L, ICCU","P1B77","ev"],
["DR-RANGE","autonomie,thermique","panne","moyen","Autonomie consommation — écart réel","Autonomie réelle inférieure annonce.","Consommation trajet témoin|Pressions monte usure|Freins traînants|Pompe chaleur|SOH température","Pneus, étriers, BMS","P0C00,P0AA6,C1365","all"],
["DR-THERM","thermique,moteur","panne","eleve","Refroidissement — thermostat pompe ventilateur","Température instable, surchauffe charge.","Température consigne thermostat|Pression à froid|Pompe eau courroie|Ventilateur commande|Purge vase","Thermostat, pompe eau, ventilateur","P0128,P0217,P0480","ice"],
["DR-THERMEV","thermique,hv,autonomie","panne","moyen","Pompe à chaleur EV — efficacité","Chauffage absent, autonomie hivernale effondrée.","Codes thermique|Charge fluide CO2 R1234yf|Compresseur vannes|Sondes pack|Mise à jour","Pompe chaleur, compresseur","P0C00,P0AA6,P0A7A","plug"],
["DR-CAM","camera,adas","panne","moyen","Caméras — buée signal calibration","Image trouble, caméra recul inopérante.","Étanchéité buée|Alimentation masse vidéo|Optique support|Calibration|Remplacement","Caméra, faisceau vidéo","U0121,U0101,B1000","all"],
["DR-ADAS","adas,camera,freinage","tsb","eleve","ADAS — radar calibration freinage","Freinages fantômes, régulateur désengagé.","Version journaux|Propreté fixation alignement|Carrosserie géométrie|Calibration statique dynamique|Cohérence","Radar, caméra, ADAS","U0121,U0101,C1A00","all"],
["DR-TEL","telematique,tablette,elec12","panne","moyen","Télématique OTA — eSIM services","Application déconnectée, OTA échoue.","Module alimentation antenne eSIM|12 V coupures|Journaux version|Reflash|Abonnement réseau","TCU, antenne, eSIM","U0101,U0121,P0562","all"],
["DR-SCREEN","tablette,telematique","panne","moyen","Écran — tactile fantôme délaminage","Touches fantômes, écran noir, bulles.","Version journaux|Nappe alimentation masse|Dalle délaminage|Mise à jour réinitialisation|Remplacement","Dalle tactile, nappe LVDS","U0101,U0121","all"],
["DR-WIRE","tablette,elec12","panne","info","Chargeur sans fil USB — surchauffe","Charge interrompue, téléphone chaud.","Module ventilation|Ports USB alimentation|Objet métallique|Remplacement module Qi","Module Qi, ports USB","U0101","all"],
["DR-LIGHT","eclairage,elec12","panne","info","Éclairage LED — condensation modules","Phare embué, LED partiellement éteinte.","Étanchéité évents|Connecteurs module LED|Alimentation masses|Défauts calculateur|Calibration matriciel","Projecteur, module LED","B1000,U0100","all"],
["DR-BODY","carrosserie,portes,elec12","panne","info","Carrosserie étanchéité — infiltrations","Humidité habitacle, buée, corrosion.","Localisation arrosage joints évents|Évacuations toit ouvrant|Corrosion soudures|Connecteurs humides|Masses","Joints, évents, connecteurs","B1000,U0101","all"],
["DR-HYBRID","hv,thermique,moteur","tsb","eleve","Système hybride — onduleur LDR 12 V","Voyant hybride, surchauffe onduleur.","Codes onduleur températures|Débit pompe LDR niveau|Isolement HV connecteurs|DC-DC 12 V READY|Filtre HV","Onduleur, pompe LDR, DC-DC","P0A93,P0A7A,P0AA6","hv"]
];

/* ═══ INTERVALLES RÉVISÉS ═══ */
var revs=[
["RV-FORD-EB-CHAIN","ford","2\\.0 EcoBlue|YLCB|BKF","Chaîne de distribution",240000,160000,120,96,"TSB Ford EcoBlue","Allongement chaîne et tendeur hydraulique : 160 000 km / 8 ans."],
["RV-FORD-EB-PUMP","ford","2\\.0 EcoBlue|YLCB|BKF","Courroie pompe à huile",240000,150000,120,96,"TSB Ford EcoBlue","Débris colmatant crépine : remplacement avec la chaîne."],
["RV-FORD-ECO-BELT","ford","1\\.0 EcoBoost|B3CA|B7JA|B3CB","Courroie distribution humide",240000,150000,120,72,"TSB Ford EcoBoost","Dégradation en bain d'huile : 150 000 km / 6 ans, contrôle annuel."],
["RV-PSA-BELT","peugeot,citroen,ds,opel,fiat,jeep,alfa,lancia,abarth","1\\.2 PureTech|EB2","Courroie distribution humide",180000,100000,120,72,"Campagne Stellantis Rappel Conso","Usure accélérée et colmatage crépine : 100 000 km / 6 ans."],
["RV-PSA-PUMP","peugeot,citroen,ds,opel,fiat,alfa,jeep,lancia","1\\.2 PureTech|EB2","Pompe huile + crépine",180000,100000,120,72,"Campagne Stellantis","Remplacement systématique avec le kit courroie."],
["RV-PSA-DV5","peugeot,citroen,ds,opel,toyota","1\\.5 BlueHDi|DV5|1\\.5 D-4D","Chaîne AAC 7 vers 8 mm",0,120000,0,96,"Campagne Stellantis DV5","Organe sans échéance : kit renforcé à 120 000 km."],
["RV-PSA-ATF","peugeot,citroen,ds,opel,toyota","EAT6|EAT8|EP6|DW10","Huile boîte EAT6 EAT8",0,100000,0,96,"TSB Stellantis Aisin","Fin huile à vie : 100 000 km / 8 ans."],
["RV-STA-48","peugeot,citroen,ds,opel,fiat,alfa,jeep,lancia,abarth","1\\.2 Hybrid|EB2LTEDH","Courroie accessoires galets",0,90000,0,72,"TSB Stellantis e-DCS6","Contrôle ajouté à 90 000 km / 6 ans."],
["RV-STA-EDCS6","peugeot,citroen,ds,opel,fiat,alfa,jeep,lancia,abarth","1\\.2 Hybrid|EB2LTEDH","Huile boîte e-DCS6",0,120000,0,96,"TSB Stellantis e-DCS6","Boîte sans entretien : vidange 120 000 km / 8 ans."],
["RV-RN-H5F","renault,dacia","1\\.2 TCe|H5F","Vidange huile filtre",30000,15000,24,12,"Campagne Renault H5Ft","Consommation huile et dilution : intervalle divisé par deux."],
["RV-RN-K9K","renault,dacia,nissan","1\\.5 (Blue )?dCi|K9K","Kit distribution pompe eau",160000,120000,72,60,"Révision Renault dCi","Ruptures constatées : 120 000 km / 5 ans."],
["RV-H5H","renault,dacia,nissan,mercedes","1\\.3 TCe|H5H|M282","Vidange huile filtre",30000,20000,24,12,"TSB Alliance H5H M282","DI et GPF : huile normée, intervalle réduit urbain."],
["RV-RN-EDC","renault,dacia,alpine","E-Tech|H4M|Multimode|EDC","Huile boîte EDC multimode",0,120000,0,96,"TSB Renault EDC","Vidange et contrôle usure embrayage."],
["RV-AMPR-BMS","renault,nissan,dacia,alpine","EV-R|6AK|5AM|EV-TWI|EV-A39|EV-LF","Mise à jour BMS + SOH",0,30000,0,24,"TSB AmpR","Mise à jour BMS et SOH tous 30 000 km / 2 ans."],
["RV-EA888","volkswagen,audi,skoda,seat,cupra,porsche","2\\.0 TSI|2\\.0 TFSI|EA888|CZP|DNN|DNF|DKN","Contrôle chaîne tendeur",0,120000,0,96,"TSB VAG EA888","Organe à vie : contrôle allongement 120 000 km."],
["RV-DSG-WET","volkswagen,audi,skoda,seat,cupra","DSG|DQ250|DQ381|DQ500|S-tronic|2\\.0 TDI|2\\.0 TSI","Huile filtre DSG",60000,60000,0,48,"TSB VAG DSG","Échéance calendaire : 60 000 km ou 4 ans."],
["RV-DQ200","volkswagen,audi,skoda,seat,cupra","1\\.0 TSI|1\\.5 TSI|DQ200|DKL|DPC","Huile mécatronique DQ200",0,120000,0,96,"TSB VAG DQ200","Sans entretien : vidange mécatronique 120 000 km."],
["RV-SCR-VAG","volkswagen,audi,skoda,seat,cupra","2\\.0 TDI|EA288|DSU|DTU|DFG","Filtre injecteur AdBlue",120000,60000,0,48,"Campagne VAG SCR","Cristallisation : remplacement anticipé."],
["RV-MEB-12LI","volkswagen,audi,skoda,seat,cupra,ford","APP310|APP550|MEB","Contrôle 12 V lithium",0,60000,0,48,"TSB VAG MEB+","SOH et connexions à 60 000 km / 4 ans."],
["RV-PPE-COOL","audi,porsche,polestar","PPE|J1","Liquide boucle 800 V",0,120000,0,96,"TSB PPE J1","Remplacement liquide 800 V : 120 000 km / 8 ans."],
["RV-B47","bmw,mini","B47|B37|2\\.0 .*d|1\\.5 .*d","Contrôle chaîne distribution",0,150000,0,120,"TSB BMW B47","Chaîne côté boîte : contrôle 150 000 km / 10 ans."],
["RV-BMW-PLUG","bmw,mini,toyota,morgan","B58|B48|S58|M340|M40|3\\.0|2\\.0 .*i|Supra","Bougies allumage",60000,40000,0,48,"TSB BMW M Performance","Usage sportif : bougies 40 000 km."],
["RV-ZF8","bmw,mini,landrover,jaguar,aston,ineos","B48|B58|B47|B57|ZF8|8HP","Huile boîte ZF 8HP",0,100000,0,96,"TSB ZF BMW","Fin huile à vie : 100 000 km / 8 ans."],
["RV-OM651","mercedes,infiniti","OM651|2\\.2 .*CDI","Contrôle chaîne patins",0,180000,0,120,"TSB Mercedes OM651","Usure patins : contrôle 180 000 km."],
["RV-9G","mercedes","9G|OM654|M254|M256","Huile boîte 9G-Tronic",0,100000,0,80,"TSB Mercedes 9G","ATF + filtre 100 000 km / 80 mois."],
["RV-MB48","mercedes","M254|M256|M264|48","Contrôle 48 V DC-DC",0,60000,0,48,"Campagne Mercedes 48 V","SOH équilibrage à 60 000 km."],
["RV-THETA","hyundai,kia,genesis","1\\.6 T-GDi|2\\.0 T-GDi|G4FJ|G4KH|G4FT|G4KL","Vidange huile filtre",15000,7500,12,6,"Campagne Hyundai Kia Theta","Usage sévère LSPI : divisé par deux, huile anti-LSPI."],
["RV-HK-DCT","hyundai,kia","DCT|G4LE|G4FT|1\\.6 .*Hybrid","Huile boîte DCT",0,90000,0,72,"TSB Hyundai Kia DCT","Sans entretien : 90 000 km / 6 ans."],
["RV-EGMP2","hyundai,kia,genesis","EM17|EM21|EM23|EM16","Contrôle ICCU V2L",0,60000,0,48,"Campagne E-GMP","ICCU et V2L ajoutés à 60 000 km / 4 ans."],
["RV-HSD-PUMP","toyota,lexus,suzuki","Hybrid|HSD|A25A|M20A|2ZR|PHEV|e:HEV|Swace|Across","Contrôle pompe eau onduleur",0,90000,0,120,"TSB Toyota HSD","Contrôle débit ajouté à 90 000 km."],
["RV-HVFILT","toyota,lexus,honda,suzuki","Hybrid|PHEV|HSD|e:HEV|e:PHEV","Nettoyage filtre batterie HV",0,30000,0,24,"TSB Toyota HSD","Encrassement filtre HV : 30 000 km / 2 ans."],
["RV-HON-15T","honda","1\\.5 VTEC Turbo|L15|1\\.0 VTEC","Vidange huile filtre",20000,10000,12,6,"TSB Honda dilution","Dilution en urbain froid : divisé par deux."],
["RV-MAZDA-D","mazda","Skyactiv-D|SH-VPTS|2\\.2","Vidange huile filtre",20000,10000,12,6,"Retour terrain Skyactiv-D","Dilution par régénérations FAP en urbain."],
["RV-MAZDA-X","mazda","Skyactiv-X|SPCCI","Bougies capteurs pression",60000,40000,0,48,"TSB Mazda Skyactiv-X","Allumage compression : bougies 40 000 km."],
["RV-SUZ-48","suzuki","Boosterjet Hybrid|K14|Dualjet|SHVS","Contrôle batterie lithium ISG",0,60000,0,48,"TSB Suzuki SHVS","SOH et courroie ISG à 60 000 km."],
["RV-VOLVO-DE","volvo","B4204|B3154|D4204|Drive-E","Kit distribution pompe eau",240000,160000,120,96,"Révision Volvo Drive-E","Ruptures constatées : 160 000 km / 8 ans."],
["RV-JLR-ING","landrover,jaguar","PT204|PT15|204DT|Ingenium|D200|P250","Contrôle chaîne distribution",0,150000,0,96,"TSB JLR Ingenium","Allongement : contrôle 150 000 km / 8 ans."],
["RV-JLR-AIR","landrover,jaguar","","Dessiccateur suspension pneumatique",0,120000,0,96,"Protocole atelier JLR","Remplacement dessiccateur compresseur."],
["RV-NIS-CVT","nissan","CVT|Xtronic|e-POWER|KR15","Huile CVT NS-3",60000,40000,0,48,"TSB Nissan Xtronic","Usage urbain charge : 40 000 km."],
["RV-MIT-PHEV","mitsubishi","PHEV|4B12","Contrôle pack HV onduleur",0,60000,0,48,"TSB Mitsubishi PHEV","SOH et boucle onduleur à 60 000 km."],
["RV-SUB-BOX","subaru","e-Boxer|FB20|FB25|Boxer","Vidange contrôle CVT",15000,10000,12,12,"Protocole atelier Subaru","Usage sévère AWD : intervalle réduit."],
["RV-PDK","porsche","PDK|Carrera|Turbo|9A2|CSZ","Huile boîte PDK",0,80000,0,72,"TSB Porsche PDK","PDK + filtre 80 000 km / 6 ans."],
["RV-EXOTIC","ferrari,lamborghini,mclaren,aston,maserati,bugatti,morgan,caterham","","Vidange huile contrôle DCT",20000,10000,12,12,"Protocole atelier super-sportives","Usage sportif : vidange annuelle, DCT haute température."],
["RV-PREMIUM","bentley,rolls,maserati,lotus","","Vidange filtres liquide frein",20000,10000,24,12,"Protocole atelier premium","Faible kilométrage : échéance calendaire dominante."],
["RV-EVRED","ALL","Électrique|EV|APP|PPE|EM1|EM2|GEN5|J1|3D|EVA|MMA|ZKX|STLA|1YM|BYD|MEB|NK|SEA|ULT","Huile de réducteur",0,120000,0,96,"TSB constructeurs EV","Réducteur à vie : vidange contrôle 120 000 km / 8 ans."],
["RV-EVCOOL","ALL","Électrique|EV|APP|PPE|EM1|EM2|GEN5|J1|3D|EVA|MMA|ZKX|STLA|1YM|BYD|MEB|NK|SEA|ULT","Liquide refroidissement pack HV",0,120000,0,96,"TSB constructeurs EV","Circuit HV sans entretien : 120 000 km / 8 ans."],
["RV-EV12","ALL","Électrique|EV|APP|PPE|EM1|EM2|GEN5|3D|EVA|MMA|ZKX|STLA|1YM|BYD|MEB|NK|SEA|ULT","Contrôle 12 V DC-DC",0,30000,0,24,"Campagne TSB EV","Décharge récurrente : SOH et DC-DC 30 000 km."],
["RV-EV-BRAKE","ALL","Électrique|EV|Hybrid|PHEV|e:HEV|HSD","Nettoyage graissage étriers",0,30000,0,24,"Protocole atelier EV hybride","Faible sollicitation : corrosion, graissage annuel."],
["RV-GDI","ALL","TSI|TFSI|T-GDi|EcoBoost|PureTech|TCe|VTEC|Skyactiv-G|TGDi|Turbo","Bougies allumage iridium",60000,40000,0,48,"TSB multi-constructeurs GDI turbo","DI turbo : bougies 40 000 km / 4 ans."],
["RV-DPF","ALL","BlueHDi|dCi|TDI|EcoBlue|CRDi|Skyactiv-D|DI-D|JTDm|MultiJet|D-4D|CDI|TDCi|Ddi|e-XDi","Nettoyage contrôle FAP",120000,90000,0,72,"Protocole atelier diesel","Urbain : nettoyage préventif 90 000 km."],
["RV-ADBLUE","ALL","BlueHDi|TDI|EcoBlue|CRDi|CDI|SCR|dCi|MultiJet|D-4D","Filtre injecteur AdBlue",120000,80000,0,60,"Campagnes SCR","Cristallisation : remplacement anticipé."],
["RV-BRAKE","ALL","","Liquide de frein DOT 4",60000,60000,24,24,"Protocole atelier norme constructeur","60 000 km OU 24 mois, humidité annuelle."],
["RV-CABIN","ALL","","Filtre habitacle charbon actif",30000,15000,24,12,"Protocole atelier qualité air","Urbain pollué : 15 000 km / 12 mois."],
["RV-ACC","ALL","","Courroie accessoires galets",120000,90000,120,72,"Protocole atelier","Rupture entraînant distribution : anticipé."],
["RV-AIR","ALL","","Filtre à air moteur",60000,40000,0,48,"Protocole atelier","Urbain poussiéreux : remplacement anticipé."],
["RV-COOL","ALL","","Liquide refroidissement moteur",120000,100000,120,60,"Protocole atelier norme constructeur","Long-life : 100 000 km / 5 ans, contrôle pH."],
["RV-4X4","ALL","4Motion|xDrive|4MATIC|quattro|AWD|4xe|ALL4|4Control|e-4ORCE|AllGrip","Huile ponts boîte transfert",0,90000,0,72,"Protocole atelier AWD","Transmission intégrale : 90 000 km."],
["RV-LCV","peugeot,citroen,ds,opel,fiat,renault,nissan,ford,volkswagen,mercedes,toyota,iveco,man,isuzu,maxus,farizon","","Vidange usage intensif filtre gasoil",40000,20000,24,12,"Protocole atelier utilitaires","Charge remorquage urbain : divisé par deux."],
["RV-EREV","liauto,aito,voyah,deepal,leapmotor,changan,ram,dongfeng","EREV|RE-ROT|Range extender","Vidange prolongateur malgré faible usage",0,15000,0,12,"Protocole atelier EREV","Prolongateur peu sollicité : vidange annuelle obligatoire."]
];

/* ═══ DTC ═══ */
var dtc={
P0011:["AAC A calage trop avancé","Chaîne allongée, déphaseur, pression huile","Calage, tendeur, VVT, pression"],
P0012:["AAC A calage trop retardé","Tendeur, déphaseur, pression basse","Calage et alimentation huile"],
P0016:["Corrélation vilo / AAC A rangée 1","Chaîne courroie décalée, tendeur usé","Oscilloscope synchro, kit distribution"],
P0017:["Corrélation vilo / AAC B rangée 1","Décalage distribution, capteur AAC B","Calage et capteurs"],
P0030:["Chauffage sonde O2 circuit","Résistance sonde, relais, faisceau","Résistance et alimentation"],
P0087:["Pression rail trop basse","Pompe HP, filtre, injecteurs, crépine","Pression consigne réel, débits retour"],
P0088:["Pression rail trop haute","Régulateur, vanne dosage, pompe HP","Régulateur et consigne rail"],
P0089:["Régulateur pression performance","Vanne dosage, capteur rail","Comparaison consigne réel"],
P00AF:["Commande turbo performance","Actionneur GAV, wastegate, faisceau","Course actionneur, alimentation"],
P00B7:["Débit LDR insuffisant","Pompe eau, thermostat, air circuit","Débit, purge, pompe"],
P0101:["Débitmètre MAF plage","MAF encrassé, fuite admission, PCV","MAF vs MAP, test fumée"],
P0106:["Capteur MAP plage","Capteur, fuite admission, faisceau","MAP vs barométrique"],
P0113:["Température admission signal haut","Sonde IAT, faisceau","Résistance vs température"],
P0128:["Température LDR sous seuil","Thermostat bloqué ouvert, sonde","Thermostat, montée température"],
P0135:["Sonde O2 amont chauffage","Résistance, relais, faisceau","Résistance chauffage"],
P0171:["Mélange trop pauvre rangée 1","Prise air, débitmètre, injecteurs, PCV","Test fumée, sonde O2"],
P0172:["Mélange trop riche rangée 1","Injecteur fuite, pression haute, sonde","Injecteurs, pression rail"],
P0191:["Capteur pression rail performance","Capteur rail, faisceau","Capteur vs manomètre"],
P0201:["Circuit injecteur cylindre 1","Injecteur, faisceau, calculateur","Résistance, débit retour"],
P0202:["Circuit injecteur cylindre 2","Injecteur, faisceau, calculateur","Résistance, débit retour"],
P0203:["Circuit injecteur cylindre 3","Injecteur, faisceau, calculateur","Résistance, débit retour"],
P0204:["Circuit injecteur cylindre 4","Injecteur, faisceau, calculateur","Résistance, débit retour"],
P0217:["Surchauffe moteur","Pompe eau, thermostat, fuite, joint culasse","Pression circuit, pompe, ventilateur"],
P0218:["Huile boîte surchauffe","Niveau ATF, échangeur, usage intensif","Niveau, échangeur, adaptations"],
P0230:["Circuit primaire pompe carburant","Relais, alimentation, pompe BP","Relais, tension, masse"],
P0234:["Suralimentation excessive","Wastegate grippée, GAV, capteur","Actionneur turbo, MAP"],
P025A:["Commande module pompe carburant","Calculateur pompe, faisceau","Commande et alimentation"],
P0299:["Suralimentation insuffisante","Fuite durite, GAV, échangeur, EGR","Test fumée, GAV, consigne"],
P0300:["Ratés allumage multiples","Bougies, bobines, injecteurs, compression","Compteurs ratés, permutation"],
P0301:["Ratés cylindre 1","Bougie, bobine, injecteur, compression","Permutation, compression"],
P0302:["Ratés cylindre 2","Bougie, bobine, injecteur, compression","Permutation, compression"],
P0303:["Ratés cylindre 3","Bougie, bobine, injecteur, compression","Permutation, compression"],
P0304:["Ratés cylindre 4","Bougie, bobine, injecteur, compression","Permutation, compression"],
P0335:["Capteur position vilebrequin","Capteur CKP, cible, faisceau","Signal CKP oscilloscope"],
P0340:["Capteur position AAC circuit","Capteur CMP, faisceau, calage","Signal CMP, alimentation"],
P0341:["Capteur AAC performance","Capteur CMP, chaîne allongée","Synchro vilo AAC"],
P0380:["Circuit bougies préchauffage","Relais boîtier, bougies, faisceau","Résistance et commande"],
P0401:["EGR débit insuffisant","Vanne encrassée, refroidisseur, ΔP","Position consigne réel, nettoyage"],
P0402:["EGR débit excessif","Vanne bloquée ouverte, capteur","Étanchéité vanne fermée"],
P040B:["Capteur température EGR","Sonde EGR, faisceau","Températures, résistance"],
P0420:["Rendement catalyseur sous seuil","Catalyseur vieilli, sonde aval, fuite","Sondes, contre-pression"],
P0471:["Capteur pression échappement plage","Capteur, tuyau bouché","Pression vs consigne"],
P0480:["Commande ventilateur","Relais, résistance, moteur","Commande et alimentation"],
P0490:["Commande EGR signal haut","Faisceau, vanne, calculateur","Alimentation commande"],
P0500:["Capteur vitesse véhicule","Capteur, faisceau, ABS","Vitesses de roue"],
P0521:["Capteur pression huile performance","Niveau qualité huile, crépine, pompe","Pression manométrique à chaud"],
P0524:["Pression huile trop basse","Niveau, pompe, crépine, coussinets","Pression manométrique, endoscopie"],
P0530:["Capteur pression clim","Capteur, charge fluide, faisceau","Pression circuit clim"],
P0532:["Pression clim signal bas","Fuite fluide, capteur","Charge et étanchéité"],
P0562:["Tension système basse","Batterie 12 V, alternateur DC-DC, masses","Charge et courant repos"],
P0563:["Tension système haute","Régulateur alternateur, DC-DC","Tension en charge"],
P0606:["Calculateur erreur interne","Calculateur, alimentation, mémoire","Alimentations, reprogrammation"],
P0627:["Commande pompe carburant ouvert","Relais, faisceau, pompe BP","Continuité et commande"],
P0671:["Bougie préchauffage cylindre 1","Bougie, boîtier, faisceau","Résistance bougie 1"],
P0672:["Bougie préchauffage cylindre 2","Bougie, boîtier, faisceau","Résistance bougie 2"],
P0673:["Bougie préchauffage cylindre 3","Bougie, boîtier, faisceau","Résistance bougie 3"],
P0674:["Bougie préchauffage cylindre 4","Bougie, boîtier, faisceau","Résistance bougie 4"],
P0700:["Commande boîte défaut signalé","TCU mécatronique","Codes TCU détaillés"],
P0715:["Capteur régime entrée boîte","Capteur, faisceau, huile","Signal capteur, niveau ATF"],
P0730:["Rapport transmission incorrect","Embrayage, mécatronique, huile","Adaptations, pression hydraulique"],
P0741:["Convertisseur patinage excessif","Convertisseur, huile, lock-up","Température et adaptations"],
P0A7A:["Batterie onduleur performance","Modules, BMS, refroidissement","SOH, delta cellules, températures"],
P0A7F:["Batterie hybride 48 V dégradation","Vieillissement modules, déséquilibre","Capacité et delta cellules"],
P0A80:["Remplacer pack batterie hybride","Modules dégradés, SOH bas","Capacité, delta, historique"],
P0A93:["Refroidissement onduleur","Pompe eau électrique, LDR, échangeur","Débit pompe, niveau LDR"],
P0AA6:["Isolement haute tension défaut","Câblage HV, clim, batterie, chauffage","Mégohmmètre par branche"],
P0AFA:["Batterie HV déséquilibre cellules","Module dégradé, BMS","Delta cellules, équilibrage"],
P0B3D:["Capteur tension cellule plage","Capteur, faisceau interne, module","Comparaison tensions cellules"],
P0C00:["Refroidissement batterie traction","Pompe LDR, échangeur, vanne, logiciel","Débit, températures, mise à jour"],
P0C73:["Refroidissement moteur électrique","Pompe, échangeur, LDR","Débit et température onduleur"],
P0D11:["Chargeur embarqué performance","OBC, connecteur, câble, borne","Test AC multi-bornes"],
P0D5A:["Charge DC communication borne","Contacteurs, PLC, verrou","Test DC multi-bornes"],
P0DAE:["Verrou connecteur de charge","Actuateur, capteur, faisceau","Verrouillage et micro-contact"],
P1101:["Débit air incohérence","Fuite admission, MAF, PCV","Test fumée, MAF MAP"],
P1750:["Boîte défaut mécanique hydraulique","Mécatronique, huile, embrayage","Adaptations, niveau, codes TCU"],
P189C:["Pression hydraulique boîte insuffisante","Pompe, accumulateur, fuite interne","Pression et niveau ATF"],
P1B77:["ICCU charge défaut interne","ICCU, DC-DC, fusible HV","Codes ICCU, 12 V, fusible"],
P1E00:["Système hybride défaut général","Onduleur, pack, DC-DC","Sous-codes et températures"],
P2002:["FAP efficacité sous seuil","FAP colmaté, capteur ΔP, régénérations","Charge suie, ΔP, régénération"],
P204F:["SCR performance rangée 1","Pompe injecteur AdBlue, qualité","Débit pompe, cristallisation"],
P207F:["Qualité réactif SCR insuffisante","AdBlue contaminé dilué","Réfractomètre, vidange réservoir"],
P208E:["Injecteur AdBlue bloqué","Cristallisation, injecteur","Débit et nettoyage"],
P20E8:["Pression AdBlue trop basse","Pompe, fuite, filtre","Pression et débit"],
P2200:["Capteur NOx amont circuit","Capteur, module, faisceau","Valeurs et alimentation"],
P2201:["Capteur NOx circuit plage","Capteur NOx, faisceau, module","Comparaison amont aval"],
P2263:["Turbo performance","GAV grippée, fuite, capteur","Actionneur et étanchéité"],
P226D:["FAP absent modifié","FAP supprimé, logiciel","Contrôle physique et logiciel"],
P229F:["Capteur NOx 2 performance","Capteur aval, faisceau","Valeurs et alimentation"],
P242F:["FAP restriction cendres","Accumulation cendres","Charge cendres, remplacement"],
P2452:["Capteur ΔP FAP circuit","Capteur, tuyaux, faisceau","Pression vs manomètre"],
P2453:["Capteur ΔP FAP plage","Capteur dérivé, tuyaux bouchés","Test pression connue"],
P2463:["FAP accumulation suie","Trajets courts, régénérations interrompues","Régénération forcée, dilution"],
P246C:["FAP restriction excessive","FAP colmaté irréversible","Remplacement, réinitialisation"],
P2BAE:["NOx dépassement","SCR, EGR, injecteurs","Compteurs SCR, test NOx"],
U0001:["Bus CAN haut défaut","Faisceau CAN, terminaison, calculateur","Oscilloscope CAN, résistances"],
U0100:["Perte communication ECM PCM","Faisceau CAN, alimentation, calculateur","CAN, masses, alimentations"],
U0101:["Perte communication moteur TCU","Faisceau CAN, alimentations","CAN, masses, alimentations"],
U0110:["Perte communication moteur électrique","Faisceau, onduleur, alimentation","CAN et alimentations onduleur"],
U0111:["Perte communication batterie énergie","Faisceau, BMS, DC-DC, 12 V","Réseau, tension 12 V"],
U0121:["Perte communication ABS ADAS","Faisceau CAN, capteurs, calculateur","CAN et calibration ADAS"],
U0140:["Perte communication BCM BSI","Faisceau, alimentation, masses","CAN, masses, alimentations"],
U0155:["Perte communication combiné","Faisceau CAN, combiné","CAN et alimentation combiné"],
U0293:["Perte communication hybride EV","Faisceau, calculateur HV","CAN, alimentation, isolement"],
U110B:["Perte communication chargeur","OBC, faisceau, alimentation","CAN OBC et alimentation"],
B0001:["Circuit airbag conducteur","Inflateur, connectique, SRS","Résistance circuit procédure"],
B0072:["Circuit prétensionneur ceinture","Prétensionneur, connectique, SRS","Résistance circuit procédure"],
B0081:["Capteur présence passager","Nappe occupancy, connectique sous siège","Nappe et connecteur"],
B1000:["Défaut module électronique bord","Module, alimentation, faisceau","Défauts module, alimentation"],
B1318:["Tension batterie basse module","12 V, masses, alternateur","Charge et courant repos"],
C0035:["Capteur vitesse roue AV gauche","Capteur ABS, couronne, faisceau","Vitesses roue, cible"],
C0040:["Capteur vitesse roue AV droite","Capteur ABS, couronne, faisceau","Vitesses roue, cible"],
C0045:["Capteur vitesse roue AR gauche","Capteur ABS, couronne, faisceau","Vitesses roue, cible"],
C0050:["Capteur vitesse roue AR droite","Capteur ABS, couronne, faisceau","Vitesses roue, cible"],
C0561:["Frein parking défaut système","Actuateur, câbles, alimentation","Actuateurs et commande"],
C1095:["Pompe ABS défaut moteur","Pompe, relais, bloc hydraulique","Commande et alimentation"],
C1201:["ESP défaut système","Capteurs, bloc, calibration","Sous-codes, calibration"],
C1365:["Freinage assistance régénératif","Servofrein, capteur pédale, logiciel","Assistance, calibration"],
C1A00:["ADAS suspension calibration requise","Caméra radar non calibré, capteurs hauteur","Calibration constructeur"],
C1B00:["Capteur angle volant calibration","Capteur, colonne, alimentation","Calibration capteur angle"],
C2200:["Suspension pneumatique pression","Compresseur, coussins, fuites","Fuite et temps de montée"]
};

/* ═══ EXPANSION + FUSION + PRÉSERVATION DES AJOUTS UTILISATEUR ═══ */
var DBK="kf.db.v16", SIGK="kf.base.sig";
function ex(t){return String(t).replace(/@([a-zA-Z0-9]+)/g,function(m,k){return P[k]||m})}
function estr(m){return (m.engines||[]).map(function(e){
return e.fam+"|"+e.hp+(e.fuel==="EV"&&e.disp?":"+e.disp:"")+"|"+e.code+"|"+e.fuel+"|"+String(e.y0).slice(2)+"-"+String(e.y1).slice(2)+"|"+(e.tech||"")}).join(";")}
function carry(){
try{
var raw=localStorage.getItem(DBK);if(!raw)return;
var db=JSON.parse(raw);if(!db||db.v!==16||!db.cat)return;
var nm=0;Object.keys(RAW).forEach(function(b){nm+=String(RAW[b][2]).split("\n").filter(function(l){return l.trim()}).length});
var sig=nm+"|"+faults.length+"|"+revs.length+"|"+Object.keys(dtc).length;
if(localStorage.getItem(SIGK)===sig)return;
(db.faults||[]).forEach(function(f){if(/^(USR|IMP|AD|SRC)-/.test(f.id||""))
faults.push([f.id,f.scope,(f.brands||[]).join(","),f.target,f.kind,f.sev,f.y0,f.y1,f.titre,f.sym,(f.pro||[]).join("|"),f.org,(f.dtc||[]).join(","),f.src,(f.dom||[]).join(",")])});
(db.revs||[]).forEach(function(r){revs.push([r.id,(r.brands||[]).join(","),r.match,r.organ,r.oldKm,r.newKm,r.oldMo,r.newMo,r.src,r.note])});
(db.cat||[]).forEach(function(b){
var tb=RAW[b.id];
if(!tb){RAW[b.id]=[b.name,b.country||"—",(b.models||[]).map(function(m){
return m.id+"~"+m.name+"~"+String(m.y0).slice(2)+"~"+String(m.y1).slice(2)+"~S~"+estr(m)}).join("\n")];return}
var lines=String(tb[2]).split("\n").filter(function(l){return l.trim()});
var idx={};lines.forEach(function(l,i){idx[l.split("~")[0]]=i});
(b.models||[]).forEach(function(m){
if(idx[m.id]==null){lines.push(m.id+"~"+m.name+"~"+String(m.y0).slice(2)+"~"+String(m.y1).slice(2)+"~S~"+estr(m));return}
var have={};lines[idx[m.id]].split("~")[5].split(";").forEach(function(t){var p=t.split("|");have[p[0]+"|"+p[1]+"|"+p[2]]=1});
var add=[];(m.engines||[]).forEach(function(e){
var k=e.fam+"|"+e.hp+"|"+e.code;
if(!have[k])add.push(e.fam+"#"+e.hp+(e.fuel==="EV"&&e.disp?":"+e.disp:"")+"#"+e.code+"#"+e.fuel+"#"+String(e.y0).slice(2)+"-"+String(e.y1).slice(2)+"#"+(e.tech||""))});
if(add.length)lines[idx[m.id]]+=";"+add.join(";")});
tb[2]=lines.join("\n")});
localStorage.removeItem(DBK);localStorage.setItem(SIGK,sig);
}catch(e){}}
carry();

var cat=Object.keys(RAW).map(function(bid){
var b=RAW[bid];
var models=String(b[2]).split("\n").map(function(l){return l.trim()}).filter(Boolean).map(function(line){
var p=line.split("~");
var y0=2000+parseInt(p[2],10),y1=2000+parseInt(p[3],10);
var engs=ex(p[5]||"").split(";").filter(Boolean).map(function(t){
var e=t.split("#");
return e[0]+"|"+(e[1]||"0")+"|"+(e[2]||"—")+"|"+(e[3]||"E")+"|"+(e[4]||(p[2]+"-"+p[3]))+"|"+(e[5]||"")}).join(";");
return [p[0],p[1],y0,y1,SEG[p[4]]||"Véhicule",engs]});
return [bid,b[0],b[1],models]});

return {fuel:fuel,sev:sev,kind:kind,dom:dom,eng:eng,eva:eva,tq:tq,
cat:cat,faults:faults,rules:rules,revs:revs,dtc:dtc};
})();
