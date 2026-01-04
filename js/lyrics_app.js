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
    
    // Ensure columns are adjusted after toggle
    setTimeout(() => {
        const currentSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
        adjustColumnsForFontSize(currentSize);
        calculateUnusedSpace();
    }, 150);
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

    const song = document.getElementById('songTitle').textContent;
    if (!song || song === 'Select a Song') {
        console.warn('No song selected, cannot adjust font size.');
        return;
    }
    
    const currentSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
    const newSize = Math.min(Math.max(currentSize + delta, 8), 32);
    lyricsContainer.style.fontSize = `${newSize}px`;
    localStorage.setItem(`lyrics-font-size-${song}`, newSize);
    
    // Get longest line with current font size to check if adjustment is needed
    const longestLine = getLongestLineWidth(lyricsContainer, newSize);
    const containerWidth = lyricsContainer.offsetWidth;
    
    console.log(`Font changed to ${newSize}px. Longest line: ${longestLine.width}px, Container: ${containerWidth}px`);
    
    // Adjust column count based on new font size to prevent line wrapping
    adjustColumnsForFontSize(newSize);
    
    // Recalculate space after a brief delay to allow DOM to update
    setTimeout(() => {
        calculateUnusedSpace();
    }, 100);
}

// Helper function to find the longest line width
function getLongestLineWidth(lyricsContainer, fontSize) {
    const lineDivs = Array.from(lyricsContainer.querySelectorAll('div'));
    let longestLineWidth = 0;
    let longestLineText = '';
    
    lineDivs.forEach(div => {
        if (div.textContent && div.textContent.trim()) {
            // Create a temporary span to measure the exact width of the text
            const span = document.createElement('span');
            span.style.visibility = 'hidden';
            span.style.position = 'absolute';
            span.style.whiteSpace = 'nowrap';
            span.style.font = window.getComputedStyle(div).font;
            span.style.fontSize = fontSize + 'px';
            span.textContent = div.textContent;
            document.body.appendChild(span);
            
            const textWidth = span.offsetWidth;
            if (textWidth > longestLineWidth) {
                longestLineWidth = textWidth;
                longestLineText = div.textContent;
            }
            
            document.body.removeChild(span);
        }
    });
    
    return { width: longestLineWidth, text: longestLineText };
}

function adjustColumnsForFontSize(fontSize) {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (!lyricsContainer) return;
    
    const containerWidth = lyricsContainer.offsetWidth;
    
    // Find the longest line of text to determine minimum column width
    const longestLine = getLongestLineWidth(lyricsContainer, fontSize);
    
    // Add some padding to the longest line width
    const requiredColumnWidth = longestLine.width + 20; // 20px buffer
    
    // Calculate how many columns can fit
    const maxColumns = Math.floor(containerWidth / requiredColumnWidth);
    
    // Ensure at least 1 column, but also respect font size constraints
    let targetColumns = Math.max(1, maxColumns);
    
    // Apply reasonable limits based on font size
    if (fontSize > 24) {
        targetColumns = Math.min(targetColumns, 3);
    } else if (fontSize > 18) {
        targetColumns = Math.min(targetColumns, 4);
    } else {
        targetColumns = Math.min(targetColumns, 5);
    }
    
    // Ensure minimum of 2 columns if we have enough width
    if (containerWidth > 800 && targetColumns < 2) {
        targetColumns = 2;
    }
    
    // Apply the column count
    lyricsContainer.style.columnCount = targetColumns;
    
    console.log(`Longest line: "${longestLine.text}" (${longestLine.width}px), Container: ${containerWidth}px, Columns: ${targetColumns}`);
    
    // Recalculate space after adjustment
    setTimeout(() => {
        calculateUnusedSpace();
    }, 50);
}

