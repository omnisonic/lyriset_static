// Shared utilities for Netlify functions
// NOTE: Rate limiting uses module-level state (warm instances only).
// Resets on cold start — best-effort, not guaranteed across all invocations.

const ALLOWED_ORIGINS = ['lyriset.com', 'localhost', '127.0.0.1'];
const RATE_LIMIT = 20;       // max requests per window per IP
const WINDOW_MS = 60 * 1000; // 1 minute window

const rateLimits = new Map();

export function checkOrigin(headers) {
    const origin = headers.origin || headers.referer || '';
    return ALLOWED_ORIGINS.some(o => origin.includes(o));
}

export function checkRateLimit(ip) {
    const now = Date.now();
    const entry = rateLimits.get(ip) || { count: 0, windowStart: now };

    if (now - entry.windowStart > WINDOW_MS) {
        entry.count = 1;
        entry.windowStart = now;
    } else {
        entry.count++;
    }

    rateLimits.set(ip, entry);
    return entry.count <= RATE_LIMIT;
}

export function forbiddenResponse() {
    return { statusCode: 403, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Forbidden' }) };
}

export function rateLimitResponse() {
    return { statusCode: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' }, body: JSON.stringify({ error: 'Too many requests' }) };
}
