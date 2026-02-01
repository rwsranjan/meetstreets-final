import dbConnect from '../../../../lib/mongodb';
import Meeting from '../../../../models/Meeting';
import User from '../../../../models/User';
import { verifyToken } from '../../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { meetingId } = req.query;

    const meeting = await Meeting.findById(meetingId)
      .populate('participants', 'profileName address')
      .populate('organizer', 'profileName');

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Ensure user is participant
    const isParticipant = meeting.participants.some(
      p => p._id.toString() === user.userId
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ meeting });
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
