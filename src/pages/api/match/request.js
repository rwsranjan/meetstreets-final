import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Match from '../../../../models/Match';
import { verifyToken } from '../../../../utils/auth';
  import { calculateAIMatchScore } from '../../../../utils/Matchingalgorithm';

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

    const { targetUserId, requestMessage } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ message: 'Target user ID is required' });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(user.userId);

    // Check if already matched or request exists
    const existingMatch = await Match.findOne({
      $or: [
        { user1: user.userId, user2: targetUserId },
        { user1: targetUserId, user2: user.userId }
      ]
    });

    if (existingMatch) {
      return res.status(400).json({ 
        message: 'Match request already exists',
        status: existingMatch.status
      });
    }

    // Calculate AI match score
    const aiMatchScore = calculateAIMatchScore(currentUser, targetUser);

    // Find common interests
    const commonInterests = currentUser.hobbies.filter(hobby => 
      targetUser.hobbies.includes(hobby)
    );

    // Create match request
    const match = await Match.create({
      user1: user.userId,
      user2: targetUserId,
      initiatedBy: user.userId,
      requestMessage,
      aiMatchScore,
      commonInterests,
      status: 'pending'
    });

    // TODO: Send notification to target user

    res.status(201).json({
      message: 'Match request sent successfully',
      match
    });
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}