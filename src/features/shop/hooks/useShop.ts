import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { shopApi, ProductFilters } from '../api/shopApi';

export const shopKeys = {
  all: ['shop'] as const,
  products: (filters: ProductFilters) => [...shopKeys.all, 'products', filters] as const,
  product: (id: string) => [...shopKeys.all, 'product', id] as const,
};

export function useProducts(filters: ProductFilters) {
  return useInfiniteQuery({
    queryKey: shopKeys.products(filters),
    queryFn: ({ pageParam = 0 }) =>
      shopApi.getProducts({ ...filters, page: pageParam, pageSize: 20 }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: shopKeys.product(id),
    queryFn: () => shopApi.getProduct(id),
    enabled: !!id,
  });
}
