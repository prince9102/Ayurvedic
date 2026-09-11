import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking } from '../../../mocks/generators/doctors';

interface BookingState {
  pendingBookings: Booking[];
  addPendingBooking: (booking: Booking) => void;
  removePendingBooking: (id: string) => void;
  clearPending: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      pendingBookings: [],

      addPendingBooking: (booking) => {
        set({ pendingBookings: [...get().pendingBookings, booking] });
      },

      removePendingBooking: (id) => {
        set({ pendingBookings: get().pendingBookings.filter((b) => b.id !== id) });
      },

      clearPending: () => set({ pendingBookings: [] }),
    }),
    {
      name: 'ayurvedic-pending-bookings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
