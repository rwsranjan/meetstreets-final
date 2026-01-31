 
import dbConnect from '../../../../lib/mongodb';
import Event from '../../../../models/Event';
import { verifyToken } from '../../../../utils/auth';


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const user = await verifyToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const {
      title,
      description,
      eventType,
      location,
      eventDate,
      eventTime,
      duration,
      maxParticipants,
      entryCoins,
      coverImage,
      isPrivate
    } = req.body;

    if (!title || !description || !eventType || !eventDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const event = await Event.create({
      title,
      description,
      organizer: user.userId,
      eventType,
      location,
      eventDate,
      eventTime,
      duration,
      maxParticipants,
      entryCoins: entryCoins || 0,
      coverImage,
      isPrivate: isPrivate || false,
      participants: [{
        user: user.userId,
        status: 'confirmed',
        joinedAt: new Date()
      }]
    });

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}