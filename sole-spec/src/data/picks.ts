import type { PickCard } from '../types.js';

/** 以功能需求反推材料與工法,附該部位最常見的失敗模式。 */
export const PICKS: readonly PickCard[] = [
  {
    id: 'outsole',
    index: '01',
    title: '大底耐磨層',
    options: [
      { when: '濕滑地面優先', use: 'Rubber A60–70 碳素膠,前掌可換黏膠' },
      { when: '乾地耐磨／透明', use: 'TPU A90–D55 射出' },
      { when: '長期不黃變透明', use: 'aTPU' },
      { when: '成本優先', use: 'TPE-S 或 EVA 大底(耐磨犧牲)' },
    ],
    failureMode: '橡膠打粗不足 → 剝離強度 <3.5 kgf/cm',
  },
  {
    id: 'midsole',
    index: '02',
    title: '中底本體',
    options: [
      { when: '平價／拖鞋', use: 'IM EVA C55–70' },
      { when: '主流跑鞋', use: 'CM EVA(Phylon)C45–60' },
      { when: '中高階緩震', use: 'SCF EVA 或 E-TPU 珠粒' },
      { when: '競速', use: 'PEBA 發泡 0.10–0.15 g/cm³,回彈 85%+' },
      { when: '耐久／工作鞋', use: 'PU DIP(不塌但重)' },
    ],
    failureMode: 'EVA compression set 10–20%,半年塌陷',
  },
  {
    id: 'shank',
    index: '03',
    title: '穩定片與抗扭桿',
    options: [
      { when: '一般支撐', use: 'TPU D55–70' },
      { when: '高抗疲勞／耐溫', use: 'TPEE D50–63' },
      { when: '極高剛性', use: 'PA6 + GF30、PA12 + CF' },
    ],
    failureMode: 'GF 配向造成翹曲;PA 吸濕後尺寸長 0.3–0.5%',
  },
  {
    id: 'plate',
    index: '04',
    title: '釘鞋板／碳板',
    options: [
      { when: '金屬釘座板', use: 'PA11/12 + GF 或 CF' },
      { when: '彈性板片', use: '碳纖預浸布,以 PEBA 或 TPU 包覆貼合' },
    ],
    failureMode: '板片與中底剝離,需專用 primer 與粗化',
  },
  {
    id: 'soft',
    index: '05',
    title: '軟觸感件・室內底',
    options: [
      { when: '軟觸感／防滑塊', use: 'TPE-S A40–70' },
      { when: '耐候軟件', use: 'SEBS 配方(可做到 A5)' },
    ],
    failureMode: '白油析出造成表面發油、標籤脫落;黏著性差需共射',
  },
  {
    id: 'clear',
    index: '06',
    title: '透明與外觀件',
    options: [
      { when: '透明大底', use: 'TPU(短期)／aTPU(長期不黃)' },
      { when: '無縫貼合膜', use: 'TPU 熱熔膜、aTPU 押出膜' },
    ],
    failureMode: '芳香族 TPU 經 UV 6 個月即明顯黃化(Δb >3)',
  },
];
