import pool from '../../../../utils/mysql';
import { verifyToken } from '../../../../utils/auth';

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
      city, locality, state, country, latitude, longitude,
      height, ethnicBackground, education, degreeType,
      wantKids, religiousBeliefs, exerciseHabits, eatingHabits,
      hobbies, favoriteFood, favoriteMusic, favoriteMovies,
      favoritePlaceToMeet, travelerType, profilePictures
    } = req.body;

    const [rows] = await pool.query('SELECT address, interestsMeta FROM users WHERE id = ?', [user.userId]);
    let addressObj = {};
    let interestsMetaObj = {};
    if (rows.length > 0) {
      addressObj = typeof rows[0].address === 'string' ? JSON.parse(rows[0].address) || {} : rows[0].address || {};
      interestsMetaObj = typeof rows[0].interestsMeta === 'string' ? JSON.parse(rows[0].interestsMeta) || {} : rows[0].interestsMeta || {};
    }

    const newAddress = {
      ...addressObj,
      city, locality, state, country,
      ...(latitude && longitude ? { coordinates: { type: 'Point', coordinates: [longitude, latitude] } } : {})
    };

    const newInterestsMeta = {
      ...interestsMetaObj,
      favoritePlaceToMeet,
      travelerType
    };

    const newProfilePictures = profilePictures?.map((url, index) => ({
      url,
      isPrimary: index === 0,
      uploadedAt: new Date().toISOString()
    })) || [];

    await pool.query(`
      UPDATE users SET 
        address = ?, height = ?, ethnicBackground = ?, education = ?, degreeType = ?,
        wantKids = ?, religiousBeliefs = ?, exerciseHabits = ?, eatingHabits = ?,
        hobbies = ?, favoriteFood = ?, favoriteMusic = ?, favoriteMovies = ?,
        interestsMeta = ?, profilePictures = ?
      WHERE id = ?
    `, [
      JSON.stringify(newAddress), height, ethnicBackground, education, degreeType,
      wantKids, religiousBeliefs, exerciseHabits, eatingHabits,
      JSON.stringify(hobbies || []), JSON.stringify(favoriteFood || []), JSON.stringify(favoriteMusic || []), JSON.stringify(favoriteMovies || []),
      JSON.stringify(newInterestsMeta), JSON.stringify(newProfilePictures),
      user.userId
    ]);

    const [updatedRows] = await pool.query('SELECT * FROM users WHERE id = ?', [user.userId]);
    const updatedUser = updatedRows[0];
    delete updatedUser.password;

    res.status(200).json({
      message: 'Profile completed successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}