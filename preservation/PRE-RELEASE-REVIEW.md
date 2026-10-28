# Preservation Library pre-release review

Reviewed October 28, 2026, on `feature/preservation-library-harvest-helper` for draft PR #2. This report supersedes the earlier photography-only verification. No merge, hosting change or update to `main` is part of this review.

## Browser and functional results

Playwright checks cover Linux WebKit (build 2336) and Chromium Headless Shell 141.0.7390.37 at 1280, 844, 430, 390, 375 and 320 CSS pixels. The 844px viewport uses a 390px landscape height. Portrait widths below 500px use mobile/touch emulation and a 3x device scale. Tests run under a project-directory URL prefix to exercise GitHub Pages-style relative links. Additional 390px/320px checks cover the final mobile-control changes and enlarged text.

| Area | Result |
| --- | --- |
| Photos | All 11 catalog photos and 11 recipe heroes decode, match their paths, fit the viewport, and use consistent cover cropping. Card thumbnail heights match. Original binary files are unchanged. |
| Filters | All 70 crop selections, every method/flavor option, the 11-recipe toggle, case-insensitive trimmed text, a combined intersection, and the empty state match the catalog. |
| Navigation | Library → helper; preservation → Recipes/meal plans/pantry → preservation; all 11 recipe-to-helper links with matching crop preselection. 120 local preservation file references resolve. |
| Planner | Multi-crop tracking, duplicate-crop merging, lb/oz/g conversions, whole batches, multiple allocations, correct remaining crops, selection retention, allocation removal, cascading crop removal and disabled empty export. |
| Invalid inputs | Blank/zero/negative/over-limit harvest weights; blank/zero/negative/fractional/over-limit batches; ordinary and sub-milligram over-allocation are rejected. |
| Precision | Positive tiny remainders display in grams instead of disappearing as `0 lb`. Floating-point residue from an exactly consumed harvest displays as zero. |
| Export | Actual text download is read and checked for filename, totals, batch counts, unallocated weights, project-relative recipe URLs and limitations. |
| Single-crop helper | Equivalent lb/oz/g batch estimates; count/bunches do not get weight-based estimates; unavailable freezer warning; invalid quantity rejection. Equipment and time rank suggestions rather than strictly excluding them. |
| Responsive/accessibility | No document overflow in tested library/recipe/helper layouts, including populated helper. 200% text tested at 390px on library, all recipe pages and helper. Equipment labels have 44px minimum tap height; mobile recipe selector uses a full row. |
| Recipe imports | Visible directions agree with Recipe JSON-LD after instruction edits. This checks data consistency, not actual AnyList import behavior. |
| Runtime | No page JavaScript errors or HTTP errors during preservation flows. Signed-in pantry/Firebase operations are outside this test. |

## Issues found and corrected

- The mixed-vegetable canning note incorrectly prohibited tomatoes and zucchini, although both are in the linked NCHFP base recipe. It now directs readers to that source's full method and expressly permitted variations/exclusions. No canning formula or processing table is reproduced or scaled by the site.
- Smoky tomato salsa was matched to tomatillos, and red-onion pickles to Meyer lemons, although those ingredients are absent from the linked originals. Those matches were removed.
- The greens page was represented as an NCHFP recipe and matched more greens than its actual ingredients. It is now attributed to Family Recipes, covers collards/kale, gives their separate blanching times, and links both the NCHFP greens page and general blanching method. Visible and importable instructions were updated together.
- The herb-cube card mentioned oil although its recipe uses water. The description now matches the recipe.
- Daikon pickles specified rice vinegar without acidity. The ingredient now explicitly calls for distilled white vinegar labeled 5% acidity. Refrigerator-pickle pages add brine, cold-storage and no-canning guidance. Their previous one-week suggestions were replaced with a conservative three-day household limit, explicitly not a tested shelf life.
- Original recipes and project briefs were conflated in the overview. Cards and pages now distinguish original recipes from external tested canning procedures; related guidance does not imply validation of an original formula.
- Recipe pages add numeric cold-storage temperatures, prompt cooling guidance, food-handling sources and consistent helper links. Pesto retains its NCHFP three-day refrigerator limit. Garlic paste remains a freezer preparation.
- The planner rounded tiny positive remainders to zero and allowed up to 0.001g of over-allocation. It now shows small quantities in grams and uses a tolerance limited to floating-point precision.
- Final mobile review found compressed equipment labels and a narrow recipe dropdown. Equipment labels now have larger tap areas, and the mobile recipe selector spans a full row.

## Recipe-by-recipe editorial review

These are original culinary recipes or adaptations, not laboratory-tested preservation formulas. The review checks instructions against general handling/method guidance; it does not establish pH, commercial sterility, sensory quality or shelf life.

| Recipe | Review and remaining qualification |
| --- | --- |
| Roasted tomatillo salsa verde | Freezer-only; lime is for flavor, not a validated acidification process. Prompt shallow-container cooling, refrigerator thawing and headspace specified. Kitchen testing remains. |
| Smoky salsa tatemada | Same freezer-only limitation; tomato-only crop match corrected. Kitchen testing remains. |
| Roasted poblano strips | Roast/peel/freeze preparation; no shelf-stable claim. Cold handling clarified. Kitchen testing remains. |
| Refrigerator escabeche | 5% vinegar, refrigerated handling, no canning. Original vegetable/brine formula and storage life are not source-validated. Kitchen/storage review remains. |
| Quick Korean-style daikon | Unspecified rice vinegar replaced with 5% white vinegar; refrigerated only. Exact formula and storage life remain unvalidated. |
| Quick-pickled red onions | No lemon substitution or room-temperature storage; refrigerated only. Exact formula and storage life remain unvalidated. |
| Thai basil freezer portions | Consistent with NCHFP fresh-herb freezing for cooked uses; thawed leaves lose fresh texture. Water-mold variant is an original preparation. |
| Lemongrass freezer paste | Raw garlic/aromatics go straight into frozen portions; no room-temperature garlic-in-oil storage. The source describes general garlic-in-oil handling, not this exact mixed paste. |
| Mediterranean herb cubes | Water-based recipe and catalog now agree; source supports general herb freezing. This exact cube recipe is an original variation. |
| Basil pesto cubes | General NCHFP guidance supports freezing and at most three refrigerated days. Original ingredient amounts and flavor are not kitchen-tested here. |
| Freezer greens | Collards: 3-minute water blanch; kale: 2 minutes, counted after boiling resumes. Rapid cooling, draining and packaging align with linked NCHFP methods. Not a canning recipe. |

