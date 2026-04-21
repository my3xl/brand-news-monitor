import { NextRequest, NextResponse } from "next/server";

// 演示模式：静态数据，不连 Redis
const mockSources = [
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
    selectors: {
      articleLink: "a[href^='./read/']",
      time: "time",
    },
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
    selectors: {
      articleLink: "a[href^='./read/']",
      time: "time",
    },
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
    selectors: {
      articleLink: "a[href^='./read/']",
      time: "time",
    },
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

// GET /api/sources - List all sources (演示模式)
export async function GET() {
  return NextResponse.json({ sources: mockSources });
}

// POST /api/sources - Create a new source (演示模式)
export async function POST(request: NextRequest) {
  const body = await request.json();

  const newSource = {
    id: `source_${Date.now()}`,
    name: body.name,
    type: body.type,
    urlTemplate: body.urlTemplate,
    region: body.region,
    enabled: body.enabled ?? true,
    proxyType: body.proxyType,
    proxyServer: body.proxyServer,
    rateLimit: body.rateLimit,
    timeout: body.timeout,
    jsWaitTime: body.jsWaitTime,
    maxArticles: body.maxArticles,
    selectors: body.selectors,
  };

  return NextResponse.json({ source: newSource }, { status: 201 });
}
