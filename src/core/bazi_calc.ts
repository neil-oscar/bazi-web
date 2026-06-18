import {
  Solar,
  Lunar,
  type DaYunInstance,
  type EightCharInstance,
  type LiuNianInstance,
  type SolarInstance,
} from 'lunar-javascript';
import type {
  AnnualFortune,
  BirthFormData,
  BaziResult,
  HiddenStem,
  LocalProfile,
  MajorLuck,
  PillarAnalysis,
  TenGodAnalysis,
  TenGodStat,
} from '../types/bazi';

const ELEMENTS = ['木', '火', '土', '金', '水'];
const PILLAR_NAMES: PillarAnalysis['name'][] = ['年柱', '月柱', '日柱', '时柱'];

const GAN_ELEMENT: Record<string, string> = {
  甲: '木',
  乙: '木',
  丙: '火',
  丁: '火',
  戊: '土',
  己: '土',
  庚: '金',
  辛: '金',
  壬: '水',
  癸: '水',
};

const GAN_POLARITY: Record<string, '阳' | '阴'> = {
  甲: '阳',
  乙: '阴',
  丙: '阳',
  丁: '阴',
  戊: '阳',
  己: '阴',
  庚: '阳',
  辛: '阴',
  壬: '阳',
  癸: '阴',
};

const ZHI_ELEMENT: Record<string, string> = {
  子: '水',
  丑: '土',
  寅: '木',
  卯: '木',
  辰: '土',
  巳: '火',
  午: '火',
  未: '土',
  申: '金',
  酉: '金',
  戌: '土',
  亥: '水',
};

const HIDDEN_STEMS: Record<string, Array<{ gan: string; weight: number; weightLabel: string }>> = {
  子: [{ gan: '癸', weight: 0.6, weightLabel: '本气' }],
  丑: [
    { gan: '己', weight: 0.6, weightLabel: '本气' },
    { gan: '癸', weight: 0.3, weightLabel: '中气' },
    { gan: '辛', weight: 0.1, weightLabel: '余气' },
  ],
  寅: [
    { gan: '甲', weight: 0.6, weightLabel: '本气' },
    { gan: '丙', weight: 0.3, weightLabel: '中气' },
    { gan: '戊', weight: 0.1, weightLabel: '余气' },
  ],
  卯: [{ gan: '乙', weight: 0.6, weightLabel: '本气' }],
  辰: [
    { gan: '戊', weight: 0.6, weightLabel: '本气' },
    { gan: '乙', weight: 0.3, weightLabel: '中气' },
    { gan: '癸', weight: 0.1, weightLabel: '余气' },
  ],
  巳: [
    { gan: '丙', weight: 0.6, weightLabel: '本气' },
    { gan: '庚', weight: 0.3, weightLabel: '中气' },
    { gan: '戊', weight: 0.1, weightLabel: '余气' },
  ],
  午: [
    { gan: '丁', weight: 0.6, weightLabel: '本气' },
    { gan: '己', weight: 0.3, weightLabel: '中气' },
  ],
  未: [
    { gan: '己', weight: 0.6, weightLabel: '本气' },
    { gan: '丁', weight: 0.3, weightLabel: '中气' },
    { gan: '乙', weight: 0.1, weightLabel: '余气' },
  ],
  申: [
    { gan: '庚', weight: 0.6, weightLabel: '本气' },
    { gan: '壬', weight: 0.3, weightLabel: '中气' },
    { gan: '戊', weight: 0.1, weightLabel: '余气' },
  ],
  酉: [{ gan: '辛', weight: 0.6, weightLabel: '本气' }],
  戌: [
    { gan: '戊', weight: 0.6, weightLabel: '本气' },
    { gan: '辛', weight: 0.3, weightLabel: '中气' },
    { gan: '丁', weight: 0.1, weightLabel: '余气' },
  ],
  亥: [
    { gan: '壬', weight: 0.6, weightLabel: '本气' },
    { gan: '甲', weight: 0.3, weightLabel: '中气' },
  ],
};

