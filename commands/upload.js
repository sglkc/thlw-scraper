const fs = require('fs');
const request = require('request');

module.exports = {
  name: 'upload',
  description: 'Upload files to store in data folder.',
  owner: true,
  execute(message, args) {
    if (!message.attachments.first()) {
      return message.channel.send('Please attach file(s)');
    }

    message.attachments.each((attachment) => {
      const name = attachment.name;
      const url = attachment.url;

      request.get(url)
        .on('error', (error) => {
          message.channel.send(`Failed downloading ${name}`);
          console.error(error);
        })
        .pipe(fs.createWriteStream(`./data/${name}`));
    });

    message.channel.send('Upload process finished');
  }
}
