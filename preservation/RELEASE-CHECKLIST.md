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
