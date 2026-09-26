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

    // Pending requests directed to the current user
    const [pendingRows] = await pool.query(`
      SELECT m.*, 
             u.profileName, u.address, u.profilePictures
      FROM matches m
      JOIN users u ON m.initiatedById = u.id
      WHERE m.user2Id = ? AND m.status = 'pending'
    `, [user.userId]);

    const pending = pendingRows.map(row => {
      let address = {};
      try { address = typeof row.address === 'string' ? JSON.parse(row.address) : row.address; } catch(e){}
      let pictures = [];
      try { pictures = typeof row.profilePictures === 'string' ? JSON.parse(row.profilePictures) : row.profilePictures; } catch(e){}
      
      return {
        _id: row.id,
        aiMatchScore: row.aiMatchScore,
        requestMessage: row.requestMessage,
        user: {
          id: row.initiatedById,
          profileName: row.profileName,
          address: address,
          profilePictures: pictures
        }
      };
    });

    // Approved Matches (both user1 and user2)
    const [matchRows] = await pool.query(`
      SELECT m.*, 
             u.id as matchedUserId, u.profileName, u.address, u.profilePictures
      FROM matches m
      JOIN users u ON (
        (m.user1Id = u.id AND m.user2Id = ?) OR 
        (m.user2Id = u.id AND m.user1Id = ?)
      )
      WHERE m.status IN ('matched', 'accepted')
    `, [user.userId, user.userId]);

    const matches = matchRows.map(row => {
      let address = {};
      try { address = typeof row.address === 'string' ? JSON.parse(row.address) : row.address; } catch(e){}
      let pictures = [];
      try { pictures = typeof row.profilePictures === 'string' ? JSON.parse(row.profilePictures) : row.profilePictures; } catch(e){}
      
      return {
        _id: row.id,
        status: row.status,
        hasMet: row.hasMet,
        user: {
          id: row.matchedUserId,
          profileName: row.profileName,
          address: address,
          profilePictures: pictures
        }
      };
    });

    res.status(200).json({ pending, matches });
  } catch (error) {
    console.error('List matches error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
