"use client";

import { useState } from "react";
import { Brain, Key, MessageSquare, Filter, BarChart3, Save, FileText, AlertCircle, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

interface AIConfig {
  provider: "kimi-coding" | "openai" | "claude";
  apiKey: string;
  apiUrl: string;
  model: string;
  summaryEnabled: boolean;
  summaryLength: number;
  summaryPrompt: string;
  gradingEnabled: boolean;
  gradingPrompt: string;
  dedupEnabled: boolean;
  dedupMethod: "title" | "embedding";
  dedupThreshold: number;
  minGradeToInclude: "A" | "B" | "C" | "D";
}

const defaultConfig: AIConfig = {
  provider: "kimi-coding",
  apiKey: "",
  apiUrl: "https://api.kimi.com/coding/v1/messages",
  model: "kimi-k2.5",
  summaryEnabled: true,
  summaryLength: 100,
  summaryPrompt: `你是一个时尚品牌新闻分析师。请为以下新闻标题生成一段中文摘要，要求：
1. 字数控制在 {summaryLength} 字以内
2. 突出关键信息（财务数据、战略调整、供应链动态等）
3. 语言简洁专业

品牌: {brand}
标题: {title}
来源: {source}

摘要：`,
  gradingEnabled: true,
  gradingPrompt: `你是一个时尚品牌新闻分级专家。请评估以下新闻与{brand}品牌的相关性，给出A/B/C/D等级：

分级标准：
- **A（高度相关）**: {brand}的服装供应链、制造、可持续发展、核心业务战略
- **B（相关）**: 品牌动态、产品发布、合作伙伴关系、影响品牌的行业趋势
- **C（弱相关）**: 提及{brand}但关联度低（如明星穿该品牌、一般零售新闻）
- **D（不相关）**: 路过提及、无关内容

新闻标题: {title}
新闻摘要: {summary}
来源: {source}

请只返回一个字母等级（A/B/C/D），不要解释。`,
  dedupEnabled: true,
  dedupMethod: "title",
  dedupThreshold: 0.75,
  minGradeToInclude: "C",
};

export default function AIConfigPage() {
  const [config, setConfig] = useState<AIConfig>(defaultConfig);
  const [showSummaryPrompt, setShowSummaryPrompt] = useState(false);
  const [showGradingPrompt, setShowGradingPrompt] = useState(false);

  const updateConfig = <K extends keyof AIConfig>(key: K, value: AIConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">AI 配置</h1>
        <p className="text-zinc-500 mt-1">配置 Kimi API 和新闻处理参数</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Provider */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Brain className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900">AI 服务商</h2>
              <p className="text-sm text-zinc-500">Kimi Coding API 配置</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="provider"
                  checked={config.provider === "kimi-coding"}
                  onChange={() => updateConfig("provider", "kimi-coding")}
                  className="h-4 w-4 text-blue-600"
                />
                <div className="flex-1">
                  <p className="font-medium text-zinc-900">Kimi Coding</p>
                  <p className="text-sm text-zinc-500">推荐 · VSCode 插件同款 API</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  <Key className="inline h-4 w-4 mr-1" />
                  API Key
                </label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => updateConfig("apiKey", e.target.value)}
                  placeholder="sk-kimi-xxxxxxxx"
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  模型
                </label>
                <input
                  type="text"
                  value={config.model}
                  onChange={(e) => updateConfig("model", e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                API 端点
              </label>
              <input
                type="text"
                value={config.apiUrl}
                onChange={(e) => updateConfig("apiUrl", e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Summary Config */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900">摘要配置</h2>
              <p className="text-sm text-zinc-500">AI 生成中文摘要</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-700">启用 AI 摘要</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.summaryEnabled}
                  onChange={(e) => updateConfig("summaryEnabled", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  摘要长度（字）
                </label>
                <input
                  type="number"
                  value={config.summaryLength}
                  onChange={(e) => updateConfig("summaryLength", parseInt(e.target.value))}
                  min={50}
                  max={300}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  最小等级
                </label>
                <select
                  value={config.minGradeToInclude}
                  onChange={(e) => updateConfig("minGradeToInclude", e.target.value as "A" | "B" | "C" | "D")}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                >
                  <option value="A">A - 仅高度相关</option>
                  <option value="B">B - 相关及以上</option>
                  <option value="C">C - 弱相关及以上</option>
                  <option value="D">D - 全部</option>
                </select>
              </div>
            </div>

            {/* Editable Summary Prompt */}
            <div className="border border-zinc-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setShowSummaryPrompt(!showSummaryPrompt)}
                className="w-full px-4 py-3 bg-zinc-50 flex items-center justify-between hover:bg-zinc-100 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <FileText className="h-4 w-4" />
                  编辑摘要 Prompt
                </span>
                {showSummaryPrompt ? (
                  <ChevronUp className="h-4 w-4 text-zinc-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-zinc-500" />
                )}
              </button>
              {showSummaryPrompt && (
                <div className="p-4">
                  <textarea
                    value={config.summaryPrompt}
                    onChange={(e) => updateConfig("summaryPrompt", e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <p className="text-xs text-zinc-500 mt-2">
                    可用变量: {'{brand}'}, {'{title}'}, {'{source}'}, {'{summaryLength}'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deduplication */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Filter className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900">去重配置</h2>
              <p className="text-sm text-zinc-500">新闻去重策略</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-700">启用去重</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.dedupEnabled}
                  onChange={(e) => updateConfig("dedupEnabled", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                去重方法
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateConfig("dedupMethod", "title")}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    config.dedupMethod === "title"
                      ? "border-purple-500 bg-purple-50"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <p className="font-medium text-zinc-900">标题相似度</p>
                  <p className="text-xs text-zinc-500 mt-1">推荐 · 零成本 · 适合新闻</p>
                </button>
                <button
                  type="button"
                  onClick={() => updateConfig("dedupMethod", "embedding")}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    config.dedupMethod === "embedding"
                      ? "border-purple-500 bg-purple-50"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <p className="font-medium text-zinc-900">语义向量化</p>
                  <p className="text-xs text-zinc-500 mt-1">更准确 · 需要 Embedding API</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                相似度阈值: {config.dedupThreshold}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0.5"
                  max="0.95"
                  step="0.05"
                  value={config.dedupThreshold}
                  onChange={(e) => updateConfig("dedupThreshold", parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-zinc-900 w-12">{config.dedupThreshold}</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {config.dedupMethod === "title"
                  ? "建议 0.70-0.85，越大越严格"
                  : "建议 0.80-0.90，越大越严格"}
              </p>
            </div>

            {/* Info box */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">为什么推荐标题相似度？</p>
                  <p className="mt-1">
                    新闻标题通常高度相似（同一事件标题相似度&gt;80%），且处理10k篇文章时成本更低。
                    仅当需要检测"标题不同但内容相同"的改写新闻时才需要语义向量化。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grading */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900">自动分级</h2>
              <p className="text-sm text-zinc-500">AI 评估新闻相关度 ABCD</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-700">启用自动分级</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.gradingEnabled}
                  onChange={(e) => updateConfig("gradingEnabled", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-3">
                分级标准
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium w-8 text-center">A</span>
                  <span className="text-sm text-zinc-600">高度相关 - 供应链、制造、可持续发展</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium w-8 text-center">B</span>
                  <span className="text-sm text-zinc-600">相关 - 品牌动态、产品发布、行业趋势</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium w-8 text-center">C</span>
                  <span className="text-sm text-zinc-600">弱相关 - 提及品牌但关联度低</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded text-xs font-medium w-8 text-center">D</span>
                  <span className="text-sm text-zinc-600">不相关 - 过滤</span>
                </div>
              </div>
            </div>

            {/* Editable Grading Prompt */}
            <div className="border border-zinc-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setShowGradingPrompt(!showGradingPrompt)}
                className="w-full px-4 py-3 bg-zinc-50 flex items-center justify-between hover:bg-zinc-100 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <FileText className="h-4 w-4" />
                  编辑分级 Prompt
                </span>
                {showGradingPrompt ? (
                  <ChevronUp className="h-4 w-4 text-zinc-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-zinc-500" />
                )}
              </button>
              {showGradingPrompt && (
                <div className="p-4">
                  <textarea
                    value={config.gradingPrompt}
                    onChange={(e) => updateConfig("gradingPrompt", e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <p className="text-xs text-zinc-500 mt-2">
                    可用变量: {'{brand}'}, {'{title}'}, {'{summary}'}, {'{source}'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cost Estimate */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">成本估算</h3>
            <p className="text-sm text-blue-800 mt-1">
              使用 Kimi Coding 处理 10,000 篇新闻（摘要+分级）：
            </p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>• 输入 Token: ~¥5.12 (512 tokens/批次 × 1000批次)</li>
              <li>• 输出 Token: ~¥4.50 (摘要+分级)</li>
              <li>• <strong>总计: ~¥9.62/天</strong></li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              使用标题相似度去重可额外节省 Embedding API 费用 (~¥15/天)
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Save className="h-4 w-4" />
          保存配置
        </button>
      </div>
    </div>
  );
}
