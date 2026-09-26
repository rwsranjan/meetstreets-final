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

    const { conversationId, receiverId, content, messageType = 'text', mediaUrl = null } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    let convId = conversationId;

    if (!convId) {
      const [existingConvs] = await pool.query(`
        SELECT * FROM conversations 
        WHERE JSON_CONTAINS(participants, ?) AND JSON_CONTAINS(participants, ?)
      `, [JSON.stringify(authUser.userId), JSON.stringify(receiverId)]);

      if (existingConvs.length > 0) {
        convId = existingConvs[0].id;
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
    }

    const messageId = randomUUID();

    await pool.query(`
      INSERT INTO messages (id, conversationId, senderId, receiverId, content, messageType, mediaUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [messageId, convId, authUser.userId, receiverId, content, messageType, mediaUrl]);

    const [cRows] = await pool.query('SELECT unreadCount FROM conversations WHERE id = ?', [convId]);
    if (cRows.length > 0) {
      const unreadCountStr = cRows[0].unreadCount;
      const unreadCount = typeof unreadCountStr === 'string' ? JSON.parse(unreadCountStr) : (unreadCountStr || []);
      
      const receiverUnread = unreadCount.find(u => u.userId === receiverId);
      if (receiverUnread) receiverUnread.count += 1;

      await pool.query(`
        UPDATE conversations 
        SET lastMessageId = ?, lastMessageAt = NOW(), unreadCount = ?, isActive = true 
        WHERE id = ?
      `, [messageId, JSON.stringify(unreadCount), convId]);
    }

    const [mRows] = await pool.query('SELECT * FROM messages WHERE id = ?', [messageId]);

    res.status(201).json({
      message: mRows[0],
      conversationId: convId
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
