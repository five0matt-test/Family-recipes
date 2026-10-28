const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),scope={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/preservation-data.js'),'utf8'),scope);
const catalog=scope.window.PRESERVATION_CATALOG,recipes=catalog.entries.filter(e=>e.page),added=recipes.filter(e=>!e.photo),batches=catalog.entries.filter(e=>e.batch);
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8765/';
(async()=>{
assert.equal(recipes.length,30);assert.equal(added.length,19);assert.equal(batches.length,20);assert.equal(catalog.entries.length,39);
assert.ok(catalog.entries.every(e=>e.page||/^https:\/\//.test(e.url)),'every project resolves to recipe or external procedure');
assert.ok(!catalog.entries.find(e=>e.id==='p14').batch,'never scale external fermentation');
for(const engine of (process.env.TEST_BROWSERS||'chromium,webkit').split(',')){
 const b=await {chromium,webkit}[engine].launch({headless:true,...(engine==='chromium'&&process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH}:{})});
 const p=await b.newPage({viewport:{width:390,height:844},acceptDownloads:true});const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(r.status()+' '+r.url())});
 for(const e of added){
  await p.goto(base+'preservation/'+e.page);
  const d=await p.locator('script[type="application/ld+json"]').evaluate(x=>JSON.parse(x.textContent));
  assert.equal(d['@type'],'Recipe');assert.equal(d.name,e.title);assert.ok(d.recipeYield&&d.prepTime&&d.totalTime);
  assert.deepEqual(await p.locator('main > ul > li').allTextContents(),d.recipeIngredient);
  assert.deepEqual(await p.locator('main > ol > li').allTextContents(),d.recipeInstructions.map(x=>x.text));
  assert.ok(d.isBasedOn.every(x=>x.startsWith('https://')));
  assert.ok((await p.locator('.pres-storage').innerText()).includes('not been laboratory validated'));
  if(e.storage==='Frozen')assert.ok((await p.locator('.pres-alert').innerText()).includes('0°F'));
  if(e.storage==='Refrigerated')assert.ok((await p.locator('.pres-alert').innerText()).includes('40°F'));
  for(const width of [1280,390,320]){await p.setViewportSize({width,height:844});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),e.title+' overflow '+width)}
  await p.setViewportSize({width:390,height:844});await p.addStyleTag({content:'html{font-size:200%}'});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),e.title+' 200% text');
  await p.emulateMedia({media:'print'});assert.ok(await p.locator('main > ul').isVisible());assert.ok(await p.locator('main > ol').isVisible());assert.equal(await p.locator('.pres-actions').isVisible(),false);await p.emulateMedia({media:'screen'});
  if(process.env.AXE_SCRIPT_PATH){await p.addScriptTag({path:process.env.AXE_SCRIPT_PATH});const violations=await p.evaluate(async()=>{const r=await axe.run({runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>v.id)});assert.deepEqual(violations,[],e.title+' axe');}
  await p.getByRole('link',{name:'Use in Harvest Helper',exact:true}).click();assert.equal(await p.locator('#harvestCrop').inputValue(),e.crops[0]);
 }
 for(const e of added.filter(e=>e.batch)){
  await p.goto(base+'preservation/harvest.html');await p.locator('#planCrop').selectOption(e.batch.crop);await p.locator('#planUnit').selectOption('g');await p.locator('#planAmount').fill(String(e.batch.grams*2));await p.locator('#planAddHarvest').click();await p.locator('#planRecipeSelect').selectOption(e.id);await p.locator('#planBatches').fill('2');await p.locator('#planAddAllocation').click();assert.ok((await p.locator('#planRemaining').innerText()).includes('0 lb'),e.title+' exact allocation');await p.locator('#planAddAllocation').click();assert.ok((await p.locator('#planMessage').innerText()).includes('Not enough'),e.title+' over-allocation');
  const [download]=await Promise.all([p.waitForEvent('download'),p.locator('#planExport').click()]);const txt=fs.readFileSync(await download.path(),'utf8');assert.ok(txt.includes(e.title)&&txt.includes(e.page)&&txt.includes('2 batch(es)'),e.title+' export');
 }
 assert.deepEqual(errors,[]);console.log('PASS',engine,'19 new recipes: schema/ingredients/directions, 1280/390/320 layout + 200% text, print visibility, helper links; 15 new primary-crop allocations/validation/downloads'+(process.env.AXE_SCRIPT_PATH?'; axe scans':'; axe SKIPPED'));await b.close();
}
})().catch(e=>{console.error(e);process.exit(1)});
