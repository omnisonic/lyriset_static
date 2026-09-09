// SVG chord diagram generation and lyric chord extraction for Lyriset
// SVG generation adapted from chord-text-converter.js

function detectBarChord(chord) {
    const numeric = chord.split('').map(f => f === 'x' ? 0 : parseInt(f));
    let barStart = null, barEnd = null, barFret = null;
    for (let i = 0; i < numeric.length; i++) {
        if (numeric[i] > 0) {
            if (barFret === null) { barFret = numeric[i]; barStart = i; barEnd = i; }
            else if (numeric[i] === barFret) { barEnd = i; }
        }
    }
    const fretted = numeric.filter(f => f > 0);
    if (barStart !== null && barEnd - barStart >= 3 && barFret === Math.min(...fretted)) {
        return { startString: barStart, endString: barEnd, fret: barFret };
    }
    return null;
}

function generateChordSVG(chord, numStrings = 6) {
    const strings = numStrings, frets = 5, sd = 20, fd = 20, r = 5, top = 28, side = 18;
    const w = side * 2 + sd * (strings - 1);
    const h = top + fd * frets;
    const bar = detectBarChord(chord);
    const fretted = chord.split('').filter(f => f !== 'x' && f !== '0').map(Number);
    const minFret = fretted.length ? Math.min(...fretted) : 1;
    const startFret = minFret >= 3 ? minFret : 1;

    let svg = `<svg viewBox="0 0 ${w} ${h + 10}" xmlns="http://www.w3.org/2000/svg">`;

    // Strings
    for (let i = 0; i < strings; i++) {
        svg += `<line x1="${side + i * sd}" y1="${top}" x2="${side + i * sd}" y2="${h}" stroke="currentColor" stroke-width="1"/>`;
    }

    // Frets
    for (let i = 0; i <= frets; i++) {
        if (i === 0 && startFret >= 2) continue;
        const sw = (i === 0) ? 3 : 1;
        svg += `<line x1="${side}" y1="${top + i * fd}" x2="${w - side}" y2="${top + i * fd}" stroke="currentColor" stroke-width="${sw}"/>`;
    }

    // Starting fret number
    if (startFret > 1) {
        svg += `<text x="${side - 14}" y="${top + fd * 0.75}" font-family="sans-serif" font-size="10" fill="currentColor">${startFret}</text>`;
    }

    // Dots
    chord.split('').forEach((fret, string) => {
        const x = side + string * sd;
        if (fret === 'x') {
            svg += `<text x="${x - 4}" y="${top - 8}" font-family="sans-serif" font-size="12" fill="currentColor">×</text>`;
        } else if (fret === '0') {
            svg += `<circle cx="${x}" cy="${top - 10}" r="${r - 1}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
        } else {
            const fy = top + (parseInt(fret) - startFret + 1) * fd - fd / 2;
            svg += `<circle cx="${x}" cy="${fy}" r="${r}" fill="currentColor"/>`;
        }
    });

    // Bar
    if (bar) {
        const bx = side + bar.startString * sd;
        const ex = side + bar.endString * sd;
        const fy = top + (bar.fret - startFret + 1) * fd - fd / 2;
        svg += `<rect x="${bx}" y="${fy - r}" width="${ex - bx}" height="${r * 2}" rx="${r}" fill="currentColor"/>`;
    }

    svg += `</svg>`;
    return svg;
}

const CHORD_MAP = {
    // Major
    'c': 'x32010', 'cmaj': 'x32010',
    'd': 'xx0232', 'dmaj': 'xx0232',
    'e': '022100', 'emaj': '022100',
    'f': '133211', 'fmaj': '133211',
    'g': '320003', 'gmaj': '320003',
    'a': 'x02220', 'amaj': 'x02220',
    'b': 'x24442', 'bmaj': 'x24442',
    // Minor
    'am': 'x02210', 'amin': 'x02210',
    'bm': 'x24432', 'bmin': 'x24432',
    'cm': 'x35543', 'cmin': 'x35543',
    'dm': 'xx0231', 'dmin': 'xx0231',
    'em': '022000', 'emin': '022000',
    'fm': '133111', 'fmin': '133111',
    'gm': '355333', 'gmin': '355333',
    // Dominant 7th
    'a7': 'x02020', 'b7': 'x21202', 'c7': 'x32310',
    'd7': 'xx0212', 'e7': '020100', 'f7': '131211',
    'g7': '320001',
    // Major 7th
    'amaj7': 'x02120', 'cmaj7': 'x32000',
    'dmaj7': 'xx0222', 'emaj7': '021100',
    'fmaj7': 'xx3210', 'gmaj7': '320002',
    // Minor 7th
    'am7': 'x02010', 'bm7': 'x24232', 'cm7': 'x35343',
    'dm7': 'xx0211', 'em7': '020000', 'fm7': '131111',
    'gm7': '353333',
    // Suspended
    'asus2': 'x02200', 'dsus2': 'xx0230', 'esus2': '024400', 'gsus2': '300033',
    'asus4': 'x02230', 'csus4': 'x33010', 'dsus4': 'xx0233',
    'esus4': '022200', 'fsus4': '133311', 'gsus4': '320013',
    // Add9
    'cadd9': 'x32030', 'dadd9': 'xx0230', 'eadd9': '024100',
    'gadd9': '320203', 'aadd9': 'x02420',
    // Sharp/flat roots
    'f#m': '244222', 'f#min': '244222',
    'c#m': 'x46654', 'c#min': 'x46654',
    'g#m': '466444', 'g#min': '466444',
    'bb': 'x13331', 'bbmaj': 'x13331',
    'bbm': 'x13321', 'bbmin': 'x13321',
    'eb': 'x68886', 'ebmaj': 'x68886',
    'ab': '466544', 'abmaj': '466544',
    'db': 'x43121', 'dbmaj': 'x43121',
};

function getTabShape(name) {
    const key = name.toLowerCase().replace(/\s+/g, '').replace('♯', '#').replace('♭', 'b');
    return CHORD_MAP[key] || null;
}

// Ukulele chord map (GCEA tuning, 4 characters: G C E A string positions)
const UKULELE_CHORD_MAP = {
    // Major
    'c': '0003', 'cmaj': '0003',
    'd': '2220', 'dmaj': '2220',
    'e': '4442', 'emaj': '4442',
    'f': '2010', 'fmaj': '2010',
    'g': '0232', 'gmaj': '0232',
    'a': '2100', 'amaj': '2100',
    'b': '4322', 'bmaj': '4322',
    // Minor
    'am': '2000', 'amin': '2000',
    'bm': '4222', 'bmin': '4222',
    'cm': '0333', 'cmin': '0333',
    'dm': '2210', 'dmin': '2210',
    'em': '0432', 'emin': '0432',
    'fm': '1013', 'fmin': '1013',
    'gm': '0231', 'gmin': '0231',
    // Dominant 7th
    'a7': '0100', 'b7': '2322', 'c7': '0001',
    'd7': '2223', 'e7': '1202', 'f7': '2313', 'g7': '0212',
    // Major 7th
    'amaj7': '1100', 'cmaj7': '0002',
    'dmaj7': '2224', 'emaj7': '1302',
    'fmaj7': '2410', 'gmaj7': '0222',
    // Minor 7th
    'am7': '0000', 'bm7': '2222', 'cm7': '0331',
    'dm7': '2213', 'em7': '0202', 'fm7': '1313', 'gm7': '0211',
    // Sharp/flat roots
    'f#m': '2120', 'f#min': '2120',
    'bb': '3211', 'bbmaj': '3211',
    'bbm': '3111', 'bbmin': '3111',
    'eb': '3331', 'ebmaj': '3331',
    'db': '1114', 'dbmaj': '1114',
};

function getUkeTabShape(name) {
    const key = name.toLowerCase().replace(/\s+/g, '').replace('♯', '#').replace('♭', 'b');
    return UKULELE_CHORD_MAP[key] || null;
}

const BRACKET_RE = /\[([A-G][#b]?(?:m(?:aj)?|maj|aug|dim|sus|add)?(?:\d+)?(?:\/[A-G][#b]?)?)\]/gi;
const CHORD_TOKEN_RE = /^[A-G][#b]?(?:m(?:aj)?|maj|aug|dim|sus|add)?(?:\d+)?(?:\/[A-G][#b]?)?$/i;

export function extractChords(text) {
    const seen = new Set();
    const chords = [];

    const add = (name) => {
        const key = name.toLowerCase();
        if (!seen.has(key)) { seen.add(key); chords.push(name); }
    };

    for (const line of text.split('\n')) {
        // Bracket notation: [G], [Am7], [F#m], etc.
        BRACKET_RE.lastIndex = 0;
        let m;
        while ((m = BRACKET_RE.exec(line)) !== null) {
            add(m[1]);
        }

        // Standalone chord lines: lines where every token looks like a chord
        const stripped = line.replace(/\[.*?\]/g, '').trim();
        if (stripped) {
            const tokens = stripped.split(/\s+/);
            if (tokens.length >= 1 && tokens.every(t => CHORD_TOKEN_RE.test(t))) {
                tokens.forEach(t => add(t));
            }
        }
    }

    return chords;
}

// Finds where to break a long line: the comma closest to the midpoint (only
// if it falls within the middle portion of the line, so a comma near either
// end doesn't produce a lopsided split), or otherwise the space closest to
// the midpoint. Returns -1 if the line has no break point (e.g. a single
// long word).
function findSplitPoint(text) {
    const midpoint = text.length / 2;
    // A comma outside this middle band is too close to an edge to produce a
    // reasonably balanced split, so it's ignored in favor of a space.
    const bandStart = text.length * 0.25;
    const bandEnd = text.length * 0.75;

    let bestComma = -1, bestCommaDist = Infinity;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === ',' && i >= bandStart && i <= bandEnd) {
            const dist = Math.abs(i - midpoint);
            if (dist < bestCommaDist) { bestCommaDist = dist; bestComma = i; }
        }
    }
    if (bestComma !== -1) return bestComma + 1; // break after the comma

    let bestSpace = -1, bestSpaceDist = Infinity;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') {
            const dist = Math.abs(i - midpoint);
            if (dist < bestSpaceDist) { bestSpaceDist = dist; bestSpace = i; }
        }
    }
    return bestSpace; // break before the space (space itself is dropped)
}

// Splits a plain text line into multiple lines if it exceeds maxLength,
// breaking at the comma nearest the midpoint or, failing that, the nearest
// space. Recurses so very long lines can split more than once.
export function splitLongLine(text, maxLength = 50) {
    if (!text || text.length <= maxLength) return [text];

    const splitAt = findSplitPoint(text);
    if (splitAt <= 0 || splitAt >= text.length) return [text];

    const first = text.slice(0, splitAt).trimEnd();
    const second = text.slice(splitAt).trimStart();
    if (!first || !second) return [text];

    return [...splitLongLine(first, maxLength), ...splitLongLine(second, maxLength)];
}

// Moves inline [Chord] tags onto their own line directly above the line they
// were found in, joined with " | ", and strips the brackets from the lyric line.
export function moveChordsAboveLines(text) {
    if (!text) return text;

    return text.split('\n').map(line => {
        const chords = [];
        let m;
        BRACKET_RE.lastIndex = 0;
        while ((m = BRACKET_RE.exec(line)) !== null) {
            chords.push(m[1]);
        }
        if (chords.length === 0) return line;

        const strippedLine = line
            .replace(new RegExp(BRACKET_RE.source, 'gi'), ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const chordLine = chords.join(' | ');
        return strippedLine ? `${chordLine}\n${strippedLine}` : chordLine;
    }).join('\n');
}

// Strips all inline [Chord] tags from the lyrics and collects them, in the
// order they appeared (duplicates kept), into a single chord line placed
// above the plain lyrics.
export function moveChordsToTop(text) {
    if (!text) return text;

    const chords = [];
    const strippedLines = text.split('\n').map(line => {
        let m;
        BRACKET_RE.lastIndex = 0;
        while ((m = BRACKET_RE.exec(line)) !== null) {
            chords.push(m[1]);
        }
        return line
            .replace(new RegExp(BRACKET_RE.source, 'gi'), ' ')
            .replace(/\s+/g, ' ')
            .trim();
    });

    if (chords.length === 0) return strippedLines.join('\n');

    const chordLine = chords.join(' | ');
    return `${chordLine}\n\n${strippedLines.join('\n')}`;
}

// Renders inline [Chord] tags as a chord row positioned directly above the
// lyric line, with each chord starting at the column of the character it
// preceded (ChordPro-style). When chords would overlap in the chord row
// (e.g. back-to-back tags like [G][D]the), later chords are pushed right
// just far enough to leave a single space of separation.
export function alignChordsToLyrics(text, maxLength = 50) {
    if (!text) return text;

    return text.split('\n').map(line => {
        // Walk the line splitting on chord tags, tracking each tag's column
        // in the lyric-only text being built up. Every removed tag leaves a
        // space behind so words on either side don't glue together (e.g.
        // "damp[C]When" or back-to-back "within[G][D]the"), matching
        // moveChordsAboveLines — but only if one isn't already there, so the
        // string is never mutated after columns are recorded (a later
        // whitespace collapse would desync chord columns from their text).
        const chords = [];
        let lyricLine = '';
        let lastIndex = 0;
        BRACKET_RE.lastIndex = 0;
        let m;
        while ((m = BRACKET_RE.exec(line)) !== null) {
            lyricLine += line.slice(lastIndex, m.index);
            const nextChar = line[BRACKET_RE.lastIndex];
            const needsSpace = lyricLine.length > 0 && !/\s$/.test(lyricLine) &&
                nextChar !== undefined && nextChar !== ' ' && nextChar !== '[';
            if (needsSpace) {
                lyricLine += ' ';
            }
            chords.push({ name: m[1], column: lyricLine.length });
            lastIndex = BRACKET_RE.lastIndex;
        }
        lyricLine += line.slice(lastIndex);
        lyricLine = lyricLine.trim();

        if (chords.length === 0) return lyricLine;

        return buildAlignedRowPairs(lyricLine, chords, maxLength).join('\n');
    }).join('\n');
}

// Builds chord-row/lyric-row line pairs for one source line, splitting the
// lyric line (at the comma/space nearest its midpoint, same rule as
// splitLongLine) when it exceeds maxLength, and partitioning the chords
// between the resulting rows so each chord stays above the character it
// preceded.
function buildAlignedRowPairs(lyricLine, chords, maxLength) {
    if (lyricLine.length <= maxLength) {
        return [renderChordRow(chords), lyricLine].filter(Boolean);
    }

    const splitAt = findSplitPoint(lyricLine);
    if (splitAt <= 0 || splitAt >= lyricLine.length) {
        return [renderChordRow(chords), lyricLine].filter(Boolean);
    }

    const firstLyric = lyricLine.slice(0, splitAt).trimEnd();
    const secondRaw = lyricLine.slice(splitAt);
    const secondLyric = secondRaw.trimStart();
    const leadTrim = secondRaw.length - secondLyric.length;
    if (!firstLyric || !secondLyric) {
        return [renderChordRow(chords), lyricLine].filter(Boolean);
    }

    const firstChords = chords.filter(c => c.column <= firstLyric.length);
    const secondChords = chords
        .filter(c => c.column > firstLyric.length)
        .map(c => ({ name: c.name, column: Math.max(0, c.column - splitAt - leadTrim) }));

    return [
        ...buildAlignedRowPairs(firstLyric, firstChords, maxLength),
        ...buildAlignedRowPairs(secondLyric, secondChords, maxLength)
    ];
}

function renderChordRow(chords) {
    let chordRow = '';
    chords.forEach(({ name, column }) => {
        const startAt = Math.max(column, chordRow.length === 0 ? 0 : chordRow.length + 1);
        chordRow = chordRow.padEnd(startAt, ' ') + name;
    });
    return chordRow;
}

export function renderChordSummary(chords, instrument = 'guitar') {
    const isUke = instrument === 'ukulele';
    const numStrings = isUke ? 4 : 6;

    const items = chords
        .map(name => {
            // For slash chords like G/B, look up the base chord
            const baseName = name.split('/')[0];
            const tab = isUke ? getUkeTabShape(baseName) : getTabShape(baseName);
            if (!tab) return null;
            return `<div class="chord-diagram-item">
                <div class="chord-diagram-svg">${generateChordSVG(tab, numStrings)}</div>
                <div class="chord-diagram-name">${name}</div>
            </div>`;
        })
        .filter(Boolean);

    if (items.length === 0) return null;

    return `<div class="chord-summary" id="chordSummary">${items.join('')}</div>`;
}
