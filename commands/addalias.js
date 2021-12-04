const fs = require('fs');

module.exports = {
  name: 'addalias',
  description: 'Add an alias.',
  aliases: ['editalias'],
  owner: true,
  args: true,
  usage: '<alias> <command>',
  execute(message, args) {
    args = args.join(' ');
    const aliases = require('../data/aliases.json');
    const alias = args.match(/\w+|«[^«]+»|“[^“]+”|"[^"]+"|'[^']+'/g)[0];
    const command = args.replace(alias, '').trim();
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
    message.channel.send(
      `Added alias \`${sanitized}\` for ${command.slice(0, 50)}...`
    );
    delete require.cache[require.resolve('../data/aliases.json')];
  }
}
