// Conservative matching: no fuzzy subtraction or mass/volume/count conversions.
const fractions={'¼':'1/4','½':'1/2','¾':'3/4','⅓':'1/3','⅔':'2/3','⅛':'1/8','⅜':'3/8','⅝':'5/8','⅞':'7/8'};
const plural={tomatoes:'tomato',potatoes:'potato',leaves:'leaf',onions:'onion',peppers:'pepper',cloves:'clove',eggs:'egg',limes:'lime',lemons:'lemon',carrots:'carrot',radishes:'radish',cucumbers:'cucumber',avocados:'avocado',beans:'bean',nuts:'nut',stalks:'stalk',sprigs:'sprig',ears:'ear',thighs:'thigh',shells:'shell',tortillas:'tortilla',figs:'fig',leeks:'leek',jalapenos:'jalapeno',satsumas:'satsuma',mandarins:'mandarin'};
export function canonicalName(value){return String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).map(w=>plural[w]||w).join(' ')}
const factors={g:['mass',1],kg:['mass',1000],oz:['mass',28.349523125],lb:['mass',453.59237],ml:['volume',1],l:['volume',1000],'fl oz':['volume',29.5735295625],tsp:['volume',4.92892159375],tbsp:['volume',14.78676478125],cup:['volume',236.5882365],gallon:['volume',3785.411784],each:['each',1],clove:['clove',1],stalk:['stalk',1],sprig:['sprig',1],ear:['ear',1],can:['can',1],jar:['jar',1],package:['package',1],bunch:['bunch',1],portion:['portion',1]};
const aliases={pound:'lb',pounds:'lb',lbs:'lb',ounce:'oz',ounces:'oz',gram:'g',grams:'g',kilogram:'kg',kilograms:'kg',cups:'cup',tablespoon:'tbsp',tablespoons:'tbsp',teaspoon:'tsp',teaspoons:'tsp',milliliter:'ml',milliliters:'ml',liter:'l',liters:'l',gallons:'gallon',cloves:'clove',stalks:'stalk',sprigs:'sprig',ears:'ear',cans:'can',jars:'jar',packages:'package',bunches:'bunch',portions:'portion',pieces:'each',piece:'each'};
export function unitInfo(value){const key=String(value||'').toLowerCase().trim();const unit=aliases[key]||key;return factors[unit]?{unit,dimension:factors[unit][0],factor:factors[unit][1]}:null}
const unitPattern='fl\\s+oz|pounds?|lbs?|ounces?|oz|kilograms?|kg|grams?|g|cups?|tablespoons?|tbsp|teaspoons?|tsp|milliliters?|ml|liters?|l|gallons?|cloves?|stalks?|sprigs?|ears?|cans?|jars?|packages?|bunch(?:es)?|portions?|pieces?|each';
const numberPattern='(?:\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:\\.\\d+)?)';
function number(text){return text.trim().split(/\s+/).reduce((sum,p)=>{if(p.includes('/')){const [a,b]=p.split('/').map(Number);return sum+(b?a/b:NaN)}return sum+Number(p)},0)}
function cleanName(value){
 return value.replace(/\([^)]*\)/g,' ').replace(/^(?:,\s*)?(?:(?:packed|loosely packed|large|medium|small|young|tender|sound|ripe|mature|cured|dry)\s*,?\s*)+/i,'').replace(/^(?:,\s*)?(?:(?:sliced into wide strips|finely shredded|finely chopped|finely grated|very thinly|thinly sliced|finely diced|thin matchsticks|washed and dried|shaved or grated|cut in 1-inch|chopped|shredded|grated|sliced|diced|julienned|torn|melted|minced|peeled)\s*,?\s*)+/i,'').replace(/,.*$/,'').replace(/\s+(?:drained\/rinsed|finely minced|sliced|separated|pieces|or coins)$/i,'').replace(/^,\s*/,'').trim();
}
export function parseIngredient(raw){
 const optional=/\boptional\b/i.test(raw);let text=String(raw).replace(/[¼½¾⅓⅔⅛⅜⅝⅞]/g,c=>' '+fractions[c]).trim();const original=text;
 text=text.replace(/^optional:\s*/i,'');const matched=text.match(new RegExp('^('+numberPattern+')(?=\\s|,|$)\\s*(.*)$','i'));
 if(!matched){
  let name=text.replace(new RegExp('^'+numberPattern+'\\s*[–-]\\s*'+numberPattern+'\\s*,?\\s*','i'),'').replace(new RegExp('^('+unitPattern+')\\b\\s*','i'),'').replace(/^(?:to taste|for serving)\s*/i,'');name=cleanName(name)||raw;
  return {raw,name,key:canonicalName(name),amount:null,unit:'',review:'Check the amount or optional garnish.',optional};
 }
 const amount=number(matched[1]);let rest=matched[2].trim(),unit='each';
 if(/^(?:x\b|×)/i.test(rest)){const name=cleanName(rest.replace(/^(?:x|×)\s*\d+(?:\.\d+)?[-\s]*(?:oz|g|lb)\s*(?:cans?|jars?|packages?)\s*,?\s*/i,''))||raw;return {raw,name,key:canonicalName(name),amount:null,unit:'',review:'Check the package quantity for the selected recipe amount.',optional};}
 rest=rest.replace(/^(?:(?:loosely\s+)?packed|small|large|medium)\s+(?=(?:cloves?|stalks?|cups?|ears?)\b)/i,'');const match=rest.match(new RegExp('^('+unitPattern+')(?=\\b|\\s|,|$)\\s*(.*)$','i'));
 if(match){unit=unitInfo(match[1])?.unit||match[1];rest=match[2];}
 // "4 garlic cloves" is a clove count, not four bulbs of garlic.
 if(unit==='each'&&/^garlic cloves?\b/i.test(rest)){unit='clove';rest=rest.replace(/^garlic cloves?/i,'garlic');}
 let name=cleanName(rest)||raw;const info=unitInfo(unit);let review='';
 if(!Number.isFinite(amount)||amount<=0||!info)review='Check the amount and unit.';
 if(/\b(?:cans?|jars?|packages?|bunch(?:es)?|portions?)\b/i.test(original))review='Check the package or portion size.';
 if(/\b(?:or|and)\b|[+&/]/i.test(name))review='Choose the ingredient or check the combined item.';
 if(/^x\b/i.test(rest)||/\d\s*[–-]\s*\d/.test(original)||/\d\s*\/\s*\d\s*[–-]/.test(original))review='Check the range or package quantity.';
 if(/\b(?:large|medium|small|ear|ears)\b/i.test(original)&&unit==='each')review='Check the produce size or count.';
 if(info?.dimension==='volume'&&/\b(?:packed|chopped|shredded|grated|torn|cut|diced|sliced)\b/i.test(original))review='Measure the prepared ingredient amount.';
 if(/\b(?:plus more|as needed|to taste|plus garnish)\b|\+\s*more/i.test(original))review='Check any extra amount or seasoning.';
 // A preparation phrase left before the ingredient is not an exact name match.
 if(/^(?:for|if|plus|from|cut|washed|rinsed)\b/i.test(name))review='Check the ingredient name and amount.';
 return {raw,name,key:canonicalName(name),amount:Number.isFinite(amount)&&amount>0?amount:null,unit:info?.unit||unit,dimension:info?.dimension,factor:info?.factor,review,optional};
}
export function formatAmount(value,unit){if(value==null)return '';if(value>0&&value<0.001)return '<0.001 '+unit;return Number(value.toFixed(3)).toLocaleString(undefined,{maximumFractionDigits:3})+' '+(unit==='l'?'L':unit)}
export function planScope(selected,includeOptional,pantry,today=''){const text=JSON.stringify([selected.map(x=>[x.id,x.amount]).sort(),includeOptional,pantry.map(x=>[x.id,x.name,x.quantity,x.unit,x.location,x.expires||'',x.notes||'',x.preparedOn||'',!!(x.expires&&today&&x.expires<today)]).sort((a,b)=>String(a[0]).localeCompare(String(b[0])))]);let hash=2166136261;for(const c of text){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619)}return String(hash>>>0)}
export function validatePlan(value,recipes){
 const result={version:1,selected:[],includeOptional:false,manual:[],scope:'',overrides:{},checked:[]};
 if(!value||value.version!==1)return result;
 for(const x of (Array.isArray(value.selected)?value.selected:[]).slice(0,recipes.length*2)){if(recipes.some(r=>r.id===x?.id)&&Number.isInteger(x.amount)&&x.amount>=1&&x.amount<=1000&&!result.selected.some(r=>r.id===x.id))result.selected.push({id:x.id,amount:x.amount});}
 result.includeOptional=value.includeOptional===true;
 for(const x of (Array.isArray(value.manual)?value.manual:[]).slice(0,200))if(x&&typeof x.id==='string'&&x.id.length<=100&&typeof x.text==='string'&&x.text.trim()&&x.text.length<=200&&!result.manual.some(m=>m.id===x.id))result.manual.push({id:x.id,text:x.text.trim(),checked:x.checked===true});
 if(typeof value.scope==='string'&&value.scope.length<50)result.scope=value.scope;
 if(value.overrides&&typeof value.overrides==='object')for(const [key,x] of Object.entries(value.overrides).slice(0,1000))if(!['__proto__','constructor','prototype'].includes(key)&&key.length<500&&x&&typeof x==='object')result.overrides[key]={haveEnough:x.haveEnough===true,buyText:typeof x.buyText==='string'?x.buyText.slice(0,120):''};
 result.checked=(Array.isArray(value.checked)?value.checked:[]).filter(x=>typeof x==='string'&&x.length<500).slice(0,1000);return result;
}
export function buildShoppingList({recipes,selected,pantry=[],includeOptional=false,ready=false,today}){
 const groups=new Map();
 for(const selection of selected){const recipe=recipes.find(r=>r.id===selection.id);if(!recipe)continue;const ratio=selection.amount/recipe.baseAmount;
  recipe.ingredients.forEach((raw,index)=>{const item=parseIngredient(raw);if(item.optional&&!includeOptional)return;const known=item.amount!=null&&item.dimension;const id=known?item.key+'|'+item.dimension:'manual|'+recipe.id+'|'+index;
   let row=groups.get(id);if(!row){row={id,name:item.name,baseLabel:item.raw,key:item.key,unit:item.unit,factor:item.factor||1,needed:known?0:null,review:item.review,sources:[],candidates:[]};groups.set(id,row)}
   if(known)row.needed+=item.amount*item.factor*ratio;if(item.review)row.review=item.review;row.sources.push({recipe:recipe.name,href:recipe.href,amount:selection.amount,ratio,mode:recipe.mode,raw});
  });
 }
 for(const row of groups.values()){
  const dimension=row.id.split('|').at(-1);let available=0;const candidates=[];
  for(const item of pantry){const key=canonicalName(item.name),info=unitInfo(item.unit),quantity=Number(item.quantity);const exact=key===row.key;const related=exact||row.key.split(' ').some(w=>w.length>3&&key.split(' ').includes(w));if(related)candidates.push(item);
   const currentDate=!item.expires||(/^\d{4}-\d{2}-\d{2}$/.test(item.expires)&&item.expires>=today);
   if(exact&&info&&info.dimension===dimension&&currentDate&&Number.isFinite(quantity)&&quantity>0)available+=quantity*info.factor;
  }
  row.candidates=candidates.slice(0,4);row.available=ready?available:0;
  if(!ready)row.review='Pantry has not been checked yet.';
  else if(row.needed!=null&&!row.review&&available===0&&candidates.length)row.review='Check the pantry name, unit, preparation or best-by date.';
  const tolerance=Number.EPSILON*Math.max(row.needed||0,row.available)*16;
  row.missing=row.needed==null?null:Math.max(0,row.needed-(row.review?0:row.available));if(row.missing!=null&&row.missing<=tolerance)row.missing=0;
  row.covered=ready&&!row.review&&row.missing===0;
 }
 return [...groups.values()].sort((a,b)=>a.name.localeCompare(b.name));
}
