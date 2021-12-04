const fs = require('fs');
const rp = require('request-promise');
const cheerio = require('cheerio');

module.exports = {
  name: 'scrapestorycard',
  description: 'Scrapes story cards from GamePress tier list & sc list.\n' +
  'Scraping defaults to story cards without additional info\n' +
  'Use `detailed` to scrape detailed story card data\n' +
  'Use `force` to force update every story cards\n' +
  'Insert character name for a specific character',
  aliases: ['scrapecard', 'scrapesc'],
  owner: true,
  usage: '[detailed] [force]',
  async execute(message, args) {
    const storycards = require('../data/storycards.json');
    const urlTier = 'https://gamepress.gg/lostword/list/story-card-tier-list';
    const urlList = 'https://gamepress.gg/lostword/list/story-cards-list';
    const status = await message.channel.send('Scraping story cards...');

    // Getting from tierlist
    await rp(urlTier)
      .then((html) => {
        const $ = cheerio.load(html);

        $('.touhou-tier-table').each((i, tierTable) => {
          const tier = $('.tier-label', tierTable).text();

          $('.touhou-tier-list-row', tierTable).each((j, card) => {
            const url = $('a', card).attr('href');
            const name = $('.title-span', card).text();
            const short = name.toLowerCase().replace(/[\"\'\(\)\!\- ]/g, '');
            const img = $('.char-icon img', card).attr('data-cfsrc');

            $('.tier-expl-container', card).find('br').replaceWith('\n');
            const abilityMax = $('.tier-expl-container', card).text().trim();

            if (!(short in storycards)) {
              storycards[short] = {};
            }

            storycards[short]['tier'] = tier;
            storycards[short]['name'] = name;
            storycards[short]['url'] = 'https://gamepress.gg' + url;
            storycards[short]['img'] = 'https://gamepress.gg' + img;
            storycards[short]['extras'] = storycards[short]['extras'] || false;
            storycards[short]['ability'] = { 'max': abilityMax };
          });
        });

        status.edit('Success scraping characters from tier list');
      })
      .catch((err) => {
        status.edit('Failed scraping story cards from tier list');
        console.error(err);
      });

    // Scrape remaining cards from storycard list
    // Event cards are here
    await rp(urlList)
      .then((html) => {
        const $ = cheerio.load(html);

        $('.story-cards-row').each((i, card) => {
          const name = $('.story-card-icon div div', card).first().text();
          const img = $('.story-card-icon img', card).attr('data-cfsrc');
          const url = $('.skill-icon-title a', card).attr('href');
          const short = name.toLowerCase().replace(/[\"\'\(\)\!\- ]/g, '');

          // Skip already available story card
          if (short in storycards) return;

          $('.story-card-title', card).find('br').replaceWith('\n');
          const abilityMax = $('.story-card-title', card).text().trim();

          if (!(short in storycards)) {
            storycards[short] = {};
          }

          storycards[short]['tier'] = 'Event';
          storycards[short]['name'] = name;
          storycards[short]['url'] = 'https://gamepress.gg' + url;
          storycards[short]['img'] = 'https://gamepress.gg' + img;
          storycards[short]['extras'] = storycards[short]['extras'] || false;
          storycards[short]['ability'] = { 'max': abilityMax };
        });
      })
      .catch((err) => {
        message.channel.send('Failed scraping story cards from list');
        console.error(err);
      });

    const json = JSON.stringify(storycards, null, 4);
    fs.writeFileSync('./data/storycards.json', json, 'utf8');
    status.edit('Completed scraping story cards');

    // Get every details of story cards
    if (args[0] === 'detailed') {
      const keys = Object.keys(storycards);
      const length = keys.length;

      for (let [i, storycard] of keys.entries()) {
        const name = storycards[storycard].name;
        const url = storycards[storycard].url;

        // Skip story cards with extra data if force isn't specified
        if (!!storycards[storycard].extras && !(args[1] === 'force')) {
          console.log(`Skipping ${name} because 'force' isn't specified`);
          continue;
        }

        status.edit(`Scraping ${name}... (${i + 1}/${length})`);

        await rp(url)
          .then((html) => {
            const $ = cheerio.load(html);

            const img = $('.story-card-image > img').attr('data-cfsrc');
            const starCount = parseInt($('.bottom-right a').text());
            const stars = '★'.repeat(starCount);

            // Story card type
            const types = ['Bamboo', 'Chrysanthemum', 'Prunus', 'Orchid'];
            let type = $('.story-card-type img').attr('data-cfsrc');

            types.forEach((e) => {
              if (type.indexOf(e.toLowerCase()) !== -1) {
                // Rename Prunus to Plum
                type = e === 'Prunus' ? 'Plum' : e;
              }
            });

            storycards[storycard].type = type;

            // Look for stats name
            const extras = [];

            $('.views-table').each((i, statTable) => {
              $('.views-field-field-story-card-stat', statTable).each(
                (index, stat) => {
                  const name = $(stat).text().trim();

                  extras.push({ 'name': name });
                }
              );
            });

            // Looking for stat values
            $('.stat-slider-diff').each((index, valueTable) => {
              const diff = $(valueTable).attr('data-diff');
              const max = $(valueTable).attr('data-max');
              const min = parseInt(max) - parseInt(diff) * 10;

              extras[index] = {
                'name': extras[index].name,
                'min': `${min}`,
                'max': max,
                'diff': diff
              };
            });

            // Looking for min ability
            $('.ability-text').find('br').replaceWith('\n');

            const abilityMin = $('.ability-text').first().text()
              .replace('Base Ability', '').trim();

            // Store data
            storycards[storycard].img = 'https://gamepress.gg' + img;
            storycards[storycard].stars = stars;
            storycards[storycard].extras = extras;
            storycards[storycard].ability.min = abilityMin;

            // Store for every successful scrape, there will be a lot of data
            const json = JSON.stringify(storycards, null, 4);
            fs.writeFileSync('./data/storycards.json', json, 'utf8');
          })
          .catch((err) => {
            message.channel.send(
              `Failed scraping ${storycards[storycard].name}`
            );
            console.error(err);
          });
      }

      status.edit(`Success scraping ${length} story cards`);
    }
  }
}
