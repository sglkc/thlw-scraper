const fs = require('fs');
const rp = require('request-promise');
const cheerio = require('cheerio');

module.exports = {
  name: 'scrapetower',
  description: 'Scrapes tower floors from GamePress wiki.',
  aliases: ['scrapesdt'],
  args: true,
  owner: true,
  usage: '<max>',
  async execute(message, args) {
    if (!args.length) return message.channel.send('Provide floor!');

    const count = parseInt(args[0]);

    if (!count) return message.channel.send('Invalid floors!');

    const status = await message.channel.send(`Scraping ${count} floors...`);
    var max = count;
    var p = [];
    var floors = {};

    while (max - 9 > 0) {
      const j = max - 9;
      const url = `https://gamepress.gg/lostword/guide/scarlet-devil-tower-floor-guide-${j}-${max}f`;

      status.edit(`Scraping floor ${j} to ${max}...`);

      await rp(url)
        .then((html) => {
          const $ = cheerio.load(html);

          $('.field--name-field-page-content > .field__item').each((e, field) => {
            const title = $('.main-title', field).text().trim();
            if (title == 'Introduction') return;

            const info = $('p', field).text().trim();
            const floor = {
              'enemies': [],
              'info': info
            }

            $('tr', field).each((f, row) => {
              var info = [];

              $('td', row).each((g, content) => {
                info[g] = $(content).text().trim();
              });

              const enemy = {
                'name': info[0],
                'hp': info[1],
                'weak': info[2],
                'resist': info[3],
                'barrier': info[4],
                'spell': info[5],
                'skills': info[6]
              }

              if (info[0]) floor.enemies.push(enemy);
            });

            let flo = parseInt(title);
            floors[flo] = floor;

          });

        })
        .catch((err) => {
          console.error(err)
        });

      max = max - 10;
    }

    status.edit(`Success scraping ${count} floors`);

    const json = JSON.stringify(floors, null, 4);
    fs.writeFileSync('./data/tower.json', json, 'utf8');
  }
}
