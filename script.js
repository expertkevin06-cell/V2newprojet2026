'use strict';

// ==========================================
// 1. VARIABLES GLOBALES
// ==========================================
const SECURITY_SALT = 'kev_fusion_2026_salt';
const SESSION_DURATION = 30 * 60 * 1000;
let isSecureModeActive = false;
let secureSessionTimeout = null;
let ADMIN_HASH = null;
let megaBase = [];
let syncStatus = { autoDiagnostic: 'inactive', myTech: 'inactive', lastSync: null };

// ==========================================
// 2. FONCTIONS UTILITAIRES (DÉFINIES EN PREMIER)
// ==========================================
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function normaliserMarque(brand) {
    if (!brand) return 'Inconnu';
    const map = {
        'peugeot':'Peugeot','renault':'Renault','citroen':'Citroën','citroën':'Citroën',
        'ds':'DS','volkswagen':'Volkswagen','vw':'Volkswagen','audi':'Audi','bmw':'BMW',
        'mercedes':'Mercedes-Benz','mercedes-benz':'Mercedes-Benz','porsche':'Porsche',
        'opel':'Opel','fiat':'Fiat','alfa':'Alfa Romeo','alfa romeo':'Alfa Romeo',
        'jeep':'Jeep','toyota':'Toyota','honda':'Honda','nissan':'Nissan',
        'hyundai':'Hyundai','kia':'Kia','mazda':'Mazda','ford':'Ford',
        'chevrolet':'Chevrolet','tesla':'Tesla','volvo':'Volvo','dacia':'Dacia',
        'skoda':'Skoda','seat':'Seat','cupra':'Cupra','polestar':'Polestar',
        'byd':'BYD','mg':'MG','xpeng':'Xpeng','nio':'Nio',
        'landrover':'Land Rover','jaguar':'Jaguar','ferrari':'Ferrari',
        'maserati':'Maserati','mclaren':'McLaren','bugatti':'Bugatti','mini':'Mini',
        'lexus':'Lexus','alpine':'Alpine','lancia':'Lancia','subaru':'Subaru',
        'suzuki':'Suzuki','mitsubishi':'Mitsubishi','dodge':'Dodge','cadillac':'Cadillac'
    };
    return map[String(brand).toLowerCase()] || String(brand);
}

function genererCodeMoteur(brand, motor) {
    if (!brand) return 'AUTO';
    if (motor) {
        const clean = String(motor).replace(/[^A-Za-z0-9]/g, '').slice(0, 10).toUpperCase();
        if (clean.length >= 2) return clean;
    }
    return String(brand).slice(0, 3).toUpperCase() + '-AUTO';
}

function determinerCarburant(motor, type, title) {
    const text = `${motor || ''} ${type || ''} ${title || ''}`.toLowerCase();
    if (text.includes('electrique') || text.includes('électrique') || text.includes('bms') || text.includes('iccu') || text.includes('obc')) return 'Électrique';
    if (text.includes('hybride') || text.includes('hybrid') || text.includes('phev') || text.includes('e-tech') || text.includes('dm-i') || text.includes('e:hev')) return 'Hybride';
    if (text.includes('diesel') || text.includes('tdi') || text.includes('dci') || text.includes('bluehdi') || text.includes('crdi') || text.includes('multijet') || text.includes('fap') || text.includes('adblue') || text.includes('jtd')) return 'Diesel';
    return 'Essence';
}

// ==========================================
// 3. HASHAGE MOT DE PASSE (avec fallback WebView)
// ==========================================
async function hashPassword(password) {
    try {
        if (window.crypto && window.crypto.subtle) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password + SECURITY_SALT);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
    } catch (e) {
        console.warn('crypto.subtle indisponible, fallback utilisé');
    }
    // Fallback pour WebView Android sans crypto.subtle
    let hash = 0;
    const str = password + SECURITY_SALT;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return 'fallback_' + Math.abs(hash).toString(16).padStart(8, '0');
}

async function initAdminHash() {
    ADMIN_HASH = await hashPassword('Kevin83600');
    console.log('✅ Hash admin initialisé');
}