const TEN_GOD_INFO: Record<string, { keywords: string; summary: string }> = {
  比肩: { keywords: '自我、同辈、竞争、承担', summary: '主独立、自尊、同辈缘，也代表竞争与自我坚持。' },
  劫财: { keywords: '行动、伙伴、争夺、破耗', summary: '主行动力和社交动员，也需防资源分散、冲动花费。' },
  食神: { keywords: '才华、表达、福气、稳定输出', summary: '主温和才艺、口福与产出，利专业沉淀和稳定创造。' },
  伤官: { keywords: '创意、表达、突破、规则张力', summary: '主才气外露、思辨突破，也易与制度或权威形成张力。' },
  偏财: { keywords: '机会、经营、人脉、流动财', summary: '主市场机会、资源整合和外财，也象征父缘及异性缘取象。' },
  正财: { keywords: '稳定收入、执行、责任、家庭', summary: '主务实经营、稳定收入和责任意识，重秩序与可兑现成果。' },
  七杀: { keywords: '压力、权柄、竞争、决断', summary: '主压力、危机和权柄，得制化则成魄力，失制则多焦灼。' },
  正官: { keywords: '规则、职位、名誉、约束', summary: '主秩序、职位、名誉与规范，喜清纯有印相生。' },
  偏印: { keywords: '悟性、偏门、研究、孤独', summary: '主洞察、研究与非标准路径，过旺则易多思或孤僻。' },
  正印: { keywords: '学业、贵人、保护、资质', summary: '主学业、贵人、资质和庇护，利证照、文教和体系内发展。' },
  日主: { keywords: '本人、核心、承载', summary: '日干为命局中心，其他十神均以日主为基准推导。' },
};

const CONFLICTS: Record<string, string> = {
  子: '午',
  丑: '未',
  寅: '申',
  卯: '酉',
  辰: '戌',
  巳: '亥',
  午: '子',
  未: '丑',
  申: '寅',
  酉: '卯',
  戌: '辰',
  亥: '巳',
};

const COMBINES: Record<string, string> = {
  子: '丑',
  丑: '子',
  寅: '亥',
  亥: '寅',
  卯: '戌',
  戌: '卯',
  辰: '酉',
  酉: '辰',
  巳: '申',
  申: '巳',
  午: '未',
  未: '午',
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const nextElement = (element: string) => ELEMENTS[(ELEMENTS.indexOf(element) + 1) % ELEMENTS.length];

const prevElement = (element: string) => ELEMENTS[(ELEMENTS.indexOf(element) + ELEMENTS.length - 1) % ELEMENTS.length];

const controlledBy = (element: string) => ELEMENTS[(ELEMENTS.indexOf(element) + 2) % ELEMENTS.length];

const controls = (element: string) => ELEMENTS[(ELEMENTS.indexOf(element) + 3) % ELEMENTS.length];

const getTenGod = (dayGan: string, targetGan: string) => {
  if (dayGan === targetGan) {
    return '比肩';
  }

  const dayElement = GAN_ELEMENT[dayGan];
  const targetElement = GAN_ELEMENT[targetGan];
  const samePolarity = GAN_POLARITY[dayGan] === GAN_POLARITY[targetGan];

  if (dayElement === targetElement) {
    return samePolarity ? '比肩' : '劫财';
  }

  if (prevElement(dayElement) === targetElement) {
    return samePolarity ? '偏印' : '正印';
  }

  if (nextElement(dayElement) === targetElement) {
    return samePolarity ? '食神' : '伤官';
  }

  if (controlledBy(dayElement) === targetElement) {
    return samePolarity ? '七杀' : '正官';
  }

  if (controls(dayElement) === targetElement) {
    return samePolarity ? '偏财' : '正财';
  }

  return '未知';
};

const getHiddenStems = (dayGan: string, zhi: string): HiddenStem[] =>
  (HIDDEN_STEMS[zhi] || []).map((item) => ({
    ...item,
    element: GAN_ELEMENT[item.gan],
    tenGod: getTenGod(dayGan, item.gan),
  }));

const getElementCounts = (baZi: string[]) => {
  const counts: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  baZi.forEach((pillar) => {
    const [gan, zhi] = pillar.split('');
    counts[GAN_ELEMENT[gan]] += 1;
    counts[ZHI_ELEMENT[zhi]] += 0.8;
    getHiddenStems(gan, zhi).forEach((hidden) => {
      counts[hidden.element] += hidden.weight;
    });
  });
  return counts;
};

const buildLocalProfile = (baZi: string[], dayGan: string): LocalProfile => {
  const counts = getElementCounts(baZi);
  const dayElement = GAN_ELEMENT[dayGan];
  const resourceElement = prevElement(dayElement);
  const supportScore = counts[dayElement] + counts[resourceElement] * 0.85;
  const drainScore =
    counts[nextElement(dayElement)] * 0.75 +
    counts[controls(dayElement)] * 0.85 +
    counts[controlledBy(dayElement)] * 0.9;
  const ratio = supportScore / Math.max(drainScore, 0.1);
  const strength = ratio >= 1.45 ? '身旺' : ratio >= 1.1 ? '身偏旺' : ratio >= 0.82 ? '中和' : '身弱';
  const favorableElements =
    strength === '身弱'
      ? [resourceElement, dayElement]
      : strength === '中和'
        ? [nextElement(dayElement), controls(dayElement)]
        : [nextElement(dayElement), controls(dayElement), controlledBy(dayElement)];
  const unfavorableElements = ELEMENTS.filter((element) => !favorableElements.includes(element));
  const dominantElements = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([element]) => element);

  return {
    strength,
    favorableElements,
    unfavorableElements,
    elementCounts: Object.fromEntries(
      Object.entries(counts).map(([element, count]) => [element, Number(count.toFixed(1))]),
    ),
    dominantElements,
  };
};

