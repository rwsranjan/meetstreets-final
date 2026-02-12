import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
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
    await dbConnect();

    const authUser = await verifyToken(req);
    if (!authUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await runMiddleware(req, res, upload.array('photos', 6));

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Get current user to determine primary image logic
    const existingUser = await User.findById(authUser.userId);

    const imageObjects = req.files.map((file, index) => ({
      url: `/uploads/profiles/${file.filename}`,
      isPrimary:
        existingUser.profilePictures.length === 0 && index === 0,
      uploadedAt: new Date()
    }));

    const updatedUser = await User.findByIdAndUpdate(
      authUser.userId,
      {
        $push: {
          profilePictures: { $each: imageObjects }
        }
      },
      { new: true }
    ).select('-password');

    return res.status(200).json({
      message: 'Images uploaded successfully',
      images: updatedUser.profilePictures
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}
