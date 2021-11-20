const { MessageEmbed } = require('discord.js');
const Fuse = require('fuse.js');
const fs = require('fs');
const characters = require('../data/characters.json');

module.exports = {
  name: 'searchchar',
  description: 'Search for character data',
  aliases: ['char', 'ch'],
  args: true,
  usage: '<character name>',
  execute(message, args) {
    const { searchThreshold } = require('../config.json');
    const name = args.join(' ');

    // Check if data is empty
    if (!Object.keys(characters).length) {
      return message.channel.send('Character list is empty, do scrape');
    }

    const options = {
      keys: ['name', 'title'],
      includeScore: true,
      threshold: 0.4
    }

    const fuse = new Fuse(Object.values(characters), options);
    const results = fuse.search(name, { limit: 5 });

    if (results.length) {
      const Embed = new MessageEmbed();

      if (results.length === 1 || results[0].score < searchThreshold) {
        const ch = results[0].item;
        const name = ch.name;
        const tier = ch.tier;
        const img = ch.img;
        const url = ch.url;
        const info = ch.info === '' ? 'Empty' : ch.info;
        const type = ch.type === '' ? 'General' : ch.type;

        Embed.setTitle(name)
          .setURL(url)
          .setDescription(
            `**Tier:** ${tier.overall} | ` +
            `**Farm:** ${tier.farm} | ` +
            `**CQ:** ${tier.tower}\n` +
            `**Type:** ${type}`
          )
          .setThumbnail(img)
          .addField('Description', info, false)
          .setFooter('No additional info available');

        // If extra data available
        if (ch.extras) {
          const title = ch.title;
          const role = ch.role;
          const bigimg = ch.bigimg;
          const resist = ch.resist.join(', ');
          const weak = ch.weak.join(', ');

          Embed.setDescription(
              `***${title}***\n` +
              `**Tier:** ${tier.overall} | ` +
              `**Farm:** ${tier.farm} | ` +
              `**CQ:** ${tier.tower}\n` +
              `**Role:** ${role}\n` +
              `**Type:** ${type}`
            )
            .addField('Resistances', resist, true)
            .addField('Weaknesses', weak, true)
            .setImage(bigimg)
            .setFooter('Taken from GamePress | Click title to open link');
        }
      } else {
        let description = `Looking for **${name}**\n\n` +
          'Closest characters:';

        results.forEach((result, i) => {
          description = description + `\n**${result.item.name}**`;
        });

        Embed.setTitle('Not found!')
          .setDescription(description);
      }

      message.channel.send({ embed: Embed });
    } else {
      message.channel.send('No results');
    }
  }
}
