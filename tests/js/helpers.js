import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { vi } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const TRACKER_SRC = readFileSync(
    join(__dirname, '..', '..', 'Resources', 'public', 'js', 'tracker.js'),
    'utf8',
);

export const URLS = {
    base: '',
    createClient: '/tracker/createClient',
    addData: '/tracker/addData',
    addTag: '/tracker/addTag',
    clearPartial: '/tracker/clearPartial',
};

export function freshSandbox() {
    localStorage.clear();
    delete window.UST;
    delete window.MouseTrackerConfig;
}

/**
 * Mock fetch so tracker.js POSTs never go to the network.
 * Returns the spy.
 */
export function mockFetch(response = {}) {
    const spy = vi.fn(() =>
        Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(response),
        }),
    );
    globalThis.fetch = spy;
    return spy;
}

export function loadTracker({ settings = {}, urls = URLS } = {}) {
    window.MouseTrackerConfig = { urls, settings };
    // eslint-disable-next-line no-new-func
    new Function(TRACKER_SRC)();
}

export async function flushMicrotasks() {
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
}
