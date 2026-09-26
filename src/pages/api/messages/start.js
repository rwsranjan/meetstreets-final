import pool from '../../../../utils/mysql';
import { verifyToken } from '../../../../utils/auth';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authUser = await verifyToken(req);
    if (!authUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { receiverId } = req.body;
    if (!receiverId) {
      return res.status(400).json({ message: 'Missing receiverId' });
    }

    let convId = null;

    const [existingConvs] = await pool.query(`
      SELECT * FROM conversations 
      WHERE JSON_CONTAINS(participants, ?) AND JSON_CONTAINS(participants, ?)
    `, [JSON.stringify(authUser.userId), JSON.stringify(receiverId)]);

    if (existingConvs.length > 0) {
      convId = existingConvs[0].id;
      // Ensure the conversation is active in case it was previously removed/blocked
      if (!existingConvs[0].isActive) {
        await pool.query('UPDATE conversations SET isActive = true WHERE id = ?', [convId]);
      }
    } else {
      convId = randomUUID();
      const unreadCount = [
        { userId: authUser.userId, count: 0 },
        { userId: receiverId, count: 0 }
      ];
      await pool.query(`
        INSERT INTO conversations (id, participants, unreadCount) 
        VALUES (?, ?, ?)
      `, [convId, JSON.stringify([authUser.userId, receiverId]), JSON.stringify(unreadCount)]);
    }

    res.status(200).json({ conversationId: convId });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
