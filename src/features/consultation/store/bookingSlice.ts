import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import { Booking } from '../../../mocks/generators/doctors';

interface BookingState {
  pendingBookings: Booking[];
}

const initialState: BookingState = {
  pendingBookings: [],
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    addPendingBooking(state, action: PayloadAction<Booking>) {
      state.pendingBookings.push(action.payload);
    },
  },
});

export const { addPendingBooking } = bookingSlice.actions;
export default bookingSlice.reducer;

export const selectPendingBookings = (state: RootState) => state.booking.pendingBookings;
