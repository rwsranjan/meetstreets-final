import pool from '../../../../utils/mysql';
import crypto from "crypto";
import { sendEmail } from "../../../../lib/mailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const [users] = await pool.query('SELECT id, email FROM users WHERE email = ?', [email]);
    
    // 🔒 Prevent email enumeration attack
    if (users.length === 0) {
      return res.status(200).json({ message: "If account exists, reset link sent" });
    }

    const user = users[0];

    // 🔑 Generate tokens
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiryDate = new Date(Date.now() + 1000 * 60 * 15); // 15 mins

    // ✅ Store hashed token
    await pool.query(
      'UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?',
      [hashedToken, expiryDate, user.id]
    );

    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}`;

    await sendEmail({
      to: email,
      subject: "Reset Your Password",
      html: `
        <p>You requested a password reset.</p>
        <p>Click below to reset your password (valid for 15 minutes):</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you didn't request this, ignore this email.</p>
      `
    });

    return res.status(200).json({ message: "If account exists, reset link sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}