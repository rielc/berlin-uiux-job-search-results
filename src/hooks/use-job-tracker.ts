import { useEffect, useRef, useCallback } from 'react'
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification'
import { load, Store } from '@tauri-apps/plugin-store'
import type { Job } from '../types'

const SEEN_JOBS_KEY = 'seenJobLinks'

let store: Store | null = null

async function getStore(): Promise<Store> {
  if (!store) {
    store = await load('job-tracker.json')
  }
  return store
}

async function getSeenJobs(): Promise<Set<string>> {
  try {
    const store = await getStore()
    const seen = await store.get<string[]>(SEEN_JOBS_KEY)
    return new Set(seen || [])
  } catch {
    return new Set()
  }
}

async function saveSeenJobs(jobs: Set<string>): Promise<void> {
  try {
    const store = await getStore()
    await store.set(SEEN_JOBS_KEY, Array.from(jobs))
  } catch (err) {
    console.error('Failed to save seen jobs:', err)
  }
}

async function notifyNewJobs(newJobs: Job[]): Promise<void> {
  try {
    let permissionGranted = await isPermissionGranted()

    if (!permissionGranted) {
      const permission = await requestPermission()
      permissionGranted = permission === 'granted'
    }

    if (permissionGranted && newJobs.length > 0) {
      const title = newJobs.length === 1
        ? 'New Job Posted!'
        : `${newJobs.length} New Jobs Posted!`

      const body = newJobs.length === 1
        ? `${newJobs[0].title} at ${newJobs[0].company}`
        : newJobs.slice(0, 3).map(j => `${j.title} at ${j.company}`).join('\n')

      sendNotification({ title, body })
    }
  } catch (err) {
    console.error('Failed to send notification:', err)
  }
}

export function useJobTracker(jobs: Job[], isFirstLoad: boolean) {
  const hasInitialized = useRef(false)

  const checkForNewJobs = useCallback(async () => {
    if (jobs.length === 0) return

    const seenJobs = await getSeenJobs()
    const newJobs: Job[] = []

    for (const job of jobs) {
      if (job.link && !seenJobs.has(job.link)) {
        newJobs.push(job)
        seenJobs.add(job.link)
      }
    }

    // Save all current jobs as seen
    await saveSeenJobs(seenJobs)

    // Only notify if this isn't the first load (avoid notification spam on app open)
    if (!isFirstLoad && hasInitialized.current && newJobs.length > 0) {
      await notifyNewJobs(newJobs)
    }

    hasInitialized.current = true
  }, [jobs, isFirstLoad])

  useEffect(() => {
    checkForNewJobs()
  }, [checkForNewJobs])

  return { checkForNewJobs }
}
