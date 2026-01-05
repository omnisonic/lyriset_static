// Modern Lyriset App - Updated for Dark/Light Theme Support
// This replaces the old slider_color.js functionality

// Global state
window.currentSetNumber = 1;

// Theme detection and management
function detectTheme() {
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDarkMode ? 'dark' : 'light';
}

function updateHamburgerIcon() {
    const hamburgerIcon = document.getElementById('hamburgerIcon');
    if (!hamburgerIcon) return;
    
    const theme = detectTheme();
    // Use the appropriate hamburger icon based on theme
    hamburgerIcon.src = theme === 'dark' ? 'img/hamburger-dark.svg' : 'img/hamburger-light.svg';
}

// Modal management (replacing Bootstrap modals)
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Focus first input if it's a form modal
    if (modalId === 'lyricsModal') {
        setTimeout(() => {
            const firstInput = modal.querySelector('input, textarea');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = 'none';
    document.body.style.overflow = '';
    
    // Reset forms
    if (modalId === 'lyricsModal') {
        const form = document.getElementById('lyricsForm');
        if (form) form.reset();
    } else if (modalId === 'editLyricsModal') {
        const form = document.getElementById('editLyricsForm');
        if (form) form.reset();
    }
}

// Close modals when clicking outside
function setupModalBackdrop() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
}

// Navbar toggle for mobile
function toggleNavbar() {
    const navbar = document.getElementById('navbarNav');
    if (!navbar) return;
    
    const isVisible = navbar.style.display !== 'none';
    navbar.style.display = isVisible ? 'none' : 'block';
}

// Dropdown management
function setupDropdowns() {
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            const dropdowns = document.querySelectorAll('.dropdown-menu');
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });
    
    // Toggle dropdown on button click
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = this.nextElementSibling;
            if (dropdown && dropdown.classList.contains('dropdown-menu')) {
                dropdown.classList.toggle('show');
            }
        });
    });
}

// Song management functions
function updateSongDropdown(setNumber) {
    window.currentSetNumber = setNumber;
    const dropdown = document.getElementById('songDropdown');
    if (!dropdown) return;
    
    dropdown.innerHTML = '';
    
    const songs = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'lyrics-font-size' && key !== 'lastViewedSong') {
            try {
                const songData = JSON.parse(localStorage.getItem(key));
                if (songData.set === setNumber) {
                    songs.push(key);
                }
            } catch (e) {
                console.warn('Invalid song data:', key);
            }
        }
    }
    
    songs.sort();
    
    if (songs.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.innerHTML = '<span class="dropdown-item text-muted">No songs in this set</span>';
        dropdown.appendChild(emptyItem);
    } else {
        songs.forEach(song => {
            const item = document.createElement('li');
            item.innerHTML = `<a class="dropdown-item" href="#" onclick="loadSong('${song}')">${song}</a>`;
            dropdown.appendChild(item);
        });
    }
    
    // Close the dropdown after selection
    const setDropdown = document.getElementById('setDropdown');
    if (setDropdown) {
        setDropdown.classList.remove('show');
    }
}

function loadSong(songTitle) {
    if (!songTitle) return;
    
    try {
        const songData = JSON.parse(localStorage.getItem(songTitle));
        if (songData) {
            autoFitLyrics(songTitle, songData.artist, songData.lyrics);
        }
    } catch (e) {
        console.error('Error loading song:', e);
    }
    
    // Close song dropdown
    const songDropdown = document.getElementById('songDropdown');
    if (songDropdown) {
        songDropdown.classList.remove('show');
    }
}

// Navigation functions
function loadNextSong() {
    const currentSong = document.getElementById('songTitle').textContent;
    if (!currentSong || currentSong === 'Select a Song') return;
    
    const songs = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'lyrics-font-size' && key !== 'lastViewedSong') {
            try {
                const songData = JSON.parse(localStorage.getItem(key));
                if (songData.set === window.currentSetNumber) {
                    songs.push(key);
                }
            } catch (e) {
                continue;
            }
        }
    }
    
    if (songs.length === 0) return;
    
    songs.sort();
    const currentIndex = songs.indexOf(currentSong);
    const nextIndex = currentIndex === songs.length - 1 ? 0 : currentIndex + 1;
    const nextSong = songs[nextIndex];
    
    loadSong(nextSong);
}

