import { NextRequest, NextResponse } from "next/server";

// 演示模式：静态数据（真实品牌）
const mockBrands = [
  {
    id: "brand_1",
    name: "RAG & BONE",
    keywords: '"RAG & BONE" OR RagBone OR "Rag and Bone"',
    emails: ["am.ragbone@company.com", "us-team@company.com"],
    sources: ["source_1", "source_2"],
    status: "active",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-04-20T10:00:00Z",
  },
  {
    id: "brand_2",
    name: "HELLY HANSEN",
    keywords: '"HELLY HANSEN" OR HellyHansen OR "HH"',
    emails: ["am.hellyhansen@company.com", "outdoor@company.com"],
    sources: ["source_1", "source_3"],
    status: "active",
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-04-19T15:30:00Z",
  },
  {
    id: "brand_3",
    name: "CAMILLA",
    keywords: 'CAMILLA fashion OR "Camilla Franks" OR "Camilla Australia"',
    emails: ["am.camilla@company.com", "apac@company.com"],
    sources: ["source_1", "source_2", "source_3"],
    status: "active",
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-04-18T09:15:00Z",
  },
  {
    id: "brand_4",
    name: "ALLSAINTS",
    keywords: 'ALLSAINTS OR "All Saints" fashion OR "AllSaints UK"',
    emails: ["am.allsaints@company.com", "uk-team@company.com"],
    sources: ["source_1", "source_2"],
    status: "active",
    createdAt: "2024-02-10T00:00:00Z",
    updatedAt: "2024-04-17T14:20:00Z",
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
