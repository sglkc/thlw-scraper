const { MessageEmbed } = require('discord.js');
const Fuse = require('fuse.js');
const fs = require('fs');
const storycards = require('../data/storycards.json');

module.exports = {
  name: 'searchstorycard',
  description: 'Search for story card data',
  aliases: ['searchsc', 'story', 'sc'],
  args: true,
  usage: '<story card name>',
  execute(message, args) {

    // Check if data is empty
    if (!Object.keys(storycards).length) {
      return message.channel.send('Story card list is empty, do scrape');
    }

    const options = {
      keys: ["name"],
      includeScore: true,
      threshold: 0.2
    }

    const fuse = new Fuse(Object.values(storycards), options);
    const result = fuse.search(args.join(''));

    if (result.length) {
      const Embed = new MessageEmbed();
      const sc = result[0].item;
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
          .setFooter('Taken from GamePress');

        stats.forEach((stat) => {
          Embed.addField(
            stat.name, `**Min** - ${stat.min}, **Max** - ${stat.max}`, true
          );
        });
      }

      message.channel.send({ embed: Embed });
    } else {
      message.channel.send('no results');
    }
  }
}
