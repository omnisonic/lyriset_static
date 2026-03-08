// Song search functionality - searches across all sets

const EXCLUDED_KEYS = new Set(['lastViewedSong', 'theme-preference']);

export function getAllSongs() {
    const songs = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || EXCLUDED_KEYS.has(key) || key.startsWith('lyrics-font-size-') || key.startsWith('metronome-bpm-')) continue;
        try {
            const data = JSON.parse(localStorage.getItem(key));
            if (data && typeof data === 'object' && data.lyrics) {
                songs.push({ title: key, artist: data.artist || '', set: data.set || 1, lyrics: data.lyrics });
            }
        } catch (e) { /* skip malformed */ }
    }
    return songs.sort((a, b) => a.title.localeCompare(b.title));
}

export function filterSongs(songs, query) {
    const q = query.trim().toLowerCase();
    if (!q) return songs;
    return songs.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q));
}

export function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function renderResults(query) {
    const results = document.getElementById('searchResults');
    if (!results) return;

    const matches = filterSongs(getAllSongs(), query);
    results.innerHTML = '';

    if (matches.length === 0 && query.trim()) {
        const li = document.createElement('li');
        li.className = 'list-group-item text-muted';
        li.textContent = 'No songs found in your library.';
        results.appendChild(li);
    }

    const q = query.trim();
    if (q) {
        const encoded = encodeURIComponent(q.replace(/\s+/g, '+'));
        const li = document.createElement('li');
        li.className = 'list-group-item text-muted small';
        li.innerHTML = `Find chords for "${escapeHtml(q)}" on: `
            + `<a href="https://www.guitaretab.com/fetch/?type=tab&query=${encoded}" target="_blank" rel="noopener">Guitaretab</a>`
            + ` &middot; `
            + `<a href="http://www.chordie.com/results.php?q=${encoded}" target="_blank" rel="noopener">Chordie</a>`;
        results.appendChild(li);
    }

    matches.forEach(song => {
        const li = document.createElement('li');
        li.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        li.style.cursor = 'pointer';

        const text = document.createElement('span');
        text.innerHTML = `<strong>${escapeHtml(song.title)}</strong>${song.artist ? ` <span class="text-muted">— ${escapeHtml(song.artist)}</span>` : ''}`;

        const badge = document.createElement('span');
        badge.className = 'badge rounded-pill ms-2';
        badge.style.fontSize = '0.7em';
        badge.textContent = `Set ${song.set}`;

        li.appendChild(text);
        li.appendChild(badge);

        li.addEventListener('click', () => {
            if (typeof window.updateSongDropdown === 'function') {
                window.updateSongDropdown(song.set, true);
            }
            if (typeof autoFitLyrics === 'function') {
                autoFitLyrics(song.title, song.artist, song.lyrics);
            } else if (typeof displayLyrics === 'function') {
                displayLyrics(song.title, song.artist, song.lyrics);
            }
            const modal = bootstrap.Modal.getInstance(document.getElementById('searchModal'));
            if (modal) modal.hide();
        });

        results.appendChild(li);
    });

    const chordLinks = document.getElementById('chordLinks');
    if (chordLinks) {
        const q = query.trim();
        if (q) {
            const encoded = encodeURIComponent(q.replace(/\s+/g, '+'));
            chordLinks.style.display = 'block';
            chordLinks.innerHTML = `Find chords for "${escapeHtml(q)}" on: `
                + `<a href="https://www.guitaretab.com/fetch/?type=tab&query=${encoded}" target="_blank" rel="noopener">Guitaretab</a>`
                + ` &middot; `
                + `<a href="http://www.chordie.com/results.php?q=${encoded}" target="_blank" rel="noopener">Chordie</a>`;
        } else {
            chordLinks.style.display = 'none';
            chordLinks.innerHTML = '';
        }
    }
}

// --- lrclib.net lyrics search ---

let lrclibDebounce = null;

function triggerLrclibSearch(query) {
    const section = document.getElementById('lrclibSection');
    const results = document.getElementById('lrclibResults');
    if (!section || !results) return;

    clearTimeout(lrclibDebounce);

    if (query.trim().length < 2) {
        section.style.display = 'none';
        results.innerHTML = '';
        return;
    }

    section.style.display = 'block';
    results.innerHTML = '<li class="list-group-item text-muted">Searching lyrics...</li>';

    lrclibDebounce = setTimeout(() => fetchLrclibResults(query), 500);
}

async function fetchLrclibResults(query) {
    const results = document.getElementById('lrclibResults');
    if (!results) return;

    try {
        const res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Search failed');
        const songs = await res.json();
        renderLrclibResults(songs.filter(s => s.plainLyrics).slice(0, 15));
    } catch {
        results.innerHTML = '<li class="list-group-item text-muted">Could not reach lrclib.net</li>';
    }
}

