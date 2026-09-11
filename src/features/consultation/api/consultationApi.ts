import { apiClient } from '../../../core/api/client';
import { PaginatedResponse } from '../../../shared/types/api';
import { Booking, Doctor, TimeSlot } from '../../../mocks/generators/doctors';

export interface DoctorFilters {
  search?: string;
  specialty?: string;
  city?: string;
  minRating?: number;
  availableToday?: boolean;
  page?: number;
  pageSize?: number;
}

export const consultationApi = {
  getDoctors: (filters: DoctorFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value));
    });
    return apiClient<PaginatedResponse<Doctor>>(`/doctors?${params}`);
  },

  getDoctor: (id: string) => apiClient<Doctor>(`/doctors/${id}`),

  getSlots: (doctorId: string, date: string) =>
    apiClient<(TimeSlot & { isExpired: boolean })[]>(
      `/doctors/${doctorId}/slots?date=${encodeURIComponent(date)}`,
    ),

  getBookings: () => apiClient<Booking[]>('/bookings'),

  createBooking: (doctorId: string, slotId: string, startTime?: string) =>
    apiClient<Booking>('/bookings', {
      method: 'POST',
      body: { doctorId, slotId, startTime },
    }),

  cancelBooking: (bookingId: string) =>
    apiClient<Booking>(`/bookings/${bookingId}/cancel`, { method: 'POST' }),

  getSpecialties: () => apiClient<string[]>('/metadata/specialties'),
};
