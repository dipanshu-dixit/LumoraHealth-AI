import { asyncHandler, logger } from '../middleware/errorHandler.js';

describe('Error Handler Middleware', () => {
  describe('asyncHandler', () => {  
    test('wraps async functions', () => {
      const mockFn = async () => 'success';
      const handler = asyncHandler(mockFn);
      expect(typeof handler).toBe('function');
    });
  });

  describe('logger', () => {
    test('has error method', () => {
      expect(typeof logger.error).toBe('function');
    });

    test('has warn method', () => {
      expect(typeof logger.warn).toBe('function');
    });

    test('has info method', () => {
      expect(typeof logger.info).toBe('function');
    });
  });
});
