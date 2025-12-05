import { NextRequest, NextResponse } from "next/server";
import { SearchParams, ScrapingResponse } from "@/lib/types";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

export async function POST(request: NextRequest) {
  try {
    const body: SearchParams = await request.json();

    // Validate required parameters
    if (!body.countries || body.countries.length === 0) {
      return NextResponse.json(
        {
          status: "error",
          timestamp: new Date().toISOString(),
          error: "countries parameter is required",
          code: "INVALID_COUNTRIES",
        },
        { status: 400 }
      );
    }

    // Forward request to Flask backend
    const response = await fetch(`${BACKEND_URL}/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job_keyword: body.job_keyword || "junior developer",
        countries: body.countries,
        date_posted: body.date_posted || "24h",
        experience_levels: body.experience_levels || [],
        workplace_types: body.workplace_types || [],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          status: "error",
          timestamp: new Date().toISOString(),
          error: errorData.error || "Failed to scrape jobs",
          code: errorData.code || "BACKEND_ERROR",
        },
        { status: response.status }
      );
    }

    const data: ScrapingResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