const buildPillars = (baZiObj: EightCharInstance, baZi: string[]): PillarAnalysis[] => {
  const hiddenGanGetters = [
    () => baZiObj.getYearHideGan(),
    () => baZiObj.getMonthHideGan(),
    () => baZiObj.getDayHideGan(),
    () => baZiObj.getTimeHideGan(),
  ];
  const tenGodGanGetters = [
    () => baZiObj.getYearShiShenGan(),
    () => baZiObj.getMonthShiShenGan(),
    () => baZiObj.getDayShiShenGan(),
    () => baZiObj.getTimeShiShenGan(),
  ];
  const diShiGetters = [
    () => baZiObj.getYearDiShi(),
    () => baZiObj.getMonthDiShi(),
    () => baZiObj.getDayDiShi(),
    () => baZiObj.getTimeDiShi(),
  ];
  const naYinGetters = [
    () => baZiObj.getYearNaYin(),
    () => baZiObj.getMonthNaYin(),
    () => baZiObj.getDayNaYin(),
    () => baZiObj.getTimeNaYin(),
  ];
  const dayGan = baZi[2][0];

  return baZi.map((pillar, index) => {
    const [gan, zhi] = pillar.split('');
    const libHiddenGans = String(hiddenGanGetters[index]()).split(',').filter(Boolean);
    const hiddenStems = (HIDDEN_STEMS[zhi] || [])
      .filter((item) => libHiddenGans.length === 0 || libHiddenGans.includes(item.gan))
      .map((item) => ({
        ...item,
        element: GAN_ELEMENT[item.gan],
        tenGod: getTenGod(dayGan, item.gan),
      }));

    return {
      name: PILLAR_NAMES[index],
      gan,
      zhi,
      ganTenGod: tenGodGanGetters[index](),
      hiddenStems,
      diShi: diShiGetters[index](),
      naYin: naYinGetters[index](),
      element: `${GAN_ELEMENT[gan]}${ZHI_ELEMENT[zhi]}`,
    };
  });
};

const buildTenGodAnalysis = (pillars: PillarAnalysis[], profile: LocalProfile): TenGodAnalysis => {
  const counter = new Map<string, number>();
  pillars.forEach((pillar) => {
    counter.set(pillar.ganTenGod, (counter.get(pillar.ganTenGod) || 0) + 1);
    pillar.hiddenStems.forEach((hidden) => {
      counter.set(hidden.tenGod, (counter.get(hidden.tenGod) || 0) + hidden.weight);
    });
  });

  const stats: TenGodStat[] = Array.from(counter.entries())
    .filter(([name]) => name !== '日主')
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      count: Number(count.toFixed(1)),
      keywords: TEN_GOD_INFO[name]?.keywords || '',
      summary: TEN_GOD_INFO[name]?.summary || '',
    }));
  const dominant = stats.slice(0, 3).map((item) => item.name);
  const structureSummary = `命局十神以${dominant.join('、')}较显，日主本地评估为${profile.strength}。喜用倾向取${profile.favorableElements.join('、')}，忌${profile.unfavorableElements.join('、')}过旺，断事需结合月令、格局和大运引动。`;

  return {
    pillars,
    stats,
    dominant,
    structureSummary,
  };
};

