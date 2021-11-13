const { MessageEmbed } = require('discord.js');
const { prefix } = require('../config.json');

module.exports = {
	name: 'help',
	description: 'List every commands possible',
	execute(message, args) {
		const { commands } = message.client;

		if (!args.length) {
			const data = [];

			commands.map((command) => {
				data.push(`**${command.name}**: ${command.description}`);
			});

			const embed = new MessageEmbed()
				.setTitle('Bot Help')
				.setDescription(`Current prefix: ${prefix}`)
				.addFields(
					{ name: 'Commands', value: data.join('\n'), inline: false}
				);

			message.channel.send({ embed: embed});
		} else {
			const name = args[0];
			const command = commands.get(name)
				|| commands.find(c => c.aliases && c.aliases.includes(name));

			const aliases = command.aliases ? command.aliases.join(', ') : 'None';
			const usage = command.usage
				? `${prefix}${command.name} ${command.usage}`
				: `${prefix}${command.name}`;

			const embed = new MessageEmbed()
				.setTitle(`${args} command`)
				.addFields(
					{ name: 'Description', value: command.description, inline: false},
					{ name: 'Aliases', value: aliases, inline: false},
					{ name: 'Usage', value: usage, inline: false}
				);

			message.channel.send({ embed: embed});
		}
	},
}
