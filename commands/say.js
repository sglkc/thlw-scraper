module.exports = {
  name: 'say',
  description: 'Sends the same message to current or specified channel',
  args: true,
  usage: '[channel] <message>',
  execute(message, args) {
    if (message.mentions.channels.first()) {
      const chid = message.mentions.channels.first().id;
      const msg = args.slice(1).join(' ');

      message.client.channels.fetch(chid)
        .then((channel) => {
          channel.send(msg);
        })
        .catch(console.error);
    } else {
      message.channel.send(args.join(' '));
    }
    message.delete();
  },
};