const zhiMainGan = (zhi: string) => HIDDEN_STEMS[zhi]?.[0]?.gan || '';

const describeFocus = (ganTenGod: string) => {
  if (['正官', '七杀'].includes(ganTenGod)) return '事业规则';
  if (['正财', '偏财'].includes(ganTenGod)) return '财富资源';
  if (['正印', '偏印'].includes(ganTenGod)) return '学业贵人';
  if (['食神', '伤官'].includes(ganTenGod)) return '表达产出';
  if (['比肩', '劫财'].includes(ganTenGod)) return '人际竞争';
  return '综合变化';
};

const scoreGanZhi = (
  ganZhi: string,
  majorLuck: string,
  natalZhi: string[],
  profile: LocalProfile,
  dayGan: string,
) => {
  const [gan, zhi] = ganZhi.split('');
  const ganTenGod = getTenGod(dayGan, gan);
  const zhiGan = zhiMainGan(zhi);
  const zhiTenGod = zhiGan ? getTenGod(dayGan, zhiGan) : '';
  const ganElement = GAN_ELEMENT[gan];
  const zhiElement = ZHI_ELEMENT[zhi];
  const reasons: string[] = [];
  let score = 60;

  if (profile.favorableElements.includes(ganElement)) {
    score += 8;
    reasons.push(`流年天干${gan}属${ganElement}，合本局喜用`);
  } else if (profile.unfavorableElements.includes(ganElement)) {
    score -= 5;
    reasons.push(`流年天干${gan}属${ganElement}，需防忌神偏旺`);
  }

  if (profile.favorableElements.includes(zhiElement)) {
    score += 6;
  } else if (profile.unfavorableElements.includes(zhiElement)) {
    score -= 4;
  }

  if (majorLuck) {
    const [luckGan, luckZhi] = majorLuck.split('');
    if (profile.favorableElements.includes(GAN_ELEMENT[luckGan])) score += 4;
    if (profile.favorableElements.includes(ZHI_ELEMENT[luckZhi])) score += 3;
  }

  natalZhi.forEach((item) => {
    if (CONFLICTS[zhi] === item) {
      score -= 8;
      reasons.push(`流年${zhi}冲原局${item}，易有变动、迁移或关系波动`);
    }
    if (COMBINES[zhi] === item) {
      score += 4;
      reasons.push(`流年${zhi}合原局${item}，有合作、缓和或资源牵引`);
    }
  });

  if (profile.strength === '身弱' && ['正印', '偏印', '比肩', '劫财'].includes(ganTenGod)) score += 5;
  if (profile.strength !== '身弱' && ['食神', '伤官', '正财', '偏财', '正官'].includes(ganTenGod)) score += 4;
  if (profile.strength === '身弱' && ['正财', '偏财', '七杀'].includes(ganTenGod)) score -= 5;
  if (profile.strength.includes('旺') && ['正印', '偏印', '比肩', '劫财'].includes(ganTenGod)) score -= 4;

  reasons.unshift(`流年主象为${ganTenGod}${zhiTenGod ? `，地支本气见${zhiTenGod}` : ''}`);

  return {
    score: clamp(Math.round(score), 25, 95),
    focus: describeFocus(ganTenGod),
    reasons: reasons.slice(0, 3),
  };
};

