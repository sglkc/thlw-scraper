const fs = require('fs');
const rp = require('request-promise');
const cheerio = require('cheerio');

module.exports = {
  name: 'scrapecharacter',
  description: 'Scrapes character(s) from GamePress wiki.\n' +
  'Scraping defaults to characters who doesn\'t have extras\n' +
  'Use `force` to force update every characters\n' +
  'Insert character name for a specific character',
  aliases: ['scrapechar'],
  owner: true,
  usage: '[force] [character name]',
  async execute(message, args) {
    const characters = require('../data/characters.json');
    const charName = args.slice(1).join('').toLowerCase();
    const specificChar = args.length > 1 ? [ charName ] : false;
    const keys = specificChar || Object.keys(characters);
    const length = keys.length;

    if (!length) {
      return message.channel.send('Characters data empty, try to scrape?');
    }

    if (specificChar && !(specificChar[0] in characters)) {
      return message.channel.send(
        `Can't find ${args.join(' ')} in characters data`
      );
    }

    const status = await message.channel.send(
      `Scraping ${args.join(' ') || 'every characters'} from character page...`
    );

    for (let [i, character] of keys.entries()) {
      const name = characters[character].name;
      const url = characters[character].url;

      // Skip if character has extra data and first argument isnt force
      if (characters[character].extras && !(args[0] === 'force')) {
        console.log(`Skipped ${name} because 'force' isn't specified`);
        continue;
      }

      status.edit(`Scraping ${name}... (${i + 1}/${length})`);

      await rp(url)
        .then((html) => {
          const $ = cheerio.load(html);

          // Big image
          const bigimg = $('.costume0 > img').attr('data-cfsrc');
          const title = $('.costume-title').first().text();

          // Find character role
          const roles = [
            'Defense', 'Support', 'Heal', 'Debuff',
            'Attack', 'Technical', 'Speed', 'Destroy'
          ];
          let role = $('.char-role img').attr('data-cfsrc');

          // Check each element in array for matching role
          roles.forEach((decided, i) => {
            i = i + 1;
            if (role.indexOf(`type_${i}`) !== -1) {
              role = decided;
            }
          });

          // Find weaknesses and resistances
          // Elements array can be reused
          const elements = [
            'Sun', 'Moon', 'Fire', 'Water', 'Wood', 'Metal', 'Earth', 'Star'
          ];
          let resist = [];
          let weak = [];

          // Check each array element for matching element
          elements.forEach((elm) => {
            let e = elm.toLowerCase();

            if ($(`img[alt='${e}_neutral']`).length) return;
            if ($(`img[alt='${e}_weak']`).length) {
              resist.push(elm);
            } else {
              weak.push(elm);
            }
          });

          // Declare spellcard object
          let shots = {
            'spread': {},
            'focus': {}
          };
          let spellcards = {
            1: {},
            2: {},
            3: {}
          };

          // Find character bullet elements
          $('.shot-main-table').each((i, shot) => {
            let desc = {
              'elements': [ '', [], [], [] ],
              'info': ''
            };
            let elms = [];

            // Shots and spellcards have different HTML structure
            const divNum = i < 2 ? 2 : 1;
            const div = $(shot).siblings().eq(divNum);

            $(div).find('br').replaceWith('\n');
            const infos = $(div).text().trim().replace('\n\n', '\n');

            // Individual bullet shot element
            $('.shot-effect-cell', shot).each((j, bullet) => {

              const imgsrc = $('img', bullet).attr('data-cfsrc');
              let power = $('.power-req-cell', shot).eq(j).text().trim();
              let element = 'None';

              // Check if bullet has element
              elements.forEach((elm, index) => {
                if (imgsrc.indexOf(`${elm}.png`) !== -1) {
                  element = elm;
                }
              });

              // Push elements based on power
              if (parseInt(power)) desc.elements[power].push(element);
              else desc.elements[0] = element;
              desc.info = infos;
            });

            // This part determines where element data belongs
            switch (i) {
              case 0: shots.spread = desc; break;
              case 1: shots.focus = desc; break;
              case 2: spellcards[1] = desc; break;
              case 3: spellcards[2] = desc; break;
              case 4: spellcards[3] = desc; break;
            }
          });

          // Get spellcards effects
          $('.spell-container').each((i, sc) => {
            let effect = $('.spell-effects-description', sc).text().trim();
            effect = effect.replace('\n\n', '\n');
            spellcards[i + 1].effects = effect;
          });

          // Get skills
          let skills = [];
          $('.skill-container').each((i, skill) => {
            let name = $('.skill-title-value a', skill).text().trim();
            let desc = $('.skill-description', skill).text().trim();
            skills[i] = {
              'name': name,
              'desc': desc
            };
          });

          // Get characteristics aka passives
          let passives = [];
          $('.characteristics-container').each((i, char) => {
            let name = $('.characteristics-title', char).text();
            let desc = $('.characteristics-description', char).text();
            passives[i] = {
              'name': name,
              'desc': desc
            };
          });

          // Get change effect aka switch link
          $('.change-effect-description').find('br').replaceWith('\n');
          let change = {
            'name': $('.change-effect-title').text(),
            'desc': $('.change-effect-description').text()
          }

          // Save object
          characters[character].bigimg = 'https://gamepress.gg' + bigimg;
          characters[character].title = title;
          characters[character].role = role;
          characters[character].resist = resist;
          characters[character].weak = weak;

          // Insert additional data in extras
          characters[character].extras = {};
          characters[character].extras.skills = skills;
          characters[character].extras.shots = shots;
          characters[character].extras.spellcards = spellcards;
          characters[character].extras.passives = passives;
          characters[character].extras.change = change;
        })
        .catch((err) => {
          message.channel.send(
            `Failed scraping ${name}`
          );
          console.error(err);
        });
    }

    status.edit(
      `Success scraping ${args.slice(1).join(' ') || `${length} characters`}`
    );

    const json = JSON.stringify(characters, null, 4);
    fs.writeFileSync('./data/characters.json', json, 'utf8');
  }
}
