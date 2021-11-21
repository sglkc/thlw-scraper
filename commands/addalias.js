const fs = require('fs');

module.exports = {
  name: 'addalias',
  description: 'Add an alias.',
  owner: true,
  args: true,
  usage: '<alias> <command>',
  execute(message, args) {
    const aliases = require('../data/aliases.json');
    const [alias, ...command] = args.join(' ').match(
      /\w+|«[^«]+»|“[^“]+”|"[^"]+"|'[^']+'/g
    );
    const sanitized = alias.replace(/[«»“”'"]+/g, '').trim();
    const shortened = sanitized.replace(/[^A-Z0-9]/gi, '').toLowerCase();

    if (!command.length) {
      return message.channel.send('No command specified');
    }

    aliases[shortened] = {
      'name': sanitized,
      'command': command
    }

    const json = JSON.stringify(aliases, null, 4);
    fs.writeFileSync('./data/aliases.json', json, 'utf8');
    message.channel.send(`Added alias \`${sanitized}\` for ${command.join(' ')}`);
    delete require.cache[require.resolve('../data/aliases.json')];
  }
}
