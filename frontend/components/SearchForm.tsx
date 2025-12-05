"use client";

import { useState, useMemo } from "react";
import { SearchParams, COUNTRIES, DATE_POSTED_OPTIONS, EXPERIENCE_LEVELS, WORKPLACE_TYPES } from "@/lib/types";
import { Search, Loader2, X } from "lucide-react";

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
}

export function SearchForm({ onSearch, isLoading = false }: SearchFormProps) {
  const [keyword, setKeyword] = useState("junior developer");
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["Belgium"]);
  const [datePosted, setDatePosted] = useState<"any" | "24h" | "week" | "month">("24h");
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedWorkplace, setSelectedWorkplace] = useState<string[]>(["2", "3"]);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Filter countries based on search input
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES;
    return COUNTRIES.filter((country) =>
      country.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  const handleCountryToggle = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]
    );
  };

  const handleExperienceToggle = (level: string) => {
    setSelectedExperience((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const handleWorkplaceToggle = (type: string) => {
    setSelectedWorkplace((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCountries.length === 0) {
      alert("Please select at least one country");
      return;
    }

    onSearch({
      job_keyword: keyword,
      countries: selectedCountries,
      date_posted: datePosted,
      experience_levels: selectedExperience,
      workplace_types: selectedWorkplace,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
      {/* Keyword Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Job Keyword
        </label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="e.g. Python Developer, Data Scientist..."
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Countries with Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Countries ({selectedCountries.length})
        </label>

        {/* Selected Countries Tags */}
        {selectedCountries.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedCountries.map((country) => (
              <div
                key={country}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
              >
                <span>{country}</span>
                <button
                  type="button"
                  onClick={() => handleCountryToggle(country)}
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Country Search Input */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={countrySearch}
              onChange={(e) => {
                setCountrySearch(e.target.value);
                setShowCountryDropdown(true);
              }}
              onFocus={() => setShowCountryDropdown(!showCountryDropdown)}
              placeholder="Search countries..."
              className="w-full px-4 py-2 pl-10 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Dropdown List */}
          {showCountryDropdown && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-lg max-h-64 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <label
                    key={country}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCountries.includes(country)}
                      onChange={() => handleCountryToggle(country)}
                      className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{country}</span>
                  </label>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                  No countries found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Date Posted */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Posted Date
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {DATE_POSTED_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDatePosted(option.value as any)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                datePosted === option.value
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Levels */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Experience Level (Optional)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {EXPERIENCE_LEVELS.map((level) => (
            <label
              key={level.value}
              className="flex items-center gap-2 p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedExperience.includes(level.value)}
                onChange={() => handleExperienceToggle(level.value)}
                className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{level.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Workplace Types */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Workplace Type ({selectedWorkplace.length})
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {WORKPLACE_TYPES.map((type) => (
            <label
              key={type.value}
              className="flex items-center gap-2 p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedWorkplace.includes(type.value)}
                onChange={() => handleWorkplaceToggle(type.value)}
                className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLoading ? "Searching..." : "Search Jobs"}
      </button>
    </form>
  );
}
