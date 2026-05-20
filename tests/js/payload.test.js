import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { flushMicrotasks, freshSandbox, loadTracker, mockFetch, URLS } from './helpers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(
    readFileSync(join(__dirname, '..', 'fixtures', 'createClientPayload.json'), 'utf8'),
);

/**
 * Contract test: the tracker boot sequence must POST a body whose keys
 * match what tests/fixtures/createClientPayload.json declares. The PHP
 * functional test consumes the same fixture from the server side.
 */
describe('createClient POST contract', () => {
    let fetchSpy;

    beforeEach(() => {
        freshSandbox();
        fetchSpy = mockFetch({ clientID: 1, clientPageID: 2 });
    });

    it('POSTs to the createClient URL with the contracted keys', async () => {
        loadTracker();
        await flushMicrotasks();

        const call = fetchSpy.mock.calls.find(([url]) => url.endsWith(URLS.createClient));
        expect(call, 'createClient POST was made').toBeTruthy();

        const [, init] = call;
        expect(init.method).toBe('POST');
        expect(init.body).toBeInstanceOf(URLSearchParams);

        for (const [key, value] of Object.entries(fixture)) {
            // null fixture entries are optional (e.g. clientID on first visit)
            if (value === null) continue;
            expect(
                init.body.has(key),
                `body is missing contracted key "${key}"`,
            ).toBe(true);
        }

        // token is generated client-side and non-empty
        expect(init.body.get('token')).toMatch(/.+/);
        // resolution is "<w> <h>"
        expect(init.body.get('resolution')).toMatch(/^\d+ \d+$/);
        // versionMobile is "0" or "1"
        expect(['0', '1']).toContain(init.body.get('versionMobile'));
    });

    it('persists clientID and clientPageID from the server response', async () => {
        fetchSpy = mockFetch({ clientID: 42, clientPageID: 99 });
        loadTracker();
        await flushMicrotasks();

        expect(localStorage.getItem('clientID')).toBe('42');
        expect(localStorage.getItem('clientPageID')).toBe('99');
    });
});
