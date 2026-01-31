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

    const { coins, withdrawalMethod, accountDetails } = req.body;

    if (!coins || coins <= 0) {
      return res.status(400).json({ message: 'Invalid coin amount' });
    }

    if (!withdrawalMethod || !accountDetails) {
      return res.status(400).json({ message: 'Withdrawal details required' });
    }

    // Minimum withdrawal limit
    const MIN_WITHDRAWAL = 500;
    if (coins < MIN_WITHDRAWAL) {
      return res.status(400).json({ 
        message: `Minimum withdrawal is ${MIN_WITHDRAWAL} coins` 
      });
    }

    const currentUser = await User.findById(user.userId);

    // Check if user has enough coins
    if (currentUser.coins < coins) {
      return res.status(400).json({ message: 'Insufficient coins' });
    }

    // Check if wallet is linked
    if (!currentUser.linkedWallet || 
        (!currentUser.linkedWallet.paytmNumber && 
         !currentUser.linkedWallet.upiId && 
         !currentUser.linkedWallet.bankAccount)) {
      return res.status(400).json({ message: 'Please link your wallet first' });
    }

    // Calculate platform fee (2% for withdrawals)
    const platformFeePercent = 2;
    const platformFee = Math.ceil((coins * platformFeePercent) / 100);
    const netAmount = coins - platformFee;

    // Create transaction
    const transaction = await Transaction.create({
      user: user.userId,
      type: 'withdrawal',
      amount: netAmount,
      coins: -coins,
      paymentMethod: withdrawalMethod,
      platformFee,
      netAmount,
      withdrawalDetails: {
        method: withdrawalMethod,
        accountDetails
      },
      status: 'pending',
      description: `Withdrawal of ${coins} coins`
    });

    // Deduct coins from user
    currentUser.coins -= coins;
    await currentUser.save();

    // TODO: Process withdrawal through payment gateway

    res.status(200).json({
      message: 'Withdrawal request submitted successfully',
      transaction,
      platformFee,
      netAmount
    });
  } catch (error) {
    console.error('Withdraw coins error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}