function loadPrevSong() {
    const currentSong = document.getElementById('songTitle').textContent;
    if (!currentSong || currentSong === 'Select a Song') return;
    
    const songs = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'lyrics-font-size' && key !== 'lastViewedSong') {
            try {
                const songData = JSON.parse(localStorage.getItem(key));
                if (songData.set === window.currentSetNumber) {
                    songs.push(key);
                }
            } catch (e) {
                continue;
            }
        }
    }
    
    if (songs.length === 0) return;
    
    songs.sort();
    const currentIndex = songs.indexOf(currentSong);
    const prevIndex = currentIndex <= 0 ? songs.length - 1 : currentIndex - 1;
    const prevSong = songs[prevIndex];
    
    loadSong(prevSong);
}

// Font size adjustment
function adjustFontSize(delta) {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (!lyricsContainer) return;
    
    const song = document.getElementById('songTitle').textContent;
    if (!song || song === 'Select a Song') {
        console.warn('No song selected, cannot adjust font size.');
        return;
    }
    
    const currentSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
    const newSize = Math.min(Math.max(currentSize + delta, 8), 32);
    lyricsContainer.style.fontSize = `${newSize}px`;
    
    // Adjust columns based on new font size
    adjustColumnsForFontSize(newSize);
    
    // Recalculate space after a brief delay
    setTimeout(() => {
        calculateUnusedSpace();
    }, 100);
}

// Clean lyrics toggle
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
        // Switch to original
        autoFitLyrics(song, artist, originalLyrics);
        toggleText.textContent = '✓';
        toggleButton.classList.add('active');
        lyricsContainer.setAttribute('data-clean', 'false');
    } else {
        // Switch to clean
        const cleanedLyrics = cleanLyrics(originalLyrics);
        if (cleanedLyrics) {
            autoFitLyrics(song, artist, cleanedLyrics);
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

// Delete song
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
    
    // Load next available song
    const remainingSongs = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'lyrics-font-size') {
            try {
                const songData = JSON.parse(localStorage.getItem(key));
                if (songData.set === window.currentSetNumber) {
                    remainingSongs.push(key);
                }
            } catch (e) {
                continue;
            }
        }
    }
    
    if (remainingSongs.length > 0) {
        const nextSong = remainingSongs[0];
        loadSong(nextSong);
    }
}

// Edit modal
function openEditModal() {
    const currentSong = document.getElementById('songTitle').textContent;
    if (!currentSong || currentSong === 'Select a Song') {
        showMessage('Please select a song to edit', 'error');
        return;
    }
    
    try {
        const songData = JSON.parse(localStorage.getItem(currentSong));
        if (!songData) return;
        
        const editSongInput = document.getElementById('editSongInput');
        const editArtistInput = document.getElementById('editArtistInput');
        const editLyricsText = document.getElementById('editLyricsText');
        
        if (editSongInput) editSongInput.value = currentSong;
        if (editArtistInput) editArtistInput.value = songData.artist || '';
        if (editLyricsText) editLyricsText.value = songData.lyrics || '';
        
        openModal('editLyricsModal');
    } catch (e) {
        console.error('Error loading song for editing:', e);
        showMessage('Error loading song for editing', 'error');
    }
}

// URL form handling
function setupURLForm() {
    const urlForm = document.getElementById('urlForm');
    if (!urlForm) return;
    
    urlForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const urlInput = document.getElementById('lyrics_url');
        if (!urlInput) return;
        
        const url = urlInput.value.trim();
        if (!url) return;
        
        // This would need to be implemented based on your URL fetching logic
        console.log('URL submitted:', url);
        showMessage('URL fetching would be implemented here', 'success');
        urlInput.value = '';
    });
}

