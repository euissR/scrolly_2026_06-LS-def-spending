// Works locally and on GitHub Pages. Set an absolute URL only to override.
export const CONFIG = {
  BASE_URL: new URL("../", import.meta.url).href,
  DATA_FILE: "data/scatter_safe.csv",
  // Editorial override: these amounts remain unquantified in the chart.
  UNQUANTIFIED: ["NATO Innovation Fund", "NATO DIANA"],
};
