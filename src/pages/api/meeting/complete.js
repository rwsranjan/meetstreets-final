 
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

    const { meetingId, rating, feedback } = req.body;

    if (!meetingId) {
      return res.status(400).json({ message: 'Meeting ID is required' });
    }

    // Find meeting
    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Verify user is a participant
    if (!meeting.participants.map(p => p.toString()).includes(user.userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if already completed
    if (meeting.completed) {
      return res.status(400).json({ message: 'Meeting already completed' });
    }

    // Check if both participants have marked as complete
    const existingRating = meeting.ratings.find(r => r.ratedBy.toString() === user.userId);
    
    if (existingRating) {
      return res.status(400).json({ message: 'You have already completed this meeting' });
    }

    // Add rating
    const otherParticipant = meeting.participants.find(p => p.toString() !== user.userId);
    
    meeting.ratings.push({
      ratedBy: user.userId,
      ratedTo: otherParticipant,
      rating,
      feedback
    });

    // If both participants have rated, complete the meeting
    if (meeting.ratings.length === 2) {
      meeting.completed = true;
      meeting.completedAt = new Date();
      meeting.status = 'completed';

      // Transfer coins
      if (meeting.coinsOffered && meeting.coinsOffered.amount > 0) {
        const offerer = await User.findById(meeting.coinsOffered.offeredBy);
        const receiver = await User.findById(meeting.coinsAccepted.acceptedBy);

        // Deduct from offerer
        offerer.coins -= meeting.coinsOffered.amount;
        await offerer.save();

        // Add to receiver
        receiver.coins += meeting.coinsOffered.amount;
        await receiver.save();

        // Create transactions
        await Transaction.create([
          {
            user: meeting.coinsOffered.offeredBy,
            type: 'meet-payment',
            amount: meeting.coinsOffered.amount,
            coins: -meeting.coinsOffered.amount,
            relatedMeeting: meetingId,
            relatedUser: receiver._id,
            status: 'completed',
            description: `Payment for meeting with ${receiver.profileName}`
          },
          {
            user: receiver._id,
            type: 'meet-received',
            amount: meeting.coinsOffered.amount,
            coins: meeting.coinsOffered.amount,
            relatedMeeting: meetingId,
            relatedUser: meeting.coinsOffered.offeredBy,
            status: 'completed',
            description: `Received coins from meeting with ${offerer.profileName}`
          }
        ]);
      }

      // Update meet counts
      for (const participantId of meeting.participants) {
        await User.findByIdAndUpdate(participantId, {
          $inc: { meetsPerMonth: 1, meetsPerYear: 1 }
        });
      }
    }

    await meeting.save();

    res.status(200).json({
      message: 'Meeting completed successfully',
      meeting
    });
  } catch (error) {
    console.error('Complete meeting error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}