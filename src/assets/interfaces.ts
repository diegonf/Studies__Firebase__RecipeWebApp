
export interface Recipe {
  name: string
  category: string
  directions: string
  publishDate: Date
  isPublished: boolean
  ingredients: string[]
  imageUrl: string
  id?: string
}

export interface Query {
  field: string,
  condition: string,
  value: any
}