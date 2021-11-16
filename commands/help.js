const { MessageEmbed } = require('discord.js');
const { prefix, owner } = require('../config.json');

module.exports = {
  name: 'help',
  description: 'List every commands possible',
  execute(message, args) {
    const { commands } = message.client;

    if (!args.length) {
      const ownerUser = message.client.users.cache.get(owner);
      const everyone = [];
      const ownerOnly = [];

      commands.map((command) => {
        const text = `**${command.name}**: ${command.description}`;

        if (command.owner) {
          ownerOnly.push(text);
        } else {
          everyone.push(text);
        }
      });

      const embed = new MessageEmbed()
        .setTitle('Bot Help')
        .setDescription(
          `Bot owner: ${ownerUser.tag}\nCurrent prefix: ${prefix}`
        )
        .addFields(
          { name: 'Bot Owner', value: ownerOnly.join('\n'), inline: false },
          { name: 'Commands', value: everyone.join('\n'), inline: false }
        );

      message.channel.send({ embed: embed});
    } else {
      const name = args[0];
      const command = commands.get(name)
        || commands.find(c => c.aliases && c.aliases.includes(name));

      const description = command.owner
        ? command.description + '\n(Bot Owner only)'
        : command.description;

      const aliases = command.aliases ? command.aliases.join(', ') : 'None';
      const usage = command.usage
        ? `${prefix}${command.name} ${command.usage}`
        : `${prefix}${command.name}`;

      const embed = new MessageEmbed()
        .setTitle(`${args} command`)
        .addFields(
          { name: 'Description', value: description, inline: false},
          { name: 'Aliases', value: aliases, inline: false},
          { name: 'Usage', value: usage, inline: false}
        );

      message.channel.send({ embed: embed});
    }
  },
}
