function toggleCleanLyrics() {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    const toggleButton = document.getElementById('toggleCleanLyricsButton');
    const toggleText = document.getElementById('toggleCleanLyricsText');
    
    if (!lyricsContainer) {
        console.error('Lyrics container not found');
        return;
    }
    
    const originalLyrics = lyricsContainer.getAttribute('data-original-lyrics');
    const isClean = lyricsContainer.getAttribute('data-clean') === 'true';
    
    if (!originalLyrics) {
        console.error('No original lyrics found');
        return;
    }

    const song = document.getElementById('songTitle').textContent;
    const artist = document.getElementById('songArtist').textContent;
    if (isClean) {
        displayLyrics(song, artist, originalLyrics);
        toggleText.textContent = '✓';
        toggleButton.classList.add('active');
        lyricsContainer.setAttribute('data-clean', 'false');
    } else {
        const cleanedLyrics = cleanLyrics(originalLyrics);
        if (cleanedLyrics) {
            displayLyrics(song, artist, cleanedLyrics);
            toggleText.textContent = '✱';
            toggleButton.classList.remove('active');
            lyricsContainer.setAttribute('data-clean', 'true');
        }
    }
}
    
function loadNextSong() {
    const currentSong = document.getElementById('songTitle').textContent;
    const songs = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'lyrics-font-size') {
            const songData = JSON.parse(localStorage.getItem(key));
            if (songData.set === window.currentSetNumber) {
                songs.push(key);
            }
        }
    }
    
    if (songs.length === 0) return;
    
    songs.sort();
    
    const currentIndex = songs.indexOf(currentSong);
    const nextIndex = currentIndex === songs.length - 1 ? 0 : currentIndex + 1;
    const nextSong = songs[nextIndex];
    const songData = JSON.parse(localStorage.getItem(nextSong));
    displayLyrics(nextSong, songData.artist, songData.lyrics);
}

function loadPrevSong() {
    const currentSong = document.getElementById('songTitle').textContent;
    const songs = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'lyrics-font-size') {
            const songData = JSON.parse(localStorage.getItem(key));
            if (songData.set === window.currentSetNumber) {
                songs.push(key);
            }
        }
    }
    
    if (songs.length === 0) return;
    
    songs.sort();
    
    const currentIndex = songs.indexOf(currentSong);
    const prevIndex = currentIndex <= 0 ? songs.length - 1 : currentIndex - 1;
    const prevSong = songs[prevIndex];
    
    const songData = JSON.parse(localStorage.getItem(prevSong));
    displayLyrics(prevSong, songData.artist, songData.lyrics);
}
    
function adjustFontSize(delta) {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (!lyricsContainer) {
        console.error('Lyrics container not found');
        return;
    }
    
    const currentSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
    const newSize = Math.min(Math.max(currentSize + delta, 8), 32);
    lyricsContainer.style.fontSize = `${newSize}px`;
    localStorage.setItem('lyrics-font-size', newSize);
}

function displayLyrics(song, artist, lyrics) {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (!lyricsContainer) {
        console.error('Lyrics container not found');
        return;
    }
    
    const titleElement = document.getElementById('songTitle');
    if (titleElement) {
        titleElement.textContent = song || 'Select a Song';
    }

    const artistElement = document.getElementById('songArtist');
    if (artistElement) {
        artistElement.textContent = artist || '';
    }

    lyricsContainer.innerHTML = '';

    const lyricsLines = (lyrics || '').split('\n');
    lyricsLines.forEach(line => {
        const lineDiv = document.createElement('div');
        lineDiv.textContent = line || '\u00A0';
        lyricsContainer.appendChild(lineDiv);
    });
    
    const currentStoredSong = lyricsContainer.getAttribute('data-song-title');
    if (!lyricsContainer.hasAttribute('data-original-lyrics') || currentStoredSong !== song) {
        lyricsContainer.setAttribute('data-original-lyrics', lyrics || '');
        lyricsContainer.setAttribute('data-song-title', song || '');
        lyricsContainer.setAttribute('data-clean', 'false');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('lyrics_url');
    const lyricsContainer = document.getElementById('lyricsDisplay');


    loadDefaultSongs().then(() => {
        updateSongDropdown(window.currentSetNumber);
    });
    
    if (!urlInput) {
        console.error('Element with ID "lyrics_url" not found.');
        return;
    }

    if (!lyricsContainer) {
        console.error('Lyrics container not found.');
        return;
    }

    const savedFontSize = localStorage.getItem('lyrics-font-size');
    if (savedFontSize) {
        lyricsContainer.style.fontSize = `${savedFontSize}px`;
    }

    const lyricsDisplay = lyricsContainer.textContent;
    lyricsContainer.setAttribute('data-original-lyrics', lyricsDisplay);
    const cleanedLyrics = cleanLyrics(lyricsDisplay);
    lyricsContainer.textContent = cleanedLyrics;

    const lyricsForm = document.getElementById('lyricsForm');
    if (lyricsForm) {
        lyricsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const song = document.getElementById('songInput').value.trim();
            const artist = document.getElementById('artistInput').value.trim();
            const lyrics = document.getElementById('lyricsText').value.trim();

            if (!song || !lyrics) return;

            localStorage.setItem(song, JSON.stringify({
                artist: artist,
                lyrics: lyrics,
                set: window.currentSetNumber
            }));

            displayLyrics(song, artist, lyrics);
            updateSongDropdown(window.currentSetNumber);

            e.target.reset();
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById('lyricsModal'));
            if (modalInstance) {
                modalInstance.hide();
            }
        });
    }
    
    // Initialize with Set 1
    window.currentSetNumber = 1;
    updateSongDropdown(1);
    
    if (lyricsContainer) {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                console.log('Container resized:', {
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });
        
        resizeObserver.observe(lyricsContainer);
    }
});

function deleteSong() {
    const currentSong = document.getElementById('songTitle').textContent;
    
    if (!currentSong || currentSong === 'Select a Song') {
        return;
    }

    if (!confirm(`Are you sure you want to delete "${currentSong}"?`)) {
        return;
    }

    localStorage.removeItem(currentSong);
    updateSongDropdown(window.currentSetNumber);
    displayLyrics('Select a Song', '', '');

    const remainingSongs = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'lyrics-font-size') {
            const songData = JSON.parse(localStorage.getItem(key));
            if (songData.set === window.currentSetNumber) {
                remainingSongs.push(key);
            }
        }
    }

    if (remainingSongs.length > 0) {
        const nextSong = remainingSongs[0];
        const songData = JSON.parse(localStorage.getItem(nextSong));
        displayLyrics(nextSong, songData.artist, songData.lyrics);
    }
}
