# Preservation recipe expansion review — October 28, 2026

Branch: `feature/complete-preservation-recipes`, based on the released PR #2 merge (`040a9dc`). This is a new content expansion; the earlier approval covered PR #2. No merge or deployment of this expansion is included.

## Result

- 19 former briefs now have complete ingredient lists, directions, active/total estimates, variable-yield labels, storage guidance, print controls, helper navigation, source links and matching Recipe JSON-LD.
- Catalog remains 39 entries / 70 selectable crops: 30 local recipes and 9 external references. No entry ends at a pending project brief.
- The chili-mash idea now links Oregon State’s full fruit-pepper fermented hot-sauce recipe and University of Minnesota fermentation guidance. No local salt/pH/time formula is invented or mislabeled as tested; garlic is removed from the crop match because the external formula is not the old garlic mash. This is an external source, not a twentieth new local recipe.
- The 11 existing photographs and original recipe pages are preserved. New recipes use text-led pages; no replacement, stock or invented food photographs were added.
- Primary-crop reference weights grow from 5 to 20. Fifteen new references use explicit raw ingredient weights; herbs/garlic may be weighed after trimming/peeling as the label states. They do not predict finished yields. Remaining recipes need measured volumes or have variable alternative ingredients, so do not invent raw-weight conversions.

## New local recipes

| Recipe | Method | Primary-crop reference |
| --- | --- | --- |
| [Refrigerator Pickled Jalapeños](recipes/refrigerator-pickled-jalapenos.html) | Refrigerator pickling | 1 lb jalapeños |
| [Fresh Korean-Style Cabbage (Refrigerated)](recipes/refrigerator-kimchi-style-cabbage.html) | Refrigerator pickling | 1 lb Napa cabbage |
| [Dried Mediterranean Herb Seasoning](recipes/dried-herb-seasoning-blends.html) | Dehydrating | No weight reference |
| [Cilantro and Parsley Freezer Portions](recipes/cilantro-parsley-freezer-portions.html) | Freezing | 2 oz cilantro |
| [Freezer Corn and Pepper Skillet Mix](recipes/freezer-corn-pepper-fajita-mix.html) | Freezing | 1 lb bell peppers |
| [Freezer-Ready Okra](recipes/freezer-ready-okra.html) | Freezing | 1 lb okra |
| [Refrigerator Dill Cucumber Pickles](recipes/refrigerator-dill-cucumber-pickles.html) | Refrigerator pickling | 1 lb pickling cucumbers |
| [Refrigerator Carrot and Daikon Pickle](recipes/pickled-carrot-daikon.html) | Refrigerator pickling | 8 oz carrots |
| [Zucchini and Summer Squash Freezer Prep](recipes/zucchini-summer-squash-freezer-prep.html) | Freezing | 1 lb zucchini |
| [Frozen Pumpkin or Winter Squash Purée](recipes/frozen-pumpkin-puree.html) | Freezing | 2 lb whole pumpkin |
| [Frozen Citrus Zest and Juice](recipes/frozen-citrus-zest-juice.html) | Freezing | No weight reference |
| [Unsweetened Frozen Figs](recipes/frozen-figs.html) | Freezing | 1 lb figs |
| [Dried Mint and Chamomile Tea Blend](recipes/dried-mint-chamomile-tea.html) | Dehydrating | No weight reference |
| [Chopped Onion and Leek Freezer Mix](recipes/onion-leek-freezer-mix.html) | Freezing | 1 lb yellow onions |
| [Garlic and Herb Freezer Portions (No Oil)](recipes/garlic-herb-freezer-portions.html) | Freezing | 4 oz peeled garlic |
| [Cooked Sweet Potato Freezer Portions](recipes/sweet-potato-freezer-prep.html) | Freezing | 2 lb sweet potatoes |
| [Frozen Roasted Tomato Sauce Starter](recipes/frozen-roasted-tomato-base.html) | Freezing | 2 lb tomatoes |
| [Greek Lemon-Herb Freezer Starter](recipes/greek-marinade-freezer-starter.html) | Freezing | No weight reference |
| [Cilantro-Citrus Salsa Starter](recipes/cilantro-citrus-salsa-starter.html) | Freezing | 2 oz cilantro |

