CREATE DATABASE IF NOT EXISTS meetstreets;
USE meetstreets;

-- =====================
-- Users Table
-- =====================
CREATE TABLE Users (
  id VARCHAR(36) PRIMARY KEY, -- Replacing ObjectId
  email VARCHAR(255) NOT NULL UNIQUE,
  mobile VARCHAR(20) UNIQUE,
  password VARCHAR(255),
  googleId VARCHAR(255),
  facebookId VARCHAR(255),
  
  profileName VARCHAR(255) NOT NULL,
  age INT NOT NULL,
  showAge BOOLEAN DEFAULT true,
  gender ENUM('male', 'female', 'non-binary', 'prefer-not-to-say', 'other') NOT NULL,
  
  address JSON, -- { street, city, locality, state, country, pincode, coordinates: {type, coordinates: [lng, lat]} }
  
  height VARCHAR(50),
  ethnicBackground VARCHAR(100),
  
  education ENUM('high-school', 'bachelors', 'masters', 'phd', 'other'),
  degreeType VARCHAR(100),
  
  lookingFor ENUM('long-term', 'casual', 'not-sure', 'marriage', 'friendship', 'travel-companion'),
  wantKids ENUM('yes', 'no', 'maybe', 'have-kids'),
  
  religiousBeliefs VARCHAR(100),
  exerciseHabits ENUM('daily', 'weekly', 'occasionally', 'never'),
  eatingHabits ENUM('vegetarian', 'vegan', 'non-vegetarian', 'pescatarian', 'other'),
  
  hobbies JSON, -- [String]
  politicalViews VARCHAR(100),
  favoriteFood JSON,
  favoriteMusic JSON,
  favoriteMovies JSON,
  favoriteTVShows JSON,
  favoriteBooks JSON,
  
  profilePictures JSON, -- [{url, isPrimary, uploadedAt}]
  profileVideo JSON, -- {url, uploadedAt}
  
  ageRange ENUM('18-25', '26-30', '31-40', '40-50', '50+'),
  interestsMeta JSON, -- {favoritePlaceToMeet, travelerType}
  purposeOnApp ENUM('offering-time-company', 'looking-for-time-company', 'both'),
  
  isKYCVerified BOOLEAN DEFAULT false,
  
  subscriptionType ENUM('free', 'regular', 'premium') DEFAULT 'free',
  subscriptionExpiry DATETIME,
  
  coins INT DEFAULT 0,
  welcomePoints INT DEFAULT 100,
  referralCode VARCHAR(50) UNIQUE,
  referredBy VARCHAR(36),
  totalReferrals INT DEFAULT 0,
  
  isActive BOOLEAN DEFAULT true,
  isOnline BOOLEAN DEFAULT false,
  lastSeen DATETIME,
  
  isBanned BOOLEAN DEFAULT false,
  banReason TEXT,
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (referredBy) REFERENCES Users(id) ON DELETE SET NULL
);

-- =====================
-- Conversations Table
-- =====================
CREATE TABLE Conversations (
  id VARCHAR(36) PRIMARY KEY,
  participants JSON NOT NULL, -- Array of User IDs
  lastMessageId VARCHAR(36),
  lastMessageAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  unreadCount JSON, -- [{userId, count}]
  typing JSON, -- [{userId, isTyping}]
  archived JSON, -- [User IDs]
  muted JSON, -- [User IDs]
  isActive BOOLEAN DEFAULT true,
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================
-- Messages Table
-- =====================
CREATE TABLE Messages (
  id VARCHAR(36) PRIMARY KEY,
  conversationId VARCHAR(36) NOT NULL,
  senderId VARCHAR(36) NOT NULL,
  receiverId VARCHAR(36) NOT NULL,
  
  messageType ENUM('text', 'image', 'video', 'audio', 'file', 'coin-offer', 'meet-request') DEFAULT 'text',
  content TEXT,
  
  mediaUrl VARCHAR(255),
  mediaType VARCHAR(50),
  mediaThumbnail VARCHAR(255),
  
  aiSuggestion BOOLEAN DEFAULT false,
  
  coinOffer JSON, -- {amount, purpose}
  meetRequestId VARCHAR(36), -- Ref to Meeting
  
  delivered BOOLEAN DEFAULT false,
  deliveredAt DATETIME,
  readStatus BOOLEAN DEFAULT false,
  readAt DATETIME,
  
  deletedBy JSON, -- [User IDs]
  isDeleted BOOLEAN DEFAULT false,
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (conversationId) REFERENCES Conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (senderId) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiverId) REFERENCES Users(id) ON DELETE CASCADE
);

