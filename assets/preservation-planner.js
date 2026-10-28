(()=>{"use strict";
const catalog=window.PRESERVATION_CATALOG;
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const units={lb:453.59237,oz:28.349523125,g:1};
const state={harvests:[],allocations:[]};
let nextId=1;
const fmt=g=>g>0&&g<4.5359237?(g<0.001?"<0.001 g":g.toLocaleString(undefined,{maximumFractionDigits:3})+" g"):(g/453.59237).toLocaleString(undefined,{maximumFractionDigits:2})+" lb";
function selectOptions(list){return list.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join("")}
$("planCrop").innerHTML=selectOptions(catalog.crops);
function harvestById(id){return state.harvests.find(x=>x.id===id)}
function allocated(id){return state.allocations.filter(x=>x.harvestId===id).reduce((n,x)=>n+x.grams,0)}
function remaining(h){const grams=h.grams-allocated(h.id);return Math.abs(grams)<=Number.EPSILON*h.grams*8?0:Math.max(0,grams)}
function recipeFor(id){return catalog.entries.find(x=>x.id===id)}
function render(){
const selectedHarvest=$("planHarvestSelect").value,selectedRecipe=$("planRecipeSelect").value;
$("planHarvests").innerHTML=state.harvests.map(h=>'<li><strong>'+esc(h.crop)+'</strong> — '+fmt(h.grams)+' total, '+fmt(remaining(h))+' unallocated <button type="button" data-remove-harvest="'+h.id+'">Remove</button></li>').join("")||'<li>Add a crop to start your plan.</li>';
$("planHarvestSelect").innerHTML=state.harvests.map(h=>'<option value="'+h.id+'">'+esc(h.crop)+' — '+fmt(remaining(h))+' remaining</option>').join("");
if(state.harvests.some(h=>String(h.id)===selectedHarvest))$("planHarvestSelect").value=selectedHarvest;
const h=harvestById(Number($("planHarvestSelect").value))||state.harvests[0];
const choices=h?catalog.entries.filter(e=>e.page&&e.batch&&e.batch.crop===h.crop&&e.batch.grams>0):[];
$("planRecipeSelect").innerHTML=choices.map(e=>'<option value="'+esc(e.id)+'">'+esc(e.title)+' — '+esc(e.batch.label)+'/batch</option>').join("");
if(choices.some(e=>e.id===selectedRecipe))$("planRecipeSelect").value=selectedRecipe;
$("planAllocationHelp").textContent=h?(choices.length?"Select a recipe and number of complete reference batches. Each batch consumes the listed raw primary ingredient quantity.":"No ingredient reference batch is available for this crop yet. It can still be tracked, but not allocated automatically."):"Add a crop before assigning batches.";
$("planAddAllocation").disabled=!choices.length;
$("planAllocations").innerHTML=state.allocations.map((a,i)=>{const h=harvestById(a.harvestId),e=recipeFor(a.recipeId);return '<li><strong>'+esc(e.title)+'</strong> — '+a.batches+' batch(es), '+fmt(a.grams)+' of '+esc(h.crop)+' <a href="'+esc(e.page)+'">Recipe</a> <button type="button" data-remove-allocation="'+i+'">Remove</button></li>'}).join("")||'<li>No batches assigned yet.</li>';
const remainingHtml=state.harvests.map(h=>'<li>'+esc(h.crop)+': '+fmt(remaining(h))+' unallocated</li>').join("");
$("planRemaining").innerHTML=remainingHtml||'<li>No crops added.</li>';
$("planExport").disabled=!state.harvests.length;
}
function refreshChoices(){const h=harvestById(Number($("planHarvestSelect").value));const choices=h?catalog.entries.filter(e=>e.page&&e.batch&&e.batch.crop===h.crop&&e.batch.grams>0):[];$("planRecipeSelect").innerHTML=choices.map(e=>'<option value="'+esc(e.id)+'">'+esc(e.title)+' — '+esc(e.batch.label)+'/batch</option>').join("");$("planAddAllocation").disabled=!choices.length;$("planAllocationHelp").textContent=choices.length?"Only whole reference batches are supported. No shelf-stable canning formulas are scaled.":"No complete recipe with a primary-ingredient batch is available for this crop yet.";}
$("planAddHarvest").addEventListener("click",()=>{const crop=$("planCrop").value,n=Number($("planAmount").value),unit=$("planUnit").value;if(!Number.isFinite(n)||n<=0||n>1000000||!units[unit]){$("planMessage").textContent="Enter a positive weight in pounds, ounces or grams.";return}const grams=n*units[unit];const existing=state.harvests.find(h=>h.crop===crop);if(existing)existing.grams+=grams;else state.harvests.push({id:nextId++,crop,grams});$("planMessage").textContent=crop+" added to your plan.";render();});
$("planHarvestSelect").addEventListener("change",refreshChoices);
$("planAddAllocation").addEventListener("click",()=>{const h=harvestById(Number($("planHarvestSelect").value)),e=recipeFor($("planRecipeSelect").value),batches=Number($("planBatches").value);if(!h||!e||!e.page||!e.batch||e.batch.crop!==h.crop||!Number.isSafeInteger(batches)||batches<1||batches>10000){$("planMessage").textContent="Select a compatible recipe and a positive whole number of batches.";return}const grams=batches*e.batch.grams;const tolerance=Number.EPSILON*Math.max(h.grams,grams)*8;if(grams>h.grams-allocated(h.id)+tolerance){$("planMessage").textContent="Not enough unallocated "+h.crop+" for "+batches+" complete batch(es).";return}state.allocations.push({harvestId:h.id,recipeId:e.id,batches,grams});$("planMessage").textContent=batches+" batch(es) assigned.";render();});
$("planHarvests").addEventListener("click",e=>{const id=Number(e.target.dataset.removeHarvest);if(!id)return;state.harvests=state.harvests.filter(h=>h.id!==id);state.allocations=state.allocations.filter(a=>a.harvestId!==id);render();});
$("planAllocations").addEventListener("click",e=>{if(!("removeAllocation" in e.target.dataset))return;state.allocations.splice(Number(e.target.dataset.removeAllocation),1);render();});
$("planExport").addEventListener("click",()=>{const lines=["FAMILY RECIPES — PRESERVATION PLAN","","Harvests",...state.harvests.map(h=>h.crop+": "+fmt(h.grams)),"","Allocated recipes",...state.allocations.map(a=>{const h=harvestById(a.harvestId),e=recipeFor(a.recipeId);return e.title+" | "+a.batches+" batch(es) | "+fmt(a.grams)+" "+h.crop+" | "+new URL(e.page,location.href).href}),"","Unallocated",...state.harvests.map(h=>h.crop+": "+fmt(remaining(h))),"","Estimates use only primary raw ingredient weights from complete refrigerator/freezer recipes. No finished yields or shelf-stable canning scaling. Only the primary crop is reserved; check all other ingredients, equipment and time separately. Displayed weights are rounded. Plans are not saved after refresh."];const blob=new Blob([lines.join("\n")],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="preservation-plan.txt";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
render();
})();