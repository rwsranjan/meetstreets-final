import dbConnect from "../../../../lib/mongodb";
import Conversation from "../../../../models/Conversation";
import Message from "../../../../models/Message";
import { verifyToken } from "../../../../utils/auth";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const user = await verifyToken(req);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { conversationId } = req.query;

    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "profileName profilePictures isOnline")
      .lean();

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // 🔐 Security check
    if (!conversation.participants.some(p => p._id.toString() === user.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .lean();

    const participant = conversation.participants.find(
      p => p._id.toString() !== user.userId
    );

    res.status(200).json({ messages, participant });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