-- =====================
-- Matches Table
-- =====================
CREATE TABLE Matches (
  id VARCHAR(36) PRIMARY KEY,
  user1Id VARCHAR(36) NOT NULL,
  user2Id VARCHAR(36) NOT NULL,
  status ENUM('pending', 'accepted', 'declined', 'matched') DEFAULT 'pending',
  initiatedById VARCHAR(36) NOT NULL,
  
  aiMatchScore INT,
  commonInterests JSON, -- [String]
  
  requestMessage TEXT,
  responseMessage TEXT,
  
  requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  respondedAt DATETIME,
  matchedAt DATETIME,
  
  hasMet BOOLEAN DEFAULT false,
  meetDetailsId VARCHAR(36), -- Ref to Meeting
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE(user1Id, user2Id),
  FOREIGN KEY (user1Id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (user2Id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (initiatedById) REFERENCES Users(id) ON DELETE CASCADE
);

-- =====================
-- Meetings Table
-- =====================
CREATE TABLE Meetings (
  id VARCHAR(36) PRIMARY KEY,
  participants JSON NOT NULL, -- Array of User IDs
  meetingType ENUM('coffee', 'movie', 'travel', 'transit-company', 'online-chat', 'online-video') NOT NULL,
  
  location JSON, -- {name, address, city, coordinates}
  
  scheduledDate DATETIME,
  actualMeetDate DATETIME,
  duration INT,
  
  coinsOffered JSON, -- {offeredById, amount}
  coinsAccepted JSON, -- {acceptedById, amount}
  
  status ENUM('proposed', 'accepted', 'rejected', 'completed', 'cancelled', 'in-progress') DEFAULT 'proposed',
  
  completed BOOLEAN DEFAULT false,
  completedAt DATETIME,
  
  ratings JSON, -- [{ratedById, ratedToId, rating, feedback, createdAt}]
  
  firstDateSuggestion JSON, -- {venue, activity, estimatedCost}
  transactionId VARCHAR(36), -- Ref to Transaction
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================
-- Events Table
-- =====================
CREATE TABLE Events (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  organizerId VARCHAR(36) NOT NULL,
  
  eventType ENUM('coffee-meetup', 'group-hangout', 'travel-group', 'movie-night', 'sports', 'workshop', 'other') NOT NULL,
  
  location JSON, -- {name, address, city, coordinates}
  
  eventDate DATETIME NOT NULL,
  eventTime VARCHAR(50),
  duration INT,
  
  maxParticipants INT,
  participants JSON, -- [{userId, joinedAt, status}]
  
  entryCoins INT DEFAULT 0,
  
  coverImage VARCHAR(255),
  images JSON, -- [String]
  
  status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
  tags JSON, -- [String]
  isPrivate BOOLEAN DEFAULT false,
  isFeatured BOOLEAN DEFAULT false,
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (organizerId) REFERENCES Users(id) ON DELETE CASCADE
);

-- =====================
-- Transactions Table
-- =====================
CREATE TABLE Transactions (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  type ENUM('deposit', 'withdrawal', 'meet-payment', 'meet-received', 'referral-bonus', 'welcome-bonus', 'subscription-payment', 'admin-credit', 'admin-debit') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  coins INT NOT NULL,
  
  relatedMeetingId VARCHAR(36),
  relatedUserId VARCHAR(36),
  
  paymentMethod ENUM('paytm', 'upi', 'bank-transfer', 'coins-only'),
  paymentId VARCHAR(255),
  paymentStatus ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  
  platformFee DECIMAL(10, 2) DEFAULT 0,
  netAmount DECIMAL(10, 2),
  
  withdrawalDetails JSON, -- {method, accountDetails, processedAt, transactionId}
  
  status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  description TEXT,
  adminNotes TEXT,
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- =====================
-- Reports Table
-- =====================
CREATE TABLE Reports (
  id VARCHAR(36) PRIMARY KEY,
  reporterId VARCHAR(36) NOT NULL,
  reportedUserId VARCHAR(36) NOT NULL,
  reportType ENUM('inappropriate-behavior', 'harassment', 'fake-profile', 'spam', 'safety-concern', 'scam', 'inappropriate-content', 'other') NOT NULL,
  
  description TEXT NOT NULL,
  screenshots JSON, -- [String]
  relatedMessages JSON, -- [Message IDs]
  
  status ENUM('pending', 'under-review', 'resolved', 'dismissed') DEFAULT 'pending',
  
  reviewedById VARCHAR(36), -- Admin ID
  reviewedAt DATETIME,
  adminNotes TEXT,
  actionTaken ENUM('none', 'warning', 'temporary-ban', 'permanent-ban', 'profile-removal'),
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (reporterId) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (reportedUserId) REFERENCES Users(id) ON DELETE CASCADE
);
