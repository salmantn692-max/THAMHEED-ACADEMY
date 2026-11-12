import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,signInAnonymously,signInWithEmailAndPassword,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {initializeFirestore,collection,doc,getDoc,getDocs,setDoc,addDoc,updateDoc,deleteDoc,query,where,onSnapshot,writeBatch,arrayUnion,arrayRemove} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {firebaseConfig,ADMIN_EMAILS} from "./firebase-config.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging.js";

const fb=initializeApp(firebaseConfig),auth=getAuth(fb),db=initializeFirestore(fb,{experimentalAutoDetectLongPolling:true},'default');
const tmo=(p,ms)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r({code:"timeout"}),ms||10000))]);
const $=i=>document.getElementById(i);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const safe=u=>/^https?:\/\//i.test(u||'')?esc(u):'';
const isimg=u=>/^data:image\//.test(u||'');
const ck=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9_-]/g,'');
const ph=n=>{let d=String(n||'').replace(/\D/g,'');if(d.length===10)d='91'+d;return d};
const isAdm=e=>ADMIN_EMAILS.map(x=>x.toLowerCase()).includes(String(e||'').toLowerCase());
const CL=['1','2','3','4','5','6','7','8','9','10','+1','+2'];
const S={
students:{l:'വിദ്യാർത്ഥികൾ',f:[['id','Student ID'],['name','പേര്'],['cls','ക്ലാസ്']]},
live:{l:'Live ക്ലാസ്',f:[['t','തലക്കെട്ട്'],['time','സമയം'],['url','Link (https://…)'],['cls','ക്ലാസ്']]},
yt:{l:'YouTube',f:[['t','തലക്കെട്ട്'],['url','YouTube Link (വീഡിയോ ലിങ്ക് ഒട്ടിച്ചാൽ ചിത്രം തനിയെ വരും)'],['cls','ക്ലാസ്']]},
ann:{l:'അറിയിപ്പുകൾ',f:[['t','തലക്കെട്ട്'],['b','വിവരം'],['cls','ക്ലാസ്'],['imp','പ്രധാനപ്പെട്ടതാണോ?',['No','Yes']]]},
slides:{l:'സ്ലൈഡുകൾ',f:[['t','തലക്കെട്ട് (ഓപ്ഷണൽ)'],['url','Link (WhatsApp ഗ്രൂപ്പ് / YouTube / സൈറ്റ്)'],['cls','ക്ലാസ്']]},
subjects:{l:'വിഷയങ്ങൾ',f:[['name','വിഷയം (English)'],['ar','അറബി പേര് (ഓപ്ഷണൽ)'],['cls','ക്ലാസ്'],['soon','Coming soon ആണോ?',['No','Yes']]]}
};
const T={live:['video','Live ക്ലാസ്'],yt:['play','YouTube ക്ലാസ്'],notes:['book','Notes & Syllabus'],ann:['bell','അറിയിപ്പുകൾ'],tt:['cal','ടൈം ടേബിൾ'],att:['check','ഹാജർ']};
const EX={q:['QUARTERLY EXAM','Quarterly Question Paper','clip'],h:['HALF YEARLY EXAM','Half Year Question Paper','check'],f:['FINAL EXAM','Final Question Paper','cap']};
let MP={step:'sub',sub:'',paper:''},SUBS=null,PAP=null,TF=null;const PB={},TFU={};
let V={s:'boot',k:'',sec:'students',ed:'',cd:''},me=null,adm=false,DA={},CT={},SL=[],LV=[],AN=null,LST=null,PI=null,PK='',tp=0,tmr,CI,unsub=[];
let W={m:'c',c:'1',i:0,t:'',r:false};
window.IS_POPPING = false;
const A=k=>DA[k]||[];
const IC={
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
tick:'<path d="M5 13l4 4L19 7"/>',
sliders:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
dots:'<circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/>',
close:'<path d="M18 6L6 18M6 6l12 12"/>',
dl:'<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
video:'<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3z"/>',
play:'<circle cx="12" cy="12" r="10"/><path d="M10 8l6 4-6 4z"/>',
book:'<path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/>',
bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
check:'<circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/>',
file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
back:'<path d="M19 12H5M12 19l-7-7 7-7"/>',
right:'<path d="M9 6l6 6-6 6"/>',
ext:'<path d="M7 17L17 7M8 7h9v9"/>',
edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
trash:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
clip:'<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 12h6M9 16h6"/>',
cap:'<path d="M22 10L12 5 2 10l10 5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
star:'<path d="M12 2l3 6.5 7 .9-5.2 4.8 1.4 7L12 17.8 5.8 21.2l1.4-7L2 9.4l7-.9z"/>',
zap:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
quran:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M12 6l1.5 2.5 2.5.5-2 2 .5 2.5-2.5-1.5-2.5 1.5.5-2.5-2-2 2.5-.5z"/>',
pause:'<path d="M8 5v14M16 5v14"/>',
play2:'<path d="M7 4l13 8-13 8z"/>',
skipf:'<path d="M5 4l10 8-10 8z"/><path d="M19 5v14"/>',
skipb:'<path d="M19 4L9 12l10 8z"/><path d="M5 5v14"/>'
};
const ico=n=>'<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(IC[n]||'')+'</svg>';

let AC=null;
function sfx(ok){
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state==='suspended')AC.resume();
    const t=AC.currentTime;
    if(ok){
      [880,1320].forEach((f,i)=>{
        const o=AC.createOscillator(),g=AC.createGain();
        o.type='sine';o.frequency.value=f;
        o.connect(g);g.connect(AC.destination);
        const st=t+i*0.09;
        g.gain.setValueAtTime(0.0001,st);
        g.gain.linearRampToValueAtTime(0.22,st+0.01);
        g.gain.exponentialRampToValueAtTime(0.0001,st+0.28);
        o.start(st);o.stop(st+0.3);
      });
    }else{
      const o=AC.createOscillator(),g=AC.createGain();
      o.type='sawtooth';
      o.frequency.setValueAtTime(180,t);
      o.frequency.linearRampToValueAtTime(110,t+0.25);
      o.connect(g);g.connect(AC.destination);
      g.gain.setValueAtTime(0.0001,t);
      g.gain.linearRampToValueAtTime(0.16,t+0.01);
      g.gain.exponentialRampToValueAtTime(0.0001,t+0.3);
      o.start(t);o.stop(t+0.32);
    }
  }catch(e){}
}

function toast(m){const e=$('toast');if(!e)return;e.textContent=m;e.classList.add('on');clearTimeout(tmr);tmr=setTimeout(()=>e.classList.remove('on'),2400)}
let HT=0,LK='',BK='home',PH=0;
async function refreshHome(){
  HT=Date.now();
  try{await homeData()}catch(e){}
  if(V.s==='home')render();
}
function go(s,k){if(s==='study'||s==='me')BK=s;else if(s==='home')BK='home';V.s=s;V.k=k||'';render();window.scrollTo(0,0);if(s==='home'&&me&&AN!==null&&Date.now()-HT>60000)refreshHome()}

async function fetchK(k){
  const c=collection(db,k);
  const rs=await Promise.all([getDocs(query(c,where('cls','==','All'))),getDocs(query(c,where('cls','==',String(me.cls))))]);
  return rs.flatMap(r=>r.docs.map(d=>({_id:d.id,...d.data()}))).sort((a,b)=>(a.ts||0)-(b.ts||0));
}
async function loadHome(){
  V.s='home';render();
  try{
    const s=await tmo(getDoc(doc(db,'students',me.id)),12000);if(s.exists())me={id:me.id,...s.data()};
    await homeData();HT=Date.now();
  }catch(e){if(AN===null)AN=[];toast('ഡാറ്റ ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല')}
  render();
}
async function openList(k){
  if(k==='yt')YT.cur='';
  if(k==='tt'){openTT();return}
  if(k==='att'){openAtt();return}
  if(k==='notes'){openLib();return}
  V.s='list';V.k=k;LST=null;render();window.scrollTo(0,0);
  if(k==='att'){LST=[];render();return}
  try{LST=await tmo(fetchK(k),12000)}catch(e){LST=[];toast(errMsg(e,'ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.'))}
  render();
}
function watch(){
  unsub.forEach(f=>f());unsub=[];
  Object.keys(S).forEach(k=>unsub.push(onSnapshot(collection(db,k),s=>{
    DA[k]=s.docs.map(d=>({_id:d.id,id:d.id,...d.data()})).sort((a,b)=>(a.ts||0)-(b.ts||0));
    if(V.s==='admin')refresh();
  },()=>toast('ഡാറ്റ ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല'))));
  unsub.push(onSnapshot(collection(db,'contacts'),s=>{CT={};s.docs.forEach(d=>CT[d.id]=d.data().phone||'')},()=>{}));
  unsub.push(onSnapshot(collection(db,'quran'),s=>{DA.quran=s.docs.map(d=>({_id:d.id,...d.data()}));if(V.s==='admin')refresh()},()=>{}));
  unsub.push(onSnapshot(doc(db,'config','quran'),s=>{DA.cfgq=s.exists()?s.data():{}},()=>{}));
  unsub.push(onSnapshot(collection(db,'lib'),s=>{DA.lib=s.docs.map(d=>({_id:d.id,...d.data()})).sort((a,b)=>(a.ts||0)-(b.ts||0));if(V.s==='admin')refresh()},()=>{}));
  unsub.push(onSnapshot(collection(db,'tfiles'),s=>{DA.tfiles=s.docs.map(d=>({_id:d.id,...d.data()})).sort((a,b)=>(a.ts||0)-(b.ts||0));if(V.s==='admin')refresh()},()=>{}));
  unsub.push(onSnapshot(collection(db,'papers'),s=>{DA.papers=s.docs.map(d=>({_id:d.id,...d.data()})).sort((a,b)=>(a.ts||0)-(b.ts||0));if(V.s==='admin')refresh()},()=>{}));
}

function errMsg(e,d){
  const c=(e&&e.code)||'';
  const m={
    'auth/operation-not-allowed':'Firebase → Authentication → Sign-in method ൽ Anonymous Enable ചെയ്തിട്ടില്ല.',
    'auth/admin-restricted-operation':'Firebase → Authentication → Sign-in method ൽ Anonymous Enable ചെയ്തിട്ടില്ല.',
    'auth/unauthorized-domain':'ഈ വെബ്സൈറ്റ് Firebase → Authentication → Settings → Authorized domains ൽ ചേർത്തിട്ടില്ല.',
    'auth/invalid-api-key':'firebase-config.js ലെ apiKey ശരിയല്ല.',
    'auth/api-key-not-valid.-please-pass-a-valid-api-key.':'firebase-config.js ലെ apiKey ശരിയല്ല.',
    'permission-denied':'Firestore Rules പ്രസിദ്ധീകരിച്ചിട്ടില്ല, അല്ലെങ്കിൽ ശരിയല്ല.',
    'auth/network-request-failed':'ഇന്റർനെറ്റ് പരിശോധിക്കൂ.',
    'unavailable':'ഇന്റർനെറ്റ് പരിശോധിക്കൂ.',
    'timeout':'Firestore-മായി ബന്ധപ്പെടാൻ കഴിയുന്നില്ല. Firebase-ൽ Firestore Database ഉണ്ടാക്കിയിട്ടുണ്ടോ എന്നും ഇന്റർനെറ്റും പരിശോധിക്കൂ.'
  };
  return (m[c]||d||'പ്രവേശിക്കാൻ കഴിഞ്ഞില്ല.')+(c?' ['+c+']':'');
}
async function doLogin(){
  const id=ck($('sid').value),er=$('err');
  if(!id){er.textContent='Student ID നൽകൂ.';return}
  er.textContent='കാത്തിരിക്കൂ…';
  try{
    if(auth.currentUser&&!auth.currentUser.isAnonymous){await signOut(auth);unsub.forEach(f=>f());unsub=[];adm=false;DA={};CT={}}
    if(!auth.currentUser)await tmo(signInAnonymously(auth),12000);
    const s=await tmo(getDoc(doc(db,'students',id)),12000);
    if(!s.exists()){er.textContent='Student ID കണ്ടെത്തിയില്ല. Academy നൽകിയ ID ശരിയായി നൽകൂ.';return}
    const st={id,...s.data()};
    await tmo(setDoc(doc(db,'sessions',auth.currentUser.uid),{sid:id,cls:String(st.cls)}),12000);
    me=st;await loadHome();
  }catch(e){console.error(e);er.textContent=errMsg(e)}
}
async function doAdmin(){
  try{
    const r=await signInWithEmailAndPassword(auth,$('ae').value.trim(),$('ap').value);
    if(!isAdm(r.user.email)){await signOut(auth);$('err').textContent='ഈ അക്കൗണ്ടിന് Admin അനുമതിയില്ല.';return}
    adm=true;watch();go('admin');
  }catch(e){$('err').textContent='ലോഗിൻ പരാജയപ്പെട്ടു. Email / Password പരിശോധിക്കൂ.'+(e&&e.code?' ['+e.code+']':'')}
}
async function out(){
  try{if(me&&auth.currentUser&&auth.currentUser.isAnonymous)await deleteDoc(doc(db,'sessions',auth.currentUser.uid))}catch(e){}
  try{await signOut(auth)}catch(e){}
  unsub.forEach(f=>f());unsub=[];me=null;adm=false;DA={};CT={};SL=[];LV=[];AN=null;QCL=[];QAV=[];QP.n=0;try{AU.pause()}catch(e){}go('login');
}
function tap(){tp++;if(tp>=5){tp=0;go(adm?'admin':'adminlogin')}}

