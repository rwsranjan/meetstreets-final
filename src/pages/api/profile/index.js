 
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
  import { verifyToken } from '../../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Get user from token
    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { userId } = req.query;

    // If userId is provided, get that user's profile, otherwise get own profile
    const targetUserId = userId || user.userId;

    const profile = await User.findById(targetUserId)
      .select('-password')
      .populate('referredBy', 'profileName')
      .lean();

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Hide sensitive info if viewing someone else's profile
    if (userId && userId !== user.userId) {
      delete profile.linkedWallet;
      delete profile.email;
      delete profile.mobile;
      delete profile.address.street;
      delete profile.address.pincode;
      delete profile.address.coordinates;
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}