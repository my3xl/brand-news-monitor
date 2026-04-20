import { Clock, Calendar, Play, RotateCcw, Building2, CheckCircle2, AlertCircle } from "lucide-react";

const scheduleHistory = [
  { id: 1, time: "2024-01-15 09:00:00", status: "success", brands: 12, news: 48 },
  { id: 2, time: "2024-01-14 09:00:00", status: "success", brands: 12, news: 35 },
  { id: 3, time: "2024-01-13 09:00:00", status: "partial", brands: 11, news: 42 },
  { id: 4, time: "2024-01-12 09:00:00", status: "failed", brands: 0, news: 0 },
];

export default function SchedulePage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">定时任务</h1>
        <p className="text-zinc-500 mt-1">配置自动抓取和发送的调度策略</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule Config */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900">执行计划</h2>
              <p className="text-sm text-zinc-500">设置定时任务参数</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-zinc-700">启用自动抓取</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Cron 表达式
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  defaultValue="0 9 * * *"
                  className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <select className="px-3 py-2 border border-zinc-200 rounded-lg">
                  <option>自定义</option>
                  <option>每天 9:00</option>
                  <option>每天 9:00 + 15:00</option>
                  <option>工作日 9:00</option>
                  <option>每周一 9:00</option>
                </select>
              </div>
              <p className="text-xs text-zinc-500 mt-1">当前设置：每天上午 9:00 执行</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-3">
                时区
              </label>
              <select className="w-full px-3 py-2 border border-zinc-200 rounded-lg">
                <option value="Asia/Shanghai">Asia/Shanghai (北京时间)</option>
                <option value="America/New_York">America/New_York (纽约)</option>
                <option value="Europe/London">Europe/London (伦敦)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-3">
                目标品牌
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="target" defaultChecked className="h-4 w-4 text-blue-600" />
                  <span>全部品牌</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="target" className="h-4 w-4 text-blue-600" />
                  <span>指定品牌</span>
                </label>
              </div>
              <div className="mt-3 p-3 bg-zinc-50 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {["Nike", "Zara", "H\u0026M", "Adidas", "Uniqlo"].map((brand) => (
                    <label key={brand} className="flex items-center gap-1 px-2 py-1 bg-white rounded border">
                      <input type="checkbox" defaultChecked className="h-3 w-3" />
                      <span className="text-sm">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200">
              <h3 className="text-sm font-medium text-zinc-700 mb-3">重试策略</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">失败重试次数</label>
                  <input
                    type="number"
                    defaultValue={3}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">重试间隔（分钟）</label>
                  <input
                    type="number"
                    defaultValue={5}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Run & History */}
        <div className="space-y-6">
          {/* Next Run Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">下次执行</span>
            </div>
            <p className="text-3xl font-bold">明天 09:00</p>
            <p className="text-blue-100 mt-1">2024年1月16日（周二）</p>
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-100">
              <Building2 className="h-4 w-4" />
              <span>预计处理 12 个品牌</span>
            </div>
          </div>

          {/* Manual Actions */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="font-semibold text-zinc-900 mb-4">手动操作</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Play className="h-4 w-4" />
                立即执行
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors">
                <RotateCcw className="h-4 w-4" />
                重新运行上次失败
              </button>
            </div>
          </div>

          {/* History */}
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-50">
              <h2 className="font-medium text-zinc-900">最近执行记录</h2>
            </div>
            <div className="divide-y divide-zinc-200">
              {scheduleHistory.map((record) => (
                <div key={record.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-900">{record.time}</p>
                    <p className="text-xs text-zinc-500">
                      {record.brands} 品牌 · {record.news} 新闻
                    </p>
                  </div>
                  {record.status === "success" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      成功
                    </span>
                  )}
                  {record.status === "partial" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
                      <AlertCircle className="h-3 w-3" />
                      部分成功
                    </span>
                  )}
                  {record.status === "failed" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      失败
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
