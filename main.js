const Discord = require('discord.js');
const { prefix, token, cse_id, api_key } = require('./config.json');
const fs = require('fs');
const GoogleImage = require('google-images');
const Error = require('./error.js');
const Utils = require('./utils.js');

const client = new Discord.Client();
client.commands = new Discord.Collection();
// const google = new GoogleImage(cse_id, api_key);

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('Bot is online!');
    client.user.setPresence({
        activity: {
            name: '@ home',
            type: 'STREAMING'
        },
        status: 'online' })
    .then(console.log('Bot activity set successfully'))
    .catch(console.error);
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

    if (!client.commands.has(command)) return;

    try {
        client.commands.get(command).execute(message, args);
    } catch (error) {
        console.error(error);
        Error.sendError(message);
    }

});

client.login(token);  