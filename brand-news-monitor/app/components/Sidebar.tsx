"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Globe,
  Brain,
  Mail,
  Clock,
  Shirt,
  Archive,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "品牌管理", href: "/brands", icon: Building2 },
  { name: "抓取源配置", href: "/sources", icon: Globe },
  { name: "新闻库", href: "/news", icon: Archive },
  { name: "AI 配置", href: "/ai", icon: Brain },
  { name: "邮件配置", href: "/email", icon: Mail },
  { name: "定时任务", href: "/schedule", icon: Clock },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-zinc-900 w-64">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-zinc-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
          <Shirt className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">品牌新闻监控</h1>
          <p className="text-xs text-zinc-400">Fashion Brand Monitor</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-800 p-4">
        <div className="rounded-lg bg-zinc-800 p-4">
          <p className="text-xs text-zinc-400 mb-2">系统状态</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-zinc-300">运行正常</span>
          </div>
        </div>
      </div>
    </div>
  );
}