function calculateUnusedSpace() {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    const lyricsMain = document.querySelector('.lyrics-main');
    const lyricsContainerWrapper = document.querySelector('.lyrics-container');
    
    if (!lyricsContainer || !lyricsMain || !lyricsContainerWrapper) {
        console.error('Required elements not found for space calculation');
        return;
    }

    // Get computed styles
    const computedStyle = window.getComputedStyle(lyricsContainer);
    const fontSize = parseFloat(computedStyle.fontSize);
    const lineHeight = parseFloat(computedStyle.lineHeight) || (fontSize * 1.2);
    const columnCount = parseInt(computedStyle.columnCount) || 1;
    const columnGap = parseFloat(computedStyle.columnGap) || 0;
    const padding = parseFloat(computedStyle.padding) || 0;
    
    // Get container dimensions
    const containerRect = lyricsContainer.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    // Calculate column width (accounting for gaps and padding)
    const columnWidth = (containerWidth - (columnCount - 1) * columnGap - (padding * 2)) / columnCount;
    
    // Get longest line information
    const longestLine = getLongestLineWidth(lyricsContainer, fontSize);
    
    // Get all line divs
    const lineDivs = Array.from(lyricsContainer.querySelectorAll('div'));
    
    // Calculate actual rendered lines (including wrapped lines)
    let totalRenderedLines = 0;
    let actualLineHeight = lineHeight;
    let hasWrappedLines = false;
    
    lineDivs.forEach(div => {
        if (div.textContent && div.textContent.trim()) {
            const divHeight = div.offsetHeight;
            const linesInDiv = Math.max(1, Math.round(divHeight / lineHeight));
            totalRenderedLines += linesInDiv;
            
            // Check if this div has wrapped lines
            if (linesInDiv > 1) {
                hasWrappedLines = true;
            }
            
            // Get actual line height from first line if possible
            if (actualLineHeight === lineHeight && divHeight > 0) {
                actualLineHeight = divHeight / linesInDiv;
            }
        }
    });
    
    // Calculate available line capacity per column
    const availableLinesPerColumn = Math.floor(containerHeight / actualLineHeight);
    
    // With column-fill: auto, text fills columns sequentially
    // Calculate how many full columns are filled
    const fullColumns = Math.floor(totalRenderedLines / availableLinesPerColumn);
    const linesInLastColumn = totalRenderedLines % availableLinesPerColumn;
    
    // Calculate the actual column where the last text line appears
    const lastTextColumnIndex = (linesInLastColumn > 0) ? fullColumns : fullColumns - 1;
    
    // Calculate empty lines only after the final text line
    const emptyLinesAfterText = linesInLastColumn > 0 ? (availableLinesPerColumn - linesInLastColumn) : 0;
    
    // Calculate total empty lines across all columns after the last text line
    const emptyColumnsAfterText = columnCount - (fullColumns + (linesInLastColumn > 0 ? 1 : 0));
    const emptyLines = emptyLinesAfterText + (emptyColumnsAfterText * availableLinesPerColumn);
    
    // For display purposes, calculate lines per column (sequential distribution)
    const linesPerColumn = [];
    for (let i = 0; i < columnCount; i++) {
        if (i < fullColumns) {
            linesPerColumn.push(availableLinesPerColumn);
        } else if (i === fullColumns && linesInLastColumn > 0) {
            linesPerColumn.push(linesInLastColumn);
        } else {
            linesPerColumn.push(0);
        }
    }
    
    // Calculate space usage based on line measurements
    const usedHeight = totalRenderedLines * actualLineHeight;
    const usedSpace = containerWidth * usedHeight;
    const totalAvailableSpace = containerWidth * containerHeight;
    const unusedSpace = Math.max(0, totalAvailableSpace - usedSpace);
    
    const unusedPercentage = totalAvailableSpace > 0 ? (unusedSpace / totalAvailableSpace * 100) : 0;
    const usedPercentage = totalAvailableSpace > 0 ? (usedSpace / totalAvailableSpace * 100) : 0;
    
    // Log detailed line-based information
    console.log('=== SPACE USAGE ANALYSIS (LINE-BASED) ===');
    console.log('Container Dimensions:', {
        width: containerWidth.toFixed(2) + 'px',
        height: containerHeight.toFixed(2) + 'px',
        total: totalAvailableSpace.toFixed(2) + 'px²'
    });
    console.log('Typography & Layout:', {
        fontSize: fontSize.toFixed(2) + 'px',
        lineHeight: actualLineHeight.toFixed(2) + 'px',
        columnCount: columnCount,
        columnWidth: columnWidth.toFixed(2) + 'px',
        columnFill: 'auto (sequential)'
    });
    console.log('Longest Line Analysis:', {
        text: longestLine.text,
        width: longestLine.width.toFixed(2) + 'px',
        fitsInColumn: longestLine.width <= columnWidth
    });
    console.log('Line Analysis:', {
        totalRenderedLines: totalRenderedLines,
        hasWrappedLines: hasWrappedLines,
        linesPerColumn: linesPerColumn,
        availableLinesPerColumn: availableLinesPerColumn
    });
    console.log('Capacity Analysis:', {
        fullColumns: fullColumns,
        linesInLastColumn: linesInLastColumn,
        lastTextColumnIndex: lastTextColumnIndex,
        emptyLinesAfterText: emptyLinesAfterText,
        emptyColumnsAfterText: emptyColumnsAfterText,
        emptyLinesCapacity: emptyLines
    });
    console.log('Space Usage:', {
        usedHeight: usedHeight.toFixed(2) + 'px',
        usedSpace: usedSpace.toFixed(2) + 'px²',
        unusedSpace: unusedSpace.toFixed(2) + 'px²',
        usedPercentage: usedPercentage.toFixed(2) + '%',
        unusedPercentage: unusedPercentage.toFixed(2) + '%'
    });
    
    return {
        lineHeight: actualLineHeight,
        totalLines: totalRenderedLines,
        hasWrappedLines: hasWrappedLines,
        linesPerColumn: linesPerColumn,
        availableLinesPerColumn: availableLinesPerColumn,
        linesInLastColumn: linesInLastColumn,
        lastTextColumnIndex: lastTextColumnIndex,
        emptyLinesAfterText: emptyLinesAfterText,
        emptyLines: emptyLines,
        usedSpace: usedSpace,
        unusedSpace: unusedSpace,
        usedPercentage: usedPercentage,
        unusedPercentage: unusedPercentage,
        columns: columnCount,
        columnWidth: columnWidth,
        fontSize: fontSize,
        longestLine: longestLine
    };
}

function displayLyrics(song, artist, lyrics) {
    console.log(`Displaying lyrics for: ${song}`);

    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (!lyricsContainer) {
        console.error('Lyrics container not found');
        return;
    }

    const fontSize = localStorage.getItem(`lyrics-font-size-${song}`);
    if (fontSize) {
        lyricsContainer.style.fontSize = `${fontSize}px`;
    }

    const bpmInput = document.getElementById('bpm');
    const tempo = localStorage.getItem(`metronome-bpm-${song}`);
    if (bpmInput && tempo) {
        bpmInput.value = tempo;
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

    // Adjust columns and calculate unused space after lyrics are displayed
    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
        const currentSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
        adjustColumnsForFontSize(currentSize);
        calculateUnusedSpace();
    }, 100);

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
            adjustFontSize(1); // Increase font size
        } else if (event.key === 'ArrowDown') {
            adjustFontSize(-1); // Decrease font size
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
                
                // Adjust columns when container resizes
                const currentSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
                adjustColumnsForFontSize(currentSize);
                
                // Recalculate space after resize
                setTimeout(() => {
                    calculateUnusedSpace();
                }, 100);
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
