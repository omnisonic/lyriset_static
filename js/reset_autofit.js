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

            // Re-apply whatever chord/lyrics display mode is currently active
            // (clean, chords-above-line, chords-aligned) instead of always
            // resetting back to the raw original lyrics.
            const mode = lyricsContainer ? (lyricsContainer.getAttribute('data-lyrics-mode') || 'original') : 'original';
            let lyrics = songData.lyrics;
            if (mode === 'clean' && typeof cleanLyrics === 'function') {
                lyrics = cleanLyrics(songData.lyrics) || songData.lyrics;
            } else if (mode === 'chordsAboveLine' && typeof moveChordsAboveLines === 'function') {
                lyrics = moveChordsAboveLines(songData.lyrics);
            } else if (mode === 'chordsAligned' && typeof alignChordsToLyrics === 'function') {
                lyrics = alignChordsToLyrics(songData.lyrics);
            }

            if (typeof autoFitLyrics === 'function') {
                autoFitLyrics(song, songData.artist, lyrics);
                // Update status indicator
                if (typeof updateAutoFitStatus === 'function') {
                    updateAutoFitStatus(true);
                }
            } else {
                // Fallback if autoFitLyrics isn't available yet
                if (typeof displayLyrics === 'function') {
                    displayLyrics(song, songData.artist, lyrics);
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
