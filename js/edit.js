// lyrics_edit.js

function openEditModal() {
    const currentSong = document.getElementById('songTitle').textContent;
    console.log('Current song:', currentSong);
    
    if (!currentSong || currentSong === 'Select a Song') {
        alert('Please select a song to edit.');
        console.log('No song selected or default text detected.');
        return;
    }

    const songData = JSON.parse(localStorage.getItem(currentSong));
    
    if (!songData) {
        alert('Song data not found.');
        console.log('Song data is empty or not found in localStorage.');
        return;
    }

    // Populate the input fields with the current song data
    document.getElementById('editSongInput').value = currentSong;
    document.getElementById('editArtistInput').value = songData.artist;
    document.getElementById('editLyricsText').value = songData.lyrics;

    // Use Bootstrap's data API instead of JavaScript initialization
    const editModal = document.getElementById('editLyricsModal');
    const bsModal = new bootstrap.Modal(editModal);
    bsModal.show();
}

// Main event listener for the page load
document.addEventListener('DOMContentLoaded', function () {
    const editLyricsForm = document.getElementById('editLyricsForm');
    if (editLyricsForm) {
        editLyricsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Editing lyrics...');

            const song = document.getElementById('editSongInput').value.trim();
            const artist = document.getElementById('editArtistInput').value.trim();
            const lyrics = document.getElementById('editLyricsText').value.trim();
            
            console.log('Song:', song);
            console.log('Artist:', artist);
            
            if (!song || !lyrics) {
                console.log('Song or lyrics field is empty. Aborting save.');
                return;
            }

            // Save the edited data in localStorage
            localStorage.setItem(song, JSON.stringify({
                artist: artist,
                lyrics: lyrics,
                set: window.currentSetNumber
            }));
            console.log('Updated song data saved to localStorage');

            // Update the displayed lyrics
            displayLyrics(song, artist, lyrics);
            updateSongDropdown(window.currentSetNumber);

            // Close the modal using Bootstrap's getInstance
            const modalElement = document.getElementById('editLyricsModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            }
        });
        console.log('Edit lyrics form event listener added.');
    }
});
