import Redis from "ioredis";

// Redis connection using environment variables
// For local development, you can use Redis locally or Upstash Redis
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.warn(
    "REDIS_URL not set. Using mock data. Set REDIS_URL to connect to Upstash Redis."
  );
}

// Upstash Redis 需要 TLS 连接
export const redis = redisUrl
  ? new Redis(redisUrl, {
      tls: redisUrl.startsWith("rediss://") ? {} : undefined,
      connectTimeout: 10000,
      commandTimeout: 5000,
    })
  : null;

// Helper function to check if Redis is connected
export function isRedisConnected(): boolean {
  return redis !== null && redis.status === "ready";
}

// 连接错误处理
if (redis) {
  redis.on("error", (err) => {
    console.error("Redis connection error:", err.message);
  });
  redis.on("connect", () => {
    console.log("Redis connected successfully");
  });
}

// Type definitions for our data models
export interface Brand {
  id: string;
  name: string;
  keywords: string;
  emails: string[];
  sources: string[];
  status: "active" | "paused";
  createdAt: string;
  updatedAt: string;
}

export interface Source {
  id: string;
  name: string;
  type: "rss" | "playwright";
  urlTemplate: string;
  region: string;
  enabled: boolean;

  // 代理配置 (RSS 和 Playwright 都可用)
  proxyType?: "socks5" | "http" | "none";
  proxyServer?: string;  // 如 "127.0.0.1:7897"

  // RSS 特有
  rateLimit?: string;  // RSS 用，如 "1s"

  // Playwright 特有配置

  // 抓取参数
  timeout?: number;        // 页面加载超时(ms)，默认60000
  jsWaitTime?: number;     // JS渲染等待(ms)，默认2000
  maxArticles?: number;    // 每品牌最大文章数，默认10

  // 选择器配置 (Playwright 用)
  selectors?: {
    articleLink?: string;  // 文章链接选择器，默认 "a[href^='./read/']"
    title?: string;        // 标题选择器(相对articleLink)
    source?: string;       // 来源选择器
    time?: string;         // 时间选择器
  };
}

// Brand CRUD operations
export async function getAllBrands(): Promise<Brand[]> {
  if (!redis) return getMockBrands();

  try {
    const keys = await redis.keys("brand:*");
    if (keys.length === 0) return getMockBrands();

    const brands = await redis.mget(...keys);
    const result = brands
      .filter((b): b is string => b !== null)
      .map((b) => JSON.parse(b));
    return result.length > 0 ? result : getMockBrands();
  } catch (error) {
    console.error("Error fetching brands:", error);
    return getMockBrands();
  }
}

// Mock data for demo
function getMockBrands(): Brand[] {
  return [
    {
      id: "brand_1",
      name: "Nike",
      keywords: 'Nike OR "Nike Inc"',
      emails: ["am_a@company.com", "manager_nike@company.com"],
      sources: ["google_news_us", "google_news_uk", "wwd"],
      status: "active",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "brand_2",
      name: "Zara",
      keywords: "Zara OR Inditex",
      emails: ["am_b@company.com"],
      sources: ["google_news_us", "google_news_fr"],
      status: "active",
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: "2024-01-02T00:00:00Z",
    },
    {
      id: "brand_3",
      name: "H&M",
      keywords: "H&M OR Hennes Mauritz",
      emails: ["am_c@company.com", "hm_team@company.com"],
      sources: ["google_news_us", "google_news_uk"],
      status: "active",
      createdAt: "2024-01-03T00:00:00Z",
      updatedAt: "2024-01-03T00:00:00Z",
    },
  ];
}

export async function getBrand(id: string): Promise<Brand | null> {
  if (!redis) return null;

  const brand = await redis.get(`brand:${id}`);
  return brand ? JSON.parse(brand) : null;
}

export async function createBrand(brand: Omit<Brand, "id" | "createdAt" | "updatedAt">): Promise<Brand> {
  if (!redis) throw new Error("Redis not connected");

  const id = `brand_${Date.now()}`;
  const now = new Date().toISOString();
  const newBrand: Brand = {
    ...brand,
    id,
    createdAt: now,
    updatedAt: now,
  };

  await redis.set(`brand:${id}`, JSON.stringify(newBrand));
  return newBrand;
}

export async function updateBrand(id: string, updates: Partial<Brand>): Promise<Brand | null> {
  if (!redis) return null;

  const existing = await getBrand(id);
  if (!existing) return null;

  const updated: Brand = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  await redis.set(`brand:${id}`, JSON.stringify(updated));
  return updated;
}

export async function deleteBrand(id: string): Promise<boolean> {
  if (!redis) return false;

  const result = await redis.del(`brand:${id}`);
  return result > 0;
}

