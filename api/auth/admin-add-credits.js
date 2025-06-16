const { connectToDatabase } = require('../../db/mongodb');
const { ObjectId } = require('mongodb');

const ADMIN_DISCORD_ID = '877940891229241354';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const cookies = req.headers.cookie || '';
  const sessionCookie = cookies.split(';').find(c => c.trim().startsWith('session_user='));
  if (!sessionCookie) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const sessionUserId = sessionCookie.split('=')[1];
  const { db } = await connectToDatabase();
  const users = db.collection('users');
  const adminUser = await users.findOne({ _id: new ObjectId(sessionUserId) });
  if (!adminUser || adminUser.discordId !== ADMIN_DISCORD_ID) {
    return res.status(403).json({ error: 'Forbidden: Not admin' });
  }

  let body = '';
  await new Promise(resolve => {
    req.on('data', chunk => { body += chunk; });
    req.on('end', resolve);
  });
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  const { discordId, amount } = data;
  if (!discordId || typeof amount !== 'number') {
    return res.status(400).json({ error: 'Missing discordId or amount' });
  }

  const result = await users.findOneAndUpdate(
    { discordId },
    { $inc: { credits: amount } },
    { returnDocument: 'after' }
  );
  if (!result.value) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json({ credits: result.value.credits, username: result.value.username });
}; 