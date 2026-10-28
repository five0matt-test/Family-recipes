// Run a local server at port 8765, then: node tests/preservation.cjs
// Requires Playwright and its Chromium/WebKit browser installations.
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const catalogContext={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/preservation-data.js'),'utf8'),catalogContext);
const entries=catalogContext.window.PRESERVATION_CATALOG.entries.filter(e=>e.photo);
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8765/';
(async()=>{
assert.equal(entries.length,11);
for(const e of entries){
 const image=path.resolve(__dirname,'../preservation',e.photo);
 assert.ok(fs.existsSync(image),e.photo);
 const html=fs.readFileSync(path.resolve(__dirname,'../preservation',e.page),'utf8');
 assert.ok(html.includes('src="../../assets/preservation-images/'+path.basename(image)+'"'),e.page);
}
for(const name of (process.env.TEST_BROWSERS||"chromium,webkit").split(",")){
 const type={chromium,webkit}[name];
 const browser=await type.launch({headless:true});
 for(const width of [1280,390,320]){
  const page=await browser.newPage({viewport:{width,height:900},acceptDownloads:true});
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
  for(const e of entries){await visit('preservation/'+e.page);const img=page.locator('.pres-recipe-photo');await img.evaluate(i=>i.decode());assert.equal(await img.count(),1);assert.ok(await img.evaluate(i=>i.naturalWidth>0&&i.getBoundingClientRect().width<=innerWidth));}
  await visit('preservation/harvest.html');
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
  for(const n of [0,-1,1000001]){await add('Poblano',n);await contains('planMessage','positive weight');}
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
  await fill('amount',0);await click('go');await contains('results','greater than zero');
  assert.deepEqual(errors,[]);
  console.log('PASS',name,width,'11 cards, 11 recipe pages, multi-crop allocation/removal/validation/conversion/export, single-crop units');
  await page.close();
 }
 await browser.close();
}
})().catch(e=>{console.error(e);process.exit(1)});
