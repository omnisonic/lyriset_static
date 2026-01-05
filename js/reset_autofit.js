// Reset Auto-Fit Button Functionality
// This allows users to reset manual font adjustments and re-enable auto-fit

function resetAutoFit() {
    const song = document.getElementById('songTitle').textContent;
    
    if (!song || song === 'Select a Song') {
        return;
    }

    // Get the lyrics container
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (lyricsContainer) {
        // Remove manual font size from inline styles
        lyricsContainer.style.fontSize = '';
        
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
                if (typeof displayLyrics === 'function') {
                    displayLyrics(song, songData.artist, songData.lyrics);
                    // Update status indicator
                    if (typeof updateAutoFitStatus === 'function') {
                        updateAutoFitStatus(true);
                    }
                }
            }
        } catch (e) {
            // Error resetting auto-fit
        }
    }
}

// Export functions for use in other files
if (typeof window !== 'undefined') {
    window.resetAutoFit = resetAutoFit;
}
