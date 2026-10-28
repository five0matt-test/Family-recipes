# Preservation photography and Harvest Helper verification

Date: 2026-10-28. Scope: `feature/preservation-library-harvest-helper`, PR #2.

## Changes

- Add all 11 supplied JPEGs in `assets/preservation-images/`, without re-encoding them.
- Match every photo to its catalog entry and recipe-page path.
- Move recipe heroes into recipe content below the title; add descriptive alt text and intrinsic dimensions.
- Constrain preservation controls to their grid columns on narrow viewports.
- Preserve the selected harvest and recipe when allocations or harvest totals change. Previously, assigning a batch to the second crop reset the selector to the first crop.
- Update outdated photography and release documentation.

## Passed

Automated Playwright checks in WebKit at 1280, 390 and 320 CSS pixels:

- All 11 library photos decode, use cover cropping, and have equal thumbnail heights.
- All 11 individual recipe pages load their matching JPEG and fit the viewport.
- Library, recipe pages and initial Harvest Helper layout have no horizontal document overflow.
- Multiple crops coexist, and repeated additions of the same crop combine their weights.
- Pounds, ounces and grams produce the expected allocation totals.
- Whole-batch allocations subtract from the correct crop, including multiple allocations against one harvest.
- Allocation changes retain the selected harvest; unsupported crops remain unallocated.
- Over-allocation, fractional batches, zero/negative weights and weights above the input limit are rejected.
- Removing an allocation restores its weight; removing a crop removes its allocations.
- Text export downloads successfully with harvest totals, batch counts, remaining quantities, recipe URLs and estimation limitations.
- Single-crop suggestions calculate equivalent reference batches for lb/oz/g. Count and bunches do not produce weight-based batch estimates.
- No page JavaScript errors or HTTP errors during these checks.

Repeated successfully with a project-directory URL prefix to check GitHub Pages relative paths and exported recipe URLs. Visually inspected desktop library and mobile recipe screenshots.

All 11 remote image tree entries are verified against local Git blob hashes after the branch update. `main` remains at `9f564be730d223f98b3cd2252216deb187d2402e`; PR #2 remains unmerged. No hosting settings were changed.

## Reproduce

Install Playwright in a development environment and install its WebKit browser/dependencies. From the repository root, start `python -m http.server 8765`, then in another terminal run:

```sh
TEST_BROWSERS=webkit node tests/preservation.cjs
```

Set `TEST_BASE_URL` to test another local project prefix. The test supports `TEST_BROWSERS=chromium,webkit` when both browsers are installed. This run used WebKit only: Chromium's browser download was unavailable. The environment required temporary browser dependencies outside the repository.

## Still unfinished before release

- Physical iPhone/iPad Safari and Chromium/Chrome verification.
- Authoritative editorial verification of recipes, storage guidance and external preservation links (not assessed in this development pass).
- Supplied images are initial AI-generated crops, 688 pixels wide. Review accuracy and sharpness before release; higher-resolution hero photographs may be desirable.
- Only five recipes currently have primary-ingredient batch weights. Other recipes cannot receive automatic batch allocations.
- Allocations track primary ingredients only; secondary ingredients, finished yields and equipment/time constraints are not reserved by the multi-crop planner.
- Plans are not persisted across reloads; users must download the text plan.
- Print and AnyList import testing remain on the release checklist.

No merge or live release is authorized by this verification.
