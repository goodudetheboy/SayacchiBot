const mongoose = require('mongoose');
const highscoreSchema = require('./schemas/highscore');
const RollDiceDB = mongoose.model('RollDice', highscoreSchema);
var client;

module.exports = {
    RollDiceDB,
    setDiscordClient
};

function setDiscordClient(discordClient) {
    client = discordClient;
}
