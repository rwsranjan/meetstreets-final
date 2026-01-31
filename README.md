This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
# MeetStreet - Complete Project Structure & Implementation Guide

## Project Overview
MeetStreet is a social connection platform where users earn coins/points for meeting others, traveling together, watching movies, or providing company. It's NOT a dating app - it's a platform for genuine social connections with a reward system.

## ✅ Completed Components

### Models (MongoDB Schemas)
1. ✅ User.js - Complete user profile with authentication, KYC, coins, location
2. ✅ Match.js - Match requests and AI-based compatibility
3. ✅ Meeting.js - Meeting details, coins exchange, ratings
4. ✅ Transaction.js - All financial transactions
5. ✅ Message.js - Chat messages between users
6. ✅ Conversation.js - Conversation threads
7. ✅ Event.js - Group events and meetups
8. ✅ Report.js - User reports and moderation

### API Routes (Completed)
1. ✅ /api/auth/register.js - User registration with referral
2. ✅ /api/auth/login.js - Email/password login
3. ✅ /api/auth/social-login.js - Google/Facebook login
4. ✅ /api/profile/index.js - Get user profile
5. ✅ /api/profile/update.js - Update profile
6. ✅ /api/search/profiles.js - Search users by location, interests
7. ✅ /api/match/request.js - Send match request
8. ✅ /api/match/respond.js - Accept/decline match
9. ✅ /api/meeting/create.js - Create meeting proposal
10. ✅ /api/meeting/complete.js - Complete meeting & transfer coins
11. ✅ /api/coins/deposit.js - Deposit coins (no fee)
12. ✅ /api/coins/withdraw.js - Withdraw coins (2% fee)

### Utilities
1. ✅ lib/mongodb.js - Database connection
2. ✅ lib/auth.js - JWT token verification
3. ✅ lib/matchingAlgorithm.js - AI matching score calculation

### Pages
1. ✅ pages/login.js - Login page with social auth

---

## 📋 Required Pages (To Be Created)

### Authentication Pages
1. **pages/register.js**
   - Multi-step registration form
   - Email/mobile/social login options
   - Age verification (18+)
   - Referral code input
   - Purpose selection (offering/looking for company)

2. **pages/complete-profile.js**
   - For social login users
   - Complete profile information
   - Physical appearance, education, interests
   - Profile pictures upload

3. **pages/forgot-password.js**
   - Password reset request
   - OTP verification

### Main Application Pages
4. **pages/dashboard.js**
   - User statistics (coins, meets, quality score)
   - Quick actions
   - Nearby users
   - Match suggestions
   - Recent activity feed

5. **pages/explore.js**
   - Browse profiles
   - Advanced filters (location, age, interests, purpose)
   - Map view of nearby users
   - AI match suggestions

6. **pages/profile/[userId].js**
   - View other user's profile
   - Send match request
   - Add to favorites
   - Report/block user
   - Show compatibility score

7. **pages/my-profile.js**
   - Edit own profile
   - Upload photos/video
   - Manage privacy settings
   - View performance metrics
   - Subscription management

8. **pages/matches.js**
   - Pending match requests (received)
   - Sent match requests
   - Accepted matches
   - Match suggestions with AI scores

9. **pages/messages/index.js**
   - List of conversations
   - Unread count
   - Search conversations
   - Archive/delete options

10. **pages/messages/[conversationId].js**
    - Chat interface (text, voice, video)
    - Send coin offers
    - Propose meetings
    - AI chat suggestions
    - Share location

11. **pages/meetings/index.js**
    - Upcoming meetings
    - Past meetings
    - Meeting proposals
    - Calendar view

12. **pages/meetings/[meetingId].js**
    - Meeting details
    - Accept/decline proposal
    - Complete meeting & rate
    - View location on map

13. **pages/events/index.js**
    - Browse public events
    - Filter by type, location, date
    - Featured events
    - Create event button

14. **pages/events/[eventId].js**
    - Event details
    - Join/leave event
    - Participant list
    - Event chat
    - Pay entry coins

15. **pages/events/create.js**
    - Create new event
    - Set location, date, time
    - Set max participants
    - Entry coins (optional)

16. **pages/wallet.js**
    - Current coin balance
    - Transaction history
    - Deposit coins
    - Withdraw coins (with fee info)
    - Link Paytm/UPI/Bank

17. **pages/subscription.js**
    - Compare plans (Free/Regular/Premium)
    - Current plan details
    - Upgrade/downgrade
    - Payment options

18. **pages/settings.js**
    - Account settings
    - Notification preferences
    - Privacy settings
    - KYC verification
    - Police verification upload
    - Linked accounts
    - Delete account

