import { config } from '../core/config/env';
import { AppError, ConflictError, ValidationError } from '../core/errors/AppError';
import { featureFlags } from '../core/feature-flags/featureFlags';
import { storage } from '../core/storage/storage';
import { DOCTOR_COUNT, HEALTH_RECORD_COUNT, PRODUCT_COUNT, SPECIALTIES } from './constants';
import {
  Booking,
  doctorMatchesSearch,
  generateDoctor,
  generateSlotsForDoctor,
  getDoctorIndex,
  isValidDoctorIndex,
} from './generators/doctors';
import {
  generateHealthRecord,
  getRecordGroupKey,
  GroupBy,
  HealthRecord,
  recordMatchesSearch,
} from './generators/healthRecords';
import {
  generateProduct,
  getProductIndex,
  isValidProductIndex,
  productMatchesSearch,
  sortProducts,
  SortOption,
} from './generators/products';
import { normalizeSearch, paginate } from '../shared/utils/seededRandom';
import { ApiRequestOptions } from '../core/api/client';

const BOOKINGS_KEY = 'mock_bookings';
const BOOKED_SLOTS_KEY = 'mock_booked_slots';

async function simulateNetwork(): Promise<void> {
  const delay = 200 + Math.random() * 400;
  if (Math.random() < config.mockSlowNetworkRate) {
    await new Promise((r) => setTimeout(r, delay * 3));
  } else {
    await new Promise((r) => setTimeout(r, delay));
  }

  if (Math.random() < config.mockFailureRate) {
    throw new AppError('Random server error', 'SERVER_ERROR', 500, true);
  }
}

async function getBookings(): Promise<Booking[]> {
  return (await storage.get<Booking[]>(BOOKINGS_KEY)) ?? [];
}

async function saveBookings(bookings: Booking[]): Promise<void> {
  await storage.set(BOOKINGS_KEY, bookings);
}

async function getBookedSlotIds(): Promise<Set<string>> {
  const ids = (await storage.get<string[]>(BOOKED_SLOTS_KEY)) ?? [];
  return new Set(ids);
}

async function markSlotBooked(slotId: string): Promise<void> {
  const ids = await getBookedSlotIds();
  ids.add(slotId);
  await storage.set(BOOKED_SLOTS_KEY, [...ids]);
}

async function unmarkSlot(slotId: string): Promise<void> {
  const ids = await getBookedSlotIds();
  ids.delete(slotId);
  await storage.set(BOOKED_SLOTS_KEY, [...ids]);
}

function collectMatchingDoctorIndices(filters: {
  search?: string;
  specialty?: string;
  city?: string;
  minRating?: number;
  availableToday?: boolean;
}): number[] {
  const indices: number[] = [];
  const search = filters.search ? normalizeSearch(filters.search) : '';

  for (let i = 0; i < DOCTOR_COUNT; i++) {
    const doctor = generateDoctor(i);
    if (search && !doctorMatchesSearch(doctor, search)) continue;
    if (filters.specialty && doctor.specialty !== filters.specialty) continue;
    if (filters.city && doctor.city !== filters.city) continue;
    if (filters.minRating && doctor.rating < filters.minRating) continue;
    if (filters.availableToday && !doctor.availableToday) continue;
    indices.push(i);
  }

  return indices;
}

function collectMatchingProductIndices(filters: {
  search?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
}): number[] {
  const indices: number[] = [];
  const search = filters.search ? normalizeSearch(filters.search) : '';

  for (let i = 0; i < PRODUCT_COUNT; i++) {
    const product = generateProduct(i);
    if (search && !productMatchesSearch(product, search)) continue;
    if (filters.categories?.length && !filters.categories.includes(product.category)) continue;
    if (filters.minPrice !== undefined && product.price < filters.minPrice) continue;
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) continue;
    if (filters.inStockOnly && !product.inStock) continue;
    indices.push(i);
  }

  return indices;
}

