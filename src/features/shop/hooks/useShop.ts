import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/useRedux';
import { fetchProducts, fetchProduct, setFilters } from '../store/productsSlice';
import { ProductFilters } from '../api/shopApi';
import { RootState } from '../../../app/store';

export function useProducts(filters: ProductFilters) {
  const dispatch = useAppDispatch();
  const { items, loading, error, hasMore, page } = useAppSelector((s: RootState) => s.products);

  useEffect(() => {
    dispatch(setFilters(filters));
    dispatch(fetchProducts({ filters, page: 0 }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const fetchNextPage = useCallback(() => {
    if (hasMore && !loading) {
      dispatch(fetchProducts({ filters, page: page + 1 }));
    }
  }, [dispatch, filters, hasMore, loading, page]);

  return { data: items, isLoading: loading, isError: !!error, hasMore, fetchNextPage, refetch: () => dispatch(fetchProducts({ filters, page: 0 })) };
}

export function useProduct(id: string) {
  const dispatch = useAppDispatch();
  const { selectedProduct, selectedProductLoading } = useAppSelector((s: RootState) => s.products);

  useEffect(() => {
    if (id) dispatch(fetchProduct(id));
  }, [dispatch, id]);

  return { data: selectedProduct, isLoading: selectedProductLoading };
}
