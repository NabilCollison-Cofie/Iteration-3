class DJPlayer {
    constructor() {

        this.playlist = [];
        this.previousPlaylist  = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.audioPlayer = document.getElementById('audio-player');
        this.currentTimeSlot = null;
        this.previousTimeSlot = null;

        // Setup ended event listener
        this.audioPlayer.addEventListener('ended', () => this.nextTrack());
    }

    async loadPlaylist(timeSlot) {
        try {
            this.currentTimeSlot = timeSlot;
            const response = await fetch(`/api/playlists?timeSlot=${timeSlot}`);
            const playlists = await response.json();
            
            if (playlists.length > 0) {
                this.playlist = playlists[0].songs;
            } else {
                this.playlist = [];
            }
            
            this.currentTrackIndex = 0;
            this.updateCurrentTrack();
            this.updatePlaylistTable(); 
        } catch (error) {
            console.error('Error loading playlist:', error);
        }
    }

    async previousloadPlaylist(timeSlot) {
        try {
            this.previousTimeSlot = timeSlot;
            const response = await fetch(`/api/playlists?timeSlot=${timeSlot}`);
            const playlists = await response.json();
            
            if (playlists.length > 0) {
                this.previousPlaylist = playlists[0].songs;
            } else {
                this.previousPlaylist = [];
            }
            
            
            
            this.updatePreviousPlaylistTable(); 
        } catch (error) {
            console.error('Error loading playlist:', error);
        }
    }
    updatePreviousPlaylistTable() {
        const tbody = document.querySelector('#previous-playlist-table tbody');
        if (!tbody) {
            console.error('Previous playlist table tbody not found');
            return;
        }
        tbody.innerHTML = ''; // Clear previous rows
    
        
        this.previousPlaylist.forEach((track, index) => {
            const row = document.createElement('tr');
    
            
            const currentClass = '';
            row.className = currentClass;
    
            row.innerHTML = `
                <td>${track.title}</td>
                <td>${track.artist}</td>
                <td>${track.duration || ''}</td>
                <td>
                    <button onclick="window.djPlayer.addToCurrentPlaylist(${index})">Add</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    

    updatePlaylistTable() {
        const tbody = document.querySelector('#current-playlist-table tbody');
        if (!tbody) {
            console.error('Playlist table tbody not found');
            return;
        }
        tbody.innerHTML = '';
    
        this.playlist.forEach((track, index) => {
            const row = document.createElement('tr');
            const currentClass = index === this.currentTrackIndex ? 'current-track' : '';
            row.className = currentClass;
            
            row.innerHTML = `
                <td>${track.title}</td>
                <td>${track.artist}</td>
                <td>${track.duration || ''}</td>
                <td>
                    <button onclick="window.djPlayer.playTrack(${index})">Play</button>
                    <button onclick="window.djPlayer.removeTrack(${index})">Remove</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateCurrentTrack() {
        if (this.playlist.length > 0) {
            const currentTrack = this.playlist[this.currentTrackIndex];
            this.audioPlayer.src = currentTrack.file;
            this.updateNowPlayingDisplay(currentTrack);
        }
    }

    play() {
        if (this.playlist.length > 0) {
            this.isPlaying = true;
            this.audioPlayer.play();
        }
    }

    pause() {
        this.isPlaying = false;
        this.audioPlayer.pause();
    }

    nextTrack() {
        if (this.currentTrackIndex < this.playlist.length - 1) {
            this.currentTrackIndex++;
            this.updateCurrentTrack();
            if (this.isPlaying) this.play();
        }
    }

    previousTrack() {
        if (this.currentTrackIndex > 0) {
            this.currentTrackIndex--;
            this.updateCurrentTrack();
            if (this.isPlaying) this.play();
        }
    }

    playTrack(index) {
        if (index >= 0 && index < this.playlist.length) {
            this.currentTrackIndex = index;
            this.updateCurrentTrack();
            this.play();
        }
    }

    updateNowPlayingDisplay(track) {
        const songTitle = document.querySelector('.song-title');
        const artistName = document.querySelector('.artist-name');
        if (songTitle && artistName) {
            songTitle.textContent = track.title;
            artistName.textContent = track.artist;
        }
    }

    async addToCurrentPlaylist(index) {
        if (!this.previousTimeSlot) {
            alert('Please select a previous time slot first!');
            return;
        }
    
        // Ensure the index is valid
        const song = this.previousPlaylist[index];
        if (!song) {
            alert('Invalid song selection!');
            return;
        }
    
        // Add the song to the current playlist
        this.playlist.push(song);
    
        try {
            // Save the updated playlist to the database
            const response = await fetch(`/api/playlists?timeSlot=${this.currentTimeSlot}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ songs: this.playlist })
            });
    
            if (!response.ok) {
                throw new Error('Failed to update the playlist in the database');
            }
    
            // Update the UI
            this.updatePlaylistTable();
            alert('Song added to the current playlist!');
        } catch (error) {
            console.error('Error updating the playlist:', error);
            alert('Failed to add the song to the playlist. Please try again.');
        }
    }
    

    async removeTrack(index) {
        if (index < 0 || index >= this.playlist.length) {
            alert('Invalid track index!');
            return;
        }
    
        // Remove the song from the playlist
        this.playlist.splice(index, 1);
    
        // Adjust the current track index if necessary
        if (index < this.currentTrackIndex) {
            this.currentTrackIndex--;
        }
    
        try {
            // Save the updated playlist to the database
            const response = await fetch(`/api/playlists?timeSlot=${this.currentTimeSlot}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ songs: this.playlist })
            });
    
            if (!response.ok) {
                throw new Error('Failed to update the playlist in the database');
            }
    
            // Update the UI
            this.updatePlaylistTable();
            alert('Track removed successfully!');
        } catch (error) {
            console.error('Error removing the track:', error);
            alert('Failed to remove the track. Please try again.');
        }
    }
    

    async savePlaylist() {
        try {
            const songIds = this.playlist.map(song => song._id);
            const response = await fetch('/api/playlists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    timeSlot: this.currentTimeSlot,
                    songs: songIds
                })
            });
            const result = await response.json();
            console.log('Playlist saved:', result);
        } catch (error) {
            console.error('Error saving playlist:', error);
        }
    }
}
