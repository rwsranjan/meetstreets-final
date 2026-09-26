import pool from '../../../../utils/mysql';
import { verifyToken } from '../../../../utils/auth';
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

    const { participantId, meetingType, location, scheduledDate, coinsOffered, duration } = req.body;

    if (!participantId || !meetingType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [pRows] = await pool.query('SELECT * FROM users WHERE id = ?', [participantId]);
    if (pRows.length === 0) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    const [cRows] = await pool.query('SELECT coins FROM users WHERE id = ?', [user.userId]);
    const currentUser = cRows[0];

    if (coinsOffered && coinsOffered > 0) {
      if (currentUser.coins < coinsOffered) {
        return res.status(400).json({ message: 'Insufficient coins' });
      }
    }

    const meetingId = randomUUID();
    const offeredObj = coinsOffered ? { offeredById: user.userId, amount: coinsOffered } : null;

    await pool.query(`
      INSERT INTO meetings (id, participants, meetingType, location, scheduledDate, duration, coinsOffered, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      meetingId,
      JSON.stringify([user.userId, participantId]),
      meetingType,
      location ? JSON.stringify(location) : null,
      scheduledDate ? new Date(scheduledDate).toISOString().slice(0, 19).replace('T', ' ') : null,
      duration || null,
      offeredObj ? JSON.stringify(offeredObj) : null,
      'proposed'
    ]);

    const [mRows] = await pool.query('SELECT * FROM meetings WHERE id = ?', [meetingId]);

    res.status(201).json({
      message: 'Meeting request created successfully',
      meeting: mRows[0]
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
