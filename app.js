"use strict";
window.addEventListener("error",e=>{try{const d=document.createElement("div");
d.style.cssText="position:fixed;left:8px;bottom:8px;z-index:400;max-width:90vw;background:#450a0a;color:#fecaca;border:1px solid #ef4444;border-radius:10px;padding:8px 10px;font:12px monospace";
d.textContent="ERREUR JS: "+(e.message||"inconnue");document.body.appendChild(d);setTimeout(()=>d.remove(),9000);}catch(_){}});
const NFD=s=>String(s==null?"":s).normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const norm=s=>NFD(s).toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const slug=s=>NFD(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const yy=v=>{const n=parseInt(v,10);return n<100?2000+n:n;};
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $=i=>document.getElementById(i);
const el=(t,c,h)=>{const n=document.createElement(t);if(c)n.className=c;if(h!=null)n.innerHTML=h;return n;};
const sleep=m=>new Promise(r=>setTimeout(r,m));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const uniq=a=>[...new Set(a)];
const nf=n=>Number(n).toLocaleString("fr-FR");
const kw=h=>Math.round(h/1.35962);
const moT=m=>{if(!m)return"—";const y=Math.floor(m/12),r=m%12;return (y?y+" ans":"")+(y&&r?" ":"")+(r?r+" mois":"");};
const dtT=t=>new Date(t).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"});
const csv=s=>String(s||"").split(",").map(x=>x.trim()).filter(Boolean);
function hl(t,q){t=String(t==null?"":t);if(!q)return esc(t);const a=NFD(t).toLowerCase(),b=NFD(q).toLowerCase(),i=a.indexOf(b);
if(i<0||!b)return esc(t);return esc(t.slice(0,i))+"<mark>"+esc(t.slice(i,i+b.length))+"</mark>"+esc(t.slice(i+b.length));}
function alias(n){const s=norm(n),x=[];if(s.includes("skoda"))x.push("skoda");if(s.includes("citroen"))x.push("citroen");
if(s.includes("ds automobiles"))x.push("ds");if(s.includes("lynk"))x.push("lynk co");if(s.includes("mercedes"))x.push("mercedes benz mb");
if(s.includes("alfa"))x.push("alfa");if(s.includes("land"))x.push("landrover");return x.join(" ");}
function spec(e){const code=String(e.code||"").toUpperCase(),ev=e.fuel==="EV";
const b=(String(e.tech||"").match(/([\d]+[,.]?[\d]*)\s*kWh/i)||[])[1],kwh=b?parseFloat(String(b).replace(",",".")):null;
if(ev){let a=["Synchrone aimants permanents",400,"Plateforme EV"];for(const r of EVA)if(r[0].test(code)){a=[r[1],r[2],r[3]];break;}
const v=(String(e.tech||"").match(/(400|800)\s*V/i)||[])[1];
return{ev:1,kwh,arch:a[0],volt:v?+v:a[1],plat:a[2],disp:null,cyl:null,lay:e.hp>350?"Double moteur AWD":"Moteur unique",feed:"Électrique · onduleur triphasé",dist:"Réducteur rapport fixe",tq:null,exact:1};}
let s=null;for(const r of ENG)if(r[0].test(code)){s=r;break;}
const fl=(String(e.fam||"").match(/(\d[.,]\d)/)||[])[1],nom=fl?Math.round(parseFloat(fl.replace(",","."))*1000):null;
const disp=s?s[1]:nom,cyl=s?s[2]:(disp?(disp<1300?3:disp<2600?4:disp<3400?6:8):null);
const k1=slug(String(e.code||"").split(/[^A-Za-z0-9-]/)[0])+"|"+e.hp,k2=slug(e.fam)+"|"+e.hp;
return{ev:0,kwh:null,disp,exact:!!s,cyl,lay:s?s[3]:(cyl?cyl+" en ligne":"—"),feed:s?s[4]:(e.fuel==="D"?"Diesel common rail":"Essence injection"),
dist:s?s[5]:(/chaîne|chaine/i.test(e.tech||"")?"Chaîne":/courroie/i.test(e.tech||"")?"Courroie":"—"),tq:TQ[k1]||TQ[k2]||null};}
function famL(e){const s=spec(e);if(s.ev)return s.kwh?`Électrique ${String(s.kwh).replace(".",",")} kWh`:"Électrique";
const L=s.disp?(s.disp/1000).toFixed(1).replace(".",",")+" ":"";
return (L+String(e.fam||"").replace(/^\d[.,]\d\s*/,"").replace(/\s*\d{2,4}\s*ch/i,"").trim()).trim()||e.fam;}
function famM(e){const s=spec(e);return s.ev?`${s.kwh?s.kwh+" kWh · ":""}${s.volt} V · ${s.plat}`:`${s.disp?s.disp+" cm³":"cyl. n.c."}${s.cyl?" · "+s.cyl+" cyl.":""} · ${FUEL[e.fuel]}`;}
function build(raw){return raw.map(b=>({id:b[0],name:b[1],country:b[2],models:b[3].map(m=>{
const engs=[];String(m[5]).split(";").filter(Boolean).forEach(f=>{const p=f.split("|");
const fam=p[0],code=p[2]||"—",fuel=p[3]||"E",yr=(p[4]||"17-27").split("-"),tech=p[5]||"";
const y0=yy(yr[0]),y1=yy(yr[1]||yr[0]);
String(p[1]||"").split(",").filter(Boolean).forEach((h,i)=>{const q=h.split(":");const hp=+q[0]||0;const kwh=q[1];
const t=tech+(kwh?(tech?" · ":"")+kwh+" kWh":"");
const o={key:b[0]+"/"+m[0]+"/"+slug(fam)+"/"+hp+"/"+i,fam,famKey:slug(fam),hp,code,fuel,
y0:Math.max(y0,m[2]),y1:Math.min(y1,m[3]),tech:t,brand:b[0],brandName:b[1],model:m[0],modelName:m[1],seg:m[4],my0:m[2],my1:m[3]};
const sp=spec(o);o.gk=o.famKey+(sp.ev?"|"+(sp.kwh||""):"");o.disp=sp.ev?sp.kwh:sp.disp;engs.push(o);});});
return{id:m[0],name:m[1],y0:m[2],y1:m[3],seg:m[4],brand:b[0],brandName:b[1],engines:engs};})}));}
const LS={db:"kf.db.v11",aux:"kf.aux.v11",acc:"kf.acc.v11",nf:"kf.nf.v11",dev:"kf.dev.v11",ses:"kf.ses.v11"};
let CAT=[],FAULTS=[],REVC=[],NOTES={},VIEWS=[],BK=[],TIERS=[],NOTIF=[],AUDIT=null;
let ROLE=null,DEVICE="",admTimer=null,admHash=null,CO={},openC=null,seenPend=new Set(),lastTierSig="",waitMode=false;
let SEL={brand:"",model:"",year:"",fam:"",hp:""};
let FIL={q:"",sev:new Set(),kind:"",sort:"sev",bs:true,rules:true,done:false,dom:new Set()};
let USE={km:15000,sev:"normal",clim:"tempere"};
let CUI={q:"",sort:"brand",dir:1,page:0,size:40,sel:new Set()};
let FSEL=new Set(),revQ="";
const canW=()=>ROLE==="admin";
const engines=()=>{const o=[];CAT.forEach(b=>b.models.forEach(m=>m.engines.forEach(e=>o.push(e))));return o;};
const B=id=>CAT.find(b=>b.id===id);
const M=(b,m)=>{const x=B(b);return x?x.models.find(y=>y.id===m):null;};
const ov=(a,b,c,d)=>a<=d&&c<=b;
const allRevs=()=>RV.concat(REVC);
function saveDB(){try{localStorage.setItem(LS.db,JSON.stringify({cat:CAT,faults:FAULTS,revs:REVC,v:11}));return 1}catch(e){return 0}}
function loadDB(){try{const d=JSON.parse(localStorage.getItem(LS.db)||"null");if(d&&d.v===11&&Array.isArray(d.cat)&&d.cat.length){CAT=d.cat;FAULTS=d.faults||[];REVC=d.revs||[];return 1}}catch(e){}return 0}
function saveAux(){try{localStorage.setItem(LS.aux,JSON.stringify({notes:NOTES,views:VIEWS,bk:BK}))}catch(e){}}
function loadAux(){try{const d=JSON.parse(localStorage.getItem(LS.aux)||"{}");NOTES=d.notes||{};VIEWS=d.views||[];BK=d.bk||[]}catch(e){NOTES={};VIEWS=[];BK=[]}}
function saveAcc(){try{localStorage.setItem(LS.acc,JSON.stringify(TIERS));ping()}catch(e){}}
function loadAcc(){try{TIERS=JSON.parse(localStorage.getItem(LS.acc)||"[]")||[]}catch(e){TIERS=[]}}
function saveNf(){try{localStorage.setItem(LS.nf,JSON.stringify(NOTIF.slice(0,60)));ping()}catch(e){}}
function loadNf(){try{NOTIF=JSON.parse(localStorage.getItem(LS.nf)||"[]")||[]}catch(e){NOTIF=[]}}
function resetSeed(){CAT=build(RAW);FAULTS=FR.map(f=>Object.assign({},f));REVC=[];saveDB()}
let BC=null;try{BC=new BroadcastChannel("kf26")}catch(e){}
function ping(){try{BC&&BC.postMessage({t:"s"})}catch(e){}}
function toast(m,t="in",undo){const box=$("toasts");if(!box)return;
const ic={ok:"i-check",ba:"i-warn",wa:"i-warn",in:"i-info",te:"i-user"}[t]||"i-info";
const n=el("div","to "+t,`<svg class="ic"><use href="#${ic}"/></svg><div style="flex:1;min-width:0">${esc(m)}</div>`);
if(undo){const b=el("button","ud","Annuler");b.onclick=()=>{undo();n.remove()};n.appendChild(b)}
box.appendChild(n);setTimeout(()=>{n.classList.add("ou");setTimeout(()=>n.remove(),260)},undo?7000:4200);}
function notify(type,txt,meta){NOTIF.unshift({id:"N"+Date.now()+Math.random().toString(36).slice(2,5),type,txt,meta:meta||"",ts:Date.now(),read:false});saveNf();renderBell()}
class Combo{
constructor(host,ph,cb){this.h=host;this.ph=ph;this.cb=cb;this.items=[];this.value="";this.dis=true;this.sig="";
host.innerHTML="";this.btn=el("button","cb");this.btn.type="button";this.btn.setAttribute("role","combobox");this.btn.setAttribute("aria-haspopup","listbox");this.btn.setAttribute("aria-expanded","false");
this.clr=el("span","ccl",'<svg class="ic"><use href="#i-x"/></svg>');this.clr.setAttribute("role","button");this.clr.title="Effacer";
host.appendChild(this.btn);host.appendChild(this.clr);
this.btn.onclick=()=>this.toggle();this.clr.onclick=e=>{e.stopPropagation();this.pick("")};
this.btn.onkeydown=e=>{if(["ArrowDown","Enter"," "].includes(e.key)){e.preventDefault();this.open()}};this.render()}
set(items,value,dis){const sig=JSON.stringify(items.map(i=>[i.v,i.t,i.m,i.b]))+"|"+value+"|"+!!dis;
if(sig===this.sig)return;this.sig=sig;this.items=items;this.value=value||"";this.dis=!!dis;this.render();if(openC===this)this.fill()}
cur(){return this.items.find(i=>String(i.v)===String(this.value))}
render(){const c=this.cur();this.h.dataset.filled=this.value?"1":"0";this.btn.disabled=this.dis;
this.btn.innerHTML=(c?`<span class="cv">${esc(c.t)}</span>${c.m?`<span class="cm">${esc(c.m)}</span>`:""}`:`<span class="ph">${esc(this.ph)}</span>`)+'<svg class="ic cv2"><use href="#i-chev"/></svg>'}
toggle(){openC===this?this.close():this.open()}
open(){if(this.dis)return;if(openC&&openC!==this)openC.close();openC=this;this.h.dataset.open="1";this.btn.setAttribute("aria-expanded","true");
const L=$("cL");L.innerHTML="";this.pop=el("div","cp");
const sb=el("div","cps");this.inp=el("input");this.inp.type="search";this.inp.placeholder="Filtrer sans accent…";this.inp.autocomplete="off";sb.appendChild(this.inp);
this.list=el("div","cpl");this.list.setAttribute("role","listbox");this.foot=el("div","cpf");
this.pop.append(sb,this.list,this.foot);L.appendChild(this.pop);this.pop.style.pointerEvents="auto";this.place();this.fill();
this.inp.oninput=()=>this.fill();this.inp.onkeydown=e=>this.key(e);
if(this.items.length<=7)sb.style.display="none";
setTimeout(()=>{if(this.items.length>7)this.inp.focus()},30);
this._o=e=>{if(this.pop&&!this.pop.contains(e.target)&&!this.h.contains(e.target))this.close()};
setTimeout(()=>document.addEventListener("pointerdown",this._o),0);
this._r=()=>this.place();window.addEventListener("scroll",this._r,true);window.addEventListener("resize",this._r)}
place(){if(!this.pop)return;const r=this.btn.getBoundingClientRect(),w=Math.min(Math.max(r.width,240),window.innerWidth-16);
const below=window.innerHeight-r.bottom-12,up=below<200&&r.top>below,h=Math.min(340,Math.max(160,up?r.top-12:below));
this.pop.style.width=w+"px";this.pop.style.left=clamp(r.left,8,window.innerWidth-w-8)+"px";this.pop.style.maxHeight=h+"px";
if(up){this.pop.style.top="auto";this.pop.style.bottom=(window.innerHeight-r.top+6)+"px"}else{this.pop.style.bottom="auto";this.pop.style.top=(r.bottom+6)+"px"}}
fill(){const q=this.inp.value||"",nq=norm(q);
let a=this.items.map(i=>{const hay=norm(i.t+" "+(i.m||"")+" "+(i.b||"")+" "+(i.a||""));if(!nq)return{i,s:0};
const nt=norm(i.t+" "+(i.a||""));return hay.includes(nq)?{i,s:nt.startsWith(nq)?0:nt.includes(nq)?1:2}:null}).filter(Boolean);
a.sort((x,y)=>x.s-y.s);a=a.map(x=>x.i);this.view=a;this.idx=Math.max(0,a.findIndex(i=>String(i.v)===String(this.value)));
this.list.innerHTML=a.length?"":'<div class="cpe">Aucun résultat — essayez sans accent</div>';
a.forEach((i,n)=>{const d=el("div","co"+(n===this.idx?" cu":""));d.setAttribute("role","option");d.setAttribute("aria-selected",String(String(i.v)===String(this.value)));
d.innerHTML=`<svg class="ic tk"><use href="#i-check"/></svg><div class="ol"><div class="ot">${hl(i.t,q)}</div>${i.m?`<div class="om">${hl(i.m,q)}</div>`:""}</div>${i.b?`<span class="ob">${esc(i.b)}</span>`:""}`;
d.onmouseenter=()=>{this.idx=n;this.hi()};d.onclick=()=>this.pick(i.v);this.list.appendChild(d)});
this.foot.innerHTML=`<span>${a.length} / ${this.items.length}</span><span>↑↓ · Entrée · Échap</span>`;
const c=this.list.children[this.idx];if(c&&c.scrollIntoView)c.scrollIntoView({block:"nearest"})}
hi(){[...this.list.children].forEach((c,n)=>c.classList.toggle("cu",n===this.idx))}
key(e){if(e.key==="Escape"){e.preventDefault();this.close();this.btn.focus()}
else if(e.key==="ArrowDown"){e.preventDefault();this.idx=Math.min(this.view.length-1,this.idx+1);this.hi();this.list.children[this.idx]?.scrollIntoView({block:"nearest"})}
else if(e.key==="ArrowUp"){e.preventDefault();this.idx=Math.max(0,this.idx-1);this.hi();this.list.children[this.idx]?.scrollIntoView({block:"nearest"})}
else if(e.key==="Enter"){e.preventDefault();const i=this.view[this.idx];if(i)this.pick(i.v)}
else if(e.key==="Home"){e.preventDefault();this.idx=0;this.hi()}else if(e.key==="End"){e.preventDefault();this.idx=this.view.length-1;this.hi()}}
pick(v){this.close();this.cb(String(v))}
close(){if(openC!==this)return;openC=null;this.h.dataset.open="0";this.btn.setAttribute("aria-expanded","false");
document.removeEventListener("pointerdown",this._o);window.removeEventListener("scroll",this._r,true);window.removeEventListener("resize",this._r);
$("cL").innerHTML="";this.pop=null}}
const modelsOf=(b,y)=>{const x=B(b);return x?x.models.filter(m=>!y||m.engines.some(e=>e.y0<=+y&&e.y1>=+y)).sort((a,c)=>norm(a.name).localeCompare(norm(c.name))):[]};
function yearsOf(b,m){const x=M(b,m);if(!x)return[];const s=new Set();x.engines.forEach(e=>{for(let y=Math.max(e.y0,YMIN);y<=Math.min(e.y1,YMAX);y++)s.add(y)});return[...s].sort((a,c)=>c-a)}
function famsOf(b,m,y){const x=M(b,m);if(!x)return[];const map=new Map();
x.engines.filter(e=>!y||(e.y0<=+y&&e.y1>=+y)).forEach(e=>{if(!map.has(e.gk))map.set(e.gk,{k:e.gk,e,hp:new Set()});map.get(e.gk).hp.add(e.hp)});
return[...map.values()].sort((a,c)=>norm(famL(a.e)).localeCompare(norm(famL(c.e))))}
const hpsOf=(b,m,y,g)=>{const x=M(b,m);return x?x.engines.filter(e=>(!y||(e.y0<=+y&&e.y1>=+y))&&(!g||e.gk===g)).sort((a,c)=>a.hp-c.hp):[]};
function resolved(){if(!SEL.brand)return[];let l=engines().filter(e=>e.brand===SEL.brand);
if(SEL.model)l=l.filter(e=>e.model===SEL.model);if(SEL.year)l=l.filter(e=>e.y0<=+SEL.year&&e.y1>=+SEL.year);
if(SEL.fam)l=l.filter(e=>e.gk===SEL.fam);if(SEL.hp)l=l.filter(e=>e.hp===+SEL.hp);return l}
const ready=()=>!!(SEL.brand&&SEL.model&&SEL.fam&&SEL.hp);
function sync(){
const bs=CAT.slice().sort((a,b)=>norm(a.name).localeCompare(norm(b.name))).map(b=>({v:b.id,t:b.name,m:`${b.models.length} modèles · ${b.models.reduce((a,m)=>a+m.engines.length,0)} motorisations`,b:b.country,a:alias(b.name)}));
CO.brand.set(bs,SEL.brand,false);
const ms=SEL.brand?modelsOf(SEL.brand,SEL.year).map(m=>({v:m.id,t:m.name,m:`${m.y0}–${m.y1} · ${m.seg} · ${m.engines.length} motorisations`})):[];
if(SEL.model&&!ms.some(m=>m.v===SEL.model))SEL.model="";
CO.model.set(ms,SEL.model,!SEL.brand);
const ys=SEL.model?yearsOf(SEL.brand,SEL.model).map(y=>({v:String(y),t:String(y),m:M(SEL.brand,SEL.model).engines.filter(e=>e.y0<=y&&e.y1>=y).length+" motorisation(s)"})):[];
if(SEL.year&&!ys.some(y=>y.v===SEL.year))SEL.year="";
CO.year.set(ys,SEL.year,!SEL.model);
const fs=SEL.model?famsOf(SEL.brand,SEL.model,SEL.year).map(f=>{const h=[...f.hp].sort((a,b)=>a-b);
return{v:f.k,t:famL(f.e),m:famM(f.e),b:h.length>1?h[0]+"–"+h[h.length-1]+" ch":h[0]+" ch"}}):[];
if(SEL.fam&&!fs.some(f=>f.v===SEL.fam)){SEL.fam="";SEL.hp=""}
CO.fam.set(fs,SEL.fam,!SEL.model);
const hs=[],seen=new Set();
(SEL.model?hpsOf(SEL.brand,SEL.model,SEL.year,SEL.fam):[]).forEach(e=>{const s=spec(e);
const o={v:String(e.hp),t:e.hp+" ch",m:`${kw(e.hp)} kW${s.tq?" · "+s.tq+" N·m":""} · ${e.code}`,b:s.ev?(s.kwh?s.kwh+" kWh":"EV"):FUEL[e.fuel]};
const k=o.v+o.m;if(!seen.has(k)){seen.add(k);hs.push(o)}});
if(SEL.hp&&!hs.some(h=>h.v===SEL.hp))SEL.hp="";
CO.hp.set(hs,SEL.hp,!SEL.model);
[["s1",SEL.brand],["s2",SEL.model],["s3",SEL.year],["s4",SEL.fam],["s5",SEL.hp]].forEach(([id,v])=>{const n=$(id);if(n)n.classList.toggle("dn",!!v)});
const n=resolved().length,st=$("beState");
if(!SEL.brand){st.className="ch";st.textContent="Aucune sélection"}
else{st.className="ch "+(n?"ok":"wa");st.textContent=ready()?`${n} motorisation corrélée`:(n?`${n} motorisation(s) — affinez`:"Combinaison sans moteur")}
st.style.height="24px";st.style.fontSize="10.5px";
const b=B(SEL.brand),m=SEL.brand&&SEL.model?M(SEL.brand,SEL.model):null;
const f=SEL.fam&&m?famsOf(SEL.brand,SEL.model,SEL.year).find(x=>x.k===SEL.fam):null;
$("beHint").textContent=[b?b.name:null,m?m.name:null,SEL.year||null,f?famL(f.e):null,SEL.hp?SEL.hp+" ch":null].filter(Boolean).join(" › ")||"Recherche sans accent — tapez « skoda »";
const dl=$("brandList");if(dl&&!dl.children.length)dl.innerHTML=CAT.map(b=>`<option value="${esc(b.name)}">`).join("");}
function newSearch(){Object.values(CO).forEach(c=>c.close());SEL={brand:"",model:"",year:"",fam:"",hp:""};FSEL.clear();
FIL.q="";$("q").value="";FIL.sev.clear();FIL.kind="";FIL.sort="sev";FIL.dom.clear();
$("selKind").value="";$("selSort").value="sev";$("sevSeg").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed","false"));
sync();renderDom();renderAll();toast("Champs vidés — nouvelle recherche","ok");window.scrollTo({top:0,behavior:"smooth"})}
function hits(f,e){if(f.y1<e.y0||f.y0>e.y1)return false;if(f.scope==="rule")return true;
if(!f.brands.includes(e.brand))return false;
if(f.scope==="brand")return FIL.bs;
if(f.scope==="model")return csv(f.target).includes(e.model);
if(f.scope==="engine")return slug(f.target)===e.famKey;return false}
function rules(e){return DR.filter(r=>!e||!r[9]||r[9](e,spec(e))).map(r=>({id:r[0],scope:"rule",brands:[],target:"",kind:r[2],sev:r[3],
y0:YMIN,y1:YMAX,titre:r[4],sym:r[5],pro:String(r[6]).split("|"),org:r[7],dtc:csv(r[8]),src:"Protocole atelier transversal",dom:r[1],rule:1}))}
function pool(strict){const eng=resolved();
if(strict&&!ready())return[];
let out=[];
if(eng.length){const s=new Set();FAULTS.forEach(f=>{if(eng.some(e=>hits(f,e))&&!s.has(f.id)){s.add(f.id);out.push(f)}});
if(FIL.rules){const r=new Set();eng.forEach(e=>rules(e).forEach(x=>{if(!r.has(x.id)){r.add(x.id);out.push(x)}}))}}
else if(SEL.brand){out=FAULTS.filter(f=>f.brands.includes(SEL.brand)&&(f.scope!=="brand"||FIL.bs));if(FIL.rules)out=out.concat(rules(null))}
else{out=FAULTS.slice();if(FIL.rules)out=out.concat(rules(null))}
return out}
function apply(list){let o=list.slice();const q=norm(FIL.q);
if(q.length>=2){const t=q.split(/\s+/);o=o.filter(f=>{const h=norm([f.titre,f.sym,f.org,f.src,KIND[f.kind],(f.dtc||[]).join(" "),f.pro.join(" "),(f.dom||[]).map(d=>DM[d]?DM[d].n+" "+d:"").join(" ")].join(" "));return t.every(x=>h.includes(x))})}
if(FIL.sev.size)o=o.filter(f=>FIL.sev.has(f.sev));
if(FIL.kind)o=o.filter(f=>f.kind===FIL.kind);
if(FIL.dom.size)o=o.filter(f=>(f.dom||[]).some(d=>FIL.dom.has(d)));
if(!FIL.done)o=o.filter(f=>!(NOTES[f.id]&&NOTES[f.id].done));
const s=FIL.sort;
o.sort((a,b)=>s==="sev"?SEV[a.sev].r-SEV[b.sev].r||b.y1-a.y1:s==="year"?b.y1-a.y1||SEV[a.sev].r-SEV[b.sev].r:
s==="alpha"?norm(a.titre).localeCompare(norm(b.titre)):s==="src"?norm(a.src).localeCompare(norm(b.src)):0);
return o}
const current=()=>apply(pool(false));
const strictCur=()=>apply(pool(true));
function domPills(f){return (f.dom||[]).slice(0,5).map(d=>{const m=DM[d];if(!m)return"";
return `<span class="pl" style="border-color:var(--${m.c});color:var(--${CV[m.c]})"><svg class="ic"><use href="#${m.i}"/></svg>${esc(m.n)}</span>`}).join("")}
function fCard(f,chk){const dn=NOTES[f.id]&&NOTES[f.id].done;const d=el("div","fc v-"+f.sev+(dn?" dn":""));d.tabIndex=0;d.setAttribute("role","button");
d.innerHTML=`<div class="fh">${chk?`<span class="fk" role="checkbox" aria-checked="${FSEL.has(f.id)}" tabindex="0"><svg class="ic"><use href="#i-check"/></svg></span>`:""}<div class="ft">${esc(f.titre)}</div></div>
<div class="fm"><span class="pl ${KC[f.kind]}">${KIND[f.kind]}</span><span class="pl ${SC[f.sev]}">${SEV[f.sev].n}</span><span class="pl">${f.y0}–${f.y1}</span>
<span class="pl${f.scope==="engine"?" mx":""}">${f.scope==="engine"?"Moteur exact":f.scope==="model"?"Modèle":f.scope==="rule"?"Technologie":"Marque"}</span>
${dn?'<span class="pl" style="color:var(--gr);border-color:rgba(74,222,128,.4)">Traitée</span>':""}</div>
<div class="fm">${domPills(f)}</div><div class="fs">${esc(f.sym)}</div>
${f.dtc.length?`<div class="dr">${f.dtc.map(c=>`<span class="dtc">${esc(c)}</span>`).join("")}</div>`:""}
<div class="fsr"><svg class="ic"><use href="#i-link"/></svg>${esc(f.src)}${NOTES[f.id]&&NOTES[f.id].txt?' · <span style="color:var(--cy)">note</span>':""}</div>`;
const open=e=>{if(e.target.closest(".fk"))return;openF(f)};
d.onclick=open;d.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open(e)}};
if(chk){const c=d.querySelector(".fk");const tg=e=>{e.stopPropagation();FSEL.has(f.id)?FSEL.delete(f.id):FSEL.add(f.id);renderFaults()};
c.onclick=tg;c.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();tg(e)}}}
return d}
const ey=(i,t,x)=>`<div class="ey"><svg class="ic"><use href="#${i}"/></svg><h3 style="margin-bottom:6px">${esc(t)}</h3><p>${x}</p></div>`;
function vehCard(){if(!SEL.brand)return"";const eng=resolved(),b=B(SEL.brand),m=SEL.model?M(SEL.brand,SEL.model):null,e=eng[0];
const all=strictCur(),crit=all.filter(f=>f.sev==="critique").length,s=e?spec(e):null;
const title=[b?b.name:"",m?m.name:""].filter(Boolean).join(" ");
const sub=e?`${famL(e)} · ${e.hp} ch (${kw(e.hp)} kW) · ${e.code}`:(m?`${m.engines.length} motorisations`:`${b.models.length} modèles`);
return `<div class="vc"><div class="vb">${esc((b?b.name:"?").slice(0,3).toUpperCase())}<br><span style="font-size:9px;color:var(--m2)">${esc(b?b.country:"")}</span></div>
<div style="min-width:0"><div class="vt">${esc(title)}${SEL.year?` <span style="color:var(--cy);font-size:.7em">(${SEL.year})</span>`:""}</div>
<div class="mo" style="font-size:13px;color:var(--cy);margin-top:4px">${esc(sub)}</div>
<div class="vm">${e?`<span class="tg f${e.fuel}">${FUEL[e.fuel]}</span>`:""}${e?`<span class="tg mo">${esc(e.code)}</span>`:""}
${s&&!s.ev&&s.disp?`<span class="tg mo">${s.disp} cm³</span>`:""}${s&&!s.ev&&s.cyl?`<span class="tg">${s.cyl} cyl.</span>`:""}
${s&&s.ev&&s.kwh?`<span class="tg mo">${s.kwh} kWh</span>`:""}${s&&s.ev?`<span class="tg mo">${s.volt} V</span>`:""}
${m?`<span class="tg">${esc(m.seg)}</span>`:""}${m?`<span class="tg mo">${m.y0}–${m.y1}</span>`:""}
${e?`<span class="tg mo">moteur ${e.y0}–${e.y1}</span>`:""}${eng.length>1?`<span class="tg" style="color:var(--amH);border-color:rgba(245,158,11,.4)">${eng.length} variantes</span>`:""}</div></div>
<div class="vs"><div class="vst"><b style="color:${crit?"var(--rd)":"var(--gr)"}">${crit}</b><span>Critiques</span></div>
<div class="vst"><b style="color:var(--amH)">${all.length}</b><span>Fiches</span></div>
<div class="vst"><b style="color:var(--cy)">${eng.length}</b><span>Moteurs</span></div></div></div>`}
function specPanel(){const eng=resolved();if(!SEL.brand||!eng.length)return"";
if(!SEL.fam||!SEL.hp){const rows=eng.slice().sort((a,b)=>a.hp-b.hp);
return `<div class="pn pd rv" style="margin-bottom:16px"><div class="sh"><div class="si ic-te"><svg class="ic"><use href="#i-piston"/></svg></div>
<div><h2>Motorisations réelles du modèle</h2><div class="sb">${rows.length} variante(s) — sélectionnez une cylindrée puis une puissance</div></div></div>
<div class="tw"><table style="min-width:660px"><thead><tr><th>Cylindrée · type</th><th>cm³ / kWh</th><th>Architecture</th><th>Puissance</th><th>Couple</th><th>Code</th><th>Années</th><th></th></tr></thead><tbody>
${rows.map(e=>{const s=spec(e);return `<tr><td class="tn">${esc(famL(e))}<div class="mi">${esc(FUEL[e.fuel])} · ${esc(s.feed)}</div></td>
<td class="mo" style="color:var(--amH)">${s.ev?(s.kwh?s.kwh+" kWh":"—"):(s.disp||"—")}</td><td class="mi">${esc(s.ev?s.plat:s.lay)}</td>
<td class="mo" style="color:var(--rd);font-weight:800">${e.hp} ch<div class="mi">${kw(e.hp)} kW</div></td>
<td class="mo" style="color:var(--gr)">${s.tq?s.tq+" N·m":"—"}</td><td class="mo">${esc(e.code)}</td><td class="mo">${e.y0}–${e.y1}</td>
<td><button class="bt sm" data-eng="${esc(e.key)}"><svg class="ic"><use href="#i-eye"/></svg></button></td></tr>`}).join("")}</tbody></table></div></div>`}
const e=eng[0],s=spec(e);
const it=s.ev?[["kb","Batterie utile",(s.kwh?s.kwh+" kWh":"n.c."),"Plateforme : "+s.plat],["ka","Architecture HV",s.volt+" V",s.volt>=800?"Charge ultra-rapide DC":"Charge DC standard"],
["kp","Puissance",e.hp+" ch",kw(e.hp)+" kW"],["ka","Moteur électrique",s.arch,s.lay],["","Transmission",s.dist,"Rapport fixe"],["kd","Code moteur",e.code,"Production "+e.y0+"–"+e.y1]]
:[["kd","Cylindrée",(s.disp?s.disp+" cm³":"n.c."),(s.disp?(s.disp/1000).toFixed(1).replace(".",",")+" L":"")+(s.exact?" · exact":" · nominal")],
["ka","Architecture",s.lay,s.cyl?s.cyl+" cylindres":""],["","Type moteur",famL(e),FUEL[e.fuel]],["","Alimentation",s.feed,""],
["kt","Couple maxi",s.tq?s.tq+" N·m":"non renseigné",s.tq?"valeur constructeur":"à confirmer au VIN"],["kp","Puissance",e.hp+" ch",kw(e.hp)+" kW"],
["","Distribution",s.dist,/humide/i.test(s.dist)?"⚠ courroie en bain d'huile":""],["kd","Code moteur",e.code,"Production "+e.y0+"–"+e.y1]];
return `<div class="pn pd rv" style="margin-bottom:16px"><div class="sh"><div class="si ic-te"><svg class="ic"><use href="#${s.ev?"i-batt":"i-piston"}"/></svg></div>
<div><h2>Fiche moteur — ${esc(famL(e))} ${e.hp} ch</h2><div class="sb">${esc(e.brandName)} ${esc(e.modelName)} · ${esc(e.code)} · ${esc(e.tech||"—")}</div></div></div>
<div class="spec">${it.map(([k,a,b,c])=>`<div class="spi ${k}"><div class="sk">${esc(a)}</div><div class="sv2">${esc(b)}</div>${c?`<div class="sd">${esc(c)}</div>`:""}</div>`).join("")}</div>
${!s.ev&&/humide/i.test(s.dist)?'<div class="nt wa" style="margin-top:12px"><b>Distribution en bain d\'huile.</b> Contrôle de la largeur au gabarit et inspection de la crépine à chaque entretien.</div>':""}
${s.ev?'<div class="nt in" style="margin-top:12px"><b>Véhicule électrique.</b> Aucun entretien moteur thermique : batterie HV, liquide pack, réducteur et freinage.</div>':""}</div>`}
function bindEng(r){if(!r)return;r.querySelectorAll("[data-eng]").forEach(b=>b.onclick=()=>{const e=engines().find(x=>x.key===b.dataset.eng);if(e)loadEng(e)})}
function revsFor(e){const s=spec(e),hay=norm(e.fam+" "+e.code+" "+(e.tech||"")+" "+s.feed);
return allRevs().filter(r=>{if(!r.brands.includes(e.brand))return false;if(!ov(r.y0,r.y1,e.y0,e.y1))return false;if(!r.match)return true;
let re;try{re=new RegExp(r.match,"i")}catch(_){return norm(r.match).split(/\s+/).every(t=>hay.includes(t))}
if(re.test(e.fam)||re.test(e.code)||re.test(e.tech||""))return true;
return norm(r.match).replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter(t=>t.length>2).some(t=>hay.includes(t))})}
function revCard(r,e){const dk=r.oldKm?Math.round((r.newKm-r.oldKm)/r.oldKm*100):null,dm=r.oldMo?Math.round((r.newMo-r.oldMo)/r.oldMo*100):null;
const yrs=e&&r.newKm?Math.round(r.newKm/USE.km*10)/10:null;
return `<div class="rc"><div class="rh"><div class="si ic-mg" style="width:30px;height:30px"><svg class="ic"><use href="#i-clock"/></svg></div>
<div style="flex:1;min-width:0"><h3 style="font-size:14.5px">${esc(r.organ)}</h3>
<div class="mi">${esc(r.brands.map(b=>{const x=B(b);return x?x.name:b}).join(" · "))}${r.match?" · "+esc(r.match.replace(/\\\./g,".").replace(/\|/g," / ")):""}</div></div>
${dk!==null?`<span class="dl ${dk>0?"up":""}">${dk>0?"+":""}${dk} % km</span>`:""}${dm!==null&&dm!==dk?`<span class="dl ${dm>0?"up":""}">${dm>0?"+":""}${dm} % temps</span>`:""}</div>
<div class="rns"><div class="rn ol"><div class="rl">Ancien</div><div class="rv2">${r.oldKm?nf(r.oldKm)+" km":"sans échéance"}</div><div class="mi">${r.oldMo?moT(r.oldMo):"—"}</div></div>
<span class="arw">→</span><div class="rn nw"><div class="rl">Révisé</div><div class="rv2">${nf(r.newKm)} km</div><div class="mi">${r.newMo?moT(r.newMo):"—"}</div></div>
${yrs?`<div class="rn"><div class="rl">À ${nf(USE.km)} km/an</div><div class="rv2" style="color:var(--cy)">${String(yrs).replace(".",",")} ans</div><div class="mi">échéance km</div></div>`:""}</div>
<div class="nt mg" style="margin-top:11px;font-size:12px"><b>${esc(r.src)}.</b> ${esc(r.note)} <b>Confirmer au VIN.</b></div></div>`}
function planFor(e){const s=spec(e),rv=revsFor(e),f=USE.sev==="severe"?0.6:USE.sev==="mixte"?0.8:1;
let base=s.ev?[30000,60000,90000,120000,160000]:[15000,30000,60000,90000,120000,160000];
base=base.map(k=>Math.max(5000,Math.round(k*f/5000)*5000));
const rk=rv.map(r=>r.newKm).filter(k=>k>0&&k<=200000);
const steps=[...new Set([...base,...rk])].sort((a,b)=>a-b).filter(k=>k<=200000);
const wet=/humide/i.test(s.dist),chain=/chaîne|chaine/i.test(s.dist),ev=s.ev,hy=e.fuel==="H"||e.fuel==="P";
const scr=/scr|adblue/i.test((e.tech||"")+" "+s.feed),gpf=/gpf/i.test(e.tech||""),die=e.fuel==="D";
return steps.map((km,i)=>{const ops=[];const add=(t,c,r)=>ops.push({t:t,c:!!c,r:!!r});
rv.filter(r=>r.newKm===km).forEach(r=>add(r.organ+" — intervalle révisé : "+nf(r.newKm)+" km"+(r.newMo?" / "+moT(r.newMo):"")+(r.oldKm?" (au lieu de "+nf(r.oldKm)+" km)":""),1,1));
if(ev){if(i===0)add("Contrôle visuel batterie HV, câblage orange et connecteurs");
add("Filtre d'habitacle (charbon actif)");add("Contrôle SOH batterie et delta de cellules");
if(km>=60000)add("Liquide de frein DOT 4 (tous les 2 ans)");
if(km>=90000)add("Contrôle circuit de refroidissement batterie (pompe LDR, échangeur)");
if(km>=120000){add("Liquide de refroidissement pack HV",1);add("Contrôle isolement HV au mégohmmètre",1);}
if(km>=160000)add("Contrôle complet pack HV, contacteurs et chargeur embarqué",1);
add("Contrôle disques / plaquettes (corrosion par faible sollicitation)");
if(USE.clim==="froid")add("Préconditionnement pack avant charge DC · pompe à chaleur");
if(USE.clim==="chaud")add("Contrôle température pack et débit de refroidissement en charge rapide");}
else{if(hy){if(i===0||km%30000===0)add("Vidange huile 0W16/0W20 normée + filtre à huile");}
else if(i===0||km%30000===0)add("Vidange huile normée constructeur + filtre à huile");
if(km%30000===0||km<=15000)add("Filtre d'habitacle");
if(km>=60000&&km%60000===0)add("Filtre à air");
if(die&&km>=60000&&km%60000===0)add("Filtre à gasoil",1);
if(!die&&km>=40000&&km%40000===0)add("Bougies d'allumage"+(hy?" (iridium selon préco)":""));
if(km>=60000&&km%60000===0)add("Liquide de frein DOT 4 (tous les 2 ans)");
if(scr&&km%30000===0)add("Contrôle SCR : injecteur AdBlue, pompe, cristallisation",1);
if(die&&km%30000===0)add("Contrôle FAP : charge de suie, ΔP, régénérations");
if(gpf&&km>=60000)add("Contrôle GPF / catalyseur (contre-pression)");
if(wet){if(km%30000===0)add("Contrôle largeur courroie humide au gabarit + débris carter",1);}
else if(chain){if(km>=120000)add("Contrôle tension / allongement chaîne, écoute à froid",1);}
else if(km>=120000)add("Kit distribution + galets + pompe à eau",1);
if(hy&&km%30000===0)add("Contrôle système hybride : onduleur, LDR, isolement HV");
if(km>=120000)add("Liquide de refroidissement moteur / onduleur");
if(km>=120000)add("Contrôle trains roulants, rotules et géométrie");
if(km>=160000)add("Contrôle turbo, injecteurs (débits retour) et compressions",1);
if(USE.sev==="severe"&&km%20000===0)add("Usage sévère : analyse d'huile, nettoyage EGR, contrôle turbo",1);
if(USE.clim==="froid"&&km%30000===0)add("Climat froid : 12 V, préchauffage, thermostat");
if(USE.clim==="chaud"&&km%30000===0)add("Climat chaud : clim, condenseur, circuit LDR");}
return{km:km,mo:Math.round(km/USE.km*12),ops:ops,first:i<4,rev:rv.some(x=>x.newKm===km)};});}
function renderGate(){const g=$("dGate");
if(ready()){g.innerHTML="";return}
const b=B(SEL.brand),m=SEL.brand&&SEL.model?M(SEL.brand,SEL.model):null;
const f=SEL.fam&&m?famsOf(SEL.brand,SEL.model,SEL.year).find(x=>x.k===SEL.fam):null;
const steps=[["1","Marque",SEL.brand,b?b.name:"","cBrand"],["2","Modèle",SEL.model,m?m.name:"","cModel"],
["3","Cylindrée · type moteur",SEL.fam,f?famL(f.e):"","cFam"],["4","Puissance réelle",SEL.hp,SEL.hp?SEL.hp+" ch":"","cHp"]];
g.innerHTML=`<div class="pn pd" style="margin-bottom:16px;border-color:rgba(251,191,36,.35)">
<div class="sh"><div class="si ic-am"><svg class="ic"><use href="#i-lock"/></svg></div>
<div><h2>Diagnostic expert — corrélation complète requise</h2><div class="sb">Seules les fiches liées à la marque, au modèle, à la motorisation <b>et</b> à la puissance sélectionnés sont affichées.</div></div>
<span class="sp"></span><button class="bt sm" id="gRand"><svg class="ic"><use href="#i-dice"/></svg>Exemple complet</button></div>
<div class="g4s">${steps.map(([n,t,v,val,id])=>`<button class="gs${v?" dn":""}" data-go="${id}">
<span class="gn">${v?"✓":n}</span><span style="min-width:0"><span class="gt">${esc(t)}</span><span class="gv">${esc(val||"à sélectionner")}</span></span></button>`).join("")}</div>
<div class="nt wa" style="margin-top:13px">Complétez les ${steps.filter(s=>!s[2]).length} champ(s) manquant(s) dans le banc de commande. L'année de production est optionnelle mais affine la plage moteur.</div></div>`;
g.querySelectorAll("[data-go]").forEach(x=>x.onclick=()=>{const c=CO[{cBrand:"brand",cModel:"model",cFam:"fam",cHp:"hp"}[x.dataset.go]];if(c){c.btn.scrollIntoView({block:"center",behavior:"smooth"});setTimeout(()=>c.open(),260)}});
const gr=$("gRand");if(gr)gr.onclick=()=>{const e=engines();if(e.length)loadEng(e[Math.floor(Math.random()*e.length)])}}
function renderDiag(){renderGate();$("dVeh").innerHTML=ready()?vehCard():"";$("dSpec").innerHTML=specPanel();bindEng($("dSpec"));
const box=$("dF"),tb=$("dT"),dd=$("dD");
if(!ready()){box.innerHTML=ey("i-lock","En attente de corrélation","Aucune fiche n'est affichée tant que la marque, le modèle, la motorisation et la puissance ne sont pas sélectionnés.");
tb.innerHTML=ey("i-book","En attente","Les TSB et bulletins apparaîtront pour la motorisation exacte.");
dd.innerHTML=ey("i-bolt","En attente","Les DTC corrélés apparaîtront après sélection complète.");
$("dFSub").textContent="Sélection incomplète";$("dTSub").textContent="Sélection incomplète";return}
const all=strictCur(),p=all.filter(f=>f.kind!=="tsb"),t=all.filter(f=>f.kind==="tsb");
$("dFSub").textContent=`${p.length} fiche(s) · ${SEL.brand} → ${SEL.model} → ${SEL.fam} → ${SEL.hp} ch`;
$("dTSub").textContent=`${t.length} bulletin(s) pour cette motorisation`;
box.innerHTML="";if(!p.length)box.innerHTML=ey("i-shieldok","Aucune fiche critique","Aucune panne, campagne ou rappel ne correspond à cette combinaison exacte et aux filtres actifs.");
else p.slice(0,50).forEach(f=>box.appendChild(fCard(f,false)));
tb.innerHTML="";if(!t.length)tb.innerHTML=ey("i-book","Aucun bulletin","Aucun TSB ne correspond à la corrélation et aux filtres actifs.");
else t.slice(0,25).forEach(f=>tb.appendChild(fCard(f,false)));
const codes=uniq(all.flatMap(f=>f.dtc)).sort();
dd.innerHTML=codes.length?codes.slice(0,40).map(c=>{const d=DTC[c];
return `<div class="dsc" style="margin-bottom:8px"><div class="dsc-h"><span class="dtc">${esc(c)}</span>${d?esc(d[0]):"Code corrélé"}</div>
${d?`<div class="dsc-b" style="padding:10px 13px;font-size:12.5px"><b style="color:var(--amH)">Causes :</b> ${esc(d[1])}<br><b style="color:var(--cy)">Contrôle :</b> ${esc(d[2])}</div>`:""}</div>`}).join(""):ey("i-bolt","Aucun DTC","Aucun code défaut rattaché aux fiches corrélées.")}
function renderFaults(){$("fVeh").innerHTML=vehCard();const all=current();
$("fSub").textContent=`${all.length} fiche(s) · ${FSEL.size} sélectionnée(s) · ${uniq(all.flatMap(f=>f.dtc)).length} DTC · ${uniq(all.flatMap(f=>f.dom||[])).length} domaine(s)`;
const box=$("fList");box.innerHTML="";
if(!all.length)box.innerHTML=ey("i-shieldok","Rien à signaler","Aucune fiche ne correspond aux filtres actifs.");
else all.forEach(f=>box.appendChild(fCard(f,canW())));
$("bBulkDone").disabled=$("bBulkCopy").disabled=FSEL.size===0||!canW();$("bF").textContent=all.length}
function renderServ(){$("sVeh").innerHTML=ready()?vehCard():"";$("sSpec").innerHTML=specPanel();bindEng($("sSpec"));
const eng=resolved(),box=$("sPlan"),rl=$("revList");
if(!ready()){rl.innerHTML=ey("i-clock","Motorisation non identifiée","Sélectionnez marque → modèle → cylindrée/type → puissance pour les révisions applicables.");
box.innerHTML=ey("i-wrench","Sélection incomplète","Le plan exact nécessite une motorisation et une puissance identifiées.");
$("rSub").textContent="En attente";$("sSub").textContent="En attente";$("bR").textContent="0";renderRevAll();return}
const e=eng[0],rv=revsFor(e),plan=planFor(e),s=spec(e);
$("bR").textContent=rv.length;
$("rSub").textContent=rv.length?`${rv.length} révision(s) applicable(s) à ${famL(e)} ${e.hp} ch — km et échéance calendaire`:"Aucune révision documentée pour cette motorisation";
rl.innerHTML=rv.length?rv.map(r=>revCard(r,e)).join(""):ey("i-shieldok","Aucune révision","Les intervalles d'origine s'appliquent.");
$("sSub").textContent=`${famL(e)} · ${e.hp} ch (${kw(e.hp)} kW) · ${e.code} · ${nf(USE.km)} km/an · ${USE.sev}`;
box.innerHTML="";plan.forEach((st,i)=>{const d=el("div","stp"+(st.rev?" rv":st.first?" f4":""));
d.innerHTML=`<div class="kmb${st.rev?" al":st.km>=120000?" al":""}"><b>${nf(st.km)}</b><span>km${st.first?" · entretien "+(i+1):""}</span><span class="tm">≈ ${moT(st.mo)}</span></div>
<div class="ops">${st.ops.map(o=>`<div class="op${o.r?" rv":o.c?" cr":""}"><svg class="ic"><use href="#${o.r?"i-clock":o.c?"i-warn":"i-check"}"/></svg><span>${esc(o.t)}${o.r?'<span class="ot rv">intervalle révisé</span>':o.c?'<span class="ot">point critique</span>':""}</span></div>`).join("")}</div>`;
box.appendChild(d)});
const n=el("div","nt wa");
n.innerHTML=`<b>Spécificité moteur.</b> ${esc(e.tech||"—")}${s.disp&&!s.ev?` · ${s.disp} cm³, ${s.lay}`:""}${s.ev&&s.kwh?` · pack ${s.kwh} kWh, ${s.volt} V`:""}. Échéances temporelles calculées sur <b>${nf(USE.km)} km/an</b> ; confirmer la préconisation exacte au VIN.`;
box.appendChild(n);renderRevAll()}
function renderRevAll(){const box=$("revAllList");if(!box)return;let rows=allRevs();const q=norm(revQ);
if(q)rows=rows.filter(r=>norm([r.organ,r.src,r.note,r.match,r.brands.map(b=>{const x=B(b);return x?x.name:b}).join(" ")].join(" ")).includes(q));
$("revAllSub").textContent=`${rows.length} révision(s) sur ${allRevs().length} · km + mois`;
box.innerHTML=rows.length?rows.map(r=>revCard(r,null)).join(""):ey("i-search","Aucune révision","Aucune entrée ne correspond au filtre.")}
function renderDom(){const p=pool(false),c={};p.forEach(f=>(f.dom||[]).forEach(d=>c[d]=(c[d]||0)+1));
const s=$("domStrip");s.innerHTML="";
DOM.forEach(([id,n,ic])=>{const b=el("button","dc"+(c[id]?"":" z"));b.dataset.on=FIL.dom.has(id)?"1":"0";b.title=n;
b.innerHTML=`<svg class="ic"><use href="#${ic}"/></svg>${esc(n)}<span class="n2">${c[id]||0}</span>`;
b.onclick=()=>{FIL.dom.has(id)?FIL.dom.delete(id):FIL.dom.add(id);renderDom();renderAll()};s.appendChild(b)});
$("domSel").textContent=FIL.dom.size?[...FIL.dom].map(d=>DM[d]?DM[d].n:d).join(", "):"tous"}
function renderCov(){const p=pool(false),c={},cr={};p.forEach(f=>(f.dom||[]).forEach(d=>{c[d]=(c[d]||0)+1;if(f.sev==="critique")cr[d]=(cr[d]||0)+1}));
$("covSub").textContent=`${p.length} fiche(s) · ${Object.keys(c).length}/${DOM.length} domaines documentés${ready()?" pour la sélection":""}`;
const g=$("covGrid");g.innerHTML="";
DOM.forEach(([id,n,ic,cl])=>{const b=el("button","cvi "+(c[id]?"hs":"z"));
b.innerHTML=`<span class="ci ic-${cl}"><svg class="ic"><use href="#${ic}"/></svg></span><span class="cn">${esc(n)}${cr[id]?`<div class="mi" style="color:var(--rd)">${cr[id]} critique(s)</div>`:""}</span><span class="cq" style="color:var(--${CV[cl]})">${c[id]||0}</span>`;
b.onclick=()=>{FIL.dom.clear();FIL.dom.add(id);renderDom();renderAll();showView("faults");toast("Domaine « "+n+" » isolé","in")};g.appendChild(b)});
const list=apply(p),box=$("domList");box.innerHTML="";
$("domTitle").textContent=FIL.dom.size?"Fiches des domaines sélectionnés":"Fiches du référentiel";
$("domSub").textContent=`${list.length} fiche(s) · ${uniq(list.flatMap(f=>f.dom||[])).length} domaine(s)`;
if(!list.length)box.innerHTML=ey("i-search","Aucune fiche","Aucune fiche pour ces filtres.");
else list.slice(0,80).forEach(f=>box.appendChild(fCard(f,false)))}
function renderCat(){const eng=engines();
$("catStats").innerHTML=[["Marques",CAT.length,"i-db","cy"],["Modèles",CAT.reduce((a,b)=>a+b.models.length,0),"i-car","vi"],
["Motorisations",eng.length,"i-piston","amH"],["Fiches + protocoles",FAULTS.length+DR.length,"i-warn","rd"]]
.map(([l,v,i,c])=>`<div class="st"><svg class="ic si2" style="color:var(--${c})"><use href="#${i}"/></svg><div class="sv3" style="color:var(--${c})">${nf(v)}</div><div class="sl">${l}</div></div>`).join("");
$("bC").textContent=nf(eng.length);
let rows=eng.slice();const q=norm(CUI.q);
if(q)rows=rows.filter(e=>norm([e.brandName,alias(e.brandName),e.modelName,famL(e),e.code,e.tech,FUEL[e.fuel],e.hp,spec(e).disp].join(" ")).includes(q));
const k=CUI.sort,d=CUI.dir;
rows.sort((a,b)=>{let r=0;
if(k==="brand")r=norm(a.brandName).localeCompare(norm(b.brandName))||norm(a.modelName).localeCompare(norm(b.modelName));
else if(k==="model")r=norm(a.modelName).localeCompare(norm(b.modelName));
else if(k==="years")r=a.y0-b.y0;else if(k==="fam")r=norm(famL(a)).localeCompare(norm(famL(b)));
else if(k==="disp")r=(spec(a).disp||0)-(spec(b).disp||0);else if(k==="hp"||k==="kw")r=a.hp-b.hp;
else if(k==="code")r=a.code.localeCompare(b.code,"fr");else if(k==="fuel")r=a.fuel.localeCompare(b.fuel);
return r*d||norm(a.brandName).localeCompare(norm(b.brandName))});
const pages=Math.max(1,Math.ceil(rows.length/CUI.size));CUI.page=clamp(CUI.page,0,pages-1);
const sl=rows.slice(CUI.page*CUI.size,(CUI.page+1)*CUI.size),tb=$("catB");tb.innerHTML="";
sl.forEach(e=>{const s=spec(e),tr=el("tr",CUI.sel.has(e.key)?"sl":"");
tr.innerHTML=`<td><span class="ck" role="checkbox" aria-checked="${CUI.sel.has(e.key)}" tabindex="0"><svg class="ic"><use href="#i-check"/></svg></span></td>
<td class="tn">${esc(e.brandName)}</td><td class="tn">${esc(e.modelName)}<div class="mi">${esc(e.seg)}</div></td>
<td class="mo">${e.y0}–${e.y1}</td><td class="tn">${esc(famL(e))}<div class="mi">${esc(s.ev?s.plat:s.lay)}</div></td>
<td class="mo" style="color:var(--amH)">${s.ev?(s.kwh?s.kwh+" kWh":"—"):(s.disp||"—")}</td>
<td class="mo" style="color:var(--rd);font-weight:800">${e.hp}</td><td class="mo">${kw(e.hp)}</td><td class="mo">${esc(e.code)}</td>
<td><span class="tg f${e.fuel}">${FUEL[e.fuel]}</span></td><td class="mi">${esc(e.tech||"—")}</td>
<td><button class="bt sm" data-l="1"><svg class="ic"><use href="#i-eye"/></svg></button></td>`;
const c=tr.querySelector(".ck"),tg=ev=>{ev.stopPropagation();CUI.sel.has(e.key)?CUI.sel.delete(e.key):CUI.sel.add(e.key);renderCat()};
c.onclick=tg;c.onkeydown=ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();tg(ev)}};
tr.querySelector("[data-l]").onclick=ev=>{ev.stopPropagation();loadEng(e)};tr.ondblclick=()=>loadEng(e);tb.appendChild(tr)});
if(!sl.length)tb.innerHTML=`<tr><td colspan="12">${ey("i-search","Aucun résultat","Aucune motorisation ne correspond au filtre.")}</td></tr>`;
$("catSub").textContent=`${nf(rows.length)} motorisation(s) · tri ${k} ${d>0?"↑":"↓"} · sélection ${CUI.sel.size}`;
$("catPg").textContent=`Page ${CUI.page+1} / ${pages}`;
$("catP").disabled=CUI.page===0;$("catN").disabled=CUI.page>=pages-1;$("bCatLoad").disabled=CUI.sel.size===0;
document.querySelectorAll("#catT th.so").forEach(th=>{th.classList.toggle("ac",th.dataset.k===k);
th.querySelector(".aw").textContent=th.dataset.k===k?(d>0?"▲":"▼"):"▲"});renderViews()}
function loadEng(e){SEL={brand:e.brand,model:e.model,year:String(clamp(Math.max(e.y0,YMIN),YMIN,YMAX)),fam:e.gk,hp:String(e.hp)};
sync();renderDom();renderAll();toast(`${e.brandName} ${e.modelName} · ${famL(e)} ${e.hp} ch`,"ok");window.scrollTo({top:0,behavior:"smooth"})}
function renderViews(){const box=$("views");if(!box)return;
if(!VIEWS.length){box.innerHTML=ey("i-save","Aucune vue mémorisée","Configurez le banc puis « Mémoriser vue ». Réordonnable par glisser-déposer.");return}
box.innerHTML="";VIEWS.forEach((v,i)=>{const d=el("div","sv");d.draggable=canW();
d.innerHTML=`<span class="gr2"><svg class="ic"><use href="#i-grip"/></svg></span><div style="flex:1;min-width:0">
<div style="font-weight:750;font-size:13px">${esc(v.name)}</div><div class="mi">${esc(v.label)}</div></div>
<button class="bt sm pr" data-a="ap">Appliquer</button><button class="bt sm rd" data-a="de" ${canW()?"":"disabled"}><svg class="ic"><use href="#i-trash"/></svg></button>`;
d.querySelector('[data-a="ap"]').onclick=()=>{SEL=Object.assign({},v.sel);FIL.q=v.q||"";$("q").value=FIL.q;FIL.dom=new Set(v.dom||[]);
USE=Object.assign({},v.use||USE);$("kmY").value=USE.km;$("kmYL").textContent=nf(USE.km)+" km/an";$("selSev").value=USE.sev;$("selClim").value=USE.clim;
sync();renderDom();renderAll();toast("Vue « "+v.name+" » appliquée","ok")};
d.querySelector('[data-a="de"]').onclick=()=>{if(!canW())return;const rm=VIEWS.splice(i,1)[0];saveAux();renderViews();
toast("Vue supprimée","wa",()=>{VIEWS.splice(i,0,rm);saveAux();renderViews()})};
d.addEventListener("dragstart",ev=>{if(!canW()){ev.preventDefault();return}d.classList.add("dg");ev.dataTransfer.setData("text/plain",String(i))});
d.addEventListener("dragend",()=>d.classList.remove("dg"));
d.addEventListener("dragover",ev=>{if(canW()){ev.preventDefault();d.classList.add("o2")}});
d.addEventListener("dragleave",()=>d.classList.remove("o2"));
d.addEventListener("drop",ev=>{ev.preventDefault();d.classList.remove("o2");if(!canW())return;
const f=+ev.dataTransfer.getData("text/plain");if(f===i)return;const it=VIEWS.splice(f,1)[0];VIEWS.splice(i,0,it);saveAux();renderViews();toast("Vues réordonnées","ok")});
box.appendChild(d)})}
function audit(){const iss=[],add=(s,c,m)=>iss.push({sev:s,code:c,msg:m});
const eng=engines(),keys=new Set();let dup=0,orph=0,yf=0,hf=0;
CAT.forEach(b=>{if(!b.models.length)add("ba","BRAND",`Marque « ${b.name} » sans modèle`);
b.models.forEach(m=>{if(!m.engines.length)add("ba","MODEL",`${b.name} ${m.name} : aucun moteur`);
m.engines.forEach(e=>{const s=spec(e);
if(!(e.hp>0))add("ba","HP",`${b.name} ${m.name} : puissance invalide`);
if(!e.code||e.code==="—")add("wa","CODE",`${b.name} ${m.name} ${e.fam} : code manquant`);
if(!FUEL[e.fuel])add("ba","FUEL",`${b.name} ${m.name} : énergie inconnue`);
if(!s.ev&&!s.disp)add("wa","DISP",`${b.name} ${m.name} ${e.fam} : cylindrée indéterminée`);
if(s.ev&&!s.kwh)add("wa","KWH",`${b.name} ${m.name} ${e.hp} ch : capacité batterie manquante`);
if(e.y0<m.y0||e.y1>m.y1){yf++;add("wa","YEARS",`${b.name} ${m.name} ${e.fam} : années hors production`)}
const k=e.brand+"|"+e.model+"|"+e.gk+"|"+e.hp+"|"+e.code;
if(keys.has(k)){dup++;add("wa","DUP",`Doublon : ${b.name} ${m.name} ${e.fam} ${e.hp} ch`)}keys.add(k);
const d=parseInt(String(e.fam).match(/(\d{2,4})\s*ch/i)?.[1]||"0",10);
if(d&&Math.abs(d-e.hp)>2){hf++;add("wa","HPM",`${b.name} ${m.name} : libellé ${d} ch vs ${e.hp} ch`)}})})});
const bids=new Set(CAT.map(b=>b.id));
const p=FAULTS.concat(rules(null));
p.forEach(f=>{if(!f.titre)add("ba","FT",`Fiche ${f.id} sans titre`);if(!f.src)add("wa","FS",`Fiche ${f.id} sans source`);
if(!SEV[f.sev])add("ba","FV",`Fiche ${f.id} : sévérité inconnue`);if(!KIND[f.kind])add("ba","FK",`Fiche ${f.id} : nature inconnue`);
if(!(f.dom||[]).length)add("wa","FD",`Fiche ${f.id} sans domaine`);
(f.dom||[]).forEach(d=>{if(!DM[d])add("ba","FDU",`Fiche ${f.id} : domaine inconnu`)});
if(f.scope!=="rule"){if(!f.brands.some(b=>bids.has(b)))add("wa","FB",`Fiche ${f.id} : marque inconnue`);
let h=0;if(f.scope==="engine"){const t=slug(f.target);h=eng.filter(e=>f.brands.includes(e.brand)&&e.famKey===t&&ov(f.y0,f.y1,e.y0,e.y1)).length}
else if(f.scope==="model"){const ids=csv(f.target);h=eng.filter(e=>f.brands.includes(e.brand)&&ids.includes(e.model)&&ov(f.y0,f.y1,e.y0,e.y1)).length}
else h=eng.filter(e=>f.brands.includes(e.brand)).length;
if(!h){orph++;add("wa","FO",`Fiche « ${f.titre.slice(0,44)} » orpheline`)}}
(f.dtc||[]).forEach(c=>{if(!DTC[c])add("in","DU",`Code ${c} (${f.id}) absent du dictionnaire`)})});
const cov=new Set();p.forEach(f=>(f.dom||[]).forEach(d=>cov.add(d)));
DOM.forEach(([id,n])=>{if(!cov.has(id))add("wa","DG",`Domaine « ${n} » non couvert`)});
const rv=allRevs();rv.forEach(r=>{if(!r.brands.some(b=>bids.has(b)))add("wa","RB",`Révision ${r.id} : marque inconnue`);
if(r.newKm<=0)add("ba","RK",`Révision ${r.id} : km invalide`);
if(!r.src)add("wa","RS",`Révision ${r.id} sans source`)});
const checks=[["Marques → modèles",CAT.every(b=>b.models.length>0),`${CAT.length} marques, ${CAT.reduce((a,b)=>a+b.models.length,0)} modèles`],
["Modèles → motorisations",CAT.every(b=>b.models.every(m=>m.engines.length>0)),`${eng.length} motorisations`],
["Cylindrée / batterie renseignée",iss.filter(i=>i.code==="DISP"||i.code==="KWH").length===0,`${eng.filter(e=>{const s=spec(e);return s.ev?s.kwh:s.disp}).length}/${eng.length} documentées`],
["Années moteur ⊂ production",yf===0,yf?`${yf} dépassement(s)`:"Plages incluses"],
["Puissance ↔ libellé",hf===0,hf?`${hf} écart(s)`:"Cohérent"],
["Unicité des motorisations",dup===0,dup?`${dup} doublon(s)`:"Aucun doublon"],
["Fiches → moteur / modèle / marque",orph===0,orph?`${orph} orpheline(s)`:"Toutes corrélées"],
["Couverture des 29 domaines",cov.size===DOM.length,`${cov.size}/${DOM.length} domaines`],
["Révisions d'intervalles",iss.filter(i=>i.code==="RK"||i.code==="RB").length===0,`${rv.length} révisions km + mois`],
["Codes DTC documentés",iss.filter(i=>i.code==="DU").length===0,`${Object.keys(DTC).length} définitions`],
["Recherche sans accent",norm("Škoda")==="skoda"&&norm("Citroën")==="citroen","Škoda → skoda"],
["Couverture 2017 → 2027",eng.some(e=>e.y0<=2017)&&eng.some(e=>e.y1>=2027),"Plage complète"]];
const bad=iss.filter(i=>i.sev==="ba").length,warn=iss.filter(i=>i.sev==="wa").length,tot=Math.max(1,eng.length+p.length+rv.length);
AUDIT={issues:iss,checks,score:clamp(Math.round(100-((bad*6+warn*1.1)/tot)*100),0,100),bad,warn,n:eng.length+p.length+rv.length};return AUDIT}
function renderAudit(){const a=AUDIT||audit();
$("gVal").style.strokeDashoffset=String(314-314*a.score/100);$("gTxt").textContent=a.score+"%";$("nInt").textContent=a.score+"%";
$("chI").className="ch "+(a.bad?"ba":a.warn?"wa":"ok");
$("aStats").innerHTML=[["Contrôles réussis",a.checks.filter(x=>x[1]).length+"/"+a.checks.length,"gr"],["Anomalies bloquantes",a.bad,"rd"],
["Avertissements",a.warn,"amH"],["Éléments audités",nf(a.n),"cy"]]
.map(([l,v,c])=>`<div class="st"><div class="sv3" style="color:var(--${c})">${v}</div><div class="sl">${l}</div></div>`).join("");
$("aChecks").innerHTML=a.checks.map(([n,ok,d])=>`<div class="dsc"><div class="dsc-b" style="display:flex;align-items:center;gap:11px;padding:11px 13px">
<svg class="ic" style="width:18px;height:18px;color:${ok?"var(--gr)":"var(--amH)"}"><use href="#${ok?"i-check":"i-warn"}"/></svg>
<div style="flex:1;min-width:0"><b style="font-size:13px">${esc(n)}</b><div class="mi">${esc(d)}</div></div>
<span class="pl" style="color:${ok?"var(--gr)":"var(--amH)"}">${ok?"CONFORME":"À CORRIGER"}</span></div></div>`).join("");
$("aIssues").innerHTML=!a.issues.length?`<div class="nt ok"><b>Base intègre.</b> Toutes les corrélations sont vérifiées.</div>`:
`<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-list"/></svg>${a.issues.length} observation(s)</div>
<div class="dsc-b" style="max-height:320px;overflow-y:auto;padding:0">${a.issues.slice(0,250).map(i=>
`<div style="padding:8px 13px;border-bottom:1px solid var(--ln2);font-size:12.3px;display:flex;gap:9px">
<span class="pl ${i.sev==="ba"?"sc":i.sev==="wa"?"se":"si"}" style="flex:none">${i.code}</span><span style="color:var(--m1)">${esc(i.msg)}</span></div>`).join("")}</div></div>`}
function autoRepair(){if(!canW()){toast("Mode administrateur requis","ba");return}
const before=JSON.stringify({cat:CAT,faults:FAULTS,revs:REVC});let n=0;
CAT.forEach(b=>b.models.forEach(m=>m.engines.forEach(e=>{
if(e.y0<m.y0||e.y1>m.y1){e.y0=Math.max(e.y0,m.y0);e.y1=Math.min(e.y1,m.y1);n++}
const d=parseInt(String(e.fam).match(/(\d{2,4})\s*ch/i)?.[1]||"0",10);
if(d&&Math.abs(d-e.hp)>2){e.fam=e.fam.replace(/\s*\d{2,4}\s*ch/i,"").trim();n++}
const s=spec(e);e.gk=e.famKey+(s.ev?"|"+(s.kwh||""):"");e.disp=s.ev?s.kwh:s.disp;})));
const seen=new Set();
CAT.forEach(b=>b.models.forEach(m=>{m.engines=m.engines.filter(e=>{
const k=e.brand+"|"+e.model+"|"+e.gk+"|"+e.hp+"|"+e.code;if(seen.has(k)){n++;return false}seen.add(k);return true})}));
FAULTS.forEach(f=>{if(!(f.dom||[]).length){f.dom=["moteur"];n++}});
saveDB();audit();renderAudit();sync();renderDom();renderAll();
toast(n?`${n} correction(s) appliquée(s)`:"Aucune correction nécessaire",n?"ok":"in",
n?()=>{const d=JSON.parse(before);CAT=d.cat;FAULTS=d.faults;REVC=d.revs;saveDB();audit();renderAudit();sync();renderDom();renderAll()}:null)}
function openDw(){$("scrim").classList.add("on");$("drawer").classList.add("on");$("drawer").setAttribute("aria-hidden","false");$("dwX").focus()}
function closeDw(){$("drawer").classList.remove("on");$("drawer").setAttribute("aria-hidden","true");
if(!$("notifDw").classList.contains("on"))$("scrim").classList.remove("on")}
function openF(f){const eng=engines().filter(e=>hits(f,e)),note=NOTES[f.id]||{};
$("dwT").textContent=f.titre;
$("dwS").innerHTML=`<span class="pl ${KC[f.kind]}">${KIND[f.kind]}</span> <span class="pl ${SC[f.sev]}">${SEV[f.sev].n}</span> <span class="pl">${f.y0}–${f.y1}</span>`;
$("dwI").className="si "+(f.sev==="critique"?"ic-rd":f.sev==="eleve"?"ic-am":"ic-vi");
const g={};eng.forEach(e=>{const k=e.brandName+" "+e.modelName;(g[k]=g[k]||[]).push(`${famL(e)} ${e.hp} ch (${e.code})`)});
$("dwB").innerHTML=`
<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-grid"/></svg>Domaines de défaillance</div><div class="dsc-b"><div class="fm" style="margin:0">${domPills(f)||"—"}</div></div></div>
<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-warn"/></svg>Symptômes constatés</div><div class="dsc-b">${esc(f.sym||"—")}</div></div>
<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-brain"/></svg>Protocole de diagnostic</div><div class="dsc-b"><ol class="pt">${f.pro.map(p=>`<li>${esc(p)}</li>`).join("")}</ol></div></div>
<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-wrench"/></svg>Organes / pièces</div><div class="dsc-b">${esc(f.org||"—")}</div></div>
${f.dtc.length?`<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-bolt"/></svg>Codes DTC & définitions</div><div class="dsc-b">
${f.dtc.map(c=>{const d=DTC[c];return `<div style="margin-bottom:10px"><span class="dtc">${esc(c)}</span> <b>${d?esc(d[0]):"Code corrélé"}</b>
${d?`<div class="mi" style="margin-top:4px">Causes : ${esc(d[1])}<br>Contrôle : ${esc(d[2])}</div>`:""}</div>`}).join("")}</div></div>`:""}
<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-car"/></svg>Véhicules corrélés (${eng.length})</div><div class="dsc-b" style="max-height:210px;overflow-y:auto">
${f.scope==="rule"?'<span class="mi">Protocole transversal — actif selon l\'énergie et la technologie réelles du moteur sélectionné.</span>':
Object.keys(g).length?Object.entries(g).map(([k,v])=>`<div style="margin-bottom:9px"><b style="font-size:12.5px">${esc(k)}</b><div class="mi">${esc(v.join(" · "))}</div></div>`).join(""):'<span class="mi">Portée marque — s\'applique à toute la gamme.</span>'}</div></div>
<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-link"/></svg>Source & vérification</div><div class="dsc-b"><b>${esc(f.src)}</b>
<div class="mi" style="margin-top:6px">Portée : ${f.scope==="engine"?"famille moteur « "+esc(f.target)+" »":f.scope==="model"?"modèle(s) "+esc(f.target):f.scope==="rule"?"conditionnelle (énergie / technologie)":"marque(s) "+esc(f.brands.join(", "))}</div>
<div class="nt wa" style="margin-top:10px;font-size:12px">Confirmez l'éligibilité au <b>VIN</b> sur la source officielle avant intervention.</div></div></div>
<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-edit"/></svg>Note d'atelier ${canW()?"":"— lecture seule"}</div><div class="dsc-b">
<textarea class="ct" id="dwNote" rows="3" ${canW()?"":"disabled"} placeholder="Observations, mesures, référence pièces…">${esc(note.txt||"")}</textarea></div></div>`;
$("dwF").innerHTML="";
const mk=(c,i,t,fn,dis)=>{const b=el("button","bt "+c,`<svg class="ic"><use href="#${i}"/></svg>${t}`);b.onclick=fn;if(dis)b.disabled=true;$("dwF").appendChild(b)};
mk(note.done?"":"gr","i-check",note.done?"Marquer non traitée":"Marquer traitée",()=>{
NOTES[f.id]=Object.assign({},NOTES[f.id],{done:!note.done});saveAux();renderAll();openF(f);toast(note.done?"Fiche rouverte":"Fiche marquée traitée","ok")},!canW());
mk("","i-save","Enregistrer la note",()=>{NOTES[f.id]=Object.assign({},NOTES[f.id],{txt:$("dwNote").value});saveAux();renderAll();toast("Note enregistrée","ok")},!canW());
mk("","i-copy","Copier",()=>{const t=`${f.titre}\n${KIND[f.kind]} · ${SEV[f.sev].n} · ${f.y0}-${f.y1}\nDomaines : ${(f.dom||[]).map(d=>DM[d]?DM[d].n:d).join(", ")}\nSource : ${f.src}\nSymptômes : ${f.sym}\nProtocole :\n${f.pro.map((p,i)=>(i+1)+") "+p).join("\n")}\nOrganes : ${f.org}\nDTC : ${f.dtc.join(", ")}`;
navigator.clipboard?.writeText(t).then(()=>toast("Fiche copiée","ok"),()=>toast("Copie indisponible","wa"))});
if(canW()&&f.scope!=="rule")mk("rd","i-trash","Supprimer",()=>{const i=FAULTS.findIndex(x=>x.id===f.id);if(i<0)return;
const rm=FAULTS.splice(i,1)[0];saveDB();closeDw();audit();renderDom();renderAll();
toast("Fiche supprimée","wa",()=>{FAULTS.splice(i,0,rm);saveDB();audit();renderDom();renderAll()})});
openDw()}
function pending(){return TIERS.filter(t=>t.status==="pending")}
function renderBell(){const n=pending().length,un=NOTIF.filter(x=>!x.read).length,tot=n+un;
const b=$("bellN");if(tot>0){b.style.display="grid";b.textContent=tot>99?"99+":tot;$("bellB").classList.add("rg")}
else{b.style.display="none";$("bellB").classList.remove("rg")}
$("bA").textContent=n;$("nfS").textContent=`${n} demande(s) en attente · ${un} non lue(s)`}
function renderNf(){const box=$("nfList");const items=[];
pending().forEach(t=>items.push({type:"access",txt:`Demande d'accès de ${t.name}`,meta:`${dtT(t.ts)} · appareil ${t.device}`,ts:t.ts,read:false,go:true}));
NOTIF.forEach(n=>items.push(n));
items.sort((a,b)=>b.ts-a.ts);
if(!items.length){box.innerHTML=ey("i-bell","Aucune notification","Les demandes d'accès des tiers et les événements système apparaîtront ici.");return}
box.innerHTML="";items.slice(0,60).forEach(n=>{
const ic=n.type==="access"?["ic-am","i-user"]:n.type==="grant"?["ic-gr","i-unlock"]:n.type==="deny"?["ic-rd","i-ban"]:
n.type==="revoke"?["ic-mg","i-ban"]:n.type==="import"?["ic-vi","i-cloud"]:["ic-cy","i-info"];
const d=el("div","ni"+(n.read?"":" un"));
d.innerHTML=`<span class="nic ${ic[0]}"><svg class="ic"><use href="#${ic[1]}"/></svg></span>
<div class="nib"><div class="nit">${esc(n.txt)}</div><div class="nid">${esc(n.meta||dtT(n.ts))}</div></div>
${n.go?'<button class="bt sm te" style="flex:none">Ouvrir</button>':""}`;
const g=d.querySelector("button");if(g)g.onclick=()=>{closeNf();if(canW()){showView("adm");setTimeout(()=>$("tiersList").scrollIntoView({behavior:"smooth",block:"center"}),200)}else toast("Réservé à l'administrateur","ba")};
box.appendChild(d)})}
function openNf(){renderNf();$("scrim").classList.add("on");$("notifDw").classList.add("on");$("notifDw").setAttribute("aria-hidden","false");$("nfX").focus()}
function closeNf(){$("notifDw").classList.remove("on");$("notifDw").setAttribute("aria-hidden","true");
if(!$("drawer").classList.contains("on"))$("scrim").classList.remove("on")}
function initDevice(){let d=null;try{d=localStorage.getItem(LS.dev)}catch(e){}
if(!d){d="D-"+Math.random().toString(36).slice(2,7).toUpperCase();try{localStorage.setItem(LS.dev,d)}catch(e){}}DEVICE=d}
const myReq=()=>TIERS.find(t=>t.device===DEVICE);
const STN={pending:"En attente",granted:"Autorisé",denied:"Refusé",revoked:"Révoqué"};
function requestAccess(name){
const n=String(name||"").trim().replace(/\s+/g," ");
if(!/^[A-Za-zÀ-ÿ' -]{2,24}$/.test(n)){$("tiersErr").style.display="block";return}
$("tiersErr").style.display="none";
let r=myReq();
if(!r){r={id:"T"+Date.now().toString(36).toUpperCase(),name:n,device:DEVICE,ts:Date.now(),status:"pending",history:[]};TIERS.unshift(r)}
else{r.name=n;r.status="pending";r.ts=Date.now();r.decidedAt=null;r.note=""}
r.history.push({ts:Date.now(),a:"demande",by:n});
saveAcc();notify("access",`Demande d'accès de ${n}`,`appareil ${DEVICE}`);
waitMode=true;renderLaunch();renderBell();
toast("Demande envoyée à l'administrateur","te")}
function cancelRequest(){const r=myReq();if(!r)return;
TIERS=TIERS.filter(t=>t.id!==r.id);saveAcc();notify("access",`Demande annulée (${r.name})`,"");
waitMode=false;renderLaunch();renderBell();toast("Demande annulée","in")}
function setTier(id,status){if(!canW()){toast("Réservé à l'administrateur","ba");return}
const t=TIERS.find(x=>x.id===id);if(!t)return;
const prev=t.status;t.status=status;t.decidedAt=Date.now();t.history.push({ts:Date.now(),a:status,by:"admin"});
saveAcc();
const lbl={granted:"Accès accordé à",denied:"Accès refusé à",revoked:"Accès révoqué à",pending:"Accès remis en attente pour"}[status];
notify(status==="granted"?"grant":status==="denied"?"deny":status==="revoked"?"revoke":"access",`${lbl} ${t.name}`,STN[status]);
renderTiers();renderBell();
toast(`${lbl} ${t.name} — ${STN[status]}`,status==="granted"?"ok":status==="pending"?"in":"wa",
()=>{t.status=prev;saveAcc();renderTiers();renderBell()})}
function removeTier(id){if(!canW())return;const i=TIERS.findIndex(x=>x.id===id);if(i<0)return;const rm=TIERS.splice(i,1)[0];
saveAcc();renderTiers();renderBell();toast("Tiers supprimé","wa",()=>{TIERS.splice(i,0,rm);saveAcc();renderTiers();renderBell()})}
function renderTiers(){if(!canW())return;
const q=norm($("tiersQ").value),fil=$("tiersFil").value;
let rows=TIERS.slice().sort((a,b)=>b.ts-a.ts);
if(fil)rows=rows.filter(t=>t.status===fil);
if(q)rows=rows.filter(t=>norm(t.name+" "+t.device).includes(q));
const c={pending:0,granted:0,denied:0,revoked:0};TIERS.forEach(t=>c[t.status]=(c[t.status]||0)+1);
$("tiersStats").innerHTML=[["En attente",c.pending,"amH"],["Autorisés",c.granted,"gr"],["Refusés",c.denied,"rd"],["Révoqués",c.revoked,"mg"]]
.map(([l,v,cl])=>`<div class="st"><div class="sv3" style="color:var(--${cl})">${v}</div><div class="sl">${l}</div></div>`).join("");
$("tiersSub").textContent=`${TIERS.length} tiers · ${c.pending} en attente · actions accès / refus / révocation permanentes`;
const box=$("tiersList");box.innerHTML="";
if(!rows.length){box.innerHTML=ey("i-users","Aucun tiers","Les demandes d'accès apparaissent ici en temps réel, avec le prénom du demandeur.");return}
rows.forEach(t=>{const d=el("div","tc s-"+t.status);
d.innerHTML=`<div class="th"><span class="av">${esc((t.name||"?").slice(0,2).toUpperCase())}</span>
<div style="flex:1;min-width:0"><h3 style="font-size:15px">${esc(t.name)}</h3>
<div class="mi">Appareil ${esc(t.device)} · demande ${dtT(t.ts)}${t.decidedAt?" · décision "+dtT(t.decidedAt):""}</div></div>
<span class="pl ${t.status==="granted"?"si":t.status==="pending"?"se":t.status==="denied"?"sc":"sm"}" style="height:24px;font-size:10.5px">${STN[t.status]}</span></div>
<div class="tac">
<button class="bt sm gr" data-a="granted" ${t.status==="granted"?"disabled":""}><svg class="ic"><use href="#i-check"/></svg>Accès</button>
<button class="bt sm rd" data-a="denied" ${t.status==="denied"?"disabled":""}><svg class="ic"><use href="#i-ban"/></svg>Refus</button>
<button class="bt sm am" data-a="revoked" ${t.status==="revoked"?"disabled":""}><svg class="ic"><use href="#i-lock"/></svg>Révocation</button>
<button class="bt sm" data-a="pending" ${t.status==="pending"?"disabled":""}><svg class="ic"><use href="#i-hour"/></svg>En attente</button>
<span class="sp"></span><button class="bt sm rd" data-a="del"><svg class="ic"><use href="#i-trash"/></svg></button></div>
${t.history.length?`<div class="thi">${t.history.slice(-4).map(h=>`<div>${dtT(h.ts)} — ${esc(h.a)}${h.by?" par "+esc(h.by):""}</div>`).join("")}</div>`:""}`;
d.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{const a=b.dataset.a;a==="del"?removeTier(t.id):setTier(t.id,a)});
box.appendChild(d)})}
function renderWait(){const r=myReq();const W=$("lWait"),C=$("lChoose");
if(!waitMode||!r){W.style.display="none";C.style.display="";return}
W.style.display="";C.style.display="none";
$("wRing").className="wrg s-"+r.status;
$("wIcon").innerHTML=`<use href="#${r.status==="granted"?"i-unlock":r.status==="pending"?"i-hour":r.status==="denied"?"i-ban":"i-lock"}"/>`;
$("wTitle").textContent={pending:"Demande en attente de validation",granted:"Accès autorisé",denied:"Demande refusée",revoked:"Accès révoqué"}[r.status];
$("wMsg").textContent={pending:"L'administrateur a reçu votre demande. La réponse arrive en temps réel sur cet appareil.",
granted:"Votre accès tiers est actif : consultation complète en lecture seule.",
denied:"L'administrateur a refusé cette demande. Vous pouvez renouveler ou contacter l'administrateur.",
revoked:"L'administrateur a révoqué votre accès. La session tiers est fermée."}[r.status];
$("wName").querySelector("b").textContent=r.name;
$("wId").querySelector("b").textContent=r.id;
$("wNote").innerHTML=`<b>Statut :</b> ${STN[r.status]} · <b>Appareil :</b> ${esc(r.device)} · <b>Demande :</b> ${dtT(r.ts)}${r.decidedAt?` · <b>Décision :</b> ${dtT(r.decidedAt)}`:""}.<br>Le tiers ne peut ni modifier le projet, ni importer, ni mettre à jour l'APK.`;
const act=$("wAct");act.innerHTML="";
if(r.status==="granted"){const b=el("button","bt te",'<svg class="ic"><use href="#i-unlock"/></svg>Entrer en mode tiers');b.onclick=enterTiers;act.appendChild(b)}
if(r.status==="pending"){const b=el("button","bt",'<svg class="ic"><use href="#i-x"/></svg>Annuler ma demande');b.onclick=cancelRequest;act.appendChild(b)}
if(r.status==="denied"||r.status==="revoked"){const b=el("button","bt te",'<svg class="ic"><use href="#i-send"/></svg>Nouvelle demande');
b.onclick=()=>{TIERS=TIERS.filter(t=>t.id!==r.id);saveAcc();waitMode=false;renderLaunch()};act.appendChild(b)}}
function renderLaunch(){const eng=engines();
$("lStats").innerHTML=[["Motorisations",nf(eng.length)],["Marques",CAT.length],["Fiches",nf(FAULTS.length+DR.length)],["Domaines",DOM.length],["Révisions",allRevs().length]]
.map(([l,v])=>`<span class="ch in"><b>${v}</b> ${l}</span>`).join("");
if(waitMode&&myReq()){$("lChoose").style.display="none";$("lWait").style.display="";renderWait()}
else{$("lChoose").style.display="";$("lWait").style.display="none"}
clearGate()}
const KCd=[75,101,118,105,110,56,51,54,48,48],SALT="kf26.bench";
async function hash(s){try{if(crypto&&crypto.subtle){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s+SALT));
return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}}catch(e){}
let h=5381,g=0;const t=s+SALT;for(let i=0;i<t.length;i++){h=((h<<5)+h+t.charCodeAt(i))|0;g=((g<<7)^t.charCodeAt(i))|0}
return"f"+Math.abs(h).toString(16)+Math.abs(g).toString(16)}
async function initAdm(){admHash=await hash(String.fromCharCode.apply(null,KCd))}
function clearGate(){const i=$("admPwd");if(i){i.value="";i.setAttribute("value","");i.type="password"}
const e=$("admEye");if(e)e.innerHTML='<svg class="ic"><use href="#i-eye"/></svg>';}
async function unlockAdmin(ev){if(ev)ev.preventDefault();
const i=$("admPwd"),v=(i.value||"").trim();
const plain=String.fromCharCode.apply(null,KCd);
if(!v||v.length<4||v.toLowerCase()==="admin"){$("admErr").style.display="block";clearGate();return}
if(!admHash)await initAdm();
let ok=false;try{ok=(v===plain)||((admHash&&await hash(v))===admHash)}catch(e){ok=(v===plain)}
if(ok){clearGate();$("admErr").style.display="none";enter("admin")}
else{$("admErr").style.display="block";clearGate();toast("Code administrateur incorrect","ba")}}
function enter(role){ROLE=role;waitMode=false;
$("launch").classList.add("off");document.body.classList.remove("lk");
try{if(role==="tiers")localStorage.setItem(LS.ses,JSON.stringify({role:"tiers"}));else localStorage.removeItem(LS.ses)}catch(e){}
if(role==="admin"){const t=Date.now()+30*60*1000;$("admExp").textContent=new Date(t).toLocaleTimeString("fr-FR");
clearTimeout(admTimer);admTimer=setTimeout(lockAdmin,30*60*1000)}
applyRole();sync();renderDom();renderAll();renderBell();renderTiers();
toast(role==="admin"?"Session administrateur ouverte (30 min)":"Mode tiers actif — lecture seule",role==="admin"?"ok":"te")}
function lockAdmin(){if(ROLE!=="admin")return;ROLE=null;clearTimeout(admTimer);
const r=myReq();waitMode=!!(r&&r.status!=="granted");
$("launch").classList.remove("off");document.body.classList.add("lk");renderLaunch();applyRole();
toast("Session administrateur verrouillée","in")}
function exitApp(){if(ROLE==="admin"){lockAdmin();return}
ROLE=null;try{localStorage.removeItem(LS.ses)}catch(e){}
const r=myReq();waitMode=!!r;
$("launch").classList.remove("off");document.body.classList.add("lk");renderLaunch();applyRole()}
function enterTiers(){enter("tiers")}
function applyRole(){
const chip=$("chR");
if(ROLE==="admin"){chip.className="ch ok";$("nRole").textContent="ADMIN";$("exitB").querySelector("span").textContent="Verrouiller"}
else if(ROLE==="tiers"){const r=myReq();chip.className="ch te";$("nRole").textContent="TIERS · "+(r?r.name:"");$("exitB").querySelector("span").textContent="Quitter"}
else{chip.className="ch";$("nRole").textContent="—";$("exitB").querySelector("span").textContent="Quitter"}
$("tbAdm").classList.toggle("hd2",ROLE!=="admin");
$("roB").style.display=ROLE==="tiers"?"flex":"none";
const w=!canW();
["bSave","bImpOn","bExp","bBk","bWipe","bClearN","bRepair","bRevAllT"].forEach(id=>{const b=$(id);if(b)b.disabled=w});
document.querySelectorAll("#addEng button[type=submit],#addF button[type=submit],#addRev button[type=submit]").forEach(b=>b.disabled=w);
if(ROLE==="tiers"&&$("v-adm").classList.contains("on"))showView("diag");
if(ROLE==="admin")renderTiers()}
function live(){loadAcc();loadNf();renderBell();
if(ROLE==="tiers"){const r=myReq();
if(!r||r.status!=="granted"){ROLE=null;try{localStorage.removeItem(LS.ses)}catch(e){}
waitMode=!!r;$("launch").classList.remove("off");document.body.classList.add("lk");renderLaunch();applyRole();
toast(r&&r.status==="revoked"?"Accès tiers révoqué par l'administrateur":r&&r.status==="denied"?"Accès tiers refusé":"Session tiers fermée","wa");return}}
if(ROLE===null&&waitMode)renderWait();
if(ROLE==="admin"){const sig=TIERS.map(t=>t.id+t.status).join(",");
if(sig!==lastTierSig){const fresh=TIERS.filter(t=>t.status==="pending"&&!seenPend.has(t.id));
fresh.forEach(t=>{seenPend.add(t.id);toast(`Nouvelle demande d'accès : ${t.name}`,"wa")});
lastTierSig=sig;renderTiers();renderBell();}}}
function renderAdm(){if(!canW())return;
$("admStats").innerHTML=[["Motorisations",nf(engines().length),"cy"],["Fiches",nf(FAULTS.length),"amH"],
["Protocoles",DR.length,"vi"],["Révisions",allRevs().length,"mg"]]
.map(([l,v,c])=>`<div class="st"><div class="sv3" style="color:var(--${c})">${v}</div><div class="sl">${l}</div></div>`).join("");
renderTiers();
const box=$("bkList");
if(!BK.length)box.innerHTML=`<div class="nt">Aucune sauvegarde locale. Une sauvegarde est créée automatiquement après chaque import réussi.</div>`;
else box.innerHTML=BK.map((b,i)=>`<div class="sv"><span class="gr2"><svg class="ic"><use href="#i-save"/></svg></span>
<div style="flex:1;min-width:0"><div style="font-weight:750;font-size:13px">${new Date(b.t).toLocaleString("fr-FR")}</div>
<div class="mi">${esc(b.src)} · ${b.veh} motorisations · ${b.f} fiches · ${Math.round((b.size||0)/1024)} Ko</div></div>
<button class="bt sm gr" data-r="${i}">Restaurer</button><button class="bt sm rd" data-d="${i}"><svg class="ic"><use href="#i-trash"/></svg></button></div>`).join("");
box.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>restoreBk(+b.dataset.r));
box.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{const i=+b.dataset.d;const rm=BK.splice(i,1)[0];saveAux();renderAdm();
toast("Sauvegarde supprimée","wa",()=>{BK.splice(i,0,rm);saveAux();renderAdm()})})}
function makeBk(src){const p=JSON.stringify({cat:CAT,faults:FAULTS,revs:REVC});
BK.unshift({t:Date.now(),src,veh:engines().length,f:FAULTS.length,size:p.length,data:p});
while(BK.length>3)BK.pop();saveAux();renderAdm()}
function restoreBk(i){const b=BK[i];if(!b)return;
if(!confirm("Restaurer la sauvegarde du "+new Date(b.t).toLocaleString("fr-FR")+" ?"))return;
const before=JSON.stringify({cat:CAT,faults:FAULTS,revs:REVC});
try{const d=JSON.parse(b.data);CAT=d.cat;FAULTS=d.faults;REVC=d.revs||[];saveDB();newSearch();audit();renderAudit();renderAdm();
toast("Sauvegarde restaurée","ok",()=>{const p=JSON.parse(before);CAT=p.cat;FAULTS=p.faults;REVC=p.revs;saveDB();sync();audit();renderDom();renderAll();renderAdm()})}
catch(e){toast("Sauvegarde illisible","ba")}}
function ovlOn(on){$("ovl").classList.toggle("on",on);if(on){$("ovLog").innerHTML="";$("ovRes").innerHTML="";$("ovX").style.display="none";$("ovBar").style.width="0%";$("ovPct").textContent="0 %"}}
function olog(m,c="i"){const l=$("ovLog"),d=el("div","l"+c,`[${new Date().toLocaleTimeString("fr-FR")}] ${esc(m)}`);l.appendChild(d);l.scrollTop=l.scrollHeight}
function ostep(p,d){$("ovBar").style.width=clamp(p,0,100)+"%";$("ovPct").textContent=Math.round(clamp(p,0,100))+" %";$("ovDet").textContent=d;$("ovStep").textContent="Étape "+clamp(Math.ceil(p/17),1,6)+"/6"}
function nBrand(n){const s=String(n||"").trim();const m={"citroën":"Citroën","citroen":"Citroën","škoda":"Škoda","skoda":"Škoda","vw":"Volkswagen",
"mercedes":"Mercedes-Benz","mercedes-benz":"Mercedes-Benz","ds":"DS Automobiles","mini":"MINI"};return m[norm(s)]||m[s.toLowerCase()]||s}
function pYears(v){const s=String(v||""),m=s.match(/(20\d{2})\s*[-–/]\s*(20\d{2})/);if(m)return[+m[1],+m[2]];
const o=s.match(/(20\d{2})/);return o?[+o[1],+o[1]]:[2017,2027]}
function fGuess(f){const t=norm(f);
if(/electrique|ev\b|e tron/.test(t))return"EV";if(/phev|e hybrid|e tense|recharge|dm i|4xe/.test(t))return"P";
if(/hybrid|hybride|mhev|e tech|e hev|e power|shvs|dualjet|skyactiv x/.test(t))return"H";
if(/diesel|tdi|hdi|dci|crdi|multijet|jtd|ecoblue|bluetec|cdi|d 4d|skyactiv d|di d/.test(t))return"D";
if(/eco g|lpg|gpl/.test(t))return"G";return"E"}
function fom(bn,mn,y0,y1){const bid=slug(bn);let b=B(bid);
if(!b){b={id:bid,name:bn,country:"—",models:[]};CAT.push(b)}
let m=b.models.find(x=>slug(x.name)===slug(mn));
if(!m){m={id:bid+"-"+slug(mn),name:mn,y0:y0||2017,y1:y1||2027,seg:"Importé",brand:bid,brandName:b.name,engines:[]};b.models.push(m)}
m.y0=Math.min(m.y0,y0||m.y0);m.y1=Math.max(m.y1,y1||m.y1);return{b,m}}
function addEngTo(m,b,fam,hp,code,fuel,y0,y1,tech,dispO){
const tmp={fam,famKey:slug(fam),hp,code:code||"—",fuel:FUEL[fuel]?fuel:"E",tech:tech||""};
const gk=tmp.famKey+(fuel==="EV"?"|"+(dispO||spec(tmp).kwh||""):"");
const ex=m.engines.find(e=>e.gk===gk&&e.hp===hp);
if(ex){let ch=false;if(code&&ex.code!==code){ex.code=code;ch=true}
if(tech&&!ex.tech.includes(tech)){ex.tech=(ex.tech?ex.tech+" · ":"")+tech;ch=true}
if(y0&&y0<ex.y0){ex.y0=y0;ch=true}if(y1&&y1>ex.y1){ex.y1=y1;ch=true}return ch?"merge":"none"}
const e={key:b.id+"/"+m.id+"/"+slug(fam)+"/"+hp+"/"+m.engines.length,fam,famKey:slug(fam),hp,code:code||"—",
fuel:FUEL[fuel]?fuel:"E",y0:y0||m.y0,y1:y1||m.y1,tech:tech||"",brand:b.id,brandName:b.name,model:m.id,modelName:m.name,seg:m.seg,my0:m.y0,my1:m.y1};
if(dispO&&e.fuel==="EV"&&!/kWh/i.test(e.tech))e.tech=(e.tech?e.tech+" · ":"")+dispO+" kWh";
const s=spec(e);e.gk=e.famKey+(s.ev?"|"+(s.kwh||""):"");e.disp=s.ev?s.kwh:s.disp;
m.engines.push(e);return"add"}
function domGuess(txt){const t=norm(txt);
return DOM.filter(([d,n])=>{const k=norm(n).split(" ")[0];return t.includes(k)||
({moteur:/moteur|huile|segment|culasse/,distribution:/courroie|chaine|distribution|tendeur/,injection:/inject|pompe hp|rail|carburant/,
allumage:/bougie|allumage|prechauff|bobine/,suralim:/turbo|suralim|wastegate/,depol:/egr|fap|adblue|scr|nox|gpf/,
transmission:/boite|embrayage|dsg|dct|cvt|eat|pdk|transmission/,acoups:/a coup|acoup|vibrat|broutage/,
freinage:/frein|disque|plaquette|servofrein/,abs:/abs|esp|capteur roue/,airbag:/airbag|takata|pretension/,
ceinture:/ceinture|ancrage/,siege:/siege|occupancy/,train:/suspension|rotule|amortisseur|roulement|ressort/,
geometrie:/geometrie|parallelisme|direction|cremaillere|pneu/,portes:/porte|serrure|hayon|ouvrant|poignee/,
cle:/cle|carte|antidemarrage|keyless/,elec12:/12v|12 v|batterie 12|alternateur/,elec48:/48v|48 v|isg|mhev/,
hv:/haute tension|batterie hv|isolement|cellule|pack/,charge:/charge|obc|iccu|borne|type 2/,
autonomie:/autonomie|consommation|soh/,thermique:/refroid|ldr|thermostat|pompe a eau|surchauffe|clim/,
adas:/adas|radar|calibration|acc|autopilot/,camera:/camera|recul|buee/,telematique:/telemat|ota|esim|connectiv|ecu/,
tablette:/ecran|tablette|tactile|multimedia|mbux|idrive|sync|uconnect/,eclairage:/phare|led|eclairage|feu/,
carrosserie:/corrosion|infiltration|etancheite|hayon/}[d]||/$^/).test(t)}).map(x=>x[0])}
function ingest(data){let add=0,merge=0,fa=0,rv=0;
const pv=v=>{const bn=v.marque||v.brand||v.brandName,mn=v.modele||v.model||v.modelName;if(!bn||!mn)return;
const[my0,my1]=pYears(v.annee||v.years||v.year);const{b,m}=fom(nBrand(bn),mn,my0,my1);
const[ey0,ey1]=v.engYears?pYears(v.engYears):[my0,my1];
const hp=parseInt(String(v.puissance||v.hp||v.power||"").match(/\d+/)?.[0]||"0",10);
const fam=v.motorisation||v.fam||v.motor||v.engine||"Motorisation";
const r=addEngTo(m,b,fam,hp,v.codeMoteur||v.code||"—",v.typeCarburant||v.fuel||fGuess(fam),ey0,ey1,v.tech||v.notes||"",v.disp||v.battery);
if(r==="add")add++;else if(r==="merge")merge++;
if(Array.isArray(v.dtc)&&v.dtc.length){const id="IMP-"+slug(bn+"-"+mn+"-"+fam+"-"+hp);
if(!FAULTS.some(f=>f.id===id)){FAULTS.push({id,scope:"engine",brands:[b.id],target:fam,kind:"panne",sev:"moyen",y0:ey0,y1:ey1,
titre:"Codes défaut répertoriés — "+fam+" "+hp+" ch",sym:"Codes issus de l'import : "+v.dtc.join(", "),
pro:["Lire les codes et le contexte gelé","Contrôler les organes liés aux codes","Appliquer le protocole constructeur"],
org:v.org||"Voir codes",dtc:v.dtc,src:v.src||"Import base",dom:domGuess(fam+" "+v.dtc.join(" "))});fa++}}};
const pf=f=>{if(!f||!(f.titre||f.title))return;
const id=f.id||"IMP-F-"+slug(f.titre||f.title).slice(0,40)+"-"+Math.random().toString(36).slice(2,6);
if(FAULTS.some(x=>x.id===id))return;
const dom=(Array.isArray(f.dom)?f.dom:csv(f.dom)).filter(d=>DM[d]);
FAULTS.push({id,scope:["engine","model","brand"].includes(f.scope)?f.scope:"brand",brands:(f.brands||[slug(f.marque||f.brand||"")]).filter(Boolean),
target:f.target||f.fam||f.modele||"",kind:KIND[f.kind]?f.kind:"panne",sev:SEV[f.sev]?f.sev:"moyen",
y0:f.y0||2017,y1:f.y1||2027,titre:f.titre||f.title,sym:f.sym||f.symptome||"",
pro:Array.isArray(f.pro)?f.pro:String(f.pro||f.protocole||"Contrôle constructeur").split("|"),
org:f.org||f.organes||"",dtc:Array.isArray(f.dtc)?f.dtc:csv(f.dtc),
src:f.src||f.source||"Import",dom:dom.length?dom:domGuess((f.titre||"")+" "+(f.sym||""))});fa++};
const pr=r=>{if(!r||!r.organ||!r.newKm)return;const id=r.id||"IMP-R-"+slug((r.brands||[]).join("-")+"-"+r.organ).slice(0,50);
if(allRevs().some(x=>x.id===id))return;
REVC.push({id,brands:(r.brands||[]).map(slug).filter(Boolean),match:r.match||"",organ:r.organ,
oldKm:+r.oldKm||0,newKm:+r.newKm||0,oldMo:+r.oldMo||0,newMo:+r.newMo||0,src:r.src||"Import",note:r.note||"",y0:r.y0||2017,y1:r.y1||2027});rv++};
if(Array.isArray(data))data.forEach(x=>{if(x&&x.organ&&x.newKm)pr(x);else if(x&&(x.titre||x.title)&&!x.marque&&!x.modele)pf(x);else pv(x)});
else if(data&&typeof data==="object"){
if(Array.isArray(data.vehicles))data.vehicles.forEach(pv);
if(Array.isArray(data.experts))data.experts.forEach(pf);
if(Array.isArray(data.faults))data.faults.forEach(pf);
if(Array.isArray(data.revisions))data.revisions.forEach(pr);
if(Array.isArray(data.revsCustom))data.revsCustom.forEach(pr);
if(Array.isArray(data.tiers)&&canW())data.tiers.forEach(t=>{if(t&&t.name&&!TIERS.some(x=>x.device===t.device))TIERS.push(t)});
if(Array.isArray(data.cat)&&data.cat.length&&data.cat[0].models)data.cat.forEach(b=>b.models.forEach(m=>m.engines.forEach(e=>{
const{b:bb,m:mm}=fom(b.name,m.name,m.y0,m.y1);
const r=addEngTo(mm,bb,e.fam,e.hp,e.code,e.fuel,e.y0,e.y1,e.tech);if(r==="add")add++;else if(r==="merge")merge++})));
["customs","modelsExtra","recalls","tsb"].forEach(k=>{const arr=data[k];if(!Array.isArray(arr))return;
arr.forEach(x=>{if(k==="recalls"||k==="tsb"){if(x&&(x.marque||x.brand)&&(x.titre||x.title)){
const bn=nBrand(x.marque||x.brand),mn=x.modele||x.model||"",id="AD-"+k+"-"+slug(bn+mn+(x.titre||x.title)).slice(0,50);
if(!FAULTS.some(f=>f.id===id)){FAULTS.push({id,scope:mn?"model":"brand",brands:[slug(bn)],target:mn?slug(bn)+"-"+slug(mn):"",
kind:k==="recalls"?"rappel":"tsb",sev:"eleve",y0:pYears(x.annee||x.years)[0],y1:pYears(x.annee||x.years)[1],
titre:x.titre||x.title,sym:x.sym||x.detail||"",pro:String(x.pro||"Vérifier éligibilité VIN|Appliquer la procédure constructeur").split("|"),
org:x.org||"",dtc:csv(x.dtc),src:x.src||x.source||"auto-diagnostic",dom:csv(x.dom).filter(d=>DM[d]).length?csv(x.dom).filter(d=>DM[d]):domGuess((x.titre||"")+" "+(x.sym||""))});fa++;}}}
else pv(x)})});
if(data.overrides&&typeof data.overrides==="object")Object.values(data.overrides).forEach(v=>{if(v&&typeof v==="object")pv(v)})}
return{add,merge,fadd:fa,radd:rv}}
async function importFile(file){if(!canW()){toast("Import réservé au mode administrateur","ba");return}
ovlOn(true);$("ovT").textContent="Import de fichier";$("ovS").textContent=file.name;
const before=engines().length;$("ovB").textContent=before;$("ovA").textContent="+0";$("ovM").textContent="~0";$("ovAf").textContent=before;
ostep(8,"Lecture du fichier");olog("Lecture : "+file.name,"t");
try{const txt=await file.text();olog(txt.length+" octets lus","s");
ostep(24,"Validation JSON");await sleep(150);
let data;try{data=JSON.parse(txt);olog("JSON valide","s")}catch(e){throw new Error("JSON invalide : "+e.message)}
ostep(42,"Analyse du format");await sleep(150);
const fmt=Array.isArray(data)?"tableau":(data.cat?"export KEV":(data.vehicles?"export véhicules":(data.customs||data.overrides||data.recalls||data.tiers?"sauvegarde auto-diagnostic":"objet")));
olog("Format détecté : "+fmt,"i");
const snap=JSON.stringify({cat:CAT,faults:FAULTS,revs:REVC});
ostep(60,"Fusion par identifiants");await sleep(170);
const r=ingest(data);$("ovA").textContent="+"+r.add;$("ovM").textContent="~"+r.merge;
olog(`${r.add} motorisation(s), ${r.merge} fusion(s), ${r.fadd} fiche(s), ${r.radd} révision(s)`,"s");
if(!r.add&&!r.merge&&!r.fadd&&!r.radd){ostep(100,"Terminé");olog("Fichier valide mais aucune donnée exploitable","w");
$("ovRes").innerHTML=`<div class="nt wa"><b>Fichier vide ou sans donnée compatible.</b> Format reconnu (${esc(fmt)}) mais tableaux vides. La base livrée de <b>${nf(before)}</b> motorisations est <b>conservée intacte</b>.</div>`;
$("ovX").style.display="block";$("ovAf").textContent=engines().length;toast("Fichier vide — base conservée","wa");return}
ostep(78,"Sauvegarde locale");await sleep(150);makeBk("import fichier : "+file.name);olog("Sauvegarde automatique créée","s");
ostep(90,"Écriture de la base");saveDB();
ostep(100,"Vérification d'intégrité");await sleep(170);audit();olog("Intégrité : "+AUDIT.score+"%","s");
$("ovAf").textContent=engines().length;
$("ovRes").innerHTML=`<div class="nt ok"><b>Import intégré sans blocage.</b><br>Motorisations : ${nf(before)} → <b>${nf(engines().length)}</b> · Fiches : <b>${nf(FAULTS.length)}</b> · Révisions : <b>${allRevs().length}</b><br>Intégrité : <b>${AUDIT.score}%</b> · sauvegarde locale créée.</div>`;
sync();renderDom();renderAll();renderAudit();renderAdm();notify("import",`Import fichier : +${r.add} motorisations, +${r.fadd} fiches`,"");
toast("Import réussi : +"+r.add+" motorisations","ok",()=>{const d=JSON.parse(snap);CAT=d.cat;FAULTS=d.faults;REVC=d.revs;saveDB();sync();audit();renderDom();renderAll();renderAdm();toast("Import annulé","in")})}
catch(e){olog("Échec : "+e.message,"e");
$("ovRes").innerHTML=`<div class="nt ba"><b>Import interrompu.</b> ${esc(e.message)}<br>La base existante n'a pas été modifiée.</div>`;
toast("Import échoué — base préservée","ba")}
$("ovX").style.display="block"}
const SRC=[["faults2019.js","F2019"],["update2026.js","BATCH_2026_ISSUES"],["premium22.js","PREMIUM_EXPERT"],["app.js","BRAND_EXPERT"]];
async function importOnline(){if(!canW()){toast("Import réservé au mode administrateur","ba");return}
if(!navigator.onLine){toast("Connexion requise","ba");return}
ovlOn(true);$("ovT").textContent="Import massif en ligne";$("ovS").textContent="Sources auto-diagnostic · complément de la base livrée";
const before=engines().length,beforeF=FAULTS.length;
$("ovB").textContent=before;$("ovA").textContent="+0";$("ovM").textContent="~0";$("ovAf").textContent=before;
const snap=JSON.stringify({cat:CAT,faults:FAULTS,revs:REVC});let ok=0,found=0;
ostep(6,"Initialisation");olog(`Base livrée : ${before} motorisations, ${beforeF} fiches, ${DR.length} protocoles`,"t");
for(let i=0;i<SRC.length;i++){const[file,name]=SRC[i];
ostep(10+i*18,`Source ${i+1}/${SRC.length} : ${file}`);olog("Récupération "+file,"t");
try{const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),11000);
const r=await fetch("https://raw.githubusercontent.com/expertkevin06-cell/auto-diagnostic/main/"+file,{signal:ctl.signal,cache:"no-store"});
clearTimeout(to);if(!r.ok){olog("HTTP "+r.status+" — source ignorée","w");continue}
const code=await r.text();ok++;olog(code.length+" octets reçus","s");
const m=code.match(new RegExp("(?:const|let|var)\\s+"+name+"\\s*=\\s*\\[([\\s\\S]*?)\\n\\s*\\];"));
if(!m){olog(name+" introuvable","w");continue}
let arr=[];try{arr=new Function("return ["+m[1]+"];")()}catch(e){olog("Analyse impossible","w");continue}
if(!Array.isArray(arr)||!arr.length){olog(name+" vide","w");continue}
olog(name+" : "+arr.length+" entrées","s");
arr.forEach(row=>{if(!Array.isArray(row)||row.length<6)return;const bn=nBrand(row[0]);if(!bn)return;
const isI=row.length>=10&&typeof row[3]==="string"&&typeof row[4]==="string";
const motor=row[1],title=isI?row[3]:row[2],sym=isI?row[4]:row[3],pro=isI?row[5]:row[4],org=isI?row[6]:row[5],
dtc=isI?row[7]:row[6],src=isI?row[8]:row[7],yrs=isI?row[9]:row[8];
if(!title)return;const[y0,y1]=pYears(yrs);const id="SRC-"+slug(bn+"-"+title).slice(0,60);
if(FAULTS.some(f=>f.id===id))return;
const dom=domGuess(title+" "+sym+" "+org);
FAULTS.push({id,scope:motor?"engine":"brand",brands:[slug(bn)],target:motor||"",
kind:/rappel|safety|nhtsa|kba/i.test(src||"")?"rappel":/campagne/i.test(src||"")?"campagne":/tsb|bulletin/i.test(src||"")?"tsb":"panne",
sev:/incendie|rupture|frein|airbag|batterie hv|direction/i.test(title+" "+sym)?"critique":/courroie|chaine|turbo|inject|adblue|egr|fap/i.test(title)?"eleve":"moyen",
y0,y1,titre:title,sym:sym||"",pro:String(pro||"Contrôle constructeur").split(/\||\d\)\s*/).filter(s=>s&&s.length>3),
org:org||"",dtc:String(dtc||"").split(/[,\/\s]+/).map(s=>s.trim()).filter(s=>/^[PCBU]\d{4}$/i.test(s)),
src:src||"Source auto-diagnostic",dom:dom.length?dom:["moteur"]});found++})}
catch(e){olog("Source indisponible : "+(e.name==="AbortError"?"délai dépassé":e.message),"w")}
$("ovM").textContent="~"+found;await sleep(110)}
ostep(80,"Sauvegarde locale");await sleep(140);
if(found){makeBk("import massif en ligne");olog("Sauvegarde automatique créée","s")}
ostep(92,"Écriture");saveDB();ostep(100,"Vérification d'intégrité");await sleep(170);audit();
$("ovAf").textContent=engines().length;olog("Intégrité : "+AUDIT.score+"%","s");
if(!found){$("ovRes").innerHTML=`<div class="nt wa"><b>Aucune donnée rapatriée.</b> ${ok}/${SRC.length} source(s) joignable(s).<br>La base livrée (<b>${nf(before)}</b> motorisations, <b>${nf(beforeF)}</b> fiches, <b>${DR.length}</b> protocoles) reste <b>intégralement disponible hors ligne</b>.</div>`;
toast("Sources sans donnée — base livrée conservée","wa")}
else{$("ovRes").innerHTML=`<div class="nt ok"><b>Import massif terminé sans blocage.</b><br>Sources : ${ok}/${SRC.length} · <b>+${found}</b> fiche(s)<br>Fiches : ${nf(beforeF)} → <b>${nf(FAULTS.length)}</b> · Intégrité : <b>${AUDIT.score}%</b></div>`;
notify("import",`Import massif : +${found} fiches`,"");
toast("+"+found+" fiches importées","ok",()=>{const d=JSON.parse(snap);CAT=d.cat;FAULTS=d.faults;REVC=d.revs;saveDB();sync();audit();renderDom();renderAll();renderAdm();toast("Import annulé","in")})}
sync();renderDom();renderAll();renderAudit();renderAdm();$("ovX").style.display="block"}
function exportDB(){if(!canW()){toast("Export réservé au mode administrateur","ba");return}
const p={app:"KEV FUSION 2026",version:11,exported:new Date().toISOString(),
integrity:AUDIT?{score:AUDIT.score,bad:AUDIT.bad,warn:AUDIT.warn}:null,
domains:DOM.map(d=>({id:d[0],name:d[1]})),cat:CAT,faults:FAULTS,protocols:rules(null),
revisions:RV,revisionsCustom:REVC,tiers:TIERS,notes:NOTES,views:VIEWS,dtc:DTC};
const b=new Blob([JSON.stringify(p,null,1)],{type:"application/json"}),a=el("a");
a.href=URL.createObjectURL(b);a.download="kev-fusion-2026-"+new Date().toISOString().slice(0,10)+".json";
document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},400);toast("Export complet téléchargé","ok")}
function renderAll(){$("nBase").textContent=nf(engines().length);
$("nFault").textContent=nf(FAULTS.length+(FIL.rules?DR.length:0));
renderDiag();renderFaults();renderServ();renderCov();renderCat();if(canW())renderAdm();reveal()}
function showView(v){document.querySelectorAll(".vw").forEach(s=>s.classList.toggle("on",s.id==="v-"+v));
document.querySelectorAll(".tb").forEach(t=>t.setAttribute("aria-selected",String(t.dataset.v===v)));
if(v==="int")renderAudit();if(v==="cat")renderCat();if(v==="dom")renderCov();if(v==="serv")renderServ();
window.scrollTo({top:0,behavior:"smooth"});reveal()}
let io=null;
function reveal(){const els=document.querySelectorAll(".vw.on .rv:not(.in)");
if(!("IntersectionObserver"in window)){els.forEach(e=>e.classList.add("in"));return}
if(!io)io=new IntersectionObserver(en=>en.forEach(x=>{if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}}),{threshold:.05});
els.forEach(e=>io.observe(e))}
function bind(){
CO.brand=new Combo($("cBrand"),"Toutes les marques",v=>{SEL={brand:v,model:"",year:"",fam:"",hp:""};FSEL.clear();sync();renderDom();renderAll()});
CO.model=new Combo($("cModel"),"Choisir d'abord une marque",v=>{SEL.model=v;SEL.year="";SEL.fam="";SEL.hp="";FSEL.clear();sync();renderDom();renderAll()});
CO.year=new Combo($("cYear"),"Toutes les années",v=>{SEL.year=v;sync();renderDom();renderAll()});
CO.fam=new Combo($("cFam"),"Toutes cylindrées / types",v=>{SEL.fam=v;SEL.hp="";sync();renderDom();renderAll()});
CO.hp=new Combo($("cHp"),"Toutes puissances",v=>{SEL.hp=v;sync();renderDom();renderAll()});
document.querySelectorAll(".tb").forEach(t=>t.onclick=()=>{if(t.dataset.v==="adm"&&!canW()){toast("Réservé à l'administrateur","ba");return}showView(t.dataset.v)});
$("exitB").onclick=exitApp;
$("bellB").onclick=openNf;$("nfX").onclick=closeNf;
$("nfRead").onclick=()=>{NOTIF.forEach(n=>n.read=true);saveNf();renderBell();renderNf();toast("Notifications marquées lues","ok")};
$("nfClear").onclick=()=>{if(!canW()){toast("Réservé à l'administrateur","ba");return}const s=NOTIF.slice();NOTIF=[];saveNf();renderBell();renderNf();
toast("Notifications vidées","wa",()=>{NOTIF=s;saveNf();renderBell();renderNf()})};
$("nfGo").onclick=()=>{closeNf();if(canW())showView("adm");else toast("Réservé à l'administrateur","ba")};
$("bNew").onclick=newSearch;
let qt=null;$("q").oninput=()=>{FIL.q=$("q").value;clearTimeout(qt);qt=setTimeout(()=>{renderDiag();renderFaults();renderCov()},170)};
$("sevSeg").querySelectorAll("button").forEach(b=>b.onclick=()=>{const s=b.dataset.s,on=FIL.sev.has(s);
on?FIL.sev.delete(s):FIL.sev.add(s);b.setAttribute("aria-pressed",String(!on));renderAll()});
$("selKind").onchange=()=>{FIL.kind=$("selKind").value;renderAll()};
$("selSort").onchange=()=>{FIL.sort=$("selSort").value;renderAll()};
$("kmY").oninput=()=>{USE.km=+$("kmY").value;$("kmYL").textContent=nf(USE.km)+" km/an";renderServ()};
$("selSev").onchange=()=>{USE.sev=$("selSev").value;renderServ();toast("Sollicitation : "+$("selSev").selectedOptions[0].text,"in")};
$("selClim").onchange=()=>{USE.clim=$("selClim").value;renderServ();toast("Climat : "+$("selClim").selectedOptions[0].text,"in")};
$("tgB").onclick=()=>{FIL.bs=!FIL.bs;$("tgB").setAttribute("aria-pressed",String(FIL.bs));renderDom();renderAll()};
$("tgR").onclick=()=>{FIL.rules=!FIL.rules;$("tgR").setAttribute("aria-pressed",String(FIL.rules));renderDom();renderAll()};
$("tgD").onclick=()=>{FIL.done=!FIL.done;$("tgD").setAttribute("aria-pressed",String(FIL.done));renderDom();renderAll()};
$("bDomAll").onclick=()=>{FIL.dom.clear();renderDom();renderAll();toast("Tous les domaines affichés","in")};
$("bCovClear").onclick=()=>{FIL.dom.clear();renderDom();renderAll();toast("Filtres domaines réinitialisés","in")};
$("bRand").onclick=()=>{const e=engines();if(e.length)loadEng(e[Math.floor(Math.random()*e.length)])};
$("bSave").onclick=()=>{if(!canW()){toast("Réservé à l'administrateur","ba");return}
if(!SEL.brand){toast("Sélectionnez au moins une marque","wa");return}
const b=B(SEL.brand),m=SEL.model?M(SEL.brand,SEL.model):null;
const f=SEL.fam&&m?famsOf(SEL.brand,SEL.model,SEL.year).find(x=>x.k===SEL.fam):null;
const label=[b.name,m?m.name:null,SEL.year||null,f?famL(f.e):null,SEL.hp?SEL.hp+" ch":null].filter(Boolean).join(" › ");
const name=prompt("Nom de la vue mémorisée :",label);if(!name)return;
VIEWS.unshift({name:name.slice(0,60),label,sel:Object.assign({},SEL),q:FIL.q,dom:[...FIL.dom],use:Object.assign({},USE)});
saveAux();renderViews();toast("Vue mémorisée","ok")};
$("bDtc").onclick=()=>{const c=($("dtcIn").value||"").trim().toUpperCase(),out=$("dtcOut");
if(!c){out.innerHTML="";return}const d=DTC[c],rel=pool(false).filter(f=>f.dtc.includes(c));
out.innerHTML=(d?`<div class="nt in"><b>${esc(c)} — ${esc(d[0])}</b><br>Causes probables : ${esc(d[1])}<br>Contrôle : ${esc(d[2])}</div>`
:`<div class="nt wa"><b>${esc(c)}</b> absent du dictionnaire local. Consultez OBD-Codes ou la documentation constructeur.</div>`)
+(ready()&&rel.length?`<div class="mi" style="margin-top:8px">${rel.length} fiche(s) associée(s) :</div>`+rel.slice(0,6).map(f=>
`<div class="fc v-${f.sev}" style="margin-top:7px;cursor:default"><div class="ft" style="font-size:13px">${esc(f.titre)}</div>
<div class="fm"><span class="pl ${KC[f.kind]}">${KIND[f.kind]}</span><span class="pl">${f.y0}–${f.y1}</span></div></div>`).join(""):"")};
$("dtcIn").onkeydown=e=>{if(e.key==="Enter")$("bDtc").click()};
$("bSelAll").onclick=()=>{const a=current();if(FSEL.size===a.length)FSEL.clear();else a.forEach(f=>FSEL.add(f.id));renderFaults()};
$("bBulkDone").onclick=()=>{if(!canW())return;const ids=[...FSEL],prev=ids.map(i=>[i,NOTES[i]?Object.assign({},NOTES[i]):null]);
ids.forEach(i=>NOTES[i]=Object.assign({},NOTES[i],{done:true}));saveAux();FSEL.clear();renderAll();
toast(ids.length+" fiche(s) traitée(s)","ok",()=>{prev.forEach(([i,v])=>{if(v)NOTES[i]=v;else delete NOTES[i]});saveAux();renderAll()})};
$("bBulkCopy").onclick=()=>{const a=current().filter(f=>FSEL.has(f.id));
const t=a.map(f=>`${f.titre} [${KIND[f.kind]} · ${SEV[f.sev].n} · ${f.y0}-${f.y1}]\nDomaines : ${(f.dom||[]).map(d=>DM[d]?DM[d].n:d).join(", ")}\n${f.sym}\n${f.pro.map((p,i)=>(i+1)+") "+p).join("\n")}\nOrganes : ${f.org}\nDTC : ${f.dtc.join(", ")}\nSource : ${f.src}`).join("\n\n---\n\n");
navigator.clipboard?.writeText(t).then(()=>toast(a.length+" fiche(s) copiée(s)","ok"),()=>toast("Copie indisponible","wa"))};
$("bPrint").onclick=()=>window.print();
$("bCopyPlan").onclick=()=>{const e=resolved()[0];if(!ready()){toast("Sélectionnez une motorisation complète","wa");return}
const s=spec(e),rv=revsFor(e);
const t=`PLAN D'ENTRETIEN — ${e.brandName} ${e.modelName} ${famL(e)} ${e.hp} ch (${kw(e.hp)} kW)\nCode moteur ${e.code} · ${s.ev?s.kwh+" kWh / "+s.volt+" V":s.disp+" cm³ / "+s.lay} · ${e.y0}-${e.y1}\nUsage : ${nf(USE.km)} km/an · ${USE.sev} · ${USE.clim}\n`+
(rv.length?"\nINTERVALLES RÉVISÉS :\n"+rv.map(r=>` • ${r.organ} : ${r.oldKm?nf(r.oldKm)+" km":"sans échéance"} → ${nf(r.newKm)} km${r.newMo?" / "+moT(r.newMo):""} (${r.src})`).join("\n"):"")+
planFor(e).map(x=>`\n${nf(x.km)} km (≈ ${moT(x.mo)})\n`+x.ops.map(o=>" • "+o.t+(o.r?" [RÉVISÉ]":o.c?" [CRITIQUE]":"")).join("\n")).join("\n");
navigator.clipboard?.writeText(t).then(()=>toast("Plan copié","ok"),()=>toast("Copie indisponible","wa"))};
$("bRevAll").onclick=()=>{const b=$("revAllBox");b.style.display=b.style.display==="none"?"block":"none";
if(b.style.display==="block"){renderRevAll();b.scrollIntoView({behavior:"smooth",block:"start"})}};
let rqt=null;$("revQ").oninput=()=>{revQ=$("revQ").value;clearTimeout(rqt);rqt=setTimeout(renderRevAll,160)};
let ct=null;$("catQ").oninput=()=>{CUI.q=$("catQ").value;CUI.page=0;clearTimeout(ct);ct=setTimeout(renderCat,160)};
document.querySelectorAll("#catT th.so").forEach(th=>th.onclick=()=>{const k=th.dataset.k;
if(CUI.sort===k)CUI.dir*=-1;else{CUI.sort=k;CUI.dir=1}renderCat()});
$("catP").onclick=()=>{CUI.page--;renderCat()};$("catN").onclick=()=>{CUI.page++;renderCat()};
$("bCatAll").onclick=()=>{if(CUI.sel.size)CUI.sel.clear();else engines().slice(0,200).forEach(e=>CUI.sel.add(e.key));renderCat()};
$("bCatLoad").onclick=()=>{const e=engines().find(x=>x.key===[...CUI.sel][0]);if(e)loadEng(e)};
$("bAudit").onclick=()=>{audit();renderAudit();toast("Audit terminé — intégrité "+AUDIT.score+"%","ok")};
$("bRepair").onclick=autoRepair;
$("admForm").onsubmit=unlockAdmin;
$("admPwd").addEventListener("focus",clearGate);
$("admPwd").addEventListener("input",e=>{if(/admin/i.test(e.target.value))e.target.value=""});
$("admEye").onclick=()=>{const i=$("admPwd");const show=i.type==="password";i.type=show?"text":"password";
$("admEye").innerHTML=`<svg class="ic"><use href="#${show?"i-eyeoff":"i-eye"}"/></svg>`};
$("tiersForm").onsubmit=e=>{e.preventDefault();requestAccess($("tiersName").value)};
$("wBack").onclick=()=>{waitMode=false;renderLaunch()};
$("wAdmin").onclick=()=>{waitMode=false;renderLaunch();setTimeout(()=>$("admPwd").focus(),200)};
$("bLock").onclick=lockAdmin;
$("tiersQ").oninput=renderTiers;$("tiersFil").onchange=renderTiers;
$("bRevAllT").onclick=()=>{if(!canW())return;const g=TIERS.filter(t=>t.status==="granted");
if(!g.length){toast("Aucun tiers autorisé","in");return}
if(!confirm("Révoquer tous les accès autorisés ("+g.length+") ?"))return;
const prev=g.map(t=>t.status);g.forEach(t=>{t.status="revoked";t.decidedAt=Date.now();t.history.push({ts:Date.now(),a:"revoked",by:"admin"})});
saveAcc();renderTiers();renderBell();notify("revoke",`${g.length} accès révoqués`,"");
toast(g.length+" accès révoqués","wa",()=>{g.forEach((t,i)=>t.status=prev[i]);saveAcc();renderTiers();renderBell()})};
$("fileImp").onchange=e=>{const f=e.target.files[0];if(f)importFile(f);e.target.value=""};
$("bImpOn").onclick=importOnline;$("bExp").onclick=exportDB;
$("bBk").onclick=()=>{if(!canW()){toast("Mode administrateur requis","ba");return}makeBk("manuelle");toast("Sauvegarde locale créée","ok")};
$("ovX").onclick=()=>ovlOn(false);$("dwX").onclick=closeDw;$("scrim").onclick=()=>{closeDw();closeNf()};
document.addEventListener("keydown",e=>{
if(e.key==="Escape"){if(openC)openC.close();else if($("drawer").classList.contains("on"))closeDw();
else if($("notifDw").classList.contains("on"))closeNf();
else if($("ovl").classList.contains("on")&&$("ovX").style.display!=="none")ovlOn(false)}
if(e.altKey&&(e.key==="r"||e.key==="R")){e.preventDefault();newSearch()}
if(e.key==="/"&&!/input|textarea|select/i.test(document.activeElement.tagName)){e.preventDefault();$("q").focus()}});
const afDom=$("afDom");DOM.forEach(([id,n,ic,c])=>{const b=el("button","dc");b.type="button";b.dataset.on="0";b.dataset.d=id;
b.innerHTML=`<svg class="ic"><use href="#${ic}"/></svg>${esc(n)}`;
b.onclick=()=>{b.dataset.on=b.dataset.on==="1"?"0":"1"};afDom.appendChild(b)});
$("addEng").onsubmit=e=>{e.preventDefault();if(!canW()){toast("Mode administrateur requis","ba");return}
const f=e.target,[my0,my1]=pYears(f.aeY.value);
const{b,m}=fom(nBrand(f.aeB.value),f.aeM.value.trim(),my0,my1);
const r=addEngTo(m,b,f.aeF.value.trim(),parseInt(f.aeH.value,10)||0,f.aeC.value.trim(),f.aeU.value,my0,my1,f.aeT.value.trim(),f.aeD.value.trim());
if(r==="none"){toast("Cette motorisation existe déjà","wa");return}
saveDB();sync();audit();renderDom();renderAll();renderAdm();f.reset();toast(r==="add"?"Motorisation ajoutée":"Motorisation enrichie","ok")};
$("addF").onsubmit=e=>{e.preventDefault();if(!canW()){toast("Mode administrateur requis","ba");return}
const brands=csv($("afB").value).map(slug).filter(Boolean);
if(!brands.length){toast("Au moins une marque valide","wa");return}
const dom=[...$("afDom").querySelectorAll('[data-on="1"]')].map(b=>b.dataset.d);
if(!dom.length){toast("Sélectionnez au moins un domaine","wa");return}
FAULTS.push({id:"USR-"+Date.now().toString(36),scope:$("afSc").value,brands,target:$("afG").value.trim(),kind:$("afK").value,
sev:$("afS").value,y0:+$("afY0").value||2017,y1:+$("afY1").value||2027,titre:$("afT").value.trim(),sym:$("afSy").value.trim(),
pro:$("afP").value.split("\n").map(s=>s.trim()).filter(Boolean),org:$("afO").value.trim(),
dtc:csv($("afD").value).map(s=>s.toUpperCase()),src:$("afSr").value.trim(),dom});
saveDB();audit();renderDom();renderAll();renderAdm();e.target.reset();$("afY0").value=2017;$("afY1").value=2027;
$("afDom").querySelectorAll("[data-on]").forEach(b=>b.dataset.on="0");toast("Fiche enregistrée","ok")};
$("addRev").onsubmit=e=>{e.preventDefault();if(!canW()){toast("Mode administrateur requis","ba");return}
const brands=csv($("arB").value).map(slug).filter(Boolean);
if(!brands.length){toast("Au moins une marque valide","wa");return}
REVC.push({id:"USR-R-"+Date.now().toString(36),brands,match:$("arM").value.trim(),organ:$("arO").value.trim(),
oldKm:+$("arOK").value||0,newKm:+$("arNK").value||0,oldMo:+$("arOM").value||0,newMo:+$("arNM").value||0,
src:$("arS").value.trim(),note:$("arN").value.trim(),y0:2017,y1:2027});
saveDB();audit();renderAll();renderAdm();e.target.reset();$("arOK").value=240000;$("arNK").value=160000;$("arOM").value=120;$("arNM").value=96;
toast("Révision enregistrée","ok")};
$("bWipe").onclick=()=>{if(!canW()){toast("Mode administrateur requis","ba");return}
if(!confirm("Réinitialiser sur la base livrée ? Les ajouts et imports seront perdus (annulable)."))return;
const snap=JSON.stringify({cat:CAT,faults:FAULTS,revs:REVC});resetSeed();newSearch();audit();renderAudit();renderAdm();
toast("Base réinitialisée","wa",()=>{const d=JSON.parse(snap);CAT=d.cat;FAULTS=d.faults;REVC=d.revs;saveDB();sync();audit();renderDom();renderAll();renderAdm()})};
$("bClearN").onclick=()=>{if(!canW()){toast("Mode administrateur requis","ba");return}
const snap=JSON.stringify(NOTES);NOTES={};saveAux();renderAll();
toast("Notes et statuts effacés","wa",()=>{NOTES=JSON.parse(snap);saveAux();renderAll()})};
const net=()=>{const c=$("chN"),t=$("nNet");
if(navigator.onLine){let s="En ligne";try{const k=navigator.connection;if(k&&k.effectiveType)s=k.effectiveType.toUpperCase()}catch(e){}
c.className="ch ok";t.textContent=s}else{c.className="ch ba";t.textContent="Hors ligne"}};
net();window.addEventListener("online",()=>{net();toast("Connexion rétablie","ok")});
window.addEventListener("offline",()=>{net();toast("Mode hors ligne — base locale active","wa")});setInterval(net,15000);
try{BC.onmessage=()=>{loadAcc();loadNf();live();if(canW())renderAll()}}catch(e){}
window.addEventListener("storage",e=>{if([LS.acc,LS.nf,LS.db].includes(e.key)){loadAcc();loadNf();if(e.key===LS.db)loadDB();live();if(canW())renderAll()}});
setInterval(live,1200);}
function boot(){try{
if(typeof RAW==="undefined"||typeof FR==="undefined"||typeof DOM==="undefined"){
const f=document.querySelector(".lfo");if(f)f.innerHTML="<b style='color:#fca5a5'>data.js absent ou incomplet — recopiez data.js depuis le dépôt.</b>";return;}
initAdm();initDevice();loadAux();loadAcc();loadNf();
if(!loadDB())resetSeed();
if(!CAT.length||!engines().length)resetSeed();
if(!FAULTS.length)FAULTS=FR.map(f=>Object.assign({},f));
bind();sync();audit();renderDom();renderAll();renderBell();
$("nInt").textContent=AUDIT.score+"%";
let ses=null;try{ses=JSON.parse(localStorage.getItem(LS.ses)||"null")}catch(e){}
const r=myReq();
if(ses&&ses.role==="tiers"&&r&&r.status==="granted"){enter("tiers")}
else{waitMode=!!r;$("launch").classList.remove("off");document.body.classList.add("lk");renderLaunch()}
setTimeout(()=>{clearGate();const t=$("nNet");if(t&&t.textContent==="…"){$("chN").className="ch "+(navigator.onLine?"ok":"ba");t.textContent=navigator.onLine?"En ligne":"Hors ligne"}},900);
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
}catch(err){console.error(err);
try{resetSeed();bind();sync();audit();renderDom();renderAll()}catch(e2){}
toast("Récupération automatique effectuée","wa")}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
