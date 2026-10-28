/**
 * ceTimeZoneService.test.ts
 *
 * Tests for the state-aware timezone lookup (CEMT-137).
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The service constructor warms its cache from CEStudentDao, which
// requires a configured Supabase client. Mock the DAO so the service
// can be constructed in isolation.
vi.mock('../../api/ceStudentDao', () => ({
    CEStudentDao: {
        getInstance: () => ({
            getAll: async () => []
        })
    }
}));

import { CETimeZoneService } from './ceTimeZoneService';

describe('CETimeZoneService', () => {

    const service = CETimeZoneService.getInstance();
    const fetchMock = vi.fn();

    beforeEach(() => {
        service.cache.clear();
        fetchMock.mockReset();
        fetchMock.mockResolvedValue({
            ok: true,
            json: async () => ({ timezone: 'America/Los_Angeles', timezone_offset: -8 })
        });
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('builds distinct cache keys for the same city in different states', () => {
        const oregon = service.cacheKey('Portland', 'United States', 'OR');
        const maine = service.cacheKey('Portland', 'United States', 'ME');
        expect(oregon).not.toBe(maine);
    });

    it('treats a missing state as an empty segment in the cache key', () => {
        expect(service.cacheKey('Cairo', 'Egypt')).toBe('Cairo@@Egypt');
        expect(service.cacheKey('Cairo', 'Egypt', '  ')).toBe('Cairo@@Egypt');
    });

    it('includes the state in the lookup location when present', async () => {
        await service.getTimeZone('Portland', 'United States', 'OR');
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const url = fetchMock.mock.calls[0][0] as string;
        expect(url).toContain('location=Portland,%20OR,%20United States');
    });

    it('omits the state from the lookup location when absent', async () => {
        await service.getTimeZone('Cairo', 'Egypt');
        const url = fetchMock.mock.calls[0][0] as string;
        expect(url).toContain('location=Cairo,%20Egypt');
        expect(url).not.toContain(',%20,%20');
    });

    it('caches by city, state, and country so a second call skips the lookup', async () => {
        await service.getTimeZone('Portland', 'United States', 'OR');
        await service.getTimeZone('Portland', 'United States', 'OR');
        expect(fetchMock).toHaveBeenCalledTimes(1);

        // A different state for the same city is a different lookup.
        await service.getTimeZone('Portland', 'United States', 'ME');
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

});
