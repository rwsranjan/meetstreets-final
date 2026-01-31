 
import dbConnect from '../../../../lib/mongodb';
import Transaction from '../../../../models/Transaction';
import { verifyToken } from '../../../../utils/auth';


export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const user = await verifyToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { page = 1, limit = 20, type } = req.query;
    const skip = (page - 1) * limit;

    const query = { user: user.userId };
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('relatedUser', 'profileName')
      .lean();

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}