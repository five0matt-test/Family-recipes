const assert=require('node:assert/strict');
(async()=>{
 const {shoppingPatch,applyShoppingPatch,createShoppingSync}=await import('../assets/shopping-sync.js');
 const {validatePlan}=await import('../assets/shopping-model.js');
 const recipes=[{id:'a'},{id:'b'}],empty=()=>validatePlan(null,recipes),validate=x=>validatePlan(x,recipes);
 const storage={getItem:()=>null,setItem(){},removeItem(){}};
 let record={revision:0,plan:JSON.stringify(empty()),applied:[]},watchers=[],fail=false,lost=false,writes=0;
 const transport={watch(uid,next){watchers.push(next);queueMicrotask(()=>next(structuredClone(record)));return ()=>watchers=watchers.filter(x=>x!==next)},async commit(uid,operation){
  await new Promise(r=>setTimeout(r,5));if(fail)throw Error('offline');
  if(record.applied.includes(operation.id))return structuredClone(record);
  record={revision:record.revision+1,plan:JSON.stringify(operation.clear?empty():validate(applyShoppingPatch(JSON.parse(record.plan),operation.patch))),applied:[...record.applied,operation.id]};writes++;watchers.forEach(fn=>fn(structuredClone(record)));if(lost){lost=false;throw Error('lost reply');}return structuredClone(record);
 }};
 const make=()=>{const result={state:null,status:''};result.sync=createShoppingSync({transport,uid:'test',empty,validate,storage,onState:s=>result.state=s,onStatus:s=>result.status=s});return result};
 const a=make(),b=make(),settle=()=>new Promise(r=>setTimeout(r,50));await settle();
 a.sync.update({...a.state,selected:[{id:'a',amount:4}]});b.sync.update({...b.state,selected:[{id:'b',amount:6}]});await settle();assert.equal(a.state.selected.length,2);assert.deepEqual(a.state,b.state);
 a.sync.update({...a.state,manual:[{id:'milk',text:'Milk',checked:false}]});await settle();b.sync.update({...b.state,manual:[{id:'milk',text:'Milk',checked:true}]});await settle();assert.equal(a.state.manual[0].checked,true);
 fail=true;a.sync.update({...a.state,checked:['olive oil|1']});await settle();assert.match(a.status,/Not synced/);assert.equal(b.state.checked.length,0);fail=false;a.sync.retry();await settle();assert.deepEqual(b.state.checked,['olive oil|1']);
 lost=true;a.sync.clear();await settle();const prior=writes;b.sync.update({...b.state,manual:[{id:'bread',text:'Bread',checked:false}]});await settle();a.sync.retry();await settle();assert.equal(writes,prior+1,'lost clear reply is idempotent');assert.equal(a.state.manual[0].text,'Bread');
 const detached=structuredClone(a.state);a.sync.stop();b.sync.update({...b.state,includeOptional:true});await settle();assert.deepEqual(a.state,detached,'stopped session ignores new snapshots');b.sync.stop();
 const old=empty(),one={...empty(),selected:[{id:'a',amount:2}]},two={...empty(),selected:[{id:'b',amount:3}]};assert.equal(applyShoppingPatch(two,shoppingPatch(old,one)).selected.length,2);
 console.log('PASS shared model: two-device concurrent edits, checks, failed-save retry, idempotent lost clear reply, session cleanup.');
})().catch(e=>{console.error(e);process.exit(1)});
