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

    // Set form to edit mode before opening (show.bs.modal won't override since no relatedTarget)
    const formTypeInput = document.getElementById('formType');
    if (formTypeInput) formTypeInput.value = 'edit';

    const origInput = document.getElementById('originalSongTitle');
    if (origInput) origInput.value = currentSong;

    // Populate form fields
    document.getElementById('songInput').value = currentSong;
    document.getElementById('artistInput').value = songData.artist;
    document.getElementById('lyricsText').value = songData.lyrics;

    // Set the set selector to the song's current set
    const setSelect = document.getElementById('setSelect');
    if (setSelect) setSelect.value = songData.set || 1;

    // Show move/copy toggle (editing an existing song)
    const toggle = document.getElementById('moveCopyToggle');
    if (toggle) toggle.style.display = 'flex';
    const moveRadio = document.querySelector('input[name="moveCopy"][value="move"]');
    if (moveRadio) moveRadio.checked = true;

    // Update modal title
    const label = document.getElementById('lyricsModalLabel');
    if (label) label.textContent = 'Edit Song';

    const bsModal = new bootstrap.Modal(document.getElementById('lyricsModal'));
    bsModal.show();
}
