
(()=>{'use strict';
const id=document.querySelector('.recipe-tools')?.dataset.recipeId;if(!id)return;
const key='familyRecipesFavoritesV1',recentKey='familyRecipesRecentV1';
const load=k=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch{return []}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const recent=[id,...load(recentKey).filter(x=>x!==id)].slice(0,12);save(recentKey,recent);
const fav=document.querySelector('.recipe-tools .favorite-toggle');function renderFav(){let yes=load(key).includes(id);fav.setAttribute('aria-pressed',String(yes));fav.textContent=yes?'♥ Saved favorite':'♡ Save favorite'}renderFav();fav.addEventListener('click',()=>{let arr=load(key);save(key,arr.includes(id)?arr.filter(x=>x!==id):[...arr,id]);renderFav()});
document.querySelector('.print-btn')?.addEventListener('click',()=>window.print());
const cook=document.querySelector('.cook-toggle');
document.querySelectorAll('.ingredient-list li').forEach(li=>{li.setAttribute('role','checkbox');li.setAttribute('tabindex','0');li.setAttribute('aria-checked','false');const toggle=()=>{let yes=li.classList.toggle('checked');li.setAttribute('aria-checked',String(yes))};li.addEventListener('click',toggle);li.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle()}})});
document.querySelectorAll('.instruction-list li').forEach((li,i)=>{li.setAttribute('tabindex','0');li.setAttribute('role','button');li.setAttribute('aria-label','Mark step '+(i+1)+' complete');const toggle=()=>{li.classList.toggle('done-step');li.classList.toggle('active-step');};li.addEventListener('click',toggle);li.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle()}})});
// Focused cooking experience, with optional Screen Wake Lock.
const steps=[...document.querySelectorAll('.instruction-list li')];
let activeStep=0, wakeLock=null, wantAwake=false;
const panel=document.createElement('section');panel.className='cook-panel';panel.hidden=true;
panel.setAttribute('aria-label','Step-by-step cooking');
panel.innerHTML='<div class="cook-head"><span class="cook-eyebrow">COOKING MODE</span><button type="button" class="cook-close" aria-label="Exit cooking mode">✕ Exit</button></div><div class="cook-progress-line"><span class="cook-count"></span><span class="cook-percent"></span></div><div class="cook-track"><div class="cook-fill"></div></div><div class="cook-step-card"><p class="cook-step-label"></p><p class="cook-step-text"></p></div><div class="cook-nav"><button type="button" class="cook-prev">← Previous</button><button type="button" class="cook-next">Next step →</button></div><div class="cook-awake"><label><input type="checkbox" class="cook-wake-toggle"> Keep screen awake</label><p class="cook-wake-status" role="status">Off</p></div><details class="cook-ingredients"><summary>View ingredients</summary><ul></ul></details>';
const tools=document.querySelector('.recipe-tools');tools?.insertAdjacentElement('afterend',panel);
const $=sel=>panel.querySelector(sel);
function paintStep(){if(!steps.length)return;$('.cook-count').textContent='Step '+(activeStep+1)+' of '+steps.length;$('.cook-percent').textContent=Math.round((activeStep+1)/steps.length*100)+'%';$('.cook-fill').style.width=((activeStep+1)/steps.length*100)+'%';$('.cook-step-label').textContent='STEP '+(activeStep+1);$('.cook-step-text').textContent=steps[activeStep].textContent;$('.cook-prev').disabled=activeStep===0;$('.cook-next').textContent=activeStep===steps.length-1?'Finish cooking ✓':'Next step →';$('.cook-ingredients ul').innerHTML='';document.querySelectorAll('.ingredient-list li').forEach(li=>{const el=document.createElement('li');el.textContent=li.textContent;$('.cook-ingredients ul').append(el)})}
function awakeStatus(message){$('.cook-wake-status').textContent=message}
async function releaseWake(){if(wakeLock){const old=wakeLock;wakeLock=null;try{await old.release()}catch{}}}
async function acquireWake(){if(!wantAwake||!document.body.classList.contains('cooking-mode'))return;if(!('wakeLock' in navigator)){awakeStatus('Not supported by this browser');return}if(document.visibilityState!=='visible'){awakeStatus('Paused while app is hidden');return}if(wakeLock&&!wakeLock.released){awakeStatus('Screen awake ✓');return}try{const lock=await navigator.wakeLock.request('screen');if(!wantAwake||!document.body.classList.contains('cooking-mode')){await lock.release();return}wakeLock=lock;awakeStatus('Screen awake ✓');lock.addEventListener('release',()=>{if(wakeLock===lock){wakeLock=null;awakeStatus(wantAwake?'Wake lock released by device':'Off')}})}catch(e){awakeStatus('Unable to keep screen awake ('+(e.name||'device restriction')+')')}}
$('.cook-wake-toggle').addEventListener('change',e=>{wantAwake=e.target.checked;if(wantAwake)acquireWake();else{releaseWake();awakeStatus('Off')}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&wantAwake)acquireWake()});
function exitCook(){document.body.classList.remove('cooking-mode');panel.hidden=true;cook?.setAttribute('aria-pressed','false');if(cook)cook.textContent='Cooking mode';wantAwake=false;$('.cook-wake-toggle').checked=false;releaseWake();awakeStatus('Off')}
function enterCook(){document.body.classList.add('cooking-mode');panel.hidden=false;cook?.setAttribute('aria-pressed','true');if(cook)cook.textContent='Exit cooking mode';paintStep();panel.scrollIntoView({behavior:'smooth',block:'start'})}
cook?.addEventListener('click',()=>{if(document.body.classList.contains('cooking-mode'))exitCook();else enterCook()});
$('.cook-close').addEventListener('click',exitCook);
$('.cook-prev').addEventListener('click',()=>{activeStep=Math.max(0,activeStep-1);paintStep()});
$('.cook-next').addEventListener('click',()=>{if(activeStep===steps.length-1){exitCook();return}activeStep++;paintStep()});
const base=Number(document.querySelector('.recipe-tools')?.dataset.baseServings),out=document.querySelector('.serving-output');if(!base||!out)return;let servings=base;
const fractionMap={'¼':.25,'½':.5,'¾':.75,'⅓':1/3,'⅔':2/3,'⅛':.125,'⅜':.375,'⅝':.625,'⅞':.875};
function fraction(s){s=s.trim();if(fractionMap[s])return fractionMap[s];if(/^\d+\/\d+$/.test(s)){const [a,b]=s.split('/').map(Number);return a/b}return Number(s)}
function fmt(n){const whole=Math.floor(n+1e-7),f=n-whole;const options=[[.125,'1/8'],[.25,'1/4'],[1/3,'1/3'],[.375,'3/8'],[.5,'1/2'],[.625,'5/8'],[2/3,'2/3'],[.75,'3/4'],[.875,'7/8']];if(f<.04)return String(Math.round(n));let best=options.reduce((a,b)=>Math.abs(b[0]-f)<Math.abs(a[0]-f)?b:a);if(Math.abs(best[0]-f)<.055)return (whole?whole+' ':'')+best[1];return String(Number(n.toFixed(2)))}
const number='(\\d+(?:\\.\\d+)?(?:\\s+\\d+\\/\\d+)?|\\d+\\/\\d+|[¼½¾⅓⅔⅛⅜⅝⅞])';
// Scale only a leading quantity, leaving ranges and descriptive ingredient text unchanged.
const regex=/^(\d+(?:\.\d+)?(?:\s+\d+\/\d+)?|\d+\/\d+|[¼½¾⅓⅔⅛⅜⅝⅞])(?=\s|,|$)/;
function scaleText(t,ratio){const m=t.match(regex);if(!m)return t;let parts=m[1].split(/\s+/),n=parts.reduce((a,b)=>a+fraction(b),0);if(!Number.isFinite(n))return t;return fmt(n*ratio)+t.slice(m[1].length)}
function update(){out.textContent=String(servings);document.querySelectorAll('.ingredient-list li').forEach(li=>{const original=li.dataset.original||li.textContent;li.textContent=servings===base?original:scaleText(original,servings/base)})}
document.querySelector('.serving-minus')?.addEventListener('click',()=>{servings=Math.max(1,servings-1);update()});document.querySelector('.serving-plus')?.addEventListener('click',()=>{servings=Math.min(40,servings+1);update()});document.querySelector('.serving-reset')?.addEventListener('click',()=>{servings=base;update()});
})();