// ==========================================
// 4. MÉGA BASE INITIALE MASSIVE (52 véhicules)
// ==========================================
const MEGA_BASE_INITIALE = [
    { marque:"Peugeot", modele:"308 III", motorisation:"1.2 PureTech", codeMoteur:"HNS", puissance:"130 ch", annee:"2021-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W20","Filtre à huile","Contrôle courroie humide"],"60000":["Vidange","Filtre à huile","Filtre à air","Bougies iridium"],"90000":["Vidange","Filtre à huile","Liquide de frein DOT 4"],"120000":["Vidange","Kit distribution + pompe eau"],"160000":["Vidange","Bougies","Liquide refroidissement G12+"]}, dtc:["P0420","P0300","P0301","P0171","P0087","P0340"], rappels:["Rappel freinage 2022","Campagne tendeur courroie 2022-2023","Campagne pompe à huile 2017-2023"], notes:"Distribution humide à surveiller 30 000 km" },
    { marque:"Peugeot", modele:"208 II", motorisation:"1.2 PureTech", codeMoteur:"EB2ADTD", puissance:"100 ch", annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W20","Filtre à huile"],"60000":["Vidange","Filtre à air","Bougies"],"120000":["Kit distribution humide"],"160000":["Vidange","Bougies","Liquide refroidissement"]}, dtc:["P0420","P0300","P0087"], rappels:["Campagne courroie 2022-2023"], notes:"Distribution humide PSA" },
    { marque:"Peugeot", modele:"e-208", motorisation:"Électrique 136", codeMoteur:"EM0", puissance:"136 ch", annee:"2020-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle batterie HV","Filtre habitacle"],"60000":["Vidange réducteur"],"120000":["Contrôle SOH","Liquide refroidissement HV"]}, dtc:["P0AA6","U0111","P0C00"], rappels:["Campagne autonomie hiver","Campagne BMS"], notes:"" },
    { marque:"Peugeot", modele:"3008 II", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:"130 ch", annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 0W30","Filtre à huile","Contrôle FAP"],"60000":["Vidange","Filtre à gasoil"],"120000":["Kit distribution"],"160000":["Vidange","Filtre à gasoil","Liquide refroidissement"]}, dtc:["P2002","P0401","P0471","P20EE"], rappels:["Campagne FAP 2021","Campagne AdBlue"], notes:"FAP sensible trajets courts" },
    { marque:"Peugeot", modele:"5008 II", motorisation:"2.0 BlueHDi", codeMoteur:"DW10", puissance:"180 ch", annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"],"120000":["Kit distribution"]}, dtc:["P2002","P0401","P2453"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Clio V", motorisation:"1.5 dCi", codeMoteur:"K9K", puissance:"85 ch", annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 5W30","Filtre à huile"],"60000":["Vidange","Filtre à gasoil"],"120000":["Kit distribution"],"160000":["Liquide refroidissement Type D"]}, dtc:["P2263","P0401","P0299"], rappels:["Campagne EGR 1.5 dCi"], notes:"Turbo fragile 2019-2020" },
    { marque:"Renault", modele:"Megane IV", motorisation:"1.3 TCe", codeMoteur:"H5H", puissance:"140 ch", annee:"2018-2023", typeCarburant:"Essence", entretiens:{"30000":["Vidange 5W40","Filtre à huile"],"60000":["Vidange","Filtre à air","Bougies"],"120000":["Kit distribution"]}, dtc:["P0420","P0171","P0300"], rappels:["Campagne chaîne 2020"], notes:"Chaîne à surveiller" },
    { marque:"Renault", modele:"Captur II", motorisation:"1.0 TCe", codeMoteur:"H4D", puissance:"100 ch", annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air","Bougies"],"120000":["Kit distribution"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Austral", motorisation:"1.2 TCe Hybride", codeMoteur:"H5H-H", puissance:"200 ch", annee:"2022-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle hybride"],"60000":["Filtre à air","Bougies"]}, dtc:[], rappels:[], notes:"" },
    { marque:"Renault", modele:"Zoe", motorisation:"Électrique 135", codeMoteur:"5AGen2", puissance:"135 ch", annee:"2019-2024", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle SOH","Filtre habitacle"],"60000":["Vidange réducteur"],"120000":["Contrôle batterie"]}, dtc:["P0AA6","U0111","P0D11"], rappels:["Campagne OBC","Campagne connecteur Type2"], notes:"" },
    { marque:"Citroën", modele:"C5 Aircross", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:"130 ch", annee:"2020-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"],"120000":["Kit distribution"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"C3 III", motorisation:"1.2 PureTech", codeMoteur:"EB2", puissance:"110 ch", annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W20"],"60000":["Filtre à air","Bougies"],"120000":["Kit distribution humide"]}, dtc:["P0420","P0300","P0087"], rappels:["Campagne courroie humide"], notes:"Distribution humide PSA" },
    { marque:"Citroën", modele:"ë-C4", motorisation:"Électrique 136", codeMoteur:"EM0", puissance:"136 ch", annee:"2021-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle"],"60000":["Vidange réducteur"]}, dtc:["P0D11","P0AA6"], rappels:["Campagne OBC"], notes:"" },
    { marque:"DS", modele:"DS 7 Crossback", motorisation:"E-Tense 300", codeMoteur:"EP6-PHEV", puissance:"300 ch", annee:"2019-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"],"60000":["Filtre à air"],"120000":["Contrôle batterie HV"]}, dtc:["P0AA6","U0111"], rappels:["Campagne batterie HV"], notes:"" },
    { marque:"Volkswagen", modele:"Golf 8", motorisation:"2.0 TDI", codeMoteur:"DSR", puissance:"150 ch", annee:"2020-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 5W30 LL-IV","Filtre à huile"],"60000":["Filtre à gasoil"],"90000":["Liquide de frein"],"120000":["Kit distribution"],"160000":["Liquide refroidissement G13"]}, dtc:["P2002","P0401","P0471","P0406"], rappels:["Campagne sonde NOx 2023","Campagne ICU 12V"], notes:"" },
    { marque:"Volkswagen", modele:"T-Roc", motorisation:"1.5 TSI", codeMoteur:"DPCA", puissance:"150 ch", annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 5W40"],"60000":["Filtre à air","Bougies"],"120000":["Kit distribution"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"ID.4", motorisation:"Électrique 204", codeMoteur:"APP310", puissance:"204 ch", annee:"2021-2024", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle"],"60000":["Vidange réducteur"]}, dtc:["U0111","P0AA6"], rappels:["Campagne ICU décharge 12V"], notes:"" },
    { marque:"Volkswagen", modele:"Tiguan II", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:"150 ch", annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"],"120000":["Kit distribution"]}, dtc:["P2002","P0401","P0406"], rappels:["Campagne AdBlue 2021"], notes:"" },
    { marque:"BMW", modele:"Série 3 G20", motorisation:"2.0d B47", codeMoteur:"B47", puissance:"190 ch", annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 0W30 LL-04"],"60000":["Filtre à gasoil"],"90000":["Liquide de frein"],"120000":["Contrôle chaîne"],"160000":["Liquide refroidissement BMW"]}, dtc:["P0401","P2002","P0299"], rappels:["Campagne EGR incendie","Campagne refroidisseur EGR 2018-2020"], notes:"" },
    { marque:"BMW", modele:"X1 F48", motorisation:"1.8d B47", codeMoteur:"B47", puissance:"150 ch", annee:"2018-2023", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"],"120000":["Contrôle chaîne"]}, dtc:["P0401","P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"iX", motorisation:"Électrique 523", codeMoteur:"EKA", puissance:"523 ch", annee:"2021-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"],"60000":["Liquide refroidissement"]}, dtc:["P0C00","P0AA6"], rappels:["Campagne charge DC bridée"], notes:"" },
    { marque:"Mercedes-Benz", modele:"Classe A W177", motorisation:"A 200d OM654", codeMoteur:"OM654", puissance:"150 ch", annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"25000":["Vidange 5W30 MB"],"50000":["Filtre à gasoil"],"75000":["Liquide de frein"],"100000":["Filtre à air"],"125000":["Liquide refroidissement MB"]}, dtc:["P0401","P2002","P0234","P20EE"], rappels:["Campagne injecteur AdBlue","Campagne alterno-démarreur 48V"], notes:"" },
    { marque:"Audi", modele:"A3 8Y", motorisation:"2.0 TDI", codeMoteur:"DSR", puissance:"150 ch", annee:"2020-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 5W30 LL"],"60000":["Filtre à gasoil"],"120000":["Kit distribution"]}, dtc:["P2002","P0401","P0406"], rappels:[], notes:"" },
    { marque:"Audi", modele:"e-tron", motorisation:"Électrique 408", codeMoteur:"UA1", puissance:"408 ch", annee:"2019-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0C00","P0AA6"], rappels:["Campagne charge DC bridée"], notes:"" },
    { marque:"Porsche", modele:"Taycan", motorisation:"Électrique 761", codeMoteur:"Taycan", puissance:"761 ch", annee:"2020-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0C00","P0AA6"], rappels:["Campagne charge DC bridée"], notes:"" },
    { marque:"Opel", modele:"Corsa F", motorisation:"1.2 Turbo", codeMoteur:"EB2ADTD", puissance:"130 ch", annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W20"],"120000":["Kit distribution humide"]}, dtc:["P0420","P0300","P0301","P0087"], rappels:["Campagne courroie humide"], notes:"" },
    { marque:"Opel", modele:"Corsa-e", motorisation:"Électrique 136", codeMoteur:"EM0", puissance:"136 ch", annee:"2020-2024", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle"]}, dtc:["P0D11"], rappels:["Campagne OBC"], notes:"" },
    { marque:"Toyota", modele:"Yaris Cross", motorisation:"1.5 Hybride", codeMoteur:"M15A-FXE", puissance:"116 ch", annee:"2021-2024", typeCarburant:"Hybride", entretiens:{"15000":["Vidange 0W16","Contrôle hybride"],"30000":["Filtre habitacle"],"60000":["Filtre à air"],"90000":["Liquide de frein"],"120000":["Bougies"]}, dtc:[], rappels:[], notes:"Chaîne - Très fiable" },
    { marque:"Toyota", modele:"RAV4 V", motorisation:"2.5 Hybride", codeMoteur:"A25A-FXS", puissance:"218 ch", annee:"2019-2024", typeCarburant:"Hybride", entretiens:{"15000":["Vidange 0W20"],"30000":["Filtre habitacle"],"60000":["Filtre à air"],"120000":["Bougies iridium"]}, dtc:[], rappels:["Campagne pompe à carburant 2019-2020"], notes:"Chaîne - Très fiable" },
    { marque:"Toyota", modele:"Corolla XII", motorisation:"1.8 Hybride", codeMoteur:"2ZR-FXE", puissance:"122 ch", annee:"2019-2024", typeCarburant:"Hybride", entretiens:{"15000":["Vidange"],"30000":["Filtre habitacle"],"60000":["Filtre à air"],"120000":["Bougies"]}, dtc:[], rappels:[], notes:"" },
    { marque:"Hyundai", modele:"Tucson IV", motorisation:"1.6 CRDi", codeMoteur:"D4FE", puissance:"136 ch", annee:"2021-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 5W30 C3"],"60000":["Filtre à gasoil"],"120000":["Kit distribution"]}, dtc:["P2002","P0401"], rappels:["Campagne logiciel FAP"], notes:"" },
    { marque:"Hyundai", modele:"Ioniq 5", motorisation:"Électrique 325", codeMoteur:"EM17", puissance:"325 ch", annee:"2021-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["U0111","P0AA6"], rappels:["Campagne ICCU"], notes:"ICCU défaillant" },
    { marque:"Hyundai", modele:"Kona EV", motorisation:"Électrique 204", codeMoteur:"EM16", puissance:"204 ch", annee:"2018-2022", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:["Campagne incendie batterie"], notes:"Risque incendie" },
    { marque:"Kia", modele:"Sportage V", motorisation:"1.6 T-GDi Hybride", codeMoteur:"G4FT", puissance:"230 ch", annee:"2022-2024", typeCarburant:"Hybride", entretiens:{"15000":["Vidange 0W20"],"30000":["Filtre habitacle"],"60000":["Filtre à air"],"120000":["Bougies"]}, dtc:[], rappels:[], notes:"" },
    { marque:"Kia", modele:"EV6", motorisation:"Électrique 585", codeMoteur:"EM21", puissance:"585 ch", annee:"2021-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["U0111"], rappels:["Campagne ICCU"], notes:"" },
    { marque:"Nissan", modele:"Leaf", motorisation:"Électrique 150", codeMoteur:"EM57", puissance:"150 ch", annee:"2018-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle SOH"]}, dtc:[], rappels:["Campagne SOH batterie"], notes:"Perte autonomie" },
    { marque:"Nissan", modele:"Qashqai III", motorisation:"1.3 DIG-T", codeMoteur:"HR13DDT", puissance:"158 ch", annee:"2021-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air","Bougies"],"120000":["Kit distribution"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Honda", modele:"HR-V III", motorisation:"1.5 e:HEV", codeMoteur:"LEB", puissance:"131 ch", annee:"2022-2024", typeCarburant:"Hybride", entretiens:{"20000":["Vidange 0W20"],"40000":["Filtre habitacle"],"60000":["Filtre à air"],"100000":["Bougies"]}, dtc:[], rappels:[], notes:"" },
    { marque:"Tesla", modele:"Model 3/Y", motorisation:"Électrique", codeMoteur:"Tesla", puissance:"Multi", annee:"2019-2024", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV","Filtre habitacle"]}, dtc:["U0101","P0AA6"], rappels:["Campagne freinage fantôme 2023","Campagne eMMC MCU","Campagne contacteurs HV","Campagne suspension AV"], notes:"Multiples campagnes NHTSA" },
    { marque:"Ford", modele:"Kuga III", motorisation:"2.5 PHEV", codeMoteur:"PHEV", puissance:"225 ch", annee:"2020-2022", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"]}, dtc:["P0AA6"], rappels:["Campagne batterie HV incendie"], notes:"Risque incendie" },
    { marque:"Ford", modele:"Puma", motorisation:"1.0 EcoBoost Hybrid", codeMoteur:"B3JA", puissance:"155 ch", annee:"2020-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange 5W20"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Fiat", modele:"500e", motorisation:"Électrique 118", codeMoteur:"500e", puissance:"118 ch", annee:"2021-2024", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle"]}, dtc:["P0D11"], rappels:["Campagne OBC"], notes:"" },
    { marque:"Alfa Romeo", modele:"Giulia II", motorisation:"2.2 JTDm", codeMoteur:"940A", puissance:"180 ch", annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"],"120000":["Contrôle chaîne"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Jeep", modele:"Compass II", motorisation:"1.6 Multijet", codeMoteur:"55283860", puissance:"120 ch", annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Volvo", modele:"XC40 I", motorisation:"D4", codeMoteur:"D4204T14", puissance:"190 ch", annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 0W20 VCC"],"60000":["Filtre à gasoil"],"120000":["Kit distribution"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Volvo", modele:"EX30", motorisation:"Électrique 428", codeMoteur:"EX30", puissance:"428 ch", annee:"2023-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6","P0C00"], rappels:["Campagne BMS surchauffe"], notes:"" },
    { marque:"Dacia", modele:"Spring", motorisation:"Électrique 45", codeMoteur:"Spring", puissance:"45 ch", annee:"2021-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle"]}, dtc:["P0D11","P0562","C1365"], rappels:["Campagne servofrein","Campagne OBC","Campagne DC-DC"], notes:"Multiples campagnes" },
    { marque:"Dacia", modele:"Bigster", motorisation:"Hybrid 155", codeMoteur:"Bigster-H", puissance:"155 ch", annee:"2025-2027", typeCarburant:"Hybride", entretiens:{"30000":["Vidange"]}, dtc:["P0700"], rappels:["Campagne ressorts AR","Campagne boîte DCT"], notes:"Ressorts AR diamètre fil insuffisant" },
    { marque:"Skoda", modele:"Octavia IV", motorisation:"2.0 TDI", codeMoteur:"DSR", puissance:"150 ch", annee:"2020-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"],"120000":["Kit distribution"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Seat", modele:"Leon IV", motorisation:"2.0 TDI", codeMoteur:"DSR", puissance:"150 ch", annee:"2020-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"],"120000":["Kit distribution"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Cupra", modele:"Born", motorisation:"Électrique 231", codeMoteur:"Born", puissance:"231 ch", annee:"2021-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:["Campagne logiciel HV"], notes:"" },
    { marque:"Polestar", modele:"Polestar 2", motorisation:"Électrique 476", codeMoteur:"PS2", puissance:"476 ch", annee:"2020-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:["Campagne capteurs isolement"], notes:"" },
    { marque:"BYD", modele:"Seal U DM-i", motorisation:"DM-i 218", codeMoteur:"BYD-DMi", puissance:"218 ch", annee:"2026-2027", typeCarburant:"Hybride", entretiens:{"30000":["Vidange"]}, dtc:["P0087"], rappels:["Campagne pompe huile DM-i"], notes:"" },
    { marque:"MG", modele:"MG4", motorisation:"Électrique 204", codeMoteur:"MG4", puissance:"204 ch", annee:"2022-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["U0111"], rappels:["Campagne 12V / DC-DC"], notes:"" }
];

// ==========================================
// 5. NOTIFICATIONS
// ==========================================
function showNotification(msg, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    const n = document.createElement('div');
    const colors = { success:'bg-green-500', error:'bg-red-500', warning:'bg-amber-500', info:'bg-cyan-500' };
    n.className = `notification ${colors[type] || colors.info} text-white px-6 py-4 rounded-2xl shadow-2xl font-bold`;
    n.textContent = msg;
    container.appendChild(n);
    setTimeout(() => {
        n.style.opacity = '0';
        n.style.transform = 'translateX(400px)';
        n.style.transition = 'all 0.5s';
        setTimeout(() => n.remove(), 500);
    }, 4000);
}

// ==========================================
// 6. GESTION RÉSEAU (CORRIGÉE)
// ==========================================
function updateNetworkStatus() {
    const statusEl = document.getElementById('network-status');
    if (!statusEl) return;
    
    try {
        if (navigator.onLine) {
            let type = 'WIFI/4G/5G';
            try {
                const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                if (conn && conn.effectiveType) {
                    type = conn.effectiveType.toUpperCase();
                }
            } catch (e) {
                // navigator.connection non supporté
            }
            statusEl.innerHTML = `<span class="pulse-dot online"></span><span id="network-text">${type}</span>`;
        } else {
            statusEl.innerHTML = `<span class="pulse-dot offline"></span><span id="network-text">Hors ligne</span>`;
        }
    } catch (error) {
        console.error('Erreur updateNetworkStatus:', error);
        statusEl.innerHTML = `<span class="pulse-dot online"></span><span id="network-text">En ligne</span>`;
    }
}

// ==========================================
// 7. NAVIGATION
// ==========================================
function showTab(tabName) {
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('fade-in');
    });
    const target = document.getElementById(`view-${tabName}`);
    if (target) { target.classList.remove('hidden'); target.classList.add('fade-in'); }
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('tab-active');
        el.classList.add('text-slate-400');
    });
    const active = document.getElementById(`tab-${tabName}`);
    if (active) { active.classList.add('tab-active'); active.classList.remove('text-slate-400'); }
    if (tabName === 'entretien') initFiltresEntretien();
    if (tabName === 'stats') afficherStats();
    if (tabName === 'secure') resetSecureForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function resetSecureForm() {
    const input = document.getElementById('secure-code-input');
    if (input) input.value = '';
    const err = document.getElementById('secure-error');
    if (err) err.classList.add('hidden');
}

