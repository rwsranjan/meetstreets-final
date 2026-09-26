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

    const { amount, paymentMethod, paymentId } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    if (!paymentMethod || !paymentId) return res.status(400).json({ message: 'Payment details required' });

    const coins = amount;
    const platformFee = 0;
    const txId = randomUUID();

    await pool.query(`
      INSERT INTO transactions (id, userId, type, amount, coins, paymentMethod, paymentId, platformFee, netAmount, status, description, paymentStatus)
      VALUES (?, ?, 'deposit', ?, ?, ?, ?, ?, ?, 'completed', ?, 'completed')
    `, [txId, user.userId, amount, coins, paymentMethod, paymentId, platformFee, amount, `Deposit of ${coins} coins`]);

    await pool.query('UPDATE users SET coins = coins + ? WHERE id = ?', [coins, user.userId]);
    const [txRows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [txId]);

    res.status(200).json({
      message: 'Coins deposited successfully',
      transaction: txRows[0],
      coins
    });
  } catch (error) {
    console.error('Deposit coins error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}