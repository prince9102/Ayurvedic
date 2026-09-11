import { featureFlags } from '../featureFlags';

describe('featureFlags', () => {
  beforeEach(() => {
    featureFlags.reset();
  });

  it('returns default flags', () => {
    expect(featureFlags.isEnabled('enableShopWishlist')).toBe(true);
    expect(featureFlags.isEnabled('enableConsultationVideo')).toBe(false);
  });

  it('updates flags', async () => {
    await featureFlags.update({ enableConsultationVideo: true });
    expect(featureFlags.isEnabled('enableConsultationVideo')).toBe(true);
  });

  it('returns numeric config values', () => {
    expect(featureFlags.get().maxCartItems).toBe(50);
  });
});
