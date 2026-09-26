import pool from "../../../../utils/mysql";
import { verifyToken } from '../../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const user = verifyToken(req);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { otherUserId, conversationId, block } = req.body;
    if (!otherUserId) {
      return res.status(400).json({ message: "otherUserId is required" });
    }

    const userId = user.userId;

    // Remove connection from matches table
    await pool.query(
      `DELETE FROM matches 
       WHERE (user1Id = ? AND user2Id = ?) OR (user1Id = ? AND user2Id = ?)`,
      [userId, otherUserId, otherUserId, userId]
    );

    // If there is an active conversation, mark it as inactive
    if (conversationId) {
      await pool.query(
        `UPDATE conversations SET isActive = false WHERE id = ?`,
        [conversationId]
      );
    } else {
      // Find and deactivate any conversation between them
      const [convs] = await pool.query(
        `SELECT id, participants FROM conversations WHERE isActive = true`
      );

      for (let conv of convs) {
        const parts = typeof conv.participants === 'string' ? JSON.parse(conv.participants) : conv.participants;
        if (parts.includes(userId) && parts.includes(otherUserId)) {
          await pool.query(
            `UPDATE conversations SET isActive = false WHERE id = ?`,
            [conv.id]
          );
        }
      }
    }

    return res.status(200).json({ success: true, message: block ? "User blocked" : "Connection removed" });
  } catch (error) {
    console.error("Match remove error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
