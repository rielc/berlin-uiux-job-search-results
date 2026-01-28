export interface Job {
  id?: string
  link: string
  title: string
  company: string
  description: string
  evaluation: 'perfect' | 'good' | 'maybe' | 'skip' | ''
  skipReason?: string
  createdAt: string
}

export type EvaluationFilter = 'none' | 'perfect' | 'good' | 'maybe' | 'skip'

export type FilterState = Record<EvaluationFilter, boolean>
