window.updateSongDropdown = function() {
    const dropdown = document.getElementById('songDropdown');
    if (dropdown) {
        dropdown.innerHTML = ''; // Clear existing items
        const songs = [];
        
        // Collect all songs
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key !== 'lyrics-font-size') {
                try {
                    const songData = JSON.parse(localStorage.getItem(key));
                    songs.push({
                        title: key,
                        ...songData
                    });
                } catch (e) {
                    console.error(`Error parsing song: ${key}`, e);
                }
            }
        }
        
        // Sort songs alphabetically
        songs.sort((a, b) => a.title.localeCompare(b.title));
        
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
                displayLyrics(song.title, song.artist, song.lyrics); // Using the existing displayLyrics function
            });
            
            li.appendChild(a);
            dropdown.appendChild(li);
        });
    } else {
        console.error('Dropdown element not found');
    }
};


function exportSongData() {
    const exportData = {};
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'lyrics-font-size') {
            try {
                exportData[key] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                console.error(`Error parsing data for song: ${key}`, e);
            }
        }
    }
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lyrics_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function importSongData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const importData = JSON.parse(e.target.result);
                
                Object.entries(importData).forEach(([song, data]) => {
                    localStorage.setItem(song, JSON.stringify(data));
                });
                
                window.updateSongDropdown();
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
    fileInput.accept = '.json';
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
