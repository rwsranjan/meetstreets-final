import pool from '../../../../utils/mysql';
import { verifyToken } from '../../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await verifyToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const [uRows] = await pool.query('SELECT * FROM users WHERE id = ?', [user.userId]);
    const currentUser = uRows[0];
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    const [matchCountRows] = await pool.query(`
      SELECT COUNT(*) as count FROM matches 
      WHERE (user1Id = ? OR user2Id = ?) AND status = 'matched'
    `, [user.userId, user.userId]);
    const totalMatches = matchCountRows[0].count;

    const [recentMatches] = await pool.query(`
      SELECT * FROM matches 
      WHERE (user1Id = ? OR user2Id = ?) AND status = 'matched'
      ORDER BY matchedAt DESC LIMIT 5
    `, [user.userId, user.userId]);

    const formattedMatches = [];
    for (const match of recentMatches) {
      const otherUserId = match.user1Id === user.userId ? match.user2Id : match.user1Id;
      const [ouRows] = await pool.query('SELECT id as _id, profileName, address, hobbies, profilePictures FROM users WHERE id = ?', [otherUserId]);
      if (ouRows.length > 0) {
        const u = ouRows[0];
        u.profilePictures = typeof u.profilePictures === 'string' ? JSON.parse(u.profilePictures) : u.profilePictures;
        u.address = typeof u.address === 'string' ? JSON.parse(u.address) : u.address;
        u.hobbies = typeof u.hobbies === 'string' ? JSON.parse(u.hobbies) : u.hobbies;
        formattedMatches.push({
          _id: match.id,
          user: u,
          aiMatchScore: match.aiMatchScore,
          commonInterests: typeof match.commonInterests === 'string' ? JSON.parse(match.commonInterests) : match.commonInterests,
          matchedAt: match.matchedAt
        });
      }
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startStr = startOfMonth.toISOString().slice(0, 19).replace('T', ' ');

    const [meetCountRows] = await pool.query(`
      SELECT COUNT(*) as count FROM meetings 
      WHERE JSON_CONTAINS(participants, ?) AND createdAt >= ? AND status IN ('completed', 'in-progress', 'accepted')
    `, [JSON.stringify(user.userId), startStr]);
    const totalMeetings = meetCountRows[0].count;

    const [upcomingMeetings] = await pool.query(`
      SELECT * FROM meetings 
      WHERE JSON_CONTAINS(participants, ?) AND status IN ('proposed', 'accepted') AND scheduledDate >= NOW()
      ORDER BY scheduledDate ASC LIMIT 3
    `, [JSON.stringify(user.userId)]);

    for (const meeting of upcomingMeetings) {
      meeting.participants = typeof meeting.participants === 'string' ? JSON.parse(meeting.participants) : meeting.participants;
    }

    let nearbyUsers = [];

    // Calculate Profile Completion
    let completion = 25; // Base 25% for registration fields (name, email, age, gender, purpose)
    
    // Parse JSON safely for checks
    const parseSafeArray = (val) => {
      try { return typeof val === 'string' ? JSON.parse(val) : (val || []); } catch { return []; }
    };
    const parseSafeObj = (val) => {
      try { return typeof val === 'string' ? JSON.parse(val) : (val || {}); } catch { return {}; }
    };

    if (parseSafeArray(currentUser.profilePictures).length > 0) completion += 20; // 45%

    const address = parseSafeObj(currentUser.address);
    if (address.city || address.locality || address.country) completion += 10; // 55%

    const fields = [
      'height', 'ethnicBackground', 'education', 'degreeType',
      'exerciseHabits', 'eatingHabits', 'wantKids', 'religiousBeliefs'
    ];
    fields.forEach(f => { if (currentUser[f]) completion += 3; }); // up to 24% -> 79%

    const arrays = ['hobbies', 'favoriteFood', 'favoriteMusic'];
    arrays.forEach(f => { if (parseSafeArray(currentUser[f]).length > 0) completion += 4; }); // up to 12% -> 91%

    const meta = parseSafeObj(currentUser.interestsMeta);
    if (meta.favoritePlaceToMeet) completion += 4;
    if (meta.travelerType) completion += 5; // up to 100%

    if (completion > 100) completion = 100;

    const stats = {
      totalMatches,
      totalMeetings,
      qualityScore: 0,
      coins: currentUser.coins || 0,
      profileCompletion: Math.round(completion), 
      upcomingMeetings
    };

    res.status(200).json({
      stats,
      recentMatches: formattedMatches,
      nearbyUsers
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}