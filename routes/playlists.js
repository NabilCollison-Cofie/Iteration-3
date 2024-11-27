const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');

// Get all playlists
router.get('/', async (req, res) => {
    try {
        const playlists = await Playlist.find().populate('songs');
        res.json(playlists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new playlist
router.post('/', async (req, res) => {
    const playlist = new Playlist({
        timeSlot: req.body.timeSlot,
        songs: req.body.songs
    });

    try {
        const newPlaylist = await playlist.save();
        res.status(201).json(newPlaylist);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a playlist
router.put('/:id', async (req, res) => {
    try {
        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedPlaylist);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
