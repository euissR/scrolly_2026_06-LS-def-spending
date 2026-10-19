import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { categories } from '../data.js';
import { theme } from '../theme.js';

export function makeCoverageMatrix(el, { rows, id }) {
  const sourceColors = {'EU':theme.teal, 'MSs':theme.egg, 'Multilateral/intergovernmental':theme.teal3, 'Private funding':theme.fuchsia, 'NATO':theme.teal2};
  const label = {'industrial production':'Industrial production', procurement:'Procurement', 'infrastructure and logistics':'Infrastructure & logistics', 'external assistance':'External assistance', 'R&D':'R&D'};
  el.innerHTML = `<header class="fm-head"><h4 id="${id}-title">Where defence finance can help</h4><p>Instrument totals, funding periods and areas covered</p></header>
    <p class="fm-focus" aria-live="polite"></p>
    <div class="fm-controls"><button type="button" class="fm-reset">Show all rows</button><span> Select an area to compare coverage</span></div>
    <div class="fm-table-scroll" tabindex="0" role="region" aria-label="Coverage matrix; scroll sideways on small screens"><table class="fm-table"><caption class="fm-sr">Funding and category coverage. Dots indicate coverage, not allocated amounts.</caption><thead></thead><tbody></tbody></table></div>
    <p class="fm-note">Funding circle area is proportional to € billions; the same €150bn scale applies throughout. Grey lines show funding periods.<br>● Area covered · — Coverage not listed. Amounts are instrument totals, not allocations to each area. Financing types and periods differ; totals should not be added together.</p>`;
  const table = d3.select(el.querySelector('table'));
  let state = {highlight: []}, selectedCategory = null;
  const domain = [2021, 2039]; // end boundary includes all of 2038
  const time = d3.scaleLinear().domain(domain).range([4, 108]);
  // Circle AREA encodes the amount. A fixed domain keeps sections comparable.
  // No minimum radius: small figures retain their true proportions.
  const fundingRadius = d3.scaleSqrt().domain([0, 150]).range([0, 22]);
  const heads = table.select('thead').append('tr');
  heads.append('th').attr('scope','col').text('Instrument');
  heads.append('th').attr('scope','col').text('Funding (€ bn)');
  heads.append('th').attr('scope','col').text('Period');
  heads.selectAll('th.fm-category').data(categories).join('th').attr('scope','col').attr('class','fm-category').append('button').attr('type','button').attr('aria-pressed','false').text(c=>label[c]).on('click', (event,c) => {selectedCategory = selectedCategory === c ? null : c; renderState();});
  const tr = table.select('tbody').selectAll('tr').data(rows,d=>d.name).join('tr').style('--fm-source',d=>sourceColors[d.source] || theme.grey);
  const names = tr.append('th').attr('scope','row');
  names.append('button').attr('type','button').attr('class','fm-instrument').attr('aria-pressed','false').text(d=>d.name).on('click', (event,d) => {selectedCategory=null; state={highlight:[d.name]}; renderState();});
  names.append('small').text(d=>d.source === 'MSs' ? 'Member States' : d.source === 'Multilateral/intergovernmental' ? 'Multilateral' : d.source);
  const funding = tr.append('td').attr('class','fm-funding');
  const amounts = funding.append('div').attr('class','fm-amount');
  amounts.filter(d=>d.value !== null).append('svg').attr('class','fm-funding-symbol').attr('viewBox','0 0 46 46').attr('width',46).attr('height',46).attr('role','img').attr('aria-label',d=>`${d.name}: ${d.display}; circle area represents funding`).each(function(d){
    const svg = d3.select(this);
    svg.append('title').text(`${d.display} · circle area proportional to amount; common €150bn scale`);
    svg.append('circle').attr('cx',23).attr('cy',23).attr('r',fundingRadius(d.value)).attr('fill',theme.teal);
  });
  amounts.append('strong').text(d=>d.display);
  tr.append('td').attr('class','fm-period').each(function(d){
    const cell = d3.select(this);
    if (!d.period) {cell.append('span').text('Not specified'); return;}
    cell.append('small').text(d=>d.time);
    const svg=cell.append('svg').attr('viewBox','0 0 112 22').attr('width',112).attr('height',22).attr('role','img').attr('aria-label',`${d.name}: ${d.time}`);
    svg.append('title').text(`Funding period: ${d.time}`);
    // Annual totals get a marker; multi-year periods include their final year.
    if (d.period.start === d.period.end) svg.append('circle').attr('cx',time(d.period.start + .5)).attr('cy',11).attr('r',2).attr('fill','#a7afb3');
    else {
      svg.append('line').attr('x1',time(d.period.start)).attr('x2',time(d.period.end+1)).attr('y1',11).attr('y2',11).attr('stroke','#a7afb3').attr('stroke-width',1);
      svg.selectAll('line.fm-period-cap').data([d.period.start,d.period.end+1]).join('line').attr('class','fm-period-cap').attr('x1',y=>time(y)).attr('x2',y=>time(y)).attr('y1',8).attr('y2',14).attr('stroke','#a7afb3').attr('stroke-width',1);
    }
  });
  tr.each(function(d){d3.select(this).selectAll('td.fm-cell').data(categories.map(category=>({category,covered:d.categories.includes(category)}))).join('td').attr('class','fm-cell').attr('data-category',c=>c.category).attr('aria-label',c=>`${label[c.category]}: ${c.covered?'covered':'coverage not listed'}`).append('span').attr('aria-hidden','true').attr('class',c=>c.covered?'fm-dot':'fm-empty').text(c=>c.covered?'●':'—');});

  function renderState() {
    const high = state.highlight || [];
    tr.classed('fm-dim',d=>selectedCategory ? !d.categories.includes(selectedCategory) : high.length > 0 && !high.includes(d.name));
    tr.select('.fm-instrument').attr('aria-pressed',d=>String(!selectedCategory && high.includes(d.name)));
    heads.selectAll('.fm-category button').attr('aria-pressed',c=>String(c===selectedCategory));
    table.selectAll('.fm-cell').classed('fm-selected-category',c=>c.category===selectedCategory);
    const chosen=rows.filter(d=>high.includes(d.name));
    el.querySelector('.fm-focus').textContent = selectedCategory ? `${label[selectedCategory]} · ${rows.filter(d=>d.categories.includes(selectedCategory)).length} instruments in this section` : chosen.length === 1 ? `${chosen[0].name} · ${chosen[0].display} · ${chosen[0].time || 'Period not specified'}` : `${rows.length} instruments · compare their coverage`;
  }
  el.querySelector('.fm-reset').addEventListener('click',()=>{state={highlight:[]};selectedCategory=null;renderState();});
  renderState();
  return {el, update(next) {state=next;selectedCategory=null;renderState();}};
}
