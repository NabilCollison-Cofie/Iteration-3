
function updatePlaylistTable(playlist) {
    const tbody = document.querySelector('#current-playlist-table tbody');
    if (!tbody) {
        console.error('Playlist table tbody not found');
        return;
    }
    tbody.innerHTML = '';

    playlist.forEach((track, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${track.title}</td>
            <td>${track.artist}</td>
            <td>${track.duration}</td>
            <td>
                <button onclick="playSpecificTrack(${index})">Play</button>
                <button onclick="removeTrack(${index})">Remove</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}


// Search functionality
function searchSongs(query) {
    query = query.toLowerCase();
    return allSongs.filter(song =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    );
}

function displaySearchResults(results) {
    const searchResultsDiv = document.getElementById('search-results');
    searchResultsDiv.innerHTML = '';

    if (results.length === 0) {
        searchResultsDiv.innerHTML = '<p>No songs found</p>';
        return;
    }

    const resultList = document.createElement('ul');
    results.forEach(song => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${song.title} - ${song.artist} (${song.duration})
            <button onclick="addToCurrentPlaylist(${JSON.stringify(song).replace(/"/g, '&quot;')})">
                Add to Playlist
            </button>
        `;
        resultList.appendChild(li);
    });
    searchResultsDiv.appendChild(resultList);
}

document.addEventListener('DOMContentLoaded', () => {
    const player = new DJPlayer(timeSlotPlaylists, updatePlaylistTable);
    window.djPlayer = player;

    // Initialize time slots
    const timeDropdown = document.getElementById('time-dropdown');
    Object.keys(timeSlotPlaylists).forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        timeDropdown.appendChild(option);
    });

    // Search input handler
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    searchButton.addEventListener('click', () => {
        const query = searchInput.value;
        const results = searchSongs(query);
        displaySearchResults(results);
    });

    // Time slot selection handler
    const submitButton = document.getElementById('submit-button');
    submitButton.addEventListener('click', (e) => {
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
        
        player.loadPlaylist(selectedTime);
        updatePlaylistTable(player.playlist);
    });

    // Audio player controls
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

    prevButton.addEventListener('click', () => {
        player.previousTrack();
    });

    nextButton.addEventListener('click', () => {
        player.nextTrack();
    });

    // Handle audio ended event
    player.audioPlayer.addEventListener('ended', () => {
        player.nextTrack();
    });
});

// Global functions for onclick handlers
window.playSpecificTrack = function(index) {
    const player = window.djPlayer;
    player.currentTrackIndex = index;
    player.updateCurrentTrack();
    player.play();
};

window.removeTrack = function(index) {
    const player = window.djPlayer;
    player.playlist.splice(index, 1);
    if (index < player.currentTrackIndex) {
        player.currentTrackIndex--;
    }
    updatePlaylistTable(player.playlist);
};

window.addToCurrentPlaylist = function(song) {
    const player = window.djPlayer;
    player.addSongToCurrentPlaylist(song);
};
