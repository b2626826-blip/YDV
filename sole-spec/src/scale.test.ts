import { test } from 'node:test';
import assert from 'node:assert/strict';
import { labelFlips, projector, shoreDToA, tickTransform } from './scale.js';
import { ABRASION, FOAM_HARDNESS, SOLID_HARDNESS } from './data/charts.js';
import type { BarChart } from './types.js';

test('Shore D 換算落在 ASTM D2240 的重疊區經驗值上', () => {
  assert.equal(Math.round(shoreDToA(45)), 94); // A95 ≈ D45
  assert.equal(Math.round(shoreDToA(40)), 89); // A90 ≈ D40
});

test('線性軸把兩端對到 0% 與 100%', () => {
  const p = projector({ min: 25, max: 80, kind: 'linear', caption: '' });
  assert.equal(p(25), 0);
  assert.equal(p(80), 100);
  assert.equal(p(52.5), 50);
});

test('對數軸讓等倍率的區間佔等寬', () => {
  const p = projector({ min: 20, max: 800, kind: 'log', caption: '' });
  const decade1 = p(80) - p(20);
  const decade2 = p(320) - p(80);
  assert.ok(Math.abs(decade1 - decade2) < 1e-9, '相同倍率應佔相同寬度');
});

test('超出軸範圍的值被夾住,不會溢出軌道', () => {
  const p = projector({ min: 0, max: 100, kind: 'linear', caption: '' });
  assert.equal(p(-20), 0);
  assert.equal(p(140), 100);
});

test('對數軸拒絕非正數下界', () => {
  assert.throws(() => projector({ min: 0, max: 100, kind: 'log', caption: '' }), RangeError);
});

test('貼邊刻度改用靠邊對齊', () => {
  assert.equal(tickTransform(0), 'translateX(0)');
  assert.equal(tickTransform(100), 'translateX(-100%)');
  assert.equal(tickTransform(50), 'translateX(-50%)');
});

test('條的右端過半後標籤翻到左側', () => {
  assert.equal(labelFlips(90), true);
  assert.equal(labelFlips(40), false);
});

const CHARTS: readonly BarChart[] = [FOAM_HARDNESS, SOLID_HARDNESS, ABRASION];

test('每張圖的資料都落在自己的軸範圍內', () => {
  for (const chart of CHARTS) {
    for (const bar of chart.bars) {
      assert.ok(bar.lo < bar.hi, `${chart.id} / ${bar.label}: lo 應小於 hi`);
      assert.ok(bar.lo >= chart.axis.min, `${chart.id} / ${bar.label}: lo 低於軸下界`);
      assert.ok(bar.hi <= chart.axis.max, `${chart.id} / ${bar.label}: hi 超出軸上界`);
    }
    for (const t of chart.ticks) {
      assert.ok(
        t.at >= chart.axis.min && t.at <= chart.axis.max,
        `${chart.id} / ${t.label}: 刻度超出軸範圍`,
      );
    }
  }
});
