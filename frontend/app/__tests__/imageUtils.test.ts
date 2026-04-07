import { validateImageFile } from '../lib/imageUtils';

describe('validateImageFile', () => {
  const createMockFile = (type: string) => ({
    type,
  } as File);

  test('returns true for valid image types', () => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    validTypes.forEach(type => {
      const file = createMockFile(type);
      expect(validateImageFile(file)).toBe(true);
    });
  });

  test('returns false for invalid image types', () => {
    const invalidTypes = ['image/tiff', 'image/bmp', 'text/plain', 'application/pdf', 'video/mp4'];
    invalidTypes.forEach(type => {
      const file = createMockFile(type);
      expect(validateImageFile(file)).toBe(false);
    });
  });

  test('returns false for empty or missing type', () => {
    const fileWithEmptyType = createMockFile('');
    expect(validateImageFile(fileWithEmptyType)).toBe(false);

    // @ts-ignore - testing runtime behavior for missing type
    const fileWithNoType = {} as File;
    expect(validateImageFile(fileWithNoType)).toBe(false);
  });
});
