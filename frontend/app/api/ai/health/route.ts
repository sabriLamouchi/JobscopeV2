import { NextResponse } from "next/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:5001";

export async function GET() {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/health`);
    
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
      { status: "error", message: "AI service unreachable" },
      { status: 503 }
    );
  }
}
