const Discord = require('discord.js');
const { prefix } = require('../config.json');

module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	execute(message, args) {
		const data = [];
		const { commands } = message.client;
        // TODO: add support for specific commands
		if (!args.length) {
            var embed = new Discord.MessageEmbed()
                .setTitle('Here\'s the list of available commands')
                .setColor(0xff0000);
            for(var [key, value] of commands.entries()) {
                embed.addField(prefix + key, value.description);
            }
        
            return message.channel.send(embed)
		}
	},
};

/////////////////////////////MAIN FUNCTION/////////////////////////////
