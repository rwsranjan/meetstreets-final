 

import dbConnect from '../../../../lib/mongodb';
import Event from '../../../../models/Event';
import Transaction from '../../../../models/Transaction';
import User from '../../../../models/User';
import { verifyToken } from '../../../../utils/auth';


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const user = await verifyToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { eventId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already joined
    const alreadyJoined = event.participants.some(
      p => p.user.toString() === user.userId
    );
    if (alreadyJoined) {
      return res.status(400).json({ message: 'Already joined this event' });
    }

    // Check max participants
    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check and deduct entry coins
    if (event.entryCoins > 0) {
      const userData = await User.findById(user.userId);
      if (userData.coins < event.entryCoins) {
        return res.status(400).json({ message: 'Insufficient coins' });
      }

      // Deduct coins
      userData.coins -= event.entryCoins;
      await userData.save();

      // Create transaction
      await Transaction.create({
        user: user.userId,
        type: 'meet-payment',
        amount: event.entryCoins,
        coins: -event.entryCoins,
        description: `Entry fee for event: ${event.title}`,
        status: 'completed'
      });
    }

    // Add participant
    event.participants.push({
      user: user.userId,
      status: 'confirmed',
      joinedAt: new Date()
    });

    await event.save();

    res.status(200).json({ message: 'Successfully joined event', event });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}