19. **pages/referrals.js**
    - Share referral code
    - Referral statistics
    - Earned coins from referrals
    - Social share buttons

20. **pages/favorites.js**
    - List of favorite profiles
    - Quick actions

21. **pages/blocked-users.js**
    - List of blocked users
    - Unblock option

---

## 📋 Required API Routes (To Be Created)

### Authentication APIs
1. **/api/auth/verify-otp.js** - Verify OTP for mobile login
2. **/api/auth/send-otp.js** - Send OTP to mobile
3. **/api/auth/forgot-password.js** - Password reset request
4. **/api/auth/reset-password.js** - Reset password with token
5. **/api/auth/logout.js** - Logout and clear token

### Profile APIs
6. **/api/profile/upload-photo.js** - Upload profile pictures
7. **/api/profile/upload-video.js** - Upload profile video
8. **/api/profile/delete-photo.js** - Delete profile picture
9. **/api/profile/favorites/add.js** - Add user to favorites
10. **/api/profile/favorites/remove.js** - Remove from favorites
11. **/api/profile/favorites/list.js** - Get favorites list
12. **/api/profile/block.js** - Block user
13. **/api/profile/unblock.js** - Unblock user
14. **/api/profile/report.js** - Report user

### Search & Discovery APIs
15. **/api/search/nearby.js** - Get users within distance
16. **/api/search/suggestions.js** - AI-powered match suggestions
17. **/api/search/top-users.js** - Get top rated users

### Match APIs
18. **/api/match/list.js** - Get all matches (pending, accepted)
19. **/api/match/suggestions.js** - Get AI match suggestions
20. **/api/match/delete.js** - Delete/cancel match request

### Message APIs
21. **/api/messages/conversations.js** - Get all conversations
22. **/api/messages/send.js** - Send message
23. **/api/messages/[conversationId].js** - Get messages in conversation
24. **/api/messages/mark-read.js** - Mark messages as read
25. **/api/messages/delete.js** - Delete message
26. **/api/messages/typing.js** - Update typing indicator

### Meeting APIs
27. **/api/meeting/list.js** - Get all meetings
28. **/api/meeting/respond.js** - Accept/decline meeting
29. **/api/meeting/cancel.js** - Cancel meeting
30. **/api/meeting/rate.js** - Rate after meeting

### Event APIs
31. **/api/events/list.js** - List all events
32. **/api/events/create.js** - Create event
33. **/api/events/[eventId].js** - Get event details
34. **/api/events/join.js** - Join event
35. **/api/events/leave.js** - Leave event
36. **/api/events/participants.js** - Get event participants
37. **/api/events/delete.js** - Delete event (organizer only)

### Wallet & Transaction APIs
38. **/api/wallet/balance.js** - Get current balance
39. **/api/wallet/transactions.js** - Get transaction history
40. **/api/wallet/link.js** - Link Paytm/UPI/Bank account
41. **/api/coins/transfer.js** - Transfer coins to another user
42. **/api/coins/gift.js** - Gift coins during chat

### Subscription APIs
43. **/api/subscription/plans.js** - Get all plans
44. **/api/subscription/upgrade.js** - Upgrade subscription
45. **/api/subscription/cancel.js** - Cancel subscription

### Notification APIs
46. **/api/notifications/list.js** - Get all notifications
47. **/api/notifications/mark-read.js** - Mark notification as read
48. **/api/notifications/settings.js** - Update notification preferences

### KYC & Verification APIs
49. **/api/kyc/upload.js** - Upload KYC documents
50. **/api/kyc/verify.js** - Verify KYC status
51. **/api/police-verification/upload.js** - Upload police verification

### Referral APIs
52. **/api/referral/stats.js** - Get referral statistics
53. **/api/referral/validate.js** - Validate referral code

### Admin APIs (Optional)
54. **/api/admin/users.js** - List all users
55. **/api/admin/reports.js** - View user reports
56. **/api/admin/ban-user.js** - Ban user
57. **/api/admin/verify-kyc.js** - Approve KYC

---

## 🎨 Required Components (To Be Created)

### Layout Components
1. **components/Layout.js** - Main layout wrapper
2. **components/Navbar.js** - Top navigation
3. **components/Sidebar.js** - Side navigation
4. **components/Footer.js** - Footer

### Profile Components
5. **components/ProfileCard.js** - User profile card
6. **components/ProfileGallery.js** - Photo gallery
7. **components/EditProfileForm.js** - Edit profile form
8. **components/MatchScore.js** - Compatibility score display