// Form handling
function setupForms() {
    // Add lyrics form
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
            updateSongDropdown(window.currentSetNumber);
            
            closeModal('lyricsModal');
            showMessage('Song added successfully', 'success');
        });
    }
    
    // Edit lyrics form
    const editForm = document.getElementById('editLyricsForm');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentSong = document.getElementById('songTitle').textContent;
            if (!currentSong || currentSong === 'Select a Song') return;
            
            const newSong = document.getElementById('editSongInput').value.trim();
            const newArtist = document.getElementById('editArtistInput').value.trim();
            const newLyrics = document.getElementById('editLyricsText').value.trim();
            
            if (!newSong || !newLyrics) return;
            
            // Remove old song if title changed
            if (currentSong !== newSong) {
                localStorage.removeItem(currentSong);
            }
            
            // Save new/updated song
            localStorage.setItem(newSong, JSON.stringify({
                artist: newArtist,
                lyrics: newLyrics,
                set: window.currentSetNumber
            }));
            
            displayLyrics(newSong, newArtist, newLyrics);
            updateSongDropdown(window.currentSetNumber);
            
            closeModal('editLyricsModal');
            showMessage('Song updated successfully', 'success');
        });
    }
}

// Display lyrics (from lyrics_app.js)
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
    setTimeout(() => {
        const currentSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
        adjustColumnsForFontSize(currentSize);
        calculateUnusedSpace();
    }, 100);
}

