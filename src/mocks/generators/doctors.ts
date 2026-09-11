import {
  CITIES,
  DOCTOR_COUNT,
  FIRST_NAMES,
  LAST_NAMES,
  SPECIALTIES,
} from '../constants';
import { generateId, pickFrom, seededRandom } from '../../shared/utils/seededRandom';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  city: string;
  rating: number;
  experienceYears: number;
  consultationFee: number;
  languages: string[];
  availableToday: boolean;
  imageUrl: string;
  bio: string;
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface Booking {
  id: string;
  doctorId: string;
  doctorName: string;
  slotId: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'cancelled' | 'pending_sync';
  createdAt: string;
}

export function generateDoctor(index: number): Doctor {
  const seed = index + 1;
  const firstName = pickFrom(FIRST_NAMES, seed);
  const lastName = pickFrom(LAST_NAMES, seed * 3);
  const specialty = pickFrom(SPECIALTIES, seed * 7);
  const city = pickFrom(CITIES, seed * 11);
  const rating = Math.round((3.5 + seededRandom(seed * 13) * 1.5) * 10) / 10;
  const experienceYears = Math.floor(2 + seededRandom(seed * 17) * 28);
  const consultationFee = Math.floor(300 + seededRandom(seed * 19) * 1200);

  return {
    id: generateId('doc', index),
    name: `Dr. ${firstName} ${lastName}`,
    specialty,
    city,
    rating,
    experienceYears,
    consultationFee,
    languages: seededRandom(seed * 23) > 0.5 ? ['English', 'Hindi'] : ['English'],
    availableToday: seededRandom(seed * 29) > 0.3,
    imageUrl: `https://i.pravatar.cc/150?u=doctor-${index}`,
    bio: `Experienced ${specialty} practitioner with ${experienceYears} years in holistic Ayurvedic care.`,
  };
}

export function doctorMatchesSearch(doctor: Doctor, query: string): boolean {
  const q = query.toLowerCase();
  return (
    doctor.name.toLowerCase().includes(q) ||
    doctor.specialty.toLowerCase().includes(q) ||
    doctor.city.toLowerCase().includes(q)
  );
}

export function generateSlotsForDoctor(doctorId: string, date: Date): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const baseDate = new Date(date);
  baseDate.setHours(9, 0, 0, 0);

  for (let i = 0; i < 8; i++) {
    const start = new Date(baseDate);
    start.setHours(9 + i, 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    const seed = parseInt(doctorId.replace('doc-', ''), 10) * 100 + i;
    const isBooked = seededRandom(seed) < 0.2;

    slots.push({
      id: `${doctorId}-slot-${i}`,
      doctorId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      isBooked,
    });
  }

  return slots;
}

export function getDoctorIndex(id: string): number {
  return parseInt(id.replace('doc-', ''), 10);
}

export function isValidDoctorIndex(index: number): boolean {
  return index >= 0 && index < DOCTOR_COUNT;
}
