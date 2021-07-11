const mongoose = require('mongoose');
const highscoreSchema = require('./schemas/highscore');
const RollDiceDB = mongoose.model('RollDice', highscoreSchema);
module.exports = RollDiceDB;
