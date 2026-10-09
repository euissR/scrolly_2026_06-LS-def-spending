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
    <p class="fm-note">● Area covered · — Coverage not listed<br>Amounts are instrument totals, not allocations to each area. Financing types and periods differ; totals should not be added together.</p>`;
  const table = d3.select(el.querySelector('table'));
  let state = {highlight: []}, selectedCategory = null;
  const domain = [2021, 2039]; // end boundary includes all of 2038
  const time = d3.scaleLinear().domain(domain).range([4, 108]);
  const heads = table.select('thead').append('tr');
  heads.append('th').attr('scope','col').text('Instrument');
  heads.append('th').attr('scope','col').text('Funding / period');
  const periodHead = heads.append('th').attr('scope','col').text('Period');
  const axis = periodHead.append('svg').attr('viewBox','0 0 112 27').attr('width',112).attr('height',27).attr('aria-hidden','true');
  axis.append('g').attr('transform','translate(0,3)').call(d3.axisBottom(time).tickValues([2021,2030,2038]).tickFormat(d3.format('d')).tickSize(3));
  heads.selectAll('th.fm-category').data(categories).join('th').attr('scope','col').attr('class','fm-category').append('button').attr('type','button').attr('aria-pressed','false').text(c=>label[c]).on('click', (event,c) => {selectedCategory = selectedCategory === c ? null : c; renderState();});
  const tr = table.select('tbody').selectAll('tr').data(rows,d=>d.name).join('tr').style('--fm-source',d=>sourceColors[d.source] || theme.grey);
  const names = tr.append('th').attr('scope','row');
  names.append('button').attr('type','button').attr('class','fm-instrument').attr('aria-pressed','false').text(d=>d.name).on('click', (event,d) => {selectedCategory=null; state={highlight:[d.name]}; renderState();});
  names.append('small').text(d=>d.source === 'MSs' ? 'Member States' : d.source === 'Multilateral/intergovernmental' ? 'Multilateral' : d.source);
  const funding = tr.append('td').attr('class','fm-funding');
  funding.append('strong').text(d=>d.display);
  funding.append('small').text(d=>d.time || 'Period not specified');
  tr.append('td').attr('class','fm-period').each(function(d){
    const cell = d3.select(this);
    if (!d.period) {cell.append('span').text('Not specified'); return;}
    const svg=cell.append('svg').attr('viewBox','0 0 112 22').attr('width',112).attr('height',22).attr('role','img').attr('aria-label',`${d.name}: ${d.time}`);
    svg.append('title').text(`Funding period: ${d.time}`);
    svg.selectAll('line.fm-guide').data([2021,2030,2038]).join('line').attr('class','fm-guide').attr('x1',y=>time(y)).attr('x2',y=>time(y)).attr('y1',0).attr('y2',22).attr('stroke','#e5e8ea');
    // Annual totals get a marker; multi-year periods include their final year.
    if (d.period.start === d.period.end) svg.append('circle').attr('cx',time(d.period.start + .5)).attr('cy',11).attr('r',4).attr('fill','var(--fm-source)');
    else svg.append('rect').attr('x',time(d.period.start)).attr('width',time(d.period.end+1)-time(d.period.start)).attr('y',7).attr('height',8).attr('rx',3).attr('fill','var(--fm-source)');
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
