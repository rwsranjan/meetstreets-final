import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { verifyToken } from '../../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      // Location
      city,
      locality,
      state,
      country,
      latitude,
      longitude,
      
      // Physical Appearance
      height,
      ethnicBackground,
      
      // Education
      education,
      degreeType,
      
      // Personal Values
      wantKids,
      religiousBeliefs,
      exerciseHabits,
      eatingHabits,
      
      // Interests
      hobbies,
      favoriteFood,
      favoriteMusic,
      favoriteMovies,
      
      // App Specific
      favoritePlaceToMeet,
      travelerType,
      
      // Profile Pictures
      profilePictures
    } = req.body;

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      {
        $set: {
          'address.city': city,
          'address.locality': locality,
          'address.state': state,
          'address.country': country,
          'address.coordinates': latitude && longitude ? {
            type: 'Point',
            coordinates: [longitude, latitude]
          } : undefined,
          height,
          ethnicBackground,
          education,
          degreeType,
          wantKids,
          religiousBeliefs,
          exerciseHabits,
          eatingHabits,
          hobbies: hobbies || [],
          favoriteFood: favoriteFood || [],
          favoriteMusic: favoriteMusic || [],
          favoriteMovies: favoriteMovies || [],
          'interests.favoritePlaceToMeet': favoritePlaceToMeet,
          'interests.travelerType': travelerType,
          profilePictures: profilePictures?.map((url, index) => ({
            url,
            isPrimary: index === 0,
            uploadedAt: new Date()
          })) || []
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile completed successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}