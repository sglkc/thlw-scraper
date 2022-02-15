const { MessageEmbed } = require('discord.js');
const tower = require('../data/tower.json');

module.exports = {
  name: 'searchtower',
  description: 'Search for scarlet devil tower data',
  aliases: ['tower', 'sdt'],
  args: true,
  usage: '<floor>',
  async execute(message, args) {
    const floor = args[0].match(/\d+/);

    if (!parseInt(floor)) return message.channel.send('Invalid floor provided!');

    // Check if data is empty
    if (!Object.keys(tower).length) {
      return message.channel.send('Tower floor list is empty, do scrape');
    }

    if (!(floor in tower)) return message.channel.send('Floor not found!');

    const Embed = new MessageEmbed()
      .setTitle(`Scarlet Devil Tower Floor ${floor}`)
      .setDescription(tower[floor].info)
      .setFooter('Taken from Gamepress');

    tower[floor].enemies.forEach((enemy, i) => {
      const name = enemy.name;
      const hp = enemy.hp;
      const weak = enemy.weak;
      const resist = enemy.resist;
      const barrier = enemy.barrier;
      const spell = enemy.spell;
      const skills = enemy.skills;
      Embed.addField(
        name,
        `**Health:** ${hp}\n` +
        `**Weakness:** ${weak}\n` +
        `**Resistance:** ${resist}\n` +
        `**Barriers:** ${barrier}\n` +
        `**Spell Gauge:** ${spell}\n` +
        `**Skill(s):** ${skills}`,
        false
      );
    });

    return message.channel.send({ embed: Embed });
  }
}
