import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/useRedux';
import { fetchHealthRecords, fetchHealthRecord, setFilters } from '../store/healthRecordsSlice';
import { RecordFilters } from '../api/healthRecordsApi';
import { RootState } from '../../../app/store';

export function useHealthRecordsInfinite(filters: RecordFilters) {
  const dispatch = useAppDispatch();
  const { items, loading, error, hasMore, page } = useAppSelector((s: RootState) => s.healthRecords);

  useEffect(() => {
    dispatch(setFilters(filters));
    dispatch(fetchHealthRecords({ filters, page: 0 }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const fetchNextPage = useCallback(() => {
    if (hasMore && !loading) {
      dispatch(fetchHealthRecords({ filters, page: page + 1 }));
    }
  }, [dispatch, filters, hasMore, loading, page]);

  return { data: items, isLoading: loading, isError: !!error, hasMore, fetchNextPage, refetch: () => dispatch(fetchHealthRecords({ filters, page: 0 })) };
}

export function useHealthRecord(id: string) {
  const dispatch = useAppDispatch();
  const { selectedRecord, selectedRecordLoading } = useAppSelector((s: RootState) => s.healthRecords);

  useEffect(() => {
    if (id) dispatch(fetchHealthRecord(id));
  }, [dispatch, id]);

  return { data: selectedRecord, isLoading: selectedRecordLoading };
}
