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

    const { meetingId, rating, feedback } = req.body;

    if (!meetingId) {
      return res.status(400).json({ message: 'Meeting ID is required' });
    }

    const [mRows] = await pool.query('SELECT * FROM meetings WHERE id = ?', [meetingId]);
    if (mRows.length === 0) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    const meeting = mRows[0];
    const participants = typeof meeting.participants === 'string' ? JSON.parse(meeting.participants) : meeting.participants;
    
    if (!participants.includes(user.userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (meeting.completed) {
      return res.status(400).json({ message: 'Meeting already completed' });
    }

    let ratings = typeof meeting.ratings === 'string' ? JSON.parse(meeting.ratings) : (meeting.ratings || []);
    if (ratings.find(r => r.ratedById === user.userId)) {
      return res.status(400).json({ message: 'You have already completed this meeting' });
    }

    const otherParticipant = participants.find(p => p !== user.userId);

    ratings.push({
      ratedById: user.userId,
      ratedToId: otherParticipant,
      rating,
      feedback,
      createdAt: new Date().toISOString()
    });

    let completed = false;
    let completedAt = null;
    let status = meeting.status;

    if (ratings.length === 2) {
      completed = true;
      completedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
      status = 'completed';

      const coinsOffered = typeof meeting.coinsOffered === 'string' ? JSON.parse(meeting.coinsOffered) : meeting.coinsOffered;
      const coinsAccepted = typeof meeting.coinsAccepted === 'string' ? JSON.parse(meeting.coinsAccepted) : meeting.coinsAccepted;
      
      if (coinsOffered && coinsOffered.amount > 0 && coinsAccepted) {
        await pool.query('UPDATE users SET coins = coins - ? WHERE id = ?', [coinsOffered.amount, coinsOffered.offeredById]);
        await pool.query('UPDATE users SET coins = coins + ? WHERE id = ?', [coinsOffered.amount, coinsAccepted.acceptedById]);

        const t1 = randomUUID();
        const t2 = randomUUID();
        await pool.query(`
          INSERT INTO transactions (id, userId, type, amount, coins, relatedMeetingId, relatedUserId, status, description)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [t1, coinsOffered.offeredById, 'meet-payment', coinsOffered.amount, -coinsOffered.amount, meetingId, coinsAccepted.acceptedById, 'completed', 'Payment for meeting']);
        
        await pool.query(`
          INSERT INTO transactions (id, userId, type, amount, coins, relatedMeetingId, relatedUserId, status, description)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [t2, coinsAccepted.acceptedById, 'meet-received', coinsOffered.amount, coinsOffered.amount, meetingId, coinsOffered.offeredById, 'completed', 'Received coins from meeting']);
      }
    }

    await pool.query(`
      UPDATE meetings SET ratings = ?, completed = ?, completedAt = ?, status = ? WHERE id = ?
    `, [JSON.stringify(ratings), completed, completedAt, status, meetingId]);

    const [updatedRows] = await pool.query('SELECT * FROM meetings WHERE id = ?', [meetingId]);

    res.status(200).json({
      message: 'Meeting completed successfully',
      meeting: updatedRows[0]
    });
  } catch (error) {
    console.error('Complete meeting error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}