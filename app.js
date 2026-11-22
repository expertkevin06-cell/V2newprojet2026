/* ═══ KEV FUSION 2026 — MOTEUR app.js v16 · complet · démarrage défensif ═══ */
(function(){
"use strict";
var K=window.KF||{err:function(){},set:function(){},unlock:function(){},lock:function(){},role:null,errors:[]};
var D=window.KFD;
var $=function(i){return document.getElementById(i)};
var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
var el=function(t,c,h){var n=document.createElement(t);if(c)n.className=c;if(h!=null)n.innerHTML=h;return n};
var safe=function(f,n){try{return f()}catch(e){K.err(n+" : "+((e&&e.message)||e));return null}};
if(!D||!D.cat||!D.faults||!D.dom||!D.rules||!D.revs||!D.dtc){
K.set([{ok:false,l:"data.js chargé (window.KFD)",d:"absent ou incomplet",f:true},{ok:true,l:"Noyau d'authentification",d:"mot de passe opérationnel"}]);return;}

var FUEL=D.fuel,SEV=D.sev,KIND=D.kind,DOM=D.dom,TQ=D.tq,DTC=D.dtc;
var DM={},CV={am:"amH",rd:"rd",gr:"gr",bl:"bl",vi:"vi",te:"te",mg:"mg",cy:"cy"};
DOM.forEach(function(d){DM[d[0]]={n:d[1],i:d[2],c:d[3]}});
var KCL={rappel:"kr",campagne:"kc",tsb:"kt",panne:"kp"},SCL={critique:"sc",eleve:"se",moyen:"sm",info:"si"};
var YMIN=2017,YMAX=2027;
var ENG=D.eng.map(function(r){return[new RegExp(r[0]),r[1],r[2],r[3],r[4],r[5]]});
var EVA=D.eva.map(function(r){return[new RegExp(r[0]),r[1],r[2],r[3]]});
var NFD=function(s){return String(s==null?"":s).normalize("NFD").replace(/[\u0300-\u036f]/g,"")};
var norm=function(s){return NFD(s).toLowerCase().replace(/[^a-z0-9]+/g," ").trim()};
var slug=function(s){return NFD(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")};
var yy=function(v){var n=parseInt(v,10);return n<100?2000+n:n};
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
var uniq=function(a){return a.filter(function(x,i){return a.indexOf(x)===i})};
var nf=function(n){return Number(n).toLocaleString("fr-FR")};
var kw=function(h){return Math.round(h/1.35962)};
var csv=function(s){return String(s||"").split(",").map(function(x){return x.trim()}).filter(Boolean)};
var moT=function(m){if(!m)return"—";var y=Math.floor(m/12),r=m%12;return(y?y+" ans":"")+(y&&r?" ":"")+(r?r+" mois":"")};
var dtT=function(t){return new Date(t).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"})};
var hl=function(t,q){t=String(t==null?"":t);if(!q)return esc(t);
var a=NFD(t).toLowerCase(),b=NFD(q).toLowerCase(),i=a.indexOf(b);
if(i<0||!b)return esc(t);
return esc(t.slice(0,i))+"<mark>"+esc(t.slice(i,i+b.length))+"</mark>"+esc(t.slice(i+b.length))};
var alias=function(n){var s=norm(n),x=[];
if(s.indexOf("skoda")>=0)x.push("skoda");if(s.indexOf("citroen")>=0)x.push("citroen");
if(s.indexOf("ds automobiles")>=0)x.push("ds");if(s.indexOf("mercedes")>=0)x.push("mercedes benz mb");
if(s.indexOf("land")>=0)x.push("landrover");if(s.indexOf("lynk")>=0)x.push("lynk co");return x.join(" ")};

function spec(e){
var code=String(e.code||"").toUpperCase(),ev=e.fuel==="EV";
var b=(String(e.tech||"").match(/([\d]+[,.]?[\d]*)\s*kWh/i)||[])[1];
var kwh=b?parseFloat(String(b).replace(",",".")):null;
if(ev){var a=["Synchrone aimants permanents",400,"Plateforme EV"],i;
for(i=0;i<EVA.length;i++)if(EVA[i][0].test(code)){a=[EVA[i][1],EVA[i][2],EVA[i][3]];break}
var v=(String(e.tech||"").match(/(400|800)\s*V/i)||[])[1];
return{ev:1,kwh:kwh,arch:a[0],volt:v?+v:a[1],plat:a[2],disp:null,cyl:null,
lay:e.hp>350?"Double moteur AWD":"Moteur unique",feed:"Électrique · onduleur triphasé",
dist:"Réducteur rapport fixe",tq:null,exact:1};}
var s=null,j;for(j=0;j<ENG.length;j++)if(ENG[j][0].test(code)){s=ENG[j];break}
var fl=(String(e.fam||"").match(/(\d[.,]\d)/)||[])[1];
var nom=fl?Math.round(parseFloat(fl.replace(",","."))*1000):null;
var disp=s?s[1]:nom,cyl=s?s[2]:(disp?(disp<1300?3:disp<2600?4:disp<3400?6:8):null);
var k1=slug(String(e.code||"").split(/[^A-Za-z0-9-]/)[0])+"|"+e.hp,k2=slug(e.fam)+"|"+e.hp;
return{ev:0,kwh:null,disp:disp,exact:!!s,cyl:cyl,lay:s?s[3]:(cyl?cyl+" en ligne":"—"),
feed:s?s[4]:(e.fuel==="D"?"Diesel common rail":"Essence injection"),
dist:s?s[5]:(/chaîne|chaine/i.test(e.tech||"")?"Chaîne":(/courroie/i.test(e.tech||"")?"Courroie":"—")),
tq:TQ[k1]||TQ[k2]||null};}
function famL(e){var s=spec(e);
if(s.ev)return s.kwh?"Électrique "+String(s.kwh).replace(".",",")+" kWh":"Électrique";
var L=s.disp?(s.disp/1000).toFixed(1).replace(".",",")+" ":"";
return(L+String(e.fam||"").replace(/^\d[.,]\d\s*/,"").replace(/\s*\d{2,4}\s*ch/i,"").trim()).trim()||e.fam;}
function famM(e){var s=spec(e);
return s.ev?((s.kwh?s.kwh+" kWh · ":"")+s.volt+" V · "+s.plat):
((s.disp?s.disp+" cm³":"cyl. n.c.")+(s.cyl?" · "+s.cyl+" cyl.":"")+" · "+FUEL[e.fuel]);}
function parseModel(b,m){var engs=[];
String(m[5]).split(";").filter(Boolean).forEach(function(f){
var p=f.split("|"),fam=p[0],code=p[2]||"—",fuel=FUEL[p[3]]?p[3]:"E";
var yr=(p[4]||"17-27").split("-"),tech=p[5]||"",y0=yy(yr[0]),y1=yy(yr[1]||yr[0]);
String(p[1]||"").split(",").filter(Boolean).forEach(function(h,i){
var q=h.split(":"),hp=parseInt(q[0],10)||0,kwh=q[1];
var t=tech+(kwh?((tech?" · ":"")+kwh+" kWh"):"");
var o={key:b.id+"/"+m[0]+"/"+slug(fam)+"/"+hp+"/"+i,fam:fam,famKey:slug(fam),hp:hp,code:code,fuel:fuel,
y0:Math.max(y0,m[2]),y1:Math.min(y1,m[3]),tech:t,brand:b.id,brandName:b.name,model:m[0],
modelName:m[1],seg:m[4],my0:m[2],my1:m[3]};
var sp=spec(o);o.gk=o.famKey+(sp.ev?"|"+(sp.kwh||""):"");o.disp=sp.ev?sp.kwh:sp.disp;engs.push(o);});});
return{id:m[0],name:m[1],y0:m[2],y1:m[3],seg:m[4],brand:b.id,brandName:b.name,engines:engs};}
function build(raw){return raw.map(function(b){var bo={id:b[0],name:b[1],country:b[2]};
return{id:b[0],name:b[1],country:b[2],models:b[3].map(function(m){return parseModel(bo,m)})};});}
var ALLB=D.cat.map(function(b){return b[0]});
var expand=function(l){return l==="ALL"?ALLB.slice():csv(l)};
var FAULTS0=D.faults.map(function(x){return{id:x[0],scope:x[1],brands:expand(x[2]),target:x[3],
kind:x[4],sev:x[5],y0:x[6],y1:x[7],titre:x[8],sym:x[9],pro:String(x[10]).split("|"),org:x[11],
dtc:csv(x[12]),src:x[13],dom:csv(x[14])}});
var REVS0=D.revs.map(function(r){return{id:r[0],brands:expand(r[1]),match:r[2],organ:r[3],
oldKm:r[4],newKm:r[5],oldMo:r[6],newMo:r[7],src:r[8],note:r[9],y0:2017,y1:2027}});
function cond(c,e,s){switch(c){
case"ice":return!s.ev;case"ev":return!!s.ev;case"hv":return s.ev||e.fuel==="P"||e.fuel==="H";
case"plug":return s.ev||e.fuel==="P";case"diesel":return e.fuel==="D";case"petrol":return!s.ev&&e.fuel!=="D";
case"chain":return!s.ev&&/chaîne|chaine/i.test(s.dist);case"wet":return!s.ev&&/humide/i.test(s.dist);
case"dry":return!s.ev&&/courroie/i.test(s.dist)&&!/humide/i.test(s.dist);
case"turbo":return!s.ev&&/turbo/i.test(s.feed);
case"scr":return/scr|adblue/i.test((e.tech||"")+" "+s.feed);
case"dpf":return e.fuel==="D"||/gpf/i.test(e.tech||"");
case"egr":return e.fuel==="D"||/gpf|egr/i.test(e.tech||"");
case"mhev":return!s.ev&&/48|mhev|isg|mild/i.test((e.tech||"")+" "+s.feed);
case"dct":return!s.ev&&/dct|dsg|e-dcs6|edc|tct/i.test((e.tech||"")+" "+famL(e));
default:return true;}}
function rules(e){return D.rules.filter(function(r){return!e||cond(r[9],e,spec(e))}).map(function(r){
return{id:r[0],scope:"rule",brands:[],target:"",kind:r[2],sev:r[3],y0:YMIN,y1:YMAX,titre:r[4],
sym:r[5],pro:String(r[6]).split("|"),org:r[7],dtc:csv(r[8]),src:"Protocole atelier transversal",dom:csv(r[1]),rule:1}});}

var LS={db:"kf.db.v16",aux:"kf.aux.v16",acc:"kf.acc.v16",nf:"kf.nf.v16",dev:"kf.dev.v16"};
var CAT=[],FAULTS=[],REVC=[],NOTES={},VIEWS=[],BK=[],TIERS=[],NOTIF=[],AUDIT=null,UPD=[];
var ROLE=null,DEVICE="",admTimer=null,CO={},openC=null,seenPend={},lastSig="",waitMode=false;
var SEL={brand:"",model:"",year:"",fam:"",hp:""};
var FIL={q:"",sev:[],kind:"",sort:"sev",bs:true,rules:true,done:false,dom:[]};
var USE={km:15000,sev:"normal",clim:"tempere"};
var CUI={q:"",sort:"brand",dir:1,page:0,size:40,sel:[]};
var FSEL=[],revQ="";
var canW=function(){return ROLE==="admin"};
function engines(){var o=[];CAT.forEach(function(b){b.models.forEach(function(m){m.engines.forEach(function(e){o.push(e)})})});return o}
function B(id){for(var i=0;i<CAT.length;i++)if(CAT[i].id===id)return CAT[i];return null}
function M(b,m){var x=B(b);if(!x)return null;for(var i=0;i<x.models.length;i++)if(x.models[i].id===m)return x.models[i];return null}
var ov=function(a,b,c,d){return a<=d&&c<=b};
var allRevs=function(){return REVS0.concat(REVC)};
function lsGet(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
function saveDB(){lsSet(LS.db,{cat:CAT,faults:FAULTS,revs:REVC,upd:UPD,v:16})}
function loadDB(){var d=lsGet(LS.db,null);
if(d&&d.v===16&&d.cat&&d.cat.length){CAT=d.cat;FAULTS=d.faults||[];REVC=d.revs||[];UPD=d.upd||[];return true}return false}
function saveAux(){lsSet(LS.aux,{notes:NOTES,views:VIEWS,bk:BK})}
function loadAux(){var d=lsGet(LS.aux,{});NOTES=d.notes||{};VIEWS=d.views||[];BK=d.bk||[]}
function saveAcc(){lsSet(LS.acc,TIERS);ping()}
function loadAcc(){TIERS=lsGet(LS.acc,[])||[]}
function saveNf(){lsSet(LS.nf,NOTIF.slice(0,60));ping()}
function loadNf(){NOTIF=lsGet(LS.nf,[])||[]}
function resetSeed(){CAT=build(D.cat);FAULTS=FAULTS0.map(function(f){return Object.assign({},f)});REVC=[];UPD=[];saveDB()}
var BC=null;try{BC=new BroadcastChannel("kf26")}catch(e){}
function ping(){try{if(BC)BC.postMessage({t:"s"})}catch(e){}}
function toast(m,t,undo){var box=$("toasts");if(!box)return;t=t||"in";
var ic={ok:"i-check",ba:"i-warn",wa:"i-warn",in:"i-info",te:"i-user"}[t]||"i-info";
var n=el("div","to "+t,'<svg class="ic"><use href="#'+ic+'"/></svg><div style="flex:1;min-width:0">'+esc(m)+'</div>');
if(undo){var b=el("button","ud","Annuler");b.type="button";b.onclick=function(){undo();n.remove()};n.appendChild(b)}
box.appendChild(n);setTimeout(function(){n.classList.add("ou");setTimeout(function(){n.remove()},260)},undo?7000:4200);}
function notify(type,txt,meta){NOTIF.unshift({id:"N"+Date.now()+Math.random().toString(36).slice(2,5),
type:type,txt:txt,meta:meta||"",ts:Date.now(),read:false});saveNf();renderBell();}

function Combo(host,ph,cb){this.h=host;this.ph=ph;this.cb=cb;this.items=[];this.value="";this.dis=true;this.sig="";
host.innerHTML="";this.btn=el("button","cb");this.btn.type="button";
this.btn.setAttribute("role","combobox");this.btn.setAttribute("aria-expanded","false");
this.clr=el("span","ccl",'<svg class="ic"><use href="#i-x"/></svg>');
host.appendChild(this.btn);host.appendChild(this.clr);var s=this;
this.btn.onclick=function(){s.toggle()};
this.clr.onclick=function(e){e.stopPropagation();s.pick("")};
this.btn.onkeydown=function(e){if(e.key==="ArrowDown"||e.key==="Enter"||e.key===" "){e.preventDefault();s.open()}};
this.render();}
Combo.prototype.set=function(it,v,dis){var sig=JSON.stringify(it.map(function(i){return[i.v,i.t,i.m,i.b]}))+"|"+v+"|"+!!dis;
if(sig===this.sig)return;this.sig=sig;this.items=it;this.value=v||"";this.dis=!!dis;this.render();if(openC===this)this.fill();};
Combo.prototype.cur=function(){var v=this.value;return this.items.filter(function(i){return String(i.v)===String(v)})[0]};
Combo.prototype.render=function(){var c=this.cur();this.h.dataset.filled=this.value?"1":"0";this.btn.disabled=this.dis;
this.btn.innerHTML=(c?'<span class="cv">'+esc(c.t)+'</span>'+(c.m?'<span class="cm">'+esc(c.m)+'</span>':''):
'<span class="ph">'+esc(this.ph)+'</span>')+'<svg class="ic cv2"><use href="#i-chev"/></svg>';};
Combo.prototype.toggle=function(){openC===this?this.close():this.open()};
Combo.prototype.open=function(){if(this.dis)return;if(openC&&openC!==this)openC.close();openC=this;
this.h.dataset.open="1";this.btn.setAttribute("aria-expanded","true");
var L=$("cL");L.innerHTML="";this.pop=el("div","cp");
var sb=el("div","cps");this.inp=el("input");this.inp.type="search";this.inp.placeholder="Filtrer sans accent…";
this.inp.autocomplete="off";sb.appendChild(this.inp);
this.list=el("div","cpl");this.list.setAttribute("role","listbox");this.foot=el("div","cpf");
this.pop.appendChild(sb);this.pop.appendChild(this.list);this.pop.appendChild(this.foot);L.appendChild(this.pop);
this.pop.style.pointerEvents="auto";this.place();this.fill();var s=this;
this.inp.oninput=function(){s.fill()};this.inp.onkeydown=function(e){s.key(e)};
if(this.items.length<=7)sb.style.display="none";
setTimeout(function(){if(s.items.length>7&&s.inp)s.inp.focus()},30);
this._o=function(e){if(s.pop&&!s.pop.contains(e.target)&&!s.h.contains(e.target))s.close()};
setTimeout(function(){document.addEventListener("pointerdown",s._o)},0);
this._r=function(){s.place()};window.addEventListener("scroll",this._r,true);window.addEventListener("resize",this._r);};
Combo.prototype.place=function(){if(!this.pop)return;var r=this.btn.getBoundingClientRect();
var w=Math.min(Math.max(r.width,240),window.innerWidth-16);
var below=window.innerHeight-r.bottom-12,up=below<200&&r.top>below;
var h=Math.min(340,Math.max(160,up?r.top-12:below));
this.pop.style.width=w+"px";this.pop.style.left=clamp(r.left,8,window.innerWidth-w-8)+"px";this.pop.style.maxHeight=h+"px";
if(up){this.pop.style.top="auto";this.pop.style.bottom=(window.innerHeight-r.top+6)+"px"}
else{this.pop.style.bottom="auto";this.pop.style.top=(r.bottom+6)+"px"}};
Combo.prototype.fill=function(){var q=this.inp.value||"",nq=norm(q),s=this;
var a=this.items.map(function(i){var hay=norm(i.t+" "+(i.m||"")+" "+(i.b||"")+" "+(i.a||""));
if(!nq)return{i:i,s:0};var nt=norm(i.t+" "+(i.a||""));
return hay.indexOf(nq)>=0?{i:i,s:nt.indexOf(nq)===0?0:(nt.indexOf(nq)>=0?1:2)}:null}).filter(Boolean);
a.sort(function(x,y){return x.s-y.s});a=a.map(function(x){return x.i});
this.view=a;this.idx=Math.max(0,a.map(function(i){return String(i.v)}).indexOf(String(this.value)));
this.list.innerHTML=a.length?"":'<div class="cpe">Aucun résultat — essayez sans accent</div>';
a.forEach(function(i,n){var d=el("div","co"+(n===s.idx?" cu":""));
d.setAttribute("role","option");d.setAttribute("aria-selected",String(String(i.v)===String(s.value)));
d.innerHTML='<svg class="ic tk"><use href="#i-check"/></svg><div class="ol"><div class="ot">'+hl(i.t,q)+'</div>'+
(i.m?'<div class="om">'+hl(i.m,q)+'</div>':'')+'</div>'+(i.b?'<span class="ob">'+esc(i.b)+'</span>':'');
d.onmouseenter=function(){s.idx=n;s.hi()};d.onclick=function(){s.pick(i.v)};s.list.appendChild(d);});
this.foot.innerHTML='<span>'+a.length+' / '+this.items.length+'</span><span>↑↓ · Entrée · Échap</span>';
var c=this.list.children[this.idx];if(c&&c.scrollIntoView)c.scrollIntoView({block:"nearest"});};
Combo.prototype.hi=function(){var s=this;[].forEach.call(this.list.children,function(c,n){c.classList.toggle("cu",n===s.idx)})};
Combo.prototype.key=function(e){var c;
if(e.key==="Escape"){e.preventDefault();this.close();this.btn.focus()}
else if(e.key==="ArrowDown"){e.preventDefault();this.idx=Math.min(this.view.length-1,this.idx+1);this.hi();c=this.list.children[this.idx];if(c)c.scrollIntoView({block:"nearest"})}
else if(e.key==="ArrowUp"){e.preventDefault();this.idx=Math.max(0,this.idx-1);this.hi();c=this.list.children[this.idx];if(c)c.scrollIntoView({block:"nearest"})}
else if(e.key==="Enter"){e.preventDefault();var i=this.view[this.idx];if(i)this.pick(i.v)}};
Combo.prototype.pick=function(v){this.close();this.cb(String(v))};
Combo.prototype.close=function(){if(openC!==this)return;openC=null;this.h.dataset.open="0";
this.btn.setAttribute("aria-expanded","false");document.removeEventListener("pointerdown",this._o);
window.removeEventListener("scroll",this._r,true);window.removeEventListener("resize",this._r);
$("cL").innerHTML="";this.pop=null;};

function modelsOf(b,y){var x=B(b);if(!x)return[];
return x.models.filter(function(m){return!y||m.engines.some(function(e){return e.y0<=+y&&e.y1>=+y})})
.sort(function(a,c){return norm(a.name).localeCompare(norm(c.name))});}
function yearsOf(b,m){var x=M(b,m);if(!x)return[];var s=[];
x.engines.forEach(function(e){for(var y=Math.max(e.y0,YMIN);y<=Math.min(e.y1,YMAX);y++)if(s.indexOf(y)<0)s.push(y)});
return s.sort(function(a,c){return c-a});}
function famsOf(b,m,y){var x=M(b,m);if(!x)return[];var map={},order=[];
x.engines.filter(function(e){return!y||(e.y0<=+y&&e.y1>=+y)}).forEach(function(e){
if(!map[e.gk]){map[e.gk]={k:e.gk,e:e,hp:[]};order.push(e.gk)}
if(map[e.gk].hp.indexOf(e.hp)<0)map[e.gk].hp.push(e.hp);});
return order.map(function(k){return map[k]}).sort(function(a,c){return norm(famL(a.e)).localeCompare(norm(famL(c.e)))});}
function hpsOf(b,m,y,g){var x=M(b,m);if(!x)return[];
return x.engines.filter(function(e){return(!y||(e.y0<=+y&&e.y1>=+y))&&(!g||e.gk===g)}).sort(function(a,c){return a.hp-c.hp});}
function resolved(){if(!SEL.brand)return[];
return engines().filter(function(e){return e.brand===SEL.brand&&(!SEL.model||e.model===SEL.model)&&
(!SEL.year||(e.y0<=+SEL.year&&e.y1>=+SEL.year))&&(!SEL.fam||e.gk===SEL.fam)&&(!SEL.hp||e.hp===+SEL.hp)});}
var ready=function(){return!!(SEL.brand&&SEL.model&&SEL.fam&&SEL.hp)};
function sync(){if(!CO.brand)return;
var bs=CAT.slice().sort(function(a,b){return norm(a.name).localeCompare(norm(b.name))}).map(function(b){
var n=b.models.reduce(function(a,m){return a+m.engines.length},0);
return{v:b.id,t:b.name,m:b.models.length+" modèles · "+n+" motorisations",b:b.country,a:alias(b.name)};});
CO.brand.set(bs,SEL.brand,false);
var ms=SEL.brand?modelsOf(SEL.brand,SEL.year).map(function(m){
return{v:m.id,t:m.name,m:m.y0+"–"+m.y1+" · "+m.seg+(m.y0>=2024?" · nouveau":"")+" · "+m.engines.length+" mot."};}):[];
if(SEL.model&&!ms.some(function(m){return m.v===SEL.model}))SEL.model="";
CO.model.set(ms,SEL.model,!SEL.brand);
var mm=SEL.model?M(SEL.brand,SEL.model):null;
var ys=SEL.model?yearsOf(SEL.brand,SEL.model).map(function(y){
return{v:String(y),t:String(y),m:mm.engines.filter(function(e){return e.y0<=y&&e.y1>=y}).length+" motorisation(s)"};}):[];
if(SEL.year&&!ys.some(function(y){return y.v===SEL.year}))SEL.year="";
CO.year.set(ys,SEL.year,!SEL.model);
var fs=SEL.model?famsOf(SEL.brand,SEL.model,SEL.year).map(function(f){
var h=f.hp.slice().sort(function(a,b){return a-b});
return{v:f.k,t:famL(f.e),m:famM(f.e),b:h.length>1?h[0]+"–"+h[h.length-1]+" ch":h[0]+" ch"};}):[];
if(SEL.fam&&!fs.some(function(f){return f.v===SEL.fam})){SEL.fam="";SEL.hp=""}
CO.fam.set(fs,SEL.fam,!SEL.model);
var hs=[],seen={};
(SEL.model?hpsOf(SEL.brand,SEL.model,SEL.year,SEL.fam):[]).forEach(function(e){var s=spec(e);
var o={v:String(e.hp),t:e.hp+" ch",m:kw(e.hp)+" kW"+(s.tq?" · "+s.tq+" N·m":"")+" · "+e.code,
b:s.ev?(s.kwh?s.kwh+" kWh":"EV"):FUEL[e.fuel]};
var k=o.v+o.m;if(!seen[k]){seen[k]=1;hs.push(o)}});
if(SEL.hp&&!hs.some(function(h){return h.v===SEL.hp}))SEL.hp="";
CO.hp.set(hs,SEL.hp,!SEL.model);
[["s1",SEL.brand],["s2",SEL.model],["s3",SEL.year],["s4",SEL.fam],["s5",SEL.hp]].forEach(function(p){
var n=$(p[0]);if(n)n.classList.toggle("dn",!!p[1]);});
var n=resolved().length,st=$("beState");
if(!SEL.brand){st.className="ch";st.textContent="Aucune sélection"}
else{st.className="ch "+(n?"ok":"wa");
st.textContent=ready()?n+" motorisation corrélée":(n?n+" motorisation(s) — affinez":"Combinaison sans moteur");}
st.style.height="24px";st.style.fontSize="10.5px";
var b=B(SEL.brand),f=(SEL.fam&&mm)?famsOf(SEL.brand,SEL.model,SEL.year).filter(function(x){return x.k===SEL.fam})[0]:null;
$("beHint").textContent=[b?b.name:null,mm?mm.name:null,SEL.year||null,f?famL(f.e):null,SEL.hp?SEL.hp+" ch":null]
.filter(Boolean).join(" › ")||"Recherche sans accent — tapez « skoda »";
var dl=$("brandList");if(dl&&!dl.children.length)dl.innerHTML=CAT.map(function(x){return'<option value="'+esc(x.name)+'">'}).join("");}
function newSearch(){Object.keys(CO).forEach(function(k){CO[k].close()});
SEL={brand:"",model:"",year:"",fam:"",hp:""};FSEL=[];FIL.q="";$("q").value="";
FIL.sev=[];FIL.kind="";FIL.sort="sev";FIL.dom=[];
$("selKind").value="";$("selSort").value="sev";
[].forEach.call($("sevSeg").querySelectorAll("button"),function(b){b.setAttribute("aria-pressed","false")});
sync();renderDom();renderAll();toast("Champs vidés — nouvelle recherche","ok");window.scrollTo({top:0,behavior:"smooth"});}

function hits(f,e){if(f.y1<e.y0||f.y0>e.y1)return false;if(f.scope==="rule")return true;
if(f.brands.indexOf(e.brand)<0)return false;
if(f.scope==="brand")return FIL.bs;
if(f.scope==="model")return csv(f.target).indexOf(e.model)>=0;
if(f.scope==="engine")return slug(f.target)===e.famKey;return false;}
function pool(strict){var eng=resolved();if(strict&&!ready())return[];
var out=[],seen={};
if(eng.length){FAULTS.forEach(function(f){if(!seen[f.id]&&eng.some(function(e){return hits(f,e)})){seen[f.id]=1;out.push(f)}});
if(FIL.rules){var rs={};eng.forEach(function(e){rules(e).forEach(function(x){if(!rs[x.id]){rs[x.id]=1;out.push(x)}})})}}
else if(SEL.brand){out=FAULTS.filter(function(f){return f.brands.indexOf(SEL.brand)>=0&&(f.scope!=="brand"||FIL.bs)});
if(FIL.rules)out=out.concat(rules(null));}
else{out=FAULTS.slice();if(FIL.rules)out=out.concat(rules(null))}
return out;}
function applyF(list){var o=list.slice(),q=norm(FIL.q);
if(q.length>=2){var t=q.split(/\s+/);
o=o.filter(function(f){var h=norm([f.titre,f.sym,f.org,f.src,KIND[f.kind],(f.dtc||[]).join(" "),f.pro.join(" "),
(f.dom||[]).map(function(d){return DM[d]?DM[d].n+" "+d:""}).join(" ")].join(" "));
return t.every(function(x){return h.indexOf(x)>=0});});}
if(FIL.sev.length)o=o.filter(function(f){return FIL.sev.indexOf(f.sev)>=0});
if(FIL.kind)o=o.filter(function(f){return f.kind===FIL.kind});
if(FIL.dom.length)o=o.filter(function(f){return(f.dom||[]).some(function(d){return FIL.dom.indexOf(d)>=0})});
if(!FIL.done)o=o.filter(function(f){return!(NOTES[f.id]&&NOTES[f.id].done)});
var s=FIL.sort;
o.sort(function(a,b){if(s==="sev")return SEV[a.sev].r-SEV[b.sev].r||b.y1-a.y1;
if(s==="year")return b.y1-a.y1||SEV[a.sev].r-SEV[b.sev].r;
if(s==="alpha")return norm(a.titre).localeCompare(norm(b.titre));
if(s==="src")return norm(a.src).localeCompare(norm(b.src));return 0;});
return o;}
var current=function(){return applyF(pool(false))};
var strictCur=function(){return applyF(pool(true))};
function domPills(f){return(f.dom||[]).slice(0,5).map(function(d){var m=DM[d];if(!m)return"";
return'<span class="pl" style="border-color:var(--'+m.c+');color:var(--'+CV[m.c]+')"><svg class="ic"><use href="#'+m.i+'"/></svg>'+esc(m.n)+'</span>';}).join("");}
function fCard(f,chk){var dn=NOTES[f.id]&&NOTES[f.id].done;
var d=el("div","fc v-"+f.sev+(dn?" dn":""));d.tabIndex=0;d.setAttribute("role","button");
d.innerHTML='<div class="fh">'+(chk?'<span class="fk" role="checkbox" aria-checked="'+(FSEL.indexOf(f.id)>=0)+'" tabindex="0"><svg class="ic"><use href="#i-check"/></svg></span>':'')+
'<div class="ft">'+esc(f.titre)+'</div></div><div class="fm"><span class="pl '+KCL[f.kind]+'">'+KIND[f.kind]+
'</span><span class="pl '+SCL[f.sev]+'">'+SEV[f.sev].n+'</span><span class="pl">'+f.y0+'–'+f.y1+
'</span><span class="pl'+(f.scope==="engine"?" mx":"")+'">'+
(f.scope==="engine"?"Moteur exact":f.scope==="model"?"Modèle":f.scope==="rule"?"Technologie":"Marque")+'</span>'+
(dn?'<span class="pl" style="color:var(--gr);border-color:rgba(74,222,128,.4)">Traitée</span>':'')+'</div>'+
'<div class="fm">'+domPills(f)+'</div><div class="fs">'+esc(f.sym)+'</div>'+
(f.dtc.length?'<div class="dr">'+f.dtc.map(function(c){return'<span class="dtc">'+esc(c)+'</span>'}).join("")+'</div>':'')+
'<div class="fsr"><svg class="ic"><use href="#i-link"/></svg>'+esc(f.src)+
((NOTES[f.id]&&NOTES[f.id].txt)?' · <span style="color:var(--cy)">note</span>':'')+'</div>';
d.onclick=function(e){if(e.target.closest&&e.target.closest(".fk"))return;openF(f)};
d.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();openF(f)}};
if(chk){var c=d.querySelector(".fk");
var tg=function(e){e.stopPropagation();var i=FSEL.indexOf(f.id);if(i>=0)FSEL.splice(i,1);else FSEL.push(f.id);renderFaults();};
c.onclick=tg;c.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();tg(e)}};}
return d;}
var ey=function(i,t,x){return'<div class="ey"><svg class="ic"><use href="#'+i+'"/></svg><h3 style="margin-bottom:6px">'+esc(t)+'</h3><p>'+x+'</p></div>'};
function vehCard(){if(!SEL.brand)return"";
var eng=resolved(),b=B(SEL.brand),m=SEL.model?M(SEL.brand,SEL.model):null,e=eng[0];
var all=strictCur(),crit=all.filter(function(f){return f.sev==="critique"}).length,s=e?spec(e):null;
var title=[b?b.name:"",m?m.name:""].filter(Boolean).join(" ");
var sub=e?famL(e)+" · "+e.hp+" ch ("+kw(e.hp)+" kW) · "+e.code:(m?m.engines.length+" motorisations":b.models.length+" modèles");
return'<div class="vc"><div class="vb">'+esc((b?b.name:"?").slice(0,3).toUpperCase())+
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
'</div></div><div class="vs"><div class="vst"><b style="color:'+(crit?"var(--rd)":"var(--gr)")+'">'+crit+
'</b><span>Critiques</span></div><div class="vst"><b style="color:var(--amH)">'+all.length+
'</b><span>Fiches</span></div><div class="vst"><b style="color:var(--cy)">'+eng.length+'</b><span>Moteurs</span></div></div></div>';}
function specPanel(){var eng=resolved();if(!SEL.brand||!eng.length)return"";
if(!SEL.fam||!SEL.hp){var rows=eng.slice().sort(function(a,b){return a.hp-b.hp});
return'<div class="pn pd rvl" style="margin-bottom:16px"><div class="sh"><div class="si ic-te"><svg class="ic"><use href="#i-piston"/></svg></div>'+
'<div><h2>Motorisations réelles du modèle</h2><div class="sb">'+rows.length+' variante(s) — sélectionnez une cylindrée puis une puissance</div></div></div>'+
'<div class="tw"><table style="min-width:660px"><thead><tr><th>Cylindrée · type</th><th>cm³ / kWh</th><th>Architecture</th><th>Puissance</th><th>Couple</th><th>Code</th><th>Années</th><th></th></tr></thead><tbody>'+
rows.map(function(e){var s=spec(e);
return'<tr><td class="tn">'+esc(famL(e))+'<div class="mi">'+esc(FUEL[e.fuel])+' · '+esc(s.feed)+'</div></td>'+
'<td class="mo" style="color:var(--amH)">'+(s.ev?(s.kwh?s.kwh+" kWh":"—"):(s.disp||"—"))+'</td>'+
'<td class="mi">'+esc(s.ev?s.plat:s.lay)+'</td><td class="mo" style="color:var(--rd);font-weight:800">'+e.hp+
' ch<div class="mi">'+kw(e.hp)+' kW</div></td><td class="mo" style="color:var(--gr)">'+(s.tq?s.tq+" N·m":"—")+
'</td><td class="mo">'+esc(e.code)+'</td><td class="mo">'+e.y0+'–'+e.y1+
'</td><td><button class="bt sm" type="button" data-eng="'+esc(e.key)+'"><svg class="ic"><use href="#i-eye"/></svg></button></td></tr>';}).join("")+
'</tbody></table></div></div>';}
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
return'<div class="pn pd rvl" style="margin-bottom:16px"><div class="sh"><div class="si ic-te"><svg class="ic"><use href="#'+(s.ev?"i-batt":"i-piston")+'"/></svg></div>'+
'<div><h2>Fiche moteur — '+esc(famL(e))+' '+e.hp+' ch</h2><div class="sb">'+esc(e.brandName)+' '+esc(e.modelName)+
' · '+esc(e.code)+' · '+esc(e.tech||"—")+'</div></div></div><div class="spec">'+
it.map(function(p){return'<div class="spi '+p[0]+'"><div class="sk">'+esc(p[1])+'</div><div class="sv2">'+esc(p[2])+
'</div>'+(p[3]?'<div class="sd">'+esc(p[3])+'</div>':'')+'</div>';}).join("")+'</div>'+
(!s.ev&&/humide/i.test(s.dist)?'<div class="nt wa" style="margin-top:12px"><b>Distribution en bain d\'huile.</b> Contrôle de la largeur au gabarit et inspection de la crépine à chaque entretien.</div>':'')+
(s.ev?'<div class="nt in" style="margin-top:12px"><b>Véhicule électrique.</b> Aucun entretien moteur thermique : batterie HV, liquide pack, réducteur et freinage.</div>':'')+'</div>';}
function bindEng(r){if(!r)return;[].forEach.call(r.querySelectorAll("[data-eng]"),function(b){
b.onclick=function(){var e=engines().filter(function(x){return x.key===b.dataset.eng})[0];if(e)loadEng(e)};});}

function revsFor(e){var s=spec(e),hay=norm(e.fam+" "+e.code+" "+(e.tech||"")+" "+s.feed);
return allRevs().filter(function(r){
if(r.brands.indexOf(e.brand)<0)return false;
if(!ov(r.y0,r.y1,e.y0,e.y1))return false;
if(!r.match)return true;
var re;try{re=new RegExp(r.match,"i")}catch(_){return norm(r.match).split(/\s+/).every(function(t){return hay.indexOf(t)>=0})}
if(re.test(e.fam)||re.test(e.code)||re.test(e.tech||""))return true;
return norm(r.match).replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter(function(t){return t.length>2}).some(function(t){return hay.indexOf(t)>=0});});}
function revCard(r,e){var dk=r.oldKm?Math.round((r.newKm-r.oldKm)/r.oldKm*100):null;
var dm=r.oldMo?Math.round((r.newMo-r.oldMo)/r.oldMo*100):null;
var yrs=(e&&r.newKm)?Math.round(r.newKm/USE.km*10)/10:null;
return'<div class="rc"><div class="rh"><div class="si ic-mg" style="width:30px;height:30px"><svg class="ic"><use href="#i-clock"/></svg></div>'+
'<div style="flex:1;min-width:0"><h3 style="font-size:14.5px">'+esc(r.organ)+'</h3><div class="mi">'+
esc(r.brands.map(function(b){var x=B(b);return x?x.name:b}).join(" · "))+
(r.match?" · "+esc(r.match.replace(/\\\./g,".").replace(/\|/g," / ")):"")+'</div></div>'+
(dk!==null?'<span class="dl '+(dk>0?"up":"")+'">'+(dk>0?"+":"")+dk+' % km</span>':'')+
(dm!==null&&dm!==dk?'<span class="dl '+(dm>0?"up":"")+'">'+(dm>0?"+":"")+dm+' % temps</span>':'')+'</div>'+
'<div class="rns"><div class="rn ol"><div class="rl">Ancien</div><div class="rv2">'+(r.oldKm?nf(r.oldKm)+" km":"sans échéance")+
'</div><div class="mi">'+(r.oldMo?moT(r.oldMo):"—")+'</div></div><span class="arw">→</span>'+
'<div class="rn nw"><div class="rl">Révisé</div><div class="rv2">'+nf(r.newKm)+' km</div><div class="mi">'+(r.newMo?moT(r.newMo):"—")+'</div></div>'+
(yrs?'<div class="rn"><div class="rl">À '+nf(USE.km)+' km/an</div><div class="rv2" style="color:var(--cy)">'+
String(yrs).replace(".",",")+' ans</div><div class="mi">échéance km</div></div>':'')+'</div>'+
'<div class="nt mg" style="margin-top:11px;font-size:12px"><b>'+esc(r.src)+'.</b> '+esc(r.note)+' <b>Confirmer au VIN.</b></div></div>';}
function planFor(e){var s=spec(e),rv=revsFor(e),f=USE.sev==="severe"?0.6:(USE.sev==="mixte"?0.8:1);
var base=s.ev?[30000,60000,90000,120000,160000]:[15000,30000,60000,90000,120000,160000];
base=base.map(function(k){return Math.max(5000,Math.round(k*f/5000)*5000)});
var rk=rv.map(function(r){return r.newKm}).filter(function(k){return k>0&&k<=200000});
var steps=base.concat(rk).filter(function(k,i,a){return a.indexOf(k)===i}).sort(function(a,b){return a-b});
var wet=/humide/i.test(s.dist),chain=/chaîne|chaine/i.test(s.dist),ev=s.ev,hy=e.fuel==="H"||e.fuel==="P";
var scr=/scr|adblue/i.test((e.tech||"")+" "+s.feed),gpf=/gpf/i.test(e.tech||""),die=e.fuel==="D";
return steps.map(function(km,i){var ops=[];
var add=function(t,c,r){ops.push({t:t,c:!!c,r:!!r})};
rv.filter(function(r){return r.newKm===km}).forEach(function(r){
add(r.organ+" — intervalle révisé : "+nf(r.newKm)+" km"+(r.newMo?" / "+moT(r.newMo):"")+
(r.oldKm?" (au lieu de "+nf(r.oldKm)+" km)":""),1,1);});
if(ev){if(i===0)add("Contrôle visuel batterie HV, câblage orange et connecteurs");
add("Filtre d'habitacle (charbon actif)");add("Contrôle SOH batterie et delta de cellules");
if(km>=60000)add("Liquide de frein DOT 4 (tous les 2 ans)");
if(km>=90000)add("Contrôle circuit de refroidissement batterie (pompe LDR, échangeur)");
if(km>=120000){add("Liquide de refroidissement pack HV",1);add("Contrôle isolement HV au mégohmmètre",1)}
if(km>=160000)add("Contrôle complet pack HV, contacteurs et chargeur embarqué",1);
add("Contrôle disques / plaquettes (corrosion par faible sollicitation)");
if(USE.clim==="froid")add("Préconditionnement pack avant charge DC · pompe à chaleur");
if(USE.clim==="chaud")add("Contrôle température pack et débit de refroidissement en charge rapide");}
else{if(hy){if(i===0||km%30000===0)add("Vidange huile 0W16/0W20 normée + filtre à huile")}
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
if(USE.clim==="chaud"&&km%30000===0)add("Climat chaud : clim, condenseur, circuit LDR");}
return{km:km,mo:Math.round(km/USE.km*12),ops:ops,first:i<4,rev:rv.some(function(x){return x.newKm===km})};});}

function renderGate(){var g=$("dGate");if(!g)return;if(ready()){g.innerHTML="";return}
var b=B(SEL.brand),m=SEL.brand&&SEL.model?M(SEL.brand,SEL.model):null;
var f=(SEL.fam&&m)?famsOf(SEL.brand,SEL.model,SEL.year).filter(function(x){return x.k===SEL.fam})[0]:null;
var st=[["1","Marque",SEL.brand,b?b.name:"","brand"],["2","Modèle",SEL.model,m?m.name:"","model"],
["3","Cylindrée · type moteur",SEL.fam,f?famL(f.e):"","fam"],["4","Puissance réelle",SEL.hp,SEL.hp?SEL.hp+" ch":"","hp"]];
g.innerHTML='<div class="pn pd" style="margin-bottom:16px;border-color:rgba(251,191,36,.35)">'+
'<div class="sh"><div class="si ic-am"><svg class="ic"><use href="#i-lock"/></svg></div>'+
'<div><h2>Diagnostic expert — corrélation complète requise</h2><div class="sb">Seules les fiches liées à la marque, au modèle, à la motorisation <b>et</b> à la puissance sélectionnés sont affichées.</div></div>'+
'<span class="sp"></span><button class="bt sm" type="button" id="gRand"><svg class="ic"><use href="#i-dice"/></svg>Exemple complet</button></div>'+
'<div class="g4s">'+st.map(function(p){return'<button class="gs'+(p[2]?" dn":"")+'" type="button" data-go="'+p[4]+
'"><span class="gn">'+(p[2]?"✓":p[0])+'</span><span style="min-width:0"><span class="gt">'+esc(p[1])+
'</span><span class="gv">'+esc(p[3]||"à sélectionner")+'</span></span></button>';}).join("")+'</div>'+
'<div class="nt wa" style="margin-top:13px">Complétez les '+st.filter(function(p){return!p[2]}).length+
' champ(s) manquant(s) dans le banc de commande.</div></div>';
[].forEach.call(g.querySelectorAll("[data-go]"),function(x){x.onclick=function(){
var c=CO[x.dataset.go];if(c){c.btn.scrollIntoView({block:"center",behavior:"smooth"});setTimeout(function(){c.open()},260)}};});
var gr=$("gRand");if(gr)gr.onclick=function(){var e=engines();if(e.length)loadEng(e[Math.floor(Math.random()*e.length)])};}
function renderDiag(){renderGate();$("dVeh").innerHTML=ready()?vehCard():"";
$("dSpec").innerHTML=specPanel();bindEng($("dSpec"));
var box=$("dF"),tb=$("dT"),dd=$("dD");
if(!ready()){box.innerHTML=ey("i-lock","En attente de corrélation","Aucune fiche n'est affichée tant que la marque, le modèle, la motorisation et la puissance ne sont pas sélectionnés.");
tb.innerHTML=ey("i-book","En attente","Les TSB et bulletins apparaîtront pour la motorisation exacte.");
dd.innerHTML=ey("i-bolt","En attente","Les DTC corrélés apparaîtront après sélection complète.");
$("dFSub").textContent="Sélection incomplète";$("dTSub").textContent="Sélection incomplète";return;}
var all=strictCur(),p=all.filter(function(f){return f.kind!=="tsb"}),t=all.filter(function(f){return f.kind==="tsb"});
$("dFSub").textContent=p.length+" fiche(s) · corrélation stricte "+SEL.hp+" ch";
$("dTSub").textContent=t.length+" bulletin(s) pour cette motorisation";
box.innerHTML="";
if(!p.length)box.innerHTML=ey("i-shieldok","Aucune fiche critique","Aucune panne, campagne ou rappel ne correspond à cette combinaison exacte et aux filtres actifs.");
else p.slice(0,60).forEach(function(f){box.appendChild(fCard(f,false))});
tb.innerHTML="";
if(!t.length)tb.innerHTML=ey("i-book","Aucun bulletin","Aucun TSB ne correspond à la corrélation et aux filtres actifs.");
else t.slice(0,30).forEach(function(f){tb.appendChild(fCard(f,false))});
var codes=uniq([].concat.apply([],all.map(function(f){return f.dtc}))).sort();
dd.innerHTML=codes.length?codes.slice(0,40).map(function(c){var d=DTC[c];
return'<div class="dsc" style="margin-bottom:8px"><div class="dsc-h"><span class="dtc">'+esc(c)+'</span>'+
(d?esc(d[0]):"Code corrélé")+'</div>'+(d?'<div class="dsc-b" style="padding:10px 13px;font-size:12.5px">'+
'<b style="color:var(--amH)">Causes :</b> '+esc(d[1])+'<br><b style="color:var(--cy)">Contrôle :</b> '+esc(d[2])+'</div>':'')+'</div>';}).join(""):
ey("i-bolt","Aucun DTC","Aucun code défaut rattaché aux fiches corrélées.");}
function renderFaults(){$("fVeh").innerHTML=vehCard();var all=current();
$("fSub").textContent=all.length+" fiche(s) · "+FSEL.length+" sélectionnée(s) · "+
uniq([].concat.apply([],all.map(function(f){return f.dtc}))).length+" DTC";
var box=$("fList");box.innerHTML="";
if(!all.length)box.innerHTML=ey("i-shieldok","Rien à signaler","Aucune fiche ne correspond aux filtres actifs.");
else all.forEach(function(f){box.appendChild(fCard(f,canW()))});
$("bBulkDone").disabled=$("bBulkCopy").disabled=(FSEL.length===0||!canW());
$("bF").textContent=all.length;}
function renderServ(){$("sVeh").innerHTML=ready()?vehCard():"";
$("sSpec").innerHTML=specPanel();bindEng($("sSpec"));
var box=$("sPlan"),rl=$("revList");
if(!ready()){rl.innerHTML=ey("i-clock","Motorisation non identifiée","Sélectionnez marque → modèle → cylindrée/type → puissance pour les révisions applicables.");
box.innerHTML=ey("i-wrench","Sélection incomplète","Le plan exact nécessite une motorisation et une puissance identifiées.");
$("rSub").textContent="En attente";$("sSub").textContent="En attente";$("bR").textContent="0";renderRevAll();return;}
var e=resolved()[0],rv=revsFor(e),plan=planFor(e),s=spec(e);
$("bR").textContent=rv.length;
$("rSub").textContent=rv.length?rv.length+" révision(s) applicable(s) à "+famL(e)+" "+e.hp+" ch — km et échéance calendaire":"Aucune révision documentée pour cette motorisation";
rl.innerHTML=rv.length?rv.map(function(r){return revCard(r,e)}).join(""):ey("i-shieldok","Aucune révision","Les intervalles d'origine s'appliquent.");
$("sSub").textContent=famL(e)+" · "+e.hp+" ch ("+kw(e.hp)+" kW) · "+e.code+" · "+nf(USE.km)+" km/an · "+USE.sev;
box.innerHTML="";
plan.forEach(function(st,i){var d=el("div","stp"+(st.rev?" rvv":(st.first?" f4":"")));
d.innerHTML='<div class="kmb'+((st.rev||st.km>=120000)?" al":"")+'"><b>'+nf(st.km)+'</b><span>km'+
(st.first?" · entretien "+(i+1):"")+'</span><span class="tm">≈ '+moT(st.mo)+'</span></div><div class="ops">'+
st.ops.map(function(o){return'<div class="op'+(o.r?" rv":(o.c?" cr":""))+'"><svg class="ic"><use href="#'+
(o.r?"i-clock":(o.c?"i-warn":"i-check"))+'"/></svg><span>'+esc(o.t)+
(o.r?'<span class="ot rv">intervalle révisé</span>':(o.c?'<span class="ot">point critique</span>':''))+'</span></div>';}).join("")+'</div>';
box.appendChild(d);});
var n=el("div","nt wa");
n.innerHTML='<b>Spécificité moteur.</b> '+esc(e.tech||"—")+(s.disp&&!s.ev?" · "+s.disp+" cm³, "+s.lay:"")+
(s.ev&&s.kwh?" · pack "+s.kwh+" kWh, "+s.volt+" V":"")+". Échéances temporelles calculées sur <b>"+
nf(USE.km)+" km/an</b> ; confirmer la préconisation exacte au VIN.";
box.appendChild(n);renderRevAll();}
function renderRevAll(){var box=$("revAllList");if(!box)return;
var rows=allRevs(),q=norm(revQ);
if(q)rows=rows.filter(function(r){return norm([r.organ,r.src,r.note,r.match,
r.brands.map(function(b){var x=B(b);return x?x.name:b}).join(" ")].join(" ")).indexOf(q)>=0;});
$("revAllSub").textContent=rows.length+" révision(s) sur "+allRevs().length+" · km + mois";
box.innerHTML=rows.length?rows.map(function(r){return revCard(r,null)}).join(""):ey("i-search","Aucune révision","Aucune entrée ne correspond au filtre.");}
function renderDom(){var p=pool(false),c={};
p.forEach(function(f){(f.dom||[]).forEach(function(d){c[d]=(c[d]||0)+1})});
var s=$("domStrip");s.innerHTML="";
DOM.forEach(function(dd){var b=el("button","dc"+(c[dd[0]]?"":" z"));b.type="button";
b.dataset.on=FIL.dom.indexOf(dd[0])>=0?"1":"0";b.title=dd[1];
b.innerHTML='<svg class="ic"><use href="#'+dd[2]+'"/></svg>'+esc(dd[1])+'<span class="n2">'+(c[dd[0]]||0)+'</span>';
b.onclick=function(){var i=FIL.dom.indexOf(dd[0]);if(i>=0)FIL.dom.splice(i,1);else FIL.dom.push(dd[0]);renderDom();renderAll();};
s.appendChild(b);});
$("domSel").textContent=FIL.dom.length?FIL.dom.map(function(d){return DM[d]?DM[d].n:d}).join(", "):"tous";}
function renderCov(){var p=pool(false),c={},cr={};
p.forEach(function(f){(f.dom||[]).forEach(function(d){c[d]=(c[d]||0)+1;if(f.sev==="critique")cr[d]=(cr[d]||0)+1})});
$("covSub").textContent=p.length+" fiche(s) · "+Object.keys(c).length+"/"+DOM.length+" domaines documentés";
var g=$("covGrid");g.innerHTML="";
DOM.forEach(function(dd){var b=el("button","cvi "+(c[dd[0]]?"hs":"z"));b.type="button";
b.innerHTML='<span class="ci ic-'+dd[3]+'"><svg class="ic"><use href="#'+dd[2]+'"/></svg></span><span class="cn">'+
esc(dd[1])+(cr[dd[0]]?'<div class="mi" style="color:var(--rd)">'+cr[dd[0]]+' critique(s)</div>':'')+
'</span><span class="cq" style="color:var(--'+CV[dd[3]]+')">'+(c[dd[0]]||0)+'</span>';
b.onclick=function(){FIL.dom=[dd[0]];renderDom();renderAll();showView("faults");toast("Domaine « "+dd[1]+" » isolé","in");};
g.appendChild(b);});
var list=applyF(p),box=$("domList");box.innerHTML="";
$("domTitle").textContent=FIL.dom.length?"Fiches des domaines sélectionnés":"Fiches du référentiel";
$("domSub").textContent=list.length+" fiche(s)";
if(!list.length)box.innerHTML=ey("i-search","Aucune fiche","Aucune fiche pour ces filtres.");
else list.slice(0,100).forEach(function(f){box.appendChild(fCard(f,false))});}
function renderCat(){var eng=engines();
$("catStats").innerHTML=[["Marques",CAT.length,"i-db","cy"],
["Modèles",CAT.reduce(function(a,b){return a+b.models.length},0),"i-car","vi"],
["Motorisations",eng.length,"i-piston","amH"],["Fiches + protocoles",FAULTS.length+D.rules.length,"i-warn","rd"]]
.map(function(p){return'<div class="st"><svg class="ic si2" style="color:var(--'+p[3]+')"><use href="#'+p[2]+
'"/></svg><div class="sv3" style="color:var(--'+p[3]+')">'+nf(p[1])+'</div><div class="sl">'+p[0]+'</div></div>';}).join("");
$("bC").textContent=nf(eng.length);
var rows=eng.slice(),q=norm(CUI.q);
if(q)rows=rows.filter(function(e){return norm([e.brandName,alias(e.brandName),e.modelName,famL(e),e.code,
e.tech,FUEL[e.fuel],e.hp,spec(e).disp].join(" ")).indexOf(q)>=0;});
var k=CUI.sort,d=CUI.dir;
rows.sort(function(a,b){var r=0;
if(k==="brand")r=norm(a.brandName).localeCompare(norm(b.brandName))||norm(a.modelName).localeCompare(norm(b.modelName));
else if(k==="model")r=norm(a.modelName).localeCompare(norm(b.modelName));
else if(k==="years")r=a.y0-b.y0;
else if(k==="fam")r=norm(famL(a)).localeCompare(norm(famL(b)));
else if(k==="disp")r=(spec(a).disp||0)-(spec(b).disp||0);
else if(k==="hp"||k==="kw")r=a.hp-b.hp;
else if(k==="code")r=a.code.localeCompare(b.code,"fr");
else if(k==="fuel")r=a.fuel.localeCompare(b.fuel);
return r*d||norm(a.brandName).localeCompare(norm(b.brandName));});
var pages=Math.max(1,Math.ceil(rows.length/CUI.size));CUI.page=clamp(CUI.page,0,pages-1);
var sl=rows.slice(CUI.page*CUI.size,(CUI.page+1)*CUI.size),tb=$("catB");tb.innerHTML="";
sl.forEach(function(e){var s=spec(e),tr=el("tr",CUI.sel.indexOf(e.key)>=0?"sl":"");
tr.innerHTML='<td><span class="ck" role="checkbox" aria-checked="'+(CUI.sel.indexOf(e.key)>=0)+
'" tabindex="0"><svg class="ic"><use href="#i-check"/></svg></span></td><td class="tn">'+esc(e.brandName)+
'</td><td class="tn">'+esc(e.modelName)+(e.my0>=2024?' <span class="tg" style="color:var(--mg);border-color:rgba(244,114,182,.4)">2024+</span>':'')+
'<div class="mi">'+esc(e.seg)+'</div></td><td class="mo">'+e.y0+'–'+e.y1+'</td><td class="tn">'+esc(famL(e))+
'<div class="mi">'+esc(s.ev?s.plat:s.lay)+'</div></td><td class="mo" style="color:var(--amH)">'+
(s.ev?(s.kwh?s.kwh+" kWh":"—"):(s.disp||"—"))+'</td><td class="mo" style="color:var(--rd);font-weight:800">'+e.hp+
'</td><td class="mo">'+kw(e.hp)+'</td><td class="mo">'+esc(e.code)+'</td><td><span class="tg f'+e.fuel+'">'+
FUEL[e.fuel]+'</span></td><td class="mi">'+esc(e.tech||"—")+'</td><td><button class="bt sm" type="button" data-l="1"><svg class="ic"><use href="#i-eye"/></svg></button></td>';
var c=tr.querySelector(".ck");
var tg=function(ev){ev.stopPropagation();var i=CUI.sel.indexOf(e.key);if(i>=0)CUI.sel.splice(i,1);else CUI.sel.push(e.key);renderCat();};
c.onclick=tg;c.onkeydown=function(ev){if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();tg(ev)}};
tr.querySelector("[data-l]").onclick=function(ev){ev.stopPropagation();loadEng(e)};
tr.ondblclick=function(){loadEng(e)};tb.appendChild(tr);});
if(!sl.length)tb.innerHTML='<tr><td colspan="12">'+ey("i-search","Aucun résultat","Aucune motorisation ne correspond au filtre.")+'</td></tr>';
$("catSub").textContent=nf(rows.length)+" motorisation(s) · tri "+k+" "+(d>0?"↑":"↓")+" · sélection "+CUI.sel.length;
$("catPg").textContent="Page "+(CUI.page+1)+" / "+pages;
$("catP").disabled=CUI.page===0;$("catN").disabled=CUI.page>=pages-1;$("bCatLoad").disabled=CUI.sel.length===0;
[].forEach.call(document.querySelectorAll("#catT th.so"),function(th){th.classList.toggle("ac",th.dataset.k===k);
th.querySelector(".aw").textContent=th.dataset.k===k?(d>0?"▲":"▼"):"▲";});
renderViews();}
function loadEng(e){SEL={brand:e.brand,model:e.model,year:String(clamp(Math.max(e.y0,YMIN),YMIN,YMAX)),fam:e.gk,hp:String(e.hp)};
sync();renderDom();renderAll();toast(e.brandName+" "+e.modelName+" · "+famL(e)+" "+e.hp+" ch","ok");
window.scrollTo({top:0,behavior:"smooth"});}
function renderViews(){var box=$("views");if(!box)return;
if(!VIEWS.length){box.innerHTML=ey("i-save","Aucune vue mémorisée","Configurez le banc puis « Mémoriser vue ». Réordonnable par glisser-déposer.");return;}
box.innerHTML="";
VIEWS.forEach(function(v,i){var d=el("div","sv");d.draggable=canW();
d.innerHTML='<span class="gr2"><svg class="ic"><use href="#i-grip"/></svg></span><div style="flex:1;min-width:0">'+
'<div style="font-weight:750;font-size:13px">'+esc(v.name)+'</div><div class="mi">'+esc(v.label)+'</div></div>'+
'<button class="bt sm pr" type="button" data-a="ap">Appliquer</button><button class="bt sm rd" type="button" data-a="de"'+
(canW()?"":" disabled")+'><svg class="ic"><use href="#i-trash"/></svg></button>';
d.querySelector('[data-a="ap"]').onclick=function(){SEL=Object.assign({},v.sel);FIL.q=v.q||"";
$("q").value=FIL.q;FIL.dom=(v.dom||[]).slice();USE=Object.assign({},v.use||USE);
$("kmY").value=USE.km;$("kmYL").textContent=nf(USE.km)+" km/an";$("selSev").value=USE.sev;$("selClim").value=USE.clim;
sync();renderDom();renderAll();toast("Vue « "+v.name+" » appliquée","ok");};
d.querySelector('[data-a="de"]').onclick=function(){if(!canW())return;
var rm=VIEWS.splice(i,1)[0];saveAux();renderViews();
toast("Vue supprimée","wa",function(){VIEWS.splice(i,0,rm);saveAux();renderViews();});};
d.addEventListener("dragstart",function(ev){if(!canW()){ev.preventDefault();return}
d.classList.add("dg");ev.dataTransfer.setData("text/plain",String(i));});
d.addEventListener("dragend",function(){d.classList.remove("dg")});
d.addEventListener("dragover",function(ev){if(canW()){ev.preventDefault();d.classList.add("o2")}});
d.addEventListener("dragleave",function(){d.classList.remove("o2")});
d.addEventListener("drop",function(ev){ev.preventDefault();d.classList.remove("o2");if(!canW())return;
var f=+ev.dataTransfer.getData("text/plain");if(f===i)return;
var it=VIEWS.splice(f,1)[0];VIEWS.splice(i,0,it);saveAux();renderViews();toast("Vues réordonnées","ok");});
box.appendChild(d);});}

function audit(){var iss=[],add=function(s,c,m){iss.push({sev:s,code:c,msg:m})};
var eng=engines(),keys={},dup=0,orph=0,yf=0,hf=0;
CAT.forEach(function(b){if(!b.models.length)add("ba","BRAND","Marque « "+b.name+" » sans modèle");
b.models.forEach(function(m){if(!m.engines.length)add("ba","MODEL",b.name+" "+m.name+" : aucun moteur");
m.engines.forEach(function(e){var s=spec(e);
if(!(e.hp>0))add("ba","HP",b.name+" "+m.name+" : puissance invalide");
if(!e.code||e.code==="—")add("wa","CODE",b.name+" "+m.name+" "+e.fam+" : code manquant");
if(!FUEL[e.fuel])add("ba","FUEL",b.name+" "+m.name+" : énergie inconnue");
if(!s.ev&&!s.disp)add("wa","DISP",b.name+" "+m.name+" "+e.fam+" : cylindrée indéterminée");
if(s.ev&&!s.kwh)add("wa","KWH",b.name+" "+m.name+" "+e.hp+" ch : capacité batterie manquante");
if(e.y0<m.y0||e.y1>m.y1){yf++;add("wa","YEARS",b.name+" "+m.name+" "+e.fam+" : années hors production")}
var k=e.brand+"|"+e.model+"|"+e.gk+"|"+e.hp+"|"+e.code;
if(keys[k]){dup++;add("wa","DUP","Doublon : "+b.name+" "+m.name+" "+e.fam+" "+e.hp+" ch")}keys[k]=1;
var d=parseInt((String(e.fam).match(/(\d{2,4})\s*ch/i)||[])[1]||"0",10);
if(d&&Math.abs(d-e.hp)>2){hf++;add("wa","HPM",b.name+" "+m.name+" : libellé "+d+" ch vs "+e.hp+" ch")}});});});
var bids={};CAT.forEach(function(b){bids[b.id]=1});
var p=FAULTS.concat(rules(null));
p.forEach(function(f){if(!f.titre)add("ba","FT","Fiche "+f.id+" sans titre");
if(!f.src)add("wa","FS","Fiche "+f.id+" sans source");
if(!SEV[f.sev])add("ba","FV","Fiche "+f.id+" : sévérité inconnue");
if(!KIND[f.kind])add("ba","FK","Fiche "+f.id+" : nature inconnue");
if(!(f.dom||[]).length)add("wa","FD","Fiche "+f.id+" sans domaine");
(f.dom||[]).forEach(function(d){if(!DM[d])add("ba","FDU","Fiche "+f.id+" : domaine inconnu")});
if(f.scope!=="rule"){if(!f.brands.some(function(b){return bids[b]}))add("wa","FB","Fiche "+f.id+" : marque inconnue");
var h=0,t=slug(f.target),ids=csv(f.target);
if(f.scope==="engine")h=eng.filter(function(e){return f.brands.indexOf(e.brand)>=0&&e.famKey===t&&ov(f.y0,f.y1,e.y0,e.y1)}).length;
else if(f.scope==="model")h=eng.filter(function(e){return f.brands.indexOf(e.brand)>=0&&ids.indexOf(e.model)>=0&&ov(f.y0,f.y1,e.y0,e.y1)}).length;
else h=eng.filter(function(e){return f.brands.indexOf(e.brand)>=0}).length;
if(!h){orph++;add("wa","FO","Fiche « "+f.titre.slice(0,44)+" » orpheline")}}
(f.dtc||[]).forEach(function(c){if(!DTC[c])add("in","DU","Code "+c+" ("+f.id+") absent du dictionnaire")});});
var cov={};p.forEach(function(f){(f.dom||[]).forEach(function(d){cov[d]=1})});
DOM.forEach(function(dd){if(!cov[dd[0]])add("wa","DG","Domaine « "+dd[1]+" » non couvert")});
var rv=allRevs();
rv.forEach(function(r){if(!r.brands.some(function(b){return bids[b]}))add("wa","RB","Révision "+r.id+" : marque inconnue");
if(r.newKm<=0)add("ba","RK","Révision "+r.id+" : km invalide");
if(!r.src)add("wa","RS","Révision "+r.id+" sans source");});
var n24=CAT.reduce(function(a,b){return a+b.models.filter(function(m){return m.y0>=2024}).length},0);
var checks=[
["Marques → modèles",CAT.every(function(b){return b.models.length>0}),CAT.length+" marques, "+CAT.reduce(function(a,b){return a+b.models.length},0)+" modèles"],
["Modèles → motorisations",CAT.every(function(b){return b.models.every(function(m){return m.engines.length>0})}),eng.length+" motorisations"],
["Millésimes 2024+",n24>=40,n24+" modèles commercialisés dès 2024"],
["Cylindrée / batterie",iss.filter(function(i){return i.code==="DISP"||i.code==="KWH"}).length===0,
eng.filter(function(e){var s=spec(e);return s.ev?s.kwh:s.disp}).length+"/"+eng.length+" documentées"],
["Années moteur ⊂ production",yf===0,yf?yf+" dépassement(s)":"Plages incluses"],
["Puissance ↔ libellé",hf===0,hf?hf+" écart(s)":"Cohérent"],
["Unicité des motorisations",dup===0,dup?dup+" doublon(s)":"Aucun doublon"],
["Fiches → moteur / modèle / marque",orph===0,orph?orph+" orpheline(s)":"Toutes corrélées"],
["Couverture des 29 domaines",Object.keys(cov).length===DOM.length,Object.keys(cov).length+"/"+DOM.length+" domaines"],
["Révisions d'intervalles",iss.filter(function(i){return i.code==="RK"||i.code==="RB"}).length===0,rv.length+" révisions km + mois"],
["Codes DTC documentés",iss.filter(function(i){return i.code==="DU"}).length===0,Object.keys(DTC).length+" définitions"],
["Recherche sans accent",norm("Škoda")==="skoda"&&norm("Citroën")==="citroen","Škoda → skoda"],
["Couverture 2017 → 2027",eng.some(function(e){return e.y0<=2017})&&eng.some(function(e){return e.y1>=2027}),"Plage complète"]];
var bad=iss.filter(function(i){return i.sev==="ba"}).length,warn=iss.filter(function(i){return i.sev==="wa"}).length;
var tot=Math.max(1,eng.length+p.length+rv.length);
AUDIT={issues:iss,checks:checks,score:clamp(Math.round(100-((bad*6+warn*1.1)/tot)*100),0,100),bad:bad,warn:warn,n:tot};
return AUDIT;}
function renderAudit(){var a=AUDIT||audit();
$("gVal").style.strokeDashoffset=String(314-314*a.score/100);
$("gTxt").textContent=a.score+"%";$("nInt").textContent=a.score+"%";
$("chI").className="ch "+(a.bad?"ba":(a.warn?"wa":"ok"));
$("aStats").innerHTML=[["Contrôles réussis",a.checks.filter(function(x){return x[1]}).length+"/"+a.checks.length,"gr"],
["Anomalies bloquantes",a.bad,"rd"],["Avertissements",a.warn,"amH"],["Éléments audités",nf(a.n),"cy"]]
.map(function(p){return'<div class="st"><div class="sv3" style="color:var(--'+p[2]+')">'+p[1]+'</div><div class="sl">'+p[0]+'</div></div>';}).join("");
$("aChecks").innerHTML=a.checks.map(function(c){
return'<div class="dsc"><div class="dsc-b" style="display:flex;align-items:center;gap:11px;padding:11px 13px">'+
'<svg class="ic" style="width:18px;height:18px;color:'+(c[1]?"var(--gr)":"var(--amH)")+'"><use href="#'+(c[1]?"i-check":"i-warn")+
'"/></svg><div style="flex:1;min-width:0"><b style="font-size:13px">'+esc(c[0])+'</b><div class="mi">'+esc(c[2])+
'</div></div><span class="pl" style="color:'+(c[1]?"var(--gr)":"var(--amH)")+'">'+(c[1]?"CONFORME":"À CORRIGER")+'</span></div></div>';}).join("");
$("aIssues").innerHTML=!a.issues.length?'<div class="nt ok"><b>Base intègre.</b> Toutes les corrélations sont vérifiées.</div>':
'<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-list"/></svg>'+a.issues.length+' observation(s)</div>'+
'<div class="dsc-b" style="max-height:320px;overflow-y:auto;padding:0">'+a.issues.slice(0,250).map(function(i){
return'<div style="padding:8px 13px;border-bottom:1px solid var(--ln2);font-size:12.3px;display:flex;gap:9px">'+
'<span class="pl '+(i.sev==="ba"?"sc":(i.sev==="wa"?"se":"si"))+'" style="flex:none">'+i.code+
'</span><span style="color:var(--m1)">'+esc(i.msg)+'</span></div>';}).join("")+'</div></div>';}
function autoRepair(){if(!canW()){toast("Mode administrateur requis","ba");return}
var before=JSON.stringify({cat:CAT,faults:FAULTS,revs:REVC}),n=0;
CAT.forEach(function(b){b.models.forEach(function(m){m.engines.forEach(function(e){
if(e.y0<m.y0||e.y1>m.y1){e.y0=Math.max(e.y0,m.y0);e.y1=Math.min(e.y1,m.y1);n++}
var d=parseInt((String(e.fam).match(/(\d{2,4})\s*ch/i)||[])[1]||"0",10);
if(d&&Math.abs(d-e.hp)>2){e.fam=e.fam.replace(/\s*\d{2,4}\s*ch/i,"").trim();n++}
var s=spec(e);e.gk=e.famKey+(s.ev?"|"+(s.kwh||""):"");e.disp=s.ev?s.kwh:s.disp;});});});
var seen={};
CAT.forEach(function(b){b.models.forEach(function(m){m.engines=m.engines.filter(function(e){
var k=e.brand+"|"+e.model+"|"+e.gk+"|"+e.hp+"|"+e.code;if(seen[k]){n++;return false}seen[k]=1;return true;});});});
FAULTS.forEach(function(f){if(!(f.dom||[]).length){f.dom=["moteur"];n++}});
saveDB();audit();renderAudit();sync();renderDom();renderAll();
toast(n?n+" correction(s) appliquée(s)":"Aucune correction nécessaire",n?"ok":"in",n?function(){
var d=JSON.parse(before);CAT=d.cat;FAULTS=d.faults;REVC=d.revs;saveDB();audit();renderAudit();sync();renderDom();renderAll();}:null);}

function openDw(){$("scrim").classList.add("on");$("drawer").classList.add("on");$("drawer").setAttribute("aria-hidden","false");$("dwX").focus();}
function closeDw(){$("drawer").classList.remove("on");$("drawer").setAttribute("aria-hidden","true");
if(!$("notifDw").classList.contains("on"))$("scrim").classList.remove("on");}
function openF(f){var eng=engines().filter(function(e){return hits(f,e)}),note=NOTES[f.id]||{};
$("dwT").textContent=f.titre;
$("dwS").innerHTML='<span class="pl '+KCL[f.kind]+'">'+KIND[f.kind]+'</span> <span class="pl '+SCL[f.sev]+'">'+
SEV[f.sev].n+'</span> <span class="pl">'+f.y0+'–'+f.y1+'</span>';
$("dwI").className="si "+(f.sev==="critique"?"ic-rd":(f.sev==="eleve"?"ic-am":"ic-vi"));
var g={};eng.forEach(function(e){var k=e.brandName+" "+e.modelName;(g[k]=g[k]||[]).push(famL(e)+" "+e.hp+" ch ("+e.code+")")});
$("dwB").innerHTML=
'<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-grid"/></svg>Domaines de défaillance</div><div class="dsc-b"><div class="fm" style="margin:0">'+(domPills(f)||"—")+'</div></div></div>'+
'<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-warn"/></svg>Symptômes constatés</div><div class="dsc-b">'+esc(f.sym||"—")+'</div></div>'+
'<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-brain"/></svg>Protocole de diagnostic</div><div class="dsc-b"><ol class="pt">'+
f.pro.map(function(p){return"<li>"+esc(p)+"</li>"}).join("")+'</ol></div></div>'+
'<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-wrench"/></svg>Organes / pièces</div><div class="dsc-b">'+esc(f.org||"—")+'</div></div>'+
(f.dtc.length?'<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-bolt"/></svg>Codes DTC &amp; définitions</div><div class="dsc-b">'+
f.dtc.map(function(c){var d=DTC[c];return'<div style="margin-bottom:10px"><span class="dtc">'+esc(c)+'</span> <b>'+
(d?esc(d[0]):"Code corrélé")+'</b>'+(d?'<div class="mi" style="margin-top:4px">Causes : '+esc(d[1])+
'<br>Contrôle : '+esc(d[2])+'</div>':'')+'</div>';}).join("")+'</div></div>':'')+
'<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-car"/></svg>Véhicules corrélés ('+eng.length+')</div><div class="dsc-b" style="max-height:210px;overflow-y:auto">'+
(f.scope==="rule"?'<span class="mi">Protocole transversal — actif selon l\'énergie et la technologie réelles du moteur sélectionné.</span>':
(Object.keys(g).length?Object.keys(g).map(function(k){return'<div style="margin-bottom:9px"><b style="font-size:12.5px">'+
esc(k)+'</b><div class="mi">'+esc(g[k].join(" · "))+'</div></div>';}).join(""):
'<span class="mi">Portée marque — s\'applique à toute la gamme.</span>'))+'</div></div>'+
'<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-link"/></svg>Source &amp; vérification</div><div class="dsc-b"><b>'+esc(f.src)+'</b>'+
'<div class="mi" style="margin-top:6px">Portée : '+esc(f.scope==="engine"?"famille moteur « "+f.target+" »":
f.scope==="model"?"modèle(s) "+f.target:f.scope==="rule"?"conditionnelle (énergie / technologie)":"marque(s) "+f.brands.join(", "))+'</div>'+
'<div class="nt wa" style="margin-top:10px;font-size:12px">Confirmez l\'éligibilité au <b>VIN</b> sur la source officielle avant intervention.</div></div></div>'+
'<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-edit"/></svg>Note d\'atelier '+(canW()?"":"— lecture seule")+
'</div><div class="dsc-b"><textarea class="ct" id="dwNote" rows="3"'+(canW()?"":" disabled")+
' placeholder="Observations, mesures, référence pièces…">'+esc(note.txt||"")+'</textarea></div></div>';
$("dwF").innerHTML="";
var mk=function(c,i,t,fn,dis){var b=el("button","bt "+c,'<svg class="ic"><use href="#'+i+'"/></svg>'+t);
b.type="button";b.onclick=fn;if(dis)b.disabled=true;$("dwF").appendChild(b);};
mk(note.done?"":"gr","i-check",note.done?"Marquer non traitée":"Marquer traitée",function(){
NOTES[f.id]=Object.assign({},NOTES[f.id],{done:!note.done});saveAux();renderAll();openF(f);
toast(note.done?"Fiche rouverte":"Fiche marquée traitée","ok");},!canW());
mk("","i-save","Enregistrer la note",function(){
NOTES[f.id]=Object.assign({},NOTES[f.id],{txt:$("dwNote").value});saveAux();renderAll();toast("Note enregistrée","ok");},!canW());
mk("","i-copy","Copier",function(){
var t=f.titre+"\n"+KIND[f.kind]+" · "+SEV[f.sev].n+" · "+f.y0+"-"+f.y1+"\nDomaines : "+
(f.dom||[]).map(function(d){return DM[d]?DM[d].n:d}).join(", ")+"\nSource : "+f.src+"\nSymptômes : "+f.sym+
"\nProtocole :\n"+f.pro.map(function(p,i){return(i+1)+") "+p}).join("\n")+"\nOrganes : "+f.org+"\nDTC : "+f.dtc.join(", ");
if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){toast("Fiche copiée","ok")},function(){toast("Copie indisponible","wa")});
else toast("Copie indisponible","wa");});
if(canW()&&f.scope!=="rule")mk("rd","i-trash","Supprimer",function(){
var i=-1;FAULTS.forEach(function(x,j){if(x.id===f.id)i=j});if(i<0)return;
var rm=FAULTS.splice(i,1)[0];saveDB();closeDw();audit();renderDom();renderAll();
toast("Fiche supprimée","wa",function(){FAULTS.splice(i,0,rm);saveDB();audit();renderDom();renderAll();});});
openDw();}
function pending(){return TIERS.filter(function(t){return t.status==="pending"})}
function renderBell(){var n=pending().length,un=NOTIF.filter(function(x){return!x.read}).length,tot=n+un,b=$("bellN");
if(tot>0){b.style.display="grid";b.textContent=tot>99?"99+":tot;$("bellB").classList.add("rg")}
else{b.style.display="none";$("bellB").classList.remove("rg")}
$("bA").textContent=n;$("nfS").textContent=n+" demande(s) en attente · "+un+" non lue(s)";}
function renderNf(){var box=$("nfList"),items=[];
pending().forEach(function(t){items.push({type:"access",txt:"Demande d'accès de "+t.name,
meta:dtT(t.ts)+" · appareil "+t.device,ts:t.ts,read:false,go:true})});
NOTIF.forEach(function(n){items.push(n)});
items.sort(function(a,b){return b.ts-a.ts});
if(!items.length){box.innerHTML=ey("i-bell","Aucune notification","Les demandes d'accès des tiers et les événements système apparaîtront ici.");return;}
box.innerHTML="";
items.slice(0,60).forEach(function(n){
var ic=n.type==="access"?["ic-am","i-user"]:n.type==="grant"?["ic-gr","i-unlock"]:n.type==="deny"?["ic-rd","i-ban"]:
n.type==="revoke"?["ic-mg","i-ban"]:n.type==="import"?["ic-vi","i-cloud"]:["ic-cy","i-info"];
var d=el("div","ni"+(n.read?"":" un"));
d.innerHTML='<span class="nic '+ic[0]+'"><svg class="ic"><use href="#'+ic[1]+'"/></svg></span>'+
'<div class="nib"><div class="nit">'+esc(n.txt)+'</div><div class="nid">'+esc(n.meta||dtT(n.ts))+'</div></div>'+
(n.go?'<button class="bt sm te" type="button" style="flex:none">Ouvrir</button>':'');
var g=d.querySelector("button");
if(g)g.onclick=function(){closeNf();if(canW()){showView("adm");setTimeout(function(){$("tiersList").scrollIntoView({behavior:"smooth",block:"center"})},200)}else toast("Réservé à l'administrateur","ba");};
box.appendChild(d);});}
function openNf(){renderNf();$("scrim").classList.add("on");$("notifDw").classList.add("on");
$("notifDw").setAttribute("aria-hidden","false");$("nfX").focus();}
function closeNf(){$("notifDw").classList.remove("on");$("notifDw").setAttribute("aria-hidden","true");
if(!$("drawer").classList.contains("on"))$("scrim").classList.remove("on");}

