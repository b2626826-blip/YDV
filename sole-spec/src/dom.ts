/** 最小的 DOM 建構工具,取代字串拼接的 innerHTML。 */

type Attrs = Record<string, string | number | boolean | undefined>;
type Child = Node | string | null | undefined | false;

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    if (key === 'class') node.className = String(value);
    else if (key === 'text') node.textContent = String(value);
    else node.setAttribute(key, String(value));
  }
  append(node, children);
  return node;
}

export function append(parent: Node, children: Child[]): void {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    parent.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
}

/** 取得必定存在的掛載點;找不到就直接報錯,不做靜默 fallback。 */
export function mount(id: string): HTMLElement {
  const node = document.getElementById(id);
  if (!node) throw new Error(`找不到掛載點 #${id}`);
  return node;
}

/** 主值 + 小字註解的儲存格內容。 */
export function valueNodes(text: string, sub?: string): Child[] {
  return [text, sub ? el('small', { text: sub }) : null];
}
