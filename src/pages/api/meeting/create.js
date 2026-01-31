import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Meeting from '../../../../models/Meeting';
import Transaction from '../../../../models/Transaction'
import { verifyToken } from '../../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      participantId,
      meetingType,
      location,
      scheduledDate,
      coinsOffered,
      duration
    } = req.body;

    if (!participantId || !meetingType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    const currentUser = await User.findById(user.userId);

    // Verify user has enough coins if offering
    if (coinsOffered && coinsOffered > 0) {
      if (currentUser.coins < coinsOffered) {
        return res.status(400).json({ message: 'Insufficient coins' });
      }
    }

    // Create meeting
    const meeting = await Meeting.create({
      participants: [user.userId, participantId],
      meetingType,
      location,
      scheduledDate,
      duration,
      coinsOffered: coinsOffered ? {
        offeredBy: user.userId,
        amount: coinsOffered
      } : undefined,
      status: 'proposed'
    });

    // TODO: Send notification to participant

    res.status(201).json({
      message: 'Meeting request created successfully',
      meeting
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

