const fs = require('fs');
const dotenv = require('dotenv').config();
const Discord = require('discord.js');
const { prefix } = require('./config.json');

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
	client.user.setPresence({status: 'invisible'});
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

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('An error was found :(');
	}
});

client.login(process.env.TOKEN);
