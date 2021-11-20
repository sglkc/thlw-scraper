const { MessageEmbed } = require('discord.js');
const Fuse = require('fuse.js');
const fs = require('fs');
const storycards = require('../data/storycards.json');

module.exports = {
  name: 'searchstorycard',
  description: 'Search for story card data',
  aliases: ['searchsc', 'story', 'card', 'sc'],
  args: true,
  usage: '<story card name>',
  execute(message, args) {
    const { searchThreshold } = require('../config.json');
    const name = args.join(' ');

    // Check if data is empty
    if (!Object.keys(storycards).length) {
      return message.channel.send('Story card list is empty, do scrape');
    }

    const options = {
      keys: ['name'],
      includeScore: true,
      threshold: 0.4,
      ignoreLocation: true
    }

    const fuse = new Fuse(Object.values(storycards), options);
    const results = fuse.search(args.join(''));

    if (results.length) {
      const Embed = new MessageEmbed();

      if (results.length === 1 || results[0].score < searchThreshold) {
        const sc = results[0].item;
        const tier = sc.tier;
        const name = sc.name;
        const url = sc.url;
        const img = sc.img;
        const abilityMax = sc.ability.max;

        Embed.setTitle(name)
          .setURL(url)
          .setDescription(`**Tier** ${tier}`)
          .setImage(img)
          .addFields(
            {	name: "Max Ability", value: abilityMax, inline: true }
          )
          .setFooter('No additional info available');

        // If extra data available
        if (sc.extras) {
          const stars = sc.stars;
          const type = sc.type;
          const event = sc.event == 'true' ? '| **Event**' : '';
          const abilityMin = sc.ability.min;
          const stats = sc.extras;

          Embed.setDescription(
            `**Type** ${type} | **Tier** ${tier} | ${stars}`
          )
            .addFields(
              {	name: "Base Ability",	value: abilityMin,	inline: false }
            )
            .setFooter('Taken from GamePress | Click title to open link');

          stats.forEach((stat) => {
            Embed.addField(
              stat.name, `**Min** - ${stat.min}, **Max** - ${stat.max}`, true
            );
          });
        }
      } else {
        let description = `Looking for **${name}**\n\n` +
          'Closest story cards:';

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
