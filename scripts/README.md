# Shopping recipe catalog

After changing recipe ingredients or adding a recipe, run:

```sh
python scripts/build-shopping-recipes.py
```

Commit the regenerated `assets/shopping-recipes.json` with the recipe change. The generator reads ingredient JSON-LD from the recipe pages and serving counts from their controls. Alternate cooking-method pages share the dish's shopping entry; complete preservation recipes use whole batches. External procedures are excluded from automatic ingredient extraction.

`node tests/shopping-model.cjs` checks the model and confirms the generated catalog matches its sources. With a local server on port 8765 and Playwright Chromium installed, run `node tests/shopping-list.cjs`. `TEST_BASE_URL` and `CHROMIUM_EXECUTABLE_PATH` can override the server/executable. Browser tests intercept Firebase with fixtures and perform no live household writes.

Matching combines normalized ingredient names and compatible units across recipes. It never infers mass/volume/count conversions, substitutions or package sizes. Uncertain entries remain visible for review. The current shared-pantry snapshot is read-only; recipe selections, manual edits, extra items and purchase checks are saved in the current browser. Copy exports only remaining groceries; download exports the full checklist with its recipe/review context. Choose browser-only storage or the shared household list; shared mode uses the existing Firebase project and keeps pending edits in a browser outbox. See `docs/SHARED-SHOPPING-SETUP.md`. Aisle labels and the hide-checked preference affect presentation only; they never change quantities or pantry matching. Loading the list requires access to the recipe catalog; copy/download provide portable copies.

## Weekly shopping plans

After editing `plans/index.html`, run `python scripts/build-weekly-plans.py` and commit `assets/weekly-plans.json`. Every plan card must have `data-start-date="YYYY-MM-DD"` for its actual starting date; this drives reliable sorting, year filtering and the shopping plan ID. Add the matching `../shopping/index.html?plan=YYYY-MM-DD` link.

The generator collects each unique linked local recipe, including side dishes and lunches, at its catalog base yield. The shopping screen shows those individual amounts for review and offers a whole-number multiplier. Adding a week updates its recipes without multiplying duplicate links or removing other selections/extras. It never automatically edits a list when a URL is opened. Regenerate the recipe catalog first if recipe yields changed.

`tests/site-improvements.cjs` checks cross-month sorting, plan-catalog reproducibility, weekly additions, mobile photo sizing, aisle grouping, hiding checks, Cooking Mode navigation and mocked wake-lock release. Shared-list tests exercise whole-week additions across isolated device contexts; no real household records are used.
