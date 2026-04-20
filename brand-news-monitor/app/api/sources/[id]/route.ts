import { NextRequest, NextResponse } from "next/server";
import { getSource, updateSource, deleteSource } from "@/lib/redis";

// GET /api/sources/[id] - Get a specific source
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const source = await getSource(id);

    if (!source) {
      return NextResponse.json(
        { error: "Source not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ source });
  } catch (error) {
    console.error("Error fetching source:", error);
    return NextResponse.json(
      { error: "Failed to fetch source" },
      { status: 500 }
    );
  }
}

// PUT /api/sources/[id] - Update a source
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const source = await updateSource(id, body);

    if (!source) {
      return NextResponse.json(
        { error: "Source not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ source });
  } catch (error) {
    console.error("Error updating source:", error);
    return NextResponse.json(
      { error: "Failed to update source" },
      { status: 500 }
    );
  }
}

// DELETE /api/sources/[id] - Delete a source
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteSource(id);

    if (!success) {
      return NextResponse.json(
        { error: "Source not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting source:", error);
    return NextResponse.json(
      { error: "Failed to delete source" },
      { status: 500 }
    );
  }
}
