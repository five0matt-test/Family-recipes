# Preservation photography — Step 1

19 separate AI-generated realistic photographs were created using the built-in image-generation tool, individually prompted from the corresponding recipe. Each is stored at `images/<recipe-page-stem>.jpg`, optimized to 1280 × 720 (16:9). Combined JPEG size: 4,071,767 bytes.

All 19 recipe pages include the photograph with descriptive alt text and intrinsic dimensions. All corresponding catalog entries supply their library/Harvest Helper card photograph. Recipe JSON-LD uses the absolute GitHub Pages image URL. The existing 11 photographs are preserved. Shared CSS is unchanged: library photos use `object-fit:cover` at 164px desktop / 170px mobile; recipe photos use the existing 16:9 crop and mobile height limit.

## Verification for this photography change

- PASS: 19 distinct JPEGs decode at 1280 × 720; each catalog path, visible recipe image, and absolute Recipe image URL maps to the same existing file.
- PASS: all 19 photographs visually inspected together for subject, preparation and consistent lighting/composition. These are illustrative generated images, not photographs of kitchen-tested batches.
- PASS: JavaScript syntax and git whitespace checks.
- PASS (follow-up, October 29, 2026): Chromium 156.0.8078.73 dedicated headless shell via Playwright. All 19 new images load and decode on library cards and recipe pages at 1280/390/320px. Matching JSON-LD paths, fixed card heights, cover cropping, no horizontal overflow, and no HTTP/page errors. The full Chrome startup socket problem was avoided by using the dedicated headless distribution.
- PASS: full Preservation Library regression at 1280/844/430/390/375/320px, with mobile/touch emulation below 500px: all 30 recipe photos, all crop/method/flavor filters, search, navigation, multi-crop allocations, remaining quantities, invalid inputs, text downloads and single-crop unit conversions.
- PASS: all 19 additions retain matching visible/schema ingredients and directions; 1280/390/320 layouts, 200% text at 390px, print visibility, helper preselection, and all 15 new reference-batch allocations/over-allocation rejection/download contents. Axe accessibility scan was not rerun.
- PASS: visual inspection of 390px library screenshots and representative jalapeño, herb-portion and pumpkin recipe screenshots. No product layout or cropping fixes were needed.
- Added `tests/preservation-photos.cjs` for actual image decoding on cards and pages, schema path agreement, fixed thumbnail heights and overflow at 1280/390/320px. Run from the repository root with a local server on port 8765 and Playwright Chromium installed. Set `CHROMIUM_EXECUTABLE_PATH` for a dedicated headless executable if needed; set `PHOTO_SCREENSHOT_DIR` to retain screenshots. Start the server and tests in the same execution environment. Existing expansion test selects the 19 additions by their new image directory. The broader preservation test now expects all 30 local photos, checks paths in either image directory, and applies cold-storage checks only to refrigerated/frozen projects.
- Physical iPhone/Safari, AnyList image imports, and deployed Pages image URLs remain untested. Feature-branch image integration does not publish to the main-branch Pages site.

PR #3 remains draft. No merge or main-branch change is authorized by this step.

## Generation prompt set

Common style prompt: Use case: photorealistic-natural. Generate ONE standalone realistic food photograph for the Family Recipes preservation website. Landscape 16:9. Warm natural window lighting, rustic neutral wood table, simple clean vessels, appetizing honest home food photography, three-quarter close view, crisp realistic food texture, subtle depth of field. Center subject with generous margins so a fixed-height object-fit cover thumbnail remains readable. No text, labels, watermark, collage, hands, unrelated ingredients, or sealed canning display. Subject:

1. Refrigerator jalapeños: quarter-inch pepper rings in clear vinegar brine, halved garlic, dried Mexican oregano; open refrigerator jar and small bowl; same common style constraints.

2. Fresh Korean-style refrigerated cabbage: bite-size Napa cabbage tossed with orange-red gochugaru dressing, daikon matchsticks and sliced green onions, garlic ginger fish sauce. Crisp fresh salad, not fermented, small ceramic bowl.

3. Dried Mediterranean herb seasoning: crumbly dried oregano and thyme leaves, crushed rosemary and sage, small ceramic bowl and open dry storage jar. No salt or paprika.

4. Cilantro and parsley freezer portions: small frozen cubes of chopped cilantro and flat-leaf parsley in water, frosty green herb-dense cubes on a small cold tray, silicone mold nearby. No oil.

5. Freezer corn and pepper skillet mix: frozen loose yellow sweetcorn kernels and half-inch red and green bell pepper strips, slight frost, shallow freezer container. Unseasoned, uncooked after blanching, no onion.

6. Freezer-ready okra: blanched green okra pods and crosswise cut okra with visible pale seeds, lightly frosted in shallow freezer container, no breading or sauce.

7. Refrigerator dill cucumber pickles: quarter-inch cucumber ROUNDS submerged in clear brine with fresh dill sprigs, halved garlic and black peppercorns in open glass refrigerator jar, small serving bowl. No spears.

8. Refrigerator carrot and daikon pickle: thin orange carrot and white daikon MATCHSTICKS in clear sweet vinegar brine, open glass refrigerator jar and small bowl, no chili or herbs.

9. Zucchini and summer squash freezer prep: half-inch green zucchini rounds, blanched and lightly frosted in shallow freezer container. No sauce, oil, browning or seasoning.

10. Frozen pumpkin puree: smooth plain rich orange cooked pumpkin puree in shallow freezer-safe container with expansion space and a few frozen puree portions nearby. No cream, spices or garnish.

11. Frozen citrus zest and juice: pale yellow Meyer lemon juice ice cubes and separate small mounds of finely grated lemon zest on small chilled tray, cut Meyer lemon beside. No herbs.

12. Unsweetened frozen figs: whole and halved ripe purple figs with pink seeded interiors, lightly frosted in shallow freezer container. No syrup or sugar.

13. Dried mint and chamomile tea blend: small ceramic bowl of crumbly dry mint leaves and whole fully dried chamomile flower heads, cup of pale golden strained tea beside, no tea bags.

14. Chopped onion and leek freezer mix: quarter-inch diced white-yellow onion mixed with thin white and pale green leek rings, lightly frosted in shallow freezer container, no oil or browned pieces.

15. Garlic and herb freezer portions NO OIL: small frosty tablespoon cubes of coarse chopped garlic and flat-leaf parsley blended with water, pale garlic flecked with green, silicone tray beside, no butter or oil.

16. Cooked sweet potato freezer portions: peeled cooked orange sweet potato slices and small portions plain mash in shallow freezer container, lightly frosted. No skin, butter, sugar or spices.

17. Frozen roasted tomato sauce starter: thick rustic red-orange mashed roasted tomatoes with tiny dried oregano flecks and blended roasted garlic, shallow freezer container with expansion space, no basil garnish or pasta.

18. Greek lemon-herb freezer starter: frosty small pale-yellow lemon-juice cubes densely flecked with finely chopped oregano, thyme, rosemary and minced garlic, silicone tray beside, Meyer lemon half nearby. No oil, meat or dairy.

19. Cilantro-citrus salsa starter: bright green coarse blended cilantro jalapeno garlic lime juice and water frozen into small tablespoon portions, frosty green cubes on small cold tray with silicone mold nearby. No tomatoes or oil.
