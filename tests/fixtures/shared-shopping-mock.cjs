const mockFirebase=require('./firebase-pantry-mock.cjs');
module.exports=async function sharedMock(page,hub){
 await mockFirebase(page);hub.pages.push(page);
 await page.exposeFunction('__shoppingRead',()=>{if(hub.denied)throw Error('permission-denied');return hub.record;});
 await page.exposeFunction('__shoppingCAS',async(expected,record)=>{
  if(hub.offline)throw Error('Fixture offline');
  if((hub.record?.revision||0)!==expected)return false;
  hub.record=record;hub.writes++;
  await Promise.all(hub.pages.map(p=>p.evaluate(record=>window.__sharedReceive?.(record),record).catch(()=>{})));
  if(hub.lost){hub.lost=false;throw Error('Fixture lost reply');}return true;
 });
 await page.route('https://www.gstatic.com/firebasejs/**/firebase-firestore.js',route=>route.fulfill({contentType:'text/javascript',body:`
 const m=window.__pantryMock;export const getFirestore=()=>({});export const collection=(db,...p)=>({path:p.join('/')});export const doc=(col,id)=>({path:col.path+'/'+id,id});export const serverTimestamp=()=>({fixture:true});
 const snap=record=>({metadata:{fromCache:false},exists:()=>!!record,data:()=>record});
 export const onSnapshot=(ref,...args)=>{const callbacks=args.filter(x=>typeof x==='function'),[next,error]=callbacks;
  if(ref.path.endsWith('/shopping/current')){let live=true;window.__sharedReceive=record=>{if(live)next(snap(record))};window.__shoppingRead().then(r=>{if(live)next(snap(r))}).catch(e=>{if(live)error(e)});return ()=>{live=false};}
  m.watchers.push(next);setTimeout(()=>next({docs:m.docs.map(d=>({id:d.id,data:()=>d.data}))}),0);return ()=>m.watchers=m.watchers.filter(x=>x!==next);
 };
 export const runTransaction=async(db,fn)=>{for(let attempt=0;attempt<8;attempt++){const current=await window.__shoppingRead();let write=null;const result=await fn({get:async()=>snap(current),set:(ref,data)=>{if(!ref.path.endsWith('/shopping/current'))throw Error('Unexpected pantry write');write=data}});if(!write)return result;if(await window.__shoppingCAS(current?.revision||0,write))return result;}throw Error('Transaction contention');};
 export const addDoc=async()=>{throw Error('Unexpected pantry write')};export const updateDoc=addDoc;export const deleteDoc=addDoc;
 `}));
};
