import dbConnect from '../../../../lib/mongodb';
 import Match from '../../../../models/Match';
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

    const { matchId, action, responseMessage } = req.body;

    if (!matchId || !action) {
      return res.status(400).json({ message: 'Match ID and action are required' });
    }

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    // Find match
    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({ message: 'Match request not found' });
    }

    // Verify user is the recipient
    if (match.user2.toString() !== user.userId && match.user1.toString() !== user.userId) {
      return res.status(403).json({ message: 'Not authorized to respond to this match' });
    }

    if (match.status !== 'pending') {
      return res.status(400).json({ message: 'Match request already responded to' });
    }

    // Update match status
    match.status = action === 'accept' ? 'matched' : 'declined';
    match.responseMessage = responseMessage;
    match.respondedAt = new Date();
    if (action === 'accept') {
      match.matchedAt = new Date();
    }

    await match.save();

    // TODO: Send notification to initiator

    res.status(200).json({
      message: `Match ${action}ed successfully`,
      match
    });
  } catch (error) {
    console.error('Respond to match error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}