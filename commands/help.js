const { MessageEmbed } = require('discord.js');
const { prefix, owner } = require('../config.json');

module.exports = {
  name: 'help',
  description: 'List every commands possible',
  usage: '[page number/command name]',
  async execute(message, args) {
    const { commands } = message.client;

    if (!args.length || parseInt(args[0])) {
      const ownerUser = message.client.users.cache.get(owner);
      const everyone = [];
      const ownerOnly = [];

      commands.map((command) => {
        if (command.owner) {
          ownerOnly.push([ command.name, command.description ]);
        } else {
          everyone.push([ command.name, command.description ]);
        }
      });

      // Declare embeds for pagination
      const embed = [];

      embed[0] = new MessageEmbed()
        .setTitle('Commands')
        .setDescription(
          `Bot owner: ${ownerUser.tag}\nCurrent prefix: ${prefix}`
        );

      everyone.forEach((command) => {
        embed[0].addField(command[0], command[1], true);
      });

      embed[1] = new MessageEmbed()
        .setTitle('Bot Owner Commands')
        .setDescription(
          `Bot owner: ${ownerUser.tag}\nCurrent prefix: ${prefix}`
        );

      ownerOnly.forEach((command) => {
        embed[1].addField(command[0], command[1], false);
      });

      // Declare pages
      let page = parseInt(args[0]) - 1 || 0;
      const pages = [embed[0], embed[1]];

      if (page < 0 || page > pages.length) {
        return message.channel.send('Page specified doesn\'t exist');
      }

      const current = await message.channel.send(
        pages[page].setFooter(`Page ${page + 1}/${pages.length}`)
      );

      // Reactions controller
      const emojis = ['⏪', '⏩'];

      for (const emoji of emojis) await current.react(emoji);

      const reactions = current.createReactionCollector(
        (reaction, user) => emojis.includes(reaction.emoji.name),
        { time: 30000 }
      );

      reactions.on('collect', (reaction) => {
        reaction.users.remove(message.author);
        switch (reaction.emoji.name) {
          case emojis[0]:
            page = page > 0 ? --page : pages.length - 1;
            break;
          case emojis[1]:
            page = page + 1 < pages.length ? ++page : 0;
            break;
          default:
            break;
        }

        current.edit(
          pages[page].setFooter(`Page ${page + 1}/${pages.length}`)
        );
      });

      reactions.on('end', () => {
        if (!current.deleted) {
          current.reactions.removeAll();
        }
      });
    } else {
      const name = args[0];
      const command = commands.get(name)
        || commands.find(c => c.aliases && c.aliases.includes(name));

      const description = command.owner
        ? command.description + '\n(Bot Owner only)'
        : command.description;

      const aliases = command.aliases ? command.aliases.join(', ') : 'None';
      const usage = command.usage
        ? `${prefix}${command.name} ${command.usage}`
        : `${prefix}${command.name}`;

      const embed = new MessageEmbed()
        .setTitle(`${args} command`)
        .addFields(
          { name: 'Description', value: description, inline: false},
          { name: 'Aliases', value: aliases, inline: false},
          { name: 'Usage', value: usage, inline: false}
        );

      message.channel.send({ embed: embed});
    }
  }
}
