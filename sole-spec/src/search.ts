/**
 * 全頁篩選:同時過濾表格列與圖表條,並回報符合筆數。
 * 比對的是「已渲染的文字內容」,所以新增資料欄位不需要改這裡。
 */

export interface SearchTarget {
  /** 可被逐列隱藏的容器(表格 tbody 或 .rows)。 */
  readonly rows: readonly HTMLElement[];
  /** 全部隱藏時顯示的空狀態節點。 */
  readonly empty?: HTMLElement | null;
}

export function wireSearch(
  input: HTMLInputElement,
  hits: HTMLElement,
  targets: readonly SearchTarget[],
): void {
  const keys = new Map<HTMLElement, string>();
  for (const target of targets) {
    for (const row of target.rows) {
      keys.set(row, (row.dataset['key'] ?? row.textContent ?? '').toLowerCase());
    }
  }

  const apply = (): void => {
    const query = input.value.trim().toLowerCase();
    let total = 0;

    for (const target of targets) {
      let shown = 0;
      for (const row of target.rows) {
        const match = query === '' || (keys.get(row) ?? '').includes(query);
        row.hidden = !match;
        if (match) shown++;
      }
      target.empty?.classList.toggle('on', shown === 0);
      total += shown;
    }

    hits.textContent = query === '' ? '' : `${total} 筆符合`;
  };

  input.addEventListener('input', apply);
  apply();
}

/** 把一個表格包成 SearchTarget,並附上對應的空狀態節點。 */
export function tableTarget(table: HTMLTableElement, empty: HTMLElement | null): SearchTarget {
  const body = table.tBodies[0];
  return { rows: body ? Array.from(body.rows) : [], empty };
}

/** 把一張圖表包成 SearchTarget(圖表沒有空狀態)。 */
export function chartTarget(chart: HTMLElement): SearchTarget {
  return { rows: Array.from(chart.querySelectorAll<HTMLElement>('.rows > .row')) };
}
