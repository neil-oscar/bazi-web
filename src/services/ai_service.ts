import type { AiAnalysisResult, BaziResult, DeepSeekModel } from '../types/bazi';

type ApiModel = 'deepseek-v4-pro' | 'deepseek-v4-flash';

export const DEEPSEEK_MODELS: Array<{ value: DeepSeekModel; label: string; description: string }> = [
  {
    value: 'pro',
    label: 'DeepSeek Pro',
    description: '适合复杂格局与细致推演',
  },
  {
    value: 'flsh',
    label: 'DeepSeek Flsh',
    description: '响应更快，适合日常命理解读',
  },
];

const API_MODEL_BY_SELECTION: Record<DeepSeekModel, ApiModel> = {
  pro: 'deepseek-v4-pro',
  flsh: 'deepseek-v4-flash',
};

const resolveModel = (model?: string): { selectedModel: DeepSeekModel; apiModel: ApiModel } => {
  if (model === 'flsh') {
    return { selectedModel: 'flsh', apiModel: API_MODEL_BY_SELECTION.flsh };
  }

  return { selectedModel: 'pro', apiModel: API_MODEL_BY_SELECTION.pro };
};

const MOCK_AI_RESPONSE: AiAnalysisResult = {
  pattern: '正印格',
  favorableElements: '水、木',
  unfavorableElements: '金、土',
  summary:
    '此局以日主与月令为纲，印星能护身，食伤可泄秀，整体属于先重根气、再看调候的命式。命局有学习吸收、体系化表达与责任承担的优势，但五行偏处若被大运流年引动，容易出现压力集中、情绪内耗或财务节奏失衡。',
  dayMasterAnalysis:
    '日主先看月令得气，再看地支根气与天干帮扶。原局若印比能承托，则宜以食伤泄秀、财星成事；若遇官杀重叠，则需印星通关，避免压力直接克身。',
  tenGodAnalysis:
    '十神结构以印星、食伤和财官的互动为重点。印主资质与贵人，食伤主表达与技术输出，财星主资源与兑现，官杀主规则和职位压力。断事时应看大运是否让用神透出，忌神是否被制化。',
  patternAnalysis:
    '格局不宜只按单一十神定论，应兼看月令本气、透干清浊、地支会合刑冲。《子平真诠》重成格有情，用神有力则格局可用；若忌神杂透，需大运来清局。',
  luckAnalysis:
    '大运为十年环境，流年为当年触发。喜用运多利学习晋升、资源整合和稳定发展；忌神运则宜守正、控风险、减杠杆，并重视健康与关系沟通。',
  annualAnalysis:
    '近年可按流年天干看外在事件，地支看根基和关系变化。遇冲多主动调整，遇合多合作牵引；换运年前后尤其容易出现工作、居住、关系或角色转换。',
  advice:
    '事业宜走专业能力、管理协作或长期积累型路线；财富宜稳健配置，少做情绪化投机；健康以作息、脾胃、肝胆和压力管理为先。命理分析仅供文化研究参考。',
  career: {
    score: 78,
    analysis:
      '事业以印星资质和食伤输出为核心，适合专业服务、教育培训、咨询策划、技术产品、管理支持等需要持续学习和结构化表达的方向。若官杀被引动，职位责任会增加，宜用证照、流程和团队协作化解压力。',
  },
  wealth: {
    score: 70,
    analysis:
      '财星代表资源兑现，宜正财为主、偏财为辅。身弱时不宜财星过旺，否则容易形成财来压身；身旺时可借食伤生财，通过技能、产品和经营效率提升收入。投资宜分散与长期化。',
  },
  health: {
    score: 66,
    analysis:
      '健康重点看命局燥湿寒暖与五行偏枯。火土金偏旺时留意睡眠、脾胃、皮肤和呼吸系统；水木不足时注意肝胆舒展和情绪疏导。相关问题应以医学检查为准。',
  },
  marriage: {
    score: 68,
    analysis:
      '婚恋看日支夫妻宫及财官状态。官杀或财星受冲时，关系容易因工作压力、金钱观或沟通节奏起伏；若印星过旺，也需避免过度理性或回避表达。宜建立稳定沟通规则。',
  },
};