// Auto-fit functionality - optimized for maximum font size
function autoFitLyrics(song, artist, lyrics) {
    console.log(`=== AUTO-FIT STARTED (MAX FONT SIZE OPTIMIZATION) ===`);
    console.log(`Auto-fitting lyrics for: ${song}`);
    
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (!lyricsContainer) {
        console.error('Lyrics container not found');
        return;
    }
    
    // First display the lyrics with current settings
    displayLyrics(song, artist, lyrics);
    
    // Wait for DOM to update
    setTimeout(() => {
        console.log(`DOM updated, starting font size optimization...`);
        
        // Get container dimensions
        const containerHeight = lyricsContainer.clientHeight;
        const containerWidth = lyricsContainer.offsetWidth;
        
        console.log(`Container dimensions: ${containerWidth}w x ${containerHeight}h`);
        
        if (containerHeight === 0) {
            console.warn('Container height not available yet');
            return;
        }
        
        // Get all lines for analysis
        const lineDivs = Array.from(lyricsContainer.querySelectorAll('div'));
        const totalLines = lineDivs.length;
        
        if (totalLines === 0) {
            console.warn('No lyrics lines found');
            return;
        }
        
        console.log(`Total lines: ${totalLines}`);
        
        // Step 1: Determine the longest line width at a reference font size (16px)
        // This gives us the maximum column width needed
        lyricsContainer.style.fontSize = '16px';
        const forceReflow1 = lyricsContainer.offsetHeight;
        
        const longestLineInfo = getLongestLineWidth(lyricsContainer, 16);
        const longestLineWidth = longestLineInfo.width;
        const longestLineText = longestLineInfo.text;
        
        console.log(`Longest line at 16px: "${longestLineText}" (${longestLineWidth}px)`);
        
        // Step 2: Calculate maximum column width (longest line + 20px buffer)
        const maxColumnWidth = longestLineWidth + 20;
        
        // Step 3: Determine maximum columns based on screen size
        let maxColumnsByScreen = 4;
        if (containerWidth >= 1200) {
            maxColumnsByScreen = 4;
        } else if (containerWidth >= 800) {
            maxColumnsByScreen = 3;
        } else if (containerWidth >= 600) {
            maxColumnsByScreen = 2;
        } else {
            maxColumnsByScreen = 1;
        }
        
        // Step 4: Calculate how many columns can physically fit
        const columnGap = 24; // 1.5rem = 24px
        const maxColumnsByWidth = Math.floor(containerWidth / maxColumnWidth);
        
        // Step 5: Apply constraints
        let targetColumns = Math.min(maxColumnsByScreen, maxColumnsByWidth);
        
        // Never create more columns than we have lines
        targetColumns = Math.min(targetColumns, totalLines);
        
        // Ensure at least 1 column
        targetColumns = Math.max(1, targetColumns);
        
        // Step 6: Calculate available column width with the target column count
        const availableColumnWidth = (containerWidth - (targetColumns - 1) * columnGap) / targetColumns;
        
        console.log(`Column analysis:`);
        console.log(`  - Longest line width: ${longestLineWidth}px`);
        console.log(`  - Required column width: ${maxColumnWidth}px`);
        console.log(`  - Available column width: ${availableColumnWidth.toFixed(1)}px`);
        console.log(`  - Target columns: ${targetColumns}`);
        console.log(`  - Screen-based max: ${maxColumnsByScreen}`);
        console.log(`  - Width-based max: ${maxColumnsByWidth}`);
        
        // Step 7: Find maximum font size that fits
        // Start with a reasonable maximum and work down
        const maxFontSize = 32;
        const minFontSize = 8;
        const stepSize = 0.25; // Smaller steps for more precision
        
        let bestFontSize = 14; // fallback
        let bestScore = -1;
        
        console.log(`\nTesting font sizes from ${maxFontSize}px down to ${minFontSize}px...`);
        
        for (let fontSize = maxFontSize; fontSize >= minFontSize; fontSize -= stepSize) {
            // Apply font size temporarily
            lyricsContainer.style.fontSize = `${fontSize}px`;
            
            // Apply column count
            lyricsContainer.style.columnCount = targetColumns;
            lyricsContainer.style.columnGap = `${columnGap}px`;
            
            // Force reflow
            const forceReflow2 = lyricsContainer.offsetHeight;
            
            // Check for vertical overflow
            const scrollHeight = lyricsContainer.scrollHeight;
            const clientHeight = lyricsContainer.clientHeight;
            const hasVerticalOverflow = scrollHeight > clientHeight;
            
            // Check for horizontal overflow
            const hasHorizontalOverflow = lyricsContainer.scrollWidth > lyricsContainer.clientWidth;
            
            // Check if longest line fits in column
            const currentLongestLine = getLongestLineWidth(lyricsContainer, fontSize);
            const lineFitsInColumn = currentLongestLine.width <= availableColumnWidth;
            
            // Calculate score
            let score = 0;
            let isValid = true;
            let reasons = [];
            
            // CRITICAL: Must have no vertical overflow
            if (!hasVerticalOverflow) {
                score += 10000;
                reasons.push('✓ fits vertically');
            } else {
                isValid = false;
                reasons.push('✗ vertical overflow');
            }
            
            // CRITICAL: Must have no horizontal overflow
            if (!hasHorizontalOverflow) {
                score += 10000;
                reasons.push('✓ fits horizontally');
            } else {
                isValid = false;
                reasons.push('✗ horizontal overflow');
            }
            
            // CRITICAL: Longest line must fit in column
            if (lineFitsInColumn) {
                score += 5000;
                reasons.push('✓ line fits in column');
            } else {
                isValid = false;
                reasons.push('✗ line too long');
            }
            
            // BONUS: Larger font size gets more points
            score += fontSize * 100;
            
            // BONUS: Fewer columns is better (more space per column)
            score += (10 - targetColumns) * 50;
            
            // Log this configuration
            if (isValid) {
                console.log(`  ${fontSize.toFixed(2)}px: VALID - Score: ${score.toFixed(0)} - ${reasons.join(', ')}`);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestFontSize = fontSize;
                }
            } else {
                if (fontSize >= 20) { // Only log larger sizes that fail
                    console.log(`  ${fontSize.toFixed(2)}px: INVALID - ${reasons.join(', ')}`);
                }
            }
        }
        
        // Step 8: Apply the best font size
        console.log(`\n=== OPTIMAL FONT SIZE: ${bestFontSize.toFixed(2)}px ===`);
        console.log(`Columns: ${targetColumns}`);
        console.log(`Column width: ${availableColumnWidth.toFixed(1)}px`);
        
        lyricsContainer.style.fontSize = `${bestFontSize}px`;
        lyricsContainer.style.columnCount = targetColumns;
        lyricsContainer.style.columnGap = `${columnGap}px`;
        
        // Verify application
        const appliedSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
        const appliedColumns = parseInt(window.getComputedStyle(lyricsContainer).columnCount);
        
        console.log(`Applied: ${appliedSize}px, ${appliedColumns} columns`);
        
        // Final verification
        setTimeout(() => {
            const finalScrollHeight = lyricsContainer.scrollHeight;
            const finalClientHeight = lyricsContainer.clientHeight;
            const finalHasOverflow = finalScrollHeight > finalClientHeight;
            
            const finalLongestLine = getLongestLineWidth(lyricsContainer, bestFontSize);
            const finalColumnGap = parseFloat(window.getComputedStyle(lyricsContainer).columnGap) || 0;
            const finalColumnWidth = (containerWidth - (appliedColumns - 1) * finalColumnGap) / appliedColumns;
            const finalLineFits = finalLongestLine.width <= finalColumnWidth;
            
            console.log(`\n=== FINAL VERIFICATION ===`);
            console.log(`No vertical overflow: ${!finalHasOverflow}`);
            console.log(`Longest line fits: ${finalLineFits} (${finalLongestLine.width}px <= ${finalColumnWidth.toFixed(1)}px)`);
            console.log(`Font size: ${bestFontSize.toFixed(2)}px`);
            console.log(`Columns: ${appliedColumns}`);
            
            if (finalHasOverflow || !finalLineFits) {
                console.warn('⚠️  Auto-fit may not be perfect - consider manual adjustment');
            } else {
                console.log('✅ Auto-fit successful!');
            }
        }, 50);
        
    }, 200);
}

