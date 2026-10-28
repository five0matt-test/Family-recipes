# Preservation Library — Release verification checklist

This feature is in a draft PR. Do not merge until links, recipes and mobile interactions are reviewed.

## Included
- 70 selectable crops and 39 catalog entries.
- Eleven original full recipes for refrigerator or freezer use.
- Filterable library and Harvest Helper with equipment/time ranking.
- Reference-batch estimates for **only** tomatillos (2 lb), poblano peppers (2 lb), Roma/paste tomatoes (2 lb), daikon (1 lb), and red onions (8 oz). Conversion factors are 453.59237 g/lb and 28.349523125 g/oz.
- Links to external tested preservation resources. Each link needs editorial verification before release.

## Safety limitations
- Catalog entries without full recipe pages are *project briefs*, not preservation instructions.
- Do not use a project brief to can or ferment food.
- Batch estimates are for primary raw ingredient quantity only; they are not finished yields, and they do not authorize recipe scaling.
- Shelf-stable canning must follow an up-to-date, verified tested recipe including altitude, jar size, headspace and processing method.
- Refrigerator pickles and sauces are not shelf-stable. Frozen garlic/herb mixtures must remain frozen.
- Never home-can pumpkin or winter-squash purée.

## Manual checks before merging
- [ ] Test crop/method/flavor filters on iPhone Safari and desktop.
- [x] Test Harvest Helper invalid, fractional and large quantities; lb, oz, g, count and bunches in automated WebKit/Chromium.
- [x] Verify all eleven recipe pages, images and recipe-to-helper links in automated browsers.
- [x] Verify final preservation reference URLs resolve and review their applicability; see PRE-RELEASE-REVIEW.md.
- [x] Review all 11 recipes against authoritative general handling guidance and correct identified content issues.
- [ ] Kitchen-test original recipes and verify their storage recommendations before release; exact formulas are not laboratory validated.
- [x] Check navigation across recipes, meal plans, pantry and preservation (signed-out navigation only).
- [ ] Check printer output and AnyList recipe import.
- [x] Add the 11 supplied JPEGs with consistent thumbnail sizing.
- [ ] Editorially review AI-generated imagery and replace inaccurate or low-resolution photographs.
- [x] Test mobile viewports, enlarged text, labels and image layout in WebKit/Chromium.
- [ ] Complete physical-device keyboard/screen-reader and accessibility review.
- [x] Keep all development changes on the feature branch; leave main and draft status unchanged.

## Next content priority
Verify the eleven existing full recipes and develop ingredient reference batches for those without weight data. Avoid inventing shelf-stable or fermentation processes.

## October 28 recipe additions (included in draft PR #2)
- [x] Add Same-Day Caramelized Onion, Feta & Black Pepper Sourdough recipe page and homepage listing, including Recipe JSON-LD.
- [x] Update Caldo Verde for smoked kielbasa, paprika, and red wine vinegar; synchronize homepage ingredients and title.
- [x] Verify committed recipe files and homepage source can be fetched from the development branch.
- [x] Add the exact supplied sourdough JPEG to the recipe, homepage card and JSON-LD with existing responsive thumbnail sizing.
- [ ] Verify the new recipe in physical iPhone Safari, including layout, recipe tools and print output.
- [ ] Test actual AnyList import of both the new sourdough and updated Caldo Verde; inspect ingredients and directions.
- [ ] Kitchen-test sourdough timing/texture and the kielbasa soup seasoning; timing is approximate and not independently validated.
- [x] Review the updated pages and home card in automated browsers and inspect 390px screenshots; see final follow-up results in PRE-RELEASE-REVIEW.md.
- [ ] Explicit owner approval to release; do not merge PR #2 or change main until then.

## Final follow-up checks
- [x] Rerun preservation tests in WebKit/Chromium at six desktop/phone widths, including real plan downloads.
- [x] Correct sourdough gram-unit scaling, soup ingredient import lines, slow-cooker handling/timing and enlarged-title wrapping.
- [x] Confirm final recipe regression suite passes in WebKit/Chromium at all six widths, including enlarged text, 29 structured recipes and 206 local references.
- [ ] Owner final release approval; keep draft PR #2 unmerged and do not deploy.

## Print/accessibility continuation
- [x] Fix printing from active Cooking mode; verify complete recipes in print media in WebKit and Chromium.
- [x] Render and visually inspect two-page Chromium US Letter previews for sourdough and Caldo Verde.
- [x] Preserve native recipe lists and test Space/Enter toggle state, meaningful direction names and cooking entry/exit focus.
- [x] Run axe-core WCAG A/AA scans on signed-out home/library/helper/pantry and both recipe/cooking states in WebKit/Chromium (zero violations in tested states).
- [x] Visually review all 11 preservation images and document preparation-stage/finished-form differences.
- [ ] Owner acceptance or replacement of illustrative preservation photos, especially poblano strips, pesto cubes and herb-cube medium.
- [ ] Physical iPhone/AnyList/print/VoiceOver checks and kitchen testing; automated passes do not close these items.
