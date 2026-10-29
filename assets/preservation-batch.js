// Recipe-to-pantry batch entry. Quantities are measured by the cook, never inferred from raw harvests.
export function initPreservationBatch({catalog,getUser,saveBatch}){
 const $=id=>document.getElementById(id),panel=$('preservationBatch');
 const id=new URLSearchParams(location.search).get('preservation');
 if(!id)return {authChanged(){}};
 const recipe=catalog?.entries.find(e=>e.id===id&&e.storage!=='Reference'&&(e.page||/^https:\/\//.test(e.url||'')));
 if(!recipe){panel.hidden=false;$('batchStatus').textContent='This preservation recipe or food project was not found. Choose one from the Preservation Library. Reference-only safety guides do not create food batches.';return {authChanged(){}};}
 const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
 const external=!recipe.page;
 const recipeUrl=external?new URL(recipe.url).href:new URL(recipe.page,new URL('../preservation/',location.href)).href;
 const allowedLocations=recipe.storage==='Frozen'?['Freezer','Garage freezer']:recipe.storage==='Refrigerated'?['Refrigerator']:recipe.storage==='Shelf-stable'?['Pantry','Refrigerator']:['Pantry'];
 const allowedUnits=['jar','portion','each','cup','lb','oz','g','kg','fl oz','ml','L','package'];
 let token=crypto.randomUUID(),busy=false,saved=false;
 panel.hidden=false;$('batchRecipe').textContent=recipe.title;$('batchRecipeLink').href=recipeUrl;
 if(external){$('batchRecipeLink').textContent='Read original source and storage guidance ↗';$('batchRecipeLink').target='_blank';$('batchRecipeLink').rel='noopener noreferrer';$('batchSourceHint').hidden=false;}
 for(const value of allowedLocations)$('batchLocation').add(new Option(value,value));
 for(const value of allowedUnits)$('batchUnit').add(new Option(value,value));
 function defaults(){
  $('batchName').value=recipe.title.slice(0,120);$('batchQuantity').value='';$('batchUnit').value=recipe.storage==='Refrigerated'?'jar':recipe.storage==='Frozen'?'portion':'jar';
  $('batchLocation').value=allowedLocations[0];$('batchPrepared').value=today();$('batchPrepared').max=today();$('batchExpires').value='';$('batchNotes').value='';
 }
 function authChanged(){
  $('batchFields').disabled=!getUser()||busy||saved;$('batchAnother').hidden=!saved;
  $('batchAuthHint').textContent=getUser()?'Review the actual amount made, then save this batch to your shared pantry.':'Sign in with Google above to record this batch. Nothing is added until you review and save it.';
 }
 defaults();authChanged();
 $('batchForm').addEventListener('submit',async event=>{
  event.preventDefault();if(busy||saved)return;if(!getUser()){authChanged();return;}
  const name=$('batchName').value.trim(),quantity=Number($('batchQuantity').value),unit=$('batchUnit').value,storage=$('batchLocation').value,preparedOn=$('batchPrepared').value,expires=$('batchExpires').value,notes=$('batchNotes').value.trim();
  const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
  if(!name||name.length>120||!Number.isFinite(quantity)||quantity<=0||quantity>100000||!allowedUnits.includes(unit)||!allowedLocations.includes(storage)||!validDate(preparedOn)||preparedOn>today()||(expires&&(!validDate(expires)||expires<preparedOn))||notes.length>500){$('batchStatus').textContent='Check the name, positive quantity, storage location and dates. The preparation date cannot be in the future, and best by cannot be before preparation.';return;}
  const values={name,quantity,unit,location:storage,preparedOn,expires,notes,preservationBatch:true,recipeId:recipe.id,recipeUrl};
  busy=true;authChanged();$('batchStatus').textContent='Saving batch…';
  try{
   const result=await saveBatch(token,values);saved=true;
   $('batchStatus').textContent=result?.alreadySaved?'This batch was already recorded. No duplicate was added. Check the inventory below for its saved details.':'Batch added to your shared pantry as a separate entry.';
  }catch(error){$('batchStatus').textContent='Could not confirm the save. '+(error.message||'Try again.')+' You can retry this batch without adding a duplicate.';}
  finally{busy=false;authChanged();}
 });
 $('batchAnother').addEventListener('click',()=>{token=crypto.randomUUID();saved=false;defaults();$('batchStatus').textContent='Enter the amount for the next separate batch.';authChanged();$('batchQuantity').focus();});
 return {authChanged};
}