const buildLuck = (baZiObj: EightCharInstance, data: BirthFormData, baZi: string[], profile: LocalProfile) => {
  const dayGan = baZi[2][0];
  const natalZhi = baZi.map((pillar) => pillar[1]);
  const yun = baZiObj.getYun(data.gender === 'M' ? 1 : 0, 1);
  const direction: MajorLuck['direction'] = yun.isForward() ? '顺行' : '逆行';
  const daYun = yun.getDaYun(12);
  const majorLuck: MajorLuck[] = daYun.map((item: DaYunInstance) => {
    const ganZhi = item.getGanZhi();
    const [gan, zhi] = ganZhi ? ganZhi.split('') : ['', ''];
    const zhiGan = zhi ? zhiMainGan(zhi) : '';
    return {
      index: item.getIndex(),
      startAge: item.getStartAge(),
      endAge: item.getEndAge(),
      startYear: item.getStartYear(),
      endYear: item.getEndYear(),
      ganZhi: ganZhi || '交运前',
      ganTenGod: gan ? getTenGod(dayGan, gan) : '小运',
      zhiTenGod: zhiGan ? getTenGod(dayGan, zhiGan) : '小运',
      direction,
    };
  });
  const annualFortunes: AnnualFortune[] = [];

  daYun.forEach((item: DaYunInstance) => {
    item.getLiuNian().forEach((liuNian: LiuNianInstance) => {
      const age = liuNian.getAge();
      if (age < 1 || age > 100) return;
      const ganZhi = liuNian.getGanZhi();
      const luckGanZhi = item.getGanZhi();
      const scored = scoreGanZhi(ganZhi, luckGanZhi, natalZhi, profile, dayGan);
      annualFortunes.push({
        age,
        year: liuNian.getYear(),
        ganZhi,
        majorLuck: luckGanZhi || '交运前',
        score: scored.score,
        level: scored.score >= 80 ? '顺势' : scored.score >= 66 ? '平稳' : scored.score >= 50 ? '承压' : '波动',
        focus: scored.focus,
        reasons: scored.reasons,
      });
    });
  });

  annualFortunes.sort((a, b) => a.age - b.age);

  return {
    majorLuck,
    annualFortunes: annualFortunes.slice(0, 100),
  };
};

export const calculateBazi = (data: BirthFormData): BaziResult => {
  let solar: SolarInstance;

  if (data.dateType === 'lunar') {
    const lunar = Lunar.fromYmdHms(data.year, data.month, data.day, data.hour, data.minute, 0);
    solar = lunar.getSolar();
  } else {
    solar = Solar.fromYmdHms(data.year, data.month, data.day, data.hour, data.minute, 0);
  }

  const timeOffsetMinutes = (data.longitude - 120) * 4;
  const jsDate = new Date(
    solar.getYear(),
    solar.getMonth() - 1,
    solar.getDay(),
    solar.getHour(),
    solar.getMinute() + timeOffsetMinutes,
    0,
  );

  const correctedSolar = Solar.fromYmdHms(
    jsDate.getFullYear(),
    jsDate.getMonth() + 1,
    jsDate.getDate(),
    jsDate.getHours(),
    jsDate.getMinutes(),
    0,
  );

  const lunar = correctedSolar.getLunar();
  const baZiObj = lunar.getEightChar();
  baZiObj.setSect(data.gender === 'M' ? 1 : 0);

  const baZi = [baZiObj.getYear(), baZiObj.getMonth(), baZiObj.getDay(), baZiObj.getTime()];
  const elements = [
    baZiObj.getYearWuXing(),
    baZiObj.getMonthWuXing(),
    baZiObj.getDayWuXing(),
    baZiObj.getTimeWuXing(),
  ];
  const dayMaster = baZiObj.getDayGan();
  const localProfile = buildLocalProfile(baZi, dayMaster);
  const pillars = buildPillars(baZiObj, baZi);
  const tenGods = buildTenGodAnalysis(pillars, localProfile);
  const { majorLuck, annualFortunes } = buildLuck(baZiObj, data, baZi, localProfile);

  return {
    solarTime: `${correctedSolar.getYear()}-${correctedSolar.getMonth()}-${correctedSolar.getDay()} ${String(correctedSolar.getHour()).padStart(2, '0')}:${String(correctedSolar.getMinute()).padStart(2, '0')}`,
    lunarTime: `${lunar.getYear()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${lunar.getTimeZhi()}时`,
    baZi,
    elements,
    dayMaster,
    zodiac: lunar.getYearShengXiao(),
    gender: data.gender,
    tenGods,
    localProfile,
    majorLuck,
    annualFortunes,
  };
};
