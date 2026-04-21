import { NextRequest, NextResponse } from "next/server";

// 演示模式：静态数据，不连 Redis
const mockBrands = [
  {
    id: "brand_1",
    name: "Nike",
    keywords: 'Nike OR "Nike Inc"',
    emails: ["am_a@company.com", "manager_nike@company.com"],
    sources: ["google_news_us", "google_news_uk"],
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-04-20T10:00:00Z",
  },
  {
    id: "brand_2",
    name: "Zara",
    keywords: "Zara OR Inditex",
    emails: ["am_b@company.com"],
    sources: ["google_news_us", "google_news_fr"],
    status: "active",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-04-19T15:30:00Z",
  },
  {
    id: "brand_3",
    name: "H&M",
    keywords: "H&M OR Hennes Mauritz",
    emails: ["am_c@company.com", "hm_team@company.com"],
    sources: ["google_news_us", "google_news_uk"],
    status: "active",
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-04-18T09:15:00Z",
  },
  {
    id: "brand_4",
    name: "Uniqlo",
    keywords: "Uniqlo OR Fast Retailing",
    emails: ["am_d@company.com"],
    sources: ["google_news_us", "google_news_jp"],
    status: "active",
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-04-17T14:20:00Z",
  },
  {
    id: "brand_5",
    name: "Adidas",
    keywords: 'Adidas OR "Adidas Group"',
    emails: ["am_e@company.com", "adidas_manager@company.com"],
    sources: ["google_news_us", "google_news_de"],
    status: "paused",
    createdAt: "2024-02-15T00:00:00Z",
    updatedAt: "2024-04-16T11:00:00Z",
  },
];

// GET /api/brands - List all brands (演示模式)
export async function GET() {
  return NextResponse.json({ brands: mockBrands });
}

// POST /api/brands - Create a new brand (演示模式，假装成功)
export async function POST(request: NextRequest) {
  const body = await request.json();

  const newBrand = {
    id: `brand_${Date.now()}`,
    name: body.name,
    keywords: body.keywords,
    emails: body.emails,
    sources: body.sources,
    status: body.status || "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ brand: newBrand }, { status: 201 });
}
