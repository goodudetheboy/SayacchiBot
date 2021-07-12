const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix, token } = require('./config.json');

const fs = require('fs');
client.commands = new Discord.Collection();
const commandFolders = fs.readdirSync('./commands');

const Error = require('./error/error.js');
const IntervalHandler = require('./handler/interval');
const ButtonHandler = require('./handler/button');
const disbut = require('discord-buttons');
disbut(client);

const DatabaseHandler = require('./handler/database.js');

(async() => {
    await DatabaseHandler.initialize(client);

    for (const folder of commandFolders) {
        if (folder != 'class') {
            const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                console.log(`Loading command ${folder}/${file} into client`);
                const command = require(`./commands/${folder}/${file}`);
                if (folder == 'game') {
                    command.setDatabases(DatabaseHandler.databases);
                }
                client.commands.set(command.name, command);
            }
        }
    }
})();

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

    IntervalHandler.run(client);
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

client.on('clickButton', async(button) => {
    ButtonHandler.run(client, button);
});

client.login(token);  