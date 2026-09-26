import pool from '../../../../utils/mysql';
import { verifyToken } from '../../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authUser = await verifyToken(req);
    if (!authUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [authUser.userId]);
    const currentUser = rows[0];
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Parse JSON arrays for current user
    const parseJson = (val) => typeof val === 'string' ? JSON.parse(val) : (val || []);
    currentUser.hobbies = parseJson(currentUser.hobbies);
    currentUser.favoriteFood = parseJson(currentUser.favoriteFood);
    currentUser.favoriteMusic = parseJson(currentUser.favoriteMusic);
    currentUser.favoriteMovies = parseJson(currentUser.favoriteMovies);
    currentUser.profilePictures = parseJson(currentUser.profilePictures);
    currentUser.interestsMeta = parseJson(currentUser.interestsMeta);
    currentUser.favoriteTVShows = parseJson(currentUser.favoriteTVShows);
    currentUser.favoriteBooks = parseJson(currentUser.favoriteBooks);
    currentUser.profileVideo = typeof currentUser.profileVideo === 'string' ? JSON.parse(currentUser.profileVideo) : (currentUser.profileVideo || null);
    currentUser.address = typeof currentUser.address === 'string' ? JSON.parse(currentUser.address) : (currentUser.address || {});

    const data = { ...req.body };

    const protectedFields = [
      'email', 'mobile', 'password', 'coins', 'welcomePoints',
      'referralCode', 'subscriptionType', 'age', 'gender'
    ];
    protectedFields.forEach(f => delete data[f]);

    const address = { ...currentUser.address, ...(data.address || {}) };
    delete data.address;

    const safeArrays = {
      hobbies: Array.isArray(data.hobbies) ? data.hobbies : currentUser.hobbies,
      favoriteFood: Array.isArray(data.favoriteFood) ? data.favoriteFood : currentUser.favoriteFood,
      favoriteMusic: Array.isArray(data.favoriteMusic) ? data.favoriteMusic : currentUser.favoriteMusic,
      favoriteMovies: Array.isArray(data.favoriteMovies) ? data.favoriteMovies : currentUser.favoriteMovies,
      favoriteTVShows: Array.isArray(data.favoriteTVShows) ? data.favoriteTVShows : currentUser.favoriteTVShows,
      favoriteBooks: Array.isArray(data.favoriteBooks) ? data.favoriteBooks : currentUser.favoriteBooks,
      profilePictures: Array.isArray(data.profilePictures) ? data.profilePictures.slice(0, 6) : currentUser.profilePictures
    };

    const interestsMeta = {
      ...(currentUser.interestsMeta || {}),
      ...(data.interestsMeta || {}),
      ...(data.favoritePlaceToMeet !== undefined ? { favoritePlaceToMeet: data.favoritePlaceToMeet } : {}),
      ...(data.travelerType !== undefined ? { travelerType: data.travelerType } : {})
    };
    const profileVideo = data.profileVideo !== undefined ? data.profileVideo : currentUser.profileVideo;

    delete data.hobbies;
    delete data.favoriteFood;
    delete data.favoriteMusic;
    delete data.favoriteMovies;
    delete data.favoriteTVShows;
    delete data.favoriteBooks;
    delete data.profilePictures;
    delete data.interestsMeta;
    delete data.profileVideo;
    delete data.favoritePlaceToMeet;
    delete data.travelerType;

    const updatePayload = {
      ...data,
      address: JSON.stringify(address),
      hobbies: JSON.stringify(safeArrays.hobbies),
      favoriteFood: JSON.stringify(safeArrays.favoriteFood),
      favoriteMusic: JSON.stringify(safeArrays.favoriteMusic),
      favoriteMovies: JSON.stringify(safeArrays.favoriteMovies),
      favoriteTVShows: JSON.stringify(safeArrays.favoriteTVShows || []),
      favoriteBooks: JSON.stringify(safeArrays.favoriteBooks || []),
      profilePictures: JSON.stringify(safeArrays.profilePictures),
      interestsMeta: JSON.stringify(interestsMeta || {}),
      profileVideo: profileVideo ? JSON.stringify(profileVideo) : null
    };

    const keys = Object.keys(updatePayload);
    const values = Object.values(updatePayload);
    
    if (keys.length > 0) {
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, authUser.userId]);
    }

    const [updatedRows] = await pool.query('SELECT * FROM users WHERE id = ?', [authUser.userId]);
    const updatedUser = updatedRows[0];
    delete updatedUser.password;

    const jsonFields = ['address', 'hobbies', 'favoriteFood', 'favoriteMusic', 'favoriteMovies', 'favoriteTVShows', 'favoriteBooks', 'profilePictures', 'profileVideo', 'interestsMeta'];
    jsonFields.forEach(field => {
      if (typeof updatedUser[field] === 'string') {
        try { updatedUser[field] = JSON.parse(updatedUser[field]); } catch(e) {}
      }
    });

    if (updatedUser.interestsMeta) {
      Object.assign(updatedUser, updatedUser.interestsMeta);
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
