import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import BirthForm from '../components/BirthForm';
import type { AnnualFortune, BaziResult, DeepSeekModel } from '../types/bazi';
import { fetchAiAnalysis } from '../services/ai_service';

interface TooltipParam {
  data: AnnualFortune & { value: number[] };
}

const dimensionCards = [
  { key: 'career', title: '事业前程' },
  { key: 'wealth', title: '财富运势' },
  { key: 'health', title: '健康状况' },
  { key: 'marriage', title: '姻缘感情' },
] as const;

const getGanZhiHtml = (value: string) =>
  value
    .split('')
    .map(
      (char) =>
        `<span style="display:inline-block;margin-right:2px;color:#e5e5e5;font-weight:700">${char}</span>`,
    )
    .join('');

const WuXingGlyph = ({ char, large = false }: { char: string; large?: boolean }) => {
  return (
    <span
      title={char}
      className={`inline font-semibold text-current ${large ? 'text-xl' : ''}`}
    >
      {char}
    </span>
  );
};

const GanZhiText = ({ value, large = false }: { value: string; large?: boolean }) => (
  <span className={`inline-flex items-baseline justify-center text-current ${large ? 'gap-1 text-xl' : 'gap-0.5'}`}>
    {value.split('').map((char, index) => (
      <WuXingGlyph key={`${value}-${char}-${index}`} char={char} large={large} />
    ))}
  </span>
);

const getChartOption = (fortunes: AnnualFortune[]) => ({
  backgroundColor: 'transparent',
  color: ['#f97316'],
  grid: { left: 42, right: 20, top: 34, bottom: 42 },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'line', lineStyle: { color: '#f97316' } },
    backgroundColor: '#171717',
    borderColor: '#3f3f46',
    textStyle: { color: '#e5e5e5' },
    formatter: (params: TooltipParam[]) => {
      const point = params[0].data;
      return `
        <div style="font-weight:700;margin-bottom:6px">${point.age}岁（${point.year}年 ${getGanZhiHtml(point.ganZhi)}）</div>
        <div>运势评分：<b style="color:#fb923c">${point.score}</b> / ${point.level}</div>
        <div>大运：${point.majorLuck === '交运前' ? point.majorLuck : getGanZhiHtml(point.majorLuck)}</div>
        <div>主象：${point.focus}</div>
        <div style="margin-top:6px;color:#a3a3a3;max-width:280px">${point.reasons.join('<br/>')}</div>
      `;
    },
  },
  xAxis: {
    type: 'value',
    name: '年龄',
    min: 1,
    max: 100,
    interval: 10,
    axisLine: { lineStyle: { color: '#525252' } },
    axisLabel: { color: '#a3a3a3' },
    splitLine: { show: false },
  },
  yAxis: {
    type: 'value',
    min: 20,
    max: 100,
    axisLine: { show: false },
    axisLabel: { color: '#a3a3a3' },
    splitLine: { lineStyle: { color: '#2f2f2f' } },
  },
  visualMap: {
    show: false,
    dimension: 1,
    pieces: [
      { lte: 49, color: '#ef4444' },
      { gt: 49, lte: 65, color: '#f59e0b' },
      { gt: 65, lte: 79, color: '#22c55e' },
      { gt: 79, color: '#38bdf8' },
    ],
  },
  series: [
    {
      name: '流年评分',
      type: 'line',
      smooth: true,
      showSymbol: false,
      symbolSize: 7,
      lineStyle: { width: 3 },
      areaStyle: { opacity: 0.16 },
      data: fortunes.map((item) => ({ ...item, value: [item.age, item.score] })),
      markLine: {
        silent: true,
        symbol: 'none',
        lineStyle: { color: '#525252', type: 'dashed' },
        label: { color: '#a3a3a3' },
        data: [{ yAxis: 60, name: '基准' }],
      },
    },
  ],
});

