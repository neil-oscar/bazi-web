export interface DimensionAnalysis {
  score: number;
  analysis: string;
}

export interface AiAnalysisResult {
  pattern: string; // 格局，例如 "正印格"
  favorableElements: string; // 喜用神，例如 "水、木"
  unfavorableElements: string; // 忌神，例如 "土、金"
  summary: string; // 命局总评
  dayMasterAnalysis?: string; // 日主旺衰、调候、根气分析
  tenGodAnalysis?: string; // 十神结构与六亲取象
  patternAnalysis?: string; // 格局成败、用神相神分析
  luckAnalysis?: string; // 大运走势分析
  annualAnalysis?: string; // 近年流年分析
  advice?: string; // 综合建议
  career: DimensionAnalysis;
  wealth: DimensionAnalysis;
  health: DimensionAnalysis;
  marriage: DimensionAnalysis;
}

export type DeepSeekModel = 'pro' | 'flsh';

export interface HiddenStem {
  gan: string;
  element: string;
  tenGod: string;
  weight: number;
  weightLabel: string;
}

export interface PillarAnalysis {
  name: '年柱' | '月柱' | '日柱' | '时柱';
  gan: string;
  zhi: string;
  ganTenGod: string;
  hiddenStems: HiddenStem[];
  diShi: string;
  naYin: string;
  element: string;
}

export interface TenGodStat {
  name: string;
  count: number;
  keywords: string;
  summary: string;
}

export interface TenGodAnalysis {
  pillars: PillarAnalysis[];
  stats: TenGodStat[];
  dominant: string[];
  structureSummary: string;
}

export interface LocalProfile {
  strength: string;
  favorableElements: string[];
  unfavorableElements: string[];
  elementCounts: Record<string, number>;
  dominantElements: string[];
}

export interface MajorLuck {
  index: number;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  ganZhi: string;
  ganTenGod: string;
  zhiTenGod: string;
  direction: '顺行' | '逆行';
}

export interface AnnualFortune {
  age: number;
  year: number;
  ganZhi: string;
  majorLuck: string;
  score: number;
  level: string;
  focus: string;
  reasons: string[];
}

export interface BaziResult {
  solarTime: string; // The corrected true solar time
  lunarTime: string; // The corresponding lunar time
  baZi: string[]; // ['甲子', '丙寅', '戊辰', '庚申']
  elements: string[]; // ['木水', '火木', '土土', '金金']
  dayMaster: string; // '戊' (Day heavenly stem)
  zodiac: string; // '鼠'
  gender: 'M' | 'F';
  tenGods: TenGodAnalysis;
  localProfile: LocalProfile;
  majorLuck: MajorLuck[];
  annualFortunes: AnnualFortune[];
  aiAnalysis?: AiAnalysisResult; // 挂载 AI 返回的分析结果
}

export interface BirthFormData {
  dateType: 'solar' | 'lunar';
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  isLeapMonth?: boolean;
  longitude: number; // For true solar time
  gender: 'M' | 'F';
}
