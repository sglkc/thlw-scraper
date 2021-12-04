const Fuse = require('fuse.js');
const fs = require('fs');

module.exports = {
  name: 'alias',
  description: 'Trigger an alias.',
  aliases: ['a'],
  args: true,
  usage: '<alias>',
  execute(message, args) {
    const aliases = require('../data/aliases.json');
    const alias = args.join('').trim();

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
      const resultCommand = result[0].item.command;
      const commandName = resultCommand.match(/\w+/g)[0];
      const commandArgs = resultCommand.replace(commandName, '').split(' ');
      const command = message.client.commands.get(commandName)
        || message.client.commands.find(
          cmd => cmd.aliases && cmd.aliases.includes(commandName)
        );

      if (!command) {
        return message.channel.send(`Command \`${commandName}\` not found`);
      }

      if (command.args && !commandArgs.length) {
        return message.channel.send('Command argument(s) missing');
      }

      if (command.owner && message.author.id !== owner) {
        return message.channel.send('Not enough permission');
      }

      try {
        message.author = message.client.user;
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
