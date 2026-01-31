 
import dbConnect from '../../../../lib/mongodb';
 import Conversation from '../../../../models/Conversation';
import Message from '../../../../models/Message'
import { verifyToken } from '../../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const user = await verifyToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { receiverId, content, messageType = 'text', mediaUrl } = req.body;

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [user.userId, receiverId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [user.userId, receiverId],
        unreadCount: [
          { user: user.userId, count: 0 },
          { user: receiverId, count: 1 }
        ]
      });
    }

    // Create message
    const message = await Message.create({
      conversation: conversation._id,
      sender: user.userId,
      receiver: receiverId,
      content,
      messageType,
      mediaUrl
    });

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    
    // Increment unread count for receiver
    const receiverUnread = conversation.unreadCount.find(
      u => u.user.toString() === receiverId
    );
    if (receiverUnread) {
      receiverUnread.count += 1;
    }
    
    await conversation.save();

    // TODO: Emit socket event for real-time delivery

    res.status(201).json({ message, conversationId: conversation._id });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}