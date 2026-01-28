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

export function JobCard({ job, isNew = false }: JobCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "rounded-xl p-5 border",
        isNew
          ? "bg-green-400/10 border-green-500/50"
          : "bg-gray-400/10 border-gray-500/50",
      )}
    >
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        {isNew && (
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
        )}
        <span
          className={cn("text-gray-800", isNew ? "font-bold" : "font-semibold")}
        >
          {job.company}
        </span>
        <span className="text-gray-800 text-sm ml-auto">
          Found: {formatDate(job.createdAt)}
        </span>
      </div>

      <h3 className={cn("m-0 mb-3 text-lg leading-snug", isNew && "font-bold")}>
        <a
          href={job.link}
          target="_blank"
          rel="noopener noreferrer"
          className="uppercase text-blue-800 no-underline hover:underline"
        >
          {job.title}
        </a>
      </h3>

      <div>
        <p
          className={cn(
            "m-0 text-gray-800 text-sm leading-relaxed",
            expanded ? "whitespace-pre-wrap" : "line-clamp-3",
          )}
        >
          {job.description}
        </p>
      </div>
    </div>
  );
}
