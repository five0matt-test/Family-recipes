
(()=>{'use strict';
const id=document.querySelector('.recipe-tools')?.dataset.recipeId;if(!id)return;
const key='familyRecipesFavoritesV1',recentKey='familyRecipesRecentV1';
const load=k=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch{return []}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const recent=[id,...load(recentKey).filter(x=>x!==id)].slice(0,12);save(recentKey,recent);
const fav=document.querySelector('.recipe-tools .favorite-toggle');function renderFav(){let yes=load(key).includes(id);fav.setAttribute('aria-pressed',String(yes));fav.textContent=yes?'♥ Saved favorite':'♡ Save favorite'}renderFav();fav.addEventListener('click',()=>{let arr=load(key);save(key,arr.includes(id)?arr.filter(x=>x!==id):[...arr,id]);renderFav()});
document.querySelector('.print-btn')?.addEventListener('click',()=>window.print());
const cook=document.querySelector('.cook-toggle');cook?.addEventListener('click',()=>{let on=document.body.classList.toggle('cooking-mode');cook.setAttribute('aria-pressed',String(on));cook.textContent=on?'Exit cooking mode':'Cooking mode'});
document.querySelectorAll('.ingredient-list li').forEach(li=>{li.setAttribute('role','checkbox');li.setAttribute('tabindex','0');li.setAttribute('aria-checked','false');const toggle=()=>{let yes=li.classList.toggle('checked');li.setAttribute('aria-checked',String(yes))};li.addEventListener('click',toggle);li.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle()}})});
document.querySelectorAll('.instruction-list li').forEach((li,i)=>{li.setAttribute('tabindex','0');li.setAttribute('role','button');li.setAttribute('aria-label','Mark step '+(i+1)+' complete');const toggle=()=>{li.classList.toggle('done-step');li.classList.toggle('active-step');};li.addEventListener('click',toggle);li.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle()}})});
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
