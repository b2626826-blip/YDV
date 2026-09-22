import type { Axis, AxisTick } from './types.js';

/**
 * Shore D → Shore A 的近似換算。
 *
 * 依 ASTM D2240 的重疊區經驗值:A95 ≈ D45、A90 ≈ D40。
 * 只用來把 D 值放到同一條 Shore A 軸上做視覺對照,
 * 不可當作規格換算 —— 規格書仍須標明實際量測的錶別。
 */
export function shoreDToA(d: number): number {
  return d * 1.05 + 47;
}

/** 建立一個 secondary 排的 Shore D 刻度,位置換算到 Shore A 軸。 */
export function shoreDTick(d: number): AxisTick {
  return { at: shoreDToA(d), label: `D${d}`, row: 'secondary' };
}

/** 建立一個 primary 排的刻度。 */
export function tick(at: number, label: string): AxisTick {
  return { at, label, row: 'primary' };
}

/**
 * 回傳把軸單位換算成 0–100 百分比的函式。
 * 超出範圍的值會被夾在 [0, 100],避免條圖溢出軌道。
 */
export function projector(axis: Axis): (value: number) => number {
  const { min, max, kind } = axis;
  if (kind === 'log') {
    if (min <= 0) throw new RangeError('對數軸的 min 必須大於 0');
    const lo = Math.log(min);
    const span = Math.log(max) - lo;
    return (v) => clamp(((Math.log(v) - lo) / span) * 100);
  }
  const span = max - min;
  return (v) => clamp(((v - min) / span) * 100);
}

function clamp(pct: number): number {
  return Math.min(100, Math.max(0, pct));
}

/**
 * 刻度文字的對齊方式。
 * 貼齊兩端的刻度改用靠邊對齊,否則會被軌道切掉或壓到軸標題。
 */
export function tickTransform(pct: number): string {
  if (pct <= 2) return 'translateX(0)';
  if (pct >= 98) return 'translateX(-100%)';
  return 'translateX(-50%)';
}

/**
 * 條圖標籤要畫在右側還是左側。
 * 條的右端超過 74% 時改畫左側,否則標籤會被軌道切掉。
 */
export function labelFlips(hiPct: number): boolean {
  return hiPct > 74;
}
