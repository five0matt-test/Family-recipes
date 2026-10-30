// Field-level intent patches preserve edits to different items across devices.
const clone=value=>JSON.parse(JSON.stringify(value));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const map=(items,key='id')=>Object.fromEntries((items||[]).map(x=>[x[key],x]));
const delta=(a,b)=>Object.fromEntries([...new Set([...Object.keys(a),...Object.keys(b)])].filter(k=>!same(a[k],b[k])).map(k=>[k,b[k]??null]));
export function shoppingPatch(before,after){
 const patch={};
 for(const field of ['selected','manual']){const edits=delta(map(before[field]),map(after[field]));if(Object.keys(edits).length)patch[field]=edits;}
 const checked=delta(Object.fromEntries(before.checked.map(k=>[k,true])),Object.fromEntries(after.checked.map(k=>[k,true])));if(Object.keys(checked).length)patch.checked=checked;
 const overrides=delta(before.overrides,after.overrides);if(Object.keys(overrides).length)patch.overrides=overrides;
 for(const field of ['includeOptional','scope'])if(!same(before[field],after[field]))patch[field]=after[field];
 return patch;
}
export function applyShoppingPatch(state,patch){
 const next=clone(state);
 for(const field of ['selected','manual','checked','overrides'])if(patch[field]){
  const values=field==='checked'?Object.fromEntries(next.checked.map(k=>[k,true])):field==='overrides'?next.overrides:map(next[field]);
  for(const [key,value] of Object.entries(patch[field])){if(['__proto__','constructor','prototype'].includes(key))continue;if(value===null)delete values[key];else values[key]=clone(value);}
  next[field]=field==='checked'?Object.keys(values):field==='overrides'?values:Object.values(values);
 }
 for(const field of ['includeOptional','scope'])if(Object.hasOwn(patch,field))next[field]=patch[field];
 return next;
}
// Transport owns authenticated Firestore reads/transactions. Never writes pantry stock.
export function createShoppingSync({transport,uid,empty,validate,onState,onStatus,storage=globalThis.localStorage}){
 const key='familyRecipes.shoppingOutbox.v1.'+uid;
 let base=empty(),revision=-1,pending=[],listening=false,busy=false,stopped=false,failed=false,unwatch=()=>{},view=empty();
 try{const raw=storage?.getItem(key);const saved=raw&&raw.length<500000?JSON.parse(raw):null;if(Array.isArray(saved)&&saved.length<=200)pending=saved.filter(x=>typeof x?.id==='string'&&x.patch&&typeof x.patch==='object');}catch{}
 function persist(){try{if(pending.length)storage?.setItem(key,JSON.stringify(pending));else storage?.removeItem(key);return true;}catch{return false;}}
 function status(message){onStatus(message);}
 function publish(){view=validate(pending.reduce((s,p)=>p.clear?empty():applyShoppingPatch(s,p.patch),base));onState(clone(view));}
 function accept(record){if(!record||!Number.isSafeInteger(record.revision)||record.revision<0)throw Error('Shared list data is invalid.');if(record.revision>=revision){base=validate(JSON.parse(record.plan));revision=record.revision;}}
 async function flush(){
  if(stopped||busy||!listening||failed||!pending.length)return;
  busy=true;const operation=pending[0];status('Saving shared list…');
  try{
   const record=await transport.commit(uid,operation,empty,validate);
   if(stopped)return;
   accept(record);pending=pending.filter(x=>x.id!==operation.id);const saved=persist();publish();
   status(pending.length?'Saving shared list…':saved?'Shared list is up to date. Changes sync across household devices.':'Shared list saved. Browser backup is unavailable.');
  }catch(error){if(!stopped){failed=true;const backedUp=persist();status('Not synced: '+error.message+'. '+(backedUp?'Your pending changes are kept in this browser.':'Keep this page open and download a backup.')+' Retry when connected.');}}
  finally{busy=false;if(!stopped&&!failed&&pending.length)flush();}
 }
 function watch(){unwatch();listening=false;status('Loading shared household list…');unwatch=transport.watch(uid,record=>{
  if(stopped)return;
  try{accept(record);listening=true;publish();if(!failed)status(pending.length?'Saving shared list…':'Shared list is up to date. Changes sync across household devices.');flush();}
  catch(error){failed=true;status('Shared list unavailable: '+error.message+'. Browser-only mode is still available.');}
 },error=>{if(stopped)return;listening=false;failed=true;status('Shared list unavailable: '+error.message+'. Check household shopping permissions or retry. Browser-only mode is still available.');});}
 watch();
 return {
  update(next){if(stopped||!listening)return false;const patch=shoppingPatch(view,validate(next));if(!Object.keys(patch).length)return true;if(pending.length>=200){status('Too many pending edits. Retry sync before adding more.');publish();return false;}pending.push({id:crypto.randomUUID(),patch});if(!persist())status('Browser backup is unavailable. Keep this page open until sync finishes.');publish();flush();return true;},
  clear(){if(stopped||!listening)return false;pending.push({id:crypto.randomUUID(),patch:{},clear:true});persist();view=empty();onState(clone(view));flush();return true;},
  retry(){failed=false;if(!listening)watch();else flush();},
  stop(){stopped=true;unwatch();},
  getState(){return clone(view);},
  isReady(){return listening;}
 };
}
