"use client";

import { useState } from "react";
import { Plus, Globe, Monitor, CheckCircle2, AlertCircle, Edit, Trash2 } from "lucide-react";
import SourceModal from "./components/SourceModal";

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
}

// 演示模式：静态数据
const mockSources: Source[] = [
  {
    id: "source_1",
    name: "Google News US (Playwright)",
    type: "playwright",
    urlTemplate: "https://news.google.com/search?q={keyword}&hl=en-US&gl=US&ceid=US:en",
    region: "US",
    enabled: true,
    proxyType: "socks5",
    proxyServer: "127.0.0.1:7897",
    timeout: 60000,
    jsWaitTime: 2000,
    maxArticles: 20,
  },
  {
    id: "source_2",
    name: "Google News UK (Playwright)",
    type: "playwright",
    urlTemplate: "https://news.google.com/search?q={keyword}&hl=en-GB&gl=GB&ceid=GB:en",
    region: "UK",
    enabled: true,
    proxyType: "socks5",
    proxyServer: "127.0.0.1:7897",
    timeout: 60000,
    jsWaitTime: 2000,
    maxArticles: 20,
  },
  {
    id: "source_3",
    name: "Google News FR (Playwright)",
    type: "playwright",
    urlTemplate: "https://news.google.com/search?q={keyword}&hl=fr-FR&gl=FR&ceid=FR:fr",
    region: "FR",
    enabled: true,
    proxyType: "socks5",
    proxyServer: "127.0.0.1:7897",
    timeout: 60000,
    jsWaitTime: 2500,
    maxArticles: 15,
  },
  {
    id: "source_4",
    name: "WWD Fashion",
    type: "rss",
    urlTemplate: "https://wwd.com/feed/",
    region: "US",
    enabled: false,
    proxyType: "none",
    rateLimit: "2s",
    maxArticles: 10,
  },
];

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>(mockSources);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | undefined>();

  // Create source (演示模式：仅前端)
  function handleCreate(sourceData: Omit<Source, "id">) {
    const newSource: Source = {
      ...sourceData,
      id: `source_${Date.now()}`,
    };
    setSources([...sources, newSource]);
    setIsModalOpen(false);
  }

  // Update source (演示模式：仅前端)
  function handleUpdate(sourceData: Omit<Source, "id">) {
    if (!editingSource) return;

    const updatedSource: Source = {
      ...sourceData,
      id: editingSource.id,
    };
    setSources(sources.map((s) => (s.id === editingSource.id ? updatedSource : s)));
    setEditingSource(undefined);
    setIsModalOpen(false);
  }

  // Delete source (演示模式：仅前端)
  function handleDelete(id: string) {
    if (!confirm("确定要删除这个抓取源吗？")) return;
    setSources(sources.filter((s) => s.id !== id));
  }

  // Open edit modal
  function handleEdit(source: Source) {
    setEditingSource(source);
    setIsModalOpen(true);
  }

  // Open create modal
  function handleCreateClick() {
    setEditingSource(undefined);
    setIsModalOpen(true);
  }

  // Close modal
  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingSource(undefined);
  }

  const rssSources = sources.filter((s) => s.type === "rss");
  const playwrightSources = sources.filter((s) => s.type === "playwright");

  // Helper to format proxy display
  function getProxyDisplay(source: Source): string {
    if (source.type === "rss") return "-";
    if (!source.proxyType || source.proxyType === "none") return "无代理";
    return `${source.proxyType.toUpperCase()} ${source.proxyServer || ""}`;
  }

  // Helper to get config summary
  function getConfigSummary(source: Source): string {
    if (source.type === "rss") {
      const proxy = source.proxyType && source.proxyType !== "none" ? ` | 代理: ${source.proxyType}` : "";
      return `间隔: ${source.rateLimit || "1s"}${proxy}`;
    }
    return `超时: ${source.timeout ? Math.round(source.timeout / 1000) + "s" : "60s"} | 等待: ${source.jsWaitTime ? Math.round(source.jsWaitTime / 1000) + "s" : "2s"} | 最大: ${source.maxArticles || 10}条`;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">抓取源配置</h1>
          <p className="text-zinc-500 mt-1">管理新闻抓取的数据源</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          新增源
        </button>
      </div>

      {/* Sources List */}
      <div className="space-y-4">
        {/* RSS Sources */}
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50">
            <h2 className="font-semibold text-zinc-900">RSS 源</h2>
            <p className="text-sm text-zinc-500 mt-1">稳定可靠的 RSS 订阅源</p>
          </div>
          <div className="divide-y divide-zinc-200">
            {rssSources.length === 0 ? (
              <div className="px-6 py-8 text-center text-zinc-500">
                暂无 RSS 源
              </div>
            ) : (
              rssSources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-zinc-900">{source.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-zinc-500 mt-0.5">
                        <span>{source.region}</span>
                        <span>·</span>
                        <span>{getConfigSummary(source)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <code className="text-xs text-zinc-400 bg-zinc-100 px-2 py-1 rounded max-w-xs truncate">
                      {source.urlTemplate}
                    </code>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      source.enabled
                        ? "bg-green-50 text-green-600"
                        : "bg-zinc-100 text-zinc-500"
                    }`}>
                      <CheckCircle2 className="h-3 w-3" />
                      {source.enabled ? "运行中" : "已禁用"}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(source)}
                        className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(source.id)}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Playwright Sources */}
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50">
            <h2 className="font-semibold text-zinc-900">浏览器抓取源</h2>
            <p className="text-sm text-zinc-500 mt-1">需要 Playwright 渲染的复杂站点</p>
          </div>
          <div className="divide-y divide-zinc-200">
            {playwrightSources.length === 0 ? (
              <div className="px-6 py-8 text-center text-zinc-500">
                暂无浏览器抓取源
                <p className="text-sm mt-2">
                  建议添加 Google News (Playwright) 用于抓取墙外站点
                </p>
              </div>
            ) : (
              playwrightSources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Monitor className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-zinc-900">{source.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-zinc-500 mt-0.5">
                        <span>{source.region}</span>
                        <span>·</span>
                        <span>{getProxyDisplay(source)}</span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        {getConfigSummary(source)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <code className="text-xs text-zinc-400 bg-zinc-100 px-2 py-1 rounded max-w-xs truncate">
                      {source.urlTemplate}
                    </code>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      source.enabled
                        ? "bg-amber-50 text-amber-600"
                        : "bg-zinc-100 text-zinc-500"
                    }`}>
                      <AlertCircle className="h-3 w-3" />
                      {source.enabled ? "需代理" : "已禁用"}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(source)}
                        className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(source.id)}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Tip */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">配置建议</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>RSS 源适合稳定的英文新闻站点，抓取速度快</li>
          <li>浏览器抓取适合 Google News 等需要 JavaScript 渲染的站点</li>
          <li>使用浏览器抓取时，确保 Clash Verge 已开启 SOCKS5 代理（默认端口 7897）</li>
        </ul>
      </div>

      {/* Source Modal */}
      <SourceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingSource ? handleUpdate : handleCreate}
        initialData={editingSource}
      />
    </div>
  );
}
