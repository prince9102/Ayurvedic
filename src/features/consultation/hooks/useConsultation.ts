import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { consultationApi, DoctorFilters } from '../api/consultationApi';
import { useNetwork } from '../../../core/network/NetworkProvider';
import { offlineQueue } from '../../../core/sync/offlineQueue';
import { useBookingStore } from '../store/bookingStore';
import { Booking } from '../../../mocks/generators/doctors';
import { isAppError } from '../../../core/errors/AppError';

export const consultationKeys = {
  all: ['consultation'] as const,
  doctors: (filters: DoctorFilters) => [...consultationKeys.all, 'doctors', filters] as const,
  doctor: (id: string) => [...consultationKeys.all, 'doctor', id] as const,
  slots: (doctorId: string, date: string) =>
    [...consultationKeys.all, 'slots', doctorId, date] as const,
  bookings: () => [...consultationKeys.all, 'bookings'] as const,
  specialties: () => [...consultationKeys.all, 'specialties'] as const,
};

export function useDoctors(filters: DoctorFilters) {
  return useInfiniteQuery({
    queryKey: consultationKeys.doctors(filters),
    queryFn: ({ pageParam = 0 }) =>
      consultationApi.getDoctors({ ...filters, page: pageParam, pageSize: 20 }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: consultationKeys.doctor(id),
    queryFn: () => consultationApi.getDoctor(id),
    enabled: !!id,
  });
}

export function useDoctorSlots(doctorId: string, date: string) {
  return useQuery({
    queryKey: consultationKeys.slots(doctorId, date),
    queryFn: () => consultationApi.getSlots(doctorId, date),
    enabled: !!doctorId,
    staleTime: 60 * 1000,
  });
}

export function useBookings() {
  const { pendingBookings } = useBookingStore();
  const query = useQuery({
    queryKey: consultationKeys.bookings(),
    queryFn: () => consultationApi.getBookings(),
    staleTime: 30 * 1000,
  });

  const merged = [
    ...pendingBookings,
    ...(query.data ?? []).filter(
      (b) => !pendingBookings.some((p) => p.slotId === b.slotId),
    ),
  ];

  return { ...query, data: merged };
}

export function useSpecialties() {
  return useQuery({
    queryKey: consultationKeys.specialties(),
    queryFn: () => consultationApi.getSpecialties(),
    staleTime: Infinity,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { isOnline } = useNetwork();
  const { addPendingBooking } = useBookingStore();

  return useMutation({
    mutationFn: async ({
      doctorId,
      slotId,
      doctorName,
      startTime,
      endTime,
    }: {
      doctorId: string;
      slotId: string;
      doctorName: string;
      startTime: string;
      endTime: string;
    }) => {
      if (!isOnline) {
        const pending: Booking = {
          id: `pending-${Date.now()}`,
          doctorId,
          doctorName,
          slotId,
          startTime,
          endTime,
          status: 'pending_sync',
          createdAt: new Date().toISOString(),
        };
        await offlineQueue.enqueue('CREATE_BOOKING', { doctorId, slotId });
        addPendingBooking(pending);
        return pending;
      }
      return consultationApi.createBooking(doctorId, slotId, startTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.bookings() });
    },
    onError: (error) => {
      if (isAppError(error) && error.code === 'CONFLICT') {
        queryClient.invalidateQueries({ queryKey: consultationKeys.all });
      }
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  const { isOnline } = useNetwork();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      if (!isOnline) {
        await offlineQueue.enqueue('CANCEL_BOOKING', { bookingId });
        return { id: bookingId, status: 'cancelled' as const };
      }
      return consultationApi.cancelBooking(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.bookings() });
    },
  });
}
