import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { CONFIG } from './config.js';
import { normalise } from './data.js';
import { steps } from './steps.js';
import { scrollEngine } from './scroll.js';
import { makeCoverageMatrix } from './charts/coverageMatrix.js';

async function init() {
  const rows = normalise(await d3.csv(new URL(CONFIG.DATA_FILE,CONFIG.BASE_URL)), CONFIG.UNQUANTIFIED);
  document.querySelectorAll('.fm-scrolly').forEach((root,i)=>{
    const allowed = JSON.parse(root.dataset.instruments);
    const chart = makeCoverageMatrix(root.querySelector('.fm-stage'),{rows:rows.filter(d=>allowed.includes(d.name)),id:`fm-${i}`});
    root.classList.add('fm-ready');
    scrollEngine([...root.querySelectorAll('.fm-step')],id=>chart.update({highlight:steps[id] || []}));
  });
}
init().catch(error=>{
  console.error('Financing matrix could not load',error);
  document.querySelectorAll('.fm-stage').forEach(el=>{
    el.classList.add('fm-load-failed');
    const note=document.createElement('p');note.textContent='Interactive chart unavailable. The data table below remains readable.';el.prepend(note);
  });
});