### Search & Filter Components
9. **components/SearchBar.js** - Search input
10. **components/FilterPanel.js** - Advanced filters
11. **components/MapView.js** - Map with user locations

### Chat Components
12. **components/ChatWindow.js** - Chat interface
13. **components/MessageBubble.js** - Individual message
14. **components/ChatInput.js** - Message input with AI suggestions
15. **components/CoinOfferModal.js** - Send coin offer
16. **components/VideoCall.js** - Video call interface

### Meeting Components
17. **components/MeetingCard.js** - Meeting display card
18. **components/MeetingProposal.js** - Create meeting form
19. **components/RatingModal.js** - Rate meeting experience

### Event Components
20. **components/EventCard.js** - Event display card
21. **components/EventForm.js** - Create/edit event
22. **components/ParticipantList.js** - Event participants

### Wallet Components
23. **components/WalletCard.js** - Balance display
24. **components/TransactionList.js** - Transaction history
25. **components/DepositModal.js** - Deposit coins
26. **components/WithdrawModal.js** - Withdraw coins

### Common Components
27. **components/Button.js** - Reusable button
28. **components/Modal.js** - Modal wrapper
29. **components/Toast.js** - Notification toast
30. **components/Loader.js** - Loading spinner
31. **components/EmptyState.js** - Empty state display
32. **components/SubscriptionBadge.js** - Subscription tier badge

---

## 🔧 Configuration Files Needed

1. **.env.local**
```
MONGODB_URI=mongodb://localhost:27017/meetstreet
JWT_SECRET=your-secret-key-here
NEXT_PUBLIC_API_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
PAYTM_MERCHANT_ID=your-paytm-merchant-id
PAYTM_MERCHANT_KEY=your-paytm-merchant-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
```

