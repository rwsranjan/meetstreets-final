 
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
 import { verifyToken } from '../../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const updateData = req.body;

    // Fields that cannot be updated
    const protectedFields = ['email', 'coins', 'welcomePoints', 'referralCode', 'subscriptionType'];
    protectedFields.forEach(field => delete updateData[field]);

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}