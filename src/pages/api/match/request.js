import pool from '../../../../utils/mysql';
import { verifyToken } from '../../../../utils/auth';
import { calculateAIMatchScore } from '../../../../utils/Matchingalgorithm';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { targetUserId, requestMessage } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ message: 'Target user ID is required' });
    }

    const [tRows] = await pool.query('SELECT * FROM users WHERE id = ?', [targetUserId]);
    const targetUser = tRows[0];
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [cRows] = await pool.query('SELECT * FROM users WHERE id = ?', [user.userId]);
    const currentUser = cRows[0];

    const [matches] = await pool.query(`
      SELECT * FROM matches 
      WHERE (user1Id = ? AND user2Id = ?) OR (user1Id = ? AND user2Id = ?)
    `, [user.userId, targetUserId, targetUserId, user.userId]);

    if (matches.length > 0) {
      return res.status(400).json({ 
        message: 'Match request already exists',
        status: matches[0].status
      });
    }

    // Parse JSON
    const currHobbies = typeof currentUser.hobbies === 'string' ? JSON.parse(currentUser.hobbies) : (currentUser.hobbies || []);
    const targetHobbies = typeof targetUser.hobbies === 'string' ? JSON.parse(targetUser.hobbies) : (targetUser.hobbies || []);
    currentUser.hobbies = currHobbies;
    targetUser.hobbies = targetHobbies;

    const aiMatchScore = calculateAIMatchScore(currentUser, targetUser);

    const commonInterests = currHobbies.filter(hobby => targetHobbies.includes(hobby));

    const matchId = randomUUID();

    await pool.query(`
      INSERT INTO matches (id, user1Id, user2Id, initiatedById, requestMessage, aiMatchScore, commonInterests, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [matchId, user.userId, targetUserId, user.userId, requestMessage || null, aiMatchScore, JSON.stringify(commonInterests), 'pending']);

    const [newMatches] = await pool.query('SELECT * FROM matches WHERE id = ?', [matchId]);

    res.status(201).json({
      message: 'Match request sent successfully',
      match: newMatches[0]
    });
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}