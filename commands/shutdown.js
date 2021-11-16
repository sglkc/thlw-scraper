module.exports = {
  name: 'shutdown',
  description: 'Shutdown bot',
  owner: true,
  execute(message, args) {
    message.channel.send('Shutting down...').then(() => {
      process.exit();
    });
  }
}
