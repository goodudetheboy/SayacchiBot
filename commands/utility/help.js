const Discord = require('discord.js');
const { prefix } = require('../../config.json');

module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
    args: false,
	execute(message, args) {
		const data = [];
		const { commands } = message.client;

        // Get list of every commands
		if (!args.length) {
            var embed = new Discord.MessageEmbed()
                .setTitle('Here\'s the list of available commands')
                .setColor(0xff0000);
            for(var [key, value] of commands.entries()) {
                embed.addField(prefix + key, value.description);
            }
            return message.channel.send(embed)
		}

        // Search for specific command
        for(var [key, value] of commands.entries()) {
            if(key.localeCompare(args[0]) == 0) {
                return sendEmbedHelp(message, key, value.description);
            }
        }

        // If find no command
        message.channel.send(`Oopsie, there\'s no command \`${args[0]}\` that I know of.`)
	},
};

//-----------------------------------------------------------------------------


//-----------------------------------------------------------------------------

function sendEmbedHelp(message, name, description) {
    var embed = new Discord.MessageEmbed()
        .setTitle('Here\'s info for your requested command')
        .setColor(0xff0000)
        .addField(prefix + name, description);
    return message.channel.send(embed);
}