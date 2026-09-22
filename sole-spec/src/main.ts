import { el, mount } from './dom.js';
import { ABRASION, FOAM_HARDNESS, SOLID_HARDNESS } from './data/charts.js';
import { MATERIALS } from './data/materials.js';
import { PICKS } from './data/picks.js';
import { PROCESSES } from './data/processes.js';
import { TESTS } from './data/tests.js';
import { barChart } from './render/chart.js';
import { pickCards } from './render/picks.js';
import { materialTable, processTable, testTable } from './render/table.js';
import { chartTarget, tableTarget, wireSearch } from './search.js';
import type { BarChart } from './types.js';

/** 表格外層:橫向捲動容器 + 空狀態。頁面本體永遠不橫向捲動。 */
function scroller(table: HTMLTableElement, emptyText: string): [HTMLElement, HTMLElement] {
  const empty = el('div', { class: 'empty', text: emptyText });
  return [el('div', { class: 'scroller' }, table, empty), empty];
}

function renderTable(
  slot: string,
  table: HTMLTableElement,
  emptyText: string,
): ReturnType<typeof tableTarget> {
  const [box, empty] = scroller(table, emptyText);
  mount(slot).replaceChildren(box);
  return tableTarget(table, empty);
}

function renderChart(slot: string, spec: BarChart): ReturnType<typeof chartTarget> {
  const chart = barChart(spec);
  mount(slot).replaceChildren(chart);
  return chartTarget(chart);
}

function main(): void {
  const targets = [
    renderTable('slot-materials', materialTable(MATERIALS), '沒有符合的材料。'),
    renderTable('slot-processes', processTable(PROCESSES), '沒有符合的工法。'),
    renderTable('slot-tests', testTable(TESTS), '沒有符合的測試項目。'),
    renderChart('slot-foam-hardness', FOAM_HARDNESS),
    renderChart('slot-solid-hardness', SOLID_HARDNESS),
    renderChart('slot-abrasion', ABRASION),
  ];

  mount('slot-picks').replaceChildren(pickCards(PICKS));

  const input = document.getElementById('q');
  const hits = document.getElementById('hits');
  if (input instanceof HTMLInputElement && hits) wireSearch(input, hits, targets);
}

main();
