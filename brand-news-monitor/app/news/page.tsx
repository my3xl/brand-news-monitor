"use client";

import { useState } from "react";
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

interface NewsItem {
  id: number;
  title: string;
  source: string;
  sourceUrl: string;
  brand: string;
  date: string;
  grade: "A" | "B" | "C" | "D";
  summary: string;
  sent: boolean;
  emailDate: string | null;
}

// 基于真实品牌的真实感新闻数据
const newsData: NewsItem[] = [
  // RAG & BONE 新闻
  {
    id: 1,
    title: "Rag & Bone Opens New Flagship Store in SoHo, NYC",
    source: "Google News US",
    sourceUrl: "https://news.google.com/search?q=RAG+BONE+SoHo+flagship",
    brand: "RAG & BONE",
    date: "2025-04-18",
    grade: "A",
    summary:
      "Rag & Bone 在纽约 SoHo 区开设全新旗舰店，占地 3,500 平方英尺，采用可持续建材和本地化供应链策略。新店将展示品牌完整的男女装系列，并设立定制工坊区域。",
    sent: true,
    emailDate: "2025-04-18",
  },
  {
    id: 2,
    title: "Rag & Bone Partners with Japanese Denim Mill for Limited Collection",
    source: "WWD",
    sourceUrl: "https://wwd.com/fashion-news/rag-bone-japanese-denim",
    brand: "RAG & BONE",
    date: "2025-04-15",
    grade: "A",
    summary:
      "品牌与日本顶级牛仔布厂 Kurabo 合作推出限量系列，强调供应链透明度和工匠精神。该合作将缩短传统 12 个月的生产周期至 8 个月，提升响应速度。",
    sent: true,
    emailDate: "2025-04-15",
  },
  {
    id: 3,
    title: "Marcus Wainwright Steps Down as CEO of Rag & Bone",
    source: "Business of Fashion",
    sourceUrl: "https://businessoffashion.com/articles/executive-changes",
    brand: "RAG & BONE",
    date: "2025-04-10",
    grade: "A",
    summary:
      "创始人 Marcus Wainwright 卸任 CEO 职务，转任品牌创意总监。新任 CEO 来自 LVMH 集团旗下品牌，将主导品牌的数字化转型和亚太市场扩张战略。",
    sent: true,
    emailDate: "2025-04-10",
  },
  // HELLY HANSEN 新闻
  {
    id: 4,
    title: "Helly Hansen Reports 23% Growth in Q1 2025 Sales",
    source: "Google News UK",
    sourceUrl: "https://news.google.com/search?q=Helly+Hansen+Q1+2025+earnings",
    brand: "HELLY HANSEN",
    date: "2025-04-19",
    grade: "A",
    summary:
      "挪威户外品牌 Helly Hansen 公布 Q1 财报，销售额同比增长 23%，主要受北美和亚洲市场推动。品牌将追加投资 5,000 万美元扩建挪威本土研发中心。",
    sent: true,
    emailDate: "2025-04-19",
  },
  {
    id: 5,
    title: "Helly Hansen Launches Sustainable Waterproof Membrane Technology",
    source: "Outdoor Retailer",
    sourceUrl: "https://outdoorretailer.com/helly-hansen-sustainable-membrane",
    brand: "HELLY HANSEN",
    date: "2025-04-14",
    grade: "A",
    summary:
      "品牌发布全新环保防水膜技术 LIFA Infinity Pro，完全不含 PFAS 化学物质，采用闭环回收系统生产。该技术将应用于 2025 秋冬系列核心产品。",
    sent: true,
    emailDate: "2025-04-14",
  },
  {
    id: 6,
    title: "Helly Hansen Expands Ski Patrol Partnership in North America",
    source: "Ski Magazine",
    sourceUrl: "https://skimag.com/helly-hansen-ski-patrol",
    brand: "HELLY HANSEN",
    date: "2025-04-08",
    grade: "B",
    summary:
      "品牌与北美 15 个顶级滑雪度假村续约专业巡逻装备供应合同，包括 Aspen、Vail 和 Whistler。合同价值约 800 万美元，为期 3 年。",
    sent: false,
    emailDate: null,
  },
  // CAMILLA 新闻
  {
    id: 7,
    title: "Camilla Franks Opens First US Boutique in Los Angeles",
    source: "Google News US",
    sourceUrl: "https://news.google.com/search?q=Camilla+Los+Angeles+boutique",
    brand: "CAMILLA",
    date: "2025-04-17",
    grade: "A",
    summary:
      "澳大利亚设计师品牌 Camilla 在美国洛杉矶 Melrose Avenue 开设首间精品店，占地 2,800 平方英尺。新店将展示品牌标志性的真丝印花系列和独家美国限定款。",
    sent: true,
    emailDate: "2025-04-17",
  },
  {
    id: 8,
    title: "Camilla Partners with Australian Wool Innovation for Winter Collection",
    source: "Fashion Journal",
    sourceUrl: "https://fashionjournal.com.au/camilla-wool-partnership",
    brand: "CAMILLA",
    date: "2025-04-12",
    grade: "A",
    summary:
      "品牌与澳大利亚羊毛创新组织合作，推出使用 100% 可追溯美利奴羊毛的冬季系列。所有羊毛来自新南威尔士州认证农场，符合 Responsible Wool Standard。",
    sent: true,
    emailDate: "2025-04-12",
  },
  {
    id: 9,
    title: "Camilla Expands Digital-First Strategy with AI-Powered Personalization",
    source: "Retail Dive",
    sourceUrl: "https://retaildive.com/news/camilla-ai-personalization",
    brand: "CAMILLA",
    date: "2025-04-05",
    grade: "B",
    summary:
      "品牌投资 300 万澳元升级电商平台，引入 AI 个性化推荐系统和虚拟试衣功能。预计新系统将提升转化率 15% 并降低退货率。",
    sent: false,
    emailDate: null,
  },
  // ALLSAINTS 新闻
  {
    id: 10,
    title: "AllSaints Launches Circular Fashion Initiative with Resale Platform",
    source: "Google News UK",
    sourceUrl: "https://news.google.com/search?q=AllSaints+circular+fashion+resale",
    brand: "ALLSAINTS",
    date: "2025-04-20",
    grade: "A",
    summary:
      "英国品牌 AllSaints 推出官方二手交易平台 ReSaint，顾客可出售和购买经认证的二手皮夹克和服装。品牌承诺到 2027 年实现 30% 的产品来自可持续材料。",
    sent: true,
    emailDate: "2025-04-20",
  },
  {
    id: 11,
    title: "AllSaints Opens New Distribution Center in Netherlands",
    source: "Supply Chain Digital",
    sourceUrl: "https://supplychaindigital.com/allsaints-distribution-netherlands",
    brand: "ALLSAINTS",
    date: "2025-04-16",
    grade: "A",
    summary:
      "品牌在荷兰鹿特丹开设新的欧洲配送中心，面积 12 万平方英尺，采用自动化仓储系统。新中心将缩短欧洲大陆配送时间至 2-3 天，并支持当日达服务扩展。",
    sent: true,
    emailDate: "2025-04-16",
  },
  {
    id: 12,
    title: "AllSaints Collaborates with British Artist for Limited Leather Collection",
    source: "GQ UK",
    sourceUrl: "https://gq-magazine.co.uk/fashion/allsaints-artist-collaboration",
    brand: "ALLSAINTS",
    date: "2025-04-11",
    grade: "B",
    summary:
      "AllSaints 与英国当代艺术家合作推出限量版手绘皮夹克系列，每件作品均在伦敦总部手工完成。系列将在全球 50 家门店和官网独家发售。",
    sent: true,
    emailDate: "2025-04-11",
  },
  {
    id: 13,
    title: "Private Equity Firm Considers Sale of AllSaints Stake",
    source: "Financial Times",
    sourceUrl: "https://ft.com/content/allsaints-private-equity-sale",
    brand: "ALLSAINTS",
    date: "2025-04-07",
    grade: "A",
    summary:
      "持有 AllSaints 多数股权的私募基金 Lion Capital 正在评估出售部分或全部持股，估值约 3 亿英镑。潜在买家包括几家亚洲零售集团和英国本土私募基金。",
    sent: true,
    emailDate: "2025-04-07",
  },
  {
    id: 14,
    title: "AllSaints Reports Strong Performance in Japanese Market",
    source: "Japan Times",
    sourceUrl: "https://japantimes.co.jp/allsaints-japan-growth",
    brand: "ALLSAINTS",
    date: "2025-04-03",
    grade: "B",
    summary:
      "品牌在日本市场连续第三个季度实现双位数增长，目前在东京、大阪和福冈运营 8 家门店。计划 2025 年底前在京都和札幌开设新店。",
    sent: false,
    emailDate: null,
  },
  {
    id: 15,
    title: "Rag & Bone Celebrates 20th Anniversary with Archive Collection",
    source: "Vogue",
    sourceUrl: "https://vogue.com/fashion/rag-bone-20th-anniversary",
    brand: "RAG & BONE",
    date: "2025-04-02",
    grade: "C",
    summary:
      "品牌发布 20 周年限定系列，复刻历年经典款式。系列在社交媒体上获得高度关注，但供应链影响有限。",
    sent: false,
    emailDate: null,
  },
];

const gradeConfig: Record<string, { label: string; className: string }> = {
  A: { label: "A级-高度相关", className: "bg-green-100 text-green-700" },
  B: { label: "B级-相关", className: "bg-blue-100 text-blue-700" },
  C: { label: "C级-弱相关", className: "bg-amber-100 text-amber-700" },
  D: { label: "D级-不相关", className: "bg-zinc-100 text-zinc-600" },
};

export default function NewsPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">新闻库</h1>
          <p className="text-zinc-500 mt-1">
            基于 Google News 抓取的品牌新闻（最近30天）
          </p>
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
              <option>RAG & BONE</option>
              <option>HELLY HANSEN</option>
              <option>CAMILLA</option>
              <option>ALLSAINTS</option>
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
          const isExpanded = expandedId === news.id;
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
          <button className="px-3 py-1 bg-blue-600 text-white rounded-lg">
            1
          </button>
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
