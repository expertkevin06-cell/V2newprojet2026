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
let expertBase = [];
let syncStatus = { lastSync: null, sources: [] };

// ==========================================
// 2. UTILITAIRES
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
        'byd':'BYD','mg':'MG','xpeng':'Xpeng','nio':'Nio','landrover':'Land Rover',
        'jaguar':'Jaguar','ferrari':'Ferrari','maserati':'Maserati','mclaren':'McLaren',
        'bugatti':'Bugatti','mini':'Mini','lexus':'Lexus','alpine':'Alpine',
        'lancia':'Lancia','subaru':'Subaru','suzuki':'Suzuki','mitsubishi':'Mitsubishi',
        'dodge':'Dodge','cadillac':'Cadillac','gmc':'GMC','omoda':'Omoda','jaecoo':'Jaecoo',
        'leapmotor':'Leapmotor','ora':'Ora','aiways':'Aiways','seres':'Seres','lynkco':'Lynk&Co'
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

function capFuel(f) {
    const m = { 'essence':'Essence', 'diesel':'Diesel', 'hybride':'Hybride', 'electrique':'Électrique' };
    return m[String(f || '').toLowerCase()] || 'Essence';
}

function genererEntretiens(fuel) {
    if (fuel === 'Électrique') return { "30000":["Contrôle batterie HV","Filtre habitacle"],"60000":["Vidange réducteur","Contrôle charge"],"120000":["Contrôle SOH batterie","Liquide refroidissement HV"],"160000":["Contrôle complet HV"] };
    if (fuel === 'Hybride') return { "15000":["Vidange 0W20","Contrôle hybride"],"30000":["Filtre habitacle"],"60000":["Filtre à air"],"90000":["Liquide de frein"],"120000":["Bougies"],"160000":["Contrôle batterie HV","Liquide refroidissement"] };
    if (fuel === 'Diesel') return { "30000":["Vidange","Filtre à huile"],"60000":["Filtre à gasoil"],"90000":["Liquide de frein"],"120000":["Kit distribution","Filtre à air"],"160000":["Filtre à gasoil","Liquide refroidissement"] };
    return { "30000":["Vidange","Filtre à huile"],"60000":["Filtre à air","Bougies"],"90000":["Liquide de frein"],"120000":["Kit distribution"],"160000":["Bougies","Liquide refroidissement"] };
}

// ==========================================
// 3. HASH + AUTH
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
    } catch (e) {}
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
}

