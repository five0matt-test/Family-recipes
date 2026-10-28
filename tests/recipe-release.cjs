// Start a local server, then run: node tests/recipe-release.cjs
// AnyList access, physical iOS, signed-in pantry and kitchen testing are separate.
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'assets/home.js'),'utf8');
const data=JSON.parse(source.match(/^const RECIPE_DATA=(.*?);\n/s)[1]);
const slugs=['caramelized-onion-feta-black-pepper-sourdough','caldo-verde-collards'];
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8765/';
(async()=>{
for(const name of (process.env.TEST_BROWSERS||'chromium,webkit').split(',')){
 const browser=await {chromium,webkit}[name].launch({headless:true,...(name==='chromium'&&process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH}:{})});
 console.log('Browser',name,browser.version());
 for(const width of [1280,844,430,390,375,320]){
  const page=await browser.newPage({viewport:{width,height:900},isMobile:width<500,hasTouch:width<500});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(r.status()+' '+r.url())});
  // Offline Firebase is excluded; this test covers signed-out static UI only.
  await page.route('**/assets/recipe-preferences.js*',r=>r.fulfill({contentType:'text/javascript',body:'window.recipePrefs={signedIn:false,ready:true,data:{}};'}));
  await page.goto(base+'index.html');
  await page.locator('.recipe-card').first().waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'home overflow '+width);
  const cards=page.locator('.recipe-card');
  const dims=await cards.locator('img').evaluateAll(xs=>xs.map(x=>[x.width,x.height]));
  assert.equal(new Set(dims.map(JSON.stringify)).size,1,'consistent thumbnail dimensions');
  for(const slug of slugs){
   const card=cards.filter({has:page.locator('a[href*="'+slug+'.html"]')});
   await card.locator('img').scrollIntoViewIfNeeded();await page.waitForFunction(slug=>{const i=document.querySelector('img[src$="'+slug+'.jpg"]');return i&&i.complete&&i.naturalWidth>0},slug);await card.locator('img').evaluate(i=>i.decode());
   await card.locator('h2 a').click();
   const d=await page.locator('script[type="application/ld+json"]').evaluate(x=>JSON.parse(x.textContent));
   assert.equal(d['@type'],'Recipe');assert.ok(d.totalTime.match(/^PT/));
   const visible=await page.locator('.ingredient-list li').allTextContents();
   assert.deepEqual(visible,d.recipeIngredient);
   assert.deepEqual(await page.locator('#instructions li').allTextContents(),d.recipeInstructions.map(x=>x.text));
   assert.deepEqual(d.recipeIngredient,data.find(x=>x.id===slug).ingredients);
   const hero=page.locator('main > img');await hero.evaluate(x=>x.decode());
   assert.ok(d.image.endsWith('/images/'+slug+'.jpg'));
   assert.ok(await hero.evaluate(x=>x.naturalWidth>0&&x.width<=innerWidth&&getComputedStyle(x).objectFit==='cover'));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'recipe overflow '+width);
   if(width===390){const s=await page.addStyleTag({content:'html{font-size:200%}'});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'200% recipe text '+slug+' '+JSON.stringify(await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,items:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth).map(e=>[e.tagName,e.className,e.getBoundingClientRect().right])}))));await s.evaluate(x=>x.remove())}
   await page.locator('.serving-plus').click();
   assert.notEqual(await page.locator('.ingredient-list li').first().innerText(),visible[0],'scaling quantity');
   assert.deepEqual(await page.locator('script[type="application/ld+json"]').evaluate(x=>JSON.parse(x.textContent).recipeIngredient),visible,'import stays at base quantities');
   await page.locator('.serving-reset').click();assert.deepEqual(await page.locator('.ingredient-list li').allTextContents(),visible);
   await page.locator('.cook-toggle').click();assert.ok(await page.locator('.cook-panel').isVisible());
   await page.locator('.cook-next').click();assert.equal(await page.locator('.cook-count').innerText(),'Step 2 of '+d.recipeInstructions.length);
   await page.locator('.cook-close').click();
   await page.locator('.ingredient-list li').first().focus();await page.keyboard.press('Space');assert.equal(await page.locator('.ingredient-list li').first().getAttribute('aria-checked'),'true');
   await page.locator('[data-back]').first().click();assert.ok(page.url().includes('index.html'));
  }
  assert.deepEqual(errors,[]);await page.close();console.log('PASS recipes',name,width,'cards, photos, JSON-LD, ingredients, tools, links, layout');
 }
 await browser.close();
}
// Parse all recipe structured data and resolve every local href/src in static HTML.
let count=0,links=0;
for(const dir of ['recipes','preservation/recipes'])for(const file of fs.readdirSync(path.join(root,dir)).filter(x=>x.endsWith('.html'))){
 const full=path.join(root,dir,file),html=fs.readFileSync(full,'utf8');
 for(const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)){const d=JSON.parse(m[1]);assert.equal(d['@type'],'Recipe');assert.ok(d.recipeIngredient.length&&d.recipeInstructions.length);count++}
 for(const m of html.matchAll(/(?:href|src)="([^"?#]+)(?:[?#][^"]*)?"/g)){if(/^(?:https?:|data:|mailto:)/.test(m[1]))continue;assert.ok(fs.existsSync(path.resolve(path.dirname(full),decodeURIComponent(m[1]))),full+' '+m[1]);links++}
}
console.log('PASS static',count,'Recipe JSON-LD documents;',links,'local references');
})().catch(e=>{console.error(e);process.exit(1)});
