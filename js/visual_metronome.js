const bpmInput = document.getElementById('bpm');
const display = document.getElementById('metronome');
const beatsSelect = document.getElementById('beats');

let bpm = parseInt(bpmInput.value);
let beats = parseInt(beatsSelect.value);
let isRunning = false;
let intervalId;
let count = 1;


function updateBPM() {
    const newBPM = parseInt(bpmInput.value);
    if (!isNaN(newBPM) && newBPM >= 40 && newBPM <= 240) {
        bpm = newBPM;
        if (isRunning) {
            clearInterval(intervalId);
            startMetronome();
        }
    } else {
        alert("Please enter a BPM between 40 and 240.");
        bpmInput.value = bpm; // Revert to last valid value.
    }
}

function updateBeats() {
    beats = parseInt(beatsSelect.value);
}


function startMetronome() {
    intervalId = setInterval(() => {

        display.textContent = count;

        // Apply green flash only on beat 1
        if (count === 1) {
            display.classList.add("running");
            document.body.classList.add("beat-flash"); // Add class to body for green border

            setTimeout(() => {
                display.classList.remove("running");
                document.body.classList.remove("beat-flash"); // Remove class from body
            }, 100); // Quick flash
        }



        count = (count % beats) + 1;


    }, 60000 / bpm); // Calculate interval in milliseconds
    display.title = 'Click to Stop / Press Spacebar';
}

function stopMetronome() {
    clearInterval(intervalId);
    display.title = 'Click to Start / Press Spacebar';
    count = 1;  //Always starts at 1
    display.textContent = count;
    document.body.classList.remove("beat-flash"); //Remove class from body (incase its running)
    isRunning = false;
}

display.addEventListener('click', toggleMetronome);
document.addEventListener('keydown', function(event) {
if (event.code === 'Space') {
    event.preventDefault();
    toggleMetronome();
    }
});

function toggleMetronome() {
    if (isRunning) {
        stopMetronome();
      } else {
        updateBPM();
        if (!isNaN(bpm) && bpm >= 40 && bpm <= 240) {
            startMetronome();
            isRunning = true;
        }
    }
}


bpmInput.addEventListener('change', updateBPM);
beatsSelect.addEventListener('change', updateBeats);
