# Quick Setup Guide for MeetStreet

## Prerequisites Installation

### 1. Install Node.js
```bash
# Download from https://nodejs.org/ (v18 or higher)
# Or use nvm:
nvm install 18
nvm use 18
```

### 2. Install MongoDB
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0

# Ubuntu
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# Windows
# Download installer from https://www.mongodb.com/try/download/community
```

## Project Setup

### Step 1: Clone and Install
```bash
# Create project directory
mkdir meetstreet-app
cd meetstreet-app

# Initialize npm (if package.json doesn't exist)
npm init -y

# Install dependencies
npm install next@14 react@18 react-dom@18 mongoose bcryptjs jsonwebtoken axios

# Install dev dependencies
npm install -D tailwindcss postcss autoprefixer eslint eslint-config-next

# Initialize Tailwind CSS
npx tailwindcss init -p
```

### Step 2: Configure Environment
```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local with your credentials
nano .env.local  # or use your preferred editor
```

### Step 3: Configure Tailwind
Create or update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-orange': '#FF6B35',
      },
    },
  },
  plugins: [],
}
```

Create `styles/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}
```

### Step 4: Create Next.js Config
Create `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com', 'graph.facebook.com'],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
  },
}

module.exports = nextConfig
```

### Step 5: Update package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## Getting API Keys

### Google OAuth Setup
1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to .env.local

### Facebook OAuth Setup
1. Go to https://developers.facebook.com/
2. Create new app
3. Add "Facebook Login" product
4. Settings → Basic → Copy App ID and App Secret
5. Valid OAuth Redirect URIs: `http://localhost:3000/api/auth/callback/facebook`

### Paytm Setup
1. Register at https://business.paytm.com/
2. Complete KYC
3. Get Merchant ID and Merchant Key from dashboard
4. Use staging credentials for testing

### Cloudinary Setup
1. Sign up at https://cloudinary.com/
2. Dashboard → Copy Cloud Name, API Key, and API Secret
3. Free tier: 25GB storage, 25GB bandwidth

### Twilio Setup
1. Sign up at https://www.twilio.com/
2. Get phone number
3. Dashboard → Copy Account SID and Auth Token
4. Free trial: $15 credit

## Run the Application

### Development Mode
```bash
npm run dev
```
Visit: http://localhost:3000

### Production Mode
```bash
npm run build
npm start
```

## Database Setup

### Create Indexes
Run in MongoDB shell:
```javascript
use meetstreet

// User location index
db.users.createIndex({ "address.coordinates": "2dsphere" })

// Common query indexes
db.users.createIndex({ email: 1 })
db.users.createIndex({ mobile: 1 })
db.users.createIndex({ referralCode: 1 })
db.users.createIndex({ "address.city": 1, "address.locality": 1 })

// Match indexes
db.matches.createIndex({ user1: 1, user2: 1 }, { unique: true })
db.matches.createIndex({ aiMatchScore: -1 })

// Transaction indexes
db.transactions.createIndex({ user: 1, createdAt: -1 })
db.transactions.createIndex({ paymentId: 1 })

// Message indexes
db.messages.createIndex({ conversation: 1, createdAt: -1 })

// Event location index
db.events.createIndex({ "location.coordinates": "2dsphere" })
```

### Seed Data (Optional)
Create `scripts/seed.js`:
```javascript
const mongoose = require('mongoose');
const User = require('../models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Create test users
  const users = await User.create([
    {
      email: 'john@example.com',
      password: '$2a$10$...', // bcrypt hash of 'password123'
      profileName: 'John Doe',
      age: 25,
      gender: 'male',
      purposeOnApp: 'both',
      ageRange: '18-25',
      coins: 100,
      address: {
        city: 'Mumbai',
        locality: 'Bandra',
        coordinates: {
          type: 'Point',
          coordinates: [72.8347, 19.0596]
        }
      }
    },
    // Add more test users...
  ]);
  
  console.log('Seed completed!');
  process.exit(0);
}

seed();
```

Run: `node scripts/seed.js`

## Testing the Setup

### 1. Check Database Connection
Create `test/db-test.js`:
```javascript
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });
```

Run: `node test/db-test.js`

### 2. Test Registration API
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "profileName": "Test User",
    "age": 25,
    "gender": "male",
    "purposeOnApp": "both"
  }'
```

### 3. Test Login API
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Common Issues & Solutions

### Issue: MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongosh
# Or
mongo

# Start MongoDB service
# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod

# Windows:
net start MongoDB
```

### Issue: Port 3000 Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Issue: Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: JWT Secret Missing
```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env.local
JWT_SECRET=<generated-secret>
```

## Next Steps

1. ✅ Verify all services are running
2. ✅ Test registration and login
3. 📝 Complete remaining pages (see PROJECT_DOCUMENTATION.md)
4. 🎨 Customize branding and colors
5. 🧪 Write tests
6. 🚀 Deploy to staging

## Helpful Commands

```bash
# View MongoDB data
mongosh meetstreet
db.users.find().pretty()
db.transactions.find().pretty()

# View logs
tail -f /var/log/mongodb/mongod.log

# Check Node.js version
node --version

# Check npm version
npm --version

# Update dependencies
npm update

# Clear Next.js cache
rm -rf .next
```

## Getting Help

- 📖 Documentation: See PROJECT_DOCUMENTATION.md
- 💬 Issues: Create GitHub issue
- 📧 Email: support@meetstreet.com

Happy coding! 🚀