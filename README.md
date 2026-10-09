# Defence financing matrix

## Run locally

From this folder, run `python3 -m http.server 8000` and open `http://localhost:8000/`.
Use HTTP: browsers cannot fetch CSV and ES modules reliably from `file://`.
D3 and Google Fonts use external CDNs; fonts have local fallbacks.

## GitHub Pages and Drupal

1. Upload this folder's contents to your GitHub Pages repository, preserving `css/`, `js/` and `data/`.
2. In `embed.html`, replace every `__ASSET_BASE__` with your GitHub Pages root URL, with no trailing slash (for example `https://euissr.github.io/your-repository`).
3. Paste `embed.html` into the Drupal body using a text format that allows the markup, stylesheet links and module scripts.
4. `js/config.js` derives the asset root from its own hosted URL. Override `BASE_URL` there only if the data lives elsewhere. GitHub Pages must permit cross-origin fetching of the CSV when Drupal loads it.

`index.html` is the complete standalone development page; `embed.html` contains the same article without the development page shell. Both retain the original national-spending and private-capital Flourish charts because their datasets were not supplied. The seven financing sections use the new matrix; the last section provides a complete overview.

## Data and editorial choices

- `data/scatter_safe.csv` is the supplied dataset, unchanged.
- Only `x = Instrument` rows are used. Category endpoint rows are excluded, repeated instrument amounts are counted once, and category membership is deduplicated.
- Amounts use `val_display`; periods use `time_display`. A missing amount is never converted to zero.
- NATO Innovation Fund and NATO DIANA amounts are explicitly suppressed by `UNQUANTIFIED` in `js/config.js`, as requested. Their supplied periods remain visible. Remove those overrides to display the supplied amounts in a later version.
- The revised CSV already uses DSRB. ESRB is also accepted as an alias.
- Dots show category coverage, not money allocated to a category. The timeline shows the period associated with the figure, not annual disbursements. A single-year period gets a dot; a range includes its final year. All sections share the 2021–2038 year axis.
- Original article prose is preserved. The EIB prose says “over €4 billion” while the chart reports the dataset's €4.5bn. No financing types or annualisation have been inferred.
- Every original financing paragraph retains its step. The three paragraphs sharing Flourish slide 10 now independently highlight EDIRPA, SAFE and EDIP.

## Implementation

The architecture follows the attached modules: `main.js` loads data and wires the scroll engine; `steps.js` defines highlights; `coverageMatrix.js` exposes `update(state)`; `theme.js` supplies the existing palette.

Native HTML tables keep text readable and expose row/column headers to assistive technology. D3 binds the data, renders the timelines and changes highlights. Buttons support keyboard interaction. Reduced motion is respected. A static data table remains if the interactive module fails or JavaScript is disabled.

Below 1000px, the chart sits above the narrative; its table scrolls locally. On wider screens, narrative and chart sit alongside each other. Styles are scoped and sizing follows the available container, without a `100vw` breakout. This avoids introducing CMS overflow; full bleed still requires a Drupal parent layout that permits it. A sticky ancestor with `overflow: hidden/auto` may require a CMS theme adjustment.

## Editing

Edit coverage and figures in the CSV; edit original prose in the HTML. `data-instruments` on each section controls its row set. `data-step` connects each paragraph to `js/steps.js`. Source colours are defined in the chart module using the supplied theme palette.

## Validation

JavaScript syntax, CSV normalisation, 17 instruments / 35 coverage links, NATO overrides, period parsing, unique HTML IDs, section assets, and preservation of all 25 original financing paragraphs were checked. There are 26 steps including the final overview. Browser rendering and interaction remain unverified: the browser runtime could not be installed in this environment. Test the standalone page before publishing to Drupal.
