const fs = require('fs');

module.exports = {
	name: 'reload',
	description: 'Reloads a command',
	owner: true,
	args: true,
	usage: '<command>',
	execute(message, args) {
		const commandName = args[0].toLowerCase();
		const command = message.client.commands.get(commandName)
			|| message.client.commands.find(
		cmd => cmd.aliases && cmd.aliases.includes(commandName)
	);

		if (!command) {
			return message.channel.send(`Command \`${commandName}\` not found!`);
		}

		delete require.cache[require.resolve(`./${command.name}.js`)];

		try {
			const newCommand = require(`./${command.name}.js`);
			message.client.commands.set(newCommand.name, newCommand);
			message.channel.send(`Command \`${newCommand.name}\` was reloaded!`);
		} catch (error) {
			console.error(error);
			message.channel.send(
				`Error reloading \`${command.name}\`:\n\`${error.message}\``
			);
		}
	},
}