## Editorial decisions

- Refrigerator jalapeños, dill pickles and carrot/daikon use vinegar explicitly labeled 5% acidity. Exact culinary formulas are originals; a conservative three-day household limit is stated rather than copying another recipe’s shelf life. No canning process is implied.
- Fresh Korean-style cabbage is explicitly refrigerated, not room-temperature fermentation or long-storage kimchi.
- Corn is blanched on the cob before cutting kernels; pepper strips use their own blanching time. Okra has separate small/large pod times. Grated zucchini uses steam blanching; sliced zucchini/pattypan uses water blanching. Instructions follow the linked crop-specific references.
- Sweet potato prep no longer matches white/Irish potatoes. Leek notes disclose conflicting quality guidance (UNH allows cut-leek freezing; MSU warns of bitterness/mushiness).
- Citrus title allows Meyer lemon intentionally; lime is not falsely listed as a grown crop. Juice volume does not become a fictitious whole-fruit weight. Pumpkin purée is freezer-only, never canned.
- Herb/garlic blends freeze promptly. The new garlic-herb portion and Greek starter contain no oil before freezing. Method references do not imply laboratory approval of the exact mixtures.
- Dry herbs and chamomile must reach the described dry/brittle endpoint; elapsed time alone is insufficient. Flowers must be correctly identified food-grade plants. No health benefits are promised.
- Cards and recipe content wrap at enlarged text sizes, including long citrus wording and reference labels. Complete-recipe count is derived from catalog pages.

## Source verification

The source text was reviewed through authoritative web retrieval. Independent HTTP checks are listed below; four sites blocked this automated client (403) even though their source content was readable through search retrieval. Those links are not falsely reported as HTTP 200. They may need normal-browser rechecking before release.

