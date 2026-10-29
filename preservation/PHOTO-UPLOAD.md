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
The new multi-crop planner supports adding multiple harvests, assigning whole reference batches to complete recipes, tracking remaining weight, removing allocations, and downloading a plain-text plan. It currently supports only primary-ingredient batch weights in the catalog, not arbitrary recipes or finished yields. The plan saves automatically in this browser when browser storage is available. It can be restored after a reload or later visit, cleared with confirmation, or downloaded as a text backup. It does not sync across devices or household members.

## Record a finished batch in the shared pantry

Use “I made this → Add to pantry” on a complete preservation recipe or a Harvest Helper allocation. Sign in on the pantry page, enter the actual amount made, choose units and the appropriate storage location, and review the preparation date before saving. Best by remains optional and is never calculated automatically. The batch keeps its recipe link and stays separate from other batches. Pantry exports retain batch dates and recipe links. Recording a batch does not deduct ingredients or change Harvest Helper allocations.
