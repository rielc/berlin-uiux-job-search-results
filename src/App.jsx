import { useState, useEffect, useCallback } from 'react'
import './App.css'

const API_URL = 'https://flow.gabrielcredico.de/webhook/berlin-ui-ux-job-feed'
const POLL_INTERVAL = 5 * 60 * 1000 // 5 minutes

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('de-DE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    minute: '2-digit',
    hour: '2-digit',
  })
}

function getEvaluationColor(evaluation) {
  switch (evaluation) {
    case 'perfect': return '#22c55e'
    case 'good': return '#3b82f6'
    case 'maybe': return '#f59e0b'
    case 'skip': return '#6b7280'
    default: return '#d3d3d3'
  }
}

function JobCard({ job }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="job-card">
      <div className="job-header">
        <span
          className="evaluation-badge"
          style={{ backgroundColor: getEvaluationColor(job.evaluation) }}
        >
          {job.evaluation}
        </span>
        <span className="company">{job.company}</span>
        <span className="posted-date">Found {formatDate(job.createdAt)}</span>
      </div>

      <h3 className="job-title">
        <a href={job.link} target="_blank" rel="noopener noreferrer">
          {job.title}
        </a>
      </h3>

      {job.skipReason && job.skipReason !== "None" && (
        <p className="skip-reason">{job.evaluation === "skip" ? "Skip Reason" :  "Note"}: {job.skipReason}</p>
      )}

      <div className="job-description">
        <p className={expanded ? 'expanded' : 'collapsed'}>
          {job.description}
        </p>
        {job.description && job.description.length > 200 && (
          <button
            className="toggle-btn"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    </div>
  )
}

const FILTER_COLORS = {
  none: '#9333ea',
  perfect: '#22c55e',
  good: '#3b82f6',
  maybe: '#f59e0b',
  skip: '#6b7280',
}

function App() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [filters, setFilters] = useState({
    none: true,
    perfect: true,
    good: true,
    maybe: true,
    skip: false,
  })

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Failed to fetch jobs')
      const data = await response.json()
      // Deduplicate jobs by link
      const seen = new Set()
      const uniqueJobs = data.filter(job => {
        if (!job.link || seen.has(job.link)) return false
        seen.add(job.link)
        return true
      })
      setJobs(uniqueJobs)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchJobs])

  const toggleFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredJobs = jobs.filter(job => {
    const eval_ = job.evaluation
    if (!eval_ || eval_ === '') return filters.none
    return filters[eval_] ?? false
  })

  const counts = {
    none: jobs.filter(j => !j.evaluation || j.evaluation === '').length,
    perfect: jobs.filter(j => j.evaluation === 'perfect').length,
    good: jobs.filter(j => j.evaluation === 'good').length,
    maybe: jobs.filter(j => j.evaluation === 'maybe').length,
    skip: jobs.filter(j => j.evaluation === 'skip').length,
  }

  const filterLabels = {
    none: 'No Evaluation',
    perfect: 'Perfect',
    good: 'Good',
    maybe: 'Maybe',
    skip: 'Skip',
  }

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Job Dashboard</h1>
        <div className="header-info">
          {lastUpdated && (
            <span className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button className="refresh-btn" onClick={fetchJobs} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </header>

      <div className="filters">
        {Object.keys(filters).map(key => (
          <button
            key={key}
            className={`filter-btn ${filters[key] ? 'active' : ''}`}
            style={filters[key] ? { backgroundColor: FILTER_COLORS[key] } : {}}
            onClick={() => toggleFilter(key)}
          >
            {filterLabels[key]} ({counts[key]})
          </button>
        ))}
        <span className="filter-count">Showing {filteredJobs.length} of {jobs.length}</span>
      </div>

      {error && <div className="error">Error: {error}</div>}

      <div className="jobs-list">
        {filteredJobs.map((job, index) => (
          <JobCard key={job.id ?? job.link ?? index} job={job} />
        ))}
        {!loading && filteredJobs.length === 0 && (
          <p className="no-jobs">No jobs found</p>
        )}
      </div>
    </div>
  )
}

export default App
