import pool from '../../../../utils/mysql';
import { verifyToken } from '../../../../utils/auth';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await verifyToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { coins, withdrawalMethod, accountDetails } = req.body;
    if (!coins || coins <= 0) return res.status(400).json({ message: 'Invalid coin amount' });
    if (!withdrawalMethod || !accountDetails) return res.status(400).json({ message: 'Withdrawal details required' });

    const MIN_WITHDRAWAL = 500;
    if (coins < MIN_WITHDRAWAL) return res.status(400).json({ message: `Minimum withdrawal is ${MIN_WITHDRAWAL} coins` });

    const [uRows] = await pool.query('SELECT coins, linkedWallet FROM users WHERE id = ?', [user.userId]);
    const currentUser = uRows[0];
    if (currentUser.coins < coins) return res.status(400).json({ message: 'Insufficient coins' });

    const linkedWallet = typeof currentUser.linkedWallet === 'string' ? JSON.parse(currentUser.linkedWallet) : currentUser.linkedWallet;
    if (!linkedWallet || (!linkedWallet.paytmNumber && !linkedWallet.upiId && !linkedWallet.bankAccount)) {
      return res.status(400).json({ message: 'Please link your wallet first' });
    }

    const platformFeePercent = 2;
    const platformFee = Math.ceil((coins * platformFeePercent) / 100);
    const netAmount = coins - platformFee;
    const txId = randomUUID();
    const withdrawalDetails = { method: withdrawalMethod, accountDetails };

    await pool.query(`
      INSERT INTO transactions (id, userId, type, amount, coins, paymentMethod, platformFee, netAmount, withdrawalDetails, status, description)
      VALUES (?, ?, 'withdrawal', ?, ?, ?, ?, ?, ?, 'pending', ?)
    `, [txId, user.userId, netAmount, -coins, withdrawalMethod, platformFee, netAmount, JSON.stringify(withdrawalDetails), `Withdrawal of ${coins} coins`]);

    await pool.query('UPDATE users SET coins = coins - ? WHERE id = ?', [coins, user.userId]);
    const [txRows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [txId]);

    res.status(200).json({
      message: 'Withdrawal request submitted successfully',
      transaction: txRows[0],
      platformFee,
      netAmount
    });
  } catch (error) {
    console.error('Withdraw coins error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}