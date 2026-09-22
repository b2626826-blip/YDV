/**
 * 鞋底材料速查表的資料型別。
 *
 * 設計原則:所有「會被人改動的內容」都是純資料(data/*.ts),
 * 版面與渲染邏輯不含任何硬編碼的材料名稱或數值。
 */

/** 徽章色調 —— 對應 CSS 的 .chip 修飾類別。 */
export type Tone = 'plain' | 'accent' | 'good' | 'warn' | 'crit';

/** 帶色調的小標籤,可附一行註解(例如「聚酯型」)。 */
export interface Badge {
  readonly text: string;
  readonly sub?: string;
  readonly tone: Tone;
}

/** 數值儲存格:主值 + 可選的小字註解。 */
export interface Value {
  readonly text: string;
  readonly sub?: string;
}

// ---------------------------------------------------------------- 材料

export type MaterialCategory = '發泡' | '實心' | '兩者' | '基材' | '工程塑料';

export interface Material {
  readonly id: string;
  /** 表格顯示名稱(通常是英文縮寫)。 */
  readonly name: string;
  /** 中文全名或補充說明,顯示為小字。 */
  readonly fullName: string;
  readonly category: MaterialCategory;
  /** 硬度區間。發泡體用 Asker C,實心件用 Shore A/D —— 兩者不可換算。 */
  readonly hardness: Value;
  readonly density: Value;
  /** ISO 4649 磨耗體積 mm³,越低越耐磨。 */
  readonly abrasion: Value;
  readonly resilience: string;
  readonly compressionSet: Badge;
  /** 連續使用溫度區間 °C。 */
  readonly serviceTemp: string;
  readonly hydrolysis: Badge;
  readonly process: string;
  /** 樹脂相對料價,EVA = 1。不含加工與模具攤提。 */
  readonly costIndex: Value;
  readonly recyclable: Badge;
}

// ---------------------------------------------------------------- 工法

export interface Process {
  readonly id: string;
  readonly name: string;
  /** 英文全稱 / 俗稱,顯示為小字。 */
  readonly subtitle: string;
  readonly materials: string;
  /** 料溫或預熱條件,多行。 */
  readonly meltTemp: readonly Value[];
  readonly moldTemp: readonly Value[];
  readonly pressure: string;
  readonly cycle: readonly Value[];
  /** 模具設計補償值(收縮率或膨脹放大率)。 */
  readonly shrinkage: readonly Value[];
  /** 最容易出事的地方。 */
  readonly control: string;
}

// ---------------------------------------------------------------- 測試

export interface TestMethod {
  readonly id: string;
  readonly item: string;
  readonly standard: string;
  readonly condition: string;
  readonly unit: string;
  readonly requirement: string;
}

// ---------------------------------------------------------------- 選材

export interface PickCard {
  readonly id: string;
  readonly index: string;
  readonly title: string;
  readonly options: readonly PickOption[];
  /** 這個部位最常見的失敗模式。 */
  readonly failureMode: string;
}

export interface PickOption {
  readonly when: string;
  readonly use: string;
}

// ---------------------------------------------------------------- 圖表

export type AxisKind = 'linear' | 'log';

export interface Axis {
  readonly min: number;
  readonly max: number;
  readonly kind: AxisKind;
  /** 軸標題,顯示在左欄。 */
  readonly caption: string;
}

/** 刻度位置以「軸單位」表示,不是螢幕百分比。 */
export interface AxisTick {
  readonly at: number;
  readonly label: string;
  /** secondary 刻度畫在第二排,且不畫格線(例如 Shore D 的對照位置)。 */
  readonly row: 'primary' | 'secondary';
}

export type BarStyle = 'solid' | 'muted' | 'open';

export interface Bar {
  readonly label: string;
  /** 區間下界,軸單位。 */
  readonly lo: number;
  /** 區間上界,軸單位。 */
  readonly hi: number;
  /** 條旁顯示的文字。省略時自動用 `lo–hi`。 */
  readonly text?: string;
  /** open = 斜線條,表示超出該測試方法的適用範圍。 */
  readonly style?: BarStyle;
}

export interface BarChart {
  readonly id: string;
  readonly title: string;
  readonly caption: string;
  readonly axis: Axis;
  readonly ticks: readonly AxisTick[];
  readonly bars: readonly Bar[];
}
