import { useState } from 'react'
import type { Job } from '../../types'

function formatDate(dateString: string | undefined): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('de-DE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    minute: '2-digit',
    hour: '2-digit',
  })
}

function getEvaluationColor(evaluation: Job['evaluation']): string {
  switch (evaluation) {
    case 'perfect': return '#22c55e'
    case 'good': return '#3b82f6'
    case 'maybe': return '#f59e0b'
    case 'skip': return '#6b7280'
    default: return '#d3d3d3'
  }
}

export type JobCardProps = {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-gray-800 dark:bg-gray-800 light:bg-white rounded-xl p-5 border border-gray-700 light:border-gray-200">
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <span
          className="px-3 py-1 rounded-xl text-xs font-semibold uppercase text-white"
          style={{ backgroundColor: getEvaluationColor(job.evaluation) }}
        >
          {job.evaluation}
        </span>
        <span className="font-semibold text-gray-200 light:text-gray-800">{job.company}</span>
        <span className="text-gray-400 text-sm ml-auto">Found {formatDate(job.createdAt)}</span>
      </div>

      <h3 className="m-0 mb-3 text-lg leading-snug">
        <a
          href={job.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 no-underline hover:underline"
        >
          {job.title}
        </a>
      </h3>

      {job.skipReason && job.skipReason !== "None" && (
        <p className="text-gray-400 text-sm m-0 mb-3">
          {job.evaluation === "skip" ? "Skip Reason" : "Note"}: {job.skipReason}
        </p>
      )}

      <div>
        <p
          className={`m-0 text-gray-300 light:text-gray-600 text-sm leading-relaxed ${
            expanded ? 'whitespace-pre-wrap' : 'line-clamp-3'
          }`}
        >
          {job.description}
        </p>
        {job.description && job.description.length > 200 && (
          <button
            className="bg-transparent border-none text-blue-400 cursor-pointer py-2 px-0 text-sm hover:underline"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    </div>
  )
}
