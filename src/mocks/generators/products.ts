import { generateId, pickFrom, seededRandom } from '../../shared/utils/seededRandom';
import { PRODUCT_CATEGORIES, PRODUCT_COUNT } from '../constants';

export type SortOption = 'price_asc' | 'price_desc' | 'rating' | 'name';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  imageUrl: string;
  tags: string[];
}

const PRODUCT_PREFIXES = ['Organic', 'Pure', 'Himalayan', 'Traditional', 'Premium', 'Ayur'];
const PRODUCT_NAMES = [
  'Ashwagandha', 'Triphala', 'Brahmi', 'Neem', 'Turmeric', 'Shatavari',
  'Amla', 'Giloy', 'Tulsi', 'Moringa', 'Ghee', 'Chyawanprash',
];

export function generateProduct(index: number): Product {
  const seed = index + 1;
  const prefix = pickFrom(PRODUCT_PREFIXES, seed);
  const baseName = pickFrom(PRODUCT_NAMES, seed * 5);
  const category = pickFrom(PRODUCT_CATEGORIES, seed * 7);
  const price = Math.floor(99 + seededRandom(seed * 11) * 2000);
  const discount = seededRandom(seed * 13) > 0.6 ? 0.1 + seededRandom(seed * 17) * 0.3 : 0;
  const originalPrice = Math.floor(price / (1 - discount));
  const rating = Math.round((3 + seededRandom(seed * 19) * 2) * 10) / 10;
  const reviewCount = Math.floor(seededRandom(seed * 23) * 500);

  return {
    id: generateId('prod', index),
    name: `${prefix} ${baseName}`,
    description: `Authentic Ayurvedic ${baseName.toLowerCase()} for holistic wellness and balance.`,
    price,
    originalPrice,
    category,
    rating,
    reviewCount,
    inStock: seededRandom(seed * 29) > 0.05,
    imageUrl: `https://picsum.photos/seed/${index}/400/400`,
    tags: [category, prefix, baseName],
  };
}

export function productMatchesSearch(product: Product, query: string): boolean {
  const q = query.toLowerCase();
  return (
    product.name.toLowerCase().includes(q) ||
    product.category.toLowerCase().includes(q) ||
    product.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  switch (sort) {
    case 'price_asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

export function isValidProductIndex(index: number): boolean {
  return index >= 0 && index < PRODUCT_COUNT;
}

export function getProductIndex(id: string): number {
  return parseInt(id.replace('prod-', ''), 10);
}
