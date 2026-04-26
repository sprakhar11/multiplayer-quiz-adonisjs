export interface Option {
  id: number
  text: string
  order_index: number
}

export interface Question {
  id: number
  text: string
  order_index: number
  score_value: number
  options: Option[]
}

export interface Quiz {
  id: number
  title: string
  description: string
  category: string
  difficulty: string
  time_per_question: number
  created_at: string
  questions: Question[]
}
