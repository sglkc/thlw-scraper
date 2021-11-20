const { MessageEmbed } = require('discord.js');
const Fuse = require('fuse.js');
const fs = require('fs');
/*
const characters = require('../data/characters.json');
const storycards = require('../data/storycards.json');
const aliases = require('../data/aliases.json');
*/

module.exports = {
  name: 'searchall',
  description: 'Search every available data.',
  aliases: ['all'],
  args: true,
  usage: '<query>',
  execute(message, args) {
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
        results[result[0].score].command = data.commands[i];
      } else {
        results[10] = false;
      }
    });

    // Look for closest match by comparing keys
    const resultsKey = Object.keys(results);
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
          .setDescription(`Looking for **${search}**`);

        resultsKey.forEach((key, i) => {

          if (key === '10') return;
          let content = '';

          // Concatenate matches name
          results[key].forEach((match) => {
            content = content + `${match.item.name}\n`;
          });

          Embed.addField(data.names[i], content, true);
        });

        message.channel.send({ embed: Embed });
      }
    } else {
      message.channel.send('No matches found');
    }
  }
}
