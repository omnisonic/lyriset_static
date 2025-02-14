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
        if (key !== 'lyrics-font-size' && key !== 'lastViewedSong') {
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
    try {
        const songData = JSON.parse(localStorage.getItem(nextSong));
        displayLyrics(nextSong, songData.artist, songData.lyrics);
    } catch (e) {
        console.error("Error parsing JSON for song: " + nextSong, localStorage.getItem(nextSong), e);
    }
}

function loadPrevSong() {
    const currentSong = document.getElementById('songTitle').textContent;
    const songs = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'lyrics-font-size' && key !== 'lastViewedSong') {
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
    // localStorage.setItem('lyrics-font-size', newSize);
}

function displayLyrics(song, artist, lyrics) {
    console.log(`Displaying lyrics for: ${song}`);

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

    localStorage.setItem('lastViewedSong', song);
    console.log(`Setting last viewed song to: ${song}`);

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

    const lyricsModal = document.getElementById('lyricsModal');
    if (lyricsModal) {
        lyricsModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            const formType = button.textContent.trim() === 'Add Song' ? 'add' : 'edit';
            const formTypeInput = document.getElementById('formType');
            if (formTypeInput) {
                formTypeInput.value = formType;
            }
        });
    }
}

function loadLastViewedSong() {
    const lastViewedSong = localStorage.getItem('lastViewedSong');
    if (lastViewedSong && lastViewedSong !== 'Select a Song') {
        if (localStorage.getItem(lastViewedSong)) {
            try {
                const songData = JSON.parse(localStorage.getItem(lastViewedSong));
                if (songData) {
                    console.log(`Loading last viewed song: ${lastViewedSong}`);
                    displayLyrics(lastViewedSong, songData.artist, songData.lyrics);
                } else {
                    console.warn(`No song data found for ${lastViewedSong}`);
                    displayLyrics('Select a Song', '', '');
                }
            } catch (e) {
                console.error(`Error loading last viewed song ${lastViewedSong}:`, e);
                displayLyrics('Select a Song', '', '');
            }
        } else {
            console.log(`No song found with title: ${lastViewedSong}`);
            displayLyrics('Select a Song', '', '');
        }
    } else {
        console.log('No last viewed song found, loading default songs');
        displayLyrics('Select a Song', '', '');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('lyrics_url');
    const lyricsContainer = document.getElementById('lyricsDisplay');


    loadDefaultSongs().then(() => {
        loadLastViewedSong();
        const lastViewedSong = localStorage.getItem('lastViewedSong');
        if (lastViewedSong !== 'Select a Song') {
            updateSongDropdown(window.currentSetNumber);
        }
    });

    if (!urlInput) {
        console.error('Element with ID "lyrics_url" not found.');
        return;
    }

    if (!lyricsContainer) {
        console.error('Lyrics container not found.');
        return;
    }

    // const savedFontSize = localStorage.getItem('lyrics-font-size');
    // if (savedFontSize) {
    //     lyricsContainer.style.fontSize = `${savedFontSize}px`;
    // }

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

            const formTypeInput = document.getElementById('formType');
            if (formTypeInput && formTypeInput.value === 'add') {
                updateSongDropdown(window.currentSetNumber);
            }

            e.target.reset();
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById('lyricsModal'));
            if (modalInstance) {
                modalInstance.hide();
            }
        });
    }
    

        // Add touch swipe handling
        let touchStartX = 0;
        let touchEndX = 0;
        const swipeThreshold = 50; // minimum distance for a swipe
    
        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
    
        document.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
    
        function handleSwipe() {
            // Don't process swipes if color slider is active
            if (window.isColorSliderActive) {
                return;
            }
            
            const swipeDistance = touchEndX - touchStartX;
            
            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0) {
                    // Swipe right - go to previous song
                    loadPrevSong();
                } else {
                    // Swipe left - go to next song
                    loadNextSong();
                }
            }
        }

    // Add event listener for left and right arrow keys
    document.addEventListener('keydown', function(event) {
        const lyricsModal = document.getElementById('lyricsModal');
        const editLyricsModal = document.getElementById('editLyricsModal');

        if (lyricsModal && lyricsModal.classList.contains('show')) {
            return;
        }

        if (editLyricsModal && editLyricsModal.classList.contains('show')) {
            return;
        }

        if (event.key === 'ArrowLeft') {
            loadPrevSong();
        } else if (event.key === 'ArrowRight') {
            loadNextSong();
        } else if (event.key === 'ArrowUp') {
            adjustFontSize(2); // Increase font size
        } else if (event.key === 'ArrowDown') {
            adjustFontSize(-2); // Decrease font size
        }
    });

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
