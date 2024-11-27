const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
    timeSlot: {
        type: String,
        required: true
    },
    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }],
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Playlist', PlaylistSchema);
