// Requires Playwright. Optional AXE_SCRIPT_PATH points to axe-core's axe.min.js.
// Screens/engines only: this does not certify VoiceOver or physical printing.
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8765/';
const slugs=['caramelized-onion-feta-black-pepper-sourdough','caldo-verde-collards'];
(async()=>{
for(const engine of (process.env.TEST_BROWSERS||'chromium,webkit').split(',')){
 const b=await {chromium,webkit}[engine].launch({headless:true,...(engine==='chromium'&&process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH}:{})});
 const p=await b.newPage({viewport:{width:390,height:844}});
 // No Firebase writes/authentication are performed. Home preferences are stubbed.
 await p.route('**/assets/recipe-preferences.js*',r=>r.fulfill({contentType:'text/javascript',body:'window.recipePrefs={signedIn:false,ready:true,data:{}};'}));
 const scan=async label=>{
  if(!process.env.AXE_SCRIPT_PATH)return;
  await p.addScriptTag({path:process.env.AXE_SCRIPT_PATH});
  const violations=await p.evaluate(async()=>{const r=await axe.run({runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});
  assert.deepEqual(violations,[],label+' automated accessibility');
 };
 for(const slug of slugs){
  await p.goto(base+'recipes/'+slug+'.html');
  const original=await p.locator('.ingredient-list li').allTextContents();
  assert.equal(await p.locator('.ingredient-list > li[role],.instruction-list > li[role]').count(),0,'native list items');
  const ingredient=p.locator('.ingredient-toggle').first(),step=p.locator('.instruction-toggle').first();
  await ingredient.focus();await p.keyboard.press('Space');assert.equal(await ingredient.getAttribute('aria-pressed'),'true');
  await step.focus();await p.keyboard.press('Enter');assert.equal(await step.getAttribute('aria-pressed'),'true');
  assert.ok((await step.ariaSnapshot()).includes((await step.innerText()).slice(0,30)),'step accessible name includes directions');
  await scan(slug);
  await p.locator('.cook-toggle').focus();await p.keyboard.press('Enter');
  assert.ok(await p.locator('.cook-close').evaluate(e=>e===document.activeElement),'entry focus');
  await scan(slug+' cooking mode');
  await p.emulateMedia({media:'print'});
  for(const selector of ['.ingredient-list','.instruction-list','main > aside','main > img'])assert.ok(await p.locator(selector).isVisible(),selector+' visible when printing cooking mode');
  assert.equal(await p.locator('.cook-panel').isVisible(),false);
  assert.equal(await p.locator('.recipe-tools').isVisible(),false);
  assert.equal(await ingredient.evaluate(e=>getComputedStyle(e).textDecorationLine),'none','print clears checked styling');
  assert.deepEqual(await p.locator('.ingredient-list li').allTextContents(),original);
  if(engine==='chromium'&&process.env.PRINT_QA_DIR){fs.mkdirSync(process.env.PRINT_QA_DIR,{recursive:true});await p.pdf({path:process.env.PRINT_QA_DIR+'/'+slug+'.pdf',format:'Letter',margin:{top:'0.4in',bottom:'0.4in',left:'0.4in',right:'0.4in'}})}
  await p.emulateMedia({media:'screen'});await p.locator('.cook-close').focus();await p.keyboard.press('Enter');
  assert.ok(await p.locator('.cook-toggle').evaluate(e=>e===document.activeElement),'exit focus returns to trigger');
 }
 // The shared script is used by all main recipes, not only the two recent additions.
 for(const file of fs.readdirSync(path.join(__dirname,'../recipes')).filter(x=>x.endsWith('.html'))){
  await p.goto(base+'recipes/'+file);
  assert.equal(await p.locator('.ingredient-toggle').count(),await p.locator('.ingredient-list li').count(),file+' ingredient controls');
  assert.equal(await p.locator('.instruction-toggle').count(),await p.locator('.instruction-list li').count(),file+' direction controls');
  const original=await p.locator('.ingredient-list li').allTextContents();
  if(await p.locator('.serving-plus').count()){await p.locator('.serving-plus').click();await p.locator('.serving-reset').click()}
  assert.deepEqual(await p.locator('.ingredient-list li').allTextContents(),original,file+' reset preserves text');
 }
 for(const url of ['index.html','preservation/index.html','preservation/harvest.html','pantry/index.html']){await p.goto(base+url);await scan(url);if(url==='pantry/index.html'){assert.ok(await p.locator('#app').isHidden());assert.ok(await p.locator('#signIn').isVisible())}}
 console.log('PASS',engine,'all main recipe controls/reset, native list/button semantics, keyboard state/focus, cooking-mode print content, signed-out pantry shell'+(process.env.AXE_SCRIPT_PATH?', axe WCAG A/AA scans':'; axe scan SKIPPED (set AXE_SCRIPT_PATH)'));
 await b.close();
}
})().catch(e=>{console.error(e);process.exit(1)});
