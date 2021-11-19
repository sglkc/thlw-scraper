const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'aliases',
  description: 'List available aliases.',
  execute(message, args) {
    const aliases = require('../data/aliases.json');
    const Embed = new MessageEmbed();
    var content = '';

    if (!Object.keys(aliases).length) {
      content = 'Aliases empty';
    } else {
      for (let alias in aliases) {
        content += `**${aliases[alias].name}:** ${aliases[alias].command}\n`;
      }
    }

    Embed.setTitle('Aliases')
      .setDescription(content);

    message.channel.send({ embed: Embed });
  }
}
