import pool from '../../../../utils/mysql';
import { verifyToken } from '../../../../utils/auth';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await verifyToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { eventId } = req.body;

    const [eRows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (eRows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    const event = eRows[0];
    const participants = typeof event.participants === 'string' ? JSON.parse(event.participants) : (event.participants || []);

    if (participants.some(p => p.userId === user.userId)) {
      return res.status(400).json({ message: 'Already joined this event' });
    }

    if (event.maxParticipants && participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    if (event.entryCoins > 0) {
      const [uRows] = await pool.query('SELECT coins FROM users WHERE id = ?', [user.userId]);
      const userData = uRows[0];
      
      if (userData.coins < event.entryCoins) {
        return res.status(400).json({ message: 'Insufficient coins' });
      }

      await pool.query('UPDATE users SET coins = coins - ? WHERE id = ?', [event.entryCoins, user.userId]);

      const txId = randomUUID();
      await pool.query(`
        INSERT INTO transactions (id, userId, type, amount, coins, description, status)
        VALUES (?, ?, 'meet-payment', ?, ?, ?, 'completed')
      `, [txId, user.userId, event.entryCoins, -event.entryCoins, `Entry fee for event: ${event.title}`]);
    }

    participants.push({
      userId: user.userId,
      status: 'confirmed',
      joinedAt: new Date().toISOString()
    });

    await pool.query('UPDATE events SET participants = ? WHERE id = ?', [JSON.stringify(participants), eventId]);

    const [updatedRows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);

    res.status(200).json({ message: 'Successfully joined event', event: updatedRows[0] });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}