const Dashboard = () => {
  const [baziResult, setBaziResult] = useState<BaziResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeModel, setActiveModel] = useState<DeepSeekModel>('pro');

  const handleCalculated = async (result: BaziResult, model: DeepSeekModel) => {
    setActiveModel(model);
    setBaziResult(result);
    setIsAnalyzing(true);
    try {
      const aiRes = await fetchAiAnalysis(result, model);
      setBaziResult((prev) => (prev ? { ...prev, aiAnalysis: aiRes } : null));
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
      alert(`AI 分析出错：${message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const chartOption = useMemo(
    () => (baziResult ? getChartOption(baziResult.annualFortunes) : null),
    [baziResult],
  );

  const peakYears = useMemo(
    () =>
      baziResult
        ? [...baziResult.annualFortunes].sort((a, b) => b.score - a.score).slice(0, 4)
        : [],
    [baziResult],
  );

  const pressureYears = useMemo(
    () =>
      baziResult
        ? [...baziResult.annualFortunes].sort((a, b) => a.score - b.score).slice(0, 4)
        : [],
    [baziResult],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-neutral-900/90 rounded-xl p-6 shadow-xl border border-neutral-700/80">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-orange-400">输入生辰信息</h2>
              <p className="mt-1 text-xs text-neutral-500">排盘后会按所选 DeepSeek 模型生成断语</p>
            </div>
            <BirthForm onCalculated={handleCalculated} />
          </div>

          {baziResult && (
            <>
              <div className="bg-neutral-900/90 rounded-xl p-6 shadow-xl border border-neutral-700/80">
                <h2 className="text-lg font-semibold mb-4 text-orange-400">命盘概览</h2>
                <div className="text-sm text-neutral-300 space-y-2">
                  <p>
                    <span className="text-neutral-500">真太阳时：</span> {baziResult.solarTime}
                  </p>
                  <p>
                    <span className="text-neutral-500">农历时间：</span> {baziResult.lunarTime}
                  </p>
                  <p>
                    <span className="text-neutral-500">日元/生肖：</span> {baziResult.dayMaster} /{' '}
                    {baziResult.zodiac}
                  </p>
                  <p>
                    <span className="text-neutral-500">AI 模型：</span>{' '}
                    <span className="text-sky-300">{activeModel}</span>
                  </p>
                  <p>
                    <span className="text-neutral-500">本地旺衰：</span>{' '}
                    <span className="text-orange-300">{baziResult.localProfile.strength}</span>
                    <span className="ml-2 text-neutral-500">喜：</span>
                    {baziResult.localProfile.favorableElements.join('、')}
                  </p>

                  <div className="grid grid-cols-4 gap-2 pt-3 text-center">
                    {baziResult.tenGods.pillars.map((pillar, index) => (
                      <div
                        key={pillar.name}
                        className={`bg-neutral-950/80 p-2 rounded-lg border ${
                          index === 2 ? 'border-orange-800/80 shadow-[0_0_0_1px_rgba(249,115,22,0.18)]' : 'border-neutral-800'
                        }`}
                      >
                        <div className={`text-xs ${index === 2 ? 'text-orange-700' : 'text-neutral-500'}`}>
                          {pillar.name}
                        </div>
                        <div className="mt-2 flex justify-center">
                          <GanZhiText value={`${pillar.gan}${pillar.zhi}`} large />
                        </div>
                        <div className="text-xs text-neutral-500">{pillar.element}</div>
                        <div className="text-xs text-neutral-400 mt-1">{pillar.ganTenGod}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900/90 rounded-xl p-6 shadow-xl border border-neutral-700/80">
                <h2 className="text-lg font-semibold mb-4 text-orange-400">十神模块</h2>
                <p className="text-sm leading-relaxed text-neutral-300 mb-4">
                  {baziResult.tenGods.structureSummary}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {baziResult.tenGods.stats.slice(0, 6).map((stat) => (
                    <div key={stat.name} className="bg-neutral-950/80 rounded-lg border border-neutral-800 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-neutral-100">{stat.name}</span>
                        <span className="text-xs text-orange-300">{stat.count}</span>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">{stat.keywords}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  {baziResult.tenGods.pillars.map((pillar) => (
                    <div key={pillar.name} className="text-xs bg-neutral-950/70 rounded-lg border border-neutral-800/80 p-3.5">
                      <div className="flex justify-between gap-3 text-neutral-300">
                        <span className="inline-flex items-baseline gap-2">
                          <span className="text-neutral-100">{pillar.name}</span>
                          <span className="text-sm text-neutral-200">
                            <GanZhiText value={`${pillar.gan}${pillar.zhi}`} />
                          </span>
                        </span>
                        <span className="text-neutral-300">{pillar.diShi} · {pillar.naYin}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {pillar.hiddenStems.map((hidden) => (
                          <span
                            key={`${pillar.name}-${hidden.gan}-${hidden.weightLabel}`}
                            className="inline-flex items-baseline gap-1 rounded-md bg-neutral-900/70 px-2 py-1 text-neutral-400 ring-1 ring-neutral-800/80"
                          >
                            <span>{hidden.weightLabel}</span>
                            <span className="text-neutral-200">
                              <WuXingGlyph char={hidden.gan} />
                            </span>
                            <span>{hidden.element} · {hidden.tenGod}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {baziResult ? (
            <>
              <div className="bg-neutral-900/90 rounded-xl p-6 shadow-xl border border-neutral-700/80">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <h2 className="text-lg font-semibold text-orange-400">百年流年运势曲线</h2>
                  <div className="text-xs text-neutral-500">
                    基于大运、流年干支、喜忌五行、冲合关系生成 1-100 岁趋势
                  </div>
                </div>
                {chartOption && <ReactECharts option={chartOption} style={{ height: 340 }} notMerge />}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-neutral-950/80 rounded-lg border border-neutral-800 p-4">
                    <h3 className="text-sm font-bold text-sky-400 mb-3">顺势年份</h3>
                    <div className="space-y-2">
                      {peakYears.map((item) => (
                        <div key={`peak-${item.age}`} className="flex justify-between gap-3 text-sm">
                          <span className="inline-flex flex-wrap items-center gap-2 text-neutral-300">
                            {item.age}岁 · {item.year} <GanZhiText value={item.ganZhi} />
                          </span>
                          <span className="text-sky-300 font-semibold">{item.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-neutral-950/80 rounded-lg border border-neutral-800 p-4">
                    <h3 className="text-sm font-bold text-amber-400 mb-3">承压年份</h3>
                    <div className="space-y-2">
                      {pressureYears.map((item) => (
                        <div key={`pressure-${item.age}`} className="flex justify-between gap-3 text-sm">
                          <span className="inline-flex flex-wrap items-center gap-2 text-neutral-300">
                            {item.age}岁 · {item.year} <GanZhiText value={item.ganZhi} />
                          </span>
                          <span className="text-amber-300 font-semibold">{item.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900/90 rounded-xl p-6 shadow-xl border border-neutral-700/80">
                <h2 className="text-lg font-semibold mb-4 text-orange-400">大运排布</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-neutral-500">
                      <tr className="border-b border-neutral-700">
                        <th className="py-2 text-left">序</th>
                        <th className="py-2 text-left">年龄</th>
                        <th className="py-2 text-left">年份</th>
                        <th className="py-2 text-left">干支</th>
                        <th className="py-2 text-left">十神</th>
                      </tr>
                    </thead>
                    <tbody>
                      {baziResult.majorLuck.slice(0, 10).map((luck) => (
                        <tr key={`${luck.index}-${luck.ganZhi}`} className="border-b border-neutral-800">
                          <td className="py-2 text-neutral-400">
                            {luck.index === 0 ? '起运前' : `第${luck.index}步`}
                          </td>
                          <td className="py-2 text-neutral-300">
                            {luck.startAge}-{luck.endAge}岁
                          </td>
                          <td className="py-2 text-neutral-400">
                            {luck.startYear}-{luck.endYear}
                          </td>
                          <td className="py-2 font-semibold text-orange-300">
                            {luck.ganZhi === '交运前' ? '交运前' : <GanZhiText value={luck.ganZhi} />}
                          </td>
                          <td className="py-2 text-neutral-400">
                            {luck.ganTenGod} / {luck.zhiTenGod}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {isAnalyzing && !baziResult.aiAnalysis ? (
                <div className="bg-neutral-900/90 rounded-xl p-6 shadow-xl border border-neutral-700/80 min-h-[320px] flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4" />
                  <div className="text-neutral-400">AI 正在使用 {activeModel} 深度推演您的命盘，请稍候...</div>
                </div>
              ) : baziResult.aiAnalysis ? (
                <div className="bg-neutral-900/90 rounded-xl p-6 shadow-xl border border-neutral-700/80">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-orange-400">AI 命理断语</h2>
                      <div className="mt-1 text-xs text-neutral-500">模型：{activeModel}</div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="px-2 py-1 bg-green-900/30 text-green-500 rounded border border-green-900/50">
                        喜用：{baziResult.aiAnalysis.favorableElements}
                      </span>
                      <span className="px-2 py-1 bg-red-900/30 text-red-500 rounded border border-red-900/50">
                        忌神：{baziResult.aiAnalysis.unfavorableElements}
                      </span>
                    </div>
                  </div>

                  <div className="mb-5 p-4 bg-neutral-950/80 rounded-lg border-l-4 border-orange-500 text-sm leading-relaxed">
                    <div className="font-bold text-orange-500 mb-2">【{baziResult.aiAnalysis.pattern}】</div>
                    <p className="text-neutral-300">{baziResult.aiAnalysis.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    {[
                      ['日主旺衰', baziResult.aiAnalysis.dayMasterAnalysis],
                      ['十神取象', baziResult.aiAnalysis.tenGodAnalysis],
                      ['格局用神', baziResult.aiAnalysis.patternAnalysis],
                      ['大运流年', baziResult.aiAnalysis.luckAnalysis],
                    ].map(([title, content]) =>
                      content ? (
                        <div key={title} className="bg-neutral-950/80 p-4 rounded-lg border border-neutral-800">
                          <h3 className="font-bold text-orange-300 mb-2">{title}</h3>
                          <p className="text-sm text-neutral-400 leading-relaxed">{content}</p>
                        </div>
                      ) : null,
                    )}
                  </div>

                  {baziResult.aiAnalysis.annualAnalysis && (
                    <div className="mb-5 bg-neutral-950/80 p-4 rounded-lg border border-neutral-800">
                      <h3 className="font-bold text-orange-300 mb-2">流年提示</h3>
                      <p className="text-sm text-neutral-400 leading-relaxed">{baziResult.aiAnalysis.annualAnalysis}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dimensionCards.map((item) => {
                      const data = baziResult.aiAnalysis?.[item.key];
                      return data ? (
                        <div key={item.key} className="bg-neutral-950/80 p-4 rounded-lg border border-neutral-800">
                          <div className="flex justify-between items-center gap-3 mb-2">
                            <h3 className="font-bold text-orange-300">{item.title}</h3>
                            <span className="text-xl font-bold bg-neutral-800 px-2 rounded">
                              {data.score}
                              <span className="text-xs text-neutral-500"> 分</span>
                            </span>
                          </div>
                          <p className="text-sm text-neutral-400 leading-relaxed">{data.analysis}</p>
                        </div>
                      ) : null;
                    })}
                  </div>

                  {baziResult.aiAnalysis.advice && (
                    <div className="mt-5 p-4 rounded-lg bg-orange-950/20 border border-orange-900/40 text-sm leading-relaxed text-neutral-300">
                      {baziResult.aiAnalysis.advice}
                    </div>
                  )}
                </div>
              ) : null}
            </>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-neutral-700 rounded-xl text-neutral-500 min-h-[500px]">
              请在左侧输入生辰信息以生成排盘及流年分析
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
