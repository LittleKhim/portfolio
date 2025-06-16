const { connectToDatabase } = require('../../db/mongodb');
const { ObjectId } = require('mongodb');

module.exports = async (req, res) => {
  const cookies = req.headers.cookie || '';
  const sessionCookie = cookies.split(';').find(c => c.trim().startsWith('session_user='));
  if (!sessionCookie) {
    return res.status(200).json({ user: null });
  }
  const userId = sessionCookie.split('=')[1];
  if (!userId) {
    return res.status(200).json({ user: null });
  }

  const { db } = await connectToDatabase();
  const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
  if (!user) {
    return res.status(200).json({ user: null });
  }

  // Only return safe user info
  res.status(200).json({
    user: {
      id: user._id,
      discordId: user.discordId,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar,
      email: user.email,
      credits: user.credits || 0,
    }
  });
}; 