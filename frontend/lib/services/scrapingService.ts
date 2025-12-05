import { SearchParams, ScrapingResponse } from "@/lib/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function scrapeJobs(
  params: SearchParams
): Promise<ScrapingResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job_keyword: params.job_keyword || "junior developer",
        countries: params.countries,
        date_posted: params.date_posted || "24h",
        experience_levels: params.experience_levels || [],
        workplace_types: params.workplace_types || [],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: "error",
        timestamp: new Date().toISOString(),
        error: errorData.error || "Failed to scrape jobs",
        code: errorData.code || "SCRAPING_ERROR",
      };
    }

    const data: ScrapingResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Scraping error:", error);
    return {
      status: "error",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error occurred",
      code: "CLIENT_ERROR",
    };
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: "GET",
    });
    return response.ok;
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
}
