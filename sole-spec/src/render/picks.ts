import { el } from '../dom.js';
import type { PickCard } from '../types.js';

export function pickCards(cards: readonly PickCard[]): HTMLElement {
  return el(
    'div',
    { class: 'cards' },
    ...cards.map((card) =>
      el(
        'div',
        { class: 'card' },
        el('h4', {}, el('em', { text: card.index }), card.title),
        el(
          'ul',
          {},
          ...card.options.map((o) =>
            el('li', {}, el('strong', { text: o.when }), ` → ${o.use}`),
          ),
          el('li', { text: `失敗模式:${card.failureMode}` }),
        ),
      ),
    ),
  );
}