// Helper functions
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
    // This function is now simplified since autoFitLyrics handles everything
    // It's kept for compatibility but just ensures basic column layout
    
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (!lyricsContainer) return;
    
    // If auto-fit has already been run, don't override
    if (lyricsContainer.style.fontSize && lyricsContainer.style.columnCount) {
        return;
    }
    
    const containerWidth = lyricsContainer.offsetWidth;
    const lineDivs = Array.from(lyricsContainer.querySelectorAll('div'));
    const totalLines = lineDivs.length;
    
    if (totalLines === 0) return;
    
    // Get longest line
    const longestLine = getLongestLineWidth(lyricsContainer, fontSize);
    const requiredColumnWidth = longestLine.width + 20;
    
    // Calculate columns
    let targetColumns = Math.floor(containerWidth / requiredColumnWidth);
    targetColumns = Math.max(1, targetColumns);
    targetColumns = Math.min(targetColumns, totalLines);
    
    // Screen size constraints
    if (containerWidth >= 1200) {
        targetColumns = Math.min(targetColumns, 4);
    } else if (containerWidth >= 800) {
        targetColumns = Math.min(targetColumns, 3);
    } else if (containerWidth >= 600) {
        targetColumns = Math.min(targetColumns, 2);
    } else {
        targetColumns = 1;
    }
    
    // Ensure line fits
    const columnGap = 24;
    const availableColumnWidth = (containerWidth - (targetColumns - 1) * columnGap) / targetColumns;
    
    while (targetColumns > 1 && longestLine.width > availableColumnWidth) {
        targetColumns--;
    }
    
    lyricsContainer.style.columnCount = targetColumns;
    lyricsContainer.style.columnGap = `${columnGap}px`;
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
    
    // Calculate column width
    const columnWidth = (containerWidth - (columnCount - 1) * columnGap - (padding * 2)) / columnCount;
    
    // Get longest line information
    const longestLine = getLongestLineWidth(lyricsContainer, fontSize);
    
    // Get all line divs
    const lineDivs = Array.from(lyricsContainer.querySelectorAll('div'));
    
    // Calculate actual rendered lines
    let totalRenderedLines = 0;
    let actualLineHeight = lineHeight;
    let hasWrappedLines = false;
    
    lineDivs.forEach(div => {
        if (div.textContent && div.textContent.trim()) {
            const divHeight = div.offsetHeight;
            const linesInDiv = Math.max(1, Math.round(divHeight / lineHeight));
            totalRenderedLines += linesInDiv;
            
            if (linesInDiv > 1) {
                hasWrappedLines = true;
            }
            
            if (actualLineHeight === lineHeight && divHeight > 0) {
                actualLineHeight = divHeight / linesInDiv;
            }
        }
    });
    
    // Calculate available line capacity per column
    const availableLinesPerColumn = Math.floor(containerHeight / actualLineHeight);
    
    // With column-fill: auto, text fills columns sequentially
    const fullColumns = Math.floor(totalRenderedLines / availableLinesPerColumn);
    const linesInLastColumn = totalRenderedLines % availableLinesPerColumn;
    
    // Calculate empty lines only after the final text line
    const emptyLinesAfterText = linesInLastColumn > 0 ? (availableLinesPerColumn - linesInLastColumn) : 0;
    const emptyColumnsAfterText = columnCount - (fullColumns + (linesInLastColumn > 0 ? 1 : 0));
    const emptyLines = emptyLinesAfterText + (emptyColumnsAfterText * availableLinesPerColumn);
    
    // Log detailed information
    console.log('=== LINE ANALYSIS ===');
    console.log('Typography & Layout:', {
        fontSize: fontSize.toFixed(2) + 'px',
        lineHeight: actualLineHeight.toFixed(2) + 'px',
        columnCount: columnCount,
        columnWidth: columnWidth.toFixed(2) + 'px'
    });
    console.log('Longest Line Analysis:', {
        text: longestLine.text,
        width: longestLine.width.toFixed(2) + 'px',
        fitsInColumn: longestLine.width <= columnWidth
    });
    console.log('Line Distribution:', {
        totalLines: totalRenderedLines,
        hasWrappedLines: hasWrappedLines,
        availableLinesPerColumn: availableLinesPerColumn,
        fullColumns: fullColumns,
        linesInLastColumn: linesInLastColumn,
        emptyColumnsAfterText: emptyColumnsAfterText,
        emptyLines: emptyLines
    });
}

