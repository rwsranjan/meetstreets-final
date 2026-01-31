  
 
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Meeting from '../../../../models/Meeting';
import Match from '../../../../models/Match'
import { verifyToken } from '../../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const currentUser = await User.findById(user.userId).select('-password');
    
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get total matches
    const totalMatches = await Match.countDocuments({
      $or: [
        { user1: user.userId, status: 'matched' },
        { user2: user.userId, status: 'matched' }
      ]
    });

    // Get recent matches with user details
    const recentMatches = await Match.find({
      $or: [
        { user1: user.userId },
        { user2: user.userId }
      ],
      status: 'matched'
    })
    .sort({ matchedAt: -1 })
    .limit(5)
    .populate('user1 user2', 'profileName address hobbies profilePictures')
    .lean();

    // Format matches to show the other user
    const formattedMatches = recentMatches.map(match => {
      const otherUser = match.user1._id.toString() === user.userId 
        ? match.user2 
        : match.user1;
      
      return {
        _id: match._id,
        user: otherUser,
        aiMatchScore: match.aiMatchScore,
        commonInterests: match.commonInterests,
        matchedAt: match.matchedAt
      };
    });

    // Get total meetings this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const totalMeetings = await Meeting.countDocuments({
      participants: user.userId,
      createdAt: { $gte: startOfMonth },
      status: { $in: ['completed', 'in-progress', 'accepted'] }
    });

    // Get upcoming meetings
    const upcomingMeetings = await Meeting.find({
      participants: user.userId,
      status: { $in: ['proposed', 'accepted'] },
      scheduledDate: { $gte: new Date() }
    })
    .sort({ scheduledDate: 1 })
    .limit(3)
    .populate('participants', 'profileName profilePictures')
    .lean();

    // Get nearby users (within 10km if coordinates available)
    let nearbyUsers = [];
    if (currentUser.address?.coordinates?.coordinates) {
      const [longitude, latitude] = currentUser.address.coordinates.coordinates;
      
      nearbyUsers = await User.find({
        _id: { $ne: user.userId },
        'address.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: 10000 // 10km in meters
          }
        },
        isActive: true,
        isBanned: false
      })
      .select('profileName address profilePictures isOnline')
      .limit(10)
      .lean();

      // Calculate distance for each user
      nearbyUsers = nearbyUsers.map(u => {
        if (u.address?.coordinates?.coordinates) {
          const [uLong, uLat] = u.address.coordinates.coordinates;
          const distance = calculateDistance(latitude, longitude, uLat, uLong);
          return { ...u, distance: distance.toFixed(1) };
        }
        return { ...u, distance: 'N/A' };
      });
    }

    // Calculate profile completion percentage
    const profileCompletion = calculateProfileCompletion(currentUser);

    const stats = {
      totalMatches,
      totalMeetings,
      qualityScore: currentUser.qualityScore || 0,
      coins: currentUser.coins || 0,
      profileCompletion,
      upcomingMeetings
    };

    res.status(200).json({
      stats,
      recentMatches: formattedMatches,
      nearbyUsers
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Calculate distance between two coordinates in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Calculate profile completion percentage
function calculateProfileCompletion(user) {
  let completed = 0;
  let total = 0;

  // Required fields
  const requiredFields = [
    'profileName',
    'age',
    'gender',
    'purposeOnApp',
    'address.city',
    'address.locality'
  ];

  requiredFields.forEach(field => {
    total++;
    const value = field.split('.').reduce((obj, key) => obj?.[key], user);
    if (value) completed++;
  });

  // Optional but important fields
  const optionalFields = [
    'profilePictures',
    'hobbies',
    'education',
    'height',
    'exerciseHabits',
    'eatingHabits',
    'interests.favoritePlaceToMeet',
    'interests.travelerType'
  ];

  optionalFields.forEach(field => {
    total++;
    const value = field.split('.').reduce((obj, key) => obj?.[key], user);
    if (Array.isArray(value) ? value.length > 0 : value) completed++;
  });

  return Math.round((completed / total) * 100);
}