function collectMatchingRecordIndices(filters: {
  search?: string;
  types?: string[];
  tags?: string[];
}): number[] {
  const indices: number[] = [];
  const search = filters.search ? normalizeSearch(filters.search) : '';

  for (let i = 0; i < HEALTH_RECORD_COUNT; i++) {
    const record = generateHealthRecord(i);
    if (search && !recordMatchesSearch(record, search)) continue;
    if (filters.types?.length && !filters.types.includes(record.type)) continue;
    if (filters.tags?.length && !filters.tags.some((t) => record.tags.includes(t))) continue;
    indices.push(i);
  }

  return indices;
}

export async function mockApiHandler(path: string, options: ApiRequestOptions): Promise<unknown> {
  await simulateNetwork();

  const [basePath, queryString] = path.split('?');
  const params = new URLSearchParams(queryString ?? '');
  const method = options.method ?? 'GET';
  const body = options.body as Record<string, unknown> | undefined;


  // Feature flags
  if (basePath === '/config/feature-flags') {
    return featureFlags.get();
  }

  // Doctors list
  if (basePath === '/doctors' && method === 'GET') {
    const page = parseInt(params.get('page') ?? '0', 10);
    const pageSize = parseInt(params.get('pageSize') ?? '20', 10);
    const indices = collectMatchingDoctorIndices({
      search: params.get('search') ?? undefined,
      specialty: params.get('specialty') ?? undefined,
      city: params.get('city') ?? undefined,
      minRating: params.get('minRating') ? parseFloat(params.get('minRating')!) : undefined,
      availableToday: params.get('availableToday') === 'true',
    });
    const doctors = indices.map((i) => generateDoctor(i));
    return paginate(doctors, page, pageSize);
  }

  // Doctor detail
  const doctorMatch = basePath.match(/^\/doctors\/(doc-\d+)$/);
  if (doctorMatch && method === 'GET') {
    const index = getDoctorIndex(doctorMatch[1]!);
    if (!isValidDoctorIndex(index)) throw new AppError('Doctor not found', 'NOT_FOUND', 404);
    return generateDoctor(index);
  }

  // Doctor slots
  const slotsMatch = basePath.match(/^\/doctors\/(doc-\d+)\/slots$/);
  if (slotsMatch && method === 'GET') {
    const doctorId = slotsMatch[1]!;
    const dateStr = params.get('date') ?? new Date().toISOString();
    const slots = generateSlotsForDoctor(doctorId, new Date(dateStr));
    const bookedIds = await getBookedSlotIds();
    return slots.map((s) => ({
      ...s,
      isBooked: s.isBooked || bookedIds.has(s.id),
      isExpired: new Date(s.startTime) < new Date(),
    }));
  }

  // Book appointment
  if (basePath === '/bookings' && method === 'POST') {
    const { doctorId, slotId, startTime: bodyStartTime } = body ?? {};
    if (!doctorId || !slotId) throw new ValidationError('doctorId and slotId are required');

    const index = getDoctorIndex(String(doctorId));
    if (!isValidDoctorIndex(index)) throw new ValidationError('Invalid doctor');

    const slots = generateSlotsForDoctor(String(doctorId), new Date());
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) throw new ValidationError('Invalid slot');

    const effectiveStartTime = bodyStartTime ? String(bodyStartTime) : slot.startTime;
    if (new Date(effectiveStartTime) < new Date()) {
      throw new ValidationError('This slot has expired');
    }

    const bookedIds = await getBookedSlotIds();
    const slotIdStr = String(slotId);
    if (bookedIds.has(slotIdStr) || slot.isBooked) {
      throw new ConflictError('This slot is no longer available');
    }

    const bookings = await getBookings();
    const duplicate = bookings.find(
      (b) => b.slotId === slotIdStr && b.status !== 'cancelled',
    );
    if (duplicate) throw new ConflictError('Double booking attempt detected');

    const doctor = generateDoctor(index);
    const booking: Booking = {
      id: `booking-${Date.now()}`,
      doctorId: String(doctorId),
      doctorName: doctor.name,
      slotId: String(slotId),
      startTime: effectiveStartTime,
      endTime: slot.endTime,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    await markSlotBooked(String(slotId));
    bookings.push(booking);
    await saveBookings(bookings);
    return booking;
  }

  // List bookings
  if (basePath === '/bookings' && method === 'GET') {
    const bookings = await getBookings();
    const upcoming = bookings.filter(
      (b) => b.status !== 'cancelled' && new Date(b.startTime) > new Date(),
    );
    return upcoming.sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
  }

  // Cancel booking
  const cancelMatch = basePath.match(/^\/bookings\/(.+)\/cancel$/);
  if (cancelMatch && method === 'POST') {
    const bookingId = cancelMatch[1]!;
    const bookings = await getBookings();
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) throw new AppError('Booking not found', 'NOT_FOUND', 404);
    booking.status = 'cancelled';
    await unmarkSlot(booking.slotId);
    await saveBookings(bookings);
    return booking;
  }

  // Products
  if (basePath === '/products' && method === 'GET') {
    const page = parseInt(params.get('page') ?? '0', 10);
    const pageSize = parseInt(params.get('pageSize') ?? '20', 10);
    const sort = (params.get('sort') ?? 'name') as SortOption;
    const categories = params.get('categories')?.split(',').filter(Boolean);

    const indices = collectMatchingProductIndices({
      search: params.get('search') ?? undefined,
      categories,
      minPrice: params.get('minPrice') ? parseFloat(params.get('minPrice')!) : undefined,
      maxPrice: params.get('maxPrice') ? parseFloat(params.get('maxPrice')!) : undefined,
      inStockOnly: params.get('inStockOnly') === 'true',
    });

    let products = indices.map((i) => generateProduct(i));
    products = sortProducts(products, sort);
    return paginate(products, page, pageSize);
  }

  const productMatch = basePath.match(/^\/products\/(prod-\d+)$/);
  if (productMatch && method === 'GET') {
    const index = getProductIndex(productMatch[1]!);
    if (!isValidProductIndex(index)) throw new AppError('Product not found', 'NOT_FOUND', 404);
    return generateProduct(index);
  }

  // Health records
  if (basePath === '/health-records' && method === 'GET') {
    const page = parseInt(params.get('page') ?? '0', 10);
    const pageSize = parseInt(params.get('pageSize') ?? '30', 10);
    const types = params.get('types')?.split(',').filter(Boolean);
    const tags = params.get('tags')?.split(',').filter(Boolean);
    const groupBy = (params.get('groupBy') ?? 'none') as GroupBy;

    const indices = collectMatchingRecordIndices({
      search: params.get('search') ?? undefined,
      types,
      tags,
    });

    let records = indices.map((i) => generateHealthRecord(i));
    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (groupBy !== 'none') {
      const grouped: Record<string, HealthRecord[]> = {};
      for (const record of records) {
        const key = getRecordGroupKey(record.date, groupBy);
        if (!grouped[key]) grouped[key] = [];
        grouped[key]!.push(record);
      }
      return { grouped, total: records.length };
    }

    return paginate(records, page, pageSize);
  }

  const recordMatch = basePath.match(/^\/health-records\/(rec-\d+)$/);
  if (recordMatch && method === 'GET') {
    const index = parseInt(recordMatch[1]!.replace('rec-', ''), 10);
    if (index < 0 || index >= HEALTH_RECORD_COUNT) {
      throw new AppError('Record not found', 'NOT_FOUND', 404);
    }
    return generateHealthRecord(index);
  }

  // Metadata
  if (basePath === '/metadata/specialties') {
    return SPECIALTIES;
  }

  throw new AppError(`Unknown endpoint: ${basePath}`, 'NOT_FOUND', 404);
}
