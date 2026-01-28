import { useState, useEffect, useCallback, useRef } from 'react'
import type { Job, EvaluationFilter, FilterState } from './types'
import { useJobTracker } from './hooks/use-job-tracker'
import { JobCard } from './components/react/job-card'

const API_URL = 'https://flow.gabrielcredico.de/webhook/berlin-ui-ux-job-feed'
const POLL_INTERVAL = 15 * 60 * 1000 // 15 minutes

const FILTER_COLORS: Record<EvaluationFilter, string> = {
  none: '#9333ea',
  perfect: '#22c55e',
  good: '#3b82f6',
  maybe: '#f59e0b',
  skip: '#6b7280',
}

export function App() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    none: true,
    perfect: true,
    good: true,
    maybe: true,
    skip: false,
  })
  const isFirstLoad = useRef(true)

  // Track jobs and send notifications for new ones
  useJobTracker(jobs, isFirstLoad.current)

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Failed to fetch jobs')
      const data: Job[] = await response.json()
      // Deduplicate jobs by link
      const seen = new Set<string>()
      const uniqueJobs = data.filter(job => {
        if (!job.link || seen.has(job.link)) return false
        seen.add(job.link)
        return true
      })
      setJobs(uniqueJobs)
      setLastUpdated(new Date())
      setError(null)
      isFirstLoad.current = false
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchJobs])

  const toggleFilter = (key: EvaluationFilter) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredJobs = jobs.filter(job => {
    const eval_ = job.evaluation
    if (!eval_) return filters.none
    return filters[eval_ as EvaluationFilter] ?? false
  })

  const counts: Record<EvaluationFilter, number> = {
    none: jobs.filter(j => !j.evaluation).length,
    perfect: jobs.filter(j => j.evaluation === 'perfect').length,
    good: jobs.filter(j => j.evaluation === 'good').length,
    maybe: jobs.filter(j => j.evaluation === 'maybe').length,
    skip: jobs.filter(j => j.evaluation === 'skip').length,
  }

  const filterLabels: Record<EvaluationFilter, string> = {
    none: 'No Evaluation',
    perfect: 'Perfect',
    good: 'Good',
    maybe: 'Maybe',
    skip: 'Skip',
  }

  return (
    <div className="max-w-225 mx-auto p-4">
      <header className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="m-0 text-2xl">Latest UI/UX Jobs in Berlin</h1>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-gray-500 text-sm">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            className="py-2 px-4 bg-blue-500 text-white border-none rounded-md cursor-pointer text-sm hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed"
            onClick={fetchJobs}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </header>

      <div className="flex gap-2 mb-6 flex-wrap items-center">
        {(Object.keys(filters) as EvaluationFilter[]).map(key => (
          <button
            key={key}
            className={`py-2 px-4 border rounded-full cursor-pointer text-sm capitalize transition-all ${
              filters[key]
                ? 'text-white border-transparent'
                : 'bg-transparent border-gray-700 light:border-gray-300 hover:border-gray-500'
            }`}
            style={filters[key] ? { backgroundColor: FILTER_COLORS[key] } : {}}
            onClick={() => toggleFilter(key)}
          >
            {filterLabels[key]} ({counts[key]})
          </button>
        ))}
        <span className="ml-auto text-gray-400 text-sm">Showing {filteredJobs.length} of {jobs.length}</span>
      </div>

      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4">
          Error: {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {filteredJobs.map((job, index) => (
          <JobCard key={job.id ?? job.link ?? index} job={job} />
        ))}
        {!loading && filteredJobs.length === 0 && (
          <p className="text-center text-gray-500 py-8">No jobs found</p>
        )}
      </div>
    </div>
  )
}
