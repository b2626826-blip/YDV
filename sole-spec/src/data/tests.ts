import type { TestMethod } from '../types.js';

/**
 * 測試方法與常見驗收門檻。
 * 規格書上的數字若沒附測試方法就無法比較 —— 同一支料用不同方法可差一倍。
 */
export const TESTS: readonly TestMethod[] = [
  {
    id: 'hardness-solid',
    item: '硬度(實心)',
    standard: 'ASTM D2240 / ISO 868',
    condition: 'Shore A 或 D,15 s 讀值',
    unit: '度',
    requirement: '±3 度公差',
  },
  {
    id: 'hardness-foam',
    item: '硬度(發泡)',
    standard: 'SRIS 0101 / JIS K7312',
    condition: 'Asker C,球形壓針',
    unit: '度',
    requirement: '±3 度公差',
  },
  {
    id: 'density',
    item: '密度',
    standard: 'ASTM D792 / ISO 2781',
    condition: '水中置換法',
    unit: 'g/cm³',
    requirement: '發泡體 ±0.02',
  },
  {
    id: 'abrasion',
    item: '耐磨',
    standard: 'ISO 4649(舊 DIN 53516)',
    condition: 'Method A,10 N,40 m',
    unit: 'mm³(越低越好)',
    requirement: '大底 ≤150,耐磨要求 ≤80',
  },
  {
    id: 'resilience',
    item: '回彈',
    standard: 'ASTM D2632 / ISO 4662',
    condition: '垂直落球或 Bashore',
    unit: '%',
    requirement: '中底 ≥50%',
  },
  {
    id: 'compression-set',
    item: '壓縮永久變形',
    standard: 'ASTM D395 B / SATRA TM64',
    condition: '50% 壓縮,70 °C × 22 h',
    unit: '%',
    requirement: '中底 ≤15%',
  },
  {
    id: 'peel',
    item: '底幫剝離',
    standard: 'SATRA TM410',
    condition: '90° 剝離',
    unit: 'kgf/cm 或 N/mm',
    requirement: '≥3.5 kgf/cm',
  },
  {
    id: 'flex',
    item: '耐彎折',
    standard: 'SATRA TM60(Bennewart)',
    condition: '常溫／−5 °C',
    unit: '次數 · 裂口 mm',
    requirement: '30,000–100,000 次無裂',
  },
  {
    id: 'hydrolysis',
    item: '水解',
    standard: 'SATRA TM344(Jungle Test)',
    condition: '70 °C / 95% RH,3–7 週',
    unit: '外觀 + 物性保持率',
    requirement: '無粉化、強度保持 ≥70%',
  },
  {
    id: 'yellowing',
    item: '耐黃變',
    standard: 'ISO 105-B02 / ASTM D1148',
    condition: 'UV 或氙燈照射',
    unit: 'Δb 值',
    requirement: '透明件 Δb ≤3',
  },
  {
    id: 'slip',
    item: '止滑',
    standard: 'SATRA TM144 / EN ISO 13287',
    condition: '陶瓷 + SLS 水膜／鋼板 + 甘油',
    unit: 'COF',
    requirement: '前掌 ≥0.32,後跟 ≥0.28',
  },
];
