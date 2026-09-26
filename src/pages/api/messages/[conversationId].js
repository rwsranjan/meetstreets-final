import pool from '../../../../utils/mysql';
import { verifyToken } from '../../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await verifyToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { conversationId } = req.query;

    const [cRows] = await pool.query('SELECT * FROM conversations WHERE id = ?', [conversationId]);
    if (cRows.length === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    const conversation = cRows[0];
    const participantsArr = typeof conversation.participants === 'string' ? JSON.parse(conversation.participants) : conversation.participants;

    if (!participantsArr.includes(user.userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const [messages] = await pool.query('SELECT * FROM messages WHERE conversationId = ? ORDER BY createdAt ASC', [conversationId]);

    const otherUserId = participantsArr.find(p => p !== user.userId);
    let participant = null;
    
    if (otherUserId) {
      const [uRows] = await pool.query('SELECT id as _id, profileName, profilePictures, isOnline FROM users WHERE id = ?', [otherUserId]);
      if (uRows.length > 0) {
        const u = uRows[0];
        participant = {
          _id: u._id,
          profileName: u.profileName,
          profilePictures: typeof u.profilePictures === 'string' ? JSON.parse(u.profilePictures) : u.profilePictures,
          isOnline: u.isOnline
        };
      }
    }

    res.status(200).json({ messages, participant });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