2. **package.json** (Required dependencies)
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "mongoose": "^8.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "next-auth": "^4.24.0",
    "socket.io": "^4.6.0",
    "socket.io-client": "^4.6.0",
    "axios": "^1.6.0",
    "swr": "^2.2.0",
    "react-hot-toast": "^2.4.1",
    "framer-motion": "^10.16.0",
    "react-map-gl": "^7.1.0",
    "mapbox-gl": "^3.0.0",
    "date-fns": "^2.30.0",
    "react-datepicker": "^4.21.0",
    "simple-peer": "^9.11.1",
    "cloudinary": "^1.41.0",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.0",
    "twilio": "^4.19.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.3.0"
  }
}
```

3. **tailwind.config.js**
4. **next.config.js**

---

## 🚀 Implementation Priority

### Phase 1 - Core Features (Week 1-2)
- ✅ Authentication (login, register, social)
- ✅ Profile management
- ✅ Search & discovery
- Dashboard
- Profile viewing

### Phase 2 - Matching & Communication (Week 3-4)
- ✅ Match system
- ✅ Chat system
- Video/voice calls
- Notifications

### Phase 3 - Meetings & Coins (Week 5-6)
- ✅ Meeting proposals
- ✅ Coins system
- Wallet integration
- Transaction history

### Phase 4 - Events & Social (Week 7-8)
- ✅ Events system
- Favorites & blocking
- Reporting system
- KYC verification

### Phase 5 - Premium Features (Week 9-10)
- Subscription system
- Advanced filters
- AI chat suggestions
- Gamification

### Phase 6 - Polish & Launch (Week 11-12)
- Performance optimization
- Security hardening
- Testing
- Documentation
- Deployment

---

## 🔐 Security Considerations

1. **Authentication**
   - JWT tokens with expiry
   - Refresh token mechanism
   - Password hashing with bcrypt
   - Rate limiting on auth endpoints

2. **Data Privacy**
   - Hide exact addresses (show only city/locality)
   - Encrypt sensitive data
   - GDPR compliance
   - User consent management

3. **Payment Security**
   - PCI DSS compliance
   - Secure payment gateway integration
   - Transaction verification
   - Fraud detection

4. **User Safety**
   - Age verification (18+)
   - KYC verification
   - Police verification option
   - Report & block features
   - Content moderation

---

## 📱 Mobile App Considerations

1. **React Native** or **Flutter** for mobile apps
2. Push notifications via Firebase
3. Location tracking in background
4. Offline support
5. Camera integration for profile photos
6. In-app calling

---

## 🧪 Testing Requirements

1. Unit tests for utilities
2. Integration tests for APIs
3. E2E tests for critical flows
4. Load testing for scalability
5. Security testing
6. User acceptance testing

---

## 📊 Analytics & Monitoring

1. User engagement metrics
2. Conversion tracking
3. Error monitoring (Sentry)
4. Performance monitoring
5. Revenue analytics
6. User feedback collection

---

## 🎯 Key Differentiators from Dating Apps

1. **Purpose**: Social connection, not romantic
2. **Rewards**: Earn coins for meetups
3. **Transparency**: Show purpose (offering/seeking company)
4. **Variety**: Coffee, travel, movies, transit company
5. **Safety**: KYC + Police verification
6. **Quality**: Track meet quality scores

---

## Next Steps

1. Set up database and environment variables
2. Create remaining authentication pages
3. Build dashboard with stats
4. Implement real-time chat with Socket.io
5. Integrate payment gateways
6. Deploy to staging environment
7. Beta testing
8. Launch!


#############################################################

# MeetStreet - Social Connection Platform

A Next.js-based social connection platform where users earn coins/points for meeting others, traveling together, or providing company. **This is NOT a dating app** - it's designed for genuine social connections with a reward system.

## 🎯 Project Vision

MeetStreet reimagines urban social connections by rewarding people for spending time together. Whether it's coffee meetups, travel companionship, movie buddies, or transit company, users can both offer and receive value through our coin system.

## ✨ Key Features

### User Features
- **Multi-Auth System**: Email, mobile (OTP), Google, Facebook login
- **Location-Based Discovery**: Find people nearby based on current location
- **AI-Powered Matching**: Smart compatibility scores based on interests, location, lifestyle
- **Coins System**: 
  - Earn welcome bonus (100 coins)
  - Referral rewards (50 coins per referral)
  - Get paid for meetups
  - Withdraw to Paytm/UPI/Bank (minimum 500 coins, 2% fee)
  - Deposit coins (no fee)
- **Meeting Types**: Coffee, movies, travel, transit company, online chat/video
- **Real-time Chat**: Text, voice, and video communication
- **Events & Meetups**: Create and join group events
- **Safety Features**: KYC verification, police verification, report/block users
- **Subscription Tiers**: Free, Regular, Premium with different limits
- **Gamification**: Achievements, challenges, rewards, quality scores

### Technical Features
- **Next.js 14**: Latest React framework
- **MongoDB**: Flexible NoSQL database
- **JWT Authentication**: Secure token-based auth
- **Socket.io**: Real-time messaging and notifications
- **Geospatial Queries**: MongoDB 2dsphere indexes for location
- **AI Matching Algorithm**: Custom compatibility scoring
- **Responsive Design**: Mobile-first Tailwind CSS
- **API-First Architecture**: RESTful APIs

## 📁 Project Structure

```
meetstreet-app/
├── models/                 # MongoDB Schemas
│   ├── User.js            # User profiles, auth, coins
│   ├── Match.js           # Match requests & AI scores
│   ├── Meeting.js         # Meeting proposals & completions
│   ├── Transaction.js     # Financial transactions
│   ├── Message.js         # Chat messages
│   ├── Conversation.js    # Chat threads
│   ├── Event.js           # Group events
│   └── Report.js          # User reports
├── pages/
│   ├── api/               # API Routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── profile/       # Profile management
│   │   ├── search/        # User search & discovery
│   │   ├── match/         # Match system
│   │   ├── meeting/       # Meeting management
│   │   ├── coins/         # Wallet & transactions
│   │   └── [more APIs]
│   ├── login.js           # Login page
│   ├── register.js        # Multi-step registration
│   └── [more pages to create]
├── lib/
│   ├── mongodb.js         # Database connection
│   ├── auth.js            # JWT utilities
│   └── matchingAlgorithm.js  # AI matching logic
└── components/            # Reusable React components

```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB 6+
- Paytm/UPI credentials (for payments)
- Google/Facebook OAuth credentials
- Twilio account (for SMS)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd meetstreet-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/meetstreet
JWT_SECRET=your-super-secret-jwt-key-change-this
NEXT_PUBLIC_API_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Payment Gateway
PAYTM_MERCHANT_ID=your-paytm-merchant-id
PAYTM_MERCHANT_KEY=your-paytm-merchant-key

# File Upload
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# SMS/OTP
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone
```

4. **Run MongoDB**
```bash
mongod --dbpath /path/to/your/data
```

5. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📊 Database Schema

### User Model
- Authentication (email, mobile, social IDs)
- Profile (name, age, gender, interests, photos)
- Location (coordinates with 2dsphere index)
- Coins & wallet
- Subscription tier
- KYC & verification status
- Performance metrics

### Match Model
- Two users + initiator
- AI compatibility score
- Common interests
- Status (pending/accepted/declined)

