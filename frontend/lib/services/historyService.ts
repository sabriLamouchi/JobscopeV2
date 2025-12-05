import { SearchHistory, SearchParams, Job } from "@/lib/types";

const HISTORY_STORAGE_KEY = "job_search_history";
const MAX_HISTORY_ITEMS = 50;

export const historyService = {
  // Add a new search to history
  addSearch(searchParams: SearchParams, jobs: Job[], totalJobs: number, timestamp: string): SearchHistory {
    const history = this.getHistory();
    
    const newEntry: SearchHistory = {
      id: Date.now().toString(),
      searchParams,
      jobs,
      totalJobs,
      timestamp,
      dateAdded: new Date(),
    };

    // Add to the beginning of the array
    history.unshift(newEntry);

    // Keep only the last MAX_HISTORY_ITEMS entries
    if (history.length > MAX_HISTORY_ITEMS) {
      history.pop();
    }

    this.saveHistory(history);
    return newEntry;
  },

  // Get all search history
  getHistory(): SearchHistory[] {
    if (typeof window === "undefined") return [];
    
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      // Convert dateAdded strings back to Date objects
      return parsed.map((item: any) => ({
        ...item,
        dateAdded: new Date(item.dateAdded),
      }));
    } catch (error) {
      console.error("Error reading history from localStorage:", error);
      return [];
    }
  },

  // Get a specific search from history by ID
  getSearchById(id: string): SearchHistory | null {
    const history = this.getHistory();
    return history.find((item) => item.id === id) || null;
  },

  // Delete a specific search from history
  deleteSearch(id: string): void {
    const history = this.getHistory();
    const filtered = history.filter((item) => item.id !== id);
    this.saveHistory(filtered);
  },

  // Clear all history
  clearHistory(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  },

  // Save history to localStorage
   saveHistory(history: SearchHistory[]): void {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Error saving history to localStorage:", error);
    }
  },

  // Format date for display
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  },

  // Get relative time (e.g., "2 hours ago")
  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return this.formatDate(date);
  },
};
