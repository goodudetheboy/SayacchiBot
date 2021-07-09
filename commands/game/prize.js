const Error = require('../../error/error.js');

module.exports = {
    name: 'prize',
    description: 'Play one of the games for a chance to win a special prize!',
    args: false,
    aliases: [],
    execute(message, args) {
        message.channel.send('Play one of the games for a chance to win a special prize!');
    },
    imagePrize
}

function imagePrize(message, client) {
    let saya = client.commands.get("saya");
    saya.sendImage(message, 'Here\'s your special prize! Plus a little キース from me 💋!');
}