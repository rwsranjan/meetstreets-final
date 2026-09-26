import pool from '../../../../utils/mysql';
import { verifyToken } from '../../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await verifyToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { page = 1, limit = 20, type } = req.query;
    const skip = (page - 1) * limit;

    let sql = 'SELECT * FROM transactions WHERE userId = ?';
    let params = [user.userId];
    let countSql = 'SELECT COUNT(*) as count FROM transactions WHERE userId = ?';
    let countParams = [user.userId];

    if (type) {
      sql += ' AND type = ?';
      countSql += ' AND type = ?';
      params.push(type);
      countParams.push(type);
    }

    sql += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), skip);

    const [transactions] = await pool.query(sql, params);
    const [countRows] = await pool.query(countSql, countParams);
    const total = countRows[0].count;

    for (let tx of transactions) {
      if (tx.relatedUserId) {
        const [uRows] = await pool.query('SELECT profileName FROM users WHERE id = ?', [tx.relatedUserId]);
        if (uRows.length > 0) {
          tx.relatedUser = { _id: tx.relatedUserId, profileName: uRows[0].profileName };
        }
      }
    }

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