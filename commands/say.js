module.exports = {
	name: 'say',
	description: 'Sends the same message',
	execute(message, args) {
		if (!args) {
			return;
		}

		if (message.mentions.channels.first()) {
			const chid = message.mentions.channels.first().id;
			const msg = args.slice(1).join(' ');

			message.client.channels.fetch(chid)
				.then((channel) => {
					channel.send(msg);
					message.delete();
				})
				.catch(console.error);
		} else {
			message.channel.send(args.join(' '));
		}
	},
};
