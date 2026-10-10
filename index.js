import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import session from 'express-session';
import axios from 'axios';
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ID = '1556457565620019250';
const CLIENT_SECRET = '8jDo-TzEpcli99Q61RYmeLgzMNFeIMCE';
const REDIRECT_URI = 'https://ak4shi-ire-discord-bot-production.up.railway.app/auth/discord/callback';

app.use(session({
    secret: 'ak4shi_super_secret_999',
    resave: false,
    saveUninitialized: false
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// تشغيل البوت
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}! 🔥`);
});

// أمر !ping و !serverinfo اللي صاوبنا من قبل
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!ping') {
        const latency = Date.now() - message.createdTimestamp;
        message.reply(`🏓 Pong! Latency: ${latency}ms`);
    }

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

// --- صفحة الويب (Dashboard) ---

app.get('/', (req, res) => {
    res.send(`
        <html dir="rtl">
            <head><title>AK4SHI BOT - Dashboard</title></head>
            <body style="background: #0d1117; color: #fff; font-family: Arial; text-align: center; padding-top: 80px;">
                <h1>مرحباً بك في لوحة تحكم AK4SHI FIRE 🔥</h1>
                <p>تحكم في السيرفر وإعدادات البوت بكل سهولة</p><br>
                <a href="/login" style="background: #5865F2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">تسجيل الدخول عبر Discord</a>
            </body>
        </html>
    `);
});

app.get('/login', (req, res) => {
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`);
});

app.get('/auth/discord/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.redirect('/');

    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token } = tokenResponse.data;
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { authorization: `Bearer ${access_token}` }
        });

        req.session.user = userResponse.data;
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    
    res.send(`
        <html dir="rtl">
            <head><title>Dashboard - AK4SHI</title></head>
            <body style="background: #0d1117; color: #fff; font-family: Arial; padding: 40px;">
                <h1>مرحباً، ${req.session.user.username} 👋</h1>
                <p>هنا يمكنك التحكم في إعدادات البوت الخاصة بك.</p>
                <hr style="border-color: #30363d; margin: 20px 0;">
                <h3>إعدادات رسالة الترحيب:</h3>
                <form action="/save-settings" method="POST">
                    <textarea name="welcomeMsg" rows="4" cols="50" placeholder="اكتب رسالة الترحيب للأعضاء الجدد هنا..." style="background: #161b22; color: #fff; padding: 10px; border-radius: 5px; border: 1px solid #30363d; width: 300px;"></textarea><br><br>
                    <button type="submit" style="background: #238636; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">حفظ الإعدادات</button>
                </form>
            </body>
        </html>
    `);
});

app.post('/save-settings', (req, res) => {
    res.send(`<html dir="rtl"><body style="background: #0d1117; color: #fff; text-align: center; padding-top: 80px;"><h2>تم حفظ الإعدادات بنجاح! ✅</h2><br><a href="/dashboard" style="color: #5865F2; text-decoration: none;">الرجوع للوحة التحكم</a></body></html>`);
});

// تشغيل السيرفر والبوت معاً
app.listen(PORT, () => console.log(`Dashboard & Bot running on port ${PORT}`));

client.login(process.env.DISCORD_TOKEN);

import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

// 1. إعداد بوت الديسكورد
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (message) => {
  if (message.content === '!ping') {
    message.reply('Pong! 🏓 Bot is online and working!');
  }
});

// تسجيل دخول البوت
client.login(process.env.DISCORD_TOKEN);


// 2. إعداد خادم الويب (Dashboard بسيطة جداً)
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>لوحة تحكم البوت - ak4shi</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #0f172a; color: #fff; text-align: center; padding-top: 50px; }
            .card { background: #1e293b; padding: 30px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
            h1 { color: #38bdf8; }
            .status { color: #4ade80; font-weight: bold; font-size: 1.2rem; }
            a { display: inline-block; margin-top: 20px; background: #6366f1; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; }
            a:hover { background: #4f46e5; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>أهلاً بك يا سي علي في لوحة تحكم البوت! 🚀</h1>
            <p>حالة البوت: <span class="status">● Online (متصل)</span></p>
            <p>البوت يعمل بنجاح ومستعد لتلقي الأوامر على ديسكورد.</p>
            <a href="https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID || 'YOUR_CLIENT_ID'}&permissions=8&scope=bot" target="_blank">إضافة البوت لسيرفرك</a>
        </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Web Dashboard is running on port ${PORT}`);
});
