import pool from '../../../../utils/mysql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { sendEmail } from '../../../../lib/mailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      email,
      mobile,
      password,
      profileName,
      age,
      gender,
      purposeOnApp,
      referralCode,
      address,
      provider,
      providerId
    } = req.body;

    if (!email || (!password && !provider) || !profileName || !age || !gender || !purposeOnApp) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (age < 18) {
      return res.status(400).json({ message: 'Must be 18 or older' });
    }

    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR (mobile = ? AND mobile IS NOT NULL)',
      [email, mobile]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const ageRange = 
      age >= 18 && age <= 25 ? '18-25' :
      age >= 26 && age <= 30 ? '26-30' :
      age >= 31 && age <= 40 ? '31-40' :
      age >= 41 && age <= 50 ? '40-50' : '50+';

    let referredById = null;
    let initialCoins = 100;
    
    if (referralCode) {
      const [referrers] = await pool.query('SELECT id, coins, totalReferrals FROM users WHERE referralCode = ?', [referralCode]);
      if (referrers.length > 0) {
        const referrer = referrers[0];
        referredById = referrer.id;
        initialCoins = 150;
        
        await pool.query(
          'UPDATE users SET coins = coins + 50, totalReferrals = totalReferrals + 1 WHERE id = ?',
          [referrer.id]
        );
      }
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const userId = randomUUID();
    const newReferralCode = 'MS' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const googleId = provider === 'google' ? providerId : null;
    // const facebookId = provider === 'facebook' ? providerId : null;
    const facebookId = null;

    let cleanAddress = null;
    if (address) {
      cleanAddress = { ...address };
      if (
        cleanAddress.coordinates &&
        (!Array.isArray(cleanAddress.coordinates.coordinates) ||
          cleanAddress.coordinates.coordinates.length !== 2)
      ) {
        delete cleanAddress.coordinates;
      }
    }

    await pool.query(
      `INSERT INTO users (
        id, email, mobile, password, profileName, age, gender, 
        purposeOnApp, ageRange, referredBy, welcomePoints, coins, 
        address, referralCode, googleId, facebookId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, email, mobile || null, hashedPassword, profileName, age, gender,
        purposeOnApp, ageRange, referredById, 100, initialCoins,
        cleanAddress ? JSON.stringify(cleanAddress) : null,
        newReferralCode, googleId, facebookId
      ]
    );

    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send Welcome Email (non-blocking)
    sendEmail({
      to: email,
      subject: "Welcome to MeetStreet! 🚀",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2 style="color: #f97316;">Welcome to MeetStreet, ${profileName}!</h2>
          <p>We're thrilled to have you join our community.</p>
          <p>You've received <strong>${initialCoins} Coins</strong> to get started.</p>
          <br/>
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Explore Matches</a>
        </div>
      `
    }).catch(err => console.error("Failed to send welcome email:", err));

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        profileName,
        referralCode: newReferralCode,
        coins: initialCoins
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