function initDevice(){var d=null;try{d=localStorage.getItem(LS.dev)}catch(e){}
if(!d){d="D-"+Math.random().toString(36).slice(2,7).toUpperCase();try{localStorage.setItem(LS.dev,d)}catch(e){}}DEVICE=d;}
var myReq=function(){return TIERS.filter(function(t){return t.device===DEVICE})[0]};
var STN={pending:"En attente",granted:"Autorisé",denied:"Refusé",revoked:"Révoqué"};
function requestAccess(name){var n=String(name||"").trim().replace(/\s+/g," ");
if(!/^[A-Za-zÀ-ÿ' -]{2,24}$/.test(n)){$("tiersErr").style.display="block";return}
$("tiersErr").style.display="none";
var r=myReq();
if(!r){r={id:"T"+Date.now().toString(36).toUpperCase(),name:n,device:DEVICE,ts:Date.now(),status:"pending",history:[]};TIERS.unshift(r);}
else{r.name=n;r.status="pending";r.ts=Date.now();r.decidedAt=null;}
r.history.push({ts:Date.now(),a:"demande",by:n});
saveAcc();notify("access","Demande d'accès de "+n,"appareil "+DEVICE);
waitMode=true;renderLaunch();renderBell();toast("Demande envoyée à l'administrateur","te");}
function cancelRequest(){var r=myReq();if(!r)return;
TIERS=TIERS.filter(function(t){return t.id!==r.id});saveAcc();
notify("access","Demande annulée ("+r.name+")","");waitMode=false;renderLaunch();renderBell();toast("Demande annulée","in");}
function setTier(id,status){if(!canW()){toast("Réservé à l'administrateur","ba");return}
var t=TIERS.filter(function(x){return x.id===id})[0];if(!t)return;
var prev=t.status;t.status=status;t.decidedAt=Date.now();t.history.push({ts:Date.now(),a:status,by:"admin"});
saveAcc();
var lbl={granted:"Accès accordé à",denied:"Accès refusé à",revoked:"Accès révoqué à",pending:"Accès remis en attente pour"}[status];
notify(status==="granted"?"grant":status==="denied"?"deny":status==="revoked"?"revoke":"access",lbl+" "+t.name,STN[status]);
renderTiers();renderBell();
toast(lbl+" "+t.name+" — "+STN[status],status==="granted"?"ok":(status==="pending"?"in":"wa"),function(){
t.status=prev;saveAcc();renderTiers();renderBell();});}
function removeTier(id){if(!canW())return;var i=-1;TIERS.forEach(function(x,j){if(x.id===id)i=j});if(i<0)return;
var rm=TIERS.splice(i,1)[0];saveAcc();renderTiers();renderBell();
toast("Tiers supprimé","wa",function(){TIERS.splice(i,0,rm);saveAcc();renderTiers();renderBell();});}
function renderTiers(){if(!canW())return;
var q=norm($("tiersQ").value),fil=$("tiersFil").value;
var rows=TIERS.slice().sort(function(a,b){return b.ts-a.ts});
if(fil)rows=rows.filter(function(t){return t.status===fil});
if(q)rows=rows.filter(function(t){return norm(t.name+" "+t.device).indexOf(q)>=0});
var c={pending:0,granted:0,denied:0,revoked:0};
TIERS.forEach(function(t){c[t.status]=(c[t.status]||0)+1});
$("tiersStats").innerHTML=[["En attente",c.pending,"amH"],["Autorisés",c.granted,"gr"],["Refusés",c.denied,"rd"],["Révoqués",c.revoked,"mg"]]
.map(function(p){return'<div class="st"><div class="sv3" style="color:var(--'+p[2]+')">'+p[1]+'</div><div class="sl">'+p[0]+'</div></div>';}).join("");
$("tiersSub").textContent=TIERS.length+" tiers · "+c.pending+" en attente · actions accès / refus / révocation permanentes";
var box=$("tiersList");box.innerHTML="";
if(!rows.length){box.innerHTML=ey("i-users","Aucun tiers","Les demandes d'accès apparaissent ici en temps réel, avec le prénom du demandeur.");return;}
rows.forEach(function(t){var d=el("div","tc s-"+t.status);
d.innerHTML='<div class="th"><span class="av">'+esc((t.name||"?").slice(0,2).toUpperCase())+'</span>'+
'<div style="flex:1;min-width:0"><h3 style="font-size:15px">'+esc(t.name)+'</h3><div class="mi">Appareil '+esc(t.device)+
' · demande '+dtT(t.ts)+(t.decidedAt?" · décision "+dtT(t.decidedAt):"")+'</div></div>'+
'<span class="pl '+(t.status==="granted"?"si":t.status==="pending"?"se":t.status==="denied"?"sc":"sm")+
'" style="height:24px;font-size:10.5px">'+STN[t.status]+'</span></div><div class="tac">'+
'<button class="bt sm gr" type="button" data-a="granted"'+(t.status==="granted"?" disabled":"")+'><svg class="ic"><use href="#i-check"/></svg>Accès</button>'+
'<button class="bt sm rd" type="button" data-a="denied"'+(t.status==="denied"?" disabled":"")+'><svg class="ic"><use href="#i-ban"/></svg>Refus</button>'+
'<button class="bt sm am" type="button" data-a="revoked"'+(t.status==="revoked"?" disabled":"")+'><svg class="ic"><use href="#i-lock"/></svg>Révocation</button>'+
'<button class="bt sm" type="button" data-a="pending"'+(t.status==="pending"?" disabled":"")+'><svg class="ic"><use href="#i-hour"/></svg>En attente</button>'+
'<span class="sp"></span><button class="bt sm rd" type="button" data-a="del"><svg class="ic"><use href="#i-trash"/></svg></button></div>'+
(t.history.length?'<div class="thi">'+t.history.slice(-4).map(function(h){
return"<div>"+dtT(h.ts)+" — "+esc(h.a)+(h.by?" par "+esc(h.by):"")+"</div>";}).join("")+'</div>':'');
[].forEach.call(d.querySelectorAll("[data-a]"),function(b){
b.onclick=function(){var a=b.dataset.a;if(a==="del")removeTier(t.id);else setTier(t.id,a);};});
box.appendChild(d);});}
function renderWait(){var r=myReq(),W=$("lWait"),C=$("lChoose");
if(!waitMode||!r){W.style.display="none";C.style.display="";return}
W.style.display="";C.style.display="none";
$("wRing").className="wrg s-"+r.status;
$("wIcon").innerHTML='<use href="#'+(r.status==="granted"?"i-unlock":r.status==="pending"?"i-hour":r.status==="denied"?"i-ban":"i-lock")+'"/>';
$("wTitle").textContent={pending:"Demande en attente de validation",granted:"Accès autorisé",denied:"Demande refusée",revoked:"Accès révoqué"}[r.status];
$("wMsg").textContent={pending:"L'administrateur a reçu votre demande. La réponse arrive en temps réel sur cet appareil.",
granted:"Votre accès tiers est actif : consultation complète en lecture seule.",
denied:"L'administrateur a refusé cette demande. Vous pouvez renouveler ou contacter l'administrateur.",
revoked:"L'administrateur a révoqué votre accès. La session tiers est fermée."}[r.status];
$("wName").querySelector("b").textContent=r.name;
$("wId").querySelector("b").textContent=r.id;
$("wNote").innerHTML="<b>Statut :</b> "+STN[r.status]+" · <b>Appareil :</b> "+esc(r.device)+" · <b>Demande :</b> "+dtT(r.ts)+
(r.decidedAt?" · <b>Décision :</b> "+dtT(r.decidedAt):"")+".<br>Le tiers ne peut ni modifier le projet, ni importer, ni mettre à jour l'APK.";
var act=$("wAct");act.innerHTML="";
if(r.status==="granted"){var b=el("button","bt te",'<svg class="ic"><use href="#i-unlock"/></svg>Entrer en mode tiers');
b.type="button";b.onclick=function(){K.unlock("tiers")};act.appendChild(b);}
if(r.status==="pending"){var c=el("button","bt",'<svg class="ic"><use href="#i-x"/></svg>Annuler ma demande');
c.type="button";c.onclick=cancelRequest;act.appendChild(c);}
if(r.status==="denied"||r.status==="revoked"){var d=el("button","bt te",'<svg class="ic"><use href="#i-send"/></svg>Nouvelle demande');
d.type="button";d.onclick=function(){TIERS=TIERS.filter(function(t){return t.id!==r.id});saveAcc();waitMode=false;renderLaunch();};act.appendChild(d);}}
function renderLaunch(){var eng=engines();
$("lStats").innerHTML=[["Motorisations",nf(eng.length)],["Marques",CAT.length],
["Modèles",CAT.reduce(function(a,b){return a+b.models.length},0)],["Fiches",nf(FAULTS.length+D.rules.length)],
["Domaines",DOM.length],["Révisions",allRevs().length]]
.map(function(p){return'<span class="ch in"><b>'+p[1]+'</b> '+p[0]+'</span>';}).join("");
if(waitMode&&myReq()){$("lChoose").style.display="none";$("lWait").style.display="";renderWait();}
else{$("lChoose").style.display="";$("lWait").style.display="none";}}

function applyRole(){var chip=$("chR");
if(ROLE==="admin"){chip.className="ch ok";$("nRole").textContent="ADMIN";$("exitB").querySelector("span").textContent="Verrouiller";}
else if(ROLE==="tiers"){var r=myReq();chip.className="ch te";$("nRole").textContent="TIERS · "+(r?r.name:"");
$("exitB").querySelector("span").textContent="Quitter";}
else{chip.className="ch";$("nRole").textContent="—";$("exitB").querySelector("span").textContent="Quitter";}
$("tbAdm").classList.toggle("hd2",ROLE!=="admin");
$("roB").style.display=ROLE==="tiers"?"flex":"none";
var w=!canW();
["bSave","bUpd","bExp","bBk","bWipe","bClearN","bRepair","bRevAllT"].forEach(function(id){var b=$(id);if(b)b.disabled=w;});
[].forEach.call(document.querySelectorAll("#addEng button[type=submit],#addF button[type=submit],#addRev button[type=submit]"),function(b){b.disabled=w});
if(ROLE==="tiers"&&$("v-adm").classList.contains("on"))showView("diag");}
function afterEnter(){applyRole();
if(ROLE==="admin"){var t=Date.now()+30*60*1000;$("admExp").textContent=new Date(t).toLocaleTimeString("fr-FR");
clearTimeout(admTimer);admTimer=setTimeout(function(){K.lock();toast("Session administrateur expirée","wa");},30*60*1000);}
else clearTimeout(admTimer);
safe(function(){sync();renderDom();renderAll();renderBell();},"rendu-après-ouverture");
toast(ROLE==="admin"?"Session administrateur ouverte (30 min)":"Mode tiers actif — lecture seule",ROLE==="admin"?"ok":"te");}
window.addEventListener("kf:unlock",function(e){ROLE=e.detail.role;waitMode=false;afterEnter();});
window.addEventListener("kf:lock",function(){ROLE=null;clearTimeout(admTimer);
var r=myReq();waitMode=!!(r&&r.status!=="granted");applyRole();safe(renderLaunch,"écran accueil");});
window.addEventListener("kf:tiers",function(e){safe(function(){requestAccess(e.detail.name)},"demande-tiers");});
function live(){loadAcc();loadNf();renderBell();
if(ROLE==="tiers"){var r=myReq();
if(!r||r.status!=="granted"){K.lock();
toast(r&&r.status==="revoked"?"Accès tiers révoqué par l'administrateur":r&&r.status==="denied"?"Accès tiers refusé":"Session tiers fermée","wa");return;}}
if(!ROLE&&waitMode)safe(renderWait,"attente");
if(ROLE==="admin"){var sig=TIERS.map(function(t){return t.id+t.status}).join(",");
if(sig!==lastSig){TIERS.filter(function(t){return t.status==="pending"&&!seenPend[t.id]}).forEach(function(t){
seenPend[t.id]=1;toast("Nouvelle demande d'accès : "+t.name,"wa");});
lastSig=sig;safe(renderTiers,"tiers");renderBell();}}}

function renderAdm(){if(!canW())return;
$("admStats").innerHTML=[["Motorisations",nf(engines().length),"cy"],["Fiches",nf(FAULTS.length),"amH"],
["Protocoles",D.rules.length,"vi"],["Révisions",allRevs().length,"mg"]]
.map(function(p){return'<div class="st"><div class="sv3" style="color:var(--'+p[2]+')">'+p[1]+'</div><div class="sl">'+p[0]+'</div></div>';}).join("");
renderTiers();
var n24=CAT.reduce(function(a,b){return a+b.models.filter(function(m){return m.y0>=2024}).length},0);
$("updStats").innerHTML=[["Marques",CAT.length,"cy"],["Modèles 2024+",n24,"mg"],
["Intégrations",UPD.length,"gr"],["Dernière",UPD.length?dtT(UPD[0].ts):"—","vi"]]
.map(function(p){return'<div class="st"><div class="sv3" style="font-size:19px;color:var(--'+p[2]+')">'+esc(String(p[1]))+'</div><div class="sl">'+p[0]+'</div></div>';}).join("");
$("updLog").innerHTML=UPD.length?UPD.slice(0,5).map(function(u){
return'<div class="sv"><span class="gr2"><svg class="ic"><use href="#i-clock"/></svg></span><div style="flex:1;min-width:0">'+
'<div style="font-weight:750;font-size:13px">'+esc(u.src)+'</div><div class="mi">'+dtT(u.ts)+" · +"+u.m+" motorisations · +"+u.f+" fiches · +"+u.r+' révisions</div></div><span class="pl si">intégré</span></div>';}).join(""):
'<div class="nt">Aucune intégration externe. La base livrée est complète et hors ligne.</div>';
var box=$("bkList");
if(!BK.length)box.innerHTML='<div class="nt">Aucune sauvegarde locale. Une sauvegarde est créée automatiquement après chaque import ou mise à jour.</div>';
else box.innerHTML=BK.map(function(b,i){
return'<div class="sv"><span class="gr2"><svg class="ic"><use href="#i-save"/></svg></span><div style="flex:1;min-width:0">'+
'<div style="font-weight:750;font-size:13px">'+new Date(b.t).toLocaleString("fr-FR")+'</div><div class="mi">'+esc(b.src)+
" · "+b.veh+" motorisations · "+b.f+" fiches · "+Math.round((b.size||0)/1024)+' Ko</div></div>'+
'<button class="bt sm gr" type="button" data-r="'+i+'">Restaurer</button><button class="bt sm rd" type="button" data-d="'+i+'"><svg class="ic"><use href="#i-trash"/></svg></button></div>';}).join("");
[].forEach.call(box.querySelectorAll("[data-r]"),function(b){b.onclick=function(){restoreBk(+b.dataset.r)};});
[].forEach.call(box.querySelectorAll("[data-d]"),function(b){b.onclick=function(){
var i=+b.dataset.d,rm=BK.splice(i,1)[0];saveAux();renderAdm();
toast("Sauvegarde supprimée","wa",function(){BK.splice(i,0,rm);saveAux();renderAdm();});};});}
function makeBk(src){var p=JSON.stringify({cat:CAT,faults:FAULTS,revs:REVC});
BK.unshift({t:Date.now(),src:src,veh:engines().length,f:FAULTS.length,size:p.length,data:p});
while(BK.length>3)BK.pop();saveAux();if(canW())renderAdm();}
function restoreBk(i){var b=BK[i];if(!b)return;
if(!confirm("Restaurer la sauvegarde du "+new Date(b.t).toLocaleString("fr-FR")+" ?"))return;
var before=JSON.stringify({cat:CAT,faults:FAULTS,revs:REVC});
try{var d=JSON.parse(b.data);CAT=d.cat;FAULTS=d.faults;REVC=d.revs||[];saveDB();
newSearch();audit();renderAudit();renderAdm();
toast("Sauvegarde restaurée","ok",function(){var p=JSON.parse(before);CAT=p.cat;FAULTS=p.faults;REVC=p.revs;
saveDB();sync();audit();renderDom();renderAll();renderAdm();});}catch(e){toast("Sauvegarde illisible","ba");}}
function ovlOn(on){$("ovl").classList.toggle("on",on);
if(on){$("ovLog").innerHTML="";$("ovRes").innerHTML="";$("ovX").style.display="none";$("ovBar").style.width="0%";$("ovPct").textContent="0 %";}}
function olog(m,c){var l=$("ovLog"),d=el("div","l"+(c||"i"),"["+new Date().toLocaleTimeString("fr-FR")+"] "+esc(m));
l.appendChild(d);l.scrollTop=l.scrollHeight;}
function ostep(p,d){$("ovBar").style.width=clamp(p,0,100)+"%";$("ovPct").textContent=Math.round(clamp(p,0,100))+" %";
$("ovDet").textContent=d;$("ovStep").textContent="Étape "+clamp(Math.ceil(p/17),1,6)+"/6";}
function nBrand(n){var s=String(n||"").trim(),m={"citroën":"Citroën","citroen":"Citroën","škoda":"Škoda","skoda":"Škoda",
"vw":"Volkswagen","mercedes":"Mercedes-Benz","mercedes-benz":"Mercedes-Benz","ds":"DS Automobiles","mini":"MINI"};
return m[norm(s)]||m[s.toLowerCase()]||s;}
function pYears(v){var s=String(v||""),m=s.match(/(20\d{2})\s*[-–/]\s*(20\d{2})/);
if(m)return[+m[1],+m[2]];var o=s.match(/(20\d{2})/);return o?[+o[1],+o[1]]:[2017,2027];}
function fGuess(f){var t=norm(f);
if(/electrique|ev\b|e tron/.test(t))return"EV";
if(/phev|e hybrid|e tense|recharge|dm i|4xe/.test(t))return"P";
if(/hybrid|hybride|mhev|e tech|e hev|e power|shvs|dualjet/.test(t))return"H";
if(/diesel|tdi|hdi|dci|crdi|multijet|jtd|ecoblue|cdi|d 4d|skyactiv d|di d/.test(t))return"D";
if(/eco g|lpg|gpl/.test(t))return"G";return"E";}
function fom(bn,mn,y0,y1){var bid=slug(bn),b=B(bid);
if(!b){b={id:bid,name:bn,country:"—",models:[]};CAT.push(b);}
var m=null;b.models.forEach(function(x){if(slug(x.name)===slug(mn))m=x;});
if(!m){m={id:bid+"-"+slug(mn),name:mn,y0:y0||2017,y1:y1||2027,seg:"Importé",brand:bid,brandName:b.name,engines:[]};b.models.push(m);}
m.y0=Math.min(m.y0,y0||m.y0);m.y1=Math.max(m.y1,y1||m.y1);return{b:b,m:m};}
function addEngTo(m,b,fam,hp,code,fuel,y0,y1,tech,dispO){
var tmp={fam:fam,famKey:slug(fam),hp:hp,code:code||"—",fuel:FUEL[fuel]?fuel:"E",tech:tech||""};
var gk=tmp.famKey+(fuel==="EV"?"|"+(dispO||spec(tmp).kwh||""):"");
var ex=null;m.engines.forEach(function(e){if(e.gk===gk&&e.hp===hp)ex=e;});
if(ex){var ch=false;
if(code&&ex.code!==code){ex.code=code;ch=true}
if(tech&&ex.tech.indexOf(tech)<0){ex.tech=(ex.tech?ex.tech+" · ":"")+tech;ch=true}
if(y0&&y0<ex.y0){ex.y0=y0;ch=true}
if(y1&&y1>ex.y1){ex.y1=y1;ch=true}
return ch?"merge":"none";}
var e={key:b.id+"/"+m.id+"/"+slug(fam)+"/"+hp+"/"+m.engines.length,fam:fam,famKey:slug(fam),hp:hp,
code:code||"—",fuel:FUEL[fuel]?fuel:"E",y0:y0||m.y0,y1:y1||m.y1,tech:tech||"",brand:b.id,brandName:b.name,
model:m.id,modelName:m.name,seg:m.seg,my0:m.y0,my1:m.y1};
if(dispO&&e.fuel==="EV"&&!/kWh/i.test(e.tech))e.tech=(e.tech?e.tech+" · ":"")+dispO+" kWh";
var s=spec(e);e.gk=e.famKey+(s.ev?"|"+(s.kwh||""):"");e.disp=s.ev?s.kwh:s.disp;
m.engines.push(e);return"add";}
function domGuess(txt){var t=norm(txt),out=[];
var map={moteur:/moteur|huile|segment|culasse/,distribution:/courroie|chaine|distribution|tendeur/,
injection:/inject|pompe hp|rail|carburant/,allumage:/bougie|allumage|prechauff|bobine/,
suralim:/turbo|suralim|wastegate/,depol:/egr|fap|adblue|scr|nox|gpf/,
transmission:/boite|embrayage|dsg|dct|cvt|eat|pdk/,acoups:/a coup|acoup|vibrat|broutage/,
freinage:/frein|disque|plaquette|servofrein/,abs:/abs|esp|capteur roue/,airbag:/airbag|takata|pretension/,
ceinture:/ceinture|ancrage/,siege:/siege|occupancy/,train:/suspension|rotule|amortisseur|roulement|ressort/,
geometrie:/geometrie|parallelisme|direction|cremaillere|pneu/,portes:/porte|serrure|hayon|ouvrant|poignee/,
cle:/cle|carte|antidemarrage|keyless/,elec12:/12v|12 v|batterie 12|alternateur/,elec48:/48v|48 v|isg|mhev/,
hv:/haute tension|batterie hv|isolement|cellule|pack/,charge:/charge|obc|iccu|borne|type 2/,
autonomie:/autonomie|consommation|soh/,thermique:/refroid|ldr|thermostat|pompe a eau|surchauffe|clim/,
adas:/adas|radar|calibration|acc|autopilot/,camera:/camera|recul|buee/,
telematique:/telemat|ota|esim|connectiv/,tablette:/ecran|tablette|tactile|multimedia|mbux|idrive|sync/,
eclairage:/phare|led|eclairage|feu/,carrosserie:/corrosion|infiltration|etancheite/};
DOM.forEach(function(d){if(t.indexOf(norm(d[1]).split(" ")[0])>=0||(map[d[0]]&&map[d[0]].test(t)))out.push(d[0]);});
return out.length?out:["moteur"];}
function ingest(data){var add=0,merge=0,fa=0,rv=0;
var pv=function(v){var bn=v.marque||v.brand||v.brandName,mn=v.modele||v.model||v.modelName;
if(!bn||!mn)return;
var my=pYears(v.annee||v.years||v.year),o=fom(nBrand(bn),mn,my[0],my[1]);
var ey=v.engYears?pYears(v.engYears):my;
var hp=parseInt((String(v.puissance||v.hp||v.power||"").match(/\d+/)||[])[0]||"0",10);
var fam=v.motorisation||v.fam||v.motor||v.engine||"Motorisation";
var r=addEngTo(o.m,o.b,fam,hp,v.codeMoteur||v.code||"—",v.typeCarburant||v.fuel||fGuess(fam),
ey[0],ey[1],v.tech||v.notes||"",v.disp||v.battery);
if(r==="add")add++;else if(r==="merge")merge++;
if(Array.isArray(v.dtc)&&v.dtc.length){var id="IMP-"+slug(bn+"-"+mn+"-"+fam+"-"+hp);
if(!FAULTS.some(function(f){return f.id===id})){
FAULTS.push({id:id,scope:"engine",brands:[o.b.id],target:fam,kind:"panne",sev:"moyen",y0:ey[0],y1:ey[1],
titre:"Codes défaut répertoriés — "+fam+" "+hp+" ch",sym:"Codes issus de l'import : "+v.dtc.join(", "),
pro:["Lire les codes et le contexte gelé","Contrôler les organes liés aux codes","Appliquer le protocole constructeur"],
org:v.org||"Voir codes",dtc:v.dtc,src:v.src||"Import base",dom:domGuess(fam+" "+v.dtc.join(" "))});fa++;}}};
var pf=function(f){if(!f||!(f.titre||f.title))return;
var id=f.id||"IMP-F-"+slug(f.titre||f.title).slice(0,40)+"-"+Math.random().toString(36).slice(2,6);
if(FAULTS.some(function(x){return x.id===id}))return;
var dom=(Array.isArray(f.dom)?f.dom:csv(f.dom)).filter(function(d){return DM[d]});
FAULTS.push({id:id,scope:["engine","model","brand"].indexOf(f.scope)>=0?f.scope:"brand",
brands:(f.brands||[slug(f.marque||f.brand||"")]).filter(Boolean),target:f.target||f.fam||f.modele||"",
kind:KIND[f.kind]?f.kind:"panne",sev:SEV[f.sev]?f.sev:"moyen",y0:f.y0||2017,y1:f.y1||2027,
titre:f.titre||f.title,sym:f.sym||f.symptome||"",
pro:Array.isArray(f.pro)?f.pro:String(f.pro||f.protocole||"Contrôle constructeur").split("|"),
org:f.org||f.organes||"",dtc:Array.isArray(f.dtc)?f.dtc:csv(f.dtc),src:f.src||f.source||"Import",
dom:dom.length?dom:domGuess((f.titre||"")+" "+(f.sym||""))});fa++;};
var pr=function(r){if(!r||!r.organ||!r.newKm)return;
var id=r.id||"IMP-R-"+slug((r.brands||[]).join("-")+"-"+r.organ).slice(0,50);
if(allRevs().some(function(x){return x.id===id}))return;
REVC.push({id:id,brands:(r.brands||[]).map(slug).filter(Boolean),match:r.match||"",organ:r.organ,
oldKm:+r.oldKm||0,newKm:+r.newKm||0,oldMo:+r.oldMo||0,newMo:+r.newMo||0,src:r.src||"Import",
note:r.note||"",y0:r.y0||2017,y1:r.y1||2027});rv++;};
if(Array.isArray(data))data.forEach(function(x){
if(x&&x.organ&&x.newKm)pr(x);else if(x&&(x.titre||x.title)&&!x.marque&&!x.modele)pf(x);else pv(x);});
else if(data&&typeof data==="object"){
if(Array.isArray(data.vehicles))data.vehicles.forEach(pv);
if(Array.isArray(data.experts))data.experts.forEach(pf);
if(Array.isArray(data.faults))data.faults.forEach(pf);
if(Array.isArray(data.revisions))data.revisions.forEach(pr);
if(Array.isArray(data.revsCustom))data.revsCustom.forEach(pr);
if(Array.isArray(data.tiers)&&canW())data.tiers.forEach(function(t){
if(t&&t.name&&!TIERS.some(function(x){return x.device===t.device}))TIERS.push(t);});
if(Array.isArray(data.cat)&&data.cat.length&&data.cat[0].models)data.cat.forEach(function(b){
b.models.forEach(function(m){m.engines.forEach(function(e){
var o=fom(b.name,m.name,m.y0,m.y1);
var r=addEngTo(o.m,o.b,e.fam,e.hp,e.code,e.fuel,e.y0,e.y1,e.tech);
if(r==="add")add++;else if(r==="merge")merge++;});});});
["customs","modelsExtra","recalls","tsb"].forEach(function(k){
var arr=data[k];if(!Array.isArray(arr))return;
arr.forEach(function(x){
if(k==="recalls"||k==="tsb"){if(x&&(x.marque||x.brand)&&(x.titre||x.title)){
var bn=nBrand(x.marque||x.brand),mn=x.modele||x.model||"",id="AD-"+k+"-"+slug(bn+mn+(x.titre||x.title)).slice(0,50);
if(!FAULTS.some(function(f){return f.id===id})){var yr=pYears(x.annee||x.years);
FAULTS.push({id:id,scope:mn?"model":"brand",brands:[slug(bn)],target:mn?slug(bn)+"-"+slug(mn):"",
kind:k==="recalls"?"rappel":"tsb",sev:"eleve",y0:yr[0],y1:yr[1],titre:x.titre||x.title,
sym:x.sym||x.detail||"",pro:String(x.pro||"Vérifier éligibilité VIN|Appliquer la procédure constructeur").split("|"),
org:x.org||"",dtc:csv(x.dtc),src:x.src||x.source||"auto-diagnostic",
dom:csv(x.dom).filter(function(d){return DM[d]}).length?csv(x.dom).filter(function(d){return DM[d]}):domGuess((x.titre||"")+" "+(x.sym||""))});fa++;}}}
else pv(x);});});
if(data.overrides&&typeof data.overrides==="object")Object.keys(data.overrides).forEach(function(k){
var v=data.overrides[k];if(v&&typeof v==="object")pv(v);});}
return{add:add,merge:merge,fadd:fa,radd:rv};}
function importFile(file){if(!canW()){toast("Import réservé au mode administrateur","ba");return}
ovlOn(true);$("ovT").textContent="Import de fichier";$("ovS").textContent=file.name;
var before=engines().length;
$("ovB").textContent=before;$("ovA").textContent="+0";$("ovM").textContent="~0";$("ovAf").textContent=before;
ostep(8,"Lecture du fichier");olog("Lecture : "+file.name,"t");
file.text().then(function(txt){olog(txt.length+" octets lus","s");ostep(24,"Validation JSON");
var data;try{data=JSON.parse(txt);olog("JSON valide","s")}catch(e){throw new Error("JSON invalide : "+e.message)}
ostep(42,"Analyse du format");
var fmt=Array.isArray(data)?"tableau":(data.cat?"export KEV":(data.vehicles?"export véhicules":
(data.customs||data.overrides||data.recalls||data.tiers?"sauvegarde auto-diagnostic":"objet")));
olog("Format détecté : "+fmt,"i");
var snap=JSON.stringify({cat:CAT,faults:FAULTS,revs:REVC});
ostep(60,"Fusion par identifiants");
var r=ingest(data);$("ovA").textContent="+"+r.add;$("ovM").textContent="~"+r.merge;
olog(r.add+" motorisation(s), "+r.merge+" fusion(s), "+r.fadd+" fiche(s), "+r.radd+" révision(s)","s");
if(!r.add&&!r.merge&&!r.fadd&&!r.radd){ostep(100,"Terminé");olog("Fichier valide mais aucune donnée exploitable","w");
$("ovRes").innerHTML='<div class="nt wa"><b>Fichier vide ou sans donnée compatible.</b> Format reconnu ('+esc(fmt)+
") mais tableaux vides. La base livrée de <b>"+nf(before)+"</b> motorisations est <b>conservée intacte</b>.</div>";
$("ovAf").textContent=engines().length;toast("Fichier vide — base conservée","wa");return;}
ostep(78,"Sauvegarde locale");makeBk("import fichier : "+file.name);olog("Sauvegarde automatique créée","s");
UPD.unshift({ts:Date.now(),src:"fichier "+file.name,m:r.add,f:r.fadd,r:r.radd});
saveDB();ostep(100,"Vérification d'intégrité");audit();olog("Intégrité : "+AUDIT.score+"%","s");
$("ovAf").textContent=engines().length;
$("ovRes").innerHTML='<div class="nt ok"><b>Import intégré sans blocage.</b><br>Motorisations : '+nf(before)+" → <b>"+
nf(engines().length)+"</b> · Fiches : <b>"+nf(FAULTS.length)+"</b> · Révisions : <b>"+allRevs().length+
"</b><br>Intégrité : <b>"+AUDIT.score+"%</b> · sauvegarde locale créée.</div>";
sync();renderDom();renderAll();renderAudit();renderAdm();
notify("import","Import fichier : +"+r.add+" motorisations, +"+r.fadd+" fiches","");
toast("Import réussi : +"+r.add+" motorisations","ok",function(){
var d=JSON.parse(snap);CAT=d.cat;FAULTS=d.faults;REVC=d.revs;saveDB();sync();audit();renderDom();renderAll();renderAdm();
toast("Import annulé","in");});
}).catch(function(e){olog("Échec : "+e.message,"e");
$("ovRes").innerHTML='<div class="nt ba"><b>Import interrompu.</b> '+esc(e.message)+
"<br>La base existante n'a pas été modifiée.</div>";toast("Import échoué — base préservée","ba");
}).then(function(){$("ovX").style.display="block";});}
var PACK_URL="https://raw.githubusercontent.com/expertkevin06-cell/auto-diagnostic/main/pack2024.json";
function updateOnline(){if(!canW()){toast("Réservé à l'administrateur","ba");return}
if(!navigator.onLine){toast("Connexion requise","ba");return}
ovlOn(true);$("ovT").textContent="Mise à jour de la base";$("ovS").textContent="Recherche de nouvelles marques, modèles, motorisations et pannes";
var before=engines().length,beforeF=FAULTS.length;
$("ovB").textContent=before;$("ovA").textContent="+0";$("ovM").textContent="~0";$("ovAf").textContent=before;
ostep(15,"Interrogation du dépôt");olog("GET "+PACK_URL,"t");
var snap=JSON.stringify({cat:CAT,faults:FAULTS,revs:REVC});
var ctl=null,to=null;
try{ctl=new AbortController();to=setTimeout(function(){ctl.abort()},12000);}catch(e){}
fetch(PACK_URL,ctl?{cache:"no-store",signal:ctl.signal}:{cache:"no-store"}).then(function(r){
if(to)clearTimeout(to);if(!r.ok)throw new Error("HTTP "+r.status);return r.json();
}).then(function(data){olog("Pack distant trouvé","s");ostep(50,"Fusion du pack distant");
var res=ingest(data);
$("ovA").textContent="+"+res.add;$("ovM").textContent="~"+res.merge;
olog(res.add+" motorisation(s), "+res.fadd+" fiche(s), "+res.radd+" révision(s)","s");
if(res.add||res.fadd||res.radd){UPD.unshift({ts:Date.now(),src:"pack distant",m:res.add,f:res.fadd,r:res.radd});
makeBk("mise à jour en ligne");}
saveDB();ostep(85,"Audit d'intégrité");audit();
$("ovAf").textContent=engines().length;
$("ovRes").innerHTML=(res.add||res.fadd||res.radd)?
'<div class="nt ok"><b>Mise à jour terminée.</b><br>Motorisations : '+nf(before)+" → <b>"+nf(engines().length)+
"</b> · Fiches : "+nf(beforeF)+" → <b>"+nf(FAULTS.length)+"</b> · Intégrité <b>"+AUDIT.score+"%</b></div>":
'<div class="nt wa"><b>Pack distant déjà intégré ou vide.</b> La base livrée reste complète : <b>'+
nf(engines().length)+"</b> motorisations, <b>"+nf(FAULTS.length)+"</b> fiches. Intégrité <b>"+AUDIT.score+"%</b>.</div>";
sync();renderDom();renderAll();renderAudit();renderAdm();
if(res.add||res.fadd)toast("Mise à jour : +"+res.add+" motorisations, +"+res.fadd+" fiches","ok",function(){
var d=JSON.parse(snap);CAT=d.cat;FAULTS=d.faults;REVC=d.revs;saveDB();sync();audit();renderDom();renderAll();renderAdm();});
}).catch(function(e){if(to)clearTimeout(to);
olog("Pack distant indisponible : "+(e.name==="AbortError"?"délai dépassé":e.message),"w");
ostep(70,"Vérification de la base locale");audit();
$("ovAf").textContent=engines().length;
$("ovRes").innerHTML='<div class="nt wa"><b>Aucune nouveauté rapatriée.</b> '+esc(e.name==="AbortError"?"délai dépassé":e.message)+
".<br>La base embarquée reste <b>intégralement disponible hors ligne</b> : <b>"+nf(engines().length)+
"</b> motorisations, <b>"+nf(FAULTS.length)+"</b> fiches, <b>"+allRevs().length+"</b> révisions. Intégrité <b>"+AUDIT.score+"%</b>.</div>";
renderAudit();renderAdm();toast("Base locale conservée — aucune perte","wa");
}).then(function(){ostep(100,"Terminé");$("ovX").style.display="block";});}
function exportDB(){if(!canW()){toast("Export réservé au mode administrateur","ba");return}
var p={app:"KEV FUSION 2026",version:16,exported:new Date().toISOString(),updates:UPD,
integrity:AUDIT?{score:AUDIT.score,bad:AUDIT.bad,warn:AUDIT.warn}:null,
domains:DOM.map(function(d){return{id:d[0],name:d[1]}}),cat:CAT,faults:FAULTS,protocols:rules(null),
revisions:REVS0,revisionsCustom:REVC,tiers:TIERS,notes:NOTES,views:VIEWS,dtc:DTC};
var b=new Blob([JSON.stringify(p,null,1)],{type:"application/json"}),a=el("a");
a.href=URL.createObjectURL(b);a.download="kev-fusion-2026-"+new Date().toISOString().slice(0,10)+".json";
document.body.appendChild(a);a.click();
setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},400);toast("Export complet téléchargé","ok");}

