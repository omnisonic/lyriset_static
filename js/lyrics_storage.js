// Add this function at the beginning of the file
async function loadDefaultSongs() {
    try {
        // Check localStorage content before loading
        const existingSongs = Object.keys(localStorage);
        
        const response = await fetch('../data/lyrics_data_2026-01-05.lyriset');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseText = await response.text();
        const songs = JSON.parse(responseText);

        // Clean up any old font size entries from previous versions
        let cleanedCount = 0;
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('lyrics-font-size-') || key === 'lyrics-font-size' || key.startsWith('lyrics-auto-fit-'))) {
                localStorage.removeItem(key);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
        }

        // Only load default songs if localStorage has 3 or fewer songs (after cleanup)
        const currentSongsCount = Object.keys(localStorage).filter(k => 
            k !== 'lastViewedSong' && !k.startsWith('lyrics-font-size') && !k.startsWith('metronome-bpm-')
        ).length;
        
        if (currentSongsCount <= 3) {
            // Clear all except the cleanup we just did
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key !== 'lastViewedSong' && !key.startsWith('lyrics-font-size') && !key.startsWith('metronome-bpm-')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            Object.entries(songs).forEach(([song, data]) => {
                // Add set property if not present
                if (!data.set) {
                    data.set = 1;
                }
                localStorage.setItem(song, JSON.stringify(data));
            });
            window.updateSongDropdown(window.currentSetNumber);
        } else {
        }
    } catch (error) {
        // Error loading default songs
    }
}



window.currentSetNumber = 1;

window.updateSongDropdown = function(setNumber = 1) {
    window.currentSetNumber = setNumber;
    const dropdown = document.getElementById('songDropdown');
    if (dropdown) {
        dropdown.innerHTML = ''; // Clear existing items
        const songs = [];
        
        // Collect all songs for the specified set
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key !== 'lyrics-font-size' && key !== 'lastViewedSong') {
                try {
                    const songData = JSON.parse(localStorage.getItem(key));
                    if (songData.set === setNumber) {
                        songs.push({
                            title: key,
                            ...songData
                        });
                    }
                } catch (e) {
                    // Error parsing song
                }
            }
        }
        
        // Update the set dropdown button text
        const setDropdownButton = document.getElementById('setDropdownButton');
        if (setDropdownButton) {
            setDropdownButton.textContent = `Set ${setNumber}`;
        }
        
        // Add songs to dropdown
        songs.forEach(song => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.className = 'dropdown-item';
            a.href = '#';
            a.textContent = `${song.title}${song.artist ? ` - ${song.artist}` : ''}`;
            
            // Add click event listener
            a.addEventListener('click', function(e) {
                e.preventDefault();
                // Use autoFitLyrics if available, otherwise fallback to displayLyrics
                if (typeof autoFitLyrics === 'function') {
                    autoFitLyrics(song.title, song.artist, song.lyrics);
                } else if (typeof displayLyrics === 'function') {
                    displayLyrics(song.title, song.artist, song.lyrics);
                }
            });
            
            li.appendChild(a);
            dropdown.appendChild(li);
        });

        // If there are songs in this set, display the first one, unless a last viewed song exists
        if (songs.length > 0) {
            const lastViewedSong = localStorage.getItem('lastViewedSong');
            let songToDisplay = songs[0]; // Default to the first song

            if (lastViewedSong && lastViewedSong !== "") {
            }

            // Use autoFitLyrics if available, otherwise fallback to displayLyrics
            if (typeof autoFitLyrics === 'function') {
                autoFitLyrics(songToDisplay.title, songToDisplay.artist, songToDisplay.lyrics);
            } else if (typeof displayLyrics === 'function') {
                displayLyrics(songToDisplay.title, songToDisplay.artist, songToDisplay.lyrics);
            }
        } else {
            if (typeof displayLyrics === 'function') {
                displayLyrics('Select a Song', '', '');
            }
        }
    } else {
        // Dropdown element not found
    }
};

// In the exportSongData function, modify the localStorage check
function exportSongData() {
    try {
        localStorage.removeItem('lastViewedSong');
        const exportData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key.startsWith('lyrics-font-size-') && !key.startsWith('metronome-bpm-')) {
                try {
                    exportData[key] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    exportData[key] = localStorage.getItem(key);
                }
            }
        }


        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        const now = new Date();
        const dateString = now.toISOString().slice(0, 10);
        link.download = `lyrics_data_${dateString}.lyriset`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        alert("Error during export. Please check the console for details.");
    }
}

function importSongData(file) {
    return new Promise((resolve, reject) => {
        if (!file.name.endsWith('.lyriset')) {
            reject(new Error('Invalid file extension. Only .lyriset files are supported.'));
            return;
        }

        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                const importData = JSON.parse(e.target.result);

                Object.entries(importData).forEach(([key, value]) => {
                    // Skip font size entries since we use auto-fit now
                    if (key.startsWith('lyrics-font-size-')) {
                        return;
                    }
                    // Skip metronome-bpm entries since metronome is removed
                    if (key.startsWith('metronome-bpm-')) {
                        return;
                    }
                    localStorage.setItem(key, JSON.stringify(value));
                });

                window.updateSongDropdown(window.currentSetNumber);
                resolve(Object.keys(importData).length);
            } catch (e) {
                reject(new Error('Invalid file format'));
            }
        };
        reader.onerror = function() {
            reject(new Error('Error reading file'));
        };

        reader.readAsText(file);
    });
}

function createImportExportButtons() {
    const container = document.createElement('div');
    container.className = 'btn-group me-2';
    
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-secondary border border-light';
    exportBtn.textContent = 'Export';
    exportBtn.onclick = exportSongData;
    
    const importBtn = document.createElement('button');
    importBtn.className = 'btn btn-secondary border border-light';
    importBtn.textContent = 'Import';
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.lyriset';
    fileInput.style.display = 'none';
    
    fileInput.onchange = async function(e) {
        if (e.target.files.length > 0) {
            try {
                const count = await importSongData(e.target.files[0]);
                alert(`Successfully imported ${count} songs`);
                location.reload();
            } catch (error) {
                alert(`Import failed: ${error.message}`);
            }
        }
    };
    
    importBtn.onclick = () => fileInput.click();
    
    container.appendChild(exportBtn);
    container.appendChild(importBtn);
    container.appendChild(fileInput);
    
    return container;
}

if (typeof window.displayLyrics === 'undefined') {
    window.displayLyrics = function(song, artist, lyrics) {
        const lyricsContainer = document.getElementById('lyricsDisplay');
        if (!lyricsContainer) {
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
    };
}
