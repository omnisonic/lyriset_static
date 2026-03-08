import { checkOrigin, checkRateLimit, forbiddenResponse, rateLimitResponse } from './_utils.mjs';

export const handler = async (event) => {
    if (!checkOrigin(event.headers)) return forbiddenResponse();

    const ip = event.headers['x-forwarded-for']?.split(',')[0].trim() || 'unknown';
    if (!checkRateLimit(ip)) return rateLimitResponse();

    const query = event.queryStringParameters?.query || '';
    if (!query.trim()) {
        return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify([]) };
    }

    try {
        const url = `http://www.chordie.com/results.php?q=${encodeURIComponent(query)}`;
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();
        const results = parseSearchResults(html);
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(results),
        };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};

function parseSearchResults(html) {
    const results = [];
    const seen = new Set();
    const linkRegex = /href="(\/chord\.pere\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
        const [, path, rawText] = match;
        if (seen.has(path)) continue;

        const text = rawText.replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, ' ').trim();
        const parts = text.split(/\s{2,}/);
        if (parts.length < 2) continue;

        const title = parts[0].trim();
        const artist = parts[1].trim();
        if (!title || !artist) continue;

        seen.add(path);
        results.push({ title, artist, path });
        if (results.length >= 15) break;
    }

    return results;
}
