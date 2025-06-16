const { connectToDatabase } = require('../../db/mongodb');
const fetch = require('node-fetch');

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = "https://www.littlekhim.online/api/auth/callback";

function setCookie(res, name, value, options = {}) {
  let cookie = `${name}=${value}`;
  if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
  if (options.httpOnly) cookie += '; HttpOnly';
  if (options.secure) cookie += '; Secure';
  if (options.path) cookie += `; Path=${options.path}`;
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
  res.setHeader('Set-Cookie', cookie);
}

module.exports = async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ error: 'Missing code' });
  }

  // 1. Exchange code for access token
  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      scope: 'identify email',
    }),
  });

  if (!tokenRes.ok) {
    return res.status(401).json({ error: 'Failed to get access token' });
  }
  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  // 2. Fetch user info from Discord
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!userRes.ok) {
    return res.status(401).json({ error: 'Failed to fetch user info' });
  }
  const discordUser = await userRes.json();

  // 3. Store/update user in MongoDB
  const { db } = await connectToDatabase();
  const users = db.collection('users');
  const update = {
    $set: {
      discordId: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: discordUser.avatar,
      email: discordUser.email,
      lastLogin: new Date(),
    },
    $setOnInsert: {
      credits: 0,
      createdAt: new Date(),
    },
  };
  const result = await users.findOneAndUpdate(
    { discordId: discordUser.id },
    update,
    { upsert: true, returnDocument: 'after' }
  );
  const user = result.value;

  // 4. Set session cookie (userId)
  setCookie(res, 'session_user', user._id.toString(), {
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  // 5. Redirect to home page
  res.writeHead(302, { Location: '/' });
  res.end();
}; 