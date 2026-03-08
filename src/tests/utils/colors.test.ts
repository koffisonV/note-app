import { describe, it, expect } from 'vitest';
import { getRandomColor, PASTEL_COLORS } from '@/utils/colors';

describe('getRandomColor', () => {
  it('returns one of the allowed pastel colors', () => {
    for (let i = 0; i < 50; i++) {
      const color = getRandomColor();
      expect(PASTEL_COLORS).toContain(color);
    }
  });
});