function debugOverflow() {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (!lyricsContainer) {
        console.error('Lyrics container not found');
        return;
    }
    
    const scrollHeight = lyricsContainer.scrollHeight;
    const clientHeight = lyricsContainer.clientHeight;
    const hasScrollbar = scrollHeight > clientHeight;
    const columnCount = parseInt(window.getComputedStyle(lyricsContainer).columnCount) || 1;
    const fontSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
    
    // Check line fitting
    const containerWidth = lyricsContainer.offsetWidth;
    const columnGap = parseFloat(window.getComputedStyle(lyricsContainer).columnGap) || 0;
    const columnWidth = (containerWidth - (columnCount - 1) * columnGap) / columnCount;
    const longestLine = getLongestLineWidth(lyricsContainer, fontSize);
    const lineFitsInColumn = longestLine.width <= columnWidth;
    
    // Check for horizontal overflow
    const horizontalOverflow = lyricsContainer.scrollWidth > lyricsContainer.clientWidth;
    
    console.log('=== CURRENT STATE ===');
    console.log(`Font size: ${fontSize}px`);
    console.log(`Scroll height: ${scrollHeight}px`);
    console.log(`Client height: ${clientHeight}px`);
    console.log(`Has scrollbar: ${hasScrollbar}`);
    console.log(`Current column count: ${columnCount}`);
    console.log(`Container width: ${containerWidth}px`);
    console.log(`Column width: ${columnWidth.toFixed(2)}px`);
    console.log(`Longest line: "${longestLine.text}" (${longestLine.width}px)`);
    console.log(`Line fits in column: ${lineFitsInColumn}`);
    console.log(`Horizontal overflow: ${horizontalOverflow}`);
    
    // Summary using new scoring logic
    let score = 0;
    let isOptimal = false;
    let reasons = [];
    let isValid = true;
    
    // Priority 1: No scrollbar (critical)
    if (!hasScrollbar) {
        score += 1000;
        reasons.push('no-scrollbar');
    } else {
        isValid = false;
        reasons.push('has-scrollbar');
    }
    
    // Priority 1b: No horizontal overflow (critical)
    if (!horizontalOverflow) {
        score += 1000;
        reasons.push('no-horizontal-overflow');
    } else {
        isValid = false;
        reasons.push('horizontal-overflow');
    }
    
    // Priority 2: Line fits in column (critical)
    if (lineFitsInColumn) {
        score += 500;
        reasons.push('line-fits');
    } else {
        isValid = false;
        reasons.push('line-too-long');
    }
    
    // Priority 3: Reasonable column count (1-4 is good)
    if (columnCount >= 1 && columnCount <= 4) {
        score += 200 - (columnCount * 10);
        reasons.push(`${columnCount}-cols-reasonable`);
    } else if (columnCount <= 6) {
        score += 50;
        reasons.push(`${columnCount}-cols-acceptable`);
    } else {
        isValid = false;
        reasons.push(`${columnCount}-cols-too-many`);
    }
    
    // Priority 4: Font size bonus
    score += fontSize * 2;
    
    // Check if this would be considered optimal
    isOptimal = isValid;
    
    console.log(`\n✅ OPTIMAL: ${isOptimal ? 'YES' : 'NO'} (score: ${score})`);
    console.log(`Reasons: ${reasons.join(', ')}`);
    if (!isOptimal) {
        if (hasScrollbar || horizontalOverflow) console.log('  → Has overflow issues');
        if (!lineFitsInColumn) console.log('  → Line too long for column');
        if (columnCount > 4) console.log(`  → Too many columns (${columnCount})`);
    }
}

