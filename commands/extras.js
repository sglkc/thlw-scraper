const { MessageEmbed } = require('discord.js');
const Fuse = require('fuse.js');
const characters = require('../data/characters.json');

module.exports = {
  name: 'extras',
  description: 'Search for extra character information.',
  aliases: ['x'],
  args: true,
  usage: '<character name>',
  execute(message, args) {
    const { searchThreshold } = require('../config.json');
    const name = args.join(' ');

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
        const title = ch.title;
        const role = ch.role;
        const tier = ch.tier;
        const url = ch.url;
        const img = ch.img;
        const type = ch.type == '' ? 'General' : ch.type;
        const resist = ch.resist.join(', ');
        const weak = ch.weak.join(', ');
        const spread = ch.extras.shots.spread;
        const focus = ch.extras.shots.focus;
        const sc = ch.extras.spellcards;
        const skills = ch.extras.skills;
        const passives = ch.extras.passives;
        const change = ch.extras.change;
        let skillsInfo = '';
        let passivesInfo = '';

        Embed.setTitle(name)
          .setURL(url)
          .setDescription(
            `***${title}***\n` +
            `**Tier:** ${tier.overall} | ` +
            `**Farm:** ${tier.farm} | ` +
            `**CQ:** ${tier.tower}\n` +
            `**Role:** ${role} | ` +
            `**Type:** ${type}\n` +
            `**Resistances:** ${resist}\n` +
            `**Weaknesses:** ${weak}`
          )
          .setThumbnail(img)

        // Check if element is single or not and join them
        const spreadElements = spread.elements.map(
          e => typeof(e) == 'string' ? e : e.join(', ')
        ).join(' | ');

        Embed.addField(
          'Spread Shot',
          `**${spreadElements}**\n${spread.info}`,
          true
        );

        const focusElements = focus.elements.map(
          e =>typeof(e) == 'string' ? e : e.join(', ')
        ).join(' | ');

        Embed.addField(
          'Focus Shot',
          `**${focusElements}**\n${focus.info}`,
          true
        );

        // Add every cards
        Object.keys(sc).forEach(key => {
          const card = sc[key];
          const elements = card.elements.map(
            e => typeof(e) == 'string' ? e : e.join(', ')
          ).join(' | ');

          Embed.addField(
            `${key === '3' ? 'ロストワード' : `Spellcard ${key}` }`,
            `**${elements}**\n${card.info}\n` +
            `**Effect(s):**\n${card.effects || 'None'}`
          );
        });

        skills.forEach((skill, i) => {
          skillsInfo = `${skillsInfo}**${i + 1}. ${skill.name}**:\n` +
            `${skill.desc}\n`;
        });

        passives.forEach((passive, i) => {
          passivesInfo = `${passivesInfo}**${i + 1}. ${passive.name}**:\n` +
            `${passive.desc}\n`;
        });

        Embed.addField('Skills', skillsInfo)
          .addField('Passives', passivesInfo)
          .addField(change.name, change.desc)
          .setFooter('Taken from Gamepress | Click title to open link');

      } else {
        let description = `Looking for **${name}**\n\n` +
          'Closest characters:';

        results.forEach((result, i) => {
          description = description + `\n${result.item.name}`;
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
