import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,signInAnonymously,signInWithEmailAndPassword,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {initializeFirestore,collection,doc,getDoc,getDocs,setDoc,addDoc,updateDoc,deleteDoc,query,where,onSnapshot} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {firebaseConfig,ADMIN_EMAILS} from "./firebase-config.js";

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
students:{l:'വിദ്യാർത്ഥികൾ',f:[['id','Student ID'],['name','പേര്'],['cls','ക്ലാസ്'],['p','ഹാജർ ദിവസങ്ങൾ'],['t','ആകെ പ്രവൃത്തി ദിവസങ്ങൾ']]},
live:{l:'Live ക്ലാസ്',f:[['t','തലക്കെട്ട്'],['time','സമയം'],['url','Link (https://…)'],['cls','ക്ലാസ്']]},
yt:{l:'YouTube',f:[['t','തലക്കെട്ട്'],['url','YouTube Link'],['cls','ക്ലാസ്']]},
notes:{l:'നോട്സ്',f:[['t','തലക്കെട്ട്'],['url','Link'],['cls','ക്ലാസ്']]},
ann:{l:'അറിയിപ്പുകൾ',f:[['t','തലക്കെട്ട്'],['b','വിവരം'],['cls','ക്ലാസ്']]},
slides:{l:'സ്ലൈഡുകൾ',f:[['t','തലക്കെട്ട് (ഓപ്ഷണൽ)'],['url','Link (WhatsApp ഗ്രൂപ്പ് / YouTube / സൈറ്റ്)'],['cls','ക്ലാസ്']]},
subjects:{l:'വിഷയങ്ങൾ',f:[['name','വിഷയം (English)'],['ar','അറബി പേര് (ഓപ്ഷണൽ)'],['cls','ക്ലാസ്'],['soon','Coming soon ആണോ?',['No','Yes']]]}
};
const T={live:['video','Live ക്ലാസ്'],yt:['play','YouTube ക്ലാസ്'],notes:['book','നോട്സ്'],ann:['bell','അറിയിപ്പുകൾ'],tt:['cal','ടൈം ടേബിൾ'],att:['check','ഹാജർ']};
const EX={q:['QUARTERLY EXAM','Quarterly Question Paper','clip'],h:['HALF YEARLY EXAM','Half Year Question Paper','check'],f:['FINAL EXAM','Final Question Paper','cap']};
let MP={step:'sub',sub:'',paper:''},SUBS=null,PAP=null,TF=null;const PB={},TFU={};
let V={s:'boot',k:'',sec:'students',ed:'',cd:''},me=null,adm=false,DA={},CT={},SL=[],LV=[],LST=null,PI=null,PK='',tp=0,tmr,CI,unsub=[];
let W={m:'c',c:'1',i:0,t:'',r:false};
const A=k=>DA[k]||[];
const IC={
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
cap:'<path d="M22 10L12 5 2 10l10 5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>'
};
const ico=n=>'<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(IC[n]||'')+'</svg>';


function toast(m){const e=$('toast');if(!e)return;e.textContent=m;e.classList.add('on');clearTimeout(tmr);tmr=setTimeout(()=>e.classList.remove('on'),2400)}
function go(s,k){V.s=s;V.k=k||'';render();window.scrollTo(0,0)}

