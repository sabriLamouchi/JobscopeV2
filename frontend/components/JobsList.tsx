"use client";

import { Job } from "@/lib/types";
import { JobCard } from "./JobCard";
import { AlertCircle, Briefcase } from "lucide-react";

interface JobsListProps {
  jobs: Job[];
  isLoading?: boolean;
  error?: string;
  totalJobs?: number;
}

export function JobsList({ jobs, isLoading = false, error, totalJobs }: JobsListProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        <div>
          <h3 className="font-semibold text-red-900 dark:text-red-100">Error</h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-zinc-600 dark:text-zinc-400">Searching for jobs...</p>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <Briefcase className="w-8 h-8 text-zinc-400" />
        <div className="text-center">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">No jobs found</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Try adjusting your search criteria
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Jobs Found
        </h2>
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
          {totalJobs || jobs.length}
        </span>
      </div>
      <div className="grid gap-4">
        {jobs.map((job, index) => (
          <JobCard key={`${job.job_url}-${index}`} job={job} />
        ))}
      </div>
    </div>
  );
}