function renderAll(){$("nBase").textContent=nf(engines().length);
$("nFault").textContent=nf(FAULTS.length+(FIL.rules?D.rules.length:0));
safe(renderDiag,"rendu diagnostic");safe(renderFaults,"rendu pannes");safe(renderServ,"rendu entretien");
safe(renderCov,"rendu domaines");safe(renderCat,"rendu catalogue");
if(canW())safe(renderAdm,"rendu admin");reveal();}
function showView(v){[].forEach.call(document.querySelectorAll(".vw"),function(s){s.classList.toggle("on",s.id==="v-"+v)});
[].forEach.call(document.querySelectorAll(".tb"),function(t){t.setAttribute("aria-selected",String(t.dataset.v===v))});
if(v==="int")safe(renderAudit,"audit");if(v==="cat")safe(renderCat,"catalogue");
if(v==="dom")safe(renderCov,"domaines");if(v==="serv")safe(renderServ,"entretien");
window.scrollTo({top:0,behavior:"smooth"});reveal();}
var io=null;
function reveal(){var els=document.querySelectorAll(".vw.on .rvl:not(.in)");
if(!("IntersectionObserver"in window)){[].forEach.call(els,function(e){e.classList.add("in")});return}
if(!io)io=new IntersectionObserver(function(en){en.forEach(function(x){
if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}})},{threshold:.05});
[].forEach.call(els,function(e){io.observe(e)});}

