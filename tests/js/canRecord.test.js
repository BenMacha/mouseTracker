import { beforeEach, describe, expect, it } from 'vitest';
import { freshSandbox, loadTracker, mockFetch } from './helpers.js';

describe('UST.canRecord gating', () => {
    beforeEach(() => {
        freshSandbox();
        mockFetch();
    });

    it('returns false when noRecord is set', () => {
        localStorage.setItem('noRecord', 'true');
        loadTracker();
        expect(window.UST.canRecord()).toBe(false);
    });

    it('returns true when token is present and noRecord is unset', () => {
        localStorage.setItem('token', 'sometoken');
        loadTracker();
        expect(window.UST.canRecord()).toBe(true);
    });

    it('respects disableMobileTracking when on a mobile UA', () => {
        Object.defineProperty(navigator, 'userAgent', {
            value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
            configurable: true,
        });
        loadTracker({ settings: { disable_mobile: true } });
        expect(window.UST.canRecord()).toBe(false);
    });
});
