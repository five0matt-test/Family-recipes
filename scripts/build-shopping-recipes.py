"""Build the shopping catalog from the ingredient lists on the recipe pages."""
import json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
def recipe(path):
 text=path.read_text()
 data=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',text,re.S)[1])
 return text,data
items=[]
for path in sorted((root/'recipes').glob('*.html')):
 text,data=recipe(path)
 match=re.search(r'data-recipe-id="([^"]+)"',text)
 if not match or path.stem!=match[1]:continue # Alternate methods share a dish's ingredients.
 servings=int(re.search(r'data-base-servings="(\d+)"',text)[1])
 items.append(dict(id=match[1],name=data['name'],href='../recipes/'+path.name,group='Meals and sides',mode='servings',baseAmount=servings,ingredients=data['recipeIngredient']))
text=(root/'assets/preservation-data.js').read_text()
catalog=json.loads(text[text.index('{'):].rstrip().rstrip(';'))
for entry in catalog['entries']:
 if not entry.get('page'):continue
 _,data=recipe(root/'preservation'/entry['page'])
 items.append(dict(id='preservation-'+entry['id'],name=entry['title'],href='../preservation/'+entry['page'],group='Preservation batches',mode='batches',baseAmount=1,ingredients=data['recipeIngredient']))
items.sort(key=lambda x:(x['group'],x['name'].casefold()))
(root/'assets/shopping-recipes.json').write_text(json.dumps(items,ensure_ascii=False,indent=2)+'\n')
print(f'Built {len(items)} shopping recipes')
