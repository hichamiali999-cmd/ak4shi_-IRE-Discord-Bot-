import { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const PREFIX = process.env.PREFIX || '!';

const userXP = new Map();
const userBalance = new Map();

client.once('ready', () => {
  console.log(`👑 Koya Bot is Online! Logged in as ${client.user.tag}`);
  client.user.setActivity(`${PREFIX}help | Koya Style Bot`, { type: 0 });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const userId = message.author.id;
  const currentXP = userXP.get(userId) || 0;
  userXP.set(userId, currentXP + Math.floor(Math.random() * 10) + 5);

  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'help') {
    const embed = new EmbedBuilder()
      .setTitle('✨ Koya-Style Bot Commands')
      .setColor('#FF69B4')
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: '🛡️ Moderation', value: '`!ban`, `!kick`, `!clear`' },
        { name: '💰 Economy', value: '`!daily`, `!balance`, `!rank`, `!avatar`' },
        { name: 'ℹ️ Info', value: '`!ping`' }
      )
      .setFooter({ text: `Requested by ${message.author.username}` })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  }

  if (command === 'ping') {
    return message.reply(`🏓 Pong! Latency: \`${client.ws.ping}ms\``);
  }

  if (command === 'avatar') {
    const target = message.mentions.users.first() || message.author;
    const embed = new EmbedBuilder()
      .setTitle(`🖼️ Avatar of ${target.username}`)
      .setImage(target.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setColor('#FF69B4');

    return message.channel.send({ embeds: [embed] });
  }

  if (command === 'daily') {
    const currentCoins = userBalance.get(userId) || 0;
    userBalance.set(userId, currentCoins + 500);
    return message.reply('🎁 You collected your daily reward of **500 coins**!');
  }

  if (command === 'balance' || command === 'bal') {
    const coins = userBalance.get(userId) || 0;
    return message.reply(`💰 Your balance: **${coins} coins**.`);
  }

  if (command === 'clear') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply("❌ Permission denied.");
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 99) return message.reply('Specify a number between 1 and 99.');
    await message.channel.bulkDelete(amount + 1, true);
    const msg = await message.channel.send(`🧹 Deleted **${amount}** messages.`);
    setTimeout(() => msg.delete(), 3000);
  }
});

client.login(process.env.DISCORD_TOKEN);
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!serverinfo') {
        const guild = message.guild;
        const embed = {
            color: 0x0099ff,
            title: `📊 Server Info: ${guild.name}`,
            fields: [
                { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
                { name: '📅 Created At', value: `${guild.createdAt.toDateString()}`, inline: false }
            ],
            thumbnail: {
                url: guild.iconURL() ? guild.iconURL() : null,
            },
        };
        message.channel.send({ embeds: [embed] });
    }
});
