import pool from '../../../../utils/mysql';
import { verifyToken } from '../../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { userId } = req.query;
    const targetUserId = userId || user.userId;

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [targetUserId]);
    const profile = rows[0];

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    delete profile.password;

    // Parse JSON fields
    const jsonFields = ['address', 'hobbies', 'favoriteFood', 'favoriteMusic', 'favoriteMovies', 'favoriteTVShows', 'favoriteBooks', 'profilePictures', 'profileVideo', 'interestsMeta'];
    jsonFields.forEach(field => {
      if (typeof profile[field] === 'string') {
        try { profile[field] = JSON.parse(profile[field]); } catch(e) {}
      }
    });

    if (profile.interestsMeta) {
      Object.assign(profile, profile.interestsMeta);
    }

    // Populate referredBy (basic join equivalent)
    if (profile.referredBy) {
      const [refRows] = await pool.query('SELECT id, profileName FROM users WHERE id = ?', [profile.referredBy]);
      if (refRows.length > 0) {
        profile.referredBy = refRows[0];
      }
    }

    // Hide sensitive info if viewing someone else's profile
    if (userId && userId !== user.userId) {
      delete profile.email;
      delete profile.mobile;

      if (profile.address) {
        delete profile.address.street;
        delete profile.address.pincode;
        delete profile.address.coordinates;
      }

      // Check connection status
      const [matches] = await pool.query(
        'SELECT * FROM matches WHERE (user1Id = ? AND user2Id = ?) OR (user1Id = ? AND user2Id = ?)',
        [user.userId, userId, userId, user.userId]
      );
      if (matches.length > 0) {
        profile.connectionStatus = matches[0].status;
        profile.initiatedByMe = matches[0].initiatedById === user.userId;
      }
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}