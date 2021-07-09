const { Message } = require('discord.js');
const Error = require('../error/error.js');
const { prefix } = require('../config.json');

module.exports = {
    run(client, button) {
        let args = button.id.split("_");
        switch (args[0]) {
            case "oddEven":
                diceGameCheck(client, button, args[1], args[2]);
        }
    }
}

function diceGameCheck(client, button, userId, answer) {
    let clickerId = button.clicker.user.id;
    if (clickerId != userId) {
        button.message.channel.send(`<@${clickerId}>, this is <@${userId}>'s dice game! Enter \`${prefix}rolldice\` to start your own game!`);
    } else {
        let rolldice = client.commands.get("rolldice");
        rolldice.check(client, button, userId, answer);
    }
    
}
