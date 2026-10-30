"""Build the shopping plan picker from published meal-plan links; stdlib only."""
import json,re
from pathlib import Path
root=Path(__file__).resolve().parent.parent
recipes={r['id']:r for r in json.loads((root/'assets/shopping-recipes.json').read_text())}
plans=[]
for date,body in re.findall(r'<article class="plan-card" data-start-date="([^"]+)">(.*?)</article>',(root/'plans/index.html').read_text(),re.S):
    title=re.sub('<[^>]+>','',re.search(r'<summary>(.*?)</summary>',body,re.S)[1])
    selected=[]
    for rid in re.findall(r'href="../recipes/([^"/]+)\.html"',body):
        if rid in recipes and not any(x['id']==rid for x in selected):
            selected.append({'id':rid,'amount':recipes[rid]['baseAmount']})
    plans.append({'id':date,'title':title,'selected':selected})
(root/'assets/weekly-plans.json').write_text(json.dumps(sorted(plans,key=lambda p:p['id'],reverse=True),ensure_ascii=False,indent=2)+'\n')
print(f'{len(plans)} weekly plans generated')
