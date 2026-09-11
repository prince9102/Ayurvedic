import { apiClient } from '../../../core/api/client';
import { PaginatedResponse } from '../../../shared/types/api';
import { GroupBy, HealthRecord } from '../../../mocks/generators/healthRecords';

export interface RecordFilters {
  search?: string;
  types?: string[];
  tags?: string[];
  groupBy?: GroupBy;
  page?: number;
  pageSize?: number;
}

export interface GroupedRecordsResponse {
  grouped: Record<string, HealthRecord[]>;
  total: number;
}

export const healthRecordsApi = {
  getRecords: (filters: RecordFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.types?.length) params.set('types', filters.types.join(','));
    if (filters.tags?.length) params.set('tags', filters.tags.join(','));
    if (filters.groupBy) params.set('groupBy', filters.groupBy);
    if (filters.page !== undefined) params.set('page', String(filters.page));
    if (filters.pageSize !== undefined) params.set('pageSize', String(filters.pageSize));
    return apiClient<PaginatedResponse<HealthRecord> | GroupedRecordsResponse>(
      `/health-records?${params}`,
    );
  },

  getRecord: (id: string) => apiClient<HealthRecord>(`/health-records/${id}`),
};
