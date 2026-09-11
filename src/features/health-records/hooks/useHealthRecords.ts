import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { healthRecordsApi, RecordFilters } from '../api/healthRecordsApi';
import { GroupedRecordsResponse } from '../api/healthRecordsApi';
import { PaginatedResponse } from '../../../shared/types/api';
import { HealthRecord } from '../../../mocks/generators/healthRecords';

export const recordsKeys = {
  all: ['health-records'] as const,
  list: (filters: RecordFilters) => [...recordsKeys.all, 'list', filters] as const,
  detail: (id: string) => [...recordsKeys.all, 'detail', id] as const,
};

export function useHealthRecords(filters: RecordFilters) {
  const isGrouped = filters.groupBy && filters.groupBy !== 'none';

  return useQuery({
    queryKey: recordsKeys.list(filters),
    queryFn: () => healthRecordsApi.getRecords(filters),
    staleTime: 5 * 60 * 1000,
    select: (data) => {
      if (isGrouped) return data as GroupedRecordsResponse;
      return data as PaginatedResponse<HealthRecord>;
    },
  });
}

export function useHealthRecordsInfinite(filters: Omit<RecordFilters, 'groupBy'>) {
  return useInfiniteQuery({
    queryKey: [...recordsKeys.list({ ...filters, groupBy: 'none' }), 'infinite'],
    queryFn: ({ pageParam = 0 }) =>
      healthRecordsApi.getRecords({
        ...filters,
        groupBy: 'none',
        page: pageParam,
        pageSize: 30,
      }) as Promise<PaginatedResponse<HealthRecord>>,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useHealthRecord(id: string) {
  return useQuery({
    queryKey: recordsKeys.detail(id),
    queryFn: () => healthRecordsApi.getRecord(id),
    enabled: !!id,
  });
}
