'use strict';
// Account identity is obtained only from the authenticated server response.
window.createLearningSync = function({getState,applyState,legacy,notify,sessionIds}) {
 const clone=x=>JSON.parse(JSON.stringify(x));
 let user=null,shadow=null,pending={},busy=null,timer=null,conflicts=[],lastError='',legacyAvailable=false,initialized=false;
 let observed=clone(getState());
 const keys=['lastSession',...sessionIds.map(id=>`completed.${id}`),...sessionIds.map(id=>`notes.${id}`),...sessionIds.flatMap(id=>Array.from({length:3},(_,j)=>`answers.${id}-${j}`))];
 const field=(s,key)=>{const [kind,id]=key.split('.');return kind==='lastSession'?s.lastSession:kind==='completed'?s.completed.includes(Number(id)):s[kind][id]||'';};
 const set=(s,key,value)=>{const [kind,id]=key.split('.');if(kind==='lastSession')s.lastSession=value;else if(kind==='completed')s.completed=[...new Set([...s.completed.filter(n=>n!==Number(id)),...(value?[Number(id)]:[])])].sort((a,b)=>a-b);else s[kind][id]=value;};
 const cacheKey=()=>`rust-ai-account-${user.id}`;
 function persist(){if(!user)return;try{localStorage.setItem(cacheKey(),JSON.stringify({state:getState(),pending,shadow}));}catch{lastError='Browser backup could not be saved. Export a copy.';} }
 function apply(remote){const next=clone(remote);for(const p of Object.values(pending))set(next,p.key,p.value);observed=clone(next);applyState(next);persist();}
 async function api(method='GET',data){const r=await fetch('/api/state',{method,credentials:'same-origin',cache:'no-store',headers:data?{'Content-Type':'application/json'}:{},body:data?JSON.stringify(data):undefined,signal:AbortSignal.timeout(15000)});let result;try{result=await r.json();}catch{throw new Error('Account service is unavailable. Your browser work is retained.');}if(!r.ok){const error=new Error(result.error||'Account service is unavailable.');error.status=r.status;error.data=result;throw error;}return result;}
 function toolbar(){
  let el=document.querySelector('#account-sync');if(!el){el=document.createElement('section');el.id='account-sync';el.className='account-sync';el.setAttribute('aria-label','Account sync');document.querySelector('.topbar').after(el);}
  el.replaceChildren();const info=document.createElement('div');info.className='sync-summary';const name=document.createElement('strong');name.textContent=user?`Learning account · ${user.name}`:'Learning account';const status=document.createElement('span');status.setAttribute('role','status');status.textContent=lastError?lastError:conflicts.length?'Edits conflict with another device. Choose which version to keep.':!initialized?'Connecting…':!user?'Not connected. Sign in to sync.':busy?'Syncing…':Object.keys(pending).length?'Edits saved on this device. Waiting to sync.':'Synced across devices';info.append(name,status);el.append(info);
  const actions=document.createElement('div');actions.className='sync-actions';const add=(label,fn)=>{const b=document.createElement('button');b.className='btn btn-secondary';b.textContent=label;b.onclick=fn;actions.append(b);};
  if(conflicts.length){add('Keep my pending edits',()=>{for(const p of Object.values(pending))p.base=field(shadow,p.key);conflicts=[];lastError='';persist();flush();});add('Use account version',()=>{pending={};conflicts=[];lastError='';apply(shadow);toolbar();});}
  else add(user?'Sync now':'Retry connection',()=>user?pull():start());
  if(legacyAvailable&&user)add('Import old browser progress',()=>{if(!confirm('Merge the old browser progress into this account? Existing nonempty account notes take priority. The original browser copy remains available.'))return;const next=clone(getState());next.completed=[...new Set([...next.completed,...legacy.completed])].sort((a,b)=>a-b);for(const [k,v]of Object.entries(legacy.notes||{}))if(!next.notes[k])next.notes[k]=v;for(const [k,v]of Object.entries(legacy.answers||{}))if(!next.answers[k])next.answers[k]=v;applyState(next);changed(next);try{localStorage.setItem(`${cacheKey()}-legacy-imported`,'yes');}catch{}legacyAvailable=false;toolbar();notify('Old browser progress merged. Syncing to your account.');});
  if(!user){const a=document.createElement('a');a.className='btn btn-primary';a.href='/signin-with-chatgpt?return_to=%2F';a.target='_top';a.textContent='Sign in with ChatGPT';actions.append(a);}
  el.append(actions);
 }
 async function start(){
  lastError='';toolbar();
  try{const remote=await api();user=remote.user;shadow=remote.state;
   try{const cached=JSON.parse(localStorage.getItem(cacheKey()));if(cached?.pending&&typeof cached.pending==='object')for(const [k,p] of Object.entries(cached.pending))if(keys.includes(k)&&p&&p.key===k&&typeof p.value===typeof field(shadow,k)&&typeof p.base===typeof field(shadow,k))pending[k]=p;
    legacyAvailable=Boolean(legacy.completed?.length||Object.values(legacy.notes||{}).some(Boolean)||Object.values(legacy.answers||{}).some(Boolean))&&!localStorage.getItem(`${cacheKey()}-legacy-imported`);
   }catch{}
   initialized=true;apply(shadow);toolbar();if(Object.keys(pending).length)await flush();return true;
  }catch(error){initialized=true;lastError=error.message;toolbar();return false;}
 }
 function changed(next){
  if(!user){observed=clone(next);try{localStorage.setItem('rust-ai-studio-v1',JSON.stringify(next));}catch{}lastError='Saved on this device only. Connect your learning account to sync.';toolbar();return;}
  for(const key of keys){const value=field(next,key);if(value!==field(observed,key)){pending[key]={key,value,base:pending[key]?.base??field(shadow,key)};}}
  observed=clone(next);persist();toolbar();clearTimeout(timer);timer=setTimeout(()=>flush(),700);
 }
 async function flush(){
  clearTimeout(timer);if(busy){await busy;return conflicts.length===0&&!lastError;}if(!user||conflicts.length)return false;if(!Object.keys(pending).length)return true;
  const sent=clone(pending);lastError='';
  busy=(async()=>{try{const remote=await api('PATCH',{changes:Object.values(sent)});shadow=remote.state;
   for(const [key,p]of Object.entries(sent)){if(pending[key]?.value===p.value)delete pending[key];else if(pending[key])pending[key].base=field(shadow,key);}
   apply(shadow);return true;
  }catch(error){if(error.status===409&&error.data?.state){shadow=error.data.state;conflicts=error.data.conflicts||Object.keys(pending);apply(shadow);}else lastError=error.message;persist();return false;}finally{busy=null;toolbar();}})();
  toolbar();const success=await busy;if(success&&Object.keys(pending).length)return flush();return success;
 }
 async function pull(){if(busy)return;if(Object.keys(pending).length){await flush();return;}try{const r=await api();if(user&&r.user.id!==user.id){lastError='Your account changed. Reload this page before editing.';toolbar();return;}shadow=r.state;lastError='';apply(shadow);}catch(e){lastError=e.message;}toolbar();}
 window.addEventListener('online',()=>pull());document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&user)pull();});
 setInterval(()=>{if(user&&document.visibilityState==='visible')pull();},30000);
 return {start,changed,flush,pull,isConnected:()=>Boolean(user)};
};
