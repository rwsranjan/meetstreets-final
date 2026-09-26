import pool from "../../../../utils/mysql";
import { verifyToken } from "../../../../utils/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const user = verifyToken(req);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { conversationId } = req.body;
    if (!conversationId) {
      return res.status(400).json({ message: "Conversation ID is required" });
    }

    const userId = user.userId;

    // 1. Update all messages in this conversation where receiver is the current user
    await pool.query(
      `UPDATE messages 
       SET readStatus = true, readAt = CURRENT_TIMESTAMP 
       WHERE conversationId = ? 
       AND receiverId = ? 
       AND (readStatus = false OR readStatus = 0)`,
      [conversationId, userId]
    );

    // 2. Reset the unreadCount in the Conversations table
    const [convRows] = await pool.query(
      `SELECT unreadCount FROM conversations WHERE id = ?`,
      [conversationId]
    );

    if (convRows.length > 0) {
      let unreadCountArr = typeof convRows[0].unreadCount === 'string' 
        ? JSON.parse(convRows[0].unreadCount) 
        : (convRows[0].unreadCount || []);

      const userEntryIndex = unreadCountArr.findIndex(u => u.userId === userId);
      if (userEntryIndex !== -1) {
        unreadCountArr[userEntryIndex].count = 0;
      } else {
        unreadCountArr.push({ userId, count: 0 });
      }

      await pool.query(
        `UPDATE conversations SET unreadCount = ? WHERE id = ?`,
        [JSON.stringify(unreadCountArr), conversationId]
      );
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Mark read error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
