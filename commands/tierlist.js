const { MessageEmbed } = require('discord.js');
const Fuse = require('fuse.js');
const fs = require('fs');
const characters = require('../data/characters.json');

module.exports = {
  name: 'tierlist',
  description: 'Tier list for data available.\n' +
  'Categories: `characters`, `storycards`',
  aliases: ['tl'],
  args: true,
  usage: '<category>',
  execute(message, args) {
    const category = args[0].toLowerCase();
    const tierlist = {};
    var title, url;

    switch(category) {
      case 'characters':
        {
          const characters = require('../data/characters.json');
          const values = Object.values(characters);

          title = 'Characters';
          url = 'https://gamepress.gg/lostword/list/touhou-lostword-tier-list';

          values.forEach((ch) => {
            const name = ch.name;
            const tier = ch.tier.overall;

            if (tierlist[tier]) {
              tierlist[tier].push(`\`${name}\``);
            } else {
              tierlist[tier] = [ `\`${name}\`` ];
            }
          });
        }
        break;
      case 'storycards':
        {
          const storycards = require('../data/storycards.json');
          const values = Object.values(storycards);

          title = 'Story Cards';
          url = 'https://gamepress.gg/lostword/list/story-card-tier-list';

          values.forEach((sc) => {
            const name = sc.name;
            const tier = sc.tier;

            if (tierlist[tier]) {
              tierlist[tier].push(`\`${name}\``);
            } else {
              tierlist[tier] = [`\`${name}\``  ];
            }
          });
        }
        break;
      default:
        return message.channel.send(
          'Not a valid category!\n' +
          'Categories: `characters`, `storycards`'
        );
        break;
    }

    const tierKeys = Object.keys(tierlist);
    const Embed = new MessageEmbed()
      .setTitle(`${title} Tier List`)
      .setURL(url);
      .setFooter('Taken from GamePress | Click title to open link');

    tierKeys.forEach((tier) => {
      let content = tierlist[tier].join(' | ');

      Embed.addField(tier, content, false);
    });

    message.channel.send({ embed: Embed });
  }
}
