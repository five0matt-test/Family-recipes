const {chromium}=require('playwright');
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const scope={window:{}};vm.runInNewContext(fs.readFileSync('assets/preservation-data.js','utf8'),scope);
const entries=scope.window.PRESERVATION_CATALOG.entries.filter(e=>e.photo?.startsWith('../images/'));
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8765/';
(async()=>{
 assert.equal(entries.length,19);assert.equal(new Set(entries.map(e=>e.photo)).size,19);
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH}:{}),args:['--no-sandbox']});
 const page=await browser.newPage();let failures=[];page.on('pageerror',e=>failures.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failures.push(r.status()+' '+r.url())});
 for(const width of [1280,390,320]){
  await page.setViewportSize({width,height:844});await page.goto(base+'preservation/index.html');await page.locator('.pres-photo').last().scrollIntoViewIfNeeded();
  for(const e of entries){const img=page.locator(`img[src="${e.photo}"]`);await img.scrollIntoViewIfNeeded();await img.evaluate(x=>x.decode());assert.ok(await img.evaluate(x=>x.naturalWidth===1280&&x.naturalHeight===720));assert.equal(await img.evaluate(x=>getComputedStyle(x).objectFit),'cover');assert.equal(await img.evaluate(x=>x.clientHeight),width<=560?170:164)}
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(width===390)await page.screenshot({path:'/workspace/scratch/3eeab7da4942/library-390.png',fullPage:true});
  for(const e of entries){await page.goto(base+'preservation/'+e.page);const img=page.locator('.pres-recipe-photo');await img.evaluate(x=>x.decode());assert.ok(await img.evaluate(x=>x.complete&&x.naturalWidth===1280));const d=await page.locator('script[type="application/ld+json"]').evaluate(x=>JSON.parse(x.textContent));assert.equal(new URL(d.image).pathname.replace(/^\/Family-recipes/,''),new URL(await img.getAttribute('src'),page.url()).pathname);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(await img.evaluate(x=>getComputedStyle(x).objectFit),'cover');if(width===390&&['p12','p22','p30'].includes(e.id))await page.screenshot({path:`/workspace/scratch/3eeab7da4942/${e.id}-390.png`,fullPage:true});}
 }
 assert.deepEqual(failures,[]);await browser.close();console.log('PASS: 19 unique photos load on library cards and recipe pages at 1280/390/320px; matching JSON-LD paths, uniform card heights, cover behavior, no horizontal overflow or HTTP/page errors.');
})().catch(e=>{console.error(e);process.exit(1)});
