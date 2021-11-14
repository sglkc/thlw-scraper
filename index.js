const fs = require('fs');
const dotenv = require('dotenv').config();
const Discord = require('discord.js');
const { prefix, owner } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(
	file => file.endsWith('.js')
);

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

	if (!command) return;

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

client.login(process.env.TOKEN);
