const Discord = require('discord.js');
const { prefix, token, cse_id, api_key, test_channel_id } = require('./config.json');
const fs = require('fs');
// const GoogleImage = require('google-images');
const Error = require('./error/error.js');
// const Utils = require('./utils.js');

// const google = new GoogleImage(cse_id, api_key);
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}

client.once('ready', () => {
    console.log('Bot is online!');
    client.user.setPresence({
        activity: {
            name: '@ home',
            type: 'PLAYING'
        },
        status: 'online' })
    .then(console.log('Bot activity set successfully'))
    .catch(console.error);

    // TODO: below is interval action, consider refactoring it into a different file, say 'repeat.js'
    const timetableCommand = client.commands.get('timetable');
    // const checkLiveChannel = client.channels.cache.get(test_channel_id);
    const checkLiveChannel = client.channels.cache.get('839154353046290513');
    setInterval(function() { 
        timetableCommand.checkLiveInRepeat(checkLiveChannel, 'saya');
    }, 1000 * 60 * 60);
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (command.args && !args.length) {
        return message.channel.send(`You didn't provide any arguments, ${ message.author }!`);
    }

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        Error.sendUnknownError(message);
    }
});

client.login(token);  