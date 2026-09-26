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

    const { meetingId } = req.query;

    const [mRows] = await pool.query('SELECT * FROM meetings WHERE id = ?', [meetingId]);
    if (mRows.length === 0) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    const meeting = mRows[0];
    const participantsArr = typeof meeting.participants === 'string' ? JSON.parse(meeting.participants) : (meeting.participants || []);

    const isParticipant = participantsArr.includes(user.userId);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Populate participants basic info
    if (participantsArr.length > 0) {
      const placeholders = participantsArr.map(() => '?').join(',');
      const [uRows] = await pool.query(`SELECT id as _id, profileName, address FROM users WHERE id IN (${placeholders})`, participantsArr);
      meeting.participants = uRows.map(u => ({ ...u, address: typeof u.address === 'string' ? JSON.parse(u.address) : u.address }));
    }

    res.status(200).json({ meeting });
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