// Message system
function showMessage(text, type = 'success') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create message container if it doesn't exist
    let messagesContainer = document.querySelector('.messages');
    if (!messagesContainer) {
        messagesContainer = document.createElement('div');
        messagesContainer.className = 'messages';
        document.body.appendChild(messagesContainer);
    }
    
    // Create message
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    messagesContainer.appendChild(message);
    
    // Auto-remove after animation
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 5000);
}

// Load default songs (from lyrics_storage.js)
async function loadDefaultSongs() {
    // Check if default songs are already loaded
    const defaultSongs = [
        { title: "The Elements", artist: "Tom Lehrer", lyrics: "There's antimony, arsenic, aluminum, selenium\nAnd hydrogen, oxygen, nitrogen, rhenium\nAnd nickel, neodymium, neptunium, germanium\nAnd iron, americium, ruthenium, uranium\nAnd indium, gallium, iodine, thorium, uranium\nAnd chromium, plutonium, lanthanum, molybdenum\nAnd bromine, carbon, cobalt, copper, tungsten, tin, and sodium\nAnd platinum, plutonium, polonium, potassium, tantalum, technetium, titanium\nAnd tellurium, vanadium, zirconium, zinc, and xenon\nAnd scandium, cerium, cesium, lead, praseodymium, and platinum\nAnd gold, protactinium, palladium, promethium, and magnesium\nAnd radium, radon, rhenium, rhodium, and selenium\nAnd antimony, arsenic, aluminum, selenium\nAnd hydrogen, oxygen, nitrogen, rhenium\nAnd nickel, neodymium, neptunium, germanium\nAnd iron, americium, ruthenium, uranium\nAnd indium, gallium, iodine, thorium, uranium\nAnd chromium, plutonium, lanthanum, molybdenum\nAnd bromine, carbon, cobalt, copper, tungsten, tin, and sodium\nAnd platinum, plutonium, polonium, potassium, tantalum, technetium, titanium\nAnd tellurium, vanadium, zirconium, zinc, and xenon\nAnd scandium, cerium, cesium, lead, praseodymium, and platinum\nAnd gold, protactinium, palladium, promethium, and magnesium\nAnd radium, radon, rhenium, rhodium, and selenium", set: 1 },
        { title: "Poisoning Pigeons in the Park", artist: "Tom Lehrer", lyrics: "When I was a lad I served a term\nAs office boy to an attorney's firm.\nI cleaned the windows and I swept the floor,\nAnd I polished up the handle of the big front door.\nI polished up that handle so carefullee\nThat now I am the ruler of the Queen's navée.\n\nWhen I was a lad I served a term\nAs office boy to an attorney's firm.\nI cleaned the windows and I swept the floor,\nAnd I polished up the handle of the big front door.\nI polished up that handle so carefullee\nThat now I am the ruler of the Queen's navée.\n\nWhen I was a lad I served a term\nAs office boy to an attorney's firm.\nI cleaned the windows and I swept the floor,\nAnd I polished up the handle of the big front door.\nI polished up that handle so carefullee\nThat now I am the ruler of the Queen's navée.", set: 1 },
        { title: "The Masochism Tango", artist: "Tom Lehrer", lyrics: "I ache for the touch of your lips, dear,\nBut much more for the touch of your hips, dear.\nI ache for the rest of my life,\nOh, when you are cruel, you're a girl of my dreams.\nI love you, I love you, I love you, I love you,\nI love you, I love you, I love you, I love you,\nI love you, I love you, I love you, I love you,\nI love you, I love you, I love you, I love you.\n\nI ache for the touch of your lips, dear,\nBut much more for the touch of your hips, dear.\nI ache for the rest of my life,\nOh, when you are cruel, you're a girl of my dreams.\nI love you, I love you, I love you, I love you,\nI love you, I love you, I love you, I love you,\nI love you, I love you, I love you, I love you,\nI love you, I love you, I love you, I love you.", set: 1 }
    ];
    
    let songsLoaded = 0;
    
    for (const song of defaultSongs) {
        if (!localStorage.getItem(song.title)) {
            localStorage.setItem(song.title, JSON.stringify({
                artist: song.artist,
                lyrics: song.lyrics,
                set: song.set
            }));
            songsLoaded++;
        }
    }
    
    if (songsLoaded > 0) {
        console.log(`Loaded ${songsLoaded} default songs`);
    }
}

