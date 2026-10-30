import {buildShoppingList,formatAmount,planScope,validatePlan} from './shopping-model.js';
export function initShoppingList(){
 const $=id=>document.getElementById(id),key='familyRecipes.shoppingList.v1';
 let recipes=[],state=null,pantry=[],ready=false,pantryError=false,rows=[],active=[],covered=[],scope='',entered=false;
 const el=(tag,text,className)=>{const node=document.createElement(tag);if(text!=null)node.textContent=text;if(className)node.className=className;return node};
 const statusText=(id,text)=>{if($(id).textContent!==text)$(id).textContent=text};
 const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
 function save(){$('shoppingCopyFallback').hidden=true;try{if(!state.selected.length&&!state.manual.length)localStorage.removeItem(key);else localStorage.setItem(key,JSON.stringify(state));statusText('shoppingSaveStatus','Selections and checkmarks save in this browser. The pantry is unchanged.');}catch{statusText('shoppingSaveStatus','Browser saving is unavailable. Download a copy before leaving. An older saved list may return after refresh.');}}
 function changed(){render();save();}
 function revealTarget(){if(!entered&&location.hash==='#shoppingSection'&&!$('app').hidden){entered=true;requestAnimationFrame(()=>$('shoppingSection').scrollIntoView({block:'start'}));}}
 function recipeControls(){const r=recipes.find(r=>r.id===$('shoppingRecipe').value);if(r){$('shoppingAmountLabel').textContent=r.mode==='batches'?'Whole batches':'Servings';$('shoppingAmount').value=r.baseAmount;}}
 function override(row){return ready?(state.overrides[row.id]||{}):{};}
 function checkKey(row){return row.id+'|'+JSON.stringify([row.needed,row.missing,override(row).buyText||'']);}
 function label(row){const edit=override(row).buyText;if(edit)return edit+' '+row.name;if(row.missing==null){const ratio=row.sources[0]?.ratio||1;return row.baseLabel+(ratio!==1?' (base ingredient; recipe ×'+Number(ratio.toFixed(3))+': confirm amount)':'');}return formatAmount(row.missing/row.factor,row.unit)+' '+row.name;}
 function render(){
  if(!state)return;
  statusText('shoppingPantryStatus',ready?'Comparing with the pantry inventory loaded on this page. Review sizes, substitutions and prepared amounts.':pantryError?'Pantry could not be checked. Full recipe quantities are shown; verify inventory before buying.':'Waiting for the shared pantry. Quantities below have not been checked against inventory.');
  if(ready){scope=planScope(state.selected,state.includeOptional,pantry,today());if(scope!==state.scope){state.scope=scope;state.overrides={};save();}}
  rows=buildShoppingList({recipes,selected:state.selected,pantry,includeOptional:state.includeOptional,ready,today:today()});
  active=rows.filter(r=>!r.covered&&!override(r).haveEnough);covered=rows.filter(r=>r.covered||override(r).haveEnough);
  if(ready){const keys=new Set(active.map(checkKey));const checked=state.checked.filter(k=>keys.has(k));if(checked.length!==state.checked.length){state.checked=checked;save();}}
  $('shoppingOptional').checked=state.includeOptional;
  const selected=$('shoppingSelected');selected.replaceChildren();
  for(const s of state.selected){const r=recipes.find(r=>r.id===s.id);const li=el('li');const link=el('a',r.name);link.href=r.href;li.append(link,el('span',s.amount+' '+r.mode));const remove=el('button','Remove');remove.type='button';remove.setAttribute('aria-label','Remove '+r.name+' from shopping plan');remove.onclick=()=>{state.selected=state.selected.filter(x=>x.id!==s.id);changed();$('shoppingRecipe').focus()};li.append(remove);selected.append(li);}
  if(!state.selected.length)selected.append(el('li','Choose recipes to build your list.'));
  const host=$('shoppingRows');host.replaceChildren();
  for(const row of active){
   const li=el('li',null,'shopping-item'),checkLabel=el('label',null,'shopping-check'),check=el('input');check.type='checkbox';check.checked=ready&&state.checked.includes(checkKey(row));check.disabled=!ready;const title=el('span',label(row),'shopping-label');title.id='shopping-title-'+active.indexOf(row);checkLabel.append(check,title);li.append(checkLabel);li.classList.toggle('shopping-checked',check.checked);
   check.onchange=()=>{state.checked=state.checked.filter(x=>x!==checkKey(row));if(check.checked)state.checked.push(checkKey(row));li.classList.toggle('shopping-checked',check.checked);save()};
   if(row.review)li.append(el('p','Review: '+row.review,'shopping-review'));
   else if(row.needed!=null)li.append(el('p','Needed '+formatAmount(row.needed/row.factor,row.unit)+'; pantry '+formatAmount(row.available/row.factor,row.unit)+'; buy '+formatAmount(row.missing/row.factor,row.unit)+'.','shopping-context'));
   if(row.review&&row.candidates.length)li.append(el('p','Possible pantry items (not assumed interchangeable): '+row.candidates.map(x=>x.name+' — '+x.quantity+' '+x.unit+' in '+x.location+(x.expires?', best by '+x.expires:'')+(x.notes?' ('+x.notes+')':'')).join('; '),'shopping-context'));
   const details=el('details'),summary=el('summary','Review amount and recipe details');summary.setAttribute('aria-describedby',title.id);details.append(summary);
   const list=el('ul');for(const source of row.sources){const item=el('li');const a=el('a',source.recipe+' — '+source.amount+' '+source.mode);a.href=source.href;item.append(a,el('p','Base recipe: '+source.raw));list.append(item)}details.append(list);
   const amountLabel=el('label','Buy amount, if you want to change it'),amount=el('input');amount.type='text';amount.maxLength=120;amount.placeholder=row.missing==null?'For example: 2 jars':formatAmount(row.missing/row.factor,row.unit);amount.value=override(row).buyText||'';amount.disabled=!ready;amount.setAttribute('aria-describedby',title.id);amountLabel.append(amount);details.append(amountLabel);
   amount.onchange=()=>{state.overrides[row.id]={...override(row),buyText:amount.value.trim().slice(0,120)};title.textContent=label(row);$('shoppingSummary').textContent=state.selected.length+' recipe(s), '+active.length+' item(s) to buy, '+active.filter(r=>r.review&&!override(r).buyText).length+' to review.';save()};
   const have=el('button','I have enough');have.type='button';have.setAttribute('aria-label','I have enough — '+row.name);have.disabled=!ready;have.onclick=()=>{state.overrides[row.id]={...override(row),haveEnough:true};changed();$('shoppingStatus').textContent='Marked as available. It is listed under covered ingredients.'};details.append(have);li.append(details);host.append(li);
  }
  if(!active.length)host.append(el('li',state.selected.length?'No recipe ingredients left to buy.':'Your recipe shopping list will appear here.'));
  $('shoppingSummary').textContent=state.selected.length+' recipe(s), '+active.length+' item(s) to buy, '+active.filter(r=>r.review&&!override(r).buyText).length+' to review.';
  const coveredHost=$('shoppingCovered');coveredHost.replaceChildren();
  for(const row of covered){const li=el('li',(override(row).haveEnough?'Confirmed by you: ':'Pantry covers: ')+(row.needed==null?row.name:formatAmount(row.needed/row.factor,row.unit)+' '+row.name));if(override(row).haveEnough){const undo=el('button','Put back on list');undo.type='button';undo.setAttribute('aria-label','Put '+row.name+' back on list');undo.onclick=()=>{delete state.overrides[row.id];changed()};li.append(' ',undo)}coveredHost.append(li)}
  if(!covered.length)coveredHost.append(el('li','No ingredients marked as covered yet.'));
  const manual=$('shoppingManualItems');manual.replaceChildren();
  for(const item of state.manual){const li=el('li',null,'shopping-item'),label=el('label',null,'shopping-check'),check=el('input');check.type='checkbox';check.checked=item.checked;label.append(check,el('span',item.text,'shopping-label'));li.append(label);li.classList.toggle('shopping-checked',item.checked);check.onchange=()=>{item.checked=check.checked;li.classList.toggle('shopping-checked',check.checked);save()};const remove=el('button','Remove');remove.type='button';remove.setAttribute('aria-label','Remove extra item '+item.text);remove.onclick=()=>{state.manual=state.manual.filter(x=>x.id!==item.id);changed();$('shoppingManualText').focus()};li.append(remove);manual.append(li)}
  if(!state.manual.length)manual.append(el('li','No extra items.'));
  const empty=!state.selected.length&&!state.manual.length;for(const id of ['shoppingCopy','shoppingDownload','shoppingClear'])$(id).disabled=empty;
 }
 function exportText(){
  render();
  return ['FAMILY RECIPES — SHOPPING LIST','',...state.selected.map(s=>{const r=recipes.find(r=>r.id===s.id);return r.name+' — '+s.amount+' '+r.mode}),'',ready?'Compared with shared pantry.':'PANTRY NOT CHECKED — verify full quantities below.','','To buy',...active.map(row=>'['+(ready&&state.checked.includes(checkKey(row))?'x':' ')+'] '+label(row)+(row.review&&!override(row).buyText?' — REVIEW':'')),'','Covered',...covered.map(row=>(override(row).haveEnough?'Confirmed by you: ':'Pantry covers: ')+(row.needed==null?row.name:formatAmount(row.needed/row.factor,row.unit)+' '+row.name)),'','Extra items',...state.manual.map(item=>'['+(item.checked?'x':' ')+'] '+item.text),'','Review ingredient choices, package sizes, preparation and units. Amounts are estimates. This list does not reserve or deduct pantry inventory.'].join('\n');
 }
 window.addEventListener('hashchange',()=>{entered=false;revealTarget()});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
 $('shoppingRecipe').onchange=recipeControls;
 $('shoppingAdd').onclick=()=>{if(!state)return;const id=$('shoppingRecipe').value,amount=Number($('shoppingAmount').value);if(!recipes.some(r=>r.id===id)||!Number.isInteger(amount)||amount<1||amount>1000){$('shoppingStatus').textContent='Choose a recipe and a whole number from 1 to 1,000.';return;}const old=state.selected.find(s=>s.id===id);if(old)old.amount=amount;else state.selected.push({id,amount});changed();$('shoppingStatus').textContent='Recipe quantities updated. Review the shopping list below.';};
 $('shoppingOptional').onchange=()=>{if(state){state.includeOptional=$('shoppingOptional').checked;changed()}};
 $('shoppingAddManual').onclick=()=>{if(!state)return;const text=$('shoppingManualText').value.trim();if(!text||text.length>200||state.manual.length>=200){$('shoppingStatus').textContent='Enter an extra item (up to 200 characters); the list can keep 200 extras.';return;}state.manual.push({id:crypto.randomUUID(),text,checked:false});$('shoppingManualText').value='';changed()};
 $('shoppingClear').onclick=()=>{if(!state||!confirm('Clear recipe selections, extra shopping items and checkmarks from this browser?'))return;state=validatePlan(null,recipes);changed();$('shoppingStatus').textContent='Shopping list cleared. Pantry items were not changed.';$('shoppingRecipe').focus()};
 $('shoppingDownload').onclick=()=>{const blob=new Blob([exportText()],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='family-shopping-list.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 $('shoppingCopy').onclick=async()=>{render();const text=[...active.filter(row=>!ready||!state.checked.includes(checkKey(row))).map(row=>label(row)+(row.review&&!override(row).buyText?' — REVIEW':'')),...state.manual.filter(item=>!item.checked).map(item=>item.text)].join('\n');if(!text){$('shoppingStatus').textContent='All shopping items are checked off. Nothing remains to copy.';return;}try{await navigator.clipboard.writeText(text);$('shoppingStatus').textContent='Remaining shopping items copied.';$('shoppingCopyFallback').hidden=true;}catch{$('shoppingCopyFallback').hidden=false;$('shoppingCopyText').value=text;$('shoppingCopyText').focus();$('shoppingCopyText').select();$('shoppingStatus').textContent='Select and copy the text below, or download the list.';}};
 fetch(new URL('./shopping-recipes.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('Recipe catalog did not load.');return r.json()}).then(data=>{
  if(!Array.isArray(data)||!data.length||data.some(r=>!r.id||!r.href||!Number.isFinite(r.baseAmount)||r.baseAmount<=0||!Array.isArray(r.ingredients)))throw Error('Recipe catalog is invalid.');recipes=data;
  const select=$('shoppingRecipe');select.replaceChildren();for(const group of [...new Set(recipes.map(r=>r.group))]){const options=el('optgroup');options.label=group;for(const r of recipes.filter(r=>r.group===group))options.append(new Option(r.name,r.id));select.append(options)}
  let stored=null;try{const raw=localStorage.getItem(key);if(raw&&raw.length<=500000)stored=JSON.parse(raw);}catch{$('shoppingSaveStatus').textContent='No saved shopping plan could be read. You can start a new list.';}
  state=validatePlan(stored,recipes);$('shoppingFields').disabled=false;recipeControls();render();revealTarget();
 }).catch(error=>{$('shoppingStatus').textContent='Shopping recipes could not be loaded. '+error.message;});
 return {setPantry(items,status){$('shoppingCopyFallback').hidden=true;pantry=items;ready=status==='ready';pantryError=status==='error';render();revealTarget();},authChanged(){pantry=[];ready=false;pantryError=false;render();}};
}
