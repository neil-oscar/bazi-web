import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { BirthFormData, BaziResult, DeepSeekModel } from '../types/bazi';
import { calculateBazi } from '../core/bazi_calc';
import { DEEPSEEK_MODELS } from '../services/ai_service';

interface Props {
  onCalculated: (result: BaziResult, model: DeepSeekModel) => void;
}

const BirthForm: React.FC<Props> = ({ onCalculated }) => {
  const [formData, setFormData] = useState<BirthFormData>({
    dateType: 'solar',
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    isLeapMonth: false,
    longitude: 116.4, // Default to Beijing
    gender: 'M',
  });
  const [aiModel, setAiModel] = useState<DeepSeekModel>('pro');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number | boolean = value;
    
    if (type === 'number') {
      parsedValue = parseFloat(value);
    } else if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleCalculate = () => {
    // Generate BaziResult from formData
    const result = calculateBazi(formData);
    onCalculated(result, aiModel);
  };

  return (
    <div className="flex flex-col gap-4 text-sm text-neutral-200">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label>性别</label>
          <select name="gender" value={formData.gender} onChange={handleChange} className="p-2 bg-neutral-900 border border-neutral-700 rounded focus:border-orange-500 focus:outline-none">
            <option value="M">男 (乾造)</option>
            <option value="F">女 (坤造)</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label>历法</label>
          <select name="dateType" value={formData.dateType} onChange={handleChange} className="p-2 bg-neutral-900 border border-neutral-700 rounded focus:border-orange-500 focus:outline-none">
            <option value="solar">公历 (阳历)</option>
            <option value="lunar">农历 (阴历)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <label>年</label>
          <input type="number" name="year" value={formData.year} onChange={handleChange} className="p-2 bg-neutral-900 border border-neutral-700 rounded focus:border-orange-500 focus:outline-none" />
        </div>
        <div className="flex flex-col gap-1">
          <label>月</label>
          <input type="number" name="month" min="1" max="12" value={formData.month} onChange={handleChange} className="p-2 bg-neutral-900 border border-neutral-700 rounded focus:border-orange-500 focus:outline-none" />
        </div>
        <div className="flex flex-col gap-1">
          <label>日</label>
          <input type="number" name="day" min="1" max="31" value={formData.day} onChange={handleChange} className="p-2 bg-neutral-900 border border-neutral-700 rounded focus:border-orange-500 focus:outline-none" />
        </div>
      </div>

      {formData.dateType === 'lunar' && (
        <div className="flex items-center gap-2">
          <input type="checkbox" name="isLeapMonth" id="isLeapMonth" checked={formData.isLeapMonth} onChange={handleChange} />
          <label htmlFor="isLeapMonth">是否闰月</label>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label>时 (0-23)</label>
          <input type="number" name="hour" min="0" max="23" value={formData.hour} onChange={handleChange} className="p-2 bg-neutral-900 border border-neutral-700 rounded focus:border-orange-500 focus:outline-none" />
        </div>
        <div className="flex flex-col gap-1">
          <label>分 (0-59)</label>
          <input type="number" name="minute" min="0" max="59" value={formData.minute} onChange={handleChange} className="p-2 bg-neutral-900 border border-neutral-700 rounded focus:border-orange-500 focus:outline-none" />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label>出生地经度 (用于真太阳时纠偏)</label>
        <div className="flex items-center gap-2">
          <input type="number" step="0.01" name="longitude" value={formData.longitude} onChange={handleChange} className="flex-1 p-2 bg-neutral-900 border border-neutral-700 rounded focus:border-orange-500 focus:outline-none" />
          <span className="text-xs text-neutral-400">度 (北京: 116.4)</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-neutral-700 bg-neutral-900/70 p-3">
        <label className="text-neutral-200">AI 推理模型</label>
        <select
          value={aiModel}
          onChange={(event) => setAiModel(event.target.value as DeepSeekModel)}
          className="p-2 bg-neutral-950 border border-neutral-700 rounded focus:border-orange-500 focus:outline-none"
        >
          {DEEPSEEK_MODELS.map((model) => (
            <option key={model.value} value={model.value}>
              {model.label}
            </option>
          ))}
        </select>
        <div className="text-xs leading-relaxed text-neutral-500">
          {DEEPSEEK_MODELS.find((model) => model.value === aiModel)?.description}
        </div>
      </div>

      <button 
        onClick={handleCalculate} 
        className="mt-4 inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 px-4 rounded transition-colors"
      >
        <Sparkles size={16} />
        排盘推演
      </button>
    </div>
  );
};

export default BirthForm;
