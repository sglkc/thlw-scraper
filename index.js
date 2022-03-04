const fs = require('fs');
const Discord = require('discord.js');
const { token, prefix, owner } = require('./config.json');
const client = new Discord.Client();
const commandFiles = fs.readdirSync('./commands').filter(
  file => file.endsWith('.js')
);
const dataFiles = [
  'aliases.json', 'characters.json', 'storycards.json', 'tower.json'
];

dataFiles.forEach((file) => {
  if (fs.readdirSync('./data').includes(file)) return;

  fs.writeFileSync('./data/' + file, '{}');
});

client.commands = new Discord.Collection();

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  if (owner === '') {
    console.error('Please set owner id in config.json!')
    return client.destroy();
  }

  console.log(`THLW Bot running`);
});

client.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName)
    || client.commands.find(
      cmd => cmd.aliases && cmd.aliases.includes(commandName)
    );

  // Fallback to searchall if no command found
  if (!command) {
    let args = message.content.slice(prefix.length).trim().split(/ +/);
    let command = client.commands.get('searchall');

    return command.execute(message, args);
  }

  if (command.args && !args.length) {
    return message.channel.send(
      `No arguments provided. Confused? \`${prefix}help ${commandName}\``
    );
  }

  if (command.owner && message.author.id !== owner) {
    return message.channel.send(
      `Not enough permission <:suswacko:856558674478104628>`
    );
  }

  try {
    console.log(`${message.author.tag}: ${commandName} ${args}`);
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('An error was found :(');
  }
});

client.login(token);