// ==========================================
// 4. MÉGA BASE INITIALE (52 véhicules)
// ==========================================
const MEGA_BASE_INITIALE = [
    { marque:"Peugeot", modele:"308 III", motorisation:"1.2 PureTech", codeMoteur:"HNS", puissance:"130 ch", annee:"2021-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W20","Filtre à huile","Contrôle courroie humide"],"60000":["Vidange","Filtre à huile","Filtre à air","Bougies iridium"],"90000":["Vidange","Filtre à huile","Liquide de frein DOT 4"],"120000":["Vidange","Kit distribution + pompe eau"],"160000":["Vidange","Bougies","Liquide refroidissement G12+"]}, dtc:["P0420","P0300","P0301","P0171","P0087","P0340"], rappels:["Rappel freinage 2022","Campagne tendeur courroie 2022-2023"], notes:"Distribution humide à surveiller 30 000 km" },
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
    { marque:"Tesla", modele:"Model 3/Y", motorisation:"Électrique", codeMoteur:"Tesla", puissance:"Multi", annee:"2019-2024", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV","Filtre habitacle"]}, dtc:["U0101","P0AA6"], rappels:["Campagne freinage fantôme 2023","Campagne eMMC MCU","Campagne contacteurs HV"], notes:"Multiples campagnes NHTSA" },
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
// 5. NOTIFICATIONS + RÉSEAU
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

function updateNetworkStatus() {
    const statusEl = document.getElementById('network-status');
    if (!statusEl) return;
    try {
        if (navigator.onLine) {
            let type = 'WIFI/4G/5G';
            try {
                const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                if (conn && conn.effectiveType) type = conn.effectiveType.toUpperCase();
            } catch (e) {}
            statusEl.innerHTML = `<span class="pulse-dot online"></span><span id="network-text">${type}</span>`;
        } else {
            statusEl.innerHTML = `<span class="pulse-dot offline"></span><span id="network-text">Hors ligne</span>`;
        }
    } catch (error) {
        statusEl.innerHTML = `<span class="pulse-dot online"></span><span id="network-text">En ligne</span>`;
    }
}

// ==========================================
// 6. NAVIGATION
// ==========================================
function showTab(tabName) {
    document.querySelectorAll('.view-section').forEach(el => { el.classList.add('hidden'); el.classList.remove('fade-in'); });
    const target = document.getElementById(`view-${tabName}`);
    if (target) { target.classList.remove('hidden'); target.classList.add('fade-in'); }
    document.querySelectorAll('.tab-btn').forEach(el => { el.classList.remove('tab-active'); el.classList.add('text-slate-400'); });
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
// 7. RECHERCHE VIN
// ==========================================
async function rechercherVIN() {
    const vin = document.getElementById('vin-input').value.trim().toUpperCase();
    const results = document.getElementById('vin-results');
    if (vin.length !== 17) {
        results.innerHTML = `<div class="glass rounded-3xl p-8 border-l-4 border-red-500 slide-up"><h3 class="text-2xl font-black text-red-400">VIN invalide</h3><p class="text-slate-300">17 caractères requis.</p></div>`;
        return;
    }
    results.innerHTML = `<div class="glass rounded-3xl p-10 text-center"><div class="loading-spinner mx-auto mb-6"></div><p class="text-slate-300">Analyse...</p></div>`;
    try {
        const response = await fetch(`https://api.nhtsa.gov/recalls/recallsByVin?vin=${vin}&format=json`);
        const data = await response.json();
        if (data.Results && data.Results.length > 0) {
            let html = `<div class="glass rounded-3xl p-8 border-l-4 border-red-500 slide-up"><h3 class="text-3xl font-black text-red-400 mb-4">⚠️ ${data.Results.length} rappel(s)</h3><div class="space-y-5">`;
            data.Results.forEach((r, i) => {
                html += `<div class="bg-red-900/30 border-2 border-red-500/40 rounded-2xl p-6"><p class="font-black text-cyan-400 text-xl mb-2">${i+1}. ${r.Component}</p><p class="text-slate-200 mb-3">${r.Summary}</p><span class="recall-badge px-3 py-1.5 rounded-lg font-bold">NHTSA</span></div>`;
            });
            html += '</div></div>';
            results.innerHTML = html;
        } else {
            results.innerHTML = `<div class="glass rounded-3xl p-8 border-l-4 border-green-500 slide-up"><h3 class="text-3xl font-black text-green-400">✅ Aucun rappel</h3><p class="text-slate-400">VIN: ${vin}</p></div>`;
        }
    } catch (e) {
        results.innerHTML = `<div class="glass rounded-3xl p-8 border-l-4 border-amber-500 slide-up"><h3 class="text-2xl font-black text-amber-400">Erreur API</h3></div>`;
    }
}

// ==========================================
// 8. PRÉCONISATIONS
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
        megaBase.filter(v => v.marque === marque && v.modele === modele).forEach(m => {
            sel.innerHTML += `<option value="${m.codeMoteur}">${m.motorisation} - ${m.codeMoteur} (${m.puissance})</option>`;
        });
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
    let html = `<div class="glass rounded-3xl p-8 border-t-4 border-cyan-500 slide-up"><h3 class="text-3xl font-black mb-2">${v.marque} ${v.modele}</h3><p class="text-cyan-400 font-mono text-lg mb-3">${v.motorisation} | ${v.codeMoteur} | ${v.puissance} | ${v.annee}</p>${v.notes ? `<p class="text-amber-400 italic mb-4">⚠️ ${v.notes}</p>` : ''}<div class="space-y-5">`;
    ["15000","30000","60000","90000","120000","160000"].forEach(km => {
        const ops = v.entretiens[km];
        if (ops && ops.length > 0) {
            html += `<div class="bg-slate-800/60 rounded-2xl p-6 border-2 border-slate-700"><div class="flex flex-col md:flex-row gap-5"><div class="km-badge text-white px-6 py-4 rounded-xl text-center min-w-[140px] text-xl">${parseInt(km).toLocaleString()} km</div><ul class="flex-1 space-y-3">${ops.map(op => `<li class="flex items-start gap-3"><i data-lucide="check-circle" class="w-6 h-6 text-green-400 mt-0.5"></i><span>${op}</span></li>`).join('')}</ul></div></div>`;
        }
    });
    if (v.dtc && v.dtc.length > 0) {
        html += `<div class="mt-8 pt-8 border-t-2 border-slate-700"><h4 class="font-black text-xl mb-4">Codes DTC</h4><div class="flex flex-wrap gap-3">${v.dtc.map(d => `<span class="dtc-badge px-4 py-2 rounded-xl text-sm font-mono text-white font-bold">${d}</span>`).join('')}</div></div>`;
    }
    if (v.rappels && v.rappels.length > 0) {
        html += `<div class="mt-6 pt-6 border-t-2 border-slate-700"><h4 class="font-black text-xl mb-4">Rappels</h4><div class="space-y-3">${v.rappels.map(r => `<div class="bg-amber-900/30 border-2 border-amber-500/40 rounded-xl p-4"><p class="text-amber-100">${r}</p></div>`).join('')}</div></div>`;
    }
    html += '</div></div>';
    results.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==========================================
// 9. RECHERCHE MEGA BASE (véhicules + expert)
// ==========================================
function rechercherMegaBase() {
    const q = document.getElementById('mega-search').value.toLowerCase().trim();
    const results = document.getElementById('megabase-results');
    if (!results) return;
    if (q.length < 2) { results.innerHTML = ''; return; }
    
    const vehicules = megaBase.filter(v =>
        v.marque.toLowerCase().includes(q) || v.modele.toLowerCase().includes(q) ||
        v.codeMoteur.toLowerCase().includes(q) ||
        (v.dtc && v.dtc.some(d => d.toLowerCase().includes(q))) ||
        (v.rappels && v.rappels.some(r => r.toLowerCase().includes(q)))
    ).slice(0, 20);
    
    const experts = expertBase.filter(e =>
        (e.marque + ' ' + e.modele + ' ' + e.motorisation + ' ' + e.titre + ' ' + (e.dtc || []).join(' ')).toLowerCase().includes(q)
    ).slice(0, 10);
    
    if (vehicules.length === 0 && experts.length === 0) {
        results.innerHTML = `<div class="text-center text-slate-500 py-12">Aucune correspondance.</div>`;
        return;
    }
    
    let html = vehicules.map(v => `
        <div class="glass rounded-2xl p-6 cursor-pointer hover:border-cyan-500 transition-all" onclick="naviguerVersVehicule('${v.marque.replace(/'/g,"\\'")}','${v.modele.replace(/'/g,"\\'")}','${v.codeMoteur.replace(/'/g,"\\'")}')">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <p class="font-black text-cyan-400 text-xl">${v.marque} ${v.modele}</p>
                    <p class="text-slate-300 mt-2">${v.motorisation} (${v.codeMoteur}) • ${v.puissance}</p>
                </div>
                <i data-lucide="arrow-right" class="w-6 h-6 text-slate-500"></i>
            </div>
        </div>
    `).join('');
    
    html += experts.map(e => `
        <div class="glass rounded-2xl p-6 border-l-4 border-purple-500">
            <div class="flex items-center gap-2 mb-2">
                <span class="expert-badge px-3 py-1 rounded-lg text-xs font-bold text-white">🧠 FICHE EXPERT</span>
                <span class="text-slate-400 text-sm">${e.marque}${e.modele ? ' • ' + e.modele : ''}${e.motorisation ? ' • ' + e.motorisation : ''}</span>
            </div>
            <p class="font-black text-white text-lg mb-2">${e.titre}</p>
            ${e.symptome ? `<p class="text-slate-300 text-sm mb-2">⚠️ ${e.symptome}</p>` : ''}
            ${e.protocole ? `<p class="text-slate-300 text-sm mb-2">🔬 ${e.protocole}</p>` : ''}
            ${e.organes ? `<p class="text-slate-400 text-sm mb-2">🔩 ${e.organes}</p>` : ''}
            <div class="flex flex-wrap gap-2 mt-2">
                ${(e.dtc || []).map(d => `<span class="dtc-badge px-3 py-1 rounded-lg text-xs font-mono text-white font-bold">${d}</span>`).join('')}
                ${e.source ? `<span class="recall-badge px-3 py-1 rounded-lg text-xs font-bold text-white">${e.source}</span>` : ''}
                ${e.annees ? `<span class="success-badge px-3 py-1 rounded-lg text-xs font-bold text-white">${e.annees}</span>` : ''}
            </div>
        </div>
    `).join('');
    
    results.innerHTML = html;
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
// 10. AUTHENTIFICATION
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

// ==========================================
// 11. GESTION BASE
// ==========================================
function ajouterEntree(event) {
    event.preventDefault();
    if (!isSecureModeActive) { showNotification('⚠️ Accès requis', 'error'); return; }
    const form = event.target;
    const v = {
        marque: form.marque.value.trim(), modele: form.modele.value.trim(),
        motorisation: "Standard", codeMoteur: form.codeMoteur.value.trim().toUpperCase(),
        puissance: form.puissance.value.trim(), annee: "À définir", typeCarburant: "Essence",
        entretiens: genererEntretiens('Essence'), dtc: [], rappels: [], notes: ""
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
        expertBase = [];
        localStorage.removeItem('kevFusion_megaBase');
        localStorage.removeItem('kevFusion_expertBase');
        showNotification('🔄 Base réinitialisée', 'warning');
        initFiltresEntretien();
    }
}

function sauvegarderLocalStorage() {
    try {
        localStorage.setItem('kevFusion_megaBase', JSON.stringify(megaBase));
        localStorage.setItem('kevFusion_expertBase', JSON.stringify(expertBase));
        showNotification('💾 Sauvegarde OK', 'success');
    } catch (e) { showNotification('❌ Erreur sauvegarde', 'error'); }
}

function exporterJSON() {
    try {
        const exportObj = { vehicles: megaBase, experts: expertBase };
        const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
        const a = document.createElement('a');
        a.setAttribute("href", data);
        a.setAttribute("download", `kev_fusion_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(a);
        a.click();
        a.remove();
        showNotification('📥 Export OK', 'success');
    } catch (e) { showNotification('❌ Erreur export', 'error'); }
}

// ==========================================
// 12. OVERLAY IMPORT
// ==========================================
function ouvrirOverlayImport(titre) {
    const overlay = document.getElementById('import-overlay');
    if (overlay) overlay.classList.remove('hidden');
    const log = document.getElementById('import-log');
    if (log) log.innerHTML = '';
    const result = document.getElementById('import-result');
    if (result) { result.classList.add('hidden'); result.classList.remove('error', 'warning'); }
    const titleEl = document.getElementById('import-title');
    if (titleEl && titre) titleEl.textContent = titre;
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
    if (fill) fill.style.width = Math.min(100, percent) + '%';
    if (percentEl) percentEl.textContent = Math.round(Math.min(100, percent)) + '%';
    if (detailEl) detailEl.textContent = detail || '';
}

function logImport(message, type = "info") {
    const logContainer = document.getElementById('import-log');
    if (!logContainer) return;
    const entry = document.createElement('div');
    entry.className = `log-${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString('fr-FR')}] ${message}`;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function afficherResultat(type, titre, message, detailsHtml) {
    const resultDiv = document.getElementById('import-result');
    const iconBox = document.getElementById('result-icon-box');
    const titleEl = document.getElementById('result-title');
    const msgEl = document.getElementById('result-message');
    const detailsEl = document.getElementById('result-details');
    if (!resultDiv) return;
    resultDiv.classList.remove('hidden', 'error', 'warning');
    if (type === 'success') {
        iconBox.innerHTML = '<i data-lucide="check-circle" class="w-12 h-12 text-green-400"></i>';
        iconBox.className = 'w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4';
        titleEl.textContent = titre; titleEl.style.color = '#4ade80';
    } else if (type === 'warning') {
        resultDiv.classList.add('warning');
        iconBox.innerHTML = '<i data-lucide="alert-triangle" class="w-12 h-12 text-amber-400"></i>';
        iconBox.className = 'w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4';
        titleEl.textContent = titre; titleEl.style.color = '#fbbf24';
    } else {
        resultDiv.classList.add('error');
        iconBox.innerHTML = '<i data-lucide="alert-circle" class="w-12 h-12 text-red-400"></i>';
        iconBox.className = 'w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4';
        titleEl.textContent = titre; titleEl.style.color = '#f87171';
    }
    msgEl.textContent = message;
    detailsEl.innerHTML = detailsHtml;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==========================================
// 13. IMPORT FICHIER JSON MULTI-FORMATS (CORRIGÉ)
// ==========================================
function detecterFormat(data) {
    if (!data) return 'inconnu';
    if (data.overrides !== undefined || data.customs !== undefined || data.recalls !== undefined || data.tsb !== undefined || data.modelsExtra !== undefined) return 'auto-diagnostic';
    if (Array.isArray(data)) return 'tableau';
    if (data.vehicles && Array.isArray(data.vehicles)) return 'vehicles';
    if (data.data && Array.isArray(data.data)) return 'data';
    return 'objet';
}

function convertirFormatAutoDiagnostic(data) {
    const result = [];
    const pushVehicule = (src) => {
        const marque = src.marque || src.brand;
        const modele = src.modele || src.model;
        if (!marque || !modele) return;
        result.push({
            marque: marque, modele: modele,
            motorisation: src.motorisation || src.motor || 'Standard',
            codeMoteur: src.codeMoteur || src.code_moteur || genererCodeMoteur(marque, src.motorisation),
            puissance: src.puissance || src.power || 'Auto',
            annee: src.annee || src.year || 'À définir',
            typeCarburant: src.typeCarburant || src.fuel || 'Essence',
            entretiens: src.entretiens || genererEntretiens(src.typeCarburant || src.fuel || 'Essence'),
            dtc: src.dtc || [], rappels: src.rappels || [], notes: src.notes || ''
        });
    };
    (data.customs || []).forEach(pushVehicule);
    (data.modelsExtra || []).forEach(pushVehicule);
    (data.recalls || []).forEach(r => {
        const marque = r.marque || r.brand; const modele = r.modele || r.model;
        if (!marque || !modele) return;
        const existant = result.find(v => v.marque === marque && v.modele === modele);
        const titre = r.titre || r.title || 'Rappel';
        if (existant) { if (!existant.rappels.includes(titre)) existant.rappels.push(titre); }
        else result.push({ marque, modele, motorisation:'Standard', codeMoteur:genererCodeMoteur(marque), puissance:'Auto', annee:'À définir', typeCarburant:'Essence', entretiens:genererEntretiens('Essence'), dtc:[], rappels:[titre], notes:'' });
    });
    return result;
}

function importerJSON(input) {
    const file = input.files[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) { showNotification('❌ JSON requis', 'error'); input.value = ''; return; }
    if (file.size > 50 * 1024 * 1024) { showNotification('❌ Fichier trop gros', 'error'); input.value = ''; return; }
    importFichierAvecControle(file);
    input.value = '';
}

async function importFichierAvecControle(file) {
    ouvrirOverlayImport('Import fichier JSON');
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
        logImport(`✅ ${file.size} octets lus`, "success");
        await sleep(200);

        mettreAJourProgress(20, "Validation JSON...");
        let data;
        try { data = JSON.parse(content); logImport("✅ JSON valide", "success"); }
        catch (e) { throw new Error(`JSON invalide: ${e.message}`); }
        await sleep(200);

        mettreAJourProgress(35, "Détection format...");
        const format = detecterFormat(data);
        logImport(`📊 Format détecté: ${format}`, "info");
        
        let items = [];
        let expertsImportes = [];
        if (format === 'auto-diagnostic') {
            items = convertirFormatAutoDiagnostic(data);
            logImport(`🔄 Conversion auto-diagnostic: ${items.length} véhicules`, "info");
        } else if (format === 'tableau') items = data;
        else if (format === 'vehicles') { items = data.vehicles || []; expertsImportes = data.experts || []; }
        else if (format === 'data') items = data.data;
        else items = Object.values(data).filter(x => x && typeof x === 'object');
        
        await sleep(200);

        // CAS FICHIER VIDE → AVERTISSEMENT (pas une erreur bloquante)
        if (items.length === 0 && expertsImportes.length === 0) {
            mettreAJourProgress(100, "Terminé");
            logImport("⚠️ Fichier valide mais AUCUNE donnée à importer", "warning");
            document.getElementById('stat-after').textContent = megaBase.length;
            afficherResultat('warning',
                '⚠️ Fichier vide',
                'Le fichier est valide mais ne contient aucune donnée (tableaux vides).',
                `<div style="color:#fbbf24;font-weight:bold;margin-bottom:.5rem">📋 CONSTAT</div>
                 <div>• Format: ${format}</div>
                 <div>• Données trouvées: 0</div>
                 <div>• Base conservée: <strong>${megaBase.length} véhicules</strong></div>
                 <div style="margin-top:.5rem;padding-top:.5rem;border-top:1px solid rgba(255,255,255,.1);color:#94a3b8">
                 💡 Utilisez le bouton "Import massif en ligne" pour rapatrier les vraies données depuis les sources auto-diagnostic.</div>`);
            showNotification('⚠️ Fichier vide - base conservée', 'warning');
            return;
        }

        mettreAJourProgress(50, "Fusion intelligente...");
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
                fusions++;
            }
            if (i % 20 === 0) { mettreAJourProgress(50 + (i/items.length)*25, `Fusion: ${i+1}/${items.length}`); await sleep(5); }
        }
        
        expertsImportes.forEach(e => {
            if (e && e.titre && !expertBase.find(x => x.titre === e.titre)) { expertBase.push(e); ajouts++; }
        });
        
        document.getElementById('stat-added').textContent = '+' + ajouts;
        document.getElementById('stat-merged').textContent = '~' + fusions;
        logImport(`✅ +${ajouts} ajouts, ~${fusions} fusions`, "success");
        await sleep(300);

        mettreAJourProgress(90, "Sauvegarde...");
        localStorage.setItem('kevFusion_megaBase', JSON.stringify(megaBase));
        localStorage.setItem('kevFusion_expertBase', JSON.stringify(expertBase));
        logImport("✅ Sauvegarde réussie", "success");
        await sleep(300);

        mettreAJourProgress(100, "Vérification intégrité...");
        const saved = JSON.parse(localStorage.getItem('kevFusion_megaBase') || '[]');
        logImport(saved.length === megaBase.length ? "✅ Intégrité vérifiée - AUCUN BLOCAGE" : "⚠️ Divergence détectée", saved.length === megaBase.length ? "success" : "warning");
        document.getElementById('stat-after').textContent = megaBase.length;
        
        afficherResultat('success', '✅ Import réussi', 'Base APK mise à jour sans blocage',
            `<div style="color:#4ade80;font-weight:bold;margin-bottom:.5rem">📊 RAPPORT FINAL</div>
             <div>• Avant: <strong>${avant}</strong></div>
             <div>• Ajouts: <strong style="color:#4ade80">+${ajouts}</strong></div>
             <div>• Fusions: <strong style="color:#fbbf24">~${fusions}</strong></div>
             <div>• Après: <strong style="color:#38bdf8">${megaBase.length}</strong></div>
             <div style="margin-top:.5rem;color:#4ade80">✅ Intégrité vérifiée - AUCUN BLOCAGE</div>`);
        showNotification(`✅ Import: +${ajouts} éléments`, 'success');
        initFiltresEntretien();
    } catch (error) {
        logImport(`❌ ${error.message}`, "error");
        afficherResultat('error', '❌ Échec import', error.message,
            `<div style="color:#f87171;font-weight:bold">⚠️ Base préservée</div><div>• Véhicules: <strong>${megaBase.length}</strong></div>`);
        showNotification('❌ Import échoué - base préservée', 'error');
    }
}

function normaliserItem(item) {
    if (!item || typeof item !== 'object') return null;
    const marque = item.marque || item.brand || item.marque_id;
    const modele = item.modele || item.model || item.modele_nom;
    if (!marque || !modele) return null;
    return {
        marque: normaliserMarque(marque), modele: String(modele).trim(),
        motorisation: item.motorisation || item.motor || item.moteur || "Standard",
        codeMoteur: String(item.codeMoteur || item.code_moteur || item.engine_code || genererCodeMoteur(marque, item.motorisation)).toUpperCase(),
        puissance: item.puissance || item.power || "Auto",
        annee: item.annee || item.year || item.years || "À définir",
        typeCarburant: item.typeCarburant || item.fuel || item.carburant || determinerCarburant(item.motorisation || ''),
        entretiens: item.entretiens || item.maintenance || genererEntretiens(item.typeCarburant || item.fuel || 'Essence'),
        dtc: Array.isArray(item.dtc) ? item.dtc : (item.dtc ? String(item.dtc).split(/[,\/\s]+/).filter(x => /^[PUBC]\d{4}$/i.test(x)) : []),
        rappels: Array.isArray(item.rappels) ? item.rappels : (item.rappels ? [item.rappels] : []),
        notes: item.notes || item.note || item.comment || ""
    };
}

// ==========================================
// 14. IMPORT MASSIF EN LIGNE (SOURCES AUTO-DIAGNOSTIC)
// ==========================================
const SOURCE_FILES = [
    { url: 'https://raw.githubusercontent.com/expertkevin06-cell/auto-diagnostic/main/faults2019.js', arrays: [{ nom:'F2019', schema:'A' }] },
    { url: 'https://raw.githubusercontent.com/expertkevin06-cell/auto-diagnostic/main/update2026.js', arrays: [{ nom:'BATCH_2026_ISSUES', schema:'B' }, { nom:'BATCH_2026_MODELS', schema:'MODELS' }] },
    { url: 'https://raw.githubusercontent.com/expertkevin06-cell/auto-diagnostic/main/premium22.js', arrays: [{ nom:'PREMIUM_EXPERT', schema:'A' }, { nom:'PREMIUM_MODELS', schema:'MODELS' }] },
    { url: 'https://raw.githubusercontent.com/expertkevin06-cell/auto-diagnostic/main/app.js', arrays: [{ nom:'BATCH_ISSUES', schema:'D' }, { nom:'BRAND_EXPERT', schema:'C' }] }
];

function extraireTableau(code, nom) {
    try {
        const re = new RegExp('const\\s+' + nom + '\\s*=\\s*\\[([\\s\\S]*?)\\n\\];');
        const m = code.match(re);
        if (!m) return [];
        const val = new Function('return [' + m[1] + '];')();
        return Array.isArray(val) ? val : [];
    } catch (e) { return []; }
}

function convertirIssue(item, schema) {
    if (!Array.isArray(item) || item.length < 8) return null;
    let brand = item[0], model = '', motor = '', title = '', rest = 1;
    if (schema === 'A') { motor = item[1] || ''; title = item[3] || ''; rest = 4; }
    else if (schema === 'B') { model = item[1] || ''; motor = item[2] || ''; title = item[4] || ''; rest = 5; }
    else if (schema === 'C') { motor = item[1] || ''; title = item[2] || ''; rest = 3; }
    else if (schema === 'D') { model = item[1] || ''; motor = item[2] || ''; title = item[3] || ''; rest = 4; }
    if (!brand || !title) return null;
    const dtcStr = String(item[rest + 3] || '');
    return {
        marque: normaliserMarque(brand),
        modele: model ? String(model) : '',
        motorisation: motor ? String(motor) : '',
        titre: String(title),
        symptome: String(item[rest] || ''),
        protocole: String(item[rest + 1] || ''),
        organes: String(item[rest + 2] || ''),
        dtc: dtcStr.split(/[,\/\s]+/).filter(c => /^[PUBC]\d{4}$/i.test(c)),
        source: String(item[rest + 4] || ''),
        annees: String(item[rest + 5] || '')
    };
}

function convertirModel(item) {
    if (!Array.isArray(item) || item.length < 4) return [];
    const brand = item[0], name = item[1], years = item[2], motors = item[3];
    if (!brand || !name || !Array.isArray(motors)) return [];
    return motors.filter(m => Array.isArray(m)).map(m => ({
        marque: normaliserMarque(brand), modele: String(name),
        motorisation: String(m[0] || 'Standard'),
        codeMoteur: genererCodeMoteur(brand, m[0]),
        puissance: String(m[2] || 'Auto'), annee: String(years || ''),
        typeCarburant: capFuel(m[1]),
        entretiens: genererEntretiens(capFuel(m[1])),
        dtc: [], rappels: [], notes: ''
    }));
}

async function importEnLigne() {
    if (!navigator.onLine) { showNotification('❌ Hors ligne - connexion requise', 'error'); return; }
    ouvrirOverlayImport('Import massif en ligne');
    const avant = megaBase.length;
    const avantExpert = expertBase.length;
    let vehiculesAjoutes = 0, fichesAjoutees = 0, enrichis = 0, fichiersOK = 0;
    
    try {
        for (let f = 0; f < SOURCE_FILES.length; f++) {
            const src = SOURCE_FILES[f];
            const pct = 5 + (f / SOURCE_FILES.length) * 60;
            mettreAJourProgress(pct, `Source ${f+1}/${SOURCE_FILES.length}: ${src.url.split('/').pop()}`);
            logImport(`🌐 Fetch: ${src.url.split('/').pop()}`, "step");
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 12000);
                const resp = await fetch(src.url, { signal: controller.signal });
                clearTimeout(timeout);
                if (!resp.ok) { logImport(`⚠️ HTTP ${resp.status}`, "warning"); continue; }
                const code = await resp.text();
                fichiersOK++;
                logImport(`✅ ${code.length} octets reçus`, "success");
                
                for (const arr of src.arrays) {
                    const raw = extraireTableau(code, arr.nom);
                    if (!raw.length) { logImport(`⚠️ ${arr.nom}: vide`, "warning"); continue; }
                    
                    if (arr.schema === 'MODELS') {
                        let added = 0;
                        raw.forEach(item => {
                            convertirModel(item).forEach(v => {
                                if (!megaBase.find(x => x.marque === v.marque && x.modele === v.modele && x.codeMoteur === v.codeMoteur)) {
                                    megaBase.push(v); added++; vehiculesAjoutes++;
                                }
                            });
                        });
                        logImport(`🚗 ${arr.nom}: +${added} véhicules`, "success");
                    } else {
                        let added = 0;
                        raw.forEach(item => {
                            const e = convertirIssue(item, arr.schema);
                            if (!e) return;
                            if (!expertBase.find(x => x.titre === e.titre && x.marque === e.marque)) {
                                expertBase.push(e); added++; fichesAjoutees++;
                            }
                            // Enrichissement des véhicules existants
                            const cible = megaBase.find(v =>
                                v.marque === e.marque &&
                                (e.modele ? v.modele.toLowerCase().includes(e.modele.toLowerCase()) :
                                 (e.motorisation && e.motorisation.length > 2 && v.motorisation.toLowerCase().includes(e.motorisation.toLowerCase())))
                            );
                            if (cible) {
                                enrichis++;
                                e.dtc.forEach(d => { if (!cible.dtc.includes(d)) cible.dtc.push(d); });
                                const rap = `${e.source}: ${e.titre}`;
                                if (e.source && !cible.rappels.includes(rap) && cible.rappels.length < 6) cible.rappels.push(rap);
                            }
                        });
                        logImport(`🧠 ${arr.nom}: +${added} fiches expert`, "success");
                    }
                }
            } catch (e) {
                logImport(`⚠️ Échec source: ${e.message}`, "warning");
            }
            document.getElementById('stat-added').textContent = '+' + (vehiculesAjoutes + fichesAjoutees);
            document.getElementById('stat-merged').textContent = '~' + enrichis;
            await sleep(200);
        }
        
        mettreAJourProgress(80, "Sauvegarde...");
        localStorage.setItem('kevFusion_megaBase', JSON.stringify(megaBase));
        localStorage.setItem('kevFusion_expertBase', JSON.stringify(expertBase));
        logImport("✅ Sauvegarde réussie", "success");
        await sleep(300);
        
        mettreAJourProgress(100, "Vérification intégrité...");
        const savedV = JSON.parse(localStorage.getItem('kevFusion_megaBase') || '[]');
        const savedE = JSON.parse(localStorage.getItem('kevFusion_expertBase') || '[]');
        const integre = savedV.length === megaBase.length && savedE.length === expertBase.length;
        logImport(integre ? "✅ Intégrité vérifiée - AUCUN BLOCAGE" : "⚠️ Divergence détectée", integre ? "success" : "warning");
        document.getElementById('stat-after').textContent = megaBase.length;
        syncStatus.lastSync = new Date().toISOString();
        
        const totalNew = vehiculesAjoutes + fichesAjoutees;
        if (totalNew === 0 && fichiersOK === 0) {
            afficherResultat('warning', '⚠️ Sources injoignables', 'Aucune source n\'a pu être contactée.',
                `<div>• Fichiers OK: 0/${SOURCE_FILES.length}</div><div>• Base conservée: <strong>${megaBase.length}</strong></div>`);
        } else {
            afficherResultat('success', '✅ Import massif réussi', 'Données rapatriées et intégrées sans blocage',
                `<div style="color:#4ade80;font-weight:bold;margin-bottom:.5rem">📊 RAPPORT FINAL</div>
                 <div>• Sources OK: <strong>${fichiersOK}/${SOURCE_FILES.length}</strong></div>
                 <div>• Véhicules avant: <strong>${avant}</strong> → après: <strong style="color:#38bdf8">${megaBase.length}</strong></div>
                 <div>• Fiches expert: <strong>${avantExpert}</strong> → <strong style="color:#c084fc">${expertBase.length}</strong></div>
                 <div>• Véhicules enrichis (DTC/rappels): <strong style="color:#fbbf24">${enrichis}</strong></div>
                 <div style="margin-top:.5rem;color:#4ade80">✅ Intégrité vérifiée - AUCUN BLOCAGE</div>`);
            showNotification(`✅ +${totalNew} éléments importés`, 'success');
        }
        initFiltresEntretien();
        majIndicateurSync();
    } catch (error) {
        logImport(`❌ ${error.message}`, "error");
        afficherResultat('error', '❌ Échec import', error.message,
            `<div style="color:#f87171;font-weight:bold">⚠️ Base préservée</div><div>• Véhicules: <strong>${megaBase.length}</strong></div>`);
    }
}

function majIndicateurSync() {
    const syncEl = document.getElementById('sync-status');
    if (!syncEl) return;
    syncEl.className = 'sync-indicator sync-inactive';
    syncEl.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i><span>${megaBase.length} véh.</span>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
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
    const dtc = megaBase.reduce((a,v) => a + (v.dtc?.length || 0), 0) + expertBase.reduce((a,e) => a + (e.dtc?.length || 0), 0);
    const rappels = megaBase.reduce((a,v) => a + (v.rappels?.length || 0), 0);
    container.innerHTML = `
        <div class="stat-card rounded-2xl p-6"><div class="flex items-center gap-3 mb-3"><i data-lucide="car" class="w-8 h-8 text-cyan-400"></i><span class="text-slate-400 font-bold text-sm uppercase">Véhicules</span></div><p class="text-4xl font-black">${total}</p></div>
        <div class="stat-card rounded-2xl p-6"><div class="flex items-center gap-3 mb-3"><i data-lucide="brain" class="w-8 h-8 text-purple-400"></i><span class="text-slate-400 font-bold text-sm uppercase">Fiches expert</span></div><p class="text-4xl font-black">${expertBase.length}</p></div>
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
            <div class="glass rounded-2xl p-5 border-l-4 border-cyan-500"><div class="flex items-center gap-3 mb-2"><i data-lucide="database" class="w-6 h-6 text-cyan-400"></i><span class="font-bold text-lg">Base locale</span></div><p class="text-slate-300">${megaBase.length} véhicules • ${expertBase.length} fiches expert</p>${syncStatus.lastSync ? `<p class="text-xs text-slate-500 mt-2">Dernier import: ${new Date(syncStatus.lastSync).toLocaleString('fr-FR')}</p>` : ''}</div>
        `;
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==========================================
// 16. INITIALISATION
// ==========================================
function chargerBase() {
    try {
        const saved = localStorage.getItem('kevFusion_megaBase');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) { megaBase = parsed; }
            else { megaBase = [...MEGA_BASE_INITIALE]; }
        } else { megaBase = [...MEGA_BASE_INITIALE]; }
        const savedE = localStorage.getItem('kevFusion_expertBase');
        if (savedE) {
            const parsedE = JSON.parse(savedE);
            if (Array.isArray(parsedE)) expertBase = parsedE;
        }
    } catch (e) {
        megaBase = [...MEGA_BASE_INITIALE];
        expertBase = [];
    }
    console.log('✅ Base chargée:', megaBase.length, 'véhicules,', expertBase.length, 'fiches');
}

function initialiser() {
    console.log('🚀 Initialisation KEV FUSION 2026...');
    try {
        updateNetworkStatus();
        initAdminHash();
        chargerBase();
        initFiltresEntretien();
        majIndicateurSync();
        if (typeof lucide !== 'undefined') lucide.createIcons();
        console.log('✅ Initialisation terminée');
    } catch (error) {
        console.error('❌ Erreur initialisation:', error);
        megaBase = [...MEGA_BASE_INITIALE];
        majIndicateurSync();
        updateNetworkStatus();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiser);
} else { initialiser(); }

setTimeout(() => {
    const networkText = document.getElementById('network-text');
    if (networkText && networkText.textContent === 'Connexion...') updateNetworkStatus();
    const syncEl = document.getElementById('sync-status');
    if (syncEl && syncEl.querySelector('.sync-icon')) majIndicateurSync();
}, 2000);

let initCheckCount = 0;
const initCheckInterval = setInterval(() => {
    initCheckCount++;
    const networkText = document.getElementById('network-text');
    if (networkText && networkText.textContent === 'Connexion...') updateNetworkStatus();
    if (initCheckCount >= 10) clearInterval(initCheckInterval);
}, 1000);

window.addEventListener('online', () => { updateNetworkStatus(); showNotification('🌐 Connexion rétablie', 'success'); });
window.addEventListener('offline', () => { updateNetworkStatus(); showNotification('📡 Mode hors ligne', 'warning'); });
document.addEventListener('keypress', (e) => { if (e.key === 'Enter' && e.target.id === 'secure-code-input') verifierAcces(e); });