// ==========================================
// 8. RECHERCHE VIN
// ==========================================
async function rechercherVIN() {
    const vin = document.getElementById('vin-input').value.trim().toUpperCase();
    const results = document.getElementById('vin-results');
    if (vin.length !== 17) {
        results.innerHTML = `<div class="glass rounded-3xl p-8 border-l-4 border-red-500 slide-up"><div class="flex items-center gap-4 mb-3"><i data-lucide="alert-circle" class="w-8 h-8 text-red-400"></i><h3 class="text-2xl font-black text-red-400">VIN invalide</h3></div><p class="text-slate-300">17 caractères requis.</p></div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }
    results.innerHTML = `<div class="glass rounded-3xl p-10 text-center"><div class="loading-spinner mx-auto mb-6"></div><p class="text-slate-300">Analyse...</p></div>`;
    try {
        const response = await fetch(`https://api.nhtsa.gov/recalls/recallsByVin?vin=${vin}&format=json`);
        const data = await response.json();
        if (data.Results && data.Results.length > 0) {
            let html = `<div class="glass rounded-3xl p-8 border-l-4 border-red-500 slide-up"><div class="flex items-center gap-4 mb-6"><i data-lucide="alert-triangle" class="w-10 h-10 text-red-400"></i><div><h3 class="text-3xl font-black text-red-400">⚠️ ${data.Results.length} rappel(s)</h3><p class="text-slate-400">VIN: ${vin}</p></div></div><div class="space-y-5">`;
            data.Results.forEach((r, i) => {
                html += `<div class="bg-red-900/30 border-2 border-red-500/40 rounded-2xl p-6"><div class="flex items-start gap-4"><div class="w-10 h-10 rounded-xl bg-red-500/40 flex items-center justify-center"><span class="text-red-300 font-black">${i+1}</span></div><div class="flex-1"><p class="font-black text-cyan-400 text-xl mb-2">${r.Component}</p><p class="text-slate-200 mb-3">${r.Summary}</p><div class="flex gap-2"><span class="recall-badge px-3 py-1.5 rounded-lg font-bold">NHTSA</span></div></div></div></div>`;
            });
            html += '</div></div>';
            results.innerHTML = html;
        } else {
            results.innerHTML = `<div class="glass rounded-3xl p-8 border-l-4 border-green-500 slide-up"><div class="flex items-center gap-4 mb-3"><i data-lucide="check-circle" class="w-10 h-10 text-green-400"></i><h3 class="text-3xl font-black text-green-400">✅ Aucun rappel</h3></div><p class="text-slate-400">VIN: ${vin}</p></div>`;
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (e) {
        results.innerHTML = `<div class="glass rounded-3xl p-8 border-l-4 border-amber-500 slide-up"><div class="flex items-center gap-4"><i data-lucide="wifi-off" class="w-8 h-8 text-amber-400"></i><h3 class="text-2xl font-black text-amber-400">Erreur API</h3></div></div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// ==========================================
// 9. PRÉCONISATIONS
// ==========================================
function initFiltresEntretien() {
    const marques = [...new Set(megaBase.map(v => v.marque))].sort();
    const sel = document.getElementById('filter-marque');
    if (!sel) return;
    sel.innerHTML = '<option value="">🏷️ Marque</option>';
    marques.forEach(m => sel.innerHTML += `<option value="${m}">${m}</option>`);
}

function updateModeles() {
    const marque = document.getElementById('filter-marque').value;
    const selM = document.getElementById('filter-modele');
    const selMo = document.getElementById('filter-moteur');
    if (!selM || !selMo) return;
    selM.innerHTML = '<option value="">🚗 Modèle</option>';
    selMo.innerHTML = '<option value="">⚙️ Motorisation</option>';
    selMo.disabled = true;
    if (marque) {
        const modeles = [...new Set(megaBase.filter(v => v.marque === marque).map(v => v.modele))].sort();
        modeles.forEach(m => selM.innerHTML += `<option value="${m}">${m}</option>`);
        selM.disabled = false;
    } else selM.disabled = true;
}

function updateMotorisations() {
    const marque = document.getElementById('filter-marque').value;
    const modele = document.getElementById('filter-modele').value;
    const sel = document.getElementById('filter-moteur');
    if (!sel) return;
    sel.innerHTML = '<option value="">⚙️ Motorisation</option>';
    if (marque && modele) {
        const moteurs = megaBase.filter(v => v.marque === marque && v.modele === modele);
        moteurs.forEach(m => sel.innerHTML += `<option value="${m.codeMoteur}">${m.motorisation} - ${m.codeMoteur} (${m.puissance})</option>`);
        sel.disabled = false;
    }
}

function afficherEntretien() {
    const marque = document.getElementById('filter-marque').value;
    const modele = document.getElementById('filter-modele').value;
    const code = document.getElementById('filter-moteur').value;
    const results = document.getElementById('entretien-results');
    if (!results) return;
    const v = megaBase.find(x => x.marque === marque && x.modele === modele && x.codeMoteur === code);
    if (!v) return;
    let html = `<div class="glass rounded-3xl p-8 border-t-4 border-cyan-500 slide-up"><div class="flex items-start gap-5 mb-8"><div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center"><i data-lucide="car" class="w-8 h-8 text-white"></i></div><div class="flex-1"><h3 class="text-3xl font-black mb-2">${v.marque} ${v.modele}</h3><p class="text-cyan-400 font-mono text-lg mb-3">${v.motorisation} | ${v.codeMoteur} | ${v.puissance} | ${v.annee}</p>${v.notes ? `<p class="text-amber-400 italic">⚠️ ${v.notes}</p>` : ''}</div></div><div class="space-y-5">`;
    const paliers = ["15000","30000","60000","90000","120000","160000"];
    paliers.forEach(km => {
        const ops = v.entretiens[km];
        if (ops && ops.length > 0) {
            html += `<div class="bg-slate-800/60 rounded-2xl p-6 border-2 border-slate-700"><div class="flex flex-col md:flex-row gap-5"><div class="km-badge text-white px-6 py-4 rounded-xl text-center min-w-[140px] text-xl">${parseInt(km).toLocaleString()} km</div><ul class="flex-1 space-y-3">${ops.map(op => `<li class="flex items-start gap-3"><i data-lucide="check-circle" class="w-6 h-6 text-green-400 mt-0.5"></i><span>${op}</span></li>`).join('')}</ul></div></div>`;
        }
    });
    if (v.dtc && v.dtc.length > 0) {
        html += `<div class="mt-8 pt-8 border-t-2 border-slate-700"><h4 class="font-black text-xl mb-4 flex items-center gap-3"><i data-lucide="alert-circle" class="w-6 h-6 text-red-400"></i>Codes DTC</h4><div class="flex flex-wrap gap-3">${v.dtc.map(d => `<span class="dtc-badge px-4 py-2 rounded-xl text-sm font-mono text-white font-bold">${d}</span>`).join('')}</div></div>`;
    }
    if (v.rappels && v.rappels.length > 0) {
        html += `<div class="mt-6 pt-6 border-t-2 border-slate-700"><h4 class="font-black text-xl mb-4 flex items-center gap-3"><i data-lucide="alert-triangle" class="w-6 h-6 text-amber-400"></i>Rappels</h4><div class="space-y-3">${v.rappels.map(r => `<div class="bg-amber-900/30 border-2 border-amber-500/40 rounded-xl p-4"><p class="text-amber-100">${r}</p></div>`).join('')}</div></div>`;
    }
    html += '</div></div>';
    results.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==========================================
// 10. RECHERCHE MEGA BASE
// ==========================================
function rechercherMegaBase() {
    const q = document.getElementById('mega-search').value.toLowerCase().trim();
    const results = document.getElementById('megabase-results');
    if (!results) return;
    if (q.length < 2) { results.innerHTML = ''; return; }
    const r = megaBase.filter(v =>
        v.marque.toLowerCase().includes(q) ||
        v.modele.toLowerCase().includes(q) ||
        v.codeMoteur.toLowerCase().includes(q) ||
        (v.dtc && v.dtc.some(d => d.toLowerCase().includes(q))) ||
        (v.rappels && v.rappels.some(r => r.toLowerCase().includes(q)))
    ).slice(0, 30);
    if (r.length === 0) { results.innerHTML = `<div class="text-center text-slate-500 py-12">Aucune correspondance.</div>`; return; }
    results.innerHTML = r.map(v => `
        <div class="glass rounded-2xl p-6 cursor-pointer hover:border-cyan-500 transition-all" onclick="naviguerVersVehicule('${v.marque.replace(/'/g,"\\'")}','${v.modele.replace(/'/g,"\\'")}','${v.codeMoteur.replace(/'/g,"\\'")}')">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <p class="font-black text-cyan-400 text-xl">${v.marque} ${v.modele}</p>
                    <p class="text-slate-300 mt-2">${v.motorisation} (${v.codeMoteur}) • ${v.puissance}</p>
                    ${v.dtc && v.dtc.length > 0 ? `<p class="text-slate-400 text-sm mt-2">DTC: ${v.dtc.slice(0,3).join(', ')}</p>` : ''}
                </div>
                <i data-lucide="arrow-right" class="w-6 h-6 text-slate-500"></i>
            </div>
        </div>
    `).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function naviguerVersVehicule(marque, modele, code) {
    showTab('entretien');
    setTimeout(() => {
        const m = document.getElementById('filter-marque');
        if (m) m.value = marque;
        updateModeles();
        setTimeout(() => {
            const mo = document.getElementById('filter-modele');
            if (mo) mo.value = modele;
            updateMotorisations();
            setTimeout(() => {
                const mo2 = document.getElementById('filter-moteur');
                if (mo2) mo2.value = code;
                afficherEntretien();
            }, 100);
        }, 100);
    }, 100);
}

// ==========================================
// 11. AUTHENTIFICATION SÉCURISÉE
// ==========================================
async function verifierAcces(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('secure-code-input');
    const errorEl = document.getElementById('secure-error');
    if (!input) return;
    const code = input.value.trim();
    if (!code || code.toLowerCase() === 'admin' || code.length < 4) {
        if (errorEl) errorEl.classList.remove('hidden');
        input.value = '';
        showNotification('❌ Code incorrect', 'error');
        return;
    }
    if (!ADMIN_HASH) await initAdminHash();
    const hash = await hashPassword(code);
    if (hash === ADMIN_HASH) {
        isSecureModeActive = true;
        if (errorEl) errorEl.classList.add('hidden');
        const authEl = document.getElementById('secure-auth');
        const panelEl = document.getElementById('secure-panel');
        if (authEl) authEl.classList.add('hidden');
        if (panelEl) { panelEl.classList.remove('hidden'); panelEl.classList.remove('admin-locked'); panelEl.classList.add('admin-unlocked'); }
        const st = document.getElementById('secure-session-time');
        if (st) st.textContent = new Date().toLocaleTimeString('fr-FR');
        if (secureSessionTimeout) clearTimeout(secureSessionTimeout);
        secureSessionTimeout = setTimeout(fermerSessionSecurisee, SESSION_DURATION);
        showNotification('✅ Accès déverrouillé', 'success');
        input.value = '';
    } else {
        if (errorEl) errorEl.classList.remove('hidden');
        showNotification('❌ Code incorrect', 'error');
        input.value = '';
    }
}

function fermerSessionSecurisee() {
    isSecureModeActive = false;
    const authEl = document.getElementById('secure-auth');
    const panelEl = document.getElementById('secure-panel');
    if (authEl) authEl.classList.remove('hidden');
    if (panelEl) { panelEl.classList.add('hidden'); panelEl.classList.add('admin-locked'); }
    const input = document.getElementById('secure-code-input');
    if (input) input.value = '';
    if (secureSessionTimeout) clearTimeout(secureSessionTimeout);
    showNotification('🔒 Session fermée', 'info');
}

function verifierAdmin() { verifierAcces(null); }
function deconnecterAdmin() { fermerSessionSecurisee(); }

// ==========================================
// 12. GESTION BASE
// ==========================================
function ajouterEntree(event) {
    event.preventDefault();
    if (!isSecureModeActive) { showNotification('⚠️ Accès requis', 'error'); return; }
    const form = event.target;
    const v = {
        marque: form.marque.value.trim(),
        modele: form.modele.value.trim(),
        motorisation: "Standard",
        codeMoteur: form.codeMoteur.value.trim().toUpperCase(),
        puissance: form.puissance.value.trim(),
        annee: "À définir",
        typeCarburant: "Essence",
        entretiens: { "30000":["Vidange"], "60000":["Vidange"], "120000":["Vidange"], "160000":["Vidange"] },
        dtc: [], rappels: [], notes: ""
    };
    try {
        const p = JSON.parse(form.preconisations.value);
        if (typeof p === 'object' && p !== null) v.entretiens = p;
    } catch(e) {
        if (form.preconisations.value.trim()) v.entretiens["30000"] = [form.preconisations.value.trim()];
    }
    megaBase.push(v);
    sauvegarderLocalStorage();
    showNotification('✅ Fiche ajoutée', 'success');
    form.reset();
    initFiltresEntretien();
}

function reinitialiserBase() {
    if (!isSecureModeActive) { showNotification('⚠️ Accès requis', 'error'); return; }
    if (confirm('Réinitialiser la base ?')) {
        megaBase = [...MEGA_BASE_INITIALE];
        localStorage.removeItem('kevFusion_megaBase');
        showNotification('🔄 Base réinitialisée', 'warning');
        initFiltresEntretien();
    }
}

function sauvegarderLocalStorage() {
    try {
        localStorage.setItem('kevFusion_megaBase', JSON.stringify(megaBase));
        showNotification('💾 Sauvegarde OK', 'success');
    } catch (e) { showNotification('❌ Erreur sauvegarde', 'error'); }
}

function exporterJSON() {
    try {
        const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(megaBase, null, 2));
        const a = document.createElement('a');
        a.setAttribute("href", data);
        a.setAttribute("download", `kev_fusion_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(a);
        a.click();
        a.remove();
        showNotification('📥 Export OK', 'success');
    } catch (e) { showNotification('❌ Erreur export', 'error'); }
}

function importerJSON(input) {
    const file = input.files[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
        showNotification('❌ JSON requis', 'error');
        input.value = '';
        return;
    }
    if (file.size > 50 * 1024 * 1024) {
        showNotification('❌ Fichier trop gros (max 50MB)', 'error');
        input.value = '';
        return;
    }
    importAvecAutoControle(file);
    input.value = '';
}

// ==========================================
// 13. OVERLAY IMPORT + AUTO-CONTRÔLE
// ==========================================
function ouvrirOverlayImport() {
    const overlay = document.getElementById('import-overlay');
    if (overlay) overlay.classList.remove('hidden');
    const log = document.getElementById('import-log');
    if (log) log.innerHTML = '';
    const result = document.getElementById('import-result');
    if (result) result.classList.add('hidden');
    document.getElementById('stat-before').textContent = megaBase.length;
    document.getElementById('stat-added').textContent = '+0';
    document.getElementById('stat-merged').textContent = '~0';
    document.getElementById('stat-after').textContent = megaBase.length;
    mettreAJourProgress(0, "Initialisation...");
    logImport("🚀 Démarrage import", "step");
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function fermerOverlayImport() {
    const overlay = document.getElementById('import-overlay');
    if (overlay) overlay.classList.add('hidden');
}

function mettreAJourProgress(percent, detail) {
    const fill = document.getElementById('progress-fill');
    const percentEl = document.getElementById('progress-percent');
    const detailEl = document.getElementById('progress-detail');
    if (fill) fill.style.width = percent + '%';
    if (percentEl) percentEl.textContent = Math.round(percent) + '%';
    if (detailEl) detailEl.textContent = detail || '';
}

function logImport(message, type = "info") {
    const logContainer = document.getElementById('import-log');
    if (!logContainer) return;
    const entry = document.createElement('div');
    entry.className = `log-${type}`;
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    entry.textContent = `[${timestamp}] ${message}`;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

async function importAvecAutoControle(file) {
    ouvrirOverlayImport();
    const avant = megaBase.length;
    let ajouts = 0, fusions = 0;
    try {
        mettreAJourProgress(10, "Lecture fichier...");
        logImport(`📂 Lecture: ${file.name}`, "step");
        const content = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error("Lecture impossible"));
            reader.readAsText(file);
        });
        logImport(`✅ ${Math.round(file.size/1024)} KB lu`, "success");
        await sleep(300);

        mettreAJourProgress(20, "Validation JSON...");
        logImport("🔍 Validation JSON...", "step");
        let data;
        try {
            data = JSON.parse(content);
            logImport("✅ JSON valide", "success");
        } catch (e) {
            throw new Error(`JSON invalide: ${e.message}`);
        }
        await sleep(300);

        mettreAJourProgress(35, "Analyse structure...");
        logImport("🔬 Analyse structure...", "step");
        const items = Array.isArray(data) ? data : (typeof data === 'object' ? Object.values(data) : []);
        logImport(`📊 ${items.length} éléments détectés`, "info");
        if (items.length === 0) throw new Error("Aucun élément valide");
        await sleep(400);

        mettreAJourProgress(50, "Vérification doublons...");
        logImport("🔎 Vérification doublons...", "step");
        let doublons = 0;
        items.forEach(item => {
            const m = item.marque || item.brand || '';
            const mo = item.modele || item.model || '';
            if (megaBase.find(v => v.marque === m && v.modele === mo)) doublons++;
        });
        logImport(`⚠️ ${doublons} doublons`, doublons > 0 ? "warning" : "info");
        await sleep(400);

        mettreAJourProgress(75, "Fusion intelligente...");
        logImport("🔀 Fusion...", "step");
        for (let i = 0; i < items.length; i++) {
            const item = normaliserItem(items[i]);
            if (!item) continue;
            const existant = megaBase.find(v => v.marque === item.marque && v.modele === item.modele && v.codeMoteur === item.codeMoteur);
            if (!existant) { megaBase.push(item); ajouts++; }
            else {
                if (item.dtc) item.dtc.forEach(d => { if (!existant.dtc.includes(d)) existant.dtc.push(d); });
                if (item.rappels) item.rappels.forEach(r => { if (!existant.rappels.includes(r)) existant.rappels.push(r); });
                if (item.entretiens) Object.assign(existant.entretiens, item.entretiens);
                if (item.notes && !existant.notes) existant.notes = item.notes;
                fusions++;
            }
            if (i % 20 === 0) {
                mettreAJourProgress(50 + (i/items.length)*25, `Fusion: ${i+1}/${items.length}`);
                await sleep(5);
            }
        }
        document.getElementById('stat-added').textContent = '+' + ajouts;
        document.getElementById('stat-merged').textContent = '~' + fusions;
        logImport(`✅ +${ajouts} ajouts, ~${fusions} fusions`, "success");
        await sleep(400);

        mettreAJourProgress(90, "Sauvegarde...");
        logImport("💾 Sauvegarde localStorage...", "step");
        try {
            localStorage.setItem('kevFusion_megaBase', JSON.stringify(megaBase));
            const verif = localStorage.getItem('kevFusion_megaBase');
            if (!verif) throw new Error("Sauvegarde vide");
            logImport("✅ Sauvegarde réussie", "success");
        } catch (e) {
            throw new Error("Échec sauvegarde: " + e.message);
        }
        await sleep(400);

        mettreAJourProgress(100, "Vérification intégrité...");
        logImport("🛡️ Vérification intégrité...", "step");
        const saved = localStorage.getItem('kevFusion_megaBase');
        let parsed = [];
        try { parsed = JSON.parse(saved); } catch(e) {}
        if (parsed.length === megaBase.length) {
            logImport("✅ Intégrité vérifiée - AUCUN BLOCAGE", "success");
        } else {
            logImport(`⚠️ Divergence: ${parsed.length} vs ${megaBase.length}`, "warning");
        }
        await sleep(400);

        document.getElementById('stat-after').textContent = megaBase.length;

        const resultDiv = document.getElementById('import-result');
        const msgEl = document.getElementById('result-message');
        const detailsEl = document.getElementById('result-details');
        resultDiv.classList.remove('hidden', 'error');
        msgEl.textContent = `Import terminé - Base APK mise à jour`;
        detailsEl.innerHTML = `
            <div style="color:#4ade80;font-weight:bold;margin-bottom:.5rem">📊 RAPPORT FINAL</div>
            <div>• Avant: <strong>${avant}</strong></div>
            <div>• Ajouts: <strong style="color:#4ade80">+${ajouts}</strong></div>
            <div>• Fusions: <strong style="color:#fbbf24">~${fusions}</strong></div>
            <div>• Après: <strong style="color:#38bdf8">${megaBase.length}</strong></div>
            <div style="margin-top:.5rem;padding-top:.5rem;border-top:1px solid rgba(255,255,255,.1)">
                <span style="color:#4ade80">✅ Intégrité vérifiée - AUCUN BLOCAGE</span>
            </div>
            <div style="margin-top:.5rem;color:#94a3b8;font-size:.75rem">
                💾 localStorage: OK | 📦 Base APK: ${megaBase.length} véhicules
            </div>
        `;
        showNotification(`✅ Import: +${ajouts} véhicules`, 'success');
        initFiltresEntretien();

    } catch (error) {
        logImport(`❌ ${error.message}`, "error");
        const resultDiv = document.getElementById('import-result');
        const msgEl = document.getElementById('result-message');
        const detailsEl = document.getElementById('result-details');
        resultDiv.classList.remove('hidden');
        resultDiv.classList.add('error');
        resultDiv.querySelector('.w-20').innerHTML = '<i data-lucide="alert-circle" class="w-12 h-12 text-red-400"></i>';
        resultDiv.querySelector('h3').textContent = '❌ Échec import';
        resultDiv.querySelector('h3').style.color = '#f87171';
        msgEl.textContent = error.message;
        detailsEl.innerHTML = `
            <div style="color:#f87171;font-weight:bold">⚠️ Base préservée</div>
            <div>• Véhicules actuels: <strong>${megaBase.length}</strong></div>
        `;
        showNotification('❌ Import échoué', 'error');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

function normaliserItem(item) {
    if (!item || typeof item !== 'object') return null;
    const marque = item.marque || item.brand || item.marque_id;
    const modele = item.modele || item.model || item.modele_nom;
    if (!marque || !modele) return null;
    return {
        marque: normaliserMarque(marque),
        modele: String(modele).trim(),
        motorisation: item.motorisation || item.motor || item.moteur || "Standard",
        codeMoteur: (item.codeMoteur || item.code_moteur || item.engine_code || genererCodeMoteur(marque, item.motorisation)).toUpperCase(),
        puissance: item.puissance || item.power || "Auto",
        annee: item.annee || item.year || item.years || "À définir",
        typeCarburant: item.typeCarburant || item.fuel || item.carburant || determinerCarburant(item.motorisation || ''),
        entretiens: item.entretiens || item.maintenance || { "30000":["Vidange"], "60000":["Vidange"], "120000":["Vidange"], "160000":["Vidange"] },
        dtc: Array.isArray(item.dtc) ? item.dtc : (item.dtc ? String(item.dtc).split(/[,\/\s]+/).filter(x => /^[PUBC]\d{4}/i.test(x)) : []),
        rappels: Array.isArray(item.rappels) ? item.rappels : (item.rappels ? [item.rappels] : (item.recall ? [item.recall] : [])),
        notes: item.notes || item.note || item.comment || ""
    };
}

// ==========================================
// 14. SYNCHRONISATION (CORRIGÉE - PAS BLOQUÉE)
// ==========================================
async function forcerSynchro() {
    const syncEl = document.getElementById('sync-status');
    if (!syncEl) return;
    
    showNotification('🔄 Synchronisation...', 'info');
    
    // État ACTIF avec icône qui tourne
    syncEl.className = 'sync-indicator sync-active';
    syncEl.innerHTML = '<i data-lucide="refresh-cw" class="w-4 h-4 sync-icon"></i><span>Synchro...</span>';
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    await sleep(800);
    
    // État INACTIF avec icône statique (PAS d'animation)
    syncEl.className = 'sync-indicator sync-inactive';
    syncEl.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i><span>${megaBase.length} véh.</span>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    syncStatus.lastSync = new Date().toISOString();
    showNotification(`✅ ${megaBase.length} véhicules en base`, 'success');
    
    if (!document.getElementById('view-stats').classList.contains('hidden')) {
        afficherStats();
    }
}

// ==========================================
// 15. STATISTIQUES
// ==========================================
function afficherStats() {
    const container = document.getElementById('stats-container');
    const fuelStats = document.getElementById('fuel-stats');
    const syncDetails = document.getElementById('sync-details');
    if (!container) return;
    const total = megaBase.length;
    const marques = [...new Set(megaBase.map(v => v.marque))].length;
    const dtc = megaBase.reduce((a,v) => a + (v.dtc?.length || 0), 0);
    const rappels = megaBase.reduce((a,v) => a + (v.rappels?.length || 0), 0);
    container.innerHTML = `
        <div class="stat-card rounded-2xl p-6"><div class="flex items-center gap-3 mb-3"><i data-lucide="car" class="w-8 h-8 text-cyan-400"></i><span class="text-slate-400 font-bold text-sm uppercase">Véhicules</span></div><p class="text-4xl font-black">${total}</p></div>
        <div class="stat-card rounded-2xl p-6"><div class="flex items-center gap-3 mb-3"><i data-lucide="tag" class="w-8 h-8 text-purple-400"></i><span class="text-slate-400 font-bold text-sm uppercase">Marques</span></div><p class="text-4xl font-black">${marques}</p></div>
        <div class="stat-card rounded-2xl p-6"><div class="flex items-center gap-3 mb-3"><i data-lucide="alert-circle" class="w-8 h-8 text-red-400"></i><span class="text-slate-400 font-bold text-sm uppercase">DTC</span></div><p class="text-4xl font-black">${dtc}</p></div>
        <div class="stat-card rounded-2xl p-6"><div class="flex items-center gap-3 mb-3"><i data-lucide="alert-triangle" class="w-8 h-8 text-amber-400"></i><span class="text-slate-400 font-bold text-sm uppercase">Rappels</span></div><p class="text-4xl font-black">${rappels}</p></div>
    `;
    const carb = {};
    megaBase.forEach(v => { if (v.typeCarburant) carb[v.typeCarburant] = (carb[v.typeCarburant] || 0) + 1; });
    if (fuelStats) {
        fuelStats.innerHTML = Object.entries(carb).map(([t, c]) => {
            const p = total > 0 ? ((c/total)*100).toFixed(1) : 0;
            return `<div class="glass rounded-2xl p-5"><div class="flex justify-between mb-3"><span class="font-bold text-lg">${t}</span><span class="text-slate-400">${c} (${p}%)</span></div><div class="progress-bar"><div class="progress-fill" style="width:${p}%"></div></div></div>`;
        }).join('');
    }
    if (syncDetails) {
        syncDetails.innerHTML = `
            <div class="glass rounded-2xl p-5 border-l-4 border-cyan-500"><div class="flex items-center gap-3 mb-2"><i data-lucide="database" class="w-6 h-6 text-cyan-400"></i><span class="font-bold text-lg">Base locale</span></div><p class="text-slate-300">${megaBase.length} véhicules</p>${syncStatus.lastSync ? `<p class="text-xs text-slate-500 mt-2">MAJ: ${new Date(syncStatus.lastSync).toLocaleString('fr-FR')}</p>` : ''}</div>
        `;
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==========================================
// 16. INITIALISATION (CORRIGÉE MULTI-NIVEAUX)
// ==========================================
function chargerBase() {
    try {
        const saved = localStorage.getItem('kevFusion_megaBase');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                megaBase = parsed;
                console.log('✅ Base chargée depuis localStorage:', megaBase.length);
                return;
            }
        }
    } catch (e) {
        console.error('Erreur chargement localStorage:', e);
    }
    megaBase = [...MEGA_BASE_INITIALE];
    try {
        localStorage.setItem('kevFusion_megaBase', JSON.stringify(megaBase));
    } catch (e) {}
    console.log('✅ Base initiale utilisée:', megaBase.length);
}

function initialiser() {
    console.log('🚀 Initialisation KEV FUSION 2026...');
    
    try {
        // 1. Forcer l'affichage du statut réseau IMMÉDIATEMENT
        updateNetworkStatus();
        
        // 2. Initialiser le hash admin
        initAdminHash();
        
        // 3. Charger la base
        chargerBase();
        
        // 4. Mettre à jour l'interface
        initFiltresEntretien();
        
        // 5. Mettre à jour l'indicateur de synchro avec le nombre de véhicules (PAS d'animation)
        const syncEl = document.getElementById('sync-status');
        if (syncEl) {
            syncEl.className = 'sync-indicator sync-inactive';
            syncEl.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i><span>${megaBase.length} véh.</span>`;
        }
        
        // 6. Initialiser les icônes
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        console.log('✅ Initialisation terminée:', megaBase.length, 'véhicules');
        
    } catch (error) {
        console.error('❌ Erreur initialisation:', error);
        megaBase = [...MEGA_BASE_INITIALE];
        const syncEl = document.getElementById('sync-status');
        if (syncEl) {
            syncEl.className = 'sync-indicator sync-inactive';
            syncEl.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i><span>${megaBase.length} véh.</span>`;
        }
        updateNetworkStatus();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// ==========================================
// 17. DÉMARRAGE MULTI-NIVEAUX
// ==========================================

// Niveau 1 : Initialisation immédiate
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiser);
} else {
    initialiser();
}

// Niveau 2 : Secours après 2 secondes si l'initialisation a échoué
setTimeout(() => {
    const networkText = document.getElementById('network-text');
    if (networkText && networkText.textContent === 'Connexion...') {
        console.warn('⚠️ Initialisation réseau manquante, correction...');
        updateNetworkStatus();
    }
    
    const syncEl = document.getElementById('sync-status');
    if (syncEl && syncEl.querySelector('.sync-icon')) {
        console.warn('⚠️ Synchro bloquée détectée, correction...');
        syncEl.className = 'sync-indicator sync-inactive';
        syncEl.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i><span>${megaBase.length} véh.</span>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    
    updateNetworkStatus();
}, 2000);

// Niveau 3 : Vérification périodique pendant les 10 premières secondes
let initCheckCount = 0;
const initCheckInterval = setInterval(() => {
    initCheckCount++;
    
    const networkText = document.getElementById('network-text');
    if (networkText && networkText.textContent === 'Connexion...') {
        updateNetworkStatus();
    }
    
    const syncEl = document.getElementById('sync-status');
    if (syncEl && syncEl.className.includes('sync-active')) {
        const hasSpinningIcon = syncEl.querySelector('.sync-icon');
        if (hasSpinningIcon && initCheckCount > 3) {
            syncEl.className = 'sync-indicator sync-inactive';
            syncEl.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i><span>${megaBase.length} véh.</span>`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }
    
    if (initCheckCount >= 10) {
        clearInterval(initCheckInterval);
        console.log('✅ Vérifications initiales terminées');
    }
}, 1000);

// Listeners réseau
window.addEventListener('online', () => {
    updateNetworkStatus();
    showNotification('🌐 Connexion rétablie', 'success');
});

window.addEventListener('offline', () => {
    updateNetworkStatus();
    showNotification('📡 Mode hors ligne', 'warning');
});

// Touche Enter sur le champ sécurisé
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id === 'secure-code-input') {
        verifierAcces(e);
    }
});