// Load last viewed song
function loadLastViewedSong() {
    const lastViewedSong = localStorage.getItem('lastViewedSong');
    if (lastViewedSong && lastViewedSong !== 'Select a Song') {
        if (localStorage.getItem(lastViewedSong)) {
            try {
                const songData = JSON.parse(localStorage.getItem(lastViewedSong));
                if (songData) {
                    console.log(`Loading last viewed song: ${lastViewedSong}`);
                    autoFitLyrics(lastViewedSong, songData.artist, songData.lyrics);
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

// Touch swipe handling
function setupTouchHandling() {
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
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        const lyricsModal = document.getElementById('lyricsModal');
        const editLyricsModal = document.getElementById('editLyricsModal');
        const aboutModal = document.getElementById('aboutModal');
        
        // Check if any modal is open
        const modalsOpen = [lyricsModal, editLyricsModal, aboutModal].some(modal => 
            modal && modal.style.display === 'block'
        );
        
        if (modalsOpen) {
            // Close modals with Escape
            if (event.key === 'Escape') {
                if (lyricsModal.style.display === 'block') closeModal('lyricsModal');
                if (editLyricsModal.style.display === 'block') closeModal('editLyricsModal');
                if (aboutModal.style.display === 'block') closeModal('aboutModal');
            }
            return;
        }
        
        // Navigation shortcuts
        if (event.key === 'ArrowLeft') {
            loadPrevSong();
        } else if (event.key === 'ArrowRight') {
            loadNextSong();
        } else if (event.key === 'ArrowUp') {
            adjustFontSize(1);
        } else if (event.key === 'ArrowDown') {
            adjustFontSize(-1);
        }
    });
}

// Resize observer
function setupResizeObserver() {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (!lyricsContainer) return;
    
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

// Cleanup old localStorage entries
function cleanupLocalStorage() {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('lyrics-font-size-')) {
            localStorage.removeItem(key);
        }
        if (key && key.startsWith('lyrics-auto-fit-')) {
            localStorage.removeItem(key);
        }
    }
    localStorage.removeItem('lyrics-font-size');
}

// Initialize app
function initializeApp() {
    console.log('=== LYRISET MODERN UI INITIALIZING ===');
    
    // Set initial theme detection
    updateHamburgerIcon();
    
    // Watch for theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateHamburgerIcon);
    }
    
    // Setup UI components
    setupModalBackdrop();
    setupDropdowns();
    setupURLForm();
    setupForms();
    setupTouchHandling();
    setupKeyboardShortcuts();
    setupResizeObserver();
    
    // Load data
    loadDefaultSongs().then(() => {
        loadLastViewedSong();
        const lastViewedSong = localStorage.getItem('lastViewedSong');
        if (lastViewedSong !== 'Select a Song') {
            updateSongDropdown(window.currentSetNumber);
        }
    });
    
    // Cleanup
    cleanupLocalStorage();
    
    // Initialize with Set 1
    window.currentSetNumber = 1;
    updateSongDropdown(1);
    
    console.log('=== LYRISET MODERN UI READY ===');
}

// Export functions for use in other files
if (typeof window !== 'undefined') {
    window.initializeApp = initializeApp;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.toggleNavbar = toggleNavbar;
    window.updateSongDropdown = updateSongDropdown;
    window.loadSong = loadSong;
    window.loadNextSong = loadNextSong;
    window.loadPrevSong = loadPrevSong;
    window.adjustFontSize = adjustFontSize;
    window.toggleCleanLyrics = toggleCleanLyrics;
    window.deleteSong = deleteSong;
    window.openEditModal = openEditModal;
    window.autoFitLyrics = autoFitLyrics;
    window.displayLyrics = displayLyrics;
    window.debugOverflow = debugOverflow;
    window.resetAutoFit = function() {
        const lyricsContainer = document.getElementById('lyricsDisplay');
        if (lyricsContainer) {
            lyricsContainer.style.fontSize = '';
            const currentSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
            adjustColumnsForFontSize(currentSize);
            calculateUnusedSpace();
            showMessage('Auto-fit reset', 'success');
        }
    };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
