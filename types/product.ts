export interface Product {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  type: string;
  featured: boolean;
  price: number;
  isFree: boolean;
  description: string;
  features?: string[];
  image: string;
  rating: number;
  reviews: number;
  releaseDate: string;
  lastUpdate: string;
  downloads: number;
  views: number;
  videoUrl?: string;
  category: string;
}