function selfCheck(){var L=[],add=function(ok,l,d,f){L.push({ok:!!ok,l:l,d:d==null?"":String(d),f:!!f})};
var lsOk=(function(){try{localStorage.setItem("kf.t","1");localStorage.removeItem("kf.t");return true}catch(e){return false}})();
var n24=CAT.reduce(function(a,b){return a+b.models.filter(function(m){return m.y0>=2024}).length},0);
add(true,"data.js chargé (window.KFD)","catalogue + fiches + domaines");
add(CAT.length>0,"Catalogue construit",CAT.length+" marques",!CAT.length);
add(engines().length>100,"Motorisations chargées",engines().length,engines().length===0);
add(FAULTS.length>10,"Fiches pannes / rappels / TSB",FAULTS.length,!FAULTS.length);
add(D.rules.length>20,"Protocoles par domaine",D.rules.length);
add(allRevs().length>10,"Révisions d'intervalles",allRevs().length);
add(n24>=40,"Modèles millésimes 2024+",n24);
add(!!CO.brand&&!!CO.hp,"Banc de commande initialisé","5 listes corrélées",!CO.brand);
add(typeof K.unlock==="function"&&!!$("admForm"),"Authentification administrateur prête","code requis");
add(lsOk,"Stockage local accessible",lsOk?"oui":"indisponible",!lsOk);
add(!!(window.crypto&&window.crypto.subtle),"Crypto Subtle (repli intégré sinon)",(window.crypto&&window.crypto.subtle)?"oui":"repli");
add(!!AUDIT,"Audit d'intégrité calculé",AUDIT?AUDIT.score+"% · "+AUDIT.bad+" bloquante(s)":"");
add(!!$("launch")&&!!$("v-diag"),"Interface complète","écran d'accueil + 7 sections",!$("v-diag"));
add((K.errors||[]).length===0,"Aucune erreur JS capturée",(K.errors||[]).length?(K.errors||[]).slice(-3).join(" | "):"ok",(K.errors||[]).length>0);
return L;}
window.KF_RECHECK=function(){safe(function(){audit();renderAudit();K.set(selfCheck());toast("Auto-vérification relancée","in")},"recheck");};

