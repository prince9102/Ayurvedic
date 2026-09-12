import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/useRedux';
import { useNetwork } from '../../../core/network/NetworkProvider';
import { offlineQueue } from '../../../core/sync/offlineQueue';
import {
  fetchDoctors,
  fetchDoctor,
  fetchSlots,
  fetchBookings,
  fetchSpecialties,
  createBooking,
  cancelBooking,
  setFilters,
  addPendingBooking,
} from '../store/doctorsSlice';
import { DoctorFilters } from '../api/consultationApi';
import { Booking } from '../../../mocks/generators/doctors';
import { RootState } from '../../../app/store';

export function useDoctors(filters: DoctorFilters) {
  const dispatch = useAppDispatch();
  const { items, loading, error, hasMore, page } = useAppSelector((s: RootState) => s.doctors);

  useEffect(() => {
    dispatch(setFilters(filters));
    dispatch(fetchDoctors({ filters, page: 0 }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const fetchNextPage = useCallback(() => {
    if (hasMore && !loading) {
      dispatch(fetchDoctors({ filters, page: page + 1 }));
    }
  }, [dispatch, filters, hasMore, loading, page]);

  return { data: items, isLoading: loading, isError: !!error, hasMore, fetchNextPage, refetch: () => dispatch(fetchDoctors({ filters, page: 0 })) };
}

export function useDoctor(id: string) {
  const dispatch = useAppDispatch();
  const { selectedDoctor, selectedDoctorLoading } = useAppSelector((s: RootState) => s.doctors);

  useEffect(() => {
    if (id) dispatch(fetchDoctor(id));
  }, [dispatch, id]);

  return { data: selectedDoctor, isLoading: selectedDoctorLoading };
}

export function useDoctorSlots(doctorId: string, date: string) {
  const dispatch = useAppDispatch();
  const { slots, slotsLoading } = useAppSelector((s: RootState) => s.doctors);

  useEffect(() => {
    if (doctorId) dispatch(fetchSlots({ doctorId, date }));
  }, [dispatch, doctorId, date]);

  return { data: slots, isLoading: slotsLoading };
}

export function useBookings() {
  const dispatch = useAppDispatch();
  const { bookings, bookingsLoading } = useAppSelector((s: RootState) => s.doctors);
  const pendingBookings = useAppSelector((s: RootState) => s.booking.pendingBookings);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const merged = [
    ...pendingBookings,
    ...bookings.filter((b) => !pendingBookings.some((p) => p.slotId === b.slotId)),
  ];

  return { data: merged, isLoading: bookingsLoading };
}

export function useSpecialties() {
  const dispatch = useAppDispatch();
  const specialties = useAppSelector((s: RootState) => s.doctors.specialties);

  useEffect(() => {
    if (specialties.length === 0) dispatch(fetchSpecialties());
  }, [dispatch, specialties.length]);

  return { data: specialties };
}

export function useCreateBooking() {
  const dispatch = useAppDispatch();
  const { isOnline } = useNetwork();

  const mutate = useCallback(
    async (
      params: { doctorId: string; slotId: string; doctorName: string; startTime: string; endTime: string },
      callbacks?: { onSuccess?: () => void; onError?: (e: unknown) => void },
    ) => {
      try {
        if (!isOnline) {
          const pending: Booking = {
            id: `pending-${Date.now()}`,
            doctorId: params.doctorId,
            doctorName: params.doctorName,
            slotId: params.slotId,
            startTime: params.startTime,
            endTime: params.endTime,
            status: 'pending_sync',
            createdAt: new Date().toISOString(),
          };
          await offlineQueue.enqueue('CREATE_BOOKING', { doctorId: params.doctorId, slotId: params.slotId });
          dispatch(addPendingBooking(pending));
          callbacks?.onSuccess?.();
          return;
        }
        await dispatch(createBooking({ doctorId: params.doctorId, slotId: params.slotId, startTime: params.startTime })).unwrap();
        callbacks?.onSuccess?.();
      } catch (e) {
        callbacks?.onError?.(e);
      }
    },
    [dispatch, isOnline],
  );

  return { mutate, isPending: false };
}

export function useCancelBooking() {
  const dispatch = useAppDispatch();
  const { isOnline } = useNetwork();

  const mutate = useCallback(
    async (bookingId: string, callbacks?: { onSuccess?: () => void; onError?: (e: unknown) => void }) => {
      try {
        if (!isOnline) {
          await offlineQueue.enqueue('CANCEL_BOOKING', { bookingId });
          callbacks?.onSuccess?.();
          return;
        }
        await dispatch(cancelBooking(bookingId)).unwrap();
        callbacks?.onSuccess?.();
      } catch (e) {
        callbacks?.onError?.(e);
      }
    },
    [dispatch, isOnline],
  );

  return { mutate };
}
