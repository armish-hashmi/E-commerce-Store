// data/mockData.ts
import { Product, Category } from '@/types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Wireless Noise-Canceling Headphones',
    price: 299,
    originalPrice: 349,
    category: 'Electronics',
    rating: 4.8,
    reviewsCount: 124,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    description: 'Premium noise-canceling headphones with up to 30 hours of battery life and crystal-clear audio.',
    inStock: true,
    isFeatured: true,
  },
  {
    id: '2',
    name: 'Minimalist Leather Watch',
    price: 149,
    category: 'Accessories',
    rating: 4.6,
    reviewsCount: 88,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    description: 'Sleek quartz watch with genuine leather strap and water-resistant stainless steel casing.',
    inStock: true,
    isFeatured: true,
  },
  {
    id: '3',
    name: 'Smart Fitness Tracker',
    price: 89,
    category: 'Electronics',
    rating: 4.4,
    reviewsCount: 210,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500',
    description: 'Track heart rate, sleep quality, and daily activities with long-lasting battery life.',
    inStock: true,
    isFeatured: true,
  }
];

export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Electronics', itemCount: 120, image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500' },
  { id: '2', name: 'Accessories', itemCount: 85, image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500' },
  { id: '3', name: 'Furniture', itemCount: 45, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500' },
];