function bind(){
CO.brand=new Combo($("cBrand"),"Toutes les marques",function(v){SEL={brand:v,model:"",year:"",fam:"",hp:""};FSEL=[];sync();renderDom();renderAll();});
CO.model=new Combo($("cModel"),"Choisir d'abord une marque",function(v){SEL.model=v;SEL.year="";SEL.fam="";SEL.hp="";FSEL=[];sync();renderDom();renderAll();});
CO.year=new Combo($("cYear"),"Toutes les années",function(v){SEL.year=v;sync();renderDom();renderAll();});
CO.fam=new Combo($("cFam"),"Toutes cylindrées / types",function(v){SEL.fam=v;SEL.hp="";sync();renderDom();renderAll();});
CO.hp=new Combo($("cHp"),"Toutes puissances",function(v){SEL.hp=v;sync();renderDom();renderAll();});
[].forEach.call(document.querySelectorAll(".tb"),function(t){t.onclick=function(){
if(t.dataset.v==="adm"&&!canW()){toast("Réservé à l'administrateur","ba");return}showView(t.dataset.v);};});
$("bellB").onclick=openNf;$("nfX").onclick=closeNf;
$("nfRead").onclick=function(){NOTIF.forEach(function(n){n.read=true});saveNf();renderBell();renderNf();toast("Notifications marquées lues","ok");};
$("nfClear").onclick=function(){if(!canW()){toast("Réservé à l'administrateur","ba");return}
var s=NOTIF.slice();NOTIF=[];saveNf();renderBell();renderNf();
toast("Notifications vidées","wa",function(){NOTIF=s;saveNf();renderBell();renderNf();});};
$("nfGo").onclick=function(){closeNf();if(canW())showView("adm");else toast("Réservé à l'administrateur","ba");};
$("bNew").onclick=newSearch;
var qt=null;$("q").oninput=function(){FIL.q=$("q").value;clearTimeout(qt);
qt=setTimeout(function(){safe(renderDiag,"q-diag");safe(renderFaults,"q-pannes");safe(renderCov,"q-dom")},170);};
[].forEach.call($("sevSeg").querySelectorAll("button"),function(b){b.onclick=function(){
var s=b.dataset.s,i=FIL.sev.indexOf(s);if(i>=0)FIL.sev.splice(i,1);else FIL.sev.push(s);
b.setAttribute("aria-pressed",String(i<0));renderAll();};});
$("selKind").onchange=function(){FIL.kind=$("selKind").value;renderAll();};
$("selSort").onchange=function(){FIL.sort=$("selSort").value;renderAll();};
$("kmY").oninput=function(){USE.km=+$("kmY").value;$("kmYL").textContent=nf(USE.km)+" km/an";safe(renderServ,"km/an");};
$("selSev").onchange=function(){USE.sev=$("selSev").value;safe(renderServ,"sollicitation");toast("Sollicitation : "+$("selSev").selectedOptions[0].text,"in");};
$("selClim").onchange=function(){USE.clim=$("selClim").value;safe(renderServ,"climat");toast("Climat : "+$("selClim").selectedOptions[0].text,"in");};
$("tgB").onclick=function(){FIL.bs=!FIL.bs;$("tgB").setAttribute("aria-pressed",String(FIL.bs));renderDom();renderAll();};
$("tgR").onclick=function(){FIL.rules=!FIL.rules;$("tgR").setAttribute("aria-pressed",String(FIL.rules));renderDom();renderAll();};
$("tgD").onclick=function(){FIL.done=!FIL.done;$("tgD").setAttribute("aria-pressed",String(FIL.done));renderDom();renderAll();};
$("bDomAll").onclick=function(){FIL.dom=[];renderDom();renderAll();toast("Tous les domaines affichés","in");};
$("bCovClear").onclick=function(){FIL.dom=[];renderDom();renderAll();toast("Filtres domaines réinitialisés","in");};
$("bRand").onclick=function(){var e=engines();if(e.length)loadEng(e[Math.floor(Math.random()*e.length)]);};
$("bSave").onclick=function(){if(!canW()){toast("Réservé à l'administrateur","ba");return}
if(!SEL.brand){toast("Sélectionnez au moins une marque","wa");return}
var b=B(SEL.brand),m=SEL.model?M(SEL.brand,SEL.model):null;
var f=(SEL.fam&&m)?famsOf(SEL.brand,SEL.model,SEL.year).filter(function(x){return x.k===SEL.fam})[0]:null;
var label=[b.name,m?m.name:null,SEL.year||null,f?famL(f.e):null,SEL.hp?SEL.hp+" ch":null].filter(Boolean).join(" › ");
var name=prompt("Nom de la vue mémorisée :",label);if(!name)return;
VIEWS.unshift({name:name.slice(0,60),label:label,sel:Object.assign({},SEL),q:FIL.q,dom:FIL.dom.slice(),use:Object.assign({},USE)});
saveAux();renderViews();toast("Vue mémorisée","ok");};
$("bDtc").onclick=function(){var c=($("dtcIn").value||"").trim().toUpperCase(),out=$("dtcOut");
if(!c){out.innerHTML="";return}
var d=DTC[c],rel=pool(false).filter(function(f){return f.dtc.indexOf(c)>=0});
out.innerHTML=(d?'<div class="nt in"><b>'+esc(c)+" — "+esc(d[0])+"</b><br>Causes probables : "+esc(d[1])+
"<br>Contrôle : "+esc(d[2])+'</div>':'<div class="nt wa"><b>'+esc(c)+
"</b> absent du dictionnaire local. Consultez OBD-Codes ou la documentation constructeur.</div>")+
((ready()&&rel.length)?'<div class="mi" style="margin-top:8px">'+rel.length+" fiche(s) associée(s) :</div>"+
rel.slice(0,6).map(function(f){return'<div class="fc v-'+f.sev+'" style="margin-top:7px;cursor:default">'+
'<div class="ft" style="font-size:13px">'+esc(f.titre)+'</div><div class="fm"><span class="pl '+KCL[f.kind]+'">'+
KIND[f.kind]+'</span><span class="pl">'+f.y0+"–"+f.y1+'</span></div></div>';}).join(""):"");};
$("dtcIn").onkeydown=function(e){if(e.key==="Enter")$("bDtc").click();};
$("bSelAll").onclick=function(){var a=current();
if(FSEL.length===a.length)FSEL=[];else FSEL=a.map(function(f){return f.id});renderFaults();};
$("bBulkDone").onclick=function(){if(!canW())return;
var ids=FSEL.slice(),prev=ids.map(function(i){return[i,NOTES[i]?Object.assign({},NOTES[i]):null]});
ids.forEach(function(i){NOTES[i]=Object.assign({},NOTES[i],{done:true})});
saveAux();FSEL=[];renderAll();toast(ids.length+" fiche(s) traitée(s)","ok",function(){
prev.forEach(function(p){if(p[1])NOTES[p[0]]=p[1];else delete NOTES[p[0]]});saveAux();renderAll();});};
$("bBulkCopy").onclick=function(){var a=current().filter(function(f){return FSEL.indexOf(f.id)>=0});
var t=a.map(function(f){return f.titre+" ["+KIND[f.kind]+" · "+SEV[f.sev].n+" · "+f.y0+"-"+f.y1+"]\nDomaines : "+
(f.dom||[]).map(function(d){return DM[d]?DM[d].n:d}).join(", ")+"\n"+f.sym+"\n"+
f.pro.map(function(p,i){return(i+1)+") "+p}).join("\n")+"\nOrganes : "+f.org+"\nDTC : "+f.dtc.join(", ")+"\nSource : "+f.src;}).join("\n\n---\n\n");
if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){toast(a.length+" fiche(s) copiée(s)","ok")},function(){toast("Copie indisponible","wa")});
else toast("Copie indisponible","wa");};
$("bPrint").onclick=function(){window.print();};
$("bCopyPlan").onclick=function(){if(!ready()){toast("Sélectionnez une motorisation complète","wa");return}
var e=resolved()[0],s=spec(e),rv=revsFor(e);
var t="PLAN D'ENTRETIEN — "+e.brandName+" "+e.modelName+" "+famL(e)+" "+e.hp+" ch ("+kw(e.hp)+" kW)\nCode moteur "+
e.code+" · "+(s.ev?s.kwh+" kWh / "+s.volt+" V":s.disp+" cm³ / "+s.lay)+" · "+e.y0+"-"+e.y1+"\nUsage : "+
nf(USE.km)+" km/an · "+USE.sev+" · "+USE.clim+"\n"+
(rv.length?"\nINTERVALLES RÉVISÉS :\n"+rv.map(function(r){return" • "+r.organ+" : "+
(r.oldKm?nf(r.oldKm)+" km":"sans échéance")+" → "+nf(r.newKm)+" km"+(r.newMo?" / "+moT(r.newMo):"")+" ("+r.src+")";}).join("\n"):"")+
planFor(e).map(function(x){return"\n"+nf(x.km)+" km (≈ "+moT(x.mo)+")\n"+
x.ops.map(function(o){return" • "+o.t+(o.r?" [RÉVISÉ]":(o.c?" [CRITIQUE]":""))}).join("\n");}).join("\n");
if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){toast("Plan copié","ok")},function(){toast("Copie indisponible","wa")});
else toast("Copie indisponible","wa");};
$("bRevAll").onclick=function(){var b=$("revAllBox");
b.style.display=b.style.display==="none"?"block":"none";
if(b.style.display==="block"){renderRevAll();b.scrollIntoView({behavior:"smooth",block:"start"});}};
var rqt=null;$("revQ").oninput=function(){revQ=$("revQ").value;clearTimeout(rqt);rqt=setTimeout(renderRevAll,160);};
var ct=null;$("catQ").oninput=function(){CUI.q=$("catQ").value;CUI.page=0;clearTimeout(ct);ct=setTimeout(renderCat,160);};
[].forEach.call(document.querySelectorAll("#catT th.so"),function(th){th.onclick=function(){
var k=th.dataset.k;if(CUI.sort===k)CUI.dir*=-1;else{CUI.sort=k;CUI.dir=1}renderCat();};});
$("catP").onclick=function(){CUI.page--;renderCat();};
$("catN").onclick=function(){CUI.page++;renderCat();};
$("bCatAll").onclick=function(){if(CUI.sel.length)CUI.sel=[];else CUI.sel=engines().slice(0,200).map(function(e){return e.key});renderCat();};
$("bCatLoad").onclick=function(){var k=CUI.sel[0],e=engines().filter(function(x){return x.key===k})[0];if(e)loadEng(e);};
$("bAudit").onclick=function(){audit();renderAudit();K.set(selfCheck());toast("Audit terminé — intégrité "+AUDIT.score+"%","ok");};
$("bRepair").onclick=autoRepair;
$("bLock").onclick=function(){K.lock();toast("Session administrateur verrouillée","in");};
$("tiersQ").oninput=function(){safe(renderTiers,"filtre tiers");};
$("tiersFil").onchange=function(){safe(renderTiers,"filtre tiers");};
$("bRevAllT").onclick=function(){if(!canW())return;
var g=TIERS.filter(function(t){return t.status==="granted"});
if(!g.length){toast("Aucun tiers autorisé","in");return}
if(!confirm("Révoquer tous les accès autorisés ("+g.length+") ?"))return;
var prev=g.map(function(t){return t.status});
g.forEach(function(t){t.status="revoked";t.decidedAt=Date.now();t.history.push({ts:Date.now(),a:"revoked",by:"admin"})});
saveAcc();renderTiers();renderBell();notify("revoke",g.length+" accès révoqués","");
toast(g.length+" accès révoqués","wa",function(){g.forEach(function(t,i){t.status=prev[i]});saveAcc();renderTiers();renderBell();});};
$("fileImp").onchange=function(e){var f=e.target.files[0];if(f)safe(function(){importFile(f)},"import");e.target.value="";};
$("bUpd").onclick=function(){safe(updateOnline,"mise à jour");};
$("bExp").onclick=exportDB;
$("bBk").onclick=function(){if(!canW()){toast("Mode administrateur requis","ba");return}makeBk("manuelle");toast("Sauvegarde locale créée","ok");};
$("bWipe").onclick=function(){if(!canW()){toast("Mode administrateur requis","ba");return}
if(!confirm("Réinitialiser sur la base livrée ? Les ajouts et imports seront perdus (annulable)."))return;
var snap=JSON.stringify({cat:CAT,faults:FAULTS,revs:REVC});
resetSeed();newSearch();audit();renderAudit();renderAdm();K.set(selfCheck());
toast("Base réinitialisée","wa",function(){var d=JSON.parse(snap);CAT=d.cat;FAULTS=d.faults;REVC=d.revs;
saveDB();sync();audit();renderDom();renderAll();renderAdm();});};
$("bClearN").onclick=function(){if(!canW()){toast("Mode administrateur requis","ba");return}
var snap=JSON.stringify(NOTES);NOTES={};saveAux();renderAll();
toast("Notes et statuts effacés","wa",function(){NOTES=JSON.parse(snap);saveAux();renderAll();});};
$("ovX").onclick=function(){ovlOn(false);};
$("dwX").onclick=closeDw;
$("scrim").onclick=function(){closeDw();closeNf();};
document.addEventListener("keydown",function(e){
if(e.key==="Escape"){if(openC)openC.close();
else if($("drawer").classList.contains("on"))closeDw();
else if($("notifDw").classList.contains("on"))closeNf();
else if($("ovl").classList.contains("on")&&$("ovX").style.display!=="none")ovlOn(false);}
if(e.altKey&&(e.key==="r"||e.key==="R")){e.preventDefault();newSearch();}
if(e.key==="/"&&!/input|textarea|select/i.test(document.activeElement.tagName)){e.preventDefault();$("q").focus();}});
var af=$("afDom");
if(af&&!af.children.length)DOM.forEach(function(dd){var b=el("button","dc");b.type="button";
b.dataset.on="0";b.dataset.d=dd[0];b.innerHTML='<svg class="ic"><use href="#'+dd[2]+'"/></svg>'+esc(dd[1]);
b.onclick=function(){b.dataset.on=b.dataset.on==="1"?"0":"1"};af.appendChild(b);});
$("addEng").onsubmit=function(e){e.preventDefault();if(!canW()){toast("Mode administrateur requis","ba");return}
var f=e.target,my=pYears(f.aeY.value),o=fom(nBrand(f.aeB.value),f.aeM.value.trim(),my[0],my[1]);
var r=addEngTo(o.m,o.b,f.aeF.value.trim(),parseInt(f.aeH.value,10)||0,f.aeC.value.trim(),f.aeU.value,
my[0],my[1],f.aeT.value.trim(),f.aeD.value.trim());
if(r==="none"){toast("Cette motorisation existe déjà","wa");return}
saveDB();sync();audit();renderDom();renderAll();renderAdm();f.reset();
toast(r==="add"?"Motorisation ajoutée":"Motorisation enrichie","ok");};
$("addF").onsubmit=function(e){e.preventDefault();if(!canW()){toast("Mode administrateur requis","ba");return}
var brands=csv($("afB").value).map(slug).filter(Boolean);
if(!brands.length){toast("Au moins une marque valide","wa");return}
var dom=[].map.call($("afDom").querySelectorAll('[data-on="1"]'),function(b){return b.dataset.d});
if(!dom.length){toast("Sélectionnez au moins un domaine","wa");return}
FAULTS.push({id:"USR-"+Date.now().toString(36),scope:$("afSc").value,brands:brands,target:$("afG").value.trim(),
kind:$("afK").value,sev:$("afS").value,y0:+$("afY0").value||2017,y1:+$("afY1").value||2027,
titre:$("afT").value.trim(),sym:$("afSy").value.trim(),
pro:$("afP").value.split("\n").map(function(s){return s.trim()}).filter(Boolean),org:$("afO").value.trim(),
dtc:csv($("afD").value).map(function(s){return s.toUpperCase()}),src:$("afSr").value.trim(),dom:dom});
saveDB();audit();renderDom();renderAll();renderAdm();e.target.reset();
$("afY0").value=2017;$("afY1").value=2027;
[].forEach.call($("afDom").querySelectorAll("[data-on]"),function(b){b.dataset.on="0"});
toast("Fiche enregistrée","ok");};
$("addRev").onsubmit=function(e){e.preventDefault();if(!canW()){toast("Mode administrateur requis","ba");return}
var brands=csv($("arB").value).map(slug).filter(Boolean);
if(!brands.length){toast("Au moins une marque valide","wa");return}
REVC.push({id:"USR-R-"+Date.now().toString(36),brands:brands,match:$("arM").value.trim(),organ:$("arO").value.trim(),
oldKm:+$("arOK").value||0,newKm:+$("arNK").value||0,oldMo:+$("arOM").value||0,newMo:+$("arNM").value||0,
src:$("arS").value.trim(),note:$("arN").value.trim(),y0:2017,y1:2027});
saveDB();audit();renderAll();renderAdm();e.target.reset();
$("arOK").value=240000;$("arNK").value=160000;$("arOM").value=120;$("arNM").value=96;
toast("Révision enregistrée","ok");};
var net=function(){var c=$("chN"),t=$("nNet");
if(navigator.onLine){var s="En ligne";try{var k=navigator.connection;if(k&&k.effectiveType)s=k.effectiveType.toUpperCase()}catch(e){}
c.className="ch ok";t.textContent=s;}else{c.className="ch ba";t.textContent="Hors ligne";}};
net();window.addEventListener("online",function(){net();toast("Connexion rétablie","ok");});
window.addEventListener("offline",function(){net();toast("Mode hors ligne — base locale active","wa");});
setInterval(net,15000);
try{if(BC)BC.onmessage=function(){loadAcc();loadNf();live();if(canW())safe(renderAll,"sync-bc");};}catch(e){}
window.addEventListener("storage",function(e){
if([LS.acc,LS.nf,LS.db].indexOf(e.key)>=0){loadAcc();loadNf();if(e.key===LS.db)loadDB();live();if(canW())safe(renderAll,"sync-storage");}});
setInterval(function(){safe(live,"temps réel")},1200);}

