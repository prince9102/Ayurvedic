/**
 * End-to-end user flow test: Consultation booking
 * Tests the full booking lifecycle through the mock API layer.
 */
import { setMockApiHandler } from '../core/api/client';
import { mockApiHandler } from '../mocks/mockApi';
import { consultationApi } from '../features/consultation/api/consultationApi';
import { storage } from '../core/storage/storage';
import { Booking, TimeSlot } from '../mocks/generators/doctors';
import { clearMockStorage } from '../../jest.setup';

beforeAll(() => {
  setMockApiHandler(mockApiHandler);
});

beforeEach(async () => {
  clearMockStorage();
  await storage.remove('mock_bookings');
  await storage.remove('mock_booked_slots');
});

describe('Consultation booking E2E flow', () => {
  jest.setTimeout(30000);

  it('completes search → detail → book → list → cancel flow', async () => {
    const listResult = await consultationApi.getDoctors({ search: 'Ayurveda', page: 0, pageSize: 5 });
    expect(listResult.data.length).toBeGreaterThan(0);
    expect(listResult.total).toBeGreaterThan(0);

    const doctor = listResult.data[0]!;

    const detail = await consultationApi.getDoctor(doctor.id);
    expect(detail.id).toBe(doctor.id);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const slots = await consultationApi.getSlots(doctor.id, tomorrow.toISOString());
    const availableSlot = slots.find((s: TimeSlot & { isExpired?: boolean }) => !s.isBooked && !s.isExpired);
    expect(availableSlot).toBeDefined();

    const booking = await consultationApi.createBooking(
      doctor.id,
      availableSlot!.id,
      availableSlot!.startTime,
    );
    expect(booking.status).toBe('confirmed');
    expect(booking.doctorId).toBe(doctor.id);

    const bookings = await consultationApi.getBookings();
    expect(bookings.some((b: Booking) => b.id === booking.id)).toBe(true);

    await expect(
      consultationApi.createBooking(doctor.id, availableSlot!.id, availableSlot!.startTime),
    ).rejects.toThrow();

    const cancelled = await consultationApi.cancelBooking(booking.id);
    expect(cancelled.status).toBe('cancelled');

    const slotsAfterCancel = await consultationApi.getSlots(doctor.id, tomorrow.toISOString());
    const rebookable = slotsAfterCancel.find((s: TimeSlot & { isBooked?: boolean }) => s.id === availableSlot!.id);
    expect(rebookable?.isBooked).toBe(false);
  });

  it('rejects booking expired slots', async () => {
    const doctor = (await consultationApi.getDoctors({ page: 0, pageSize: 1 })).data[0]!;
    const pastDate = new Date('2020-01-01').toISOString();
    const slots = await consultationApi.getSlots(doctor.id, pastDate);
    const expiredSlot = slots[0]!;

    await expect(
      consultationApi.createBooking(doctor.id, expiredSlot.id, expiredSlot.startTime),
    ).rejects.toThrow();
  });
});
