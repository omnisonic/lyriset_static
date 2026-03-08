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

// --- External search state ---

let lrclibState = null;   // null | 'loading' | Song[]
let chordieState = null;  // null | 'loading' | Song[]
let lrclibDebounce = null;
let chordieDebounce = null;

function getCurrentQuery() {
    return document.getElementById('searchInput')?.value || '';
}

function isLrclibEnabled() {
    return document.getElementById('lrclibEnabled')?.checked ?? false;
}

function isChordieEnabled() {
    return document.getElementById('chordieEnabled')?.checked ?? false;
}

// --- Render helpers ---

function appendHeader(list, text) {
    const li = document.createElement('li');
    li.className = 'list-group-item py-2 small fw-semibold';
    li.style.cssText = 'pointer-events:none; border-top: 2px solid var(--bs-border-color, #dee2e6); background: var(--bs-tertiary-bg, #f8f9fa); color: var(--bs-secondary-color, #6c757d); letter-spacing: 0.04em; text-transform: uppercase; font-size: 0.7em !important;';
    li.textContent = text;
    list.appendChild(li);
}

function appendMsg(list, text) {
    const li = document.createElement('li');
    li.className = 'list-group-item text-muted small';
    li.textContent = text;
    list.appendChild(li);
}

function appendLoading(list) {
    const li = document.createElement('li');
    li.className = 'list-group-item text-muted small d-flex align-items-center gap-2';
    li.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Searching...';
    list.appendChild(li);
}

function makeLocalItem(song) {
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

    return li;
}

function makeLrclibItem(song) {
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
    return li;
}

function makeChordieItem(song) {
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
    return li;
}

// --- Unified render ---

function renderAllResults(query) {
    const list = document.getElementById('searchResults');
    if (!list) return;
    list.innerHTML = '';

    const q = query.trim();
    const local = filterSongs(getAllSongs(), query);
    const lrclibOn = isLrclibEnabled();
    const chordieOn = isChordieEnabled();
    const anyExternal = lrclibOn || chordieOn;

    // Chordie results
    if (chordieOn && q.length >= 2) {
        appendHeader(list, 'Chordie — chords & lyrics');
        if (chordieState === 'loading') {
            appendLoading(list);
        } else if (Array.isArray(chordieState)) {
            if (chordieState.length === 0) appendMsg(list, 'No chords found.');
            else chordieState.forEach(song => list.appendChild(makeChordieItem(song)));
        }
    }

    // lrclib results
    if (lrclibOn && q.length >= 2) {
        appendHeader(list, 'lrclib.net — lyrics only');
        if (lrclibState === 'loading') {
            appendLoading(list);
        } else if (Array.isArray(lrclibState)) {
            if (lrclibState.length === 0) appendMsg(list, 'No lyrics found.');
            else lrclibState.forEach(song => list.appendChild(makeLrclibItem(song)));
        }
    }

    // Local results
    if (local.length === 0 && q) {
        if (anyExternal) appendHeader(list, 'Library');
        appendMsg(list, 'No songs found in your library.');
    } else if (local.length > 0) {
        if (anyExternal) appendHeader(list, 'Library');
        local.forEach(song => list.appendChild(makeLocalItem(song)));
    }

    // Direct search links
    const chordLinks = document.getElementById('chordLinks');
    if (chordLinks) {
        if (q) {
            const encoded = encodeURIComponent(q.replace(/\s+/g, '+'));
            chordLinks.style.display = 'block';
            chordLinks.innerHTML = `Find results for &ldquo;${escapeHtml(q)}&rdquo; directly on: `
                + `<a href="https://www.guitaretab.com/fetch/?type=tab&query=${encoded}" target="_blank" rel="noopener">Guitaretab</a>`
                + ` &middot; `
                + `<a href="http://www.chordie.com/results.php?q=${encoded}" target="_blank" rel="noopener">Chordie</a>`
                + ` &middot; `
                + `<a href="https://lrclib.net/search?q=${encodeURIComponent(q)}" target="_blank" rel="noopener">lrclib.net</a>`;
        } else {
            chordLinks.style.display = 'none';
            chordLinks.innerHTML = '';
        }
    }
}

export function renderResults(query) {
    renderAllResults(query);
}

// --- lrclib.net ---

async function fetchLrclibResults(query) {
    try {
        const res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Search failed');
        const songs = await res.json();
        const seen = new Set();
        lrclibState = songs.filter(s => {
            if (!s.plainLyrics) return false;
            const key = `${s.trackName}|||${s.artistName}`.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        }).slice(0, 15);
    } catch {
        lrclibState = [];
    }
    renderAllResults(getCurrentQuery());
}

