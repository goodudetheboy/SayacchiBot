const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const highscoreSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    highscore: {
        type: Number,
        default: 0
    },
    currentStreak: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

highscoreSchema.statics.getHighscore = async function (userId) {
    let player;
    player = await this.findById(userId);
    return player.highscore;
};

highscoreSchema.statics.getCurrentStreak = async function (userId) {
    let player;
    player = await this.findById(userId);
    return player.currentStreak;
};


module.exports = highscoreSchema;
