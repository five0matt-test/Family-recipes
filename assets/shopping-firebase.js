import {applyShoppingPatch} from './shopping-sync.js';
import {collection,doc,onSnapshot,runTransaction,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
export function shoppingTransport(db,getUser){
 const shoppingDoc=doc(collection(db,'households','family','shopping'),'current');
 return {
  watch(uid,next,error){return onSnapshot(shoppingDoc,{includeMetadataChanges:true},snapshot=>{
   if(getUser()?.uid!==uid||snapshot.metadata?.fromCache)return;
   next(snapshot.exists()?snapshot.data():{revision:0,plan:JSON.stringify({version:1}),applied:[]});
  },error);},
  async commit(uid,operation,empty,validate){
   if(getUser()?.uid!==uid)throw Error('Sign in again before saving.');
   return runTransaction(db,async transaction=>{
    if(getUser()?.uid!==uid)throw Error('Account changed.');
    const snapshot=await transaction.get(shoppingDoc),current=snapshot.exists()?snapshot.data():{revision:0,plan:JSON.stringify(empty()),applied:[]};
    if(current.applied?.includes(operation.id))return current;
    if(!Number.isSafeInteger(current.revision)||typeof current.plan!=='string')throw Error('Shared list data is invalid.');
    const plan=validate(operation.clear?empty():applyShoppingPatch(validate(JSON.parse(current.plan)),operation.patch));
    const serialized=JSON.stringify(plan);if(serialized.length>400000)throw Error('List is too large. Remove some items.');
    const record={version:1,revision:current.revision+1,plan:serialized,applied:[...(Array.isArray(current.applied)?current.applied:[]).slice(-99),operation.id],updatedBy:uid,updatedAt:serverTimestamp()};
    transaction.set(shoppingDoc,record);return record;
   });
  }
 };
}