function hero(inner){return '<section class="scr hero"><div class="logo" onclick="tap()"><img src="icon-192.png" alt="Thamheed Academy logo"></div><h1>Thamheed Academy</h1>'+inner+'</section>'}
let DIP=null,HELP=false;
const isStandalone=()=>{try{return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true}catch(e){return false}};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();DIP=e;if(V.s==='login'||V.s==='splash')render()});
window.addEventListener('appinstalled',()=>{DIP=null;HELP=false;toast('ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്തു ✓');if(V.s==='login'||V.s==='splash')render()});
async function doInstall(){
  if(DIP){
    try{DIP.prompt();const r=await DIP.userChoice;if(r&&r.outcome==='accepted')toast('ഇൻസ്റ്റാൾ ചെയ്യുന്നു…')}catch(e){}
    DIP=null;render();return;
  }
  HELP=true;render();
}
function helpClose(){HELP=false;render()}
const instBtn=()=>isStandalone()?'':'<button class="cta ghost" onclick="doInstall()">'+ico('dl')+' ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യൂ</button>';
const instHelp=()=>HELP?'<div class="inst"><b>ഇൻസ്റ്റാൾ ചെയ്യേണ്ട വിധം</b><p><u>Android (Chrome):</u> മുകളിലെ മൂന്ന് കുത്തുകൾ (⋮) അമർത്തി "Install app" അല്ലെങ്കിൽ "Add to Home screen" തിരഞ്ഞെടുക്കുക.</p><p><u>iPhone (Safari):</u> Share ചിഹ്നം അമർത്തി "Add to Home Screen" തിരഞ്ഞെടുക്കുക.</p><p>WhatsApp-ൽ നിന്ന് ലിങ്ക് തുറന്നാൽ ⋮ അമർത്തി "Open in Chrome" തിരഞ്ഞെടുത്ത ശേഷം മാത്രം ഇൻസ്റ്റാൾ ചെയ്യുക.</p><button class="more" onclick="helpClose()">അടയ്ക്കുക</button></div>':'';
const splash=()=>hero('<p>എവിടെയും എപ്പോഴും പഠിക്കാം</p><button class="cta" onclick="go(\'login\')">ആരംഭിക്കാം</button>');
const login=()=>hero('<p>Academy നൽകിയ Student ID നൽകൂ</p><input id="sid" placeholder="Student ID" autocapitalize="characters" autocomplete="off"><div class="err" id="err"></div><button class="cta" onclick="doLogin()">പ്രവേശിക്കാം</button>'+instHelp()+instBtn()+(adm?'<button class="cta ghost" onclick="go(\'admin\')">Admin panel</button>':''));
const adminLogin=()=>hero('<p>Admin ലോഗിൻ</p><input id="ae" type="email" placeholder="Email" autocomplete="username"><input id="ap" type="password" placeholder="Password" autocomplete="current-password"><div class="err" id="err"></div><button class="cta" onclick="doAdmin()">പ്രവേശിക്കാം</button><button class="cta ghost" onclick="go(\'login\')">← തിരികെ</button>');
function carousel(){
  if(!SL.length)return '';
  return '<div class="car"><div class="trk" id="trk" onscroll="dots(this)" ontouchstart="stopCar()" ontouchend="car()">'+SL.map(x=>{
    const u=safe(x.url),im=isimg(x.img),inner=im?'<img src="'+x.img+'" alt="'+esc(x.t)+'">':'<b>'+esc(x.t)+'</b>',cl='sl'+(im?' im':' tx');
    return u?'<a class="'+cl+'" href="'+u+'" target="_blank" rel="noopener">'+inner+'</a>':'<div class="'+cl+'">'+inner+'</div>';
  }).join('')+'</div>'+(SL.length>1?'<div class="dts" id="dts">'+SL.map((x,i)=>'<i'+(i?'':' class="on"')+'></i>').join('')+'</div>':'')+'</div>';
}
function dots(t){const d=$('dts');if(!d)return;const w=t.clientWidth;if(w===0)return;const i=Math.round(t.scrollLeft/w);[...d.children].forEach((c,j)=>c.className=j===i?'on':'')}
function stopCar(){clearInterval(CI)}
function car(){
  clearInterval(CI);const t=$('trk');if(!t||t.children.length<2)return;
  CI=setInterval(()=>{if(document.hidden)return;const w=t.clientWidth;if(w===0)return;const n=t.children.length,i=Math.round(t.scrollLeft/w);t.scrollTo({left:((i+1)%n)*w,behavior:'smooth'})},7000);
}
const nsort=(a,b)=>(b.imp==='Yes')-(a.imp==='Yes')||(b.ts||0)-(a.ts||0);
function noticeCard(x){
  const imp=x.imp==='Yes',nw=!imp&&x.ts&&(Date.now()-x.ts<3*864e5);
  return '<div class="nt'+(imp?' imp':'')+'">'+(imp?'<span class="bg">പ്രധാനം</span>':nw?'<span class="bg nw">പുതിയത്</span>':'')+'<b>'+esc(x.t)+'</b>'+(x.b?'<p>'+esc(x.b)+'</p>':'')+'<small>'+esc(x.d||'')+'</small></div>';
}
function home(){
  const nz=(AN||[]).slice().sort(nsort).slice(0,3);
  
  let heroBanner = '';
  if(LV && LV.length > 0) {
    heroBanner = `<div class="hero-banner" onclick="openList('live')">
      <div class="hb-content">
        <span class="hb-tag">🔴 Live Now</span>
        <h3>${esc(LV[0].t)}</h3>
        <p>${esc(LV[0].time)}</p>
      </div>
      <div class="hb-icon">${ico('video')}</div>
    </div>`;
  } else if(AN && AN.length > 0) {
    heroBanner = `<div class="hero-banner notice" onclick="openList('ann')">
      <div class="hb-content">
        <span class="hb-tag">📢 അറിയിപ്പ്</span>
        <h3>${esc(AN[0].t)}</h3>
      </div>
      <div class="hb-icon">${ico('bell')}</div>
    </div>`;
  }

  const tiles=Object.keys(T).map(k=>`
    <button class="cc" onclick="openList('${k}')">
      <div class="ic-wrap"><div class="ic">${ico(T[k][0])}</div></div>
      <b>${T[k][1]}</b>
    </button>`).join('') 
    + `<button class="cc" onclick="openMP()"><div class="ic-wrap"><div class="ic">${ico('file')}</div></div><b>Model Paper</b></button>`
    + `<button class="cc" onclick="openQuiz()"><div class="ic-wrap"><div class="ic">${ico('zap')}</div></div><b>ക്വിസ്</b></button>` 
    + (QCL.includes(String(me.cls))?`<button class="cc" onclick="openQuran()"><div class="ic-wrap"><div class="ic">${ico('quran')}</div></div><b>ഖുർആൻ</b></button>`:'');

  return '<section class="scr"><div class="top"><div><small>അസ്സലാമു അലൈക്കും</small><h2>'+esc(me.name)+'</h2></div><div class="tag">ക്ലാസ് '+esc(me.cls)+'</div></div>'
  + heroBanner
  + carousel()
  + (nz.length?'<div class="nb"><div class="nbh"><div class="bi">'+ico('bell')+'</div><b>നോട്ടീസ് ബോർഡ്</b>'+(AN&&AN.length>3?'<button class="more" onclick="openList(\'ann\')">എല്ലാം കാണുക</button>':'')+'</div>'+nz.map(noticeCard).join('')+'</div>':'')
  + '<div class="sec"><h3>നിങ്ങളുടെ പഠനം</h3></div><div class="grid">'+tiles+'</div></section>';
}
function item(k,x){
  const ti=k==='tt'?x.sub:x.t,sm=k==='live'?x.time:k==='tt'?x.day+' · '+x.time:k==='ann'?(x.d||'')+' '+(x.b||''):'',u=safe(x.url);
  return '<div class="ol"><div class="n">'+ico(T[k][0])+'</div><div class="t">'+esc(ti)+'<small>'+esc(sm)+'</small></div>'+(u?'<a class="pl" href="'+u+'" target="_blank" rel="noopener" aria-label="Open">'+ico('ext')+'</a>':'')+'</div>';
}
function list(){
  const k=V.k;if(k==='yt')return ytView();if(k==='tt')return ttView();if(k==='att')return attView();if(k==='live')return liveView();let h='<section class="scr"><div class="bar"><button onclick="goBack()" aria-label="Back">'+ico('back')+'</button><span>'+T[k][1]+'</span><span style="width:44px"></span></div>';
  if(k==='att'){const p=+me.p||0,t=+me.t||0,pc=t?Math.round(p*100/t):0;h+='<div class="ban"><small>ഹാജർ</small><b>'+pc+'%</b><small>'+p+' / '+t+' ദിവസം</small><div class="pb"><i style="width:'+pc+'%"></i></div></div>'}
  else if(LST===null)h+='<div class="sk"><i></i><i></i><i></i></div>';
  else if(!LST.length)h+='<div class="empty">ഇപ്പോൾ ഒന്നുമില്ല.</div>';
  else h+=(k==='ann'?LST.slice().sort(nsort).map(noticeCard):LST.map(x=>item(k,x))).join('');
  return h+'</section>';
}

