import pool from '../../../../utils/mysql';
import bcrypt from "bcryptjs";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Token and password required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    // 🔐 Hash token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 🔍 Find user
    const [users] = await pool.query(
      'SELECT id FROM users WHERE resetToken = ? AND resetTokenExpiry > NOW()',
      [hashedToken]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = users[0];

    // 🔒 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Atomic update
    await pool.query(
      'UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    return res.status(200).json({
      message: "Password reset successful"
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}