## External source verification

All 15 final URLs returned HTTP 200 with the expected page title during this review. Relevant content was read, not just link status. References support the described general method or external tested recipe; they do not certify original recipes.

| Source | Applicability |
| --- | --- |
| [NCHFP paste-tomato salsa](https://nchfp.uga.edu/how/can/canning-salsa/tomato-salsa-with-paste-tomatoes/) | External tested salsa; preserve its vegetable/acid proportions and use the published process. |
| [NCHFP tomato/green-chile salsa](https://nchfp.uga.edu/how/can/canning-salsa/tomato-and-green-chile-salsa/) | External tested salsa, with its own allowed modifications and altitude table. |
| [NCHFP peppers](https://nchfp.uga.edu/how/can/canning-vegetables/peppers/) | Plain hot/sweet peppers require the linked pressure-canning process. |
| [NCHFP pickled mixed vegetables](https://nchfp.uga.edu/how/can/pickled-and-fermented/pickled-mixed-vegetables/) | External mixed-pickle formula; catalog is a discovery link, not a substitution guide. |
| [NCHFP mixed vegetables](https://nchfp.uga.edu/how/can/canning-vegetables-and-vegetable-products/mixed-vegetables/) | Base includes tomato/zucchini; only the source's expressly permitted variations apply. |
| [NCHFP cubed pumpkin/winter squash](https://nchfp.uga.edu/how/can/canning-vegetables/pumpkins-and-winter-squash-cubed/) | Cubes, not purée. Suitability of a particular Seminole pumpkin harvest is not established by this review. |
| [NCHFP salsa ingredients](https://nchfp.uga.edu/how/can/canning-salsa/ingredients-for-salsa-recipes/) | Acid/vegetable proportions and permitted ingredient changes; does not validate freezer salsa as canned salsa. |
| [NCHFP blanching times](https://nchfp.uga.edu/how/freeze/freeze-general-information/blanching-times/) | General vegetable-discovery reference; use the crop/size-specific procedure. |
| [NCHFP blanching method](https://nchfp.uga.edu/how/freeze/freeze-general-information/blanching-vegetables/) | Start timing after boiling resumes; chill promptly after blanching. |
| [NCHFP greens](https://nchfp.uga.edu/how/freeze/vegetable/freezing-greens-including-spinach/) | Direct greens reference for the collards/kale preparation. |
| [NCHFP fresh herbs](https://nchfp.uga.edu/how/freeze/vegetable/freezing-fresh-herbs/) | Washing/drying/freezing herbs; frozen herbs suit cooking rather than fresh garnish. |
| [NCHFP garlic-in-oil](https://nchfp.uga.edu/how/freeze/vegetable/freezing-garlic-in-oil/) | Botulism hazard at room temperature; cold storage/freezing guidance. Not a tested lemongrass-paste recipe. |
| [NCHFP pesto](https://nchfp.uga.edu/how/freeze/vegetable/freezing-pesto/) | Freezing and short refrigerated storage; does not validate the site's exact ingredient formulation. |
| [Maine Extension refrigerator pickles](https://extension.umaine.edu/food-health/recipes/refrigerator-pickles/) | General 5%-vinegar refrigerator-pickle handling. Site originals differ; the source's storage period is not copied onto them. |
| [FoodSafety.gov handling/chilling](https://www.foodsafety.gov/keep-food-safe/4-steps-to-food-safety) | Produce hygiene, cold-storage temperatures and prompt refrigeration. |

## Remaining limitations / not tested

- Physical iPhone/iPad Safari, iOS share/download behavior and actual device keyboard interaction.
- Current installed desktop Chrome/Safari/Firefox. Chromium 141 and Linux WebKit are automated engine checks, not a claim that every current browser/device was tested.
- Cooking, tasting, pH measurements, laboratory validation or a controlled storage-life study. Original recipes require household kitchen review before release; none may be promoted to shelf-stable canning instructions on this evidence.
- Actual AnyList import, printed output, screen-reader interaction and a full accessibility audit.
- Live GitHub Pages deployment: deliberately not released. No signed-in pantry behavior was tested or changed.
- Only five recipes have primary-crop reference weights. The multi-crop planner does not reserve secondary ingredients, calculate finished yields or enforce equipment/time capacity. It accepts whole batches only.
- Plans are in memory and disappear on reload. Exported displayed weights are rounded.
- Photos are the supplied 688px-wide initial images. All load, but higher-resolution, more accurate imagery may be desirable before release.

## Reproduce

With Playwright and its browsers installed, start `python -m http.server 8765` from the repository root, then:

```sh
TEST_BROWSERS=webkit,chromium node tests/preservation.cjs
```

Use `TEST_BASE_URL` for a project-prefix server, `TEST_WIDTHS=390,320` for focused mobile reruns, or `CHROMIUM_EXECUTABLE_PATH` for an installed Chromium executable. Tests exercise both visible recipe directions and JSON-LD consistency. Browser/dependency workarounds used for this review live outside the repository.
