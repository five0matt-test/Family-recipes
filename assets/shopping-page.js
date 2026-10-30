import {initShoppingList} from './shopping-list.js';
import {shoppingTransport} from './shopping-firebase.js';
import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getAuth,GoogleAuthProvider,onAuthStateChanged,signInWithPopup,signOut} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {getFirestore,collection,onSnapshot} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import {firebaseConfig} from './firebase-config.js';
const $=id=>document.getElementById(id);
if(firebaseConfig.apiKey==='REPLACE_ME'||firebaseConfig.projectId==='REPLACE_ME'){
 $('authStatus').textContent='Shopping sign-in needs Firebase configuration.';$('signIn').disabled=true;
}else{
 const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),provider=new GoogleAuthProvider();
 let user=null,unsubscribe=null;
 const shopping=initShoppingList({transport:shoppingTransport(db,()=>user)});
 $('signIn').onclick=async()=>{try{await signInWithPopup(auth,provider);}catch(error){$('authStatus').textContent='Sign-in failed: '+error.message;}};
 $('signOut').onclick=()=>signOut(auth);
 onAuthStateChanged(auth,next=>{
  unsubscribe?.();unsubscribe=null;user=next;shopping.authChanged(user);
  $('app').hidden=!user;$('signIn').hidden=!!user;$('signOut').hidden=!user;
  $('authStatus').textContent=user?'Signed in as '+(user.email||'Google user'):'Sign in to open your household shopping list.';
  if(user)unsubscribe=onSnapshot(collection(db,'households','family','pantry'),snapshot=>shopping.setPantry(snapshot.docs.map(d=>({id:d.id,...d.data()})),'ready'),()=>shopping.setPantry([],'error'));
 });
}
