  
import dbConnect from '../../../../lib/mongodb';
 import Conversation from '../../../../models/Conversation';
import Message from '../../../../models/Message'
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

    // Get all conversations for the user
    const conversations = await Conversation.find({
      participants: user.userId,
      isActive: true
    })
    .populate('participants', 'profileName profilePictures isOnline lastSeen')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 })
    .lean();

    // Format conversations
    const formattedConversations = conversations.map(conv => {
      // Get the other participant
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== user.userId
      );

      // Get unread count for this user
      const unreadEntry = conv.unreadCount?.find(
        u => u.user.toString() === user.userId
      );

      return {
        _id: conv._id,
        participant: otherParticipant,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: unreadEntry?.count || 0,
        isArchived: conv.archived?.includes(user.userId),
        isMuted: conv.muted?.includes(user.userId)
      };
    });

    res.status(200).json({
      conversations: formattedConversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}