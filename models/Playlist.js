const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    timeSlot: {
        type: String,
        required: true
    },
    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }]
});

module.exports = mongoose.model('Playlist', playlistSchema);
