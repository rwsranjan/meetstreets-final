import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { verifyToken } from '../../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const user = await verifyToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const userData = await User.findById(user.userId).select('coins welcomePoints');
    
    res.status(200).json({
      coins: userData.coins || 0,
      welcomePoints: userData.welcomePoints || 0,
      totalBalance: (userData.coins || 0) + (userData.welcomePoints || 0)
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}