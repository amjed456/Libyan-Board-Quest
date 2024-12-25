export interface Product {
  id: string
  name: string
  price: number
  image_url?: string
  description?: string
}

export interface MainContent {
  id: string
  big_title: string
  paragraph: string
  button_text: string
  hero_image?: string
  created_at?: string
} 