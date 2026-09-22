import { el } from '../dom.js';
import { labelFlips, projector, tickTransform } from '../scale.js';
import type { Bar, BarChart, BarStyle } from '../types.js';

const BAR_CLASS: Record<BarStyle, string> = {
  solid: 'span',
  muted: 'span alt',
  open: 'span open',
};

/** 條圖最小可見寬度(%),避免極窄區間變成一條線。 */
const MIN_BAR_WIDTH = 1.2;

export function barChart(chart: BarChart): HTMLElement {
  const pct = projector(chart.axis);
  const gridAt = chart.ticks.filter((t) => t.row === 'primary').map((t) => pct(t.at));

  const rows = el(
    'div',
    { class: 'rows' },
    ...chart.bars.map((bar) => barRow(bar, pct, gridAt)),
  );

  const ticks = el(
    'div',
    { class: 'ticks' },
    ...chart.ticks.map((t) => {
      const p = pct(t.at);
      return el('span', {
        class: t.row === 'primary' ? 'lo' : 'hi',
        style: `left:${p.toFixed(2)}%;transform:${tickTransform(p)}`,
        text: t.label,
      });
    }),
  );

  return el(
    'div',
    { class: 'chart', id: chart.id },
    el('h3', { text: chart.title }),
    el('p', { class: 'cap', text: chart.caption }),
    rows,
    el('div', { class: 'axis' }, el('div', { class: 'cap2', text: chart.axis.caption }), ticks),
  );
}

function barRow(
  bar: Bar,
  pct: (v: number) => number,
  gridAt: readonly number[],
): HTMLElement {
  const lo = pct(bar.lo);
  const hi = pct(bar.hi);
  const text = bar.text ?? `${bar.lo}–${bar.hi}`;
  const flip = labelFlips(hi);

  const span = el(
    'div',
    {
      class: `${BAR_CLASS[bar.style ?? 'solid']}${flip ? ' flip' : ''}`,
      style: `left:${lo.toFixed(2)}%;width:${Math.max(hi - lo, MIN_BAR_WIDTH).toFixed(2)}%`,
    },
    el('b', { text }),
  );

  const grid = el(
    'div',
    { class: 'grid' },
    ...gridAt.map((p) => el('i', { style: `left:${p.toFixed(2)}%` })),
  );

  return el(
    'div',
    { class: 'row', 'data-key': `${bar.label} ${text}`.toLowerCase() },
    el('div', { class: 'lbl', text: bar.label }),
    el('div', { class: 'track' }, grid, span),
  );
}
