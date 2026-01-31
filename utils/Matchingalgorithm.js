/**
 * AI-based matching algorithm to calculate compatibility score
 * between two users
 */

export const calculateAIMatchScore = (user1, user2) => {
  let score = 0;
  let maxScore = 0;

  // Age compatibility (20 points)
  maxScore += 20;
  const ageRanges = ['18-25', '26-30', '31-40', '40-50', '50+'];
  const user1Index = ageRanges.indexOf(user1.ageRange);
  const user2Index = ageRanges.indexOf(user2.ageRange);
  const ageDiff = Math.abs(user1Index - user2Index);
  
  if (ageDiff === 0) score += 20;
  else if (ageDiff === 1) score += 15;
  else if (ageDiff === 2) score += 10;
  else score += 5;

  // Location proximity (15 points)
  maxScore += 15;
  if (user1.address?.city === user2.address?.city) {
    score += 15;
    if (user1.address?.locality === user2.address?.locality) {
      score += 5; // Bonus for same locality
    }
  } else if (user1.address?.state === user2.address?.state) {
    score += 8;
  }

  // Common interests (25 points)
  maxScore += 25;
  const commonHobbies = user1.hobbies?.filter(h => user2.hobbies?.includes(h)) || [];
  score += Math.min(25, commonHobbies.length * 5);

  // Purpose compatibility (20 points)
  maxScore += 20;
  if (
    (user1.purposeOnApp === 'offering-time-company' && user2.purposeOnApp === 'looking-for-time-company') ||
    (user1.purposeOnApp === 'looking-for-time-company' && user2.purposeOnApp === 'offering-time-company') ||
    user1.purposeOnApp === 'both' || user2.purposeOnApp === 'both'
  ) {
    score += 20;
  } else {
    score += 10;
  }

  // Education level (10 points)
  maxScore += 10;
  if (user1.education === user2.education) {
    score += 10;
  } else if (user1.education && user2.education) {
    score += 5;
  }

  // Lifestyle compatibility (10 points)
  maxScore += 10;
  if (user1.eatingHabits === user2.eatingHabits) score += 5;
  if (user1.exerciseHabits === user2.exerciseHabits) score += 5;

  // Calculate percentage
  const percentage = Math.round((score / maxScore) * 100);

  return percentage;
};

/**
 * Generate AI-powered match suggestions for a user
 */
export const generateMatchSuggestions = async (user, allUsers, limit = 10) => {
  const matches = allUsers
    .filter(u => u._id.toString() !== user._id.toString())
    .map(otherUser => ({
      user: otherUser,
      score: calculateAIMatchScore(user, otherUser),
      commonInterests: user.hobbies?.filter(h => otherUser.hobbies?.includes(h)) || []
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return matches;
};

/**
 * Generate first date suggestions based on user profiles
 */
export const generateFirstDateSuggestion = (user1, user2) => {
  const suggestions = [];

  // Based on common interests
  const commonInterests = user1.hobbies?.filter(h => user2.hobbies?.includes(h)) || [];

  if (commonInterests.includes('coffee')) {
    suggestions.push({
      venue: 'Cozy Coffee Shop',
      activity: 'Coffee & Conversation',
      estimatedCost: 500
    });
  }

  if (commonInterests.includes('movies')) {
    suggestions.push({
      venue: 'Cinema',
      activity: 'Movie & Dinner',
      estimatedCost: 1000
    });
  }

  if (commonInterests.includes('travel')) {
    suggestions.push({
      venue: 'Local Tourist Spot',
      activity: 'Day Trip',
      estimatedCost: 1500
    });
  }

  if (commonInterests.includes('food')) {
    suggestions.push({
      venue: 'Popular Restaurant',
      activity: 'Dinner Date',
      estimatedCost: 800
    });
  }

  // Default suggestion
  if (suggestions.length === 0) {
    suggestions.push({
      venue: 'Public Park or Cafe',
      activity: 'Casual Meetup',
      estimatedCost: 300
    });
  }

  // Return random suggestion
  return suggestions[Math.floor(Math.random() * suggestions.length)];
};