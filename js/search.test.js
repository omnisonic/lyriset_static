// search.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getAllSongs, filterSongs, escapeHtml, renderResults } from './search.js';

function storeSong(title, artist, lyrics, set = 1) {
    localStorage.setItem(title, JSON.stringify({ artist, lyrics, set }));
}

describe('getAllSongs', () => {
    beforeEach(() => localStorage.clear());

    it('returns all songs sorted alphabetically by title', () => {
        storeSong('Ziggy', 'Bowie', 'Lyrics', 1);
        storeSong('Amazing Grace', 'John Newton', 'Lyrics', 1);
        storeSong('Bohemian Rhapsody', 'Queen', 'Lyrics', 2);

        const songs = getAllSongs();
        expect(songs.map(s => s.title)).toEqual(['Amazing Grace', 'Bohemian Rhapsody', 'Ziggy']);
    });

    it('returns songs from all sets', () => {
        storeSong('Song A', 'Artist', 'Lyrics', 1);
        storeSong('Song B', 'Artist', 'Lyrics', 3);
        storeSong('Song C', 'Artist', 'Lyrics', 7);

        expect(getAllSongs()).toHaveLength(3);
    });

    it('excludes lastViewedSong and theme-preference keys', () => {
        localStorage.setItem('lastViewedSong', 'Song A');
        localStorage.setItem('theme-preference', 'dark');
        storeSong('Real Song', 'Artist', 'Lyrics', 1);

        const songs = getAllSongs();
        expect(songs).toHaveLength(1);
        expect(songs[0].title).toBe('Real Song');
    });

    it('excludes lyrics-font-size- and metronome-bpm- keys', () => {
        localStorage.setItem('lyrics-font-size-My Song', '18');
        localStorage.setItem('metronome-bpm-My Song', '120');
        storeSong('My Song', 'Artist', 'Lyrics', 1);

        const songs = getAllSongs();
        expect(songs).toHaveLength(1);
    });

    it('skips entries without lyrics', () => {
        localStorage.setItem('Bad Entry', JSON.stringify({ artist: 'X', set: 1 }));
        storeSong('Good Song', 'Artist', 'Real lyrics', 1);

        const songs = getAllSongs();
        expect(songs).toHaveLength(1);
        expect(songs[0].title).toBe('Good Song');
    });

    it('skips malformed JSON entries', () => {
        localStorage.setItem('Broken', 'not valid json');
        storeSong('Valid Song', 'Artist', 'Lyrics', 1);

        expect(getAllSongs()).toHaveLength(1);
    });

    it('defaults missing artist to empty string', () => {
        localStorage.setItem('Folk Song', JSON.stringify({ lyrics: 'La la la', set: 1 }));

        const songs = getAllSongs();
        expect(songs[0].artist).toBe('');
    });

    it('defaults missing set to 1', () => {
        localStorage.setItem('Old Song', JSON.stringify({ artist: 'X', lyrics: 'Lyrics' }));

        const songs = getAllSongs();
        expect(songs[0].set).toBe(1);
    });

    it('returns empty array when localStorage is empty', () => {
        expect(getAllSongs()).toEqual([]);
    });
});

describe('filterSongs', () => {
    const songs = [
        { title: 'Amazing Grace', artist: 'John Newton', set: 1, lyrics: 'L' },
        { title: 'Bohemian Rhapsody', artist: 'Queen', set: 2, lyrics: 'L' },
        { title: 'Hotel California', artist: 'Eagles', set: 1, lyrics: 'L' },
        { title: 'Wonderwall', artist: 'Oasis', set: 3, lyrics: 'L' },
    ];

    it('returns all songs when query is empty', () => {
        expect(filterSongs(songs, '')).toHaveLength(4);
    });

    it('returns all songs when query is only whitespace', () => {
        expect(filterSongs(songs, '   ')).toHaveLength(4);
    });

    it('filters by title (case-insensitive)', () => {
        const results = filterSongs(songs, 'amazing');
        expect(results).toHaveLength(1);
        expect(results[0].title).toBe('Amazing Grace');
    });

    it('filters by artist (case-insensitive)', () => {
        const results = filterSongs(songs, 'queen');
        expect(results).toHaveLength(1);
        expect(results[0].title).toBe('Bohemian Rhapsody');
    });

    it('matches partial title', () => {
        const results = filterSongs(songs, 'hotel');
        expect(results).toHaveLength(1);
        expect(results[0].title).toBe('Hotel California');
    });

    it('matches partial artist', () => {
        const results = filterSongs(songs, 'oasis');
        expect(results).toHaveLength(1);
        expect(results[0].title).toBe('Wonderwall');
    });

    it('returns empty array when no match', () => {
        expect(filterSongs(songs, 'zzznomatch')).toHaveLength(0);
    });

    it('matches multiple results', () => {
        // Both "Hotel California" (artist Eagles) and "Amazing Grace" have 'a' in title
        const results = filterSongs(songs, 'a');
        expect(results.length).toBeGreaterThan(1);
    });
});

describe('escapeHtml', () => {
    it('escapes ampersands', () => {
        expect(escapeHtml('Rock & Roll')).toBe('Rock &amp; Roll');
    });

    it('escapes less-than and greater-than', () => {
        expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    });

    it('escapes double quotes', () => {
        expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
    });

    it('leaves plain text unchanged', () => {
        expect(escapeHtml('Hello World')).toBe('Hello World');
    });
});

describe('renderResults', () => {
    beforeEach(() => {
        localStorage.clear();
        document.body.innerHTML = `<ul id="searchResults"></ul>`;
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('shows "No songs found." when no songs match', () => {
        renderResults('zzznomatch');
        const items = document.querySelectorAll('#searchResults li');
        expect(items).toHaveLength(1);
        expect(items[0].textContent).toBe('No songs found.');
    });

    it('renders one item per matching song', () => {
        storeSong('Song A', 'Artist', 'Lyrics', 1);
        storeSong('Song B', 'Artist', 'Lyrics', 2);
        renderResults('');
        expect(document.querySelectorAll('#searchResults li')).toHaveLength(2);
    });

    it('renders the set badge with correct set number', () => {
        storeSong('My Song', 'Artist', 'Lyrics', 3);
        renderResults('');
        const badge = document.querySelector('#searchResults .badge');
        expect(badge.textContent).toBe('Set 3');
    });

    it('renders song title in a <strong> element', () => {
        storeSong('Bold Title', 'Artist', 'Lyrics', 1);
        renderResults('');
        const strong = document.querySelector('#searchResults strong');
        expect(strong.textContent).toBe('Bold Title');
    });

    it('filters results based on query', () => {
        storeSong('Amazing Grace', 'John Newton', 'Lyrics', 1);
        storeSong('Wonderwall', 'Oasis', 'Lyrics', 1);
        renderResults('amazing');
        const items = document.querySelectorAll('#searchResults li');
        expect(items).toHaveLength(1);
        expect(items[0].querySelector('strong').textContent).toBe('Amazing Grace');
    });

    it('clicking a result calls updateSongDropdown and displayLyrics', () => {
        storeSong('Click Me', 'Artist', 'Lyrics here', 2);
        window.updateSongDropdown = vi.fn();
        window.displayLyrics = vi.fn();
        global.bootstrap = { Modal: { getInstance: vi.fn().mockReturnValue(null) } };

        renderResults('');
        document.querySelector('#searchResults li').click();

        expect(window.updateSongDropdown).toHaveBeenCalledWith(2, true);
        expect(window.displayLyrics).toHaveBeenCalledWith('Click Me', 'Artist', 'Lyrics here');

        delete global.bootstrap;
    });
});
