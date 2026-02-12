import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { verifyToken } from '../../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const authUser = await verifyToken(req);
    if (!authUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const currentUser = await User.findById(authUser.userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clone body (never mutate req.body)
    const data = { ...req.body };

    // 🔒 Protected fields
    const protectedFields = [
      'email',
      'mobile',
      'password',
      'coins',
      'welcomePoints',
      'referralCode',
      'subscriptionType',
      'age',
      'gender',
      'purposeOnApp'
    ];
    protectedFields.forEach(f => delete data[f]);

    // ✅ Safe address merge
    const address = {
      ...currentUser.address?.toObject(),
      ...(data.address || {})
    };
    delete data.address;

    // ✅ Ensure arrays are arrays
    const safeArrays = {
      hobbies: Array.isArray(data.hobbies) ? data.hobbies : currentUser.hobbies,
      favoriteFood: Array.isArray(data.favoriteFood) ? data.favoriteFood : currentUser.favoriteFood,
      favoriteMusic: Array.isArray(data.favoriteMusic) ? data.favoriteMusic : currentUser.favoriteMusic,
      favoriteMovies: Array.isArray(data.favoriteMovies) ? data.favoriteMovies : currentUser.favoriteMovies,
      profilePictures: Array.isArray(data.profilePictures)
        ? data.profilePictures.slice(0, 6)
        : currentUser.profilePictures
    };

    // Remove arrays from data to avoid overwrite bugs
    delete data.hobbies;
    delete data.favoriteFood;
    delete data.favoriteMusic;
    delete data.favoriteMovies;
    delete data.profilePictures;

    // ✅ Final update object
    const updatePayload = {
      ...data,
      address,
      ...safeArrays
    };

    const updatedUser = await User.findByIdAndUpdate(
      authUser.userId,
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
}
