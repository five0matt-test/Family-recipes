# Recipe photography

Eleven supplied JPEG images are included in `assets/preservation-images/`. They are cropped from an AI-generated food-preservation visual concept, so treat them as **initial imagery**; some are lower resolution than ideal for large recipe heroes.

## Replacing photographs
1. Prepare replacement JPEGs with the same filenames listed below.
2. On the `feature/preservation-library-harvest-helper` branch, upload all 11 JPEG files to `assets/preservation-images/` (create the folder if needed).
3. Commit the upload on the feature branch, not `main`.
4. Verify each recipe page and library card displays its matching photo. Missing files are hidden rather than showing a broken-image icon.
5. Replace any inaccurate or low-resolution crop before release with a dedicated, realistic finished-dish photograph. Keep filenames unchanged.

Expected files:
- roasted-tomatillo-salsa-verde.jpg
- smoky-salsa-tatemada-freezer.jpg
- refrigerator-escabeche.jpg
- quick-pickled-red-onions.jpg
- quick-korean-pickled-daikon.jpg
- basil-pesto-freezer-cubes.jpg
- thai-basil-freezer-portions.jpg
- thai-lemongrass-freezer-paste.jpg
- roasted-poblano-freezer-strips.jpg
- freezer-collard-greens-packs.jpg
- mediterranean-herb-freezer-cubes.jpg

## Binary upload verification
The GitHub Git-data blob API supports base64 binary content. The supplied JPEGs were uploaded using that API and included in the development branch tree. Verify blob SHAs against `git hash-object` when replacing images. Uploading to this branch does not release the feature to `main`.

## Harvest Helper
The new multi-crop planner supports adding multiple harvests, assigning whole reference batches to complete recipes, tracking remaining weight, removing allocations, and downloading a plain-text plan. It currently supports only primary-ingredient batch weights in the catalog, not arbitrary recipes or finished yields. The plan is not saved across page reloads.
