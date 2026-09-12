import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { healthRecordsApi, RecordFilters } from '../api/healthRecordsApi';
import { HealthRecord } from '../../../mocks/generators/healthRecords';

interface HealthRecordsState {
  items: HealthRecord[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  filters: RecordFilters;

  selectedRecord: HealthRecord | null;
  selectedRecordLoading: boolean;
}

const initialState: HealthRecordsState = {
  items: [],
  page: 0,
  hasMore: true,
  loading: false,
  error: null,
  filters: {},

  selectedRecord: null,
  selectedRecordLoading: false,
};

export const fetchHealthRecords = createAsyncThunk(
  'healthRecords/fetchHealthRecords',
  async ({ filters, page }: { filters: RecordFilters; page: number }) => {
    const result = await healthRecordsApi.getRecords({ ...filters, groupBy: 'none', page, pageSize: 30 });
    return result as { data: HealthRecord[]; page: number; hasMore: boolean };
  },
);

export const fetchHealthRecord = createAsyncThunk(
  'healthRecords/fetchHealthRecord',
  async (id: string) => healthRecordsApi.getRecord(id),
);

const healthRecordsSlice = createSlice({
  name: 'healthRecords',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<RecordFilters>) {
      state.filters = action.payload;
      state.items = [];
      state.page = 0;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHealthRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHealthRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.meta.arg.page === 0
          ? action.payload.data
          : [...state.items, ...action.payload.data];
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchHealthRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch records';
      })

      .addCase(fetchHealthRecord.pending, (state) => { state.selectedRecordLoading = true; })
      .addCase(fetchHealthRecord.fulfilled, (state, action) => {
        state.selectedRecordLoading = false;
        state.selectedRecord = action.payload;
      })
      .addCase(fetchHealthRecord.rejected, (state) => { state.selectedRecordLoading = false; });
  },
});

export const { setFilters } = healthRecordsSlice.actions;
export default healthRecordsSlice.reducer;
