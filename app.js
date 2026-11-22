/* ═══ KEV FUSION 2026 — MOTEUR v13 (défensif, chaque phase isolée) ═══ */
(function(){
"use strict";
var K=window.KF||{err:function(){},set:function(){},unlock:function(){},lock:function(){}};
var D=window.KFD;
function $(i){return document.getElementById(i)}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function el(t,c,h){var n=document.createElement(t);if(c)n.className=c;if(h!=null)n.innerHTML=h;return n}
function safe(fn,name){try{return fn()}catch(e){K.err(name+" : "+(e&&e.message||e));return null}}
if(!D||!D.cat||!D.faults||!D.dom){
  K.set([{ok:false,l:"data.js chargé (window.KFD)",d:"absent ou incomplet",f:true},
         {ok:true,l:"Noyau d'authentification",d:"mot de passe opérationnel"}]);
  return;
}
var FUEL=D.fuel,SEV=D.sev,KIND=D.kind,DOM=D.dom;
var DM={};DOM.forEach(function(d){DM[d[0]]={n:d[1],i:d[2],c:d[3]}});
var CV={am:"amH",rd:"rd",gr:"gr",bl:"bl",vi:"vi",te:"te",mg:"mg",cy:"cy"};
var KC={rappel:"kr",campagne:"kc",tsb:"kt",panne:"kp"},SC={critique:"sc",eleve:"se",moyen:"sm",info:"si"};
var YMIN=2017,YMAX=2027;
var ENG=D.eng.map(function(r){return [new RegExp(r[0]),r[1],r[2],r[3],r[4],r[5]]});
var EVA=D.eva.map(function(r){return [new RegExp(r[0]),r[1],r[2],r[3]]});
var TQ=D.tq,DTC=D.dtc;
function NFD(s){return String(s==null?"":s).normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function norm(s){return NFD(s).toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}
function slug(s){return NFD(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function yy(v){var n=parseInt(v,10);return n<100?2000+n:n}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function uniq(a){return a.filter(function(x,i){return a.indexOf(x)===i})}
function nf(n){return Number(n).toLocaleString("fr-FR")}
function kw(h){return Math.round(h/1.35962)}
function csv(s){return String(s||"").split(",").map(function(x){return x.trim()}).filter(Boolean)}
function moT(m){if(!m)return"—";var y=Math.floor(m/12),r=m%12;return (y?y+" ans":"")+(y&&r?" ":"")+(r?r+" mois":"")}
function dtT(t){return new Date(t).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"})}
function sleep(m){return new Promise(function(r){setTimeout(r,m)})}
function hl(t,q){t=String(t==null?"":t);if(!q)return esc(t);
var a=NFD(t).toLowerCase(),b=NFD(q).toLowerCase(),i=a.indexOf(b);
if(i<0||!b)return esc(t);return esc(t.slice(0,i))+"<mark>"+esc(t.slice(i,i+b.length))+"</mark>"+esc(t.slice(i+b.length))}
function alias(n){var s=norm(n),x=[];
if(s.indexOf("skoda")>=0)x.push("skoda");if(s.indexOf("citroen")>=0)x.push("citroen");
if(s.indexOf("ds automobiles")>=0)x.push("ds");if(s.indexOf("mercedes")>=0)x.push("mercedes benz mb");
if(s.indexOf("land")>=0)x.push("landrover");if(s.indexOf("lynk")>=0)x.push("lynk co");return x.join(" ")}
function spec(e){
var code=String(e.code||"").toUpperCase(),ev=e.fuel==="EV";
var b=(String(e.tech||"").match(/([\d]+[,.]?[\d]*)\s*kWh/i)||[])[1];
var kwh=b?parseFloat(String(b).replace(",",".")):null;
if(ev){var a=["Synchrone aimants permanents",400,"Plateforme EV"];
for(var i=0;i<EVA.length;i++)if(EVA[i][0].test(code)){a=[EVA[i][1],EVA[i][2],EVA[i][3]];break}
var v=(String(e.tech||"").match(/(400|800)\s*V/i)||[])[1];
return{ev:1,kwh:kwh,arch:a[0],volt:v?+v:a[1],plat:a[2],disp:null,cyl:null,
lay:e.hp>350?"Double moteur AWD":"Moteur unique",feed:"Électrique · onduleur triphasé",
dist:"Réducteur rapport fixe",tq:null,exact:1}}
var s=null;for(var j=0;j<ENG.length;j++)if(ENG[j][0].test(code)){s=ENG[j];break}
var fl=(String(e.fam||"").match(/(\d[.,]\d)/)||[])[1];
var nom=fl?Math.round(parseFloat(fl.replace(",","."))*1000):null;
var disp=s?s[1]:nom,cyl=s?s[2]:(disp?(disp<1300?3:disp<2600?4:disp<3400?6:8):null);
var k1=slug(String(e.code||"").split(/[^A-Za-z0-9-]/)[0])+"|"+e.hp,k2=slug(e.fam)+"|"+e.hp;
return{ev:0,kwh:null,disp:disp,exact:!!s,cyl:cyl,lay:s?s[3]:(cyl?cyl+" en ligne":"—"),
feed:s?s[4]:(e.fuel==="D"?"Diesel common rail":"Essence injection"),
dist:s?s[5]:(/chaîne|chaine/i.test(e.tech||"")?"Chaîne":/courroie/i.test(e.tech||"")?"Courroie":"—"),
tq:TQ[k1]||TQ[k2]||null}}
function famL(e){var s=spec(e);
if(s.ev)return s.kwh?"Électrique "+String(s.kwh).replace(".",",")+" kWh":"Électrique";
var L=s.disp?(s.disp/1000).toFixed(1).replace(".",",")+" ":"";
return (L+String(e.fam||"").replace(/^\d[.,]\d\s*/,"").replace(/\s*\d{2,4}\s*ch/i,"").trim()).trim()||e.fam}
function famM(e){var s=spec(e);
return s.ev?((s.kwh?s.kwh+" kWh · ":"")+s.volt+" V · "+s.plat):
((s.disp?s.disp+" cm³":"cyl. n.c.")+(s.cyl?" · "+s.cyl+" cyl.":"")+" · "+FUEL[e.fuel])}
function parseModel(b,m){
var engs=[];
String(m[5]).split(";").filter(Boolean).forEach(function(f){
var p=f.split("|"),fam=p[0],code=p[2]||"—",fuel=FUEL[p[3]]?p[3]:"E";
var yr=(p[4]||"17-27").split("-"),tech=p[5]||"";
var y0=yy(yr[0]),y1=yy(yr[1]||yr[0]);
String(p[1]||"").split(",").filter(Boolean).forEach(function(h,i){
var q=h.split(":"),hp=parseInt(q[0],10)||0,kwh=q[1];
var t=tech+(kwh?((tech?" · ":"")+kwh+" kWh"):"");
var o={key:b.id+"/"+m[0]+"/"+slug(fam)+"/"+hp+"/"+i,fam:fam,famKey:slug(fam),hp:hp,code:code,fuel:fuel,
y0:Math.max(y0,m[2]),y1:Math.min(y1,m[3]),tech:t,brand:b.id,brandName:b.name,model:m[0],modelName:m[1],
seg:m[4],my0:m[2],my1:m[3]};
var sp=spec(o);o.gk=o.famKey+(sp.ev?"|"+(sp.kwh||""):"");o.disp=sp.ev?sp.kwh:sp.disp;
engs.push(o)})});
return{id:m[0],name:m[1],y0:m[2],y1:m[3],seg:m[4],brand:b.id,brandName:b.name,engines:engs}}
function build(raw){return raw.map(function(b){
var bo={id:b[0],name:b[1],country:b[2]};
return{id:b[0],name:b[1],country:b[2],models:b[3].map(function(m){return parseModel(bo,m)})}})}
var ALLB=D.cat.map(function(b){return b[0]});
function expand(list){return list==="ALL"?ALLB.slice():csv(list)}
var FAULTS0=D.faults.map(function(x){return{
id:x[0],scope:x[1],brands:expand(x[2]),target:x[3],kind:x[4],sev:x[5],y0:x[6],y1:x[7],
titre:x[8],sym:x[9],pro:String(x[10]).split("|"),org:x[11],dtc:csv(x[12]),src:x[13],dom:csv(x[14])}});
var REVS0=D.revs.map(function(r){return{
id:r[0],brands:expand(r[1]),match:r[2],organ:r[3],oldKm:r[4],newKm:r[5],oldMo:r[6],newMo:r[7],
src:r[8],note:r[9],y0:2017,y1:2027}});
function cond(c,e,s){
switch(c){
case "all":return true;
case "ice":return !s.ev;
case "ev":return !!s.ev;
case "hv":return s.ev||e.fuel==="P"||e.fuel==="H";
case "plug":return s.ev||e.fuel==="P";
case "diesel":return e.fuel==="D";
case "petrol":return !s.ev&&e.fuel!=="D";
case "chain":return !s.ev&&/chaîne|chaine/i.test(s.dist);
case "wet":return !s.ev&&/humide/i.test(s.dist);
case "dry":return !s.ev&&/courroie/i.test(s.dist)&&!/humide/i.test(s.dist);
case "turbo":return !s.ev&&/turbo/i.test(s.feed);
case "scr":return /scr|adblue/i.test((e.tech||"")+" "+s.feed);
case "dpf":return e.fuel==="D"||/gpf/i.test(e.tech||"");
case "egr":return e.fuel==="D"||/gpf|egr/i.test(e.tech||"");
case "mhev":return !s.ev&&/48|mhev|isg|mild/i.test((e.tech||"")+" "+s.feed);
case "dct":return !s.ev&&/dct|dsg|e-dcs6|edc|tct/i.test((e.tech||"")+" "+famL(e));
default:return true}}
function rules(e){return D.rules.filter(function(r){return !e||cond(r[9],e,spec(e))}).map(function(r){
return{id:r[0],scope:"rule",brands:[],target:"",kind:r[2],sev:r[3],y0:YMIN,y1:YMAX,titre:r[4],sym:r[5],
pro:String(r[6]).split("|"),org:r[7],dtc:csv(r[8]),src:"Protocole atelier transversal",dom:csv(r[1]),rule:1}})}
/* ── état ── */
var LS={db:"kf.db.v13",aux:"kf.aux.v13",acc:"kf.acc.v13",nf:"kf.nf.v13",dev:"kf.dev.v13"};
var CAT=[],FAULTS=[],REVC=[],NOTES={},VIEWS=[],BK=[],TIERS=[],NOTIF=[],AUDIT=null,UPDATES=[];
var ROLE=null,DEVICE="",admTimer=null,CO={},openC=null,seenPend={},lastSig="",waitMode=false;
var SEL={brand:"",model:"",year:"",fam:"",hp:""};
var FIL={q:"",sev:[],kind:"",sort:"sev",bs:true,rules:true,done:false,dom:[]};
var USE={km:15000,sev:"normal",clim:"tempere"};
var CUI={q:"",sort:"brand",dir:1,page:0,size:40,sel:[]};
var FSEL=[],revQ="";
function canW(){return ROLE==="admin"}
function engines(){var o=[];CAT.forEach(function(b){b.models.forEach(function(m){m.engines.forEach(function(e){o.push(e)})})});return o}
function B(id){for(var i=0;i<CAT.length;i++)if(CAT[i].id===id)return CAT[i];return null}
function M(b,m){var x=B(b);if(!x)return null;for(var i=0;i<x.models.length;i++)if(x.models[i].id===m)return x.models[i];return null}
function ov(a,b,c,d){return a<=d&&c<=b}
function allRevs(){return REVS0.concat(REVC)}
function lsGet(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
function saveDB(){lsSet(LS.db,{cat:CAT,faults:FAULTS,revs:REVC,upd:UPDATES,v:13})}
function loadDB(){var d=lsGet(LS.db,null);
if(d&&d.v===13&&d.cat&&d.cat.length){CAT=d.cat;FAULTS=d.faults||[];REVC=d.revs||[];UPDATES=d.upd||[];return true}return false}
function saveAux(){lsSet(LS.aux,{notes:NOTES,views:VIEWS,bk:BK})}
function loadAux(){var d=lsGet(LS.aux,{});NOTES=d.notes||{};VIEWS=d.views||[];BK=d.bk||[]}
function saveAcc(){lsSet(LS.acc,TIERS);ping()}
function loadAcc(){TIERS=lsGet(LS.acc,[])||[]}
function saveNf(){lsSet(LS.nf,NOTIF.slice(0,60));ping()}
function loadNf(){NOTIF=lsGet(LS.nf,[])||[]}
function resetSeed(){CAT=build(D.cat);FAULTS=FAULTS0.map(function(f){return Object.assign({},f)});REVC=[];UPDATES=[];saveDB()}
var BC=null;try{BC=new BroadcastChannel("kf26")}catch(e){}
function ping(){try{if(BC)BC.postMessage({t:"s"})}catch(e){}}
function toast(m,t,undo){var box=$("toasts");if(!box)return;t=t||"in";
var ic={ok:"i-check",ba:"i-warn",wa:"i-warn",in:"i-info",te:"i-user"}[t]||"i-info";
var n=el("div","to "+t,'<svg class="ic"><use href="#'+ic+'"/></svg><div style="flex:1;min-width:0">'+esc(m)+'</div>');
if(undo){var b=el("button","ud","Annuler");b.onclick=function(){undo();n.remove()};n.appendChild(b)}
box.appendChild(n);setTimeout(function(){n.classList.add("ou");setTimeout(function(){n.remove()},260)},undo?7000:4200)}
function notify(type,txt,meta){NOTIF.unshift({id:"N"+Date.now()+Math.random().toString(36).slice(2,5),
type:type,txt:txt,meta:meta||"",ts:Date.now(),read:false});saveNf();renderBell()}
/* ── combobox ── */
function Combo(host,ph,cb){
this.h=host;this.ph=ph;this.cb=cb;this.items=[];this.value="";this.dis=true;this.sig="";
host.innerHTML="";
this.btn=el("button","cb");this.btn.type="button";this.btn.setAttribute("role","combobox");
this.btn.setAttribute("aria-expanded","false");
this.clr=el("span","ccl",'<svg class="ic"><use href="#i-x"/></svg>');
host.appendChild(this.btn);host.appendChild(this.clr);
var self=this;
this.btn.onclick=function(){self.toggle()};
this.clr.onclick=function(e){e.stopPropagation();self.pick("")};
this.btn.onkeydown=function(e){if(e.key==="ArrowDown"||e.key==="Enter"||e.key===" "){e.preventDefault();self.open()}};
this.render()}
Combo.prototype.set=function(items,value,dis){
var sig=JSON.stringify(items.map(function(i){return [i.v,i.t,i.m,i.b]}))+"|"+value+"|"+!!dis;
if(sig===this.sig)return;this.sig=sig;this.items=items;this.value=value||"";this.dis=!!dis;
this.render();if(openC===this)this.fill()};
Combo.prototype.cur=function(){var v=this.value;return this.items.filter(function(i){return String(i.v)===String(v)})[0]};
Combo.prototype.render=function(){var c=this.cur();this.h.dataset.filled=this.value?"1":"0";this.btn.disabled=this.dis;
this.btn.innerHTML=(c?'<span class="cv">'+esc(c.t)+'</span>'+(c.m?'<span class="cm">'+esc(c.m)+'</span>':''):
'<span class="ph">'+esc(this.ph)+'</span>')+'<svg class="ic cv2"><use href="#i-chev"/></svg>'};
Combo.prototype.toggle=function(){openC===this?this.close():this.open()};
Combo.prototype.open=function(){
if(this.dis)return;if(openC&&openC!==this)openC.close();openC=this;
this.h.dataset.open="1";this.btn.setAttribute("aria-expanded","true");
var L=$("cL");L.innerHTML="";this.pop=el("div","cp");
var sb=el("div","cps");this.inp=el("input");this.inp.type="search";
this.inp.placeholder="Filtrer sans accent…";this.inp.autocomplete="off";sb.appendChild(this.inp);
this.list=el("div","cpl");this.list.setAttribute("role","listbox");this.foot=el("div","cpf");
this.pop.appendChild(sb);this.pop.appendChild(this.list);this.pop.appendChild(this.foot);
L.appendChild(this.pop);this.pop.style.pointerEvents="auto";this.place();this.fill();
var self=this;
this.inp.oninput=function(){self.fill()};
this.inp.onkeydown=function(e){self.key(e)};
if(this.items.length<=7)sb.style.display="none";
setTimeout(function(){if(self.items.length>7&&self.inp)self.inp.focus()},30);
this._o=function(e){if(self.pop&&self.pop.contains(e.target)===false&&self.h.contains(e.target)===false)self.close()};
setTimeout(function(){document.addEventListener("pointerdown",self._o)},0);
this._r=function(){self.place()};
window.addEventListener("scroll",this._r,true);window.addEventListener("resize",this._r)};
Combo.prototype.place=function(){if(!this.pop)return;
var r=this.btn.getBoundingClientRect(),w=Math.min(Math.max(r.width,240),window.innerWidth-16);
var below=window.innerHeight-r.bottom-12,up=below<200&&r.top>below;
var h=Math.min(340,Math.max(160,up?r.top-12:below));
this.pop.style.width=w+"px";this.pop.style.left=clamp(r.left,8,window.innerWidth-w-8)+"px";
this.pop.style.maxHeight=h+"px";
if(up){this.pop.style.top="auto";this.pop.style.bottom=(window.innerHeight-r.top+6)+"px"}
else{this.pop.style.bottom="auto";this.pop.style.top=(r.bottom+6)+"px"}};
Combo.prototype.fill=function(){
var q=this.inp.value||"",nq=norm(q),self=this;
var a=this.items.map(function(i){
var hay=norm(i.t+" "+(i.m||"")+" "+(i.b||"")+" "+(i.a||""));
if(!nq)return{i:i,s:0};
var nt=norm(i.t+" "+(i.a||""));
return hay.indexOf(nq)>=0?{i:i,s:nt.indexOf(nq)===0?0:(nt.indexOf(nq)>=0?1:2)}:null}).filter(Boolean);
a.sort(function(x,y){return x.s-y.s});a=a.map(function(x){return x.i});
this.view=a;this.idx=Math.max(0,a.map(function(i){return String(i.v)}).indexOf(String(this.value)));
this.list.innerHTML=a.length?"":'<div class="cpe">Aucun résultat — essayez sans accent</div>';
a.forEach(function(i,n){
var d=el("div","co"+(n===self.idx?" cu":""));
d.setAttribute("role","option");d.setAttribute("aria-selected",String(String(i.v)===String(self.value)));
d.innerHTML='<svg class="ic tk"><use href="#i-check"/></svg><div class="ol"><div class="ot">'+hl(i.t,q)+'</div>'+
(i.m?'<div class="om">'+hl(i.m,q)+'</div>':'')+'</div>'+(i.b?'<span class="ob">'+esc(i.b)+'</span>':'');
d.onmouseenter=function(){self.idx=n;self.hi()};
d.onclick=function(){self.pick(i.v)};
self.list.appendChild(d)});
this.foot.innerHTML='<span>'+a.length+' / '+this.items.length+'</span><span>↑↓ · Entrée · Échap</span>';
var c=this.list.children[this.idx];if(c&&c.scrollIntoView)c.scrollIntoView({block:"nearest"})};
Combo.prototype.hi=function(){var self=this;[].forEach.call(this.list.children,function(c,n){c.classList.toggle("cu",n===self.idx)})};
Combo.prototype.key=function(e){
if(e.key==="Escape"){e.preventDefault();this.close();this.btn.focus()}
else if(e.key==="ArrowDown"){e.preventDefault();this.idx=Math.min(this.view.length-1,this.idx+1);this.hi();var c=this.list.children[this.idx];if(c)c.scrollIntoView({block:"nearest"})}
else if(e.key==="ArrowUp"){e.preventDefault();this.idx=Math.max(0,this.idx-1);this.hi();var d=this.list.children[this.idx];if(d)d.scrollIntoView({block:"nearest"})}
else if(e.key==="Enter"){e.preventDefault();var i=this.view[this.idx];if(i)this.pick(i.v)}};
Combo.prototype.pick=function(v){this.close();this.cb(String(v))};
Combo.prototype.close=function(){if(openC!==this)return;openC=null;
this.h.dataset.open="0";this.btn.setAttribute("aria-expanded","false");
document.removeEventListener("pointerdown",this._o);
window.removeEventListener("scroll",this._r,true);window.removeEventListener("resize",this._r);
$("cL").innerHTML="";this.pop=null};
/* ── cascade ── */
function modelsOf(b,y){var x=B(b);if(!x)return [];
return x.models.filter(function(m){return !y||m.engines.some(function(e){return e.y0<=+y&&e.y1>=+y})})
.sort(function(a,c){return norm(a.name).localeCompare(norm(c.name))})}
function yearsOf(b,m){var x=M(b,m);if(!x)return [];var s=[];
x.engines.forEach(function(e){for(var y=Math.max(e.y0,YMIN);y<=Math.min(e.y1,YMAX);y++)if(s.indexOf(y)<0)s.push(y)});
return s.sort(function(a,c){return c-a})}
function famsOf(b,m,y){var x=M(b,m);if(!x)return [];var map={},order=[];
x.engines.filter(function(e){return !y||(e.y0<=+y&&e.y1>=+y)}).forEach(function(e){
if(!map[e.gk]){map[e.gk]={k:e.gk,e:e,hp:[]};order.push(e.gk)}
if(map[e.gk].hp.indexOf(e.hp)<0)map[e.gk].hp.push(e.hp)});
return order.map(function(k){return map[k]}).sort(function(a,c){return norm(famL(a.e)).localeCompare(norm(famL(c.e)))})}
function hpsOf(b,m,y,g){var x=M(b,m);if(!x)return [];
return x.engines.filter(function(e){return (!y||(e.y0<=+y&&e.y1>=+y))&&(!g||e.gk===g)})
.sort(function(a,c){return a.hp-c.hp})}
function resolved(){if(!SEL.brand)return [];
return engines().filter(function(e){
return e.brand===SEL.brand&&(!SEL.model||e.model===SEL.model)&&
(!SEL.year||(e.y0<=+SEL.year&&e.y1>=+SEL.year))&&(!SEL.fam||e.gk===SEL.fam)&&(!SEL.hp||e.hp===+SEL.hp)})}
function ready(){return !!(SEL.brand&&SEL.model&&SEL.fam&&SEL.hp)}
function sync(){
if(!CO.brand)return;
var bs=CAT.slice().sort(function(a,b){return norm(a.name).localeCompare(norm(b.name))}).map(function(b){
var n=b.models.reduce(function(a,m){return a+m.engines.length},0);
return{v:b.id,t:b.name,m:b.models.length+" modèles · "+n+" motorisations",b:b.country,a:alias(b.name)}});
CO.brand.set(bs,SEL.brand,false);
var ms=SEL.brand?modelsOf(SEL.brand,SEL.year).map(function(m){
return{v:m.id,t:m.name,m:m.y0+"–"+m.y1+" · "+m.seg+(m.y0>=2024?" · nouveau":"")+" · "+m.engines.length+" mot."}}):[];
if(SEL.model&&!ms.some(function(m){return m.v===SEL.model}))SEL.model="";
CO.model.set(ms,SEL.model,!SEL.brand);
var mm=SEL.model?M(SEL.brand,SEL.model):null;
var ys=SEL.model?yearsOf(SEL.brand,SEL.model).map(function(y){
return{v:String(y),t:String(y),m:mm.engines.filter(function(e){return e.y0<=y&&e.y1>=y}).length+" motorisation(s)"}}):[];
if(SEL.year&&!ys.some(function(y){return y.v===SEL.year}))SEL.year="";
CO.year.set(ys,SEL.year,!SEL.model);
var fs=SEL.model?famsOf(SEL.brand,SEL.model,SEL.year).map(function(f){
var h=f.hp.slice().sort(function(a,b){return a-b});
return{v:f.k,t:famL(f.e),m:famM(f.e),b:h.length>1?h[0]+"–"+h[h.length-1]+" ch":h[0]+" ch"}}):[];
if(SEL.fam&&!fs.some(function(f){return f.v===SEL.fam})){SEL.fam="";SEL.hp=""}
CO.fam.set(fs,SEL.fam,!SEL.model);
var hs=[],seen={};
(SEL.model?hpsOf(SEL.brand,SEL.model,SEL.year,SEL.fam):[]).forEach(function(e){
var s=spec(e);
var o={v:String(e.hp),t:e.hp+" ch",m:kw(e.hp)+" kW"+(s.tq?" · "+s.tq+" N·m":"")+" · "+e.code,
b:s.ev?(s.kwh?s.kwh+" kWh":"EV"):FUEL[e.fuel]};
var k=o.v+o.m;if(!seen[k]){seen[k]=1;hs.push(o)}});
if(SEL.hp&&!hs.some(function(h){return h.v===SEL.hp}))SEL.hp="";
CO.hp.set(hs,SEL.hp,!SEL.model);
[["s1",SEL.brand],["s2",SEL.model],["s3",SEL.year],["s4",SEL.fam],["s5",SEL.hp]].forEach(function(p){
var n=$(p[0]);if(n)n.classList.toggle("dn",!!p[1])});
var n=resolved().length,st=$("beState");
if(!SEL.brand){st.className="ch";st.textContent="Aucune sélection"}
else{st.className="ch "+(n?"ok":"wa");
st.textContent=ready()?n+" motorisation corrélée":(n?n+" motorisation(s) — affinez":"Combinaison sans moteur")}
st.style.height="24px";st.style.fontSize="10.5px";
var b=B(SEL.brand),f=(SEL.fam&&mm)?famsOf(SEL.brand,SEL.model,SEL.year).filter(function(x){return x.k===SEL.fam})[0]:null;
$("beHint").textContent=[b?b.name:null,mm?mm.name:null,SEL.year||null,f?famL(f.e):null,SEL.hp?SEL.hp+" ch":null]
.filter(Boolean).join(" › ")||"Recherche sans accent — tapez « skoda »";
var dl=$("brandList");if(dl&&!dl.children.length)dl.innerHTML=CAT.map(function(b){return '<option value="'+esc(b.name)+'">'}).join("")}
function newSearch(){
Object.keys(CO).forEach(function(k){CO[k].close()});
SEL={brand:"",model:"",year:"",fam:"",hp:""};FSEL=[];
FIL.q="";$("q").value="";FIL.sev=[];FIL.kind="";FIL.sort="sev";FIL.dom=[];
$("selKind").value="";$("selSort").value="sev";
[].forEach.call($("sevSeg").querySelectorAll("button"),function(b){b.setAttribute("aria-pressed","false")});
sync();renderDom();renderAll();toast("Champs vidés — nouvelle recherche","ok");
window.scrollTo({top:0,behavior:"smooth"})}
/* ── corrélation ── */
function hits(f,e){
if(f.y1<e.y0||f.y0>e.y1)return false;
if(f.scope==="rule")return true;
if(f.brands.indexOf(e.brand)<0)return false;
if(f.scope==="brand")return FIL.bs;
if(f.scope==="model")return csv(f.target).indexOf(e.model)>=0;
if(f.scope==="engine")return slug(f.target)===e.famKey;
return false}
function pool(strict){
var eng=resolved();
if(strict&&!ready())return [];
var out=[],seen={};
if(eng.length){
FAULTS.forEach(function(f){if(!seen[f.id]&&eng.some(function(e){return hits(f,e)})){seen[f.id]=1;out.push(f)}});
if(FIL.rules){var rs={};eng.forEach(function(e){rules(e).forEach(function(x){if(!rs[x.id]){rs[x.id]=1;out.push(x)}})})}}
else if(SEL.brand){
out=FAULTS.filter(function(f){return f.brands.indexOf(SEL.brand)>=0&&(f.scope!=="brand"||FIL.bs)});
if(FIL.rules)out=out.concat(rules(null))}
else{out=FAULTS.slice();if(FIL.rules)out=out.concat(rules(null))}
return out}
function applyF(list){
var o=list.slice(),q=norm(FIL.q);
if(q.length>=2){var t=q.split(/\s+/);
o=o.filter(function(f){
var h=norm([f.titre,f.sym,f.org,f.src,KIND[f.kind],(f.dtc||[]).join(" "),f.pro.join(" "),
(f.dom||[]).map(function(d){return DM[d]?DM[d].n+" "+d:""}).join(" ")].join(" "));
return t.every(function(x){return h.indexOf(x)>=0})})}
if(FIL.sev.length)o=o.filter(function(f){return FIL.sev.indexOf(f.sev)>=0});
if(FIL.kind)o=o.filter(function(f){return f.kind===FIL.kind});
if(FIL.dom.length)o=o.filter(function(f){return (f.dom||[]).some(function(d){return FIL.dom.indexOf(d)>=0})});
if(!FIL.done)o=o.filter(function(f){return !(NOTES[f.id]&&NOTES[f.id].done)});
var s=FIL.sort;
o.sort(function(a,b){
if(s==="sev")return SEV[a.sev].r-SEV[b.sev].r||b.y1-a.y1;
if(s==="year")return b.y1-a.y1||SEV[a.sev].r-SEV[b.sev].r;
if(s==="alpha")return norm(a.titre).localeCompare(norm(b.titre));
if(s==="src")return norm(a.src).localeCompare(norm(b.src));
return 0});
return o}
function current(){return applyF(pool(false))}
function strictCur(){return applyF(pool(true))}
function domPills(f){return (f.dom||[]).slice(0,5).map(function(d){var m=DM[d];if(!m)return "";
return '<span class="pl" style="border-color:var(--'+m.c+');color:var(--'+CV[m.c]+')"><svg class="ic"><use href="#'+m.i+'"/></svg>'+esc(m.n)+'</span>'}).join("")}
function fCard(f,chk){
var dn=NOTES[f.id]&&NOTES[f.id].done;
var d=el("div","fc v-"+f.sev+(dn?" dn":""));d.tabIndex=0;d.setAttribute("role","button");
d.innerHTML='<div class="fh">'+(chk?'<span class="fk" role="checkbox" aria-checked="'+(FSEL.indexOf(f.id)>=0)+'" tabindex="0"><svg class="ic"><use href="#i-check"/></svg></span>':'')+
'<div class="ft">'+esc(f.titre)+'</div></div>'+
'<div class="fm"><span class="pl '+KC[f.kind]+'">'+KIND[f.kind]+'</span><span class="pl '+SC[f.sev]+'">'+SEV[f.sev].n+'</span>'+
'<span class="pl">'+f.y0+'–'+f.y1+'</span><span class="pl'+(f.scope==="engine"?" mx":"")+'">'+
(f.scope==="engine"?"Moteur exact":f.scope==="model"?"Modèle":f.scope==="rule"?"Technologie":"Marque")+'</span>'+
(dn?'<span class="pl" style="color:var(--gr);border-color:rgba(74,222,128,.4)">Traitée</span>':'')+'</div>'+
'<div class="fm">'+domPills(f)+'</div><div class="fs">'+esc(f.sym)+'</div>'+
(f.dtc.length?'<div class="dr">'+f.dtc.map(function(c){return '<span class="dtc">'+esc(c)+'</span>'}).join("")+'</div>':'')+
'<div class="fsr"><svg class="ic"><use href="#i-link"/></svg>'+esc(f.src)+
((NOTES[f.id]&&NOTES[f.id].txt)?' · <span style="color:var(--cy)">note</span>':'')+'</div>';
d.onclick=function(e){if(e.target.closest&&e.target.closest(".fk"))return;openF(f)};
d.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();openF(f)}};
if(chk){var c=d.querySelector(".fk");
var tg=function(e){e.stopPropagation();
var i=FSEL.indexOf(f.id);if(i>=0)FSEL.splice(i,1);else FSEL.push(f.id);renderFaults()};
c.onclick=tg;c.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();tg(e)}}}
return d}
function ey(i,t,x){return '<div class="ey"><svg class="ic"><use href="#'+i+'"/></svg><h3 style="margin-bottom:6px">'+esc(t)+'</h3><p>'+x+'</p></div>'}
function vehCard(){
if(!SEL.brand)return "";
var eng=resolved(),b=B(SEL.brand),m=SEL.model?M(SEL.brand,SEL.model):null,e=eng[0];
var all=strictCur(),crit=all.filter(function(f){return f.sev==="critique"}).length,s=e?spec(e):null;
var title=[b?b.name:"",m?m.name:""].filter(Boolean).join(" ");
var sub=e?famL(e)+" · "+e.hp+" ch ("+kw(e.hp)+" kW) · "+e.code:(m?m.engines.length+" motorisations":b.models.length+" modèles");
return '<div class="vc"><div class="vb">'+esc((b?b.name:"?").slice(0,3).toUpperCase())+
'<br><span style="font-size:9px;color:var(--m2)">'+esc(b?b.country:"")+'</span></div>'+
'<div style="min-width:0"><div class="vt">'+esc(title)+(SEL.year?' <span style="color:var(--cy);font-size:.7em">('+SEL.year+')</span>':'')+'</div>'+
'<div class="mo" style="font-size:13px;color:var(--cy);margin-top:4px">'+esc(sub)+'</div><div class="vm">'+
(e?'<span class="tg f'+e.fuel+'">'+FUEL[e.fuel]+'</span><span class="tg mo">'+esc(e.code)+'</span>':'')+
(s&&!s.ev&&s.disp?'<span class="tg mo">'+s.disp+' cm³</span>':'')+
(s&&!s.ev&&s.cyl?'<span class="tg">'+s.cyl+' cyl.</span>':'')+
(s&&s.ev&&s.kwh?'<span class="tg mo">'+s.kwh+' kWh</span>':'')+
(s&&s.ev?'<span class="tg mo">'+s.volt+' V</span>':'')+
(m?'<span class="tg">'+esc(m.seg)+'</span><span class="tg mo">'+m.y0+'–'+m.y1+'</span>':'')+
(m&&m.y0>=2024?'<span class="tg" style="color:var(--mg);border-color:rgba(244,114,182,.4)">millésime 2024+</span>':'')+
(e?'<span class="tg mo">moteur '+e.y0+'–'+e.y1+'</span>':'')+
(eng.length>1?'<span class="tg" style="color:var(--amH);border-color:rgba(245,158,11,.4)">'+eng.length+' variantes</span>':'')+
'</div></div><div class="vs"><div class="vst"><b style="color:'+(crit?"var(--rd)":"var(--gr)")+'">'+crit+'</b><span>Critiques</span></div>'+
'<div class="vst"><b style="color:var(--amH)">'+all.length+'</b><span>Fiches</span></div>'+
'<div class="vst"><b style="color:var(--cy)">'+eng.length+'</b><span>Moteurs</span></div></div></div>'}
function specPanel(){
var eng=resolved();if(!SEL.brand||!eng.length)return "";
if(!SEL.fam||!SEL.hp){
var rows=eng.slice().sort(function(a,b){return a.hp-b.hp});
return '<div class="pn pd rvl" style="margin-bottom:16px"><div class="sh"><div class="si ic-te"><svg class="ic"><use href="#i-piston"/></svg></div>'+
'<div><h2>Motorisations réelles du modèle</h2><div class="sb">'+rows.length+' variante(s) — sélectionnez une cylindrée puis une puissance</div></div></div>'+
'<div class="tw"><table style="min-width:660px"><thead><tr><th>Cylindrée · type</th><th>cm³ / kWh</th><th>Architecture</th><th>Puissance</th><th>Couple</th><th>Code</th><th>Années</th><th></th></tr></thead><tbody>'+
rows.map(function(e){var s=spec(e);
return '<tr><td class="tn">'+esc(famL(e))+'<div class="mi">'+esc(FUEL[e.fuel])+' · '+esc(s.feed)+'</div></td>'+
'<td class="mo" style="color:var(--amH)">'+(s.ev?(s.kwh?s.kwh+" kWh":"—"):(s.disp||"—"))+'</td>'+
'<td class="mi">'+esc(s.ev?s.plat:s.lay)+'</td>'+
'<td class="mo" style="color:var(--rd);font-weight:800">'+e.hp+' ch<div class="mi">'+kw(e.hp)+' kW</div></td>'+
'<td class="mo" style="color:var(--gr)">'+(s.tq?s.tq+" N·m":"—")+'</td><td class="mo">'+esc(e.code)+'</td>'+
'<td class="mo">'+e.y0+'–'+e.y1+'</td><td><button class="bt sm" type="button" data-eng="'+esc(e.key)+'"><svg class="ic"><use href="#i-eye"/></svg></button></td></tr>'}).join("")+
'</tbody></table></div></div>'}
var e=eng[0],s=spec(e);
var it=s.ev?[["kb","Batterie utile",(s.kwh?s.kwh+" kWh":"n.c."),"Plateforme : "+s.plat],
["ka","Architecture HV",s.volt+" V",s.volt>=800?"Charge ultra-rapide DC":"Charge DC standard"],
["kp","Puissance",e.hp+" ch",kw(e.hp)+" kW"],["ka","Moteur électrique",s.arch,s.lay],
["","Transmission",s.dist,"Rapport fixe"],["kd","Code moteur",e.code,"Production "+e.y0+"–"+e.y1]]:
[["kd","Cylindrée",(s.disp?s.disp+" cm³":"n.c."),(s.disp?(s.disp/1000).toFixed(1).replace(".",",")+" L":"")+(s.exact?" · exact":" · nominal")],
["ka","Architecture",s.lay,s.cyl?s.cyl+" cylindres":""],["","Type moteur",famL(e),FUEL[e.fuel]],
["","Alimentation",s.feed,""],["kt","Couple maxi",s.tq?s.tq+" N·m":"non renseigné",s.tq?"valeur constructeur":"à confirmer au VIN"],
["kp","Puissance",e.hp+" ch",kw(e.hp)+" kW"],["","Distribution",s.dist,/humide/i.test(s.dist)?"⚠ courroie en bain d'huile":""],
["kd","Code moteur",e.code,"Production "+e.y0+"–"+e.y1]];
return '<div class="pn pd rvl" style="margin-bottom:16px"><div class="sh"><div class="si ic-te"><svg class="ic"><use href="#'+(s.ev?"i-batt":"i-piston")+'"/></svg></div>'+
'<div><h2>Fiche moteur — '+esc(famL(e))+' '+e.hp+' ch</h2><div class="sb">'+esc(e.brandName)+' '+esc(e.modelName)+' · '+esc(e.code)+' · '+esc(e.tech||"—")+'</div></div></div>'+
'<div class="spec">'+it.map(function(p){return '<div class="spi '+p[0]+'"><div class="sk">'+esc(p[1])+'</div><div class="sv2">'+esc(p[2])+'</div>'+(p[3]?'<div class="sd">'+esc(p[3])+'</div>':'')+'</div>'}).join("")+'</div>'+
(!s.ev&&/humide/i.test(s.dist)?'<div class="nt wa" style="margin-top:12px"><b>Distribution en bain d\'huile.</b> Contrôle de la largeur au gabarit et inspection de la crépine à chaque entretien.</div>':'')+
(s.ev?'<div class="nt in" style="margin-top:12px"><b>Véhicule électrique.</b> Aucun entretien moteur thermique : batterie HV, liquide pack, réducteur et freinage.</div>':'')+'</div>'}
function bindEng(r){if(!r)return;
[].forEach.call(r.querySelectorAll("[data-eng]"),function(b){
b.onclick=function(){var e=engines().filter(function(x){return x.key===b.dataset.eng})[0];if(e)loadEng(e)}})}
/* ── révisions + plan ── */
function revsFor(e){
var s=spec(e),hay=norm(e.fam+" "+e.code+" "+(e.tech||"")+" "+s.feed);
return allRevs().filter(function(r){
if(r.brands.indexOf(e.brand)<0)return false;
if(!ov(r.y0,r.y1,e.y0,e.y1))return false;
if(!r.match)return true;
var re;try{re=new RegExp(r.match,"i")}catch(_){return norm(r.match).split(/\s+/).every(function(t){return hay.indexOf(t)>=0})}
if(re.test(e.fam)||re.test(e.code)||re.test(e.tech||""))return true;
return norm(r.match).replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter(function(t){return t.length>2})
.some(function(t){return hay.indexOf(t)>=0})})}
function revCard(r,e){
var dk=r.oldKm?Math.round((r.newKm-r.oldKm)/r.oldKm*100):null;
var dm=r.oldMo?Math.round((r.newMo-r.oldMo)/r.oldMo*100):null;
var yrs=(e&&r.newKm)?Math.round(r.newKm/USE.km*10)/10:null;
return '<div class="rc"><div class="rh"><div class="si ic-mg" style="width:30px;height:30px"><svg class="ic"><use href="#i-clock"/></svg></div>'+
'<div style="flex:1;min-width:0"><h3 style="font-size:14.5px">'+esc(r.organ)+'</h3><div class="mi">'+
esc(r.brands.map(function(b){var x=B(b);return x?x.name:b}).join(" · "))+
(r.match?" · "+esc(r.match.replace(/\\\./g,".").replace(/\|/g," / ")):"")+'</div></div>'+
(dk!==null?'<span class="dl '+(dk>0?"up":"")+'">'+(dk>0?"+":"")+dk+' % km</span>':'')+
(dm!==null&&dm!==dk?'<span class="dl '+(dm>0?"up":"")+'">'+(dm>0?"+":"")+dm+' % temps</span>':'')+'</div>'+
'<div class="rns"><div class="rn ol"><div class="rl">Ancien</div><div class="rv2">'+(r.oldKm?nf(r.oldKm)+" km":"sans échéance")+'</div><div class="mi">'+(r.oldMo?moT(r.oldMo):"—")+'</div></div>'+
'<span class="arw">→</span><div class="rn nw"><div class="rl">Révisé</div><div class="rv2">'+nf(r.newKm)+' km</div><div class="mi">'+(r.newMo?moT(r.newMo):"—")+'</div></div>'+
(yrs?'<div class="rn"><div class="rl">À '+nf(USE.km)+' km/an</div><div class="rv2" style="color:var(--cy)">'+String(yrs).replace(".",",")+' ans</div><div class="mi">échéance km</div></div>':'')+'</div>'+
'<div class="nt mg" style="margin-top:11px;font-size:12px"><b>'+esc(r.src)+'.</b> '+esc(r.note)+' <b>Confirmer au VIN.</b></div></div>'}
function planFor(e){
var s=spec(e),rv=revsFor(e),f=USE.sev==="severe"?0.6:(USE.sev==="mixte"?0.8:1);
var base=s.ev?[30000,60000,90000,120000,160000]:[15000,30000,60000,90000,120000,160000];
base=base.map(function(k){return Math.max(5000,Math.round(k*f/5000)*5000)});
var rk=rv.map(function(r){return r.newKm}).filter(function(k){return k>0&&k<=200000});
var steps=base.concat(rk).filter(function(k,i,a){return a.indexOf(k)===i}).sort(function(a,b){return a-b});
var wet=/humide/i.test(s.dist),chain=/chaîne|chaine/i.test(s.dist),ev=s.ev,hy=e.fuel==="H"||e.fuel==="P";
var scr=/scr|adblue/i.test((e.tech||"")+" "+s.feed),gpf=/gpf/i.test(e.tech||""),die=e.fuel==="D";
return steps.map(function(km,i){
var ops=[];function add(t,c,r){ops.push({t:t,c:!!c,r:!!r})}
rv.filter(function(r){return r.newKm===km}).forEach(function(r){
add(r.organ+" — intervalle révisé : "+nf(r.newKm)+" km"+(r.newMo?" / "+moT(r.newMo):"")+(r.oldKm?" (au lieu de "+nf(r.oldKm)+" km)":""),1,1)});
if(ev){
if(i===0)add("Contrôle visuel batterie HV, câblage orange et connecteurs");
add("Filtre d'habitacle (charbon actif)");add("Contrôle SOH batterie et delta de cellules");
if(km>=60000)add("Liquide de frein DOT 4 (tous les 2 ans)");
if(km>=90000)add("Contrôle circuit de refroidissement batterie (pompe LDR, échangeur)");
if(km>=120000){add("Liquide de refroidissement pack HV",1);add("Contrôle isolement HV au mégohmmètre",1)}
if(km>=160000)add("Contrôle complet pack HV, contacteurs et chargeur embarqué",1);
add("Contrôle disques / plaquettes (corrosion par faible sollicitation)");
if(USE.clim==="froid")add("Préconditionnement pack avant charge DC · pompe à chaleur");
if(USE.clim==="chaud")add("Contrôle température pack et débit de refroidissement en charge rapide")}
else{
if(hy){if(i===0||km%30000===0)add("Vidange huile 0W16/0W20 normée + filtre à huile")}
else if(i===0||km%30000===0)add("Vidange huile normée constructeur + filtre à huile");
if(km%30000===0||km<=15000)add("Filtre d'habitacle");
if(km>=60000&&km%60000===0)add("Filtre à air");
if(die&&km>=60000&&km%60000===0)add("Filtre à gasoil",1);
if(!die&&km>=40000&&km%40000===0)add("Bougies d'allumage"+(hy?" (iridium selon préco)":""));
if(km>=60000&&km%60000===0)add("Liquide de frein DOT 4 (tous les 2 ans)");
if(scr&&km%30000===0)add("Contrôle SCR : injecteur AdBlue, pompe, cristallisation",1);
if(die&&km%30000===0)add("Contrôle FAP : charge de suie, ΔP, régénérations");
if(gpf&&km>=60000)add("Contrôle GPF / catalyseur (contre-pression)");
if(wet){if(km%30000===0)add("Contrôle largeur courroie humide au gabarit + débris carter",1)}
else if(chain){if(km>=120000)add("Contrôle tension / allongement chaîne, écoute à froid",1)}
else if(km>=120000)add("Kit distribution + galets + pompe à eau",1);
if(hy&&km%30000===0)add("Contrôle système hybride : onduleur, LDR, isolement HV");
if(km>=120000)add("Liquide de refroidissement moteur / onduleur");
if(km>=120000)add("Contrôle trains roulants, rotules et géométrie");
if(km>=160000)add("Contrôle turbo, injecteurs (débits retour) et compressions",1);
if(USE.sev==="severe"&&km%20000===0)add("Usage sévère : analyse d'huile, nettoyage EGR, contrôle turbo",1);
if(USE.clim==="froid"&&km%30000===0)add("Climat froid : 12 V, préchauffage, thermostat");
if(USE.clim==="chaud"&&km%30000===0)add("Climat chaud : clim, condenseur, circuit LDR")}
return{km:km,mo:Math.round(km/USE.km*12),ops:ops,first:i<4,rev:rv.some(function(x){return x.newKm===km})}})}
/* ── rendus ── */
function renderGate(){
var g=$("dGate");if(!g)return;
if(ready()){g.innerHTML="";return}
var b=B(SEL.brand),m=SEL.brand&&SEL.model?M(SEL.brand,SEL.model):null;
var f=(SEL.fam&&m)?famsOf(SEL.brand,SEL.model,SEL.year).filter(function(x){return x.k===SEL.fam})[0]:null;
var steps=[["1","Marque",SEL.brand,b?b.name:"","brand"],["2","Modèle",SEL.model,m?m.name:"","model"],
["3","Cylindrée · type moteur",SEL.fam,f?famL(f.e):"","fam"],["4","Puissance réelle",SEL.hp,SEL.hp?SEL.hp+" ch":"","hp"]];
g.innerHTML='<div class="pn pd" style="margin-bottom:16px;border-color:rgba(251,191,36,.35)">'+
'<div class="sh"><div class="si ic-am"><svg class="ic"><use href="#i-lock"/></svg></div>'+
'<div><h2>Diagnostic expert — corrélation complète requise</h2><div class="sb">Seules les fiches liées à la marque, au modèle, à la motorisation <b>et</b> à la puissance sélectionnés sont affichées.</div></div>'+
'<span class="sp"></span><button class="bt sm" type="button" id="gRand"><svg class="ic"><use href="#i-dice"/></svg>Exemple complet</button></div>'+
'<div class="g4s">'+steps.map(function(p){
return '<button class="gs'+(p[2]?" dn":"")+'" type="button" data-go="'+p[4]+'"><span class="gn">'+(p[2]?"✓":p[0])+
'</span><span style="min-width:0"><span class="gt">'+esc(p[1])+'</span><span class="gv">'+esc(p[3]||"à sélectionner")+'</span></span></button>'}).join("")+'</div>'+
'<div class="nt wa" style="margin-top:13px">Complétez les '+steps.filter(function(p){return !p[2]}).length+
' champ(s) manquant(s) dans le banc de commande. L\'année de production est optionnelle mais affine la plage moteur.</div></div>';
[].forEach.call(g.querySelectorAll("[data-go]"),function(x){
x.onclick=function(){var c=CO[x.dataset.go];if(c){c.btn.scrollIntoView({block:"center",behavior:"smooth"});setTimeout(function(){c.open()},260)}}});
var gr=$("gRand");if(gr)gr.onclick=function(){var e=engines();if(e.length)loadEng(e[Math.floor(Math.random()*e.length)])}}
function renderDiag(){
renderGate();
$("dVeh").innerHTML=ready()?vehCard():"";
$("dSpec").innerHTML=specPanel();bindEng($("dSpec"));
var box=$("dF"),tb=$("dT"),dd=$("dD");
if(!ready()){
box.innerHTML=ey("i-lock","En attente de corrélation","Aucune fiche n'est affichée tant que la marque, le modèle, la motorisation et la puissance ne sont pas sélectionnés.");
tb.innerHTML=ey("i-book","En attente","Les TSB et bulletins apparaîtront pour la motorisation exacte.");
dd.innerHTML=ey("i-bolt","En attente","Les DTC corrélés apparaîtront après sélection complète.");
$("dFSub").textContent="Sélection incomplète";$("dTSub").textContent="Sélection incomplète";return}
var all=strictCur(),p=all.filter(function(f){return f.kind!=="tsb"}),t=all.filter(function(f){return f.kind==="tsb"});
$("dFSub").textContent=p.length+" fiche(s) · "+SEL.brand+" → "+SEL.model+" → "+SEL.hp+" ch";
$("dTSub").textContent=t.length+" bulletin(s) pour cette motorisation";
box.innerHTML="";
if(!p.length)box.innerHTML=ey("i-shieldok","Aucune fiche critique","Aucune panne, campagne ou rappel ne correspond à cette combinaison exacte et aux filtres actifs.");
else p.slice(0,60).forEach(function(f){box.appendChild(fCard(f,false))});
tb.innerHTML="";
if(!t.length)tb.innerHTML=ey("i-book","Aucun bulletin","Aucun TSB ne correspond à la corrélation et aux filtres actifs.");
else t.slice(0,30).forEach(function(f){tb.appendChild(fCard(f,false))});
var codes=uniq([].concat.apply([],all.map(function(f){return f.dtc}))).sort();
dd.innerHTML=codes.length?codes.slice(0,40).map(function(c){var d=DTC[c];
return '<div class="dsc" style="margin-bottom:8px"><div class="dsc-h"><span class="dtc">'+esc(c)+'</span>'+(d?esc(d[0]):"Code corrélé")+'</div>'+
(d?'<div class="dsc-b" style="padding:10px 13px;font-size:12.5px"><b style="color:var(--amH)">Causes :</b> '+esc(d[1])+
'<br><b style="color:var(--cy)">Contrôle :</b> '+esc(d[2])+'</div>':'')+'</div>'}).join(""):
ey("i-bolt","Aucun DTC","Aucun code défaut rattaché aux fiches corrélées.")}
function renderFaults(){
$("fVeh").innerHTML=vehCard();
var all=current();
$("fSub").textContent=all.length+" fiche(s) · "+FSEL.length+" sélectionnée(s) · "+
uniq([].concat.apply([],all.map(function(f){return f.dtc}))).length+" DTC";
var box=$("fList");box.innerHTML="";
if(!all.length)box.innerHTML=ey("i-shieldok","Rien à signaler","Aucune fiche ne correspond aux filtres actifs.");
else all.forEach(function(f){box.appendChild(fCard(f,canW()))});
$("bBulkDone").disabled=$("bBulkCopy").disabled=(FSEL.length===0||!canW());
$("bF").textContent=all.length}
function renderServ(){
$("sVeh").innerHTML=ready()?vehCard():"";
$("sSpec").innerHTML=specPanel();bindEng($("sSpec"));
var box=$("sPlan"),rl=$("revList");
if(!ready()){
rl.innerHTML=ey("i-clock","
