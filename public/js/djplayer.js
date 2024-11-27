
class DJPlayer {
    constructor(timeSlotPlaylists, updatePlaylistTable) {
        this.timeSlotPlaylists = timeSlotPlaylists;
        this.updatePlaylistTable = updatePlaylistTable;
        this.playlist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.audioPlayer = document.getElementById('audio-player');
        this.currentTimeSlot = null;
    }

    loadPlaylist(timeSlot) {
        this.currentTimeSlot = timeSlot;
        this.playlist = [...timeSlotPlaylists[timeSlot]] || [];
        this.currentTrackIndex = 0;
        this.updateCurrentTrack();
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

    updateNowPlayingDisplay(track) {
        const songTitle = document.querySelector('.song-title');
        const artistName = document.querySelector('.artist-name');
        if (songTitle && artistName) {
            songTitle.textContent = track.title;
            artistName.textContent = track.artist;
        }
    }

    addSongToCurrentPlaylist(song) {
        if (!this.currentTimeSlot) {
            alert('Please select a time slot first!');
            return;
        }
        
        this.playlist.push(song);
        timeSlotPlaylists[this.currentTimeSlot] = [...this.playlist];
        updatePlaylistTable(this.playlist);
    }
}