import pool from '../../../utils/mysql';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { provider, providerId, email, profileName, profilePicture } = req.body;
    if (!provider || !providerId || !email) return res.status(400).json({ message: 'Missing required fields' });

    let [uRows] = await pool.query(`
      SELECT * FROM users 
      WHERE email = ? OR (googleId = ? AND ? = 'google') /* OR (facebookId = ? AND ? = 'facebook') */
    `, [email, providerId, provider]);

    let user = uRows[0];

    if (user) {
      let updateSql = 'UPDATE users SET lastSeen = NOW(), isOnline = true';
      let updateParams = [];
      if (provider === 'google' && !user.googleId) {
        updateSql += ', googleId = ?';
        updateParams.push(providerId);
      } /* else if (provider === 'facebook' && !user.facebookId) {
        updateSql += ', facebookId = ?';
        updateParams.push(providerId);
      } */
      updateSql += ' WHERE id = ?';
      updateParams.push(user.id);
      await pool.query(updateSql, updateParams);
      
      const [updatedRows] = await pool.query('SELECT * FROM users WHERE id = ?', [user.id]);
      user = updatedRows[0];
    } else {
      return res.status(206).json({
        message: 'Partial content - complete registration required',
        needsMoreInfo: true,
        provider, providerId, email, profileName, profilePicture
      });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        profileName: user.profileName,
        subscriptionType: user.subscriptionType,
        coins: user.coins,
        profilePictures: typeof user.profilePictures === 'string' ? JSON.parse(user.profilePictures) : user.profilePictures
      }
    });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}