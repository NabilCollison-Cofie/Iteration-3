require('dotenv').config();
const mongoose = require('mongoose');
const Song = require('./models/Song');
const Playlist = require('./models/Playlist');

// Your existing song data (from data.js)
const initialSongs   = [
    { title: 'All About That Bass', artist: 'Meghan Trainor', duration: '3:09', file: 'songs/All About That Bass.mp3' },
    { title: 'APT', artist: 'ROSE, Bruno Mars', duration: '2:53', file: 'songs/APT.mp3' },
    { title: 'Expresso', artist: 'Sabrina Carpenter', duration: '3:20', file: 'songs/Espresso.mp3' },
    { title: 'Shape of You', artist: 'ED Sheeran', duration: '4:23', file: 'songs/Shape of You.mp3' },
    { title: 'Sugar', artist: 'Maroon 5', duration: '4:24', file: 'songs/Sugar.mp3' },
    { title: 'Uptown Funk', artist: 'Mark Ronson, Bruno Mars', duration: '4:30', file: 'songs/Uptown Funk.mp3' },
];

const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM"
];

// Predefined playlists with 3 songs each
const createPlaylistAssignments = (songs) => ({
    "9:00 AM": [songs[0], songs[1], songs[2]], // Bad Blood, Shake It Off, Uptown Funk
    "10:00 AM": [songs[1], songs[2], songs[3]], // Shake It Off, Uptown Funk, Shape of You
    "11:00 AM": [songs[2], songs[3], songs[4]], // Uptown Funk, Shape of You, Despacito
    "12:00 PM": [songs[3], songs[4], songs[0]], // Shape of You, Despacito, Bad Blood
    "1:00 PM": [songs[4], songs[0], songs[1]], // Despacito, Bad Blood, Shake It Off
    "2:00 PM": [songs[0], songs[2], songs[4]], // Bad Blood, Uptown Funk, Despacito
});

async function initializeDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Song.deleteMany({});
        await Playlist.deleteMany({});
        console.log('Cleared existing data');

        // Insert songs
        const savedSongs = await Song.insertMany(initialSongs);
        console.log(`Added ${savedSongs.length} songs to database`);

        // Create playlist assignments with the saved songs (with MongoDB IDs)
        const playlistAssignments = createPlaylistAssignments(savedSongs);

        // Create playlists for each time slot
        const playlistPromises = timeSlots.map(timeSlot => {
            const playlist = new Playlist({
                timeSlot: timeSlot,
                songs: playlistAssignments[timeSlot].map(song => song._id)
            });
            return playlist.save();
        });

        const savedPlaylists = await Promise.all(playlistPromises);
        console.log(`Created ${savedPlaylists.length} playlists`);

        // Log the created playlists for verification
        const populatedPlaylists = await Playlist.find().populate('songs');
        console.log('\nCreated Playlists:');
        populatedPlaylists.forEach(playlist => {
            console.log(`\nTime Slot: ${playlist.timeSlot}`);
            console.log('Songs:');
            playlist.songs.forEach(song => {
                console.log(`- ${song.title} by ${song.artist}`);
            });
        });

    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the initialization
initializeDatabase();