"use client";

import { useState, useEffect } from "react";
import { X, Globe, Monitor } from "lucide-react";

interface Source {
  id: string;
  name: string;
  type: "rss" | "playwright";
  urlTemplate: string;
  region: string;
  enabled: boolean;
  rateLimit?: string;
  proxyType?: "socks5" | "http" | "none";
  proxyServer?: string;
  timeout?: number;
  jsWaitTime?: number;
  maxArticles?: number;
  selectors?: {
    articleLink?: string;
    title?: string;
    source?: string;
    time?: string;
  };
}

interface SourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (source: Omit<Source, "id">) => void;
  initialData?: Source;
}

const defaultValues: Omit<Source, "id"> = {
  name: "",
  type: "rss",
  urlTemplate: "",
  region: "US",
  enabled: true,
  rateLimit: "1s",
  proxyType: "none",
  proxyServer: "",
  timeout: 60000,
  jsWaitTime: 2000,
  maxArticles: 10,
  selectors: {
    articleLink: "a[href^='./read/']",
    title: "",
    source: "",
    time: "time",
  },
};

export default function SourceModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: SourceModalProps) {
  const [formData, setFormData] = useState<Omit<Source, "id">>(defaultValues);
  // Top-level tab: source type
  const [activeType, setActiveType] = useState<"rss" | "playwright">("rss");
  // Second-level tab: basic / advanced
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic");

  useEffect(() => {
    if (initialData) {
      setActiveType(initialData.type);
      setFormData({
        name: initialData.name,
        type: initialData.type,
        urlTemplate: initialData.urlTemplate,
        region: initialData.region,
        enabled: initialData.enabled,
        rateLimit: initialData.rateLimit || "1s",
        proxyType: initialData.proxyType || "none",
        proxyServer: initialData.proxyServer || "",
        timeout: initialData.timeout || 60000,
        jsWaitTime: initialData.jsWaitTime || 2000,
        maxArticles: initialData.maxArticles || 10,
        selectors: initialData.selectors || defaultValues.selectors,
      });
    } else {
      setActiveType("rss");
      setFormData(defaultValues);
    }
  }, [initialData, isOpen]);

  // Update form type when top-level tab changes
  const handleTypeChange = (type: "rss" | "playwright") => {
    setActiveType(type);
    setFormData((prev) => ({ ...prev, type }));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof Omit<Source, "id" | "selectors">, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateSelector = (field: "articleLink" | "title" | "source" | "time", value: string) => {
    setFormData((prev) => ({
      ...prev,
      selectors: { ...prev.selectors, [field]: value },
    }));
  };

  const isPlaywright = activeType === "playwright";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                isPlaywright ? "bg-purple-50" : "bg-blue-50"
              }`}
            >
              {isPlaywright ? (
                <Monitor className="h-5 w-5 text-purple-600" />
              ) : (
                <Globe className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                {initialData ? "编辑抓取源" : "新增抓取源"}
              </h2>
              <p className="text-sm text-zinc-500">
                {isPlaywright ? "浏览器自动化抓取" : "RSS 订阅源"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Type Selector Tabs - TOP LEVEL */}
        <div className="px-6 border-b border-zinc-200">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleTypeChange("rss")}
              className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeType === "rss"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <Globe className="h-4 w-4" />
              RSS 源
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("playwright")}
              className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeType === "playwright"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <Monitor className="h-4 w-4" />
              浏览器抓取
            </button>
          </div>
        </div>

        {/* Secondary Tabs - BASIC / ADVANCED */}
        <div className="px-6 border-b border-zinc-200 bg-zinc-50">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              className={`py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "basic"
                  ? isPlaywright
                    ? "border-purple-600 text-purple-600"
                    : "border-blue-600 text-blue-600"
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
            >
              基础配置
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("advanced")}
              className={`py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "advanced"
                  ? isPlaywright
                    ? "border-purple-600 text-purple-600"
                    : "border-blue-600 text-blue-600"
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
            >
              代理配置
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {activeTab === "basic" ? (
              <>
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    源名称
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder={isPlaywright ? "Google News (Playwright)" : "Google News RSS"}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* URL Template */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    URL 模板
                    <span className="text-zinc-400 font-normal ml-1">
                      (使用 {"{keyword}"} 作为关键词占位符)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.urlTemplate}
                    onChange={(e) => updateField("urlTemplate", e.target.value)}
                    placeholder={
                      isPlaywright
                        ? "https://news.google.com/search?q={keyword}&hl=en-US"
                        : "https://news.google.com/rss/search?q={keyword}"
                    }
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    required
                  />
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    区域 / 语言
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => updateField("region", e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="US">美国 (US)</option>
                    <option value="UK">英国 (UK)</option>
                    <option value="FR">法国 (FR)</option>
                    <option value="DE">德国 (DE)</option>
                    <option value="JP">日本 (JP)</option>
                    <option value="CN">中国 (CN)</option>
                  </select>
                </div>

                {/* RSS Basic Config */}
                {!isPlaywright && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        请求间隔
                      </label>
                      <select
                        value={formData.rateLimit}
                        onChange={(e) => updateField("rateLimit", e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="0.5s">0.5 秒</option>
                        <option value="1s">1 秒</option>
                        <option value="2s">2 秒</option>
                        <option value="5s">5 秒</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        抓取条数
                      </label>
                      <input
                        type="number"
                        value={formData.maxArticles}
                        onChange={(e) => updateField("maxArticles", parseInt(e.target.value))}
                        min={1}
                        max={100}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Playwright Basic Config */}
                {isPlaywright && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        超时时间 (ms)
                      </label>
                      <input
                        type="number"
                        value={formData.timeout}
                        onChange={(e) => updateField("timeout", parseInt(e.target.value))}
                        min={5000}
                        step={1000}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        JS 等待 (ms)
                      </label>
                      <input
                        type="number"
                        value={formData.jsWaitTime}
                        onChange={(e) => updateField("jsWaitTime", parseInt(e.target.value))}
                        min={0}
                        step={500}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        最大文章数
                      </label>
                      <input
                        type="number"
                        value={formData.maxArticles}
                        onChange={(e) => updateField("maxArticles", parseInt(e.target.value))}
                        min={1}
                        max={50}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => updateField("enabled", e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-zinc-700">启用此抓取源</span>
                  </label>
                </div>
              </>
            ) : (
              /* 代理配置 Tab - 适用于所有类型 */
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>说明:</strong> 抓取 Google News 等境外站点时，需要配置 SOCKS5/HTTP 代理。
                    使用 Clash Verge 时，默认 SOCKS5 端口为 7897。
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      代理类型
                    </label>
                    <select
                      value={formData.proxyType}
                      onChange={(e) => updateField("proxyType", e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">不使用代理</option>
                      <option value="socks5">SOCKS5 (推荐)</option>
                      <option value="http">HTTP</option>
                    </select>
                  </div>

                  {formData.proxyType !== "none" && (
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        代理服务器
                      </label>
                      <input
                        type="text"
                        value={formData.proxyServer}
                        onChange={(e) => updateField("proxyServer", e.target.value)}
                        placeholder="127.0.0.1:7897"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-zinc-500 mt-1">
                        格式: host:port (如 127.0.0.1:7897)
                      </p>
                    </div>
                  )}
                </div>

                {/* Playwright Only: Selectors (in advanced tab) */}
                {isPlaywright && (
                  <div className="border-t border-zinc-200 pt-6 mt-6">
                    <h3 className="text-sm font-medium text-zinc-900 mb-4">CSS 选择器配置</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-zinc-600 mb-1">
                          文章链接选择器
                        </label>
                        <input
                          type="text"
                          value={formData.selectors?.articleLink}
                          onChange={(e) => updateSelector("articleLink", e.target.value)}
                          placeholder="a[href^='./read/']"
                          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        />
                        <p className="text-xs text-zinc-400 mt-1">
                          Google News 使用: a[href^=&apos;./read/&apos;]
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm text-zinc-600 mb-1">
                          时间选择器
                        </label>
                        <input
                          type="text"
                          value={formData.selectors?.time}
                          onChange={(e) => updateSelector("time", e.target.value)}
                          placeholder="time"
                          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-zinc-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-lg transition-colors ${
                isPlaywright
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {initialData ? "保存" : "创建"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
