import pool from '../../../../utils/mysql';
import { verifyToken } from '../../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { matchId, action, responseMessage } = req.body;

    if (!matchId || !action) {
      return res.status(400).json({ message: 'Match ID and action are required' });
    }

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const [rows] = await pool.query('SELECT * FROM matches WHERE id = ?', [matchId]);
    const match = rows[0];

    if (!match) {
      return res.status(404).json({ message: 'Match request not found' });
    }

    if (match.user2Id !== user.userId && match.user1Id !== user.userId) {
      return res.status(403).json({ message: 'Not authorized to respond to this match' });
    }

    if (match.status !== 'pending') {
      return res.status(400).json({ message: 'Match request already responded to' });
    }

    const status = action === 'accept' ? 'matched' : 'declined';
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    let sql = `UPDATE matches SET status = ?, responseMessage = ?, respondedAt = ?`;
    let params = [status, responseMessage || null, now];

    if (action === 'accept') {
      sql += `, matchedAt = ?`;
      params.push(now);
    }

    sql += ` WHERE id = ?`;
    params.push(matchId);

    await pool.query(sql, params);

    const [updatedRows] = await pool.query('SELECT * FROM matches WHERE id = ?', [matchId]);

    res.status(200).json({
      message: `Match ${action}ed successfully`,
      match: updatedRows[0]
    });
  } catch (error) {
    console.error('Respond to match error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}