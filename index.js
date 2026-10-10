import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();

// 1. تشغيل سيرفر الويب أولاً وبشكل مستقل
const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
}));

app.get('/', (req, res) => {
  const user = req.session.user;
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>لوحة تحكم البوت - ak4shi</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #0f172a; color: #fff; text-align: center; padding-top: 50px; }
            .card { background: #1e293b; padding: 30px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 15px rgba(0,0,0,0.3); max-width: 400px; width: 100%; }
            h1 { color: #38bdf8; font-size: 1.5rem; }
            .status { color: #4ade80; font-weight: bold; }
            .btn { display: inline-block; margin-top: 15px; background: #5865F2; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; }
            .btn:hover { background: #4752C4; }
            .btn-invite { background: #10b981; margin-right: 5px; }
            .btn-invite:hover { background: #059669; }
            img { width: 80px; height: 80px; border-radius: 50%; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>لوحة تحكم البوت 🚀</h1>
            <p>حالة السيرفر: <span class="status">● Online (502 Fixed)</span></p>
            ${user ? `
                <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" alt="Avatar">
                <p>مرحباً، <b>${user.username}</b>!</p>
                <a href="/logout" class="btn" style="background: #ef4444;">تسجيل الخروج</a>
            ` : `
                <p>قم بتسجيل الدخول بحسابك على ديسكورد لإدارة البوت.</p>
                <a href="/auth/discord" class="btn">تسجيل الدخول بـ Discord</a>
            `}
            <br><br>
            <a href="https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&scope=bot" target="_blank" class="btn btn-invite">إضافة البوت</a>
        </div>
    </body>
    </html>
  `);
});

app.get('/auth/discord', (req, res) => {
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
  res.redirect(discordAuthUrl);
});

app.get('/auth/discord/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.redirect('/');

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
      }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      console.log('Token Error:', tokenData);
      return res.redirect('/');
    }

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userResponse.json();
    req.session.user = userData;
    res.redirect('/');
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    res.redirect('/');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Web Dashboard is running on port ${PORT}`);
});

// 2. تشغيل بوت الديسكورد
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

client.login(process.env.DISCORD_TOKEN);
