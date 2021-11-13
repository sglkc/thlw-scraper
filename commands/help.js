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
		}
	},
}
