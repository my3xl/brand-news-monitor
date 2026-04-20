import { NextRequest, NextResponse } from "next/server";
import { getAllSources, createSource, initSampleData } from "@/lib/redis";

// GET /api/sources - List all sources
export async function GET() {
  try {
    // Initialize sample data if empty (for demo)
    await initSampleData();

    const sources = await getAllSources();
    return NextResponse.json({ sources });
  } catch (error) {
    console.error("Error fetching sources:", error);
    return NextResponse.json(
      { error: "Failed to fetch sources" },
      { status: 500 }
    );
  }
}

// POST /api/sources - Create a new source
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.type || !body.urlTemplate || !body.region) {
      return NextResponse.json(
        { error: "Missing required fields: name, type, urlTemplate, region" },
        { status: 400 }
      );
    }

    const source = await createSource({
      name: body.name,
      type: body.type,
      urlTemplate: body.urlTemplate,
      region: body.region,
      enabled: body.enabled ?? true,
      // 代理配置 (RSS 和 Playwright 都可用)
      proxyType: body.proxyType,
      proxyServer: body.proxyServer,
      // RSS 特有
      rateLimit: body.rateLimit || "1s",
      // Playwright 特有
      timeout: body.timeout,
      jsWaitTime: body.jsWaitTime,
      maxArticles: body.maxArticles,
      selectors: body.selectors,
    });

    return NextResponse.json({ source }, { status: 201 });
  } catch (error) {
    console.error("Error creating source:", error);
    return NextResponse.json(
      { error: "Failed to create source" },
      { status: 500 }
    );
  }
}