const compactBaziForPrompt = (bazi: BaziResult) => ({
  baZi: bazi.baZi,
  elements: bazi.elements,
  dayMaster: bazi.dayMaster,
  gender: bazi.gender === 'M' ? '男（乾造）' : '女（坤造）',
  solarTime: bazi.solarTime,
  lunarTime: bazi.lunarTime,
  localProfile: bazi.localProfile,
  tenGods: {
    pillars: bazi.tenGods.pillars.map((pillar) => ({
      name: pillar.name,
      gan: pillar.gan,
      zhi: pillar.zhi,
      ganTenGod: pillar.ganTenGod,
      hiddenStems: pillar.hiddenStems.map((hidden) => `${hidden.weightLabel}${hidden.gan}${hidden.tenGod}`),
      diShi: pillar.diShi,
      naYin: pillar.naYin,
    })),
    stats: bazi.tenGods.stats,
    structureSummary: bazi.tenGods.structureSummary,
  },
  majorLuck: bazi.majorLuck.slice(0, 10),
  keyAnnualFortunes: bazi.annualFortunes
    .filter((item) => item.score >= 82 || item.score <= 48)
    .slice(0, 16)
    .map((item) => ({
      age: item.age,
      year: item.year,
      ganZhi: item.ganZhi,
      majorLuck: item.majorLuck,
      score: item.score,
      reasons: item.reasons,
    })),
});

const extractJsonObject = (content: string) => {
  const cleaned = content.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('AI 响应中未找到 JSON 对象');
  }
  return cleaned.slice(start, end + 1);
};

export const fetchAiAnalysis = async (
  bazi: BaziResult,
  selectedModel?: DeepSeekModel,
): Promise<AiAnalysisResult> => {
  const apiKey = import.meta.env.VITE_AI_API_KEY;
  const apiUrl = import.meta.env.VITE_AI_API_URL || 'https://api.deepseek.com/v1/chat/completions';
  const envModel = import.meta.env.VITE_AI_MODEL as DeepSeekModel | undefined;
  const { selectedModel: model, apiModel } = resolveModel(selectedModel || envModel);

  const prompt = `
你是一位严谨的四柱八字命理分析师。请按传统子平法，以日主旺衰、月令、十神、藏干、调候、格局、大运流年为主线进行分析。

重要约束：
1. 命理分析仅作传统文化研究参考，不给极端、恐吓式断语。
2. 喜忌必须结合日主强弱、月令、五行寒暖燥湿、格局清浊来说明，不要只按缺什么补什么。
3. 十神断语要具体到正印/偏印、食神/伤官、正财/偏财、正官/七杀、比肩/劫财的组合关系。
4. 事业、财富、健康、婚恋必须各给出可执行建议，并说明风险触发条件。
5. 请直接输出合法 JSON，不要 markdown，不要额外文字。

[排盘数据]
${JSON.stringify(compactBaziForPrompt(bazi), null, 2)}

[用户选择模型]
${model}

[参考框架]
- 《滴天髓》：先论旺衰、得令得地得势，再论气势流通。
- 《穷通宝典》：先看调候，寒暖燥湿失衡时，调候用神优先。
- 《子平真诠》：格局以月令为纲，重用神、相神、忌神是否清纯有力。
- 《渊海子平》：十神对应六亲、人事、职业与性情取象。
- 大运为十年环境，流年为触发点；换运年和冲合刑害年需重点说明。

JSON 结构必须严格如下：
{
  "pattern": "格局名称",
  "favorableElements": "喜用神，例：水、木",
  "unfavorableElements": "忌神，例：金、土",
  "summary": "260-360字命局总评，说明日主、月令、调候、格局清浊",
  "dayMasterAnalysis": "220-320字，分析日主旺衰、根气、得令得地得势、寒暖燥湿",
  "tenGodAnalysis": "260-360字，分析四柱天干十神、地支藏干十神、主导十神、六亲和性格取象",
  "patternAnalysis": "220-320字，说明格局成败、用神相神、忌神和破格条件",
  "luckAnalysis": "260-380字，结合大运列表说明阶段走势，不要逐年罗列",
  "annualAnalysis": "220-320字，结合关键流年说明近年或重要年龄段的触发逻辑",
  "advice": "180-260字，给出事业、财务、关系、健康的综合建议",
  "career": { "score": 0到100数字, "analysis": "180-260字事业断语" },
  "wealth": { "score": 0到100数字, "analysis": "180-260字财富断语" },
  "health": { "score": 0到100数字, "analysis": "160-240字健康断语，提醒以医学诊断为准" },
  "marriage": { "score": 0到100数字, "analysis": "180-260字婚恋断语" }
}
`;

  if (!apiKey) {
    console.warn('未配置 VITE_AI_API_KEY，使用模拟数据进行演示。');
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_AI_RESPONSE), 900);
    });
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: apiModel,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              '你是专业的四柱八字排盘与命理分析程序。你必须输出合规 JSON，且保持中性、审慎、专业。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.55,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 请求失败: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('AI 响应为空');
    }

    return JSON.parse(extractJsonObject(content)) as AiAnalysisResult;
  } catch (error) {
    console.error('AI 分析获取失败', error);
    throw error;
  }
};
