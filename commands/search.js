const { MessageEmbed } = require('discord.js');
const Fuse = require('fuse.js');
const fs = require('fs');
const characters = require('../data/characters.json');

module.exports = {
  name: 'search',
  description: 'Search for character data',
  args: true,
  usage: '<character name>',
  execute(message, args) {

    // Check if data is empty
    if (!Object.keys(characters).length) {
      return message.channel.send('Character list is empty, do scrape');
    }

    const options = {
      keys: ["name", "title"],
      includeScore: true,
      threshold: 0.2
    }

    const fuse = new Fuse(Object.values(characters), options);
    const result = fuse.search(args.join(''));

    if (result.length) {
      const Embed = new MessageEmbed();
      const ch = result[0].item;
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
          .setFooter('Taken from GamePress');
      }

      message.channel.send({ embed: Embed });
    } else {
      message.channel.send('no results');
    }
  }
}