const SECS=()=>Object.keys(S).map(k=>[k,S[k].l,A(k).length]).concat([['att','ഹാജർ'],['quiz','ക്വിസ്'],['quran','ഖുർആൻ'],['lib','Book / Notes & Syllabus',A('lib').length],['ttf','Time Table',A('tfiles').length],['papers','Model Paper',A('papers').length],['wa','WhatsApp'],['push','Notifications']]);
const chips=()=>SECS().map(x=>'<button class="mi'+(x[0]===V.sec?' on':'')+'" onclick="sec(\''+x[0]+'\')"><span>'+x[1]+'</span>'+(x[2]!=null?'<small>'+x[2]+'</small>':'')+'</button>').join('');
function sec(k){V.sec=k;V.ed='';V.cd='';AM=false;render();if(k==='att')atSel()}
function edit(id){V.ed=id;render()}
function lst(){
  const c=S[V.sec],a=A(V.sec);
  if(!a.length)return '<div class="empty">ഒന്നുമില്ല. ചേർക്കൂ.</div>';
  return a.map(x=>'<div class="ol">'+(isimg(x.img)?'<img class="th" alt="" src="'+x.img+'">':(V.sec==='yt'&&ytId(x.url)?'<img class="th yt" alt="" src="'+ytThumb(ytId(x.url))+'">':''))+'<div class="t">'+esc(x[c.f[0][0]]||(x.img?'(ചിത്ര സ്ലൈഡ്)':''))+'<small>'+esc(x[c.f[1][0]])+(c.f[2]?' · '+esc(x[c.f[2][0]]):'')+'</small></div><button class="pl" onclick="edit(\''+x._id+'\')" aria-label="Edit">'+ico('edit')+'</button><button class="pl'+(V.cd===x._id?' dng':'')+'" onclick="del(\''+x._id+'\')" aria-label="Delete">'+ico('trash')+'</button></div>').join('');
}
function refresh(){const l=$('lst');if(l&&V.sec!=='wa')l.innerHTML=V.sec==='papers'?lstP():V.sec==='ttf'?lstT():V.sec==='lib'?lstL():V.sec==='quran'?lstQ():lst();const c=$('chips');if(c)c.innerHTML=chips()}
function pick(i){
  const f=i.files&&i.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{const im=new Image();
    im.onload=()=>{const k=Math.min(1,1000/im.width),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);PI=c.toDataURL('image/jpeg',0.8);const pv=$('pv');if(pv){pv.src=PI;pv.style.display='block'}toast('ചിത്രം തയ്യാർ ('+Math.round(PI.length/1024)+' KB)')};
    im.onerror=()=>toast('ചിത്രം വായിക്കാൻ കഴിഞ്ഞില്ല');im.src=r.result};
  r.readAsDataURL(f);
}
function gid(){const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',r=crypto.getRandomValues(new Uint8Array(8));const el=$('f_id');if(el)el.value=[...r].map(x=>a[x%32]).join('')}
function extra(s,e){
  if(s==='students')return '<button class="cta ghost" type="button" onclick="gid()">പുതിയ Student ID ഉണ്ടാക്കുക</button><label for="f_wa">രക്ഷിതാവിന്റെ WhatsApp നമ്പർ (Admin-ന് മാത്രം കാണാം)</label><input id="f_wa" inputmode="tel" placeholder="9XXXXXXXXX" value="'+esc(CT[e._id]||'')+'">';
  if(s==='slides'){const im=PI||e.img||'';return '<label for="f_img">ബാനർ ചിത്രം (ഏകദേശം 3:1, ഉദാ. 1200×400)</label><input id="f_img" type="file" accept="image/*" onchange="pick(this)"><img id="pv" class="pv" alt="" src="'+(isimg(im)?im:'')+'" style="display:'+(isimg(im)?'block':'none')+'">'}
  return '';
}
function admin(){
  if(PK!==V.sec+':'+V.ed){PK=V.sec+':'+V.ed;PI=null}
  const s=V.sec;
  let h='<section class="scr"><div class="ah"><div><small>Admin Panel</small><h2>'+esc((SECS().find(x=>x[0]===V.sec)||['','Admin'])[1])+'</h2></div><button class="pl" onclick="amToggle()" aria-label="Menu">'+ico('dots')+'</button></div>'+(AM?'<div class="ovl" onclick="amToggle()"><div class="sheet" onclick="event.stopPropagation()"><div class="sh1">വിഭാഗം തിരഞ്ഞെടുക്കൂ</div><div id="chips">'+chips()+'</div></div></div>':'');
  if(s==='wa')return h+waPanel()+'</section>';
  if(s==='push') return h+'<div class="fm" style="max-width:640px"><h3>🔔 നോട്ടിഫിക്കേഷൻ അയക്കുക</h3><p class="mu">ഇവിടെ എഴുതുന്ന സന്ദേശം ആപ്പ് ഉള്ള എല്ലാ വിദ്യാർത്ഥികളുടെയും ഫോണിലേക്ക് പോകും.</p><label for="n_t">തലക്കെട്ട് (Title)</label><input id="n_t" placeholder="ഉദാ: പുതിയ ക്ലാസ്"><label for="n_b">വിവരം (Message)</label><textarea id="n_b" rows="3" placeholder="ഉദാ: നാളെ വൈകുന്നേരം 7 മണിക്ക് ലൈവ് ക്ലാസ് ഉണ്ട്."></textarea><button class="cta" onclick="sendPush()">എല്ലാവർക്കും അയക്കുക</button></div></section>';
  if(s==='papers')return h+paperPanel()+'</section>';
  if(s==='ttf')return h+ttPanel()+'</section>';
  if(s==='att')return h+attPanel()+'</section>';
  if(s==='lib')return h+libPanel()+'</section>';
  if(s==='quiz')return h+quizPanel()+'</section>';
  if(s==='quran')return h+quranPanel()+'</section>';
  const c=S[s],e=V.ed?(A(s).find(x=>x._id===V.ed)||{}):{};
  h+='<div class="adm"><div id="lst">'+lst()+'</div><div class="fm"><h3>'+(V.ed?'തിരുത്തുക':'പുതിയത് ചേർക്കുക')+'</h3>'+c.f.map(f=>{
    const k=f[0],v=e[k]!=null?e[k]:'',n='<label for="f_'+k+'">'+f[1]+'</label>';
    if(k==='cls'){const o=(s==='students'||s==='subjects')?CL:['All'].concat(CL);return n+'<select id="f_cls">'+o.map(x=>'<option'+(String(x)===String(v)?' selected':'')+'>'+x+'</option>').join('')+'</select>'}
    if(f[2])return n+'<select id="f_'+k+'">'+f[2].map(x=>'<option'+(String(x)===String(v)?' selected':'')+'>'+x+'</option>').join('')+'</select>';
    if(k==='b')return n+'<textarea id="f_b" rows="3">'+esc(v)+'</textarea>';
    return n+'<input id="f_'+k+'" value="'+esc(v)+'">';
  }).join('')+extra(s,e)+'<button class="cta" onclick="saveI()">'+(V.ed?'മാറ്റം സേവ് ചെയ്യുക':'ചേർക്കുക')+'</button>'+(V.ed?'<button class="cta ghost" onclick="edit(\'\')">റദ്ദാക്കുക</button>':'')+'</div></div></section>';
  return h;
}
async function saveI(){
  const s=V.sec,f=S[s].f,o={};
  f.forEach(x=>o[x[0]]=$('f_'+x[0]).value.trim());
  const old=V.ed?A(s).find(x=>x._id===V.ed):null,wa=s==='students'?$('f_wa').value.trim():'';
  if(s==='slides'?!(o.t||PI||(old&&old.img)):!o[f[0][0]]){toast('ആദ്യത്തെ ഫീൽഡ് പൂരിപ്പിക്കൂ');return}
  if(o.url&&!/^https?:\/\//i.test(o.url)){toast('Link https:// ൽ തുടങ്ങണം');return}
  try{
    if(s==='students'){
      const id=ck(o.id);if(!id){toast('Student ID നൽകൂ');return}
      if(A('students').some(x=>x._id===id&&x._id!==V.ed)){toast('ഈ Student ID നേരത്തേ ഉണ്ട്');return}
      delete o.id;o.cls=String(o.cls);
      await tmo(setDoc(doc(db,'students',id),{...o,ts:(old&&old.ts)||Date.now()}));
      if(V.ed&&V.ed!==id){await deleteDoc(doc(db,'students',V.ed));await deleteDoc(doc(db,'contacts',V.ed))}
      if(wa)await tmo(setDoc(doc(db,'contacts',id),{phone:ph(wa)}));else await tmo(deleteDoc(doc(db,'contacts',id)));
    }else{
      if(s==='slides')o.img=PI||(old&&old.img)||'';
      if(s==='ann'&&!(old&&old.d))o.d=new Date().toISOString().slice(0,10);
      if(old)await tmo(updateDoc(doc(db,s,V.ed),o));else await tmo(addDoc(collection(db,s),{...o,ts:Date.now()}));
    }
  }catch(e){console.error(e);toast(errMsg(e,'സേവ് ചെയ്യാൻ കഴിഞ്ഞില്ല.'));return}
  V.ed='';PI=null;render();toast('സേവ് ചെയ്തു ✓');
}
async function del(id){
  if(V.cd!==id){V.cd=id;refresh();toast('ഒഴിവാക്കാൻ ഒരിക്കൽ കൂടി അമർത്തൂ');return}
  V.cd='';const s=V.sec;
  try{
    await deleteDoc(doc(db,s,id));
    if(s==='students'){
      await deleteDoc(doc(db,'contacts',id));
      const q=await getDocs(query(collection(db,'sessions'),where('sid','==',id)));
      await Promise.all(q.docs.map(d=>deleteDoc(d.ref)));
    }
  }catch(e){toast('ഒഴിവാക്കാൻ കഴിഞ്ഞില്ല')}
  refresh();
}
function waRead(){const m=$('w_m');if(m)W.m=m.value;const c=$('w_c');if(c)W.c=c.value;const i=$('w_i');if(i)W.i=+i.value;const t=$('w_t');if(t)W.t=t.value;W.r=false}
function waT(v){W.t=v}
function waGo(){waRead();W.r=true;render()}
function waCopy(){
  waRead();const t=W.t.replace(/\{name\}\s*/g,'');
  if(!t.trim()){toast('സന്ദേശം എഴുതൂ');return}
  const fb2=()=>{const x=$('w_t');x.select();try{document.execCommand('copy');toast('കോപ്പി ചെയ്തു')}catch(e){toast('സന്ദേശം തിരഞ്ഞെടുത്തു, കോപ്പി ചെയ്യൂ')}};
  try{navigator.clipboard.writeText(t).then(()=>toast('കോപ്പി ചെയ്തു'),fb2)}catch(e){fb2()}
}
function waPanel(){
  const st=A('students');
  let h='<div class="fm" style="max-width:640px"><h3>WhatsApp അറിയിപ്പ്</h3><label for="w_m">ആർക്ക്?</label><select id="w_m" onchange="waRead();render()"><option value="c"'+(W.m==='c'?' selected':'')+'>ക്ലാസ് അനുസരിച്ച്</option><option value="i"'+(W.m==='i'?' selected':'')+'>ഒരു വിദ്യാർത്ഥിക്ക്</option></select>';
  if(W.m==='c')h+='<label for="w_c">ക്ലാസ്</label><select id="w_c" onchange="waRead();render()">'+CL.map(x=>'<option'+(x===W.c?' selected':'')+'>'+x+'</option>').join('')+'</select>';
  else h+='<label for="w_i">വിദ്യാർത്ഥി</label><select id="w_i" onchange="waRead();render()">'+st.map((x,i)=>'<option value="'+i+'"'+(i===W.i?' selected':'')+'>'+esc(x.name)+' ('+esc(x.cls)+')</option>').join('')+'</select>';
  h+='<label for="w_t">സന്ദേശം ({name} = വിദ്യാർത്ഥിയുടെ പേര്)</label><textarea id="w_t" rows="4" oninput="waT(this.value)">'+esc(W.t)+'</textarea><button class="cta" onclick="waGo()">അയക്കാൻ തയ്യാറാക്കുക</button><button class="cta ghost" onclick="waCopy()">സന്ദേശം കോപ്പി ചെയ്യുക (ഗ്രൂപ്പിന്)</button></div>';
  if(W.r){
    const rc=W.m==='c'?st.filter(x=>String(x.cls)===String(W.c)):(st[W.i]?[st[W.i]]:[]);
    h+='<div class="sec" style="margin-top:18px"><h3>'+rc.length+' പേർ</h3></div>';
    if(!W.t.trim())h+='<div class="empty">സന്ദേശം എഴുതൂ.</div>';
    else if(!rc.length)h+='<div class="empty">ആരുമില്ല.</div>';
    else h+=rc.map(x=>{const n=ph(CT[x._id]);return '<div class="ol" style="max-width:640px"><div class="t">'+esc(x.name)+'<small>'+esc(x._id)+' · ക്ലാസ് '+esc(x.cls)+'</small></div>'+(n?'<a class="go" href="https://wa.me/'+n+'?text='+encodeURIComponent(W.t.replace(/\{name\}/g,x.name))+'" target="_blank" rel="noopener">അയക്കുക</a>':'<small>നമ്പർ ഇല്ല</small>')+'</div>'}).join('');
  }
  return h;
}

const b64of=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]);r.onerror=rej;r.readAsDataURL(f)});
const canShareFiles=()=>{try{return !!(navigator.canShare&&navigator.canShare({files:[new File([''],'a.pdf',{type:'application/pdf'})]}))}catch(e){return false}};
async function pdfBlob(p){
  if(PB[p._id])return PB[p._id];
  const key='/_f/papers/'+p._id+'/'+(p.v||p.ts||0)+'/'+(p.n||0);
  let b=await fcache.get(key);
  if(!b){
    const q=await tmo(getDocs(collection(db,'papers',p._id,'chunks')),30000);
    const bin=atob(q.docs.sort((a,b)=>a.id<b.id?-1:1).map(d=>d.data().d).join('')),u=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
    b=new Blob([u],{type:'application/pdf'});fcache.put(key,b);
  }
  return PB[p._id]=b;
}
async function openMP(){
  V.s='mp';MP={step:'sub',sub:'',paper:''};SUBS=null;PAP=null;render();window.scrollTo(0,0);
  try{
    const q=s=>getDocs(query(collection(db,s),where('cls','==',String(me.cls))));
    const [a,b]=await tmo(Promise.all([q('subjects'),q('papers')]),12000);
    SUBS=a.docs.map(d=>({_id:d.id,...d.data()}));PAP=b.docs.map(d=>({_id:d.id,...d.data()}));
  }catch(e){SUBS=[];PAP=[];toast(errMsg(e,'ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.'))}
  render();
}
function mpBack(){if(MP.step==='paper'){MP.step='exam';render()}else if(MP.step==='exam'){MP.step='sub';render()}else go(BK);window.scrollTo(0,0)}
function mpSub(id){MP.sub=id;MP.step='exam';render();window.scrollTo(0,0)}
function mpPaper(id){
  MP.paper=id;MP.step='paper';render();window.scrollTo(0,0);
  const p=PAP.find(x=>x._id===id);if(p&&!p.url&&p.n)pdfBlob(p).catch(()=>{});
}
async function mpOpen(share){
  const p=PAP.find(x=>x._id===MP.paper),sj=SUBS.find(x=>x._id===p.sub)||{name:''};
  if(safe(p.url)){
    if(share&&navigator.share){try{await navigator.share({title:p.title,url:p.url});return}catch(e){}}
    window.open(p.url,'_blank','noopener');return;
  }
  const direct=share&&canShareFiles(),w=direct?null:window.open('','_blank');
  toast('ലോഡ് ചെയ്യുന്നു…');
  try{
    const b=await pdfBlob(p),name=(sj.name?sj.name+' - ':'')+p.title+'.pdf';
    if(direct){await navigator.share({files:[new File([b],name,{type:'application/pdf'})],title:name});return}
    const u=URL.createObjectURL(b);
    if(w)w.location.href=u;else window.open(u,'_blank');
  }catch(e){
    if(w)w.close();
    if(!(e&&e.name==='AbortError'))toast(errMsg(e,'തുറക്കാൻ കഴിഞ്ഞില്ല.'));
  }
}
function mp(){
  let h='<section class="scr"><div class="bar"><button onclick="mpBack()" aria-label="Back">'+ico('back')+'</button><span>Model Paper</span><span style="width:44px"></span></div>';
  if(SUBS===null)return h+'<div class="sk"><i></i><i></i><i></i></div></section>';
  if(MP.step==='sub'){
    if(!SUBS.length)return h+'<div class="empty">ഇപ്പോൾ ഒന്നുമില്ല.</div></section>';
    return h+'<div class="grid">'+SUBS.map(s=>{const soon=s.soon==='Yes';return '<button class="cc sj" '+(soon?'disabled':'onclick="mpSub(\''+s._id+'\')"')+'><div class="ic-wrap"><div class="ic">'+ico('layers')+'</div></div>'+(s.ar?'<b class="ar" dir="auto">'+esc(s.ar)+'</b>':'')+'<b>'+esc(s.name)+'</b>'+(soon?'<div class="rb">COMING SOON</div>':'')+'</button>'}).join('')+'</div></section>';
  }
  if(MP.step==='exam'){
    const sj=SUBS.find(x=>x._id===MP.sub)||{name:''},ps=PAP.filter(p=>p.sub===MP.sub);
    h+='<h2 class="mh">'+esc(sj.name)+'</h2>';
    Object.keys(EX).forEach(k=>{
      const l=ps.filter(p=>p.exam===k);
      h+='<div class="eh"><span>'+ico(EX[k][2])+EX[k][0]+'</span><span class="bd">'+(l.length?l.length+(l.length>1?' Papers':' Paper'):(k==='f'?'Upcoming':'—'))+'</span></div>';
      h+=l.length?l.map(p=>'<button class="px" onclick="mpPaper(\''+p._id+'\')"><span class="pi">'+ico('file')+'</span><span class="pt"><b>'+esc(p.title)+'</b><small>'+EX[k][1]+'</small></span>'+ico('right')+'</button>').join(''):'<div class="cs">Coming soon</div>';
    });
    return h+'</section>';
  }
  const p=PAP.find(x=>x._id===MP.paper)||{},sj=SUBS.find(x=>x._id===p.sub)||{name:''};
  return h+'<div class="pd"><div class="pbig">'+ico('file')+'</div><h2>'+esc((sj.name?sj.name+' - ':'')+(p.title||''))+'</h2><button class="cta" onclick="mpOpen(0)">'+ico('eye')+' Open Now</button><button class="cta ghost" onclick="mpOpen(1)">'+ico('share')+' Share / Print</button></div></section>';
}
function lstP(){
  const ps=A('papers'),subs=A('subjects');
  if(!ps.length)return '<div class="empty">ഒന്നുമില്ല. ചേർക്കൂ.</div>';
  return ps.map(p=>{const s=subs.find(x=>x._id===p.sub);return '<div class="ol"><div class="n">'+ico('file')+'</div><div class="t">'+esc(p.title)+'<small>'+esc(s?'ക്ലാസ് '+s.cls+' · '+s.name:'?')+' · '+esc((EX[p.exam]||[''])[0])+'</small></div><button class="pl" onclick="edit(\''+p._id+'\')" aria-label="Edit">'+ico('edit')+'</button><button class="pl'+(V.cd===p._id?' dng':'')+'" onclick="delP(\''+p._id+'\')" aria-label="Delete">'+ico('trash')+'</button></div>'}).join('');
}
function paperPanel(){
  const subs=A('subjects'),e=V.ed?(A('papers').find(x=>x._id===V.ed)||{}):{};
  if(!subs.length)return '<div class="fm" style="max-width:640px"><p>ആദ്യം "വിഷയങ്ങൾ" ടാബിൽ ക്ലാസും വിഷയവും ചേർക്കൂ.</p></div>';
  return '<div class="adm"><div id="lst">'+lstP()+'</div><div class="fm"><h3>'+(V.ed?'തിരുത്തുക':'പുതിയ Model Paper')+'</h3><label for="p_sub">വിഷയം</label><select id="p_sub">'+subs.map(s=>'<option value="'+s._id+'"'+(s._id===e.sub?' selected':'')+'>ക്ലാസ് '+esc(s.cls)+' · '+esc(s.name)+'</option>').join('')+'</select><label for="p_exam">പരീക്ഷ</label><select id="p_exam">'+Object.keys(EX).map(k=>'<option value="'+k+'"'+(k===e.exam?' selected':'')+'>'+EX[k][0]+'</option>').join('')+'</select><label for="p_t">പേര് (ഉദാ. Model 1)</label><input id="p_t" value="'+esc(e.title||'')+'"><label for="p_f">PDF ഫയൽ (6 MB വരെ)</label><input id="p_f" type="file" accept="application/pdf"><label for="p_u">അല്ലെങ്കിൽ PDF Link (Google Drive മുതലായവ)</label><input id="p_u" value="'+esc(e.url||'')+'" placeholder="https://…">'+(V.ed&&(e.n||e.url)?'<p class="mu">ഇപ്പോൾ ഉള്ളത്: '+(e.n?'അപ്‌ലോഡ് ചെയ്ത PDF ('+Math.round((e.size||0)/1024)+' KB)':'Link')+'. പുതിയത് നൽകിയാൽ മാറും.</p>':'')+'<button class="cta" onclick="saveP()">'+(V.ed?'മാറ്റം സേവ് ചെയ്യുക':'ചേർക്കുക')+'</button>'+(V.ed?'<button class="cta ghost" onclick="edit(\'\')">റദ്ദാക്കുക</button>':'')+'</div></div>';
}
async function saveP(){
  const sub=$('p_sub').value,exam=$('p_exam').value,title=$('p_t').value.trim(),url=$('p_u').value.trim(),f=$('p_f').files[0];
  const old=V.ed?A('papers').find(x=>x._id===V.ed):null,s=A('subjects').find(x=>x._id===sub);
  if(!s){toast('വിഷയം തിരഞ്ഞെടുക്കൂ');return}
  if(!title){toast('പേര് നൽകൂ');return}
  if(url&&!/^https?:\/\//i.test(url)){toast('Link https:// ൽ തുടങ്ങണം');return}
  if(!f&&!url&&!(old&&(old.n||old.url))){toast('PDF തിരഞ്ഞെടുക്കൂ, അല്ലെങ്കിൽ Link നൽകൂ');return}
  if(f&&f.size>6*1024*1024){toast('PDF 6 MB-ൽ കൂടുതലാണ്. ചെറുതാക്കൂ, അല്ലെങ്കിൽ Drive Link നൽകൂ');return}
  const ref=old?doc(db,'papers',V.ed):doc(collection(db,'papers')),cid=i=>String(i).padStart(3,'0');
  let n=old?(old.n||0):0,size=old?(old.size||0):0,u=old?(old.url||''):'';
  try{
    if(f){
      toast('അപ്‌ലോഡ് ചെയ്യുന്നു… കാത്തിരിക്കൂ');
      const b64=await b64of(f),CH=700000,k=Math.ceil(b64.length/CH);
      for(let i=0;i<k;i++)await tmo(setDoc(doc(db,'papers',ref.id,'chunks',cid(i)),{d:b64.slice(i*CH,(i+1)*CH)}),40000);
      for(let i=k;i<n;i++)await tmo(deleteDoc(doc(db,'papers',ref.id,'chunks',cid(i))));
      n=k;size=f.size;u='';delete PB[ref.id];
    }else if(url){
      for(let i=0;i<n;i++)await tmo(deleteDoc(doc(db,'papers',ref.id,'chunks',cid(i))));
      n=0;size=0;u=url;
    }
    await tmo(setDoc(ref,{sub,exam,title,cls:String(s.cls),url:u,n,size,v:f?Date.now():((old&&old.v)||0),ts:(old&&old.ts)||Date.now()}),12000);
  }catch(e){console.error(e);toast(errMsg(e,'സേവ് ചെയ്യാൻ കഴിഞ്ഞില്ല.'));return}
  V.ed='';render();toast('സേവ് ചെയ്തു ✓');
}
async function delP(id){
  if(V.cd!==id){V.cd=id;refresh();toast('ഒഴിവാക്കാൻ ഒരിക്കൽ കൂടി അമർത്തൂ');return}
  V.cd='';
  try{
    const q=await getDocs(collection(db,'papers',id,'chunks'));
    await Promise.all(q.docs.map(d=>deleteDoc(d.ref)));
    await deleteDoc(doc(db,'papers',id));
  }catch(e){toast(errMsg(e,'ഒഴിവാക്കാൻ കഴിഞ്ഞില്ല.'))}
  refresh();
}

async function tfBlob(f){
  if(PB['t'+f._id])return PB['t'+f._id];
  const key='/_f/tfiles/'+f._id+'/'+(f.v||f.ts||0)+'/'+(f.n||0);
  let b=await fcache.get(key);
  if(!b){
    const q=await tmo(getDocs(collection(db,'tfiles',f._id,'chunks')),30000);
    const bin=atob(q.docs.sort((a,b)=>a.id<b.id?-1:1).map(d=>d.data().d).join('')),u=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
    b=new Blob([u],{type:f.mime||'application/pdf'});fcache.put(key,b);
  }
  return PB['t'+f._id]=b;
}
async function openTT(){
  V.s='list';V.k='tt';TF=null;render();window.scrollTo(0,0);
  try{
    const c=collection(db,'tfiles');
    const rs=await tmo(Promise.all([getDocs(query(c,where('cls','==','All'))),getDocs(query(c,where('cls','==',String(me.cls))))]),12000);
    TF=rs.flatMap(r=>r.docs.map(d=>({_id:d.id,...d.data()}))).sort((a,b)=>(a.ts||0)-(b.ts||0));
  }catch(e){TF=[];toast(errMsg(e,'ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.'))}
  render();
  for(const f of TF){
    if(f.url||!f.n)continue;
    try{const b=await tfBlob(f);if(/^image\//.test(f.mime||'')){TFU[f._id]=URL.createObjectURL(b);if(V.s==='list'&&V.k==='tt')render()}}catch(e){}
  }
}
function ttView(){
  let h='<section class="scr"><div class="bar"><button onclick="goBack()" aria-label="Back">'+ico('back')+'</button><span>'+T.tt[1]+'</span><span style="width:44px"></span></div>';
  if(TF===null)return h+'<div class="sk"><i></i><i></i><i></i></div></section>';
  if(!TF.length)return h+'<div class="empty">ഇപ്പോൾ ഒന്നുമില്ല.</div></section>';
  return h+TF.map(f=>{
    const img=/^image\//.test(f.mime||''),u=TFU[f._id];
    return '<div class="tf"><div class="tfh"><b>'+esc(f.title)+'</b><button class="pl" onclick="tfOpen(\''+f._id+'\',1)" aria-label="Share">'+ico('share')+'</button></div>'
      +(img?(u?'<img class="tfi" alt="'+esc(f.title)+'" src="'+u+'" onclick="tfOpen(\''+f._id+'\',0)">':'<div class="sk"><i></i><i></i><i></i></div>')
      :'<div class="tfp"><div class="pbig sm">'+ico('file')+'</div><button class="cta" onclick="tfOpen(\''+f._id+'\',0)">'+ico('eye')+' Open Now</button></div>')+'</div>';
  }).join('')+'</section>';
}
async function tfOpen(id,share){
  const f=TF.find(x=>x._id===id);if(!f)return;
  const mime=f.mime||'application/pdf',name=f.title+(/^image\//.test(mime)?'.jpg':'.pdf');
  if(safe(f.url)){
    if(share&&navigator.share){try{await navigator.share({title:f.title,url:f.url});return}catch(e){}}
    window.open(f.url,'_blank','noopener');return;
  }
  let can=false;
  try{can=!!(share&&navigator.canShare&&navigator.canShare({files:[new File([''],name,{type:mime})]}))}catch(e){}
  const w=can?null:window.open('','_blank');
  toast('ലോഡ് ചെയ്യുന്നു…');
  try{
    const b=await tfBlob(f);
    if(can){await navigator.share({files:[new File([b],name,{type:mime})],title:f.title});return}
    const u=URL.createObjectURL(b);
    if(w)w.location.href=u;else window.open(u,'_blank');
  }catch(e){
    if(w)w.close();
    if(!(e&&e.name==='AbortError'))toast(errMsg(e,'തുറക്കാൻ കഴിഞ്ഞില്ല.'));
  }
}
function shrink(file){
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=()=>{const im=new Image();
      im.onload=()=>{const k=Math.min(1,1600/im.width),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);const d=c.toDataURL('image/jpeg',0.85);res({b64:d.split(',')[1],size:Math.round(d.length*0.75)})};
      im.onerror=rej;im.src=r.result};
    r.onerror=rej;r.readAsDataURL(file);
  });
}
function lstT(){
  const a=A('tfiles');
  if(!a.length)return '<div class="empty">ഒന്നുമില്ല. ചേർക്കൂ.</div>';
  return a.map(f=>'<div class="ol"><div class="n">'+ico('cal')+'</div><div class="t">'+esc(f.title)+'<small>ക്ലാസ് '+esc(f.cls)+' · '+(/^image\//.test(f.mime||'')?'Image':'PDF / Link')+'</small></div><button class="pl" onclick="edit(\''+f._id+'\')" aria-label="Edit">'+ico('edit')+'</button><button class="pl'+(V.cd===f._id?' dng':'')+'" onclick="delT(\''+f._id+'\')" aria-label="Delete">'+ico('trash')+'</button></div>').join('');
}
function ttPanel(){
  const e=V.ed?(A('tfiles').find(x=>x._id===V.ed)||{}):{};
  return '<div class="adm"><div id="lst">'+lstT()+'</div><div class="fm"><h3>'+(V.ed?'തിരുത്തുക':'പുതിയ Time Table')+'</h3><label for="t_c">ക്ലാസ്</label><select id="t_c">'+['All'].concat(CL).map(x=>'<option'+(String(x)===String(e.cls)?' selected':'')+'>'+x+'</option>').join('')+'</select><label for="t_t">തലക്കെട്ട് (ഉദാ. Class 1 Time Table)</label><input id="t_t" value="'+esc(e.title||'')+'"><label for="t_f">PDF അല്ലെങ്കിൽ ചിത്രം</label><input id="t_f" type="file" accept="application/pdf,image/*"><label for="t_u">അല്ലെങ്കിൽ Link</label><input id="t_u" value="'+esc(e.url||'')+'" placeholder="https://…">'+(V.ed&&(e.n||e.url)?'<p class="mu">ഇപ്പോൾ ഉള്ളത്: '+(e.n?'അപ്‌ലോഡ് ചെയ്ത ഫയൽ ('+Math.round((e.size||0)/1024)+' KB)':'Link')+'. പുതിയത് നൽകിയാൽ മാറും.</p>':'')+'<button class="cta" onclick="saveT()">'+(V.ed?'മാറ്റം സേവ് ചെയ്യുക':'ചേർക്കുക')+'</button>'+(V.ed?'<button class="cta ghost" onclick="edit(\'\')">റദ്ദാക്കുക</button>':'')+'</div></div>';
}
async function saveT(){
  const cls=$('t_c').value,title=$('t_t').value.trim(),url=$('t_u').value.trim(),f=$('t_f').files[0];
  const old=V.ed?A('tfiles').find(x=>x._id===V.ed):null;
  if(!title){toast('തലക്കെട്ട് നൽകൂ');return}
  if(url&&!/^https?:\/\//i.test(url)){toast('Link https:// ൽ തുടങ്ങണം');return}
  if(!f&&!url&&!(old&&(old.n||old.url))){toast('ഫയൽ തിരഞ്ഞെടുക്കൂ, അല്ലെങ്കിൽ Link നൽകൂ');return}
  const isImg=!!f&&/^image\//.test(f.type),isPdf=!!f&&f.type==='application/pdf';
  if(f&&!isImg&&!isPdf){toast('PDF അല്ലെങ്കിൽ ചിത്രം മാത്രം തിരഞ്ഞെടുക്കൂ');return}
  if(isPdf&&f.size>6*1024*1024){toast('PDF 6 MB-ൽ കൂടുതലാണ്. ചെറുതാക്കൂ, അല്ലെങ്കിൽ Link നൽകൂ');return}
  const ref=old?doc(db,'tfiles',V.ed):doc(collection(db,'tfiles')),cid=i=>String(i).padStart(3,'0');
  let n=old?(old.n||0):0,size=old?(old.size||0):0,u=old?(old.url||''):'',mime=old?(old.mime||''):'';
  try{
    if(f){
      toast('അപ്‌ലോഡ് ചെയ്യുന്നു… കാത്തിരിക്കൂ');
      let b64;
      if(isImg){const s=await shrink(f);b64=s.b64;size=s.size;mime='image/jpeg'}else{b64=await b64of(f);size=f.size;mime='application/pdf'}
      const CH=700000,k=Math.ceil(b64.length/CH);
      for(let i=0;i<k;i++)await tmo(setDoc(doc(db,'tfiles',ref.id,'chunks',cid(i)),{d:b64.slice(i*CH,(i+1)*CH)}),40000);
      for(let i=k;i<n;i++)await tmo(deleteDoc(doc(db,'tfiles',ref.id,'chunks',cid(i))));
      n=k;u='';delete PB['t'+ref.id];delete TFU[ref.id];
    }else if(url){
      for(let i=0;i<n;i++)await tmo(deleteDoc(doc(db,'tfiles',ref.id,'chunks',cid(i))));
      n=0;size=0;mime='';u=url;
    }
    await tmo(setDoc(ref,{cls,title,mime,url:u,n,size,v:f?Date.now():((old&&old.v)||0),ts:(old&&old.ts)||Date.now()}),12000);
  }catch(e){console.error(e);toast(errMsg(e,'സേവ് ചെയ്യാൻ കഴിഞ്ഞില്ല. ചിത്രം/PDF ശരിയാണോ എന്ന് നോക്കൂ.'));return}
  V.ed='';render();toast('സേവ് ചെയ്തു ✓');
}
async function delT(id){
  if(V.cd!==id){V.cd=id;refresh();toast('ഒഴിവാക്കാൻ ഒരിക്കൽ കൂടി അമർത്തൂ');return}
  V.cd='';
  try{
    const q=await getDocs(collection(db,'tfiles',id,'chunks'));
    await Promise.all(q.docs.map(d=>deleteDoc(d.ref)));
    await deleteDoc(doc(db,'tfiles',id));
  }catch(e){toast(errMsg(e,'ഒഴിവാക്കാൻ കഴിഞ്ഞില്ല.'))}
  refresh();
}

const fcache={
  async get(k){try{const c=await caches.open('thamheed-files'),r=await c.match(k);return r?await r.blob():null}catch(e){return null}},
  async put(k,b){
    try{
      const c=await caches.open('thamheed-files'),pre=k.split('/').slice(0,4).join('/')+'/';
      for(const r of await c.keys()){const u=new URL(r.url).pathname;if(u.startsWith(pre)&&u!==k)await c.delete(r)}
      await c.put(k,new Response(b,{headers:{'Content-Type':b.type||'application/octet-stream'}}));
    }catch(e){}
  }
};

const MN=['ജനുവരി','ഫെബ്രുവരി','മാർച്ച്','ഏപ്രിൽ','മേയ്','ജൂൺ','ജൂലൈ','ഓഗസ്റ്റ്','സെപ്റ്റംബർ','ഒക്ടോബർ','നവംബർ','ഡിസംബർ'];
const ym=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
const isoDay=d=>ym(d)+'-'+String(d.getDate()).padStart(2,'0');
let ATM='',ATC={},AT={cls:'1',date:isoDay(new Date()),marks:{},busy:false};
async function loadAtt(m){
  if(ATC[m]===undefined){
    try{const s=await tmo(getDoc(doc(db,'students',me.id,'att',m)),12000);ATC[m]=s.exists()?(s.data().d||{}):{}}
    catch(e){toast(errMsg(e,'ഹാജർ ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.'));ATC[m]={}}
  }
  if(V.s==='list'&&V.k==='att')render();
}
async function openAtt(){V.s='list';V.k='att';ATM=ym(new Date());render();window.scrollTo(0,0);await loadAtt(ATM)}
function atMove(n){const [y,mo]=ATM.split('-').map(Number);ATM=ym(new Date(y,mo-1+n,1));render();loadAtt(ATM)}
function attView(){
  let h='<section class="scr"><div class="bar"><button onclick="goBack()" aria-label="Back">'+ico('back')+'</button><span>'+T.att[1]+'</span><span style="width:44px"></span></div>';
  const [y,mo]=ATM.split('-').map(Number),d=ATC[ATM],first=new Date(y,mo-1,1).getDay(),n=new Date(y,mo,0).getDate();
  h+='<div class="mnav"><button class="pl" onclick="atMove(-1)" aria-label="Previous month">'+ico('back')+'</button><b>'+MN[mo-1]+' '+y+'</b><button class="pl" onclick="atMove(1)" aria-label="Next month">'+ico('right')+'</button></div>';
  if(d===undefined)return h+'<div class="sk"><i></i><i></i><i></i></div></section>';
  let p=0,a=0;Object.keys(d).forEach(k=>{if(d[k]==='P')p++;else if(d[k]==='A')a++});
  h+='<div class="ban att"><div><b>'+p+'</b><small>ഹാജർ ദിവസങ്ങൾ</small></div><div><b>'+a+'</b><small>അഭാവം</small></div></div>';
  h+='<div class="cal">'+['ഞാ','തി','ചൊ','ബു','വ്യാ','വെ','ശ'].map(x=>'<i class="wd">'+x+'</i>').join('');
  for(let i=0;i<first;i++)h+='<i></i>';
  for(let i=1;i<=n;i++){const v=d[i];h+='<i class="dc'+(v==='P'?' p':v==='A'?' a':'')+'">'+i+'</i>'}
  return h+'</div><div class="lg"><span><i class="dc p">✓</i> ഹാജർ</span><span><i class="dc a">✕</i> അഭാവം</span></div></section>';
}
const atStu=()=>A('students').filter(x=>String(x.cls)===String(AT.cls));
async function atSel(){
  const c=$('a_c'),d=$('a_d');if(c)AT.cls=c.value;if(d&&d.value)AT.date=d.value;
  AT.marks={};AT.busy=true;render();
  const [y,mo,day]=AT.date.split('-'),m=y+'-'+mo,dk=String(+day),st=atStu();
  try{
    const rs=await tmo(Promise.all(st.map(s=>getDoc(doc(db,'students',s._id,'att',m)))),20000);
    rs.forEach((r,i)=>{AT.marks[st[i]._id]=r.exists()?((r.data().d||{})[dk]||''):''});
  }catch(e){toast(errMsg(e,'ഹാജർ ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.'))}
  AT.busy=false;if(V.s==='admin'&&V.sec==='att')render();
}
function atMark(id,v){AT.marks[id]=AT.marks[id]===v?'':v;render()}
function atAll(){atStu().forEach(s=>{AT.marks[s._id]='P'});render()}
async function atSave(){
  const [y,mo,day]=AT.date.split('-'),m=y+'-'+mo,dk=String(+day),st=atStu().filter(s=>AT.marks[s._id]);
  if(!st.length){toast('ആരെയും തിരഞ്ഞെടുത്തിട്ടില്ല');return}
  try{
    for(let i=0;i<st.length;i+=400){
      const b=writeBatch(db);
      st.slice(i,i+400).forEach(s=>b.set(doc(db,'students',s._id,'att',m),{m,d:{[dk]:AT.marks[s._id]}},{merge:true}));
      await tmo(b.commit(),20000);
    }
  }catch(e){console.error(e);toast(errMsg(e,'ഹാജർ സേവ് ചെയ്യാൻ കഴിഞ്ഞില്ല.'));return}
  toast('ഹാജർ സേവ് ചെയ്തു ✓');
}
function attPanel(){
  const st=atStu(),dt=new Date(AT.date+'T00:00:00'),wd=['ഞായർ','തിങ്കൾ','ചൊവ്വ','ബുധൻ','വ്യാഴം','വെള്ളി','ശനി'][dt.getDay()]||'';
  let h='<div class="fm" style="max-width:720px"><h3>ദിവസത്തെ ഹാജർ</h3><label for="a_c">ക്ലാസ്</label><select id="a_c" onchange="atSel()">'+CL.map(x=>'<option'+(x===AT.cls?' selected':'')+'>'+x+'</option>').join('')+'</select><label for="a_d">തീയതി ('+wd+')</label><input id="a_d" type="date" value="'+AT.date+'" onchange="atSel()"></div>';
  if(AT.busy)return h+'<div class="sk"><i></i><i></i><i></i></div>';
  if(!st.length)return h+'<div class="empty">ഈ ക്ലാസിൽ വിദ്യാർത്ഥികൾ ഇല്ല.</div>';
  const p=st.filter(s=>AT.marks[s._id]==='P').length,a=st.filter(s=>AT.marks[s._id]==='A').length;
  h+='<div class="sec" style="margin-top:18px"><h3>'+st.length+' വിദ്യാർത്ഥികൾ · ഹാജർ '+p+' · അഭാവം '+a+'</h3></div><button class="cta ghost" style="max-width:none;margin:0 0 12px" onclick="atAll()">എല്ലാവരെയും ഹാജർ ആക്കുക</button>';
  h+=st.map(s=>'<div class="ol"><div class="t">'+esc(s.name)+'<small>'+esc(s._id)+'</small></div><div class="pa"><button class="pab'+(AT.marks[s._id]==='P'?' p':'')+'" onclick="atMark(\''+s._id+'\',\'P\')">ഹാജർ</button><button class="pab'+(AT.marks[s._id]==='A'?' a':'')+'" onclick="atMark(\''+s._id+'\',\'A\')">അഭാവം</button></div></div>').join('');
  return h+'<button class="cta" style="max-width:none;margin-top:8px" onclick="atSave()">ഹാജർ സേവ് ചെയ്യുക</button>';
}

const KL={book:'മദ്റസ Book / Notes',syll:'Syllabus'};
let LB={step:'menu',kind:'',items:null,subs:[]};
async function fileBlob(col,f){
  const k=col+f._id;if(PB[k])return PB[k];
  const key='/_f/'+col+'/'+f._id+'/'+(f.v||f.ts||0)+'/'+(f.n||0);
  let b=await fcache.get(key);
  if(!b){
    const q=await tmo(getDocs(collection(db,col,f._id,'chunks')),30000);
    const bin=atob(q.docs.sort((a,b)=>a.id<b.id?-1:1).map(d=>d.data().d).join('')),u=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
    b=new Blob([u],{type:f.mime||'application/pdf'});fcache.put(key,b);
  }
  return PB[k]=b;
}
async function putFile(col,id,f,oldN){
  const isImg=/^image\//.test(f.type),cid=i=>String(i).padStart(3,'0');
  let b64,size,mime;
  if(isImg){const s=await shrink(f);b64=s.b64;size=s.size;mime='image/jpeg'}else{b64=await b64of(f);size=f.size;mime=/^audio\//.test(f.type)?f.type:'application/pdf'}
  const CH=700000,k=Math.ceil(b64.length/CH);
  for(let i=0;i<k;i++)await tmo(setDoc(doc(db,col,id,'chunks',cid(i)),{d:b64.slice(i*CH,(i+1)*CH)}),40000);
  for(let i=k;i<oldN;i++)await tmo(deleteDoc(doc(db,col,id,'chunks',cid(i))));
  return {n:k,size,mime};
}
async function rmChunks(col,id,n){for(let i=0;i<n;i++)await tmo(deleteDoc(doc(db,col,id,'chunks',String(i).padStart(3,'0'))))}
async function openLib(){
  V.s='lib';LB={step:'menu',kind:'',items:null,subs:[]};render();window.scrollTo(0,0);
  try{
    const c=collection(db,'lib'),cl=String(me.cls);
    const [a,b,s]=await tmo(Promise.all([getDocs(query(c,where('cls','==','All'))),getDocs(query(c,where('cls','==',cl))),getDocs(query(collection(db,'subjects'),where('cls','==',cl)))]),12000);
    LB.items=[...a.docs,...b.docs].map(d=>({_id:d.id,...d.data()})).sort((x,y)=>(x.ts||0)-(y.ts||0));
    LB.subs=s.docs.map(d=>({_id:d.id,...d.data()}));
  }catch(e){LB.items=[];toast(errMsg(e,'ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.'))}
  render();
}
function libPick(k){LB.kind=k;LB.step='list';render();window.scrollTo(0,0)}
function libBack(){if(LB.step==='list'){LB.step='menu';render()}else go(BK);window.scrollTo(0,0)}
function libView(){
  let h='<section class="scr"><div class="bar"><button onclick="libBack()" aria-label="Back">'+ico('back')+'</button><span>Notes &amp; Syllabus</span><span style="width:44px"></span></div>';
  if(LB.step==='menu')return h+'<p class="mu">ഒന്ന് തിരഞ്ഞെടുക്കൂ</p><div class="grid"><button class="cc" onclick="libPick(\'book\')"><div class="ic-wrap"><div class="ic">'+ico('book')+'</div></div><b>'+KL.book+'</b></button><button class="cc" onclick="libPick(\'syll\')"><div class="ic-wrap"><div class="ic">'+ico('clip')+'</div></div><b>'+KL.syll+'</b></button></div></section>';
  if(LB.items===null)return h+'<div class="sk"><i></i><i></i><i></i></div></section>';
  const l=LB.items.filter(x=>x.kind===LB.kind);
  h+='<h2 class="mh">'+KL[LB.kind]+'</h2>';
  if(!l.length)return h+'<div class="cs" style="margin-top:16px">Coming soon</div></section>';
  const row=x=>'<div class="ol"><div class="n">'+ico('file')+'</div><div class="t">'+esc(x.title)+'</div><button class="pl" onclick="libOpen(\''+x._id+'\',1)" aria-label="Share">'+ico('share')+'</button><button class="pl" onclick="libOpen(\''+x._id+'\',0)" aria-label="Open">'+ico('eye')+'</button></div>';
  if(LB.kind==='book'){
    const g={};l.forEach(x=>{(g[x.sub||'']=g[x.sub||'']||[]).push(x)});
    Object.keys(g).forEach(k=>{const s=LB.subs.find(z=>z._id===k);h+='<div class="eh"><span>'+esc(s?s.name:'മറ്റുള്ളവ')+'</span><span class="bd">'+g[k].length+'</span></div>'+g[k].map(row).join('')});
  }else h+='<div style="margin-top:14px">'+l.map(row).join('')+'</div>';
  return h+'</section>';
}
async function libOpen(id,share){
  const f=LB.items.find(x=>x._id===id);if(!f)return;
  const mime=f.mime||'application/pdf',name=f.title+(/^image\//.test(mime)?'.jpg':'.pdf');
  if(safe(f.url)){
    if(share&&navigator.share){try{await navigator.share({title:f.title,url:f.url});return}catch(e){}}
    window.open(f.url,'_blank','noopener');return;
  }
  let can=false;
  try{can=!!(share&&navigator.canShare&&navigator.canShare({files:[new File([''],name,{type:mime})]}))}catch(e){}
  const w=can?null:window.open('','_blank');
  toast('ലോഡ് ചെയ്യുന്നു…');
  try{
    const b=await fileBlob('lib',f);
    if(can){await navigator.share({files:[new File([b],name,{type:mime})],title:f.title});return}
    const u=URL.createObjectURL(b);
    if(w)w.location.href=u;else window.open(u,'_blank');
  }catch(e){
    if(w)w.close();
    if(e&&e.name==='NotAllowedError')toast('ഫയൽ തയ്യാറായി. ഒരിക്കൽ കൂടി അമർത്തൂ');
    else if(!(e&&e.name==='AbortError'))toast(errMsg(e,'തുറക്കാൻ കഴിഞ്ഞില്ല.'));
  }
}
function lstL(){
  const a=A('lib'),subs=A('subjects');
  if(!a.length)return '<div class="empty">ഒന്നുമില്ല. ചേർക്കൂ.</div>';
  return a.map(f=>{const s=subs.find(x=>x._id===f.sub);return '<div class="ol"><div class="n">'+ico('file')+'</div><div class="t">'+esc(f.title)+'<small>'+esc(KL[f.kind]||'')+' · ക്ലാസ് '+esc(f.cls)+(s?' · '+esc(s.name):'')+'</small></div><button class="pl" onclick="edit(\''+f._id+'\')" aria-label="Edit">'+ico('edit')+'</button><button class="pl'+(V.cd===f._id?' dng':'')+'" onclick="delL(\''+f._id+'\')" aria-label="Delete">'+ico('trash')+'</button></div>'}).join('');
}
function libPanel(){
  const e=V.ed?(A('lib').find(x=>x._id===V.ed)||{}):{},subs=A('subjects');
  return '<div class="adm"><div id="lst">'+lstL()+'</div><div class="fm"><h3>'+(V.ed?'തിരുത്തുക':'പുതിയത് ചേർക്കുക')+'</h3><label for="l_k">തരം</label><select id="l_k">'+Object.keys(KL).map(k=>'<option value="'+k+'"'+(k===e.kind?' selected':'')+'>'+KL[k]+'</option>').join('')+'</select><label for="l_c">ക്ലാസ്</label><select id="l_c">'+['All'].concat(CL).map(x=>'<option'+(String(x)===String(e.cls)?' selected':'')+'>'+x+'</option>').join('')+'</select><label for="l_s">വിഷയം (Book / Notes-ന് ഓപ്ഷണൽ)</label><select id="l_s"><option value="">— ഇല്ല —</option>'+subs.map(s=>'<option value="'+s._id+'"'+(s._id===e.sub?' selected':'')+'>ക്ലാസ് '+esc(s.cls)+' · '+esc(s.name)+'</option>').join('')+'</select><label for="l_t">തലക്കെട്ട്</label><input id="l_t" value="'+esc(e.title||'')+'"><label for="l_f">PDF അല്ലെങ്കിൽ ചിത്രം (PDF 6 MB വരെ)</label><input id="l_f" type="file" accept="application/pdf,image/*"><label for="l_u">അല്ലെങ്കിൽ Link (വലിയ Book-ന് Google Drive Link)</label><input id="l_u" value="'+esc(e.url||'')+'" placeholder="https://…">'+(V.ed&&(e.n||e.url)?'<p class="mu">ഇപ്പോൾ ഉള്ളത്: '+(e.n?'അപ്‌ലോഡ് ചെയ്ത ഫയൽ ('+Math.round((e.size||0)/1024)+' KB)':'Link')+'. പുതിയത് നൽകിയാൽ മാറും.</p>':'')+'<button class="cta" onclick="saveL()">'+(V.ed?'മാറ്റം സേവ് ചെയ്യുക':'ചേർക്കുക')+'</button>'+(V.ed?'<button class="cta ghost" onclick="edit(\'\')">റദ്ദാക്കുക</button>':'')+'</div></div>';
}
async function saveL(){
  const kind=$('l_k').value,cls=$('l_c').value,sub=$('l_s').value,title=$('l_t').value.trim(),url=$('l_u').value.trim(),f=$('l_f').files[0];
  const old=V.ed?A('lib').find(x=>x._id===V.ed):null;
  if(!title){toast('തലക്കെട്ട് നൽകൂ');return}
  if(url&&!/^https?:\/\//i.test(url)){toast('Link https:// ൽ തുടങ്ങണം');return}
  if(!f&&!url&&!(old&&(old.n||old.url))){toast('ഫയൽ തിരഞ്ഞെടുക്കൂ, അല്ലെങ്കിൽ Link നൽകൂ');return}
  if(f&&!/^image\//.test(f.type)&&f.type!=='application/pdf'){toast('PDF അല്ലെങ്കിൽ ചിത്രം മാത്രം തിരഞ്ഞെടുക്കൂ');return}
  if(f&&f.type==='application/pdf'&&f.size>6*1024*1024){toast('PDF 6 MB-ൽ കൂടുതലാണ്. ചെറുതാക്കൂ, അല്ലെങ്കിൽ Link നൽകൂ');return}
  const ref=old?doc(db,'lib',V.ed):doc(collection(db,'lib'));
  let n=old?(old.n||0):0,size=old?(old.size||0):0,u=old?(old.url||''):'',mime=old?(old.mime||''):'';
  try{
    if(f){toast('അപ്‌ലോഡ് ചെയ്യുന്നു… കാത്തിരിക്കൂ');const r=await putFile('lib',ref.id,f,n);n=r.n;size=r.size;mime=r.mime;u='';delete PB['lib'+ref.id]}
    else if(url){await rmChunks('lib',ref.id,n);n=0;size=0;mime='';u=url}
    await tmo(setDoc(ref,{kind,cls,sub,title,mime,url:u,n,size,v:f?Date.now():((old&&old.v)||0),ts:(old&&old.ts)||Date.now()}),12000);
  }catch(e){console.error(e);toast(errMsg(e,'സേവ് ചെയ്യാൻ കഴിഞ്ഞില്ല. ഫയൽ ശരിയാണോ എന്ന് നോക്കൂ.'));return}
  V.ed='';render();toast('സേവ് ചെയ്തു ✓');
}
async function delL(id){
  if(V.cd!==id){V.cd=id;refresh();toast('ഒഴിവാക്കാൻ ഒരിക്കൽ കൂടി അമർത്തൂ');return}
  V.cd='';
  try{
    const q=await getDocs(collection(db,'lib',id,'chunks'));
    await Promise.all(q.docs.map(d=>deleteDoc(d.ref)));
    await deleteDoc(doc(db,'lib',id));
  }catch(e){toast(errMsg(e,'ഒഴിവാക്കാൻ കഴിഞ്ഞില്ല.'))}
  refresh();
}

function liveView(){
  let h='<section class="scr"><div class="bar"><button onclick="goBack()" aria-label="Back">'+ico('back')+'</button><span>'+T.live[1]+'</span><span style="width:44px"></span></div>';
  if(LST===null)return h+'<div class="sk"><i></i><i></i><i></i></div></section>';
  if(!LST.length)return h+'<div class="lempty"><div class="ic">'+ico('video')+'</div><h2>ഇപ്പോൾ Live ക്ലാസ് ഷെഡ്യൂൾ ചെയ്തിട്ടില്ല</h2><p class="mu">പുതിയ ക്ലാസ് വരുമ്പോൾ ഇവിടെ കാണാം.</p></div></section>';
  const f=LST[0],rest=LST.slice(1);
  const join=x=>safe(x.url)?'<a class="cta" href="'+safe(x.url)+'" target="_blank" rel="noopener">'+ico('video')+' ക്ലാസിൽ ചേരൂ</a>':'<div class="mu" style="text-align:center;margin:0">ലിങ്ക് ഉടൻ ലഭിക്കും</div>';
  h+='<div class="lv"><span class="lt"><i></i>LIVE ക്ലാസ്</span><h2>'+esc(f.t)+'</h2><div class="tm">'+ico('cal')+'<span>'+esc(f.time)+'</span></div>'+join(f)+'</div>';
  if(rest.length)h+='<div class="sec"><h3>മറ്റ് ക്ലാസുകൾ</h3></div>'+rest.map(x=>'<div class="lc"><div class="r"><div class="ic sm">'+ico('video')+'</div><div class="pt2"><b>'+esc(x.t)+'</b><small>'+esc(x.time)+'</small></div></div>'+join(x)+'</div>').join('');
  return h+'</section>';
}

const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const starI=on=>ico('star').replace('class="i"','class="i star'+(on?' on':'')+'"');
let QZ={step:'sub',subs:null,sub:'',subn:'',chs:null,ch:'',all:[],qs:[],i:0,sc:0,pts:0,st:0,pick:-1,wrong:[]};
const qzBest=ch=>{try{return JSON.parse(localStorage.getItem('qb:'+me.id+':'+QZ.sub+':'+ch)||'null')}catch(e){return null}};
function qzSaveBest(){try{const k='qb:'+me.id+':'+QZ.sub+':'+QZ.ch,o=JSON.parse(localStorage.getItem(k)||'null'),n=QZ.qs.length;if(!o||QZ.sc/n>o.sc/o.n)localStorage.setItem(k,JSON.stringify({sc:QZ.sc,n}))}catch(e){}}
async function openQuiz(){
  V.s='quiz';QZ={step:'sub',subs:null,sub:'',subn:'',chs:null,ch:'',all:[],qs:[],i:0,sc:0,pts:0,st:0,pick:-1,wrong:[]};render();window.scrollTo(0,0);
  try{const r=await tmo(getDocs(query(collection(db,'subjects'),where('cls','==',String(me.cls)))),12000);QZ.subs=r.docs.map(d=>({_id:d.id,...d.data()}))}
  catch(e){QZ.subs=[];toast(errMsg(e,'ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.'))}
  render();
}
async function qzSub(id){
  const s=QZ.subs.find(x=>x._id===id);QZ.sub=id;QZ.subn=s?s.name:'';QZ.step='ch';QZ.chs=null;render();
  try{const m=await tmo(getDoc(doc(db,'quizmeta',id)),12000);QZ.chs=m.exists()?(m.data().ch||[]):[]}
  catch(e){QZ.chs=[];toast(errMsg(e,'ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.'))}
  render();
}
async function qzCh(i){
  QZ.ch=QZ.chs[i];QZ.step='load';render();
  try{const r=await tmo(getDocs(query(collection(db,'quiz'),where('cls','==',String(me.cls)),where('sub','==',QZ.sub),where('ch','==',QZ.ch))),12000);QZ.all=r.docs.map(d=>d.data())}
  catch(e){QZ.all=[];toast(errMsg(e,'ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.'))}
  qzStart();
}
function qzStart(){
  if(!QZ.all.length){QZ.step='empty';render();return}
  QZ.qs=shuf(QZ.all).slice(0,10).map(q=>({q:q.q,ex:q.ex||'',o:shuf(q.o.map((t,i)=>({t,ok:i===q.a})))}));
  QZ.i=0;QZ.sc=0;QZ.pts=0;QZ.st=0;QZ.pick=-1;QZ.wrong=[];QZ.step='play';render();window.scrollTo(0,0);
}
function qzAns(k){
  if(QZ.pick>=0)return;
  const q=QZ.qs[QZ.i];QZ.pick=k;
  if(q.o[k].ok){QZ.sc++;QZ.st++;QZ.pts+=10+(QZ.st>=3?5:0);sfx(true)}else{QZ.st=0;QZ.wrong.push(q);sfx(false)}
  render();
}
function qzNext(){
  if(QZ.i+1>=QZ.qs.length){QZ.step='res';QZ.cf=0;qzSaveBest();render();window.scrollTo(0,0);return}
  QZ.i++;QZ.pick=-1;render();window.scrollTo(0,0);
}
function qzBack(){
  if(QZ.step==='sub')go(BK);
  else if(QZ.step==='ch'){QZ.step='sub';render()}
  else{QZ.step='ch';render()}
  window.scrollTo(0,0);
}
function quizView(){
  let h='<section class="scr"><div class="bar"><button onclick="qzBack()" aria-label="Back">'+ico('back')+'</button><span>ക്വിസ്</span>'+(QZ.step==='play'?'<span class="pts">'+ico('star')+QZ.pts+'</span>':'<span style="width:44px"></span>')+'</div>';
  if(QZ.step==='sub'){
    if(QZ.subs===null)return h+'<div class="sk"><i></i><i></i><i></i></div></section>';
    if(!QZ.subs.length)return h+'<div class="empty">ഇപ്പോൾ ഒന്നുമില്ല.</div></section>';
    return h+'<p class="mu">ഒരു വിഷയം തിരഞ്ഞെടുക്കൂ</p><div class="grid">'+QZ.subs.map(s=>{const soon=s.soon==='Yes';return '<button class="cc sj" '+(soon?'disabled':'onclick="qzSub(\''+s._id+'\')"')+'><div class="ic-wrap"><div class="ic">'+ico('zap')+'</div></div>'+(s.ar?'<b class="ar" dir="auto">'+esc(s.ar)+'</b>':'')+'<b>'+esc(s.name)+'</b>'+(soon?'<div class="rb">COMING SOON</div>':'')+'</button>'}).join('')+'</div></section>';
  }
  if(QZ.step==='ch'){
    h+='<h2 class="mh">'+esc(QZ.subn)+'</h2><p class="mu">ഒരു ചാപ്റ്റർ തിരഞ്ഞെടുക്കൂ</p>';
    if(QZ.chs===null)return h+'<div class="sk"><i></i><i></i><i></i></div></section>';
    if(!QZ.chs.length)return h+'<div class="cs">ക്വിസ് ഉടൻ വരും</div></section>';
    return h+QZ.chs.map((c,i)=>{const b=qzBest(c),pc=b?b.sc/b.n:0,s=pc>=.9?3:pc>=.6?2:pc>=.3?1:0;return '<button class="px" onclick="qzCh('+i+')"><span class="pi">'+(i+1)+'</span><span class="pt"><b>'+esc(c)+'</b><small>'+(b?'മികച്ച സ്കോർ '+b.sc+' / '+b.n:'ഇതുവരെ കളിച്ചിട്ടില്ല')+'</small></span>'+(b?'<span class="mst">'+[1,2,3].map(x=>starI(x<=s)).join('')+'</span>':ico('right'))+'</button>'}).join('')+'</section>';
  }
  if(QZ.step==='load')return h+'<div class="sk"><i></i><i></i><i></i></div></section>';
  if(QZ.step==='empty')return h+'<div class="cs">ഈ ചാപ്റ്ററിൽ ചോദ്യങ്ങൾ ഉടൻ വരും</div></section>';
  if(QZ.step==='play'){
    const q=QZ.qs[QZ.i],n=QZ.qs.length,done=QZ.pick>=0;
    h+='<div class="qp"><i style="width:'+((QZ.i+(done?1:0))/n*100)+'%"></i></div><div class="qmeta"><span>ചോദ്യം '+(QZ.i+1)+' / '+n+'</span>'+(QZ.st>=2?'<span class="stk">'+ico('zap')+QZ.st+' തുടർച്ച</span>':'')+'</div>';
    h+='<div class="qc'+(done?'':' fresh')+'"><h2 dir="auto">'+esc(q.q)+'</h2></div>';
    h+=q.o.map((o,k)=>{let c='qo'+(done?'':' in');if(done){if(o.ok)c+=' ok';else if(k===QZ.pick)c+=' bad';else c+=' dim'}return '<button class="'+c+'"'+(done?'':' style="animation-delay:'+(k*70)+'ms"')+' '+(done?'disabled':'onclick="qzAns('+k+')"')+'><span class="lt2">'+'ABCD'[k]+'</span><span dir="auto">'+esc(o.t)+'</span></button>'}).join('');
    if(done){const ok=q.o[QZ.pick].ok;h+='<div class="qf '+(ok?'ok':'bad')+'"><b>'+(ok?'ശരി!'+(QZ.st>=3?' +5 ബോണസ്':''):'തെറ്റ്')+'</b>'+(q.ex?'<p>'+esc(q.ex)+'</p>':'')+'</div><button class="cta" style="max-width:none" onclick="qzNext()">'+(QZ.i+1>=n?'ഫലം കാണുക':'അടുത്തത്')+'</button>'}
    return h+'</section>';
  }
  const n=QZ.qs.length,pc=QZ.sc/n,s=pc>=.9?3:pc>=.6?2:pc>=.3?1:0;
  const msg=['സാരമില്ല, പാഠം ഒന്നുകൂടി വായിച്ച് വീണ്ടും ശ്രമിക്കൂ','പഠിച്ച് വീണ്ടും ശ്രമിക്കൂ','നന്നായി! ഇനിയും മെച്ചപ്പെടുത്താം','മാഷാ അല്ലാഹ്! മികച്ച പ്രകടനം'][s];
  h+='<div class="qr"><div class="stars">'+[1,2,3].map(x=>starI(x<=s)).join('')+'</div><h2><span data-cnt="'+QZ.sc+'">'+QZ.sc+'</span> / '+n+'</h2><p class="mu"><span data-cnt="'+QZ.pts+'">'+QZ.pts+'</span> പോയിന്റ്</p><p>'+msg+'</p><button class="cta" style="max-width:none" onclick="qzStart()">വീണ്ടും കളിക്കൂ</button><button class="cta ghost" style="max-width:none" onclick="qzBack()">ചാപ്റ്ററുകൾ</button></div>';
  if(QZ.wrong.length)h+='<div class="sec" style="margin-top:22px"><h3>വീണ്ടും ശ്രദ്ധിക്കാൻ</h3></div>'+QZ.wrong.map(q=>'<div class="ol"><div class="t" dir="auto">'+esc(q.q)+'<small>ശരിയുത്തരം: '+esc(q.o.find(o=>o.ok).t)+'</small></div></div>').join('');
  return h+'</section>';
}

let QA={sub:'',ch:'',meta:null,qs:null,ed:''};
async function qaLoad(){
  if(!QA.sub){render();return}
  QA.qs=null;render();
  try{
    const m=await tmo(getDoc(doc(db,'quizmeta',QA.sub)),12000);QA.meta=m.exists()?(m.data().ch||[]):[];
    if(QA.ch){const r=await tmo(getDocs(query(collection(db,'quiz'),where('sub','==',QA.sub),where('ch','==',QA.ch))),12000);QA.qs=r.docs.map(d=>({_id:d.id,...d.data()})).sort((a,b)=>(a.ts||0)-(b.ts||0))}
    else QA.qs=[];
  }catch(e){QA.qs=[];toast(errMsg(e,'ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.'))}
  render();
}
function qaSel(sub){
  const s=$('q_s'),c=$('q_c');
  if(sub){QA.sub=s?s.value:'';QA.ch='';QA.meta=null;QA.ed='';V.cd=''}
  else if(c){QA.ch=c.value.trim();QA.ed='';V.cd=''}
  qaLoad();
}
function qaChip(c){QA.ch=c;QA.ed='';V.cd='';qaLoad()}
function qaEdit(id){QA.ed=id;render()}
function parseQz(t){
  const out=[];
  t.replace(/\r/g,'').split(/\n\s*\n/).forEach(b=>{
    const L=b.split('\n').map(x=>x.trim()).filter(Boolean),q=[],o=[];let a=-1,ex='';
    L.forEach(l=>{
      let m;
      if((m=l.match(/^(?:ഉത്തരം|answer|ans)\s*[:\-]\s*\(?([A-Da-d1-4])/i)))a='abcd1234'.indexOf(m[1].toLowerCase())%4;
      else if((m=l.match(/^(?:വിശദീകരണം|explanation|exp)\s*[:\-]\s*(.+)$/i)))ex=m[1];
      else if((m=l.match(/^\(?([A-Da-d1-4])[\)\.]\s*(.+)$/))&&o.length<4)o.push(m[2]);
      else if(!o.length)q.push(l);
    });
    if(q.length&&o.length===4&&a>=0)out.push({q:q.join(' '),o,a,ex});
  });
  return out;
}
async function saveQz(){
  const s=A('subjects').find(x=>x._id===QA.sub);if(!s||!QA.ch){toast('വിഷയവും ചാപ്റ്ററും തിരഞ്ഞെടുക്കൂ');return}
  const q=$('z_q').value.trim(),o=[1,2,3,4].map(i=>$('z_o'+i).value.trim()),a=+$('z_a').value,ex=$('z_x').value.trim();
  if(!q||o.some(x=>!x)){toast('ചോദ്യവും 4 ഓപ്ഷനുകളും പൂരിപ്പിക്കൂ');return}
  const d={cls:String(s.cls),sub:QA.sub,ch:QA.ch,q,o,a,ex};
  try{
    if(QA.ed)await tmo(updateDoc(doc(db,'quiz',QA.ed),d));else await tmo(addDoc(collection(db,'quiz'),{...d,ts:Date.now()}));
    await tmo(setDoc(doc(db,'quizmeta',QA.sub),{cls:String(s.cls),ch:arrayUnion(QA.ch)},{merge:true}));
  }catch(e){console.error(e);toast(errMsg(e,'സേവ് ചെയ്യാൻ കഴിഞ്ഞില്ല.'));return}
  QA.ed='';toast('സേവ് ചെയ്തു ✓');qaLoad();
}
async function bulkQz(){
  const s=A('subjects').find(x=>x._id===QA.sub);if(!s||!QA.ch){toast('വിഷയവും ചാപ്റ്ററും തിരഞ്ഞെടുക്കൂ');return}
  const list=parseQz($('z_b').value);
  if(!list.length){toast('ചോദ്യങ്ങൾ വായിക്കാൻ കഴിഞ്ഞില്ല. മാതൃക ശ്രദ്ധിക്കൂ');return}
  try{
    for(let i=0;i<list.length;i+=300){
      const b=writeBatch(db);
      list.slice(i,i+300).forEach((x,j)=>b.set(doc(collection(db,'quiz')),{cls:String(s.cls),sub:QA.sub,ch:QA.ch,...x,ts:Date.now()+i+j}));
      await tmo(b.commit(),20000);
    }
    await tmo(setDoc(doc(db,'quizmeta',QA.sub),{cls:String(s.cls),ch:arrayUnion(QA.ch)},{merge:true}));
  }catch(e){console.error(e);toast(errMsg(e,'സേവ് ചെയ്യാൻ കഴിഞ്ഞില്ല.'));return}
  toast(list.length+' ചോദ്യങ്ങൾ ചേർത്തു ✓');qaLoad();
}
async function delQz(id){
  if(V.cd!==id){V.cd=id;render();toast('ഒഴിവാക്കാൻ ഒരിക്കൽ കൂടി അമർത്തൂ');return}
  V.cd='';
  try{await tmo(deleteDoc(doc(db,'quiz',id)))}catch(e){toast(errMsg(e,'ഒഴിവാക്കാൻ കഴിഞ്ഞില്ല.'))}
  qaLoad();
}
async function delCh(){
  if(V.cd!=='CH'){V.cd='CH';render();toast('ചാപ്റ്റർ മുഴുവൻ ഒഴിവാക്കാൻ ഒരിക്കൽ കൂടി അമർത്തൂ');return}
  V.cd='';
  try{
    for(let i=0;i<(QA.qs||[]).length;i+=400){const b=writeBatch(db);QA.qs.slice(i,i+400).forEach(x=>b.delete(doc(db,'quiz',x._id)));await tmo(b.commit(),20000)}
    await tmo(setDoc(doc(db,'quizmeta',QA.sub),{ch:arrayRemove(QA.ch)},{merge:true}));
  }catch(e){toast(errMsg(e,'ഒഴിവാക്കാൻ കഴിഞ്ഞില്ല.'));return}
  QA.ch='';qaLoad();
}
function quizPanel(){
  const subs=A('subjects');
  if(!subs.length)return '<div class="fm"><p>ആദ്യം "വിഷയങ്ങൾ" ടാബിൽ ക്ലാസും വിഷയവും ചേർക്കൂ.</p></div>';
  let h='<div class="fm" style="max-width:760px"><h3>ക്വിസ് ചോദ്യങ്ങൾ</h3><label for="q_s">വിഷയം</label><select id="q_s" onchange="qaSel(1)"><option value="">— തിരഞ്ഞെടുക്കൂ —</option>'+subs.map(s=>'<option value="'+s._id+'"'+(s._id===QA.sub?' selected':'')+'>ക്ലാസ് '+esc(s.cls)+' · '+esc(s.name)+'</option>').join('')+'</select>';
  if(QA.sub)h+='<label>നിലവിലെ ചാപ്റ്ററുകൾ</label><div class="chips">'+(QA.meta||[]).map(c=>'<button class="chip'+(c===QA.ch?' on':'')+'" data-c="'+esc(c)+'" onclick="qaChip(this.dataset.c)">'+esc(c)+'</button>').join('')+'</div><label for="q_c">ചാപ്റ്റർ പേര് (പുതിയതാണെങ്കിൽ ടൈപ്പ് ചെയ്യൂ, ഉദാ. അദ്ധ്യായം 1)</label><input id="q_c" value="'+esc(QA.ch)+'" onchange="qaSel(0)">';
  h+='</div>';
  if(!QA.sub||!QA.ch)return h;
  if(QA.qs===null)return h+'<div class="sk"><i></i><i></i><i></i></div>';
  const e=QA.ed?(QA.qs.find(x=>x._id===QA.ed)||{}):{},o=e.o||['','','',''];
  h+='<div class="adm"><div><div class="sec" style="margin-top:18px"><h3>'+QA.qs.length+' ചോദ്യങ്ങൾ</h3></div>'+(QA.qs.length?QA.qs.map(x=>'<div class="ol"><div class="t" dir="auto">'+esc(x.q)+'<small>ശരിയുത്തരം: '+esc((x.o||[])[x.a]||'')+'</small></div><button class="pl" onclick="qaEdit(\''+x._id+'\')" aria-label="Edit">'+ico('edit')+'</button><button class="pl'+(V.cd===x._id?' dng':'')+'" onclick="delQz(\''+x._id+'\')" aria-label="Delete">'+ico('trash')+'</button></div>').join('')+'<button class="cta ghost" style="max-width:none" onclick="delCh()">'+(V.cd==='CH'?'ഉറപ്പാണോ? ഒന്നുകൂടി അമർത്തൂ':'ഈ ചാപ്റ്റർ മുഴുവൻ ഒഴിവാക്കുക')+'</button>':'<div class="empty">ഒന്നുമില്ല. ചേർക്കൂ.</div>')+'</div>';
  h+='<div><div class="fm"><h3>'+(QA.ed?'ചോദ്യം തിരുത്തുക':'പുതിയ ചോദ്യം')+'</h3><label for="z_q">ചോദ്യം</label><textarea id="z_q" rows="3">'+esc(e.q||'')+'</textarea>'+[1,2,3,4].map(i=>'<label for="z_o'+i+'">ഓപ്ഷൻ '+'ABCD'[i-1]+'</label><input id="z_o'+i+'" value="'+esc(o[i-1]||'')+'">').join('')+'<label for="z_a">ശരിയുത്തരം</label><select id="z_a">'+[0,1,2,3].map(i=>'<option value="'+i+'"'+(i===e.a?' selected':'')+'>'+'ABCD'[i]+'</option>').join('')+'</select><label for="z_x">വിശദീകരണം (ഓപ്ഷണൽ)</label><textarea id="z_x" rows="2">'+esc(e.ex||'')+'</textarea><button class="cta" onclick="saveQz()">'+(QA.ed?'മാറ്റം സേവ് ചെയ്യുക':'ചേർക്കുക')+'</button>'+(QA.ed?'<button class="cta ghost" onclick="qaEdit(\'\')">റദ്ദാക്കുക</button>':'')+'</div>';
  h+='<div class="fm"><h3>ഒരുമിച്ച് ചേർക്കുക</h3><p class="mu">ഓരോ ചോദ്യത്തിനും ഇടയിൽ ഒരു ശൂന്യ വരി ഇടുക:<br>ചോദ്യം?<br>A) ...<br>B) ...<br>C) ...<br>D) ...<br>ഉത്തരം: B<br>വിശദീകരണം: ... (ഓപ്ഷണൽ)</p><textarea id="z_b" rows="8"></textarea><button class="cta" onclick="bulkQz()">എല്ലാം ചേർക്കുക</button></div></div></div>';
  return h;
}

const SU=[['الفاتحة','Al-Fatihah'],['البقرة','Al-Baqarah'],['آل عمران','Aal-Imran'],['النساء','An-Nisa'],['المائدة','Al-Maidah'],['الأنعام','Al-Anam'],['الأعراف','Al-Araf'],['الأنفال','Al-Anfal'],['التوبة','At-Tawbah'],['يونس','Yunus'],['هود','Hud'],['يوسف','Yusuf'],['الرعد','Ar-Rad'],['إبراهيم','Ibrahim'],['الحجر','Al-Hijr'],['النحل','An-Nahl'],['الإسراء','Al-Isra'],['الكهف','Al-Kahf'],['مريم','Maryam'],['طه','Ta-Ha'],['الأنبياء','Al-Anbiya'],['الحج','Al-Hajj'],['المؤمنون','Al-Muminun'],['النور','An-Nur'],['الفرقان','Al-Furqan'],['الشعراء','Ash-Shuara'],['النمل','An-Naml'],['القصص','Al-Qasas'],['العنكبوت','Al-Ankabut'],['الروم','Ar-Rum'],['لقمان','Luqman'],['السجدة','As-Sajdah'],['الأحزاب','Al-Ahzab'],['سبأ','Saba'],['فاطر','Fatir'],['يس','Ya-Sin'],['الصافات','As-Saffat'],['ص','Sad'],['الزمر','Az-Zumar'],['غافر','Ghafir'],['فصلت','Fussilat'],['الشورى','Ash-Shura'],['الزخرف','Az-Zukhruf'],['الدخان','Ad-Dukhan'],['الجاثية','Al-Jathiyah'],['الأحقاف','Al-Ahqaf'],['محمد','Muhammad'],['الفتح','Al-Fath'],['الحجرات','Al-Hujurat'],['ق','Qaf'],['الذاريات','Adh-Dhariyat'],['الطور','At-Tur'],['النجم','An-Najm'],['القمر','Al-Qamar'],['الرحمن','Ar-Rahman'],['الواقعة','Al-Waqiah'],['الحديد','Al-Hadid'],['المجادلة','Al-Mujadila'],['الحشر','Al-Hashr'],['الممتحنة','Al-Mumtahanah'],['الصف','As-Saff'],['الجمعة','Al-Jumuah'],['المنافقون','Al-Munafiqun'],['التغابن','At-Taghabun'],['الطلاق','At-Talaq'],['التحريم','At-Tahrim'],['الملك','Al-Mulk'],['القلم','Al-Qalam'],['الحاقة','Al-Haqqah'],['المعارج','Al-Maarij'],['نوح','Nuh'],['الجن','Al-Jinn'],['المزمل','Al-Muzzammil'],['المدثر','Al-Muddaththir'],['القيامة','Al-Qiyamah'],['الإنسان','Al-Insan'],['المرسلات','Al-Mursalat'],['النبأ','An-Naba'],['النازعات','An-Naziat'],['عبس','Abasa'],['التكوير','At-Takwir'],['الانفطار','Al-Infitar'],['المطففين','Al-Mutaffifin'],['الانشقاق','Al-Inshiqaq'],['البروج','Al-Buruj'],['الطارق','At-Tariq'],['الأعلى','Al-Ala'],['الغاشية','Al-Ghashiyah'],['الفجر','Al-Fajr'],['البلد','Al-Balad'],['الشمس','Ash-Shams'],['الليل','Al-Layl'],['الضحى','Ad-Duha'],['الشرح','Ash-Sharh'],['التين','At-Tin'],['العلق','Al-Alaq'],['القدر','Al-Qadr'],['البينة','Al-Bayyinah'],['الزلزلة','Az-Zalzalah'],['العاديات','Al-Adiyat'],['القارعة','Al-Qariah'],['التكاثر','At-Takathur'],['العصر','Al-Asr'],['الهمزة','Al-Humazah'],['الفيل','Al-Fil'],['قريش','Quraysh'],['الماعون','Al-Maun'],['الكوثر','Al-Kawthar'],['الكافرون','Al-Kafirun'],['النصر','An-Nasr'],['المسد','Al-Masad'],['الإخلاص','Al-Ikhlas'],['الفلق','Al-Falaq'],['الناس','An-Nas']];
const p3=n=>String(n).padStart(3,'0');
const AU=new Audio();AU.preload='none';
let QCL=[],QAV=[],QRC='',QP={n:0};
const fmt=s=>{s=Math.floor(s||0);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
AU.ontimeupdate=()=>{const r=$('qpr'),t=$('qpt');if(r&&AU.duration)r.value=AU.currentTime/AU.duration*100;if(t)t.textContent=fmt(AU.currentTime)+' / '+fmt(AU.duration)};
const qBtn=()=>{const b=$('qpb');if(b)b.innerHTML=ico(AU.paused?'play2':'pause');const m=document.querySelector('.mp');if(m)m.classList.toggle('playing',!AU.paused)};
AU.onplay=qBtn;AU.onpause=qBtn;
AU.onended=()=>qNext(1);
async function homeData(){
  const [a,b,c,q]=await tmo(Promise.all([fetchK('slides'),fetchK('live'),fetchK('ann'),getDoc(doc(db,'config','quran'))]),12000);
  SL=a;LV=b;AN=c;const d=q.exists()?q.data():{};QCL=d.classes||[];QAV=d.avail||[];QRC=d.rc||'';
}
function openQuran(){V.s='quran';render();window.scrollTo(0,0)}
function quranView(){
  let h='<section class="scr"><div class="bar"><button onclick="goBack()" aria-label="Back">'+ico('back')+'</button><span>ഖുർആൻ</span><span style="width:44px"></span></div>';
  if(QRC)h+='<p class="mu" style="text-align:center">ഖാരിഅ്: '+esc(QRC)+'</p>';
  const l=[...QAV].sort((a,b)=>a-b).filter(n=>SU[n-1]);
  if(!l.length)return h+'<div class="cs">ഓഡിയോ ഉടൻ ലഭ്യമാകും</div></section>';
  return h+'<div class="grid">'+l.map(n=>'<button class="sr'+(QP.n===n?' on':'')+'" onclick="qPlay('+n+')"><span class="no">'+n+'</span><span class="sw">سورة</span><span class="an" lang="ar" dir="rtl">'+SU[n-1][0]+'</span><small>'+SU[n-1][1]+'</small></button>').join('')+'</div></section>';
}
function miniPlayer(){
  const s=SU[QP.n-1];
  return '<div class="mp'+(AU.paused?'':' playing')+'"><div class="mpi"><b class="an2" lang="ar" dir="rtl">'+s[0]+'</b><small>'+s[1]+'</small><span class="eq"><i></i><i></i><i></i></span></div><input id="qpr" type="range" min="0" max="100" step="0.1" value="'+(AU.duration?AU.currentTime/AU.duration*100:0)+'" oninput="qSeek(this.value)" aria-label="Seek"><span id="qpt" class="tm2">'+fmt(AU.currentTime)+' / '+fmt(AU.duration)+'</span><button class="pp" id="qpb" onclick="qToggle()" aria-label="Play or pause">'+ico(AU.paused?'play2':'pause')+'</button><button class="pp sm" onclick="qNext(-1)" aria-label="Previous">'+ico('skipb')+'</button><button class="pp sm" onclick="qNext(1)" aria-label="Next">'+ico('skipf')+'</button><button class="pp sm xc" onclick="qClose()" aria-label="Close">'+ico('close')+'</button></div>';
}
function setMedia(n){
  try{
    if(!('mediaSession' in navigator))return;
    navigator.mediaSession.metadata=new MediaMetadata({title:'سورة '+SU[n-1][0],artist:QRC||'Thamheed Academy',album:'Quran'});
    navigator.mediaSession.setActionHandler('play',()=>AU.play());
    navigator.mediaSession.setActionHandler('pause',()=>AU.pause());
    navigator.mediaSession.setActionHandler('nexttrack',()=>qNext(1));
    navigator.mediaSession.setActionHandler('previoustrack',()=>qNext(-1));
  }catch(e){}
}
async function qPlay(n){
  QP.n=n;render();
  try{
    const id=p3(n),s=await tmo(getDoc(doc(db,'quran',id)),12000);
    if(!s.exists()){toast('ഈ സൂറത്തിന്റെ ഓഡിയോ ലഭ്യമല്ല');QP.n=0;render();return}
    const d=s.data();let src=d.url;
    if(!src){const b=await fileBlob('quran',{_id:id,v:d.v,ts:d.ts,n:d.n,mime:d.mime||'audio/mpeg'});src=URL.createObjectURL(b)}
    AU.src=src;await AU.play();setMedia(n);
  }catch(e){console.error(e);toast(errMsg(e,'പ്ലേ ചെയ്യാൻ കഴിഞ്ഞില്ല. ഇന്റർനെറ്റ് / ഫയൽ പരിശോധിക്കൂ.'))}
  render();
}
function qClose(){try{AU.pause();AU.currentTime=0}catch(e){}QP.n=0;try{if('mediaSession' in navigator)navigator.mediaSession.metadata=null}catch(e){}render()}
function qToggle(){if(AU.paused)AU.play().catch(()=>{});else AU.pause()}
function qSeek(v){if(AU.duration)AU.currentTime=v/100*AU.duration}
function qNext(d){
  const l=[...QAV].sort((a,b)=>a-b),m=l[l.indexOf(QP.n)+d];
  if(m)qPlay(m);else{AU.pause();render()}
}

function lstQ(){
  const a=A('quran').slice().sort((x,y)=>(x.sn||0)-(y.sn||0));
  if(!a.length)return '<div class="empty">ഒന്നുമില്ല. ചേർക്കൂ.</div>';
  return a.map(x=>{const s=SU[(x.sn||1)-1]||['',''];return '<div class="ol"><div class="n">'+x.sn+'</div><div class="t"><span class="an2" lang="ar" dir="rtl">'+s[0]+'</span><small>'+s[1]+' · '+(x.n?'അപ്‌ലോഡ് ('+Math.round((x.size||0)/1024)+' KB)':'Link')+'</small></div><button class="pl'+(V.cd===x._id?' dng':'')+'" onclick="delSu(\''+x._id+'\')" aria-label="Delete">'+ico('trash')+'</button></div>'}).join('');
}
function quranPanel(){
  const c=DA.cfgq||{},cl=c.classes||[];
  return '<div class="fm" style="max-width:720px"><h3>ഖുർആൻ ലഭ്യമാകേണ്ട ക്ലാസുകൾ</h3><p class="mu">ഇവിടെ തിരഞ്ഞെടുക്കുന്ന ക്ലാസിലെ വിദ്യാർത്ഥികൾക്ക് മാത്രമേ ഖുർആൻ ടൈൽ കാണൂ.</p><div class="cbs">'+CL.map(x=>'<label class="cb"><input type="checkbox" class="qcb" value="'+x+'"'+(cl.includes(x)?' checked':'')+'>'+x+'</label>').join('')+'</div><label for="s_r">ഖാരിഅ് (പാരായണം ചെയ്യുന്നയാൾ, ഓപ്ഷണൽ)</label><input id="s_r" value="'+esc(c.rc||'')+'"><button class="cta" onclick="saveQC()">ക്ലാസുകൾ സേവ് ചെയ്യുക</button></div>'
  +'<div class="adm"><div id="lst">'+lstQ()+'</div><div><div class="fm"><h3>സൂറത്ത് ഓഡിയോ ചേർക്കുക</h3><label for="s_n">സൂറത്ത്</label><select id="s_n">'+SU.map((s,i)=>'<option value="'+(i+1)+'">'+(i+1)+'. '+s[0]+' · '+s[1]+(A('quran').some(x=>x.sn===i+1)?' ✓':'')+'</option>').join('')+'</select><label for="s_f">MP3 ഫയൽ (6 MB വരെ)</label><input id="s_f" type="file" accept="audio/*"><label for="s_u">അല്ലെങ്കിൽ MP3 Link (വലിയ സൂറത്തുകൾക്ക്)</label><input id="s_u" placeholder="https://…/002.mp3"><button class="cta" onclick="saveSu()">ചേർക്കുക</button></div>'
  +'<div class="fm"><h3>എല്ലാ സൂറത്തിനും ഒരുമിച്ച് ലിങ്ക്</h3><p class="mu">ലിങ്കിൽ സൂറത്ത് നമ്പർ വരേണ്ട സ്ഥാനത്ത് {nnn} (001, 002…) അല്ലെങ്കിൽ {n} (1, 2…) എഴുതുക. ഉദാ. https://example.com/audio/{nnn}.mp3. അപ്‌ലോഡ് ചെയ്ത സൂറത്തുകൾ മാറില്ല.</p><input id="s_t" placeholder="https://…/{nnn}.mp3"><button class="cta" onclick="applySu()">114 സൂറത്തിനും ബാധകമാക്കുക</button></div></div></div>';
}
async function saveQC(){
  const classes=[...document.querySelectorAll('.qcb')].filter(x=>x.checked).map(x=>x.value),rc=$('s_r').value.trim();
  try{await tmo(setDoc(doc(db,'config','quran'),{classes,rc},{merge:true}))}catch(e){toast(errMsg(e,'സേവ് ചെയ്യാൻ കഴിഞ്ഞില്ല.'));return}
  toast('സേവ് ചെയ്തു ✓');
}
const setAvail=arr=>tmo(setDoc(doc(db,'config','quran'),{avail:[...new Set(arr)].sort((a,b)=>a-b)},{merge:true}));
async function saveSu(){
  const n=+$('s_n').value,f=$('s_f').files[0],url=$('s_u').value.trim(),id=p3(n),old=A('quran').find(x=>x._id===id);
  if(!f&&!url){toast('MP3 തിരഞ്ഞെടുക്കൂ, അല്ലെങ്കിൽ Link നൽകൂ');return}
  if(url&&!/^https?:\/\//i.test(url)){toast('Link https:// ൽ തുടങ്ങണം');return}
  if(f&&!/^audio\//.test(f.type)){toast('MP3 / ഓഡിയോ ഫയൽ മാത്രം');return}
  if(f&&f.size>6*1024*1024){toast('ഫയൽ 6 MB-ൽ കൂടുതലാണ്. Link നൽകൂ');return}
  let nn=old?(old.n||0):0,size=0,u='',mime='audio/mpeg';
  try{
    if(f){toast('അപ്‌ലോഡ് ചെയ്യുന്നു… കാത്തിരിക്കൂ');const r=await putFile('quran',id,f,nn);nn=r.n;size=r.size;mime=r.mime;delete PB['quran'+id]}
    else{await rmChunks('quran',id,nn);nn=0;u=url}
    await tmo(setDoc(doc(db,'quran',id),{sn:n,url:u,mime,n:nn,size,v:Date.now(),ts:(old&&old.ts)||Date.now()}),12000);
    await setAvail(A('quran').map(x=>x.sn).concat(n));
  }catch(e){console.error(e);toast(errMsg(e,'സേവ് ചെയ്യാൻ കഴിഞ്ഞില്ല.'));return}
  toast('സേവ് ചെയ്തു ✓');
}
async function applySu(){
  const t=$('s_t').value.trim();
  if(!/^https?:\/\//i.test(t)||!/\{n{1,3}\}/.test(t)){toast('ലിങ്കിൽ {nnn} അല്ലെങ്കിൽ {n} വേണം');return}
  const up=new Set(A('quran').filter(x=>x.n).map(x=>x._id)),b=writeBatch(db);
  for(let i=1;i<=114;i++){const id=p3(i);if(up.has(id))continue;b.set(doc(db,'quran',id),{sn:i,url:t.replace(/\{nnn\}/g,id).replace(/\{n\}/g,String(i)),mime:'audio/mpeg',n:0,size:0,v:Date.now(),ts:Date.now()})}
  try{await tmo(b.commit(),20000);await setAvail(Array.from({length:114},(_,i)=>i+1))}catch(e){console.error(e);toast(errMsg(e,'സേവ് ചെയ്യാൻ കഴിഞ്ഞില്ല.'));return}
  toast('എല്ലാ സൂറത്തുകളും ചേർത്തു ✓');
}
async function delSu(id){
  if(V.cd!==id){V.cd=id;refresh();toast('ഒഴിവാക്കാൻ ഒരിക്കൽ കൂടി അമർത്തൂ');return}
  V.cd='';const x=A('quran').find(z=>z._id===id);
  try{
    await rmChunks('quran',id,x?(x.n||0):0);await tmo(deleteDoc(doc(db,'quran',id)));
    await setAvail(A('quran').filter(z=>z._id!==id).map(z=>z.sn));
  }catch(e){toast(errMsg(e,'ഒഴിവാക്കാൻ കഴിഞ്ഞില്ല.'))}
  refresh();
}

const FONTS=[
 ['def','ഡിഫോൾട്ട് (Outfit)','','"Outfit","Noto Sans Malayalam",system-ui,sans-serif'],
 ['manjari','Manjari (മഞ്ജരി)','Manjari:wght@400;700','"Manjari","Noto Sans Malayalam",sans-serif'],
 ['notos','Noto Sans Malayalam','','"Noto Sans Malayalam","Outfit",sans-serif'],
 ['notoserif','Noto Serif Malayalam','Noto+Serif+Malayalam:wght@400;700','"Noto Serif Malayalam","Noto Sans Malayalam",serif'],
 ['anek','Anek Malayalam','Anek+Malayalam:wght@400;700','"Anek Malayalam","Noto Sans Malayalam",sans-serif'],
 ['baloo','Baloo Chettan 2','Baloo+Chettan+2:wght@400;700','"Baloo Chettan 2","Noto Sans Malayalam",sans-serif'],
 ['gayathri','Gayathri (ഗായത്രി)','Gayathri:wght@400;700','"Gayathri","Noto Sans Malayalam",sans-serif'],
 ['chilanka','Chilanka (ചിലങ്ക)','Chilanka','"Chilanka","Noto Sans Malayalam",cursive']
];
const FSZ=[['s','ചെറുത്'],['n','സാധാരണം'],['l','വലുത്'],['xl','വളരെ വലുത്']];
const THM=[['auto','ഓട്ടോ'],['light','ലൈറ്റ്'],['dark','ഡാർക്ക്']];
let ST={font:'def',fs:'n',th:'auto'},AM=false;
try{ST={...ST,...JSON.parse(localStorage.getItem('ta_set')||'{}')}}catch(e){}
const fontOn={};
function loadFont(id){
  const f=FONTS.find(x=>x[0]===id);
  if(!f||!f[2]||fontOn[id])return;
  fontOn[id]=1;
  const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family='+f[2]+'&display=swap';
  document.head.appendChild(l);
}
function applySet(){
  const f=FONTS.find(x=>x[0]===ST.font)||FONTS[0],r=document.documentElement;
  loadFont(f[0]);
  r.style.setProperty('--ff',f[3]);
  r.setAttribute('data-fs',ST.fs);
  if(ST.th==='auto')r.removeAttribute('data-theme');else r.setAttribute('data-theme',ST.th);
}
function setOpt(k,v){ST[k]=v;try{localStorage.setItem('ta_set',JSON.stringify(ST))}catch(e){}applySet();render()}
async function clearFiles(){
  try{await caches.delete('thamheed-files')}catch(e){}
  Object.keys(PB).forEach(k=>delete PB[k]);
  toast('ഡൗൺലോഡ് ചെയ്ത ഫയലുകൾ ഒഴിവാക്കി ✓');
}
function amToggle(){AM=!AM;render()}
function setView(){
  FONTS.forEach(f=>loadFont(f[0]));
  let h='<section class="scr"><div class="bar"><button onclick="go(\''+(me?'home':'admin')+'\')" aria-label="Back">'+ico('back')+'</button><span>സെറ്റിംഗ്സ്</span><span style="width:44px"></span></div>';
  h+='<div class="stc"><h3>ഫോണ്ട് (അക്ഷര ശൈലി)</h3>'+FONTS.map(f=>'<button class="fo'+(ST.font===f[0]?' on':'')+'" onclick="setOpt(\'font\',\''+f[0]+'\')"><span class="fs" style="font-family:'+f[3].replace(/"/g,"'")+'">അസ്സലാമു അലൈക്കും · Thamheed</span><small>'+f[1]+'</small>'+(ST.font===f[0]?ico('tick'):'')+'</button>').join('')+'</div>';
  h+='<div class="stc"><h3>അക്ഷര വലുപ്പം</h3><div class="seg">'+FSZ.map(f=>'<button class="'+(ST.fs===f[0]?'on':'')+'" onclick="setOpt(\'fs\',\''+f[0]+'\')">'+f[1]+'</button>').join('')+'</div></div>';
  h+='<div class="stc"><h3>തീം</h3><div class="seg">'+THM.map(f=>'<button class="'+(ST.th===f[0]?'on':'')+'" onclick="setOpt(\'th\',\''+f[0]+'\')">'+f[1]+'</button>').join('')+'</div></div>';
  h+='<div class="stc"><h3>സ്റ്റോറേജ്</h3><p class="stn">തുറന്ന PDF, ഓഡിയോ ഫയലുകൾ ഫോണിൽ സൂക്ഷിക്കും. സ്ഥലം വേണമെങ്കിൽ ഒഴിവാക്കാം.</p><button class="cta ghost" style="max-width:none;margin:0" onclick="clearFiles()">ഡൗൺലോഡ് ചെയ്ത ഫയലുകൾ ഒഴിവാക്കുക</button></div>';
  h+='<div class="stc"><h3>ആപ്പ്</h3>'+instHelp()+(instBtn()||'<p class="stn" style="margin:0">ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്തിട്ടുണ്ട് ✓</p>')+'</div>';
  return h+'</section>';
}
applySet();

function ytId(u){
  const m=String(u||'').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/);
  return m?m[1]:'';
}
const ytList=u=>{const m=String(u||'').match(/[?&]list=([\w-]+)/);return m?m[1]:''};
const ytThumb=id=>'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg';
let YT={cur:''};
function ytPlay(id){try{AU.pause()}catch(e){}YT.cur=id;render();window.scrollTo(0,0)}
function ytBack(){if(YT.cur){YT.cur='';render()}else go(BK);window.scrollTo(0,0)}
function ytSrc(u){
  const id=ytId(u),ls=ytList(u),q='autoplay=1&rel=0&modestbranding=1&playsinline=1';
  if(id)return 'https://www.youtube-nocookie.com/embed/'+id+'?'+q+(ls?'&list='+ls:'');
  if(ls)return 'https://www.youtube-nocookie.com/embed/videoseries?list='+ls+'&'+q;
  return '';
}
function ytCard(x){
  const id=ytId(x.url),th=id?'background-image:url('+ytThumb(id)+')':'';
  return '<button class="yc" onclick="'+(ytSrc(x.url)?'ytPlay(\''+x._id+'\')':'window.open(\''+safe(x.url)+'\',\'_blank\',\'noopener\')')+'"><span class="ytn" style="'+th+'"><span class="pb2"><svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span></span><span class="ytt">'+esc(x.t)+'</span></button>';
}
function ytView(){
  let h='<section class="scr"><div class="bar"><button onclick="ytBack()" aria-label="Back">'+ico('back')+'</button><span>'+T.yt[1]+'</span><span style="width:44px"></span></div>';
  if(LST===null)return h+'<div class="sk"><i></i><i></i><i></i></div></section>';
  if(!LST.length)return h+'<div class="empty">ഇപ്പോൾ ഒന്നുമില്ല.</div></section>';
  const cur=YT.cur?LST.find(x=>x._id===YT.cur):null;
  if(cur){
    h+='<div class="yp"><iframe src="'+ytSrc(cur.url)+'" title="'+esc(cur.t)+'" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><h2 class="yh">'+esc(cur.t)+'</h2>';
    if(safe(cur.url))h+='<a class="cta ghost" style="max-width:none;margin-top:6px" href="'+safe(cur.url)+'" target="_blank" rel="noopener">'+ico('ext')+' YouTube-ൽ തുറക്കുക</a>';
    const rest=LST.filter(x=>x._id!==cur._id);
    if(rest.length)h+='<div class="sec" style="margin-top:22px"><h3>മറ്റ് വീഡിയോകൾ</h3></div><div class="ygrid">'+rest.map(ytCard).join('')+'</div>';
    return h+'</section>';
  }
  return h+'<div class="ygrid">'+LST.map(ytCard).join('')+'</div></section>';
}

let MEF=false;
function goBack(){go(BK)}
function navTo(k){BK='home';if(k==='quiz')openQuiz();else openQuran()}
function meOut(){
  if(!MEF){MEF=true;render();setTimeout(()=>{MEF=false;if(V.s==='me')render()},4000);return}
  MEF=false;out();
}
function studyView(){
  const tl=(ic,lb,act,dot)=>'<button class="cc" onclick="'+act+'">'+(dot?'<span class="ld"></span>':'')+'<div class="ic-wrap"><div class="ic">'+ico(ic)+'</div></div><b>'+lb+'</b></button>';
  return '<section class="scr"><div class="top"><div><small>പഠനം</small><h2>എന്താണ് പഠിക്കേണ്ടത്?</h2></div></div><div class="grid">'
    +tl(T.live[0],T.live[1],"openList('live')",LV&&LV.length)
    +tl(T.yt[0],T.yt[1],"openList('yt')",0)
    +tl(T.notes[0],T.notes[1],"openList('notes')",0)
    +tl('file','Model Paper',"openMP()",0)
    +tl(T.tt[0],T.tt[1],"openList('tt')",0)
    +'</div></section>';
}

function resizeImage(file, maxSize = 200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) { height = Math.round(height * (maxSize / width)); width = maxSize; }
        } else {
          if (height > maxSize) { width = Math.round(width * (maxSize / height)); height = maxSize; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
async function uploadPhoto(e){
  const file = e.target.files && e.target.files[0];
  e.target.value = ''; 
  if(!file) return;
  toast('ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുന്നു...');
  try {
    const base64 = await resizeImage(file, 200);
    await tmo(setDoc(doc(db, 'students', me.id), { photo: base64 }, { merge: true }));
    me.photo = base64; 
    render();
    toast('ഫോട്ടോ മാറ്റി ✓');
  } catch (err) {
    console.error(err);
    toast(errMsg(err, 'ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല'));
  }
}
async function removePhoto(){
  if(!confirm('ഫോട്ടോ ഒഴിവാക്കണോ?')) return;
  try {
    await tmo(updateDoc(doc(db, 'students', me.id), { photo: null }));
    delete me.photo;
    render();
    toast('ഫോട്ടോ ഒഴിവാക്കി ✓');
  } catch (err) {
    toast('ഒഴിവാക്കാൻ കഴിഞ്ഞില്ല');
  }
}
function meView(){
  const ini=String(me.name||'?').trim().charAt(0).toUpperCase();
  const avatarHtml = me.photo 
    ? '<img src="'+me.photo+'" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">' 
    : esc(ini);

  const pencilIcon = `<div style="position:absolute; bottom:0; right:0; background:var(--g); color:#fff; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.2); border:3px solid var(--card); font-size:14px;">✏️</div>`;
  const trashIcon = me.photo ? `<div onclick="event.stopPropagation(); removePhoto();" style="position:absolute; top:0; right:0; background:#e0574d; color:#fff; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.2); border:3px solid var(--card); font-size:12px; font-weight:bold; z-index:2;">✕</div>` : '';

  const row=(ic,t,s,act,cl)=>'<button class="ol rowb'+(cl?' '+cl:'')+'" onclick="'+act+'"><div class="n">'+ico(ic)+'</div><div class="t">'+t+(s?'<small>'+s+'</small>':'')+'</div>'+(cl?'':ico('right'))+'</button>';
  
  return '<section class="scr">'+instHelp()
    +'<div class="mecard" style="display:flex; flex-direction:column; align-items:center; text-align:center; gap:14px; padding:28px 16px; background:var(--card); border-radius:24px; box-shadow:var(--sh); margin-bottom:20px;">'
      
      +'<div style="position:relative; width:100px; height:100px; cursor:pointer;" onclick="document.getElementById(\'photo-input\').click()">'
        +'<div class="av" style="width:100%; height:100%; font-size:40px; position:relative; display:flex; align-items:center; justify-content:center; background:var(--g); color:#fff; border-radius:50%; border:3px solid var(--bg); box-shadow:0 4px 12px rgba(0,0,0,0.1);">'
          +avatarHtml
        +'</div>'
        +pencilIcon
        +trashIcon
        +'<input type="file" id="photo-input" accept="image/*" style="display:none" onchange="uploadPhoto(event)">'
      +'</div>'
      
      +'<div>'
        +'<b style="font-size:22px; color:var(--text); display:block; margin-bottom:6px;">'+esc(me.name)+'</b>'
        +'<span class="tag" style="display:inline-block; font-size:14px; padding:6px 14px;">ക്ലാസ് '+esc(me.cls)+'</span>'
      +'</div>'
      
    +'</div>'
    +row('check','ഹാജർ','മാസം തിരിച്ചുള്ള കലണ്ടർ',"openList('att')")
    +(isStandalone()?'':row('dl','ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യൂ','ഹോം സ്ക്രീനിൽ ഐക്കൺ ചേർക്കാൻ',"doInstall()"))
    +row('out',MEF?'ഉറപ്പാണോ? ഒരിക്കൽ കൂടി അമർത്തുക':'Exit (ലോഗൗട്ട്)','വീണ്ടും Student ID നൽകേണ്ടി വരും',"meOut()",'dng')
    +'</section>';
}
function navh(){
  const s=V.s,k=V.k,nb=(AN||[]).filter(x=>x.imp==='Yes'||(x.ts&&Date.now()-x.ts<3*864e5)).length;
  const B=(on,act,ic,lb,bd)=>'<button class="'+(on?'on':'')+'" onclick="'+act+'">'+ico(ic)+'<span>'+lb+'</span>'+(bd?'<b class="bdg">'+bd+'</b>':'')+'</button>';
  let h='<nav><div class="brand"><img src="icon-192.png" alt=""><b>Thamheed Academy</b></div>';
  if(me){
    h+=B(s==='home'||(s==='list'&&k==='ann'),"go('home')",'home','Home',s==='home'?0:nb);
    h+=B(s==='study'||s==='mp'||s==='lib'||(s==='list'&&['live','yt','notes','tt'].includes(k)),"go('study')",'layers','പഠനം',0);
    h+=B(s==='quiz',"navTo('quiz')",'zap','ക്വിസ്',0);
    if(QCL.includes(String(me.cls)))h+=B(s==='quran',"navTo('quran')",'quran','ഖുർആൻ',0);
    h+=B(s==='me'||(s==='list'&&k==='att'),"go('me')",'user','ഞാൻ',0);
  }
  if(adm)h+=B(s==='set',"go('set')",'sliders','Settings',0)+B(s==='admin',"go('admin')",'shield','Admin',0)+B(false,'out()','out','Exit',0);
  return h+'</nav>';
}
const RM=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
function confetti(){
  const c=document.createElement('div');c.className='cf';c.setAttribute('aria-hidden','true');
  const cols=['#8fd100','#f2b705','#e0574d','#625d80','#2f9bff'];
  for(let i=0;i<30;i++){
    const p=document.createElement('i');
    p.style.left=(Math.random()*100)+'%';p.style.background=cols[i%cols.length];
    p.style.animationDelay=(Math.random()*.7)+'s';p.style.animationDuration=(1.7+Math.random()*1.3)+'s';
    c.appendChild(p);
  }
  document.body.appendChild(c);setTimeout(()=>c.remove(),3800);
}
function anim(){
  if(RM())return;
  document.querySelectorAll('[data-cnt]').forEach(el=>{
    const to=+el.getAttribute('data-cnt');if(!to)return;
    const t0=performance.now(),d=750;
    const f=t=>{const p=Math.min(1,(t-t0)/d);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)};
    el.textContent='0';requestAnimationFrame(f);
  });
  if(V.s==='quiz'&&QZ.step==='res'&&!QZ.cf){QZ.cf=1;if(QZ.qs&&QZ.qs.length&&QZ.sc/QZ.qs.length>=.9)confetti()}
}
function render(){
  if((V.s==='home'||V.s==='list'||V.s==='mp'||V.s==='lib'||V.s==='quiz'||V.s==='quran'||V.s==='study'||V.s==='me')&&!me)V.s='login';
  if(V.s==='admin'&&!adm)V.s='login';
  if(V.s==='set'&&!adm)V.s=me?'home':'login';
  const s=V.s;
  const h=s==='splash'?splash():s==='login'?login():s==='adminlogin'?adminLogin():s==='home'?home():s==='list'?list():s==='mp'?mp():s==='lib'?libView():s==='quiz'?quizView():s==='quran'?quranView():s==='study'?studyView():s==='me'?meView():s==='set'?setView():s==='admin'?admin():'<section class="scr hero"><h1>Thamheed Academy</h1><p style="margin-top:14px">ലോഡ് ചെയ്യുന്നു…</p></section>';
  const nav=s==='home'||s==='list'||s==='mp'||s==='lib'||s==='quiz'||s==='quran'||s==='study'||s==='me'||s==='set'||s==='admin';
  const key=s+':'+V.k+':'+(s==='quiz'?QZ.step:'')+(s==='mp'?MP.step:'')+(s==='lib'?LB.step:'')+(s==='admin'?V.sec:'');
  const an=key!==LK;LK=key;if(an)PH=(PH+1)%3;

  if(an && !window.IS_POPPING && s!=='boot') {
    try { history.pushState({ key: key }, ''); } catch(e) {}
  }

  $('app').innerHTML='<div class="app'+(nav?' hn':'')+(an?' anim':'')+' ph'+PH+'">'+h+(nav?navh():'')+(QP.n&&me&&s!=='admin'?miniPlayer():'')+'<div class="toast" id="toast"></div></div>';
  car();anim();
}

Object.assign(window,{goBack,navTo,meOut,ytPlay,ytBack,setOpt,clearFiles,amToggle,qClose,doInstall,helpClose,go,doLogin,doAdmin,out,tap,openList,sec,edit,del,saveI,pick,gid,waRead,waT,waGo,waCopy,render,dots,stopCar,openMP,mpBack,mpSub,mpPaper,mpOpen,saveP,delP,saveT,delT,tfOpen,atMove,atSel,atMark,atAll,atSave,libPick,libBack,libOpen,saveL,delL,openQuiz,qzSub,qzCh,qzStart,qzAns,qzNext,qzBack,qaSel,qaChip,qaEdit,saveQz,bulkQz,delQz,delCh,openQuran,qPlay,qToggle,qSeek,qNext,saveQC,saveSu,applySu,delSu,uploadPhoto,removePhoto, sendPush});

window.addEventListener('popstate', function(e) {
  window.IS_POPPING = true; 
  
  if (V.s === 'home' || V.s === 'login' || V.s === 'splash' || V.s === 'adminlogin' || V.s === 'admin') {
    window.IS_POPPING = false;
    return; 
  }
  
  if (V.s === 'quiz') qzBack();
  else if (V.s === 'mp') mpBack();
  else if (V.s === 'lib') libBack();
  else if (V.s === 'list' && V.k === 'yt') ytBack();
  else if (V.s === 'study' || V.s === 'me' || V.s === 'quran' || V.s === 'set') go('home');
  else goBack();
  
  setTimeout(() => { window.IS_POPPING = false; }, 50);
});

const VAPID_KEY = "BGdbdmmfTvVhnq3s8XDDvPdTFBdBQE3BxO0DtL0FzIX_CT_mukKwUjPizo2zEp8KuNqrdMj95v-r9gKnm7okPS8";

async function setupNotifications() {
  if (!('Notification' in window)) return;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const messaging = getMessaging(fb);
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (token) {
        await setDoc(doc(db, 'students', me.id), { fcmToken: token }, { merge: true });
      }
      onMessage(messaging, (payload) => {
        toast(`🔔 ${payload.notification.title}: ${payload.notification.body}`);
      });
    }
  } catch (error) {
    console.error('Notification setup failed:', error);
  }
}

async function sendPush(){
  const title = $('n_t').value.trim();
  const body = $('n_b').value.trim();
  if(!title || !body) { toast('തലക്കെട്ടും സന്ദേശവും നൽകുക'); return; }
  
  const msg = `Title: ${title}\nMessage: ${body}`;
  
  try {
    await navigator.clipboard.writeText(msg);
    toast('സന്ദേശം കോപ്പി ചെയ്തു! ഫയർബേസിൽ പോയി അയക്കൂ.');
    setTimeout(() => {
      window.open('https://console.firebase.google.com/', '_blank');
    }, 1500);
  } catch(e) {
    toast('കോപ്പി ചെയ്യാൻ കഴിഞ്ഞില്ല. ദയവായി മാനുവലായി എടുക്കുക.');
  }
}

async function boot(){
  render();
  const u=await tmo(new Promise(r=>{const f=onAuthStateChanged(auth,x=>{f();r(x)})}),8000).catch(()=>null);
  if(u&&!u.isAnonymous&&isAdm(u.email)){adm=true;watch()}
  else if(u&&u.isAnonymous){
    try{
      const ss=await tmo(getDoc(doc(db,'sessions',u.uid)),8000);
      if(ss.exists()){
        const s=await tmo(getDoc(doc(db,'students',ss.data().sid)),8000);
        if(s.exists()){me={id:s.id,...s.data()};if(String(me.cls)!==ss.data().cls)await tmo(setDoc(doc(db,'sessions',u.uid),{sid:s.id,cls:String(me.cls)}),8000)}
      }
    }catch(e){console.error(e)}
  }
  if(me){ 
  await loadHome(); 
  setupNotifications();
  return; 
}
  if(adm&&location.hash!=='#admin'){go('admin');return}
  go(location.hash==='#admin'?(adm?'admin':'adminlogin'):'splash');
}
boot();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
