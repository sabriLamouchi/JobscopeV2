"use client";

import { Job } from "@/lib/types";
import { ExternalLink, Building2, MapPin, Clock } from "lucide-react";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <div className="border border-zinc-200 rounded-lg p-6 hover:shadow-md transition-shadow dark:border-zinc-800 dark:hover:bg-zinc-900/50">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <a
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 group"
            >
              {job.job_title}
              <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              <Building2 className="w-4 h-4" />
              <a
                href={job.company_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {job.company_name}
              </a>
            </div>
          </div>
          <div className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-700 dark:text-zinc-300">
            {job.country}
          </div>
        </div>

        {/* Location and Date */}
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>{job.posted}</span>
          </div>
        </div>

        {/* Benefits */}
        {job.benefit && (
          <div className="text-sm text-zinc-600 dark:text-zinc-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded border border-green-200 dark:border-green-900/30">
            ✓ {job.benefit}
          </div>
        )}

        {/* Job Description Preview */}
        {job.job_description && (
          <div className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
            <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Job Description:
            </p>
            <p>{job.job_description}</p>
          </div>
        )}

        {/* Company Description Preview */}
        {job.company_description && (
          <div className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 border-l-2 border-zinc-300 dark:border-zinc-700 pl-3">
            <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              About Company:
            </p>
            <p>{job.company_description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
