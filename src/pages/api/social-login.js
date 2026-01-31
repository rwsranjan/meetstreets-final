import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { provider, providerId, email, profileName, profilePicture } = req.body;

    if (!provider || !providerId || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists
    let user = await User.findOne({
      $or: [
        { email },
        { googleId: provider === 'google' ? providerId : undefined },
        { facebookId: provider === 'facebook' ? providerId : undefined }
      ]
    });

    if (user) {
      // Update provider ID if not set
      if (provider === 'google' && !user.googleId) {
        user.googleId = providerId;
      } else if (provider === 'facebook' && !user.facebookId) {
        user.facebookId = providerId;
      }

      // Update last seen and online status
      user.lastSeen = new Date();
      user.isOnline = true;
      await user.save();
    } else {
      // Create new user - but need more info for complete profile
      return res.status(206).json({
        message: 'Partial content - complete registration required',
        needsMoreInfo: true,
        provider,
        providerId,
        email,
        profileName,
        profilePicture
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        profileName: user.profileName,
        subscriptionType: user.subscriptionType,
        coins: user.coins,
        profilePictures: user.profilePictures
      }
    });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}