| Source | Direct HTTP check |
| --- | --- |
| [https://extension.colostate.edu/resource/edible-flowers/](https://extension.colostate.edu/resource/edible-flowers/) | 200 |
| [https://extension.umaine.edu/food-health/recipes/refrigerator-pickles/](https://extension.umaine.edu/food-health/recipes/refrigerator-pickles/) | HTTP Error 403: Forbidden |
| [https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-herbs](https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-herbs) | HTTP Error 403: Forbidden |
| [https://extension.umn.edu/som/node/172346](https://extension.umn.edu/som/node/172346) | HTTP Error 403: Forbidden |
| [https://extension.unh.edu/blog/2025/08/freezing-vegetables](https://extension.unh.edu/blog/2025/08/freezing-vegetables) | 200 |
| [https://foodsci.oregonstate.edu/curtin-lab/fermented-recipes](https://foodsci.oregonstate.edu/curtin-lab/fermented-recipes) | HTTP Error 403: Forbidden |
| [https://msu-prod.dotcmscloud.com/resources/michigan_fresh_leeks?language_id=1](https://msu-prod.dotcmscloud.com/resources/michigan_fresh_leeks?language_id=1) | 200 |
| [https://nchfp.uga.edu/how/dry/drying-general/herbs/](https://nchfp.uga.edu/how/dry/drying-general/herbs/) | 200 |
| [https://nchfp.uga.edu/how/freeze/fruits/freezing-citrus-fruits/](https://nchfp.uga.edu/how/freeze/fruits/freezing-citrus-fruits/) | 200 |
| [https://nchfp.uga.edu/how/freeze/fruits/freezing-figs/](https://nchfp.uga.edu/how/freeze/fruits/freezing-figs/) | 200 |
| [https://nchfp.uga.edu/how/freeze/vegetable/freezing-bell-or-sweet-peppers/](https://nchfp.uga.edu/how/freeze/vegetable/freezing-bell-or-sweet-peppers/) | 200 |
| [https://nchfp.uga.edu/how/freeze/vegetable/freezing-corn/](https://nchfp.uga.edu/how/freeze/vegetable/freezing-corn/) | 200 |
| [https://nchfp.uga.edu/how/freeze/vegetable/freezing-fresh-herbs/](https://nchfp.uga.edu/how/freeze/vegetable/freezing-fresh-herbs/) | 200 |
| [https://nchfp.uga.edu/how/freeze/vegetable/freezing-garlic-in-oil/](https://nchfp.uga.edu/how/freeze/vegetable/freezing-garlic-in-oil/) | 200 |
| [https://nchfp.uga.edu/how/freeze/vegetable/freezing-okra/](https://nchfp.uga.edu/how/freeze/vegetable/freezing-okra/) | 200 |
| [https://nchfp.uga.edu/how/freeze/vegetable/freezing-onions/](https://nchfp.uga.edu/how/freeze/vegetable/freezing-onions/) | 200 |
| [https://nchfp.uga.edu/how/freeze/vegetable/freezing-pumpkin/](https://nchfp.uga.edu/how/freeze/vegetable/freezing-pumpkin/) | 200 |
| [https://nchfp.uga.edu/how/freeze/vegetable/freezing-summer-squash/](https://nchfp.uga.edu/how/freeze/vegetable/freezing-summer-squash/) | 200 |
| [https://nchfp.uga.edu/how/freeze/vegetable/freezing-sweet-potatoes/](https://nchfp.uga.edu/how/freeze/vegetable/freezing-sweet-potatoes/) | 200 |
| [https://nchfp.uga.edu/how/freeze/vegetable/freezing-tomatoes/](https://nchfp.uga.edu/how/freeze/vegetable/freezing-tomatoes/) | 200 |
| [https://www.foodsafety.gov/keep-food-safe/4-steps-to-food-safety](https://www.foodsafety.gov/keep-food-safe/4-steps-to-food-safety) | 200 |

## Automated test evidence

- `tests/preservation-expansion.cjs`: both Chromium 141 and Linux WebKit 26.5 pass all 19 new pages: visible ingredients/directions equal JSON-LD, 1280/390/320 layouts, 200% text at 390px, print-media visibility, correct helper crop preselection, and axe-core 4.10.3 WCAG A/AA scans (zero violations in tested states).
- All 15 new batch references pass exact two-batch allocation, over-allocation rejection and actual exported-plan content checks in both engines.
- Existing preservation regression suite: Chromium 141 and WebKit 26.5 pass all six desktop/phone widths (1280, 844, 430, 390, 375, 320). Final Chromium 390/320 checks also pass after the enlarged-text layout corrections. All 11 original photographs, catalog filters, navigation and multi-crop precision/validation/export remain covered.
- Shared recipe regression suite: both engines pass all six widths. All 48 Recipe JSON-LD documents parse and 358 local recipe-page references resolve. JavaScript syntax and whitespace checks pass. Representative herb, cabbage, okra and library pages were visually inspected at 390px.

## Unverified / release limits

No kitchen, tasting, yield measurement, pH/laboratory/storage-life study, physical iPhone/Safari, actual AnyList import, physical printing or VoiceOver testing was performed. These are source-informed culinary recipes, not laboratory-validated preservation formulas. Exact fermentation and shelf-stable canning must follow the external procedure in full; those formulas are never scaled by the helper. Plans still reserve only primary crops, use whole batches, round displayed weights, and disappear on refresh.

## Reproduce

Start a local server at repository root and run:

```sh
node tests/preservation.cjs
AXE_SCRIPT_PATH=/absolute/path/to/axe-core/axe.min.js node tests/preservation-expansion.cjs
node tests/recipe-release.cjs
```

All suites support `TEST_BASE_URL`, `TEST_BROWSERS` and `CHROMIUM_EXECUTABLE_PATH`. Browser/dependency setup lives outside the repository. Automated engines are not physical-device certification.
