let songs = [];  // Will store all songs
let currentPlaylist = [];  // Will store current playlist

// Function to load songs from database
async function loadSongs() {
    try {
        const response = await fetch('/api/songs');
        songs = await response.json();
        console.log('Songs loaded:', songs);
        
    } catch (error) {
        console.error('Error loading songs:', error);
    }
}

 


// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadSongs();
    const player = new DJPlayer();
    window.djPlayer = player;
    

    const timeDropdown = document.getElementById('time-dropdown');
    const previoustimeDropdown = document.getElementById('time-dropdown2');
    /*
    try {
        const response = await fetch('/api/timeslots');
        const timeSlots = await response.json();
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "Select a time slot";
        timeDropdown.appendChild(defaultOption);
        
        // Add time slots from database
        timeSlots.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            timeDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading time slots:', error);
    }
    */
    // Time slot selection handler
    const submitButton = document.getElementById('submit-button');
    submitButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const selectedTime = timeDropdown.value;
        
        if (!selectedTime) {
            alert('Please select a time slot!');
            return;
        }

        const timeDisplay = document.querySelector('#selected-time time');
        if (timeDisplay) {
            timeDisplay.textContent = selectedTime;
        }
        
        await player.loadPlaylist(selectedTime);
    });

    // Audio player controls setup
    setupAudioControls(player);

    const previoudsubmitButton = document.getElementById('submit-button2');

    previoudsubmitButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const selectedTime = previoustimeDropdown.value;
        
        if (!selectedTime) {
            alert('Please select a time slot!');
            return;
        }

        const timeDisplay = document.querySelector('#selected-time2 time');
        if (timeDisplay) {
            timeDisplay.textContent = selectedTime;
        }
        
        await player.previousloadPlaylist(selectedTime);
    });
});

function setupAudioControls(player) {
    const playPauseButton = document.querySelector('.play-pause');
    const prevButton = document.querySelector('.prev-track');
    const nextButton = document.querySelector('.next-track');

    playPauseButton.addEventListener('click', () => {
        if (player.isPlaying) {
            player.pause();
            playPauseButton.textContent = 'Play';
        } else {
            player.play();
            playPauseButton.textContent = 'Pause';
        }
    });

    prevButton.addEventListener('click', () => player.previousTrack());
    nextButton.addEventListener('click', () => player.nextTrack());
}

// Drag and drop handling
function handleDragStart(e) {
    const songId = e.target.getAttribute('data-song-id');
    const song = songs.find(s => s._id === songId);
    e.dataTransfer.setData('text/plain', JSON.stringify(song));
}



window.addToCurrentPlaylist = async function(songId) {
    const song = songs.find(s => s._id === songId);
    if (song) {
        await window.djPlayer.addSongToPlaylist(song);
    }
};
