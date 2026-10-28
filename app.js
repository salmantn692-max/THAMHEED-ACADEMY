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
tt:{l:'ടൈം ടേബിൾ',f:[['day','ദിവസം'],['time','സമയം'],['sub','വിഷയം'],['cls','ക്ലാസ്']]},
slides:{l:'സ്ലൈഡുകൾ',f:[['t','തലക്കെട്ട് (ഓപ്ഷണൽ)'],['url','Link (WhatsApp ഗ്രൂപ്പ് / YouTube / സൈറ്റ്)'],['cls','ക്ലാസ്']]}
};
const T={live:['🔴','Live ക്ലാസ്'],yt:['▶️','YouTube ക്ലാസ്'],notes:['📚','നോട്സ്'],ann:['📢','അറിയിപ്പുകൾ'],tt:['🗓️','ടൈം ടേബിൾ'],att:['✅','ഹാജർ']};
let V={s:'boot',k:'',sec:'students',ed:'',cd:''},me=null,adm=false,DA={},CT={},SL=[],LV=[],LST=null,PI=null,PK='',tp=0,tmr,CI,unsub=[];
let W={m:'c',c:'1',i:0,t:'',r:false};
const A=k=>DA[k]||[];

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
function hero(inner){return '<section class="scr hero green"><span class="fl" style="top:7%;left:10%">📖</span><span class="fl" style="top:12%;right:12%">🌙</span><span class="fl" style="bottom:8%;left:9%">✏️</span><span class="fl" style="bottom:10%;right:10%">🕌</span><div class="halo" onclick="tap()"><img src="icon-192.png" alt="Thamheed Academy logo"></div><h1>Thamheed Academy</h1>'+inner+'</section>'}
const splash=()=>hero('<p>എവിടെയും എപ്പോഴും പഠിക്കാം</p><button class="cta" onclick="go(\'login\')">ആരംഭിക്കാം</button>');
const login=()=>hero('<p>Academy നൽകിയ Student ID നൽകൂ</p><input id="sid" placeholder="Student ID" autocapitalize="characters" autocomplete="off"><div class="err" id="err"></div><button class="cta" onclick="doLogin()">പ്രവേശിക്കാം</button>'+(adm?'<button class="cta ghost" onclick="go(\'admin\')">Admin panel</button>':''));
const adminLogin=()=>hero('<p>Admin ലോഗിൻ</p><input id="ae" type="email" placeholder="Email" autocomplete="username"><input id="ap" type="password" placeholder="Password" autocomplete="current-password"><div class="err" id="err"></div><button class="cta" onclick="doAdmin()">പ്രവേശിക്കാം</button><button class="cta ghost" onclick="go(\'login\')">← തിരികെ</button>');
function carousel(){
  if(!SL.length)return '';
  return '<div class="car"><div class="trk" id="trk" onscroll="dots(this)" ontouchstart="stopCar()">'+SL.map(x=>{
    const u=safe(x.url),im=isimg(x.img),inner=im?'<img src="'+x.img+'" alt="'+esc(x.t)+'">':'<b>'+esc(x.t)+'</b>',cl='sl'+(im?' im':' green');
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
  return '<section class="scr"><div class="top"><div><small>അസ്സലാമു അലൈക്കും</small><h2>'+esc(me.name)+'</h2></div><div class="tag">ക്ലാസ് '+esc(me.cls)+'</div></div>'+carousel()
  +'<div class="promo green">'+(nx?'<small>അടുത്ത Live ക്ലാസ്</small><b>'+esc(nx.t)+'</b><small>'+esc(nx.time)+'</small>'+(u?'<br><a class="jn" href="'+u+'" target="_blank" rel="noopener">ക്ലാസിൽ ചേരൂ</a>':''):'<b>ഇപ്പോൾ Live ക്ലാസ് ഷെഡ്യൂൾ ചെയ്തിട്ടില്ല</b>')+'</div>'
  +'<div class="sec"><h3>നിങ്ങളുടെ പഠനം</h3></div><div class="grid">'+Object.keys(T).map(k=>'<button class="cc" onclick="openList(\''+k+'\')"><div class="ic green">'+T[k][0]+'</div><b>'+T[k][1]+'</b></button>').join('')+'</div></section>';
}
function item(k,x){
  const ti=k==='tt'?x.sub:x.t,sm=k==='live'?x.time:k==='tt'?x.day+' · '+x.time:k==='ann'?(x.d||'')+' '+(x.b||''):'',u=safe(x.url);
  return '<div class="ol"><div class="n green">'+T[k][0]+'</div><div class="t">'+esc(ti)+'<small>'+esc(sm)+'</small></div>'+(u?'<a class="pl" href="'+u+'" target="_blank" rel="noopener" aria-label="Open">↗</a>':'')+'</div>';
}
function list(){
  const k=V.k;let h='<section class="scr"><div class="bar"><button onclick="go(\'home\')" aria-label="Back">←</button><span>'+T[k][1]+'</span><span style="width:44px"></span></div>';
  if(k==='att'){const p=+me.p||0,t=+me.t||0,pc=t?Math.round(p*100/t):0;h+='<div class="ban green"><small>ഹാജർ</small><b>'+pc+'%</b><small>'+p+' / '+t+' ദിവസം</small></div><div class="pb"><i style="width:'+pc+'%"></i></div>'}
  else if(LST===null)h+='<div class="empty">ലോഡ് ചെയ്യുന്നു…</div>';
  else if(!LST.length)h+='<div class="empty">ഇപ്പോൾ ഒന്നുമില്ല.</div>';
  else h+=LST.map(x=>item(k,x)).join('');
  return h+'</section>';
}

/* ---------- admin ---------- */
const chips=()=>Object.keys(S).map(k=>'<button class="chip'+(k===V.sec?' green':'')+'" onclick="sec(\''+k+'\')">'+S[k].l+' ('+A(k).length+')</button>').join('')+'<button class="chip'+(V.sec==='wa'?' green':'')+'" onclick="sec(\'wa\')">📨 WhatsApp</button>';
function sec(k){V.sec=k;V.ed='';V.cd='';render()}
function edit(id){V.ed=id;render()}
function lst(){
  const c=S[V.sec],a=A(V.sec);
  if(!a.length)return '<div class="empty">ഒന്നുമില്ല. ചേർക്കൂ.</div>';
  return a.map(x=>'<div class="ol">'+(isimg(x.img)?'<img class="th" alt="" src="'+x.img+'">':'')+'<div class="t">'+esc(x[c.f[0][0]]||(x.img?'(ചിത്ര സ്ലൈഡ്)':''))+'<small>'+esc(x[c.f[1][0]])+(c.f[2]?' · '+esc(x[c.f[2][0]]):'')+'</small></div><button class="pl" onclick="edit(\''+x._id+'\')" aria-label="Edit">✏️</button><button class="pl" onclick="del(\''+x._id+'\')" aria-label="Delete">'+(V.cd===x._id?'❗':'🗑️')+'</button></div>').join('');
}
function refresh(){const l=$('lst');if(l&&V.sec!=='wa')l.innerHTML=lst();const c=$('chips');if(c)c.innerHTML=chips()}
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
  if(s==='students')return '<button class="cta ghost" type="button" onclick="gid()">🔑 പുതിയ Student ID ഉണ്ടാക്കുക</button><label for="f_wa">രക്ഷിതാവിന്റെ WhatsApp നമ്പർ (Admin-ന് മാത്രം കാണാം)</label><input id="f_wa" inputmode="tel" placeholder="9XXXXXXXXX" value="'+esc(CT[e._id]||'')+'">';
  if(s==='slides'){const im=PI||e.img||'';return '<label for="f_img">ബാനർ ചിത്രം (ഏകദേശം 3:1, ഉദാ. 1200×400)</label><input id="f_img" type="file" accept="image/*" onchange="pick(this)"><img id="pv" class="pv" alt="" src="'+(isimg(im)?im:'')+'" style="display:'+(isimg(im)?'block':'none')+'">'}
  return '';
}
function admin(){
  if(PK!==V.sec+':'+V.ed){PK=V.sec+':'+V.ed;PI=null}
  const s=V.sec;
  let h='<section class="scr"><h2 style="margin:0 0 4px">Admin Panel</h2><p class="mu">മാറ്റങ്ങൾ ഉടൻ തന്നെ വിദ്യാർത്ഥികൾക്ക് ലഭിക്കും.</p><div class="chips" id="chips">'+chips()+'</div>';
  if(s==='wa')return h+waPanel()+'</section>';
  const c=S[s],e=V.ed?(A(s).find(x=>x._id===V.ed)||{}):{};
  h+='<div class="adm"><div id="lst">'+lst()+'</div><div class="fm"><h3>'+(V.ed?'തിരുത്തുക':'പുതിയത് ചേർക്കുക')+'</h3>'+c.f.map(f=>{
    const k=f[0],v=e[k]!=null?e[k]:'',n='<label for="f_'+k+'">'+f[1]+'</label>';
    if(k==='cls'){const o=s==='students'?CL:['All'].concat(CL);return n+'<select id="f_cls">'+o.map(x=>'<option'+(String(x)===String(v)?' selected':'')+'>'+x+'</option>').join('')+'</select>'}
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
  let h='<div class="fm" style="max-width:640px"><h3>📨 WhatsApp അറിയിപ്പ്</h3><label for="w_m">ആർക്ക്?</label><select id="w_m" onchange="waRead();render()"><option value="c"'+(W.m==='c'?' selected':'')+'>ക്ലാസ് അനുസരിച്ച്</option><option value="i"'+(W.m==='i'?' selected':'')+'>ഒരു വിദ്യാർത്ഥിക്ക്</option></select>';
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

/* ---------- shell ---------- */
function navh(){return '<nav>'+(me?'<button class="'+(V.s!=='admin'?'on':'')+'" onclick="go(\'home\')"><span>🏠</span>Home</button>':'')+(adm?'<button class="'+(V.s==='admin'?'on':'')+'" onclick="go(\'admin\')"><span>⚙️</span>Admin</button>':'')+'<button onclick="out()"><span>🚪</span>Exit</button></nav>'}
function render(){
  if((V.s==='home'||V.s==='list')&&!me)V.s='login';
  if(V.s==='admin'&&!adm)V.s='login';
  const s=V.s;
  const h=s==='splash'?splash():s==='login'?login():s==='adminlogin'?adminLogin():s==='home'?home():s==='list'?list():s==='admin'?admin():'<section class="scr hero green"><h1>Thamheed Academy</h1><p style="margin-top:14px">ലോഡ് ചെയ്യുന്നു…</p></section>';
  const nav=s==='home'||s==='list'||s==='admin';
  $('app').innerHTML='<div class="app'+(nav?' hn':'')+'">'+h+(nav?navh():'')+'<div class="toast" id="toast"></div></div>';
  car();
}
Object.assign(window,{go,doLogin,doAdmin,out,tap,openList,sec,edit,del,saveI,pick,gid,waRead,waT,waGo,waCopy,render,dots,stopCar});

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
