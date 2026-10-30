# Shopping recipe catalog

After changing recipe ingredients or adding a recipe, run:

```sh
python scripts/build-shopping-recipes.py
```

Commit the regenerated `assets/shopping-recipes.json` with the recipe change. The generator reads ingredient JSON-LD from the recipe pages and serving counts from their controls. Alternate cooking-method pages share the dish's shopping entry; complete preservation recipes use whole batches. External procedures are excluded from automatic ingredient extraction.

`node tests/shopping-model.cjs` checks the model and confirms the generated catalog matches its sources. With a local server on port 8765 and Playwright Chromium installed, run `node tests/shopping-list.cjs`. `TEST_BASE_URL` and `CHROMIUM_EXECUTABLE_PATH` can override the server/executable. Browser tests intercept Firebase with fixtures and perform no live household writes.

Matching combines normalized ingredient names and compatible units across recipes. It never infers mass/volume/count conversions, substitutions or package sizes. Uncertain entries remain visible for review. The current shared-pantry snapshot is read-only; recipe selections, manual edits, extra items and purchase checks are saved in the current browser. Copy exports only remaining groceries; download exports the full checklist with its recipe/review context. Shopping choices are local to the current browser. Loading the list requires access to the recipe catalog; copy/download provide portable copies.
