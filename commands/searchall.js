const { MessageEmbed } = require('discord.js');
const Fuse = require('fuse.js');
const fs = require('fs');

module.exports = {
  name: 'searchall',
  description: 'Search every available data.',
  aliases: ['all'],
  args: true,
  usage: '<query>',
  async execute(message, args) {
    const { searchThreshold } = require('../config.json');
    const search = args.join(' ');

    // Prioritize first element to search
    // Command must not be an alias
    const data = {
      names: ['Aliases', 'Characters', 'Story Cards'],
      commands: ['alias', 'searchchar', 'searchstorycard']
    };
    const results = {};
    const options = {
      keys: ["name"],
      includeScore: true,
      threshold: 0.4
    };

    // Fuzzy search for matches
    data.names.forEach((name, i) => {
      const file = name.toLowerCase().replace(/ /g, '');
      const json = require(`../data/${file}.json`);
      const fuse = new Fuse(Object.values(json), options);
      const result = fuse.search(search, { limit: 5 });

      // Store results with lowest score as key to compare later
      // Also command to trigger
      if (result.length) {
        results[result[0].score] = result;
        results[result[0].score].name = data.names[i];
        results[result[0].score].command = data.commands[i];
      } else {
        results[10] = false;
      }
    });

    // Look for closest match by comparing keys and omit empty results
    const resultsKey = Object.keys(results).filter(key => key !== '10');
    const closest = Math.min(...resultsKey);

    if (results[closest]) {
      if (closest < searchThreshold) {
        const commandName = results[closest].command;
        const arg = results[closest][0].item.name;
        const command = message.client.commands.get(commandName);

        try {
          command.execute(message, [ arg ]);
        } catch (error) {
          console.error(error);
          message.reply('An error has occured');
        }
      } else {
        const Embed = new MessageEmbed()
          .setTitle('Not found!')
          .setDescription(`Looking for **${search}**`)
          .setFooter('Use reactions to get first the result of each group');

        resultsKey.forEach((key) => {
          let content;

          // Concatenate matches name
          results[key].forEach((match, i) => {
            if (i === 0) {
              content = `**${match.item.name}**\n`;
            } else {
              content = content + `${match.item.name}\n`;
            }
          });

          Embed.addField(results[key].name, content, true);
        });

        const sentEmbed = await message.channel.send({ embed: Embed });

        // Reactions for instant result
        const emojis = ['1️⃣', '2️⃣', '3️⃣'];

        // Update
        emojis.length = resultsKey.filter(key => key !== 10).length;

        for (const emoji of emojis) await sentEmbed.react(emoji);

        const reactions = sentEmbed.createReactionCollector(
          (reaction, user) => emojis.includes(reaction.emoji.name),
          { time: 15000 }
        );

        reactions.on('collect', (reaction) => {
          sentEmbed.reactions.removeAll();

          const index = emojis.indexOf(reaction.emoji.name);
          const commandName = results[resultsKey[index]].command;
          const arg = results[resultsKey[index]][0].item.name;
          const command = message.client.commands.get(commandName);

          try {
            command.execute(message, [ arg ]);
            sentEmbed.delete();
          } catch (error) {
            console.error(error);
            message.reply('An error has occured');
          }
        });

        reactions.on('end', () => {
          if (!sentEmbed.deleted) {
            sentEmbed.reactions.removeAll();
          }
        });
      }
    }
  }
}
