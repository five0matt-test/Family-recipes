import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {getFirestore,collection,onSnapshot,doc,setDoc} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import {firebaseConfig} from './firebase-config.js';
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const col=collection(db,'households','family','recipePreferences');
let stop=null;
window.recipePrefs={signedIn:false,ready:false,data:{},async update(id,changes){
 if(!auth.currentUser)throw Error('Sign in to save shared ratings, favorites and archived recipes.');
 await setDoc(doc(col,id),changes,{merge:true});
}};
const status=document.getElementById('sharedStatus'),login=document.getElementById('recipeSignIn'),logout=document.getElementById('recipeSignOut');
const notify=()=>window.dispatchEvent(new Event('recipe-preferences-changed'));
login.onclick=async()=>{status.textContent='Opening Google sign-in…';try{await signInWithPopup(auth,new GoogleAuthProvider())}catch(e){status.textContent='Sign-in failed: '+e.message}};
logout.onclick=()=>signOut(auth);
onAuthStateChanged(auth,user=>{
 if(stop){stop();stop=null;}
 window.recipePrefs.signedIn=!!user;window.recipePrefs.ready=false;window.recipePrefs.data={};
 login.hidden=!!user;logout.hidden=!user;
 status.textContent=user?'Loading household recipe preferences…':'Sign in to share ratings, favorites and archived recipes.';
 notify();
 if(user)stop=onSnapshot(col,snap=>{
  window.recipePrefs.data=Object.fromEntries(snap.docs.map(d=>[d.id,d.data()]));
  window.recipePrefs.ready=true;status.textContent='Shared with your household';notify();
 },e=>{status.textContent='Cannot load shared recipe preferences: '+e.message;notify()});
});