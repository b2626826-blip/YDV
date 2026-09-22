import type { BarChart } from '../types.js';
import { shoreDToA, shoreDTick, tick } from '../scale.js';

/** 發泡體硬度 —— Asker C(SRIS 0101 / JIS K7312)。 */
export const FOAM_HARDNESS: BarChart = {
  id: 'foam-hardness',
  title: '發泡體 — Asker C',
  caption: 'SRIS 0101 / JIS K7312。同密度下硬度仍受泡孔結構影響,±3 度為正常批間差。',
  axis: { min: 25, max: 80, kind: 'linear', caption: 'Asker C' },
  ticks: [25, 35, 45, 55, 65, 75].map((v) => tick(v, `C${v}`)),
  bars: [
    { label: 'PEBA 發泡', lo: 35, hi: 50 },
    { label: 'SCF EVA', lo: 40, hi: 55 },
    { label: 'CM EVA / Phylon', lo: 45, hi: 62 },
    { label: 'PU DIP 中底', lo: 45, hi: 60, style: 'muted' },
    { label: 'E-TPU 珠粒', lo: 48, hi: 60 },
    { label: '發泡橡膠 blown', lo: 50, hi: 68, style: 'muted' },
    { label: 'IM EVA', lo: 55, hi: 70 },
    { label: 'EVA 大底(硬)', lo: 65, hi: 78, style: 'muted' },
  ],
};

/**
 * 實心件硬度 —— 以 Shore A 為主軸。
 * Shore D 的料經 shoreDToA() 換算後放上同一條軸做視覺對照。
 */
export const SOLID_HARDNESS: BarChart = {
  id: 'solid-hardness',
  title: '實心彈性體與塑料 — Shore A / D',
  caption: 'ASTM D2240 / ISO 868。A 錶超過 90 或 D 錶低於 20 時讀值不可靠,需換錶量測。',
  axis: { min: 5, max: 132, kind: 'linear', caption: 'Shore A ↑ / D ↓' },
  ticks: [
    ...[20, 40, 60, 80, 95].map((v) => tick(v, `A${v}`)),
    ...[45, 55, 65, 75].map(shoreDTick),
  ],
  bars: [
    { label: 'SEBS 配方', lo: 5, hi: 60, text: 'A5–A60', style: 'muted' },
    { label: 'TPE-S', lo: 25, hi: 75, text: 'A25–A75', style: 'muted' },
    { label: '生膠／黏性橡膠', lo: 45, hi: 60, text: 'A45–A60' },
    { label: '碳素耐磨橡膠', lo: 60, hi: 72, text: 'A60–A72' },
    { label: '硬橡膠(鞋跟)', lo: 72, hi: 85, text: 'A72–A85' },
    { label: 'TPU 大底', lo: 85, hi: 95, text: 'A85–A95' },
    { label: 'aTPU', lo: 85, hi: 98, text: 'A85–A98', style: 'muted' },
    { label: 'PEBA(未發泡)', lo: shoreDToA(25), hi: shoreDToA(72), text: 'D25–D72' },
    { label: 'TPEE', lo: shoreDToA(35), hi: shoreDToA(72), text: 'D35–D72' },
    { label: 'TPU 穩定件', lo: shoreDToA(50), hi: shoreDToA(70), text: 'D50–D70' },
    { label: 'PA11 / PA12', lo: shoreDToA(70), hi: shoreDToA(75), text: 'D70–D75', style: 'muted' },
    { label: 'PA6 / 66 (+GF)', lo: shoreDToA(78), hi: 132, text: 'D78–D85', style: 'muted' },
  ],
};

/** 耐磨 —— ISO 4649 磨耗體積,對數軸,越短越耐磨。 */
export const ABRASION: BarChart = {
  id: 'abrasion',
  title: '磨耗體積 mm³ — 越短越好',
  caption: '斜線條表示已超出方法適用範圍(發泡體改用 SATRA TM174 或 NBS 百分比)。',
  axis: { min: 20, max: 800, kind: 'log', caption: 'mm³(log)' },
  ticks: [25, 50, 100, 200, 400, 800].map((v) => tick(v, String(v))),
  bars: [
    { label: 'TPU(聚酯型)', lo: 25, hi: 40 },
    { label: 'TPU(聚醚型)', lo: 35, hi: 60 },
    { label: 'PA(含 GF)', lo: 40, hi: 90 },
    { label: 'PEBA(未發泡)', lo: 40, hi: 80 },
    { label: 'aTPU', lo: 45, hi: 75 },
    { label: 'TPEE', lo: 45, hi: 85 },
    { label: '碳素耐磨橡膠', lo: 60, hi: 90 },
    { label: 'PU 實心大底', lo: 80, hi: 150 },
    { label: '一般橡膠大底', lo: 100, hi: 180 },
    { label: '生膠／黏性橡膠', lo: 200, hi: 350 },
    { label: 'TPE-S / TPR', lo: 300, hi: 600 },
    { label: 'EVA 發泡', lo: 500, hi: 800, text: '>500(超出方法範圍)', style: 'open' },
  ],
};
