import { Mail, Server, FileText, Send, Save } from "lucide-react";

export default function EmailConfigPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">邮件配置</h1>
        <p className="text-zinc-500 mt-1">配置 SMTP 服务器和邮件模板</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SMTP Config */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Server className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900">SMTP 配置</h2>
              <p className="text-sm text-zinc-500">邮件发送服务器设置</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                发件人邮箱
              </label>
              <input
                type="email"
                placeholder="news@yourcompany.com"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                SMTP 服务器
              </label>
              <input
                type="text"
                placeholder="smtp.gmail.com"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  端口
                </label>
                <select className="w-full px-3 py-2 border border-zinc-200 rounded-lg">
                  <option value="587">587 (TLS)</option>
                  <option value="465">465 (SSL)</option>
                  <option value="25">25 (None)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  安全连接
                </label>
                <select className="w-full px-3 py-2 border border-zinc-200 rounded-lg">
                  <option>TLS</option>
                  <option>SSL</option>
                  <option>无</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                用户名
              </label>
              <input
                type="text"
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                密码 / 应用专用密码
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button className="w-full py-2 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition-colors">
              <Send className="inline h-4 w-4 mr-2" />
              测试发送
            </button>
          </div>
        </div>

        {/* Email Template */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900">邮件模板</h2>
              <p className="text-sm text-zinc-500">配置日报邮件格式</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                邮件主题
              </label>
              <input
                type="text"
                defaultValue="[{brand}] {date} 新闻日报"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-zinc-500 mt-1">
                可用变量: {"{"}brand{"}"}, {"{"}date{"}"}, {"{"}count{"}"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                邮件正文模板 (HTML)
              </label>
              <textarea
                rows={12}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                defaultValue={`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .header { background: #f3f4f6; padding: 20px; }
    .content { padding: 20px; }
    .news-item { border-bottom: 1px solid #e5e7eb; padding: 15px 0; }
    .grade-a { color: #16a34a; font-weight: bold; }
    .grade-b { color: #2563eb; font-weight: bold; }
    .grade-c { color: #d97706; }
    .summary { color: #6b7280; font-size: 14px; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>{brand} 新闻日报</h1>
    <p>{date} · 共 {count} 条新闻</p>
  </div>
  <div class="content">
    {news_list}
  </div>
</body>
</html>`}
              />
            </div>

            <div className="bg-zinc-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-zinc-700 mb-2">模板变量</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-zinc-500">{"{"}brand{"}"} - 品牌名</div>
                <div className="text-zinc-500">{"{"}date{"}"} - 日期</div>
                <div className="text-zinc-500">{"{"}count{"}"} - 新闻数量</div>
                <div className="text-zinc-500">{"{"}news_list{"}"} - 新闻列表</div>
              </div>
            </div>
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
