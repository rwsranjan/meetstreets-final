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

    const {
      title, description, eventType, location, eventDate,
      eventTime, duration, maxParticipants, entryCoins,
      coverImage, isPrivate
    } = req.body;

    if (!title || !description || !eventType || !eventDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const eventId = randomUUID();
    const participants = [{ userId: user.userId, status: 'confirmed', joinedAt: new Date().toISOString() }];

    await pool.query(`
      INSERT INTO events (
        id, title, description, organizerId, eventType, location, 
        eventDate, eventTime, duration, maxParticipants, entryCoins, 
        coverImage, isPrivate, participants, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming')
    `, [
      eventId, title, description, user.userId, eventType, 
      location ? JSON.stringify(location) : null, 
      new Date(eventDate).toISOString().slice(0, 19).replace('T', ' '),
      eventTime || null, duration || null, maxParticipants || null, entryCoins || 0,
      coverImage || null, isPrivate || false, JSON.stringify(participants)
    ]);

    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);

    res.status(201).json({ message: 'Event created successfully', event: rows[0] });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}