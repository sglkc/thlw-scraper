const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'aliases',
  description: 'List available aliases.',
  execute(message, args) {
    const aliases = require('../data/aliases.json');
    const Embed = new MessageEmbed();
    const values = Object.values(aliases);
    var content = '';

    if (!values.length) {
      content = 'Aliases empty';
    } else {
      values.forEach((alias) => {
        content += `**${alias.name}:** ` +
        `${alias.command.join(' ')}\n`;
      });
    }

    Embed.setTitle('Aliases')
      .setDescription(content);

    message.channel.send({ embed: Embed });
  }
}
