import { checkOrigin, checkRateLimit, forbiddenResponse, rateLimitResponse } from './_utils.mjs';

export const handler = async (event) => {
    if (!checkOrigin(event.headers)) return forbiddenResponse();

    const ip = event.headers['x-forwarded-for']?.split(',')[0].trim() || 'unknown';
    if (!checkRateLimit(ip)) return rateLimitResponse();

    const path = event.queryStringParameters?.path || '';
    const title = event.queryStringParameters?.title || '';
    const artist = event.queryStringParameters?.artist || '';

    if (!path || !path.startsWith('/chord.pere/')) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid path' }) };
    }

    try {
        const url = `http://www.chordie.com${path}`;
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();
        const chords = parseChords(html, title, artist);
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ chords }),
        };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeEntities(str) {
    return str
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#34;/g, '"')
        .replace(/&#x27;/g, "'");
}

function stripTags(str) {
    return str.replace(/<[^>]+>/g, '');
}

function parseChords(html, title = '', artist = '') {
    const songChordMatch = html.match(/class="songChord">([\s\S]*?)(?=<div\s+(?:id|class)=["'](sidebar|footer|ad|col-|right))/i);
    if (!songChordMatch) return '';

    const titlePattern = title && artist
        ? new RegExp(`^\\s*${escapeRegex(title)}\\s*[-–]\\s*${escapeRegex(artist)}\\s*$`, 'i')
        : null;

    const inner = songChordMatch[1];

    // Extract all div elements in order, preserving class info
    const divRegex = /<div\s+class="(textline|chordline)">([\s\S]*?)<\/div>/gi;
    const elements = [];
    let match;
    while ((match = divRegex.exec(inner)) !== null) {
        const type = match[1];
        const content = decodeEntities(stripTags(match[2])).trimEnd();
        elements.push({ type, content });
    }

    // Process elements into lines, using consecutive blank textlines as verse breaks
    const lines = [];
    let blankCount = 0;

    for (const el of elements) {
        if (el.type === 'textline') {
            if (el.content.trim() === '') {
                blankCount++;
            } else {
                // textline with content (title, attribution, etc.)
                blankCount = 0;
                const text = el.content.trim();
                if (shouldFilterLine(text, titlePattern)) continue;
                lines.push(text);
            }
        } else if (el.type === 'chordline') {
            // Two+ consecutive blank textlines before this = verse break
            if (blankCount >= 2 && lines.length > 0) {
                lines.push('');
            }
            blankCount = 0;
            const text = el.content.trim();
            if (text) lines.push(text);
        }
    }

    const raw = lines.join('\n').trim();
    return convertInlineChords(raw);
}

function shouldFilterLine(text, titlePattern) {
    if (titlePattern && titlePattern.test(text)) return true;
    if (/^[\-]{5,}$/.test(text)) return true;
    if (/Important:.*NOT stored/i.test(text)) return true;
    if (/Chordie works as a search engine/i.test(text)) return true;
    if (/original song is hosted/i.test(text)) return true;
    if (/To remove this song/i.test(text)) return true;
    if (/^\s*(song|artist|album|year|tuning|capo)\s*:/i.test(text)) return true;
    if (/^\s*(tabbed|tab|chords?|transcribed|arranged|written|submitted|corrected)\s+by/i.test(text)) return true;
    if (/^\s*this\s+(tab|song|chord)\s+(was\s+)?(tabbed|written|submitted|created)/i.test(text)) return true;
    return false;
}

function convertInlineChords(text) {
    const lines = text.split('\n');
    const result = [];

    for (const line of lines) {
        if (line === '') {
            result.push('');
            continue;
        }

        if (!/\[[A-G][^\]]*\]/.test(line)) {
            result.push(line);
            continue;
        }

        // Extract chord positions relative to the clean lyric
        const chords = [];
        let lyricPos = 0;
        let i = 0;

        while (i < line.length) {
            if (line[i] === '[') {
                const end = line.indexOf(']', i);
                if (end !== -1) {
                    chords.push({ pos: lyricPos, chord: line.slice(i + 1, end) });
                    i = end + 1;
                } else {
                    lyricPos++;
                    i++;
                }
            } else {
                lyricPos++;
                i++;
            }
        }

        const lyric = line.replace(/\[[^\]]+\]/g, '');

        if (!lyric.trim()) {
            result.push(chords.map(c => c.chord).join('  '));
            continue;
        }

        // Build chord line with approximate positioning
        let chordLine = '';
        for (const { pos, chord } of chords) {
            while (chordLine.length < pos) chordLine += ' ';
            if (chordLine.length > pos) chordLine += ' ';
            chordLine += chord;
        }

        result.push(chordLine.trimEnd());
        result.push(lyric);
    }

    return result.join('\n');
}
