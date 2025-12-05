import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: "GET",
    });

    if (response.ok) {
      return NextResponse.json({ status: "healthy" });
    } else {
      return NextResponse.json(
        { status: "unhealthy" },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Backend unreachable" },
      { status: 503 }
    );
  }
}
