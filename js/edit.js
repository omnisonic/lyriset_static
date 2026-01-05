// lyrics_edit.js

function openEditModal() {
    const currentSong = document.getElementById('songTitle').textContent;
    
    if (!currentSong || currentSong === 'Select a Song') {
        alert('Please select a song to edit.');
        return;
    }

    const songData = JSON.parse(localStorage.getItem(currentSong));
    
    if (!songData) {
        alert('Song data not found.');
        return;
    }

    // Populate the input fields with the current song data
    document.getElementById('editSongInput').value = currentSong;
    document.getElementById('editArtistInput').value = songData.artist;
    document.getElementById('editLyricsText').value = songData.lyrics;

    // Use Bootstrap's data API instead of JavaScript initialization
    const editModal = document.getElementById('editLyricsModal');
    const formTypeInput = document.getElementById('formType');
    if (formTypeInput) {
        formTypeInput.value = 'edit';
    }

    const bsModal = new bootstrap.Modal(editModal);
    bsModal.show();
}

// Main event listener for the page load
document.addEventListener('DOMContentLoaded', function () {
    const editLyricsForm = document.getElementById('editLyricsForm');
    if (editLyricsForm) {
        editLyricsForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const song = document.getElementById('editSongInput').value.trim();
            const artist = document.getElementById('editArtistInput').value.trim();
            const lyrics = document.getElementById('editLyricsText').value.trim();
            
            
            if (!song || !lyrics) {
                return;
            }

            // Save the edited data in localStorage
            localStorage.setItem(song, JSON.stringify({
                artist: artist,
                lyrics: lyrics,
                set: window.currentSetNumber
            }));

            // Update the displayed lyrics
            if (typeof autoFitLyrics === 'function') {
                autoFitLyrics(song, artist, lyrics);
            } else if (typeof displayLyrics === 'function') {
                displayLyrics(song, artist, lyrics);
            }

            // Close the modal using Bootstrap's getInstance
            const modalElement = document.getElementById('editLyricsModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            }
        });
    }
});
