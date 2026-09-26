import pool from '../../../../utils/mysql';
import { verifyToken } from '../../../../utils/auth';
import upload from '../../../../lib/multer';

export const config = {
  api: { bodyParser: false }
};

const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => {
    fn(req, res, result => {
      if (result instanceof Error) reject(result);
      resolve(result);
    });
  });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authUser = await verifyToken(req);
    if (!authUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await runMiddleware(req, res, upload.array('photos', 6));

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const [rows] = await pool.query('SELECT profilePictures FROM users WHERE id = ?', [authUser.userId]);
    const existingUser = rows[0];
    
    let profilePictures = [];
    if (existingUser && existingUser.profilePictures) {
      profilePictures = typeof existingUser.profilePictures === 'string' ? JSON.parse(existingUser.profilePictures) : existingUser.profilePictures;
    }

    const imageObjects = req.files.map((file, index) => ({
      url: `/uploads/profiles/${file.filename}`,
      isPrimary: profilePictures.length === 0 && index === 0,
      uploadedAt: new Date().toISOString()
    }));

    const newProfilePictures = [...profilePictures, ...imageObjects];

    await pool.query('UPDATE users SET profilePictures = ? WHERE id = ?', [JSON.stringify(newProfilePictures), authUser.userId]);

    return res.status(200).json({
      message: 'Images uploaded successfully',
      images: newProfilePictures
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}
