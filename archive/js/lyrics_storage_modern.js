// Modern Lyriset Storage Management
// Handles import/export and default song loading for the modern UI

// Load default songs from the data file
async function loadDefaultSongs() {
    try {
        // Check if we need to load default songs
        const existingSongs = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key !== 'lastViewedSong' && !key.startsWith('lyrics-font-size') && !key.startsWith('metronome-bpm-')) {
                existingSongs.push(key);
            }
        }
        
        // Only load defaults if there are 3 or fewer songs (the default Tom Lehrer songs)
        if (existingSongs.length <= 3) {
            console.log('Loading default songs...');
            
            // Try to load from the data file
            try {
                const response = await fetch('../data/lyrics_data_2025-02-14.lyriset');
                if (response.ok) {
                    const responseText = await response.text();
                    const songs = JSON.parse(responseText);
                    
                    // Clear existing songs (except special keys)
                    const keysToRemove = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && key !== 'lastViewedSong' && !key.startsWith('lyrics-font-size') && !key.startsWith('metronome-bpm-')) {
                            keysToRemove.push(key);
                        }
                    }
                    keysToRemove.forEach(key => localStorage.removeItem(key));
                    
                    // Load default songs
                    Object.entries(songs).forEach(([song, data]) => {
                        if (!data.set) {
                            data.set = 1;
                        }
                        localStorage.setItem(song, JSON.stringify(data));
                    });
                    
                    console.log(`Loaded ${Object.keys(songs).length} default songs`);
                    return;
                }
            } catch (error) {
                console.log('Could not load from data file, using hardcoded defaults');
            }
            
            // Fallback: hardcoded default songs
            const defaultSongs = {
                "The Elements": {
                    artist: "Tom Lehrer",
                    lyrics: "There's antimony, arsenic, aluminum, selenium\nAnd hydrogen, oxygen, nitrogen, rhenium\nAnd nickel, neodymium, neptunium, germanium\nAnd iron, americium, ruthenium, uranium\nAnd indium, gallium, iodine, thorium, uranium\nAnd chromium, plutonium, lanthanum, molybdenum\nAnd bromine, carbon, cobalt, copper, tungsten, tin, and sodium\nAnd platinum, plutonium, polonium, potassium, tantalum, technetium, titanium\nAnd tellurium, vanadium, zirconium, zinc, and xenon\nAnd scandium, cerium, cesium, lead, praseodymium, and platinum\nAnd gold, protactinium, palladium, promethium, and magnesium\nAnd radium, radon, rhenium, rhodium, and selenium",
                    set: 1
                },
                "Poisoning Pigeons in the Park": {
                    artist: "Tom Lehrer",
                    lyrics: "When I was a lad I served a term\nAs office boy to an attorney's firm.\nI cleaned the windows and I swept the floor,\nAnd I polished up the handle of the big front door.\nI polished up that handle so carefullee\nThat now I am the ruler of the Queen's navée.",
                    set: 1
                },
                "The Masochism Tango": {
                    artist: "Tom Lehrer",
                    lyrics: "I ache for the touch of your lips, dear,\nBut much more for the touch of your hips, dear.\nI ache for the rest of my life,\nOh, when you are cruel, you're a girl of my dreams.\nI love you, I love you, I love you, I love you,\nI love you, I love you, I love you, I love you,\nI love you, I love you, I love you, I love you,\nI love you, I love you, I love you, I love you.",
                    set: 1
                }
            };
            
            // Clear and load hardcoded defaults
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key !== 'lastViewedSong' && !key.startsWith('lyrics-font-size') && !key.startsWith('metronome-bpm-')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            Object.entries(defaultSongs).forEach(([song, data]) => {
                localStorage.setItem(song, JSON.stringify(data));
            });
            
            console.log(`Loaded ${Object.keys(defaultSongs).length} hardcoded default songs`);
        } else {
            console.log('Using existing songs from localStorage');
        }
    } catch (error) {
        console.error('Error loading default songs:', error);
    }
}

// Export song data
function exportSongData() {
    try {
        // Remove last viewed song from export
        localStorage.removeItem('lastViewedSong');
        
        const exportData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Skip font size and metronome entries
            if (!key.startsWith('lyrics-font-size-') && !key.startsWith('metronome-bpm-')) {
                try {
                    exportData[key] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    console.warn(`Error parsing data for song: ${key}`, e);
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
        URL.revokeObjectURL(url);
        
        showMessage('Export completed successfully', 'success');
    } catch (error) {
        console.error("Error during export:", error);
        showMessage('Export failed', 'error');
    }
}

// Import song data
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
                let importCount = 0;
                
                Object.entries(importData).forEach(([key, value]) => {
                    // Skip font size entries since we use auto-fit now
                    if (key.startsWith('lyrics-font-size-')) {
                        console.log(`Skipping import of font size setting: ${key}`);
                        return;
                    }
                    // Skip metronome-bpm entries since metronome is removed
                    if (key.startsWith('metronome-bpm-')) {
                        console.log(`Skipping import of metronome BPM setting: ${key}`);
                        return;
                    }
                    
                    try {
                        localStorage.setItem(key, JSON.stringify(value));
                        importCount++;
                    } catch (e) {
                        console.warn(`Failed to import ${key}:`, e);
                    }
                });
                
                resolve(importCount);
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

// Create import/export buttons for the UI
function createImportExportButtons() {
    const container = document.createElement('div');
    container.className = 'btn-group';
    container.style.gap = '0.25rem';
    
    // Export button
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn border';
    exportBtn.textContent = 'Export';
    exportBtn.onclick = exportSongData;
    
    // Import button
    const importBtn = document.createElement('button');
    importBtn.className = 'btn border';
    importBtn.textContent = 'Import';
    
    // Hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.lyriset';
    fileInput.style.display = 'none';
    
    fileInput.onchange = async function(e) {
        if (e.target.files.length > 0) {
            try {
                const count = await importSongData(e.target.files[0]);
                showMessage(`Successfully imported ${count} songs`, 'success');
                
                // Reload the page to apply changes
                setTimeout(() => {
                    location.reload();
                }, 1500);
            } catch (error) {
                showMessage(`Import failed: ${error.message}`, 'error');
            }
        }
    };
    
    importBtn.onclick = () => fileInput.click();
    
    container.appendChild(exportBtn);
    container.appendChild(importBtn);
    container.appendChild(fileInput);
    
    return container;
}

// Initialize storage system
function initializeStorage() {
    // Add import/export buttons to UI
    const container = document.getElementById('importExportContainer');
    if (container) {
        container.appendChild(createImportExportButtons());
    }
    
    // Load default songs if needed
    loadDefaultSongs().then(() => {
        // Update song dropdown if the function exists
        if (typeof updateSongDropdown === 'function') {
            updateSongDropdown(window.currentSetNumber || 1);
        }
    });
}

// Export for global use
if (typeof window !== 'undefined') {
    window.exportSongData = exportSongData;
    window.importSongData = importSongData;
    window.createImportExportButtons = createImportExportButtons;
    window.initializeStorage = initializeStorage;
    window.loadDefaultSongs = loadDefaultSongs;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStorage);
} else {
    initializeStorage();
}
