import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const {
      email,
      mobile,
      password,
      profileName,
      age,
      gender,
      purposeOnApp,
      referralCode,
      address // optional address from frontend
    } = req.body;

    // ----------------------------
    // Basic Validation
    // ----------------------------
    if (!email || !password || !profileName || !age || !gender || !purposeOnApp) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (age < 18) {
      return res.status(400).json({ message: 'Must be 18 or older' });
    }

    // ----------------------------
    // Check if user exists
    // ----------------------------
    const existingUser = await User.findOne({ 
      $or: [{ email }, { mobile: mobile || null }] 
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // ----------------------------
    // Calculate age range
    // ----------------------------
    const ageRange = 
      age >= 18 && age <= 25 ? '18-25' :
      age >= 26 && age <= 30 ? '26-30' :
      age >= 31 && age <= 40 ? '31-40' :
      age >= 41 && age <= 50 ? '40-50' : '50+';

    // ----------------------------
    // Handle referral
    // ----------------------------
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referredBy = referrer._id;
        referrer.coins += 50;
        referrer.totalReferrals += 1;
        await referrer.save();
      }
    }

    // ----------------------------
    // Hash password
    // ----------------------------
    const hashedPassword = await bcrypt.hash(password, 10);

    // ----------------------------
    // Clean address coordinates
    // ----------------------------
    let cleanAddress = undefined;
    if (address) {
      cleanAddress = { ...address };
      if (
        cleanAddress.coordinates &&
        (!Array.isArray(cleanAddress.coordinates.coordinates) ||
          cleanAddress.coordinates.coordinates.length !== 2)
      ) {
        // Remove invalid coordinates to prevent MongoDB 2dsphere error
        delete cleanAddress.coordinates;
      }
    }

    // ----------------------------
    // Create user
    // ----------------------------
    const user = await User.create({
      email,
      mobile,
      password: hashedPassword,
      profileName,
      age,
      gender,
      purposeOnApp,
      ageRange,
      referredBy,
      welcomePoints: 100,
      coins: referredBy ? 150 : 100,
      address: cleanAddress // optional
    });

    // ----------------------------
    // Generate JWT
    // ----------------------------
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        profileName: user.profileName,
        referralCode: user.referralCode,
        coins: user.coins
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
