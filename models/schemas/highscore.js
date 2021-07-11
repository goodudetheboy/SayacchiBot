const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const highscoreSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    highscore: {
        type: String,
        default: 0
    },
    currentStreak: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

highscoreSchema.statics.getHighscore = async function (userId) {
    return this.findById(userId).highscore;
};

highscoreSchema.statics.getCurrentStreak = async function (userId) {
    return this.findById(userId).currentStreak;
};


module.exports = highscoreSchema;
