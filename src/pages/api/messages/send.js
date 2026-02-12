import dbConnect from '../../../../lib/mongodb';
import Conversation from '../../../../models/Conversation';
import Message from '../../../../models/Message';
import { verifyToken } from '../../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const authUser = await verifyToken(req);
    if (!authUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      conversationId,
      receiverId,
      content,
      messageType = 'text',
      mediaUrl = null
    } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    let conversation;

    // 1️⃣ Use existing conversation if provided
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }

    // 2️⃣ Otherwise find or create
    if (!conversation) {
      conversation = await Conversation.findOne({
        participants: { $all: [authUser.userId, receiverId] }
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [authUser.userId, receiverId],
          unreadCount: [
            { user: authUser.userId, count: 0 },
            { user: receiverId, count: 0 }
          ]
        });
      }
    }

    // 3️⃣ Create message
    const message = await Message.create({
      conversation: conversation._id,
      sender: authUser.userId,
      receiver: receiverId,
      content,
      messageType,
      mediaUrl
    });

    // 4️⃣ Update conversation metadata
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();

    const receiverUnread = conversation.unreadCount.find(
      u => u.user.toString() === receiverId
    );

    if (receiverUnread) receiverUnread.count += 1;

    await conversation.save();

    res.status(201).json({
      message,
      conversationId: conversation._id
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
}
