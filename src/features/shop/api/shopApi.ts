import { apiClient } from '../../../core/api/client';
import { PaginatedResponse } from '../../../shared/types/api';
import { Product, SortOption } from '../../../mocks/generators/products';

export interface ProductFilters {
  search?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export const shopApi = {
  getProducts: (filters: ProductFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.categories?.length) params.set('categories', filters.categories.join(','));
    if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
    if (filters.inStockOnly) params.set('inStockOnly', 'true');
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.page !== undefined) params.set('page', String(filters.page));
    if (filters.pageSize !== undefined) params.set('pageSize', String(filters.pageSize));
    return apiClient<PaginatedResponse<Product>>(`/products?${params}`);
  },

  getProduct: (id: string) => apiClient<Product>(`/products/${id}`),
};