// Source CRUD operations
export async function getAllSources(): Promise<Source[]> {
  if (!redis) return getMockSources();

  try {
    const keys = await redis.keys("source:*");
    if (keys.length === 0) return getMockSources();

    const sources = await redis.mget(...keys);
    const result = sources
      .filter((s): s is string => s !== null)
      .map((s) => JSON.parse(s));
    return result.length > 0 ? result : getMockSources();
  } catch (error) {
    console.error("Error fetching sources:", error);
    return getMockSources();
  }
}

// Mock sources for demo
function getMockSources(): Source[] {
  return [
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
      maxArticles: 10,
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
      maxArticles: 10,
      selectors: {
        articleLink: "a[href^='./read/']",
        time: "time",
      },
    },
  ];
}

export async function getSource(id: string): Promise<Source | null> {
  if (!redis) return null;

  const source = await redis.get(`source:${id}`);
  return source ? JSON.parse(source) : null;
}

export async function createSource(source: Omit<Source, "id">): Promise<Source> {
  if (!redis) throw new Error("Redis not connected");

  const id = `source_${Date.now()}`;
  const newSource: Source = {
    ...source,
    id,
  };

  await redis.set(`source:${id}`, JSON.stringify(newSource));
  return newSource;
}

export async function updateSource(id: string, updates: Partial<Source>): Promise<Source | null> {
  if (!redis) return null;

  const existing = await getSource(id);
  if (!existing) return null;

  const updated: Source = {
    ...existing,
    ...updates,
    id: existing.id,
  };

  await redis.set(`source:${id}`, JSON.stringify(updated));
  return updated;
}

export async function deleteSource(id: string): Promise<boolean> {
  if (!redis) return false;

  const result = await redis.del(`source:${id}`);
  return result > 0;
}

// Initialize with sample data (for testing)
export async function initSampleData(): Promise<void> {
  if (!redis) return;

  // Initialize sample brands if empty
  const existingBrands = await getAllBrands();
  if (existingBrands.length === 0) {
    const sampleBrands: Omit<Brand, "id" | "createdAt" | "updatedAt">[] = [
      {
        name: "Nike",
        keywords: 'Nike OR "Nike Inc"',
        emails: ["am_a@company.com", "manager_nike@company.com"],
        sources: ["google_news_us", "google_news_uk", "wwd"],
        status: "active",
      },
      {
        name: "Zara",
        keywords: "Zara OR Inditex",
        emails: ["am_b@company.com"],
        sources: ["google_news_us", "google_news_fr"],
        status: "active",
      },
      {
        name: "H&M",
        keywords: "H&M OR Hennes Mauritz",
        emails: ["am_c@company.com", "hm_team@company.com"],
        sources: ["google_news_us", "google_news_uk"],
        status: "active",
      },
    ];

    for (const brand of sampleBrands) {
      await createBrand(brand);
    }
    console.log("Sample brands initialized");
  }

  // Initialize sample sources if empty
  const existingSources = await getAllSources();
  if (existingSources.length === 0) {
    const sampleSources: Omit<Source, "id">[] = [
      {
        name: "Google News US (RSS)",
        type: "rss",
        urlTemplate: "https://news.google.com/rss/search?q={keyword}&hl=en-US&gl=US&ceid=US:en",
        region: "US",
        rateLimit: "1s",
        enabled: true,
        proxyType: "socks5",
        proxyServer: "127.0.0.1:7897",
      },
      {
        name: "Google News UK (RSS)",
        type: "rss",
        urlTemplate: "https://news.google.com/rss/search?q={keyword}&hl=en-GB&gl=GB&ceid=GB:en",
        region: "UK",
        rateLimit: "1s",
        enabled: true,
        proxyType: "socks5",
        proxyServer: "127.0.0.1:7897",
      },
      {
        name: "WWD Fashion",
        type: "rss",
        urlTemplate: "https://wwd.com/feed/",
        region: "US",
        rateLimit: "1s",
        enabled: true,
        proxyType: "none",
      },
      {
        name: "Google News US (Playwright)",
        type: "playwright",
        urlTemplate: "https://news.google.com/search?q={keyword}&hl=en-US&gl=US&ceid=US:en",
        region: "US",
        enabled: true,
        proxyType: "socks5",
        proxyServer: "127.0.0.1:7897",
        timeout: 60000,
        jsWaitTime: 2000,
        maxArticles: 10,
        selectors: {
          articleLink: "a[href^='./read/']",
          time: "time",
        },
      },
    ];

    for (const source of sampleSources) {
      await createSource(source);
    }
    console.log("Sample sources initialized");
  }
}
