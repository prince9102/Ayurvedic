import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { consultationApi, DoctorFilters } from '../api/consultationApi';
import { Doctor, TimeSlot, Booking } from '../../../mocks/generators/doctors';

interface DoctorsState {
  items: Doctor[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  filters: DoctorFilters;

  selectedDoctor: Doctor | null;
  selectedDoctorLoading: boolean;

  slots: (TimeSlot & { isExpired: boolean })[];
  slotsLoading: boolean;

  bookings: Booking[];
  bookingsLoading: boolean;

  specialties: string[];
}

const initialState: DoctorsState = {
  items: [],
  page: 0,
  hasMore: true,
  loading: false,
  error: null,
  filters: {},

  selectedDoctor: null,
  selectedDoctorLoading: false,

  slots: [],
  slotsLoading: false,

  bookings: [],
  bookingsLoading: false,

  specialties: [],
};

export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async ({ filters, page }: { filters: DoctorFilters; page: number }) =>
    consultationApi.getDoctors({ ...filters, page, pageSize: 20 }),
);

export const fetchDoctor = createAsyncThunk(
  'doctors/fetchDoctor',
  async (id: string) => consultationApi.getDoctor(id),
);

export const fetchSlots = createAsyncThunk(
  'doctors/fetchSlots',
  async ({ doctorId, date }: { doctorId: string; date: string }) =>
    consultationApi.getSlots(doctorId, date),
);

export const fetchBookings = createAsyncThunk(
  'doctors/fetchBookings',
  async () => consultationApi.getBookings(),
);

export const fetchSpecialties = createAsyncThunk(
  'doctors/fetchSpecialties',
  async () => consultationApi.getSpecialties(),
);

export const createBooking = createAsyncThunk(
  'doctors/createBooking',
  async (params: { doctorId: string; slotId: string; startTime: string }) =>
    consultationApi.createBooking(params.doctorId, params.slotId, params.startTime),
);

export const cancelBooking = createAsyncThunk(
  'doctors/cancelBooking',
  async (bookingId: string) => consultationApi.cancelBooking(bookingId),
);

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<DoctorFilters>) {
      state.filters = action.payload;
      state.items = [];
      state.page = 0;
      state.hasMore = true;
    },
    addPendingBooking(state, action: PayloadAction<Booking>) {
      state.bookings.unshift(action.payload);
    },
    clearSlots(state) {
      state.slots = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.meta.arg.page === 0
          ? action.payload.data
          : [...state.items, ...action.payload.data];
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch doctors';
      })

      .addCase(fetchDoctor.pending, (state) => { state.selectedDoctorLoading = true; })
      .addCase(fetchDoctor.fulfilled, (state, action) => {
        state.selectedDoctorLoading = false;
        state.selectedDoctor = action.payload;
      })
      .addCase(fetchDoctor.rejected, (state) => { state.selectedDoctorLoading = false; })

      .addCase(fetchSlots.pending, (state) => { state.slotsLoading = true; })
      .addCase(fetchSlots.fulfilled, (state, action) => {
        state.slotsLoading = false;
        state.slots = action.payload;
      })
      .addCase(fetchSlots.rejected, (state) => { state.slotsLoading = false; })

      .addCase(fetchBookings.pending, (state) => { state.bookingsLoading = true; })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.bookingsLoading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state) => { state.bookingsLoading = false; })

      .addCase(fetchSpecialties.fulfilled, (state, action) => {
        state.specialties = action.payload;
      })

      .addCase(createBooking.fulfilled, (state, action) => {
        state.bookings.unshift(action.payload);
      })

      .addCase(cancelBooking.fulfilled, (state, action) => {
        const idx = state.bookings.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) state.bookings[idx] = action.payload;
      });
  },
});

export const { setFilters, addPendingBooking, clearSlots } = doctorsSlice.actions;
export default doctorsSlice.reducer;
