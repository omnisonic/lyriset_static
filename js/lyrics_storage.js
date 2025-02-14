// Add this function at the beginning of the file
async function loadDefaultSongs() {
    try {
        // Check localStorage content before loading
        const existingSongs = Object.keys(localStorage);
        console.log(`Current localStorage songs count: ${existingSongs.length}`);
        
        const response = await fetch('../data/lyrics_data_2025-02-14.lyriset');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseText = await response.text();
        const songs = JSON.parse(responseText);

        // Only load default songs if localStorage is empty (except for font size)
        if (localStorage.length <= 1) { // accounting for possible font-size setting
            console.log('localStorage is empty, loading default songs from lyrics_data.lyriset');
            Object.entries(songs).forEach(([song, data]) => {
                // Add set property if not present
                if (!data.set) {
                    data.set = 1;
                }
                localStorage.setItem(song, JSON.stringify(data));
            });
            console.log(`Loaded ${Object.keys(songs).length} default songs from lyrics_data.lyriset`);
            window.updateSongDropdown(window.currentSetNumber);
        } else {
            console.log('Using existing songs from localStorage');
            console.log('Songs in localStorage:', existingSongs);
        }
    } catch (error) {
        console.error('Error loading default songs:', error);
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
                    console.error(`Error parsing song: ${key}`, e);
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
                displayLyrics(song.title, song.artist, song.lyrics);
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

            displayLyrics(songToDisplay.title, songToDisplay.artist, songToDisplay.lyrics);
        } else {
            displayLyrics('Select a Song', '', '');
        }
    } else {
        console.error('Dropdown element not found');
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
                    console.warn(`Error parsing data for song: ${key}`, e);
                    exportData[key] = localStorage.getItem(key);
                }
            }
        }

        // Include font size and tempo settings in export data
        const lyricsContainer = document.getElementById('lyricsDisplay');
        const songTitleElement = document.getElementById('songTitle');
        const song = songTitleElement ? songTitleElement.textContent : null;

        if (song && song !== 'Select a Song') {
            const fontSize = localStorage.getItem(`lyrics-font-size-${song}`);
            if (fontSize) {
                exportData[`lyrics-font-size-${song}`] = fontSize;
            }

            const tempo = localStorage.getItem(`metronome-bpm-${song}`);
            if (tempo) {
                exportData[`metronome-bpm-${song}`] = tempo;
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
        console.error("Error during exportSongData:", error);
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
                    if (key.startsWith('lyrics-font-size-')) {
                        localStorage.setItem(key, value);
                    } else if (key.startsWith('metronome-bpm-')) {
                        localStorage.setItem(key, value);
                    }
                    else {
                        localStorage.setItem(key, JSON.stringify(value));
                    }
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
    };
}
