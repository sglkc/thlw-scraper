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
  async execute(message, args) {
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
          .setFooter('Taken from GamePress | No additional info available');

        // If extra data available
        if (!ch.extras) {
          return message.channel.send({ embed: Embed });
        } else {
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
            .addField('Weaknesses', weak || 'None', true)
            .setImage(bigimg)
            .setFooter(
              'Taken from GamePress | Click title to open link\n' +
              'Use reaction below to see extra information!'
            );

          // Begin of reaction controller
          const sentEmbed = await message.channel.send({ embed: Embed });
          await sentEmbed.react('📄');
          const reactions = sentEmbed.createReactionCollector(
            (reaction, user) => reaction.emoji.name === '📄',
            { time: 15000 }
          );

          reactions.on('collect', (reaction) => {
            sentEmbed.reactions.removeAll();

            const command = message.client.commands.get('extras');

            try {
              command.execute(message, [ name ]);
              sentEmbed.delete();
            } catch (error) {
              console.error();
              message.reply('An error has occured');
            }
          });

          reactions.on('end', () => {
            if (!sentEmbed.deleted) {
              sentEmbed.reactions.removeAll();
            }
          });
        }
      } else {
        let description = `Looking for **${name}**\n\n` +
          'Closest characters:';

        results.forEach((result, i) => {
          description = description + `\n${result.item.name}`;
        });

        Embed.setTitle('Not found!')
          .setDescription(description);

        return message.channel.send({ embed: Embed });
      }
    } else {
      return message.channel.send('No results');
    }
  }
}
