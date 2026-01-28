import { useState } from "react";
import type { Job } from "../../types";
import { cn } from "../../utils/cn";

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("de-DE", {
    month: "short",
    day: "numeric",
    year: "numeric",
    minute: "2-digit",
    hour: "2-digit",
  });
}

export type JobCardProps = {
  job: Job;
  isNew?: boolean;
};

export function JobCard({ job, isNew }: JobCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-5 border",
        isNew
          ? "bg-green-300/10 border-green-500/50 border"
          : "bg-gray-100 border-gray-200",
      )}
    >
      <div className="flex flex-col items-start gap-1 flex-wrap mb-3">
        <span className="text-gray-800 text-sm flex flex-row items-center gap-3">
          {isNew && (
            <span className="w-2.5 h-2.5 rounded-full bg-green-600 animate-pulse" />
          )}
          Found: {formatDate(job.createdAt)}
        </span>

        <span className={cn("text-gray-800", "font-normal")}>
          {job.company}
        </span>
        <h3
          className={cn("m-0 mb-3 text-lg leading-snug", isNew && "font-bold")}
        >
          <a
            href={job.link}
            target="_blank"
            rel="noopener noreferrer"
            className="uppercase text-blue-800 underline underline-offset-2"
          >
            {job.title}
          </a>
        </h3>
      </div>

      <div>
        <p
          className={cn(
            "m-0 text-gray-600 text-sm leading-relaxed",
            "line-clamp-5",
          )}
        >
          {job.description}
        </p>
      </div>
    </div>
  );
}
