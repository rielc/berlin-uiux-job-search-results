import { useState, useEffect, useCallback, useRef } from "react";
import type { Job } from "./types";
import { useSeenJobs } from "./hooks/use-seen-jobs";
import { JobCard } from "./components/react/job-card";

const API_URL = "https://flow.gabrielcredico.de/webhook/berlin-ui-ux-job-feed";
const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

const KEEPWORDS = [
  "UI",
  "UX",
  "User Interface",
  "User Experience",
  "Designer",
  "Design",
  "Product Designer",
  "UI/UX",
  "UX/UI",
  "IxD",
  "Service Designer",
  "Web Designer",
  "Visual Designer",
  "Interaction Designer",
  "UX Researcher",
  "UX Architect",
  "UX Strategist",
];

const STOPWORDS = [
  "Frontend",
  // "Engineer",
  "Developer",
  "Entwickler",
  "Tech Lead",
  "Technical Lead",
  "Full Stack",
  "Fullstack",
  // "IT Consultant",
  // "Customer Support",
  // "VP of",
];

export function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isFirstLoad = useRef(true);

  // Track seen/unseen jobs for highlighting
  const { isJobNew, unseenCount, markAllAsSeen } = useSeenJobs(jobs);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch jobs");
      const data: Job[] = await response.json();
      // Deduplicate jobs by link
      const seen = new Set<string>();
      const uniqueJobs = data.filter((job) => {
        if (!job.link || seen.has(job.link)) return false;
        seen.add(job.link);
        return true;
      });
      setJobs(uniqueJobs);
      setLastUpdated(new Date());
      setError(null);
      isFirstLoad.current = false;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  const filteredJobs = jobs.filter((job) => {
    const titleLower = job.title.toLowerCase();

    const containsKeepword = KEEPWORDS.some((word) =>
      titleLower.includes(word.toLowerCase()),
    );
    const containsStopword = STOPWORDS.some((word) =>
      titleLower.includes(word.toLowerCase()),
    );

    return containsKeepword && !containsStopword;
  });

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
        </div>
      </header>

      <div className="mb-6 flex items-center gap-4">
        <span className="text-gray-400 text-sm">
          Showing {filteredJobs.length} jobs
        </span>
        {unseenCount > 0 && (
          <button
            className="py-1.5 px-3 bg-green-600 text-white border-none rounded-md cursor-pointer text-sm hover:bg-green-700"
            onClick={markAllAsSeen}
          >
            Mark All New Jobs as Read
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4">
          Error: {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {filteredJobs.map((job, index) => (
          <JobCard
            key={job.id ?? job.link ?? index}
            job={job}
            isNew={isJobNew(job)}
          />
        ))}
        {!loading && filteredJobs.length === 0 && (
          <p className="text-center text-gray-500 py-8">No jobs found</p>
        )}
      </div>
    </div>
  );
}
