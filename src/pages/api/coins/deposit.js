import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Transaction from '../../../../models/Transaction';
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

    const { amount, paymentMethod, paymentId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    if (!paymentMethod || !paymentId) {
      return res.status(400).json({ message: 'Payment details required' });
    }

    // Convert amount to coins (1 INR = 1 coin)
    const coins = amount;

    // No fee on deposit
    const platformFee = 0;

    // Create transaction
    const transaction = await Transaction.create({
      user: user.userId,
      type: 'deposit',
      amount,
      coins,
      paymentMethod,
      paymentId,
      platformFee,
      netAmount: amount,
      status: 'pending',
      description: `Deposit of ${coins} coins`
    });

    // TODO: Verify payment with payment gateway

    // For now, mark as completed and credit coins
    transaction.status = 'completed';
    transaction.paymentStatus = 'completed';
    await transaction.save();

    // Credit coins to user
    await User.findByIdAndUpdate(user.userId, {
      $inc: { coins }
    });

    res.status(200).json({
      message: 'Coins deposited successfully',
      transaction,
      coins
    });
  } catch (error) {
    console.error('Deposit coins error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}