module.exports = {
  name: 'say',
  description: 'Sends the same message to current or specified channel',
  args: true,
  usage: '[channel] <message>',
  async execute(message, args) {
    if (message.mentions.channels.first()) {
      const chid = message.mentions.channels.first().id;
      const msg = args.slice(1).join(' ');

      await message.client.channels.fetch(chid)
        .then((channel) => {
          channel.send(msg);
        })
        .catch(console.error);

      message.delete();
    } else {
      if (message.author.id === message.client.user.id) {
        message.channel.send(args.join(' '));
      }
    }
  },
};
