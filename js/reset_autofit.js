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
    
    // Get the lyrics container
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (lyricsContainer) {
        // Remove manual font size from inline styles
        lyricsContainer.style.fontSize = '';
        
        // Re-enable auto-fit class
        lyricsContainer.classList.add('auto-fit-active');
        
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

// Add reset button to the UI
function addResetAutoFitButton() {
    // Find the existing controls container
    const controlsContainer = document.querySelector('.btn-group');
    if (!controlsContainer) {
        console.error('Controls container not found');
        return;
    }

    // Check if button already exists
    if (document.getElementById('resetAutoFitButton')) {
        console.log('Reset auto-fit button already exists');
        return;
    }

    // Create the reset button
    const resetButton = document.createElement('button');
    resetButton.id = 'resetAutoFitButton';
    resetButton.className = 'btn border border-light';
    resetButton.textContent = '↺';
    resetButton.title = 'Reset Auto-Fit (clear manual font size and recalculate)';
    resetButton.onclick = resetAutoFit;

    // Insert the button after the A- button (before the clean lyrics button)
    const aMinusButton = controlsContainer.querySelector('button[onclick="adjustFontSize(-1)"]');
    if (aMinusButton) {
        aMinusButton.parentNode.insertBefore(resetButton, aMinusButton.nextSibling);
    } else {
        // Fallback: add to the end
        controlsContainer.appendChild(resetButton);
    }

    console.log('Reset auto-fit button added to UI');
}

// Export functions for use in other files
if (typeof window !== 'undefined') {
    window.resetAutoFit = resetAutoFit;
    window.addResetAutoFitButton = addResetAutoFitButton;
}
