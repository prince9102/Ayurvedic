import { generateId, pickFrom, seededRandom } from '../../shared/utils/seededRandom';
import { HEALTH_RECORD_COUNT, RECORD_TYPES, RecordType } from '../constants';

export type GroupBy = 'none' | 'month' | 'year';

export interface HealthRecord {
  id: string;
  type: RecordType;
  title: string;
  description: string;
  date: string;
  tags: string[];
  provider: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'pdf';
}

const LAB_TESTS = ['CBC', 'Lipid Panel', 'Thyroid', 'Liver Function', 'Vitamin D'];
const VACCINES = ['COVID-19 Booster', 'Hepatitis B', 'Influenza', 'Tetanus'];
const ALLERGENS = ['Peanuts', 'Dust Mites', 'Pollen', 'Shellfish', 'Latex'];

export function generateHealthRecord(index: number): HealthRecord {
  const seed = index + 1;
  const type = pickFrom(RECORD_TYPES, seed * 3);
  const daysAgo = Math.floor(seededRandom(seed * 5) * 1825);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  let title: string;
  let description: string;
  let tags: string[];

  switch (type) {
    case 'lab_report':
      title = `${pickFrom(LAB_TESTS, seed)} Results`;
      description = 'Laboratory test results within normal range.';
      tags = ['lab', 'diagnostics'];
      break;
    case 'prescription':
      title = 'Ayurvedic Prescription';
      description = 'Prescribed herbal supplements and dietary guidelines.';
      tags = ['medication', 'ayurveda'];
      break;
    case 'consultation':
      title = 'Doctor Consultation';
      description = 'Follow-up consultation for wellness plan review.';
      tags = ['consultation', 'follow-up'];
      break;
    case 'vaccination':
      title = pickFrom(VACCINES, seed);
      description = 'Vaccination administered successfully.';
      tags = ['immunization', 'preventive'];
      break;
    case 'allergy':
      title = `${pickFrom(ALLERGENS, seed)} Allergy`;
      description = 'Documented allergic reaction and management plan.';
      tags = ['allergy', 'alert'];
      break;
    default:
      title = 'Health Record';
      description = 'Medical record entry.';
      tags = ['general'];
  }

  const hasAttachment = seededRandom(seed * 37) > 0.4;
  const attachmentType = seededRandom(seed * 41) > 0.5 ? 'image' : 'pdf';

  return {
    id: generateId('rec', index),
    type,
    title,
    description,
    date: date.toISOString(),
    tags,
    provider: pickFrom(['Apollo Ayurveda', 'Kerala Ayurveda', 'Jiva Clinic', 'Patanjali'], seed * 43),
    attachmentUrl: hasAttachment
      ? attachmentType === 'image'
        ? `https://picsum.photos/seed/record-${index}/300/400`
        : `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`
      : undefined,
    attachmentType: hasAttachment ? attachmentType : undefined,
  };
}

export function recordMatchesSearch(record: HealthRecord, query: string): boolean {
  const q = query.toLowerCase();
  return (
    record.title.toLowerCase().includes(q) ||
    record.description.toLowerCase().includes(q) ||
    record.tags.some((t) => t.toLowerCase().includes(q)) ||
    record.provider.toLowerCase().includes(q)
  );
}

export function getRecordGroupKey(date: string, groupBy: GroupBy): string {
  const d = new Date(date);
  if (groupBy === 'year') return `${d.getFullYear()}`;
  if (groupBy === 'month') {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }
  return '';
}

export function isValidRecordIndex(index: number): boolean {
  return index >= 0 && index < HEALTH_RECORD_COUNT;
}

export function getRecordIndex(id: string): number {
  return parseInt(id.replace('rec-', ''), 10);
}
