const fs = require('fs');
const rp = require('request-promise');
const cheerio = require('cheerio');

module.exports = {
	name: 'scrapechar',
	description: 'Scrapes character tier list from GamePress.\n' +
	'No arguments to continue last scraping in case of errors\n' +
	'Insert character name after for a specific character',
	usage: '[character name]',
	async execute(message, args) {
		const characters = require('../data/characters.json');
		const url = "https://gamepress.gg/lostword/list/touhou-lostword-tier-list";
		const specificChar = args.length ? args.join('').toLowerCase() : false;
		const status = await message.channel.send(
			`Scraping ${args.join(' ') || 'every characters'} from tier list...`
		);

		await rp(url)
			.then((html) => {
				const $ = cheerio.load(html);

				$('.touhou-tier-table').each((i, tierTable) => {
					let tier = $('.tier-label', tierTable).text();

					$('.touhou-tier-list-row', tierTable).each((j, char) => {
						const name = $('.title-span', char).text();

						// Continue to specific character
						if (
							specificChar &&
							name.replace(/[ \(\)]/g, '').toLowerCase() !== specificChar
						) {
							return;
						}

						const farm = $('.farm-tier-value', char).text();
						const tower = $('.tower-tier-value', char).text();
						const url = $('a', char).attr('href');
						const img = $('.char-icon img', char).attr('data-cfsrc');
						const short = name.toLowerCase().replace(/[\"\'\(\)\!\- ]/g, "");
						const type = short in characters ? characters[short].type : '';

						$('.tier-expl-container', char).find('br').replaceWith('\n');
						const info = $('.tier-expl-container', char).text().trim();

						// Store and arrange some properties
						characters[short] = {
							'name': name,
							'tier': {
								'overall': tier,
								'farm': farm,
								'tower': tower
							},
							'type': type,
							'url': 'https://gamepress.gg' + url,
							'img': 'https://gamepress.gg' + img,
							'bigimg': '',
							'info': info,
							'extras': false
						}
					});
				});

				const indexes = JSON.stringify(characters, null, 4);
				fs.writeFileSync('./data/characters.json', indexes, 'utf8');
				status.edit('Success scraping character(s)');
			})
			.catch((err) => {
				status.edit('Failed scraping character(s)');
				console.error(err);
			});
	}
}
