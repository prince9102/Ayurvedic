import { generateDoctor, doctorMatchesSearch, generateSlotsForDoctor } from '../../../mocks/generators/doctors';
import { generateProduct, productMatchesSearch, sortProducts } from '../../../mocks/generators/products';
import { generateHealthRecord, recordMatchesSearch } from '../../../mocks/generators/healthRecords';

describe('Doctor generator', () => {
  it('generates consistent doctor data', () => {
    const doc1 = generateDoctor(0);
    const doc2 = generateDoctor(0);
    expect(doc1).toEqual(doc2);
    expect(doc1.id).toBe('doc-0');
    expect(doc1.name).toMatch(/^Dr\./);
  });

  it('matches search queries', () => {
    const doctor = generateDoctor(10);
    expect(doctorMatchesSearch(doctor, doctor.specialty)).toBe(true);
    expect(doctorMatchesSearch(doctor, 'zzzznonexistent')).toBe(false);
  });

  it('generates slots with expiry check', () => {
    const slots = generateSlotsForDoctor('doc-0', new Date());
    expect(slots.length).toBe(8);
    expect(slots[0]!.doctorId).toBe('doc-0');
  });
});

describe('Product generator', () => {
  it('generates 20000 unique products procedurally', () => {
    const p0 = generateProduct(0);
    const p1 = generateProduct(1);
    expect(p0.id).not.toBe(p1.id);
    expect(p0.price).toBeGreaterThan(0);
  });

  it('sorts products by price', () => {
    const products = [generateProduct(0), generateProduct(1), generateProduct(2)];
    const sorted = sortProducts(products, 'price_asc');
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!.price).toBeGreaterThanOrEqual(sorted[i - 1]!.price);
    }
  });

  it('filters by search', () => {
    const product = generateProduct(5);
    expect(productMatchesSearch(product, product.category)).toBe(true);
  });
});

describe('Health record generator', () => {
  it('generates all record types', () => {
    const types = new Set<string>();
    for (let i = 0; i < 100; i++) {
      types.add(generateHealthRecord(i).type);
    }
    expect(types.size).toBeGreaterThan(1);
  });

  it('matches search on tags', () => {
    const record = generateHealthRecord(50);
    expect(recordMatchesSearch(record, record.tags[0]!)).toBe(true);
  });
});
