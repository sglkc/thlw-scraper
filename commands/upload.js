const fs = require('fs');
const rp = require('request-promise');

module.exports = {
  name: 'upload',
  description: 'Upload files to store in data folder.',
  owner: true,
  async execute(message, args) {
    if (!message.attachments.first()) {
      return message.channel.send('Please attach file(s)');
    }

    message.attachments.each(async (attachment) => {
      const name = attachment.name;
      const url = attachment.url;

      await rp(url)
        .then((file) => {
          fs.writeFileSync(`./data/${name}`, file, 'utf8');
          message.channel.send(`Downloaded file ${name}`);
        })
        .catch((err) => {
          message.channel.send(`Failed downloading file ${name}`);
          console.error(err);
        });
    });
  }
}
