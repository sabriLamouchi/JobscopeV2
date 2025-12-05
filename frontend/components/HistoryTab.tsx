"use client";

import { useState, useEffect } from "react";
import { SearchHistory } from "@/lib/types";
import { historyService } from "@/lib/services/historyService";
import { JobCard } from "./JobCard";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";

export function HistoryTab() {
  const [historyItems, setHistoryItems] = useState<SearchHistory[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load history from localStorage
    const history = historyService.getHistory();
    setHistoryItems(history);
    setIsLoading(false);
  }, []);

  const handleDelete = (id: string) => {
    historyService.deleteSearch(id);
    setHistoryItems(historyItems.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to delete all search history?")) {
      historyService.clearHistory();
      setHistoryItems([]);
      setExpandedId(null);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-500 dark:text-zinc-400">Loading history...</div>
      </div>
    );
  }

  if (historyItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            No search history yet
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Your search history will appear here. Start searching for jobs to build your history!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Clear All Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Search History ({historyItems.length})
        </h2>
        <button
          onClick={handleClearAll}
          className="text-xs px-3 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* History Items */}
      <div className="space-y-3">
        {historyItems.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {item.searchParams.job_keyword || "All jobs"}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full whitespace-nowrap">
                      {item.totalJobs} jobs
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {/* Countries */}
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      📍 {item.searchParams.countries.join(", ")}
                    </div>
                  </div>

                  {/* Search Filters Summary */}
                  <div className="flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-500">
                    {item.searchParams.date_posted && item.searchParams.date_posted !== "any" && (
                      <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">
                        Posted: {item.searchParams.date_posted}
                      </span>
                    )}
                    {item.searchParams.experience_levels && item.searchParams.experience_levels.length > 0 && (
                      <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">
                        Levels: {item.searchParams.experience_levels.length}
                      </span>
                    )}
                    {item.searchParams.workplace_types && item.searchParams.workplace_types.length > 0 && (
                      <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">
                        Types: {item.searchParams.workplace_types.length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Date and Actions */}
                <div className="flex flex-col items-end gap-2">
                  <time className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {historyService.getRelativeTime(item.dateAdded)}
                  </time>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete this search"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expand/Collapse Button */}
              {item.jobs.length > 0 && (
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                >
                  {expandedId === item.id ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide Jobs
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show {item.jobs.length} Jobs
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Jobs List */}
            {expandedId === item.id && item.jobs.length > 0 && (
              <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {item.jobs.map((job, idx) => (
                    <div key={idx} className="scale-95 origin-top-left">
                      <JobCard job={job} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
