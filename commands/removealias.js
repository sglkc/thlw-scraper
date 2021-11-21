const fs = require('fs');

module.exports = {
  name: 'removealias',
  description: 'Remove an alias.',
  aliases: ['rmalias', 'delalias'],
  owner: true,
  args: true,
  usage: '<alias>',
  execute(message, args) {
    const aliases = require('../data/aliases.json');
    const alias = args.join('');
    const shortened = alias.toLowerCase().replace(/ /g, '').trim();
    const aliasName = aliases[shortened].name;

    delete aliases[shortened];

    const json = JSON.stringify(aliases, null, 4);
    fs.writeFileSync('./data/aliases.json', json, 'utf8');
    message.channel.send(`Removed alias \`${aliasName}\``);
    delete require.cache[require.resolve('../data/aliases.json')];
  }
}