function boot(){
safe(function(){initDevice();loadAux();loadAcc();loadNf();},"init-stockage");
safe(function(){if(!loadDB())resetSeed();if(!CAT.length||!engines().length)resetSeed();
if(!FAULTS.length)FAULTS=FAULTS0.map(function(f){return Object.assign({},f)});},"chargement-base");
safe(bind,"liaison-interface");
safe(sync,"cascade");
safe(function(){audit();renderDom();renderAll();renderBell();},"premier-rendu");
safe(function(){var a=AUDIT||audit();$("nInt").textContent=a.score+"%";},"score");
K.ready=true;
safe(function(){K.set(selfCheck());},"auto-vérification");
var ses=null;try{ses=localStorage.getItem("kf.ses")}catch(e){}
var r=myReq();
if(K.role){ROLE=K.role;safe(afterEnter,"session-active");}
else if(ses==="tiers"&&r&&r.status==="granted"){K.unlock("tiers");}
else{waitMode=!!r;$("launch").classList.remove("off");document.body.classList.add("lk");
safe(renderLaunch,"écran d'accueil");safe(function(){K.set(selfCheck())},"auto-vérification-2");}
setTimeout(function(){var p=$("admPwd");if(p)p.value="";
var t=$("nNet");if(t&&t.textContent==="…"){$("chN").className="ch "+(navigator.onLine?"ok":"ba");
t.textContent=navigator.onLine?"En ligne":"Hors ligne";}},900);
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(function(){});}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
