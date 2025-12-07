"use client";

import { useState, useEffect } from "react";
import { SearchForm } from "@/components/SearchForm";
import { JobsList } from "@/components/JobsList";
import { HistoryTab } from "@/components/HistoryTab";
import { ChatBot } from "@/components/ChatBot";
import { SearchParams, ScrapingResponse, Job, SearchHistory } from "@/lib/types";
import { historyService } from "@/lib/services/historyService";
import { Briefcase, AlertCircle, Clock } from "lucide-react";

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalJobs, setTotalJobs] = useState(0);
  const [backendHealth, setBackendHealth] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"search" | "history">("search");
  const [lastSearchParams, setLastSearchParams] = useState<SearchParams | null>(null);
  const [history, setHistory] = useState<SearchHistory[]>([]);

  // Load history on mount
  useEffect(() => {
    const loadedHistory = historyService.getHistory();
    setHistory(loadedHistory);
  }, []);

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("/api/health");
        setBackendHealth(response.ok);
      } catch (err) {
        setBackendHealth(false);
      }
    };
    checkHealth();
  }, []);

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);
    setJobs([]);
    setTotalJobs(0);
    setLastSearchParams(params);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const data: ScrapingResponse = await response.json();

      if (data.status === "error") {
        setError(data.error || "Failed to scrape jobs");
      } else if (data.jobs) {
        setJobs(data.jobs);
        setTotalJobs(data.total_jobs || data.jobs.length);

        // Add to history
        const newHistory = historyService.addSearch(params, data.jobs, data.total_jobs || data.jobs.length, data.timestamp);
        setHistory((prev) => [newHistory, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-black/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                LinkedIn Job Scraper
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Find your next opportunity across the world
              </p>
            </div>
          </div>
        </div>

        {/* Backend Health Status */}
        {backendHealth === false && (
          <div className="border-t border-zinc-200 dark:border-zinc-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
              <AlertCircle className="w-4 h-4" />
              <span>Backend service is unavailable. Please ensure the Flask API is running on localhost:5000</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("search")}
                className={`py-4 px-2 font-medium transition-all border-b-2 ${
                  activeTab === "search"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                Search
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-4 px-2 font-medium transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === "history"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <Clock className="w-4 h-4" />
                History
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "search" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar - Search Form */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24">
                <SearchForm onSearch={handleSearch} isLoading={isLoading} />
              </div>
            </aside>

            {/* Main Content - Results */}
            <section className="lg:col-span-2">
              <JobsList
                jobs={jobs}
                isLoading={isLoading}
                error={error as string}
                totalJobs={totalJobs}
              />
            </section>
          </div>
        ) : (
          /* History Tab */
          <div className="max-w-4xl mx-auto">
            <HistoryTab />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            LinkedIn Job Scraper © 2025 |{" "}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              GitHub
            </a>
          </p>
        </div>
      </footer>

      {/* AI Chat Bot */}
      <ChatBot currentJobs={jobs} searchHistory={history} />
    </div>
  );
}


