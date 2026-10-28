// Run a local server at port 8765, then: node tests/preservation.cjs
// Requires Playwright and its Chromium/WebKit browser installations.
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const catalogContext={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/preservation-data.js'),'utf8'),catalogContext);
const catalog=catalogContext.window.PRESERVATION_CATALOG;
const entries=catalog.entries.filter(e=>e.photo);
const completeEntries=catalog.entries.filter(e=>e.page);
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8765/';
(async()=>{
assert.equal(entries.length,11);
for(const e of entries){
 const image=path.resolve(__dirname,'../preservation',e.photo);
 assert.ok(fs.existsSync(image),e.photo);
 const html=fs.readFileSync(path.resolve(__dirname,'../preservation',e.page),'utf8');
 const structured=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
 const normalize=s=>s.replace(/&amp;/g,'&').replace(/<[^>]+>/g,'').trim();
 const visibleSteps=[...html.match(/<ol>(.*?)<\/ol>/s)[1].matchAll(/<li>(.*?)<\/li>/gs)].map(m=>normalize(m[1]));
 assert.deepEqual(visibleSteps,structured.recipeInstructions.map(s=>s.text),e.page+' structured instructions');
 assert.ok(html.includes('Original recipe:'));
 assert.ok(html.includes('40°F'));
 if(e.storage==='Frozen')assert.ok(html.includes('0°F'));
 assert.ok(html.includes('src="../../assets/preservation-images/'+path.basename(image)+'"'),e.page);
}
for(const name of (process.env.TEST_BROWSERS||"chromium,webkit").split(",")){
 const type={chromium,webkit}[name];
 const browser=await type.launch({headless:true,...(name==='chromium'&&process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH}:{})});
 for(const width of (process.env.TEST_WIDTHS||"1280,844,430,390,375,320").split(",").map(Number)){
  const page=await browser.newPage({viewport:{width,height:width===844?390:900},isMobile:width<500,hasTouch:width<500,deviceScaleFactor:width<500?3:1,acceptDownloads:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
  const visit=async p=>{await page.goto(new URL(p,base).href);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),p+' horizontal overflow');};
  await visit('preservation/index.html');
  assert.equal(await page.locator('.pres-photo').count(),11);
  const heights=await page.locator(".pres-photo").evaluateAll(images=>images.map(i=>i.getBoundingClientRect().height));
  assert.equal(new Set(heights).size,1);
  for(const img of await page.locator('.pres-photo').all()){
   await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());
   assert.equal(await img.evaluate(i=>getComputedStyle(i).objectFit),'cover');
  }
  const checkCards=async expected=>{
   assert.deepEqual(await page.locator('.pres-card h2').allTextContents(),Array.from(expected,e=>e.title));
   assert.equal(await page.locator('#count').innerText(),expected.length+' projects');
  };
  for(const crop of catalog.crops){await page.locator('#crop').selectOption(crop);await checkCards(catalog.entries.filter(e=>e.crops.includes(crop)))}
  await page.locator('#crop').selectOption('');
  for(const method of new Set(catalog.entries.map(e=>e.method))){await page.locator('#method').selectOption(method);await checkCards(catalog.entries.filter(e=>e.method===method))}
  await page.locator('#method').selectOption('');
  for(const flavor of new Set(catalog.entries.map(e=>e.flavor))){await page.locator('#flavor').selectOption(flavor);await checkCards(catalog.entries.filter(e=>e.flavor===flavor))}
  await page.locator('#flavor').selectOption('');await page.locator('#completeOnly').check();await checkCards(completeEntries);
  if(width===390){const style=await page.addStyleTag({content:'html{font-size:200%}'});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'200% library text overflow');await style.evaluate(e=>e.remove())}
  await page.locator('#q').fill('  PESTO  ');await checkCards(completeEntries.filter(e=>[e.title,e.notes,e.flavor,...e.crops].join(' ').toLowerCase().includes('pesto')));
  await page.locator('#crop').selectOption('Genovese / sweet basil');await page.locator('#method').selectOption('Freezing');await page.locator('#flavor').selectOption('Italian');await checkCards(entries.filter(e=>e.id==='p20'));
  await page.locator('#q').fill('nothing-matches-xyz');await checkCards([]);assert.ok((await page.locator('#cards').innerText()).includes('No matching'));
  await visit('preservation/index.html');await page.locator('.pres-actions a[href="harvest.html"]').click();assert.ok(page.url().endsWith('/preservation/harvest.html'));
  const navPage=await browser.newPage();
  for(const [label,target] of [['Recipes','index.html'],['Weekly meal plans','plans/index.html'],['Shared pantry','pantry/index.html']]){
   await navPage.goto(new URL('preservation/index.html',base).href);
   await navPage.getByRole('navigation').getByRole('link',{name:label,exact:true}).click();assert.ok(navPage.url().endsWith('/'+target));
   await navPage.locator('a[href*="preservation/index.html"]').first().click();assert.ok(navPage.url().endsWith('/preservation/index.html'));
  }
  await navPage.close();
  for(const e of entries){
   await visit('preservation/'+e.page);const img=page.locator('.pres-recipe-photo');await img.evaluate(i=>i.decode());assert.equal(await img.count(),1);assert.ok(await img.evaluate(i=>i.naturalWidth>0&&i.getBoundingClientRect().width<=innerWidth));
   if(width===390){await page.addStyleTag({content:'html{font-size:200%}'});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'200% recipe text overflow')}
   await page.getByRole('link',{name:'Use in Harvest Helper',exact:true}).click();assert.ok(page.url().includes('/preservation/harvest.html?crop='));
   const selected=await page.locator('#harvestCrop').inputValue();assert.ok(e.crops.includes(selected));
  }
  await visit('preservation/harvest.html?crop=Tomatillos');
  assert.equal(await page.locator('#harvestCrop').inputValue(),'Tomatillos');
  assert.ok(await page.locator('.pres-equipment label').evaluateAll(labels=>labels.every(l=>l.getBoundingClientRect().height>=44)));
  if(width<500)assert.ok(await page.locator('#planRecipeSelect').evaluate(e=>e.getBoundingClientRect().width>200));
  const select=async(id,value)=>page.locator('#'+id).selectOption(value);
  const fill=async(id,value)=>page.locator('#'+id).fill(String(value));
  const click=async id=>page.locator('#'+id).click();
  const contains=async(id,text)=>assert.ok((await page.locator('#'+id).innerText()).includes(text),id+' should contain '+text);
  const add=async(crop,amount,unit='lb')=>{await select('planCrop',crop);await fill('planAmount',amount);await select('planUnit',unit);await click('planAddHarvest');};
  await add('Tomatillos',5);await add('Poblano',48,'oz');await add('Daikon radish',453.59237,'g');await add('Thai basil',1);
  assert.equal(await page.locator('#planHarvests li').count(),4);
  await select('planHarvestSelect','2');await fill('planBatches',1);await click('planAddAllocation');
  assert.equal(await page.locator('#planHarvestSelect').inputValue(),'2');
  await contains('planRemaining','Poblano: 1 lb');
  await click('planAddAllocation');await contains('planMessage','Not enough');
  await fill('planBatches',1.5);await click('planAddAllocation');await contains('planMessage','whole number');
  await select('planHarvestSelect','1');await fill('planBatches',2);await click('planAddAllocation');await contains('planRemaining','Tomatillos: 1 lb');
  await select('planHarvestSelect','3');await fill('planBatches',1);await click('planAddAllocation');await contains('planRemaining','Daikon radish: 0 lb');
  await select('planHarvestSelect','4');assert.ok(await page.locator('#planAddAllocation').isDisabled());await contains('planRemaining','Thai basil: 1 lb');
  await add('Poblano',16,'oz');assert.equal(await page.locator('#planHarvests li').count(),4);await contains('planRemaining','Poblano: 2 lb');
  for(const n of ['',0,-1,1000001]){await add('Poblano',n);await contains('planMessage','positive weight');}
  assert.equal(await page.locator('#planAllocations li button').count(),3);
  const downloadPromise=page.waitForEvent('download');await click('planExport');const download=await downloadPromise;
  const exported=fs.readFileSync(await download.path(),'utf8');
  assert.equal(download.suggestedFilename(),'preservation-plan.txt');
  for(const text of ['Poblano: 4 lb','Tomatillos: 1 lb','Daikon radish: 0 lb','Thai basil: 1 lb','2 batch(es)','/preservation/recipes/roasted-tomatillo-salsa-verde.html','No finished yields'])assert.ok(exported.includes(text),text);
  await page.locator('[data-remove-allocation="0"]').click();await contains('planRemaining','Poblano: 4 lb');
  await page.locator('[data-remove-harvest="1"]').click();assert.equal(await page.locator('#planAllocations li button').count(),1);
  for(const id of [2,3,4])await page.locator('[data-remove-harvest="'+id+'"]').click();assert.ok(await page.locator('#planExport').isDisabled());
  await add('Red onions',1);await fill('planBatches',1);await click('planAddAllocation');await click('planAddAllocation');await contains('planRemaining','Red onions: 0 lb');assert.equal(await page.locator('#planAllocations li button').count(),2);await click('planAddAllocation');await contains('planMessage','Not enough');
  await select('harvestCrop','Tomatillos');await fill('amount',5);await click('go');await contains('results','2 complete reference batch(es)');
  for(const [unit,amount] of [['oz',80],['g',2267.96185]]){await select('unit',unit);await fill('amount',amount);await click('go');await contains('results','2 complete reference batch(es)');}
  for(const unit of ['count','bunches']){await select('unit',unit);await click('go');assert.equal(await page.locator('#results .pres-footnote strong').count(),0);}
  await page.locator('input[value="Freezer"]').uncheck();await select('unit','lb');await fill('amount',5);await click('go');await contains('results','Equipment needed: Freezer');
  await add('Tomatillos',907.184,'g');await select('planHarvestSelect','6');await fill('planBatches',1);await click('planAddAllocation');await contains('planMessage','Not enough');
  await add('Poblano',0.001,'g');await contains('planRemaining','0.001 g');
  await add('Daikon radish',6,'lb');await select('planHarvestSelect','8');await fill('planBatches',6);await click('planAddAllocation');await contains('planRemaining','Daikon radish: 0 lb');
  for(const n of ['',0,-1,1.5,10001]){await fill('planBatches',n);await click('planAddAllocation');await contains('planMessage','whole number')}
  await fill('amount',0);await click('go');await contains('results','greater than zero');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'populated helper overflow');
  if(width===390){await page.addStyleTag({content:'html{font-size:200%}'});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'200% text helper overflow')}
  assert.deepEqual(errors,[]);
  console.log('PASS',name,width,'photos, filters, navigation, multi-crop precision/validation/export, single-crop units');
  await page.close();
 }
 await browser.close();
}
})().catch(e=>{console.error(e);process.exit(1)});
