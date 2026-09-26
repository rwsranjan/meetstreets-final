import pool from '../../../../utils/mysql';
import { verifyToken } from '../../../../utils/auth';
import { calculateAIMatchScore } from '../../../../utils/Matchingalgorithm';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      city, locality, distance, latitude, longitude,
      ageRange, gender, interests, purposeOnApp,
      page = 1, limit = 20
    } = req.body;

    const [uRows] = await pool.query('SELECT * FROM users WHERE id = ?', [user.userId]);
    const currentUser = uRows[0] || {};
    if (currentUser.address) currentUser.address = typeof currentUser.address === 'string' ? JSON.parse(currentUser.address) : currentUser.address;
    if (currentUser.hobbies) currentUser.hobbies = typeof currentUser.hobbies === 'string' ? JSON.parse(currentUser.hobbies) : currentUser.hobbies;

    const skip = (page - 1) * limit;
    
    // We will build a dynamic SQL query
    let sql = 'SELECT * FROM users WHERE id != ? AND isActive = true AND isBanned = false';
    let countSql = 'SELECT COUNT(*) as count FROM users WHERE id != ? AND isActive = true AND isBanned = false';
    let params = [user.userId];
    let countParams = [user.userId];

    if (city) {
      sql += ' AND JSON_EXTRACT(address, "$.city") LIKE ?';
      countSql += ' AND JSON_EXTRACT(address, "$.city") LIKE ?';
      params.push(`%${city}%`);
      countParams.push(`%${city}%`);
      
      if (locality) {
        sql += ' AND JSON_EXTRACT(address, "$.locality") LIKE ?';
        countSql += ' AND JSON_EXTRACT(address, "$.locality") LIKE ?';
        params.push(`%${locality}%`);
        countParams.push(`%${locality}%`);
      }
    }

    if (ageRange) {
      sql += ' AND ageRange = ?';
      countSql += ' AND ageRange = ?';
      params.push(ageRange);
      countParams.push(ageRange);
    }

    if (gender && gender !== 'all') {
      sql += ' AND gender = ?';
      countSql += ' AND gender = ?';
      params.push(gender);
      countParams.push(gender);
    }

    if (purposeOnApp) {
      sql += ' AND (purposeOnApp = ? OR purposeOnApp = "both")';
      countSql += ' AND (purposeOnApp = ? OR purposeOnApp = "both")';
      params.push(purposeOnApp);
      countParams.push(purposeOnApp);
    }

    if (interests && interests.length > 0) {
      const orClauses = interests.map(() => 'JSON_CONTAINS(hobbies, JSON_QUOTE(?))').join(' OR ');
      sql += ` AND (${orClauses})`;
      countSql += ` AND (${orClauses})`;
      interests.forEach(interest => {
        params.push(interest);
        countParams.push(interest);
      });
    }

    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(skip));

    const [profiles] = await pool.query(sql, params);
    const [countRows] = await pool.query(countSql, countParams);
    const total = countRows[0].count;

    const sanitizedProfiles = profiles.map(p => {
      delete p.password;
      delete p.email;
      delete p.mobile;
      if (p.address) {
        let addr = typeof p.address === 'string' ? JSON.parse(p.address) : p.address;
        delete addr.street;
        delete addr.pincode;
        delete addr.coordinates;
        p.address = addr;
      }
      if (p.profilePictures) p.profilePictures = typeof p.profilePictures === 'string' ? JSON.parse(p.profilePictures) : p.profilePictures;
      if (p.hobbies) p.hobbies = typeof p.hobbies === 'string' ? JSON.parse(p.hobbies) : p.hobbies;
      
      p.aiMatchScore = calculateAIMatchScore(currentUser, p);
      
      return p;
    });

    res.status(200).json({
      profiles: sanitizedProfiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search profiles error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}