/* ---------- data ---------- */
async function fetchK(k){
  const c=collection(db,k);
  const rs=await Promise.all([getDocs(query(c,where('cls','==','All'))),getDocs(query(c,where('cls','==',String(me.cls))))]);
  return rs.flatMap(r=>r.docs.map(d=>({_id:d.id,...d.data()}))).sort((a,b)=>(a.ts||0)-(b.ts||0));
}
async function loadHome(){
  V.s='home';render();
  try{
    const s=await tmo(getDoc(doc(db,'students',me.id)),12000);if(s.exists())me={id:me.id,...s.data()};
    [SL,LV]=await tmo(Promise.all([fetchK('slides'),fetchK('live')]),12000);
  }catch(e){toast('ഡാറ്റ ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല')}
  render();
}
async function openList(k){
  if(k==='tt'){openTT();return}
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
  unsub.push(onSnapshot(collection(db,'tfiles'),s=>{DA.tfiles=s.docs.map(d=>({_id:d.id,...d.data()})).sort((a,b)=>(a.ts||0)-(b.ts||0));if(V.s==='admin')refresh()},()=>{}));
  unsub.push(onSnapshot(collection(db,'papers'),s=>{DA.papers=s.docs.map(d=>({_id:d.id,...d.data()})).sort((a,b)=>(a.ts||0)-(b.ts||0));if(V.s==='admin')refresh()},()=>{}));
}

/* ---------- auth ---------- */
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
  unsub.forEach(f=>f());unsub=[];me=null;adm=false;DA={};CT={};SL=[];LV=[];go('login');
}
function tap(){tp++;if(tp>=5){tp=0;go(adm?'admin':'adminlogin')}}

