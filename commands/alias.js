const Fuse = require('fuse.js');
const fs = require('fs');

module.exports = {
  name: 'alias',
  description: 'Trigger an alias.',
  aliases: ['a'],
  execute(message, args) {
    const aliases = require('../data/aliases.json');
    const alias = args.join('');

    if (!Object.keys(aliases).length) {
      return message.channel.send('Aliases is empty');
    }

    const options = {
      keys: ["name"],
      includeScore: true,
      threshold: 0.2
    };
    const fuse = new Fuse(Object.values(aliases), options);
    const result = fuse.search(alias, { limit: 3 });

    if (result.length) {
      const commandArgs = result[0].item.command;
      const commandName = commandArgs.shift().toLowerCase();
      const command = message.client.commands.get(commandName)
        || message.client.commands.find(
          cmd => cmd.aliases && cmd.aliases.includes(commandName)
        );

      if (!command) return message.channel.send('Command not found');

      if (command.args && !commandArgs.length) {
        return message.channel.send('Command argument(s) missing');
      }

      if (command.owner && message.author.id !== owner) {
        return message.channel.send('Not enough permission');
      }

      try {
        command.execute(message, commandArgs);
      } catch (error) {
        console.error(error);
        message.reply('Error triggering alias');
      }
    } else {
      message.channel.send('Alias not found');
    }
  }
}
