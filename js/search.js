// Song search functionality - searches across all sets

(function () {
    const EXCLUDED_KEYS = new Set(['lastViewedSong', 'theme-preference']);

    function getAllSongs() {
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

    function renderResults(query) {
        const results = document.getElementById('searchResults');
        if (!results) return;

        const q = query.trim().toLowerCase();
        const songs = getAllSongs();
        const matches = q
            ? songs.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q))
            : songs;

        results.innerHTML = '';

        if (matches.length === 0) {
            const li = document.createElement('li');
            li.className = 'list-group-item text-muted';
            li.textContent = 'No songs found.';
            results.appendChild(li);
            return;
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
                // Switch to the song's set and load it
                if (typeof window.updateSongDropdown === 'function') {
                    window.updateSongDropdown(song.set, true);
                }
                if (typeof autoFitLyrics === 'function') {
                    autoFitLyrics(song.title, song.artist, song.lyrics);
                } else if (typeof displayLyrics === 'function') {
                    displayLyrics(song.title, song.artist, song.lyrics);
                }
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('searchModal'));
                if (modal) modal.hide();
            });

            results.appendChild(li);
        });
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    document.addEventListener('DOMContentLoaded', () => {
        const searchModal = document.getElementById('searchModal');
        const searchInput = document.getElementById('searchInput');

        if (!searchModal || !searchInput) return;

        // Clear and focus input when modal opens, show all songs
        searchModal.addEventListener('shown.bs.modal', () => {
            searchInput.value = '';
            renderResults('');
            searchInput.focus();
        });

        // Live search as user types
        searchInput.addEventListener('input', () => renderResults(searchInput.value));
    });
})();