function triggerLrclib(query) {
    clearTimeout(lrclibDebounce);
    const q = query.trim();
    if (isLrclibEnabled() && q.length >= 2) {
        lrclibState = 'loading';
        lrclibDebounce = setTimeout(() => fetchLrclibResults(query), 500);
    } else {
        lrclibState = null;
    }
}

function addLrclibSong(song) {
    const searchModal = bootstrap.Modal.getInstance(document.getElementById('searchModal'));
    if (searchModal) searchModal.hide();

    const formTypeInput = document.getElementById('formType');
    if (formTypeInput) formTypeInput.value = 'add';
    const origInput = document.getElementById('originalSongTitle');
    if (origInput) origInput.value = '';
    const label = document.getElementById('lyricsModalLabel');
    if (label) label.textContent = 'Add Song';

    document.getElementById('songInput').value = song.trackName;
    document.getElementById('artistInput').value = song.artistName;
    document.getElementById('lyricsText').value = song.plainLyrics;
    const setSelect = document.getElementById('setSelect');
    if (setSelect) setSelect.value = window.currentSetNumber || 1;

    const toggle = document.getElementById('moveCopyToggle');
    if (toggle) toggle.style.display = (song.trackName && localStorage.getItem(song.trackName)) ? 'flex' : 'none';
    const moveRadio = document.querySelector('input[name="moveCopy"][value="move"]');
    if (moveRadio) moveRadio.checked = true;

    const addModal = new bootstrap.Modal(document.getElementById('lyricsModal'));
    addModal.show();
}

// --- Chordie ---

async function fetchChordieResults(query) {
    try {
        const res = await fetch(`https://lyriset.netlify.app/.netlify/functions/search-chordie?query=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Search failed');
        const songs = await res.json();
        chordieState = songs;
    } catch {
        chordieState = [];
    }
    renderAllResults(getCurrentQuery());
}

function triggerChordie(query) {
    clearTimeout(chordieDebounce);
    const q = query.trim();
    if (isChordieEnabled() && q.length >= 2) {
        chordieState = 'loading';
        chordieDebounce = setTimeout(() => fetchChordieResults(query), 600);
    } else {
        chordieState = null;
    }
}

async function fetchAndAddChordie(song, btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

    try {
        const res = await fetch(`https://lyriset.netlify.app/.netlify/functions/fetch-chordie?path=${encodeURIComponent(song.path)}&title=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(song.artist)}`);
        if (!res.ok) throw new Error('Fetch failed');
        const { chords } = await res.json();

        const searchModal = bootstrap.Modal.getInstance(document.getElementById('searchModal'));
        if (searchModal) searchModal.hide();

        const formTypeInput = document.getElementById('formType');
        if (formTypeInput) formTypeInput.value = 'add';
        const origInput = document.getElementById('originalSongTitle');
        if (origInput) origInput.value = '';
        const label = document.getElementById('lyricsModalLabel');
        if (label) label.textContent = 'Add Song';

        document.getElementById('songInput').value = song.title;
        document.getElementById('artistInput').value = song.artist;
        document.getElementById('lyricsText').value = chords;
        const setSelect = document.getElementById('setSelect');
        if (setSelect) setSelect.value = window.currentSetNumber || 1;

        const toggle = document.getElementById('moveCopyToggle');
        if (toggle) toggle.style.display = (song.title && localStorage.getItem(song.title)) ? 'flex' : 'none';
        const moveRadio = document.querySelector('input[name="moveCopy"][value="move"]');
        if (moveRadio) moveRadio.checked = true;

        const addModal = new bootstrap.Modal(document.getElementById('lyricsModal'));
        addModal.show();
    } catch {
        btn.disabled = false;
        btn.innerHTML = 'Add';
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
        lrclibState = null;
        chordieState = null;
        renderAllResults('');
        const chordLinks = document.getElementById('chordLinks');
        if (chordLinks) chordLinks.style.display = 'none';
        searchInput.focus();
    });

    searchModal.addEventListener('hidden.bs.modal', () => {
        document.getElementById('lrclibEnabled').checked = false;
        document.getElementById('chordieEnabled').checked = false;
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value;
        triggerLrclib(query);
        triggerChordie(query);
        renderAllResults(query);
    });

    document.getElementById('lrclibEnabled')?.addEventListener('change', () => {
        const query = searchInput.value;
        if (!isLrclibEnabled()) { lrclibState = null; }
        triggerLrclib(query);
        renderAllResults(query);
    });

    document.getElementById('chordieEnabled')?.addEventListener('change', () => {
        const query = searchInput.value;
        if (!isChordieEnabled()) { chordieState = null; }
        triggerChordie(query);
        renderAllResults(query);
    });
});