function renderLrclibResults(songs) {
    const results = document.getElementById('lrclibResults');
    if (!results) return;
    results.innerHTML = '';

    if (songs.length === 0) {
        const li = document.createElement('li');
        li.className = 'list-group-item text-muted';
        li.textContent = 'No lyrics found.';
        results.appendChild(li);
        return;
    }

    songs.forEach(song => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';

        const text = document.createElement('span');
        text.innerHTML = `<strong>${escapeHtml(song.trackName)}</strong> <span class="text-muted">— ${escapeHtml(song.artistName)}</span>`;

        const btn = document.createElement('button');
        btn.className = 'btn btn-sm btn-outline-secondary ms-2 flex-shrink-0';
        btn.textContent = 'Add';
        btn.addEventListener('click', () => addLrclibSong(song));

        li.appendChild(text);
        li.appendChild(btn);
        results.appendChild(li);
    });
}

function addLrclibSong(song) {
    // Close search modal
    const searchModal = bootstrap.Modal.getInstance(document.getElementById('searchModal'));
    if (searchModal) searchModal.hide();

    // Pre-fill add song modal
    document.getElementById('songInput').value = song.trackName;
    document.getElementById('artistInput').value = song.artistName;
    document.getElementById('lyricsText').value = song.plainLyrics;

    // Open add song modal
    const addModal = new bootstrap.Modal(document.getElementById('lyricsModal'));
    addModal.show();
}

// --- Chordie chords search ---

function updateChordieButton(query) {
    const btn = document.getElementById('chordieSearchBtn');
    const results = document.getElementById('chordieResults');
    if (!btn) return;

    if (query.trim().length >= 2) {
        btn.style.display = 'inline-block';
        btn.dataset.query = query;
    } else {
        btn.style.display = 'none';
        if (results) results.innerHTML = '';
    }
}

async function fetchChordieResults(query) {
    const results = document.getElementById('chordieResults');
    if (!results) return;

    try {
        const res = await fetch(`https://lyriset.netlify.app/.netlify/functions/search-chordie?query=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Search failed');
        const songs = await res.json();
        renderChordieResults(songs);
    } catch {
        results.innerHTML = '<li class="list-group-item text-muted">Could not reach chordie.com</li>';
    }
}

function renderChordieResults(songs) {
    const results = document.getElementById('chordieResults');
    if (!results) return;
    results.innerHTML = '';

    if (songs.length === 0) {
        const li = document.createElement('li');
        li.className = 'list-group-item text-muted';
        li.textContent = 'No chords found.';
        results.appendChild(li);
        return;
    }

    songs.forEach(song => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';

        const text = document.createElement('span');
        text.innerHTML = `<strong>${escapeHtml(song.title)}</strong>${song.artist ? ` <span class="text-muted">— ${escapeHtml(song.artist)}</span>` : ''}`;

        const btn = document.createElement('button');
        btn.className = 'btn btn-sm btn-outline-secondary ms-2 flex-shrink-0';
        btn.textContent = 'Add';
        btn.addEventListener('click', () => fetchAndAddChordie(song, btn));

        li.appendChild(text);
        li.appendChild(btn);
        results.appendChild(li);
    });
}

async function fetchAndAddChordie(song, btn) {
    btn.disabled = true;
    btn.textContent = '...';

    try {
        const res = await fetch(`https://lyriset.netlify.app/.netlify/functions/fetch-chordie?path=${encodeURIComponent(song.path)}&title=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(song.artist)}`);
        if (!res.ok) throw new Error('Fetch failed');
        const { chords } = await res.json();

        const searchModal = bootstrap.Modal.getInstance(document.getElementById('searchModal'));
        if (searchModal) searchModal.hide();

        document.getElementById('songInput').value = song.title;
        document.getElementById('artistInput').value = song.artist;
        document.getElementById('lyricsText').value = chords;

        const addModal = new bootstrap.Modal(document.getElementById('lyricsModal'));
        addModal.show();
    } catch {
        btn.disabled = false;
        btn.textContent = 'Add';
        alert('Could not fetch chords. Try again.');
    }
}

// --- Init ---

document.addEventListener('DOMContentLoaded', () => {
    const searchModal = document.getElementById('searchModal');
    const searchInput = document.getElementById('searchInput');

    if (!searchModal || !searchInput) return;

    searchModal.addEventListener('shown.bs.modal', () => {
        searchInput.value = '';
        renderResults('');
        const lrclibSection = document.getElementById('lrclibSection');
        if (lrclibSection) lrclibSection.style.display = 'none';
        const chordLinks = document.getElementById('chordLinks');
        if (chordLinks) chordLinks.style.display = 'none';
        const chordieBtn = document.getElementById('chordieSearchBtn');
        if (chordieBtn) { chordieBtn.style.display = 'none'; }
        const chordieResults = document.getElementById('chordieResults');
        if (chordieResults) chordieResults.innerHTML = '';
        searchInput.focus();
    });

    searchInput.addEventListener('input', () => {
        renderResults(searchInput.value);
        triggerLrclibSearch(searchInput.value);
        updateChordieButton(searchInput.value);
    });

    const chordieSearchBtn = document.getElementById('chordieSearchBtn');
    if (chordieSearchBtn) {
        chordieSearchBtn.addEventListener('click', () => {
            const query = chordieSearchBtn.dataset.query || searchInput.value;
            fetchChordieResults(query);
            chordieSearchBtn.style.display = 'none';
        });
    }
});
