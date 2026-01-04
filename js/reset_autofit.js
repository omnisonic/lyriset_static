// Reset Auto-Fit Button Functionality
// This allows users to reset manual font adjustments and re-enable auto-fit

function resetAutoFit() {
    const song = document.getElementById('songTitle').textContent;
    
    if (!song || song === 'Select a Song') {
        console.warn('No song selected, cannot reset auto-fit.');
        return;
    }

    // Remove manual font size override for this song
    localStorage.removeItem(`lyrics-font-size-${song}`);
    localStorage.removeItem(`lyrics-auto-fit-${song}`);
    
    // Get the lyrics container
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (lyricsContainer) {
        // Remove manual font size from inline styles
        lyricsContainer.style.fontSize = '';
        
        console.log(`Reset auto-fit for: ${song}`);
    }

    // Get song data and re-trigger auto-fit
    if (localStorage.getItem(song)) {
        try {
            const songData = JSON.parse(localStorage.getItem(song));
            if (typeof autoFitLyrics === 'function') {
                autoFitLyrics(song, songData.artist, songData.lyrics);
                // Update status indicator
                if (typeof updateAutoFitStatus === 'function') {
                    updateAutoFitStatus(true);
                }
            } else {
                // Fallback if autoFitLyrics isn't available yet
                console.warn('autoFitLyrics not available, using displayLyrics');
                if (typeof displayLyrics === 'function') {
                    displayLyrics(song, songData.artist, songData.lyrics);
                    // Update status indicator
                    if (typeof updateAutoFitStatus === 'function') {
                        updateAutoFitStatus(true);
                    }
                }
            }
        } catch (e) {
            console.error('Error resetting auto-fit:', e);
        }
    }
}

// Export functions for use in other files
if (typeof window !== 'undefined') {
    window.resetAutoFit = resetAutoFit;
}
