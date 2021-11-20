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

    // Prioritize first element to search
    // Command must not be an alias
    const data = {
      files: ['aliases', 'characters', 'storycards'],
      commands: ['alias', 'searchchar', 'searchstorycard']
    };
    const results = {};
    const options = {
      keys: ["name"],
      includeScore: true,
      threshold: 0.4
    };

    // Fuzzy search for matches
    data.files.forEach((file, i) => {
      const json = require(`../data/${file}.json`);
      const fuse = new Fuse(Object.keys(json), options);
      const result = fuse.search(args.join(''), { limit: 5 });

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
      const commandName = results[closest].command;
      const arg = results[closest][0].item;
      const command = message.client.commands.get(commandName);

      try {
        command.execute(message, [ arg ]);
      } catch (error) {
        console.error(error);
        message.reply('An error has occured');
      }
    } else {
      message.channel.send('No matches found');
    }
  }
}