### Meeting Model
- Participants
- Type (coffee, movie, travel, etc.)
- Location & schedule
- Coin exchange details
- Ratings & feedback

### Transaction Model
- User reference
- Type (deposit, withdrawal, meet payment)
- Amount & coins
- Payment details
- Platform fee (2% on withdrawal)

## 🔐 Security Features

1. **Authentication**
   - Bcrypt password hashing
   - JWT with 7-day expiry
   - Social OAuth integration
   - OTP verification for mobile

2. **Data Privacy**
   - Exact addresses hidden (only city/locality shown)
   - Sensitive fields excluded from public profiles
   - User blocking & reporting

3. **Age Verification**
   - Minimum 18 years required
   - Age declaration with terms acceptance

4. **KYC & Safety**
   - Document verification
   - Optional police verification
   - Report abusive behavior
   - Admin moderation

## 💰 Coins Economy

### Earning Coins
- Welcome bonus: 100 coins
- Referral: 50 coins per successful referral
- Complete meetings: Receive coins from other user

### Using Coins
- Offer coins for meetups
- Pay for premium features
- Transfer to other users

### Withdrawals
- Minimum: 500 coins
- Platform fee: 2%
- Methods: Paytm, UPI, Bank transfer
- Processing time: 24-48 hours

### Deposits
- No fees
- Instant credit
- Methods: Paytm, UPI, Cards

## 📱 Subscription Plans

### Free
- 10 profile searches/month
- Limited messaging
- Basic features

### Regular (₹299/month)
- 50 profile searches/month
- Enhanced messaging
- Priority support

### Premium (₹599/month)
- Unlimited searches
- Direct messaging
- SMS notifications
- Featured profile
- No ads

## 🎨 UI/UX Highlights

- **Modern Design**: Tailwind CSS with orange brand color
- **Responsive**: Mobile-first approach
- **Smooth Animations**: Framer Motion
- **Real-time Updates**: Socket.io integration
- **Map Integration**: Mapbox for location
- **Dark Mode**: Coming soon

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/social-login` - OAuth login
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP

### Profile
- `GET /api/profile` - Get own profile
- `GET /api/profile?userId=xyz` - Get user profile
- `PUT /api/profile/update` - Update profile
- `POST /api/profile/upload-photo` - Upload photo

### Search
- `POST /api/search/profiles` - Search users
- `GET /api/search/nearby` - Get nearby users
- `GET /api/search/suggestions` - AI suggestions

### Matching
- `POST /api/match/request` - Send match request
- `POST /api/match/respond` - Accept/decline match
- `GET /api/match/list` - Get matches

### Meetings
- `POST /api/meeting/create` - Propose meeting
- `POST /api/meeting/complete` - Complete & rate
- `GET /api/meeting/list` - Get meetings

### Wallet
- `POST /api/coins/deposit` - Deposit coins
- `POST /api/coins/withdraw` - Withdraw coins
- `GET /api/wallet/balance` - Get balance
- `GET /api/wallet/transactions` - Transaction history

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 🚢 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
- Use MongoDB Atlas for database
- Set up Vercel/AWS for hosting
- Configure CDN for media files
- Enable Redis for caching
- Set up monitoring (Sentry, DataDog)

## 🗺️ Roadmap

### Phase 1 (Weeks 1-2) ✅
- [x] Database models
- [x] Authentication system
- [x] Basic API routes
- [x] Login/Register pages

### Phase 2 (Weeks 3-4) 🔄
- [ ] Dashboard
- [ ] Profile pages
- [ ] Search & filters
- [ ] Match system UI

### Phase 3 (Weeks 5-6)
- [ ] Real-time chat
- [ ] Video/voice calls
- [ ] Meeting system
- [ ] Coins & wallet

### Phase 4 (Weeks 7-8)
- [ ] Events system
- [ ] Notifications
- [ ] Admin panel
- [ ] KYC verification

### Phase 5 (Weeks 9-10)
- [ ] Mobile apps (React Native)
- [ ] Advanced AI matching
- [ ] Gamification
- [ ] Analytics

### Phase 6 (Weeks 11-12)
- [ ] Beta testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Launch! 🚀

## 📄 License

Proprietary - All rights reserved

## 👥 Team

- **Founder/Developer**: [Your Name]
- **Contact**: hello@meetstreet.com

## 🤝 Contributing

This is a proprietary project. Contact the team for collaboration opportunities.

## 📞 Support

- **Email**: support@meetstreet.com
- **Phone**: +91-XXXX-XXXXXX
- **Website**: https://meetstreet.com

---

**Remember**: MeetStreet is about genuine connections, not dating. We're building a community where people value each other's time and company. 🧡