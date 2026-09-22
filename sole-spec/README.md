# 鞋底材料規格對照表

資料驅動的單頁速查表:材料規格、硬度尺標、DIN 耐磨、工法加工參數、部位選材、測試標準。
改資料不用碰版面 —— 所有內容都在 `src/data/*.ts`,渲染邏輯不含任何硬編碼的材料名稱或數值。

## 使用

```bash
npm install
npm run build     # 產出 dist/
npm run check     # typecheck + test + build
```

`dist/index.html` 可直接用瀏覽器開啟;`dist/artifact.html` 是不含 doctype 的版本,
供 Claude Artifact 發佈使用(外殼由平台補上)。

## 結構

```
src/
├─ types.ts              所有資料型別。改欄位從這裡開始
├─ scale.ts              軸換算:Shore D→A、線性／對數投影、刻度對齊
├─ dom.ts                最小 DOM 建構工具(取代字串拼接)
├─ data/
│  ├─ materials.ts       材料規格總表
│  ├─ processes.ts       工法加工參數
│  ├─ tests.ts           測試方法與驗收門檻
│  ├─ charts.ts          三張條圖的軸、刻度與資料
│  └─ picks.ts           部位選材卡片
├─ render/
│  ├─ table.ts           三張表格
│  ├─ chart.ts           條圖
│  └─ picks.ts           選材卡片
├─ search.ts             全頁篩選(表格列 + 圖表條)
├─ main.ts               掛載進入點
├─ index.template.html   版面外殼與說明文字,含 slot-* 掛載點
└─ styles.css            設計 token 與元件樣式
```

## 常見改動

**改一筆材料數值** — 編輯 `src/data/materials.ts` 對應的物件,`npm run build`。

**加一種材料** — 在 `MATERIALS` 陣列加一筆。表格欄位由 `Material` 型別保證完整,漏填會在 `npm run typecheck` 擋下。

**加一條圖表資料** — 在 `src/data/charts.ts` 對應 `BarChart` 的 `bars` 加一筆。
測試會驗證它落在軸範圍內;超出範圍會讓 `npm test` 失敗,而不是默默被夾到邊緣。

**改軸範圍或刻度** — 同檔案的 `axis` 與 `ticks`。Shore D 的料用 `shoreDToA()` 換算位置,
用 `shoreDTick(d)` 產生第二排刻度。

**改版面文字或加一個區塊** — `src/index.template.html`。
新區塊若要放資料表,加一個 `<div id="slot-xxx">` 並在 `main.ts` 掛載。

## 注意事項

- **硬度有兩把尺**:發泡體是 Asker C,實心件是 Shore A/D,兩者不可互換。
  `shoreDToA()` 只是為了把 D 值畫到同一條軸上做視覺對照,不是規格換算。
- **耐磨數字越低越耐磨**(ISO 4649 磨耗體積 mm³),圖表用對數軸。
- 表格永遠包在 `.scroller` 裡橫向捲動,頁面本體不橫向捲動。
- 顏色一律走 CSS token。深色模式同時處理 `prefers-color-scheme` 與 `[data-theme]`,
  只在其中一處定義顏色會造成淺色文字配深色底的壞掉狀況。

## 資料來源與免責

數值為鞋材市場常見量產區間整理,供打樣與詢價前的方向判斷。
**不可作為驗收依據** —— 同一材料類別內不同料號差異可達 30% 以上,
請向供應商索取 TDS 與第三方測試報告,並以自家實測為準。
