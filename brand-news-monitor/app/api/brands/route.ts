import { NextRequest, NextResponse } from "next/server";
import { getAllBrands, createBrand, initSampleData } from "@/lib/redis";

// GET /api/brands - List all brands
export async function GET() {
  try {
    // Initialize sample data if empty (for demo)
    await initSampleData();

    const brands = await getAllBrands();
    return NextResponse.json({ brands });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

// POST /api/brands - Create a new brand
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.keywords || !body.emails || !body.sources) {
      return NextResponse.json(
        { error: "Missing required fields: name, keywords, emails, sources" },
        { status: 400 }
      );
    }

    const brand = await createBrand({
      name: body.name,
      keywords: body.keywords,
      emails: body.emails,
      sources: body.sources,
      status: body.status || "active",
    });

    return NextResponse.json({ brand }, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 }
    );
  }
}
