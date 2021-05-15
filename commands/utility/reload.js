const fs = require('fs');

module.exports = {
	name: 'reload',
	description: 'Reloads a command (for testing use only)',
	args: true,
	execute(message, args) {
        const commandName = args[0].toLowerCase();
		const command = message.client.commands.get(commandName)
			|| message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

		if (!command) {
			return console.log(`Reload failed: No command with name or alias \`${commandName}\`, ${message.author}!`);
		}

        const commandFolders = fs.readdirSync('./commands');
        const folderName = commandFolders.find(folder => fs.readdirSync(`./commands/${folder}`).includes(`${command.name}.js`));

        delete require.cache[require.resolve(`../${folderName}/${command.name}.js`)];

        try {
            const newCommand = require(`../${folderName}/${command.name}.js`);
            message.client.commands.set(newCommand.name, newCommand);
            console.log(`Command \`${newCommand.name}\` was reloaded!`);
        } catch (error) {
            console.error(error);
            console.log(`Error reloading a command \`${command.name}\`:\n\`${error.message}\``);
        }
	},
};