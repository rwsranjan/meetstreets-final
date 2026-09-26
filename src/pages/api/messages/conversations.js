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

    const [conversations] = await pool.query(`
      SELECT * FROM conversations 
      WHERE JSON_CONTAINS(participants, ?) AND isActive = true
      ORDER BY lastMessageAt DESC
    `, [JSON.stringify(user.userId)]);

    const formattedConversations = [];

    for (let conv of conversations) {
      const parts = typeof conv.participants === 'string' ? JSON.parse(conv.participants) : conv.participants;
      const unreadCountArr = typeof conv.unreadCount === 'string' ? JSON.parse(conv.unreadCount) : (conv.unreadCount || []);
      const archivedArr = typeof conv.archived === 'string' ? JSON.parse(conv.archived) : (conv.archived || []);
      const mutedArr = typeof conv.muted === 'string' ? JSON.parse(conv.muted) : (conv.muted || []);

      const otherUserId = parts.find(p => p !== user.userId);
      let otherParticipant = null;

      if (otherUserId) {
        const [uRows] = await pool.query('SELECT id as _id, profileName, profilePictures, isOnline, lastSeen FROM users WHERE id = ?', [otherUserId]);
        if (uRows.length > 0) {
          const u = uRows[0];
          otherParticipant = {
            _id: u._id,
            profileName: u.profileName,
            profilePictures: typeof u.profilePictures === 'string' ? JSON.parse(u.profilePictures) : u.profilePictures,
            isOnline: u.isOnline,
            lastSeen: u.lastSeen
          };
        }
      }

      const unreadEntry = unreadCountArr.find(u => u.userId === user.userId);
      let lastMessage = null;

      if (conv.lastMessageId) {
        const [mRows] = await pool.query('SELECT * FROM messages WHERE id = ?', [conv.lastMessageId]);
        if (mRows.length > 0) {
          lastMessage = mRows[0];
        }
      }

      formattedConversations.push({
        _id: conv.id,
        participant: otherParticipant,
        lastMessage: lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: unreadEntry?.count || 0,
        isArchived: archivedArr.includes(user.userId),
        isMuted: mutedArr.includes(user.userId)
      });
    }

    res.status(200).json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}