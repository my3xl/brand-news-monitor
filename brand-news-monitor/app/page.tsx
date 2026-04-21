import {
  Activity,
  Newspaper,
  Send,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  RotateCcw,
} from "lucide-react";

const stats = [
  { name: "监控品牌", value: "4", icon: Building2, color: "blue" },
  { name: "今日新闻", value: "15", icon: Newspaper, color: "indigo" },
  { name: "已发送邮件", value: "4", icon: Send, color: "green" },
  { name: "待处理", value: "1", icon: Clock, color: "amber" },
];

const recentJobs = [
  {
    id: 1,
    time: "09:00",
    brand: "RAG & BONE",
    source: "Google News US",
    count: 3,
    status: "sent",
  },
  {
    id: 2,
    time: "09:05",
    brand: "HELLY HANSEN",
    source: "Google News UK",
    count: 4,
    status: "sent",
  },
  {
    id: 3,
    time: "09:10",
    brand: "CAMILLA",
    source: "Google News US",
    count: 3,
    status: "sent",
  },
  {
    id: 4,
    time: "09:15",
    brand: "ALLSAINTS",
    source: "WWD",
    count: 5,
    status: "processing",
  },
];

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
  sent: { label: "已发送", icon: CheckCircle, className: "text-green-600 bg-green-50" },
  processing: { label: "处理中", icon: Activity, className: "text-blue-600 bg-blue-50" },
  no_result: { label: "无结果", icon: AlertCircle, className: "text-amber-600 bg-amber-50" },
  failed: { label: "失败", icon: AlertCircle, className: "text-red-600 bg-red-50" },
};

export default function Dashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-zinc-500 mt-1">今日新闻监控概览</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-700 hover:bg-zinc-50 transition-colors">
            <RotateCcw className="h-4 w-4" />
            刷新
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Play className="h-4 w-4" />
            手动触发
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-xl border border-zinc-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">{stat.name}</p>
                <p className="text-3xl font-bold text-zinc-900 mt-2">
                  {stat.value}
                </p>
              </div>
              <div
                className={`h-12 w-12 rounded-lg flex items-center justify-center bg-${stat.color}-50`}
              >
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Jobs */}
      <div className="bg-white rounded-xl border border-zinc-200">
        <div className="px-6 py-4 border-b border-zinc-200">
          <h2 className="text-lg font-semibold text-zinc-900">最近抓取记录</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                  时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                  品牌
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                  来源
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                  新闻数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {recentJobs.map((job) => {
                const status = statusConfig[job.status];
                const StatusIcon = status.icon;
                return (
                  <tr key={job.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4 text-sm text-zinc-900">{job.time}</td>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                      {job.brand}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">{job.source}</td>
                    <td className="px-6 py-4 text-sm text-zinc-900">{job.count}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
