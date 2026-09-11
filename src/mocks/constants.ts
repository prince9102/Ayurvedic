export const DOCTOR_COUNT = 200;
export const PRODUCT_COUNT = 200;
export const HEALTH_RECORD_COUNT = 200;

export const SPECIALTIES = [
  'Ayurveda',
  'Panchakarma',
  'Yoga Therapy',
  'Naturopathy',
  'Herbal Medicine',
  'Nutrition',
  'Dermatology',
  'Cardiology',
] as const;

export const CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Chennai',
  'Kolkata',
  'Hyderabad',
  'Pune',
  'Jaipur',
  'Kochi',
  'Varanasi',
] as const;

export const FIRST_NAMES = [
  'Ananya', 'Priya', 'Ravi', 'Arjun', 'Meera', 'Kavya', 'Vikram', 'Deepa',
  'Sanjay', 'Lakshmi', 'Rajesh', 'Sunita', 'Amit', 'Neha', 'Suresh', 'Pooja',
] as const;

export const LAST_NAMES = [
  'Sharma', 'Patel', 'Reddy', 'Iyer', 'Gupta', 'Singh', 'Nair', 'Joshi',
  'Desai', 'Rao', 'Menon', 'Verma', 'Kapoor', 'Pillai', 'Chatterjee',
] as const;

export const PRODUCT_CATEGORIES = [
  'Herbs',
  'Oils',
  'Supplements',
  'Teas',
  'Skincare',
  'Wellness Kits',
] as const;

export const RECORD_TYPES = [
  'lab_report',
  'prescription',
  'consultation',
  'vaccination',
  'allergy',
] as const;

export type RecordType = (typeof RECORD_TYPES)[number];
