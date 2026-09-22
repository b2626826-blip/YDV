import { append, el, valueNodes } from '../dom.js';
import type { Badge, Material, Process, TestMethod, Value } from '../types.js';

const TONE_CLASS: Record<Badge['tone'], string> = {
  plain: 'chip',
  accent: 'chip a',
  good: 'chip g',
  warn: 'chip w',
  crit: 'chip c',
};

function badge(b: Badge): HTMLElement {
  return el('span', { class: TONE_CLASS[b.tone] }, ...valueNodes(b.text, b.sub));
}

function numCell(v: Value): HTMLTableCellElement {
  return el('td', { class: 'num' }, ...valueNodes(v.text, v.sub));
}

/** 多行值:工法表的溫度、週期等欄位。 */
function lines(values: readonly Value[]): HTMLTableCellElement {
  const cell = el('td', { class: 'num' });
  values.forEach((v, i) => {
    if (i > 0) cell.appendChild(el('br'));
    append(cell, valueNodes(v.text, v.sub));
  });
  return cell;
}

function nameCell(name: string, sub: string): HTMLTableCellElement {
  return el('td', { class: 'name' }, ...valueNodes(name, sub));
}

function table(headers: readonly string[], rows: readonly HTMLTableRowElement[]): HTMLTableElement {
  const head = el('thead', {}, el('tr', {}, ...headers.map((h) => el('th', { text: h }))));
  return el('table', {}, head, el('tbody', {}, ...rows));
}

const MATERIAL_HEADERS = [
  '材料', '類別', '硬度', '密度 g/cm³', 'ISO 4649 mm³', '回彈 %',
  '壓縮永變', '連續耐溫 °C', '耐水解', '主要工法', '料價 EVA=1', '回收',
] as const;

export function materialTable(materials: readonly Material[]): HTMLTableElement {
  const rows = materials.map((m) =>
    el(
      'tr',
      { 'data-id': m.id },
      nameCell(m.name, m.fullName),
      el('td', {}, el('span', { class: 'chip', text: m.category })),
      numCell(m.hardness),
      numCell(m.density),
      numCell(m.abrasion),
      el('td', { class: 'num', text: m.resilience }),
      el('td', {}, badge(m.compressionSet)),
      el('td', { class: 'num', text: m.serviceTemp }),
      el('td', {}, badge(m.hydrolysis)),
      el('td', { text: m.process }),
      numCell(m.costIndex),
      el('td', {}, badge(m.recyclable)),
    ),
  );
  return table(MATERIAL_HEADERS, rows);
}

const PROCESS_HEADERS = [
  '工法', '適用材料', '料溫／預熱', '模溫', '壓力', '模內時間', '收縮／放大率', '關鍵管控點',
] as const;

export function processTable(processes: readonly Process[]): HTMLTableElement {
  const rows = processes.map((p) =>
    el(
      'tr',
      { 'data-id': p.id },
      nameCell(p.name, p.subtitle),
      el('td', { text: p.materials }),
      lines(p.meltTemp),
      lines(p.moldTemp),
      el('td', { class: 'num', text: p.pressure }),
      lines(p.cycle),
      lines(p.shrinkage),
      el('td', { class: 'note', text: p.control }),
    ),
  );
  return table(PROCESS_HEADERS, rows);
}

const TEST_HEADERS = ['項目', '標準', '條件', '單位／判讀', '常見要求'] as const;

export function testTable(tests: readonly TestMethod[]): HTMLTableElement {
  const rows = tests.map((t) =>
    el(
      'tr',
      { 'data-id': t.id },
      el('td', { class: 'name', text: t.item }),
      el('td', { class: 'num', text: t.standard }),
      el('td', { text: t.condition }),
      el('td', { text: t.unit }),
      el('td', { class: 'note', text: t.requirement }),
    ),
  );
  return table(TEST_HEADERS, rows);
}
