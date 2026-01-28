import { useEffect, useState, useCallback, useRef } from 'react'
import type { Job } from '../types'

const SEEN_JOBS_KEY = 'seenJobLinks'

function playNotificationSound(): void {
  try {
    const audio = new Audio('/notification.mp3')
    audio.volume = 0.5
    audio.play().catch((err) => {
      console.warn('Could not play notification sound:', err)
    })
  } catch (err) {
    console.warn('Could not create audio:', err)
  }
}

function getSeenJobsFromStorage(): Set<string> {
  try {
    const stored = localStorage.getItem(SEEN_JOBS_KEY)
    return new Set(stored ? JSON.parse(stored) : [])
  } catch {
    return new Set()
  }
}

function saveSeenJobsToStorage(jobs: Set<string>): void {
  try {
    localStorage.setItem(SEEN_JOBS_KEY, JSON.stringify(Array.from(jobs)))
  } catch (err) {
    console.error('Failed to save seen jobs:', err)
  }
}

export function useSeenJobs(jobs: Job[]) {
  const [unseenJobLinks, setUnseenJobLinks] = useState<Set<string>>(new Set())
  const seenJobsRef = useRef<Set<string>>(getSeenJobsFromStorage())
  const currentJobLinksRef = useRef<Set<string>>(new Set())
  const isFirstRender = useRef(true)
  const previousUnseenCount = useRef(0)

  // Update current job links whenever jobs change
  useEffect(() => {
    currentJobLinksRef.current = new Set(jobs.map((job) => job.link).filter(Boolean))
  }, [jobs])

  // Calculate unseen jobs when jobs change or on focus
  const calculateUnseen = useCallback((playSound = false) => {
    const seen = seenJobsRef.current
    const unseen = new Set<string>()

    for (const job of jobs) {
      if (job.link && !seen.has(job.link)) {
        unseen.add(job.link)
      }
    }

    // Play sound if there are new unseen jobs (more than before)
    if (playSound && unseen.size > previousUnseenCount.current) {
      playNotificationSound()
    }

    previousUnseenCount.current = unseen.size
    setUnseenJobLinks(unseen)
  }, [jobs])

  // Mark current jobs as seen
  const markAllAsSeen = useCallback(() => {
    const seen = seenJobsRef.current

    for (const link of currentJobLinksRef.current) {
      seen.add(link)
    }

    seenJobsRef.current = seen
    saveSeenJobsToStorage(seen)
    setUnseenJobLinks(new Set())
  }, [])


  // Calculate when jobs change - play sound only after first render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      calculateUnseen(false)
    } else {
      // Play sound when new jobs are found in background
      calculateUnseen(true)
    }
  }, [calculateUnseen])

  const isJobNew = useCallback(
    (job: Job): boolean => {
      return Boolean(job.link && unseenJobLinks.has(job.link))
    },
    [unseenJobLinks]
  )

  return { isJobNew, unseenCount: unseenJobLinks.size, markAllAsSeen }
}
