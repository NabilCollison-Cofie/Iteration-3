const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();

// Import your Song model
const Song = require('./models/Song');
const Playlist = require('./models/Playlist');
// Middleware setup
app.use(express.json());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', async (req, res) => {
    try {
        const songs = await Song.find({});
        // Fetch all playlists and extract time slots
        const playlists = await Playlist.find({}).sort({ timeSlot: 1 }); // Sort by timeSlot
        const timeSlots = playlists.map(playlist => playlist.timeSlot);
        
        res.render('index', { 
            songs: songs,
            timeSlots: timeSlots 
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.render('index', { 
            songs: [],
            timeSlots: [] 
        });
    }
});


// API Routes for songs
app.get('/api/songs', async (req, res) => {
    try {
        const songs = await Song.find({});
        res.json(songs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// API Routes for playlists
app.get('/api/playlists', async (req, res) => {
    try {
        const query = req.query.timeSlot ? { timeSlot: req.query.timeSlot } : {};
        const playlists = await Playlist.find(query).populate('songs');
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/timeslots', async (req, res) => {
    try {
        const playlists = await Playlist.find({}).sort({ timeSlot: 1 });
        const timeSlots = playlists.map(playlist => playlist.timeSlot);
        res.json(timeSlots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/playlist/:timeSlot', async (req, res) => {
    try {
        const playlist = await Playlist.findOne({ timeSlot: req.params.timeSlot })
                                    .populate('songs');
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }
        res.json(playlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/playlists', async (req, res) => {
    try {
        const playlist = new Playlist(req.body);
        await playlist.save();
        res.status(201).json(playlist);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/playlists', async (req, res) => {
    const { timeSlot, songs } = req.body;

    try {
        // Find and update the playlist in the database
        const updatedPlaylist = await Playlist.findOneAndUpdate(
            { timeSlot },
            { songs },
            { new: true, upsert: true } // Create the playlist if it doesn't exist
        );

        res.status(200).json(updatedPlaylist);
    } catch (error) {
        console.error('Error updating playlist:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