/* ---------- student screens ---------- */
function hero(inner){return '<section class="scr hero"><div class="logo" onclick="tap()"><img src="icon-192.png" alt="Thamheed Academy logo"></div><h1>Thamheed Academy</h1>'+inner+'</section>'}
const splash=()=>hero('<p>എവിടെയും എപ്പോഴും പഠിക്കാം</p><button class="cta" onclick="go(\'login\')">ആരംഭിക്കാം</button>');
const login=()=>hero('<p>Academy നൽകിയ Student ID നൽകൂ</p><input id="sid" placeholder="Student ID" autocapitalize="characters" autocomplete="off"><div class="err" id="err"></div><button class="cta" onclick="doLogin()">പ്രവേശിക്കാം</button>'+(adm?'<button class="cta ghost" onclick="go(\'admin\')">Admin panel</button>':''));
const adminLogin=()=>hero('<p>Admin ലോഗിൻ</p><input id="ae" type="email" placeholder="Email" autocomplete="username"><input id="ap" type="password" placeholder="Password" autocomplete="current-password"><div class="err" id="err"></div><button class="cta" onclick="doAdmin()">പ്രവേശിക്കാം</button><button class="cta ghost" onclick="go(\'login\')">← തിരികെ</button>');
function carousel(){
  if(!SL.length)return '';
  return '<div class="car"><div class="trk" id="trk" onscroll="dots(this)" ontouchstart="stopCar()">'+SL.map(x=>{
    const u=safe(x.url),im=isimg(x.img),inner=im?'<img src="'+x.img+'" alt="'+esc(x.t)+'">':'<b>'+esc(x.t)+'</b>',cl='sl'+(im?' im':' tx');
    return u?'<a class="'+cl+'" href="'+u+'" target="_blank" rel="noopener">'+inner+'</a>':'<div class="'+cl+'">'+inner+'</div>';
  }).join('')+'</div>'+(SL.length>1?'<div class="dts" id="dts">'+SL.map((x,i)=>'<i'+(i?'':' class="on"')+'></i>').join('')+'</div>':'')+'</div>';
}
function dots(t){const d=$('dts');if(!d)return;const i=Math.round(t.scrollLeft/t.clientWidth);[...d.children].forEach((c,j)=>c.className=j===i?'on':'')}
function stopCar(){clearInterval(CI)}
function car(){
  clearInterval(CI);const t=$('trk');if(!t||t.children.length<2)return;
  CI=setInterval(()=>{const n=t.children.length,i=Math.round(t.scrollLeft/t.clientWidth);t.scrollTo({left:((i+1)%n)*t.clientWidth,behavior:'smooth'})},4000);
}
function home(){
  const nx=LV[0],u=nx?safe(nx.url):'';
  const tiles=Object.keys(T).map(k=>'<button class="cc" onclick="openList(\''+k+'\')"><div class="ic">'+ico(T[k][0])+'</div><b>'+T[k][1]+'</b></button>').join('')+'<button class="cc" onclick="openMP()"><div class="ic">'+ico('file')+'</div><b>Model Paper</b></button>';
  return '<section class="scr"><div class="top"><div><small>അസ്സലാമു അലൈക്കും</small><h2>'+esc(me.name)+'</h2></div><div class="tag">ക്ലാസ് '+esc(me.cls)+'</div></div>'+carousel()
  +'<div class="promo"><div class="ic sm">'+ico('video')+'</div><div class="pt2">'+(nx?'<small>അടുത്ത Live ക്ലാസ്</small><b>'+esc(nx.t)+'</b><small>'+esc(nx.time)+'</small>':'<b>ഇപ്പോൾ Live ക്ലാസ് ഷെഡ്യൂൾ ചെയ്തിട്ടില്ല</b>')+'</div>'+(u?'<a class="jn" href="'+u+'" target="_blank" rel="noopener">ചേരൂ</a>':'')+'</div>'
  +'<div class="sec"><h3>നിങ്ങളുടെ പഠനം</h3></div><div class="grid">'+tiles+'</div></section>';
}
function item(k,x){
  const ti=k==='tt'?x.sub:x.t,sm=k==='live'?x.time:k==='tt'?x.day+' · '+x.time:k==='ann'?(x.d||'')+' '+(x.b||''):'',u=safe(x.url);
  return '<div class="ol"><div class="n">'+ico(T[k][0])+'</div><div class="t">'+esc(ti)+'<small>'+esc(sm)+'</small></div>'+(u?'<a class="pl" href="'+u+'" target="_blank" rel="noopener" aria-label="Open">'+ico('ext')+'</a>':'')+'</div>';
}
function list(){
  const k=V.k;if(k==='tt')return ttView();let h='<section class="scr"><div class="bar"><button onclick="go(\'home\')" aria-label="Back">'+ico('back')+'</button><span>'+T[k][1]+'</span><span style="width:44px"></span></div>';
  if(k==='att'){const p=+me.p||0,t=+me.t||0,pc=t?Math.round(p*100/t):0;h+='<div class="ban"><small>ഹാജർ</small><b>'+pc+'%</b><small>'+p+' / '+t+' ദിവസം</small><div class="pb"><i style="width:'+pc+'%"></i></div></div>'}
  else if(LST===null)h+='<div class="empty">ലോഡ് ചെയ്യുന്നു…</div>';
  else if(!LST.length)h+='<div class="empty">ഇപ്പോൾ ഒന്നുമില്ല.</div>';
  else h+=LST.map(x=>item(k,x)).join('');
  return h+'</section>';
}
/* ---------- admin ---------- */
const chips=()=>Object.keys(S).map(k=>'<button class="chip'+(k===V.sec?' on':'')+'" onclick="sec(\''+k+'\')">'+S[k].l+' ('+A(k).length+')</button>').join('')+'<button class="chip'+(V.sec==='papers'?' on':'')+'" onclick="sec(\'ttf\')">Time Table ('+A('tfiles').length+')</button><button class="chip'+(V.sec==='papers'?' on':'')+'" onclick="sec(\'papers\')">Model Paper ('+A('papers').length+')</button><button class="chip'+(V.sec==='wa'?' on':'')+'" onclick="sec(\'wa\')">WhatsApp</button>';
function sec(k){V.sec=k;V.ed='';V.cd='';render()}
function edit(id){V.ed=id;render()}
function lst(){
  const c=S[V.sec],a=A(V.sec);
  if(!a.length)return '<div class="empty">ഒന്നുമില്ല. ചേർക്കൂ.</div>';
  return a.map(x=>'<div class="ol">'+(isimg(x.img)?'<img class="th" alt="" src="'+x.img+'">':'')+'<div class="t">'+esc(x[c.f[0][0]]||(x.img?'(ചിത്ര സ്ലൈഡ്)':''))+'<small>'+esc(x[c.f[1][0]])+(c.f[2]?' · '+esc(x[c.f[2][0]]):'')+'</small></div><button class="pl" onclick="edit(\''+x._id+'\')" aria-label="Edit">'+ico('edit')+'</button><button class="pl'+(V.cd===x._id?' dng':'')+'" onclick="del(\''+x._id+'\')" aria-label="Delete">'+ico('trash')+'</button></div>').join('');
}
function refresh(){const l=$('lst');if(l&&V.sec!=='wa')l.innerHTML=V.sec==='papers'?lstP():V.sec==='ttf'?lstT():lst();const c=$('chips');if(c)c.innerHTML=chips()}
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
  let h='<section class="scr"><h2 style="margin:0 0 4px">Admin Panel</h2><p class="mu">മാറ്റങ്ങൾ ഉടൻ തന്നെ വിദ്യാർത്ഥികൾക്ക് ലഭിക്കും.</p><div class="chips" id="chips">'+chips()+'</div>';
  if(s==='wa')return h+waPanel()+'</section>';
  if(s==='papers')return h+paperPanel()+'</section>';
  if(s==='ttf')return h+ttPanel()+'</section>';
  const c=S[s],e=V.ed?(A(s).find(x=>x._id===V.ed)||{}):{};
  h+='<div class="adm"><div id="lst">'+lst()+'</div><div class="fm"><h3>'+(V.ed?'തിരുത്തുക':'പുതിയത് ചേർക്കുക')+'</h3>'+c.f.map(f=>{
    const k=f[0],v=e[k]!=null?e[k]:'',n='<label for="f_'+k+'">'+f[1]+'</label>';
    if(k==='cls'){const o=(s==='students'||s==='subjects')?CL:['All'].concat(CL);return n+'<select id="f_cls">'+o.map(x=>'<option'+(String(x)===String(v)?' selected':'')+'>'+x+'</option>').join('')+'</select>'}
    if(f[2])return n+'<select id="f_'+k+'">'+f[2].map(x=>'<option'+(String(x)===String(v)?' selected':'')+'>'+x+'</option>').join('')+'</select>';
    if(k==='b')return n+'<textarea id="f_b" rows="3">'+esc(v)+'</textarea>';
    return n+'<input id="f_'+k+'" value="'+esc(v)+'"'+((k==='p'||k==='t')?' inputmode="numeric"':'')+'>';
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
      delete o.id;o.cls=String(o.cls);o.p=+o.p||0;o.t=+o.t||0;
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

/* ---------- Model Paper ---------- */
const b64of=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]);r.onerror=rej;r.readAsDataURL(f)});
const canShareFiles=()=>{try{return !!(navigator.canShare&&navigator.canShare({files:[new File([''],'a.pdf',{type:'application/pdf'})]}))}catch(e){return false}};
async function pdfBlob(p){
  if(PB[p._id])return PB[p._id];
  const q=await tmo(getDocs(collection(db,'papers',p._id,'chunks')),30000);
  const bin=atob(q.docs.sort((a,b)=>a.id<b.id?-1:1).map(d=>d.data().d).join('')),u=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  return PB[p._id]=new Blob([u],{type:'application/pdf'});
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
function mpBack(){if(MP.step==='paper'){MP.step='exam';render()}else if(MP.step==='exam'){MP.step='sub';render()}else go('home');window.scrollTo(0,0)}
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
  if(SUBS===null)return h+'<div class="empty">ലോഡ് ചെയ്യുന്നു…</div></section>';
  if(MP.step==='sub'){
    if(!SUBS.length)return h+'<div class="empty">ഇപ്പോൾ ഒന്നുമില്ല.</div></section>';
    return h+'<div class="grid">'+SUBS.map(s=>{const soon=s.soon==='Yes';return '<button class="cc sj" '+(soon?'disabled':'onclick="mpSub(\''+s._id+'\')"')+'><div class="ic">'+ico('layers')+'</div>'+(s.ar?'<b class="ar" dir="auto">'+esc(s.ar)+'</b>':'')+'<b>'+esc(s.name)+'</b>'+(soon?'<div class="rb">COMING SOON</div>':'')+'</button>'}).join('')+'</div></section>';
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
    await tmo(setDoc(ref,{sub,exam,title,cls:String(s.cls),url:u,n,size,ts:(old&&old.ts)||Date.now()}),12000);
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

/* ---------- Time Table files ---------- */
async function tfBlob(f){
  if(PB['t'+f._id])return PB['t'+f._id];
  const q=await tmo(getDocs(collection(db,'tfiles',f._id,'chunks')),30000);
  const bin=atob(q.docs.sort((a,b)=>a.id<b.id?-1:1).map(d=>d.data().d).join('')),u=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  return PB['t'+f._id]=new Blob([u],{type:f.mime||'application/pdf'});
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
  let h='<section class="scr"><div class="bar"><button onclick="go(\'home\')" aria-label="Back">'+ico('back')+'</button><span>'+T.tt[1]+'</span><span style="width:44px"></span></div>';
  if(TF===null)return h+'<div class="empty">ലോഡ് ചെയ്യുന്നു…</div></section>';
  if(!TF.length)return h+'<div class="empty">ഇപ്പോൾ ഒന്നുമില്ല.</div></section>';
  return h+TF.map(f=>{
    const img=/^image\//.test(f.mime||''),u=TFU[f._id];
    return '<div class="tf"><div class="tfh"><b>'+esc(f.title)+'</b><button class="pl" onclick="tfOpen(\''+f._id+'\',1)" aria-label="Share">'+ico('share')+'</button></div>'
      +(img?(u?'<img class="tfi" alt="'+esc(f.title)+'" src="'+u+'" onclick="tfOpen(\''+f._id+'\',0)">':'<div class="empty">ലോഡ് ചെയ്യുന്നു…</div>')
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
    await tmo(setDoc(ref,{cls,title,mime,url:u,n,size,ts:(old&&old.ts)||Date.now()}),12000);
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

/* ---------- shell ---------- */
function navh(){return '<nav><div class="brand"><img src="icon-192.png" alt=""><b>Thamheed Academy</b></div>'+(me?'<button class="'+(V.s!=='admin'?'on':'')+'" onclick="go(\'home\')">'+ico('home')+'<span>Home</span></button>':'')+(adm?'<button class="'+(V.s==='admin'?'on':'')+'" onclick="go(\'admin\')">'+ico('shield')+'<span>Admin</span></button>':'')+'<button onclick="out()">'+ico('out')+'<span>Exit</span></button></nav>'}
function render(){
  if((V.s==='home'||V.s==='list'||V.s==='mp')&&!me)V.s='login';
  if(V.s==='admin'&&!adm)V.s='login';
  const s=V.s;
  const h=s==='splash'?splash():s==='login'?login():s==='adminlogin'?adminLogin():s==='home'?home():s==='list'?list():s==='mp'?mp():s==='admin'?admin():'<section class="scr hero"><h1>Thamheed Academy</h1><p style="margin-top:14px">ലോഡ് ചെയ്യുന്നു…</p></section>';
  const nav=s==='home'||s==='list'||s==='mp'||s==='admin';
  $('app').innerHTML='<div class="app'+(nav?' hn':'')+'">'+h+(nav?navh():'')+'<div class="toast" id="toast"></div></div>';
  car();
}
Object.assign(window,{go,doLogin,doAdmin,out,tap,openList,sec,edit,del,saveI,pick,gid,waRead,waT,waGo,waCopy,render,dots,stopCar,openMP,mpBack,mpSub,mpPaper,mpOpen,saveP,delP,saveT,delT,tfOpen});

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
  if(me){await loadHome();return}
  if(adm&&location.hash!=='#admin'){go('admin');return}
  go(location.hash==='#admin'?(adm?'admin':'adminlogin'):'splash');
}
boot();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
