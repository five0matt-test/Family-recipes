const cards=[...document.querySelectorAll('#planList .plan-card')];
const host=document.getElementById('planList');
const search=document.getElementById('planSearch');
const year=document.getElementById('planYear');
const sort=document.getElementById('planSort');
const getDate=card=>{
 const title=card.querySelector('summary').textContent;
 const m=title.match(/([A-Za-z]+)\s+(\d+)\s*[–-]\s*\d+,\s*(\d{4})/);
 return m?new Date(m[1]+' '+m[2]+', '+m[3]):new Date(0);
};
[...new Set(cards.map(c=>getDate(c).getFullYear()))].sort((a,b)=>b-a).forEach(y=>{
 const option=document.createElement('option');option.value=y;option.textContent=y;year.append(option);
});
function renderPlans(){
 const q=search.value.trim().toLowerCase();
 cards.sort((a,b)=>(getDate(b)-getDate(a))*(sort.value==='oldest'?-1:1));
 let visible=0;
 for(const card of cards){
  host.append(card);
  const show=(!year.value||getDate(card).getFullYear()===Number(year.value))&&(!q||card.textContent.toLowerCase().includes(q));
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