const cards=[...document.querySelectorAll('#planList .plan-card')];
const host=document.getElementById('planList');
const search=document.getElementById('planSearch');
const year=document.getElementById('planYear');
const sort=document.getElementById('planSort');
// ISO start dates avoid locale parsing and month-spanning title failures.
const getDate=card=>{
 const iso=card.dataset.startDate;
 return /^\d{4}-\d{2}-\d{2}$/.test(iso||'')?new Date(iso+'T12:00:00Z'):null;
};
[...new Set(cards.map(c=>getDate(c)?.getUTCFullYear()).filter(Boolean))].sort((a,b)=>b-a).forEach(y=>{
 const option=document.createElement('option');option.value=y;option.textContent=y;year.append(option);
});
function renderPlans(){
 const q=search.value.trim().toLowerCase();
 cards.sort((a,b)=>{const x=getDate(a),y=getDate(b);return !x?1:!y?-1:(y-x)*(sort.value==='oldest'?-1:1)});
 let visible=0;
 for(const card of cards){
  host.append(card);
  const show=(!year.value||getDate(card)?.getUTCFullYear()===Number(year.value))&&(!q||card.textContent.toLowerCase().includes(q));
  card.hidden=!show;if(show)visible++;
 }
 document.getElementById('planCount').textContent=visible+' week(s) shown';
}
search.addEventListener('input',renderPlans);
year.addEventListener('change',renderPlans);
sort.addEventListener('change',renderPlans);
document.getElementById('expandPlans').onclick=()=>cards.filter(c=>!c.hidden).forEach(c=>c.querySelector('details').open=true);
document.getElementById('collapsePlans').onclick=()=>cards.filter(c=>!c.hidden).forEach(c=>c.querySelector('details').open=false);
renderPlans();