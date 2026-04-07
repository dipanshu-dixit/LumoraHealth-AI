import { validateImageFile } from '../lib/imageUtils';

describe('validateImageFile', () => {
  const createMockFile = (type: string) => {
    return { type } as File;
  };

  test('returns true for valid image types', () => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    validTypes.forEach(type => {
      const file = createMockFile(type);
      expect(validateImageFile(file)).toBe(true);
    });
  });

  test('returns false for invalid image types', () => {
    const invalidTypes = ['application/pdf', 'text/plain', 'image/tiff', 'video/mp4'];
    invalidTypes.forEach(type => {
      const file = createMockFile(type);
      expect(validateImageFile(file)).toBe(false);
    });
  });

  test('returns false for empty type', () => {
    const file = createMockFile('');
    expect(validateImageFile(file)).toBe(false);
  });

  test('is case sensitive (standard MIME types are lowercase)', () => {
    const file = createMockFile('IMAGE/PNG');
    expect(validateImageFile(file)).toBe(false);
  });
});
