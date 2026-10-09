export const categories = ['R&D', 'industrial production', 'procurement', 'infrastructure and logistics', 'external assistance'];
export const order = ['SAFE', 'Ukraine Support loan', 'EDF', 'ASAP', 'EDIRPA', 'EDIP', 'EPF', 'CEF', 'EIC', 'Cohesion Funds', 'EIB', 'National public institutions', 'MDM', 'DSRB', 'Private funding', 'NATO Innovation Fund', 'NATO DIANA'];

export function parsePeriod(value) {
  const match = String(value).trim().match(/^(\d{4})(?:\s*[-–]\s*(\d{2}|\d{4}))?$/);
  if (!match) return null;
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2].length === 2 ? match[1].slice(0, 2) + match[2] : match[2]) : start;
  if (end < start) return null;
  return { start, end };
}

export function normalise(rows, unquantified = []) {
  const grouped = new Map();
  for (const row of rows.filter(r => r.x === 'Instrument')) {
    const name = row.name === 'ESRB' ? 'DSRB' : row.name;
    if (!categories.includes(row.category)) throw new Error(`Unknown category: ${row.category}`);
    const known = row.value_known === 'TRUE' && row.val.trim() !== '' && Number.isFinite(Number(row.val));
    if (!grouped.has(name)) grouped.set(name, {name, source: row.source, value: known ? Number(row.val) : null, display: row.val_display, time: row.time_display.trim(), categories: new Set()});
    const item = grouped.get(name);
    if (item.value !== (known ? Number(row.val) : null) || item.time !== row.time_display.trim()) throw new Error(`Conflicting repeated values for ${name}`);
    item.categories.add(row.category);
  }
  return [...grouped.values()].map(item => ({...item, categories: [...item.categories], period: parsePeriod(item.time), display: unquantified.includes(item.name) || item.value === null ? 'Not quantified' : item.display, value: unquantified.includes(item.name) ? null : item.value})).sort((a,b) => order.indexOf(a.name) - order.indexOf(b.name));
}
