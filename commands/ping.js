module.exports = {
  name: 'ping',
  description: "Check BOT's connection",
  execute(message, args) {
    let latency = Date.now() - message.createdTimestamp;
    let ws = Math.round(message.client.ws.ping);
    message.channel.send(`Ping: ${latency}ms\nWebSocket: ${ws}ms`);
  },
};
