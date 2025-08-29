import { test, expect } from '@playwright/test';
import { slugMapper } from '../src/core/utils/type';

test.describe('slugMapper function tests', () => {
  test('should extract single parameter correctly', () => {
    const pattern = '/user/:userId';
    const pathname = '/user/1';

    const result = slugMapper(pattern, pathname);

    console.log('Pattern:', pattern);
    console.log('Pathname:', pathname);
    console.log('Result:', result);

    expect(result).toEqual({ userId: '1' });
  });

  test('should extract multiple parameters correctly', () => {
    const pattern = '/user/:userId/profile/:section';
    const pathname = '/user/123/profile/settings';

    const result = slugMapper(pattern, pathname);

    console.log('Pattern:', pattern);
    console.log('Pathname:', pathname);
    console.log('Result:', result);

    expect(result).toEqual({ userId: '123', section: 'settings' });
  });

  test('should return empty object when no parameters', () => {
    const pattern = '/dashboard';
    const pathname = '/dashboard';

    const result = slugMapper(pattern, pathname);

    expect(result).toEqual({});
  });

  test('should handle edge cases', () => {
    // Test with trailing slashes
    const result1 = slugMapper('/user/:id/', '/user/1/');
    expect(result1).toEqual({ id: '1' });

    // Test with mismatched paths
    const result2 = slugMapper('/user/:id', '/different/path');
    expect(result2).toEqual({});
  });

  test('should debug the current failing case', () => {
    const pattern = '/user/:userId';
    const pathname = '/user/1';

    console.log('=== DEBUGGING CURRENT CASE ===');
    console.log('Pattern:', pattern);
    console.log('Pathname:', pathname);

    // Manual debugging
    const patternParts = pattern.split("/").filter(Boolean);
    const pathParts = pathname.split("/").filter(Boolean);

    console.log('Pattern parts:', patternParts);
    console.log('Path parts:', pathParts);

    const result = slugMapper(pattern, pathname);
    console.log('Final result:', result);

    expect(result).toEqual({ userId: '1' });
  });
});
