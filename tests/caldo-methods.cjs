const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8765/';
const methods=[{id:'instant',file:'caldo-verde-collards.html',label:'Instant Pot',time:'PT65M',steps:4},{id:'slow',file:'caldo-verde-collards-slow-cooker.html',label:'Slow Cooker',time:'PT9H',steps:7}];
const read=m=>fs.readFileSync(path.join(__dirname,'../recipes',m.file),'utf8');
const schema=html=>JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
(async()=>{
 const docs=methods.map(m=>schema(read(m)));assert.deepEqual(docs[0].recipeIngredient,docs[1].recipeIngredient);assert.equal(docs[0].recipeYield,docs[1].recipeYield);
 for(const [i,m] of methods.entries()){assert.equal(docs[i].totalTime,m.time);assert.equal(docs[i].recipeInstructions.length,m.steps);assert.ok(docs[i].url.endsWith('/'+m.file));assert.ok(docs[i].name.endsWith('— '+m.label));assert.equal((read(m).match(/class="instruction-list"/g)||[]).length,1)}
 const b=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH}:{})});let errors=[];
 for(const width of [1280,844,430,390,375,320]){
  const p=await b.newPage({viewport:{width,height:width===844?390:900},isMobile:width<500,hasTouch:width<500});p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(r.status()+' '+r.url())});
  for(const [i,m] of methods.entries()){
   await p.goto(base+'recipes/'+m.file+'?q=caldo');assert.equal(await p.locator('h1').innerText(),docs[i].name);assert.equal(await p.locator('.instruction-list').count(),1);assert.deepEqual(await p.locator('#instructions li').allTextContents(),docs[i].recipeInstructions.map(s=>s.text));assert.equal(await p.locator('.method-link[aria-current="page"]').innerText(),m.label);assert.equal(await p.locator('.recipe-tools').getAttribute('data-recipe-id'),'caldo-verde-collards');
   const ingredients=await p.locator('.ingredient-list li').allTextContents();assert.deepEqual(ingredients,docs[i].recipeIngredient);await p.locator('.serving-plus').click();assert.notDeepEqual(await p.locator('.ingredient-list li').allTextContents(),ingredients);assert.deepEqual(await p.locator('script[type="application/ld+json"]').evaluate(e=>JSON.parse(e.textContent).recipeIngredient),ingredients);await p.locator('.serving-reset').click();assert.deepEqual(await p.locator('.ingredient-list li').allTextContents(),ingredients);
   await p.locator('.cook-toggle').click();assert.ok(await p.locator('.cook-close').evaluate(e=>e===document.activeElement));
   for(let step=0;step<m.steps;step++){
    assert.equal(await p.locator('.cook-count').innerText(),`Step ${step+1} of ${m.steps}`);assert.equal(await p.locator('.cook-step-text').innerText(),docs[i].recipeInstructions[step].text);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),m.id+' cooking overflow '+width);
    if(step===1){await p.emulateMedia({media:'print'});assert.ok(await p.locator('.ingredient-list').isVisible());assert.ok(await p.locator('#instructions').isVisible());assert.deepEqual(await p.locator('#instructions li').allTextContents(),docs[i].recipeInstructions.map(x=>x.text));assert.equal(await p.locator('.cook-panel').isVisible(),false);assert.equal(await p.locator('.method-selector').isVisible(),false);await p.emulateMedia({media:'screen'});}
    await p.locator('.cook-next').click();
   }
   assert.equal(await p.locator('.cook-panel').isVisible(),false);assert.ok(await p.locator('.cook-toggle').evaluate(e=>e===document.activeElement));
   if(width===390){await p.addStyleTag({content:'html{font-size:200%}'});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),m.id+' enlarged-text overflow');}
   const other=methods[1-i];await p.locator('[data-method-link="'+other.id+'"]').focus();await p.keyboard.press('Enter');await p.waitForURL('**/recipes/'+other.file+'?q=caldo');assert.ok(p.url().endsWith(other.file+'?q=caldo'));assert.equal(await p.locator('.method-link[aria-current="page"]').innerText(),other.label);assert.equal(await p.locator('.instruction-list li').count(),other.steps);
  }
  await p.close();console.log('PASS Caldo Verde',width,'both method schemas/steps, serving scale, complete Cooking Mode, print, keyboard navigation and query preservation');
 }
 const p=await b.newPage();await p.goto(base+'recipes/'+methods[0].file);await p.locator('.favorite-toggle').click();await p.locator('[data-method-link="slow"]').click();assert.match(await p.locator('.favorite-toggle').innerText(),/Saved favorite/);assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('familyRecipesRecentV1'))),['caldo-verde-collards']);await p.close();
 const nojs=await b.newContext({javaScriptEnabled:false});const raw=await nojs.newPage();for(const [i,m] of methods.entries()){await raw.goto(base+'recipes/'+m.file);assert.deepEqual(await raw.locator('#instructions li').allTextContents(),docs[i].recipeInstructions.map(s=>s.text));assert.deepEqual(await raw.locator('script[type="application/ld+json"]').evaluate(e=>JSON.parse(e.textContent)),docs[i]);await raw.locator('[data-method-link="'+methods[1-i].id+'"]').click();assert.ok(raw.url().endsWith(methods[1-i].file));}await nojs.close();
 assert.deepEqual(errors,[]);await b.close();console.log('PASS shared favorite/recent identity and both import-ready method pages without page JavaScript. No AnyList account import performed.');
})().catch(e=>{console.error(e);process.exit(1)});
