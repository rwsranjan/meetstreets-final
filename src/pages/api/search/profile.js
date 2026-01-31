 
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

    const currentUser = await User.findById(user.userId);

    // Check subscription limits
    const searchLimits = {
      free: 10,
      regular: 50,
      premium: Infinity
    };

    const {
      city,
      locality,
      distance, // in km
      latitude,
      longitude,
      ageRange,
      gender,
      interests,
      purposeOnApp,
      page = 1,
      limit = 20
    } = req.body;

    let query = {
      _id: { $ne: user.userId },
      isActive: true,
      isBanned: false,
      $and: [
        { _id: { $nin: currentUser.blockedUsers } }
      ]
    };

    // Location-based search
    if (latitude && longitude && distance) {
      query['address.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: distance * 1000 // Convert km to meters
        }
      };
    } else if (city) {
      query['address.city'] = new RegExp(city, 'i');
      if (locality) {
        query['address.locality'] = new RegExp(locality, 'i');
      }
    }

    // Filters
    if (ageRange) {
      query.ageRange = ageRange;
    }

    if (gender && gender !== 'all') {
      query.gender = gender;
    }

    if (purposeOnApp) {
      query.$or = [
        { purposeOnApp },
        { purposeOnApp: 'both' }
      ];
    }

    if (interests && interests.length > 0) {
      query.hobbies = { $in: interests };
    }

    const skip = (page - 1) * limit;

    const profiles = await User.find(query)
      .select('-password -linkedWallet -email -mobile -address.street -address.pincode')
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await User.countDocuments(query);

    res.status(200).json({
      profiles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search profiles error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}