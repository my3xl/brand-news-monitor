import {
  Archive,
  Search,
  Filter,
  ExternalLink,
  Calendar,
  Building2,
  Tag,
  Mail,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const newsData = [
  {
    id: 1,
    title: "Nike Reports Strong Q2 Earnings, Beats Analyst Expectations",
    source: "Google News US",
    sourceUrl: "https://news.google.com/...",
    brand: "Nike",
    date: "2024-01-15",
    grade: "A",
    summary:
      "Nike 第二季度财报超出分析师预期，营收增长 8%，主要受益于 DTC 渠道扩张和亚洲市场复苏。供应链成本控制能力得到提升。",
    sent: true,
    emailDate: "2024-01-15",
  },
  {
    id: 2,
    title: "Zara Parent Company Inditex Announces New Sustainability Goals",
    source: "WWD",
    sourceUrl: "https://wwd.com/...",
    brand: "Zara",
    date: "2024-01-15",
    grade: "B",
    summary:
      "Inditex 集团发布新可持续发展目标，计划到 2030 年实现 100% 可持续面料使用，包括供应链透明化改造。",
    sent: true,
    emailDate: "2024-01-15",
  },
  {
    id: 3,
    title: "H&M Collaborates with Japanese Designer for Spring Collection",
    source: "Google News UK",
    sourceUrl: "https://news.google.com/...",
    brand: "H&M",
    date: "2024-01-14",
    grade: "C",
    summary:
      "H&M 宣布与日本设计师合作推出春季联名系列，主要面向亚洲市场，对供应链影响有限。",
    sent: false,
    emailDate: null,
  },
  {
    id: 4,
    title: "Adidas Supply Chain Disruption in Vietnam Factory",
    source: "Google News US",
    sourceUrl: "https://news.google.com/...",
    brand: "Adidas",
    date: "2024-01-14",
    grade: "A",
    summary:
      "Adidas 越南工厂因劳工问题临时停产，预计影响 Q1 出货量约 5%，公司正在协调备用供应商。",
    sent: true,
    emailDate: "2024-01-14",
  },
  {
    id: 5,
    title: "Uniqlo Expands European Distribution Center Network",
    source: "Google News FR",
    sourceUrl: "https://news.google.com/...",
    brand: "Uniqlo",
    date: "2024-01-13",
    grade: "B",
    summary:
      "优衣库扩建欧洲配送中心网络，新设荷兰物流中心以缩短交货周期，提升欧洲供应链效率。",
    sent: true,
    emailDate: "2024-01-13",
  },
];

const gradeConfig: Record<
  string,
  { label: string; className: string }
> = {
  A: { label: "A级-高度相关", className: "bg-green-100 text-green-700" },
  B: { label: "B级-相关", className: "bg-blue-100 text-blue-700" },
  C: { label: "C级-弱相关", className: "bg-amber-100 text-amber-700" },
  D: { label: "D级-不相关", className: "bg-zinc-100 text-zinc-600" },
};

export default function NewsPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">新闻库</h1>
          <p className="text-zinc-500 mt-1">查看历史抓取的新闻数据（最近3个月）</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg text-zinc-700 hover:bg-zinc-50 transition-colors">
            <Archive className="h-4 w-4" />
            导出数据
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="搜索新闻标题..."
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-zinc-400" />
            <select className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg">
              <option>全部品牌</option>
              <option>Nike</option>
              <option>Zara</option>
              <option>H&M</option>
              <option>Adidas</option>
              <option>Uniqlo</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-zinc-400" />
            <select className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg">
              <option>全部等级</option>
              <option>A级 - 高度相关</option>
              <option>B级 - 相关</option>
              <option>C级 - 弱相关</option>
              <option>D级 - 不相关</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-zinc-400" />
            <select className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg">
              <option>最近7天</option>
              <option>最近30天</option>
              <option>最近90天</option>
              <option>全部</option>
            </select>
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="space-y-4">
        {newsData.map((news) => {
          const grade = gradeConfig[news.grade];
          return (
            <div
              key={news.id}
              className="bg-white rounded-xl border border-zinc-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Title & Grade */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-zinc-900">
                      {news.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${grade.className}`}
                    >
                      {news.grade}级
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-zinc-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {news.brand}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {news.date}
                    </span>
                    <span>{news.source}</span>
                    <a
                      href={news.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      原文链接
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {/* Summary */}
                  <div className="bg-zinc-50 rounded-lg p-4">
                    <p className="text-sm text-zinc-700 leading-relaxed">
                      <span className="font-medium text-zinc-900">AI 摘要：</span>
                      {news.summary}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex flex-col items-end gap-2">
                  {news.sent ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                      <Mail className="h-3 w-3" />
                      已发送
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-500">
                      未发送
                    </span>
                  )}
                  {news.emailDate && (
                    <span className="text-xs text-zinc-400">
                      发送于 {news.emailDate}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-zinc-500">共 {newsData.length} 条新闻</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-zinc-200 rounded-lg text-zinc-500 hover:bg-zinc-50">
            上一页
          </button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded-lg">1</button>
          <button className="px-3 py-1 border border-zinc-200 rounded-lg text-zinc-500 hover:bg-zinc-50">
            2
          </button>
          <button className="px-3 py-1 border border-zinc-200 rounded-lg text-zinc-500 hover:bg-zinc-50">
            3
          </button>
          <button className="px-3 py-1 border border-zinc-200 rounded-lg text-zinc-500 hover:bg-zinc-50">
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}
